# Chapter 1, A Young Man in Whitby: AI playtest reports (SPOILERS)

Puzzles, as tracked by the scorecard:

- Puzzle 1: the bat card for Bram Stoker, for the half-crown.
- Puzzle 2: the half-crown for the suit at the pawnbroker's.
- Puzzle 3: getting past Hobbs. Round 1: the suit. Rounds 2 and 3: suit, then name-drop Algernon's surname, which he gave himself. From round 4: he only says "Algy"; the surname comes from the jeweller's story in the old town.
- Puzzle 4: a cork float off the herring nets, once the fisherman's fed with the kipper.
- Puzzle 5: the match. Round 1: tell Algernon who you've beaten. From round 2: stake the golden dragon card.

## Round 1, 2026-10-30 (void)

Four testers started. While they were playing, a fix to the intro introduced a quoting bug, the chapter stopped compiling, and the play tool printed the chapter source (solutions included) into three testers' terminals. They stopped; their notes before the crash are below. The Veteran carried on and finished, but had seen the doorman and Stoker menus.

Fixed afterwards: the quoting bug; `tools/play.ts` now loads chapters inside a try/catch and prints only the file, line and message; the parser now reads a place name containing "to" as one thing.

**The Veteran** (finished, 70 commands, partly contaminated). Difficulty 1.5/5: "too easy for Medium". Every chain was a one-step fetch with the clue next to the lock: card to coin to suit to doorman; kipper to fisherman to float; float to Algernon. The "who've you beaten?" menu had only one option that answered the question. Suggestions: make Stoker's need vaguer so the Abbey and sailor clues matter; don't call the float ping-pong-ball-sized; make the doorman need more than the suit. Liked: "young man" and the age comebacks, "It were his suit", "Carbon, young man", "I always let them have the second one", "Who ships earth?". The black dog's menace sets up a puzzle that never comes.

**The Newcomer, Button-Masher, Overthinker** (stopped at 31 to 37 commands). All had clear next steps and called the clues fair (about 2/5). All hit the "to" parser bug. The Masher found the table tennis bat on Stoker a dead end ("paddle for butter"). The Overthinker suspected the black dog and the chip shop.

**Changed after round 1:** Stoker now asks for a creature that can reach a high window (wings come from the Abbey and the sailor); the float's description no longer mentions ping-pong balls; the doorman needs a guest's name, which you get by meeting Algernon; Algernon now wants a rare wager instead of a brag, and the dragon card ("nobody gets the dragon") is the stake; the bat on Stoker now points back at the creature; the black dog howls in the ending.

## Round 2, 2026-10-30

### Veteran

- Veteran (round 2): finished, 67 commands. Difficulty 2.
- P1 Stoker: ~3 cmds after talking (17 from start). Tried dragon first (Phil refuses), then bat. Explained: yes. Gentle opener, Dracula in-joke works.
- P2 Suit: ~6 after arriving. Pawnbroker says "Half a crown" outright, which throws away the 2/6 puzzle. Suggest: player works out 2/6 themselves.
- P4 Kipper/float: kipper free; fisherman's rumbling stomach + "not eaten since four". Nets soft-gated until Algernon. Explained: yes; pure fetch.
- P3 Doorman: "mate" refusal (inform, don't ask), "expected" -> "which guest?", met Algernon -> name option. Best puzzle; each refusal nudges. ~6 cmds.
- P5 Wager: salamander refused (printed by thousand), dragon worked. "Nobody gets the dragon" at Stoker plants it well.
- Suggestions: work out 2/6; make kipper cost something; cork less automatic.
- Annoyed: jeweller blurts well lore as non-sequitur; dog menace sets up a puzzle that never comes ("Grrrrr" dead end).
- Funny: young man/ages, "rather stay in 1890", Harrogate, kipper looking, Data/meetings, shoes/American, dead brother-in-law's suit, 199 steps, Rob/Dad/Jack brag.

### Newcomer

- Newcomer (round 2): finished, 54/80 commands. Difficulty 2.
- P1 Stoker: ~14 cmds (7 exploring). Clues: window three storeys, Abbey bats, card list. Explained: partly; showing an item to a non-brother only tried because of help text; help says "give <item> to <brother>" which suggests brothers only.
- P2 Suit: ~7. Price card + pawnbroker explains half a crown. Explained: yes. Gap: nothing said why a suit was needed before buying it.
- P4 Cork: ~20 cmds across map. Kipper free, fisherman hungry, nets corks, Algernon lost cork; talk to fisherman again gives float. Explained: yes.
- P3 Doorman: ~4. "Expected" -> "which guest?" -> learn Fanshawe -> new option. Best signposted. Thought gate wasn't needed (score shows it was solved at cmd 45, before the ball and match: a misreading, not a bug).
- P5 Wager: ~6. Dragon (shiny = rare). Unsure to use the table afterwards.
- Confusing: help text wording; "use" covers walking/talking; no reason for suit in advance.
- Funny: young man/ages, Harrogate, kipper looking, one ball, some sort of boy, never catch on, American, brag, second point, dead brother-in-law's suit.

### Button-Masher

- Button-Masher (round 2): finished, 47/60 commands. Difficulty 1.5.
- P1 Stoker card: solved cmd 10. Tried cards before talking ("not now"), bat paddle ("paddle for butter", fair near-miss), salamander, then purple bat. Explained: yes (creature of night + bat). Brute-forceable menu (4 options, no penalty).
- P2 Suit: cmd 19. Coin refusal nudged; pawnbroker spells 2/6 = half a crown. Explained: yes.
- P3 Doorman: cmd 35. After meeting Algernon option 3 became "Mr Fanshawe is expecting me", worked first try. Explained: partly (posh name-drop). 3 options, brute-forceable. Didn't notice options change by who you've met.
- P4 Ball: cmd 39. Kipper free from fishwife; fed fisherman; talking again Phil asked for float himself without looking at nets. Explained: partly. Complaint: chain automatic, no aha.
- P5 Wager: cmd 47. Salamander first then golden dragon. Explained: yes. 3 options, no penalty.
- Funny: young man/ages, paddle for butter, Harrogate, "It were his suit", kipper looking, one ball, whiff-whaff never catch on, brag monologue, second point.
- Annoyed: menus brute-forceable; kipper/float chain thoughtless; black dog hook never pays off in play; "There's no X here" terse.

### Overthinker

- Overthinker (round 2): finished, 67/80. Difficulty 1.5. ~40 cmds exploring first.
- P4 float: 2 cmds once holding kipper (give kipper, use nets). Doubt: ketchup-eyed dog might want kipper.
- P1 Stoker: 4 cmds incl. bat paddle (deliberate pun test) and dragon (refused), then bat card. Explained: yes.
- P2 Suit: 1 cmd. Stoker's "half a crown" + pawnbroker. Explained: yes.
- P3 Doorman: 2 cmds, Fanshawe option first try. Explained: yes.
- P5 Wager: crab, salamander, then dragon; bat on table. Partly: "Nobody gets the dragon" read as a firm rule; liked the subversion but some may think it's off-limits.
- Wrong-way: dog + kipper suggests a dog puzzle; dragon refusal; Abbey bats (harmless).
- Funny: young man/ages, nobody gets the dragon, two? I got two?, American trainers, never catch on, meetings, steps for Jack, Harrogate, chip shop.

**Overall:** all four finished, nobody stuck, nothing brute-forced only. Rated 1.5 to 2 against a Medium brief. Best puzzle: the doorman (each refusal narrows it down). Weakest: the kipper (free, right next to a man saying he's hungry) and the float (handed over automatically).

**Changed after round 2:**
- Phil now turns the fishwife's kipper down (he's a picky eater). He only goes back for one once he's met the hungry fisherman. His pickiness makes the obstacle, not just the joke.
- Talking to the fed fisherman no longer hands over a float. The player has to go to the nets, once they know a ball is needed.
- The pawnbroker no longer says "half a crown". Shopkeepers who can't change the coin say it's "two and six", so the price card's 2/6 needs two scenes.
- The jeweller's story about the hat now comes from Phil asking about it, not out of nowhere.
- The black dog "looks like it has already eaten", so a kipper isn't expected there.
- The help text now says items can be given to anyone, not only brothers.

## Round 3, 2026-10-30 (Veteran, Newcomer, Button-Masher)

### Veteran

- Veteran (round 3): finished, 68 commands, no hints. Difficulty 1.5 ("fair, well clued, too gentle for Medium"). Sent a few commands batched in parallel (ran in order).
- P1 Stoker: 1 cmd after talking (score 46 after exploring everything). Explained: yes. Phil's bat is a good red herring.
- P2 Suit: 1 cmd. 2/6 step adds flavour not challenge (coin is literally named Half-crown coin).
- P4 Kipper: 2 cmds. Refusal plants the item well; but talking to fishwife again does the thinking.
- P4 Float: 1 cmd after kipper; corks announced twice.
- P3 Doorman: 2-4 cmds; Fanshawe option. Mostly explained; 1-in-3 menu.
- P5 Wager: ~5 cmds incl. deliberate wrong picks; dragon "pride and joy", "shiny". Explained: yes.
- Annoyed: flavour hotspots cost commands; "Ooh. Bandstand" plays every arrival but no bandstand listed.
- Suggestions: make the player do the thinking at the fishwife; make the wager less signposted; no puzzle combines ideas.
- Funny: young man/ages/"less of the young man", Lady Cholmondeley, Harrogate, crab for a farthing, one ball, meetings, dead brother-in-law's suit, American, match history, second one, dog already eaten, What dog?

### Newcomer

- Newcomer (round 3): finished, 65/80. Difficulty 2.
- P1 Stoker: 2 cmds once back (36 incl. exploring). Explained: yes ("pay good money" nudged selling).
- P2 Suit: ~3 cmds. Partly: didn't know half a crown = 2s 6d; felt lucky. Suggest saying it explicitly.
- P3 Doorman: 2 cmds, Fanshawe (Algernon introduced himself). Explained: yes. Confused: room description unchanged after being let in.
- P4 Kipper/float: ~11 incl walking. Best chain. Risk: cork clue only via "look at nets".
- P5 Wager: 3 cmds. Dragon. Mostly yes.
- Other: "play as Rob" reply terse; dog feels like a puzzle; "hands off my nets" doesn't hint persuasion (worked via hunger clue).
- Funny: young man/fishwife, two-slash-six, one ball, some sort of boy, bridge keeper data, kipper looking, brother-in-law's suit, American, second one.

### Button-Masher

- Button-Masher (round 3): finished, 51/60. Difficulty 2.
- P1 Stoker: ~8 cmds. Cards before talking -> "Not now" (soft dead end, nothing says come back). Bat paddle joke. Salamander then purple bat. Explained: yes. Menu brute-forceable.
- P2 Suit: ~2 cmds; coin on first shop. Explained: partly. Never told why a suit matters; doorman only comments on trainers.
- P4 Kipper/float: ~7. Nets "hands off", fisherman hungry, remembered fishwife's "bite my hand off"; second visit she handed over kipper; fed; nets -> float. Explained: yes. "Most satisfying chain; clues in two rooms."
- P3 Doorman: ~4. "Expected" -> "which guest?"; after Algernon, Fanshawe option worked. Partly: same-numbered option. Brute-forceable.
- P5 Wager: ~4. Salamander, then dragon. Partly. Brute-forceable.
- Annoyed: "go steps" not understood; suit not visible in inventory; suit link never said; menus re-openable with no cost.
- Funny: young man incl. fishwife "less of the young man", meetings, American shoes, second one, one ball, kipper looking, eleven-two.

**Overall:** all three finished, nobody stuck. The kipper chain is now the favourite ("clues in two rooms"). Still rated 1.5 to 2: every puzzle is one step once its clue is found, and the three menus can be retried for free.

**Changed after round 3:**
- Algernon only gives his nickname. Hobbs wants a surname, and it comes from the jeweller in the old town: a cross-scene "aha" (the young gent in a striped blazer from the big hotel).
- Stoker spells out that half a crown is two shillings and sixpence.
- Hobbs remarks on the suit when he lets Phil in, and Phil visibly walks onto the terrace.
- Removed the bandstand line, which played on every arrival with no bandstand to see.
- The text version accepts "go", "walk", "enter" and "climb".

## Round 4, 2026-10-30 (Veteran, Overthinker)

### Veteran

- Veteran (round 4): finished, 73/80 (~45 exploring first; whole chain ~21 once acting). Difficulty 2.
- Stoker: ~3 cmds, dragon tried first (refused, plants it). Explained: yes, instantly. Easiest puzzle; fine as opener.
- Suit: 1 cmd. 2/6 joke works as a clue. Explained: yes.
- Kipper: 1 cmd (second fishwife talk). Explained: yes. Little sense of decision.
- Float: 2 cmds. Good classic chain. Explained: yes.
- Doorman: 4 cmds incl. a deliberate wrong pick. Name from jeweller's gossip (blazer, big hotel, never stopped talking). "Best puzzle in the chapter." Note: menu can be tried in full.
- Wager: 3 cmds; salamander refusal useful; dragon payoff satisfying.
- Suggestions for Medium: a red-herring item; competing plans; cork less spelled out.
- Annoyed: three rooms between churchyard and West Cliff gets tedious on round trips.
- Funny: some sort of boy, What dog?, Lady Cholmondeley, meetings, counted twice, young man/fishwife/sixty-three, American, one ball, second one, Harrogate, kipper looking.

### Overthinker

- Overthinker (round 4): finished, 65/80. Difficulty 2. Batched two movement commands once (ran in order).
- Kipper: ~2 cmds once fisherman known hungry; second fishwife visit. Explained: yes. "Bite my hand off" briefly pointed at the dog. Risk: relies on talking to fishwife again; first refusal reads as closed. Suggest a thought line.
- Float: 2 cmds (kipper to fisherman, use nets). Clean.
- Stoker: ~5 incl. deliberate bat paddle (refusal "excellent, redirects to creatures") and dragon (refused, sets up payoff). Explained: yes.
- Suit: 1 cmd. Explained: yes.
- Doorman: Fanshawe from the jeweller (young gent, striped blazer, big hotel) connected to Algy's blazer; enjoyed it. Explained: yes.
- Wager: salamander refusal specific; dragon pays off "nobody gets the dragon". Explained: yes.
- Red herrings, none unfair: black dog, schooner, "bite my hand off", Abbey bats.
- Funny: young man incl. fishwife, two-slash-six, dog already eaten, some sort of boy, kipper looking, one ball, kept in a sleeve, American, second one, chip shop.

**Overall:** both finished, nobody stuck, no brute force. Rated 2/5, up from 1.5. The Fanshawe clue was both testers' favourite. Iteration stopped here; see the public scorecard for the call on difficulty.

**Changed after round 4:** Phil's thought line (tap his portrait) now nudges back towards food going spare once he's met the hungry fisherman.

## Rework after Rob's playtest (2026-10-31)

Rob finished the old version in about 5 minutes. Rebuilt to 10 puzzles across 6 scenes: Phil's cards are separate items (bat to Stoker; two spares sold to the paperboy for a penny each; dragon is the wager); kipper costs a penny to take away (free only if eaten, which Phil won't); the suit is bought as an item and can only be put on with fingers warmed at the smokehouse fire, and the warmth is lost leaving the old town; the match moves to a new parlour scene and needs a net (the Gazette, bought with the second penny). The solver caught the finale being reachable early; fixed.

### Round 6 (Veteran, Button-Masher)

- **Veteran:** finished, 108/120 (~55 exploring). Difficulty 2. Estimated 15 to 20 minutes for a human. Best puzzle: warming the fingers for the collar studs. Easiest: Stoker and the wager. Nothing fallen into by accident. Parser: "on Phil" matched Phil's bat. Stale West Cliff description. Suggested: Stoker's need less direct, paperboy not naming a price, net needing a combination.
- **Button-Masher:** finished, 82/90. Difficulty 2. Card puzzles brute-forceable with few cards and few people. Thought standing in the warm smokehouse should be enough; the refusal didn't point at the fire. Same parser bug.

**Changed after round 6:** parser reads a brother's name as the brother and accepts "wear"; the suit refusal now points at real heat, not warm air; the paperboy no longer names his price; the West Cliff description no longer mentions Algy once he's gone in.
