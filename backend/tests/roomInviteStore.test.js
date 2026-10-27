import test from 'node:test';
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';

import { createRoomRecord } from '../src/services/roomStore.js';
import {
  createRoomInvite,
  redeemRoomInvite,
  ROOM_INVITE_MAX_USES,
} from '../src/services/roomInviteStore.js';
import { ROOM_ROLES } from '../src/services/roomPermissions.js';

function createTestRoom() {
  return createRoomRecord({
    title: 'Invite test room',
    ownerId: randomUUID(),
  });
}

test('creates a high-entropy invitation and redeems it for the correct room', () => {
  const room = createTestRoom();

  const invite = createRoomInvite({
    roomId: room.id,
    createdBy: room.ownerId,
    role: ROOM_ROLES.EDITOR,
  });

  assert.match(invite.inviteCode, /^[A-Za-z0-9_-]{43}$/);
  assert.equal(invite.roomId, room.id);
  assert.equal(invite.role, ROOM_ROLES.EDITOR);
  assert.equal(invite.maxUses, ROOM_INVITE_MAX_USES);
  assert.ok(Date.parse(invite.expiresAt) > Date.now());

  assert.equal(
    redeemRoomInvite({
      roomId: randomUUID(),
      inviteCode: invite.inviteCode,
    }),
    null,
  );

  const redeemed = redeemRoomInvite({
    roomId: room.id,
    inviteCode: invite.inviteCode,
  });

  assert.equal(redeemed.role, ROOM_ROLES.EDITOR);
  assert.equal(redeemed.roomId, room.id);
});

test('does not allow owner-role invitations or malformed codes', () => {
  const room = createTestRoom();

  assert.throws(
    () =>
      createRoomInvite({
        roomId: room.id,
        createdBy: room.ownerId,
        role: ROOM_ROLES.OWNER,
      }),
    TypeError,
  );

  assert.equal(
    redeemRoomInvite({
      roomId: room.id,
      inviteCode: 'not-a-valid-invite',
    }),
    null,
  );
});

test('stops redeeming after the maximum number of uses', () => {
  const room = createTestRoom();

  const invite = createRoomInvite({
    roomId: room.id,
    createdBy: room.ownerId,
    role: ROOM_ROLES.VIEWER,
  });

  for (let use = 0; use < ROOM_INVITE_MAX_USES; use += 1) {
    assert.ok(
      redeemRoomInvite({
        roomId: room.id,
        inviteCode: invite.inviteCode,
      }),
    );
  }

  assert.equal(
    redeemRoomInvite({
      roomId: room.id,
      inviteCode: invite.inviteCode,
    }),
    null,
  );
});