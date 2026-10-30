import type { Chapter, Choice } from '../types';

/**
 * SPOILERS: this file is the puzzle solutions.
 * If you haven't played Chapter 1 yet, play it first.
 */

/** Which card Phil shows Bram Stoker. */
const cardChoices: Choice[] = [
  {
    label: 'The fire salamander.',
    say: ['Stoker: A lizard, on fire. Vivid. But my Count is not a lizard, and he is very rarely on fire.'],
  },
  {
    label: 'The grumpy rock crab.',
    say: ['Stoker: A crab. A villain who scuttles sideways up three storeys? It would take him all night. No.'],
  },
  {
    label: 'The purple bat with fangs.',
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
    do: ['give:coin', 'set:stoker_paid'],
  },
  {
    label: 'The shiny golden dragon.',
    say: ['Me: Actually, no. Not the dragon. Nobody gets the dragon. I would rather stay in 1890.'],
  },
  { label: 'Never mind.', say: ['Stoker: Hmm? Yes. A high window. Something of the night...'] },
];

/** Talking to Hobbs, the doorman, once Phil looks the part. */
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
      'Phil strolls through the gate onto the terrace like he owns it.',
    ],
    do: ['set:in_hotel'],
  },
  { label: 'Never mind.', say: ['Doorman: Sir.'] },
];

/** What Phil stakes on the match. */
const wagerChoices: Choice[] = [
  { label: 'The fire salamander.', say: ['Algernon: Pretty. But I expect they print those by the thousand. Something RARE, old chap.'] },
  { label: 'The grumpy rock crab.', say: ['Algernon: A crab? I can get a crab at the harbour for a farthing.'] },
  {
    label: 'The shiny golden dragon.',
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
      'Algernon: Brothers AND a father! Now: to the table!',
    ],
    do: ['set:challenge_accepted'],
  },
  { label: 'Never mind.', say: ["Algernon: Something rare, old chap. Something I couldn't simply buy. Then we play."] },
];

/** Algernon, once he has a ball and Phil is on the terrace. */
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
    'Twenty minutes later, half the hotel has come out onto the terrace to watch.',
    'Me: Eleven-two. Good game, young man.',
    'Algernon: Two? I got two?',
    'Me: I let you have the second one. I always let them have the second one.',
    'Me: And I will be keeping my dragon, thank you, young man.',
  ],
  do: ['take:float', 'set:match_won'],
};

export const whitby: Chapter = {
  id: 'whitby',
  number: 1,
  title: 'A Young Man in Whitby',
  author: 'Rob (story) and Claude (puzzles)',
  era: 'August 1890',
  place: 'Whitby',
  brothers: ['phil'],
  start: {
    scene: 'east_cliff',
    brother: 'phil',
    inventory: { phil: ['cards', 'bat'] },
  },
  extras: {
    stoker: { name: 'Bram Stoker', colour: '#c9a0dc', at: { x: 515, y: 200 } },
    sailor: { name: 'Old sailor', colour: '#7fb8d9', at: { x: 610, y: 210 } },
    dog: { name: 'Black dog', colour: '#b8443a', at: { x: 375, y: 310 } },
    fishwife: { name: 'Fishwife', colour: '#f08fb0', at: { x: 635, y: 250 } },
    pawnbroker: { name: 'Pawnbroker', colour: '#d9c27f', at: { x: 235, y: 90 } },
    jeweller: { name: 'Jeweller', colour: '#a3a3c2', at: { x: 435, y: 100 } },
    fisherman: { name: 'Fisherman', colour: '#7fd9b8', at: { x: 320, y: 220 } },
    keeper: { name: 'Bridge keeper', colour: '#e8a33d', at: { x: 505, y: 150 } },
    paperboy: { name: 'Paperboy', colour: '#f2cc2f', at: { x: 670, y: 260 } },
    doorman: { name: 'Hobbs', colour: '#d6b0ff', at: { x: 455, y: 220 } },
    algernon: { name: 'Algy', colour: '#ff9f6b', at: { x: 885, y: 130 } },
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
    cards: {
      name: 'Monster cards',
      icon: 'cards',
      look: 'My monster cards. A fire salamander, a grumpy rock crab, a purple bat with fangs, and my pride and joy: a shiny golden dragon. I never leave the house without them.',
    },
    bat: {
      name: "Phil's bat",
      icon: 'bat',
      look: 'My table tennis bat. Proper rubber, carbon blade. It goes everywhere with me. You never know when a game might break out.',
    },
    coin: {
      name: 'Half-crown coin',
      icon: 'coin',
      look: "A big silver coin with the Queen on it. Mr Stoker called it half a crown. I have no idea if that's a lot.",
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
          rect: { x: 20, y: 30, w: 240, h: 250 },
          colour: '#7a7466',
          look: 'Whitby Abbey. Enormous ruined arches with nothing but sky in the windows. Dozens of bats hang in the stonework, waiting for dark.',
        },
        {
          id: 'graves',
          name: 'Gravestones',
          rect: { x: 270, y: 190, w: 170, h: 130 },
          colour: '#8a8a80',
          look: "Old gravestones, worn smooth by the sea wind. Half of them say 'lost at sea'. Lovely. Very relaxing.",
        },
        {
          id: 'black_dog',
          name: 'Black dog',
          rect: { x: 320, y: 325, w: 100, h: 85 },
          colour: '#222222',
          sprite: 'black-dog.png',
          look: "A huge black dog, sat among the graves, staring at me with eyes the colour of ketchup. It has not blinked once. It doesn't look hungry. It looks like it has already eaten.",
        },
        {
          id: 'stoker',
          name: 'Bram Stoker',
          rect: { x: 465, y: 215, w: 95, h: 160 },
          colour: '#4a3a5a',
          sprite: 'stoker.png',
          look: "A big man with a red beard, scribbling in a notebook and muttering to himself. He looks like he hasn't slept in a week.",
        },
        {
          id: 'sailor',
          name: 'Old sailor',
          rect: { x: 565, y: 225, w: 85, h: 150 },
          colour: '#2f4a6b',
          sprite: 'sailor.png',
          look: 'An ancient sailor with a white beard and a clay pipe. He has the look of a man with a lot of stories and no one to tell them to.',
        },
        {
          id: 'view',
          name: 'View over Whitby',
          rect: { x: 700, y: 50, w: 250, h: 160 },
          colour: '#7f9cb0',
          look: 'Red roofs tumbling down to a harbour full of masts. Smoke from every chimney. Not a single car, phone mast or chip shop sign. Wait, no, there is a chip shop.',
        },
        {
          id: 'steps',
          name: 'Steps down to the old town',
          rect: { x: 780, y: 250, w: 170, h: 180 },
          colour: '#9a8a70',
          look: 'The 199 steps, winding down to the old town. Somebody has counted them. Jack would have counted them twice.',
        },
      ],
      stand: { phil: [{ x: 690, y: 440 }] },
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
          rect: { x: 10, y: 120, w: 110, h: 300 },
          colour: '#9a8a70',
          look: 'The 199 steps, back up to the churchyard. My calves have opinions about this.',
        },
        {
          id: 'pawnshop',
          name: "Pawnbroker's",
          rect: { x: 140, y: 100, w: 190, h: 140 },
          colour: '#6b4a2b',
          look: {
            any: "A pawnbroker's, with three brass balls over the door. The window is full of other people's things: clocks, boots, a stuffed owl and a gentleman's suit on a dummy.",
          },
        },
        {
          id: 'price_card',
          name: 'Price card',
          rect: { x: 170, y: 245, w: 130, h: 55 },
          colour: '#e6c890',
          prop: 'sign',
          text: ["SUIT, GENT'S", '2/6'],
          if: '!got_suit',
          look: "A card in the window, under the suit: SUIT, GENT'S, 2/6. Two-slash-six. Is that a fraction? A date? A football score?",
        },
        {
          id: 'jet',
          name: 'Jet workshop',
          rect: { x: 350, y: 110, w: 170, h: 220 },
          colour: '#2b2b33',
          look: 'A jet workshop. Black, glossy brooches and beads in the window, and a jeweller polishing away inside. Very gothic. Very Whitby.',
        },
        {
          id: 'smokehouse',
          name: 'Smokehouse',
          rect: { x: 540, y: 60, w: 200, h: 200 },
          colour: '#5a3a2a',
          look: "A smokehouse. Rows of herring hang in the smoke, slowly turning gold. Warm air rolls out of the door. It's actually warm. I could cry.",
        },
        {
          id: 'fishwife',
          name: 'Fishwife',
          rect: { x: 595, y: 265, w: 75, h: 150 },
          colour: '#7a3a4a',
          sprite: 'fishwife.png',
          look: 'A fishwife in a shawl and a big apron, with forearms like hams and a voice that carries to Scarborough.',
        },
        {
          id: 'to_bridge',
          name: 'Way to the swing bridge',
          rect: { x: 820, y: 150, w: 130, h: 270 },
          colour: '#4f6a7a',
          look: 'Church Street runs on to the swing bridge over the river.',
        },
      ],
      stand: { phil: [{ x: 770, y: 440 }] },
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
          rect: { x: 10, y: 150, w: 100, h: 270 },
          colour: '#8a6a50',
          look: 'Back to Church Street and the smell of kippers.',
        },
        {
          id: 'nets',
          name: 'Herring nets',
          rect: { x: 120, y: 255, w: 150, h: 150 },
          colour: '#6b7a5a',
          look: 'Herring nets hung over the rail to dry. All along the top edge, little round cork floats are strung like beads, to hold the net up in the water.',
        },
        {
          id: 'fisherman',
          name: 'Fisherman',
          rect: { x: 280, y: 235, w: 80, h: 165 },
          colour: '#3a5a6a',
          sprite: 'fisherman.png',
          look: 'A fisherman in a thick knitted gansey, mending nets with fingers like sausages. His stomach is rumbling so loudly I can hear it from here.',
        },
        {
          id: 'keeper',
          name: "Bridge keeper's hut",
          rect: { x: 450, y: 170, w: 110, h: 170 },
          colour: '#8a4a3a',
          look: "A little hut on the bridge, with a bell, a big lever and a bridge keeper inside who takes the job very seriously.",
        },
        {
          id: 'ship',
          name: 'Russian schooner',
          rect: { x: 570, y: 20, w: 220, h: 190 },
          colour: '#5a4a3a',
          look: 'A Russian schooner, unloading long wooden boxes onto the quay. Boxes of earth, by the look of it. Who ships earth? Completely normal. Nothing to worry about.',
        },
        {
          id: 'paperboy',
          name: 'Paperboy',
          rect: { x: 640, y: 275, w: 60, h: 135 },
          colour: '#6a5a2a',
          sprite: 'paperboy.png',
          look: 'A small boy in a big cap with a bag of newspapers and a voice like a foghorn.',
        },
        {
          id: 'to_west',
          name: 'Road up to the West Cliff',
          rect: { x: 820, y: 120, w: 130, h: 300 },
          colour: '#a08a6a',
          look: 'Over the bridge, a road climbs up to the West Cliff, where the grand hotels are. Even the seagulls look posher over there.',
        },
      ],
      stand: { phil: [{ x: 410, y: 440 }] },
    },
    west_cliff: {
      name: 'The West Cliff',
      description:
        'The smart side of Whitby. A whalebone arch frames the sea, and a grand hotel looks down its nose at the harbour. A doorman guards the gate to its terrace, where a young gentleman stands by a table.',
      background: 'whitby-west-cliff.webp',
      placeholder: { top: '#8fb0c8', bottom: '#6a7a5a' },
      hotspots: [
        {
          id: 'to_bridge2',
          name: 'Road down to the bridge',
          rect: { x: 10, y: 200, w: 90, h: 220 },
          colour: '#a08a6a',
          look: 'Back down the hill to the swing bridge and the old town.',
        },
        {
          id: 'arch',
          name: 'Whalebone arch',
          rect: { x: 110, y: 40, w: 170, h: 260 },
          colour: '#e8e0c8',
          look: 'An arch made out of the jawbones of a whale. Somebody, at some point, thought this would be nice to walk under.',
        },
        {
          id: 'hotel',
          name: 'Grand hotel',
          rect: { x: 300, y: 20, w: 300, h: 200 },
          colour: '#c8b89a',
          look: "A grand hotel: bay windows, flags, and a doorman. This is where the money stays. I feel strangely at home. Rob says I've gone posh. Rob's right.",
        },
        {
          id: 'doorman',
          name: 'Doorman',
          rect: { x: 420, y: 235, w: 70, h: 165 },
          colour: '#3a2a5a',
          sprite: 'doorman.png',
          look: 'A doorman with more brass buttons than any coat needs. He guards the gate onto the terrace like it owes him money.',
        },
        {
          id: 'table',
          name: 'Terrace table',
          rect: { x: 640, y: 250, w: 180, h: 110 },
          colour: '#7a5a3a',
          look: 'A dining table on the terrace with a row of books standing across the middle, like a net, and two cigar-box lids lying on top. Is that... table tennis? Made out of furniture?',
        },
        {
          id: 'algernon',
          name: 'Young gentleman',
          rect: { x: 840, y: 140, w: 90, h: 200 },
          colour: '#b85a3a',
          sprite: 'algernon.png',
          look: 'A young gentleman in a striped blazer, peering sadly over the terrace railings at the cliff below.',
        },
      ],
      stand: { phil: [{ x: 560, y: 440 }] },
    },
  },
  rules: [
    // ---- Getting about ----
    {
      on: 'steps',
      say: ['Phil trots down the 199 steps.', 'Me: ...a hundred and ninety-eight, a hundred and ninety-nine. Jack would be so proud.'],
      do: ['goto:old_town'],
    },
    { on: 'steps_up', say: ['Phil drags himself back up all 199 steps.', 'Me: Never again. Until the next time.'], do: ['goto:east_cliff'] },
    { on: 'to_bridge', say: ['Phil follows Church Street along the harbour to the swing bridge.'], do: ['goto:bridge'] },
    { on: 'to_old_town', say: ['Phil heads back into the old town.'], do: ['goto:old_town'] },
    { on: 'to_west', say: ['Phil crosses the bridge and climbs up to the West Cliff.'], do: ['goto:west_cliff'] },
    { on: 'to_bridge2', say: ['Phil heads back down the hill to the bridge.'], do: ['goto:bridge'] },

    // ---- What Phil's thinking (tap Phil) ----
    { look: 'phil', if: '!knows_date', say: ["Me: Phil Mead. Engaged. Cyber security. Currently standing in a graveyard. Step one: find out where I am, without looking like I don't know where I am."] },
    { look: 'phil', if: '!stoker_paid', say: ["Me: No money, no phone, wrong century. Mr Stoker's stuck with his book, and I've got nothing to sell but my good looks. And my cards."] },
    { look: 'phil', if: '!got_suit !seen_doorman', say: ["Me: I've got money now. Sort of. Next: a bed for the night. Somewhere nice. Somewhere with carpets."] },
    { look: 'phil', if: '!got_suit', say: ["Me: Apparently joggers are 'nightclothes' on the West Cliff. If I'm going in there, I need to look like I belong in there."] },
    { look: 'phil', if: '!in_hotel', say: ["Me: Look at me. Practically gentry. That doorman's a tough crowd, though. He wants a guest's name. A proper name."] },
    { look: 'phil', if: '!heard_ball_lost', say: ["Me: Somebody on that terrace looks very sad about something. I'm a people person. I should find out what."] },
    { look: 'phil', if: '!got_float', say: ["Me: They need a ball. Something small, round, light and bouncy. Whitby's not exactly a sports shop, but there must be something."] },
    { look: 'phil', if: '!wager_asked', say: ['Me: Ball, bat, table, opponent. Time to ask for a game.'] },
    { look: 'phil', if: '!challenge_accepted', say: ["Me: He won't play for money. What have I got that nobody in 1890 could buy?"] },
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

    { look: 'cards', if: 'stoker_paid', say: ['Me: A fire salamander, a grumpy rock crab, a shiny golden dragon, and a gap where the bat used to be. I\'ll get over it. I won\'t get over it.'] },
    { look: 'cards', if: 'knows_date', say: ["Me: A fire salamander, a grumpy rock crab, a purple bat with fangs and a shiny golden dragon. And not a shop in 1890 that'll sell me a single new pack."] },
    { on: 'stoker', item: 'cards', if: 'stoker_paid', say: ["Stoker: No more, thank you, the bat is perfect. I couldn't possibly take the dragon."] },
    { on: 'stoker', item: 'cards', if: '!knows_date', say: ["Stoker: Coloured cards? Not now, please, whatever they are. I'm hopelessly stuck."] },
    { on: 'stoker', item: 'cards', say: ['Stoker: Pictures of beasts? Show me, then. Quickly.'], choices: cardChoices },
    { on: 'stoker', item: 'bat', say: ["Stoker: A paddle? For butter? No, no. A CREATURE, man. One that can reach a high window."] },
    { on: 'stoker', item: 'kipper', say: ["Stoker: Thank you, no. I've just eaten. And I'm working."] },
    { on: 'stoker', item: 'coin', say: ["Stoker: It's yours, sir. You earned it."] },

    {
      on: 'sailor',
      if: '!heard_sailor',
      say: [
        "Sailor: Looking at the stones, are ye? Half of 'em have nobody under 'em. Lost at sea, every one.",
        "Sailor: And five year back a Russian ship ran aground in a storm, and a great black dog leapt off her and ran straight up these steps. Never seen again.",
        'Me: That dog?',
        "Sailor: What dog?",
      ],
      do: ['set:heard_sailor'],
    },
    {
      on: 'sailor',
      if: '!stoker_paid',
      say: [
        "Sailor: Him next to me's been mithering about wings all afternoon. I told him: there's things with wings in that Abbey every night. Does he listen?",
        "Sailor: Do ye like a sea shanty, lad?",
        "Me: I'm more of a pop-punk man, young man. Shouty songs about being sad, played very fast. There's a festival in Leeds I cannot miss.",
        'Sailor: Leeds? Ye poor soul.',
      ],
    },
    { on: 'sailor', say: ['Sailor: Leeds, he says. Pop punk, he says. I shall have that on my gravestone.'] },
    { on: 'sailor', item: 'kipper', say: ["Sailor: I've been eating kippers for seventy year, lad. I'd rather eat my pipe."] },
    { on: 'sailor', item: 'cards', say: ['Sailor: A dragon! I saw one off Robin Hood\'s Bay in seventy-one. Smaller than that.'] },

    { on: 'black_dog', say: ['Dog: Grrrrr.', 'Me: Good boy? ...Bad boy? Some sort of boy.'] },
    { on: 'black_dog', item: 'kipper', say: ['The black dog sniffs the kipper, looks at Phil with deep disappointment, and turns away.', 'Me: Even the hound of hell has standards.'] },
    { on: 'black_dog', item: 'bat', say: ["Me: I'm not playing fetch with that dog. I'd never get the bat back. Or my arm."] },

    { on: 'abbey', say: ["Me: It's a ruin. Nothing in there but bats and draughts."] },
    { on: 'graves', say: ["Me: I'm not touching those. I've seen films."] },
    { on: 'view', say: ["Me: An abbey, a graveyard and a harbour. With my phone, this'd be the best monster-catching spot in Yorkshire. And my phone is... on a bit of gravel in Knaresborough. A hundred and thirty-six years from now."] },

    // ---- Church Street ----
    {
      on: 'pawnshop',
      if: '!got_suit',
      say: [
        "Pawnbroker: Buying or selling? And what in heaven's name are you wearing?",
        'Me: Joggers, young man. Very fashionable.',
        "Pawnbroker: Not round here they're not. You look like you've escaped from somewhere.",
        "Pawnbroker: There's a gent's suit in the window, if you've the money. Two and six.",
        'Me: Two and six what?',
        'Pawnbroker: Two shillings and sixpence, lad. Where are you from?',
        'Me: ...Harrogate.',
        'Pawnbroker: That explains it.',
      ],
    },
    { on: 'pawnshop', say: ["Pawnbroker: Suit's grand on you. My late brother-in-law would be proud. He'd be cold, mind."] },
    {
      on: 'pawnshop',
      item: 'coin',
      if: '!got_suit',
      say: [
        'Pawnbroker: Half a crown. Right you are.',
        'Phil changes behind a curtain at the back of the shop, between a stuffed owl and a mangle.',
        'He comes out in a three-piece tweed suit, a stiff collar and a watch chain with no watch on it. He has kept his trainers on.',
        'Me: Well. Look at me, young man. I look like money.',
        'Pawnbroker: You look like my late brother-in-law. It were his suit.',
        'Me: ...Lovely.',
      ],
      do: ['take:coin', 'set:got_suit'],
    },
    { on: 'price_card', item: 'coin', say: ["Me: I can't pay a card. I need to give it to the pawnbroker."] },
    { on: 'price_card', say: ["Me: Two-slash-six. I'm going to need someone to explain this to me, slowly."] },
    { on: 'pawnshop', item: 'cards', say: ['Pawnbroker: Painted cards? Farthing for the lot.', "Me: A farthing? Where I'm from, the dragon alone is worth a week in Tenerife.", 'Pawnbroker: Then go back to where you\'re from.'] },
    { on: 'pawnshop', item: 'bat', say: ["Pawnbroker: Funny little paddle. I'll give you a penny.", 'Me: Not for sale, young man. Not for all the pennies in Whitby.'] },
    { on: 'pawnshop', item: 'kipper', say: ["Pawnbroker: I don't take fish, lad. Not after last time."] },

    {
      on: 'jet',
      if: '!heard_jeweller',
      say: [
        'Jeweller: Whitby jet, sir. Mourning jewellery. Ever since the Prince died, the Queen wears nowt else, so neither does anyone.',
        'Me: Got any wedding rings? I\'m getting married soon.',
        "Jeweller: In jet, sir? It's for funerals.",
        "Me: Probably not the look we're going for, then.",
        'Jeweller: A pin for your hat, perhaps? I sold one this morning to a Mr Fanshawe, from the big hotel on the West Cliff. Young gent, striped blazer, never stopped talking. For his new topper.',
        'Me: What happened to the old one?',
        'Jeweller: Left it hanging in some well at Knaresborough, he said. To turn to stone, if you please.',
        'Me: A well. At Knaresborough. That turns things to stone.',
        'Jeweller: Daft, isn\'t it?',
        'Me: Very daft. Very, very daft.',
      ],
      do: ['set:heard_jeweller'],
    },
    { on: 'jet', say: ['Jeweller: Can I interest sir in a brooch? Very slimming. Black always is.'] },
    { on: 'jet', item: 'cards', say: ['Jeweller: Charming. But I only deal in jet, sir. Have you got a black dragon?'] },
    { on: 'jet', item: 'coin', say: ["Jeweller: Half a crown? Two and six won't buy you much in here, sir. A very small bead."] },
    { on: 'jet', item: 'kipper', say: ['Jeweller: Not near the brooches, sir, please.'] },

    {
      on: 'smokehouse',
      say: ['Phil holds his hands up to the warm smokehouse door.', "Me: Oh, that's the stuff. I could live here. Apart from the smell. And the fish. And the smoke."],
    },
    { on: 'smokehouse', item: 'kipper', say: ["Me: I'm not putting it back. That's how you get told off by a fishwife."] },

    {
      on: 'fishwife',
      if: '!got_kipper heard_hungry',
      say: [
        "Me: Excuse me, young man. Could I take one of those kippers? Not for me. There's a fisherman on the quay who hasn't eaten since four this morning.",
        'Fishwife: Eeh, you soft lad. Go on, then. On the house.',
        'She hands Phil a kipper. It is still warm. It is looking at him.',
        'Fishwife: And less of the young man. Cheeky.',
      ],
      do: ['give:kipper', 'set:got_kipper'],
    },
    {
      on: 'fishwife',
      if: '!got_kipper',
      say: [
        'Fishwife: Eeh, love, you look perished. And thin as a lath. When did you last eat? Have a kipper, fresh out the smoke.',
        "Me: That's very kind, young man, but I'm... particular. I don't eat anything with a face. Or bones. Or a smell.",
        "Fishwife: Particular! Suit yourself, love. There's folk on this harbour would bite my hand off for one of these.",
      ],
    },
    { on: 'fishwife', if: 'has:kipper', say: ["Fishwife: Go on, take it to your friend, love, before it goes cold."] },
    { on: 'fishwife', if: 'got_suit', say: ['Fishwife: Ooh, look at you! Nice suit. Not nice shoes.'] },
    { on: 'fishwife', say: ["Fishwife: Still particular, love?"] },
    { on: 'fishwife', item: 'kipper', say: ["Fishwife: Don't you dare give that back. You'll hurt my feelings. Somebody'll want it, if you don't."] },
    { on: 'fishwife', item: 'coin', say: ["Fishwife: Half a crown? That's two and six, love! I can't change that. Keep your money."] },
    { on: 'fishwife', item: 'cards', say: ["Fishwife: Pretty pictures, love. Can't eat 'em, though."] },

    // Phil and food.
    {
      on: 'phil',
      item: 'kipper',
      say: [
        "Me: No. I don't eat fish. I don't eat anything with a face. Or bones. Or a smell. Or a texture.",
        "Me: I'll hang on to it, though. It was a kind thought. Somebody hungrier than me might want it.",
      ],
    },

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
        "Fisherman: Lad, you're a saint. If there's owt I can do for thee, just say.",
        "Me: Don't mention it. Really. I don't want to think about it.",
      ],
      do: ['take:kipper', 'set:fisherman_fed'],
    },
    { on: 'fisherman', item: 'bat', say: ["Fisherman: Funny little paddle. You'll not row far with that."] },
    { on: 'fisherman', item: 'cards', say: ['Fisherman: Can\'t eat pictures, lad.'] },
    { on: 'fisherman', item: 'coin', say: ["Fisherman: Keep it. It's food I want, not money."] },

    { on: 'nets', if: '!fisherman_fed', say: ['Fisherman: Oi! Hands off my nets.'] },
    {
      on: 'nets',
      if: 'heard_ball_lost !got_float',
      say: [
        'Me: Young man, could I have one of these little cork floats? It\'s for a game.',
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
    { on: 'keeper', item: 'kipper', say: ["Keeper: Had me dinner, thanks. Kippers, funnily enough."] },
    { on: 'keeper', item: 'cards', say: ["Keeper: No cards on the bridge. House rule. Well, bridge rule."] },

    {
      on: 'paperboy',
      say: [
        'Paperboy: Gazette! Read all about it! Russian ship in port! Famous author in town! Yorkshire beat Lancashire at cricket!',
        'Me: Love all sport, me. Even this one.',
        'Me: (Quietly.) Best not mention to anyone round here that I support a team from Manchester.',
      ],
    },
    { on: 'paperboy', item: 'coin', say: ["Paperboy: Half a crown for a penny paper? That's two and six, mister! I can't change that!"] },
    { on: 'paperboy', item: 'cards', say: ['Paperboy: Cor! Is that a DRAGON? Can I have it?', 'Me: No.'] },
    { on: 'paperboy', item: 'kipper', say: ["Paperboy: I'm sick of kippers, mister. Me mam does 'em every day."] },

    { on: 'ship', say: ["Me: I'm not going anywhere near those boxes. Nobody ships earth for a good reason."] },
    { on: 'ship', item: 'kipper', say: ["Me: I'm not feeding anything that lives in one of those boxes."] },

    // ---- The West Cliff ----
    {
      on: 'doorman',
      if: 'in_hotel',
      say: ['Doorman: Sir.'],
    },
    {
      on: 'doorman',
      if: '!got_suit',
      say: [
        "Doorman: The terrace is for residents and gentlemen only, I'm afraid.",
        "Me: I'm a gentleman, young man.",
        'Doorman: In your nightclothes, sir? Off you trot.',
      ],
      do: ['set:seen_doorman'],
    },
    { on: 'doorman', say: ['Doorman: Can I help sir?'], choices: doormanChoices },
    { on: 'doorman', item: 'cards', say: ["Doorman: We don't accept calling cards at the gate, sir. Even ones with dragons on."] },
    { on: 'doorman', item: 'kipper', say: ['Doorman: Not on the steps, sir.'] },
    { on: 'doorman', item: 'coin', if: '!got_suit', say: ["Doorman: I can't be bought, sir. And certainly not for half a crown."] },

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
    {
      on: 'algernon',
      if: 'has:float !in_hotel',
      say: ["Algernon: Is that a ball? Splendid! But I can't play you through the railings, old bean. Come round to the terrace."],
    },
    { on: 'algernon', if: 'has:float !wager_asked', ...wagerAsk },
    { on: 'algernon', if: 'has:float !challenge_accepted', say: ["Algernon: Put up something worth winning, old chap, and I'll play you. Something rare."] },
    { on: 'algernon', if: 'challenge_accepted', say: ['Algernon: Whenever you\'re ready, old chap. Bats at the ready!'] },
    { on: 'algernon', if: '!in_hotel', say: ['Algernon: No ball, no whiff-whaff. Cork, it was. Bounced like a dream. And residents only on the terrace, I\'m afraid. Hobbs is very strict.'] },
    { on: 'algernon', say: ['Algernon: No ball, no game. Cork, it was. Light as a feather and round as a pea. Oh, it bounced like a dream.'] },
    { on: 'algernon', item: 'float', if: '!in_hotel', say: ["Algernon: A ball! But I can't play you through the railings, old bean. Come round to the terrace."] },
    { on: 'algernon', item: 'float', if: '!wager_asked', ...wagerAsk },
    { on: 'algernon', item: 'float', if: '!challenge_accepted', say: ['Algernon: Yes, yes, the ball. But what are you putting up, old chap? Something rare.'] },
    { on: 'algernon', item: 'bat', if: 'challenge_accepted', say: ['Algernon: Not at me, old chap! At the table!'] },
    { on: 'algernon', item: 'bat', if: '!heard_ball_lost', say: ['Algernon: I say, what a peculiar paddle!'] },
    { on: 'algernon', item: 'bat', if: '!has:float', say: ['Algernon: What a splendid paddle! Useless without a ball, alas.'] },
    { on: 'algernon', item: 'bat', if: '!in_hotel', say: ["Algernon: Bat and ball! But I can't play you through the railings, old bean. Come round."] },
    { on: 'algernon', item: 'bat', if: '!wager_asked', ...wagerAsk },
    { on: 'algernon', item: 'bat', say: ['Algernon: Splendid paddle. But first, the wager. Something rare, old chap.'] },
    {
      on: 'algernon',
      item: 'cards',
      if: 'wager_asked !challenge_accepted',
      say: ['Algernon: Picture cards? Let me see. Which are you putting up?'],
      choices: wagerChoices,
    },
    { on: 'algernon', item: 'cards', say: ['Algernon: Collectable cards? How frightfully modern. Do you have any of cricketers?'] },
    { on: 'algernon', item: 'kipper', say: ['Algernon: Kippers are for breakfast, old chap. It\'s practically teatime.'] },

    { on: 'table', item: 'bat', if: 'challenge_accepted', ...match },
    { on: 'table', if: 'challenge_accepted', ...match },
    { on: 'table', if: '!in_hotel', say: ["Me: It's behind the railings. Residents and gentlemen only."] },
    { on: 'table', item: 'bat', if: '!has:float', say: ["Me: Bat: yes. Table: sort of. Ball: no. That's not a game, that's a mime."] },
    { on: 'table', item: 'bat', say: ['Me: I need someone to play. Ideally someone who thinks they\'re good.'] },
    { on: 'table', item: 'float', if: 'challenge_accepted', say: ['Me: Ball on the table. Now I just need my bat.'] },
    { on: 'table', say: ["Me: Books for a net. Cigar boxes for bats. I've never loved anything more."] },

    { on: 'hotel', say: ["Me: Big windows. Thick carpets, I bet. Radiators, maybe? No. It's 1890. Fires, then. Big ones."] },
    { on: 'arch', say: ['Phil walks under the whalebone arch.', "Me: Swallowed by a whale. Tick. That's going on the list."] },

    // ---- Anywhere else ----
    { on: '*', item: 'cards', say: ["Me: I'm not just waving my cards about, young man. They're mint condition."] },
    { on: '*', item: 'bat', say: ["Me: I'm not whacking that. This bat is for table tennis and for table tennis only."] },
    { on: '*', item: 'coin', say: ["Me: I'm not just handing this over. It's all the money I've got, and I don't know what it buys."] },
    { on: '*', item: 'kipper', say: ["Me: I'm not just leaving a kipper lying about. Somebody might want it. Not me. Somebody."] },
    { on: '*', item: 'float', say: ["Me: It's a bit small for that. It's ball-sized. I should find someone who's lost a ball."] },
  ],
  puzzles: [
    { id: 'p1', label: 'Puzzle 1', solved: 'stoker_paid' },
    { id: 'p2', label: 'Puzzle 2', solved: 'got_suit' },
    { id: 'p3', label: 'Puzzle 3', solved: 'in_hotel' },
    { id: 'p4', label: 'Puzzle 4', solved: 'got_float' },
    { id: 'p5', label: 'Puzzle 5', solved: 'match_won' },
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
    'Later, Phil stands at the window of the nicest room he has ever slept in, wearing a dead man\'s suit, looking at the moon over the Abbey.',
    'Me: Bed. Roof. Rich friend. Not bad for day one.',
    "Me: The wedding. The festival. I've got to get back for both.",
    "Me: Rob'll be fine. Rob's always fine. He'll have found a soapbox somewhere.",
    'Me: But Jack...',
    "Me: I wonder how Jack's getting on.",
    "To be continued. Chapter 2 is Jack's.",
  ],
};
