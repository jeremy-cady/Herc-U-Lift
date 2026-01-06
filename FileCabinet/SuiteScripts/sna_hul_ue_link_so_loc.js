/**
 *@NApiVersion 2.x
 *@NScriptType UserEventScript
 */

/**
* Copyright (c) 2021, ScaleNorth Advisors LLC and/or its affiliates. All rights reserved.
*
* @author Latika Khatri
*
* Script brief description:
* This is a User Event script that updates the Location
*
* Revision History:
*
* Date              Issue/Case         Author               Issue Fix Summary
* =============================================================================================
* 2023/01/09                          Latika Khatri          Initial version
* 2023/06/15                          aduldulao              Set header location
*
*
*/
define(["N/record", "N/search", "N/runtime"], function (record, search, runtime) {

    function isEmpty(stValue) {
        return ((stValue === '' || stValue == null || stValue == undefined) || (stValue.constructor === Array && stValue.length == 0) || (stValue.constructor === Object && (function (v) {
            for (var k in v)
                return false;
            return true;
        })(stValue)));
    }

    function beforeSubmit(context) {
        try {

            log.debug("beforeSubmit triggered");
            log.debug("context.type", context.type);
            log.debug("runtime.executionContext", runtime.executionContext);
            if (context.type == context.UserEventType.CREATE || context.type == context.UserEventType.SPECIALORDER) {
                var newRecord = context.newRecord;
                log.debug("newRecord.id", newRecord.id);

                var rec = newRecord;/*record.load({
                    type: record.Type.PURCHASE_ORDER,
                    id: newRecord.id
                });*/

                var createdFrom = rec.getValue({
                    fieldId: "createdfrom"
                });

                log.debug('createdFrom', createdFrom);

                if (!createdFrom) return;

                var location = getLocation(createdFrom);
                log.debug('location', location);

                var getSO = loadSO(createdFrom);
                log.debug('getSO', getSO);

                // var locVal = location.location[0].value;
                // log.debug('locVal', locVal);

                // var locText = location.location[0].text;
                // log.debug('locText', locText);

                var getparentLoc = loadLocation(getSO);
                log.debug('getparentLoc', getparentLoc);

                // var getparentLoc = locSearch(getSO);
                // log.debug('getparentLoc', getparentLoc);

                if (getparentLoc) {
                    rec.setValue({fieldId: 'location', value: getparentLoc});
                }

                var lineItemCount = rec.getLineCount({
                    sublistId: "item"
                });

                for (var line = 0; line < lineItemCount; line++) {

                    log.debug('line', line);

                    rec.setSublistValue({
                        sublistId: "item",
                        fieldId: "custcol_sna_linked_so",
                        line: line,
                        value: createdFrom
                    });
                    if (getparentLoc) {
                        rec.setSublistValue({
                            sublistId: "item",
                            fieldId: "location",
                            line: line,
                            value: getparentLoc
                        });
                    }
                    rec.setSublistValue({
                        sublistId: "item",
                        fieldId: "custcol_sna_hul_so_location",
                        line: line,
                        value: getSO
                    });
                }

                //rec.save();
            }

        } catch (e) {
            log.debug("e", e);
        }
    }

    function getLocation(createdFrom) {
        var strloc = search.lookupFields({
            type: 'salesorder',
            id: createdFrom,
            columns: ['location']
        });
        return strloc;
    }

    function locSearch(location) {
        var locationIds = [];

        var locationSearchObj = search.create({
            type: "location",
            filters:
                [
                    ["name", "contains", location],
                    "AND",
                    ["isinactive", "is", "F"]
                ],
            columns:
                [
                    search.createColumn({
                        name: "name",
                        sort: search.Sort.ASC,
                        label: "Name"
                    }),
                    search.createColumn({ name: "country", label: "Country" }),
                    search.createColumn({ name: "internalid", label: "Internal ID" }),
                    search.createColumn({ name: "isoffice", label: "Staffed Location" }),
                    // search.createColumn({ name: "parent", label: "Staffed Location" })
                ]
        }).run().each(function (result) {
            locationIds.push({
                // parentLoc: result.getValue({ name: "parent" }),
                locationId: result.getValue({ name: "internalid" }),
                // distributionCenterId: result.getValue({ name: "internalid", join: "CUSTBODY_SNA_ACE_SODISTRICENTER" }),

            });
            return true;
        });
        log.audit("locationIds", locationIds);
        return locationIds;
    }

    function loadLocation(location) {

        var objRecord = record.load({
            type: "location",
            id: location,
            isDynamic: true,
        });
        log.debug("objRecord", objRecord);

        var parLoc = objRecord.getValue("parent");
        log.debug("parLoc", parLoc);

        return parLoc;

    }

    function loadSO(location) {
        var objRecord = record.load({
            type: "salesorder",
            id: location,
            isDynamic: true,
        });
        log.debug("objRecord", objRecord);

        var getLineCount = objRecord.getLineCount({

            sublistId: 'item'
        });

        /*for (var i = 0; i < getLineCount; i++) {

            var location = objRecord.getSublistValue({
                sublistId: "item",
                fieldId: "location",
                line: i
            });
        }*/
        // use header location
        location = objRecord.getValue({fieldId: 'location'});

        log.debug('location = ', location);
        return location;
    }

    return {
        beforeSubmit: beforeSubmit
    }
});
