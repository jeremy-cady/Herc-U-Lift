/**
 * @NApiVersion 2.1
 * @NModuleScope Public
 * @description Common search and filtering utilities for admin operations
 */
define(['N/search', 'N/format'], function(search, format) {

    /**
     * Creates a search filter for datetime fields with flexible date range options
     * @param {string} fieldId - The field ID to filter on
     * @param {Object} options - Filter options
     * @param {Date|string} options.startDate - Start date (Date object or string)
     * @param {Date|string} options.endDate - End date (Date object or string)
     * @param {string} options.operator - Search operator (e.g., 'within', 'onorbefore', 'onorafter')
     * @returns {Object} NetSuite search filter
     */
    function createDateTimeFilter(fieldId, options) {
        options = options || {};

        var operator = options.operator || search.Operator.WITHIN;
        var startDate = options.startDate;
        var endDate = options.endDate;

        // Convert strings to Date objects if needed
        if (typeof startDate === 'string') {
            startDate = format.parse({
                value: startDate,
                type: format.Type.DATETIME
            });
        }

        if (typeof endDate === 'string') {
            endDate = format.parse({
                value: endDate,
                type: format.Type.DATETIME
            });
        }

        // Create filter based on operator
        if (operator === search.Operator.WITHIN && startDate && endDate) {
            return search.createFilter({
                name: fieldId,
                operator: operator,
                values: [startDate, endDate]
            });
        } else if (startDate || endDate) {
            return search.createFilter({
                name: fieldId,
                operator: operator,
                values: startDate || endDate
            });
        }

        return null;
    }

    /**
     * Executes a search and returns all results (handles pagination automatically)
     * @param {Object} searchObj - NetSuite search object
     * @param {number} maxResults - Maximum results to return (default: 1000)
     * @returns {Array} Array of search result objects
     */
    function getAllResults(searchObj, maxResults) {
        maxResults = maxResults || 1000;
        var results = [];
        var resultSet = searchObj.run();
        var searchIndex = 0;
        var pageSize = 1000;

        do {
            var resultSlice = resultSet.getRange({
                start: searchIndex,
                end: searchIndex + pageSize
            });

            if (!resultSlice || resultSlice.length === 0) {
                break;
            }

            results = results.concat(resultSlice);
            searchIndex += pageSize;

        } while (resultSlice.length === pageSize && results.length < maxResults);

        return results.slice(0, maxResults);
    }

    /**
     * Creates a dynamic filter array from an object
     * @param {Object} filterObj - Object with field names as keys and filter values
     * @example
     * createFiltersFromObject({
     *   custrecord_status: 'Active',
     *   custrecord_date: { operator: 'onorafter', value: new Date() }
     * })
     * @returns {Array} Array of NetSuite search filters
     */
    function createFiltersFromObject(filterObj) {
        var filters = [];

        for (var field in filterObj) {
            if (!filterObj.hasOwnProperty(field)) continue;

            var filterValue = filterObj[field];
            var filter;

            if (typeof filterValue === 'object' && filterValue.operator) {
                filter = search.createFilter({
                    name: field,
                    operator: filterValue.operator,
                    values: filterValue.value
                });
            } else {
                filter = search.createFilter({
                    name: field,
                    operator: search.Operator.IS,
                    values: filterValue
                });
            }

            if (filter) {
                filters.push(filter);
            }
        }

        return filters;
    }

    /**
     * Searches records by date range
     * @param {Object} options - Search options
     * @param {string} options.type - Record type to search
     * @param {string} options.dateField - Date field to filter on
     * @param {Date|string} options.startDate - Start date
     * @param {Date|string} options.endDate - End date
     * @param {Array} options.additionalFilters - Additional filters (optional)
     * @param {Array} options.columns - Search columns (optional)
     * @returns {Array} Search results
     */
    function searchByDateRange(options) {
        var filters = options.additionalFilters || [];

        var dateFilter = createDateTimeFilter(options.dateField, {
            startDate: options.startDate,
            endDate: options.endDate,
            operator: search.Operator.WITHIN
        });

        if (dateFilter) {
            filters.push(dateFilter);
        }

        var searchObj = search.create({
            type: options.type,
            filters: filters,
            columns: options.columns || []
        });

        return getAllResults(searchObj, options.maxResults);
    }

    return {
        createDateTimeFilter: createDateTimeFilter,
        getAllResults: getAllResults,
        createFiltersFromObject: createFiltersFromObject,
        searchByDateRange: searchByDateRange
    };
});
