import { cast } from './cast';
import { config } from './config';
import { speakerInfo, visibleHotspots, type Line } from './engine';
import { BROTHERS, type Chapter, type Rect } from './types';
import { figureRect, layout, status, type Ui } from './ui';

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
  if (ui.screen === 'title') return drawTitle(ui, ctx);
  if (!ui.chapter || !ui.game) return;
  drawScene(ui, ctx);
  drawBar(ui, ctx);
  if (ui.screen === 'end') return drawEnd(ui, ctx);
  if (ui.queue.length) drawLine(ui.chapter, ui.queue[0], ctx);
  else if (ui.choices.length) drawChoices(ui, ctx);
  drawStatus(ui, ctx);
}

function drawTitle(ui: Ui, ctx: CanvasRenderingContext2D): void {
  const g = ctx.createLinearGradient(0, 0, 0, height);
  g.addColorStop(0, '#24324a');
  g.addColorStop(1, '#4a3a2a');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, width, height);
  text(ctx, 'The Three Brothers of Yorkshire', width / 2, 90, { size: 44, colour: colours.highlight, align: 'center', bold: true });
  text(ctx, 'Scattered through time. Trapped in Yorkshire. Together again?', width / 2, 132, {
    size: 18,
    colour: colours.narration,
    align: 'center',
  });
  ui.chapters.forEach((c, i) => {
    const r = layout.chapterCard(i);
    roundRect(ctx, r, 12, 'rgba(255,255,255,0.08)', 'rgba(255,255,255,0.2)');
    const label = c.number === 0 ? 'Prologue' : `Chapter ${c.number}`;
    text(ctx, `${label}: ${c.title}`, r.x + 18, r.y + 30, { size: 22, colour: colours.text, bold: true });
    const progress = { new: '', started: ' · in progress', done: ' · finished, tap to replay' }[ui.progress[i]];
    text(ctx, `${c.era}, ${c.place}${progress}`, r.x + 18, r.y + 56, { size: 14, colour: colours.narration });
    if (ui.progress[i] === 'started') {
      const b = layout.restartButton(i);
      roundRect(ctx, b, 8, 'rgba(0,0,0,0.3)', 'rgba(255,255,255,0.3)');
      text(ctx, 'Start again', b.x + b.w / 2, b.y + 24, { size: 14, colour: colours.text, align: 'center' });
    }
  });
}

function drawScene(ui: Ui, ctx: CanvasRenderingContext2D): void {
  const chapter = ui.chapter!;
  const game = ui.game!;
  const scene = chapter.scenes[game.scene];
  const bg = art(scene.background);
  if (bg) {
    ctx.drawImage(bg, 0, 0, width, sceneHeight);
  } else {
    const g = ctx.createLinearGradient(0, 0, 0, sceneHeight);
    g.addColorStop(0, scene.placeholder.top);
    g.addColorStop(1, scene.placeholder.bottom);
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, width, sceneHeight);
  }

  for (const h of visibleHotspots(chapter, game)) {
    const sprite = art(h.sprite);
    if (sprite) ctx.drawImage(sprite, h.rect.x, h.rect.y, h.rect.w, h.rect.h);
    else if (!bg) drawPlaceholder(ctx, h.rect, h.name, h.colour ?? '#777', h.shape);
  }

  for (const b of BROTHERS) {
    const r = figureRect(chapter, game, b);
    if (!r) continue;
    const sprite = art(`${b}.png`);
    if (sprite) ctx.drawImage(sprite, r.x - r.w / 2, r.y, r.w * 2, r.h);
    else drawFigure(ctx, r, cast[b].colour, cast[b].name);
    if (b === game.active) {
      ctx.fillStyle = colours.highlight;
      ctx.beginPath();
      ctx.moveTo(r.x + r.w / 2 - 8, r.y - 18);
      ctx.lineTo(r.x + r.w / 2 + 8, r.y - 18);
      ctx.lineTo(r.x + r.w / 2, r.y - 8);
      ctx.fill();
    }
  }

  // Menu button.
  const m = layout.menuButton();
  roundRect(ctx, m, 8, 'rgba(0,0,0,0.4)', 'rgba(255,255,255,0.25)');
  for (let i = 0; i < 3; i++) ctx.fillRect(m.x + 11, m.y + 13 + i * 7, m.w - 22, 3);

  if (ui.label) {
    const alpha = Math.min(1, ui.label.t * 2);
    ctx.globalAlpha = alpha;
    text(ctx, ui.label.text, ui.label.x, Math.max(24, ui.label.y - 14), {
      size: 16,
      colour: colours.text,
      align: 'center',
      bold: true,
      shadow: true,
    });
    ctx.globalAlpha = 1;
  }
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
  const lines = wrap(ctx, name, r.w - 8, 13);
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

/** A cartoon stand-in: body, head, name. Replaced by art/<brother>.png when it exists. */
function drawFigure(ctx: CanvasRenderingContext2D, r: Rect, colour: string, name: string): void {
  const head = r.w * 0.42;
  ctx.fillStyle = 'rgba(0,0,0,0.25)';
  ctx.beginPath();
  ctx.ellipse(r.x + r.w / 2, r.y + r.h, r.w * 0.7, 6, 0, 0, Math.PI * 2);
  ctx.fill();
  roundRect(ctx, { x: r.x, y: r.y + head * 2, w: r.w, h: r.h - head * 2 }, 10, colour, 'rgba(0,0,0,0.4)');
  ctx.fillStyle = '#f0c9a0';
  ctx.strokeStyle = 'rgba(0,0,0,0.4)';
  ctx.beginPath();
  ctx.arc(r.x + r.w / 2, r.y + head, head, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  text(ctx, name, r.x + r.w / 2, r.y + r.h - 10, { size: 12, colour: '#fff', align: 'center', bold: true, shadow: true });
}

function drawBar(ui: Ui, ctx: CanvasRenderingContext2D): void {
  const chapter = ui.chapter!;
  const game = ui.game!;
  ctx.fillStyle = colours.bar;
  ctx.fillRect(0, sceneHeight, width, height - sceneHeight);

  BROTHERS.forEach((b, i) => {
    if (!chapter.brothers.includes(b)) return;
    const r = layout.portrait(i);
    const active = b === game.active;
    roundRect(ctx, r, 10, cast[b].colour, active ? colours.highlight : 'rgba(255,255,255,0.15)', active ? 4 : 2);
    const face = art(`${b}-portrait.png`);
    if (face) ctx.drawImage(face, r.x + 4, r.y + 4, r.w - 8, r.h - 8);
    text(ctx, cast[b].name, r.x + r.w / 2, r.y + r.h - 10, { size: 15, colour: '#fff', align: 'center', bold: true, shadow: true });
  });

  const l = layout.lookButton();
  roundRect(ctx, l, 10, ui.lookMode ? colours.lookMode : 'rgba(255,255,255,0.08)', 'rgba(255,255,255,0.25)');
  drawEye(ctx, l.x + l.w / 2, l.y + l.h / 2 - 8, ui.lookMode ? '#10202a' : colours.text);
  text(ctx, 'Look', l.x + l.w / 2, l.y + l.h - 10, { size: 13, colour: ui.lookMode ? '#10202a' : colours.text, align: 'center' });

  game.inventory[game.active].forEach((item, i) => {
    const r = layout.slot(i);
    const selected = ui.selected === item;
    roundRect(ctx, r, 8, selected ? 'rgba(244,197,66,0.35)' : 'rgba(255,255,255,0.08)', selected ? colours.highlight : 'rgba(255,255,255,0.2)', selected ? 3 : 1);
    const pic = art(`item-${item}.png`);
    if (pic) ctx.drawImage(pic, r.x + 4, r.y + 4, r.w - 8, r.h - 8);
    else {
      const lines = wrap(ctx, chapter.items[item].name, r.w - 6, 12);
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

function drawLine(chapter: Chapter, line: Line, ctx: CanvasRenderingContext2D): void {
  const r = layout.dialogue();
  roundRect(ctx, r, 12, colours.panel, 'rgba(255,255,255,0.2)');
  const who = speakerInfo(chapter, line.speaker);
  let y = r.y + 30;
  if (who) {
    text(ctx, who.name, r.x + 20, y, { size: 17, colour: who.colour, bold: true });
    y += 26;
  }
  const size = 19;
  for (const l of wrap(ctx, line.text, r.w - 40, size)) {
    text(ctx, l, r.x + 20, y, { size, colour: who ? colours.text : colours.narration, italic: !who });
    y += size + 6;
  }
  text(ctx, 'tap ▸', r.x + r.w - 16, r.y + r.h - 12, { size: 12, colour: 'rgba(255,255,255,0.45)', align: 'right' });
}

function drawChoices(ui: Ui, ctx: CanvasRenderingContext2D): void {
  ui.choices.forEach((c, i) => {
    const r = layout.choice(i, ui.choices.length);
    roundRect(ctx, r, 8, colours.panel, 'rgba(255,255,255,0.3)');
    text(ctx, `${i + 1}. ${c}`, r.x + 16, r.y + 24, { size: 17, colour: colours.text });
  });
}

function drawStatus(ui: Ui, ctx: CanvasRenderingContext2D): void {
  const s = status(ui);
  if (!s || ui.queue.length || ui.choices.length) return;
  text(ctx, s, width / 2, 32, { size: 18, colour: ui.lookMode ? colours.lookMode : colours.text, align: 'center', bold: true, shadow: true });
}

function drawEnd(ui: Ui, ctx: CanvasRenderingContext2D): void {
  ctx.fillStyle = 'rgba(0,0,0,0.7)';
  ctx.fillRect(0, 0, width, height);
  const c = ui.chapter!;
  text(ctx, c.number === 0 ? 'End of the Prologue' : `End of Chapter ${c.number}`, width / 2, 220, {
    size: 40,
    colour: colours.highlight,
    align: 'center',
    bold: true,
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

function text(ctx: CanvasRenderingContext2D, s: string, x: number, y: number, style: TextStyle): void {
  ctx.font = `${style.italic ? 'italic ' : ''}${style.bold ? 'bold ' : ''}${style.size}px ${font}`;
  ctx.textAlign = style.align ?? 'left';
  if (style.shadow) {
    ctx.fillStyle = 'rgba(0,0,0,0.7)';
    ctx.fillText(s, x + 1.5, y + 1.5);
  }
  ctx.fillStyle = style.colour;
  ctx.fillText(s, x, y);
}

function wrap(ctx: CanvasRenderingContext2D, s: string, maxWidth: number, size: number): string[] {
  ctx.font = `${size}px ${font}`;
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
