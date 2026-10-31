import type { FloorKit } from '../kit';

/**
 * The long road. PLACEHOLDER: enemies, hazard and pages here are stand-ins
 * until the first-pass kit is written. Keep names generic (no names or text from the book).
 */
export const longRoad: FloorKit = {
  id: 'long-road',
  title: 'The Long Road',
  inspiredBy: 'The Lord of the Rings',
  palette: {
    background: '#14110f',
    floor: '#3a3128',
    floorAlt: '#41372c',
    wall: '#5b5046',
    wallTop: '#7a6d5f',
    chasm: '#050405',
    light: '255, 196, 120',
  },
  wallDensity: 0.14,
  chasmDensity: 0.03,
  chasmPerDepth: 0.008,
  enemies: [
    {
      id: 'goblin', name: 'Goblin', behaviour: 'melee', hp: 1, damage: 1,
      cost: 1, weight: 5, minDepth: 1, colour: '#8fb35a',
      blurb: 'Quick, mean and never alone for long.',
    },
    {
      id: 'archer', name: 'Goblin archer', behaviour: 'archer', hp: 1, damage: 1,
      cost: 2, weight: 3, minDepth: 2, colour: '#c9a646',
      blurb: 'Keeps its distance and waits for a clear line.',
    },
    {
      id: 'wolf', name: 'Dire wolf', behaviour: 'charger', hp: 2, damage: 1,
      cost: 2, weight: 3, minDepth: 3, colour: '#9aa3ad',
      blurb: 'Runs down anything in a straight line. Not clever about edges.',
    },
    {
      id: 'troll', name: 'Cave troll', behaviour: 'brute', hp: 3, damage: 2,
      cost: 4, weight: 2, minDepth: 4, colour: '#6f8f86',
      blurb: 'Slow. Walls are a suggestion.',
    },
  ],
  hunter: {
    id: 'wraith', name: 'Wraith', behaviour: 'hunter', hp: 2, damage: 1,
    cost: 0, weight: 0, minDepth: 99, colour: '#b9b2e6',
    blurb: 'It came because you used the ring.',
  },
  pages: ['shove', 'swap', 'ward', 'blink'],
  arrivals: [
    'The road goes ever on.',
    'Old stones, older shadows.',
    'Something is watching from the dark.',
    'The air smells of smoke and rain.',
  ],
};
