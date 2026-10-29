# Puzzle rubric

How Claude designs puzzles for this game, and how we judge them. It improves after every chapter: see "What we've learned" at the bottom.

## 1. Fixed rules (every puzzle, every chapter)

No chapter's author can opt out of these.

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
  - **Gentle hit the target** (1.5 to 2 out of 5). Later chapters asking for Medium need clues split across places, not sat in one description.
