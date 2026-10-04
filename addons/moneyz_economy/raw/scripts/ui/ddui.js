import { CustomForm as NativeCustomForm, ObservableBoolean, ObservableNumber, ObservableString } from "@minecraft/server-ui";
export { ObservableBoolean, ObservableNumber, ObservableString };

// One presentation policy for every Moneyz screen. Only display text supports
// Minecraft formatting; interactive control chrome must always be plain text.
export const plainText = value => String(value ?? "").replace(/§[0-9a-gk-or]/gi, "");
const optionsText = options => {
    if (!options) return options;
    const result = { ...options };
    for (const key of ["description", "tooltip"]) {
        if (typeof result[key] === "string") result[key] = plainText(result[key]);
    }
    return result;
};
const titleText = value => `§l§${/§c/i.test(String(value)) ? "c" : "b"}${plainText(value)}`;

// Composition avoids subclassing native Minecraft API objects. Return this for
// fluent builders, while forwarding observables, callbacks and values unchanged.
export class CustomForm {
    constructor(player, title) { this._form = new NativeCustomForm(player, titleText(title ?? "Moneyz")); }
    header(value) { this._form.header(typeof value === "string" ? `§l§e${plainText(value)}` : value); return this; }
    label(value, ...args) { this._form.label(value, ...args); return this; }
    divider(...args) { this._form.divider(...args); return this; }
    button(value, callback, options) {
        const lines = plainText(value).split("\n").map(x => x.trim()).filter(Boolean);
        const label = lines.shift() || "Action";
        const details = lines.join(" ").replace(/^\[\s*/, "").replace(/\s*\]$/, "");
        const opts = optionsText(options);
        const tooltip = [opts?.tooltip, details].filter(Boolean).join(" ");
        this._form.button(label, callback, tooltip ? { ...opts, tooltip } : opts);
        return this;
    }
    dropdown(label, observable, entries, options) {
        this._form.dropdown(plainText(label), observable, entries.map(entry => ({ ...optionsText(entry), label: plainText(entry.label) })), optionsText(options));
        return this;
    }
    textField(label, observable, options) { this._form.textField(plainText(label), observable, optionsText(options)); return this; }
    toggle(label, observable, options) { this._form.toggle(plainText(label), observable, optionsText(options)); return this; }
    slider(label, observable, min, max, options) { this._form.slider(plainText(label), observable, min, max, optionsText(options)); return this; }
    closeButton(...args) { this._form.closeButton(...args); return this; }
    show(...args) { return this._form.show(...args); }
    close(...args) { return this._form.close(...args); }
    isShowing(...args) { return this._form.isShowing(...args); }
}

export const writableString = v => new ObservableString(String(v ?? ""), { clientWritable: true });
export const writableNumber = v => new ObservableNumber(Number(v ?? 0), { clientWritable: true });
export const writableBoolean = v => new ObservableBoolean(Boolean(v), { clientWritable: true });
export function safeShow(form, onError = console.warn) { return form.show().catch(onError); }
