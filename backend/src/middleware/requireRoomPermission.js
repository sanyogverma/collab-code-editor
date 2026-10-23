import { authorizeRoomAccess } from '../services/roomAuthorization.js';

export function requireRoomPermission(permission) {
  return (req, res, next) => {
    const userId = req.guest?.id;

    const result = authorizeRoomAccess({
      roomId: req.params.roomId,
      userId,
      permission,
    });

    if (!result.allowed) {
      return res.status(result.status).json({
        error: result.error,
      });
    }

    // These values come from trusted server-side stores.
    req.room = result.room;
    req.roomMembership = result.membership;

    return next();
  };
}