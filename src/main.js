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
let timeouts = [];

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
  clearTimeouts();

  for (const type of waveString) {
    const timeoutId = setTimeout(() => {
      spawnEnemyFromType(type);
      enemiesRemaining++; // Increment once the enemy is spawned
    }, delay);

    timeouts.push(timeoutId);
    delay += spawnDelay; // Increment delay for the next spawn
  }
}

function clearTimeouts() {
  timeouts.forEach(clearTimeout);
  timeouts = [];
}

// Function to be called when the game ends or you need to cancel the wave
function cancelWave() {
  clearTimeouts();
}

function onEnemyReachEnd() {
  if(!godMode) {
    go("lose");
  }
}

function onEnemyDefeated() {
  enemiesRemaining--;
  if (enemiesRemaining <= 0 && !isGameOver) {
    countdownToNextWave();
  }
}

function countdownToNextWave() {
  let countdown = 5; // 5 seconds countdown
  clearTimeouts();
  const timeoutId = setTimeout(() => {
    currentWaveIndex++;
    if (currentWaveIndex < waves.length) {
      startWave(waves[currentWaveIndex]);
    } else {
      currentWaveIndex--;
      startWave(waves[currentWaveIndex]);
    }
  }, countdown * 1000);
  timeouts.push(timeoutId);
}

loadSprite("menu", "/sprites/Menu.png")
loadSprite("play", "/sprites/PlayButton.png")
loadSprite("restart", "/sprites/RestartButton.png")
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

function setLevel(level) {
  const screenWidth = width();
  const screenHeight = height();

  // Calculate the required number of tiles to fill the screen
  const tilesRequiredX = Math.max(Math.ceil(screenWidth / 128),level[0].length);
  const tilesRequiredY = Math.ceil(screenHeight / 128);

  // Adjust the level width
  for (let i = 0; i < level.length; i++) {
    const shortfallX = tilesRequiredX - level[i].length;
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

scene("menu", () => {
  setLevel([""])

  add([
    sprite("menu"),
    pos(width() / 2, height() / 3),
    anchor("center"),
    z(9)
  ]);

  const playButton = add([
    sprite("white_button"),
    pos(width() / 2, height() / 2),
    anchor("center"),
    "play",
    area(),
    scale(1.2),
    z(9)
  ]);
  playButton.add([sprite("play"), anchor("center"),scale(0.6)])

  playButton.onClick(() => {
    go("game")
  })

  // Add enemies walking randomly
  loop(2, () => {
    const enemyType = choose(["ghosty", "ghostyf", "ghostyg", "ghostyb"]); // Choose enemy type at random
    const enemy = addEnemy(enemyType, vec2(0, rand(0, height())), () => {}, () => {});
    enemy.onUpdate(() => {
      enemy.move(100, 0); // Set random velocity
    })

  });
});

scene("lose", () => {
  isGameOver = true;
  setLevel([""])
  clearTimeouts();
  add([
    text("Game Over"),
    color(255,0,0),
    pos(width()/2, height()/2),
    anchor("center")
  ])

  const playButton = add([
    sprite("white_button"),
    pos(width() / 2, height() / 2),
    anchor("center"),
    "play",
    area(),
    scale(1.2),
    z(9)
  ]);
  playButton.add([sprite("restart"), anchor("center"),scale(0.6)])

  playButton.onClick(() => {
    go("game")
  })

})

scene("game", () => {
  isGameOver = false;
  currentWaveIndex = 0;
  enemiesRemaining = 0;
  setLevel(levelPath);
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

  onMousePress(() => {
    let found_item = false;

    for (const obj of get("towerSpotButton").reverse()) {
      if (obj.isHovering()) {
        obj.onSelect()
        found_item = true
        break
      }
    }
    if (!found_item) {
      for (const obj of get("towerMenuButton").reverse()) {
        if (obj.isHovering()) {
          obj.onSelect()
          found_item = true
          break
        }
      }
    }

    if(!found_item) {
      hideTowerSelectionMenu();
    }

  })
})

go("menu")
