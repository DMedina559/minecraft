export function reconcilePopulation(destination, summary, players, source = "summary") {
  if (summary?.players_available === false) {
    destination.playerCount = null;
    destination.metadata = {
      ...(destination.metadata ?? {}),
      playersAvailable: false,
      playerStateSource: source,
      populationSource: "unavailable",
      reportedPopulation: null,
      identifiedPlayers: 0,
      populationObservedAt: Date.now()
    };
    return { population: null, identified: 0, mismatch: false };
  }
  const reported = Number(summary?.player_count),
    identified = Array.isArray(players) ? players.length : 0;
  let population = Number.isFinite(reported) && reported >= 0 ? Math.trunc(reported) : identified;
  // Presence can be less complete than population, but never let an identified player
  // produce a lower displayed population.
  if (identified > population) population = identified;
  destination.playerCount = population;
  destination.metadata = {
    ...(destination.metadata ?? {}),
    playerStateSource: source,
    playersAvailable: true,
    populationSource: Number.isFinite(reported) && reported >= 0 ? `${source}.player_count` : `${source}.players`,
    reportedPopulation: population,
    identifiedPlayers: identified,
    populationObservedAt: Date.now()
  };
  return {
    population,
    identified,
    mismatch: identified > 0 && identified !== population
  };
}
export function eventServerHint(event, knownNames = []) {
  let message;
  try {
    message = typeof event?.raw === "string" ? JSON.parse(event.raw) : event
  } catch {
    return ""
  }
  const data = message?.data ?? {};
  const candidates = [data.server_name, data.result?.server_name, data.server?.name];
  if (message?.topic?.startsWith("resource-monitor:")) candidates.push(message.topic.slice("resource-monitor:".length));
  return candidates.find(name => knownNames.includes(name)) ?? "";
}
