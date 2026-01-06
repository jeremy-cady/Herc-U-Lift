/*
 * Copyright (c) 2024, ScaleNorth and/or its affiliates. All rights reserved.
 *
 * @author aduldulao
 *
 * Script brief description:
 * M/R script to create customer address froim site asset record
 *
 * Revision History:
 *
 * Date              Issue/Case          Author          Issue Fix Summary
 * =============================================================================================
 * 2024/12/11       		                 aduldulao       Initial version.
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

        // UTILITY FUNCTIONS
        function isEmpty(stValue) {
            return ((stValue === '' || stValue == null || stValue == undefined) || (stValue.constructor === Array && stValue.length == 0) || (stValue.constructor === Object && (function(v) {
                for ( var k in v)
                    return false;
                return true;
            })(stValue)));
        }

        function getExcludedAddresses(excludedLocs) {
            var excludedLocs = excludedLocs.split(',');
            var excludedAddresses = [];

            var filters = [];
            filters.push(['internalid', search.Operator.ANYOF, excludedLocs]);
            filters.push('and');
            filters.push(['isinactive', search.Operator.IS, 'F']);

            var columns = [];
            columns.push(search.createColumn({name: 'name'}));
            columns.push(search.createColumn({name: 'address1'}));
            columns.push(search.createColumn({name: 'city'}));
            columns.push(search.createColumn({name: 'state'}));
            columns.push(search.createColumn({name: 'zip'}));
            columns.push(search.createColumn({name: 'country'}));

            var srch = search.create({type: 'location', columns: columns, filters: filters});
            var runsrch =  srch.run();

            srch.run().each(function(result) {
                var country = result.getValue({name: 'country'});
                if (country == 'US') {
                    country = 'United States';
                }

                var res_address = result.getValue({name: 'address1'}) + ' ' + result.getValue({name: 'city'}) + ' ' + result.getValue({name: 'state'}) + ' ' + result.getValue({name: 'zip'}) + ' ' + country;
                res_address = res_address.trim();
                res_address = res_address.replace(/\n/g, " ");
                res_address = res_address.replace(/(\s\s\s*)/g, ' ');
                res_address = res_address.toLowerCase();

                excludedAddresses.push({
                    shipaddress: res_address
                });

                return true;
            });

            log.debug({title: 'getExcludedAddresses', details: 'excludedAddresses: ' + JSON.stringify(excludedAddresses)});

            return excludedAddresses;
        }

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

            let ser = search.load({id: 'customsearch_sna_no_address_site_asset_u'});
            //ser.filters.push(search.createFilter({name: 'created', operator: search.Operator.ONORAFTER, values: '02/01/2024'}));

            return ser;
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

            let currentScript = runtime.getCurrentScript();
            let excludedLocs = currentScript.getParameter({name:'custscript_sn_locations_to_exclude'});
            let excludedaddresses = getExcludedAddresses(excludedLocs);
            log.debug({title: stLoggerTitle, details: 'excludedaddresses: ' + JSON.stringify(excludedaddresses)});

            let objReduceData = reduceContext.values;
            let parseddata = JSON.parse(objReduceData[0]);
            log.debug({title: stLoggerTitle, details: parseddata});

            let assetid = parseddata.id;
            let custid = parseddata.values.custrecord_nx_asset_customer.value;
            let addresstxt = parseddata.values.custrecord_nx_asset_address_text;
            addresstxt = addresstxt.trim();
            addresstxt = addresstxt.replace('P.O.', 'PO');

            let splitLines = addresstxt.split('\r\n');
            if (splitLines.length == 1) {
                splitLines = addresstxt.split('\\r\\n');

                if (splitLines.length == 1) {
                    splitLines = addresstxt.split('\\n');

                    if (splitLines.length == 1) {
                        splitLines = addresstxt.split('\n');

                        if (splitLines.length == 1) {
                            splitLines = addresstxt.split(',');
                        }
                    }
                }
            }

            let country = '';
            let zip = '';
            let state = '';
            let pobox = '';
            let add1 = '';
            let add2 = '';

            let poboxline = (splitLines.findIndex(function(item){
                return item.includes('PO');
            }));

            if (poboxline != -1) {
                pobox = splitLines[poboxline];
            }

            if (poboxline == 2) {
                add1 = splitLines[0];
                add2 = splitLines[1];
            }
            else if (poboxline == 1) {
                add1 = splitLines[0];
            }

            let tempAddress = addresstxt;
            tempAddress = tempAddress.replace(/\n/g, " ");
            tempAddress = tempAddress.replace(/(\s\s\s*)/g, ' ');
            tempAddress = tempAddress.replace('United States', 'UnitedStates');
            tempAddress = tempAddress.replace(pobox, '');
            let arrAddress = tempAddress.split(' ');

            log.debug({title: stLoggerTitle, details: `addresstxt: ${addresstxt} | arrAddress: ${JSON.stringify(arrAddress)} | splitLines: ${JSON.stringify(splitLines)}`});

            let last = arrAddress[arrAddress.length-1]; // United States
            let templast = last.replace('-', '').replace(',', ''); // in case of dash and comma
            let secondlast = !isEmpty(arrAddress[arrAddress.length-2]) ? arrAddress[arrAddress.length-2].replace(',', '') : ''; // expected to be Zip
            let tempsecondlast = secondlast.replace('-', ''); // in case of dash and comma
            let thirdlast = !isEmpty(arrAddress[arrAddress.length-3]) ? arrAddress[arrAddress.length-3].replace(',', '') : ''; // expected to be State
            let tempthirdlast = thirdlast.replace('-', ''); // in case of dash and comma

            log.debug({title: stLoggerTitle, details: `last: ${last} | templast: ${templast} | secondlast: ${secondlast} | tempsecondlast: ${tempsecondlast} | thirdlast: ${thirdlast}`});

            if (last == 'UnitedStates') {
                country = last;

                if (isNaN(tempsecondlast)) {
                    if (secondlast.length == 2) {
                        state = secondlast;
                    }
                    if (!isNaN(tempthirdlast)) {
                        zip = thirdlast;
                    }
                }
                else {
                    zip = secondlast;

                    if (thirdlast.length == 2) {
                        state = thirdlast;
                    }
                }
            }
            else if (isNaN(templast)) {
                if (last.length == 2) {
                    state = last;
                }
            }
            else if (!isNaN(templast)) {
                zip = last;
            }

            if (isEmpty(add1)) {
                let countryline = (splitLines.findIndex(function(item){
                    return item.includes('United States');
                }));

                let zipline = '-1';
                if (!isEmpty(zip)) {
                    zipline = (splitLines.findIndex(function(item){
                        return item.includes(zip);
                    }));
                }

                let stateline = '-1';
                if (!isEmpty(state)) {
                    stateline = (splitLines.findIndex(function(item){
                        return item.includes(state);
                    }));
                }

                log.debug({title: stLoggerTitle, details: `poboxline: ${poboxline} | zipline: ${zipline} | stateline: ${stateline} | countryline: ${countryline}`});

                if (poboxline != 0 && zipline != 0 && stateline != 0 && countryline != 0) {
                    add1 = !isEmpty(splitLines[0]) ? splitLines[0] : '';
                }

                if (poboxline != 1 && zipline != 1 && stateline != 1 && countryline != 1) {
                    add2 = !isEmpty(splitLines[1]) ? splitLines[1] : '';
                }
            }

            log.debug({title: stLoggerTitle, details: `add1: ${add1} | add2: ${add2} | state: ${state} | zip: ${zip} | pobox: ${pobox} | country: ${country}`});

            let entityrec = record.load({type: record.Type.CUSTOMER, id: custid, isDynamic: true});

            entityrec.selectNewLine({sublistId: 'addressbook'});
            var addressSubrecord = entityrec.getCurrentSublistSubrecord({sublistId: 'addressbook', fieldId: 'addressbookaddress'});
            addressSubrecord.setValue({fieldId: 'state', value: state});
            addressSubrecord.setValue({fieldId: 'zip', value: zip});
            addressSubrecord.setValue({fieldId: 'addr3', value: pobox});
            let defaultcity = addressSubrecord.getValue({fieldId: 'city'});
            log.debug({title: stLoggerTitle, details: `defaultcity: ${defaultcity}`});
            if (defaultcity.trim().toLowerCase() != add2.trim().toLowerCase()) {
                addressSubrecord.setValue({fieldId: 'addr2', value: add2});
            }
            if (defaultcity.trim().toLowerCase() != add1.trim().toLowerCase()) {
                addressSubrecord.setValue({fieldId: 'addr1', value: add1});
            }

            addressSubrecord.setValue({fieldId: 'custrecord_sn_autocreate_asset', value: false});
            addressSubrecord.setValue({fieldId: 'custrecordsn_nxc_site_asset', value: assetid});
            entityrec.commitLine({sublistId: 'addressbook'});

            let nxAddress = add1 + ' ' + defaultcity + ' ' + state + ' ' + zip + ' ' + country;
            nxAddress = nxAddress.trim();
            nxAddress = nxAddress.replace(/\n/g, " ");
            nxAddress = nxAddress.replace(/(\s\s\s*)/g, ' ');
            nxAddress = nxAddress.replace('UnitedStates', 'United States');
            nxAddress = nxAddress.toLowerCase();
            log.debug({title: stLoggerTitle, details: `nxAddress: ${nxAddress}`});

            let excludedfound = excludedaddresses.find(e => e.shipaddress == nxAddress);
            if (!isEmpty(excludedfound)) {
                log.debug({title: stLoggerTitle, details: 'nxAddress is an excluded address -: ' + JSON.stringify(excludedfound)});
            }
            else if (!isEmpty(add1)) {
                entityrec.save({ignoreMandatoryFields: true});
                log.debug({title: stLoggerTitle, details: 'customer updated: ' + custid});

                log.debug({title: stLoggerTitle, details: `assetid: ${assetid}`});

                // get address ID
                let _filters = [];
                _filters.push(search.createFilter({name: 'internalid', operator: search.Operator.IS, values: custid}));
                _filters.push(search.createFilter({name: 'custrecordsn_nxc_site_asset', join: 'address', operator: search.Operator.IS, values: assetid}));

                let _columns = [];
                _columns.push(search.createColumn({name: 'addressinternalid', join: 'Address'}));

                var addsrch = search.create({type: record.Type.CUSTOMER, columns: _columns, filters: _filters});
                var addsrch_ = addsrch.run().getRange({start: 0, end: 1});

                if (addsrch_.length > 0) {
                    let addressId = addsrch_[0].getValue({name: 'addressinternalid', join: 'Address'});

                    record.submitFields({type: 'customrecord_nx_asset', id: assetid, values: {custrecord_nx_asset_address: addressId}, options: {enableSourcing: true}});
                    log.debug({title: stLoggerTitle, details: 'nx asset updated: ' + assetid});
                }
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

        return {getInputData, reduce, summarize}

    });
