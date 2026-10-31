import { describe, expect, it } from 'vitest';
import { newGame } from './engine';
import { prologue } from './chapters/00-prologue';
import { whitby } from './chapters/01-whitby';
import { intro, run } from './text';

// Only checks the parser, using actions that solve nothing.
describe('text commands', () => {
  const start = newGame(prologue);

  it('looks at things by name, ignoring case and articles', () => {
    expect(run(prologue, start, 'look at the Statue').output).toContain('Mother Shipton');
  });

  it('switches brother', () => {
    expect(run(prologue, start, 'play as Jack').state.active).toBe('jack');
  });

  it('explains unknown things and commands', () => {
    expect(run(prologue, start, 'look at spaceship').output).toContain('no "spaceship"');
    expect(run(prologue, start, 'dance wildly').output).toContain('help');
    expect(run(prologue, start, 'use banana on statue').output).toContain("isn't carrying");
  });

  it('numbers conversation choices and accepts them', () => {
    const talking = run(prologue, start, 'talk to kiosk');
    expect(talking.output).toMatch(/1\) /);
    const answered = run(prologue, talking.state, 'choose 4');
    expect(answered.state.choosing).toBeNull();
  });
});

describe('text commands, after playtest round 1', () => {
  const start = newGame(prologue);

  it('asks what to use an item on', () => {
    expect(run(prologue, start, 'use soapbox').output).toContain('on what?');
  });

  it('mentions switching and talking in the intro', () => {
    expect(intro(prologue, start)).toContain('play as');
  });

  it('reads a place whose name contains "to" as one thing', () => {
    expect(run(whitby, newGame(whitby), 'use Steps down to the old town').state.scene).toBe('old_town');
  });

  it('reads a brother\'s name as the brother, not an item named after him', () => {
    expect(run(whitby, newGame(whitby), 'use bat on phil').output).not.toContain("not on that");
    expect(run(whitby, newGame(whitby), 'look at phil').output).not.toContain('table tennis bat');
  });
});
