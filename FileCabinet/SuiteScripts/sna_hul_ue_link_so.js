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
* 2022/07/22                          Faye Ang              Initial version
* 2023/01/24                          Amol Jagkar           Added condition: Update Linked Sales Order with createdFrom if present
* 2023/01/25                          Faye Ang              Added condition: Set PO Type field if PO is Dropship PO or Special Order PO
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

    if (context.type == context.UserEventType.CREATE || context.type == context.UserEventType.DROPSHIP || context.type == context.UserEventType.SPECIALORDER) {


      var newRecord = context.newRecord;

      log.debug("newRecord.id", newRecord.id);

      var rec = record.load({
        type: record.Type.PURCHASE_ORDER,
        id: newRecord.id
      });

      if (context.type == context.UserEventType.DROPSHIP) {
        rec.setValue({
          fieldId: "custbody_po_type",
          value: 3
        });
      } else if (context.type == context.UserEventType.SPECIALORDER) {
        rec.setValue({
          fieldId: "custbody_po_type",
          value: 6
        });
      }

      var createdFrom = rec.getValue({
        fieldId: "createdfrom"
      });

      log.debug('createdFrom', createdFrom);

      var lineItemCount = rec.getLineCount({
        sublistId: "item"
      });

      for (var line = 0; line < lineItemCount && !!createdFrom; line++) {

        log.debug('line', line);

        rec.setSublistValue({
          sublistId: "item",
          fieldId: "custcol_sna_linked_so",
          line: line,
          value: createdFrom
        });
      }

      rec.save({ ignoreMandatoryFields: true });
    }
  }

  return {
    afterSubmit: afterSubmit
  }
});


