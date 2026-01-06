/*
 * Copyright (c) 2022, ScaleNorth Advisors LLC and/or its affiliates. All rights reserved.
 *
 * @author fang
 *
 * Script brief description:
 * CS script to set default IR item rate based on related VB item rate (if different)
 * 
 * Revision History:
 *
 * Date              Issue/Case          Author          Issue Fix Summary
 * =============================================================================================
 * 2023/01/31    		                   fang             Initial version
 *
 */

/**
 * @NApiVersion 2.x
 * @NScriptType ClientScript
 * @NModuleScope SameAccount
 */
define(['N/search', 'N/runtime'],
  /**
   * @param{search} search
   */
  function (search, runtime) {

    // UTILITY FUNCTIONS
    function isEmpty(stValue) {
      return ((stValue === '' || stValue == null || stValue == undefined) || (stValue.constructor === Array && stValue.length == 0) || (stValue.constructor === Object && (function (v) {
        for (var k in v)
          return false;
        return true;
      })(stValue)));
    }

    function forceFloat(stValue) {
      var flValue = parseFloat(stValue);
      if (isNaN(flValue) || (stValue == 'Infinity')) {
        return 0.00;
      }
      return flValue;
    }

    /**
     * Function to be executed when field value is changed.
     *
     * @param {Object} scriptContext
     * @param {Record} scriptContext.currentRecord - Current form record
\\
     *
     * @since 2015.2
     */
    function pageInit(scriptContext) {
      var currIRRec = scriptContext.currentRecord;
      var currIRRecID = currIRRec.id;

      console.log({ title: '-- pageInit', details: 'currIRRecID: ' + currIRRecID });
      console.log({ title: '-- pageInit', details: 'scriptContext.mode: ' + scriptContext.mode });

      if (scriptContext.mode != 'copy') return; //Clicked Receive button from PO

      //Check for related PO
      var relatedPOID = currIRRec.getValue({
        fieldId: 'createdfrom'
      });

      var irLineItemCount = currIRRec.getLineCount({
        sublistId: 'item'
      });

      log.debug('createdFrom (PO)', relatedPOID);
      log.debug('irLineItemCount', irLineItemCount);

      //Check related VB of PO
      var relatedVBSearch = search.create({
        type: search.Type.VENDOR_BILL,
        filters: ['appliedtotransaction', 'anyof', relatedPOID],
        columns: [
          search.createColumn({ name: 'item', summary: search.Summary.GROUP }),
          search.createColumn({ name: 'rate', summary: search.Summary.MAX }),
          search.createColumn({ name: 'custcol_sna_override_ir_price', summary: search.Summary.GROUP })
        ]
      });

      var irItemRateArr = [];

      for (var irLineIndex = 0; irLineIndex < irLineItemCount; irLineIndex++) {

        var irItem = currIRRec.getSublistValue({
          sublistId: 'item',
          fieldId: 'item',
          line: irLineIndex
        });

        log.debug('irItem', irItem);

        var irRate = currIRRec.getSublistValue({
          sublistId: 'item',
          fieldId: 'rate',
          line: irLineIndex
        });

        log.debug('irRate', irRate);

        //Add Item filter
        var itemFilter = search.createFilter({
          name: 'item',
          operator: 'anyof',
          values: irItem
        });

        relatedVBSearch.filters.push(itemFilter);

        var relatedVBRate;
        var relatedVBOverrideIRPrice;

        //Search for related VBs of PO
        relatedVBSearch.run().each(function (result) {
          //relatedVBID = result.getValue({ name: 'internalid' });
          relatedVBRate = result.getValue({ name: 'rate', summary: search.Summary.MAX });
          relatedVBOverrideIRPrice = result.getValue({ name: 'custcol_sna_override_ir_price', summary: search.Summary.GROUP });
          return true;
        });

        log.debug('relatedVBRate', relatedVBRate);
        log.debug('relatedVBOverrideIRPrice', relatedVBOverrideIRPrice);

        if (isEmpty(relatedVBRate)) continue;

        if (!relatedVBOverrideIRPrice) continue;

        //Check if irRate is not the same with related VB's rate
        if (irRate != relatedVBRate) {
          log.debug('IR item rate is diff from VB item rate');

          currIRRec.selectLine({
            sublistId: 'item',
            line: irLineIndex
          });

          currIRRec.setCurrentSublistValue({
            sublistId: 'item',
            fieldId: 'rate',
            value: relatedVBRate,
            ignoreFieldChange: true,
            forceSyncSourcing: true
          });

          currIRRec.commitLine({
            sublistId: 'item'
          });
        }

      }
    }

    return {
      pageInit: pageInit
    };

  });
