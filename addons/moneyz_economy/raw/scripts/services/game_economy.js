import * as Feedback from "../core/feedback.js";
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

function _audio_placeBet(player, amount, game) {
    const check = validateStake(player, amount);
    if (!check.ok) return false;
    const ok=Economy.withdraw(player, check.stake, { type: "game_bet", source: "game", game }); if(ok)Treasury.collect(check.stake,{type:"game_bet",game}); return ok;
}

function _audio_payout(player, amount, game, metadata = {}) {
    const value = Math.max(0, Math.round(Number(amount) || 0));
    if (value <= 0) return true;
    const pay=Treasury.payout(value,{type:"game_payout",game,...metadata});if(!pay.ok)return false;if(Economy.deposit(player,value,{type:"game_payout",source:"game",game,...metadata}))return true;Treasury.collect(value,{type:"game_payout_rollback",game});return false;
}

function _audio_push(player, stake, game, metadata = {}) {
    const value = Math.max(0, Math.round(Number(stake) || 0));
    if (value <= 0) return true;
    const pay=Treasury.payout(value,{type:"game_push",game,...metadata});if(!pay.ok)return false;if(Economy.deposit(player,value,{type:"game_push",source:"game",game,...metadata}))return true;Treasury.collect(value,{type:"game_push_rollback",game});return false;
}

// Audio outcome wrappers preserve all original return values.
export function placeBet(...args){return Feedback.run(args[0],()=>_audio_placeBet(...args),{errorOnly:true});}
export function payout(...args){return Feedback.run(args[0],()=>_audio_payout(...args),{success:"celebrate",quiet:!(Number(args[1])>0)});}
export function push(...args){return Feedback.run(args[0],()=>_audio_push(...args),{errorOnly:true});}
