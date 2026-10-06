import * as Storage from "./storage.js";
import * as Shops from "../repositories/shops.js";
import * as Products from "./products.js";
export function initializePets(){
 const db=Storage.namespace("pets"),done=new Set(db.get("defaults")??[]);
 const defaults=[["wolf",500],["cat",400],["parrot",400],["horse",1200],["donkey",800],["mule",1000],["llama",700],["trader_llama",900]];
 for(const product of Products.all()){if(product.type==="pet"&&product.autoTame===undefined&&product.entityId?.startsWith("minecraft:")&&!defaults.some(([id])=>`minecraft:${id}`===product.entityId))Products.upsert({...product,autoTame:false});}
 for(const [entity,price] of defaults){const id=`moneyz:pet_${entity}`;if(!done.has(id)&&!Products.get(id))Products.registerPet({id,name:entity.split("_").map(s=>s[0].toUpperCase()+s.slice(1)).join(" "),entityId:`minecraft:${entity}`,price,description:"Spawned beside you and tamed to you."});done.add(id);}
 db.set("defaults",[...done]);
 const shop=Shops.getShop("petshop");if(!shop)return;
 const seeded=new Set(shop.commonEggMigration??[]);let changed=false;
 for(const entity of ["cow","sheep","chicken","rabbit","fox","frog","bee","panda","turtle","goat","ocelot"]){
  const typeId=`minecraft:${entity}_spawn_egg`;if(seeded.has(typeId)||!Shops.itemExists(typeId))continue;
  if(!shop.listings.some(x=>x.typeId===typeId))Shops.addListing("petshop",{typeId,name:entity[0].toUpperCase()+entity.slice(1)+" Spawn Egg",listingId:`moneyz:egg_${entity}`,category:"spawn_eggs",buy:{price:100,amount:1},sell:{price:-1,amount:1}});
  seeded.add(typeId);changed=true;
 }
 if(changed)Shops.saveShop("petshop",{...Shops.getShop("petshop"),commonEggMigration:[...seeded]});
}
