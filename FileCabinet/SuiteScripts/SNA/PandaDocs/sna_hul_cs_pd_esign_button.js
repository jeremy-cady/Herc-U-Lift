/*
 * Copyright (c) 2022, ScaleNorth Advisors LLC and/or its affiliates. All rights reserved.
 *
 * @author SNAImran
 *
 * Script brief description:
 * CS script that checks if the name is unique for the Item Category,
 * Customer Pricing Group and Item Discount Group custom records upon creation.
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
 * @NScriptType ClientScript
 * @NModuleScope SameAccount
 */
define(['N/search', 'N/currentRecord', 'N/https', 'N/ui/message', 'N/url', './modules/sna_hul_mod_pd'],
    /**
     * @param{search} search
     */
     (search, currentRecord, https, message ,url, sna_hul_mod_pd) => {

         const FILE_NAME = 'sna_hul_cs_pd_esign_button';

        /**
         * @function pageInit
         * @author Imran Khan
         */
        const pageInit = () => {

        };

        /**
         * @function requestESignature
         * @param scriptContext
         */
        const requestESignature = (templateId) => {
            const LOG_TITLE = `${FILE_NAME} => requestESignature`;
            try {
                console.log('templateId', templateId);
                const currentRcrd = currentRecord.get();
                const { id, type } = currentRcrd;

                const objMsgInfo = message.create({
                    title: 'Request for eSignature in Progress',
                    message: 'Request for eSignature has been submitted. Please wait for the page to load.',
                    type: message.Type.INFORMATION
                });

                objMsgInfo.show();

                const stURL = url.resolveScript({
                    scriptId: sna_hul_mod_pd.SUITELET.request_esginature.script_id,
                    deploymentId: sna_hul_mod_pd.SUITELET.request_esginature.deploy_id,
                    params: { action: 'eSignatureRequest', id , record_type: type, templateId }
                });
                console.log('stURL', stURL);

                https.post.promise({ url: stURL }).then(response => {
                    const objResponse = JSON.parse(response.body);
                    console.log('objResponse', objResponse);
                    if (objResponse.status === 'success') {
                        location.reload();
                    } else {
                        alert(objResponse.message);
                    }
                });
            } catch (exp) {
                console.error({
                    title: LOG_TITLE,
                    details: exp
                });
            }
        };

        return {
            pageInit,
            requestESignature
        };

    });
