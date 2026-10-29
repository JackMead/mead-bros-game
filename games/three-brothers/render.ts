import { cast } from './cast';
import { drawBrother, drawHead, drawSprite, shade, type Pose } from './characters';
import { drawCinemaBack, drawCinemaFront, pulled, sceneryTime, shakeOffset } from './cinema';
import { config } from './config';
import { speakerInfo, visibleHotspots, type Line } from './engine';
import { ICONS, PROPS } from './props';
import { BROTHERS, type BrotherId, type Rect } from './types';
import { inCinematic, layout, standFor, status, type Ui } from './ui';

/** Drawing only: reads the UI and game state, never changes them. */

const { width, height, sceneHeight, colours, font } = config;

// Any image dropped into art/ is available by file name.
const artUrls = import.meta.glob<string>('./art/*.{png,jpg,jpeg,webp}', {
  eager: true,
  query: '?url',
  import: 'default',
});
const images = new Map<string, HTMLImageElement>();

/** The image for a file in art/, once it has loaded; null until then or if there isn't one. */
function art(name: string | undefined): HTMLImageElement | null {
  if (!name) return null;
  const url = artUrls[`./art/${name}`];
  if (!url) return null;
  let img = images.get(name);
  if (!img) {
    img = new Image();
    img.src = url;
    images.set(name, img);
  }
  return img.complete && img.naturalWidth > 0 ? img : null;
}

export function render(ui: Ui, ctx: CanvasRenderingContext2D): void {
  ctx.clearRect(0, 0, width, height);
  if (ui.screen === 'title') {
    drawTitle(ui, ctx);
  } else if (ui.chapter && ui.game) {
    const shake = shakeOffset(ui);
    ctx.save();
    ctx.translate(shake.x, shake.y);
    drawScene(ui, ctx);
    ctx.restore();
    drawBar(ui, ctx);
    drawButtons(ui, ctx);
    if (ui.screen === 'end') drawEnd(ui, ctx);
    else if (ui.queue.length && !ui.queue[0].cue) drawLine(ui, ui.queue[0], ctx);
    else if (ui.choices.length) drawChoices(ui, ctx);
    if (ui.screen === 'play') drawStatus(ui, ctx);
  }
  if (ui.fade > 0) {
    ctx.fillStyle = `rgba(0,0,0,${ui.fade})`;
    ctx.fillRect(0, 0, width, height);
  }
}

/** Who is speaking right now, if it's a brother. */
function speaking(ui: Ui): BrotherId | null {
  const s = ui.queue[0]?.speaker;
  return s && s in cast ? (s as BrotherId) : null;
}

function drawTitle(ui: Ui, ctx: CanvasRenderingContext2D): void {
  const g = ctx.createLinearGradient(0, 0, 0, height);
  g.addColorStop(0, '#2b4a6b');
  g.addColorStop(0.55, '#c98a5a');
  g.addColorStop(1, '#3d4a2c');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, width, height);

  // Rolling Yorkshire hills.
  hill(ctx, 380, '#5b7a3a', 0.004, 26);
  hill(ctx, 430, '#46632d', 0.006, 20);
  ctx.fillStyle = '#34491f';
  ctx.fillRect(0, 470, width, height - 470);

  outlined(ctx, 'The Three Brothers', 40, 74, { size: 46, colour: colours.highlight });
  outlined(ctx, 'of Yorkshire', 40, 122, { size: 34, colour: '#f3ead8' });
  text(ctx, 'Scattered through time. Stuck in Yorkshire. Together again?', 42, 156, { size: 16, colour: '#f3ead8', shadow: true });

  ui.chapters.forEach((c, i) => {
    const r = layout.chapterCard(i);
    roundRect(ctx, r, 12, 'rgba(20,14,10,0.72)', 'rgba(244,197,66,0.6)', 2);
    const label = c.number === 0 ? 'Prologue' : `Chapter ${c.number}`;
    text(ctx, `${label}: ${c.title}`, r.x + 18, r.y + 30, { size: 22, colour: colours.text, bold: true });
    const progress = { new: 'Tap to play', started: 'In progress: tap to carry on', done: 'Finished: tap to replay' }[ui.progress[i]];
    text(ctx, `${c.era}, ${c.place}`, r.x + 18, r.y + 52, { size: 13, colour: colours.narration });
    text(ctx, progress, r.x + 18, r.y + 70, { size: 13, colour: colours.highlight });
    if (ui.progress[i] === 'started') {
      const b = layout.restartButton(i);
      roundRect(ctx, b, 8, 'rgba(0,0,0,0.3)', 'rgba(255,255,255,0.3)');
      text(ctx, 'Start again', b.x + b.w / 2, b.y + 24, { size: 14, colour: colours.text, align: 'center' });
    }
  });

  // The three of them, posing.
  const feet = 500;
  const pose = { time: ui.time, talking: false };
  figure(ctx, 'jack', 690, feet, config.figure.height * cast.jack.height * 1.7, pose);
  figure(ctx, 'phil', 890, feet, config.figure.height * cast.phil.height * 1.7, pose);
  figure(ctx, 'rob', 790, feet + 6, config.figure.height * cast.rob.height * 1.7, pose);
}

function hill(ctx: CanvasRenderingContext2D, y: number, colour: string, freq: number, amp: number): void {
  ctx.fillStyle = colour;
  ctx.beginPath();
  ctx.moveTo(0, height);
  for (let x = 0; x <= width; x += 20) ctx.lineTo(x, y + Math.sin(x * freq + y) * amp);
  ctx.lineTo(width, height);
  ctx.fill();
}

function drawScene(ui: Ui, ctx: CanvasRenderingContext2D): void {
  const chapter = ui.chapter!;
  const game = ui.game!;
  const scene = chapter.scenes[game.scene];
  const bg = art(scene.background);
  if (bg) {
    // Painted at 16:9 for the whole screen; the bottom bar covers the foreground.
    ctx.drawImage(bg, 0, 0, width, height);
  } else {
    const g = ctx.createLinearGradient(0, 0, 0, sceneHeight);
    g.addColorStop(0, scene.placeholder.top);
    g.addColorStop(1, scene.placeholder.bottom);
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, width, sceneHeight);
  }

  for (const h of visibleHotspots(chapter, game)) {
    const sprite = art(h.sprite);
    const prop = h.prop ? PROPS[h.prop] : undefined;
    if (sprite) ctx.drawImage(sprite, h.rect.x, h.rect.y, h.rect.w, h.rect.h);
    else if (prop) {
      if (!bg && h.prop === 'water') drawPlaceholder(ctx, h.rect, h.name, h.colour ?? '#777', h.shape);
      prop(ctx, h.rect, sceneryTime(ui), h.text ?? [], !!bg, art);
    } else if (!bg) drawPlaceholder(ctx, h.rect, h.name, h.colour ?? '#777', h.shape);
  }

  drawCinemaBack(ctx, ui, bg);

  // Brothers, back to front.
  const talker = speaking(ui);
  const placed = BROTHERS.map((b) => ({ b, s: standFor(chapter, game, b) }))
    .filter((p) => p.s)
    .sort((p, q) => p.s!.y - q.s!.y);
  for (const { b, s } of placed) {
    const h = config.figure.height * cast[b].height;
    const pull = pulled(ui, b, s!, h);
    if (pull === 'gone') continue;
    if (pull) {
      ctx.save();
      ctx.translate(pull.x, pull.y);
      ctx.rotate(pull.rotation);
      ctx.scale(pull.scale, pull.scale);
      figure(ctx, b, 0, h / 2, h, { time: ui.time, talking: false, pose: 'flail' });
      ctx.restore();
      continue;
    }
    figure(ctx, b, s!.x, s!.y, h, { time: ui.time, talking: talker === b, pose: s!.pose });
    if (b === game.active && !ui.queue.length) {
      const bob = Math.sin(ui.time * 4) * 2;
      ctx.fillStyle = colours.highlight;
      ctx.strokeStyle = 'rgba(0,0,0,0.6)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(s!.x - 7, s!.y - h - 16 + bob);
      ctx.lineTo(s!.x + 7, s!.y - h - 16 + bob);
      ctx.lineTo(s!.x, s!.y - h - 7 + bob);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    }
  }

  drawCinemaFront(ctx, ui);

  if (ui.label) {
    ctx.globalAlpha = Math.min(1, ui.label.t * 2);
    outlined(ctx, ui.label.text, ui.label.x, Math.max(28, ui.label.y - 16), { size: 17, colour: colours.text, align: 'center' });
    ctx.globalAlpha = 1;
  }
}

function drawButtons(ui: Ui, ctx: CanvasRenderingContext2D): void {
  const m = layout.menuButton();
  roundRect(ctx, m, 8, 'rgba(0,0,0,0.4)', 'rgba(255,255,255,0.25)');
  ctx.fillStyle = colours.text;
  for (let i = 0; i < 3; i++) ctx.fillRect(m.x + 11, m.y + 13 + i * 7, m.w - 22, 3);
  if (inCinematic(ui)) {
    const k = layout.skipButton();
    roundRect(ctx, k, 8, 'rgba(0,0,0,0.45)', 'rgba(255,255,255,0.3)');
    text(ctx, 'Skip ▸▸', k.x + k.w / 2, k.y + 27, { size: 15, colour: colours.text, align: 'center', bold: true });
  }
}

/** A brother, painted if his picture is in art/, otherwise drawn in code. Feet at (x, y). */
function figure(ctx: CanvasRenderingContext2D, b: BrotherId, x: number, y: number, h: number, pose: Pose): void {
  const sprite = cast[b].sprite;
  const img = art(sprite?.file);
  if (sprite && img) drawSprite(ctx, b, img, sprite, x, y, h, pose);
  else drawBrother(ctx, b, x, y, h, pose);
}

function drawPlaceholder(ctx: CanvasRenderingContext2D, r: Rect, name: string, colour: string, shape?: 'rect' | 'ellipse'): void {
  ctx.fillStyle = colour;
  ctx.strokeStyle = 'rgba(0,0,0,0.35)';
  ctx.lineWidth = 2;
  if (shape === 'ellipse') {
    ctx.beginPath();
    ctx.ellipse(r.x + r.w / 2, r.y + r.h / 2, r.w / 2, r.h / 2, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  } else {
    roundRect(ctx, r, 10, colour, 'rgba(0,0,0,0.35)');
  }
  const lines = wrap(ctx, name, r.w - 8, 13, true);
  lines.forEach((l, i) =>
    text(ctx, l, r.x + r.w / 2, r.y + r.h / 2 + 5 + (i - (lines.length - 1) / 2) * 15, {
      size: 13,
      colour: 'rgba(255,255,255,0.9)',
      align: 'center',
      bold: true,
      shadow: true,
    }),
  );
}

function drawBar(ui: Ui, ctx: CanvasRenderingContext2D): void {
  const chapter = ui.chapter!;
  const game = ui.game!;
  const g = ctx.createLinearGradient(0, sceneHeight, 0, height);
  g.addColorStop(0, '#3a2a1c');
  g.addColorStop(1, '#1d140d');
  ctx.fillStyle = g;
  ctx.fillRect(0, sceneHeight, width, height - sceneHeight);
  ctx.fillStyle = '#6b4c2e';
  ctx.fillRect(0, sceneHeight, width, 3);

  const talker = speaking(ui);
  BROTHERS.forEach((b, i) => {
    if (!chapter.brothers.includes(b)) return;
    const r = layout.portrait(i);
    const active = b === game.active;
    roundRect(ctx, r, 10, shade(cast[b].colour, -0.35), active ? colours.highlight : 'rgba(255,255,255,0.15)', active ? 4 : 2);
    ctx.save();
    ctx.beginPath();
    ctx.roundRect(r.x + 2, r.y + 2, r.w - 4, r.h - 4, 8);
    ctx.clip();
    const face = art(`${b}-portrait.png`);
    // A painted face bobs while its brother talks.
    const bob = talker === b ? -Math.abs(Math.sin(ui.time * 10)) * 3 : 0;
    if (face) ctx.drawImage(face, r.x + 2, r.y + 2 + bob, r.w - 4, r.w - 4);
    else drawHead(ctx, b, r.x + r.w / 2, r.y + r.h * 0.46, r.w * 0.3, { time: ui.time, talking: talker === b });
    ctx.restore();
    outlined(ctx, cast[b].name, r.x + r.w / 2, r.y + r.h - 6, { size: 13, colour: active ? colours.highlight : '#fff', align: 'center' });
  });

  const l = layout.lookButton();
  roundRect(ctx, l, 10, ui.lookMode ? colours.lookMode : 'rgba(255,255,255,0.08)', 'rgba(255,255,255,0.25)');
  drawEye(ctx, l.x + l.w / 2, l.y + l.h / 2 - 8, ui.lookMode ? '#10202a' : colours.text);
  text(ctx, 'Look', l.x + l.w / 2, l.y + l.h - 10, { size: 13, colour: ui.lookMode ? '#10202a' : colours.text, align: 'center' });

  game.inventory[game.active].forEach((item, i) => {
    const r = layout.slot(i);
    const selected = ui.selected === item;
    roundRect(ctx, r, 8, selected ? 'rgba(244,197,66,0.3)' : 'rgba(0,0,0,0.3)', selected ? colours.highlight : 'rgba(255,255,255,0.18)', selected ? 3 : 1);
    const def = chapter.items[item];
    const pic = art(`item-${item}.png`);
    const icon = def.icon ? ICONS[def.icon] : undefined;
    if (pic) ctx.drawImage(pic, r.x + 4, r.y + 4, r.w - 8, r.h - 8);
    else if (icon) icon(ctx, r, ui.time);
    else {
      const lines = wrap(ctx, def.name, r.w - 6, 12);
      lines.forEach((t, j) =>
        text(ctx, t, r.x + r.w / 2, r.y + r.h / 2 + 4 + (j - (lines.length - 1) / 2) * 14, { size: 12, colour: colours.text, align: 'center' }),
      );
    }
  });
}

function drawEye(ctx: CanvasRenderingContext2D, x: number, y: number, colour: string): void {
  ctx.strokeStyle = colour;
  ctx.fillStyle = colour;
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.ellipse(x, y, 16, 9, 0, 0, Math.PI * 2);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(x, y, 4.5, 0, Math.PI * 2);
  ctx.fill();
}

/**
 * Speech appears over the speaker's head in their colour, adventure-game style.
 * Narration goes in a box at the top.
 */
function drawLine(ui: Ui, line: Line, ctx: CanvasRenderingContext2D): void {
  const chapter = ui.chapter!;
  const who = speakerInfo(chapter, line.speaker);
  const anchor = who ? speechAnchor(ui, line.speaker!) : null;
  const size = 21;

  if (who && anchor) {
    const lines = wrap(ctx, line.text, config.speechWidth, size, true);
    const widest = Math.max(...lines.map((l) => measure(ctx, l, size, true)));
    const x = Math.min(width - 12 - widest / 2, Math.max(12 + widest / 2, anchor.x));
    const top = Math.max(30, anchor.y - lines.length * (size + 4));
    lines.forEach((l, i) => outlined(ctx, l, x, top + i * (size + 4), { size, colour: who.colour, align: 'center' }));
  } else {
    const lines = wrap(ctx, line.text, width - 160, 19, false, true);
    const r = { x: 60, y: 14, w: width - 120, h: 26 + lines.length * 25 };
    roundRect(ctx, r, 10, 'rgba(24,16,10,0.85)', 'rgba(244,197,66,0.45)', 2);
    lines.forEach((l, i) => text(ctx, l, width / 2, r.y + 32 + i * 25, { size: 19, colour: '#f3ead8', align: 'center', italic: true }));
  }
  const blink = Math.floor(ui.time * 2) % 2 === 0;
  if (blink) outlined(ctx, 'tap ▸', width - 60, sceneHeight - 12, { size: 13, colour: 'rgba(255,255,255,0.8)', align: 'center' });
}

function speechAnchor(ui: Ui, speaker: string): { x: number; y: number } {
  const chapter = ui.chapter!;
  if (speaker in cast) {
    const s = standFor(chapter, ui.game!, speaker as BrotherId);
    if (s) return { x: s.x, y: s.y - config.figure.height * cast[speaker as BrotherId].height - 22 };
  }
  return chapter.extras?.[speaker]?.at ?? { x: width / 2, y: 150 };
}

function drawChoices(ui: Ui, ctx: CanvasRenderingContext2D): void {
  const first = layout.choice(0, ui.choices.length);
  const last = layout.choice(ui.choices.length - 1, ui.choices.length);
  roundRect(ctx, { x: first.x - 12, y: first.y - 10, w: first.w + 24, h: last.y + last.h - first.y + 20 }, 12, 'rgba(24,16,10,0.88)', 'rgba(244,197,66,0.45)', 2);
  const colour = cast[ui.game!.active].colour;
  ui.choices.forEach((c, i) => {
    const r = layout.choice(i, ui.choices.length);
    const hover = ui.hoverChoice === i;
    if (hover) roundRect(ctx, r, 6, 'rgba(255,255,255,0.08)');
    text(ctx, `${i + 1}. ${c}`, r.x + 14, r.y + 25, { size: 18, colour: hover ? colours.highlight : colour, bold: true });
  });
}

function drawStatus(ui: Ui, ctx: CanvasRenderingContext2D): void {
  const s = status(ui);
  if (!s || ui.queue.length || ui.choices.length) return;
  outlined(ctx, s, width / 2, 34, { size: 19, colour: ui.lookMode ? colours.lookMode : colours.text, align: 'center' });
}

function drawEnd(ui: Ui, ctx: CanvasRenderingContext2D): void {
  ctx.fillStyle = 'rgba(0,0,0,0.72)';
  ctx.fillRect(0, 0, width, height);
  const c = ui.chapter!;
  outlined(ctx, c.number === 0 ? 'End of the Prologue' : `End of Chapter ${c.number}`, width / 2, 220, {
    size: 42,
    colour: colours.highlight,
    align: 'center',
  });
  text(ctx, c.title, width / 2, 262, { size: 22, colour: colours.text, align: 'center' });
  text(ctx, 'Tap to go back to the chapters', width / 2, 330, { size: 16, colour: colours.narration, align: 'center' });
}

// ---- Helpers ----

interface TextStyle {
  size: number;
  colour: string;
  align?: CanvasTextAlign;
  bold?: boolean;
  italic?: boolean;
  shadow?: boolean;
}

function fontFor(size: number, bold = false, italic = false): string {
  return `${italic ? 'italic ' : ''}${bold ? 'bold ' : ''}${size}px ${font}`;
}

function text(ctx: CanvasRenderingContext2D, s: string, x: number, y: number, style: TextStyle): void {
  ctx.font = fontFor(style.size, style.bold, style.italic);
  ctx.textAlign = style.align ?? 'left';
  ctx.textBaseline = 'alphabetic';
  if (style.shadow) {
    ctx.fillStyle = 'rgba(0,0,0,0.7)';
    ctx.fillText(s, x + 1.5, y + 1.5);
  }
  ctx.fillStyle = style.colour;
  ctx.fillText(s, x, y);
}

/** Bold text with a thick dark outline, readable over any background. */
function outlined(ctx: CanvasRenderingContext2D, s: string, x: number, y: number, style: TextStyle): void {
  ctx.font = fontFor(style.size, true);
  ctx.textAlign = style.align ?? 'left';
  ctx.textBaseline = 'alphabetic';
  ctx.lineJoin = 'round';
  ctx.lineWidth = Math.max(3, style.size / 5);
  ctx.strokeStyle = 'rgba(15,10,6,0.95)';
  ctx.strokeText(s, x, y);
  ctx.fillStyle = style.colour;
  ctx.fillText(s, x, y);
}

function measure(ctx: CanvasRenderingContext2D, s: string, size: number, bold = false): number {
  ctx.font = fontFor(size, bold);
  return ctx.measureText(s).width;
}

function wrap(ctx: CanvasRenderingContext2D, s: string, maxWidth: number, size: number, bold = false, italic = false): string[] {
  ctx.font = fontFor(size, bold, italic);
  const lines: string[] = [];
  let line = '';
  for (const word of s.split(' ')) {
    const next = line ? `${line} ${word}` : word;
    if (ctx.measureText(next).width > maxWidth && line) {
      lines.push(line);
      line = word;
    } else line = next;
  }
  if (line) lines.push(line);
  return lines;
}

function roundRect(ctx: CanvasRenderingContext2D, r: Rect, radius: number, fill: string, stroke?: string, lineWidth = 2): void {
  ctx.beginPath();
  ctx.roundRect(r.x, r.y, r.w, r.h, radius);
  ctx.fillStyle = fill;
  ctx.fill();
  if (stroke) {
    ctx.strokeStyle = stroke;
    ctx.lineWidth = lineWidth;
    ctx.stroke();
  }
}
