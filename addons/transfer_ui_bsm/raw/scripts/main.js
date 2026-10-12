import {
  resolveEndpoint
} from "./core/endpoints.js";
import {
  ChunkReceiver,
  sendJson,
  senderStatus
} from "./core/ipc.js";
import {
  system,
  world,
  PlayerPermissionLevel
} from "@minecraft/server";
import {
  CustomForm,
  MessageBox,
  ObservableBoolean,
  ObservableString
} from "@minecraft/server-ui";
import {
  variables
} from "@minecraft/server-admin";
import {
  NAME,
  VERSION,
  PROVIDER_ID,
  PROTOCOL,
  CONSUMER_ID,
  CONFIG_SCHEMA_VERSION,
  MAX_QUEUE,
  MAX_PER_TICK,
  REQUEST_TIMEOUT_TICKS,
  SYNC_DEBOUNCE_TICKS,
  WATCHDOG_SYNC_TICKS
} from "./core/constants.js";
import {
  ProviderRuntimeState
} from "./core/state.js";
import {
  createProviderStorage
} from "./core/storage.js";
import {
  ProviderRuntime
} from "./core/runtime.js";
import {
  reconcilePopulation,
  eventServerHint
} from "./core/reconciliation.js";

const ipcReceiver = new ChunkReceiver(),
  chunks = ipcReceiver.streams,
  pending = new Map(),
  eventQueue = [];
const providerSession = `bsm-${Date.now()}-${Math.random().toString(36).slice(2)}`;
let publishAck = null,
  lastPublicationError = "";
let seq = 0,
  revision = 0,
  apiSeen = false,
  apiStatus = null,
  syncing = false,
  syncQueued = false,
  syncDebounce = null,
  lastSnapshotFingerprint = "";
const endpointCache = new Map();
let phase = "starting",
  hasSnapshot = false,
  enrichmentGeneration = 0,
  enrichmentActive = 0;
let lastSync = {
  servers: 0,
  destinations: 0,
  players: 0,
  self: "",
  managedSelf: false,
  time: 0,
  error: "",
  operation: "",
  httpStatus: 0,
  responseStatus: "",
  rejected: 0
};
const metrics = {
  queued: 0,
  processed: 0,
  dropped: 0,
  malformed: 0,
  requests: 0,
  responses: 0,
  timeouts: 0,
  unmatched: 0,
  highWater: 0
};
const isAdmin = p => p?.playerPermissionLevel === PlayerPermissionLevel.Operator;
const clean = v => `${v??""}`.trim();
const runtimeState = new ProviderRuntimeState();
const runtime = new ProviderRuntime(system);

const CONFIG_PROPERTY = "transferui:bsm_provider_config_v1";
const storage = createProviderStorage(world, CONFIG_PROPERTY, CONFIG_SCHEMA_VERSION);
let discoveredServersCache = [];

function defaultProviderConfig() {
  return storage.defaults()
}

function loadProviderConfig() {
  return storage.load()
}

function saveProviderConfig(c, player, expectedRevision = c.revision ?? 0) {
  if (!isAdmin(player)) throw Error("Operator permission required");
  try {
    return storage.save(c, expectedRevision)
  } catch (e) {
    player.sendMessage(`§c${e.message}`);
    throw e
  }
}

function policy(c, n) {
  const x = c.servers?.[n] ?? {},
    pn = Number(x.port),
    pr = Number(x.priority);
  return {
    included: typeof x.included === "boolean" ? x.included : c.defaultInclude,
    displayName: clean(x.displayName),
    host: clean(x.host),
    port: Number.isInteger(pn) && pn > 0 && pn <= 65535 ? pn : 0,
    priority: Number.isFinite(pr) ? pr : 0,
    showMaintenance: x.showMaintenance !== false,
    addressFamily: x.addressFamily === "ipv6" ? "ipv6" : "ipv4",
    transport: ["bedrock", "nethernet"].includes(x.transport) ? x.transport : "",
    netherNetId: clean(x.netherNetId)
  };
}

function setPolicy(c, n, x) {
  c.servers ??= {};
  c.servers[n] = {
    ...(c.servers[n] ?? {}),
    ...x
  }
}

function local(c, n) {
  return !!c.localServer && clean(n) === c.localServer
}

function applyPolicy(destinations) {
  const c = loadProviderConfig();
  return destinations.filter(d => {
    const n = clean(d.id);
    const p = policy(c, n);
    return !local(c, n) && p.included && (!d.maintenance || p.showMaintenance);
  }).map(d => {
    const p = policy(c, clean(d.id));
    return resolveEndpoint({
      ...d,
      name: p.displayName || d.name
    }, p, transferHost());
  }).sort((a, b) => policy(c, b.id).priority - policy(c, a.id).priority || String(a.name).localeCompare(String(b.name)));
}

function cfgSummary() {
  const c = loadProviderConfig(),
    names = discoveredServersCache.map(x => clean(x?.name)).filter(Boolean);
  return {
    c,
    names,
    included: names.filter(n => !local(c, n) && policy(c, n).included).length
  };
}

function showDDUI(f) {
  try {
    return f.show().catch(e => console.warn(`[${NAME}] DDUI show failed: ${e?.message??e}`))
  } catch (e) {
    console.warn(`[${NAME}] DDUI build failed: ${e?.message??e}`)
  }
}

function defer(fn) {
  system.run(() => {
    try {
      fn()
    } catch (e) {
      console.warn(`[${NAME}] DDUI action failed: ${e?.message??e}`)
    }
  })
}

function navigate(form, fn) {
  console.info(`[${NAME}] DDUI navigation click received.`);
  try {
    if (form?.isShowing?.()) form.close()
  } catch (e) {
    console.warn(`[${NAME}] DDUI close failed: ${e?.message??e}`)
  }
  defer(fn);
}

function adminMenu(player) {
  if (!isAdmin(player)) return;
  const {
    c,
    names,
    included
  } = cfgSummary();
  const f = new CustomForm(player, "BSM PROVIDER SETTINGS").closeButton().header("Transfer UI · Bedrock Server Manager")
    .label(`Discovered: ${names.length}\nIncluded: ${included}\nThis server: ${c.localServer||"Not set"}\nNew servers: ${c.defaultInclude?"Include":"Exclude"}`).divider()
    .button("Set This Server", () => navigate(f, () => localMenu(player))).button("Include / Exclude Servers", () => navigate(f, () => includeMenu(player)))
    .button("Per-Server Overrides", () => navigate(f, () => overrideMenu(player)))
    .button(`New Servers: ${c.defaultInclude?"Included":"Excluded"}`, () => navigate(f, () => {
      const x = loadProviderConfig();
      x.defaultInclude = !x.defaultInclude;
      saveProviderConfig(x, player, c.revision ?? 0);
      lastSnapshotFingerprint = "";
      scheduleSync("config-default-policy");
      adminMenu(player)
    }))
    .button("Refresh API Contract", () => defer(() => call("refresh_contract").then(() => player.sendMessage("§aAPI contract refreshed.")).catch(e => player.sendMessage(`§c${e.message}`)))).button("Apply & Republish", () => defer(() => {
      lastSnapshotFingerprint = "";
      scheduleSync("config-apply");
      player.sendMessage("§aBSM provider republish queued.")
    }))
    .button("Reset Settings", () => navigate(f, () => resetMenu(player)));
  return showDDUI(f);
}

function localMenu(player) {
  if (!isAdmin(player)) return;
  const {
    c,
    names
  } = cfgSummary();
  const f = new CustomForm(player, "THIS SERVER").closeButton().label("Selected server is automatically excluded from transfer destinations.").divider()
    .button(`None / Not managed${!c.localServer?" §a(Current)":""}`, () => navigate(f, () => {
      const x = loadProviderConfig();
      x.localServer = "";
      saveProviderConfig(x, player, c.revision ?? 0);
      lastSnapshotFingerprint = "";
      scheduleSync("config-local");
      localMenu(player)
    }));
  names.forEach(n => f.button(`${n}${c.localServer===n?" §a(Current)":""}`, () => navigate(f, () => {
    const x = loadProviderConfig();
    x.localServer = n;
    setPolicy(x, n, {
      included: false
    });
    saveProviderConfig(x, player, c.revision ?? 0);
    lastSnapshotFingerprint = "";
    scheduleSync("config-local");
    localMenu(player)
  })));
  f.divider().button("Back", () => navigate(f, () => adminMenu(player)));
  return showDDUI(f);
}

function includeMenu(player) {
  if (!isAdmin(player)) return;
  const {
    c,
    names
  } = cfgSummary(), v = new Map();
  const f = new CustomForm(player, "INCLUDED SERVERS").closeButton().label("This Server is always excluded.").divider();
  names.forEach(n => {
    const o = new ObservableBoolean(local(c, n) ? false : policy(c, n).included, {
      clientWritable: true
    });
    v.set(n, o);
    f.toggle(`${n}${local(c,n)?" (This Server)":""}`, o)
  });
  f.divider().button("Save", () => navigate(f, () => {
      const x = loadProviderConfig();
      names.forEach(n => setPolicy(x, n, {
        included: local(x, n) ? false : !!v.get(n).getData()
      }));
      saveProviderConfig(x, player, c.revision ?? 0);
      lastSnapshotFingerprint = "";
      scheduleSync("config-includes");
      includeMenu(player)
    }))
    .button("Back", () => navigate(f, () => adminMenu(player)));
  return showDDUI(f);
}

function overrideMenu(player) {
  if (!isAdmin(player)) return;
  const {
    c,
    names
  } = cfgSummary();
  const f = new CustomForm(player, "SERVER OVERRIDES").closeButton().label("Override transfer-facing details without changing BSM.").divider();
  names.forEach(n => f.button(`${n}${local(c,n)?" §e(This Server)":policy(c,n).included?" §a(Included)":" §c(Excluded)"}`, () => navigate(f, () => editOverride(player, n))));
  f.divider().button("Back", () => navigate(f, () => adminMenu(player)));
  return showDDUI(f);
}

function editOverride(player, n) {
  if (!isAdmin(player)) return;
  const c = loadProviderConfig(),
    p = policy(c, n),
    inc = new ObservableBoolean(local(c, n) ? false : p.included, {
      clientWritable: true
    }),
    dn = new ObservableString(p.displayName, {
      clientWritable: true
    }),
    host = new ObservableString(p.host, {
      clientWritable: true
    }),
    port = new ObservableString(p.port ? String(p.port) : "", {
      clientWritable: true
    }),
    pri = new ObservableString(String(p.priority), {
      clientWritable: true
    }),
    maint = new ObservableBoolean(p.showMaintenance, {
      clientWritable: true
    }),
    ipv6 = new ObservableBoolean(p.addressFamily === "ipv6", {
      clientWritable: true
    }),
    net = new ObservableBoolean(p.transport === "nethernet", {
      clientWritable: true
    }),
    nid = new ObservableString(p.netherNetId, {
      clientWritable: true
    });
  const f = new CustomForm(player, `OVERRIDE: ${n}`).closeButton().toggle("Included", inc).textField("Display name", dn, {
      description: "Blank uses BSM name."
    }).textField("Hostname / IP", host, {
      description: "Blank uses provider host."
    }).textField("Port", port, {
      description: "Blank uses discovered port."
    }).textField("Priority", pri, {
      description: "Higher sorts first."
    }).toggle("Use IPv6 port", ipv6).toggle("Use NetherNet", net).textField("NetherNet ID", nid).toggle("Show while in maintenance", maint).divider()
    .button("Save", () => navigate(f, () => {
      const x = loadProviderConfig(),
        t = clean(port.getData()),
        pn = t ? Number(t) : 0;
      if (t && (!Number.isInteger(pn) || pn < 1 || pn > 65535)) {
        player.sendMessage("§cPort must be 1-65535 or blank.");
        return
      }
      setPolicy(x, n, {
        included: local(x, n) ? false : !!inc.getData(),
        displayName: clean(dn.getData()),
        host: clean(host.getData()),
        port: pn,
        priority: Number(pri.getData()) || 0,
        showMaintenance: !!maint.getData(),
        addressFamily: ipv6.getData() ? "ipv6" : "ipv4",
        transport: net.getData() ? "nethernet" : "bedrock",
        netherNetId: clean(nid.getData())
      });
      saveProviderConfig(x, player, c.revision ?? 0);
      lastSnapshotFingerprint = "";
      scheduleSync("config-override");
      overrideMenu(player)
    }))
    .button("Back", () => navigate(f, () => overrideMenu(player)));
  return showDDUI(f);
}

function resetMenu(player) {
  if (!isAdmin(player)) return;
  const c = loadProviderConfig(),
    b = new MessageBox(player, "RESET SETTINGS").body("Reset local-server selection and every BSM provider override?").button1("Reset").button2("Cancel");
  b.show().then(r => {
    if (r.selection === 1) defer(() => {
      saveProviderConfig(defaultProviderConfig(), player, c.revision ?? 0);
      lastSnapshotFingerprint = "";
      scheduleSync("config-reset");
      adminMenu(player)
    })
  }).catch(e => console.warn(`[${NAME}] DDUI reset failed: ${e?.message??e}`));
}

function receive(id, msg) {
  try {
    return ipcReceiver.receive(id, msg)
  } catch (e) {
    metrics.malformed++;
    return null
  }
}

function sendChunked(id, payload, requestId) {
  sendJson(system, id, payload, requestId)
}

function call(operationId, args = {}, retry = 0, responseProjection) {
  const id = `tuibsm-${Date.now()}-${++seq}`;
  metrics.requests++;
  return new Promise((resolve, reject) => {
    const timeout = system.runTimeout(() => {
      pending.delete(id);
      metrics.timeouts++;
      system.sendScriptEvent("bsmapi:control", JSON.stringify({
        action: "cancel-request",
        requestId: id,
        consumerId: CONSUMER_ID
      }));
      reject(Error(`BSM API IPC timeout: ${operationId} id=${id} (${REQUEST_TIMEOUT_TICKS} ticks, apiSeen=${apiSeen}, state=${apiStatus?.state??"unknown"})`));
    }, REQUEST_TIMEOUT_TICKS);
    pending.set(id, {
      resolve,
      reject,
      timeout,
      operationId,
      created: Date.now()
    });
    try {
      sendChunked("bsmapi:request", {
        operationId,
        args,
        responseProjection,
        consumerId: CONSUMER_ID,
        deadline: Date.now() + REQUEST_TIMEOUT_TICKS * 50
      }, id)
    } catch (e) {
      system.clearRun(timeout);
      pending.delete(id);
      reject(e)
    }
  });
}

function register() {
  sendChunked("transferui:provider:register", {
    protocol: PROTOCOL,
    id: PROVIDER_ID,
    sessionId: providerSession,
    name: "Bedrock Server Manager",
    version: VERSION,
    capabilities: ["destinations", "destination-deltas", "presence", "presence-deltas", "health", "metadata", "configure", "actions"],
    configure: {
      label: "Configure BSM Provider",
      adminOnly: true
    }
  }, `reg-${Date.now()}`)
}

function registerActions() {
  sendChunked("transferui:actions:register", {
    protocol: PROTOCOL,
    providerId: PROVIDER_ID,
    actions: [{
      id: "refresh",
      label: "Refresh from BSM",
      scope: "destination",
      adminOnly: false
    }, {
      id: "configure",
      label: "Configure BSM Provider",
      scope: "destination",
      adminOnly: true
    }, {
      id: "refresh-player",
      label: "Refresh Player State",
      scope: "player",
      adminOnly: false
    }]
  }, `actions-${Date.now()}`)
}

function health(state = "ready", message = "") {
  if (!apiSeen) state = "connecting";
  else if (!apiStatus?.httpReady || lastSync.error || lastPublicationError || (hasSnapshot && Date.now() - lastSync.time > 120000)) state = hasSnapshot ? "degraded" : "connecting";
  else if (!hasSnapshot) state = "connecting";
  sendChunked("transferui:provider:health", {
    protocol: PROTOCOL,
    providerId: PROVIDER_ID,
    state,
    message,
    time: Date.now(),
    metadata: {
      phase,
      hasSnapshot,
      lastPublicationError,
      snapshotAgeMs: lastSync.time ? Date.now() - lastSync.time : null,
      transportReady: !!apiStatus?.httpReady,
      liveUpdates: !!apiStatus?.websocketAuthenticated,
      unresolvedEndpoints: [...runtimeState.destinations.values()].filter(d => !d.metadata?.endpointResolved).length,
      ipcDropped: metrics.dropped,
      outgoing: senderStatus(system),
      contract: apiStatus?.contract ?? null,
      subscriptions: apiStatus?.subscriptions ?? [],
      bsmApiSeen: apiSeen,
      bsmApiState: apiStatus?.state ?? "unknown",
      bsmApiAuthenticated: apiStatus?.authenticated ?? false,
      bsmHttpReady: apiStatus?.httpReady ?? false,
      bsmHttpAuthenticated: apiStatus?.httpAuthenticated ?? false,
      bsmWebsocketState: apiStatus?.websocketState ?? apiStatus?.state ?? "unknown",
      ipcPending: pending.size,
      ipcQueue: eventQueue.length,
      ipcTimeouts: metrics.timeouts,
      bsmServers: lastSync.servers,
      publishedDestinations: lastSync.destinations,
      publishedPlayers: lastSync.players,
      rejectedServers: lastSync.rejected,
      localServer: lastSync.self,
      localServerManaged: !!(lastSync.self && lastSync.managedSelf),
      selfServer: lastSync.self,
      lastSync: lastSync.time,
      lastSyncError: lastSync.error,
      lastOperation: lastSync.operation,
      lastHttpStatus: lastSync.httpStatus,
      responseStatus: lastSync.responseStatus,
      snapshotGeneration: runtimeState.generation,
      reportedPopulation: runtimeState.population(),
      identifiedPlayers: runtimeState.players.size,
      populationMismatches: runtimeState.populationMismatches,
      lastProviderEvent: runtimeState.lastEvent,
      lastReconcile: runtimeState.lastReconcile
    }
  }, `health-${Date.now()}`)
}

function normalizeServerPlayers(raw, destinationId, self) {
  const out = [];
  for (const item of Array.isArray(raw) ? raw : []) {
    let name = "",
      xuid = "";
    if (typeof item === "string") name = clean(item);
    else if (item && typeof item === "object") {
      name = clean(item.name ?? item.gamertag ?? item.player_name ?? item.username);
      xuid = clean(item.xuid ?? item.id ?? item.player_id);
      // BSM may encode a player as { "Gamertag": "XUID" }.
      if (!name && !xuid) {
        const e = Object.entries(item);
        if (e.length === 1) {
          name = clean(e[0][0]);
          xuid = clean(e[0][1])
        }
      }
    }
    if (!name && !xuid) continue;
    const id = xuid || `${destinationId}:${name}`;
    out.push({
      id,
      xuid: xuid || undefined,
      name: name || "Unknown",
      destinationId,
      status: "online",
      metadata: {
        self: destinationId === self
      }
    });
  }
  return out;
}
async function enrichPlayerState(candidates, destinations, self) {
  const byId = new Map(destinations.map(d => [d.id, d])),
    players = [];
  const work = candidates.slice();
  let resolved = 0,
    failed = 0;
  async function worker() {
    while (work.length) {
      const c = work.shift(),
        d = byId.get(c.name);
      if (!d) continue;
      try {
        const summary = await call("get_server_summary", {
          path: {
            server_name: c.name
          }
        });
        if (!summary || typeof summary !== "object") throw Error("summary returned no object");
        const count = Number(summary.player_count);
        const ps = normalizeServerPlayers(summary.players_available === false ? [] : summary.players, c.name, self);
        const rec = reconcilePopulation(d, summary, ps, "summary");
        if (rec.mismatch) runtimeState.populationMismatches++;
        d.status = clean(summary.status) || d.status;
        d.maintenance = d.status.toUpperCase() !== "RUNNING";
        d.metadata = {
          ...(d.metadata ?? {}),
          version: summary.version ?? d.metadata?.version ?? "",
          playerStateSource: "summary"
        };
        c.initial = {
          ...c.initial,
          ...d,
          metadata: {
            ...(c.initial?.metadata ?? {}),
            ...(d.metadata ?? {})
          }
        };
        players.push(...ps);
        resolved++;
      } catch (e) {
        const ps = normalizeServerPlayers(c.server?.players_available === false ? [] : c.server?.players, c.name, self);
        players.push(...ps);
        const rec = reconcilePopulation(d, c.server ?? {}, ps, "server-list-fallback");
        if (rec.mismatch) runtimeState.populationMismatches++;
        c.initial = {
          ...c.initial,
          ...d,
          metadata: {
            ...(c.initial?.metadata ?? {}),
            ...(d.metadata ?? {})
          }
        };
        failed++;
        console.warn(`[${NAME}] player enrichment failed for ${c.name}: ${e?.message??e}; using server-list player state.`);
      }
    }
  }
  await Promise.all([worker(), worker()]);
  console.log(`[${NAME}] player enrichment complete: resolved=${resolved}, unresolved=${failed}, players=${players.length}.`);
  return players;
}

function transferHost() {
  return clean(variables.get("transferuiBsmTransferHost") ?? "")
}

function selfServer() {
  return clean(variables.get("transferuiBsmSelfServer") ?? "")
}

function requestApiStatus() {
  system.sendScriptEvent("bsmapi:control", JSON.stringify({
    action: "status"
  }))
}
// Transfer BSM explicitly owns its live BSM subscription. The API client itself starts with no topics.
const GLOBAL_TOPICS = ["event:after_server_install", "event:after_server_update", "event:after_delete_server_data", "event:after_server_start", "event:after_server_stop", "event:after_server_status_change", "event:after_server_players_change", "event:after_properties_change", "event:after_set_server_setting"];
let ownedTopics = new Set();

function requestApiSubscribe() {
  const desired = new Set([...GLOBAL_TOPICS, ...discoveredServersCache.map(s => `resource-monitor:${s.name}`)]);
  for (const topic of ownedTopics)
    if (!desired.has(topic)) system.sendScriptEvent("bsmapi:control", JSON.stringify({
      action: "unsubscribe",
      consumerId: CONSUMER_ID,
      topic
    }));
  for (const topic of desired)
    if (!ownedTopics.has(topic)) system.sendScriptEvent("bsmapi:control", JSON.stringify({
      action: "subscribe",
      consumerId: CONSUMER_ID,
      topic
    }));
  ownedTopics = desired;
}

function scheduleSync(reason = "unspecified") {
  if (syncing || enrichmentActive) {
    syncQueued = true;
    return
  }
  if (syncDebounce !== null) return;
  syncDebounce = system.runTimeout(() => {
    syncDebounce = null;
    sync(reason)
  }, SYNC_DEBOUNCE_TICKS);
}

function shouldRefreshForBsmEvent(event) {
  let message;
  try {
    message = JSON.parse(event?.raw ?? event?.message ?? "{}")
  } catch {
    return false
  }
  if (message.type === "task_update") return ["completed", "failed", "cancelled"].includes(message.data?.status);
  if (message.type === "resource_update") return message.topic?.startsWith("resource-monitor:") === true;
  return message.topic?.startsWith("event:") === true && /server|player|properties|config|allowlist|permission|ban/.test(message.topic);
}
const refreshingServers = new Set();
async function refreshServer(name, reason = "bsm-event") {
  if (refreshingServers.has(name)) {
    runtime.debounce(`retry:${name}`, 20, () => refreshServer(name, reason));
    return
  }
  refreshingServers.add(name);
  try {
    if (syncing || enrichmentActive) return scheduleSync(reason);
    const generation = runtimeState.generation;
    const current = runtimeState.destinations.get(name);
    if (!current || !apiStatus?.httpReady) return scheduleSync(reason);
    try {
      phase = "reconciling-server";
      const summary = await call("get_server_summary", {
        path: {
          server_name: name
        }
      });
      if (generation !== runtimeState.generation || syncing || enrichmentActive) return scheduleSync("obsolete-targeted");
      const players = normalizeServerPlayers(summary?.players_available === false ? [] : summary?.players, name, lastSync.self);
      const destination = {
        ...current,
        metadata: {
          ...(current.metadata ?? {})
        }
      };
      const rec = reconcilePopulation(destination, summary, players, "summary");
      if (rec.mismatch) runtimeState.populationMismatches++;
      destination.status = clean(summary?.status) || destination.status;
      destination.maintenance = destination.status.toUpperCase() !== "RUNNING";
      destination.metadata = {
        ...destination.metadata,
        version: summary?.version ?? destination.metadata?.version ?? "",
        reconcileReason: reason
      };
      if (!applyPolicy([destination]).length) return scheduleSync("destination-policy-changed");
      const delta = runtimeState.updateServer(destination, players, reason);
      const rev = ++revision;
      sendChunked("transferui:destination:upsert", {
        protocol: PROTOCOL,
        providerId: PROVIDER_ID,
        revision: rev,
        destination
      }, `target-dest-${rev}`);
      if (delta.removed.length) {
        const r = ++revision;
        sendChunked("transferui:presence:remove", {
          protocol: PROTOCOL,
          providerId: PROVIDER_ID,
          revision: r,
          ids: delta.removed
        }, `target-remove-${r}`)
      }
      if (delta.upserted.length) {
        const r = ++revision;
        sendChunked("transferui:presence:upsert", {
          protocol: PROTOCOL,
          providerId: PROVIDER_ID,
          revision: r,
          players: delta.upserted
        }, `target-upsert-${r}`)
      }
      lastSnapshotFingerprint = "";
      phase = "ready";
      health("ready", `Reconciled ${name}: ${destination.playerCount} reported, ${players.length} identified.`);
      console.log(`[${NAME}] targeted reconcile: server=${name}, population=${destination.playerCount}, identified=${players.length}, reason=${reason}.`);
    } catch (e) {
      console.warn(`[${NAME}] targeted reconcile failed for ${name}: ${e?.message??e}; scheduling full reconciliation.`);
      scheduleSync("targeted-fallback")
    }
  } finally {
    refreshingServers.delete(name)
  }
}

function scheduleEventRefresh(event) {
  if (!shouldRefreshForBsmEvent(event)) return;
  if (/properties|config/.test(event?.raw ?? "")) {
    endpointCache.clear();
    return scheduleSync("endpoint-change")
  }
  const names = discoveredServersCache.map(x => clean(x?.name)).filter(Boolean),
    server = eventServerHint(event, names);
  runtimeState.lastEvent = {
    time: Date.now(),
    server,
    kind: "bsm-event",
    raw: clean(event?.raw ?? event?.message ?? event).slice(0, 240)
  };
  if (server) runtime.debounce(`server:${server}`, SYNC_DEBOUNCE_TICKS, () => refreshServer(server, "websocket-event"));
  else scheduleSync("bsm-event");
}

async function sync(reason = "unspecified") {
  if (syncing) {
    syncQueued = true;
    return
  }
  if (!apiSeen) {
    phase = "waiting-for-bsm-api";
    health("connecting", "Waiting for BSM API for Minecraft");
    requestApiStatus();
    return
  }
  if (!apiStatus?.httpReady) {
    phase = "waiting-for-bsm-http";
    health(hasSnapshot ? "degraded" : "connecting", "Waiting for authenticated BSM HTTP API...");
    return
  }
  syncing = true;
  runtimeState.beginGeneration();
  enrichmentGeneration++;
  phase = "discovering";
  health(hasSnapshot ? "ready" : "connecting", "Discovering BSM servers...");
  const operation = "list_servers";
  console.log(`[${NAME}] discovery starting: reason=${reason}, operation=${operation}, httpReady=${!!apiStatus?.httpReady}, wsState=${apiStatus?.websocketState??apiStatus?.state??"unknown"}, wsAuthenticated=${!!apiStatus?.websocketAuthenticated}.`);
  try {
    const r = await call(operation);
    console.log(`[${NAME}] discovery response received: operation=${operation}, type=${Array.isArray(r)?"array":typeof r}, keys=${r&&typeof r==="object"&&!Array.isArray(r)?Object.keys(r).join(","):"none"}.`);
    if (!r || typeof r !== "object") throw Error(`${operation}: invalid response (expected ServersListResponse object)`);
    if (r.status !== undefined && !["success", "ok"].includes(clean(r.status).toLowerCase())) throw Error(`${operation}: BSM returned status=${clean(r.status)||"unknown"}${r.message?`: ${r.message}`:""}`);
    if (!Object.prototype.hasOwnProperty.call(r, "servers")) throw Error(`${operation}: response did not contain servers`);
    if (r.servers !== null && !Array.isArray(r.servers)) throw Error(`${operation}: servers was not an array`);
    const servers = r.servers ?? [],
      destinations = [],
      candidates = [];
    let rejected = 0;
    discoveredServersCache = servers.slice();
    requestApiSubscribe();
    let self = loadProviderConfig().localServer || selfServer();
    const host = transferHost();
    for (const s of servers) {
      if (!s || typeof s !== "object") {
        rejected++;
        continue
      }
      const name = clean(s.name);
      if (!name) {
        rejected++;
        continue
      }
      if (name === self) continue;
      let port = Number(s.port ?? s.server_port ?? s.properties?.["server-port"] ?? 0);
      let transport = clean(s.transport ?? s.properties?.transport),
        portV6 = Number(s.server_portv6 ?? s.properties?.["server-portv6"] ?? 0);
      let portSource = port ? "server-list" : "fallback";
      const cached = endpointCache.get(name);
      const cacheFresh = cached && Date.now() - cached.time < 60000;
      if (!port && cacheFresh) {
        port = cached.port;
        portV6 = cached.portV6;
        transport = cached.transport;
        portSource = "cache"
      }
      if (!Number.isInteger(port) || port < 1 || port > 65535) port = 19132;
      const d = {
        id: name,
        name,
        maxPlayers: cacheFresh ? cached.maxPlayers : undefined,
        description: "Managed by Bedrock Server Manager",
        hostname: host,
        port,
        status: clean(s.status) || "Unknown",
        playerCount: Number(s.player_count) || 0,
        maintenance: `${s.status??""}`.toUpperCase() !== "RUNNING",
        metadata: {
          version: s.version ?? "",
          serverManager: "bsm",
          portSource,
          endpointResolved: portSource !== "fallback",
          propertiesResolved: portSource === "properties" || portSource === "cache",
          transport: transport || "",
          serverPortV6: Number.isInteger(portV6) ? portV6 : 0
        }
      };
      destinations.push(d);
      candidates.push({
        server: s,
        name,
        initial: d,
        needsResolve: portSource === "fallback" || (!portV6 && policy(loadProviderConfig(), name).addressFamily === "ipv6")
      });
    }
    const filtered = applyPolicy(destinations);
    destinations.splice(0, destinations.length, ...filtered);
    // Do not enrich excluded/local destinations. Player state comes from the per-server
    // summary endpoint so counts and presence share one authoritative snapshot.
    const allowedIds = new Set(destinations.map(d => d.id));
    for (let i = candidates.length - 1; i >= 0; i--)
      if (!allowedIds.has(candidates[i].name)) candidates.splice(i, 1);
    phase = "enriching-players";
    const players = await enrichPlayerState(candidates, destinations, self);
    const generation = runtimeState.generation;
    runtimeState.replace(destinations, players, generation);
    lastSync = {
      servers: servers.length,
      destinations: destinations.length,
      players: players.length,
      self,
      managedSelf: !!(self && servers.some(x => clean(x?.name) === self)),
      time: Date.now(),
      error: "",
      operation,
      httpStatus: 200,
      responseStatus: clean(r.status),
      rejected
    };
    const fingerprint = JSON.stringify({
      destinations: destinations.map(d => [d.id, d.hostname, d.port, d.status, d.playerCount, d.maintenance, d.metadata?.version, d.metadata?.portSource]),
      players: players.map(p => [p.id, p.xuid, p.name, p.destinationId, p.status]),
      self
    });
    const unchanged = hasSnapshot && fingerprint === lastSnapshotFingerprint;
    lastSnapshotFingerprint = fingerprint;
    if (unchanged && !candidates.some(x => x.needsResolve)) {
      phase = "ready";
      health("ready", `BSM snapshot unchanged; retaining ${destinations.length} destination(s).`);
      console.log(`[${NAME}] discovery unchanged: BSM=${servers.length}, published=${destinations.length}; no Transfer UI transaction emitted.`);
      return;
    }
    const rev = ++revision,
      txn = `bsm-${rev}`;
    if (publishAck) system.clearRun(publishAck.timer);
    publishAck = {
      id: txn,
      timer: system.runTimeout(() => {
        publishAck = null;
        lastPublicationError = "Snapshot acknowledgement timed out";
        lastSnapshotFingerprint = "";
        scheduleSync("publication-timeout")
      }, REQUEST_TIMEOUT_TICKS)
    };
    sendChunked("transferui:provider:transaction:begin", {
      protocol: PROTOCOL,
      providerId: PROVIDER_ID,
      transactionId: txn,
      parts: ["destinations", "presence"]
    }, `txn-begin-${rev}`);
    sendChunked("transferui:destination:snapshot", {
      protocol: PROTOCOL,
      providerId: PROVIDER_ID,
      revision: rev,
      transactionId: txn,
      destinations
    }, `dest-${rev}`);
    sendChunked("transferui:presence:snapshot", {
      protocol: PROTOCOL,
      providerId: PROVIDER_ID,
      revision: rev,
      transactionId: txn,
      players
    }, `pres-${rev}`);
    sendChunked("transferui:provider:transaction:commit", {
      protocol: PROTOCOL,
      providerId: PROVIDER_ID,
      transactionId: txn
    }, `txn-commit-${rev}`);
    const unresolved = candidates.filter(x => x.needsResolve),
      endpointGeneration = ++enrichmentGeneration;
    phase = unresolved.length ? "enriching-endpoints" : "ready";
    health("ready", unresolved.length ? `Published ${destinations.length} destination(s); resolving ${unresolved.length} endpoint(s) in background.` : `Published ${destinations.length} destination(s).`);
    console.log(`[${NAME}] initial snapshot published immediately: BSM=${servers.length}, published=${destinations.length}, unresolved=${unresolved.length}, unresolved endpoints disabled.`);
    if (unresolved.length) system.run(() => enrichEndpoints(unresolved, endpointGeneration));
  } catch (e) {
    const msg = `${e?.message??e}`;
    phase = "error";
    lastSync = {
      ...lastSync,
      time: Date.now(),
      error: msg,
      operation,
      httpStatus: Number(e?.status) || 0
    };
    health(hasSnapshot ? "degraded" : "connecting", `Discovery failed; retaining ${lastSync.destinations} last-known destination(s). ${msg}`);
    console.warn(`[${NAME}] sync failed (${operation}): ${msg}`)
  } finally {
    syncing = false;
    if (syncQueued && !enrichmentActive) {
      syncQueued = false;
      scheduleSync("queued")
    }
  }
}
async function enrichEndpoints(candidates, generation) {
  enrichmentActive++;
  let done = 0,
    failed = 0;
  try {
    const work = candidates.slice();
    async function worker() {
      while (work.length && generation === enrichmentGeneration) {
        const {
          server: s,
          name,
          initial
        } = work.shift();
        try {
          console.log(`[${NAME}] endpoint IPC -> server=${name}, operation=get_properties.`);
          const pr = await call("get_properties", {
            path: {
              server_name: name
            }
          }, 0, "properties");
          const props = pr?.properties;
          if (!props || typeof props !== "object") throw Error("properties/get returned no properties object");
          const port = Number(props["server-port"] ?? 0),
            portV6 = Number(props["server-portv6"] ?? 0),
            transport = clean(props.transport);
          if (!Number.isInteger(port) || port < 1 || port > 65535) throw Error(`invalid server-port: ${props["server-port"]}`);
          endpointCache.set(name, {
            port,
            maxPlayers: Number(props["max-players"]) || undefined,
            portV6: Number.isInteger(portV6) ? portV6 : 0,
            transport,
            time: Date.now()
          });
          if (generation !== enrichmentGeneration) return;
          const maxPlayers = Number(props["max-players"]);
          let destination = {
            ...runtimeState.destinations.get(name),
            hostname: transferHost(),
            port,
            maxPlayers: Number.isInteger(maxPlayers) && maxPlayers > 0 ? maxPlayers : undefined,
            metadata: {
              ...(runtimeState.destinations.get(name)?.metadata ?? {}),
              portSource: "properties",
              endpointResolved: true,
              propertiesResolved: true,
              transport: transport || "",
              serverPortV6: Number.isInteger(portV6) ? portV6 : 0
            }
          };
          const applied = applyPolicy([destination]);
          if (!applied.length) continue;
          destination = applied[0];
          runtimeState.destinations.set(name, destination);
          const rev = ++revision;
          sendChunked("transferui:destination:upsert", {
            protocol: PROTOCOL,
            providerId: PROVIDER_ID,
            revision: rev,
            destination
          }, `dest-upsert-${rev}`);
          done++;
          console.log(`[${NAME}] endpoint IPC <- server=${name}, resolved=${transferHost()}:${port}, progress=${done+failed}/${candidates.length}.`);
        } catch (e) {
          failed++;
          console.warn(`[${NAME}] endpoint enrichment failed for ${name}: ${e?.message??e}; destination remains unavailable until its endpoint is resolved.`)
        }
        phase = "enriching-endpoints";
        health("ready", `Destinations live; endpoint enrichment ${done+failed}/${candidates.length} (${done} resolved, ${failed} unresolved).`);
      }
    }
    await Promise.all([worker(), worker()]);
    if (generation === enrichmentGeneration) {
      phase = "ready";
      health("ready", `Published ${lastSync.destinations} destination(s); endpoint enrichment complete (${done} resolved, ${failed} unresolved).`);
      console.log(`[${NAME}] endpoint enrichment complete: resolved=${done}, unresolved=${failed}, total=${candidates.length}.`)
    }
  } finally {
    enrichmentActive = Math.max(0, enrichmentActive - 1);
    if (!enrichmentActive && syncQueued) {
      syncQueued = false;
      scheduleSync("queued")
    }
  }
}

function settleResponse(r) {
  if (!r?.id) return;
  metrics.responses++;
  const q = pending.get(r.id);
  if (!q) {
    metrics.unmatched++;
    return
  }
  system.clearRun(q.timeout);
  pending.delete(r.id);
  if (r.ok) q.resolve(r.data);
  else {
    const error = Error(r.error || `BSM API request failed: ${q.operationId}`);
    error.status = r.status;
    error.data = r.data;
    q.reject(error)
  }
}

function handleEvent(ev) {
  if (ev.id === "transferui:provider:transaction:result") {
    const result = receive(ev.id, ev.message);
    if (result?.providerId === PROVIDER_ID && result.transactionId === publishAck?.id) {
      system.clearRun(publishAck.timer);
      publishAck = null;
      if (result.ok) {
        hasSnapshot = true;
        lastPublicationError = "";
        health("ready", "Snapshot acknowledged")
      } else {
        lastPublicationError = result.error || "Publication rejected";
        lastSnapshotFingerprint = "";
        phase = "publication-error";
        health("degraded", result.error || "Publication rejected");
        scheduleSync("publication-rejected")
      }
    }
    return
  }
  if (ev.id === "bsmapi:response:direct") {
    let r;
    try {
      r = JSON.parse(ev.message)
    } catch {
      metrics.malformed++;
      return
    }
    settleResponse(r);
  } else if (ev.id === "bsmapi:response") {
    const r = receive(ev.id, ev.message);
    if (!r) return;
    settleResponse(r);
  } else if (ev.id === "bsmapi:event") {
    const r = receive(ev.id, ev.message);
    if (r) scheduleEventRefresh(r);
  } else if (ev.id === "bsmapi:status") {
    const r = receive(ev.id, ev.message);
    if (!r) return;
    const first = !apiSeen;
    const previousState = apiStatus?.state;
    const previousHttpReady = !!apiStatus?.httpReady;
    apiSeen = true;
    apiStatus = r;
    if (!hasSnapshot) phase = r.httpReady ? "bsm-http-ready" : "waiting-for-bsm-http";
    if (first) console.log(`[${NAME}] BSM API detected: v${r.version??"?"}, state=${r.state??"unknown"}, httpReady=${!!r.httpReady}.`);
    if (first || previousState !== r.state || previousHttpReady !== !!r.httpReady) {
      if (!first) console.log(`[${NAME}] BSM API state: ${previousState??"unknown"} -> ${r.state??"unknown"} (httpReady=${!!r.httpReady}, wsAuthenticated=${!!r.websocketAuthenticated}).`);
      if (!r.subscriptionConsumers?.[CONSUMER_ID]) ownedTopics = new Set();
      requestApiSubscribe();
      // Server discovery needs authenticated HTTP only; WebSocket is optional live-update transport.
      if (r.httpReady && (!previousHttpReady || !hasSnapshot || (r.state === "live" && previousState !== "live"))) scheduleSync("http-ready");
    }
  } else if (ev.id === "transferui:status") {
    const r = receive(ev.id, ev.message);
    if (r && !r.providers?.some(p => p.id === PROVIDER_ID)) {
      register();
      registerActions();
      lastSnapshotFingerprint = "";
      hasSnapshot = false;
      scheduleSync("provider-missing");
    }
  }
}

system.afterEvents.scriptEventReceive.subscribe(ev => {
  if (ev.id !== "transferui:provider:transaction:result" && ev.id !== "bsmapi:response:direct" && ev.id !== "bsmapi:response" && ev.id !== "bsmapi:event" && ev.id !== "bsmapi:status" && ev.id !== "transferui:status") return;
  if (eventQueue.length >= MAX_QUEUE) {
    metrics.dropped++;
    return
  }
  eventQueue.push({
    id: ev.id,
    message: ev.message
  });
  metrics.queued++;
  metrics.highWater = Math.max(metrics.highWater, eventQueue.length);
});
system.runInterval(() => {
  let n = 0;
  while (eventQueue.length && n++ < MAX_PER_TICK) {
    const ev = eventQueue.shift();
    try {
      handleEvent(ev)
    } catch (e) {
      console.warn(`[${NAME}] IPC handler error: ${e?.message??e}`)
    }
    metrics.processed++
  }
  ipcReceiver.expire();
  configReceiver.expire();
}, 1);

system.runTimeout(() => {
  console.log(`[${NAME}] v${VERSION} loaded: BSM -> Transfer UI Provider API v${PROTOCOL}.`);
  register();
  registerActions();
  health("connecting", "Waiting for BSM API for Minecraft");
  requestApiSubscribe();
  requestApiStatus();
  system.runInterval(() => {
    if (!apiSeen) requestApiStatus();
    else if (apiStatus?.httpReady) scheduleSync("watchdog");
    else requestApiStatus()
  }, WATCHDOG_SYNC_TICKS);
  system.runInterval(() => {
    const state = !apiSeen ? "connecting" : lastSync.error ? "degraded" : hasSnapshot ? "ready" : "connecting";
    const msg = !apiSeen ? "Waiting for BSM API for Minecraft" : !apiStatus?.httpReady ? "Waiting for authenticated BSM HTTP API" : lastSync.error ? `Discovery failed; retaining last-known state. ${lastSync.error}` : hasSnapshot ? `Discovered ${lastSync.servers} BSM server(s); published ${lastSync.destinations}.` : "Waiting for first successful BSM server snapshot";
    health(state, msg)
  }, 200);
}, 20);

// ScriptEventCommandMessageAfterEventSignal is exposed on system.afterEvents.
// Guard the subscription so an API-shape change can never prevent the provider from loading.

const configReceiver = new ChunkReceiver();

function decodeTransferUiEvent(message) {
  try {
    return configReceiver.receive("configure", message, {
      allowDirect: true
    })
  } catch {
    return null
  }
}

const scriptEventSignal = system.afterEvents?.scriptEventReceive;
if (scriptEventSignal?.subscribe) {
  scriptEventSignal.subscribe(ev => {
    if (ev.id !== "transferui_bsm:admin" && ev.id !== "transferui:provider:configure" && ev.id !== "transferui:action:invoke") return;
    let p = ev.sourceEntity;
    if (ev.id === "transferui:action:invoke") {
      const msg = decodeTransferUiEvent(ev.message);
      if (!msg || msg.providerId !== PROVIDER_ID) return;
      p = world.getAllPlayers().find(x => x.id === msg?.player?.id) || world.getAllPlayers().find(x => x.name === msg?.player?.name);
      if (msg.actionId === "refresh" || msg.actionId === "refresh-player") {
        lastSnapshotFingerprint = "";
        scheduleSync(`action-${msg.actionId}`);
        if (p) p.sendMessage("§aBSM refresh queued.");
        return
      }
      if (msg.actionId === "configure") {
        if (isAdmin(p)) system.run(() => adminMenu(p));
        return
      }
      return
    }
    if (ev.id === "transferui:provider:configure") {
      const msg = decodeTransferUiEvent(ev.message);
      if (!msg) return
      if (msg.providerId !== PROVIDER_ID) return;
      p = world.getAllPlayers().find(x => x.id === msg?.player?.id) || world.getAllPlayers().find(x => x.name === msg?.player?.name);
      console.info(`[${NAME}] configure request received: request=${msg.requestId??"none"}, player=${msg?.player?.name??"unknown"}, resolved=${p?.name??"none"}.`);
      if (!p) {
        console.warn(`[${NAME}] configure request ignored: requesting player is no longer online.`);
        return
      }
    }
    if (!p || p.typeId !== "minecraft:player" || !isAdmin(p)) return;
    system.run(() => {
      try {
        adminMenu(p)
      } catch (e) {
        console.warn(`[${NAME}] admin UI failed: ${e?.message??e}`)
      }
    });
  });
} else {
  console.warn(`[${NAME}] scriptEventReceive unavailable; provider admin command UI disabled, provider sync remains active.`);
}
