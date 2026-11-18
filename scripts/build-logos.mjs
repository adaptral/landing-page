// Generates the whole logo kit from logo/paths.json:  npm run logos
// Outputs logo/{svg,png,favicon,social} and refreshes the copies the site serves (app/, public/).
import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";

const root = path.resolve(import.meta.dirname, "..");
const { mark, word, tagline } = JSON.parse(fs.readFileSync(path.join(root, "logo/paths.json"), "utf8"));

const INK = "#0A0A0A";
const WHITE = "#FFFFFF";
const tones = { black: INK, white: WHITE };

// ---- geometry -------------------------------------------------------------
// Lockup, in wordmark units (cap height = 700): the mark is 2.4 cap heights tall, centred on the
// cap height, and the wordmark tucks under the top hook, as in the reference artwork.
const MS = (2.4 * word.capH) / mark.h;
const LOCK_H = mark.h * MS;
const WORD_X = Math.round(mark.w * MS * 0.905);
const WORD_Y = (LOCK_H - word.capH) / 2;
const LOCK_W = WORD_X + word.w;

const wrap = (w, h, body, px) =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}"${px ? ` width="${px[0]}" height="${px[1]}"` : ""} role="img" aria-label="Adaptral"><title>Adaptral</title>${body}</svg>\n`;
const markAt = (fill, x = 0, y = 0, s = 1, extra = "") =>
  `<path fill="${fill}"${extra} transform="translate(${x} ${y}) scale(${s})" d="${mark.d}"/>`;
const lockupBody = (fill, x = 0, y = 0, s = 1) =>
  `<g fill="${fill}" transform="translate(${x} ${y}) scale(${s})"><path transform="scale(${MS})" d="${mark.d}"/><path transform="translate(${WORD_X} ${WORD_Y})" d="${word.d}"/></g>`;

const markSvg = (fill, px) => wrap(mark.w, mark.h, markAt(fill), px);
const lockupSvg = (fill, px) => wrap(LOCK_W, LOCK_H, lockupBody(fill), px);

// Square tile on a 1000 grid. The mark is 56% of the tile, so it survives a circular crop.
// Favicons use a larger mark (no crop to survive, and 16px needs every pixel).
const tileSvg = (px, { bg, fg, radius = 0, glow = false, s: TILE_S = 0.56 }) => {
  const TILE_X = (1000 - mark.w * TILE_S) / 2;
  const TILE_Y = (1000 - mark.h * TILE_S) / 2;
  return wrap(
    1000,
    1000,
    (glow
      ? `<defs><radialGradient id="g" cx="50%" cy="50%" r="62%"><stop offset="0" stop-color="#1B2030"/><stop offset="1" stop-color="#050506"/></radialGradient>` +
        `<filter id="b1" x="-60%" y="-60%" width="220%" height="220%"><feGaussianBlur stdDeviation="70"/></filter>` +
        `<filter id="b2" x="-40%" y="-40%" width="180%" height="180%"><feGaussianBlur stdDeviation="22"/></filter></defs>` +
        `<rect width="1000" height="1000" fill="url(#g)"/>` +
        markAt("#7F9BFF", TILE_X, TILE_Y, TILE_S, ` opacity="0.75" filter="url(#b1)"`) +
        markAt("#DCE5FF", TILE_X, TILE_Y, TILE_S, ` opacity="0.9" filter="url(#b2)"`)
      : `<rect width="1000" height="1000" rx="${radius}" fill="${bg}"/>`) + markAt(fg, TILE_X, TILE_Y, TILE_S),
    [px, px],
  );
};

const ogSvg = () => {
  const ls = 660 / LOCK_W;
  const ts = 27 / tagline.capH;
  return wrap(
    1200,
    630,
    `<rect width="1200" height="630" fill="${INK}"/>` +
      markAt(WHITE, 610, -95, 0.82, ` opacity="0.07"`) +
      lockupBody(WHITE, 92, 188, ls) +
      `<path fill="#A6A6A6" transform="translate(96 ${188 + LOCK_H * ls + 62}) scale(${ts})" d="${tagline.d}"/>`,
    [1200, 630],
  );
};

// ---- encoders -------------------------------------------------------------
const png = (svg) => sharp(Buffer.from(svg)).png({ compressionLevel: 9 }).toBuffer();

// .ico container holding PNG frames (supported everywhere that still asks for favicon.ico)
const ico = (frames) => {
  const head = Buffer.alloc(6 + 16 * frames.length);
  head.writeUInt16LE(1, 2);
  head.writeUInt16LE(frames.length, 4);
  let offset = head.length;
  frames.forEach(({ size, data }, i) => {
    const e = 6 + 16 * i;
    head.writeUInt8(size % 256, e);
    head.writeUInt8(size % 256, e + 1);
    head.writeUInt16LE(1, e + 4);
    head.writeUInt16LE(32, e + 6);
    head.writeUInt32LE(data.length, e + 8);
    head.writeUInt32LE(offset, e + 12);
    offset += data.length;
  });
  return Buffer.concat([head, ...frames.map((f) => f.data)]);
};

// Minimal ICC v4.4 display profile tagged Rec.2100 PQ (BT.2020 primaries, ST 2084 transfer via `cicp`).
// Assigning it to a black/white JPEG makes the white an HDR highlight on HDR screens: the LinkedIn "glow".
const pqIcc = () => {
  const s15 = (v) => {
    const b = Buffer.alloc(4);
    b.writeInt32BE(Math.round(v * 65536));
    return b;
  };
  const sig = (s) => Buffer.from(s, "latin1");
  const xyz = (...v) => Buffer.concat([sig("XYZ "), Buffer.alloc(4), ...v.map(s15)]);
  const mluc = (text) => {
    const str = Buffer.from(text, "utf16le").swap16();
    const h = Buffer.alloc(28);
    h.write("mluc", 0, "latin1");
    h.writeUInt32BE(1, 8);
    h.writeUInt32BE(12, 12);
    h.write("enUS", 16, "latin1");
    h.writeUInt32BE(str.length, 20);
    h.writeUInt32BE(28, 24);
    return Buffer.concat([h, str]);
  };
  const trc = Buffer.concat([sig("para"), Buffer.alloc(8), s15(2.4)]); // fallback for readers that ignore cicp
  const tags = [
    ["desc", mluc("Rec. ITU-R BT.2100 PQ")],
    ["cprt", mluc("No copyright, use freely")],
    ["wtpt", xyz(0.9642, 1, 0.8249)],
    ["chad", Buffer.concat([sig("sf32"), Buffer.alloc(4), ...[1.04788208, 0.0229187, -0.05021667, 0.02958679, 0.99047852, -0.01707458, -0.00924683, 0.01507568, 0.75167847].map(s15)])],
    ["rXYZ", xyz(0.673459, 0.279033, -0.001931)],
    ["gXYZ", xyz(0.165661, 0.675338, 0.029979)],
    ["bXYZ", xyz(0.1251, 0.045629, 0.797162)],
    ["rTRC", trc],
    ["gTRC", trc],
    ["bTRC", trc],
    ["cicp", Buffer.concat([sig("cicp"), Buffer.alloc(4), Buffer.from([9, 16, 0, 1])])],
  ];
  const table = Buffer.alloc(4 + 12 * tags.length);
  table.writeUInt32BE(tags.length, 0);
  const blocks = [];
  const placed = new Map();
  let offset = 128 + table.length;
  tags.forEach(([name, data], i) => {
    if (!placed.has(data)) {
      placed.set(data, offset);
      const padded = Buffer.concat([data, Buffer.alloc((4 - (data.length % 4)) % 4)]);
      blocks.push(padded);
      offset += padded.length;
    }
    table.write(name, 4 + 12 * i, "latin1");
    table.writeUInt32BE(placed.get(data), 8 + 12 * i);
    table.writeUInt32BE(data.length, 12 + 12 * i);
  });
  const head = Buffer.alloc(128);
  head.writeUInt32BE(offset, 0);
  head.writeUInt32BE(0x04400000, 8);
  head.write("mntrRGB XYZ ", 12, "latin1");
  [2026, 1, 1, 0, 0, 0].forEach((v, i) => head.writeUInt16BE(v, 24 + 2 * i));
  head.write("acsp", 36, "latin1");
  [0.9642, 1, 0.8249].forEach((v, i) => s15(v).copy(head, 68 + 4 * i));
  return Buffer.concat([head, table, ...blocks]);
};

const withIcc = (jpeg, icc) => {
  let at = 2; // after SOI, and after JFIF APP0 when present
  if (jpeg[2] === 0xff && jpeg[3] === 0xe0) at = 4 + jpeg.readUInt16BE(4);
  const seg = Buffer.alloc(18);
  seg.writeUInt16BE(0xffe2, 0);
  seg.writeUInt16BE(16 + icc.length, 2);
  seg.write("ICC_PROFILE\0", 4, "latin1");
  seg.writeUInt8(1, 16);
  seg.writeUInt8(1, 17);
  return Buffer.concat([jpeg.subarray(0, at), seg, icc, jpeg.subarray(at)]);
};

// ---- write ----------------------------------------------------------------
const out = (rel, data) => {
  const file = path.join(root, rel);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, data);
  return data;
};
const h = (px) => [Math.round((px * mark.w) / mark.h), px];
const w = (px) => [px, Math.round((px * LOCK_H) / LOCK_W)];

for (const [tone, fill] of Object.entries(tones)) {
  out(`logo/svg/adaptral-mark-${tone}.svg`, markSvg(fill));
  out(`logo/svg/adaptral-logo-${tone}.svg`, lockupSvg(fill));
  for (const px of [512, 2048]) out(`logo/png/adaptral-mark-${tone}-${px}.png`, await png(markSvg(fill, h(px))));
  for (const px of [1200, 3600]) out(`logo/png/adaptral-logo-${tone}-${px}.png`, await png(lockupSvg(fill, w(px))));
}

const dark = { bg: INK, fg: WHITE };
const light = { bg: WHITE, fg: INK };

// favicon: white mark on an ink tile, readable on light and dark browser chrome
const faviconSvg = out("logo/favicon/favicon.svg", tileSvg(64, { ...dark, radius: 220, s: 0.78 }));
const frames = [];
for (const size of [16, 32, 48]) {
  const data = out(`logo/favicon/favicon-${size}.png`, await png(tileSvg(size, { ...dark, radius: 220, s: 0.78 })));
  frames.push({ size, data });
}
const favicon = out("logo/favicon/favicon.ico", ico(frames));
const apple = out("logo/favicon/apple-touch-icon.png", await png(tileSvg(180, dark)));
const icon192 = out("logo/favicon/icon-192.png", await png(tileSvg(192, dark)));
const icon512 = out("logo/favicon/icon-512.png", await png(tileSvg(512, dark)));

// social profile pictures
out("logo/social/profile-dark-1080.png", await png(tileSvg(1080, dark)));
out("logo/social/profile-light-1080.png", await png(tileSvg(1080, light)));
out("logo/social/linkedin-dark-800.png", await png(tileSvg(800, dark)));
out("logo/social/linkedin-light-800.png", await png(tileSvg(800, light)));
out("logo/social/linkedin-glow-800.png", await png(tileSvg(800, { fg: WHITE, glow: true })));
const hdrBase = await sharp(Buffer.from(tileSvg(800, { bg: "#000000", fg: WHITE })))
  .flatten({ background: "#000000" })
  .jpeg({ quality: 100, chromaSubsampling: "4:4:4" })
  .toBuffer();
out("logo/social/linkedin-hdr-800.jpg", withIcc(hdrBase, pqIcc()));
const og = out("logo/social/og-1200x630.png", await png(ogSvg()));

// copies the site serves
out("app/icon.svg", faviconSvg);
out("app/favicon.ico", favicon);
out("app/apple-icon.png", apple);
out("app/opengraph-image.png", og);
out("public/icon-192.png", icon192);
out("public/icon-512.png", icon512);
out("public/logo.png", icon512);

console.log("logo kit written");
