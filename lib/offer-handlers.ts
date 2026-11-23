import { authenticateSwitchback, authenticateTenant0 } from "./auth";
import { baselineOffers, offersResponse } from "./baseline";
import { switchbackOffers, type Pricing } from "./switchback";

export async function tenant0OffersResponse(request: Request) {
  const user = await authenticateTenant0(request);
  if (!user) return offersResponse({ error: "Unauthorized" }, 401);

  return offersResponse({ offers: baselineOffers(user) });
}

export async function switchbackOffersResponse(request: Request, pricing: Pricing) {
  const user = await authenticateSwitchback(request);
  if (!user) return offersResponse({ error: "Unauthorized" }, 401);

  return offersResponse(await switchbackOffers(user, pricing));
}
