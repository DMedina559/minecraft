# Transfer UI

Transfer UI 3.0 provides in-game server navigation and transfers, with an optional generic Provider API. The compass opens the network menu. Transfer UI contains no BSM-specific HTTP or server-management code.

## Features

- Nested folders, destinations, information pages, announcements, draft publishing, backups, and an audit log.
- Favorites, recent destinations, a home server, and player confirmation preferences accessible from the main menu.
- Paginated destination, player, relationship, group, and search screens.
- Search by name/tag, region, and game mode; filter availability/capacity; sort by name, population, or network order.
- Live provider destination details with population, observation age, provider health, and endpoint diagnostics.
- Hostname/IP and explicit NetherNet transfers; optional manual connection entry.
- Generic providers for destinations, presence, relationships, groups, policies, and actions.

## Installation

Use the pack in `raw/`, whose manifest lists the required engine and module versions. Enable the Beta APIs world experiment. `@minecraft/server-admin` is required for transfers. Ensure the host supports the manifest's Script API versions, including CustomForm and observable UI values.

Join with a compass to open the menu. Operators can open **Admin Navigation** to edit destinations and settings. Edits remain in the draft until **Publish Draft**. BSM-specific configuration belongs to the separate `transfer_ui_bsm` pack; Transfer UI needs no BSM entries in `variables.json`.

## Transfer rules

Every dispatch checks the current destination, requirements, maintenance, capacity, and endpoint availability again after policies finish. Removed destinations and unresolved endpoints cannot be used. Manual connections are explicit requests and still pass through transfer policies.

Policy timeout behavior is configurable in **Hub Settings**. The default is **deny**. Choosing allow permits transfers when policies do not respond, but an already received denial remains binding. Policy redirects pass through the same destination checks.

Providers that become stale or report degraded/connecting health retain their visible last-known state, but their destinations are unavailable for transfer until healthy again. History records dispatched transfers, not failed attempts; dispatch does not prove the remote server accepted the player.

## Provider API

Protocol `1`, API `1.0.0` remain unchanged. Register using `transferui:provider:register` with an ID, capabilities, and optional `sessionId`. A new session resets old state and revision counters. Re-registration within the same session preserves health.

Use namespaced destination IDs when targeting a specific provider: `provider:<providerId>:<destinationId>`. Player/group join actions resolve destinations within their source provider.

Destination records accept `order` (ascending), requirements, hostname/port or a NetherNet target, capacity, metadata, and health. Metadata `endpointResolved: false` disables transfers while a provider resolves an endpoint.

Snapshots can be grouped with `transferui:provider:transaction:begin` and `...:commit`. After committing, Transfer UI emits `transferui:provider:transaction:result` with `providerId`, `transactionId`, and `ok`. Revisions become authoritative at commit; abandoned transactions do not consume them.

Chunked JSON frames contain `{__tui:1,id,chunk,total,data}`. Each independently installable pack includes the same bounded transport implementation: 1,400 characters per data chunk, at most 256 chunks/262,144 message characters, 128 incomplete streams, and a 30-second expiry. Out-of-order chunks and identical duplicates are supported; conflicting duplicates and changing stream shapes are rejected. ScriptEvents are a cooperative addon bus, not isolation from other installed scripts.

## Development

Runtime code is separated into storage, transfer dispatch, provider protocol, catalog helpers, and UI entry points.

Run the transport and cross-pack runtime tests, plus the BSM client tests:

```sh
node --experimental-vm-modules --test addons/transfer_ui/tests/*.test.mjs addons/bsm_api_client/tests/client.test.mjs
```

These tests use simulated Bedrock APIs and HTTP/WebSocket transports. Verify actual CustomForm behavior, permissions, and remote transfers on a compatible Bedrock server before release.
