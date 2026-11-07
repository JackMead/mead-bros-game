import { act, isValid, newGame, type Action } from './engine';
import type { Chapter } from './types';

/**
 * Save links: every chapter's progress packed into the part of a link after `#save=`,
 * so you can carry on in another browser. The part after `#` never reaches a server.
 *
 * A save is the list of moves made, written compactly, compressed when the browser can,
 * then made URL-safe. Pure apart from the compression API, so it runs in tests too.
 */

export type Saves = Record<string, Action[]>;

const PREFIX = '#save=';

/** One move as a short token, e.g. "u:kiosk", "i:tea>dog", "c:2". */
function packAction(a: Action): string {
  switch (a.type) {
    case 'look':
      return `l:${a.target}`;
    case 'use':
      return `u:${a.target}`;
    case 'item':
      return `i:${a.item}>${a.target}`;
    case 'switch':
      return `s:${a.brother}`;
    case 'choose':
      return `c:${a.index}`;
  }
}

function unpackAction(token: string): Action | null {
  const [kind, rest = ''] = [token.slice(0, 1), token.slice(2)];
  if (kind === 'l') return { type: 'look', target: rest };
  if (kind === 'u') return { type: 'use', target: rest };
  if (kind === 'i') {
    const [item, target] = rest.split('>');
    return item && target ? { type: 'item', item, target } : null;
  }
  if (kind === 's' && ['rob', 'jack', 'phil'].includes(rest)) return { type: 'switch', brother: rest as 'rob' | 'jack' | 'phil' };
  if (kind === 'c' && /^\d+$/.test(rest)) return { type: 'choose', index: Number(rest) };
  return null;
}

/** "chapter:tok,tok;chapter:tok,..." */
function pack(saves: Saves): string {
  return Object.entries(saves)
    .filter(([, h]) => h.length)
    .map(([id, h]) => `${id}:${h.map(packAction).join(',')}`)
    .join(';');
}

function unpack(text: string): Saves {
  const saves: Saves = {};
  for (const part of text.split(';').filter(Boolean)) {
    const i = part.indexOf(':');
    if (i < 1) continue;
    const actions = part.slice(i + 1).split(',').filter(Boolean).map(unpackAction);
    if (actions.every((a): a is Action => a !== null)) saves[part.slice(0, i)] = actions;
  }
  return saves;
}

const toBase64Url = (bytes: Uint8Array) =>
  btoa(String.fromCharCode(...bytes)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
const fromBase64Url = (s: string) =>
  Uint8Array.from(atob(s.replace(/-/g, '+').replace(/_/g, '/')), (c) => c.charCodeAt(0));

async function squeeze(bytes: Uint8Array, mode: 'compress' | 'decompress'): Promise<Uint8Array> {
  const stream = new Blob([bytes as BlobPart]).stream().pipeThrough(
    mode === 'compress' ? new CompressionStream('deflate-raw') : new DecompressionStream('deflate-raw'),
  );
  return new Uint8Array(await new Response(stream).arrayBuffer());
}

const canSqueeze = () => typeof CompressionStream !== 'undefined' && typeof DecompressionStream !== 'undefined';

/** The `#save=...` fragment for these saves. "z" marks compressed, "p" plain. */
export async function encodeSaves(saves: Saves): Promise<string> {
  const bytes = new TextEncoder().encode(pack(saves));
  if (canSqueeze()) return `${PREFIX}z${toBase64Url(await squeeze(bytes, 'compress'))}`;
  return `${PREFIX}p${toBase64Url(bytes)}`;
}

/** Saves from a `#save=...` fragment, or null if it isn't one or can't be read. */
export async function decodeSaves(hash: string): Promise<Saves | null> {
  if (!hash.startsWith(PREFIX)) return null;
  const body = hash.slice(PREFIX.length);
  try {
    let bytes: Uint8Array = fromBase64Url(body.slice(1));
    if (body[0] === 'z') {
      if (!canSqueeze()) return null;
      bytes = await squeeze(bytes, 'decompress');
    } else if (body[0] !== 'p') return null;
    return unpack(new TextDecoder().decode(bytes));
  } catch {
    return null;
  }
}

/**
 * Keep only saves that still play: the chapter exists and every move still makes sense.
 * A chapter edited since the link was made may no longer accept an old save; that one is dropped.
 */
export function usableSaves(chapters: Chapter[], saves: Saves): Saves {
  const ok: Saves = {};
  for (const [id, history] of Object.entries(saves)) {
    const chapter = chapters.find((c) => c.id === id);
    if (!chapter) continue;
    let state = newGame(chapter);
    let fine = true;
    for (const a of history) {
      if (a.type !== 'choose' && !isValid(chapter, state, a)) {
        fine = false;
        break;
      }
      state = act(chapter, state, a).state;
    }
    if (fine) ok[id] = history;
  }
  return ok;
}
