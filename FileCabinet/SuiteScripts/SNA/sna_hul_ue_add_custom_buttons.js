/*
 * Copyright (c) 2021, ScaleNorth Advisors LLC and/or its affiliates. All rights reserved.
 *
 * @author lkhatri
 *
 * Script brief description:
 *
 * Revision History:
 * Date              Issue/Case         Author         Issue Fix Summary
 * =============================================================================================
 * 2023/05/18        ######             lkhatri         Initial version
 * 2024/04           174419             lmagbanua       added validate logic when redirecting to SO  
 *
 */

/**
 * @NApiVersion 2.1
 * @NScriptType UserEventScript
 * @NModuleScope SameAccount
 */

define(['N/https', 'N/record', 'N/runtime', 'N/search', 'N/xml', 'N/email', "N/url", "N/render", "N/file", "N/ui/serverWidget", "N/redirect", 'N/query'],
    function (https, record, runtime, search, xml, email, url, render, file, serverWidget, redirect, query) {


        function beforeLoad(context) {

            try {
                var recNew = context.newRecord;
                var recOld = context.oldRecord;
                var recType = context.newRecord.type;
                var recId = context.newRecord.id;
                var form = context.form;
                var customformSO;
                var customformEst;
                var entity;

                var rentalReqFormSO = runtime.getCurrentScript().getParameter({ name: 'custscript_sna_hul_rental_request' });

                var partsReqFormSO = runtime.getCurrentScript().getParameter({ name: 'custscript_sna_hul_parts_req' });

                var servReqFormSO = runtime.getCurrentScript().getParameter({ name: 'custscript_sna_hul_form_serv_req' });

                var defReqFormSO = runtime.getCurrentScript().getParameter({ name: 'custscript_sna_hul_def_cust_form' });

                var rentalReqFormEst = runtime.getCurrentScript().getParameter({ name: 'custscript_sna_hul_rental_request_est' });

                var partsReqFormEst = runtime.getCurrentScript().getParameter({ name: 'custscript__sna_hul_parts_req_esti' });

                var servReqFormEst = runtime.getCurrentScript().getParameter({ name: 'custscript_sna_hul_form_serv_req_esti' });

                var defReqFormEst = runtime.getCurrentScript().getParameter({ name: 'custscript_sna_hul_def_cust_form_estimat' });

                // if ((context.type === context.UserEventType.VIEW || context.type === context.UserEventType.EDIT) && recType === 'supportcase') {
                if ((context.type === context.UserEventType.VIEW)) {

                    log.debug("rentalReqFormSO", rentalReqFormSO);
                    log.debug("partsReqFormSO", partsReqFormSO);
                    log.debug("servReqFormSO", servReqFormSO);
                    log.debug("defReqFormSO", defReqFormSO);
                    log.debug("rentalReqFormEst", rentalReqFormEst);
                    log.debug("partsReqFormEst", partsReqFormEst);
                    log.debug("servReqFormEst", servReqFormEst);
                    log.debug("defReqFormEst", defReqFormEst);

                    var category = recNew.getValue({
                        fieldId: 'category'
                    });
                    log.debug("category", category);

                    var department = recNew.getValue({
                        fieldId: 'custevent_sna_hul_casedept'
                    });
                    log.debug("department", department);

                    entity = recNew.getValue({
                        fieldId: 'custevent_nx_customer'
                    });
                    log.debug("entity", entity);


                    // if (department == 4) { //service request
                    //     customformSO = 131;
                    //     customformEst = 132;

                    // } else if (department == 23) { //rental request
                    //     customformSO = 121;
                    //     customformEst = 122;

                    // } else if (department == 18) { // parts request
                    //     customformSO = 112;
                    //     customformEst = 111;

                    // } else {
                    //     customformSO = 106;
                    //     customformEst = 105;
                    // }


                    if (department == 4) { //service request
                        customformSO = defReqFormSO;
                        customformEst = defReqFormEst;

                    } else if (department == 23) { //rental request
                        customformSO = rentalReqFormSO;
                        customformEst = rentalReqFormEst;

                    } else if (department == 18) { // parts request
                        customformSO = partsReqFormSO;
                        customformEst = partsReqFormEst;

                    } else {
                        customformSO = servReqFormSO;
                        customformEst = servReqFormEst;
                    }

                    if (recType === 'supportcase') {
                        form.addButton({
                            id: 'custpage_redirect_button1',
                            label: 'Create Sales Order',
                            functionName: getRedirectFunctionSO("salesorder", recId, customformSO, entity) // updated lmagbanua
                        });
                        form.addButton({
                            id: 'custpage_redirect_button2',
                            label: 'Create Estimate/Quote',
                            functionName: getRedirectFunction("estimate", recId, customformEst, entity)
                        });
                    }

                }
                else if (context.type === context.UserEventType.CREATE && (recType === 'salesorder' || recType === 'estimate')) {

                    let supportcase = context.request.parameters.supportcase;
                    log.debug("supportcase", supportcase);
                    var taskid = getTaskIDs(supportcase);
                    log.debug("taskid from query", taskid);
                    if (!isEmpty(taskid)) {
                        var taskvalue = taskid[0].taskid;
                        log.debug("taskvalue", taskvalue);
                    }

                    var fieldLookUp = search.lookupFields({
                        type: 'supportcase', id: supportcase,
                        columns: ['category', 'subsidiary', 'company', 'contact', 'custevent_nx_customer', 'custevent_nx_customer.subsidiary', 'custevent_sna_hul_caselocation',
                            'custevent_nx_case_asset', 'custevent_nx_case_asset.custrecord_sna_hul_nxcassetobject', 'custevent_sna_hul_casedept', 'custevent_nxc_case_assets', 'cseg_sna_revenue_st']
                    });
                    log.debug("fieldLookUp", formatLookupObject(fieldLookUp));

                    var category = formatLookupObject(fieldLookUp).category;
                    // log.debug("category", category);
                    var customer = formatLookupObject(fieldLookUp).custevent_nx_customer;
                    // log.debug("customer", customer);
                    var customersub = formatLookupObject(fieldLookUp).custevent_nx_customer.subsidiary;
                    // log.debug("customersub", customersub);
                    var subsidiary = formatLookupObject(fieldLookUp).custevent_nx_customer;
                    log.debug("subsidiary", subsidiary);
                    var location = formatLookupObject(fieldLookUp).custevent_sna_hul_caselocation;
                    // log.debug("location", location);
                    var company = formatLookupObject(fieldLookUp).company;
                    // log.debug("company", company);
                    var contact = formatLookupObject(fieldLookUp).contact;
                    // log.debug("contact", contact);
                    var custevent_nx_case_asset = formatLookupObject(fieldLookUp).custevent_nx_case_asset;
                    // log.debug("custevent_nx_case_asset", custevent_nx_case_asset);
                    var assetObject = formatLookupObject(fieldLookUp).custevent_nx_case_asset.custrecord_sna_hul_nxcassetobject;
                    // log.debug("assetObject", assetObject);
                    var department = formatLookupObject(fieldLookUp).custevent_sna_hul_casedept;
                    // log.debug("department", department);
                    var custevent_nxc_case_assets = formatLookupObject(fieldLookUp).custevent_nxc_case_assets;
                    // log.debug("custevent_nxc_case_assets", custevent_nxc_case_assets);
                    var revenue_streams = formatLookupObject(fieldLookUp).cseg_sna_revenue_st;
                    // log.debug("revenue_streams", revenue_streams);


                    form.updateDefaultValues({
                        "entity": customer
                    });
                    form.updateDefaultValues({
                        "subsidiary": 2
                    });
                    form.updateDefaultValues({
                        "department": department
                    });
                    form.updateDefaultValues({
                        "custbody_sna_hul_location": location
                    });
                    //uncomment for estimate
                    // form.updateDefaultValues({
                    //     "job": company
                    // });
                    form.updateDefaultValues({
                        "custbody_sna_contact": contact
                    });
                    form.updateDefaultValues({
                        "location": location
                    });
                    form.updateDefaultValues({
                        "custbody_nx_asset": custevent_nx_case_asset
                    });
                    form.updateDefaultValues({
                        "cseg_sna_revenue_st": revenue_streams
                    });
                    form.updateDefaultValues({
                        "custbody_sna_hul_nxc_eq_asset": custevent_nxc_case_assets
                    });
                    if (recType === 'salesorder') {
                        form.updateDefaultValues({
                            "custbody_nx_case": supportcase
                        });
                        log.audit("taskvalue", taskvalue);
                        form.updateDefaultValues({
                            "custbody_nx_task": taskvalue
                        });
                        form.updateDefaultValues({
                            "job": company
                        });
                    }
                    if (recType === 'salesorder') {
                        log.debug("recType inside salesorder");
                        record.submitFields({
                            type: 'supportcase',
                            id: supportcase,
                            values: {
                                'custevent_nx_case_transaction': recId
                            }
                        });
                    }

                }
            } catch (e) {
                log.debug("e", e);
            }

        }

        function getUrl(responseUrl) {
            var output = url.resolveDomain({ hostType: url.HostType.APPLICATION, accountId: runtime.accountId });
            return `https://${output}${responseUrl}`;
        }

        function getRedirectFunction(recordType, caseId, customform, entity) {
            var output = url.resolveRecord({ recordType, recordId: "", isEditMode: true, params: { supportcase: caseId, cf: customform, entity: entity } });
            var responseUrl = getUrl(output);
            return `window.ischanged = false;window.open('${responseUrl}','_self');`;
        }

      // new function specific for SO.
      function getRedirectFunctionSO(recordType, caseId, customform, entity) {
            var output = url.resolveRecord({ recordType, recordId: "", isEditMode: true, params: { supportcase: caseId, cf: customform, entity: entity } });
            var responseUrl = getUrl(output);
            var boolDuplicate = false;

            log.debug('getRedirectFunctionSO - caseId',caseId);

            var salesorderSearchObj = search.create({
                type: "salesorder",
                filters:
                    [
                        ["type", "anyof", "SalesOrd"],
                        "AND",
                        ["custbody_nx_case", "noneof", "@NONE@"],
                        "AND",
                        ["status", "noneof", "SalesOrd:C", "SalesOrd:H"],
                        "AND",
                        ["mainline", "is", "T"],
                        "AND",
                        ["cogs", "is", "F"],
                        "AND",
                        ["shipping", "is", "F"],
                        "AND",
                        ["taxline", "is", "F"],
                        "AND",
                        ["custbody_nx_case", "anyof", caseId]
                    ],
                columns:
                    [
                        search.createColumn({ name: "tranid", label: "Document Number" }),
                    ]
            });
            var searchResultCount = salesorderSearchObj.runPaged().count;
            log.debug("salesorderSearchObj result count", searchResultCount);

            if (searchResultCount > 0) {
                boolDuplicate = true;
            }
            else {
                boolDuplicate = false;
            }

            if (boolDuplicate==true) {
                return `var boolConfirm = confirm('Duplicate SO has been Detected. Are You Sure You Want to Proceed?');if(boolConfirm) window.open('${responseUrl}','_self');`;
            }
            else {
                return `window.ischanged = false;window.open('${responseUrl}','_self');`;
            }
        }

        const formatLookupObject = (data) => {
            let response = {};
            for (let key in data) {
                try {
                    if (data[key].constructor == Array && data[key].length == 1) response[key] = data[key][0].value;
                    else if (data[key].constructor == Array && data[key].length > 1) {
                        let dataArr = [];
                        data[key].forEach(element => dataArr.push(element.value));
                        response[key] = dataArr;
                    }
                    else if (data[key].constructor == Array && data[key].length > 1) {
                        let array = [];
                        data[key].forEach(element => {
                            array.push(element)
                        });
                        response[key] = array;
                    } else response[key] = data[key];
                } catch (error) {
                }
            }
            return response;
        }

        function getTaskIDs(caseId) {
            // var sql = `SELECT QUOTA.ENTITY, ENTITY.ENTITYID, SUM(mamountquarterly) FROM quota INNER JOIN entity ON quota.entity = entity.id WHERE date BETWEEN '04/01/2023' AND '06/30/2023' GROUP BY entity, entity.entityid`;
            //   var sql = `SELECT id FROM TASK WHERE supportcase=` + caseId;

            var sql = `SELECT id FROM TASK WHERE supportcase = '${caseId}' AND duedate = (SELECT MIN(duedate) FROM TASK WHERE supportcase = '${caseId}' AND status = 'NOTSTART')`;
            log.debug("sql", sql);

            let queryResults = query.runSuiteQLPaged({ query: sql, pageSize: 1000 }).iterator();
            // log.debug("queryResults", queryResults);
            var response = [];

            queryResults.each(function (x) {
                let pageIt = x.value.data.iterator();
                pageIt.each(function (row) {
                    response.push({
                        taskid: row.value.getValue(0)
                    });
                    return true;
                });
                return true;
            });
            log.debug("response", response);
            return response;
        }

        function isEmpty(stValue) {
            return ((stValue === '' || stValue == null || stValue == undefined) || (stValue.constructor === Array && stValue.length == 0) || (stValue.constructor === Object && (function (v) {
                for (var k in v)
                    return false;
                return true;
            })(stValue)));
        }

        return {
            beforeLoad: beforeLoad
        }

    });