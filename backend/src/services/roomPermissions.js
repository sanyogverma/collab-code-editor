export const ROOM_ROLES = Object.freeze({
  OWNER: 'owner',
  EDITOR: 'editor',
  VIEWER: 'viewer',
});

export const ROOM_PERMISSIONS = Object.freeze({
  READ: 'room:read',
  EDIT: 'document:edit',
  RUN: 'code:run',
  MANAGE_MEMBERS: 'members:manage',
  CLOSE_ROOM: 'room:close',
});

// Central policy: each role receives only its explicitly listed permissions.
const ROLE_PERMISSIONS = Object.freeze({
  [ROOM_ROLES.OWNER]: Object.freeze([
    ROOM_PERMISSIONS.READ,
    ROOM_PERMISSIONS.EDIT,
    ROOM_PERMISSIONS.RUN,
    ROOM_PERMISSIONS.MANAGE_MEMBERS,
    ROOM_PERMISSIONS.CLOSE_ROOM,
  ]),

  [ROOM_ROLES.EDITOR]: Object.freeze([
    ROOM_PERMISSIONS.READ,
    ROOM_PERMISSIONS.EDIT,
    ROOM_PERMISSIONS.RUN,
  ]),

  [ROOM_ROLES.VIEWER]: Object.freeze([
    ROOM_PERMISSIONS.READ,
  ]),
});

/**
 * Returns true only for a recognized room role.
 */
export function isRoomRole(role) {
  return (
    typeof role === 'string' &&
    Object.hasOwn(ROLE_PERMISSIONS, role)
  );
}

/**
 * Checks whether a role has a particular permission.
 *
 * Unknown roles and unknown permissions are denied by default.
 */
export function hasRoomPermission(role, permission) {
  if (!isRoomRole(role) || typeof permission !== 'string') {
    return false;
  }

  return ROLE_PERMISSIONS[role].includes(permission);
}

/**
 * Returns the permissions associated with a role.
 * Unknown roles receive an empty array.
 *
 * A new array is returned so callers cannot mutate the internal policy.
 */
export function getRoomPermissions(role) {
  if (!isRoomRole(role)) {
    return [];
  }

  return [...ROLE_PERMISSIONS[role]];
}