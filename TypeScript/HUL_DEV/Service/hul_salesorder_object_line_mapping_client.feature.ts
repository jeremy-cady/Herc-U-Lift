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

import { EntryPoints } from 'N/types';
import * as search from 'N/search';

// Sublist configuration
const ITEM_SUBLIST_ID = 'item';
const FLEET_NO_FIELD_ID = 'custcol_sna_hul_fleet_no';
const OBJECT_FIELD_ID = 'custcol_sna_object';

// Object record type
const OBJECT_RECORD_TYPE = 'customrecord_sna_objects';

// Field mappings: source (Object record) -> destination (line item)
const FIELD_MAPPINGS: Array<{ src: string; dst: string }> = [
    { src: 'custrecord_sna_fleet_code', dst: 'custcol_sna_po_fleet_code' },
    { src: 'cseg_sna_hul_eq_seg', dst: 'cseg_sna_hul_eq_seg' },
    { src: 'custrecord_sna_description', dst: 'description' },
    { src: 'cseg_hul_mfg', dst: 'cseg_hul_mfg' }
];

// Columns to retrieve from Object record
const LOOKUP_COLUMNS: string[] = FIELD_MAPPINGS.map((m) => m.src);

/**
 * Unwraps NetSuite's inconsistent value formats
 * Handles: arrays, objects with .value property, raw values
 */
const unwrap = (value: unknown): string | number | null => {
    if (value == null) {
        return null;
    }

    if (Array.isArray(value)) {
        if (value.length === 0) {
            return null;
        }

        const first = value[0] as any;
        if (first && typeof first === 'object' && 'value' in first) {
            return first.value;
        }

        return first as any;
    }

    if (typeof value === 'object' && value && 'value' in (value as any)) {
        return (value as any).value;
    }

    return value as any;
};

/**
 * Populates line item fields based on selected Object record
 * Also syncs the partner field (Fleet No <-> Object)
 */
const populateFieldsFromObject = (rec: any, objectId: string | number, sourceFieldId: string): void => {
    console.log('[OBJECT-LINE-MAPPER] Looking up Object ID:', objectId);
    console.log('[OBJECT-LINE-MAPPER] Source field:', sourceFieldId);
    console.log('[OBJECT-LINE-MAPPER] Columns requested:', LOOKUP_COLUMNS);

    // Sync the partner field
    const partnerFieldId = sourceFieldId === FLEET_NO_FIELD_ID ? OBJECT_FIELD_ID : FLEET_NO_FIELD_ID;
    try {
        rec.setCurrentSublistValue({
            sublistId: ITEM_SUBLIST_ID,
            fieldId: partnerFieldId,
            value: objectId,
            ignoreFieldChange: true
        });
        console.log(`[OBJECT-LINE-MAPPER] Synced partner field ${partnerFieldId} = ${objectId}`);
    } catch (syncError) {
        console.error(`[OBJECT-LINE-MAPPER] FAILED to sync ${partnerFieldId}:`, syncError);
    }

    const lookup = search.lookupFields({
        type: OBJECT_RECORD_TYPE,
        id: String(objectId),
        columns: LOOKUP_COLUMNS
    }) as Record<string, unknown>;

    console.log('[OBJECT-LINE-MAPPER] Raw lookup result:', JSON.stringify(lookup, null, 2));

    FIELD_MAPPINGS.forEach((mapping) => {
        const rawVal = lookup[mapping.src];
        const val = unwrap(rawVal);

        console.log(`[OBJECT-LINE-MAPPER] Mapping: ${mapping.src} -> ${mapping.dst}`);
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
                console.log(`[OBJECT-LINE-MAPPER]   SUCCESS: Set ${mapping.dst} = ${val}`);
            } catch (setError) {
                console.error(`[OBJECT-LINE-MAPPER]   FAILED to set ${mapping.dst}:`, setError);
            }
        } else {
            console.log('[OBJECT-LINE-MAPPER]   SKIPPED: No value to set');
        }
    });
};

/**
 * Field Changed entry point
 * Triggers when Fleet No or Object field is changed on item sublist
 */
const fieldChanged = (ctx: EntryPoints.Client.fieldChangedContext): void => {
    try {
        // Skip if flagged to ignore
        if (!ctx || (ctx as any).ignoreFieldChange === true) {
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

        const rec = ctx.currentRecord;
        if (!rec) {
            console.log('[OBJECT-LINE-MAPPER] No current record, exiting');
            return;
        }

        const objectId = unwrap(
            rec.getCurrentSublistValue({
                sublistId: ITEM_SUBLIST_ID,
                fieldId: ctx.fieldId
            })
        );

        console.log('[OBJECT-LINE-MAPPER] Selected Object ID:', objectId);

        // No object selected, nothing to do
        if (!objectId) {
            console.log('[OBJECT-LINE-MAPPER] No object selected, exiting');
            return;
        }

        populateFieldsFromObject(rec, objectId, ctx.fieldId);

    } catch (e) {
        // Dispatcher pattern: fail open, but log for debugging
        console.error('[OBJECT-LINE-MAPPER] fieldChanged error:', e);
    }
};

export = {
    fieldChanged
};