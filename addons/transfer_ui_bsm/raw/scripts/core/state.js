// Runtime-only provider state. Nothing in this module touches world storage or UI.
export class ProviderRuntimeState {
  constructor(){
    this.generation=0;
    this.destinations=new Map();
    this.players=new Map();
    this.serverObservedAt=new Map();
    this.lastEvent={time:0,server:"",kind:"",raw:""};
    this.lastReconcile={time:0,server:"",reason:"",generation:0};
    this.populationMismatches=0;
  }
  beginGeneration(){return ++this.generation}
  replace(destinations,players,generation=this.generation){
    this.destinations=new Map((destinations||[]).map(x=>[x.id,x]));
    this.players=new Map((players||[]).map(x=>[x.id,x]));
    this.serverObservedAt.clear();const t=Date.now(); for(const d of destinations||[])this.serverObservedAt.set(d.id,t);
    this.lastReconcile={time:t,server:"*",reason:"full",generation};
  }
  updateServer(destination,players,reason="event"){
    const id=destination.id,t=Date.now(),before=[...this.players.values()].filter(p=>p.destinationId===id);this.destinations.set(id,destination);
    for(const [key,p] of this.players)if(p.destinationId===id)this.players.delete(key);
    for(const p of players||[])this.players.set(p.id,p);
    this.serverObservedAt.set(id,t);
    this.lastReconcile={time:t,server:id,reason,generation:this.generation};
    const old=new Map(before.map(p=>[p.id,p])),next=new Map((players??[]).map(p=>[p.id,p]));
    return {removed:[...old.keys()].filter(key=>!next.has(key)),upserted:[...next.values()].filter(p=>!old.has(p.id)||JSON.stringify(old.get(p.id))!==JSON.stringify(p))};
  }
  snapshot(){return {generation:this.generation,destinations:[...this.destinations.values()],players:[...this.players.values()]}}
  population(){let n=0;for(const d of this.destinations.values())if(Number.isFinite(Number(d.playerCount)))n+=Math.max(0,Math.trunc(Number(d.playerCount)));return n}
}
