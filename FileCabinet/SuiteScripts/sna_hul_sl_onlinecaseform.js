/*
 * Copyright (c) 2022, ScaleNorth Advisors LLC and/or its affiliates. All rights reserved.
 *
 * @author aduldulao
 *
 * Script brief description:
 * SL script to return object values
 *
 * Revision History:
 *
 * Date              Issue/Case          Author          Issue Fix Summary
 * =============================================================================================
 * 2022/11/11                                aduldulao       Initial version.
 * 2022/12/12                                aduldulao       Customer lookup
 * 2023/01/23                                fang            Changed customer lookup filter (instead of customer internal id, changed to entity id)
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
            log.debug({ title: 'GET - params', details: JSON.stringify(params) });

            var assetobj = params.assetobj;
            var cust = params.cust;

            log.debug('GET - assetobj', assetobj);
            if (!isEmpty(assetobj)) {
                var objid = '';

                var objassetflds = search.lookupFields({ type: 'customrecord_nx_asset', id: assetobj, columns: ['custrecord_sna_hul_nxcassetobject'] });

                log.debug('GET - objassetflds', objassetflds);


                if (!isEmpty(objassetflds.custrecord_sna_hul_nxcassetobject)) {
                    objid = objassetflds.custrecord_sna_hul_nxcassetobject[0].value;
                }

                log.debug({ title: 'onRequest', details: 'objid: ' + objid });

                var objval = objLookup(objid);
                log.debug({ title: 'onRequest', details: 'objval: ' + JSON.stringify(objval) });

                scriptContext.response.write(JSON.stringify(objval));
            }

            else if (!isEmpty(cust)) {
                var custval = custLookup(cust);
                log.debug({ title: 'onRequest', details: 'custval: ' + JSON.stringify(custval) });

                scriptContext.response.write(JSON.stringify(custval));
            }
        }

        function custLookup(cust) {
            var custval = {};

            if (isEmpty(cust)) return custval;

            // var filters = [search.createFilter({name: 'internalid', operator: search.Operator.IS, values: cust})];

            var filters = [search.createFilter({name: 'entityid', operator: search.Operator.IS, values: cust})];

            var columns = [
                search.createColumn({ name: 'internalid' }),
                search.createColumn({ name: 'billaddress1' }),
                search.createColumn({ name: 'billaddress2' }),
                search.createColumn({ name: 'billcity' }),
                search.createColumn({ name: 'billzipcode' }),
                // search.createColumn({name: 'billstate'}),
                search.createColumn({ name: 'statedisplayname' }),
                search.createColumn({ name: 'companyname' }),
                search.createColumn({ name: 'email' })
            ];

            var custsearch = search.create({ type: 'customer', filters: filters, columns: columns });
            var custres = custsearch.run().getRange({ start: 0, end: 1 }); // assumed to be 1

            if (!isEmpty(custres)) {
                custval['internalid'] = custres[0].getValue({ name: 'internalid' });
                custval['billaddress1'] = custres[0].getValue({ name: 'billaddress1' });
                custval['billaddress2'] = custres[0].getValue({ name: 'billaddress2' });
                custval['billcity'] = custres[0].getValue({ name: 'billcity' });
                custval['billzipcode'] = custres[0].getValue({ name: 'billzipcode' });
                // custval['billstate'] = custres[0].getText({name: 'billstate'});
                custval['state'] = custres[0].getText({ name: 'statedisplayname' });
                custval['companyname'] = custres[0].getValue({ name: 'companyname' });
                custval['email'] = custres[0].getValue({ name: 'email' });
            }

            return custval;
        }

        /**
         * Object lookup
         * @param objid
         * @returns {{}}
         */
        function objLookup(objid) {
            var objval = {};

            log.debug('objid', objid);

            if (isEmpty(objid)) return objval;

            var filters = [search.createFilter({ name: 'internalid', operator: search.Operator.IS, values: objid })];
            var columns = [
                search.createColumn({ name: 'custrecord_sna_fleet_code' }),
                search.createColumn({ name: 'custrecord_sna_serial_no' }),
                search.createColumn({ name: 'custrecord_sna_man_code' }),
                search.createColumn({ name: 'custrecord_sna_equipment_model' }),
                search.createColumn({ name: 'custrecord_sna_frame_no' }),
                search.createColumn({ name: 'custrecord_sna_power_new' }),
                search.createColumn({ name: 'custrecord_sna_capacity_new' }),
                search.createColumn({ name: 'custrecord_sna_tires_new' }),
                search.createColumn({ name: 'custrecord_sna_work_height' }),
                search.createColumn({ name: 'custrecord_sna_warranty_type' })
            ];

            var transearch = search.create({ type: 'customrecord_sna_objects', filters: filters, columns: columns });
            var tranres = transearch.run().getRange({ start: 0, end: 1 }); // assumed to be 1

            if (!isEmpty(tranres)) {
                objval['custrecord_sna_fleet_code'] = tranres[0].getValue({ name: 'custrecord_sna_fleet_code' });
                objval['custrecord_sna_serial_no'] = tranres[0].getValue({ name: 'custrecord_sna_serial_no' });
                objval['custrecord_sna_man_code'] = tranres[0].getValue({ name: 'custrecord_sna_man_code' });
                objval['custrecord_sna_equipment_model'] = tranres[0].getValue({ name: 'custrecord_sna_equipment_model' });
                objval['custrecord_sna_frame_no'] = tranres[0].getValue({ name: 'custrecord_sna_frame_no' });
                objval['custrecord_sna_power_new'] = tranres[0].getValue({ name: 'custrecord_sna_power_new' });
                objval['custrecord_sna_capacity_new'] = tranres[0].getValue({ name: 'custrecord_sna_capacity_new' });
                objval['custrecord_sna_tires_new'] = tranres[0].getValue({ name: 'custrecord_sna_tires_new' });
                objval['custrecord_sna_work_height'] = tranres[0].getValue({ name: 'custrecord_sna_work_height' });
                objval['custrecord_sna_warranty_type'] = tranres[0].getValue({ name: 'custrecord_sna_warranty_type' });
            }

            return objval;
        }

        return { onRequest }

    });
