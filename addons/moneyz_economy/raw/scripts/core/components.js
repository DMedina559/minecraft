let blockRegistry=null,itemRegistry=null;const pendingBlocks=[],pendingItems=[];
const valid=id=>{if(!/^[a-z0-9_.-]+:[a-z0-9_.-]+$/i.test(String(id)))throw new Error("Component id must be namespaced");return String(id)};
export function initialize(startupEvent){blockRegistry=startupEvent.blockComponentRegistry??null;itemRegistry=startupEvent.itemComponentRegistry??null;for(const [id,c] of pendingBlocks.splice(0))blockRegistry?.registerCustomComponent(id,c);for(const [id,c] of pendingItems.splice(0))itemRegistry?.registerCustomComponent(id,c)}
export function registerBlock(id,component){id=valid(id);if(blockRegistry)blockRegistry.registerCustomComponent(id,component);else pendingBlocks.push([id,component]);return id}
export function registerItem(id,component){id=valid(id);if(itemRegistry)itemRegistry.registerCustomComponent(id,component);else pendingItems.push([id,component]);return id}
