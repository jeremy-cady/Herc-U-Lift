/**
 * @NApiVersion 2.1
 * @NScriptType MapReduceScript
 * @description Template for Map/Reduce scripts
 * @see Documentation/PRDs/[YOUR_PRD_NAME].md
 */
define(['N/search', 'N/record', 'N/runtime', '../Libraries/hul_lib_search_utils'],
    function(search, record, runtime, searchUtils) {

    /**
     * Marks the beginning of the Map/Reduce process
     * Generates the input data for the process
     * @param {Object} context
     * @param {boolean} context.isRestarted - Indicates whether script was restarted
     * @returns {Array|Object|Search|RecordRef} - Input data to process
     */
    function getInputData(context) {
        log.audit('getInputData', 'Starting Map/Reduce process');

        try {
            // Option 1: Return a saved search
            return search.create({
                type: search.Type.CUSTOMER,
                filters: [
                    ['isinactive', 'is', 'F']
                ],
                columns: [
                    'entityid',
                    'email',
                    'datecreated'
                ]
            });

            // Option 2: Return an array of objects
            // return [
            //     { id: 1, data: 'value1' },
            //     { id: 2, data: 'value2' }
            // ];

        } catch (e) {
            log.error('getInputData Error', e.toString());
            throw e;
        }
    }

    /**
     * Executes when the map entry point is triggered
     * Processes each key-value pair from the input stage
     * @param {Object} context
     * @param {boolean} context.isRestarted - Indicates whether script was restarted
     * @param {number} context.executionNo - Number of times the script has been executed
     * @param {string} context.key - Key from input stage
     * @param {string} context.value - Value from input stage
     */
    function map(context) {
        try {
            var searchResult = JSON.parse(context.value);
            var recordId = searchResult.id;

            log.debug('map', 'Processing record: ' + recordId);

            // Process the record
            var processedData = {
                id: recordId,
                entityid: searchResult.values.entityid,
                email: searchResult.values.email,
                // Add your processing logic here
                processed: true,
                timestamp: new Date()
            };

            // Write to reduce stage
            // Key should group related records together
            context.write({
                key: recordId,
                value: processedData
            });

        } catch (e) {
            log.error('map Error', 'Record: ' + context.key + ', Error: ' + e.toString());
        }
    }

    /**
     * Executes when the reduce entry point is triggered
     * Processes grouped values from the map stage
     * @param {Object} context
     * @param {boolean} context.isRestarted - Indicates whether script was restarted
     * @param {number} context.executionNo - Number of times the script has been executed
     * @param {string} context.key - Key from map stage
     * @param {Array<string>} context.values - All values associated with the key
     */
    function reduce(context) {
        try {
            var recordId = context.key;
            var values = context.values.map(function(val) {
                return JSON.parse(val);
            });

            log.debug('reduce', 'Processing key: ' + recordId + ', Values: ' + values.length);

            // Aggregate or process the grouped values
            var aggregatedData = {
                recordId: recordId,
                count: values.length,
                // Add your reduce logic here
            };

            // Option 1: Update records
            // record.submitFields({
            //     type: record.Type.CUSTOMER,
            //     id: recordId,
            //     values: {
            //         custentity_field: 'value'
            //     }
            // });

            // Option 2: Write to summarize stage
            context.write({
                key: recordId,
                value: aggregatedData
            });

        } catch (e) {
            log.error('reduce Error', 'Key: ' + context.key + ', Error: ' + e.toString());
        }
    }

    /**
     * Executes when the summarize entry point is triggered
     * Finalizes the process and handles any errors
     * @param {Object} context
     * @param {number} context.concurrency - Maximum concurrency number
     * @param {Date} context.dateCreated - Date/time script began running
     * @param {boolean} context.isRestarted - Indicates whether script was restarted
     * @param {Iterator} context.output - Iterator for output from reduce stage
     * @param {number} context.seconds - Total seconds elapsed
     * @param {number} context.usage - Total usage consumed
     * @param {number} context.yields - Total number of yields
     * @param {Object} context.inputSummary - Statistics about input stage
     * @param {Object} context.mapSummary - Statistics about map stage
     * @param {Object} context.reduceSummary - Statistics about reduce stage
     */
    function summarize(context) {
        log.audit('summarize', 'Script execution summary');

        // Log input stage
        log.audit('Input Stage', JSON.stringify(context.inputSummary));

        // Log map stage
        log.audit('Map Stage', JSON.stringify(context.mapSummary));

        // Log reduce stage
        log.audit('Reduce Stage', JSON.stringify(context.reduceSummary));

        // Handle errors from each stage
        handleErrorsAndFailures(context);

        // Log final summary
        log.audit('Total Usage', context.usage);
        log.audit('Total Time (seconds)', context.seconds);
        log.audit('Yields', context.yields);

        // Process output if needed
        context.output.each(function(key, value) {
            log.debug('Output', 'Key: ' + key + ', Value: ' + value);
            return true;
        });

        log.audit('summarize', 'Map/Reduce process completed');
    }

    /**
     * Handles errors from all stages
     * @param {Object} context
     */
    function handleErrorsAndFailures(context) {
        var errorCount = 0;

        // Check for input stage errors
        if (context.inputSummary.error) {
            log.error('Input Error', context.inputSummary.error);
            errorCount++;
        }

        // Check for map stage errors
        context.mapSummary.errors.iterator().each(function(key, error) {
            log.error('Map Error - Key: ' + key, error);
            errorCount++;
            return true;
        });

        // Check for reduce stage errors
        context.reduceSummary.errors.iterator().each(function(key, error) {
            log.error('Reduce Error - Key: ' + key, error);
            errorCount++;
            return true;
        });

        if (errorCount > 0) {
            log.error('Total Errors', errorCount + ' errors occurred during execution');
        }
    }

    return {
        getInputData: getInputData,
        map: map,
        reduce: reduce,
        summarize: summarize
    };
});
