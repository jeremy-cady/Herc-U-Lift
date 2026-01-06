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
 * Deployment - Message
 * Add Recipient Email Addresses to Email based on Document Distribution
 *
 * Deployment - Transaction
 * Send Email/Fax, Print PDF of Transaction
 *
 * Revision History:
 *
 * Date            Issue/Case       Author              Issue Fix Summary
 * =============================================================================================
 * 2022/08/12                       Amol Jagkar         Initial version
 *
 */
define(['N/record', 'N/render', 'N/search', 'N/email'], (record, render, search, email) => {

    const DOCUMENT_DISTRIBUTION_RECIPIENT = "customrecord_sna_hul_doc_distribution";

    const DOCUMENT_TYPE = {
        "invoice": 7,
        "salesorder": 31,
        "creditmemo": 10,
        "estimate": 6,
        "opportunity": 37
    }

    const FOLDER = {TRANSACTION_PRINTS: 1830};

    const beforeLoad = (scriptContext) => {
        if (scriptContext.newRecord.type == record.Type.MESSAGE) {
            scriptContext.form.clientScriptFileId = getClientScriptFileId();
            scriptContext.form.addButton({
                id: 'custpage_sna_add_recipients',
                label: 'Add Recepients',
                functionName: `addRecipients()`
            });
        }
    }

    const afterSubmit = (scriptContext) => {
        if (scriptContext.type == scriptContext.UserEventType.CREATE) {
            let newRecord = scriptContext.newRecord;
            let customer = newRecord.getValue({fieldId: "entity"});
            let department = newRecord.getValue({fieldId: "department"});
            let holdInvoiceSending = newRecord.getValue({fieldId: "custbody_sna_hold_invoice_sending"});

            try {
                let docDistributionData = getDocDistributionData(customer, department, DOCUMENT_TYPE[newRecord.type]);

                docDistributionData.forEach(element => {
                    if (element.email.Check && !holdInvoiceSending) {
                        // aduldulao 6/5/23 - Do not send email if all lines are marked do not print
                        var hasprint = false;

                        var filters_ = [];
                        filters_.push(search.createFilter({name: 'internalid', operator: search.Operator.IS, values: scriptContext.newRecord.id}));
                        filters_.push(search.createFilter({name: 'custcol_sna_do_not_print', operator: search.Operator.IS, values: false}));
                        filters_.push(search.createFilter({name: 'custrecord_sna_hul_do_not_print', join: 'cseg_sna_revenue_st', operator: search.Operator.IS, values: false}));
                        filters_.push(search.createFilter({name: 'taxline', operator: search.Operator.IS, values: false}));
                        filters_.push(search.createFilter({name: 'shipping', operator: search.Operator.IS, values: false}));
                        filters_.push(search.createFilter({name: 'cogs', operator: search.Operator.IS, values: false}));
                        filters_.push(search.createFilter({name: 'item', operator: search.Operator.NONEOF, values: '@NONE@'}));

                        var recsearch_ = search.create({type: scriptContext.newRecord.type, filters: filters_});
                        var recser_ = recsearch_.run().getRange({start: 0, end: 1});
                        if (!isEmpty(recser_)) {
                            hasprint = true;
                        }

                        log.debug({title: "hasprint", details: hasprint});
                        if (hasprint) {
                            sendTransactionEmail(newRecord, element.email.Addresses, element.email.Employees, element.email.Template);
                        }
                    }
                    if (element.print) {
                        let transactionFile = render.transaction({
                            entityId: newRecord.id,
                            printMode: render.PrintMode.HTML,
                        });
                        transactionFile.folder = FOLDER.TRANSACTION_PRINTS;
                        transactionFile.name = `${newRecord.getValue({fieldId: "tranid"})}_${newRecord.getValue({fieldId: "entity"})}_${Date.now()}.pdf`;
                        let fileId = transactionFile.save();
                        log.debug({title: "Transaction Print File", details: fileId});
                    }
                    if (element.fax.Check) {
                        element.fax.Numbers.forEach(faxNumber => {
                            // Loop through each fax number and update it on Transaction
                            /*record.submitFields({
                                type: newRecord.type,
                                id: newRecord.id,
                                values: {tobefaxed: true, fax: faxNumber}
                            });*/

                            // Create Message Record
                            // Message(entity, transaction, defaultfax)
                        });
                    }
                });
            } catch (error) {
                log.error({title: "Error", details: error});
            }
        }
    }

    const sendTransactionEmail = (transaction, emailAddresses, employees, template) => {
        let senderId = -5;

        let mergeResult = render.mergeEmail({
            templateId: template,
            entity: {type: 'customer', id: Number(transaction.getValue({fieldId: "entity"}))},
            transactionId: transaction.id
        });

        let transactionFile = render.transaction({
            entityId: transaction.id,
            printMode: render.PrintMode.PDF,
            inCustLocale: true
        });

        log.debug({title: "Email Ids", details: {emailAddresses, employees}});

        let emailOptions = {
            author: senderId,
            recipients: emailAddresses,
            subject: mergeResult.subject,
            body: mergeResult.body,
            attachments: [transactionFile],
            relatedRecords: {
                entityId: Number(transaction.getValue({fieldId: "entity"})),
                transactionId: transaction.id
            }
        };

        if (!isEmpty(employees) && !!employees[0])
            emailOptions.cc = employees

        email.send(emailOptions);
    }

    const getDocDistributionData = (customer, department, transactionType) => {
        let response = [];
        let filters = [
            {name: "custrecord_doc_distribution_customer", operator: "anyof", values: customer},
            {name: "custrecord_doc_distribution_doc_type", operator: "anyof", values: transactionType},
            {name: "custrecord_doc_distribution_email_check", operator: "is", values: true}
        ];

        if (!!department) {
            filters.push({name: "custrecord_sna_doc_department", operator: "anyof", values: department});
        }

        search.create({
            type: DOCUMENT_DISTRIBUTION_RECIPIENT, filters,
            columns: [
                // Email Columns
                "custrecord_doc_distribution_email_check",
                "custrecord_doc_distribution_emailaddress",
                "custrecord_sna_employee_recipients",
                "custrecord_doc_distribution_mailtemplate",
                // Fax Columns
                "custrecord_doc_distribution_fax_check",
                "custrecord_doc_distribution_fax_numbers",
                // Print
                "custrecord_doc_distribution_print_check"
            ]
        }).run().each(function (result) {
            let email = {}, fax = {}, print = false;
            email["Check"] = result.getValue("custrecord_doc_distribution_email_check");
            if (email["Check"]) {
                try {
                    email["Addresses"] = result.getValue("custrecord_doc_distribution_emailaddress").split(",");
                    email["Employees"] = result.getValue("custrecord_sna_employee_recipients").split(",");
                    email["Template"] = result.getValue("custrecord_doc_distribution_mailtemplate");
                } catch (error) {
                    email["Check"] = false;
                }
            }
            fax["Check"] = result.getValue("custrecord_doc_distribution_fax_check");
            if (fax["Check"]) {
                try {
                    fax["Numbers"] = result.getValue("custrecord_doc_distribution_fax_numbers").split(",");
                } catch (error) {
                    fax["Check"] = false;
                }
            }
            if (!print)
                print = result.getValue("custrecord_doc_distribution_print_check");

            response.push({email, fax, print});
            return true;
        });
        return response;
    }

    const getClientScriptFileId = () => {
        return search.create({
            type: "file", filters: [{name: "name", operator: "is", values: "sna_hul_cs_document_distribution.js"}]
        }).run().getRange(0, 1000)[0].id;
    }

    function isEmpty(stValue) {
        return ((stValue === '' || stValue == null || stValue == undefined) || (stValue.constructor === Array && stValue.length == 0) || (stValue.constructor === Object && (function (v) {
            for (var k in v) return false;
            return true;
        })(stValue)));
    }

    return {beforeLoad, afterSubmit}

});
