/**
 * @NApiVersion 2.1
 * @NScriptType UserEventScript
 */
define(['N/record','N/search' ],
    /**
 * @param{record} record
 */
    (record, search) => {
        /**
         * Defines the function definition that is executed before record is loaded.
         * @param {Object} scriptContext
         * @param {Record} scriptContext.newRecord - New record
         * @param {string} scriptContext.type - Trigger type; use values from the context.UserEventType enum
         * @param {Form} scriptContext.form - Current form
         * @param {ServletRequest} scriptContext.request - HTTP request information sent from the browser for a client action only.
         * @since 2015.2
         */
        const STATUS_CLOSED='5';
        const beforeLoad = (scriptContext) => {

        }

        /**
         * Defines the function definition that is executed before record is submitted.
         * @param {Object} scriptContext
         * @param {Record} scriptContext.newRecord - New record
         * @param {Record} scriptContext.oldRecord - Old record
         * @param {string} scriptContext.type - Trigger type; use values from the context.UserEventType enum
         * @since 2015.2
         */
        const afterSubmit = (scriptContext) => {
            const {newRecord, oldRecord, type, UserEventType}=scriptContext
            log.debug(`type val=${type}`, `${newRecord.id}`)
            if(type === UserEventType.EDIT || type === UserEventType.XEDIT) {
                const email =newRecord.getValue({fieldId:'custevent_sna_hul_case_email_notif'})
                const emailStandard =newRecord.getValue({fieldId:'email'})
                const oldStatus =oldRecord.getValue({fieldId:'status'})
                const newStatus =newRecord.getValue({fieldId:'status'})
                const serviceEmailTriggeredOld =oldRecord.getValue({fieldId:'custevent4'})
                const serviceEmailTriggeredNew =newRecord.getValue({fieldId:'custevent4'})
                log.debug(`email: ${email}`)

                if(oldStatus !== newStatus && newStatus ===STATUS_CLOSED) {

                  if(email){
      const id = record.submitFields({
                        type: record.Type.SUPPORT_CASE,
                        id: newRecord.id,
                        values: {
                            'email': email
                        },
                        options: {
                            enableSourcing: false,
                            ignoreMandatoryFields : true
                        }
                    });
                    log.debug(`record saved.. ${id}`)
                    
                  }
              
                }

               /* const sent =checkSystemNotes(newRecord)

                log.debug(`sent ${sent}`)
                log.debug(`serviceEmailTriggeredNew ${serviceEmailTriggeredNew}`)
                if(sent){ // populated
                    const id =newRecord.getValue({fieldId:'custevent_nx_customer'})
                    const fieldLookUp = search.lookupFields({
                        type: search.Type.CUSTOMER,
                        id,
                        columns: ['email']
                    });
                    const email = fieldLookUp.email;
                    const idRec = record.submitFields({
                        type: record.Type.SUPPORT_CASE,
                        id: newRecord.id,
                        values: {
                            'email': email
                        },
                        options: {
                            enableSourcing: false,
                            ignoreMandatoryFields : true
                        }
                    });
                    log.debug(`record saved to revert back.. ${idRec}`)

                }*/

            }
        }

        function checkSystemNotes(newRecord) {
            var supportcaseSearchObj = search.create({
                type: "supportcase",
                filters:
                    [
                        ["messages.subject","contains","Case Service"],
                        "AND",
                        ["systemnotes.field","anyof","SUPPORTCASE.KLASTMESSAGE"],
                        "AND",
                        ["internalidnumber","equalto",newRecord.id]
                    ],
                columns:
                    [
                        search.createColumn({
                            name: "name",
                            join: "systemNotes",
                            summary: "MAX",
                            label: "Set by",
                            sort: search.Sort.ASC
                        })
                    ]
            });
            var searchResultCount = supportcaseSearchObj.runPaged().count;
            log.debug("supportcaseSearchObj result count",searchResultCount);
            let resultCount=0;
            supportcaseSearchObj.run().each(function(result){
                resultCount =result.getValue({
                    name: "name",
                    join: "systemNotes",
                    summary: "MAX",
                })
                return true;
            });
            log.debug(`resultCount =${resultCount}`)
           if(resultCount){
               return true;
           }else{
               return false;
           }
        }


        return {  afterSubmit}

    });
