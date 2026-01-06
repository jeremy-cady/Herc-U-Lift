/**
 * @NApiVersion 2.1
 * @NScriptType UserEventScript
 */

/*
* Copyright (c) 2022, ScaleNorth Advisors LLC and/or its affiliates. All rights reserved.
*
* @author mdesilva
*
 * Script brief description:
   Userevent script created to:
   - set Van Bin Assgnment to Item Line.
*  - Item Receipt >  Update line items' Fleet No's (Object custom record) Status + Responsibility Center
*
*
* Revision History:
*
* Date              Issue/Case         Author         Issue Ficontext Summary
* =============================================================================================
* 2025/02/17                         cparba           Added logic to only set Object's Responsibility Center, if the Service Code Type IS NOT EQUAL to 6 (Object)
* 2024/02/08                         fang             Upon IR Save > Update line items' fleet no's (which is the related Object record) serial number
* 2023/12/19                         fang             Upon IR Save > Update line items' fleet no's (which is the related Object record) fleet code
* 2023/10/23                         fang             Case Task 97545 - Added IR specific API calls
* 2023/6/23                          mdesilva         Initial version
*
*/
define(['N/search', 'N/record'], function(search, record) {

    function beforeSubmit(context) {
        var currentRecord = context.newRecord;
        var newRec_obj = {};
        newRec_obj.rec_id = currentRecord.id;
        newRec_obj.rec_type = currentRecord.type;
        newRec_obj.access_type = context.type;
        var log_pre_ttle = 'beforeSubmit: ';
        log.debug(log_pre_ttle + 'Record details', newRec_obj);
        var oldRecz = context.oldRecord;


        // if (newRec_obj.rec_type =='itemreceipt') {
        //     var irLoc = currentRecord.getValue({
        //         fieldId: 'location'
        //     });
        //
        //     log.debug('irLoc', irLoc);
        // }

        var lineItemCount = currentRecord.getLineCount({
            sublistId: 'item'
        });

        for (var i = 0; i < lineItemCount; i++) {
            var item_id = currentRecord.getSublistValue({
                sublistId: 'item',
                fieldId: 'item',
                line: i
            });

            var item_loc = currentRecord.getSublistValue({
                sublistId: 'item',
                fieldId: 'location',
                line: i
            });

            //fang - Added this to get line item's fleet number and update respective Object custom record's Status, Location, Fleet Code
            if (newRec_obj.rec_type =='itemreceipt') {

                var item_receive = currentRecord.getSublistValue({
                    sublistId: 'item',
                    fieldId: 'itemreceive',
                    line: i
                });
                log.debug(log_pre_ttle + 'Record item_receive', item_receive);

                if (!item_receive) {continue;}
                var irLoc = currentRecord.getSublistValue({
                    sublistId: 'item',
                    fieldId: 'location',
                    line: i
                });

                log.debug('irLoc', irLoc);

                var fleetNo = currentRecord.getSublistValue({
                    sublistId: 'item',
                    fieldId: 'custcol_sna_hul_fleet_no',
                    line: i
                }); //Fleet No column = Object ID

                log.debug('fleetNo', fleetNo);

                if (!isEmpty(fleetNo)) {
                    updateObjStatus(fleetNo, irLoc, item_id);
                }

                //Update Related Object's Fleet Code
                var fleetCode = currentRecord.getSublistValue({
                    sublistId: 'item',
                    fieldId: 'custcol_sna_po_fleet_code',
                    line: i
                }); //Fleet Code column

                log.debug('fleetCode', fleetCode);

                if (!isEmpty(fleetCode)) {
                    var updatedObjRecId =  record.submitFields({
                        type: 'customrecord_sna_objects',
                        id: fleetNo,
                        values: {
                            'custrecord_sna_fleet_code': fleetCode
                        }
                    });

                    log.debug('Updated related Object > Fleet Code - updatedObjRecId', updatedObjRecId);
                }

                //Update Related Object's Serial Number
                var serialNum = currentRecord.getSublistValue({
                    sublistId: 'item',
                    fieldId: 'custcol_sna_hul_eq_serial',
                    line: i
                }); //Equipment Serial column

                if (!isEmpty(serialNum)) {
                    var updatedObjRecId =  record.submitFields({
                        type: 'customrecord_sna_objects',
                        id: fleetNo,
                        values: {
                            'custrecord_sna_serial_no': serialNum
                        }
                    });

                    log.debug('Updated related Object > Serial Number - updatedObjRecId', updatedObjRecId);
                }
            }

            if (!isEmpty(item_loc)) {
                var van_bin = getBin(item_id, item_loc);

                currentRecord.setSublistValue({
                    sublistId: 'item',
                    fieldId: 'custcol_sna_van_bin',
                    line: i,
                    value: van_bin
                });
            }
        }

    }


    function getBin(item_id, item_loc) {
        var log_pre_ttle = 'getBin';
        var customrecord_sna_van_bin_assignmentSearchObj = search.create({
            type: "customrecord_sna_van_bin_assignment",
            filters: [
                ["custrecord_sna_vba_item", "anyof", item_id],
                "AND",
                ["custrecord_sna_vba_loc", "anyof", item_loc]
            ],
            columns: [
                search.createColumn({
                    name: "name",
                    join: "CUSTRECORD_SNA_VBA_BIN"
                })
            ]
        });
        var bin_text;
        var searchResultCount = customrecord_sna_van_bin_assignmentSearchObj.runPaged().count;
        if (!isEmpty(searchResultCount)) {

            customrecord_sna_van_bin_assignmentSearchObj.run().each(function(result) {
                // .run().each has a limit of 4,000 results
                bin_text = result.getValue({
                    name: 'name',
                    join: "CUSTRECORD_SNA_VBA_BIN"
                })

                return true;
            });

            log.debug(log_pre_ttle, 'bin_text: ' + bin_text);
            return bin_text;
        }
        else{
            return '';
        }
    }

    //cparba - added logic to only set Object's Responsibility Center (custrecord_sna_responsibility_center) if the Inventory Posting Group (custitem_sna_inv_posting_grp)
    //cparba - IS NOT EQUAL to 1 (PARTS)
    //fang - added this to update Object's status if there is an existing Sales Order Fleet No. Column tagged with the Object.
    function updateObjStatus(objId, irLoc, item_id){
        var LOG_TITLE = 'updateObjStatus fxn';
        log.debug(LOG_TITLE, 'Start');

        var soFleetSearch = search.create({
            type: 'salesorder',
            filters: [
                ["custcol_sna_hul_fleet_no","anyof", objId]
            ],
            columns:  [
                search.createColumn({
                    name: "internalid",
                    label: "Internal ID"
                })
            ]
        });

        var soFleetSearchCount = soFleetSearch.runPaged().count;
        log.debug("soFleetSearchCount",soFleetSearchCount);

        var stItemLookup = search.lookupFields({
            type: "item",
            id: item_id,
            columns: [ "custitem_sna_item_service_code_type" ]
        });
        log.debug("stItemLookup",stItemLookup);

        var stServiceCodeType = (!isEmpty(stItemLookup.custitem_sna_item_service_code_type) ? Number(stItemLookup.custitem_sna_item_service_code_type[0].value) : 0);
        log.debug("stServiceCodeType",stServiceCodeType);

        var objectValues = {};

        if(stServiceCodeType === 6){ //If Service Code Type IS EQUAL 6 (OBJECT)
            objectValues["custrecord_sna_responsibility_center"] = irLoc;
        }

        if (soFleetSearchCount > 0) {
            objectValues["custrecord_sna_status"] = 11;
            log.debug("objectValues",objectValues);

            var updatedObjRecId =  record.submitFields({
                type: 'customrecord_sna_objects',
                id: objId,
                values: objectValues
                /*{
                    'custrecord_sna_status': 11,
                    'custrecord_sna_responsibility_center': irLoc
                }*/
            });
        } else {
            objectValues["custrecord_sna_status"] = 10;
            log.debug("objectValues",objectValues);

            var updatedObjRecId = record.submitFields({
                type: 'customrecord_sna_objects',
                id: objId,
                values: objectValues
                /*{
                    'custrecord_sna_status': 10,
                    'custrecord_sna_responsibility_center': irLoc
                }*/
            });
        }

        log.debug('updatedObjRecId', updatedObjRecId);
    }


    function isEmpty(stValue) {
        return ((stValue == 0 || stValue === '' || stValue == null || stValue == undefined) || (stValue.constructor === Array && stValue.length == 0) || (stValue.constructor === Object && (function(v) {
            for (var k in v)
                return false;
            return true;
        })(stValue)));
    }

    return {
        beforeSubmit: beforeSubmit

    }
});