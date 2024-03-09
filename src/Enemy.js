const enemyTypes = {
  "ghosty": { sprite: "ghosty", health: 20, speed: 100, color: { r: 0, g: 0, b: 255 }},
  "ghostyf": { sprite: "ghosty", health: 5, speed: 300, color: { r: 255, g: 0, b: 0 }},
  "ghostyb": { sprite: "ghosty", health: 500, speed: 50, color: { r: 255, g: 200, b: 0 }},
  };

function generatePath() {
  return [
    vec2(400, height() - 710),
    vec2(400, height() - 400),
    vec2(600, height() - 400),
    vec2(800, height() - 400),
    vec2(800, height() - 710),
    vec2(1200, height() - 710),
    vec2(width(), height() - 710),
  ];
}


export function addEnemy(type, enemyPos) {
  const enemyConfig = enemyTypes[type];
  const path = generatePath(); // Get the path for the enemy
  let currentTargetIndex = 0; // Start with the first waypoint

  const enemy = add([
    sprite(enemyConfig.sprite),
    color(enemyConfig.color.r, enemyConfig.color.g, enemyConfig.color.b),
    pos(enemyPos),
    area(),
    health(enemyConfig.health),
    "enemy",
    state("move", ["idle", "attack", "move"]),
  ]);

  enemy.onUpdate(() => {
    // Check if the enemy has reached its current target waypoint
    if (vec2(enemy.pos).dist(path[currentTargetIndex]) < 5) { // 5 is a small threshold to consider 'reaching' the waypoint
      currentTargetIndex++; // Move to the next waypoint
      if (currentTargetIndex >= path.length) {
        // If there are no more waypoints, you might want to destroy the enemy or trigger another action
        destroy(enemy);
        go("lose");
        return;
      }
    }
    // Calculate direction to the current target waypoint and move the enemy
    const dir = path[currentTargetIndex].sub(enemy.pos).unit();
    enemy.move(dir.scale(enemyConfig.speed));
  });
}

