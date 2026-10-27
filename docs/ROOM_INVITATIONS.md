# Room Invitations

## Purpose

Room IDs identify rooms but do not grant access. A guest must have a room
membership to read protected room metadata. New guests join through an
invitation code.

## Invitation policy

- Only a room member with the `members:manage` permission can create invites.
- The owner can create invitations with either the `editor` or `viewer` role.
- Owner-role invitations are not supported.
- Invitation codes are generated with cryptographically secure randomness.
- The service stores a SHA-256 hash, not the raw invitation code.
- Invitations expire after 7 days and allow at most 20 successful redemptions.
- Invalid, expired, exhausted, or room-mismatched invitations receive a safe
  `404 INVITE_NOT_FOUND` response.
- Invitation records are held in memory and disappear when the backend restarts.

## API contracts

### Create an invitation

`POST /api/rooms/:roomId/invites`

Authentication: guest session token in the Bearer authorization header.

Request:

    { "role": "editor" }

The role can be `editor` or `viewer`.

Success: `201 Created`

    {
      "inviteCode": "<opaque invite code>",
      "roomId": "<room ID>",
      "role": "editor",
      "expiresAt": "<ISO timestamp>",
      "maxUses": 20
    }

The raw invitation code is returned only at creation. Do not write it to logs
or analytics.

### Join a room

`POST /api/rooms/:roomId/join`

Authentication: guest session token in the Bearer authorization header.

Request:

    { "inviteCode": "<opaque invite code>" }

Success: `201 Created` for a new membership. An existing member retrying the
request receives `200 OK`.

The response includes the room and the resulting membership.

## Security notes

- Knowing a room ID is not permission to access that room.
- Invitation URLs contain the code in the URL fragment, not the query string.
- The UI removes the fragment after successful redemption.
- Never log session tokens, invitation codes, or complete invitation URLs.
- This is a temporary guest-identity MVP, not production-grade authentication.
- Because invitations and memberships are stored in memory, this implementation
  is for local development and demonstration. Persistent storage and a durable
  invitation-revocation model are future work.