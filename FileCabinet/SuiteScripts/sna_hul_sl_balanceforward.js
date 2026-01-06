/*
* Copyright (c) 2020, ScaleNorth Advisors LLC and/or its affiliates. All rights reserved.
*
* @author afrancisco
*
* Script brief description:
* This is a suitelet that will load the Reject form to input Reject Notes.
*
* Revision History:
*
* Date			Issue/Case		Author			Issue Fix Summary
* =============================================================================================
* 2023/07/18					afrancisco         Initial version
* 2023/12/27					aduldulao          Aging customer filter to handle JE line customers
*
*/
/**
 * @NApiVersion 2.1
 * @NScriptType Suitelet
 */
define(['N/ui/serverWidget', 'N/record', 'N/redirect', 'N/workflow', 'N/search', 'N/xml'], function(serverWidget, record, redirect, workflow, search, xml) {
    function onRequest(context) {
        if (context.request.method === 'GET') {
            try{
                var objParams = context.request.parameters;
                log.debug('objParams', objParams);

                //Invoice Balance Forward
                var objBalForward = new Object();
                var objSearch = search.load({id: 'customsearch_sna_balanceforward_srch_2'});
                if(!isEmpty(objParams.strDate)){
                    var objFilter = search.createFilter({name: 'trandate',operator: 'before',values: objParams.strDate});
                    objSearch.filters.push(objFilter)
                }
                var objFilter2 = search.createFilter({name: 'internalidnumber', join: 'customermain',operator: 'equalto',values: objParams.intCustomer});
                objSearch.filters.push(objFilter2);
                objSearch.run().each(function(result){
                    objBalForward.fltInvoice = result.getValue({name: "amountremaining",summary: "SUM",});

                    if(isEmpty(objBalForward.fltInvoice)){
                        objBalForward.fltInvoice = 0.00;
                    }

                });

                //Payment Balance Forward
                var objSearch2 = search.load({id: 'customsearch_sna_balanceforward_srch_2_4'}); //customsearch_sna_balanceforward_srch_2_3
                if(!isEmpty(objParams.strDate)){
                    var objFilter2 = search.createFilter({name: 'trandate',operator: 'before',values: objParams.strDate});
                    objSearch2.filters.push(objFilter2);
                }
                var objFilter22 = search.createFilter({name: 'internalidnumber', join: 'customermain',operator: 'equalto',values: objParams.intCustomer});
                objSearch2.filters.push(objFilter22);
                objSearch2.run().each(function(result){
                    var sumOfAmount, sumOfAmountApplied, sumOfAmountUnapplied;
                    sumOfAmount = isEmpty(result.getValue(result.columns[0])) ? 0.00 : parseFloat(result.getValue(result.columns[0]));
                    sumOfAmountApplied = isEmpty(result.getValue(result.columns[1])) ? 0.00 : parseFloat(result.getValue(result.columns[1]));
                    sumOfAmountUnapplied = isEmpty(result.getValue(result.columns[2])) ? 0.00 : parseFloat(result.getValue(result.columns[2]));
                    objBalForward.fltPayment = sumOfAmountUnapplied; //sumOfAmountApplied + sumOfAmountUnapplied;
                    log.audit('sumOfAmountApplied',sumOfAmountApplied);
                    log.audit('sumOfAmountUnapplied',sumOfAmountUnapplied);
                    objBalForward.fltPaymentAmountApplied = sumOfAmountApplied;
                    objBalForward.fltPaymentAmountUnapplied = sumOfAmountUnapplied;

                    /*var sumOfAmount, sumOfAmountApplied, sumOfAmountUnapplied, sumOfAmountCDApplied, sumOfAmountCDUnapplied;
                    var totalAmountApplied = 0.00, totalAmountUnapplied = 0.00;
                    sumOfAmount = isEmpty(result.getValue(result.columns[0])) ? 0.00 : parseFloat(result.getValue(result.columns[0]));
                    sumOfAmountApplied = isEmpty(result.getValue(result.columns[1])) ? 0.00 : parseFloat(result.getValue(result.columns[1]));
                    sumOfAmountUnapplied = isEmpty(result.getValue(result.columns[2])) ? 0.00 : parseFloat(result.getValue(result.columns[2]));
                    sumOfAmountCDApplied = isEmpty(result.getValue(result.columns[3])) ? 0.00 : parseFloat(result.getValue(result.columns[3]));
                    sumOfAmountCDUnapplied = isEmpty(result.getValue(result.columns[4])) ? 0.00 : parseFloat(result.getValue(result.columns[4]));
                    totalAmountApplied = sumOfAmountApplied + sumOfAmountCDApplied;
                    totalAmountUnapplied = sumOfAmountUnapplied + sumOfAmountCDUnapplied;

                    objBalForward.fltPayment = totalAmountApplied + totalAmountUnapplied;
                    log.audit('totalAmountApplied',totalAmountApplied);
                    log.audit('totalAmountUnapplied',totalAmountUnapplied);
                    objBalForward.fltPaymentAmountApplied = totalAmountApplied;
                    objBalForward.fltPaymentAmountUnapplied = totalAmountUnapplied;*/
                    /*objBalForward.fltPayment = result.getValue({name: "formulanumeric",summary: "SUM",});

                    if(isEmpty(objBalForward.fltPayment)){
                        objBalForward.fltPayment = 0.00;
                    }*/
                });
                objBalForward.fltInvoice = parseFloat(objBalForward.fltInvoice);
                //objBalForward.fltPayment = parseFloat(objBalForward.fltPayment);

                log.audit('objBalForward',objBalForward);

                //Payment Table
                var obj = new Object();
                var arrPayments = new Array();
                var objSearch3 = search.load({id: 'customsearch_sna_balanceforward_srch_2_5'}); //customsearch_sna_balanceforward_srch_2_9 //customsearch_sna_balanceforward_srch_2_2
                if(!isEmpty(objParams.strDate)){
                    var objFilter33 = search.createFilter({name: 'trandate',operator: 'onorafter',values: objParams.strDate}); //onorbefore
                    objSearch3.filters.push(objFilter33);
                }
                var objFilter34 = search.createFilter({name: 'trandate',operator: 'onorbefore',values: objParams.statementDate});
                objSearch3.filters.push(objFilter34);
                var objFilter3 = search.createFilter({name: 'internalidnumber', join: 'customermain',operator: 'equalto',values: objParams.intCustomer});
                objSearch3.filters.push(objFilter3);
                objSearch3.run().each(function(result){
                    var fltTotalAmount, strTotalAmount, fltAmountRem, strAmountRem, fltAppliedAmount, strAppliedAmount = '-';
                    /*if(result.getValue(result.columns[4]).includes("Customer Deposit")){
                        fltTotalAmount = isEmpty(result.getValue(result.columns[2])) ? 0.00 : result.getValue(result.columns[2])
                        strTotalAmount = formatMoney(fltTotalAmount, true);

                        fltAppliedAmount = isEmpty(result.getValue(result.columns[5])) ? 0.00 : result.getValue(result.columns[5])
                        strAppliedAmount = formatMoney(fltAppliedAmount, true);

                        fltAmountRem = isEmpty(result.getValue(result.columns[6])) ? 0.00 : result.getValue(result.columns[6])
                        strAmountRem = formatMoney(fltAmountRem, true);
                    } else {*/
                        //var fltTotalAmount = isEmpty(result.getValue({name: "amount"})) ? 0.00 : result.getValue({name: "amount"})
                        fltTotalAmount = isEmpty(result.getValue(result.columns[2])) ? 0.00 : result.getValue(result.columns[2]);
                        strTotalAmount = formatMoney(fltTotalAmount, true);

                        //var fltAmountRem = isEmpty(result.getValue({name: "amountremaining"})) ? 0.00 : result.getValue({name: "amountremaining"})
                        fltAmountRem = isEmpty(result.getValue(result.columns[3])) ? 0.00 : result.getValue(result.columns[3]);
                        strAmountRem = formatMoney(fltAmountRem, true);

                        fltAppliedAmount = parseFloat(fltTotalAmount) - parseFloat(fltAmountRem);
                        strAppliedAmount = formatMoney(fltAppliedAmount, true);
                    //}

                    //var splitDate = result.getValue(result.columns[0]).split('/');

                    //if(!result.getValue(result.columns[4]).includes("Customer Deposit") && fltAmountRem > 0) {
                        arrPayments.push({
                            //date: result.getValue({name: "trandate"}),
                            //description: result.getValue({name: "formulatext"}),
                            //sortdate: new Date(splitDate[2], splitDate[0], splitDate[1]),
                            date: result.getValue(result.columns[0]),
                            description: result.getValue(result.columns[4]),
                            totalamount: fltTotalAmount,
                            amountremaining: fltAmountRem,
                            strtotalamount: strTotalAmount,
                            strappliedamount: strAppliedAmount,
                            stramountremaining: strAmountRem,
                            otherRef: xml.escape({xmlText: result.getValue({name: 'otherrefnum'}) || ''}),
                        });
                    //}

                    return true;
                });

                log.audit('arrPayments',arrPayments);
                log.audit('arrPayments length',arrPayments.length);

                /*arrPayments  = arrPayments.sort(
                    (objA, objB) => Number(objA.sortdate) - Number(objB.sortdate),
                );*/

                /*var fltAgingAmount = '';
                var fltAgingCurrent = '';
                var fltAging1 = '';
                var fltAging31 = '';
                var fltAging61 = '';
                var fltAging90 = '';*/

                //Aging Table
                var objSearch4 = search.load({id: 'customsearch_sna_agingbalance'});
                //var objFilter4 = search.createFilter({name: 'internalidnumber', join: 'customermain',operator: 'equalto',values: objParams.intCustomer});
                var objFilter4 = search.createFilter({name: 'name',operator: 'anyof',values: objParams.intCustomer});
                objSearch4.filters.push(objFilter4);

                var objResultSet = objSearch4.run();
                var objResult = objResultSet.getRange({start: 0,end: 1})[0];

                var fltAgingAmount = formatMoney(parseFloat(objResult.getValue(objResultSet.columns[0])), true);
                var fltAgingCurrent = formatMoney(parseFloat(objResult.getValue(objResultSet.columns[1])), false);
                var fltAging1 = formatMoney(parseFloat(objResult.getValue(objResultSet.columns[2])), false);
                var fltAging31 = formatMoney(parseFloat(objResult.getValue(objResultSet.columns[3])), false);
                var fltAging61 = formatMoney(parseFloat(objResult.getValue(objResultSet.columns[4])), false);
                var fltAging90 = formatMoney(parseFloat(objResult.getValue(objResultSet.columns[5])), false);

                // get the value of the second column (zero-based index)
                /*var fltAgingAmountInv = parseFloat(objResult.getValue(objResultSet.columns[0]));
                var fltAgingCurrentInv = parseFloat(objResult.getValue(objResultSet.columns[1]));
                var fltAging1Inv = parseFloat(objResult.getValue(objResultSet.columns[2]));
                var fltAging31Inv = parseFloat(objResult.getValue(objResultSet.columns[3]));
                var fltAging61Inv = parseFloat(objResult.getValue(objResultSet.columns[4]));
                var fltAging90Inv = parseFloat(objResult.getValue(objResultSet.columns[5]));

                log.audit('fltAgingAmountInv',fltAgingAmountInv);
                log.audit('fltAgingCurrentInv',fltAgingCurrentInv);
                log.audit('fltAging1Inv',fltAging1Inv);
                log.audit('fltAging31Inv',fltAging31Inv);
                log.audit('fltAging61Inv',fltAging61Inv);
                log.audit('fltAging90Inv',fltAging90Inv);

                //Aging Table Customer Deposit
                var objSearch6 = search.load({id: 'customsearch_sna_agingbalance_3_2'}); //customsearch_sna_agingbalance_3_2_2
                var objFilter6 = search.createFilter({name: 'name',operator: 'anyof',values: objParams.intCustomer});
                objSearch6.filters.push(objFilter6);

                var objResultSet6 = objSearch6.run();
                var objResult6 = objResultSet6.getRange({start: 0,end: 1})[0];

                // get the value of the second column (zero-based index)
                var fltAgingAmountCd = (parseFloat(objResult6.getValue(objResultSet6.columns[0])))? parseFloat(objResult6.getValue(objResultSet6.columns[0])) : 0;
                var fltAgingCurrentCd = (parseFloat(objResult6.getValue(objResultSet6.columns[1])))? parseFloat(objResult6.getValue(objResultSet6.columns[1])) : 0;
                var fltAging1Cd = (parseFloat(objResult6.getValue(objResultSet6.columns[2])))? parseFloat(objResult6.getValue(objResultSet6.columns[2])) : 0;;
                var fltAging31Cd = (parseFloat(objResult6.getValue(objResultSet6.columns[3])))? parseFloat(objResult6.getValue(objResultSet6.columns[3])) : 0;;
                var fltAging61Cd = (parseFloat(objResult6.getValue(objResultSet6.columns[4])))? parseFloat(objResult6.getValue(objResultSet6.columns[4])) : 0;;
                var fltAging90Cd = (parseFloat(objResult6.getValue(objResultSet6.columns[5])))? parseFloat(objResult6.getValue(objResultSet6.columns[5])) : 0;;

                log.audit('fltAgingAmountCd',fltAgingAmountCd);
                log.audit('fltAgingCurrentCd',fltAgingCurrentCd);
                log.audit('fltAging1Cd',fltAging1Cd);
                log.audit('fltAging31Cd',fltAging31Cd);
                log.audit('fltAging61Cd',fltAging61Cd);
                log.audit('fltAging90Cd',fltAging90Cd);

                var fltAgingAmountTotal = fltAgingAmountInv + Number(fltAgingAmountCd);
                var fltAgingCurrentTotal = fltAgingCurrentInv + Number(fltAgingCurrentCd);
                var fltAging1Total = fltAging1Inv + Number(fltAging1Cd);
                var fltAging31Total = fltAging31Inv + Number(fltAging31Cd);
                var fltAging61Total = fltAging61Inv + Number(fltAging61Cd);
                var fltAging90Total = fltAging90Inv + Number(fltAging90Cd);

                log.audit('fltAgingAmountTotal',fltAgingAmountTotal);
                log.audit('fltAgingCurrentTotal',fltAgingCurrentTotal);
                log.audit('fltAging1Total',fltAging1Total);
                log.audit('fltAging31Total',fltAging31Total);
                log.audit('fltAging61Total',fltAging61Total);
                log.audit('fltAging90Total',fltAging90Total);

                fltAgingAmount = formatMoney(fltAgingAmountTotal, true);
                fltAgingCurrent = formatMoney(fltAgingCurrentTotal, false);
                fltAging1 = formatMoney(fltAging1Total, false);
                fltAging31 = formatMoney(fltAging31Total, false);
                fltAging61 = formatMoney(fltAging61Total, false);
                fltAging90 = formatMoney(fltAging90Total, false);*/

                log.audit('fltAgingAmount',fltAgingAmount);
                log.audit('fltAgingCurrent',fltAgingCurrent);
                log.audit('fltAging1',fltAging1);
                log.audit('fltAging31',fltAging31);
                log.audit('fltAging61',fltAging61);
                log.audit('fltAging90',fltAging90);


                //Invoice Table
                var arrInvoices = new Array();
                var objSearch5 = search.load({id: 'customsearch_sna_invoicetable_srch'});
                if(!isEmpty(objParams.strDate)){
                    var objFilter55 = search.createFilter({name: 'trandate',operator: 'onorafter',values: objParams.strDate});
                    objSearch5.filters.push(objFilter55);
                }
                var objFilter5 = search.createFilter({name: 'internalidnumber', join: 'customermain',operator: 'equalto',values: objParams.intCustomer});
                objSearch5.filters.push(objFilter5);
                objSearch5.run().each(function(result){

                    var fltTotalAmount = isEmpty(result.getValue({name: "amount"})) ? 0.00 : result.getValue({name: "amount"})
                    var strTotalAmount = formatMoney(fltTotalAmount, true);

                    var fltAmountRem = isEmpty(result.getValue({name: "amountremaining"})) ? 0.00 : result.getValue({name: "amountremaining"})
                    var strAmountRem = formatMoney(fltAmountRem, true);

                    arrInvoices.push({
                        id: result.id,
                        date: result.getValue({name: "trandate"}),
                        description: result.getValue({name: "formulatext"}),
                        totalamount: fltTotalAmount,
                        amountremaining: fltAmountRem,
                        strtotalamount: strTotalAmount,
                        stramountremaining: strAmountRem,
                        otherRef: xml.escape({xmlText: result.getValue({name: 'otherrefnum'}) || ''}),
                    });

                    return true;
                })

                log.debug('arrInvoices', arrInvoices);
                log.debug('arrInvoices length', arrInvoices.length);
                log.debug('arrPayments', arrPayments);
                log.debug('arrPayments length', arrPayments.length);

                // log.audit('arrInvoices',arrInvoices);

              log.audit({title:"Response", details:"<#assign fltInvBalForward=" + objBalForward.fltInvoice + " /> "
                    + "<#assign fltPayBalForward=" + objBalForward.fltPayment + " /> "
                    + "<#assign fltPayAmountApplied=" + objBalForward.fltPaymentAmountApplied + " /> "
                    + "<#assign fltPayAmountUnapplied=" + objBalForward.fltPaymentAmountUnapplied + " /> "
                    + "<#assign arrPayments='" + JSON.stringify(arrPayments) + "' /> "
                    + "<#assign arrInvoices='" + JSON.stringify(arrInvoices) + "' /> "
                    + "<#assign fltCurrent='" + fltAgingCurrent + "' /> "
                    + "<#assign fltAging1='" + fltAging1 + "' /> "
                    + "<#assign fltAging31='" + fltAging31 + "' /> "
                    + "<#assign fltAging61='" + fltAging61 + "' /> "
                    + "<#assign fltAging90='" + fltAging90 + "' /> "
                    + "<#assign fltAgingAmount='" + fltAgingAmount + "' /> "})

                context.response.write(
                    "<#assign fltInvBalForward=" + objBalForward.fltInvoice + " /> "
                    + "<#assign fltPayBalForward=" + objBalForward.fltPayment + " /> "
                    + "<#assign fltPayAmountApplied=" + objBalForward.fltPaymentAmountApplied + " /> "
                    + "<#assign fltPayAmountUnapplied=" + objBalForward.fltPaymentAmountUnapplied + " /> "
                    + "<#assign arrPayments='" + JSON.stringify(arrPayments) + "' /> "
                    + "<#assign arrInvoices='" + JSON.stringify(arrInvoices) + "' /> "
                    + "<#assign fltCurrent='" + fltAgingCurrent + "' /> "
                    + "<#assign fltAging1='" + fltAging1 + "' /> "
                    + "<#assign fltAging31='" + fltAging31 + "' /> "
                    + "<#assign fltAging61='" + fltAging61 + "' /> "
                    + "<#assign fltAging90='" + fltAging90 + "' /> "
                    + "<#assign fltAgingAmount='" + fltAgingAmount + "' /> "
                );
            }catch(ex){
                log.error('Catch onRequest', ex)

                context.response.write(
                    "<#assign fltInvBalForward='' /> " +
                    "<#assign fltPayBalForward='' />"+
                    "<#assign arrPayments=''/>"
                    // "<#assign fltAgingCurrent='' />" +
                    // "<#assign fltAging1='' />" +
                    // "<#assign fltAging31='' />" +
                    // "<#assign fltAging61='' />" +
                    // "<#assign fltAging90='' />" +
                    // "<#assign fltAgingAmount='' />"
                );
            }

        }
    }

    function formatMoney(amount, iscurrency, decimalCount = 2, decimal = ".", thousands = ",") {
        try {
            decimalCount = Math.abs(decimalCount);
            decimalCount = isNaN(decimalCount) ? 2 : decimalCount;

            amount = parseFloat(amount);

            const isNegative = amount < 0 ? true : false

            let i = parseInt(amount = Math.abs(Number(amount) || 0).toFixed(decimalCount)).toString();
            let j = (i.length > 3) ? i.length % 3 : 0;

            let currency = ''
            if(iscurrency){
                currency = '$';
            }
            var formattedString =  (j ? i.substr(0, j) + thousands : '') +
                i.substr(j).replace(/(\d{3})(?=\d)/g, "$1" + thousands) +
                (decimalCount ? decimal + Math.abs(amount - i).toFixed(decimalCount).slice(2) : "")

            if(isNegative){
                formattedString = currency + '(' + formattedString + ')';
            }else{
                formattedString = currency + formattedString;
            }


            return formattedString;
        } catch (e) {
            log.audit('formatMoney catch', e)
        }
    };

    function isEmpty(stValue) {
        return ((stValue === '' || stValue == null || stValue == undefined)
            || (stValue.constructor === Array && stValue.length == 0)
            || (stValue.constructor === Object && (function (v) {
                for (var k in v) return false;
                return true;
            })(stValue)));
    }

    return {
        onRequest: onRequest
    };
});