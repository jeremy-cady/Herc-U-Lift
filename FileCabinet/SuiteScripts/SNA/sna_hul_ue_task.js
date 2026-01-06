/**
 * Copyright (c) 2025, ScaleNorth Advisors LLC and/or its affiliates. All rights reserved.
 * @NApiVersion 2.1
 * @NScriptType UserEventScript
 */

define([
      'N/record',
      'N/search',
      'N/format',
      // './sna_hul_mod_full_maintenance',
      './shared/sna_hul_mod_utils'
    ],
    /**
     * @param{record} record
     * @param{search} search
     */
    (
        record,
        search,
        format,
        // FULL_MAINTENANCE,
        SNA_UTILS
    ) => {
      const {
        isEmpty
      } = SNA_UTILS;

      const beforeSubmit = (scriptContext) => {
        try {
          log.debug('beforeSubmit', 'START : ' + scriptContext.type);
          log.debug('beforeSubmit', 'scriptContext: ' + JSON.stringify(scriptContext));
          if (scriptContext.type == scriptContext.UserEventType.CREATE || scriptContext.type == scriptContext.UserEventType.EDIT) {
            let newRec = scriptContext.newRecord;
            let supportCase = newRec.getValue({
              fieldId: 'supportcase'
            });
            log.debug('beforeSubmit', 'supportCase: ' + supportCase);
            let scLookup = search.lookupFields({
              type: search.Type.SUPPORT_CASE,
              id: supportCase,
              columns: [
                'custevent_nx_case_asset',
                'email',
                'custevent_hul_shopcase'
              ],
            });
            log.debug('beforeSubmit', 'scLookup: ' + JSON.stringify(scLookup));
            let siteAsset = scLookup.custevent_nx_case_asset[0].value;
            if(scLookup.custevent_hul_shopcase.length){

              log.debug('beforeSubmit', 'No email not: case is shop');
              let caseShop = scLookup.custevent_hul_shopcase[0].value;
              if(caseShop==1){
                newRec.setValue({
                  fieldId: 'custevent_sna_hul_nx_notif_email',
                  value: '',
                });
              return;
              }
            }
            log.debug('beforeSubmit', 'siteAsset: ' + siteAsset);
            let notifemail = '';
            notifemail = newRec.getValue({
              fieldId: 'custevent_sna_hul_nx_notif_email'
            });
            log.debug('beforeSubmit', 'notifemail: ' + notifemail);
            if (notifemail == '') {
              let siteContactEmail = search.lookupFields({
                type: 'customrecord_nx_asset',
                id: siteAsset,
                columns: ['custrecord_sn_hul_site_contact_email'],
              }).custrecord_sn_hul_site_contact_email;
              log.debug('beforeSubmit', 'siteContactEmail: ' + siteContactEmail);

              if (siteContactEmail != '') {
                log.audit('beforeSubmit', 'Setting Notif Email to siteContactEmail: ' + siteContactEmail);
                notifemail = siteContactEmail;
              } else {
                let customer = newRec.getValue('custevent_nx_customer');
                let custLookup = search.lookupFields({
                  type: search.Type.CUSTOMER,
                  id: customer,
                  columns: ['custentity_sna_hul_case_email_notif', 'email'],
                });
                log.debug('beforeSubmit', 'custLookup: ' + JSON.stringify(custLookup));
                if (custLookup.custentity_sna_hul_case_email_notif != '') {
                  notifemail = custLookup.custentity_sna_hul_case_email_notif;
                } else if (custLookup.email != '') {
                  notifemail = custLookup.email;
                }
              }
              newRec.setValue({
                fieldId: 'custevent_sna_hul_nx_notif_email',
                value: notifemail,
              });
            }
          }
          if (scriptContext.type == scriptContext.UserEventType.EDIT) {
            let newRec = scriptContext.newRecord;
            let customer = newRec.getValue('custevent_nx_customer');
            let cLookup = search.lookupFields({
              type: search.Type.CUSTOMER,
              id: customer,
              columns: ['custentity_sn_hul_no_servicereport'],
            });
            log.debug('beforeSubmit', 'cLookup: ' + JSON.stringify(cLookup));
            if (cLookup.custentity_sn_hul_no_servicereport) {
              newRec.setValue({
                fieldId: 'custevent_sna_hul_nx_notif_email',
                value: '',
              });
            }
          }
        } catch (e) {
          log.error('ERROR', e);
        }
      };

      /**
       * Defines the function definition that is executed after record is submitted.
       * @param {Object} scriptContext
       * @param {Record} scriptContext.newRecord - New record
       * @param {Record} scriptContext.oldRecord - Old record
       * @param {string} scriptContext.type - Trigger type; use values from the context.UserEventType enum
       * @since 2015.2
       */
      const afterSubmit = (scriptContext) => {
        try {
          // Executing the code only when the Task is not getting deleted.
          if (scriptContext.type != scriptContext.UserEventType.DELETE) {
            // FULL_MAINTENANCE.computeOvertime(scriptContext);
            let oldRec = scriptContext.oldRecord;
            let newRec = scriptContext.newRecord;
            let newStatus = newRec.getValue({
              fieldId: 'status'
            });
            let notifEmail = newRec.getValue({
              fieldId: 'custevent_sna_hul_nx_notif_email'
            });

            // Executing the code only when the status is changed to completed.
            const isComplete = newStatus == 'COMPLETE';
            const oldStatus = oldRec.getValue({
              fieldId: 'status'
            });
            if ((isEmpty(oldRec) && isComplete) || (!isEmpty(oldRec) && isComplete && oldStatus != 'COMPLETE')) {
              let customer = newRec.getValue('custevent_nx_customer');
              let cLookup = search.lookupFields({
                type: search.Type.CUSTOMER,
                id: customer,
                columns: ['custentity_sna_hul_case_email_notif', 'custentity_sn_hul_no_servicereport'],
              });
              log.debug('afterSubmit', 'cLookup: ' + JSON.stringify(cLookup));

              // Set Case Email(s) based on Task: Notification Email
              let caseId = newRec.getValue({
                fieldId: 'supportcase'
              });
              let caseRec = record.load({
                type: 'supportcase',
                id: caseId,
              });
              caseRec.setValue({
                fieldId: 'custevent_sna_hul_nx_notif_email',
                value: notifEmail,
              });
              // if(!cLookup.custentity_sn_hul_no_servicereport) {
              //   caseRec.setValue({
              //     fieldId: 'email',
              //     value: cLookup.custentity_sna_hul_case_email_notif,
              //   });
              // }else{
              //   caseRec.setValue({
              //     fieldId: 'email',
              //     value: 'no-reply@herculift.com',
              //   });
              // }
              log.debug('Set Case for Email: ', notifEmail);
              log.debug('Save Case for Email: ', caseRec.save({
                enableSourcing: true,
                ignoreMandatoryFields: true
              }));
            } else {
              // log.audit('status details', 'newStatus: ' + newStatus + ', oldStatus: ' + oldRec.getValue({ fieldId: 'status' }));
            }
          }
        } catch (e) {
          log.error('ERROR', {
            message: e.message,
            stack: e.stack,
          });
        }
      };

      return {
        beforeSubmit: beforeSubmit,
        afterSubmit: afterSubmit,
      };
    });