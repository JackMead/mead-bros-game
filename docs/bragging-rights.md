# Bragging Rights

> **Status: scope signed off by Rob on 2026-10-31. v0 built** (`games/bragging-rights/`) with a placeholder long road kit. Changes to scope need sign-off again before building.

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
- **Long road kit:** Rob's first pass of enemies, hazard and pages. v0 runs on placeholders (below).

## v0 as built

### Files

All in `games/bragging-rights/`. Logic files never touch the DOM or canvas and are tested in Node.

| File | What it does |
|---|---|
| `config.ts` | Every tunable number |
| `sim.ts` | The rules: `newRun`, `step(state, action)`, `replay(seed, actions)` |
| `generate.ts` | Builds a floor from seed + depth + kit. Never depends on how the player is doing |
| `kit.ts`, `kits/` | Floor kit format and the kits themselves |
| `daily.ts` | UK-date seeds, play counter, save/resume, records |
| `bot.ts`, `tools/bot-stats.ts` | A crude bot for tests and rough balance numbers (`npm run bragging:bot -- 500`) |
| `render.ts`, `fx.ts`, `audio.ts`, `main.ts` | Drawing, animation, sound and screens |

The manifest, service worker and icons live in `public/games/bragging-rights/` so Vite serves them unchanged next to the page.

### Rules settled during the build

The scope left these open. They are starting points for playtesting, not final:

- **Starting values:** 4 hearts, 150 oil burning 1 per turn, keep 25% of carried relics on death or lamp-out, ring hides you for 3 enemy turns, at most 3 wraiths per floor.
- **The ring is on floor 1 of every run**, so everyone faces the same temptation.
- **You always act first.** Hitting a 1-heart enemy kills it before its telegraphed attack lands, which rewards aggression.
- **Telegraphed attacks hit whatever is on the squares**, enemies included, so you can bait enemies into each other.
- **Swap leaves telegraphs where they were aimed**; shove dazes the enemy and cancels its attack.
- **Chargers won't charge across a chasm**, but if you dodge they run on and can fall into one beyond you.
- **Reaching the stairs ends your turn before enemies act.**
- **Lamp light is cosmetic.** The board is never darkened enough to hide anything.
- **Pages** in v0: shove, swap, ward (raise a wall), blink (short teleport).
- **No healing items** in v0. Hearts only come back at the stairs.

### Placeholder kit

Until the first pass arrives, the long road uses stand-ins: goblin (melee), goblin archer (archer, from floor 2), dire wolf (charger, from floor 3), cave troll (brute, from floor 4) and wraith (the ring's hunter). Swap them by editing `kits/longRoad.ts`; no engine changes are needed unless a new behaviour is wanted.

### Known limits

- The bot is crude (it can't handle trolls or use pages), so its numbers only show whether something is wildly off. Real tuning needs human playtests.
- Scores and the play limit are local and on the honour system until v1.

## Playtest loop (until v1)

Signed off by Rob on 2026-11-01. Rob is the only tester until the game is ready to share.

**Principle:** always look for the best option, not the traditional one. An AI collaborator should use what it does differently (simulating thousands of runs, replaying every move, searching for optimal play) rather than copying how human-only teams design.

1. **Batch:** Claude proposes 2 or 3 changes, Rob signs off, Claude builds them. Bump `config.build` whenever rules or numbers change.
2. **Publish:** `npm run bragging:single`, then publish `dist/bragging-rights-playtest.html` to the playtest artifact (same link every time, with the `db` capability on).
3. **Play window:** 3 to 4 days of daily runs plus unlimited playtest runs. No changes mid-window.
4. **Analyse:** every finished run is stored automatically in the artifact's `runs` collection (one document per run, holding its run code). Claude saves them with ArtifactData `list` and runs `npm run bragging:report -- <folder>` (set `BUILD=v0.2` to look at one build).
5. **Decide:** the next batch targets the biggest gap. Repeat.

### Targets

The game is ready for v1 when these hold for two windows in a row:

| Target | Goal | Source |
|---|---|---|
| Deaths feel fair | ≥ 80% "my fault" | Post-run question |
| Run length | Median 5 to 10 minutes of active play | Run code |
| Bank decision is real | Banks spread across 3+ floors | Replay |
| Ring is tempting | Used in 20% to 80% of runs | Replay |
| Pages get used | ≥ 70% used before they crumble | Replay |
| Skill shows | Scores rise across a window | Replay |
| Readability | No "couldn't tell what was happening" | Comments |
| Comes back | Played 5+ days out of 7 unprompted | Daily runs |

### Pieces

- **Playtest mode:** on in the single-file build, or with `#playtest` on the URL. Unlimited runs on random seeds, kept apart from daily plays and records. Must be off before scores count (v1).
- **Run codes** (`runcode.ts`): `BR1.` plus the run as base64 JSON, about 250 characters. Holds the seed, every action, the post-run answers, active play time and the build.
- **Post-run questions:** "Was that your mistake?" (only after a death or lamp-out) and "How did that run feel?".
- **Analysis** (`analyse.ts`, `tools/report.ts`): replays each code and reports stairs decisions, damage by enemy, ring and page use, and the targets above.

## Machine playtesting

Signed off by Rob on 2026-11-01 (batch 2). Every batch is played by machine before a human plays it, so human plays test feel rather than arithmetic.

- **Solver** (`solver.ts`): beam search over a floor. No dice means a floor is a fully known puzzle, so it can look many turns ahead. Used for par (the best haul found on a dungeon, by banking at the richest staircase any style reached). "Best found", not provably perfect.
- **Human-like players:** `planAction` thinks only 1 to 3 turns ahead and re-plans every move, with a style (`careful`, `balanced`, `greedy`) that weights relics, hearts, oil and risk differently. They also dislike going round in circles. One turn ahead is roughly a careful new player reading the telegraphs.
- **Tool:** `npm run bragging:machine -- --runs 40 --horizon 1,2,3 [--par] [--set player.oil=110]`. `--set` tries a number without changing the code.

### First findings (build v0.2, 2026-11-01)

1. **Skilled players never get hit.** Players looking 2+ turns ahead escaped 85% to 95% of runs with zero deaths. The only thing that ever ended their runs was the lamp. With 3 hearts instead of 4, the results were identical.
2. **Melee enemies can be kited forever.** A goblin telegraphs the square you're on, so stepping away every turn means it can never land a hit. Melee enemies only cost oil.
3. **Oil is generous.** Mean oil left at the floor 7 stairs was 77 of 150, so the lamp rarely pressures a competent player and banking almost never happens.
4. **110 oil makes banking real.** At 110, two-turn players banked 30% of runs, spread across floors 6 and 7 (floors 4 to 7 for one-turn players), and oil at the floor 7 stairs dropped to 37.
5. **Cave trolls** end most deaths among one-turn players.
6. **Par** averaged 125: a full search clears all 8 floors with nearly every relic.

Bot limits: they value holding pages, so page use (about 45%) understates how humans will use them. Treat page and ring numbers from bots with caution.

### Decisions and experiments (2026-11-01)

- **Oil 150 → 110** (Rob). In the code as build v0.3; goes to the playtest page at the end of the current window.
- **Skilled players should get hit; the skill is in trade-offs as much as move planning** (Rob). The rule that achieves it is chosen by machine playtest. Candidates are switches in `config.experiments`, off by default.

Melee rule experiment: 30 dungeons, 110 oil, balanced and greedy players thinking 1 to 3 turns ahead. "Hits" is the mean damage taken per run.

| Rule | 3-turn players: hits, deaths | 1-turn players: deaths | Greed punished? | Ring use | Verdict |
|---|---|---|---|---|---|
| Strike your square (current) | 0.7 to 2.1, 0% | 20 to 27% | Barely | 17 to 33% | Kiting makes skilled play damage-free |
| Lunge through your square | 1.0 to 2.1, 0% | 30 to 37% | Barely | 23 to 37% | Sidestepping beats it |
| Reach (every square around) | 0.9 to 2.5, 0% | 23 to 43% | No | 13 to 40% | Easier for skilled players |
| **Disengage** (leaving the reach of an enemy about to strike gives it a free hit) | 3.1 to 5.3, 3 to 17% | 37 to 67% | Yes (81 vs 69) | 30 to 47% | **Meets the goal** |
| Lunge + disengage | 3.2 to 5.3, 3 to 20% | 47 to 70% | Yes | 30 to 47% | No better than disengage alone |
| Disengage + 5 hearts | 3.5 to 6.4, 3 to 27% | 30 to 53% | Yes (81 vs 68) | 30 to 47% | Softer for beginners, still bites |

## v0.3 (signed off 2026-11-01)

Ships to the playtest page when the v0.2 play window ends, as one batch.

- **Disengage:** a goblin or wraith next to you that is winding up gets a free hit if you step out of its reach. Kill it first (you act first), sidestep within its reach, or pay the heart. Its reach is outlined on the board, and the hint line explains it.
- **5 hearts** (was 4) and **110 oil** (was 150).
- **Par:** after each run the solver searches that dungeon in a background worker (1 to 2 seconds on a laptop) and shows your haul as a share of the best line found. Cached per dungeon and build, and shown on the home screen.
- **Post-mortem:** after each run, up to three moments where a different move would have taken no damage without walking into a certain hit next turn. The hit that ended the run is marked. `postmortem.ts`.

Machine playtest of v0.3 (30 dungeons, par mean 118.6):

| Player | Escaped | Banked | Died | Lamp out | Share of par | Hits per run |
|---|---|---|---|---|---|---|
| Careful, 1 turn ahead | 7% | 80% | 7% | 7% | 23% | 3.6 |
| Careful, 3 turns | 30% | 67% | 0% | 3% | 70% | 1.2 |
| Balanced, 1 turn | 7% | 50% | 30% | 13% | 22% | 5.5 |
| Balanced, 3 turns | 53% | 37% | 3% | 7% | 74% | 3.5 |
| Greedy, 1 turn | 3% | 0% | 53% | 43% | 10% | 7.0 |
| Greedy, 3 turns | 57% | 3% | 27% | 13% | 61% | 6.4 |

Balanced play now beats both careful and greedy play, banking happens on floors 1 to 7, and skill shows clearly in share of par.

## First v0.3 human runs (2026-11-01)

Rob's three dailies: banked ◆13 on floor 2 (11% of par), died on floor 4 (6%), died on floor 5 (8%).

- **Fast play is natural on a phone:** about 1 second per move, about 1 minute per run. The design assumed deliberate play. Rob: "flowed that way"; par share "about right for going fast".
- **Threats didn't register:** 5 of 18 hits came from walking away from a winding-up goblin, and 3 of the costliest moments were attacking one enemy while standing in an archer's line. Rob didn't notice the dashed outline or the archer's line: "graphics need improving to feel like you want to work it out".
- **Pages and the ring went unused:** 8 pages picked up, 0 used, 5 crumbled. Rob: "didn't feel powered". Machine check agrees: with no pages at all, two-turn players score 72.7 against 76.5 with them, and par is unchanged (116.3 against 115.3). Shove and Ward are the weakest.
- Fixed a solver flaw: it valued holding pages at the stairs, where they crumble.
