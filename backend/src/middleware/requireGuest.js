import { getGuestIdentityByToken } from '../services/guestIdentityService.js';

function sendUnauthorized(res) {
  return res.status(401).json({
    error: {
      code: 'UNAUTHORIZED',
      message: 'A valid guest session token is required.',
    },
  });
}

export function requireGuest(req, res, next) {
  const authorization = req.get('authorization') ?? '';
  const match = /^Bearer\s+(\S+)$/i.exec(authorization);

  if (!match) {
    return sendUnauthorized(res);
  }

  const identity = getGuestIdentityByToken(match[1]);

  if (!identity) {
    return sendUnauthorized(res);
  }

  // Attach the verified server-side identity, not a client-supplied owner ID.
  req.guest = identity;

  return next();
}