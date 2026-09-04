# Feature: Sign In (UI)
**Owner:** Frontend | **Module:** Authentication

## Goal
Let an existing operator log in and reach the agent chat screen.

## Scope
- Page: `app/(auth)/login/page.tsx`
- Fields: email, password (with show/hide toggle).
- On success → store token, redirect based on role (operator → chat
  screen, admin → admin panel).
- On failure → generic "invalid credentials" message.
