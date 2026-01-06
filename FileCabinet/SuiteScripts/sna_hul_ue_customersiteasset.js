/*
 * Copyright (c) 2023, ScaleNorth Advisors LLC and/or its affiliates. All rights reserved.
 *
 * @author aduldulao
 *
 * Script brief description:
 * Create NXC Site Asset from Customer record
 *
 *
 * Revision History:
 *
 * Date              Issue/Case          Author          Issue Fix Summary
 * =============================================================================================
 * 2023/4/18       		                 aduldulao       Initial version.
 * 2024/1/31       		                 aduldulao       Address 3
 * 2024/7/22       		                 aduldulao       Link to address
 *
 */

/**
 * @NApiVersion 2.1
 * @NScriptType UserEventScript
 */
define(['N/record', 'N/search', 'N/runtime'],
    /**
 * @param{record} record
 * @param{search} search
 */
    (record, search, runtime) => {

        // UTILITY FUNCTIONS
        function isEmpty(stValue) {
            return ((stValue === '' || stValue == null || stValue == undefined) || (stValue.constructor === Array && stValue.length == 0) || (stValue.constructor === Object && (function(v) {
                for ( var k in v)
                    return false;
                return true;
            })(stValue)));
        }

        /**
         * Defines the function definition that is executed after record is submitted.
         * @param {Object} scriptContext
         * @param {Record} scriptContext.newRecord - New record
         * @param {Record} scriptContext.oldRecord - Old record
         * @param {string} scriptContext.type - Trigger type; use values from the context.UserEventType enum
         * @since 2015.2
         */
        const afterSubmit = (scriptContext) => {
            if (scriptContext.type == scriptContext.UserEventType.DELETE) return;

            try {
                var currentScript = runtime.getCurrentScript();
                var siteform = currentScript.getParameter({name:'custscript_sna_custform_site'});
                var sitetype = currentScript.getParameter({name:'custscript_sna_assettype_site'});
                var excludedLocs = currentScript.getParameter({name:'custscript_sn_locations_to_exclude'});

                var _rec = scriptContext.newRecord;
                var rectype = _rec.type;
                var recid = _rec.id;

                checkNxAssets(recid, siteform, sitetype, rectype, excludedLocs);
            }
            catch (e) {
                if (e.message != undefined) {
                    log.error('ERROR' , e.name + ' ' + e.message);
                } else {
                    log.error('ERROR', 'Unexpected Error' , e.toString());
                }
            }
        }

        /**
         * Check if address is already existing
         * @param entity
         * @param siteform
         * @param sitetype
         * @param rectype
         * @param excludedLocs
         */
        function checkNxAssets(entity, siteform, sitetype, rectype, excludedLocs) {
            var excludedaddresses = getExcludedAddresses(excludedLocs);
            log.debug({title: 'checkNxAssets', details: 'excludedaddresses: ' + JSON.stringify(excludedaddresses)});

            var _custaddresses = getCustomerAddresses(entity);

            var zipcodes = _custaddresses.zipcodes;
            var customerAddresses = _custaddresses.addressObj;
            var shipAtt = _custaddresses.shipAtt;

            log.debug({title: 'checkNxAssets', details: 'zipcodes: ' + JSON.stringify(zipcodes)});
            log.debug({title: 'checkNxAssets', details: 'customerAddresses: ' + JSON.stringify(customerAddresses)});
            log.debug({title: 'checkNxAssets', details: 'shipAtt: ' + shipAtt});

            var regions = getZipRegion(zipcodes);
            var addressesToBeUpdated = {};
            var nxAddresses = [];

            var filters = [];
            filters.push(['custrecord_nx_asset_customer', search.Operator.IS, entity]);
            filters.push('and');
            filters.push(['custrecord_nxc_na_asset_type', search.Operator.IS, sitetype]);
            filters.push('and');
            filters.push(['custrecord_nx_asset_address_text', search.Operator.ISNOTEMPTY, '']);
            filters.push('and');
            filters.push(['isinactive', search.Operator.IS, 'F']);

            var columns = [];
            columns.push(search.createColumn({name: 'custrecord_nx_asset_address_text'}));
            columns.push(search.createColumn({name: 'custrecord_nx_asset_address'}));
            columns.push(search.createColumn({name: 'internalid', sort: search.Sort.ASC}));

            var srch = search.create({type: 'customrecord_nx_asset', columns: columns, filters: filters});
            var runsrch =  srch.run();

            srch.run().each(function(result) {
                var res_address = result.getValue({name: 'custrecord_nx_asset_address_text'});
                //res_address = res_address.replace(shipAtt, ""); // maan
                res_address = res_address.trim();
                res_address = res_address.replace(/\n/g, " ");
                res_address = res_address.replace(/(\s\s\s*)/g, ' ');
                res_address = res_address.toLowerCase();

                nxAddresses.push({
                    shipaddress: res_address,
                    addressId: result.getValue({name: 'custrecord_nx_asset_address'}),
                    shipsiteasset: result.id
                });

                return true;
            });

            log.debug({title: 'checkNxAssets', details: 'nxAddresses: ' + JSON.stringify(nxAddresses)});

            // go back to the customer addresses
            for (var q = 0; q < customerAddresses.length; q++) {
                log.debug({title: 'checkNxAssets', details: 'customer address: ' + JSON.stringify(customerAddresses[q])});

                var custAddress = customerAddresses[q].shipaddress;
                var custTempAddress = customerAddresses[q].tempaddress;
                var custAddressAsset = customerAddresses[q].shipsiteasset;
                var custAddressNew = customerAddresses[q].newAddress;
                var custAddressId = customerAddresses[q].addressId;
                var custOrigAddress = customerAddresses[q].origshipaddress;

                var siteassetid = '';

                var excludedfound = excludedaddresses.find(e => e.shipaddress == custAddress || e.shipaddress == custOrigAddress);
                if (!isEmpty(excludedfound)) {
                    log.debug({title: 'checkNxAssets', details: 'customer address is an excluded address -: ' + JSON.stringify(excludedfound)});

                    continue;
                }

                var found = nxAddresses.find(e => e.shipaddress == custAddress || e.shipaddress == custOrigAddress);

                if (!isEmpty(found)) {
                    // customer address NX matches found NX. check if matched to prevent overwriting the NX Address Select if customer address is a duplicate
                    if (custAddressAsset == found.shipsiteasset || custAddressId == found.addressId) {
                        log.debug({title: 'checkNxAssets', details: 'site asset already created for this address -: ' + JSON.stringify(found)});
                        siteassetid = found.shipsiteasset;
                    }
                    // NX exists but not linked to the address record
                    else if (isEmpty(found.addressId)) {
                        log.debug({title: 'checkNxAssets', details: 'site asset already created for this address --: ' + JSON.stringify(found)});
                        siteassetid = found.shipsiteasset;
                    }
                    else {
                        log.debug({title: 'checkNxAssets', details: 'this address is a duplicate of another customer address.. skipping: ' + JSON.stringify(found)});
                    }

                    // just to make sure always matched
                    if (!isEmpty(siteassetid)) {
                        var updatedflds = {
                            'name': custTempAddress,
                            'custrecord_nx_asset_address': custAddressId,
                            'custrecord_nx_asset_address_text': custTempAddress
                        }
                        updateSiteAsset(siteassetid, updatedflds);
                    }
                }
                else {
                    if (isEmpty(custAddressAsset) && custAddressNew) {
                        log.debug({title: 'checkNxAssets', details: 'creating new NX asset'});

                        // If no Site Asset has been found, create a Site Asset with the following fields populated
                        var updatedflds = {
                            'customform': siteform,
                            'custrecord_nxc_na_asset_type': sitetype,
                            'name': custTempAddress,
                            'custrecord_nx_asset_customer': entity,
                            'custrecord_nx_asset_address': custAddressId,
                            'custrecord_nx_asset_address_text': custTempAddress,
                            'custrecord_nx_asset_region': regions[customerAddresses[q].shipzip]
                        }
                        siteassetid = createSiteAsset(updatedflds);
                        //continue;
                    }
                    else if (!isEmpty(custAddressAsset)) {
                        log.debug({title: 'checkNxAssets', details: 'updating NX asset: ' + custAddressAsset});
                        var updatedflds = {
                            'name': custTempAddress,
                            'custrecord_nx_asset_address': custAddressId,
                            'custrecord_nx_asset_address_text': custTempAddress
                        }
                        siteassetid = updateSiteAsset(custAddressAsset, updatedflds);
                    }
                }

                addressesToBeUpdated[customerAddresses[q].addressId] = siteassetid;
            }

            log.debug({title: 'checkNxAssets', details: 'addressesToBeUpdated: ' + JSON.stringify(addressesToBeUpdated)});

            if (!isEmpty(addressesToBeUpdated)) {
                updateAddressRecord(addressesToBeUpdated, entity, rectype);
            }
        }

        /**
         * Update address record in the entity record
         * @param addressesToBeUpdated
         * @param entity
         * @param rectype
         */
        function updateAddressRecord(addressesToBeUpdated, entity, rectype) {
            var entityrec = record.load({type: rectype, id: entity, isDynamic: true});

            for (addressId in addressesToBeUpdated) {
                var assetId = addressesToBeUpdated[addressId];

                var addressline = entityrec.findSublistLineWithValue({sublistId: 'addressbook', fieldId: 'addressid', value: addressId});

                if (addressline != -1) {
                    entityrec.selectLine({sublistId: 'addressbook', line: addressline});
                    var addressSubrecord = entityrec.getCurrentSublistSubrecord({sublistId: 'addressbook', fieldId: 'addressbookaddress'});
                    addressSubrecord.setValue({fieldId: 'custrecordsn_nxc_site_asset', value: assetId});
                    entityrec.commitLine({sublistId: 'addressbook'});
                }
            }

            entityrec.save({ignoreMandatoryFields: true});
            log.debug({title: 'updateAddressRecord', details: 'Entity updated: ' + entity});
        }

        /**
         * Returns excluded addresses
         * @param excludedLocs
         * @returns {*[]}
         */
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
         * Get customer addresses
         * @param entity
         * @returns {{zipcodes: *[], custaddresses: *[]}}
         */
        function getCustomerAddresses(entity) {
            var zipcodes = [];
            var addressObj = [];
            var shipAtt = '';

            var _filters = [];
            _filters.push(search.createFilter({name: 'internalid', operator: search.Operator.IS, values: entity}));
            //_filters.push(search.createFilter({name: 'custrecord_sn_autocreate_asset', join: 'address', operator: search.Operator.IS, values: true}));
            //_filters.push(search.createFilter({name: 'custrecordsn_nxc_site_asset', join: 'address', operator: search.Operator.ANYOF, values: ['@NONE@']}));

            var _columns = [];
            _columns.push(search.createColumn({name: 'attention', join: 'Address'}));
            _columns.push(search.createColumn({name: 'addressee', join: 'Address'}));
            _columns.push(search.createColumn({name: 'address', join: 'Address'}));
            _columns.push(search.createColumn({name: 'address1', join: 'Address'}));
            _columns.push(search.createColumn({name: 'address2', join: 'Address'}));
            _columns.push(search.createColumn({name: 'address3', join: 'Address'}));
            _columns.push(search.createColumn({name: 'city', join: 'Address'}));
            _columns.push(search.createColumn({name: 'state', join: 'Address'}));
            _columns.push(search.createColumn({name: 'zipcode', join: 'Address'}));
            _columns.push(search.createColumn({name: 'custrecordsn_nxc_site_asset', join: 'Address'}));
            _columns.push(search.createColumn({name: 'custrecord_sn_autocreate_asset', join: 'Address'}));
            _columns.push(search.createColumn({name: 'addressinternalid', join: 'Address'}));

            var addsrch = search.create({type: record.Type.CUSTOMER, columns: _columns, filters: _filters});

            addsrch.run().each(function(result) {
                var shipattention = result.getValue({name: 'attention', join: 'Address'});
                var shipaddressee = result.getValue({name: 'addressee', join: 'Address'});
                var shipaddress = result.getValue({name: 'address', join: 'Address'});
                var shipaddress1 = result.getValue({name: 'address1', join: 'Address'});
                var shipaddress2 = result.getValue({name: 'address2', join: 'Address'});
                var shipaddress3 = result.getValue({name: 'address3', join: 'Address'});
                var shipcity = result.getValue({name: 'city', join: 'Address'});
                var shipstate = result.getValue({name: 'state', join: 'Address'});
                var shipzip = result.getValue({name: 'zipcode', join: 'Address'});
                var shipsiteasset = result.getValue({name: 'custrecordsn_nxc_site_asset', join: 'Address'});
                var shipautocreate = result.getValue({name: 'custrecord_sn_autocreate_asset', join: 'Address'});
                var addressId = result.getValue({name: 'addressinternalid', join: 'Address'});

                log.debug({title: 'getCustomerAddresses', details: 'shipsiteasset: ' + shipsiteasset + ' | shipautocreate: ' + shipautocreate + ' | addressId: ' + addressId});

                var origshipaddress = shipaddress;

                if (!isEmpty(shipattention)) {
                    shipAtt = shipattention; // assumed to be 1 for all customer addresses?
                }

                var newAddress = false;

                if (isEmpty(shipsiteasset) && shipautocreate) {
                    newAddress = true;
                }

                origshipaddress = origshipaddress.replace(shipaddressee, ''); // this is not set in NX site address so ok to replace // maan

                shipaddress = shipaddress.replace(shipattention, '');
                shipaddress = shipaddress.replace(shipaddressee, '');

                log.debug({title: 'getCustomerAddresses', details: 'tempaddress: ' + tempaddress + ' | shipaddress1: ' + shipaddress1 + ' | shipaddress2: ' + shipaddress2 + ' | shipaddress3: ' + shipaddress3 + ' | shipcity: ' + shipcity + ' | shipstate: ' + shipstate + ' | shipzip: ' + shipzip});

                if ((!isEmpty(shipaddress1) || !isEmpty(shipaddress2)) && !isEmpty(shipaddress3)) {
                    log.debug({title: 'getCustomerAddresses', details: 'removing shipaddress3 in the customer address..'});
                    shipaddress = shipaddress.replace(shipaddress3, '');
                }

                var tempaddress = shipaddress;

                origshipaddress = origshipaddress.trim();
                origshipaddress = origshipaddress.replace(/\n/g, " ");
                origshipaddress = origshipaddress.replace(/(\s\s\s*)/g, ' ');
                origshipaddress = origshipaddress.toLowerCase();

                shipaddress = shipaddress.trim();
                shipaddress = shipaddress.replace(/\n/g, " ");
                shipaddress = shipaddress.replace(/(\s\s\s*)/g, ' ');
                shipaddress = shipaddress.toLowerCase();

                addressObj.push({
                    tempaddress: tempaddress,
                    shipaddress: shipaddress,
                    shipzip: shipzip,
                    addressId: addressId,
                    shipsiteasset: shipsiteasset,
                    newAddress: newAddress,
                    origshipaddress: origshipaddress
                });

                zipcodes.push(shipzip);

                return true;
            });

            return {
                addressObj,
                zipcodes,
                shipAtt
            }
        }

        /**
         * Create NX Asset
         * @param updatedflds
         * @returns {*}
         */
        function createSiteAsset(updatedflds) {
            // nextservice asset
            var nxrec = record.create({type: 'customrecord_nx_asset', isDynamic: true});

            for (var fldid in updatedflds) {
                nxrec.setValue({fieldId: fldid, value: updatedflds[fldid]});
            }

            var nxid = nxrec.save({ignoreMandatoryFields: true});
            log.debug({title: 'createSiteAsset', details: 'nx asset created: ' + nxid});

            return nxid;
        }

        /**
         * Update NX Asset
         * @param nxid
         * @param updatedflds
         * @returns {*}
         */
        function updateSiteAsset(nxid, updatedflds) {
            record.submitFields({type: 'customrecord_nx_asset', id: nxid, values: updatedflds, options: {enableSourcing: true}});
            log.debug({title: 'updateSiteAsset', details: 'nx asset updated: ' + nxid});

            return nxid;
        }

        /**
         * Get region from zip
         * @param shipzip
         * @returns {string}
         */
        function getZipRegion(shipzip) {
            log.debug({title: 'getZipRegion', details: 'shipzip: ' + shipzip.toString()});

            var region = [];

            if (isEmpty(shipzip)) return region;

            var initfilters = [];
            for (var q = 0; q < shipzip.length; q++) {
                initfilters.push(['custrecord_sna_st_zip_code', search.Operator.IS, shipzip[q]]);
                initfilters.push('or');
            }

            // Remove last 'or'
            initfilters.splice(-1, 1);
            log.debug({title: 'getZipRegion', details: 'initfilters: ' + JSON.stringify(initfilters)});

            var salesZoneSrch = search.create({
                type: 'customrecord_sna_sales_zone',
                filters: initfilters,
                columns: ['custrecord_sna_hul_nxc_region', 'custrecord_sna_st_zip_code']
            })

            salesZoneSrch.run().each(function(result) {
                var res_region = result.getValue({name: 'custrecord_sna_hul_nxc_region'});
                var res_zip = result.getValue({name: 'custrecord_sna_st_zip_code'});

                region[res_zip] = res_region;

                log.debug({title: 'getZipRegion', details: 'res_region: ' + res_region + ' | res_zip: ' + res_zip});
                return true;
            });

            return region;
        }

        return {afterSubmit}

    });
