/// <reference types="node" />
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import { describe, expect, it } from 'vitest';
import { cast } from './cast';
import { chapters } from './chapters';
import type { ByBrother, Chapter } from './types';

// Guardrail: public docs must not quote the game's lines. Descriptions, refusals and
// dialogue are clues; only the intro and ending (story everyone sees) may be quoted.
// The spoilers/ folder and authors' own briefs are exempt.

const root = join(__dirname, '..', '..');
const publicDocs = [join(root, 'CLAUDE.md'), ...markdownIn(join(root, 'docs', 'three-brothers'))].filter(
  (f) => !/[/\\](spoilers|briefs)[/\\]/.test(f),
);

function markdownIn(dir: string): string[] {
  if (!existsSync(dir)) return [];
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) return markdownIn(path);
    return name.endsWith('.md') ? [path] : [];
  });
}

const normalise = (s: string) =>
  s
    .toLowerCase()
    .replace(/[’']/g, "'")
    .replace(/[^a-z0-9£' ]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

/** Every sentence of in-game text that isn't the intro or ending, 4+ words long. */
function secretSentences(chapter: Chapter): string[] {
  const texts: string[] = [];
  const add = (t: ByBrother | undefined) => {
    if (!t) return;
    texts.push(...(typeof t === 'string' ? [t] : Object.values(t).filter((v): v is string => !!v)));
  };
  for (const r of chapter.rules) {
    r.say?.forEach(add);
    r.choices?.forEach((c) => {
      add(c.label);
      c.say?.forEach(add);
    });
  }
  Object.values(chapter.items).forEach((i) => add(i.look));
  Object.values(chapter.scenes).forEach((s) => s.hotspots.forEach((h) => add(h.look)));
  return texts
    .map((t) => t.replace(/^[A-Za-z]+(?: [A-Za-z]+)?: /, ''))
    .flatMap((t) => t.split(/(?<=[.!?])\s+/))
    .map(normalise)
    .filter((s) => s.split(' ').length >= 4);
}

describe('public docs contain no spoilers', () => {
  it('found the docs to check', () => {
    expect(publicDocs.length).toBeGreaterThan(3);
  });

  for (const chapter of chapters) {
    it(`don't quote lines from chapter "${chapter.id}"`, () => {
      // Brothers' own descriptions are public (they're in the story bible).
      const allowed = new Set(Object.values(cast).flatMap((b) => [b.look, ...b.fallback]).map(normalise));
      const secrets = secretSentences(chapter).filter((s) => !allowed.has(s));
      const leaks = publicDocs.flatMap((file) => {
        const text = normalise(readFileSync(file, 'utf8'));
        return secrets.filter((s) => text.includes(s)).map((s) => `${relative(root, file)}: "${s}"`);
      });
      expect(leaks).toEqual([]);
    });
  }
});
