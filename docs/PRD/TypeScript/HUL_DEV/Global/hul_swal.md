# hul_swal

Public SweetAlert2 helper library for NetSuite Client Scripts, with lazy loading, generic alert/confirm/toast APIs, and common business-specific message wrappers.

## Script Info
- Type: Library module
- API: NApiVersion 2.x
- Module scope: Public
- Source: `TypeScript/HUL_DEV/Global/hul_swal.ts`

## Purpose
- Load SweetAlert2 from the NetSuite File Cabinet only once.
- Provide a consistent, reusable API for modal dialogs and toasts.
- Expose business-specific alert wrappers used across scripts.

## Loading Strategy
- Primary source: hardcoded media URL (`SWAL_MEDIA_URL`).
- Fallbacks:
  - Cache-busted media URL.
  - File Cabinet path `/SuiteScripts/HUL_DEV/Third_Party_Applications/sweetalert2.all.js`.
  - Same path prefixed with `window.location.origin`.
- Ensures a single `<script>` tag (`hul-swal2-js`) and marks it loaded via `data-hul-loaded`.

## Core API
- `setSrc(url)`: Override the SweetAlert2 source URL at runtime.
- `ready()` / `ensureSwal()`: Load SweetAlert2 if needed.
- `preload()`: Fire-and-forget loader for `pageInit`.
- `isReady()`: Boolean readiness check.
- `show(options)`: Main modal API with sensible defaults.
- `alert(input)`: Simple alert convenience wrapper.
- `confirm(options)`: Yes/No modal returning a boolean.
- `toast(message, opts)`: Lightweight toast notification.

## Z-Index Handling
- SweetAlert2 v11 does not support `zIndex` directly.
- The module injects a CSS rule to force `.swal2-container` z-index when `zIndex` is provided.

## Business Wrappers
- `doNotInvoiceDummyItemSwalMessage()`
- `partsIsEligibleSwalMessage(altPartName?)`
- `customerCreditCardRequiredMessage()`

## Notes
- `show()` falls back to native `alert()` if SweetAlert2 fails to load.
- Designed for NetSuite pages (defaults: `heightAuto: false`, `allowOutsideClick: false`).
