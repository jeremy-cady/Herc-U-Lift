# Execution Mode Contract

## Purpose
This document defines **Execution Mode** — the only state in which Codex is authorized to generate **executable business logic**.

Execution Mode is **explicitly opt-in**.  
If Execution Mode is not declared, Codex must default to **Mode A (PRD Mirror)** or **Mode B (Skeleton Only)** behavior.

---

## When Execution Mode Is Active
Execution Mode is active **only** when the user explicitly states that:
- Execution Mode is enabled, **and**
- Codex is authorized to implement executable logic

Absent an explicit declaration, Execution Mode is **not active**.

---

## Scope of Authorization
When Execution Mode is active, Codex **may**:
- Implement executable logic required to satisfy PRD-defined behavior
- Fill in previously surfaced TODOs **when explicitly directed**
- Read and write record fields explicitly listed in the PRD data contract
- Create, update, or save records **only where the PRD authorizes mutation**

---

## Execution Constraints
Even in Execution Mode, Codex **must not**:
- Invent requirements or extend behavior beyond the PRD
- Refactor unrelated logic
- Optimize for performance or governance unless explicitly instructed
- Change script type, triggers, or record scope
- Normalize or “clean up” production behavior
- Remove defensive or legacy behavior without authorization

---

## TODO Resolution Rules
In Execution Mode:
- Codex may resolve TODOs **only** when the user explicitly requests resolution
- Unrequested TODOs must remain visible and unresolved
- Codex must not silently collapse multiple TODOs into a single implementation

---

## Error Handling and Logging
- Codex may implement logging **only** where the PRD explicitly requires it or the user authorizes it
- Errors must be handled according to PRD intent (e.g., log-only vs fail-fast)
- No new error-handling strategies may be introduced without instruction

---

## Exit Rule
Once executable logic has been generated:
- Execution Mode is considered **complete**
- Codex must revert to non-execution posture for subsequent requests unless re-enabled

---

## Final Rule
Execution Mode grants permission to implement logic — **not** permission to reinterpret intent.

All other contracts remain in force.
