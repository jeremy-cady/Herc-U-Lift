/**
 * Copyright (c) 2025, ScaleNorth Advisors LLC and/or its affiliates. All rights reserved.
 *
 * @author Angelbert Palad
 *
 * Script brief description: Deployed on Vendor Credit afterSubmit trigger to link a related
 * Journal Entry Record
 *
 * Related Scripts:
 *
 * Revision History:
 *
 * Date              Issue/Case         Author         Issue Fix Summary
 * =============================================================================================
 * 2025-03-18        266992             apalad         Initial version
 *
 * @NApiVersion 2.1
 * @NScriptType UserEventScript
 */
define(['N/error', 'N/record'],
    /**
 * @param{error} error
 * @param{record} record
 */
    (error, record) => {

        /**
         * Defines the function definition that is executed after record is submitted.
         * @param {Object} scriptContext
         * @param {Record} scriptContext.newRecord - New record
         * @param {Record} scriptContext.oldRecord - Old record
         * @param {string} scriptContext.type - Trigger type; use values from the context.UserEventType enum
         * @since 2015.2
         */
        const afterSubmit = (scriptContext) => {

            let stLoggerTitle = "afterSubmit";

            try {

                let objRecord = scriptContext.newRecord;

                let intJournalEntry = objRecord.getValue({
                    fieldId: 'custbody_sna_claims_je'
                })
                log.debug('intJournalEntry',intJournalEntry);

                if(intJournalEntry){

                    let intUpdateField = record.submitFields({
                        type: record.Type.JOURNAL_ENTRY,
                        id: intJournalEntry,
                        values: {
                            custbody_sn_claimsbillcredit: objRecord.id
                        },
                    });
                    log.debug('Record Updated',intUpdateField);
                }

            } catch (e) {
                log.error({title: stLoggerTitle, details: `${e.name}: ${e.message}`});
                throw error.create({
                    name: e.name,
                    message: `ERROR - ${stLoggerTitle} : ${e.message}`,
                    notifyOff: false
                });
            }
        }

        return {afterSubmit}

    });
