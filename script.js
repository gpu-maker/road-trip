let stats = { health: 100, energy: 100, thirst: 100 };

let inventory = {
  wood: 0,
  water: 0,
  grass: 0,
  metal: 0,
  arrows: 0
};

let weapon = { type: "none", level: 0, durability: 0 };

let shelter = "none";
let location = "camp";
let isNight = false;
let turn = 0;

const weaponStats = {
  spear: { base: 35, loss: 2, heal: 10 },
  axe:   { base: 30, loss: 4, heal: 20 },
  bow:   { base: 25, loss: 1, heal: 5 }
};

function maxDurability() {
  return weapon.level > 0
    ? weaponStats[weapon.type].base + weapon.level * 10
    : 0;
}

function updateUI() {
  health.textContent = stats.health;
  energy.textContent = stats.energy;
  thirst.textContent = stats.thirst;
  dayState.textContent = isNight ? "Night" : "Day";

  items.innerHTML = "";
  for (let i in inventory) {
    if (inventory[i] > 0) {
      const li = document.createElement("li");
      li.textContent = `${i}: ${inventory[i]}`;
      items.appendChild(li);
    }
  }

  const w = document.createElement("li");
  w.textContent =
    weapon.level > 0
      ? `weapon: ${weapon.type} Lv${weapon.level} (${weapon.durability}/${maxDurability()})`
      : "weapon: none";
  items.appendChild(w);

  const s = document.createElement("li");
  s.textContent = `shelter: ${shelter}`;
  items.appendChild(s);
}

function msg(t) { message.textContent = t; }

function advanceTime() {
  turn++;
  if (turn % 4 === 0) isNight = !isNight;
}

function drain() {
  stats.thirst -= isNight ? 8 : 5;
  if (stats.thirst <= 0) stats.health -= 10;
  if (stats.health <= 0) {
    alert("You died in the forest.");
    localStorage.removeItem("roadtripSave");
    location.reload();
  }
}

function travel(p) {
  if (stats.energy < 10) return msg("Not enough energy.");
  stats.energy -= 10;
  location = p;
  advanceTime(); drain(); updateUI();
}

function gather() {
  if (stats.energy < 10) return msg("Not enough energy.");
  stats.energy -= 10;

  if (location === "forest") inventory.wood++;
  if (location === "river") inventory.water++;
  if (location === "junkyard") inventory.metal++;
  if (location === "camp") inventory.grass++;

  advanceTime(); drain(); updateUI();
}

function hunt() {
  if (stats.energy < 20) return msg("Not enough energy.");
  stats.energy -= 20;

  if (weapon.level === 0) {
    stats.health -= 30;
    msg("You hunt bare-handed and get injured.");
  } else {
    if (weapon.type === "bow") {
      if (inventory.arrows <= 0) {
        msg("No arrows! You can't hunt with a bow.");
        stats.energy += 20;
        return;
      }
      inventory.arrows--;
    }

    weapon.durability -= weaponStats[weapon.type].loss * (isNight ? 2 : 1);
    if (weapon.durability < 0) weapon.durability = 0;

    if (weapon.durability === 0) {
      stats.health -= 20;
      msg("Your weapon fails during the hunt.");
    } else {
      stats.health = Math.min(
        100,
        stats.health + weaponStats[weapon.type].heal + weapon.level * 5
      );
      msg(`Successful hunt with your ${weapon.type}.`);
    }
  }

  advanceTime(); drain(); updateUI();
}

function drink() {
  if (inventory.water <= 0) return msg("No water.");
  inventory.water--;
  stats.thirst = Math.min(100, stats.thirst + 40);
  updateUI();
}

function rest() {
  let gain = isNight ? 40 : 30;
  let danger = isNight ? 0.25 : 0;

  if (location === "camp") {
    if (shelter === "tent") { gain += 10; danger = 0.1; }
    if (shelter === "cabin") { gain += 25; danger = 0; }
  }

  stats.energy = Math.min(100, stats.energy + gain);
  stats.thirst -= 10;
  if (Math.random() < danger) stats.health -= 15;

  advanceTime(); drain(); updateUI();
}

function craftWeapon(t) {
  if (weapon.level > 0) return msg("You already have a weapon.");
  if (stats.energy < 5) return msg("Not enough energy.");

  if (
    (t === "spear" && inventory.wood >= 2 && inventory.metal >= 1) ||
    (t === "axe" && inventory.wood >= 2 && inventory.metal >= 2) ||
    (t === "bow" && inventory.wood >= 2 && inventory.grass >= 2)
  ) {
    inventory.wood -= 2;
    if (t === "spear") inventory.metal--;
    if (t === "axe") inventory.metal -= 2;
    if (t === "bow") inventory.grass -= 2;
  } else return msg("Missing materials.");

  stats.energy -= 5;
  weapon = { type: t, level: 1, durability: maxDurability() };
  updateUI();
}

function upgradeWeapon() {
  if (weapon.level === 0 || weapon.level === 3) return msg("Cannot upgrade.");
  if (stats.energy < 10 || inventory.metal < weapon.level + 1)
    return msg("Not enough resources.");

  stats.energy -= 10;
  inventory.metal -= weapon.level + 1;
  weapon.level++;
  weapon.durability = maxDurability();
  updateUI();
}

function repairWeapon() {
  if (weapon.level === 0 || location !== "camp")
    return msg("Must be at camp with a weapon.");
  if (stats.energy < 5 || inventory.metal < 1)
    return msg("Need 1 metal, 5 energy.");

  stats.energy -= 5;
  inventory.metal--;
  weapon.durability = Math.min(maxDurability(), weapon.durability + 20);
  updateUI();
}

function craftArrows() {
  if (inventory.wood >= 1 && inventory.metal >= 1 && stats.energy >= 5) {
    inventory.wood--;
    inventory.metal--;
    stats.energy -= 5;
    inventory.arrows += 5;
    updateUI();
  } else {
    msg("Need 1 wood, 1 metal, 5 energy.");
  }
}

function buildShelter(t) {
  if (location !== "camp") return;
  if (t === "tent" && shelter === "none" && inventory.wood >= 4 && inventory.grass >= 2 && stats.energy >= 15) {
    inventory.wood -= 4; inventory.grass -= 2; stats.energy -= 15; shelter = "tent";
  }
  if (t === "cabin" && shelter === "tent" && inventory.wood >= 8 && inventory.metal >= 4 && stats.energy >= 25) {
    inventory.wood -= 8; inventory.metal -= 4; stats.energy -= 25; shelter = "cabin";
  }
  updateUI();
}

function craftBandage() {
  if (inventory.grass >= 2 && stats.energy >= 5) {
    inventory.grass -= 2;
    stats.energy -= 5;
    stats.health = Math.min(100, stats.health + 30);
    updateUI();
  }
}

function repairCar() {
  if (inventory.metal >= 3 && inventory.wood >= 2 && stats.energy >= 15) {
    alert("You repair the car and escape!");
    localStorage.removeItem("roadtripSave");
    location.reload();
  }
}

function saveGame() {
  localStorage.setItem("roadtripSave", JSON.stringify({
    stats, inventory, weapon, shelter, location, isNight, turn
  }));
}

function loadGame() {
  const d = JSON.parse(localStorage.getItem("roadtripSave"));
  if (!d) return;
  ({ stats, inventory, weapon, shelter, location, isNight, turn } = d);
  updateUI();
}

updateUI();
