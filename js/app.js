kaboom()

// Define your tower spots
const towerSpots = [
  { pos: vec2(100, 100), occupied: false },
  { pos: vec2(500, 500), occupied: false },
  // Add more spots as needed
];

const ENEMY_SPEED = 100
const BULLET_SPEED = 800

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

// Function to add a tower, including removing the empty tower spot sprite
function addGigagantrumTower(position) {
  const tower = add([
    sprite("gigagantrum"),
    pos(position),
    area({ scale: 2 }),
    "tower",
    // Add a property to track the last shot time
    { lastShot: time() }
  ]);

  tower.onCollideUpdate("enemy", (e) => {
    // Check if 1 second has passed since the last shot
    if (time() - tower.lastShot > 1) { // Adjust 1 to your desired cooldown time in seconds
      shootProjectile(tower.pos, e.pos);
      //debug.log("shoot");
      tower.lastShot = time(); // Update the last shot time
    }
  });
  // Find and remove the empty tower spot sprite at this position
  const emptySpotSprite = get("emptyTowerSpot").find(s => s.pos.x === position.x && s.pos.y === position.y);
  if (emptySpotSprite) {
    destroy(emptySpotSprite);
  }
}



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
  pos(63, height() - 200),
  outline(5),
  area(),
  body(),
])
loadSprite("tower", "/sprites/gigagantrum.png")
add([
  sprite("tower"),
  pos(1100,1120)
])


//pathfinding




// Add player game object
const endpoint = add([
  sprite("bean"),
  pos(2509, height() - 650),
  area(),
  anchor("center"),
  "endpoint"
])

function addEnemy(type, enemyPos, speed) {
  const enemyTypes = {
    "ghosty": { sprite: "ghosty", health: 2 },
    // Define other enemy types here
  };
  const enemyConfig = enemyTypes[type];
  debug.log(`Add enemy with ${enemyConfig.health} health`);
  const enemy = add([
    sprite(enemyConfig.sprite),
    pos(enemyPos),
    area(),
    health(enemyConfig.health),
    "enemy",
    state("move", ["idle", "attack", "move"]),
  ]);

  enemy.onStateUpdate("move", () => {
    if (!endpoint.exists()) return;
    const dir = endpoint.pos.sub(enemy.pos).unit();
    enemy.move(dir.scale(speed));
  });

  enemy.onCollide("endpoint", () => {
    debug.log("game over");
    enemy.enterState("idle");
    destroy(enemy);
  });
}

// Use loop to add an enemy every 5 seconds
loop(5, () => {
  addEnemy("ghosty", vec2(0, height() - 680), ENEMY_SPEED);
});


debug.inspect = true


