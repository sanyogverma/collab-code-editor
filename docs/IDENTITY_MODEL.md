# Guest Identity Model — Phase 3, Task 3.2

## Purpose

Define a temporary guest identity and session credential for the MVP.

## Guest Identity

Each guest identity contains:

- `id`: server-generated UUID v4
- `displayName`: trimmed name, 1–32 Unicode code points
- `createdAt`: ISO 8601 UTC timestamp

Names that are empty, too long, or contain control characters are rejected.

Display names must be rendered as text in the frontend, never as
untrusted HTML.

## Session Token

The backend generates a session token using 32 random bytes,
encoded using base64url.

The token is a bearer credential: possession of the token grants
the ability to act as that guest where token authentication is
accepted.

The raw token is returned at identity creation. The service stores
a SHA-256 hash of the token rather than its raw value.

The planned HTTP authentication convention is:

`Authorization: Bearer <session-token>`

This convention is a design decision for future API integration;
HTTP identity endpoints are not implemented in Task 3.2.

Tokens must not appear in URL parameters, application logs or analytics.

## Expiry and Revocation

- A guest session expires after 12 hours.
- A session may be revoked before expiry.
- Invalid, unknown, expired or revoked tokens resolve to no identity.

## Storage and Limitations

The current session store uses an in-memory Map.

All guest sessions are lost when the backend process restarts.
Expired sessions are removed when accessed or when new identities
are created.

This is a development-stage guest identity service, not production
authentication.

Anyone who steals a valid bearer token can impersonate that guest.
There is no verified email, password login, durable session store,
account recovery or production-grade authentication.

## Room Integration

When room creation is implemented, the server will use the
authenticated guest's `identity.id` as the room's `ownerId`.

The server must not trust an arbitrary `ownerId` supplied in a
request body.

A guest identity alone does not grant access to every room. Room
membership and roles must be checked separately.

## Not Yet Implemented

- HTTP identity endpoint: Task 3.3 integration
- Room creation and retrieval routes: Task 3.3
- Owner/editor/viewer roles: Task 3.4
- Server-side authorization: Task 3.5
- Room invite-link flow: Task 3.6
- Durable session persistence: later work