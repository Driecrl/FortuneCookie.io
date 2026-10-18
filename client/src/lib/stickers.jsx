// Drawn stickers (one consistent style), the pet's paws, and the hammer.
const S = { stroke: "#3A3320", strokeWidth: 3, strokeLinejoin: "round" };
const heart = "M27 14C27 4 8 4 8 20C8 32 27 42 27 46C27 42 46 32 46 20C46 4 27 4 27 14Z";

export const ART = {
  crown: { label: "Crown", tag: "Royal", vb: "0 0 100 60", x: 50, y: 12, w: 5, themes: ["money", "good"],
    art: (<g {...S}><path d="M10 52L14 14L34 32L50 8L66 32L86 14L90 52Z" fill="#F6C945" /><circle cx="14" cy="14" r="4" fill="#E4572E" /><circle cx="50" cy="8" r="4" fill="#E4572E" /><circle cx="86" cy="14" r="4" fill="#E4572E" /></g>) },
  partyhat: { label: "Party hat", tag: "Party", vb: "0 0 100 60", x: 50, y: 10, w: 4, themes: ["random", "good"],
    art: (<g {...S}><path d="M50 4L82 56H18Z" fill="#FF7BAC" /><circle cx="46" cy="36" r="4" fill="#FFE066" stroke="none" /><circle cx="58" cy="46" r="4" fill="#FFE066" stroke="none" /><circle cx="50" cy="6" r="7" fill="#FFE066" /></g>) },
  wizard: { label: "Wizard hat", tag: "Wizard", vb: "0 0 100 60", x: 50, y: 10, w: 5.4, themes: ["mystery"],
    art: (<g {...S}><path d="M50 2L76 46L96 50L96 58H4V50L24 46Z" fill="#5B4B9A" /><path d="M50 24l3 7 8 .5-6 5 2 8-7-4-7 4 2-8-6-5 8-.5Z" fill="#F6C945" strokeWidth="1.5" /></g>) },
  halo: { label: "Halo", tag: "Angel", vb: "0 0 100 60", x: 50, y: 3, w: 5, themes: ["life"],
    art: (<g fill="none"><ellipse cx="50" cy="30" rx="36" ry="12" stroke="#B9791E" strokeWidth="11" /><ellipse cx="50" cy="30" rx="36" ry="12" stroke="#F6C945" strokeWidth="6" /></g>) },
  sunglasses: { label: "Sunglasses", tag: "Too cool", vb: "0 0 100 60", x: 50, y: 36, w: 5.4, themes: ["meme"],
    art: (<g {...S}><rect x="6" y="14" width="38" height="28" rx="10" fill="#2B2A3A" /><rect x="56" y="14" width="38" height="28" rx="10" fill="#2B2A3A" /><path d="M44 24H56" fill="none" /><path d="M12 22l8-2" stroke="#fff" strokeWidth="3" strokeLinecap="round" /></g>) },
  heartglasses: { label: "Heart glasses", tag: "Lovestruck", vb: "0 0 100 60", x: 50, y: 36, w: 5.4, themes: ["love"],
    art: (<g {...S}><path d={heart} fill="#FF5C8A" /><path d={heart} transform="translate(46 0)" fill="#FF5C8A" /></g>) },
  bowtie: { label: "Bow tie", tag: "Fancy", vb: "0 0 100 60", x: 50, y: 58, w: 4.6, themes: ["money", "life"],
    art: (<g {...S}><path d="M50 30L8 8V52Z" fill="#E4572E" /><path d="M50 30L92 8V52Z" fill="#E4572E" /><rect x="41" y="21" width="18" height="18" rx="5" fill="#C23B1E" /></g>) },
  bandana: { label: "Bandana", tag: "Outlaw", vb: "0 0 100 60", x: 50, y: 56, w: 5, themes: ["bad", "meme"],
    art: (<g {...S}><path d="M4 6Q50 22 96 6L50 56Z" fill="#D64545" /><circle cx="30" cy="16" r="2.5" fill="#fff" stroke="none" /><circle cx="70" cy="16" r="2.5" fill="#fff" stroke="none" /><circle cx="50" cy="26" r="2.5" fill="#fff" stroke="none" /><circle cx="50" cy="40" r="2.5" fill="#fff" stroke="none" /></g>) },
  headphones: { label: "Headphones", tag: "Vibes", vb: "0 0 100 60", x: 50, y: 22, w: 6, themes: ["random", "meme"],
    art: (<g {...S}><path d="M14 40C14 -6 86 -6 86 40" fill="none" stroke="#2B2A3A" strokeWidth="8" /><rect x="6" y="34" width="18" height="24" rx="7" fill="#FF7BAC" /><rect x="76" y="34" width="18" height="24" rx="7" fill="#FF7BAC" /></g>) },
  flowercrown: { label: "Flower crown", tag: "Garden", vb: "0 0 100 60", x: 50, y: 12, w: 5.6, themes: ["love", "life"],
    art: (<g {...S}><path d="M4 36Q50 54 96 36" fill="none" stroke="#5E9B5E" strokeWidth="6" />
      {[[14, 38, "#FF8FB1"], [32, 43, "#FFFFFF"], [50, 45, "#FFD166"], [68, 43, "#FF8FB1"], [86, 38, "#FFFFFF"]].map(([x, y, c]) => (
        <g key={x}><circle cx={x} cy={y} r="9" fill={c} /><circle cx={x} cy={y} r="3" fill="#F6C945" stroke="none" /></g>))}</g>) },
  mustache: { label: "Mustache", tag: "Distinguished", vb: "0 0 100 60", x: 50, y: 50, w: 3.6, themes: ["meme", "random"],
    art: (<path d="M50 24C40 8 14 12 6 28C22 22 38 34 50 30C62 34 78 22 94 28C86 12 60 8 50 24Z" fill="#4A3426" {...S} />) },
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
