# PRD: [Feature Name]

**PRD ID:** PRD-[YYYYMMDD]-[FeatureName]
**Created:** [Date]
**Author:** [Your Name]
**Status:** Draft | In Review | Approved | In Development | Testing | Implemented
**Related Scripts:** [List script file names that will implement this feature]

---

## 1. Introduction / Overview

> **Instructions:** Briefly describe the feature and the problem it solves. This should be a 2-4 sentence summary that anyone can understand. State the primary goal.

**What is this feature?**
[Brief description of the feature]

**What problem does it solve?**
[Problem statement - explain the pain point this addresses]

**Primary Goal:**
[One sentence describing the main objective]

---

## 2. Goals

> **Instructions:** List specific, measurable objectives for this feature. What do we want to achieve? These should be clear outcomes, not features.

1. [Goal 1 - e.g., "Reduce manual data entry time by 50%"]
2. [Goal 2 - e.g., "Automate user role assignment process"]
3. [Goal 3 - e.g., "Improve data accuracy"]

---

## 3. User Stories

> **Instructions:** Describe how users will interact with this feature using the format: "As a [type of user], I want to [perform an action] so that [benefit]." Include 3-5 user stories.

1. **As a** [user role], **I want to** [action] **so that** [benefit/outcome]

2. **As a** [user role], **I want to** [action] **so that** [benefit/outcome]

3. **As a** [user role], **I want to** [action] **so that** [benefit/outcome]

---

## 4. Functional Requirements

> **Instructions:** List specific functionalities the feature must have. Use clear, explicit language. Number each requirement. A junior developer should be able to read these and understand exactly what needs to be built.

### Core Functionality

1. The system must [specific requirement]
2. The system must allow users to [specific action]
3. The system must [specific requirement]
4. When [condition], the system must [action]

### Acceptance Criteria

**How will we know this feature is complete?**

- [ ] [Specific criterion 1]
- [ ] [Specific criterion 2]
- [ ] [Specific criterion 3]
- [ ] [Specific criterion 4]

---

## 5. Non-Goals (Out of Scope)

> **Instructions:** Clearly state what this feature will NOT include. This helps manage scope and sets clear boundaries. Be specific about what is intentionally excluded.

**This feature will NOT:**

- [Item 1 - e.g., "Support bulk processing of more than 1000 records at once"]
- [Item 2 - e.g., "Include a custom UI - will use standard NetSuite forms"]
- [Item 3 - e.g., "Integrate with external systems in Phase 1"]

---

## 6. Design Considerations

> **Instructions:** Describe UI/UX requirements, link to mockups, or mention design guidelines. Skip this section if not applicable.

### User Interface

- [UI requirement 1 - e.g., "Should use standard NetSuite Suitelet forms"]
- [UI requirement 2 - e.g., "Must display results in a filterable list"]

### User Experience

- [UX requirement 1 - e.g., "Process should complete in under 10 seconds"]
- [UX requirement 2 - e.g., "Users should receive clear error messages"]

### Design References

- [Link to mockups, wireframes, or design docs if available]
- [Reference to existing similar features in NetSuite]

---

## 7. Technical Considerations

> **Instructions:** Describe technical requirements, constraints, and dependencies specific to NetSuite implementation. This helps developers understand the technical landscape.

### NetSuite Components Required

**Record Types:**
- [Standard record types used - e.g., "Customer, Sales Order"]
- [Custom records needed - e.g., "Custom Record: Equipment Asset"]

**Script Types:**
- [ ] Map/Reduce - [Purpose]
- [ ] Scheduled Script - [Purpose]
- [ ] Suitelet - [Purpose]
- [ ] RESTlet - [Purpose]
- [ ] User Event - [Purpose]
- [ ] Client Script - [Purpose]

**Custom Fields:**
- [Field 1: Record Type | Field ID | Purpose]
- [Field 2: Record Type | Field ID | Purpose]

**Saved Searches:**
- [Search 1: Purpose and criteria]
- [Search 2: Purpose and criteria]

### Integration Points

- [System/process 1 this integrates with]
- [System/process 2 this integrates with]
- [External APIs if applicable]

### Data Requirements

**Data Volume:**
- [Expected number of records to process]
- [Frequency of processing - e.g., "Daily", "Real-time"]

**Data Sources:**
- [Where data comes from]

**Data Retention:**
- [How long data should be kept]

### Technical Constraints

- [Constraint 1 - e.g., "Must work within NetSuite governance limits"]
- [Constraint 2 - e.g., "Should not require additional licenses"]
- [Constraint 3 - e.g., "Must integrate with existing Auth module"]

### Dependencies

- **Libraries needed:** [List from ADMIN_DEV/Libraries/ or to be created]
- **External dependencies:** [Third-party libraries, APIs, etc.]
- **Other features:** [Dependencies on other scripts or features]

### Governance Considerations

> Important for NetSuite: How will this handle governance limits?

- **Script governance:** [How will this stay within limits? e.g., "Use Map/Reduce for >1000 records"]
- **Search governance:** [Search optimization strategy]
- **API limits:** [If using external APIs, how to handle rate limits]

---

## 8. Success Metrics

> **Instructions:** How will we measure if this feature is successful? Be specific and quantifiable where possible.

**We will consider this feature successful when:**

- [Metric 1 - e.g., "User processing time reduced from 2 hours to 15 minutes"]
- [Metric 2 - e.g., "Zero data errors in production within first month"]
- [Metric 3 - e.g., "Support tickets related to X reduced by 50%"]
- [Metric 4 - e.g., "Feature used by 100% of admin users within 2 weeks"]

**How we'll measure:**
- [Tracking method 1]
- [Tracking method 2]

---

## 9. Implementation Plan

> **Instructions:** Detail the scripts that will be created and their purposes.

### Script Implementations

| Script Name | Type | Purpose | Status |
|-------------|------|---------|--------|
| hul_[type]_[name].js | Map/Reduce | [Purpose] | Not Started |
| hul_[type]_[name].js | Suitelet | [Purpose] | Not Started |

### Development Approach

**Phase 1:** [Description]
- [ ] Task 1
- [ ] Task 2

**Phase 2:** [Description]
- [ ] Task 3
- [ ] Task 4

---

## 10. Testing Requirements

> **Instructions:** Define how this feature should be tested. Include test scenarios, edge cases, and test data needs.

### Test Scenarios

**Happy Path:**
1. [Test case 1 - e.g., "User successfully creates a record with all required fields"]
2. [Test case 2]

**Edge Cases:**
1. [Edge case 1 - e.g., "What happens with invalid data?"]
2. [Edge case 2 - e.g., "What happens when record doesn't exist?"]
3. [Edge case 3 - e.g., "What happens with maximum data volume?"]

**Error Handling:**
1. [Error scenario 1 - e.g., "System displays clear error when required field is missing"]
2. [Error scenario 2]

### Test Data Requirements

- [Test data 1 - e.g., "50 sample customer records with varied data"]
- [Test data 2 - e.g., "Test user accounts with different roles"]

### Sandbox Setup

- [Setup step 1]
- [Setup step 2]

---

## 11. Security & Permissions

> **Instructions:** Define who should have access and any security considerations.

### Roles & Permissions

**Roles that need access:**
- [Role 1 - e.g., "Administrator"]
- [Role 2 - e.g., "Warehouse Manager"]

**Permissions required:**
- [Permission 1 - e.g., "View Customer Records"]
- [Permission 2 - e.g., "Edit Custom Records"]

### Data Security

- [Security consideration 1 - e.g., "Contains PII - must log access"]
- [Security consideration 2 - e.g., "Must not expose sensitive data in logs"]

---

## 12. Deployment Plan

### Pre-Deployment Checklist

- [ ] Code review completed
- [ ] All tests passing in sandbox
- [ ] Documentation updated (scripts commented, README updated)
- [ ] PRD_SCRIPT_INDEX.md updated
- [ ] Stakeholder approval obtained
- [ ] User training materials prepared (if needed)

### Deployment Steps

1. [Step 1 - e.g., "Create custom fields in production"]
2. [Step 2 - e.g., "Upload scripts via SDF"]
3. [Step 3 - e.g., "Create script deployment records"]
4. [Step 4 - e.g., "Test in production with limited data set"]
5. [Step 5 - e.g., "Enable for all users"]

### Post-Deployment

- [ ] Verify feature works in production
- [ ] Monitor error logs for 48 hours
- [ ] Confirm success metrics are being tracked
- [ ] Notify stakeholders of deployment
- [ ] Update PRD status to "Implemented"

### Rollback Plan

**If deployment fails:**
1. [Rollback step 1]
2. [Rollback step 2]

---

## 13. Timeline

| Milestone | Target Date | Actual Date | Status |
|-----------|-------------|-------------|--------|
| PRD Approval | | | |
| Development Start | | | |
| Development Complete | | | |
| Testing Complete | | | |
| Stakeholder Review | | | |
| Production Deploy | | | |

---

## 14. Open Questions & Risks

> **Instructions:** List any questions that need answers or risks that could impact the project.

### Open Questions

- [ ] [Question 1 - e.g., "Should this run daily or hourly?"]
- [ ] [Question 2 - e.g., "Which email template should we use for notifications?"]
- [ ] [Question 3]

### Known Risks

| Risk | Likelihood | Impact | Mitigation Strategy |
|------|------------|--------|---------------------|
| [Risk 1] | High/Med/Low | High/Med/Low | [How we'll address it] |
| [Risk 2] | High/Med/Low | High/Med/Low | [How we'll address it] |

---

## 15. References & Resources

### Related PRDs
- [Link to related PRD 1]
- [Link to related PRD 2]

### NetSuite Documentation
- [Link to relevant SuiteScript docs]
- [Link to NetSuite record type docs]

### External Resources
- [Link to external API docs if applicable]
- [Link to design resources]
- [Link to other reference materials]

---

## Revision History

| Date | Author | Version | Changes |
|------|--------|---------|---------|
| [Date] | [Name] | 1.0 | Initial draft |
| | | | |

---

## Notes for Using This Template

**Target Audience:** This PRD should be written so a junior developer can understand and implement it.

**Before You Start:**
1. Gather information by asking clarifying questions
2. Understand the "what" and "why" before the "how"
3. Be specific and avoid jargon

**While Writing:**
1. Use clear, explicit language
2. Avoid ambiguity - be specific
3. Include examples where helpful
4. Think about edge cases

**After Writing:**
1. Have someone else read it
2. Ask: "Could a junior developer implement this?"
3. Fill in any gaps or unclear sections

**Remember:**
- It's okay to have open questions - document them!
- Non-goals are just as important as goals
- Update the PRD as you learn more during development
