import {addMoney, getMoney, subtractMoney} from "./state.js";

export const towerTypes = {
  gigagantrum: {
    levels: [{tower_sprite: "missile_tower_1",
      bullet_sprite: "missile_1",
      range: 400,
      cost: 100,
      bullet_speed: 400,
      bullet_rate: 1,
      bullet_damage:30,
      tracking: true,
      explosive: true},
    {tower_sprite: "missile_tower_2",
      bullet_sprite: "missile_1",
      range: 400,
      cost: 200,
      bullet_speed: 200,
      bullet_rate: 1,
      bullet_damage:60,
      tracking: true,
      explosive: true},
    {tower_sprite: "missile_tower_3",
      bullet_sprite: "missile_2",
      range: 400,
      cost: 200,
      bullet_speed: 200,
      bullet_rate: 1,
      bullet_damage:60,
      tracking: true,
      explosive: true}]
  },
  beanTower: {
    levels: [{
    tower_sprite: "machinegun_tower_1",
    bullet_sprite: "bullet2",
    range: 500,
    cost: 500,
    bullet_speed: 400,
    bullet_rate:6,
    bullet_damage:1,
    tracking: false,
    explosive: false}]
  },
  eggTower: {
    levels: [{
    tower_sprite: "gun_tower_1",
    bullet_sprite: "bullet1",
    range: 1000,
    cost: 200,
    bullet_speed: 3000,
    bullet_rate: 0.5,
    bullet_damage:100,
    tracking: false,
    explosive: false}]
  }
};
// Define your tower spots
let towerSpots = [];

export function generateTowerSpotsFromLevel(levelLayout, tileWidth, tileHeight, startPos) {
  towerSpots = []; // Initialize an empty array for tower spots

  // Iterate through the level layout
  for (let y = 0; y < levelLayout.length; y++) {
    for (let x = 0; x < levelLayout[y].length; x++) {
      if (levelLayout[y][x] === "x") { // Check for 'x' symbol
        // Calculate the world position of the tower spot
        const worldX = startPos.x + x * tileWidth + tileWidth / 2; // Center of tile
        const worldY = startPos.y + y * tileHeight + tileHeight / 2; // Center of tile

        const spot = {
          pos: vec2(worldX, worldY),
          occupied: false,
          tower: null, // To keep track of the tower type and level if a tower is placed
          level: 0 // Keeping track of the tower's current level
        };


        // Add the new tower spot to the array
        towerSpots.push(spot);

        // Add an invisible button over the spot
        const spotButton = add([
        rect(50, 50),
        pos(worldX, worldY),
        area(),
        anchor("center"),
        color(0, 0, 0),
        opacity(0),
        "towerSpotButton",
        {
          menuOpen: false, // Track if the menu is open for this spot
          onSelect: () => {
            if (!spotButton.menuOpen) {
              displayTowerSelectionMenuAt(spot, spotButton);
            } else {
              hideTowerSelectionMenu();
            }
          }
        }
      ]);
      }
    }
  }

  // Make tower spot buttons clickable
  /*onClick("towerSpotButton", (spotButton) => {
    spotButton.clickAction();
  });*/
}

export function displayTowerSelectionMenuAt(spot, spotButton) {
  hideTowerSelectionMenu(); // Clear any existing menu first
  spotButton.menuOpen = true;

  let yOffset = 30; // Initial vertical offset for the first menu item
  const menuItemHeight = 70; // Height plus some padding

  if (!spot.occupied) {
    Object.keys(towerTypes).forEach((towerType, index) => {
      const buttonPos = vec2(spot.pos.x, spot.pos.y + yOffset);
      const { tower_sprite, cost } = towerTypes[towerType].levels[0];
      addTowerButton(tower_sprite, cost, buttonPos, spotButton, () => {
        console.log(`Adding tower ${towerType}`)
        if (getMoney() >= towerTypes[towerType].levels[0].cost) {
          spot.occupied = true;
          spot.level = 0;
          spot.tower = addTower(spot.pos, towerType, 0);
          subtractMoney(towerTypes[towerType].levels[0].cost);
        }
      });

      yOffset += menuItemHeight; // Move down for the next menu item
    });
  } else {
    // This block handles the case where the tower spot is occupied (i.e., there's already a tower)
    const buttonPos = vec2(spot.pos.x, spot.pos.y + yOffset);
    const currentTowerType = spot.tower.tower_type;

    // Check if the tower can be upgraded
    if (spot.level < towerTypes[currentTowerType].levels.length - 1) {
      // Tower upgrade button
      addTowerButton("upgrade_icon", towerTypes[currentTowerType].levels[spot.level + 1].cost, buttonPos, spotButton, () => {
          console.log(`Upgrade tower`);
          if (getMoney() >= towerTypes[currentTowerType].levels[spot.level + 1].cost) {
            spot.level += 1;
            spot.tower.destroy();
            spot.tower = addTower(spot.pos, currentTowerType, spot.level);
            subtractMoney(towerTypes[currentTowerType].levels[spot.level].cost);
          }
      },{r: 0, g: 0, b: 0});

      yOffset += menuItemHeight; // Adjust position for the next button
    }

    // Sell tower button - this should be available whether the tower is at max level or not
    const sellButtonPos = vec2(spot.pos.x, spot.pos.y + yOffset);
    const refundAmount = towerTypes[currentTowerType].levels[spot.level].cost * 0.75; // Example refund calculation

    addTowerButton("sell_icon", -refundAmount, sellButtonPos, spotButton, () => {
        console.log(`Sold tower`);
        addMoney(refundAmount); // Refund some money for selling the tower
        spot.tower.destroy(); // Remove the tower from the game
        spot.occupied = false;
        spot.level = 0;
        spot.tower = null; // Clear the tower data
    },{r: 0, g: 0, b: 0});
  }
}

function addTowerButton(icon, cost, position, spotButton, onSelect, spriteColor) {
  //const { tower_sprite, cost } = towerTypes[towerType];

  const btn = add([
    rect(120, 60, { radius: 8 }), // Adjust size as needed
    pos(position),
    area(),
    scale(1),
    outline(4),
    color(255, 255, 255),
    "towerMenuButton",
    {tower_buttton: spotButton, onSelect: () => {
        hideTowerSelectionMenu();
        onSelect();
      }},
  ]);

  // Icon
  if (spriteColor) {
    btn.add([
      sprite(icon),
      pos(0, 15), // Position inside the button
      scale(0.5), // Scale the sprite down to fit the button
      color(spriteColor.r, spriteColor.g, spriteColor.b)
    ]);
  } else {
    btn.add([
      sprite(icon),
      pos(0, 15), // Position inside the button
      scale(0.5), // Scale the sprite down to fit the button
    ]);
  }

  // Cost text
  btn.add([
    text(cost.toString(), {size: 24,}),
    pos(40, 20), // Adjust text position inside the button
    color(0, 0, 0),
  ]);

  // Button hover effect
  btn.onHoverUpdate(() => {
    btn.scale = vec2(1.1); // Enlarge button on hover
    setCursor("pointer");
  });

  btn.onHoverEnd(() => {
    btn.scale = vec2(1); // Reset button size
    btn.color = rgb(255, 255, 255); // Reset color
  });
}

export function hideTowerSelectionMenu() {
  // Destroy all menu components
  destroyAll("towerMenuButton");

  // Retrieve all objects tagged as "towerSpotButton" and reset their menuOpen property
  const towerSpotButtons = get("towerSpotButton");
  towerSpotButtons.forEach((btn) => {
    btn.menuOpen = false;
  });
}


// Function to add a tower, including removing the empty tower spot sprite
export function addTower(position, selectedTowerType, level = 0) {
  const towerConfig = towerTypes[selectedTowerType];
  const tower = add([
    sprite(towerConfig.levels[level].tower_sprite),
    pos(position),
    anchor("center"),
    "tower",
    z(9),
    { tower_type: selectedTowerType,
      lastShot: time(),
      bullet_speed: towerConfig.levels[level].bullet_speed,
      bullet_rate: towerConfig.levels[level].bullet_rate,
      bullet_damage: towerConfig.levels[level].bullet_damage,
      bullet_sprite: towerConfig.levels[level].bullet_sprite,
      tracking: towerConfig.levels[level].tracking,
      is_explosive: towerConfig.levels[level].tracking}
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
      enemies.forEach(e => {
        let distance = e.pos.dist(tower.pos);
        if (distance <= towerConfig.levels[level].range && e.pos.x > maxRight) {
          maxRight = e.pos.x;
          targetEnemy = e;
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

      if (distanceToCurrentTarget <= towerConfig.levels[level].range && currentTarget.hp() > 0) {
        shootProjectile(tower.pos, currentTarget.pos, tower.bullet_speed, tower.bullet_damage, tower.bullet_sprite, tower, tower.tracking, currentTarget);
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

  return tower
}

const MAX_ANGLE_CHANGE_PER_UPDATE = .5; // Max angle change in degrees per update

// Projectile function
function updateProjectileDirectionAndAngle(projectile, target) {
    // Calculate the new direction towards the target
    const newDirection = target.pos.sub(projectile.pos).unit();
    // Calculate the desired new angle based on the new direction
    let newAngle = Math.atan2(newDirection.y, newDirection.x) * 180 / Math.PI + 90;
    // Normalize the new angle to be within 0-360 degrees
    newAngle = (newAngle + 360) % 360;
    // Calculate the current angle of the projectile, adjusted to be within 0-360 degrees
    let currentAngle = (projectile.angle + 360) % 360;
    // Calculate the shortest angle difference including direction (clockwise or counterclockwise)
    let angleDiff = ((newAngle - currentAngle + 540) % 360) - 180;
    // Limit the angle change to the maximum allowed, preserving direction
    angleDiff = Math.min(Math.max(angleDiff, -MAX_ANGLE_CHANGE_PER_UPDATE), MAX_ANGLE_CHANGE_PER_UPDATE);
    // Apply the limited angle difference to the current angle to get the new adjusted angle
    projectile.angle = currentAngle + angleDiff;
    // Convert the new adjusted angle back to radians for movement calculation
    const adjustedAngleRad = (projectile.angle - 90) * Math.PI / 180;
    // Update the projectile's movement direction based on the adjusted angle
    projectile.move(vec2(Math.cos(adjustedAngleRad), Math.sin(adjustedAngleRad)).scale(projectile.speed));
    // Update the lastDirection based on the new adjusted angle, for consistency
    projectile.lastDirection = vec2(Math.cos(adjustedAngleRad), Math.sin(adjustedAngleRad));
    projectile.lastAngle = projectile.angle; // Store the current angle for the next update cycle
}

function calculateLeadPosition(fromPos, toPos, targetSpeed, bulletSpeed) {
  // Direct distance between the shooter and the target
  let distance = fromPos.dist(toPos);

  // Time it takes for the projectile to reach the target
  let timeToHit = distance / bulletSpeed;

  // Placeholder: Calculate or get the target's velocity vector (speed and direction)
  // This could be derived from movement over time or given data.
  let targetVelocity = new Vec2(targetSpeed, targetSpeed); // Example; adjust as needed

  // Adjust offset based on angle to target
  // Calculate the angle (in radians) between the turret and the target
  let angleToTarget = Math.atan2(toPos.y - fromPos.y, toPos.x - fromPos.x);

  // Scale the offset by the cosine of the angle to reduce it for shallow angles
  let angleAdjustmentFactor = 1-(Math.abs(Math.cos(angleToTarget)));
  let targetMovement = targetVelocity.scale(angleAdjustmentFactor*timeToHit);

  // Calculate the lead position
  let leadPosition = toPos.add(targetMovement);

  return leadPosition;
}


function shootProjectile(fromPos, toPos, bulletSpeed, bulletDamage, bulletSprite, tower, tracking = false, target = null) {
  let leadPosition = calculateLeadPosition(fromPos, toPos, target.speed, bulletSpeed);

  // Then calculate the direction to this lead position
  let direction = leadPosition.sub(fromPos).unit();

  let angle = (Math.atan2(direction.y, direction.x) * 180 / Math.PI) + 90;

  let projectile = null;

  if (tracking && target) {
    projectile = add([
      sprite(bulletSprite),
      pos(fromPos),
      color(255, 0, 0),
      area(),
      rotate(angle),
      anchor("center"),
      offscreen({ destroy: true }),
      z(5),
      "projectile",
      { speed: bulletSpeed, tracking: tracking, lastDirection: direction, lastAngle: angle, is_explosive: tower.is_explosive}
    ]);
    projectile.onUpdate(() => {
      if (target.exists() && target.hp() > 0) {
        updateProjectileDirectionAndAngle(projectile,target);
      } else {
        let randomWait = 0.5 + Math.random() * 3;

        wait(randomWait, () => {
          destroy(projectile);
        });
        projectile.move(projectile.lastDirection.scale(projectile.speed));
      }
    });
  } else {
    projectile = add([
      sprite(bulletSprite),
      pos(fromPos),
      color(255, 0, 0),
      area(),
      rotate(angle),
      offscreen({ destroy: true }),
      move(direction, bulletSpeed),
      z(5),
      "projectile",
      { speed: bulletSpeed, is_explosive: tower.is_explosive}
    ]);
    //projectile.move(direction.scale(bulletSpeed));
  }

  // This sets the tower's angle, might not be needed unless you're visually rotating towers
  tower.angle = angle;

  projectile.onDestroy(() => {
    if(projectile.is_explosive) {
      const bomb = add([
        sprite("explosion"),
        pos(projectile.pos),
        z(20),
        anchor("center"),
        lifespan(2)
      ]);
      bomb.play("boom");
    }
  })

  projectile.onCollide("enemy", (e) => {
    e.hurt(bulletDamage);
    if (e.hp() <= 0) {
      addMoney(e.death_money);
      e.destroy();
    }

    destroy(projectile); // Destroy the projectile upon collision
    /*if(projectile.is_explosive) {
      const bomb = add([
        sprite("explosion"),
        pos(projectile.pos),
        z(20),
        anchor("center")
      ]);
      bomb.play("boom");
    }*/
  });
}

