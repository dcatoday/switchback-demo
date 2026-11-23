"use server";

import { SignJWT } from "jose";
import { authPolicies } from "../lib/auth";
import { switchbackOffersResponse, tenant0OffersResponse } from "../lib/offer-handlers";
import { mockPricing } from "../lib/switchback";

async function demoToken(tenant: keyof typeof authPolicies) {
  const policy = authPolicies[tenant];
  const key = new TextEncoder().encode(process.env[policy.secretEnv] ?? "");
  if (key.byteLength < 32) throw new Error("Demo signing keys are missing");

  const claims = tenant === "switchback" ? { tenant, region: "US", tenureDays: 60 } : { tenant };
  return new SignJWT(claims)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuer(policy.issuer)
    .setAudience(policy.audience)
    .setSubject("interview-demo")
    .setExpirationTime("30s")
    .sign(key);
}

export async function runDemo(scenario: string) {
  const path = scenario === "tenant0" ? "/api/offers" : "/api/offers/switchback";
  const url = new URL(path, "https://switchback.example");

  try {
    let response: Response;
    switch (scenario) {
      case "tenant0":
        response = await tenant0OffersResponse(new Request(url, {
          headers: { cookie: `tenant0_session=${await demoToken("tenant0")}` },
        }));
        break;
      case "available":
      case "slow":
        response = await switchbackOffersResponse(new Request(url, {
          headers: { authorization: `Bearer ${await demoToken("switchback")}` },
        }), mockPricing(scenario));
        break;
      case "unauthorized":
        response = await switchbackOffersResponse(new Request(url), mockPricing("available"));
        break;
      default:
        return { path, status: 400, body: { error: "Unknown scenario" } };
    }
    return { path, status: response.status, body: await response.json() };
  } catch {
    return { path, status: 500, body: { error: "The demo could not run. Check the server configuration." } };
  }
}
