
// ============================================================
//  FEUDAL LORD - EVENTS DATA
// ============================================================
const EVENTS_POOL = [
  { id:'bountiful_harvest', title:'Colheita Abundante', type:'Agricultura', icon:'🌾',
    weight:10, triggerCondition: g => g.date.month === 9,
    desc:'As colheitas de outono superaram todas as expectativas. Os celeiros transbordam de grãos e o povo celebra nas ruas.',
    options:[
      { text:'Distribuir parte aos pobres', effect:{ food:-200, stability:+8, peasants_wellbeing:+10 }, desc:'+8 estabilidade' },
      { text:'Armazenar tudo para o inverno', effect:{ food:+500, stability:-2 }, desc:'+500 alimentos' },
      { text:'Vender o excedente', effect:{ gold:+300, food:+100 }, desc:'+300 ouro' }
    ]
  },
  { id:'bad_harvest', title:'Safra Ruim', type:'Crise', icon:'🌧️',
    weight:8, triggerCondition: g => g.date.month === 9 && Math.random()<0.35,
    desc:'Geadas precoces e chuvas excessivas destruíram grande parte da colheita. O povo teme a fome no inverno.',
    options:[
      { text:'Abrir os celeiros reais', effect:{ food:-400, stability:+5, peasants_wellbeing:+8 }, desc:'Gasta reservas' },
      { text:'Importar alimentos (caro)', effect:{ gold:-500, food:+300 }, desc:'-500 ouro' },
      { text:'Racionamento forçado', effect:{ stability:-10, health:-5 }, desc:'Povo sofre' }
    ]
  },
  { id:'drought', title:'Grande Seca', type:'Desastre', icon:'☀️',
    weight:4, triggerCondition: g => g.date.month >= 6 && g.date.month <= 8,
    desc:'Meses sem chuva secaram os rios e campos. A produção agrícola caiu drasticamente.',
    options:[
      { text:'Ordenar escavação de poços', effect:{ gold:-200, wood:-50 }, desc:'Investimento caro' },
      { text:'Rezar por chuva', effect:{ stability:+5, piety:+10 }, desc:'Moral sobe' },
      { text:'Realocar trabalhadores', effect:{ peasants:+2 }, desc:'Minimiza danos' }
    ]
  },
  { id:'noble_petition', title:'Petição da Nobreza', type:'Político', icon:'⛜️',
    weight:8, triggerCondition: g => g.population.groups.nobility.count > 250,
    desc:'Um grupo de nobres influentes exige maiores privilégios e isenções fiscais.',
    options:[
      { text:'Conceder privilégios', effect:{ nobility_wellbeing:+20, income:-0.1, stability:-3 }, desc:'Nobreza feliz' },
      { text:'Negar e manter leis', effect:{ nobility_wellbeing:-15, stability:-5 }, desc:'Nobreza furiosa' },
      { text:'Negociar compromisso', effect:{ nobility_wellbeing:+5, income:-0.05, stability:+2 }, desc:'Equilíbrio' }
    ]
  },
  { id:'merchants_guild', title:'Liga dos Mercadores', type:'Econômico', icon:'🏤',
    weight:6, triggerCondition: g => g.population.groups.merchants.count > 400,
    desc:'Os mercadores propõem criar uma Liga Comercial com poderes de autorregulação.',
    options:[
      { text:'Aprovar a Liga', effect:{ merchants:+0.15, income:+0.1, nobility_wellbeing:-8 }, desc:'Mercadores crescem' },
      { text:'Recusar categoricamente', effect:{ merchants_wellbeing:-15, income:-0.05 }, desc:'Comércio cai' },
      { text:'Criar uma Liga Real (controlada)', effect:{ merchants:+0.08, income:+0.05, stability:+3 }, desc:'Crescimento moderado' }
    ]
  },
  { id:'peasant_revolt', title:'Revolta Camponesa', type:'Crise', icon:'⚔️',
    weight:6, triggerCondition: g => g.kingdom.stability < 35 || g.population.groups.peasants.wellbeing < 30,
    desc:'Camponeses armados marcham rumo ao castelo gritando por justiça.',
    options:[
      { text:'Esmagar a revolta pela força', effect:{ stability:-5, peasants:-300, military:-5 }, desc:'Violento mas rápido' },
      { text:'Negociar com os líderes', effect:{ stability:+5, taxation:'moderate', peasants_wellbeing:+15 }, desc:'Concessões' },
      { text:'Prisão dos líderes + reformas', effect:{ stability:-3, peasants_wellbeing:+8, prestige:+5 }, desc:'Meio-termo' }
    ]
  },
  { id:'foreign_ambassador', title:'Embaixador Estrangeiro', type:'Diplomacia', icon:'🗺️',
    weight:7, triggerCondition: g => g.daysSinceStart > 90,
    desc:'Um embaixador do reino vizinho propõe um tratado comercial.',
    options:[
      { text:'Aceitar o tratado', effect:{ income:+0.12, stability:+3 }, desc:'+12% receita' },
      { text:'Negociar melhores termos', effect:{ income:+0.06, prestige:+8 }, desc:'+prestígio' },
      { text:'Recusar diplomaticamente', effect:{}, desc:'Sem mudanças' }
    ]
  },
  { id:'scholar_discovery', title:'Descoberta Científica', type:'Pesquisa', icon:'📚',
    weight:5, triggerCondition: g => g.population.groups.scholars.count > 80,
    desc:'Um sábio da corte fez uma descoberta extraordinária. Ele pede patrocínio real.',
    options:[
      { text:'Financiar a pesquisa', effect:{ gold:-150, research_speed:+0.2, scholars_wellbeing:+10 }, desc:'Pesquisa acelera' },
      { text:'Compartilhar com monastério', effect:{ piety:+10, research_speed:+0.1 }, desc:'Fé e ciência' },
      { text:'Ignorar', effect:{ scholars_wellbeing:-10 }, desc:'Oportunidade perdida' }
    ]
  },
  { id:'plague_outbreak', title:'Surto de Praga', type:'Saúde', icon:'💀',
    weight:3, triggerCondition: g => g.health.overallHealth < 50 && !g.health.plague,
    desc:'Uma doença misteriosa se espalha nas aldeias do reino.',
    options:[
      { text:'Quarentena imediata', effect:{ population_loss:0.03, stability:-8, plague_control:+40 }, desc:'Isola mas assusta' },
      { text:'Enviar médicos e remédios', effect:{ gold:-300, health:+10, plague_control:+20 }, desc:'Humanitário' },
      { text:'Rezar e esperar', effect:{ population_loss:0.08, stability:-15, piety:+5 }, desc:'Tragédia' }
    ]
  },
  { id:'religious_festival', title:'Grande Festival Religioso', type:'Cultural', icon:'✝️',
    weight:8, triggerCondition: g => g.date.month === 12,
    desc:'O Natal se aproxima e o povo pede que o Rei financie as celebrações.',
    options:[
      { text:'Festival grandioso (caro)', effect:{ gold:-200, stability:+12, piety:+8, prestige:+5 }, desc:'Muito prestígio' },
      { text:'Festival simples', effect:{ gold:-80, stability:+5, piety:+4 }, desc:'Econômico' },
      { text:'Deixar o Clero organizar', effect:{ clergy_wellbeing:+10, stability:+3 }, desc:'Clero feliz' }
    ]
  },
  { id:'fire_district', title:'Incêndio no Distrito', type:'Desastre', icon:'🔥',
    weight:4, triggerCondition: g => Math.random() < 0.02,
    desc:'Um incêndio devastador consumiu vários armazéns e oficinas na cidade.',
    options:[
      { text:'Reconstrução imediata com recursos reais', effect:{ gold:-400, wood:-100, stability:-3 }, desc:'Caro mas rápido' },
      { text:'Tributação especial', effect:{ stability:-8, income:+0.05 }, desc:'Povo paga' },
      { text:'Deixar a população reconstruir', effect:{ stability:-5, craftsmen:+0.05 }, desc:'Orgânico' }
    ]
  },
  { id:'gold_vein', title:'Veio de Ouro Descoberto', type:'Fortuna', icon:'💰',
    weight:3, triggerCondition: g => g.buildings.mine && g.buildings.mine.level >= 2,
    desc:'Mineiros descobriram um rico veio de ouro nas profundezas da mina real.',
    options:[
      { text:'Explorar imediatamente', effect:{ gold:+800, iron:-50 }, desc:'Riqueza rápida' },
      { text:'Explorar com cuidado', effect:{ gold:+400, research_speed:+0.05 }, desc:'Seguro e lucrativo' },
      { text:'Guardar segredo, explorar depois', effect:{ gold:+600, prestige:+10 }, desc:'Estratégico' }
    ]
  },
  { id:'council_dispute', title:'Disputa no Conselho', type:'Político', icon:'⚖️',
    weight:6, triggerCondition: g => g.daysSinceStart > 60,
    desc:'O Chanceler e o Tesoureiro chegaram às vias de fato.',
    options:[
      { text:'Apoiar o Chanceler', effect:{ chancellor_loyalty:+15, steward_loyalty:-20 }, desc:'Diplomacia' },
      { text:'Apoiar o Tesoureiro', effect:{ steward_loyalty:+15, chancellor_loyalty:-20 }, desc:'Finanças' },
      { text:'Mediação real', effect:{ prestige:+8 }, desc:'Equilíbrio' }
    ]
  }
];
