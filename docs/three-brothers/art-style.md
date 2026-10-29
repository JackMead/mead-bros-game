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

## Palette

Warm ochres and mossy greens for Yorkshire stone and countryside; deep teal for water; amber light; dusky purples for shadow and anything magical (Mother Shipton).

## Who draws what (v1)

- **Backgrounds: painted**, one per scene, by the chapter's author using the prompt below. This is what gives the game its look.
- **The brothers: painted**, cut from the reference sheet into `art/rob.png`, `art/jack.png` and `art/phil.png`, with faces for the bottom bar in `art/<brother>-portrait.png`. Code brings them to life like paper puppets (`drawSprite` in `characters.ts`): the arms are cut out along outlines in `cast.ts` and swing at the shoulder, the head nods and tilts at the neck, and the body breathes. Poses: talking (gestures and nods), `rant` (one arm jabbing the air, bouncing, hot air) and `flail` (for cinematics). Blinking and lip movement aren't possible from one picture at this size. The code-drawn versions (from `appearance` in `cast.ts`) are the fallback if a picture is missing.
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
