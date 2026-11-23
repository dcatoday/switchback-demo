import { tenant0OffersResponse } from "../../../lib/offer-handlers";

export async function GET(request: Request) {
  return tenant0OffersResponse(request);
}
