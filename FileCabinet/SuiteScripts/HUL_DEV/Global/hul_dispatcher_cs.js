/**
 * @NApiVersion 2.1
 * @NScriptType ClientScript
 * @NModuleScope SameAccount
 */
define([
  // ⚠️ Removed hul_swal.js to avoid AMD timeout
  'SuiteScripts/HUL_DEV/Parts/hul_is_item_eligible_for sale_cs.js',
  'SuiteScripts/HUL_DEV/Parts/hul_hide_line_item_cols_on_create_cs.js',
  'SuiteScripts/sna_hul_cs_negative_disc.js',
  // 'SuiteScripts/HUL_DEV/Rental/hul_customer_credit_card_check_cs.js',
  'SuiteScripts/HUL_DEV/Parts/CS_HandleClick.js',

  // ✅ NEW feature module
  'SuiteScripts/HUL_DEV/Service/hul_salesorder_object_line_mapping_client.feature.js'
], function (
  isItemEligible,
  hideLineColumns,
  snaNegativeDiscount,
  /* customerCreditCardCheck, */
  sendToWebhook,
  objectLineMapper
) {

  /*** CONFIG ***/
  var FORM_ID = '121';
  var TERMS_REQUIRE_CC = { '8': true };

  /*** LOGGING ***/
  var LOG = [];
  function log() {
    try {
      var msg = Array.prototype.slice.call(arguments).map(function (x) {
        try {
          return (typeof x === 'object') ? JSON.stringify(x) : String(x);
        } catch (_e) {
          return String(x);
        }
      }).join(' ');
      LOG.push(msg);
      console.log('[CC-GATE]', msg); // eslint-disable-line no-console
      window.HUL_CC_LOGS = LOG;
    } catch (_e) {}
  }

  function g(rec, sublistId, fieldId, line) {
    try {
      return rec.getSublistValue({
        sublistId: sublistId,
        fieldId: fieldId,
        line: line
      });
    } catch (e) {
      log('getSublistValue error', JSON.stringify({
        sublistId: sublistId,
        fieldId: fieldId,
        line: line,
        err: String(e && e.message || e)
      }));
      return undefined;
    }
  }

  /*** ENTRY POINTS ***/
  function pageInit(ctx) {
    try {
      if (hideLineColumns && typeof hideLineColumns.pageInit === 'function') {
        hideLineColumns.pageInit(ctx);
      }

      try {
        var formId = String(ctx.currentRecord.getValue({ fieldId: 'customform' }) || '');
        var entityId = String(ctx.currentRecord.getValue({ fieldId: 'entity' }) || '');
        var soTerms  = String(ctx.currentRecord.getValue({ fieldId: 'terms' }) || '');
        log('Init snapshot:', { formId: formId, entityId: entityId, soTerms: soTerms });
      } catch (_eSnap) {}

    } catch (_e) {}
  }

  function validateLine(ctx) {
    try {
      if (snaNegativeDiscount && typeof snaNegativeDiscount.validateLine === 'function') {
        snaNegativeDiscount.validateLine(ctx);
      }

      var ok = true;
      if (isItemEligible && typeof isItemEligible.validateLine === 'function') {
        ok = isItemEligible.validateLine(ctx);
      }
      return !!ok;
    } catch (_e) {
      return true;
    }
  }

  function fieldChanged(ctx) {
    try {
      if (objectLineMapper && typeof objectLineMapper.fieldChanged === 'function') {
        objectLineMapper.fieldChanged(ctx);
      }
    } catch (_e) {}
    return true;
  }

  function postSourcing(ctx) {
    try {
      var isBody = !ctx.sublistId;
      if (isBody && (ctx.fieldId === 'entity' || ctx.fieldId === 'terms')) {
        var formId = String(ctx.currentRecord.getValue({ fieldId: 'customform' }) || '');
        var entityId = String(ctx.currentRecord.getValue({ fieldId: 'entity' }) || '');
        var soTerms  = String(ctx.currentRecord.getValue({ fieldId: 'terms' }) || '');
        log('postSourcing snapshot:', {
          changed: ctx.fieldId,
          formId: formId,
          entityId: entityId,
          soTerms: soTerms
        });

        // if (customerCreditCardCheck && typeof customerCreditCardCheck.postSourcing === 'function') {
        //   customerCreditCardCheck.postSourcing(ctx);
        // }
      }
    } catch (_e) {}
  }

  return {
    pageInit: pageInit,
    validateLine: validateLine,
    fieldChanged: fieldChanged,
    postSourcing: postSourcing
    // saveRecord intentionally omitted
  };
});