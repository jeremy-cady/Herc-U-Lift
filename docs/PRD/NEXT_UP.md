# PRD Work Checkpoint

Template structure and content rules (explicit, do not deviate):
- Use the full PRD template structure in this exact order, with the same headings and section numbering:
  1. Introduction / Overview
  2. Goals
  3. User Stories
  4. Functional Requirements
     - Core Functionality
     - Acceptance Criteria
  5. Non-Goals (Out of Scope)
  6. Design Considerations
     - User Interface
     - User Experience
     - Design References
  7. Technical Considerations
     - NetSuite Components Required
       * Record Types
       * Script Types (checkbox list)
       * Custom Fields
       * Saved Searches
     - Integration Points
     - Data Requirements
       * Data Volume
       * Data Sources
       * Data Retention
     - Technical Constraints
     - Dependencies
       * Libraries needed
       * External dependencies
       * Other features
     - Governance Considerations
  8. Success Metrics
  9. Implementation Plan
     - Script Implementations (table)
     - Development Approach (Phase 1/Phase 2)
  10. Testing Requirements
      - Test Scenarios
        * Happy Path
        * Edge Cases
        * Error Handling
      - Test Data Requirements
      - Sandbox Setup
  11. Security & Permissions
      - Roles & Permissions
      - Data Security
  12. Deployment Plan
      - Pre-Deployment Checklist
      - Deployment Steps
      - Post-Deployment
      - Rollback Plan
  13. Timeline (table)
  14. Open Questions & Risks
      - Open Questions
      - Known Risks (table)
  15. References & Resources
      - Related PRDs
      - NetSuite Documentation
      - External Resources
  Revision History (table)

- Header fields must be present and filled consistently:
  * PRD ID: use PRD-UNKNOWN-[ShortName]
  * Created: Unknown
  * Last Updated: Unknown
  * Author: Jeremy Cady
  * Status: Implemented (or Draft if script is stub/placeholder)
  * Related Scripts: include the SuiteScripts path and script type
  * Script Deployment: use "Not specified" if unknown

- Content guidelines:
  * Write concise, concrete descriptions grounded in the script behavior.
  * Explicitly list key fields the script reads/writes.
  * Note special handling (XEDIT fallbacks, lookupFields usage, backfills).
  * If a script is incomplete or a stub, mark Status as Draft and say so in the overview.
  * Avoid dates; keep Created/Last Updated as Unknown.
  * Keep ASCII only.
