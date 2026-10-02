import { ItemStack } from "@minecraft/server";
import { runCommand } from "../compat/commands.js";

function containerOf(player) { return player.getComponent("minecraft:inventory")?.container ?? player.getComponent("inventory")?.container; }

export function count(player, typeId) {
    const container = containerOf(player); if (!container) return 0;
    let total = 0;
    for (let i = 0; i < container.size; i++) { const item = container.getItem(i); if (item?.typeId === typeId) total += item.amount; }
    return total;
}

export async function remove(player, typeId, amount, legacyData = 0) {
    if (legacyData) {
        const name = player.nameTag || player.name;
        const test = await runCommand(player, `execute as "${name.replace(/"/g, '\\"')}" run testfor @s[hasitem={item=${typeId},data=${legacyData},quantity=${amount}..}]`);
        if (!test || (test.successCount !== undefined && test.successCount <= 0)) return false;
        const result = await runCommand(player, `execute as "${name.replace(/"/g, '\\"')}" run clear @s ${typeId} ${legacyData} ${amount}`);
        return Boolean(result && (result.successCount > 0 || result.successCount === undefined));
    }
    const container = containerOf(player); if (!container || count(player, typeId) < amount) return false;
    let left = amount;
    for (let i = 0; i < container.size && left > 0; i++) {
        const item = container.getItem(i); if (item?.typeId !== typeId) continue;
        const take = Math.min(left, item.amount); left -= take;
        if (take === item.amount) container.setItem(i, undefined); else { item.amount -= take; container.setItem(i, item); }
    }
    return left === 0;
}

export async function give(player, typeId, amount, legacyData = 0) {
    const container = containerOf(player);
    if (container && (!legacyData || legacyData === 0)) {
        try {
            let left = amount;
            while (left > 0) {
                const stack = new ItemStack(typeId, Math.min(left, 64));
                const remainder = container.addItem(stack);
                left -= stack.amount - (remainder?.amount ?? 0);
                if (remainder) break;
            }
            if (left === 0) return true;
        } catch { /* compatibility fallback below */ }
    }
    const name = player.nameTag || player.name;
    const data = legacyData ? ` ${legacyData}` : "";
    const result = await runCommand(player, `execute as "${name.replace(/"/g, '\\"')}" run give @s ${typeId} ${amount}${data}`);
    return Boolean(result && (result.successCount > 0 || result.successCount === undefined));
}
