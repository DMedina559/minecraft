import { world, system } from "@minecraft/server"
import { main } from './gui/moneyz_menu.js';
import { log, LOG_LEVELS } from './logger.js';

world.beforeEvents.itemUse.subscribe(data => {
    const player = data.source
    if (data.itemStack.typeId == "zvortex:moneyz_menu") {
        log(`Player ${player.nameTag} used Moneyz Menu item.`, LOG_LEVELS.DEBUG);
        system.run(() => main(player))
    }
});

export const getScore = (objective, target, useZero = true) => {
  try {
    const obj = world.scoreboard.getObjective(objective);
    if (typeof target === 'string') {
      const participant = obj.getParticipants().find(v => v.displayName === target);
      if (!participant) {
        log(`Player "${target}" not found in objective "${objective}".`, LOG_LEVELS.DEBUG);
        return useZero ? 0 : NaN;
      }
      return obj.getScore(participant);
    }
    return obj.getScore(target.scoreboard);
  } catch (error) {
    log(`Error getting score for "${objective}" and "${target}":`, LOG_LEVELS.ERROR, error);
    return useZero ? 0 : NaN;
  }
};


export function getCurrentUTCDate() {
        const date = new Date();
        return `${date.getUTCFullYear()}-${(date.getUTCMonth() + 1).toString().padStart(2, '0')}-${date.getUTCDate().toString().padStart(2, '0')}`;
};

log('utilities.js loaded', LOG_LEVELS.DEBUG);