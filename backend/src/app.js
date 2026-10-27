import express from 'express';
import roomInviteRoutes from './routes/roomInviteRoutes.js';
import guestRoutes from './routes/guestRoutes.js';
import roomRoutes from './routes/roomRoutes.js';


const app = express();

app.disable('x-powered-by');

// Accept JSON request bodies with a modest size limit.
app.use(express.json({ limit: '16kb' }));

app.get('/health', (_req, res) => {
  res.status(200).json({
    status: 'ok',
    service: 'collab-code-editor-api',
  });
});

app.use('/api/guests', guestRoutes);
app.use('/api/rooms', roomRoutes);
app.use('/api/rooms/:roomId', roomInviteRoutes);

// Consistent response for unknown API paths and methods.
app.use('/api', (_req, res) => {
  res.status(404).json({
    error: {
      code: 'NOT_FOUND',
      message: 'API endpoint not found.',
    },
  });
});

// Handle malformed JSON, oversized request bodies, and unexpected errors.
app.use((error, _req, res, next) => {
  if (res.headersSent) {
    return next(error);
  }

  if (error?.type === 'entity.parse.failed') {
    return res.status(400).json({
      error: {
        code: 'INVALID_JSON',
        message: 'Request body must contain valid JSON.',
      },
    });
  }

  if (error?.type === 'entity.too.large') {
    return res.status(413).json({
      error: {
        code: 'PAYLOAD_TOO_LARGE',
        message: 'Request body exceeds the allowed size.',
      },
    });
  }

  return res.status(500).json({
    error: {
      code: 'INTERNAL_SERVER_ERROR',
      message: 'An unexpected server error occurred.',
    },
  });
});

export default app;
