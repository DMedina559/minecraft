/** Lifecycle-safe identity helpers for Bedrock entity/player wrappers.
 * Entity properties may throw after a simulated player/entity becomes invalid.
 */
export function safeEntityId(value, fallback = "") {
  if (value === null || value === undefined) return fallback;
  if (typeof value === "string" || typeof value === "number") return String(value);
  try { const id = value.id; if (id !== undefined && id !== null && String(id)) return String(id); } catch {}
  return fallback;
}

export function safeEntityName(value, fallback = "") {
  if (value === null || value === undefined) return fallback;
  if (typeof value === "string" || typeof value === "number") return String(value);
  try { const name = value.name; if (name !== undefined && name !== null && String(name)) return String(name); } catch {}
  try { const tag = value.nameTag; if (tag !== undefined && tag !== null && String(tag)) return String(tag); } catch {}
  return fallback;
}

export function isEntityUsable(value) {
  if (!value) return false;
  try {
    if (typeof value.isValid === "function") return value.isValid();
    void value.id;
    return true;
  } catch { return false; }
}
