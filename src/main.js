import {addGigagantrumTower, displayTowerSelectionMenu, getTowerCost, getSelectedTower } from "./Tower.js";
import {addEnemy, setPathFromLevel} from "./Enemy.js";
import { addMoney, subtractMoney, getMoney, diplayMoney } from "./state.js";

kaboom()

// Define your tower spots
let towerSpots = [];

function generateTowerSpotsFromLevel(levelLayout, tileWidth, tileHeight, startPos) {
  towerSpots = []; // Initialize an empty array for tower spots

  // Iterate through the level layout
  for (let y = 0; y < levelLayout.length; y++) {
    for (let x = 0; x < levelLayout[y].length; x++) {
      if (levelLayout[y][x] === "x") { // Check for 'x' symbol
        // Calculate the world position of the tower spot
        const worldX = startPos.x + x * tileWidth + tileWidth / 2; // Center of tile
        const worldY = startPos.y + y * tileHeight + tileHeight / 2; // Center of tile

        // Add the new tower spot to the array
        towerSpots.push({
          pos: vec2(worldX, worldY),
          occupied: false
        });
      }
    }
  }
}

// Load the sprite for empty tower spots
loadSprite("emptyTower", "/sprites/heart.png")
loadSprite("bean", "/sprites/bean.png")
loadSprite("ghosty", "/sprites/ghosty.png")
loadSprite("gigagantrum", "/sprites/gigagantrum.png")
loadSprite("egg", "/sprites/egg.png")
loadSprite("bullet", "/sprites/bulletRed1_outline.png")

loadSpriteAtlas("/sprites/0x72_DungeonTilesetII_v1.6.png", "/sprites/0x72_DungeonTilesetII_v1.6.json")
loadSpriteAtlas("/sprites/Paths.png", "/sprites/Paths.json")

// Place an empty tower sprite at each spot
towerSpots.forEach(spot => {
  add([
    sprite("emptyTower"),
    pos(spot.pos),
    "emptyTowerSpot",
  ]);
});

// Listen for mouse presses to place towers
onMousePress(() => {
  const mousePosition = mousePos();
  const nearestSpot = towerSpots.find(spot => spot.pos.dist(mousePosition) < 50 && !spot.occupied);

  if (nearestSpot && getMoney() >= getTowerCost(getSelectedTower())) {
    addGigagantrumTower(nearestSpot.pos);
    nearestSpot.occupied = true; // Mark the spot as occupied

    subtractMoney(getTowerCost(getSelectedTower()));

  }
});

scene("lose", () => {
  add([
    text("Game Over"),
    color(255,0,0),
    pos(width()/2, height()/2),
    anchor("center")
  ])
})

//tower placement menu + tower
add([
  rect(2435, 150),
  pos(63, 1120),
  outline(5),
  area(),
  body(),
])

// Add player game object
const endpoint = add([
  sprite("bean"),
  pos(2509, height() - 650),
  area(),
  anchor("center"),
  "endpoint"
])

displayTowerSelectionMenu()


diplayMoney(1000)

let levelPath = [
  	"          ",
    "  ┏━━┓  x ",
  	"S━┛  ┃ xx ",
  	"  x  ┃  x ",
    "     ┗━━E ",
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


// Use loop to add an enemy every 5 seconds
/*loop(5, () => {
  addEnemy("ghosty", vec2(0, height() - 680), endpoint);
  addEnemy("ghostyf", vec2(0, height() - 680), endpoint);
  addEnemy("ghostyg", vec2(0, height() - 680), endpoint);
});
loop(10, () => {
  addEnemy("ghostyb", vec2(0, height() - 680), endpoint);
});*/
addEnemy("ghostyb", vec2(0, height() - 680), endpoint);
debug.inspect = true

