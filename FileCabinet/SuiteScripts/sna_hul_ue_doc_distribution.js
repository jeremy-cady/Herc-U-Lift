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
 * This User Event script fetches the Contact Information for Document Distribution (Deployed only for CSV Imports)
 *
 * Deployment - Message
 * Add Recipient Email Addresses to Email based on Document Distribution
 *
 * Revision History:
 *
 * Date            Issue/Case       Author              Issue Fix Summary
 * =============================================================================================
 * 2022/08/17                       Amol Jagkar         Initial version
 *
 */
define(['N/record', 'N/search', 'N/runtime', 'N/ui/serverWidget'], (record, search, runtime,serverWidget) => {
    const beforeLoad = (scriptContext) => {
        log.debug({
            title: "Context Type",
            details: {type: scriptContext.type, defaultEdit: scriptContext.UserEventType.EDIT}
        });

        if (scriptContext.type == scriptContext.UserEventType.CREATE || scriptContext.type == scriptContext.UserEventType.EDIT) {
            let customContactField = scriptContext.form.addField({
                id: 'custpage_sna_doc_distri_contact',
                type: serverWidget.FieldType.MULTISELECT,
                label: 'Contacts'
            });
        }
    }

    const beforeSubmit = (scriptContext) => {
        if (runtime.executionContext == runtime.ContextType.CSVIMPORT) {
            let newRecord = scriptContext.newRecord;
            let customer = newRecord.getValue({fieldId: "custrecord_doc_distribution_customer"});
            let isPerson = checkPerson(customer);
            if (!isPerson) {
                let contactData = getContacts(customer);
                newRecord.setValue({fieldId: "custrecord_doc_distribution_contact", value: contactData.contacts});

                if (contactData.emails.length != 0)
                    newRecord.setValue({
                        fieldId: "custrecord_doc_distribution_emailaddress", value: contactData.emails.join(",")
                    });
                if (contactData.faxNumbers.length != 0)
                    newRecord.setValue({
                        fieldId: "custrecord_doc_distribution_fax_numbers", value: contactData.faxNumbers.join(",")
                    });
            }
        }
    }

    const checkPerson = (customer) => {
        return search.lookupFields({
            type: "customer",
            id: customer,
            columns: ["isperson"]
        }).isperson;
    }

    const getContacts = (customer) => {
        let contacts = [], emails = [], faxNumbers = [];
        search.create({
            type: search.Type.CONTACT,
            filters: [{name: "company", operator: "anyof", values: customer}],
            columns: ["email", "fax"]
        }).run().each(function (result) {
            contacts.push(result.id);
            if (!!result.getValue({name: "email"}))
                emails.push(result.getValue({name: "email"}));
            if (!!result.getValue({name: "fax"}))
                faxNumbers.push(result.getValue({name: "fax"}));
            return true;
        });
        return {contacts, emails, faxNumbers};
    }

    return {beforeLoad, beforeSubmit}
});
