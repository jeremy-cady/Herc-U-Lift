/*
* Copyright (c) 2022, ScaleNorth Advisors LLC and/or its affiliates. All rights reserved.
*
* @author natoretiro
*
* Script brief description:
* (BRIEF DESCRIPTION)
*
* Revision History:
*
* Date			            Issue/Case		    Author			    Issue Fix Summary
* =======================================================================================================
* 2022/07/20						            natoretiro      	Initial version
*
*/

/**
 *@NApiVersion 2.x
 *@NScriptType ClientScript
 */
define([
        'N/record',
        'N/runtime',
        'N/search',
        'N/format',
        'N/error',
        'N/currentRecord',
        'N/https',
        'N/http',
        'N/url',
        'N/ui/dialog',
        'N/xml',
        'N/ui/message'

    ],

    function (record, runtime, search, format, error, currentRecord, https, http, url, dialog, xmlMod, message) {
        var OBJITEMDETAILS = {};
        var CURRENTRECORD = null;
        var ITEM_SUBSIDIARY = 2;    //Herc-U-Lift Parent NR : Herc-U-Lift, Inc.
        var ITEM_COGS_ACCOUNT= 628;   // 50025 COGS - New Equipment : COGS - New Equip - Other
        var ITEM_ASSET_ACCOUNT= 444;  //13012 Inventory : New Equipment : Inventory - New Equipment
        var ITEM_LOCATION = 8;  //Herc-U-Lift, Inc .Grand Rapids
        var intErrCount = 0;

        function pageInit_(context)
        {
            //debugger;
            // var newRecord = context.currentRecord;
            CURRENTRECORD = currentRecord.get();

            jQuery(".uir-table-block").hide();

        }

        function emailQuote(stTranId)
        {
            debugger;

            // var msg = message.create({
            //     title: "LiftNet",
            //     message: "Sending Email...",
            //     type: message.Type.ERROR
            // });
            //
            // msg.show({
            //     duration: 3000
            // });

            var stCurrentUser = runtime.getCurrentUser().id;
            var stURL = url.resolveScript({
                scriptId: 'customscript_sna_hul_sl_sendquoteviaemai',
                deploymentId: 'customdeploy_sna_hul_sl_sendquoteviaemai',
                returnExternalUrl: true
            });
            stURL = stURL + '&tranId=' + stTranId +'&userId=' + stCurrentUser;
            console.log('stURL = ' + stURL);
            var stUserAccount=runtime.accountId;

            var response = https.request({
                url: encodeURI(stURL),
                // body: {},
                //headers: objHeaders,
                method: https.Method.POST
            });

            console.log('response = ' + JSON.stringify(response));

            msg = message.create({
                title: "LiftNet",
                message: "Email Sent",
                type: message.Type.INFORMATION
            });

            msg.show({
                duration: 5000
            });


        }

        function openLiftNetSuitelet(stQuoteId, stEstimateId)
        {


            var objCurrRec = currentRecord.get();
            var stRecordType = objCurrRec.type;
            var stRecordId = objCurrRec.id;

            // alert('Type = ' + stRecordType + ' | Record Id = ' + stRecordId + ' | stQuoteId = ' + stQuoteId + ' | stEstimateId = ' + stEstimateId);


            var stSuiteletUrl = url.resolveScript({scriptId:'customscript_sna_hul_sl_sendtoliftnet',deploymentId:'customdeploy_sna_hul_sl_sendtoliftnet'});
            stSuiteletUrl += '&param_type=' + stRecordType + '&param_id=' + stRecordId + '&quote_id=' + stQuoteId + '&estimate_id=' + stEstimateId;

            window.open(stSuiteletUrl, '_blank');


        }

        function callBaclFunc(id)
        {
            // alert(id);

            CURRENTRECORD.setValue({ fieldId: 'custpage_quoteid', value: id });
        }

        function launchConfig(username, password, id, type, stLiftNetURL, stEstimateId, msg)
        {
            console.log('launching config...');
            console.log('id = ' + id);
            console.log('stLiftNetURL = ' + stLiftNetURL);

            var msg = message.create({
                title: "LiftNet",
                message: "Processing Configurator Data",
                type: message.Type.INFORMATION
            });

            // msg.show();
            msg.show({
                duration: 5000
            });


            var w = window.open(stLiftNetURL + "/PDC/LaunchConfig?username=" + encodeURIComponent(username) +
                "&password=" + encodeURIComponent(password) + "&id=" + encodeURIComponent(id) + "&type=" + encodeURIComponent(type) +
                "&epoc=" + new Date().getTime(), "_blank");

            if (window.opener) {
                window.opener.location.reload();
            }




        }


        function execUnload(username, password, id, stLiftNetURL, stEstimateId, msg)
        {
            // setTimeout( function() {
            getQuote(username, password, id, stLiftNetURL, stEstimateId, msg);
            // }, 5000);
        }

        function UpdateQueryString(key, value, url) {
            if (!url) url = window.location.href;
            var re = new RegExp("([?&])" + key + "=.*?(&|#|$)(.*)", "gi"),
                hash;

            if (re.test(url)) {
                if (typeof value !== 'undefined' && value !== null)
                    return url.replace(re, '$1' + key + "=" + value + '$2$3');
                else {
                    hash = url.split('#');
                    url = hash[0].replace(re, '$1$3').replace(/(&|\?)$/, '');
                    if (typeof hash[1] !== 'undefined' && hash[1] !== null)
                        url += '#' + hash[1];
                    return url;
                }
            }
            else {
                if (typeof value !== 'undefined' && value !== null) {
                    var separator = url.indexOf('?') !== -1 ? '&' : '?';
                    hash = url.split('#');
                    url = hash[0] + separator + key + '=' + value;
                    if (typeof hash[1] !== 'undefined' && hash[1] !== null)
                        url += '#' + hash[1];
                    return url;
                }
                else
                    return url;
            }
        }

        function sendToLiftNet(stLiftNetURL, bIsCreateQuote)
        {
            debugger;
            var objCurrRec = currentRecord.get();
            var stRecordType = getURLParamValue('param_type');
            var stRecordId = getURLParamValue('param_id');
            var stQuoteId = getURLParamValue('quote_id');
            var stEstimateId = getURLParamValue('estimate_id');
            var response = {};
            var response1 = {};
            try
            {

                if(isEmpty(stQuoteId))
                {
                    stQuoteId = objCurrRec.getValue({ fieldId: 'custpage_quoteid'});
                }

                if(isEmpty(stQuoteId) && !bIsCreateQuote)
                {
                    alert('Cannot proceed. Make sure Quote Id is already ready...');
                    return;
                }

                var stSalesPersonCode = objCurrRec.getValue({ fieldId: 'custpage_salespersoncode' });
                var stMCFAUserName = objCurrRec.getValue({ fieldId: 'custpage_mcfausername' });
                var stMCFAPassword = objCurrRec.getValue({ fieldId: 'custpage_mcfapassword' });
                var stQuoteXML = objCurrRec.getValue({ fieldId: 'custpage_customerapiinformation' });


                if(isEmpty(stSalesPersonCode) || isEmpty(stMCFAUserName) || isEmpty(stMCFAPassword))
                {
                    alert('Cannot proceed. Please input your credentials.');
                    return;
                }
                // alert('stRecordType = ' + stRecordType + ' | stRecordId = ' + stRecordId +
                //         ' | stQuoteId = ' + stQuoteId + ' | stEstimateId = ' + stEstimateId);


                var msg = message.create({
                    title: "LiftNet",
                    message: "Opening LiftNet",
                    type: message.Type.INFORMATION
                });

                msg.show({
                    duration: 5000
                });




                if(isEmpty(stQuoteId))
                {



                    var stURL = stLiftNetURL + '/PDC/CreateUpdatePortalQuote?';
                    stURL += '&username=' + stMCFAUserName;
                    stURL += '&password=' + stMCFAPassword;
                    stURL += '&exid=' + stQuoteId;
                    stURL += '&exxml=' + stQuoteXML;
                    // stURL += '&exusername=' + stMCFAUserName;
                    stURL += '&exusername=' + stSalesPersonCode;
                    stURL += '&config=dev';
                    stURL += '&exsys=53200';
                    stURL += '&id=' + stQuoteId;
                    stURL += '&autorevise=true';
                    stURL += '&epoc=';

                    // var arrLiftNetURL = stURL.split('://');

                    console.log('Executing CreateUpdatePortalQuote');
                    console.log('stURL = ' + stURL);


                    response = https.get({
                        url: stURL

                    });
                    console.log('response = ' + JSON.stringify(response));




                    if(response.code == 200)
                    {

                        stQuoteId = response.body;
                        console.log('stQuoteId = ' + stQuoteId);

                        var stOppId = record.submitFields({
                            type: stRecordType,
                            id: stRecordId,
                            values: {
                                'custbody_liftnetquoteid': stQuoteId
                            }
                        });
                        console.log('Opportunity updated with quote id...' );
                        objCurrRec.setValue({
                                                fieldId: 'custpage_quoteid',
                                                value: stQuoteId
                        });


                        launchConfig(stMCFAUserName, stMCFAPassword,stQuoteId, "quote", stLiftNetURL, stEstimateId, msg);

                    }
                }
                else
                {
                    if(bIsCreateQuote)
                    {
                        //open configurator page
                        launchConfig(stMCFAUserName, stMCFAPassword,stQuoteId, "quote", stLiftNetURL, stEstimateId, msg);
                    }
                    else
                    {
                        var stQuoteId = objCurrRec.getValue({
                            fieldId: 'custpage_quoteid'
                        });
                        if(!isEmpty(stQuoteId))
                        {
                            // process configurator in NS
                            getQuote(stMCFAUserName, stMCFAPassword, stQuoteId, stLiftNetURL, stEstimateId, msg);
                        }
                        else
                        {
                            alert('Cannot proceed. Make sure Quote Id is already ready...');
                        }

                    }
                }


            }
            catch(ex)
            {

                alert( 'ERROR : ' + ex.message);


            }



        }

        function getQuote(stMCFAUserName, stMCFAPassword, stQuoteId, stLiftNetURL, stEstimateId, msg) {
            var stRecordType = getURLParamValue('param_type');
            var stRecordId = getURLParamValue('param_id');
            var arrItems = [];

            var stEstURL = '';

            try
            {

                // alert('HOLD');
                console.log('Executing Get Liftnet Generated Id using Quote Id: ' + stQuoteId);
                // get quote in liftnet using id
                var stURL = stLiftNetURL + '/PDC/ConfigureQuote?';
                stURL += '&username=' + stMCFAUserName;
                stURL += '&password=' + stMCFAPassword;
                stURL += '&id=' + stQuoteId;

                msg = message.create({
                    title: "LiftNet",
                    message: "Querying created quote...",
                    type: message.Type.INFORMATION
                });

                msg.show({
                    duration: 5000
                });

                setTimeout('console.log("WAITING...");', 5000);

                var response = https.get({
                    url: stURL
                });

                if (response.code == 200)
                {
                    console.log('response = ' + JSON.stringify(response));

                    console.log('response.body = ' + JSON.stringify(response.body));

                    console.log('Updating Opportunity');
                    var objJSON = xmlToJson.parse(response.body);
                    console.log('objJSON = ' + JSON.stringify(objJSON));



                    if(isEmpty(objJSON))
                    {
                        msg = message.create({
                            title: "LiftNet",
                            message: "No data was found.",
                            type: message.Type.ERROR
                        });

                        msg.show({
                            duration: 5000
                        });

                        console.log('EXITING...');
                        return;
                    }

                    var arrItemsToCreate = [];
                    var objItem = {};
                    var objChildren = objJSON.CrmParentChildRecord.Children.CrmEntity;
                    console.log('objChildren = ' + JSON.stringify(objChildren));
                    while(objChildren == undefined)
                    {
                        // alert('Restarting...');
                        setTimeout(getQuote(stMCFAUserName, stMCFAPassword, stQuoteId, stLiftNetURL, stEstimateId, msg), 5000);
                        return;
                    }

                    // for(var i in objChildren)
                    // {
                    var objFields = objChildren[0].Fields.CrmField;

                    for(var ii in objFields)
                    {
                        if(objFields[ii].name == 'ltmModelName')
                        {
                            console.log('objFields[' + ii + '].value = ' + objFields[ii].value);
                            // arrItemsToCreate.push({
                            //     name: objFields[ii].value,
                            //     quantity: objFields[101].value,
                            //     desc: !isEmpty(objFields[112].value) ? objFields[112].value : objFields[98].value,
                            //     unitPrice: objFields[0].value
                            // });

                            objItem.name = objFields[ii].value;
                        }
                        else if(objFields[ii].name == 'productdescription')
                        {
                            console.log('objFields[' + ii + '].value = ' + objFields[ii].value);
                            // arrItemsToCreate.push({
                            //     name: objFields[ii].value,
                            //     quantity: objFields[101].value,
                            //     desc: !isEmpty(objFields[112].value) ? objFields[112].value : objFields[98].value,
                            //     unitPrice: objFields[0].value
                            // });

                            objItem.desc = objFields[ii].value;
                        }
                        else if(objFields[ii].name == 'easi_configcustomerunitprice_base')
                        {
                            console.log('objFields[' + ii + '].value = ' + objFields[ii].value);
                            // arrItemsToCreate.push({
                            //     name: objFields[ii].value,
                            //     quantity: objFields[101].value,
                            //     desc: !isEmpty(objFields[112].value) ? objFields[112].value : objFields[98].value,
                            //     unitPrice: objFields[0].value
                            // });

                            objItem.unitPrice = objFields[ii].value;
                        }
                        else if(objFields[ii].name == 'quantity')
                        {
                            console.log('objFields[' + ii + '].value = ' + objFields[ii].value);
                            // arrItemsToCreate.push({
                            //     name: objFields[ii].value,
                            //     quantity: objFields[101].value,
                            //     desc: !isEmpty(objFields[112].value) ? objFields[112].value : objFields[98].value,
                            //     unitPrice: objFields[0].value
                            // });

                            objItem.quantity = objFields[ii].value;
                        }
                    }

                    if(arrItemsToCreate.length == 0)
                    {
                        arrItemsToCreate.push(objItem);
                    }
                    else
                    {
                        console.log('arrItemsToCreate[0].name = ' + arrItemsToCreate[0].name + ' | objItem.name = ' + objItem.name);
                        if(arrItemsToCreate[0].name != objItem.name)
                        {
                            arrItemsToCreate.push(objItem);
                        }
                    }



                    // }
                    console.log('arrItemsToCreate = ' + JSON.stringify(arrItemsToCreate));
                    //arrItemsToCreate = [{"name":"FB16PNT2","quantity":1,"desc":"3,000 lb. Capacity 36/48V Electric 3-Wheel Lift Truck"},{"name":"FB40N","quantity":1,"desc":"9,000 lb. Capacity 80 Volt Electric 4-Wheel Pneumatic Tire Lift Truck"}]



                    //search if item is existing if not create the item
                    msg = message.create({
                        title: "LiftNet",
                        message: "Searching/Creating Item/s...",
                        type: message.Type.INFORMATION
                    });

                    msg.show({
                        duration: 5000
                    });

                    for(var i in arrItemsToCreate)
                    {
                        var stItem = searchAndCreateItem(arrItemsToCreate[i]);
                        console.log('stItem = ' + JSON.stringify(stItem));
                        arrItems.push(stItem);
                    }
                    console.log('arrItems = ' + JSON.stringify(arrItems));


                    console.log('Netsuite current estimate Id: ' + stEstimateId);
                    var recEst = {};
                    if(isEmpty(stEstimateId))
                    {
                        // crate estimate from opportunity
                        msg = message.create({
                            title: "LiftNet",
                            message: "Creating Estimate",
                            type: message.Type.INFORMATION
                        });

                        msg.show({
                            duration: 5000
                        });

                        recEst = record.transform({
                            fromType: stRecordType,
                            fromId: stRecordId,
                            toType: 'estimate',
                            isDynamic: true
                        });
                    }
                    else
                    {
                        // update estimate from opportunity
                        msg = message.create({
                            title: "LiftNet",
                            message: "Updating Estimate",
                            type: message.Type.INFORMATION
                        });

                        msg.show({
                            duration: 5000
                        });
                        recEst = record.load({
                            type: 'estimate',
                            id: stEstimateId,
                            isDynamic: true
                        });

                        // clear item lines
                        for(var i=0; i < arrItems.length; i++)
                        {
                            console.log('removing line : ' + i);
                            recEst.removeLine({ sublistId: 'item', line: 0 });

                        }
                    }



                    for(var i=0; i < arrItems.length; i++)
                    {
                        console.log('adding item : ' + arrItems[i]);
                        recEst.selectLine({ sublistId: 'item', line: i });
                        recEst.setCurrentSublistValue({ sublistId: 'item', fieldId: 'item', value: arrItems[i] });
                        recEst.setCurrentSublistValue({ sublistId: 'item', fieldId: 'quantity', value: objItem.quantity });
                        recEst.setCurrentSublistValue({ sublistId: 'item', fieldId: 'rate', value: objItem.unitPrice });
                        recEst.commitLine({ sublistId: 'item' });
                    }

                    var stEstId = recEst.save({ ignoreMandatoryFields: true });
                    console.log('Estimate Record with Id[' + stEstId + '] Saved --');

                    if(!isEmpty(stEstId))
                    {
                        // var stOppId = record.submitFields({
                        //     type: stRecordType,
                        //     id: stRecordId,
                        //     values: {
                        //         'custbody_liftnetquoteid': stQuoteId,
                        //         'custbody_liftnetquotedetails': JSON.stringify(objJSON)
                        //         // 'custbody_liftnetquotedetails': formatXml(response.body)
                        //     }
                        // });

                        msg = message.create({
                            title: "LiftNet",
                            message: "Updating Opportunity",
                            type: message.Type.INFORMATION
                        });

                        msg.show({
                            duration: 5000
                        });

                        var recOpp = record.load({ type: stRecordType, id: stRecordId, isDynamic: true });
                        recOpp.setValue({ fieldId: 'custbody_liftnetquoteid', value: stQuoteId });
                        recOpp.setValue({ fieldId: 'custbody_liftnetquotedetails', value: JSON.stringify(objJSON)});
                        recOpp.setValue({ fieldId: 'custbody_estimate', value: stEstId});

                        for(var i=0; i < arrItems.length; i++)
                        {
                            console.log('updating opportunity item : ' + arrItems[i]);
                            recOpp.selectLine({ sublistId: 'item', line: i });
                            recOpp.setCurrentSublistValue({ sublistId: 'item', fieldId: 'item', value: arrItems[i] });
                            recOpp.setCurrentSublistValue({ sublistId: 'item', fieldId: 'quantity', value: objItem.quantity });
                            recOpp.setCurrentSublistValue({ sublistId: 'item', fieldId: 'rate', value: objItem.unitPrice });
                            recOpp.commitLine({ sublistId: 'item' });
                        }

                        var stOppId = recOpp.save({ ignoreMandatoryFields: true });
                        console.log('Opportunity Record with Id[' + stOppId + '] was updated --');
                    }
                    // alert('test');

                    msg = message.create({
                        title: "LiftNet",
                        message: "Process Done.",
                        type: message.Type.INFORMATION
                    });

                    msg.show({
                        duration: 5000
                    });



                    //upadte url param id
                    console.log('window.location.href = ' + window.location.href);
                    var stNewURL = UpdateQueryString('quote_id', stQuoteId, window.location.href);
                    window.onbeforeunload = null;
                    window.location.href = stNewURL;


                    stEstURL = url.resolveRecord({
                        recordType: 'estimate',
                        recordId: stEstId
                    });

                    var stOppURL = url.resolveRecord({
                        recordType: stRecordType,
                        recordId: stRecordId
                    });

                    window.open(stOppURL, '_self');

                }
                else
                {
                    msg = message.create({
                        title: "LiftNet",
                        message: JSON.stringify(response.body),
                        type: message.Type.ERROR
                    });

                    // msg.show({
                    //     duration: 5000
                    // });
                }
            }
            catch(e)
            {
                alert(e.message);
            }


        }


        function searchAndCreateItem(objItemToBeCreated)
        {
            console.log('Search and creating item: ' + JSON.stringify(objItemToBeCreated));
            var arrFilters = [];
            var objData = {};
            var arrData = [];
            var stItemId = '';
            try
            {
                console.log('objItemToBeCreated.name: ' + JSON.stringify(objItemToBeCreated.name));
                arrFilters.push(["name","is",objItemToBeCreated.name]);

                var objItemSearch = search.create({
                    type: "item",
                    filters: arrFilters,
                    columns:
                        [
                            search.createColumn({
                                name: "internalid"
                            })
                        ]
                });

                var searchResultCount = objItemSearch.runPaged().count;
                console.log('searchResultCount: ' + searchResultCount);

                if(searchResultCount === 0)
                {
                    // console.log('Creating new item...');
                    // //create item here
                    // var recItem = record.create({ type: 'inventoryitem', isDynamic: true });
                    // recItem.setValue({ fieldId: 'itemid', value: objItemToBeCreated.name });
                    // recItem.setValue({ fieldId: 'displayname', value: objItemToBeCreated.name });
                    // recItem.setValue({ fieldId: 'salesdescription', value: objItemToBeCreated.desc });
                    // recItem.setValue({ fieldId: 'subsidiary', value: ITEM_SUBSIDIARY });
                    // recItem.setValue({ fieldId: 'location', value: ITEM_LOCATION });
                    // recItem.setValue({ fieldId: 'cogsaccount', value: ITEM_COGS_ACCOUNT });
                    // recItem.setValue({ fieldId: 'assetaccount', value: ITEM_ASSET_ACCOUNT });
                    //
                    // recItem.selectLine({ sublistId: 'price', line: 0 });
                    // recItem.setCurrentSublistValue({
                    //     sublistId:'price',
                    //     fieldId:'pricelevel',
                    //     value: 1
                    // });
                    // recItem.setCurrentSublistValue({
                    //     sublistId:'price',
                    //     fieldId:'price_1_',
                    //     value: parseFloat(objItemToBeCreated.unitPrice)
                    // });
                    // recItem.commitLine({ sublistId: 'price' });
                    //
                    // stItemId = recItem.save({ignoreMandatoryFields : true});
                    // console.log('Loading created item : ' + stItemId);

                    console.log('objItemToBeCreated: ' + JSON.stringify(objItemToBeCreated));
                    console.log('Creating new item...');
                    //create item here
                    var recItem = record.create({ type: 'noninventoryitem', isDynamic: false });
                    recItem.setValue({ fieldId: 'itemid', value: objItemToBeCreated.name });
                    recItem.setValue({ fieldId: 'displayname', value: objItemToBeCreated.name });
                    recItem.setValue({ fieldId: 'salesdescription', value: objItemToBeCreated.desc });
                    recItem.setValue({ fieldId: 'subsidiary', value: ITEM_SUBSIDIARY });
                    recItem.setValue({ fieldId: 'location', value: ITEM_LOCATION });
                    recItem.setValue({ fieldId: 'taxschedule', value: '1' }); // NON-TAXABLE
                    recItem.setValue({ fieldId: 'subtype', value: 'Sale' }); // NON-TAXABLE
                    // recItem.setValue({ fieldId: 'cogsaccount', value: ITEM_COGS_ACCOUNT });
                    // recItem.setValue({ fieldId: 'assetaccount', value: ITEM_ASSET_ACCOUNT });

                    // recItem.selectLine({ sublistId: 'price', line: 0 });
                    recItem.setSublistValue({
                        sublistId:'price',
                        fieldId:'pricelevel',
                        value: 1,
                        line: 0
                    });
                    recItem.setSublistValue({
                        sublistId:'price',
                        fieldId:'price_1_',
                        value: parseFloat(objItemToBeCreated.unitPrice),
                        line: 0
                    });
                    // recItem.commitLine({ sublistId: 'price' });

                    stItemId = recItem.save({ignoreMandatoryFields : true});
                    console.log('Loading created item : ' + stItemId);




                }
                else
                {
                    console.log('Selecting existing item...');
                    objItemSearch.run().each(function(result) {
                        console.log('result: ' + JSON.stringify(result));

                        stItemId = result.id;


                        return true;

                    });
                }


            }
            catch(e)
            {


                console.log(e.name + ' : ' + JSON.stringify(e.message));
            }



            return stItemId;

        }


        /**
         * Object to convert XML into a structured JSON object
         *
         * @method xmlToJson
         * @returns {Object}
         */
        var xmlToJson = (function () {
            var self = this;


            /**
             * Adds an object value to a parent object
             *
             * @method addToParent
             * @param {Object} parent
             * @param {String} nodeName
             * @param {Mixed} obj
             * @returns none
             */
            self.addToParent = function (parent, nodeName, obj) {
                // If this is the first or only instance of the node name, assign it as
                // an object on the parent.
                if (!parent[nodeName]) {
                    parent[nodeName] = obj;
                }
                // Else the parent knows about other nodes of the same name
                else {
                    // If the parent has a property with the node name, but it is not an array,
                    // store the contents of that property, convert the property to an array, and
                    // assign what was formerly an object on the parent to the first member of the
                    // array
                    if (!Array.isArray(parent[nodeName])) {
                        var tmp = parent[nodeName];
                        parent[nodeName] = [];
                        parent[nodeName].push(tmp);
                    }

                    // Push the current object to the collection
                    parent[nodeName].push(obj);
                }
            };




            self.convertXMLStringToDoc = function (str) {
                var xmlDoc = null;

                if (str && typeof str === 'string') {
                    // Create a DOMParser
                    var parser = new DOMParser();

                    // Use it to turn your xmlString into an XMLDocument
                    xmlDoc = parser.parseFromString(str, 'application/xml');
                }

                return xmlDoc;
            }


            /**
             * Validates if an data is an XMLDocument
             *
             * @method isXML
             * @param {Mixed} data
             * @returns {Boolean}
             */
            self.isXML = function (data) {
                var documentElement = (data ? data.ownerDocument || data : 0).documentElement;

                return documentElement ? documentElement.nodeName.toLowerCase() !== 'html' : false;
            };


            /**
             * Reads through a node's attributes and assigns the values to a new object
             *
             * @method parseAttributes
             * @param {XMLNode} node
             * @returns {Object}
             */
            self.parseAttributes = function (node) {
                var attributes = node.attributes,
                    obj = {};

                // If the node has attributes, assign the new object properties
                // corresponding to each attribute
                if (node.hasAttributes()) {
                    for (var i = 0; i < attributes.length; i++) {
                        obj[attributes[i].name] = self.parseValue(attributes[i].value);
                    }
                }

                // return the new object
                return obj;
            };


            /**
             * Rips through child nodes and parses them
             *
             * @method parseChildren
             * @param {Object} parent
             * @param {XMLNodeMap} childNodes
             * @returns none
             */
            self.parseChildren = function (parent, childNodes) {
                // If there are child nodes...
                if (childNodes.length > 0) {
                    // Loop over all the child nodes
                    for (var i = 0; i < childNodes.length; i++) {
                        // If the child node is a XMLNode, parse the node
                        if (childNodes[i].nodeType == 1) {
                            self.parseNode(parent, childNodes[i]);
                        }
                    }
                }
            };


            /**
             * Converts a node into an object with properties
             *
             * @method parseNode
             * @param {Object} parent
             * @param {XMLNode} node
             * @returns {Object}
             */
            self.parseNode = function (parent, node) {
                var nodeName = node.nodeName,
                    obj = Object.assign({}, self.parseAttributes(node)),
                    tmp = null;

                // If there is only one text child node, there is no need to process the children
                if (node.childNodes.length == 1 && node.childNodes[0].nodeType == 3) {
                    // If the node has attributes, then the object will already have properties.
                    // Add a new property 'text' with the value of the text content
                    if (node.hasAttributes()) {
                        obj['text'] = self.parseValue(node.childNodes[0].nodeValue);
                    }
                        // If there are no attributes, then the parent[nodeName] property value is
                    // simply the interpreted textual content
                    else {
                        obj = self.parseValue(node.childNodes[0].nodeValue);
                    }
                }
                // Otherwise, there are child XMLNode elements, so process them
                else {
                    self.parseChildren(obj, node.childNodes);
                }

                // Once the object has been processed, add it to the parent
                self.addToParent(parent, nodeName, obj)

                // Return the parent
                return parent;
            };


            /**
             * Interprets a value and converts it to Boolean, Number or String based on content
             *
             * @method parseValue
             * @param {Mixed} val
             * @returns {Mixed}
             */
            this.parseValue = function (val) {
                // Create a numeric value from the passed parameter
                var num = Number(val);

                // If the value is 'true' or 'false', parse it as a Boolean and return it
                if (val.toLowerCase() === 'true' || val.toLowerCase() === 'false') {
                    return (val.toLowerCase() == 'true');
                }

                // If the num parsed to a Number, return the numeric value
                // Else if the valuse passed has no length (an attribute without value) return null,
                // Else return the param as is
                return (isNaN(num)) ? val.trim() : (val.length == 0) ? null : num;
            };

            // Expose the API
            return {
                parse: function (xml) {
                    if (xml && typeof xml === 'string') {
                        xml = self.convertXMLStringToDoc(xml);
                    }
                    return (xml && self.isXML(xml)) ? self.parseNode({}, xml.firstChild) : null;
                }
            }
        })();


        function ConfigureQuoteResponse(suc, result) {
            var self = this;
            self.Raw = result;
            self.GetValue = function (key) {
                return $("<div>" + self.Raw + "</div>").find("CrmField[name='" + key + "']").attr("value");
            };
            self.GetFields = function (key) {
                return $("<div>" + self.Raw + "</div>").find("CrmField[name='" + key + "']");
            };
            self.GetEntityJSON = function (entity) {
                var ret = new Array();
                var mys = $("<div></div>").html(self.Raw).find("CrmEntity, Parent");
                mys.each(function (i, el) {
                    el = $(el);
                    if (el.find("LogicalName").text() == entity) {
                        var myobj = {};
                        myobj["LogicalName"] = entity;
                        myobj["Id"] = el.find("Id").text();
                        el.find("CrmField").each(function (ii, ell) {
                            ell = $(ell);
                            myobj[ell.attr("name")] = {value: ell.attr("value"), entityid: ell.attr("entityid"), entityname: ell.attr("entityname")};
                        });
                        myobj["HasError"] = el.find("HasError").text();
                        ret[i] = myobj;
                    }
                    i++;
                });
                return ret;
            };
        }

        function printQuote(stQuoteId, stLiftNetURL)
        {

            if(isEmpty(stQuoteId))
            {
                alert('You must have an MCFA Quote Id in order to print.');
                return;
            }


            var stURL = stLiftNetURL + '/Document/PrintSettings/?id=' + stQuoteId

            window.open(stURL, '_blank');
        }

        function printQuoteWorksheet(stQuoteId, stLiftNetURL)
        {

            if(isEmpty(stQuoteId))
            {
                alert('You must have an MCFA Quote Id in order to print.');
                return;
            }

            var arrBtn = [
                { label: 'Word', value: 'word' },
                { label: 'Excel', value: 'excel' },
                { label: 'PDF', value: 'pdf' }
            ];

            showDialogMultiBtn('Download Worksheet', 'Please choose data type', arrBtn, stLiftNetURL, stQuoteId);


        }


        function showDialog(stTitle, stMessage)
        {
            dialog.create({
                title:stTitle,
                message:stMessage,
            }).then(function(success){
                console.log(success);
            }).catch(function(failure){
                console.log(failure);
            });
        }

        // custom dialog multiple choices
        // objBtn = { label: '1', value: 1 }...{ label: n, value: n }
        function showDialogMultiBtn(stTitle, stMessage, arrBtn, stLiftNetURL, stQuoteId)
        {

            var stURL = stLiftNetURL + '/Document/ExecuteWordMerge?idmapping=quoteid&wordtemplate=DealerQuoteWorksheet.docx';
            stURL += "&id=" + stQuoteId;


            var options = {
                title: stTitle,
                message: stMessage,
                buttons: arrBtn
            };
            function success(result) {
                console.log('Success with value: ' + result)
                switch (result)
                {
                    case 'word':
                        stURL += "&excel=false";
                        stURL += "&pdf=false";
                        window.open(stURL, '_blank');
                        break;

                    case 'excel':

                        stURL += "&excel=true";
                        stURL += "&pdf=false";
                        window.open(stURL, '_blank');
                        break;

                    case 'pdf':

                        stURL += "&pdf=true";
                        stURL += "&excel=false";
                        window.open(stURL, '_blank');
                        break;
                }
            }
            function failure(reason) { console.log('Failure: ' + reason) }


            dialog.create(options).then(success).catch(failure);
        }

        function isEmpty(stValue)
        {
            // alert(stValue)
            return ((stValue === '' || stValue == null || stValue == undefined)
                || (stValue.constructor === Array && stValue.length == 0)
                || (stValue.constructor === Object && (function(v){for(var k in v)return false;return true;})(stValue)));
        }

        function formatXml(xml, tab) { // tab = optional indent value, default is tab (\t)
            var formatted = '', indent= '';
            tab = tab || '\t';
            xml.split(/>\s*</).forEach(function(node) {
                if (node.match( /^\/\w/ )) indent = indent.substring(tab.length); // decrease indent by one 'tab'
                formatted += indent + '<' + node + '>\r\n';
                if (node.match( /^<?\w[^>]*[^\/]$/ )) indent += tab;              // increase indent
            });
            return formatted.substring(1, formatted.length-3);
        }

        function getURLParamValue( name )
        {
            name = name.replace(/[\[]/,"\\\[").replace(/[\]]/,"\\\]");
            var regexS = "[\\?&]"+name+"=([^&#]*)";
            var regex = new RegExp( regexS );
            var results = regex.exec( window.location.href );
            if( results == null )
                return "";
            else
                return results[1];
        }

        function UpdateQueryString(key, value, url) {
            if (!url) url = window.location.href;
            var re = new RegExp("([?&])" + key + "=.*?(&|#|$)(.*)", "gi"),
                hash;

            if (re.test(url)) {
                if (typeof value !== 'undefined' && value !== null)
                    return url.replace(re, '$1' + key + "=" + value + '$2$3');
                else {
                    hash = url.split('#');
                    url = hash[0].replace(re, '$1$3').replace(/(&|\?)$/, '');
                    if (typeof hash[1] !== 'undefined' && hash[1] !== null)
                        url += '#' + hash[1];
                    return url;
                }
            }
            else {
                if (typeof value !== 'undefined' && value !== null) {
                    var separator = url.indexOf('?') !== -1 ? '&' : '?';
                    hash = url.split('#');
                    url = hash[0] + separator + key + '=' + value;
                    if (typeof hash[1] !== 'undefined' && hash[1] !== null)
                        url += '#' + hash[1];
                    return url;
                }
                else
                    return url;
            }
        }

        return {

            pageInit: pageInit_,
            openLiftNetSuitelet: openLiftNetSuitelet,
            sendToLiftNet: sendToLiftNet,
            launchConfig: launchConfig,
            printQuote: printQuote,
            printQuoteWorksheet: printQuoteWorksheet,
            emailQuote: emailQuote
        };
    });