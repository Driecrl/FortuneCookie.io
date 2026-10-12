import { useState } from "react";
import { resizeImage } from "./lib/imageResize.js";
import bank from "./data/fortunes.json";

const all = Object.values(bank).flat();
const load = (k, d) => { try { return JSON.parse(localStorage.getItem(k)) ?? d; } catch { return d; } };
const save = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} };

// Random fortune that wasn't one of the last 20 shown
function pickFortune(recent) {
  const fresh = all.filter((t) => !recent.includes(t));
  const pool = fresh.length ? fresh : all;
  return pool[Math.floor(Math.random() * pool.length)];
}
function luckyNumbers() {
  const s = new Set();
  while (s.size < 6) s.add(1 + Math.floor(Math.random() * 49));
  return [...s].sort((a, b) => a - b);
}

export default function App() {
  const [pets, setPets] = useState(() => load("pets", []));
  const [recent, setRecent] = useState(() => load("recent", []));
  const [draft, setDraft] = useState({ name: "", personality: "", image: "" });
  const [active, setActive] = useState(null);
  const [fortune, setFortune] = useState(null);
  const [opening, setOpening] = useState(false);
  const [error, setError] = useState("");

  async function onFile(e) {
    const f = e.target.files?.[0]; if (!f) return;
    try { setDraft({ ...draft, image: await resizeImage(f) }); setError(""); }
    catch (err) { setError(err.message); }
  }
  function addPet() {
    if (!draft.image) return setError("Add a photo of your pet first.");
    const next = [...pets, { id: Date.now(), ...draft }];
    setPets(next); save("pets", next); setActive(next.at(-1)); setDraft({ name: "", personality: "", image: "" });
  }
  function crack() {
    setError(""); setFortune(null); setOpening(true);
    setTimeout(() => {
      const text = pickFortune(recent);
      setFortune({ text, numbers: luckyNumbers() });
      const nr = [text, ...recent].slice(0, 20); setRecent(nr); save("recent", nr);
    }, 700);
  }
  const reset = () => { setFortune(null); setOpening(false); };

  return (
    <main className="wrap">
      <h1>Pet Fortune Cookie</h1>
      <p className="sub">Your pet has something to tell you.</p>

      {!active && (
        <section className="panel">
          <label className="photo">{draft.image ? <img src={draft.image} alt="Your pet" /> : <span>Add a photo of your pet</span>}
            <input type="file" accept="image/*" onChange={onFile} hidden /></label>
          <input placeholder="Pet's name" maxLength={30} value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} />
          <button onClick={addPet}>Meet my pet</button>
          {pets.length > 0 && <div className="pets">{pets.map((p) => (
            <button key={p.id} className="pet" onClick={() => { setActive(p); reset(); }}><img src={p.image} alt={p.name} />{p.name || "Pet"}</button>))}</div>}
        </section>
      )}

      {active && (
        <section className="panel center">
          <img className="avatar" src={active.image} alt={active.name} />
          <div className={"cookie" + (opening && fortune ? " open" : "")} aria-hidden="true">
            <span className="half l">🥠</span><span className="half r">🥠</span>
          </div>
          {fortune ? (
            <div className="slip" role="status">
              <p className="text">{fortune.text}</p>
              <p className="meta">Lucky numbers: {fortune.numbers.join(", ")}</p>
              {active.name && <p className="sign">— {active.name}</p>}
            </div>
          ) : <button onClick={crack} disabled={opening}>{opening ? "Opening…" : `Crack ${active.name ? active.name + "'s" : "the"} cookie`}</button>}
          {fortune && <button className="ghost" onClick={reset}>Another cookie</button>}
          <button className="ghost" onClick={() => { setActive(null); reset(); }}>Choose another pet</button>
        </section>
      )}
      {error && <p className="err" role="alert">{error}</p>}
    </main>
  );
}