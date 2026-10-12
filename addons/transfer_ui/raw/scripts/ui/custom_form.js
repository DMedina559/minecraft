import {
  system
} from "@minecraft/server";
import {
  CustomForm as MinecraftCustomForm
} from "@minecraft/server-ui";
export class CustomForm extends MinecraftCustomForm {
  constructor(player, title) {
    super(player, title);
    this._transferUiPlayer = player;
  }
  button(label, onClick, options) {
    const buttonLabel = typeof label === "string" ? label.replace(/§./g, "") : label;
    return super.button(buttonLabel, () => {
      try {
        this.close()
      } catch {}
      system.run(() => {
        try {
          onClick()
        } catch (e) {
          try {
            this._transferUiPlayer?.sendMessage?.(`§c${e.message}`)
          } catch {}
          console.warn(`[Transfer UI] button handler failed: ${e?.stack??e}`)
        }
      })
    }, options)
  }
}
