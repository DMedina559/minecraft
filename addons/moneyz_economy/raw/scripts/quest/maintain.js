// Compatibility shim. Timed balance quests are now owned by QuestEngine.
import { startQuest } from "./engine.js";
export function startMaintainBalanceQuest(player, quest) { return startQuest(player, quest?.id ?? quest?.property); }
