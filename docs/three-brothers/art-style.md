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
- **Chapter 1, Whitby, August 1890 (done, made in ChatGPT in the same chat as the prologue).** Four backgrounds, all late-afternoon summer light with a little sea haze. Each prompt describes the scene as Phil first finds it.
  - **`whitby-east-cliff.webp`:** St Mary's churchyard on the East Cliff. Far left: the huge ruined Gothic arches of Whitby Abbey against the sky, taking up the left quarter. Centre-left: weathered, leaning gravestones in rough grass. Centre: an empty wooden bench facing out to sea. Right: the top of a long stone staircase winding down off the right edge, with red-roofed old-town houses, chimney smoke and a harbour full of tall masts far below; the sea beyond. Open grassy path along the bottom third.
  - **`whitby-old-town.webp`:** Church Street in Whitby's old town, cobbled and narrow. Far left: the foot of a long stone staircase climbing up and out of frame. Centre-left: a Victorian pawnbroker's shop with three brass balls hanging over the door and a window crowded with second-hand odds and ends. Centre: a small jet workshop with a bay window of black glossy jewellery. Centre-right: a tarred wooden smokehouse with smoke drifting from roof vents and a dark open doorway glowing warm inside. Far right: the street opening out towards the harbour. Cobbles along the bottom third.
  - **`whitby-bridge.webp`:** The old swing bridge over the River Esk, crossing the middle of the picture. Far left: the end of a cobbled quay leading back into town. Left: fishing nets hung over the quay railing to dry. Centre: a small wooden keeper's hut on the bridge with a brass bell and a big iron lever. Upper centre-right: a moored two-masted schooner with stacked wooden crates on the quay beside it. Far right: a road climbing up the far bank towards grand buildings on a cliff. The Abbey ruins tiny on the clifftop in the distance. Quay stones along the bottom third.
  - **`whitby-west-cliff.webp`:** The smart West Cliff. Far left: a path dropping away downhill. Left: a tall arch made of two whale jawbones, framing the sea. Centre: a grand Victorian seaside hotel with bay windows and flags, and a gate in iron railings in front of its door. Right: the hotel's terrace behind the same railings, with a plain dining table and chairs, and the cliff edge and sea beyond. A neat promenade along the bottom third.
  - **Added in the rework (done):** two more backgrounds and one more cut-out, same chat and style.
    - **`whitby-smokehouse.webp`:** inside a low, dark, tarred-wood smokehouse, hot and smoky with orange firelight. Far left: an open wooden door showing a slice of bright street. Top centre, across most of the width: rows of golden herring hanging from wooden racks in the smoke. Centre, low down: a wide pit of glowing oak chips. Right: a stack of salt barrels, one with a blank sign. Open earth floor along the bottom.
    - **`whitby-parlour.webp`:** a grand, stuffy Victorian hotel parlour, warm lamplight. Far left: tall French windows onto a sunny terrace. Left of centre: an empty high-backed wing chair. Upper centre: bookshelves of leather-bound books. Centre right: a big marble fireplace, fire blazing. Centre, lower down: a long polished dining table with a single vase on it. Right: open floor space by velvet curtains. Patterned carpet along the bottom.
    - **Lady Cholmondeley (`lady.png`), sitting:** a very elderly, very grand Victorian lady fast asleep, as if in an armchair (no chair), mouth open, in black silk dripping with jet jewellery, a lace cap, hands folded on a walking cane.
  - **People and the dog, as separate cut-outs** (same chat, full body, plain light grey background, like the brothers): Bram Stoker (big, red-bearded, 1890 tweed, notebook); an ancient sailor with a white beard and clay pipe; a huge black dog with red eyes, sitting; a fishwife in a shawl and big apron; a fisherman in a knitted gansey; a paperboy in a big cap with a newspaper bag; a hotel doorman in a coat covered in brass buttons; a young gentleman in a striped blazer and straw boater. Files: `stoker.png`, `sailor.png`, `black-dog.png`, `fishwife.png`, `fisherman.png`, `paperboy.png`, `doorman.png`, `algernon.png`. Until a cut-out exists, the game draws a labelled box where that person stands, even over a painted background. **Done** (made in ChatGPT): all eight are in `art/`. Their style, painterly caricature with soft outlines, is the target for the backgrounds too.

- **Chapter 2, Goodmanham, AD 627 (to do, by Rob in ChatGPT, in the same chat as the earlier art).** Five backgrounds, a breezy grey-gold day on the chalk Wolds, early spring. Each prompt describes the scene as Jack first finds it.
  - **`goodmanham-wolds.webp`:** a rolling chalk hillside on the Yorkshire Wolds under a huge sky. Left quarter: a large grassy burial mound with a low doorway of standing stones, black inside. Centre: open close-cropped grass with a few gorse bushes. Centre-right: a small low hut built of turf, smoke curling from its roof, bunches of herbs and little bone charms hanging round the door, and a leather bag hanging on a peg by the door. Far right: a path dropping down the hill, with a big timber hall and its thatched roof small in the valley below. Open grass along the bottom third.
  - **`goodmanham-yard.webp`:** a muddy yard in front of a huge Anglo-Saxon timber hall. Far left: a track climbing out of frame. Left: an open-fronted wooden stable with a turf roof (no horses). Centre: the hall's great carved double door, with a steep thatched roof above it and the gable ends carved like beasts; beside the door, an empty wooden weapon rack. Centre-right: a cooking pit of glowing coals with an empty iron spit over it. Far right: a fork in the track, one way up to a fenced rise, the other down towards a river. Trampled mud along the bottom third.
  - **`goodmanham-hall.webp`:** inside a long, smoky Anglo-Saxon mead hall, firelit and warm. Far left: the open main door, daylight outside. Top, across the width: dark smoke-blackened rafters and roof beams. Left: a long table with an empty wooden platter. Centre back: a carved high seat on a low dais, empty. Centre, low down: a long open hearth running down the hall. Centre right: an open wooden chest spilling gold arm rings and brooches. Far right: a second, smaller door at the end of the hall, shut, with a heavy wooden bar across it. Rushes strewn on the floor along the bottom third.
  - **`goodmanham-temple.webp`:** a pagan Anglo-Saxon temple on a rise, inside a wooden fence. Far left: a track leading down out of frame. Left: a row of three tall carved wooden idols with staring eyes, one holding a hammer, one holding a spear shaft with no head. Centre: a timber temple building with dragon-head carvings on its gables and an open doorway. Centre right: a low stone altar heaped with offerings of bread and cheese. Far right: a grove of ancient twisted trees hung with ribbons. Open grass along the bottom third.
  - **`goodmanham-river.webp`:** a slow, quiet river between reeds and willows. Far left: a muddy track leading up out of frame. Left: a big weeping willow trailing into the water. Centre: the river running across the middle of the picture, with a tall plain wooden cross stuck in the near bank. Right: tall reed beds, with a grey heron standing among them. Grassy, muddy riverbank along the bottom third.
  - **People and animals, as separate cut-outs** (same chat, full body, plain light grey background, like the brothers, in Anglo-Saxon dress of the 600s): a thin young shepherd lad holding a crook, with a sling tucked in his belt (`ecca.png`); an old wise woman in a dark hooded cloak with bright eyes and bone charms (`gytha.png`); a black cat, curled up (`cat.png`); a huge bearded door-ward leaning on an axe (`wulf.png`); a big red-faced cook with forearms like hams (`cook.png`); a wiry groom with straw in his hair (`groom.png`); King Edwin, seated, gold arm rings and a gold belt (`edwin.png`); Queen Æthelburh, holding a big gold cup (`queen.png`); a white-bearded old counsellor with a drinking horn (`osric.png`); Coifi, a pagan high priest in plain robes, unarmed (`coifi.png`); Paulinus, a tall, thin Roman missionary with a hooked nose, in dark robes, wet to the knee (`paulinus.png`); a big black stallion (`stallion.png`); a small grey mare (`mare.png`). Until a cut-out exists, the game draws a labelled box where that person or animal stands.

- **Chapter 3, Hull, January 1906 (done, by Rob in ChatGPT).** Six backgrounds, a freezing grey winter day, low pale sun, breath in the air. Each prompt describes the scene as Rob first finds it. No people, no text, all signs blank.
  - **`hull-market.webp`:** Hull's old Market Place. Far left: a street leading off towards a railway station. Left: a narrow alley with a crooked old timber-framed pub at the end of it. Centre, high up: a gilded statue of a king on a golden horse on a tall plinth. Centre, below it: a newspaper office with a big plate-glass window. Centre-right: an empty iron bench. Right: a public hall with blank posters on its walls and steps up to the door. Far right: a road leading away out of town. Cobbles along the bottom third.
  - **`hull-pub.webp`:** inside a very old, crooked pub: low black beams, a low doorway, a small fire. Far left: the door out. Left, on the wall: a framed photograph of a football team, too small to read. Centre: a bar with beer pumps. Right of the bar, in the floorboards: a wooden trapdoor with no ring. Far right: a low door to a back room with a blank painted sign above it. Floorboards along the bottom.
  - **`hull-cellar.webp`:** a stone pub cellar, seen in the glow of one light. Far left: stone steps going up. Centre: one big wooden beer barrel lying on its side across the floor. Right: wooden racks of barrels against the wall. Top left: heavy cobwebs. Far right, low down: an empty barrel. Stone floor along the bottom. (The game covers it in darkness at first.)
  - **`hull-office.webp`:** an Edwardian newsroom, smoky and lamplit. Far left: the door out. Left of centre: a metal spike on a desk, stacked with paper. Centre: a big desk with a green lamp and piles of copy, and an empty chair. Right: a wide internal window onto big printing presses. Wooden floor along the bottom.
  - **`hull-boulevard.webp`:** outside an early football ground in winter. Far left: the road back to town. Left: a wooden turnstile gate in the wall. Centre and right: a long brick wall about head height, with broken glass set along the top, and the tops of a crowded stand visible beyond it. Far right: a lamp post. Pavement along the bottom third.
  - **`hull-station.webp`:** a huge arched Edwardian railway station roof, full of steam and pale light. Far left: the way out. Left: a ticket window with a brass grille. Centre: a big board of fares with blank lettering. Right: a big green steam engine and carriages at the platform. Platform along the bottom third.
  - Claude touched up one background so it fits the game, and cut 2 overlays from it. The people and props below are all in. The steward and the clerk never move, so they're painted into their backgrounds rather than drawn as separate pictures.
  - **People, as separate cut-outs** (full body, plain light grey background, like the brothers, in Edwardian winter clothes): a woman in a shawl and hat sitting reading a yellow book (`reader.png`); a gruff pub landlord in an apron (`landlord.png`); a newspaper editor in shirtsleeves and waistcoat with a pencil (`editor.png`); a gateman with a cash box (`gateman.png`); a small boy in a big cap and scarf (`boy.png`); a steward with a rosette and a pencil behind his ear (`steward.png`); a railway ticket clerk in a cap (`clerk.png`); a large black cat sitting (`hull-cat.png`).
  - **Props** (plain light grey background): a black bicycle leaning (`bicycle.png`); a wooden plank (`plank.png`); an open trapdoor showing steps going down (`trapdoor-open.png`).
- **Painted props (done, from Rob):** Rob's soapbox (prologue), the newspaper net (Chapter 1), and a few Chapter 2 props and overlays. Where a painted thing changes during play, Rob made edits of the background with only that part changed, and Claude crops it in as a sprite. Files are named neutrally (`goodmanham-overlay-1.png`, `goodmanham-prop-1.png`) so the art folder gives nothing away. A picture in `art/` always wins over the code-drawn version, which stays as the fallback.

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
