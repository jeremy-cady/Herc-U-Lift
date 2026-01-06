/**
 * @NApiVersion 2.1
 * @NScriptType ClientScript
 * @NModuleScope SameAccount
 */
define(['N/search'],
    /**
     * @param{search} search
     */
    (search) => {

        /**
         * Pull Total Invoice Paid per Employee.
         *
         * @param {Number} salesRep
         */
        const getTotalInvoicePaid = (salesRep) => {
            let amount = {};
            search.create({
                type: search.Type.TRANSACTION,
                filters: [
                    {name: "type", operator: "anyof", values: "CustInvc"},
                    {name: "status", operator: "anyof", values: ["CustInvc:B", "CustInvc:A"]},
                    {name: "custentity_sna_hul_csm", join: "customerMain", operator: "anyof", values: salesRep}
                ],
                columns: [
                    search.createColumn({
                        name: "amountpaid", summary: "SUM", label: "Amount Paid"
                    }),
                    search.createColumn({
                        name: "custentity_sna_hul_csm",
                        join: "customerMain",
                        summary: "GROUP",
                        label: "Customer Success Manager"
                    })
                ]
            }).run().each(function (result) {
                amount = result.getValue({name: "amountpaid", summary: "SUM"});
                return true;
            });
            return amount;
        }

        const getTotalRevenueGenerated = () => {
            let totalRevenue = 0;
            search.create({
                type: search.Type.TRANSACTION,
                filters: [
                    // ["formulanumeric: case when {customermain.custentity_sna_hul_csm} != {custcol_sna_sales_rep} then 1 else 0 end", "equalto", "1"]
                    {
                        name: "formulanumeric",
                        formula: "case when {customermain.custentity_sna_hul_csm} != {custcol_sna_sales_rep} then 1 else 0 end",
                        operator: "equalto",
                        values: "1"
                    }
                ],
                columns: [
                    search.createColumn({
                        name: "formulanumeric",
                        summary: "SUM",
                        formula: "{amountpaid}",
                        label: "Formula (Numeric)"
                    })
                ]
            }).run().each(function (result) {
                totalRevenue = Number(result.getValue({
                    name: "formulanumeric", summary: "SUM", formula: "{amountpaid}"
                }));
                return true;
            });
            return totalRevenue;
        }

        const getDirectEstimate = () => {
            let directEstimate = 0;
            search.create({
                type: search.Type.TRANSACTION,
                filters: [
                    {name: "type", operator: "anyof", values: "CustInvc"},
                    {name: "status", operator: "anyof", values: ["CustInvc:A", "CustInvc:B"]},
                    {name: "custbody_sna_hul_override_salesrep_csm", operator: "noneof", values: "@NONE@"}
                ],
                columns: [
                    search.createColumn({name: "amountpaid", summary: "SUM", label: "Amount Paid"})
                ]
            }).run().each(function (result) {
                directEstimate = Number(result.getValue({name: "amountpaid", summary: "SUM"}));
                return true;
            });

            return directEstimate;
        }

        const getReferenceTable = (currentRecord) => {
            let response = [];

            for (let index = 1; index <= 7; index++) {
                response.push({
                    perRevenueRenewed: currentRecord.getValue({fieldId: "custrecord_sna_hul_percent_rev_renewed_" + index}),
                    perPayoutVARSS: currentRecord.getValue({fieldId: "custrecord_sna_hul_percent_payout_" + index}),
                    revenueGenerated: currentRecord.getValue({fieldId: "custrecord_sna_hul_percent_rev_gen_" + index}),
                    perPayoutVESS: currentRecord.getValue({fieldId: "custrecord_sna_hul_percent_payout_vess_" + index}),
                });
            }

            return response;
        }

        const calculateCommission = (currentRecord, totalInvoicesPaid) => {
            let referenceTable = getReferenceTable(currentRecord), referenceTableData;

            console.log({referenceTable});

            let priorYearRetention = currentRecord.getValue({fieldId: "custrecord_sna_hul_py_total_ret_revenue"});
            let basePay = currentRecord.getValue({fieldId: "custrecord_sna_hul_base_pay"});

            // % Revenue Renewed = (Total Invoices Paid – Prior Year Total Retention Revenue)/ Prior Year Total Retention Revenue
            let percentRevenueRenewed = (totalInvoicesPaid - priorYearRetention) / priorYearRetention;
            currentRecord.setValue({fieldId: "custrecord_per_rev_renew", value: percentRevenueRenewed});

            referenceTableData = referenceTable.find(element => element.perRevenueRenewed <= percentRevenueRenewed) || referenceTable[6];
            currentRecord.setValue({
                fieldId: "custrecord_var_ret_scale_payout",
                value: referenceTableData.perPayoutVARSS
            });

            // $ Payout (VARSS) = Base Pay * % Payout (VARSS)
            let payoutVARSS = (basePay * referenceTableData.perPayoutVARSS) / 100;
            currentRecord.setValue({fieldId: "custrecord_sna_hul_amount_payout", value: payoutVARSS});

            console.log({priorYearRetention, basePay, percentRevenueRenewed, payoutVARSS});

            // Excess Retention Quota = Prior Year Total Retention Revenue – Total Invoices Paid
            let excessRetention = priorYearRetention - totalInvoicesPaid;
            currentRecord.setValue({fieldId: "custrecord_sna_hul_excess_ret_quota", value: excessRetention});

            // Total Revenue Generated
            let totalRevenue = getTotalRevenueGenerated();
            currentRecord.setValue({fieldId: "custrecord_sna_hul_total_revenue_gen", value: totalRevenue});

            // Direct Estimate Sales
            let directEstimate = getDirectEstimate();
            currentRecord.setValue({fieldId: "custrecord_sna_hul_direct_est_sales", value: directEstimate});

            // $ Revenue Eligible for Commission = Excess Retention Quota + Total Revenue Generated + Direct Estimate Sales
            let revenueEligible = excessRetention + totalRevenue + directEstimate;
            currentRecord.setValue({fieldId: "custrecord_sna_hul_amount_rev_commission", value: revenueEligible});

            if (revenueEligible >= 750000)
                referenceTableData = referenceTable[0];
            else
                referenceTableData = referenceTable.find(element => element.revenueGenerated <= revenueEligible) || referenceTable[7];

            currentRecord.setValue({
                fieldId: "custrecord_sna_hul_percent_payout_vess", value: referenceTableData.perPayoutVESS
            });

            // $ Payout (VESS) = $ Revenue Eligible for Commission * % Payout (VESS)
            let payoutVESS = (revenueEligible * referenceTableData.perPayoutVESS) / 100;
            currentRecord.setValue({fieldId: "custrecord_sna_hul_percent_payout_ness", value: payoutVESS});

            console.log({excessRetention, totalRevenue, directEstimate, revenueEligible, payoutVESS});
        }

        /**
         * Function to be executed after page is initialized.
         *
         * @param {Object} scriptContext
         * @param {Record} scriptContext.currentRecord - Current form record
         * @param {string} scriptContext.mode - The mode in which the record is being accessed (create, copy, or edit)
         *
         * @since 2015.2
         */
        const pageInit = (scriptContext) => {

        }

        /**
         * Function to be executed when field is changed.
         *
         * @param {Object} scriptContext
         * @param {Record} scriptContext.currentRecord - Current form record
         * @param {string} scriptContext.sublistId - Sublist name
         * @param {string} scriptContext.fieldId - Field name
         * @param {number} scriptContext.lineNum - Line number. Will be undefined if not a sublist or matrix field
         * @param {number} scriptContext.columnNum - Line number. Will be undefined if not a matrix field
         *
         * @since 2015.2
         */
        const fieldChanged = (scriptContext) => {
            let currentRecord = scriptContext.currentRecord;
            let fieldId = scriptContext.fieldId;
            if (fieldId == "custrecord_sna_hul_sales_rep") {
                let salesRep = currentRecord.getValue({fieldId: "custrecord_sna_hul_sales_rep"});
                let totalInvoicesPaid = getTotalInvoicePaid(salesRep);
                currentRecord.setValue({
                    fieldId: "custrecord_sna_hul_total_invoices_paid", value: totalInvoicesPaid
                });

                let basePay = currentRecord.getValue({fieldId: "custrecord_sna_hul_base_pay"});
                let priorYearRetention = currentRecord.getValue({fieldId: "custrecord_sna_hul_py_total_ret_revenue"});

                console.log({
                    basePay, totalInvoicesPaid, priorYearRetention,
                    flag: !isEmpty(basePay) && !isEmpty(totalInvoicesPaid) && !isEmpty(priorYearRetention)
                });

                if (!isEmpty(basePay) && !isEmpty(totalInvoicesPaid) && !isEmpty(priorYearRetention)) {
                    calculateCommission(currentRecord, totalInvoicesPaid);
                }
            }

            if (fieldId == "custrecord_sna_hul_base_pay" || fieldId == "custrecord_sna_hul_py_total_ret_revenue") {
                let basePay = currentRecord.getValue({fieldId: "custrecord_sna_hul_base_pay"});
                let priorYearRetention = currentRecord.getValue({fieldId: "custrecord_sna_hul_py_total_ret_revenue"});
                let totalInvoicesPaid = currentRecord.getValue({fieldId: "custrecord_sna_hul_total_invoices_paid"});

                console.log({
                    basePay, totalInvoicesPaid, priorYearRetention,
                    flag: !isEmpty(basePay) && !isEmpty(totalInvoicesPaid) && !isEmpty(priorYearRetention)
                });

                if (!isEmpty(basePay) && !isEmpty(totalInvoicesPaid) && !isEmpty(priorYearRetention)) {
                    calculateCommission(currentRecord, totalInvoicesPaid);
                }
            }

        }

        function isEmpty(stValue) {
            return ((stValue === '' || stValue == null || stValue == undefined) || (stValue.constructor === Array && stValue.length == 0) || (stValue.constructor === Object && (function (v) {
                for (var k in v)
                    return false;
                return true;
            })(stValue)));
        }


        return {pageInit, fieldChanged,};

    });
