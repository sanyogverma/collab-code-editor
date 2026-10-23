# Room Authorization — Phase 3, Task 3.5

## Current Authorization Flow

1. `requireGuest` validates the bearer session token.
2. The server resolves the guest identity from the session store.
3. `requireRoomPermission` reads the requested room ID and the
   authenticated guest's server-side ID.
4. `authorizeRoomAccess` checks room existence, membership, and
   the requested permission.
5. The route handler runs only after authorization succeeds.

## Membership Records

The in-memory membership store associates each room with guest IDs
and roles. A room creator is registered as the owner when the room
is created.

Clients cannot assign themselves roles by putting a role or user ID
in the request body.

## Permission Rules

- Owner: read, edit, run, manage members, close room.
- Editor: read, edit, run.
- Viewer: read only.

Unknown roles and permissions are denied.

## HTTP Response Policy

- `401 UNAUTHORIZED`: missing or invalid guest identity.
- `404 ROOM_NOT_FOUND`: room does not exist or the authenticated
  guest has no membership.
- `403 FORBIDDEN`: member exists but lacks the requested permission.

Room-not-found and missing-membership responses are intentionally
identical to avoid revealing protected room existence.

## Routes Currently Protected

- `POST /api/rooms`: requires a verified guest session and creates
  server-side owner membership.
- `GET /api/rooms/:roomId`: requires a verified guest session and
  the `room:read` permission.

Editor and run endpoints do not exist yet. Their permission decisions
are covered by authorization-service tests. When those endpoints
are created, they must apply the same middleware with `document:edit`
or `code:run` before executing protected logic.

## WebSocket Security Gate

The collaboration WebSocket/Yjs service has not been implemented yet.

Before introducing a WebSocket room join in Phase 4, its connection
handler must authenticate the connecting guest and call the shared
room authorization service before allowing the connection to join
or receive room updates.

The WebSocket implementation must not trust the room name alone,
must not allow anonymous subscription, and must reject unauthorized
connections before broadcasting or synchronizing document data.

Do not expose a WebSocket collaboration service until these checks
are implemented and tested.

## Storage Limitations

Guest sessions, rooms and memberships are currently stored in memory.
They are lost when the backend restarts.

This implementation provides local MVP authorization behavior.
It is not production-grade authentication or durable membership
management. Persistent storage, revocation coordination, rate limiting,
and complete security review remain future work.