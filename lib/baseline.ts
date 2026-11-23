import type { SwitchbackUser, Tenant0User } from "./auth";

export type BaselineOffer = {
  id: string;
  kind: "baseline";
  product: "savings";
};

export function baselineOffers(user: Tenant0User | SwitchbackUser): BaselineOffer[] {
  // Demo policy: this generic savings offer needs no live quote or additional signals.
  if (user.tenant === "switchback" && user.region !== "US") return [];
  return [{ id: "baseline-savings", kind: "baseline", product: "savings" }];
}

export function offersResponse(body: unknown, status = 200) {
  return Response.json(body, {
    status,
    headers: { "Cache-Control": "private, no-store" },
  });
}
