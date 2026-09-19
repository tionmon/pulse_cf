# Pulse CF

Cloudflare-native uptime monitor, adapted from [tionmon/pulse](https://github.com/tionmon/pulse).

## Architecture

- Cloudflare Workers for the API and probes
- D1 for monitors, checks, settings, and sessions
- Cron Trigger every minute
- Workers Static Assets for the React interface

## Deploy

```sh
npm install
npm run build
npx wrangler d1 create pulse-cf
# Put the returned database_id in wrangler.jsonc.
npx wrangler secret put ADMIN_PASSWORD
npx wrangler d1 migrations apply pulse-cf --remote
npx wrangler deploy
```

The administrator username is `admin`. The password is stored only as a Worker secret. Telegram can be configured in the admin interface.

## Security note

The Worker rejects obvious private/local targets, but the Workers `fetch()` API does not expose the resolved destination IP. It therefore cannot reproduce the original Node deployment's DNS-pinning protection exactly. Only administrators can add monitors.
