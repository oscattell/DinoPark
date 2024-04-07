import kaboom from "kaboom"
import {generateTowerSpotsFromLevel, hideTowerSelectionMenu} from "./Tower.js";
import {addEnemy, setPathFromLevel, generateStartPosFromLevel} from "./Enemy.js";
import {displayMoney } from "./state.js";

kaboom()

const waves = [
  "11100111",
  "1120113",
  "323544",
  "454054022",
  "64321",
  "6540346",
  "66566",
];

const levelPath = [
  	"    x        ",
    "  ┏━━┓      ",
  	"S━┛x ┃ x   ",
  	"  x  ┃    x ",
    "     ┗━━━━━E ",
]

let isGameOver = false;
let currentWaveIndex = 0;
let enemiesRemaining = 0;
let start = vec2(0,0);
let lives = 10;
let godMode = false;
let timeouts = [];

function displayLives() {
  destroyAll("lives");
  let spriteName = godMode ? "lives_infinite" : `lives_${lives}`;
  add([
    sprite(spriteName),
    "lives",
    z(9),
    scale(2),
    pos(width() - 160, -30) // Adjusted Y position for visibility
  ]);
}

function spawnEnemyFromType(type) {
  if (type === "0") return;
  enemiesRemaining++; // Increment once the enemy is spawned
  if(!isGameOver) {
    switch (type) {
      case '1':
        addEnemy("mid.chomping.guy", start, onEnemyDefeated, onEnemyReachEnd);
        break;
      case '2':
        addEnemy("fast.small.boy", start, onEnemyDefeated, onEnemyReachEnd);
        break;
      case '6':
        addEnemy("big.fat.boy", start, onEnemyDefeated, onEnemyReachEnd);
        break;
      case '4':
        addEnemy("rib.guy", start, onEnemyDefeated, onEnemyReachEnd);
        break;
      case '5':
        addEnemy("slug.guy", start, onEnemyDefeated, onEnemyReachEnd);
        break;
      case '3':
        addEnemy("robe.guy", start, onEnemyDefeated, onEnemyReachEnd);
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
    }, delay);

    timeouts.push(timeoutId);
    delay += spawnDelay; // Increment delay for the next spawn
  }
}

function clearTimeouts() {
  timeouts.forEach(clearTimeout);
  timeouts = [];
}

function cancelWave() {
  clearTimeouts();
}

function onEnemyReachEnd() {
  if(!godMode) {
    lives -= 1;
    displayLives();

    if (lives <= 0) {
      isGameOver = true;
      go("lose");
    }
  }
}

function onEnemyDefeated() {
  enemiesRemaining--;
  if (enemiesRemaining <= 0 && !isGameOver) {
    countdownToNextWave();
  }
}

function countdownToNextWave() {
  let countdown = 5; // Countdown duration in seconds
  let countdownText = add([
    text(countdown.toString()), // Initial countdown number as text
    pos(width() / 2, height() / 2), // Position at the center of the screen
    anchor("center"), // Origin at the center for scaling and rotation
    {
      update() {
        this.scale = wave(2, 2.5, time() * 3);
        this.angle = wave(-9, 9, time() * 3);
      }
    }
  ]);

  const intervalId = setInterval(() => {
    countdown -= 1;
    if (countdown > 0) {
      countdownText.text = countdown.toString(); // Update the countdown text
    } else {
      clearInterval(intervalId); // Clear the interval once countdown is done
      destroy(countdownText); // Remove the countdown text from the screen
      // Start the next wave
      currentWaveIndex++;
      if (currentWaveIndex < waves.length) {
        startWave(waves[currentWaveIndex]);
      } else {
        // If there are no more waves, repeat the last wave or handle game end
        currentWaveIndex--;
        startWave(waves[currentWaveIndex]);
      }
    }
  }, 1000); // Update the countdown every second
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
    const enemyType = choose(["mid.chomping.guy", "fast.small.boy", "big.fat.boy", "rib.guy", "slug.guy"]); // Choose enemy type at random
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
  lives = 10;
  currentWaveIndex = 0;
  enemiesRemaining = 0;
  setLevel(levelPath);
  setPathFromLevel(levelPath,128,128,vec2(0, 0));
  start = generateStartPosFromLevel(levelPath,128,128);
  generateTowerSpotsFromLevel(levelPath,128,128,vec2(0, 0));
  displayMoney(500);
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
