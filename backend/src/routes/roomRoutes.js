import { Router } from 'express';

import { requireGuest } from '../middleware/requireGuest.js';
import {
  createRoomRecord,
  getRoomById,
  ROOM_STATUS,
} from '../services/roomStore.js';

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
    throw new TypeError('title must not contain control characters.');
  }

  return title;
}

// Create a room for the authenticated guest.
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

// Retrieve room metadata.
// Until membership is implemented, only the owner may retrieve it.
router.get('/:roomId', requireGuest, (req, res) => {
  const room = getRoomById(req.params.roomId);

  // Use the same response for missing rooms and rooms the guest
  // is not permitted to access.
  if (!room || room.ownerId !== req.guest.id) {
    return res.status(404).json({
      error: {
        code: 'ROOM_NOT_FOUND',
        message: 'Room not found.',
      },
    });
  }

  return res.status(200).json({ room });
});

export default router;