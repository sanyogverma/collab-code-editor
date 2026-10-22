import assert from 'node:assert/strict';
import test from 'node:test';

import {
  closeRoom,
  createRoomRecord,
  getRoomById,
  ROOM_STATUS,
} from '../src/services/roomStore.js';

const UUID_V4_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

test('creates a room with the required fields', () => {
  const room = createRoomRecord({
    title: '  DSA Practice  ',
    ownerId: 'guest-test-1',
  });

  assert.match(room.id, UUID_V4_PATTERN);
  assert.equal(room.title, 'DSA Practice');
  assert.equal(room.ownerId, 'guest-test-1');
  assert.equal(room.status, ROOM_STATUS.ACTIVE);

  assert.ok(Number.isFinite(Date.parse(room.createdAt)));
  assert.equal(room.createdAt, new Date(room.createdAt).toISOString());

  assert.deepEqual(getRoomById(room.id), room);
});

test('generates different IDs for different rooms', () => {
  const firstRoom = createRoomRecord({
    title: 'First Room',
    ownerId: 'guest-test-2',
  });

  const secondRoom = createRoomRecord({
    title: 'Second Room',
    ownerId: 'guest-test-2',
  });

  assert.notEqual(firstRoom.id, secondRoom.id);
});

test('rejects blank titles and owner identifiers', () => {
  assert.throws(
    () => createRoomRecord({
      title: '   ',
      ownerId: 'guest-test-3',
    }),
    /title must be a non-empty string/i,
  );

  assert.throws(
    () => createRoomRecord({
      title: 'Valid Room',
      ownerId: '   ',
    }),
    /ownerId must be a non-empty string/i,
  );
});

test('returns null for a nonexistent room', () => {
  assert.equal(getRoomById('room-that-does-not-exist'), null);
  assert.equal(closeRoom('room-that-does-not-exist'), null);
});

test('closes a room without changing its original creation data', () => {
  const room = createRoomRecord({
    title: 'Closing Test',
    ownerId: 'guest-test-4',
  });

  const closedRoom = closeRoom(room.id);

  assert.equal(closedRoom.status, ROOM_STATUS.CLOSED);
  assert.equal(closedRoom.id, room.id);
  assert.equal(closedRoom.title, room.title);
  assert.equal(closedRoom.ownerId, room.ownerId);
  assert.equal(closedRoom.createdAt, room.createdAt);

  assert.equal(getRoomById(room.id).status, ROOM_STATUS.CLOSED);

  // Closing an already-closed room is idempotent.
  assert.deepEqual(closeRoom(room.id), closedRoom);
});

test('returned room objects cannot mutate stored records directly', () => {
  const room = createRoomRecord({
    title: 'Immutable Copy Test',
    ownerId: 'guest-test-5',
  });

  room.title = 'Unexpected Title';

  assert.equal(getRoomById(room.id).title, 'Immutable Copy Test');
});