# Transfer UI BSM Provider

Optional adapter between **Transfer UI 3.0.0** and **BSM API for Minecraft 1.1.0**. It uses their public ScriptEvent APIs; the packs remain independently installable.

## Setup

Install all three behavior packs and configure the BSM API client and authentication plugin according to `../bsm_api_client/README.md`.

Set `variables.json`:

```json
{
  "transferuiBsmTransferHost": "play.example.com",
  "transferuiBsmSelfServer": "hub"
}
```

The transfer host must be reachable by Minecraft clients. There is no implicit localhost default. `transferuiBsmSelfServer` is optional and hides the current server from destinations.

Operators can open **Transfer UI → Admin Navigation → Transfer Providers → Configure BSM Provider**, or invoke `/scriptevent transferui_bsm:admin` as a player. Permission is checked when opening settings and before saving changes.

## Configuration

Select **This Server**, include/exclude destinations, and choose whether newly discovered servers are included. Per-server overrides support a display name, client-facing hostname, port, priority, IPv6 port selection, explicit NetherNet mode/ID, and maintenance visibility. Higher priority appears first.

When BSM reports NetherNet transport, configure its signaling ID explicitly; a hostname/UDP port is not substituted for a NetherNet ID. IPv6 selection uses `server-portv6`; the hostname must resolve/reach the server over the intended address family.

Unresolved endpoints remain visible with diagnostic information, but cannot transfer players. An explicit port override can resolve a normal destination immediately. Discovered ports, transport, and capacity come from `get_properties`; cached endpoints expire and properties/config events invalidate the cache.

## Runtime and actions

IPC requests carry absolute deadlines and a consumer identity. Timed-out requests cancel queued work so an outdated refresh cannot start later.

Server list and summary operations supply authoritative status/population. The provider subscribes to the backend’s exact server/player/properties/settings event topics and per-server resource-monitor topics, rather than `*`. Server discovery adds/removes per-server subscriptions as needed. Targeted websocket reconciliation is serialized per server and results from obsolete generations are discarded. Targeted player updates publish presence upserts/removals instead of a full network presence snapshot. Endpoint enrichment updates the same state used by subsequent player updates.

Snapshots declare both required parts and tag them with a transaction ID. Incomplete/invalid publications are rejected atomically and retried; the provider records success only after acknowledgement. Provider registration responds to missing-provider status rather than registering again on every status event.

Destination actions include **Refresh from BSM**, **Configure BSM Provider**, and **Refresh Player State** on player details. The provider only discovers transfer destinations and player presence. Server lifecycle operations belong to BSM; start-and-join has been removed.

**Refresh API Contract** fetches the live BSM OpenAPI catalog through the client. Settings saves validate their shape, enforce a 30,000 UTF-8 byte budget, and reject edits from stale forms. Corrupt or unsupported persisted settings produce an error rather than silently replacing user choices.

Health is derived from authenticated HTTP readiness, successful snapshot age, and reconciliation errors. Websocket readiness is tracked separately; HTTP polling can keep the provider healthy without live websocket updates. Provider details show HTTP/WebSocket readiness, contract information, unresolved endpoints, dropped messages, reconciliation state, and the last error.

Tests are included in `../transfer_ui/tests/` and run together with the client tests; see the Transfer UI README for the command.
