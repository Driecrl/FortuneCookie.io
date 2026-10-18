import { useState, useRef } from "react";
import { resizeImage } from "./lib/imageResize.js";
import { makeCutout } from "./lib/cutout.js";
import bank from "./data/fortunes.json";

const all = Object.values(bank).flat();
const goldenPool = [...bank.life, ...bank.good];
const DAILY_LIMIT = 100;
const GOLDEN_CHANCE = 0.1;
const EMOJIS = ["👑", "🎩", "🎓", "🕶️", "🤓", "🎀", "🧣", "🔔", "🌸", "💖", "⭐"];
const KINDS = [["cat", "🐱 Cat"], ["dog", "🐶 Dog"], ["other", "🐾 Other"]];

// Sounds: put meow.mp3, bark.mp3, pop.mp3, crack.mp3 in client/public/sounds/ to use your own.
// If a file is missing, a simple built-in sound plays instead.
let ctx;
function synth(name) {
  try {
    ctx = ctx || new (window.AudioContext || window.webkitAudioContext)();
    const t = ctx.currentTime, g = ctx.createGain(); g.connect(ctx.destination);
    if (name === "crack") {
      const buf = ctx.createBuffer(1, ctx.sampleRate * 0.14, ctx.sampleRate), d = buf.getChannelData(0);
      for (let i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / d.length);
      const src = ctx.createBufferSource(); src.buffer = buf; src.connect(g);
      g.gain.setValueAtTime(0.4, t); src.start(t); return;
    }
    const o = ctx.createOscillator(); o.connect(g);
    if (name === "bark") {
      o.type = "sawtooth"; o.frequency.setValueAtTime(320, t); o.frequency.exponentialRampToValueAtTime(140, t + 0.18);
      g.gain.setValueAtTime(0.25, t); g.gain.exponentialRampToValueAtTime(0.001, t + 0.2); o.start(t); o.stop(t + 0.22);
    } else if (name === "pop") {
      o.type = "sine"; o.frequency.setValueAtTime(500, t); o.frequency.exponentialRampToValueAtTime(900, t + 0.08);
      g.gain.setValueAtTime(0.25, t); g.gain.exponentialRampToValueAtTime(0.001, t + 0.12); o.start(t); o.stop(t + 0.14);
    } else {
      o.type = "triangle"; o.frequency.setValueAtTime(500, t); o.frequency.linearRampToValueAtTime(900, t + 0.15);
      o.frequency.linearRampToValueAtTime(450, t + 0.5); g.gain.setValueAtTime(0.3, t);
      g.gain.exponentialRampToValueAtTime(0.001, t + 0.55); o.start(t); o.stop(t + 0.58);
    }
  } catch {}
}
function playSfx(name) {
  let done = false;
  const fall = () => { if (!done) { done = true; synth(name); } };
  const a = new Audio(`/sounds/${name}.mp3`);
  a.onerror = fall;
  a.play().catch(fall);
}

const load = (k, d) => { try { return JSON.parse(localStorage.getItem(k)) ?? d; } catch { return d; } };
const save = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} };
const todayKey = () => new Date().toLocaleDateString("en-CA");
const clamp = (n, a, b) => Math.min(b, Math.max(a, n));
const sparks = Array.from({ length: 8 }, (_, i) => {
  const a = (i / 8) * Math.PI * 2;
  return { x: Math.round(Math.cos(a) * 70), y: Math.round(Math.sin(a) * 50) };
});
function pick(pool, recent) {
  const fresh = pool.filter((t) => !recent.includes(t));
  const list = fresh.length ? fresh : pool;
  return list[Math.floor(Math.random() * list.length)];
}
function luckyNumbers() {
  const s = new Set();
  while (s.size < 6) s.add(1 + Math.floor(Math.random() * 49));
  return [...s].sort((a, b) => a - b);
}

function CookieSvg() {
  return (
    <svg viewBox="0 0 120 80" width="100%" height="100%" aria-hidden="true">
      <path d="M8 52C8 22 44 8 60 32C76 8 112 22 112 52C112 70 84 76 60 62C36 76 8 70 8 52Z" fill="#E3A94B" stroke="#B9791E" strokeWidth="3" strokeLinejoin="round" />
      <path d="M60 32C51 43 51 53 60 62" fill="none" stroke="#B9791E" strokeWidth="3" strokeLinecap="round" />
      <path d="M22 40C30 30 42 27 50 31" fill="none" stroke="#F6CF86" strokeWidth="4" strokeLinecap="round" />
    </svg>
  );
}

export default function App() {
  const [pets, setPets] = useState(() => load("pets", []));
  const [recent, setRecent] = useState(() => load("recent", []));
  const [usage, setUsage] = useState(() => load("usage", { day: "", count: 0 }));
  const [draft, setDraft] = useState({ name: "", kind: "cat", image: "" });
  const [active, setActive] = useState(null);
  const [fortune, setFortune] = useState(null);
  const [phase, setPhase] = useState("idle"); // idle | shake | open
  const [selected, setSelected] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const stageRef = useRef(null);
  const drag = useRef(null);

  const used = usage.day === todayKey() ? usage.count : 0;
  const left = DAILY_LIMIT - used;
  const stickers = active?.stickers || [];
  const editing = phase === "idle" && !fortune;
  const petSound = active?.kind === "dog" ? "bark" : "meow";

  async function onFile(e) {
    const f = e.target.files?.[0]; if (!f) return;
    setBusy(true); setError("");
    try {
      try { setDraft({ ...draft, image: await makeCutout(f), cutout: true }); }
      catch {
        setDraft({ ...draft, image: await resizeImage(f), cutout: false });
        setError("Couldn't remove the background, so I kept your original photo.");
      }
    } catch (err) { setError(err.message); }
    setBusy(false);
  }
  function addPet() {
    if (!draft.image) return setError("Add a photo of your pet first.");
    const next = [...pets, { id: Date.now(), ...draft, stickers: [] }];
    setPets(next); save("pets", next); setActive(next.at(-1)); setDraft({ name: "", kind: "cat", image: "" });
  }
  function removePet(p) {
    if (!window.confirm(`Remove ${p.name || "this pet"}? This can't be undone.`)) return;
    const next = pets.filter((x) => x.id !== p.id);
    setPets(next); save("pets", next);
  }

  // ---- stickers ----
  function persist(list) {
    const np = pets.map((p) => (p.id === active.id ? { ...p, stickers: list } : p));
    setPets(np); save("pets", np);
  }
  function setStickers(list) { setActive({ ...active, stickers: list }); persist(list); }
  function addSticker(e) {
    const s = { id: Date.now(), e, x: 50, y: 20, s: 2.6 };
    setStickers([...stickers, s]); setSelected(s.id); playSfx("pop");
  }
  function resize(d) { setStickers(stickers.map((s) => (s.id === selected ? { ...s, s: clamp(s.s + d, 1.2, 6) } : s))); }
  function removeSticker() { setStickers(stickers.filter((s) => s.id !== selected)); setSelected(null); }
  function down(e, id) {
    if (!editing) return;
    e.currentTarget.setPointerCapture(e.pointerId); drag.current = id; setSelected(id);
  }
  function move(e) {
    if (drag.current == null) return;
    const r = stageRef.current.getBoundingClientRect();
    const x = clamp(((e.clientX - r.left) / r.width) * 100, 0, 100);
    const y = clamp(((e.clientY - r.top) / r.height) * 100, 0, 100);
    setActive((a) => ({ ...a, stickers: a.stickers.map((s) => (s.id === drag.current ? { ...s, x, y } : s)) }));
  }
  function up() { if (drag.current != null) { drag.current = null; persist(active.stickers); } }

  // ---- the cookie ----
  function crack() {
    if (left <= 0 || phase !== "idle") return;
    setSelected(null); setError(""); setFortune(null); setPhase("shake");
    const u = { day: todayKey(), count: used + 1 };
    setUsage(u); save("usage", u);
    setTimeout(() => {
      const golden = Math.random() < GOLDEN_CHANCE;
      const text = pick(golden ? goldenPool : all, recent);
      setFortune({ kind: golden ? "golden" : "normal", text, numbers: luckyNumbers() });
      const nr = [text, ...recent].slice(0, 20); setRecent(nr); save("recent", nr);
      setPhase("open"); playSfx("crack");
    }, 800);
  }
  const reset = () => { setFortune(null); setPhase("idle"); };

  return (
    <main className="wrap">
      <h1>Pet Fortune Cookie</h1>
      <p className="sub">Your pet has something to tell you.</p>

      {!active && (
        <section className="panel">
          <label className={"photo" + (draft.cutout ? " cut" : "")}>
            {busy ? <span>Removing the background… the first time takes a minute ⏳</span>
              : draft.image ? <img src={draft.image} alt="Your pet" /> : <span>Add a photo of your pet</span>}
            <input type="file" accept="image/*" onChange={onFile} hidden />
          </label>
          <input placeholder="Pet's name" maxLength={30} value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} />
          <div className="kinds" role="group" aria-label="Type of pet">
            {KINDS.map(([k, label]) => (
              <button key={k} className={draft.kind === k ? "on" : ""} onClick={() => setDraft({ ...draft, kind: k })}>{label}</button>
            ))}
          </div>
          <button onClick={addPet} disabled={busy}>Meet my pet</button>
          {pets.length > 0 && (
            <div className="pets">
              {pets.map((p) => (
                <span key={p.id} className="pet-wrap">
                  <button className="pet" onClick={() => { setActive(p); reset(); }}><img src={p.image} alt="" />{p.name || "Pet"}</button>
                  <button className="x" aria-label={`Remove ${p.name || "pet"}`} onClick={() => removePet(p)}>✕</button>
                </span>
              ))}
            </div>
          )}
        </section>
      )}

      {active && (
        <section className="panel center">
          <div className={"stage" + (editing ? " editing" : "")} ref={stageRef} onPointerMove={move} onPointerUp={up} onPointerCancel={up}>
            <div className={"frame" + (active.cutout ? " cut" : "")} onClick={() => playSfx(petSound)}>
              <img className="avatar" src={active.image} alt={active.name} />
            </div>
            {stickers.map((s) => (
              <span key={s.id} className={"stk" + (editing && selected === s.id ? " sel" : "") + (editing ? "" : " fixed")}
                style={{ left: s.x + "%", top: s.y + "%", fontSize: s.s + "rem" }}
                onPointerDown={(e) => down(e, s.id)} aria-hidden="true">{s.e}</span>
            ))}
            <button className="cookie-btn" onClick={crack} disabled={phase !== "idle" || left <= 0} aria-label="Crack the cookie">
              <div className={"cookie" + (phase === "idle" && left > 0 ? " idle" : "") + (phase === "shake" ? " shaking" : "") + (phase === "open" ? " open" : "") + (fortune?.kind === "golden" ? " golden" : "")}>
                <span className="half l"><CookieSvg /></span><span className="half r"><CookieSvg /></span>
                {phase === "open" && <span className="paper" />}
                {phase === "open" && sparks.map((s, i) => <span key={i} className="spark" style={{ "--x": s.x + "px", "--y": s.y + "px" }}>✨</span>)}
              </div>
            </button>
          </div>

          {editing && (
            <>
              <div className="tray" role="group" aria-label="Stickers">
                {EMOJIS.map((e) => <button key={e} onClick={() => addSticker(e)} aria-label={`Add ${e}`}>{e}</button>)}
              </div>
              {selected ? (
                <div className="ctl">
                  <button onClick={() => resize(-0.4)} aria-label="Smaller">➖</button>
                  <button onClick={() => resize(0.4)} aria-label="Bigger">➕</button>
                  <button onClick={removeSticker} aria-label="Remove sticker">🗑</button>
                </div>
              ) : <p className="meta">Add stickers, then drag them onto {active.name || "your pet"}.</p>}
              {left > 0 ? <p className="meta">Tap the cookie to open it · {left} left today</p>
                : <p className="limit">That's enough cookies for today. Come back tomorrow 🐾</p>}
            </>
          )}

          {fortune && (
            <div className={"slip" + (fortune.kind === "golden" ? " golden" : "")} role="status">
              {fortune.kind === "golden" && <p className="badge">✨ Golden cookie</p>}
              <p className="text">{fortune.text}</p>
              <p className="meta">Lucky numbers: {fortune.numbers.join(", ")}</p>
              {active.name && <p className="sign">— {active.name}</p>}
            </div>
          )}
          {fortune && (left > 0 ? <button className="ghost" onClick={reset}>Another cookie</button>
            : <p className="limit">That's enough cookies for today. Come back tomorrow 🐾</p>)}
          <button className="ghost" onClick={() => { setActive(null); setSelected(null); reset(); }}>Choose another pet</button>
        </section>
      )}
      {error && <p className="err" role="alert">{error}</p>}
    </main>
  );
}