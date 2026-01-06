/*
 * Copyright (c) 2023, ScaleNorth Advisors LLC and/or its affiliates. All rights reserved.
 *
 * @author aduldulao
 *
 * Script brief description:
 * Suitelet to show item pricing column values
 *
 * Revision History:
 *
 * Date              Issue/Case          Author          Issue Fix Summary
 * =============================================================================================
 * 2023/1/5       		                 aduldulao       Initial version.
 *
 */

/**
 * @NApiVersion 2.1
 * @NScriptType Suitelet
 */
define(['N/search', 'N/ui/serverWidget'],
    /**
 * @param{search} search
 * @param{serverWidget} serverWidget
 */
    (search, serverWidget) => {

        // UTILITY FUNCTIONS
        function isEmpty(stValue) {
            return ((stValue === '' || stValue == null || stValue == undefined) || (stValue.constructor === Array && stValue.length == 0) || (stValue.constructor === Object && (function(v) {
                for ( var k in v)
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
            var method = scriptContext.request.method;
            var params = scriptContext.request.parameters;

            if (method == 'GET') {
                log.debug({title: 'GET - params', details: JSON.stringify(params)});

                var form = serverWidget.createForm({title : 'Other Details', hideNavBar : true});

                // create header fields
                var itemcatfld = form.addField({id: 'custpage_itemcatfld', type: serverWidget.FieldType.SELECT, label: 'Item Category', source: 'customrecord_sna_hul_itemcategory'});
                itemcatfld.updateDisplayType({displayType: serverWidget.FieldDisplayType.INLINE});

                var itempricelvlfld = form.addField({id: 'custpage_itempricelvlfld', type: serverWidget.FieldType.SELECT, label: 'Item Price Level', source: 'customrecord_sna_hul_itempricelevel'});
                itempricelvlfld.updateDisplayType({displayType: serverWidget.FieldDisplayType.INLINE});

                var markupfld = form.addField({id: 'custpage_markupfld', type: serverWidget.FieldType.PERCENT, label: '% Mark Up'});
                markupfld.updateDisplayType({displayType: serverWidget.FieldDisplayType.INLINE});

                var itmdiscgrpfld = form.addField({id: 'custpage_itmdiscgrpfld', type: serverWidget.FieldType.SELECT, label: 'Item Discount Group', source: 'customrecord_sna_hul_itemdiscountgroup'});
                itmdiscgrpfld.updateDisplayType({displayType: serverWidget.FieldDisplayType.INLINE});

                var markupchangefld = form.addField({id: 'custpage_markupchangefld', type: serverWidget.FieldType.PERCENT, label: '% Mark Up Change'});
                markupchangefld.updateDisplayType({displayType: serverWidget.FieldDisplayType.INLINE});

                var locmarkupfld = form.addField({id: 'custpage_locmarkupfld', type: serverWidget.FieldType.SELECT, label: 'Location % Mark Up', source: 'customrecord_sna_hul_locationmarkup'});
                locmarkupfld.updateDisplayType({displayType: serverWidget.FieldDisplayType.INLINE});

                var locmarkupchangefld = form.addField({id: 'custpage_locmarkupchangefld', type: serverWidget.FieldType.PERCENT, label: 'Location % Mark Up Change'});
                locmarkupchangefld.updateDisplayType({displayType: serverWidget.FieldDisplayType.INLINE});

                var repcostfld = form.addField({id: 'custpage_repcostfld', type: serverWidget.FieldType.TEXT, label: 'Replacement Cost'});
                repcostfld.updateDisplayType({displayType: serverWidget.FieldDisplayType.INLINE});

                var listprcefld = form.addField({id: 'custpage_listprcefld', type: serverWidget.FieldType.TEXT, label: 'List Price'});
                listprcefld.updateDisplayType({displayType: serverWidget.FieldDisplayType.INLINE});

                var basisfld = form.addField({id: 'custpage_basisfld', type: serverWidget.FieldType.SELECT, label: 'Basis', source: 'customlist_srp_or_replacementcost'});
                basisfld.updateDisplayType({displayType: serverWidget.FieldDisplayType.INLINE});

                if (isEmpty(params.lineid)) return;

                var filters_ = [];
                filters_.push(search.createFilter({name: 'lineuniquekey', operator: search.Operator.EQUALTO, values: params.lineid}));

                var columns_ = [];
                columns_.push(search.createColumn({name: 'custcol_sna_hul_itemcategory'}));
                columns_.push(search.createColumn({name: 'custcol_sna_hul_item_pricelevel'}));
                columns_.push(search.createColumn({name: 'custcol_sna_hul_markup'}));
                columns_.push(search.createColumn({name: 'custcol_item_discount_grp'}));
                columns_.push(search.createColumn({name: 'custcol_sna_hul_markupchange'}));
                columns_.push(search.createColumn({name: 'custcol_sna_hul_loc_markup'}));
                columns_.push(search.createColumn({name: 'custcol_sna_hul_loc_markupchange'}));
                columns_.push(search.createColumn({name: 'custcol_sna_hul_replacementcost'}));
                columns_.push(search.createColumn({name: 'custcol_sna_hul_list_price'}));
                columns_.push(search.createColumn({name: 'custcol_sna_hul_basis'}));

                var transearch = search.create({type: 'salesorder', filters: filters_, columns: columns_});
                var tranres = transearch.run().getRange({start: 0, end: 1});

                if (!isEmpty(tranres)) {
                    var soid = tranres[0].id;

                    itemcatfld.defaultValue = tranres[0].getValue({name: 'custcol_sna_hul_itemcategory'});
                    itempricelvlfld.defaultValue = tranres[0].getValue({name: 'custcol_sna_hul_item_pricelevel'});
                    markupfld.defaultValue = tranres[0].getValue({name: 'custcol_sna_hul_markup'});
                    itmdiscgrpfld.defaultValue = tranres[0].getValue({name: 'custcol_item_discount_grp'});
                    markupchangefld.defaultValue = tranres[0].getValue({name: 'custcol_sna_hul_markupchange'});
                    locmarkupfld.defaultValue = tranres[0].getValue({name: 'custcol_sna_hul_loc_markup'});
                    locmarkupchangefld.defaultValue = tranres[0].getValue({name: 'custcol_sna_hul_loc_markupchange'});
                    repcostfld.defaultValue = tranres[0].getValue({name: 'custcol_sna_hul_replacementcost'});
                    listprcefld.defaultValue = tranres[0].getValue({name: 'custcol_sna_hul_list_price'});
                    basisfld.defaultValue = tranres[0].getValue({name: 'custcol_sna_hul_basis'});
                }

                scriptContext.response.writePage(form);
            }
        }

        return {onRequest}

    });
