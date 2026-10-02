import * as Economy from "./economy.js";
import * as Accounts from "./accounts.js";
export async function transaction(work,{metadata={}}={}){const undo=[];const tx={
 withdraw(player,amount,meta={}){if(!Economy.withdraw(player,amount,{...metadata,...meta}))throw new Error("withdraw_failed");undo.push(()=>Economy.deposit(player,amount,{type:"rollback",...metadata}));return true},
 deposit(player,amount,meta={}){if(!Economy.deposit(player,amount,{...metadata,...meta}))throw new Error("deposit_failed");undo.push(()=>Economy.withdraw(player,amount,{type:"rollback",...metadata}));return true},
 accountWithdraw(id,amount,meta={}){const r=Accounts.withdraw(id,amount,{...metadata,...meta});if(!r.ok)throw new Error(r.reason);undo.push(()=>Accounts.deposit(id,amount,{type:"rollback",...metadata}));return r},
 accountDeposit(id,amount,meta={}){const r=Accounts.deposit(id,amount,{...metadata,...meta});if(!r.ok)throw new Error(r.reason);undo.push(()=>Accounts.withdraw(id,amount,{type:"rollback",...metadata}));return r},
 compensate(fn){if(typeof fn==="function")undo.push(fn)}
};try{return{ok:true,value:await work(tx)}}catch(error){for(const fn of undo.reverse())try{await fn()}catch{}return{ok:false,error:{code:"TRANSACTION_FAILED",message:String(error)}}}}
