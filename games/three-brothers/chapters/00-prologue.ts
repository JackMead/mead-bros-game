import type { Chapter, Choice } from '../types';

/**
 * SPOILERS: this file is the puzzle solutions.
 * If you haven't played the Prologue yet, play it first.
 */

/** What Maureen sells. */
const kioskMenu: Choice[] = [
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
    if: 'has:wallet',
    say: ['Maureen: One pound eighty.', "Me: A pork pie on its own? With what's on that board? Never mind."],
  },
  {
    label: 'Just a pork pie, please.',
    if: '!has:wallet',
    say: ['Maureen: One pound eighty. Cash only.', "Me: I've only got a card. Who's got the cash?"],
  },
  { label: 'Nothing, thanks.', say: ['Maureen: Suit yourself, love.'] },
];

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
    maureen: { name: 'Maureen', colour: '#f08fb0', at: { x: 850, y: 135 } },
    dog: { name: 'Labrador', colour: '#e8c27a', at: { x: 545, y: 250 } },
    shipton: { name: 'Mother Shipton', colour: '#d6b0ff', at: { x: 447, y: 92 } },
  },
  intro: [
    "Knaresborough, North Yorkshire. Mother Shipton's Cave: England's oldest visitor attraction, open since 1630.",
    'The three Mead brothers are having a day out.',
    'Mum has asked for one thing: a photo of all three of them in front of the Petrifying Well.',
    'How hard can it be?',
    'Tap a thing to use it, or a brother to talk to him. Hold (or right-click) to look. Tap a portrait at the bottom to play as that brother. Tap an item, then a thing, to use them together.',
  ],
  items: {
    soapbox: {
      name: 'Soapbox',
      icon: 'soapbox',
      look: {
        rob: 'My soapbox. For when the world needs to hear what I think, which is always.',
        any: "Rob's soapbox. Nobody else touches the soapbox.",
      },
    },
    phone: {
      name: "Phil's phone",
      icon: 'phone',
      look: {
        phil: "My phone. The only one of ours with any battery. Rob's died arguing with strangers online in the car.",
        any: "Phil's phone. Locked. Only Phil knows the PIN.",
      },
    },
    wallet: {
      name: "Jack's wallet",
      icon: 'wallet',
      look: {
        jack: 'My wallet. Two pound twenty in coins. Cash is still king.',
        any: "Jack's wallet. Two pound twenty in coins. Jack's always the one with cash.",
      },
    },
    tea: {
      name: 'Cup of tea',
      icon: 'tea',
      look: 'A proper Yorkshire tea. Too hot to drink yet. Lovely for warming your hands on.',
    },
    pork_pie: {
      name: 'Pork pie',
      icon: 'pie',
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
        "A sunny gorge above the River Nidd, with the railway viaduct beyond. Water pours over a rock face hung with things slowly turning to stone. A tea kiosk, a statue and a selfie sign.",
      background: 'prologue-well.webp',
      placeholder: { top: '#2f4034', bottom: '#5d5140' },
      hotspots: [
        {
          id: 'well',
          name: 'Petrifying Well',
          rect: { x: 20, y: 20, w: 260, h: 290 },
          colour: '#4f7a8a',
          prop: 'water',
          look: "The Petrifying Well. Water pours over the rock and turns anything left in it to stone. Teddy bears, a top hat and Agatha Christie's handbag hang in the flow, halfway to being statues.",
        },
        {
          id: 'statue',
          name: 'Mother Shipton statue',
          rect: { x: 340, y: 85, w: 110, h: 240 },
          colour: '#8a8a8a',
          // Traced round the painted statue (not the plinth), for the closing scene.
          outline: [395, 86, 425, 89, 433, 117, 425, 132, 426, 152, 422, 182, 426, 226, 431, 261, 352, 261, 352, 212, 359, 166, 372, 132, 378, 108, 386, 94],
          look: 'A statue of Mother Shipton, the prophetess, born in this very cave in 1488. Hooked nose, pointy chin, excellent eyebrows.',
        },
        {
          id: 'viaduct',
          name: 'Railway viaduct',
          rect: { x: 574, y: 100, w: 166, h: 90 },
          colour: '#9a8a70',
          look: "Knaresborough's railway viaduct over the River Nidd. The first one fell down in 1848, before it was even finished. They built this one in 1851. Yorkshire perseverance.",
        },
        {
          id: 'kiosk',
          name: 'Tea kiosk',
          rect: { x: 748, y: 60, w: 212, h: 285 },
          colour: '#b8483f',
          look: 'A little tea kiosk. Maureen is behind the counter, doing the crossword. A sign says CASH ONLY.',
        },
        {
          id: 'board',
          name: 'Price board',
          rect: { x: 868, y: 254, w: 64, h: 84 },
          colour: '#2b2b2b',
          prop: 'chalkboard',
          text: ['TEA £2.50', 'PIE £1.80', 'DEAL £2', 'tea + pie', 'CASH ONLY'],
          look: {
            any: 'A chalk board. TEA £2.50. PORK PIE £1.80. MEAL DEAL, TEA AND A PORK PIE: £2.00. CASH ONLY. Lots of numbers. Jack would enjoy this.',
            jack: 'TEA £2.50. PORK PIE £1.80. MEAL DEAL, TEA AND A PORK PIE: £2.00. So tea on its own costs more than tea with a pie. The pork pie is worth minus fifty pence. I love Yorkshire.',
          },
        },
        {
          id: 'sign',
          name: 'Selfie spot',
          rect: { x: 477, y: 178, w: 106, h: 46 },
          colour: '#b5834a',
          prop: 'sign',
          text: ['BEST SELFIE SPOT!', 'Get the well in!'],
          look: 'A painted sign: BEST SELFIE SPOT! GET THE WELL IN THE BACKGROUND! Painted footprints on the ground in front of it.',
        },
        {
          id: 'dog',
          name: 'Labrador',
          rect: { x: 500, y: 262, w: 100, h: 88 },
          colour: '#c99a4b',
          prop: 'dog',
          if: '!dog_gone',
          look: {
            any: "A Labrador, sat exactly on the selfie spot's footprints. Its eyes keep drifting to the tea kiosk.",
            jack: 'A Labrador, sat exactly on the selfie spot. Statistically, Labradors will eat anything. Anything at all.',
          },
        },
        {
          id: 'soapbox_spot',
          name: "Rob's soapbox",
          rect: { x: 500, y: 322, w: 60, h: 36 },
          colour: '#8a6a3f',
          prop: 'soapbox',
          if: 'soapbox_placed',
          look: 'The soapbox, on the selfie spot, with Rob on it.',
        },
      ],
      stand: {
        rob: [{ x: 530, y: 324, if: 'soapbox_placed', pose: 'rant' }, { x: 300, y: 440 }],
        jack: [{ x: 650, y: 444 }],
        phil: [{ x: 712, y: 438 }],
      },
    },
  },
  rules: [
    // The tea kiosk.
    { on: 'kiosk', if: 'bought_deal', say: ['Maureen: Enjoy your pie, love.'] },
    {
      on: 'kiosk',
      say: ['Maureen: What can I get you, love?'],
      choices: kioskMenu,
    },
    { on: 'kiosk', item: 'wallet', if: '!bought_deal', say: ["Maureen: Put your money away, love. What are you having?"], choices: kioskMenu },
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
    { on: 'dog', item: 'soapbox', say: ["Me: I'm not standing on a dog. I have principles. Several."] },
    { on: 'statue', item: 'soapbox', say: ["Me: She's had her turn on a pedestal."] },
    { on: '*', item: 'soapbox', say: ['Me: Not here. The acoustics are all wrong.'] },
    { on: 'soapbox_spot', by: 'rob', say: ["Me: And ANOTHER thing about this country's attitude to queueing..."] },
    { on: 'soapbox_spot', say: ["Me: Please don't encourage him."] },

    // Talking to each other.
    { on: 'jack', if: '!bought_deal', say: ["Jack: If anything needs paying for, I've got cash. Somebody in this family has to."] },
    { on: 'jack', say: ["Jack: I'm still doing the maths on that pie."] },
    { on: 'phil', if: '!phil_warm', say: ["Phil: I can't feel my fingers. I'd do anything for something hot."] },
    { on: 'phil', if: 'phone_unlocked', say: ["Phil: Phone's unlocked. Just don't look at my photos."] },
    { on: 'phil', say: ['Phil: Fingers: working. Phone: still locked, until I do something about it.'] },
    { on: 'rob', if: 'soapbox_placed', say: ["Rob: I'm not getting down. The view's lovely and so are my opinions."] },
    { on: 'rob', say: ["Rob: Have I told you my views on car parks? I'm the tallest, so they carry further."] },

    // Scenery.
    { on: 'sign', if: '!dog_gone', say: ["Me: The perfect spot. Except there's a Labrador sat on it."] },
    { on: 'sign', if: 'phone_unlocked', say: ["Me: The perfect spot. Whoever's got the phone should try it here."] },
    { on: 'sign', say: ['Me: The perfect spot. Now we just need a camera, and someone to hold it.'] },
    { on: 'well', say: ["Me: Better not touch it. Things that touch the well turn to stone. That's sort of the point of it."] },
    { on: 'viaduct', say: ["Me: It's miles away, over the river. Lovely, though."] },
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
    '[flash]',
    'In the photo, behind the three brothers, there is a fourth face. Hooked nose. Pointy chin. Excellent eyebrows.',
    '[freeze]',
    '[shake 1.5]',
    'The water stops falling. It hangs in the air, glittering.',
    '[awaken statue 55 35]',
    'The statue shudders, and something steps out of the stone: Mother Shipton herself, glowing, and dripping wet.',
    "Shipton: Three brothers. One picture. And not a place in it for me?",
    "Rob: Sorry, love. It's brothers only.",
    "Jack: It's a family tradition. Statistically.",
    "Phil: Also, you're dripping on my shoes.",
    'Shipton: Brothers only, is it? Then brothers ALONE ye shall be.',
    '[turn-head 59 106 18]',
    '[turn-head 214 139 14]',
    "Shipton: Three that would not share the frame / through Yorkshire's years shall scatter wide.",
    'Shipton: No county bound ye cross, no home ye claim, / till three again stand side by side.',
    '[shake 3]',
    '[vortex 165 190]',
    'The well roars open. Every petrified teddy bear has turned to watch.',
    '[pull rob]',
    '[pull jack]',
    '[pull phil]',
    '[streaks]',
    '[flash]',
    '[clear]',
    '[place phone 572 392 34]',
    'When the light fades, the selfie spot is empty. Just a phone on the gravel, still showing the photo.',
    'To be continued. Chapter 1 is waiting for its author.',
  ],
};
