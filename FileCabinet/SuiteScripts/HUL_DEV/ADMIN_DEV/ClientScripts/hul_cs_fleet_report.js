/**
 * @NApiVersion 2.1
 * @NScriptType ClientScript
 * @NModuleScope SameAccount
 */

/**
 * Fleet Report Client Script - FIXED
 * Properly handles equipment search field validation
 */

define(['N/format', 'N/search', 'N/ui/dialog'],
    function(format, search, dialog) {
        
        /**
         * Page Init - Set up initial state
         */
        function pageInit(context) {
            // Set up field change listeners
            var currentRec = context.currentRecord;
            
            // If equipment is selected, update the date range intelligently
            var equipmentId = currentRec.getValue('custpage_equipment');
            if (equipmentId) {
                setSmartDateRange(currentRec, equipmentId);
            }
        }
        
        /**
         * Field Changed - Handle dynamic field updates
         */
        function fieldChanged(context) {
            var currentRec = context.currentRecord;
            var fieldName = context.fieldId;
            
            if (fieldName === 'custpage_customer_filter') {
                // Reload form with new customer filter
                var customerId = currentRec.getValue('custpage_customer_filter');
                if (customerId) {
                    // Submit the form to reload with filtered equipment
                    window.onbeforeunload = null; // Disable any warning
                    document.forms[0].submit();
                }
            }
            
            if (fieldName === 'custpage_equipment') {
                // Update date range based on equipment selection
                var equipmentId = currentRec.getValue('custpage_equipment');
                if (equipmentId) {
                    setSmartDateRange(currentRec, equipmentId);
                    showEquipmentInfo(equipmentId);
                }
            }
            
            if (fieldName === 'custpage_date_from' || fieldName === 'custpage_date_to') {
                validateDateRange(currentRec);
            }
        }
        
        /**
         * Save Record - Validate before submission
         * FIXED: Now properly handles search field
         */
        function saveRecord(context) {
            var currentRec = context.currentRecord;
            
            // Check BOTH dropdown and search field
            var equipmentId = currentRec.getValue('custpage_equipment');
            var equipmentSearchText = currentRec.getValue('custpage_equipment_search');
            
            // If neither equipment selected nor search text provided
            if (!equipmentId && !equipmentSearchText) {
                dialog.alert({
                    title: 'Missing Equipment',
                    message: 'Please select an equipment from the dropdown OR type a fleet code/serial number in the search field.'
                });
                return false;
            }
            
            // If only search text is provided (no dropdown selection), that's OK
            // The server-side script will handle finding the equipment
            if (!equipmentId && equipmentSearchText) {
                console.log('Using equipment search: ' + equipmentSearchText);
                // Continue with submission - server will find the equipment
            }
            
            // Validate date range
            var startDate = currentRec.getValue('custpage_date_from');
            var endDate = currentRec.getValue('custpage_date_to');
            
            if (!startDate || !endDate) {
                dialog.alert({
                    title: 'Missing Dates',
                    message: 'Please select both start and end dates.'
                });
                return false;
            }
            
            if (startDate > endDate) {
                dialog.alert({
                    title: 'Invalid Date Range',
                    message: 'End date must be after start date.'
                });
                return false;
            }
            
            // Check date range span
            var daysDiff = getDaysDifference(startDate, endDate);
            if (daysDiff > 365) {
                var confirmResult = confirm(
                    'You have selected a date range of ' + daysDiff + ' days. ' +
                    'This may take longer to process. Continue?'
                );
                return confirmResult;
            }
            
            return true;
        }
        
        /**
         * Sets intelligent date range based on equipment history
         */
        function setSmartDateRange(currentRec, equipmentId) {
            // For MVP, default to current month
            var today = new Date();
            var firstOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
            
            // Only update if fields are empty
            if (!currentRec.getValue('custpage_date_from')) {
                currentRec.setValue({
                    fieldId: 'custpage_date_from',
                    value: firstOfMonth
                });
            }
            
            if (!currentRec.getValue('custpage_date_to')) {
                currentRec.setValue({
                    fieldId: 'custpage_date_to',
                    value: today
                });
            }
        }
        
        /**
         * Shows equipment information in a popup
         */
        function showEquipmentInfo(equipmentId) {
            // Could be enhanced to show last service date, hour meter, etc.
            console.log('Equipment selected:', equipmentId);
        }
        
        /**
         * Validates the selected date range
         */
        function validateDateRange(currentRec) {
            var startDate = currentRec.getValue('custpage_date_from');
            var endDate = currentRec.getValue('custpage_date_to');
            
            if (startDate && endDate) {
                var daysDiff = getDaysDifference(startDate, endDate);
                
                // Add visual feedback for date range
                if (daysDiff > 365) {
                    console.warn('Date range exceeds 1 year: ' + daysDiff + ' days');
                } else if (daysDiff > 180) {
                    console.info('Large date range selected: ' + daysDiff + ' days');
                }
            }
        }
        
        /**
         * Calculate days between two dates
         */
        function getDaysDifference(startDate, endDate) {
            var start = new Date(startDate);
            var end = new Date(endDate);
            var diffTime = Math.abs(end - start);
            var diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
            return diffDays;
        }
        
        /**
         * Post-sourcing function for dynamic field population
         */
        function postSourcing(context) {
            // Could be used to populate additional fields
            // based on equipment selection
        }
        
        return {
            pageInit: pageInit,
            fieldChanged: fieldChanged,
            saveRecord: saveRecord,
            postSourcing: postSourcing
        };
    }
);
