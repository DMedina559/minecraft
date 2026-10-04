const clean=v=>`${v??""}`.trim();
export function reconcilePopulation(destination,summary,players,source="summary"){
  const reported=Number(summary?.player_count), identified=Array.isArray(players)?players.length:0;
  let population=Number.isFinite(reported)&&reported>=0?Math.trunc(reported):identified;
  // Presence can be less complete than population, but never let an identified player
  // produce a lower displayed population.
  if(identified>population)population=identified;
  destination.playerCount=population;
  destination.metadata={...(destination.metadata??{}),playerStateSource:source,populationSource:Number.isFinite(reported)&&reported>=0?`${source}.player_count`:`${source}.players`,reportedPopulation:population,identifiedPlayers:identified,populationObservedAt:Date.now()};
  return {population,identified,mismatch:identified>0&&identified!==population};
}
export function eventServerHint(event,knownNames=[]){
  const raw=clean(event?.raw??event?.message??event); if(!raw)return "";
  let obj=null;try{obj=typeof event==="object"&&event!==null?event:JSON.parse(raw)}catch{}
  const values=[];
  const walk=(x,depth=0)=>{if(!x||depth>3)return;if(typeof x==="string"){values.push(x);return}if(Array.isArray(x)){for(const y of x)walk(y,depth+1);return}if(typeof x==="object")for(const [k,v] of Object.entries(x)){if(/server|name|instance/i.test(k)&&typeof v==="string")values.push(v);walk(v,depth+1)}};
  walk(obj); values.push(raw);
  for(const name of knownNames)if(values.some(v=>clean(v)===name||clean(v).includes(name)))return name;
  return "";
}
