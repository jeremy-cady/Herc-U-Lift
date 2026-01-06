/*
 * Copyright (c) 2024, ScaleNorth Advisors LLC and/or its affiliates. All rights reserved.
 *
 * @author aduldulao
 *
 * Script brief description:
 * User event script deployed to credit memo
 *
 * Revision History:
 *
 * Date              Issue/Case          Author          Issue Fix Summary
 * =============================================================================================
 * 2024/8/21       		                 aduldulao       Initial version.
 *
 */

/**
 * @NApiVersion 2.1
 * @NScriptType UserEventScript
 */
define(['N/record', 'N/runtime', 'N/search', 'N/format', './sn_hul_mod_reclasswipaccount.js', './moment.js'],
    /**
 * @param{record} record
 * @param{runtime} runtime
 * @param{search} search
 */
    (record, runtime, search, format , mod_reclasswip, moment) => {

        // UTILITY FUNCTIONS
        function isEmpty(stValue) {
            return ((stValue === '' || stValue == null || stValue == undefined) || (stValue.constructor === Array && stValue.length == 0) || (stValue.constructor === Object && (function(v) {
                for (var k in v)
                    return false;
                return true;
            })(stValue)));
        }

        function forceFloat(stValue) {
            var flValue = parseFloat(stValue);

            if (isNaN(flValue) || stValue === Infinity) {
                return 0.0;
            }

            return flValue;
        }

        /**
         * Defines the function definition that is executed after record is submitted.
         * @param {Object} scriptContext
         * @param {Record} scriptContext.newRecord - New record
         * @param {Record} scriptContext.oldRecord - Old record
         * @param {string} scriptContext.type - Trigger type; use values from the context.UserEventType enum
         * @since 2015.2
         */
        const afterSubmit = (scriptContext) => {
            try {
                if (scriptContext.type == scriptContext.UserEventType.DELETE) return;

                let rec = scriptContext.newRecord;
                let recid = rec.id;
                let rectype = rec.type;

                if (scriptContext.type === scriptContext.UserEventType.CREATE) {
                    let invcreatedfrom = rec.getValue({fieldId: 'createdfrom'});

                    if (!isEmpty(invcreatedfrom)) {
                        mod_reclasswip.reverseWIPAccount(rec, 'creditmemo');
                    }
                }

                // update rental qty
                if (scriptContext.type === scriptContext.UserEventType.CREATE || scriptContext.type === scriptContext.UserEventType.EDIT || scriptContext.type === scriptContext.UserEventType.COPY) {
                    updateRentalQty(rec);
                }
            }
            catch (e) {
                if (e.message != undefined) {
                    log.error('ERROR', e.name + ' ' + e.message);
                } else {
                    log.error('ERROR', 'Unexpected Error', e.toString());
                }
            }
        }

        const updateRentalQty = (rec) => {
            const stLoggerTitle = 'updateRentalQty';

            let currentScript = runtime.getCurrentScript();
            let rentalform = currentScript.getParameter({name:'custscript_sn_hul_sorentalform'});
            log.debug({title: stLoggerTitle, details: `rentalform: ${rentalform}`});

            let invoiceid = rec.getValue({fieldId: 'createdfrom'});
            log.debug({title: stLoggerTitle, details: `invoiceid: ${invoiceid}`});

            if (!isEmpty(invoiceid)) {
                let timeqty = '';
                let soLines = {};
                let so = '';

                let filters = [];
                filters.push(search.createFilter({name: 'internalid', operator: search.Operator.IS, values: invoiceid}));
                filters.push(search.createFilter({name: 'mainline', operator: search.Operator.IS, values: 'F'}));
                filters.push(search.createFilter({name: 'type', join: 'createdfrom', operator: search.Operator.ANYOF, values: ['SalesOrd']}));
                filters.push(search.createFilter({name: 'customform', join: 'createdfrom', operator: search.Operator.ANYOF, values: rentalform}));
                filters.push(search.createFilter({name: 'type', join: 'applyingtransaction', operator: search.Operator.ANYOF, values: ['CustCred']}));

                let columns = [];
                columns.push(search.createColumn({name: 'createdfrom'})); // SO
                columns.push(search.createColumn({name: 'startdate', join: 'appliedToTransaction'})); // SO start date
                columns.push(search.createColumn({name: 'enddate', join: 'appliedToTransaction'})); // SO end date
                columns.push(search.createColumn({name: 'quantity', join: 'appliedToTransaction'})); // SO quantity
                columns.push(search.createColumn({name: 'lineuniquekey', join: 'appliedToTransaction'})); // SO line key
                columns.push(search.createColumn({name: 'quantitybilled', join: 'appliedToTransaction'})); // SO quantity billed
                columns.push(search.createColumn({name: 'applyingtransaction'})); // CM
                columns.push(search.createColumn({name: 'quantity', join: 'applyingTransaction'})); // CM quantity

                let srch = search.create({type: search.Type.INVOICE, columns: columns, filters: filters});
                let searchResultCount = srch.runPaged().count;
                log.debug({title: stLoggerTitle, details: `searchResultCount: ${searchResultCount}`});

                srch.run().each(function(result) {
                    so = result.getValue({name: 'createdfrom'});
                    let sostartdate = result.getValue({name: 'startdate', join: 'appliedToTransaction'});
                    let soenddate = result.getValue({name: 'enddate', join: 'appliedToTransaction'});
                    let solinekey = result.getValue({name: 'lineuniquekey', join: 'appliedToTransaction'});
                    let sobilledqty = result.getValue({name: 'quantitybilled', join: 'appliedToTransaction'});
                    let cmqty = result.getValue({name: 'quantity', join: 'applyingTransaction'});

                    if (!isEmpty(sostartdate)) {
                        sostartdate = format.parse({value: new Date(sostartdate), type: format.Type.DATE})
                    }
                    if (!isEmpty(soenddate)) {
                        soenddate = format.parse({value: new Date(soenddate), type: format.Type.DATE});
                    }

                    log.debug({title: stLoggerTitle, details: `sostartdate: ${sostartdate} | soenddate: ${soenddate}`});

                    if (isEmpty(timeqty)) {
                        timeqty = workday_count(sostartdate, soenddate); // no need to get rental days because time unit is always Day
                    }

                    let newsoqty = (forceFloat(timeqty) - (forceFloat(sobilledqty) + forceFloat(cmqty))) + forceFloat(sobilledqty);

                    log.debug({title: stLoggerTitle, details: `so: ${so} | solinekey: ${solinekey} | timeqty: ${timeqty} | sobilledqty: ${sobilledqty} | cmqty: ${cmqty}`});
                    log.debug({title: stLoggerTitle, details: `newsoqty: ${newsoqty}`});

                    soLines[solinekey] = newsoqty;

                    return true;
                });

                if (!isEmpty(soLines) && !isEmpty(so)) {
                    let sorec = record.load({type: record.Type.SALES_ORDER, id: so, isDynamic: true});

                    for (sokey in soLines) {
                        let soline = sorec.findSublistLineWithValue({sublistId: 'item', fieldId: 'lineuniquekey', value: sokey});
                        log.debug({title: stLoggerTitle, details: `soline: ${soline} | newqty: ${soLines[sokey]}`});

                        if (soline != -1) {
                            sorec.selectLine({sublistId: 'item', line: soline});
                            sorec.setCurrentSublistValue({sublistId: 'item', fieldId: 'quantity', value: soLines[sokey]});
                            sorec.commitLine({sublistId: 'item'});
                        }
                    }

                    let sorecid = sorec.save({ignoreMandatoryFields: true});
                    log.debug({title: stLoggerTitle, details: `SO saved: ${sorecid}`});
                }
            }
        }

        function workday_count(start,end) {
            // Validate input
            if (end < start)
                return 0;
            if (isEmpty(end) || isEmpty(start))
                return 0;

            start = moment(start);
            end = moment(end);

            var first = start.clone().endOf('week'); // end of first week
            var last = end.clone().startOf('week'); // start of last week
            var days = last.diff(first,'days') * 5 / 7; // this will always multiply of 7
            var wfirst = first.day() - start.day(); // check first week
            if(start.day() == 0) --wfirst; // -1 if start with sunday
            var wlast = end.day() - last.day(); // check last week
            if(end.day() == 6) --wlast; // -1 if end with saturday
            return wfirst + Math.floor(days) + wlast; // get the total
        }

        return {afterSubmit}

    });