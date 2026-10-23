// Drawn stickers (one consistent style), the pet's paws, and the hammer.
const S = { stroke: "#3A3320", strokeWidth: 3, strokeLinejoin: "round" };
const heart = "M27 14C27 4 8 4 8 20C8 32 27 42 27 46C27 42 46 32 46 20C46 4 27 4 27 14Z";

// One rose: red bloom with two curved petals drawn inside it
function Rose({ x, y, r }) {
  return (
    <g>
      <circle cx={x} cy={y} r={r} fill="#D6283C" />
      <path d={`M${x - r * 0.6} ${y + r * 0.15} Q${x} ${y - r * 0.9} ${x + r * 0.6} ${y + r * 0.15}`} fill="none" stroke="#8E1424" strokeWidth="2.2" strokeLinecap="round" />
      <path d={`M${x - r * 0.35} ${y + r * 0.45} Q${x} ${y - r * 0.2} ${x + r * 0.35} ${y + r * 0.45}`} fill="none" stroke="#8E1424" strokeWidth="2.2" strokeLinecap="round" />
    </g>
  );
}

export const ART = {
  partyhat: { label: "Party hat", tag: "Party", vb: "0 0 100 60", x: 50, y: 10, w: 4, themes: ["random", "good"],
    art: (<g {...S}><path d="M50 4L82 56H18Z" fill="#FF7BAC" /><circle cx="46" cy="36" r="4" fill="#FFE066" stroke="none" /><circle cx="58" cy="46" r="4" fill="#FFE066" stroke="none" /><circle cx="50" cy="6" r="7" fill="#FFE066" /></g>) },
  sunglasses: { label: "Sunglasses", tag: "Too cool", vb: "0 0 100 60", x: 50, y: 36, w: 5.4, themes: ["meme"],
    art: (<g {...S}><rect x="6" y="14" width="38" height="28" rx="10" fill="#2B2A3A" /><rect x="56" y="14" width="38" height="28" rx="10" fill="#2B2A3A" /><path d="M44 24H56" fill="none" /><path d="M12 22l8-2" stroke="#fff" strokeWidth="3" strokeLinecap="round" /></g>) },
  heartglasses: { label: "Heart glasses", tag: "Lovestruck", vb: "0 0 100 60", x: 50, y: 36, w: 5.4, themes: ["love"],
    art: (<g {...S}><path d={heart} fill="#FF5C8A" /><path d={heart} transform="translate(46 0)" fill="#FF5C8A" /></g>) },
  bowtie: { label: "Bow tie", tag: "Fancy", vb: "0 0 100 60", x: 50, y: 58, w: 4.6, themes: ["money", "life"],
    art: (<g {...S}><path d="M50 30L8 8V52Z" fill="#E4572E" /><path d="M50 30L92 8V52Z" fill="#E4572E" /><rect x="41" y="21" width="18" height="18" rx="5" fill="#C23B1E" /></g>) },
  headphones: { label: "Headphones", tag: "Vibes", vb: "0 0 100 60", x: 50, y: 22, w: 6, themes: ["random", "meme"],
    art: (<g {...S}><path d="M14 40C14 -6 86 -6 86 40" fill="none" stroke="#2B2A3A" strokeWidth="8" /><rect x="6" y="34" width="18" height="24" rx="7" fill="#FF7BAC" /><rect x="76" y="34" width="18" height="24" rx="7" fill="#FF7BAC" /></g>) },
  flowercrown: { label: "Flower crown", tag: "Garden", vb: "0 0 100 60", x: 50, y: 12, w: 5.6, themes: ["love", "life"],
    art: (<g {...S}><path d="M4 36Q50 54 96 36" fill="none" stroke="#5E9B5E" strokeWidth="6" />
      {[[14, 38, "#FF8FB1"], [32, 43, "#FFFFFF"], [50, 45, "#FFD166"], [68, 43, "#FF8FB1"], [86, 38, "#FFFFFF"]].map(([x, y, c]) => (
        <g key={x}><circle cx={x} cy={y} r="9" fill={c} /><circle cx={x} cy={y} r="3" fill="#F6C945" stroke="none" /></g>))}</g>) },
  mustache: { label: "Mustache", tag: "Distinguished", vb: "0 0 100 60", x: 50, y: 50, w: 3.6, themes: ["meme", "random"],
    art: (<path d="M50 24C40 8 14 12 6 28C22 22 38 34 50 30C62 34 78 22 94 28C86 12 60 8 50 24Z" fill="#4A3426" {...S} />) },
  watergun: { label: "Water gun", tag: "Soaked", vb: "0 0 100 60", x: 72, y: 62, w: 5.2, themes: ["bad", "meme"],
    art: (<g {...S}><rect x="22" y="6" width="28" height="10" rx="5" fill="#9AE0F5" /><rect x="10" y="14" width="72" height="20" rx="8" fill="#2EC4B6" /><rect x="76" y="18" width="14" height="12" rx="3" fill="#FF9F1C" /><path d="M50 32L48 56Q48 58 52 58L66 58Q70 58 70 55L68 32Z" fill="#FF9F1C" /><path d="M36 34q0 12 10 12" fill="none" /><circle cx="95" cy="14" r="3" fill="#9AE0F5" strokeWidth="2" /><circle cx="97" cy="26" r="3" fill="#9AE0F5" strokeWidth="2" /><circle cx="93" cy="37" r="3" fill="#9AE0F5" strokeWidth="2" /></g>) },
  roses: { label: "Roses", tag: "Romantic", vb: "0 0 100 60", x: 28, y: 64, w: 4.6, themes: ["love", "mystery"],
    art: (<g {...S}><path d="M50 58L30 30M50 58L50 26M50 58L70 30" fill="none" stroke="#3E7B3E" strokeWidth="4" strokeLinecap="round" /><path d="M40 47q-11 -2 -13 -11q11 0 13 11Z" fill="#4C9A4C" /><path d="M60 47q11 -2 13 -11q-11 0 -13 11Z" fill="#4C9A4C" /><Rose x={30} y={26} r={11} /><Rose x={50} y={20} r={12} /><Rose x={70} y={26} r={11} /><path d="M50 52L40 46L40 58ZM50 52L60 46L60 58Z" fill="#FF7BAC" /></g>) },
};
export const KEYS = Object.keys(ART);

export function Paw() {
  return (
    <svg viewBox="0 0 40 44" width="100%" aria-hidden="true">
      <g fill="#FFF8EC" stroke="#C9B38A" strokeWidth="2.5">
        <circle cx="9" cy="14" r="6" /><circle cx="20" cy="9" r="6" /><circle cx="31" cy="14" r="6" />
        <ellipse cx="20" cy="28" rx="16" ry="14" />
      </g>
    </svg>
  );
}

export function Hammer() {
  return (
    <svg className="hammer" viewBox="0 0 100 100" aria-hidden="true">
      <line x1="90" y1="90" x2="28" y2="28" stroke="#8A5A2B" strokeWidth="9" strokeLinecap="round" />
      <rect x="6" y="15" width="40" height="22" rx="4" transform="rotate(-45 26 26)" fill="#D64545" stroke="#3A3320" strokeWidth="3" />
      <g className="hpaw" stroke="#B89B6A" strokeWidth="2.5">
        <circle cx="80" cy="80" r="4" /><circle cx="88" cy="76" r="4" /><circle cx="96" cy="80" r="4" />
        <ellipse cx="88" cy="89" rx="11" ry="10" />
      </g>
    </svg>
  );
}