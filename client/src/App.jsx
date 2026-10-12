import { useState } from "react";
import { resizeImage } from "./lib/imageResize.js";

const load = (k, d) => { try { return JSON.parse(localStorage.getItem(k)) ?? d; } catch { return d; } };
const save = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} };

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
  async function crack() {
    setError(""); setFortune(null); setOpening(true);
    try {
      const r = await fetch("/api/fortune", { method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: active.image, petName: active.name, personality: active.personality, recent }) });
      const data = await r.json();
      if (!r.ok) throw new Error(data.message || "Something went wrong. Try again.");
      setFortune(data);
      const nr = [data.fortune, ...recent].slice(0, 5); setRecent(nr); save("recent", nr);
    } catch (e) { setError(e.message); setOpening(false); }
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
          <input placeholder="Personality, e.g. grumpy but cuddly" maxLength={100} value={draft.personality}
            onChange={(e) => setDraft({ ...draft, personality: e.target.value })} />
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
              <p className="text">{fortune.fortune}</p>
              <p className="meta">Lucky numbers: {fortune.lucky_numbers.join(", ")}</p>
              <p className="meta">Lucky item: {fortune.lucky_item}</p>
              <p className="sign">{fortune.pet_sign_off}</p>
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
