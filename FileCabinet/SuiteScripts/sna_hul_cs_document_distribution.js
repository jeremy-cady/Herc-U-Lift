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
 * Deployment - Document Distribution
 * This Client script fetches the Email Address from Contacts selected for Document Distribution
 *
 * Deployment - Message
 * Add Recipient Email Addresses to Email based on Document Distribution
 *
 * Revision History:
 *
 * Date            Issue/Case       Author              Issue Fix Summary
 * =============================================================================================
 * 2022/08/11                       Amol Jagkar         Initial version
 * 2023/01/30                       Amol Jagkar         Removed Fax Number validation
 *
 */
define(['N/currentRecord', 'N/record', 'N/search'], (currentRecordObj, record, search) => {

    var isPerson = false;

    const DOCUMENT_DISTRIBUTION_RECIPIENT = "customrecord_sna_hul_doc_distribution";

    const DOCUMENT_TYPE = {
        "Invoice": 7,
        "Sales Order": 31
    }

    const pageInitMessage = (currentRecord) => {
        let transaction = currentRecord.getValue({fieldId: "transaction"});
        let customer = currentRecord.getValue({fieldId: "entity"});
        let transactionType = DOCUMENT_TYPE[getTransactionType(transaction)];
        let contacts = getDocDistributionContacts(customer, transactionType);
        console.log({contacts})
        for (let index = 0; index < contacts.length; index++) {
            currentRecord.selectNewLine({sublistId: "otherrecipientslist"});
            currentRecord.setCurrentSublistValue({
                sublistId: "otherrecipientslist",
                fieldId: "otherrecipient",
                value: contacts[index]
            });
            currentRecord.commitLine({sublistId: "otherrecipientslist"});
            console.log(contacts[index]);
        }
    }

    const pageInitDocumentDistribution = (currentRecord) => {
        let customer = currentRecord.getValue({fieldId: "custrecord_doc_distribution_customer"});
        isPerson = checkPerson(customer);
        if (!isPerson) {
            let contacts = getContacts(customer);
            currentRecord.setValue({fieldId: "custrecord_doc_distribution_contact", value: contacts});
            currentRecord.setValue({fieldId: "custpage_sna_doc_distri_contact", value: contacts});
        }
    }

    const removeContactsFromCustomField = (currentRecord) => {
        let currRec = currentRecordObj.get();
        let contactCustomField = currRec.getField({fieldId: "custpage_sna_doc_distri_contact"});
        let options = contactCustomField.getSelectOptions({
            filter: '',
            operator: 'startswith'
        });
        console.log({options})
    }

    const hideAndReplaceContacts = () => {
        let customContactField = document.getElementById("custpage_sna_doc_distri_contact_fs_lbl_uir_label").parentNode;
        let contactDiv = document.getElementById("custrecord_doc_distribution_contact_fs_lbl_uir_label").parentNode;
        contactDiv.appendChild(customContactField);

        document.getElementById("custrecord_doc_distribution_contact_fs").parentNode.style["display"] = "none";
        document.getElementById("custrecord_doc_distribution_contact_fs_lbl_uir_label").style["display"] = "none";
    }

    const insertContactOptions = (customer) => {
        let currRec = currentRecordObj.get();
        let contactCustomField = currRec.getField({fieldId: "custpage_sna_doc_distri_contact"});
        isPerson = checkPerson(customer);
        if (!isPerson) {
            let contacts = getContactsSelectOptions(customer);
            contacts.forEach(element => {
                contactCustomField.insertSelectOption({
                    value: element.value, text: element.text
                });
            });

            let selectedContacts = currRec.getValue({fieldId: "custrecord_doc_distribution_contact"});
            console.log({selectedContacts});
            // contactCustomField.defaultValue = selectedContacts;
            currRec.setValue({fieldId: "custpage_sna_doc_distri_contact", value: selectedContacts});
        }
    };

    const pageInit = (scriptContext) => {
        let currentRecord = scriptContext.currentRecord;
        console.log({cType: currentRecord.type, type: record.Type.MESSAGE})
        if (currentRecord.type == record.Type.MESSAGE)
            pageInitMessage(currentRecord);

        let customer = currentRecord.getValue({fieldId: "custrecord_doc_distribution_customer"});
        if (currentRecord.type == DOCUMENT_DISTRIBUTION_RECIPIENT && !!customer) {
            // removeContactsFromCustomField(currentRecord);
            insertContactOptions(customer);
            hideAndReplaceContacts();
        }

        setTimeout(function () {
            if (currentRecord.type == DOCUMENT_DISTRIBUTION_RECIPIENT && scriptContext.mode == "create")
                pageInitDocumentDistribution(currentRecord);
        }, 500);
    }

    const fieldChanged = (scriptContext) => {
        let currentRecord = scriptContext.currentRecord;
        let fieldId = scriptContext.fieldId;
        if (currentRecord.type == DOCUMENT_DISTRIBUTION_RECIPIENT) {
            if (fieldId == "custrecord_doc_distribution_customer") {
                let customer = currentRecord.getValue({fieldId: "custrecord_doc_distribution_customer"});
                isPerson = checkPerson(customer);
                if (!isPerson) {
                    let contacts = getContacts(customer);
                    currentRecord.setValue({fieldId: "custrecord_doc_distribution_contact", value: contacts});
                }
            }
            if (fieldId == "custrecord_doc_distribution_contact" && !isPerson) {
                let contacts = currentRecord.getValue({fieldId: "custrecord_doc_distribution_contact"});
                if (!isEmpty(contacts) && !!contacts[0]) {
                    let contactData = getContactDetails(contacts);
                    if (contactData.emails.length == 0)
                        alert("No Email Ids found for specified Contacts!");
                    else
                        currentRecord.setValue({
                            fieldId: "custrecord_doc_distribution_emailaddress", value: contactData.emails.join(",")
                        });
                    // if (contactData.faxNumbers.length == 0)
                    //     alert("No Fax Numbers found for specified Contacts!");
                    // else
                    //     currentRecord.setValue({
                    //         fieldId: "custrecord_doc_distribution_fax_numbers", value: contactData.faxNumbers.join(",")
                    //     });
                }
            }
            if (fieldId == "custpage_sna_doc_distri_contact") {
                let contacts = currentRecord.getValue({fieldId: "custpage_sna_doc_distri_contact"});
                currentRecord.setValue({fieldId: "custrecord_doc_distribution_contact", value: contacts});
            }
        }
    }

    const postSourcing = (scriptContext) => {
        let currentRecord = scriptContext.currentRecord;
        let fieldId = scriptContext.fieldId;
        if (currentRecord.type == DOCUMENT_DISTRIBUTION_RECIPIENT) {
            if (fieldId == "custrecord_doc_distribution_customer") {
                let customer = currentRecord.getValue({fieldId: "custrecord_doc_distribution_customer"});
                isPerson = checkPerson(customer);
                if (!isPerson) {
                    let contacts = getContacts(customer);
                    currentRecord.setValue({fieldId: "custrecord_doc_distribution_contact", value: contacts});
                }
            }
        }
    }

    const addRecipients = () => {
        let currentRecord = currentRecordObj.get();
        let transaction = currentRecord.getValue({fieldId: "transaction"});
        let customer = currentRecord.getValue({fieldId: "entity"});
        let transactionType = DOCUMENT_TYPE[getTransactionType(transaction)];
        let distributionContacts = getDocDistributionContacts(customer, transactionType);
        for (let index = 0; index < distributionContacts.contacts.length; index++) {
            if (!!distributionContacts.contacts[index]) {
                currentRecord.selectNewLine({sublistId: "otherrecipientslist", line: index});
                currentRecord.setCurrentSublistValue({
                    sublistId: "otherrecipientslist",
                    fieldId: "email",
                    value: distributionContacts.contacts[index]
                });
                currentRecord.commitLine({sublistId: "otherrecipientslist"});
            }
        }
        currentRecord.setValue({fieldId: "template", value: distributionContacts.mailTemplate});
    }

    const getDocDistributionContacts = (customer, transactionType) => {
        let contacts = [], mailTemplate;
        search.create({
            type: DOCUMENT_DISTRIBUTION_RECIPIENT,
            filters: [
                {name: "custrecord_doc_distribution_customer", operator: "anyof", values: customer},
                {name: "custrecord_doc_distribution_doc_type", operator: "anyof", values: transactionType},
                {name: "custrecord_doc_distribution_email_check", operator: "is", values: true}
            ],
            columns: ["custrecord_doc_distribution_contact", "custrecord_doc_distribution_doc_type", "custrecord_doc_distribution_emailaddress", "custrecord_doc_distribution_mailtemplate"]
        }).run().each(function (result) {
            contacts = contacts.concat(result.getValue("custrecord_doc_distribution_emailaddress").split(","));
            mailTemplate = result.getValue("custrecord_doc_distribution_mailtemplate");
            return true;
        });
        return {contacts, mailTemplate};
    }

    const getTransactionType = (transaction) => {
        return search.lookupFields({type: search.Type.TRANSACTION, id: transaction, columns: ['type']}).type[0].text;
    }

    const checkPerson = (customer) => {
        return search.lookupFields({
            type: "customer",
            id: customer,
            columns: ["isperson"]
        }).isperson;
    }

    const getContactDetails = (contacts) => {
        let emails = [], faxNumbers = [];
        console.log({contacts});
        search.create({
            type: search.Type.CONTACT,
            filters: [{name: "internalid", operator: "anyof", values: contacts}],
            columns: ["email", "fax"]
        }).run().each(function (result) {
            if (!!result.getValue({name: "email"}))
                emails.push(result.getValue({name: "email"}));
            if (!!result.getValue({name: "fax"}))
                faxNumbers.push(result.getValue({name: "fax"}));
            return true;
        });
        return {emails, faxNumbers};
    }

    const getContacts = (customer) => {
        let contacts = [];
        search.create({
            type: search.Type.CONTACT,
            filters: [{name: "company", operator: "anyof", values: customer}]
        }).run().each(function (result) {
            contacts.push(result.id);
            return true;
        });
        return contacts;
    }

    const getContactsSelectOptions = (customer) => {
        let contacts = [];
        search.create({
            type: search.Type.CONTACT,
            filters: [{name: "company", operator: "anyof", values: customer}],
            columns: "entityid"
        }).run().each(function (result) {
            contacts.push({text: result.getValue("entityid"), value: result.id});
            return true;
        });
        return contacts;
    }

    // UTILITY FUNCTIONS
    function isEmpty(stValue) {
        return ((stValue === '' || stValue == null || stValue == undefined) || (stValue.constructor === Array && stValue.length == 0) || (stValue.constructor === Object && (function (v) {
            for (var k in v)
                return false;
            return true;
        })(stValue)));
    }

    return {pageInit, fieldChanged, /*postSourcing,*/ addRecipients};

});
