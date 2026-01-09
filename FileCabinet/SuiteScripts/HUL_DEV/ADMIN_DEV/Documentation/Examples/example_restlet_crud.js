/**
 * @NApiVersion 2.1
 * @NScriptType Restlet
 * @description RESTlet template for CRUD operations
 * @see Documentation/PRDs/[YOUR_PRD_NAME].md
 */
define(['N/record', 'N/search', 'N/error'],
    function(record, search, error) {

    /**
     * Handles GET requests
     * @param {Object} context - Request parameters
     * @returns {Object} Response object
     */
    function get(context) {
        log.debug('GET Request', JSON.stringify(context));

        try {
            // Validate required parameters
            if (!context.recordType || !context.recordId) {
                return createErrorResponse(400, 'Missing required parameters: recordType and recordId');
            }

            // Load the record
            var rec = record.load({
                type: context.recordType,
                id: context.recordId,
                isDynamic: false
            });

            // Build response with field values
            var responseData = {
                id: rec.id,
                type: rec.type,
                // Add specific fields as needed
                fields: {}
            };

            // Example: Get specific fields
            var fieldsToGet = context.fields ? context.fields.split(',') : [];
            fieldsToGet.forEach(function(fieldId) {
                try {
                    responseData.fields[fieldId] = rec.getValue({ fieldId: fieldId });
                } catch (e) {
                    log.error('Field Error', 'Cannot get field: ' + fieldId);
                }
            });

            return createSuccessResponse(responseData);

        } catch (e) {
            log.error('GET Error', e.toString());
            return createErrorResponse(500, e.message);
        }
    }

    /**
     * Handles POST requests (Create new record)
     * @param {Object} context - Request body
     * @returns {Object} Response object
     */
    function post(context) {
        log.debug('POST Request', JSON.stringify(context));

        try {
            // Validate required parameters
            if (!context.recordType) {
                return createErrorResponse(400, 'Missing required parameter: recordType');
            }

            // Create new record
            var rec = record.create({
                type: context.recordType,
                isDynamic: false
            });

            // Set field values from request
            if (context.fields) {
                for (var fieldId in context.fields) {
                    try {
                        rec.setValue({
                            fieldId: fieldId,
                            value: context.fields[fieldId]
                        });
                    } catch (e) {
                        log.error('Field Error', 'Cannot set field: ' + fieldId + ', Error: ' + e.toString());
                    }
                }
            }

            // Save the record
            var recordId = rec.save();

            log.audit('Record Created', 'Type: ' + context.recordType + ', ID: ' + recordId);

            return createSuccessResponse({
                message: 'Record created successfully',
                recordId: recordId,
                recordType: context.recordType
            });

        } catch (e) {
            log.error('POST Error', e.toString());
            return createErrorResponse(500, e.message);
        }
    }

    /**
     * Handles PUT requests (Update existing record)
     * @param {Object} context - Request body
     * @returns {Object} Response object
     */
    function put(context) {
        log.debug('PUT Request', JSON.stringify(context));

        try {
            // Validate required parameters
            if (!context.recordType || !context.recordId) {
                return createErrorResponse(400, 'Missing required parameters: recordType and recordId');
            }

            // Load existing record
            var rec = record.load({
                type: context.recordType,
                id: context.recordId,
                isDynamic: false
            });

            // Update field values from request
            if (context.fields) {
                for (var fieldId in context.fields) {
                    try {
                        rec.setValue({
                            fieldId: fieldId,
                            value: context.fields[fieldId]
                        });
                    } catch (e) {
                        log.error('Field Error', 'Cannot update field: ' + fieldId + ', Error: ' + e.toString());
                    }
                }
            }

            // Save the record
            var recordId = rec.save();

            log.audit('Record Updated', 'Type: ' + context.recordType + ', ID: ' + recordId);

            return createSuccessResponse({
                message: 'Record updated successfully',
                recordId: recordId,
                recordType: context.recordType
            });

        } catch (e) {
            log.error('PUT Error', e.toString());
            return createErrorResponse(500, e.message);
        }
    }

    /**
     * Handles DELETE requests
     * @param {Object} context - Request parameters
     * @returns {Object} Response object
     */
    function doDelete(context) {
        log.debug('DELETE Request', JSON.stringify(context));

        try {
            // Validate required parameters
            if (!context.recordType || !context.recordId) {
                return createErrorResponse(400, 'Missing required parameters: recordType and recordId');
            }

            // Delete the record
            record.delete({
                type: context.recordType,
                id: context.recordId
            });

            log.audit('Record Deleted', 'Type: ' + context.recordType + ', ID: ' + context.recordId);

            return createSuccessResponse({
                message: 'Record deleted successfully',
                recordId: context.recordId,
                recordType: context.recordType
            });

        } catch (e) {
            log.error('DELETE Error', e.toString());
            return createErrorResponse(500, e.message);
        }
    }

    /**
     * Creates a success response object
     * @param {*} data - Response data
     * @returns {Object} Formatted response
     */
    function createSuccessResponse(data) {
        return {
            success: true,
            data: data,
            timestamp: new Date().toISOString()
        };
    }

    /**
     * Creates an error response object
     * @param {number} code - HTTP status code
     * @param {string} message - Error message
     * @returns {Object} Formatted error response
     */
    function createErrorResponse(code, message) {
        return {
            success: false,
            error: {
                code: code,
                message: message
            },
            timestamp: new Date().toISOString()
        };
    }

    return {
        get: get,
        post: post,
        put: put,
        delete: doDelete
    };
});

/*
 * USAGE EXAMPLES:
 *
 * 1. GET Request (Read Record):
 *    URL: https://[accountId].restlets.api.netsuite.com/app/site/hosting/restlet.nl?script=[scriptId]&deploy=[deployId]
 *    Method: GET
 *    Headers: { Authorization: NLAuth... }
 *    Body: {
 *      "recordType": "customer",
 *      "recordId": "12345",
 *      "fields": "entityid,email,companyname"
 *    }
 *
 * 2. POST Request (Create Record):
 *    Method: POST
 *    Body: {
 *      "recordType": "customer",
 *      "fields": {
 *        "companyname": "Test Company",
 *        "email": "test@example.com"
 *      }
 *    }
 *
 * 3. PUT Request (Update Record):
 *    Method: PUT
 *    Body: {
 *      "recordType": "customer",
 *      "recordId": "12345",
 *      "fields": {
 *        "email": "newemail@example.com"
 *      }
 *    }
 *
 * 4. DELETE Request (Delete Record):
 *    Method: DELETE
 *    Body: {
 *      "recordType": "customer",
 *      "recordId": "12345"
 *    }
 */
