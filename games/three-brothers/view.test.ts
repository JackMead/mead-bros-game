import { describe, expect, it } from 'vitest';
import { chapters } from './chapters';
import { createUi, shown, startChapter, tap, update, type Store } from './ui';
import { layout } from './ui';

const memory = (): Store => {
  const m = new Map<string, unknown>();
  return { load: (id) => (m.get(id) as never) ?? null, save: (id, h) => void m.set(id, h), clear: (id) => void m.delete(id) };
};

describe('the scene waits for the lines', () => {
  it('keeps showing the old scene until the dialogue has been read', () => {
    const chapter = chapters.find((c) => c.id === 'goodmanham')!;
    const ui = createUi(chapters);
    const store = memory();
    startChapter(ui, chapters.indexOf(chapter), store);
    ui.queue = [];
    const before = ui.game!.scene;
    const h = chapter.scenes[before].hotspots.find((x) => x.exit)!;
    tap(ui, h.rect.x + h.rect.w / 2, h.rect.y + h.rect.h / 2, store);
    expect(ui.game!.scene).not.toBe(before);
    expect(shown(ui).scene).toBe(before);
    while (ui.queue.length) tap(ui, 5, 300, store);
    update(ui, 0.01);
    expect(shown(ui).scene).toBe(ui.game!.scene);
  });

  it('has a Show button that lights things up', () => {
    const ui = createUi(chapters);
    const store = memory();
    startChapter(ui, 0, store);
    ui.queue = [];
    const b = layout.showButton();
    tap(ui, b.x + 5, b.y + 5, store);
    expect(ui.reveal).toBeGreaterThan(0);
  });
});
