
// ===== POPULATION SYSTEM =====
const PopulationSystem = {
  tick(G, dayOfYear) {
    const isMonthEnd = (G.date.day === DAYS_PER_MONTH[G.date.month - 1]);
    if (!isMonthEnd) return;
    this.monthlyTick(G);
  },

  monthlyTick(G) {
    const p = G.population;
    const total = this.getTotal(G);
    const foodScore   = Math.min(1, G.resources.food / (total * 0.5));
    const healthScore = G.health.overallHealth / 100;
    const wealthScore = this.avgWellbeing(G) / 100;
    const baseRate = 0.035 / 12;
    const birthMod = foodScore * 0.4 + healthScore * 0.35 + wealthScore * 0.25;
    const birthRate = baseRate * birthMod * (G.research.completed.includes('sanitation') ? 1.15 : 1);
    const plagueMod = G.health.plague ? (G.health.plagueIntensity / 100) * 0.03 : 0;
    const famineFood = G.resources.food < total * 0.15 ? 0.015 : 0;
    const baseDeathRate = 0.022 / 12;
    const healthDeath = (1 - healthScore) * 0.01;
    const deathRate = baseDeathRate + plagueMod + famineFood + healthDeath
      - (G.research.completed.includes('herbal_medicine') ? 0.001 : 0)
      - (G.research.completed.includes('sanitation') ? 0.002 : 0);
    const births = Math.floor(total * birthRate);
    const deaths = Math.floor(total * Math.max(0.001, deathRate));
    p.lastMonthBirths = births;
    p.lastMonthDeaths = deaths;
    p.lastYearBirths  = (p.lastYearBirths || 0) + births;
    p.lastYearDeaths  = (p.lastYearDeaths || 0) + deaths;
    this.distributeChange(G, births - deaths);
    this.socialMobility(G);
    this.updateDemographics(G, births, deaths);
    const foodConsumed = Math.floor(total * 0.04);
    G.resources.food = Math.max(0, G.resources.food - foodConsumed);
    const merchants = p.groups.merchants.count;
    const techBonus = G.research.completed.includes('banking') ? 1.3 : 1;
    const marketBonus = (G.buildings.market ? G.buildings.market.level : 0) * 0.05;
    p.privateJobsAvailable = Math.floor(merchants * 0.8 * techBonus * (1 + marketBonus));
    this.recalcEmployment(G);
  },

  distributeChange(G, netChange) {
    const g = G.population.groups;
    const weights = { peasants:5, craftsmen:2, merchants:0.5, nobility:0.1, clergy:0.2, scholars:0.2 };
    const total = Object.values(weights).reduce((a,b)=>a+b,0);
    Object.keys(g).forEach(k => {
      g[k].count = Math.max(10, g[k].count + Math.round(netChange * (weights[k]||1) / total));
    });
  },

  socialMobility(G) {
    const g = G.population.groups;
    if (g.craftsmen.wellbeing > 70 && g.peasants.count > 1000) {
      const mobile = Math.floor(g.peasants.count * 0.003);
      g.peasants.count -= mobile; g.craftsmen.count += mobile;
    }
    if (G.laws.trade === 'free' && g.craftsmen.count > 500) {
      const mobile = Math.floor(g.craftsmen.count * 0.002);
      g.craftsmen.count -= mobile; g.merchants.count += mobile;
    }
    if (G.laws.education === 'universal' && g.craftsmen.count > 200) {
      const mobile = Math.floor(g.craftsmen.count * 0.001);
      g.craftsmen.count -= mobile; g.scholars.count += mobile;
    }
  },

  updateDemographics(G, births, deaths) {
    const d = G.population.demographics;
    d.male.children   += Math.floor(births * 0.5);
    d.female.children += Math.floor(births * 0.5);
    const totalDemo = (d.male.children+d.male.youngAdult+d.male.adult+d.male.elderly+
                       d.female.children+d.female.youngAdult+d.female.adult+d.female.elderly);
    if (totalDemo > 0) {
      ['male','female'].forEach(sex => {
        ['children','youngAdult','adult','elderly'].forEach(age => {
          const frac = d[sex][age] / totalDemo;
          d[sex][age] = Math.max(0, d[sex][age] - Math.floor(deaths * frac));
        });
      });
    }
    const ageRate = 1/180;
    ['male','female'].forEach(sex => {
      const ch2ya = Math.floor(d[sex].children * ageRate);
      const ya2a  = Math.floor(d[sex].youngAdult * ageRate);
      const a2e   = Math.floor(d[sex].adult * ageRate);
      d[sex].children   -= ch2ya; d[sex].youngAdult += ch2ya;
      d[sex].youngAdult -= ya2a;  d[sex].adult      += ya2a;
      d[sex].adult      -= a2e;   d[sex].elderly    += a2e;
      d[sex].elderly = Math.max(0, d[sex].elderly - Math.floor(d[sex].elderly * 0.01));
    });
  },

  recalcEmployment(G) {
    const g = G.population.groups;
    let buildingJobs = 0;
    Object.values(G.buildings).forEach(b => { buildingJobs += (b.workers || 0); });
    const privateJobs = G.population.privateJobsAvailable || 0;
    const totalJobs = buildingJobs + privateJobs;
    const totalWorkers = this.getWorkingAge(G);
    const empRate = Math.min(1, totalJobs / Math.max(1, totalWorkers));
    Object.keys(g).forEach(k => {
      g[k].employed = Math.floor(g[k].count * empRate * 0.9);
    });
    G.economy.employmentRate = Math.round(empRate * 100);
  },

  getTotal(G) {
    return Object.values(G.population.groups).reduce((s,g)=>s+g.count,0);
  },

  getWorkingAge(G) {
    const d = G.population.demographics;
    return d.male.youngAdult + d.male.adult + d.female.youngAdult + d.female.adult;
  },

  avgWellbeing(G) {
    const g = G.population.groups;
    let total = 0, count = 0;
    Object.values(g).forEach(gr => { total += gr.wellbeing * gr.count; count += gr.count; });
    return count > 0 ? total/count : 50;
  },

  updateWellbeing(G) {
    const g = G.population.groups;
    const foodRatio = G.resources.food / Math.max(1, this.getTotal(G) * 0.4);
    const foodWB = Math.min(30, foodRatio * 20);
    g.peasants.wellbeing   = Math.max(0,Math.min(100, 40 + foodWB + (G.laws.taxation==='minimal'?15:G.laws.taxation==='crushing'?-30:0) + (G.health.overallHealth-50)*0.2));
    g.craftsmen.wellbeing  = Math.max(0,Math.min(100, 50 + (g.craftsmen.employed/Math.max(1,g.craftsmen.count)*20) + (G.laws.labor==='guilds'?10:0)));
    g.merchants.wellbeing  = Math.max(0,Math.min(100, 55 + (G.laws.trade==='free'?20:G.laws.trade==='closed'?-15:5)));
    g.nobility.wellbeing   = Math.max(0,Math.min(100, 65 + (G.laws.land==='feudal'?15:-5) + (G.kingdom.prestige-50)*0.2));
    g.clergy.wellbeing     = Math.max(0,Math.min(100, 60 + (G.laws.religion==='orthodox'?15:G.laws.religion==='inquisition'?5:-10)));
    g.scholars.wellbeing   = Math.max(0,Math.min(100, 50 + (G.laws.education==='universal'?20:0) + (G.research.completed.length*2)));
  }
};
