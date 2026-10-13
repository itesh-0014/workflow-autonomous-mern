# Architecture and execution semantics

## Core loop
`Goal → constrained plan → read policies → read tickets → create tasks → prepare drafts → human review → verify database state → complete`

A run is a persisted MongoDB document containing its goal, plan, cursor, status, context, events and verification result. The worker polls queued/running runs and executes one step at a time. Tool outputs are recorded in `context`, and events are emitted over Socket.IO to subscribed, authenticated users.

## Reliability decisions
- **Persisted cursor:** restart resumes at the next incomplete step.
- **Idempotent side effects:** unique `(run, ticket, action)` keys and MongoDB upserts prevent duplicate tasks/drafts after retry.
- **Retries:** three attempts per step with short backoff, then failure.
- **Approval checkpoint:** drafts are never sent; run waits until every draft is reviewed.
- **Verification:** the final tool independently re-queries work items and drafts and checks that each selected high/critical ticket has both.
- **Policy scope:** model can only choose from a fixed, validated list of tools in a fixed order. The LLM does not directly execute arbitrary code.

## Important tradeoffs
A bounded plan is intentionally less flexible than a free-form ReAct agent but is safer and easier to demonstrate reliably. The local in-process worker and locks are suitable for a single Node process only; production would use Redis/BullMQ or another distributed queue with leases, heartbeat, and fencing tokens. MongoDB event arrays are convenient for a demo but should become a separate append-only collection at scale. Company policies are retrieved as documents, not vector search; a real multi-tenant product needs scoped retrieval, source citations and access control.

## API
- `POST /api/auth/login` — JWT login
- `GET /api/overview` — counts
- `GET /api/tickets`, `GET /api/policies` — company context
- `POST /api/runs` — enqueue a goal
- `GET /api/runs`, `GET /api/runs/:id` — history and trace
- `POST /api/drafts/:id/review` — approve/reject draft
- `POST /api/runs/:id/resume` — resume after all reviews
- `GET /health` — liveness

## State diagram
`queued → running → awaiting_approval → queued → running → completed`
Any execution step can enter `failed` after retries. The run's cursor advances only after a tool succeeds.
