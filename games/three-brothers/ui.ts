import { cast } from './cast';
import { config } from './config';
import { act, check, newGame, visibleHotspots, type Action, type Line, type State } from './engine';
import { BROTHERS, type BrotherId, type Chapter, type Rect, type Stand } from './types';

/**
 * Screen layout, hit testing and what taps do. No DOM or canvas here, so it's
 * testable; `main.ts` feeds in pointer events and `render.ts` draws the result.
 */

export type Screen = 'title' | 'play' | 'end';
export type Progress = 'new' | 'started' | 'done';

/** Where progress is kept between visits (localStorage in the browser). */
export interface Store {
  load(chapterId: string): Action[] | null;
  save(chapterId: string, history: Action[]): void;
  clear(chapterId: string): void;
}

export interface Ui {
  screen: Screen;
  chapters: Chapter[];
  /** How far each chapter has got, for the title screen. */
  progress: Progress[];
  chapter: Chapter | null;
  game: State | null;
  /** Every action so far this chapter. Saved, and replayed to resume. */
  history: Action[];
  /** Lines waiting to be read, one at a time. */
  queue: Line[];
  choices: string[];
  /** Inventory item picked up, waiting for a target. */
  selected: string | null;
  lookMode: boolean;
  /** Name flashed up where you tapped. */
  label: { text: string; x: number; y: number; t: number } | null;
  /** Mouse-over text (desktop only, never the only way to learn something). */
  hover: string | null;
  /** Conversation option under the mouse (desktop only). */
  hoverChoice: number | null;
  /** Seconds since the game started, for animation. */
  time: number;
  /** 1 = black, fading to 0 when a chapter opens. */
  fade: number;
}

export type Target =
  | { kind: 'hotspot'; id: string; name: string }
  /** A brother's portrait in the bar (play as him) or his figure in the scene (talk to him). */
  | { kind: 'brother'; id: BrotherId; where: 'portrait' | 'scene' }
  | { kind: 'item'; id: string }
  | { kind: 'look' }
  | { kind: 'menu' }
  | { kind: 'chapter'; index: number }
  | { kind: 'restart'; index: number };

export function createUi(chapters: Chapter[]): Ui {
  return {
    screen: 'title',
    chapters,
    progress: chapters.map(() => 'new'),
    chapter: null,
    game: null,
    history: [],
    queue: [],
    choices: [],
    selected: null,
    lookMode: false,
    label: null,
    hover: null,
    hoverChoice: null,
    time: 0,
    fade: 0,
  };
}

// ---- Layout ----

const { width, height, sceneHeight, bar } = config;
const barTop = sceneHeight + (height - sceneHeight - bar.portrait) / 2;

export const layout = {
  portrait: (i: number): Rect => ({ x: bar.gap + i * (bar.portrait + bar.gap), y: barTop, w: bar.portrait, h: bar.portrait }),
  lookButton: (): Rect => ({ x: bar.gap + 3 * (bar.portrait + bar.gap) + 6, y: barTop, w: bar.portrait, h: bar.portrait }),
  slot: (i: number): Rect => {
    const x0 = bar.gap + 4 * (bar.portrait + bar.gap) + 24;
    return { x: x0 + i * (bar.slot + bar.gap), y: barTop + (bar.portrait - bar.slot) / 2, w: bar.slot, h: bar.slot };
  },
  menuButton: (): Rect => ({ x: width - 52, y: 10, w: 42, h: 42 }),
  chapterCard: (i: number): Rect => ({ x: 40, y: 190 + i * 96, w: 540, h: 84 }),
  restartButton: (i: number): Rect => ({ x: 456, y: 190 + i * 96 + 24, w: 108, h: 36 }),
  dialogue: (): Rect => ({ x: 20, y: sceneHeight - 128, w: width - 40, h: 118 }),
  choice: (i: number, count: number): Rect => {
    const h = 36;
    return { x: 40, y: sceneHeight - 14 - (count - i) * (h + 4), w: width - 80, h };
  },
};

export function inside(r: Rect, x: number, y: number): boolean {
  return x >= r.x && x < r.x + r.w && y >= r.y && y < r.y + r.h;
}

/** Where a brother stands in the current scene (feet position), or null if he isn't in it. */
export function standFor(chapter: Chapter, state: State, b: BrotherId): Stand | null {
  const stands = chapter.scenes[state.scene].stand[b];
  if (!stands || !chapter.brothers.includes(b)) return null;
  return stands.find((st) => check(st.if, state)) ?? null;
}

/** The area a brother's figure covers, for tapping. */
export function figureRect(chapter: Chapter, state: State, b: BrotherId): Rect | null {
  const s = standFor(chapter, state, b);
  if (!s) return null;
  const h = config.figure.height * cast[b].height;
  return { x: s.x - config.figure.width / 2, y: s.y - h, w: config.figure.width, h };
}

export function hitTest(ui: Ui, x: number, y: number): Target | null {
  if (ui.screen === 'title') {
    for (let i = 0; i < ui.chapters.length; i++) {
      if (ui.progress[i] === 'started' && inside(layout.restartButton(i), x, y)) return { kind: 'restart', index: i };
      if (inside(layout.chapterCard(i), x, y)) return { kind: 'chapter', index: i };
    }
    return null;
  }
  const { chapter, game } = ui;
  if (!chapter || !game) return null;
  if (inside(layout.menuButton(), x, y)) return { kind: 'menu' };
  if (inside(layout.lookButton(), x, y)) return { kind: 'look' };
  for (const [i, b] of BROTHERS.entries()) {
    if (chapter.brothers.includes(b) && inside(layout.portrait(i), x, y)) {
      return { kind: 'brother', id: b, where: 'portrait' };
    }
  }
  for (const [i, item] of game.inventory[game.active].entries()) {
    if (inside(layout.slot(i), x, y)) return { kind: 'item', id: item };
  }
  if (y >= sceneHeight) return null;
  for (const b of BROTHERS) {
    const r = figureRect(chapter, game, b);
    if (r && inside(r, x, y)) return { kind: 'brother', id: b, where: 'scene' };
  }
  const hotspots = visibleHotspots(chapter, game);
  for (let i = hotspots.length - 1; i >= 0; i--) {
    const h = hotspots[i];
    if (inside(h.rect, x, y)) return { kind: 'hotspot', id: h.id, name: h.name };
  }
  return null;
}

export function targetName(ui: Ui, t: Target): string {
  if (t.kind === 'hotspot') return t.name;
  if (t.kind === 'brother') return cast[t.id].name;
  if (t.kind === 'item') return ui.chapter?.items[t.id].name ?? t.id;
  return '';
}

// ---- What taps do ----

export function startChapter(ui: Ui, index: number, store: Store, fresh = false): void {
  const chapter = ui.chapters[index];
  if (fresh) store.clear(chapter.id);
  const saved = store.load(chapter.id);
  ui.chapter = chapter;
  ui.fade = 1;
  ui.selected = null;
  ui.lookMode = false;
  ui.choices = [];
  ui.label = null;
  let game = newGame(chapter);
  const history: Action[] = [];
  if (saved?.length) {
    for (const a of saved) {
      game = act(chapter, game, a).state;
      history.push(a);
    }
  }
  ui.game = game;
  ui.history = history;
  if (game.done) {
    ui.queue = [];
    ui.screen = 'end';
    return;
  }
  ui.screen = 'play';
  ui.queue = history.length ? [] : chapter.intro.map((text) => ({ speaker: null, text }));
}

/** A short tap (or click) at game coordinates. */
export function tap(ui: Ui, x: number, y: number, store: Store): void {
  if (ui.screen === 'end') return showTitle(ui, store);
  const t = hitTest(ui, x, y);
  if (ui.screen === 'title') {
    if (t?.kind === 'chapter') startChapter(ui, t.index, store, ui.progress[t.index] === 'done');
    if (t?.kind === 'restart') startChapter(ui, t.index, store, true);
    return;
  }
  if (t?.kind === 'menu') return showTitle(ui, store);

  // Reading dialogue: any tap moves on.
  if (ui.queue.length) {
    ui.queue.shift();
    if (!ui.queue.length && ui.game?.done) ui.screen = 'end';
    return;
  }
  if (ui.choices.length) {
    const i = ui.choices.findIndex((_, i) => inside(layout.choice(i, ui.choices.length), x, y));
    if (i >= 0) perform(ui, { type: 'choose', index: i }, store);
    return;
  }
  if (!t) {
    ui.selected = null;
    ui.lookMode = false;
    return;
  }
  if (t.kind === 'look') {
    ui.lookMode = !ui.lookMode;
    ui.selected = null;
    return;
  }

  const game = ui.game!;
  flash(ui, t, x, y);
  if (ui.lookMode) {
    ui.lookMode = false;
    if (t.kind === 'hotspot' || t.kind === 'brother' || t.kind === 'item') perform(ui, { type: 'look', target: t.id }, store);
    return;
  }
  if (ui.selected) {
    const item = ui.selected;
    ui.selected = null;
    if (t.kind === 'item' && t.id === item) return; // tapped it again: put it back
    if (t.kind === 'hotspot' || t.kind === 'brother' || t.kind === 'item') {
      perform(ui, { type: 'item', item, target: t.id }, store);
    }
    return;
  }
  if (t.kind === 'item') {
    ui.selected = t.id;
  } else if (t.kind === 'brother') {
    if (t.id === game.active) perform(ui, { type: 'look', target: t.id }, store);
    else if (t.where === 'scene') perform(ui, { type: 'use', target: t.id }, store);
    else perform(ui, { type: 'switch', brother: t.id }, store);
  } else if (t.kind === 'hotspot') {
    perform(ui, { type: 'use', target: t.id }, store);
  }
}

/** A long press (touch) or right-click: look at whatever is there. */
export function hold(ui: Ui, x: number, y: number, store: Store): void {
  if (ui.screen !== 'play' || ui.queue.length || ui.choices.length) return tap(ui, x, y, store);
  const t = hitTest(ui, x, y);
  ui.selected = null;
  ui.lookMode = false;
  if (t && (t.kind === 'hotspot' || t.kind === 'brother' || t.kind === 'item')) {
    flash(ui, t, x, y);
    perform(ui, { type: 'look', target: t.id }, store);
  }
}

export function hoverAt(ui: Ui, x: number, y: number): void {
  ui.hoverChoice = null;
  if (ui.screen === 'play' && !ui.queue.length && ui.choices.length) {
    const i = ui.choices.findIndex((_, i) => inside(layout.choice(i, ui.choices.length), x, y));
    ui.hoverChoice = i >= 0 ? i : null;
  }
  if (ui.screen !== 'play' || ui.queue.length || ui.choices.length) {
    ui.hover = null;
    return;
  }
  const t = hitTest(ui, x, y);
  const name = t ? targetName(ui, t) : '';
  ui.hover = name || null;
}

/** Text for the status line at the top, e.g. "Use Cup of tea on Labrador". */
export function status(ui: Ui): string {
  if (ui.lookMode) return `Look at ${ui.hover ?? '...'}`;
  if (ui.selected && ui.chapter) return `Use ${ui.chapter.items[ui.selected].name} on ${ui.hover ?? '...'}`;
  return ui.hover ?? '';
}

export function update(ui: Ui, dt: number): void {
  ui.time += dt;
  ui.fade = Math.max(0, ui.fade - dt / config.fadeSeconds);
  if (ui.label) {
    ui.label.t -= dt;
    if (ui.label.t <= 0) ui.label = null;
  }
}

function perform(ui: Ui, action: Action, store: Store): void {
  const result = act(ui.chapter!, ui.game!, action);
  ui.game = result.state;
  ui.history.push(action);
  ui.queue.push(...result.lines);
  ui.choices = result.choices;
  store.save(ui.chapter!.id, ui.history);
  if (result.state.done && !ui.queue.length) ui.screen = 'end';
}

function flash(ui: Ui, t: Target, x: number, y: number): void {
  const text = targetName(ui, t);
  if (text) ui.label = { text, x, y, t: config.labelSeconds };
}

export function showTitle(ui: Ui, store: Store): void {
  ui.screen = 'title';
  ui.progress = ui.chapters.map((chapter) => {
    const saved = store.load(chapter.id);
    if (!saved?.length) return 'new';
    return saved.reduce((s, a) => act(chapter, s, a).state, newGame(chapter)).done ? 'done' : 'started';
  });
}
