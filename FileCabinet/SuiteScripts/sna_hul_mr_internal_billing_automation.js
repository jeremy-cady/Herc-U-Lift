/**
 * Copyright (c) 2025, ScaleNorth Advisors LLC and/or its affiliates. All rights reserved.
 * @NApiVersion 2.1
 * @NScriptType MapReduceScript
 *
 *
 * @author
 * @description Script used for MapReduce event of generating customer payments automatically for invoices.
 * This is a scheduled map/script scheduled on a daily basis
 *
 */
define(['N/runtime', 'N/search', 'N/record'], (runtime, search, record) => {
  const InternalBillingStatus = {
    SCHEDULED: 1,
    IN_PROGRESS: 2,
    FAILED: 3,
    COMPLETED: 4,
  };

  function isEmpty(stValue) {
    return (
      stValue === '' ||
      stValue == null ||
      stValue == undefined ||
      (stValue.constructor === Array && stValue.length == 0) ||
      (stValue.constructor === Object &&
        (function (v) {
          for (let k in v) return false;
          return true;
        })(stValue))
    );
  }

  /**
   * Utility function for pulling all s
   * @param resultSet
   * @returns {result[]}
   */
  const getAllSearchResults = (resultSet) => {
    let batch,
      batchResults,
      results = [],
      searchStart = 0;
    do {
      batch = resultSet.getRange({ start: searchStart, end: searchStart + 1000 });
      batchResults = (batch || []).map(function (row) {
        searchStart++;
        return row;
      }, this);
      results = results.concat(batchResults);
    } while ((batchResults || []).length === 1000);

    return results;
  };

  /**
   * Higher order function to be used for map array function call.
   * @param {Result} result
   * @returns {GetInputDataValue}
   */
  const mapSearchResults = (result) => {
    const columns = result.columns;
    return {
      invoiceId: result.getValue(columns[0]),
      tranId: result.getValue(columns[1]),
      date: result.getValue(columns[2]),
      type: result.getValue(columns[3]),
      customerId: result.getValue(columns[4]),
      customerName: result.getText(columns[5]),
      revenueStream: result.getValue(columns[6]),
      hulManuf: result.getValue(columns[7]),
      equipmentCategory: result.getValue(columns[8]),
      amount: Number(result.getValue(columns[9])),
      account: result.getValue(columns[10]),
      lines: result.getValue(columns[11]),
      taxAmount: Number(result.getValue(columns[12])),
      amountAndAvalara: Number(result.getValue(columns[13])),
    };
  };

  /**
   * @typedef {object} GetInputDataValue
   * @property {number} invoiceId
   * @property {string} tranid
   * @property {string} date
   * @property {type} string
   * @property {number} customerId
   * @property {string} customerName
   * @property {number} department
   * @property {number} revenueStream
   * @property {number} hulManuf
   * @property {number} equipmentCategory
   * @property {number} amount
   * @property {number} account
   * @property {string} lines
   * @property {number} taxAmount
   * @property {number} amountAndAvalara
   */

  const getInputData = (inputContext) => {
    const script = runtime.getCurrentScript();
    /**
     * The saved search internal id specified on the deployment script parameters
     * @type {number}
     */
    const searchId = script.getParameter({ name: 'custscript_sna_internal_bill_search' });

    if (isEmpty(searchId)) {
      log.audit({
        title: 'NO_SEARCH_ID_SPECIFIED',
      });
      return [];
    }

    const searchObj = search.load({ id: searchId });
    const results = getAllSearchResults(searchObj.run());
    const data = results.map(mapSearchResults);
    return data;
  };

  /**
   *
   * @param mapContext
   * @returns {null|*[]}
   */
  const map = (mapContext) => {
    log.audit({
      title: 'MAP_CONTEXT_VALUE',
      details: mapContext.value,
    });

    /**
     * @type {GetInputDataValue}
     */
    const contextData = JSON.parse(mapContext.value);
    try {
      record.submitFields
        .promise({
          type: record.Type.INVOICE,
          id: contextData.invoiceId,
          values: {
            custbody_versapay_do_not_sync: true,
          },
        })
        .then((invoiceId) => {
          log.audit('INVOICE_FLAGGED_TO_NOT_SYNC_TO_VP', { invoiceId });
        })
        .catch((err) => {
          log.error({
            title: 'ERROR_FLAGGING_INVOICE_TO_NOT_SYNC_TO_VP',
            details: {
              message: err.message,
              stack: err.stack,
            },
          });
        });
    } catch (err) {
      log.error({
        title: 'UNEXPECTED_ERROR:mapstage',
        details: {
          message: err.message,
          stack: err.stack,
        },
      });
    }
    const fieldValues = {
      custrecord_sna_hul_linked_invoice: contextData.invoiceId,
      custrecord_sna_hul_revenue_stream: contextData.revenueStream,
      custrecord_sna_hul_eq_cat_group: contextData.equipmentCategory,
      custrecord_sna_hul_manufacturer: contextData.hulManuf,
      custrecord_sna_hul_amt_credit: contextData.amountAndAvalara,
      custrecord_sna_hul_customer: contextData.customerId,
      custrecord_sna_internal_billing_line_id: contextData.lines,
      custrecord_sna_hul_internal_bill_status: InternalBillingStatus.SCHEDULED,
      custrecord_sna_hul_meta_data: mapContext.value,
    };
    const internalBillingTask = record.create({ type: 'customrecord_sna_hul_internal_billing' });
    for (let [fieldId, value] of Object.entries(fieldValues)) {
      internalBillingTask.setValue({ fieldId, value });
    }
    internalBillingTask.save
      .promise({ ignoreMandatoryFields: true })
      .then((internalBillingTaskId) => {
        mapContext.write({ key: internalBillingTaskId, value: contextData });
      })
      .catch((err) => {
        log.error({
          title: 'ERROR_CREATING_INTERNAL_BILLING_TASK',
          details: {
            message: err.message,
            stack: err.stack,
            fieldValues,
          },
        });
      });
  };

  /**
   * Updates the Internal Billing Task Record Status
   * @param {object} internalTaskProps
   * @param {string} internalTaskProps.type
   * @param {number} internalTaskProps.id
   * @param {object} internalTaskProps.values - field values to update
   */
  function updateInternalBillingTask(internalTaskProps) {
    record.submitFields
      .promise(internalTaskProps)
      .then(() => {
        log.audit('INTERNAL_BILLING_TASK_UPDATED', { internalTaskProps });
      })
      .catch((err) => {
        log.error({
          title: 'UPDATE_BILLING_TASK_FAILED',
          details: { message: err.message, stack: err.stack, props: internalTaskProps },
        });
      });
  }

  /**
   *
   * @param {object} reduceContext
   */
  const reduce = (reduceContext) => {
    const key = reduceContext.key;
    const values = reduceContext.values.map((x) => JSON.parse(x));
    log.audit({
      title: 'REDUCE_VALUES',
      details: { key, values },
    });
    /**
     * @type {GetInputDataValue}
     */
    const value = values[0];
    const revenueStream = value.revenueStream;
    let internalBillDepartment;
    let internalBillAccount;
    let internalExpenseAccount;

    if (!isEmpty(revenueStream)) {
      const {
        custrecord_sna_hul_int_bill_dept: internalDeptLookup,
        custrecord_sna_hul_int_bill_wip: internalWipLookup,
        custrecord_sna_hul_int_bill_expense: internalExpenseLookup,
      } = search.lookupFields({
        type: 'customrecord_cseg_sna_revenue_st',
        id: revenueStream,
        columns: [
          'custrecord_sna_hul_int_bill_dept',
          'custrecord_sna_hul_int_bill_wip',
          'custrecord_sna_hul_int_bill_expense',
        ],
      });
      if (!isEmpty(internalDeptLookup)) {
        internalBillDepartment = internalDeptLookup[0].value;
      }
      if (!isEmpty(internalWipLookup)) {
        internalBillAccount = internalWipLookup[0].value;
      }

      if (!isEmpty(internalExpenseLookup)) {
        internalExpenseAccount = internalExpenseLookup[0].value;
      }
      log.audit({
        title: 'revenue_stream_lookup',
        details: { revenueStream, internalBillDepartment, internalBillAccount, internalExpenseAccount },
      });
    }

    const fieldValues = {
      account: internalBillAccount,
      aracct: value.account,
      cseg_sna_revenue_st: value.revenueStream,
      cseg_sna_hul_eq_seg: value.equipmentCategory,
      cseg_hul_mfg: value.hulManuf,
      department: internalBillDepartment || value.department, // invoice department
      memo: 'Internal Billing',
      paymentoption: 21080 || null,
      custbody_versapay_do_not_sync: true,
    };
    const customerPayment = record.transform({
      fromType: record.Type.INVOICE,
      toType: record.Type.CUSTOMER_PAYMENT,
      fromId: value.invoiceId,
    });
    for (let [fieldId, value] of Object.entries(fieldValues)) {
      customerPayment.setValue({ fieldId, value });
    }
    const sublistId = 'apply';
    const lineCount = customerPayment.getLineCount({ sublistId });
    for (let line = 0; line < lineCount; line++) {
      const transactionId = customerPayment.getSublistValue({ fieldId: 'doc', sublistId, line });
      if (transactionId != value.invoiceId) continue; // skip to next line
      customerPayment.setSublistValue({
        fieldId: 'apply',
        value: true,
        sublistId,
        line,
      });
      customerPayment.setSublistValue({
        fieldId: 'amount',
        value: value.amountAndAvalara,
        sublistId,
        line,
      });
      break; // stop iteration once set
    }

    const updateProps = {};
    const submitFieldProps = { type: 'customrecord_sna_hul_internal_billing', id: key };
    try {
      const customerPaymentId = customerPayment.save();
      log.audit({ title: 'CUSTOMER_PAYMENT_GENERATED', details: customerPaymentId });
      updateProps.custrecord_sna_hul_linked_payment = customerPaymentId;
      updateProps.custrecord_sna_hul_internal_bill_status = InternalBillingStatus.IN_PROGRESS;
      submitFieldProps.values = updateProps;
      updateInternalBillingTask(submitFieldProps);
    } catch (err) {
      const errorDetails = { message: err.message, stack: err.stack };
      log.error({
        title: 'ERROR_SAVING_CUSTOMER_PAYMENT',
        details: errorDetails,
      });
      updateProps.custrecord_sna_hul_error_logs = JSON.stringify(errorDetails);
      updateProps.custrecord_sna_hul_internal_bill_status = InternalBillingStatus.FAILED;
      submitFieldProps.values = updateProps;
      updateInternalBillingTask(submitFieldProps);
    }
  };

  return { getInputData, map, reduce };
});
