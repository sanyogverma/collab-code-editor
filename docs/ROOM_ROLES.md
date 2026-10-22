# Room Roles and Permissions

## Purpose

Define a centralized authorization policy for the collaborative editor.

## Roles

### Owner

The room owner may:
- Read room metadata and content.
- Edit room content.
- Run code.
- Manage room membership.
- Close the room.

### Editor

An editor may:
- Read room metadata and content.
- Edit room content.
- Run code.

An editor may not manage room membership or close the room.

### Viewer

A viewer may:
- Read room metadata and content.

A viewer may not edit content, run code, manage membership or close
the room.

## Permission Identifiers

| Permission | Meaning |
|---|---|
| `room:read` | Read room metadata/content |
| `document:edit` | Modify room content |
| `code:run` | Request code execution |
| `members:manage` | Manage room membership |
| `room:close` | Close the room |

## Default-Deny Policy

Unknown roles and unknown permissions are denied.

Permission evaluation must use a recognized role and a permission
from the central policy. Callers cannot grant themselves permissions
by supplying a role in an HTTP request.

The role must ultimately be derived from trusted, server-side room
membership data.

## Implementation Status

The role definitions and policy helper are implemented and tested.

Room membership storage and enforcing this policy at API boundaries
will be implemented in Task 3.5 and subsequent room-management tasks.

The current policy helper is not, by itself, an authentication or
authorization boundary.