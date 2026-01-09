# ADMIN_DEV Documentation

This directory contains all documentation related to ADMIN_DEV scripts including PRDs, technical references, how-tos, and architecture documentation.

## Directory Structure

```
Documentation/
├── PRDs/                    # Product Requirement Documents
├── API_References/          # NetSuite API docs and references
├── HowTos/                  # Implementation guides and tutorials
├── Architecture/            # System design and technical architecture
├── Examples/                # Code examples and snippets
├── PRD_SCRIPT_INDEX.md      # Master index linking PRDs to scripts
└── README.md                # This file
```

## Folder Descriptions

### PRDs/
Contains Product Requirement Documents for features and functionality.

**Naming Convention:** `PRD-[YYYYMMDD]-[FeatureName].md`

**Examples:**
- `PRD-20251031-UserRoleSync.md`
- `PRD-20251115-DataCleanupScheduler.md`

**Template:** Use `_PRD_TEMPLATE.md` as a starting point for new PRDs.

### API_References/
Store NetSuite SuiteScript documentation, API references, and external docs here.

**Good for:**
- Copied SuiteScript API documentation
- Custom API endpoint specifications
- Third-party integration docs
- Record type field mappings

**Naming:** Use descriptive names
- `netsuite_search_module_reference.md`
- `customer_record_field_mapping.md`
- `restlet_api_endpoints.md`

### HowTos/
Step-by-step guides and tutorials for common tasks.

**Examples:**
- `howto_create_saved_search.md`
- `howto_deploy_mapreduce_script.md`
- `howto_test_scripts_in_sandbox.md`
- `howto_handle_governance_limits.md`

**Format:** Clear step-by-step instructions with code examples

### Architecture/
High-level system design, data flows, and technical architecture documents.

**Good for:**
- Data flow diagrams
- System architecture documents
- Integration architecture
- Database/record relationships
- Sequence diagrams

**Examples:**
- `admin_system_architecture.md`
- `user_sync_data_flow.md`
- `integration_overview.md`

### Examples/
Code snippets and example implementations.

**Good for:**
- Reusable code patterns
- Common implementation examples
- Script templates
- Sample API calls

**Examples:**
- `example_map_reduce_pattern.js`
- `example_suitelet_with_form.js`
- `example_restlet_crud.js`

## Best Practices

### 1. Keep PRDs and Scripts in Sync
- Always reference the PRD in your script's JSDoc comments
- Update PRD status as development progresses
- Maintain the `PRD_SCRIPT_INDEX.md` file

### 2. Version Control Documentation
- Document major changes in revision history
- Keep old versions if needed by renaming with version suffix
  - `PRD-20251031-Feature-v1.md`
  - `PRD-20251031-Feature-v2.md`

### 3. Link Generously
- Reference other docs and PRDs
- Link to NetSuite documentation
- Cross-reference related features

### 4. Use Consistent Formatting
- Use markdown for all documentation
- Include tables for structured data
- Use code blocks for examples
- Add comments to diagrams

### 5. Document As You Go
- Create the PRD before coding
- Update docs when requirements change
- Add how-tos when you solve complex problems
- Document workarounds and gotchas

## Workflow Example

1. **New Feature Request**
   ```
   1. Create PRD in PRDs/ folder
   2. Add entry to PRD_SCRIPT_INDEX.md
   3. Get PRD approved
   4. Create script implementation
   5. Reference PRD in script comments
   6. Update PRD status to "Implemented"
   ```

2. **Research Task**
   ```
   1. Research NetSuite API or feature
   2. Document findings in API_References/
   3. Create how-to guide if needed
   4. Reference in your scripts
   ```

3. **Complex Implementation**
   ```
   1. Create architecture doc first
   2. Reference in PRD
   3. Use as guide during development
   4. Update if implementation differs
   ```

## PRD Status Definitions

- **Draft:** Initial version, still being written
- **In Review:** Awaiting stakeholder approval
- **Approved:** Ready for implementation
- **In Development:** Actively being coded
- **Testing:** In sandbox testing
- **Implemented:** Deployed to production
- **On Hold:** Paused for some reason
- **Cancelled:** Not proceeding with this feature

## Quick Reference

### Creating a New PRD
1. Copy `PRDs/_PRD_TEMPLATE.md`
2. Rename using naming convention
3. Fill in all sections
4. Add to `PRD_SCRIPT_INDEX.md`
5. Get approval before coding

### Linking PRD to Script
In PRD:
```markdown
**Related Scripts:**
- MapReduce/hul_mr_feature_name.js
```

In Script:
```javascript
/**
 * @see Documentation/PRDs/PRD-20251031-FeatureName.md
 */
```

### Finding Documentation
1. Check `PRD_SCRIPT_INDEX.md` for feature-to-script mapping
2. Browse folder by document type
3. Use file search for keywords
4. Check script comments for PRD references

## Maintenance

Review and update documentation quarterly:
- [ ] Archive old/completed PRDs
- [ ] Update API references if NetSuite changes
- [ ] Refresh how-tos with better practices
- [ ] Update architecture docs for system changes

---

**Last Updated:** 2025-10-31
