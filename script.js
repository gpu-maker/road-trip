let stats = { health: 100, energy: 100, thirst: 100 };

let inventory = {
  wood: 0,
  water: 0,
  grass: 0,
  metal: 0,
  stoneArrows: 0,
  metalArrows: 0
};

let weapon = { type: "none", level: 0, durability: 0 };

let armor = { type: "none", defense: 0, durability: 0, max: 0 };

let shelter = "none";
let location = "camp";
let isNight = false;
let turn = 0;

const weaponStats = {
  spear: { base: 35, loss: 2, heal: 10 },
  axe:   { base: 30, loss: 4, heal: 20 },
  bow:   { base: 25, loss: 1, heal: 5 }
};

const armorTypes = {
  light:  { defense: 0.2, max: 40 },
  medium: { defense: 0.4, max: 60 },
  heavy:  { defense: 0.6, max: 80 }
};

function maxDurability() {
  return weapon.level > 0
    ? weaponStats[weapon.type].base + weapon.level * 10
    : 0;
}

function applyDamage(dmg) {
  if (armor.type !== "none" && armor.durability > 0) {
    dmg *= (1 - armor.defense);
    armor.durability -= Math.ceil(dmg / 2);
    if (armor.durability < 0) armor.durability = 0;
  }
  stats.health -= Math.ceil(dmg);
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
  w.textContent = weapon.level > 0
    ? `weapon: ${weapon.type} Lv${weapon.level} (${weapon.durability}/${maxDurability()})`
    : "weapon: none";
  items.appendChild(w);

  const a = document.createElement("li");
  a.textContent = armor.type !== "none"
    ? `armor: ${armor.type} (${armor.durability}/${armor.max})`
    : "armor: none";
  items.appendChild(a);

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
  if (stats.thirst <= 0) applyDamage(10);
  if (stats.health <= 0) {
    alert("You died in the forest.");
    localStorage.removeItem("roadtripSave");
    location.reload();
  }
}

function travel(p) {
  if (stats.energy < 10) return msg("Need 10 energy.");
  stats.energy -= 10;
  location = p;
  advanceTime(); drain(); updateUI();
}

function gather() {
  if (stats.energy < 10) return msg("Need 10 energy.");
  stats.energy -= 10;

  if (location === "forest") inventory.wood++;
  if (location === "river") inventory.water++;
  if (location === "junkyard") inventory.metal++;
  if (location === "camp") inventory.grass++;

  advanceTime(); drain(); updateUI();
}

function hunt() {
  if (stats.energy < 20) return msg("Need 20 energy.");
  stats.energy -= 20;

  if (weapon.level === 0) {
    applyDamage(30);
    msg("You hunt bare-handed and get injured.");
    advanceTime(); drain(); updateUI();
    return;
  }

  let arrowBonus = 0;
  if (weapon.type === "bow") {
    if (inventory.metalArrows > 0) {
      inventory.metalArrows--;
      arrowBonus = 15 + (isNight ? 5 : 0);
    } else if (inventory.stoneArrows > 0) {
      inventory.stoneArrows--;
    } else {
      msg("No arrows.");
      stats.energy += 20;
      return;
    }
  }

  weapon.durability -= weaponStats[weapon.type].loss * (isNight ? 2 : 1);
  if (weapon.durability <= 0) {
    weapon.durability = 0;
    applyDamage(20);
    msg("Your weapon fails during the hunt.");
  } else {
    stats.health = Math.min(
      100,
      stats.health +
      weaponStats[weapon.type].heal +
      weapon.level * 5 +
      arrowBonus
    );
    msg("Successful hunt.");
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
  if (Math.random() < danger) applyDamage(15);

  advanceTime(); drain(); updateUI();
}

/* ───── ARMOR ───── */
function craftArmor(t) {
  if (armor.type !== "none") return msg("Already wearing armor.");

  if (t === "light" && inventory.grass >= 3 && stats.energy >= 5) {
    inventory.grass -= 3; stats.energy -= 5;
  } else if (t === "medium" && inventory.wood >= 2 && inventory.metal >= 2 && stats.energy >= 10) {
    inventory.wood -= 2; inventory.metal -= 2; stats.energy -= 10;
  } else if (t === "heavy" && inventory.metal >= 4 && stats.energy >= 15) {
    inventory.metal -= 4; stats.energy -= 15;
  } else return msg("Missing materials.");

  armor = {
    type: t,
    defense: armorTypes[t].defense,
    durability: armorTypes[t].max,
    max: armorTypes[t].max
  };
  updateUI();
}

function repairArmor() {
  if (armor.type === "none" || location !== "camp")
    return msg("Repair armor at camp.");

  if (inventory.metal < 1 || stats.energy < 5)
    return msg("Need 1 metal, 5 energy.");

  inventory.metal--;
  stats.energy -= 5;
  armor.durability = Math.min(armor.max, armor.durability + 25);
  updateUI();
}

updateUI();
