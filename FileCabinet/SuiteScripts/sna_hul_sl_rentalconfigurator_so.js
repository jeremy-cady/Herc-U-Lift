/*
 * Copyright (c) 2022, ScaleNorth Advisors LLC and/or its affiliates. All rights reserved.
 *
 * @author aduldulao
 *
 * Script brief description:
 * SL script to return rental contract IDs
 *
 * Revision History:
 *
 * Date              Issue/Case          Author          Issue Fix Summary
 * =============================================================================================
 * 2022/9/20       		                 aduldulao       Initial version.
 *
 */

/**
 * @NApiVersion 2.1
 * @NScriptType Suitelet
 */
define(['N/search'],
    /**
 * @param{search} search
 */
    (search) => {

        // UTILITY FUNCTIONS
        function isEmpty(stValue) {
            return ((stValue === '' || stValue == null || stValue == undefined) || (stValue.constructor === Array && stValue.length == 0) || (stValue.constructor === Object && (function (v) {
                for (var k in v)
                    return false;
                return true;
            })(stValue)));
        }

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

            var changed = params.changed;

            if (changed == 'so') {
                var soid = params.soid;
                var contractids = getRentalContractIds(soid);

                log.debug({title: 'onRequest', details: 'contractids: ' + JSON.stringify(contractids)});
                scriptContext.response.write(JSON.stringify(contractids));
            }
            else if (changed == 'rentalcontractid') {
                var rentalcontractid = params.rentalcontractid;
                var objval = checkIfDummy(rentalcontractid);

                log.debug({title: 'onRequest', details: 'objval: ' + JSON.stringify(objval)});
                scriptContext.response.write(JSON.stringify(objval));
            }
            else if (changed == 'checkdummy') {
                var objid = params.objid;
                var objdummy = dummyLookup(objid);

                log.debug({title: 'onRequest', details: 'objdummy: ' + JSON.stringify(objdummy)});
                scriptContext.response.write(JSON.stringify(objdummy));
            }
        }

        /**
         * Object dummy lookup
         * @param objid
         * @returns {{objdummy: boolean}}
         */
        function dummyLookup(objid) {
            var objdummy = false;

            var objflds = search.lookupFields({type: 'customrecord_sna_objects', id: objid, columns: ['custrecord_sna_hul_rent_dummy']});

            if (!isEmpty(objflds.custrecord_sna_hul_rent_dummy)) {
                objdummy = objflds.custrecord_sna_hul_rent_dummy;
            }

            return {'objdummy': objdummy};
        }

        /**
         * Check object if dummy
         * @param rentalcontractid
         * @returns {{}}
         */
        function checkIfDummy(rentalcontractid) {
            var objval = {};

            var filters = [search.createFilter({name: 'custcol_sna_hul_rent_contractidd', operator: search.Operator.IS, values: rentalcontractid})];
            var columns = [search.createColumn({name: 'custcol_sna_hul_fleet_no'}), search.createColumn({name: 'custcol_sna_hul_dummy'}), search.createColumn({name: 'custcol_sna_hul_rental_config_comment'})];

            var transearch = search.create({type: search.Type.SALES_ORDER, filters: filters, columns: columns});
            var tranres = transearch.run().getRange({start: 0, end: 1}); // assumed to be 1

            if (!isEmpty(tranres)) {
                var obj = tranres[0].getValue({name: 'custcol_sna_hul_fleet_no'});
                var dummy = tranres[0].getValue({name: 'custcol_sna_hul_dummy'});
                var comments = tranres[0].getValue({name: 'custcol_sna_hul_rental_config_comment'});

                objval['obj'] = obj;
                objval['dummy'] = dummy;
                objval['comments'] = comments;
            }

            return objval;
        }

        /**
         * Get rental contract IDs
         * @param soid
         * @returns {*[]}
         */
        function getRentalContractIds(soid) {
            var ids = {};

            if (isEmpty(soid)) return ids;

            var filters = [];
            filters.push(search.createFilter({name: 'internalid', operator: search.Operator.IS, values: soid}));

            var columns = [];
            columns.push(search.createColumn({name: 'custcol_sna_hul_rent_contractidd'}));

            var srch = search.create({type: search.Type.SALES_ORDER, columns: columns, filters: filters});

            srch.run().each(function(result) {
                var contractid = result.getValue({name: 'custcol_sna_hul_rent_contractidd'}); // text field

                if (!isEmpty(contractid)) {
                    ids[contractid] = contractid;
                }

                return true;
            });

            return ids;
        }

        return {onRequest}

    });