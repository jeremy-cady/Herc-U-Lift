# NetSuite Customization Product Requirement Document

---
## Metadata
prd_id: PRD-UNKNOWN-SendQuoteViaEmail
title: Send Quote via Email Suitelet
status: Implemented
owner: Jeremy Cady
created: TBD
last_updated: TBD

script:
  type: suitelet
  file: FileCabinet/SuiteScripts/SNA/sna_hul_sl_sendquoteviaemail.js
  script_id: TBD
  deployment_id: TBD

record_types:
  - Transaction (for file attachments)

---

## 1. Overview
A Suitelet endpoint that emails a quote (transaction) by merging an email template and attaching the latest file on the transaction.

## 2. Business Goal
Enables users or integrations to send a quote email directly from NetSuite with the latest attached document.

## 3. User Story
As a sales rep, when I need to email a quote, I want to email the latest quote PDF, so that customers receive the most recent version.

## 4. Trigger Matrix
| Event | Field(s) | Condition | Action |
|------|----------|-----------|--------|
| GET | `tranId`, `userId` | Suitelet request | Merge template, attach latest file, and send email |

## 5. Functional Requirements
- The system must accept `tranId` and `userId` parameters.
- The system must merge email content using template ID `6` with the transaction.
- The system must locate the latest file attachment on the transaction.
- The system must send an email to `userId` with the merged subject/body and the attachment.
- The system must return a boolean response indicating success.

## 6. Data Contract
### Record Types Involved
- Transaction (for file attachments)

### Fields Referenced
- Request parameters: `tranId`, `userId`
- Email template ID `6`

Schemas (if known):
- TBD

## 7. Validation & Edge Cases
- Transaction has no file attachments; email fails or sends without attachment.
- Invalid `userId` or `tranId` results in failure.
- Merge or send fails; error is logged and `false` is returned.

## 8. Implementation Notes (Optional)
- Email template ID is hardcoded to `6`.
- `userId` is treated as an employee internal ID for sender and recipient.

## 9. Acceptance Criteria
- Given a valid request, when the Suitelet runs, then email sends with merged subject/body and latest attachment.
- Given a failure, when the Suitelet runs, then the response returns `false`.

## 10. Testing Notes
- Send email for a transaction with attachments and verify success.
- Transaction has no file attachments; email fails or sends without attachment.
- Invalid `userId` or `tranId` results in failure.
- Merge or send fails; error is logged and `false` is returned.

## 11. Deployment Notes
- Upload `sna_hul_sl_sendquoteviaemail.js`.
- Confirm email template ID `6` exists in target environment.
- Validate email send and attachment.

## 12. Open Questions / TBDs
- Script ID: TBD
- Deployment ID: TBD
- Created date: TBD
- Last updated date: TBD
- Should the email template ID be a script parameter?
- Should recipients be external customers instead of employees?
- Risk: Hardcoded template ID breaks in other accounts (Mitigation: Move template ID to script parameter)
- Risk: No attachment found results in invalid email (Mitigation: Add validation and fallback behavior)

---
