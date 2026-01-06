/**
 *@NApiVersion 2.x
 *@NScriptType UserEventScript
 */

/**
* Copyright (c) 2021, ScaleNorth Advisors LLC and/or its affiliates. All rights reserved.
*
* @author Faye Ang
*
* Script brief description:
* This is a User Event script that updates the Linked Sales Order column with the Created From field value.
*
* Revision History:
*
* Date              Issue/Case         Author               Issue Fix Summary
* =============================================================================================
* 2022/07/22                          Faye Ang          Initial version
*
*
*/
define(["N/record", "N/search", "N/runtime"], function (record, search, runtime) {

  function isEmpty(stValue) {
    return ((stValue === '' || stValue == null || stValue == undefined) || (stValue.constructor === Array && stValue.length == 0) || (stValue.constructor === Object && (function (v) {
      for (var k in v)
        return false;
      return true;
    })(stValue)));
  }

  function afterSubmit(context) {
    log.debug("afterSubmit triggered");
    log.debug("context.type", context.type);
    log.debug("runtime.executionContext", runtime.executionContext);

    if (context.type == context.UserEventType.CREATE || context.type == context.UserEventType.EDIT || context.type == context.UserEventType.DROPSHIP || context.type == context.UserEventType.SPECIALORDER || context.type == context.UserEventType.APPROVE) {
      
      var newRecord = context.newRecord;

      log.debug("newRecord.id", newRecord.id);

      var rec = record.load({
        type: record.Type.SALES_ORDER,
        id: newRecord.id
      });

      var lineItemCount = rec.getLineCount({
        sublistId: "item"
      });

      for (var line = 0; line < lineItemCount; line++) {

        log.debug('line', line);

        var createdPO = rec.getSublistValue({
          sublistId: "item",
          fieldId: "createdpo",
          line: line
        });

        log.debug('createdPO', createdPO);

        if (isEmpty(createdPO)) continue;

        rec.setSublistValue({
          sublistId: "item",
          fieldId: "custcol_sna_linked_po",
          line: line,
          value: createdPO
        });

      }

      rec.save();
    }
  }

  return {
    afterSubmit: afterSubmit
  }
});


