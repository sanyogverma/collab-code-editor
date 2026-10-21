function WorkspaceState({ type, onExit }) {
  const states = {
    'no-room': {
      symbol: '◇',
      title: 'No room selected',
      description:
        'Select or join a room to open your collaborative workspace.',
      detail:
        'Room creation and joining will be connected in Phase 3.',
    },

    loading: {
      symbol: '↻',
      title: 'Loading workspace',
      description:
        'Preparing the room and getting the workspace ready.',
      detail:
        'This is a preview of the loading screen. Real room loading is not connected yet.',
    },

    error: {
      symbol: '!',
      title: "Couldn't load this workspace",
      description:
        'The room could not be loaded. It may be unavailable or the request may have failed.',
      detail:
        'Room fetching and permission errors will be connected to the API in Phase 3.',
    },
  };

  const currentState = states[type] ?? states.error;
  const isLoading = type === 'loading';
  const isError = type === 'error';

  return (
    <main className="workspace-state-screen">
      <section
        className="workspace-state-card"
        role="status"
        aria-live="polite"
        aria-busy={isLoading}
      >
        <div
          className={`workspace-state-symbol ${
            isLoading
              ? 'workspace-state-symbol--loading'
              : isError
                ? 'workspace-state-symbol--error'
                : ''
          }`}
          aria-hidden="true"
        >
          {currentState.symbol}
        </div>

        <p className="workspace-state-eyebrow">
          COLLABCODE WORKSPACE
        </p>

        <h1>{currentState.title}</h1>

        <p className="workspace-state-description">
          {currentState.description}
        </p>

        <div className="workspace-state-detail">
          {currentState.detail}
        </div>

        <button
          type="button"
          className="workspace-state-button"
          onClick={onExit}
        >
          Return to local editor
        </button>
      </section>
    </main>
  );
}

export default WorkspaceState;