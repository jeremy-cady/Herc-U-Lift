/*
 * Copyright (c) 2022, ScaleNorth Advisors LLC and/or its affiliates. All rights reserved.
 *
 * @author aduldulao
 *
 * Script brief description:
 * UE script to set the Effective End Date
 *
 * Revision History:
 *
 * Date              Issue/Case          Author          Issue Fix Summary
 * =============================================================================================
 * 2022/8/25       		                 aduldulao       Initial version.
 *
 */

/**
 * @NApiVersion 2.1
 * @NScriptType UserEventScript
 */
define(['N/format', 'N/record', 'N/search'],
    /**
 * @param{format} format
 * @param{record} record
 * @param{search} search
 */
    (format, record, search) => {

        // UTILITY FUNCTIONS
        function isEmpty(stValue) {
            return ((stValue === '' || stValue == null || stValue == undefined) || (stValue.constructor === Array && stValue.length == 0) || (stValue.constructor === Object && (function(v) {
                for ( var k in v)
                    return false;
                return true;
            })(stValue)));
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
            if (scriptContext.type == scriptContext.UserEventType.DELETE) return;

            try {
                var _rec = scriptContext.newRecord;
                var recid = _rec.id;
                var ratecard = _rec.getValue({fieldId: 'custrecord_sna_hul_linked_rate_card'});
                var timeunit = _rec.getValue({fieldId: 'custrecord_sna_hul_rent_time_unit'});
                var effectivestart = _rec.getValue({fieldId: 'custrecord_sna_hul_effective_start_date'});
                log.debug({title: 'afterSubmit', details: 'current rental rate card sublist: ' + recid + ' | effectivestart: ' + effectivestart});

                if (isEmpty(timeunit)) return;

                var filters = [];
                filters.push(search.createFilter({name: 'custrecord_sna_hul_linked_rate_card', operator: search.Operator.IS, values: ratecard}));
                filters.push(search.createFilter({name: 'custrecord_sna_hul_rent_time_unit', operator: search.Operator.IS, values: timeunit}));
                filters.push(search.createFilter({name: 'internalidnumber', operator: search.Operator.LESSTHAN, values: recid}));
                var columns = [];
                columns.push(search.createColumn({name: 'internalid', sort: search.Sort.DESC})); // get most recent record
                columns.push(search.createColumn({name: 'custrecord_sna_hul_effective_start_date'}));

                var srch = search.create({type: 'customrecord_sna_hul_rate_card_sublist', filters: filters, columns: columns});

                srch.run().each(function(result) {
                    var ratecardsubid = result.id;

                    var dateminus = '';
                    if (!isEmpty(effectivestart)) {
                        dateminus = format.parse({value: new Date(effectivestart.setDate(effectivestart.getDate() - 1)), type: format.Type.DATE});

                        record.submitFields({type: 'customrecord_sna_hul_rate_card_sublist', id: ratecardsubid, values: {'custrecord_sna_hul_effective_end_date': dateminus}});
                        log.debug({title: 'afterSubmit', details: 'preceding rental rate card sublist updated: ' + ratecardsubid + ' | dateminus: ' + dateminus});
                    }

                    return false; // get first
                });
            }
            catch (e) {
                if (e.message != undefined) {
                    log.error('ERROR' , e.name + ' ' + e.message);
                } else {
                    log.error('ERROR', 'Unexpected Error' , e.toString());
                }
            }
        }

        return {afterSubmit}

    });
