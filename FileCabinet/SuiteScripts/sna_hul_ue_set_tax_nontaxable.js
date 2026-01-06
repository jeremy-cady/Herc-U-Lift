/**
 * @NApiVersion 2.1
 * @NScriptType UserEventScript
 */
/**
 * Copyright (c) 2023, ScaleNorth Advisors LLC and/or its affiliates. All rights reserved.
 *
 * @author Care Parba
 *
 * Script brief description:
 * This User Event script sets the line tax code field to Not Taxable if revenue stream is Internal
 *
 * Revision History:
 *
 * Date            Issue/Case        Author              Issue Fix Summary
 * =============================================================================================
 * 2023/12/18                        Care Parba          Initial version
 *
 */
define(['N/record', 'N/search', 'N/url', 'N/redirect'],
    /**
     * @param{record} record
     * @param{search} search
     * @param{url} url
     * @param{redirect} redirect  */
    (record, search, url, redirect) => {
        const afterSubmit = (scriptContext) => { //beforeSubmit
            const LOG_TITLE = "afterSubmit";

            log.debug({title: LOG_TITLE, details: "===========START==========="});

            if(scriptContext.type === scriptContext.UserEventType.DELETE){
                return;
            }

            try {
                redirect.toSuitelet({
                    scriptId: 'customscript_sna_hul_sl_set_nontaxable',
                    deploymentId: 'customdeploy_sna_hul_sl_set_nontaxable',
                    parameters: {
                        'custparam_recordId': scriptContext.newRecord.id,
                        'custparam_recordType': scriptContext.newRecord.type
                    }
                })

            } catch (error) {
                log.error({title: LOG_TITLE, details: `Error: ${error}`});
            }

            log.debug({title: LOG_TITLE, details: "===========END==========="});
        }

        return { afterSubmit }

    });
