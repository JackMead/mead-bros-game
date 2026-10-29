import { cast } from './cast';
import { config } from './config';
import { CUES, parseCue } from './cues';
import { ICONS, PROPS } from './props';
import { BROTHERS, type BrotherId, type Chapter } from './types';

/**
 * Catches typos in a chapter: unknown items, flags nothing sets, missing scenes,
 * unknown speakers. Returns a list of problems (empty means fine).
 */
export function validate(chapter: Chapter): string[] {
  const problems: string[] = [];
  const say = (where: string, msg: string) => problems.push(`${chapter.id}: ${where}: ${msg}`);

  const hotspotIds = new Set(Object.values(chapter.scenes).flatMap((s) => s.hotspots.map((h) => h.id)));
  const items = new Set(Object.keys(chapter.items));
  const targets = new Set<string>([...hotspotIds, ...items, ...BROTHERS, '*']);
  const speakers = new Set<string>(['me', ...Object.keys(cast), ...Object.keys(chapter.extras ?? {})]);

  // Every flag something can set.
  const settable = new Set(chapter.start.flags ?? []);
  const effects: { where: string; list: string[] }[] = [];
  const conditions: { where: string; cond?: string }[] = [{ where: 'goal', cond: chapter.goal }];
  const lines: { where: string; list: string[] }[] = [
    { where: 'intro', list: chapter.intro },
    { where: 'ending', list: chapter.ending },
  ];

  chapter.rules.forEach((r, i) => {
    const where = `rule ${i} (${r.look ? `look ${r.look}` : `${r.item ? `${r.item} on ` : ''}${r.on}`})`;
    if (!!r.on === !!r.look) say(where, 'needs exactly one of "on" or "look"');
    if (r.on && !targets.has(r.on)) say(where, `unknown target "${r.on}"`);
    if (r.look && !targets.has(r.look)) say(where, `unknown target "${r.look}"`);
    if (r.item && !items.has(r.item)) say(where, `unknown item "${r.item}"`);
    if (r.by && !chapter.brothers.includes(r.by)) say(where, `"${r.by}" isn't playable in this chapter`);
    conditions.push({ where, cond: r.if });
    effects.push({ where, list: r.do ?? [] });
    lines.push({ where, list: r.say ?? [] });
    r.choices?.forEach((c, j) => {
      conditions.push({ where: `${where} choice ${j}`, cond: c.if });
      effects.push({ where: `${where} choice ${j}`, list: c.do ?? [] });
      lines.push({ where: `${where} choice ${j}`, list: c.say ?? [] });
    });
  });

  for (const [id, scene] of Object.entries(chapter.scenes)) {
    for (const h of scene.hotspots) {
      conditions.push({ where: `hotspot ${h.id}`, cond: h.if });
      if (h.prop && !PROPS[h.prop]) say(`hotspot ${h.id}`, `unknown prop "${h.prop}" (see props.ts)`);
      const { x, y, w, h: hh } = h.rect;
      if (x < 0 || y < 0 || x + w > config.width || y + hh > config.sceneHeight) {
        say(`hotspot ${h.id}`, 'is outside the scene (or under the bottom bar)');
      }
    }
    for (const [b, stands] of Object.entries(scene.stand)) {
      stands?.forEach((s) => conditions.push({ where: `scene ${id} stand ${b}`, cond: s.if }));
    }
  }

  for (const { where, list } of effects) {
    for (const e of list) {
      const [verb, arg = ''] = e.split(':');
      if (verb === 'set') settable.add(arg);
      else if (verb === 'clear') continue;
      else if (verb === 'give' || verb === 'take') {
        const [item, to] = arg.split('>');
        if (!items.has(item)) say(where, `unknown item "${item}"`);
        if (to && !BROTHERS.includes(to as BrotherId)) say(where, `unknown brother "${to}"`);
      } else if (verb === 'goto') {
        if (!chapter.scenes[arg]) say(where, `unknown scene "${arg}"`);
      } else say(where, `unknown effect "${e}"`);
    }
  }

  for (const { where, cond } of conditions) {
    for (const token of (cond ?? '').split(/\s+/).filter(Boolean)) {
      const t = token.replace(/^!/, '');
      if (t.startsWith('has:')) {
        if (!items.has(t.slice(4))) say(where, `unknown item "${t.slice(4)}"`);
      } else if (!settable.has(t)) say(where, `flag "${t}" is never set`);
    }
  }

  for (const { where, list } of lines) {
    for (const line of list) {
      if (line.trim().startsWith('[')) {
        problems.push(...checkCue(chapter, `${chapter.id}: ${where}`, line));
        continue;
      }
      const m = /^([A-Za-z]+(?: [A-Za-z]+)?): /.exec(line);
      if (m && !speakers.has(m[1].toLowerCase())) say(where, `unknown speaker "${m[1]}" (add it to extras?)`);
    }
  }

  for (const [id, item] of Object.entries(chapter.items)) {
    if (item.icon && !ICONS[item.icon]) say(`item ${id}`, `unknown icon "${item.icon}" (see props.ts)`);
  }
  for (const p of chapter.puzzles) if (!settable.has(p.solved)) say(`puzzle ${p.id}`, `flag "${p.solved}" is never set`);
  if (!chapter.scenes[chapter.start.scene]) say('start', `unknown scene "${chapter.start.scene}"`);
  if (!chapter.brothers.includes(chapter.start.brother)) say('start', `"${chapter.start.brother}" isn't playable`);
  for (const list of Object.values(chapter.start.inventory ?? {})) {
    for (const item of list ?? []) if (!items.has(item)) say('start', `unknown item "${item}"`);
  }
  return problems;
}

function checkCue(chapter: Chapter, where: string, line: string): string[] {
  const cue = parseCue(line);
  if (!cue) return [`${where}: can't read cue ${line}`];
  const def = CUES[cue.name];
  if (!def) return [`${where}: unknown cue "${cue.name}" (see cues.ts)`];
  if (cue.args.length !== def.arity) return [`${where}: "${cue.name}" needs ${def.arity} argument(s): ${def.usage}`];
  const hotspots = Object.values(chapter.scenes).flatMap((s) => s.hotspots);
  if (cue.name === 'awaken' && !hotspots.find((h) => h.id === cue.args[0])?.outline) {
    return [`${where}: awaken needs a hotspot with an outline, got "${cue.args[0]}"`];
  }
  if (cue.name === 'pull' && !chapter.brothers.includes(cue.args[0] as BrotherId)) return [`${where}: can't pull "${cue.args[0]}"`];
  if (cue.name === 'place' && !ICONS[cue.args[0]]) return [`${where}: unknown icon "${cue.args[0]}"`];
  return [];
}
