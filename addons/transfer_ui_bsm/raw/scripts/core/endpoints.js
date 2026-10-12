export function resolveEndpoint(destination, override = {}, defaultHost = "") {
  const metadata = destination.metadata ?? {},
    family = override.addressFamily ?? "ipv4";
  const hostname = override.host || destination.hostname || defaultHost;
  const netherNetId = override.netherNetId || destination.netherNetId || "";
  const transport = override.transport || metadata.transport || "bedrock";
  const port = Number(override.port || (family === "ipv6" ? metadata.serverPortV6 : destination.port));
  const resolved = transport === "nethernet" ? !!netherNetId : !!hostname && Number.isInteger(port) && port > 0 && port <= 65535 && !!(override.port || metadata.endpointResolved);
  return {
    ...destination,
    hostname,
    port,
    netherNetId: transport === "nethernet" ? netherNetId : "",
    transferType: transport === "nethernet" ? "nethernet" : "bedrock",
    order: -Number(override.priority || 0),
    metadata: {
      ...metadata,
      addressFamily: family,
      endpointResolved: resolved,
      endpointError: resolved ? "" : transport === "nethernet" ? "Configure a NetherNet ID" : "Configure a client-reachable host and resolve the selected port"
    }
  };
}
