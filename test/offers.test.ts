import assert from "node:assert/strict";
import { test } from "node:test";
import { SignJWT } from "jose";
import { GET as tenant0Offers } from "../app/api/offers/route";
import { GET as switchbackOffers } from "../app/api/offers/switchback/route";
import { authPolicies } from "../lib/auth";

const baseline = { id: "baseline-savings", kind: "baseline", product: "savings" };
const origin = "http://localhost:3000";

async function token(tenant: keyof typeof authPolicies, claims: Record<string, unknown> = {}, expires = "5m") {
  const policy = authPolicies[tenant];
  const key = new TextEncoder().encode(`test-key-for-${tenant}-only-do-not-use-outside-tests`);
  process.env[policy.secretEnv] = new TextDecoder().decode(key);
  return new SignJWT({ tenant, region: "US", tenureDays: 60, ...claims })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuer(policy.issuer)
    .setAudience(policy.audience)
    .setSubject("demo-user")
    .setExpirationTime(expires)
    .sign(key);
}

function partnerRequest(jwt?: string) {
  return new Request(`${origin}/api/offers/switchback`, {
    headers: jwt ? { authorization: `Bearer ${jwt}` } : {},
  });
}

test("each route accepts its own credentials and rejects invalid partner identity", async () => {
  process.env.DEMO_SUPPLY = "available";
  const session = await token("tenant0");
  const partner = await token("switchback");
  const tenantRequest = (jwt: string) => new Request(`${origin}/api/offers`, {
    headers: { cookie: `tenant0_session=${jwt}` },
  });

  const normal = await tenant0Offers(tenantRequest(session));
  assert.equal(normal.status, 200);
  assert.deepEqual(await normal.json(), { offers: [baseline] });
  assert.equal((await tenant0Offers(tenantRequest(partner))).status, 401);

  const invalidCredentials = [
    undefined,
    session,
    await token("switchback", {}, "1s ago"),
    await token("switchback", { region: null }),
    partner.replace(/\.[^.]+$/, ".invalid"),
  ];
  for (const credential of invalidCredentials) {
    assert.equal((await switchbackOffers(partnerRequest(credential))).status, 401);
  }

  const enriched = await switchbackOffers(partnerRequest(partner));
  assert.equal(enriched.status, 200);
  assert.deepEqual(await enriched.json(), {
    offers: [baseline, {
      id: "switchback-savings", kind: "exclusive", product: "savings", apyBps: 450,
    }],
  });
});

test("an authenticated Switchback request returns only eligible baseline offers when Supply fails", async () => {
  const partner = await token("switchback");
  try {
    for (const mode of ["slow", "unavailable"]) {
      process.env.DEMO_SUPPLY = mode;
      const response = await switchbackOffers(partnerRequest(partner));
      assert.equal(response.status, 200);
      assert.equal(response.headers.get("cache-control"), "private, no-store");
      assert.deepEqual(await response.json(), { offers: [baseline] });
    }
    const otherRegion = await switchbackOffers(partnerRequest(await token("switchback", { region: "CA" })));
    assert.deepEqual(await otherRegion.json(), { offers: [] });
  } finally {
    delete process.env.DEMO_SUPPLY;
  }
});
