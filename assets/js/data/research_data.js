
// ============================================================
//  FEUDAL LORD - RESEARCH TREE
// ============================================================
const RESEARCH_TREE = [
  { id:'crop_rotation',    name:'Rotação de Culturas',    cat:'agriculture', icon:'🌱', cost:80,  prereqs:[], desc:'Campos descansam alternadamente, +20% produtividade.', effects:{ food:+0.2 } },
  { id:'irrigation',       name:'Sistema de Irrigação',   cat:'agriculture', icon:'💧', cost:150, prereqs:['crop_rotation'], desc:'Canais levam água aos campos áridos.', effects:{ food:+0.3 } },
  { id:'plow_steel',       name:'Arado de Aço',           cat:'agriculture', icon:'⚒️', cost:200, prereqs:['crop_rotation','smelting'], desc:'Arado de ferro para solos duros.', effects:{ food:+0.25 } },
  { id:'windmill',         name:'Moinho de Vento',        cat:'agriculture', icon:'⚙️', cost:250, prereqs:['irrigation'], desc:'Energia eólica para moer grãos.', effects:{ food:+0.15 } },
  { id:'fertilizer',       name:'Adubação Natural',       cat:'agriculture', icon:'🌿', cost:300, prereqs:['irrigation'], desc:'Uso de esterco e compostos.', effects:{ food:+0.35 } },
  { id:'smelting',         name:'Fundição Básica',         cat:'industry',   icon:'🔥', cost:100, prereqs:[], desc:'Técnicas de fundição melhoram extração de metais.', effects:{ iron:+0.2 } },
  { id:'advanced_smelting',name:'Fundição Avançada',      cat:'industry',   icon:'⚙️', cost:220, prereqs:['smelting'], desc:'Fornos de alta temperatura.', effects:{ iron:+0.4 } },
  { id:'logging',          name:'Extração Eficiente',     cat:'industry',   icon:'🪵', cost:80,  prereqs:[], desc:'Técnicas de derrubada e transporte.', effects:{ wood:+0.25 } },
  { id:'carpentry',        name:'Carpintaria Avançada',   cat:'industry',   icon:'🪺', cost:160, prereqs:['logging'], desc:'Mestres carpinteiros reduzem desperdício.', effects:{ wood:+0.2 } },
  { id:'textile',          name:'Manufatura Têxtil',      cat:'industry',   icon:'🧵', cost:180, prereqs:[], desc:'Teares melhorados aumentam produção de tecidos.', effects:{ cloth:+0.4 } },
  { id:'bureaucracy',      name:'Burocracia Real',        cat:'governance', icon:'📜', cost:120, prereqs:[], desc:'Coletores de impostos eficientes.', effects:{ tax_efficiency:+0.15 } },
  { id:'census',           name:'Recenseamento',          cat:'governance', icon:'📊', cost:150, prereqs:['bureaucracy'], desc:'Contagem da população melhora planejamento.', effects:{ tax_efficiency:+0.1 } },
  { id:'codified_laws',    name:'Leis Codificadas',       cat:'governance', icon:'⚖️', cost:200, prereqs:['bureaucracy'], desc:'Leis escritas reduzem corrupção.', effects:{ stability:+8 } },
  { id:'professional_army',name:'Exército Profissional',  cat:'governance', icon:'⚔️', cost:300, prereqs:['codified_laws'], desc:'Soldados pagos e treinados.', effects:{ military:+20 } },
  { id:'herbal_medicine',  name:'Medicina Herbal',        cat:'medicine',   icon:'🌿', cost:80,  prereqs:[], desc:'Ervas medicinais reduzem mortalidade.', effects:{ health:+8 } },
  { id:'surgery',          name:'Cirurgia Medieval',      cat:'medicine',   icon:'🩹', cost:150, prereqs:['herbal_medicine'], desc:'Cirurgiões salvam vidas em batalha.', effects:{ health:+10 } },
  { id:'quarantine',       name:'Quarentena',             cat:'medicine',   icon:'🏠', cost:200, prereqs:['herbal_medicine'], desc:'Isolar doentes reduz epidemias.', effects:{ plague_resistance:+0.4 } },
  { id:'sanitation',       name:'Saneamento Básico',       cat:'medicine',   icon:'🚰', cost:250, prereqs:['surgery'], desc:'Aquedutos e esgotos reduzem doenças.', effects:{ health:+15 } },
  { id:'trade_routes',     name:'Rotas Comerciais',       cat:'commerce',   icon:'🗺️', cost:120, prereqs:[], desc:'Rotas seguras com reinos vizinhos.', effects:{ income:+0.15 } },
  { id:'banking',          name:'Bancos Medievais',       cat:'commerce',   icon:'🏦', cost:250, prereqs:['trade_routes'], desc:'Casas bancárias permitem crédito.', effects:{ income:+0.2, private_business:+0.25 } },
  { id:'guilds_org',       name:'Organização de Guildas', cat:'commerce',   icon:'🤝', cost:180, prereqs:['trade_routes'], desc:'Guildas regulamentadas aumentam artesanato.', effects:{ craftsmen:+0.2, income:+0.1 } },
  { id:'market_economy',   name:'Economia de Mercado',   cat:'commerce',   icon:'📈', cost:350, prereqs:['banking','guilds_org'], desc:'Mercado livre e câmbio sofisticado.', effects:{ income:+0.3, merchants:+0.25 } }
];

const RESEARCH_CATEGORIES = {
  agriculture: { name:'Agricultura', icon:'🌾', color:'#27ae60' },
  industry:    { name:'Indústria',   icon:'⚒️',  color:'#e67e22' },
  governance:  { name:'Governança', icon:'👑', color:'#8e44ad' },
  medicine:    { name:'Medicina',   icon:'⚕️', color:'#c0392b' },
  commerce:    { name:'Comércio',   icon:'💰', color:'#f39c12' }
};
