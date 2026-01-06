/**
 * @NApiVersion 2.1
 * @NScriptType MapReduceScript
 * @NModuleScope SameAccount
 *
 * Commission Data Validator - Full Export Map/Reduce
 *
 * Processes all transaction lines matching filter criteria,
 * validates against Sales Rep Matrix, and generates CSV export.
 * Output is saved to File Cabinet (Inventory Reports folder) and email notification sent.
 *
 * ============================================================================
 * PARAMETER REFERENCE GUIDE
 * ============================================================================
 *
 * FROM DATE (custscript_comm_export_from_date)
 *   Type: Date
 *   Example: 09/01/2025
 *   Required: Yes
 *
 * TO DATE (custscript_comm_export_to_date)
 *   Type: Date
 *   Example: 09/30/2025
 *   Required: Yes
 *
 * DOCUMENT PREFIX (custscript_comm_export_prefix)
 *   Type: Free Text
 *   Common Values:
 *     W = Wholesale transactions
 *     R = Rental transactions
 *     S = Service transactions
 *   Notes: Filters transactions where tranid starts with this prefix.
 *          Enter just the letter (e.g., "W" not "W%").
 *   Required: No (blank = all prefixes)
 *
 * TRANSACTION TYPE (custscript_comm_export_tran_type)
 *   Type: Free Text
 *   Valid Values: Invoice, Sales Order, Credit Memo
 *                 (also accepts: CustInvc, SalesOrd, CustCred)
 *   Required: No (blank = all transaction types)
 *
 * EXCLUDE INTERNAL (custscript_comm_export_exclude_internal)
 *   Type: Free Text
 *   Valid Values: T (to exclude), or leave BLANK (to include)
 *   Notes: Enter "T" to exclude internal revenue streams. Leave blank to include all.
 *          Do NOT enter "F" - just leave blank.
 *   Required: No
 *
 * EXCLUDE OVERRIDE (custscript_comm_export_exclude_override)
 *   Type: Free Text
 *   Valid Values: T (to exclude), or leave BLANK (to include)
 *   Notes: Enter "T" to exclude override lines. Leave blank to include all.
 *          Do NOT enter "F" - just leave blank.
 *   Required: No
 *
 * ELIGIBLE FOR COMMISSION (custscript_comm_export_eligible_comm)
 *   Type: Free Text
 *   Valid Values: T, F, or BLANK
 *   Notes: T = only eligible lines
 *          F = only non-eligible lines
 *          BLANK = all lines (no filter)
 *   Required: No
 *
 * EQUIPMENT CATEGORY (custscript_comm_export_equip_category)
 *   Type: Free Text
 *   Valid Values: Equipment category TEXT NAME (not internal ID)
 *   Examples: FORKLIFT, RAIL MOVERS, SCISSOR LIFT
 *   Special: EXCLUDE_RAIL (excludes all Rail Movers equipment)
 *   Notes: Uses the text name that appears in the Equipment Category segment.
 *          Matches at any level (grandparent, parent, or child).
 *          Leave blank for all equipment categories.
 *   Required: No
 *
 * USER EMAIL FOR NOTIFICATION (custscript_comm_export_user_email)
 *   Type: Email Address
 *   Example: user@company.com
 *   Notes: Email address to receive completion notification with summary stats.
 *          In Sandbox, email may not send - check File Cabinet for output.
 *   Required: No (but recommended)
 *
 * ============================================================================
 */

define(['N/query', 'N/runtime', 'N/file', 'N/email', 'N/log', 'N/format', 'N/cache'],
    function(query, runtime, file, email, log, format, cache) {

        // Cache for matrix data - shared across map invocations
        var MATRIX_CACHE_NAME = 'COMMISSION_MATRIX_CACHE';
        var matrixCache = null;

        // Configuration
        var CONFIG = {
            FOLDER_ID: 6043632, // Inventory Reports folder in Documents (Production)
            COLORS: {
                MATCH: '#d4edda',
                OVERRIDE: '#fff3cd',
                MISMATCH: '#ffe5d0',
                MISSING_REP: '#f8d7da',
                MISSING_PLAN: '#f5c6cb',
                NO_MATRIX: '#e9ecef'
            }
        };

        /**
         * Get Input Data - Return SuiteQL query for transaction lines
         * Matrix data loading happens lazily in map() using cache
         */
        function getInputData() {
            var scriptObj = runtime.getCurrentScript();

            var fromDateParam = scriptObj.getParameter({ name: 'custscript_comm_export_from_date' });
            var toDateParam = scriptObj.getParameter({ name: 'custscript_comm_export_to_date' });
            var prefix = scriptObj.getParameter({ name: 'custscript_comm_export_prefix' }) || '';
            var tranTypeParam = scriptObj.getParameter({ name: 'custscript_comm_export_tran_type' }) || '';
            var tranTypeMap = {
                'Invoice': 'CustInvc',
                'Invoices': 'CustInvc',
                'Sales Order': 'SalesOrd',
                'Sales Orders': 'SalesOrd',
                'Credit Memo': 'CustCred',
                'Credit Memos': 'CustCred'
            };
            var tranType = tranTypeMap[tranTypeParam] || tranTypeParam;
            var excludeInternal = scriptObj.getParameter({ name: 'custscript_comm_export_exclude_internal' }) === true || scriptObj.getParameter({ name: 'custscript_comm_export_exclude_internal' }) === 'T';
            var excludeOverride = scriptObj.getParameter({ name: 'custscript_comm_export_exclude_override' }) === true || scriptObj.getParameter({ name: 'custscript_comm_export_exclude_override' }) === 'T';
            var eligibleComm = scriptObj.getParameter({ name: 'custscript_comm_export_eligible_comm' }) || '';
            var equipCategory = scriptObj.getParameter({ name: 'custscript_comm_export_equip_category' }) || '';

            var fromDate = formatDateForQuery(fromDateParam);
            var toDate = formatDateForQuery(toDateParam);

            log.audit('getInputData', 'Starting with params: fromDate=' + fromDate + ', toDate=' + toDate + ', prefix=' + prefix);

            var typeFilter = "t.type IN ('SalesOrd', 'CustInvc', 'CustCred')";
            if (tranType) {
                typeFilter = "t.type = '" + tranType + "'";
            }

            var prefixFilter = prefix ? "AND t.tranid LIKE '" + prefix + "%'" : '';
            var internalFilter = excludeInternal ? "AND (rs.custrecord_sna_hul_revstreaminternal IS NULL OR rs.custrecord_sna_hul_revstreaminternal = 'F')" : '';
            var overrideFilter = excludeOverride ? "AND (tl.custcol_sna_override_commission IS NULL OR tl.custcol_sna_override_commission = 'F')" : '';

            var eligibleFilter = '';
            if (eligibleComm === 'T') {
                eligibleFilter = "AND tl.custcol_sna_hul_eligible_for_comm = 'T'";
            } else if (eligibleComm === 'F') {
                eligibleFilter = "AND (tl.custcol_sna_hul_eligible_for_comm IS NULL OR tl.custcol_sna_hul_eligible_for_comm = 'F')";
            }

            var equipCategoryFilter = '';
            if (equipCategory === 'EXCLUDE_RAIL') {
                equipCategoryFilter = "AND (eq_grandparent.name != 'RAIL MOVERS' OR eq_grandparent.name IS NULL) AND (eq_parent.name != 'RAIL MOVERS' OR eq_parent.name IS NULL) AND (eq.name != 'RAIL MOVERS' OR eq.name IS NULL)";
            } else if (equipCategory) {
                equipCategoryFilter = "AND (eq_grandparent.name = '" + equipCategory + "' OR eq_parent.name = '" + equipCategory + "' OR eq.name = '" + equipCategory + "')";
            }

            var lineQuery = `
                SELECT
                    t.id AS transaction_id,
                    t.tranid AS doc_number,
                    t.trandate,
                    t.type AS tran_type,
                    t.entity AS customer_id,
                    c.entityid AS customer_number,
                    c.companyname AS customer_name,
                    tsa.zip AS shipzip,
                    tl.linesequencenumber AS line_num,
                    tl.item AS item_id,
                    i.itemid AS item_name,
                    BUILTIN.DF(i.custitem_sna_hul_itemcategory) AS item_category_name,
                    tl.netamount,
                    tl.cseg_sna_hul_eq_seg AS equip_category_id,
                    eq.name AS equip_category_name,
                    eq.parent AS equip_category_parent_id,
                    eq_parent.name AS equip_category_parent_name,
                    eq_parent.parent AS equip_category_grandparent_id,
                    eq_grandparent.name AS equip_category_grandparent_name,
                    tl.cseg_sna_revenue_st AS revenue_stream_id,
                    rs.name AS revenue_stream_name,
                    rs.parent AS revenue_stream_parent_id,
                    rs_parent.name AS revenue_stream_parent_name,
                    rs_parent.parent AS revenue_stream_grandparent_id,
                    rs_grandparent.name AS revenue_stream_grandparent_name,
                    rs_grandparent.parent AS revenue_stream_greatgrandparent_id,
                    rs_greatgrandparent.name AS revenue_stream_greatgrandparent_name,
                    rs_greatgrandparent.parent AS revenue_stream_greatgreatgrandparent_id,
                    rs_greatgreatgrandparent.name AS revenue_stream_greatgreatgrandparent_name,
                    rs.custrecord_sna_hul_revstreaminternal AS revenue_stream_internal,
                    tl.cseg_hul_mfg AS manufacturer_id,
                    mfg.name AS manufacturer_name,
                    tl.custcol_sna_sales_rep AS sales_rep_id,
                    e.entityid AS sales_rep_name,
                    tl.custcol_sna_sales_rep_matrix AS matrix_id,
                    tl.custcol_sna_commission_plan AS commission_plan_id,
                    cp.name AS commission_plan_name,
                    tl.custcol_sna_hul_eligible_for_comm AS eligible_for_comm,
                    tl.custcol_sna_override_commission AS override_flag
                FROM transaction t
                INNER JOIN transactionline tl ON t.id = tl.transaction
                LEFT JOIN customer c ON t.entity = c.id
                LEFT JOIN item i ON tl.item = i.id
                LEFT JOIN employee e ON tl.custcol_sna_sales_rep = e.id
                LEFT JOIN customrecord_cseg_sna_hul_eq_seg eq ON tl.cseg_sna_hul_eq_seg = eq.id
                LEFT JOIN customrecord_cseg_sna_hul_eq_seg eq_parent ON eq.parent = eq_parent.id
                LEFT JOIN customrecord_cseg_sna_hul_eq_seg eq_grandparent ON eq_parent.parent = eq_grandparent.id
                LEFT JOIN customrecord_cseg_sna_revenue_st rs ON tl.cseg_sna_revenue_st = rs.id
                LEFT JOIN customrecord_cseg_sna_revenue_st rs_parent ON rs.parent = rs_parent.id
                LEFT JOIN customrecord_cseg_sna_revenue_st rs_grandparent ON rs_parent.parent = rs_grandparent.id
                LEFT JOIN customrecord_cseg_sna_revenue_st rs_greatgrandparent ON rs_grandparent.parent = rs_greatgrandparent.id
                LEFT JOIN customrecord_cseg_sna_revenue_st rs_greatgreatgrandparent ON rs_greatgrandparent.parent = rs_greatgreatgrandparent.id
                LEFT JOIN customrecord_cseg_hul_mfg mfg ON tl.cseg_hul_mfg = mfg.id
                LEFT JOIN customrecord_sna_hul_csm_comm_plan cp ON tl.custcol_sna_commission_plan = cp.id
                LEFT JOIN transactionShippingAddress tsa ON t.shippingaddress = tsa.nkey
                WHERE ${typeFilter}
                  AND tl.mainline = 'F'
                  AND tl.taxline = 'F'
                  AND t.trandate >= TO_DATE('${fromDate}', 'MM/DD/YYYY')
                  AND t.trandate <= TO_DATE('${toDate}', 'MM/DD/YYYY')
                  ${prefixFilter}
                  ${internalFilter}
                  ${overrideFilter}
                  ${eligibleFilter}
                  ${equipCategoryFilter}
                  AND tl.item IS NOT NULL
                ORDER BY t.trandate DESC, t.tranid, tl.linesequencenumber
            `;

            log.debug('getInputData', 'Returning SuiteQL query');

            return {
                type: 'suiteql',
                query: lineQuery
            };
        }

        /**
         * Get matrix data for a specific customer and zip
         * Uses in-memory cache for repeated lookups within same M/R execution
         */
        function getMatrixForLine(customerId, zipCode) {
            // Initialize cache if needed
            if (!matrixCache) {
                matrixCache = {
                    byCustomer: {},
                    byZip: {},
                    salesRepNames: null
                };
            }

            // Load sales rep names once
            if (!matrixCache.salesRepNames) {
                matrixCache.salesRepNames = {};
                try {
                    var repQuery = "SELECT id, entityid AS name FROM employee";
                    var repResults = query.runSuiteQL({ query: repQuery }).asMappedResults();
                    repResults.forEach(function(r) {
                        matrixCache.salesRepNames[r.id] = r.name;
                    });
                    log.audit('getMatrixForLine', 'Loaded ' + Object.keys(matrixCache.salesRepNames).length + ' sales rep names');
                } catch (e) {
                    log.error('getMatrixForLine', 'Error loading rep names: ' + e.toString());
                }
            }

            var customerMatrix = [];
            var zipMatrix = [];

            // Load customer matrix if not cached
            if (customerId && !matrixCache.byCustomer.hasOwnProperty(customerId)) {
                matrixCache.byCustomer[customerId] = loadMatrixForCustomer(customerId, matrixCache.salesRepNames);
            }
            if (customerId && matrixCache.byCustomer[customerId]) {
                customerMatrix = matrixCache.byCustomer[customerId];
            }

            // Load zip matrix if not cached - handle "55117-4619" format
            var zip5 = (zipCode || '').toString().split('-')[0].substring(0, 5);
            if (zip5 && !matrixCache.byZip.hasOwnProperty(zip5)) {
                matrixCache.byZip[zip5] = loadMatrixForZip(zip5, matrixCache.salesRepNames);
            }
            if (zip5 && matrixCache.byZip[zip5]) {
                zipMatrix = matrixCache.byZip[zip5];
            }

            return {
                customerMatrix: customerMatrix,
                zipMatrix: zipMatrix
            };
        }

        /**
         * Load matrix records for a specific customer
         */
        function loadMatrixForCustomer(customerId, salesRepNames) {
            var records = [];
            try {
                var sql = `
                    SELECT m.id, m.name,
                        m.custrecord_salesrep_mapping_zipcode AS zip_code,
                        m.custrecord_salesrep_mapping_equipment AS equip_category_id,
                        eq.name AS equip_category_name,
                        m.custrecord_salesrep_mapping_rev_stream AS revenue_stream_id,
                        rs.name AS revenue_stream_name,
                        m.custrecord_salesrep_mapping_manufacturer AS manufacturer_id,
                        m.custrecord_salesrep_mapping_sales_reps AS sales_rep_ids
                    FROM customrecord_sna_salesrep_matrix_mapping m
                    LEFT JOIN customrecord_cseg_sna_hul_eq_seg eq ON m.custrecord_salesrep_mapping_equipment = eq.id
                    LEFT JOIN customrecord_cseg_sna_revenue_st rs ON m.custrecord_salesrep_mapping_rev_stream = rs.id
                    WHERE m.isinactive = 'F'
                      AND m.custrecord_salesrep_mapping_customer = ${customerId}
                `;
                var results = query.runSuiteQL({ query: sql }).asMappedResults();

                // Debug: Log first few customer lookups
                if (!loadMatrixForCustomer.debugCount) {
                    loadMatrixForCustomer.debugCount = 0;
                }
                if (loadMatrixForCustomer.debugCount < 5) {
                    loadMatrixForCustomer.debugCount++;
                    log.debug('loadMatrixForCustomer', 'Customer ' + customerId + ' returned ' + results.length + ' matrix records');
                    if (results.length > 0) {
                        log.debug('loadMatrixForCustomer', 'First record: ' + JSON.stringify(results[0]));
                    }
                }

                results.forEach(function(row) {
                    var repIds = parseSalesRepIds(row.sales_rep_ids);
                    records.push({
                        id: row.id,
                        name: row.name,
                        zip_code: row.zip_code,
                        equip_category_id: row.equip_category_id,
                        equip_category_name: row.equip_category_name,
                        revenue_stream_id: row.revenue_stream_id,
                        revenue_stream_name: row.revenue_stream_name,
                        manufacturer_id: row.manufacturer_id,
                        sales_rep_ids: repIds,
                        sales_rep_names: repIds.map(function(id) { return salesRepNames[id] || ('ID:' + id); })
                    });
                });
            } catch (e) {
                log.debug('loadMatrixForCustomer', 'Error for customer ' + customerId + ': ' + e.toString());
            }
            return records;
        }
        loadMatrixForCustomer.debugCount = 0;

        /**
         * Load matrix records for a specific zip code (non-customer)
         */
        function loadMatrixForZip(zipCode, salesRepNames) {
            var records = [];
            try {
                var sql = `
                    SELECT m.id, m.name,
                        m.custrecord_salesrep_mapping_zipcode AS zip_code,
                        m.custrecord_salesrep_mapping_equipment AS equip_category_id,
                        eq.name AS equip_category_name,
                        m.custrecord_salesrep_mapping_rev_stream AS revenue_stream_id,
                        rs.name AS revenue_stream_name,
                        m.custrecord_salesrep_mapping_manufacturer AS manufacturer_id,
                        m.custrecord_salesrep_mapping_sales_reps AS sales_rep_ids
                    FROM customrecord_sna_salesrep_matrix_mapping m
                    LEFT JOIN customrecord_cseg_sna_hul_eq_seg eq ON m.custrecord_salesrep_mapping_equipment = eq.id
                    LEFT JOIN customrecord_cseg_sna_revenue_st rs ON m.custrecord_salesrep_mapping_rev_stream = rs.id
                    WHERE m.isinactive = 'F'
                      AND m.custrecord_salesrep_mapping_customer IS NULL
                      AND m.custrecord_salesrep_mapping_zipcode = '${zipCode}'
                `;
                var results = query.runSuiteQL({ query: sql }).asMappedResults();

                // Debug: Log first few zip lookups
                if (!loadMatrixForZip.debugCount) {
                    loadMatrixForZip.debugCount = 0;
                }
                if (loadMatrixForZip.debugCount < 5) {
                    loadMatrixForZip.debugCount++;
                    log.debug('loadMatrixForZip', 'Zip ' + zipCode + ' returned ' + results.length + ' matrix records');
                    if (results.length > 0) {
                        log.debug('loadMatrixForZip', 'First record: ' + JSON.stringify(results[0]));
                    }
                }

                results.forEach(function(row) {
                    var repIds = parseSalesRepIds(row.sales_rep_ids);
                    records.push({
                        id: row.id,
                        name: row.name,
                        zip_code: row.zip_code,
                        equip_category_id: row.equip_category_id,
                        equip_category_name: row.equip_category_name,
                        revenue_stream_id: row.revenue_stream_id,
                        revenue_stream_name: row.revenue_stream_name,
                        manufacturer_id: row.manufacturer_id,
                        sales_rep_ids: repIds,
                        sales_rep_names: repIds.map(function(id) { return salesRepNames[id] || ('ID:' + id); })
                    });
                });
            } catch (e) {
                log.debug('loadMatrixForZip', 'Error for zip ' + zipCode + ': ' + e.toString());
            }
            return records;
        }
        loadMatrixForZip.debugCount = 0;

        // Column names in order as they appear in the SELECT statement
        var COLUMN_NAMES = [
            'transaction_id', 'doc_number', 'trandate', 'tran_type', 'customer_id',
            'customer_number', 'customer_name', 'shipzip', 'line_num', 'item_id',
            'item_name', 'item_category_name', 'netamount', 'equip_category_id',
            'equip_category_name', 'equip_category_parent_id', 'equip_category_parent_name',
            'equip_category_grandparent_id', 'equip_category_grandparent_name',
            'revenue_stream_id', 'revenue_stream_name', 'revenue_stream_parent_id',
            'revenue_stream_parent_name', 'revenue_stream_grandparent_id',
            'revenue_stream_grandparent_name', 'revenue_stream_greatgrandparent_id',
            'revenue_stream_greatgrandparent_name', 'revenue_stream_greatgreatgrandparent_id',
            'revenue_stream_greatgreatgrandparent_name', 'revenue_stream_internal',
            'manufacturer_id', 'manufacturer_name', 'sales_rep_id', 'sales_rep_name',
            'matrix_id', 'commission_plan_id', 'commission_plan_name', 'eligible_for_comm',
            'override_flag'
        ];

        /**
         * Map - Process each transaction line with cached matrix validation
         * Matrix data is loaded once and cached across all map invocations
         */
        map.debugLogged = false;
        function map(context) {
            try {
                var rawData = JSON.parse(context.value);

                // SuiteQL from getInputData returns {types: [], values: []} format
                var line = {};
                if (rawData.values && Array.isArray(rawData.values)) {
                    for (var i = 0; i < COLUMN_NAMES.length && i < rawData.values.length; i++) {
                        line[COLUMN_NAMES[i]] = rawData.values[i];
                    }
                } else {
                    line = rawData;
                }

                // Get matrix data from cache (loads per customer/zip as needed, caches for reuse)
                var customerId = line.customer_id;
                // Extract 5-digit zip, handling formats like "55117-4619" or "55117"
                var rawZip = (line.shipzip || '').toString();
                var zip = rawZip.split('-')[0].substring(0, 5);
                var matrixData = getMatrixForLine(customerId, zip);

                // Attach matrix data to line for validation
                line._customerMatrix = matrixData.customerMatrix;
                line._zipMatrix = matrixData.zipMatrix;

                // Perform matrix validation using cached data
                var validation = validateLineWithPreloadedData(line);

                // Build CSV row with full validation data
                var csvRow = [
                    '"' + (line.doc_number || '') + '"',
                    '"' + formatDate(line.trandate) + '"',
                    '"' + formatTranType(line.tran_type) + '"',
                    '"' + (line.line_num || '') + '"',
                    '"' + (line.customer_id || '') + '"',
                    '"' + String(line.customer_number || '').replace(/"/g, '""') + '"',
                    '"' + String(line.customer_name || '').replace(/"/g, '""') + '"',
                    '"' + String(line.item_name || '').replace(/"/g, '""') + '"',
                    '"' + String(line.item_category_name || '').replace(/"/g, '""') + '"',
                    '"' + (line.shipzip || '') + '"',
                    '"' + formatEquipCategory(line) + '"',
                    '"' + formatRevenueStream(line) + '"',
                    '"' + (line.manufacturer_name || '') + '"',
                    '"' + validation.label + '"',
                    '"' + (line.override_flag === 'T' ? 'Yes' : 'No') + '"',
                    '"' + (line.eligible_for_comm === 'T' ? 'Yes' : 'No') + '"',
                    '"' + (line.sales_rep_name || '') + '"',
                    '"' + (validation.expected_rep_names || []).join(', ') + '"',
                    '"' + (validation.expected_matrix_name || validation.no_match_reason || '') + '"',
                    '"' + (line.netamount || 0) + '"'
                ].join(',');

                // Write directly to summarize (skip reduce)
                context.write({
                    key: validation.status,
                    value: csvRow
                });
            } catch (e) {
                log.error('map Error', e.toString());
            }
        }

        /**
         * Validate a single line using pre-loaded matrix data (no queries)
         */
        function validateLineWithPreloadedData(line) {
            // Handle "55117-4619" format - take only digits before hyphen
            var shipZip = (line.shipzip || '').toString().split('-')[0].substring(0, 5);
            var topLevelEquipId = getTopLevelEquipId(line);
            var matrixRevenueStreamId = getMatrixRevenueStreamId(line);
            var manufacturerId = line.manufacturer_id;

            // Determine if parts default logic applies
            var usePartsDefault = false;
            var useTrackmobileDefault = false;
            var revenueStreamDisplay = formatRevenueStream(line);
            if (!topLevelEquipId && revenueStreamDisplay === 'External : Parts') {
                var itemCategory = line.item_category_name || '';
                if (itemCategory.indexOf('4600') !== -1 || itemCategory.toLowerCase().indexOf('trackmobile') !== -1) {
                    useTrackmobileDefault = true;
                } else {
                    usePartsDefault = true;
                }
            }

            var matrixMatch = null;
            var customerMatrixRecords = line._customerMatrix || [];
            var zipMatrixRecords = line._zipMatrix || [];

            var hasCustomerMatrix = customerMatrixRecords.length > 0;
            var hasCustomerMatrixForZip = false;
            var hasZipMatrix = zipMatrixRecords.length > 0;

            // Priority 1: Check customer-specific matrix records
            if (hasCustomerMatrix && shipZip) {
                // Filter customer matrix by zip - handle hyphenated zips
                var customerMatchesForZip = customerMatrixRecords.filter(function(m) {
                    var matrixZip = (m.zip_code || '').toString().split('-')[0].substring(0, 5);
                    return matrixZip === shipZip;
                });
                hasCustomerMatrixForZip = customerMatchesForZip.length > 0;

                if (hasCustomerMatrixForZip) {
                    matrixMatch = findBestMatchFromRecords(customerMatchesForZip, topLevelEquipId, matrixRevenueStreamId, manufacturerId, usePartsDefault, useTrackmobileDefault);
                }
            }

            // Priority 2: Check zip-based matrix records
            if (!matrixMatch && hasZipMatrix) {
                matrixMatch = findBestMatchFromRecords(zipMatrixRecords, topLevelEquipId, matrixRevenueStreamId, manufacturerId, usePartsDefault, useTrackmobileDefault);
            }

            // Determine no-match reason
            var noMatchReason = null;
            if (!matrixMatch) {
                if (!hasCustomerMatrix && !hasZipMatrix) {
                    noMatchReason = 'Customer NA, Zip NA';
                } else if (hasCustomerMatrix && !hasCustomerMatrixForZip && !hasZipMatrix) {
                    noMatchReason = 'Customer zip NA, Zip NA';
                } else if (hasCustomerMatrixForZip || hasZipMatrix) {
                    noMatchReason = 'Category/Stream NA';
                } else if (!hasCustomerMatrixForZip && hasCustomerMatrix) {
                    noMatchReason = 'Customer zip NA';
                } else {
                    noMatchReason = 'No criteria match';
                }
            }

            // Build validation result
            var baseResult = {
                expected_rep_ids: matrixMatch ? (matrixMatch.sales_rep_ids || []) : [],
                expected_rep_names: matrixMatch ? (matrixMatch.sales_rep_names || []) : [],
                expected_matrix_id: matrixMatch ? matrixMatch.id : null,
                expected_matrix_name: matrixMatch ? matrixMatch.name : null,
                no_match_reason: noMatchReason
            };

            if (!line.sales_rep_id) {
                return Object.assign({ status: 'MISSING_REP', label: 'Missing Rep' }, baseResult);
            }

            if (line.eligible_for_comm === 'T' && !line.commission_plan_id) {
                return Object.assign({ status: 'MISSING_PLAN', label: 'Missing Plan' }, baseResult);
            }

            if (line.override_flag === 'T') {
                return Object.assign({ status: 'OVERRIDE', label: 'Override' }, baseResult);
            }

            if (!matrixMatch) {
                return Object.assign({ status: 'NO_MATRIX', label: 'No Matrix' }, baseResult);
            }

            var expectedReps = matrixMatch.sales_rep_ids || [];
            var assignedRepId = parseInt(line.sales_rep_id, 10);

            if (expectedReps.indexOf(assignedRepId) !== -1) {
                return Object.assign({ status: 'MATCH', label: 'Match' }, baseResult);
            }

            return Object.assign({ status: 'MISMATCH', label: 'Mismatch' }, baseResult);
        }

        /**
         * Find best match from pre-loaded matrix records (no queries)
         * Rep names are already attached to matrix records
         */
        function findBestMatchFromRecords(records, topLevelEquipId, matrixRevenueStreamId, manufacturerId, usePartsDefault, useTrackmobileDefault) {
            // Try standard matching first
            var match = findBestMatch(records, topLevelEquipId, matrixRevenueStreamId, manufacturerId);
            if (match) {
                return match; // sales_rep_names already attached
            }

            // Try parts default (FORKLIFT)
            if (usePartsDefault) {
                var forkliftMatches = records.filter(function(m) {
                    var equipName = (m.equip_category_name || '').toUpperCase();
                    if (equipName !== 'FORKLIFT') return false;
                    if (m.revenue_stream_id && matrixRevenueStreamId) {
                        if (String(m.revenue_stream_id) !== String(matrixRevenueStreamId)) return false;
                    }
                    return true;
                });
                if (forkliftMatches.length > 0) {
                    return selectBestByManufacturer(forkliftMatches, manufacturerId);
                }
            }

            // Try trackmobile default (RAIL MOVERS)
            if (useTrackmobileDefault) {
                var railMatches = records.filter(function(m) {
                    var equipName = (m.equip_category_name || '').toUpperCase();
                    if (equipName !== 'RAIL MOVERS') return false;
                    if (m.revenue_stream_id && matrixRevenueStreamId) {
                        if (String(m.revenue_stream_id) !== String(matrixRevenueStreamId)) return false;
                    }
                    return true;
                });
                if (railMatches.length > 0) {
                    return selectBestByManufacturer(railMatches, manufacturerId);
                }
            }

            return null;
        }

        /**
         * Normalize column names from SuiteQL results
         * Maps any case variation to expected snake_case names
         */
        function normalizeColumnNames(row) {
            var normalized = {};
            var keyMap = {
                'transaction_id': 'transaction_id',
                'doc_number': 'doc_number',
                'trandate': 'trandate',
                'tran_type': 'tran_type',
                'customer_id': 'customer_id',
                'customer_number': 'customer_number',
                'customer_name': 'customer_name',
                'shipzip': 'shipzip',
                'line_num': 'line_num',
                'item_id': 'item_id',
                'item_name': 'item_name',
                'item_category_name': 'item_category_name',
                'netamount': 'netamount',
                'equip_category_id': 'equip_category_id',
                'equip_category_name': 'equip_category_name',
                'equip_category_parent_id': 'equip_category_parent_id',
                'equip_category_parent_name': 'equip_category_parent_name',
                'equip_category_grandparent_id': 'equip_category_grandparent_id',
                'equip_category_grandparent_name': 'equip_category_grandparent_name',
                'revenue_stream_id': 'revenue_stream_id',
                'revenue_stream_name': 'revenue_stream_name',
                'revenue_stream_parent_id': 'revenue_stream_parent_id',
                'revenue_stream_parent_name': 'revenue_stream_parent_name',
                'revenue_stream_grandparent_id': 'revenue_stream_grandparent_id',
                'revenue_stream_grandparent_name': 'revenue_stream_grandparent_name',
                'revenue_stream_greatgrandparent_id': 'revenue_stream_greatgrandparent_id',
                'revenue_stream_greatgrandparent_name': 'revenue_stream_greatgrandparent_name',
                'revenue_stream_greatgreatgrandparent_id': 'revenue_stream_greatgreatgrandparent_id',
                'revenue_stream_greatgreatgrandparent_name': 'revenue_stream_greatgreatgrandparent_name',
                'revenue_stream_internal': 'revenue_stream_internal',
                'manufacturer_id': 'manufacturer_id',
                'manufacturer_name': 'manufacturer_name',
                'sales_rep_id': 'sales_rep_id',
                'sales_rep_name': 'sales_rep_name',
                'matrix_id': 'matrix_id',
                'commission_plan_id': 'commission_plan_id',
                'commission_plan_name': 'commission_plan_name',
                'eligible_for_comm': 'eligible_for_comm',
                'override_flag': 'override_flag'
            };

            // Copy values using lowercase key lookup
            for (var key in row) {
                var lowerKey = key.toLowerCase();
                if (keyMap[lowerKey]) {
                    normalized[keyMap[lowerKey]] = row[key];
                } else {
                    normalized[key] = row[key];
                }
            }
            return normalized;
        }

        /**
         * Reduce - Pass through CSV rows (no aggregation needed)
         */
        function reduce(context) {
            // Simply pass through all CSV rows to summarize
            context.values.forEach(function(csvRow) {
                context.write({
                    key: context.key,
                    value: csvRow
                });
            });
        }

        /**
         * Summarize - Build CSV and email to user
         */
        function summarize(summary) {
            var scriptObj = runtime.getCurrentScript();
            var userEmail = scriptObj.getParameter({ name: 'custscript_comm_export_user_email' });
            var fromDate = scriptObj.getParameter({ name: 'custscript_comm_export_from_date' });
            var toDate = scriptObj.getParameter({ name: 'custscript_comm_export_to_date' });

            log.audit('summarize', 'Starting CSV generation');

            // Count statistics by status key
            var stats = {
                total: 0,
                match: 0,
                override: 0,
                mismatch: 0,
                missing_rep: 0,
                missing_plan: 0,
                no_matrix: 0
            };

            // Build CSV content
            var csvHeader = 'Doc #,Date,Type,Line,Customer ID,Customer #,Customer Name,Item,Item Category,Zip,Equip Category,Revenue Stream,Manufacturer,Status,Override,Eligible,Sales Rep,Expected Rep,Expected Matrix,Amount\n';
            var csvRows = [];

            summary.output.iterator().each(function(key, value) {
                stats.total++;

                // Update stats based on status key
                switch (key) {
                    case 'MATCH': stats.match++; break;
                    case 'OVERRIDE': stats.override++; break;
                    case 'MISMATCH': stats.mismatch++; break;
                    case 'MISSING_REP': stats.missing_rep++; break;
                    case 'MISSING_PLAN': stats.missing_plan++; break;
                    case 'NO_MATRIX': stats.no_matrix++; break;
                }

                // Value is already a CSV row string
                csvRows.push(value);
                return true;
            });

            log.audit('summarize', 'Processed ' + stats.total + ' lines');

            // Create CSV file
            var csvContent = csvHeader + csvRows.join('\n');
            var timestamp = new Date().getTime();
            var fileName = 'commission_validation_' + timestamp + '.csv';

            var csvFile = file.create({
                name: fileName,
                fileType: file.Type.CSV,
                contents: csvContent,
                folder: CONFIG.FOLDER_ID
            });

            var fileId = csvFile.save();
            log.audit('summarize', 'CSV file saved with ID: ' + fileId);

            // Send email notification
            if (userEmail) {
                var emailBody = 'Your Commission Data Validation export is complete.\n\n';
                emailBody += 'Date Range: ' + formatDateForQuery(fromDate) + ' to ' + formatDateForQuery(toDate) + '\n\n';
                emailBody += 'Summary:\n';
                emailBody += '- Total Lines: ' + stats.total + '\n';
                emailBody += '- Match: ' + stats.match + '\n';
                emailBody += '- Override: ' + stats.override + '\n';
                emailBody += '- Mismatch: ' + stats.mismatch + '\n';
                emailBody += '- Missing Rep: ' + stats.missing_rep + '\n';
                emailBody += '- Missing Plan: ' + stats.missing_plan + '\n';
                emailBody += '- No Matrix: ' + stats.no_matrix + '\n\n';
                emailBody += 'The CSV file has been saved to the File Cabinet (Inventory Reports folder).\n';
                emailBody += 'File ID: ' + fileId + '\n';
                emailBody += 'File Name: ' + fileName + '\n';

                email.send({
                    author: -5, // System user
                    recipients: userEmail,
                    subject: 'Commission Validation Export Complete - ' + stats.total + ' Lines',
                    body: emailBody
                });

                log.audit('summarize', 'Email sent to ' + userEmail);
            }

            // Log any errors
            summary.mapSummary.errors.iterator().each(function(key, error) {
                log.error('Map Error', 'Key: ' + key + ', Error: ' + error);
                return true;
            });

            summary.reduceSummary.errors.iterator().each(function(key, error) {
                log.error('Reduce Error', 'Key: ' + key + ', Error: ' + error);
                return true;
            });
        }

        // ============ Helper Functions ============

        /**
         * Load matrix data for customers and zips
         */
        function loadMatrixData(customerIds, zipCodes) {
            var matrixByCustomer = {};
            var matrixByGeo = {};
            var salesRepNames = {};

            try {
                // Load sales rep names
                var repQuery = `SELECT id, entityid AS name FROM employee WHERE isinactive = 'F'`;
                var repResults = query.runSuiteQL({ query: repQuery }).asMappedResults();
                repResults.forEach(function(rep) {
                    salesRepNames[rep.id] = rep.name;
                });

                // Load customer-specific matrix records
                if (customerIds.length > 0) {
                    var customerResults = queryMatrixByCustomers(customerIds);
                    customerResults.forEach(function(row) {
                        var matrixRecord = buildMatrixRecord(row, salesRepNames);
                        if (row.customer_id) {
                            if (!matrixByCustomer[row.customer_id]) {
                                matrixByCustomer[row.customer_id] = [];
                            }
                            matrixByCustomer[row.customer_id].push(matrixRecord);
                        }
                    });
                }

                // Load zip-based matrix records
                if (zipCodes.length > 0) {
                    var zipResults = queryMatrixByZips(zipCodes);
                    zipResults.forEach(function(row) {
                        var matrixRecord = buildMatrixRecord(row, salesRepNames);
                        if (row.zip_code) {
                            var zip = String(row.zip_code).substring(0, 5);
                            if (!matrixByGeo[zip]) {
                                matrixByGeo[zip] = [];
                            }
                            matrixByGeo[zip].push(matrixRecord);
                        }
                    });
                }

            } catch (e) {
                log.error('loadMatrixData Error', e.toString());
            }

            return {
                byCustomer: matrixByCustomer,
                byGeo: matrixByGeo
            };
        }

        /**
         * Query matrix by customers with pagination
         */
        function queryMatrixByCustomers(customerIds) {
            var allResults = [];
            var BATCH_SIZE = 25;
            var PAGE_SIZE = 5000;

            for (var i = 0; i < customerIds.length; i += BATCH_SIZE) {
                var batch = customerIds.slice(i, i + BATCH_SIZE);
                var idList = batch.join(',');

                var baseQuery = `
                    SELECT
                        m.id, m.name,
                        m.custrecord_salesrep_mapping_zipcode AS zip_code,
                        m.custrecord_salesrep_mapping_equipment AS equip_category_id,
                        eq.name AS equip_category_name,
                        m.custrecord_salesrep_mapping_rev_stream AS revenue_stream_id,
                        rs.name AS revenue_stream_name,
                        m.custrecord_salesrep_mapping_manufacturer AS manufacturer_id,
                        mfg.name AS manufacturer_name,
                        m.custrecord_salesrep_mapping_sales_reps AS sales_rep_ids,
                        m.custrecord_salesrep_mapping_customer AS customer_id,
                        cust.companyname AS customer_name,
                        m.custrecord_sna_hul_sales_rep_comm_plan_2 AS commission_plan_id,
                        cp.name AS commission_plan_name
                    FROM customrecord_sna_salesrep_matrix_mapping m
                    LEFT JOIN customrecord_cseg_sna_hul_eq_seg eq ON m.custrecord_salesrep_mapping_equipment = eq.id
                    LEFT JOIN customrecord_cseg_sna_revenue_st rs ON m.custrecord_salesrep_mapping_rev_stream = rs.id
                    LEFT JOIN customrecord_cseg_hul_mfg mfg ON m.custrecord_salesrep_mapping_manufacturer = mfg.id
                    LEFT JOIN customer cust ON m.custrecord_salesrep_mapping_customer = cust.id
                    LEFT JOIN customrecord_sna_hul_csm_comm_plan cp ON m.custrecord_sna_hul_sales_rep_comm_plan_2 = cp.id
                    WHERE m.isinactive = 'F'
                      AND m.custrecord_salesrep_mapping_customer IN (${idList})
                    ORDER BY m.id
                `;

                var offset = 0;
                var moreResults = true;
                while (moreResults) {
                    var pagedQuery = baseQuery + ` OFFSET ${offset} ROWS FETCH NEXT ${PAGE_SIZE} ROWS ONLY`;
                    var batchResults = query.runSuiteQL({ query: pagedQuery }).asMappedResults();
                    allResults = allResults.concat(batchResults);
                    if (batchResults.length < PAGE_SIZE) {
                        moreResults = false;
                    } else {
                        offset += PAGE_SIZE;
                    }
                }
            }
            return allResults;
        }

        /**
         * Query matrix by zips with pagination
         */
        function queryMatrixByZips(zipCodes) {
            var allResults = [];
            var BATCH_SIZE = 25;
            var PAGE_SIZE = 5000;

            for (var i = 0; i < zipCodes.length; i += BATCH_SIZE) {
                var batch = zipCodes.slice(i, i + BATCH_SIZE);
                var zipList = batch.map(function(z) { return "'" + z + "'"; }).join(',');

                var baseQuery = `
                    SELECT
                        m.id, m.name,
                        m.custrecord_salesrep_mapping_zipcode AS zip_code,
                        m.custrecord_salesrep_mapping_equipment AS equip_category_id,
                        eq.name AS equip_category_name,
                        m.custrecord_salesrep_mapping_rev_stream AS revenue_stream_id,
                        rs.name AS revenue_stream_name,
                        m.custrecord_salesrep_mapping_manufacturer AS manufacturer_id,
                        mfg.name AS manufacturer_name,
                        m.custrecord_salesrep_mapping_sales_reps AS sales_rep_ids,
                        m.custrecord_salesrep_mapping_customer AS customer_id,
                        cust.companyname AS customer_name,
                        m.custrecord_sna_hul_sales_rep_comm_plan_2 AS commission_plan_id,
                        cp.name AS commission_plan_name
                    FROM customrecord_sna_salesrep_matrix_mapping m
                    LEFT JOIN customrecord_cseg_sna_hul_eq_seg eq ON m.custrecord_salesrep_mapping_equipment = eq.id
                    LEFT JOIN customrecord_cseg_sna_revenue_st rs ON m.custrecord_salesrep_mapping_rev_stream = rs.id
                    LEFT JOIN customrecord_cseg_hul_mfg mfg ON m.custrecord_salesrep_mapping_manufacturer = mfg.id
                    LEFT JOIN customer cust ON m.custrecord_salesrep_mapping_customer = cust.id
                    LEFT JOIN customrecord_sna_hul_csm_comm_plan cp ON m.custrecord_sna_hul_sales_rep_comm_plan_2 = cp.id
                    WHERE m.isinactive = 'F'
                      AND m.custrecord_salesrep_mapping_zipcode IN (${zipList})
                      AND m.custrecord_salesrep_mapping_customer IS NULL
                    ORDER BY m.id
                `;

                var offset = 0;
                var moreResults = true;
                while (moreResults) {
                    var pagedQuery = baseQuery + ` OFFSET ${offset} ROWS FETCH NEXT ${PAGE_SIZE} ROWS ONLY`;
                    var batchResults = query.runSuiteQL({ query: pagedQuery }).asMappedResults();
                    allResults = allResults.concat(batchResults);
                    if (batchResults.length < PAGE_SIZE) {
                        moreResults = false;
                    } else {
                        offset += PAGE_SIZE;
                    }
                }
            }
            return allResults;
        }

        /**
         * Build matrix record from query row
         */
        function buildMatrixRecord(row, salesRepNames) {
            var repIds = parseSalesRepIds(row.sales_rep_ids);
            var repNames = repIds.map(function(id) {
                return salesRepNames[id] || ('ID:' + id);
            });

            return {
                id: row.id,
                name: row.name,
                zip_code: row.zip_code,
                equip_category_id: row.equip_category_id,
                equip_category_name: row.equip_category_name,
                revenue_stream_id: row.revenue_stream_id,
                revenue_stream_name: row.revenue_stream_name,
                manufacturer_id: row.manufacturer_id,
                manufacturer_name: row.manufacturer_name,
                sales_rep_ids: repIds,
                sales_rep_names: repNames,
                customer_id: row.customer_id,
                customer_name: row.customer_name,
                commission_plan_id: row.commission_plan_id,
                commission_plan_name: row.commission_plan_name
            };
        }

        /**
         * Parse sales rep IDs from multiselect field
         */
        function parseSalesRepIds(salesRepValue) {
            if (!salesRepValue) return [];
            var ids = String(salesRepValue).split(',').map(function(id) {
                return parseInt(id.trim(), 10);
            }).filter(function(id) {
                return !isNaN(id);
            });
            return ids;
        }

        /**
         * Validate a single line against matrix
         */
        function validateLine(line, matrixData) {
            var matrixMatch = findMatrixMatch(line, matrixData);
            var isNoMatch = matrixMatch && matrixMatch.noMatch === true;
            var noMatchReason = isNoMatch ? matrixMatch.reason : null;

            var baseResult = {
                expected_rep_ids: (!isNoMatch && matrixMatch) ? (matrixMatch.sales_rep_ids || []) : [],
                expected_rep_names: (!isNoMatch && matrixMatch) ? (matrixMatch.sales_rep_names || []) : [],
                expected_matrix_id: (!isNoMatch && matrixMatch) ? matrixMatch.id : null,
                expected_matrix_name: (!isNoMatch && matrixMatch) ? matrixMatch.name : null,
                expected_commission_plan: (!isNoMatch && matrixMatch) ? matrixMatch.commission_plan_name : null,
                no_match_reason: noMatchReason
            };

            if (!line.sales_rep_id) {
                return Object.assign({ status: 'MISSING_REP', label: 'Missing Rep' }, baseResult);
            }

            if (line.eligible_for_comm === 'T' && !line.commission_plan_id) {
                return Object.assign({ status: 'MISSING_PLAN', label: 'Missing Plan' }, baseResult);
            }

            if (line.override_flag === 'T') {
                return Object.assign({ status: 'OVERRIDE', label: 'Override' }, baseResult);
            }

            if (!matrixMatch || isNoMatch) {
                return Object.assign({ status: 'NO_MATRIX', label: 'No Matrix' }, baseResult);
            }

            var expectedReps = matrixMatch.sales_rep_ids || [];
            var assignedRepId = parseInt(line.sales_rep_id, 10);

            if (expectedReps.includes(assignedRepId)) {
                return Object.assign({ status: 'MATCH', label: 'Match' }, baseResult);
            }

            return Object.assign({ status: 'MISMATCH', label: 'Mismatch' }, baseResult);
        }

        /**
         * Find matching matrix record for a line
         */
        function findMatrixMatch(line, matrixData) {
            var topLevelEquipId = getTopLevelEquipId(line);
            var matrixRevenueStreamId = getMatrixRevenueStreamId(line);
            var shipZip = (line.shipzip || '').substring(0, 5);

            var usePartsDefault = false;
            var useTrackmobileDefault = false;
            var revenueStreamDisplay = formatRevenueStream(line);
            if (!topLevelEquipId && revenueStreamDisplay === 'External : Parts') {
                var itemCategory = line.item_category_name || '';
                if (itemCategory.indexOf('4600') !== -1 || itemCategory.toLowerCase().indexOf('trackmobile') !== -1) {
                    useTrackmobileDefault = true;
                } else {
                    usePartsDefault = true;
                }
            }

            // Priority 1: Customer-specific match
            var hasCustomerMatrix = line.customer_id && matrixData.byCustomer[line.customer_id] && matrixData.byCustomer[line.customer_id].length > 0;
            if (hasCustomerMatrix) {
                var customerMatches = matrixData.byCustomer[line.customer_id];
                var customerMatchesForZip = customerMatches.filter(function(m) {
                    var matrixZip = (m.zip_code || '').substring(0, 5);
                    return matrixZip === shipZip;
                });
                if (customerMatchesForZip.length > 0) {
                    var customerMatch = findBestMatchWithPartsDefault(customerMatchesForZip, topLevelEquipId, matrixRevenueStreamId, line.manufacturer_id, usePartsDefault, useTrackmobileDefault);
                    if (customerMatch) return customerMatch;
                }
            }

            // Priority 2: Geographic match
            var hasZipMatrix = shipZip && matrixData.byGeo[shipZip] && matrixData.byGeo[shipZip].length > 0;
            if (hasZipMatrix) {
                var zipMatches = matrixData.byGeo[shipZip];
                var zipMatch = findBestMatchWithPartsDefault(zipMatches, topLevelEquipId, matrixRevenueStreamId, line.manufacturer_id, usePartsDefault, useTrackmobileDefault);
                if (zipMatch) return zipMatch;
            }

            // Determine reason for no match
            var hasCustomerMatrixForZip = false;
            if (hasCustomerMatrix) {
                hasCustomerMatrixForZip = matrixData.byCustomer[line.customer_id].some(function(m) {
                    return (m.zip_code || '').substring(0, 5) === shipZip;
                });
            }

            if (!hasCustomerMatrix && !hasZipMatrix) {
                return { noMatch: true, reason: 'Customer NA, Zip NA' };
            } else if (hasCustomerMatrix && !hasCustomerMatrixForZip && !hasZipMatrix) {
                return { noMatch: true, reason: 'Customer zip NA, Zip NA' };
            } else if (hasCustomerMatrixForZip || hasZipMatrix) {
                return { noMatch: true, reason: 'Category/Stream NA' };
            } else if (!hasCustomerMatrixForZip && hasCustomerMatrix) {
                return { noMatch: true, reason: 'Customer zip NA' };
            }

            return { noMatch: true, reason: 'No criteria match' };
        }

        function findBestMatchWithPartsDefault(matches, topLevelEquipId, matrixRevenueStreamId, manufacturerId, usePartsDefault, useTrackmobileDefault) {
            var match = findBestMatch(matches, topLevelEquipId, matrixRevenueStreamId, manufacturerId);
            if (match) return match;

            if (usePartsDefault) {
                var forkliftMatches = matches.filter(function(m) {
                    var equipName = (m.equip_category_name || '').toUpperCase();
                    if (equipName !== 'FORKLIFT') return false;
                    if (m.revenue_stream_id && matrixRevenueStreamId) {
                        if (String(m.revenue_stream_id) !== String(matrixRevenueStreamId)) return false;
                    }
                    return true;
                });
                if (forkliftMatches.length > 0) {
                    return selectBestByManufacturer(forkliftMatches, manufacturerId);
                }
            }

            if (useTrackmobileDefault) {
                var railMoverMatches = matches.filter(function(m) {
                    var equipName = (m.equip_category_name || '').toUpperCase();
                    if (equipName !== 'RAIL MOVERS') return false;
                    if (m.revenue_stream_id && matrixRevenueStreamId) {
                        if (String(m.revenue_stream_id) !== String(matrixRevenueStreamId)) return false;
                    }
                    return true;
                });
                if (railMoverMatches.length > 0) {
                    return selectBestByManufacturer(railMoverMatches, manufacturerId);
                }
            }

            return null;
        }

        function findBestMatch(matches, topLevelEquipId, matrixRevenueStreamId, manufacturerId) {
            var filtered = matches.filter(function(m) {
                if (m.equip_category_id) {
                    if (!topLevelEquipId) return false;
                    if (String(m.equip_category_id) !== String(topLevelEquipId)) return false;
                }
                if (m.revenue_stream_id) {
                    if (!matrixRevenueStreamId) return false;
                    if (String(m.revenue_stream_id) !== String(matrixRevenueStreamId)) return false;
                }
                return true;
            });

            if (filtered.length === 0) return null;
            return selectBestByManufacturer(filtered, manufacturerId);
        }

        function selectBestByManufacturer(matches, manufacturerId) {
            if (matches.length === 1) return matches[0];
            if (manufacturerId) {
                var mfgMatch = matches.find(function(m) {
                    return m.manufacturer_id && String(m.manufacturer_id) === String(manufacturerId);
                });
                if (mfgMatch) return mfgMatch;
            }
            var noMfgMatch = matches.find(function(m) { return !m.manufacturer_id; });
            return noMfgMatch || matches[0];
        }

        function getTopLevelEquipId(line) {
            if (line.equip_category_grandparent_id) return line.equip_category_grandparent_id;
            if (line.equip_category_parent_id) return line.equip_category_parent_id;
            return line.equip_category_id;
        }

        /**
         * Get the revenue stream ID at the level used by the matrix
         * Matrix uses the SECOND level (e.g., "Service", "Parts", "Rental", "New Equipment")
         * which is the direct child of "External" (ID: 1) or "Internal" (ID: 2)
         *
         * Known Level 2 IDs (children of External/Internal):
         * External (1) children: Service(5), Rental(6), Parts(7), New Equipment(8), Used Equipment(3), Allied Equipment(4), Other(420)
         * Internal (2) children: Service(12), Rental(13), Parts(14), New Equipment(9), Used Equipment(10), Allied Equipment(11), Freight(16)
         *
         * Strategy: Walk UP the hierarchy until we find a parent that is External(1) or Internal(2),
         * then return that child's ID.
         */
        function getMatrixRevenueStreamId(line) {
            var EXTERNAL_ID = '1';
            var INTERNAL_ID = '2';

            // Build an array of the hierarchy from deepest to shallowest
            // Each entry has {id, parent_id} where parent_id is the next level up
            var levels = [];

            if (line.revenue_stream_id) {
                levels.push({
                    id: String(line.revenue_stream_id),
                    parent_id: line.revenue_stream_parent_id ? String(line.revenue_stream_parent_id) : null
                });
            }
            if (line.revenue_stream_parent_id) {
                levels.push({
                    id: String(line.revenue_stream_parent_id),
                    parent_id: line.revenue_stream_grandparent_id ? String(line.revenue_stream_grandparent_id) : null
                });
            }
            if (line.revenue_stream_grandparent_id) {
                levels.push({
                    id: String(line.revenue_stream_grandparent_id),
                    parent_id: line.revenue_stream_greatgrandparent_id ? String(line.revenue_stream_greatgrandparent_id) : null
                });
            }
            if (line.revenue_stream_greatgrandparent_id) {
                levels.push({
                    id: String(line.revenue_stream_greatgrandparent_id),
                    parent_id: line.revenue_stream_greatgreatgrandparent_id ? String(line.revenue_stream_greatgreatgrandparent_id) : null
                });
            }
            if (line.revenue_stream_greatgreatgrandparent_id) {
                levels.push({
                    id: String(line.revenue_stream_greatgreatgrandparent_id),
                    parent_id: null
                });
            }

            // Find the level whose parent is External(1) or Internal(2)
            for (var i = 0; i < levels.length; i++) {
                var level = levels[i];
                if (level.parent_id === EXTERNAL_ID || level.parent_id === INTERNAL_ID) {
                    return level.id;
                }
            }

            // Fallback: if current level IS External or Internal, can't match at level 1
            if (line.revenue_stream_id) {
                var currentId = String(line.revenue_stream_id);
                if (currentId === EXTERNAL_ID || currentId === INTERNAL_ID) {
                    return null;
                }
            }

            // Last resort: return the highest level that isn't External/Internal
            for (var j = levels.length - 1; j >= 0; j--) {
                var lvl = levels[j];
                if (lvl.id !== EXTERNAL_ID && lvl.id !== INTERNAL_ID) {
                    return lvl.id;
                }
            }

            return line.revenue_stream_id;
        }

        function formatRevenueStream(row) {
            var greatgreatgrandparent = row.revenue_stream_greatgreatgrandparent_name || '';
            var greatgrandparent = row.revenue_stream_greatgrandparent_name || '';
            var grandparent = row.revenue_stream_grandparent_name || '';
            var parent = row.revenue_stream_parent_name || '';
            var child = row.revenue_stream_name || '';

            if (greatgreatgrandparent) return greatgreatgrandparent + ' : ' + greatgrandparent;
            if (greatgrandparent) return greatgrandparent + ' : ' + grandparent;
            if (grandparent) return grandparent + ' : ' + parent;
            if (parent) return parent + ' : ' + child;
            return child;
        }

        function formatEquipCategory(row) {
            if (row.equip_category_grandparent_name) return row.equip_category_grandparent_name;
            if (row.equip_category_parent_name) return row.equip_category_parent_name;
            return row.equip_category_name || '';
        }

        function formatTranType(type) {
            var types = { 'SalesOrd': 'SO', 'CustInvc': 'INV', 'CustCred': 'CM' };
            return types[type] || type;
        }

        function formatDate(dateValue) {
            if (!dateValue) return '';
            try {
                var date = new Date(dateValue);
                return (date.getMonth() + 1) + '/' + date.getDate() + '/' + date.getFullYear();
            } catch (e) {
                return String(dateValue);
            }
        }

        /**
         * Format date parameter for SuiteQL query (MM/DD/YYYY)
         * Handles Date objects from script parameters
         */
        function formatDateForQuery(dateValue) {
            if (!dateValue) return '';
            try {
                var date;
                if (dateValue instanceof Date) {
                    date = dateValue;
                } else {
                    date = new Date(dateValue);
                }
                var month = date.getMonth() + 1;
                var day = date.getDate();
                var year = date.getFullYear();
                return month + '/' + day + '/' + year;
            } catch (e) {
                log.error('formatDateForQuery', 'Error formatting date: ' + e.toString());
                return String(dateValue);
            }
        }

        function formatExpectedRepNames(validation) {
            if (!validation.expected_rep_names || validation.expected_rep_names.length === 0) return '';
            return validation.expected_rep_names.join(', ');
        }

        return {
            getInputData: getInputData,
            map: map,
            reduce: reduce,
            summarize: summarize
        };
    });
