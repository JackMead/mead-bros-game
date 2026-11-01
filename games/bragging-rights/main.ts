import './style.css';
import { startLoop } from '../../src/engine/loop';
import { Sound, type SoundName } from './audio';
import { config } from './config';
import {
  SLOT_NAMES, activeRun, compact, day, dayTotal, load, persist, playsLeft, recordAction, records,
  resume, startRun, ukDate, type KeyValueStore, type RunRecord, type SaveData,
} from './daily';
import { Fx } from './fx';
import { dist, same } from './grid';
import { BEHAVIOUR_HELP } from './kit';
import { enemyType, getKit } from './kits';
import { PAGES } from './pages';
import { computeLayout, render, squareAt, type Layout } from './render';
import { canDescend, enemyAt, pageTargets, step } from './sim';
import type { Action, GameEvent, OutcomeKind, Pos, RunState } from './types';
import { registerServiceWorker } from './pwa';

const $ = <T extends HTMLElement = HTMLElement>(id: string) => {
  const el = document.getElementById(id);
  if (!el) throw new Error(`Missing #${id}`);
  return el as T;
};

/** Local storage, or memory if the browser blocks it (private windows, embedded previews). */
const store: KeyValueStore = (() => {
  try {
    const s = window.localStorage;
    s.getItem(config.storageKey);
    return s;
  } catch {
    const mem = new Map<string, string>();
    return { getItem: (k: string) => mem.get(k) ?? null, setItem: (k: string, v: string) => void mem.set(k, v) };
  }
})();
const save: SaveData = load(store);
const sound = new Sound();
sound.muted = save.muted;
const fx = new Fx();

let run: RunRecord | null = null;
let state: RunState | null = null;
let targeting: number | null = null;
let inspect: number | null = null;
let layout: Layout = computeLayout(1, 1, config.grid.width, config.grid.height);
let dpr = 1;

const canvas = $<HTMLCanvasElement>('board');
const ctx = canvas.getContext('2d')!;
const lightCanvas = document.createElement('canvas');
const lightCtx = lightCanvas.getContext('2d')!;

// ---------------------------------------------------------------------------
// Home

function showHome(): void {
  run = null;
  state = null;
  targeting = null;
  $('game').classList.add('hidden');
  $('home').classList.remove('hidden');
  const today = ukDate(new Date());
  compact(save, today);
  persist(store, save);

  $('today').textContent = new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' });
  const d = day(save, today);
  const slots = $('slots');
  slots.innerHTML = '';
  const active = activeRun(save);
  SLOT_NAMES.forEach((name, i) => {
    const li = document.createElement('li');
    const r = d.runs[i];
    const label = document.createElement('span');
    label.className = 'slot-name';
    label.textContent = `Dungeon ${name}`;
    const info = document.createElement('span');
    info.className = 'muted';
    if (!r) info.textContent = 'Not played';
    else if (!r.done) info.textContent = `In progress, floor ${r.depth}`;
    else {
      info.textContent = `◆ ${r.score} · ${OUTCOME_SHORT[r.outcome!]} on floor ${r.depth}`;
      info.classList.remove('muted');
    }
    if (i === d.runs.length && !active) li.classList.add('next');
    li.append(label, info);
    slots.append(li);
  });
  $('total').innerHTML = `Today's total: <b>◆ ${dayTotal(d)}</b>`;

  const play = $<HTMLButtonElement>('play');
  const left = playsLeft(save, today);
  play.disabled = false;
  if (active) {
    play.textContent = `Resume dungeon ${SLOT_NAMES[active.run.slot]}`;
    play.onclick = () => enterRun(active.run);
  } else if (left > 0) {
    const slot = d.runs.length;
    play.textContent = `Start dungeon ${SLOT_NAMES[slot]}`;
    play.onclick = () => confirmStart(today, slot);
  } else {
    play.textContent = 'All played. Back tomorrow';
    play.disabled = true;
  }
  updateCountdown();

  const rec = records(save);
  const recs = $('records');
  recs.innerHTML = '<h2>Your records</h2>';
  const line = (s: string) => {
    const p = document.createElement('div');
    p.textContent = s;
    recs.append(p);
  };
  line(rec.bestDay ? `Best day: ◆ ${rec.bestDay.total} (${prettyDate(rec.bestDay.date)})` : 'Best day: none yet');
  line(rec.bestRun ? `Best run: ◆ ${rec.bestRun.score} in ${rec.bestRun.turns} turns` : 'Best run: none yet');
  line(`Days played: ${rec.daysPlayed}`);
  $('mute').textContent = save.muted ? 'Sound: off' : 'Sound: on';
}

const OUTCOME_SHORT: Record<OutcomeKind, string> = {
  banked: 'banked', escaped: 'escaped', died: 'fell', lampOut: 'lamp out',
};

function prettyDate(date: string): string {
  return new Date(`${date}T12:00:00Z`).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
}

function updateCountdown(): void {
  const el = $('countdown');
  if ($('home').classList.contains('hidden')) return;
  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Europe/London', hour: 'numeric', minute: 'numeric', second: 'numeric', hourCycle: 'h23',
  }).formatToParts(new Date());
  const get = (type: string) => Number(parts.find((p) => p.type === type)?.value ?? 0);
  const left = 86400 - (get('hour') * 3600 + get('minute') * 60 + get('second'));
  const h = Math.floor(left / 3600);
  const m = Math.floor((left % 3600) / 60);
  el.textContent = `New dungeons in ${h}h ${m}m`;
}
setInterval(updateCountdown, 30_000);

function confirmStart(date: string, slot: number): void {
  showModal(`
    <h2>Start dungeon ${SLOT_NAMES[slot]}?</h2>
    <p>This uses play ${slot + 1} of ${config.run.playsPerDay} today. Once you start, it counts, even if you quit.</p>
    <p class="muted">You can close the app mid-run and carry on later.</p>
    <button class="primary" data-act="go">Start</button>
    <button class="ghost" data-act="cancel">Not yet</button>
  `, (act) => {
    hideModal();
    if (act !== 'go') return;
    const r = startRun(save, date);
    persist(store, save);
    enterRun(r);
  });
}

// ---------------------------------------------------------------------------
// Playing

function enterRun(r: RunRecord): void {
  sound.unlock();
  run = r;
  state = resume(r);
  targeting = null;
  inspect = null;
  fx.snap(state);
  $('home').classList.add('hidden');
  $('game').classList.remove('hidden');
  resize();
  updateHud();
  if (state.phase === 'stairs') showStairs();
  else if (state.phase === 'over') showOver();
  else toast(`${getKit(state.kitId).title} · floor ${state.depth}`);
}

function act(action: Action): void {
  if (!state || !run) return;
  const result = step(state, action);
  if (!result.ok) return;
  state = result.state;
  recordAction(run, action, state);
  persist(store, save);
  targeting = null;
  const kit = getKit(state.kitId);
  fx.apply(result.events, state, {
    colour: (id) => enemyType(kit, id).colour,
    behaviour: (id) => enemyType(kit, id).behaviour,
  });
  playSounds(result.events);
  updateHud();

  const arrived = result.events.find((e) => e.type === 'descend');
  if (arrived && arrived.type === 'descend') toast(`${kit.title} · floor ${arrived.depth}. ${kit.arrivals[(arrived.depth - 1) % kit.arrivals.length]}`);
  if (state.phase === 'stairs') setTimeout(showStairs, 250);
  if (state.phase === 'over') setTimeout(showOver, 450);
}

function playSounds(events: GameEvent[]): void {
  const order: SoundName[] = [];
  for (const e of events) {
    if (e.type === 'playerHurt') order.push('hurt');
    else if (e.type === 'enemyHurt' || e.type === 'smash') order.push('hit');
    else if (e.type === 'pickup') order.push('pickup');
    else if (e.type === 'page' || e.type === 'ring') order.push('page');
    else if (e.type === 'stairs') order.push('stairs');
    else if (e.type === 'over' && (e.outcome.kind === 'died' || e.outcome.kind === 'lampOut')) order.push('lose');
    else if (e.type === 'playerMove') order.push('step');
  }
  // One of each per turn is plenty.
  for (const name of new Set(order)) sound.play(name);
}

function showStairs(): void {
  if (!state || state.phase !== 'stairs') return;
  const p = state.player;
  const keep = Math.floor(p.carried * config.run.deathKeepShare);
  const can = canDescend(state);
  showModal(`
    <h2>Floor ${state.depth} cleared</h2>
    <p class="big">◆ ${p.carried}</p>
    <p>Carrying ${p.carried} in relics. ${p.hearts}/${p.maxHearts} hearts, ${p.oil} oil left.</p>
    ${p.pages.some((x) => x) ? '<p class="muted">Your pages will crumble if you go on.</p>' : ''}
    <p class="muted">Bank now and the run is over with ◆ ${p.carried}. Go deeper and die or run dry, and you keep ◆ ${keep}.</p>
    <button class="primary" data-act="bank">Bank ◆ ${p.carried} and leave</button>
    <button data-act="descend" ${can ? '' : 'disabled'}>${can ? `Go deeper: floor ${state.depth + 1} of ${config.run.floors}` : 'Your lamp is dry: you must bank'}</button>
  `, (a) => {
    hideModal();
    act({ type: a === 'descend' ? 'descend' : 'bank' });
  });
}

const OUTCOME_TITLE: Record<OutcomeKind, string> = {
  banked: 'Banked', escaped: 'Made it out', died: 'Fallen', lampOut: 'Lamp out',
};

function showOver(): void {
  if (!state?.outcome || !run) return;
  const o = state.outcome;
  const lost = o.carried - o.score;
  const today = ukDate(new Date());
  const left = playsLeft(save, today);
  showModal(`
    <h2>${OUTCOME_TITLE[o.kind]}</h2>
    <p class="big">◆ ${o.score}</p>
    ${lost > 0 ? `<p class="muted">You lost ◆ ${lost} of the ◆ ${o.carried} you were carrying.</p>` : ''}
    <div class="stats">
      <div class="stat">Floor<b>${state.depth} of ${config.run.floors}</b></div>
      <div class="stat">Turns<b>${state.turn}</b></div>
    </div>
    <p>Today's total: <b>◆ ${dayTotal(day(save, today))}</b> · ${left} play${left === 1 ? '' : 's'} left</p>
    <button class="primary" data-act="home">Done</button>
  `, () => {
    hideModal();
    showHome();
  });
}

function updateHud(): void {
  if (!state) return;
  const p = state.player;
  $('hearts').innerHTML = Array.from({ length: p.maxHearts }, (_, i) => (i < p.hearts ? '♥' : '<span class="empty">♥</span>')).join('');
  $('relics').textContent = `◆ ${p.carried}`;
  $('floor').textContent = `Floor ${state.depth}/${config.run.floors}`;
  const oil = p.oil / p.maxOil;
  const bar = $('oil-bar');
  bar.style.width = `${Math.round(oil * 100)}%`;
  bar.classList.toggle('low', oil < 0.2);
  $('oil-text').textContent = `${p.oil}`;

  p.pages.forEach((kind, i) => {
    const b = $<HTMLButtonElement>(`page-${i}`);
    b.classList.toggle('empty', !kind);
    b.classList.toggle('selected', targeting === i);
    b.disabled = !kind || state!.phase !== 'play';
    b.innerHTML = kind ? `<span class="glyph">${PAGES[kind].glyph}</span>${PAGES[kind].name}` : '<span class="glyph">·</span>Empty';
  });
  const ring = $<HTMLButtonElement>('ring');
  ring.classList.toggle('hidden', !p.hasRing);
  ring.disabled = p.invisible > 0 || state.phase !== 'play';
  ring.innerHTML = p.invisible > 0
    ? `<span class="glyph">◯</span>Unseen ${p.invisible}`
    : `<span class="glyph">◯</span>Ring${p.corruption ? ` (${p.corruption})` : ''}`;

  $('hint').textContent = targeting !== null
    ? `${PAGES[p.pages[targeting]!].name}: tap a blue square, or tap the page again to cancel.`
    : 'Tap a neighbouring square to move or attack. Hold an enemy to inspect it.';
}

function choosePage(slot: number): void {
  if (!state) return;
  if (targeting === slot) {
    targeting = null;
  } else if (pageTargets(state, slot).length === 0) {
    toast(`Nothing to use ${PAGES[state.player.pages[slot]!].name} on here`);
    return;
  } else {
    targeting = slot;
  }
  updateHud();
}

function tapSquare(sq: Pos): void {
  if (!state || state.phase !== 'play') return;
  sound.unlock();
  if (targeting !== null) {
    const slot = targeting;
    if (pageTargets(state, slot).some((t) => same(t, sq))) act({ type: 'page', slot, x: sq.x, y: sq.y });
    else { targeting = null; updateHud(); }
    return;
  }
  const d = dist(sq, state.player.pos);
  if (d === 1) act({ type: 'move', dx: sq.x - state.player.pos.x, dy: sq.y - state.player.pos.y });
  else if (d > 1) toast('One square at a time');
}

function showInspect(id: number): void {
  if (!state) return;
  const e = state.floor.enemies.find((x) => x.id === id);
  if (!e) return;
  const type = enemyType(getKit(state.kitId), e.type);
  const next = {
    attack: 'Next turn: strikes the red squares.',
    charge: 'Next turn: charges along the red squares.',
    move: 'Next turn: moves closer.',
    stunned: 'Next turn: recovering.',
    none: 'Has lost track of you.',
  }[e.intent.type];
  const card = $('inspect');
  card.innerHTML = `<h3>${type.name} <span class="muted">${'♥'.repeat(e.hp)}</span></h3>
    <p>${type.blurb}</p><p class="muted">${BEHAVIOUR_HELP[type.behaviour]}</p><p><b>${next}</b></p>`;
  card.classList.remove('hidden');
  inspect = id;
}

function hideInspect(): void {
  $('inspect').classList.add('hidden');
  inspect = null;
}

// ---------------------------------------------------------------------------
// Input

let pressTimer = 0;
let held = false;
let pressSquare: Pos | null = null;

canvas.addEventListener('pointerdown', (ev) => {
  if (!state) return;
  const rect = canvas.getBoundingClientRect();
  pressSquare = squareAt(layout, state, ev.clientX - rect.left, ev.clientY - rect.top);
  held = false;
  window.clearTimeout(pressTimer);
  const enemy = pressSquare ? enemyAt(state, pressSquare) : undefined;
  if (enemy) {
    pressTimer = window.setTimeout(() => {
      held = true;
      showInspect(enemy.id);
    }, config.ui.holdMs);
  }
});
const release = () => {
  window.clearTimeout(pressTimer);
  if (held) hideInspect();
  else if (pressSquare) tapSquare(pressSquare);
  pressSquare = null;
  held = false;
};
canvas.addEventListener('pointerup', release);
canvas.addEventListener('pointercancel', () => {
  window.clearTimeout(pressTimer);
  hideInspect();
  pressSquare = null;
});
canvas.addEventListener('contextmenu', (e) => e.preventDefault());

const KEY_DIRS: Record<string, [number, number]> = {
  ArrowUp: [0, -1], ArrowDown: [0, 1], ArrowLeft: [-1, 0], ArrowRight: [1, 0],
  KeyW: [0, -1], KeyS: [0, 1], KeyA: [-1, 0], KeyD: [1, 0],
  KeyQ: [-1, -1], KeyE: [1, -1], KeyZ: [-1, 1], KeyC: [1, 1],
  Numpad8: [0, -1], Numpad2: [0, 1], Numpad4: [-1, 0], Numpad6: [1, 0],
  Numpad7: [-1, -1], Numpad9: [1, -1], Numpad1: [-1, 1], Numpad3: [1, 1],
};
window.addEventListener('keydown', (ev) => {
  if (!state || state.phase !== 'play' || !$('modal').classList.contains('hidden')) return;
  sound.unlock();
  const dir = KEY_DIRS[ev.code];
  if (dir && targeting === null) { act({ type: 'move', dx: dir[0], dy: dir[1] }); ev.preventDefault(); }
  else if (ev.code === 'Space' || ev.code === 'Period' || ev.code === 'Numpad5') { act({ type: 'wait' }); ev.preventDefault(); }
  else if (ev.code === 'Digit1') choosePage(0);
  else if (ev.code === 'Digit2') choosePage(1);
  else if (ev.code === 'KeyR') act({ type: 'ring' });
  else if (ev.code === 'Escape') { targeting = null; updateHud(); }
});

$('page-0').onclick = () => choosePage(0);
$('page-1').onclick = () => choosePage(1);
$('ring').onclick = () => {
  if (!state) return;
  showModal(`
    <h2>Put on the ring?</h2>
    <p>Enemies lose track of you for ${config.ring.invisibleTurns} turns.</p>
    <p class="muted">A wraith comes for you now, and one more will haunt every floor after this (up to ${config.ring.maxHuntersPerFloor}). You have used it ${state.player.corruption} time${state.player.corruption === 1 ? '' : 's'}.</p>
    <button class="primary" data-act="ring">Put it on</button>
    <button class="ghost" data-act="cancel">Leave it</button>
  `, (a) => { hideModal(); if (a === 'ring') act({ type: 'ring' }); });
};
$('wait').onclick = () => act({ type: 'wait' });
$('menu').onclick = () => showHome();
$('mute').onclick = () => {
  save.muted = !save.muted;
  sound.muted = save.muted;
  persist(store, save);
  $('mute').textContent = save.muted ? 'Sound: off' : 'Sound: on';
};
const openHelp = () => $('help').classList.remove('hidden');
$('help-open').onclick = openHelp;
$('help-game').onclick = openHelp;
$('help-close').onclick = () => $('help').classList.add('hidden');

// ---------------------------------------------------------------------------
// Modal and toast

function showModal(html: string, onChoice: (act: string) => void): void {
  const card = $('modal-card');
  card.innerHTML = html;
  card.querySelectorAll<HTMLButtonElement>('button[data-act]').forEach((b) => {
    b.onclick = () => onChoice(b.dataset.act!);
  });
  $('modal').classList.remove('hidden');
}

function hideModal(): void {
  $('modal').classList.add('hidden');
}

let toastTimer = 0;
/** Short messages go in the hint line, so they never cover the board. */
function toast(text: string): void {
  const el = $('hint');
  el.textContent = text;
  el.classList.add('flash');
  window.clearTimeout(toastTimer);
  toastTimer = window.setTimeout(() => { el.classList.remove('flash'); updateHud(); }, 2500);
}

// ---------------------------------------------------------------------------
// Canvas sizing and loop

function resize(): void {
  const wrap = $('board-wrap');
  const w = wrap.clientWidth;
  const h = wrap.clientHeight;
  dpr = Math.min(window.devicePixelRatio || 1, 3);
  canvas.width = Math.round(w * dpr);
  canvas.height = Math.round(h * dpr);
  lightCanvas.width = canvas.width;
  lightCanvas.height = canvas.height;
  layout = computeLayout(w, h, config.grid.width, config.grid.height);
}
new ResizeObserver(resize).observe($('board-wrap'));

startLoop({
  step: 1 / 60,
  update: (dt) => { if (state) fx.update(dt, state); },
  render: () => {
    if (!state || $('game').classList.contains('hidden')) return;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const targets = targeting !== null ? pageTargets(state, targeting) : null;
    render(ctx, lightCtx, { state, kit: getKit(state.kitId), fx, layout, targets, inspect }, dpr);
  },
});

showHome();
registerServiceWorker();
