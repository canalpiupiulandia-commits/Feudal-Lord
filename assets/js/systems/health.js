
// ===== HEALTH SYSTEM =====
const HealthSystem = {
  tick(G) {
    const isMonthEnd = (G.date.day === DAYS_PER_MONTH[G.date.month-1]);
    if (!isMonthEnd) return;
    this.updateHealthIndex(G);
    this.tickPlague(G);
    this.checkSpontaneousPlague(G);
  },
  updateHealthIndex(G) {
    const h = G.health;
    const pop = PopulationSystem.getTotal(G);
    const hospLevel = G.buildings.hospital?.level || 0;
    const hospCoverage = Math.min(80, hospLevel * 15);
    h.hospitalCoverage = hospCoverage;
    const foodRatio = Math.min(1, G.resources.food / (pop * 0.4));
    const waterSanitation = G.research.completed.includes('sanitation') ? 20 : 0;
    const herbalMed = G.research.completed.includes('herbal_medicine') ? 8 : 0;
    const surgery   = G.research.completed.includes('surgery') ? 6 : 0;
    const densityPenalty = pop > 20000 ? -10 : pop > 10000 ? -5 : 0;
    h.overallHealth = Math.max(5, Math.min(100,
      30 + hospCoverage*0.6 + foodRatio*25 + waterSanitation + herbalMed + surgery + densityPenalty
      - (h.plague ? h.plagueIntensity*0.3 : 0)
    ));
    h.diseases.malnutrition = Math.max(0, 20 - foodRatio*20);
    h.diseases.tuberculosis  = Math.max(0, 10 - hospCoverage*0.15);
    h.diseases.wounds        = Math.max(0, 5  - (surgery ? 3 : 0));
  },
  tickPlague(G) {
    const h = G.health;
    if (!h.plague) return;
    const quarantineResearch = G.research.completed.includes('quarantine') ? 0.5 : 1;
    const hospMod = 1 - (h.hospitalCoverage/100)*0.6;
    h.plagueIntensity += (2 * hospMod * quarantineResearch) - (h.plagueControl||0)*0.05;
    h.plagueIntensity = Math.max(0, Math.min(100, h.plagueIntensity));
    if (h.plagueIntensity <= 0) {
      h.plague = false; h.plagueIntensity = 0; h.lastPlagueYear = G.date.year;
      logEvent(G, '⚕️ A praga foi controlada e erradicada.', 'health');
      notify('A praga foi erradicada!', 'good');
    }
    const pop = PopulationSystem.getTotal(G);
    const plagueDeaths = Math.floor(pop * (h.plagueIntensity/100) * 0.004);
    if (plagueDeaths > 0) PopulationSystem.distributeChange(G, -plagueDeaths);
  },
  checkSpontaneousPlague(G) {
    const h = G.health;
    if (h.plague) return;
    const yearsSinceLast = G.date.year - h.lastPlagueYear;
    if (yearsSinceLast < 5) return;
    const chance = (h.overallHealth < 40 ? 0.02 : 0.005) * (yearsSinceLast / 20);
    if (Math.random() < chance) this.triggerPlague(G);
  },
  triggerPlague(G) {
    G.health.plague = true;
    G.health.plagueIntensity = 10;
    G.health.plagueControl = 5;
    logEvent(G, '💀 Uma praga eclodiu no reino!', 'disaster');
    EventSystem.queueEvent(G, 'plague_outbreak');
  }
};
