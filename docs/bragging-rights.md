# Bragging Rights

> **Status: draft scope, awaiting sign-off.** Nothing is built yet. Don't start the build until this doc is marked signed off.

A turn-based roguelike for phones. Three runs a day through the same secret dungeons as your brothers, and the best haul wins the day.

## Core idea

You descend through a library. Each floor is a book you fall into: its creatures, hazards and one signature rule come from that book. Nothing carries between runs, so the only thing that improves is the player.

## Pillars

Every design decision is checked against these.

1. **Skill only.** No permanent unlocks, no practice mode, no dice in combat. Every death traces back to a decision.
2. **Every play matters.** Three plays a day, all three count, and you can't preview a dungeon.
3. **Fair comparison.** Everyone plays the same dungeons, and nobody sees anyone's result until the reveal.
4. **Commute-sized.** A run takes 5 to 10 minutes, is one-handed, and can be paused and resumed at any turn.

## How a run works

- **8 floors**, each fitting on one phone screen (roughly 7×9 squares, 4 to 8 enemies).
- **Turn-based.** You act, then every creature acts. Nothing happens while you think.
- **Controls:** tap a neighbouring square to move or attack, in 8 directions. Press and hold an enemy to inspect it. Every creature follows the same movement rules as the player.
- **Telegraphs:** every enemy shows the exact squares it will hit next turn.
- **No dice:** attacks always land and damage is fixed. Randomness only shapes how a dungeon is generated.
- **Hearts:** a few, around 3 to 5. You regain one per floor cleared. Healing items are rare or absent.
- **Lamp:** oil burns down every turn and works as the clock for the whole run. It doesn't affect how far you can see. When the oil runs out the run ends.
- **Pages:** 2 item slots. Pages are mostly positional tools (move an enemy, block a line, swap places) and crumble at the end of the floor.
- **Bank or push:** at each staircase you choose to bank your relics and leave, or go deeper. Running out of hearts or oil loses most of what you were carrying (exact share to tune).
- **Score:** the value of the relics you bank. The tie-break is fewer turns.

## The day

- Three dungeons a day, A, B and C, the same for everyone. Your 1st play is A, your 2nd is B and your 3rd is C.
- **Daily score is the total of all 3 runs.** An unplayed run scores 0.
- **Sealed results:** nobody sees anyone's daily score until all three brothers have played or it's midnight UK time, whichever comes first.
- **House rule:** no talking about today's dungeons before the reveal. Replays unlock at the reveal.
- **League:** points for 1st, 2nd and 3rd each day, totalled per season. Personal bests are shown as records, not as the ranking.

## Floor kits

A floor is a **kit**, not a fixed layout: palette, tile style, 3 to 5 enemy types picked from a behaviour menu, a hazard, page-items, flavour text and one signature rule. The generator builds a fresh layout from the kit for each seed. Difficulty rises with depth whichever book is in play.

- Each enemy must pose a **different positional problem** (charger, ranged, blocker and so on), not just the same enemy with more health.
- Floors are **inspired by** books: themes, creatures and mood. No character names, place names or quoted text.
- The first three books set the engine's first floor rules. Later books mostly reuse them.

| Book | Signature rule | Status |
|---|---|---|
| The long road (*Lord of the Rings*) | A ring of power: invisibility, but each use draws hunters and adds lasting risk | **v0** |
| The wizarding school (*Harry Potter*) | The castle rearranges itself every few turns | Later |
| Worlds of soul-companions (*His Dark Materials*) | A shapeshifting companion follows you, and you take damage if it strays too far | Later |

Rob drafts the first pass of each kit, Claude builds the systems, and anyone can tweak a kit afterwards.

## Look and feel

- **v0:** 2D, clean geometric shapes, with effort on lighting (a flickering lamp that dims as oil runs low) and juice (sliding moves, hit flashes, screen shake, particles).
- **Later:** a 3D low-poly diorama in Three.js. Game logic stays strictly separate from rendering, so this means writing a new renderer, not rebuilding the game.
- **Sound:** about 6 synthesised effects using the browser's own audio. The game must be fully playable muted.
- **Installable:** a PWA with a home screen icon, full screen and offline play.

## Phases

| Phase | Scope |
|---|---|
| **v0** | The full run loop with one floor kit (the long road) used for all 8 floors. Runs on a phone, installable as a PWA, with resume. Seeds are derived from the date and the play counter is on the honour system, stored on the phone. Local scores only. |
| **v1** | Small backend (proposed: Cloudflare Worker + D1). The server hands out secret seeds when you start a run, so starting counts as a play. The phone submits its input log and the server replays it to verify the score. One secret code per brother. Sealed results, daily board and league. |
| **v2** | Watching replays after the reveal, copy-to-chat result, the other two floor kits, then 3D. |

## Technical constraints

- Simulation logic is pure, integer-based and deterministic, so the server can replay a run exactly.
- Seeds must be secret from v1 onward. Date-derived seeds can be generated in advance.
- Save after every turn so a run survives the phone locking or the app closing.
- A backend is a new deployment surface and needs discussion in the PR before it lands (see CLAUDE.md).

## Open and parked

- **Backend owner:** Rob is asking in the group once the concept is agreed.
- **Missed days (parked):** v0 scores an unplayed day as 0. Later, consider counting only each brother's best N days per season.
- **Tuning (decide in playtests):** number of hearts, oil per turn, share of relics lost on death, league points per place, and whether 8-way movement stays readable or falls back to 4-way.
- **Long road kit:** Rob's first pass of enemies, hazard and pages.
