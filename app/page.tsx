"use client";

import { useState } from "react";
import { runDemo } from "./demo-action";

const scenarios = [
  { id: "tenant0", title: "Tenant 0", detail: "Signed session · baseline offers" },
  { id: "available", title: "Switchback · Pricing available", detail: "Valid token · baseline and exclusive" },
  { id: "slow", title: "Switchback · Pricing timeout", detail: "Valid token · baseline fallback" },
  { id: "unauthorized", title: "Switchback · Missing credentials", detail: "No token · unauthorized" },
] as const;

type Result = Awaited<ReturnType<typeof runDemo>>;
type Offer = { id: string; kind: "baseline" | "exclusive"; apyBps?: number };

export default function Page() {
  const [active, setActive] = useState<string>();
  const [pending, setPending] = useState(false);
  const [result, setResult] = useState<Result>();
  const [failed, setFailed] = useState(false);

  async function select(id: string) {
    setActive(id);
    setResult(undefined);
    setFailed(false);
    setPending(true);
    try {
      setResult(await runDemo(id));
    } catch {
      setFailed(true);
    } finally {
      setPending(false);
    }
  }

  const offers: Offer[] = result?.body.offers ?? [];

  return (
    <main>
      <header>
        <p className="label">Fictional case study</p>
        <h1>Switchback Offers</h1>
        <p>Try a scenario to see how tenant authentication and pricing affect the offers returned.</p>
      </header>
      <div className="workspace">
        <section aria-labelledby="scenarios">
          <h2 id="scenarios">Scenarios</h2>
          <div className="scenarios">
            {scenarios.map(({ id, title, detail }) => (
              <button key={id} type="button" disabled={pending} aria-pressed={active === id} onClick={() => select(id)}>
                <strong>{title}</strong>
                <span>{detail}</span>
              </button>
            ))}
          </div>
        </section>
        <section className="result" aria-labelledby="response" aria-busy={pending}>
          <h2 id="response">Response</h2>
          <div aria-live="polite">
            {pending && <p>Running scenario…</p>}
            {failed && <p>Couldn’t reach the demo server. Try again.</p>}
            {!result && !pending && !failed && <p>Choose a scenario to see the HTTP response and any offers.</p>}
            {result && (
              <>
                <div className="status"><code>GET {result.path}</code><strong>HTTP {result.status}</strong></div>
                {offers.length > 0 && (
                  <ul className="offers">
                    {offers.map((offer) => (
                      <li key={offer.id}>
                        <span>{offer.kind === "baseline" ? "Baseline offer" : "Switchback exclusive"}</span>
                        <strong>{offer.kind === "baseline" ? "Savings account" : "High-yield savings"}</strong>
                        {offer.apyBps !== undefined && <span>{(offer.apyBps / 100).toFixed(2)}% demo APY</span>}
                      </li>
                    ))}
                  </ul>
                )}
                <pre aria-label="JSON response">{JSON.stringify(result.body, null, 2)}</pre>
              </>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
