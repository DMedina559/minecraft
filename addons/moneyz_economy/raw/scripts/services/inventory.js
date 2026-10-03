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
            let left = Math.max(0, Math.floor(Number(amount) || 0));
            // ItemStack amounts may not exceed the item type's own max stack size.
            // Tools, weapons and other non-stackable items (for example spears)
            // therefore need to be delivered as multiple one-item stacks.
            const probe = new ItemStack(typeId, 1);
            const maxPerStack = Math.max(1, Number(probe.maxAmount) || 1);
            while (left > 0) {
                const requested = Math.min(left, maxPerStack);
                const stack = new ItemStack(typeId, requested);
                const remainder = container.addItem(stack);
                const notAdded = Math.max(0, Number(remainder?.amount) || 0);
                const added = requested - notAdded;
                if (added <= 0) break;
                left -= added;
                if (notAdded > 0) break;
            }
            if (left === 0) return true;
        } catch { /* compatibility fallback below */ }
    }
    const name = player.nameTag || player.name;
    const data = legacyData ? ` ${legacyData}` : "";
    const result = await runCommand(player, `execute as "${name.replace(/"/g, '\\"')}" run give @s ${typeId} ${amount}${data}`);
    return Boolean(result && (result.successCount > 0 || result.successCount === undefined));
}

/** Give an exact ItemStack template, splitting quantities by the item's runtime max stack size. */
export async function giveTemplate(player, spec, amount = undefined) {
    const { create } = await import("../core/item_templates.js");
    const container = containerOf(player); if (!container) return false;
    let left = Math.max(1, Math.floor(Number(amount ?? spec?.amount) || 1));
    try {
        while (left > 0) {
            const probe = create(spec, { amount: 1 });
            const n = Math.min(left, Math.max(1, Number(probe.maxAmount) || 1));
            const stack = create(spec, { amount: n });
            const remainder = container.addItem(stack);
            const notAdded = Math.max(0, Number(remainder?.amount) || 0);
            const added = n - notAdded;
            if (added <= 0) return false;
            left -= added;
            if (notAdded > 0) return false;
        }
        return true;
    } catch { return false; }
}

/** Remove only stacks matching an exact captured template (enchantments, potion state, lore, etc.). */
export async function removeTemplate(player, spec, amount = undefined) {
    const { create } = await import("../core/item_templates.js");
    const container = containerOf(player); if (!container) return false;
    const target = create(spec, { amount: 1 });
    let need = Math.max(1, Math.floor(Number(amount ?? spec?.amount) || 1)), found = 0;
    for (let i=0;i<container.size;i++){const item=container.getItem(i);if(item?.typeId===target.typeId&&item.isStackableWith(target))found+=item.amount;}
    if(found<need)return false;
    for (let i=0;i<container.size&&need>0;i++){const item=container.getItem(i);if(!item||item.typeId!==target.typeId||!item.isStackableWith(target))continue;const take=Math.min(need,item.amount);need-=take;if(take===item.amount)container.setItem(i,undefined);else{item.amount-=take;container.setItem(i,item);}}
    return need===0;
}
