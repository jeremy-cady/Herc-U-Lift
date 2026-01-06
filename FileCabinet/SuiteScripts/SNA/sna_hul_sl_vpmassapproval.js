/*
* Copyright (c) 2023, ScaleNorth Advisors LLC and/or its affiliates. All rights reserved.
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
* 2023/03/23						            natoretiro      	Initial version
* 2023/05/08                                    nretiro             Adding pagination feature to sublist
																						
* 2023/11/14                                    nretiro             adding item category filter																						
																							   
* 
*/


/**
 * @NApiVersion 2.1
 * @NScriptType Suitelet
 * @NModuleScope SameAccount
 */


define(['N/file', 'N/format', 'N/record', 'N/runtime', 'N/search', 'N/ui/serverWidget', 'N/url', 'N/task', 'N/currentRecord'],
    /**
     * @param{file} file
     * @param{format} format
     * @param{record} record
     * @param{runtime} runtime
     * @param{search} search
     * @param{serverWidget} serverWidget
     * @param{url} url
     */
    (file, format, record, runtime, search, serverWidget, url,task, currentRecord) => {

        var NO_OF_LINES_TO_SHOW = 100;

        /**
         * Defines the Suitelet script trigger point.
         * @param {Object} scriptContext
         * @param {ServerRequest} scriptContext.request - Incoming request
         * @param {ServerResponse} scriptContext.response - Suitelet response
         * @since 2015.2
         */
        const onRequest = (scriptContext) => {
            var stLoggerTitle = 'onRequest';
            log.debug(stLoggerTitle, '|--->> Starting ' + stLoggerTitle + ' <<---|');

            var objRequest = scriptContext.request;
            var objResponse = scriptContext.response;

            log.debug(stLoggerTitle, 'objRequest.parameters.param_page = ' + objRequest.parameters.param_page);
            var page = isEmpty(objRequest.parameters.param_page) ? 0 : parseInt(objRequest.parameters.param_page);
            log.debug(stLoggerTitle, 'page = ' + page);

			var stItemCatFilter = isEmpty(objRequest.parameters.param_ic) ? '' : parseInt(objRequest.parameters.param_ic);
            log.debug(stLoggerTitle, 'stItemCatFilter = ' + stItemCatFilter);																											 
																			 


            NO_OF_LINES_TO_SHOW = runtime.getCurrentScript().getParameter({ name: 'custscript_param_nooflinestoshow' });
            log.debug(stLoggerTitle, 'NO_OF_LINES_TO_SHOW = ' + NO_OF_LINES_TO_SHOW);

            if(page == -1)
            {
                page = 0;
            }

            var form = serverWidget.createForm({
                title: 'Vendor Prices For Approval',
                hideNavBar: false
            });

            try {



                var stReqMethod = objRequest.method;
                log.debug(stLoggerTitle, 'stReqMethod = ' + stReqMethod);

                if (stReqMethod == 'GET') {
                    form = createForm(form, objRequest, page, stItemCatFilter);
                }
                else if(stReqMethod == 'POST')
                {
                    // log.debug(stLoggerTitle, 'objRequest = ' + JSON.stringify(objRequest));
                    var stVPToApprove = objRequest.parameters.custpage_fld_vptoapprove;
                    log.debug(stLoggerTitle, 'stVPToApprove = ' + stVPToApprove);
																					 


																													   
                    if(!isEmpty(stVPToApprove))
                    {

                        var fldNotif = form.addField({
                            id: 'custpage_fld_notification',
                            label: 'NOTIFICATION : ',
                            type: serverWidget.FieldType.TEXT
                        }).updateDisplayType({ displayType: serverWidget.FieldDisplayType.INLINE });
                        fldNotif.defaultValue = 'Approval process has started. You will receive an email once it is done. This page can now be closed.';

                        //call M/R script here

                        // pass an array of vps
                        // call and execute the map/reduce script again
                        var objTask = task.create({
                            taskType: task.TaskType.MAP_REDUCE,
                            scriptId: 'customscript_sna_hul_mr_approvevp',
																					

						   


													  

																	   

											   
																 
											  
							   

																					   
						 

					 
												   
					 
													  
															
													 
															 
																									
																																						 

											  
											   
																	   
												   
															   
																		 
                            params: { 'custscript_param_vpstoapprove' : stVPToApprove}

                        });



                        var taskId = objTask.submit();

                        log.debug(stLoggerTitle, 'taskId = ' + taskId);

                        if(!isEmpty(taskId))
                        {
                            var myTaskStatus = task.checkStatus({
                                taskId: taskId
                            });

                            log.debug(stLoggerTitle, 'myTaskStatus = ' + myTaskStatus);
                        }

                    }
                    else
                    {
                        var fldNotif = form.addField({
                            id: 'custpage_fld_notification',
                            label: 'NOTIFICATION : ',
                            type: serverWidget.FieldType.TEXT
                        }).updateDisplayType({ displayType: serverWidget.FieldDisplayType.INLINE });
                        fldNotif.defaultValue = 'No Vendor Price selected for Mass Approval. Please select at least 1 record and try again.';
                    }


                }


                form.clientScriptModulePath = './sna_hul_cs_vpmassapproval.js';
                objResponse.writePage(form);
            } catch (e) {
                log.audit({
                    title: e.name,
                    details: e.message
                });
            }

            log.debug(stLoggerTitle, '|--->> Exiting ' + stLoggerTitle + ' <<---|');
        }

        function createForm(form, objRequest, page, stItemCatFilter) {
            var stLoggerTitle = 'createForm';
            log.debug(stLoggerTitle, '|---> ' + 'Starting ' + stLoggerTitle + ' <---|');


																															  


            form.addButton({ id: 'custpage_btn_markall', label: 'Mark All', functionName: 'markAll(' + true + ')'});
            form.addButton({ id: 'custpage_btn_unmarkall', label: 'Unmark All', functionName: 'markAll(' + false + ')'});

																													  



            var DEALERNET_PRICETHRESHOLD = runtime.getCurrentScript().getParameter({ name: 'custscript_param_dealernetpricethreshold' });
            var arrVPToApprove = [];

            var flVPToApprove = form.addField({
                id: 'custpage_fld_vptoapprove',
                type: serverWidget.FieldType.TEXT,
                label: 'VP To Approve'
            }).updateDisplayType({ displayType: serverWidget.FieldDisplayType.HIDDEN});

											  
											  
												  
									 
															

			var fgFilter = form.addFieldGroup({id: 'custpage_fg_filter', label: 'Filter' });																				



            form.addSubtab({
                id: 'custpage_stab_vp',
                label: 'Vendor Price For Approval'
            });


            // add sublist
            var objSublist = form.addSublist({id: 'custpage_slist_vp', type: serverWidget.SublistType.LIST, label: 'List of Vendor Price', tab: 'custpage_stab_vp'});




            var flSelect = objSublist.addField({id: 'custpage_slf_select', type: serverWidget.FieldType.CHECKBOX, label: 'Select'});


            var flVP = objSublist.addField({id: 'custpage_slf_vp', type: serverWidget.FieldType.SELECT, source: 'customrecord_sna_hul_vendorprice', label: 'Vendor Price'});
            flVP.updateDisplayType({ displayType : serverWidget.FieldDisplayType.INLINE });

																																	  
																							   

            var flItem = objSublist.addField({id: 'custpage_slf_item', type: serverWidget.FieldType.SELECT, source: 'item', label: 'Item Id'});
            flItem.updateDisplayType({ displayType : serverWidget.FieldDisplayType.INLINE });

																																	 
																								 

            var flItemCategory = objSublist.addField({id: 'custpage_slf_itemcategory', type: serverWidget.FieldType.SELECT, source: 'customrecord_sna_hul_itemcategory', label: 'Item Category'});
            flItemCategory.updateDisplayType({ displayType : serverWidget.FieldDisplayType.INLINE });


            var flVendor = objSublist.addField({id: 'custpage_slf_vendor', type: serverWidget.FieldType.SELECT, source: 'vendor', label: 'Vendor'});
            flVendor.updateDisplayType({ displayType : serverWidget.FieldDisplayType.INLINE });


            var flPurchPriceC = objSublist.addField({id: 'custpage_slf_purchpricec', type: serverWidget.FieldType.TEXT, label: 'Current Purchase Price'});
            var flListPriceC = objSublist.addField({id: 'custpage_slf_listpricec', type: serverWidget.FieldType.TEXT, label: 'Current List Price'});
            var flContractPriceC = objSublist.addField({id: 'custpage_slf_contractpricec', type: serverWidget.FieldType.TEXT, label: 'Current Contract Price'});

            var flPurchPriceD = objSublist.addField({id: 'custpage_slf_purchpriced', type: serverWidget.FieldType.TEXT, label: 'DealerNet Purchase Price'});
            var flListPriceD = objSublist.addField({id: 'custpage_slf_listpriced', type: serverWidget.FieldType.TEXT, label: 'DealerNet List Price'});
            var flContractPriceD = objSublist.addField({id: 'custpage_slf_contractpriced', type: serverWidget.FieldType.TEXT, label: 'DealerNet Contract Price'});

            var objVP = searchVendorPrice(false, stItemCatFilter);
            log.debug(stLoggerTitle, 'objVP = ' + JSON.stringify(objVP));


            createList(objVP, form, objSublist, page, stItemCatFilter);




            form.addSubmitButton({ label: 'Approve All' });
            log.debug(stLoggerTitle, '|---> ' + 'Exiting ' + stLoggerTitle + ' <---|');

            return form;
        }

        function addDropdownValues(fld, arr, page) {
            var stLoggerTitle = 'addDropdownValues';
            log.debug(stLoggerTitle, '|---> ' + 'Starting ' + stLoggerTitle + ' <---|');
            log.debug(stLoggerTitle, 'fld = ' + fld + ' | page = ' + page);
            if (!isEmpty(fld) && !isEmpty(arr)) {
                for (var x = 0; x < arr.length; x++) {
                    var obj = arr[x];
                    if(obj.value == page) {
                        log.debug(stLoggerTitle, 'obj.value = ' + obj.value + ' | page = ' + page);
                        fld.addSelectOption({
                            value: obj.value,
                            text: obj.text,
                            isSelected: true
                        });
                    } else {
                        fld.addSelectOption({
                            value: obj.value,
                            text: obj.text
                        });
                    }
                }
            }
            log.debug(stLoggerTitle, '|---> ' + 'Exiting ' + stLoggerTitle + ' <---|');
        }


        function createList(objVP, form, objSublist, page, stItemCatFilter)
        {
            var stLoggerTitle = 'createList';
            log.debug(stLoggerTitle, '|--->> Starting ' + stLoggerTitle + ' <<---|');

            var arrVPToApprove = [];

            //paged search specific
            var fldPage = form.addField({
                type: serverWidget.FieldType.SELECT,
                id: 'custpage_ps_fld_page',
				container: 'custpage_fg_filter',								
                label: 'Pages'
            });

            log.debug(stLoggerTitle, 'page = ' + page);

            if(!isEmpty(page))
            {
                fldPage.defaultValue = page;
            }
												  
													
			var fldItemCatFilter = form.addField({
                type: serverWidget.FieldType.SELECT,
                source: 'customrecord_sna_hul_itemcategory',
                id: 'custpage_ps_fld_itemcatfilter',
                container: 'custpage_fg_filter',
                label: 'Item Category'
            });
            log.debug(stLoggerTitle, 'stItemCatFilter = ' + stItemCatFilter);

            if(!isEmpty(stItemCatFilter))
            {
                fldItemCatFilter.defaultValue = stItemCatFilter;
            }
												
													
												
									  
			   
																			 

										 
			 
																
			 


            var prev = objSublist.addButton({
                id: 'custpage_ps_btn_prev',
                label: 'Previous',
                functionName: 'prev('+ page +')'
            });

            var next = objSublist.addButton({
                id: 'custpage_ps_btn_next',
                label: 'Next',
                functionName: 'next('+ page +')'
            });

            var objVendorPriceSummary = searchPageSummary(objVP);


            //end of paged search specific

            if(Object.keys(objVP).length > 0)
            {
                addDropdownValues(fldPage, objVendorPriceSummary, page);
            }

            log.debug(stLoggerTitle, 'objVP = ' + JSON.stringify(objVP));
            setButtonValidation(prev, next, objVendorPriceSummary, page);

            populateSublist(objSublist, page, form, objVP);    // TODO: set page in url string page=1



            log.debug(stLoggerTitle, '|---> ' + 'Exiting ' + stLoggerTitle + ' <---|');


        }

        function populateSublist(objSublist, page, form, objMyPagedData)
        {
            var stLoggerTitle = 'populateSublist';
            log.debug(stLoggerTitle, '|--->> Starting ' + stLoggerTitle + ' <<---|');
            let DEALERNET_PRICETHRESHOLD = runtime.getCurrentScript().getParameter({ name: 'custscript_param_dealernetpricethreshold' });
            var arrVPToApprove = [];
            var intCtr = 0;
            var intLine = 0;

            try
            {


                var myIndex = parseInt((page * parseInt(NO_OF_LINES_TO_SHOW)) + 1);

                log.debug(stLoggerTitle, 'DEALERNET_PRICETHRESHOLD = ' + DEALERNET_PRICETHRESHOLD + ' | NO_OF_LINES_TO_SHOW = ' + NO_OF_LINES_TO_SHOW + ' | page = ' + page);



                // if(isEmpty(page)) { page = 1; }

                if(!isEmpty(objMyPagedData.pageRanges))
                {

                    var objMyPage = objMyPagedData.fetch({index: page});


                    log.debug(stLoggerTitle, 'objMyPage.data = ' + JSON.stringify(objMyPage.data));

                    objMyPage.data.forEach(function (objMyPagedData)
                    {

                        //log.audit(stLoggerTitle, 'objMyPagedData = ' + JSON.stringify(objMyPagedData));
                        var flPurchPriceC = objMyPagedData.getValue('custrecord_sna_hul_itempurchaseprice') || 0;
                        var flListPriceC = objMyPagedData.getValue('custrecord_sna_hul_listprice') || 0;
                        var flContractPriceC = objMyPagedData.getValue('custrecord_sna_hul_contractprice') || 0;

                        flPurchPriceC = isNaN(flPurchPriceC) ? 0 : parseFloat(flPurchPriceC);
                        flListPriceC = isNaN(flListPriceC) ? 0 : parseFloat(flListPriceC);
                        flContractPriceC = isNaN(flContractPriceC) ? 0 : parseFloat(flContractPriceC);
                        //log.debug(stLoggerTitle, 'flPurchPriceC = ' + flPurchPriceC +  ' | flListPriceC = ' + flListPriceC + ' | flContractPriceC = ' + flContractPriceC);

                        var flPurchPriceD = objMyPagedData.getValue('custrecord_sna_hul_t_itempurchaseprice') || 0;
                        var flListPriceD =  objMyPagedData.getValue('custrecord_sna_hul_t_listprice') || 0;
                        var flContractPriceD = objMyPagedData.getValue('custrecord_sna_hul_t_contractprice') || 0;

                        flPurchPriceD = isNaN(flPurchPriceD) == true ? 0 : parseFloat(flPurchPriceD);
                        flListPriceD = isNaN(flListPriceD) == true ? 0 : parseFloat(flListPriceD);
                        flContractPriceD = isNaN(flContractPriceD) == true ? 0 : parseFloat(flContractPriceD);
                        //log.debug(stLoggerTitle, 'flPurchPriceD = ' + flPurchPriceD +  ' | flListPriceD = ' + flListPriceD + ' | flContractPriceD = ' + flContractPriceD);

                        var flPurchPriceDD = flPurchPriceC + (flPurchPriceC * (parseFloat(DEALERNET_PRICETHRESHOLD)/100));
                        var flListPriceDD = flListPriceC + (flListPriceC * (parseFloat(DEALERNET_PRICETHRESHOLD)/100));
                        var flContractPriceDD = flContractPriceC + (flContractPriceC * (parseFloat(DEALERNET_PRICETHRESHOLD)/100));
                        //log.debug(stLoggerTitle, 'flPurchPriceDD = ' + flPurchPriceDD +  ' | flListPriceDD = ' + flListPriceDD + ' | flContractPriceDD = ' + flContractPriceDD);

                        var flPurchPriceDDN = flPurchPriceC - (flPurchPriceC * (parseFloat(DEALERNET_PRICETHRESHOLD)/100));
                        var flListPriceDDN = flListPriceC - (flListPriceC * (parseFloat(DEALERNET_PRICETHRESHOLD)/100));
                        var flContractPriceDDN = flContractPriceC - (flContractPriceC * (parseFloat(DEALERNET_PRICETHRESHOLD)/100));
                        //log.debug(stLoggerTitle, 'flPurchPriceDDN = ' + flPurchPriceDDN +  ' | flListPriceDDN = ' + flListPriceDDN + ' | flContractPriceDDN = ' + flContractPriceDDN);
                    //
                    //     if((flListPriceD < flListPriceDDN || flListPriceD > flListPriceDD)
                    //         || (flContractPriceD < flContractPriceDDN || flContractPriceD > flContractPriceDD)
                    //         || (flPurchPriceD < flPurchPriceDDN || flPurchPriceD > flPurchPriceDD))
                    //     {

                            objSublist.setSublistValue({id: 'custpage_slf_select', value: 'F', line: intCtr});
                            objSublist.setSublistValue({id: 'custpage_slf_vp', value: objMyPagedData.id, line: intCtr});

															  
																			   
														   
							   

																												  

																												   

                            objSublist.setSublistValue({id: 'custpage_slf_item', value: objMyPagedData.getValue('custrecord_sna_hul_item'), line: intCtr});
                            
															
																																	 
																						
						   

																																				  

																												   

                      objSublist.setSublistValue({id: 'custpage_slf_itemcategory', value: objMyPagedData.getValue({name: "custitem_sna_hul_itemcategory",
                            join: "CUSTRECORD_SNA_HUL_ITEM"}), line: intCtr});
                      objSublist.setSublistValue({id: 'custpage_slf_vendor', value: objMyPagedData.getValue('custrecord_sna_hul_vendor'), line: intCtr});

																																																					

                            objSublist.setSublistValue({
                                id: 'custpage_slf_purchpricec',
                                value: flPurchPriceC,
                                line: intCtr
                            });
                            objSublist.setSublistValue({
                                id: 'custpage_slf_listpricec',
                                value: flListPriceC,
                                line: intCtr
                            });
                            objSublist.setSublistValue({
                                id: 'custpage_slf_contractpricec',
                                value: flContractPriceC,
                                line: intCtr
                            });

                            objSublist.setSublistValue({
                                id: 'custpage_slf_purchpriced',
                                value: flPurchPriceD,
                                line: intCtr
                            });
                            objSublist.setSublistValue({
                                id: 'custpage_slf_listpriced',
                                value: flListPriceD,
                                line: intCtr
                            });
                            objSublist.setSublistValue({
                                id: 'custpage_slf_contractpriced',
                                value: flContractPriceD,
                                line: intCtr
                            });

                            arrVPToApprove.push(objMyPagedData.id);



                            myIndex++;
                            intCtr++;
                        // }


                    });

                }



            }
            catch(err)
            {
                log.audit({
                    title: err.name,
                    details: err.message
                });

                throw err;

            }


            log.debug(stLoggerTitle, '|--->> Exiting ' + stLoggerTitle + ' <<---|');
            return form;
        }

        function setButtonValidation(prev, next, arr, page) {
            var stLoggerTitle = 'setButtonValidation';
            log.debug(stLoggerTitle, '|--->> Starting ' + stLoggerTitle + ' <<---|');


            if(!isEmpty(prev) && !isEmpty(next) && !isEmpty(arr)) {
                log.debug(stLoggerTitle, 'arr.length = ' + arr.length);
                for (var x = 0; x < arr.length; x++) {
                    var obj = arr[x];
                    log.debug(stLoggerTitle, 'obj.value = ' + obj.value + ' | page = ' + page);
                    if(obj.value == page) {
                        if(obj.isFirst == true) {
                            prev.isDisabled = true;
                        }

                        if(obj.isLast == true) {
                            next.isDisabled = true;
                        }

                        break;
                    }
                }
            }

            if(arr.length < 1)
            {
                prev.isDisabled = true;
                next.isDisabled = true;
            }

            log.debug(stLoggerTitle, '|--->> Exiting ' + stLoggerTitle + ' <<---|');
        }


        function searchVendorPrice(bGetNotSynchedVP, stItemCatFilter)
        {
            var stLoggerTitle = 'searchVendorPrice';
            log.debug(stLoggerTitle, '|--->> Starting ' + stLoggerTitle + ' <<---|');



            var objData = {};
            var arrFilters = [];


            arrFilters.push(search.createFilter({
                name: 'isinactive',
                operator: search.Operator.IS,
                values: 'F'
            }));

            arrFilters.push(search.createFilter({
                name: 'custrecord_sna_hul_forapproval',
                operator: search.Operator.IS,
                values: 'T'
            }));

            arrFilters.push(search.createFilter({
                name: 'custrecordsna_hul_vendoritemnumber',
                operator: search.Operator.ISNOTEMPTY,
                values: ''
            }));

            arrFilters.push(search.createFilter({
                name: 'custrecord_sna_hul_t_itempurchaseprice',
                operator: search.Operator.ISNOTEMPTY,
                values: ''
            }));

            arrFilters.push(search.createFilter({
                name: 'custrecord_sna_hul_t_listprice',
                operator: search.Operator.ISNOTEMPTY,
                values: ''
            }));

            arrFilters.push(search.createFilter({
                name: 'custrecord_sna_hul_t_contractprice',
                operator: search.Operator.ISNOTEMPTY,
                values: ''
            }));

            log.debug(stLoggerTitle, 'bGetNotSynchedVP = ' + bGetNotSynchedVP);
            if(bGetNotSynchedVP)
            {

                arrFilters.push(search.createFilter({
                    name: 'custrecord_sna_hul_issynced',
                    operator: search.Operator.IS,
                    values: 'F'
                }));
            }

																			 
			/* log.debug(stLoggerTitle, 'stItemCatFilter = ' + stItemCatFilter);
            if(stItemCatFilter)
            {

                arrFilters.push(search.createFilter({
                    name: "custitem_sna_hul_itemcategory",
                    join: "CUSTRECORD_SNA_HUL_ITEM",
                    operator: search.Operator.ANYOF,
                    values: stItemCatFilter
                }));
            } */
				   
			 

													 
														  
													
													
										   
					
			 

            var arrColumns = [
                search.createColumn({
                    name: "internalid",
                    sort: search.Sort.DESC
                }),
                "custrecord_sna_hul_item",
              search.createColumn({
                    name: "type",
                    join: "CUSTRECORD_SNA_HUL_ITEM"
                }),

                search.createColumn({
                    name: "custitem_sna_hul_itemcategory",
                    join: "CUSTRECORD_SNA_HUL_ITEM"
                }),

                "custrecord_sna_hul_vendor",
                "custrecordsna_hul_vendoritemnumber",
                "custrecord_sna_hul_primaryvendor",
                "custrecord_sna_hul_itempurchaseprice",
                "custrecord_sna_hul_listprice",
                "custrecord_sna_hul_contractprice",
                "custrecord_sna_hul_t_itempurchaseprice",
                "custrecord_sna_hul_t_listprice",
                "custrecord_sna_hul_t_contractprice",
                "custrecord_sna_hul_remarks"

            ];
            try
            {
                var objParam = {};
                objParam.recordType = 'customrecord_sna_hul_vendorprice';
                objParam.searchId =  null;
                objParam.searchFilters = arrFilters;
                objParam.searchColumns = arrColumns;
                objParam.isPaged = true;
                objParam.linesToShow = NO_OF_LINES_TO_SHOW;
                var arrVendorPriceSearch = searchVendorPriceMax(objParam);
                log.debug(stLoggerTitle, 'arrVendorPriceSearch = ' + JSON.stringify(arrVendorPriceSearch));



            }
            catch(err)
            {
                log.audit({
                    title: err.name,
                    details: err.message
                });

                throw err;
            }



            log.debug(stLoggerTitle, '|--->> Exiting ' + stLoggerTitle + ' <<---|');

            return arrVendorPriceSearch;
        }


        /**
         * Get all of the results from the search even if the results are more than 1000.
         * @param {String} recordType - the record type where the search will be executed.
         * @param {String} searchId - the search id of the saved search that will be used.
         * @param {nlobjSearchFilter[]} arrSearchFilter - array of nlobjSearchFilter objects. The search filters to be used or will be added to the saved search if search id was passed.
         * @param {nlobjSearchColumn[]} arrSearchColumn - array of nlobjSearchColumn objects. The columns to be returned or will be added to the saved search if search id was passed.
         * @param {boolean} isPaged - determines if we are going to do a paged search
         * @param {boolean} linesToShow - determines how many lines are we going to show per page
         * @returns {nlobjSearchResult[]} - an array of nlobjSearchResult objects
         *
         */
        function searchVendorPriceMax(objParam)
        {
            var stLoggerTitle = 'searchVendorPriceMax';
            log.debug(stLoggerTitle, '|--->> Starting ' + stLoggerTitle + ' <<---|');

            log.debug(stLoggerTitle, 'objParam = ' + JSON.stringify(objParam));

            if (objParam.recordType == null && objParam.searchId == null)
            {
                error.create(
                    {
                        name : 'SSS_MISSING_REQD_ARGUMENT',
                        message : 'search: Missing a required argument. Either recordType or searchId should be provided.',
                        notifyOff : false
                    });
            }


            var arrReturnSearchResults = new Array();
            var objSavedSearch;

            var maxResults = 1000;

            if (objParam.searchId != null)
            {
                objSavedSearch = search.load(
                    {
                        id : objParam.searchId
                    });

                // add search filter if one is passed
                if (objParam.searchFilters != null)
                {
                    objSavedSearch.filters = objSavedSearch.filters.concat(objParam.searchFilters);
                }

                // add search column if one is passed
                if (objParam.searchColumns != null)
                {
                    objSavedSearch.columns = objSavedSearch.columns.concat(objParam.searchColumns);
                }
            }
            else
            {
                objSavedSearch = search.create(
                    {
                        type : objParam.recordType
                    });

                // add search filter if one is passed
                if (objParam.searchFilters != null)
                {

                    objSavedSearch.filters = objParam.searchFilters;
                }

                // add search column if one is passed
                if (objParam.searchColumns != null)
                {
                    objSavedSearch.columns = objParam.searchColumns;
                }
            }

            var objResultset = {};

            if(objParam.isPaged && objParam.linesToShow)
            {
                objResultset = objSavedSearch.runPaged({
                    pageSize: objParam.linesToShow
                });

                return objResultset;
            }


            objResultset = objSavedSearch.run();
            var intSearchIndex = 0;
            var arrResultSlice = null;
            do
            {
                arrResultSlice = objResultset.getRange(intSearchIndex, intSearchIndex + maxResults);
                if (arrResultSlice == null)
                {
                    break;
                }

                arrReturnSearchResults = arrReturnSearchResults.concat(arrResultSlice);
                intSearchIndex = arrReturnSearchResults.length;
            }
            while (arrResultSlice.length >= maxResults);

            log.debug(stLoggerTitle, '|--->> Exiting ' + stLoggerTitle + ' <<---|');

            return arrReturnSearchResults;
        }

        function searchPageSummary(objMyPagedData)
        {
            var stLoggerTitle = 'searchPageSummary';
            log.debug(stLoggerTitle, '|--->> Starting ' + stLoggerTitle + ' <<---|');

            var arrPageObject = [];
            if(!isEmpty(objMyPagedData))
            {
                objMyPagedData.pageRanges.forEach(function (pageRange) {
                    var objMyPage = objMyPagedData.fetch({index: pageRange.index});
                    var stCompoundLabel = objMyPage.pageRange.compoundLabel;
                    var intPage = parseInt(objMyPage.pageRange.index);
                    arrPageObject.push({value: intPage, text: stCompoundLabel, isFirst: objMyPage.isFirst, isLast: objMyPage.isLast});
                });
            }





            log.debug(stLoggerTitle, '|--->> Exiting ' + stLoggerTitle + ' <<---|');
            return arrPageObject;


        }

        function isEmpty(stValue)
        {
            return ((stValue === '' || stValue == null || stValue == undefined)
                || (stValue.constructor === Array && stValue.length == 0)
                || (stValue.constructor === Object && (function(v){for(var k in v)return false;return true;})(stValue)));
        }

		   
																										 
																 
																			 
						   
		   
											   
		 
							   
			 
											
					 
									   
																		  
										 
					   
							   
			 

																			

											
			 
								
										   
								   
											 
								
										  
								
										  
							 
									   
							  
										
								   
											  
								 
											 
							   
										 
							   
										 
								
										  
								
												 
								 
										  
						   
									 
						
												   
			 
		 




        return {onRequest}
    });

