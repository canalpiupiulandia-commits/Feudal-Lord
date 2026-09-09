
// ===== LAWS SYSTEM =====
const LawSystem = {
  enact(G, category, option) {
    if (!LAW_DEFS[category]) return false;
    if (!LAW_DEFS[category].options[option]) return false;
    const current = G.laws[category];
    if (current === option) return false;
    const stabilityHit = -6;
    G.kingdom.stability = Math.max(0, G.kingdom.stability + stabilityHit);
    G.laws[category] = option;
    const def = LAW_DEFS[category].options[option];
    if (def.effect) {
      if (def.effect.stability) G.kingdom.stability = Math.min(100, G.kingdom.stability + def.effect.stability);
    }
    logEvent(G, `📜 Lei alterada: ${LAW_DEFS[category].name} → ${def.name}`, 'law');
    notify(`Lei promulgada: ${def.name}`, 'good');
    return true;
  },
  getActiveEffects(G) {
    const effects = {};
    Object.entries(G.laws).forEach(([cat, opt]) => {
      const def = LAW_DEFS[cat]?.options[opt];
      if (def?.effect) Object.entries(def.effect).forEach(([k,v]) => { effects[k] = (effects[k]||0) + v; });
    });
    return effects;
  }
};
