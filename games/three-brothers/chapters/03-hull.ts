import type { Chapter, Choice, Rule } from '../types';

/**
 * SPOILERS: this file is the puzzle solutions.
 * If you haven't played Chapter 3 yet, play it first.
 */

/** Both half crowns: the fare to anywhere worth going. */
const BOTH_COINS = 'has:halfcrown_pub has:halfcrown_paper';

/** Rob opens the book. Looking at it, or using it on himself, does the same. */
const READ_PASSAGE = [
  'Rob opens it at the Whitby chapters, just to check something.',
  'Old Mr Swales, on his bench in the churchyard, the night before the storm:',
  "'Young man,' says he, 'I've a mind to get to Knaresborough afore I go. There's a well there. It's all about the well, young man.'",
  'Me: ...',
  "Me: That's not how Swales talks.",
];

/** Who scored? Rob can only offer names once he's seen them written down. */
function nameChoice(name: string): Choice {
  return {
    label: `It was ${name}.`,
    if: 'seen_photo',
    say: ['Editor: You saw him score?', 'Me: ...In a sense.', "Editor: 'In a sense' doesn't go in my paper. Come back when you're sure."],
  };
}

const scorerChoices: Choice[] = [
  nameChoice('Hirst'),
  {
    label: 'It was Robinson.',
    if: 'seen_photo',
    say: ["Editor: Robinson's the goalkeeper.", 'Me: Exactly. Nobody ever gives them the credit.', 'Editor: Out.'],
  },
  nameChoice('Leaper'),
  {
    label: 'It was Coultas.',
    if: 'seen_photo heard_bandage heard_stitches',
    say: [
      'Editor: Coultas. You saw him score?',
      'Me: I was facing that way.',
      'Editor: How did it go in?',
      "Me: Header, off a corner. Bandage round his head, six stitches under it. First game back.",
      'Editor: ...Fine.',
      "Editor: First game back, and he nods one in with his head sewn up. Now THAT'S a story.",
      'He takes the notebook, licks a blue pencil, and starts crossing out.',
      'Editor: Fourteen pages on the left-back. Gone. The weather. Gone. A history of the offside rule...',
      'Me: That took me twenty minutes.',
      'Editor: Gone. Thirty lines, at a penny a line. Half a crown. And take a late edition, they\'re just up from the presses.',
      'Me: Thirty lines. I had four hundred.',
      'Editor: And three hundred and seventy of them were about you.',
    ],
    do: ['take:draft', 'give:halfcrown_paper', 'give:late_edition', 'set:report_paid'],
  },
  ...['seen_photo !heard_bandage', 'seen_photo heard_bandage !heard_stitches'].map((cond) => ({
    label: 'It was Coultas.',
    if: cond,
    say: ['Editor: Coultas. Did you see him score?', 'Me: Not as such.', "Editor: Then you're guessing, and so am I. Find out how it went in."],
  })),
  nameChoice('Wright'),
  nameChoice('Spicer'),
  { label: "I'll find out.", say: ['Editor: Do.'] },
];

/** Where to, sir? */
const ticketChoices: Choice[] = [
  { label: 'York, please.', say: ['Me: ...No. Sorry. I would only go and stand where my house is going to be.'] },
  { label: 'Scarborough.', say: ["Me: ...No. There's nobody there in January. There's barely anybody there in July."] },
  { label: 'Whitby.', say: ["Clerk: Five and three, sir.", "Me: ...No. Too many steps, Whitby."] },
  {
    label: 'Knaresborough.',
    if: '!read_passage',
    say: ['Me: Back to the well. Back to HER.', "Me: ...No. You don't go back to the well. Nobody who goes back to the well is in the sequel."],
  },
  {
    label: 'Knaresborough.',
    if: `read_passage ${BOTH_COINS}`,
    say: [
      'Clerk: Third class to Knaresborough, by way of York. Four and six, sir. Single or return?',
      "Me: Single. I need to get home. I've got a bun in the oven.",
      "Clerk: Then you'll want to hurry, sir, before it burns.",
      'Me: Not that sort of bun.',
      'Clerk: I know, sir. I was being kind.',
      'He takes both half crowns and slides back a stiff little card ticket and a sixpence, which would have got Rob into the match.',
    ],
    do: ['take:halfcrown_pub', 'take:halfcrown_paper', 'give:ticket', 'set:ticket'],
  },
  ...['read_passage !has:halfcrown_pub', 'read_passage !has:halfcrown_paper'].map((cond) => ({
    label: 'Knaresborough.',
    if: cond,
    say: ['Clerk: Third class to Knaresborough, by way of York. Four and six, sir.', 'Me: Four and six. Is that a lot?', 'Clerk: It\'s four and six, sir.', 'Me: Hold that thought.'],
  })),
  { label: 'Never mind.', say: ['Clerk: Sir.'] },
];

/** The same polite refusal for a leaflet nobody wants. */
function leafletTo(on: string, line: string): Rule {
  return { on, item: 'leaflet', say: [line] };
}

export const hull: Chapter = {
  id: 'hull',
  number: 3,
  title: 'Deliver Us From Hull',
  author: 'Jack (story) and Claude (puzzles)',
  era: 'January 1906',
  place: 'Hull',
  brothers: ['rob'],
  inDevelopment: true,
  start: {
    scene: 'market',
    brother: 'rob',
    inventory: { rob: ['phone', 'dollies'] },
  },
  extras: {
    reader: { name: 'Woman on the bench', colour: '#f08fb0', at: { x: 702, y: 247 } },
    steward: { name: 'Steward', colour: '#f4d35e', at: { x: 778, y: 165 } },
    landlord: { name: 'Landlord', colour: '#e8a33d', at: { x: 505, y: 230 } },
    editor: { name: 'Editor', colour: '#7fb8d9', at: { x: 737, y: 219 } },
    gateman: { name: 'Gateman', colour: '#a0d9a0', at: { x: 245, y: 227 } },
    boy: { name: 'Boy', colour: '#f2cc2f', at: { x: 807, y: 273 } },
    clerk: { name: 'Ticket clerk', colour: '#c9a0dc', at: { x: 276, y: 240 } },
    guard: { name: 'Guard', colour: '#c9bfae', at: { x: 760, y: 110 } },
  },
  intro: [
    "Meanwhile, nearly thirteen hundred years after Jack's mead hall, and about thirty miles away.",
    '[flash]',
    '[shake 1]',
    "Hull, on the Humber. January 1906. A freezing morning in the old Market Place, and every wall has an election poster on it.",
    'A streak of light falls out of a grey sky and drops a very tall man onto the cobbles, followed closely by his soapbox.',
    'The soapbox comes off worse.',
    'Rob Mead gets up, looks at the wreckage, and takes it personally.',
    "Me: Right. Fine. Nursery pick-up's at five.",
    'Me: Jack? Phil? ...No. Course not.',
    "Tap a thing to use it, or a person to talk to them. Hold (or right-click) to look. Tap an item, then a thing, to use them together. Tap Rob's portrait to hear what he's thinking.",
  ],
  items: {
    phone: {
      name: 'Phone',
      icon: 'phone',
      look: 'My phone. One per cent. Forty-one photos of my son asleep, and the scan of the next one, which looks like the weather forecast.',
    },
    dollies: {
      name: 'Bag of dolly mixture',
      icon: 'tea',
      look: "A bag of dolly mixture. I'm rationing them. I have never rationed anything in my life.",
    },
    strap: {
      name: 'Bent iron strap',
      icon: 'bat',
      look: 'The iron strap off the corner of my soapbox. The crash has bent it double, like a hairpin.',
    },
    strap_flat: {
      name: 'Flat iron strap',
      icon: 'bat',
      look: 'The soapbox strap, flat as a ruler again. A thin, stiff bit of iron. My handiwork.',
    },
    lid: {
      name: 'Soapbox lid',
      icon: 'cards',
      look: 'The lid of my soapbox. One good oak plank, worn smooth by years of being right. Years of me stamping on it to make a point, and not a dent.',
    },
    leaflet: {
      name: 'Liberal leaflet',
      icon: 'newspaper',
      look: 'A Liberal leaflet. Small print, big promises, and my corrections in pencil.',
    },
    notebook: {
      name: "Reporter's notebook",
      icon: 'cards',
      look: 'A reporter\'s notebook and a stub of pencil. Empty. For now.',
    },
    draft: {
      name: 'Match notes',
      icon: 'cards',
      look: "Fourteen pages. A diagram of the left-back's positioning. A short history of the offside rule. The final score, I'm fairly sure, was one-nil. Somebody scored. Somebody on our side, I think.",
    },
    halfcrown_pub: {
      name: 'Half crown from the pub',
      icon: 'coin',
      look: 'Half a crown, from the landlord. Two shillings and sixpence. He told me that twice, slowly.',
    },
    halfcrown_paper: {
      name: 'Half crown from the paper',
      icon: 'coin',
      look: 'Half a crown from the paper. Two and six. For thirty lines.',
    },
    late_edition: {
      name: 'Late edition',
      icon: 'newspaper',
      look: "Tonight's Hull Daily Mail, still warm. Page six: CITY'S NARROW WIN, by Our Correspondent. Thirty lines. Not one about the left-back.",
    },
    dracula: {
      name: 'Dracula',
      icon: 'newspaper',
      look: 'Dracula, in a yellow cover. Read it twice.',
    },
    ticket: {
      name: 'Train ticket',
      icon: 'cards',
      look: 'Third class, Hull to Knaresborough, by way of York.',
    },
  },
  scenes: {
    market: {
      name: 'The Market Place',
      background: 'hull-market.webp',
      description:
        "Hull's old Market Place, freezing cold. A gilded King William sits on a golden horse. There's a pub, the newspaper office, the Liberal hall with a steward on the door, and roads out to the station and to the football.",
      placeholder: { top: '#6a7482', bottom: '#57504a' },
      hotspots: [
        { id: 'to_station', name: 'Paragon Station road', exit: 'left', rect: { x: 0, y: 170, w: 110, h: 220 }, colour: '#6f7f8f', look: 'The road to Paragon Station. Trains. Out of Hull, if you can pay for it.' },
        { id: 'to_pub', name: 'Ye Olde White Harte', exit: 'up', rect: { x: 140, y: 140, w: 80, h: 200 }, colour: '#6a4a2a', look: 'Ye Olde White Harte, down a little alley. Very old, very crooked, and very proud of it.' },
        { id: 'wreck', name: 'Wrecked soapbox', if: '!got_wreck', prop: 'soapbox', rect: { x: 260, y: 350, w: 120, h: 60 }, colour: '#7a5a3a', look: "My soapbox. What's left of it. We've been through a lot together, that box and me. Mostly council meetings." },
        { id: 'statue', name: 'King William statue', rect: { x: 465, y: 5, w: 175, h: 365 }, colour: '#d9b53a', look: 'King Billy, gilded from crown to hoof, on a golden horse. Somebody has polished him this morning. In January.' },
        { id: 'to_office', name: 'Hull Daily Mail office', exit: 'up', rect: { x: 265, y: 190, w: 200, h: 155 }, colour: '#4a4a5a', look: 'The offices of the Hull Daily Mail. A sign in the window: CORRESPONDENTS WANTED. Bring your own pencil.' },
        { id: 'reader', name: 'Woman on the bench', if: '!got_book', sprite: 'reader.png', rect: { x: 672, y: 272, w: 61, h: 110 }, colour: '#7a3a5a', look: "A woman reading on a bench, in this cold, so gripped that she hasn't noticed her tea has gone cold. Dracula, the yellow cover. About two-thirds in. I'm trying very hard not to say anything." },
        { id: 'bicycle', name: 'Bicycle', if: '!bike_moved', sprite: 'bicycle.png', rect: { x: 770, y: 316, w: 125, h: 77 }, colour: '#3f7a6a', look: 'A bicycle, parked across the whole pavement. Even in 1906.' },
        { id: 'hall', name: 'Liberal hall', rect: { x: 600, y: 35, w: 300, h: 235 }, colour: '#a08a4a', look: 'The Liberal hall, with a poster: MR LLOYD GEORGE SPEAKS TONIGHT, 8 O\'CLOCK. A steward is guarding the door like it is the last seat on earth.' },
        { id: 'to_boulevard', name: 'Hessle Road', exit: 'right', rect: { x: 895, y: 200, w: 65, h: 180 }, colour: '#8a8a70', look: 'The road out along Hessle Road, towards the football ground. You can hear the crowd from here.' },
      ],
      stand: { rob: [{ x: 560, y: 440 }] },
    },
    pub: {
      name: 'Ye Olde White Harte',
      background: 'hull-pub.webp',
      description:
        "A crooked old pub, all dark beams and low doorways. A landlord with nothing to pour, a trapdoor in the floor behind the bar, a framed team photograph, and the door to a back room with a sign on it.",
      placeholder: { top: '#5a3a24', bottom: '#4a3020' },
      hotspots: [
        { id: 'pub_door', name: 'Market Place', exit: 'left', rect: { x: 0, y: 120, w: 105, h: 290 }, colour: '#8a7a60', look: 'The way back out to the cold.' },
        { id: 'photo', name: 'Team photograph', rect: { x: 160, y: 128, w: 110, h: 100 }, colour: '#b0a080', look: 'Hull City, this season, arms folded. Names underneath, if anybody cares to read them out. I care to.' },
        { id: 'landlord', name: 'Landlord', sprite: 'landlord.png', rect: { x: 460, y: 255, w: 89, h: 150 }, colour: '#5a3a2a', look: "The landlord, polishing a glass he hasn't got anything to put in." },
        { id: 'trapdoor', name: 'Trapdoor', if: '!trapdoor_open', rect: { x: 675, y: 340, w: 175, h: 78 }, colour: '#4a3a28', look: 'A trapdoor to the cellar. The iron ring has snapped clean off. All that\'s left is a hairline crack round the edge.' },
        { id: 'to_cellar', name: 'Open trapdoor', exit: 'down', if: 'trapdoor_open', sprite: 'trapdoor-open.png', rect: { x: 675, y: 254, w: 279, h: 160 }, colour: '#1a1410', look: 'Stone steps going down into the dark.' },
        { id: 'parlour', name: 'Plotting Parlour', rect: { x: 805, y: 85, w: 150, h: 255 }, colour: '#6a4a3a', look: "A low door with a painted sign: THE PLOTTING PARLOUR. 1642. I stand up straight to read it. In here, that's a mistake." },
      ],
      stand: { rob: [{ x: 300, y: 440 }] },
    },
    cellar: {
      name: 'The cellar',
      background: 'hull-cellar.webp',
      description: "The pub cellar. Cold stone steps lead back up to the bar.",
      placeholder: { top: '#141010', bottom: '#201810' },
      hotspots: [
        { id: 'cellar_steps', name: 'Cellar steps', exit: 'up', rect: { x: 0, y: 90, w: 180, h: 340 }, colour: '#4a3a28', look: 'The steps back up to the bar, and the light.' },
        { id: 'dark', name: 'The dark', if: '!lit', sprite: 'cellar-dark.png', rect: { x: 150, y: 0, w: 810, h: 456 }, colour: '#050404', look: "Black. Properly black. Like the inside of a goalkeeper's glove." },
        { id: 'barrel', name: 'Fallen barrel', if: 'lit !barrel_moved', sprite: 'cellar-barrel.webp', rect: { x: 205, y: 151, w: 368, h: 291 }, colour: '#6a4a2a', look: 'A full barrel of beer, off its rack and lying right across the floor. Eighteen gallons. You could get it back up there with a block and tackle and three men.' },
        { id: 'racks', name: 'Barrel racks', if: 'lit', rect: { x: 645, y: 60, w: 280, h: 300 }, colour: '#5a4030', look: 'Racks of barrels, all full, all out of reach of a thirsty town. Well. Out of reach of most people.' },
        { id: 'cat', name: 'Cat', if: 'lit', sprite: 'hull-cat.png', rect: { x: 867, y: 234, w: 36, h: 62 }, colour: '#222222', look: 'A large black cat, sitting on an empty barrel, looking at me as if I owe it money.' },
        { id: 'cobwebs', name: 'Cobwebs', if: 'lit', rect: { x: 120, y: 0, w: 210, h: 150 }, colour: '#7a7a7a', look: 'Cobwebs. A lot of them. Some of them are older than the pub.' },
      ],
      stand: { rob: [{ x: 220, y: 440 }] },
    },
    office: {
      name: 'Hull Daily Mail office',
      background: 'hull-office.webp',
      description: 'The newsroom: ink, pipe smoke and shouting. The editor sits under a lamp with a blue pencil, a spike of rejected copy at his elbow. Through a window, the presses.',
      placeholder: { top: '#4a4a52', bottom: '#3a3a40' },
      hotspots: [
        { id: 'office_door', name: 'Market Place', exit: 'left', rect: { x: 0, y: 70, w: 130, h: 350 }, colour: '#6f7f8f', look: 'The way back out to the Market Place.' },
        { id: 'spike', name: 'Spike', rect: { x: 205, y: 228, w: 60, h: 70 }, colour: '#c0c0c0', look: "A metal spike, with a stack of rejected stories on it. The top one starts: SIR, I AM DISGUSTED. It doesn't say what by. It doesn't need to." },
        { id: 'presses', name: 'Window onto the presses', rect: { x: 610, y: 20, w: 350, h: 255 }, colour: '#2a2a30', look: 'The presses, thundering away. Every word anyone in Hull writes today goes through those.' },
        { id: 'editor', name: 'Editor', sprite: 'editor.png', rect: { x: 694, y: 244, w: 86, h: 170 }, colour: '#3a3a5a', look: "The editor. He has a blue pencil and the expression of a man who has never once enjoyed a sentence." },
      ],
      stand: { rob: [{ x: 260, y: 440 }] },
    },
    boulevard: {
      name: 'Outside the Boulevard',
      background: 'hull-boulevard.webp',
      description:
        'Outside the Boulevard, where Hull City play. A high brick wall, a gate with a gateman, and a few boys hanging about.',
      placeholder: { top: '#8aa0b0', bottom: '#5a5048' },
      hotspots: [
        { id: 'boulevard_back', name: 'Market Place', exit: 'left', rect: { x: 0, y: 200, w: 105, h: 200 }, colour: '#8a8a70', look: 'Back to the Market Place.' },
        { id: 'gateman', name: 'Gateman', sprite: 'gateman.png', rect: { x: 214, y: 252, w: 61, h: 140 }, colour: '#3a5a3a', look: "A gateman with a cash box and a face that's heard every excuse." },
        { id: 'wall', name: 'Wall', rect: { x: 340, y: 190, w: 530, h: 180 }, colour: '#8a4a3a', look: 'A brick wall, about six foot high, with broken glass set all along the top. On the other side, the match. You can hear every tackle.' },
        { id: 'plank_on_wall', name: 'Plank on the wall', if: 'plank_on_wall', sprite: 'plank.png', rect: { x: 420, y: 190, w: 230, h: 19 }, colour: '#a07a4a', look: 'My good plank, laid along the glass on top of the wall.' },
        { id: 'boy', name: 'Boy', sprite: 'boy.png', rect: { x: 789, y: 298, w: 36, h: 98 }, colour: '#6a5a2a', look: 'A small boy with a scarf, scraped knees and the air of someone who knows everything about everything.' },
      ],
      stand: { rob: [{ x: 560, y: 440 }] },
    },
    station: {
      name: 'Paragon Station',
      background: 'hull-station.webp',
      description: "Paragon Station: a huge arched roof full of steam. A ticket window, a board of fares, and a train waiting.",
      placeholder: { top: '#5a6068', bottom: '#4a4640' },
      hotspots: [
        { id: 'station_back', name: 'Market Place', exit: 'left', rect: { x: 0, y: 200, w: 125, h: 220 }, colour: '#6f7f8f', look: 'Back to the Market Place.' },
        { id: 'clerk', name: 'Ticket window', rect: { x: 210, y: 180, w: 140, h: 175 }, colour: '#7a5a3a', look: 'A ticket clerk behind a brass grille, with the calm of a man who has heard every destination there is.' },
        { id: 'fares', name: 'Board of fares', rect: { x: 380, y: 135, w: 200, h: 265 }, colour: '#e8e2d0', look: 'Third class from Hull. York, 2s 9d. Leeds, 3s. Scarborough, 3s 9d. Knaresborough, 4s 6d. Whitby, 5s 3d. Everything goes by way of York. Everything always goes by way of York.' },
        { id: 'train', name: 'Waiting train', rect: { x: 630, y: 180, w: 330, h: 230 }, colour: '#3a3a42', look: "A big green engine, breathing steam. It's going to York. Everything is." },
      ],
      stand: { rob: [{ x: 300, y: 440 }] },
    },
  },
  rules: [
    // ---- What Rob's thinking (tap his portrait) ----
    { look: 'rob', if: '!got_wreck', say: ['Me: Rob Mead. Dad. Reader. Former goalkeeper. Currently on the floor of a market. First things first: the box.'] },
    { look: 'rob', if: 'read_passage !ticket', say: ['Me: I could get a train. I could get a train to anywhere. Well. Anywhere with a reason.'] },
    { look: 'rob', if: 'heard_bandage !report_paid', say: ["Me: A bandage. Lovely. That's a head, not a name. Somebody must write their names down somewhere."] },
    { look: 'rob', if: 'watched !report_paid', say: ['Me: Fourteen pages of first-class analysis, and he wants one name. Somebody in this town saw that goal. Somebody who was actually looking.'] },
    { look: 'rob', if: 'trapdoor_open !lit', say: ["Me: It's very dark down those steps. A grown man needs to see what he's lifting."] },
    { look: 'rob', if: 'heard_cellar !trapdoor_open', say: ['Me: A dry pub on election night. That is not a crisis, that is a scandal. All that stands in the way is a crack in a floor, and nothing I own is the right shape for it. Yet.'] },
    { look: 'rob', if: 'has:notebook !watched', say: ["Me: Paid by the line to watch City. I've been training for this my whole life. Sixpence to get in, mind, and I haven't got sixpence."] },
    { look: 'rob', if: 'has:halfcrown_pub has:halfcrown_paper has:dracula', say: ['Me: Five shillings, and a book I have read twice. Nobody needs to read a book three times. Do they?'] },
    { look: 'rob', if: 'has:halfcrown_pub has:halfcrown_paper', say: ["Me: Five shillings. I could go almost anywhere. I've just no idea where."] },
    { look: 'rob', say: ["Me: I need to get out of Hull. I don't know where to, and I couldn't pay for it if I did. And I've got a bun in the oven at home."] },

    // ---- Getting about ----
    { on: 'to_station', say: ['Rob walks up to Paragon Station.'], do: ['goto:station'] },
    { on: 'station_back', say: ['Rob heads back to the Market Place.'], do: ['goto:market'] },
    { on: 'to_pub', if: 'been_in_pub', say: ['Rob goes into the pub bent nearly double, like a man expecting an ambush.'], do: ['goto:pub'] },
    { on: 'to_pub', say: ['Rob ducks down the alley and into the pub. He ducks under the door frame. He forgets to duck under the beam.'], do: ['goto:pub', 'set:been_in_pub'] },
    { on: 'pub_door', say: ['Rob goes back out to the Market Place.'], do: ['goto:market'] },
    { on: 'to_office', say: ['Rob goes into the newspaper office.'], do: ['goto:office'] },
    { on: 'office_door', say: ['Rob steps back out into the cold.'], do: ['goto:market'] },
    { on: 'to_boulevard', say: ['Rob walks out along Hessle Road, towards the football ground.'], do: ['goto:boulevard'] },
    { on: 'boulevard_back', say: ['Rob walks back into town.'], do: ['goto:market'] },
    { on: 'to_cellar', say: ['Rob goes down the cellar steps, one at a time.'], do: ['goto:cellar'] },
    { on: 'cellar_steps', say: ['Rob climbs back up into the bar.'], do: ['goto:pub'] },

    // ---- The Market Place ----
    {
      on: 'wreck',
      say: ['Rob kneels by the wreck, the way you would for an old friend. Most of it comes apart in his hands.', 'Me: One good plank. One iron strap, bent double. The rest was only ever there to hold me up.'],
      do: ['give:lid', 'give:strap', 'set:got_wreck'],
    },
    { on: 'statue', say: ["Rob explains to the statue that it hasn't got any stirrups, and what that says about Hull. It takes eleven minutes.", 'The statue takes it well.'] },
    { on: 'statue', item: 'strap', say: ["Me: Not King Billy. He's had enough people trying to get rid of him, and he's got a horse."] },
    { on: 'statue', item: 'phone', say: ['Me: I could take a photo of him. One per cent, though. One per cent is for my son.'] },

    { on: 'bicycle', say: ['Rob picks the bicycle up and moves it off the pavement, properly, square against the wall.', 'A man in cycle clips appears from nowhere.', '"Oh, thank you!"', 'He gets on, and rides it away along the pavement.'], do: ['set:bike_moved'] },
    { on: 'bicycle', item: 'strap', say: ['Me: Tempting. Very tempting. No.'] },
    { on: 'bicycle', item: 'strap_flat', say: ['Me: Tempting. Very tempting. No.'] },
    { on: 'bicycle', item: 'lid', say: ["Me: I'm not giving it a ramp. It'll only get ideas."] },

    { on: 'hall', if: 'has:leaflet', say: ["Steward: Hall's full, sir. It's been full since four.", 'Me: I have notes for Mr Lloyd George.', 'Steward: So has Mr Lloyd George, sir. He has nothing but notes.'] },
    {
      on: 'hall',
      say: [
        "Steward: Hall's full, sir. Have a leaflet.",
        "Rob reads the leaflet twice, borrows the pencil from behind the steward's ear, corrects the third paragraph and hands it back.",
        'The steward looks at it for a while.',
        'Steward: ...You keep it, sir.',
      ],
      do: ['give:leaflet'],
    },
    { on: 'hall', item: 'phone', say: ['Steward: Very nice, sir. Is he a Liberal?', "Me: He's a baby.", 'Steward: Plenty of time.'] },

    {
      on: 'reader',
      if: '!heard_stitches',
      say: [
        "Reader: Oh! Sorry, love. I'm at the good bit.",
        'Me: Is that the bit where...',
        'Reader: DON\'T.',
        "Me: I wasn't going to.",
        "Reader: I'm only reading to take my mind off it. My Albert's playing for City this afternoon. First game back since they put six stitches in his head, poor lamb.",
        'Reader: Plays up front, does Albert. Takes after his father. Tall as a door.',
        'Me: How tall?',
        'Reader: Six foot two.',
        'Me: Oh. Medium, then.',
        "Reader: I'll not rest till I know if he's done owt. And I'm not going in that ground, not with my nerves.",
      ],
      do: ['set:heard_stitches'],
    },
    { on: 'reader', say: ["Reader: Has he done owt? No, don't tell me. Yes, tell me. No.", 'She goes back to her vampires.'] },
    {
      on: 'reader',
      item: 'late_edition',
      say: [
        'She snatches the paper and finds page six in one go.',
        "Reader: COULTAS! A header! With his stitches in! Oh, the daft lump, his head!",
        "Reader: Here, love, have this. I'll not have the head for vampires now. I'm off to find him and kill him.",
        'She pushes the book into Rob\'s hands and is gone, paper and all.',
        "Me: She's eighty pages from the end.",
        'He looks down the street after her for quite a long time.',
      ],
      do: ['take:late_edition', 'give:dracula', 'set:got_book'],
    },
    { on: 'reader', item: 'phone', say: ['Rob shows her his son.', 'Reader: Oh, he\'s a bonny lad. What\'s he in, a little window?', 'Me: Sort of.'] },
    { on: 'reader', item: 'notebook', say: ["Reader: I don't want your notebook, love. I want to know if my Albert's done owt."] },
    { on: 'reader', item: 'draft', say: ['Rob offers her his fourteen pages.', 'Reader: Is there owt in there about Albert?', "Me: There's a diagram.", 'Reader: Of Albert?', 'Me: Of where Albert should have been.'] },
    leafletTo('reader', "Reader: I've read it, love. It's all promises. Give me vampires any day. At least they mean it."),

    // ---- The pub ----
    {
      on: 'landlord',
      if: '!heard_cellar',
      say: [
        "Landlord: We're dry, before you ask. Election night, the whole town wants a drink, and we're dry.",
        "Landlord: Something's gone over in the cellar. I heard it go. And my potboy swears there's something else down there, moving about. So he's gone home, and here I am.",
      ],
      do: ['set:heard_cellar'],
    },
    {
      on: 'landlord',
      if: 'barrel_moved !paid_pub',
      say: [
        'Me: Done. Barrel\'s back on the rack. I lifted it up and held it there for a while, just to be sure.',
        'Landlord: I heard you. You shouted "is anybody watching" four times.',
        'Me: Hundred kilos, that.',
        "Landlord: I don't know what a kilo is, lad, but here's half a crown.",
      ],
      do: ['give:halfcrown_pub', 'set:paid_pub'],
    },
    { on: 'landlord', if: 'paid_pub', say: ["Landlord: First pint's on the house. Second's fourpence. If you're stopping, mind the beam.", "Me: I've met the beam."] },
    { on: 'landlord', if: 'trapdoor_open', say: ["Landlord: Well, go on, then. I'm not going down there. I've heard it moving about."] },
    { on: 'landlord', say: ["Landlord: Nowt to drink till somebody sorts that cellar. Not me. I've heard it moving."] },
    { on: 'landlord', item: 'phone', say: ['Rob shows the landlord his son.', "Landlord: What's he made of, glass?", "Me: He's ADVANCED."] },
    { on: 'gateman', item: 'strap', say: ["Gateman: That's not sixpence."] },
    { on: 'gateman', item: 'strap_flat', say: ["Gateman: That's not sixpence either."] },
    { on: 'boy', item: 'strap', say: ['Boy: Is it a sword?', "Me: It's a strap.", 'Boy: Can it be a sword?'] },
    { on: 'editor', item: 'strap', say: ['Editor: (without looking up) Not on my desk.'] },
    { on: 'editor', item: 'strap_flat', say: ['Editor: (without looking up) Not on my desk.'] },
    { on: 'clerk', item: 'strap', say: ['Clerk: We take money, sir. Not scrap.'] },
    { on: 'landlord', item: 'strap', say: ["Landlord: What do I want with that? I want a drink in my pumps, lad, not scrap."] },
    { on: 'landlord', item: 'strap_flat', say: ["Landlord: What do I want with that? I want a drink in my pumps, lad, not scrap."] },
    { on: 'landlord', item: 'dollies', say: ['Landlord: Very small. Very bright. No thank you.'] },
    { on: 'landlord', item: 'dracula', say: ['Landlord: Is it about a pub?', "Me: It's about a man who never drinks... wine.", 'Landlord: Get out.'] },
    leafletTo('landlord', "Landlord: Read it. The Liberals are going to shut the pubs at ten. I'm voting for the other lot."),

    { on: 'trapdoor', item: 'strap_flat', say: ['Rob slides the flattened strap into the crack, leans on it, and the trapdoor comes up with a groan.', 'Landlord: Well, I never.', 'Me: Leverage.', "Landlord: Don't. You'll tell me how."], do: ['set:trapdoor_open'] },
    { on: 'trapdoor', item: 'strap', say: ['Rob tries the strap in the crack. The bent end skids off, every time.', 'Me: Come on. Come ON.'] },
    { on: 'trapdoor', item: 'lid', say: ["Me: Too thick. You'd not get a plank in there. You'd not get a hair in there."] },
    { on: 'trapdoor', item: 'phone', say: ["Me: I'm not putting my phone in a crack in the floor. It's got my son on it."] },
    { on: 'trapdoor', say: ['Rob gets down on his knees and tries to get his fingers into the crack.', "Landlord: I've tried that.", "Me: You haven't got my grip.", 'Rob tries for some time.', "Me: Nobody's got the grip for that."] },

    { on: 'strap', item: 'lid', say: ['Rob lays the strap on the plank and stands on it. Then he jumps on it. Then, because somebody is watching, once more with a little twist at the end.', 'Me: Good as new. Better.'], do: ['take:strap', 'give:strap_flat', 'set:strap_flat'] },
    { on: 'lid', item: 'strap', say: ['Rob lays the strap on the plank and stands on it. Then he jumps on it. Then, because somebody is watching, once more with a little twist at the end.', 'Me: Good as new. Better.'], do: ['take:strap', 'give:strap_flat', 'set:strap_flat'] },
    { on: 'rob', item: 'strap', say: ['Rob grips the strap in both hands and pulls. Then he stops, as if he has just remembered an appointment.', "Me: Could. Obviously. But I've got a baby to lift later."] },

    { on: 'photo', say: ['Rob reads the names under the photograph, out loud, to the whole pub.', 'Me: Back row: W. Robinson, goal. A. Hirst, left back. J. Wright, centre half. Front row: T. Spicer, outside right. A. Coultas, centre forward. G. Leaper, inside left.', "Me: Arms folded, every one of them. Moustaches you could hang a coat on. And the goalkeeper's the only one smiling, because he knows."], do: ['set:seen_photo'] },
    { on: 'photo', item: 'phone', say: ['Me: I could take a photo of a photo. That\'s about the saddest use of one per cent I can think of.'] },

    { on: 'parlour', if: 'heard_parlour', say: ['Me: In this room, though.', 'Landlord: Still on the sign.'] },
    { on: 'parlour', do: ['set:heard_parlour'], say: ['Me: This is it. The very room where the governor decided to shut the gates on Charles the First, and started the Civil War. Right here.', 'Landlord: I know. It\'s on the sign.', 'Me: In this room.', 'Landlord: It\'s also on the door, the menu and the outside of the building.'] },

    // ---- The cellar ----
    {
      on: 'dark',
      item: 'phone',
      say: [
        'Rob holds up his phone and turns on the torch.',
        "Me: One per cent. It's been on one per cent for three hours. It knows what this is for.",
        'The light finds cobwebs, racks of barrels, and one barrel lying right across the middle of the floor.',
      ],
      do: ['set:lit'],
    },
    { on: 'dark', say: ['Rob takes one step into the dark, and stops.', 'Me: Hello?', 'The dark does not say hello.', 'Me: Nope.'] },
    { on: 'dark', item: 'strap_flat', say: ["Me: Poking it with a stick isn't going to make it any lighter."] },
    { on: 'dark', item: 'leaflet', say: ["Me: I could set fire to it. In a cellar. Full of beer barrels and spirits. Next."] },
    {
      on: 'barrel',
      say: [
        'Rob squats, wraps his arms round the barrel, and breathes in.',
        'He lifts it. Then, because he can, he lifts it over his head.',
        'He holds it there.',
        'He holds it there a bit longer.',
        'Me: IS ANYBODY WATCHING?',
        'Landlord: (from upstairs) NO.',
        'He puts it back on the rack, with the very slightly disappointed care of a man nobody saw.',
      ],
      do: ['set:barrel_moved'],
    },
    { on: 'barrel', item: 'strap_flat', say: ["Me: I'm not levering it. I don't lever things. I LIFT things."] },
    { on: 'cat', say: ['Me: Something moving about down there. A cat. It was a cat. I knew it was a cat.', 'The cat says nothing. It saw him on the steps.'] },
    { on: 'cat', item: 'phone', say: ['Rob shows the cat his son.', 'The cat leaves.', 'Me: Fine.'] },
    { on: 'cat', item: 'dollies', say: ['The cat looks at the dolly mixture, then at Rob, then away.', 'Me: Fine. More for me.'] },
    { on: 'racks', say: ['Me: All present and correct.'] },
    { on: 'cobwebs', say: ['Rob reaches for them, and the cat looks at him. He stops reaching.'] },

    // ---- The newspaper office ----
    {
      on: 'editor',
      if: '!commissioned',
      say: [
        'Editor: If you\'re here about the card in the window, our football man\'s in bed with his chest. City are at home this afternoon.',
        "Editor: A penny a line. What happened, and who scored. Nowt else.",
        'Me: Paid by the line. For my opinions.',
        'Editor: For the facts.',
        'Me: Same thing.',
        'Editor: It is not. Notebook. Pencil. Go.',
      ],
      do: ['give:notebook', 'set:commissioned'],
    },
    { on: 'editor', if: 'has:draft !seen_photo', say: ['Editor: Right. Fourteen pages. Who scored?', 'Me: One of ours.', 'Editor: A name.', "Me: ...I'll come back."] },
    { on: 'editor', item: 'draft', if: '!seen_photo', say: ['Editor: Right. Fourteen pages. Who scored?', 'Me: One of ours.', 'Editor: A name.', "Me: ...I'll come back."] },
    { on: 'editor', item: 'draft', say: ['Editor: Who scored?'], choices: scorerChoices },
    { on: 'editor', if: 'has:draft', say: ['Editor: Who scored?'], choices: scorerChoices },
    { on: 'editor', if: 'report_paid', say: ["Editor: Page six. Don't let it go to your head. Coultas has used up all the heads in Hull for today."] },
    { on: 'editor', say: ["Editor: Match report. What happened, and who scored. I'll know if you make it up. I always know."] },
    { on: 'editor', item: 'phone', say: ['Rob shows the editor his son.', 'Editor: Is that a photograph? Why is it so bright? Who printed it?', 'Me: He gets that from me.'] },
    { on: 'editor', item: 'dollies', say: ['Editor: I don\'t eat sweets. Sweets are for people who enjoy things.'] },
    leafletTo('editor', 'Editor: We printed that. Nobody read it then, either.'),
    { on: 'editor', item: 'notebook', say: ["Editor: It's empty. I don't pay by the blank page. Go and watch the match."] },

    { on: 'spike', say: ['Rob reads the top letter all the way through, nodding.', 'Editor: (without looking up) Put it back.'] },
    { on: 'spike', item: 'leaflet', say: ['Me: That\'s where it belongs, but it isn\'t mine to spike.'] },
    { on: 'presses', say: ['Me: Imagine that. Everything I say, printed, every day, for everyone.', 'Editor: (without looking up) No.'] },

    // ---- The Boulevard ----
    { on: 'gateman', if: 'watched', say: ["Gateman: I'm writing to the council about you. There'll be a by-law by Easter.", "Me: Write to your councillor, not the council. I'll draft it for you."] },
    {
      on: 'gateman',
      say: [
        "Gateman: Sixpence, or clear off.",
        'Me: I\'m the press.',
        "Gateman: Press pays sixpence an' all. And you lads can stop standing on boxes at that wall. It's a by-law now. I've had the police round.",
      ],
    },
    { on: 'gateman', item: 'notebook', say: ["Gateman: Lovely notebook. Sixpence."] },
    { on: 'gateman', item: 'phone', say: ['Rob shows the gateman his son.', 'Gateman: Is he sixpence?'] },
    { on: 'gateman', item: 'dollies', say: ["Gateman: I'm not a child, sir. And it's sixpence."] },
    { on: 'gateman', item: 'halfcrown_pub', say: ["Me: Half a crown, to get in? No. That's a fifth of my... It's a lot of my... I'll find another way."] },
    { on: 'gateman', item: 'halfcrown_paper', say: ["Me: Half a crown, to get in? No. That's a fifth of my... It's a lot of my... I'll find another way."] },
    leafletTo('gateman', 'Gateman: Sixpence. Liberal or not.'),

    { on: 'wall', item: 'lid', if: '!plank_on_wall', say: ['Rob lays his plank along the top of the wall, over the glass.', 'Gateman: Oi! No boxes at that wall!', "Me: It's a plank.", 'Gateman: ...By-law says boxes.'], do: ['take:lid', 'set:plank_on_wall'] },
    { on: 'wall', if: 'plank_on_wall !watched', say: ['Rob leans his elbows on the plank and looks over. Lovely. Steady as a desk.', 'Me: Shocking positioning. Look at the left-back.'] },
    { on: 'plank_on_wall', item: 'strap', say: ["Me: Not while it's up there. I'd want it down on the ground, to stamp on."] },
    { on: 'plank_on_wall', say: ['Rob takes his plank back down off the wall.'], do: ['give:lid', 'clear:plank_on_wall'] },
    { on: 'wall', item: 'notebook', if: '!plank_on_wall', say: ['Rob rests his notebook on top of the wall. The glass goes straight through the first three pages.', 'Me: Right.'] },
    {
      on: 'wall',
      item: 'notebook',
      say: [
        'Rob leans on his plank, rests his notebook on it, and looks straight over the wall.',
        'Gateman: Oi! No standing on... oh. Oh, you\'re not standing on anything.',
        'Gateman: ...Is there a by-law about being tall?',
        'Me: Not yet.',
        'Rob can see the whole pitch. He starts writing. He does not stop.',
        'Forty minutes in, there is a roar like the end of the world.',
        'Me: What was that?',
        "Boy: GOAL!",
        "Rob is on page eleven, drawing the left-back's positioning, with arrows.",
        "Me: I'd have saved that.",
        "Boy: You didn't see it.",
        "Me: I'd still have saved it.",
        'City win one-nil. Rob has fourteen pages, and no idea who scored.',
      ],
      do: ['take:notebook', 'give:draft', 'set:watched'],
    },
    {
      on: 'plank_on_wall',
      item: 'notebook',
      say: [
        'Rob leans on his plank, rests his notebook on it, and looks straight over the wall.',
        'Gateman: Oi! No standing on... oh. Oh, you\'re not standing on anything.',
        'Gateman: ...Is there a by-law about being tall?',
        'Me: Not yet.',
        'Rob can see the whole pitch. He starts writing. He does not stop.',
        'Forty minutes in, there is a roar like the end of the world.',
        'Me: What was that?',
        "Boy: GOAL!",
        "Rob is on page eleven, drawing the left-back's positioning, with arrows.",
        "Me: I'd have saved that.",
        "Boy: You didn't see it.",
        "Me: I'd still have saved it.",
        'City win one-nil. Rob has fourteen pages, and no idea who scored.',
      ],
      do: ['take:notebook', 'give:draft', 'set:watched'],
    },
    { on: 'wall', if: 'watched', say: ['Me: Still one-nil. Still a lovely view.'] },
    { on: 'wall', say: ['Rob goes to lean on the wall, sees the glass on top just in time, and leans on nothing instead.', 'He can see over, though. The whole pitch, the crowd, the steam coming off the players.', 'Me: Shocking positioning. Look at the left-back.', 'Nobody near him is interested in the left-back.'] },

    { on: 'boy', if: '!watched', say: ['Boy: Gi\'s a leg up, mister? Gateman won\'t let us on boxes no more.', "Me: I'm not a ladder.", 'Boy: You\'re the size of one.'] },
    { on: 'boy', if: 'heard_bandage', say: ['Boy: Bandage round his head. Nodded it in. You should\'ve seen it.', 'Me: I saw everything that mattered.', 'Boy: So no.'] },
    { on: 'boy', say: ['Boy: Did you see it? Did you see the goal?', 'Me: I saw everything that mattered.', 'Boy: So no.', 'Me: Who scored?', 'Boy: What\'s it worth?'] },
    {
      on: 'boy',
      item: 'dollies',
      if: 'watched',
      say: [
        'Rob opens the bag. He counts out three. Under hard questioning, a fourth.',
        'Boy: Him with the bandage round his head. Nodded it in off a corner. Bled a bit. Crowd went mad.',
        'Boy: Didn\'t catch his name. I were looking at the bandage.',
        'Me: You were supposed to be looking at the left-back.',
      ],
      do: ['set:heard_bandage'],
    },
    { on: 'boy', item: 'dollies', say: ['Boy: Is that sweets? What are they for?', 'Me: For later. For a very good reason.'] },
    { on: 'boy', item: 'phone', say: ['Rob shows the boy his son.', 'Boy: Is that a baby in a mirror?', 'Me: He\'s in the future.', 'Boy: Can I have a go?', 'Me: No. One per cent.'] },
    { on: 'boy', item: 'halfcrown_pub', say: ["Me: Half a crown, for one name? That's Lloyd George money."] },
    { on: 'boy', item: 'halfcrown_paper', say: ["Me: Half a crown, for one name? That's Lloyd George money."] },
    leafletTo('boy', "Boy: Can't eat that."),

    // ---- The station ----
    { on: 'clerk', if: 'ticket', say: ['Clerk: Platform four, sir. Mind the gap. There isn\'t one, sir, it\'s a joke.'] },
    { on: 'clerk', say: ['Clerk: Where to, sir?'], choices: ticketChoices },
    { on: 'clerk', item: 'phone', say: ['Rob shows the clerk his son.', 'Clerk: Child fare is half, sir.', "Me: He's in 2026.", 'Clerk: Then he travels free.'] },
    leafletTo('clerk', 'Clerk: The railway is not a political organisation, sir. Where to?'),
    { on: 'train', say: ["Guard: Ticket, sir?", "Me: It's a long story.", 'Guard: It always is, sir. Ticket window\'s behind you.'] },
    { on: 'fares', say: ['Rob reads the whole board, top to bottom.', 'He nods slowly, as if he understands it.'] },

    // ---- The book ----
    { look: 'dracula', say: READ_PASSAGE, do: ['set:read_passage'] },
    { on: 'rob', item: 'dracula', say: READ_PASSAGE, do: ['set:read_passage'] },

    // ---- Rob and his own things ----
    { on: 'rob', item: 'phone', say: ["Rob looks at the photos of his son for a while.", "Me: One per cent. I'm not wasting it. ...One more."] },
    { on: 'rob', item: 'dollies', say: ['Rob looks into the bag. Rob closes the bag.', "Me: One a day. Then what? Then what, Rob?"] },
    { on: 'rob', item: 'leaflet', say: ['Rob reads the leaflet, start to finish.', "Me: Too long. Nobody's got time. That's what they'll say about all of it."] },
    { on: 'rob', item: 'draft', say: ['Rob reads his notes back to himself.', 'Me: Superb. Every word. Couldn\'t cut a thing.'] },

    // ---- Anywhere else ----
    { on: '*', item: 'phone', say: ['Rob holds the phone up, then higher. Nothing. Then higher still, which is quite high.'] },
    { on: '*', item: 'dollies', say: ['Me: These are not for sharing. They are barely for me.'] },
    { on: '*', item: 'strap', say: ["Me: It's bent double. It's not much use for anything till it isn't."] },
    { on: '*', item: 'strap_flat', say: ["Me: I'm not prising that open. There are laws. I helped draft some. Not these ones."] },
    { on: '*', item: 'lid', say: ["Me: That's my good plank. It's for something better than that."] },
    { on: '*', item: 'leaflet', say: ["Me: Nobody wants a leaflet. Nobody has ever wanted a leaflet."] },
    { on: '*', item: 'notebook', say: ["Me: The notebook's for the match. Facts only. Mostly."] },
    { on: '*', item: 'draft', say: ["Me: Fourteen pages of the finest football writing in Yorkshire, and you want me to waste it on that?"] },
    { on: '*', item: 'halfcrown_pub', say: ["Me: Not on that. That's half my money. Half of not much."] },
    { on: '*', item: 'halfcrown_paper', say: ["Me: Not on that. That's half my money. Half of not much."] },
    { on: '*', item: 'late_edition', say: ["Me: Thirty lines. Somebody in this town will want to read them. Not many. Somebody."] },
    { on: '*', item: 'dracula', say: ['Me: Have you read it? You should. Not that copy, mind.'] },
    { on: '*', item: 'ticket', say: ["Me: I'm not letting go of that."] },
  ],
  puzzles: [
    { id: 'p1', label: 'Puzzle 1', solved: 'strap_flat' },
    { id: 'p2', label: 'Puzzle 2', solved: 'trapdoor_open' },
    { id: 'p3', label: 'Puzzle 3', solved: 'lit' },
    { id: 'p4', label: 'Puzzle 4', solved: 'paid_pub' },
    { id: 'p5', label: 'Puzzle 5', solved: 'watched' },
    { id: 'p6', label: 'Puzzle 6', solved: 'report_paid' },
    { id: 'p7', label: 'Puzzle 7', solved: 'got_book' },
    { id: 'p8', label: 'Puzzle 8', solved: 'ticket' },
  ],
  goal: 'ticket',
  ending: [
    'Rob stands under the great arched roof of Paragon Station with a ticket in one hand and a yellow book in the other.',
    'He reads the page again. Then once more, to be sure.',
    "Me: 'Young man.'",
    '[wait 1]',
    'Me: You absolute...',
    'He puts the book in his pocket, next to half a bag of dolly mixture and a phone on one per cent.',
    "Me: Hang on, son. Dad's coming. By way of York.",
    'To be continued.',
  ],
};
