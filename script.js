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

let shelter = "none"; // none, tent, cabin
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

  const shelterLi = document.createElement("li");
  shelterLi.textContent = `shelter: ${shelter}`;
  items.appendChild(shelterLi);
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
      : "Morning comes. You survived the night."
    );
  }
}

// ---------- SURVIVAL ----------
function drain() {
  stats.thirst -= isNight ? 8 : 5;

  if (stats.thirst <= 0) {
    stats.health -= isNight ? 15 : 10;
    message("You suffer from dehydration.");
  }

  if (stats.health <= 0) {
    alert("You died alone in the forest.");
    localStorage.removeItem("roadtripSave");
    location.reload();
  }
}

// ---------- MAP ----------
function travel(place) {
  if (stats.energy < 10) return message("Not enough energy.");

  stats.energy -= 10;
  location = place;
  message(`You travel to the ${place}.`);

  advanceTime();
  drain();
  updateUI();
}

// ---------- ACTIONS ----------
function gather() {
  if (stats.energy < 10) return message("Not enough energy.");

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
  if (stats.energy < 20) return message("Not enough energy.");

  stats.energy -= 20;

  if (inventory.weapon > 0) {
    stats.health = Math.min(100, stats.health + 20);
    message("The hunt is successful.");
  } else {
    stats.health -= isNight ? 25 : 15;
    message("You are injured hunting without a weapon.");
  }

  advanceTime();
  drain();
  updateUI();
}

function drink() {
  if (inventory.water <= 0) return message("No water.");

  inventory.water--;
  stats.thirst = Math.min(100, stats.thirst + 40);
  message("You drink water.");
  updateUI();
}

// ---------- REST ----------
function rest() {
  let energyGain = isNight ? 40 : 30;
  let dangerChance = isNight ? 0.25 : 0;

  if (location === "camp") {
    if (shelter === "tent") {
      dangerChance = 0.10;
      energyGain += 10;
    }
    if (shelter === "cabin") {
      dangerChance = 0;
      energyGain += 25;
    }
  }

  stats.energy = Math.min(100, stats.energy + energyGain);
  stats.thirst -= 10;

  if (Math.random() < dangerChance) {
    stats.health -= 15;
    message("You are attacked while resting.");
  } else {
    message("You rest safely.");
  }

  advanceTime();
  drain();
  updateUI();
}

// ---------- SHELTER ----------
function buildShelter(type) {
  if (location !== "camp") return message("You must be at camp.");

  if (type === "tent") {
    if (shelter !== "none") return message("You already have shelter.");
    if (stats.energy < 15) return message("Not enough energy.");
    if (inventory.wood >= 4 && inventory.grass >= 2) {
      stats.energy -= 15;
      inventory.wood -= 4;
      inventory.grass -= 2;
      shelter = "tent";
      message("You build a tent. Nights are safer.");
    } else message("Tent requires 4 wood, 2 grass.");
  }

  if (type === "cabin") {
    if (shelter !== "tent") return message("You need a tent first.");
    if (stats.energy < 25) return message("Not enough energy.");
    if (inventory.wood >= 8 && inventory.metal >= 4) {
      stats.energy -= 25;
      inventory.wood -= 8;
      inventory.metal -= 4;
      shelter = "cabin";
      message("You build a cabin. You are safe at night.");
    } else message("Cabin requires 8 wood, 4 metal.");
  }

  updateUI();
}

// ---------- CRAFTING ----------
function craft(item) {
  if (item === "weapon") {
    if (stats.energy < 5) return message("Not enough energy.");
    if (inventory.wood >= 2 && inventory.metal >= 1) {
      stats.energy -= 5;
      inventory.wood -= 2;
      inventory.metal -= 1;
      inventory.weapon++;
      message("Weapon crafted.");
    } else message("Requires 2 wood, 1 metal.");
  }

  if (item === "bandage") {
    if (stats.energy < 5) return message("Not enough energy.");
    if (inventory.grass >= 2) {
      stats.energy -= 5;
      inventory.grass -= 2;
      stats.health = Math.min(100, stats.health + 30);
      message("You apply a bandage.");
    } else message("Requires 2 grass.");
  }

  if (item === "repair") {
    if (stats.energy < 15) return message("Not enough energy.");
    if (inventory.metal >= 3 && inventory.wood >= 2) {
      alert("You repair the car and escape the forest!");
      localStorage.removeItem("roadtripSave");
      location.reload();
    } else message("Requires 3 metal, 2 wood.");
  }

  updateUI();
}

// ---------- SAVE / LOAD ----------
function saveGame() {
  const saveData = {
    stats,
    inventory,
    shelter,
    location,
    isNight,
    turn
  };
  localStorage.setItem("roadtripSave", JSON.stringify(saveData));
  message("Game saved.");
}

function loadGame() {
  const save = localStorage.getItem("roadtripSave");
  if (!save) return message("No save found.");

  const data = JSON.parse(save);
  stats = data.stats;
  inventory = data.inventory;
  shelter = data.shelter;
  location = data.location;
  isNight = data.isNight;
  turn = data.turn;

  message("Game loaded.");
  updateUI();
}

// ---------- START ----------
updateUI();
