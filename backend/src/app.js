import express from 'express';

const app = express();

// Avoid exposing the Express framework identifier in response headers.
app.disable('x-powered-by');

// Simple health-check endpoint.
app.get('/health', (_req, res) => {
  res.status(200).json({
    status: 'ok',
    service: 'collab-code-editor-api',
  });
});

export default app;
