/**
 * @NApiVersion 2.1
 * @NScriptType MapReduceScript
 */
/**
 * Copyright (c) 2022, ScaleNorth Advisors LLC and/or its affiliates. All rights reserved.
 *
 * @author Care Parba
 *
 * Script brief description:
 * This Map/Reduce script is used for Bulk Email Sending of Document Distribution
 *
 *
 * Revision History:
 *
 * Date            Issue/Case           Author              Issue Fix Summary
 * =============================================================================================
 * 2023/08/02      Case Task 97570      Care Parba          Initial version
 *
 */
define(['N/record', 'N/runtime', 'N/search', 'N/render', 'N/email'],
    /**
 * @param{record} record
 * @param{runtime} runtime
 * @param{search} search
 * @param{render} render
 * @param{email} email
 */
    (record, runtime, search, render, email) => {

        const DOCUMENT_DISTRIBUTION_RECIPIENT = "customrecord_sna_hul_doc_distribution";

        const DOCUMENT_TYPE = {
            "invoice": 7,
            "salesorder": 31,
            "creditmemo": 10,
            "estimate": 6,
            "opportunity": 37
        }

        const FOLDER = {TRANSACTION_PRINTS: 10792};

        const parseJSON = (data) => {
            if (typeof data == "string") data = JSON.parse(data);
            return data;
        }

        const getInputData = (inputContext) => {
             try {
                 const LOG_TITLE = "getInputData";
                 let stTransactionType = runtime.getCurrentScript().getParameter({name: "custscript_sna_transaction_type"});
                 let stSavedSearchId = runtime.getCurrentScript().getParameter({name: "custscript_sna_saved_search_id"});

                 log.debug({title: LOG_TITLE, details: "===========START==========="});
                 log.debug({
                     title: LOG_TITLE, details: {stTransactionType}
                 });
                 log.debug({
                     title: LOG_TITLE, details: {stSavedSearchId}
                 });

                if (!isEmpty(stSavedSearchId)) {
                     log.debug({title: LOG_TITLE, details: "===========END==========="});
                     return search.load({id: stSavedSearchId});
                 }
             } catch (error) {
               log.error("ERROR IN getInputData", error)
             }
        }

        const map = (mapContext) => {
             try {
                  const LOG_TITLE = "map";

                  log.debug({title: LOG_TITLE, details: "===========START==========="});

                  let objParseValues = parseJSON(mapContext.value);
                  log.debug({title: LOG_TITLE, details: `objParseValues: ${JSON.stringify(objParseValues)}`});

                  let stTransactionType = objParseValues.recordType;
                  log.debug({title: LOG_TITLE, details: `stTransactionType: ${stTransactionType}`});

                  let stKey = mapContext.key;
                  log.debug({title: LOG_TITLE, details: `stKey: ${stKey}`});

                  let objTransactionRecord = record.load({
                      type: stTransactionType,
                      id: stKey
                  })

                  let customer = objTransactionRecord.getValue({fieldId: "entity"});
                  let department = objTransactionRecord.getValue({fieldId: "department"});
                  let holdInvoiceSending = objTransactionRecord.getValue({fieldId: "custbody_sna_hold_invoice_sending"});

                  let docDistributionData = getDocDistributionData(customer, department, DOCUMENT_TYPE[stTransactionType]);

                  log.debug({title: LOG_TITLE, details: `docDistributionData: ${JSON.stringify(docDistributionData)}`});

                  docDistributionData.forEach(element => {
                      if (element.email.Check && !holdInvoiceSending) {
                          // aduldulao 6/5/23 - Do not send email if all lines are marked do not print
                          var hasprint = false;

                          var filters_ = [];
                          filters_.push(search.createFilter({name: 'internalid', operator: search.Operator.IS, values: stKey}));
                          filters_.push(search.createFilter({name: 'custcol_sna_do_not_print', operator: search.Operator.IS, values: false}));
                          filters_.push(search.createFilter({name: 'custrecord_sna_hul_do_not_print', join: 'cseg_sna_revenue_st', operator: search.Operator.IS, values: false}));
                          filters_.push(search.createFilter({name: 'taxline', operator: search.Operator.IS, values: false}));
                          filters_.push(search.createFilter({name: 'shipping', operator: search.Operator.IS, values: false}));
                          filters_.push(search.createFilter({name: 'cogs', operator: search.Operator.IS, values: false}));
                          filters_.push(search.createFilter({name: 'item', operator: search.Operator.NONEOF, values: '@NONE@'}));

                          var recsearch_ = search.create({type: stTransactionType, filters: filters_});
                          var recser_ = recsearch_.run().getRange({start: 0, end: 1});
                          if (!isEmpty(recser_)) {
                              hasprint = true;
                          }

                          log.debug({title: LOG_TITLE, details: `hasprint: ${hasprint}`});
                          if (hasprint) {
                              sendTransactionEmail(objTransactionRecord, element.email.Addresses, element.email.Employees, element.email.Template);
                              objTransactionRecord.setValue({ fieldId: 'custbody_sna_hul_doc_distributed', value: true});
                              objTransactionRecord.save();
                          }
                      }
                      if (element.print) {
                          let transactionFile = render.transaction({
                              entityId: stKey,
                              printMode: render.PrintMode.HTML,
                          });
                          transactionFile.folder = FOLDER.TRANSACTION_PRINTS;
                          transactionFile.name = `${objTransactionRecord.getValue({fieldId: "tranid"})}_${objTransactionRecord.getValue({fieldId: "entity"})}_${Date.now()}.pdf`;
                          let fileId = transactionFile.save();
                          log.debug({title: "Transaction Print File", details: fileId});
                     }
                 });

                 log.debug({title: LOG_TITLE, details: "===========END==========="});
             } catch (error) {
               log.error("ERROR in map", error);
             }
        }

        const sendTransactionEmail = (transaction, emailAddresses, employees, template) => {
            let senderId = runtime.getCurrentScript().getParameter({name: "custscript_sna_dd_author"}) || -5;

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

        const isEmpty = (stValue) => {
            return ((stValue === '' || stValue == null || stValue == undefined) || (stValue.constructor === Array && stValue.length == 0) || (stValue.constructor === Object && (function (v) {
                for (var k in v)
                    return false;
                return true;
            })(stValue)));
        }

        return {getInputData, map}

    });
