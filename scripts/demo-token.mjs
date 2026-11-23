import { SignJWT } from "jose";

const tenant = process.argv[2];
const policies = {
  tenant0: ["bankrate-session", "TENANT0_SESSION_SECRET"],
  switchback: ["switchback-sso", "SWITCHBACK_SSO_SECRET"],
};
if (tenant !== "tenant0" && tenant !== "switchback") {
  throw new Error("Usage: npm run --silent token -- tenant0|switchback");
}

const [issuer, secretEnv] = policies[tenant];
const key = new TextEncoder().encode(process.env[secretEnv] ?? "");
if (key.byteLength < 32) throw new Error(`Configure ${secretEnv} with at least 32 bytes`);

const claims = tenant === "switchback" ? { tenant, region: "US", tenureDays: 60 } : { tenant };
console.log(await new SignJWT(claims)
  .setProtectedHeader({ alg: "HS256" })
  .setIssuer(issuer)
  .setAudience(`offers:${tenant}`)
  .setSubject("demo-user")
  .setExpirationTime("10m")
  .sign(key));
