/**
 * @NApiVersion 2.1
 * @NScriptType MapReduceScript
 * @NModuleScope SameAccount
 *
 * HUL - Address Change Asset Update (MapReduce)
 *
 * Purpose: Process large batch updates of Field Service Assets, Cases, and Projects
 * when a customer changes addresses. Invoked by the Address Change Update Suitelet
 * when record count exceeds the real-time processing threshold.
 *
 * Critical Constraint: Equipment parent fields MUST be updated BEFORE cases/projects
 * can be updated (FSM module requirement). This is handled by using phase numbers
 * in the map keys to ensure proper sequencing.
 *
 * Script Parameters:
 * - custscript_acu_customer_id: Customer Internal ID
 * - custscript_acu_old_site_id: Old Site Asset ID
 * - custscript_acu_new_site_id: New Site Asset ID
 * - custscript_acu_equipment_ids: Comma-separated Equipment Asset IDs
 * - custscript_acu_case_ids: Comma-separated Case IDs
 * - custscript_acu_project_ids: Comma-separated Project IDs
 * - custscript_acu_task_ids: Comma-separated Task IDs
 * - custscript_acu_user_email: Email address for completion notification
 */

define(['N/record', 'N/runtime', 'N/email', 'N/query', 'N/log'],
    function(record, runtime, email, query, log) {

        /**
         * getInputData stage
         * Build work items with phase numbers to ensure proper sequencing
         */
        function getInputData() {
            var script = runtime.getCurrentScript();

            var customerId = script.getParameter({ name: 'custscript_acu_customer_id' });
            var oldSiteId = script.getParameter({ name: 'custscript_acu_old_site_id' });
            var newSiteId = script.getParameter({ name: 'custscript_acu_new_site_id' });
            var equipmentIdsStr = script.getParameter({ name: 'custscript_acu_equipment_ids' }) || '';
            var caseIdsStr = script.getParameter({ name: 'custscript_acu_case_ids' }) || '';
            var projectIdsStr = script.getParameter({ name: 'custscript_acu_project_ids' }) || '';
            var taskIdsStr = script.getParameter({ name: 'custscript_acu_task_ids' }) || '';
            var userEmail = script.getParameter({ name: 'custscript_acu_user_email' });

            var equipmentIds = equipmentIdsStr.split(',').filter(Boolean);
            var caseIds = caseIdsStr.split(',').filter(Boolean);
            var projectIds = projectIdsStr.split(',').filter(Boolean);
            var taskIds = taskIdsStr.split(',').filter(Boolean);

            // Get old and new site names for title/name replacement
            var oldSiteName = getSiteName(oldSiteId);
            var newSiteName = getSiteName(newSiteId);

            log.audit('getInputData', {
                message: 'Starting address change update',
                customerId: customerId,
                oldSiteId: oldSiteId,
                oldSiteName: oldSiteName,
                newSiteId: newSiteId,
                newSiteName: newSiteName,
                equipmentCount: equipmentIds.length,
                caseCount: caseIds.length,
                projectCount: projectIds.length,
                taskCount: taskIds.length,
                userEmail: userEmail
            });

            // Build work items with phase numbers to ensure sequencing
            // Phase 1 = Equipment (MUST complete first)
            // Phase 2 = Projects (must be before Cases due to FSM dependency)
            // Phase 3 = Cases (after Projects)
            var workItems = [];

            // Phase 1: Equipment
            equipmentIds.forEach(function(id, idx) {
                workItems.push({
                    phase: 1,
                    type: 'equipment',
                    recordType: 'customrecord_nx_asset',
                    recordId: id,
                    newSiteId: newSiteId,
                    fieldId: 'parent',
                    sequence: idx
                });
            });

            // Phase 2: Projects (must be before Cases)
            projectIds.forEach(function(id, idx) {
                workItems.push({
                    phase: 2,
                    type: 'project',
                    recordType: 'job',
                    recordId: id,
                    newSiteId: newSiteId,
                    oldSiteName: oldSiteName,
                    newSiteName: newSiteName,
                    fieldId: 'custentity_nx_asset',
                    nameFieldId: 'companyname',
                    sequence: equipmentIds.length + idx
                });
            });

            // Phase 3: Cases (after Projects)
            caseIds.forEach(function(id, idx) {
                workItems.push({
                    phase: 3,
                    type: 'case',
                    recordType: 'supportcase',
                    recordId: id,
                    newSiteId: newSiteId,
                    oldSiteName: oldSiteName,
                    newSiteName: newSiteName,
                    fieldId: 'custevent_nx_case_asset',
                    nameFieldId: 'title',
                    sequence: equipmentIds.length + projectIds.length + idx
                });
            });

            // Phase 4: Tasks (after Cases)
            taskIds.forEach(function(id, idx) {
                workItems.push({
                    phase: 4,
                    type: 'task',
                    recordType: 'task',
                    recordId: id,
                    newSiteId: newSiteId,
                    oldSiteName: oldSiteName,
                    newSiteName: newSiteName,
                    fieldId: 'custevent_nx_task_asset',
                    nameFieldId: 'title',
                    sequence: equipmentIds.length + projectIds.length + caseIds.length + idx
                });
            });

            log.audit('getInputData', 'Created ' + workItems.length + ' work items');
            return workItems;
        }

        /**
         * map stage
         * Key by phase and sequence to ensure proper ordering in reduce
         */
        function map(context) {
            try {
                var item = JSON.parse(context.value);

                // Create a key that sorts properly: phase + padded sequence
                // This ensures phase 1 items process before phase 2, etc.
                var sortKey = item.phase + '_' + String(item.sequence).padStart(6, '0');

                context.write({
                    key: sortKey,
                    value: item
                });

            } catch (e) {
                log.error('map Error', {
                    error: e.toString(),
                    value: context.value
                });
            }
        }

        /**
         * reduce stage
         * Execute the actual record updates
         * Keys are sorted, so phase 1 (equipment) processes before phase 2 (projects) and phase 3 (cases)
         */
        function reduce(context) {
            var item = JSON.parse(context.values[0]);

            try {
                log.debug('reduce', {
                    type: item.type,
                    recordId: item.recordId,
                    field: item.fieldId,
                    newValue: item.newSiteId,
                    nameFieldId: item.nameFieldId || 'N/A'
                });

                // For equipment, use simple submitFields
                if (item.type === 'equipment') {
                    var values = {};
                    values[item.fieldId] = item.newSiteId;

                    record.submitFields({
                        type: item.recordType,
                        id: item.recordId,
                        values: values
                    });
                } else {
                    // For cases, projects, and tasks - load record to update site asset AND name
                    var rec = record.load({
                        type: item.recordType,
                        id: item.recordId,
                        isDynamic: false
                    });

                    // Preserve equipment assets (multi-select field) before making changes (not applicable for tasks)
                    var equipmentAssets = null;
                    if (item.type === 'project') {
                        equipmentAssets = rec.getValue({ fieldId: 'custentity_nxc_project_assets' });
                    } else if (item.type === 'case') {
                        equipmentAssets = rec.getValue({ fieldId: 'custevent_nxc_case_assets' });
                    }

                    // Update site asset field
                    rec.setValue({ fieldId: item.fieldId, value: item.newSiteId });

                    // Update name/title field
                    if (item.type === 'project' && item.newSiteName) {
                        // For projects, rebuild name from TYPE + NUMBER + NEW_SITE
                        // NetSuite companyname field has 83 character limit
                        var projectType = rec.getText({ fieldId: 'custentity_nx_project_type' }) || '';
                        // entityid contains formatted string, extract just the leading number
                        var entityId = rec.getValue({ fieldId: 'entityid' }) || '';
                        var projectNumber = entityId.split(' ')[0] || '';

                        if (projectType && projectNumber) {
                            var newProjectName = projectType + ' ' + projectNumber + ' ' + item.newSiteName;
                            if (newProjectName.length > 83) {
                                newProjectName = newProjectName.substring(0, 83);
                                log.debug('reduce', { message: 'Project name truncated to 83 chars', recordId: item.recordId });
                            }
                            rec.setValue({ fieldId: 'companyname', value: newProjectName });
                            log.debug('reduce', {
                                message: 'Rebuilt project name',
                                recordId: item.recordId,
                                newName: newProjectName
                            });
                        }
                    } else if (item.nameFieldId && item.oldSiteName && item.newSiteName) {
                        // For cases and tasks, use string replacement
                        var currentName = rec.getValue({ fieldId: item.nameFieldId }) || '';
                        var newName = currentName.replace(item.oldSiteName, item.newSiteName);

                        if (newName !== currentName) {
                            rec.setValue({ fieldId: item.nameFieldId, value: newName });
                            log.debug('reduce', {
                                message: 'Updated name field',
                                recordId: item.recordId,
                                oldName: currentName,
                                newName: newName
                            });
                        }
                    }

                    // Re-set equipment assets to preserve them (only for projects and cases)
                    if (equipmentAssets) {
                        var equipmentAssetsFieldId = item.type === 'project' ? 'custentity_nxc_project_assets' : 'custevent_nxc_case_assets';
                        rec.setValue({ fieldId: equipmentAssetsFieldId, value: equipmentAssets });
                    }

                    // For tasks, also update address fields from the new site asset
                    if (item.type === 'task') {
                        var siteAddress = getSiteAddressDetails(item.newSiteId);
                        if (siteAddress.address) {
                            rec.setValue({ fieldId: 'custevent_nx_address', value: siteAddress.address });
                        }
                        if (siteAddress.latitude) {
                            rec.setValue({ fieldId: 'custevent_nx_latitude', value: siteAddress.latitude });
                        }
                        if (siteAddress.longitude) {
                            rec.setValue({ fieldId: 'custevent_nx_longitude', value: siteAddress.longitude });
                        }
                    }

                    rec.save();
                }

                // Write success result
                context.write({
                    key: item.type,
                    value: {
                        id: item.recordId,
                        status: 'success'
                    }
                });

            } catch (e) {
                log.error('reduce Error', {
                    type: item.type,
                    recordId: item.recordId,
                    error: e.toString()
                });

                // Write error result
                context.write({
                    key: item.type,
                    value: {
                        id: item.recordId,
                        status: 'error',
                        message: e.message || e.toString()
                    }
                });
            }
        }

        /**
         * summarize stage
         * Compile results and send email notification
         */
        function summarize(context) {
            var script = runtime.getCurrentScript();
            var userEmail = script.getParameter({ name: 'custscript_acu_user_email' });
            var customerId = script.getParameter({ name: 'custscript_acu_customer_id' });
            var newSiteId = script.getParameter({ name: 'custscript_acu_new_site_id' });

            // Get customer and site names for the email
            var customerName = getRecordName('customer', customerId);
            var newSiteName = getSiteName(newSiteId);

            // Compile results
            var results = {
                equipment: { success: 0, error: 0, errors: [] },
                case: { success: 0, error: 0, errors: [] },
                project: { success: 0, error: 0, errors: [] },
                task: { success: 0, error: 0, errors: [] }
            };

            context.output.iterator().each(function(key, value) {
                var data = JSON.parse(value);
                var type = key;

                if (results[type]) {
                    if (data.status === 'success') {
                        results[type].success++;
                    } else {
                        results[type].error++;
                        results[type].errors.push(data.id + ': ' + (data.message || 'Unknown error'));
                    }
                }

                return true;
            });

            // Calculate totals
            var totalSuccess = results.equipment.success + results.case.success + results.project.success + results.task.success;
            var totalErrors = results.equipment.error + results.case.error + results.project.error + results.task.error;

            // Log summary
            log.audit('summarize', {
                message: 'Address change update complete',
                totalSuccess: totalSuccess,
                totalErrors: totalErrors,
                equipmentSuccess: results.equipment.success,
                equipmentErrors: results.equipment.error,
                caseSuccess: results.case.success,
                caseErrors: results.case.error,
                projectSuccess: results.project.success,
                projectErrors: results.project.error,
                taskSuccess: results.task.success,
                taskErrors: results.task.error
            });

            // Log any map/reduce errors
            if (context.inputSummary.error) {
                log.error('Input Error', context.inputSummary.error);
            }

            context.mapSummary.errors.iterator().each(function(key, error) {
                log.error('Map Error', { key: key, error: error });
                return true;
            });

            context.reduceSummary.errors.iterator().each(function(key, error) {
                log.error('Reduce Error', { key: key, error: error });
                return true;
            });

            // Send email notification
            if (userEmail) {
                try {
                    var subject = totalErrors === 0 ?
                        'Address Change Update Complete - Success' :
                        'Address Change Update Complete - ' + totalErrors + ' Errors';

                    var body = buildEmailBody(customerName, newSiteName, results, totalSuccess, totalErrors);

                    email.send({
                        author: runtime.getCurrentUser().id,
                        recipients: userEmail,
                        subject: subject,
                        body: body
                    });

                    log.audit('summarize', 'Email sent to ' + userEmail);

                } catch (e) {
                    log.error('Email Error', e.toString());
                }
            }
        }

        /**
         * Build email body HTML
         */
        function buildEmailBody(customerName, newSiteName, results, totalSuccess, totalErrors) {
            var body = '<html><body style="font-family: Arial, sans-serif;">';

            body += '<h2>Address Change Update Complete</h2>';

            body += '<table style="border-collapse: collapse; margin: 20px 0;">';
            body += '<tr><td style="padding: 5px 15px 5px 0;"><strong>Customer:</strong></td><td>' + escapeHtml(customerName) + '</td></tr>';
            body += '<tr><td style="padding: 5px 15px 5px 0;"><strong>New Site:</strong></td><td>' + escapeHtml(newSiteName) + '</td></tr>';
            body += '</table>';

            // Summary
            body += '<h3>Summary</h3>';
            body += '<table style="border-collapse: collapse;">';
            body += '<tr style="background: #f5f5f5;"><th style="padding: 8px; text-align: left; border: 1px solid #ddd;">Type</th>' +
                '<th style="padding: 8px; text-align: center; border: 1px solid #ddd;">Success</th>' +
                '<th style="padding: 8px; text-align: center; border: 1px solid #ddd;">Errors</th></tr>';

            body += '<tr><td style="padding: 8px; border: 1px solid #ddd;">Equipment</td>' +
                '<td style="padding: 8px; text-align: center; border: 1px solid #ddd; color: #28a745;">' + results.equipment.success + '</td>' +
                '<td style="padding: 8px; text-align: center; border: 1px solid #ddd; color: ' + (results.equipment.error > 0 ? '#dc3545' : '#666') + ';">' + results.equipment.error + '</td></tr>';

            body += '<tr><td style="padding: 8px; border: 1px solid #ddd;">Cases</td>' +
                '<td style="padding: 8px; text-align: center; border: 1px solid #ddd; color: #28a745;">' + results.case.success + '</td>' +
                '<td style="padding: 8px; text-align: center; border: 1px solid #ddd; color: ' + (results.case.error > 0 ? '#dc3545' : '#666') + ';">' + results.case.error + '</td></tr>';

            body += '<tr><td style="padding: 8px; border: 1px solid #ddd;">Projects</td>' +
                '<td style="padding: 8px; text-align: center; border: 1px solid #ddd; color: #28a745;">' + results.project.success + '</td>' +
                '<td style="padding: 8px; text-align: center; border: 1px solid #ddd; color: ' + (results.project.error > 0 ? '#dc3545' : '#666') + ';">' + results.project.error + '</td></tr>';

            body += '<tr><td style="padding: 8px; border: 1px solid #ddd;">Tasks</td>' +
                '<td style="padding: 8px; text-align: center; border: 1px solid #ddd; color: #28a745;">' + results.task.success + '</td>' +
                '<td style="padding: 8px; text-align: center; border: 1px solid #ddd; color: ' + (results.task.error > 0 ? '#dc3545' : '#666') + ';">' + results.task.error + '</td></tr>';

            body += '<tr style="background: #f5f5f5; font-weight: bold;"><td style="padding: 8px; border: 1px solid #ddd;">Total</td>' +
                '<td style="padding: 8px; text-align: center; border: 1px solid #ddd; color: #28a745;">' + totalSuccess + '</td>' +
                '<td style="padding: 8px; text-align: center; border: 1px solid #ddd; color: ' + (totalErrors > 0 ? '#dc3545' : '#666') + ';">' + totalErrors + '</td></tr>';

            body += '</table>';

            // Error details
            if (totalErrors > 0) {
                body += '<h3 style="color: #dc3545;">Error Details</h3>';

                if (results.equipment.errors.length > 0) {
                    body += '<h4>Equipment Errors</h4><ul>';
                    results.equipment.errors.forEach(function(err) {
                        body += '<li>' + escapeHtml(err) + '</li>';
                    });
                    body += '</ul>';
                }

                if (results.case.errors.length > 0) {
                    body += '<h4>Case Errors</h4><ul>';
                    results.case.errors.forEach(function(err) {
                        body += '<li>' + escapeHtml(err) + '</li>';
                    });
                    body += '</ul>';
                }

                if (results.project.errors.length > 0) {
                    body += '<h4>Project Errors</h4><ul>';
                    results.project.errors.forEach(function(err) {
                        body += '<li>' + escapeHtml(err) + '</li>';
                    });
                    body += '</ul>';
                }

                if (results.task.errors.length > 0) {
                    body += '<h4>Task Errors</h4><ul>';
                    results.task.errors.forEach(function(err) {
                        body += '<li>' + escapeHtml(err) + '</li>';
                    });
                    body += '</ul>';
                }
            }

            body += '<p style="margin-top: 30px; color: #666; font-size: 12px;">' +
                'This email was sent automatically by the Address Change Asset Update tool.</p>';

            body += '</body></html>';

            return body;
        }

        /**
         * Get customer/record name
         */
        function getRecordName(recordType, recordId) {
            try {
                var sql = "SELECT companyname FROM customer WHERE id = " + recordId;
                if (recordType !== 'customer') {
                    sql = "SELECT name FROM " + recordType + " WHERE id = " + recordId;
                }
                var results = query.runSuiteQL({ query: sql }).asMappedResults();
                return results.length > 0 ? (results[0].companyname || results[0].name || 'Unknown') : 'Unknown';
            } catch (e) {
                return 'Unknown';
            }
        }

        /**
         * Get site name
         */
        function getSiteName(siteId) {
            try {
                var sql = "SELECT name FROM customrecord_nx_asset WHERE id = " + siteId;
                var results = query.runSuiteQL({ query: sql }).asMappedResults();
                return results.length > 0 ? results[0].name : 'Unknown';
            } catch (e) {
                return 'Unknown';
            }
        }

        /**
         * Get site address details for task update
         */
        function getSiteAddressDetails(siteId) {
            try {
                var sql = "SELECT custrecord_nx_asset_address_text AS address_text, " +
                    "custrecord_nx_asset_latitude AS latitude, " +
                    "custrecord_nx_asset_longitude AS longitude " +
                    "FROM customrecord_nx_asset WHERE id = " + siteId;
                var results = query.runSuiteQL({ query: sql }).asMappedResults();
                if (results.length > 0) {
                    return {
                        address: results[0].address_text || '',
                        latitude: results[0].latitude || '',
                        longitude: results[0].longitude || ''
                    };
                }
            } catch (e) {
                log.error('getSiteAddressDetails Error', e.toString());
            }
            return { address: '', latitude: '', longitude: '' };
        }

        /**
         * Escape HTML
         */
        function escapeHtml(str) {
            if (!str) return '';
            return String(str)
                .replace(/&/g, '&amp;')
                .replace(/</g, '&lt;')
                .replace(/>/g, '&gt;')
                .replace(/"/g, '&quot;');
        }

        return {
            getInputData: getInputData,
            map: map,
            reduce: reduce,
            summarize: summarize
        };
    });
