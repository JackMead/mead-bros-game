import { describe, expect, it } from 'vitest';
import { chapters } from './chapters';
import { createUi, figureRect, hitTest, playCues, startChapter, update, type Store } from './ui';
import { parseLines } from './engine';

const memory = (): Store => {
  const saves = new Map<string, string>();
  return {
    load: (id) => (saves.has(id) ? JSON.parse(saves.get(id)!) : null),
    save: (id, h) => void saves.set(id, JSON.stringify(h)),
    clear: (id) => void saves.delete(id),
  };
};

describe('tapping in the scene', () => {
  it("passes through the brother you're playing, but not the others", () => {
    const ui = createUi(chapters);
    startChapter(ui, 0, memory());
    const game = ui.game!;
    const me = figureRect(ui.chapter!, game, game.active)!;
    const t = hitTest(ui, me.x + me.w / 2, me.y + me.h / 2);
    expect(t?.kind === 'brother' && t.id === game.active).toBe(false);
    const other = ui.chapter!.brothers.find((b) => b !== game.active)!;
    const r = figureRect(ui.chapter!, game, other)!;
    expect(hitTest(ui, r.x + r.w / 2, r.y + r.h / 2)).toMatchObject({ kind: 'brother', id: other });
  });
});

describe('cinematic cues', () => {
  it('play by themselves, hold up the next line, and leave spoken lines for a tap', () => {
    const ui = createUi(chapters);
    startChapter(ui, 0, memory());
    ui.queue = parseLines(ui.chapter!, ['[shake 1]', '[vortex 100 100]', 'Hello.'], 'rob');
    playCues(ui);
    expect(ui.cinema.effects.map((e) => e.name)).toEqual(['shake', 'vortex']);
    expect(ui.queue[0].cue).toBe('vortex 100 100');
    update(ui, 2);
    expect(ui.queue[0].text).toBe('Hello.');
  });
});
