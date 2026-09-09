
// ===== RESEARCH SYSTEM =====
const ResearchSystem = {
  tick(G) {
    if (!G.research.currentTech) return;
    const tech = RESEARCH_TREE.find(t => t.id === G.research.currentTech);
    if (!tech) return;
    const scholars  = G.population.groups.scholars.count;
    const schoolLvl = G.buildings.school?.level || 0;
    const speedMod  = G.research.completed.includes('census') ? 1.1 : 1;
    const points = (1 + scholars*0.02 + schoolLvl*0.5) * speedMod;
    G.research.progress += points;
    if (G.research.progress >= tech.cost) this.complete(G, tech);
  },
  complete(G, tech) {
    G.research.completed.push(tech.id);
    G.research.currentTech = null;
    G.research.progress = 0;
    G.researchBonus = G.researchBonus || {};
    if (tech.effects) {
      Object.entries(tech.effects).forEach(([k,v]) => {
        if (k === 'stability')   G.kingdom.stability = Math.min(100, G.kingdom.stability + v);
        else if (k === 'income') G.economy.taxEfficiencyMod = (G.economy.taxEfficiencyMod||1) + v;
        else if (k === 'military') G.kingdom.military = (G.kingdom.military||50) + v;
        else G.researchBonus[k] = (G.researchBonus[k] || 0) + v;
      });
    }
    logEvent(G, `🔬 Pesquisa concluída: ${tech.name}`, 'research');
    notify(`Pesquisa concluída: ${tech.name}!`, 'good');
  },
  start(G, techId) {
    const tech = RESEARCH_TREE.find(t => t.id === techId);
    if (!tech || G.research.completed.includes(techId) || !this.prereqsMet(G, tech)) return false;
    G.research.currentTech = techId;
    G.research.progress = 0;
    notify(`Iniciando pesquisa: ${tech.name}`, 'good');
    return true;
  },
  prereqsMet(G, tech) { return tech.prereqs.every(p => G.research.completed.includes(p)); },
  getProgress(G) {
    if (!G.research.currentTech) return 0;
    const tech = RESEARCH_TREE.find(t=>t.id===G.research.currentTech);
    return tech ? Math.min(100, Math.round(G.research.progress/tech.cost*100)) : 0;
  }
};
