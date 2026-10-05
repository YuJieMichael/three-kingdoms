'use strict';
let cityArea='inner';
function cityPage(){return cityArea==='inner'?innerCityPage():outsideCityPage();}
function plotArt(type,level=1,index=0,working=false){
  const tier=Math.max(1,Math.min(3,Math.ceil(level/3))),seed=landscapeSeed(index,level);
  const ground='<path d="M3 72L72 31 157 72 87 114Z" fill="#5c6b43"/><path d="M3 72v6l84 42 70-42v-6l-70 42Z" fill="#354931"/><path d="M7 72l65-37 80 37-65 37Z" fill="#90906a"/>';
  let detail='';
  if(type==='farm'){
    detail='<path d="M12 72l58-32 48 25-59 35Z" fill="#9d8d57"/><path d="M18 72l57 28m-46-35l56 28m-45-34l56 28m-45-34l55 27" stroke="#6d713e" stroke-width="5"/><path d="M17 78l54-31m-41 38l52-31m-39 37l50-30" stroke="#c7b675" stroke-width="2"/><path d="M11 78L68 43 119 69" fill="none" stroke="#73988a" stroke-width="3"/>'+landscapeRoof(123,54,.65);
    if(tier>1)detail+='<path d="M73 100L112 78 144 94 105 115Z" fill="#a49760"/><path d="M80 100l29 14m-17-21l29 15m-17-22l29 15" stroke="#748449" stroke-width="4"/>';
    if(tier>2)detail+='<path d="M120 46v-13l9-5 10 6v14l-9 6Z" fill="#a69d76"/><path d="M116 34l13-11 15 13Z" fill="#4f5b45"/>';
  }else if(type==='lumber'){
    detail='<path d="M8 73L72 39 146 77 86 107Z" fill="#697550"/>';
    for(let i=0;i<3+tier;i++)detail+=landscapeTree(24+(seed+i*29)%96,47+(i%2)*19,.8+(i%3)*.13);
    detail+='<path d="M83 87l29-16 29 13-29 17Z" fill="#a6986c"/><path d="M92 87l20 10m-11-16l19 10m-11-16l19 10" stroke="#61563c" stroke-width="4"/><path d="M87 86l25-14m-17 19l26-14" stroke="#c8b48a" stroke-width="3"/>'+landscapeRoof(41,77,.58);
  }else if(type==='quarry'){
    detail='<path d="M19 75L45 37 73 26 109 54 138 75 106 101 60 100Z" fill="#777f70"/><path d="M45 37L63 59 93 43 109 54 76 72 37 61Z" fill="#a6ab8f"/><path d="M37 61L76 72 106 56V69L72 85 26 76Z" fill="#89947c"/><path d="M26 76L72 85 126 68 132 81 82 101Z" fill="#b1b095"/><path d="M61 39l-9 12m24-8l-7 10m15 17l-16 8" stroke="#d0c5a0" stroke-width="2"/>';
    detail+='<path d="M117 83V38m-17 7l39-13m-32 16l11-10 14 9M132 36v34" stroke="#5a5540" stroke-width="3" fill="none"/><path d="M126 69l11-6 10 6-10 7Z" fill="#c1ba98"/><path d="M126 69v9l11 7 10-7v-9" fill="#93967b"/>';
    if(tier>1)detail+='<path d="M20 92l18-10 15 8-18 11Z" fill="#c4bea0"/><path d="M20 92v8l15 10 18-12v-8" fill="#8e957b"/>';
    if(tier>2)detail+=landscapeRoof(127,91,.46);
  }else if(type==='mine'){
    detail='<path d="M10 81L34 34 65 18 112 59 133 83 99 104 43 102Z" fill="#646b5c"/><path d="M34 34L67 41 65 18 112 59 91 67Z" fill="#92917b"/><path d="M37 89V65Q58 32 80 65v34Z" fill="#242e26"/><path d="M34 92V59m49 0v37M33 59l50 2" stroke="#a69162" stroke-width="5"/><path d="M50 76l58 40m-48-47l59 40M53 86l12-7m5 17l12-7m5 17l12-7" stroke="#81806b" stroke-width="2"/>';
    detail+='<path d="M91 94l20-10 21 10-20 12Z" fill="#b3a677"/><path d="M91 94v11l21 11 20-11V94l-20 12Z" fill="#726a4b"/><path d="M98 90l7-9 7 6 8-10 7 14" fill="#b29363"/><circle cx="98" cy="109" r="5" fill="#303b2e"/><circle cx="126" cy="110" r="5" fill="#303b2e"/>';
    if(tier>1)detail+=landscapeRoof(119,59,.46);
    if(tier>2)detail+='<path d="M120 57V31l14 7-14 7" fill="#ae7444" stroke="#cab789" stroke-width="1.5"/>';
  }else if(type==='locked'){
    detail=landscapeTree(30,71,1.1)+landscapeTree(127,72,.75)+'<path d="M71 70V57a12 12 0 0124 0v13" stroke="#afb798" stroke-width="4" fill="none"/><rect x="65" y="68" width="36" height="28" rx="3" fill="#4c5f44" stroke="#a5af90" stroke-width="2"/><circle cx="83" cy="79" r="3" fill="#d1c89d"/><path d="M83 81v6" stroke="#d1c89d" stroke-width="2"/>';
  }else{
    detail='<path d="M25 76l49-27 54 25-50 29Z" fill="none" stroke="#bcb58a" stroke-width="2" stroke-dasharray="5 5"/><path d="M58 78l34-18m-29 2l25 15" stroke="#c7c099" stroke-width="3"/><path d="M27 83v-8m3 5l5-4m79 9v-8" stroke="#889566" stroke-width="2"/>';
  }
  const construction=working?'<g class="plot-scaffold"><path d="M20 86V39m23 60V52m-27-10l31 15m-28 4l28 15m-24-31l17 41" fill="none" stroke="#d3b681" stroke-width="2.5"/><path d="M20 39l23 13" stroke="#6b5b3f" stroke-width="5"/><path d="M136 53V18l15 6-15 7" fill="#c39752" stroke="#e0c997" stroke-width="1.5"/></g>':'';
  return `<svg class="plot-scene" viewBox="0 0 160 124" aria-hidden="true">${ground}${detail}${construction}</svg>`;
}
function outsideCityPage(){
  const s=S(),unlocked=Game.unlockedPlots(),used=s.plots.filter(p=>p.type).length;
  return `<div class="page-head"><div><h2>青溪城 · 城外</h2><p class="sub">点击地块建设或升级，四种资源田自由搭配。</p></div><span class="badge">已用 ${used} / ${unlocked} 块</span></div>
  <div class="allocation">${Object.entries(Game.plotTypes).map(([type,cfg])=>{const plots=s.plots.filter(p=>p.type===type),gain=plots.reduce((sum,p)=>sum+Game.plotYield(p),0);return `<div class="allocation-item ${type}"><span class="allocation-glyph">${resourceIcon(cfg.resource,'')}</span><div><strong>${Game.resources[cfg.resource].name}</strong><p>${plots.length} 块 · <span data-plot-rate="${type}">+${Math.round(gain*60)}/时</span></p></div></div>`;}).join('')}</div>
  <div class="layout outskirts-layout"><section class="outskirts-board"><div class="outskirts-banner"><span class="outskirts-title">青溪城外 · 田庄图</span><span class="label">官府 ${s.buildings.hall} 级 · 已开放 ${unlocked} / ${Game.PLOT_COUNT}</span></div><div class="plot-grid">${s.plots.map((p,index)=>{
    const locked=index>=unlocked,job=Game.plotJob(index),name=locked?'待开垦':p.type?Game.buildings[p.type].name:'空地';
    return `<button class="plot-tile ${locked?'locked-land':p.type||'empty-land'} ${job?'working':''}" data-action="plot" data-id="${index}" aria-label="${index+1}号地块 ${name}${p.type?' '+p.level+'级':''}${job?' 施工中':''}"><span class="plot-index">${String(index+1).padStart(2,'0')}</span>${job?'<span class="plot-work">营造</span>':p.type&&!locked?'<span class="plot-level">'+p.level+'级</span>':''}${plotArt(locked?'locked':p.type,p.level,index,!!job)}<strong>${name}</strong><small>${locked?'官府 '+(Math.floor((index-12)/3)+2)+' 级开放':job?`${job.kind==='replace'?'改建':job.kind==='build'?'建造':'升级'}至 ${job.level} 级<br>${clock(job.end)}`:p.type?`+${Math.round(Game.plotYield(p)*60)}/时`:'点击建造'}</small></button>`;
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
  showModal(`${same?'升级':replace?'改建':'建设'} · ${b.name}`,`<p class="sub">${index+1} 号地块${p.type?' · 当前为 '+Game.buildings[p.type].name+' '+p.level+' 级':''}</p><div class="modal-info"><span>完工产量 · ${level} 级</span><strong>+${Math.round(Game.plotYield({type,level})*60)}<span class="label"> /时</span></strong></div><p class="hint">${b.desc}</p><div class="enemy-list">${recordDetails(Game.buildRecord(type,level))}</div>${costs(cost)}${resourceWaitHTML(cost)}${Game.buildingRuleText(type,level)?`<p class="hint">前置：${esc(Game.buildingRuleText(type,level))}</p>`:''}${required?`<p class="notice">需要 ${esc(required)}</p>`:''}${constructionExperienceHTML(level)}<p class="hint">施工时间 ${duration(Game.plotTime(index,type))}</p>${replace?'<div class="notice">新产业从 1 级开始，施工完成前原产业继续生产。</div>':''}`,btn('重新选择','plot',String(index),'secondary')+btn(same?'确认升级':replace?'确认改建':'开始建设','plotDevelop',`${index}:${type}`,'',!!required||!Game.canPay(cost)||S().buildQueue.length>=Game.buildLimit()));
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
