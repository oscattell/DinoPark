import {generateTowerSpotsFromLevel, hideTowerSelectionMenu} from "./Tower.js";
import {addEnemy, setPathFromLevel, generateStartPosFromLevel} from "./Enemy.js";
import { addMoney, subtractMoney, getMoney, diplayMoney } from "./state.js";

kaboom()

const waves = [
  /*"1111114",
  "22222222223",*/
  "2"
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
      pos((levelPath[0].length*128) - 80, -20)
    ]);
  } else {
    add([
      sprite("lives_1"),
      "lives",
      pos((levelPath[0].length*128) - 80, -20)
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
loadSprite("emptyTower", "/sprites/heart.png")
loadSprite("bean", "/sprites/towerDefense_tile249.png")
loadSprite("ghosty", "/sprites/ghosty.png")
loadSprite("gigagantrum", "/sprites/towerDefense_tile204.png")
loadSprite("egg", "/sprites/towerDefense_tile250.png")
loadSprite("bullet1", "/sprites/bulletRed1_outline.png")
loadSprite("bullet2", "/sprites/bulletGreen2.png")
loadSprite("bullet3", "/sprites/towerDefense_tile251.png")
loadSprite("dollar", "/sprites/dollarsymbol.png")

loadSpriteAtlas("/sprites/BulletTileset.png", "/sprites/BulletTileset.json")
loadSpriteAtlas("/sprites/TowerTileset.png", "/sprites/TowerTileset.json")
loadSpriteAtlas("/sprites/IconsTileset.png", "/sprites/IconsTileset.json")
loadSpriteAtlas("/sprites/0x72_DungeonTilesetII_v1.6.png", "/sprites/0x72_DungeonTilesetII_v1.6.json")
loadSpriteAtlas("/sprites/Paths.png", "/sprites/Paths.json")
loadSpriteAtlas("/sprites/Effect_Explosion_1.png", "/sprites/Effect_Explosion_1.json")

const level = addLevel(levelPath, {
	// The size of each grid
	tileWidth: 128,
	tileHeight: 128,
	// The position of the top left block
	pos: vec2(0, 0),
	// Define what each symbol means (in components)
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
diplayMoney(1000);
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

