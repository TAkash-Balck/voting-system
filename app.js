/* ============================================================
   ONLINE VOTING SYSTEM — Application Logic
   Features: Auth, RBAC, Voice-Assisted Voting, Real-Time Results
   ============================================================ */

// ── Data Store (localStorage-backed) ──
const Store = {
  _prefix: 'evote_',

  get(key) {
    try {
      const raw = localStorage.getItem(this._prefix + key);
      return raw ? JSON.parse(raw) : null;
    } catch { return null; }
  },

  set(key, value) {
    localStorage.setItem(this._prefix + key, JSON.stringify(value));
  },

  remove(key) {
    localStorage.removeItem(this._prefix + key);
  },

  // Initialize default data if not already set
  init() {
    if (!this.get('users')) {
      this.set('users', [
        { id: 'admin1', name: 'Dr. Sharma (Admin)', email: 'admin@university.edu', password: 'admin123', role: 'admin' },
        { id: 'v1', name: 'Alice Johnson', email: 'alice@student.edu', password: 'vote123', role: 'voter', hasVoted: false, votedFor: null },
        { id: 'v2', name: 'Bob Williams', email: 'bob@student.edu', password: 'vote123', role: 'voter', hasVoted: false, votedFor: null },
        { id: 'v3', name: 'Charlie Davis', email: 'charlie@student.edu', password: 'vote123', role: 'voter', hasVoted: false, votedFor: null }
      ]);
    }

    if (!this.get('candidates')) {
      this.set('candidates', [
        {
          id: 'c1', name: 'Arjun Mehta', position: 'President',
          slogan: '"Empowering every student voice through transparent governance and inclusive campus events."',
          photo: 'assets/images/candidate1.jpg', votes: 0
        },
        {
          id: 'c2', name: 'Amara Okafor', position: 'Vice President',
          slogan: '"Building bridges between departments and creating opportunities for all."',
          photo: 'assets/images/candidate2.jpg', votes: 0
        },
        {
          id: 'c3', name: 'Carlos Rivera', position: 'Secretary',
          slogan: '"Accountability starts with open books and open doors."',
          photo: 'assets/images/candidate3.jpg', votes: 0
        },
        {
          id: 'c4', name: 'Mei Lin Chen', position: 'Treasurer',
          slogan: '"Smart budgets, better resources, brighter futures for our campus."',
          photo: 'assets/images/candidate4.jpg', votes: 0
        }
      ]);
    }

    if (this.get('electionActive') === null) {
      this.set('electionActive', true);
    }

    if (!this.get('activityLog')) {
      this.set('activityLog', [
        { time: new Date().toISOString(), msg: 'Election system initialized' }
      ]);
    }
  }
};

// ── App State ──
let currentUser = null;
let currentPage = 'vote'; // vote | results | admin

// ── Initialize ──
document.addEventListener('DOMContentLoaded', () => {
  Store.init();

  // Check if a user session exists
  const session = Store.get('session');
  if (session) {
    const users = Store.get('users');
    currentUser = users.find(u => u.id === session.userId);
    if (currentUser) {
      showDashboard();
      return;
    }
  }
  showAuth();
});

// ── Toasts ──
function showToast(message, type = 'info') {
  let container = document.getElementById('toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toast-container';
    container.className = 'toast-container';
    document.body.appendChild(container);
  }

  const iconMap = { success: '✓', error: '✗', info: 'ℹ' };
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.innerHTML = `
    <span class="toast-icon">${iconMap[type]}</span>
    <span>${message}</span>
    <button class="toast-close" onclick="this.parentElement.classList.add('toast-exit'); setTimeout(() => this.parentElement.remove(), 300)">✕</button>
  `;
  container.appendChild(toast);
  setTimeout(() => {
    toast.classList.add('toast-exit');
    setTimeout(() => toast.remove(), 300);
  }, 4000);
}

// ── Auth Page ──
function showAuth() {
  currentUser = null;
  Store.remove('session');

  const app = document.getElementById('app');
  app.innerHTML = `
    <div class="auth-page">
      <div class="auth-container">
        <div class="auth-card">
          <div class="auth-logo">
            <div class="logo-icon"></div>
            <h1>CampusVote</h1>
            <p>Student Council Election 2026</p>
          </div>

          <div class="auth-tabs">
            <button class="auth-tab active" id="tab-login" onclick="switchAuthTab('login')">Sign In</button>
            <button class="auth-tab" id="tab-register" onclick="switchAuthTab('register')">Register</button>
          </div>

          <div id="auth-error" class="auth-error hidden"></div>

          <!-- Login Form -->
          <form id="login-form" onsubmit="handleLogin(event)">
            <div class="form-group">
              <label>Email Address</label>
              <div class="input-wrapper">
                <input type="email" class="form-input" id="login-email" placeholder="you@student.edu" required>
                <span class="input-icon"></span>
              </div>
            </div>
            <div class="form-group">
              <label>Password</label>
              <div class="input-wrapper">
                <input type="password" class="form-input" id="login-password" placeholder="Enter your password" required>
                <span class="input-icon"></span>
              </div>
            </div>
            <button type="submit" class="btn btn-primary" id="login-btn">
              Sign In Securely
            </button>
          </form>

          <!-- Register Form -->
          <form id="register-form" class="hidden" onsubmit="handleRegister(event)">
            <div class="form-group">
              <label>Full Name</label>
              <div class="input-wrapper">
                <input type="text" class="form-input" id="reg-name" placeholder="John Doe" required>
                <span class="input-icon"></span>
              </div>
            </div>
            <div class="form-group">
              <label>Email Address</label>
              <div class="input-wrapper">
                <input type="email" class="form-input" id="reg-email" placeholder="you@student.edu" required>
                <span class="input-icon"></span>
              </div>
            </div>
            <div class="form-group">
              <label>Password</label>
              <div class="input-wrapper">
                <input type="password" class="form-input" id="reg-password" placeholder="Min 6 characters" required minlength="6">
                <span class="input-icon"></span>
              </div>
            </div>
            <div class="form-group">
              <label>Role</label>
              <div class="input-wrapper">
                <select class="form-select" id="reg-role">
                  <option value="voter">Voter (Student)</option>
                  <option value="admin">Admin (Faculty)</option>
                </select>
                <span class="input-icon"></span>
              </div>
            </div>
            <button type="submit" class="btn btn-primary" id="reg-btn">
              Create Account
            </button>
          </form>

          <div style="margin-top: var(--space-lg); text-align: center;">
            <p style="color: var(--text-muted); font-size: 0.75rem;">
              Demo credentials:<br>
              Admin: admin@university.edu / admin123<br>
              Voter: alice@student.edu / vote123
            </p>
          </div>
        </div>
      </div>
    </div>
  `;
}

function switchAuthTab(tab) {
  document.getElementById('tab-login').classList.toggle('active', tab === 'login');
  document.getElementById('tab-register').classList.toggle('active', tab === 'register');
  document.getElementById('login-form').classList.toggle('hidden', tab !== 'login');
  document.getElementById('register-form').classList.toggle('hidden', tab !== 'register');
  document.getElementById('auth-error').classList.add('hidden');
}

function showAuthError(msg) {
  const el = document.getElementById('auth-error');
  el.innerHTML = `⚠️ ${msg}`;
  el.classList.remove('hidden');
}

function handleLogin(e) {
  e.preventDefault();
  const email = document.getElementById('login-email').value.trim().toLowerCase();
  const password = document.getElementById('login-password').value;

  const users = Store.get('users');
  const user = users.find(u => u.email.toLowerCase() === email && u.password === password);

  if (!user) {
    showAuthError('Invalid email or password. Please try again.');
    return;
  }

  currentUser = user;
  Store.set('session', { userId: user.id });
  logActivity(`${user.name} signed in (${user.role})`);
  showToast(`Welcome back, ${user.name.split(' ')[0]}!`, 'success');
  showDashboard();
}

function handleRegister(e) {
  e.preventDefault();
  const name = document.getElementById('reg-name').value.trim();
  const email = document.getElementById('reg-email').value.trim().toLowerCase();
  const password = document.getElementById('reg-password').value;
  const role = document.getElementById('reg-role').value;

  const users = Store.get('users');
  if (users.find(u => u.email.toLowerCase() === email)) {
    showAuthError('An account with this email already exists.');
    return;
  }

  const newUser = {
    id: 'u' + Date.now(),
    name,
    email,
    password,
    role,
    hasVoted: false,
    votedFor: null
  };

  users.push(newUser);
  Store.set('users', users);

  currentUser = newUser;
  Store.set('session', { userId: newUser.id });
  logActivity(`${name} registered as ${role}`);
  showToast('Account created successfully!', 'success');
  showDashboard();
}

// ── Activity Log ──
function logActivity(msg) {
  const log = Store.get('activityLog') || [];
  log.unshift({ time: new Date().toISOString(), msg });
  if (log.length > 50) log.pop();
  Store.set('activityLog', log);
}

// ── Dashboard ──
function showDashboard() {
  currentPage = currentUser.role === 'admin' ? 'admin' : 'vote';

  const app = document.getElementById('app');
  app.innerHTML = `
    <button class="sidebar-toggle" id="sidebar-toggle" onclick="toggleSidebar()">☰</button>

    <div class="dashboard-layout">
      <aside class="sidebar" id="sidebar">
        <div class="sidebar-header">
          <div class="logo-sm"></div>
          <h2>CampusVote</h2>
        </div>
        <nav class="sidebar-nav" id="sidebar-nav"></nav>
        <div class="sidebar-footer">
          <div class="user-profile">
            <div class="user-avatar">${currentUser.name.charAt(0).toUpperCase()}</div>
            <div class="user-info">
              <div class="user-name">${currentUser.name}</div>
              <div class="user-role">${currentUser.role}</div>
            </div>
          </div>
        </div>
      </aside>

      <main class="main-content" id="main-content"></main>
    </div>
  `;

  buildSidebar();
  navigateTo(currentPage);
}

function buildSidebar() {
  const nav = document.getElementById('sidebar-nav');
  const isAdmin = currentUser.role === 'admin';

  let items = '';

  if (!isAdmin) {
    items += `
      <button class="nav-item ${currentPage === 'vote' ? 'active' : ''}" onclick="navigateTo('vote')" id="nav-vote">
        <span class="nav-icon"></span> Cast Your Vote
      </button>
    `;
  }

  items += `
    <button class="nav-item ${currentPage === 'results' ? 'active' : ''}" onclick="navigateTo('results')" id="nav-results">
      <span class="nav-icon"></span> Live Results
    </button>
  `;

  if (isAdmin) {
    items += `
      <button class="nav-item ${currentPage === 'admin' ? 'active' : ''}" onclick="navigateTo('admin')" id="nav-admin">
        <span class="nav-icon"></span> Election Control
      </button>
      <button class="nav-item ${currentPage === 'voters' ? 'active' : ''}" onclick="navigateTo('voters')" id="nav-voters">
        <span class="nav-icon"></span> Voter Registry
      </button>
    `;
  }

  items += `
    <div class="nav-spacer"></div>
    <button class="nav-item" onclick="handleLogout()" id="nav-logout">
      <span class="nav-icon"></span> Sign Out
    </button>
  `;

  nav.innerHTML = items;
}

function navigateTo(page) {
  currentPage = page;

  // Update active nav item
  document.querySelectorAll('.nav-item').forEach(item => item.classList.remove('active'));
  const activeNav = document.getElementById('nav-' + page);
  if (activeNav) activeNav.classList.add('active');

  // Close mobile sidebar
  document.getElementById('sidebar')?.classList.remove('open');

  const pageRenderers = {
    vote: renderVotePage,
    results: renderResultsPage,
    admin: renderAdminPage,
    voters: renderVotersPage
  };

  (pageRenderers[page] || pageRenderers.vote)();
}

function toggleSidebar() {
  document.getElementById('sidebar').classList.toggle('open');
}

function handleLogout() {
  logActivity(`${currentUser.name} signed out`);
  Store.remove('session');
  currentUser = null;
  showToast('Signed out successfully', 'info');
  showAuth();
}

// ── Vote Page ──
function renderVotePage() {
  const main = document.getElementById('main-content');
  const candidates = Store.get('candidates');
  const users = Store.get('users');
  const user = users.find(u => u.id === currentUser.id);
  const electionActive = Store.get('electionActive');
  const totalVotes = candidates.reduce((sum, c) => sum + c.votes, 0);

  let content = `
    <div class="page-header">
      <div>
        <h1> Cast Your Vote</h1>
        <p class="subtitle">Student Council Election 2026 — Choose your representatives</p>
      </div>
      <div class="header-actions">
        <span class="election-status-badge ${electionActive ? 'active' : 'closed'}">
          ${electionActive ? '<span class="live-dot"></span> Voting Open' : 'Voting Closed'}
        </span>
      </div>
    </div>
  `;

  // Voice assist panel
  content += `
    <div class="voice-assist-panel">
      <h3>Voice-Assisted Voting</h3>
      <p style="color: var(--text-secondary); font-size: 0.8125rem; margin-bottom: var(--space-md);">
        Click the microphone and say a candidate's name to select them. Example: "Vote for Arjun Mehta"
      </p>
      <div class="voice-controls">
        <button class="btn-voice" id="voice-btn" onclick="toggleVoiceRecognition()" title="Start voice recognition">
          
        </button>
        <span class="voice-status" id="voice-status">Click to start listening</span>
      </div>
      <div class="voice-transcript" id="voice-transcript">Your voice command will appear here...</div>
    </div>
  `;

  if (user.hasVoted) {
    content += `
      <div class="results-card" style="text-align: center; padding: var(--space-3xl);">
        <div class="vote-confirmed-icon"></div>
        <h2 style="font-family: var(--font-display); margin-bottom: var(--space-sm);">Vote Successfully Cast!</h2>
        <p style="color: var(--text-secondary); margin-bottom: var(--space-lg);">
          Thank you for participating in the Student Council Election. Your vote has been recorded securely.
        </p>
        <p style="color: var(--text-muted); font-size: 0.8125rem;">
          You voted for: <strong style="color: var(--gold-400);">${candidates.find(c => c.id === user.votedFor)?.name || 'Unknown'}</strong>
        </p>
        <button class="btn btn-outline btn-sm" style="margin-top: var(--space-lg);" onclick="navigateTo('results')">
           View Live Results
        </button>
      </div>
    `;
  } else {
    // Stats
    const voterUsers = users.filter(u => u.role === 'voter');
    const votedCount = voterUsers.filter(u => u.hasVoted).length;

    content += `
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-icon blue">👥</div>
          <div>
            <div class="stat-value">${candidates.length}</div>
            <div class="stat-label">Candidates</div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon gold"></div>
          <div>
            <div class="stat-value">${totalVotes}</div>
            <div class="stat-label">Total Votes Cast</div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon green"></div>
          <div>
            <div class="stat-value">${voterUsers.length > 0 ? Math.round((votedCount / voterUsers.length) * 100) : 0}%</div>
            <div class="stat-label">Turnout</div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon purple">⏱</div>
          <div>
            <div class="stat-value">${electionActive ? 'Open' : 'Closed'}</div>
            <div class="stat-label">Election Status</div>
          </div>
        </div>
      </div>
    `;

    // Candidate cards
    content += `<div class="candidates-grid" id="candidates-grid">`;
    candidates.forEach((c, i) => {
      const pct = totalVotes > 0 ? Math.round((c.votes / totalVotes) * 100) : 0;
      content += `
        <div class="candidate-card" id="card-${c.id}" style="animation-delay: ${i * 0.08}s" onclick="selectCandidate('${c.id}')">
          <img class="candidate-photo" src="${c.photo}" alt="${c.name}" onerror="this.style.display='none'">
          <div class="candidate-name">${c.name}</div>
          <div class="candidate-position">${c.position}</div>
          <div class="candidate-slogan">${c.slogan}</div>
          <div class="candidate-votes">
            <span class="vote-count">${c.votes}</span> votes · ${pct}%
          </div>
          <div class="vote-bar-container">
            <div class="vote-bar" style="width: ${pct}%"></div>
          </div>
          <button class="btn btn-primary btn-vote" id="vote-btn-${c.id}" ${!electionActive ? 'disabled style="opacity:0.5"' : ''} onclick="event.stopPropagation(); confirmVote('${c.id}')">
            ${electionActive ? '✓ Vote for ' + c.name.split(' ')[0] : 'Voting Closed'}
          </button>
        </div>
      `;
    });
    content += `</div>`;
  }

  main.innerHTML = content;
}

let selectedCandidateId = null;

function selectCandidate(id) {
  selectedCandidateId = id;
  document.querySelectorAll('.candidate-card').forEach(card => card.classList.remove('selected'));
  const card = document.getElementById('card-' + id);
  if (card) card.classList.add('selected');
}

function confirmVote(candidateId) {
  const candidates = Store.get('candidates');
  const candidate = candidates.find(c => c.id === candidateId);
  if (!candidate) return;

  if (!Store.get('electionActive')) {
    showToast('Voting is currently closed.', 'error');
    return;
  }

  // Show confirmation modal
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.id = 'vote-modal';
  overlay.innerHTML = `
    <div class="modal-card">
      <h2>Confirm Your Vote</h2>
      <p>You are about to vote for <strong style="color: var(--gold-400);">${candidate.name}</strong> (${candidate.position}). This action cannot be undone.</p>
      <div class="modal-actions">
        <button class="btn btn-outline" onclick="closeModal()">Cancel</button>
        <button class="btn btn-success" onclick="castVote('${candidateId}')">✓ Confirm Vote</button>
      </div>
    </div>
  `;
  document.body.appendChild(overlay);
}

function closeModal() {
  const modal = document.getElementById('vote-modal');
  if (modal) modal.remove();
}

function castVote(candidateId) {
  closeModal();

  // Update candidate votes
  const candidates = Store.get('candidates');
  const candidate = candidates.find(c => c.id === candidateId);
  if (candidate) {
    candidate.votes += 1;
    Store.set('candidates', candidates);
  }

  // Mark user as voted
  const users = Store.get('users');
  const user = users.find(u => u.id === currentUser.id);
  if (user) {
    user.hasVoted = true;
    user.votedFor = candidateId;
    Store.set('users', users);
    currentUser = user;
  }

  logActivity(`${currentUser.name} voted for ${candidate.name}`);
  showToast(`Vote cast for ${candidate.name}!`, 'success');
  renderVotePage();
}

// ── Results Page ──
function renderResultsPage() {
  const main = document.getElementById('main-content');
  const candidates = Store.get('candidates');
  const totalVotes = candidates.reduce((sum, c) => sum + c.votes, 0);

  // Sort by votes descending
  const sorted = [...candidates].sort((a, b) => b.votes - a.votes);

  let content = `
    <div class="page-header">
      <div>
        <h1> Live Election Results</h1>
        <p class="subtitle"><span class="live-dot"></span> Real-time vote tracking — auto-refreshes every 3 seconds</p>
      </div>
      <div class="header-actions">
        <button class="btn btn-outline btn-sm" onclick="renderResultsPage()">🔄 Refresh</button>
      </div>
    </div>
  `;

  // Stats
  const users = Store.get('users');
  const voterUsers = users.filter(u => u.role === 'voter');
  const votedCount = voterUsers.filter(u => u.hasVoted).length;

  content += `
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-icon gold"></div>
        <div>
          <div class="stat-value">${totalVotes}</div>
          <div class="stat-label">Total Votes</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon blue"></div>
        <div>
          <div class="stat-value">${votedCount} / ${voterUsers.length}</div>
          <div class="stat-label">Voters Participated</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon green"></div>
        <div>
          <div class="stat-value">${voterUsers.length > 0 ? Math.round((votedCount / voterUsers.length) * 100) : 0}%</div>
          <div class="stat-label">Voter Turnout</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon purple"></div>
        <div>
          <div class="stat-value">${sorted.length > 0 && sorted[0].votes > 0 ? sorted[0].name.split(' ')[0] : '—'}</div>
          <div class="stat-label">Leading Candidate</div>
        </div>
      </div>
    </div>
  `;

  // Results list
  content += `
    <div class="results-section">
      <div class="results-card">
        <h2><span class="live-dot"></span> Vote Distribution</h2>
  `;

  sorted.forEach((c, i) => {
    const pct = totalVotes > 0 ? ((c.votes / totalVotes) * 100).toFixed(1) : '0.0';
    content += `
      <div class="result-item">
        <div class="result-rank">${i + 1}</div>
        <img class="result-photo" src="${c.photo}" alt="${c.name}" onerror="this.style.display='none'">
        <div class="result-info">
          <div class="result-name">${c.name} <span style="color: var(--text-muted); font-weight: 400; font-size: 0.75rem;">· ${c.position}</span></div>
          <div class="result-bar-wrapper">
            <div class="result-bar-bg">
              <div class="result-bar-fill" style="width: ${pct}%"></div>
            </div>
          </div>
        </div>
        <div class="result-percent">${pct}%</div>
        <div style="min-width: 50px; text-align: right; font-family: var(--font-display); font-weight: 700; font-size: 0.875rem; color: var(--text-secondary);">
          ${c.votes}
        </div>
      </div>
    `;
  });

  content += `
      </div>
    </div>
  `;

  main.innerHTML = content;

  // Auto-refresh results every 3 seconds
  clearInterval(window._resultsInterval);
  window._resultsInterval = setInterval(() => {
    if (currentPage === 'results') {
      renderResultsPage();
    } else {
      clearInterval(window._resultsInterval);
    }
  }, 3000);
}

// ── Admin: Election Control Page ──
function renderAdminPage() {
  if (currentUser.role !== 'admin') {
    showToast('Access denied: Admin only', 'error');
    navigateTo('vote');
    return;
  }

  const main = document.getElementById('main-content');
  const electionActive = Store.get('electionActive');
  const candidates = Store.get('candidates');
  const users = Store.get('users');
  const totalVotes = candidates.reduce((sum, c) => sum + c.votes, 0);
  const voterUsers = users.filter(u => u.role === 'voter');
  const votedCount = voterUsers.filter(u => u.hasVoted).length;
  const activityLog = Store.get('activityLog') || [];

  let content = `
    <div class="page-header">
      <div>
        <h1>Election Control Panel</h1>
        <p class="subtitle">Manage election settings, monitor activity, and ensure vote integrity</p>
      </div>
    </div>

    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-icon blue"></div>
        <div>
          <div class="stat-value">${users.length}</div>
          <div class="stat-label">Registered Users</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon gold"></div>
        <div>
          <div class="stat-value">${totalVotes}</div>
          <div class="stat-label">Votes Cast</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon green"></div>
        <div>
          <div class="stat-value">${voterUsers.length > 0 ? Math.round((votedCount / voterUsers.length) * 100) : 0}%</div>
          <div class="stat-label">Turnout Rate</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon purple"></div>
        <div>
          <div class="stat-value">${votedCount === totalVotes ? '✓' : '⚠️'}</div>
          <div class="stat-label">Vote Integrity</div>
        </div>
      </div>
    </div>

    <div class="admin-section">
      <!-- Election Controls -->
      <div class="control-card">
        <h3>Election Status</h3>
        <div class="control-row">
          <span class="election-status-badge ${electionActive ? 'active' : 'closed'}">
            ${electionActive ? 'Voting is OPEN' : 'Voting is CLOSED'}
          </span>
          <button class="btn ${electionActive ? 'btn-danger' : 'btn-success'} btn-sm" onclick="toggleElection()">
            ${electionActive ? 'Close Voting' : 'Open Voting'}
          </button>
          <button class="btn btn-outline btn-sm" onclick="resetElection()" style="margin-left: auto;">
             Reset Election
          </button>
        </div>
      </div>

      <!-- Activity Log -->
      <div class="control-card">
        <h3> Activity Log</h3>
        <div class="activity-log" id="activity-log">
  `;

  activityLog.slice(0, 20).forEach(entry => {
    const time = new Date(entry.time).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    content += `
      <div class="activity-item">
        <span class="activity-time">${time}</span>
        <span class="activity-msg">${entry.msg}</span>
      </div>
    `;
  });

  content += `
        </div>
      </div>
    </div>
  `;

  main.innerHTML = content;
}

function toggleElection() {
  const current = Store.get('electionActive');
  Store.set('electionActive', !current);
  logActivity(`Election ${!current ? 'opened' : 'closed'} by ${currentUser.name}`);
  showToast(`Election ${!current ? 'opened' : 'closed'} successfully`, 'success');
  renderAdminPage();
}

function resetElection() {
  // Show confirm modal
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.id = 'vote-modal';
  overlay.innerHTML = `
    <div class="modal-card">
      <h2>Reset Election</h2>
      <p>This will reset all votes and voter statuses. This action cannot be undone. Are you sure?</p>
      <div class="modal-actions">
        <button class="btn btn-outline" onclick="closeModal()">Cancel</button>
        <button class="btn btn-danger" onclick="doResetElection()">🔄 Reset Now</button>
      </div>
    </div>
  `;
  document.body.appendChild(overlay);
}

function doResetElection() {
  closeModal();

  // Reset candidates
  const candidates = Store.get('candidates');
  candidates.forEach(c => c.votes = 0);
  Store.set('candidates', candidates);

  // Reset voters
  const users = Store.get('users');
  users.forEach(u => {
    if (u.role === 'voter') {
      u.hasVoted = false;
      u.votedFor = null;
    }
  });
  Store.set('users', users);

  Store.set('electionActive', true);
  logActivity(`Election reset by ${currentUser.name}`);
  showToast('Election reset successfully!', 'success');
  renderAdminPage();
}

// ── Admin: Voter Registry ──
function renderVotersPage() {
  if (currentUser.role !== 'admin') {
    showToast('Access denied: Admin only', 'error');
    navigateTo('vote');
    return;
  }

  const main = document.getElementById('main-content');
  const users = Store.get('users');

  let content = `
    <div class="page-header">
      <div>
        <h1>Voter Registry</h1>
        <p class="subtitle">View all registered users and their voting status</p>
      </div>
    </div>

    <div class="control-card">
      <table class="voters-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Role</th>
            <th>Vote Status</th>
          </tr>
        </thead>
        <tbody>
  `;

  users.forEach(u => {
    content += `
      <tr>
        <td style="color: var(--text-primary); font-weight: 500;">${u.name}</td>
        <td>${u.email}</td>
        <td><span class="badge ${u.role === 'admin' ? 'admin-badge' : 'voter-badge'}">${u.role}</span></td>
        <td>
          ${u.role === 'voter' ?
        `<span class="badge ${u.hasVoted ? 'voted' : 'not-voted'}">${u.hasVoted ? '✓ Voted' : 'Pending'}</span>` :
        '<span style="color: var(--text-muted); font-size: 0.75rem;">N/A</span>'
      }
        </td>
      </tr>
    `;
  });

  content += `
        </tbody>
      </table>
    </div>
  `;

  main.innerHTML = content;
}

// ── Voice-Assisted Voting ──
let recognition = null;
let isListening = false;

function toggleVoiceRecognition() {
  // Check browser support
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SpeechRecognition) {
    showToast('Voice recognition is not supported in this browser. Try Chrome.', 'error');
    return;
  }

  if (isListening) {
    stopVoiceRecognition();
    return;
  }

  recognition = new SpeechRecognition();
  recognition.continuous = false;
  recognition.interimResults = true;
  recognition.lang = 'en-US';

  const voiceBtn = document.getElementById('voice-btn');
  const voiceStatus = document.getElementById('voice-status');
  const voiceTranscript = document.getElementById('voice-transcript');

  voiceBtn.classList.add('listening');
  voiceStatus.textContent = 'Listening... Speak now';
  voiceStatus.classList.add('active');
  isListening = true;

  // Text-to-Speech: announce candidates
  speak('Please say the name of the candidate you wish to vote for.');

  recognition.onresult = (event) => {
    let transcript = '';
    for (let i = event.resultIndex; i < event.results.length; i++) {
      transcript += event.results[i][0].transcript;
    }
    voiceTranscript.textContent = `"${transcript}"`;

    // Check if final result
    if (event.results[event.results.length - 1].isFinal) {
      processVoiceCommand(transcript.toLowerCase().trim());
    }
  };

  recognition.onerror = (event) => {
    console.error('Voice error:', event.error);
    if (event.error === 'not-allowed') {
      showToast('Microphone access denied. Please allow microphone permissions.', 'error');
    } else if (event.error !== 'aborted') {
      showToast('Voice recognition error. Please try again.', 'error');
    }
    stopVoiceRecognition();
  };

  recognition.onend = () => {
    stopVoiceRecognition();
  };

  recognition.start();
}

function stopVoiceRecognition() {
  isListening = false;
  if (recognition) {
    try { recognition.stop(); } catch { }
  }
  const voiceBtn = document.getElementById('voice-btn');
  const voiceStatus = document.getElementById('voice-status');
  if (voiceBtn) voiceBtn.classList.remove('listening');
  if (voiceStatus) {
    voiceStatus.textContent = 'Click to start listening';
    voiceStatus.classList.remove('active');
  }
}

function processVoiceCommand(text) {
  const candidates = Store.get('candidates');

  // Try to find a matching candidate
  let matchedCandidate = null;

  for (const c of candidates) {
    const names = c.name.toLowerCase().split(' ');
    const fullName = c.name.toLowerCase();

    if (text.includes(fullName) || names.some(n => n.length > 2 && text.includes(n))) {
      matchedCandidate = c;
      break;
    }
  }

  if (matchedCandidate) {
    speak(`You selected ${matchedCandidate.name}. Opening confirmation.`);
    showToast(`Voice recognized: ${matchedCandidate.name}`, 'success');
    selectCandidate(matchedCandidate.id);

    // Small delay then open confirm
    setTimeout(() => {
      confirmVote(matchedCandidate.id);
    }, 800);
  } else {
    speak('Sorry, I could not recognize a candidate name. Please try again.');
    showToast('Could not match a candidate. Try saying their full name.', 'error');
  }
}

function speak(text) {
  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.95;
    utterance.pitch = 1;
    utterance.volume = 0.8;
    window.speechSynthesis.speak(utterance);
  }
}
