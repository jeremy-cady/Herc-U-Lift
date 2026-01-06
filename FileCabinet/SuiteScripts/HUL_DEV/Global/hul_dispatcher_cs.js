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
  'SuiteScripts/HUL_DEV/Parts/CS_HandleClick.js'
], function (isItemEligible, hideLineColumns, snaNegativeDiscount, customerCreditCardCheck, sendToWebhook) {

  /*** CONFIG ***/
  var FORM_ID = '121';
  // internal IDs for terms that truly require a credit card
  var TERMS_REQUIRE_CC = { '8': true };

  /*** LOGGING ***/
  var LOG = [];
  function log() {
    try {
      var msg = Array.prototype.slice.call(arguments).map(function (x) {
        try { return (typeof x === 'object') ? JSON.stringify(x) : String(x); }
        catch (_e) { return String(x); }
      }).join(' ');
      LOG.push(msg);
      console.log('[CC-GATE]', msg); // eslint-disable-line no-console
      window.HUL_CC_LOGS = LOG;
    } catch (_e) {}
  }
  function g(rec, sublistId, fieldId, line) {
    try {
      return rec.getSublistValue({ sublistId: sublistId, fieldId: fieldId, line: line });
    } catch (e) {
      log('getSublistValue error', JSON.stringify({ sublistId: sublistId, fieldId: fieldId, line: line, err: String(e && e.message || e) }));
      return undefined;
    }
  }

  /*** CARD DETECTION (paymentinstruments only; ID-ONLY filter) ***/
  // function customerHasCard(customerRec) {
  //   try {
  //     var sub = 'paymentinstruments';
  //     var n = 0;
  //     try {
  //       n = customerRec.getLineCount({ sublistId: sub }) || 0;
  //     } catch (eCnt) {
  //       log('PI.getLineCount error:', String(eCnt && eCnt.message || eCnt), '→ assume HAS CARD (fail-open)');
  //       return true; // fail-open to avoid false blocks
  //     }
  //     log('PI.count =', n);

  //     for (var i = 0; i < n; i++) {
  //       var row = {
  //         instrumenttype: g(customerRec, sub, 'instrumenttype', i),
  //         type:           g(customerRec, sub, 'type', i),
  //         cardbrand:      g(customerRec, sub, 'cardbrand', i),
  //         paymentinstrument: g(customerRec, sub, 'paymentinstrument', i),
  //         state:          g(customerRec, sub, 'state', i),
  //         isdefault:      g(customerRec, sub, 'isdefault', i)
  //       };

  //       // redact sensitive value for logs
  //       var safe = Object.assign({}, row);
  //       if (safe.paymentinstrument) {
  //         var s = String(safe.paymentinstrument);
  //         if (s.length > 6) safe.paymentinstrument = s.slice(0, 2) + '…' + s.slice(-4);
  //       }
  //       log('PI[' + i + ']', safe);

  //       // ID-only check: instrumenttype must be '1' or '3'
  //       var tId = String(row.instrumenttype == null ? '' : row.instrumenttype);
  //       if (tId === '1' || tId === '3') {
  //         log('PI[' + i + '] → CREDIT CARD by instrumenttype ID');
  //         return true;
  //       }
  //     }
  //     log('Result: no CC detected on customer (instrumenttype != 1|3).');
  //     return false;
  //   } catch (e) {
  //     log('customerHasCard fatal:', String(e && e.message || e), '→ assume HAS CARD (fail-open)');
  //     return true;
  //   }
  // }

  /*** SAFE GATE (loads customer only on save; edit = logs only) ***/
  // function evaluateGate(currentRecord) {
  //   try {
  //     var formId   = String(currentRecord.getValue({ fieldId: 'customform' }) || '');
  //     var entityId = String(currentRecord.getValue({ fieldId: 'entity' }) || '');
  //     var soTerms  = String(currentRecord.getValue({ fieldId: 'terms' }) || '');

  //     log('Eval: form=', formId, ' entity=', entityId, ' soTerms=', soTerms, ' requiresBySO=', !!TERMS_REQUIRE_CC[soTerms]);

  //     if (formId !== FORM_ID) return { allow: true, reason: 'other-form' };
  //     if (!entityId)          return { allow: true, reason: 'no-entity' };

  //     var rec = require('N/record');
  //     var cust = rec.load({ type: rec.Type.CUSTOMER, id: entityId });

  //     var requires = !!TERMS_REQUIRE_CC[soTerms];
  //     if (!requires) {
  //       var custTerms = String(cust.getValue({ fieldId: 'terms' }) || '');
  //       requires = !!TERMS_REQUIRE_CC[custTerms];
  //       log('Eval: custTerms=', custTerms, ' requiresByCustomer=', !!TERMS_REQUIRE_CC[custTerms]);
  //     }

  //     if (!requires) return { allow: true, reason: 'terms-dont-require' };

  //     var hasCard = customerHasCard(cust);
  //     return { allow: hasCard, reason: hasCard ? 'has-card' : 'needs-card', formId: formId, soTerms: soTerms };

  //   } catch (e) {
  //     log('evaluateGate fatal:', String(e && e.message || e), '→ allow (fail-open)');
  //     return { allow: true, reason: 'exception-fail-open' };
  //   }
  // }

  /*** ENTRY POINTS ***/
  function pageInit(ctx) {
    try {
      // no hul_swal preload here (avoids AMD timeout)
      if (hideLineColumns && typeof hideLineColumns.pageInit === 'function') {
        hideLineColumns.pageInit(ctx);
      }
      // edit-time: log only, no blocking and no customer load here
      try {
        var formId = String(ctx.currentRecord.getValue({ fieldId: 'customform' }) || '');
        var entityId = String(ctx.currentRecord.getValue({ fieldId: 'entity' }) || '');
        var soTerms  = String(ctx.currentRecord.getValue({ fieldId: 'terms' }) || '');
        log('Init snapshot:', { formId: formId, entityId: entityId, soTerms: soTerms });
      } catch (_eSnap) {}
      // if (customerCreditCardCheck && typeof customerCreditCardCheck.pageInit === 'function') {
      //   customerCreditCardCheck.pageInit(ctx);
      //}
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

  function fieldChanged(_ctx) { return true; } // quiet

  function postSourcing(ctx) {
    try {
      var isBody = !ctx.sublistId;
      if (isBody && (ctx.fieldId === 'entity' || ctx.fieldId === 'terms')) {
        // log-only on edit, do not load customer or block here
        var formId = String(ctx.currentRecord.getValue({ fieldId: 'customform' }) || '');
        var entityId = String(ctx.currentRecord.getValue({ fieldId: 'entity' }) || '');
        var soTerms  = String(ctx.currentRecord.getValue({ fieldId: 'terms' }) || '');
        log('postSourcing snapshot:', { changed: ctx.fieldId, formId: formId, entityId: entityId, soTerms: soTerms });
        if (customerCreditCardCheck && typeof customerCreditCardCheck.postSourcing === 'function') {
          customerCreditCardCheck.postSourcing(ctx);
        }
      }
    } catch (_e) {}
  }

  // function saveRecord(ctx) {
  //   try {
  //     var res = evaluateGate(ctx.currentRecord);
  //     log('Save decision:', res);

  //     if (!res.allow && res.reason === 'needs-card') {
  //       // Try SweetAlert2 if globally available; otherwise native alert
  //       try {
  //         var Swal = window.Swal || window.Sweetalert2 || window.SweetAlert2 || null;
  //         if (Swal && typeof Swal.fire === 'function') {
  //           Swal.fire({
  //             icon: 'warning',
  //             title: 'Credit Card Required',
  //             html: 'This customer is on a term that requires a credit card on file.',
  //             confirmButtonText: 'OK',
  //             heightAuto: false,
  //             allowOutsideClick: false
  //           });
  //         } else {
  //           alert('Credit Card required: customer has no payment card on file.');
  //         }
  //       } catch (_eSwal) {}
  //       return false; // confident block
  //     }

  //     if (customerCreditCardCheck && typeof customerCreditCardCheck.saveRecord === 'function') {
  //       var ok2 = customerCreditCardCheck.saveRecord(ctx);
  //       if (ok2 === false) return false;
  //     }
  //     return true;

  //   } catch (_e) {
  //     // fail-open on unexpected issues
  //     return true;
  //   }
  // }

  return {
    pageInit: pageInit,
    validateLine: validateLine,
    fieldChanged: fieldChanged,
    postSourcing: postSourcing,
    // saveRecord: saveRecord
  };
});
