# Switchback Team & Delivery Plan

*Draft for the Director and launch team*

## 1. Delivery and launch timing

### What I would say at kickoff

> We're targeting a limited Switchback pilot five to six weeks after this kickoff. I'll bring you a confirmed pilot date at our checkpoint two weeks from today if the gateway and quoting teams have demonstrated their critical paths in staging and we've agreed on who is in the pilot. We'll expand after the pilot meets the launch criteria we agree on together.

### Planning assumptions

The window is a working forecast for a pilot and assumes two-week sprints, existing deployment and on-call infrastructure, and time set aside for interrupts. I assume Switchback and Product can agree on a small cohort, and that Enterprise API and Supply can each provide a staging integration during the first sprint after kickoff. The signed launch scope is assumed to include both savings and earned wage access. Any narrower pilot requires explicit agreement from Product and Switchback through the Director.

Before kickoff, I’ll ask Enterprise API and Supply to confirm their staging dates and work with Product and Switchback through the Director to confirm the proposed pilot cohort and scope. At the week-two checkpoint, I’ll use the staging results to confirm or revise the pilot window.

### Sequence and critical path

- **Before kickoff (next two weeks).** Meet with the Enterprise API and Supply leads and agree on a named owner and staging date for each seam. With Enterprise API, pin down how the gateway routes Switchback requests, forwards verified tenant identity and supports a limited rollout. With Supply, agree on quote fields, eligibility inputs, how an exclusive quote is tied to a tenant and request, and what the service returns when it cannot quote. Ask Switchback for test identities and a pilot cohort proposal. Use agreed fixtures to start work in parallel while the real seams are being built.
- **Sprint 1 (kickoff through week 2).** Build one staging flow with real gateway identity and an authenticated call to Supply. Prove a Switchback test worker can get a tenant-bound quote and a tenant 0 request cannot receive it. Review that evidence, dependency dates, and the proposed cohort with Product and the Director at the week 2 checkpoint. If a seam is still unproven, communicate a revised window and the next checkpoint.
- **Sprint 2 (weeks 3–4).** Complete both offer flows and run end-to-end checks with Switchback test accounts. Exercise slow and unavailable pricing, missing eligibility signals, and a tenant 0 regression. Rehearse disabling the Switchback cohort and verify that tenant 0 keeps serving its existing traffic.
- **Weeks 5–6.** Run a go/no-go review with the Director, Product, and the dependency owners. Start the limited pilot only after both flows pass, rollback is rehearsed, and the team can see authentication failures, pricing degradation, and offer outcomes. Expand after reviewing the pilot against agreed thresholds. Set the expansion date from that evidence.

### Managing dependencies and slips

Track each cross-team commitment with an owner, a date, and a demonstrable acceptance check. Review the critical path twice a week with the dependency leads and update the forecast when an owner flags a slip. A delayed gateway keeps the pilot off the calendar because the team needs verified tenant routing before accepting partner traffic. If Supply slips, keep testing with fixtures and show the partner a staging walkthrough. If only one product is ready, bring the Director a choice between moving the two-product pilot and explicitly agreeing to a narrower pilot with Switchback. A safe degraded response protects users during a pricing incident. Pilot readiness still requires working pricing for each product in the agreed scope.

## 2. Team ownership and coaching

### Break down the work together

At our first planning session, we'll break the launch into small, demonstrable pieces and agree on an owner, reviewer, and acceptance criteria for each. I'll ask Priya to lead the technical breakdown with the team and identify the riskiest integration work.

### My responsibilities

I'll own the launch forecast, cross-team commitments, and coaching. I'll hold regular 1:1s with each engineer to discuss feedback, growth goals, and any support they need during the launch. I'll stay in direct contact with the Enterprise API and Supply leads, using our twice-weekly dependency check-ins to review commitments, surface blockers, and adjust the forecast when dates move. I'll personally build the tenant-isolation slice so the team has a runnable example of how to authenticate each tenant and keep Switchback-exclusive offers out of the tenant 0 response. Marcus can extend the isolation checks as he takes on integration readiness.

### Priya — Hands-on technical lead

I'd ask Priya to lead the implementation and personally take the hardest seam, carrying verified Switchback identity from the gateway through to a tenant-bound Supply quote. In our next 1:1, I'd ask what bigger scope means to her, agree on which technical decisions she can drive, and set a checkpoint with her to discuss what she wants to own beyond this launch. Marcus will pair with her on key decisions and review the implementation as it lands. Before the pilot, he'll independently trace a request through the seam and land a small change so we know he can step in if Priya leaves.

### Dana — Rootly readiness and incident follow-through

I'd ask Dana to lead Rootly readiness and track launch incidents and follow-up actions, with the on-call rotation sharing response coverage. Reviewing incidents gives her a direct view of which failures reached users, what slowed detection, and which tests could have caught them. In our 1:1, I'd discuss the specific verification gaps in last month's incident and ask her to lead a blameless postmortem with my support. I'd have her present the timeline, contributing conditions, and concrete follow-ups with owners and dates. I'd agree with her on the failure-path evidence expected in her next two PRs and review it together. That connects incident ownership to a behavior we can observe and coach.

### Marcus — Integration readiness and mentorship

I'd have Marcus own the staging readiness checklist and demonstrate the end-to-end flow at the week-two checkpoint. He'll shadow Priya on gateway and Supply decisions and build enough familiarity to take over her implementation if needed. He'll also mentor Sam through scoping, an early pairing session, and PR review. I'll reserve capacity for both responsibilities in sprint planning and use our 1:1s to check whether he's getting the decision-making space and support he needs.

### Sam — Staging fixtures and acceptance checks

I'd give Sam a bounded piece of the integration to own. They'd create fictional test identities and staging acceptance checks for a valid Switchback request and a tenant 0 request that must never see an exclusive offer. Marcus will review the scope early and give feedback on the first small PR. Sam will run and explain the checks at a team demo, giving us a concrete way to assess their progress and choose their next assignment.

## 3. Stakeholder communication

I’ll send the Director a short weekly update with the pilot forecast, what we’ve demonstrated in staging, the biggest open risk, and any decision I need. If a dependency puts the window at risk, I’ll flag it as soon as we have credible evidence. If resolving it requires a priority or staffing decision across squads, I’ll bring the Director a recommendation and ask them to involve the Head of Engineering.

In the twice-weekly check-ins with Enterprise API and Supply, I’ll confirm who owns each open item, when we can test it, and what any change means for the pilot. I’ll work with Product to assess whether a smaller pilot would still serve Switchback’s goals. For partner conversations, I’ll give the Director a short update they can deliver directly, including what is ready, what is at risk, what we recommend, and when we’ll update the forecast.

For example, if Supply tells us at the week-two checkpoint that earned-wage pricing will miss the pilot window, I’ll explain how that changes the forecast for the two-product pilot. If savings has passed staging and can launch independently, and Product confirms a savings-only pilot would still be useful, I’ll recommend the Director offer that option to Switchback. We’ll proceed with the reduced scope only if Switchback agrees and savings clears its launch gates. Otherwise, I’ll recommend moving the two-product pilot. In either case, I’ll agree with Supply on the next date we can validate earned-wage pricing and give Switchback a specific date for our next update.

## 4. Operating model and launch readiness

### Daily execution and production support

We'll hold a daily standup to coordinate work and surface blockers, followed by a short production incident review. The engineer on the weekly on-call rota leads that review, checks open incidents and follow-ups in Rootly, and hands off unresolved items at rota change. Dana owns keeping the review and handoff process working. We'll triage follow-up work by severity and user impact, then assign it based on the skills needed and each engineer's workload. I'll adjust sprint commitments when production work displaces planned work.

### Quality and compliance gates

Every PR needs human approval and passing unit tests, dependency vulnerability scanning, and static analysis. Static analysis flags likely bugs and code that's hard to read or maintain, including overly complex functions. Before merging changes that affect the offers experience, we'll run Playwright end-to-end tests against the proposed build in UAT. The critical scenarios include tenant 0 regression, cross-tenant isolation, valid and invalid Switchback credentials, offer eligibility, and safe responses when pricing or profile signals are unavailable.

I want automated coverage for 100% of the agreed critical scenarios. We'll use AI to suggest edge cases, draft tests, and run an automated first-pass PR review. Engineers verify that assertions match the agreed behavior, investigate findings, and approve the change. For changes to identity, pricing, or customer-facing terms, we'll also verify the relevant requirements with the responsible reviewers. We'll keep production credentials and customer data out of AI tools.

### Pilot readiness and escalation

At go/no-go, I'll review the UAT results, confirm required approvals, and check that New Relic signals and Rootly escalation reach the primary and backup on-call engineers. We'll rehearse disabling the Switchback pilot and verify tenant 0 remains healthy. If an exclusive offer crosses the tenant boundary or users receive unverified pricing, the on-call engineer can pause the Switchback rollout immediately, open a Rootly incident, and notify me. I'll coordinate the response with Product and the dependency owners. We'll resume after we've verified the fix and repeated the affected launch checks.

[Switchback offers API and local setup](README.md)
