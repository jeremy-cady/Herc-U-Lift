/**
 * @NApiVersion 2.1
 * @NScriptType ClientScript
 * @NModuleScope SameAccount
 */
/**
 * Copyright (c) 2022, ScaleNorth Advisors LLC and/or its affiliates. All rights reserved.
 *
 * @author Amol Jagkar
 *
 * Script brief description:
 * This Client script updates Override checkbox on Sales Rep Matrix Customer Mapping record
 *
 *
 * Revision History:
 *
 * Date            Issue/Case           Author              Issue Fix Summary
 * =============================================================================================
 * 2022/10/26                           Amol Jagkar         Initial version
 *
 */
define(['N/url'],
    /**
     * @param{currentRecord} currentRecord
     */
    (url) => {
        const pageInit = (scriptContext) => {
            let currentRecord = scriptContext.currentRecord;
            let url = new URL(location.href);
            let editSalesRep = url.searchParams.get("editSalesRep");
            if (editSalesRep == "T") {
                currentRecord.setValue({
                    fieldId: "custrecord_salesrep_mapping_override",
                    value: true,
                    ignoreFieldChange: true
                });
            }
        }

        const fieldChanged = (scriptContext) => {
            let currentRecord = scriptContext.currentRecord;
            let fieldId = scriptContext.fieldId;
            if (fieldId == 'custrecord_salesrep_mapping_override') {
                let override = currentRecord.getValue({fieldId: "custrecord_salesrep_mapping_override"});
                if (override) {
                    let output = url.resolveRecord({
                        recordType: currentRecord.type,
                        recordId: currentRecord.id,
                        isEditMode: true,
                        params: {editSalesRep: "T"}
                    });
                    window.open(output, '_self');
                }
            }
        }

        return {pageInit, fieldChanged};

    });
