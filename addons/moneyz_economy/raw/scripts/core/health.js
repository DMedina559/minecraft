import { world } from "@minecraft/server";
import * as Economy from "./economy.js";
import * as Transactions from "./transactions.js";
import * as Config from "./config.js";
import { getShopData } from "../repositories/shops.js";
import { API_VERSION } from "./api.js";
import { getSchemaVersion, SCHEMA_VERSION } from "./migrations.js";
export function snapshot(){const shops=getShopData();return {apiVersion:API_VERSION,schemaVersion:getSchemaVersion(),targetSchema:SCHEMA_VERSION,economyReady:Economy.isReady(),players:world.getPlayers().length,shops:Object.keys(shops).length,transactions:Transactions.count(),syncPlayers:Config.bool("syncPlayers",true)};}
export function formatHealth(){const h=snapshot();return `Moneyz ${h.apiVersion} | schema ${h.schemaVersion}/${h.targetSchema} | objective ${h.economyReady?"OK":"MISSING"} | players ${h.players} | shops ${h.shops} | tx ${h.transactions} | sync ${h.syncPlayers}`;}
