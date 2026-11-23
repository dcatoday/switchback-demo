# Switchback offers API

A local Next.js App Router scaffold for the Bankrate case study. Both routes return JSON with private, non-cacheable responses. The demo models one offers hub surface.

| Route | Credential | Result |
| --- | --- | --- |
| `GET /api/offers` | Signed `tenant0_session` cookie | Eligible baseline offers |
| `GET /api/offers/switchback` | Switchback JWT in `Authorization: Bearer …` | Eligible baseline offers plus verified exclusive quotes when available |

Each route verifies its own signing key, issuer, audience, expiration, subject, and tenant claim. Switchback also requires region and tenure claims. Invalid credentials return 401 before offer selection. The tenant 0 route calls the baseline module directly and has no pricing path.

## Run locally

Use Node 22 or newer. From this directory:

```sh
npm ci
cp .env.example .env.local
```

Set each secret in `.env.local` to a different value generated with `openssl rand -hex 32`. Then run `npm run dev` and open http://localhost:3000 to try the four demo scenarios. The demo uses fixed fictional identities and the same request handlers as the API routes. Pricing mode is set per demo request. To call the API directly, use another terminal:

```sh
TENANT0_TOKEN="$(npm run --silent token -- tenant0)"
SWITCHBACK_TOKEN="$(npm run --silent token -- switchback)"
curl -i --cookie "tenant0_session=$TENANT0_TOKEN" http://localhost:3000/api/offers
curl -i -H "Authorization: Bearer $SWITCHBACK_TOKEN" http://localhost:3000/api/offers/switchback
curl -i http://localhost:3000/api/offers/switchback
```

Set `DEMO_SUPPLY=slow` or `DEMO_SUPPLY=unavailable` in `.env.local` and restart the app to see the baseline-only response. Run `npm test` for two route-level tests and `npm run build` for the Next.js build.

## Decisions and extension points

The baseline demo offer needs no live quote. The demo treats US Switchback workers as eligible for baseline savings and requires 30 days of tenure before asking for an exclusive quote. Those rules and the quote are fixtures. Supply gets 150 ms and an abort signal. When it fails or misses the deadline, the authenticated user still gets independently eligible baseline offers, which can be an empty list.

The signed session cookie and HS256 handoff are local stand-ins for existing authentication. For a production integration, wire tenant 0 to the existing session verifier and pin Switchback verification to the partner's public keys and agreed claim schema. A teammate can replace `demoPricing` behind the existing pricing interface, validate the returned quote against the authenticated tenant and request context, and add metrics for timeout and error rates.
