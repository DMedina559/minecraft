import { world, system } from "@minecraft/server";
import { updateScore, getCurrentUTCDate } from '../utilities.js';
import { getActiveQuest, completeQuest } from "../gui/quest_menu.js";
import { log, LOG_LEVELS } from '../logger.js';

const playerPatrolTime = new Map();
const playerAreaCovered = new Map();
const playerLastPosition = new Map();
const playerPatrolMessageCooldowns = new Map();
const PATROL_MESSAGE_COOLDOWN = 5000;
const OUT_OF_RANGE_RESET_DELAY = 15000;

system.runInterval(() => {
    for (const player of world.getPlayers()) {
        const activeQuest = getActiveQuest(player);

        if (activeQuest && activeQuest.objective.type === "location") {
            const patrolLocationData = world.getDynamicProperty('patrolLocation');

            if (!patrolLocationData) {
                player.sendMessage("§cPatrol location data is missing. Set patrolLocation property to:\"x,y,z,radius,timeInMinutes\".");
                continue;
            }

            if (typeof patrolLocationData !== 'string') {
                log(`Patrol location data is not a string:`, LOG_LEVELS.WARN, patrolLocationData);
                player.sendMessage("§cPatrol location data is in an incorrect format.");
                continue;
            }

            try {
                const patrolLocationParts = patrolLocationData.split(',');

                if (patrolLocationParts.length !== 5) {
                    log(`Invalid patrol location data format. Expected x,y,z,radius,timeInMinutes.`, LOG_LEVELS.WARN);
                    player.sendMessage("§cInvalid patrol location data format. Expected x,y,z,radius,timeInMinutes.");
                    player.setDynamicProperty("activeQuest", null);
                    continue;
                }

                const patrolLocation = {
                    x: parseInt(patrolLocationParts[0].trim()),
                    y: parseInt(patrolLocationParts[1].trim()),
                    z: parseInt(patrolLocationParts[2].trim()),
                    radius: parseInt(patrolLocationParts[3].trim()),
                    requiredTime: parseInt(patrolLocationParts[4].trim())
                };

                if (isNaN(patrolLocation.x) || isNaN(patrolLocation.y) || isNaN(patrolLocation.z) || isNaN(patrolLocation.radius) || isNaN(patrolLocation.requiredTime)) {
                    log(`Invalid patrol location parameters. Please provide numbers.`, LOG_LEVELS.WARN);
                    player.sendMessage("§cInvalid patrol location parameters. Please provide numbers.");
                    player.setDynamicProperty("activeQuest", null);
                    continue;
                }

                const playerLocation = player.location;
                const distance = Math.sqrt(
                    Math.pow(playerLocation.x - patrolLocation.x, 2) +
                    Math.pow(playerLocation.y - patrolLocation.y, 2) +
                    Math.pow(playerLocation.z - patrolLocation.z, 2)
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
                        player.sendMessage("§cYou left the patrol area. The patrol has been reset.");
                    } 

                    playerLastPosition.set(player.nameTag, { outOfRangeTime: now });

                    if (now - lastMessageTime >= PATROL_MESSAGE_COOLDOWN) {
                        const distanceRemaining = Math.round(distance - patrolLocation.radius);
                        player.sendMessage(`§eYou are ${distanceRemaining} blocks away from the patrol area.`);
                        playerPatrolMessageCooldowns.set(player.nameTag, now);
                    }
                    continue;
                }

                let areaCovered = playerAreaCovered.get(player.nameTag) || 0;
                let lastPosition = playerLastPosition.get(player.nameTag);

                if (lastPosition) {
                    const distanceTraveled = Math.sqrt(
                        Math.pow(playerLocation.x - lastPosition.x, 2) +
                        Math.pow(playerLocation.z - lastPosition.z, 2)
                    );
                    areaCovered += distanceTraveled;
                }

                playerLastPosition.set(player.nameTag, { x: playerLocation.x, z: playerLocation.z });
                playerAreaCovered.set(player.nameTag, areaCovered);

                if (!playerPatrolTime.has(player.nameTag)) {
                    playerPatrolTime.set(player.nameTag, Date.now());
                }

                const remainingArea = Math.max(0, activeQuest.objective.minAreaCovered - areaCovered);
                const roundedRemainingArea = Math.round(remainingArea);

                if (roundedRemainingArea > 0 && now - lastMessageTime >= PATROL_MESSAGE_COOLDOWN) {
                    const timeInArea = Date.now() - playerPatrolTime.get(player.nameTag);
                    const remainingTime = patrolLocation.requiredTime * 60 * 1000 - timeInArea;

                    if (remainingTime > 0) {
                        const minutesRemaining = Math.floor(remainingTime / (1000 * 60));
                        const secondsRemaining = Math.floor((remainingTime % (1000 * 60)) / 1000);
                        player.sendMessage(`§eYou still need to cover ${roundedRemainingArea} more blocks and patrol for ${minutesRemaining} minutes and ${secondsRemaining} seconds.`);
                        playerPatrolMessageCooldowns.set(player.nameTag, now);
                    }
                }

                if (areaCovered >= activeQuest.objective.minAreaCovered) {
                    const timeInArea = Date.now() - playerPatrolTime.get(player.nameTag);

                    if (timeInArea >= patrolLocation.requiredTime * 60 * 1000) {
                        if (now - lastMessageTime >= PATROL_MESSAGE_COOLDOWN) {
                            completeQuest(player, activeQuest);
                            player.sendMessage("§aQuest completed! You have finished patrolling.");
                            playerAreaCovered.delete(player.nameTag);
                            playerPatrolTime.delete(player.nameTag);
                            playerLastPosition.delete(player.nameTag);
                            playerPatrolMessageCooldowns.delete(player.nameTag);
                            continue;
                        }
                    }
                }

            } catch (error) {
                log(`Error parsing patrol location data:`, LOG_LEVELS.ERROR, error);
                player.setDynamicProperty("activeQuest", null);
            }
        }
    }
});

log('patrol.js loaded', LOG_LEVELS.DEBUG);
