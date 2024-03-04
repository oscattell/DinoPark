const enemyTypes = {
    "ghosty": { sprite: "ghosty", health: 2, speed: 100 },
    // Define other enemy types here
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
