import { RMUHerbUseApplication, checkAllHerbTimers, registerGmSocket, registerHerbChatListeners } from "./rmu-herbs.js";
import { registerTalentCategories } from "./talent-categories.js";

const MODULE_ID = "rmu-qol";

function openHerbUse() {
  new RMUHerbUseApplication().render({ force: true });
}

function registerSceneControls() {
  Hooks.on("getSceneControlButtons", controls => {
    if (game.system.id !== "rmu") return;

    let tokenControls = null;
    for (const key in controls) {
      const control = controls[key];
      if (control?.name === "tokens" || control?.name === "token" || key === "tokens" || key === "token") {
        tokenControls = control;
        break;
      }
    }

    if (!tokenControls) {
      console.warn(`${MODULE_ID} | Token controls group was not found.`);
      return;
    }

    if (!tokenControls.tools) tokenControls.tools = {};

    tokenControls.tools["rmu-qol-herbs"] = {
      name: "rmu-qol-herbs",
      title: "Use Herb",
      icon: "fas fa-leaf",
      button: true,
      visible: true,
      onChange: openHerbUse
    };
  });
}

Hooks.once("init", () => {
  console.log(`${MODULE_ID} | Initializing`);

  registerTalentCategories();

  game.rmuQol = {
    openHerbUse,
    checkHerbTimers: checkAllHerbTimers
  };

  registerSceneControls();
});

Hooks.once("ready", () => {
  if (game.system.id !== "rmu") {
    ui.notifications.warn("RMU QoL is designed for the Rolemaster Unified system.");
    return;
  }

  registerGmSocket();
  registerHerbChatListeners();
});

Hooks.on("updateCombat", async () => {
  await checkAllHerbTimers();
});
