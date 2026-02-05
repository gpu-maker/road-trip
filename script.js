function conditionColor(p){
  if(p > 0.6) return "#4cff6a";
  if(p > 0.3) return "#ffd84c";
  return "#ff4c4c";
}

function addItem(name, amount, current = 1, max = 1){
  const pct = current / max;
  const div = document.createElement("div");
  div.className = "itemBox";

  const pixel = document.createElement("div");
  pixel.className = "pixel";
  pixel.style.setProperty("--cond", `${pct * 100}%`);
  pixel.style.setProperty("--color", conditionColor(pct));
  pixel.title = `${name}: ${current}/${max}`;

  const text = document.createElement("div");
  text.className = "itemText";
  text.innerHTML = `<b>${name}</b><br>${amount ? "x"+amount : `${current}/${max}`}`;

  div.appendChild(pixel);
  div.appendChild(text);
  items.appendChild(div);
}

function updateUI(){
  health.textContent = stats.health;
  energy.textContent = stats.energy;
  thirst.textContent = stats.thirst;
  dayState.textContent = isNight ? "Night" : "Day";

  items.innerHTML = "";

  /* Materials */
  if(inventory.wood) addItem("Wood", inventory.wood);
  if(inventory.water) addItem("Water", inventory.water);
  if(inventory.grass) addItem("Grass", inventory.grass);
  if(inventory.metal) addItem("Metal", inventory.metal);

  /* Ammo */
  if(inventory.stoneArrows) addItem("Stone Arrows", inventory.stoneArrows);
  if(inventory.metalArrows) addItem("Metal Arrows", inventory.metalArrows);

  /* Weapon */
  if(weapon.level > 0){
    addItem(
      `${weapon.type} Lv${weapon.level}`,
      0,
      weapon.durability,
      weapon.durability + 1
    );
  }

  /* Armor */
  if(armor.type !== "none"){
    addItem(
      `${armor.type} Armor Lv${armor.level}`,
      0,
      armor.durability,
      armor.max
    );
  }
}
