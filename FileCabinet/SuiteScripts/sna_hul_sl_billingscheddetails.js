/*
 * Copyright (c) 2023, ScaleNorth Advisors LLC and/or its affiliates. All rights reserved.
 *
 * @author aduldulao
 *
 * Script brief description:
 * Suitelet script to show billing schedules and invoices
 *
 * Revision History:
 *
 * Date              Issue/Case          Author          Issue Fix Summary
 * =============================================================================================
 * 2023/7/22       		                 aduldulao       Initial version.
 * 2023/8/11       		                 aduldulao       Rental enhancements
 *
 */

/**
 * @NApiVersion 2.1
 * @NScriptType Suitelet
 */
define(['N/format', 'N/record', 'N/search', 'N/ui/serverWidget'],
    /**
 * @param{format} format
 * @param{record} record
 * @param{search} search
 * @param{serverWidget} serverWidget
 */
    (format, record, search, serverWidget) => {

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

                // params.lineid

                var form = serverWidget.createForm({title : 'Billing Schedule', hideNavBar : true});

                // create header fields
                var sofld = form.addField({id: 'custpage_sofld', type: serverWidget.FieldType.SELECT, label: 'Sales Order', source: 'salesorder'});
                sofld.updateDisplayType({displayType: serverWidget.FieldDisplayType.INLINE});

                var itmfld = form.addField({id: 'custpage_itmfld', type: serverWidget.FieldType.SELECT, label: 'Item', source: 'item'});
                itmfld.updateDisplayType({displayType: serverWidget.FieldDisplayType.INLINE});

                var linefld = form.addField({id: 'custpage_linefld', type: serverWidget.FieldType.TEXT, label: 'Line #'});
                linefld.updateDisplayType({displayType: serverWidget.FieldDisplayType.INLINE});

                var startfld = form.addField({id: 'custpage_startfld', type: serverWidget.FieldType.DATE, label: 'Start Date'});
                startfld.updateDisplayType({displayType: serverWidget.FieldDisplayType.INLINE});

                var endfld = form.addField({id: 'custpage_endfld', type: serverWidget.FieldType.DATE, label: 'End Date'});
                endfld.updateDisplayType({displayType: serverWidget.FieldDisplayType.INLINE});

                var totalfld = form.addField({id: 'custpage_totalfld', type: serverWidget.FieldType.CURRENCY, label: 'Total Amount'});
                totalfld.updateDisplayType({displayType: serverWidget.FieldDisplayType.INLINE});

                // create sublist
                var schedsublist = form.addSublist({id: 'custpage_schedsublist', type: serverWidget.SublistType.LIST, label: 'Billing Schedule'});
                var countsubfld = schedsublist.addField({id: 'custpage_countsubfld', type: serverWidget.FieldType.TEXT, label: 'Count'});
                var billdatesubfld = schedsublist.addField({id: 'custpage_billdatesubfld', type: serverWidget.FieldType.DATE, label: 'Bill Date'});
                var fromdatesubfld = schedsublist.addField({id: 'custpage_fromdatesubfld', type: serverWidget.FieldType.DATE, label: 'From'});
                var todatesubfld = schedsublist.addField({id: 'custpage_todatesubfld', type: serverWidget.FieldType.DATE, label: 'To'});
                var invsubfld = schedsublist.addField({id: 'custpage_invsubfld', type: serverWidget.FieldType.SELECT, label: 'Invoice', source: 'invoice'});
                invsubfld.updateDisplayType({displayType: serverWidget.FieldDisplayType.INLINE});
                var invamtsubfld = schedsublist.addField({id: 'custpage_invamtsubfld', type: serverWidget.FieldType.CURRENCY, label: 'Invoice Amount'});
                invsubfld.updateDisplayType({displayType: serverWidget.FieldDisplayType.INLINE});

                if (isEmpty(params.lineid)) return;

                var finaldata = {};

                var filters_ = [];
                filters_.push(search.createFilter({name: 'lineuniquekey', operator: search.Operator.EQUALTO, values: params.lineid}));

                var columns_ = [];
                columns_.push(search.createColumn({name: 'internalid', summary: 'GROUP'}));
                columns_.push(search.createColumn({name: 'item', summary: 'GROUP'}));
                columns_.push(search.createColumn({name: 'linesequencenumber', summary: 'GROUP'}));
                columns_.push(search.createColumn({name: 'startdate', summary: 'GROUP'}));
                columns_.push(search.createColumn({name: 'enddate', summary: 'GROUP'}));
                columns_.push(search.createColumn({name: 'custcol_sna_hul_bill_date', summary: 'GROUP'}));
                columns_.push(search.createColumn({name: 'custcol_sn_hul_billingsched', summary: 'GROUP'}));
                columns_.push(search.createColumn({name: 'custcol_sna_hul_rent_start_date', summary: 'GROUP'}));
                columns_.push(search.createColumn({name: 'custcol_sna_hul_rent_end_date', summary: 'GROUP'}));
                columns_.push(search.createColumn({name: 'quantity', summary: 'GROUP'}));
                columns_.push(search.createColumn({name: 'amount', summary: 'AVG'}));
                columns_.push(search.createColumn({name: 'applyingtransaction', summary: 'GROUP'})); // invoice
                columns_.push(search.createColumn({name: 'trandate', join: 'applyingTransaction', summary: 'GROUP'}));
                columns_.push(search.createColumn({name: 'custcol_sna_hul_rent_start_date', join: 'applyingTransaction', summary: 'GROUP'})); // from date
                columns_.push(search.createColumn({name: 'custcol_sna_hul_rent_end_date', join: 'applyingTransaction', summary: 'GROUP'})); // to date
                columns_.push(search.createColumn({name: 'quantity', join: 'applyingTransaction', summary: 'GROUP'}));
                columns_.push(search.createColumn({name: 'amount', join: 'applyingTransaction', summary: 'AVG'}));

                var transearch = search.create({type: search.Type.SALES_ORDER, filters: filters_, columns: columns_});
                transearch.run().each(function(result) {
                    var soid = result.getValue({name: 'internalid', summary: 'GROUP'});
                    sofld.defaultValue = soid;
                    var soitm = result.getValue({name: 'item', summary: 'GROUP'});
                    itmfld.defaultValue = soitm;
                    var solne = result.getValue({name: 'linesequencenumber', summary: 'GROUP'});
                    linefld.defaultValue = solne;
                    var sostart = result.getValue({name: 'custcol_sna_hul_rent_start_date', summary: 'GROUP'});
                    startfld.defaultValue = sostart;
                    var soend = result.getValue({name: 'custcol_sna_hul_rent_end_date', summary: 'GROUP'});
                    endfld.defaultValue = soend;
                    var soamt = result.getValue({name: 'amount', summary: 'AVG'});
                    totalfld.defaultValue = soamt;

                    var billdate = result.getValue({name: 'custcol_sna_hul_bill_date', summary: 'GROUP'});
                    var billsched = result.getValue({name: 'custcol_sn_hul_billingsched', summary: 'GROUP'});
                    var amt = result.getValue({name: 'amount', summary: 'AVG'});
                    var invamt = result.getValue({name: 'amount', join: 'applyingTransaction', summary: 'AVG'});
                    var invid = result.getValue({name: 'applyingtransaction', summary: 'GROUP'});

                    log.debug({title: 'GET', details: 'billsched: ' + JSON.stringify(billsched)});

                    if (!isEmpty(billsched) && billsched != '- None -') {
                        var arrbilldates = JSON.parse(billsched);

                        for (var z = 0; z < arrbilldates.length; z++) {
                            var fromdate = !isEmpty(arrbilldates[z].fromdate) ? format.format({value: new Date(arrbilldates[z].fromdate), type: format.Type.DATE}) : '';
                            var todate = !isEmpty(arrbilldates[z].todate) ? format.format({value: new Date(arrbilldates[z].todate), type: format.Type.DATE}) : '';
                            var duedate = arrbilldates[z].billdate;

                            if (!isEmpty(fromdate) && !isEmpty(todate) && isEmpty(finaldata[fromdate+'-'+todate])) {
                                finaldata[fromdate+'-'+todate] = {};
                                finaldata[fromdate+'-'+todate].soamt = amt;
                                finaldata[fromdate+'-'+todate].fromdate = fromdate;
                                finaldata[fromdate+'-'+todate].todate = todate;
                                finaldata[fromdate+'-'+todate].billdate = duedate;
                            }

                        }

                        var invfromdate = result.getValue({name: 'custcol_sna_hul_rent_start_date', join: 'applyingTransaction', summary: 'GROUP'});
                        invfromdate = (!isEmpty(invfromdate) && invfromdate != '- None -') ? format.format({value: new Date(invfromdate), type: format.Type.DATE}) : '';
                        var invtodate = result.getValue({name: 'custcol_sna_hul_rent_end_date', join: 'applyingTransaction', summary: 'GROUP'});
                        invtodate = (!isEmpty(invtodate) && invtodate != '- None -') ? format.format({value: new Date(invtodate), type: format.Type.DATE}) : '';
                        var invtrandate = result.getValue({name: 'trandate', join: 'applyingTransaction', summary: 'GROUP'});
                        invtrandate = (!isEmpty(invtrandate) && invtrandate != '- None -') ? format.format({value: new Date(invtrandate), type: format.Type.DATE}) : '';

                        // allow override to get invoice details
                        if (!isEmpty(invfromdate) && !isEmpty(invtodate)) {
                            finaldata[invfromdate+'-'+invtodate] = {};
                            finaldata[invfromdate+'-'+invtodate].soamt = amt;
                            finaldata[invfromdate+'-'+invtodate].fromdate = invfromdate;
                            finaldata[invfromdate+'-'+invtodate].todate = invtodate;
                            finaldata[invfromdate+'-'+invtodate].billdate = invtrandate;
                            finaldata[invfromdate+'-'+invtodate].invid = invid;
                            finaldata[invfromdate+'-'+invtodate].invamt = invamt;
                        }
                    }

                    // single invoice created only
                    else {
                        var rentstart = result.getValue({name: 'custcol_sna_hul_rent_start_date', summary: 'GROUP'});
                        rentstart = (!isEmpty(rentstart) && rentstart != '- None -') ? format.format({value: new Date(rentstart), type: format.Type.DATE}) : '';
                        var rentend = result.getValue({name: 'custcol_sna_hul_rent_end_date', summary: 'GROUP'});
                        rentend = (!isEmpty(rentend) && rentend != '- None -') ? format.format({value: new Date(rentend), type: format.Type.DATE}) : '';

                        if (!isEmpty(rentstart) && !isEmpty(rentend)) {
                            finaldata[rentstart+'-'+rentend] = {};
                            finaldata[rentstart+'-'+rentend].soamt = amt;
                            finaldata[rentstart+'-'+rentend].fromdate = rentstart;
                            finaldata[rentstart+'-'+rentend].todate = rentend;
                            finaldata[rentstart+'-'+rentend].billdate = billdate;
                            finaldata[rentstart+'-'+rentend].invid = invid;
                            finaldata[rentstart+'-'+rentend].invamt = invamt;
                        }
                    }

                    return true;
                });

                log.debug({title: 'GET', details: 'finaldata: ' + JSON.stringify(finaldata)});

                var arrfinal = [];
                for (var ind in finaldata) {
                    arrfinal.push(finaldata[ind]);
                }

                arrfinal.sort(function(a, b) {
                    return (new Date(a.fromdate) > new Date(b.fromdate)) ? 1 : -1
                });

                log.debug({title: 'GET', details: 'arrfinal: ' + JSON.stringify(arrfinal)});


                // set sublist
                for (var v = 0; v < arrfinal.length; v++) {
                    var bdate = !isEmpty(arrfinal[v].billdate) ? format.format({value: new Date(arrfinal[v].billdate), type: format.Type.DATE}) : '';
                    var fdate = !isEmpty(arrfinal[v].fromdate) ? format.format({value: new Date(arrfinal[v].fromdate), type: format.Type.DATE}) : '';
                    var tdate = !isEmpty(arrfinal[v].todate) ? format.format({value: new Date(arrfinal[v].todate), type: format.Type.DATE}) : '';

                    schedsublist.setSublistValue({id: 'custpage_countsubfld', line: v, value: (parseInt(v)+1)});
                    schedsublist.setSublistValue({id: 'custpage_billdatesubfld', line: v, value: bdate});
                    schedsublist.setSublistValue({id: 'custpage_fromdatesubfld', line: v, value: fdate});
                    schedsublist.setSublistValue({id: 'custpage_todatesubfld', line: v, value: tdate});
                    if (!isEmpty(arrfinal[v].invid)) {
                        schedsublist.setSublistValue({id: 'custpage_invsubfld', line: v, value: arrfinal[v].invid});
                    }
                    if (!isEmpty(arrfinal[v].invamt)) {
                        schedsublist.setSublistValue({id: 'custpage_invamtsubfld', line: v, value: arrfinal[v].invamt});
                    }
                }

                scriptContext.response.writePage(form);
            }
        }

        return {onRequest}

    });
