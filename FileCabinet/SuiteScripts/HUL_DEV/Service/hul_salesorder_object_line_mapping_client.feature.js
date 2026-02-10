/**
 * @NApiVersion 2.x
 * @NScriptType ClientScript
 * @NModuleScope SameAccount
 * author: Jeremy Cady
 * Initial Date: 01/2026
 * Revision Date: 02/10/2026
 * Version: 1.3 - Added dual field trigger (Fleet No and Object)
 *
 * Purpose: Auto-populates line item fields when an Object (equipment/fleet)
 * is selected in either custcol_sna_hul_fleet_no or custcol_sna_object field.
 * Also syncs the two fields so they always match.
 */
define(["require", "exports", "N/search"], function (require, exports, search) {
    "use strict";
    // Sublist configuration
    var ITEM_SUBLIST_ID = 'item';
    var FLEET_NO_FIELD_ID = 'custcol_sna_hul_fleet_no';
    var OBJECT_FIELD_ID = 'custcol_sna_object';
    // Object record type
    var OBJECT_RECORD_TYPE = 'customrecord_sna_objects';
    // Field mappings: source (Object record) -> destination (line item)
    var FIELD_MAPPINGS = [
        { src: 'custrecord_sna_fleet_code', dst: 'custcol_sna_po_fleet_code' },
        { src: 'cseg_sna_hul_eq_seg', dst: 'cseg_sna_hul_eq_seg' },
        { src: 'custrecord_sna_description', dst: 'description' },
        { src: 'cseg_hul_mfg', dst: 'cseg_hul_mfg' }
    ];
    // Columns to retrieve from Object record
    var LOOKUP_COLUMNS = FIELD_MAPPINGS.map(function (m) { return m.src; });
    /**
     * Unwraps NetSuite's inconsistent value formats
     * Handles: arrays, objects with .value property, raw values
     */
    var unwrap = function (value) {
        if (value == null) {
            return null;
        }
        if (Array.isArray(value)) {
            if (value.length === 0) {
                return null;
            }
            var first = value[0];
            if (first && typeof first === 'object' && 'value' in first) {
                return first.value;
            }
            return first;
        }
        if (typeof value === 'object' && value && 'value' in value) {
            return value.value;
        }
        return value;
    };
    /**
     * Populates line item fields based on selected Object record
     * Also syncs the partner field (Fleet No <-> Object)
     */
    var populateFieldsFromObject = function (rec, objectId, sourceFieldId) {
        console.log('[OBJECT-LINE-MAPPER] Looking up Object ID:', objectId);
        console.log('[OBJECT-LINE-MAPPER] Source field:', sourceFieldId);
        console.log('[OBJECT-LINE-MAPPER] Columns requested:', LOOKUP_COLUMNS);
        // Sync the partner field
        var partnerFieldId = sourceFieldId === FLEET_NO_FIELD_ID ? OBJECT_FIELD_ID : FLEET_NO_FIELD_ID;
        try {
            rec.setCurrentSublistValue({
                sublistId: ITEM_SUBLIST_ID,
                fieldId: partnerFieldId,
                value: objectId,
                ignoreFieldChange: true
            });
            console.log("[OBJECT-LINE-MAPPER] Synced partner field ".concat(partnerFieldId, " = ").concat(objectId));
        }
        catch (syncError) {
            console.error("[OBJECT-LINE-MAPPER] FAILED to sync ".concat(partnerFieldId, ":"), syncError);
        }
        var lookup = search.lookupFields({
            type: OBJECT_RECORD_TYPE,
            id: String(objectId),
            columns: LOOKUP_COLUMNS
        });
        console.log('[OBJECT-LINE-MAPPER] Raw lookup result:', JSON.stringify(lookup, null, 2));
        FIELD_MAPPINGS.forEach(function (mapping) {
            var rawVal = lookup[mapping.src];
            var val = unwrap(rawVal);
            console.log("[OBJECT-LINE-MAPPER] Mapping: ".concat(mapping.src, " -> ").concat(mapping.dst));
            console.log('[OBJECT-LINE-MAPPER]   Raw value:', rawVal);
            console.log('[OBJECT-LINE-MAPPER]   Unwrapped value:', val);
            if (val != null) {
                try {
                    rec.setCurrentSublistValue({
                        sublistId: ITEM_SUBLIST_ID,
                        fieldId: mapping.dst,
                        value: val,
                        ignoreFieldChange: true
                    });
                    console.log("[OBJECT-LINE-MAPPER]   SUCCESS: Set ".concat(mapping.dst, " = ").concat(val));
                }
                catch (setError) {
                    console.error("[OBJECT-LINE-MAPPER]   FAILED to set ".concat(mapping.dst, ":"), setError);
                }
            }
            else {
                console.log('[OBJECT-LINE-MAPPER]   SKIPPED: No value to set');
            }
        });
    };
    /**
     * Field Changed entry point
     * Triggers when Fleet No or Object field is changed on item sublist
     */
    var fieldChanged = function (ctx) {
        try {
            // Skip if flagged to ignore
            if (!ctx || ctx.ignoreFieldChange === true) {
                return;
            }
            // Only process item sublist
            if (ctx.sublistId !== ITEM_SUBLIST_ID) {
                return;
            }
            // Only process Fleet No or Object field changes
            if (ctx.fieldId !== FLEET_NO_FIELD_ID && ctx.fieldId !== OBJECT_FIELD_ID) {
                return;
            }
            console.log('[OBJECT-LINE-MAPPER] fieldChanged triggered for field:', ctx.fieldId);
            var rec = ctx.currentRecord;
            if (!rec) {
                console.log('[OBJECT-LINE-MAPPER] No current record, exiting');
                return;
            }
            var objectId = unwrap(rec.getCurrentSublistValue({
                sublistId: ITEM_SUBLIST_ID,
                fieldId: ctx.fieldId
            }));
            console.log('[OBJECT-LINE-MAPPER] Selected Object ID:', objectId);
            // No object selected, nothing to do
            if (!objectId) {
                console.log('[OBJECT-LINE-MAPPER] No object selected, exiting');
                return;
            }
            populateFieldsFromObject(rec, objectId, ctx.fieldId);
        }
        catch (e) {
            // Dispatcher pattern: fail open, but log for debugging
            console.error('[OBJECT-LINE-MAPPER] fieldChanged error:', e);
        }
    };
    return {
        fieldChanged: fieldChanged
    };
});
