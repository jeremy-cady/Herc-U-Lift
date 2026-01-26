# Codex Invocation Cheat Sheet

This file defines **how to invoke Codex** safely and consistently using the established contracts.

Read this as a **menu**, not a script.

---

## Always Do This First
Every Codex session **must** begin by loading the contracts:

- `00_READ_THIS_FIRST.md`
- `10_PRD_INTERPRETATION_RULES.md`
- `15_PRD_AUTHORING_AND_STRENGTH_RULES.md`
- `20_EXECUTION_MODE.md` (reference only unless explicitly enabled)

---

## Mode B — Skeleton Only (No PRD)

**Use when:**
- No PRD exists
- Exploring a new script
- You want zero behavior

**Invocation pattern:**
> No PRD exists for this script.  
> Generate TypeScript scaffolding only.  
> Do not select entry points, emit logging, or implement logic.  
> Surface all uncertainty as TODOs.

**Expected output:**
- File header
- Empty exports or no entry points
- TODOs only

---

## Mode A — PRD Mirror (Production Truth)

**Use when:**
- A production PRD exists
- You want a structural mirror for review or refactor prep

**Invocation pattern:**
> A production PRD exists and is authoritative.  
> Generate a new scaffold that mirrors documented behavior structurally.  
> Do not implement executable logic or modify production code.

**Expected output:**
- Correct script type
- Correct entry points
- TODOs for all implementation mechanics
- No record mutation

---

## Execution Mode — Implement Logic (Explicit Opt-In)

**Use when:**
- Design decisions are complete
- You are ready to write real code

**Required declaration:**
> Execution Mode is enabled.  
> You are authorized to implement executable logic within PRD bounds.

**Invocation pattern:**
> Resolve the following TODOs only:  
> - TODO #1  
> - TODO #2  

**Expected output:**
- Executable logic
- No scope expansion
- Unrequested TODOs remain untouched

---

## Hard Rules (Do Not Violate)
- If Execution Mode is not explicitly enabled → **no executable logic**
- PRDs authorize *what*, never *how*
- Schemas define capability, not permission
- Silence is preferred over invention

---

## One-Line Summary
**Mode B = Skeleton**  
**Mode A = Mirror**  
**Execution Mode = Implement (explicit only)**

When in doubt, default to **Mode B**.
