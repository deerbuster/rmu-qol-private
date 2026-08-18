# Changelog

## 0.2.5

- Added the Character Companion Battle Styles, Combat Styles, and Discipline Styles skills.
- Added fixed specialization choices for all published Character Companion fighting styles.
- Integrated the module skills with RMU's undeveloped-skill list and normal character-sheet workflow.
- Added RMU-compatible display labels for the three new skills.
- Collapsed fighting styles to one undeveloped row per style skill and moved the fixed choices into RMU's Add Skill dialog.
- Corrected undeveloped fighting-style source UUIDs to resolve from the module compendium instead of `rmu.core`.
- Added prerequisites, descriptions, ability lists, and source references to the fighting-style picker and newly created style skills.
- Added reference-only fighting-style ability compendium records and rank-allocation management on developed style skills.
- Replaced generic ability placeholders with individual Type, Requirements, Rank Cost, and rules descriptions from Character Companion.

## 0.2.4

- Added the personal Character Companion QoL Talent/Flaw compendium.
- Added Mental and Special Talent/Flaw categories to RMU item sheets.

## 0.2.3

- Explicitly excluded Latha from the supported herb picker.
- Rejected RMU herb items whose raw effects include any unsupported effect.

## 0.2.2

- Hid RMU herb inventory items whose effects are outside the supported herb scope.
- Added selected-herb effect details to the Use Herb window before the Use button.

## 0.2.1

- Fixed delayed herb timers racing against Foundry's automatic ActiveEffect expiration.
- Refreshed pending herb ActiveEffects through stale-id-safe update handling.

## 0.2.0

- Added bleeding-control herbs: Anserke, Fek, Harfy, and Hugburtun.
- Added action-point herbs: Elben's Basket and Zulsendura, including the Zulzendura alias.
- Kept the active herb library scoped to healing, stun relief, bleeding control, and action-point herbs.
- Removed dormant non-scope herb handlers for generic modifiers, Life Drain, initiative, armoring, fatigue, grapple, prone, off-balance, and staggered effects.
- Checked the module scripts for known Foundry v14/v16 deprecation patterns.

## 0.1.9

- Added RMU herb use interface for scene actors.
- Added Token Controls Use Herb button.
- Added immediate and delayed herb application cards.
- Added GM-assisted actor updates for player-used herbs.
- Added delayed timer ActiveEffects with chat-card source of truth.
- Added support for Draaf-style multi-round healing.
- Added stun relief herb support.
