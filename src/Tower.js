export const towerTypes = {
  gigagantrum: {
    sprite: "gigagantrum",
    cost: 100,
    bullet_speed: 1000,
    bullet_rate: 1,
    bullet_damage:30,
  },
  beanTower: {
    sprite: "bean",
    range: 500,
    cost: 500,
    bullet_speed: 400,
    bullet_rate:60,
    bullet_damage:1,
  },
  eggTower: {
    sprite: "egg",
    range: 1000,
    cost: 200,
    bullet_speed: 3000,
    bullet_rate: 0.5,
    bullet_damage:100,
  }
};

let selectedTowerType = "gigagantrum"; // Default selected tower

// Function to update selectedTowerType
function setSelectedTowerType(newType) {
  selectedTowerType = newType;
  console.log(`choosing ${newType}`)
}

export function displayTowerSelectionMenu() {
  let xOffset = 100; // Starting position of the first tower icon
  Object.entries(towerTypes).forEach(([key, value]) => {
    const towermenu = add([
      sprite(value.sprite),
      pos(xOffset, height() - 150),
      area(),
      "selectableTower",
      { tower_type: key }
    ]);
    onClick("selectableTower", (selectedTower) => {
      console.log(`current key = ${selectedTower.tower_type}`)
      setSelectedTowerType(selectedTower.tower_type); // Update the selected tower type
    });
    xOffset += 400; // Move the next icon to the right
  });
}

// Function to add a tower, including removing the empty tower spot sprite
export function addGigagantrumTower(position, type = "gigagantrum") {
  const towerConfig = towerTypes[selectedTowerType];
  const tower = add([
    sprite(towerConfig.sprite),
    pos(position),
    area({ shape: new Polygon([vec2(-200,300), vec2(300,300), vec2(300, -200), vec2(-200, -200)]) }),
    "tower",
    // Add a property to track the last shot time
    { lastShot: time(), bullet_speed: towerConfig.bullet_speed, bullet_rate: towerConfig.bullet_rate }
  ]);

  let lastTargetUpdate = 0;
  const targetUpdateInterval = 1; // Update target every 2 seconds, for example
  let currentTarget = null; // Holds the current target enemy

  tower.onUpdate(() => {
    let currentTime = time();

    // Update the target only at the specified interval
    if (currentTime - lastTargetUpdate > targetUpdateInterval) {
      let targetEnemy = null;
      let maxRight = -Infinity;
      const enemies = get("enemy").filter(e => e.hp() > 0);
      console.log("refreshing enemies")
      enemies.forEach(e => {
        let distance = e.pos.dist(tower.pos);
        if (distance <= towerConfig.range && e.pos.x > maxRight) {
          maxRight = e.pos.x;
          targetEnemy = e;
          console.log(`Best enemy was ${e.pos}`)
        }
      });

      if (targetEnemy) {
        currentTarget = targetEnemy; // Update current target
        lastTargetUpdate = currentTime; // Update the time of the last target update
      } else {
        currentTarget = null;
      }
    }

    if (currentTarget && currentTime - tower.lastShot > (1 / tower.bullet_rate)) {
      let distanceToCurrentTarget = currentTarget.pos.dist(tower.pos);

      if (distanceToCurrentTarget <= towerConfig.range && currentTarget.hp() > 0) {
        shootProjectile(tower.pos, currentTarget.pos, tower.bullet_speed, tower.bullet_damage);
        tower.lastShot = currentTime; // Update the last shot time
      } else {
        currentTarget = null;
      }
    }
  });

  // Find and remove the empty tower spot sprite at this position
  const emptySpotSprite = get("emptyTowerSpot").find(s => s.pos.x === position.x && s.pos.y === position.y);
  if (emptySpotSprite) {
    destroy(emptySpotSprite);
  }
}

// Projectile function
function shootProjectile(fromPos, toPos, bulletSpeed, bulletDamage) {
  const direction = toPos.sub(fromPos).unit();
  const projectile = add([
    rect(20, 5), // Adjust size as needed
    pos(fromPos),
    color(255, 0, 0),
    area(),
    "projectile", // Tag for collision detection
    move(direction, bulletSpeed), // Adjust speed as needed
  ]);
  projectile.onCollide("enemy", (e) => {
    debug.log("bang");
    e.hurt(1); // Reduce enemy health by 1
    if (e.hp() <= 0) {
      destroy(e); // Destroy enemy if health is 0 or less
    }
    destroy(projectile);
  });
  // Destroy the projectile after 2 seconds
  wait(1, () => {
    debug.log("remove bullet");
    destroy(projectile);
  });
}
