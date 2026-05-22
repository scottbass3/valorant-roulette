import { sleep } from '../utils/random.js';
import { playShuffleWhoosh } from '../utils/sound.js';

const CARD_W = 120;
const CARD_H = 165;

function buildCard(player) {
  const el = document.createElement('div');
  el.className  = 'shuffle-card';
  el.dataset.id = player.id;
  el.innerHTML  = `
    <div class="sc-inner">
      <div class="sc-initials">${player.name[0].toUpperCase()}</div>
      <div class="sc-name">${player.name}</div>
    </div>
  `;
  return el;
}

export async function animatePlayerShuffle(players, container) {
  container.innerHTML = '';

  const cards = players.map(buildCard);
  cards.forEach(c => container.appendChild(c));

  const arena = container.parentElement;
  const aw = arena.offsetWidth;
  const ah = Math.max(arena.offsetHeight, 300);

  // Phase 1: cards fly in from random edges, stacked near center
  cards.forEach((card, i) => {
    const side = i % 4;
    let startX, startY;
    if      (side === 0) { startX = -200;      startY = Math.random() * ah; }
    else if (side === 1) { startX = aw + 200;  startY = Math.random() * ah; }
    else if (side === 2) { startX = Math.random() * aw; startY = -200; }
    else                 { startX = Math.random() * aw; startY = ah + 200; }

    const stackX = aw / 2 - CARD_W / 2 + (i - (players.length - 1) / 2) * 8;
    const stackY = ah / 2 - CARD_H / 2 + (i - (players.length - 1) / 2) * 4;
    const rot    = (Math.random() - 0.5) * 20;

    card.style.cssText = `
      position:absolute;
      width:${CARD_W}px; height:${CARD_H}px;
      left:${startX}px; top:${startY}px;
      transform: rotate(${rot}deg);
      transition: left 0.5s cubic-bezier(.25,.46,.45,.94),
                  top 0.5s cubic-bezier(.25,.46,.45,.94),
                  transform 0.5s ease;
      transition-delay: ${i * 0.08}s;
      z-index: ${i};
    `;
    requestAnimationFrame(() => {
      card.style.left = `${stackX}px`;
      card.style.top  = `${stackY}px`;
    });
  });

  await sleep(800 + players.length * 80);

  // Phase 2: shuffle chaos
  for (let round = 0; round < 4; round++) {
    playShuffleWhoosh();
    cards.forEach(card => {
      const rx  = aw / 2 - CARD_W / 2 + (Math.random() - 0.5) * 180;
      const ry  = ah / 2 - CARD_H / 2 + (Math.random() - 0.5) * 100;
      const rot = (Math.random() - 0.5) * 40;
      card.style.transition = 'left 0.2s ease, top 0.2s ease, transform 0.2s ease';
      card.style.left      = `${rx}px`;
      card.style.top       = `${ry}px`;
      card.style.transform = `rotate(${rot}deg)`;
    });
    await sleep(250);
  }

  await sleep(300);

  // Phase 3: fan out in arc
  cards.forEach((card, i) => {
    const total  = players.length;
    const spread = Math.min(aw * 0.7, 600);
    const step   = spread / (total - 1 || 1);
    const fx     = aw / 2 - spread / 2 + i * step;
    const fy     = ah / 2 - CARD_H / 2 - Math.sin((i / (total - 1)) * Math.PI) * 30;
    const rot    = (i - (total - 1) / 2) * 5;
    card.style.transition = 'left 0.5s cubic-bezier(.34,1.56,.64,1), top 0.5s cubic-bezier(.34,1.56,.64,1), transform 0.5s ease';
    card.style.left       = `${fx}px`;
    card.style.top        = `${fy}px`;
    card.style.transform  = `rotate(${rot}deg)`;
    card.style.zIndex     = total - Math.abs(i - (total - 1) / 2);
  });

  await sleep(700);

  // Fade out
  cards.forEach(card => {
    card.style.transition = 'opacity 0.35s ease, transform 0.35s ease';
    card.style.opacity    = '0';
    card.style.transform += ' scale(0.9)';
  });

  await sleep(380);
  container.innerHTML = '';
}
