import { openShop } from "./shop_v3.js";
export function showShopCategories(player,shopId,context={}){return openShop(player,shopId,{source:"browser",...context});}
