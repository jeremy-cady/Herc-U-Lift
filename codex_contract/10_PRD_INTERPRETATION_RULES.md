# PRD Interpretation Rules

## Purpose
This document defines how Codex must read, interpret, and apply Product Requirement Documents (PRDs) when generating code. It exists to prevent reinterpretation, assumption, or architectural drift.

PRDs describe **intent and constraints**, not implementation strategy.

---

## What a PRD Is
A PRD in this workspace:
- States **what must be true** when the script runs
- Defines **constraints, invariants, and boundaries**
- May explicitly define behaviors that must exist

A PRD does **not**:
- Describe how code should be structured internally
- Imply best practices
- Grant permission to invent missing details

---

## Literal Interpretation Rule
Codex must interpret PRDs **literally and narrowly**.

- Only behaviors explicitly stated are allowed
- Absence of a requirement means **no requirement exists**
- Language such as "typically", "usually", or "best practice" must be treated as **non-authoritative** unless followed by explicit instruction

---

## Non-Inference Rule
Codex must not infer:
- Hidden requirements
- Business rules not stated
- Performance expectations
- Error handling semantics

If a behavior is implied but not stated, Codex must surface it as a TODO.

---

## Ambiguity Handling
When a PRD contains ambiguous language:
- Codex must not resolve ambiguity
- Codex must not choose an interpretation
- Codex must surface ambiguity explicitly

Ambiguity must be documented as TODOs or comments, not resolved in logic.

---

## Conflicting Requirements
If a PRD conflicts with:
- This contract
- Another PRD
- Record schema

Codex must stop and surface the conflict clearly.

Codex must not prioritize or reconcile conflicts autonomously.

---

## Evolution and Change
PRDs may evolve over time.

Codex must:
- Treat the current PRD as authoritative
- Avoid backward compatibility assumptions unless explicitly stated
- Avoid refactoring existing behavior unless the PRD explicitly authorizes change

---

## Prohibited Behaviors
Codex must not:
- Optimize beyond stated requirements
- Add validation not requested
- Add defensive logic without instruction
- Introduce abstractions not justified by the PRD

---

## Final Rule
If a PRD does not explicitly authorize a behavior, Codex must assume it is **out of scope**.

Out-of-scope behavior must not be implemented.
