import * as Feedback from "./feedback.js";
export function success(p,m){Feedback.message(p,`§a${m}`,"success");}
export function error(p,m){Feedback.message(p,`§c${m}`,"error");}
export function info(p,m){Feedback.message(p,`§f${m}`);}
export function money(p,a){Feedback.message(p,`${a>=0?"§a+":"§c"}${Math.round(a)} §gMoneyz`,a>=0?"received":"success");}
