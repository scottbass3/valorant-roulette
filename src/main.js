import { loadData }             from './data/loader.js';
import { shuffle, sleep }        from './utils/random.js';
import { resumeAudio, preloadSounds, playShuffleWhoosh } from './utils/sound.js';
import { animatePlayerShuffle }  from './animations/playerShuffle.js';
import { animateCaseOpening }    from './animations/caseOpening.js';
import { getAgentColorByRole }   from './utils/agentColor.js';

// ─── State ───────────────────────────────────────────────────────────────────
const state = {
  players: [],
  agents: [],
  orderedPlayers: [],
  assignments: {},  // playerId → agent
  usedAgents: new Set(),
  currentIdx: 0,
  spinning: false,
};

// ─── DOM refs ─────────────────────────────────────────────────────────────────
const $ = id => document.getElementById(id);

const shuffleSection   = $('shuffle-section');
const shuffleCards     = $('shuffle-cards');
const selectionLayout  = $('selection-layout');
const sidebarPlayers   = $('sidebar-players');
const currentNameEl    = $('current-player-name');
const reelTrack        = $('reel-track');
const openingResult    = $('opening-result');
const openingResultTxt = $('opening-result-text');
const rouletteControls = $('roulette-controls');
const ctrlSpin         = $('ctrl-spin');
const ctrlReveal       = $('ctrl-reveal');
const ctrlDone         = $('ctrl-done');
const btnStart         = $('btn-start');
const btnReset         = $('btn-reset');
const btnSpin          = $('btn-spin');
const btnReroll        = $('btn-reroll');
const btnRerollLast    = $('btn-reroll-last');
const btnNext          = $('btn-next');
const btnFinish        = $('btn-finish');
const allowDuplicates  = $('allow-duplicates');

// ─── Init ─────────────────────────────────────────────────────────────────────
async function init() {
  const [data] = await Promise.all([loadData(), preloadSounds()]);
  state.players = data.players;
  state.agents  = data.agents;
  setupControls();
}

function setupControls() {
  btnStart.addEventListener('click', async () => {
    await resumeAudio();
    startDraw();
  });

  btnReset.addEventListener('click', resetAll);

  btnSpin.addEventListener('click', () => triggerSpin());
  btnReroll.addEventListener('click', () => triggerReroll());
  btnRerollLast.addEventListener('click', () => triggerReroll());
  btnNext.addEventListener('click', () => advanceToNext());
  btnFinish.addEventListener('click', () => finish());

  document.addEventListener('keydown', e => {
    if (e.code !== 'Space' && e.code !== 'Enter') return;
    if (e.target.tagName === 'BUTTON' || e.target.tagName === 'INPUT') return;
    e.preventDefault();

    const spinVisible   = !ctrlSpin.classList.contains('hidden');
    const revealVisible = !ctrlReveal.classList.contains('hidden');
    const doneVisible   = !ctrlDone.classList.contains('hidden');

    if (spinVisible)   triggerSpin();
    else if (revealVisible) advanceToNext();
    else if (doneVisible)   finish();
  });
}

// ─── Draw flow ────────────────────────────────────────────────────────────────
async function startDraw() {
  if (state.spinning) return;

  state.orderedPlayers = shuffle([...state.players]);
  state.assignments    = {};
  state.usedAgents     = new Set();
  state.currentIdx     = 0;

  hide(btnStart);
  show(btnReset);

  // 1. Shuffle animation (full width)
  show(shuffleSection);
  shuffleSection.scrollIntoView({ behavior: 'smooth' });
  await sleep(200);
  await animatePlayerShuffle(state.orderedPlayers, shuffleCards);
  await sleep(300);

  // 2. Transition to 2-column layout
  await transitionToSelection();
}

async function transitionToSelection() {
  // Fade out shuffle section
  shuffleSection.style.transition = 'opacity 0.35s ease';
  shuffleSection.style.opacity = '0';
  await sleep(360);
  hide(shuffleSection);
  shuffleSection.style.opacity = '';
  shuffleSection.style.transition = '';

  // Build sidebar (all cards invisible to start)
  buildSidebar(state.orderedPlayers);

  // Reveal layout (instant, no flash)
  selectionLayout.classList.remove('hidden');
  selectionLayout.style.opacity = '0';
  await sleep(30);
  selectionLayout.style.transition = 'opacity 0.3s ease';
  selectionLayout.style.opacity = '1';
  selectionLayout.scrollIntoView({ behavior: 'smooth' });
  await sleep(320);
  selectionLayout.style.transition = '';

  // Animate sidebar cards in one by one
  const cards = sidebarPlayers.querySelectorAll('.sidebar-player');
  for (const card of cards) {
    card.style.transition = 'opacity 0.22s ease, transform 0.22s ease';
    card.style.opacity = '1';
    card.style.transform = 'translateX(0)';
    playShuffleWhoosh();
    await sleep(90);
  }

  await sleep(200);

  // Prepare first player
  loadPlayer(state.orderedPlayers[0]);
  showCtrl('spin');
}

function loadPlayer(player) {
  currentNameEl.textContent = player.name;
  hide(openingResult);
  reelTrack.innerHTML = '';

  // Highlight active sidebar card
  sidebarPlayers.querySelectorAll('.sidebar-player').forEach(c => c.classList.remove('active'));
  const activeCard = sidebarPlayers.querySelector(`[data-player-id="${player.id}"]`);
  if (activeCard) {
    activeCard.classList.add('active');
    activeCard.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }
}

// ─── Spin ─────────────────────────────────────────────────────────────────────
async function triggerSpin() {
  if (state.spinning) return;
  state.spinning = true;
  btnSpin.disabled = true;

  const player    = state.orderedPlayers[state.currentIdx];
  const available = getAvailableAgents();

  if (!available.length) {
    showToast('Plus d\'agents disponibles !');
    state.spinning  = false;
    btnSpin.disabled = false;
    return;
  }

  const agent = available[Math.floor(Math.random() * available.length)];
  showCtrl(null); // hide all controls during spin

  await animateCaseOpening(agent, state.agents, reelTrack);

  // Record
  state.assignments[player.id] = agent;
  if (!allowDuplicates.checked) state.usedAgents.add(agent.id);

  // Reveal in sidebar
  revealAgentInSidebar(player, agent);

  // Show result text
  const colors = getAgentColorByRole(agent.role);
  openingResultTxt.textContent = `${player.name}  →  ${agent.name}`;
  openingResultTxt.style.color = colors.text;
  openingResult.classList.remove('hidden');
  openingResult.style.animation = 'none';
  void openingResult.offsetWidth;
  openingResult.style.animation = '';

  const isLast = state.currentIdx === state.orderedPlayers.length - 1;
  showCtrl(isLast ? 'done' : 'reveal');

  btnSpin.disabled = false;
  state.spinning = false;
}

async function triggerReroll() {
  if (state.spinning) return;

  const player = state.orderedPlayers[state.currentIdx];
  const agent  = state.assignments[player.id];

  // Return current agent to pool
  if (agent && !allowDuplicates.checked) state.usedAgents.delete(agent.id);
  delete state.assignments[player.id];

  resetSidebarCard(player);
  hide(openingResult);
  reelTrack.innerHTML = '';
  showCtrl('spin');

  await triggerSpin();
}

function advanceToNext() {
  state.currentIdx++;
  if (state.currentIdx >= state.orderedPlayers.length) { finish(); return; }
  loadPlayer(state.orderedPlayers[state.currentIdx]);
  showCtrl('spin');
}

function finish() {
  showCtrl(null);
  hide(openingResult);
  showToast('Tirage terminé !');
}

// ─── Sidebar ─────────────────────────────────────────────────────────────────
function buildSidebar(players) {
  sidebarPlayers.innerHTML = '';
  players.forEach((player, i) => {
    const card = document.createElement('div');
    card.className = 'sidebar-player';
    card.dataset.playerId = player.id;
    // Start invisible+shifted for cascade animation
    card.style.opacity = '0';
    card.style.transform = 'translateX(-14px)';
    card.innerHTML = `
      <div class="sp-rank">${i + 1}</div>
      <div class="sp-info">
        <div class="sp-avatar">
          <img src="${player.avatar}" alt="${player.name}"
               onerror="this.style.display='none';this.nextElementSibling.style.display='flex'">
          <div class="sp-avatar-fallback" style="display:none">${player.name[0].toUpperCase()}</div>
        </div>
        <div class="sp-name">${player.name}</div>
      </div>
      <div class="sp-agent-slot sp-agent-slot--pending">?</div>
    `;
    sidebarPlayers.appendChild(card);
  });
}

function revealAgentInSidebar(player, agent) {
  const card = sidebarPlayers.querySelector(`[data-player-id="${player.id}"]`);
  if (!card) return;
  const colors = getAgentColorByRole(agent.role);
  const slot = card.querySelector('.sp-agent-slot');
  slot.className = 'sp-agent-slot sp-agent-slot--revealed';
  slot.style.borderColor = colors.border;
  slot.innerHTML = `
    <div class="sp-agent-img">
      <img src="${agent.image}" alt="${agent.name}"
           onerror="this.style.display='none';this.nextElementSibling.style.display='flex'">
      <div class="sp-agent-fallback" style="display:none;color:${colors.text}">${agent.name[0]}</div>
    </div>
    <span class="sp-agent-name" style="color:${colors.text}">${agent.name}</span>
  `;
  card.classList.remove('active');
  card.classList.add('revealed');
}

function resetSidebarCard(player) {
  const card = sidebarPlayers.querySelector(`[data-player-id="${player.id}"]`);
  if (!card) return;
  const slot = card.querySelector('.sp-agent-slot');
  slot.className = 'sp-agent-slot sp-agent-slot--pending';
  slot.style.borderColor = '';
  slot.textContent = '?';
  card.classList.remove('revealed');
  card.classList.add('active');
}

// ─── Helpers ─────────────────────────────────────────────────────────────────
function getAvailableAgents() {
  return state.agents.filter(a => !state.usedAgents.has(a.id));
}

function showCtrl(name) {
  ctrlSpin.classList.add('hidden');
  ctrlReveal.classList.add('hidden');
  ctrlDone.classList.add('hidden');
  if (name === 'spin')   ctrlSpin.classList.remove('hidden');
  if (name === 'reveal') ctrlReveal.classList.remove('hidden');
  if (name === 'done')   ctrlDone.classList.remove('hidden');
}

function show(el) { el.classList.remove('hidden'); }
function hide(el) { el.classList.add('hidden'); }

function showToast(msg) {
  const toast = $('toast');
  toast.textContent = msg;
  toast.classList.remove('hidden');
  setTimeout(() => toast.classList.add('hidden'), 3000);
}

function resetAll() {
  state.orderedPlayers = [];
  state.assignments    = {};
  state.usedAgents     = new Set();
  state.currentIdx     = 0;
  state.spinning       = false;

  hide(shuffleSection);
  hide(selectionLayout);
  hide(openingResult);
  hide(btnReset);
  show(btnStart);
  showCtrl('spin');

  shuffleCards.innerHTML   = '';
  sidebarPlayers.innerHTML = '';
  reelTrack.innerHTML      = '';

  shuffleSection.style.opacity     = '';
  selectionLayout.style.opacity    = '';
  selectionLayout.style.transform  = '';
  selectionLayout.style.transition = '';
}

init();
