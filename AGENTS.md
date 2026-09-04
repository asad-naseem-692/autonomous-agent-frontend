# AGENTS.md — Frontend (Next.js) — Autonomous Business Operations Agent

## Scope
This file applies to the `frontend/` folder only. Deploys to Vercel. A
sibling `backend/AGENTS.md` covers the backend — do not build backend
logic here.

## Tech stack (do not substitute)
Next.js (App Router) + TypeScript + Tailwind CSS.

## Build order — full-stack, one feature at a time
Vertical slices pairing backend + frontend specs, one feature at a time,
stop for approval after each. Follow `specs/features/` in `FEAT-XX`
numeric order.

## Core invariant
No business logic here. The agent's reasoning, tool execution, and
approval-gating all happen on the backend. This frontend only sends
requests (send a message, approve/reject an action) and renders whatever
the backend returns — including pending approval cards exactly as given.

## Hard rules
- Never hardcode the backend URL — always read
  `process.env.NEXT_PUBLIC_API_BASE_URL`.
- All API calls go through one client module (`lib/api.ts`).
- Auth token attached automatically as a Bearer header.
- A pending approval card must be visually unmistakable — a user should
  never accidentally approve a sensitive action without clearly seeing
  what it is first.
- Disable the message input while a response or approval is in flight —
  never let a user send a new message that could race with a pending
  approval decision.

## Data dictionary — use exactly these field names, always
Same conventions as backend: `snake_case`, ISO 8601 timestamps, UUID ids.

- **User**: `id, name, email, role ("operator"|"admin"), is_active, created_at`
- **Auth response**: `{ "access_token": string, "token_type": "bearer", "user": User }`
- **Conversation**: `id, user_id, title, created_at`
- **Message**: `id, conversation_id, role ("user"|"assistant"), content, created_at`
- **ExecutionLog**: `id, conversation_id, tool_name, tool_input, tool_output, status ("executed"|"pending_approval"|"rejected"|"failed"), created_at`
- **ApprovalRequest**: `id, conversation_id, tool_name, tool_input, status ("pending"|"approved"|"rejected"), created_at, resolved_at, resolved_by`

If a feature needs a field not listed here, flag it in your summary so
it can be added to `backend/AGENTS.md` too.

## Keep specs and code in sync (mandatory, every time)
The spec file for a feature is the source of truth for what that feature
is supposed to do — not just a one-time planning document. Whenever you
add, change, or remove behavior in a feature after it's already been
built:
1. **Update that feature's `.md` file in `specs/features/` in the same
   change** — add/edit/remove the relevant bullet points so the spec
   still accurately describes the current behavior.
2. If the change affects what data the frontend expects from the
   backend (new field, changed endpoint, changed response shape), note
   that clearly in the spec so it's visible to whoever is working on the
   backend repo.
3. If a change doesn't fit any existing feature file, create a new
   `FEAT-XX-name.md` for it, following the same format as the others,
   rather than leaving the change undocumented.
4. Never let a spec describe behavior that no longer exists in the code,
   and never let the code do something its spec doesn't mention. Treat a
   stale or missing spec update as an incomplete task, not an optional
   cleanup step.

## Never let a change to one feature break a feature it depends on
Before changing a feature others rely on (e.g. the approval card, which
several flows depend on), check `specs/features/` for anything
referencing it. Update its spec explicitly if changed, and confirm
nothing else breaks.

## What you set up yourself
`.env.example` / local `.env` (`NEXT_PUBLIC_API_BASE_URL`), `.gitignore`,
`package.json`, `Dockerfile` (optional, for local testing only — Vercel
builds natively).

## Deployment target
Vercel. `NEXT_PUBLIC_API_BASE_URL` set to the deployed backend's Railway
URL once known.
