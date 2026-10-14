# Bedrock Server Manager API for Minecraft

Reusable Bedrock scripting client for Bedrock Server Manager.

Generated against the canonical BSM OpenAPI from backend **dev**. The pack exposes **96 HTTP operations** plus the native BSM WebSocket through a cross-addon ScriptEvent bus.

## BDS requirements
Enable Beta APIs and add `@minecraft/server-net` to `config/default/permissions.json`.

## Configuration
`variables.json`: `bsmApiUrl` (and optional `bsmApiWsUrl`).

`secrets.json`: `bsmApiUsername`, `bsmApiPassword`.

Install `bsm_addon_api_bridge.py` as a BSM plugin and restart BSM. JWTs remain in this pack's memory only.

## Add-on IPC
Requests use `bsmapi:request`; responses use `bsmapi:response`; WebSocket messages use `bsmapi:event`; connection state uses `bsmapi:status`. Payloads are chunked automatically to stay below ScriptEvent message limits.

The complete operation catalog is included as `raw/scripts/core/contract.js`.


## OpenAPI model support

This build is generated from the backend-owned canonical OpenAPI export. It includes **96 operations** and **149 component schemas**. Request bodies and parameters are validated against their OpenAPI schemas before transmission, and JSON responses are validated against documented response schemas. The public client exposes `operations`, `models`, `call(operationId, args)`, `validateModel(name, value)`, and `createModel(name, value)`.

Transfer UI consumes BSM through operation IDs over ScriptEvent IPC; it does not construct native BSM HTTP routes itself.

Regenerate the catalog with `python scripts/generate_bsm_contract.py /path/to/backend-openapi.json`. Export with `python -m bedrock_server_manager.web.contract --output /tmp/backend-openapi.json`. Use `python scripts/generate_bsm_contract.py /tmp/backend-openapi.json --check` to verify the catalog. Operation IDs follow the current backend; old path-derived IDs are no longer accepted.

Run mocked transport tests with `node --experimental-vm-modules --test addons/bsm_api_client/tests/client.test.mjs`. These tests do not require a running Bedrock server.

## Live contract discovery

The bundled contract remains the startup baseline. Set the boolean `bsmApiDiscoverContract` to `true` in `variables.json` to refresh it at startup, call `BsmApi.refreshContract()`, send `{ "action": "refresh-contract" }` on `bsmapi:control`, or issue the reserved IPC operation `refresh_contract`.

Discovery reads authenticated `/openapi.json`, including plugin operations present in that document. A valid catalog replaces operations and component models together. An invalid or failed refresh leaves the active catalog intact. `contractStatus` and `bsmapi:status` report source, backend version, added/missing operations, refresh time, and errors. Discovery supports GET/POST/PUT/PATCH/DELETE with JSON and the client's existing form body handling; multipart/file upload operations need a separate transport implementation.

## Transport and diagnostics

Chunked output is paced at four frames per tick with a bounded ordered queue. Frames are sized after JSON escaping and UTF-8 encoding; Unicode text stays within the 2,048-byte frame budget. Outgoing depth, queued bytes, overloads, and send errors appear in status.

Chunk receivers bound message/chunk sizes and incomplete stream counts, reject malformed or conflicting frames, and expire abandoned streams. Replies up to 1,400 characters use `bsmapi:response:direct`; larger replies use chunked `bsmapi:response`.

IPC HTTP requests use two active slots and at most 64 waiters. Waiting requests expire after 400 ticks; overflow receives an explicit error. Incoming tick-queue overload receives a 429 response when the request ID is available. Status includes active/waiting HTTP requests and queue metrics.

Use a BSM account with permissions appropriate for the installed addons. Operator-only Minecraft provider actions are checked locally, while BSM enforces that account's HTTP permissions. Other installed scripts can observe or emit ScriptEvents; this bus is not a security boundary between addons.

## IPC deadlines and cancellation

Requests may include a `consumerId` and an absolute Unix-millisecond `deadline` in the payload. The client checks the deadline before acquiring a slot, after authentication, immediately before each HTTP dispatch/retry, and when processing the response. Requests without a deadline receive a 20-second budget from receipt for compatibility; consumers should supply the absolute deadline so time spent assembling/queuing messages is included.

Cancel a queued request with `{ "action": "cancel-request", "consumerId": "your-addon", "requestId": "request-stream-id" }` on `bsmapi:control`. Consumer/request IDs must match. Cancellation arriving before request assembly is remembered temporarily. Once HTTP has been dispatched, cancellation cannot undo the operation: a late/expired result explicitly says the operation may have completed. Do not blindly retry a modifying request after an uncertain dispatch result.


The bundled operation catalog now includes the backend's event catalog/activity
and web runtime status/shutdown contracts. Call them by operation ID through
`BSM_API.call`/the existing IPC operation interface. They require administrator
credentials. Submit `{body:{}}` to `shutdown_web_runtime`; its 202 receipt means
cleanup was accepted, not completed, and has no background-task ID. Core event
WebSocket envelopes retain `event_id` and `correlation_id`. Custom HTTP event
triggers must name a declared custom event; built-in/private events are not
external emission targets. Regenerate using the canonical backend exporter and
`scripts/generate_bsm_contract.py` before rebuilding behavior packs.


## Backend diagnostics

Administrator accounts can call `get_application_diagnostics`, `get_subsystem_diagnostics` (with `path: {subsystem: "runtime"}`), `get_diagnostic_history`, `get_diagnostic_runs`, `get_diagnostic_trace`, `get_diagnostic_report`, and `compare_diagnostic_snapshots` through the existing operation-ID interface.

History and trace accept `query: {limit: 50, cursor: "…"}`; continue only with a cursor returned by the backend. History also supports subsystem, instance, owner, outcome, code, operation, and correlation filters. A trace may have unavailable event/task/history sources; inspect the availability flags independently. Snapshot comparison sends `body: {before, after}`; counter deltas depend on matching instance IDs.

These are on-demand metadata operations, not Transfer UI lifecycle responsibilities. Null readings and unresolved plugin statuses remain unchanged; do not infer zero or Loaded. The backend enforces administrator access. Report responses can be larger than a typical ScriptEvent reply and use the existing bounded chunked IPC transport; failed or oversized responses must not be treated as complete reports.
