# Honest limitations and production roadmap

## Current prototype
- MongoDB-backed ticket workflow is real, but seeded business records are synthetic.
- Gemini can generate a bounded plan; without a key, deterministic fallback is used. The plan cannot adapt its tool list beyond the validated workflow.
- The execution loop reacts to errors by retrying and persisting observations, but does not synthesize a new plan after an unexpected environment change.
- Playwright browser inspection is implemented as an isolated, allowlisted adapter, **not integrated** into the default workflow.
- Drafts are reviewable but not sent; approved is not delivered.
- Worker runs in one process; no distributed locking or queue durability guarantees under concurrent replicas.
- No general-purpose desktop control, document ingestion, enterprise OAuth integrations, or vector embeddings.

## Next milestones
1. Connect Playwright to a local mock CRM UI and demonstrate real click/form actions plus DOM read-back verification.
2. Add BullMQ + Redis for distributed workers, visibility timeouts, and scheduled retries.
3. Introduce an adaptive typed action planner with bounded budgets, explicit action permissions and post-action observation.
4. Add Google Workspace or Slack OAuth connectors with per-tenant token encryption, scopes and approvals.
5. Add company-scoped retrieval with source citations, feedback evaluation and audit exports.
6. Add integration tests using a disposable MongoDB and Playwright E2E tests.

## Threat model
Prompt injection in ticket descriptions/policies must not override tool permissions. All model outputs require schema validation and a restricted tool registry. External side effects need approval, tenant-scoped credentials, and audit trails. Never navigate arbitrary URLs with a privileged browser; enforce host allowlists and network egress restrictions. Avoid putting tokens in agent context or logs. Production deployment requires CSRF considerations for cookie auth (this demo uses bearer JWT), secrets management, stronger authorization roles, and retention controls.
