# Transfer UI BSM Provider

Optional adapter between **Transfer UI 3.0.0** and **BSM API for Minecraft 1.0.0**.

It uses only the public ScriptEvent APIs of both addons. Transfer UI has no BSM-specific code and BSM API has no Transfer UI-specific code.

## Configuration

`variables.json`:

```json
{
  "transferuiBsmTransferHost": "192.168.86.34",
  "transferuiBsmSelfServer": "hub"
}
```

`transferuiBsmTransferHost` is the host sent to Minecraft clients. `transferuiBsmSelfServer` is optional and hides the current BSM server from transfer destinations.

## Provider API support

This adapter is a reference implementation of Transfer UI Provider API v1. It publishes BSM servers as generic destinations, BSM players as generic presence, provider health/heartbeats, and uses chunked ScriptEvent snapshots. Transfer UI itself contains no BSM-specific logic.
