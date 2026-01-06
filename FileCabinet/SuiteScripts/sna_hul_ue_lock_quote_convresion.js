/*
 * Copyright (c) 2022, ScaleNorth Advisors LLC and/or its affiliates. All rights reserved.
 *
 * @author aduldulao
 *
 * Script brief description:
 * Throw locked conversion error
 *
 * Revision History:
 *
 * Date              Issue/Case          Author          Issue Fix Summary
 * =============================================================================================
 * 2022/11/3       		                 aduldulao       Initial version.
 * 2023/1/30       		                 aduldulao       Remove Credit Limit and Claim Insurance Lock from Non Rental Estimate Order
 * 2023/2/10       		                 aduldulao       Move Certificate of Insurance
 *
 */

/**
 * @NApiVersion 2.1
 * @NScriptType UserEventScript
 */
define(['N/search', 'N/record', 'N/runtime'],
    /**
 * @param{search} search
 */
    (search, record, runtime) => {

        // UTILITY FUNCTIONS
        function isEmpty(stValue) {
            return ((stValue === '' || stValue == null || stValue == undefined) || (stValue.constructor === Array && stValue.length == 0) || (stValue.constructor === Object && (function(v) {
                for ( var k in v)
                    return false;
                return true;
            })(stValue)));
        }

        function forceFloat(stValue) {
            var flValue = parseFloat(stValue);
            if (isNaN(flValue) || (stValue == 'Infinity')) {
                return 0.00;
            }
            return flValue;
        }

        function forceInt(stValue){
            var intValue = parseInt(stValue, 10);
            if (isNaN(intValue) || (stValue == 'Infinity')) {
                return 0;
            }
            return intValue;
        }

        /**
         * Defines the function definition that is executed before record is submitted.
         * @param {Object} scriptContext
         * @param {Record} scriptContext.newRecord - New record
         * @param {Record} scriptContext.oldRecord - Old record
         * @param {string} scriptContext.type - Trigger type; use values from the context.UserEventType enum
         * @since 2015.2
         */
        const beforeSubmit = (scriptContext) => {
            var rec = scriptContext.newRecord;
            var recid = rec.id;
            var rectype = rec.type;

            if (scriptContext.type == scriptContext.UserEventType.CREATE) {
                var currscript = runtime.getCurrentScript();
                var rentalestform = currscript.getParameter('custscript_sna_rentalestform');

                var createdfrom = rec.getValue({fieldId: 'createdfrom'});

                if (!isEmpty(createdfrom)) {
                    var fldcreatefrom = search.lookupFields({type: 'transaction', id: createdfrom, columns: ['recordtype', 'customform']});
                    var createdfromtype = fldcreatefrom.recordtype;
                    var customform = !isEmpty(fldcreatefrom.customform) ? fldcreatefrom.customform[0].value: '';
                    log.debug({title: 'beforeSubmit - customform', details: customform});

                    if (createdfromtype == record.Type.ESTIMATE && customform == rentalestform) {
                        var estflds = search.lookupFields({type: record.Type.ESTIMATE, id: createdfrom,
                            columns: [
                                'custbody_sna_hul_custcredit_limit',
                                'custbody_sna_hul_waive_insurance',
                                'custbody_sna_hul_donotenforce',
                                'total',
                                'entity',
                                'trandate'
                            ]
                        });
                        log.debug({title: 'beforeSubmit - estflds', details: estflds});

                        var creditlimit = estflds.custbody_sna_hul_custcredit_limit;
                        var waive = estflds.custbody_sna_hul_waive_insurance;
                        var donotenforce = estflds.custbody_sna_hul_donotenforce;
                        var total = estflds.total;
                        var cust = estflds.entity[0].value;
                        var trandate = estflds.trandate;
                        var balance = 0;
                        var coi = '';
                        var coiexpiry = '';

                        if (!isEmpty(cust)) {
                            var custflds = search.lookupFields({type: 'customer', id: cust, columns: ['balance', 'custentity_sna_cert_of_insurance', 'custentity_sna_hul_date_of_exp_coi']});
                            balance = custflds.balance;
                            coi = !isEmpty(custflds.custentity_sna_cert_of_insurance) ? custflds.custentity_sna_cert_of_insurance[0].value : '';
                            coiexpiry = !isEmpty(custflds.custentity_sna_hul_date_of_exp_coi) ? new Date(custflds.custentity_sna_hul_date_of_exp_coi) : '';
                        }

                        var newbal = forceFloat(balance) + forceFloat(total);

                        log.debug({title: 'beforeSubmit', details: 'recid: ' + recid + ' | creditlimit: ' + creditlimit + ' | donotenforce: ' + donotenforce + ' | waive: ' + waive
                                + ' | coi: ' + coi + ' | coiexpiry: ' + coiexpiry + ' | trandate: ' + trandate + ' | total: ' + total + ' | balance: ' + balance + ' | newbal: ' + newbal});

                        // locked for Sales Order Conversion, unless all of the following conditions have been met:
                        // i. A file is attached on the Certificate of Insurance or Waive Insurance checkbox is marked
                        // ii. Quote Total Amount + Current Account Receivable is less than Credit Limit or Do not Enforce Credit Limit Checkbox is marked
                        if ((isEmpty(coi) || (!isEmpty(coiexpiry) && coiexpiry <= new Date(trandate))) && !waive) {
                            throw "Certificate of Insurance is not found or Expired. Check Customer record.";
                        }
                        if (newbal > creditlimit && !donotenforce) {
                            throw "Order is above Customer's Credit Limit";
                        }
                    }
                }
            }
        }

        return {beforeSubmit}

    });
