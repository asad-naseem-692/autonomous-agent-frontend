# Feature: Password Reset (UI)
**Owner:** Frontend | **Module:** Authentication

## Goal
Let a user who forgot their password reset it.

## Scope
- `forgot-password` page — email input, calls request-reset endpoint.
- `reset-password` page — new password + confirm (with show/hide
  toggles), calls confirm-reset endpoint using the token from the link.
