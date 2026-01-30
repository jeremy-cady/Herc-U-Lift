/**
 * @NApiVersion 2.1
 * @NScriptType ClientScript
 * @NModuleScope SameAccount
 */
define([
  'SuiteScripts/HUL_DEV/Global/hul_swal',

  'SuiteScripts/HUL_DEV/Parts/hul_is_item_eligible_for sale_cs.js',
  'SuiteScripts/HUL_DEV/Parts/hul_hide_line_item_cols_on_create_cs.js',
  'SuiteScripts/sna_hul_cs_negative_disc.js',
  'SuiteScripts/HUL_DEV/Parts/CS_HandleClick.js',

  'SuiteScripts/HUL_DEV/Service/hul_salesorder_object_line_mapping_client.feature.js',
  'SuiteScripts/HUL_DEV/Global/hul_salesorder_revenue_stream_rollup_guard_client.feature.js'
], function (
  sweetAlert,
  isItemEligible,
  hideLineColumns,
  snaNegativeDiscount,
  sendToWebhook,
  objectLineMapper,
  revenueStreamRollupGuard
) {

  /*** ENTRY POINTS ***/
  function pageInit(ctx) {
    try {
      sweetAlert.preload();

      if (hideLineColumns && typeof hideLineColumns.pageInit === 'function') {
        hideLineColumns.pageInit(ctx);
      }

      if (isItemEligible && typeof isItemEligible.pageInit === 'function') {
        isItemEligible.pageInit(ctx);
      }

      if (revenueStreamRollupGuard && typeof revenueStreamRollupGuard.pageInit === 'function') {
        revenueStreamRollupGuard.pageInit(ctx);
      }
    } catch (e) {
      console.error('[DISPATCHER] pageInit error:', e);
    }
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
    } catch (e) {
      console.error('[DISPATCHER] validateLine error:', e);
      return true;
    }
  }

  function fieldChanged(ctx) {
    try {
      // Only call feature scripts for fields they actually care about
      // This reduces unnecessary function calls

      // objectLineMapper - only call for specific fields if needed
      if (objectLineMapper && typeof objectLineMapper.fieldChanged === 'function') {
        objectLineMapper.fieldChanged(ctx);
      }

      // revenueStreamRollupGuard - only for revenue stream field
      if (ctx.fieldId === 'cseg_sna_revenue_st' &&
          revenueStreamRollupGuard &&
          typeof revenueStreamRollupGuard.fieldChanged === 'function') {
        revenueStreamRollupGuard.fieldChanged(ctx);
      }
    } catch (e) {
      console.error('[DISPATCHER] fieldChanged error:', e);
    }
    return true;
  }

  return {
    pageInit: pageInit,
    validateLine: validateLine,
    fieldChanged: fieldChanged
  };
});