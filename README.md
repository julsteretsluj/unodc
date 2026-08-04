# UNODC — SEAMUN I 2027

Committee microsite for the **United Nations Office on Drugs and Crime** at [SEAMUN I](https://seamun.com) (January 16–17, 2027).

Matches the look of [seamun.com](https://seamun.com) and the other committee portals (e.g. `unhrc.seamun.com`, `unsc.seamun.com`), with a UNODC indigo accent.

## Contents

- Committee overview, topics, and country allocations
- Group 3 schedule
- Placeholders for **Rules of Procedure**, **position paper portal**, and **chair report**
- Committee wheel + access gate (same pattern as sibling sites)
- Links to main conference registration

## Local preview

```bash
python3 -m http.server 8080
```

Open `http://localhost:8080`.

## Deploy

Static site for Netlify / GitHub Pages. `netlify.toml` publishes the repo root. Point `unodc.seamun.com` at this site.
