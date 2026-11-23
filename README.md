# Switchback offers API

A local Next.js App Router scaffold for the Bankrate case study. Both routes return JSON with private, non-cacheable responses. The demo models one offers hub surface.

The [Team & Delivery Plan](TEAM-AND-DELIVERY-PLAN.md) covers the launch forecast, team ownership, stakeholder communication, and pilot readiness.

The [AI Leverage Log](AI-LEVERAGE-LOG.md) describes how I used Codex across the plan and the technical build.

| Route | Credential | Result |
| --- | --- | --- |
| `GET /api/offers` | Signed `tenant0_session` cookie | Eligible baseline offers |
| `GET /api/offers/switchback` | Switchback JWT in `Authorization: Bearer …` | Eligible baseline offers plus verified exclusive quotes when available |

Each route verifies its own signing key, issuer, audience, expiration, subject, and tenant claim. Switchback also requires region and tenure claims. Invalid credentials return 401 before offer selection. The tenant 0 route calls the baseline module directly and has no pricing path.

## Run locally

Use Node 22 or newer (with npm). Run these commands from the app directory containing `package.json`.

```sh
npm ci
```

Set up the demo and start the app:

```sh
npm run setup
npm run dev
```

`npm run setup` creates `.env.local` with two separate random demo signing keys. If you already have a `.env.local`, setup preserves it. If it contains blank values from `.env.example`, fill both with separate random values of at least 32 bytes and restart the dev server.

Open [http://localhost:3000](http://localhost:3000), or use the local URL printed by Next.js if port 3000 is busy. The four buttons use fictional identities and mock pricing through the same handlers as the API routes. The demo requires no accounts, database, or external services after dependencies are installed.

### Optional API requests

Use a second terminal in the project directory. These examples use macOS or Linux shell syntax and assume port 3000.

```sh
TENANT0_TOKEN="$(npm run --silent token -- tenant0)"
SWITCHBACK_TOKEN="$(npm run --silent token -- switchback)"
curl -i --cookie "tenant0_session=$TENANT0_TOKEN" http://localhost:3000/api/offers
curl -i -H "Authorization: Bearer $SWITCHBACK_TOKEN" http://localhost:3000/api/offers/switchback
curl -i http://localhost:3000/api/offers/switchback
```

Set `DEMO_SUPPLY=slow` or `DEMO_SUPPLY=unavailable` in `.env.local` and restart the app to see the baseline-only response. Run `npm test` for two route-level tests and `npm run build` for the Next.js build.

## Decisions and extension points

I chose **tenant isolation** as my hands-on slice. Each route maps to one tenant and verifies that tenant’s credential before selecting offers. The tenant 0 handler can only produce baseline offers through its call to the baseline selector. The Switchback handler can add exclusive quotes only after it obtains verified Switchback claims. Missing, invalid, or cross-tenant credentials return `401`. The first route test checks that each credential works on its own route and is rejected on the other, and asserts the complete baseline-only tenant 0 response. Marcus can extend these checks as he takes on integration readiness.

**Pricing fallback** is a secondary behavior on the authenticated Switchback path.

The baseline demo offer needs no live quote. The demo treats US Switchback workers as eligible for baseline savings and requires 30 days of tenure before asking for an exclusive quote. Those rules and the quote are fixtures. Supply gets 150 ms and an abort signal. When it fails or misses the deadline, the authenticated user still gets independently eligible baseline offers, which can be an empty list.

The signed session cookie and HS256 handoff are local stand-ins for existing authentication. For a production integration, wire tenant 0 to the existing session verifier and pin Switchback verification to the partner's public keys and agreed claim schema. A teammate can replace `demoPricing` behind the existing pricing interface, validate the returned quote against the authenticated tenant and request context, and add metrics for timeout and error rates.
