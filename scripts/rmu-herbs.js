const MODULE_ID = "rmu-qol";
const HERB_FLAG = "herbCard";
const PENDING_FLAG = "herbPending";
const SOCKET_NAME = `module.${MODULE_ID}`;
const SOCKET_TIMEOUT_MS = 15000;
const pendingSocketRequests = new Map();

const HERB_LIBRARY = {
  akbutege: { name: "Akbutege", notes: "Coastal plant. Heals 1-10 hits.", delay: "1d10", effects: [{ effect: "heal-hits", formula: "1d10" }] },
  arlan: { name: "Arlan", notes: "Heals 3-7 hits.", delay: "1d10", effects: [{ effect: "heal-hits", formula: "1d5+2" }] },
  cusamar: { name: "Cusamar", notes: "Heals 15-60 hits.", delay: "1d10", effects: [{ effect: "heal-hits", formula: "10+5d10" }] },
  darsuion: { name: "Darsuion", notes: "Heals 1-5 hits.", delay: "1d10", effects: [{ effect: "heal-hits", formula: "1d5" }] },
  draaf: {
    name: "Draaf",
    notes: "Heals 1-10 hits each round for 2 consecutive rounds after the delay.",
    delay: "1d10",
    effects: [
      { effect: "heal-hits", formula: "1d10", roundOffset: 0 },
      { effect: "heal-hits", formula: "1d10", roundOffset: 1 }
    ]
  },
  dugmuthur: { name: "Dugmuthur", notes: "Heals 10 hits. Immediate.", delay: "0", effects: [{ effect: "heal-hits", formula: "10" }] },
  gariig: { name: "Gariig", notes: "Heals 30 hits.", delay: "1d10", effects: [{ effect: "heal-hits", formula: "30" }] },
  gefnul: { name: "Gefnul", notes: "Heals 100 hits.", delay: "1d10", effects: [{ effect: "heal-hits", formula: "100" }] },
  mirenna: { name: "Mirenna", notes: "Heals 10 hits. Immediate.", delay: "0", effects: [{ effect: "heal-hits", formula: "10" }] },
  reglin: { name: "Reglin", notes: "Heals 50 hits.", delay: "1d10", effects: [{ effect: "heal-hits", formula: "50" }] },
  rewk: { name: "Rewk", notes: "Heals 2-20 hits.", delay: "1d10", effects: [{ effect: "heal-hits", formula: "2d10" }] },
  thurl: { name: "Thurl", notes: "Heals 1-5 hits.", delay: "1d10", effects: [{ effect: "heal-hits", formula: "1d5" }] },
  winclamit: { name: "Winclamit", notes: "Heals 3-300 hits.", delay: "1d10", effects: [{ effect: "heal-hits", formula: "3d100" }] },
  yavethalion: { name: "Yavethalion", notes: "Heals 5-50 hits.", delay: "1d10", effects: [{ effect: "heal-hits", formula: "5d10" }] },
  janukty: { name: "Januk-ty", notes: "Stun relief for 3 rounds. Immediate.", delay: "0", effects: [{ effect: "heal-stun", formula: "3" }] },
  suranie: { name: "Suranie", notes: "Stun relief for 1 round. Immediate.", delay: "0", effects: [{ effect: "heal-stun", formula: "1" }] },
  vinuk: { name: "Vinuk", notes: "Stun relief for 1-10 rounds. Immediate.", delay: "0", effects: [{ effect: "heal-stun", formula: "1d10" }] },
  welwal: { name: "Welwal", notes: "Stun relief for 3 rounds. Immediate.", delay: "0", effects: [{ effect: "heal-stun", formula: "3" }] },
  witav: { name: "Witav", notes: "Stun relief for 2 rounds. Immediate.", delay: "0", effects: [{ effect: "heal-stun", formula: "2" }] }
};

function norm(value) {
  return String(value ?? "").toLowerCase().replace(/[^a-z0-9]/g, "");
}

function escapeHtml(value) {
  return String(value ?? "").replace(/[&<>"']/g, c => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    "\"": "&quot;",
    "'": "&#39;"
  }[c]));
}

function stripHtml(value) {
  const div = document.createElement("div");
  div.innerHTML = String(value ?? "");
  return div.textContent ?? div.innerText ?? "";
}

function formulaIsZero(formula) {
  return Number(String(formula ?? "0").trim()) === 0;
}

function hasRolledTotal(value) {
  return value !== null && value !== undefined && value !== "" && Number.isFinite(Number(value));
}

function normalizeEffectName(effect) {
  const value = String(effect ?? "").toLowerCase();
  if (value === "reduce-stun" || value === "heal-stun" || value.includes("stun")) return "heal-stun";
  return "heal-hits";
}

function normalizeFormula(effectData) {
  if (effectData?.formula !== undefined && effectData.formula !== null && effectData.formula !== "") return String(effectData.formula);
  if (effectData?.value !== undefined && effectData.value !== null && effectData.value !== "") return String(effectData.value);
  return "1d10";
}

function normalizeEffects(effects) {
  return Array.from(effects ?? []).map(effect => ({
    effect: normalizeEffectName(effect.effect),
    formula: normalizeFormula(effect),
    roundOffset: Number(effect.roundOffset ?? 0)
  }));
}

function libraryToHerbData(key, libraryEntry) {
  const effects = normalizeEffects(libraryEntry.effects);
  const isStun = effects[0]?.effect === "heal-stun";
  return {
    key,
    label: libraryEntry.name,
    type: isStun ? "stun" : "heal",
    description: libraryEntry.notes,
    delayFormula: String(libraryEntry.delay ?? "0"),
    immediateOnly: formulaIsZero(libraryEntry.delay),
    effectLabel: isStun ? "Reduce Stun" : "Heal Hits",
    effects
  };
}

function getLibraryKeyFromItem(item) {
  const itemName = norm(item.name);
  return Object.keys(HERB_LIBRARY).find(key => itemName.includes(norm(HERB_LIBRARY[key].name)));
}

function itemIsRealHerb(item) {
  return norm(item.type) === "herb" || !!getLibraryKeyFromItem(item);
}

function makeHerbFromRmuItem(item, key, libraryEntry) {
  const itemEffects = normalizeEffects(foundry.utils.getProperty(item, "system.effects"));
  const base = libraryEntry ? libraryToHerbData(key, libraryEntry) : null;
  const effects = itemEffects.length
    ? mergeItemEffectsWithLibraryTiming(itemEffects, base?.effects ?? [])
    : (base?.effects ?? []);
  const isStun = effects[0]?.effect === "heal-stun";
  const notes = stripHtml(foundry.utils.getProperty(item, "system.notes") ?? "").trim();

  return {
    key,
    label: item.name,
    type: isStun ? "stun" : "heal",
    description: notes || base?.description || (isStun ? "Stun relief herb." : "Healing herb."),
    delayFormula: base?.delayFormula ?? "0",
    immediateOnly: isStun || formulaIsZero(base?.delayFormula ?? "0"),
    effectLabel: isStun ? "Reduce Stun" : "Heal Hits",
    effects: effects.length ? effects : [{
      effect: isStun ? "heal-stun" : "heal-hits",
      formula: "1d10",
      roundOffset: 0
    }]
  };
}

function mergeItemEffectsWithLibraryTiming(itemEffects, libraryEffects) {
  if (!libraryEffects.length) return itemEffects;
  if (libraryEffects.length <= itemEffects.length) {
    return itemEffects.map((effect, index) => ({
      ...effect,
      roundOffset: Number(effect.roundOffset ?? libraryEffects[index]?.roundOffset ?? 0)
    }));
  }

  return libraryEffects.map((libraryEffect, index) => {
    const itemEffect = itemEffects[index] ?? itemEffects.find(effect => effect.effect === libraryEffect.effect) ?? itemEffects[0];
    return {
      effect: itemEffect?.effect ?? libraryEffect.effect,
      formula: itemEffect?.formula ?? libraryEffect.formula,
      roundOffset: Number(libraryEffect.roundOffset ?? itemEffect?.roundOffset ?? 0)
    };
  });
}

function getHerbFromItem(item) {
  const key = getLibraryKeyFromItem(item);
  const libraryEntry = key ? HERB_LIBRARY[key] : null;

  if (norm(item.type) === "herb") {
    const herbData = makeHerbFromRmuItem(item, key ?? `custom:${item.id}`, libraryEntry);
    return { herbKey: herbData.key, herbData };
  }

  if (key) return { herbKey: key, herbData: libraryToHerbData(key, libraryEntry) };
  return null;
}

function getHerbFromData(data) {
  if (data.herbData) return data.herbData;
  const libraryEntry = HERB_LIBRARY[data.herbKey];
  return libraryEntry ? libraryToHerbData(data.herbKey, libraryEntry) : null;
}

function getSceneTokens() {
  return canvas.tokens.placeables
    .filter(token => token.actor && ["character", "creature", "Character", "Creature"].includes(token.actor.type))
    .sort((a, b) => a.actor.name.localeCompare(b.actor.name));
}

function actorCanUse(actor) {
  return actor?.testUserPermission?.(game.user, "OWNER") || game.user.isGM;
}

function getQuantity(item) {
  for (const path of ["system.quantity.value", "system.quantity", "system.qty.value", "system.qty", "system.amount.value", "system.amount"]) {
    const value = foundry.utils.getProperty(item, path);
    if (Number.isFinite(Number(value))) return Number(value);
  }
  return 1;
}

async function setQuantity(item, quantity) {
  for (const path of ["system.quantity.value", "system.quantity", "system.qty.value", "system.qty", "system.amount.value", "system.amount"]) {
    if (foundry.utils.hasProperty(item, path)) {
      await item.update({ [path]: Math.max(0, quantity) });
      return;
    }
  }
}

function getHerbItems(actor) {
  return actor.items
    .map(item => {
      if (!itemIsRealHerb(item)) return null;
      const herbInfo = getHerbFromItem(item);
      return herbInfo ? { item, ...herbInfo, quantity: getQuantity(item) } : null;
    })
    .filter(entry => entry && entry.quantity > 0)
    .sort((a, b) => a.herbData.label.localeCompare(b.herbData.label));
}

function resolveTokenActor(tokenId, actorId) {
  const token = tokenId ? canvas.tokens.get(tokenId) : null;
  if (token?.actor) return token.actor;
  return game.actors.get(actorId);
}

function hasAnyActiveGm() {
  return game.users.some(user => user.active && user.isGM);
}

function activeGmNames() {
  return game.users
    .filter(user => user.active && user.isGM)
    .map(user => user.name)
    .join(", ");
}

async function requestGmAction(action, payload) {
  if (game.user.isGM) return handleGmAction({ action, payload });
  if (!hasAnyActiveGm()) throw new Error("A GM must be logged in with RMU QoL enabled for players to apply herbs to actors they do not own.");

  const requestId = foundry.utils.randomID();

  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => {
      pendingSocketRequests.delete(requestId);
      reject(new Error(`Timed out waiting for an active GM client to perform ${action}. Active GM users seen by this client: ${activeGmNames() || "none"}. Make sure the GM browser has the current RMU QoL module enabled and has been refreshed after the module update.`));
    }, SOCKET_TIMEOUT_MS);

    pendingSocketRequests.set(requestId, { resolve, reject, timeout });

    game.socket.emit(SOCKET_NAME, {
      type: "request",
      requestId,
      userId: game.user.id,
      action,
      payload
    });
  });
}

async function handleGmAction({ action, payload }) {
  const actor = resolveTokenActor(payload?.targetTokenId, payload?.targetActorId);
  if (!actor) throw new Error("GM action target actor was not found.");

  if (action === "createOrRefreshPendingEffect") {
    await createOrRefreshPendingEffectLocal(actor, payload.data);
    return { ok: true };
  }

  if (action === "deletePendingEffect") {
    await deletePendingEffectLocal(actor, payload.messageId);
    return { ok: true };
  }

  if (action === "applyRollToActor") {
    const rollData = payload.rollData;
    const result = await applyRollToActorLocal(actor, rollData);
    return { ok: true, rollData, result };
  }

  throw new Error(`Unknown RMU QoL GM action: ${action}`);
}

export function registerGmSocket() {
  game.socket.on(SOCKET_NAME, async packet => {
    if (packet?.type === "response") {
      if (packet.userId !== game.user.id) return;

      const pending = pendingSocketRequests.get(packet.requestId);
      if (!pending) return;

      clearTimeout(pending.timeout);
      pendingSocketRequests.delete(packet.requestId);

      if (packet.ok) pending.resolve(packet.result);
      else pending.reject(new Error(packet.error ?? "Unknown GM socket error."));
      return;
    }

    if (packet?.type !== "request" || !game.user.isGM) return;

    try {
      const result = await handleGmAction(packet);
      game.socket.emit(SOCKET_NAME, {
        type: "response",
        requestId: packet.requestId,
        userId: packet.userId,
        ok: true,
        result
      });
    } catch (error) {
      console.error(`${MODULE_ID} | GM socket action failed`, error);
      game.socket.emit(SOCKET_NAME, {
        type: "response",
        requestId: packet.requestId,
        userId: packet.userId,
        ok: false,
        error: error.message
      });
    }
  });
}

async function rollFormula(formula) {
  const roll = new Roll(String(formula));
  await roll.evaluate();

  if (game.dice3d) {
    try {
      await game.dice3d.showForRoll(roll, game.user, true, null, false);
    } catch (error) {
      console.warn(`${MODULE_ID} | Dice So Nice display failed`, error);
    }
  }

  return roll;
}

function effectTag(effect) {
  return effect.effect === "heal-stun" ? "Reduce Stun" : "Heal Hits";
}

function rollRows(rolls) {
  return rolls.map(roll => `
    <div class="rmu-qol-roll-row">${escapeHtml(roll.formula)}</div>
    <div class="rmu-qol-roll-row">${escapeHtml(hasRolledTotal(roll.total) ? roll.total : "")}</div>
  `).join("");
}

function buildCardContent(data) {
  const herb = getHerbFromData(data);
  const isDelayed = data.delay > 0 && !data.forceImmediate;

  let actionButton = "";
  if (data.applied) {
    actionButton = `<button type="button" class="rmu-qol-card-action is-disabled" disabled>APPLIED</button>`;
  } else if (data.applyRequested) {
    actionButton = `<button type="button" class="rmu-qol-card-action is-disabled" disabled>APPLYING</button>`;
  } else if (data.checkRequested) {
    actionButton = `<button type="button" class="rmu-qol-card-action is-disabled" disabled>CHECKING</button>`;
  } else if (isDelayed && !data.timerStarted) {
    actionButton = `<button type="button" class="rmu-qol-card-action rmu-qol-herb-start" data-message-id="${data.messageId}">START TIMER</button>`;
  } else if (isDelayed && data.timerStarted) {
    actionButton = `<button type="button" class="rmu-qol-card-action rmu-qol-herb-check" data-message-id="${data.messageId}">CHECK TIMER</button>`;
  } else {
    actionButton = `<button type="button" class="rmu-qol-card-action rmu-qol-herb-apply" data-message-id="${data.messageId}">APPLY</button>`;
  }

  const status = data.applied
    ? "Applied"
    : isDelayed && data.timerStarted
      ? `Timer started. Next effect applies on round ${data.nextRound}.`
      : isDelayed
        ? `Delay rolled: ${data.delay} rounds. Start the timer when the herb is applied.`
        : "Ready to apply immediately.";

  const detailBlock = data.rolls?.length ? `
    <div class="rmu-qol-rolls">${rollRows(data.rolls)}</div>
    <div class="rmu-qol-result">
      <strong>${escapeHtml(data.resultTitle ?? herb.effectLabel)}</strong>
      <span>${escapeHtml(data.resultText ?? "")}</span>
    </div>
  ` : "";

  return `
<div class="rmu-qol-card">
  <div class="rmu-qol-rail"><span>HERB</span></div>
  <div class="rmu-qol-card-body">
    <div class="rmu-qol-herb-icon"><i class="fas fa-leaf"></i></div>
    <div class="rmu-qol-card-title">${escapeHtml(herb.label)}</div>
    <div class="rmu-qol-card-target">${escapeHtml(data.targetActorName)}</div>
    <div class="rmu-qol-card-text">${escapeHtml(herb.description)}</div>
    <div class="rmu-qol-card-text">${escapeHtml(status)}</div>
    ${detailBlock}
    <div class="rmu-qol-tags"><i class="fas fa-hand-holding-medical"></i> ${escapeHtml(data.tags ?? "")}</div>
  </div>
</div>
${actionButton}
`;
}

async function updateCard(message, data) {
  data.messageId = message.id;
  await message.update({
    content: buildCardContent(data),
    [`flags.${MODULE_ID}.${HERB_FLAG}`]: data
  });
}

async function applyHealing(actor, amount) {
  const hp = actor.system?.health?.hp;
  if (!hp) return { ok: false, text: `No HP data found on ${actor.name}.` };

  const current = Number.isFinite(Number(hp.value)) ? Number(hp.value) : 0;
  const max = Number.isFinite(Number(hp.max)) ? Number(hp.max) : null;
  const heal = Number(amount) || 0;
  const updated = max === null ? current + heal : Math.min(current + heal, max);

  await actor.update({ "system.health.hp.value": updated });
  actor.sheet?.render(false);

  return {
    ok: true,
    text: `${actor.name} recovers ${heal} Hits, changing HP from ${current} to ${updated}${max !== null ? ` / ${max}` : ""}.`
  };
}

function findOwnedStunEffect(actor) {
  return Array.from(actor.effects ?? []).find(effect => {
    const name = norm(effect.name);
    return effect.type === "stun" || effect.system?.type === "stun" || name === "stun";
  }) ?? null;
}

function totalStunRounds(rounds) {
  return rounds.reduce((total, value) => total + Number(value || 0), 0);
}

async function applyStunRelief(actor, amount) {
  const stunEffect = findOwnedStunEffect(actor);
  if (!stunEffect) return { ok: false, text: `${actor.name} has no owned Stun effect to reduce.` };

  const before = [0, 1, 2].map(index => Number(stunEffect.system?.rounds?.[index] ?? 0));
  const after = [...before];
  let remaining = Number(amount) || 0;

  for (const index of [2, 1, 0]) {
    const take = Math.min(after[index], remaining);
    after[index] -= take;
    remaining -= take;
    if (remaining <= 0) break;
  }

  const reduced = totalStunRounds(before) - totalStunRounds(after);
  if (reduced <= 0) return { ok: false, text: `${actor.name}'s stun was not changed.` };

  const live = actor.effects.get(stunEffect.id);
  if (!live) return { ok: false, text: `The Stun effect was not found directly on ${actor.name}.` };

  if (totalStunRounds(after) <= 0) {
    await actor.deleteEmbeddedDocuments("ActiveEffect", [stunEffect.id]);
  } else {
    const delayAfter = Math.min(Number(stunEffect.system?.delayDecayRounds ?? 0), totalStunRounds(after));
    await actor.updateEmbeddedDocuments("ActiveEffect", [{
      _id: stunEffect.id,
      "system.rounds": after,
      "system.delayDecayRounds": delayAfter
    }]);
  }

  actor.sheet?.render(false);
  return { ok: true, text: `Reduce Stun: ${reduced}.` };
}

function pendingSummary(data) {
  const formulas = data.pendingRolls.map(roll => `${effectTag(roll)}: ${roll.formula}`).join("; ");
  return {
    bonus: data.pendingRolls.map(roll => roll.formula).join(", "),
    effect: formulas
  };
}

async function createOrRefreshPendingEffectLocal(actor, data) {
  const herb = getHerbFromData(data);
  const display = pendingSummary(data);
  const existing = Array.from(actor.effects ?? []).find(effect =>
    effect.getFlag(MODULE_ID, PENDING_FLAG)?.messageId === data.messageId
  );

  const currentRound = game.combat?.round ?? 0;
  const notApplied = data.pendingRolls.filter(roll => !roll.applied);
  const lastDueRound = notApplied.length
    ? Math.max(...notApplied.map(roll => roll.dueRound ?? data.nextRound ?? currentRound))
    : currentRound;
  const durationRounds = Math.max(1, lastDueRound - currentRound);

  const effectData = {
    name: `${herb.label} Pending`,
    type: "enchantment",
    icon: "icons/svg/aura.svg",
    duration: {
      rounds: durationRounds,
      startRound: currentRound,
      startTurn: game.combat?.turn ?? 0
    },
    changes: [],
    system: {
      source: null,
      sourceName: data.sourceActorName ?? herb.label,
      description: display.effect,
      summary: {
        type: "Herb",
        level: 0,
        realm: "",
        bonus: display.bonus,
        sub1: display.effect,
        sub1Label: "",
        sub2: "",
        sub2Label: "",
        sub3: "",
        sub3Label: ""
      }
    },
    flags: {
      [MODULE_ID]: {
        [PENDING_FLAG]: data
      }
    }
  };

  if (existing) {
    await existing.update(effectData);
    return existing;
  }

  const created = await actor.createEmbeddedDocuments("ActiveEffect", [effectData]);
  return created[0];
}

async function createOrRefreshPendingEffect(actor, data) {
  if (actorCanUse(actor)) return createOrRefreshPendingEffectLocal(actor, data);

  game.socket.emit(SOCKET_NAME, {
    type: "request",
    requestId: foundry.utils.randomID(),
    userId: game.user.id,
    action: "createOrRefreshPendingEffect",
    payload: {
      targetActorId: actor.id,
      targetTokenId: data.targetTokenId,
      data
    }
  });

  return null;
}

async function createOrRefreshPendingEffectViaGm(actor, data) {
  if (actorCanUse(actor)) return createOrRefreshPendingEffectLocal(actor, data);

  return requestGmAction("createOrRefreshPendingEffect", {
    targetActorId: actor.id,
    targetTokenId: data.targetTokenId,
    data
  });
}

async function deletePendingEffectLocal(actor, messageId) {
  const effect = Array.from(actor.effects ?? []).find(candidate =>
    candidate.getFlag(MODULE_ID, PENDING_FLAG)?.messageId === messageId
  );

  if (effect && actor.effects.get(effect.id)) {
    await actor.deleteEmbeddedDocuments("ActiveEffect", [effect.id]);
  }
}

async function deletePendingEffect(actor, messageId, data = null) {
  if (actorCanUse(actor)) return deletePendingEffectLocal(actor, messageId);

  return requestGmAction("deletePendingEffect", {
    targetActorId: actor.id,
    targetTokenId: data?.targetTokenId,
    messageId
  });
}

async function ensureRollData(rollData) {
  if (hasRolledTotal(rollData.total)) return rollData;
  const roll = await rollFormula(rollData.formula);
  rollData.total = roll.total;
  return rollData;
}

async function applyRollToActorLocal(actor, rollData) {
  await ensureRollData(rollData);
  if (rollData.effect === "heal-stun") return applyStunRelief(actor, rollData.total);
  return applyHealing(actor, rollData.total);
}

async function applyRollToActor(actor, rollData, data = null) {
  if (actorCanUse(actor)) return applyRollToActorLocal(actor, rollData);

  const response = await requestGmAction("applyRollToActor", {
    targetActorId: actor.id,
    targetTokenId: data?.targetTokenId,
    rollData
  });

  if (response?.rollData) Object.assign(rollData, response.rollData);
  return response?.result ?? { ok: false, text: "GM herb application did not return a result." };
}

async function renderAppliedMessage(sourceActor, targetActor, herbKey, herbData, rollData, resultText) {
  const content = buildCardContent({
    sourceActorName: sourceActor.name,
    targetActorName: targetActor.name,
    herbKey,
    herbData,
    forceImmediate: true,
    applied: true,
    rolls: [rollData],
    resultTitle: effectTag(rollData),
    resultText,
    tags: `${effectTag(rollData)}: ${rollData.formula}`
  });

  await ChatMessage.create({
    speaker: ChatMessage.getSpeaker({ actor: targetActor }),
    content
  });
}

async function applyImmediateCard(message, data) {
  if (data.applied) return;

  const sourceActor = resolveTokenActor(data.sourceTokenId, data.sourceActorId);
  const targetActor = resolveTokenActor(data.targetTokenId, data.targetActorId);
  if (!sourceActor || !targetActor) return ui.notifications.warn("Source or recipient actor was not found on the scene.");

  if (!actorCanUse(targetActor)) {
    const herb = getHerbFromData(data);
    data.applyRequested = true;
    data.resultTitle = "Apply Requested";
    data.resultText = `Waiting for the GM client to apply ${herb.label} to ${targetActor.name}.`;
    await updateCard(message, data);
    ui.notifications.info(`${herb.label} application requested from the GM client.`);
    return;
  }

  const results = [];
  for (const roll of data.rolls) {
    if (roll.effect === "delay") continue;
    const result = await applyRollToActor(targetActor, roll, data);
    results.push(result.text);
  }

  const herb = getHerbFromData(data);
  data.applied = true;
  data.applyRequested = false;
  data.resultTitle = herb.effectLabel;
  data.resultText = results.join(" ");
  await updateCard(message, data);
}

async function startHerbTimer(message, data) {
  if (!game.combat) return ui.notifications.warn("Start a combat before starting a delayed herb timer.");
  if (data.timerStarted) return;

  const targetActor = resolveTokenActor(data.targetTokenId, data.targetActorId);
  const herb = getHerbFromData(data);
  if (!targetActor) return ui.notifications.warn("Recipient actor was not found on the scene.");

  data.timerStarted = true;
  data.startedRound = game.combat.round;
  data.baseApplyRound = game.combat.round + data.delay;
  data.pendingRolls = data.pendingRolls.map(roll => ({
    ...roll,
    total: null,
    applied: false,
    dueRound: data.baseApplyRound + Number(roll.roundOffset ?? 0)
  }));
  data.nextRound = Math.min(...data.pendingRolls.filter(roll => !roll.applied).map(roll => roll.dueRound));
  data.processingRound = null;
  data.lastAppliedRound = null;
  data.resultTitle = "Timer Started";
  data.resultText = `${data.delay} ${data.delay === 1 ? "round" : "rounds"} remaining. Current combat round ${game.combat.round}; next effect applies on round ${data.nextRound}.`;

  await createOrRefreshPendingEffect(targetActor, data);
  await updateCard(message, data);
  ui.notifications.info(`${herb.label} timer started for ${targetActor.name}.`);
}

async function requestTimerCheck(message, data) {
  if (game.user.isGM || !hasAnyActiveGm()) {
    await finishTimerCheck(message, data);
    return;
  }

  data.checkRequested = true;
  data.resultTitle = "Timer Check Requested";
  data.resultText = "Waiting for the GM client to check this herb timer.";
  await updateCard(message, data);
}

async function finishTimerCheck(message, data) {
  await checkAllHerbTimers();

  const latest = foundry.utils.deepClone(message.getFlag(MODULE_ID, HERB_FLAG) ?? data);
  if (!latest?.messageId || latest.applied) return;

  latest.checkRequested = false;
  latest.resultTitle = "Timer Checked";

  if (!game.combat) {
    latest.resultText = "No active combat is running.";
  } else if (latest.timerStarted) {
    const currentRound = Number(game.combat.round ?? 0);
    const nextRound = Number(latest.nextRound ?? currentRound);
    const remaining = Math.max(0, nextRound - currentRound);
    const roundText = remaining === 1 ? "round" : "rounds";
    latest.resultText = `${remaining} ${roundText} remaining. Current combat round ${currentRound}; next effect applies on round ${nextRound}.`;
  } else {
    latest.resultText = "The timer has not been started yet.";
  }

  await updateCard(message, latest);
}

async function applyDueSchedule(actor, data, message) {
  if (!game.combat || data.applied || !data.timerStarted) return;

  const currentRound = game.combat.round ?? 0;
  if ((data.nextRound ?? 0) > currentRound) return;
  if (data.processingRound === currentRound || data.lastAppliedRound === currentRound) return;

  const herb = getHerbFromData(data);
  data.processingRound = currentRound;
  if (message) await message.setFlag(MODULE_ID, HERB_FLAG, data);

  const dueRolls = data.pendingRolls.filter(roll => !roll.applied && Number(roll.dueRound ?? data.nextRound) <= currentRound);
  if (!dueRolls.length) {
    data.processingRound = null;
    if (message) await message.setFlag(MODULE_ID, HERB_FLAG, data);
    return;
  }

  const sourceActor = resolveTokenActor(data.sourceTokenId, data.sourceActorId) ?? actor;

  for (const rollData of dueRolls) {
    const result = await applyRollToActor(actor, rollData, data);
    rollData.applied = true;
    await renderAppliedMessage(sourceActor, actor, data.herbKey, herb, rollData, result.text);
  }

  data.lastAppliedRound = currentRound;
  data.processingRound = null;

  const remaining = data.pendingRolls.filter(roll => !roll.applied);
  if (!remaining.length) {
    data.applied = true;
    data.resultTitle = "Applied";
    data.resultText = `${herb.label} has finished applying.`;
    await deletePendingEffect(actor, data.messageId, data);
  } else {
    data.nextRound = Math.min(...remaining.map(roll => roll.dueRound));
    data.resultTitle = "Timer Running";
    const roundsRemaining = Math.max(0, Number(data.nextRound) - Number(currentRound));
    data.resultText = `${roundsRemaining} ${roundsRemaining === 1 ? "round" : "rounds"} remaining. Current combat round ${currentRound}; next effect applies on round ${data.nextRound}.`;
    await createOrRefreshPendingEffect(actor, data);
  }

  if (message) await updateCard(message, data);
}

export async function checkAllHerbTimers() {
  if (!game.combat) return;
  if (!game.user.isGM && hasAnyActiveGm()) return;

  const checked = new Set();

  for (const message of game.messages.contents) {
    const data = message.getFlag(MODULE_ID, HERB_FLAG);
    if (!data?.messageId || !data.timerStarted || data.applied) continue;

    checked.add(data.messageId);
    const actor = resolveTokenActor(data.targetTokenId, data.targetActorId);
    if (!actor) continue;

    const latest = foundry.utils.deepClone(data);
    await applyDueSchedule(actor, latest, message);
  }

  for (const token of canvas.tokens.placeables) {
    const actor = token.actor;
    if (!actor) continue;

    for (const effect of Array.from(actor.effects ?? [])) {
      const data = effect.getFlag(MODULE_ID, PENDING_FLAG);
      if (!data?.messageId || checked.has(data.messageId)) continue;

      const message = game.messages.get(data.messageId);
      const latest = foundry.utils.deepClone(message?.getFlag(MODULE_ID, HERB_FLAG) ?? data);
      await applyDueSchedule(actor, latest, message);
    }
  }
}

export function registerHerbChatListeners() {
  Hooks.on("updateChatMessage", async message => {
    if (!game.user.isGM) return;

    const data = message.getFlag(MODULE_ID, HERB_FLAG);
    if (!data?.messageId || data.applied) return;

    if (data.applyRequested) {
      await applyImmediateCard(message, foundry.utils.deepClone(data));
      return;
    }

    if (data.checkRequested) {
      const latest = foundry.utils.deepClone(data);
      latest.checkRequested = false;
      await finishTimerCheck(message, latest);
      return;
    }

    if (!data.timerStarted) return;

    const actor = resolveTokenActor(data.targetTokenId, data.targetActorId);
    if (!actor) return;

    await createOrRefreshPendingEffectLocal(actor, foundry.utils.deepClone(data));
    await checkAllHerbTimers();
  });

  Hooks.on("renderChatMessageHTML", (_message, html) => {
    const root = html instanceof HTMLElement ? html : html?.[0];
    if (!root || root.dataset.rmuQolHerbListener === "1") return;

    root.dataset.rmuQolHerbListener = "1";

    root.addEventListener("click", async event => {
      const start = event.target.closest?.(".rmu-qol-herb-start");
      const apply = event.target.closest?.(".rmu-qol-herb-apply");
      const check = event.target.closest?.(".rmu-qol-herb-check");
      const button = start || apply || check;
      if (!button) return;

      const messageId = button.dataset.messageId;
      const message = game.messages.get(messageId);
      if (!message) return ui.notifications.warn("Herb card message not found.");

      const data = foundry.utils.deepClone(message.getFlag(MODULE_ID, HERB_FLAG));
      if (!data) return ui.notifications.warn("Herb card data not found.");

      if (start) await startHerbTimer(message, data);
      if (apply) await applyImmediateCard(message, data);
      if (check) await requestTimerCheck(message, data);
    });
  });
}

function herbOptionsForToken(tokenId) {
  const token = canvas.tokens.get(tokenId);
  const actor = token?.actor;
  if (!actor) return "";

  const herbs = getHerbItems(actor);
  if (!herbs.length) return `<option value="">No usable herbs found</option>`;

  return herbs.map(entry => {
    const herb = entry.herbData;
    const effectText = herb.effects.map(effect => effect.formula).join(", ");
    return `<option value="${entry.item.id}">${escapeHtml(herb.label)} (${escapeHtml(effectText)}, qty ${entry.quantity})</option>`;
  }).join("");
}

async function useHerbFromForm(root, app) {
  const sourceTokenId = root.querySelector('[name="sourceTokenId"]')?.value;
  const targetTokenId = root.querySelector('[name="targetTokenId"]')?.value;
  const itemId = root.querySelector('[name="itemId"]')?.value;
  const forceImmediate = !!root.querySelector('[name="forceImmediate"]')?.checked;

  if (!itemId) return ui.notifications.warn("No herb selected.");

  const sourceToken = canvas.tokens.get(sourceTokenId);
  const targetToken = canvas.tokens.get(targetTokenId);
  const sourceActor = sourceToken?.actor;
  const targetActor = targetToken?.actor;

  if (!sourceActor || !targetActor) return ui.notifications.warn("Source or recipient token not found.");
  if (!actorCanUse(sourceActor)) return ui.notifications.warn(`You do not own ${sourceActor.name}.`);

  const item = sourceActor.items.get(itemId);
  if (!item) return ui.notifications.warn("Herb item not found on the source actor.");

  const herbInfo = getHerbFromItem(item);
  if (!herbInfo) return ui.notifications.warn("That item is not recognized as an herb.");

  const { herbKey, herbData: herb } = herbInfo;
  const quantity = getQuantity(item);
  if (quantity <= 0) return ui.notifications.warn(`${sourceActor.name} has no ${herb.label} remaining.`);

  const isImmediate = forceImmediate || herb.immediateOnly || formulaIsZero(herb.delayFormula);
  const rolls = [];

  if (isImmediate) {
    for (const effect of herb.effects) {
      const roll = await rollFormula(effect.formula);
      rolls.push({
        effect: effect.effect,
        formula: effect.formula,
        roundOffset: Number(effect.roundOffset ?? 0),
        total: roll.total
      });
    }
  }

  let delay = 0;
  if (!isImmediate) {
    const delayRoll = await rollFormula(herb.delayFormula);
    delay = delayRoll.total;
    rolls.push({
      effect: "delay",
      formula: herb.delayFormula,
      total: delay
    });
  }

  await setQuantity(item, quantity - 1);

  const cardData = {
    sourceActorId: sourceActor.id,
    sourceTokenId,
    sourceActorName: sourceActor.name,
    targetActorId: targetActor.id,
    targetTokenId,
    targetActorName: targetActor.name,
    itemId: item.id,
    itemName: item.name,
    herbKey,
    herbData: herb,
    delay,
    forceImmediate: isImmediate,
    timerStarted: false,
    applied: false,
    applyRequested: false,
    rolls,
    pendingRolls: isImmediate
      ? []
      : herb.effects.map(effect => ({
        effect: effect.effect,
        formula: effect.formula,
        roundOffset: Number(effect.roundOffset ?? 0),
        total: null,
        applied: false
      })),
    resultTitle: isImmediate ? herb.effectLabel : "Delay Roll",
    resultText: isImmediate
      ? `${herb.label} is ready to apply.`
      : `${herb.label} will begin taking effect ${delay} rounds after the timer is started.`,
    tags: herb.effects.map(effect => `${effectTag(effect)}: ${effect.formula}`).join(", ")
  };

  const message = await ChatMessage.create({
    speaker: ChatMessage.getSpeaker({ actor: sourceActor }),
    content: buildCardContent(cardData),
    flags: {
      [MODULE_ID]: {
        [HERB_FLAG]: cardData
      }
    }
  });

  cardData.messageId = message.id;
  await updateCard(message, cardData);
  app.close();
}

export class RMUHerbUseApplication extends foundry.applications.api.ApplicationV2 {
  static DEFAULT_OPTIONS = {
    id: "rmu-qol-herb-use",
    classes: ["rmu-qol", "rmu-qol-herb-use"],
    window: { title: "Use Herb" },
    position: { width: 540 }
  };

  async _renderHTML(_context, _options) {
    const sceneTokens = getSceneTokens();
    const sourceTokens = sceneTokens.filter(token => actorCanUse(token.actor));

    if (!sourceTokens.length) {
      ui.notifications.warn("No owned RMU actors found on the scene.");
      return `<p>No owned RMU actors found on the scene.</p>`;
    }

    const sourceOptions = sourceTokens.map(token =>
      `<option value="${token.id}">${escapeHtml(token.actor.name)}</option>`
    ).join("");

    const targetOptions = sceneTokens.map(token =>
      `<option value="${token.id}">${escapeHtml(token.actor.name)}</option>`
    ).join("");

    const initialHerbs = herbOptionsForToken(sourceTokens[0].id);

    return `
<form class="rmu-qol-herb-form">
  <div class="form-row">
    <label>Source Actor</label>
    <select name="sourceTokenId">${sourceOptions}</select>
  </div>
  <div class="form-row">
    <label>Herb</label>
    <select name="itemId">${initialHerbs}</select>
  </div>
  <div class="form-row">
    <label>Recipient</label>
    <select name="targetTokenId">${targetOptions}</select>
  </div>
  <label class="check-row">
    <input type="checkbox" name="forceImmediate">
    <span>Apply herb effect immediately</span>
  </label>
  <div class="hint">RMU herb items use their own effects. The built-in library supplies delay timing.</div>
  <div class="actions">
    <button type="button" data-action="use"><i class="fas fa-leaf"></i> Use</button>
    <button type="button" data-action="cancel">Cancel</button>
  </div>
</form>
`;
  }

  _replaceHTML(result, content, _options) {
    content.innerHTML = result;
  }

  _onRender(context, options) {
    super._onRender(context, options);

    const root = this.element;
    const source = root.querySelector('[name="sourceTokenId"]');
    const herb = root.querySelector('[name="itemId"]');

    source?.addEventListener("change", () => {
      herb.innerHTML = herbOptionsForToken(source.value);
    });

    root.querySelector('[data-action="cancel"]')?.addEventListener("click", () => this.close());
    root.querySelector('[data-action="use"]')?.addEventListener("click", async event => {
      event.preventDefault();
      await useHerbFromForm(root, this);
    });
  }
}
