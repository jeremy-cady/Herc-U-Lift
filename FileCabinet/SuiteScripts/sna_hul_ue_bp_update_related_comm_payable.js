/*
* Copyright (c) 2022, ScaleNorth Advisors LLC and/or its affiliates. All rights reserved.
*

* @author fang
*
* Script brief description:
* User event script deployed on Bill Payment that updates related Commission Payable status to Paid.
*
* Revision History:
*
* Date			            Issue/Case		    Author			    Issue Fix Summary
* =======================================================================================================
* 2023/04/21                               fang           Initial version
*
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
      log.debug({ title: 'afterSubmit', details: '|---> Starting afterSubmit <---|' });

      log.debug('context.newRecord', context.newRecord);

      try {
        var contextType = context.type;
        log.debug('contextType', contextType);

        if (contextType != 'create' && contextType != 'paybills') return;

        // Load record
        var newRecord = context.newRecord;
        var recID = newRecord.id;
        var recType = newRecord.type;
        var commPayableRecLineCount = newRecord.getLineCount({ sublistId: 'apply' });

        log.debug('recID', recID);
        log.debug('recType', recType);
        log.debug('commPayableRecLineCount', commPayableRecLineCount);

        for (var i = 0; i < commPayableRecLineCount; i++) {

          var applyRecType = newRecord.getSublistValue({
            sublistId: 'apply',
            fieldId: 'type',
            line: i
          });

          log.debug('applyRecType', applyRecType);

          if (applyRecType == 'Commission Payable') {
            var commPayableRecId = newRecord.getSublistValue({
              sublistId: 'apply',
              fieldId: 'internalid',
              line: i
            });

            log.debug('commPayableRecId', commPayableRecId);

            try {
              record.submitFields({
                type: 'customtransaction_sna_commission_payable',
                id: commPayableRecId,
                values: {
                  transtatus: 'B',
                }
              });
            } catch (error) {
              log.error({ title: "Error Submit Fields", details: error });
            }
          }
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
