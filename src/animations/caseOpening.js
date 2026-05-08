import { shuffle, sleep } from '../utils/random.js';
import { playScroll, playReveal, resumeAudio } from '../utils/sound.js';
import { getAgentColorByRole } from '../utils/agentColor.js';

const CARD_WIDTH  = 140;
const CARD_MARGIN = 10;
const CARD_STEP   = CARD_WIDTH + CARD_MARGIN * 2;
const REEL_COUNT  = 50;
const STOP_INDEX  = 42;
const DURATION    = 6000;

function buildAgentCard(agent) {
  const colors = getAgentColorByRole(agent.role);
  const el = document.createElement('div');
  el.className = 'reel-card';
  el.style.background = colors.bg;
  el.style.borderColor = colors.border;
  el.innerHTML = `
    <div class="reel-card-role" style="color:${colors.text}">${agent.role}</div>
    <div class="reel-card-img">
      <img src="${agent.image}" alt="${agent.name}"
           onerror="this.style.display='none';this.nextElementSibling.style.display='flex'">
      <div class="reel-card-fallback" style="display:none;color:${colors.text}">${agent.name[0]}</div>
    </div>
    <div class="reel-card-name" style="color:${colors.text}">${agent.name}</div>
  `;
  return el;
}

function buildReel(allAgents, target) {
  const reel = [];

  // Fill with complete shuffled groups so each agent appears at most once
  // per group — no visible duplicates within any window ≤ agents.length cards
  while (reel.length < REEL_COUNT) {
    const group = shuffle([...allAgents]);
    // Avoid duplicate at the seam between two groups
    if (reel.length > 0 && group[0].id === reel[reel.length - 1].id) {
      const swapIdx = 1 + Math.floor(Math.random() * (group.length - 1));
      [group[0], group[swapIdx]] = [group[swapIdx], group[0]];
    }
    reel.push(...group);
  }

  reel.length = REEL_COUNT;
  reel[STOP_INDEX] = target;

  // Fix the two cards neighbouring the target in case they became the same agent
  const fixNeighbour = (idx) => {
    if (idx < 0 || idx >= REEL_COUNT) return;
    if (reel[idx].id !== target.id) return;
    const forbidden = new Set([target.id, reel[idx - 1]?.id, reel[idx + 1]?.id]);
    const pool = allAgents.filter(a => !forbidden.has(a.id));
    reel[idx] = pool[Math.floor(Math.random() * pool.length)] ?? allAgents[0];
  };

  fixNeighbour(STOP_INDEX - 1);
  fixNeighbour(STOP_INDEX + 1);

  return reel;
}

function easeOutCubic(t) {
  return 1 - Math.pow(1 - t, 3);
}

export async function animateCaseOpening(agent, allAgents, track) {
  await resumeAudio();
  track.innerHTML = '';

  const reel = buildReel(allAgents, agent);
  reel.forEach(a => track.appendChild(buildAgentCard(a)));

  // Wait one frame so the browser has recalculated layout after cards were inserted
  await new Promise(r => requestAnimationFrame(r));

  const container = track.parentElement;
  const viewW = container.getBoundingClientRect().width || container.offsetWidth || 800;
  const centerX = viewW / 2;

  // Stop at a random position inside the winning card (middle 70% to avoid edges)
  const randomOffset = (Math.random() - 0.5) * CARD_WIDTH;
  const targetCenter = STOP_INDEX * CARD_STEP + CARD_STEP / 2 + randomOffset;
  const finalOffset  = centerX - targetCenter;

  // Start position: first card centered
  const startX = centerX - CARD_STEP / 2;

  track.style.transition = 'none';
  track.style.transform  = `translateX(${startX}px)`;
  await sleep(50);

  const totalMove = finalOffset - startX;
  const startTime = performance.now();
  let lastCardIdx = -1;

  await new Promise(resolve => {
    function frame(now) {
      const t      = Math.min((now - startTime) / DURATION, 1);
      const eased  = easeOutCubic(t);
      const currentX = startX + totalMove * eased;

      track.style.transform = `translateX(${currentX}px)`;

      // Which card is currently centered under the cursor?
      const cardIdx = Math.floor((centerX - currentX) / CARD_STEP);
      if (cardIdx !== lastCardIdx && cardIdx >= 0 && cardIdx < REEL_COUNT) {
        lastCardIdx = cardIdx;
        playScroll();
      }

      if (t < 1) {
        requestAnimationFrame(frame);
      } else {
        track.style.transform = `translateX(${finalOffset}px)`;
        resolve();
      }
    }
    requestAnimationFrame(frame);
  });

  // Highlight the winning card
  const cards = track.querySelectorAll('.reel-card');
  cards[STOP_INDEX].classList.add('reel-card--selected');
  playReveal();

  await sleep(800);
}
