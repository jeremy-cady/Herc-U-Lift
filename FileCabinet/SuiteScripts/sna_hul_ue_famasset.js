/*
 * Copyright (c) 2023, ScaleNorth Advisors LLC and/or its affiliates. All rights reserved.
 *
 * @author aduldulao
 *
 * Script brief description:
 * UE script to copy Fleet Code from PO line {custcol_sna_po_fleet_code} = Fleet Code to Fixed Asset {custrecord_sna_hul_fleet_code}
 *
 * Revision History:
 *
 * Date              Issue/Case          Author          Issue Fix Summary
 * =============================================================================================
 * 2023/3/1       		                 aduldulao       Initial version.
 *
 */

/**
 * @NApiVersion 2.1
 * @NScriptType UserEventScript
 */
define(['N/record'],
    /**
 * @param{record} record
 */
    (record) => {

        // UTILITY FUNCTIONS
        function isEmpty(stValue) {
            return ((stValue === '' || stValue == null || stValue == undefined) || (stValue.constructor === Array && stValue.length == 0) || (stValue.constructor === Object && (function(v) {
                for ( var k in v)
                    return false;
                return true;
            })(stValue)));
        }

        function forceInt(stValue){
            var intValue = parseInt(stValue, 10);
            if (isNaN(intValue) || (stValue == 'Infinity')) {
                return 0;
            }
            return intValue;
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
                var _rectype = _rec.type;

                var po = _rec.getValue({fieldId: 'custrecord_assetpurchaseorder'});
                var bill = _rec.getValue({fieldId: 'custrecord_assetsourcetrn'});
                var billline = _rec.getValue({fieldId: 'custrecord_assetsourcetrnline'});
                log.debug({title: 'afterSubmit', details: 'FAM asset: ' + _recid + ' | po: ' + po + ' | bill: ' + bill + ' | billline: ' + billline});

                if (!isEmpty(po) && !isEmpty(bill)) {
                    var billrec = record.load({type: record.Type.VENDOR_BILL, id: bill, isDynamic: true});

                    var linenum = forceInt(billline) - 1;
                    if (isEmpty(linenum)) {
                        linenum = 1;
                    }

                    var fleetcode = billrec.getSublistValue({sublistId: 'item', fieldId: 'custcol_sna_po_fleet_code', line: linenum});
                    log.debug({title: 'afterSubmit', details: 'fleetcode: ' + fleetcode});

                    record.submitFields({type: 'customrecord_ncfar_asset', id: _recid, values: {custrecord_sna_hul_fleet_code: fleetcode}});
                    log.debug({title: 'afterSubmit', details: 'Fleet code updated: ' + _recid});
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
