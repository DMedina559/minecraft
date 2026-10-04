import { CustomForm, ObservableBoolean, ObservableNumber, ObservableString } from "./ddui.js";

// DDUI-backed compatibility facade. It intentionally mirrors the small subset of
// ActionFormData / ModalFormData used by Moneyz so every player-facing screen is
// rendered by CustomForm while feature modules can be migrated incrementally.
const cleanFormatting = value => String(value ?? "").replace(/§[0-9a-gk-or]/gi, "");
const buttonParts = value => {
    const lines = cleanFormatting(value).split("\n").map(x => x.trim()).filter(Boolean);
    const label = lines.shift() ?? "Action";
    const tooltip = lines.join(" ").replace(/^\[\s*/, "").replace(/\s*\]$/, "");
    return { label, tooltip };
};
const asText = value => String(value ?? "");
// DDUI renders formatting codes in titles/labels, but several interactive control
// strings (field labels, dropdown entries/descriptions) expose the raw § codes.
// Keep rich formatting for display text and sanitize only control chrome.
const controlText = value => cleanFormatting(value);

function closeQuietly(form) {
    try { if (form.isShowing()) form.close(); } catch {}
}

export class ActionFormData {
    constructor() { this._title = "Moneyz"; this._body = ""; this._buttons = []; this._sections = new Map(); }
    title(value) { this._title = value; return this; }
    body(value) { this._body = value; return this; }
    header(label) { this._sections.set(this._buttons.length, label); return this; }
    button(label, _iconPath) { this._buttons.push(label); return this; }
    show(player) {
        return new Promise((resolve, reject) => {
            let settled = false;
            const form = new CustomForm(player, this._title);
            if (this._body) form.label(this._body).divider();
            const finish = result => { if (settled) return; settled = true; resolve(result); };
            this._buttons.forEach((label, selection) => {
                if (this._sections.has(selection)) form.header(this._sections.get(selection)).divider();
                const parts = buttonParts(label);
                form.button(parts.label, () => {
                    closeQuietly(form);
                    finish({ canceled: false, selection });
                }, parts.tooltip ? { tooltip: parts.tooltip } : undefined);
            });
            form.closeButton();
            form.show().then(() => finish({ canceled: true, selection: undefined })).catch(reject);
        });
    }
}

export class ModalFormData {
    constructor() { this._title = "Moneyz"; this._controls = []; this._submit = "Submit"; }
    title(value) { this._title = value; return this; }
    submitButton(value) { this._submit = value; return this; }
    dropdown(label, options, defaultValue = 0) {
        this._controls.push({ type: "dropdown", label, options: [...options], defaultValue }); return this;
    }
    textField(label, placeholder = "", defaultValue = "") {
        this._controls.push({ type: "text", label, placeholder, defaultValue }); return this;
    }
    toggle(label, defaultValue = false) {
        this._controls.push({ type: "toggle", label, defaultValue }); return this;
    }
    show(player) {
        return new Promise((resolve, reject) => {
            let settled = false;
            const form = new CustomForm(player, this._title);
            const values = [];
            for (const control of this._controls) {
                if (control.type === "dropdown") {
                    const obs = new ObservableNumber(Number(control.defaultValue ?? 0), { clientWritable: true });
                    values.push(obs);
                    form.dropdown(controlText(control.label), obs, control.options.map((label, value) => ({ label: controlText(label), value })));
                } else if (control.type === "text") {
                    const obs = new ObservableString(asText(control.defaultValue), { clientWritable: true });
                    values.push(obs);
                    form.textField(controlText(control.label), obs, control.placeholder ? { description: controlText(control.placeholder) } : undefined);
                } else if (control.type === "toggle") {
                    const obs = new ObservableBoolean(Boolean(control.defaultValue), { clientWritable: true });
                    values.push(obs);
                    form.toggle(controlText(control.label), obs);
                }
            }
            const finish = result => { if (settled) return; settled = true; resolve(result); };
            form.divider().button(buttonParts(this._submit).label, () => {
                const formValues = values.map(v => v.getData());
                closeQuietly(form);
                finish({ canceled: false, formValues });
            }).closeButton();
            form.show().then(() => finish({ canceled: true, formValues: undefined })).catch(reject);
        });
    }
}
