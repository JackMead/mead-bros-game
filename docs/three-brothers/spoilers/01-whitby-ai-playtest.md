# Chapter 1, A Young Man in Whitby: AI playtest reports (SPOILERS)

Puzzles, as tracked by the scorecard:

- Puzzle 1: the bat card for Bram Stoker, for the half-crown.
- Puzzle 2: the half-crown for the suit at the pawnbroker's.
- Puzzle 3: getting past Hobbs (suit, then name-dropping Mr Fanshawe; the name-drop was added after round 1).
- Puzzle 4: a cork float off the herring nets, once the fisherman's fed with the kipper.
- Puzzle 5: the match. Rounds 1 and 2: talk Algernon into it. From round 2: stake the golden dragon card.

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
