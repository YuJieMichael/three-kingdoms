'use strict';
let cityArea='inner';
function cityPage(){return cityArea==='inner'?innerCityPage():outsideCityPage();}
function plotArt(type){
  if(HistoricalArt.buildings.ids.includes(type))return buildingIcon(type);
  const ground='<path d="M5 40L44 18 86 40 47 63Z" fill="#89976b"/><path d="M5 40v5l42 24 39-24v-5L47 63Z" fill="#566b48"/>';
  const content={
    farm:'<path d="M12 39l31-17 34 19-30 18Z" fill="#c0b477"/><path d="M20 39l28 16m-20-22l28 16m-20-22l28 16m-20-22l28 16" stroke="#748a43" stroke-width="4"/><path d="M25 35v-7m14 15v-8m14 14v-9" stroke="#e2d38a" stroke-width="2"/>',
    lumber:'<g fill="#365c44" stroke="#96b68a" stroke-width=".7"><path d="M30 6L16 30h8l-12 16h36L36 30h8Z"/><path d="M58 13L45 34h7L42 48h32L64 34h7Z"/></g><path d="M30 46v7m28-5v7" stroke="#c3b18a" stroke-width="4"/><path d="M61 55l12-7 7 5-12 7Z" fill="#c6b588"/>',
    quarry:'<g fill="#b4bbaa" stroke="#728677" stroke-width="1"><path d="M17 45l4-22 16-10 19 19-3 21Z"/><path d="M43 48l9-26 15-6 15 23-4 14Z"/></g><path d="M21 23l19 13 16-4m-16 4l-3 17m15-31l11 14 19 3" fill="none" stroke="#879686" stroke-width="2"/><path d="M62 58l8-4 8 6-9 4Z" fill="#d0d1b8"/>',
    mine:'<path d="M13 47l12-26 17-9 25 26-5 18Z" fill="#897f6c"/><path d="M32 23l16 18-3 13H27V35Z" fill="#293f32"/><path d="M26 29v27m23-20v23M24 29l28 8" stroke="#c0a57b" stroke-width="4"/><path d="M57 50l18-8 9 8-6 9-17 3Z" fill="#a48563"/><circle cx="65" cy="62" r="4" fill="#324b3b"/><circle cx="78" cy="57" r="4" fill="#324b3b"/><path d="M61 46l5-6 6 3 4-6 5 10" fill="#d1af79"/>',
    empty:'<path d="M22 41l3-6m8 12l2-8m28 6l-2-7m-13 18l2-5" stroke="#aec291" stroke-width="2"/><path d="M38 29h16m-8-8v16" stroke="#d4dbb9" stroke-width="2"/>',
    locked:'<path d="M37 38v-8a9 9 0 0118 0v8" fill="none" stroke="#9ba88b" stroke-width="3"/><rect x="34" y="36" width="24" height="18" rx="3" fill="#637958" stroke="#9ba88b"/><circle cx="46" cy="44" r="2" fill="#ccd0b0"/>'
  };
  return `<svg viewBox="0 0 92 74" aria-hidden="true">${ground}${content[type]||content.empty}</svg>`;
}
function outsideCityPage(){
  const s=S(),unlocked=Game.unlockedPlots(),used=s.plots.filter(p=>p.type).length;
  return `<div class="page-head"><div><h2>青溪城 · 城外</h2><p class="sub">点击地块建设或升级，四种资源田自由搭配。</p></div><span class="badge">已用 ${used} / ${unlocked} 块</span></div>
  <div class="allocation">${Object.entries(Game.plotTypes).map(([type,cfg])=>{const plots=s.plots.filter(p=>p.type===type),gain=plots.reduce((sum,p)=>sum+Game.plotYield(p),0);return `<div class="allocation-item ${type}"><span class="allocation-glyph">${resourceIcon(cfg.resource,'')}</span><div><strong>${Game.resources[cfg.resource].name}</strong><p>${plots.length} 块 · <span data-plot-rate="${type}">+${Math.round(gain*60)}/时</span></p></div></div>`;}).join('')}</div>
  <div class="layout outskirts-layout"><section class="outskirts-board"><div class="outskirts-banner"><span class="outskirts-title">青溪城外 · 田庄图</span><span class="label">官府 ${s.buildings.hall} 级 · 已开放 ${unlocked} / ${Game.PLOT_COUNT}</span></div><div class="plot-grid">${s.plots.map((p,index)=>{
    const locked=index>=unlocked,job=Game.plotJob(index),name=locked?'待开垦':p.type?Game.buildings[p.type].name:'空地';
    return `<button class="plot-tile ${locked?'locked-land':p.type||'empty-land'} ${job?'working':''}" data-action="plot" data-id="${index}" aria-label="${index+1}号地块 ${name}${p.type?' '+p.level+'级':''}${job?' 施工中':''}"><span class="plot-index">${String(index+1).padStart(2,'0')}</span>${job?'<span class="plot-work">工</span>':''}${plotArt(locked?'locked':p.type)}<strong>${name}${p.type&&!locked?'<em>Lv.'+p.level+'</em>':''}</strong><small>${locked?'官府 '+(Math.floor((index-12)/3)+2)+' 级开放':job?`${job.kind==='replace'?'改建':'营造'} · ${clock(job.end)}`:p.type?`+${Math.round(Game.plotYield(p)*60)}/时`:'点击建造'}</small></button>`;
  }).join('')}</div><div class="outskirts-note">可重复建设同一种产业 · 同一块地独立升级 · 城内城外共用建造队</div></section>
  <aside class="city-side">${classicQueuePanel()}</aside></div>`;
}
function plotModal(index){
  Game.tick();
  if(index>=Game.unlockedPlots()){
    const hallLevel=Math.floor((index-12)/3)+2;
    showModal(`待开垦 · ${index+1} 号地块`,`<p class="sub">官府达到 ${hallLevel} 级后开放。每升一级官府，新增 3 块可建设土地。</p>`,btn('关闭','close','','secondary')+btn('查看官府','plotHall'));
    return;
  }
  const p=S().plots[index],job=Game.plotJob(index);
  if(job){showModal(`施工中 · ${index+1} 号地块`,`<p class="sub">${Game.buildings[job.id].name} · ${job.kind==='replace'?'改建至':job.kind==='build'?'新建':'升级至'} ${job.level} 级</p><div class="notice" style="margin-top:16px">${clock(job.end,job.start)}</div>${p.type?`<p class="hint">原${Game.buildings[p.type].name}继续生产，完工后切换。</p>`:''}`,btn('返回田庄','close','','secondary')+speedupQueueButton('build',job)+btn('取消施工','manualCancelAsk','plot:'+index,'danger'));return;}
  const current=p.type?Game.buildings[p.type]:null;
  const upgradingLocked=p.type&&(!!Game.buildingRequirements(p.type,p.level+1)||p.level>=10||S().buildQueue.length>=Game.buildLimit()||!Game.canPay(Game.plotCost(index,p.type)));
  showModal(`${index+1} 号地块 · ${current?current.name:'空地'}`,`${current?`<p class="sub">${current.desc}</p><div class="modal-info"><span>${p.level} 级 · 当前产量（含加成与劳动系数）</span><strong>+${Math.round(Game.plotYield(p)*60)}<span class="label"> /时</span></strong></div>${p.level<10?`<p class="label">升级至 ${p.level+1} 级</p>${costs(Game.plotCost(index,p.type))}${Game.buildingRuleText(p.type,p.level+1)?`<p class="hint">前置：${esc(Game.buildingRuleText(p.type,p.level+1))}</p>`:''}${Game.buildingRequirements(p.type,p.level+1)?`<p class="notice">需要 ${esc(Game.buildingRequirements(p.type,p.level+1))}</p>`:''}<p class="hint">产量提高至 +${Math.round(Game.plotYield({type:p.type,level:p.level+1})*60)}/时 · ${duration(Game.plotTime(index,p.type))}</p>${btn('升级这块资源田','plotPlan',`${index}:${p.type}`,'block',upgradingLocked)}`:'<div class="notice">此资源田已满级。</div>'}<div class="divider"></div>`:'<p class="sub">选择一种资源产业。其他地块仍可选择相同类型。</p>'}<p class="label">${current?'改建为其他产业 · 新产业从 1 级开始':'建造资源产业'}</p><div class="plot-options">${Object.entries(Game.plotTypes).filter(([type])=>type!==p.type).map(([type,cfg])=>`<button data-action="plotPlan" data-id="${index}:${type}">${buildingIcon(type)}<strong>${Game.buildings[type].name}</strong><small>1 级 · +${Math.round(Game.plotYield({type,level:1})*60)}/时</small></button>`).join('')}</div>`,btn('返回田庄','close','','secondary'));
}
function plotPlan(index,type){
  const p=S().plots[index],same=p.type===type,replace=!!p.type&&!same,level=same?p.level+1:1,b=Game.buildings[type],cost=Game.plotCost(index,type),required=Game.buildingRequirements(type,level);
  showModal(`${same?'升级':replace?'改建':'建设'} · ${b.name}`,`<p class="sub">${index+1} 号地块${p.type?' · 当前为 '+Game.buildings[p.type].name+' '+p.level+' 级':''}</p><div class="modal-info"><span>完工产量 · ${level} 级</span><strong>+${Math.round(Game.plotYield({type,level})*60)}<span class="label"> /时</span></strong></div><p class="hint">${b.desc}</p><div class="enemy-list">${recordDetails(Game.buildRecord(type,level))}</div>${costs(cost)}${Game.buildingRuleText(type,level)?`<p class="hint">前置：${esc(Game.buildingRuleText(type,level))}</p>`:''}${required?`<p class="notice">需要 ${esc(required)}</p>`:''}<p class="hint">施工时间 ${duration(Game.plotTime(index,type))}</p>${replace?'<div class="notice">新产业从 1 级开始，施工完成前原产业继续生产。</div>':''}`,btn('重新选择','plot',String(index),'secondary')+btn(same?'确认升级':replace?'确认改建':'开始建设','plotDevelop',`${index}:${type}`,'',!!required||!Game.canPay(cost)||S().buildQueue.length>=Game.buildLimit()));
}

document.addEventListener('click',event=>{
  const el=event.target.closest('[data-action]');if(!el||el.disabled)return;
  const action=el.dataset.action,id=el.dataset.id;
  if(action==='cityArea'){cityArea=id;render();window.scrollTo({top:0,behavior:'smooth'});}
  if(action==='plot')plotModal(Number(id));
  if(action==='plotPlan'){const [index,type]=id.split(':');plotPlan(Number(index),type);}
  if(action==='plotDevelop'){const [index,type]=id.split(':');if(actResult(Game.developPlot(Number(index),type),'建造队已前往城外'))modal.close();}
  if(action==='plotHall'){cityArea='inner';page='city';render();buildingModal('hall');}
});
