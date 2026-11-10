# Mahipal Jadeja — personal website

A static website for research, Generative AI education, practical learning resources, and professional enquiries. The existing GitHub Pages architecture, custom domain, interactive activities, extension, and policy URLs are retained. No framework, runtime database, or custom backend is required.

## Update the website

1. Edit the relevant verified JSON file in `assets/data/`.
2. Run `python3 scripts/build_site.py` from the repository root. It also works using an absolute script path from another directory.
3. Preview with `python3 -m http.server 8765`, then open `http://localhost:8765`.
4. Check the affected pages at desktop and mobile sizes, and inspect the Git diff before committing.

The generated HTML is committed so GitHub Pages can serve the site directly. Do not edit generated page content by hand: change the generator or the JSON, then regenerate. Styling is in `assets/site.css`; navigation, archive filtering, video loading, gallery, and email drafting are in `assets/site.js`.

## Content files

| File | Maintained content |
| --- | --- |
| `assets/data/profile.json` | Academic background, education, experience, supervision, service, source CV, dated metrics |
| `assets/data/talks.json` | Complete documented talk archive; title, institution, date, dateLabel, year, topic, audience, URL and CV source |
| `assets/data/publications.json` | Publication titles, authors, year, venue, DOI and source links |
| `assets/data/recognitions.json` | Source-backed features, interviews and educational contributions |
| `assets/data/additional-contributions.json` | Programme advisory contribution, MIT group presentation and Critikid interview |
| `assets/data/videos.json` | Actual YouTube video IDs, titles, canonical watch URLs, official thumbnails, descriptions and verified upload dates |
| `assets/data/playlists.json` | Actual YouTube playlists; use `featured: true` to include a playlist on the learning page |
| `assets/data/media.json` | Local image reference, source LinkedIn post, title, institution, date, topic, alt text, source context and reuse permission |

Keep dates and source URLs with every addition. Do not infer attendance, increase headline counts automatically, or imply organizational employment from a feature or educational contribution. Homepage outreach figures deliberately retain the conservative, dated CV snapshot. Add local optimized WebP photographs to `assets/media/`; do not hotlink temporary LinkedIn CDN addresses. Preserve the factual context in photo captions and meaningful alternative text.

## Pages and preserved resources

The primary pages are `index.html`, `talks.html`, `recognition.html`, `tools.html`, `learning.html`, `about.html`, and `contact.html`. The teaching demonstration index is also generated. Original interactive labs, standalone demonstrations, extension pages, and policies remain independent and are not overwritten by the generator. Existing routes are retained; no migration redirects are needed.

The downloadable official CV is `assets/Mahipal_Jadeja_CV.pdf`. Replace it only with an authoritative updated copy, update source metadata, and verify source-page links in the talks archive.

## Contact behavior

The contact form prepares a message locally and opens either the visitor's email application (`mailto:`) or a Gmail compose tab. The visitor reviews the draft and presses Send in their email service. Copy-message and copy-address controls provide alternatives. The site does not receive or store submissions and never displays a false “sent” confirmation. Direct institutional email and LinkedIn links remain available without JavaScript.

If a managed delivery form is added later, configure and verify its actual recipient and delivery behavior first. Do not publish an unactivated endpoint. Update the visitor-facing data handling notice when behavior changes.

## Performance, accessibility and discoverability

Fonts are self-hosted under `assets/fonts/` with their licenses. Photos use local WebP assets. Most images are lazy-loaded with reserved dimensions. YouTube frames are created only after a visitor chooses to play; preview thumbnails are delivered by YouTube. The responsive layout includes keyboard focus styles, a skip link, semantic navigation, reduced-motion handling, a native dialog lightbox, and labeled form controls.

Each generated page includes a unique title, description, canonical URL, sharing metadata and Person structured data. Verified video upload dates support VideoObject markup on the learning page. `sitemap.xml`, `robots.txt`, and a custom `404.html` are generated. Keep canonical URLs aligned with the `BASE` value in `scripts/build_site.py`.

## Verify before publishing

- Run `python3 scripts/build_site.py`.
- Check changed content against its cited source.
- Check internal links and download availability.
- Test filters including empty results and URL restoration.
- Test menu, lightbox keyboard focus/Escape, and video activation.
- Test contact validation, mail/Gmail draft preparation, and copy alternatives without sending unsolicited mail.
- Inspect 360px, 390px, tablet, and desktop layouts; check contrast and reduced motion.
- Commit the generator, data, assets, and regenerated HTML together.

Deploy through the repository's existing GitHub Pages configuration. `CNAME` remains `mahipaljadeja.com`.
