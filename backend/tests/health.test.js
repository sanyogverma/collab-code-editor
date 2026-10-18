import assert from 'node:assert/strict';
import { test } from 'node:test';
import app from '../src/app.js';

test('GET /health returns HTTP 200 and the expected JSON', async () => {
  const server = app.listen(0, '127.0.0.1');

  await new Promise((resolve, reject) => {
    server.once('listening', resolve);
    server.once('error', reject);
  });

  try {
    const address = server.address();

    assert.ok(address && typeof address === 'object');

    const response = await fetch(
      `http://127.0.0.1:${address.port}/health`
    );

    assert.equal(response.status, 200);

    assert.deepEqual(await response.json(), {
      status: 'ok',
      service: 'collab-code-editor-api',
    });
  } finally {
    await new Promise((resolve, reject) => {
      server.close((error) => {
        if (error) {
          reject(error);
        } else {
          resolve();
        }
      });
    });
  }
});
