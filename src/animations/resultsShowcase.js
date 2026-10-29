import { sleep } from '../utils/random.js';
import { playScroll, playReveal } from '../utils/sound.js';
import { getAgentColorByRole } from '../utils/agentColor.js';
import { t } from '../i18n.js';

function buildResultCard(player, agent, rank) {
  const colors = getAgentColorByRole(agent.role);
  const card = document.createElement('div');
  card.className = 'result-card';
  card.style.setProperty('--win', colors.border);
  card.innerHTML = `
    <div class="result-rank">${rank}</div>
    <div class="result-portrait">
      <img src="${agent.image}" alt="${agent.name}"
           onerror="this.style.display='none';this.nextElementSibling.style.display='flex'">
      <div class="result-fallback" style="display:none;color:${colors.text}">${agent.name[0]}</div>
    </div>
    <div class="result-player">${player.name}</div>
    <div class="result-agent" style="color:${colors.text}">${agent.name}</div>
    <div class="result-role" style="color:${colors.text}">${agent.role}</div>
  `;
  return card;
}

// Full-screen recap shown when the draw is validated: every player with the
// agent they landed, revealed one card at a time.
export async function showResultsShowcase(orderedPlayers, assignments, { onRestart } = {}) {
  document.querySelector('.results-overlay')?.remove();

  const overlay = document.createElement('div');
  overlay.className = 'results-overlay';
  overlay.innerHTML = `
    <div class="results-backdrop"></div>
    <div class="results-panel">
      <h2 class="results-title">${t('results-title')}</h2>
      <div class="results-grid"></div>
      <div class="results-actions">
        <button class="btn btn-secondary results-close">✕ ${t('results-close')}</button>
        <button class="btn btn-primary results-restart">${t('btn-reset')}</button>
      </div>
    </div>
  `;
  document.body.appendChild(overlay);

  const grid  = overlay.querySelector('.results-grid');
  const cards = [];
  orderedPlayers.forEach((player, i) => {
    const agent = assignments[player.id];
    if (!agent) return;
    const card = buildResultCard(player, agent, i + 1);
    grid.appendChild(card);
    cards.push(card);
  });

  // Fade the overlay in
  void overlay.offsetWidth;
  overlay.classList.add('visible');

  const close = () => {
    overlay.classList.remove('visible');
    document.removeEventListener('keydown', onKey);
    setTimeout(() => overlay.remove(), 300);
  };
  const onKey = (e) => { if (e.key === 'Escape') close(); };
  document.addEventListener('keydown', onKey);

  overlay.querySelector('.results-backdrop').addEventListener('click', close);
  overlay.querySelector('.results-close').addEventListener('click', close);
  overlay.querySelector('.results-restart').addEventListener('click', () => {
    close();
    onRestart?.();
  });

  // Reveal the cards one by one
  await sleep(220);
  for (const card of cards) {
    card.classList.add('in');
    playScroll();
    await sleep(150);
  }
  playReveal();
}
