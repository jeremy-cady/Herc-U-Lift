/*
 * Copyright (c) 2024, ScaleNorth and/or its affiliates. All rights reserved.
 *
 * @author SNAImran
 *
 * Script brief description:
 * Module script for reclass WIP
 *
 * Revision History:
 *
 * Date              Issue/Case          Author          Issue Fix Summary
 * =============================================================================================
 * 2024/11/11       		            SNAImran         Initial version.
 *
 */

/**
 * @NApiVersion 2.1
 */
define(['N/record', 'N/search', 'N/runtime', 'N/https', 'N/file'],
    /**
     * @param{record} record
     * @param{search} search
     */
    (record, search, runtime, https, file) => {

        const SCRIPT_PARAMETERS = {
            API_SECRET_ID: 'custsecret_sna_hul_pd_api_key_1',
            API_BASE_URL: 'custscript_sna_hul_pd_api_url',
            PENDING_DOCUMENT_SEARCH: 'custscript_sna_hul_pd_pending_doc_search',
            SIGNED_DOCUMENT_FOLDER_ID: 'custscript_sna_pd_doc_ds_signed_doc_fold'
        };

        // SNA DOCUMENT STATUS
        const SNA_DOCUMENT_STATUS = {
            "document.draft": 7,
            "document.sent": 1,
            "document.viewed": 2,
            "document.waiting_approval": 3,
            "document.rejected": 4,
            "document.approved": 5,
            "document.completed":  6,
            "document.declined": 8,
            "document.external_review": 9,
            "document.voided": 10,
        }

        // PANDADOC API ENDPOINTS
        const PANDADOC_API_ENDPOINTS = {
          API_BASE_URL: 'https://api.pandadoc.com/public/v1',
          DOCUMENTS: '/documents',
          SEND_DOCUMENT: '/send',
          DOWNLOAD_DOCUMENT: '/download'
        };

        const SUITELET = {
            request_esginature : {
                script_id: 'customscript_sna_hul_sl_esign_request',
                deploy_id: 'customdeploy_sna_hul_sl_esign_request'
            }
        };

        /**
         * @function getPdDocumentDetails
         * @author Imran Khan
         */
        const getPdDocumentDetails = (docId) => {
            const sendDocumentApiResp = https.get({
                url: `${PANDADOC_API_ENDPOINTS.API_BASE_URL}${PANDADOC_API_ENDPOINTS.DOCUMENTS}/${docId}/details`,
                headers: {
                    Accept: 'application/json',
                    Authorization: https.createSecureString({ input: 'API-Key {custsecret_sna_hul_pd_api_key_1}' })
                }
            });
            return sendDocumentApiResp.body;
        };

        /**
         * @function handlePdDocStatus
         */
        const handlePdDocStatus = (mapValues) => {
            // {"internalid":{"value":"1500582","text":"1500582"},"tranid":"PQ063028","type":{"value":"Estimate","text":"Estimate"},"custbody_sna_pd_doc_status":{"value":"1","text":"Sent"},"custbody_sna_pd_doc_id":"GjWrmWq9vCxFDc3688oWi8"}
            const { custbody_sna_pd_doc_id, custbody_sna_pd_doc_status, tranid, type, internalid } = mapValues;
            const docStatus = getPdDocumentDetails(custbody_sna_pd_doc_id);
            return docStatus ? JSON.parse(docStatus) : {};
        };

        /**
         * @function updateDocStatusOnTransaction
         * @author Imran Khan
         */
        const updateDocStatusOnTransaction = (mapValues, pdfDocStatus) => {
            const { custbody_sna_pd_doc_id, custbody_sna_pd_doc_status, tranid, type, internalid } = mapValues;

            if(!pdfDocStatus?.status) return true;
            return record.submitFields({
                type: type?.value == 'Estimate' ? type?.value : 'salesorder',
                id: internalid?.value,
                values: {
                    custbody_sna_pd_doc_status: SNA_DOCUMENT_STATUS[pdfDocStatus?.status],
                },
                options: {
                    enableSourcing: false,
                    ignoreMandatoryFields : true
                }
            });
        };

        /**
         * @function getDocumentProps
         */
        const getDocumentProps = (funcParams) => {
            const transProps =  search.lookupFields({
                type: funcParams.record_type,
                id: funcParams.id,
                columns: ['customerMain.companyname', 'customerMain.email', 'customerMain.firstname', 'customerMain.lastname', 'tranid', 'amount']
            });

            return {
                companyName: transProps['customerMain.companyname'],
                firstName: transProps['customerMain.firstname'],
                lastName: transProps['customerMain.lastname'],
                email: transProps['customerMain.email'],
                amount: transProps['customerMain.amount'],
                docNo : transProps['customerMain.tranid']
            }
        };

        /**
         * @function generateMultiPartFormData
         * @param funcParams
         */
        const generateMultiPartFormData = (funcParams) => {
            const { transactionFile, pdfProps, webKitBoundary, transactionRcrd } = funcParams;
            const multiPartForm = [];

            const accepterFields = search.lookupFields({ type: 'customer', id: transactionRcrd.getValue({ fieldId: 'entity' }), columns: ['firstname', 'lastname', 'entityid', 'companyname', 'isperson', 'email']});
            const customerEmail = transactionRcrd.getValue({ fieldId: 'email' }) ||  accepterFields.email;

            const scriptObj = runtime.getCurrentScript();
            const scriptEmail = scriptObj.getParameter({name: 'custscript_sna_hul_pd_doc_rec_email'});

            if(!customerEmail) {
                // throw new Error('The customer email address does not exist. Kindly update the email address in the record.')
            }

            const dataObj = {
                "name": (transactionRcrd.getValue({ fieldId: 'tranid' })).replace(".pdf", ""),
                "recipients": [
                    {
                        "email": scriptEmail || customerEmail,
                        // "email": customerEmail,
                        "first_name": !accepterFields.isperson ? accepterFields.companyname : `${accepterFields.firstname}`,
                        "last_name": !accepterFields.isperson ? '' : `${accepterFields.lastname}`,
                        "role": "user",
                        "signing_order": 1
                    }
                ],
                "fields": {
                    "name": {
                        "value": !accepterFields.isperson ? accepterFields.companyname : `${accepterFields.firstname} ${accepterFields.lastname}`,
                        "role": "user"
                    },
                },
                "parse_form_fields": true
            };

            multiPartForm.push('--' + webKitBoundary);
            multiPartForm.push('Content-Disposition: form-data; name="file"' + '; filename="' + transactionRcrd.getValue({ fieldId: 'tranid' }) + '"');
            multiPartForm.push('Content-Type: application/pdf');
            multiPartForm.push('Content-Transfer-Encoding: base64'); // Indicate that the file is base64-encoded
            multiPartForm.push('');
            multiPartForm.push(transactionFile.getContents());
            multiPartForm.push('--' + webKitBoundary);
            multiPartForm.push('Content-Disposition: form-data; name="data"');
            multiPartForm.push('');
            multiPartForm.push(JSON.stringify(dataObj));
            multiPartForm.push('--' + webKitBoundary + '--');
            multiPartForm.push('');
            return multiPartForm;
        }

        /**
         * @function sendDocumentForeSignature
         */
        const sendDocumentForeSignature = (docId, pdfProps, transactionRcrd) => {

            const scriptObj = runtime.getCurrentScript();
            const scriptEmail = scriptObj.getParameter({name: 'custscript_sna_hul_pd_doc_rec_email'});

            const accepterFields = search.lookupFields({ type: 'customer', id: transactionRcrd.getValue({ fieldId: 'entity' }), columns: ['firstname', 'lastname', 'entityid', 'companyname', 'isperson', 'email']});

            const sendDocumentRequest = {
                "message": `${(transactionRcrd.getValue({ fieldId: 'tranid' })).replace(".pdf", "")} (${transactionRcrd.type}) document shared for E-signature - HERC-U-LIFT`,
                "subject": `Dear ${!accepterFields.isperson ? accepterFields.companyname : `${accepterFields.firstname} ${accepterFields.lastname}`},

                            Please find attached ${(transactionRcrd.getValue({ fieldId: 'tranid' })).replace(".pdf", "")} for your review and electronic signature.

                            Kindly take a moment to review the document, please sign it electronically to proceed.

                            Thank you for choosing HERC-U-LIFT.`,
                "silent": false,
                "forwarding_settings": {
                    "forwarding_allowed": false,
                    "forwarding_with_reassigning_allowed": false
                }
            };

            log.debug('sendDocumentRequest', sendDocumentRequest);

            const sendDocumentApiResp = https.post({
                url: `${PANDADOC_API_ENDPOINTS.API_BASE_URL}${PANDADOC_API_ENDPOINTS.DOCUMENTS}/${docId}${PANDADOC_API_ENDPOINTS.SEND_DOCUMENT}`,
                body: JSON.stringify(sendDocumentRequest),
                headers: {
                    Accept: 'application/json',
                    'Content-Type': 'application/json',
                    Authorization: https.createSecureString({ input: 'API-Key {custsecret_sna_hul_pd_api_key_1}' })
                }
            });

            log.debug('sendDocumentApiResp.body', sendDocumentApiResp.body);

            return sendDocumentApiResp.body;
        };

        /**
         * @function postDocumentInPandaDoc
         */
        const postDocumentInPandaDoc = (transactionFile, pdfProps, transactionRcrd) => {

            const webKitBoundary = '----WebKitFormBoundary7MA4YWxkTrZu0gW';
            const multiPartFormData = generateMultiPartFormData({ transactionFile, pdfProps, webKitBoundary, transactionRcrd });

            const postDocumentApiResp = https.post({
                url: `${PANDADOC_API_ENDPOINTS.API_BASE_URL}${PANDADOC_API_ENDPOINTS.DOCUMENTS}`,
                body: multiPartFormData.join('\r\n'),
                headers: {
                    Accept: 'application/json',
                    'Content-Type': 'multipart/form-data; boundary=----WebKitFormBoundary7MA4YWxkTrZu0gW',
                    Authorization: https.createSecureString({ input: `API-Key {custsecret_sna_hul_pd_api_key_1}` })
                }
            });

            return postDocumentApiResp.body ? JSON.parse(postDocumentApiResp.body) : {};
        };

        /**
         * @function delay
         * @param ms
         * @author Imran Khan
         */
        const delay = (ms) => {
            const start = new Date().getTime();
            while (new Date().getTime() - start < ms) {
                // Wait for the specified time to pass
            }
        }

        /**
         * @function delayedLoop
         * @author Imran Khan
         */
        const delayedLoop = (time) => {
            for (let i = 0; i < 5; i++) {
                delay(time); // Delay for 3 seconds
            }
        }

        /**
         * @function requestPandaDoceSignature
         * @param funcParams
         * @author Imran Khan
         */
        const requestPandaDoceSignature = (funcParams) => {
            const { id, record_type, render, templateId } = funcParams;
            log.debug('funcParams', funcParams);

            const myFile = render.create();
            const transactionRcrd = record.load({
                type: record_type,
                id: id
            });

            myFile.setTemplateByScriptId({ scriptId: templateId });
            myFile.addRecord('record', transactionRcrd);

            const transactionFile = myFile.renderAsPdf();

            const pdfProps = getDocumentProps({ id, record_type });

            if(!pdfProps.companyName && !pdfProps.firstName && !pdfProps.lastName) {
                throw new Error('Customer company name / first, last name is missing.')
            }

            const apiResponse = postDocumentInPandaDoc(transactionFile, pdfProps, transactionRcrd);
            if(apiResponse.id) {
                delayedLoop(3000);
                const sendDocumentApiResp = sendDocumentForeSignature(apiResponse?.id, pdfProps, transactionRcrd);
                record.submitFields({
                    type: record_type,
                    id: id,
                    values: {
                        custbody_sna_pd_doc_id: (apiResponse.id || '').toString(),
                        custbody_sna_pd_doc_status: SNA_DOCUMENT_STATUS["document.draft"],
                        custbody_sna_pd_api_resp: JSON.stringify(apiResponse)
                    },
                    options: {
                        enableSourcing: false,
                        ignoreMandatoryFields : true
                    }
                });
            };

            return apiResponse;
        };

        /**
         * @function saveSignedPDFDocument
         * @author Imran Khan
         */
        const saveSignedPDFDocument = (parsedValues, pdfDocumentDownloadResp, signedFolderId) => {
            const { internalid, custbody_sna_pd_doc_id, type, tranid } = parsedValues;
            const signedPdfFile = file.create({
                name: `${tranid}.pdf`,
                fileType: file.Type.PDF,
                contents: pdfDocumentDownloadResp.body,
                folder: signedFolderId,
                isOnline: true
            });

            return signedPdfFile.save();
        };

        /**
         * @function writePage
         * @author Imran Khan
         */
        const getPDFSignedCopy = (contextValues) => {
            let recordId = null;
            const { key, values } = contextValues;
            const scriptObj = runtime.getCurrentScript();
            const signedFolderId = scriptObj.getParameter({name: SCRIPT_PARAMETERS.SIGNED_DOCUMENT_FOLDER_ID })

            const parseValues = JSON.parse(values);

            const { internalid, custbody_sna_pd_doc_id, type } = parseValues;
            log.debug('getPDFSignedCopy => parseValues', parseValues);

            const pdfDocumentDownloadResp = https.get({
                url: `${PANDADOC_API_ENDPOINTS.API_BASE_URL}${PANDADOC_API_ENDPOINTS.DOCUMENTS}/${custbody_sna_pd_doc_id}/download`,
                headers: {
                    Accept: 'application/json',
                    'Content-Type': 'application/json',
                    Authorization: https.createSecureString({ input: `API-Key {custsecret_sna_hul_pd_api_key_1}` })
                }
            });

            const signedDocId = saveSignedPDFDocument(parseValues, pdfDocumentDownloadResp, signedFolderId);

            if(signedDocId) {

                record.attach({
                    record:{
                        type:'file',
                        id:signedDocId
                    },
                    to:{
                        type:'transaction',
                        id:internalid?.value
                    }
                });

                recordId = record.submitFields({
                    type: type?.value == 'Estimate' ? type?.value : 'salesorder',
                    id: internalid?.value,
                    values: {
                        custbody_sna_pd_document: signedDocId
                    },
                    options: {
                        enableSourcing: false,
                        ignoreMandatoryFields : true
                    }
                });
            }

            return recordId;
        };

        return {
            SCRIPT_PARAMETERS,
            SUITELET,
            handlePdDocStatus,
            updateDocStatusOnTransaction,
            getPDFSignedCopy,
            requestPandaDoceSignature
        }

    });