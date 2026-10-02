import { CustomForm, ObservableBoolean, ObservableNumber, ObservableString } from "@minecraft/server-ui";
export { CustomForm, ObservableBoolean, ObservableNumber, ObservableString };
export const writableString = v => new ObservableString(String(v ?? ""), { clientWritable:true });
export const writableNumber = v => new ObservableNumber(Number(v ?? 0), { clientWritable:true });
export const writableBoolean = v => new ObservableBoolean(Boolean(v), { clientWritable:true });
export function safeShow(form, onError=console.warn) { return form.show().catch(onError); }
