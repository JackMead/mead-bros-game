# The Three Brothers of Yorkshire

A point-and-click puzzle adventure starring Rob, Jack and Phil. Mother Shipton scatters them through Yorkshire's history; each chapter is one more step towards getting them back together.

**The point:** each of us writes the *story* of a chapter. Claude writes the *puzzles* from that story, so everyone, the author included, gets to play every chapter blind.

Play it at `/games/three-brothers/`. Works on phones (landscape) and desktop.

## The files

| File | What it's for | Who edits it |
| --- | --- | --- |
| [story-bible.md](story-bible.md) | Premise, the curse, the brothers, lore, open threads | Everyone, every chapter |
| [rubric.md](rubric.md) | The rules every puzzle must follow, and what we've learned | Everyone, after playtests |
| [art-style.md](art-style.md) | One shared style prompt so art from different AI tools matches | Everyone |
| [playtesting.md](playtesting.md) | How AI playtesters and humans test a chapter | Everyone |
| `briefs/` | One story brief per chapter, written by its author. **No spoilers** | The chapter's author |
| `playtests/` | Spoiler-free scorecards and human playtest notes | Everyone |
| `spoilers/` | AI playtest walkthroughs. **Spoilers** | Claude |
| `games/three-brothers/chapters/` | The chapters themselves. **Spoilers: these are the solutions** | Claude |

## Writing a chapter

1. **Read** the story bible, especially the open threads and the last chapter's ending. Play the latest chapter.
2. **Copy** `briefs/_template.md` to `briefs/<number>-<name>.md` and fill it in: where and when, which brother, what happens, jokes, which threads you pick up or close, how many puzzles and how hard.
3. **Ask Claude** (from your phone is fine): *"Build chapter N of three-brothers from docs/three-brothers/briefs/N-name.md. Don't tell me the puzzles."*
4. Claude writes the puzzles to the rubric, runs the automatic checks and the AI playtesters, fixes what they flag, and updates the story bible. It tells you only the spoiler-free scorecard.
5. **Play it blind** on the PR preview or after merge. Then add your notes to `playtests/`.
6. Your brothers play it and add theirs. Those notes feed the rubric for the next chapter.

## Spoiler rules (for humans and AI)

Everyone plays every chapter blind, its author included, so **every message, image and file anyone might see before playing must be spoiler-free.** The full rules for Claude are in `CLAUDE.md` under "No spoilers". In short:

- **Solutions live only** in `games/three-brothers/chapters/` and `docs/three-brothers/spoilers/`. Don't open those until you've played.
- **Claude never reveals, in chat, images, commits, PRs or public docs:** how an obstacle is passed, which item goes where, which brother does what, what changes after an action, or any in-game line beyond the intro and ending. Not even half a hint.
- **Describe work by type and count instead.** "Lined up 7 tappable areas with the painting" is fine. Saying where a character ends up after a puzzle is not.
- **Screenshots** show only the title screen or a chapter's untouched opening, with no dialogue on screen.
- **Scorecards** use labels like "Puzzle 2", never what the puzzle is.
- **Want a hint or the answer?** Ask for it explicitly ("spoil puzzle 2 for me"). Claude will check before answering.
- `npm test` fails if a public doc quotes an in-game line (see `games/three-brothers/spoilers.test.ts`).

## How the code fits together

- `types.ts`: the chapter format, with the mini-language for conditions (`if`), effects (`do`) and lines (`say`).
- `engine.ts`: plays any chapter. Pure logic.
- `validate.ts` + `solver.ts`: the automatic rubric checks, run by `npm test` on every chapter: no typos, finishable, no dead ends.
- `text.ts` + `tools/play.ts`: a text-adventure version for AI playtesters: `npm run play -- --session <file> --new`.
- `ui.ts`, `render.ts`, `main.ts`: the touch/click screen. Placeholder shapes until art arrives in `games/three-brothers/art/`.
- `cast.ts`: the three brothers. Each brother owns his own entry.
- `characters.ts`, `props.ts`: the brothers, props and item icons, drawn in code.
- `cues.ts`, `cinema.ts`: cinematic cues. Any intro, ending or `say` line written in square brackets, like `[shake 1]` or `[vortex 165 190]`, is a cue rather than speech. `cues.ts` lists them all. Chapters can use them for arrival scenes and endings without touching the engine.
