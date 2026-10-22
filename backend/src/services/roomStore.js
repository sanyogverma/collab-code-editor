import { randomUUID } from 'node:crypto';

const rooms = new Map();

export const ROOM_STATUS = Object.freeze({
  ACTIVE: 'active',
  CLOSED: 'closed',
});

function requireNonEmptyString(value, fieldName) {
  if (typeof value !== 'string' || value.trim().length === 0) {
    throw new TypeError(`${fieldName} must be a non-empty string.`);
  }

  return value.trim();
}

/**
 * Creates and stores a room record.
 *
 * ownerId represents an identifier supplied by the trusted identity
 * layer. The API must not blindly trust an ownerId supplied by a client.
 */
export function createRoomRecord({ title, ownerId }) {
  const room = {
    id: randomUUID(),
    title: requireNonEmptyString(title, 'title'),
    ownerId: requireNonEmptyString(ownerId, 'ownerId'),
    createdAt: new Date().toISOString(),
    status: ROOM_STATUS.ACTIVE,
  };

  rooms.set(room.id, room);

  // Return a copy so callers cannot mutate the stored record directly.
  return { ...room };
}

/**
 * Retrieves a room by its ID.
 * Returns null if the room does not exist.
 */
export function getRoomById(roomId) {
  if (typeof roomId !== 'string') {
    return null;
  }

  const room = rooms.get(roomId);

  return room ? { ...room } : null;
}

/**
 * Marks an existing room as closed.
 * Repeated close operations are safe and do not reopen the room.
 */
export function closeRoom(roomId) {
  const existingRoom = getRoomById(roomId);

  if (!existingRoom) {
    return null;
  }

  if (existingRoom.status === ROOM_STATUS.CLOSED) {
    return existingRoom;
  }

  const closedRoom = {
    ...existingRoom,
    status: ROOM_STATUS.CLOSED,
  };

  rooms.set(roomId, closedRoom);

  return { ...closedRoom };
}