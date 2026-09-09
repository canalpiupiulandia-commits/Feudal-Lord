
// ============================================================
//  FEUDAL LORD - BUILDINGS DATA
// ============================================================
const BUILDINGS_DATA = {
  farm: {
    name:'Fazenda', icon:'🌾', category:'agri',
    desc:'Produz alimentos. Trabalhadores: camponeses.',
    maxLevel:5, upgradeCost:{ gold:200, wood:50, stone:20 },
    outputPerLevel:{ food:120 }, workersPerLevel:300, upkeepPerLevel:{ gold:8 }, resource:'food'
  },
  granary: {
    name:'Celeiro', icon:'🏠', category:'agri',
    desc:'Armazena alimentos, reduz perdas por safra ruim.',
    maxLevel:4, upgradeCost:{ gold:150, wood:80 },
    outputPerLevel:{ food_storage:500 }, workersPerLevel:50, upkeepPerLevel:{ gold:3 }, resource:'food'
  },
  pasture: {
    name:'Pasto', icon:'🐄', category:'agri',
    desc:'Gado fornece alimentos e couro.',
    maxLevel:4, upgradeCost:{ gold:180, wood:30 },
    outputPerLevel:{ food:50, cloth:10 }, workersPerLevel:80, upkeepPerLevel:{ gold:6 }, resource:'food'
  },
  lumber_mill: {
    name:'Madeireira', icon:'🪵', category:'industry',
    desc:'Produz madeira para construção e combustível.',
    maxLevel:5, upgradeCost:{ gold:250, stone:40 },
    outputPerLevel:{ wood:60 }, workersPerLevel:150, upkeepPerLevel:{ gold:10 }, resource:'wood'
  },
  mine: {
    name:'Mina', icon:'⛏️', category:'industry',
    desc:'Extrai ferro e pedra do subsolo.',
    maxLevel:5, upgradeCost:{ gold:400, wood:80 },
    outputPerLevel:{ iron:40, stone:30 }, workersPerLevel:180, upkeepPerLevel:{ gold:15 }, resource:'iron'
  },
  smithy: {
    name:'Ferraria', icon:'⚒️', category:'industry',
    desc:'Artesãos transformam ferro em ferramentas e armamentos.',
    maxLevel:4, upgradeCost:{ gold:350, iron:30, stone:20 },
    outputPerLevel:{ income:15 }, workersPerLevel:100, upkeepPerLevel:{ gold:12 }, resource:'iron'
  },
  mill: {
    name:'Moinho', icon:'⚙️', category:'industry',
    desc:'Processa grãos e amplia produção de tecidos.',
    maxLevel:3, upgradeCost:{ gold:200, wood:60, stone:30 },
    outputPerLevel:{ food:30, cloth:25 }, workersPerLevel:60, upkeepPerLevel:{ gold:5 }, resource:'food'
  },
  tannery: {
    name:'Curtume', icon:'🧵', category:'industry',
    desc:'Processa couro e fabrica tecidos.',
    maxLevel:3, upgradeCost:{ gold:280, wood:40 },
    outputPerLevel:{ cloth:40, income:10 }, workersPerLevel:80, upkeepPerLevel:{ gold:8 }, resource:'cloth'
  },
  market: {
    name:'Mercado', icon:'🏪', category:'services',
    desc:'Centro comercial. Aumenta renda e negócios privados.',
    maxLevel:5, upgradeCost:{ gold:300, wood:60, stone:40 },
    outputPerLevel:{ income:40 }, workersPerLevel:60, upkeepPerLevel:{ gold:8 }, resource:'gold'
  },
  school: {
    name:'Escola', icon:'📚', category:'services',
    desc:'Educa a população. Aumenta pesquisa e qualidade de mão de obra.',
    maxLevel:4, upgradeCost:{ gold:400, wood:50, cloth:20 },
    outputPerLevel:{ education:8 }, workersPerLevel:40, upkeepPerLevel:{ gold:20 }, resource:'education'
  },
  church: {
    name:'Igreja', icon:'⛪', category:'services',
    desc:'Mantém a estabilidade e moral da população.',
    maxLevel:4, upgradeCost:{ gold:350, stone:80, wood:30 },
    outputPerLevel:{ stability:3 }, workersPerLevel:40, upkeepPerLevel:{ gold:10 }, resource:'stability'
  },
  hospital: {
    name:'Hospital', icon:'🏥', category:'services',
    desc:'Reduz mortalidade e melhora saúde da população.',
    maxLevel:4, upgradeCost:{ gold:500, stone:60, cloth:30 },
    outputPerLevel:{ health:10 }, workersPerLevel:30, upkeepPerLevel:{ gold:25 }, resource:'health'
  },
  barracks: {
    name:'Quartel', icon:'🏰', category:'services',
    desc:'Treina soldados e protege o reino de rebeliões.',
    maxLevel:4, upgradeCost:{ gold:450, stone:100, iron:50 },
    outputPerLevel:{ military:15 }, workersPerLevel:100, upkeepPerLevel:{ gold:35 }, resource:'military'
  }
};
