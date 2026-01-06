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
* This is a User Event script that updates the item rates (with markup/discount) based on PO Type.
*
* Revision History:
*
* Date              Issue/Case         Author               Issue Fix Summary
* =============================================================================================
* 2022/07/22                          Faye Ang          Initial version
* 2023/01/16        GAP009            nretiro           added condition so script will not run when context type
*                                                      is dropship or specialorder
* 2023/01/25                          Faye Ang          Added condition the following condition:
                                                        - On create, copy line item rate to Original Rate custom column
                                                        - On edit, use Original Rate custom column to calculate markup/discount on line item rate
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

  function beforeSubmit(context) {
    log.debug("beforeSubmit triggered");
    log.debug("context.type", context.type);
    log.debug("runtime.executionContext", runtime.executionContext);

    if ((context.type == context.UserEventType.EDIT || context.type == context.UserEventType.CREATE)) {

      var newRecord = context.newRecord;

      log.debug("newRecord.id", newRecord.id);

      if (context.type == context.UserEventType.EDIT) {
        var updatePriceCheckbox = newRecord.getValue({
          fieldId: "custbody_sna_update_price_markup_disc"
        });

        if (!updatePriceCheckbox) return;
      }

      var poType = newRecord.getValue({
        fieldId: "custbody_po_type"
      });

      var poTypeField;

      if (poType == 1) { //Emergency
        poTypeField = "custentity_sna_hul_emergency"
      } else if (poType == 2) { //Truck Down/Breakdown 
        poTypeField = "custentity_sna_hul_truckdown"
      } else if (poType == 3) { //Drop Ship
        poTypeField = "custentity_sna_hul_dropship_percent"
      } else if (poType == 4) { //Stock Order
        poTypeField = "custentity_sna_hul_stock_order"
      }

      var buyFromVendor = newRecord.getValue({
        fieldId: "custbody_sna_buy_from"
      });

      log.debug("buyFromVendor", buyFromVendor);

      if (!isEmpty(buyFromVendor) && !isEmpty(poTypeField)) {
        var discountMarkupLookup = search.lookupFields({
          type: search.Type.VENDOR,
          id: buyFromVendor,
          columns: poTypeField
        });

        log.debug("discountMarkupLookup", discountMarkupLookup);

        if (!isEmpty(discountMarkupLookup[poTypeField])) {
          var discountMarkup = discountMarkupLookup[poTypeField];

          log.debug("discountMarkup", discountMarkup);

          var itemLineCount = newRecord.getLineCount("item");

          for (var line = 0; line < itemLineCount; line++) {

            var itemRate;
            if (context.type == context.UserEventType.CREATE) {
              itemRate = newRecord.getSublistValue({
                sublistId: "item",
                fieldId: "rate",
                line: line
              });
              
              newRecord.setSublistValue({
                sublistId: "item",
                fieldId: "custcol_sna_original_item_rate",
                line: line,
                value: itemRate
              });
              
            } else { //context.type = EDIT
              itemRate = newRecord.getSublistValue({
                sublistId: "item",
                fieldId: "custcol_sna_original_item_rate",
                line: line
              });
            }
 
            var qty = newRecord.getSublistValue({
              sublistId: "item",
              fieldId: "quantity",
              line: line
            });

            log.debug('itemRate', itemRate);
            log.debug('qty', qty);
            log.debug("discountMarkup", discountMarkup);

            var newitemRate = itemRate + (itemRate * (parseFloat(discountMarkup) / 100));

            log.debug('newitemRate', newitemRate);

            newRecord.setSublistValue({
              sublistId: "item",
              fieldId: "rate",
              line: line,
              value: newitemRate
            });

            newRecord.setSublistValue({
              sublistId: "item",
              fieldId: "amount",
              line: line,
              value: newitemRate * qty
            });

            var newRateSet = newRecord.getSublistValue({
              sublistId: "item",
              fieldId: "rate",
              line: line,
              value: newitemRate
            });

            log.debug('newRateSet', newRateSet);
           
          }
        }
      }

      // }
    }


  }

  return {
    beforeSubmit: beforeSubmit
  }
});


