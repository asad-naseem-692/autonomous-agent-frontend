# Feature: Agent Thinking Indicator (UI)
**Owner:** Frontend | **Module:** Agent Conversation

## Goal
Show the user the agent is actively working, not stuck.

## Scope
- A "thinking..." / typing indicator shown while waiting for the
  backend's response during the reasoning loop.
- Must remain visible throughout both initial message sending AND during the
  entire approve/reject-to-summary action resolution cycle (accounting for
  the ~15-25s LLM generation latency) so the UI never appears frozen or broken.
- Disables message inputs and approval action buttons while active.
