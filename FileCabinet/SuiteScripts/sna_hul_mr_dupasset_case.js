/*
 * Copyright (c) 2024, ScaleNorth Advisors LLC and/or its affiliates. All rights reserved.
 *
 * @author aduldulao
 *
 * Script brief description:
 * M/R script to check for duplicate assets in case records
 *
 * Revision History:
 *
 * Date              Issue/Case          Author          Issue Fix Summary
 * =============================================================================================
 * 2024/3/1       		                 aduldulao       Initial version.
 *
 */

/**
 * @NApiVersion 2.1
 * @NScriptType MapReduceScript
 */
define(['N/error', 'N/record', 'N/runtime', 'N/search'],
    /**
     * @param{error} error
     * @param{record} record
     * @param{runtime} runtime
     * @param{search} search
     */
    (error, record, runtime, search) => {

        const PARAMS = {
            search: ''
        }

        /**
         * Returns script parameters
         */
        const readParameters = () => {
            var currentScript = runtime.getCurrentScript();

            PARAMS.search = currentScript.getParameter({name: 'custscript_sna_dupe_case'});
        }

        /**
         * Return duplicate assets
         * @param assets
         * @returns {{}}
         */
        const getDuplicateAsset = assets => {
            let duplicates = {};

            if (isEmpty(assets)) return duplicates;

            let objSearch = search.create({
                type: 'customrecord_nx_asset',
                filters: [
                    {
                        name: 'internalid',
                        operator: search.Operator.ANYOF,
                        values: assets
                    }
                ],
                columns: ['custrecord_sna_dup_asset']
            });

            objSearch.run().each(result => {
                duplicates[result.id] = result.getValue({
                    name: 'custrecord_sna_dup_asset'
                });

                log.debug({title: 'getDuplicateAsset', details: `asset: ${result.id} | dup of asset: ${duplicates[result.id]}`});

                return true;
            });

            return duplicates;
        };

        /**
         * Defines the function that is executed at the beginning of the map/reduce process and generates the input data.
         * @param {Object} inputContext
         * @param {boolean} inputContext.isRestarted - Indicates whether the current invocation of this function is the first
         *     invocation (if true, the current invocation is not the first invocation and this function has been restarted)
         * @param {Object} inputContext.ObjectRef - Object that references the input data
         * @typedef {Object} ObjectRef
         * @property {string|number} ObjectRef.id - Internal ID of the record instance that contains the input data
         * @property {string} ObjectRef.type - Type of the record instance that contains the input data
         * @returns {Array|Object|Search|ObjectRef|File|Query} The input data to use in the map/reduce process
         * @since 2015.2
         */

        const getInputData = (inputContext) => {
            const stLoggerTitle = 'getInputData';

            readParameters();

            return searchAllResults(search.load({id: PARAMS.search}));
        }

        /**
         * Defines the function that is executed when the reduce entry point is triggered. This entry point is triggered
         * automatically when the associated map stage is complete. This function is applied to each group in the provided context.
         * @param {Object} reduceContext - Data collection containing the groups to process in the reduce stage. This parameter is
         *     provided automatically based on the results of the map stage.
         * @param {Iterator} reduceContext.errors - Serialized errors that were thrown during previous attempts to execute the
         *     reduce function on the current group
         * @param {number} reduceContext.executionNo - Number of times the reduce function has been executed on the current group
         * @param {boolean} reduceContext.isRestarted - Indicates whether the current invocation of this function is the first
         *     invocation (if true, the current invocation is not the first invocation and this function has been restarted)
         * @param {string} reduceContext.key - Key to be processed during the reduce stage
         * @param {List<String>} reduceContext.values - All values associated with a unique key that was passed to the reduce stage
         *     for processing
         * @since 2015.2
         */
        const reduce = (reduceContext) => {
            const stLoggerTitle = 'reduce';
            log.debug({title: stLoggerTitle, details: reduceContext});

            var objReduceData = reduceContext.values;

            let parsedDta = JSON.parse(objReduceData[0]);
            let caseid = !isEmpty(parsedDta.values['GROUP(internalid)']) ? parsedDta.values['GROUP(internalid)'][0].value : ''; // 1 case only
            let bodyasset = !isEmpty(parsedDta.values['GROUP(custevent_nx_case_asset)']) ? parsedDta.values['GROUP(custevent_nx_case_asset)'][0].value : '';
            let bodyDupeOfasset = !isEmpty(parsedDta.values['GROUP(CUSTEVENT_NX_CASE_ASSET.custrecord_sna_dup_asset)']) ? parsedDta.values['GROUP(CUSTEVENT_NX_CASE_ASSET.custrecord_sna_dup_asset)'][0].value : '';
            let bodyassets = !isEmpty(parsedDta.values['GROUP(custevent_nxc_case_assets)']) ? parsedDta.values['GROUP(custevent_nxc_case_assets)'] : []; // multi-select
            log.debug({title: 'bodyassets.length', details: bodyassets.length});

            var oldAssets = [];
            let assetPairs = [];

            let allEqAssets = [];
            for (var q = 0; q < bodyassets.length; q++) {
                if (!isEmpty(bodyassets[q].value) && bodyassets[q].value != '- None -') {
                    allEqAssets.push(bodyassets[q].value);
                }
            }

            log.debug({title: stLoggerTitle, details: `allEqAssets: ${JSON.stringify(allEqAssets)}`});

            var duplicates = getDuplicateAsset(allEqAssets);

            try {
                var rec = record.load({type: 'supportcase', id: caseid});
                var currbodyAsset = rec.getValue({fieldId: 'custevent_nx_case_asset'});

                // only set if not null. retain if null
                if (!isEmpty(bodyDupeOfasset) && bodyDupeOfasset != '- None -') {
                    //rec.setValue({fieldId: 'custevent_nx_case_asset', value: bodyDupeOfasset}); // aduldulao - remove. use custom field instead
                    rec.setValue({fieldId: 'custevent_sna_case_mergedsite', value: bodyDupeOfasset});
                    log.debug({title: stLoggerTitle, details: 'bodyDupeOfasset: ' + bodyDupeOfasset + ' | bodyasset: ' + bodyasset + ' | currbodyAsset: ' + currbodyAsset});

                    if (!inArray(bodyasset, oldAssets) && !isEmpty(bodyasset)) {
                        oldAssets.push(bodyasset);

                        assetPairs.push({
                            'active': bodyDupeOfasset,
                            'inactive': bodyasset
                        });
                    }
                }

                var currbodyAssets = rec.getValue({fieldId: 'custevent_nxc_case_assets'});
                log.debug({title: stLoggerTitle, details: 'currbodyAssets: ' + currbodyAssets + ' | currbodyAssets.len: ' + currbodyAssets.length});

                var newbodyAssets = [];
                for (var w = 0; w < bodyassets.length; w++) {
                    var dupeasset = duplicates[bodyassets[w].value];

                    if (!isEmpty(dupeasset)) {
                        newbodyAssets.push(dupeasset);

                        if (!inArray(bodyassets[w].value, oldAssets) && !isEmpty(bodyassets[w].value)) {
                            oldAssets.push(bodyassets[w].value);

                            assetPairs.push({
                                'active': dupeasset,
                                'inactive': bodyassets[w].value
                            });
                        }
                    }
                    /*else if (!isEmpty(bodyassets[w].value) && bodyassets[w].value != '- None -') {
                        newbodyAssets.push(bodyassets[w].value); // just retain the asset
                    }*/
                }

                log.debug({title: stLoggerTitle, details: 'newbodyAssets: ' + JSON.stringify(newbodyAssets)});
                //rec.setValue({fieldId: 'custevent_nxc_case_assets', value: newbodyAssets}); // aduldulao - remove. use custom field instead

                rec.setValue({fieldId: 'custevent_sna_case_mergedequipment', value: newbodyAssets});

                var recid = rec.save({ignoreMandatoryFields: true});
                log.debug({title: stLoggerTitle, details: recid + ' updated.'}); // 807

                // set Merged with Duplicate Asset field of new asset
                for (var b = 0; b < assetPairs.length; b++) {
                    record.submitFields({type: 'customrecord_nx_asset', id: assetPairs[b].active, values: {'custrecord_sna_duplicate_asset': assetPairs[b].inactive}});
                    log.debug({title: stLoggerTitle, details: assetPairs[b].active + ' Merged with Duplicate Asset updated with old asset ' + assetPairs[b].inactive});
                }

                // set old assets to inactive
                for (var a = 0; a < oldAssets.length; a++) {
                    record.submitFields({type: 'customrecord_nx_asset', id: oldAssets[a], values: {'isinactive': true}});
                    log.debug({title: stLoggerTitle, details: oldAssets[a] + ' inactivated.'});
                }
            }
            catch (e) {
                let stErrorMsg =
                    e.name !== null && e.name !== '' ? `${e.name}: ${e.message}` : `UnexpectedError: ${e.message}`;
                log.error({title: stLoggerTitle, details: stErrorMsg});
            }
        }


        /**
         * Defines the function that is executed when the summarize entry point is triggered. This entry point is triggered
         * automatically when the associated reduce stage is complete. This function is applied to the entire result set.
         * @param {Object} summaryContext - Statistics about the execution of a map/reduce script
         * @param {number} summaryContext.concurrency - Maximum concurrency number when executing parallel tasks for the map/reduce
         *     script
         * @param {Date} summaryContext.dateCreated - The date and time when the map/reduce script began running
         * @param {boolean} summaryContext.isRestarted - Indicates whether the current invocation of this function is the first
         *     invocation (if true, the current invocation is not the first invocation and this function has been restarted)
         * @param {Iterator} summaryContext.output - Serialized keys and values that were saved as output during the reduce stage
         * @param {number} summaryContext.seconds - Total seconds elapsed when running the map/reduce script
         * @param {number} summaryContext.usage - Total number of governance usage units consumed when running the map/reduce
         *     script
         * @param {number} summaryContext.yields - Total number of yields when running the map/reduce script
         * @param {Object} summaryContext.inputSummary - Statistics about the input stage
         * @param {Object} summaryContext.mapSummary - Statistics about the map stage
         * @param {Object} summaryContext.reduceSummary - Statistics about the reduce stage
         * @since 2015.2
         */
        const summarize = (summaryContext) => {
            const stLoggerTitle = 'summarize';

            log.debug({title: stLoggerTitle, details: 'SUMMARY: ' + JSON.stringify(summaryContext)});

            // Error handling
            handleErrorIfAny(summaryContext);
        }

        const handleErrorAndSendNotification = (e, stage) => {
            log.error('Stage: ' + stage + ' failed', e);
        }

        const handleErrorIfAny = (summary) => {
            var inputSummary = summary.inputSummary;
            var mapSummary = summary.mapSummary;
            var reduceSummary = summary.reduceSummary;

            if (inputSummary.error) {
                var e = error.create({
                    name : 'INPUT_STAGE_FAILED',
                    message : inputSummary.error
                });
                handleErrorAndSendNotification(e, 'getInputData');
            }

            handleErrorInStage('map', mapSummary);
            handleErrorInStage('reduce', reduceSummary);
        }

        const handleErrorInStage = (stage, summary) => {
            var errorMsg = [];
            summary.errors.iterator().each(function(key, value) {
                if (!isEmpty(JSON.parse(value).message)) {
                    var msg = 'Error was: ' + JSON.parse(value).message + '\n';
                    errorMsg.push(msg);
                }
            });
            if (errorMsg.length > 0) {
                var e = error.create({
                    name : 'ERROR_IN_STAGE',
                    message : JSON.stringify(errorMsg)
                });
                handleErrorAndSendNotification(e, stage);
            }
        }

        // UTILITY FUNCTIONS
        function isEmpty(stValue) {
            return ((stValue === '' || stValue == null || stValue == undefined) || (stValue.constructor === Array && stValue.length == 0) || (stValue.constructor === Object && (function(v) {
                for ( var k in v)
                    return false;
                return true;
            })(stValue)));
        }

        function inArray(stValue, arrValue) {
            for (var i = arrValue.length-1; i >= 0; i--) {
                if (stValue == arrValue[i]) {
                    break;
                }
            }
            return (i > -1);
        }

        function searchAllResults(objSearch, objOption) {
            if (isEmpty(objOption)) {
                objOption = {};
            }

            var arrResults = [];
            if (objOption.isLimitedResult == true) {
                var rs = objSearch.run();
                arrResults = rs.getRange(0, 1000);

                return arrResults;
            }

            var rp = objSearch.runPaged();
            rp.pageRanges.forEach(function(pageRange) {
                var myPage = rp.fetch({
                    index : pageRange.index
                });
                arrResults = arrResults.concat(myPage.data);
            });

            return arrResults;
        }

        return {getInputData, reduce, summarize}

    });
