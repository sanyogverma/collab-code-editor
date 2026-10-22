import assert from 'node:assert/strict';
import { after, before, test } from 'node:test';

import app from '../src/app.js';

let server;
let baseUrl;

before(async () => {
  server = app.listen(0, '127.0.0.1');

  await new Promise((resolve, reject) => {
    server.once('listening', resolve);
    server.once('error', reject);
  });

  const address = server.address();

  assert.ok(address && typeof address === 'object');

  baseUrl = `http://127.0.0.1:${address.port}`;
});

after(async () => {
  if (!server) {
    return;
  }

  await new Promise((resolve, reject) => {
    server.close((error) => {
      if (error) {
        reject(error);
      } else {
        resolve();
      }
    });
  });
});

async function requestJson(
  path,
  { method = 'GET', token, body } = {},
) {
  const headers = {};

  if (body !== undefined) {
    headers['content-type'] = 'application/json';
  }

  if (token) {
    headers.authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${baseUrl}${path}`, {
    method,
    headers,
    ...(body !== undefined
      ? { body: JSON.stringify(body) }
      : {}),
  });

  const payload = await response.json();

  return { response, payload };
}

async function createTestGuest(displayName = 'API Test Guest') {
  const { response, payload } = await requestJson('/api/guests', {
    method: 'POST',
    body: { displayName },
  });

  assert.equal(response.status, 201);

  return payload;
}

test('POST /api/guests creates a guest session', async () => {
  const { response, payload } = await requestJson('/api/guests', {
    method: 'POST',
    body: { displayName: '  API Guest  ' },
  });

  assert.equal(response.status, 201);
  assert.equal(payload.identity.displayName, 'API Guest');
  assert.match(
    payload.identity.id,
    /^[0-9a-f-]{36}$/i,
  );
  assert.match(payload.sessionToken, /^[A-Za-z0-9_-]{43}$/);
  assert.ok(Number.isFinite(Date.parse(payload.expiresAt)));
});

test('POST /api/guests rejects an invalid display name', async () => {
  const { response, payload } = await requestJson('/api/guests', {
    method: 'POST',
    body: { displayName: '   ' },
  });

  assert.equal(response.status, 400);
  assert.equal(payload.error.code, 'VALIDATION_ERROR');
});

test('POST /api/rooms requires a valid guest token', async () => {
  const { response, payload } = await requestJson('/api/rooms', {
    method: 'POST',
    body: { title: 'Unauthorized Room' },
  });

  assert.equal(response.status, 401);
  assert.equal(payload.error.code, 'UNAUTHORIZED');
});

test('POST /api/rooms creates a room owned by the authenticated guest', async () => {
  const guest = await createTestGuest('Room Owner');

  const { response, payload } = await requestJson('/api/rooms', {
    method: 'POST',
    token: guest.sessionToken,
    body: {
      title: '  DSA Practice  ',
      ownerId: 'forged-owner-id',
    },
  });

  assert.equal(response.status, 201);

  assert.equal(payload.room.title, 'DSA Practice');
  assert.equal(payload.room.ownerId, guest.identity.id);
  assert.notEqual(payload.room.ownerId, 'forged-owner-id');
  assert.equal(payload.room.status, 'active');
  assert.match(
    payload.room.id,
    /^[0-9a-f-]{36}$/i,
  );
  assert.ok(Number.isFinite(Date.parse(payload.room.createdAt)));
});

test('POST /api/rooms rejects invalid titles', async () => {
  const guest = await createTestGuest('Validation Guest');

  const invalidBodies = [
    {},
    { title: '' },
    { title: '   ' },
    { title: 123 },
    { title: 'x'.repeat(81) },
    { title: 'bad\nname' },
  ];

  for (const body of invalidBodies) {
    const { response, payload } = await requestJson('/api/rooms', {
      method: 'POST',
      token: guest.sessionToken,
      body,
    });

    assert.equal(response.status, 400);
    assert.equal(payload.error.code, 'VALIDATION_ERROR');
  }
});

test('GET /api/rooms/:roomId returns metadata to the owner', async () => {
  const guest = await createTestGuest('Metadata Owner');

  const created = await requestJson('/api/rooms', {
    method: 'POST',
    token: guest.sessionToken,
    body: { title: 'Room Metadata Test' },
  });

  assert.equal(created.response.status, 201);

  const roomId = created.payload.room.id;

  const { response, payload } = await requestJson(
    `/api/rooms/${roomId}`,
    { token: guest.sessionToken },
  );

  assert.equal(response.status, 200);
  assert.deepEqual(payload.room, created.payload.room);
});

test('GET /api/rooms/:roomId denies a different guest', async () => {
  const owner = await createTestGuest('Owner');
  const otherGuest = await createTestGuest('Another Guest');

  const created = await requestJson('/api/rooms', {
    method: 'POST',
    token: owner.sessionToken,
    body: { title: 'Private Room' },
  });

  const { response, payload } = await requestJson(
    `/api/rooms/${created.payload.room.id}`,
    { token: otherGuest.sessionToken },
  );

  assert.equal(response.status, 404);
  assert.equal(payload.error.code, 'ROOM_NOT_FOUND');
});

test('GET /api/rooms/:roomId returns 404 for an unknown room', async () => {
  const guest = await createTestGuest('Unknown Room Guest');

  const { response, payload } = await requestJson(
    '/api/rooms/unknown-room-id',
    { token: guest.sessionToken },
  );

  assert.equal(response.status, 404);
  assert.equal(payload.error.code, 'ROOM_NOT_FOUND');
});

test('malformed JSON receives a predictable error response', async () => {
  const response = await fetch(`${baseUrl}/api/guests`, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
    },
    body: '{"displayName":',
  });

  const payload = await response.json();

  assert.equal(response.status, 400);
  assert.equal(payload.error.code, 'INVALID_JSON');
});

test('unknown API paths return a JSON 404 response', async () => {
  const { response, payload } = await requestJson('/api/not-a-route');

  assert.equal(response.status, 404);
  assert.equal(payload.error.code, 'NOT_FOUND');
});