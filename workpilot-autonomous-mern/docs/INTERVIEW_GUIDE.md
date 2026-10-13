# Explaining the engineering decisions

**Why this workflow?** It is small enough to complete end-to-end while exercising company memory, planning, persistent state, side effects, human approval and read-back verification.

**What makes it an agent?** It receives a goal, selects a constrained plan, executes registered tools, records observations, retries failed actions, waits for human decisions, and verifies state before declaring completion. Its autonomy is deliberately bounded.

**How do retries avoid duplicates?** MongoDB upserts use unique idempotency keys based on run, ticket and action. Retrying a step reuses existing records.

**Why MongoDB?** Flexible run contexts and events fit document storage. Separate task/draft collections permit independent read-back verification. Large production event streams should move to append-only storage.

**Why not arbitrary browser control initially?** Privileged browsing has prompt-injection and credential risks. A reliable narrow workflow with explicit permissions is more credible than pretending unrestricted automation is safe.

**What would you build next?** Real Playwright CRM interaction, an adaptive planner with action contracts, distributed BullMQ workers, enterprise OAuth integrations, tenant isolation and evaluation metrics.

**What can be measured?** Task completion rate, verification success, retries per run, approval wait time, latency, duplicate-write rate, and percentage of tasks requiring human intervention.
