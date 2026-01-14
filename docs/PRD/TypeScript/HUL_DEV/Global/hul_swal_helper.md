# hul_swal_helper

Lightweight SweetAlert2 loader/helper that injects the library if needed and provides a `show()` wrapper.

## Script Info
- Type: Library module
- API: NApiVersion 2.x
- Module scope: Public
- Source: `TypeScript/HUL_DEV/Global/hul_swal_helper.ts`

## Purpose
- Ensure SweetAlert2 (`window.Swal`) is available on NetSuite pages.
- Injects the SweetAlert2 script once and waits for readiness.

## Core API
- `ready()`: Loads SweetAlert2 and sets `window.hulSwalReady`.
- `show(options)`: Ensures library is loaded then calls `window.Swal.fire`.

## Loading Behavior
- Script URL is hardcoded in `SWAL_MEDIA_URL`.
- Uses `window.hulSwalLoading` to prevent duplicate injections.
- Waits up to 10 seconds for `window.Swal` to appear.
- Errors are swallowed to avoid blocking UI flows.

## Notes
- This is a simpler helper than `hul_swal.ts` and may predate it.
- `show()` does not return the SweetAlert2 result; it is fire-and-forget.
