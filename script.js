let stats = { health: 100, energy: 100, thirst: 100 };
let turn = 0;
let isNight = false;
let location = "camp";

let inventory = {
  wood: 0, water: 0, grass: 0, metal: 0,
  stoneArrows: 0, metalArrows: 0
};

let weapon = { type: "bow", level: 1, durability: 60 };
let armor = { type: "light", level: 1, durability: 40, max: 40 };

const icons = {
  axe: [
    ".m.m",
    ".mm.",
    ".m..",
    "w.w."
  ],
  bow: [
    ".b..",
    "b..b",
    "b..b",
    ".b.."
  ],
  spear: [
    "..m.",
    "..m.",
    "..m.",
    ".w.."
  ],
  armor: [
    ".mm.",
    "mmmm",
    "m..m",
    ".mm."
  ],
  wood: [
    ".w..",
    "wwww",
    ".w..",
    ".w.."
  ],
  water: [
    "..b.",
    ".bbb",
    "bbbb",
    ".bb."
  ],
  metal: [
    ".mm.",
    "mmmm",
    "mmmm",
    ".mm."
  ],
  arrows: [
    ".m..",
    "..m.",
    "...m",
    "w..."
  ]
};

function msg(t){ message.textContent = t; }

function advanceTime(){
  turn++;
  if(turn % 4 === 0) isNight = !isNight;
}

function drain(){
  stats.thirst -= isNight ? 8 : 5;
  if(stats.thirst <= 0) stats.health -= 10;
}

function conditionColor(p){
  if(p > 0.6) return "#4cff6a";
  if(p > 0.3) return "#ffd84c";
  return "#ff4c4c";
}

function addItem(name, amount, cur=1, max=1, icon=null){
  const pct = cur / max;
  const box = document.createElement("div");
  box.className = "itemBox";

  const px = document.createElement("div");
  px.className = "pixel";
  px.style.setProperty("--cond", `${pct*100}%`);
  px.style.setProperty("--color", conditionColor(pct));

  if(icon && icons[icon]){
    const ic = document.createElement("div");
    ic.className = "icon";
    icons[icon].join("").split("").forEach(c=>{
      const p = document.createElement("div");
      p.className = "px";
      if(c !== ".") p.classList.add(c);
      ic.appendChild(p);
    });
    px.appendChild(ic);
  }

  const t = document.createElement("div");
  t.className = "itemText";
  t.innerHTML = `<b>${name}</b><br>${amount?`x${amount}`:`${cur}/${max}`}`;

  box.append(px,t);
  items.appendChild(box);
}

function updateUI(){
  health.textContent = stats.health;
  energy.textContent = stats.energy;
  thirst.textContent = stats.thirst;
  dayState.textContent = isNight ? "Night" : "Day";
  items.innerHTML = "";

  if(inventory.wood) addItem("Wood", inventory.wood,1,1,"wood");
  if(inventory.water) addItem("Water", inventory.water,1,1,"water");
  if(inventory.metal) addItem("Metal", inventory.metal,1,1,"metal");

  if(inventory.stoneArrows) addItem("Stone Arrows", inventory.stoneArrows,1,1,"arrows");
  if(inventory.metalArrows) addItem("Metal Arrows", inventory.metalArrows,1,1,"arrows");

  addItem(`${weapon.type} Lv${weapon.level}`,0,weapon.durability,80,weapon.type);
  addItem(`Armor Lv${armor.level}`,0,armor.durability,armor.max,"armor");
}

function travel(p){
  if(stats.energy<10) return;
  stats.energy-=10; location=p;
  advanceTime(); drain(); updateUI();
}

function gather(){
  if(stats.energy<10) return;
  stats.energy-=10;
  if(location==="forest") inventory.wood++;
  if(location==="river") inventory.water++;
  if(location==="junkyard") inventory.metal++;
  advanceTime(); drain(); updateUI();
}

function hunt(){
  if(stats.energy<20) return;
  stats.energy-=20;
  if(inventory.metalArrows>0) inventory.metalArrows--;
  else if(inventory.stoneArrows>0) inventory.stoneArrows--;
  weapon.durability-=5;
  stats.health=Math.min(100,stats.health+15);
  advanceTime(); drain(); updateUI();
}

function drink(){
  if(inventory.water<=0) return;
  inventory.water--; stats.thirst=Math.min(100,stats.thirst+30);
  updateUI();
}

function rest(){
  stats.energy=Math.min(100,stats.energy+(isNight?40:20));
  advanceTime(); updateUI();
}

function craftStoneArrows(){
  if(inventory.wood<1||stats.energy<5) return;
  inventory.wood--; stats.energy-=5; inventory.stoneArrows+=5; updateUI();
}

function craftMetalArrows(){
  if(inventory.wood<1||inventory.metal<1||stats.energy<8) return;
  inventory.wood--; inventory.metal--; stats.energy-=8; inventory.metalArrows+=5; updateUI();
}

function repairWeapon(){
  if(stats.energy<5||inventory.metal<1) return;
  stats.energy-=5; inventory.metal--; weapon.durability+=25; updateUI();
}

function upgradeWeapon(){
  if(stats.energy<10||inventory.metal<2) return;
  stats.energy-=10; inventory.metal-=2; weapon.level++; weapon.durability+=20; updateUI();
}

function repairArmor(){
  if(stats.energy<5||inventory.metal<1) return;
  stats.energy-=5; inventory.metal--;
  armor.durability=Math.min(armor.max,armor.durability+25);
  updateUI();
}

function upgradeArmor(){
  if(stats.energy<10||inventory.metal<2) return;
  stats.energy-=10; inventory.metal-=2;
  armor.level++; armor.max+=10; armor.durability=armor.max; updateUI();
}

function saveGame(){
  localStorage.setItem("roadtripSave",JSON.stringify({stats,inventory,weapon,armor,turn,isNight}));
  msg("Saved");
}

function loadGame(){
  const s=localStorage.getItem("roadtripSave");
  if(!s) return;
  ({stats,inventory,weapon,armor,turn,isNight}=JSON.parse(s));
  msg("Loaded"); updateUI();
}

updateUI();
