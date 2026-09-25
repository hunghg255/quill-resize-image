// Sample media are generated inline so the playground works offline and without CORS issues

function svgUrl(svg: string) {
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

export const landscape = svgUrl(`
<svg xmlns="http://www.w3.org/2000/svg" width="640" height="360" viewBox="0 0 640 360">
  <defs>
    <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#fbcfe8"/><stop offset="1" stop-color="#fef3c7"/>
    </linearGradient>
  </defs>
  <rect width="640" height="360" fill="url(#sky)"/>
  <circle cx="480" cy="110" r="46" fill="#fb923c"/>
  <path d="M0 270 L130 150 L230 240 L340 120 L470 250 L560 190 L640 240 L640 360 L0 360 Z" fill="#be185d"/>
  <path d="M0 300 L110 230 L220 290 L360 210 L500 300 L640 260 L640 360 L0 360 Z" fill="#831843"/>
  <text x="24" y="44" font-family="system-ui, sans-serif" font-size="22" font-weight="700" fill="#831843">640 × 360</text>
</svg>`);

export const square = svgUrl(`
<svg xmlns="http://www.w3.org/2000/svg" width="320" height="320" viewBox="0 0 320 320">
  <rect width="320" height="320" fill="#e0e7ff"/>
  <circle cx="160" cy="160" r="110" fill="#6366f1"/>
  <circle cx="160" cy="160" r="64" fill="#c7d2fe"/>
  <text x="160" y="170" text-anchor="middle" font-family="system-ui, sans-serif" font-size="22" font-weight="700" fill="#312e81">320 × 320</text>
</svg>`);

export const portrait = svgUrl(`
<svg xmlns="http://www.w3.org/2000/svg" width="240" height="360" viewBox="0 0 240 360">
  <rect width="240" height="360" fill="#dcfce7"/>
  <rect x="100" y="200" width="40" height="120" fill="#78350f"/>
  <circle cx="120" cy="150" r="80" fill="#16a34a"/>
  <text x="120" y="345" text-anchor="middle" font-family="system-ui, sans-serif" font-size="20" font-weight="700" fill="#14532d">240 × 360</text>
</svg>`);

export const youtube = "https://www.youtube.com/embed/dQw4w9WgXcQ";

export const initialDelta = {
  ops: [
    { insert: "Click any image to resize it" },
    { insert: "\n", attributes: { header: 2 } },
    { insert: "Drag one of the four corner handles, use the toolbar to set " },
    { insert: "100%", attributes: { code: true } },
    { insert: " / " },
    { insert: "50%", attributes: { code: true } },
    { insert: " or a custom width, and float the image left, center or right. Hold " },
    { insert: "Alt", attributes: { bold: true } },
    { insert: " while dragging to lock the aspect ratio.\n" },
    { insert: { image: landscape }, attributes: { width: "360" } },
    { insert: "\n" },
    {
      insert:
        "Every change is written to the Delta, so it survives a reload. Watch the output panel below the editor while you resize.\n",
    },
    { insert: { image: square }, attributes: { width: "140", style: "float: left; margin: 0px 1em 1em 0px;" } },
    {
      insert:
        "This square is floated left, with a margin so the text does not touch it. Floating is stored in the Delta too, as a style attribute limited to float, display and margin. Try switching it to right or center, then press \"Recreate from Delta\" to check that the layout comes back exactly the same.\n",
    },
    { insert: "\n" },
    { insert: "Images inside lists are positioned correctly as well:" },
    { insert: "\n" },
    { insert: { image: portrait }, attributes: { width: "120" } },
    { insert: "\n", attributes: { list: "bullet" } },
    { insert: "A bullet item with plain text" },
    { insert: "\n", attributes: { list: "bullet" } },
  ],
};
