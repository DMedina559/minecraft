import {
  assertConfiguration,
  configurationDiff
} from "./core/configuration.js";
import {
  createProviderApi
} from "./core/providers.js";
import {
  createTransferService
} from "./core/transfers.js";
import {
  FAV_KEY,
  PREF_KEY,
  HISTORY_KEY,
  DATA_KEY,
  BACKUP_KEY,
  DRAFT_KEY,
  AUDIT_KEY,
  DATA_VERSION,
  MAX_NODES,
  DEF,
  clone,
  parse,
  clean,
  idFrom,
  unique,
  normalize,
  getPublished,
  savePublished,
  publishDraft,
  getDraft,
  saveDraft,
  audit,
  pjson,
  pset,
  favs,
  prefs,
  hist
} from "./core/storage.js";
import {
  pageRows,
  pageButtons,
  filterDestinations
} from "./ui/catalog.js";
import {
  world,
  system,
  PlayerPermissionLevel
} from "@minecraft/server";
import {
  MessageFormData,
  ObservableString,
  ObservableBoolean,
  ObservableNumber
} from "@minecraft/server-ui";
import {
  CustomForm
} from "./ui/custom_form.js";

import {
  PROVIDER_PROTOCOL,
  API_VERSION,
  API_LIMITS,
  CAPABILITIES
} from "./core/platform.js";

const PACK = "Transfer UI";
const later = fn => system.run(fn),
  info = (p, m) => p.sendMessage(`§a[Transfer UI] ${m}`),
  err = (p, m) => p.sendMessage(`§c[Transfer UI] ${m}`);
const isAdmin = p => {
  try {
    return p.playerPermissionLevel === PlayerPermissionLevel.Operator
  } catch {
    return false
  }
};

function ownVisible(p, n) {
  if (n.enabled === false) return false;
  const r = n.requirements ?? {};
  if (r.adminOnly && !isAdmin(p)) return false;
  if (r.tag && !p.hasTag(r.tag)) return false;
  if (r.notTag && p.hasTag(r.notTag)) return false;
  if (r.dimension && p.dimension?.id !== r.dimension) return false;
  if (r.scoreObjective) {
    try {
      const o = world.scoreboard.getObjective(r.scoreObjective);
      const s = o?.getScore(p.scoreboardIdentity);
      if (s === undefined) return false;
      if (r.minScore !== undefined && s < Number(r.minScore)) return false;
      if (r.maxScore !== undefined && s > Number(r.maxScore)) return false
    } catch {
      return false
    }
  }
  return true
}

function visible(p, n) {
  const byId = new Map(allPublishedNodes().map(node => [node.id, node])),
    seen = new Set();
  let current = n;
  while (current) {
    if (seen.has(current.id) || !ownVisible(p, current)) return false;
    seen.add(current.id);
    if (current.parentId == null) return true;
    current = byId.get(current.parentId);
    if (!current) return false
  }
  return false;
}

function children(data, parent, p) {
  const local = data.nodes.filter(n => (n.parentId ?? null) === (parent ?? null) && visible(p, n));
  const external = providerChildren(parent, p);
  return [...local, ...external].sort((a, b) => (a.order ?? 0) - (b.order ?? 0) || a.name.localeCompare(b.name))
}

function recordVisit(p, id) {
  const d = getPublished(),
    max = d.settings.maxRecent ?? 8;
  const h = hist(p).filter(x => x.id !== id);
  h.unshift({
    id,
    time: Date.now()
  });
  pset(p, HISTORY_KEY, h.slice(0, max));
  const pr = prefs(p);
  pr.last = id;
  pset(p, PREF_KEY, pr)
}

function actionsFor(providerId, scope) {
  return (providerActions.get(providerId) ?? []).filter(a => a && (!a.scope || a.scope === scope || a.scope === "any"))
}

function invokeProviderAction(p, providerId, action, target) {
  if (!providerId || !action) return;
  if (action.adminOnly && !isAdmin(p)) return err(p, "This action requires operator permission.");
  sendIpc("transferui:action:invoke", {
    protocol: PROVIDER_PROTOCOL,
    apiVersion: API_VERSION,
    providerId,
    actionId: clean(action.id),
    player: {
      id: p.id,
      name: p.name
    },
    target,
    requestId: requestId("action")
  });
  info(p, `${clean(action.label)||"Provider action"} requested.`)
}

function addProviderActions(form, p, providerId, scope, target) {
  const xs = actionsFor(providerId, scope).filter(a => !a.adminOnly || isAdmin(p));
  if (!xs.length) return;
  form.divider().header("Provider Actions");
  for (const a of xs.slice(0, 12)) form.button(clean(a.label) || clean(a.id) || "Provider Action", () => invokeProviderAction(p, providerId, a, target))
}

function nodeDetail(p, n, parent) {
  n = resolveDestination(n.id) || n;
  const f = favs(p),
    pr = prefs(p),
    isFav = f.includes(n.id),
    liveLabel = new ObservableString(destinationDetail(n), {
      clientWritable: false
    });
  const form = new CustomForm(p, n.name).label(n.description || "No description");
  if (n.type === "server") {
    const meta = [n.gameMode, n.region, ...(n.tags ?? [])].filter(Boolean).join(" • ");
    if (meta) form.label(`§7${meta}`);
    if (n.announcement) form.label(`§e${n.announcement}`);
    if (n.providerId) form.label(liveLabel);
    if (isAdmin(p) && n.providerId) {
      const r = n.providerMeta?.raw ?? {};
      form.label(`§7Source: ${n.providerId}${r.playerStateSource?` • Population: ${r.playerStateSource}`:""}${r.portSource?` • Endpoint: ${r.portSource}`:""}${r.populationObservedAt?`\nObserved: ${new Date(r.populationObservedAt).toISOString()}`:""}`)
    };
    form.divider();
    const blocked = transferBlock(p, n);
    if (blocked) form.label(`Unavailable: ${blocked}`);
    else form.button(n.maintenance ? "Connect (Maintenance)" : "Connect", () => connect(p, n));
    form.button(isFav ? "Remove Favorite" : "Add Favorite", () => {
      let a = favs(p);
      a = isFav ? a.filter(x => x !== n.id) : [...new Set([...a, n.id])];
      pset(p, FAV_KEY, a);
      later(() => nodeDetail(p, n, parent))
    }).button(pr.home === n.id ? "Clear Home" : "Set Home", () => {
      const x = prefs(p);
      x.home = x.home === n.id ? null : n.id;
      pset(p, PREF_KEY, x);
      later(() => nodeDetail(p, n, parent))
    });
    if (n.providerId) addProviderActions(form, p, n.providerId, "destination", {
      type: "destination",
      id: n.externalId ?? n.id,
      name: n.name
    })
  } else if (n.type === "folder") form.divider().button("Open", () => later(() => showFolder(p, n.id)));
  if (n.providerId) watchDetail(form, p, n.id, liveLabel);
  form.divider().button("Refresh Details", () => later(() => nodeDetail(p, n, parent))).button("Back", () => later(() => showFolder(p, parent))).closeButton().show().catch(e => console.warn(`[${PACK}] DDUI show failed: ${e}`))
}

function destinationDetail(n) {
  const h = providerHealth.get(n.providerId) ?? {},
    meta = n.providerMeta ?? {},
    observed = meta.raw?.populationObservedAt;
  return `${meta.status||"Unknown"} • ${meta.players??"?"} player(s)\nProvider: ${h.state||"unknown"}${observed?` • Updated ${Math.max(0,Math.floor((Date.now()-observed)/1000))}s ago`:""}${meta.raw?.endpointResolved===false?`\n${meta.raw.endpointError||"Resolving endpoint"}`:""}`;
}

function watchDetail(form, p, id, label) {
  let ticks = 0;
  const timer = system.runInterval(() => {
    try {
      if (!world.getAllPlayers().some(x => x.id === p.id) || (ticks++ > 0 && !form.isShowing())) {
        system.clearRun(timer);
        return
      }
      const current = resolveDestination(id);
      label.setData(current ? destinationDetail(current) : "Destination removed")
    } catch {
      system.clearRun(timer)
    }
  }, 20);
}

function addNodeButton(form, p, n, parent) {
  const open = () => later(() => n.type === "folder" ? showFolder(p, n.id) : nodeDetail(p, n, parent));
  if (n.type === "server" && n.providerMeta) {
    const status = n.providerMeta?.status ?? "UNKNOWN",
      count = n.providerMeta?.players != null ? `${n.providerMeta.players} player(s)` : "Players unknown",
      detail = n.description ? `\n§7${n.description.slice(0,96)}` : "";
    form.header(`§f§l${n.name}`).label(`§b${status} §8• §f${count}${detail}`).button(`Open ${n.name}`, open);
    return
  }
  if (n.type === "folder") {
    form.header(`§f§l${n.name}`);
    if (n.description) form.label(`§7${n.description.slice(0,120)}`);
    form.button(`Open ${n.name}`, open);
    return
  }
  if (n.description) form.label(`§f${n.name}\n§7${n.description.slice(0,120)}`);
  form.button(`Open ${n.name}`, open)
}

const {
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
} = createProviderApi({
  PACK,
  clean,
  getPublished,
  visible,
  isAdmin,
  err,
  later,
  showFolder,
  connect: (...args) => connect(...args),
  cancelTransfer: (...args) => cancelTransfer(...args)
});
const {
  doTransfer,
  transferBlock,
  connect,
  cancelTransfer,
  activeTransfers
} = createTransferService({
  resolveDestination,
  destinationAvailable,
  visible,
  isAdmin,
  finite,
  err,
  info,
  emitLifecycle,
  runPolicies,
  cancelPolicy,
  showProgress: showTransferProgress,
  apiMetrics,
  requestId,
  recordVisit,
  prefs,
  getPublished
});

function showTransferProgress(p, n, cancel) {
  const label = new ObservableString(`Checking ${n.name}...`, {
      clientWritable: false
    }),
    form = new CustomForm(p, "Transfer Progress").label(label).button("Cancel Transfer", cancel);
  form.show().catch(e => {
    cancel();
    console.warn(`[Transfer UI] transfer progress failed: ${e.message}`)
  });
  return {
    update: text => label.setData(text),
    isShowing: () => form.isShowing(),
    close: () => {
      try {
        form.close()
      } catch {}
    }
  };
}

function breadcrumb(data, parent) {
  const names = [];
  let id = parent,
    guard = 0;
  while (id && guard++ < 12) {
    const n = data.nodes.find(x => x.id === id);
    if (!n) break;
    names.unshift(n.name);
    id = n.parentId ?? null
  }
  return names.length ? `Network / ${names.join(" / ")}` : "Network"
}

function showFolder(p, parent = null, page = 0) {
  const d = getPublished(),
    parentNode = parent ? allPublishedNodes().find(n => n.id === parent) : null;
  const form = new CustomForm(p, parentNode?.name ?? d.settings.title).label(parentNode?.description ?? d.settings.subtitle);
  if (parent) form.label(`§8${breadcrumb(d,parent)}`);
  if (!parent) {
    for (const a of d.announcements.filter(x => x.enabled !== false).slice(0, 3)) form.label(`§e${a.title}: §f${a.text}`);
    form.divider().header("§b§lQuick Access").button("Favorites", () => later(() => showSpecial(p, "favorites"))).button("Recent", () => later(() => showSpecial(p, "recent")));
    const pr = prefs(p);
    const allNodes = [...d.nodes, ...providerNodeList()];
    if (pr.home && allNodes.some(n => n.id === pr.home && visible(p, n))) form.button("Home Server", () => later(() => nodeDetail(p, allNodes.find(n => n.id === pr.home), null)));
    form.button("Player Preferences", () => later(() => playerSettings(p, false)));
    form.button("Search", () => later(() => showSearch(p)));
    if ([...presence.values()].some(m => m.size)) form.button("Network Players", () => later(() => showNetworkPlayers(p)));
    if ([...relationships.values()].some(x => x?.length)) form.button("Friends & Relationships", () => later(() => showRelationships(p)));
    if ([...groups.values()].some(x => x?.length)) form.button("Groups & Parties", () => later(() => showGroups(p)));
    form.divider().header("§a§lNetwork Destinations");
  }
  const list = children(d, parent, p),
    paging = pageRows(list, page);
  for (const n of paging.rows) addNodeButton(form, p, n, parent);
  pageButtons(form, paging, next => later(() => showFolder(p, parent, next)));
  if (!list.length) form.label("§7No destinations in this section.");
  form.divider();
  if (parent) form.button("Back", () => later(() => showFolder(p, parentNode?.parentId ?? null)));
  if (!parent && d.settings.showDirectConnect) form.button("Manual Connection", () => later(() => showDirect(p)));
  if (!parent && isAdmin(p)) form.button("Admin Navigation", () => later(() => showAdmin(p)));
  form.closeButton().show().catch(e => console.warn(`[${PACK}] DDUI show failed: ${e}`))
}

function showSpecial(p, mode, page = 0) {
  const d = getPublished();
  let nodes = [];
  if (mode === "favorites") {
    const s = new Set(favs(p));
    nodes = [...d.nodes, ...providerNodeList()].filter(n => n.type === "server" && s.has(n.id) && visible(p, n))
  } else {
    const map = new Map([...d.nodes, ...providerNodeList()].map(n => [n.id, n]));
    nodes = hist(p).map(h => map.get(h.id)).filter(n => n && n.type === "server" && visible(p, n))
  }
  const form = new CustomForm(p, mode === "favorites" ? "§e§lFavorites" : "§b§lRecent").label(`${nodes.length} destination(s)`).divider();
  const paging = pageRows(nodes, page);
  pageButtons(form, paging, next => later(() => showSpecial(p, mode, next)));
  for (const n of paging.rows) addNodeButton(form, p, n, null);
  if (!nodes.length) form.label("§7Nothing here yet.");
  form.divider().button("§7Back", () => later(() => showFolder(p))).closeButton().show().catch(e => console.warn(`[${PACK}] DDUI show failed: ${e}`))
}

function showSearch(p) {
  const query = new ObservableString("", {
      clientWritable: true
    }),
    online = new ObservableBoolean(false, {
      clientWritable: true
    }),
    capacity = new ObservableBoolean(false, {
      clientWritable: true
    }),
    region = new ObservableString("", {
      clientWritable: true
    }),
    game = new ObservableString("", {
      clientWritable: true
    }),
    sort = new ObservableNumber(0, {
      clientWritable: true
    });
  new CustomForm(p, "Search Servers").textField("Name or tag", query).toggle("Available destinations only", online).toggle("Available capacity only", capacity).textField("Region", region).textField("Game mode", game).dropdown("Sort", sort, [{
    label: "Name",
    value: 0
  }, {
    label: "Fewest players",
    value: 1
  }, {
    label: "Network order",
    value: 2
  }]).button("Search", () => searchResults(p, {
    query: query.getData(),
    online: online.getData(),
    capacity: capacity.getData(),
    region: region.getData(),
    gameMode: game.getData(),
    sort: ["name", "players", "order"][sort.getData()]
  })).button("Back", () => showFolder(p)).closeButton().show().catch(e => console.warn(`[${PACK}] search failed: ${e}`));
}

function searchResults(p, criteria, page = 0) {
  const hits = filterDestinations(allPublishedNodes().filter(n => n.type === "server" && visible(p, n)), criteria, destinationAvailable),
    paging = pageRows(hits, page),
    form = new CustomForm(p, "Search Results");
  for (const n of paging.rows) addNodeButton(form, p, n, null);
  pageButtons(form, paging, next => searchResults(p, criteria, next));
  form.button("Change Filters", () => showSearch(p)).button("Back", () => showFolder(p)).closeButton().show().catch(e => console.warn(`[${PACK}] search results failed: ${e}`));
}

function showPlayerDetail(p, x, back = () => showNetworkPlayers(p)) {
  const n = resolveDestination(`${x.providerId}:${x.destinationId}`),
    form = new CustomForm(p, `§b§l${x.name}`).label(`§fStatus: §a${x.status||"online"}`).label(n ? `§fServer: §b${n.name}` : (x.destinationId ? `§fServer ID: §7${x.destinationId}` : "§7Server not reported."));
  if (x.providerId) form.label(`§7Presence provider: ${x.providerId}`);
  if (n && destinationAvailable(n)) form.divider().button(`Join ${x.name}`, () => connect(p, n));
  const rels = relationshipsFor(p).filter(r => {
    const q = presenceByRef(r.otherRef, r.providerId);
    return q && (q.id === x.id || (q.xuid && x.xuid && q.xuid === x.xuid) || q.name === x.name)
  });
  if (rels.length) form.header("Relationships").label(rels.map(r => `§f${relationshipLabel(r)} §8• §7${r.providerId}`).join("\n"));
  if (x.providerId) addProviderActions(form, p, x.providerId, "player", {
    type: "player",
    id: x.id,
    xuid: x.xuid,
    name: x.name,
    destinationId: x.destinationId
  });
  form.divider().button("Back", () => later(back)).closeButton().show().catch(e => console.warn(`[${PACK}] player detail UI failed: ${e}`))
}

function showNetworkPlayers(p, page = 0) {
  const rows = allPresence().filter(x => x.status !== "offline").sort((a, b) => a.name.localeCompare(b.name)),
    form = new CustomForm(p, "§b§lNetwork Players").label(`§7${rows.length} player(s) reported across ${presence.size} provider(s).`).divider();
  const paging = pageRows(rows, page);
  pageButtons(form, paging, next => later(() => showNetworkPlayers(p, next)));
  for (const x of paging.rows) {
    const n = resolveDestination(`${x.providerId}:${x.destinationId}`);
    form.button(`${x.name}${n?`\n${n.name}`:""}`, () => later(() => showPlayerDetail(p, x, () => showNetworkPlayers(p))))
  }
  if (!rows.length) form.label("§7No provider presence is currently available.");
  form.divider().button("Friends & Relationships", () => later(() => showRelationships(p))).button("Groups & Parties", () => later(() => showGroups(p))).button("Back", () => later(() => showFolder(p))).closeButton().show().catch(e => console.warn(`[${PACK}] DDUI show failed: ${e}`))
}

function showRelationships(p, page = 0) {
  const rows = relationshipsFor(p),
    form = new CustomForm(p, "§d§lFriends & Relationships").label(`§7${rows.length} relationship(s) reported by connected providers.`).divider();
  const paging = pageRows(rows, page);
  pageButtons(form, paging, next => later(() => showRelationships(p, next)));
  for (const r of paging.rows) {
    const x = presenceByRef(r.otherRef, r.providerId),
      name = x?.name || clean(r.targetName || r.friendName || r.otherName || r.otherRef) || "Unknown";
    form.button(`${name}\n${relationshipLabel(r)}${x?" • Online":""}`, () => {
      if (x) later(() => showPlayerDetail(p, x, () => showRelationships(p)));
      else info(p, `${name} is not currently visible on the network.`)
    })
  }
  if (!rows.length) form.label("§7No relationship provider has reported relationships for you.");
  form.divider().button("Network Players", () => later(() => showNetworkPlayers(p))).button("Back", () => later(() => showFolder(p))).closeButton().show().catch(e => console.warn(`[${PACK}] relationships UI failed: ${e}`))
}

function showGroupDetail(p, g, page = 0) {
  const members = groupMembers(g),
    form = new CustomForm(p, `§6§l${groupLabel(g)}`).label(`§7Provider: ${g.providerId} • ${members.length} member(s)`).divider();
  const paging = pageRows(members, page);
  pageButtons(form, paging, next => later(() => showGroupDetail(p, g, next)));
  for (const m of paging.rows) {
    const ref = clean(m?.xuid || m?.id || m?.name || (typeof m === "string" ? m : "")),
      x = presenceByRef(ref, g.providerId),
      name = x?.name || clean(m?.name || (typeof m === "string" ? m : "")) || ref || "Unknown";
    form.button(`${name}${x?`\n${x.status||"online"}`:""}`, () => {
      if (x) later(() => showPlayerDetail(p, x, () => showGroupDetail(p, g)));
      else info(p, `${name} is not currently visible on the network.`)
    })
  }
  const destinations = [...new Set(members.map(m => {
    const ref = clean(m?.xuid || m?.id || m?.name || (typeof m === "string" ? m : ""));
    return presenceByRef(ref, g.providerId)?.destinationId
  }).filter(Boolean))];
  if (destinations.length === 1) {
    const n = resolveDestination(`${g.providerId}:${destinations[0]}`);
    if (n && destinationAvailable(n)) form.divider().button(`Join Group Server: ${n.name}`, () => connect(p, n))
  }
  form.divider().button("Back", () => later(() => showGroups(p))).closeButton().show().catch(e => console.warn(`[${PACK}] group detail UI failed: ${e}`))
}

function showGroups(p, page = 0) {
  const rows = groupsFor(p),
    form = new CustomForm(p, "§6§lGroups & Parties").label(`§7${rows.length} group(s) reported by connected providers.`).divider();
  const paging = pageRows(rows, page);
  pageButtons(form, paging, next => later(() => showGroups(p, next)));
  for (const g of paging.rows) form.button(`${groupLabel(g)}\n${groupMembers(g).length} member(s)`, () => later(() => showGroupDetail(p, g)));
  if (!rows.length) form.label("§7No group provider has reported a group containing you.");
  form.divider().button("Network Players", () => later(() => showNetworkPlayers(p))).button("Back", () => later(() => showFolder(p))).closeButton().show().catch(e => console.warn(`[${PACK}] groups UI failed: ${e}`))
}

function runApiSelfTest(p) {
  const checks = [];
  const check = (name, ok) => checks.push({
    name,
    ok: !!ok
  });
  try {
    check("API version frozen at 1.0.0", API_VERSION === "1.0.0");
    check("Protocol major is 1", PROVIDER_PROTOCOL === 1);
    check("IPC chunk size below ScriptEvent limit", API_LIMITS.chunkChars < 2048);
    check("Provider limit is bounded", API_LIMITS.maxProviders > 0 && API_LIMITS.maxProviders <= 128);
    check("Destination limit is bounded", API_LIMITS.maxDestinationsPerProvider > 0);
    check("Policy redirect depth bounded", API_LIMITS.maxRedirects > 0 && API_LIMITS.maxRedirects <= 16);
    check("Event queue is bounded", API_LIMITS.maxQueuedEvents > 0 && API_LIMITS.maxQueuedEvents <= 4096);
    check("Per-tick processing is bounded", API_LIMITS.maxEventsPerTick > 0 && API_LIMITS.maxEventsPerTick <= 64);
    const sample = normalizeProviderDestination("selftest", {
      id: "sample",
      name: "Sample",
      target: {
        type: "bedrock",
        host: "127.0.0.1",
        port: 19132
      },
      tags: ["test"]
    });
    check("Destination normalization", sample?.hostname === "127.0.0.1" && sample?.port === 19132);
    check("Invalid transfer type rejected", normalizeProviderDestination("selftest", {
      id: "bad",
      target: {
        type: "invalid",
        host: "x"
      }
    }) === null);
    const before = ipcChunks.size;
    receiveIpc("transferui:selftest", "{bad");
    check("Malformed IPC isolated", ipcChunks.size === before);
    const result = checks.every(x => x.ok),
      passed = checks.filter(x => x.ok).length;
    new CustomForm(p, result ? "§a§lAPI Self-Test PASS" : "§c§lAPI Self-Test FAILED").label(`§f${passed}/${checks.length} checks passed`).divider().label(checks.map(x => `${x.ok?"§aPASS":"§cFAIL"} §f${x.name}`).join("\n")).divider().button("Back", () => later(() => showApiDiagnostics(p))).closeButton().show().catch(() => {})
  } catch (e) {
    err(p, `Self-test failed: ${e?.message??e}`)
  }
}

function showApiDiagnostics(p) {
  if (!isAdmin(p)) return;
  const m = apiMetrics;
  new CustomForm(p, "§b§lTransfer UI API Diagnostics").label(`§fProvider API: §a${API_VERSION}  §8• §fProtocol: §a${PROVIDER_PROTOCOL}`).label(`§fProviders: §b${providers.size}  §8• §fDestinations: §b${providerNodeList().length}  §8• §fPresence: §e${[...presence.values()].reduce((a,m)=>a+m.size,0)}`).divider().header("IPC").label(`§fRX: ${m.rx}  §8• §fTX: ${m.tx}\n§fQueue: ${apiEventQueue.length}/${API_LIMITS.maxQueuedEvents}  §8• §fHigh water: ${m.queueHighWater}\n§fQueued: ${m.queued}  §8• §fProcessed: ${m.processed}  §8• §fDropped: ${m.dropped}\n§fHandler errors: ${m.handlerErrors}  §8• §fPer tick: ${API_LIMITS.maxEventsPerTick}\n§fChunks RX: ${m.chunksRx}  §8• §fChunks TX: ${m.chunksTx}\n§fPending chunks: ${ipcChunks.size}  §8• §fChunk timeouts: ${m.chunkTimeouts}\n§fInvalid: ${m.invalid}  §8• §fRejected: ${m.rejected}`).header("Transfers & Policies").label(`§fRequested: ${m.transfersRequested}  §8• §fDispatched: ${m.transfersDispatched}\n§fDenied: ${m.transfersDenied}  §8• §fRedirected: ${m.transfersRedirected}\n§fPolicy timeouts: ${m.policyTimeouts}  §8• §fPending: ${policyPending.size}`).label(m.lastError ? `§eLast API error: §f${m.lastError}` : "§7No API errors recorded.").divider().button("Run Self-Test", () => later(() => runApiSelfTest(p))).button("Provider Details", () => later(() => showProviders(p))).button("Back", () => later(() => showAdmin(p))).closeButton().show().catch(() => {})
}

function showProviders(p) {
  if (!isAdmin(p)) return;
  const form = new CustomForm(p, "§b§lTransfer Providers").label(`§7Provider API ${API_VERSION} • Protocol ${PROVIDER_PROTOCOL}`).divider();
  for (const x of providers.values()) {
    const q = providerSummary(x),
      h = providerHealth.get(x.id) ?? {},
      m = h.metadata ?? {};
    const stateColor = q.state === "ready" ? "§a" : q.state === "connecting" ? "§e" : "§c";
    form.header(q.name).label(`§fState: ${stateColor}${q.state}  §8• §fTransfer destinations: §b${q.destinations}  §8• §fTracked players: §e${q.presence}`).label(`§7Capabilities: ${(q.capabilities??[]).join(", ")||"none"}`);
    if (m.bsmServers !== undefined) {
      form.label(`§fSource servers: §b${m.bsmServers}  §8• §fPublished: §b${m.publishedDestinations??q.destinations}${m.localServer?`\n§fLocal server: §a${m.localServer}${m.localServerManaged?" §7(managed here; hidden from destinations)":" §7(not managed by this BSM; not filtered)"}`:(m.selfServer?`\n§fLocal server: §a${m.selfServer} §7(hidden as a transfer destination)`:"")}`);
      form.label(`§fReported population: §b${m.reportedPopulation??"?"}  §8• §fIdentified players: §e${m.identifiedPlayers??q.presence}\n§fSnapshot generation: §b${m.snapshotGeneration??"?"}  §8• §fPopulation mismatches: §e${m.populationMismatches??0}${m.lastReconcile?.time?`\n§7Last reconcile: ${m.lastReconcile.server||"*"} • ${m.lastReconcile.reason||"unknown"}`:""}`);
      form.label(`§fSync phase: §b${m.phase??"unknown"}  §8• §fSnapshot: ${m.hasSnapshot?"§aYES":"§eNO"}\n§fBSM API: §b${m.bsmApiState??"unknown"}${m.bsmApiAuthenticated===true?" §a(authenticated)":""}${m.rejectedServers?`\n§fRejected servers: §e${m.rejectedServers}`:""}${m.lastOperation?`\n§7Operation: ${m.lastOperation}`:""}`)
    }
    if (h.message) form.label(`§e${h.message}`);
    form.label(`Unresolved endpoints: ${m.unresolvedEndpoints??"?"} • Dropped events: ${m.ipcDropped??0}\nHTTP: ${m.bsmHttpAuthenticated?"authenticated":"waiting"} • WebSocket: ${m.bsmWebsocketState??"unknown"}\nContract: ${m.contract?.version??"bundled"}${m.contract?.lastError?` • ${m.contract.lastError}`:""}`);
    if (m.lastSyncError) form.label(`§cLast sync error: ${m.lastSyncError}`);
    if (providerHas(x.id, "configure") && x.configure) form.button(x.configure.label || `Configure ${q.name}`, () => requestProviderConfigure(p, x.id))
  }
  if (!providers.size) form.label("§7No external providers are registered.");
  form.divider().button("Refresh Status", () => {
    emitProviderStatus();
    later(() => showProviders(p))
  }).button("Back", () => later(() => showAdmin(p))).closeButton().show().catch(e => console.warn(`[${PACK}] DDUI show failed: ${e}`))
}

function showDirect(p) {
  const net = new ObservableBoolean(false, {
      clientWritable: true
    }),
    addr = new ObservableString("", {
      clientWritable: true
    }),
    port = new ObservableString("19132", {
      clientWritable: true
    });
  new CustomForm(p, "§b§lManual Connection").header("§b§lConnect to a Server").label("§7Enter a normal Bedrock hostname/IP and port, or enable NetherNet and enter a NetherNet ID.").toggle("Use NetherNet", net).textField("IP / Hostname / NetherNet ID", addr).textField("Port (IP / hostname only)", port).divider().button("Connect", () => {
    const a = clean(addr.getData());
    if (!a) return err(p, "Enter an IP, hostname, or NetherNet ID.");
    if (net.getData()) return connect(p, {
      id: "manual-nethernet",
      name: a,
      netherNetId: a
    }, true);
    const po = Number(port.getData());
    if (!Number.isInteger(po) || po < 1 || po > 65535) return err(p, "Port must be between 1 and 65535.");
    connect(p, {
      id: "manual-ip",
      name: `${a}:${po}`,
      hostname: a,
      port: po
    }, true)
  }).button("Back", () => later(() => showFolder(p))).closeButton().show().catch(e => console.warn(`[${PACK}] DDUI show failed: ${e}`))
}

function showAdmin(p) {
  if (!isAdmin(p)) return;
  const pub = getPublished(),
    draft = getDraft();
  new CustomForm(p, "§c§lTransfer UI Admin").header("§aDestination Management").label("§7Transfer UI manages transfers and navigation. External server managers can contribute destinations through the Provider API.").label(`§fPublished revision: §a${pub.revision}  §8•  §fDraft items: §e${draft.nodes.length}  §8•  §fProviders: §b${providers.size}`).divider().button("+ Add Destination", () => later(() => adminEditNode(p, null, null, "server"))).button("+ Add Navigation Folder", () => later(() => adminEditNode(p, null, null, "folder"))).button("Manage Destinations & Navigation", () => later(() => adminNodes(p, null))).divider().header("§bTransfer Configuration").button("Announcements", () => later(() => adminAnnouncements(p))).button("Hub Settings", () => later(() => adminSettings(p))).button("Player Preferences", () => later(() => playerSettings(p))).button("Transfer Providers", () => later(() => showProviders(p))).button("API Diagnostics & Self-Test", () => later(() => showApiDiagnostics(p))).divider().header("§eDraft & Publishing").label("§7Changes are private until Publish Draft is used.").button("Publish Draft", () => later(() => confirmPublish(p))).button("Export / Import", () => later(() => adminTransferConfig(p))).button("Audit Log", () => later(() => adminAudit(p))).button("Restore Backup", () => later(() => restoreBackup(p))).divider().button("Back to Server Network", () => later(() => showFolder(p))).closeButton().show().catch(e => console.warn(`[${PACK}] DDUI show failed: ${e}`))
}

function adminNodes(p, parent) {
  if (!isAdmin(p)) return;
  const d = getDraft(),
    par = parent ? allPublishedNodes().find(n => n.id === parent) : null,
    form = new CustomForm(p, par ? `Edit: ${par.name}` : "§lDraft Destinations").header(par ? `§bFolder: §f${par.name}` : "§aDestinations & Navigation").label("§7Select an existing item to edit it, or use the add buttons below. Servers placed at the root appear directly on the main menu; folders can contain more folders, servers, and info pages.").divider();
  for (const n of d.nodes.filter(n => (n.parentId ?? null) === (parent ?? null)).sort((a, b) => a.order - b.order)) form.button(`${n.name}`, () => later(() => n.type === "folder" ? adminFolderActions(p, n.id) : adminEditNode(p, n.id, parent)));
  form.divider().button("§a+ Add Folder", () => later(() => adminEditNode(p, null, parent, "folder"))).button("§a+ Add Server", () => later(() => adminEditNode(p, null, parent, "server"))).button("§a+ Add Info", () => later(() => adminEditNode(p, null, parent, "info"))).button("§7Back", () => later(() => parent ? adminNodes(p, par?.parentId ?? null) : showAdmin(p))).closeButton().show().catch(e => console.warn(`[${PACK}] DDUI show failed: ${e}`))
}

function adminFolderActions(p, id) {
  if (!isAdmin(p)) return;
  const d = getDraft(),
    n = d.nodes.find(x => x.id === id);
  if (!n) return later(() => adminNodes(p, null));
  new CustomForm(p, n.name).button("Open Children", () => later(() => adminNodes(p, id))).button("Edit Folder", () => later(() => adminEditNode(p, id, n.parentId))).button("Move / Reorder Folder", () => later(() => moveNode(p, id))).button("§cDelete Folder", () => later(() => confirmDeleteNode(p, id, n.parentId))).button("§7Back", () => later(() => adminNodes(p, n.parentId))).closeButton().show().catch(e => console.warn(`[${PACK}] DDUI show failed: ${e}`))
}

function adminEditNode(p, id, parent, type) {
  if (!isAdmin(p)) return;
  const d = getDraft(),
    e = d.nodes.find(n => n.id === id),
    kind = e?.type ?? type ?? "info";
  const name = new ObservableString(e?.name ?? "", {
      clientWritable: true
    }),
    desc = new ObservableString(e?.description ?? "", {
      clientWritable: true
    }),
    order = new ObservableString(`${e?.order??0}`, {
      clientWritable: true
    }),
    enabled = new ObservableBoolean(e?.enabled !== false, {
      clientWritable: true
    });
  const form = new CustomForm(p, e ? `Edit: ${e.name}` : `Add ${kind}`).textField("Name", name).textField("Description", desc).textField("Sort Order", order).toggle("Enabled", enabled);
  let host, port, nether, tags, region, game, reco, maint, announce, cool, tag, notTag, dim, obj, min, max;
  if (kind === "server") {
    host = new ObservableString(e?.hostname ?? "", {
      clientWritable: true
    });
    port = new ObservableString(`${e?.port??19132}`, {
      clientWritable: true
    });
    nether = new ObservableString(e?.netherNetId ?? "", {
      clientWritable: true
    });
    tags = new ObservableString((e?.tags ?? []).join(", "), {
      clientWritable: true
    });
    region = new ObservableString(e?.region ?? "", {
      clientWritable: true
    });
    game = new ObservableString(e?.gameMode ?? "", {
      clientWritable: true
    });
    reco = new ObservableBoolean(!!e?.recommended, {
      clientWritable: true
    });
    maint = new ObservableBoolean(!!e?.maintenance, {
      clientWritable: true
    });
    announce = new ObservableString(e?.announcement ?? "", {
      clientWritable: true
    });
    cool = new ObservableString(`${e?.cooldownSeconds??2}`, {
      clientWritable: true
    });
    form.divider().textField("Hostname / IP", host).textField("Port", port).textField("NetherNet ID (overrides hostname)", nether).textField("Tags (comma separated)", tags).textField("Region", region).textField("Game Mode", game).toggle("Recommended", reco).toggle("Maintenance", maint).textField("Destination Notice", announce).textField("Cooldown Seconds", cool)
  }
  tag = new ObservableString(e?.requirements?.tag ?? "", {
    clientWritable: true
  });
  notTag = new ObservableString(e?.requirements?.notTag ?? "", {
    clientWritable: true
  });
  dim = new ObservableString(e?.requirements?.dimension ?? "", {
    clientWritable: true
  });
  obj = new ObservableString(e?.requirements?.scoreObjective ?? "", {
    clientWritable: true
  });
  min = new ObservableString(e?.requirements?.minScore !== undefined ? `${e.requirements.minScore}` : "", {
    clientWritable: true
  });
  max = new ObservableString(e?.requirements?.maxScore !== undefined ? `${e.requirements.maxScore}` : "", {
    clientWritable: true
  });
  const adminOnly = new ObservableBoolean(!!e?.requirements?.adminOnly, {
    clientWritable: true
  });
  form.divider().label("Visibility Requirements").textField("Required Tag", tag).textField("Excluded Tag", notTag).textField("Dimension ID", dim).textField("Scoreboard Objective", obj).textField("Minimum Score", min).textField("Maximum Score", max).toggle("Operators Only", adminOnly).divider().button("§aSave Draft", () => {
    try {
      const cur = getDraft(),
        nm = clean(name.getData());
      if (!nm) return err(p, "Name is required.");
      if (!e && cur.nodes.length >= MAX_NODES) return err(p, `Node limit is ${MAX_NODES}.`);
      let t = e ? cur.nodes.find(n => n.id === id) : {
        id: unique(cur.nodes, idFrom(nm)),
        type: kind,
        parentId: parent ?? null
      };
      if (!t) return;
      t.name = nm;
      t.description = clean(desc.getData());
      t.order = Number(order.getData()) || 0;
      t.enabled = enabled.getData();
      t.requirements = {
        tag: clean(tag.getData()),
        notTag: clean(notTag.getData()),
        dimension: clean(dim.getData()),
        scoreObjective: clean(obj.getData()),
        adminOnly: adminOnly.getData()
      };
      if (clean(min.getData()) !== "") t.requirements.minScore = Number(min.getData());
      if (clean(max.getData()) !== "") t.requirements.maxScore = Number(max.getData());
      if (kind === "server") {
        t.hostname = clean(host.getData());
        t.port = Number(port.getData());
        t.netherNetId = clean(nether.getData());
        if (!t.netherNetId && !t.hostname) return err(p, "Hostname or NetherNet ID is required.");
        t.tags = tags.getData().split(",").map(clean).filter(Boolean);
        t.region = clean(region.getData());
        t.gameMode = clean(game.getData());
        t.recommended = reco.getData();
        t.maintenance = maint.getData();
        t.announcement = clean(announce.getData());
        t.cooldownSeconds = Math.max(0, Number(cool.getData()) || 0)
      }
      if (!e) cur.nodes.push(t);
      saveDraft(cur, p, d.draftRevision ?? 0);
      audit(p, "draft-save", `${kind} ${nm}`);
      info(p, `Saved ${nm} to draft.`);
      later(() => adminNodes(p, parent))
    } catch (x) {
      err(p, x?.message ?? x)
    }
  });
  if (e) form.button("Move / Reorder", () => later(() => moveNode(p, id))).button("§cDelete", () => later(() => confirmDeleteNode(p, id, parent)));
  form.button("§7Cancel", () => later(() => adminNodes(p, parent))).closeButton().show().catch(e => console.warn(`[${PACK}] DDUI show failed: ${e}`))
}

function confirmDeleteNode(p, id, parent) {
  if (!isAdmin(p)) return;
  const d = getDraft(),
    n = d.nodes.find(x => x.id === id);
  if (!n) return;
  new MessageFormData().title("Delete Draft Item").body(`Delete ${n.name} and all of its children?`).button1("Delete").button2("Cancel").show(p).then(r => {
    if (!r.canceled && r.selection === 0 && isAdmin(p)) {
      const ids = new Set([id]);
      let changed = true;
      while (changed) {
        changed = false;
        for (const x of d.nodes)
          if (x.parentId && ids.has(x.parentId) && !ids.has(x.id)) {
            ids.add(x.id);
            changed = true
          }
      }
      d.nodes = d.nodes.filter(x => !ids.has(x.id));
      saveDraft(d, p, d.draftRevision ?? 0);
      audit(p, "draft-delete", n.name)
    }
    later(() => adminNodes(p, parent))
  }).catch(e => err(p, e.message))
}

function adminSettings(p) {
  if (!isAdmin(p)) return;
  const d = getDraft(),
    s = d.settings,
    title = new ObservableString(s.title, {
      clientWritable: true
    }),
    sub = new ObservableString(s.subtitle, {
      clientWritable: true
    }),
    open = new ObservableString(s.openerItem, {
      clientWritable: true
    }),
    direct = new ObservableBoolean(s.showDirectConnect, {
      clientWritable: true
    }),
    confirm = new ObservableBoolean(s.confirmTransfers, {
      clientWritable: true
    }),
    recent = new ObservableString(`${s.maxRecent}`, {
      clientWritable: true
    }),
    timeout = new ObservableBoolean(s.policyTimeout !== "allow", {
      clientWritable: true
    });
  new CustomForm(p, "Draft Hub Settings").textField("Title", title).textField("Subtitle", sub).textField("Opener Item", open).toggle("Allow Players to Use Manual Connection", direct).toggle("Confirm Transfers by Default", confirm).textField("Recent History Size", recent).toggle("Deny transfers when a policy times out", timeout).button("§aSave Draft", () => {
    const x = getDraft();
    x.settings = {
      ...x.settings,
      title: clean(title.getData()) || DEF.settings.title,
      subtitle: clean(sub.getData()),
      openerItem: clean(open.getData()) || "minecraft:compass",
      showDirectConnect: direct.getData(),
      confirmTransfers: confirm.getData(),
      maxRecent: Math.max(1, Math.min(20, Number(recent.getData()) || 8)),
      policyTimeout: timeout.getData() ? "deny" : "allow"
    };
    saveDraft(x, p, d.draftRevision ?? 0);
    audit(p, "draft-settings");
    later(() => showAdmin(p))
  }).button("§7Cancel", () => later(() => showAdmin(p))).closeButton().show().catch(e => console.warn(`[${PACK}] DDUI show failed: ${e}`))
}

function playerSettings(p, admin = true) {
  const pr = prefs(p),
    idx = ["default", "always", "never"].indexOf(pr.confirmMode),
    mode = new ObservableNumber(Math.max(0, idx), {
      clientWritable: true
    });
  new CustomForm(p, "§b§lPlayer Preferences").dropdown("Transfer Confirmation", mode, [{
    label: "Use Network Default",
    value: 0
  }, {
    label: "Always Confirm",
    value: 1
  }, {
    label: "Never Confirm",
    value: 2
  }]).button("Save", () => {
    const x = prefs(p);
    x.confirmMode = ["default", "always", "never"][mode.getData()] ?? "default";
    pset(p, PREF_KEY, x);
    later(() => admin ? showAdmin(p) : showFolder(p))
  }).button("Back", () => later(() => admin ? showAdmin(p) : showFolder(p))).closeButton().show().catch(e => console.warn(`[${PACK}] DDUI show failed: ${e}`))
}

function adminAnnouncements(p) {
  if (!isAdmin(p)) return;
  const d = getDraft(),
    form = new CustomForm(p, "§e§lAnnouncements").label("Published with the draft.").divider();
  for (const a of d.announcements) form.button(`${a.enabled===false?"§8":"§e"}${a.title}`, () => later(() => editAnnouncement(p, a.id)));
  form.divider().button("§a+ Add Announcement", () => later(() => editAnnouncement(p))).button("§7Back", () => later(() => showAdmin(p))).closeButton().show().catch(e => console.warn(`[${PACK}] DDUI show failed: ${e}`))
}

function editAnnouncement(p, id) {
  if (!isAdmin(p)) return;
  const d = getDraft(),
    e = d.announcements.find(a => a.id === id),
    title = new ObservableString(e?.title ?? "", {
      clientWritable: true
    }),
    text = new ObservableString(e?.text ?? "", {
      clientWritable: true
    }),
    enabled = new ObservableBoolean(e?.enabled !== false, {
      clientWritable: true
    });
  const f = new CustomForm(p, e ? "Edit Announcement" : "Add Announcement").textField("Title", title).textField("Message", text).toggle("Enabled", enabled).button("Save Draft", () => {
    const x = getDraft(),
      t = e ? x.announcements.find(a => a.id === id) : {
        id: unique(x.announcements, idFrom(title.getData()))
      };
    t.title = clean(title.getData());
    t.text = clean(text.getData());
    t.enabled = enabled.getData();
    if (!e) x.announcements.push(t);
    saveDraft(x, p, d.draftRevision ?? 0);
    audit(p, "draft-announcement", t.title);
    later(() => adminAnnouncements(p))
  });
  if (e) f.button("§cDelete", () => {
    const x = getDraft();
    x.announcements = x.announcements.filter(a => a.id !== id);
    saveDraft(x, p, d.draftRevision ?? 0);
    later(() => adminAnnouncements(p))
  });
  f.button("Back", () => later(() => adminAnnouncements(p))).closeButton().show().catch(e => console.warn(`[${PACK}] DDUI show failed: ${e}`))
}

function confirmPublish(p) {
  if (!isAdmin(p)) return;
  try {
    const d = getDraft(),
      published = getPublished();
    assertConfiguration(d);
    const diff = configurationDiff(published, d),
      form = new CustomForm(p, "Publish Preview");
    form.label(`Added: ${diff.added.length} • Changed: ${diff.changed.length} • Removed: ${diff.removed.length}`);
    for (const [label, rows] of [
        ["Added", diff.added],
        ["Changed", diff.changed],
        ["Removed", diff.removed]
      ]) {
      form.header(label);
      for (const n of rows) form.label(n.name);
    }
    form.label(`Settings: ${diff.settings?"changed":"unchanged"} • Announcements: ${diff.announcements?"changed":"unchanged"}`);
    form.button("Publish This Draft", () => publishCapturedDraft(p, d, published)).button("Back", () => showAdmin(p)).closeButton().show().catch(e => err(p, e.message));
  } catch (e) {
    err(p, e.message)
  }
}

function publishCapturedDraft(p, d, published) {
  if (!isAdmin(p)) return;
  try {
    if ((getDraft().draftRevision ?? 0) !== (d.draftRevision ?? 0)) throw Error("Draft changed. Reopen Publish Preview.");
    const next = publishDraft(d, p, "publish", published.revision, d.draftRevision ?? 0);
    info(p, `Published revision ${next.revision}.`);
    showAdmin(p);
  } catch (e) {
    err(p, e.message)
  }
}

function restoreBackup(p) {
  if (!isAdmin(p)) return;
  const backup = parse(world.getDynamicProperty(BACKUP_KEY), null);
  if (!backup) return err(p, "No backup exists yet.");
  const draft = getDraft(),
    published = getPublished();
  new MessageFormData().title("Restore Backup").body("Restore the previous configuration as a new published revision?").button1("Restore").button2("Cancel").show(p).then(r => {
    if (r.canceled || r.selection !== 0 || !isAdmin(p)) return;
    try {
      if ((getDraft().draftRevision ?? 0) !== (draft.draftRevision ?? 0)) throw Error("Draft changed. Reopen Restore Backup.");
      publishDraft(normalize(backup), p, "restore-backup", published.revision, draft.draftRevision ?? 0);
      info(p, "Backup restored.");
      showAdmin(p)
    } catch (e) {
      err(p, e.message)
    }
  }).catch(e => err(p, e.message));
}

function adminTransferConfig(p) {
  if (!isAdmin(p)) return;
  const d = getDraft(),
    input = new ObservableString("", {
      clientWritable: true
    });
  new CustomForm(p, "§b§lExport / Import").label("Export is printed to chat. Paste JSON below to import it into the DRAFT only.").button("§eExport Published to Chat", () => {
    p.sendMessage(`§7[Transfer UI Export]\n${JSON.stringify(getPublished())}`)
  }).textField("Import JSON", input).button("§aImport to Draft", () => {
    try {
      const raw = parse(input.getData(), null);
      if (!raw) throw Error("Invalid JSON.");
      assertConfiguration(raw);
      const imported = normalize(raw);
      saveDraft(imported, p, d.draftRevision ?? 0);
      audit(p, "import-draft", `${imported.nodes.length} nodes`);
      info(p, "Imported configuration into draft. Review it before publishing.");
      later(() => showAdmin(p))
    } catch (e) {
      err(p, e?.message ?? e)
    }
  }).button("§7Back", () => later(() => showAdmin(p))).closeButton().show().catch(e => console.warn(`[${PACK}] DDUI show failed: ${e}`))
}

function adminAudit(p) {
  if (!isAdmin(p)) return;
  const a = parse(world.getDynamicProperty(AUDIT_KEY), []),
    f = new CustomForm(p, "§e§lAudit Log").label("Newest changes first.").divider();
  for (const x of a.slice(0, 25)) f.label(`§7${x.time} §f${x.actor} §e${x.action} §7${x.detail??""}`);
  f.divider().button("§7Back", () => later(() => showAdmin(p))).closeButton().show().catch(e => console.warn(`[${PACK}] DDUI show failed: ${e}`))
}

world.beforeEvents.itemUse.subscribe(e => {
  const p = e.source;
  if (e.itemStack?.typeId === getPublished().settings.openerItem) later(() => showFolder(p))
});
world.afterEvents.worldLoad.subscribe(() => {
  try {
    if (world.getDynamicProperty(DATA_KEY) === undefined) {
      savePublished(clone(DEF));
      world.setDynamicProperty(DRAFT_KEY, JSON.stringify(DEF))
    } else {
      const migrated = getPublished();
      if (parse(world.getDynamicProperty(DATA_KEY), {}).version !== DATA_VERSION) {
        migrated.revision = (migrated.revision ?? 0) + 1;
        savePublished(migrated, "system", "schema-migrate");
        world.setDynamicProperty(DRAFT_KEY, JSON.stringify(migrated))
      }
    }
    console.log(`[${PACK}] v3.0.0 loaded: transfers, navigation, and Provider API v${PROVIDER_PROTOCOL}.`);
    system.runTimeout(() => emitProviderStatus(), 20)
  } catch (e) {
    console.error(`[${PACK}] initialization failed`, e)
  }
});

function moveNode(p, id) {
  if (!isAdmin(p)) return;
  const draft = getDraft(),
    node = draft.nodes.find(n => n.id === id);
  if (!node) return;
  const forbidden = new Set([id]);
  let changed = true;
  while (changed) {
    changed = false;
    for (const n of draft.nodes)
      if (forbidden.has(n.parentId) && !forbidden.has(n.id)) {
        forbidden.add(n.id);
        changed = true
      }
  }
  const folders = [{
      id: null,
      name: "Network Root"
    }, ...draft.nodes.filter(n => n.type === "folder" && !forbidden.has(n.id))],
    parent = new ObservableNumber(Math.max(0, folders.findIndex(n => n.id === node.parentId)), {
      clientWritable: true
    }),
    order = new ObservableString(String(node.order ?? 0), {
      clientWritable: true
    });
  new CustomForm(p, `Move: ${node.name}`).dropdown("Folder", parent, folders.map((n, value) => ({
    label: n.name,
    value
  }))).textField("Sort order (lower first)", order).button("Save Move", () => {
    try {
      const next = clone(draft),
        target = next.nodes.find(n => n.id === id),
        selected = folders[parent.getData()];
      if (!selected) throw Error("Invalid folder");
      target.parentId = selected.id;
      target.order = Number(order.getData());
      saveDraft(next, p, draft.draftRevision ?? 0);
      audit(p, "draft-move", node.name);
      adminNodes(p, target.parentId)
    } catch (e) {
      err(p, e.message)
    }
  }).button("Back", () => adminNodes(p, node.parentId)).closeButton().show().catch(e => err(p, e.message));
}
