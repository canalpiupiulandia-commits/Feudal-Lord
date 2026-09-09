
// ===== INTRIGUES SYSTEM =====
const PLOT_TYPES = [
  { id:'noble_plot',    name:'Conspiração Nobre',       icon:'💀', danger:40, desc:'Um grupo de nobres conspira para limitar o poder real.' },
  { id:'assassination', name:'Complô de Assassinato',   icon:'🗡️', danger:80, desc:'Alguém planeja attentar contra sua vida.' },
  { id:'tax_evasion',   name:'Evasão Fiscal',           icon:'💸', danger:20, desc:'Mercadores ricos ocultam rendimentos do fisco.' },
  { id:'heresy',        name:'Heresia',                  icon:'✝️',  danger:30, desc:'Um movimento herético ganha seguidores.' },
  { id:'coup_attempt',  name:'Tentativa de Golpe',       icon:'⚔️',  danger:90, desc:'Membros do conselho tramam tomar o trono.' }
];

const IntrigueSystem = {
  tick(G, dayOfYear) {
    const isMonthEnd = (G.date.day === DAYS_PER_MONTH[G.date.month-1]);
    if (!isMonthEnd) return;
    if (Math.random() < 0.15 && G.intrigues.activeConspiracies.length < 5) this.generatePlot(G);
    G.intrigues.activeConspiracies.forEach(p => {
      p.progress += p.growthRate * (1 - G.intrigues.spyNetwork/200);
      if (p.progress >= 100) this.plotSucceeds(G, p);
    });
    this.detectPlots(G);
    G.intrigues.spyNetwork = Math.max(0, G.intrigues.spyNetwork - 0.5);
  },

  generatePlot(G) {
    const stability = G.kingdom.stability;
    const plotPool = PLOT_TYPES.filter(p => {
      if (p.id === 'coup_attempt' && stability > 60) return false;
      if (p.id === 'assassination' && stability > 70) return false;
      return true;
    });
    const type = plotPool[Math.floor(Math.random()*plotPool.length)];
    const instigators = ['Lorde Mortimer','Barão Gregor','Mestre Aldric','Condessa Vera','Bispo Wulfric','Sir Marcus'];
    G.intrigues.activeConspiracies.push({
      id: Date.now(), type: type.id, name: type.name, icon: type.icon, danger: type.danger, desc: type.desc,
      instigator: instigators[Math.floor(Math.random()*instigators.length)],
      progress: 0, growthRate: 3 + Math.floor(Math.random()*5), discovered: false, startYear: G.date.year
    });
  },

  detectPlots(G) {
    const spySkill = CouncilSystem.getBonus(G,'spymaster');
    const detectionChance = (spySkill / 200) + (G.intrigues.spyNetwork / 500);
    G.intrigues.activeConspiracies.forEach(p => {
      if (!p.discovered && Math.random() < detectionChance) {
        p.discovered = true;
        logEvent(G, `🕷 Conspiração descoberta: ${p.name} (${p.instigator})`, 'intrigue');
        notify(`Espião revelou: ${p.name}!`, 'bad');
      }
    });
  },

  crushPlot(G, plotId) {
    const idx = G.intrigues.activeConspiracies.findIndex(p=>p.id===plotId);
    if (idx<0) return;
    const plot = G.intrigues.activeConspiracies[idx];
    const cost = Math.floor(plot.danger * 5);
    if (G.resources.gold < cost) { notify(`Ouro insuficiente! Precisa de ${cost}.`, 'bad'); return; }
    G.resources.gold -= cost;
    G.intrigues.activeConspiracies.splice(idx,1);
    G.intrigues.discoveredPlots.push({ ...plot, resolved:'crushed', resolvedYear:G.date.year });
    G.kingdom.prestige += 5;
    logEvent(G, `⚔️ Conspiração esmagada: ${plot.name}`, 'intrigue');
    notify('Conspiração esmagada!', 'good');
  },

  negotiatePlot(G, plotId) {
    const idx = G.intrigues.activeConspiracies.findIndex(p=>p.id===plotId);
    if (idx<0) return;
    const plot = G.intrigues.activeConspiracies[idx];
    const cost = Math.floor(plot.danger * 3);
    if (G.resources.gold < cost) { notify(`Ouro insuficiente! Precisa de ${cost}.`, 'bad'); return; }
    G.resources.gold -= cost;
    G.kingdom.stability = Math.max(0, G.kingdom.stability - 5);
    G.intrigues.activeConspiracies.splice(idx,1);
    logEvent(G, `⚖️ Acordo com conspiradores: ${plot.name}`, 'intrigue');
    notify('Complô resolvido por negociação', 'good');
  },

  plotSucceeds(G, plot) {
    const idx = G.intrigues.activeConspiracies.indexOf(plot);
    if (idx>=0) G.intrigues.activeConspiracies.splice(idx,1);
    if (plot.type === 'tax_evasion')   G.economy.taxEfficiencyMod = Math.max(0.5, (G.economy.taxEfficiencyMod||1) - 0.1);
    if (plot.type === 'noble_plot')    G.kingdom.stability = Math.max(0, G.kingdom.stability - 15);
    if (plot.type === 'coup_attempt')  G.kingdom.stability = Math.max(0, G.kingdom.stability - 25);
    if (plot.type === 'heresy')        G.kingdom.piety = Math.max(0, (G.kingdom.piety||50) - 20);
    if (plot.type === 'assassination') { G.kingdom.legitimacy = Math.max(0, G.kingdom.legitimacy - 30); G.kingdom.prestige = Math.max(0, G.kingdom.prestige - 20); }
    logEvent(G, `💥 Conspiração bem-sucedida: ${plot.name}!`, 'disaster');
    notify(`${plot.name} teve sucesso! Consequências graves.`, 'bad');
  },

  investInSpies(G) {
    const cost = 100;
    if (G.resources.gold < cost) { notify('Ouro insuficiente!', 'bad'); return; }
    G.resources.gold -= cost;
    G.intrigues.spyNetwork = Math.min(100, G.intrigues.spyNetwork + 10);
    notify('Rede de espionagem reforçada!', 'good');
  }
};
