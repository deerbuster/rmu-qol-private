import CharacterSheetV2RMU from "/systems/rmu/module/apps/actor/character-sheet-v2.js";
import { FIGHTING_STYLES } from "./fighting-style-data.js";

const MODULE_ID = "rmu-qol";
const PACK_ID = `${MODULE_ID}.character-companion-qol`;
let sheetPatched = false;

function totalRanks(item) {
  return Math.max(0,
    Number(item.system.ranks || 0) +
    Number(item.system.cultureRanks || 0) +
    Number(item.system.levelUpRanks || 0));
}

function allocations(item) {
  return foundry.utils.deepClone(item.getFlag(MODULE_ID, "fightingStyle.abilities") ?? []);
}

function usedRanks(list) {
  return list.reduce((sum, entry) => sum + Number(entry.rankCost) * Number(entry.count || 1), 0);
}

function abilityRows(style, selected) {
  const selectedMap = new Map(selected.map(entry => [entry.name, entry]));
  return style.abilities.map(([name, rawCost]) => {
    const repeatable = String(rawCost).includes("*");
    const rankCost = Number.parseInt(rawCost, 10);
    const count = Number(selectedMap.get(name)?.count || 0);
    const control = repeatable
      ? `<input class="rmu-qol-ability-count" type="number" min="0" step="1" value="${count}" data-name="${name}" data-cost="${rankCost}">`
      : `<input class="rmu-qol-ability-check" type="checkbox" ${count ? "checked" : ""} data-name="${name}" data-cost="${rankCost}">`;
    return `<tr><td>${control}</td><td>${name}</td><td class="rmu-text-center">${rankCost}${repeatable ? "*" : ""}</td></tr>`;
  }).join("");
}

function readAllocations(root) {
  const result = [];
  for (const input of root.querySelectorAll(".rmu-qol-ability-check, .rmu-qol-ability-count")) {
    const count = input.type === "checkbox" ? (input.checked ? 1 : 0) : Math.max(0, Number(input.value || 0));
    if (!count) continue;
    result.push({ name: input.dataset.name, rankCost: Number(input.dataset.cost), count });
  }
  return result;
}

async function manageAbilities(item, windowId) {
  const style = FIGHTING_STYLES[item.system.specialization];
  if (!style) return;

  const ranks = totalRanks(item);
  let dialogElement;
  const updateStatus = () => {
    const selected = readAllocations(dialogElement);
    const used = usedRanks(selected);
    const remaining = ranks - used;
    const status = dialogElement.querySelector(".rmu-qol-allocation-status");
    status.textContent = `${used} allocated / ${ranks} ranks (${remaining} unallocated)`;
    status.classList.toggle("rmu-qol-overallocated", remaining < 0);
    const save = dialogElement.querySelector('[data-action="save"]');
    if (save) save.disabled = remaining < 0;
  };

  await foundry.applications.api.DialogV2.wait({
    window: { title: `${item.system.name}: ${item.system.specialization}` },
    renderOptions: { window: { windowId } },
    classes: ["rmu-dialogv2-sheet", "rmu-qol-ability-dialog"],
    position: { width: 620 },
    content: `<div class="rmu-qol-allocation-status"></div><p>Allocate ranks purchased in this fighting style. Requirements are reference-only and are not automated.</p><table><thead><tr><th></th><th>Ability</th><th>Rank Cost</th></tr></thead><tbody>${abilityRows(style, allocations(item))}</tbody></table>`,
    buttons: [
      {
        action: "save",
        label: "Save Allocations",
        icon: "rmu-mdi rmu-mdi-check",
        callback: async () => {
          const selected = readAllocations(dialogElement);
          if (usedRanks(selected) > ranks) return false;
          const pack = game.packs.get(PACK_ID);
          const docs = pack ? await pack.getDocuments({ type: "talent" }) : [];
          const uuidByName = new Map(docs.filter(doc => doc.getFlag(MODULE_ID, "fightingStyleAbility")).map(doc => [doc.name, doc.uuid]));
          for (const entry of selected) entry.compendiumUuid = uuidByName.get(entry.name) ?? null;
          await item.setFlag(MODULE_ID, "fightingStyle", { abilities: selected });
          return true;
        }
      },
      { action: "cancel", label: game.i18n.localize("RMU.Terms.Cancel") }
    ],
    rejectClose: false,
    render: (_event, dialog) => {
      dialogElement = dialog.element;
      for (const input of dialogElement.querySelectorAll("input")) input.addEventListener("change", updateStatus);
      updateStatus();
    }
  });
}

export function registerFightingStyleAbilityManager() {
  if (sheetPatched || game.system.id !== "rmu") return;

  const originalRender = CharacterSheetV2RMU.prototype._onRender;
  CharacterSheetV2RMU.prototype._onRender = function (...args) {
    originalRender.apply(this, args);

    for (const row of this.element.querySelectorAll("tr.rmu-drag-skill")) {
      const style = FIGHTING_STYLES[row.dataset.rmuSkillSpecialization];
      const itemId = row.dataset.rmuSkillId;
      if (!style || style.skill !== row.dataset.rmuSkillName || !itemId) continue;

      const item = this.document.items.get(itemId);
      if (!item || row.querySelector(".rmu-qol-manage-abilities")) continue;

      const selected = allocations(item);
      const used = usedRanks(selected);
      const ranks = totalRanks(item);
      const button = document.createElement("button");
      button.type = "button";
      button.className = "rmu-qol-manage-abilities";
      button.title = "Manage Fighting Style Abilities";
      button.innerHTML = `<i class="rmu-mdi rmu-mdi-format-list-checks"></i><span>${used}/${ranks}</span>`;
      button.addEventListener("click", event => {
        event.preventDefault();
        event.stopPropagation();
        manageAbilities(item, this.window?.windowId).then(() => this.render({ force: true }));
      });
      row.children[1]?.appendChild(button);
    }
  };

  sheetPatched = true;
}
