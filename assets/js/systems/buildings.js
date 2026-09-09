
// ===== BUILDINGS SYSTEM =====
const BuildingSystem = {
  initialize(G) {
    Object.keys(BUILDINGS_DATA).forEach(type => {
      if (!G.buildings[type]) G.buildings[type] = { level:0, workers:0, upkeep:0 };
    });
  },
  getUpgradeCost(G, type) {
    const def = BUILDINGS_DATA[type];
    if (!def) return null;
    const lvl = G.buildings[type]?.level || 0;
    if (lvl >= def.maxLevel) return null;
    const multiplier = Math.pow(1.5, lvl);
    const cost = {};
    Object.entries(def.upgradeCost).forEach(([r,v]) => { cost[r] = Math.floor(v * multiplier); });
    return cost;
  },
  canUpgrade(G, type) {
    const cost = this.getUpgradeCost(G, type);
    if (!cost) return false;
    return Object.entries(cost).every(([r,v]) => (G.resources[r]||0) >= v);
  },
  upgrade(G, type) {
    if (!this.canUpgrade(G, type)) return false;
    const cost = this.getUpgradeCost(G, type);
    Object.entries(cost).forEach(([r,v]) => { G.resources[r] -= v; });
    const def = BUILDINGS_DATA[type];
    const bld = G.buildings[type];
    bld.level++;
    bld.workers = bld.level * (def.workersPerLevel || 100);
    bld.upkeep  = bld.level * (Object.values(def.upkeepPerLevel||{gold:8})[0] || 8);
    notify(`${def.name} melhorada para nível ${bld.level}!`, 'good');
    return true;
  },
  demolish(G, type) {
    const bld = G.buildings[type];
    if (!bld || bld.level === 0) return;
    bld.level = Math.max(0, bld.level - 1);
    bld.workers = bld.level * (BUILDINGS_DATA[type]?.workersPerLevel || 100);
    notify(`${BUILDINGS_DATA[type].name} rebaixada para nível ${bld.level}`, 'bad');
  },
  getTotalWorkers(G) { return Object.values(G.buildings).reduce((s,b)=>s+(b.workers||0),0); },
  getBuildingsByCategory(G) {
    const cats = { agri:[], industry:[], services:[] };
    Object.entries(BUILDINGS_DATA).forEach(([type,def]) => {
      cats[def.category]?.push({ type, def, bld:G.buildings[type]||{level:0,workers:0,upkeep:0} });
    });
    return cats;
  }
};
