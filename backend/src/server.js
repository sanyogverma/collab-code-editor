import app from './app.js';

const PORT = Number(process.env.PORT) || 3001;

const server = app.listen(PORT, () => {
  console.log(`Backend server running at http://localhost:${PORT}`);
  console.log(`Health endpoint: http://localhost:${PORT}/health`);
});

server.on('error', (error) => {
  console.error('Backend server failed to start:', error.message);
  process.exitCode = 1;
});
