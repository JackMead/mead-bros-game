# Three Brothers backlog

Spoiler-free. Work waiting to be done, with plans. Nothing here is started until a brother says go.

## Waiting to start

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

### Chapter 2 playtest (Rob)

Rob's notes go in `playtests/02-goodmanham.md` under his name. Fixes that come out of them get listed here first.
