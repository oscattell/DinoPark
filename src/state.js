// state.js
let money = 500; // Starting money
let moneyCounter = null;
export function diplayMoney(startingMoney = 500) {
  money = startingMoney
  moneyCounter = add([
    text(`Money: $${getMoney()}`),
    pos(20, 20),
    color(0,0,0),
    z(9),
    { value: getMoney() },
  ]);
}
export function getMoney() {
  return money;
}

export function addMoney(amount) {
  money += amount;
  moneyCounter.text = `Money: $${getMoney()}`; // Update money display
}

export function subtractMoney(amount) {
  if (money >= amount) {
    money -= amount;
  } else {
    money = 0;
  }
  moneyCounter.text = `Money: $${getMoney()}`; // Update money display
}
