# Playtesting

Two kinds: **AI playtesters** before a chapter is merged, to catch unfair or broken puzzles, and **us** after, which is what actually counts.

## AI playtesters

Each tester is a Claude subagent playing the text version of the chapter through `npm run play`. They're told never to open the chapter's source, the briefs' solutions or `spoilers/`.

### Profiles

| Profile | Plays like | Catches |
| --- | --- | --- |
| **The Veteran** | Played every LucasArts game. Methodical: looks at everything, then thinks. | Puzzles too easy for the requested difficulty |
| **The Newcomer** | Never played a point-and-click. Takes everything literally. Won't think to combine things unless clued. | Missing clues, unclear controls |
| **The Button-Masher** | Impatient. Tries everything on everything rather than reading. Gives up at 60 commands. | Puzzles you can only solve by brute force (if this tester solves a puzzle as fast as the others, it's under-clued) |
| **The Overthinker** | Reads too much into every line; spins theories. | Red herrings that mislead unfairly; clues that point the wrong way |
| **The Comedy Editor** | Plays like a reasonably clever player, but is a sitcom script editor (British character comedy: understatement, specificity, the straight man). Tries everything, because most of the writing is in reactions. | Jokes that restate a brother's traits, explain themselves, are stock gags, or repeat word for word. Scores the humour out of 10 and gives a rewrite for each weak line |

Add or tweak profiles here as we learn what's useful.

### How Claude runs them

1. Run `npm test` first. Don't playtest a chapter that fails the automatic checks.
2. Start one subagent per profile with: the profile text above; a short summary of the brothers and earlier chapters (what a returning player would know); the instruction to play `npm run play -- --session <their own file> --chapter <id> --new`, then one command per call; a cap of 100 to 160 commands; and a ban on reading anything under `games/three-brothers/` or `docs/three-brothers/`.
   - **Every tester gets its own session file, and is told not to write helper scripts.** In Chapter 3, two testers' scripts had the same name and wrote into one session, which ruined both runs.
   - Ask each tester whether every answer was **inferred** (worked out from clues) or **stated** (a line told them the method), quoting the line. That's the question that moves difficulty, more than any rating.
3. Each tester reports, for each puzzle as they experienced it: what the obstacle was, what they tried, what clue (if any) led them to the answer, and whether they could explain why the answer made sense *before* it worked. Plus what was funny, and what annoyed them.
4. Claude saves full reports to `spoilers/<chapter>-ai-playtest.md` and the numbers (`npm run play -- --session <file> --score`) to the public scorecard in `playtests/<chapter>.md`.
5. Fix flagged puzzles (see the rubric's scorecard rules) and re-run the testers that struggled.
   - **Work in rounds.** Chapter 3's rewrite ran six rounds of two fresh testers each, rotating the profiles, with fixes between rounds, and a Comedy Editor in two of them. Fresh testers each round matter: a tester who has seen the chapter can't judge whether a clue works.
   - Don't edit the chapter while a round is playing. Commit between rounds, so a crash loses nothing.
   - Flags that only change wording (a second visit's line) multiply the solver's work. Keep them few, and check `npm test` still runs in reasonable time.
6. Play the chapter once through the real screen in a headless browser (Playwright), tapping things where a player would, to catch anything hidden or untappable. Keep the screenshots private: they show solutions.

## Human playtests

After playing a chapter, add a few lines to `playtests/<chapter>.md` under your name. Short is fine:

- Where did you get stuck, and for how long?
- Anything that felt cheap or unfair?
- What made you laugh?
- What did you expect to work that didn't?

These are the most valuable input to `rubric.md`. Before building the next chapter, Claude reads them and updates "What we've learned".
