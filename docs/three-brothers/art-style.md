# Art style

The look: hand-painted cartoon adventure, in the spirit of late-90s LucasArts games. Warm and funny, not realistic. Art is optional: every scene works with placeholder shapes, and puzzles must be fun before anyone paints anything.

We'll use different tools (ChatGPT, Gemini, others), so **everyone starts from the same prompt** below to keep the style consistent.

## Master style prompt

Paste this first, then describe the scene:

> Hand-painted 2D cartoon background for a point-and-click adventure game. Exaggerated, slightly wonky perspective, chunky shapes, thick soft outlines, rich saturated colours with warm light and cool shadows, painterly texture, whimsical and funny rather than realistic. Wide 16:9 landscape, 1920x1080. No characters, no text, no UI. Leave the bottom fifth of the image as simple floor, since a toolbar covers it.

Don't name other games or studios in the prompt; describe the style instead.

## Palette

Warm ochres and mossy greens for Yorkshire stone and countryside; deep teal for water; amber light; dusky purples for shadow and anything magical (Mother Shipton).

## The brothers

Draw each brother **once**, as a reference sheet, and reuse it. Never redraw a brother from scratch in another tool.

> Cartoon character, full body, standing, plain background, same style as above. [Description.]

- **Rob:** the tallest, eldest. *(Rob to add: hair, clothes, a soapbox under his arm.)*
- **Jack:** middle brother. *(Jack to add.)*
- **Phil:** youngest. *(Phil to add: probably wearing gloves.)*

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
