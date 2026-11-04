# stephanpopescu — portfolio

Static site. No build step. `index.html` + `college.html`, one `style.css`, one `main.js`.

Preview locally:

```sh
python3 -m http.server 8811   # then open http://localhost:8811
```

## Media
- `media/drone/` — 540p clips (hero is 720p), cut with `avconvert`, poster frames from `qlmanage`.
- Photos are resized to ≤1600 px JPEG with `sips`.
- Company images are linked, not copied: Archer press image, Lucid Gravity from Wikimedia Commons (CC BY-SA 4.0, credited), patent drawing from Google Patents.

## Deploy
GitHub Pages: push to `main`, then Settings → Pages → Deploy from branch → `main` / root.
