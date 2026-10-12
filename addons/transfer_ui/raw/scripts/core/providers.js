import {
  world,
  system
} from "@minecraft/server";
import {
  ChunkReceiver,
  sendJson,
  senderStatus
} from "./ipc.js";
import {
  PROVIDER_PROTOCOL,
  API_VERSION,
  API_LIMITS,
  CAPABILITIES
} from "./platform.js";
export function createProviderApi({
  PACK,
  clean,
  getPublished,
  visible,
  isAdmin,
  err,
  later,
  showFolder,
  connect,
  cancelTransfer
}) {
  // Transfer UI Provider API 1.0.0. Keep this protocol version frozen until an explicit release bump.
  // ScriptEvent is an interoperability bus, not a hostile-addon security boundary: all payloads are validated,
  // namespaced and capability-gated, but another installed script can observe/emit ScriptEvents.
  const providers = new Map(),
    providerNodes = new Map(),
    presence = new Map(),
    relationships = new Map(),
    groups = new Map(),
    navSections = new Map(),
    providerActions = new Map(),
    policyProviders = new Map(),
    providerHealth = new Map(),
    aliases = new Map(),
    revisions = new Map(),
    providerTransactions = new Map();
  const ipcReceiver = new ChunkReceiver(),
    ipcChunks = ipcReceiver.streams,
    policyPending = new Map(),
    apiEventQueue = [];
  let ipcSeq = 0;
  const apiMetrics = {
    rx: 0,
    tx: 0,
    invalid: 0,
    rejected: 0,
    chunksRx: 0,
    chunksTx: 0,
    chunkTimeouts: 0,
    policyTimeouts: 0,
    transfersRequested: 0,
    transfersDenied: 0,
    transfersRedirected: 0,
    transfersDispatched: 0,
    queued: 0,
    processed: 0,
    dropped: 0,
    queueHighWater: 0,
    handlerErrors: 0,
    lastError: ""
  };
  const now = () => Date.now(),
    requestId = (prefix = "tu") => `${prefix}-${now()}-${++ipcSeq}`;
  const finite = (v, d = 0) => Number.isFinite(Number(v)) ? Number(v) : d;

  function apiReject(reason) {
    apiMetrics.invalid++;
    apiMetrics.rejected++;
    apiMetrics.lastError = clean(reason).slice(0, 240);
    return null
  }

  function metadataOk(v) {
    try {
      return v === undefined || JSON.stringify(v).length <= API_LIMITS.maxMetadataChars
    } catch {
      return false
    }
  }

  function validProviderId(v) {
    return /^[a-z0-9][a-z0-9._-]{0,63}$/i.test(clean(v))
  }

  function validRevision(id, kind, rev) {
    if (rev === undefined || rev === null) return true;
    const n = finite(rev, -1),
      k = `${id}:${kind}`,
      old = revisions.get(k) ?? -1;
    if (n <= old) return false;
    const transaction = providerTransactions.get(id);
    if (transaction) {
      transaction.revisions ??= new Map();
      if (n <= (transaction.revisions.get(k) ?? old)) return false;
      transaction.revisions.set(k, n)
    } else revisions.set(k, n);
    return true
  }

  function providerHas(id, cap) {
    const p = providers.get(id);
    return !!p && ((p.capabilities ?? []).includes(cap) || (cap === "health"))
  }

  function sendIpc(id, payload, streamId = requestId("evt")) {
    try {
      sendJson(system, id, payload, streamId);
      apiMetrics.tx++;
      apiMetrics.chunksTx += Math.max(1, Math.ceil(JSON.stringify(payload).length / 1400))
    } catch (e) {
      apiReject(e.message)
    }
  }

  function receiveIpc(id, msg) {
    apiMetrics.rx++;
    try {
      if (JSON.parse(msg)?.chunk !== undefined) apiMetrics.chunksRx++;
      return ipcReceiver.receive(id, msg, {
        allowDirect: true
      })
    } catch (e) {
      return apiReject(e.message)
    }
  }

  function providerNodeList() {
    const out = [];
    for (const [id, map] of providerNodes) {
      out.push({
        id: `provider:${id}:__root`,
        type: "folder",
        parentId: null,
        name: providers.get(id)?.name || id,
        description: "Provider destinations",
        enabled: true,
        order: providers.get(id)?.priority ? -providers.get(id).priority : 0,
        providerId: id
      });
      out.push(...map.values())
    }
    return out;
  }

  function allPublishedNodes() {
    return [...getPublished().nodes, ...providerNodeList()]
  }

  function providerChildren(parent, p) {
    return providerNodeList().filter(n => (n.parentId ?? null) === (parent ?? null) && visible(p, n))
  }

  function providerSummary(x) {
    const h = providerHealth.get(x.id) ?? {};
    return {
      id: x.id,
      name: x.name,
      version: x.version ?? "",
      protocol: x.protocol,
      apiVersion: API_VERSION,
      priority: x.priority ?? 0,
      capabilities: x.capabilities ?? [],
      state: h.state ?? "registered",
      lastSeen: h.lastSeen ?? x.lastSeen ?? 0,
      destinations: providerNodes.get(x.id)?.size ?? 0,
      presence: presence.get(x.id)?.size ?? 0,
      configure: x.configure ?? null
    }
  }

  function requestProviderConfigure(p, id) {
    const x = providers.get(id);
    if (!x || !providerHas(id, "configure")) return err(p, "This provider does not expose configuration.");
    if (x.configure?.adminOnly !== false && !isAdmin(p)) return err(p, "Operator permission required.");
    const rid = requestId("configure");
    console.info(`[${PACK}] requesting provider configuration: provider=${id}, player=${p.name}, request=${rid}`);
    sendIpc("transferui:provider:configure", {
      protocol: PROVIDER_PROTOCOL,
      apiVersion: API_VERSION,
      providerId: id,
      player: {
        id: p.id,
        name: p.name
      },
      requestId: rid
    });
  }

  function emitProviderStatus(targetId) {
    const payload = {
      protocol: PROVIDER_PROTOCOL,
      apiVersion: API_VERSION,
      transferUiVersion: "3.0.0",
      providers: [...providers.values()].map(providerSummary),
      limits: API_LIMITS,
      capabilities: [...CAPABILITIES],
      metrics: {
        ...apiMetrics,
        queueDepth: apiEventQueue.length,
        pendingChunks: ipcChunks.size,
        pendingPolicies: policyPending.size,
        outgoing: senderStatus(system)
      }
    };
    sendIpc("transferui:status", targetId ? {
      ...payload,
      targetId
    } : payload)
  }

  function normalizeProviderDestination(providerId, x) {
    if (!x || typeof x !== "object" || !metadataOk(x.metadata)) return null;
    const rawId = clean(x.id || x.name).slice(0, 96);
    if (!rawId) return null;
    if (rawId === "__root") return null;
    const id = `provider:${providerId}:${rawId}`;
    if (x.type === "folder") return {
      id,
      externalId: rawId,
      type: "folder",
      requirements: x.requirements ?? {},
      parentId: x.parentId ? `provider:${providerId}:${clean(x.parentId)}` : `provider:${providerId}:__root`,
      name: clean(x.name) || "Folder",
      description: clean(x.description),
      providerId,
      enabled: x.enabled !== false,
      order: finite(x.order, 0)
    };
    const target = x.target && typeof x.target === "object" ? x.target : {},
      type = clean(target.type || x.transferType || (x.netherNetId ? "nethernet" : "bedrock")).toLowerCase();
    if (!["bedrock", "nethernet"].includes(type)) return null;
    const ttl = Math.max(0, finite(x.ttlMs, 0));
    const tags = Array.isArray(x.tags) ? x.tags.slice(0, API_LIMITS.maxTags).map(clean).filter(Boolean) : [];
    return {
      id,
      externalId: rawId,
      type: "server",
      parentId: x.parentId ? `provider:${providerId}:${clean(x.parentId).slice(0,96)}` : `provider:${providerId}:__root`,
      name: clean(x.name).slice(0, 96) || "Server",
      description: clean(x.description).slice(0, 512),
      hostname: clean(target.host || x.hostname).slice(0, 255),
      port: finite(target.port ?? x.port, 19132),
      netherNetId: clean(target.netherNetId || target.id || x.netherNetId).slice(0, 255),
      transferType: type,
      enabled: x.enabled !== false,
      order: finite(x.order, 0),
      requirements: x.requirements ?? {},
      maintenance: !!x.maintenance,
      tags,
      region: clean(x.region).slice(0, 64),
      gameMode: clean(x.gameMode).slice(0, 64),
      cooldownSeconds: Math.max(0, Math.min(300, finite(x.cooldownSeconds, 2))),
      providerId,
      providerPriority: providers.get(providerId)?.priority ?? 0,
      expiresAt: ttl ? now() + ttl : null,
      providerMeta: {
        status: clean(x.status).slice(0, 64),
        players: x.playerCount,
        maxPlayers: x.maxPlayers,
        version: clean(x.version).slice(0, 64),
        latency: x.latency ?? null,
        queue: x.queue ?? null,
        featured: !!x.featured,
        capabilities: Array.isArray(x.capabilities) ? x.capabilities.slice(0, 32).map(clean) : [],
        raw: x.metadata ?? {}
      }
    }
  }

  function ensureProvider(id, cap) {
    id = clean(id);
    if (!id || !providers.has(id)) return null;
    if (cap && !providerHas(id, cap)) {
      apiReject(`Provider ${id} lacks ${cap}`);
      return null
    }
    return id
  }

  function buildDestinations(id, list) {
    if (!Array.isArray(list) || list.length > API_LIMITS.maxDestinationsPerProvider) throw Error("Invalid destination snapshot size");
    const map = new Map();
    for (const value of list) {
      const n = normalizeProviderDestination(id, value);
      if (!n || map.has(n.externalId)) throw Error("Invalid or duplicate destination");
      if (n.type !== "folder" && !n.netherNetId && !n.hostname && n.providerMeta?.raw?.endpointResolved !== false) throw Error("Destination has no endpoint");
      map.set(n.externalId, n)
    }
    const byId = new Map([...map.values()].map(n => [n.id, n])),
      root = `provider:${id}:__root`;
    for (const n of map.values()) {
      let parent = n.parentId;
      const seen = new Set([n.id]);
      while (parent !== root) {
        const folder = byId.get(parent);
        if (!folder || folder.type !== "folder" || seen.has(parent)) throw Error("Invalid provider folder hierarchy");
        seen.add(parent);
        parent = folder.parentId
      }
    }
    return map;
  }

  function upsertDestinations(id, list) {
    const map = new Map(providerNodes.get(id) ?? []);
    for (const value of list ?? []) {
      const n = normalizeProviderDestination(id, value);
      if (!n) throw Error("Invalid destination delta");
      map.set(n.externalId, n)
    }
    if (map.size > API_LIMITS.maxDestinationsPerProvider) throw Error("Too many destinations");
    const byId = new Map([...map.values()].map(n => [n.id, n])),
      root = `provider:${id}:__root`;
    for (const n of map.values()) {
      let parent = n.parentId;
      const seen = new Set([n.id]);
      while (parent !== root) {
        const folder = byId.get(parent);
        if (!folder || folder.type !== "folder" || seen.has(parent)) throw Error("Invalid provider folder hierarchy");
        seen.add(parent);
        parent = folder.parentId
      }
    }
    providerNodes.set(id, map);
  }

  function snapshotDestinations(id, list) {
    providerNodes.set(id, buildDestinations(id, list))
  }

  function presenceMap(id) {
    let m = presence.get(id);
    if (!m) {
      m = new Map();
      presence.set(id, m)
    }
    return m
  }

  function playerKey(x) {
    return clean(x?.xuid || x?.id || x?.name).slice(0, 128)
  }

  function normalizePresence(id, x) {
    if (!x || typeof x !== "object" || !metadataOk(x.metadata)) return null;
    return {
      ...x,
      id: playerKey(x),
      providerId: id,
      name: clean(x.name).slice(0, 96) || "Unknown",
      destinationId: clean(x.destinationId).slice(0, 128),
      status: clean(x.status).slice(0, 32) || "online",
      lastSeen: finite(x.lastSeen, now()),
      metadata: x.metadata ?? {}
    }
  }

  function buildPresence(id, list) {
    if (!Array.isArray(list) || list.length > API_LIMITS.maxPresencePerProvider) throw Error("Invalid presence snapshot size");
    const map = new Map();
    for (const x of list) {
      const p = normalizePresence(id, x);
      if (!p?.id || map.has(p.id)) throw Error("Invalid or duplicate presence");
      map.set(p.id, p)
    }
    return map;
  }

  function snapshotPresence(id, list) {
    presence.set(id, buildPresence(id, list))
  }

  function allPresence() {
    return [...presence.values()].flatMap(m => [...m.values()])
  }

  function presenceByRef(ref, providerId) {
    const r = clean(ref).toLowerCase();
    return allPresence().filter(x => !providerId || x.providerId === providerId).find(x => clean(x.id).toLowerCase() === r || clean(x.xuid).toLowerCase() === r || clean(x.name).toLowerCase() === r) || null
  }

  function localPlayerKey(p) {
    return {
      id: clean(p?.id),
      name: clean(p?.name).toLowerCase(),
      xuid: clean(p?.xuid)
    }
  }

  function relationTouchesPlayer(r, p) {
    const k = localPlayerKey(p),
      vals = [r?.ownerId, r?.ownerXuid, r?.ownerName, r?.sourceId, r?.sourceXuid, r?.sourceName, r?.playerId, r?.playerXuid, r?.playerName].map(v => clean(v).toLowerCase()).filter(Boolean);
    return vals.includes(k.id.toLowerCase()) || vals.includes(k.name) || (k.xuid && vals.includes(k.xuid.toLowerCase()))
  }

  function relationOtherRef(r, p) {
    const k = localPlayerKey(p),
      candidates = [r?.targetXuid, r?.targetId, r?.targetName, r?.friendXuid, r?.friendId, r?.friendName, r?.otherXuid, r?.otherId, r?.otherName];
    for (const v of candidates)
      if (clean(v)) return clean(v);
    const ends = [r?.a, r?.b, r?.source, r?.target].filter(Boolean);
    for (const e of ends) {
      const vals = [e?.xuid, e?.id, e?.name].map(clean).filter(Boolean);
      if (!vals.some(v => v.toLowerCase() === k.id.toLowerCase() || v.toLowerCase() === k.name || (k.xuid && v.toLowerCase() === k.xuid.toLowerCase()))) return vals[0] ?? ""
    }
    return ""
  }

  function relationshipsFor(p) {
    return [...relationships.entries()].flatMap(([providerId, list]) => (Array.isArray(list) ? list : []).filter(r => relationTouchesPlayer(r, p)).map(r => ({
      providerId,
      ...r,
      otherRef: relationOtherRef(r, p)
    })))
  }

  function groupMembers(g) {
    return Array.isArray(g?.members) ? g.members : Array.isArray(g?.players) ? g.players : []
  }

  function groupHasPlayer(g, p) {
    const k = localPlayerKey(p);
    return groupMembers(g).some(m => {
      const vals = [m?.xuid, m?.id, m?.name, typeof m === "string" ? m : ""].map(v => clean(v).toLowerCase()).filter(Boolean);
      return vals.includes(k.id.toLowerCase()) || vals.includes(k.name) || (k.xuid && vals.includes(k.xuid.toLowerCase()))
    })
  }

  function groupsFor(p) {
    return [...groups.entries()].flatMap(([providerId, list]) => (Array.isArray(list) ? list : []).filter(g => groupHasPlayer(g, p)).map(g => ({
      providerId,
      ...g
    })))
  }

  function relationshipLabel(r) {
    return clean(r.label || r.type || r.relationship || r.status) || "Relationship"
  }

  function groupLabel(g) {
    return clean(g.name || g.label || g.id) || "Group"
  }

  function findPlayer(ref) {
    const r = clean(ref);
    return world.getAllPlayers().find(p => p.id === r || p.name === r) || null
  }

  function resolveDestination(ref) {
    let r = clean(ref),
      guard = 0;
    while (aliases.has(r) && guard++ < 8) r = aliases.get(r);
    const matches = allPublishedNodes().filter(n => n.id === r || n.externalId === r || `${n.providerId??""}:${n.externalId??""}` === r);
    return matches.sort((a, b) => (b.providerPriority ?? 0) - (a.providerPriority ?? 0))[0] ?? null
  }

  function destinationAvailable(n) {
    if (!n || n.enabled === false || n.providerMeta?.raw?.endpointResolved === false) return false;
    if (n.providerId && ["stale", "connecting", "degraded"].includes(providerHealth.get(n.providerId)?.state)) return false;
    if (n.expiresAt && n.expiresAt <= now()) return false;
    const s = clean(n.providerMeta?.status).toLowerCase();
    return !["offline", "stopped", "error", "unavailable"].includes(s)
  }

  function emitLifecycle(stage, p, n, extra = {}) {
    sendIpc(`transferui:transfer:${stage}`, {
      protocol: PROVIDER_PROTOCOL,
      apiVersion: API_VERSION,
      stage,
      time: now(),
      requestId: extra.requestId,
      player: {
        id: p.id,
        name: p.name
      },
      destination: {
        id: n.id,
        externalId: n.externalId ?? n.id,
        providerId: n.providerId ?? "local",
        name: n.name,
        target: n.netherNetId ? {
          type: "nethernet",
          id: n.netherNetId
        } : {
          type: "bedrock",
          host: n.hostname,
          port: n.port
        }
      },
      ...extra
    });
  }
  async function runPolicies(p, n, request = requestId("policy")) {
    const active = [...policyProviders.entries()].filter(([, x]) => x.enabled !== false).sort((a, b) => (b[1].priority ?? 0) - (a[1].priority ?? 0));
    if (!active.length) return {
      result: "allow"
    };
    const expected = new Set(active.map(([k]) => k));
    return new Promise(resolve => {
      const timer = system.runTimeout(() => {
        const q = policyPending.get(request);
        policyPending.delete(request);
        apiMetrics.policyTimeouts++;
        const deny = q?.responses.find(x => x.result === "deny");
        resolve(deny ?? {
          result: getPublished().settings.policyTimeout === "allow" ? "allow" : "deny",
          reason: "Transfer policy timed out",
          timedOut: [...expected]
        })
      }, API_LIMITS.policyTicks);
      policyPending.set(request, {
        expected,
        responses: [],
        resolve,
        timer
      });
      sendIpc("transferui:policy:request", {
        protocol: PROVIDER_PROTOCOL,
        apiVersion: API_VERSION,
        requestId: request,
        player: {
          id: p.id,
          name: p.name,
          tags: p.getTags?.() ?? []
        },
        destination: {
          id: n.id,
          externalId: n.externalId ?? n.id,
          providerId: n.providerId ?? "local",
          name: n.name,
          metadata: n.providerMeta?.raw ?? {}
        },
        time: now()
      }, request)
    })
  }

  function cancelPolicy(id) {
    const q = policyPending.get(id);
    if (!q) return;
    system.clearRun(q.timer);
    policyPending.delete(id);
    q.resolve({
      result: "deny",
      reason: "Transfer cancelled"
    })
  }

  function finishPolicy(id) {
    const q = policyPending.get(id);
    if (!q || q.expected.size) return;
    system.clearRun(q.timer);
    policyPending.delete(id);
    const ranked = q.responses.sort((a, b) => (finite(b.priority, policyProviders.get(b.providerId)?.priority ?? 0) - finite(a.priority, policyProviders.get(a.providerId)?.priority ?? 0)));
    const deny = ranked.find(x => x.result === "deny"),
      redirect = ranked.find(x => x.result === "redirect" && x.destinationId);
    q.resolve(deny ?? redirect ?? {
      result: "allow"
    })
  }

  function selectDestination(criteria = {}) {
    let xs = providerNodeList().filter(n => n.type === "server" && destinationAvailable(n));
    if (Array.isArray(criteria.tags) && criteria.tags.length) xs = xs.filter(n => criteria.tags.every(t => (n.tags ?? []).includes(t)));
    if (criteria.providerId) xs = xs.filter(n => n.providerId === criteria.providerId);
    if (criteria.region) xs = xs.filter(n => n.region === criteria.region);
    if (criteria.requireCapacity) xs = xs.filter(n => n.providerMeta?.maxPlayers == null || finite(n.providerMeta.players) < finite(n.providerMeta.maxPlayers));
    xs.sort((a, b) => criteria.lowestPopulation ? (finite(a.providerMeta?.players) - finite(b.providerMeta?.players)) : ((b.providerPriority ?? 0) - (a.providerPriority ?? 0)));
    return xs[0] ?? null
  }

  function providerRemove(id) {
    providers.delete(id);
    providerNodes.delete(id);
    presence.delete(id);
    relationships.delete(id);
    groups.delete(id);
    navSections.delete(id);
    providerActions.delete(id);
    policyProviders.delete(id);
    providerHealth.delete(id);
    providerTransactions.delete(id);
    for (const [key, value] of aliases)
      if (value.startsWith(`provider:${id}:`)) aliases.delete(key);
    for (const k of [...revisions.keys()])
      if (k.startsWith(`${id}:`)) revisions.delete(k);
    emitProviderStatus()
  }

  function handleApiEvent(ev) {
    const x = receiveIpc(ev.id, ev.message);
    if (!x) return;
    try {
      if (ev.id === "transferui:provider:register") {
        const id = clean(x.id);
        const existing = providers.get(id);
        if (existing && existing.sessionId !== x.sessionId) providerRemove(id);
        if (!validProviderId(id) || Number(x.protocol) !== PROVIDER_PROTOCOL || providers.size >= API_LIMITS.maxProviders && !providers.has(id)) return apiReject("Provider registration rejected");
        const capabilities = Array.isArray(x.capabilities) ? x.capabilities.filter(c => CAPABILITIES.has(clean(c))).map(clean) : [];
        providers.set(id, {
          ...x,
          id,
          name: clean(x.name).slice(0, 96) || id,
          protocol: PROVIDER_PROTOCOL,
          apiVersion: API_VERSION,
          priority: finite(x.priority, 0),
          capabilities,
          configure: x.configure && typeof x.configure === "object" ? {
            label: clean(x.configure.label).slice(0, 64) || "Configure",
            adminOnly: x.configure.adminOnly !== false
          } : null,
          lastSeen: now()
        });
        if (!existing) providerHealth.set(id, {
          state: "connecting",
          lastSeen: now(),
          message: "Waiting for provider snapshot"
        });
        emitProviderStatus(id)
      } else if (ev.id === "transferui:provider:heartbeat" || ev.id === "transferui:provider:health") {
        const id = ensureProvider(x.providerId || x.id, "health");
        if (!id) return;
        providerHealth.set(id, {
          state: clean(x.state).slice(0, 32) || "ready",
          lastSeen: now(),
          message: clean(x.message).slice(0, 240),
          latency: x.latency ?? null,
          metadata: metadataOk(x.metadata) ? x.metadata ?? {} : {}
        });
        providers.get(id).lastSeen = now()
      } else if (ev.id === "transferui:provider:transaction:begin") {
        const id = ensureProvider(x.providerId);
        if (!id) return;
        const parts = x.parts ?? ["destinations", "presence"];
        if (!Array.isArray(parts) || !parts.length || parts.length > 2 || new Set(parts).size !== parts.length || parts.some(p => !["destinations", "presence"].includes(p))) throw Error("Invalid transaction parts");
        const previous = providerTransactions.get(id);
        if (previous) sendIpc("transferui:provider:transaction:result", {
          providerId: id,
          transactionId: previous.id,
          ok: false,
          error: "Transaction superseded"
        });
        providerTransactions.set(id, {
          id: clean(x.transactionId) || requestId("txn"),
          sessionId: providers.get(id).sessionId,
          parts,
          destinations: null,
          presence: null,
          created: now(),
          revisions: new Map()
        });
      } else if (ev.id === "transferui:provider:transaction:commit") {
        const id = ensureProvider(x.providerId),
          t = id && providerTransactions.get(id);
        if (!t || clean(x.transactionId) !== t.id) return;
        try {
          if (t.sessionId !== providers.get(id).sessionId || t.parts.some(part => t[part] === null)) throw Error("Transaction is incomplete or its session changed");
          const destinations = t.parts.includes("destinations") ? buildDestinations(id, t.destinations) : null,
            players = t.parts.includes("presence") ? buildPresence(id, t.presence) : null;
          if (destinations) providerNodes.set(id, destinations);
          if (players) presence.set(id, players);
          for (const [key, value] of t.revisions) revisions.set(key, value);
          for (const [key, value] of Object.entries(t.aliases ?? {})) aliases.set(clean(key), `provider:${id}:${clean(value)}`);
          sendIpc("transferui:provider:transaction:result", {
            providerId: id,
            transactionId: t.id,
            ok: true
          });
        } catch (error) {
          sendIpc("transferui:provider:transaction:result", {
            providerId: id,
            transactionId: t.id,
            ok: false,
            error: error.message
          });
          apiReject(error.message)
        } finally {
          providerTransactions.delete(id)
        }
      } else if (ev.id === "transferui:provider:destinations" || ev.id === "transferui:destination:snapshot") {
        const id = ensureProvider(x.providerId, "destinations");
        if (!id) return;
        const t = providerTransactions.get(id);
        if (x.transactionId && (!t || x.transactionId !== t.id)) return apiReject("Destination transaction mismatch");
        if (t && x.transactionId !== t.id) return apiReject("Transaction ID required for staged snapshot");
        if (t && !t.parts.includes("destinations")) throw Error("Unexpected transaction part");
        buildDestinations(id, x.destinations);
        if (!validRevision(id, "destinations", x.revision)) return;
        if (t) {
          if (!t.parts.includes("destinations")) throw Error("Unexpected transaction part");
          t.destinations = x.destinations;
          t.aliases = x.aliases ?? {}
        } else {
          snapshotDestinations(id, x.destinations);
          for (const [key, value] of Object.entries(x.aliases ?? {})) aliases.set(clean(key), `provider:${id}:${clean(value)}`)
        }
      } else if (ev.id === "transferui:destination:upsert") {
        const id = ensureProvider(x.providerId, "destination-deltas");
        if (id && validRevision(id, "destinations", x.revision)) upsertDestinations(id, Array.isArray(x.destinations) ? x.destinations : [x.destination].filter(Boolean))
      } else if (ev.id === "transferui:destination:remove") {
        const id = ensureProvider(x.providerId, "destination-deltas");
        if (!id || !validRevision(id, "destinations", x.revision)) return;
        const m = providerNodes.get(id);
        for (const key of (x.ids ?? [x.id]).slice(0, API_LIMITS.maxDestinationsPerProvider)) m?.delete(clean(key))
      } else if (ev.id === "transferui:provider:presence" || ev.id === "transferui:presence:snapshot") {
        const id = ensureProvider(x.providerId, "presence");
        if (!id) return;
        const t = providerTransactions.get(id);
        if (x.transactionId && (!t || x.transactionId !== t.id)) return apiReject("Presence transaction mismatch");
        if (t && x.transactionId !== t.id) return apiReject("Transaction ID required for staged snapshot");
        if (t && !t.parts.includes("presence")) throw Error("Unexpected transaction part");
        buildPresence(id, x.players);
        if (!validRevision(id, "presence", x.revision)) return;
        if (t) {
          if (!t.parts.includes("presence")) throw Error("Unexpected transaction part");
          t.presence = x.players
        } else snapshotPresence(id, x.players);
      } else if (ev.id === "transferui:presence:upsert" || ev.id === "transferui:presence:join" || ev.id === "transferui:presence:move") {
        const id = ensureProvider(x.providerId, "presence-deltas");
        if (!id || !validRevision(id, "presence", x.revision)) return;
        const m = presenceMap(id);
        for (const v of (x.players ?? [x.player]).slice(0, API_LIMITS.maxPresencePerProvider)) {
          const q = normalizePresence(id, v);
          if (q?.id && (m.has(q.id) || m.size < API_LIMITS.maxPresencePerProvider)) m.set(q.id, q)
        }
      } else if (ev.id === "transferui:presence:remove" || ev.id === "transferui:presence:leave") {
        const id = ensureProvider(x.providerId, "presence-deltas");
        if (!id || !validRevision(id, "presence", x.revision)) return;
        const m = presenceMap(id);
        for (const key of (x.ids ?? [x.id]).slice(0, API_LIMITS.maxPresencePerProvider)) m.delete(clean(key))
      } else if (ev.id === "transferui:relationships:snapshot") {
        const id = ensureProvider(x.providerId, "relationships");
        if (id && Array.isArray(x.relationships) && x.relationships.length <= API_LIMITS.maxRelationshipsPerProvider) relationships.set(id, x.relationships)
      } else if (ev.id === "transferui:groups:snapshot") {
        const id = ensureProvider(x.providerId, "groups");
        if (id && Array.isArray(x.groups) && x.groups.length <= API_LIMITS.maxGroupsPerProvider) groups.set(id, x.groups)
      } else if (ev.id === "transferui:navigation:snapshot") {
        const id = ensureProvider(x.providerId, "navigation");
        if (id && Array.isArray(x.sections) && x.sections.length <= API_LIMITS.maxSectionsPerProvider) navSections.set(id, x.sections)
      } else if (ev.id === "transferui:actions:register") {
        const id = ensureProvider(x.providerId, "actions");
        if (id && Array.isArray(x.actions) && x.actions.length <= API_LIMITS.maxActionsPerProvider) providerActions.set(id, x.actions)
      } else if (ev.id === "transferui:policy:register") {
        const id = ensureProvider(x.providerId, "policies");
        if (id) policyProviders.set(id, {
          priority: finite(x.priority, 0),
          enabled: x.enabled !== false
        })
      } else if (ev.id === "transferui:policy:response") {
        const q = policyPending.get(clean(x.requestId));
        if (!q) return;
        const id = clean(x.providerId);
        if (!q.expected.has(id) || !["allow", "deny", "redirect"].includes(x.result)) return;
        q.expected.delete(id);
        q.responses.push({
          ...x,
          providerId: id
        });
        finishPolicy(clean(x.requestId))
      } else if (ev.id === "transferui:provider:remove") {
        const id = clean(x.providerId);
        if (providers.has(id)) providerRemove(id)
      } else if (ev.id === "transferui:control") {
        const action = clean(x.action),
          req = clean(x.requestId) || requestId("ctl");
        if (action === "status") emitProviderStatus(req);
        else if (action === "snapshot") sendIpc("transferui:snapshot", {
          protocol: PROVIDER_PROTOCOL,
          apiVersion: API_VERSION,
          requestId: req,
          providers: [...providers.values()].map(providerSummary),
          destinations: providerNodeList(),
          presence: [...presence.values()].flatMap(m => [...m.values()]),
          relationships: [...relationships.entries()],
          groups: [...groups.entries()],
          navigation: [...navSections.entries()],
          actions: [...providerActions.entries()],
          metrics: {
            ...apiMetrics
          }
        }, req);
        else if (action === "select") {
          const n = selectDestination(x.criteria ?? {});
          sendIpc("transferui:selection", {
            requestId: req,
            destination: n
          }, req)
        } else if (action === "open") {
          const p = findPlayer(x.player);
          if (p) later(() => showFolder(p, x.folderId ?? null))
        } else if (action === "cancel-transfer") {
          const p = findPlayer(x.player);
          if (p) cancelTransfer(p.id)
        } else if (action === "transfer") {
          const p = findPlayer(x.player),
            n = resolveDestination(x.destinationId);
          if (p && n) later(() => connect(p, n))
        }
      }
    } catch (e) {
      apiMetrics.invalid++;
      apiMetrics.lastError = `${e?.message??e}`.slice(0, 240);
      console.warn(`[${PACK}] provider event failed (${ev.id}): ${e?.stack??e}`)
    }
  }
  // Keep the ScriptEvent callback deliberately tiny. Bedrock can interrupt callbacks that do too much work.
  // Copy only primitive event data into a bounded queue and process it over subsequent ticks.
  function enqueueApiEvent(ev) {
    if (!ev.id.startsWith("transferui:")) return;
    if (apiEventQueue.length >= API_LIMITS.maxQueuedEvents) {
      apiMetrics.dropped++;
      apiMetrics.lastError = "Provider event queue full; newest event dropped";
      return;
    }
    apiEventQueue.push({
      id: ev.id,
      message: typeof ev.message === "string" ? ev.message : ""
    });
    apiMetrics.queued++;
    if (apiEventQueue.length > apiMetrics.queueHighWater) apiMetrics.queueHighWater = apiEventQueue.length;
  }
  system.afterEvents.scriptEventReceive.subscribe(enqueueApiEvent);
  system.runInterval(() => {
    let processed = 0;
    while (apiEventQueue.length && processed < API_LIMITS.maxEventsPerTick) {
      const ev = apiEventQueue.shift();
      try {
        handleApiEvent(ev)
      } catch (e) {
        apiMetrics.handlerErrors++;
        apiMetrics.lastError = `${e?.message??e}`.slice(0, 240);
        console.warn(`[${PACK}] queued provider event failed (${ev?.id??"unknown"}): ${e?.stack??e}`);
      }
      apiMetrics.processed++;
      processed++;
    }
  }, 1);
  // Garbage collect IPC, transactions and expired live state. Stale providers retain their last snapshot.
  system.runInterval(() => {
    const t = now();
    apiMetrics.chunkTimeouts += ipcReceiver.expire();
    for (const [id, p] of providers) {
      const h = providerHealth.get(id) ?? {};
      if (p.lastSeen && t - p.lastSeen > API_LIMITS.providerExpireMs) {
        console.warn(`[${PACK}] provider lease expired: ${id}`);
        providerRemove(id);
        continue
      }
      if (p.lastSeen && t - p.lastSeen > API_LIMITS.providerStaleMs && h.state !== "stale") providerHealth.set(id, {
        ...h,
        state: "stale",
        lastSeen: h.lastSeen ?? p.lastSeen,
        message: "Provider heartbeat is stale; last-known snapshot retained"
      });
      const m = providerNodes.get(id);
      if (m)
        for (const [k, n] of m)
          if (n.expiresAt && n.expiresAt <= t) m.delete(k)
    }
    for (const [id, tv] of providerTransactions)
      if (t - tv.created > API_LIMITS.chunkTtlMs) {
        providerTransactions.delete(id);
        sendIpc("transferui:provider:transaction:result", {
          providerId: id,
          transactionId: tv.id,
          ok: false,
          error: "Transaction expired"
        })
      }
  }, 200);

  return {
    providers,
    providerNodes,
    presence,
    relationships,
    groups,
    navSections,
    providerActions,
    policyProviders,
    providerHealth,
    aliases,
    revisions,
    providerTransactions,
    ipcChunks,
    policyPending,
    apiEventQueue,
    apiMetrics,
    now,
    requestId,
    finite,
    sendIpc,
    providerNodeList,
    allPublishedNodes,
    providerChildren,
    providerSummary,
    requestProviderConfigure,
    emitProviderStatus,
    presenceByRef,
    relationshipsFor,
    groupMembers,
    groupsFor,
    relationshipLabel,
    groupLabel,
    resolveDestination,
    destinationAvailable,
    runPolicies,
    cancelPolicy,
    emitLifecycle,
    handleApiEvent,
    normalizeProviderDestination,
    receiveIpc,
    selectDestination
  };
}
