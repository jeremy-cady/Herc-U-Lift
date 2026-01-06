/*
 * Copyright (c) 2023, ScaleNorth Advisors LLC and/or its affiliates. All rights reserved.
 *
 * @author SNAImran
 *
 * Script brief description:
 *
 * Revision History:
 *
 * Date              Issue/Case          Author          Issue Fix Summary
 * =============================================================================================
 * 2024/11/11       		             SNAImran       Initial version.
 *
 */

/**
 * @NApiVersion 2.1
 * @NScriptType Suitelet
 */
define(['N/record', 'N/render', './modules/sna_hul_mod_pd'],

    /**
     * @param{record} record
     */
    (record, render, sna_hul_mod_pd) => {

        const FILE_NAME = 'sna_hul_sl_pd_esign';

        /**
         * Defines the Suitelet script trigger point.
         * @param {Object} scriptContext
         * @param {ServerRequest} scriptContext.request - Incoming request
         * @param {ServerResponse} scriptContext.response - Suitelet response
         * @since 2015.2
         */
        const onRequest = (scriptContext) => {
            const LOG_TITLE = `${FILE_NAME} => onRequest`;

            const { request } = scriptContext;
            const { action, id , record_type, templateId } = request.parameters;
            const objResponse = scriptContext.response;

            let objProcessResponse = {
                status: 'success',
                data: '',
                message: ''
            };

            try {
                switch (action) {
                    case 'eSignatureRequest':
                        const response = sna_hul_mod_pd.requestPandaDoceSignature({ id, record_type, render, templateId });
                        objProcessResponse.data = response;
                        objProcessResponse.message = 'Requested: eSignature requested successfully.'
                        break;
                    default:
                        sna_hul_mod_pd.writePage(objPopUpForm);
                }
            } catch (e) {
                let stErrorMsg =
                    e.name !== null && e.name !== '' ? `${e.name}: ${e.message}` : `UnexpectedError: ${e.message}`;
                log.error({ title: LOG_TITLE, details: stErrorMsg });
                objProcessResponse.status = 'failed';
                objProcessResponse.data = null;
                objProcessResponse.message = stErrorMsg;
            }
            objResponse.write(JSON.stringify(objProcessResponse));
        }

        return {onRequest}

    });