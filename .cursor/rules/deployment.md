# Tizi Tracker — deployment

## Production (primary)

- **URL**: `https://tizi.gathogo.co.ke`
- **Host**: Hetzner VPS, Ubuntu, IP `204.168.151.133` (SSH: key auth, e.g. `ssh root@204.168.151.133`)
- **Static root on server**: `/opt/apps/tizi-tracker/` (contents of Vite `dist/` after build)
- **Reverse proxy**: Caddy (defined in separate infra repo); SPA routing uses `try_files` so client-side routes work

## Infra repository

- Shared Caddy + Docker layout: `~/Documents/vps-infra/` (private GitHub repo `jgathogo/vps-infra`)
- Authoritative ops doc: `vps-infra/README.md` (not duplicated here in full)

## Deploy steps (from dev machine)

After code changes and a green test run:

```bash
npm run build
rsync -avz --delete dist/ root@204.168.151.133:/opt/apps/tizi-tracker/
```

No container rebuild is required for the static app unless infra changes.

## Version string in UI

- Vite `define` injects `__BUILD_TIMESTAMP__` (ISO string at build time)
- `App.tsx` formats it as `APP_VERSION` (e.g. `YYYY.MM.DD-HHmm`) and shows it in the bottom nav for “which build am I on?”

## Other hosts

- `docs/DEPLOYMENT.md` covers Vercel / Netlify / GitHub Pages patterns; production emphasis is the VPS above.

## Secrets

- Never commit `.env` or real Firebase / API keys. Use `VITE_*` env vars at build time for optional features.
