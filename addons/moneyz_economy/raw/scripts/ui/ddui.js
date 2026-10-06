import * as Permissions from "../core/permissions.js";
import * as Feedback from "../core/feedback.js";
import { system } from "@minecraft/server";
import { getShortcutsHandler, getCurrentRoute, withRoute, canUseRoute } from "./navigation.js";
import { CustomForm as NativeCustomForm, ObservableBoolean, ObservableNumber, ObservableString } from "@minecraft/server-ui";
export { ObservableBoolean, ObservableNumber, ObservableString };

// One presentation policy for every Moneyz screen. Only display text supports
// Minecraft formatting; interactive control chrome must always be plain text.
export const plainText = value => String(value ?? "").replace(/§[0-9a-gk-or]/gi, "");
export const compactText = (value,max=32) => {const text=plainText(value);return text.length>max?`${text.slice(0,max-1).trimEnd()}…`:text;};
const optionsText = options => {
    if (!options) return options;
    const result = { ...options };
    for (const key of ["description", "tooltip"]) {
        if (typeof result[key] === "string") result[key] = plainText(result[key]);
    }
    return result;
};
export const colors = Object.freeze({ navigation:"§b", buy:"§a", sell:"§6", information:"§f", muted:"§7", danger:"§c" });
const titleText = value => `§l§${/§c/i.test(String(value)) ? "c" : "b"}${plainText(value)}`;

// Composition avoids subclassing native Minecraft API objects. Return this for
// fluent builders, while forwarding observables, callbacks and values unchanged.
export class CustomForm {
    constructor(player, title) { this._player=player; this._title=plainText(title??"Moneyz"); this._route=getCurrentRoute(); this._navigation=true; this._form = new NativeCustomForm(player, titleText(title ?? "Moneyz")); }
    shortcut(route) { this._route={...route,context:this._route?.context??route.context,guard:this._route?.guard??route.guard,args:{...route.args,npcInteract:this.npcInteract}}; return this; }
    get npcInteract() { return this._npcInteract ?? !!(this._route?.context?.npcInteract || this._route?.args?.npcInteract || this._route?.args?.isNpcInteraction); }
    npcContext(enabled=true) { this._npcInteract=enabled; return this; }
    requiresPermission(permission) { this._permission=permission; return this; }
    allowed() { return (!this._permission||Permissions.has(this._player,this._permission))&&canUseRoute(this._route,this._player); }
    navigation(enabled) { this._navigation=enabled; return this; }
    header(value) { this._form.header(typeof value === "string" ? `§l§b${plainText(value)}` : value); return this; }
    label(value, ...args) { this._form.label(value, ...args); return this; }
    divider(...args) { this._form.divider(...args); return this; }
    button(value, callback, options) {
        if(this.npcInteract&&/^(?:Back to (?:the )?Main Menu|Main Menu|Shortcuts|All Shops)$/i.test(plainText(value).trim()))return this;
        const lines = plainText(value).split("\n").map(x => x.trim()).filter(Boolean);
        const fullLabel = lines.shift() || "Action";
        const label = compactText(fullLabel);
        const details = lines.join(" ").replace(/^\[\s*/, "").replace(/\s*\]$/, "");
        const opts = optionsText(options);
        const tooltip = [opts?.tooltip, fullLabel!==label?fullLabel:"", details].filter(Boolean).join(" ");

        this._form.button(label, (...args)=>{if(!this.allowed()){Feedback.message(this._player,"§cYou do not have permission to use this menu.");this._form.close();return;}Feedback.click(this._player);return withRoute(this._route,()=>callback(...args));}, tooltip ? { ...opts, tooltip } : opts);
        return this;
    }
    card(title, details, action, callback) {
        this.divider().header(title);
        if(details)this.label(`\n${details}\n`);
        return this.button(action,callback);
    }
    dropdown(label, observable, entries, options) {
        const full=entries.map(entry=>plainText(entry.label));
        const captions=full.map(text=>compactText(text.split(/ • | — /)[0]));
        const counts=new Map();for(const caption of captions)counts.set(caption,(counts.get(caption)??0)+1);
        const display=captions.map((caption,i)=>counts.get(caption)>1?`${compactText(caption,24)} (${i+1})`:caption);
        this._form.dropdown(plainText(label), observable, entries.map((entry,i) => ({ ...optionsText(entry), label:display[i] })), optionsText(options));
        if(full.some((text,i)=>text!==display[i])){
            const detail=new ObservableString("");
            const refresh=()=>{const i=entries.findIndex(entry=>entry.value===observable.getData());detail.setData(i>=0?`${plainText(label)}: ${full[i]}`:"");};
            observable.subscribe(refresh);refresh();this._form.label(detail);
        }
        return this;
    }
    textField(label, observable, options) { this._form.textField(plainText(label), observable, optionsText(options)); return this; }
    toggle(label, observable, options) { this._form.toggle(plainText(label), observable, optionsText(options)); return this; }
    slider(label, observable, min, max, options) { this._form.slider(plainText(label), observable, min, max, optionsText(options)); return this; }
    closeButton(...args) { this._form.closeButton(...args); return this; }
    async show(...args) {
        if(!this.allowed()){Feedback.message(this._player,"§cYou do not have permission to use this menu.");return {canceled:true,permissionDenied:true};}
        if(!this.npcInteract&&!this._footerAdded&&this._navigation&&getShortcutsHandler()){
            this._footerAdded=true;
            this._form.divider();
            this._form.button("Shortcuts",()=>{Feedback.click(this._player);this._shortcutsRequested=true;this._form.close();});
        }
        for(;;){
            const result=await this._form.show(...args);
            if(!this._shortcutsRequested)return result;
            this._shortcutsRequested=false;
            await new Promise(resolve=>system.run(resolve));
            let next;
            try{next=await getShortcutsHandler()(this._player,{route:this._route,title:this._title});}
            catch(error){Feedback.message(this._player,"§cCould not open shortcuts. Returning to your screen.");}
            if(next?.open){system.run(next.open);return {navigated:true};}
            await new Promise(resolve=>system.run(resolve));
        }
    }
    close(...args) { return this._form.close(...args); }
    isShowing(...args) { return this._form.isShowing(...args); }
}

export const writableString = v => new ObservableString(String(v ?? ""), { clientWritable: true });
export const writableNumber = v => new ObservableNumber(Number(v ?? 0), { clientWritable: true });
export const writableBoolean = v => new ObservableBoolean(Boolean(v), { clientWritable: true });
export function safeShow(form, onError = console.warn) { return form.show().catch(onError); }
