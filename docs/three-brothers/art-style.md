# Art style

The look: hand-painted cartoon adventure, in the spirit of late-90s LucasArts games. Warm and funny, not realistic. Art is optional: every scene works with placeholder shapes, and puzzles must be fun before anyone paints anything.

We'll use different tools (ChatGPT, Gemini, others), so **everyone starts from the same prompt** below to keep the style consistent.

## Master style prompt

Paste this first, then describe the scene:

> Hand-painted 2D cartoon background for a point-and-click adventure game. Exaggerated, slightly wonky perspective, chunky shapes, thick soft outlines, rich saturated colours with warm light and cool shadows, painterly texture, whimsical and funny rather than realistic. Wide 16:9 landscape, 1920x1080. No characters, no text, no UI. Leave the bottom fifth of the image as simple floor, since a toolbar covers it.

Don't name other games or studios in the prompt; describe the style instead.

## Scene prompts

Add the scene description under the master prompt. Spell out the layout (what goes left, centre, right), keep the bottom third as open floor for the brothers, and say "no people, no animals, no text, all signs blank". Expect a few attempts.

- **Prologue, `prologue-well`:** the Petrifying Well. Rock face with petrifying objects on the left; Mother Shipton statue centre-left; blank selfie sign with painted footprints centre; tea kiosk with striped awning and blank chalkboard on the right; open gravel path along the bottom third; trees framing the top.

## Palette

Warm ochres and mossy greens for Yorkshire stone and countryside; deep teal for water; amber light; dusky purples for shadow and anything magical (Mother Shipton).

## Who draws what (v1)

- **Backgrounds: painted**, one per scene, by the chapter's author using the prompt below. This is what gives the game its look.
- **The brothers: drawn in code** (`games/three-brothers/characters.ts`) from their `appearance` in `cast.ts`, with blinking, breathing and talking. This keeps all three consistent in every chapter. Change your own look in `cast.ts`.
- **Props and item icons: drawn in code** (`props.ts`): things that move or come and go (the Labrador, the soapbox), lettering on signs and boards (painted signs are left blank), and inventory icons. A hotspot uses one with `prop`, an item with `icon`.
- Painted versions can replace any of these later by dropping a file into `art/` (see Files).

## The brothers

| | Looks |
| --- | --- |
| **Rob** | Tallest. Short light brown hair, clean shaven, black t-shirt, jeans |
| **Jack** | Slight build. Mid-length dark brown hair, stubble, t-shirt and shorts |
| **Phil** | Glasses and a beard, mid-length blonde-brown hair, joggers, a yellow backpack with ears |

If we ever paint them, draw each brother **once** as a reference sheet in one tool and reuse it. Never redraw a brother from scratch in another tool.

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

Keep files small: a background around 300 to 600 KB (`.webp` or `.jpg`).
