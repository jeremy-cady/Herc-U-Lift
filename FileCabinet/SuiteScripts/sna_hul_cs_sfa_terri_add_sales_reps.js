/**
 * @NApiVersion 2.1
 * @NScriptType ClientScript
 * @NModuleScope SameAccount
 */
/** Not In Use */
define(['N/search'], (search) => {

    const fieldChanged = (scriptContext) => {
        let currentRecord = scriptContext.currentRecord;
        let sublistId = scriptContext.sublistId;
        let fieldId = scriptContext.fieldId;
        if (sublistId == "item" && fieldId == "item") {
            let item = currentRecord.getCurrentSublistValue({sublistId, fieldId: "item"});
            currentRecord.setCurrentSublistValue({
                sublistId: "item",
                fieldId: "custcol_sna_sales_rep_list",
                value: getItemSalesReps(item).join(",")
            })
        }
    }

    const postSourcing = (scriptContext) => {
        let currentRecord = scriptContext.currentRecord;
        let sublistId = scriptContext.sublistId;
        let fieldId = scriptContext.fieldId;
        if (fieldId == "entity") {
            let customer = currentRecord.getValue({fieldId: "entity"});
            currentRecord.setValue({fieldId: "salesrep", value: getCustomerSalesRep(customer)});
        }
        // if (sublistId == "item" && fieldId == "item") {
        //     let item = currentRecord.getCurrentSublistValue({sublistId, fieldId: "item"});
        //     if (!!item)
        //         currentRecord.setValue({fieldId: "custcol_sna_sales_rep_list", value: getItemSalesReps(item).join(",")})
        // }
    }

    const getCustomerSalesRep = (customer) => {
        try {
            return search.lookupFields({
                type: search.Type.CUSTOMER, id: customer, columns: "salesrep"
            }).salesrep[0].value
        } catch (error) {
            console.error(error);
            return null;
        }
    }

    const getItemSalesReps = (item) => {
        let response = [];
        try {
            let salesTerritory = search.lookupFields({
                type: search.Type.ITEM,
                id: item,
                columns: "custitem_sna_sales_territory"
            }).custitem_sna_sales_territory[0].value;

            search.create({
                type: "customrecord_sna_sr_shell",
                filters: [{
                    name: "custrecord_sna_sfa_ter_sales_territory",
                    operator: "anyof",
                    values: salesTerritory,
                    join: "custrecord_sna_sr_shell_territory"
                }],
                columns: ["custrecord_sna_sr_shell_code", "custrecord_sna_sr_shell_sales_rep"]
            }).run().each(function (result) {
                response.push(result.getText({name: "custrecord_sna_sr_shell_sales_rep"}));
                return true;
            });

            console.log("getItemSalesReps", item, response);
        } catch (error) {
            console.error(error);
        }
        return response;
    }

    return {fieldChanged, postSourcing};

});
