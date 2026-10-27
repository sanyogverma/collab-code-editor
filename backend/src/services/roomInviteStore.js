import { createHash, randomBytes } from 'node:crypto';
import { getRoomById } from './roomStore.js';
import { isRoomRole, ROOM_ROLES } from './roomPermissions.js';

export const ROOM_INVITE_TTL_MS = 7 * 24 * 60 * 60 * 1000;
export const ROOM_INVITE_MAX_USES = 20;

const invitesByHash = new Map();

function hashInviteCode(inviteCode) {
  return createHash('sha256')
    .update(inviteCode, 'utf8')
    .digest('hex');
}

function cleanupExpiredInvites() {
  const now = Date.now();

  for (const [hash, invite] of invitesByHash.entries()) {
    if (
      invite.expiresAtMs <= now ||
      invite.useCount >= invite.maxUses
    ) {
      invitesByHash.delete(hash);
    }
  }
}

export function createRoomInvite({ roomId, createdBy, role }) {
  cleanupExpiredInvites();

  if (typeof roomId !== 'string' || !roomId.trim()) {
    throw new TypeError('roomId is required.');
  }

  if (typeof createdBy !== 'string' || !createdBy.trim()) {
    throw new TypeError('createdBy is required.');
  }

  if (
    !isRoomRole(role) ||
    role === ROOM_ROLES.OWNER
  ) {
    throw new TypeError('Invite role must be editor or viewer.');
  }

  const room = getRoomById(roomId);

  if (!room || room.status !== 'active') {
    throw new Error('ROOM_NOT_FOUND');
  }

  // High-entropy, opaque invitation code.
  const inviteCode = randomBytes(32).toString('base64url');
  const now = Date.now();
  const expiresAtMs = now + ROOM_INVITE_TTL_MS;

  const invite = {
    roomId: room.id,
    createdBy: createdBy.trim(),
    role,
    createdAt: new Date(now).toISOString(),
    expiresAtMs,
    maxUses: ROOM_INVITE_MAX_USES,
    useCount: 0,
  };

  // Store only a hash, never the raw invitation code.
  invitesByHash.set(hashInviteCode(inviteCode), invite);

  return {
    inviteCode,
    roomId: invite.roomId,
    role: invite.role,
    createdAt: invite.createdAt,
    expiresAt: new Date(expiresAtMs).toISOString(),
    maxUses: invite.maxUses,
  };
}

export function redeemRoomInvite({ roomId, inviteCode }) {
  cleanupExpiredInvites();

  if (
    typeof roomId !== 'string' ||
    typeof inviteCode !== 'string' ||
    !/^[A-Za-z0-9_-]{43}$/.test(inviteCode)
  ) {
    return null;
  }

  const hash = hashInviteCode(inviteCode);
  const invite = invitesByHash.get(hash);

  if (!invite || invite.roomId !== roomId) {
    return null;
  }

  const room = getRoomById(roomId);

  if (
    !room ||
    room.status !== 'active' ||
    invite.expiresAtMs <= Date.now() ||
    invite.useCount >= invite.maxUses
  ) {
    invitesByHash.delete(hash);
    return null;
  }

  // A successful redemption consumes one available use.
  invite.useCount += 1;

  return {
    roomId: invite.roomId,
    role: invite.role,
    createdBy: invite.createdBy,
    expiresAt: new Date(invite.expiresAtMs).toISOString(),
  };
}