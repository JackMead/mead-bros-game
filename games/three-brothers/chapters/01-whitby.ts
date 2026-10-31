import type { Chapter, Choice, Rule } from '../types';

/**
 * SPOILERS: this file is the puzzle solutions.
 * If you haven't played Chapter 1 yet, play it first.
 */

/** Phil's four monster cards. Each one ends up somewhere different. */
const CARDS = ['card_salamander', 'card_crab', 'card_bat', 'card_dragon'] as const;

/** The same reaction to any of Phil's cards. */
function anyCard(rule: Omit<Rule, 'item'>): Rule[] {
  return CARDS.map((item) => ({ ...rule, item }));
}

/** Talking to Hobbs, the doorman, once Phil is dressed for it. */
const doormanChoices: Choice[] = [
  {
    label: 'Alright, mate. Can I nip in?',
    say: [
      "Doorman: 'Mate', sir? Nip?",
      "Doorman: A gentleman doesn't ask a doorman for anything, sir. He informs him.",
    ],
  },
  {
    label: "I'm staying here. Room twelve.",
    say: ['Doorman: Room twelve is Lady Cholmondeley, sir.', 'Doorman: You are not Lady Cholmondeley.', 'Me: Not today, no.'],
  },
  {
    label: "Young man. I'm expected on the terrace.",
    if: '!heard_ball_lost !heard_jeweller',
    say: [
      'Doorman: Very good, sir. Expected by whom?',
      'Me: By... the terrace.',
      "Doorman: The terrace doesn't expect anybody, sir. Guests do. Which guest?",
      "Me: I'll come back.",
    ],
  },
  {
    label: 'Young man. Algy is expecting me.',
    if: 'heard_ball_lost !heard_jeweller',
    say: [
      "Doorman: 'Algy', sir? I'm sure I couldn't say who that is.",
      'Doorman: Guests here are known by their surnames, sir. A gentleman would know that. And would know the surname.',
    ],
  },
  {
    label: 'Young man. Mr Fanshawe is expecting me.',
    if: 'heard_jeweller',
    say: [
      'Doorman: Mr Fanshawe? Of course, sir. Very good, sir.',
      "Doorman: Sir's tweeds are very fine, if I may say.",
      'Hobbs opens the gate, then notices the white trainers.',
      "Doorman: And sir's... shoes?",
      'Me: American.',
      'Doorman: Ah. That explains it, sir.',
      'Phil strolls through the gate like he owns the place.',
    ],
    do: ['set:in_hotel'],
  },
  { label: 'Never mind.', say: ['Doorman: Sir.'] },
];

/** Algy, once he has a ball in front of him and Phil is through the gate. */
const wagerAsk = {
  say: [
    'Algernon: A ball! Where on earth did you find it? Splendid. A game, then.',
    "Algernon: Only I never play without a wager, old chap. Not money: I've plenty of that. Something rare. Something I couldn't simply buy.",
  ],
  do: ['set:wager_asked'],
};

/** The match itself. */
const match = {
  say: [
    'Algernon picks up a cigar-box lid. Phil unzips his bat.',
    'Algernon: Good heavens. What is THAT?',
    'Me: Carbon, young man.',
    'Phil serves. The cork float does something cork has never done before.',
    'Algernon: I say!',
    'Lady Cholmondeley wakes up, watches three points, and goes back to sleep.',
    'Twenty minutes later, half the hotel is crowded round the parlour door.',
    'Me: Eleven-two. Good game, young man.',
    'Algernon: Two? I got two?',
    'Me: I let you have the second one. I always let them have the second one.',
    'Me: And I will be keeping my dragon, thank you, young man.',
  ],
  do: ['take:float', 'set:match_won'],
};

/** Selling a card to the paperboy: the first earns a penny, the second makes it tuppence. */
function sellCard(item: string, name: string): Rule[] {
  return [
    { on: 'paperboy', item, if: 'has:tuppence', say: ["Paperboy: I've no more money, mister! You've cleaned me out!"] },
    {
      on: 'paperboy',
      item,
      if: 'has:penny',
      say: [`Paperboy: Another one! A ${name}! Here, that's my last penny.`, 'Me: Pleasure doing business, young man.'],
      do: [`take:${item}`, 'take:penny', 'give:tuppence', 'set:sold_card'],
    },
    {
      on: 'paperboy',
      item,
      say: [
        `Paperboy: A ${name}! I ain't never seen one so shiny. A penny for it?`,
        "Me: A penny. For a card that's worth... Fine. Yes. I'm a man of the world. Deal.",
      ],
      do: [`take:${item}`, 'give:penny', 'set:sold_card'],
    },
  ];
}

/** Spending a penny (or one of two). */
function spend(on: string, gets: string, flag: string, lines: string[]): Rule[] {
  return [
    { on, item: 'penny', if: `!${flag}`, say: lines, do: ['take:penny', `give:${gets}`, `set:${flag}`] },
    { on, item: 'tuppence', if: `!${flag}`, say: lines, do: ['take:tuppence', 'give:penny', `give:${gets}`, `set:${flag}`] },
  ];
}

/** Leaving the old town: the warmth in Phil's fingers doesn't survive the sea wind. */
function leaveOldTown(on: string, to: string, line: string): Rule[] {
  return [
    {
      on,
      if: 'warm_hands',
      say: [line, 'The sea wind finds Phil straight away.', "Me: And my fingers are gone again. Brilliant. It's AUGUST."],
      do: ['clear:warm_hands', `goto:${to}`],
    },
    { on, say: [line], do: [`goto:${to}`] },
  ];
}

export const whitby: Chapter = {
  id: 'whitby',
  number: 1,
  title: 'A Young Man in Whitby',
  author: 'Rob (story) and Claude (puzzles)',
  era: 'August 1890',
  place: 'Whitby',
  brothers: ['phil'],
  inDevelopment: true,
  start: {
    scene: 'east_cliff',
    brother: 'phil',
    inventory: { phil: ['card_salamander', 'card_crab', 'card_bat', 'card_dragon', 'bat'] },
  },
  extras: {
    stoker: { name: 'Bram Stoker', colour: '#c9a0dc', at: { x: 470, y: 215 } },
    sailor: { name: 'Old sailor', colour: '#7fb8d9', at: { x: 555, y: 225 } },
    dog: { name: 'Black dog', colour: '#b8443a', at: { x: 184, y: 285 } },
    fishwife: { name: 'Fishwife', colour: '#f08fb0', at: { x: 724, y: 270 } },
    pawnbroker: { name: 'Pawnbroker', colour: '#d9c27f', at: { x: 314, y: 45 } },
    jeweller: { name: 'Jeweller', colour: '#a3a3c2', at: { x: 545, y: 100 } },
    fisherman: { name: 'Fisherman', colour: '#7fd9b8', at: { x: 270, y: 280 } },
    keeper: { name: 'Bridge keeper', colour: '#e8a33d', at: { x: 445, y: 100 } },
    paperboy: { name: 'Paperboy', colour: '#f2cc2f', at: { x: 670, y: 305 } },
    doorman: { name: 'Hobbs', colour: '#d6b0ff', at: { x: 448, y: 225 } },
    algernon: { name: 'Algy', colour: '#ff9f6b', at: { x: 875, y: 200 } },
    lady: { name: 'Lady Cholmondeley', colour: '#e0b0d0', at: { x: 391, y: 200 } },
  },
  intro: [
    '[flash]',
    '[shake 1]',
    'Whitby, on the Yorkshire coast. A clifftop churchyard, the ruins of an abbey, and a long way down to the sea.',
    'A streak of light falls out of a clear sky and drops a man in joggers between the gravestones.',
    'Phil Mead gets up, brushes himself down, and looks around.',
    'Me: Right. Fine. This is all completely fine.',
    'Me: Rob? Jack? ...Anyone?',
    "Tap a thing to use it, or a person to talk to them. Hold (or right-click) to look. Tap an item, then a thing, to use them together. Tap a way out, like the steps, to go somewhere else. Tap Phil's portrait to hear what he's thinking.",
  ],
  items: {
    card_salamander: {
      name: 'Fire salamander card',
      icon: 'card-red',
      look: "A fire salamander, breathing flames. Common as anything where I'm from. I've got about nine of these at home.",
    },
    card_crab: {
      name: 'Rock crab card',
      icon: 'card-blue',
      look: 'A grumpy rock crab with one big claw. Not a good card. Not a bad card. A card.',
    },
    card_bat: {
      name: 'Purple bat card',
      icon: 'card-purple',
      look: "A purple bat with big fangs and bigger wings. Swoops in at night. I've had this one since I was nine.",
    },
    card_dragon: {
      name: 'Golden dragon card',
      icon: 'card-gold',
      look: 'A shiny golden dragon. Holographic. Mint condition. My pride and joy. There are maybe three of these in the world, and none of them in 1890.',
    },
    bat: {
      name: "Phil's bat",
      icon: 'bat',
      look: 'My table tennis bat. Proper rubber, carbon blade. It goes everywhere with me. You never know when a game might break out.',
    },
    coin: {
      name: 'Half-crown coin',
      icon: 'coin',
      look: "A big silver coin with the Queen on it. Mr Stoker said half a crown: two shillings and sixpence. I have no idea if that's a lot.",
    },
    penny: {
      name: 'Penny',
      icon: 'penny',
      look: "One big copper penny. It's the size of a biscuit. It's worth about a biscuit.",
    },
    tuppence: {
      name: 'Two pennies',
      icon: 'tuppence',
      look: 'Two big copper pennies. Tuppence. I am a man of means.',
    },
    kipper: {
      name: 'Kipper',
      icon: 'kipper',
      look: "A whole smoked herring. Golden, greasy, and looking right at me. I don't eat anything that looks back.",
    },
    float: {
      name: 'Cork float',
      icon: 'float',
      look: 'A little cork float off a herring net. Round, light and surprisingly bouncy.',
    },
    suit: {
      name: 'Tweed suit',
      icon: 'suit',
      look: 'A three-piece tweed suit, a stiff collar with four tiny brass studs, and a watch chain with no watch. It smells of mothballs and the late brother-in-law.',
    },
    gazette: {
      name: 'Whitby Gazette',
      icon: 'newspaper',
      look: "Today's Whitby Gazette. Big, stiff pages. Shipping news, a lost dog, and an advert for something called 'Liver Pills'.",
    },
  },
  scenes: {
    east_cliff: {
      name: "St Mary's churchyard",
      description:
        'A windswept churchyard on top of the East Cliff. The ruined Abbey looms on the left. Worn gravestones lean every which way. Two men sit on a bench facing the sea, and the 199 steps lead down to the old town.',
      background: 'whitby-east-cliff.webp',
      placeholder: { top: '#5d6b80', bottom: '#4f5a3f' },
      hotspots: [
        {
          id: 'abbey',
          name: 'Whitby Abbey',
          rect: { x: 10, y: 10, w: 380, h: 190 },
          colour: '#7a7466',
          look: 'Whitby Abbey. Enormous ruined arches with nothing but sky in the windows. Dozens of bats hang in the stonework, waiting for dark.',
        },
        {
          id: 'graves',
          name: 'Gravestones',
          rect: { x: 20, y: 200, w: 320, h: 130 },
          colour: '#8a8a80',
          look: "Old gravestones, worn smooth by the sea wind. Half of them say 'lost at sea'. Lovely. Very relaxing.",
        },
        {
          id: 'black_dog',
          name: 'Black dog',
          rect: { x: 150, y: 290, w: 68, h: 100 },
          colour: '#222222',
          sprite: 'black-dog.png',
          look: "A huge black dog, sat among the graves, staring at me with eyes the colour of ketchup. It has not blinked once. It doesn't look hungry. It looks like it has already eaten.",
        },
        {
          id: 'stoker',
          name: 'Bram Stoker',
          rect: { x: 430, y: 222, w: 80, h: 123 },
          colour: '#4a3a5a',
          sprite: 'stoker.png',
          look: "A big man with a red beard, scribbling in a notebook and muttering to himself. He looks like he hasn't slept in a week.",
        },
        {
          id: 'sailor',
          name: 'Old sailor',
          rect: { x: 520, y: 232, w: 71, h: 113 },
          colour: '#2f4a6b',
          sprite: 'sailor.png',
          look: 'An ancient sailor with a white beard and a clay pipe. He has the look of a man with a lot of stories and no one to tell them to.',
        },
        {
          id: 'view',
          name: 'View over Whitby',
          rect: { x: 640, y: 40, w: 315, h: 170 },
          colour: '#7f9cb0',
          look: 'Red roofs tumbling down to a harbour full of masts. Smoke from every chimney. Not a single car, phone mast or chip shop sign. Wait, no, there is a chip shop.',
        },
        {
          id: 'steps',
          name: 'Steps down to the old town',
          rect: { x: 660, y: 250, w: 260, h: 150 },
          colour: '#9a8a70',
          look: 'The 199 steps, winding down to the old town. Somebody has counted them. Jack would have counted them twice.',
        },
      ],
      stand: { phil: [{ x: 610, y: 440, if: 'got_suit', outfit: '1890' }, { x: 610, y: 440 }] },
    },
    old_town: {
      name: 'Church Street and the harbour',
      description:
        "A cobbled street in Whitby's old town, smelling of fish and smoke. A pawnbroker's, a jet workshop and a smokehouse, with a fishwife outside. The steps climb back up to the churchyard; the street runs on to the swing bridge.",
      background: 'whitby-old-town.webp',
      placeholder: { top: '#8a6a50', bottom: '#5a5048' },
      hotspots: [
        {
          id: 'steps_up',
          name: 'Steps up to the churchyard',
          rect: { x: 0, y: 60, w: 160, h: 300 },
          colour: '#9a8a70',
          look: 'The 199 steps, back up to the churchyard. My calves have opinions about this.',
        },
        {
          id: 'pawnshop',
          name: "Pawnbroker's",
          rect: { x: 192, y: 50, w: 244, h: 300 },
          colour: '#6b4a2b',
          look: "A pawnbroker's, with three brass balls over the door. The window is full of other people's things: clocks, a gramophone, a violin and a stuffed owl.",
        },
        {
          id: 'price_card',
          name: 'Price card',
          rect: { x: 285, y: 255, w: 110, h: 45 },
          colour: '#e6c890',
          prop: 'sign',
          text: ["SUIT, GENT'S", '2/6'],
          if: '!bought_suit',
          look: "A card in the window: SUIT, GENT'S, 2/6. Two-slash-six. Is that a fraction? A date? A football score?",
        },
        {
          id: 'jet',
          name: 'Jet workshop',
          rect: { x: 448, y: 105, w: 195, h: 245 },
          colour: '#2b2b33',
          look: 'A jet workshop. Black, glossy brooches and beads in the window, and a jeweller polishing away inside. Very gothic. Very Whitby.',
        },
        {
          id: 'smokehouse',
          name: 'Smokehouse',
          rect: { x: 650, y: 20, w: 150, h: 330 },
          colour: '#5a3a2a',
          look: "A smokehouse. Warm air and wood smoke roll out of the open door, and there's a fire glowing inside. Rows of herring hang in the smoke.",
        },
        {
          id: 'fishwife',
          name: 'Fishwife',
          rect: { x: 690, y: 275, w: 69, h: 130 },
          colour: '#7a3a4a',
          sprite: 'fishwife.png',
          look: 'A fishwife in a shawl and a big apron, with forearms like hams and a voice that carries to Scarborough. She sells the kippers from the smokehouse.',
        },
        {
          id: 'to_bridge',
          name: 'Way to the swing bridge',
          rect: { x: 810, y: 140, w: 145, h: 250 },
          colour: '#4f6a7a',
          look: 'Church Street runs on to the swing bridge over the river.',
        },
      ],
      stand: { phil: [{ x: 560, y: 440, if: 'got_suit', outfit: '1890' }, { x: 560, y: 440 }] },
    },
    smokehouse_in: {
      name: 'Inside the smokehouse',
      description:
        'A dark, low smokehouse, hot as an oven. A fire smoulders in a pit of oak chips, and racks of herring hang in the smoke above it, slowly turning to kippers. The door leads back out to Church Street.',
      background: 'whitby-smokehouse.webp',
      placeholder: { top: '#3a2418', bottom: '#5a3a22' },
      hotspots: [
        {
          id: 'smoke_door',
          name: 'Door to Church Street',
          rect: { x: 0, y: 20, w: 170, h: 340 },
          colour: '#8a6a50',
          look: 'The door back out to Church Street, and the sea wind.',
        },
        {
          id: 'racks',
          name: 'Racks of kippers',
          rect: { x: 240, y: 40, w: 560, h: 170 },
          colour: '#a0703a',
          look: 'Hundreds of herring hanging in rows, slowly going gold. Every single one of them is looking at me.',
        },
        {
          id: 'fire',
          name: 'Smouldering fire',
          rect: { x: 280, y: 290, w: 450, h: 80 },
          colour: '#c05a2a',
          look: 'A pit of glowing oak chips. The heat coming off it is glorious. Actual, proper heat.',
        },
        {
          id: 'barrels',
          name: 'Barrels of salt',
          rect: { x: 760, y: 120, w: 195, h: 290 },
          colour: '#7a5a3a',
          look: 'Barrels of salt for curing the herring. One has a sign on it: NOT FOR SITTING ON. It has clearly been sat on.',
        },
      ],
      stand: { phil: [{ x: 700, y: 440, if: 'got_suit', outfit: '1890' }, { x: 700, y: 440 }] },
    },
    bridge: {
      name: 'The swing bridge',
      description:
        'The swing bridge over the River Esk, joining the old town to the West Cliff. Herring nets hang drying on the quay rail, a fisherman mends them, a paperboy shouts the news and a foreign ship is moored downstream.',
      background: 'whitby-bridge.webp',
      placeholder: { top: '#6a8aa0', bottom: '#4a5a60' },
      hotspots: [
        {
          id: 'to_old_town',
          name: 'Back to the old town',
          rect: { x: 10, y: 40, w: 80, h: 150 },
          colour: '#8a6a50',
          look: 'Back to Church Street and the smell of kippers.',
        },
        {
          id: 'nets',
          name: 'Herring nets',
          rect: { x: 10, y: 250, w: 220, h: 140 },
          colour: '#6b7a5a',
          look: 'Herring nets hung over the rail to dry. All along the top edge, little round cork floats are strung like beads, to hold the net up in the water.',
        },
        {
          id: 'fisherman',
          name: 'Fisherman',
          rect: { x: 240, y: 285, w: 59, h: 135 },
          colour: '#3a5a6a',
          sprite: 'fisherman.png',
          look: 'A fisherman in a thick knitted gansey, mending nets with fingers like sausages. His stomach is rumbling so loudly I can hear it from here.',
        },
        {
          id: 'keeper',
          name: "Bridge keeper's hut",
          rect: { x: 373, y: 110, w: 145, h: 150 },
          colour: '#8a4a3a',
          look: 'A little hut on the bridge, with a bell, a big lever and a bridge keeper inside who takes the job very seriously.',
        },
        {
          id: 'ship',
          name: 'Russian schooner',
          rect: { x: 570, y: 10, w: 225, h: 215 },
          colour: '#5a4a3a',
          look: 'A Russian schooner, unloading long wooden boxes onto the quay. Boxes of earth, by the look of it. Who ships earth? Completely normal. Nothing to worry about.',
        },
        {
          id: 'paperboy',
          name: 'Paperboy',
          rect: { x: 640, y: 315, w: 63, h: 105 },
          colour: '#6a5a2a',
          sprite: 'paperboy.png',
          look: 'A small boy in a big cap with a bag of newspapers and a voice like a foghorn. There are picture cards tucked in his cap band.',
        },
        {
          id: 'to_west',
          name: 'Road up to the West Cliff',
          rect: { x: 860, y: 120, w: 95, h: 170 },
          colour: '#a08a6a',
          look: 'Over the bridge, a road climbs up to the West Cliff, where the grand hotels are. Even the seagulls look posher over there.',
        },
      ],
      stand: { phil: [{ x: 410, y: 440, if: 'got_suit', outfit: '1890' }, { x: 410, y: 440 }] },
    },
    west_cliff: {
      name: 'The West Cliff',
      description:
        'The smart side of Whitby. A whalebone arch frames the sea, and a grand hotel looks down its nose at the harbour. A doorman guards the gate in its railings, with the terrace behind.',
      background: 'whitby-west-cliff.webp',
      placeholder: { top: '#8fb0c8', bottom: '#6a7a5a' },
      hotspots: [
        {
          id: 'to_bridge2',
          name: 'Road down to the bridge',
          rect: { x: 0, y: 230, w: 62, h: 150 },
          colour: '#a08a6a',
          look: 'Back down the hill to the swing bridge and the old town.',
        },
        {
          id: 'arch',
          name: 'Whalebone arch',
          rect: { x: 66, y: 110, w: 184, h: 250 },
          colour: '#e8e0c8',
          look: 'An arch made out of the jawbones of a whale. Somebody, at some point, thought this would be nice to walk under.',
        },
        {
          id: 'hotel',
          name: 'Grand hotel',
          rect: { x: 255, y: 20, w: 375, h: 250 },
          colour: '#c8b89a',
          look: "A grand hotel: bay windows, flags, and a doorman. This is where the money stays. I feel strangely at home. Rob says I've gone posh. Rob's right.",
        },
        {
          id: 'doorman',
          name: 'Doorman',
          rect: { x: 428, y: 232, w: 40, h: 150 },
          colour: '#3a2a5a',
          sprite: 'doorman.png',
          look: 'A doorman with more brass buttons than any coat needs. He guards the gate like it owes him money.',
        },
        {
          id: 'table',
          name: 'Terrace table',
          rect: { x: 715, y: 300, w: 120, h: 60 },
          colour: '#7a5a3a',
          look: "A little table on the terrace with two cigar-box lids on it. Bats, I think. For some sort of game. It's far too small and far too windy out here for anything proper.",
        },
        {
          id: 'algernon',
          name: 'Young gentleman',
          rect: { x: 862, y: 205, w: 49, h: 128 },
          colour: '#b85a3a',
          sprite: 'algernon.png',
          if: '!challenge_accepted',
          look: 'A young gentleman in a striped blazer, peering sadly over the terrace railings at the cliff below.',
        },
      ],
      stand: { phil: [{ x: 560, y: 440, if: 'got_suit', outfit: '1890' }, { x: 560, y: 440 }] },
    },
    parlour: {
      name: 'The hotel parlour',
      description:
        'A grand, stuffy parlour: velvet curtains, a crackling fire, a long polished table, bookshelves, and an elderly lady asleep in a wing chair. French windows lead back out to the terrace.',
      background: 'whitby-parlour.webp',
      placeholder: { top: '#5a2a2a', bottom: '#6a4a3a' },
      hotspots: [
        {
          id: 'parlour_door',
          name: 'French windows',
          rect: { x: 20, y: 20, w: 165, h: 320 },
          colour: '#9ab0c0',
          look: 'French windows, back out to the terrace and the sea air.',
        },
        {
          id: 'lady',
          name: 'Sleeping lady',
          rect: { x: 350, y: 210, w: 82, h: 125 },
          colour: '#6a3a5a',
          sprite: 'lady.png',
          look: 'An elderly lady fast asleep in a wing chair, wearing most of a jet shop. Lady Cholmondeley, I assume. Of room twelve.',
        },
        {
          id: 'shelves',
          name: 'Bookshelves',
          rect: { x: 313, y: 0, w: 220, h: 185 },
          colour: '#5a3a22',
          look: "Shelves of leather-bound books with titles like 'Sermons, Volume Nine'. There are a couple of suspicious gaps.",
        },
        {
          id: 'fireplace',
          name: 'Fireplace',
          rect: { x: 560, y: 150, w: 260, h: 130 },
          colour: '#c05a2a',
          look: 'A marble fireplace with a roaring fire. A fire! In August! These are my people.',
        },
        {
          id: 'long_table',
          name: 'Long table',
          rect: { x: 310, y: 280, w: 430, h: 130 },
          colour: '#6a3a1a',
          look: 'A long polished table. Exactly table tennis size, give or take a Victorian. Nothing on it but a vase, and nothing across the middle.',
        },
        {
          id: 'net_up',
          name: 'Newspaper net',
          rect: { x: 497, y: 262, w: 60, h: 30 },
          prop: 'newspaper',
          colour: '#e8e2d0',
          if: 'net_up',
          look: 'The Whitby Gazette, folded into a stiff little wall across the middle of the table. Official tournament standard. Probably.',
        },
        {
          id: 'algy_in',
          name: 'Algy',
          rect: { x: 840, y: 290, w: 49, h: 128 },
          colour: '#b85a3a',
          sprite: 'algernon.png',
          if: 'challenge_accepted',
          look: 'Algy, in his blazer, practising forehands at nothing with a cigar-box lid.',
        },
      ],
      stand: { phil: [{ x: 790, y: 440, if: 'got_suit', outfit: '1890' }, { x: 790, y: 440 }] },
    },
  },
  rules: [
    // ---- Getting about ----
    {
      on: 'steps',
      say: ['Phil trots down the 199 steps.', 'Me: ...a hundred and ninety-eight, a hundred and ninety-nine. Jack would be so proud.'],
      do: ['goto:old_town'],
    },
    ...leaveOldTown('steps_up', 'east_cliff', 'Phil drags himself back up all 199 steps.'),
    ...leaveOldTown('to_bridge', 'bridge', 'Phil follows Church Street along the harbour to the swing bridge.'),
    { on: 'smokehouse', say: ['Phil ducks into the smokehouse.', 'Me: Oh. OH. Heat. Glorious heat.'], do: ['goto:smokehouse_in'] },
    { on: 'smoke_door', say: ['Phil steps back out onto Church Street.'], do: ['goto:old_town'] },
    { on: 'to_old_town', say: ['Phil heads back into the old town.'], do: ['goto:old_town'] },
    { on: 'to_west', say: ['Phil crosses the bridge and climbs up to the West Cliff.'], do: ['goto:west_cliff'] },
    { on: 'to_bridge2', say: ['Phil heads back down the hill to the bridge.'], do: ['goto:bridge'] },
    { on: 'hotel', if: 'in_hotel', say: ['Phil strolls across the terrace and in through the French windows.'], do: ['goto:parlour'] },
    { on: 'parlour_door', say: ['Phil steps back out onto the terrace.'], do: ['goto:west_cliff'] },

    // ---- What Phil's thinking (tap his portrait) ----
    { look: 'phil', if: '!knows_date', say: ["Me: Phil Mead. Engaged. Cyber security. Currently standing in a graveyard. Step one: find out where I am, without looking like I don't know where I am."] },
    { look: 'phil', if: '!stoker_paid', say: ["Me: No money, no phone, wrong century. Mr Stoker would pay for the right idea. All I've got is good looks and some cards."] },
    { look: 'phil', if: 'bought_suit !got_suit !warm_hands', say: ["Me: I've got a suit I can't get into. These collar studs need fingers, and mine are fish fingers. I need proper heat, and then I need to be quick."] },
    { look: 'phil', if: 'bought_suit !got_suit', say: ['Me: Fingers working! Get dressed, Phil, before the wind gets them again.'] },
    { look: 'phil', if: '!bought_suit !seen_doorman', say: ["Me: I've got money now. Sort of. Next: clothes that don't say 'escaped from somewhere'."] },
    { look: 'phil', if: '!bought_suit', say: ["Me: Apparently joggers are 'nightclothes' on the West Cliff. If I'm going in there, I need to look like I belong in there."] },
    { look: 'phil', if: 'heard_hungry !got_kipper', say: ["Me: That fisherman's starving. Kippers are a penny to take away. Where does a man get a penny in 1890?"] },
    { look: 'phil', if: '!in_hotel', say: ["Me: Look at me. Practically gentry. But that doorman wants the proper name of somebody staying there."] },
    { look: 'phil', if: '!heard_ball_lost', say: ["Me: Somebody on that terrace looks very sad about something. I'm a people person. I should find out what."] },
    { look: 'phil', if: '!got_float', say: ["Me: They need a ball. Something small, round, light and bouncy. Whitby's not exactly a sports shop, but there must be something."] },
    { look: 'phil', if: '!wager_asked', say: ['Me: Ball, bat, opponent. Time to ask for a game.'] },
    { look: 'phil', if: '!challenge_accepted', say: ["Me: He won't play for money. What have I got that nobody in 1890 could buy?"] },
    { look: 'phil', if: '!net_up', say: ['Me: No net, no game. Something long and stiff to stand across the middle of the table.'] },
    { look: 'phil', say: ['Me: Game time, young man.'] },

    // ---- St Mary's churchyard ----
    {
      on: 'stoker',
      if: '!knows_date',
      say: [
        "Stoker: Good afternoon. Forgive me, I'm working.",
        'Me: Young man! Quick question, nothing to worry about. Where exactly am I?',
        "Stoker: 'Young man'? I'm forty-two. You're in St Mary's churchyard, sir. Whitby.",
        'Me: Whitby. Lovely. Knew that. And the date? Roughly?',
        'Stoker: The eleventh of August.',
        'Me: And the year? Just to be thorough.',
        'Stoker: ...Eighteen ninety. Are you quite well?',
        'Me: Never better, young man. Never better.',
        'Me: (Eighteen ninety. EIGHTEEN NINETY.)',
        'Stoker: Bram Stoker. I write. Or I did, until this afternoon. My villain must take flight in chapter four, and I cannot think what he should turn into.',
        "Stoker: Some creature of the night, that can reach a lady's window three storeys up. A wolf can't climb. A mist is too vague. And everything else I think of is ridiculous. I'd pay good money for the right idea, I'm that desperate.",
      ],
      do: ['set:knows_date'],
    },
    { on: 'stoker', if: 'stoker_paid', say: ["Stoker: A bat! Of course it's a bat. I'll make him a Count. Transylvanian. With a cape."] },
    { on: 'stoker', say: ['Stoker: A creature of the night, at a high window... A cat? Too cosy. A spider? Too slow. A pigeon? Good heavens, no.'] },
    { look: 'stoker', if: 'stoker_paid', say: ['Me: Mr Stoker, scribbling faster than a man should be able to. I think I just invented Dracula. Nobody will ever believe me.'] },
    ...anyCard({ on: 'stoker', if: '!knows_date', say: ["Stoker: Coloured cards? Not now, please, whatever they are. I'm hopelessly stuck."] }),
    {
      on: 'stoker',
      item: 'card_bat',
      say: [
        'Stoker: A bat.',
        'Stoker: Wings, to reach any window. Fangs. A creature of the night...',
        'Stoker: Sir, this is it! This is exactly it! May I keep it? Name your price.',
        "Me: That's a rare card, young man. I've had it since I was nine.",
        'Stoker: Half a crown. Two shillings and sixpence.',
        'Me: ...Deal.',
        'Stoker presses a heavy silver coin into his hand and starts scribbling like a man possessed.',
        'Me: Look after him. He likes to be kept in a sleeve.',
      ],
      do: ['take:card_bat', 'give:coin', 'set:stoker_paid'],
    },
    { on: 'stoker', item: 'card_salamander', say: ['Stoker: A lizard, on fire. Vivid. But my Count is not a lizard, and he is very rarely on fire.'] },
    { on: 'stoker', item: 'card_crab', say: ['Stoker: A crab. A villain who scuttles sideways up three storeys? It would take him all night. No.'] },
    { on: 'stoker', item: 'card_dragon', say: ['Me: Actually, no. Not the dragon. Nobody gets the dragon. I would rather stay in 1890.'] },
    { on: 'stoker', item: 'bat', say: ['Stoker: A paddle? For butter? No, no. A CREATURE, man. One that can reach a high window.'] },
    { on: 'stoker', item: 'kipper', say: ["Stoker: Thank you, no. I've just eaten. And I'm working."] },
    { on: 'stoker', item: 'coin', say: ["Stoker: It's yours, sir. You earned it."] },

    {
      on: 'sailor',
      if: '!heard_sailor',
      say: [
        "Sailor: Looking at the stones, are ye? Half of 'em have nobody under 'em. Lost at sea, every one.",
        'Sailor: And five year back a Russian ship ran aground in a storm, and a great black dog leapt off her and ran straight up these steps. Never seen again.',
        'Me: That dog?',
        'Sailor: What dog?',
      ],
      do: ['set:heard_sailor'],
    },
    {
      on: 'sailor',
      if: '!stoker_paid',
      say: [
        "Sailor: Him next to me's been mithering about high windows all afternoon. I told him: there's things with wings in that Abbey every night. Does he listen?",
        'Sailor: Do ye like a sea shanty, lad?',
        "Me: I'm more of a pop-punk man, young man. Shouty songs about being sad, played very fast. There's a festival in Leeds I cannot miss.",
        'Sailor: Leeds? Ye poor soul.',
      ],
    },
    { on: 'sailor', say: ['Sailor: Leeds, he says. Pop punk, he says. I shall have that on my gravestone.'] },
    { on: 'sailor', item: 'kipper', say: ["Sailor: I've been eating kippers for seventy year, lad. I'd rather eat my pipe."] },
    ...anyCard({ on: 'sailor', say: ["Sailor: Picture cards! I saw a real dragon off Robin Hood's Bay in seventy-one. Smaller than that."] }),

    { on: 'black_dog', say: ['Dog: Grrrrr.', 'Me: Good boy? ...Bad boy? Some sort of boy.'] },
    { on: 'black_dog', item: 'kipper', say: ['The black dog sniffs the kipper, looks at Phil with deep disappointment, and turns away.', 'Me: Even the hound of hell has standards.'] },
    { on: 'black_dog', item: 'bat', say: ["Me: I'm not playing fetch with that dog. I'd never get the bat back. Or my arm."] },

    { on: 'abbey', say: ["Me: It's a ruin. Nothing in there but bats and draughts."] },
    { on: 'graves', say: ["Me: I'm not touching those. I've seen films."] },
    { on: 'view', say: ["Me: An abbey, a graveyard and a harbour. With my phone, this'd be the best monster-catching spot in Yorkshire. And my phone is... on a bit of gravel in Knaresborough. A hundred and thirty-six years from now."] },

    // ---- Church Street ----
    {
      on: 'pawnshop',
      if: '!bought_suit',
      say: [
        "Pawnbroker: Buying or selling? And what in heaven's name are you wearing?",
        'Me: Joggers, young man. Very fashionable.',
        "Pawnbroker: Not round here they're not. You look like you've escaped from somewhere.",
        "Pawnbroker: There's a gent's suit in the window, if you've the money. Two and six.",
        'Me: Two and six what?',
        'Pawnbroker: Two shillings and sixpence, lad. Where are you from?',
        'Me: ...Filey.',
        'Pawnbroker: That explains it.',
      ],
    },
    { on: 'pawnshop', if: '!got_suit', say: ["Pawnbroker: Carrying it round won't make you look any less escaped, lad. Put it on."] },
    { on: 'pawnshop', say: ["Pawnbroker: Suit's grand on you. My late brother-in-law would be proud. He'd be cold, mind."] },
    {
      on: 'pawnshop',
      item: 'coin',
      say: [
        'Pawnbroker: Half a crown. Two and six. Right you are.',
        'He wraps up a three-piece tweed suit, a stiff collar and a watch chain with no watch on it.',
        "Pawnbroker: It were my late brother-in-law's. Mind the collar studs. Fiddly little beggars.",
      ],
      do: ['take:coin', 'give:suit', 'set:bought_suit'],
    },
    { on: 'price_card', item: 'coin', say: ["Me: I can't pay a card. I need to give it to the pawnbroker."] },
    { on: 'price_card', say: ["Me: Two-slash-six. I'm going to need someone to explain this to me, slowly."] },
    { on: 'pawnshop', item: 'penny', say: ['Pawnbroker: A penny? That buys you a look at the window, lad. Which is free.'] },
    { on: 'pawnshop', item: 'tuppence', say: ['Pawnbroker: Tuppence? The suit is two and six, lad. Two SHILLINGS and six.'] },
    ...anyCard({ on: 'pawnshop', say: ['Pawnbroker: Painted cards? Not my line. Try the paperboy, he collects all sorts of rubbish.'] }),
    { on: 'pawnshop', item: 'bat', say: ["Pawnbroker: Funny little paddle. I'll give you a penny.", 'Me: Not for sale, young man. Not for all the pennies in Whitby.'] },
    { on: 'pawnshop', item: 'kipper', say: ["Pawnbroker: I don't take fish, lad. Not after last time."] },
    { on: 'pawnshop', item: 'suit', say: ["Pawnbroker: No refunds, lad. It's yours. Put it on."] },

    {
      on: 'jet',
      if: '!heard_jeweller',
      say: [
        'Jeweller: Whitby jet, sir. Mourning jewellery. Ever since the Prince died, the Queen wears nowt else, so neither does anyone.',
        "Me: Got any wedding rings? I'm getting married soon.",
        "Jeweller: In jet, sir? It's for funerals.",
        "Me: Probably not the look we're going for, then.",
        'Jeweller: A pin for your hat, perhaps? I sold one this morning to a Mr Fanshawe, from the big hotel on the West Cliff. Young gent, striped blazer, never stopped talking. For his new topper.',
        'Me: What happened to the old one?',
        'Jeweller: Left it hanging in some well at Knaresborough, he said. To turn to stone, if you please.',
        'Me: A well. At Knaresborough. That turns things to stone.',
        "Jeweller: Daft, isn't it?",
        'Me: Very daft. Very, very daft.',
      ],
      do: ['set:heard_jeweller'],
    },
    { on: 'jet', say: ['Jeweller: Can I interest sir in a brooch? Very slimming. Black always is.'] },
    ...anyCard({ on: 'jet', say: ['Jeweller: Charming. But I only deal in jet, sir. Have you got a black dragon?'] }),
    { on: 'jet', item: 'coin', say: ["Jeweller: Half a crown? Two and six won't buy you much in here, sir. A very small bead."] },
    { on: 'jet', item: 'kipper', say: ['Jeweller: Not near the brooches, sir, please.'] },

    {
      on: 'fishwife',
      if: '!got_kipper',
      say: [
        'Fishwife: Eeh, love, you look perished. And thin as a lath. Have a kipper, fresh out the smoke. Free, if you eat it here where I can see you.',
        "Me: That's very kind, young man, but I'm... particular. I don't eat anything with a face. Or bones. Or a smell.",
        'Fishwife: Particular! And less of the young man. Suit yourself, love.',
        "Fishwife: They're free to eat, mind. A penny to take away. I'm not feeding all of Whitby for nowt.",
      ],
    },
    { on: 'fishwife', if: 'has:kipper', say: ["Fishwife: Go on, take it to whoever it's for, love, before it goes cold."] },
    { on: 'fishwife', if: 'got_suit', say: ['Fishwife: Ooh, look at you! Nice suit. Not nice shoes.'] },
    { on: 'fishwife', say: ['Fishwife: Still particular, love?'] },
    ...spend('fishwife', 'kipper', 'got_kipper', [
      'Fishwife: A penny to take away. Lovely.',
      "She wraps a kipper in paper and hands it over. It's still warm. It's looking at Phil.",
      "Me: It's not for me.",
      "Fishwife: 'Course it isn't, love.",
    ]),
    { on: 'fishwife', item: 'penny', say: ["Fishwife: You've had your kipper, love."] },
    { on: 'fishwife', item: 'tuppence', say: ["Fishwife: You've had your kipper, love."] },
    { on: 'fishwife', item: 'kipper', say: ["Fishwife: No refunds on kippers, love. Somebody'll want it."] },
    { on: 'fishwife', item: 'coin', say: ["Fishwife: Half a crown? That's two and six, love! I can't change that for a kipper."] },
    ...anyCard({ on: 'fishwife', say: ["Fishwife: Pretty pictures, love. Can't eat 'em, though."] }),

    // Phil and food.
    {
      on: 'phil',
      item: 'kipper',
      say: ["Me: No. I don't eat fish. I don't eat anything with a face. Or bones. Or a smell. Or a texture.", "Me: It's for somebody hungrier than me."],
    },

    // ---- The suit ----
    {
      on: 'phil',
      item: 'suit',
      if: 'warm_hands',
      say: [
        'Phil changes behind the nearest wall, fast, while his fingers still work.',
        'Four brass collar studs. Three buttons on the waistcoat. A watch chain with no watch.',
        'Me: Well. Look at me, young man. I look like money.',
        'Me: Joggers in the backpack. Trainers stay on. Nobody needs to know.',
      ],
      do: ['take:suit', 'set:got_suit'],
    },
    {
      on: 'phil',
      item: 'suit',
      say: [
        'Phil gets the trousers on, the waistcoat on, the jacket on. Then the collar.',
        "Me: Four tiny brass studs. And my fingers are so cold I can't feel them, never mind the studs.",
        "Me: Everything off again. I'm not walking round Whitby with my collar flapping. I need these hands right up to some proper heat first. Not warm air. Heat.",
      ],
    },

    // ---- Inside the smokehouse ----
    { on: 'fire', if: 'warm_hands', say: ["Me: Fingers: toasty. Any more and they'll be kippers."] },
    {
      on: 'fire',
      say: ['Phil crouches by the fire and holds his hands to the glowing chips.', 'Me: Oh. Oh, that is the stuff. I can feel them. Every finger. Hello, fingers.'],
      do: ['set:warm_hands'],
    },
    { on: 'fire', item: 'kipper', say: ["Me: It's already been smoked. It's as smoked as it's going to get."] },
    { on: 'fire', item: 'suit', say: ["Me: I'm not setting fire to a dead man's suit. It's been through enough."] },
    ...anyCard({ on: 'fire', say: ['Me: Absolutely not. Do you know what these are worth? Neither do I, in 1890, but still.'] }),
    { on: 'racks', say: ['Phil reaches up towards a rack of kippers.', 'Fishwife: (from outside) I can SEE you! Penny to take away!', 'Me: How?'] },
    { on: 'barrels', say: ["Me: NOT FOR SITTING ON. I'm not going to sit on it. I'm British. I respect a sign."] },

    // ---- The swing bridge ----
    {
      on: 'fisherman',
      if: '!fisherman_fed',
      say: [
        "Fisherman: Can't stop, lad. Nets to mend. Been at it since four this morning, and not a bite to eat since.",
        "Me: Since four? That's a crime, young man.",
        "Fisherman: I'm sixty-three.",
      ],
      do: ['set:heard_hungry'],
    },
    {
      look: 'fisherman',
      if: '!fisherman_fed',
      say: ['Me: A fisherman in a thick knitted gansey, mending nets with fingers like sausages. His stomach is rumbling so loudly I can hear it from here.'],
      do: ['set:heard_hungry'],
    },
    { on: 'fisherman', if: '!got_float', say: ["Fisherman: Best kipper I've ever had. Owt you want off this quay, lad, just help thysen."] },
    { on: 'fisherman', say: ['Fisherman: Enjoy your game, lad.'] },
    {
      on: 'fisherman',
      item: 'kipper',
      say: [
        'Fisherman: Is that a kipper? For me?',
        'He eats it in four bites, bones and all.',
        "Fisherman: Lad, you're a saint. If there's owt on this quay you want, help thysen.",
        "Me: Don't mention it. Really. I don't want to think about it.",
      ],
      do: ['take:kipper', 'set:fisherman_fed'],
    },
    { on: 'fisherman', item: 'bat', say: ["Fisherman: Funny little paddle. You'll not row far with that."] },
    ...anyCard({ on: 'fisherman', say: ["Fisherman: Can't eat pictures, lad."] }),
    { on: 'fisherman', item: 'coin', say: ["Fisherman: Keep it. It's food I want, not money."] },
    { on: 'fisherman', item: 'penny', say: ["Fisherman: A penny won't fill me, lad. It's food I want, not money."] },
    { on: 'fisherman', item: 'tuppence', say: ["Fisherman: Tuppence won't fill me, lad. It's food I want, not money."] },

    { on: 'nets', if: '!fisherman_fed', say: ['Fisherman: Oi! Hands off my nets.'] },
    {
      on: 'nets',
      if: 'heard_ball_lost !got_float',
      say: [
        "Me: Young man, could I have one of these little cork floats? It's for a game.",
        'Fisherman: After that kipper? Take two!',
        'Me: One will do. I only need one ball. I only ever need one ball.',
        'Phil pulls a little round cork float off the net.',
      ],
      do: ['give:float', 'set:got_float'],
    },
    { on: 'nets', if: '!got_float', say: ["Me: Lovely nets. Lots of little corks. I can't think what I'd want with one, though."] },
    { on: 'nets', say: ["Me: One float's plenty. I'm not greedy."] },
    { on: 'nets', item: 'bat', say: ["Me: You don't catch herring with a table tennis bat. I assume. I've never tried."] },

    {
      on: 'keeper',
      say: [
        'Keeper: Bridge swings open for the ships, twice a tide. Stand clear when I ring the bell.',
        "Me: Nice. I'm in security, too.",
        'Keeper: Oh aye? What do you guard?',
        'Me: Data.',
        "Keeper: What's that?",
        "Me: Honestly, young man? I'm not sure. I'm not technical. I mostly go to meetings.",
      ],
    },
    { on: 'keeper', item: 'kipper', say: ['Keeper: Had me dinner, thanks. Kippers, funnily enough.'] },
    ...anyCard({ on: 'keeper', say: ['Keeper: No cards on the bridge. House rule. Well, bridge rule.'] }),

    {
      on: 'paperboy',
      if: '!got_gazette',
      say: [
        'Paperboy: Gazette! Read all about it! Russian ship in port! Famous author in town! Yorkshire beat Lancashire! A penny! Big enough to wrap a cod in!',
        'Me: Love all sport, me. Even this one.',
        'Me: (Quietly.) Best not mention to anyone round here that I support a team from Manchester.',
        "Paperboy: I collect picture cards, me. Got eleven. Not bats, mind. I hate bats.",
      ],
    },
    { on: 'paperboy', say: ["Paperboy: Gazette! Read all about it! I've got a dragon at home now! Well, I haven't. But I want one."] },
    ...sellCard('card_salamander', 'fire lizard'),
    ...sellCard('card_crab', 'crab'),
    { on: 'paperboy', item: 'card_bat', say: ['Paperboy: Eurgh, a bat! Get it away! I hate bats!'] },
    { on: 'paperboy', item: 'card_dragon', say: ['Paperboy: Cor! Is that a DRAGON? A whole penny for it!', 'Me: No. No, no. Nobody gets the dragon.'] },
    ...spend('paperboy', 'gazette', 'got_gazette', ['Paperboy: One Gazette! Ta, mister!', 'Me: Thank you, young man. Keep the change.', "Paperboy: There isn't any."]),
    { on: 'paperboy', item: 'penny', say: ["Paperboy: You've got one, mister! What do you want two for?"] },
    { on: 'paperboy', item: 'tuppence', say: ["Paperboy: You've got one, mister! What do you want two for?"] },
    { on: 'paperboy', item: 'coin', say: ["Paperboy: Half a crown for a penny paper? That's two and six, mister! I can't change that!"] },
    { on: 'paperboy', item: 'kipper', say: ["Paperboy: I'm sick of kippers, mister. Me mam does 'em every day."] },

    { on: 'ship', say: ["Me: I'm not going anywhere near those boxes. Nobody ships earth for a good reason."] },
    { on: 'ship', item: 'kipper', say: ["Me: I'm not feeding anything that lives in one of those boxes."] },

    // ---- The West Cliff ----
    { on: 'doorman', if: 'in_hotel', say: ['Doorman: Sir.'] },
    {
      on: 'doorman',
      if: 'has:suit',
      say: ['Doorman: Sir appears to be carrying a suit, rather than wearing one.', "Me: It's... a travelling suit.", 'Doorman: Then perhaps sir might travel into it.'],
      do: ['set:seen_doorman'],
    },
    {
      on: 'doorman',
      if: '!got_suit',
      say: ["Doorman: The terrace is for residents and gentlemen only, I'm afraid.", "Me: I'm a gentleman, young man.", 'Doorman: In your nightclothes, sir? Off you trot.'],
      do: ['set:seen_doorman'],
    },
    { on: 'doorman', say: ['Doorman: Can I help sir?'], choices: doormanChoices },
    ...anyCard({ on: 'doorman', say: ["Doorman: We don't accept calling cards at the gate, sir. Even ones with dragons on."] }),
    { on: 'doorman', item: 'kipper', say: ['Doorman: Not on the steps, sir.'] },
    { on: 'doorman', item: 'coin', say: ["Doorman: I can't be bought, sir. And certainly not for half a crown."] },
    { on: 'doorman', item: 'suit', say: ['Doorman: I have a uniform, sir. But thank you.'] },

    {
      on: 'algernon',
      if: '!heard_ball_lost',
      say: [
        "Algernon: I say! You there! Algy. Everybody calls me Algy. You haven't seen a ball, have you? Little cork thing?",
        'Algernon: Sailed clean over the railings and off the cliff. Whiff-whaff is quite ruined.',
        'Me: Whiff-whaff?',
        "Algernon: The new parlour game! You bat a little ball across a table. All the rage. And there isn't another ball to be had in the whole of Whitby.",
        'Me: Table tennis. You mean table tennis!',
        "Algernon: Table tennis? Never heard it called that. It'll never catch on.",
      ],
      do: ['set:heard_ball_lost'],
    },
    { on: 'algernon', if: 'has:float !in_hotel', say: ["Algernon: Is that a ball? Splendid! But I can't play you through the railings, old bean. Come round to the terrace."] },
    { on: 'algernon', if: 'has:float !wager_asked', ...wagerAsk },
    { on: 'algernon', if: 'wager_asked', say: ["Algernon: Put up something worth winning, old chap, and I'll play you. Something rare. Something I couldn't simply buy."] },
    { on: 'algernon', if: '!in_hotel', say: ["Algernon: No ball, no whiff-whaff. Cork, it was. Bounced like a dream. And residents only on the terrace, I'm afraid. Hobbs is very strict."] },
    { on: 'algernon', say: ['Algernon: No ball, no game. Cork, it was. Light as a feather and round as a pea. Oh, it bounced like a dream.'] },
    { on: 'algernon', item: 'float', if: '!in_hotel', say: ["Algernon: A ball! But I can't play you through the railings, old bean. Come round to the terrace."] },
    { on: 'algernon', item: 'float', if: '!wager_asked', ...wagerAsk },
    { on: 'algernon', item: 'float', say: ['Algernon: Yes, yes, the ball. But what are you putting up, old chap? Something rare.'] },
    {
      on: 'algernon',
      item: 'card_dragon',
      if: 'wager_asked',
      say: [
        'Me: ...The dragon.',
        'Phil holds it up. It catches the evening sun.',
        'Algernon: Good Lord. It SHINES. It shimmers! I have never seen the like. Done!',
        'Algernon: And if you win?',
        'Me: A bed for the night. Somewhere with carpets.',
        'Algernon: Done again! And who have you ever beaten, by the way?',
        'Me: So there was this one against Rob, nine-all in the decider, and he does this serve he thinks is clever...',
        'Five minutes pass.',
        "Me: ...and that's Dad. And then Jack. Jack doesn't really count, but I'll tell you anyway.",
        "Algernon: Brothers AND a father! Not out here, though, it's blowing a gale. The parlour! There's a proper table in the parlour!",
        'Algy sweeps in through the French windows. Phil follows.',
      ],
      do: ['set:challenge_accepted', 'goto:parlour'],
    },
    { on: 'algernon', item: 'card_salamander', if: 'wager_asked', say: ['Algernon: Pretty. But I expect they print those by the thousand. Something RARE, old chap.'] },
    { on: 'algernon', item: 'card_crab', if: 'wager_asked', say: ['Algernon: A crab? I can get a crab at the harbour for a farthing.'] },
    ...anyCard({ on: 'algernon', say: ['Algernon: Collectable cards? How frightfully modern. Do you have any of cricketers?'] }),
    { on: 'algernon', item: 'bat', if: '!heard_ball_lost', say: ['Algernon: I say, what a peculiar paddle!'] },
    { on: 'algernon', item: 'bat', if: '!has:float', say: ['Algernon: What a splendid paddle! Useless without a ball, alas.'] },
    { on: 'algernon', item: 'bat', if: '!in_hotel', say: ["Algernon: Bat and ball! But I can't play you through the railings, old bean. Come round to the terrace."] },
    { on: 'algernon', item: 'bat', if: '!wager_asked', ...wagerAsk },
    { on: 'algernon', item: 'bat', say: ['Algernon: Splendid paddle. But first, the wager. Something rare, old chap.'] },
    { on: 'algernon', item: 'kipper', say: ["Algernon: Kippers are for breakfast, old chap. It's practically teatime."] },
    { on: 'algernon', item: 'coin', say: ["Algernon: Money? My dear fellow, I've got heaps of the stuff."] },

    { on: 'table', if: '!in_hotel', say: ["Me: It's behind the railings. Residents and gentlemen only."] },
    { on: 'table', say: ["Me: Too small, too wobbly, too windy. You couldn't play a proper game out here."] },
    { on: 'hotel', say: ["Me: Big windows. Thick carpets, I bet. And I'm out here with the seagulls."] },
    { on: 'arch', say: ['Phil walks under the whalebone arch.', "Me: Swallowed by a whale. Tick. That's going on the list."] },

    // ---- The parlour ----
    {
      on: 'long_table',
      item: 'gazette',
      say: ['Phil opens the Gazette, folds it lengthways into a stiff little wall and stands it across the middle of the table.', 'Me: Official tournament standard. Probably.'],
      do: ['take:gazette', 'set:net_up'],
    },
    { on: 'long_table', item: 'bat', if: '!challenge_accepted', say: ["Me: A table and a bat. No ball, no net, no opponent. That's not a game, that's a mime."] },
    { on: 'long_table', item: 'bat', if: '!net_up', say: ['Algernon: Not without a net, old chap! We are not savages.'] },
    { on: 'long_table', item: 'bat', if: 'has:float', ...match },
    { on: 'net_up', item: 'bat', if: 'challenge_accepted has:float', ...match },
    { on: 'long_table', if: 'challenge_accepted net_up has:float', ...match },
    { on: 'net_up', if: 'challenge_accepted has:float', ...match },
    { on: 'net_up', say: ['Me: A net. Now I need a ball, and somebody to beat.'] },
    { on: 'long_table', if: 'challenge_accepted', say: ['Algernon: Not without a net, old chap! We are not savages.'] },
    { on: 'long_table', say: ['Me: Lovely table. Exactly table tennis size. It just needs a net, a ball and somebody to beat.'] },
    { on: 'long_table', item: 'float', say: ['Me: Ball on the table. I need an opponent. And a net.'] },
    { on: 'long_table', item: 'suit', say: ["Me: I'm not laying out a dead man's suit on a dining table. This isn't that sort of hotel."] },
    ...anyCard({ on: 'long_table', say: ["Me: I'm not using my cards as a net. They'd be bent. A bent card is a dead card."] }),

    {
      on: 'algy_in',
      if: '!net_up',
      say: [
        'Algernon: Bad news, old chap. We used to stand a row of books across the middle for a net, but Hobbs has confiscated them. Says the library is not for sport.',
        'Algernon: We need something else. Long, flat, stiff enough to stand up on its own. And not a book, or Hobbs will have it.',
      ],
    },
    { on: 'algy_in', say: ["Algernon: Whenever you're ready, old chap. Bats at the ready!"] },
    { on: 'algy_in', item: 'gazette', say: ["Algernon: The Gazette? I don't want to read it, old chap. Though it is very stiff paper. Good for all sorts."] },
    { on: 'algy_in', item: 'bat', say: ['Algernon: Not at me, old chap! At the table!'] },
    ...anyCard({ on: 'algy_in', say: ["Algernon: You've wagered the dragon, old chap. Don't make it harder for yourself."] }),

    { on: 'shelves', say: ['Phil reaches for a row of sermons.', 'Doorman: (from the doorway) The library is not for sport, sir.', 'Me: How did you even...'] },
    { on: 'fireplace', say: ['Phil warms his hands at the fire.', "Me: A fire. In August. I'm never leaving."] },
    { on: 'fireplace', item: 'gazette', say: ["Me: It's not for burning. I paid a whole penny for this."] },
    { on: 'lady', say: ['Lady: Zzz... Hobbs? Is that you? Fetch my... zzz...', "Me: I'll leave her be. She's earned it. She's wearing about four pounds of jet."] },
    { on: 'lady', item: 'kipper', say: ["Me: You don't wake a lady with a kipper. I don't know much about 1890, but I know that."] },
    ...anyCard({ on: 'lady', say: ["Me: She's asleep. And she doesn't look like a collector."] }),

    // ---- Anywhere else ----
    ...anyCard({ on: '*', say: ["Me: I'm not just waving my cards about, young man. They're mint condition."] }),
    { on: '*', item: 'bat', say: ["Me: I'm not whacking that. This bat is for table tennis and for table tennis only."] },
    { on: '*', item: 'coin', say: ["Me: I'm not just handing this over. It's all the money I've got, and I don't know what it buys."] },
    { on: '*', item: 'penny', say: ["Me: One penny. I'm not wasting it."] },
    { on: '*', item: 'tuppence', say: ["Me: Tuppence. I'm not wasting it."] },
    { on: '*', item: 'kipper', say: ["Me: I'm not just leaving a kipper lying about. Somebody might want it. Not me. Somebody."] },
    { on: '*', item: 'float', say: ["Me: It's a bit small for that. It's ball-sized. I should find someone who's lost a ball."] },
    { on: '*', item: 'suit', say: ['Me: It goes on me, not on that.'] },
    { on: '*', item: 'gazette', say: ["Me: It's a newspaper, not a tool. Although it is very stiff."] },
  ],
  puzzles: [
    { id: 'p1', label: 'Puzzle 1', solved: 'stoker_paid' },
    { id: 'p2', label: 'Puzzle 2', solved: 'bought_suit' },
    { id: 'p3', label: 'Puzzle 3', solved: 'got_suit' },
    { id: 'p4', label: 'Puzzle 4', solved: 'sold_card' },
    { id: 'p5', label: 'Puzzle 5', solved: 'got_kipper' },
    { id: 'p6', label: 'Puzzle 6', solved: 'got_float' },
    { id: 'p7', label: 'Puzzle 7', solved: 'in_hotel' },
    { id: 'p8', label: 'Puzzle 8', solved: 'challenge_accepted' },
    { id: 'p9', label: 'Puzzle 9', solved: 'net_up' },
    { id: 'p10', label: 'Puzzle 10', solved: 'match_won' },
  ],
  goal: 'match_won',
  ending: [
    "Algernon: Extraordinary. Simply extraordinary. You must stay, old chap. I'll have them make up the room next to mine. My treat.",
    'Me: Well. If you insist, young man.',
    'That evening, Algernon talks all the way through dinner. Phil eats the bread rolls and nothing else.',
    'Algernon: ...and before Whitby we were at Knaresborough. The Dropping Well! Turns things to stone. I hung my best top hat in it, for posterity.',
    'Phil goes very quiet.',
    'Me: Your top hat. Black silk? Slightly dented on one side?',
    'Algernon: How on earth did you know that?',
    'Me: Lucky guess.',
    'Phil has seen that hat before. Hanging in the Petrifying Well, solid stone, a hundred and thirty-six years from now.',
    'Me: Things go into the well here... and they are still there when I get home.',
    "Me: It's the well. It's all about the well.",
    '[wait 1]',
    'Across the harbour, up in the churchyard, a big black dog howls at the moon.',
    "Later, Phil stands at the window of the nicest room he has ever slept in, wearing a dead man's suit, looking at the moon over the Abbey.",
    'Me: Bed. Roof. Rich friend. Not bad for day one.',
    "Me: The wedding. The festival. I've got to get back for both.",
    "Me: Rob'll be fine. Rob's always fine. He'll have found a soapbox somewhere.",
    'Me: But Jack...',
    "Me: I wonder how Jack's getting on.",
    "To be continued. Chapter 2 is Jack's.",
  ],
};
