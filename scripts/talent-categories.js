import {
  TALENT_CATEGORIES
} from "/systems/rmu/module/rmu/talents/costs.js";

const MODULE_ID = "rmu-qol";

const CHARACTER_COMPANION_CATEGORIES = [
  "Mental",
  "Special"
];

export function registerTalentCategories() {
  if (game.system.id !== "rmu") return;

  for (const category of CHARACTER_COMPANION_CATEGORIES) {
    if (!TALENT_CATEGORIES.includes(category)) {
      TALENT_CATEGORIES.push(category);
    }
  }

  console.log(
    `${MODULE_ID} | Registered Character Companion talent/flaw categories`,
    CHARACTER_COMPANION_CATEGORIES
  );
}
