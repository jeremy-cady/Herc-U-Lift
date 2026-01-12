# PRD: [Feature Name]

**PRD ID:** PRD-[YYYYMMDD]-[FeatureName]
**Created:** [Month DD, YYYY]
**Last Updated:** [Month DD, YYYY]
**Author:** [Name]
**Status:** Draft | In Review | Approved | In Development | Testing | Implemented
**Related Scripts:**
- [Path/Script File] ([Type])
- [Path/Script File] ([Type])

**Script Deployment (if applicable):**
- Script ID: [customscript_xxx]
- Deployment ID: [customdeploy_xxx]

---

## 1. Introduction / Overview

**What is this feature?**
[Brief description of the feature]

**What problem does it solve?**
[Problem statement]

**Primary Goal:**
[One sentence objective]

---

## 2. Goals

1. [Goal 1]
2. [Goal 2]
3. [Goal 3]

---

## 3. User Stories

1. **As a** [user role], **I want to** [action] **so that** [benefit]
2. **As a** [user role], **I want to** [action] **so that** [benefit]
3. **As a** [user role], **I want to** [action] **so that** [benefit]

---

## 4. Functional Requirements

### Core Functionality

1. The system must [requirement]
2. The system must [requirement]
3. The system must [requirement]
4. When [condition], the system must [action]

### Acceptance Criteria

- [ ] [Criterion 1]
- [ ] [Criterion 2]
- [ ] [Criterion 3]
- [ ] [Criterion 4]

---

## 5. Non-Goals (Out of Scope)

**This feature will NOT:**

- [Item 1]
- [Item 2]
- [Item 3]

---

## 6. Design Considerations

### User Interface
- [UI requirement 1]
- [UI requirement 2]

### User Experience
- [UX requirement 1]
- [UX requirement 2]

### Design References
- [Link to mockups or wireframes]
- [Reference to existing features]

---

## 7. Technical Considerations

### NetSuite Components Required

**Record Types:**
- [Standard record types]
- [Custom record types]

**Script Types:**
- [ ] Map/Reduce - [Purpose]
- [ ] Scheduled Script - [Purpose]
- [ ] Suitelet - [Purpose]
- [ ] RESTlet - [Purpose]
- [ ] User Event - [Purpose]
- [ ] Client Script - [Purpose]

**Custom Fields:**
- [Record Type | Field ID | Purpose]
- [Record Type | Field ID | Purpose]

**Saved Searches:**
- [Search 1 | Purpose and criteria]
- [Search 2 | Purpose and criteria]

### Integration Points
- [System/process 1]
- [System/process 2]
- [External APIs if applicable]

### Data Requirements

**Data Volume:**
- [Expected number of records]
- [Frequency of processing]

**Data Sources:**
- [Source system/records]

**Data Retention:**
- [Retention policy]

### Technical Constraints
- [Constraint 1]
- [Constraint 2]
- [Constraint 3]

### Dependencies
- **Libraries needed:** [ADMIN_DEV/Libraries/...]
- **External dependencies:** [APIs, services]
- **Other features:** [Dependencies on other scripts/features]

### Governance Considerations

- **Script governance:** [Strategy]
- **Search governance:** [Optimization]
- **API limits:** [Rate limiting]

---

## 8. Success Metrics

**We will consider this feature successful when:**

- [Metric 1]
- [Metric 2]
- [Metric 3]
- [Metric 4]

**How we'll measure:**
- [Tracking method 1]
- [Tracking method 2]

---

## 9. Implementation Plan

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

### Test Scenarios

**Happy Path:**
1. [Test case 1]
2. [Test case 2]

**Edge Cases:**
1. [Edge case 1]
2. [Edge case 2]
3. [Edge case 3]

**Error Handling:**
1. [Error scenario 1]
2. [Error scenario 2]

### Test Data Requirements
- [Test data 1]
- [Test data 2]

### Sandbox Setup
- [Setup step 1]
- [Setup step 2]

---

## 11. Security & Permissions

### Roles & Permissions

**Roles that need access:**
- [Role 1]
- [Role 2]

**Permissions required:**
- [Permission 1]
- [Permission 2]

### Data Security
- [Security consideration 1]
- [Security consideration 2]

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

1. [Step 1]
2. [Step 2]
3. [Step 3]
4. [Step 4]
5. [Step 5]

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

### Open Questions

- [ ] [Question 1]
- [ ] [Question 2]
- [ ] [Question 3]

### Known Risks

| Risk | Likelihood | Impact | Mitigation Strategy |
|------|------------|--------|---------------------|
| [Risk 1] | High/Med/Low | High/Med/Low | [Mitigation] |
| [Risk 2] | High/Med/Low | High/Med/Low | [Mitigation] |

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
