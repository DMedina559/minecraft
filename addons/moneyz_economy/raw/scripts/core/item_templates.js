import { ItemStack, ItemTypes, EnchantmentTypes, Potions } from "@minecraft/server";

const clone=v=>v===undefined?undefined:JSON.parse(JSON.stringify(v));
const cleanId=v=>String(v??"").trim();
const safe=(fn,fallback)=>{try{return fn();}catch{return fallback;}};

export function itemCatalog(query="",limit=500){const q=String(query).trim().toLowerCase();let rows=safe(()=>ItemTypes.getAll().map(x=>x.id),[]);if(q)rows=rows.filter(id=>id.toLowerCase().includes(q));return rows.sort().slice(0,Math.max(1,limit));}
export function enchantmentCatalog(){return safe(()=>EnchantmentTypes.getAll().map(x=>({id:x.id,maxLevel:x.maxLevel??1})).sort((a,b)=>a.id.localeCompare(b.id)),[]);}
export function potionCatalog(){const effects=safe(()=>Potions.getAllEffectTypes().map(x=>x.id),[]),deliveries=safe(()=>Potions.getAllDeliveryTypes().map(x=>x.id),[]);return {effects:effects.sort(),deliveries:deliveries.sort()};}

export function capture(stack,{amount}={}){if(!stack?.typeId)return null;const spec={version:1,typeId:stack.typeId,amount:Math.max(1,Math.floor(Number(amount??stack.amount)||1))};
 const name=safe(()=>stack.nameTag,undefined);if(name)spec.nameTag=name;
 const lore=safe(()=>stack.getLore(),[]);if(lore?.length)spec.lore=[...lore];
 const canDestroy=safe(()=>stack.getCanDestroy(),[]);if(canDestroy?.length)spec.canDestroy=[...canDestroy];
 const canPlaceOn=safe(()=>stack.getCanPlaceOn(),[]);if(canPlaceOn?.length)spec.canPlaceOn=[...canPlaceOn];
 const ench=safe(()=>stack.getComponent("minecraft:enchantable")?.getEnchantments(),[])??[];if(ench.length)spec.enchantments=ench.map(x=>({id:x.type.id,level:x.level}));
 const dur=safe(()=>stack.getComponent("minecraft:durability"),undefined);if(dur&&Number(dur.damage)>0)spec.durability={damage:Number(dur.damage)};
 const potion=safe(()=>stack.getComponent("minecraft:potion"),undefined);if(potion)spec.potion={effectId:potion.potionEffectType?.id,deliveryId:potion.potionDeliveryType?.id};
 const props={};for(const id of safe(()=>stack.getDynamicPropertyIds(),[])){const value=safe(()=>stack.getDynamicProperty(id),undefined);if(["string","number","boolean"].includes(typeof value))props[id]=value;else if(value&&typeof value==="object"&&[value.x,value.y,value.z].every(Number.isFinite))props[id]={x:value.x,y:value.y,z:value.z};}if(Object.keys(props).length)spec.dynamicProperties=props;
 return spec;}

export function validate(spec){if(!spec||!cleanId(spec.typeId))return {ok:false,reason:"item_type_required"};if(!ItemTypes.get(cleanId(spec.typeId))&&!spec.potion)return {ok:false,reason:"unknown_item_type"};try{create({...spec,amount:1});return {ok:true};}catch(e){return {ok:false,reason:"invalid_item_template",message:String(e)};}}

export function create(spec,{amount}={}){if(!spec)throw new Error("Item template required");let stack;if(spec.potion?.effectId&&spec.potion?.deliveryId){const effect=Potions.getEffectType(spec.potion.effectId),delivery=Potions.getDeliveryType(spec.potion.deliveryId);if(!effect||!delivery)throw new Error("Potion effect/delivery type is no longer registered");stack=Potions.resolve(effect,delivery);}else stack=new ItemStack(cleanId(spec.typeId),1);
 const wanted=Math.max(1,Math.floor(Number(amount??spec.amount)||1));stack.amount=Math.min(wanted,Math.max(1,Number(stack.maxAmount)||1));
 if(spec.nameTag!==undefined)stack.nameTag=String(spec.nameTag);
 if(Array.isArray(spec.lore))stack.setLore(spec.lore.map(String));
 if(Array.isArray(spec.canDestroy))safe(()=>stack.setCanDestroy(spec.canDestroy),undefined);
 if(Array.isArray(spec.canPlaceOn))safe(()=>stack.setCanPlaceOn(spec.canPlaceOn),undefined);
 if(Array.isArray(spec.enchantments)&&spec.enchantments.length){const c=stack.getComponent("minecraft:enchantable");if(!c)throw new Error("Item is not enchantable");for(const row of spec.enchantments){const type=EnchantmentTypes.get(row.id);if(!type)throw new Error(`Unknown enchantment ${row.id}`);c.addEnchantment({type,level:Math.max(1,Math.floor(Number(row.level)||1))});}}
 if(spec.durability){const c=stack.getComponent("minecraft:durability");if(c)c.damage=Math.max(0,Math.min(Number(c.maxDurability)||0,Math.floor(Number(spec.durability.damage)||0)));}
 for(const [id,value] of Object.entries(spec.dynamicProperties??{}))safe(()=>stack.setDynamicProperty(id,clone(value)),undefined);
 return stack;}

export function describe(spec){if(!spec)return "Unknown item";const parts=[spec.nameTag||spec.typeId];if(spec.potion?.effectId)parts.push(`potion:${spec.potion.effectId}/${spec.potion.deliveryId}`);if(spec.enchantments?.length)parts.push(spec.enchantments.map(x=>`${x.id.replace("minecraft:","")} ${x.level}`).join(", "));if(spec.durability?.damage)parts.push(`damage:${spec.durability.damage}`);return parts.join(" • ");}
