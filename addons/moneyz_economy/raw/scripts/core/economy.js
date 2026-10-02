import { world } from "@minecraft/server";
import { log, LOG_LEVELS } from "../logger.js";
import { record } from "./transactions.js";

const OBJECTIVE = "Moneyz";

function objective() {
    return world.scoreboard.getObjective(OBJECTIVE);
}

export function getBalance(target, useZero = true) {
    const obj = objective();
    if (!obj || !target) return useZero ? 0 : NaN;
    try {
        let score;
        if (typeof target === "string") {
            const participant = world.scoreboard.getParticipants().find(p => p.displayName === target);
            score = participant ? obj.getScore(participant) : obj.getScore(target);
        } else {
            score = obj.getScore(target);
        }
        return score !== undefined ? score : (useZero ? 0 : NaN);
    } catch {
        return useZero ? 0 : NaN;
    }
}

export function setBalance(player, amount, metadata = {}) {
    if (!player || !Number.isFinite(Number(amount))) return false;
    const obj = objective();
    if (!obj) {
        log("Economy: Moneyz objective not found.", LOG_LEVELS.ERROR);
        return false;
    }
    try {
        obj.setScore(player, Math.round(Number(amount)));
        audit("set", player, amount, metadata); record("set", { actor: metadata.actor, to: player, amount, metadata });
        return true;
    } catch (error) {
        log(`Economy.setBalance failed: ${error}`, LOG_LEVELS.ERROR);
        return false;
    }
}

export function deposit(player, amount, metadata = {}) {
    const value = Math.round(Number(amount));
    if (!player || !Number.isFinite(value) || value < 0) return false;
    const obj = objective();
    if (!obj) return false;
    try {
        obj.addScore(player, value);
        audit("deposit", player, value, metadata); record("deposit", { actor: metadata.actor, to: player, amount: value, metadata });
        return true;
    } catch (error) {
        log(`Economy.deposit failed: ${error}`, LOG_LEVELS.ERROR);
        return false;
    }
}

export function withdraw(player, amount, metadata = {}) {
    const value = Math.round(Number(amount));
    if (!player || !Number.isFinite(value) || value < 0) return false;
    const balance = getBalance(player, false);
    if (!Number.isFinite(balance) || balance < value) return false;
    const obj = objective();
    if (!obj) return false;
    try {
        obj.addScore(player, -value);
        audit("withdraw", player, value, metadata); record("withdraw", { actor: metadata.actor, from: player, amount: value, metadata });
        return true;
    } catch (error) {
        log(`Economy.withdraw failed: ${error}`, LOG_LEVELS.ERROR);
        return false;
    }
}

export function transfer(from, to, amount, metadata = {}) {
    const value = Math.round(Number(amount));
    if (!from || !to || from === to || !Number.isFinite(value) || value <= 0) return false;
    const obj = objective();
    if (!obj || getBalance(from) < value) return false;
    try {
        // Keep both mutations in one service boundary so callers cannot accidentally pay only one side.
        obj.addScore(from, -value);
        obj.addScore(to, value);
        audit("transfer", from, value, { ...metadata, to: to.name }); record("transfer", { actor: metadata.actor ?? from, from, to, amount: value, metadata });
        return true;
    } catch (error) {
        log(`Economy.transfer failed: ${error}`, LOG_LEVELS.ERROR);
        return false;
    }
}

function audit(type, player, amount, metadata) {
    log(`Economy ${type}: ${player?.name ?? player?.nameTag ?? "unknown"} ${Math.round(Number(amount))}`, LOG_LEVELS.DEBUG, metadata);
}
