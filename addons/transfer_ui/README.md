# Transfer UI

Transfer UI 3.0 provides in-game server navigation and transfers, with an optional generic Provider API. The compass opens the network menu. Transfer UI contains no BSM-specific HTTP or server-management code.

## Features

- Nested folders, destinations, information pages, announcements, validated drafts, publish previews, backups, and an audit log.
- Favorites, recent destinations, a home server, and player confirmation preferences accessible from the main menu.
- Paginated destination, player, relationship, group, and search screens.
- Search by name/tag, region, and game mode; filter availability/capacity; sort by name, population, or network order.
- Live provider destination details with population, observation age, provider health, and endpoint diagnostics.
- Hostname/IP and explicit NetherNet transfers; optional manual connection entry.
- Generic providers for destinations, presence, relationships, groups, policies, and actions. Provider destinations are grouped into their own navigation folders.
- Move items between folders and edit their sort order.
- One active transfer per player, with policy progress, cancellation, and disconnect cleanup.

## Installation

Use the pack in `raw/`, whose manifest lists the required engine and module versions. Enable the Beta APIs world experiment. `@minecraft/server-admin` is required for transfers. Ensure the host supports the manifest's Script API versions, including CustomForm and observable UI values.

Join with a compass to open the menu. Operators can open **Admin Navigation** to edit destinations and settings. Edits remain in the draft until **Publish Draft**. The publish preview lists added, changed, and removed items plus settings/announcement changes. Draft and provider settings use revisions: a stale form must be reopened before saving. Moving a folder excludes itself and its descendants from parent choices. BSM-specific configuration belongs to the separate `transfer_ui_bsm` pack; Transfer UI needs no BSM entries in `variables.json`.

## Transfer rules

Transfer UI and its BSM provider do not start, stop, or restart servers. The BSM provider contributes destinations and presence; server management belongs to BSM.

Use **Cancel Transfer** while policy checks are pending, or submit `{ "action": "cancel-transfer", "player": "<player-id>" }` on `transferui:control`. Closing the progress form or leaving cancels pending work. Cancellation stops pre-dispatch work; a transfer already dispatched cannot be recalled. Repeated requests do not open overlapping confirmations.

Folder requirements are inherited by every descendant. Navigation, search, favorites, and transfer dispatch enforce the complete parent chain. Missing parents or cycles fail closed.

Every dispatch checks the current destination, requirements, maintenance, capacity, and endpoint availability again after policies finish. Removed destinations and unresolved endpoints cannot be used. Manual connections are explicit requests and still pass through transfer policies.

Policy timeout behavior is configurable in **Hub Settings**. The default is **deny**. Choosing allow permits transfers when policies do not respond, but an already received denial remains binding. Policy redirects pass through the same destination checks.

Providers that become stale or report degraded/connecting health retain their visible last-known state, but their destinations are unavailable for transfer until healthy again. History records dispatched transfers, not failed attempts; dispatch does not prove the remote server accepted the player.

## Provider API

Protocol `1`, API `1.0.0` remain unchanged. Register using `transferui:provider:register` with an ID, capabilities, and optional `sessionId`. A new session resets old state and revision counters. Re-registration within the same session preserves health.

Use namespaced destination IDs when targeting a specific provider: `provider:<providerId>:<destinationId>`. Player/group join actions resolve destinations within their source provider.

Destination records accept `order` (ascending), requirements, hostname/port or a NetherNet target, capacity, metadata, and health. Metadata `endpointResolved: false` disables transfers while a provider resolves an endpoint.

Snapshots can be grouped with `transferui:provider:transaction:begin` and `...:commit`. Begin declares `parts: ["destinations", "presence"]` (the default); a one-part transaction must declare that part explicitly. Every staged snapshot and commit includes the same `transactionId`. All required parts must arrive and validate before any live state changes. Transfer UI emits `transferui:provider:transaction:result` with `providerId`, `transactionId`, and `ok`; rejection/expiry includes an error. Revisions become authoritative at commit; failed/abandoned transactions do not consume them. The BSM provider retries rejected or unacknowledged publications.

Configuration saves reject duplicate/reserved IDs, missing parents, folder cycles, invalid ports, malformed requirements, and oversized data. Draft and published snapshots have a 30,000 UTF-8 byte budget. Backups restore as a new published revision. Publish/restore preflight both the final published and incremented draft payloads before writing. If a storage write throws, the previous published/draft/backup properties are restored; an audit-log failure is reported separately from a successful publication.

Each provider gets a virtual folder `provider:<providerId>:__root`. Provider folders may be published as destination records with `type: "folder"`; default destination parents are the provider root. `__root` is reserved. Destination selection excludes folders.

Chunked JSON frames contain `{__tui:1,id,chunk,total,data}`. Each independently installable pack includes the same bounded transport implementation: at most 1,400 characters per data chunk, reduced when needed to keep each JSON-encoded frame within 2,048 UTF-8 bytes, at most 256 chunks/262,144 message characters, 128 incomplete streams, and a 30-second expiry. Out-of-order chunks and identical duplicates are supported; conflicting duplicates and changing stream shapes are rejected. Chunked outgoing messages use an ordered queue: four frames per tick, at most 2,048 queued frames and 4 MiB, with explicit overload errors. Outgoing queue depth and errors are exposed in diagnostics. ScriptEvents are a cooperative addon bus, not isolation from other installed scripts.

## Development

Runtime code is separated into storage, transfer dispatch, provider protocol, catalog helpers, and UI entry points.

Run the transport and cross-pack runtime tests, plus the BSM client tests:

```sh
node --experimental-vm-modules --test addons/transfer_ui/tests/*.test.mjs addons/bsm_api_client/tests/client.test.mjs
```

These tests use simulated Bedrock APIs and HTTP/WebSocket transports. Verify actual CustomForm behavior, permissions, and remote transfers on a compatible Bedrock server before release.

## Build and acceptance testing

Build the three current packs and a combined `.mcaddon` from their manifests:

```sh
python scripts/build_transfer_packs.py
python -m unittest discover -s scripts/tests -v
```

Output is in `dist/transfer-ui/`: three versioned `.mcpack` files, `transfer_ui_bsm_bundle.mcaddon`, SHA-256 checksums, setup examples, READMEs, and the separate BSM authentication plugin. Zip entries use fixed timestamps, permissions, and ordering; every archive entry is verified against source. The existing 1.1.0 archive remains historical. GitHub Actions builds and uploads `transfer-ui-packs` after the addon tests pass; it does not publish a release or merge the branch.

Before merging/releasing, install the generated packs on a compatible Bedrock server with Beta APIs enabled. Use two different destination ports and verify manual/configured transfers, confirmation, cancellation, inherited folder restrictions, player join/leave updates, BSM disconnect/recovery, publish/restore, and world-restart persistence. Check NetherNet separately if enabled. These in-game checks require a running server and cannot be replaced by the simulated tests.
