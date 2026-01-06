/*
 * Copyright (c) 2023, ScaleNorth Advisors LLC and/or its affiliates. All rights reserved.
 *
 * @author aduldulao
 *
 * Script brief description:
 * UE script deployed to NextService Asset
 *
 * Revision History:
 *
 * Date              Issue/Case          Author          Issue Fix Summary
 * =============================================================================================
 * 2023/3/28       		                 aduldulao       Initial version.
 * 2023/4/28       		                 aduldulao       Additional conditions
 *
 */

/**
 * @NApiVersion 2.1
 * @NScriptType UserEventScript
 */
define(['N/record', 'N/redirect', 'N/search', 'N/url'],
    /**
 * @param{record} record
 * @param{redirect} redirect
 * @param{search} search
 * @param{url} url
 */
    (record, redirect, search, url) => {

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
            try {
                if (scriptContext.type == scriptContext.UserEventType.DELETE) return;

                var _rec = scriptContext.newRecord;
                var _recid = _rec.id;
                log.debug({title: 'afterSubmit', details: '_recid: ' + _recid});

                var casetitle = _rec.getValue({fieldId: 'custrecord_sna_related_case'});
                var nxcust = _rec.getValue({fieldId: 'custrecord_nx_asset_customer'});
                var frombtn = _rec.getValue({fieldId: 'custrecord_sna_hul_from_save_and_create'});
                log.debug({title: 'afterSubmit', details: 'casetitle: ' + casetitle + ' | nxcust: ' + nxcust + ' | frombtn: ' + frombtn});

                if (isEmpty(casetitle) || !frombtn) return;

                var caseid = '';

                // search related case
                var filters = [];
                filters.push(search.createFilter({name: 'custevent_nx_customer', operator: search.Operator.ANYOF, values: nxcust}));
                filters.push(search.createFilter({name: 'title', operator: search.Operator.HASKEYWORDS, values: casetitle}));
                //filters.push(search.createFilter({name: 'custevent_nx_case_asset', operator: search.Operator.ANYOF, values: '@NONE@'}));

                var srch = search.create({type: search.Type.SUPPORT_CASE, filters: filters});

                srch.run().each(function(result) {
                    caseid = result.id;

                    return false; // get 1st result
                });

                log.debug({title: 'afterSubmit', details: 'caseid: ' + caseid});

                if (!isEmpty(caseid)) {
                    redirect.toRecord({
                        type: record.Type.SUPPORT_CASE,
                        id: caseid,
                        isEditMode: true,
                        parameters: {
                            'custevent_nx_case_asset': _recid
                        }
                    });
                }
            }
            catch (e) {
                if (e.message != undefined) {
                    log.error('ERROR' , e.name + ' ' + e.message);
                } else {
                    log.error('ERROR', 'Unexpected Error' , e.toString());
                }
            }

        }

        return { afterSubmit}

    });