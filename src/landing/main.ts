import './style.css';

interface GameMeta {
  title: string;
  description: string;
  /** Free-form label shown as a badge, e.g. "prototype", "playable", "archived". */
  status?: string;
}

// Every games/<id>/meta.json is picked up automatically at build time.
const metas = import.meta.glob<GameMeta>('../../games/*/meta.json', {
  eager: true,
  import: 'default',
});

const games = Object.entries(metas)
  .map(([path, meta]) => ({ id: path.split('/').at(-2)!, ...meta }))
  .sort((a, b) => a.title.localeCompare(b.title));

const list = document.querySelector<HTMLUListElement>('#games')!;

if (games.length === 0) {
  list.innerHTML = '<li class="empty">No games yet.</li>';
}

for (const game of games) {
  const li = document.createElement('li');
  const a = document.createElement('a');
  a.className = 'card';
  a.href = `./games/${game.id}/`;

  const title = document.createElement('h2');
  title.textContent = game.title;
  a.append(title);

  if (game.status) {
    const badge = document.createElement('span');
    badge.className = 'badge';
    badge.textContent = game.status;
    title.append(' ', badge);
  }

  const desc = document.createElement('p');
  desc.textContent = game.description;
  a.append(desc);

  li.append(a);
  list.append(li);
}
