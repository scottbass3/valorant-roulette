import { getAgentNames, getStoredPlayers, storePlayers } from '../config.js';

export async function loadData() {
  const agentsRaw = await fetch('/data/agents.json').then(r => r.json());

  const agentNames = getAgentNames();
  const agents = agentsRaw.map(a => ({
    ...a,
    canonicalName: a.name,
    name: agentNames[a.id] || a.name,
  }));

  let players = getStoredPlayers();
  if (players === null) {
    players = [];
    storePlayers(players);
  }

  return { players, agents };
}
