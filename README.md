# Collaborative Code Editor with Execution Sandbox

A browser-based collaborative coding environment being developed in small, verifiable stages. The planned application will support shared JavaScript editing, real-time collaboration, room management, and isolated code execution.

## Current Project Status

The repository foundation is complete.

### Currently implemented
- React application created with Vite.
- Node.js backend using Express.
- Health endpoint at `GET /health`.
- Combined frontend and backend development command.
- Frontend production build.
- Backend syntax check and automated health endpoint test.
- Environment configuration template.

### Planned for later phases
- Coding workspace and Monaco Editor.
- Rooms, access permissions, and collaborative editing with Yjs.
- Participant presence and live cursors.
- Document persistence and recovery.
- A separately managed, constrained JavaScript execution runner.
- Integration, security, and reliability tests.

The planned features above are not implemented merely by being listed here.

## Technology Stack

- JavaScript and Node.js
- React and Vite
- Express
- Git and npm
- Docker Desktop for the later local execution-runner phase

## Prerequisites

For the current application, install:
- A compatible Node.js LTS release and npm.
- Git.
- Visual Studio Code or another code editor.

Docker Desktop should be installed for the later sandbox phase. The current frontend and health endpoint do not require Docker to run.

Use Git Bash in VS Code for the commands below. PowerShell may be used for Windows-specific administration when necessary.

## Repository Structure

```text
collab-code-editor/
├── frontend/
├── backend/
│   ├── src/
│   │   ├── app.js
│   │   └── server.js
│   └── tests/
│       └── health.test.js
├── .env.example
├── .gitignore
├── package.json
├── package-lock.json
├── README.md
└── PROGRESS.md
```

## Getting Started

Install dependencies in the root, frontend, and backend directories if they have not already been installed.

From the project root:

```bash
npm install
npm --prefix frontend install
npm --prefix backend install
```

Start the frontend and backend together:

```bash
npm run dev
```

Open the Vite URL printed in the terminal, usually `http://localhost:5173`.

Check the backend health endpoint in another terminal:

```bash
curl -i http://localhost:3001/health
```

## Build and Test

Build the frontend and check backend syntax:

```bash
npm run build
```

Run backend tests:

```bash
npm test
```

## Development Principles

- Build in small, verifiable phases.
- Test changes before committing.
- Never commit secrets or local `.env` files.
- Keep execution of user-submitted code isolated from the main application server.
- Review security and resource limits before implementing code execution.

## License

No license has been selected yet.