import { useState, useRef } from "react";
import { resizeImage } from "./lib/imageResize.js";
import { makeCutout } from "./lib/cutout.js";
import { ART, KEYS, Paw, Hammer } from "./lib/stickers.jsx";
import { playSfx } from "./lib/sfx.js";
import { moodFor } from "./lib/mood.js";
import bank from "./data/fortunes.json";

const goldenPool = [...bank.life, ...bank.good];
const DAILY_LIMIT = 100; // cookies per day (set higher while testing)
const GOLDEN_CHANCE = 0.1;
const KINDS = [["cat", "🐱 Cat"], ["dog", "🐶 Dog"], ["other", "🐾 Other"]];

// soft floating details in the background
const drift = Array.from({ length: 16 }, (_, i) => ({
  left: (i * 37) % 100, size: 0.8 + ((i * 7) % 10) / 10, delay: -((i * 3.1) % 18), dur: 14 + (i % 6) * 3,
  e: ["🐾", "✨", "⭐", "🥠", "🐟", "🦴"][i % 6],
}));

// an animal that peeks in beside the big fortune message
function Side({ pet, cls }) {
  return pet.cutout
    ? <img className={"side " + cls} src={pet.image} alt="" />
    : <span className={"side emoji " + cls} aria-hidden="true">{pet.kind === "dog" ? "🐶" : pet.kind === "other" ? "🐾" : "🐱"}</span>;
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
  const [mine, setMine] = useState(() => load("mystickers", []));
  const [draft, setDraft] = useState({ name: "", kind: "cat", image: "" });
  const [active, setActive] = useState(null);
  const [fortune, setFortune] = useState(null);
  const [phase, setPhase] = useState("idle"); // idle | swing | open
  const [selected, setSelected] = useState(null);
  const [busy, setBusy] = useState(false);
  const [stickerBusy, setStickerBusy] = useState(false);
  const [error, setError] = useState("");
  const stageRef = useRef(null);
  const drag = useRef(null);

  const used = usage.day === todayKey() ? usage.count : 0;
  const left = DAILY_LIMIT - used;
  const mineMap = Object.fromEntries(mine.map((m) => [m.id, m.src]));
  const stickers = (active?.stickers || []).filter((s) => ART[s.k] || (s.k === "my" && mineMap[s.img]));
  const editing = phase === "idle" && !fortune;
  const petSound = active?.kind === "dog" ? "bark" : "meow";
  const partner = pets.find((p) => p.id !== active?.id && p.cutout) || active; // the other animal beside the message

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
  function addSticker(k, img) {
    const a = ART[k];
    const s = k === "my"
      ? { id: Date.now(), k, img, x: 50, y: 40, w: 4, r: 0 }
      : { id: Date.now(), k, x: a.x, y: a.y, w: a.w, r: 0 };
    setStickers([...stickers, s]); setSelected(s.id); playSfx("pop");
  }
  async function addMine(e) {
    const f = e.target.files?.[0]; e.target.value = ""; if (!f) return;
    if (mine.length >= 12) return setError("You can keep up to 12 of your own stickers. Remove one to add another.");
    setStickerBusy(true); setError("");
    try {
      const src = await makeCutout(f, 400);
      const next = [...mine, { id: Date.now(), src }];
      setMine(next); save("mystickers", next);
      addSticker("my", next.at(-1).id);
    } catch { setError("Couldn't make a sticker from that image. Try a clearer picture."); }
    setStickerBusy(false);
  }
  function removeMine(id) {
    const next = mine.filter((m) => m.id !== id);
    setMine(next); save("mystickers", next);
  }
  function resize(d) { setStickers(stickers.map((s) => (s.id === selected ? { ...s, w: clamp(s.w + d * 1.5, 1.5, 9) } : s))); }
  function rotate(d) { setStickers(stickers.map((s) => (s.id === selected ? { ...s, r: (s.r || 0) + d } : s))); }
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
    setSelected(null); setError(""); setFortune(null); setPhase("swing"); playSfx(petSound); setTimeout(() => playSfx("whoosh"), 420);
    const u = { day: todayKey(), count: used + 1 };
    setUsage(u); save("usage", u);
    setTimeout(() => {
      const golden = Math.random() < GOLDEN_CHANCE;
      const themed = stickers.filter((s) => ART[s.k]); // your own stickers don't change the fortune
      const worn = themed.length && Math.random() < 0.7 ? themed[Math.floor(Math.random() * themed.length)] : null;
      const base = Object.entries(bank).filter(([k]) => (k !== "cat" && k !== "dog") || k === active.kind).flatMap(([, v]) => v);
      const pool = golden ? goldenPool : worn ? ART[worn.k].themes.flatMap((k) => bank[k]) : base;
      const text = pick(pool, recent);
      setFortune({ kind: golden ? "golden" : "normal", text, numbers: luckyNumbers(), outfit: !golden && worn ? ART[worn.k].tag : null, mood: moodFor(text, golden) });
      const nr = [text, ...recent].slice(0, 20); setRecent(nr); save("recent", nr);
      setPhase("open"); playSfx("crack"); setTimeout(() => playSfx(golden ? "chime" : "paper"), 260);
    }, 700);
  }
  const reset = () => { setFortune(null); setPhase("idle"); };

  return (
    <main className="wrap">
      <div className="drift" aria-hidden="true">
        {drift.map((d, i) => <span key={i} style={{ left: d.left + "%", fontSize: d.size + "rem", animationDelay: d.delay + "s", animationDuration: d.dur + "s" }}>{d.e}</span>)}
      </div>
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
          <div className={"stage" + (editing ? " editing" : "") + (phase === "open" ? " hit" : "") + " kind-" + (active.kind || "cat")} ref={stageRef} onPointerMove={move} onPointerUp={up} onPointerCancel={up}>
            <div className={"frame" + (active.cutout ? " cut" : "")} onClick={() => playSfx(petSound)}>
              <img className="avatar" src={active.image} alt={active.name} />
            </div>
            {stickers.map((s) => {
              const props = {
                className: "stk" + (editing && selected === s.id ? " sel" : "") + (editing ? "" : " fixed"),
                style: { left: s.x + "%", top: s.y + "%", width: s.w + "rem", transform: `translate(-50%,-50%) rotate(${s.r || 0}deg)` },
                onPointerDown: (e) => down(e, s.id),
              };
              return s.k === "my"
                ? <img key={s.id} {...props} src={mineMap[s.img]} alt="" draggable={false} />
                : <svg key={s.id} {...props} viewBox={ART[s.k].vb} aria-hidden="true">{ART[s.k].art}</svg>;
            })}
            <button className={"cookie-btn" + (phase === "open" ? " open" : "")} onClick={crack} disabled={phase !== "idle" || left <= 0} aria-label="Crack the cookie">
              <div className={"cookie" + (phase === "idle" && left > 0 ? " idle" : "") + (phase === "swing" ? " swinging" : "") + (phase === "open" ? " open" : "") + (fortune?.kind === "golden" ? " golden" : "")}>
                <span className="half l"><CookieSvg /></span><span className="half r"><CookieSvg /></span>
                {phase === "open" && <span className="paper" />}
                {phase === "open" && sparks.map((s, i) => <span key={i} className="spark" style={{ "--x": s.x + "px", "--y": s.y + "px" }}>✨</span>)}
              </div>
              <span className="paw l"><Paw /></span><span className="paw r"><Paw /></span>
              {phase !== "idle" && <Hammer />}
              {phase === "swing" && <span className="say" aria-hidden="true">{active.kind === "dog" ? "Woof!" : active.kind === "other" ? "Squeak!" : "Meow!"}</span>}
              {phase === "open" && <span className="pow" aria-hidden="true">POW!</span>}
            </button>
          </div>

          {editing && (
            <>
              <div className="tray" role="group" aria-label="Stickers">
                {KEYS.map((k) => (
                  <button key={k} onClick={() => addSticker(k)} aria-label={`Add ${ART[k].label}`}>
                    <svg viewBox={ART[k].vb} width="40" height="28">{ART[k].art}</svg>
                  </button>
                ))}
              </div>
              <div className="tray mine" role="group" aria-label="My stickers">
                {mine.map((m) => (
                  <span key={m.id} className="pet-wrap">
                    <button onClick={() => addSticker("my", m.id)} aria-label="Add my sticker">
                      <img src={m.src} alt="" width="34" height="34" style={{ objectFit: "contain" }} />
                    </button>
                    <button className="x" aria-label="Delete this sticker" onClick={() => removeMine(m.id)}>✕</button>
                  </span>
                ))}
                <label className="upload-sticker">
                  {stickerBusy ? "Making your sticker… ⏳" : "＋ Add my own"}
                  <input type="file" accept="image/*" hidden onChange={addMine} disabled={stickerBusy} />
                </label>
              </div>
              {selected ? (
                <div className="ctl">
                  <button onClick={() => resize(-0.4)} aria-label="Smaller">➖</button>
                  <button onClick={() => resize(0.4)} aria-label="Bigger">➕</button>
                  <button onClick={() => rotate(-15)} aria-label="Rotate left">↺</button>
                  <button onClick={() => rotate(15)} aria-label="Rotate right">↻</button>
                  <button onClick={removeSticker} aria-label="Remove sticker">🗑</button>
                </div>
              ) : <p className="meta">Add stickers, then drag them onto {active.name || "your pet"}.</p>}
              {left > 0 ? <p className="meta">Tap the cookie to open it · {left} left today</p>
                : <p className="limit">That's enough cookies for today. Come back tomorrow 🐾</p>}
            </>
          )}

          {fortune && (
            <div className="reveal" role="dialog" aria-label="Your fortune">
              <div className="reveal-row">
                <Side pet={active} cls="l" />
                <div className={"big" + (fortune.kind === "golden" ? " golden" : "") + (fortune.mood ? " has-mood" : "")} role="status">
                  {fortune.mood && <img className="mood" src={fortune.mood} alt="" onError={(e) => { e.currentTarget.style.display = "none"; }} />}
                  {fortune.kind === "golden" && <p className="badge">✨ Golden cookie</p>}
                  {fortune.outfit && <p className="badge">🎀 {fortune.outfit} outfit fortune</p>}
                  <p className="text">{fortune.text}</p>
                  <p className="meta">Lucky numbers: {fortune.numbers.join(", ")}</p>
                  {active.name && <p className="sign">— {active.name}</p>}
                </div>
                <Side pet={partner} cls="r" />
              </div>
              <div className="reveal-actions">
                {left > 0 ? <button onClick={reset}>Another cookie</button>
                  : <p className="limit">That's enough cookies for today. Come back tomorrow 🐾</p>}
                <button className="ghost" onClick={() => { setActive(null); setSelected(null); reset(); }}>Choose another pet</button>
              </div>
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
