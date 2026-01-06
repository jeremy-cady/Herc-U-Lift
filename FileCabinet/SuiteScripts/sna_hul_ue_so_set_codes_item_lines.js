/*
* Copyright (c) 2022, ScaleNorth Advisors LLC and/or its affiliates. All rights reserved.
*

* @author fang
*
* Script brief description:
* (BRIEF DESCRIPTION)
*
* Revision History:
*
* Date			            Issue/Case		    Author			    Issue Fix Summary
* =======================================================================================================
* 2023/02/22                              fang             Initial version
* 2023/3/15                               fang             Fix issue/error if Support Case's Revenue Stream field is blank    
*
*
*/

/**
 * @NApiVersion 2.x
 * @NScriptType UserEventScript
 * @NModuleScope SameAccount
 */

define([
  'N/record',
  'N/runtime',
  'N/search',
  'N/format',
  'N/error'
],

  function (record, runtime, search, format, error) {

    function afterSubmit(context) {
      log.debug('afterSubmit');

      try {
        var contextType = context.type;
        log.debug('contextType', contextType);

        if (contextType == 'delete') return;


        // Load record
        var newRecord = context.newRecord;
        var recID = newRecord.id;
        var recType = newRecord.type;

        log.debug('recID', recID);
        log.debug('recType', recType);

        var currRecord = record.load({
          type: recType,
          id: recID
        });

        var nxcCaseID = currRecord.getValue({
          fieldId: 'custbody_nx_case'
        });

        if (isEmpty(nxcCaseID)) return;

        //Get Next Service Case > Revenue Stream
        var nxcCaseRevStream = search.lookupFields({
          type: 'supportcase',
          id: nxcCaseID,
          columns: 'cseg_sna_revenue_st'
        });

        log.debug('nxcCaseRevStream', nxcCaseRevStream);
        log.debug('nxcCaseRevStream.cseg_sna_revenue_st', nxcCaseRevStream.cseg_sna_revenue_st);

        if (!isEmpty(nxcCaseRevStream.cseg_sna_revenue_st)) {
          var revStreamID = nxcCaseRevStream.cseg_sna_revenue_st[0].value;

          log.debug('revStreamID', revStreamID);

          var revStreamLookup = search.lookupFields({
            type: 'customrecord_cseg_sna_revenue_st',
            id: revStreamID,
            columns: ['custrecord_sna_hul_revstream_repair_code', 'custrecord_sna_hul_revstream_work_code', 'custrecord_sna_hul_revstream_group_code']
          });

          log.debug('revStreamLookup', revStreamLookup);

          var revStream_repairCodeLookup = revStreamLookup.custrecord_sna_hul_revstream_repair_code;
          var revStream_workCodeLookup = revStreamLookup.custrecord_sna_hul_revstream_work_code;
          var revStream_groupCodeLookup = revStreamLookup.custrecord_sna_hul_revstream_group_code;

          log.debug('revStream_repairCodeLookup', revStream_repairCodeLookup);
          log.debug('revStream_workCodeLookup', revStream_workCodeLookup);
          log.debug('revStream_groupCodeLookup', revStream_groupCodeLookup);

          if (!isEmpty(revStream_repairCodeLookup)) { //Repair Code has values, Work Code + Group Code will also have values
            var revStream_repairCode = revStream_repairCodeLookup[0].value;
            var revStream_workCode = revStream_workCodeLookup[0].value;
            var revStream_groupCode = revStream_groupCodeLookup[0].value;

            log.debug('revStream_repairCode', revStream_repairCode);
            log.debug('revStream_workCode', revStream_workCode);
            log.debug('revStream_groupCode', revStream_groupCode);

            var itemCount = currRecord.getLineCount({
              sublistId: 'item'
            });

            log.debug('itemCount', itemCount);

            for (var itemIndex = 0; itemIndex < itemCount; itemIndex++) {
              currRecord.setSublistValue({
                sublistId: 'item',
                fieldId: 'custcol_sna_repair_code',
                line: itemIndex,
                value: revStream_repairCode
              });

              currRecord.setSublistValue({
                sublistId: 'item',
                fieldId: 'custcol_sna_work_code',
                line: itemIndex,
                value: revStream_workCode
              });

              currRecord.setSublistValue({
                sublistId: 'item',
                fieldId: 'custcol_sna_group_code',
                line: itemIndex,
                value: revStream_groupCode
              });
            }

          } else { //Repair Code, Work Code, and Group Code don't have value

            log.debug('Repair/Work/Group Code dont have value. Check Retain Task Codes column.');

            var itemCount = currRecord.getLineCount({
              sublistId: 'item'
            });

            log.debug('itemCount', itemCount);

            for (var itemIndex = 0; itemIndex < itemCount; itemIndex++) {

              log.debug('Line index', itemIndex);

              var retainTaskCodes = currRecord.getSublistValue({
                sublistId: 'item',
                fieldId: 'custcol_sna_hul_nxc_retain_task_codes',
                line: itemIndex
              });

              log.debug('retainTaskCodes', retainTaskCodes);

              if (retainTaskCodes) { //If Retain Task Codes column = T, get previous line's Repair/Work/Group Codes and set it on the current line's

                var revStream_repairCode = currRecord.getSublistValue({
                  sublistId: 'item',
                  fieldId: 'custcol_sna_repair_code',
                  line: itemIndex - 1
                });

                log.debug('Previous line > revStream_repairCode', revStream_repairCode);

                var revStream_workCode = currRecord.getSublistValue({
                  sublistId: 'item',
                  fieldId: 'custcol_sna_work_code',
                  line: itemIndex - 1
                });

                log.debug('Previous line > revStream_workCode', revStream_workCode);

                var revStream_groupCode = currRecord.getSublistValue({
                  sublistId: 'item',
                  fieldId: 'custcol_sna_group_code',
                  line: itemIndex - 1
                });

                log.debug('Previous line > revStream_groupCode', revStream_groupCode);

                currRecord.setSublistValue({
                  sublistId: 'item',
                  fieldId: 'custcol_sna_repair_code',
                  line: itemIndex,
                  value: revStream_repairCode
                });

                currRecord.setSublistValue({
                  sublistId: 'item',
                  fieldId: 'custcol_sna_work_code',
                  line: itemIndex,
                  value: revStream_workCode
                });

                currRecord.setSublistValue({
                  sublistId: 'item',
                  fieldId: 'custcol_sna_group_code',
                  line: itemIndex,
                  value: revStream_groupCode
                });
              }
            }

            

          }

          currRecord.save();
        }
      } catch (err) {
        log.audit({
          title: err.name,
          details: err.message
        });

        throw err;

      }

      log.debug('afterSubmit', '|--->> Exiting afterSubmit <<---|');
    }


    function isEmpty(stValue) {
      return ((stValue === '' || stValue == null || stValue == undefined)
        || (stValue.constructor === Array && stValue.length == 0)
        || (stValue.constructor === Object && (function (v) { for (var k in v) return false; return true; })(stValue)));
    }

    return {
      afterSubmit: afterSubmit
    };

  });