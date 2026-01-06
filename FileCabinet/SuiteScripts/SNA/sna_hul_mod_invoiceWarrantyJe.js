/**
 * Copyright (c) 2025, ScaleNorth Advisors LLC and/or its affiliates. All rights reserved.
 * @NApiVersion 2.1
 *
 *
 * @author noedejesus
 * @description Module used for creation of journal entries for warranty recognition in invoices
 *
 */

define(['N/runtime', 'N/search', 'N/record'], (runtime, search, record) => {
  /**
   *
   * @param {AfterSubmitContext} context
   */
  function createWarrantyJournalEntry(context) {
    const {
      type: contextType,
      UserEventType: { CREATE },
      newRecord: invoice,
    } = context;
    const user = runtime.getCurrentUser();
    const claimWarranty = user.getPreference({ name: 'custscript_sna_default_warranty_accnt' });

    const invoiceItems = getInvoiceLineItems(invoice);
    log.audit('createWArrantyJournalEntry:INVOICE_ITEMS', invoiceItems);
    const revenueStreamIds = [...new Set(invoiceItems.map(x => x.revenueStream).filter(x => !isEmpty(x)))];
    log.audit('createWarrantyJournalEntry:REVENUE_STREAM_IDS', { revenueStreamIds });
    const warrantyCriteriaByRevenueStream = getWarrantyCriteriaByRevenueStream(revenueStreamIds);
    log.audit('createWarrantyJournalEntry:WARRANTY_CRITERIA_BY_REVENUE_STREAM', warrantyCriteriaByRevenueStream);
    const serviceCodes = getServiceCodesByRevenueStream(revenueStreamIds);
    log.audit(`createWarrantyJournalEntry:SERVICE_CODES`, serviceCodes);
    const invoiceAccount = invoice.getValue({ fieldId: 'account' });
    const customer = invoice.getValue({ fieldId: 'job' }) || invoice.getValue({ fieldId: 'entity' });
    const jeLineItems = invoiceItems.reduce((a, b) => {
      const { revenueStream, serviceCode } = b;
      const forWarranty
        = warrantyCriteriaByRevenueStream.find(x => x.revenueStreamId == revenueStream)?.forWarranty || false;
      if (!forWarranty) return a;

      const glAccountLookup
        = serviceCodes.find(x => x.revenueStreamId == revenueStream && x.serviceCodeId == serviceCode)?.glAccount
          || null;
      let debitAccount = isEmpty(glAccountLookup) || b.forWarrantyClaim ? claimWarranty : glAccountLookup;
      a.push(
        {
          account: debitAccount,
          debit: b.amount,
          location: b.location,
          department: b.department,
          cseg_sna_revenue_st: b.revenueStream,
          cseg_hul_mfg: b.hulManufacturer,
          cseg_sna_hul_eq_seg: b.equipmentCategory,
          entity: customer,
        },
        {
          account: invoiceAccount,
          credit: b.amount,
          location: b.location,
          department: b.department,
          cseg_sna_revenue_st: b.revenueStream,
          cseg_hul_mfg: b.hulManufacturer,
          cseg_sna_hul_eq_seg: b.equipmentCategory,
          entity: customer,
        },
      );
      return a;
    }, []);
    log.audit('createWarrantyJournalEntry:JE_LINE_ITEMS', jeLineItems);

    const jeForWarranty = invoice.getValue({ fieldId: 'custbody_sna_jeforwarranty' });
    const recordDefaultProps = { type: record.Type.JOURNAL_ENTRY, isDynamic: true };
    const loadTransaction = contextType === CREATE || isEmpty(jeForWarranty);
    let journalEntry = loadTransaction
      ? record.create({ ...recordDefaultProps })
      : record.load({ ...recordDefaultProps, id: jeForWarranty });

    if (!loadTransaction) {
      log.audit('createWarrantyJournalEntry:EXISTING_TRANSACTION_CLEARING_LINES');
      clearJELineItems(journalEntry);
    }

    // invoiceFieldId : journalEntryFieldId
    const jeFieldValues = {
      subsidiary: invoice.getValue({ fieldId: 'subsidiary' }),
      cseg_sna_revenue_st: invoice.getValue({ fieldId: 'cseg_sna_revenue_st' }),
      custbody_sna_invforwarranty: invoice.id,
      custbody_sna_claim_id: invoice.getValue({ fieldId: 'custbody_sna_inv_claimid' }),
    };

    for (let [fieldId, value] of Object.entries(jeFieldValues)) {
      journalEntry.setValue({ fieldId, value });
    }

    let insertIndex = 0; // set this to zero to always insert on top if there are any transaction changes
    const sublistId = 'line';
    jeLineItems.forEach((lineItem) => {
      journalEntry.insertLine({ sublistId, line: insertIndex });
      for (let [fieldId, value] of Object.entries(lineItem)) {
        journalEntry.setCurrentSublistValue({ sublistId, fieldId, value });
      }
      journalEntry.commitLine({ sublistId });
      insertIndex++;
    });

    const currentLineCount = journalEntry.getLineCount({ sublistId });
    log.audit('createWarrantyJournalEntry:JE_LINE_COUNT', { currentLineCount });
    if (currentLineCount > 0) {
      const journalEntryId = journalEntry.save();
      record.submitFields
        .promise({
          type: record.Type.INVOICE,
          id: invoice.id,
          values: { custbody_sna_jeforwarranty: journalEntryId },
          options: { ignoreMandatoryFields: true },
        })
        .then(() => {
          log.audit('createWarrantyJournalEntry:JE_TAGGED', 'GENERATING_PAYMENT_TRANSACTION');
          createPaymentTransaction({ invoiceId: invoice.id, journalEntryId: journalEntryId });
        });
    }
  }

  /**
   * Removes all current line items from an existing journal entry record
   * @param {record.Record} journalEntry
   */
  function clearJELineItems(journalEntry) {
    let lineCount = journalEntry.getLineCount({ sublistId: 'line' });
    while (lineCount > 0) {
      journalEntry.removeLine({ sublistId: 'line', line: lineCount - 1 });
      lineCount--;
    }
  }

  /**
   *
   * @param invoice
   * @returns {*[{itemId: number, amount: number, avaTaxAmount: number, forWarrantyClaim: boolean, revenueStream: number, hulManufacturer: number, equipmentCategory: number, serviceCode: string}]}
   */
  function getInvoiceLineItems(invoice) {
    const sublistId = 'item';
    const lineCount = invoice.getLineCount({ sublistId });
    const lineItems = [];
    for (let line = 0; line < lineCount; line++) {
      lineItems.push({
        itemId: invoice.getSublistValue({ sublistId, line, fieldId: 'item' }),
        amount: invoice.getSublistValue({ sublistId, line, fieldId: 'amount' }),
        avaTaxAmount: invoice.getSublistValue({ sublistId, line, fieldId: 'custcol_ava_taxamount' }),
        forWarrantyClaim: invoice.getSublistValue({ sublistId, line, fieldId: 'custcol_sn_for_warranty_claim' }),
        revenueStream: invoice.getSublistValue({ sublistId, line, fieldId: 'cseg_sna_revenue_st' }),
        hulManufacturer: invoice.getSublistValue({ sublistId, line, fieldId: 'cseg_hul_mfg' }),
        equipmentCategory: invoice.getSublistValue({ sublistId, line, fieldId: 'cseg_sna_hul_eq_seg' }),
        serviceCode: invoice.getSublistValue({ sublistId, line, fieldId: 'custcol_sna_service_itemcode' }),
        department: invoice.getSublistValue({ sublistId, line, fieldId: 'department' }),
        location: invoice.getSublistValue({ sublistId, line, fieldId: 'location' }),
      });
    }
    return lineItems;
  }

  /**
   * Obtains the value for custrecord_sn_for_warranty by using revenueStreamIds
   * @param revenueStreamIds
   * @returns {*[{revenueStreamId: number, forWarranty: boolean}]}
   */
  function getWarrantyCriteriaByRevenueStream(revenueStreamIds = []) {
    if (isEmpty(revenueStreamIds)) return [];
    const searchObj = search.create({
      type: 'customrecord_cseg_sna_revenue_st',
      filters: [search.createFilter({ name: 'internalid', operator: search.Operator.ANYOF, values: revenueStreamIds })],
      columns: [
        search.createColumn({ name: 'internalid' }),
        search.createColumn({ name: 'custrecord_sn_for_warranty' }),
      ],
    });

    const data = [];
    searchObj.run().each((result) => {
      data.push({
        revenueStreamId: result.getValue({ name: 'internalid' }),
        forWarranty: result.getValue({ name: 'custrecord_sn_for_warranty' }),
      });
      return true;
    });
    return data;
  }

  /**
   * Returns account lookups from customsearch_sna_servicecode_lookup by using revenueStreamIds
   * @param revenueStreamIds
   * @returns {*[{revenueStreamId: number, serviceCodeId: number, glAccount: number}]}
   */
  function getServiceCodesByRevenueStream(revenueStreamIds = []) {
    if (isEmpty(revenueStreamIds)) return [];
    const searchObj = search.load({ id: 'customsearch_sna_servicecode_lookup' });
    searchObj.filters.push(
      search.createFilter({
        name: 'custrecord_sna_serv_code',
        operator: search.Operator.ANYOF,
        values: revenueStreamIds,
      }),
    );
    const data = [];
    searchObj.run().each((result) => {
      data.push({
        revenueStreamId: result.getValue({ name: 'custrecord_sna_serv_code' }),
        serviceCodeId: result.getValue({ name: 'custrecord_sna_ser_code_type' }),
        glAccount: result.getValue({ name: 'custrecord_sn_warranty_gl' }),
      });
    });
    return data;
  }

  /**
   *
   * @param {object} props
   * @param {number} props.invoiceId
   * @param {number} props.journalEntryId
   * @returns {number|null}
   */
  function createPaymentTransaction(props) {
    log.audit('createWarrantyJournalEntry:createPaymentTransaction:PROPS', props);
    const payment = record.transform({
      fromType: record.Type.INVOICE,
      toType: record.Type.CUSTOMER_PAYMENT,
      fromId: props.invoiceId,
    });

    let sublistId = 'credit';

    let lineCount = payment.getLineCount({ sublistId });
    let amountDue = 0;
    let linesMatched = 0;
    for (let line = 0; line < lineCount; line++) {
      const creditTransactionId = payment.getSublistValue({ sublistId, line, fieldId: 'internalid' });
      if (creditTransactionId == props.journalEntryId) {
        payment.setSublistValue({ sublistId, line, fieldId: 'apply', value: true });
        amountDue += Number(payment.getSublistValue({ sublistId, line, fieldId: 'due' }));
        linesMatched++;
      }
    }

    let paymentId = null;
    if (linesMatched > -1) {
      sublistId = 'apply';
      const invoiceIndex = payment.findSublistLineWithValue({
        sublistId,
        fieldId: 'internalid',
        value: props.invoiceId,
      });

      if (invoiceIndex > -1) {
        payment.setSublistValue({ sublistId, fieldId: 'amount', value: amountDue, line: invoiceIndex });
      }

      paymentId = payment.save();
      log.audit('createWarrantyJournalEntry:createPaymentTransaction:PAYMENT_RECORD_CREATED', { paymentId });
    }
    return paymentId;
  }

  function isEmpty(stValue) {
    return (
      stValue === ''
      || stValue == null
      || stValue == undefined
      || (stValue.constructor === Array && stValue.length == 0)
      || (stValue.constructor === Object
        && (function (v) {
          for (let k in v) return false;
          return true;
        })(stValue))
    );
  }

  return { createWarrantyJournalEntry };
});
