# Bedrock Server Manager API for Minecraft

Reusable Bedrock scripting client for Bedrock Server Manager.

Generated against the supplied official BSM OpenAPI **4.0.0b3.dev4**. The pack exposes **82 HTTP operations** plus the native BSM WebSocket through a cross-addon ScriptEvent bus.

## BDS requirements
Enable Beta APIs and add `@minecraft/server-net` to `config/default/permissions.json`.

## Configuration
`variables.json`: `bsmApiUrl` (and optional `bsmApiWsUrl`).

`secrets.json`: `bsmApiUsername`, `bsmApiPassword`.

Install `bsm_api_bridge.py` as a BSM plugin and restart BSM. JWTs remain in this pack's memory only.

## Add-on IPC
Requests use `bsmapi:request`; responses use `bsmapi:response`; WebSocket messages use `bsmapi:event`; connection state uses `bsmapi:status`. Payloads are chunked automatically to stay below ScriptEvent message limits.

The complete operation catalog is included as `openapi_operations.json`.


## OpenAPI model support

This build is generated from the supplied official BSM OpenAPI 4.0.0b3.dev4 contract. It includes **82 operations** and **60 component schemas**. Request bodies and parameters are validated against their OpenAPI schemas before transmission, and JSON responses are validated against documented response schemas. The public client exposes `operations`, `models`, `call(operationId, args)`, `validateModel(name, value)`, and `createModel(name, value)`.

Transfer UI consumes BSM through operation IDs over ScriptEvent IPC; it does not construct native BSM HTTP routes itself.
