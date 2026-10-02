import * as Economy from "../core/economy.js";
export function placeBet(player, amount, game) { return Economy.withdraw(player, amount, { source: "game", game }); }
export function payout(player, amount, game) { return Economy.deposit(player, amount, { source: "game", game }); }
