import * as SkillCompendium from "/systems/rmu/module/rmu/skills/skills-compendium.js";
import AddUntrainedSkillDialogV2 from "/systems/rmu/module/apps/creation/add-untrained-skill-dialog-v2.js";
import { FIGHTING_STYLES, fightingStyleHtml } from "./fighting-style-data.js";

const MODULE_ID = "rmu-qol";
const PACK_ID = `${MODULE_ID}.character-companion-qol`;
const STYLE_SKILL_NAMES = new Set([
  "Battle Styles",
  "Combat Styles",
  "Discipline Styles"
]);
let dialogPatched = false;
let coreUuidPatched = false;

function registerSkillLabels() {
  for (const name of STYLE_SKILL_NAMES) {
    foundry.utils.setProperty(game.i18n.translations, `RMU.Skills.${name}`, name);
    if (game.i18n._fallback) {
      foundry.utils.setProperty(game.i18n._fallback, `RMU.Skills.${name}`, name);
    }
  }
}

function registerStyleSpecializationPicker() {
  if (dialogPatched) return;

  const original = AddUntrainedSkillDialogV2.prototype._getSkillSelectionOptions;
  AddUntrainedSkillDialogV2.prototype._getSkillSelectionOptions = async function (...args) {
    const result = await original.apply(this, args);

    for (const group of result.groups ?? []) {
      group.skills = group.skills.filter(skill => {
        if (!STYLE_SKILL_NAMES.has(skill.name)) return true;
        skill.fixedSpecializations = true;
        return skill.options.length > 0;
      });
    }
    result.groups = (result.groups ?? []).filter(group => group.skills.length > 0);

    return result;
  };

  const originalRender = AddUntrainedSkillDialogV2.prototype._onRender;
  AddUntrainedSkillDialogV2.prototype._onRender = function (...args) {
    originalRender.apply(this, args);

    const selectedSkill = this._skillGroups?.groups?.[0]?.skills?.[this._selectedSkillIndex];
    if (!STYLE_SKILL_NAMES.has(selectedSkill?.name)) return;

    const select = this.element.querySelector("#selections");
    if (!select) return;

    let details = this.element.querySelector(".rmu-qol-style-details");
    if (!details) {
      details = document.createElement("section");
      details.className = "rmu-qol-style-details rmu-card";
      select.closest(".rmu-field-row")?.insertAdjacentElement("afterend", details);
    }

    const renderDetails = () => {
      const styleName = selectedSkill.options[Number(select.value) || 0];
      details.innerHTML = fightingStyleHtml(styleName);
    };
    select.addEventListener("change", renderDetails);
    renderDetails();
  };

  dialogPatched = true;
}

function registerEmbeddedStyleDescriptions() {
  Hooks.on("preCreateItem", (item, data) => {
    if (item.parent?.documentName !== "Actor" || data.type !== "skill") return;

    const specialization = data.system?.specialization;
    const style = FIGHTING_STYLES[specialization];
    if (!style || style.skill !== data.system?.name) return;

    item.updateSource({ "system.description": fightingStyleHtml(specialization) });
  });
}

function registerCompendiumOrigins() {
  if (coreUuidPatched) return;

  const corePack = game.packs.get("rmu.core");
  if (!corePack) throw new Error("rmu.core compendium was not found");

  const original = corePack.getUuid.bind(corePack);
  corePack.getUuid = function (documentId) {
    if (["ccqolbattlestyle", "ccqolcombatstyle", "ccqoldiscstyle00"].includes(documentId)) {
      return `Compendium.${PACK_ID}.Item.${documentId}`;
    }
    return original(documentId);
  };

  coreUuidPatched = true;
}

/**
 * RMU currently builds undeveloped skills and the Add Skill dialog from the
 * rmu.core skill cache. Extend that live cache with this module's skill items
 * so the normal RMU sheet workflow can discover them without modifying RMU.
 */
export async function registerFightingStyleSkills() {
  if (game.system.id !== "rmu") return;

  registerSkillLabels();
  registerStyleSpecializationPicker();
  registerCompendiumOrigins();
  registerEmbeddedStyleDescriptions();

  const pack = game.packs.get(PACK_ID);
  if (!pack) {
    console.warn(`${MODULE_ID} | Character Companion QoL compendium was not found.`);
    return;
  }

  const [cachedSkills, companionSkills] = await Promise.all([
    SkillCompendium.getCachedSkills(),
    pack.getDocuments({ type: "skill" })
  ]);

  const existing = new Set(
    cachedSkills.map(item => `${item.system.category}\u0000${item.system.name}`)
  );
  let added = 0;

  for (const item of companionSkills) {
    if (!STYLE_SKILL_NAMES.has(item.name)) continue;

    const key = `${item.system.category}\u0000${item.system.name}`;
    if (existing.has(key)) continue;

    cachedSkills.push(item);
    existing.add(key);
    added += 1;
  }

  console.log(`${MODULE_ID} | Registered ${added} Character Companion fighting-style skills.`);
}
