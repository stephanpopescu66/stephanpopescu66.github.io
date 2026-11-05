# stephanpopescu — portfolio

Static site. No build step. `index.html` + `college.html`, one `style.css`, one `main.js`.
Design rules and the audit checklist: `DESIGN_RULES.md`.

## Preview and edit the wording

```sh
python3 tools/edit_server.py        # serves on http://localhost:8811
```

- `http://localhost:8811/` — the site.
- `http://localhost:8811/?edit` — click any text and type. Cmd+S (or **Save**) writes the change into `index.html`; the previous file is kept as `index.html.bak`.
- Without the server (for example on GitHub Pages), **Save** downloads a new `index.html` instead.

## Role links


## Media
- `media/drone/` — my DJI clips, 540p, cut with `avconvert`.
- `media/hands/`, `media/team/` — my photos (Photos export → `sips`, EXIF rotation baked in).
- `media/projects/pos-*.jpg` — PersonalOS simulator screenshots in privacy mode (amounts hidden), cropped to the cards.
- `media/lucid/` — Lucid press images (credited on the page). Robotaxi image: Lucid/Nuro/Uber press photo.
- `media/milwaukee/` — full-size drawing sheets from the published patent application.
- Archer image is linked from Archer's press CDN.

## Deploy
GitHub Pages: push to `main`, then Settings → Pages → Deploy from branch → `main` / root.
