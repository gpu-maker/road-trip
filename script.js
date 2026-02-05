// ---------- GAME STATE ----------
let stats = {
  health: 100,
  energy: 100,
  thirst: 100
};

let inventory = {
  wood: 0,
  water: 0,
  grass: 0,
  metal: 0,
  weapon: 0
};

let location = "camp";
let isNight = false;
let turn = 0;

// ---------- UI ----------
function updateUI() {
  health.textContent = stats.health;
  energy.textContent = stats.energy;
  thirst.textContent = stats.thirst;
  dayState.textContent = isNight ? "Night" : "Day";

  items.innerHTML = "";
  for (let item in inventory) {
    if (inventory[item] > 0) {
      const li = document.createElement("li");
      li.textContent = `${item}: ${inventory[item]}`;
      items.appendChild(li);
    }
  }
}

function message(text) {
  document.getElementById("message").textContent = text;
}

// ---------- TIME ----------
function advanceTime() {
  turn++;
  if (turn % 4 === 0) {
    isNight = !isNight;
    message(isNight
      ? "Night falls. The forest grows dangerous."
      : "Morning arrives. You feel a bit safer."
    );
  }
}

// ---------- SURVIVAL ----------
function drain() {
  stats.thirst -= isNight ? 8 : 5;

  if (stats.thirst <= 0) {
    stats.health -= isNight ? 15 : 10;
    message("You are suffering from dehydration.");
  }

  if (stats.health <= 0) {
    alert("You died alone in the forest.");
    location.reload();
  }
}

// ---------- MAP ----------
function travel(place) {
  if (stats.energy < 10) {
    message("Too exhausted to travel.");
    return;
  }

  stats.energy -= 10;
  location = place;

  message(`You travel to the ${place}.`);
  advanceTime();
  drain();
  updateUI();
}

// ---------- ACTIONS ----------
function gather() {
  if (stats.energy < 10) {
    message("Too tired to gather.");
    return;
  }

  stats.energy -= 10;

  if (location === "forest") inventory.wood++;
  if (location === "river") inventory.water++;
  if (location === "junkyard") inventory.metal++;
  if (location === "camp") inventory.grass++;

  message(`You gather resources at the ${location}.`);
  advanceTime();
  drain();
  updateUI();
}

function hunt() {
  if (stats.energy < 20) {
    message("Too tired to hunt.");
    return;
  }

  stats.energy -= 20;

  if (inventory.weapon > 0) {
    stats.health = Math.min(100, stats.health + 20);
    message("You successfully hunt and eat.");
  } else {
    stats.health -= isNight ? 25 : 15;
    message("You are injured while hunting.");
  }

  advanceTime();
  drain();
  updateUI();
}

function drink() {
  if (inventory.water <= 0) {
    message("You have no water.");
    return;
  }

  inventory.water--;
  stats.thirst = Math.min(100, stats.thirst + 40);
  message("You drink water and feel better.");
  updateUI();
}

// ---------- CRAFTING ----------
function craft(item) {

  if (item === "weapon") {
    if (inventory.wood >= 2 && inventory.metal >= 1) {
      inventory.wood -= 2;
      inventory.metal -= 1;
      inventory.weapon++;
      message("Weapon crafted.");
    } else message("Requires 2 wood, 1 metal.");
  }

  if (item === "bandage") {
    if (inventory.grass >= 2) {
      inventory.grass -= 2;
      stats.health = Math.min(100, stats.health + 30);
      message("Bandage applied.");
    } else message("Requires 2 grass.");
  }

  if (item === "repair") {
    if (inventory.metal >= 3 && inventory.wood >= 2) {
      alert("You repaired the car and escaped!");
      location.reload();
    } else message("Requires 3 metal, 2 wood.");
  }

  updateUI();
}

// ---------- START ----------
updateUI();
// ---------------- Survival Logic ----------------
function drain() {
  stats.thirst -= 5;

  if (stats.thirst <= 0) {
    stats.health -= 10;
    message("You are severely dehydrated...");
  }

  if (stats.health <= 0) {
    alert("You collapse and die in the forest.");
    location.reload();
  }
}

function gather(item) {
  if (stats.energy < 10) {
    message("You are too exhausted to gather.");
    return;
  }

  stats.energy -= 10;
  inventory[item]++;
  message(`You collected ${item}.`);

  drain();
  updateUI();
}

function hunt() {
  if (stats.energy < 20) {
    message("You are too tired to hunt.");
    return;
  }

  stats.energy -= 20;

  if (inventory.weapon > 0) {
    stats.health = Math.min(100, stats.health + 20);
    message("You hunted successfully and ate.");
  } else {
    stats.health -= 15;
    message("You were injured hunting without a weapon.");
  }

  drain();
  updateUI();
}

// ---------------- Crafting ----------------
function craft(item) {

  if (item === "weapon") {
    if (inventory.wood >= 2 && inventory.metal >= 1) {
      inventory.wood -= 2;
      inventory.metal -= 1;
      inventory.weapon++;
      message("Weapon crafted (2 wood, 1 metal).");
    } else {
      message("Weapon requires: 2 wood, 1 metal.");
    }
  }

  if (item === "bandage") {
    if (inventory.grass >= 2) {
      inventory.grass -= 2;
      stats.health = Math.min(100, stats.health + 30);
      message("Bandage crafted and used (2 grass).");
    } else {
      message("Bandage requires: 2 grass.");
    }
  }

  if (item === "repair") {
    if (inventory.metal >= 3 && inventory.wood >= 2) {
      alert("You used 3 metal and 2 wood to repair the car and escape!");
      location.reload();
    } else {
      message("Car repair requires: 3 metal, 2 wood.");
    }
  }

  updateUI();
}

// ---------------- Start Game ----------------
updateUI();
