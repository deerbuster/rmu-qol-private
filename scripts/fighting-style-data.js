export const FIGHTING_STYLES = {
  "Berserker": {
    skill: "Battle Styles",
    prerequisites: "Using a two-handed weapon or two weapons; Fortitude skill.",
    description: "You fight in a wild frenzy, terrorizing foes while relying on overwhelming aggression.",
    abilities: [["Aspect of Fear", 4], ["Evade Shield", 5], ["Heedless Fury", 6], ["Hook Shield", 3], ["Improved Frenzy", 3], ["Killing Strike", 6], ["Pain Resistance", 6], ["Raging Wind", 2], ["Shieldbreaker", 4]]
  },
  "Commander": {
    skill: "Battle Styles",
    prerequisites: "Combatants under your command.",
    description: "You control the battlefield by directing allies and arranging your forces for maximum advantage.",
    abilities: [["Assess the Field", 2], ["Battle Line", 4], ["Coordinated Maneuver", 4], ["Expert Defense", 4], ["Jumping the Order", 2], ["Lend Expertise", 4], ["Marshal's Voice", 4], ["Move Together", 4], ["Push Through It", 4], ["Quick to Action", 4], ["Walk It Off", 3]]
  },
  "Doppelsöldner": {
    skill: "Battle Styles",
    prerequisites: "Using any two-handed melee weapon.",
    description: "A technique based on sheer might and overwhelming offense, historically associated with front-rank mercenaries using two-handed weapons.",
    abilities: [["Greater Adrenal Strength", 6], ["Heedless Fury", 6], ["Keep At Bay", 5], ["Killing Strike", 6], ["Pommel Strike", 6], ["Shieldbreaker", 4], ["Weapon Breaker", 5]]
  },
  "Flail": {
    skill: "Battle Styles",
    prerequisites: "Using any chain weapon.",
    description: "You specialize in the distinctive binding, sweeping, and shield-defeating maneuvers possible with chain weapons.",
    abilities: [["Aspect of Fear", 4], ["Binding Chain", 4], ["Disarming", 4], ["Evade Shield", 5], ["Heedless Fury", 6], ["Leg Sweep", 4], ["Overbearing", 2], ["Shield Bash", 6]]
  },
  "Horse Archer": {
    skill: "Battle Styles",
    prerequisites: "Using a bow. Individual abilities may additionally require being mounted.",
    description: "You combine the speed and mobility of a mount with the range and precision of archery.",
    abilities: [["Experienced Rider", 4], ["Improved Quickload", 4], ["Lightning Reflexes", "4*"], ["Point-Blank Shot", 3], ["Precise Target", 2], ["Protected Rider", 4], ["Ride As One", 2], ["Ride Under Cover", 3], ["Trick Shot", 5]]
  },
  "Mounted Knight": {
    skill: "Battle Styles",
    prerequisites: "Mounted.",
    description: "You exploit the power, protection, and mobility of a mount for both offense and defense.",
    abilities: [["Aspect of Fear", 4], ["Armored Mount", 4], ["Experienced Rider", 4], ["Lancer's Knockback", 4], ["Mount's Attack", 4], ["Protect Mount", 3], ["Protected Rider", 4], ["Ride As One", 2], ["Ride Under Cover", 3], ["Trample", 5]]
  },
  "Pikeman": {
    skill: "Battle Styles",
    prerequisites: "Using any pole arm.",
    description: "You use reach, formation, and coordinated attacks to keep foes at a distance and fight effectively from a second rank.",
    abilities: [["Brave Legion", 4], ["Keep At Bay", 5], ["Leg Sweep", 4], ["Marshal's Voice", 4], ["Move Together", 4], ["Pommel Strike", 6], ["Second Rank", 4]]
  },
  "Shieldbearer": {
    skill: "Battle Styles",
    prerequisites: "Using a shield.",
    description: "Your style uses a shield as both a defensive tool and an offensive weapon, alone or in formation.",
    abilities: [["Brave Legion", 4], ["Bullrush", 4], ["Defensive Bash", 3], ["Move Together", 4], ["Overbearing", 2], ["Shield Bash", 6], ["Shield Press", 4], ["Shield Wall", 6], ["Steady Shield", "2*"]]
  },
  "Archery": {
    skill: "Combat Styles",
    prerequisites: "Using a bow.",
    description: "Your mastery of the bow lets you make difficult shots and adapt to demanding battlefield conditions.",
    abilities: [["Careful Shot", 3], ["Double Shot", 6], ["Improved Quickload", 4], ["Point-Blank Shot", 3], ["Precise Target", 2], ["Shoot from Cover", 5], ["Shot on the Run", 4], ["Slowing Shot", 4], ["Trick Shot", 5]]
  },
  "Bodyguard": {
    skill: "Combat Styles",
    prerequisites: "None.",
    description: "You are trained to identify threats and protect a ward through vigilance, positioning, and rapid intervention.",
    abilities: [["Assess the Field", 2], ["Disarming", 4], ["Lightning Reflexes", "4*"], ["Loyal Protector", 3], ["Move Together", 4], ["Vigilant", 3], ["Zone of Control", "3*"]]
  },
  "Crossbow": {
    skill: "Combat Styles",
    prerequisites: "Using a crossbow.",
    description: "You overcome the crossbow's slow loading through practiced speed while developing accurate and opportunistic shots.",
    abilities: [["Careful Shot", 3], ["Fast Crank", 6], ["From the Shoulder", 4], ["Precise Target", 2], ["Shoot from Cover", 5], ["Shot on the Run", 4], ["Slowing Shot", 4], ["Trick Shot", 5]]
  },
  "Dark Blade": {
    skill: "Combat Styles",
    prerequisites: "Using one-handed weapon(s), no shield larger than a target shield, and no armor heavier than AT 6.",
    description: "A style of thieves and rogues that uses stealth, misdirection, and speed to create openings.",
    abilities: [["Concealed Strike", 3], ["Dirty Fighting", 4], ["Feint", 6], ["Improved Concealed Strike", 4], ["Lightning Reflexes", "4*"], ["Seen It", 4], ["Shadowblade", 6]]
  },
  "Dual Wielding": {
    skill: "Combat Styles",
    prerequisites: "Wielding two weapons.",
    description: "You coordinate two weapons for offense and defense, drawing on traditions ranging from fencing to paired-stick systems.",
    abilities: [["Off-Hand Light Weapon", 2], ["Paired Weapon Attack", 4], ["Improved Parry", 4], ["Lightning Reflexes", "4*"], ["Dual-Draw", 2], ["Defensive Ward", 6], ["Split Focus", 4], ["Sweeping Parry", 4]]
  },
  "Fencing": {
    skill: "Combat Styles",
    prerequisites: "Using a rapier, epee, or another fencing weapon.",
    description: "You rely on fast, agile swordplay to overwhelm lightly armored opponents with speed and precision.",
    abilities: [["Disarming", 4], ["Dual-Draw", 2], ["Feint", 6], ["Sharp Words", 4], ["Greater Adrenal Defense", 4], ["Lightning Reflexes", "4*"], ["Off-Hand Dagger", 2], ["Off-Hand Light Weapon", 2], ["Improved Parry", 4]]
  },
  "Knife Master": {
    skill: "Combat Styles",
    prerequisites: "Using a dagger, including when paired with another weapon.",
    description: "You master the dagger in melee, concealment, off-hand use, and throwing.",
    abilities: [["Concealed Strike", 3], ["Defensive Ward", 6], ["Improved Concealed Strike", 4], ["Improved Quickdraw", 4], ["Lightning Reflexes", "4*"], ["Off-Hand Dagger", 2], ["Precise Target", 2], ["Throw and Melee", 2]]
  },
  "Sword Master": {
    skill: "Combat Styles",
    prerequisites: "Using a one-handed blade without a shield or secondary weapon.",
    description: "You rely on extensive practice with a single blade, using speed, movement, and precise attacks for both offense and defense.",
    abilities: [["Lightning Reflexes", "4*"], ["Greater Adrenal Defense", 4], ["Greater Adrenal Speed", 6], ["Focused Strike", 6], ["Improved Parry", 4], ["Feint", 6], ["Two-Handed Grip", 6]]
  },
  "Bo-Jutsu": {
    skill: "Discipline Styles",
    prerequisites: "Using a quarterstaff.",
    description: "You exploit the quarterstaff's adaptability for parrying, striking, sweeping, and holding foes at bay.",
    abilities: [["Improved Parry", 4], ["Keep At Bay", 5], ["Leg Sweep", 4], ["Lightning Reflexes", "4*"], ["Pommel Strike", 6]]
  },
  "Golden Claw": {
    skill: "Discipline Styles",
    prerequisites: "Unarmed, dagger, or light weapons.",
    description: "You close rapidly with a foe to deliver quick strikes while interfering with the foe's weapons.",
    abilities: [["Focused Strike", 6], ["Get Inside", 4], ["Greater Adrenal Speed", 6], ["Leg Sweep", 4], ["Lightning Reflexes", "4*"], ["Off-Hand Dagger", 2], ["Unarmed Parry", 2], ["Weapon Form: Dagger", 2]]
  },
  "Iron Robe": {
    skill: "Discipline Styles",
    prerequisites: "Using unarmed strikes or sweeps.",
    description: "You withstand and overcome pain without allowing it to disrupt your attacks, becoming an implacable opponent.",
    abilities: [["Greater Adrenal Defense", 4], ["Greater Adrenal Strength", 6], ["Improved Parry", 4], ["Killing Strike", 6], ["Pain Resistance", 6], ["Seen It", 4], ["Unarmed Parry", 2]]
  },
  "Kraken Wrestling": {
    skill: "Discipline Styles",
    prerequisites: "Unarmed wrestling, or improvised weapons or a net when using abilities that require them.",
    description: "A no-holds-barred wrestling style useful to pirates, press gangs, bounty hunters, and tavern brawlers.",
    abilities: [["Dirty Fighting", 4], ["Fight Free", 4], ["Gentle Tap", 4], ["Grab and Slam", 6], ["Improvised Weapons", 4], ["Leg Sweep", 4], ["Seen It", 4], ["Unarmed Parry", 2], ["Weapon Form: Net", 3]]
  },
  "Mountain Grappler": {
    skill: "Discipline Styles",
    prerequisites: "Unarmed Wrestling.",
    description: "A brutal grappling and pinning style based on force and stability, well suited to confined spaces.",
    abilities: [["Fight Free", 4], ["Focused Strike", 6], ["Grab and Slam", 6], ["Greater Adrenal Strength", 6], ["Leg Sweep", 4], ["Mountain Stance", 3], ["Pain Resistance", 6], ["Unarmed Parry", 2]]
  },
  "Shadow Strike": {
    skill: "Discipline Styles",
    prerequisites: "Unarmed Strikes.",
    description: "You attack quickly from concealment and disappear before opponents can respond effectively.",
    abilities: [["Concealed Strike", 3], ["Greater Adrenal Defense", 4], ["Greater Adrenal Speed", 6], ["Weapon Form: Dagger", 2], ["Improved Concealed Strike", 4], ["Swift-Footed", "2*"], ["Feint", 6], ["Shadowblade", 6], ["Unarmed Parry", 2]]
  },
  "West Wind": {
    skill: "Discipline Styles",
    prerequisites: "Unarmed Sweeps.",
    description: "A soft martial style emphasizing speed, evasion, throws, and redirection of an opponent's momentum.",
    abilities: [["Greater Adrenal Defense", 4], ["Greater Adrenal Speed", 6], ["Improved Parry", 4], ["Leg Sweep", 4], ["Lightning Reflexes", "4*"], ["Redirect", 3], ["Unarmed Parry", 2]]
  },
  "Wyvern Style": {
    skill: "Discipline Styles",
    prerequisites: "Unarmed Strikes.",
    description: "You use smooth evasion and quick, relentless attacks rather than relying heavily on blocks.",
    abilities: [["Concealed Strike", 3], ["Feint", 6], ["Greater Adrenal Defense", 4], ["Greater Adrenal Speed", 6], ["Improved Parry", 4], ["Lightning Reflexes", "4*"], ["Unarmed Parry", 2], ["Weapon Form: Dagger or Short Sword", 3]]
  }
};

export function fightingStyleHtml(name) {
  const style = FIGHTING_STYLES[name];
  if (!style) return "";

  const abilities = style.abilities
    .map(([ability, cost]) => `<li>${ability} (${cost})</li>`)
    .join("");

  return [
    `<h2>${name}</h2>`,
    `<p><strong>Prerequisites:</strong> ${style.prerequisites}</p>`,
    `<p>${style.description}</p>`,
    `<h3>Abilities</h3>`,
    `<ul class="rmu-qol-style-abilities">${abilities}</ul>`,
    `<hr><p><em>Source: RMU Character Companion, Fighting Styles, pages 85-89.</em></p>`
  ].join("");
}
