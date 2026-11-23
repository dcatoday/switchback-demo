import { errors, jwtVerify } from "jose";

export const authPolicies = {
  tenant0: {
    issuer: "bankrate-session",
    audience: "offers:tenant0",
    secretEnv: "TENANT0_SESSION_SECRET",
  },
  switchback: {
    issuer: "switchback-sso",
    audience: "offers:switchback",
    secretEnv: "SWITCHBACK_SSO_SECRET",
  },
} as const;

type Tenant = keyof typeof authPolicies;
const encoder = new TextEncoder();

async function verifyIdentity(tenant: Tenant, token: string | undefined) {
  if (!token) return null;

  const { issuer, audience, secretEnv } = authPolicies[tenant];
  const secret = encoder.encode(process.env[secretEnv] ?? "");
  if (secret.byteLength < 32) {
    throw new Error(`Configure ${secretEnv} with at least 32 bytes`);
  }

  try {
    const { payload } = await jwtVerify(token, secret, {
      algorithms: ["HS256"],
      issuer,
      audience,
      requiredClaims: ["sub", "exp"],
    });
    if (payload.tenant !== tenant || typeof payload.sub !== "string" || !payload.sub.trim()) return null;
    return { sub: payload.sub, region: payload.region, tenureDays: payload.tenureDays };
  } catch (error) {
    if (error instanceof errors.JOSEError) return null;
    throw error;
  }
}

export async function authenticateTenant0(request: Request) {
  const session = request.headers.get("cookie")?.match(/(?:^|;\s*)tenant0_session=([^;]+)/)?.[1];
  const identity = await verifyIdentity("tenant0", session);
  return identity && { tenant: "tenant0" as const, userId: identity.sub };
}

export async function authenticateSwitchback(request: Request) {
  const token = request.headers.get("authorization")?.match(/^Bearer ([^\s]+)$/i)?.[1];
  const identity = await verifyIdentity("switchback", token);
  if (!identity) return null;

  const { region, tenureDays } = identity;
  if (
    typeof region !== "string" || !/^[A-Z]{2}$/.test(region) ||
    typeof tenureDays !== "number" || !Number.isSafeInteger(tenureDays) || tenureDays < 0
  ) return null;

  return { tenant: "switchback" as const, userId: identity.sub, region, tenureDays };
}

export type Tenant0User = NonNullable<Awaited<ReturnType<typeof authenticateTenant0>>>;
export type SwitchbackUser = NonNullable<Awaited<ReturnType<typeof authenticateSwitchback>>>;
