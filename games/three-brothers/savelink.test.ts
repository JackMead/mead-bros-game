import { describe, expect, it } from 'vitest';
import { chapters } from './chapters';
import { analyse } from './solver';
import { decodeSaves, encodeSaves, usableSaves, type Saves } from './savelink';

// Real saves: each chapter's shortest route, worked out once (the solver is slow).
const routes = Object.fromEntries(chapters.map((c) => [c.id, analyse(c).solution]));

describe('save links', () => {
  const saves: Saves = Object.fromEntries(chapters.map((c) => [c.id, routes[c.id].slice(0, 10)]));

  it('round-trips every chapter', async () => {
    const hash = await encodeSaves(saves);
    expect(hash.startsWith('#save=')).toBe(true);
    expect(await decodeSaves(hash)).toEqual(saves);
  });

  it('stays short enough to send in a message', async () => {
    const full: Saves = routes;
    expect((await encodeSaves(full)).length).toBeLessThan(2000);
  });

  it('ignores links that are not saves, or are garbled', async () => {
    expect(await decodeSaves('#other')).toBeNull();
    expect(await decodeSaves('#save=znot-real-data')).toBeNull();
  });

  it('drops a save that no longer plays, and unknown chapters', () => {
    const bad: Saves = { ...saves, nowhere: [], [chapters[0].id]: [{ type: 'use', target: 'no_such_thing' }] };
    const ok = usableSaves(chapters, bad);
    expect(ok[chapters[0].id]).toBeUndefined();
    expect(ok.nowhere).toBeUndefined();
    expect(ok[chapters[1].id]).toEqual(saves[chapters[1].id]);
  });
});
