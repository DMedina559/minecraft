import { ItemStack, ItemTypes, EnchantmentTypes, Potions } from "@minecraft/server";

const clone=v=>v===undefined?undefined:JSON.parse(JSON.stringify(v));
const cleanId=v=>String(v??"").trim();
const safe=(fn,fallback)=>{try{return fn();}catch{return fallback;}};

export function itemCatalog(query="",limit=500){const q=String(query).trim().toLowerCase();let rows=safe(()=>ItemTypes.getAll().map(x=>x.id),[]);if(q)rows=rows.filter(id=>id.toLowerCase().includes(q));return rows.sort().slice(0,Math.max(1,limit));}
export function enchantmentCatalog(){return safe(()=>EnchantmentTypes.getAll().map(x=>({id:x.id,maxLevel:x.maxLevel??1})).sort((a,b)=>a.id.localeCompare(b.id)),[]);}
export function supportsEnchantments(spec){try{return !!create({...spec,enchantments:undefined},{amount:1}).getComponent("minecraft:enchantable");}catch{return false;}}
export function applicableEnchantments(spec){try{const stack=create({...spec,enchantments:undefined},{amount:1}),c=stack.getComponent("minecraft:enchantable");if(!c)return [];return enchantmentCatalog().filter(row=>{try{const type=EnchantmentTypes.get(row.id);return !!type&&c.canAddEnchantment({type,level:1});}catch{return false;}});}catch{return [];}}
export function potionCatalog(){const effects=safe(()=>Potions.getAllEffectTypes().map(x=>x.id),[]),deliveries=safe(()=>Potions.getAllDeliveryTypes().map(x=>x.id),[]);return {effects:effects.sort(),deliveries:deliveries.sort()};}
export function potionVariants(){const {effects,deliveries}=potionCatalog(),out=[];for(const effectId of effects)for(const deliveryId of deliveries){try{const effect=Potions.getEffectType(effectId),delivery=Potions.getDeliveryType(deliveryId);if(!effect||!delivery)continue;const stack=Potions.resolve(effect,delivery);out.push({effectId,deliveryId,typeId:stack.typeId,maxAmount:stack.maxAmount});}catch{}}return out;}
export function potionVariantInfo(effectId){const raw=cleanId(effectId),short=raw.replace(/^minecraft:/,"");let family=short,variant="Standard";if(/^(strong_|enhanced_)/.test(short)){family=short.replace(/^(strong_|enhanced_)/,"");variant="II / Enhanced";}else if(/^(long_|extended_)/.test(short)){family=short.replace(/^(long_|extended_)/,"");variant="Long / Extended";}else if(/(_strong|_enhanced)$/.test(short)){family=short.replace(/(_strong|_enhanced)$/,"");variant="II / Enhanced";}else if(/(_long|_extended)$/.test(short)){family=short.replace(/(_long|_extended)$/,"");variant="Long / Extended";}return {family,variant,effectId:raw};}
export function potionFamilies(deliveryId){const rows=potionVariants().filter(v=>!deliveryId||v.deliveryId===deliveryId).map(v=>({...v,...potionVariantInfo(v.effectId)}));const map=new Map();for(const row of rows){if(!map.has(row.family))map.set(row.family,[]);map.get(row.family).push(row);}return [...map.entries()].map(([family,variants])=>({family,variants})).sort((a,b)=>a.family.localeCompare(b.family));}

// Bedrock tipped arrows are minecraft:arrow item-data variants. The stable Potions
// registry currently exposes potion delivery forms (consume/splash/lingering), not
// an arrow delivery type, so arrows intentionally use their own selector/path.
// Values mirror the current Bedrock potion item-data table, offset by one for arrows.
const TIPPED_ARROWS=[
 [6,"Night Vision (0:22)"],[7,"Night Vision (1:00)"],[8,"Invisibility (0:22)"],[9,"Invisibility (1:00)"],
 [10,"Leaping (0:22)"],[11,"Leaping (1:00)"],[12,"Leaping II (0:11)"],[13,"Fire Resistance (0:22)"],[14,"Fire Resistance (1:00)"],
 [15,"Swiftness (0:22)"],[16,"Swiftness (1:00)"],[17,"Swiftness II (0:11)"],[18,"Slowness (0:11)"],[19,"Slowness (0:30)"],
 [20,"Water Breathing (0:22)"],[21,"Water Breathing (1:00)"],[22,"Healing"],[23,"Healing II"],[24,"Harming"],[25,"Harming II"],
 [26,"Poison (0:05)"],[27,"Poison (0:11)"],[28,"Poison II (0:02)"],[29,"Regeneration (0:05)"],[30,"Regeneration (0:11)"],[31,"Regeneration II (0:02)"],
 [32,"Strength (0:22)"],[33,"Strength (1:00)"],[34,"Strength II (0:11)"],[35,"Weakness (0:11)"],[36,"Weakness (0:30)"],[37,"Decay"],
 [38,"Turtle Master (0:05)"],[39,"Turtle Master (0:10)"],[40,"Turtle Master II (0:05)"],[41,"Slow Falling (0:22)"],[42,"Slow Falling (1:00)"],
 [44,"Wind Charging"],[45,"Weaving"],[46,"Oozing"],[47,"Infestation"]
];
export function tippedArrowVariants(){return TIPPED_ARROWS.map(([data,name])=>({typeId:"minecraft:arrow",data,name}));}

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

export function validate(spec){if(!spec||!cleanId(spec.typeId))return {ok:false,reason:"item_type_required"};if(spec.tippedArrow){if(cleanId(spec.typeId)!=="minecraft:arrow")return {ok:false,reason:"tipped_arrow_requires_arrow"};const data=Math.floor(Number(spec.tippedArrow.data));if(!TIPPED_ARROWS.some(x=>x[0]===data))return {ok:false,reason:"unknown_tipped_arrow_variant"};return {ok:true};}if(!ItemTypes.get(cleanId(spec.typeId))&&!spec.potion)return {ok:false,reason:"unknown_item_type"};try{create({...spec,amount:1});return {ok:true};}catch(e){return {ok:false,reason:"invalid_item_template",message:String(e)};}}

export function create(spec,{amount}={}){if(!spec)throw new Error("Item template required");if(spec.tippedArrow)throw new Error("Tipped arrows use Bedrock item-data delivery and cannot be reconstructed through ItemStack");let stack;if(spec.potion?.effectId&&spec.potion?.deliveryId){const effect=Potions.getEffectType(spec.potion.effectId),delivery=Potions.getDeliveryType(spec.potion.deliveryId);if(!effect||!delivery)throw new Error("Potion effect/delivery type is no longer registered");stack=Potions.resolve(effect,delivery);}else stack=new ItemStack(cleanId(spec.typeId),1);
 const wanted=Math.max(1,Math.floor(Number(amount??spec.amount)||1));stack.amount=Math.min(wanted,Math.max(1,Number(stack.maxAmount)||1));
 if(spec.nameTag!==undefined)stack.nameTag=String(spec.nameTag);
 if(Array.isArray(spec.lore))stack.setLore(spec.lore.map(String));
 if(Array.isArray(spec.canDestroy))safe(()=>stack.setCanDestroy(spec.canDestroy),undefined);
 if(Array.isArray(spec.canPlaceOn))safe(()=>stack.setCanPlaceOn(spec.canPlaceOn),undefined);
 if(Array.isArray(spec.enchantments)&&spec.enchantments.length){const c=stack.getComponent("minecraft:enchantable");if(!c)throw new Error("Item is not enchantable");for(const row of spec.enchantments){const type=EnchantmentTypes.get(row.id);if(!type)throw new Error(`Unknown enchantment ${row.id}`);c.addEnchantment({type,level:Math.max(1,Math.floor(Number(row.level)||1))});}}
 if(spec.durability){const c=stack.getComponent("minecraft:durability");if(c)c.damage=Math.max(0,Math.min(Number(c.maxDurability)||0,Math.floor(Number(spec.durability.damage)||0)));}
 for(const [id,value] of Object.entries(spec.dynamicProperties??{}))safe(()=>stack.setDynamicProperty(id,clone(value)),undefined);
 return stack;}

export function describe(spec){if(!spec)return "Unknown item";const arrow=spec.tippedArrow?TIPPED_ARROWS.find(x=>x[0]===Number(spec.tippedArrow.data)):null;const parts=[spec.nameTag||(arrow?`Arrow of ${arrow[1]}`:spec.typeId)];if(spec.potion?.effectId)parts.push(`potion:${spec.potion.effectId}/${spec.potion.deliveryId}`);if(spec.enchantments?.length)parts.push(spec.enchantments.map(x=>`${x.id.replace("minecraft:","")} ${x.level}`).join(", "));if(spec.durability?.damage)parts.push(`damage:${spec.durability.damage}`);return parts.join(" • ");}
