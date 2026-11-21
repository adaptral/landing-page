# Adaptral logo kit

Built from `paths.json`. The generator script was removed when the sites merged; it is in this repo's history at `scripts/build-logos.mjs` (commit `9747b7b`).

- **Mark**: the integral sign, vectorised from the reference artwork and made exactly point-symmetric.
- **Wordmark**: Montserrat Bold, tracking -12, converted to outlines (no font needed to render it).
- **Lockup**: mark height is 2.4 cap heights, centred on the cap height; the wordmark tucks under the top hook.
- **Colours**: ink `#0A0A0A`, white `#FFFFFF`.

"black" files are for light backgrounds, "white" files are for dark backgrounds.

| Folder | Contents |
| --- | --- |
| `svg/` | `adaptral-mark-*` (logo only) and `adaptral-logo-*` (logo with wordmark), black and white |
| `png/` | The same four on a transparent background: mark at 512 and 2048 px tall, lockup at 1200 and 3600 px wide |
| `favicon/` | `favicon.ico` (16/32/48), `favicon.svg`, PNGs, `apple-touch-icon.png`, `icon-192.png`, `icon-512.png` |
| `social/` | Profile pictures and the 1200x630 share image |

## Social profile pictures

| File | Use |
| --- | --- |
| `social/profile-dark-1080.png`, `profile-light-1080.png` | X, Instagram, anything that crops to a circle |
| `social/linkedin-dark-800.png`, `linkedin-light-800.png` | LinkedIn company logo |
| `social/linkedin-glow-800.png` | A drawn glow. Looks the same on every screen. |
| `social/linkedin-hdr-800.jpg` | The real "glowing logo": a JPEG tagged Rec.2100 PQ, so the white is an HDR highlight |

The HDR file only glows on HDR screens (recent iPhones, Pixels, MacBook Pros) in Chrome or Safari; elsewhere it
is a plain white-on-black logo. Upload it as-is: any re-save, crop in an editor or screenshot strips the profile.
LinkedIn may stop honouring this at any time.
