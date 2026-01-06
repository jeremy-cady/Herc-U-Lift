	/*
	 * Copyright (c) 2022, ScaleNorth Advisors LLC and/or its affiliates. All rights reserved.
	 *
	 * @author mdesilva
	 *
	 * Script brief description:
	 * This map/reduce script is used to create Bin Transfer records based on uploaded file.
	 *
	 * Revision History:
	 *
	 * Date             Issue/Case          Author          Issue Fix Summary
	 * =============================================================================================
	 * 2022/08/11                           mdesilva            Initial version
	 */

	/**
	 * @NApiVersion 2.0
	 * @NScriptType MapReduceScript
	 */
	define(['N/search', 'N/util', 'N/record', 'N/runtime', 'N/task', 'N/error', 'N/file', 'N/format', 'N/email'],
	    function(search, util, record, runtime, task, error, file, format, email) {
	        var mod_utils = {};

	        /**
	         * Raw CSV formatter function
	         * @param str
	         * @returns newElements
	         */
	        function splitCSVButIgnoreCommasInDoublequotes(str) {
	            var delimiter = ',';
	            var quotes = '"';
	            var elements = str.split(delimiter);
	            var newElements = [];

	            for (var i = 0; i < elements.length; ++i) {

	                if (elements[i].indexOf(quotes) >= 0) { //the left double quotes is found

	                    var indexOfRightQuotes = -1;
	                    var tmp = elements[i];
	                    //find the right double quotes
	                    for (var j = i + 1; j < elements.length; ++j) {
	                        if (elements[j].indexOf(quotes) >= 0) {
	                            indexOfRightQuotes = j;
	                            break;
	                        }
	                    }

	                    //found the right double quotes
	                    //merge all the elements between double quotes
	                    if (-1 != indexOfRightQuotes) {

	                        for (var j = i + 1; j <= indexOfRightQuotes; ++j) {
	                            tmp = tmp + delimiter + elements[j];
	                        }
	                        newElements.push(tmp);
	                        i = indexOfRightQuotes;
	                    } else { //right double quotes is not found
	                        newElements.push(elements[i]);
	                    }
	                } else { //no left double quotes is found
	                    newElements.push(elements[i]);
	                }
	            }

	            return newElements;
	        }

	        /**
	         * Date formatter function
	         * @param rawDate
	         */
	        function formatBatchDate(rawDate) {
	            var rDate = new Date(rawDate);
	            var batchDate = rDate.getDate();
	            var batchMonth = rDate.getMonth() + 1;
	            var batchYear = rDate.getFullYear();

	            return batchMonth.toString() + '/' + batchDate.toString() + '/' + batchYear.toString();
	        }

	        /**
	         * Sends email after record processing
	         * @param recordURLs
	         * @param noMatchList
	         * @param currUser
	         */
	        function sendNotificationEmail(recordURLs, currUser) {

	            log.debug({
	                title: 'sendNotificationEmail',
	                details: currUser
	            });
	            if (!mod_utils.isEmpty(currUser)) {
	                var bodyContents = '';

	                // No Deposit records created
	                if (mod_utils.isEmpty(recordURLs)) {
	                    bodyContents += '\nThere are no Bin Transfer records created.';
	                }

	                // Deposit records are created
	                else {
	                    bodyContents += 'The import process has finished.\n\nNew Bin Transfer records created:\n\n' + recordURLs;
	                }

	                // 28514 - csanluis@scalenorth.com
	                email.send({
	                    author: currUser,
	                    recipients: currUser,
	                    subject: 'HUL CSV Import | New Bin Transfer records',
	                    body: bodyContents
	                });

	                log.debug({
	                    title: 'sendNotificationEmail',
	                    details: 'Email sent to ' + currUser
	                });
	            }
	        }

	        /** Record URL constructor function */
	        function getRecordLink() {
	            var accountId = runtime.accountId;
	            var accId = accountId ? accountId.replace('_', '-') : accountId;
	            var recordURL = 'https://' + accId + '.app.netsuite.com/app/accounting/transactions/bintrnfr.nl?id=';

	            return recordURL;
	        }

	        function getInputData(inputContext) {
	            var currentScript, csvFileId, finalResults = [];
	            currentScript = runtime.getCurrentScript();
	            csvFileId = currentScript.getParameter({
	                name: 'custscript_sna_hul_bintransfer'
	            });

	            if (!mod_utils.isEmpty(csvFileId)) {
	                var arrLines;

	                // Load uploaded csv file
	                arrLines = file.load({
	                    id: csvFileId
	                }).getContents().split(/\n|\n\r/);
	                log.debug({
	                    title: 'getInputData',
	                    details: 'arrLines: ' + arrLines
	                });



	                if (!mod_utils.isEmpty(arrLines)) {
	                    //var content1, batchDate, rawDate, rawDate1;
	                    //content1 = splitCSVButIgnoreCommasInDoublequotes(arrLines[2]);
	                    //log.debug({ title: 'getInputData', details: 'content1: ' + content1 });
	                    //rawDate = !mod_utils.isEmpty(content1[1]) ? content1[1].replace(/\r/g, '').substring(0, content1[1].indexOf('T')) : '';
	                    //log.debug({ title: 'getInputData', details: 'content1[1]: ' + content1[1] });
	                    //log.debug({ title: 'getInputData', details: 'rawDate: ' + rawDate });
	                    //rawDate1 = rawDate.replace(/-/gi, '/');
	                    //batchDate = formatBatchDate(rawDate1);
	                    //log.debug({ title: 'getInputData', details: 'batchDate: ' + batchDate });
	                }

	                // Get line details from csv file
	                for (var i = 1; i < arrLines.length - 1; i++) {
	                    var content;
	                    content = splitCSVButIgnoreCommasInDoublequotes(arrLines[i]);
	                    log.debug({
	                        title: 'getInputData',
	                        details: 'content: ' + content
	                    });
	                    /**
	                    log.debug({
	                        title: 'getInputData',
	                        details: 'content[0]: ' + content[0]
	                    });
	                    log.debug({
	                        title: 'getInputData',
	                        details: 'content[1]: ' + content[1]
	                    });
	                    log.debug({
	                        title: 'getInputData',
	                        details: 'content[2]: ' + content[2]
	                    });
	                    log.debug({
	                        title: 'getInputData',
	                        details: 'content[3]: ' + content[3]
	                    });
	                    log.debug({
	                        title: 'getInputData',
	                        details: 'content[4]: ' + content[4]
	                    });
	                    log.debug({
	                        title: 'getInputData',
	                        details: 'content[5]: ' + content[5]
	                    });
	                    log.debug({
	                        title: 'getInputData',
	                        details: 'content[6]: ' + content[6]
	                    });
	                    log.debug({
	                        title: 'getInputData',
	                        details: 'content[7]: ' + content[7]
	                    });
						log.debug({
	                        title: 'getInputData',
	                        details: 'content[8]: ' + content[8]
	                    });
						log.debug({
	                        title: 'getInputData',
	                        details: 'content[9]: ' + content[9]
	                    });
						log.debug({
	                        title: 'getInputData',
	                        details: 'content[10]: ' + content[10]
	                    });
						**/


	                    if (!mod_utils.isEmpty(content[0])) {
	                        finalResults.push({
	                            warehouse: !mod_utils.isEmpty(content[0]) ? content[0] : '',
	                            item: !mod_utils.isEmpty(content[1]) ? content[1] : '',
	                            frombins: !mod_utils.isEmpty(content[2]) ? content[2] : '',
	                            tobins: !mod_utils.isEmpty(content[3]) ? content[3] : '',
	                            quantity: !mod_utils.isEmpty(content[4]) ? content[4] : ''

	                            /**
	                            externalid: !mod_utils.isEmpty(content[0]) ? content[0] : '',
	                            date: !mod_utils.isEmpty(content[1]) ? content[1] : '',
	                            warehouse: !mod_utils.isEmpty(content[2]) ? content[2] : '',
								memo: !mod_utils.isEmpty(content[3]) ? content[3] : '',
								item: !mod_utils.isEmpty(content[4]) ? content[4] : '',
								quantity: !mod_utils.isEmpty(content[5]) ? content[5] : '',
								frombins: !mod_utils.isEmpty(content[6]) ? content[6] : '',
								tobins: !mod_utils.isEmpty(content[7]) ? content[7] : '',
								fromstatus: !mod_utils.isEmpty(content[8]) ? content[8] : '',
								tostatus: !mod_utils.isEmpty(content[9]) ? content[9] : '',
								binquantity: !mod_utils.isEmpty(content[10]) ? content[10] : ''		
								**/
	                        });
	                    }

	                }
	            }

	            log.debug({
	                title: 'getInputData',
	                details: 'finalResults count: ' + finalResults.length
	            });
	            log.debug({
	                title: 'getInputData',
	                details: 'finalResults: ' + JSON.stringify(finalResults)
	            });
	            return finalResults;
	        }

	        function map(mapContext) {

	            var key, objSearchResult, paymentGroup = '',
	                _objSearchResult;
	            key = mapContext.key;
	            objSearchResult = mapContext.value;

	            _objSearchResult = JSON.parse(objSearchResult);

	            log.debug({
	                title: 'map',
	                details: 'key: ' + key
	            });
	            log.debug({
	                title: 'map',
	                details: '_objSearchResult: ' + JSON.stringify(_objSearchResult)
	            });


	            if (!mod_utils.isEmpty(_objSearchResult.warehouse)) {
	                log.debug({
	                    title: 'map',
	                    details: '_objSearchResult.warehouse: ' + _objSearchResult.warehouse
	                });
	                mapContext.write({
	                    key: _objSearchResult.warehouse,
	                    value: objSearchResult
	                });
	            }


	        }

	        function reduce(reduceContext) {
	            var currentScript, objReduceData, batchDate, parsedDate, warehouse, noMatch = '';

	            currentScript = runtime.getCurrentScript();
	            objReduceData = reduceContext.values;
	            log.debug({
	                title: 'reduce',
	                details: 'objReduceData: ' + JSON.stringify(objReduceData)
	            });
	            log.debug({
	                title: 'reduce',
	                details: 'reduceContext.key: ' + reduceContext.key
	            });


	            warehouse = JSON.parse(objReduceData[0]).warehouse;


	            log.debug({
	                title: 'reduce',
	                details: 'location: ' + warehouse
	            });

	            try {
	                // Create Bin Transfer
	                var rec, hasMarked = false;
	                rec = record.create({
	                    type: record.Type.BIN_TRANSFER,
	                    isDynamic: true
	                });
	                log.debug({
	                    title: 'reduce',
	                    details: 'record creation start'
	                });

	                // Set mainline fields

	                rec.setText({
	                    fieldId: 'location',
	                    text: warehouse
	                });



	                //based on csv lines
	                for (var i = 0; i < objReduceData.length; i++) {
	                    var parsed, lineIdByDocNum;

	                    parsed = JSON.parse(objReduceData[i]);
	                    log.debug({
	                        title: 'reduce',
	                        details: 'loop ' + i + ': ' + JSON.stringify(objReduceData[i])
	                    });

	                    //item
	                    var item_internalid;
	                    var itemSearchObj = search.create({
	                        type: "item",
	                        filters: [
								["formulatext: {name}","is",parsed.item]
	                            //["name", "is", parsed.item]
	                        ],
	                        columns: [
	                            search.createColumn({
	                                name: "internalid",
	                                label: "Internal ID"
	                            })
	                        ]
	                    });
	                    itemSearchObj.runPaged().count;
	                    itemSearchObj.run().each(function(result) {
	                        item_internalid = result.getValue({
	                            name: 'internalid'
	                        });
	                        return true;
	                    });

	                    //warehouse
	                    var location_internalid;
	                    var locationSearchObj = search.create({
	                        type: "location",
	                        filters: [
	                            ["name", "is", warehouse]
	                        ],
	                        columns: [
	                            search.createColumn({
	                                name: "internalid",
	                                label: "Internal ID"
	                            })
	                        ]
	                    });
	                    locationSearchObj.runPaged().count;
	                    locationSearchObj.run().each(function(result) {
	                        location_internalid = result.getValue({
	                            name: 'internalid'
	                        });
	                        return true;
	                    });
						log.debug('reduce', 'location_internalid: ' +location_internalid);

	                    //bin
	                    var frombins_internalid;
	                    var binSearchObj = search.create({
	                        type: "bin",
	                        filters: [
	                            ["binnumber", "is", parsed.frombins],
	                            "AND",
	                            ["location", "anyof", location_internalid]
	                        ],
	                        columns: [
	                            search.createColumn({
	                                name: "internalid",
	                                label: "Internal ID"
	                            })
	                        ]
	                    });
	                    binSearchObj.runPaged().count;
	                    binSearchObj.run().each(function(result) {
	                        frombins_internalid = result.getValue({
	                            name: 'internalid'
	                        });
	                        return true;
	                    });

	                    var tobins_internalid;
	                    var binSearchObj = search.create({
	                        type: "bin",
	                        filters: [
	                            ["binnumber", "is", parsed.tobins],
	                            "AND",
	                            ["location", "anyof", location_internalid]
	                        ],
	                        columns: [
	                            search.createColumn({
	                                name: "internalid",
	                                label: "Internal ID"
	                            })
	                        ]
	                    });
	                    binSearchObj.runPaged().count;
	                    binSearchObj.run().each(function(result) {
	                        tobins_internalid = result.getValue({
	                            name: 'internalid'
	                        });
	                        return true;
	                    });
						
						log.debug('reduce', 'item_internalid: '+item_internalid +' | frombins_internalid: '+frombins_internalid +' | tobins_internalid: '+tobins_internalid);
	                    rec.selectNewLine({
	                        sublistId: 'inventory'
	                    });

	                    rec.setCurrentSublistValue({
	                        sublistId: 'inventory',
	                        fieldId: 'item',
	                        value: item_internalid
	                    });

	                    rec.setCurrentSublistValue({
	                        sublistId: 'inventory',
	                        fieldId: 'quantity',
	                        value: parsed.quantity
	                    });

	                    var inventoryDetails = rec.getCurrentSublistSubrecord({
	                        sublistId: 'inventory',
	                        fieldId: 'inventorydetail'
	                    });

	                    inventoryDetails.selectNewLine({
	                        sublistId: 'inventoryassignment'
	                    });

	                    inventoryDetails.setCurrentSublistValue({
	                        sublistId: 'inventoryassignment',
	                        fieldId: 'binnumber',
	                        value: frombins_internalid
	                    });

	                    inventoryDetails.setCurrentSublistValue({
	                        sublistId: 'inventoryassignment',
	                        fieldId: 'tobinnumber',
	                        value: tobins_internalid
	                    });

	                    inventoryDetails.setCurrentSublistValue({
	                        sublistId: 'inventoryassignment',
	                        fieldId: 'quantity',
	                        value: parsed.quantity
	                    });
	                    inventoryDetails.commitLine({
	                        sublistId: 'inventoryassignment'
	                    });

	                    rec.commitLine({
	                        sublistId: 'inventory'
	                    });
	                }

	                var id = rec.save();

	                log.debug({
	                    title: 'Bin Transfer',
	                    details: id
	                });
	                reduceContext.write({
	                    key: id,
	                    value: noMatch
	                });
	            } catch (e) {
	                var userObj = runtime.getCurrentUser();
	                var currUser = userObj.id;
	                var errorMsg = '';

	                if (e.message != undefined) {
	                    errorMsg = e.name + ' ' + e.message;
	                    log.error('ERROR', e.name + ' ' + e.message);
	                } else {
	                    errorMsg = e.toString();
	                    log.error('ERROR', 'Unexpected Error', e.toString());
	                }
	                email.send({
	                    author: currUser,
	                    recipients: currUser,
	                    subject: 'HUL CSV Import | Error in Bin Transfer records',
	                    body: errorMsg
	                });


	            }

	        }

	        function summarize(summaryContext) {

	            log.debug({
	                title: 'summarize',
	                details: 'Usage: ' + summaryContext.usage + ' | Concurrency: ' + summaryContext.concurrency + ' | Yields: ' + summaryContext.yields
	            });


	            var currentScript, csvFileId, recordURLs = '',
	                recLink;

	            var userObj = runtime.getCurrentUser();
	            var currUser = userObj.id;
	            currentScript = runtime.getCurrentScript();
	            csvFileId = currentScript.getParameter({
	                name: 'custscript_sna_hul_bintransfer'
	            });


	            recLink = getRecordLink();

	            summaryContext.output.iterator().each(function(key, value) {


	                recordURLs += (recLink + key + '\n');


	                return true;
	            });

	            log.debug({
	                title: 'summarize',
	                details: 'URLs: ' + recordURLs
	            });
	            sendNotificationEmail(recordURLs, currUser);
	            log.debug({
	                title: 'summarize',
	                details: 'csvFileId to delete: ' + csvFileId
	            });

	            file.delete({
	                id: csvFileId
	            });


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
	            getInputData: getInputData,
	            map: map,
	            reduce: reduce,
	            summarize: summarize
	        };

	    });