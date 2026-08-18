# RMU QoL

Foundry VTT v14 module for Rolemaster Unified quality-of-life tools.

## Features

- Character Companion QoL compendium with categorized Talents and Flaws for personal campaign use.
- Character Companion fighting-style skills, organized like Core Law under Skills and exposed on RMU character sheets with fixed specialization choices.
- Mental and Special Talent/Flaw item categories.
- Scene-based herb application.
- Adds a Use Herb leaf button to Foundry's Token Controls palette.
- Source actor and recipient actor are selected separately.
- Uses RMU herb item data from `system.effects` when available.
- Uses the built-in herb library for delay timing.
- Supports immediate heal herbs, delayed heal herbs, Draaf-style multi-round healing, and stun relief herbs.
- Uses `ApplicationV2` and `renderChatMessageHTML`.
- Uses a visible RMU-style Active Effect for pending timers, while chat-card flags are the source of truth for delayed application.
- Players can use their own herbs on party members while an active GM client performs target-side Active Effect and actor updates. Timer and immediate Apply requests are committed to the chat card first; the GM client mirrors delayed timer state into visible Active Effects and applies requested immediate effects from chat updates.

## Install

In Foundry VTT, open **Add-on Modules**, choose **Install Module**, and paste this manifest URL:

```text
https://github.com/deerbuster/rmu-qol-private/releases/latest/download/module.json
```

Enable **RMU QoL** in your world after installation.

## Optional Macro

The Token Controls button is the intended entry point. A Script macro can also open the same interface:

```js
game.rmuQol.openHerbUse();
```

## Manual Install

Download `rmu-qol.zip` from the latest GitHub release and extract it into:

```text
FoundryVTT/Data/modules/rmu-qol
```

Restart Foundry, then enable **RMU QoL** in your world.

## Releasing

1. Update `version` and `download` in `module.json`.
2. Commit the changes.
3. Tag the release with the same version prefixed by `v`.

```bash
git tag v0.1.9
git push origin main --tags
```

The GitHub Actions workflow publishes:

- `module.json`
- `rmu-qol.zip`

Foundry uses `module.json` from the latest release as the install manifest.
