# Puzzle rubric

How Claude designs puzzles for this game, and how we judge them. It improves after every chapter: see "What we've learned" at the bottom.

## 1. Fixed rules (every puzzle, every chapter)

No chapter's author can opt out of these.

1. **No accidental solves:** you can never fall into an answer. Every solution needs a specific, deliberate action by the player (use this on that, go there and do this). Talking to people and looking at things give clues, never solutions, and a conversation menu is never the whole puzzle.
1. **Fair:** the solution can be justified in one sentence using only things the player has seen or been told in the game. If the justification needs "because adventure games", it fails.
2. **Clued:** every solution is hinted at least once before it's needed, in a description, a line of dialogue or a character's refusal. A good "no" points somewhere: "This lid's rusted on, I can't shift it" says *something to lever it, or someone stronger*. (Examples in this rubric are invented; never quote a real chapter here.)
3. **No dead ends:** the player can never lose something they need, or lock themselves out. Checked automatically.
4. **Finishable:** checked automatically.
5. **No pixel hunts:** anything you need is a named thing you can tap. No hover-only information, since phones have no hover.
6. **Failure is funny:** a wrong try gets a line in character, not a blank "That doesn't work". Each brother's fallback lines carry his personality.
7. **Every answer has a reason in the world, then a joke.** Logic first: the joke rides on top, never replaces it.
8. **The brothers' traits matter.** At least one puzzle per chapter depends on a brother's strength or weakness (`story-bible.md`), so the characters aren't just skins.
9. **Spoiler-free outside the chapter file.** Claude never describes solutions in chat, commits or PRs.

## 2. Author's choices (set in each chapter's brief)

| Choice | Options | Default |
| --- | --- | --- |
| Number of puzzles | Any | 3 to 5 |
| Difficulty | Gentle / Medium / Hard | Medium |
| Puzzle types | Any mix of the types below | At least two different types |
| Length | Rough minutes to play | 15 to 30 |
| Brothers playable | Any of the three | Whoever the story puts there |

"Hard" means more steps, more red herrings and cleverer connections. It never means breaking the fixed rules.

## 3. Puzzle types

- **Inventory:** use or combine an item.
- **Character:** one brother's trait solves it (or blocks it).
- **Dialogue:** talk someone round; choices matter.
- **Logic:** a riddle, a code, a sum, a pattern.
- **Observation:** a detail in a description is the key.
- **Across time:** something done in one era, via the Petrifying Well, changes another. The signature puzzle of this game; aim for one per chapter once there's more than one era.

## 4. Shape of a chapter

- Open with something easy that teaches or reminds the controls.
- Let puzzles run side by side where you can, so a stuck player has something else to try.
- One "aha" puzzle, ideally near the end, where two things you've seen click together.
- End on a story beat that leaves a thread open for the next author.

## 5. Automatic checks (`npm test`)

Every chapter in `games/three-brothers/chapters/` must:

- reference only items, flags, scenes and speakers that exist;
- be finishable;
- have no dead ends (from every reachable state, the end is still reachable);
- reach every listed puzzle.

## 6. AI playtest scorecard

See [playtesting.md](playtesting.md). For each puzzle we record how many of the testers solved it, roughly how many tries it took, and whether they could explain *why* the answer made sense before trying it. Flag a puzzle when:

- **Unfair:** two or more testers solved it by trying everything, or couldn't explain the logic afterwards.
- **Too obvious:** every tester solved it first try *and* the brief asked for Medium or Hard.
- **Stuck:** a tester gave up, or went 25+ commands without progress.

Flagged puzzles get fixed (usually with a better clue) and retested before the chapter ships.

## 7. What we've learned

Add a dated line after each chapter's playtests: what worked, what didn't, what changes in the rules above.

- *2026-10-29, Prologue (AI round 1):*
  - **Escalating refusals work.** A chain of "no" lines where each one narrows down what's needed was the most praised clue in every report. Do this on purpose.
  - **Companions must talk back.** When a line asks who has something, players ask the other brothers. A stock grumble there feels like a dead end. New rule: talking to another brother gives a useful line whenever he's relevant to the current obstacle.
  - **Teach controls in the world, not just the intro.** Testers missed that you could switch brother until they typed "help". The first puzzle that needs another brother should say so in a line of dialogue.
  - **Fallback lines go stale.** A brother's generic line about his weakness reads wrong once a puzzle fixes it. Keep fallback lines about personality, not current state.
  - **Red herrings with good refusals are fine.** The Overthinker spent 8 commands on the statue and well and didn't mind, because each refusal was funny and the statue paid off in the story.
  - **Text testers can't see the screen.** A brother's figure once covered something that had to be tapped, which no text playtest could catch. Before shipping, Claude also plays the chapter through in a headless browser and checks every needed thing can be tapped (privately: those frames are spoilers). Taps now pass through the brother you're playing.
  - **Gentle hit the target** (1.5 to 2 out of 5). Later chapters asking for Medium need clues split across places, not sat in one description.
- *2026-10-30, Chapter 1 (AI rounds 1 to 4):*
  - **Never edit a chapter while testers are playing.** A mid-test fix broke the build and showed three testers the answers. The play tool now refuses to print source, but the rule stands.
  - **Medium needs more than one idea per step.** Single fetch chains (A unlocks B unlocks C) rated 1.5 however they were dressed up. What moved the needle: a clue that only clicks when you connect two scenes, and a brother's trait that creates the obstacle as well as solving it.
  - **Don't let the game take the step for the player.** If talking to someone again quietly does the clever bit, testers call it automatic. Let the player do the connecting.
  - **Menus can be brute-forced for free.** Three or four options with no cost to a wrong pick means a masher always gets through. Keep menus for jokes and character, and put the real thinking somewhere else, like which item, which place or which name.
  - **Menacing flavour invites a puzzle.** A sinister animal with a backstory made every tester expect to use it. Either give it a clear "not this" or pay it off in the story (here, the ending).
  - **Spell out unfamiliar facts once.** Old money (half a crown is two and six) needed saying in plain words somewhere for newcomers; otherwise the right answer felt lucky.
- *2026-10-30, Chapter 1 (first human playtest, Rob):* **5 minutes against a 20 to 30 minute target.** The AI testers' 2/5 was generous: a human who knows adventure games went straight through. Lessons:
  - **AI testers over-count time.** They spend most of their commands exploring. Judge length by the fewest moves and by humans, not by tester command counts.
  - **No accidental solves** (now fixed rule 1). Several answers were triggered just by talking to everyone.
  - **More inventory, more threads.** With one or two items in hand there's only ever one candidate. Medium needs several items in play, a couple of decoys, and two or three threads open at once.

