
// ===== EVENTS SYSTEM =====
const EventSystem = {
  tick(G, dayOfYear) {
    const isMonthEnd = (G.date.day === DAYS_PER_MONTH[G.date.month-1]);
    if (!isMonthEnd) return;
    if (G.events.queue.length > 0) return;
    this.checkTriggers(G);
  },

  checkTriggers(G) {
    EVENTS_POOL.forEach(ev => {
      if (G.events.history.some(h=>h.id===ev.id && h.year===G.date.year)) return;
      try {
        if (ev.triggerCondition && ev.triggerCondition(G)) {
          const chance = (ev.weight || 5) / 100;
          if (Math.random() < chance) this.queueEvent(G, ev.id);
        }
      } catch(e){}
    });
  },

  queueEvent(G, eventId) {
    if (G.events.queue.includes(eventId)) return;
    G.events.queue.push(eventId);
    if (G.events.queue.length === 1) this.showNextEvent(G);
  },

  showNextEvent(G) {
    if (G.events.queue.length === 0) return;
    const id = G.events.queue[0];
    const ev = EVENTS_POOL.find(e=>e.id===id);
    if (!ev) { G.events.queue.shift(); return; }
    G._pausedForEvent = true;
    showEventModal(ev, G);
  },

  resolve(G, eventId, optionIndex) {
    const ev = EVENTS_POOL.find(e=>e.id===eventId);
    if (!ev) return;
    const opt = ev.options[optionIndex];
    if (!opt) return;
    this.applyEffects(G, opt.effect || {});
    G.events.history.push({ id:eventId, title:ev.title, year:G.date.year, month:G.date.month, chosenOption:opt.text });
    logEvent(G, `📣 ${ev.title}: ${opt.text}`, 'event');
    G.events.queue.shift();
    G._pausedForEvent = false;
    hideEventModal();
    if (G.events.queue.length > 0) setTimeout(()=>this.showNextEvent(G), 500);
  },

  applyEffects(G, effects) {
    if (effects.gold)               G.resources.gold     = Math.max(0,G.resources.gold + effects.gold);
    if (effects.food)               G.resources.food     = Math.max(0,G.resources.food + (typeof effects.food==='number'&&Math.abs(effects.food)<1 ? G.resources.food*effects.food : effects.food));
    if (effects.stability)          G.kingdom.stability  = Math.min(100, Math.max(0, G.kingdom.stability + effects.stability));
    if (effects.prestige)           G.kingdom.prestige   = Math.min(200, Math.max(0, G.kingdom.prestige  + effects.prestige));
    if (effects.piety)              G.kingdom.piety      = (G.kingdom.piety||50) + effects.piety;
    if (effects.income)             G.economy.taxEfficiencyMod = (G.economy.taxEfficiencyMod||1) + effects.income;
    if (effects.research_speed)     G.research.speedBonus = (G.research.speedBonus||1) + effects.research_speed;
    if (effects.population_loss)    PopulationSystem.distributeChange(G, -Math.floor(PopulationSystem.getTotal(G)*effects.population_loss));
    if (effects.plague_control)     G.health.plagueControl = (G.health.plagueControl||0) + effects.plague_control;
    if (effects.health)             G.health.overallHealth = Math.min(100, G.health.overallHealth + effects.health);
    if (effects.peasants)           G.population.groups.peasants.count += effects.peasants;
    if (effects.nobility_wellbeing) G.population.groups.nobility.wellbeing  += effects.nobility_wellbeing;
    if (effects.peasants_wellbeing) G.population.groups.peasants.wellbeing  += effects.peasants_wellbeing;
    if (effects.merchants_wellbeing)G.population.groups.merchants.wellbeing += effects.merchants_wellbeing;
    if (effects.scholars_wellbeing) G.population.groups.scholars.wellbeing  += effects.scholars_wellbeing;
    if (effects.clergy_wellbeing)   G.population.groups.clergy.wellbeing    += effects.clergy_wellbeing;
    if (effects.chancellor_loyalty) { const c=G.council.find(x=>x.role==='chancellor'); if(c) c.loyalty+=effects.chancellor_loyalty; }
    if (effects.steward_loyalty)    { const c=G.council.find(x=>x.role==='steward');    if(c) c.loyalty+=effects.steward_loyalty; }
    if (effects.taxation)           G.laws.taxation = effects.taxation;
  }
};
