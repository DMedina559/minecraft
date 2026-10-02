import * as Economy from "../core/economy.js";
import * as Inventory from "./inventory.js";

export async function buy(player, product, context={}) {
    const price=Math.round(Number(product.price??product.buyPrice??0)), amount=Math.max(1,Math.round(Number(product.amount??1))), typeId=product.typeId??product.id;
    if(!typeId||price<0)return {ok:false,reason:"invalid_product"};
    if(Economy.getBalance(player)<price)return {ok:false,reason:"insufficient_funds"};
    if(!Economy.withdraw(player,price,{type:"shop_purchase",source:context.source??"shop",shopId:context.shopId,itemId:typeId,itemAmount:amount}))return {ok:false,reason:"charge_failed"};
    if(!await Inventory.give(player,typeId,amount,product.data??product.buyDamage??0)){
        Economy.deposit(player,price,{type:"shop_refund",source:context.source??"shop",shopId:context.shopId,itemId:typeId,itemAmount:amount});
        return {ok:false,reason:"inventory_full_or_give_failed"};
    }
    return {ok:true,price,amount,typeId};
}
export async function sell(player, product, context={}) {
    const price=Math.round(Number(product.price??product.sellPrice??0)), amount=Math.max(1,Math.round(Number(product.amount??1))), typeId=product.typeId??product.id;
    if(!typeId||price<0)return {ok:false,reason:"invalid_product"};
    if(!await Inventory.remove(player,typeId,amount,product.data??product.sellDamage??0))return {ok:false,reason:"missing_items"};
    if(!Economy.deposit(player,price,{type:"shop_sale",source:context.source??"shop",shopId:context.shopId,itemId:typeId,itemAmount:amount})){
        await Inventory.give(player,typeId,amount,product.data??product.sellDamage??0); return {ok:false,reason:"payout_failed"};
    }
    return {ok:true,price,amount,typeId};
}
