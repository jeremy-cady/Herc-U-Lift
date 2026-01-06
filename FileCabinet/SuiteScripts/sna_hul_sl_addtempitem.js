/*
 * Copyright (c) 2023, ScaleNorth Advisors LLC and/or its affiliates. All rights reserved.
 *
 * @author aduldulao
 *
 * Script brief description:
 * SL script of the Add Temporary Item button
 *
 * Revision History:
 *
 * Date              Issue/Case          Author          Issue Fix Summary
 * =============================================================================================
 * 2023/7/4       		                 aduldulao       Initial version.
 *
 */

/**
 * @NApiVersion 2.1
 * @NScriptType Suitelet
 */
define(['N/record', 'N/redirect', 'N/search', 'N/ui/serverWidget', 'N/runtime', 'N/ui/message'],
    /**
 * @param{record} record
 * @param{redirect} redirect
 * @param{search} search
 * @param{serverWidget} serverWidget
 */
    (record, redirect, search, serverWidget, runtime, message) => {

        // UTILITY FUNCTIONS
        function isEmpty(stValue) {
            return ((stValue === '' || stValue == null || stValue == undefined) || (stValue.constructor === Array && stValue.length == 0) || (stValue.constructor === Object && (function (v) {
                for (var k in v)
                    return false;
                return true;
            })(stValue)));
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

        /**
         * Defines the Suitelet script trigger point.
         * @param {Object} scriptContext
         * @param {ServerRequest} scriptContext.request - Incoming request
         * @param {ServerResponse} scriptContext.response - Suitelet response
         * @since 2015.2
         */
        const onRequest = (scriptContext) => {
            var method = scriptContext.request.method;

            var currentScript = runtime.getCurrentScript();
            var tempitemcat = currentScript.getParameter({name: 'custscript_sna_hul_tempitemcat'});
            var allieditemcat = currentScript.getParameter({name: 'custscript_sna_hul_tempitemcat_allied'});
            var rackingitemcat = currentScript.getParameter({name: 'custscript_sna_hul_tempitemcat_reacking'});
            var storageitemcat = currentScript.getParameter({name: 'custscript_sna_hul_tempitemcat_storage'});

            // GET
            if (method == 'GET') {
                var params = scriptContext.request.parameters;
                log.debug({title: 'GET - params', details: JSON.stringify(params)});

                var addednew = params.addednew;

                var form = serverWidget.createForm({title : 'Temporary Items', hideNavBar : true});
                form.clientScriptModulePath = './sna_hul_cs_addtempitem.js';

                // --------------------------------------------------------------------------------------------------------------------------------------------------

                // header confirmation if from post
                if (addednew) {
                    form.addPageInitMessage({
                        message: 'Temporary Item added',
                        type: message.Type.CONFIRMATION
                    });
                }

                // --------------------------------------------------------------------------------------------------------------------------------------------------


                // create header fields
                var itemfld = form.addField({id: 'custpage_itemfld', type: serverWidget.FieldType.SELECT, label: 'Item'});
                itemfld.isMandatory = true;
                var vendorfld = form.addField({id: 'custpage_vendorfld', type: serverWidget.FieldType.SELECT, label: 'Vendor', source: 'vendor'});
                vendorfld.isMandatory = true;
                var vendoritmcodefld = form.addField({id: 'custpage_vendoritmcodefld', type: serverWidget.FieldType.TEXT, label: 'Vendor Item Code'});
                vendoritmcodefld.isMandatory = true;
                var qtyfld = form.addField({id: 'custpage_qtyfld', type: serverWidget.FieldType.INTEGER, label: 'Quantity'});
                qtyfld.isMandatory = true;
                var poratefld = form.addField({id: 'custpage_poratefld', type: serverWidget.FieldType.CURRENCY, label: 'PO Rate'});
                poratefld.isMandatory = true;
                poratefld.updateBreakType({breakType: serverWidget.FieldBreakType.STARTCOL});
                var descfld = form.addField({id: 'custpage_descfld', type: serverWidget.FieldType.TEXTAREA, label: 'Description'});
                descfld.isMandatory = true;
                var shipmethodfld = form.addField({id: 'custpage_shipmethodfld', type: serverWidget.FieldType.SELECT, label: 'Shipping Method (Vendor)'});
                var rectypefld = form.addField({id: 'custpage_rectypefld', type: serverWidget.FieldType.TEXT, label: 'Record Type'});
                rectypefld.defaultValue = params.rectype;
                rectypefld.updateDisplayType({displayType: serverWidget.FieldDisplayType.HIDDEN});

                // --------------------------------------------------------------------------------------------------------------------------------------------------

                // add submit button
                form.addSubmitButton({label: 'Submit'});
                form.addButton({id: 'custpage_createagain', label: 'Submit and Create Again', functionName: 'submitAgain()'});

                // --------------------------------------------------------------------------------------------------------------------------------------------------

                // get select options
                var tempitems = getTempItems([tempitemcat, allieditemcat, rackingitemcat, storageitemcat]);
                log.debug({title: 'tempitems', details: 'len: ' + tempitems.length});

                itemfld.addSelectOption({value: '', text: ''});

                for (var i = 0; i < tempitems.length; i++){
                    var result = tempitems[i];

                    itemfld.addSelectOption({value: result.getValue({name: 'internalid'}), text: result.getValue({name: 'itemid'})});
                }

                var shiprec = record.create({type: 'customrecord_shipping_list', isDynamic: true});
                var shipFld = shiprec.getField({fieldId: 'custrecord_shipping_list'});

                var options = shipFld.getSelectOptions();

                shipmethodfld.addSelectOption({value: '', text: ''});

                for (var j = 0; j < options.length; j++){
                    shipmethodfld.addSelectOption({value: options[j].value, text: options[j].text});
                }

                scriptContext.response.writePage(form);
            }
            // POST
            else {
                var request = scriptContext.request;
                var params = request.parameters;

                log.debug({title: 'POST - params', details: JSON.stringify(params)});

                var rectype = params.custpage_rectypefld;
                var item = params.custpage_itemfld;
                var vendor = params.custpage_vendorfld;
                var vendoritmcode = params.custpage_vendoritmcodefld;
                var qty = params.custpage_qtyfld;
                var porate = params.custpage_poratefld;
                var desc = params.custpage_descfld;
                var shipmethod = params.custpage_shipmethodfld;

                var stHtml = '<script language="JavaScript">';
                stHtml += 'if (window.opener)';
                stHtml += '{';
                stHtml += "window.opener.nlapiSelectNewLineItem('item');"
                stHtml += "window.opener.nlapiSetCurrentLineItemValue('item','item','" + item + "',true,true);"
                stHtml += "window.opener.nlapiSetCurrentLineItemValue('item','custcol_sna_hul_ship_meth_vendor','" + shipmethod + "',true,true);"
                stHtml += "window.opener.nlapiSetCurrentLineItemValue('item','custcol_sna_hul_item_vendor','" + vendor + "',true,true);"
                stHtml += "window.opener.nlapiSetCurrentLineItemValue('item','custcol_sna_hul_vendor_item_code','" + vendoritmcode + "',true,true);"
                stHtml += "window.opener.nlapiSetCurrentLineItemValue('item','quantity','" + qty + "',true,true);"
                if (rectype == 'salesorder') {
                    stHtml += "window.opener.nlapiSetCurrentLineItemValue('item','porate','" + porate + "',true,true);"
                }
                else {
                    stHtml += "window.opener.nlapiSetCurrentLineItemValue('item','custcol_sna_hul_estimated_po_rate','" + porate + "',true,true);"
                }

                stHtml += "window.opener.nlapiSetCurrentLineItemValue('item','description','" + desc + "',true,true);"
                stHtml += "window.opener.nlapiCommitLineItem('item');"
                stHtml += '}';
                stHtml += 'window.close();';
                stHtml += '</script>';

                scriptContext.response.write({output: stHtml});
            }
        }

        /**
         * Get temporary items
         * @param itemcategories
         * @returns {*|*[]|*[]}
         */
        function getTempItems(itemcategories) {
            var filters = [];
            filters.push(search.createFilter({name: 'custitem_sna_hul_itemcategory', operator: search.Operator.ANYOF, values: itemcategories}));

            var columns = [];
            columns.push(search.createColumn({name: 'internalid'}));
            columns.push(search.createColumn({name: 'itemid'}));

            var srch = search.create({type: search.Type.ITEM, columns: columns, filters: filters});

            var searchall = searchAllResults(srch);

            log.debug(({title: 'getTempItems', details: searchall}));

            return searchall;
        }

        return {onRequest}

    });
