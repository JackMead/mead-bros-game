# Three Brothers backlog

Spoiler-free. Work waiting to be done, with plans. Nothing here is started until a brother says go.

## Done (PR after Rob's playtest)

Show button; exit arrows on every way out (now checked automatically); tap an item twice to look at it; the scene waits for the dialogue so nobody vanishes mid-sentence; save link with share sheet; new `fly` and `vanish` cues; items that walk beside you; Chapter 2 item icons drawn in code; painted props from Rob (soapbox, newspaper net, Chapter 2 props, door states, sparrow); all Chapter 2 fixes from Rob's playtest (early clue, floor, early line, missing sprite, ending staging, cook and horse placement, animations).

## Earlier plans (kept for reference)

### Save link (carry on in another browser)

Saves live in one browser only, so switching device or browser loses progress.

Plan:
- Add "Continue on another device" to the menu. It makes a link with the save packed into the part after `#`, so it never reaches a server and needs no hosting.
- On phones the button opens the share sheet (WhatsApp, Messages, email) via the browser's built-in share; on desktop it copies the link, with a "Copied" note.
- Opening the link offers to load that save (asking first if this browser already has progress on that chapter), then clears it from the address bar.
- Keep the save small: the list of moves made, compressed. Test that a link made on one chapter version still loads, or fails politely after the chapter changes.
- Later, if wanted: shared cloud saves, one slot per brother. Needs a hosted database and a PR discussion (new runtime dependency), plus a guard against loading someone else's further-on save.

### Item icons for Chapter 2

Items without an icon show their name as text in the inventory. Draw each one in code in `props.ts`, like the wallet and coin, including each changed version of an item. Check them at the real 64-pixel slot size.

### Chapter 2 layout bugs (from Rob)

- The cook is placed oddly in the yard.
- The grey mare overlaps one of the stable's posts.
- The yard's text says the cook is roasting a boar on the spit, but the painted spit is empty (the art prompt asked for an empty spit, so the boar could be drawn over it). Fix: a boar-on-the-spit cut-out over the spit, ideally slowly turning. Either Rob makes one in ChatGPT ("a whole roast boar on an iron spit, golden and dripping, side view, plain light grey background", same style) or Claude draws it in code as a stopgap.

### Ways out of a scene aren't clear enough (from Rob, Chapter 2)

On painted backgrounds, exits are invisible tappable areas, so it isn't obvious where you can go. Worst case: the yard's way back up to the Wolds has no path painted at all.

Plan (engine-wide, so every chapter benefits):
- Mark exits in the chapter format (an `exit` direction on a hotspot: left, right, up, down), checked by `validate.ts`.
- Draw a small, softly pulsing arrow at each exit, pointing the way, with the place's name under it (phones have no hover).
- Give each painted scene a believable way out where the painting lacks one, or move the exit to where a path is painted.
- Check Chapter 1 and the prologue too.

### On phones you can't tell what's tappable (from Rob)

With no hover on a touchscreen, painted scenery and tappable things look the same, so you end up tapping everywhere. Monkey Island had hover labels; phones need something else.

Plan (engine-wide):
- A "Show" button in the bottom bar (or press-and-hold on empty scenery): every tappable thing glints and shows its name for a couple of seconds, exits included.
- Optional, as a setting: a faint sparkle on things you haven't looked at yet, which stops once you have.
- No change to the puzzles: knowing what's tappable isn't the challenge, knowing what to do with it is.
- Test on a real phone in landscape.

### Looking at items isn't discoverable on phones (from Rob)

Tapping an item in your pockets only selects it; looking at it needs a press-and-hold, which isn't obvious. In Chapter 2 that hides something you need. Plan: tapping an item that's already selected looks at it (instead of putting it back), the intro and the first item you pick up both say so, and anything that only comes out of an item on looking also comes out when you use it.

### People vanish before they finish talking (from Rob)

When an action makes a character leave, the screen updates the moment you act, so they disappear while their lines are still playing and the speech floats over nothing. Plan (engine-wide, in `ui.ts`): keep drawing the scene as it was until the dialogue queue is empty, then switch to the new state. Add a test in `ui.test.ts`.

### Painted things that should change don't (from Rob, Chapter 2)

The hall's far door is painted shut and barred, so it still looks that way after the story says it's changed. Same risk anywhere the painting shows something that later changes (the hurdle gate, the bag by the hut).

Plan:
- Rob asks ChatGPT, in the same chat, for edits of the hall background: one with the far door unbarred but shut, one with it wide open onto daylight. Everything else identical.
- Claude crops just the door from each and draws it over the painting as the door's picture for that state. The same trick works for any other changing detail.
- Audit every chapter for painted things whose state changes, and list what needs a variant.

### Chapter 2 fixes from Rob's playtest (details in the spoilers file)

- The hall floor's tappable area is a small patch in one corner, though the painting shows the whole floor strewn. Make it cover the whole floor, and accept the same action anywhere sensible on the floor. Also covered by the "Show" button above.
- One character's line in the hall congratulates Jack too early, before the moment it's about. Give them a waiting line until then.
- The ending: one character should vanish on screen when the story says so (a new cue that hides a hotspot mid-cinematic), and another speaks without being in the scene. Put them there, and add an automatic check that every speaker in an ending is present in the final scene.
- A needed thing in the yard has a tappable spot but nothing painted there, so it's invisible. Rule for every chapter: anything the player needs must be visible in the picture (painted, a cut-out, or drawn in code). Audit all chapters.
- Something that comes back to the stable isn't drawn back in its place. Check every come-and-go sprite in the chapter for its full round trip.
- One item should be shown on screen beside Jack while he has it, walking along with him, not just sitting in the inventory. Engine-wide: an item can name a `follower` sprite drawn next to whoever carries it, with a little walk-bob.
- Show the key moment in the hall as an animation, not just text: a new cinematic cue, `fly`, that sends a small sprite along a path across the scene (start, end, a little wobble). Sparrow drawn in code or cut out from a ChatGPT image. Reusable in any chapter (bats, gulls, a thrown hat).

### A clue gives a later step away too early (from Rob, Chapter 2)

Rob met text naming something before he'd found it himself. Details and the candidate lines are in `spoilers/02-goodmanham-ai-playtest.md` (Rob's playtest section). Fix: audit every line that names it and make sure none fires before the player could have discovered it.

### Chapter 2 playtest (Rob)

Rob's notes go in `playtests/02-goodmanham.md` under his name. Fixes that come out of them get listed here first.
