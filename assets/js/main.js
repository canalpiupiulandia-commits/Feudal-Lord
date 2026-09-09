
// ============================================================
//  FEUDAL LORD - ENGINE PRINCIPAL
// ============================================================
'use strict';
let G = null;
let gameLoopInterval = null;
let currentPanel = 'overview';
let prevGold = 0;
let prevPop  = 0;

function startNewGame() {
  G = initGameState();
  BuildingSystem.initialize(G);
  CouncilSystem.initDefault(G);
  document.getElementById('menu-screen').style.display = 'none';
  document.getElementById('game-screen').style.display = 'flex';
  startGameLoop();
  renderAll();
  logEvent(G, '👑 Seu reinado começa! Que Deus abençoe vossa majes...', 'start');
  notify('Bem-vindo ao Reino de Avalon! 👑', 'good');
}

function loadGame() {
  const saved = SaveSystem.load();
  if (!saved) { notify('Nenhum save encontrado.','bad'); return; }
  G = saved;
  document.getElementById('menu-screen').style.display = 'none';
  document.getElementById('game-screen').style.display = 'flex';
  startGameLoop();
  renderAll();
  notify('Jogo carregado! 💾', 'good');
}

function saveGame() {
  if (!G) return;
  SaveSystem.save(G);
  const ind = document.getElementById('save-indicator');
  ind.classList.add('show');
  setTimeout(() => ind.classList.remove('show'), 2000);
}

window.onload = () => {
  document.getElementById('load-btn').disabled = !SaveSystem.hasSave();
};

function initGameState() {
  return {
    paused: false, speed: 1,
    date: { year:1066, month:1, day:1 },
    daysSinceStart: 0, _pausedForEvent: false,
    kingdom: { name:'Reino de Avalon', ruler:'Vossa Majestade',
      treasury:5000, debt:0, prestige:100, legitimacy:80, stability:75, piety:50, military:50 },
    resources: { gold:5000, food:2000, wood:500, stone:300, iron:200, cloth:150, education:50 },
    population: {
      groups: {
        peasants:  { count:5000, employed:4500, wealth:10,  wellbeing:60 },
        craftsmen: { count:2000, employed:1800, wealth:40,  wellbeing:65 },
        merchants: { count:500,  employed:500,  wealth:150, wellbeing:70 },
        nobility:  { count:300,  employed:300,  wealth:500, wellbeing:80 },
        clergy:    { count:200,  employed:200,  wealth:100, wellbeing:75 },
        scholars:  { count:100,  employed:80,   wealth:80,  wellbeing:70 }
      },
      demographics: {
        male:   { children:1200, youngAdult:1500, adult:1800, elderly:400 },
        female: { children:1100, youngAdult:1400, adult:1700, elderly:350 }
      },
      lastMonthBirths:0, lastMonthDeaths:0, lastYearBirths:0, lastYearDeaths:0, privateJobsAvailable:0
    },
    economy: { gdp:0, monthlyIncome:0, monthlyExpenses:0, monthlyNet:0, taxEfficiencyMod:1,
      employmentRate:90, prices:{}, production:{}, privateJobsGDP:0, lastMonthTax:0,
      lastMonthPrivate:0, lastMonthExpenses:{total:0} },
    buildings: {},
    research: { currentTech:null, progress:0, completed:[], speedBonus:1 },
    researchBonus: {},
    laws: { taxation:'moderate', labor:'serfdom', land:'feudal', religion:'orthodox',
      succession:'primogeniture', trade:'closed', education:'clergy', military:'levy' },
    council: [],
    health: { overallHealth:60, hospitalCoverage:0, plague:false, plagueIntensity:0,
      plagueControl:5, lastPlagueYear:1050, diseases:{tuberculosis:8,malnutrition:12,wounds:4} },
    intrigues: { spyNetwork:20, activeConspiracies:[], discoveredPlots:[] },
    events: { queue:[], history:[] },
    log: []
  };
}

function startGameLoop() {
  if (gameLoopInterval) clearInterval(gameLoopInterval);
  const ms = {1:700,2:300,4:100};
  gameLoopInterval = setInterval(gameTick, ms[G.speed]||700);
}

function gameTick() {
  if (!G || G.paused || G._pausedForEvent) return;
  prevGold = G.resources.gold;
  prevPop  = PopulationSystem.getTotal(G);
  advanceDate();
  const doy = getDayOfYear(G.date);
  PopulationSystem.updateWellbeing(G);
  PopulationSystem.tick(G, doy);
  EconomySystem.tick(G, doy);
  ResearchSystem.tick(G, doy);
  HealthSystem.tick(G, doy);
  CouncilSystem.tick(G, doy);
  EventSystem.tick(G, doy);
  IntrigueSystem.tick(G, doy);
  updateStability(G);
  renderAll();
}

function advanceDate() {
  G.daysSinceStart++;
  const dpm = DAYS_PER_MONTH[G.date.month-1];
  G.date.day++;
  if (G.date.day > dpm) { G.date.day = 1; G.date.month++; }
  if (G.date.month > 12) { G.date.month = 1; G.date.year++; }
}

function getDayOfYear(d) {
  let x = 0;
  for(let i=0;i<d.month-1;i++) x+=DAYS_PER_MONTH[i];
  return x+d.day;
}

function updateStability(G) {
  let delta = 0;
  const pop = PopulationSystem.getTotal(G);
  const foodR = G.resources.food / Math.max(1, pop*0.4);
  if (foodR < 0.3) delta -= 0.5;
  else if (foodR < 0.7) delta -= 0.2;
  else if (foodR > 2) delta += 0.1;
  if (G.kingdom.debt > 5000) delta -= 0.3;
  if (G.health.plague) delta -= G.health.plagueIntensity*0.04;
  if (G.kingdom.prestige > 120) delta += 0.1;
  const avgWB = PopulationSystem.avgWellbeing(G);
  if (avgWB < 30) delta -= 0.4;
  else if (avgWB > 70) delta += 0.1;
  G.kingdom.stability = Math.max(0, Math.min(100, G.kingdom.stability + delta));
}

function showPanel(name) {
  document.querySelectorAll('.panel').forEach(p=>p.classList.remove('active'));
  document.querySelectorAll('.nav-btn').forEach(b=>b.classList.remove('active'));
  document.getElementById('panel-'+name)?.classList.add('active');
  document.getElementById('nav-'+name)?.classList.add('active');
  currentPanel = name;
  if (G) renderAll();
}

function togglePause() {
  if (!G) return;
  G.paused = !G.paused;
  const btn = document.getElementById('pause-btn');
  btn.textContent = G.paused ? '▶' : '⏸';
  btn.classList.toggle('paused', G.paused);
}

function setSpeed(s) {
  if (!G) return;
  G.speed = s;
  [1,2,4].forEach(x=>document.getElementById('spd'+x)?.classList.toggle('active',x===s));
  startGameLoop();
}

function notify(msg, type='neutral') {
  const area = document.getElementById('notif-area');
  if (!area) return;
  const n = document.createElement('div');
  n.className = 'notif notif-'+(type==='good'?'good':type==='bad'?'bad':'event');
  n.textContent = msg;
  area.appendChild(n);
  setTimeout(()=>n.classList.add('show'),10);
  setTimeout(()=>{ n.classList.remove('show'); setTimeout(()=>n.remove(),300); }, NOTIF_DURATION);
}

function logEvent(G, msg, type) {
  if (!G.log) G.log=[];
  G.log.unshift({ msg, type, date:`${G.date.day} ${MONTHS[G.date.month-1]} ${G.date.year}` });
  if (G.log.length>120) G.log=G.log.slice(0,120);
}

function fmt(n)  { return Number(Math.round(n)).toLocaleString('pt-BR'); }
function fmtS(n) { return (n>=0?'+':'')+fmt(n); }
function pct(n)  { return Math.round(n)+'%'; }
function bar(val,max,cls='bar-gold') {
  const p = Math.min(100,Math.max(0,val/max*100));
  return `<div class="bar-wrap"><div class="bar-fill ${cls}" style="width:${p}%"></div></div>`;
}

function showEventModal(ev) {
  document.getElementById('ev-type').textContent  = ev.type||'';
  document.getElementById('ev-title').textContent = (ev.icon||'📣')+' '+ev.title;
  document.getElementById('ev-desc').textContent  = ev.desc;
  const opts = document.getElementById('ev-options');
  opts.innerHTML='';
  ev.options.forEach((opt,i)=>{
    const btn=document.createElement('button');
    btn.className='event-opt';
    btn.innerHTML=`<div>${opt.text}</div><div class="event-opt-effect text-dim">${opt.desc||''}</div>`;
    btn.onclick=()=>EventSystem.resolve(G,ev.id,i);
    opts.appendChild(btn);
  });
  document.getElementById('event-modal').style.display='flex';
}

function hideEventModal() {
  document.getElementById('event-modal').style.display='none';
}
