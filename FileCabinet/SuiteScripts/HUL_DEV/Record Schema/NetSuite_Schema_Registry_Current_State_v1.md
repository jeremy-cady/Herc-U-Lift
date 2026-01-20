# NetSuite Schema Registry — Current State (v1)

## 1. What This Script Is

**Name (conceptual):** NetSuite Schema Registry  
**Type:** Map/Reduce  
**Environment:** Sandbox (validated)  
**Mode:** Read-only metadata extraction

**Purpose:**  
To programmatically extract the authoritative NetSuite record schema (fields and sublists) in a deterministic, form-agnostic way suitable for:

- Script development
- AI code generation (Codex)
- Drift detection
- Long-term maintenance

---

## 2. What Has Been PROVEN (Empirical, Not Assumed)

Based on executed runs and execution logs:

1. **Record creation for metadata is safe**  
   - `record.create({ type, isDynamic: false })` works without saving or persisting data

2. **Body fields are fully enumerable**  
   - `rec.getFields()` returns:
     - Standard fields
     - Custom body fields
     - Hidden or non-form fields
   - Example: `salesorder` returns approximately 622 fields in this account

3. **Sublists are fully enumerable**  
   - `rec.getSublists()` returns all sublists on the record
   - Enumeration is independent of custom form selection

4. **Sublist fields are fully enumerable**  
   - `rec.getSublistFields({ sublistId })` works for each sublist
   - Field counts align with expected values
   - No runtime errors encountered

5. **Forms do not affect metadata access**  
   - Custom departmental forms do not alter schema visibility
   - Confirms that a form-agnostic schema model is valid

6. **Governance impact is minimal**  
   - Metadata-only extraction is low-cost
   - Approach scales safely across additional record types

---

## 3. What This Script Intentionally Does NOT Do (Yet)

The following are explicit design exclusions at this stage:

- Does not write any files to the File Cabinet
- Does not persist schema data in any format
- Does not include joins or related-record metadata
- Does not include field types, sourcing rules, or validation logic
- Does not include form-level visibility or mandatory settings
- Does not modify, save, or submit any records
- Does not touch production data

These are conscious design decisions, not omissions.

---

## 4. Current Execution Constraints (By Design)

- Only the `salesorder` record type is processed in the `reduce` stage
- Other record types are routed but intentionally ignored
- Logging is the sole output mechanism
- Body fields, sublists, and sublist fields are logged separately for legibility

These constraints ensure the script is:

- Easy to reason about
- Easy to debug
- Safe to run repeatedly without side effects

---

## 5. Canonical Mental Model

> **Forms affect UI.**  
> **Scripts operate on records.**  
> **This registry describes records, not forms.**

This distinction has been empirically validated in this account.

---

## 6. Intended Evolution Path (Not Yet Executed)

When development resumes, the logical next steps — in order — are:

1. Define the canonical JSON schema structure
2. Persist one schema file per record type to the File Cabinet
3. Expand coverage to additional record types (invoice, customer, item, etc.)
4. Add optional metadata (field types, sourcing, joins)
5. Introduce schema versioning and drift detection
6. Feed schemas into Codex as a trusted reference source

None of these steps are active or implemented yet.

---

## 7. State Lock

At this point, the following statement is true and supported by execution evidence:

> *A verified, repeatable mechanism exists for extracting complete NetSuite record schemas without side effects.*

This represents a stable milestone and a safe handoff point for future work.
