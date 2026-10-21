import './monacoSetup.js';
import { useCallback, useState } from 'react';
import './App.css';
import CodeEditor, { INITIAL_CODE } from './components/CodeEditor.jsx';

function App() {
    const [code, setCode] = useState(INITIAL_CODE);
  const [fontSize, setFontSize] = useState(13);
  const [activeOutputTab, setActiveOutputTab] = useState('output');

  const handleCodeChange = useCallback((nextValue) => {
    setCode(nextValue ?? '');
  }, []);
  return (
    <div className="app-shell">
      {/* Top navigation */}
      <header className="topbar">
        <div className="brand">
          <div className="brand-logo">{'{ }'}</div>

          <div className="brand-copy">
            <span className="brand-name">CollabCode</span>
            <span className="brand-caption">DEVELOPER WORKSPACE</span>
          </div>
        </div>

        <div className="room-info">
          <span className="breadcrumb-label">Workspace</span>
          <span className="breadcrumb-divider">/</span>
          <span className="room-name">Untitled Session</span>
          <span className="local-tag">LOCAL</span>
        </div>

        <div className="topbar-actions">
          <div className="connection-status">
            <span className="status-dot" />
            <span>Preview mode</span>
          </div>

          <div className="topbar-divider" />

          <div className="profile-avatar" title="Local preview">
            SV
          </div>

          <button
            className="run-button"
            type="button"
            disabled
            title="Code execution will be added in a later phase"
          >
            <span className="play-icon">▶</span>
            Run Code
          </button>
        </div>
      </header>

      {/* Main workspace */}
      <div className="workspace-layout">
        {/* File sidebar */}
        <aside className="sidebar">
          <div className="sidebar-heading">
            <span>EXPLORER</span>
            <span className="subtle-icon">⌘</span>
          </div>

          <div className="sidebar-section-title">
            <span className="chevron">⌄</span>
            WORKSPACE
          </div>

          <div className="project-folder">
            <span className="folder-icon">▰</span>
            collaborative-editor
          </div>

          <div className="file-tree">
            <div className="tree-indent">
              <div className="folder-row">
                <span className="chevron">⌄</span>
                <span className="folder-icon">▰</span>
                src
              </div>

              <div className="file-row active-file">
                <span className="tree-spacer" />
                <span className="js-icon">JS</span>
                <span>main.js</span>
              </div>
            </div>
          </div>

          <div className="sidebar-bottom">
            <div className="sidebar-bottom-icon">⌘</div>
            <div>
              <strong>Local workspace</strong>
              <span>Your development session</span>
            </div>
          </div>
        </aside>

        {/* Central editor and output area */}
        <main className="editor-column">
          <div className="editor-tabbar">
            <div className="editor-tab">
              <span className="js-icon">JS</span>
              <span>main.js</span>
              <span className="tab-indicator" />
            </div>

            <div className="editor-tabbar-right">
  <span className="language-label">JavaScript</span>

  <div className="font-size-controls" aria-label="Editor font size controls">
    <button
      type="button"
      className="font-size-button"
      onClick={() => setFontSize((current) => Math.max(10, current - 1))}
      disabled={fontSize <= 10}
      aria-label="Decrease editor font size"
      title="Decrease font size"
    >
      A−
    </button>

    <span className="font-size-value">{fontSize}px</span>

    <button
      type="button"
      className="font-size-button"
      onClick={() => setFontSize((current) => Math.min(24, current + 1))}
      disabled={fontSize >= 24}
      aria-label="Increase editor font size"
      title="Increase font size"
    >
      A+
    </button>
  </div>

  <span className="editor-menu">···</span>
</div>
          </div>

          <section className="editor-pane">
            <div className="editor-breadcrumbs">
              <span>src</span>
              <span className="breadcrumb-divider">/</span>
              <span className="breadcrumb-current">main.js</span>
            </div>

            
            <div className="editor-preview-notice">
            <span className="notice-icon">i</span>
             Local editing enabled · Changes are not yet saved or synchronized
            </div>

            <div className="monaco-editor-container">
  <CodeEditor
    value={code}
    onChange={handleCodeChange}
    fontSize={fontSize}
  />
</div>
          </section>

          {/* Bottom output panel */}
          <section className="output-panel">
            <div className="output-header">
              <div className="output-tabs">
  <button
    type="button"
    className={`output-tab ${
      activeOutputTab === 'output' ? 'active-output-tab' : ''
    }`}
    aria-pressed={activeOutputTab === 'output'}
    onClick={() => setActiveOutputTab('output')}
  >
    OUTPUT
  </button>

  <button
    type="button"
    className={`output-tab ${
      activeOutputTab === 'problems' ? 'active-output-tab' : ''
    }`}
    aria-pressed={activeOutputTab === 'problems'}
    onClick={() => setActiveOutputTab('problems')}
  >
    PROBLEMS
  </button>
</div>

              <span className="output-menu">···</span>
            </div>

            <div className="output-body">
  {activeOutputTab === 'output' ? (
    <>
      <span className="output-prompt">›</span>

      <div>
        <p>No output yet</p>
        <small>
          Execution results will appear here when the runner is implemented.
        </small>
      </div>
    </>
  ) : (
    <>
      <span className="output-prompt problem-prompt">i</span>

      <div>
        <p>No problems to display</p>
        <small>
          Editor diagnostics will appear here when they are connected to the workspace.
        </small>
      </div>
    </>
  )}
</div>
          </section>
        </main>

        {/* Participant panel */}
        <aside className="participants-sidebar">
          <div className="participants-heading">
            <span>PARTICIPANTS</span>
            <span className="participant-count">2</span>
          </div>

          <p className="participants-description">
            Preview identities
          </p>

          <div className="participant-card">
            <div className="participant-avatar avatar-blue">SV</div>
            <div className="participant-details">
              <strong>You</strong>
              <span>Local preview</span>
            </div>
            <span className="you-badge">YOU</span>
          </div>

          <div className="participant-card">
            <div className="participant-avatar avatar-purple">C</div>
            <div className="participant-details">
              <strong>Collaborator</strong>
              <span>Demo placeholder</span>
            </div>
          </div>

          <div className="collaboration-card">
            <div className="collaboration-icon">✳</div>
            <strong>Better together</strong>
            <p>
              This space will support shared editing and live cursors in later phases.
            </p>
          </div>

          <div className="participants-footer">
            <span className="footer-dot" />
            Local UI preview · Not connected
          </div>
        </aside>
      </div>

      {/* Application status bar */}
      <footer className="statusbar">
        <div className="statusbar-left">
          <span>◇</span>
          <span>main</span>
          <span className="status-separator">|</span>
          <span>Local preview</span>
        </div>

        <div className="statusbar-right">
  <span>JavaScript</span>
  <span>{code.length} characters</span>
  <span>UTF-8</span>
  <span>Spaces: 2</span>
</div>
      </footer>
    </div>
  );
}

export default App;