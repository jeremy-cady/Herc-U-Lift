/*
 * Copyright (c) 2023, ScaleNorth Advisors LLC and/or its affiliates. All rights reserved.
 *
 * @author aduldulao
 *
 * Script brief description:
 * SL script to custom close return authorization to trigger UE script
 *
 * Revision History:
 *
 * Date              Issue/Case          Author          Issue Fix Summary
 * =============================================================================================
 * 2023/6/22       		                 aduldulao       Initial version.
 *
 */

/**
 * @NApiVersion 2.1
 * @NScriptType Suitelet
 */
define(['N/record', 'N/redirect'],
    /**
 * @param{record} record
 */
    (record, redirect) => {
        /**
         * Defines the Suitelet script trigger point.
         * @param {Object} scriptContext
         * @param {ServerRequest} scriptContext.request - Incoming request
         * @param {ServerResponse} scriptContext.response - Suitelet response
         * @since 2015.2
         */
        const onRequest = (scriptContext) => {
            var params = scriptContext.request.parameters;
            log.debug({title: 'GET - params', details: JSON.stringify(params)});

            var rmaid = params.recid;

            var rec = record.load({type: record.Type.RETURN_AUTHORIZATION, id: rmaid});

            var itmlen = rec.getLineCount({sublistId: 'item'});
            for (var i = 0; i < itmlen; i++) {
                rec.setSublistValue({sublistId: 'item', fieldId: 'isclosed', value: true, line: i});
            }

            rec.save({enableSourcing: true, ignoreMandatoryFields: true});
            log.debug({title: 'afterSubmit', details: 'Return authorization saved: ' + rmaid});

            redirect.toRecord({
                type: record.Type.RETURN_AUTHORIZATION,
                id: rmaid,
            });
        }

        return {onRequest}

    });
