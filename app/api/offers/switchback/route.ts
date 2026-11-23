import { switchbackOffersResponse } from "../../../../lib/offer-handlers";
import { demoPricing } from "../../../../lib/switchback";

export async function GET(request: Request) {
  return switchbackOffersResponse(request, demoPricing);
}
