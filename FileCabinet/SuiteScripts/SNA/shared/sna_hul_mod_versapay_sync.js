/**
 * Copyright (c) 2025, ScaleNorth and/or its affiliates. All rights reserved.
 * @NApiVersion 2.1
 * @NModuleScope Public
 *
 *
 * @author ndejesus
 * @description
 *
 */

define(['N/search'], (search) => {
  /**
   * This function can be used to tick custbody_versapay_do_not_sync which prevents the syncing of transactions to versapay
   * @param context
   */
  function preventSyncForInternalRevenueStream(context) {
    const { newRecord } = context;
    const revenueStreamId = newRecord.getValue({ fieldId: 'cseg_sna_revenue_st' });
    if (!revenueStreamId) return;
    search.lookupFields
      .promise({
        type: 'customrecord_cseg_sna_revenue_st',
        id: revenueStreamId,
        columns: ['custrecord_sna_hul_revstreaminternal'],
      })
      .then((lookupData) => {
        const isInternal = lookupData.custrecord_sna_hul_revstreaminternal;
        newRecord.setValue({ fieldId: 'custbody_versapay_do_not_sync', value: isInternal });
      })
      .catch((err) => {
        log.error({
          title: 'ERROR_IN_REVENUE_STREAM_LOOKUP',
          details: {
            message: err.message,
            stack: err.stack,
          },
        });
      });
  }

  return { preventSyncForInternalRevenueStream };
});
