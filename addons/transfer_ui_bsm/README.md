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

Server list and summary operations supply authoritative status/population. Targeted websocket reconciliation is serialized per server and results from obsolete generations are discarded. Endpoint enrichment updates the same state used by subsequent player updates.

Snapshots publish destinations and presence together with acknowledgement/retry handling. Provider registration responds to missing-provider status rather than registering again on every status event.

Destination actions include **Refresh from BSM**, **Configure BSM Provider**, and operator-only **Start Server & Join**. Start-and-join waits for a running summary, reconciles state, and submits a normal Transfer UI transfer request. Confirmation, policies, and endpoint checks still apply. Readiness polling makes up to 30 attempts with 40 ticks between attempts, plus HTTP request time.

**Refresh API Contract** fetches the live BSM OpenAPI catalog through the client. Provider details show HTTP/WebSocket readiness, contract information, unresolved endpoints, dropped messages, reconciliation state, and the last error.

Tests are included in `../transfer_ui/tests/` and run together with the client tests; see the Transfer UI README for the command.
