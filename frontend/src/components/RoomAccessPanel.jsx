import { useState } from 'react';
import './RoomAccessPanel.css';

const SESSION_KEY = 'collab-code-editor.guest-session';

function readSession() {
  try {
    const value = sessionStorage.getItem(SESSION_KEY);
    return value ? JSON.parse(value) : null;
  } catch {
    return null;
  }
}

function readInviteFromHash() {
  const params = new URLSearchParams(
    window.location.hash.replace(/^#/, ''),
  );

  const roomId = params.get('roomId');
  const inviteCode = params.get('inviteCode');

  return roomId && inviteCode ? { roomId, inviteCode } : null;
}

async function requestJson(path, { method = 'GET', body, token } = {}) {
  const headers = {};

  if (body !== undefined) {
    headers['Content-Type'] = 'application/json';
  }

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(path, {
    method,
    headers,
    ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
  });

  let data = {};

  try {
    data = await response.json();
  } catch {
    // Keep the status-code error below useful even if the response
    // is not JSON.
  }

  if (!response.ok) {
    const error = new Error(
      data?.error?.message || `Request failed (${response.status}).`,
    );
    error.status = response.status;
    throw error;
  }

  return data;
}

export default function RoomAccessPanel({ onRoomReady }) {
  const [storedSession] = useState(readSession);

  const [displayName, setDisplayName] = useState(
    storedSession?.identity?.displayName || '',
  );
  const [sessionToken, setSessionToken] = useState(
    storedSession?.sessionToken || '',
  );
  const [roomTitle, setRoomTitle] = useState('My coding room');
  const [room, setRoom] = useState(null);
  const [currentRole, setCurrentRole] = useState(null);
  const [inviteRole, setInviteRole] = useState('viewer');
  const [shareUrl, setShareUrl] = useState('');
  const [incomingInvite, setIncomingInvite] = useState(
    readInviteFromHash,
  );
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');

  async function createGuestSession() {
    const name = displayName.trim();

    if (!name || Array.from(name).length > 32) {
      throw new Error('Enter a display name between 1 and 32 characters.');
    }

    const data = await requestJson('/api/guests', {
      method: 'POST',
      body: { displayName: name },
    });

    const nextSession = {
      identity: data.identity,
      sessionToken: data.sessionToken,
      expiresAt: data.expiresAt,
    };

    // Keep the temporary guest session in this browser tab only.
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(nextSession));
    setSessionToken(data.sessionToken);
    setDisplayName(data.identity.displayName);

    return data.sessionToken;
  }

  async function requestAsGuest(path, options = {}) {
    let token = sessionToken || readSession()?.sessionToken;

    if (!token) {
      token = await createGuestSession();
    }

    try {
      return await requestJson(path, { ...options, token });
    } catch (error) {
      // A backend restart clears its in-memory guest sessions.
      // Create a fresh guest and retry once after a 401.
      if (error.status !== 401) throw error;

      token = await createGuestSession();

      return requestJson(path, { ...options, token });
    }
  }

  async function handleCreateRoom(event) {
    event.preventDefault();
    setBusy(true);
    setMessage('');
    setShareUrl('');

    try {
      const data = await requestAsGuest('/api/rooms', {
        method: 'POST',
        body: { title: roomTitle.trim() },
      });

      setRoom(data.room);
      setCurrentRole('owner');
      setMessage('Room created. Generate an invitation to share it.');

      onRoomReady?.({
        room: data.room,
        membership: { role: 'owner' },
      });
    } catch (error) {
      setMessage(error.message);
    } finally {
      setBusy(false);
    }
  }

  async function handleGenerateInvite() {
    if (!room) return;

    setBusy(true);
    setMessage('');
    setShareUrl('');

    try {
      const data = await requestAsGuest(
        `/api/rooms/${encodeURIComponent(room.id)}/invites`,
        {
          method: 'POST',
          body: { role: inviteRole },
        },
      );

      const url = new URL(window.location.href);

      // Store the invitation in the URL fragment, not the query string.
      url.hash = new URLSearchParams({
        roomId: room.id,
        inviteCode: data.inviteCode,
      }).toString();

      setShareUrl(url.toString());
      setMessage(
        `Invitation created. It expires ${new Date(
          data.expiresAt,
        ).toLocaleString()} and allows up to ${data.maxUses} uses.`,
      );
    } catch (error) {
      setMessage(error.message);
    } finally {
      setBusy(false);
    }
  }

  async function handleJoinRoom() {
    if (!incomingInvite) return;

    setBusy(true);
    setMessage('');

    try {
      const data = await requestAsGuest(
        `/api/rooms/${encodeURIComponent(incomingInvite.roomId)}/join`,
        {
          method: 'POST',
          body: { inviteCode: incomingInvite.inviteCode },
        },
      );

      setRoom(data.room);
      setCurrentRole(data.membership.role);
      setShareUrl('');
      setIncomingInvite(null);

      // Remove the invitation code from the browser address after
      // redemption. Do not log it or send it to analytics.
      window.history.replaceState(
        null,
        document.title,
        `${window.location.pathname}${window.location.search}`,
      );

      setMessage(
        `Joined "${data.room.title}" as ${data.membership.role}.`,
      );

      onRoomReady?.({
        room: data.room,
        membership: data.membership,
      });
    } catch (error) {
      setMessage(error.message);
    } finally {
      setBusy(false);
    }
  }

  async function handleCopyLink() {
    if (!shareUrl) return;

    try {
      await navigator.clipboard.writeText(shareUrl);
      setMessage('Invitation link copied.');
    } catch {
      setMessage(
        'Copy the full invitation link from the field below.',
      );
    }
  }

  return (
    <section className="room-access-panel" aria-label="Room access">
      <h2>Room access</h2>

      <label className="room-access-field">
        Guest display name
        <input
          value={displayName}
          onChange={(event) => setDisplayName(event.target.value)}
          maxLength={32}
          autoComplete="nickname"
          placeholder="Enter your display name"
        />
      </label>

      {incomingInvite && (
        <div className="room-invite-notice">
          <p>You opened an invitation to join a room.</p>
          <p className="room-access-muted">
            Room ID: {incomingInvite.roomId}
          </p>
          <button
            type="button"
            onClick={handleJoinRoom}
            disabled={busy}
          >
            {busy ? 'Joining…' : 'Join room'}
          </button>
        </div>
      )}

      <form onSubmit={handleCreateRoom} className="room-create-form">
        <label className="room-access-field">
          New room title
          <input
            value={roomTitle}
            onChange={(event) => setRoomTitle(event.target.value)}
            maxLength={80}
            required
            placeholder="e.g. Java practice"
          />
        </label>

        <button type="submit" disabled={busy}>
          {busy ? 'Please wait…' : 'Create room'}
        </button>
      </form>

      {room && (
        <div className="room-access-details">
          <h3>{room.title}</h3>
          <p className="room-access-muted">Room ID: {room.id}</p>
          <p>Your role: {currentRole}</p>

          {currentRole === 'owner' && (
            <>
              <label className="room-access-field">
                Invite role
                <select
                  value={inviteRole}
                  onChange={(event) => setInviteRole(event.target.value)}
                  disabled={busy}
                >
                  <option value="viewer">Viewer — can read</option>
                  <option value="editor">Editor — can edit and run</option>
                </select>
              </label>

              <button
                type="button"
                onClick={handleGenerateInvite}
                disabled={busy}
              >
                Generate invitation link
              </button>

              {shareUrl && (
                <div className="room-share-link">
                  <label className="room-access-field">
                    Shareable invitation link
                    <input
                      value={shareUrl}
                      readOnly
                      onFocus={(event) => event.target.select()}
                    />
                  </label>

                  <button type="button" onClick={handleCopyLink}>
                    Copy link
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      )}

      <p className="room-access-message" role="status">
        {message}
      </p>
    </section>
  );
}