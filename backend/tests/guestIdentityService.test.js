import assert from 'node:assert/strict';
import test from 'node:test';

import {
  createGuestIdentity,
  getGuestIdentityByToken,
  revokeGuestSession,
  GUEST_SESSION_TTL_MS,
} from '../src/services/guestIdentityService.js';

const UUID_V4_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const SESSION_TOKEN_PATTERN = /^[A-Za-z0-9_-]{43}$/;

test('creates a guest identity with a validated display name', () => {
  const result = createGuestIdentity({
    displayName: '  Sanyog  ',
  });

  assert.match(result.identity.id, UUID_V4_PATTERN);
  assert.equal(result.identity.displayName, 'Sanyog');

  assert.ok(
    Number.isFinite(Date.parse(result.identity.createdAt)),
  );

  assert.equal(
    result.identity.createdAt,
    new Date(result.identity.createdAt).toISOString(),
  );

  assert.equal('sessionToken' in result.identity, false);
});

test('creates a random session token and resolves its identity', () => {
  const result = createGuestIdentity({
    displayName: 'Guest One',
  });

  assert.match(result.sessionToken, SESSION_TOKEN_PATTERN);

  const expiresAtMs = Date.parse(result.expiresAt);
  const createdAtMs = Date.parse(result.identity.createdAt);

  assert.equal(
    expiresAtMs - createdAtMs,
    GUEST_SESSION_TTL_MS,
  );

  assert.deepEqual(
    getGuestIdentityByToken(result.sessionToken),
    result.identity,
  );
});

test('different guests receive different identities and tokens', () => {
  const first = createGuestIdentity({
    displayName: 'Guest One',
  });

  const second = createGuestIdentity({
    displayName: 'Guest Two',
  });

  assert.notEqual(first.identity.id, second.identity.id);
  assert.notEqual(first.sessionToken, second.sessionToken);
});

test('rejects invalid display names', () => {
  const invalidNames = [
    undefined,
    null,
    '',
    '   ',
    'a'.repeat(33),
    'name\nwith newline',
    'name\twith tab',
  ];

  for (const displayName of invalidNames) {
    assert.throws(
      () => createGuestIdentity({ displayName }),
      TypeError,
    );
  }
});

test('unknown and malformed tokens do not resolve an identity', () => {
  assert.equal(
    getGuestIdentityByToken('unknown-token'),
    null,
  );

  assert.equal(
    getGuestIdentityByToken(null),
    null,
  );

  assert.equal(
    getGuestIdentityByToken(''),
    null,
  );
});

test('revoking a guest session prevents further resolution', () => {
  const result = createGuestIdentity({
    displayName: 'Revocation Test',
  });

  assert.deepEqual(
    getGuestIdentityByToken(result.sessionToken),
    result.identity,
  );

  assert.equal(
    revokeGuestSession(result.sessionToken),
    true,
  );

  assert.equal(
    getGuestIdentityByToken(result.sessionToken),
    null,
  );

  assert.equal(
    revokeGuestSession(result.sessionToken),
    false,
  );
});

test('returned identities cannot mutate the stored identity', () => {
  const result = createGuestIdentity({
    displayName: 'Original Name',
  });

  result.identity.displayName = 'Modified Name';

  assert.equal(
    getGuestIdentityByToken(result.sessionToken).displayName,
    'Original Name',
  );
});