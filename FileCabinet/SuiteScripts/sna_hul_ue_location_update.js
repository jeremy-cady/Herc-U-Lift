/*
 * Copyright (c) 2023, ScaleNorth Advisors LLC and/or its affiliates. All rights reserved.
 *
 * @author caranda
 *
 * Script brief description:
 * Update Responsibility Center Code
 * If Location Type = WH, responsibility center custom field = HUL Code
 * If Location Type = Van, responsibility center custom field = HUL Code of Parent Location
 *
 * Revision History:
 *
 * Date			            Issue/Case		    Author			    Issue Fix Summary
 * =======================================================================================================
 * 2025/02/25						            cparba           	Added logic to display address in a custom body field in Location
 * 2023/02/28						            caranda           	Initial version
 *
 */
/**
 * @NApiVersion 2.1
 * @NScriptType UserEventScript
 */
define(['N/record', 'N/search'],
    /**
 * @param{record} record
 * @param{search} search
 */
    (record, search) => {


        /**
         * Defines the function definition that is executed before record is submitted.
         * @param {Object} scriptContext
         * @param {Record} scriptContext.newRecord - New record
         * @param {Record} scriptContext.oldRecord - Old record
         * @param {string} scriptContext.type - Trigger type; use values from the context.UserEventType enum
         * @since 2015.2
         */
        const afterSubmit = (scriptContext) => {
            var TITLE = 'afterSubmit';

            log.debug(TITLE, '*** START ***');

            if (scriptContext.type !== scriptContext.UserEventType.CREATE && scriptContext.type !== scriptContext.UserEventType.EDIT) {
                return;
            }
             var rec = scriptContext.newRecord;
            //var newRecord = scriptContext.newRecord;
            newRecord =record.load({
                type: rec.type,
                id: rec.id,
            })
            var hulLocType = newRecord.getValue({fieldId: 'custrecord_hul_loc_type'});
            log.debug(TITLE, 'hulLocType = ' + hulLocType);

            var resCenterCode;

            if(hulLocType == 1){
                //Central
                resCenterCode = newRecord.getValue({fieldId: 'custrecord_hul_code'});

            } else if(hulLocType == 2){
                //Van
                var parentLoc = newRecord.getValue({fieldId: 'parent'});
                log.debug(TITLE, 'parentLoc = ' + parentLoc);

                if(!isEmpty(parentLoc)){
                    var locSrch = search.lookupFields({
                        type: 'location',
                        id: parentLoc,
                        columns: ['custrecord_hul_code']
                    });

                    resCenterCode = locSrch.custrecord_hul_code;

                }
            }

            newRecord.setValue({fieldId: 'custrecord_sna_hul_res_cntr_code', value: resCenterCode});

            //Added logic to display address in a custom body field in Location - cparba
            var addressPdf = '';
            var subrec = newRecord.getSubrecord({ fieldId: 'mainaddress' });
            var addr1 = subrec.getValue({ fieldId: 'addr1' });
            var addr2 = subrec.getValue({ fieldId: 'addr2' });
            var addr3 = subrec.getValue({ fieldId: 'addr3' });
            var city = subrec.getValue({ fieldId: 'city' });
            var state = subrec.getValue({ fieldId: 'state' });
            var zip = subrec.getValue({ fieldId: 'zip' });
            var country = subrec.getText({ fieldId: 'country' });
            //insert getCountry
            //country=getCountry(country);
            if(!isEmpty(addr1)) { addressPdf += `${addr1} <br>`; }
            if(!isEmpty(addr2)) { addressPdf += `${addr2} <br>`; }
            if(!isEmpty(addr3)) { addressPdf += `${addr3} <br>`; }
            if(!isEmpty(city)) { addressPdf += `${city} `; }
            if(!isEmpty(state)) { addressPdf += `${state} `; }
            if(!isEmpty(zip)) { addressPdf += `${zip} `; }
            if(!isEmpty(country)) { addressPdf += `<br>${country}`; }

            newRecord.setValue({fieldId: 'custrecord_sna_hul_address_pdf', value: addressPdf});
            newRecord.save();
        }

        function isEmpty(stValue) {
            return ((stValue === '' || stValue == null || stValue == undefined) ||
                (stValue.constructor === Array && stValue.length == 0) ||
                (stValue.constructor === Object && (function(v) {
                    for (var k in v) return false;
                    return true;
                })(stValue)));
        }

        return {afterSubmit}

    });
