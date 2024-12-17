import { world, system } from "@minecraft/server"

import { main } from './gui/moneyz_menu.js';

world.beforeEvents.itemUse.subscribe(data => {
    const player = data.source
    if (data.itemStack.typeId == "zvortex:moneyz_menu") system.run(() => main(player))

});

export const getScore = (objective, target, useZero = true) => {
    try {
        const obj = world.scoreboard.getObjective(objective);
        if (typeof target === 'string') {
            return obj.getScore(obj.getParticipants().find(v => v.displayName === target));
        }
        return obj.getScore(target.scoreboard);
    } catch {
        return useZero ? 0 : NaN;
    }
};

export function getCurrentUTCDate() {
        const date = new Date();
        return `${date.getUTCFullYear()}-${(date.getUTCMonth() + 1).toString().padStart(2, '0')}-${date.getUTCDate().toString().padStart(2, '0')}`;
};
console.info('utilities.js loaded')