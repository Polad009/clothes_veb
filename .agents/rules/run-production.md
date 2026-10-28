# Production Run Rule

- When asked to run, start, open or preview the site, never use `npm run dev` / `next dev`.
- Always run production: build first, then start.
- Frontend (port 3000): `npm run build && npm run start`
- Admin portal (port 3001): `npm run build && npm run start`
- Backend (port 5000): `npm run start` (node, no nodemon/dev watcher)
- Rebuild (`npm run build`) after any code change before restarting.
- Run all three in the background, then verify each URL returns HTTP 200 and report the URLs.
- Do not open the dev server for testing performance or page transitions.
- Whenever asked to run/start the site, execute `npm run start:prod` (or start frontend, admin, and backend in production mode).

## Auto-rebuild after every change
- After ANY code change (edit, new file, dependency or config change) in frontend, admin portal or backend, automatically do this without asking me:
  1. Stop the old running process of the affected service (free its port: 3000 / 3001 / 5000).
  2. Frontend / admin: run `npm run build`. If the build fails, fix the error and rebuild until it succeeds. Do not start a broken build.
  3. Start the service again in production mode in the background (`npm run start`, with the correct port).
  4. Verify the URL returns HTTP 200.
  5. Tell me in one short line that it was rebuilt and is live.
- Rebuild only the service that changed. If only the backend changed, do not rebuild the frontend.
- Never leave the site running on an outdated build after a change.
- Never switch to dev mode (`npm run dev`) unless I explicitly say "dev rejimində aç".
- If a change affects shared code or env variables used by several services, rebuild all affected services.
