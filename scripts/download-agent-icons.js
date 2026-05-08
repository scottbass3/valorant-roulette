import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

const API_URL = 'https://valorant-api.com/v1/agents?isPlayableCharacter=true';
const OUTPUT_DIR = path.resolve('public', 'assets', 'agents');
const AGENTS_JSON_PATH = path.resolve('public', 'data', 'agents.json');

function safeFilename(name) {
  return name
    .normalize('NFKD')
    .replace(/[<>:"/\\|?*\u0000-\u001f]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function extensionFromUrl(url) {
  const pathname = new URL(url).pathname;
  const extension = path.extname(pathname);
  return extension || '.png';
}

function agentId(displayName) {
  return safeFilename(displayName)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function publicAssetPath(destination) {
  return path.relative(path.resolve('public'), destination).replaceAll(path.sep, '/');
}

async function downloadImage(url, displayName) {
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Failed to download ${displayName}: ${response.status} ${response.statusText}`);
  }

  const buffer = Buffer.from(await response.arrayBuffer());
  const filename = `${safeFilename(displayName)}${extensionFromUrl(url)}`;
  const destination = path.join(OUTPUT_DIR, filename);

  await writeFile(destination, buffer);
  return destination;
}

async function readExistingAgents() {
  const json = await readFile(AGENTS_JSON_PATH, 'utf8');
  return JSON.parse(json);
}

async function updateAgentsJson(downloadedAgents) {
  const existingAgents = await readExistingAgents();
  const existingIds = new Set(existingAgents.map((agent) => agent.id));
  const newAgents = [];

  for (const { agent, destination } of downloadedAgents) {
    const id = agentId(agent.displayName);

    if (existingIds.has(id)) {
      continue;
    }

    newAgents.push({
      id,
      name: agent.displayName,
      role: agent.role?.displayName ?? '',
      image: publicAssetPath(destination),
    });
    existingIds.add(id);
  }

  if (newAgents.length === 0) {
    console.log('agents.json is already up to date.');
    return;
  }

  const updatedAgents = [...existingAgents, ...newAgents];
  await writeFile(AGENTS_JSON_PATH, `${JSON.stringify(updatedAgents, null, 2)}\n`);

  console.log(`Added ${newAgents.length} new agent(s) to ${path.relative(process.cwd(), AGENTS_JSON_PATH)}.`);
}

async function main() {
  await mkdir(OUTPUT_DIR, { recursive: true });

  const response = await fetch(API_URL);
  if (!response.ok) {
    throw new Error(`Failed to fetch agents: ${response.status} ${response.statusText}`);
  }

  const payload = await response.json();
  const agents = payload.data ?? [];
  const playableAgents = agents.filter((agent) => agent.displayName && agent.displayIcon);

  console.log(`Found ${playableAgents.length} playable agents with displayIcon.`);

  const downloadedAgents = [];

  for (const agent of playableAgents) {
    const destination = await downloadImage(agent.displayIcon, agent.displayName);
    downloadedAgents.push({ agent, destination });
    console.log(`Downloaded ${agent.displayName} -> ${path.relative(process.cwd(), destination)}`);
  }

  await updateAgentsJson(downloadedAgents);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
