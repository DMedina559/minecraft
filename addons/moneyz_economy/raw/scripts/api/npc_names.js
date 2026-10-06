// Read the native NPC display name each time so vanilla edits remain visible.
export const NPC_NAME_PROPERTY="moneyz:npc_name";
const text=value=>typeof value==="string"?value.trim():"";
function component(entity){try{return entity?.getComponent?.("minecraft:npc");}catch{return undefined;}}
export function getName(entity){
    const npc=component(entity);
    try{const name=text(npc?.name);if(name)return name;}catch{}
    try{return text(entity?.getDynamicProperty?.(NPC_NAME_PROPERTY))||text(entity?.nameTag)||"NPC";}catch{return "NPC";}
}
export function setName(entity,value){
    if(entity?.typeId!=="minecraft:npc")return {ok:false,reason:"not_npc"};
    const name=text(value);if(!name)return {ok:false,reason:"empty_name"};
    const npc=component(entity);
    // Do not claim that editing an entity tag changed its native NPC name.
    if(!npc||!("name" in npc)){
        try{
            if(typeof entity.setDynamicProperty!=="function")return {ok:false,reason:"npc_name_api_unavailable"};
            entity.setDynamicProperty(NPC_NAME_PROPERTY,name);
            if(text(entity.getDynamicProperty(NPC_NAME_PROPERTY))!==name)return {ok:false,reason:"name_not_saved"};
            try{entity.nameTag=name;}catch{}
            return {ok:true,name,native:false};
        }catch{return {ok:false,reason:"name_not_saved"};}
    }
    try{
        npc.name=name;
        if(text(npc.name)!==name)return {ok:false,reason:"name_not_saved"};
        // Keep entity selectors and older integrations in sync when supported.
        try{entity.nameTag=name;}catch{}
        return {ok:true,name,native:true};
    }catch{return {ok:false,reason:"name_not_saved"};}
}
