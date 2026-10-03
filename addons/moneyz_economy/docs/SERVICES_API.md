# Moneyz Services API & NPC Binding Reference (v2.0)

The **Moneyz Services API** provides a centralized routing and discovery architecture for user interfaces, commands, ScriptEvents, and NPC interactions.

Instead of hardcoding dialogue files or generated commands for every menu or shop, Moneyz registers features as named **Services**.

---

## 1. Core Services Methods

Import `Moneyz` from `scripts/api/public.js`:

```javascript
import { Moneyz } from "./scripts/api/public.js";

// List all registered services
const allServices = Moneyz.services.list();

// Check if a service exists
if (Moneyz.services.exists("moneyz:atm")) {
    console.warn("ATM service is available.");
}

// Open a service programmatically for a player
Moneyz.services.open("moneyz:atm", player, { source: "custom_script" });
```

---

## 2. Registering Custom Services

External behavior packs can register custom services that appear in service queries, commands, and NPC binding selectors.

### Service Definition Schema

- `id` (string, required): Unique service identifier (e.g. `my_pack:lottery`).
- `label` (string, required): Human-readable display label.
- `category` (string, optional): Service category (`"general"`, `"economy"`, `"roleplay"`, `"rewards"`, `"games"`, `"administration"`).
- `canOpen(player)` (function, optional): Returns `boolean` indicating if player has permission to open service.
- `open(player, context)` (function, required): Callback executed when service is opened.

### Example

```javascript
import { Moneyz } from "./scripts/api/public.js";

Moneyz.services.register({
    id: "msv:property_office",
    label: "Property Office",
    category: "roleplay",
    canOpen(player) {
        return player.hasTag("citizen");
    },
    open(player, context) {
        player.sendMessage("§aOpening Property Office UI...");
        // Render custom server-ui form
    }
});
```

---

## 3. Dynamic NPC Service Binding

NPC entities in Minecraft Bedrock can be converted into interactive Moneyz service providers.

### Command-Based Setup

Stand near an NPC entity and execute:

```mcfunction
/moneyz:npc moneyz:atm
```

Or bind a specific dynamic shop:

```mcfunction
/moneyz:npc_shop general
```

Clear bindings:

```mcfunction
/moneyz:npc_clear
/moneyz:npc_shop_clear
```

### Automatic Service Chooser

If multiple services are assigned to a single NPC entity, Moneyz automatically renders an interactive service chooser form when a player interacts with the NPC.

### Script API NPC Binding

```javascript
import { Moneyz } from "./scripts/api/public.js";

// Bind custom service to an NPC entity
Moneyz.npcServices.bind(npcEntity, "msv:property_office");

// List services bound to an NPC
const boundServices = Moneyz.npcServices.list(npcEntity);
console.warn(`NPC services: ${boundServices.join(", ")}`);

// Clear bindings
Moneyz.npcServices.unbindAll(npcEntity);
```

---

## 4. Specific Shop Service (`moneyz:shop`)

Shops can be hidden from the global shop browser while remaining accessible through direct NPC bindings or commands.

```javascript
import { Moneyz } from "./scripts/api/public.js";

// Open a specific shop directly
Moneyz.services.open("moneyz:shop", player, {
    shopId: "armory",
    isNpcInteraction: true
});
```

---

## 5. ScriptEvent Triggers

Execute Moneyz services from command blocks, functions, or dialogue buttons via Bedrock `scriptevent`:

```mcfunction
/scriptevent moneyz:menu/open moneyz:atm
/scriptevent moneyz:service/open moneyz:quests
```
