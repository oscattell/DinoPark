import {  addGigagantrumTower, displayTowerSelectionMenu } from "./Tower.js";
import {addEnemy} from "./Enemy.js";

kaboom()

// Define your tower spots
const towerSpots = [
  { pos: vec2(1750, height()/2 - 200), occupied: false },
  { pos: vec2(1250, height()/2 - 200), occupied: false },
  { pos: vec2(250, height()/2 - 200), occupied: false },
  { pos: vec2(750, height()/2 - 200), occupied: false },
];

// Load the sprite for empty tower spots
loadSprite("emptyTower", "/sprites/heart.png")
loadSprite("bean", "/sprites/bean.png")
loadSprite("ghosty", "/sprites/ghosty.png")
loadSprite("gigagantrum", "/sprites/gigagantrum.png")

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

  if (nearestSpot) {
    addGigagantrumTower(nearestSpot.pos);
    nearestSpot.occupied = true; // Mark the spot as occupied
  }
});

//path
add([
  rect(width(), 100),
  pos(0, height() - 700),
  outline(4),
  area(),
  body(),
  color(0, 100, 0),
])

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

// Use loop to add an enemy every 5 seconds
loop(5, () => {
  addEnemy("ghosty", vec2(0, height() - 680), endpoint);
});


debug.inspect = true

