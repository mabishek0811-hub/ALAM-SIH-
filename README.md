# ALAM

ALAM is a bilingual prototype for Tamil Nadu's bittern resource routing and aggregation ecosystem.

> Turning Tamil Nadu's Salt By-Products Into Industrial Value.

## What is implemented

- Producer dashboard with traceable bittern batches
- Explainable resource routing engine comparing magnesium, bromine and potassium recovery
- Rule-based compatibility scoring with composition, quantity, distance, demand and economics factors
- Multi-producer aggregation flow that makes fragmented supply processor-ready
- Industrial buyer matching, offer submission and transaction progression
- Government intelligence view with district activity, ledger and ecosystem metrics
- Economic impact scenario model and potential environmental benefit view
- English and Tamil interface dictionaries with instant language switching
- Browser text-to-speech voice help with Tamil voice selection where supported
- Persistent buyer requirements, offer negotiation and delivery status workflow
- Interactive notifications, marketplace filters, producer performance and verification views
- Transaction traceability records with QR-ready batch identity cues
- SIH demo journey controls and reset demo action
- Responsive desktop, tablet and mobile UI

## Run locally

```bash
npm install
npm run dev
```

Open the Vite URL shown in the terminal.

## Optional AI voice answers

The voice assistant works without an API key using local answers and Wikipedia. To enable broader Siri-like answers, copy `.env.example` to `.env`, set `ALAM_AI_API_KEY`, and restart Vite. The key is read only by the Vite server and is never bundled into browser code. `ALAM_AI_BASE_URL` and `ALAM_AI_MODEL` can be changed for another OpenAI-compatible provider.

To verify the production bundle:

```bash
npm run build
```

## Demo flow

1. Open the producer overview.
2. Use the SIH demo journey at the bottom or open My batches.
3. Add a batch, then inspect the Routing engine.
4. Open Aggregation to group three compatible batches.
5. Open Industrial network and send an offer.
6. Switch the role selector in the context bar to Government.
7. Inspect the traceability ledger and district activity.
8. Use Reset demo to restart the scenario.

## Trust boundaries

All names, values, buyer requirements, prices and metrics in this prototype are fictional illustrative data. Composition values are producer-provided and are not presented as laboratory results. The routing engine is intentionally transparent rule-based logic, not machine learning. A production deployment should connect the service layer to Supabase Auth/PostgreSQL, server-side role enforcement, verified lab records and audited transaction events before handling real users or money.

## Architecture direction

`src/main.tsx` currently keeps the prototype data and rule-based scoring close to the UI for fast demonstration. The `scoreRoutes` function is the replacement boundary for a future routing service or ML model. The same boundary can be moved to a Node/Supabase API with tables for users, producers, salt pans, batches, composition data, aggregation groups, buyers, requirements, matches, offers, transactions, notifications and government metrics.

## Demo identity

The prototype starts as the fictional producer **Arul Salt Works**. Role switching in the top context bar exposes Producer, Industrial Buyer and Government views without claiming live authentication. No credentials or secrets are bundled.
