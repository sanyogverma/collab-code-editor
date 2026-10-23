import { Router } from 'express';

import { requireGuest } from '../middleware/requireGuest.js';
import { requireRoomPermission } from '../middleware/requireRoomPermission.js';

import { addRoomMembership } from '../services/roomMembershipStore.js';

import {
  createRoomRecord,
} from '../services/roomStore.js';

import {
  ROOM_PERMISSIONS,
  ROOM_ROLES,
} from '../services/roomPermissions.js';

const router = Router();

const MAX_ROOM_TITLE_LENGTH = 80;

function validateRoomTitle(value) {
  if (typeof value !== 'string') {
    throw new TypeError('title must be a string.');
  }

  const title = value.trim();
  const characterCount = Array.from(title).length;

  if (characterCount < 1) {
    throw new TypeError('title must not be empty.');
  }

  if (characterCount > MAX_ROOM_TITLE_LENGTH) {
    throw new TypeError(
      `title must not exceed ${MAX_ROOM_TITLE_LENGTH} characters.`,
    );
  }

  if (/[\u0000-\u001F\u007F]/u.test(title)) {
    throw new TypeError(
      'title must not contain control characters.',
    );
  }

  return title;
}

// Create a room and register its creator as the owner.
router.post('/', requireGuest, (req, res) => {
  if (
    !req.body ||
    typeof req.body !== 'object' ||
    Array.isArray(req.body)
  ) {
    return res.status(400).json({
      error: {
        code: 'VALIDATION_ERROR',
        message: 'The request body must be a JSON object.',
      },
    });
  }

  try {
    const title = validateRoomTitle(req.body.title);

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
  } catch (error) {
    if (error instanceof TypeError) {
      return res.status(400).json({
        error: {
          code: 'VALIDATION_ERROR',
          message: error.message,
        },
      });
    }

    return res.status(500).json({
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'The room could not be created.',
      },
    });
  }
});

// Retrieve metadata only if the authenticated guest is a room member
// with the READ permission.
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