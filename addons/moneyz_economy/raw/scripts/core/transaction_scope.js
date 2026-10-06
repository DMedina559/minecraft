import * as Feedback from "./feedback.js";
import * as Economy from "./economy.js";
import * as Accounts from "./accounts.js";
export async function transaction(work,{metadata={}}={}){const undo=[],scopes=new Map();const touch=p=>{if(!scopes.has(p))scopes.set(p,Feedback.begin(p,{quiet:Feedback.isCompensation(metadata)}));};const finish=value=>{for(const done of scopes.values())done(value);return value;};const tx={
 withdraw(player,amount,meta={}){touch(player);if(!Economy.withdraw(player,amount,{...metadata,...meta}))throw new Error("withdraw_failed");undo.push(()=>Economy.deposit(player,amount,{...metadata,type:"rollback",feedback:false}));return true},
 deposit(player,amount,meta={}){touch(player);if(!Economy.deposit(player,amount,{...metadata,...meta}))throw new Error("deposit_failed");undo.push(()=>Economy.withdraw(player,amount,{...metadata,type:"rollback",feedback:false}));return true},
 accountWithdraw(id,amount,meta={}){const r=Accounts.withdraw(id,amount,{...metadata,...meta});if(!r.ok)throw new Error(r.reason);undo.push(()=>Accounts.deposit(id,amount,{...metadata,type:"rollback",feedback:false}));return r},
 accountDeposit(id,amount,meta={}){const r=Accounts.deposit(id,amount,{...metadata,...meta});if(!r.ok)throw new Error(r.reason);undo.push(()=>Accounts.withdraw(id,amount,{...metadata,type:"rollback",feedback:false}));return r},
 compensate(fn){if(typeof fn==="function")undo.push(fn)}
};try{return finish({ok:true,value:await work(tx)})}catch(error){for(const fn of undo.reverse())try{await fn()}catch{}return finish({ok:false,error:{code:"TRANSACTION_FAILED",message:String(error)}})}}
