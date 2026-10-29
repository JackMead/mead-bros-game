import type { Chapter } from '../types';

/**
 * SPOILERS: this file is the puzzle solutions.
 * If you haven't played the Prologue yet, play it first.
 */
export const prologue: Chapter = {
  id: 'prologue',
  number: 0,
  title: 'The Selfie',
  author: 'Rob (story) and Claude (puzzles)',
  era: 'Present day',
  place: "Mother Shipton's Cave, Knaresborough",
  brothers: ['rob', 'jack', 'phil'],
  start: {
    scene: 'well',
    brother: 'rob',
    inventory: { rob: ['soapbox'], jack: ['wallet'], phil: ['phone'] },
  },
  extras: {
    maureen: { name: 'Maureen', colour: '#e07a9a' },
    dog: { name: 'Labrador', colour: '#d9b26a' },
    shipton: { name: 'Mother Shipton', colour: '#b48ce0' },
  },
  intro: [
    "Knaresborough, North Yorkshire. Mother Shipton's Cave: England's oldest visitor attraction, open since 1630.",
    'The three Mead brothers are having a day out.',
    'Mum has asked for one thing: a photo of all three of them in front of the Petrifying Well.',
    'How hard can it be?',
    'Tap a thing to use it. Hold it (or right-click) to look at it. Tap a brother below to play as him. Tap an item, then a thing, to use them together.',
  ],
  items: {
    soapbox: {
      name: 'Soapbox',
      look: {
        rob: 'My soapbox. For when the world needs to hear what I think, which is always.',
        any: "Rob's soapbox. Nobody else touches the soapbox.",
      },
    },
    phone: {
      name: "Phil's phone",
      look: {
        phil: "My phone. The only one of ours with any battery. Rob's died arguing with strangers online in the car.",
        any: "Phil's phone. Locked. Only Phil knows the PIN.",
      },
    },
    wallet: {
      name: "Jack's wallet",
      look: {
        jack: 'My wallet. Two pound twenty in coins. Cash is still king.',
        any: "Jack's wallet. Two pound twenty in coins. Jack's always the one with cash.",
      },
    },
    tea: {
      name: 'Cup of tea',
      look: 'A proper Yorkshire tea. Too hot to drink yet. Lovely for warming your hands on.',
    },
    pork_pie: {
      name: 'Pork pie',
      look: {
        jack: "A pork pie. I'm holding it at arm's length.",
        any: 'A pork pie. Glistening.',
      },
    },
  },
  scenes: {
    well: {
      name: 'The Petrifying Well',
      description:
        "A damp gorge by the river. Water pours over a rock face hung with things slowly turning to stone. A tea kiosk, a statue and a selfie sign.",
      background: 'prologue-well.png',
      placeholder: { top: '#2f4034', bottom: '#5d5140' },
      hotspots: [
        {
          id: 'well',
          name: 'Petrifying Well',
          rect: { x: 30, y: 30, w: 290, h: 330 },
          colour: '#4f7a8a',
          look: "The Petrifying Well. Water pours over the rock and turns anything left in it to stone. Teddy bears, a top hat and Agatha Christie's handbag hang in the flow, halfway to being statues.",
        },
        {
          id: 'statue',
          name: 'Mother Shipton statue',
          rect: { x: 350, y: 70, w: 80, h: 220 },
          colour: '#8a8a8a',
          look: 'A statue of Mother Shipton, the prophetess, born in this very cave in 1488. Hooked nose, pointy chin, excellent eyebrows.',
        },
        {
          id: 'kiosk',
          name: 'Tea kiosk',
          rect: { x: 700, y: 100, w: 230, h: 230 },
          colour: '#b8483f',
          look: 'A little tea kiosk. Maureen is behind the counter, doing the crossword. A sign says CASH ONLY.',
        },
        {
          id: 'board',
          name: 'Price board',
          rect: { x: 725, y: 125, w: 180, h: 70 },
          colour: '#2b2b2b',
          look: {
            any: 'A chalk board. TEA £2.50. PORK PIE £1.80. MEAL DEAL, TEA AND A PORK PIE: £2.00. CASH ONLY. Lots of numbers. Jack would enjoy this.',
            jack: 'TEA £2.50. PORK PIE £1.80. MEAL DEAL, TEA AND A PORK PIE: £2.00. So tea on its own costs more than tea with a pie. The pork pie is worth minus fifty pence. I love Yorkshire.',
          },
        },
        {
          id: 'sign',
          name: 'Selfie spot',
          rect: { x: 465, y: 240, w: 120, h: 70 },
          colour: '#b5834a',
          look: 'A painted sign: BEST SELFIE SPOT! GET THE WELL IN THE BACKGROUND! Painted footprints on the ground in front of it.',
        },
        {
          id: 'dog',
          name: 'Labrador',
          rect: { x: 475, y: 320, w: 100, h: 60 },
          colour: '#c99a4b',
          shape: 'ellipse',
          if: '!dog_gone',
          look: {
            any: "A Labrador, sat exactly on the selfie spot's footprints. Its eyes keep drifting to the tea kiosk.",
            jack: 'A Labrador, sat exactly on the selfie spot. Statistically, Labradors will eat anything. Anything at all.',
          },
        },
        {
          id: 'soapbox_spot',
          name: "Rob's soapbox",
          rect: { x: 495, y: 360, w: 60, h: 36 },
          colour: '#8a6a3f',
          if: 'soapbox_placed',
          look: 'The soapbox, on the selfie spot, with Rob on it.',
        },
      ],
      stand: {
        rob: [{ x: 525, y: 360, if: 'soapbox_placed' }, { x: 380, y: 440 }],
        jack: [{ x: 610, y: 440 }],
        phil: [{ x: 660, y: 440 }],
      },
    },
  },
  rules: [
    // The tea kiosk.
    { on: 'kiosk', if: 'bought_deal', say: ['Maureen: Enjoy your pie, love.'] },
    {
      on: 'kiosk',
      say: ['Maureen: What can I get you, love?'],
      choices: [
        {
          label: 'One tea, please.',
          if: 'has:wallet',
          say: ['Maureen: Two pound fifty, love.', "Me: I've only got two pound twenty.", "Maureen: Then you've only got no tea."],
        },
        {
          label: 'One tea, please.',
          if: '!has:wallet',
          say: ['Maureen: Two pound fifty, love. Cash only.', "Me: I've only got a card. Who's got the cash?"],
        },
        {
          label: 'The meal deal, please.',
          if: 'has:wallet',
          say: [
            "Maureen: Tea and a pork pie, two pound. Don't ask me how, love, I just work here.",
            'Maureen hands over a steaming tea and a pork pie.',
          ],
          do: ['give:tea', 'give:pork_pie', 'set:bought_deal'],
        },
        {
          label: 'The meal deal, please.',
          if: '!has:wallet',
          say: ['Maureen: Two pound. Cash only, love.', "Me: I've only got a card. Who's got the cash?"],
        },
        {
          label: 'Just a pork pie, please.',
          say: ['Maureen: One pound eighty.', 'Me: Actually, on its own that seems poor value. Never mind.'],
        },
        { label: 'Nothing, thanks.', say: ['Maureen: Suit yourself, love.'] },
      ],
    },
    { look: 'wallet', if: 'bought_deal', say: ['Me: Twenty pence left. Worth it.'] },

    // Phil's freezing hands, and his locked phone.
    {
      on: 'phil',
      item: 'tea',
      say: [
        'Phil wraps his hands round the tea.',
        "Phil: Oh. Oh, that's lovely. I can feel my fingers again.",
        'Phil drinks it in one go. Nobody knows how.',
      ],
      do: ['take:tea', 'set:phil_warm'],
    },
    { on: 'rob', item: 'tea', say: ["Rob: I'm not cold. Phil's the one with hands like fish fingers."] },
    { on: 'jack', item: 'tea', say: ["Jack: I'm toasty. Phil's the one turning blue."] },
    { on: 'dog', item: 'tea', say: ["Me: Dogs don't drink tea. Not even Yorkshire dogs."] },
    {
      on: '*',
      item: 'phone',
      by: 'phil',
      if: 'phil_warm !phone_unlocked',
      say: ['Phil taps in his PIN. The phone unlocks.', 'Me: Fingers are back in business.'],
      do: ['set:phone_unlocked'],
    },
    {
      on: '*',
      item: 'phone',
      by: 'phil',
      if: '!phone_unlocked',
      say: ["Me: My fingers are too cold. The screen won't even notice I'm touching it. Can't unlock it."],
    },
    { on: 'phil', item: 'phone', if: '!phone_unlocked', say: ['Me: Here, Phil. You unlock it.'], do: ['give:phone>phil'] },
    { on: '*', item: 'phone', if: '!phone_unlocked', say: ["Me: It's locked. Only Phil knows the PIN, and he's not telling."] },

    // The selfie itself.
    { on: 'well', item: 'phone', say: ["Me: Not from here. There's a proper selfie spot for this."] },
    {
      on: 'sign',
      item: 'phone',
      if: '!dog_gone',
      say: ["Me: There's a Labrador sat right on the selfie spot. Mum might want a dog in the photo, but not instead of us."],
    },
    {
      on: 'sign',
      item: 'phone',
      by: 'rob',
      if: 'soapbox_placed',
      say: [
        'Rob holds the phone high. Three brothers, one well, perfect light.',
        'Rob: Everyone say "Ey up!"',
      ],
      do: ['set:selfie_taken'],
    },
    { on: 'sign', item: 'phone', by: 'rob', say: ["Me: Even at full stretch I can't get the well in behind us. I need to be higher up."] },
    {
      on: 'sign',
      item: 'phone',
      by: 'phil',
      say: ["Me: My arms aren't long enough. I've got Rob's chin, a lot of railing and no well. Someone taller should do this."],
    },
    { on: 'sign', item: 'phone', by: 'jack', say: ['Me: My arms are exactly average. Someone taller should do this.'] },

    // The Labrador.
    {
      on: 'dog',
      item: 'pork_pie',
      say: ['The Labrador inhales the pork pie in one bite.', 'Dog: Wuff.', 'It trots off towards the car park to look for more.'],
      do: ['take:pork_pie', 'set:dog_gone'],
    },
    { on: 'jack', item: 'pork_pie', say: ["Jack: Get that away from me. I'm a vegetarian."] },
    { on: 'rob', item: 'pork_pie', by: 'rob', say: ['Me: Tempting. But somebody round here looks hungrier than me.'] },
    { on: 'phil', item: 'pork_pie', by: 'phil', say: ['Me: Tempting. But somebody round here looks hungrier than me.'] },
    { on: 'dog', say: ['Me: Come on, shift.', 'Dog: ...', "The Labrador doesn't move. It's staring at the tea kiosk, drooling."] },

    // Rob's soapbox.
    { on: 'sign', item: 'soapbox', if: '!dog_gone', say: ["Me: Can't. There's a Labrador on the spot."] },
    {
      on: 'sign',
      item: 'soapbox',
      say: [
        'Rob plants his soapbox on the selfie spot and climbs up.',
        "Rob: While I'm up here, a few words on the price of parking at tourist attractions...",
        'Jack: Rob.',
        "Rob: ...and don't get me started on self-service tills...",
        'Phil: ROB.',
        'Rob: Fine. But I am staying up here.',
      ],
      do: ['take:soapbox', 'set:soapbox_placed'],
    },
    { on: 'jack', item: 'soapbox', say: ["Jack: I'm not touching that. Nobody touches the soapbox."] },
    { on: 'phil', item: 'soapbox', say: ["Phil: I'm not touching that. Nobody touches the soapbox."] },
    { on: '*', item: 'soapbox', say: ['Me: Not here. The acoustics are all wrong.'] },
    { on: 'soapbox_spot', by: 'rob', say: ["Me: And ANOTHER thing about this country's attitude to queueing..."] },
    { on: 'soapbox_spot', say: ["Me: Please don't encourage him."] },

    // Scenery.
    { on: 'sign', if: '!dog_gone', say: ["Me: The perfect spot. Except there's a Labrador sat on it."] },
    { on: 'sign', say: ['Me: The perfect spot. Now we just need a camera, and someone to hold it.'] },
    { on: 'well', say: ["Me: Better not touch it. Things that touch the well turn to stone. That's sort of the point of it."] },
    { on: 'statue', say: ["Me: The plaque says she predicted the future. Bet she didn't predict us."] },
  ],
  puzzles: [
    { id: 'p1', label: 'Puzzle 1', solved: 'phil_warm' },
    { id: 'p2', label: 'Puzzle 2', solved: 'dog_gone' },
    { id: 'p3', label: 'Puzzle 3', solved: 'soapbox_placed' },
  ],
  goal: 'selfie_taken',
  ending: [
    'Click.',
    'In the photo, behind the three brothers, there is a fourth face. Hooked nose. Pointy chin. Excellent eyebrows.',
    'Water stops pouring over the well. It hangs in the air. A woman in a soaking black shawl steps out of the rock.',
    "Shipton: Three brothers. One picture. And not a place in it for me?",
    "Rob: Sorry, love. It's brothers only.",
    "Jack: It's a family tradition. Statistically.",
    "Phil: Also, you're dripping on my shoes.",
    'Shipton: Brothers only, is it? Then brothers ALONE ye shall be.',
    "Shipton: Three that would not share the frame / through Yorkshire's years shall scatter wide.",
    'Shipton: No county bound ye cross, no home ye claim, / till three again stand side by side.',
    'The well roars. Every petrified teddy bear turns its head. Everything goes white.',
    'When the light fades, the selfie spot is empty.',
    'To be continued. Chapter 1 is waiting for its author.',
  ],
};
