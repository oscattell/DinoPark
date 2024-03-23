// state.js
let money = 500; // Starting money
let moneyCounter = null;
export function displayMoney(startingMoney = 500) {
  money = startingMoney
  add([
    sprite("grey_backgroud"),
    pos(0, 0),
    z(1)
  ])
  moneyCounter = add([
    text(`Money: $${getMoney()}`, {
        size: 24, // 48 pixels tall
        font: "sans-serif", // specify any font you loaded or browser built-in
    }),
    pos(12, 12),
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
  console.log(`Subtracting ${amount} from  ${money}`)
  if (money >= amount) {
    money -= amount;
  } else {
    money = 0;
  }
  moneyCounter.text = `Money: $${getMoney()}`; // Update money display
}
