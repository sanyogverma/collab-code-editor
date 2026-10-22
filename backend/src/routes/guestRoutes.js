import { Router } from 'express';
import { createGuestIdentity } from '../services/guestIdentityService.js';

const router = Router();

router.post('/', (req, res) => {
  const { displayName } = req.body ?? {};

  try {
    const result = createGuestIdentity({ displayName });

    return res.status(201).json({
      identity: result.identity,
      sessionToken: result.sessionToken,
      expiresAt: result.expiresAt,
    });
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
        message: 'The guest session could not be created.',
      },
    });
  }
});

export default router;