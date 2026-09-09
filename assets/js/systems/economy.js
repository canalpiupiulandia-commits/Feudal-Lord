
// ===== ECONOMY SYSTEM =====
const EconomySystem = {
  tick(G, dayOfYear) {
    const isMonthEnd = (G.date.day === DAYS_PER_MONTH[G.date.month - 1]);
    if (isMonthEnd) this.monthlyTick(G);
    const isYearEnd  = (G.date.month === 12 && G.date.day === 31);
    if (isYearEnd) this.yearlyTick(G);
  },

  monthlyTick(G) {
    this.calculateProduction(G);
    const tax = this.collectTaxes(G);
    G.resources.gold += tax;
    G.economy.lastMonthTax = tax;
    const privateIncome = this.privateBusinessIncome(G);
    G.resources.gold += privateIncome;
    G.economy.lastMonthPrivate = privateIncome;
    const expenses = this.calculateExpenses(G);
    G.resources.gold -= expenses.total;
    G.economy.lastMonthExpenses = expenses;
    G.kingdom.treasury = G.resources.gold;
    if (G.resources.gold < 0) {
      G.kingdom.debt = Math.abs(G.resources.gold);
      G.resources.gold = 0;
    }
    G.economy.gdp = Math.floor((tax + privateIncome) * 12);
    G.economy.monthlyIncome  = tax + privateIncome;
    G.economy.monthlyExpenses = expenses.total;
    G.economy.monthlyNet = G.economy.monthlyIncome - expenses.total;
    this.updatePrices(G);
  },

  yearlyTick(G) {
    G.population.lastYearBirths = 0;
    G.population.lastYearDeaths = 0;
    G.kingdom.prestige = Math.max(0, G.kingdom.prestige - 1);
    if (G.kingdom.debt > 0) {
      const interest = Math.floor(G.kingdom.debt * 0.05);
      G.kingdom.debt += interest;
      notify(`Juros da dívida: ${interest} moedas`, 'bad');
    }
  },

  calculateProduction(G) {
    const res = G.resources;
    const bld = G.buildings;
    const resBonus = G.researchBonus || {};
    G.economy.production = {};
    if (bld.farm) { const farmOut = bld.farm.level * 120 * (1 + (resBonus.food||0)); res.food += Math.floor(farmOut); G.economy.production.food = Math.floor(farmOut); }
    if (bld.granary) res.food = Math.min(res.food, 5000 + bld.granary.level * 500);
    if (bld.pasture) { res.food += bld.pasture.level*50; res.cloth += bld.pasture.level*10; }
    if (bld.mill)    { res.food += bld.mill.level*30;    res.cloth += bld.mill.level*25; }
    if (bld.lumber_mill) res.wood  += Math.floor(bld.lumber_mill.level * 60 * (1+(resBonus.wood||0)));
    if (bld.mine)   { res.iron  += Math.floor(bld.mine.level*40*(1+(resBonus.iron||0))); res.stone += Math.floor(bld.mine.level*30); }
    if (bld.tannery) res.cloth += bld.tannery.level*40;
    if (bld.school)  res.education += bld.school.level*8;
    res.wood  = Math.min(res.wood,  2000 + (bld.lumber_mill?.level||0)*500);
    res.iron  = Math.min(res.iron,  1000 + (bld.mine?.level||0)*300);
    res.stone = Math.min(res.stone, 1000 + (bld.mine?.level||0)*300);
    res.cloth = Math.min(res.cloth, 800);
    res.education = Math.min(res.education, 200);
  },

  collectTaxes(G) {
    const g = G.population.groups;
    const taxRates = { minimal:.03, moderate:.08, heavy:.14, crushing:.20 };
    const rate = taxRates[G.laws.taxation] || .08;
    const efficiencyBonus = G.research.completed.includes('bureaucracy') ? 1.15 : 1;
    const censusBonus = G.research.completed.includes('census') ? 1.10 : 1;
    let tax = 0;
    const taxability = { peasants:.35, craftsmen:.55, merchants:.75, nobility:.80, clergy:.20, scholars:.45 };
    Object.keys(g).forEach(k => {
      const grp = g[k];
      const grpWealth = grp.count * (grp.wealth || 20);
      tax += grpWealth * rate * (taxability[k]||.5) * efficiencyBonus * censusBonus;
    });
    return Math.floor(tax * (G.economy.taxEfficiencyMod || 1));
  },

  privateBusinessIncome(G) {
    const merchants = G.population.groups.merchants.count;
    const marketLevel = G.buildings.market?.level || 0;
    const tradeMod = G.laws.trade==='free'?1.4:G.laws.trade==='closed'?0.6:1.0;
    const routeBonus = G.research.completed.includes('trade_routes')?1.2:1;
    const bankBonus  = G.research.completed.includes('banking')?1.3:1;
    const guildBonus = G.research.completed.includes('guilds_org')?1.15:1;
    const craftsmen = G.population.groups.craftsmen.count;
    const merchantIncome  = merchants  * 0.8 * marketLevel * tradeMod * routeBonus * bankBonus;
    const craftsmanIncome = craftsmen * 0.3 * (G.laws.labor==='guilds'?1.2:1) * guildBonus;
    const income = merchantIncome + craftsmanIncome;
    G.economy.privateJobsGDP = Math.floor(income * 12);
    return Math.floor(income);
  },

  calculateExpenses(G) {
    const bld = G.buildings;
    let upkeep = 0;
    Object.values(bld).forEach(b => { upkeep += (b.upkeep || b.level*8); });
    const councilWages = G.council.length * 50;
    const militaryExp = G.laws.military==='professional'?400:G.laws.military==='mercenary'?700:100;
    const debtPayment = Math.floor(G.kingdom.debt * 0.02);
    return { upkeep, councilWages, militaryExp, debtPayment, total: upkeep + councilWages + militaryExp + debtPayment };
  },

  updatePrices(G) {
    const pop = PopulationSystem.getTotal(G);
    G.economy.prices = {
      food: Math.max(1, Math.round(10 * (pop*0.04 / Math.max(1,G.resources.food)))),
      wood: Math.max(1, Math.round(8  * (500   / Math.max(1,G.resources.wood)))),
      iron: Math.max(1, Math.round(15 * (200   / Math.max(1,G.resources.iron))))
    };
  }
};
