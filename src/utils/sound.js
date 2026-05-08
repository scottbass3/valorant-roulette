let ctx = null;
const rawData = {};    // name → ArrayBuffer (fetched at init, no AudioContext needed)
const buffers = {};    // name → AudioBuffer  (decoded after first interaction)

function getCtx() {
  if (!ctx) ctx = new (window.AudioContext || window.webkitAudioContext)();
  return ctx;
}

// ─── Preload: only HTTP fetch, no AudioContext ────────────────────────────
export async function preloadSounds() {
  await Promise.all([
    fetchRaw('scroll', '/sounds/sound_ui_csgo_ui_crate_item_scroll.wav'),
    fetchRaw('open',   '/sounds/sound_ui_csgo_ui_crate_open.wav'),
  ]);
}

async function fetchRaw(name, url) {
  try {
    const resp = await fetch(url);
    if (!resp.ok) return;
    rawData[name] = await resp.arrayBuffer();
  } catch {}
}

// ─── Resume + decode (call after a user gesture) ─────────────────────────
export async function resumeAudio() {
  try {
    const ac = getCtx();
    if (ac.state === 'suspended') await ac.resume();

    // Decode any bufffers that haven't been decoded yet
    await Promise.all(
      Object.entries(rawData)
        .filter(([name]) => !(name in buffers))
        .map(async ([name, ab]) => {
          try {
            // slice() because decodeAudioData detaches the buffer
            buffers[name] = await ac.decodeAudioData(ab.slice());
          } catch {
            buffers[name] = null;
          }
        })
    );
  } catch {}
}

// ─── Playback ─────────────────────────────────────────────────────────────
function playBuffer(name, volume = 0.6) {
  const buf = buffers[name];
  if (!buf) return;
  try {
    const ac = getCtx();
    const source = ac.createBufferSource();
    source.buffer = buf;
    const gain = ac.createGain();
    gain.gain.value = volume;
    source.connect(gain);
    gain.connect(ac.destination);
    source.start();
  } catch {}
}

// Synthetic tick fallback when WAV not available
function playTick(pitch = 880) {
  try {
    const ac = getCtx();
    const osc  = ac.createOscillator();
    const gain = ac.createGain();
    osc.connect(gain);
    gain.connect(ac.destination);
    osc.type = 'square';
    osc.frequency.setValueAtTime(pitch, ac.currentTime);
    gain.gain.setValueAtTime(0.06, ac.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + 0.04);
    osc.start(ac.currentTime);
    osc.stop(ac.currentTime + 0.04);
  } catch {}
}

export function playScroll() {
  buffers['scroll'] ? playBuffer('scroll', 0.55) : playTick(900);
}

export function playReveal() {
  playBuffer('open', 0.9);
}

export function playShuffleWhoosh() {
  try {
    const ac      = getCtx();
    const bufSize = ac.sampleRate * 0.12;
    const buf     = ac.createBuffer(1, bufSize, ac.sampleRate);
    const data    = buf.getChannelData(0);
    for (let i = 0; i < bufSize; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / bufSize);
    const source = ac.createBufferSource();
    source.buffer = buf;
    const filter = ac.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = 1100;
    filter.Q.value = 0.7;
    const gain = ac.createGain();
    gain.gain.setValueAtTime(0.25, ac.currentTime);
    source.connect(filter);
    filter.connect(gain);
    gain.connect(ac.destination);
    source.start();
  } catch {}
}
