import * as Economy from "./economy.js";
import * as Transactions from "./transactions.js";
import * as Config from "./config.js";
import * as Shops from "../repositories/shops.js";
import * as Quests from "../quest/engine.js";
import { on, off } from "./events.js";
export const API_VERSION="2.0.0";
export { Economy, Transactions, Config, Shops, Quests, on, off };
export const Moneyz=Object.freeze({version:API_VERSION,economy:Economy,transactions:Transactions,config:Config,shops:Shops,quests:Quests,on,off});
