# Valorant Roulette

Application web pour tirer aléatoirement l'ordre des joueurs et leurs agents Valorant, avec animations style ouverture de caisse CS:GO.

---

## Lancer l'application

```bash
npm install
npm run dev
```

Ouvre ensuite http://localhost:5173 dans ton navigateur.

Pour un build de production (hébergeable) :

```bash
npm run build
npm run preview
```

---

## Modifier les joueurs

Édite `public/data/players.json` :

```json
[
  {
    "id": "player1",
    "name": "TonPseudo",
    "avatar": "assets/players/player1.png"
  }
]
```

- **id** : identifiant unique (pas de doublons)
- **name** : nom affiché dans l'application
- **avatar** : chemin vers l'image (depuis `public/`). Si le fichier n'existe pas, une initiale est affichée à la place.

Place les images dans `public/assets/players/`.

---

## Modifier les agents

Édite `public/data/agents.json` :

```json
[
  {
    "id": "jett",
    "name": "Jett",
    "role": "Duelist",
    "image": "assets/agents/jett.png"
  }
]
```

- **role** : `Duelist`, `Controller`, `Initiator` ou `Sentinel` (détermine la couleur de la carte)
- **image** : chemin vers l'image (depuis `public/`). Les images des agents sont disponibles sur le wiki Valorant.

Place les images dans `public/assets/agents/`.

---

## Ajouter les sons CS:GO (optionnel)

Télécharge les fichiers audio et place-les dans `public/sounds/` :

- `csgo_ui_crate_item_scroll.wav` — son de défilement
- `csgo_ui_crate_open.wav` — son de révélation

Sans ces fichiers, des sons de substitution générés (Web Audio API) sont utilisés pour les ticks de défilement.

---

## Structure du projet

```
public/
  data/
    players.json       ← liste des joueurs
    agents.json        ← liste des agents
  assets/
    players/           ← avatars des joueurs
    agents/            ← portraits des agents
  sounds/              ← sons optionnels
src/
  main.js              ← logique principale
  style.css            ← styles
  animations/
    playerShuffle.js   ← animation d'ordre des joueurs
    caseOpening.js     ← animation style CS:GO
  data/
    loader.js          ← chargement JSON
  utils/
    random.js          ← fonctions utilitaires
    sound.js           ← gestion audio
    agentColor.js      ← couleurs par rôle
```
