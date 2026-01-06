/**
 * @NApiVersion 2.1
 * @NScriptType ClientScript
 * @NModuleScope SameAccount
 */
/**
 * Copyright (c) 2024, ScaleNorth Advisors LLC and/or its affiliates. All rights reserved.
 *
 * @author Vishal Pitale
 *
 * Script brief description:
 * This Client script is deployed on PM Rate and is used to populate Equipment Type when Object Number is selected.
 *
 * Revision History:
 *
 * Date            Issue/Case           Author              Issue Fix Summary
 * =============================================================================================
 * 2024/01/17                        Vishal Pitale          Initial version
 *
 */
define(['N/record', 'N/runtime', 'N/search'],
    /**
     * @param{record} record
     * @param{runtime} runtime
     * @param{search} search
     */
    (record, runtime, search) => {

        const fieldChanged = (scriptContext) => {
            let currentRecord = scriptContext.currentRecord;

            try {
                let objectNum = currentRecord.getValue({ fieldId: 'custrecord_sna_hul_pmpriceobjectnum' });
                if(!isEmpty(objectNum)) {
                    let objLookup = search.lookupFields({ type: 'customrecord_sna_objects', id: objectNum, columns: 'cseg_sna_hul_eq_seg' });

                    if(!isEmpty(objLookup)) {
                        let objectId = objLookup.cseg_sna_hul_eq_seg[0];
                        if(!isEmpty(objectId)) {
                            objectId = objectId.value;
                            let equipCat = getEquipmentCategory();
                            let obj = equipCat.find(e => e.id == objectId);
                            console.log('obj', obj);
                            console.log('obj.top', obj.top);
                            currentRecord.setValue({ fieldId: 'custrecord_sna_hul_pmpriceequiptype', value: obj.top, ignoreFieldChange: true });
                        } else {
                            currentRecord.setValue({ fieldId: 'custrecord_sna_hul_pmpriceequiptype', value: '', ignoreFieldChange: true });
                        }
                    }
                    else {
                        currentRecord.setValue({ fieldId: 'custrecord_sna_hul_pmpriceequiptype', value: '', ignoreFieldChange: true });
                    }
                }
            } catch(e) { log.error('Error', e); }
        }

        const getEquipmentCategory = () => {
            let response = [];

            search.create({
                type: "customrecord_cseg_sna_hul_eq_seg",
                filters: [["isinactive", "is", "F"]],
                columns: [
                    search.createColumn({name: "name", label: "Name"}),
                    search.createColumn({name: "parent", label: "Parent"})
                ]
            }).run().each(function (result) {
                response.push({
                    id: result.id, name: result.getValue("name"), parent: result.getValue("parent")
                });
                return true;
            });

            for (let i = 0; i < response.length; i++) {
                let element = response[i];
                if (!!element.parent) {
                    let flag = true;
                    do {
                        let obj = response.find(e => e.id == element.parent);
                        if (!!obj.parent) {
                            element.parent = obj.parent;
                        } else {
                            response[i].top = obj.id;
                            flag = false;
                        }
                    } while (flag)
                }
            }
            return response;
        }

        function isEmpty(stValue) {
            return ((stValue === '' || stValue == null || stValue == undefined) || (stValue.constructor === Array && stValue.length == 0) || (stValue.constructor === Object && (function (v) {
                for (var k in v)
                    return false;
                return true;
            })(stValue)));
        }

        return {fieldChanged}
    });