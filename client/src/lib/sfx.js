// Built-in sound effects, made with the browser's audio engine (no files needed).
// To use your own recordings instead, put meow.mp3, bark.mp3, pop.mp3, crack.mp3, whoosh.mp3,
// paper.mp3 and chime.mp3 in client/public/sounds/ and they play instead of these.
let ctx, noiseBuf;
const NAMES = ["meow", "bark", "pop", "crack", "whoosh", "paper", "chime"];
const files = {};

function ac() {
  ctx = ctx || new (window.AudioContext || window.webkitAudioContext)();
  if (ctx.state === "suspended") { try { ctx.resume().catch(() => {}); } catch {} }
  return ctx;
}
function out(c) {
  if (!c.master) {
    const comp = c.createDynamicsCompressor(); comp.connect(c.destination);
    c.master = c.createGain(); c.master.gain.value = 0.9; c.master.connect(comp);
  }
  return c.master;
}
function noise(c) {
  if (!noiseBuf) {
    noiseBuf = c.createBuffer(1, c.sampleRate, c.sampleRate);
    const d = noiseBuf.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
  }
  const s = c.createBufferSource(); s.buffer = noiseBuf; s.loop = true; return s;
}
function env(c, t, peak, attack, decay) {
  const g = c.createGain();
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(peak, t + attack);
  g.gain.exponentialRampToValueAtTime(0.0001, t + attack + decay);
  return g;
}
function tone(c, { type = "sine", f0, f1 = f0, t, dur, peak = 0.3, attack = 0.005 }) {
  const o = c.createOscillator(); o.type = type;
  o.frequency.setValueAtTime(f0, t); o.frequency.exponentialRampToValueAtTime(f1, t + dur);
  const g = env(c, t, peak, attack, dur - attack);
  o.connect(g); g.connect(out(c)); o.start(t); o.stop(t + dur + 0.05);
}
function burst(c, { t, dur, peak = 0.3, type = "bandpass", f, f1, q = 1, attack }) {
  const n = noise(c), fl = c.createBiquadFilter();
  fl.type = type; fl.Q.value = q; fl.frequency.setValueAtTime(f, t);
  if (f1) fl.frequency.exponentialRampToValueAtTime(f1, t + dur);
  const g = env(c, t, peak, attack ?? Math.min(0.01, dur / 3), dur);
  n.connect(fl); fl.connect(g); g.connect(out(c)); n.start(t, Math.random()); n.stop(t + dur + 0.05);
}

// "mee-ow": a buzzy voice shaped by two moving vowel filters, with a little vibrato
function meow(c, t) {
  const o = c.createOscillator(); o.type = "sawtooth";
  o.frequency.setValueAtTime(520, t);
  o.frequency.linearRampToValueAtTime(880, t + 0.16);
  o.frequency.linearRampToValueAtTime(420, t + 0.55);
  const lfo = c.createOscillator(), lg = c.createGain(); lfo.frequency.value = 6; lg.gain.value = 14;
  lfo.connect(lg); lg.connect(o.frequency);
  const f1 = c.createBiquadFilter(), f2 = c.createBiquadFilter();
  f1.type = "bandpass"; f2.type = "bandpass"; f1.Q.value = 4; f2.Q.value = 5;
  f1.frequency.setValueAtTime(450, t); f1.frequency.linearRampToValueAtTime(900, t + 0.18); f1.frequency.linearRampToValueAtTime(550, t + 0.55);
  f2.frequency.setValueAtTime(2300, t); f2.frequency.linearRampToValueAtTime(1500, t + 0.3); f2.frequency.linearRampToValueAtTime(1100, t + 0.55);
  const g = c.createGain();
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(0.9, t + 0.04);
  g.gain.exponentialRampToValueAtTime(0.55, t + 0.35);
  g.gain.exponentialRampToValueAtTime(0.0001, t + 0.6);
  o.connect(f1); o.connect(f2); f1.connect(g); f2.connect(g); g.connect(out(c));
  o.start(t); lfo.start(t); o.stop(t + 0.6); lfo.stop(t + 0.6);
}
// "ruff ruff": two chesty barks with a raspy edge
function bark(c, t) {
  [[0, 1], [0.24, 0.8]].forEach(([dt, k]) => {
    const s = t + dt;
    const o = c.createOscillator(); o.type = "sawtooth";
    o.frequency.setValueAtTime(300 * k, s); o.frequency.exponentialRampToValueAtTime(130 * k, s + 0.17);
    const f = c.createBiquadFilter(); f.type = "bandpass"; f.Q.value = 2;
    f.frequency.setValueAtTime(900, s); f.frequency.exponentialRampToValueAtTime(500, s + 0.17);
    const g = env(c, s, 1.2 * k, 0.01, 0.16);
    o.connect(f); f.connect(g); g.connect(out(c)); o.start(s); o.stop(s + 0.2);
    burst(c, { t: s, dur: 0.12, peak: 0.3 * k, f: 1500, q: 0.8 });
  });
}
// sticker pop (pitch changes a little every time so it never gets boring)
function pop(c, t) {
  const k = 0.9 + Math.random() * 0.25;
  tone(c, { f0: 420 * k, f1: 900 * k, t, dur: 0.1, peak: 1.2 });
  tone(c, { type: "triangle", f0: 1200 * k, f1: 1800 * k, t: t + 0.03, dur: 0.07, peak: 0.3 });
}
// hammer swoosh
function whoosh(c, t) { burst(c, { t, dur: 0.3, peak: 1.3, f: 350, f1: 2600, q: 1.2, attack: 0.12 }); }
// the hit: low thud + sharp snap + crumbly crunch
function crack(c, t) {
  tone(c, { f0: 150, f1: 45, t, dur: 0.22, peak: 1 });
  burst(c, { t, dur: 0.05, peak: 0.9, type: "highpass", f: 2500 });
  for (let i = 0; i < 9; i++)
    burst(c, { t: t + 0.02 + Math.random() * 0.14, dur: 0.03 + Math.random() * 0.03, peak: 0.25 + Math.random() * 0.25, f: 1200 + Math.random() * 3500, q: 2 });
}
// the fortune paper unrolling
function paper(c, t) {
  for (let i = 0; i < 10; i++)
    burst(c, { t: t + i * 0.035 + Math.random() * 0.02, dur: 0.04, peak: 0.13 + Math.random() * 0.13, type: "highpass", f: 3500 + Math.random() * 2000 });
}
// golden cookie sparkle
function chime(c, t) {
  [784, 988, 1175, 1568].forEach((f, i) => {
    tone(c, { f0: f, t: t + i * 0.09, dur: 0.7, peak: 0.28 });
    tone(c, { type: "triangle", f0: f * 2, t: t + i * 0.09, dur: 0.4, peak: 0.05 });
  });
}

const MAKERS = { meow, bark, pop, crack, whoosh, paper, chime };
function synth(name) { try { const c = ac(); MAKERS[name]?.(c, c.currentTime + 0.01); } catch {} }

// If you add your own mp3 to public/sounds, it is used instead (checked once at startup).
function probe(name) {
  fetch(`/sounds/${name}.mp3`, { method: "HEAD" })
    .then((r) => { files[name] = r.ok && (r.headers.get("content-type") || "").startsWith("audio"); })
    .catch(() => { files[name] = false; });
}
if (typeof window !== "undefined") NAMES.forEach(probe);

export function playSfx(name) {
  if (files[name]) new Audio(`/sounds/${name}.mp3`).play().catch(() => synth(name));
  else synth(name);
}
