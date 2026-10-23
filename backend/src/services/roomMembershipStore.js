import { getRoomById } from './roomStore.js';
import {
  isRoomRole,
  ROOM_ROLES,
} from './roomPermissions.js';

const membershipsByRoomId = new Map();

function requireNonEmptyString(value, fieldName) {
  if (typeof value !== 'string' || value.trim().length === 0) {
    throw new TypeError(`${fieldName} must be a non-empty string.`);
  }

  return value.trim();
}

/**
 * Adds a membership to an existing room.
 *
 * This is an internal server-side service. Do not expose it directly
 * through an unauthenticated HTTP endpoint.
 */
export function addRoomMembership({ roomId, userId, role }) {
  const normalizedRoomId = requireNonEmptyString(roomId, 'roomId');
  const normalizedUserId = requireNonEmptyString(userId, 'userId');

  const room = getRoomById(normalizedRoomId);

  if (!room) {
    throw new Error('Cannot add membership to an unknown room.');
  }

  if (!isRoomRole(role)) {
    throw new TypeError('A valid room role is required.');
  }

  // Ownership is fixed by the room record in this MVP.
  if (
    role === ROOM_ROLES.OWNER &&
    room.ownerId !== normalizedUserId
  ) {
    throw new Error('Only the room owner may hold the owner role.');
  }

  if (
    room.ownerId === normalizedUserId &&
    role !== ROOM_ROLES.OWNER
  ) {
    throw new Error('The room owner must retain the owner role.');
  }

  let members = membershipsByRoomId.get(normalizedRoomId);

  if (!members) {
    members = new Map();
    membershipsByRoomId.set(normalizedRoomId, members);
  }

  if (members.has(normalizedUserId)) {
    throw new Error('This guest already has room membership.');
  }

  const membership = {
    roomId: normalizedRoomId,
    userId: normalizedUserId,
    role,
    joinedAt: new Date().toISOString(),
  };

  members.set(normalizedUserId, membership);

  // Do not return the mutable object held by the store.
  return { ...membership };
}

/**
 * Returns a membership copy, or null if it does not exist.
 */
export function getRoomMembership(roomId, userId) {
  if (
    typeof roomId !== 'string' ||
    typeof userId !== 'string'
  ) {
    return null;
  }

  const members = membershipsByRoomId.get(roomId);
  const membership = members?.get(userId);

  return membership ? { ...membership } : null;
}