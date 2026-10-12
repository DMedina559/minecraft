const object = value => value !== null && typeof value === "object" && !Array.isArray(value);
export function validateConfiguration(data) {
  const errors = [];
  if (!object(data)) return ["Configuration must be an object"];
  if (data.revision !== undefined && (!Number.isSafeInteger(data.revision) || data.revision < 1)) errors.push("Invalid published revision");
  if (data.draftRevision !== undefined && (!Number.isSafeInteger(data.draftRevision) || data.draftRevision < 0)) errors.push("Invalid draft revision");
  if (!Array.isArray(data.nodes)) return ["nodes must be an array"];
  if (data.nodes.length > 180) errors.push("At most 180 navigation items are allowed");
  const nodes = new Map();
  for (const node of data.nodes) {
    if (!object(node)) {
      errors.push("Each node must be an object");
      continue;
    }
    if (typeof node.id !== "string" || !node.id || node.id.length > 96 || node.id.startsWith("provider:")) errors.push("Invalid or reserved node ID");
    if (nodes.has(node.id)) errors.push(`Duplicate node ID: ${node.id}`);
    nodes.set(node.id, node);
    if (!["folder", "server", "info"].includes(node.type)) errors.push(`${node.id}: invalid node type`);
    if (typeof node.name !== "string" || !node.name.trim() || node.name.length > 128) errors.push(`${node.id}: name must contain 1–128 characters`);
    if (node.description !== undefined && typeof node.description !== "string") errors.push(`${node.id}: description must be text`);
    if (node.enabled !== undefined && typeof node.enabled !== "boolean") errors.push(`${node.id}: enabled must be boolean`);
    if (node.tags !== undefined && (!Array.isArray(node.tags) || node.tags.length > 32 || node.tags.some(t => typeof t !== "string"))) errors.push(`${node.id}: invalid tags`);
    if (node.order !== undefined && !Number.isFinite(node.order)) errors.push(`${node.id}: invalid order`);
    if (node.type === "server") {
      if (node.netherNetId) {
        if (typeof node.netherNetId !== "string" || node.netherNetId.length > 255) errors.push(`${node.id}: invalid NetherNet ID`);
      } else if (typeof node.hostname !== "string" || !node.hostname.trim() || node.hostname.length > 255 || !Number.isInteger(node.port) || node.port < 1 || node.port > 65535) errors.push(`${node.id}: valid hostname and port (1–65535) required`);
      if (node.cooldownSeconds !== undefined && (!Number.isFinite(node.cooldownSeconds) || node.cooldownSeconds < 0 || node.cooldownSeconds > 300)) errors.push(`${node.id}: cooldown must be 0–300 seconds`);
    }
    const r = node.requirements;
    if (r !== undefined) {
      if (!object(r)) errors.push(`${node.id}: requirements must be an object`);
      else {
        for (const key of ["tag", "notTag", "dimension", "scoreObjective"])
          if (r[key] !== undefined && typeof r[key] !== "string") errors.push(`${node.id}: ${key} must be text`);
        if (r.adminOnly !== undefined && typeof r.adminOnly !== "boolean") errors.push(`${node.id}: adminOnly must be boolean`);
        for (const key of ["minScore", "maxScore"])
          if (r[key] !== undefined && !Number.isFinite(r[key])) errors.push(`${node.id}: ${key} must be finite`);
        if (r.minScore !== undefined && r.maxScore !== undefined && r.minScore > r.maxScore) errors.push(`${node.id}: minimum score exceeds maximum`);
        if ((r.minScore !== undefined || r.maxScore !== undefined) && !r.scoreObjective) errors.push(`${node.id}: score bounds require an objective`);
      }
    }
  }
  for (const node of nodes.values()) {
    if (node.parentId != null && nodes.get(node.parentId)?.type !== "folder") errors.push(`${node.id}: parent must be an existing folder`);
    const seen = new Set([node.id]);
    let id = node.parentId;
    while (id != null && nodes.has(id)) {
      if (seen.has(id)) {
        errors.push(`${node.id}: folder cycle`);
        break
      }
      seen.add(id);
      id = nodes.get(id).parentId;
    }
  }
  if (data.settings !== undefined) {
    if (!object(data.settings)) errors.push("settings must be an object");
    else {
      const s = data.settings;
      for (const key of ["confirmTransfers", "showDirectConnect"])
        if (s[key] !== undefined && typeof s[key] !== "boolean") errors.push(`${key} must be boolean`);
      if (s.policyTimeout !== undefined && !["allow", "deny"].includes(s.policyTimeout)) errors.push("Invalid policy timeout behavior");
      if (s.maxRecent !== undefined && (!Number.isInteger(s.maxRecent) || s.maxRecent < 1 || s.maxRecent > 20)) errors.push("History size must be 1–20");
    }
  }
  if (data.announcements !== undefined) {
    if (!Array.isArray(data.announcements) || data.announcements.length > 40) errors.push("announcements must contain at most 40 items");
    else {
      const ids = new Set();
      for (const a of data.announcements) {
        if (!object(a) || typeof a.id !== "string" || ids.has(a.id) || typeof a.title !== "string" || !a.title.trim() || typeof a.text !== "string") errors.push("Invalid or duplicate announcement");
        ids.add(a?.id);
      }
    }
  }
  return errors;
}
export function assertConfiguration(data) {
  const errors = validateConfiguration(data);
  if (errors.length) throw Error(errors.slice(0, 8).join("; "));
  return data;
}
export function configurationDiff(before, after) {
  const a = new Map(before.nodes.map(n => [n.id, n])),
    b = new Map(after.nodes.map(n => [n.id, n]));
  return {
    added: [...b.values()].filter(n => !a.has(n.id)),
    removed: [...a.values()].filter(n => !b.has(n.id)),
    changed: [...b.values()].filter(n => a.has(n.id) && JSON.stringify(a.get(n.id)) !== JSON.stringify(n)),
    settings: JSON.stringify(before.settings) !== JSON.stringify(after.settings),
    announcements: JSON.stringify(before.announcements) !== JSON.stringify(after.announcements)
  };
}
