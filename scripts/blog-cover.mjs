// Generate a blog post's cover with OpenAI, crop it to 2:1 and save public/blog/<slug>.webp.
//
//   npm run blog:cover -- <slug> "<the idea: one visual metaphor for the post>"
//
// Reads OPENAI_API_KEY (and optionally OPENAI_IMAGE_MODEL, default gpt-image-2) from .env.local or
// .env, both gitignored. The brand rules below are appended to every prompt, so a cover cannot drift
// off them: black ground, the site's spectrum as light, no text, no AI clichés.
import { mkdirSync, writeFileSync } from "node:fs";
import sharp from "sharp";

for (const file of [".env.local", ".env"]) {
  try {
    process.loadEnvFile(file);
  } catch {
    /* missing file: use what is already in the environment */
  }
}

const [slug, idea] = process.argv.slice(2);
if (!slug || !idea || !/^[a-z0-9-]+$/.test(slug)) {
  console.error('usage: npm run blog:cover -- <slug> "<one visual metaphor for the post>"');
  process.exit(1);
}
const key = process.env.OPENAI_API_KEY;
if (!key) {
  console.error("OPENAI_API_KEY is not set (add it to .env.local)");
  process.exit(1);
}

// The same values as src/design/tokens.css.
const BRAND = [
  "Abstract editorial illustration, wide landscape composition, one strong focal point in the centre third, generous negative space.",
  "Pure black ground (#000000). Light comes from a soft spectrum used sparingly, like light falling on a surface: violet #989bff, teal #8be8d7, amber #f5c582 and pink #ff91b3. Everything else is near-black and cool off-white (#f5f8ff).",
  "Visual language: smooth loss-landscape terrain, layered translucent planes, fine wireframe meshes, flowing particle fields, a small precise object beside a large heavy one. Calm, precise, scientific.",
  "No text, no letters, no numbers, no logos, no user interfaces, no screenshots, no people, faces or hands.",
  "No robots, no glowing brains, no circuit boards, no chips, no neon cyberpunk city, no lens flare, not stock-photo, not cartoonish.",
].join(" ");

const res = await fetch("https://api.openai.com/v1/images/generations", {
  method: "POST",
  headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
  body: JSON.stringify({ model: process.env.OPENAI_IMAGE_MODEL ?? "gpt-image-2", prompt: `${idea}. ${BRAND}`, size: "1536x1024", n: 1 }),
});
if (!res.ok) {
  console.error(`OpenAI ${res.status}: ${(await res.text()).slice(0, 400)}`);
  process.exit(1);
}
const b64 = (await res.json()).data?.[0]?.b64_json;
if (!b64) {
  console.error("OpenAI returned no image");
  process.exit(1);
}

// 1536x1024 is 3:2; every page renders the cover at 2:1, so keep the centre band.
mkdirSync("public/blog", { recursive: true });
const out = `public/blog/${slug}.webp`;
const webp = await sharp(Buffer.from(b64, "base64")).resize(1536, 768, { fit: "cover", position: "centre" }).webp({ quality: 82 }).toBuffer();
writeFileSync(out, webp);
console.log(`${out} (${Math.round(webp.length / 1024)} KB). Set image: "/blog/${slug}.webp" in the post's frontmatter, then look at it.`);
