# Room Model — Phase 3, Task 3.1

## Purpose

Define the initial room record and its lifecycle for the
Collaborative Code Editor.

## Room Record

| Field | Type | Description |
|---|---|---|
| id | string | Server-generated UUID v4 |
| title | string | Trimmed, non-empty room title |
| ownerId | string | Creator identifier from the trusted identity layer |
| createdAt | string | ISO 8601 UTC creation timestamp |
| status | string | `active` or `closed` |

## Lifecycle

- A newly created room starts as `active`.
- An active room can be marked `closed`.
- Closing an already-closed room has no further effect.
- Unknown room IDs return no record.

## Initial Storage

The current implementation uses an in-memory JavaScript Map.

Room records are lost when the backend process stops or restarts.
This implementation is a development-stage store, not durable
database persistence.

The store can later be replaced with a database-backed service
without changing the planned room record contract.

## Ownership and Security

`ownerId` is a trusted internal identifier, not proof of identity.

When API endpoints are implemented, the server must derive the owner
from the established identity/session context rather than trusting an
arbitrary owner identifier submitted by a client.

Random room IDs do not replace membership checks or authorization.

## Not Yet Implemented

- Guest/session identity: Task 3.2
- Room creation and metadata endpoints: Task 3.3
- Owner, editor and viewer roles: Task 3.4
- Server-side room access protection: Task 3.5
- Shareable room links: Task 3.6
- Durable database persistence: later roadmap work