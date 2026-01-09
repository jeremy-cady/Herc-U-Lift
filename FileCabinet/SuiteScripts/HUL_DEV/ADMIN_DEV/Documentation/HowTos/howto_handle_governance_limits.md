# How To: Handle NetSuite Governance Limits

**Last Updated:** 2025-10-31
**Applies To:** All SuiteScript 2.x script types

## Overview

NetSuite enforces governance limits to prevent scripts from consuming excessive resources. Understanding and handling these limits is critical for successful script execution.

## Governance Limits by Script Type

| Script Type | Usage Limit | Time Limit | Rescue Available? |
|-------------|-------------|------------|-------------------|
| Client Script | 1,000 units | N/A | No |
| User Event | 1,000 units | N/A | No |
| Scheduled Script | 10,000 units | 1 hour | No |
| Map/Reduce | 10,000 per stage | 1 hour per stage | Yes (automatic) |
| Suitelet | 1,000 units | 60 seconds | No |
| RESTlet | 1,000 units | 60 seconds | No |
| Workflow Action | 1,000 units | N/A | No |

## Common Operations and Their Costs

| Operation | Approximate Units |
|-----------|------------------|
| record.load() | 10 units |
| record.save() | 10 units + 4 units per field |
| search.create() + run() | 10 units |
| Each 1,000 search results | 10 units |
| record.submitFields() | 10 units + 2 units per field |
| record.delete() | 10 units |

## Strategy 1: Monitor Usage

### Check Current Usage

```javascript
/**
 * Monitors and logs remaining governance units
 */
function checkGovernance() {
    var script = runtime.getCurrentScript();
    var remainingUsage = script.getRemainingUsage();

    log.debug('Governance', 'Remaining units: ' + remainingUsage);

    return remainingUsage;
}
```

### Check Before Expensive Operations

```javascript
function processRecords(recordIds) {
    var script = runtime.getCurrentScript();

    recordIds.forEach(function(id) {
        // Check if we have enough units (need ~20 for load + save)
        if (script.getRemainingUsage() < 50) {
            log.audit('Governance Limit', 'Approaching limit, stopping early');
            return; // Exit early
        }

        // Process the record
        var rec = record.load({
            type: record.Type.CUSTOMER,
            id: id
        });

        // Make changes...
        rec.save();
    });
}
```

## Strategy 2: Batch Operations

### Use submitFields Instead of Load/Save

```javascript
// EXPENSIVE (20+ units per record):
var rec = record.load({ type: record.Type.CUSTOMER, id: customerId });
rec.setValue({ fieldId: 'custentity_field', value: 'newValue' });
rec.save();

// EFFICIENT (12-14 units per record):
record.submitFields({
    type: record.Type.CUSTOMER,
    id: customerId,
    values: {
        custentity_field: 'newValue'
    }
});
```

### Process in Chunks

```javascript
function processInChunks(allRecordIds, chunkSize) {
    var script = runtime.getCurrentScript();
    chunkSize = chunkSize || 50;

    for (var i = 0; i < allRecordIds.length; i += chunkSize) {
        var chunk = allRecordIds.slice(i, i + chunkSize);

        // Check governance before processing chunk
        if (script.getRemainingUsage() < 100) {
            log.audit('Governance', 'Stopping at record ' + i + ' of ' + allRecordIds.length);
            break;
        }

        processChunk(chunk);
    }
}
```

## Strategy 3: Use Map/Reduce for Large Datasets

Map/Reduce scripts automatically handle governance with built-in reschedule functionality.

```javascript
/**
 * @NApiVersion 2.1
 * @NScriptType MapReduceScript
 */
define(['N/record', 'N/search'], function(record, search) {

    function getInputData() {
        // Return search with 10,000+ records
        return search.create({
            type: search.Type.CUSTOMER,
            filters: [['isinactive', 'is', 'F']],
            columns: ['entityid']
        });
    }

    function map(context) {
        // Each map invocation has fresh governance units
        var rec = record.load({
            type: record.Type.CUSTOMER,
            id: context.key
        });

        // Process record...
        rec.save();
    }

    return {
        getInputData: getInputData,
        map: map
    };
});
```

## Strategy 4: Optimize Searches

### Use Search Pagination Efficiently

```javascript
function getAllSearchResults(searchObj) {
    var results = [];
    var pageSize = 1000;
    var start = 0;

    do {
        var resultSlice = searchObj.run().getRange({
            start: start,
            end: start + pageSize
        });

        if (!resultSlice || resultSlice.length === 0) {
            break;
        }

        results = results.concat(resultSlice);
        start += pageSize;

        // Check governance
        if (runtime.getCurrentScript().getRemainingUsage() < 100) {
            log.audit('Governance', 'Stopping search pagination');
            break;
        }

    } while (resultSlice.length === pageSize);

    return results;
}
```

### Limit Search Columns

```javascript
// EXPENSIVE - Gets all fields:
var results = search.create({
    type: search.Type.CUSTOMER,
    filters: [['isinactive', 'is', 'F']]
}).run().getRange({ start: 0, end: 1000 });

// EFFICIENT - Only gets needed fields:
var results = search.create({
    type: search.Type.CUSTOMER,
    filters: [['isinactive', 'is', 'F']],
    columns: ['entityid', 'email'] // Only needed fields
}).run().getRange({ start: 0, end: 1000 });
```

## Strategy 5: Queue Processing

For Scheduled Scripts, break work into multiple executions:

```javascript
/**
 * @NApiVersion 2.1
 * @NScriptType ScheduledScript
 */
define(['N/task', 'N/search', 'N/runtime'],
    function(task, search, runtime) {

    function execute(context) {
        var script = runtime.getCurrentScript();
        var startIndex = script.getParameter({ name: 'custscript_start_index' }) || 0;

        var searchObj = search.create({
            type: search.Type.CUSTOMER,
            filters: [['isinactive', 'is', 'F']]
        });

        var results = searchObj.run().getRange({
            start: startIndex,
            end: startIndex + 100
        });

        // Process results...
        results.forEach(function(result) {
            // Process each record
        });

        // If more records exist and we have governance left
        if (results.length === 100 && script.getRemainingUsage() > 1000) {
            // Reschedule for next batch
            var rescheduleTask = task.create({
                taskType: task.TaskType.SCHEDULED_SCRIPT,
                scriptId: script.id,
                deploymentId: script.deploymentId,
                params: {
                    custscript_start_index: startIndex + 100
                }
            });
            rescheduleTask.submit();
        }
    }

    return { execute: execute };
});
```

## Best Practices Checklist

- [ ] Monitor governance regularly with `getRemainingUsage()`
- [ ] Use `submitFields()` instead of load/save when possible
- [ ] Limit search columns to only what you need
- [ ] Process records in chunks
- [ ] Use Map/Reduce for large datasets (>1000 records)
- [ ] Implement early exit strategies
- [ ] Log governance warnings
- [ ] Test with production-size datasets in sandbox

## Troubleshooting

### "SSS_USAGE_LIMIT_EXCEEDED" Error

**Cause:** Script exceeded governance limits

**Solutions:**
1. Convert to Map/Reduce script
2. Reduce batch size
3. Use more efficient operations (submitFields)
4. Implement chunking with rescheduling

### Script Times Out

**Cause:** Operation takes too long

**Solutions:**
1. Reduce the amount of work per execution
2. Use Map/Reduce for parallelization
3. Optimize searches and reduce unnecessary operations
4. Break into multiple scheduled executions

## Additional Resources

- [NetSuite SuiteScript 2.1 Governance Documentation](https://system.netsuite.com/)
- [NetSuite Help: Scripting Best Practices](https://system.netsuite.com/)

---

**Questions?** Contact the development team or consult NetSuite documentation.
