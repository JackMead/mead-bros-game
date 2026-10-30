# Art style

The look: hand-painted cartoon adventure, in the spirit of late-90s LucasArts games. Warm and funny, not realistic. Art is optional: every scene works with placeholder shapes, and puzzles must be fun before anyone paints anything.

We'll use different tools (ChatGPT, Gemini, others), so **everyone starts from the same prompt** below to keep the style consistent.

## Master style prompt

Paste this first, then describe the scene:

> Hand-painted 2D cartoon background for a point-and-click adventure game. Exaggerated, slightly wonky perspective, chunky shapes, thick soft outlines, rich saturated colours with warm light and cool shadows, painterly texture, whimsical and funny rather than realistic. Wide 16:9 landscape, 1920x1080. No characters, no text, no UI. Leave the bottom fifth of the image as simple floor, since a toolbar covers it.

Don't name other games or studios in the prompt; describe the style instead.

## Scene prompts

Add the scene description under the master prompt. Spell out the layout (what goes left, centre, right), keep the bottom third as open floor for the brothers, and say "no people, no animals, no text, all signs blank". Expect a few attempts.

- **Prologue, `prologue-well.webp` (done, made in ChatGPT):** the Petrifying Well. Rock face with petrifying objects on the left; Mother Shipton statue centre-left; blank selfie sign with painted footprints centre; tea kiosk with striped awning and blank chalkboard on the right; open gravel path along the bottom third; trees framing the top.
- **Chapter 1, Whitby, August 1890 (backgrounds to do).** Four backgrounds, all late-afternoon summer light with a little sea haze. Each prompt describes the scene as Phil first finds it.
  - **`whitby-east-cliff.webp`:** St Mary's churchyard on the East Cliff. Far left: the huge ruined Gothic arches of Whitby Abbey against the sky, taking up the left quarter. Centre-left: weathered, leaning gravestones in rough grass. Centre: an empty wooden bench facing out to sea. Right: the top of a long stone staircase winding down off the right edge, with red-roofed old-town houses, chimney smoke and a harbour full of tall masts far below; the sea beyond. Open grassy path along the bottom third.
  - **`whitby-old-town.webp`:** Church Street in Whitby's old town, cobbled and narrow. Far left: the foot of a long stone staircase climbing up and out of frame. Centre-left: a Victorian pawnbroker's shop with three brass balls hanging over the door and a window crowded with second-hand odds and ends. Centre: a small jet workshop with a bay window of black glossy jewellery. Centre-right: a tarred wooden smokehouse with smoke drifting from roof vents and a dark open doorway glowing warm inside. Far right: the street opening out towards the harbour. Cobbles along the bottom third.
  - **`whitby-bridge.webp`:** The old swing bridge over the River Esk, crossing the middle of the picture. Far left: the end of a cobbled quay leading back into town. Left: fishing nets hung over the quay railing to dry. Centre: a small wooden keeper's hut on the bridge with a brass bell and a big iron lever. Upper centre-right: a moored two-masted schooner with stacked wooden crates on the quay beside it. Far right: a road climbing up the far bank towards grand buildings on a cliff. The Abbey ruins tiny on the clifftop in the distance. Quay stones along the bottom third.
  - **`whitby-west-cliff.webp`:** The smart West Cliff. Far left: a path dropping away downhill. Left: a tall arch made of two whale jawbones, framing the sea. Centre: a grand Victorian seaside hotel with bay windows and flags, and a gate in iron railings in front of its door. Right: the hotel's terrace behind the same railings, with a plain dining table and chairs, and the cliff edge and sea beyond. A neat promenade along the bottom third.
  - **People and the dog, as separate cut-outs** (same chat, full body, plain light grey background, like the brothers): Bram Stoker (big, red-bearded, 1890 tweed, notebook); an ancient sailor with a white beard and clay pipe; a huge black dog with red eyes, sitting; a fishwife in a shawl and big apron; a fisherman in a knitted gansey; a paperboy in a big cap with a newspaper bag; a hotel doorman in a coat covered in brass buttons; a young gentleman in a striped blazer and straw boater. Files: `stoker.png`, `sailor.png`, `black-dog.png`, `fishwife.png`, `fisherman.png`, `paperboy.png`, `doorman.png`, `algernon.png`. Until a cut-out exists, the game draws a labelled box where that person stands, even over a painted background. **Done** (made in ChatGPT): all eight are in `art/`. Their style, painterly caricature with soft outlines, is the target for the backgrounds too.

## Palette

Warm ochres and mossy greens for Yorkshire stone and countryside; deep teal for water; amber light; dusky purples for shadow and anything magical (Mother Shipton).

## Who draws what (v1)

- **Backgrounds: painted**, one per scene, by the chapter's author using the prompt below. This is what gives the game its look.
- **The brothers: painted**, cut from the reference sheet into `art/rob.png`, `art/jack.png` and `art/phil.png`, with faces for the bottom bar in `art/<brother>-portrait.png`. Code brings them to life like paper puppets (`drawSprite` in `characters.ts`): the arms are cut out along outlines in `cast.ts` and swing at the shoulder, the head nods and tilts at the neck, and the body breathes. Poses: talking (gestures and nods), `rant` (one arm jabbing the air, bouncing, hot air) and `flail` (for cinematics). Extra painted poses make the biggest difference: Rob's soapbox rant flicks between three (`art/rob-rant-*.png`, listed under `poses` in `cast.ts`), popping and bouncing between them. Any brother can get poses the same way: generate them from the reference sheet, full body on plain grey, and Claude cuts them to the same scale. Lip-flap comes from a second sheet with mouths open (`art/<brother>-talk.png`, `art/<brother>-portrait-talk.png`): the head is swapped while a brother speaks. It only works because that sheet kept the exact framing of the reference; regenerate if a new one drifts. Blinking isn't worth it at this size. The code-drawn versions (from `appearance` in `cast.ts`) are the fallback if a picture is missing.
- **Painted props** come to life the same way: `props.ts` can cut a picture into moving pieces (`drawPuppet`). The Labrador (`art/dog.png`) wags, pants and drools.
- **Props and item icons: drawn in code** (`props.ts`): things that move or can come and go during play, lettering on signs and boards (painted signs are left blank), and inventory icons. A hotspot uses one with `prop`, an item with `icon`.
- Painted versions can replace any of these later by dropping a file into `art/` (see Files).

## The brothers

The reference sheet is [`reference/brothers.webp`](reference/brothers.webp) (ChatGPT, matched to the Prologue background). Match it; never redraw a brother from scratch in another tool. New poses (sitting, pointing, a proper mid-rant pose) should be generated from it in the same chat, full body on a plain light grey background, so they can be cut out the same way.

| | Looks |
| --- | --- |
| **Rob** | Tallest. Short light brown hair, clean shaven, black t-shirt, jeans, navy trainers |
| **Jack** | Slight build. Messy dark brown hair, stubble, plum t-shirt, olive cargo shorts, dark trainers |
| **Phil** | Glasses and a beard, scruffy blonde-brown hair, green-grey t-shirt, grey joggers, white trainers, a plain yellow backpack |

**No one else's characters, logos or brands anywhere in the game or the repo.** The first sheet gave Phil a famous cartoon character as a backpack; it was edited out, leaving plain yellow straps. Say "plain" or "generic" in prompts and check results before using them.

## Files

Put images in `games/three-brothers/art/`. The game picks them up by name:

| File | Used for |
| --- | --- |
| `<scene background>`, e.g. `prologue-well.png` | Scene background (named in the chapter's `background`) |
| `rob.png`, `jack.png`, `phil.png` | Brothers in the scene, full body, transparent background |
| `rob-portrait.png` etc. | Square faces for the bottom bar |
| `item-<id>.png`, e.g. `item-tea.png` | Inventory icons, square, transparent |
| Hotspot `sprite`, e.g. `dog.png` | Things that come and go, drawn over the background |

Scenes are laid out on a 960x540 grid (the bottom 84 pixels are the toolbar). Paint backgrounds at 1920x1080 so they stay sharp. Once a painting is in, the tappable areas in the chapter file (`rect`) may need nudging to match where things ended up.

Keep files small: a background around 300 to 600 KB. Claude converts uploads to a 1920x1080 `.webp`.

Backgrounds fill the whole 16:9 screen; the bottom bar covers the bottom 84 of 540 pixels, so keep the bottom of the painting as plain floor.
