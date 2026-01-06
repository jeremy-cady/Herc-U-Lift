/*
 * Copyright (c) 2024, ScaleNorth Advisors LLC and/or its affiliates. All rights reserved.
 *
 * @author Care Parba
 *
 * Script brief description:
 * This Map/Reduce script is used for Bulk Deletion of Invoice based on search "No Finance Charge Customers"
 *
 *
 * Revision History:
 *
 * Date            Issue/Case           Author              Issue Fix Summary
 * =============================================================================================
 * 2024/01/09      Task 133170          SJ Prat             Initial version
 *
 */

/**
 * @NApiVersion 2.1
 * @NScriptType MapReduceScript
 */
define(['N/email', 'N/record', 'N/search', 'N/runtime', 'N/url', 'N/format'],
    /**
 * @param{email} email
 * @param{record} record
 * @param{search} search
 */
    (email, record, search, runtime, url,format) => {
        /**
         * Defines the function that is executed at the beginning of the map/reduce process and generates the input data.
         * @param {Object} inputContext
         * @param {boolean} inputContext.isRestarted - Indicates whether the current invocation of this function is the first
         *     invocation (if true, the current invocation is not the first invocation and this function has been restarted)
         * @param {Object} inputContext.ObjectRef - Object that references the input data
         * @typedef {Object} ObjectRef
         * @property {string|number} ObjectRef.id - Internal ID of the record instance that contains the input data
         * @property {string} ObjectRef.type - Type of the record instance that contains the input data
         * @returns {Array|Object|Search|ObjectRef|File|Query} The input data to use in the map/reduce process
         * @since 2015.2
         */

        const getInputData = (inputContext) => {
            return search.load({id: 'customsearch_sna_fin_chrg_cust'});
        }

        /**
         * Defines the function that is executed when the map entry point is triggered. This entry point is triggered automatically
         * when the associated getInputData stage is complete. This function is applied to each key-value pair in the provided
         * context.
         * @param {Object} mapContext - Data collection containing the key-value pairs to process in the map stage. This parameter
         *     is provided automatically based on the results of the getInputData stage.
         * @param {Iterator} mapContext.errors - Serialized errors that were thrown during previous attempts to execute the map
         *     function on the current key-value pair
         * @param {number} mapContext.executionNo - Number of times the map function has been executed on the current key-value
         *     pair
         * @param {boolean} mapContext.isRestarted - Indicates whether the current invocation of this function is the first
         *     invocation (if true, the current invocation is not the first invocation and this function has been restarted)
         * @param {string} mapContext.key - Key to be processed during the map stage
         * @param {string} mapContext.value - Value to be processed during the map stage
         * @since 2015.2
         */

        const map = (context) => {
                log.debug("Map Context", JSON.stringify(context));
                var recId = context.key;
                var value = context.value;
                value = JSON.parse(value);

                var domainName = url.resolveDomain({
                    hostType: url.HostType.APPLICATION
                });
                var output = url.resolveRecord({
                    recordType: value.recordType,
                    recordId: recId,
                    isEditMode: true
                });
                var recordURL = domainName+output

                var delrec = false;

            try {
                // if(runtime.envType === 'SANDBOX') {
                    delrec = record.delete({
                        type: value.recordType,
                        id: recId,
                    });
                // }

                if (delrec){
                    log.debug("Success Delete", "Invoice: "+ value.values.tranid +  " Internal Id: "+ recId);
                    context.write({key:'Success',value: value.values.tranid});
                }else{
                    log.debug("Fail Delete", recordURL);
                    context.write({key:'Fail',value: '<a href="'+recordURL+'">'+ recordURL + '</a>'});
                }
            }catch(e){
                log.error("error in map", e);
                context.write({key:'Fail',value: recordURL});
            }
        }

        /**
         * Defines the function that is executed when the summarize entry point is triggered. This entry point is triggered
         * automatically when the associated reduce stage is complete. This function is applied to the entire result set.
         * @param {Object} summaryContext - Statistics about the execution of a map/reduce script
         * @param {number} summaryContext.concurrency - Maximum concurrency number when executing parallel tasks for the map/reduce
         *     script
         * @param {Date} summaryContext.dateCreated - The date and time when the map/reduce script began running
         * @param {boolean} summaryContext.isRestarted - Indicates whether the current invocation of this function is the first
         *     invocation (if true, the current invocation is not the first invocation and this function has been restarted)
         * @param {Iterator} summaryContext.output - Serialized keys and values that were saved as output during the reduce stage
         * @param {number} summaryContext.seconds - Total seconds elapsed when running the map/reduce script
         * @param {number} summaryContext.usage - Total number of governance usage units consumed when running the map/reduce
         *     script
         * @param {number} summaryContext.yields - Total number of yields when running the map/reduce script
         * @param {Object} summaryContext.inputSummary - Statistics about the input stage
         * @param {Object} summaryContext.mapSummary - Statistics about the map stage
         * @param {Object} summaryContext.reduceSummary - Statistics about the reduce stage
         * @since 2015.2
         */
        const summarize = (summary) => {

            try{
                let success = [];
                let failed = [];

                log.debug("summary", summary);

                summary.output.iterator().each(function(key,value) {
                    log.debug(key, value);
                    if(key == 'Fail'){
                        failed.push(value);
                    }else if(key == 'Success'){
                        success.push(value);
                    }
                    return true;
                });

                log.debug("success array", success);
                log.debug("failed array", failed);

                let successCount = success.length;
                let strInvoice = successCount > 1? successCount + ' Invoices': successCount + ' Invoice';
                let strSuccess = success.length > 0 ? 'Successfully deleted '+ strInvoice : 'No Invoices were deleted.';
                let strFailed = failed.length > 0 ? 'Failed to Delete the following: <br/> '+ failed.join(' <br/>') : '';
                log.debug("strSuccess", strSuccess);
                log.debug("strFailed", strFailed);
                let dateToday = format.format({ value: new Date(), type: format.Type.DATE });


                let user = runtime.getCurrentScript().getParameter({name: "custscript_sna_delete_inv_emailto"});
                let subject = 'Delete Status for Finance Charge Invoice: ' + dateToday;
                let body =  strSuccess + '<br/>' + strFailed;

                let emailObj = {author: user, recipients: user, subject: subject, body: body};

                log.debug("emailObj", emailObj);

                email.send(emailObj);


            }catch(e){
                log.debug("error in summary",e);

            }
        }

        return {getInputData, map, summarize}

    });
