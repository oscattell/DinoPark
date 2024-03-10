import {generateTowerSpotsFromLevel} from "./Tower.js";

const enemyTypes = {
  "ghosty": { sprite: "chort", health: 20, speed: 100, death_money: 100, color: { r: 0, g: 0, b: 255 }},
  "ghostyf": { sprite: "imp", health: 5, speed: 300, death_money: 100, color: { r: 255, g: 0, b: 0 }},
  "ghostyb": { sprite: "big_demon", health: 500, speed: 50, death_money: 1000, color: { r: 255, g: 200, b: 0 }},
  "ghostyg": { sprite: "wogol", health: 1, speed: 65, death_money: 100, color: { r: 255, g: 200, b: 0 }},
  };

let path =  [];

export function generateStartPosFromLevel(levelLayout, tileWidth, tileHeight) {
  const start = findStart(levelLayout);
  let startPos = vec2((start.x * tileWidth), (start.y * tileHeight)+(tileHeight/2))
  console.log(`Start found at ${startPos}`)
  return startPos
}

function findStart(levelLayout) {
  for (let y = 0; y < levelLayout.length; y++) {
    for (let x = 0; x < levelLayout[y].length; x++) {
      if (levelLayout[y][x] === "S") {
        return { x, y };
      }
    }
  }
  return null; // Start not found
}

export function setPathFromLevel(levelLayout, tileWidth, tileHeight, startPos) {
  const start = findStart(levelLayout);
  if (!start) {
    console.error("Start symbol (S) not found in level layout.");
    return [];
  }

  // Initialize a structure to keep track of visited positions
  let visited = new Set();
  path = [];
  let currentPos = start;
  let endFound = false;

  while (!endFound) {
    const currentTilePosKey = `${currentPos.x},${currentPos.y}`;

    // Break if we've already visited this tile to prevent loops
    if (visited.has(currentTilePosKey)) {
      console.error("Loop detected in path.");
      break;
    }

    // Mark the current tile as visited
    visited.add(currentTilePosKey);

    const currentTile = levelLayout[currentPos.y][currentPos.x];


    // Convert current position to game world coordinates and add to path
    path.push(vec2(startPos.x + (currentPos.x * tileWidth)+(tileWidth/2), startPos.y + (currentPos.y * tileHeight)+(tileHeight/2)));

    if (currentTile === "E") {
      endFound = true;
      break;
    }

    const directions = [
      { x: 1, y: 0 }, // Right
      { x: -1, y: 0 }, // Left
      { x: 0, y: 1 }, // Down
      { x: 0, y: -1 }, // Up
    ];

    let moved = false;
    for (let dir of directions) {
      const nextX = currentPos.x + dir.x;
      const nextY = currentPos.y + dir.y;
      const nextTilePosKey = `${nextX},${nextY}`;

      // Ensure next tile is within bounds and hasn't been visited
      if (nextY >= 0 && nextY < levelLayout.length && nextX >= 0 && nextX < levelLayout[nextY].length && !visited.has(nextTilePosKey)) {
        const nextTile = levelLayout[nextY][nextX];
        if ("S┃━┗┛┏┓E".includes(nextTile)) {
          currentPos = { x: nextX, y: nextY };
          moved = true;
          break;
        }
      }
    }

    if (!moved) {
      console.error("Path is broken or end symbol (E) not found.");
      break;
    }
  }
}


export function addEnemy(type, enemyPos, onDefeatedCallback) {
  const enemyConfig = enemyTypes[type];
  let currentTargetIndex = 0; // Start with the first waypoint

  const enemy = add([
    sprite(enemyConfig.sprite),
    //color(enemyConfig.color.r, enemyConfig.color.g, enemyConfig.color.b),
    pos(enemyPos),
    area(),
    scale(2),
    health(enemyConfig.health),
    anchor("center"),
    "enemy",
    state("move", ["idle", "attack", "move"]),
    {death_money: enemyConfig.death_money}
  ]);

  enemy.play("run")

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

  enemy.onDestroy(() => {
    onDefeatedCallback()
  });
}

