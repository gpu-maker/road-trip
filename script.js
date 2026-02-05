let stats={health:100,energy:100,thirst:100};
let inventory={wood:0,water:0,metal:0,stoneArrows:0,metalArrows:0};
let weapon={type:"bow",level:1,durability:60};
let armor={level:1,durability:40,max:40};
let turn=0,isNight=false;

const icons={
bow:[
[".b..","b..b","b..b",".b.."],
["bbbb","b..b","b..b","bbbb"],
["bbbb","bbbb","b..b","bbbb"]
],
axe:[
[".m.m",".mm.",".m..","w.w."],
[".mmm","mmmm",".m..","w.w."],
["mmmm","mmmm",".mm.","wwww"]
],
armor:[
[".mm.","m..m","m..m",".mm."],
["mmmm","m..m","m..m","mmmm"],
["mmmm","mmmm","m..m","mmmm"]
]
};

function msg(t){message.textContent=t}
function advance(){turn++;if(turn%4===0)isNight=!isNight}
function drain(){stats.thirst-=isNight?8:5;if(stats.thirst<=0)stats.health-=10}
function color(p){return p>0.6?"#4cff6a":p>0.3?"#ffd84c":"#ff4c4c"}

function addItem(name,amount,cur,max,iconKey){
const box=document.createElement("div");
box.className="itemBox";
const px=document.createElement("div");
px.className="pixel";
px.style.setProperty("--cond",`${(cur/max)*100}%`);
px.style.setProperty("--color",color(cur/max));
if(iconKey){
const ic=document.createElement("div");
ic.className="icon";
icons[iconKey][(iconKey==="armor"?armor.level:weapon.level)-1]
.join("").split("").forEach(c=>{
const p=document.createElement("div");
p.className="px";if(c!==".")p.classList.add(c);
ic.appendChild(p);
});
px.appendChild(ic);
}
box.append(px,document.createTextNode(`${name} ${amount||cur+"/"+max}`));
items.appendChild(box);
}

function updateUI(){
health.textContent=stats.health;
energy.textContent=stats.energy;
thirst.textContent=stats.thirst;
dayState.textContent=isNight?"Night":"Day";
items.innerHTML="";
if(inventory.wood)addItem("Wood",inventory.wood,1,1);
if(inventory.metal)addItem("Metal",inventory.metal,1,1);
if(inventory.stoneArrows)addItem("Stone Arrows",inventory.stoneArrows,1,1);
if(inventory.metalArrows)addItem("Metal Arrows",inventory.metalArrows,1,1);
addItem("Weapon",0,weapon.durability,80,weapon.type);
addItem("Armor",0,armor.durability,armor.max,"armor");
}

function travel(){stats.energy-=10;advance();drain();updateUI()}
function gather(){stats.energy-=10;inventory.wood++;advance();drain();updateUI()}
function hunt(){stats.energy-=20;weapon.durability-=5;stats.health+=15;advance();drain();updateUI()}
function drink(){inventory.water--;stats.thirst+=30;updateUI()}
function rest(){stats.energy+=30;advance();updateUI()}

function upgradeWeapon(){
if(stats.energy<10||inventory.metal<2||weapon.level>=3)return;
stats.energy-=10;inventory.metal-=2;weapon.level++;weapon.durability+=20;updateUI();
}
function repairWeapon(){stats.energy-=5;inventory.metal--;weapon.durability+=25;updateUI()}
function upgradeArmor(){
if(stats.energy<10||inventory.metal<2||armor.level>=3)return;
stats.energy-=10;inventory.metal-=2;armor.level++;armor.max+=10;armor.durability=armor.max;updateUI();
}
function repairArmor(){stats.energy-=5;inventory.metal--;armor.durability+=25;updateUI()}

function repairCar(){
if(inventory.metal>=8&&inventory.wood>=4&&stats.energy>=20){
document.body.innerHTML="<h1>🚗 YOU ESCAPED</h1><p>You repaired the car and survived.</p>";
}else msg("Need 8 metal, 4 wood, 20 energy.");
}

function saveGame(){localStorage.setItem("save",JSON.stringify({stats,inventory,weapon,armor}))}
function loadGame(){Object.assign({stats,inventory,weapon,armor},JSON.parse(localStorage.getItem("save")));updateUI()}

updateUI();
