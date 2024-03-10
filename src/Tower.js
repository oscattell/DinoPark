import { addMoney, subtractMoney, getMoney } from "./state.js";

export const towerTypes = {
  gigagantrum: {
    tower_sprite: "gigagantrum",
    bullet_sprite: "bullet3",
    range: 400,
    cost: 100,
    bullet_speed: 1000,
    bullet_rate: 1,
    bullet_damage:30,
  },
  beanTower: {
    tower_sprite: "bean",
    bullet_sprite: "bullet2",
    range: 500,
    cost: 500,
    bullet_speed: 400,
    bullet_rate:60,
    bullet_damage:1,
  },
  eggTower: {
    tower_sprite: "egg",
    bullet_sprite: "bullet1",
    range: 1000,
    cost: 200,
    bullet_speed: 3000,
    bullet_rate: 0.5,
    bullet_damage:100,
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
          occupied: false
        };

        // Add the new tower spot to the array
        towerSpots.push(spot);

        // Add an invisible button over the spot
        const spotButton = add([
        rect(50, 50),
        pos(worldX, worldY),
        area(),
        anchor("center"),
        color(0, 0, 0, 0), // Make it invisible
        "towerSpotButton",
        {
          menuOpen: false, // Track if the menu is open for this spot
          clickAction: () => {
            if (!spot.occupied && !spotButton.menuOpen) {
              displayTowerSelectionMenuAt(spot.pos, spotButton);
            }
          }
        }
      ]);
      }
    }
  }

  // Make tower spot buttons clickable
  onClick("towerSpotButton", (spotButton) => {
    spotButton.clickAction();
  });
}


/*export function displayTowerSelectionMenu() {
  let xOffset = 100; // Starting position of the first tower icon
  Object.entries(towerTypes).forEach(([key, value]) => {
    const towermenu = add([
      sprite(value.sprite),
      pos(xOffset, height() - 150),
      area(),
      z(9),
      "selectableTower",
      { tower_type: key }
    ]);
    onClick("selectableTower", (selectedTower) => {
      //console.log(`current key = ${selectedTower.tower_type}`)
      setSelectedTowerType(selectedTower.tower_type); // Update the selected tower type
    });
    xOffset += 400; // Move the next icon to the right
  });
}*/

let menuComponents = []; // To keep track of menu components for later removal

export function displayTowerSelectionMenuAt(position, spotButton) {
  hideTowerSelectionMenu(); // Clear any existing menu first

  let yOffset = 30; // Initial vertical offset for the first menu item
  const menuItemHeight = 70; // Height plus some padding

  Object.keys(towerTypes).forEach((towerType, index) => {
    const buttonPos = vec2(position.x, position.y + yOffset);
    addTowerButton(towerType, buttonPos, () => {
      console.log(`Adding tower ${towerType}`)
      if (getMoney() >= towerTypes[towerType].cost) {
        addGigagantrumTower(position, towerType);
        subtractMoney(towerTypes[towerType].cost);
      }
    }, spotButton);

    yOffset += menuItemHeight; // Move down for the next menu item
  });
}

function addTowerButton(towerType, position, onSelect, spotButton) {
  const { tower_sprite, cost } = towerTypes[towerType];

  const btn = add([
    rect(120, 60, { radius: 8 }), // Adjust size as needed
    pos(position),
    area(),
    scale(1),
    outline(4),
    color(255, 255, 255),
    {tower_buttton: spotButton},
  ]);

  // Tower icon
  btn.add([
    sprite(tower_sprite),
    pos(0,15), // Position inside the button
    scale(0.5), // Scale the sprite down to fit the button
  ]);

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

  // Button click action
  btn.onClick(() => {
    if (spotButton.menuOpen) {
      onSelect(); // Call the onSelect callback
      hideTowerSelectionMenu(); // Hide the selection menu after selection
      spotButton.menuOpen = false;
    }
  });

  menuComponents.push(btn); // Keep track of this component for later removal
  spotButton.menuOpen = true;
}

function hideTowerSelectionMenu() {
  // Destroy all menu components
  menuComponents.forEach(destroy);

  // Retrieve all objects tagged as "towerSpotButton" and reset their menuOpen property
  const towerSpotButtons = get("towerSpotButton");
  towerSpotButtons.forEach((btn) => {
    btn.menuOpen = false;
  });
}


// Function to add a tower, including removing the empty tower spot sprite
export function addGigagantrumTower(position, selectedTowerType) {
  const towerConfig = towerTypes[selectedTowerType];
  const tower = add([
    sprite(towerConfig.tower_sprite),
    pos(position),
    //area({ shape: new Polygon([vec2(-towerConfig.range,towerConfig.range), vec2(towerConfig.range,towerConfig.range), vec2(towerConfig.range, -towerConfig.range), vec2(-towerConfig.range, -towerConfig.range)]) }),
    anchor("center"),
    "tower",
    z(9),
    // Add a property to track the last shot time
    { lastShot: time(), bullet_speed: towerConfig.bullet_speed, bullet_rate: towerConfig.bullet_rate, bullet_damage: towerConfig.bullet_damage, bullet_sprite: towerConfig.bullet_sprite}
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
      //console.log("refreshing enemies")
      enemies.forEach(e => {
        let distance = e.pos.dist(tower.pos);
        if (distance <= towerConfig.range && e.pos.x > maxRight) {
          maxRight = e.pos.x;
          targetEnemy = e;
          //console.log(`Best enemy was ${e.pos}`)
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
        shootProjectile(tower.pos, currentTarget.pos, tower.bullet_speed, tower.bullet_damage, tower.bullet_sprite, tower);
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
function shootProjectile(fromPos, toPos, bulletSpeed, bulletDamage, bulletSprite, tower) {
  const direction = toPos.sub(fromPos).unit();
  const angle = (Math.atan2(direction.y, direction.x)* 180 / Math.PI)+90;

  const projectile = add([
    sprite(bulletSprite), // Adjust size as needed
    pos(fromPos),
    color(255, 0, 0),
    area(),
    rotate(angle),
    z(5),
    "projectile", // Tag for collision detection
    move(direction, bulletSpeed), // Adjust speed as needed
  ]);
  tower.angle = angle;
  projectile.onCollide("enemy", (e) => {
    //console.log(`Hitting for ${bulletDamage} on ${e.hp()}`);
    e.hurt(bulletDamage); // Reduce enemy health
    //console.log(`new health for ${e.hp()}`);
    if (e.hp() <= 0) {
      addMoney(50);
      e.destroy(); // Destroy enemy if health is 0 or less
    }
    destroy(projectile);
  });
  // Destroy the projectile after 2 seconds
  wait(2, () => {
    //debug.log("remove bullet");
    destroy(projectile);
  });
}
