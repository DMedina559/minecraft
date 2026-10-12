# Bedrock Server Manager API for Minecraft

Reusable Bedrock scripting client for Bedrock Server Manager.

Generated against the supplied official BSM OpenAPI **4.0.0b5 / current dev**. The pack exposes **85 HTTP operations** plus the native BSM WebSocket through a cross-addon ScriptEvent bus.

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

This build is generated from the supplied official BSM OpenAPI 4.0.0b5 / current dev contract. It includes **85 operations** and **94 component schemas**. Request bodies and parameters are validated against their OpenAPI schemas before transmission, and JSON responses are validated against documented response schemas. The public client exposes `operations`, `models`, `call(operationId, args)`, `validateModel(name, value)`, and `createModel(name, value)`.

Transfer UI consumes BSM through operation IDs over ScriptEvent IPC; it does not construct native BSM HTTP routes itself.

Regenerate the catalog with `python addons/bsm_api_client/tools/generate_contract.py /path/to/backend-openapi.json`. Operation IDs follow the current backend; old path-derived IDs are no longer accepted.

Run mocked transport tests with `node --experimental-vm-modules --test addons/bsm_api_client/tests/client.test.mjs`. These tests do not require a running Bedrock server.

## Live contract discovery

The bundled contract remains the startup baseline. Set the boolean `bsmApiDiscoverContract` to `true` in `variables.json` to refresh it at startup, call `BsmApi.refreshContract()`, send `{ "action": "refresh-contract" }` on `bsmapi:control`, or issue the reserved IPC operation `refresh_contract`.

Discovery reads authenticated `/openapi.json`, including plugin operations present in that document. A valid catalog replaces operations and component models together. An invalid or failed refresh leaves the active catalog intact. `contractStatus` and `bsmapi:status` report source, backend version, added/missing operations, refresh time, and errors. Discovery supports GET/POST/PUT/PATCH/DELETE with JSON and the client's existing form body handling; multipart/file upload operations need a separate transport implementation.

## Transport and diagnostics

Chunk receivers bound message/chunk sizes and incomplete stream counts, reject malformed or conflicting frames, and expire abandoned streams. Replies up to 1,400 characters use `bsmapi:response:direct`; larger replies use chunked `bsmapi:response`.

IPC HTTP requests use two active slots and at most 64 waiters. Waiting requests expire after 400 ticks; overflow receives an explicit error. Incoming tick-queue overload receives a 429 response when the request ID is available. Status includes active/waiting HTTP requests and queue metrics.

Use a BSM account with permissions appropriate for the installed addons. Operator-only Minecraft provider actions are checked locally, while BSM enforces that account's HTTP permissions. Other installed scripts can observe or emit ScriptEvents; this bus is not a security boundary between addons.
