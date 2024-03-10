import {displayTowerSelectionMenuAt, generateTowerSpotsFromLevel} from "./Tower.js";
import {addEnemy, setPathFromLevel} from "./Enemy.js";
import { addMoney, subtractMoney, getMoney, diplayMoney } from "./state.js";

kaboom()

const waves = [
  "1111114",
  "22222222223",
];

let currentWaveIndex = 0;
let enemiesRemaining = 0;

function spawnEnemyFromType(type) {
  switch(type) {
    case '1':
      addEnemy("ghosty", vec2(0, height() - 680), onEnemyDefeated);
      break;
    case '2':
      addEnemy("ghostyf", vec2(0, height() - 680), onEnemyDefeated);
      break;
    case '3':
      addEnemy("ghostyg", vec2(0, height() - 680), onEnemyDefeated);
      break;
    case '4':
      addEnemy("ghostyb", vec2(0, height() - 680), onEnemyDefeated);
      break;
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
      console.log("All waves completed!");
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

loadSpriteAtlas("/sprites/0x72_DungeonTilesetII_v1.6.png", "/sprites/0x72_DungeonTilesetII_v1.6.json")
loadSpriteAtlas("/sprites/Paths.png", "/sprites/Paths.json")

// Listen for mouse presses to place towers
/*onMousePress(() => {
  const nearestSpot = towerSpots.find(spot => spot.pos.dist(mousePos()) < 50 && !spot.occupied);

  if (nearestSpot) {
    displayTowerSelectionMenuAt(nearestSpot.pos);
  }
});*/

scene("lose", () => {
  add([
    text("Game Over"),
    color(255,0,0),
    pos(width()/2, height()/2),
    anchor("center")
  ])
})

let levelPath = [
  	"  x       ",
    "  ┏━━┓  x ",
  	"S━┛  ┃ xx ",
  	"  x  ┃  x ",
    "    x┗━━E ",
]
generateTowerSpotsFromLevel(levelPath,128,128,vec2(0, 0));
setPathFromLevel(levelPath,128,128,vec2(0, 0));


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

diplayMoney(1000)

// Initially start the first wave
if (waves.length > 0) {
  startWave(waves[currentWaveIndex]);
}

debug.inspect = true

