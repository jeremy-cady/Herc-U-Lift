/**
 * @NApiVersion 2.1
 * @NScriptType Suitelet
 * @NModuleScope SameAccount
 */

/**
 * HUL Script Dashboard - Centralized Script Access
 *
 * Purpose: Provides a centralized dashboard for accessing all custom
 * HUL scripts, organized by department with search and filtering.
 *
 * Prerequisites: Requires custom record 'customrecord_hul_script_registry'
 * and associated custom lists to be created in NetSuite.
 *
 * @see Documentation/PRDs/PRD-20251126-ScriptDashboard.md
 *
 * Version: 1.0
 * Date: November 2025
 */

define(['N/query', 'N/ui/serverWidget', 'N/runtime', 'N/url'],
    function(query, serverWidget, runtime, url) {

        /**
         * Configuration constants
         */
        const CONFIG = {
            // Color scheme matching existing Suitelets
            COLORS: {
                PRIMARY: '#667eea',
                PRIMARY_DARK: '#764ba2',
                ACTIVE: '#28a745',
                UAT: '#ffc107',
                IN_DEV: '#17a2b8',
                DEPRECATED: '#6c757d',
                CARD_BG: '#ffffff',
                CARD_SHADOW: 'rgba(0,0,0,0.1)'
            },

            // Script Registry custom record fields
            REGISTRY: {
                RECORD_TYPE: 'customrecord_hul_script_registry',
                FIELDS: {
                    name: 'name',
                    description: 'custrecord_hul_sr_description',
                    department: 'custrecord_hul_sr_department',
                    scriptType: 'custrecord_hul_sr_script_type',
                    url: 'custrecord_hul_sr_url',
                    scriptId: 'custrecord_hul_sr_script_id',
                    deploymentId: 'custrecord_hul_sr_deployment_id',
                    status: 'custrecord_hul_sr_status',
                    icon: 'custrecord_hul_sr_icon',
                    sortOrder: 'custrecord_hul_sr_sort_order',
                    prdLink: 'custrecord_hul_sr_prd_link'
                }
            },

            // Status values (must match custom list)
            STATUS: {
                ACTIVE: 1,
                IN_DEV: 2,
                UAT: 3,
                DEPRECATED: 4
            },

            // Script types (must match custom list)
            SCRIPT_TYPES: {
                SUITELET: 1,
                MAPREDUCE: 2,
                SCHEDULED: 3,
                CLIENT: 4,
                USER_EVENT: 5,
                RESTLET: 6
            },

            // Icon mapping for script types
            ICONS: {
                SUITELET: '📊',
                MAPREDUCE: '⚙️',
                SCHEDULED: '⏰',
                CLIENT: '🖥️',
                USER_EVENT: '📡',
                RESTLET: '🔌',
                DEFAULT: '📄'
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
         * Handles GET requests - displays dashboard
         */
        function handleGet(context) {
            try {
                var form = serverWidget.createForm({
                    title: 'HUL Script Dashboard'
                });

                // Add header with search/filters
                addHeaderSection(form, context.request.parameters);

                // Fetch and display scripts
                var scripts = fetchScriptRegistry(context.request.parameters);
                displayScriptDashboard(form, scripts, context.request.parameters);

                context.response.writePage(form);

            } catch (e) {
                log.error({
                    title: 'Error in handleGet',
                    details: e.toString() + '\n' + (e.stack || '')
                });
                context.response.write('An error occurred: ' + e.toString());
            }
        }

        /**
         * Handles POST requests - redirects to GET with parameters
         */
        function handlePost(context) {
            handleGet(context);
        }

        /**
         * Adds header section with search and filters
         */
        function addHeaderSection(form, params) {
            var headerField = form.addField({
                id: 'custpage_header',
                type: serverWidget.FieldType.INLINEHTML,
                label: 'Header'
            });

            headerField.defaultValue = `
                <style>
                    .dashboard-header {
                        background: linear-gradient(135deg, ${CONFIG.COLORS.PRIMARY} 0%, ${CONFIG.COLORS.PRIMARY_DARK} 100%);
                        color: white;
                        padding: 25px;
                        border-radius: 8px;
                        margin-bottom: 20px;
                    }
                    .dashboard-title {
                        font-size: 24px;
                        font-weight: bold;
                        margin-bottom: 8px;
                    }
                    .dashboard-subtitle {
                        font-size: 14px;
                        opacity: 0.9;
                    }
                    .search-container {
                        display: flex;
                        gap: 15px;
                        margin-top: 20px;
                        flex-wrap: wrap;
                    }
                    .search-box {
                        flex: 1;
                        min-width: 250px;
                        padding: 12px 15px;
                        border: none;
                        border-radius: 6px;
                        font-size: 14px;
                    }
                    .filter-select {
                        padding: 12px 15px;
                        border: none;
                        border-radius: 6px;
                        font-size: 14px;
                        min-width: 150px;
                    }
                    .department-section {
                        background: white;
                        border-radius: 8px;
                        box-shadow: 0 2px 8px ${CONFIG.COLORS.CARD_SHADOW};
                        margin-bottom: 20px;
                        overflow: hidden;
                    }
                    .department-header {
                        background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
                        padding: 15px 20px;
                        border-bottom: 1px solid #dee2e6;
                        display: flex;
                        align-items: center;
                        justify-content: space-between;
                        cursor: pointer;
                    }
                    .department-header:hover {
                        background: linear-gradient(135deg, #e9ecef 0%, #dee2e6 100%);
                    }
                    .department-title {
                        font-size: 16px;
                        font-weight: bold;
                        color: #333;
                    }
                    .department-count {
                        background: ${CONFIG.COLORS.PRIMARY};
                        color: white;
                        padding: 4px 12px;
                        border-radius: 20px;
                        font-size: 12px;
                        font-weight: bold;
                    }
                    .department-content {
                        padding: 15px;
                    }
                    .script-grid {
                        display: grid;
                        grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
                        gap: 15px;
                    }
                    .script-card {
                        background: white;
                        border: 1px solid #e9ecef;
                        border-radius: 8px;
                        padding: 20px;
                        transition: all 0.2s ease;
                        display: flex;
                        flex-direction: column;
                    }
                    .script-card:hover {
                        border-color: ${CONFIG.COLORS.PRIMARY};
                        box-shadow: 0 4px 12px ${CONFIG.COLORS.CARD_SHADOW};
                        transform: translateY(-2px);
                    }
                    .script-header {
                        display: flex;
                        align-items: flex-start;
                        justify-content: space-between;
                        margin-bottom: 10px;
                    }
                    .script-icon {
                        font-size: 24px;
                        margin-right: 10px;
                    }
                    .script-name {
                        font-size: 16px;
                        font-weight: bold;
                        color: #333;
                        flex: 1;
                    }
                    .script-type-badge {
                        background: #e9ecef;
                        color: #495057;
                        padding: 3px 8px;
                        border-radius: 4px;
                        font-size: 10px;
                        font-weight: bold;
                        text-transform: uppercase;
                    }
                    .script-description {
                        color: #666;
                        font-size: 13px;
                        line-height: 1.5;
                        flex: 1;
                        margin-bottom: 15px;
                    }
                    .script-footer {
                        display: flex;
                        align-items: center;
                        justify-content: space-between;
                        margin-top: auto;
                    }
                    .status-badge {
                        padding: 4px 10px;
                        border-radius: 4px;
                        font-size: 11px;
                        font-weight: bold;
                    }
                    .status-active {
                        background: #d4edda;
                        color: ${CONFIG.COLORS.ACTIVE};
                    }
                    .status-uat {
                        background: #fff3cd;
                        color: #856404;
                    }
                    .status-dev {
                        background: #d1ecf1;
                        color: #0c5460;
                    }
                    .status-deprecated {
                        background: #e2e3e5;
                        color: ${CONFIG.COLORS.DEPRECATED};
                    }
                    .open-btn {
                        background: ${CONFIG.COLORS.PRIMARY};
                        color: white;
                        padding: 8px 16px;
                        border-radius: 6px;
                        text-decoration: none;
                        font-size: 12px;
                        font-weight: bold;
                        transition: background 0.2s ease;
                    }
                    .open-btn:hover {
                        background: ${CONFIG.COLORS.PRIMARY_DARK};
                        color: white;
                        text-decoration: none;
                    }
                    .open-btn-disabled {
                        background: #ccc;
                        cursor: not-allowed;
                    }
                    .stats-row {
                        display: flex;
                        gap: 15px;
                        margin-bottom: 20px;
                        flex-wrap: wrap;
                    }
                    .stat-box {
                        background: white;
                        padding: 15px 25px;
                        border-radius: 8px;
                        box-shadow: 0 2px 8px ${CONFIG.COLORS.CARD_SHADOW};
                        text-align: center;
                        min-width: 120px;
                    }
                    .stat-number {
                        font-size: 28px;
                        font-weight: bold;
                        color: ${CONFIG.COLORS.PRIMARY};
                    }
                    .stat-label {
                        font-size: 11px;
                        color: #666;
                        text-transform: uppercase;
                        margin-top: 5px;
                    }
                    .no-scripts {
                        text-align: center;
                        padding: 40px;
                        color: #666;
                    }
                    .no-scripts-icon {
                        font-size: 48px;
                        margin-bottom: 15px;
                    }
                    .info-box {
                        background: #e3f2fd;
                        border-left: 4px solid #2196f3;
                        padding: 15px;
                        border-radius: 4px;
                        margin-bottom: 20px;
                    }
                    .prd-link {
                        font-size: 11px;
                        color: #666;
                        margin-top: 8px;
                    }
                    .prd-link a {
                        color: ${CONFIG.COLORS.PRIMARY};
                    }
                </style>
                <div class="dashboard-header">
                    <div class="dashboard-title">HUL Script Dashboard</div>
                    <div class="dashboard-subtitle">Central access point for all custom NetSuite scripts and tools</div>
                    <div class="search-container">
                        <input type="text" class="search-box" id="scriptSearch" placeholder="Search scripts by name or description..." oninput="filterScripts()">
                        <select class="filter-select" id="statusFilter" onchange="filterScripts()">
                            <option value="">All Statuses</option>
                            <option value="active">Active</option>
                            <option value="uat">UAT</option>
                            <option value="dev">In Development</option>
                        </select>
                    </div>
                </div>
                <script>
                    function filterScripts() {
                        var searchText = document.getElementById('scriptSearch').value.toLowerCase();
                        var statusFilter = document.getElementById('statusFilter').value;
                        var cards = document.querySelectorAll('.script-card');
                        var sections = document.querySelectorAll('.department-section');

                        cards.forEach(function(card) {
                            var name = card.getAttribute('data-name').toLowerCase();
                            var description = card.getAttribute('data-description').toLowerCase();
                            var status = card.getAttribute('data-status');

                            var matchesSearch = name.indexOf(searchText) !== -1 || description.indexOf(searchText) !== -1;
                            var matchesStatus = !statusFilter || status === statusFilter;

                            card.style.display = (matchesSearch && matchesStatus) ? 'flex' : 'none';
                        });

                        // Hide empty sections
                        sections.forEach(function(section) {
                            var visibleCards = section.querySelectorAll('.script-card[style*="flex"], .script-card:not([style*="none"])');
                            var hasVisible = false;
                            section.querySelectorAll('.script-card').forEach(function(card) {
                                if (card.style.display !== 'none') hasVisible = true;
                            });
                            section.style.display = hasVisible ? 'block' : 'none';
                        });
                    }

                    function toggleDepartment(deptId) {
                        var content = document.getElementById('dept-content-' + deptId);
                        if (content.style.display === 'none') {
                            content.style.display = 'block';
                        } else {
                            content.style.display = 'none';
                        }
                    }
                </script>
            `;
        }

        /**
         * Fetches script registry entries from custom record
         */
        function fetchScriptRegistry(params) {
            var scripts = [];

            try {
                // First check if the custom record exists
                var sql = `
                    SELECT
                        sr.id,
                        sr.name AS script_name,
                        sr.${CONFIG.REGISTRY.FIELDS.description} AS description,
                        sr.${CONFIG.REGISTRY.FIELDS.url} AS url,
                        sr.${CONFIG.REGISTRY.FIELDS.scriptId} AS script_id,
                        sr.${CONFIG.REGISTRY.FIELDS.deploymentId} AS deployment_id,
                        sr.${CONFIG.REGISTRY.FIELDS.icon} AS icon,
                        sr.${CONFIG.REGISTRY.FIELDS.sortOrder} AS sort_order,
                        sr.${CONFIG.REGISTRY.FIELDS.prdLink} AS prd_link,
                        BUILTIN.DF(sr.${CONFIG.REGISTRY.FIELDS.department}) AS department_name,
                        sr.${CONFIG.REGISTRY.FIELDS.department} AS department_id,
                        BUILTIN.DF(sr.${CONFIG.REGISTRY.FIELDS.scriptType}) AS script_type,
                        sr.${CONFIG.REGISTRY.FIELDS.scriptType} AS script_type_id,
                        BUILTIN.DF(sr.${CONFIG.REGISTRY.FIELDS.status}) AS status,
                        sr.${CONFIG.REGISTRY.FIELDS.status} AS status_id
                    FROM ${CONFIG.REGISTRY.RECORD_TYPE} sr
                    WHERE sr.${CONFIG.REGISTRY.FIELDS.status} != ${CONFIG.STATUS.DEPRECATED}
                    ORDER BY sr.${CONFIG.REGISTRY.FIELDS.department}, sr.${CONFIG.REGISTRY.FIELDS.sortOrder}, sr.name
                `;

                log.debug({
                    title: 'Fetching Script Registry',
                    details: 'Executing SuiteQL query'
                });

                var queryResults = query.runSuiteQL({ query: sql });
                var mappedResults = queryResults.asMappedResults();

                log.audit({
                    title: 'Script Registry Results',
                    details: 'Found ' + mappedResults.length + ' scripts'
                });

                for (var i = 0; i < mappedResults.length; i++) {
                    var row = mappedResults[i];
                    scripts.push({
                        id: row.id,
                        name: row.script_name || '',
                        description: row.description || '',
                        url: row.url || '',
                        scriptId: row.script_id || '',
                        deploymentId: row.deployment_id || '',
                        icon: row.icon || '',
                        sortOrder: row.sort_order || 0,
                        prdLink: row.prd_link || '',
                        departmentName: row.department_name || 'Uncategorized',
                        departmentId: row.department_id || 0,
                        scriptType: row.script_type || 'Unknown',
                        scriptTypeId: row.script_type_id || 0,
                        status: row.status || 'Unknown',
                        statusId: row.status_id || 0
                    });
                }

            } catch (e) {
                log.error({
                    title: 'Error fetching script registry',
                    details: e.toString() + '\n' + (e.stack || '')
                });

                // If custom record doesn't exist, return demo data
                if (e.toString().indexOf('customrecord_hul_script_registry') !== -1) {
                    log.audit({
                        title: 'Script Registry Not Found',
                        details: 'Custom record not yet created - displaying setup instructions'
                    });
                }
            }

            return scripts;
        }

        /**
         * Displays the script dashboard
         */
        function displayScriptDashboard(form, scripts, params) {
            var dashboardField = form.addField({
                id: 'custpage_dashboard',
                type: serverWidget.FieldType.INLINEHTML,
                label: 'Dashboard'
            });

            // If no scripts found (custom record not created yet), show setup instructions
            if (scripts.length === 0) {
                dashboardField.defaultValue = getSetupInstructions();
                return;
            }

            // Calculate statistics
            var stats = calculateStats(scripts);

            // Build dashboard HTML
            var html = '';

            // Stats row
            html += '<div class="stats-row">';
            html += createStatBox(stats.total, 'Total Scripts', CONFIG.COLORS.PRIMARY);
            html += createStatBox(stats.active, 'Active', CONFIG.COLORS.ACTIVE);
            html += createStatBox(stats.uat, 'In UAT', '#856404');
            html += createStatBox(stats.inDev, 'In Development', '#0c5460');
            html += createStatBox(stats.departments, 'Departments', CONFIG.COLORS.PRIMARY_DARK);
            html += '</div>';

            // Group scripts by department
            var grouped = groupByDepartment(scripts);

            // Render each department
            for (var deptId in grouped) {
                var deptScripts = grouped[deptId];
                var deptName = deptScripts[0].departmentName;

                html += '<div class="department-section" id="dept-' + deptId + '">';
                html += '<div class="department-header" onclick="toggleDepartment(\'' + deptId + '\')">';
                html += '<span class="department-title">' + escapeHtml(deptName) + '</span>';
                html += '<span class="department-count">' + deptScripts.length + ' script' + (deptScripts.length !== 1 ? 's' : '') + '</span>';
                html += '</div>';
                html += '<div class="department-content" id="dept-content-' + deptId + '">';
                html += '<div class="script-grid">';

                for (var i = 0; i < deptScripts.length; i++) {
                    html += renderScriptCard(deptScripts[i]);
                }

                html += '</div></div></div>';
            }

            dashboardField.defaultValue = html;
        }

        /**
         * Calculates dashboard statistics
         */
        function calculateStats(scripts) {
            var stats = {
                total: scripts.length,
                active: 0,
                uat: 0,
                inDev: 0,
                departments: 0
            };

            var depts = {};

            for (var i = 0; i < scripts.length; i++) {
                var s = scripts[i];

                if (s.statusId === CONFIG.STATUS.ACTIVE) stats.active++;
                if (s.statusId === CONFIG.STATUS.UAT) stats.uat++;
                if (s.statusId === CONFIG.STATUS.IN_DEV) stats.inDev++;

                depts[s.departmentId] = true;
            }

            stats.departments = Object.keys(depts).length;

            return stats;
        }

        /**
         * Groups scripts by department
         */
        function groupByDepartment(scripts) {
            var grouped = {};

            for (var i = 0; i < scripts.length; i++) {
                var s = scripts[i];
                var deptId = s.departmentId || 'uncategorized';

                if (!grouped[deptId]) {
                    grouped[deptId] = [];
                }
                grouped[deptId].push(s);
            }

            return grouped;
        }

        /**
         * Renders a single script card
         */
        function renderScriptCard(script) {
            var icon = getScriptIcon(script.scriptTypeId, script.icon);
            var statusClass = getStatusClass(script.statusId);
            var statusLabel = getStatusLabel(script.statusId);
            var statusDataAttr = getStatusDataAttr(script.statusId);

            var html = '<div class="script-card" data-name="' + escapeHtml(script.name) + '" data-description="' + escapeHtml(script.description) + '" data-status="' + statusDataAttr + '">';

            // Header
            html += '<div class="script-header">';
            html += '<span class="script-icon">' + icon + '</span>';
            html += '<span class="script-name">' + escapeHtml(script.name) + '</span>';
            html += '<span class="script-type-badge">' + escapeHtml(script.scriptType) + '</span>';
            html += '</div>';

            // Description
            html += '<div class="script-description">' + escapeHtml(script.description || 'No description available') + '</div>';

            // PRD Link if available
            if (script.prdLink) {
                html += '<div class="prd-link"><a href="' + escapeHtml(script.prdLink) + '" target="_blank">View Documentation</a></div>';
            }

            // Footer
            html += '<div class="script-footer">';
            html += '<span class="status-badge ' + statusClass + '">' + statusLabel + '</span>';

            // Open button - use URL field if available for any script type
            if (script.url) {
                // Use the URL directly from the registry (works for Suitelets and script record links)
                var btnLabel = script.scriptTypeId === CONFIG.SCRIPT_TYPES.SUITELET ? 'Open Script' : 'View Script';
                html += '<a href="' + escapeHtml(script.url) + '" class="open-btn" target="_blank">' + btnLabel + '</a>';
            } else {
                html += '<span class="open-btn open-btn-disabled">No URL</span>';
            }

            html += '</div></div>';

            return html;
        }

        /**
         * Gets icon for script type
         */
        function getScriptIcon(typeId, customIcon) {
            if (customIcon) return customIcon;

            switch (typeId) {
                case CONFIG.SCRIPT_TYPES.SUITELET: return CONFIG.ICONS.SUITELET;
                case CONFIG.SCRIPT_TYPES.MAPREDUCE: return CONFIG.ICONS.MAPREDUCE;
                case CONFIG.SCRIPT_TYPES.SCHEDULED: return CONFIG.ICONS.SCHEDULED;
                case CONFIG.SCRIPT_TYPES.CLIENT: return CONFIG.ICONS.CLIENT;
                case CONFIG.SCRIPT_TYPES.USER_EVENT: return CONFIG.ICONS.USER_EVENT;
                case CONFIG.SCRIPT_TYPES.RESTLET: return CONFIG.ICONS.RESTLET;
                default: return CONFIG.ICONS.DEFAULT;
            }
        }

        /**
         * Gets CSS class for status badge
         */
        function getStatusClass(statusId) {
            switch (statusId) {
                case CONFIG.STATUS.ACTIVE: return 'status-active';
                case CONFIG.STATUS.UAT: return 'status-uat';
                case CONFIG.STATUS.IN_DEV: return 'status-dev';
                case CONFIG.STATUS.DEPRECATED: return 'status-deprecated';
                default: return 'status-active';
            }
        }

        /**
         * Gets label for status badge
         */
        function getStatusLabel(statusId) {
            switch (statusId) {
                case CONFIG.STATUS.ACTIVE: return 'Active';
                case CONFIG.STATUS.UAT: return 'UAT';
                case CONFIG.STATUS.IN_DEV: return 'In Development';
                case CONFIG.STATUS.DEPRECATED: return 'Deprecated';
                default: return 'Unknown';
            }
        }

        /**
         * Gets data attribute value for filtering
         */
        function getStatusDataAttr(statusId) {
            switch (statusId) {
                case CONFIG.STATUS.ACTIVE: return 'active';
                case CONFIG.STATUS.UAT: return 'uat';
                case CONFIG.STATUS.IN_DEV: return 'dev';
                case CONFIG.STATUS.DEPRECATED: return 'deprecated';
                default: return 'active';
            }
        }

        /**
         * Creates a stat box HTML
         */
        function createStatBox(value, label, color) {
            return '<div class="stat-box">' +
                   '<div class="stat-number" style="color: ' + color + ';">' + value + '</div>' +
                   '<div class="stat-label">' + label + '</div>' +
                   '</div>';
        }

        /**
         * Returns setup instructions when custom record doesn't exist
         */
        function getSetupInstructions() {
            return `
                <div class="info-box">
                    <h3 style="margin-top: 0;">Script Registry Setup Required</h3>
                    <p>The Script Registry custom record has not been created yet. Please follow these steps to set up the dashboard:</p>

                    <h4>Step 1: Create Custom Lists</h4>
                    <ol>
                        <li><strong>customlist_hul_sr_script_types</strong> - Script types
                            <ul>
                                <li>1 = Suitelet</li>
                                <li>2 = MapReduce</li>
                                <li>3 = Scheduled Script</li>
                                <li>4 = Client Script</li>
                                <li>5 = User Event</li>
                                <li>6 = Restlet</li>
                            </ul>
                        </li>
                        <li><strong>customlist_hul_sr_status</strong> - Status values
                            <ul>
                                <li>1 = Active</li>
                                <li>2 = In Development</li>
                                <li>3 = UAT</li>
                                <li>4 = Deprecated</li>
                            </ul>
                        </li>
                    </ol>

                    <h4>Step 2: Create Custom Record</h4>
                    <p>Create <strong>customrecord_hul_script_registry</strong> with these fields:</p>
                    <table border="1" cellpadding="8" cellspacing="0" style="border-collapse: collapse; margin: 15px 0;">
                        <tr style="background: #f8f9fa;">
                            <th>Field ID</th>
                            <th>Label</th>
                            <th>Type</th>
                        </tr>
                        <tr><td>name</td><td>Name</td><td>Text (required)</td></tr>
                        <tr><td>custrecord_hul_sr_description</td><td>Description</td><td>Text Area</td></tr>
                        <tr><td>custrecord_hul_sr_department</td><td>Department</td><td>List/Record (Department - existing)</td></tr>
                        <tr><td>custrecord_hul_sr_script_type</td><td>Script Type</td><td>List (customlist_hul_sr_script_types)</td></tr>
                        <tr><td>custrecord_hul_sr_url</td><td>URL</td><td>URL</td></tr>
                        <tr><td>custrecord_hul_sr_script_id</td><td>Script ID</td><td>Text</td></tr>
                        <tr><td>custrecord_hul_sr_deployment_id</td><td>Deployment ID</td><td>Text</td></tr>
                        <tr><td>custrecord_hul_sr_status</td><td>Status</td><td>List (customlist_hul_sr_status)</td></tr>
                        <tr><td>custrecord_hul_sr_icon</td><td>Icon</td><td>Text</td></tr>
                        <tr><td>custrecord_hul_sr_sort_order</td><td>Sort Order</td><td>Integer</td></tr>
                        <tr><td>custrecord_hul_sr_prd_link</td><td>PRD Link</td><td>URL</td></tr>
                    </table>

                    <h4>Step 3: Add Scripts to Registry</h4>
                    <p>Once the custom record is created, add entries for each script you want to display on the dashboard.</p>
                </div>
            `;
        }

        /**
         * Escapes HTML special characters
         */
        function escapeHtml(text) {
            if (!text) return '';
            return String(text)
                .replace(/&/g, '&amp;')
                .replace(/</g, '&lt;')
                .replace(/>/g, '&gt;')
                .replace(/"/g, '&quot;')
                .replace(/'/g, '&#039;');
        }

        return {
            onRequest: onRequest
        };
    }
);
