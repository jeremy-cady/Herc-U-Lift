/*
 * Copyright (c) 2022, ScaleNorth Advisors LLC and/or its affiliates. All rights reserved.
 *
 * @author mdesilva
 *
 * Script brief description:
 * This suitelet is used to upload and process records.
 *
 * Revision History:
 *
 * Date             Issue/Case          Author          Issue Fix Summary
 * =============================================================================================
 * 2022/08/11                           mdesilva            Initial version
 * 2023/07/06                           cparba              Added Bin Put-Away Worksheet
 */

/**
 * @NApiVersion 2.x
 * @NScriptType Suitelet
 * @NModuleScope SameAccount
 */

define(['N/file', 'N/task', 'N/ui/serverWidget', 'N/search', 'N/url', 'N/runtime', 'N/record', 'N/ui/message'],
    function (file, task, serverWidget, search, url, runtime, record, message) {
		var mod_utils = {};

        var CONST = {

        }

        /**
         * Defines the Suitelet script trigger point.
         * @param {Object} scriptContext
         * @param {ServerRequest} scriptContext.request - Incoming request
         * @param {ServerResponse} scriptContext.response - Suitelet response
         * @since 2015.2
         */
        function onRequest(scriptContext) {
            var method = scriptContext.request.method;
			var params, form, note, csvFile, selection;
                params = scriptContext.request.parameters;

            // GET
            if (method == 'GET'){
                
				log.debug('method', method);
				log.debug('params', params);
				
                form = serverWidget.createForm({ title: 'SNA CSV Import', hideNavBar: false });

				
				//SelectRecord
				selection = form.addField({
                    id: 'custpage_sna_redeye_csvtype',
                    label: 'Select Record Type',
                    type: serverWidget.FieldType.SELECT,
                });

				selection.addSelectOption({
					value: 'c',
					text: 'Bin Transfer'
				});
                selection.addSelectOption({
                    value: 'd',
                    text: 'Bin Put-Away Worksheet'
                });

                // Field for csv file to be uploaded
                csvFile = form.addField({
                    id: 'custpage_sna_hul_csvfile',
                    label: 'CSV File',
                    type: serverWidget.FieldType.FILE
                });
                csvFile.updateLayoutType({
                    layoutType: serverWidget.FieldLayoutType.OUTSIDEBELOW
                });
                csvFile.updateBreakType({
                    breakType: serverWidget.FieldBreakType.STARTROW,
                });

                form.addSubmitButton({label: 'Submit'});

                scriptContext.response.writePage({pageObject: form});
            }

            // POST
            else {
                var currentScript, folderId, mrId, csvFile, csvFileId = '';
                currentScript = runtime.getCurrentScript();

                // Get script parameters
                //if(csv_recordtype == 'c') {
                //    folderId = '10896';
                //}

				//mrId = 'customscript_sna_create_binputaway';
                //folderId = currentScript.getParameter({ name: mod_scriptDef.suitelet.reconUploadFile.parameters.cybersourceReportFolder });
                //mrId = mod_scriptDef.mapReduce.reconCreateDeposit.id;

                // Get selected csv file
                csvFile = scriptContext.request.files['custpage_sna_hul_csvfile'];

                // Save the selected csv file and call m/r script for Deposits creation
                if (!mod_utils.isEmpty(csvFile)) {
					var csv_recordtype = params.custpage_sna_redeye_csvtype;
					log.debug({ title: 'csv_recordtype', details: 'mr csv_recordtype: ' + csv_recordtype });

                    // Get script parameters
                    if(csv_recordtype == 'c') {
                        folderId = '10896';
                    } else if(csv_recordtype == 'd'){
                        folderId = '11608';
                    }

                    csvFile.folder = folderId;
                    var fileName = csvFile.name;
                    csvFileId = csvFile.save();
                    log.debug({ title: 'POST - Save file', details: fileName + ' | ID: ' + csvFileId });
					
					if(csv_recordtype == 'c'){
						mrId = 'customscript_sna_mr_hul_create_bintransf';
					} else if(csv_recordtype == 'd'){
                        mrId = 'customscript_sna_hul_mr_create_bpw';
                    }
					
                    callMRscript(scriptContext, csvFileId, mrId, csv_recordtype);
                }
            }
        }

        /**
         * Calls the m/r script to process the CSV file
         *
         * @param scriptContext
         * @param csvFileId
         * @param mrId
         */
        function callMRscript(scriptContext, csvFileId, mrId, csv_recordtype) {
            var currentuser = '', _currentuser, isSuccess = false, successName,
                successDeploy, successId;

            _currentuser = runtime.getCurrentUser();
            if (!mod_utils.isEmpty(_currentuser)) {
                currentuser = _currentuser.id;
            }

            log.debug({ title: 'POST - callMRscript', details: 'mrId: ' + mrId });

            // Get all active deployments
            var arrDeployments = getActiveDeployments(mrId);
            log.debug({ title: 'POST - callMRscript', details: 'mr deployment: ' + JSON.stringify(arrDeployments) });

            arrDeployments.forEach(
                function (deployment) {
                    // Get next active deployment if previous deployment failed
                    if (!isSuccess) {
                        log.debug({ title: 'POST - callMRscript', details: 'Processing Deployment: ' + deployment.name });

                        try {
							var taskSched;
							if(csv_recordtype == 'c'){
								
								taskSched = task.create({
								taskType: task.TaskType.MAP_REDUCE,
								scriptId: deployment.mrScriptId,
								deploymentId: deployment.name,
								params: {
									'custscript_sna_hul_bintransfer': csvFileId,
									'custscript_sna_hul_bt_currentuser': currentuser
									}
								});
								
							} else if(csv_recordtype == 'd'){

                                taskSched = task.create({
                                    taskType: task.TaskType.MAP_REDUCE,
                                    scriptId: deployment.mrScriptId,
                                    deploymentId: deployment.name,
                                    params: {
                                        'custscript_sna_hul_bin_putaway_worksheet': csvFileId
                                    }
                                });

                            }

                            var taskSchedId = taskSched.submit();
                            var taskStatus = task.checkStatus(taskSchedId);
                            log.debug({title: 'POST - callMRscript', details: 'Deployment Status: ' + taskStatus.status});

                            if (taskStatus.status != task.TaskStatus.FAILED) {
                                isSuccess = true;
                                successName = 'SNA HUL MR CSV Import Creation';
                                successDeploy = deployment.name;
                                successId = deployment.id;

                                log.debug({title: 'POST - callMRscript', details: 'Map Reduce has successfully been scheduled.'});

                                return false;
                            }
                        } catch (err) {
                            if (err.message != undefined) {
                                log.debug({title: 'POST - callMRscript - err', details: err.name + ' ' + err.message});
                            } else {
                                log.debug({title: 'POST - callMRscript - err', details: err.toString()});
                            }
                        }
                    }

                    return true;
                }
            );

            // create wait response page
			var form, csv_rectype;
			if(csv_recordtype == 'c'){
				form = serverWidget.createForm({title: 'Bin Transfer Creation Status'});
				csv_rectype = 'Bin Transfer';
			} else if(csv_recordtype == 'd'){
                form = serverWidget.createForm({title: 'Bin Put-Away Worksheet Status'});
                csv_rectype = 'Bin Put-Away Worksheet';
            }
			

            var output = url.resolveTaskLink({ id: 'LIST_MAPREDUCESCRIPTSTATUS',
                params: {
                    date: 'TODAY',
                    primarykey: successId,
                    sortcol: 'dateCreated',
                    sortdir: 'DESC',
                    scripttype: arrDeployments[0].mrInternalId
                }
            });

            var waitResponse = form.addField({
                id: 'custpage_sna_redeye_wait_response',
                type: serverWidget.FieldType.INLINEHTML,
                label: 'Wait Response'
            }).defaultValue = '<p style=\"font-size:12px\">Please check the status of the Map/Reduce script for ' +csv_rectype+ ' creation by clicking this <a href=\"' + output + '\">LINK</a>.<br /></p>';

            scriptContext.response.writePage(form);
            return;

        }

        /**
         * Get active deployments
         *
         * @param mrId
         * @returns {*[]}
         */
        function getActiveDeployments(mrId) {
            var arrDeployments = [];

            if (mod_utils.isEmpty(mrId)) return [];

            var fil = [];
            fil.push(search.createFilter({ name: 'scriptid', join: 'script', operator: 'is', values: mrId }));
            fil.push(search.createFilter({ name: 'isdeployed', operator: 'is', values: true }));
            fil.push(search.createFilter({ name: 'status', operator: 'anyof', values: 'NOTSCHEDULED' }));

            var arrSearch = search.create({
                type: 'scriptdeployment',
                columns: [search.createColumn({ name: 'scriptid' }),
                    search.createColumn({ name: 'script' }),
                    search.createColumn({
                        name: 'scriptid',
                        join: 'script',
                    })
                ],
                filters: fil
            });

            arrSearch.run().each(function (result) {
                arrDeployments.push({
                    id: result.id,
                    name: result.getValue({ name: 'scriptid'}),
                    mrInternalId: result.getValue({ name: 'script'}),
                    mrScriptId: result.getValue({ name: 'scriptid', join: 'script'})
                });

                return true;
            });

            return arrDeployments;
        }
		
				mod_utils.isEmpty = function(stValue) {
		            return ((stValue === '' || stValue == null || stValue == undefined) ||
		                (stValue.constructor === Array && stValue.length == 0) ||
		                (stValue.constructor === Object && (function(v) {
		                    for (var k in v) return false;
		                    return true;
		                })(stValue)));
		        };
				
        return {
            onRequest: onRequest
        };

    });