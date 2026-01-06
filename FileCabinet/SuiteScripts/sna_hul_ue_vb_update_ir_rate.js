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
* This is a User Event script that updates the related Item Receipt record line item rates if there's any price discrepancy with the Vendor Bill.
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

    //if (context.type == context.UserEventType.CREATE || context.type == context.UserEventType.DROPSHIP || context.type == context.UserEventType.SPECIALORDER) {

    if (context.type == context.UserEventType.DELETE) return;

    //Vendor Bill - Check for Line Item Price Difference
    var newRecord = context.newRecord;

    log.debug("newRecord.id", newRecord.id);

    var vendorBillRec = record.load({
      type: record.Type.VENDOR_BILL,
      id: newRecord.id
    });

    var vbLineItemCount = vendorBillRec.getLineCount({
      sublistId: 'item'
    });

    for (var vbLineIndex = 0; vbLineIndex < vbLineItemCount; vbLineIndex++) {

      log.debug('vbLine: ', vbLineIndex);

      var overrideIRPrice = vendorBillRec.getSublistValue({
        sublistId: 'item',
        fieldId: 'custcol_sna_override_ir_price',
        line: vbLineIndex
      });

      log.debug('overrideIRPrice', overrideIRPrice);

      // if (!priceDiff)
      if (overrideIRPrice) {
        log.debug('overrideIRPrice = T');

        var vbItem = vendorBillRec.getSublistValue({
          sublistId: 'item',
          fieldId: 'item',
          line: vbLineIndex
        });

        log.debug('vbItem', vbItem);

        var vbRate = vendorBillRec.getSublistValue({
          sublistId: 'item',
          fieldId: 'rate',
          line: vbLineIndex
        });

        log.debug('vbRate', vbRate);

        var vbLineId = vendorBillRec.getSublistValue({
          sublistId: 'item',
          fieldId: 'line',
          line: vbLineIndex
        });

        log.debug('vbLineId', vbLineId);


        //Load Search - SNA HUL [Pey] PO - IR - VB Transaction Connection - Line Level
        var relatedPOIRSearch = search.load({
          id: 'customsearch_sna_po_ir_vb_trans_con_line'
        });

        //Add search filters
        var vbFilter = search.createFilter({
          name: 'internalid',
          join: 'billingtransaction',
          operator: 'anyof',
          values: newRecord.id
        });

        var vbLineIdFilter = search.createFilter({
          name: 'line',
          join: 'billingtransaction',
          operator: 'equalto',
          values: vbLineId
        });

        var itemFilter = search.createFilter({
          name: 'item',
          operator: 'anyof',
          values: vbItem
        });

        //Search for related IRs and POs of VB
        relatedPOIRSearch.filters.push(vbFilter);
        relatedPOIRSearch.filters.push(vbLineIdFilter);
        relatedPOIRSearch.filters.push(itemFilter);

        // var relatedPOIRSearchCount = relatedPOIRSearch.runPaged().count;
        //
        // log.debug('relatedPOIRSearchCount', relatedPOIRSearchCount);

        var relatedIRArr = [];

        relatedPOIRSearch.run().each(function (result) {
          var relatedIRId = result.getValue({ name: 'internalid', join: 'fulfillingTransaction' });
          var relatedIRLineId = result.getValue({ name: 'line', join: 'fulfillingTransaction' });
          var relatedIRItem = result.getValue({ name: 'item', join: 'fulfillingTransaction' });
          var relatedIRRate = result.getValue({ name: 'rate', join: 'fulfillingTransaction' });


          log.debug('relatedPOIRSearch inside search - relatedIRId', relatedIRId);
          log.debug('relatedPOIRSearch inside search - relatedIRLineId', relatedIRLineId);
          log.debug('relatedPOIRSearch inside search - relatedIRItem', relatedIRItem);
          log.debug('relatedPOIRSearch inside search - relatedIRRate', relatedIRRate);

          var relatedIRRec = record.load({
            type: record.Type.ITEM_RECEIPT,
            id: relatedIRId
          });

          var irLineNumber = relatedIRRec.findSublistLineWithValue({
            sublistId: 'item',
            fieldId: 'line',
            value: relatedIRLineId
          });

          log.debug('relatedPOIRSearch inside search - irLineNumber', irLineNumber);

          relatedIRRec.setSublistValue({
            sublistId: 'item',
            fieldId: 'rate',
            line: irLineNumber,
            value: vbRate
          });

          var relatedIRRecID = relatedIRRec.save();

          log.debug('relatedIRRecID saved', relatedIRRecID);

          return true;
        });


      }
    }
  }

  return {
    afterSubmit: afterSubmit
  }
});


