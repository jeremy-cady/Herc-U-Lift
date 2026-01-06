/**
 * @NApiVersion 2.1
 * @NScriptType Restlet
 * @NModuleScope SameAccount
 * 
 * RESTlet for Driver Inspections with updated field IDs
 */
define(['N/record', 'N/log', 'N/format'], function(record, log, format) {
    
    const RECORD_TYPE = 'customrecord_hul_employee_drivers_inspec';
    
    function doPost(requestBody) {
        try {
            // Log incoming request
            log.audit('Incoming Request', JSON.stringify(requestBody));
            
            // Handle array wrapper
            const data = Array.isArray(requestBody) ? requestBody[0] : requestBody;
            
            // Create new record
            const newRecord = record.create({
                type: RECORD_TYPE,
                isDynamic: false
            });
            
            // Define field types
            const integerFields = ['custrecord_hul_driveinp_mileage', 'custrecord_hul_driveinp_drivers_inp_loc'];
            
            // Process and set each field
            for (const [fieldId, value] of Object.entries(data)) {
                try {
                    // Skip null/undefined/empty values
                    if (value === null || value === undefined || value === '') {
                        log.debug('Skipping empty field', fieldId);
                        continue;
                    }
                    
                    let processedValue = value;
                    
                    // Handle integer fields
                    if (integerFields.includes(fieldId)) {
                        processedValue = parseInt(value) || 0;
                    }
                    
                    // Set the value
                    newRecord.setValue({
                        fieldId: fieldId,
                        value: processedValue
                    });
                    
                    log.debug('Field Set Successfully', `${fieldId} = ${processedValue} (type: ${typeof processedValue})`);
                    
                } catch (fieldError) {
                    log.error('Field Setting Error', `Field: ${fieldId}, Value: ${value}, Error: ${fieldError.message}`);
                    // Continue with other fields even if one fails
                }
            }
            
            // Try to save the record
            const recordId = newRecord.save({
                enableSourcing: false,
                ignoreMandatoryFields: false
            });
            
            log.audit('Record Created Successfully', `ID: ${recordId}`);
            
            // Load and return the saved record to verify
            const savedRecord = record.load({
                type: RECORD_TYPE,
                id: recordId
            });
            
            // Get specific fields to verify they were saved
            const verificationData = {
                id: recordId,
                truckNo: savedRecord.getValue('custrecord_hul_driveinp_truckortractorno'),
                location: savedRecord.getValue('custrecord_hul_driveinp_drivers_inp_loc'),
                cabDoorsWindows: savedRecord.getValue('custrecord_hul_driveinp_cabdoorswindows')
            };
            
            return {
                success: true,
                internalId: recordId,
                recordId: recordId,
                message: `Record created successfully with Internal ID: ${recordId}`,
                verification: verificationData,
                processedFields: Object.keys(data).length
            };
            
        } catch (error) {
            log.error('RESTlet Error', error.toString());
            return {
                success: false,
                error: error.message || 'Unknown error occurred',
                details: error.toString(),
                receivedData: requestBody
            };
        }
    }
    
    function doGet(params) {
        try {
            if (!params.id) {
                return { success: false, error: 'ID required' };
            }
            
            const loadedRecord = record.load({
                type: RECORD_TYPE,
                id: params.id
            });
            
            return {
                success: true,
                id: params.id,
                sampleFields: {
                    truckNo: loadedRecord.getValue('custrecord_hul_driveinp_truckortractorno'),
                    location: loadedRecord.getValue('custrecord_hul_driveinp_drivers_inp_loc'),
                    mileage: loadedRecord.getValue('custrecord_hul_driveinp_mileage'),
                    remarks: loadedRecord.getValue('custrecord_hul_driveinp_remarks')
                }
            };
            
        } catch (error) {
            return { success: false, error: error.message };
        }
    }
    
    // PUT method for updating records
    function doPut(requestBody) {
        try {
            // Log incoming request
            log.audit('PUT Request', JSON.stringify(requestBody));
            
            // Handle array wrapper
            const data = Array.isArray(requestBody) ? requestBody[0] : requestBody;
            
            // Validate ID exists
            if (!data.id) {
                throw new Error('Record ID is required for update');
            }
            
            // Load existing record
            const updateRecord = record.load({
                type: RECORD_TYPE,
                id: data.id,
                isDynamic: false
            });
            
            // Define field types
            const integerFields = ['custrecord_hul_driveinp_mileage', 'custrecord_hul_driveinp_drivers_inp_loc'];
            
            // Update fields
            for (const [fieldId, value] of Object.entries(data)) {
                try {
                    // Skip ID field and null/undefined values
                    if (fieldId === 'id' || value === null || value === undefined) {
                        continue;
                    }
                    
                    let processedValue = value;
                    
                    // Handle integer fields
                    if (integerFields.includes(fieldId)) {
                        processedValue = parseInt(value) || 0;
                    }
                    
                    // Set the value
                    updateRecord.setValue({
                        fieldId: fieldId,
                        value: processedValue
                    });
                    
                    log.debug('Field Updated', `${fieldId} = ${processedValue}`);
                    
                } catch (fieldError) {
                    log.error('Field Update Error', `Field: ${fieldId}, Error: ${fieldError.message}`);
                }
            }
            
            // Save the updated record
            const recordId = updateRecord.save({
                enableSourcing: false,
                ignoreMandatoryFields: false
            });
            
            log.audit('Record Updated Successfully', `ID: ${recordId}`);
            
            // Return success response
            return {
                success: true,
                internalId: recordId,
                recordId: recordId,
                message: `Record updated successfully with ID: ${recordId}`,
                updatedFields: Object.keys(data).filter(k => k !== 'id').length
            };
            
        } catch (error) {
            log.error('PUT Error', error.toString());
            return {
                success: false,
                error: error.message || 'Unknown error occurred',
                details: error.toString()
            };
        }
    }
    
    return {
        post: doPost,
        get: doGet,
        put: doPut
    };
});