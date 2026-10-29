import { sleep } from '../utils/random.js';
import { playShuffleWhoosh } from '../utils/sound.js';

const CARD_W = 120;
const CARD_H = 165;
const EASE_OUT    = 'cubic-bezier(.22,.61,.36,1)';
const EASE_SPRING = 'cubic-bezier(.34,1.56,.64,1)';

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
  const n  = players.length;

  // Shared fixed origin (deck centre). Everything else is a GPU-composited
  // transform, which is far smoother than animating left/top.
  const cx = aw / 2 - CARD_W / 2;
  const cy = ah / 2 - CARD_H / 2;
  const place = (card, x, y, rot = 0, scale = 1) => {
    card.style.transform =
      `translate3d(${x}px, ${y}px, 0) rotate(${rot}deg) scale(${scale})`;
  };

  // Phase 0: park each card off-screen on an alternating edge
  cards.forEach((card, i) => {
    const side = i % 4;
    let sx, sy;
    if      (side === 0) { sx = -aw * 0.6; sy = (Math.random() - 0.5) * ah; }
    else if (side === 1) { sx =  aw * 0.6; sy = (Math.random() - 0.5) * ah; }
    else if (side === 2) { sx = (Math.random() - 0.5) * aw; sy = -ah * 0.7; }
    else                 { sx = (Math.random() - 0.5) * aw; sy =  ah * 0.7; }

    card.style.cssText = `
      position:absolute; left:${cx}px; top:${cy}px;
      width:${CARD_W}px; height:${CARD_H}px;
      will-change: transform, opacity;
      z-index:${i};
    `;
    place(card, sx, sy, (Math.random() - 0.5) * 60, 0.8);
    card.style.opacity = '0';
  });

  await new Promise(r => requestAnimationFrame(r));

  // Phase 1: fly in and settle into a neat stacked deck, staggered
  cards.forEach((card, i) => {
    const off = i - (n - 1) / 2;
    card.style.transition =
      `transform .55s ${EASE_OUT} ${i * 0.06}s, opacity .3s ease ${i * 0.06}s`;
    card.style.opacity = '1';
    place(card, off * 6, off * 3, off * 1.5);
  });

  await sleep(600 + n * 60);

  // Phase 2: riffle shuffle — quick, tight, snappy
  for (let round = 0; round < 4; round++) {
    playShuffleWhoosh();
    cards.forEach(card => {
      const rx  = (Math.random() - 0.5) * 220;
      const ry  = (Math.random() - 0.5) * 120;
      const rot = (Math.random() - 0.5) * 36;
      card.style.transition = `transform .22s ${EASE_OUT}`;
      place(card, rx, ry, rot, 0.96 + Math.random() * 0.08);
      card.style.zIndex = Math.floor(Math.random() * n);
    });
    await sleep(230);
  }

  // Gather back to centre before the reveal
  cards.forEach((card, i) => {
    const off = i - (n - 1) / 2;
    card.style.transition = `transform .25s ${EASE_OUT}`;
    place(card, off * 4, off * 2, off);
  });
  await sleep(280);

  // Phase 3: fan out in an arc with a spring
  cards.forEach((card, i) => {
    const spread = Math.min(aw * 0.72, 620);
    const step   = spread / (n - 1 || 1);
    const fx     = -spread / 2 + i * step;
    const arc    = Math.sin((i / (n - 1 || 1)) * Math.PI);
    const fy     = -arc * 42;
    const rot    = (i - (n - 1) / 2) * 5;
    card.style.transition = `transform .6s ${EASE_SPRING} ${i * 0.04}s`;
    place(card, fx, fy, rot, 1.04);
    card.style.zIndex = n - Math.abs(Math.round(i - (n - 1) / 2));
  });

  await sleep(700 + n * 40);

  // Fade out, lifting up slightly
  cards.forEach((card, i) => {
    const spread = Math.min(aw * 0.72, 620);
    const step   = spread / (n - 1 || 1);
    const fx     = -spread / 2 + i * step;
    const rot    = (i - (n - 1) / 2) * 5;
    card.style.transition = `transform .4s ${EASE_OUT}, opacity .4s ease`;
    card.style.opacity = '0';
    place(card, fx, -40, rot, 0.85);
  });

  await sleep(420);
  container.innerHTML = '';
}
