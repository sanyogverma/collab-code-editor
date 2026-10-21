import './App.css';

function App() {
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
              Static preview · Monaco Editor will be integrated in Task 2.2
            </div>

            <div className="code-preview" aria-label="Static JavaScript code preview">
              <div className="code-line">
                <span className="line-number">1</span>
                <span className="token-comment">
                  // Welcome to your collaborative workspace
                </span>
              </div>

              <div className="code-line">
                <span className="line-number">2</span>
                <span>
                  <span className="token-keyword">const</span>{' '}
                  <span className="token-variable">room</span> = {'{'}
                </span>
              </div>

              <div className="code-line">
                <span className="line-number">3</span>
                <span>
                  {'  '}name: <span className="token-string">"Collaborative Workspace"</span>,
                </span>
              </div>

              <div className="code-line">
                <span className="line-number">4</span>
                <span>
                  {'  '}language: <span className="token-string">"javascript"</span>,
                </span>
              </div>

              <div className="code-line">
                <span className="line-number">5</span>
                <span>
                  {'  '}status: <span className="token-string">"ready"</span>,
                </span>
              </div>

              <div className="code-line">
                <span className="line-number">6</span>
                <span>{'};'}</span>
              </div>

              <div className="code-line">
                <span className="line-number">7</span>
                <span>&nbsp;</span>
              </div>

              <div className="code-line">
                <span className="line-number">8</span>
                <span>
                  <span className="token-keyword">function</span>{' '}
                  <span className="token-function">greet</span>(name) {'{'}
                </span>
              </div>

              <div className="code-line">
                <span className="line-number">9</span>
                <span>
                  {'  '}<span className="token-keyword">return</span>{' '}
                  <span className="token-string">"Welcome, "</span> + name +
                  <span className="token-string"> "!"</span>;
                </span>
              </div>

              <div className="code-line">
                <span className="line-number">10</span>
                <span>{'}'}</span>
              </div>

              <div className="code-line">
                <span className="line-number">11</span>
                <span>&nbsp;</span>
              </div>

              <div className="code-line">
                <span className="line-number">12</span>
                <span>
                  <span className="token-console">console</span>.log(
                  <span className="token-function">greet</span>(
                  <span className="token-string">"developer"</span>));
                </span>
              </div>

              <div className="cursor-placeholder" />
            </div>

            <div className="editor-empty-space">
              <span>⌘</span>
              <p>Your coding workspace starts here.</p>
              <small>
                Editing and synchronization will be added in the next tasks.
              </small>
            </div>
          </section>

          {/* Bottom output panel */}
          <section className="output-panel">
            <div className="output-header">
              <div className="output-tabs">
                <span className="output-tab active-output-tab">OUTPUT</span>
                <span className="output-tab">PROBLEMS</span>
              </div>

              <span className="output-menu">···</span>
            </div>

            <div className="output-body">
              <span className="output-prompt">›</span>
              <div>
                <p>No output yet</p>
                <small>
                  Execution results will appear here when the runner is implemented.
                </small>
              </div>
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
          <span>UTF-8</span>
          <span>Spaces: 2</span>
        </div>
      </footer>
    </div>
  );
}

export default App;