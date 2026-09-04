# Feature: Sign Up (UI)
**Owner:** Frontend | **Module:** Authentication

## Goal
Let a new operator create an account.

## Scope
- Page: `app/(auth)/signup/page.tsx`
- Fields: name, email, password, confirm password.
- Client-side validation (required, email format, password match).
- Show/hide password toggle on password fields.
- On submit → POST to backend signup, redirect to login on success.
