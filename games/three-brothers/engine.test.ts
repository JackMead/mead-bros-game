import { describe, expect, it } from 'vitest';
import { act, check, newGame, parseLines, type Action, type State } from './engine';
import type { Chapter } from './types';

/** A tiny made-up chapter, so these tests don't spoil (or depend on) the real ones. */
const chapter: Chapter = {
  id: 'test',
  number: 99,
  title: 'Test',
  author: 'tests',
  era: 'now',
  place: 'here',
  brothers: ['rob', 'jack'],
  start: { scene: 'room', brother: 'rob', inventory: { rob: ['key'], jack: ['coin'] } },
  extras: { guard: { name: 'Guard', colour: '#fff' } },
  intro: [],
  items: {
    key: { name: 'Key', look: 'A key.' },
    coin: { name: 'Coin', look: { jack: 'My coin.', any: "Jack's coin." } },
  },
  scenes: {
    room: {
      name: 'Room',
      description: 'A room.',
      placeholder: { top: '#000', bottom: '#111' },
      stand: {},
      hotspots: [
        { id: 'door', name: 'Door', rect: { x: 0, y: 0, w: 10, h: 10 }, look: 'A door.' },
        { id: 'guard', name: 'Guard', rect: { x: 20, y: 0, w: 10, h: 10 }, look: 'A guard.', if: '!bribed' },
      ],
    },
  },
  rules: [
    { on: 'door', item: 'key', if: 'bribed', say: ['The door opens.'], do: ['set:open'] },
    { on: 'door', item: 'key', say: ['Guard: Oi.'] },
    { on: 'guard', item: 'coin', by: 'jack', say: ['Guard: Ta.'], do: ['take:coin', 'set:bribed'] },
    {
      on: 'guard',
      say: ['Guard: What?'],
      choices: [
        { label: 'Nothing.', say: ['Guard: Right.'] },
        { label: 'Got a coin?', if: 'has:coin', say: ['Guard: Lovely.'], do: ['take:coin', 'set:bribed'] },
      ],
    },
  ],
  puzzles: [],
  goal: 'open',
  ending: ['The end.'],
};

const play = (actions: Action[], state: State = newGame(chapter)) =>
  actions.reduce((s, a) => act(chapter, s, a).state, state);

describe('check', () => {
  const s = newGame(chapter);
  it('reads flags, negation and held items', () => {
    expect(check(undefined, s)).toBe(true);
    expect(check('has:key', s)).toBe(true);
    expect(check('has:coin', s)).toBe(false);
    expect(check('!bribed has:key', s)).toBe(true);
    expect(check('bribed', s)).toBe(false);
  });
});

describe('act', () => {
  it('uses the first matching rule, honouring conditions', () => {
    const r = act(chapter, newGame(chapter), { type: 'item', item: 'key', target: 'door' });
    expect(r.lines).toEqual([{ speaker: 'guard', text: 'Oi.' }]);
    expect(r.state.flags).not.toContain('open');
  });

  it('only lets the named brother use a "by" rule', () => {
    const asJack = play([{ type: 'switch', brother: 'jack' }]);
    expect(act(chapter, asJack, { type: 'item', item: 'coin', target: 'guard' }).state.flags).toContain('bribed');
  });

  it('hands items between brothers by default', () => {
    const s = play([{ type: 'item', item: 'key', target: 'jack' }]);
    expect(s.inventory.rob).toEqual([]);
    expect(s.inventory.jack).toContain('key');
  });

  it('offers only the choices whose conditions hold', () => {
    const asRob = act(chapter, newGame(chapter), { type: 'use', target: 'guard' });
    expect(asRob.choices).toEqual(['Nothing.']);
    const asJack = act(chapter, play([{ type: 'switch', brother: 'jack' }]), { type: 'use', target: 'guard' });
    expect(asJack.choices).toEqual(['Nothing.', 'Got a coin?']);
    const picked = act(chapter, asJack.state, { type: 'choose', index: 1 });
    expect(picked.state.flags).toContain('bribed');
    expect(picked.state.choosing).toBeNull();
  });

  it('finishes the chapter when the goal holds, and adds the ending', () => {
    const s = play([
      { type: 'switch', brother: 'jack' },
      { type: 'item', item: 'coin', target: 'guard' },
      { type: 'switch', brother: 'rob' },
    ]);
    const r = act(chapter, s, { type: 'item', item: 'key', target: 'door' });
    expect(r.state.done).toBe(true);
    expect(r.lines.at(-1)?.text).toBe('The end.');
  });

  it('cycles through fallback lines when nothing happens', () => {
    const a = act(chapter, newGame(chapter), { type: 'use', target: 'door' });
    const b = act(chapter, a.state, { type: 'use', target: 'door' });
    expect(a.lines[0].text).not.toBe(b.lines[0].text);
  });

  it('never changes the state it was given', () => {
    const s = newGame(chapter);
    const before = JSON.stringify(s);
    act(chapter, s, { type: 'item', item: 'key', target: 'jack' });
    expect(JSON.stringify(s)).toBe(before);
  });

  it('describes things differently depending on who looks', () => {
    const asRob = act(chapter, play([{ type: 'item', item: 'key', target: 'jack' }]), { type: 'look', target: 'jack' });
    expect(asRob.lines[0].speaker).toBe('rob');
    const jack = play([{ type: 'switch', brother: 'jack' }]);
    expect(act(chapter, jack, { type: 'look', target: 'coin' }).lines[0].text).toBe('My coin.');
  });
});

describe('parseLines', () => {
  it('works out speakers', () => {
    expect(parseLines(chapter, ['Me: Hi', 'Guard: Oi', 'Jack: Yo', 'Note: not a speaker', 'Plain'], 'rob')).toEqual([
      { speaker: 'rob', text: 'Hi' },
      { speaker: 'guard', text: 'Oi' },
      { speaker: 'jack', text: 'Yo' },
      { speaker: null, text: 'Note: not a speaker' },
      { speaker: null, text: 'Plain' },
    ]);
  });
});

describe('talking to brothers', () => {
  it('gets an in-character answer from the other brother when no rule says otherwise', () => {
    const r = act(chapter, newGame(chapter), { type: 'use', target: 'jack' });
    expect(r.lines[0].speaker).toBe('jack');
    expect(r.state.active).toBe('rob');
  });
});
