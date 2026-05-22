const KEYS = {
  agentNames: 'vr_agent_names',
  players:    'vr_players',
};

// ─── Storage ──────────────────────────────────────────────────────────────────

export function getAgentNames() {
  try { return JSON.parse(localStorage.getItem(KEYS.agentNames) || '{}'); }
  catch { return {}; }
}

function storeAgentName(id, name) {
  const names = getAgentNames();
  if (name) names[id] = name;
  else delete names[id];
  localStorage.setItem(KEYS.agentNames, JSON.stringify(names));
}

export function getStoredPlayers() {
  try {
    const raw = localStorage.getItem(KEYS.players);
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}

export function storePlayers(players) {
  localStorage.setItem(KEYS.players, JSON.stringify(players));
}

// ─── Modal ────────────────────────────────────────────────────────────────────

let _agents    = [];
let _callbacks = {};

export function openConfigModal(agents, { onPlayersChange, onAgentNameChange }) {
  _agents    = agents;
  _callbacks = { onPlayersChange, onAgentNameChange };

  let modal = document.getElementById('config-modal');
  if (!modal) modal = buildModal();

  switchTab(modal, 'players');
  refreshPlayersPane();
  refreshAgentsPane();
  modal.classList.remove('hidden');
}

function switchTab(modal, tab) {
  modal.querySelectorAll('.config-tab').forEach(t => t.classList.toggle('active', t.dataset.tab === tab));
  modal.querySelectorAll('.config-pane').forEach(p => p.classList.toggle('hidden', p.dataset.pane !== tab));
}

function buildModal() {
  const modal = document.createElement('div');
  modal.id        = 'config-modal';
  modal.className = 'config-modal';
  modal.innerHTML = `
    <div class="config-overlay"></div>
    <div class="config-panel">
      <div class="config-header">
        <div class="config-tabs">
          <button class="config-tab active" data-tab="players">JOUEURS</button>
          <button class="config-tab" data-tab="agents">AGENTS</button>
        </div>
        <button class="config-close">✕</button>
      </div>
      <div class="config-body">
        <div class="config-pane" data-pane="players">
          <div id="config-player-list" class="config-player-list"></div>
          <div class="config-add-row">
            <input id="config-new-player" class="config-input" type="text"
                   placeholder="Nom du joueur..." maxlength="32">
            <button class="btn btn-primary" id="config-btn-add">+ AJOUTER</button>
          </div>
        </div>
        <div class="config-pane hidden" data-pane="agents">
          <p class="config-note">Laissez vide pour conserver le nom officiel.</p>
          <div id="config-agent-list" class="config-agent-list"></div>
        </div>
      </div>
    </div>
  `;
  document.body.appendChild(modal);

  modal.querySelectorAll('.config-tab').forEach(tab =>
    tab.addEventListener('click', () => switchTab(modal, tab.dataset.tab))
  );
  modal.querySelector('.config-close').addEventListener('click', () => modal.classList.add('hidden'));
  modal.querySelector('.config-overlay').addEventListener('click', () => modal.classList.add('hidden'));

  const input = modal.querySelector('#config-new-player');
  modal.querySelector('#config-btn-add').addEventListener('click', () => addPlayer(input));
  input.addEventListener('keydown', e => { if (e.key === 'Enter') addPlayer(input); });

  return modal;
}

function addPlayer(input) {
  const name = input.value.trim();
  if (!name) return;
  const players = getStoredPlayers() || [];
  players.push({ id: 'p_' + Date.now(), name });
  storePlayers(players);
  input.value = '';
  refreshPlayersPane();
  _callbacks.onPlayersChange?.(players);
}

function refreshPlayersPane() {
  const list = document.getElementById('config-player-list');
  if (!list) return;
  const players = getStoredPlayers() || [];
  list.innerHTML = '';

  if (!players.length) {
    list.innerHTML = '<p class="config-empty">Aucun joueur configuré.</p>';
    return;
  }

  players.forEach((player, i) => {
    const row = document.createElement('div');
    row.className = 'config-player-row';
    row.innerHTML = `
      <span class="config-rank">${i + 1}</span>
      <input class="config-input" type="text" value="${esc(player.name)}"
             maxlength="32" data-id="${player.id}">
      <button class="config-del" data-id="${player.id}" title="Supprimer">✕</button>
    `;
    list.appendChild(row);
  });

  list.querySelectorAll('input[data-id]').forEach(inp => {
    inp.addEventListener('change', () => {
      const players = getStoredPlayers() || [];
      const p = players.find(p => p.id === inp.dataset.id);
      if (p && inp.value.trim()) {
        p.name = inp.value.trim();
        storePlayers(players);
        _callbacks.onPlayersChange?.(players);
      } else {
        inp.value = p?.name || '';
      }
    });
  });

  list.querySelectorAll('.config-del').forEach(btn => {
    btn.addEventListener('click', () => {
      const players = (getStoredPlayers() || []).filter(p => p.id !== btn.dataset.id);
      storePlayers(players);
      refreshPlayersPane();
      _callbacks.onPlayersChange?.(players);
    });
  });
}

function refreshAgentsPane() {
  const list = document.getElementById('config-agent-list');
  if (!list) return;
  list.innerHTML = '';
  const names = getAgentNames();
  const roles  = [...new Set(_agents.map(a => a.role))];

  roles.forEach(role => {
    const group = document.createElement('div');
    group.className = 'config-agent-group';
    const title = document.createElement('div');
    title.className   = 'config-agent-role';
    title.textContent = role;
    group.appendChild(title);

    _agents.filter(a => a.role === role).forEach(agent => {
      const custom = names[agent.id] || '';
      const row = document.createElement('div');
      row.className = 'config-agent-row';
      row.innerHTML = `
        <img class="config-agent-img" src="${agent.image}"
             alt="${esc(agent.canonicalName)}" onerror="this.style.display='none'">
        <span class="config-canonical">${esc(agent.canonicalName)}</span>
        <input class="config-input config-agent-name-inp" type="text"
               value="${esc(custom)}" placeholder="${esc(agent.canonicalName)}"
               maxlength="32" data-id="${agent.id}">
        <button class="config-reset" data-id="${agent.id}"
                title="Réinitialiser" ${custom ? '' : 'disabled'}>↺</button>
      `;
      group.appendChild(row);
    });

    list.appendChild(group);
  });

  list.querySelectorAll('.config-agent-name-inp').forEach(inp => {
    inp.addEventListener('input', () => {
      inp.parentElement.querySelector('.config-reset').disabled = !inp.value.trim();
    });
    inp.addEventListener('change', () => {
      const name = inp.value.trim();
      storeAgentName(inp.dataset.id, name);
      inp.parentElement.querySelector('.config-reset').disabled = !name;
      _callbacks.onAgentNameChange?.(inp.dataset.id, name || null);
    });
  });

  list.querySelectorAll('.config-reset').forEach(btn => {
    btn.addEventListener('click', () => {
      storeAgentName(btn.dataset.id, '');
      const inp = btn.parentElement.querySelector('.config-agent-name-inp');
      inp.value  = '';
      btn.disabled = true;
      _callbacks.onAgentNameChange?.(btn.dataset.id, null);
    });
  });
}

function esc(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
