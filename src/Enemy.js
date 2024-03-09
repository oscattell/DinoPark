const enemyTypes = {
  "ghosty": { sprite: "ghosty", health: 20, speed: 100, color: { r: 0, g: 0, b: 255 }},
  "ghostyf": { sprite: "ghosty", health: 5, speed: 300, color: { r: 255, g: 0, b: 0 }},
  "ghostyb": { sprite: "ghosty", health: 500, speed: 50, color: { r: 255, g: 200, b: 0 }},
  };

export function addEnemy(type, enemyPos, endpoint) {
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
    enemy.move(dir.scale(enemyConfig.speed));
  });

  enemy.onCollide("endpoint", () => {
    debug.log("game over");
    enemy.enterState("idle");
    destroy(enemy);
  });
}
