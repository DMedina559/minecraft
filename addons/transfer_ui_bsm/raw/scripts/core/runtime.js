// Small scheduler used to keep transport callbacks thin and collapse duplicate work.
export class ProviderRuntime {
  constructor(system){this.system=system;this.timers=new Map()}
  debounce(key,ticks,fn){if(this.timers.has(key))return false;const h=this.system.runTimeout(()=>{this.timers.delete(key);fn()},ticks);this.timers.set(key,h);return true}
  cancel(key){const h=this.timers.get(key);if(h!==undefined){this.system.clearRun(h);this.timers.delete(key)}}
  defer(fn){this.system.run(()=>{try{fn()}catch(e){console.warn(`[Transfer UI BSM Provider] deferred task failed: ${e?.message??e}`)}})}
}
