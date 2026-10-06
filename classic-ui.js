'use strict';
let classicInfoOpen=false;
const CLASSIC_GUIDE_UI_KEY='sanguo-ui-guide-expanded-v1';
let classicGuideExpanded=false;
try{classicGuideExpanded=localStorage.getItem(CLASSIC_GUIDE_UI_KEY)==='true';}catch{}
function classicGrowthGuideHTML(){
  const html=growthGuideHTML();
  if(!html.includes('class="growth-guide"'))return html;
  const toggle=`<button class="btn small secondary guide-details-toggle" data-action="classicGuideToggle" aria-expanded="${classicGuideExpanded}">${classicGuideExpanded?'收起详情':'展开详情'}</button>`;
  return html.replace('class="growth-guide"',`class="growth-guide ${classicGuideExpanded?'guide-expanded':'guide-compact'}"`)
    .replace(/<button\b[^>]*data-action="guideHide"[^>]*>[\s\S]*?<\/button>/,toggle)
    .replace('data-action="guideGo"','data-action="classicGuideGo"');
}
function classicGuideGo(){
  const m=GrowthGuide.model(Game);
  if(m.kind==='queue'&&m.queue&&SpeedupData.kinds[m.queueKind]){speedupQuickModal(m.queueKind,Game.speedupKey(m.queueKind,m.queue));return;}
  guideGo();
}
function classicBuildingDetails(id){
  const base=roof(45,31,.65,'#556552'),roof2=roof(45,18,.46,'#61745a');
  const flag='<path d="M15 49V12m0 0l14 4-14 5" stroke="#76634c" stroke-width="2" fill="#a65b37"/>';
  const crates='<path d="M61 47l12-7 12 7-12 8Z" fill="#d1b27a"/><path d="M61 47v10l12 8 12-8V47l-12 8Z" fill="#96784f"/><path d="M73 55v10m-8-11l15-9" stroke="#6e593a"/>';
  const details={
    academy:base+roof2+'<path d="M19 44l10 4 10-4v10l-10 4-10-4Z" fill="#ece3bc" stroke="#a69a6b"/><path d="M29 48v10" stroke="#8f8965"/>',
    inn:base+'<path d="M67 20v26m-7-22h15" stroke="#6d5942" stroke-width="2"/><rect x="67" y="25" width="12" height="14" rx="1" fill="#b1874b"/><text x="69" y="35" font-size="9" fill="#f1dbab">客</text>',
    tavern:base+flag+'<path d="M60 42l10-5 10 5v12l-10 5-10-5Z" fill="#c8bb8d"/><path d="M65 46h10m-8 5h6" stroke="#8a7a51"/>',
    market:base+'<path d="M13 45l20-9 17 9-20 10Z" fill="#ccba8e"/><path d="M16 46v12m27-8v13" stroke="#827655" stroke-width="2"/><path d="M16 45l7-5m1 10l7-5m1 10l7-5" stroke="#ad734f" stroke-width="4"/>',
    warehouse:base+crates,
    drill:roof(65,24,.36)+flag+'<path d="M17 47l29-16 24 13-29 17Z" fill="#baa97c" stroke="#8d9366"/><circle cx="41" cy="47" r="6" fill="none" stroke="#776d4d"/><path d="M41 41v12m-6-6h12" stroke="#776d4d"/>',
    embassy:base+roof2+flag,
    smith:base+'<path d="M60 48v-9l10-5 10 5v9l-10 6Z" fill="#8d8d7a"/><path d="M63 44l7-4 7 4-7 6Z" fill="#a85b36"/><path d="M68 38l3-12 4-6" stroke="#bbb9a3" stroke-width="3" opacity=".6"/>',
    workshop:base+crates+'<circle cx="22" cy="49" r="9" fill="#aa9568" stroke="#645d42" stroke-width="2"/><path d="M22 41v16m-8-8h16m-14-6l12 12m-12 0l12-12" stroke="#645d42"/>',
    stable:base+'<path d="M59 48l3-10 6-5 5 2 3 7 7 3-4 6H67l-2 9m13-10l2 8M62 41l-5-6" fill="#947653" stroke="#665740" stroke-width="2"/>',
    post:base+flag+'<path d="M18 50l13-7 13 7-13 8Z" fill="#bc9e69"/><path d="M18 50v6l13 8 13-8v-6" fill="#a08352"/>',
    beacon:'<path d="M27 34l18-10 20 10v21L45 67 27 55Z" fill="#a7ae94"/><path d="M27 34l18 11 20-11M45 45v22" fill="none" stroke="#7a8c71"/><path d="M22 33L45 16l23 17Z" fill="#4e6450"/><path d="M40 18l4-13 3 9 4-8 2 13" fill="#b27541"/><path d="M46 6l-2-8" stroke="#d4c6a4" stroke-width="4"/>'
  };
  return details[id]||base;
}
function classicSidebar(){
  const s=S();
  return `<aside class="classic-sidebar ${classicInfoOpen?'mobile-open':''}" aria-label="君主与城池信息"><button class="rail-close" data-action="classicInfo" aria-label="关闭城池详情">关闭详情</button><div class="lord-card">${s.governor?generalPortrait(Game.general(s.governor),'lord-portrait'):'<span class="lord-seal">守</span>'}<div><strong>${esc(s.ruler)} <span class="lord-banner">${esc(s.banner)}</span></strong><span>${esc(activeCityMeta().name)} · (${activeCityMeta().x}, ${activeCityMeta().y})</span><small>城守 ${s.governor?esc(Game.general(s.governor).name):'尚未任命'}</small><button class="prestige-link" data-action="taskTab" data-id="honors">${HeritageSystem.office(s).name} · ${HeritageSystem.noble(s).name}</button></div></div>${sidebarObjectiveHTML()}<section class="rail-section"><h3>城池状况 <button data-action="citySettings" title="官府安抚、征收、税率与城内任职">内政</button></h3><dl class="city-ledger"><div><dt>官府</dt><dd>${s.buildings.hall} 级</dd></div><div><dt>人口</dt><dd data-population>${num(s.population)} / ${num(Game.maxPop())}</dd></div><div><dt>空闲人口</dt><dd data-free-pop>${num(Game.freePopulation())}</dd></div><div><dt>劳动人口</dt><dd>${num(Game.workers())}</dd></div><div><dt>民心 / 民怨</dt><dd><span data-morale>${Math.round(s.morale)}</span> / <span data-unrest>${Math.round(s.unrest)}</span></dd></div><div><dt>税率</dt><dd>${s.tax}%</dd></div><div><dt>声望</dt><dd><button class="prestige-link" data-action="prestigeInfo">${num(s.prestige)}</button></dd></div><div title="含在训兵员，按各兵种的人口消耗计算；实际士兵人数见军队页"><dt>兵员占用</dt><dd>${num(Game.committed())} 人口</dd></div></dl></section><div class="rail-actions">${btn('仓储','manualStorage','','small secondary')}${btn('资源交易','manualMarket','','small secondary')}${btn('领地管理','classicTerritory','','small secondary')}${btn('野地采集','heritageGatherBoard','','small secondary')}${btn('城防工事','manualDefense','','small secondary')}${btn('来袭与守城','npcDefense','','small secondary')}${btn('名城版图','namedCities','','small secondary')}${btn('城务与薪俸','governance','','small secondary')}${btn('伤兵营','warCare','','small secondary')}${btn('倍率 ×'+s.speed,'manualSpeed','','small secondary')}</div><p class="rail-footnote">城池与队列自动保存<br>离线资源最多积累 8 小时</p></aside>`;
}
function classicResourceRibbon(){
 const s=S(),rates=Game.rates();return `<div class="resource-ribbon-wrap"><section class="resource-ribbon" aria-label="资源与产量，左右滑动查看全部资源">${Object.entries(Game.resources).map(([id,r])=>`<article class="ribbon-resource"><span class="ribbon-icon">${resourceIcon(id,'')}</span><div><span class="ribbon-name">${r.name}</span><strong data-res="${id}">${num(s.res[id])}</strong><small><span data-rate="${id}" class="rate ${rates[id]<0?'negative':''}">${rates[id]>=0?'+':''}${Math.round(rates[id]*60)}/时</span><span class="ribbon-separator"> · </span><span class="ribbon-capacity">上限 ${num(Game.capacity(id))}</span></small><div class="stock-meter"><i data-stock-fill="${id}" style="width:${Math.min(100,s.res[id]/Game.capacity(id)*100)}%"></i></div></div></article>`).join('')}</section><span class="resource-scroll-hint">← 左右滑动查看五种资源 →</span></div>`;
}
function classicGiftComplete(){return OnboardingData.gifts.every(g=>S().onboarding.claims.includes(g.level));}
function currentObjectiveModel(){
  const growth=GrowthGuide.model(Game),mainline=mainlineModel(),mission=Game.currentMission(),ready=mission&&Game.missionReady(mission)?mission:Game.missions.find(m=>Game.missionReady(m));
  const rewardText=m=>Object.entries(m.reward||{}).filter(([,n])=>n>0).map(([id,n])=>Game.resources[id].name+' '+num(n)).join(' · ')+Object.entries(m.items||{}).map(([id,n])=>' · '+Game.manual.shop.find(i=>i.id===id).name+' ×'+n).join('');
  if(ready)return {title:ready.title,status:'目标已达成，领取后继续下一步。',reward:rewardText(ready)+' · 声望 300',readyMission:ready,rewardLabel:'可领补给',action:'mission',arg:ready.id,label:'领取',growth,mainline};
  if(growth.kind==='gift'){const q=Game.onboarding.quote(S(),Number(growth.id));return {title:growth.title,status:guideStatus(growth),reward:rewardText({reward:q.resources,items:q.items}),rewardLabel:'本阶补给',action:'classicGuideGo',arg:'',label:'前往',growth,mainline};}
  const matching=Game.missions.find(m=>m.id===growth.id&&!Game.missionClaimed(m.id));
  return {title:growth.title,status:guideStatus(growth),reward:matching?rewardText(matching)+' · 声望 300':mainline.current?.reward||'查看章节通关补给',rewardLabel:matching?'目标奖励':'阶段奖励',action:'classicGuideGo',arg:'',label:'前往',growth,mainline};
}
function currentObjectiveHTML(){
  const m=currentObjectiveModel();return `<section class="current-objective" data-live-objective data-objective-key="${esc(JSON.stringify(m))}" aria-label="当前目标"><div class="objective-copy"><strong>${esc(m.title)}</strong><span class="objective-gap" data-objective-status>${esc(m.status)}</span><small>${esc(m.rewardLabel)}：${esc(m.reward)}</small></div><div class="objective-actions">${btn(m.label,m.action,m.arg,'small')}${btn('详情','classicObjectives','','small secondary')}</div></section>`;
}
function classicObjectivesModal(){
  const m=currentObjectiveModel();showModal('当前目标与阶段路线',`<section class="panel"><span class="label">当前目标</span><h3>${esc(m.title)}</h3><p class="hint">${esc(m.readyMission?.desc||m.growth.reason)}</p><p class="notice">${esc(m.status)}</p><p class="hint">${esc(m.rewardLabel)}：${esc(m.reward)}</p>${btn(m.label,m.action,m.arg,'small')}</section><details data-ui-disclosure="objective-mainline"><summary>主线阶段与奖励</summary>${mainlineGuideHTML()}</details><details data-ui-disclosure="objective-growth"><summary>下一步成长路线</summary>${growthGuideHTML()}</details><p class="hint">任务册保留所有完成条件与奖励。</p>`,btn('任务册','classicMission','','secondary')+btn('关闭','close'));
}
function classicMoreModal(){
  showModal('更多事务',`<div class="more-command-grid">${btn('战报','classicNav','reports','secondary')}${btn('商城','classicNav','shop','secondary')}${btn('自动助手 · '+Game.automation.unread(S())+' 条未读','automationOpen','','secondary')}${btn('十阶礼包 · '+S().onboarding.claims.length+'/10 已领','onboardingGifts','','secondary')}${btn('领地与驻军','classicTerritory','','secondary')}${btn('来袭与守城','npcDefense','','secondary')}${btn('城池详情','classicInfo','','secondary')}${btn('名城版图','namedCities','','secondary')}${btn('城务与薪俸','governance','','secondary')}${btn('伤兵营','warCare','','secondary')}${btn('设置与存档','settings','','secondary')}</div>`,btn('关闭','close','','secondary'));
}
function classicMilitaryBulletin(){
  const s=S(),all=Game.allExpeditions(),arrivals=all.filter(e=>e.phase==='march'&&e.end<=Date.now()).length,garrisons=Object.values(s.garrisons||{}).length;
  const active=s.battle&&!s.battle.finished;
  if(!active&&!all.length&&!garrisons)return '';
  const soon=all.filter(e=>e.end>Date.now()&&['march','return'].includes(e.phase)).sort((a,b)=>a.end-b.end)[0];
  return `<div class="classic-bulletin"><span class="bulletin-tag">军情</span><span>${active?`战斗 · 第 ${s.battle.round} 回合`:arrivals?`${arrivals} 支部队已抵达`:soon?`${soon.phase==='return'?'返城':'行军'} ${clock(soon.end)}`:''}${all.length?' · '+all.length+' 支在外部队':''}${garrisons?' · '+garrisons+' 处驻军':''}</span>${btn('部队','classicNav','army','small secondary')}</div>`;
}
function classicShell(){
  const s=S(),active=['reports','shop'].includes(page)?'more':page,focus=page==='world'&&s.battle&&!s.battle.finished;
  const primary=[['city','城池'],['world','地图'],['army','军队'],['heroes','将领'],['more','更多']];
  const view=({city:cityPage,army:armyPage,world:worldPage,heroes:heroesPage,reports:reportsPage,shop:manualShopPage})[page]();
  const arrivals=Game.allExpeditions().filter(e=>e.phase==='march'&&e.end<=Date.now()).length,bulletin=classicMilitaryBulletin();
  const taskReady=Game.missions.some(x=>Game.missionReady(x))||s.daily.tasks.some(t=>Game.progression.taskReady(s,t))||Game.progression.milestones.some(m=>s.daily.claimed>=m.count&&!s.daily.milestoneClaims.includes(m.count));
  return `<div class="classic-frame command-frame ${page==='world'?'world-frame':''} ${focus?'battle-focus':''} ${bulletin?'has-military-bulletin':''}"><header class="classic-header"><div class="classic-brand"><span class="brand-mark">三</span><h1>三国城志</h1><span class="classic-edition">${OnlineClient.shared()?'共享世界':'单机 PVE'}</span></div><div class="classic-header-meta">${citySwitchButtonHTML()}<span>元宝 <b>${num(s.gems)}</b></span><button class="classic-info-toggle" data-action="classicInfo" aria-expanded="${classicInfoOpen}">城池详情</button><button data-action="settings" aria-label="设置与帮助">设置</button></div></header><nav class="classic-toolbar" aria-label="主导航"><div class="classic-primary">${primary.map(([id,label])=>`<button data-action="${id==='more'?'classicMore':'classicNav'}" data-id="${id}" class="${active===id?'active':''}" ${active===id?'aria-current="page"':''}>${label}${id==='world'&&arrivals?`<i>${arrivals}</i>`:''}</button>`).join('')}</div><div class="classic-tools">${classicGiftComplete()?'':`<button class="classic-gift" data-action="onboardingGifts" title="官府 1–10 级分阶补给">十阶礼包${Game.starterGiftPending()?' ●':''}</button>`}<button data-action="classicQueues">队列 <b>${s.buildQueue.length}/${Game.buildLimit()}</b></button><button data-action="manualInventory">背包</button><button data-action="classicMission">任务${taskReady?' ●':''}</button></div></nav><div class="online-bar-host" data-online-status>${onlineStatusHTML()}</div>${classicResourceRibbon()}<div class="classic-workspace">${classicInfoOpen?'<button class="rail-backdrop" data-action="classicInfo" aria-label="关闭城池详情"></button>':''}${classicSidebar()}<main id="main" class="classic-content screen-${page}" aria-label="游戏主界面">${npcDefenseNoticeHTML()}${typeof otherRegionalFrontNoticeHTML==='function'?otherRegionalFrontNoticeHTML():''}${page==='city'?`<nav class="city-area-tabs" aria-label="城池区域">${btn('城内','classicNav','inner','small secondary '+(cityArea==='inner'?'active-order':''))}${btn('城外','classicNav','outer','small secondary '+(cityArea==='outer'?'active-order':''))}</nav>`:''}${view}</main></div><footer class="classic-footer">${bulletin}${focus?'':currentObjectiveHTML()}</footer></div>`;
}
function classicQueuePanel(){
  const s=S();return `<section class="panel classic-queue-panel"><div class="section-title"><h3>建造队列</h3><span class="label">${s.buildQueue.length} / ${Game.buildLimit()}</span></div>${autoUpgradeControls()}${s.buildQueue.length?s.buildQueue.map(q=>queueHTML(q,'build')).join(''):'<div class="empty">建造队空闲<br>点击建筑升级，点击空地建设。</div>'}<p class="hint queue-caption">城内、城外共用建造队。</p></section><section class="panel classic-city-actions"><div class="section-title"><h3>城池事务</h3></div><div class="city-action-grid">${btn('科技研究','manualResearch','','small secondary')}${btn('招兵训练','manualArmy','','small secondary')}${btn('寻访将领','manualInn','','small secondary')}${btn('出征战术','tacticsModal','','small secondary')}</div><p class="hint">${cityArea==='outer'?'':'选中地块查看详情与操作。'}</p></section>`;
}
function classicQueuesModal(){
  const s=S();showModal('营造与训练队列',`<div class="shop-tabs">${Object.entries(SpeedupData.kinds).map(([kind,name])=>btn(name+'加速','speedupPicker',kind+'|','small secondary')).join('')}</div>${autoUpgradeControls()}<h3 class="ledger-heading">营造 ${s.buildQueue.length}/${Game.buildLimit()}</h3>${s.buildQueue.length?s.buildQueue.map(q=>queueHTML(q,'build')+btn('取消施工','manualCancelAsk',q.plot===undefined?'site:'+q.site:'plot:'+q.plot,'small danger')).join(''):'<p class="empty">暂无工程。</p>'}<h3 class="ledger-heading">训练 ${s.trainQueue.length}/${Game.trainingLimit()}</h3>${s.trainQueue.length?s.trainQueue.map(q=>queueHTML(q,'train')).join(''):'<p class="empty">暂无训练。</p>'}<h3 class="ledger-heading">科技研究</h3>${s.researchQueue?`<p class="hint">${Game.manual.technology[s.researchQueue.id].name} → ${s.researchQueue.level} 级 ${clock(s.researchQueue.end)} · ${finishAt(s.researchQueue.end)} ${speedupQueueButton('research',s.researchQueue)}</p>`:'<p class="empty">暂无研究。</p>'}`,btn('关闭','close','','secondary'));manualModalContext=classicQueuesModal;
}
let growthStage='立城补给',growthPage=0;
const GROWTH_PAGE_SIZE=10;
function missionItemHTML(items){return Object.keys(items||{}).length?'<div class="loot">'+Object.entries(items).map(([id,n])=>'<span>'+Game.manual.shop.find(x=>x.id===id).name+' ×'+num(n)+'</span>').join('')+'</div>':'';}
function growthMissionModal(){
  const pool=Game.missions.filter(m=>!m.chapter);
  const ready=pool.filter(m=>Game.missionReady(m)),claimed=pool.filter(m=>Game.missionClaimed(m.id)).length,groups=['立城补给','城池经营','书院研习','整军出征','征战里程'];
  const nav='<div class="shop-tabs" role="group" aria-label="成长任务路线">'+groups.map(stage=>{const list=pool.filter(m=>m.stage===stage),count=list.filter(m=>Game.missionReady(m)).length;return btn(stage+(count?' · '+count+' 可领':''),'growthStage',stage,'small secondary '+(stage===growthStage?'active-order':''));}).join('')+'</div>';
  const rows=list=>list.map(m=>{const done=Game.missionClaimed(m.id),available=Game.missionReady(m);return `<article class="quest-card ${done?'quest-claimed':available?'quest-ready':''}"><div class="quest-heading"><h3>${esc(m.title)}</h3><span class="badge">${done?'已领取':available?'可领取':'待达成'}</span></div><p class="hint">${esc(m.desc)}</p>${lootHtml(m.reward)}${missionItemHTML(m.items)}<p class="hint">声望 +300</p><div class="quest-actions">${done?'':available?btn('领取奖励','mission',m.id,'small'):btn(m.route==='gift'?'领取礼包':'前往完成','missionGo',m.id,'small secondary')}</div></article>`;}).join('');
  const list=pool.filter(m=>m.stage===growthStage),pending=list.filter(m=>!Game.missionClaimed(m.id)).sort((a,b)=>Number(Game.missionReady(b))-Number(Game.missionReady(a))),done=list.filter(m=>Game.missionClaimed(m.id));
  const pages=Math.max(1,Math.ceil(pending.length/GROWTH_PAGE_SIZE));growthPage=Math.max(0,Math.min(pages-1,growthPage));const visible=pending.slice(growthPage*GROWTH_PAGE_SIZE,(growthPage+1)*GROWTH_PAGE_SIZE),pager=pages>1?`<div class="quest-pagination">${btn('上一页','growthPage',String(growthPage-1),'small secondary',growthPage===0)}<span class="label">第 ${growthPage+1} / ${pages} 页 · ${pending.length} 项待领取</span>${btn('下一页','growthPage',String(growthPage+1),'small secondary',growthPage===pages-1)}</div>`:'';
  showModal('任务册 · 成长路线',`${taskTabs()}<div class="quest-summary"><strong>已领取 ${claimed} / ${pool.length}</strong><span>${ready.length} 项可领</span></div><div class="quest-collect">${btn('一键领取全部已完成奖励','missionClaimAll','','block',!ready.length)}</div><p class="notice">五条成长路线支持建设、科技、配兵、征战和招降。奖励包含资源，部分里程碑另送加速道具或金砖，具体数量以各任务卡片为准；可分别领取，每项仅限一次。资源奖励可暂时超出仓储容量。</p><div class="quest-gift"><strong>新手十阶礼包 · ${S().onboarding.claims.length} / 10 已领</strong>${btn('查看官府成长礼包','onboardingGifts','','small')}</div>${nav}<div class="section-title"><h3>${growthStage}</h3><span class="label">${done.length} / ${list.length}</span></div>${pager}${rows(visible)}${pager}${done.length?`<details class="quest-completed"><summary>已领取 ${done.length} 项</summary>${rows(done)}</details>`:''}`,btn('关闭','close','','secondary'));
  manualModalContext=growthMissionModal;
}

function classicWarOrderTargetHTML(n){
  const s=S(),reason=Game.attackBlocked(n.id,'occupy')||(!s.buildings.drill?'需要校场':Game.allExpeditions().length>=s.buildings.drill?'校场派遣名额已满':s.cooldowns[n.id]>Date.now()?'守军正在恢复':'');
  return `${warOrderIntelHTML(n)}<p class="hint" data-order-clock="${n.orderRoute}">${esc(warOrderClockText(n.orderRoute))}</p><div class="target-actions">${btn(reason||'配兵讨伐','campaignDispatch',n.id+':occupy','block',!!reason)}${btn('返回战役军令','taskTab','orders','secondary')}</div><p class="hint target-time">${esc(campaignMarchReferenceHTML(n))}</p>`;
}
function classicTargetActions(n){
  if(n.orderRoute)return classicWarOrderTargetHTML(n);
  if(Game.cityMeta?.(n.id))return campaignOwnedCityHTML(n);
  if(!Game.landmarkVisible(n.id))return '<p class="notice">这个任务据点尚未发现，请先完成当前据点。</p>';
  const s=S(),owned=!!s.conquered[n.id],chapterBlocked=ChapterData.blocked(s,n.id);if(chapterBlocked)return `<p class="notice">${esc(chapterBlocked)}</p>${btn('查看章节路线','taskTab','chapter','block')}<p class="hint">${n.reward}</p>`;if(Game.isCity(n)&&!n.openCity&&!Game.countyUnlocked())return `<div class="notice">县城攻打未开放：完成黄巾之乱四项史诗后，可选择掠夺或占领。</div>${btn('查看解锁进度','taskTab','epic','block')}<div class="target-actions">${btn('掠夺 · 史诗未完成','campaignDispatch',n.id+':raid','secondary',true)}${btn('占领 · 史诗未完成','campaignDispatch',n.id+':occupy','',true)}</div>`;if(owned&&(n.wild||Game.isCity(n)))return campaignNodeDetails(n);
  const raid=Game.attackInfo(n.id,'raid'),occupy=Game.attackInfo(n.id,'occupy'),cooling=s.cooldowns[n.id]>Date.now(),dispatched=Game.allExpeditions().some(e=>e.node===n.id),full=Game.allExpeditions().length>=s.buildings.drill,commonReason=!s.buildings.drill?'需要校场':cooling?'驻军恢复中':dispatched?'部队已派出':full?'派遣名额已满':'',occupyReason=Game.attackBlocked(n.id,'occupy'),info=Game.battleDropInfo(n.id);
  return `<div class="target-actions">${btn(commonReason?'掠夺 · '+commonReason:'配兵掠夺','campaignDispatch',n.id+':raid','secondary',!!commonReason)}${btn(commonReason?'占领 · '+commonReason:owned?'已占领':occupyReason?'野地名额已满':'配兵占领','campaignDispatch',n.id+':occupy','',!!commonReason||!!occupyReason||owned)}</div><details class="target-brief-rules" data-ui-disclosure="target-rules-${n.id}"><summary>占领、掠夺与掉落规则</summary><p class="target-summary hint">掠夺：${Game.isCity(n)?'夺取资源后返城，基础黄金受保护。':'夺取资源后返城。'}<br>占领：${Game.isCity(n)?'启用城防与义兵；每胜缴获资源和黄金，民心下降 35，低于 0 易主。':n.wild?'取得产量加成，默认驻扎，可选占领后返回。':'取得据点归属，部队返城。'}</p><div class="reward">${n.reward}</div><p class="target-drop-info">胜利掉落：道具 ${Math.round(info.itemChance*1000)/10}% · 额外资源 ${Math.round(info.resourceChance*1000)/10}% · 俘虏 ${Math.round(Game.captiveChance(n.id)*100)}%</p><details class="target-details"><summary>预计战利品与规则</summary><p class="label">掠夺战利品</p>${lootHtml(raid.loot)}<p class="label">占领战利品</p>${lootHtml(occupy.loot)}${Game.isCity(n)?campaignCityRulesHTML(n,occupy):''}<p class="hint">${battleDropHint(n)}</p></details></details><p class="hint target-time">${esc(campaignMarchReferenceHTML(n))}${cooling?' · 恢复 '+clock(s.cooldowns[n.id]):''}</p>${occupyReason?`<p class="hint">${esc(occupyReason)}</p>`:''}`;
}
document.addEventListener('click',event=>{
  const el=event.target.closest('[data-action]');if(!el||el.disabled)return;
  const action=el.dataset.action,id=el.dataset.id;
  if(action==='classicGuideToggle'){classicGuideExpanded=!classicGuideExpanded;try{localStorage.setItem(CLASSIC_GUIDE_UI_KEY,String(classicGuideExpanded));}catch{}render();document.querySelector('[data-action="classicGuideToggle"]')?.focus();}
  if(action==='classicGuideGo'){modal.close();classicGuideGo();}
  if(action==='classicMore')classicMoreModal();
  if(action==='classicObjectives')classicObjectivesModal();
  if(action==='classicNav'){modal.close();if(id==='inner'||id==='outer'){page='city';cityArea=id;}else page=id;classicInfoOpen=false;render();document.getElementById('main').scrollTop=0;}
  if(action==='classicInfo'){modal.close();classicInfoOpen=!classicInfoOpen;render();document.querySelector(classicInfoOpen?'.rail-close':'.classic-info-toggle')?.focus();}
  if(action==='classicStarterGift')onboardingGiftsModal();
  if(action==='classicQueues')classicQueuesModal();
  if(action==='classicTerritory')showModal('领地管理',territorySummary(),btn('关闭','close','','secondary'));
  if(action==='classicMission'){if(Game.missions.find(m=>m.id===id)?.chapter)taskTab='chapter';classicMissionModal();}
  if(action==='growthStage'){growthStage=id;growthPage=0;taskTab='growth';classicMissionModal();}
  if(action==='growthPage'){growthPage=Number(id);classicMissionModal();}
  if(action==='missionClaimAll'){if(actResult(Game.claimReadyMissions(),'已完成任务的补给与黄金已全部到账'))classicMissionModal();}
  if(action==='missionGo'){
    const m=Game.missions.find(x=>x.id===id);if(!m)return;
    if(m.node){if(!Game.landmarkVisible(m.node)){toast('请先完成当前任务据点');return;}modal.close();page='world';selectedNode=m.node;const n=Game.getNode(m.node);if(Number.isFinite(n?.x)&&Number.isFinite(n?.y))worldView={x:n.x,y:n.y};render();return;}
    if(m.route==='wildGenerals'){wildGeneralsModal();return;}
    if(m.route==='gift'){onboardingGiftsModal();return;}
    modal.close();
    if(m.route==='research'){if(S().buildings.academy<1){page='city';cityArea='inner';render();toast('先完成 1 级书院，再按对应科技的条件研究');}else manualResearchModal();return;}
    if(m.route==='captives'){captiveCampModal();return;}
    if(m.route==='defense'){manualDefenseModal();return;}
    if(m.route==='epic'){taskTab='epic';classicMissionModal();return;}
    if(m.route==='civic'){manualGovernmentModal();return;}
    if(m.route==='market'){manualMarketModal();return;}
    if(['inner','outer'].includes(m.route)){page='city';cityArea=m.route;}else page=m.route;
    classicInfoOpen=false;render();document.getElementById('main').scrollTop=0;
  }
});

document.addEventListener('keydown',event=>{if(event.key==='Escape'&&classicInfoOpen&&!modal.open){classicInfoOpen=false;render();document.querySelector('.classic-info-toggle')?.focus();}});

function sidebarObjectiveHTML(){const m=currentObjectiveModel();return `<section class="rail-section" data-sidebar-objective data-objective-key="${esc(JSON.stringify(m))}" aria-label="当前任务"><h3>当前任务</h3><strong>${esc(m.title)}</strong><p class="hint">${esc(m.status)}</p>${btn(m.label,m.action,m.arg,'small secondary')}${btn('任务册','classicMission','','small secondary')}</section>`;}
function refreshObjectiveUI(){const key=JSON.stringify(currentObjectiveModel());document.querySelectorAll('[data-sidebar-objective]').forEach(el=>{if(el.dataset.objectiveKey!==key)el.outerHTML=sidebarObjectiveHTML();});document.querySelectorAll('[data-live-objective]').forEach(el=>{if(el.dataset.objectiveKey!==key)el.outerHTML=currentObjectiveHTML();});}
