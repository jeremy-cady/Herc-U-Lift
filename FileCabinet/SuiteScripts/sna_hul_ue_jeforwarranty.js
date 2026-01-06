/**
 * Copyright (c) 2021, ScaleNorth Advisors LLC and/or its affiliates. All rights reserved.
 *
 * @author afrancisco
 * @NApiVersion 2.1
 * @NScriptType UserEventScript
 *
 * Script brief description:

 *
 * Revision History:
 *
 * Date              Issue/Case         Author          Issue Fix Summary
 * =============================================================================================
 * 2023/09/21                          afrancisco         Initial version
 * 2023/10/20                          afrancisco         Added Invoice Link and Entity Name on JE, Added Auto Accept Payment
 * 2023/11/16                          afrancisco         Add Claim ID update and mandatory logic.
 */
define(['N/search', 'N/record', 'N/runtime'], function (search, record, runtime) {
  function afterSubmit(context) {
    try {
      //On Create/Update Only, If delete return
      if (context.type === context.UserEventType.DELETE) return;

      var objRec = context.newRecord;
      log.audit('objRec', objRec.id);
      var objUser = runtime.getCurrentUser();
      var intClaimWarranty = objUser.getPreference('custscript_sna_claimwarranty');
      var blnCreateJE = false;
      var intJELine = 0;
      var intSubs = objRec.getValue('subsidiary');
      var intInvAcc = objRec.getValue('account');
      var intInvRevSt = objRec.getValue('cseg_sna_revenue_st');
      var intJE = objRec.getValue('custbody_sna_jeforwarranty');
      var intCustomer = objRec.getValue('entity');
      var strClaimId = objRec.getValue('custbody_sna_inv_claimid');
      var objJE = new Object();
      // log.audit('intJE',intJE);
      // log.audit('isEmpty(intJE)',isEmpty(intJE));
      if (isEmpty(intJE) || context.type == context.UserEventType.CREATE) {
        objJE = record.create({ type: record.Type.JOURNAL_ENTRY, isDynamic: true });
      } else {
        objJE = record.load({ type: record.Type.JOURNAL_ENTRY, id: intJE, isDynamic: true });
        var intLineCnt = objJE.getLineCount({ sublistId: 'line' });
        for (var x = intLineCnt - 1; x >= 0; x--) {
          objJE.removeLine({ sublistId: 'line', line: x });
        }
      }
      objJE.setValue({ fieldId: 'subsidiary', value: intSubs });
      objJE.setValue({ fieldId: 'cseg_sna_revenue_st', value: intInvRevSt });
      objJE.setValue({ fieldId: 'custbody_sna_invforwarranty', value: objRec.id });
      objJE.setValue({ fieldId: 'custbody_sna_claim_id', value: strClaimId });

      var fltCredit = 0;

      //{amount} + {taxamount}
      //Iterate Lines
      var intLineCount = objRec.getLineCount({ sublistId: 'item' });
      for (var x = 0; intLineCount > x; x++) {
        var intItem = objRec.getSublistValue({ sublistId: 'item', fieldId: 'item', line: x });
        var fltAmount = objRec.getSublistValue({ sublistId: 'item', fieldId: 'amount', line: x });
        var fltTax = objRec.getSublistValue({ sublistId: 'item', fieldId: 'custcol_ava_taxamount', line: x });
        log.audit('fltAmount', fltAmount);
        log.audit('fltTax', fltTax);

        if (isEmpty(fltAmount)) {
          continue;
        } //12/22 Issue - Don't Include blank amount.

        var fltTotal = fltAmount + fltTax;
        var blnClaim = objRec.getSublistValue({ sublistId: 'item', fieldId: 'custcol_sn_for_warranty_claim', line: x });
        var intRevStream = objRec.getSublistValue({ sublistId: 'item', fieldId: 'cseg_sna_revenue_st', line: x });
        var blnWarranty = false;
        if (!isEmpty(intRevStream)) {
          blnWarranty = search.lookupFields({
            type: 'customrecord_cseg_sna_revenue_st',
            id: intRevStream,
            columns: ['custrecord_sn_for_warranty'],
          }).custrecord_sn_for_warranty;
        }
        var intServCode = objRec.getSublistValue({
          sublistId: 'item',
          fieldId: 'custcol_sna_service_itemcode',
          line: x,
        });

        if (blnWarranty) {
          blnCreateJE = true;

          //Logic which account to get
          var intAccount;
          var intWarrantyAcc = retWarrantyAcc(intRevStream, intServCode);
          if (isEmpty(intWarrantyAcc) || blnClaim) {
            intAccount = intClaimWarranty;
          } else {
            intAccount = intWarrantyAcc;
          }

          log.audit('1222 - intAccount', intAccount);
          //Create JE Lines
          objJE.insertLine({ sublistId: 'line', line: intJELine });
          // objJE.setSublistValue({sublistId: 'line', fieldId: 'item', value: intItem, line: intJELine });
          objJE.setCurrentSublistValue({ sublistId: 'line', fieldId: 'account', value: intAccount });
          objJE.setCurrentSublistValue({ sublistId: 'line', fieldId: 'debit', value: fltTotal });
          objJE.setCurrentSublistValue({ sublistId: 'line', fieldId: 'credit', value: '' });
          objJE.setCurrentSublistValue({ sublistId: 'line', fieldId: 'cseg_sna_revenue_st', value: intRevStream });
          objJE.commitLine({ sublistId: 'line' });

          fltCredit = parseFloat(fltCredit) + parseFloat(fltTotal);
          intJELine++;
        }
      }

      log.audit('1222 - intInvAcc', intInvAcc);
      objJE.insertLine({ sublistId: 'line', line: intJELine });
      objJE.setCurrentSublistValue({ sublistId: 'line', fieldId: 'account', value: intInvAcc });
      objJE.setCurrentSublistValue({ sublistId: 'line', fieldId: 'debit', value: '' });
      objJE.setCurrentSublistValue({ sublistId: 'line', fieldId: 'credit', value: fltCredit });
      objJE.setCurrentSublistValue({ sublistId: 'line', fieldId: 'cseg_sna_revenue_st', value: intInvRevSt });
      objJE.setCurrentSublistValue({ sublistId: 'line', fieldId: 'entity', value: intCustomer });
      objJE.commitLine({ sublistId: 'line' });

      if (blnCreateJE) {
        var intSavedJE = objJE.save();
        log.audit('intSavedJE', intSavedJE);

        var intSavedInv = record.submitFields({
          type: record.Type.INVOICE,
          id: objRec.id,
          values: { custbody_sna_jeforwarranty: intSavedJE },
          options: {
            enableSourcing: false,
            ignoreMandatoryFields: true,
          },
        });
        log.audit('intSavedInv', intSavedInv);

        //Create Customer Payment
        var objParams = new Object();
        objParams.intInv = objRec.id;
        objParams.intJE = intSavedJE;
        var objResponse = autoAcceptPayment(objParams);

        log.audit('objResponse', objResponse);
        if (objResponse) {
        } else {
          throw 'JE missing on Customer Payment';
        }
      }
    } catch (ex) {
      log.error('afterSubmit catch: ' + context.newRecord.id, ex);
    }
  }

  function retWarrantyAcc(intRev, intServCode) {
    var intAccount;
    var objSearch = search.load({ id: 'customsearch_sna_servicecode_lookup' });
    var objFilter = search.createFilter({ name: 'custrecord_sna_serv_code', operator: 'anyof', values: intRev });
    objSearch.filters.push(objFilter);
    var objFilter2 = search.createFilter({
      name: 'custrecord_sna_ser_code_type',
      operator: 'anyof',
      values: intServCode,
    });
    objSearch.filters.push(objFilter2);
    objSearch.run().each(function (result) {
      intAccount = result.getValue('custrecord_sn_warranty_gl');
    });
    return intAccount;
  }

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

  function autoAcceptPayment(objParams) {
    var objPayment = record.transform({
      fromType: 'invoice',
      fromId: objParams.intInv,
      toType: 'customerpayment',
    });

    const environment = JSON.stringify(runtime.envType);
    const isSandbox = environment === runtime.EnvType.SANDBOX;
    const paymentOptionId = isSandbox ? 1133 : 21080;
    objPayment.setValue({ fieldId: 'paymentoption', value: paymentOptionId });

    var intLine = objPayment.findSublistLineWithValue({
      sublistId: 'credit',
      fieldId: 'internalid',
      value: objParams.intJE,
    });
    // log.audit('intLine',intLine)
    if (intLine >= 0) {
      objPayment.setSublistValue({ sublistId: 'credit', fieldId: 'apply', value: true, line: intLine });
      var fltCredit = objPayment.getSublistValue({ sublistId: 'credit', fieldId: 'amount', line: intLine });
      var fltDue = objPayment.getSublistValue({ sublistId: 'credit', fieldId: 'due', line: intLine });
      var fltTotal = objPayment.getSublistValue({ sublistId: 'credit', fieldId: 'total', line: intLine });
      var intLineApply = objPayment.findSublistLineWithValue({
        sublistId: 'apply',
        fieldId: 'internalid',
        value: objParams.intInv,
      });
      // log.debug('fltCredit',fltCredit);
      // log.debug('fltDue',fltDue);
      // log.debug('fltTotal',fltTotal);

      if (intLineApply >= 0) {
        objPayment.setSublistValue({ sublistId: 'apply', fieldId: 'amount', value: fltDue, line: intLineApply });
      }

      var intSavedPayment = objPayment.save();
      log.audit('intSavedPayment', intSavedPayment);

      return true;
    }

    return false;
  }

  return {
    afterSubmit: afterSubmit,
  };
});
