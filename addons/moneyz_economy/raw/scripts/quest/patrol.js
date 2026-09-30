import { world, system } from "@minecraft/server";
import { getActiveQuest, completeQuest } from "../gui/quest_menu.js";
import { log, LOG_LEVELS } from "../logger.js";

const playerPatrolTime = new Map();
const playerAreaCovered = new Map();
const playerLastPosition = new Map();
const playerPatrolMessageCooldowns = new Map();
const PATROL_MESSAGE_COOLDOWN = 3000;
const OUT_OF_RANGE_RESET_DELAY = 15000;

system.runInterval(() => {
    for (const player of world.getPlayers()) {
        const activeQuest = getActiveQuest(player);

        if (activeQuest?.objective?.type === "location") {
            const patrolLocationData = world.getDynamicProperty("patrolLocation");

            if (!patrolLocationData || typeof patrolLocationData !== "string") {
                player.sendMessage("§cPatrol location data is missing or invalid. Set patrolLocation property to: \"x,y,z,radius,timeInMinutes\".");
                continue;
            }

            try {
                const parts = patrolLocationData.split(",");
                if (parts.length !== 5) {
                    player.sendMessage("§cInvalid patrol location format. Expected x,y,z,radius,timeInMinutes.");
                    player.setDynamicProperty("activeQuest", null);
                    continue;
                }

                const patrolLocation = {
                    x: parseInt(parts[0].trim(), 10),
                    y: parseInt(parts[1].trim(), 10),
                    z: parseInt(parts[2].trim(), 10),
                    radius: parseInt(parts[3].trim(), 10),
                    requiredTime: parseInt(parts[4].trim(), 10)
                };

                if (Object.values(patrolLocation).some(val => isNaN(val))) {
                    player.sendMessage("§cInvalid patrol location parameters. Numeric values expected.");
                    player.setDynamicProperty("activeQuest", null);
                    continue;
                }

                const pos = player.location;
                const distance = Math.sqrt(
                    Math.pow(pos.x - patrolLocation.x, 2) +
                    Math.pow(pos.y - patrolLocation.y, 2) +
                    Math.pow(pos.z - patrolLocation.z, 2)
                );

                const lastMessageTime = playerPatrolMessageCooldowns.get(player.nameTag) || 0;
                const now = Date.now();

                if (distance > patrolLocation.radius) {
                    const lastOutOfRangeTime = playerLastPosition.get(player.nameTag)?.outOfRangeTime || 0;

                    if (now - lastOutOfRangeTime >= OUT_OF_RANGE_RESET_DELAY) {
                        playerPatrolTime.delete(player.nameTag);
                        playerAreaCovered.delete(player.nameTag);
                        playerLastPosition.delete(player.nameTag);
                        playerPatrolMessageCooldowns.delete(player.nameTag);
                        try { player.onScreenDisplay.setActionBar("§cOut of patrol area! Patrol reset."); } catch {}
                    }

                    playerLastPosition.set(player.nameTag, { outOfRangeTime: now });

                    if (now - lastMessageTime >= PATROL_MESSAGE_COOLDOWN) {
                        const distRem = Math.round(distance - patrolLocation.radius);
                        try { player.onScreenDisplay.setActionBar(`§eYou are ${distRem} blocks away from patrol zone`); } catch {}
                        playerPatrolMessageCooldowns.set(player.nameTag, now);
                    }
                    continue;
                }

                let areaCovered = playerAreaCovered.get(player.nameTag) || 0;
                const lastPos = playerLastPosition.get(player.nameTag);

                if (lastPos && lastPos.x !== undefined) {
                    const distTraveled = Math.sqrt(
                        Math.pow(pos.x - lastPos.x, 2) +
                        Math.pow(pos.z - lastPos.z, 2)
                    );
                    areaCovered += distTraveled;
                }

                playerLastPosition.set(player.nameTag, { x: pos.x, z: pos.z });
                playerAreaCovered.set(player.nameTag, areaCovered);

                if (!playerPatrolTime.has(player.nameTag)) {
                    playerPatrolTime.set(player.nameTag, now);
                }

                const remArea = Math.max(0, activeQuest.objective.minAreaCovered - areaCovered);
                const roundedRemArea = Math.round(remArea);

                if (now - lastMessageTime >= PATROL_MESSAGE_COOLDOWN) {
                    const timeInArea = now - playerPatrolTime.get(player.nameTag);
                    const remTime = patrolLocation.requiredTime * 60000 - timeInArea;

                    if (roundedRemArea > 0 || remTime > 0) {
                        const mins = Math.max(0, Math.floor(remTime / 60000));
                        const secs = Math.max(0, Math.floor((remTime % 60000) / 1000));
                        try {
                            player.onScreenDisplay.setActionBar(`§ePatrol: ${roundedRemArea} blocks rem | ${mins}m ${secs}s rem`);
                        } catch {}
                        playerPatrolMessageCooldowns.set(player.nameTag, now);
                    }
                }

                if (areaCovered >= activeQuest.objective.minAreaCovered) {
                    const timeInArea = now - playerPatrolTime.get(player.nameTag);
                    if (timeInArea >= patrolLocation.requiredTime * 60000) {
                        completeQuest(player, activeQuest);
                        try { player.onScreenDisplay.setActionBar("§aPatrol Quest Completed! 🎉"); } catch {}
                        playerAreaCovered.delete(player.nameTag);
                        playerPatrolTime.delete(player.nameTag);
                        playerLastPosition.delete(player.nameTag);
                        playerPatrolMessageCooldowns.delete(player.nameTag);
                    }
                }
            } catch (error) {
                log(`Error processing patrol quest: ${error}`, LOG_LEVELS.ERROR);
                player.setDynamicProperty("activeQuest", null);
            }
        }
    }
}, 20);

log("patrol.js loaded", LOG_LEVELS.DEBUG);
