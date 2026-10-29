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

Add or tweak profiles here as we learn what's useful.

### How Claude runs them

1. Run `npm test` first. Don't playtest a chapter that fails the automatic checks.
2. Start one subagent per profile with: the profile text above; the instruction to play `npm run play -- --session <their own file> --chapter <id> --new`, then one command per call; a cap of 80 commands; and a ban on reading anything under `games/three-brothers/` or `docs/three-brothers/spoilers/`.
3. Each tester reports, for each puzzle as they experienced it: what the obstacle was, what they tried, what clue (if any) led them to the answer, and whether they could explain why the answer made sense *before* it worked. Plus what was funny, and what annoyed them.
4. Claude saves full reports to `spoilers/<chapter>-ai-playtest.md` and the numbers (`npm run play -- --session <file> --score`) to the public scorecard in `playtests/<chapter>.md`.
5. Fix flagged puzzles (see the rubric's scorecard rules) and re-run the testers that struggled.
6. Play the chapter once through the real screen in a headless browser (Playwright), tapping things where a player would, to catch anything hidden or untappable. Keep the screenshots private: they show solutions.

## Human playtests

After playing a chapter, add a few lines to `playtests/<chapter>.md` under your name. Short is fine:

- Where did you get stuck, and for how long?
- Anything that felt cheap or unfair?
- What made you laugh?
- What did you expect to work that didn't?

These are the most valuable input to `rubric.md`. Before building the next chapter, Claude reads them and updates "What we've learned".
