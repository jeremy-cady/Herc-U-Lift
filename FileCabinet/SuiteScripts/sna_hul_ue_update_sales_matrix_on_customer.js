/**
 * @NApiVersion 2.1
 * @NScriptType UserEventScript
 */
/**
 * Copyright (c) 2022, ScaleNorth Advisors LLC and/or its affiliates. All rights reserved.
 *
 * @author Amol Jagkar
 *
 * Script brief description:
 * This User Event script deployed on Customer which does following tasks
 * 1) Before Load
 *    - Adds Resync button in Sales Rep Matrix Sublist which calls "SNA HUL MR Update Matix on Customer"
 *
 *
 *
 * Revision History:
 *
 * Date            Issue/Case           Author              Issue Fix Summary
 * =============================================================================================
 * 2022/10/26                           Amol Jagkar         Initial version
 *
 */
define(['N/url', 'N/redirect', 'N/search', 'N/record', './sna_hul_ue_sales_rep_matrix_config'], (url, redirect, search, record, library) => {

    const getSalesRepCustomerMatrixZipOnly = (customerId) => {
        let response = [];
        search.create({
            type: "customrecord_sna_salesrep_matrix_mapping",
            filters: [{name: "custrecord_salesrep_mapping_customer", operator: "anyof", values: customerId}],
            columns: [search.createColumn({name: "custrecord_salesrep_mapping_zipcode", summary: "GROUP"})]
        }).run().each(function (result) {
            response.push(result.getValue({name: "custrecord_salesrep_mapping_zipcode", summary: "GROUP"}));
            return true;
        });
        return response;
    }

const checkRemovalOfMatrix = (scriptContext) => {
    let newRecord = scriptContext.newRecord;
    let zipCodes = library.getCustomerZipCodes(newRecord.id);
    let customerMatrixArray = getSalesRepCustomerMatrixZipOnly(newRecord.id);
    let removeZipCodes = [];
    
    // Normalize customer zip codes to 5-char prefixes for US comparison
    let normalizedZipCodes = zipCodes.map(z => z ? z.substring(0, 5) : '');
    
    customerMatrixArray.forEach(element => {
        // Compare using 5-char prefix instead of exact match
        let elementPrefix = element ? element.substring(0, 5) : '';
        if (normalizedZipCodes.findIndex(e => e == elementPrefix) == -1)
            removeZipCodes.push(element);
    });

    log.debug({
        title: "beforeSubmit data",
        details: {
            zipCodes, customerMatrixArray, removeZipCodes, normalizedZipCodes
        }
    });

    removeZipCodes.forEach(element => {
        log.debug({
            title: "beforeSubmit calling MR",
            details: {
                custscript_sna_sales_rep_customer: newRecord.id,
                custscript_sna_sales_rep_zip_code: element,
                custscript_sna_sales_rep_inactivate: true,
            }
        });
        library.executeMR({
            custscript_sna_sales_rep_customer: newRecord.id,
            custscript_sna_sales_rep_zip_code: element,
            custscript_sna_sales_rep_inactivate: true,
        });
    });
}

    const beforeLoad = (scriptContext) => {
        let newRecord = scriptContext.newRecord;

        if (scriptContext.type == scriptContext.UserEventType.VIEW) {
            try {
                let output = url.resolveRecord({
                    recordType: 'customer',
                    recordId: newRecord.id,
                    params: {resync: "T"}
                });
                let reload = "window.open('" + output + "',\'_self\');"

                scriptContext.form.getSublist({id: 'recmachcustrecord_salesrep_mapping_customer'}).addButton({
                    id: 'custpage_sna_resync', label: 'Resync', functionName: reload
                });

                let params = scriptContext.request.parameters;
                if (params.hasOwnProperty("resync")) {
                    library.executeMR({
                        custscript_sna_sales_rep_customer: newRecord.id,
                        custscript_sna_sales_rep_add_upd_matrix: true
                    });

                    redirect.toRecord({type: record.Type.CUSTOMER, id: newRecord.id});
                }
            } catch (error) {
                log.error({title: "Error", details: error});
            }
        }
    }

    const afterSubmit = (scriptContext) => {
        let newRecord = scriptContext.newRecord;

        library.executeMR({
            custscript_sna_sales_rep_customer: newRecord.id,
            custscript_sna_sales_rep_add_upd_matrix: true
        });

        checkRemovalOfMatrix(scriptContext);
    }

    return {beforeLoad, afterSubmit}

});
