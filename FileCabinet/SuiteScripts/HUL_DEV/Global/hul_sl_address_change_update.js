/**
 * @NApiVersion 2.1
 * @NScriptType Suitelet
 * @NModuleScope SameAccount
 *
 * HUL - Address Change Asset Update
 *
 * Purpose: Multi-step wizard to update Field Service Assets, Cases, and Projects
 * when a customer changes addresses.
 *
 * Features:
 * - Customer search and selection
 * - Site-to-site selection (old site to new site)
 * - Equipment, Case, and Project selection with bulk selection options
 * - Preview and confirmation before execution
 * - Real-time processing for small batches (<20 records)
 * - MapReduce integration for large batches
 *
 * Critical Constraint: Equipment parent fields MUST be updated BEFORE cases/projects
 * can be updated (FSM module requirement).
 */

define(['N/query', 'N/ui/serverWidget', 'N/record', 'N/runtime', 'N/url', 'N/redirect', 'N/task', 'N/log'],
    function(query, serverWidget, record, runtime, url, redirect, task, log) {

        /**
         * Configuration object
         */
        var CONFIG = {
            // Processing threshold - real-time vs MapReduce
            REALTIME_THRESHOLD: 20,

            // Asset types
            ASSET_TYPE: {
                SITE: '1',
                EQUIPMENT: '2'
            },

            // Wizard steps
            STEPS: {
                CUSTOMER_SELECT: 1,
                SITE_SELECT: 2,
                RECORD_SELECT: 3,
                PREVIEW: 4,
                PROCESSING: 5
            },

            // Colors
            COLORS: {
                PRIMARY: '#667eea',
                PRIMARY_DARK: '#5a6fd6',
                SUCCESS: '#28a745',
                WARNING: '#ffc107',
                DANGER: '#dc3545',
                INFO: '#17a2b8',
                GRAY: '#6c757d',
                LIGHT: '#f8f9fa'
            }
        };

        /**
         * Main request handler
         */
        function onRequest(context) {
            if (context.request.method === 'GET') {
                handleGet(context);
            } else {
                handlePost(context);
            }
        }

        /**
         * Handles GET requests - renders the appropriate wizard step
         */
        function handleGet(context) {
            try {
                var params = context.request.parameters;
                var step = parseInt(params.custpage_step) || CONFIG.STEPS.CUSTOMER_SELECT;

                switch (step) {
                    case CONFIG.STEPS.CUSTOMER_SELECT:
                        renderCustomerSelectStep(context);
                        break;
                    case CONFIG.STEPS.SITE_SELECT:
                        renderSiteSelectStep(context);
                        break;
                    case CONFIG.STEPS.RECORD_SELECT:
                        renderRecordSelectStep(context);
                        break;
                    case CONFIG.STEPS.PREVIEW:
                        renderPreviewStep(context);
                        break;
                    case CONFIG.STEPS.PROCESSING:
                        renderProcessingStep(context);
                        break;
                    default:
                        renderCustomerSelectStep(context);
                }
            } catch (e) {
                log.error({
                    title: 'Error in handleGet',
                    details: e.toString() + '\n' + (e.stack || '')
                });
                context.response.write('An error occurred: ' + e.toString());
            }
        }

        /**
         * Handles POST requests - processes form submissions and redirects
         */
        function handlePost(context) {
            try {
                var params = context.request.parameters;
                var currentStep = parseInt(params.custpage_step) || 1;

                // Step 1: Customer search - redirect back to Step 1 with search parameter
                if (currentStep === CONFIG.STEPS.CUSTOMER_SELECT) {
                    var searchText = params.custpage_customer_search || '';
                    redirect.redirect({
                        url: url.resolveScript({
                            scriptId: runtime.getCurrentScript().id,
                            deploymentId: runtime.getCurrentScript().deploymentId,
                            params: {
                                custpage_step: 1,
                                custpage_customer_search: searchText
                            }
                        })
                    });
                    return;
                }

                // For step 3 (record selection), collect sublist selections
                var selectedEquipment = params.custpage_selected_equipment || '';
                var selectedCases = params.custpage_selected_cases || '';
                var selectedProjects = params.custpage_selected_projects || '';
                var selectedTasks = params.custpage_selected_tasks || '';

                if (currentStep === CONFIG.STEPS.RECORD_SELECT) {
                    selectedEquipment = collectSublistSelections(context, 'custpage_equipment_list', 'custpage_eq_select', 'custpage_eq_id');
                    selectedCases = collectSublistSelections(context, 'custpage_case_list', 'custpage_case_select', 'custpage_case_id');
                    selectedProjects = collectSublistSelections(context, 'custpage_project_list', 'custpage_proj_select', 'custpage_proj_id');
                    selectedTasks = collectSublistSelections(context, 'custpage_task_list', 'custpage_task_select', 'custpage_task_id');
                }

                // For step 4 (preview), check if user wants to execute
                if (currentStep === CONFIG.STEPS.PREVIEW && params.custpage_execute === 'T') {
                    // Execute the updates
                    executeUpdates(context, params);
                    return;
                }

                // Build redirect URL to next step
                var nextStep = currentStep + 1;
                var redirectParams = {
                    custpage_step: nextStep,
                    custpage_customer_id: params.custpage_customer_id,
                    custpage_customer_name: params.custpage_customer_name,
                    custpage_old_site_id: params.custpage_old_site_id,
                    custpage_new_site_id: params.custpage_new_site_id,
                    custpage_selected_equipment: selectedEquipment,
                    custpage_selected_cases: selectedCases,
                    custpage_selected_projects: selectedProjects,
                    custpage_selected_tasks: selectedTasks,
                    custpage_process_mode: params.custpage_process_mode || 'realtime'
                };

                redirect.redirect({
                    url: url.resolveScript({
                        scriptId: runtime.getCurrentScript().id,
                        deploymentId: runtime.getCurrentScript().deploymentId,
                        params: redirectParams
                    })
                });

            } catch (e) {
                log.error({
                    title: 'Error in handlePost',
                    details: e.toString() + '\n' + (e.stack || '')
                });
                context.response.write('An error occurred: ' + e.toString());
            }
        }

        /**
         * Collect selected items from a sublist
         */
        function collectSublistSelections(context, sublistId, checkboxFieldId, idFieldId) {
            var selectedIds = [];
            var lineCount = context.request.getLineCount({ group: sublistId });

            for (var i = 0; i < lineCount; i++) {
                var isSelected = context.request.getSublistValue({
                    group: sublistId,
                    name: checkboxFieldId,
                    line: i
                });

                if (isSelected === 'T') {
                    var id = context.request.getSublistValue({
                        group: sublistId,
                        name: idFieldId,
                        line: i
                    });
                    if (id) {
                        selectedIds.push(id);
                    }
                }
            }

            return selectedIds.join(',');
        }

        // ===============================
        // STEP 1: Customer Selection
        // ===============================

        function renderCustomerSelectStep(context) {
            var form = serverWidget.createForm({
                title: 'Address Change Asset Update'
            });

            var params = context.request.parameters;

            // Add CSS and wizard header FIRST (no field group)
            addHeaderHtml(form, 1);

            // Customer search field (no container - renders below header)
            var searchField = form.addField({
                id: 'custpage_customer_search',
                type: serverWidget.FieldType.TEXT,
                label: 'Search Customer (Name or ID)'
            });
            searchField.updateLayoutType({ layoutType: serverWidget.FieldLayoutType.OUTSIDEBELOW });
            searchField.updateBreakType({ breakType: serverWidget.FieldBreakType.STARTROW });
            if (params.custpage_customer_search) {
                searchField.defaultValue = params.custpage_customer_search;
            }

            // Add search button
            form.addSubmitButton({
                label: 'Search'
            });

            // Hidden field for step
            var stepField = form.addField({
                id: 'custpage_step',
                type: serverWidget.FieldType.INTEGER,
                label: 'Step'
            });
            stepField.updateDisplayType({ displayType: serverWidget.FieldDisplayType.HIDDEN });
            stepField.defaultValue = CONFIG.STEPS.CUSTOMER_SELECT;

            // Display search results if search was performed
            if (params.custpage_customer_search) {
                var customers = searchCustomers(params.custpage_customer_search);
                addCustomerResultsHtml(form, customers);
            }

            context.response.writePage(form);
        }

        /**
         * Search for customers
         */
        function searchCustomers(searchText) {
            var results = [];

            try {
                var escapedSearch = searchText.replace(/'/g, "''").toUpperCase();

                var sql = "SELECT c.id AS customer_id, c.entityid AS customer_number, " +
                    "c.companyname AS customer_name " +
                    "FROM customer c " +
                    "WHERE c.isinactive = 'F' " +
                    "AND (UPPER(c.companyname) LIKE '%" + escapedSearch + "%' " +
                    "OR UPPER(c.entityid) LIKE '%" + escapedSearch + "%') " +
                    "ORDER BY c.companyname " +
                    "FETCH FIRST 50 ROWS ONLY";

                log.debug('searchCustomers', 'Searching for: ' + searchText);
                results = query.runSuiteQL({ query: sql }).asMappedResults();
                log.debug('searchCustomers', 'Found ' + results.length + ' customers');
                if (results.length > 0) {
                    log.debug('searchCustomers', 'First result: ' + JSON.stringify(results[0]));
                }

            } catch (e) {
                log.error('searchCustomers Error', e.toString());
            }

            return results;
        }

        /**
         * Add customer search results as HTML with clickable rows
         */
        function addCustomerResultsHtml(form, customers) {
            var resultsField = form.addField({
                id: 'custpage_customer_results',
                type: serverWidget.FieldType.INLINEHTML,
                label: 'Results'
            });
            resultsField.updateLayoutType({ layoutType: serverWidget.FieldLayoutType.OUTSIDEBELOW });
            resultsField.updateBreakType({ breakType: serverWidget.FieldBreakType.STARTROW });

            var scriptUrl = url.resolveScript({
                scriptId: runtime.getCurrentScript().id,
                deploymentId: runtime.getCurrentScript().deploymentId
            });

            var html = '<div class="results-container" style="clear: both; width: 100%; margin-top: 20px;">';
            html += '<h3>Search Results (' + customers.length + ')</h3>';

            if (customers.length === 0) {
                html += '<p style="color: #666;">No customers found matching your search.</p>';
            } else {
                html += '<table class="results-table">';
                html += '<thead><tr><th>Customer #</th><th>Customer Name</th><th>Action</th></tr></thead>';
                html += '<tbody>';

                customers.forEach(function(c) {
                    var selectUrl = scriptUrl + '&custpage_step=2&custpage_customer_id=' + c.customer_id +
                        '&custpage_customer_name=' + encodeURIComponent(c.customer_name || '');

                    html += '<tr>';
                    html += '<td>' + escapeHtml(c.customer_number || '') + '</td>';
                    html += '<td>' + escapeHtml(c.customer_name || '') + '</td>';
                    html += '<td><a href="' + selectUrl + '" class="btn-select">Select</a></td>';
                    html += '</tr>';
                });

                html += '</tbody></table>';
            }

            html += '</div>';

            resultsField.defaultValue = html;
        }

        // ===============================
        // STEP 2: Site Selection
        // ===============================

        function renderSiteSelectStep(context) {
            var params = context.request.parameters;
            var customerId = params.custpage_customer_id;
            var customerName = params.custpage_customer_name || '';

            // Validate customer ID - redirect to Step 1 if missing
            if (!customerId) {
                log.error('renderSiteSelectStep', 'Customer ID is missing, redirecting to Step 1');
                redirect.redirect({
                    url: url.resolveScript({
                        scriptId: runtime.getCurrentScript().id,
                        deploymentId: runtime.getCurrentScript().deploymentId,
                        params: { custpage_step: 1 }
                    })
                });
                return;
            }

            var form = serverWidget.createForm({
                title: 'Address Change Asset Update'
            });

            // Add CSS and wizard header FIRST (no field group)
            addHeaderHtml(form, 2);

            // Customer info display
            addCustomerInfoHtml(form, customerId, customerName);

            // Get active sites for customer
            var sites = getActiveSitesForCustomer(customerId);

            // Build site selection HTML with side-by-side dropdowns
            var siteSelectionHtml = '<div style="clear: both; width: 100%; display: flex; gap: 40px; margin: 20px 0;">';

            // Old Site dropdown
            siteSelectionHtml += '<div style="flex: 1;">';
            siteSelectionHtml += '<label style="display: block; margin-bottom: 5px; font-weight: bold; color: #333;">Current Site (Equipment\'s Current Location) <span style="color: #c00;">*</span></label>';
            siteSelectionHtml += '<select id="custpage_old_site_id_html" style="width: 100%; padding: 8px; border: 1px solid #ccc; border-radius: 4px; font-size: 14px;">';
            siteSelectionHtml += '<option value="">-- Select Old Site --</option>';
            sites.forEach(function(site) {
                var selected = (params.custpage_old_site_id == site.site_id) ? ' selected' : '';
                siteSelectionHtml += '<option value="' + site.site_id + '"' + selected + '>' + escapeHtml(site.site_id + ' - ' + site.site_name) + '</option>';
            });
            siteSelectionHtml += '</select>';
            siteSelectionHtml += '</div>';

            // New Site dropdown
            siteSelectionHtml += '<div style="flex: 1;">';
            siteSelectionHtml += '<label style="display: block; margin-bottom: 5px; font-weight: bold; color: #333;">New Site (Destination) <span style="color: #c00;">*</span></label>';
            siteSelectionHtml += '<select id="custpage_new_site_id_html" style="width: 100%; padding: 8px; border: 1px solid #ccc; border-radius: 4px; font-size: 14px;">';
            siteSelectionHtml += '<option value="">-- Select New Site --</option>';
            sites.forEach(function(site) {
                var selected = (params.custpage_new_site_id == site.site_id) ? ' selected' : '';
                siteSelectionHtml += '<option value="' + site.site_id + '"' + selected + '>' + escapeHtml(site.site_id + ' - ' + site.site_name) + '</option>';
            });
            siteSelectionHtml += '</select>';
            siteSelectionHtml += '</div>';

            siteSelectionHtml += '</div>';

            // Script to sync HTML selects with hidden form fields
            siteSelectionHtml += '<script>';
            siteSelectionHtml += 'document.getElementById("custpage_old_site_id_html").addEventListener("change", function() {';
            siteSelectionHtml += '    document.getElementById("custpage_old_site_id").value = this.value;';
            siteSelectionHtml += '});';
            siteSelectionHtml += 'document.getElementById("custpage_new_site_id_html").addEventListener("change", function() {';
            siteSelectionHtml += '    document.getElementById("custpage_new_site_id").value = this.value;';
            siteSelectionHtml += '});';
            siteSelectionHtml += '</script>';

            var siteSelectionField = form.addField({
                id: 'custpage_site_selection_html',
                type: serverWidget.FieldType.INLINEHTML,
                label: 'Site Selection'
            });
            siteSelectionField.updateLayoutType({ layoutType: serverWidget.FieldLayoutType.OUTSIDEBELOW });
            siteSelectionField.updateBreakType({ breakType: serverWidget.FieldBreakType.STARTROW });
            siteSelectionField.defaultValue = siteSelectionHtml;

            // Hidden fields to store the actual values for form submission
            var oldSiteField = form.addField({
                id: 'custpage_old_site_id',
                type: serverWidget.FieldType.TEXT,
                label: 'Old Site ID'
            });
            oldSiteField.updateDisplayType({ displayType: serverWidget.FieldDisplayType.HIDDEN });
            if (params.custpage_old_site_id) {
                oldSiteField.defaultValue = params.custpage_old_site_id;
            }

            var newSiteField = form.addField({
                id: 'custpage_new_site_id',
                type: serverWidget.FieldType.TEXT,
                label: 'New Site ID'
            });
            newSiteField.updateDisplayType({ displayType: serverWidget.FieldDisplayType.HIDDEN });
            if (params.custpage_new_site_id) {
                newSiteField.defaultValue = params.custpage_new_site_id;
            }

            // Hidden fields
            addHiddenField(form, 'custpage_step', CONFIG.STEPS.SITE_SELECT);
            addHiddenField(form, 'custpage_customer_id', customerId);
            addHiddenField(form, 'custpage_customer_name', customerName);

            // Navigation buttons
            form.addButton({
                id: 'custpage_back',
                label: 'Back',
                functionName: 'goBack'
            });
            form.addSubmitButton({
                label: 'Next: Select Records'
            });

            // Add client script for back button
            addNavigationScript(form, 1);

            context.response.writePage(form);
        }

        /**
         * Get active sites for a customer via address book join
         */
        function getActiveSitesForCustomer(customerId) {
            var results = [];

            // Validate customer ID
            if (!customerId) {
                log.error('getActiveSitesForCustomer', 'Customer ID is empty or null');
                return results;
            }

            try {
                // Query site assets directly by customer field on the FSA record
                // The FSA has custrecord_nx_asset_customer to link to customer
                var sql = "SELECT DISTINCT a.id AS site_id, a.name AS site_name " +
                    "FROM customrecord_nx_asset a " +
                    "WHERE a.custrecord_nxc_na_asset_type = '" + CONFIG.ASSET_TYPE.SITE + "' " +
                    "AND a.isinactive = 'F' " +
                    "AND a.custrecord_nx_asset_customer = " + customerId + " " +
                    "ORDER BY a.name";

                log.debug('getActiveSitesForCustomer', 'SQL: ' + sql);
                results = query.runSuiteQL({ query: sql }).asMappedResults();
                log.debug('getActiveSitesForCustomer', 'Found ' + results.length + ' sites');

            } catch (e) {
                log.error('getActiveSitesForCustomer Error', e.toString());
            }

            return results;
        }

        // ===============================
        // STEP 3: Record Selection
        // ===============================

        function renderRecordSelectStep(context) {
            var form = serverWidget.createForm({
                title: 'Address Change Asset Update'
            });

            var params = context.request.parameters;
            var customerId = params.custpage_customer_id;
            var customerName = params.custpage_customer_name || '';
            var oldSiteId = params.custpage_old_site_id;
            var newSiteId = params.custpage_new_site_id;

            // Add CSS and wizard header
            addHeaderHtml(form, 3);

            // Customer and site info
            addSiteInfoHtml(form, customerId, customerName, oldSiteId, newSiteId);

            // Get records for selection
            var equipment = getEquipmentBySite(oldSiteId);
            var cases = getOpenCasesBySite(customerId, oldSiteId);
            var projects = getOpenProjectsBySite(customerId, oldSiteId);
            var tasks = getOpenTasksBySite(oldSiteId);

            // Equipment Sublist
            var equipSublist = form.addSublist({
                id: 'custpage_equipment_list',
                type: serverWidget.SublistType.LIST,
                label: 'Equipment Assets (' + equipment.length + ')'
            });

            equipSublist.addField({ id: 'custpage_eq_select', type: serverWidget.FieldType.CHECKBOX, label: 'Select' });
            equipSublist.addField({ id: 'custpage_eq_id', type: serverWidget.FieldType.TEXT, label: 'ID' }).updateDisplayType({ displayType: serverWidget.FieldDisplayType.HIDDEN });
            equipSublist.addField({ id: 'custpage_eq_name', type: serverWidget.FieldType.TEXT, label: 'Name' });
            equipSublist.addField({ id: 'custpage_eq_fleet', type: serverWidget.FieldType.TEXT, label: 'Fleet Code' });
            equipSublist.addField({ id: 'custpage_eq_serial', type: serverWidget.FieldType.TEXT, label: 'Serial #' });
            equipSublist.addField({ id: 'custpage_eq_site', type: serverWidget.FieldType.TEXT, label: 'Current Site' });

            equipment.forEach(function(eq, i) {
                equipSublist.setSublistValue({ id: 'custpage_eq_select', line: i, value: 'T' });
                equipSublist.setSublistValue({ id: 'custpage_eq_id', line: i, value: String(eq.id || '') });
                equipSublist.setSublistValue({ id: 'custpage_eq_name', line: i, value: eq.name || ' ' });
                equipSublist.setSublistValue({ id: 'custpage_eq_fleet', line: i, value: eq.fleet_code || ' ' });
                equipSublist.setSublistValue({ id: 'custpage_eq_serial', line: i, value: eq.serial_number || ' ' });
                equipSublist.setSublistValue({ id: 'custpage_eq_site', line: i, value: eq.current_site_name || ' ' });
            });

            equipSublist.addButton({
                id: 'custpage_select_all_eq',
                label: 'Select All',
                functionName: 'selectAllEquipment'
            });
            equipSublist.addButton({
                id: 'custpage_deselect_all_eq',
                label: 'Deselect All',
                functionName: 'deselectAllEquipment'
            });

            // Cases Sublist
            var caseSublist = form.addSublist({
                id: 'custpage_case_list',
                type: serverWidget.SublistType.LIST,
                label: 'Open Cases (' + cases.length + ')'
            });

            caseSublist.addField({ id: 'custpage_case_select', type: serverWidget.FieldType.CHECKBOX, label: 'Select' });
            caseSublist.addField({ id: 'custpage_case_id', type: serverWidget.FieldType.TEXT, label: 'ID' }).updateDisplayType({ displayType: serverWidget.FieldDisplayType.HIDDEN });
            caseSublist.addField({ id: 'custpage_case_number', type: serverWidget.FieldType.TEXT, label: 'Case #' });
            caseSublist.addField({ id: 'custpage_case_title', type: serverWidget.FieldType.TEXT, label: 'Subject' });
            caseSublist.addField({ id: 'custpage_case_status', type: serverWidget.FieldType.TEXT, label: 'Status' });
            caseSublist.addField({ id: 'custpage_case_site', type: serverWidget.FieldType.TEXT, label: 'Current Site' });
            caseSublist.addField({ id: 'custpage_case_equipment', type: serverWidget.FieldType.TEXT, label: 'Equipment Asset' });

            cases.forEach(function(c, i) {
                caseSublist.setSublistValue({ id: 'custpage_case_select', line: i, value: 'T' });
                caseSublist.setSublistValue({ id: 'custpage_case_id', line: i, value: String(c.case_id || '') });
                caseSublist.setSublistValue({ id: 'custpage_case_number', line: i, value: c.case_number || ' ' });
                caseSublist.setSublistValue({ id: 'custpage_case_title', line: i, value: c.case_title || ' ' });
                caseSublist.setSublistValue({ id: 'custpage_case_status', line: i, value: c.status_name || ' ' });
                caseSublist.setSublistValue({ id: 'custpage_case_site', line: i, value: c.current_site_name || ' ' });
                caseSublist.setSublistValue({ id: 'custpage_case_equipment', line: i, value: c.equipment_assets || ' ' });
            });

            caseSublist.addButton({
                id: 'custpage_select_all_case',
                label: 'Select All',
                functionName: 'selectAllCases'
            });
            caseSublist.addButton({
                id: 'custpage_deselect_all_case',
                label: 'Deselect All',
                functionName: 'deselectAllCases'
            });

            // Projects Sublist
            var projSublist = form.addSublist({
                id: 'custpage_project_list',
                type: serverWidget.SublistType.LIST,
                label: 'Open Projects (' + projects.length + ')'
            });

            projSublist.addField({ id: 'custpage_proj_select', type: serverWidget.FieldType.CHECKBOX, label: 'Select' });
            projSublist.addField({ id: 'custpage_proj_id', type: serverWidget.FieldType.TEXT, label: 'ID' }).updateDisplayType({ displayType: serverWidget.FieldDisplayType.HIDDEN });
            projSublist.addField({ id: 'custpage_proj_number', type: serverWidget.FieldType.TEXT, label: 'Project #' });
            projSublist.addField({ id: 'custpage_proj_name', type: serverWidget.FieldType.TEXT, label: 'Name' });
            projSublist.addField({ id: 'custpage_proj_status', type: serverWidget.FieldType.TEXT, label: 'Status' });
            projSublist.addField({ id: 'custpage_proj_site', type: serverWidget.FieldType.TEXT, label: 'Current Site' });
            projSublist.addField({ id: 'custpage_proj_equipment', type: serverWidget.FieldType.TEXT, label: 'Equipment Asset' });

            projects.forEach(function(p, i) {
                projSublist.setSublistValue({ id: 'custpage_proj_select', line: i, value: 'T' });
                projSublist.setSublistValue({ id: 'custpage_proj_id', line: i, value: String(p.project_id || '') });
                projSublist.setSublistValue({ id: 'custpage_proj_number', line: i, value: p.project_number || ' ' });
                projSublist.setSublistValue({ id: 'custpage_proj_name', line: i, value: p.project_name || ' ' });
                projSublist.setSublistValue({ id: 'custpage_proj_status', line: i, value: p.status_name || ' ' });
                projSublist.setSublistValue({ id: 'custpage_proj_site', line: i, value: p.current_site_name || ' ' });
                projSublist.setSublistValue({ id: 'custpage_proj_equipment', line: i, value: p.equipment_assets || ' ' });
            });

            projSublist.addButton({
                id: 'custpage_select_all_proj',
                label: 'Select All',
                functionName: 'selectAllProjects'
            });
            projSublist.addButton({
                id: 'custpage_deselect_all_proj',
                label: 'Deselect All',
                functionName: 'deselectAllProjects'
            });

            // Tasks Sublist
            var taskSublist = form.addSublist({
                id: 'custpage_task_list',
                type: serverWidget.SublistType.LIST,
                label: 'Open Tasks (' + tasks.length + ')'
            });

            taskSublist.addField({ id: 'custpage_task_select', type: serverWidget.FieldType.CHECKBOX, label: 'Select' });
            taskSublist.addField({ id: 'custpage_task_id', type: serverWidget.FieldType.TEXT, label: 'ID' }).updateDisplayType({ displayType: serverWidget.FieldDisplayType.HIDDEN });
            taskSublist.addField({ id: 'custpage_task_title', type: serverWidget.FieldType.TEXT, label: 'Title' });
            taskSublist.addField({ id: 'custpage_task_status', type: serverWidget.FieldType.TEXT, label: 'Status' });
            taskSublist.addField({ id: 'custpage_task_case', type: serverWidget.FieldType.TEXT, label: 'Related Case' });
            taskSublist.addField({ id: 'custpage_task_site', type: serverWidget.FieldType.TEXT, label: 'Current Site' });

            tasks.forEach(function(t, i) {
                taskSublist.setSublistValue({ id: 'custpage_task_select', line: i, value: 'T' });
                taskSublist.setSublistValue({ id: 'custpage_task_id', line: i, value: String(t.task_id || '') });
                taskSublist.setSublistValue({ id: 'custpage_task_title', line: i, value: t.task_title || ' ' });
                taskSublist.setSublistValue({ id: 'custpage_task_status', line: i, value: t.status_name || ' ' });
                taskSublist.setSublistValue({ id: 'custpage_task_case', line: i, value: t.case_name || ' ' });
                taskSublist.setSublistValue({ id: 'custpage_task_site', line: i, value: t.current_site_name || ' ' });
            });

            taskSublist.addButton({
                id: 'custpage_select_all_task',
                label: 'Select All',
                functionName: 'selectAllTasks'
            });
            taskSublist.addButton({
                id: 'custpage_deselect_all_task',
                label: 'Deselect All',
                functionName: 'deselectAllTasks'
            });

            // Hidden fields
            addHiddenField(form, 'custpage_step', CONFIG.STEPS.RECORD_SELECT);
            addHiddenField(form, 'custpage_customer_id', customerId);
            addHiddenField(form, 'custpage_customer_name', customerName);
            addHiddenField(form, 'custpage_old_site_id', oldSiteId);
            addHiddenField(form, 'custpage_new_site_id', newSiteId);

            // Navigation buttons
            form.addButton({
                id: 'custpage_back',
                label: 'Back',
                functionName: 'goBack'
            });
            form.addSubmitButton({
                label: 'Preview Changes'
            });

            // Add client scripts for selection
            addSelectionScript(form, 2);

            context.response.writePage(form);
        }

        /**
         * Get equipment assets by site
         */
        function getEquipmentBySite(siteId) {
            var results = [];

            try {
                var sql = "SELECT a.id, a.name, " +
                    "a.custrecord_sna_hul_fleetcode AS fleet_code, " +
                    "a.custrecord_nx_asset_serial AS serial_number, " +
                    "BUILTIN.DF(a.parent) AS current_site_name " +
                    "FROM customrecord_nx_asset a " +
                    "WHERE a.custrecord_nxc_na_asset_type = '" + CONFIG.ASSET_TYPE.EQUIPMENT + "' " +
                    "AND a.isinactive = 'F' " +
                    "AND a.parent = " + siteId + " " +
                    "ORDER BY a.name";

                results = query.runSuiteQL({ query: sql }).asMappedResults();

            } catch (e) {
                log.error('getEquipmentBySite Error', e.toString());
            }

            return results;
        }

        /**
         * Get open cases by site
         */
        function getOpenCasesBySite(customerId, siteId) {
            var results = [];

            try {
                var sql = "SELECT sc.id AS case_id, sc.casenumber AS case_number, " +
                    "sc.title AS case_title, " +
                    "BUILTIN.DF(sc.status) AS status_name, " +
                    "BUILTIN.DF(sc.custevent_nx_case_asset) AS current_site_name, " +
                    "BUILTIN.DF(sc.custevent_nxc_case_assets) AS equipment_assets " +
                    "FROM supportcase sc " +
                    "WHERE sc.custevent_nx_customer = " + customerId + " " +
                    "AND sc.custevent_nx_case_asset = " + siteId + " " +
                    "AND sc.status NOT IN ('5') " +  // 5 = Closed
                    "ORDER BY sc.casenumber DESC";

                results = query.runSuiteQL({ query: sql }).asMappedResults();

            } catch (e) {
                log.error('getOpenCasesBySite Error', e.toString());
            }

            return results;
        }

        /**
         * Get open projects by site
         */
        function getOpenProjectsBySite(customerId, siteId) {
            var results = [];

            try {
                var sql = "SELECT j.id AS project_id, j.entityid AS project_number, " +
                    "j.companyname AS project_name, " +
                    "BUILTIN.DF(j.entitystatus) AS status_name, " +
                    "BUILTIN.DF(j.custentity_nx_asset) AS current_site_name, " +
                    "BUILTIN.DF(j.custentity_nxc_project_assets) AS equipment_assets " +
                    "FROM job j " +
                    "WHERE j.parent = " + customerId + " " +
                    "AND j.custentity_nx_asset = " + siteId + " " +
                    "AND j.isinactive = 'F' " +
                    "AND UPPER(BUILTIN.DF(j.entitystatus)) NOT LIKE '%CLOSED%' " +
                    "ORDER BY j.entityid DESC";

                results = query.runSuiteQL({ query: sql }).asMappedResults();

            } catch (e) {
                log.error('getOpenProjectsBySite Error', e.toString());
            }

            return results;
        }

        /**
         * Get open tasks by site (tasks linked to cases at the site)
         */
        function getOpenTasksBySite(siteId) {
            var results = [];

            try {
                var sql = "SELECT t.id AS task_id, t.title AS task_title, " +
                    "t.status AS status_name, " +
                    "BUILTIN.DF(t.custevent_nx_task_asset) AS current_site_name, " +
                    "t.supportcase AS case_id, " +
                    "BUILTIN.DF(t.supportcase) AS case_name " +
                    "FROM task t " +
                    "WHERE t.custevent_nx_task_asset = " + siteId + " " +
                    "AND t.status != 'COMPLETE' " +
                    "ORDER BY t.title";

                results = query.runSuiteQL({ query: sql }).asMappedResults();

            } catch (e) {
                log.error('getOpenTasksBySite Error', e.toString());
            }

            return results;
        }

        // ===============================
        // STEP 4: Preview & Confirmation
        // ===============================

        function renderPreviewStep(context) {
            var form = serverWidget.createForm({
                title: 'Address Change Asset Update'
            });

            var params = context.request.parameters;
            var customerId = params.custpage_customer_id;
            var customerName = params.custpage_customer_name || '';
            var oldSiteId = params.custpage_old_site_id;
            var newSiteId = params.custpage_new_site_id;

            var equipmentIds = (params.custpage_selected_equipment || '').split(',').filter(Boolean);
            var caseIds = (params.custpage_selected_cases || '').split(',').filter(Boolean);
            var projectIds = (params.custpage_selected_projects || '').split(',').filter(Boolean);
            var taskIds = (params.custpage_selected_tasks || '').split(',').filter(Boolean);

            var totalRecords = equipmentIds.length + caseIds.length + projectIds.length + taskIds.length;

            // Add CSS and wizard header
            addHeaderHtml(form, 4);

            // Build preview HTML
            var previewHtml = buildPreviewHtml(
                customerId, customerName, oldSiteId, newSiteId,
                equipmentIds, caseIds, projectIds, taskIds
            );

            var previewField = form.addField({
                id: 'custpage_preview_html',
                type: serverWidget.FieldType.INLINEHTML,
                label: 'Preview'
            });
            previewField.defaultValue = previewHtml;

            // Processing mode selection (if large batch)
            if (totalRecords > CONFIG.REALTIME_THRESHOLD) {
                var processModeField = form.addField({
                    id: 'custpage_process_mode',
                    type: serverWidget.FieldType.SELECT,
                    label: 'Processing Mode'
                });
                processModeField.addSelectOption({
                    value: 'mapreduce',
                    text: 'Background Processing (Recommended - ' + totalRecords + ' records)'
                });
                processModeField.addSelectOption({
                    value: 'realtime',
                    text: 'Real-time Processing (May timeout)'
                });
                processModeField.defaultValue = 'mapreduce';
            } else {
                addHiddenField(form, 'custpage_process_mode', 'realtime');
            }

            // Hidden fields
            addHiddenField(form, 'custpage_step', CONFIG.STEPS.PREVIEW);
            addHiddenField(form, 'custpage_customer_id', customerId);
            addHiddenField(form, 'custpage_customer_name', customerName);
            addHiddenField(form, 'custpage_old_site_id', oldSiteId);
            addHiddenField(form, 'custpage_new_site_id', newSiteId);
            addHiddenField(form, 'custpage_selected_equipment', params.custpage_selected_equipment || '');
            addHiddenField(form, 'custpage_selected_cases', params.custpage_selected_cases || '');
            addHiddenField(form, 'custpage_selected_projects', params.custpage_selected_projects || '');
            addHiddenField(form, 'custpage_selected_tasks', params.custpage_selected_tasks || '');
            addHiddenField(form, 'custpage_execute', 'T');

            // Navigation buttons
            form.addButton({
                id: 'custpage_back',
                label: 'Back',
                functionName: 'goBack'
            });
            form.addSubmitButton({
                label: 'Execute Changes'
            });

            // Add client script for back button
            addNavigationScript(form, 3);

            context.response.writePage(form);
        }

        /**
         * Build preview HTML
         */
        function buildPreviewHtml(customerId, customerName, oldSiteId, newSiteId, equipmentIds, caseIds, projectIds, taskIds) {
            // Get site names
            var oldSiteName = getSiteName(oldSiteId);
            var newSiteName = getSiteName(newSiteId);

            var html = '<div class="preview-container">';

            // Summary header
            html += '<div class="preview-header">';
            html += '<h3>Change Summary</h3>';
            html += '<div class="summary-row"><strong>Customer:</strong> ' + escapeHtml(customerName) + '</div>';
            html += '<div class="summary-row"><strong>Old Site:</strong> ' + escapeHtml(oldSiteName) + '</div>';
            html += '<div class="summary-row"><strong>New Site:</strong> ' + escapeHtml(newSiteName) + '</div>';
            html += '</div>';

            // Statistics
            html += '<div class="stats-container">';
            html += '<div class="stats-box"><div class="stats-number">' + equipmentIds.length + '</div><div class="stats-label">Equipment</div></div>';
            html += '<div class="stats-box"><div class="stats-number">' + caseIds.length + '</div><div class="stats-label">Cases</div></div>';
            html += '<div class="stats-box"><div class="stats-number">' + projectIds.length + '</div><div class="stats-label">Projects</div></div>';
            html += '<div class="stats-box"><div class="stats-number">' + taskIds.length + '</div><div class="stats-label">Tasks</div></div>';
            html += '<div class="stats-box total"><div class="stats-number">' + (equipmentIds.length + caseIds.length + projectIds.length + taskIds.length) + '</div><div class="stats-label">Total</div></div>';
            html += '</div>';

            // Warning box
            html += '<div class="warning-box">';
            html += '<strong>Important:</strong> Equipment parent fields will be updated FIRST, ' +
                'followed by projects, cases, then tasks. This ensures FSM data integrity. ' +
                'If any equipment update fails, processing will stop.';
            html += '</div>';

            // Details sections
            if (equipmentIds.length > 0) {
                html += '<div class="preview-section">';
                html += '<h4>Equipment to Update (' + equipmentIds.length + ')</h4>';
                html += '<p>Parent field will be changed to "' + escapeHtml(newSiteName) + '"</p>';
                html += '</div>';
            }

            // Projects preview with rebuilt names from TYPE + NUMBER + NEW_SITE
            if (projectIds.length > 0) {
                var projectDetails = getProjectNamesForPreview(projectIds, newSiteName);
                html += '<div class="preview-section">';
                html += '<h4>Projects to Update (' + projectIds.length + ')</h4>';
                html += '<p>Site Asset and Name will be updated. Equipment assets will be preserved.</p>';
                html += '<table class="preview-table" style="width:100%; border-collapse:collapse; margin-top:10px; font-size:12px;">';
                html += '<tr style="background:#f5f5f5;"><th style="padding:6px; text-align:left; border:1px solid #ddd;">ID</th>';
                html += '<th style="padding:6px; text-align:left; border:1px solid #ddd;">Current Name</th>';
                html += '<th style="padding:6px; text-align:left; border:1px solid #ddd;">New Name</th>';
                html += '<th style="padding:6px; text-align:center; border:1px solid #ddd;">Will Change?</th></tr>';
                projectDetails.forEach(function(p) {
                    var willChange = p.currentName !== p.newName;
                    var rowStyle = willChange ? '' : 'background:#fff3cd;';
                    html += '<tr style="' + rowStyle + '">';
                    html += '<td style="padding:6px; border:1px solid #ddd;">' + p.id + '</td>';
                    html += '<td style="padding:6px; border:1px solid #ddd;">' + escapeHtml(p.currentName) + '</td>';
                    html += '<td style="padding:6px; border:1px solid #ddd;">' + escapeHtml(p.newName) + '</td>';
                    html += '<td style="padding:6px; border:1px solid #ddd; text-align:center;">' + (willChange ? 'Yes' : '<span style="color:#856404;">No Match</span>') + '</td>';
                    html += '</tr>';
                });
                html += '</table>';
                html += '</div>';
            }

            // Cases preview with current names
            if (caseIds.length > 0) {
                var caseDetails = getRecordNamesForPreview('supportcase', 'title', caseIds, oldSiteName, newSiteName);
                html += '<div class="preview-section">';
                html += '<h4>Cases to Update (' + caseIds.length + ')</h4>';
                html += '<p>Site Asset and Subject will be updated. Equipment assets will be preserved.</p>';
                html += '<table class="preview-table" style="width:100%; border-collapse:collapse; margin-top:10px; font-size:12px;">';
                html += '<tr style="background:#f5f5f5;"><th style="padding:6px; text-align:left; border:1px solid #ddd;">ID</th>';
                html += '<th style="padding:6px; text-align:left; border:1px solid #ddd;">Current Subject</th>';
                html += '<th style="padding:6px; text-align:left; border:1px solid #ddd;">New Subject</th>';
                html += '<th style="padding:6px; text-align:center; border:1px solid #ddd;">Will Change?</th></tr>';
                caseDetails.forEach(function(c) {
                    var willChange = c.currentName !== c.newName;
                    var rowStyle = willChange ? '' : 'background:#fff3cd;';
                    html += '<tr style="' + rowStyle + '">';
                    html += '<td style="padding:6px; border:1px solid #ddd;">' + c.id + '</td>';
                    html += '<td style="padding:6px; border:1px solid #ddd;">' + escapeHtml(c.currentName) + '</td>';
                    html += '<td style="padding:6px; border:1px solid #ddd;">' + escapeHtml(c.newName) + '</td>';
                    html += '<td style="padding:6px; border:1px solid #ddd; text-align:center;">' + (willChange ? 'Yes' : '<span style="color:#856404;">No Match</span>') + '</td>';
                    html += '</tr>';
                });
                html += '</table>';
                html += '</div>';
            }

            // Tasks preview with current names
            if (taskIds.length > 0) {
                var taskDetails = getRecordNamesForPreview('task', 'title', taskIds, oldSiteName, newSiteName);
                html += '<div class="preview-section">';
                html += '<h4>Tasks to Update (' + taskIds.length + ')</h4>';
                html += '<p>Task Asset, Title, and Address fields will be updated.</p>';
                html += '<table class="preview-table" style="width:100%; border-collapse:collapse; margin-top:10px; font-size:12px;">';
                html += '<tr style="background:#f5f5f5;"><th style="padding:6px; text-align:left; border:1px solid #ddd;">ID</th>';
                html += '<th style="padding:6px; text-align:left; border:1px solid #ddd;">Current Title</th>';
                html += '<th style="padding:6px; text-align:left; border:1px solid #ddd;">New Title</th>';
                html += '<th style="padding:6px; text-align:center; border:1px solid #ddd;">Will Change?</th></tr>';
                taskDetails.forEach(function(t) {
                    var willChange = t.currentName !== t.newName;
                    var rowStyle = willChange ? '' : 'background:#fff3cd;';
                    html += '<tr style="' + rowStyle + '">';
                    html += '<td style="padding:6px; border:1px solid #ddd;">' + t.id + '</td>';
                    html += '<td style="padding:6px; border:1px solid #ddd;">' + escapeHtml(t.currentName) + '</td>';
                    html += '<td style="padding:6px; border:1px solid #ddd;">' + escapeHtml(t.newName) + '</td>';
                    html += '<td style="padding:6px; border:1px solid #ddd; text-align:center;">' + (willChange ? 'Yes' : '<span style="color:#856404;">No Match</span>') + '</td>';
                    html += '</tr>';
                });
                html += '</table>';
                html += '</div>';
            }

            html += '</div>';

            return html;
        }

        /**
         * Get record names for preview display
         * Returns array of {id, currentName, newName} for each record
         */
        function getRecordNamesForPreview(recordType, nameField, recordIds, oldSiteName, newSiteName) {
            var results = [];

            if (!recordIds || recordIds.length === 0) {
                return results;
            }

            try {
                var idList = recordIds.join(',');
                var sql = "SELECT id, " + nameField + " AS name FROM " + recordType + " WHERE id IN (" + idList + ")";
                var queryResults = query.runSuiteQL({ query: sql }).asMappedResults();

                var nameMap = {};
                queryResults.forEach(function(r) {
                    nameMap[String(r.id)] = r.name || '';
                });

                recordIds.forEach(function(id) {
                    var currentName = nameMap[String(id)] || '';
                    var newName = currentName.replace(oldSiteName, newSiteName);
                    results.push({
                        id: id,
                        currentName: currentName,
                        newName: newName
                    });
                });

            } catch (e) {
                log.error('getRecordNamesForPreview Error', e.toString());
                // Return basic results on error
                recordIds.forEach(function(id) {
                    results.push({
                        id: id,
                        currentName: '(Error loading)',
                        newName: '(Error loading)'
                    });
                });
            }

            return results;
        }

        /**
         * Get project names for preview - rebuilds name from TYPE + NUMBER + NEW_SITE
         */
        function getProjectNamesForPreview(projectIds, newSiteName) {
            var results = [];

            if (!projectIds || projectIds.length === 0) {
                return results;
            }

            try {
                var idList = projectIds.join(',');
                var sql = "SELECT j.id, j.companyname AS current_name, j.entityid AS entity_id, " +
                    "BUILTIN.DF(j.custentity_nx_project_type) AS project_type " +
                    "FROM job j WHERE j.id IN (" + idList + ")";
                var queryResults = query.runSuiteQL({ query: sql }).asMappedResults();

                var dataMap = {};
                queryResults.forEach(function(r) {
                    // entityid contains formatted string, extract just the leading number
                    var entityId = r.entity_id || '';
                    var projectNumber = entityId.split(' ')[0] || '';
                    dataMap[String(r.id)] = {
                        currentName: r.current_name || '',
                        projectNumber: projectNumber,
                        projectType: r.project_type || ''
                    };
                });

                projectIds.forEach(function(id) {
                    var data = dataMap[String(id)] || { currentName: '', projectNumber: '', projectType: '' };
                    var newName = data.currentName; // Default to current if we can't rebuild

                    // Rebuild name: [TYPE] [PROJECT_NUMBER] [NEW_SITE_NAME]
                    // NetSuite companyname field has 83 character limit
                    if (data.projectType && data.projectNumber) {
                        newName = data.projectType + ' ' + data.projectNumber + ' ' + newSiteName;
                        if (newName.length > 83) {
                            newName = newName.substring(0, 83);
                        }
                    }

                    results.push({
                        id: id,
                        currentName: data.currentName,
                        newName: newName
                    });
                });

            } catch (e) {
                log.error('getProjectNamesForPreview Error', e.toString());
                // Return basic results on error
                projectIds.forEach(function(id) {
                    results.push({
                        id: id,
                        currentName: '(Error loading)',
                        newName: '(Error loading)'
                    });
                });
            }

            return results;
        }

        /**
         * Get site name by ID
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
         * Returns address text, latitude, and longitude from the site asset
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

        // ===============================
        // STEP 5: Processing & Results
        // ===============================

        function executeUpdates(context, params) {
            var processMode = params.custpage_process_mode || 'realtime';
            var oldSiteId = params.custpage_old_site_id;
            var newSiteId = params.custpage_new_site_id;

            var equipmentIds = (params.custpage_selected_equipment || '').split(',').filter(Boolean);
            var caseIds = (params.custpage_selected_cases || '').split(',').filter(Boolean);
            var projectIds = (params.custpage_selected_projects || '').split(',').filter(Boolean);
            var taskIds = (params.custpage_selected_tasks || '').split(',').filter(Boolean);

            if (processMode === 'mapreduce') {
                // Trigger MapReduce
                triggerMapReduceUpdate(context, params);
            } else {
                // Real-time processing
                var results = processUpdatesRealtime(equipmentIds, caseIds, projectIds, taskIds, oldSiteId, newSiteId);
                renderResultsPage(context, params, results);
            }
        }

        /**
         * Process updates in real-time
         */
        function processUpdatesRealtime(equipmentIds, caseIds, projectIds, taskIds, oldSiteId, newSiteId) {
            var results = {
                equipment: [],
                cases: [],
                projects: [],
                tasks: [],
                errors: [],
                equipmentFailed: false
            };

            // Get old and new site names for title/name replacement
            var oldSiteName = getSiteName(oldSiteId);
            var newSiteName = getSiteName(newSiteId);

            log.audit('Site Names', {
                oldSiteId: oldSiteId,
                oldSiteName: oldSiteName,
                newSiteId: newSiteId,
                newSiteName: newSiteName
            });

            // PHASE 1: Update Equipment Parent Fields FIRST
            log.audit('Phase 1', 'Updating ' + equipmentIds.length + ' equipment parent fields to new site: ' + newSiteId);

            for (var i = 0; i < equipmentIds.length; i++) {
                try {
                    record.submitFields({
                        type: 'customrecord_nx_asset',
                        id: equipmentIds[i],
                        values: {
                            parent: newSiteId
                        }
                    });
                    results.equipment.push({ id: equipmentIds[i], status: 'success' });
                } catch (e) {
                    results.equipment.push({ id: equipmentIds[i], status: 'error', message: e.message });
                    results.errors.push('Equipment ' + equipmentIds[i] + ': ' + e.message);
                    results.equipmentFailed = true;
                }
            }

            // If equipment update failed, stop processing
            if (results.equipmentFailed) {
                log.error('Equipment Update Failed', 'Stopping to preserve data integrity');
                return results;
            }

            // PHASE 2: Update Projects (must be before Cases due to FSM dependency)
            log.audit('Phase 2', 'Updating ' + projectIds.length + ' project site assets and names');

            for (var j = 0; j < projectIds.length; j++) {
                try {
                    // Get current project record
                    var projectRecord = record.load({
                        type: record.Type.JOB,
                        id: projectIds[j],
                        isDynamic: false
                    });

                    // Get project type text and project number to rebuild name
                    var projectType = projectRecord.getText({ fieldId: 'custentity_nx_project_type' }) || '';
                    // entityid contains formatted string, extract just the leading number
                    var entityId = projectRecord.getValue({ fieldId: 'entityid' }) || '';
                    var projectNumber = entityId.split(' ')[0] || ''; // Get first part (the number)

                    // Build new name: [TYPE] [PROJECT_NUMBER] [NEW_SITE_NAME]
                    // NetSuite companyname field has 83 character limit
                    var newName = '';
                    if (projectType && projectNumber) {
                        newName = projectType + ' ' + projectNumber + ' ' + newSiteName;
                        if (newName.length > 83) {
                            newName = newName.substring(0, 83);
                            log.debug('Project Name Truncated', 'Project ' + projectIds[j] + ' name truncated to 83 chars');
                        }
                    }

                    // Preserve equipment assets (multi-select field)
                    var equipmentAssets = projectRecord.getValue({ fieldId: 'custentity_nxc_project_assets' });

                    // Update site asset
                    projectRecord.setValue({ fieldId: 'custentity_nx_asset', value: newSiteId });

                    // Update name if we could rebuild it
                    if (newName) {
                        projectRecord.setValue({ fieldId: 'companyname', value: newName });
                        log.debug('Project Name Updated', 'Project ' + projectIds[j] + ': ' + newName);
                    }

                    // Re-set equipment assets to preserve them
                    if (equipmentAssets) {
                        projectRecord.setValue({ fieldId: 'custentity_nxc_project_assets', value: equipmentAssets });
                    }

                    projectRecord.save();
                    results.projects.push({ id: projectIds[j], status: 'success' });

                } catch (e) {
                    results.projects.push({ id: projectIds[j], status: 'error', message: e.message });
                    results.errors.push('Project ' + projectIds[j] + ': ' + e.message);
                }
            }

            // PHASE 3: Update Cases (after Projects due to FSM dependency)
            log.audit('Phase 3', 'Updating ' + caseIds.length + ' case site assets and subjects');

            for (var k = 0; k < caseIds.length; k++) {
                try {
                    // Get current case title and equipment assets
                    var caseRecord = record.load({
                        type: record.Type.SUPPORT_CASE,
                        id: caseIds[k],
                        isDynamic: false
                    });

                    var currentTitle = caseRecord.getValue({ fieldId: 'title' }) || '';
                    var newTitle = currentTitle.replace(oldSiteName, newSiteName);

                    // Preserve equipment assets (multi-select field)
                    var caseEquipmentAssets = caseRecord.getValue({ fieldId: 'custevent_nxc_case_assets' });

                    // Update site asset and title
                    caseRecord.setValue({ fieldId: 'custevent_nx_case_asset', value: newSiteId });
                    if (newTitle !== currentTitle) {
                        caseRecord.setValue({ fieldId: 'title', value: newTitle });
                    }

                    // Re-set equipment assets to preserve them
                    if (caseEquipmentAssets) {
                        caseRecord.setValue({ fieldId: 'custevent_nxc_case_assets', value: caseEquipmentAssets });
                    }

                    caseRecord.save();
                    results.cases.push({ id: caseIds[k], status: 'success' });

                } catch (e) {
                    results.cases.push({ id: caseIds[k], status: 'error', message: e.message });
                    results.errors.push('Case ' + caseIds[k] + ': ' + e.message);
                }
            }

            // PHASE 4: Update Tasks
            log.audit('Phase 4', 'Updating ' + taskIds.length + ' task site assets and titles');

            // Get new site address details for task updates
            var newSiteAddress = getSiteAddressDetails(newSiteId);
            log.debug('New Site Address Details', newSiteAddress);

            for (var m = 0; m < taskIds.length; m++) {
                try {
                    // Load the task record
                    var taskRecord = record.load({
                        type: record.Type.TASK,
                        id: taskIds[m],
                        isDynamic: false
                    });

                    var currentTaskTitle = taskRecord.getValue({ fieldId: 'title' }) || '';
                    var newTaskTitle = currentTaskTitle.replace(oldSiteName, newSiteName);

                    // Update task asset and title
                    taskRecord.setValue({ fieldId: 'custevent_nx_task_asset', value: newSiteId });
                    if (newTaskTitle !== currentTaskTitle) {
                        taskRecord.setValue({ fieldId: 'title', value: newTaskTitle });
                    }

                    // Update address fields from the new site asset
                    if (newSiteAddress.address) {
                        taskRecord.setValue({ fieldId: 'custevent_nx_address', value: newSiteAddress.address });
                    }
                    if (newSiteAddress.latitude) {
                        taskRecord.setValue({ fieldId: 'custevent_nx_latitude', value: newSiteAddress.latitude });
                    }
                    if (newSiteAddress.longitude) {
                        taskRecord.setValue({ fieldId: 'custevent_nx_longitude', value: newSiteAddress.longitude });
                    }

                    taskRecord.save();
                    results.tasks.push({ id: taskIds[m], status: 'success' });

                } catch (e) {
                    results.tasks.push({ id: taskIds[m], status: 'error', message: e.message });
                    results.errors.push('Task ' + taskIds[m] + ': ' + e.message);
                }
            }

            return results;
        }

        /**
         * Render results page
         */
        function renderResultsPage(context, params, results) {
            var form = serverWidget.createForm({
                title: 'Address Change Asset Update - Results'
            });

            // Add CSS and wizard header
            addHeaderHtml(form, 5);

            // Build results HTML
            var resultsHtml = buildResultsHtml(results, params);

            var resultsField = form.addField({
                id: 'custpage_results_html',
                type: serverWidget.FieldType.INLINEHTML,
                label: 'Results'
            });
            resultsField.defaultValue = resultsHtml;

            // Start new button
            form.addButton({
                id: 'custpage_new',
                label: 'Start New Update',
                functionName: 'startNew'
            });

            // Add client script
            var scriptUrl = url.resolveScript({
                scriptId: runtime.getCurrentScript().id,
                deploymentId: runtime.getCurrentScript().deploymentId
            });

            var scriptField = form.addField({
                id: 'custpage_script',
                type: serverWidget.FieldType.INLINEHTML,
                label: 'Script'
            });
            scriptField.defaultValue = '<script>function startNew() { window.location.href = "' + scriptUrl + '"; }</script>';

            context.response.writePage(form);
        }

        /**
         * Build results HTML
         */
        function buildResultsHtml(results, params) {
            var successEquip = results.equipment.filter(function(r) { return r.status === 'success'; }).length;
            var successCases = results.cases.filter(function(r) { return r.status === 'success'; }).length;
            var successProj = results.projects.filter(function(r) { return r.status === 'success'; }).length;
            var successTasks = (results.tasks || []).filter(function(r) { return r.status === 'success'; }).length;
            var totalSuccess = successEquip + successCases + successProj + successTasks;
            var totalErrors = results.errors.length;

            var html = '<div class="results-container">';

            // Summary
            if (results.equipmentFailed) {
                html += '<div class="error-box">';
                html += '<h3>Processing Stopped</h3>';
                html += '<p>Equipment update failed. Cases, Projects, and Tasks were NOT updated to preserve data integrity.</p>';
                html += '</div>';
            } else if (totalErrors === 0) {
                html += '<div class="success-box">';
                html += '<h3>Update Complete</h3>';
                html += '<p>All records were updated successfully.</p>';
                html += '</div>';
            } else {
                html += '<div class="warning-box">';
                html += '<h3>Update Completed with Errors</h3>';
                html += '<p>Some records could not be updated. See details below.</p>';
                html += '</div>';
            }

            // Statistics
            html += '<div class="stats-container">';
            html += '<div class="stats-box success"><div class="stats-number">' + totalSuccess + '</div><div class="stats-label">Successful</div></div>';
            html += '<div class="stats-box ' + (totalErrors > 0 ? 'error' : '') + '"><div class="stats-number">' + totalErrors + '</div><div class="stats-label">Errors</div></div>';
            html += '</div>';

            // Breakdown
            html += '<div class="breakdown">';
            html += '<h4>Breakdown</h4>';
            html += '<ul>';
            html += '<li>Equipment: ' + successEquip + '/' + results.equipment.length + ' updated</li>';
            html += '<li>Cases: ' + successCases + '/' + results.cases.length + ' updated</li>';
            html += '<li>Projects: ' + successProj + '/' + results.projects.length + ' updated</li>';
            html += '<li>Tasks: ' + successTasks + '/' + (results.tasks || []).length + ' updated</li>';
            html += '</ul>';
            html += '</div>';

            // Error details
            if (results.errors.length > 0) {
                html += '<div class="error-details">';
                html += '<h4>Error Details</h4>';
                html += '<ul>';
                results.errors.forEach(function(err) {
                    html += '<li>' + escapeHtml(err) + '</li>';
                });
                html += '</ul>';
                html += '</div>';
            }

            html += '</div>';

            return html;
        }

        /**
         * Trigger MapReduce for large batch processing
         */
        function triggerMapReduceUpdate(context, params) {
            try {
                var currentUser = runtime.getCurrentUser();

                var mrTask = task.create({
                    taskType: task.TaskType.MAP_REDUCE,
                    scriptId: 'customscript_hul_mr_address_change_updat',
                    deploymentId: 'customdeploy_hul_mr_address_change_updat',
                    params: {
                        custscript_acu_customer_id: params.custpage_customer_id,
                        custscript_acu_old_site_id: params.custpage_old_site_id,
                        custscript_acu_new_site_id: params.custpage_new_site_id,
                        custscript_acu_equipment_ids: params.custpage_selected_equipment || '',
                        custscript_acu_case_ids: params.custpage_selected_cases || '',
                        custscript_acu_project_ids: params.custpage_selected_projects || '',
                        custscript_acu_task_ids: params.custpage_selected_tasks || '',
                        custscript_acu_user_email: currentUser.email
                    }
                });

                var taskId = mrTask.submit();
                log.audit('MapReduce Address Update Triggered', 'Task ID: ' + taskId);

                // Show confirmation page
                renderMapReduceConfirmation(context, taskId, currentUser.email);

            } catch (e) {
                log.error('triggerMapReduceUpdate Error', e.toString());
                context.response.write('Error starting background process: ' + e.toString());
            }
        }

        /**
         * Render MapReduce confirmation page
         */
        function renderMapReduceConfirmation(context, taskId, userEmail) {
            var scriptUrl = url.resolveScript({
                scriptId: runtime.getCurrentScript().id,
                deploymentId: runtime.getCurrentScript().deploymentId
            });

            var html = '<!DOCTYPE html>' +
                '<html><head><title>Background Processing Started</title>' +
                '<style>' +
                'body { font-family: Arial, sans-serif; margin: 40px; background: #f5f5f5; }' +
                '.container { max-width: 600px; margin: 0 auto; background: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }' +
                '.success { color: #28a745; font-size: 48px; margin-bottom: 20px; }' +
                'h1 { color: #333; margin-bottom: 10px; }' +
                'p { color: #666; line-height: 1.6; }' +
                '.task-id { background: #e9ecef; padding: 10px 15px; border-radius: 4px; font-family: monospace; margin: 20px 0; }' +
                '.back-btn { display: inline-block; background: #667eea; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px; margin-top: 20px; }' +
                '</style>' +
                '</head><body>' +
                '<div class="container">' +
                '<div class="success">&#10003;</div>' +
                '<h1>Background Processing Started</h1>' +
                '<p>Your address change update is now processing in the background.</p>' +
                '<div class="task-id"><strong>Task ID:</strong> ' + taskId + '</div>' +
                '<p><strong>What happens next:</strong></p>' +
                '<ul>' +
                '<li>Equipment parent fields will be updated first</li>' +
                '<li>Cases and Projects will be updated after equipment completes</li>' +
                '<li>You will receive an email at <strong>' + userEmail + '</strong> when complete</li>' +
                '</ul>' +
                '<p>Monitor progress: Setup > SuiteCloud Development > Scheduled Script Status</p>' +
                '<a href="' + scriptUrl + '" class="back-btn">Start New Update</a>' +
                '</div>' +
                '</body></html>';

            context.response.write(html);
        }

        // ===============================
        // Helper Functions
        // ===============================

        /**
         * Add CSS and wizard header HTML
         */
        function addHeaderHtml(form, currentStep) {
            var headerField = form.addField({
                id: 'custpage_header_html',
                type: serverWidget.FieldType.INLINEHTML,
                label: 'Header'
            });

            var stepLabels = ['Customer', 'Sites', 'Records', 'Preview', 'Results'];

            var html = '<style>' +
                '.wizard-steps { display: flex; margin-bottom: 30px; border-bottom: 2px solid #e9ecef; padding-bottom: 20px; }' +
                '.wizard-step { flex: 1; text-align: center; padding: 10px; position: relative; }' +
                '.wizard-step .step-number { display: inline-block; width: 30px; height: 30px; border-radius: 50%; background: #e9ecef; color: #666; line-height: 30px; font-weight: bold; margin-bottom: 5px; }' +
                '.wizard-step.active .step-number { background: #667eea; color: white; }' +
                '.wizard-step.completed .step-number { background: #28a745; color: white; }' +
                '.wizard-step .step-label { display: block; font-size: 12px; color: #666; }' +
                '.wizard-step.active .step-label { color: #667eea; font-weight: bold; }' +
                '.wizard-step.completed .step-label { color: #28a745; }' +

                '.info-box { background: #e3f2fd; padding: 15px; border-left: 4px solid #667eea; margin: 15px 0; border-radius: 4px; }' +
                '.warning-box { background: #fff3cd; padding: 15px; border-left: 4px solid #ffc107; margin: 15px 0; border-radius: 4px; }' +
                '.error-box { background: #f8d7da; padding: 15px; border-left: 4px solid #dc3545; margin: 15px 0; border-radius: 4px; }' +
                '.success-box { background: #d4edda; padding: 15px; border-left: 4px solid #28a745; margin: 15px 0; border-radius: 4px; }' +

                '.results-container { margin: 20px 0; }' +
                '.results-table { width: 100%; border-collapse: collapse; margin-top: 15px; }' +
                '.results-table th { background: #667eea; color: white; padding: 10px 8px; text-align: left; }' +
                '.results-table td { padding: 8px; border-bottom: 1px solid #ddd; }' +
                '.results-table tr:hover { background: #f5f5f5; }' +

                '.btn-select { display: inline-block; background: #667eea; color: white; padding: 5px 15px; text-decoration: none; border-radius: 4px; font-size: 12px; }' +
                '.btn-select:hover { background: #5a6fd6; }' +

                '.stats-container { display: flex; flex-wrap: wrap; gap: 15px; margin: 20px 0; }' +
                '.stats-box { display: inline-block; padding: 15px 25px; background: white; border-radius: 6px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); text-align: center; min-width: 100px; border-top: 3px solid #667eea; }' +
                '.stats-box.success { border-top-color: #28a745; }' +
                '.stats-box.error { border-top-color: #dc3545; }' +
                '.stats-box.total { border-top-color: #17a2b8; }' +
                '.stats-number { font-size: 28px; font-weight: bold; color: #333; }' +
                '.stats-label { font-size: 11px; color: #666; text-transform: uppercase; margin-top: 5px; }' +

                '.preview-container { margin: 20px 0; }' +
                '.preview-header { background: #f8f9fa; padding: 20px; border-radius: 6px; margin-bottom: 20px; }' +
                '.preview-header h3 { margin-top: 0; color: #333; }' +
                '.summary-row { margin: 8px 0; }' +
                '.preview-section { background: white; padding: 15px; border: 1px solid #ddd; border-radius: 4px; margin: 15px 0; }' +
                '.preview-section h4 { margin-top: 0; color: #667eea; }' +

                '.customer-info { background: #f8f9fa; padding: 15px; border-radius: 6px; margin-bottom: 20px; }' +
                '.customer-info strong { color: #333; }' +

                '.breakdown { margin: 20px 0; }' +
                '.breakdown h4 { color: #333; }' +
                '.breakdown ul { list-style: none; padding: 0; }' +
                '.breakdown li { padding: 5px 0; border-bottom: 1px solid #eee; }' +

                '.error-details { background: #fff5f5; padding: 15px; border-radius: 4px; margin-top: 20px; }' +
                '.error-details h4 { color: #dc3545; margin-top: 0; }' +
                '.error-details ul { margin: 0; padding-left: 20px; }' +
                '.error-details li { color: #721c24; margin: 5px 0; }' +
                '</style>';

            // Wizard steps indicator
            html += '<div class="wizard-steps">';
            for (var i = 0; i < stepLabels.length; i++) {
                var stepNum = i + 1;
                var stepClass = '';
                if (stepNum < currentStep) stepClass = 'completed';
                else if (stepNum === currentStep) stepClass = 'active';

                html += '<div class="wizard-step ' + stepClass + '">';
                html += '<span class="step-number">' + (stepNum < currentStep ? '&#10003;' : stepNum) + '</span>';
                html += '<span class="step-label">' + stepLabels[i] + '</span>';
                html += '</div>';
            }
            html += '</div>';

            headerField.defaultValue = html;
        }

        /**
         * Add customer info HTML
         */
        function addCustomerInfoHtml(form, customerId, customerName) {
            var infoField = form.addField({
                id: 'custpage_customer_info',
                type: serverWidget.FieldType.INLINEHTML,
                label: 'Customer Info'
            });

            infoField.defaultValue = '<div class="customer-info">' +
                '<strong>Customer:</strong> ' + escapeHtml(customerName) + ' (ID: ' + customerId + ')' +
                '</div>';
        }

        /**
         * Add site info HTML
         */
        function addSiteInfoHtml(form, customerId, customerName, oldSiteId, newSiteId) {
            var oldSiteName = getSiteName(oldSiteId);
            var newSiteName = getSiteName(newSiteId);

            var infoField = form.addField({
                id: 'custpage_site_info',
                type: serverWidget.FieldType.INLINEHTML,
                label: 'Site Info'
            });

            infoField.defaultValue = '<div class="customer-info">' +
                '<strong>Customer:</strong> ' + escapeHtml(customerName) + '<br/>' +
                '<strong>Old Site:</strong> ' + escapeHtml(oldSiteName) + '<br/>' +
                '<strong>New Site:</strong> ' + escapeHtml(newSiteName) +
                '</div>';
        }

        /**
         * Add hidden field
         */
        function addHiddenField(form, id, value) {
            var field = form.addField({
                id: id,
                type: serverWidget.FieldType.LONGTEXT,
                label: id
            });
            field.updateDisplayType({ displayType: serverWidget.FieldDisplayType.HIDDEN });
            field.defaultValue = value || '';
        }

        /**
         * Add navigation client script
         */
        function addNavigationScript(form, backStep) {
            var scriptUrl = url.resolveScript({
                scriptId: runtime.getCurrentScript().id,
                deploymentId: runtime.getCurrentScript().deploymentId
            });

            var scriptField = form.addField({
                id: 'custpage_nav_script',
                type: serverWidget.FieldType.INLINEHTML,
                label: 'Script'
            });

            var script = '<script type="text/javascript">' +
                'function goBack() {' +
                '    var params = [];';

            // Build back URL with current parameters
            script += '    var customerId = document.getElementById("custpage_customer_id");' +
                '    var customerName = document.getElementById("custpage_customer_name");' +
                '    var oldSiteId = document.getElementById("custpage_old_site_id");' +
                '    var newSiteId = document.getElementById("custpage_new_site_id");' +
                '    params.push("custpage_step=' + backStep + '");' +
                '    if (customerId && customerId.value) params.push("custpage_customer_id=" + customerId.value);' +
                '    if (customerName && customerName.value) params.push("custpage_customer_name=" + encodeURIComponent(customerName.value));' +
                '    if (oldSiteId && oldSiteId.value) params.push("custpage_old_site_id=" + oldSiteId.value);' +
                '    if (newSiteId && newSiteId.value) params.push("custpage_new_site_id=" + newSiteId.value);' +
                '    window.location.href = "' + scriptUrl + '&" + params.join("&");' +
                '}' +
                '</script>';

            scriptField.defaultValue = script;
        }

        /**
         * Add selection client scripts
         */
        function addSelectionScript(form, backStep) {
            var scriptUrl = url.resolveScript({
                scriptId: runtime.getCurrentScript().id,
                deploymentId: runtime.getCurrentScript().deploymentId
            });

            var scriptField = form.addField({
                id: 'custpage_selection_script',
                type: serverWidget.FieldType.INLINEHTML,
                label: 'Script'
            });

            var script = '<script type="text/javascript">' +
                'function selectAllEquipment() { toggleAll("custpage_equipment_list", "custpage_eq_select", true); }' +
                'function deselectAllEquipment() { toggleAll("custpage_equipment_list", "custpage_eq_select", false); }' +
                'function selectAllCases() { toggleAll("custpage_case_list", "custpage_case_select", true); }' +
                'function deselectAllCases() { toggleAll("custpage_case_list", "custpage_case_select", false); }' +
                'function selectAllProjects() { toggleAll("custpage_project_list", "custpage_proj_select", true); }' +
                'function deselectAllProjects() { toggleAll("custpage_project_list", "custpage_proj_select", false); }' +
                'function selectAllTasks() { toggleAll("custpage_task_list", "custpage_task_select", true); }' +
                'function deselectAllTasks() { toggleAll("custpage_task_list", "custpage_task_select", false); }' +

                'function toggleAll(sublistId, fieldId, checked) {' +
                '    var count = nlapiGetLineItemCount(sublistId);' +
                '    for (var i = 1; i <= count; i++) {' +
                '        nlapiSetLineItemValue(sublistId, fieldId, i, checked ? "T" : "F");' +
                '    }' +
                '}' +

                'function goBack() {' +
                '    var params = [];' +
                '    var customerId = document.getElementById("custpage_customer_id");' +
                '    var customerName = document.getElementById("custpage_customer_name");' +
                '    var oldSiteId = document.getElementById("custpage_old_site_id");' +
                '    var newSiteId = document.getElementById("custpage_new_site_id");' +
                '    params.push("custpage_step=' + backStep + '");' +
                '    if (customerId && customerId.value) params.push("custpage_customer_id=" + customerId.value);' +
                '    if (customerName && customerName.value) params.push("custpage_customer_name=" + encodeURIComponent(customerName.value));' +
                '    if (oldSiteId && oldSiteId.value) params.push("custpage_old_site_id=" + oldSiteId.value);' +
                '    if (newSiteId && newSiteId.value) params.push("custpage_new_site_id=" + newSiteId.value);' +
                '    window.location.href = "' + scriptUrl + '&" + params.join("&");' +
                '}' +
                '</script>';

            scriptField.defaultValue = script;
        }

        /**
         * Format address for display
         */
        function formatAddress(site) {
            // Just return empty since we don't have address details on the FSA
            // The site name should contain the address info
            return '';
        }

        /**
         * Escape HTML special characters
         */
        function escapeHtml(str) {
            if (!str) return '';
            return String(str)
                .replace(/&/g, '&amp;')
                .replace(/</g, '&lt;')
                .replace(/>/g, '&gt;')
                .replace(/"/g, '&quot;')
                .replace(/'/g, '&#039;');
        }

        return {
            onRequest: onRequest
        };
    });
