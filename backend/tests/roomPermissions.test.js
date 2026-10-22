import assert from 'node:assert/strict';
import test from 'node:test';

import {
  getRoomPermissions,
  hasRoomPermission,
  isRoomRole,
  ROOM_PERMISSIONS,
  ROOM_ROLES,
} from '../src/services/roomPermissions.js';

test('recognizes the three supported room roles', () => {
  assert.equal(isRoomRole(ROOM_ROLES.OWNER), true);
  assert.equal(isRoomRole(ROOM_ROLES.EDITOR), true);
  assert.equal(isRoomRole(ROOM_ROLES.VIEWER), true);

  assert.equal(isRoomRole('admin'), false);
  assert.equal(isRoomRole(''), false);
  assert.equal(isRoomRole(null), false);
  assert.equal(isRoomRole(undefined), false);
});

test('owner has all defined permissions', () => {
  const permissions = Object.values(ROOM_PERMISSIONS);

  for (const permission of permissions) {
    assert.equal(
      hasRoomPermission(ROOM_ROLES.OWNER, permission),
      true,
      `Owner should have ${permission}`,
    );
  }

  assert.deepEqual(
    getRoomPermissions(ROOM_ROLES.OWNER),
    permissions,
  );
});

test('editor can read, edit and run code', () => {
  assert.equal(
    hasRoomPermission(ROOM_ROLES.EDITOR, ROOM_PERMISSIONS.READ),
    true,
  );

  assert.equal(
    hasRoomPermission(ROOM_ROLES.EDITOR, ROOM_PERMISSIONS.EDIT),
    true,
  );

  assert.equal(
    hasRoomPermission(ROOM_ROLES.EDITOR, ROOM_PERMISSIONS.RUN),
    true,
  );
});

test('editor cannot manage members or close the room', () => {
  assert.equal(
    hasRoomPermission(
      ROOM_ROLES.EDITOR,
      ROOM_PERMISSIONS.MANAGE_MEMBERS,
    ),
    false,
  );

  assert.equal(
    hasRoomPermission(
      ROOM_ROLES.EDITOR,
      ROOM_PERMISSIONS.CLOSE_ROOM,
    ),
    false,
  );
});

test('viewer has read-only permission', () => {
  assert.equal(
    hasRoomPermission(ROOM_ROLES.VIEWER, ROOM_PERMISSIONS.READ),
    true,
  );

  assert.equal(
    hasRoomPermission(ROOM_ROLES.VIEWER, ROOM_PERMISSIONS.EDIT),
    false,
  );

  assert.equal(
    hasRoomPermission(ROOM_ROLES.VIEWER, ROOM_PERMISSIONS.RUN),
    false,
  );

  assert.equal(
    hasRoomPermission(
      ROOM_ROLES.VIEWER,
      ROOM_PERMISSIONS.MANAGE_MEMBERS,
    ),
    false,
  );

  assert.equal(
    hasRoomPermission(
      ROOM_ROLES.VIEWER,
      ROOM_PERMISSIONS.CLOSE_ROOM,
    ),
    false,
  );
});

test('unknown roles and permissions are denied', () => {
  assert.equal(
    hasRoomPermission('administrator', ROOM_PERMISSIONS.READ),
    false,
  );

  assert.equal(
    hasRoomPermission(ROOM_ROLES.OWNER, 'database:drop'),
    false,
  );

  assert.equal(
    hasRoomPermission(null, ROOM_PERMISSIONS.READ),
    false,
  );

  assert.equal(
    hasRoomPermission(ROOM_ROLES.OWNER, null),
    false,
  );
});

test('permission lists are returned as independent copies', () => {
  const permissions = getRoomPermissions(ROOM_ROLES.VIEWER);

  permissions.push(ROOM_PERMISSIONS.EDIT);

  assert.deepEqual(
    getRoomPermissions(ROOM_ROLES.VIEWER),
    [ROOM_PERMISSIONS.READ],
  );

  assert.deepEqual(getRoomPermissions('unknown-role'), []);
});