import assert from 'node:assert/strict';
import test from 'node:test';
import { randomUUID } from 'node:crypto';

import { authorizeRoomAccess } from '../src/services/roomAuthorization.js';
import { addRoomMembership } from '../src/services/roomMembershipStore.js';
import { createRoomRecord } from '../src/services/roomStore.js';

import {
  ROOM_PERMISSIONS,
  ROOM_ROLES,
} from '../src/services/roomPermissions.js';

function createRoomWithOwner() {
  const ownerId = randomUUID();

  const room = createRoomRecord({
    title: 'Authorization Test',
    ownerId,
  });

  addRoomMembership({
    roomId: room.id,
    userId: ownerId,
    role: ROOM_ROLES.OWNER,
  });

  return { room, ownerId };
}

function addMember(roomId, userId, role) {
  return addRoomMembership({ roomId, userId, role });
}

test('owner is authorized for all defined permissions', () => {
  const { room, ownerId } = createRoomWithOwner();

  for (const permission of Object.values(ROOM_PERMISSIONS)) {
    const result = authorizeRoomAccess({
      roomId: room.id,
      userId: ownerId,
      permission,
    });

    assert.equal(result.allowed, true, permission);
    assert.equal(result.membership.role, ROOM_ROLES.OWNER);
  }
});

test('editor can read, edit and run code', () => {
  const { room } = createRoomWithOwner();
  const editorId = randomUUID();

  addMember(room.id, editorId, ROOM_ROLES.EDITOR);

  for (const permission of [
    ROOM_PERMISSIONS.READ,
    ROOM_PERMISSIONS.EDIT,
    ROOM_PERMISSIONS.RUN,
  ]) {
    const result = authorizeRoomAccess({
      roomId: room.id,
      userId: editorId,
      permission,
    });

    assert.equal(result.allowed, true, permission);
    assert.equal(result.membership.role, ROOM_ROLES.EDITOR);
  }
});

test('editor cannot manage members or close the room', () => {
  const { room } = createRoomWithOwner();
  const editorId = randomUUID();

  addMember(room.id, editorId, ROOM_ROLES.EDITOR);

  for (const permission of [
    ROOM_PERMISSIONS.MANAGE_MEMBERS,
    ROOM_PERMISSIONS.CLOSE_ROOM,
  ]) {
    const result = authorizeRoomAccess({
      roomId: room.id,
      userId: editorId,
      permission,
    });

    assert.equal(result.allowed, false);
    assert.equal(result.status, 403);
    assert.equal(result.error.code, 'FORBIDDEN');
  }
});

test('viewer can read but cannot edit, run, manage or close', () => {
  const { room } = createRoomWithOwner();
  const viewerId = randomUUID();

  addMember(room.id, viewerId, ROOM_ROLES.VIEWER);

  const readResult = authorizeRoomAccess({
    roomId: room.id,
    userId: viewerId,
    permission: ROOM_PERMISSIONS.READ,
  });

  assert.equal(readResult.allowed, true);

  for (const permission of [
    ROOM_PERMISSIONS.EDIT,
    ROOM_PERMISSIONS.RUN,
    ROOM_PERMISSIONS.MANAGE_MEMBERS,
    ROOM_PERMISSIONS.CLOSE_ROOM,
  ]) {
    const result = authorizeRoomAccess({
      roomId: room.id,
      userId: viewerId,
      permission,
    });

    assert.equal(result.allowed, false, permission);
    assert.equal(result.status, 403);
  }
});

test('a guest without room membership receives a masked 404', () => {
  const { room } = createRoomWithOwner();

  const result = authorizeRoomAccess({
    roomId: room.id,
    userId: randomUUID(),
    permission: ROOM_PERMISSIONS.READ,
  });

  assert.equal(result.allowed, false);
  assert.equal(result.status, 404);
  assert.equal(result.error.code, 'ROOM_NOT_FOUND');
});

test('unknown rooms and missing identities are denied', () => {
  const unknownRoom = authorizeRoomAccess({
    roomId: randomUUID(),
    userId: randomUUID(),
    permission: ROOM_PERMISSIONS.READ,
  });

  assert.equal(unknownRoom.allowed, false);
  assert.equal(unknownRoom.status, 404);

  const unauthenticated = authorizeRoomAccess({
    roomId: randomUUID(),
    userId: '',
    permission: ROOM_PERMISSIONS.READ,
  });

  assert.equal(unauthenticated.allowed, false);
  assert.equal(unauthenticated.status, 401);
});

test('invalid roles and duplicate memberships are rejected', () => {
  const { room, ownerId } = createRoomWithOwner();

  assert.throws(
    () => addMember(room.id, randomUUID(), 'administrator'),
    /valid room role/i,
  );

  assert.throws(
    () => addMember(room.id, ownerId, ROOM_ROLES.OWNER),
    /already has room membership/i,
  );
});

test('a non-owner cannot receive the owner role', () => {
  const { room } = createRoomWithOwner();

  assert.throws(
    () => addMember(room.id, randomUUID(), ROOM_ROLES.OWNER),
    /only the room owner/i,
  );
});