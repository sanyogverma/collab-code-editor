import { Router } from 'express';

import { requireGuest } from '../middleware/requireGuest.js';
import { requireRoomPermission } from '../middleware/requireRoomPermission.js';

import {
  addRoomMembership,
  getRoomMembership,
} from '../services/roomMembershipStore.js';

import {
  createRoomRecord,
  getRoomById,
} from '../services/roomStore.js';

import {
  ROOM_PERMISSIONS,
  ROOM_ROLES,
} from '../services/roomPermissions.js';

import {
  createRoomInvite,
  redeemRoomInvite,
} from '../services/roomInviteStore.js';

const router = Router({ mergeParams: true });

// Create a room and register its creator as the owner.
router.post('/', requireGuest, (req, res) => {
  const title =
    typeof req.body?.title === 'string'
      ? req.body.title.trim()
      : '';

  if (!title || title.length > 80) {
    return res.status(400).json({
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Room title must contain 1–80 characters.',
      },
    });
  }

  const room = createRoomRecord({
    title,
    ownerId: req.guest.id,
  });

  addRoomMembership({
    roomId: room.id,
    userId: req.guest.id,
    role: ROOM_ROLES.OWNER,
  });

  return res.status(201).json({ room });
});

// Create an invitation. Only members with members:manage can do this.
router.post(
  '/invites',
  requireGuest,
  requireRoomPermission(ROOM_PERMISSIONS.MANAGE_MEMBERS),
  (req, res) => {
    if (req.room.status !== 'active') {
      return res.status(409).json({
        error: {
          code: 'ROOM_NOT_ACTIVE',
          message: 'Invitations cannot be created for this room.',
        },
      });
    }

    const { role } = req.body ?? {};

    if (
      role !== ROOM_ROLES.EDITOR &&
      role !== ROOM_ROLES.VIEWER
    ) {
      return res.status(400).json({
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invite role must be editor or viewer.',
        },
      });
    }

    const invite = createRoomInvite({
      roomId: req.room.id,
      createdBy: req.guest.id,
      role,
    });

    // Return the raw code only when creating the invitation.
    // Never log this response or the invitation code.
    return res.status(201).json({
      inviteCode: invite.inviteCode,
      roomId: invite.roomId,
      role: invite.role,
      expiresAt: invite.expiresAt,
      maxUses: invite.maxUses,
    });
  },
);

// Join by redeeming an invitation. Room ID alone is insufficient.
router.post('/join', requireGuest, (req, res) => {
  const { roomId } = req.params;
  const existingMembership = getRoomMembership(
    roomId,
    req.guest.id,
  );
  const existingRoom = getRoomById(roomId);

  // A current member can safely retry the join request.
  if (existingMembership && existingRoom) {
    return res.status(200).json({
      room: existingRoom,
      membership: existingMembership,
      alreadyMember: true,
    });
  }

  const { inviteCode } = req.body ?? {};

  const invite = redeemRoomInvite({
    roomId,
    inviteCode,
  });

  // Use the same safe response for an invalid code, wrong room,
  // expired invitation, or exhausted invitation.
  if (!invite) {
    return res.status(404).json({
      error: {
        code: 'INVITE_NOT_FOUND',
        message: 'This invitation is invalid or has expired.',
      },
    });
  }

  const room = getRoomById(roomId);

  if (!room || room.status !== 'active') {
    return res.status(404).json({
      error: {
        code: 'INVITE_NOT_FOUND',
        message: 'This invitation is invalid or has expired.',
      },
    });
  }

  const membership = addRoomMembership({
    roomId: room.id,
    userId: req.guest.id,
    role: invite.role,
  });

  return res.status(201).json({
    room,
    membership,
    alreadyMember: false,
  });
});

// Room metadata remains protected by Task 3.5 authorization.
router.get(
  '/:roomId',
  requireGuest,
  requireRoomPermission(ROOM_PERMISSIONS.READ),
  (req, res) => {
    return res.status(200).json({
      room: req.room,
    });
  },
);

export default router;