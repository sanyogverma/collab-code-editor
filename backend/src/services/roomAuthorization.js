import { getRoomById } from './roomStore.js';
import { getRoomMembership } from './roomMembershipStore.js';
import { hasRoomPermission } from './roomPermissions.js';

function denied(status, code, message) {
  return {
    allowed: false,
    status,
    error: {
      code,
      message,
    },
  };
}

/**
 * Checks whether a known guest has the required permission for a room.
 *
 * The caller must provide the verified server-side identity ID,
 * not a user ID copied from the HTTP request body.
 */
export function authorizeRoomAccess({
  roomId,
  userId,
  permission,
}) {
  // Authenticate before looking up a room to avoid leaking room existence.
  if (typeof userId !== 'string' || userId.trim().length === 0) {
    return denied(
      401,
      'UNAUTHORIZED',
      'A valid guest session is required.',
    );
  }

  const room = getRoomById(roomId);

  if (!room) {
    return denied(
      404,
      'ROOM_NOT_FOUND',
      'Room not found.',
    );
  }

  const membership = getRoomMembership(room.id, userId);

  // Mask missing membership as 404 to avoid revealing protected room data.
  if (!membership) {
    return denied(
      404,
      'ROOM_NOT_FOUND',
      'Room not found.',
    );
  }

  if (!hasRoomPermission(membership.role, permission)) {
    return denied(
      403,
      'FORBIDDEN',
      'You do not have permission to perform this action.',
    );
  }

  return {
    allowed: true,
    room,
    membership,
  };
}