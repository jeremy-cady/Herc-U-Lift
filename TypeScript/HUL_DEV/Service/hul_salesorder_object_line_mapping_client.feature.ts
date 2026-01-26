/* global define */
declare function define<T>(
    deps: string[],
    factory: (...args: any[]) => T
): void;

define(['N/search'], (search: any) => {
    // Assumption: Equipment Sales Form uses standard 'item' sublist
    const ITEM_SUBLIST_ID = 'item';
    const OBJECT_FIELD_ID = 'custcol_sna_hul_fleet_no';

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

    const fieldChanged = (ctx: any): void => {
        try {
            if (!ctx || ctx.ignoreFieldChange === true) {
                return;
            }

            if (ctx.sublistId !== ITEM_SUBLIST_ID) {
                return;
            }

            if (ctx.fieldId !== OBJECT_FIELD_ID) {
                return;
            }

            const rec = ctx.currentRecord;
            if (!rec) {
                return;
            }

            const objectId = unwrap(
                rec.getCurrentSublistValue({
                    sublistId: ITEM_SUBLIST_ID,
                    fieldId: OBJECT_FIELD_ID
                })
            );

            if (!objectId) {
                return;
            }

            const lookup = search.lookupFields({
                type: 'customrecord_sna_objects',
                id: String(objectId),
                columns: [
                    'custrecord_sna_fleet_code',
                    'cseg_sna_hul_eq_seg',
                    'custrecord_sna_description',
                    'cseg_hul_mfg'
                ]
            }) as Record<string, unknown>;

            const mappings: Array<{ src: string; dst: string }> = [
                { src: 'custrecord_sna_fleet_code', dst: 'custcol_sna_po_fleet_code' },
                { src: 'cseg_sna_hul_eq_seg', dst: 'cseg_sna_hul_eq_seg' },
                { src: 'custrecord_sna_description', dst: 'description' },
                { src: 'cseg_hul_mfg', dst: 'cseg_hul_mfg' }
            ];

            mappings.forEach((m) => {
                const val = unwrap(lookup[m.src]);
                if (val != null) {
                    rec.setCurrentSublistValue({
                        sublistId: ITEM_SUBLIST_ID,
                        fieldId: m.dst,
                        value: val,
                        ignoreFieldChange: true
                    });
                }
            });
        } catch {
            // Dispatcher pattern: fail open
        }
    };

    return {
        fieldChanged
    };
});