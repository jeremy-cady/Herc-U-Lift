/*
 * Copyright (c) 2022, ScaleNorth Advisors LLC and/or its affiliates. All rights reserved.
 *
 * @author fang
 *
 * Script brief description:
 * CS script to set transaction custom column 'Override Item Receipt Price' to True if 'Price is Different from IR' is True.
 *
 * Revision History:
 *
 * Date              Issue/Case          Author          Issue Fix Summary
 * =============================================================================================
 * 2022/10/18      		                   fang             Initial version
 *
 */

/**
 * @NApiVersion 2.1
 * @NScriptType ClientScript
 * @NModuleScope SameAccount
 */
define(['N/search', 'N/runtime'] /**
 * @param{search} search
 */, function (search, runtime) {
  // UTILITY FUNCTIONS
  function isEmpty(stValue) {
    return (
      stValue === '' ||
      stValue == null ||
      stValue == undefined ||
      (stValue.constructor === Array && stValue.length == 0) ||
      (stValue.constructor === Object &&
        (function (v) {
          for (var k in v) return false;
          return true;
        })(stValue))
    );
  }

  function forceFloat(stValue) {
    var flValue = parseFloat(stValue);
    if (isNaN(flValue) || stValue == 'Infinity') {
      return 0.0;
    }
    return flValue;
  }

  var TEMPITEMCAT = '';
  var RENTALCHARGE = '';
  var RENTALEQUIPMENT = '';

  const LOOKUP_MAPPING = {};

  /**
   * Searches the item details from the purchase order transaction.
   * @param recordId
   * @param itemId
   * @returns {{poId: *, item: *, rate: number|number}[]|*[]}
   */
  const searchPurchaseOrders = ({ recordId, itemId }) => {
    if (isEmpty(recordId) || isEmpty(itemId)) return [];
    const searchObj = search.load({ id: 'customsearch_sna_bill_purchaseorders' });
    searchObj.filters.push(
      search.createFilter({
        name: 'internalidnumber',
        join: 'applyingtransaction',
        operator: search.Operator.EQUALTO,
        values: recordId,
      }),
      search.createFilter({
        name: 'item',
        operator: search.Operator.ANYOF,
        values: itemId,
      }),
    );

    const results = searchObj
      .run()
      .getRange({ start: 0, end: 1000 })
      .map((result) => ({
        poId: result.getValue({ name: 'internalid' }),
        itemId: result.getValue({ name: 'item' }),
        rate: forceFloat(result.getValue({ name: 'rate' })),
      }));

    LOOKUP_MAPPING[itemId] = results;

    return results;
  };

  /**
   * Function to be executed when field value is changed.
   *
   * @param {Object} scriptContext
   * @param {Record} scriptContext.currentRecord - Current form record
   * @param {string} scriptContext.sublistId - Sublist name
   * @param {string} scriptContext.fieldId - Field name
   *
   * @since 2015.2
   */
  function fieldChanged(context) {
    const { fieldId, sublistId, currentRecord: vendorBill } = context;

    if (isEmpty(sublistId)) return;

    if (fieldId == 'custcol_sna_hul_ir_price_diff') {
      const priceDifference = vendorBill.getCurrentSublistValue({ sublistId, fieldId });
      vendorBill.setCurrentSublistValue({
        fieldId: 'custcol_sna_override_ir_price',
        value: priceDifference,
        forceSyncSourcing: true,
        sublistId,
      });
    }

    if (fieldId == 'rate') {
      const rate = vendorBill.getCurrentSublistValue({ fieldId, sublistId });
      const itemId = vendorBill.getCurrentSublistValue({ fieldId: 'item', sublistId });
      if (isEmpty(itemId) || isEmpty(rate)) return;

      let relatedPurchaseOrders = !isEmpty(LOOKUP_MAPPING[itemId])
        ? LOOKUP_MAPPING[itemId]
        : searchPurchaseOrders({
            recordId: vendorBill.id || null,
            itemId,
          });

      if (relatedPurchaseOrders.length == 0) return;

      console.log(relatedPurchaseOrders);
      const match = relatedPurchaseOrders.find((x) => x.itemId == itemId);
      if (!match) return;

      if (match.rate != rate) {
        const fieldValues = {
          custcol_sna_hul_ir_price_diff: true,
          custcol_sna_override_ir_price: true,
        };
        for (let [fieldToSet, value] of Object.entries(fieldValues)) {
          vendorBill.setCurrentSublistValue({ sublistId, fieldId: fieldToSet, value });
        }
        vendorBill.commitLine({ sublistId });
      }
    }
  }

  return {
    fieldChanged: fieldChanged,
  };
});
