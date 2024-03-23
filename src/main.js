import {generateTowerSpotsFromLevel, hideTowerSelectionMenu} from "./Tower.js";
import {addEnemy, setPathFromLevel, generateStartPosFromLevel} from "./Enemy.js";
import {displayMoney } from "./state.js";

kaboom()

const waves = [
  /*"1111114",
  "22222222223",*/
  "1234"
];

const levelPath = [
  	"  x          ",
    "  ┏━━┓     x ",
  	"S━┛  ┃ x  xx ",
  	"  x  ┃     x ",
    "    x┗━━━━━E ",
]

let isGameOver = false;
let currentWaveIndex = 0;
let enemiesRemaining = 0;
let start = vec2(0,0);
let lives = 1;
let godMode = true;

function displayLives() {
  destroyAll("lives");
  if (godMode) {
    add([
      sprite("lives_infinite"),
      "lives",
      z(9),
      pos(width() - 80, -20)
    ]);
  } else {
    add([
      sprite("lives_1"),
      "lives",
      z(9),
      pos(width() - 80, -20)
    ]);
  }

}

function spawnEnemyFromType(type) {
  if(!isGameOver) {
    switch (type) {
      case '1':
        addEnemy("ghosty", start, onEnemyDefeated, onEnemyReachEnd);
        break;
      case '2':
        addEnemy("ghostyf", start, onEnemyDefeated, onEnemyReachEnd);
        break;
      case '3':
        addEnemy("ghostyg", start, onEnemyDefeated, onEnemyReachEnd);
        break;
      case '4':
        addEnemy("ghostyb", start, onEnemyDefeated, onEnemyReachEnd);
        break;
    }
  }
}

function startWave(waveString) {
  let delay = 0; // Initial delay
  const spawnDelay = 1000; // Delay between spawns in milliseconds, e.g., 1000ms = 1s

  for (const type of waveString) {
    setTimeout(() => {
      spawnEnemyFromType(type);
      enemiesRemaining++; // Ensure this is only incremented once the enemy is actually spawned
    }, delay);

    delay += spawnDelay; // Increment delay for the next spawn
  }
}

function onEnemyReachEnd() {
  if(!godMode) {
    go("lose");
  }
}

function onEnemyDefeated() {
  enemiesRemaining--;
  if (enemiesRemaining <= 0 && currentWaveIndex < waves.length) {
    countdownToNextWave();
  }
}

function countdownToNextWave() {
  let countdown = 5; // 5 seconds countdown
  // Display countdown on screen, then start the next wave
  setTimeout(() => {
    currentWaveIndex++;
    if (currentWaveIndex < waves.length) {
      startWave(waves[currentWaveIndex]);
    } else {
      currentWaveIndex--;
      startWave(waves[currentWaveIndex]);
    }
  }, countdown * 1000);
}

// Load the sprite for empty tower spots
loadSprite("bullet1", "/sprites/bulletRed1_outline.png")
loadSprite("bullet2", "/sprites/bulletGreen2.png")
loadSprite("bullet3", "/sprites/towerDefense_tile251.png")

loadSpriteAtlas("/sprites/BulletTileset.png", "/sprites/BulletTileset.json")
loadSpriteAtlas("/sprites/TowerTileset.png", "/sprites/TowerTileset.json")
loadSpriteAtlas("/sprites/IconsTileset.png", "/sprites/IconsTileset.json")
loadSpriteAtlas("/sprites/0x72_DungeonTilesetII_v1.6.png", "/sprites/0x72_DungeonTilesetII_v1.6.json")
loadSpriteAtlas("/sprites/Paths.png", "/sprites/Paths.json")
loadSpriteAtlas("/sprites/Effect_Explosion_1.png", "/sprites/Effect_Explosion_1.json")
loadSpriteAtlas("/sprites/uipack_rpg_sheet.png", "/sprites/uipack_rpg_sheet.json")

setLevel(levelPath);

function setLevel(level) {
  const screenWidth = width();
  const screenHeight = height();

  // Calculate the required number of tiles to fill the screen
  const tilesRequiredX = Math.max(Math.ceil(screenWidth / 128),level[0].length);
  const tilesRequiredY = Math.ceil(screenHeight / 128);

  // Adjust the level width
  for (let i = 0; i < level.length; i++) {
    const shortfallX = tilesRequiredX - level[i].length;
    console.log(`On row ${i} I need to add ${shortfallX}`)
    if (shortfallX > 0) {
      level[i] += ' '.repeat(shortfallX);
    }
  }

  // Adjust the level height
  const shortfallY = tilesRequiredY - level.length;
  for (let i = 0; i < shortfallY; i++) {
    level.push(' '.repeat(tilesRequiredX));
  }

  addLevel(level, {
    tileWidth: 128,
    tileHeight: 128,
    pos: vec2(0, 0),
    tiles: {
      "┃": () => [
        sprite("path_up"),
        z(0)
      ],
      "━": () => [
        sprite("path_right"),
        z(0)
      ],
      "S": () => [
        sprite("path_right"),
        z(0)
      ],
      "E": () => [
        sprite("path_end"),
        z(0)
      ],
      "┗": () => [
        sprite("path_down_right"),
        z(0)
      ],
      "┛": () => [
        sprite("path_right_up"),
        z(0)
      ],
      "┏": () => [
        sprite("path_up_right"),
        z(0)
      ],
      "┓": () => [
        sprite("path_right_down"),
        z(0)
      ],
      " ": () => [
        sprite("grass"),
        z(0)
      ],
      "x": () => [
        sprite("tower"),
        z(0)
      ]
    },
  })
}



scene("lose", () => {
  add([
    text("Game Over"),
    color(255,0,0),
    pos(width()/2, height()/2),
    anchor("center")
  ])
  isGameOver = true;
})


onMousePress(() => {
  let found_item = false;

  for (const obj of get("towerSpotButton").reverse()) {
    if (obj.isHovering()) {
      console.log("found a spot")
      obj.onSelect()
      found_item = true
      break
    }
  }
  if (!found_item) {
    for (const obj of get("towerMenuButton").reverse()) {
      if (obj.isHovering()) {
        console.log("found a menu")
        obj.onSelect()
        found_item = true
        break
      }
    }
  }

  if(!found_item) {
    console.log("didn't find a button closing all")
    hideTowerSelectionMenu();
  }

})

setPathFromLevel(levelPath,128,128,vec2(0, 0));
start = generateStartPosFromLevel(levelPath,128,128);
generateTowerSpotsFromLevel(levelPath,128,128,vec2(0, 0));
displayMoney(1000);
// Initially start the first wave
if (waves.length > 0) {
  startWave(waves[currentWaveIndex]);
}
displayLives();

onKeyPress("g", () => {
  if (!godMode) {
    godMode = true;

  } else {
    godMode = false;
  }
  displayLives();
})

debug.inspect = true

