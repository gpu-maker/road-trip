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

// ---------------- UI ----------------
function updateUI() {
  document.getElementById("health").textContent = stats.health;
  document.getElementById("energy").textContent = stats.energy;
  document.getElementById("thirst").textContent = stats.thirst;

  const list = document.getElementById("items");
  list.innerHTML = "";

  for (let item in inventory) {
    if (inventory[item] > 0) {
      const li = document.createElement("li");
      li.textContent = `${item}: ${inventory[item]}`;
      list.appendChild(li);
    }
  }
}

function message(text) {
  document.getElementById("message").textContent = text;
}

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
