import * as Economy from "../core/economy.js";
import * as Treasury from "../core/treasury.js";

const activeGames = new Map();
const keyFor = player => player?.id ?? player?.name ?? player?.nameTag;

export function validateStake(player, amount) {
    const stake = Math.floor(Number(amount));
    if (!Number.isFinite(stake) || stake <= 0) return { ok: false, reason: "invalid", stake: 0 };
    if (Economy.getBalance(player) < stake) return { ok: false, reason: "insufficient", stake };
    return { ok: true, stake };
}

export function beginSession(player, game) {
    const key = keyFor(player);
    if (!key) return false;
    if (activeGames.has(key)) return false;
    activeGames.set(key, { game, startedAt: Date.now() });
    return true;
}

export function endSession(player) {
    const key = keyFor(player);
    if (key) activeGames.delete(key);
}

export function isPlaying(player) {
    const key = keyFor(player);
    return key ? activeGames.has(key) : false;
}

export function placeBet(player, amount, game) {
    const check = validateStake(player, amount);
    if (!check.ok) return false;
    const ok=Economy.withdraw(player, check.stake, { type: "game_bet", source: "game", game }); if(ok)Treasury.collect(check.stake,{type:"game_bet",game}); return ok;
}

export function payout(player, amount, game, metadata = {}) {
    const value = Math.max(0, Math.round(Number(amount) || 0));
    if (value <= 0) return true;
    const pay=Treasury.payout(value,{type:"game_payout",game,...metadata});if(!pay.ok)return false;if(Economy.deposit(player,value,{type:"game_payout",source:"game",game,...metadata}))return true;Treasury.collect(value,{type:"game_payout_rollback",game});return false;
}

export function push(player, stake, game, metadata = {}) {
    const value = Math.max(0, Math.round(Number(stake) || 0));
    if (value <= 0) return true;
    const pay=Treasury.payout(value,{type:"game_push",game,...metadata});if(!pay.ok)return false;if(Economy.deposit(player,value,{type:"game_push",source:"game",game,...metadata}))return true;Treasury.collect(value,{type:"game_push_rollback",game});return false;
}
