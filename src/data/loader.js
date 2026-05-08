export async function loadData() {
  const [players, agents] = await Promise.all([
    fetch('/data/players.json').then(r => r.json()),
    fetch('/data/agents.json').then(r => r.json()),
  ]);
  return { players, agents };
}
