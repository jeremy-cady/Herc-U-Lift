/**
 * Copyright (c) 2025, ScaleNorth Advisors LLC and/or its affiliates. All rights reserved.
 * @NApiVersion 2.1
 * @NScriptType customglplugin
 *
 * @author ndejesus
 * @description custom gl plugin implementation for customer payment, this is used to reclassify line accounts for internal billing transactions
 *
 */

define(['N/search', 'N/record'], (search, record) => {
  /**
   * Runs a lookup to check the mapped internal wip and bill accounts
   * @param {string|number} revenueStreamId
   * @returns {{isInternal: boolean, internalAccounts: {billWip: null, billExpense: null}}}
   */
  function getInternalAccounts(revenueStreamId) {
    const lookupValue = search.lookupFields({
      type: 'customrecord_cseg_sna_revenue_st',
      id: revenueStreamId,
      columns: ['custrecord_sna_hul_int_bill_expense', 'custrecord_sna_hul_int_bill_wip', 'custrecord_sna_hul_revstreaminternal'],
    });

    const internalAccounts = {
      billWip: null,
      billExpense: null,
    };
    if (lookupValue.custrecord_sna_hul_int_bill_expense.length > 0) {
      internalAccounts.billExpense = lookupValue.custrecord_sna_hul_int_bill_expense[0].value;
    }

    if (lookupValue.custrecord_sna_hul_int_bill_wip.length > 0) {
      internalAccounts.billWip = lookupValue.custrecord_sna_hul_int_bill_wip[0].value;
    }

    return { isInternal: lookupValue.custrecord_sna_hul_revstreaminternal, internalAccounts };
  }

  /**
   *
   * @param {object} context
   * @param {Record} context.transactionRecord
   */
  function customizeGlImpact(context) {
    const { CUSTOMER_PAYMENT } = record.Type;
    const customerPayment = context.transactionRecord;
    log.audit({
      title: 'RECORD_TYPE_COMPARISON',
      details: {
        CUSTOMER_PAYMENT,
        TRANSACTION_TYPE: customerPayment.type,
      },
    });
    if (customerPayment.type != CUSTOMER_PAYMENT) return;

    try {
      const revenueStream = customerPayment.getValue({ fieldId: 'cseg_sna_revenue_st' });
      const revenueLookup = getInternalAccounts(revenueStream);
      if (!revenueLookup.isInternal) return; // not an internal revenue stream don't custom gl logic
      const { internalAccounts } = revenueLookup;
      const { customLines, standardLines } = context;
      log.audit({
        title: 'LINE_COUNT',
        details: { customLineCount: customLines.count, standardLineCount: standardLines.count },
      });

      const debitLines = [];
      const creditLines = [];
      for (let index = 0; index < standardLines.count; index++) {
        const line = standardLines.getLine({ index });
        const { departmentId, entityId, locationId, memo, taxAmount, debitAmount, creditAmount } = line;
        const lineProps = {
          departmentId,
          entityId,
          locationId,
          memo,
          taxAmount,
          revenueStream: line.getSegmentValueId({ segmentId: 'cseg_sna_revenue_st' }),
          hulManufacturer: line.getSegmentValueId({ segmentId: 'cseg_hul_mfg' }),
          equipmentCategory: line.getSegmentValueId({ segmentId: 'cseg_sna_hul_eq_seg' }),
        };
        log.audit({ title: 'dr_cr_values', details: { debitAmount, creditAmount } });
        if (creditAmount == 0) {
          lineProps.accountId = parseInt(internalAccounts.billExpense);
          lineProps.debitAmount = debitAmount;
          debitLines.push(lineProps);
        }
        if (debitAmount == 0) {
          lineProps.accountId = parseInt(internalAccounts.billWip);
          lineProps.creditAmount = creditAmount;
          creditLines.push(lineProps);
        }
      }
      log.audit({
        title: 'DEBIT_LINES',
        details: debitLines,
      });
      log.audit({
        title: 'CREDIT_LINES',
        details: creditLines,
      });

      // generate debit line items
      debitLines.forEach((debitLine) => {
        const { revenueStream, hulManufacturer, equipmentCategory, ...standardProps } = debitLine;
        const glLine = customLines.addNewLine();
        for (let [prop, value] of Object.entries(standardProps)) {
          glLine[prop] = value;
        }
        glLine.setSegmentValueId({ segmentId: 'cseg_sna_revenue_st', segmentValueId: revenueStream });
        glLine.setSegmentValueId({ segmentId: 'cseg_sna_hul_eq_seg', segmentValueId: equipmentCategory });
        glLine.setSegmentValueId({ segmentId: 'cseg_hul_mfg', segmentValueId: hulManufacturer });
      });

      // generate credit custom lines
      creditLines.forEach((creditLine) => {
        const { revenueStream, hulManufacturer, equipmentCategory, ...standardProps } = creditLine;
        const glLine = customLines.addNewLine();
        for (let [prop, value] of Object.entries(standardProps)) {
          glLine[prop] = value;
        }
        glLine.setSegmentValueId({ segmentId: 'cseg_sna_revenue_st', segmentValueId: revenueStream });
        glLine.setSegmentValueId({ segmentId: 'cseg_sna_hul_eq_seg', segmentValueId: equipmentCategory });
        glLine.setSegmentValueId({ segmentId: 'cseg_hul_mfg', segmentValueId: hulManufacturer });
      });
    }
    catch (err) {
      log.error({
        title: 'ERROR_IN_CUSTOM_GL_PLUGIN',
        details: {
          message: err.message,
          stack: err.stack,
        },
      });
    }
  }

  return {
    customizeGlImpact,
  };
});
