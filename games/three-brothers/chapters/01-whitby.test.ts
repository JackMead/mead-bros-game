import { describe, expect, it } from 'vitest';
import { act, newGame, type State } from '../engine';
import { whitby } from './01-whitby';

/** A state on the West Cliff terrace, dragon in hand, ready to seal the wager. */
function terraceReadyToWager(): State {
  const s = newGame(whitby);
  s.scene = 'west_cliff';
  s.flags = [
    'knows_date',
    'stoker_paid',
    'bought_suit',
    'got_suit',
    'heard_jeweller',
    'in_hotel',
    'heard_ball_lost',
    'got_float',
    'wager_asked',
  ];
  return s;
}

describe('whitby chapter 2 playtest fixes', () => {
  // Bug: the move into the parlour used to fire in the same step as the wager
  // conversation, so the player was already in the parlour while Algy was still
  // saying "the parlour!". Sealing the wager must NOT change the scene; the move
  // happens afterwards when Phil follows him in.
  it('seals the wager on the terrace without moving into the parlour', () => {
    const r = act(whitby, terraceReadyToWager(), { type: 'item', item: 'card_dragon', target: 'algernon' });
    expect(r.state.flags).toContain('challenge_accepted');
    expect(r.state.scene).toBe('west_cliff');
  });

  it('enters the parlour only once Phil follows him in', () => {
    const accepted = act(whitby, terraceReadyToWager(), { type: 'item', item: 'card_dragon', target: 'algernon' }).state;
    const entered = act(whitby, accepted, { type: 'use', target: 'hotel' });
    expect(entered.state.scene).toBe('parlour');
  });

  // Bug: the sleeping lady's sprite was drawn so low that her feet spilled onto the
  // painted table in front of the chair, so she looked like she floated in front of
  // it. Her sprite must end at or above the table's near edge so the table reads in
  // front of her. (Sprites are always drawn over the painted background.)
  it('seats the lady behind the table, not floating in front of it', () => {
    const parlour = whitby.scenes.parlour;
    const lady = parlour.hotspots.find((h) => h.id === 'lady')!;
    const table = parlour.hotspots.find((h) => h.id === 'long_table')!;
    // They overlap horizontally, so the vertical layering is what matters.
    expect(lady.rect.x).toBeLessThan(table.rect.x + table.rect.w);
    expect(lady.rect.x + lady.rect.w).toBeGreaterThan(table.rect.x);
    // Lady's feet (sprite bottom) sit at or just above the table's near/top edge.
    expect(lady.rect.y + lady.rect.h).toBeLessThanOrEqual(table.rect.y + 10);
  });
});
