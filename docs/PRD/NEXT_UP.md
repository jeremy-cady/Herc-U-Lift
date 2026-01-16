# PRD Work Checkpoint

Remaining items from numbered list (11-126):
101. sna_hul_ue_show_recalculate_rate_btn.js
102. sna_hul_ue_so_itempricing.js
103. sna_hul_ue_so_rental.js
104. sna_hul_ue_so_set_codes_item_lines.js
105. sna_hul_ue_so_temporaryitem.js
106. sna_hul_ue_so_update_lines.js
107. sna_hul_ue_so_van_bin.js
108. sna_hul_ue_taskl_preferred_route_code.js
109. sna_hul_ue_term.js
110. sna_hul_ue_timebill.js
111. sna_hul_ue_trigger_so_workflow.js
112. sna_hul_ue_update_item_rate.js
113. sna_hul_ue_update_sales_matrix_on_customer.js
114. sna_hul_ue_update_sales_rep_cm_plan.js
115. sna_hul_ue_update_so_line_level_fields.js
116. sna_hul_ue_updatenbv.js
117. sna_hul_ue_van_bin.js
118. sna_hul_ue_vb_update_ir_rate.js
119. sna_hul_ue_vendorprice.js
120. sna_hul_wfa_get_nxtsrvctask.js
121. sna_hul_wfa_reopen_case.js
122. sna_mr_delete_records.js
123. sna_mr_hul_create_bintransfer.js
124. sna_sl_hul_fileupload.js
125. sna_suiteql_query_tool.js
126. suiteql-query-tool.v20211027.suitelet.js

Skip rules (explicit):
- Skip SweetAlert library files (sweetalert2.all.js, sweetalertModule.js).
- Skip non-JavaScript files when asked to document JS in order.

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
