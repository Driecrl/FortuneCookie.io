// Removes the background in the browser, firms up see-through areas, deletes stray specks,
// trims empty space, and returns a small transparent WebP.
function shrink(file, max) {
  return new Promise((res, rej) => {
    const img = new Image();
    img.onload = () => {
      const s = Math.min(1, max / Math.max(img.width, img.height));
      const c = document.createElement("canvas");
      c.width = Math.round(img.width * s); c.height = Math.round(img.height * s);
      c.getContext("2d").drawImage(img, 0, 0, c.width, c.height);
      c.toBlob(res, "image/jpeg", 0.92);
    };
    img.onerror = () => rej(new Error("Could not read that image."));
    img.src = URL.createObjectURL(file);
  });
}

// Deletes small disconnected bits (specks) that are under 5% of the biggest piece
function dropSpecks(d, w, h) {
  const lab = new Int32Array(w * h), stack = new Int32Array(w * h), sizes = [0];
  let n = 0;
  for (let s = 0; s < w * h; s++) {
    if (lab[s] || d[s * 4 + 3] <= 16) continue;
    n++; let sp = 0, cnt = 0; stack[sp++] = s; lab[s] = n;
    while (sp) {
      const p = stack[--sp]; cnt++;
      const px = p % w, py = (p / w) | 0;
      const next = [px > 0 ? p - 1 : -1, px < w - 1 ? p + 1 : -1, py > 0 ? p - w : -1, py < h - 1 ? p + w : -1];
      for (const q of next) if (q >= 0 && !lab[q] && d[q * 4 + 3] > 16) { lab[q] = n; stack[sp++] = q; }
    }
    sizes[n] = cnt;
  }
  const max = Math.max(...sizes);
  for (let p = 0; p < w * h; p++) if (lab[p] && sizes[lab[p]] < max * 0.05) d[p * 4 + 3] = 0;
}

export async function makeCutout(file, max = 900) {
  const { removeBackground } = await import("@imgly/background-removal");
  const out = await removeBackground(await shrink(file, max));
  const bmp = await createImageBitmap(out);
  const c = document.createElement("canvas");
  c.width = bmp.width; c.height = bmp.height;
  const x = c.getContext("2d", { willReadFrequently: true });
  x.drawImage(bmp, 0, 0);
  const px = x.getImageData(0, 0, c.width, c.height);
  const d = px.data;
  for (let i = 3; i < d.length; i += 4) {
    const a = d[i];
    d[i] = a < 50 ? 0 : a > 130 ? 255 : Math.round(((a - 50) * 255) / 80);
  }
  dropSpecks(d, c.width, c.height);
  x.putImageData(px, 0, 0);
  let x0 = c.width, y0 = c.height, x1 = 0, y1 = 0;
  for (let y = 0; y < c.height; y++)
    for (let i = 0; i < c.width; i++)
      if (d[(y * c.width + i) * 4 + 3] > 16) { if (i < x0) x0 = i; if (i > x1) x1 = i; if (y < y0) y0 = y; if (y > y1) y1 = y; }
  if (x1 <= x0 || y1 <= y0) throw new Error("No subject found");
  const w = x1 - x0 + 1, h = y1 - y0 + 1;
  const o = document.createElement("canvas"); o.width = w; o.height = h;
  o.getContext("2d").drawImage(c, x0, y0, w, h, 0, 0, w, h);
  return o.toDataURL("image/webp", 0.85);
}