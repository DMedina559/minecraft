# Transfer UI - Changelog

## Unreleased
- Remove start-and-join from the BSM provider; server lifecycle belongs to BSM.
- Validate configurations, detect stale admin edits, preview publishes, and add move/reorder tools.
- Add provider folders, transfer progress/cancellation, disconnect cleanup, and clear unavailable destinations.
- Pace outgoing IPC with UTF-8 frame budgeting, narrow subscriptions, publish player deltas, and derive health from readiness/freshness.
- Split storage, provider protocol, transfer dispatch, and catalog helpers.
- Fix chunk reassembly, registration feedback, stale endpoints, transfer enforcement, and policy timeout decisions.
- Add live details, pagination, search filters, player preferences, and setup diagnostics.
- BSM provider adds IPv6/NetherNet overrides, snapshot acknowledgement/retry, and improved endpoint diagnostics.
- BSM client adds live contract discovery and bounded HTTP request queues.
- Add cross-pack runtime and transport coverage.

## 1.1.0
1. Added potential support for NetherNet transfers.
2. Updated scripts to new 2.0.0 formats.
3. Fixed IP/Port transfers to use new format.

## 1.0.0
1. Initial release.
