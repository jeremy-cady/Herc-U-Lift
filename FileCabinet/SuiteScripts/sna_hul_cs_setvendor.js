/**
 *@NApiVersion 2.x
 *@NScriptType ClientScript
 */
/**
 * Copyright (c) 2021, ScaleNorth Advisors LLC and/or its affiliates. All rights reserved.
 *
 * @author fang
 *
 * Script brief description:
 * Set the following fields:
 * - "Pay to Vendor" (NetSuite standard Entity field) based on "Buy to Vendor" custom field value.
 * - Employee field based on current user
 * - Location (Main Line + Line level) based on Employee record's Location
 * - Department (Main Line + Line level) based on Custom Form



 * Revision History:
 *
 * Date              Issue/Case         Author               Issue Fix Summary
 * =============================================================================================
 * 2022/07/20                         Faye Ang             Initial version
 * 2023/03/07                         Faye Ang             Additional requirment on setting default values for Location + Department
 * 2023/03/10                         Faye Ang             Set Current User in Employee field
 * 2023/04/27                         aduldulao            Set Buy From Vendor and PO Type in the pageinit function
 * 2023/04/28                         aduldulao            Set employee location to standalone PO
 * 2023/06/08                         Faye Ang             Add condition for defaulting of values (postSourcing) to only run on create context
 * 2023/06/12                         aduldulao            Do not trigger vendor price calc if created from SO hyperlink
 *
 */
define(["N/search", "N/currentRecord", "N/runtime"], function (search, currentRecord, runtime) {

    function isEmpty(stValue) {
        return ((stValue === '' || stValue == null || stValue == undefined) || (stValue.constructor === Array && stValue.length == 0) || (stValue.constructor === Object && (function (v) {
            for (var k in v)
                return false;
            return true;
        })(stValue)));
    }

    function pageInit(context) {
        log.debug('mode', context.mode);

        var currRec = context.currentRecord;
        var userID = runtime.getCurrentUser().id;

        if (context.mode == 'create') {

            currRec.setValue({
                fieldId: 'employee',
                value: userID,
                ignoreFieldChange: true,
                forceSyncSourcing: true
            });

            var specialorder = currRec.getValue({fieldId: 'specord'});
            var dropship = currRec.getValue({fieldId: 'dropshipso'}); // does not work
            log.debug({
                title: 'pageInit', details: 'specialorder = ' + specialorder + ' | dropship = ' + dropship
            });

            if (specialorder == 'T') {
                currRec.setValue({
                    fieldId: "custbody_po_type",
                    value: 6
                });
            } else {
                var query = (window.location.search.substring(1));
                var vars = query.split('&');

                for (var i = 0; i < vars.length; i++) {
                    var pair = vars[i].split('=');

                    if (pair[0] == 'dropship' && pair[1] == 'T') {
                        currRec.setValue({
                            fieldId: "custbody_po_type",
                            value: 3
                        });

                    }
                }
            }

            var stBillToVendor = currRec.getValue({fieldId: 'entity'});
            var stParentVendor = '';
            log.debug({
                title: 'pageInit', details: 'stBillToVendor = ' + stBillToVendor
            });

            if (!isEmpty(stBillToVendor)) {
                var objVendor = search.lookupFields({
                    type: 'vendor',
                    id: stBillToVendor,
                    columns: ['custentity_sna_parent_vendor']
                });

                log.debug('pageInit', 'objVendor = ' + JSON.stringify(objVendor));
                if (!isEmpty(objVendor)) {

                    if (!isEmpty(objVendor.custentity_sna_parent_vendor)) {
                        stParentVendor = objVendor.custentity_sna_parent_vendor[0].value;
                    }

                    log.debug('pageInit', 'stParentVendor = ' + stParentVendor);

                    var stBuyFromVendor = currRec.getValue({fieldId: 'custbody_sna_buy_from'});
                    log.debug('pageInit', 'stParentVendor = ' + stParentVendor +
                        ' | stBuyFromVendor = ' + stBuyFromVendor);

                    if (isEmpty(stBuyFromVendor)) {
                        if (!isEmpty(stParentVendor)) {
                            // created from custom special order/drop ship link from SO
                            var orderline = currRec.getValue({
                                fieldId: "custbody_sna_hul_orderid"
                            });

                            var ignorefc = false;
                            if (!isEmpty(orderline)) {
                                ignorefc = true; // ignore fc to retain original PO rate from SO. otherwise, po_vendor_itemprice.js is triggered
                            }

                            currRec.setValue({fieldId: 'entity', value: stParentVendor, ignoreFieldChange: ignorefc});
                            currRec.setValue({fieldId: 'custbody_sna_buy_from', value: stBillToVendor});
                        } else {
                            currRec.setValue({fieldId: 'custbody_sna_buy_from', value: stBillToVendor});
                        }
                    }
                }
            }

        }


    }

    function fieldChanged(context) {
        //log.debug('context', context);

        var currRec = context.currentRecord;
        var field = context.fieldId;
        var sublist = context.sublistId;

        if (field == "custbody_sna_buy_from") {
            console.log({title: 'fieldChanged', details: 'Field: ' + field});

            // created from custom special order/drop ship link from SO
            var orderline = currRec.getValue({
              fieldId: "custbody_sna_hul_orderid"
            });

            var buyFromVendor = currRec.getValue({
                fieldId: "custbody_sna_buy_from"
            });

            console.log({title: 'fieldChanged', details: 'buyFromVendor: ' + buyFromVendor + ' | orderline: ' + orderline});

            var ignorefc = false;
            if (!isEmpty(orderline)) {
              ignorefc = true; // ignore fc to retain original PO rate from SO. otherwise, po_vendor_itemprice.js is triggered
            }

            if (!isEmpty(buyFromVendor)) {
                var parentVendorLookup = search.lookupFields({
                    type: search.Type.VENDOR,
                    id: buyFromVendor,
                    columns: "custentity_sna_parent_vendor"
                });

                console.log({title: 'fieldChanged', details: 'parentVendorLookup: ' + parentVendorLookup});

                if (!isEmpty(parentVendorLookup.custentity_sna_parent_vendor)) {
                    var parentVendor = parentVendorLookup["custentity_sna_parent_vendor"][0].value;

                    console.log({title: 'fieldChanged', details: 'parentVendor: ' + parentVendor});

                    currRec.setValue({
                        fieldId: "entity",
                        value: parentVendor,
                        ignoreFieldChange: ignorefc,
                    });
                } else {
                    currRec.setValue({
                        fieldId: "entity",
                        value: buyFromVendor,
                        ignoreFieldChange: ignorefc,
                    });
                }
            }
        }

        if (sublist == "item" && field == "item") {
            var locationVal = currRec.getValue({
                fieldId: "location"
            });

            var customForm = currRec.getValue({
                fieldId: "customform"
            });

            var itemSublist = currRec.getSublist({
                sublistId: "item"
            });

            var deptColumn = itemSublist.getColumn({
                fieldId: "department"
            });

            console.log({title: 'fieldChanged', details: 'locationVal: ' + locationVal});
            console.log({title: 'fieldChanged', details: 'customForm: ' + customForm});

            if (!isEmpty(locationVal)) {
                currRec.setCurrentSublistValue({
                    sublistId: sublist,
                    fieldId: "location",
                    value: locationVal,
                    ignoreFieldChange: true
                });
            }

            if (customForm == 117) {
                currRec.setCurrentSublistValue({
                    sublistId: sublist,
                    fieldId: "department",
                    value: 18,
                    ignoreFieldChange: true
                });

                deptColumn.isDisabled = true;
            }
        }
    }


    function postSourcing(context) {
        var currRec = context.currentRecord;
        var field = context.fieldId;
        var sublist = context.sublistId;
        var isCreate = currRec.isNew;

        console.log({title: 'postSourcing', details: 'isCreate: ' + isCreate});

        if (isCreate) {
            if (field == 'entity') {
                console.log({title: 'postSourcing', details: 'Field: ' + field});

                //Department Default
                var customForm = currRec.getValue({
                    fieldId: "customform"
                });

                var itemSublist = currRec.getSublist({
                    sublistId: "item"
                });

                var deptColumn = itemSublist.getColumn({
                    fieldId: "department"
                });

                console.log({title: 'postSourcing', details: 'customForm: ' + customForm});

                if (customForm == 108) { //PROD > 108 | SB > 117 = HUL Purchase Order_Parts
                    console.log({title: 'postSourcing', details: 'customForm is PARTS'});

                    //Set Department to Parts (Prod | SB > id: 18)

                    currRec.setValue({
                        fieldId: 'department',
                        value: 18,
                        ignoreFieldChange: true,
                        forceSyncSourcing: true
                    });

                    deptColumn.isDisabled = true;
                } else if (customForm == 130) { //Prod > 130 | SB > 147 = HUL Equipment Purchase Order
                    deptColumn.isMandatory = true;
                }


                //Location Default
                var createdfrom = currRec.getValue({
                    fieldId: "createdfrom"
                });

                var employeeVal = currRec.getValue({
                    fieldId: "employee"
                });

                console.log({
                    title: 'postSourcing',
                    details: 'employeeVal: ' + employeeVal + ' | createdfrom: ' + createdfrom
                });

                // should work for standalone PO only
                if (isEmpty(createdfrom)) {
                    var empLocLookup = search.lookupFields({
                        type: search.Type.EMPLOYEE,
                        id: employeeVal,
                        columns: "location"
                    });

                    console.log({title: 'postSourcing', details: 'empLocLookup: ' + JSON.stringify(empLocLookup)});

                    console.log({
                        title: 'postSourcing',
                        details: 'empLocLookup.location: ' + JSON.stringify(empLocLookup.location)
                    });

                    if (!isEmpty(empLocLookup.location)) {
                        var empLoc = empLocLookup.location[0].value;

                        console.log({title: 'postSourcing', details: 'empLoc: ' + empLoc});

                        currRec.setValue({
                            fieldId: "location",
                            value: empLoc
                        });
                    }
                }

            }
        }
    }

    function lineInit(context) {

        var currRec = context.currentRecord;
        var sublist = context.sublistId;

        if (sublist == "item") {
            var customForm = currRec.getValue({
                fieldId: "customform"
            });

            var itemSublist = currRec.getSublist({
                sublistId: "item"
            });

            var deptColumn = itemSublist.getColumn({
                fieldId: "department"
            });

            if (customForm == 108) { //PROD > 108 | SB > 117 = HUL Purchase Order_Parts
                deptColumn.isDisabled = true;
            } else if (customForm == 130) { //Prod > 130 | SB > 147 = HUL Equipment Purchase Order
                deptColumn.isMandatory = true;
            }

        }
    }

    return {
        pageInit: pageInit,
        fieldChanged: fieldChanged,
        postSourcing: postSourcing,
        lineInit: lineInit
    };
});