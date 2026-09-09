
// ============================================================
//  FEUDAL LORD - UI RENDERER
// ============================================================

function renderAll() {
  if (!G) return;
  renderTopBar();
  switch(currentPanel) {
    case 'overview':   renderOverview();   break;
    case 'population': renderPopulation(); break;
    case 'economy':    renderEconomy();    break;
    case 'buildings':  renderBuildings();  break;
    case 'research':   renderResearch();   break;
    case 'laws':       renderLaws();       break;
    case 'council':    renderCouncil();    break;
    case 'health':     renderHealth();     break;
    case 'intrigues':  renderIntrigues();  break;
    case 'events':     renderEventLog();   break;
  }
}

function renderTopBar() {
  const pop = PopulationSystem.getTotal(G);
  const goldDelta = G.resources.gold - prevGold;
  const popDelta  = pop - prevPop;
  document.getElementById('tb-kingdom').textContent   = G.kingdom.name;
  document.getElementById('tb-gold').textContent      = fmt(G.resources.gold);
  document.getElementById('tb-food').textContent      = fmt(G.resources.food);
  document.getElementById('tb-pop').textContent       = fmt(pop);
  document.getElementById('tb-gdp').textContent       = fmt(G.economy.gdp);
  document.getElementById('tb-stability').textContent = pct(G.kingdom.stability);
  document.getElementById('tb-prestige').textContent  = fmt(G.kingdom.prestige);
  const goldDEl = document.getElementById('tb-gold-delta');
  goldDEl.className = 'tb-delta '+(goldDelta>=0?'pos':'neg');
  goldDEl.textContent = fmtS(goldDelta);
  const popDEl = document.getElementById('tb-pop-delta');
  popDEl.className = 'tb-delta '+(popDelta>=0?'pos':'neg');
  popDEl.textContent = popDelta!==0 ? fmtS(popDelta) : '';
  document.getElementById('date-display').textContent =
    `${G.date.day} ${MONTHS[G.date.month-1]} ${G.date.year}`;
}

function renderOverview() {
  const pop = PopulationSystem.getTotal(G);
  const net = G.economy.monthlyNet;
  document.getElementById('overview-stats').innerHTML = [
    card('Estabilidade',pct(G.kingdom.stability),bar(G.kingdom.stability,100,'bar-green'),'Reino'),
    card('Prestígio',fmt(G.kingdom.prestige),bar(Math.min(G.kingdom.prestige,200),200,'bar-gold'),'Monarquia'),
    card('Legitimidade',pct(G.kingdom.legitimacy),bar(G.kingdom.legitimacy,100,'bar-purple'),'Direito ao Trono'),
    card('Saúde Geral',pct(G.health.overallHealth),bar(G.health.overallHealth,100,'bar-red'),'População'),
    card('Empregabilidade',pct(G.economy.employmentRate),bar(G.economy.employmentRate,100,'bar-blue'),'Total'),
    card('Dívida',fmt(G.kingdom.debt),'','Real'),
    card('Pesquisa','',bar(ResearchSystem.getProgress(G),100,'bar-purple'),G.research.currentTech||'Nenhuma'),
    card('Militar',pct(G.kingdom.military),bar(G.kingdom.military,100,'bar-red'),'Força')
  ].join('');
  document.getElementById('overview-econ').innerHTML =
    flowRow('Impostos mensais', G.economy.lastMonthTax, true)+
    flowRow('Comércio privado', G.economy.lastMonthPrivate, true)+
    flowRow('Despesas mensais', -(G.economy.lastMonthExpenses?.total||0))+
    flowRow('SALDO MENSAL', net, true, true)+
    `<div class="mt-8 text-dim" style="font-size:11px">PIB anualizado: <b class="text-gold">${fmt(G.economy.gdp)}</b> mo</div>`;
  const alerts = [];
  if (G.resources.food < pop*0.2) alerts.push(alertBox('⚠️ Fome iminente - alimentos insuficientes!', 'red'));
  if (G.kingdom.stability < 30)   alerts.push(alertBox('⚠️ Estabilidade crítica - risco de revolta!', 'red'));
  if (G.kingdom.debt > 3000)      alerts.push(alertBox('⚠️ Dívida real elevada - juros aumentando.', 'orange'));
  if (G.health.plague)            alerts.push(alertBox('💀 PRAGA ATIVA - intensidade: '+pct(G.health.plagueIntensity), 'red'));
  if (G.intrigues.activeConspiracies.filter(c=>c.discovered).length)
    alerts.push(alertBox('🕷 Conspirações descobertas aguardam ação!', 'purple'));
  if (!alerts.length) alerts.push(alertBox('✅ Nenhum alerta crítico no momento.', 'green'));
  document.getElementById('overview-alerts').innerHTML = alerts.join('');
  document.getElementById('overview-log').innerHTML = (G.log||[]).slice(0,15).map(l=>
    `<div style="padding:4px 0;border-bottom:1px solid #1a1208;font-size:12px">
      <span class="text-dim">${l.date}</span> &mdash; ${l.msg}
    </div>`
  ).join('') || '<div class="text-dim" style="font-size:12px">Nenhum evento registrado.</div>';
}

function card(title,val,extra='',sub='') {
  return `<div class="card"><div class="card-title">${title}</div><div class="card-value">${val}</div>${extra}<div class="card-sub">${sub}</div></div>`;
}
function flowRow(label,amount,positive,bold=false) {
  const cls = amount>0?'pos':'neg';
  return `<div class="econ-flow">
    <span class="label${bold?' bold':''}">${label}</span>
    <span class="amount ${cls}${bold?' bold':''}">${fmtS(amount)}</span></div>`;
}
function alertBox(msg,color='red') {
  const colors={red:'var(--red)',orange:'var(--orange)',green:'var(--green)',purple:'var(--purple)'};
  return `<div style="padding:7px 10px;border-left:3px solid ${colors[color]||colors.red};background:var(--bg-card);margin-bottom:5px;font-size:12px">${msg}</div>`;
}

function renderPopulation() {
  const groups = [];
  Object.entries(G.population.groups).forEach(([k,g])=>{
    const def = POP_GROUPS[k];
    const empPct = Math.min(100, Math.round(g.employed/Math.max(1,g.count)*100));
    groups.push(`<div class="pop-group">
      <div class="pop-icon">${def.icon}</div>
      <div class="pop-info">
        <div class="pop-name">${def.name}</div>
        <div class="pop-count">${fmt(g.count)} pessoas &bull; Riqueza: ${g.wealth}mo</div>
      </div>
      <div class="pop-bars" style="min-width:160px">
        <div class="pop-bar-label"><span>Bem-estar</span><span>${pct(g.wellbeing)}</span></div>
        ${bar(g.wellbeing,100,'bar-green')}
        <div class="pop-bar-label"><span>Emprego</span><span>${pct(empPct)}</span></div>
        ${bar(empPct,100,'bar-blue')}
      </div>
    </div>`);
  });
  document.getElementById('pop-groups').innerHTML = groups.join('');
  const d = G.population.demographics;
  const totalM = Object.values(d.male).reduce((a,b)=>a+b,0);
  const totalF = Object.values(d.female).reduce((a,b)=>a+b,0);
  let censusHtml = `<div class="census-section"><div class="census-title">👨 Homens (${fmt(totalM)})</div><div class="demo-bar-wrap">`;
  AGE_GROUPS.forEach(ag=>{
    const v = d.male[ag.key]||0;
    const p = totalM>0?Math.round(v/totalM*100):0;
    censusHtml+=`<div class="demo-row"><div class="demo-label">${ag.label.split('(')[0]}</div>
      <div class="demo-bar"><div class="demo-fill" style="width:${p}%;background:${ag.color}"></div></div>
      <div class="demo-num">${fmt(v)}</div></div>`;
  });
  censusHtml += '</div></div>';
  censusHtml += `<div class="census-section"><div class="census-title">👩 Mulheres (${fmt(totalF)})</div><div class="demo-bar-wrap">`;
  AGE_GROUPS.forEach(ag=>{
    const v = d.female[ag.key]||0;
    const p = totalF>0?Math.round(v/totalF*100):0;
    censusHtml+=`<div class="demo-row"><div class="demo-label">${ag.label.split('(')[0]}</div>
      <div class="demo-bar"><div class="demo-fill" style="width:${p}%;background:${ag.color}"></div></div>
      <div class="demo-num">${fmt(v)}</div></div>`;
  });
  censusHtml += '</div></div>';
  document.getElementById('pop-census').innerHTML = censusHtml;
  document.getElementById('pop-vitals').innerHTML =
    `<div class="health-stat"><span>Nascimentos último mês</span><span class="text-green">+${fmt(G.population.lastMonthBirths||0)}</span></div>`+
    `<div class="health-stat"><span>Mortes último mês</span><span class="text-red">-${fmt(G.population.lastMonthDeaths||0)}</span></div>`+
    `<div class="health-stat"><span>Saldo natural</span><span class="${(G.population.lastMonthBirths-G.population.lastMonthDeaths)>=0?'text-green':'text-red'}">${fmtS((G.population.lastMonthBirths||0)-(G.population.lastMonthDeaths||0))}</span></div>`+
    `<div class="health-stat"><span>Vagas emprego privado</span><span class="text-gold">${fmt(G.population.privateJobsAvailable||0)}</span></div>`+
    `<div class="health-stat"><span>Em idade laboral</span><span>${fmt(PopulationSystem.getWorkingAge(G))}</span></div>`+
    `<div class="health-stat"><span>Taxa de empreg.</span><span>${pct(G.economy.employmentRate)}</span></div>`;
}

function renderEconomy() {
  const res = G.resources;
  document.getElementById('econ-cards').innerHTML = [
    card('Tesouro',fmt(res.gold)+'mo',bar(Math.min(res.gold,20000),20000),'Real'),
    card('PIB Anual',fmt(G.economy.gdp)+'mo','','Estimado'),
    card('Saldo Mensal',(G.economy.monthlyNet>=0?'+':'')+fmt(G.economy.monthlyNet)+'mo','',G.economy.monthlyNet>=0?'Superavit':'Deficit'),
    card('Dívida',fmt(G.kingdom.debt)+'mo',bar(Math.min(G.kingdom.debt,10000),10000,'bar-red'),G.kingdom.debt>0?'Juros 5%/ano':'Sem dívida')
  ].join('');
  document.getElementById('econ-resources').innerHTML = Object.entries(RESOURCES).map(([k,def])=>{
    const v = res[k]||0;
    return `<div class="res-row"><div class="res-icon">${def.icon}</div>
      <div class="res-name">${def.name}</div>
      <div class="res-amount">${fmt(v)} <span class="text-dim">${def.unit}</span></div></div>`;
  }).join('');
  document.getElementById('econ-income').innerHTML =
    flowRow('Impostos', G.economy.lastMonthTax, true)+
    flowRow('Comércio privado', G.economy.lastMonthPrivate, true)+
    `<div style="font-size:11px;color:var(--text-dim);margin-top:6px">Taxa fiscal: <b>${G.laws.taxation}</b></div>`;
  const exp = G.economy.lastMonthExpenses||{};
  document.getElementById('econ-expenses').innerHTML =
    flowRow('Manutenção construções', -(exp.upkeep||0))+
    flowRow('Salários do Conselho', -(exp.councilWages||0))+
    flowRow('Despesas militares', -(exp.militaryExp||0))+
    flowRow('Pagamento dívida', -(exp.debtPayment||0))+
    `<hr class="separator">`+
    flowRow('TOTAL DESPESAS', -(exp.total||0), false, true);
  document.getElementById('econ-private').innerHTML =
    `<div class="health-stat"><span>Negócios de mercadores</span><span class="text-gold">${fmt(G.population.groups.merchants.count*0.8)} empregos</span></div>`+
    `<div class="health-stat"><span>PIB privado anual</span><span class="text-gold">${fmt(G.economy.privateJobsGDP||0)} mo</span></div>`+
    `<div class="health-stat"><span>Preço alimentos</span><span>${G.economy.prices?.food||10} mo/t</span></div>`+
    `<div class="health-stat"><span>Preço madeira</span><span>${G.economy.prices?.wood||8} mo/m³</span></div>`+
    `<div class="health-stat"><span>Preço ferro</span><span>${G.economy.prices?.iron||15} mo/t</span></div>`;
}

function renderBuildings() {
  const cats = BuildingSystem.getBuildingsByCategory(G);
  ['agri','industry','services'].forEach(cat=>{
    const id = {agri:'buildings-agri',industry:'buildings-industry',services:'buildings-services'}[cat];
    document.getElementById(id).innerHTML = cats[cat].map(({type,def,bld})=>{
      const cost = BuildingSystem.getUpgradeCost(G,type);
      const canUp = BuildingSystem.canUpgrade(G,type);
      const atMax = bld.level >= def.maxLevel;
      let costStr = cost ? Object.entries(cost).map(([r,v])=>`${RESOURCES[r]?.icon||'?'}${fmt(v)}`).join(' ') : '';
      const outputStr = Object.entries(def.outputPerLevel||{}).map(([r,v])=>`${RESOURCES[r]?.icon||'⭐'}+${v*bld.level}/mês`).join(' ');
      return `<div class="building-card">
        <div style="display:flex;align-items:center;gap:8px">
          <span style="font-size:24px">${def.icon}</span>
          <div><div class="b-name">${def.name}</div>
          <div class="b-level">Nível ${bld.level}/${def.maxLevel}</div></div>
        </div>
        ${bar(bld.level,def.maxLevel,'bar-gold')}
        <div class="b-output text-dim">${bld.level>0?outputStr:'Não construído'}</div>
        <div class="b-workers">👤 ${fmt(bld.workers||0)} trabalhadores &bull; Upkeep: ${bld.upkeep||0}mo/m</div>
        <div class="text-dim" style="font-size:11px">${def.desc}</div>
        <div class="build-actions">
          ${atMax
            ? '<span class="tag tag-green">Nível Máximo</span>'
            : `<button class="btn btn-gold" ${canUp?'':'disabled'} onclick="BuildingSystem.upgrade(G,'${type}');renderAll()">↑ Melhorar${costStr?' ('+costStr+')':''}</button>`}
          ${bld.level>0?`<button class="btn btn-danger" onclick="BuildingSystem.demolish(G,'${type}');renderAll()">↓</button>`:''}
        </div>
      </div>`;
    }).join('');
  });
}

function renderResearch() {
  let curHtml = '';
  if (G.research.currentTech) {
    const tech = RESEARCH_TREE.find(t=>t.id===G.research.currentTech);
    const prog = ResearchSystem.getProgress(G);
    curHtml = `<div class="card">
      <div class="card-title">PESQUISANDO AGORA</div>
      <div class="card-value">${tech.icon} ${tech.name}</div>
      <div class="card-sub">${tech.desc}</div>
      ${bar(prog,100,'bar-purple')}
      <div class="card-sub mt-8">${prog}% concluído</div>
      <button class="btn btn-danger mt-8" onclick="G.research.currentTech=null;G.research.progress=0;renderAll()">Cancelar</button>
    </div>`;
  } else {
    curHtml = '<div class="card"><div class="card-title">PESQUISA</div><div class="card-sub text-dim">Nenhuma pesquisa ativa. Selecione uma tecnologia abaixo.</div></div>';
  }
  document.getElementById('research-current').innerHTML = curHtml;
  let catHtml = '';
  Object.entries(RESEARCH_CATEGORIES).forEach(([catId,cat])=>{
    const techs = RESEARCH_TREE.filter(t=>t.cat===catId);
    catHtml += `<div class="section-h" style="color:${cat.color}">${cat.icon} ${cat.name}</div>
    <div class="grid-3 mb-16">${techs.map(tech=>{
      const done = G.research.completed.includes(tech.id);
      const current = G.research.currentTech===tech.id;
      const canDo = ResearchSystem.prereqsMet(G,tech);
      let cls = 'tech-card'+(done?' completed':current?' researching':canDo?'':' locked');
      const onclick = done||current||!canDo ? '' : `ResearchSystem.start(G,'${tech.id}');renderAll()`;
      return `<div class="${cls}" onclick="${onclick}">
        <div class="tech-name">${tech.icon} ${tech.name} ${done?'✅':current?'⏳':''}</div>
        <div class="tech-desc">${tech.desc}</div>
        <div class="tech-cost">🔬 ${tech.cost} pts</div>
        ${tech.prereqs.length?`<div class="text-dim" style="font-size:10px">Requer: ${tech.prereqs.join(', ')}</div>`:''}
        ${!canDo&&!done?'<div style="color:var(--red);font-size:11px">Bloqueado</div>':''}
      </div>`;
    }).join('')}</div>`;
  });
  document.getElementById('research-categories').innerHTML = catHtml;
}

function renderLaws() {
  let html = '';
  Object.entries(LAW_DEFS).forEach(([cat,def])=>{
    html += `<div class="law-category card">
      <div class="law-name">📜 ${def.name}</div>
      <div class="law-desc">${def.desc}</div>
      <div class="law-options">`;
    Object.entries(def.options).forEach(([optId,opt])=>{
      const active = G.laws[cat]===optId;
      html += `<button class="law-opt ${active?'active':''}" onclick="LawSystem.enact(G,'${cat}','${optId}');renderAll()">
        ${opt.name}
        <div style="font-size:10px;opacity:.7">${opt.desc}</div>
      </button>`;
    });
    html += '</div></div>';
  });
  document.getElementById('laws-grid').innerHTML = html;
}

function renderCouncil() {
  let html = '<div class="grid-2">';
  G.council.forEach(c=>{
    const roleDef = COUNCIL_ROLES[c.role];
    html += `<div class="councillor-card">
      <div class="councillor-portrait">${c.icon||roleDef?.icon||'👤'}</div>
      <div class="councillor-info">
        <div class="c-name">${c.name}</div>
        <div class="c-role">${roleDef?.name||c.role} &bull; ${c.age} anos</div>
        <div class="c-stats">
          <div class="c-stat">🔱 Habilidade: <span>${c.skill}</span></div>
          <div class="c-stat">${c.loyalty>70?'❤️':c.loyalty>40?'🟡':'🔴'} Lealdade: <span>${pct(c.loyalty)}</span></div>
        </div>
        <div class="c-loyalty">${bar(c.loyalty,100,c.loyalty>70?'bar-green':c.loyalty>40?'bar-gold':'bar-red')}</div>
        <div class="mt-8">${c.traits.map(t=>`<span class="tag tag-blue" style="margin-right:4px">${t}</span>`).join('')}</div>
        <div class="text-dim mt-8" style="font-size:11px">${roleDef?.task||''}</div>
        <button class="btn mt-8" style="font-size:11px" onclick="CouncilSystem.replaceCouncillor(G,'${c.role}');renderAll()">🔄 Substituir</button>
      </div>
    </div>`;
  });
  html += '</div>';
  html += `<div class="section-h mt-16">💵 Investimento no Conselho</div>
  <div class="card"><div class="card-sub">Custo mensal: <b class="text-gold">${fmt(G.council.length*50)} mo</b></div></div>`;
  document.getElementById('council-grid').innerHTML = html;
}

function renderHealth() {
  const h = G.health;
  document.getElementById('health-infra').innerHTML =
    `<div class="health-stat"><span>Hospitais (nível ${G.buildings.hospital?.level||0})</span><span class="text-gold">${G.buildings.hospital?.level>0?'Ativo':'❌ Não construído'}</span></div>`+
    `<div class="health-stat"><span>Saneamento</span><span>${G.research.completed.includes('sanitation')?'✅ Pesquisado':'❌ Não'}</span></div>`+
    `<div class="health-stat"><span>Medicina herbal</span><span>${G.research.completed.includes('herbal_medicine')?'✅':'❌'}</span></div>`+
    `<div class="health-stat"><span>Cirurgia medieval</span><span>${G.research.completed.includes('surgery')?'✅':'❌'}</span></div>`+
    `<div class="health-stat"><span>Quarentena</span><span>${G.research.completed.includes('quarantine')?'✅':'❌'}</span></div>`;
  document.getElementById('health-indices').innerHTML =
    `<div class="health-stat"><span>Saúde geral</span><span>${pct(h.overallHealth)}</span></div>`+
    `${bar(h.overallHealth,100,h.overallHealth>60?'bar-green':h.overallHealth>30?'bar-gold':'bar-red')}`+
    `<div class="health-stat mt-8"><span>Estado da praga</span><span class="${h.plague?'text-red':'text-green'}">${h.plague?'💀 ATIVA ('+pct(h.plagueIntensity)+')':'✅ Nenhuma'}</span></div>`+
    `${h.plague?bar(h.plagueIntensity,100,'bar-red'):''}` +
    `<div class="health-stat"><span>Última praga</span><span>Ano ${h.lastPlagueYear}</span></div>`;
  document.getElementById('health-outbreaks').innerHTML = h.plague
    ? `<div class="intrigue-card" style="border-color:var(--red)">
        <div class="intrigue-title">💀 PRAGA ATIVA</div>
        <div class="intrigue-desc">Intensidade: ${pct(h.plagueIntensity)}</div>
        <button class="btn btn-danger mt-8" onclick="G.health.plagueControl=Math.min(100,(G.health.plagueControl||0)+20);G.resources.gold=Math.max(0,G.resources.gold-300);notify('Recursos enviados!','good');renderAll()">Enviar médicos (-300 mo)</button>
       </div>`
    : '<div class="text-dim">Nenhum surto ativo. Invista em hospitais e pesquisa médica.</div>';
  document.getElementById('health-mortality').innerHTML =
    Object.entries(h.diseases||{}).map(([d,v])=>
      `<div class="health-stat"><span>${d}</span><span class="${v>10?'text-red':v>5?'text-gold':'text-green'}">${v}/1000</span></div>`
    ).join('');
}

function renderIntrigues() {
  const active = G.intrigues.activeConspiracies;
  const discovered = active.filter(p=>p.discovered);
  const undiscovered = active.filter(p=>!p.discovered);
  let html = '';
  if (active.length === 0) {
    html = '<div class="text-dim">Nenhuma conspiração ativa. Seu reino está estável.</div>';
  } else {
    discovered.forEach(p=>{
      const pct2 = Math.min(100,Math.round(p.progress));
      html += `<div class="intrigue-card" style="border-color:var(--red)">
        <div class="intrigue-title">${p.icon} ${p.name} <span class="tag tag-red">DESCOBERTA</span></div>
        <div class="intrigue-desc">${p.desc}<br><b>Instigador:</b> ${p.instigator}</div>
        ${bar(pct2,100,'bar-red')}
        <div class="text-dim" style="font-size:11px">Progresso: ${pct2}% &bull; Perigo: ${p.danger}%</div>
        <div class="flex gap-8 mt-8">
          <button class="btn btn-danger" onclick="IntrigueSystem.crushPlot(G,${p.id});renderAll()">⚔️ Esmagar (-${p.danger*5}mo)</button>
          <button class="btn" onclick="IntrigueSystem.negotiatePlot(G,${p.id});renderAll()">🤝 Negociar (-${p.danger*3}mo)</button>
        </div></div>`;
    });
    if (undiscovered.length) {
      html += `<div class="intrigue-card"><div class="intrigue-title">❓ ${undiscovered.length} conspiração(es) não descoberta(s)</div>
        <div class="intrigue-desc">Seu espião-mor pode revelar conspirações. Melhore a rede de espiões.</div></div>`;
    }
  }
  document.getElementById('intrigues-active').innerHTML = html;
  document.getElementById('intrigues-spy').innerHTML =
    `<div class="card"><div class="card-title">REDE DE ESPIÕES</div>
    <div class="card-value">${pct(G.intrigues.spyNetwork)}</div>
    ${bar(G.intrigues.spyNetwork,100,'bar-purple')}
    <div class="card-sub">Espião-Mor: ${G.council.find(c=>c.role==='spymaster')?.name||'N/A'}</div>
    <button class="btn btn-gold mt-8" onclick="IntrigueSystem.investInSpies(G);renderAll()">🕷 Investir na rede (-100mo)</button>
    </div>`;
  let loyHtml = '';
  G.council.forEach(c=>{
    loyHtml+=`<div class="health-stat"><span>${c.name}</span><span class="${c.loyalty>70?'text-green':c.loyalty>40?'text-gold':'text-red'}">${pct(c.loyalty)}</span></div>`;
  });
  document.getElementById('intrigues-loyalty').innerHTML = loyHtml;
}

function renderEventLog() {
  const log = G.log || [];
  document.getElementById('events-log').innerHTML = log.length
    ? log.map(l=>{
        const colors = {research:'var(--blue)',event:'var(--gold)',law:'var(--purple)',council:'var(--teal)',
          intrigue:'var(--red)',disaster:'var(--red)',health:'var(--green)',start:'var(--gold)'};
        const color = colors[l.type]||'var(--text-dim)';
        return `<div style="padding:8px;border-left:3px solid ${color};margin-bottom:6px;background:var(--bg-card)">
          <div style="font-size:11px;color:var(--text-dim)">${l.date}</div>
          <div style="font-size:13px">${l.msg}</div>
        </div>`;
      }).join('')
    : '<div class="text-dim">Nenhum evento registrado ainda.</div>';
}
