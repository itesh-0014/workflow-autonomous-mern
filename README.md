# WorkPilot AI — MERN Autonomous Company Operator

A scoped, demonstrable AI-employee proof of concept for the CentrAlign Founding Engineer exercise. React + Vite frontend, Express/Node backend, MongoDB persistence, Playwright browser execution, optional Gemini decision proposals, human approval and independent read-back verification.

## What it actually does

1. A user submits a support-operations goal from the dashboard.
2. A background agent launches a **real Chromium browser** and visits the included Acme Support Desk sandbox (`/sandbox`).
3. It reads company policy and observes live ticket rows in the DOM.
4. It chooses a next action, assigns high/critical tickets, creates follow-ups and drafts.
5. Browser actions use Playwright to fill and submit real HTML forms in Chromium; the agent then reloads the page and checks the DOM. This is scoped browser automation, not general-purpose computer use.
6. It retries temporary 503 failures, records decisions and observations in MongoDB, and independently reloads the page to verify changes.
7. It waits for human review of drafts. It never sends customer email.

The agent is **bounded** by a policy controller. Gemini may propose actions but cannot override mandatory safety/order constraints. Without `GEMINI_API_KEY`, it uses an explicit deterministic policy. This is intentionally NOT a general-purpose self-directed computer agent.

## Setup

Requirements: Node.js 20+, MongoDB 7+ running locally or MongoDB Atlas, Chromium installed via Playwright.

```bash
npm install
npx playwright install chromium
cp server/.env.example server/.env
# Set JWT_SECRET (20+ characters) and DEMO_PASSWORD (12+ characters)
npm run seed -w server
npm run dev
```

On Windows PowerShell, use `Copy-Item server/.env.example server/.env` instead of `cp`.

- Dashboard: http://localhost:5173
- Sandbox support portal: http://localhost:4000/sandbox
- Health: http://localhost:4000/health

Log in with the email and password in `.env`. Launch a task from the dashboard. It runs in the background; watch the execution timeline and review drafts.

### Failure recovery demo

Log in, then call `POST /api/sandbox/reset` and `POST /api/sandbox/fail-next` with the JWT bearer token. Start an agent run. The next assignment receives HTTP 503; the agent retries and succeeds. You can also inspect `/api/sandbox/state`.

### Tests

```bash
npm test
npm run build
```

## Security and limitations

- The support portal is a **local demo environment** and should never be exposed publicly; sandbox routes have no authentication because the browser demo runs locally. Restrict network access to localhost.
- The agent cannot navigate arbitrary sites or send real emails.
- The runtime is in-process; it does not offer durable multi-worker leasing, distributed locks or crash-safe browser-session recovery.
- MongoDB holds audit history, drafts and user authentication; the sandbox ticket state is in-memory and resets on server restart.
- Draft approval means human review, **not message delivery**.
- Gemini suggestions are policy-checked; the deterministic guard controls the execution order.
- Screenshots, multi-tenant isolation, secrets vault, enterprise SSO and genuine desktop control are not implemented.
- An actual production deployment requires authenticated browser sessions, CSRF protection, host isolation, per-tenant authorization and persistent sandbox backends.

## Architecture

`React dashboard -> Express JWT API -> operator runtime -> Gemini suggestion / deterministic guard -> Playwright Chromium -> separate sandbox support portal -> DOM verification -> MongoDB audit and draft approvals`

See `docs/ARCHITECTURE.md`, `docs/LIMITATIONS.md` and `docs/INTERVIEW_GUIDE.md` for background from the initial MERN version. Some descriptions there refer to the original deterministic workflow; this README is authoritative for the new operator route.

## GitHub

```bash
git init
git add .
git commit -m "Build MERN autonomous support operator proof of concept"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/workpilot-ai.git
git push -u origin main
```

Do not commit `.env`, secrets or customer data. Understand the code and describe accurately what you implemented and verified.
