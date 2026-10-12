import {
  world,
  system
} from "@minecraft/server";
import {
  MessageFormData
} from "@minecraft/server-ui";
import {
  transferPlayer
} from "@minecraft/server-admin";
import {
  API_LIMITS
} from "./platform.js";

export function createTransferService({
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
  apiMetrics,
  requestId,
  recordVisit,
  prefs,
  getPublished,
  showProgress
}) {
  function notify(p, message, error = false) {
    try {
      if (world.getAllPlayers().some(x => x.id === p.id))(error ? err : info)(p, message)
    } catch (e) {
      console.warn(`[Transfer UI] notification failed: ${e.message}`)
    }
  }
  const cooldowns = new Map(),
    active = new Map(),
    CANCELLED = Symbol("cancelled");

  function transferBlock(p, n) {
    if (!n) return "This destination no longer exists.";
    if (!world.getAllPlayers().some(x => x.id === p.id)) return "Player is no longer online.";
    if (!visible(p, n)) return "You cannot access this destination.";
    if (n.maintenance && !isAdmin(p)) return "This destination is in maintenance.";
    if (n.providerId && !destinationAvailable(n)) return "Destination unavailable or still resolving.";
    if (n.providerMeta?.maxPlayers != null && finite(n.providerMeta.players) >= finite(n.providerMeta.maxPlayers) && !isAdmin(p)) return "This destination is full.";
    return "";
  }

  function cancelTransfer(playerId, reason = "Cancelled by player") {
    const state = active.get(playerId);
    if (!state || state.dispatched) return false;
    state.cancelled = true;
    state.reason = reason;
    cancelPolicy?.(state.policyId);
    state.cancel();
    try {
      state.form?.close?.();
      state.progress?.close()
    } catch {}
    return true;
  }
  async function dispatch(p, initial, state) {
    let target = initial;
    for (let depth = 0; depth <= API_LIMITS.maxRedirects; depth++) {
      if (state.cancelled) return;
      const live = resolveDestination(target.id) || (state.manual ? target : null),
        blocked = transferBlock(p, live);
      if (blocked) {
        emitLifecycle("denied", state.identity, target, {
          requestId: state.id,
          reason: blocked
        });
        apiMetrics.transfersDenied++;
        return notify(p, blocked, true);
      }
      state.destination = live;
      state.progress?.update(`Checking transfer policies for ${live.name}...`);
      emitLifecycle("requested", state.identity, live, {
        requestId: state.id
      });
      state.policyId = `${state.id}-${depth}`;
      const policy = await Promise.race([runPolicies(p, live, state.policyId), state.abort]);
      if (policy === CANCELLED || state.cancelled) return;
      if (policy.result === "deny") {
        apiMetrics.transfersDenied++;
        emitLifecycle("denied", state.identity, live, {
          requestId: state.id,
          reason: policy.reason
        });
        return notify(p, policy.reason || "Transfer denied.", true);
      }
      if (policy.result === "redirect") {
        const next = resolveDestination(policy.destinationId);
        if (depth === API_LIMITS.maxRedirects || !next || next.id === live.id) {
          apiMetrics.transfersDenied++;
          return notify(p, "Invalid or excessive policy redirect.", true);
        }
        emitLifecycle("redirected", state.identity, live, {
          requestId: state.id,
          to: next.id
        });
        apiMetrics.transfersRedirected++;
        target = next;
        state.manual = false;
        continue;
      }
      const latest = resolveDestination(live.id) || (state.manual ? live : null),
        finalBlock = transferBlock(p, latest);
      if (finalBlock) {
        apiMetrics.transfersDenied++;
        emitLifecycle("denied", state.identity, live, {
          requestId: state.id,
          reason: finalBlock
        });
        return notify(p, finalBlock, true);
      }
      const key = `${p.id}:${latest.id}`,
        now = Date.now(),
        until = cooldowns.get(key) ?? 0;
      if (now < until) return notify(p, `Please wait ${Math.ceil((until-now)/1000)}s before using this destination again.`, true);
      const targetData = latest.netherNetId ? {
        netherNetId: latest.netherNetId
      } : {
        hostname: latest.hostname,
        port: Number(latest.port)
      };
      if (!latest.netherNetId && (!targetData.hostname || !Number.isInteger(targetData.port) || targetData.port < 1 || targetData.port > 65535)) throw Error("Invalid hostname or port.");
      if (state.cancelled) return;
      state.progress?.update(`Connecting to ${latest.name}...`);
      state.progress?.close();
      emitLifecycle("started", state.identity, latest, {
        requestId: state.id
      });
      transferPlayer(p, targetData);
      state.dispatched = true;
      cooldowns.set(key, now + (latest.cooldownSeconds ?? 2) * 1000);
      // Dispatch succeeded even if saving optional history subsequently fails.
      apiMetrics.transfersDispatched++;
      emitLifecycle("dispatched", state.identity, latest, {
        requestId: state.id
      });
      try {
        recordVisit(p, latest.id)
      } catch (e) {
        console.warn(`[Transfer UI] history save failed: ${e.message}`)
      }
      notify(p, `Connecting to ${latest.name}...`);
      return;
    }
  }
  async function connect(p, n, manual = false, {
    confirm = true
  } = {}) {
    if (active.has(p.id)) {
      notify(p, "A transfer is already pending. Cancel it before choosing another destination.");
      return;
    }
    const initial = resolveDestination(n.id) || (manual ? n : null),
      blocked = transferBlock(p, initial);
    if (blocked) return notify(p, blocked, true);
    let abort;
    const state = {
      identity: {
        id: p.id,
        name: p.name
      },
      id: requestId("transfer"),
      destination: initial,
      manual,
      cancelled: false,
      dispatched: false,
      abort: new Promise(resolve => abort = resolve),
      cancel: () => abort(CANCELLED)
    };
    active.set(p.id, state);
    apiMetrics.transfersRequested++;
    try {
      const preference = prefs(p),
        confirmation = confirm && (preference.confirmMode === "always" || (preference.confirmMode === "default" && getPublished().settings.confirmTransfers));
      if (confirmation) {
        state.form = new MessageFormData().title("Confirm Transfer").body(`Connect to ${initial.name}?`).button1("Connect").button2("Cancel");
        const response = await Promise.race([state.form.show(p), state.abort]);
        if (response === CANCELLED || response.canceled || response.selection !== 0) {
          state.cancelled = true;
          return;
        }
      }
      if (state.cancelled) return;
      state.progress = showProgress?.(p, initial, () => cancelTransfer(p.id));
      await dispatch(p, initial, state);
    } catch (e) {
      if (!state.cancelled) {
        emitLifecycle("failed", state.identity, state.destination, {
          requestId: state.id,
          error: e.message
        });
        notify(p, `Transfer failed: ${e.message}`, true);
      }
    } finally {
      cancelPolicy?.(state.policyId);
      state.progress?.close();
      if (state.cancelled) emitLifecycle("cancelled", state.identity, state.destination, {
        requestId: state.id,
        reason: state.reason ?? "Cancelled by player"
      });
      if (active.get(p.id) === state) active.delete(p.id);
    }
  }

  function doTransfer(p, n, ctx = {}) {
    return connect(p, n, !!ctx.manual, {
      confirm: false
    })
  }
  system.runInterval(() => {
    const online = new Set(world.getAllPlayers().map(p => p.id));
    for (const [id, state] of active) {
      if (!online.has(id)) cancelTransfer(id, "Player disconnected");
      else if (state.progress?.isShowing?.() === false) cancelTransfer(id, "Progress window closed");
    }
    for (const [key, until] of cooldowns)
      if (until <= Date.now() || !online.has(key.split(":")[0])) cooldowns.delete(key);
  }, 20);
  return {
    connect,
    doTransfer,
    transferBlock,
    cancelTransfer,
    activeTransfers: active
  };
}
