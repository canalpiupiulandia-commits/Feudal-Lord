
// ============================================================
//  FEUDAL LORD - CONSTANTS
// ============================================================
const MONTHS = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho',
  'Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'];
const DAYS_PER_MONTH = [31,28,31,30,31,30,31,31,30,31,30,31];

const POP_GROUPS = {
  peasants:  { name:'Camponeses', icon:'🌾', desc:'Agricultores e servos da gleba. Muitos = mais mão de obra.' },
  craftsmen: { name:'Artesãos',   icon:'🔨', desc:'Ferreiros, carpinteiros, tecedores. Produzem bens.' },
  merchants: { name:'Mercadores', icon:'🏪', desc:'Comerciantes. Criam vagas de emprego ao expandir negócios.' },
  nobility:  { name:'Nobreza',    icon:'⚜️',  desc:'Senhores feudais. Alta renda, financiam o reino.' },
  clergy:    { name:'Clero',      icon:'✝️',  desc:'Padres e freiras. Fornecem estabilidade e saúde.' },
  scholars:  { name:'Intelectuais',icon:'📚', desc:'Sábios e cientistas. Aceleram pesquisas.' }
};

const AGE_GROUPS = [
  { key:'children',   label:'Crianças (0-14)',     color:'#5c9e5c' },
  { key:'youngAdult', label:'Jovens (15-29)',       color:'#5c7e9e' },
  { key:'adult',      label:'Adultos (30-59)',      color:'#9e7e5c' },
  { key:'elderly',    label:'Idosos (60+)',         color:'#7e5c7e' }
];

const RESOURCES = {
  gold:      { name:'Ouro',          icon:'💰', unit:'mo' },
  food:      { name:'Alimentos',     icon:'🌾', unit:'t' },
  wood:      { name:'Madeira',       icon:'🪵', unit:'m³' },
  stone:     { name:'Pedra',         icon:'🪨', unit:'t' },
  iron:      { name:'Ferro',         icon:'⚙️',  unit:'t' },
  cloth:     { name:'Tecido',        icon:'🧵', unit:'r' },
  education: { name:'Educação',      icon:'📚', unit:'pt' }
};

const LAW_DEFS = {
  taxation: {
    name: 'Regime Fiscal',
    desc: 'Quanto a população paga em impostos',
    options: {
      minimal:  { name:'Mínimo',    effect:{ stability:+5,  income:-0.6 }, desc:'Muito populares, mas tesouro sofre' },
      moderate: { name:'Moderado',  effect:{ stability: 0,  income: 0   }, desc:'Equilíbrio entre renda e aprovação' },
      heavy:    { name:'Pesado',    effect:{ stability:-8,  income:+0.4 }, desc:'Mais receita, menos aprovação popular' },
      crushing: { name:'Esmagador', effect:{ stability:-20, income:+0.8 }, desc:'Máxima receita, risco de revolta' }
    }
  },
  labor: {
    name: 'Lei do Trabalho',
    desc: 'Como os trabalhadores são organizados',
    options: {
      serfdom:    { name:'Servidão',       effect:{ peasants:+10, merchants:-5, education:-5 }, desc:'Camponeses presos à terra' },
      guilds:     { name:'Guildas',        effect:{ craftsmen:+10, merchants:+5              }, desc:'Associações de artesãos regulam trabalho' },
      free_labor: { name:'Trabalho Livre', effect:{ merchants:+15, stability:+5, wages:+10  }, desc:'Trabalhadores escolhem empregador' }
    }
  },
  land: {
    name: 'Posse de Terra',
    desc: 'Quem controla as terras do reino',
    options: {
      feudal:  { name:'Feudal',  effect:{ nobility:+10, peasants:-5  }, desc:'Terra pertence à nobreza' },
      royal:   { name:'Real',    effect:{ income:+10,   stability:-5 }, desc:'Coroa controla as terras' },
      commons: { name:'Comunal', effect:{ peasants:+15, food:+10     }, desc:'Comunidades gerem próprias terras' }
    }
  },
  religion: {
    name: 'Política Religiosa',
    desc: 'Relação do estado com a religião',
    options: {
      orthodox:    { name:'Ortodoxa',   effect:{ clergy:+10, stability:+5  }, desc:'Igreja tem papel central' },
      tolerant:    { name:'Tolerante',  effect:{ merchants:+8, scholars:+5 }, desc:'Liberdade religiosa' },
      inquisition: { name:'Inquisição', effect:{ stability:-10, loyalty:+15 }, desc:'Caça heresias' }
    }
  },
  succession: {
    name: 'Lei de Sucessão',
    desc: 'Como o próximo rei é escolhido',
    options: {
      primogeniture: { name:'Primogenitura', effect:{ stability:+10 }, desc:'Filho mais velho herda' },
      elective:      { name:'Eletiva',       effect:{ nobility:+10, stability:-5 }, desc:'Nobreza elege o rei' },
      agnatic:       { name:'Agnática',      effect:{ legitimacy:+10 }, desc:'Apenas homens da linhagem real' }
    }
  },
  trade: {
    name: 'Política Comercial',
    desc: 'Regulação do comércio no reino',
    options: {
      closed:    { name:'Fechado',   effect:{ merchants:-10, stability:+5 }, desc:'Protecionismo estrito' },
      regulated: { name:'Regulado',  effect:{ merchants:+5,  income:+5   }, desc:'Taxas sobre comércio externo' },
      free:      { name:'Livre',     effect:{ merchants:+20, income:+15  }, desc:'Mercado aberto e livre' }
    }
  },
  education: {
    name: 'Sistema Educacional',
    desc: 'Como o conhecimento é transmitido',
    options: {
      clergy:    { name:'Eclesiástica', effect:{ clergy:+5,   education:-2   }, desc:'Mostéiros educam poucos' },
      guilds:    { name:'Guildas',      effect:{ craftsmen:+8, education:+5  }, desc:'Mestre-aprendiz nas guildas' },
      universal: { name:'Universal',   effect:{ scholars:+15, education:+15 }, desc:'Escolas para todos' }
    }
  },
  military: {
    name: 'Organização Militar',
    desc: 'Como o exército é formado',
    options: {
      levy:         { name:'Levas',        effect:{ income:-5,  stability:+5 }, desc:'Camponeses convocados' },
      professional: { name:'Profissional', effect:{ income:-15, loyalty:+10 }, desc:'Soldados pagos e treinados' },
      mercenary:    { name:'Mercenária',   effect:{ income:-25, strength:+20 }, desc:'Guerreiros contratados' }
    }
  }
};

const COUNCIL_ROLES = {
  chancellor:  { name:'Chanceler',      icon:'📜', skill:'Diplomacia', task:'Negocia tratados e leis' },
  marshal:     { name:'Marechal',       icon:'⚔️',  skill:'Comando',    task:'Lidera o exército' },
  steward:     { name:'Tesoureiro',     icon:'💰', skill:'Gestão',     task:'Administra as finanças' },
  spymaster:   { name:'Espião-Mor',     icon:'🕵', skill:'Intriga',    task:'Gerencia a rede de espiões' },
  priest:      { name:'Bispo da Corte', icon:'✝️',  skill:'Fé',         task:'Mantém a aprovação religiosa' }
};

const NOTIF_DURATION = 4000;
