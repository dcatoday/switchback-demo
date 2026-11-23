import { setTimeout as delay } from "node:timers/promises";
import type { SwitchbackUser } from "./auth";
import { baselineOffers } from "./baseline";

type ExclusiveQuote = {
  id: string;
  kind: "exclusive";
  product: "savings";
  apyBps: number;
};

export type Pricing = (user: SwitchbackUser, signal: AbortSignal) => Promise<ExclusiveQuote[]>;

export function mockPricing(mode: string | undefined): Pricing {
  return async (_user, signal) => {
    if (mode === "unavailable") throw new Error("Supply unavailable");
    if (mode === "slow") await delay(1_000, undefined, { signal });
    return [{ id: "switchback-savings", kind: "exclusive", product: "savings", apyBps: 450 }];
  };
}

export const demoPricing: Pricing = (user, signal) =>
  mockPricing(process.env.DEMO_SUPPLY)(user, signal);

export async function switchbackOffers(user: SwitchbackUser, quote: Pricing, budgetMs = 150) {
  const offers = baselineOffers(user);
  if (user.region !== "US" || user.tenureDays < 30) return { offers };

  const controller = new AbortController();
  let timeout: ReturnType<typeof setTimeout> | undefined;
  try {
    const deadline = new Promise<never>((_, reject) => {
      timeout = setTimeout(() => {
        reject(new Error("Supply deadline exceeded"));
        controller.abort();
      }, budgetMs);
    });
    const exclusive = await Promise.race([deadline, quote(user, controller.signal)]);
    return { offers: [...offers, ...exclusive] };
  } catch {
    return { offers };
  } finally {
    clearTimeout(timeout);
  }
}
