/*
 * Copyright (c) 2022, ScaleNorth Advisors LLC and/or its affiliates. All rights reserved.
 *
 * @author aduldulao
 *
 * Script brief description:
 * UE script to update the NBV on the FAM Asset Values record
 *
 * Revision History:
 *
 * Date              Issue/Case          Author          Issue Fix Summary
 * =============================================================================================
 * 2022/5/11       		                 aduldulao       Initial version.
 *
 */

/**
 * @NApiVersion 2.1
 * @NScriptType UserEventScript
 */
define(['N/record', 'N/runtime', 'N/search'],
    /**
 * @param{record} record
 * @param{runtime} runtime
 * @param{search} search
 */
    (record, runtime, search) => {

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
                if (runtime.executionContext == runtime.ContextType.MAP_REDUCE && scriptContext.type == scriptContext.UserEventType.CREATE) {
                    var _rec = scriptContext.newRecord;
                    var _recid = _rec.id;

                    var rec = record.load({type: 'customrecord_fam_assetvalues', id: _recid, isDynamic: true});
                    var fa = rec.getValue({fieldId: 'custrecord_slaveparentasset'});

                    log.debug({title: 'afterSubmit', details: '_recid: ' + _recid + ' | _recid: ' + _recid + ' | fa: ' + fa});

                    if (!isEmpty(fa)) {
                        var fafld = search.lookupFields({type: 'customrecord_ncfar_asset', id: fa, columns: ['custrecord_assetcost']});
                        if (!isEmpty(fafld.custrecord_assetcost)) {
                            var nbv = fafld.custrecord_assetcost;

                            record.submitFields({type: 'customrecord_fam_assetvalues', id: _recid, values: {'custrecord_slavebookvalue': nbv}});
                            log.debug({title: 'afterSubmit', details: 'record updated: ' + _recid + ' | nbv: ' + nbv});
                        }
                    }
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

        return {afterSubmit}

    });
