
// ===== COUNCIL SYSTEM =====
const COUNCIL_NAMES = ['Edmund','Roland','Meredith','Thomas','Aldric','Gilbert','Margaret','Robert','Eleanor','Hugh','Isabel','William','Alice','Henry','Joan'];
const COUNCIL_SURNAMES = ['de Vere','of Anjou','the Wise','Blackwood','Ironside','de Clare','Beaumont','of York','Stoneheart','Brightwater'];
const COUNCIL_TRAITS = ['diplomatic','shrewd','brave','military_genius','greedy','efficient','paranoid','deceitful','zealous','kind','ambitious','loyal','just','cruel'];

const CouncilSystem = {
  initDefault(G) {
    G.council = [
      { id:'chancellor',  role:'chancellor',  name:'Lord Edmund de Vere',      age:52, loyalty:78, skill:15, traits:['diplomatic','shrewd'],         icon:'📜' },
      { id:'marshal',     role:'marshal',     name:'Sir Roland Ironside',       age:38, loyalty:85, skill:14, traits:['brave','military_genius'],      icon:'⚔️' },
      { id:'steward',     role:'steward',     name:'Lady Meredith Beaumont',    age:44, loyalty:70, skill:16, traits:['greedy','efficient'],            icon:'💰' },
      { id:'spymaster',   role:'spymaster',   name:'Brother Thomas',            age:61, loyalty:55, skill:18, traits:['paranoid','deceitful'],          icon:'🕵' },
      { id:'priest',      role:'priest',      name:'Bishop Aldric of York',     age:68, loyalty:82, skill:12, traits:['zealous','kind'],                icon:'✝️' }
    ];
  },

  tick(G, dayOfYear) {
    const isMonthEnd = (G.date.day === DAYS_PER_MONTH[G.date.month-1]);
    if (!isMonthEnd) return;
    G.council.forEach(c => {
      if (G.kingdom.stability < 40) c.loyalty = Math.max(0, c.loyalty - 2);
      if (G.kingdom.prestige > 80)  c.loyalty = Math.min(100, c.loyalty + 1);
      if (Math.random() < 0.01) {
        c.age++;
        if (c.age > 80 && Math.random() < 0.1) this.replaceCouncillor(G, c.role);
      }
    });
    const steward = G.council.find(c=>c.role==='steward');
    if (steward) G.economy.taxEfficiencyMod = 1 + (steward.skill-10)*0.01;
    const spy = G.council.find(c=>c.role==='spymaster');
    if (spy) G.intrigues.spyNetwork = Math.min(100, G.intrigues.spyNetwork + spy.skill*0.05);
    const priest = G.council.find(c=>c.role==='priest');
    if (priest && priest.loyalty > 60) G.kingdom.stability = Math.min(100, G.kingdom.stability + 0.2);
  },

  replaceCouncillor(G, role) {
    const idx = G.council.findIndex(c=>c.role===role);
    if (idx < 0) return;
    const def = COUNCIL_ROLES[role];
    const name = COUNCIL_NAMES[Math.floor(Math.random()*COUNCIL_NAMES.length)];
    const surname = COUNCIL_SURNAMES[Math.floor(Math.random()*COUNCIL_SURNAMES.length)];
    const t1 = COUNCIL_TRAITS[Math.floor(Math.random()*COUNCIL_TRAITS.length)];
    const t2 = COUNCIL_TRAITS[Math.floor(Math.random()*COUNCIL_TRAITS.length)];
    const newC = {
      id: role, role, icon: def.icon,
      name: `${name} ${surname}`,
      age: 30 + Math.floor(Math.random()*30),
      loyalty: 50 + Math.floor(Math.random()*30),
      skill: 8 + Math.floor(Math.random()*12),
      traits: [t1,t2]
    };
    G.council[idx] = newC;
    logEvent(G, `⚖️ Novo conselheiro: ${newC.name} como ${def.name}`, 'council');
  },

  getBonus(G, role) {
    const c = G.council.find(x=>x.role===role);
    if (!c) return 0;
    return c.skill * (c.loyalty/100);
  }
};
