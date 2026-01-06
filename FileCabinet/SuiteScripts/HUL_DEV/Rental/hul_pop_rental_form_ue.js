/**
* @NApiVersion 2.x
* @NScriptType UserEventScript
* @NModuleScope SameAccount
* author: name
* Date: M/D/YYYY
* Version: 1.0
*/
define(["require", "exports", "N/log", "N/runtime", "N/query"], function (require, exports, log, runtime, query) {
    "use strict";
    /**
    * Function definition to be triggered before record is loaded.
    *
    * @param {Object} ctx
    * @param {Record} ctx.newRecord - New record
    * @param {string} ctx.type - Trigger type
    * @param {Form} ctx.form - Form
    * @Since 2015.2
    */
    function beforeLoad(ctx) {
        if (ctx.type === ctx.UserEventType.CREATE) {
            var currentUser = runtime.getCurrentUser();
            var userRole = currentUser.role.toString();
            var newRecord = ctx.newRecord;
            // Set defaults based on role
            switch (userRole) {
                case '1162': // Rental Assistant Manager role ID
                    newRecord.setValue({
                        fieldId: 'cseg_sna_revenue_st',
                        value: 416
                    });
                    break;
                case '1151': // Rental Billing Coordinator role ID
                    newRecord.setValue({
                        fieldId: 'cseg_sna_revenue_st',
                        value: 416
                    });
                    break;
                case '1184': // Rental Coordinator role ID
                    newRecord.setValue({
                        fieldId: 'cseg_sna_revenue_st',
                        value: 416
                    });
                    break;
                case '1167': // Rental Manager role ID
                    newRecord.setValue({
                        fieldId: 'cseg_sna_revenue_st',
                        value: 416
                    });
                    break;
                default:
                    // Handle other roles or no specific defaults
                    break;
            }
            checkInsuranceWaiver(newRecord);
        }
    }
    /**
    * Function definition to be triggered before record is submitted.
    *
    * @param {Object} ctx
    * @param {Record} ctx.newRecord - New record
    * @param {Record} ctx.oldRecord - Old record
    * @param {string} ctx.type - Trigger type
    * @Since 2015.2
    */
    function beforeSubmit(ctx) {
    }
    /**
    * Function definition to be triggered after a record is submitted.
    *
    * @param {Object} ctx
    * @param {Record} ctx.newRecord - New record
    * @param {Record} ctx.oldRecord - Old record
    * @param {string} ctx.type - Trigger type
    * @Since 2015.2
    */
    function afterSubmit(ctx) {
    }
    /**
     * Check if insurance should be waived based on customer's certificate of insurance
     * @param {Record} salesOrderRecord - The sales order record
     */
    function checkInsuranceWaiver(salesOrderRecord) {
        try {
            var customerId = salesOrderRecord.getValue('entity');
            log.debug('Customer ID', customerId);
            // Ensure customer ID is valid
            if (!customerId) {
                return; // No customer selected yet
            }
            // Query customer insurance information
            var suiteQL = "\n            SELECT \n                custentity_sna_cert_of_insurance,\n                custentity_sna_hul_date_of_exp_coi\n            FROM \n                customer c\n            WHERE \n                c.id = ".concat(customerId, "\n        ");
            var queryResults = query.runSuiteQL({
                query: suiteQL
            });
            log.debug('Query Results', JSON.stringify(queryResults));
            if (queryResults.results && queryResults.results.length > 0) {
                var customerData = queryResults.results[0];
                var certOfInsurance = customerData.values[0]; // custentity_sna_cert_of_insurance
                var expirationDate = customerData.values[1]; // custentity_sna_hul_date_of_exp_coi
                // Check if certificate exists and expiration date is future
                var shouldWaiveInsurance = checkInsuranceConditions(certOfInsurance, expirationDate);
                // Set the insurance waiver field based on conditions
                if (shouldWaiveInsurance) {
                    salesOrderRecord.setValue({
                        fieldId: 'custbody_sna_hul_waive_insurance',
                        value: true
                    });
                }
            }
        }
        catch (error) {
            // Log error but don't fail the transaction
            log.error('Insurance Waiver Check Error', error);
        }
    }
    /**
     * Check if insurance conditions are met
     * @param {string} certOfInsurance - Certificate of insurance value
     * @param {string} expirationDate - Expiration date value
     * @returns {boolean} - True if insurance should be waived
     */
    function checkInsuranceConditions(certOfInsurance, expirationDate) {
        // Check if certificate of insurance has a value
        if (!certOfInsurance || certOfInsurance === '') {
            return false;
        }
        // Check if expiration date exists and is future dated
        if (!expirationDate) {
            return false;
        }
        var today = new Date();
        var expDate = new Date(expirationDate);
        return expDate > today;
    }
    return { beforeLoad: beforeLoad, beforeSubmit: beforeSubmit, afterSubmit: afterSubmit };
});
