# Feature: Auth Token Storage & Attachment (UI)
**Owner:** Frontend | **Module:** Authentication

## Goal
Keep the session available and attach it to every API call.

## Scope
- `lib/auth.ts`: save/read/clear token.
- `lib/api.ts`: attaches `Authorization: Bearer <token>` to every request.
- On 401: clear token, redirect to `/login`.
