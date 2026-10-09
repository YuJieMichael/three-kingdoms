'use strict';
// Interface composition only. Existing actions remain responsible for all game changes.
function layoutNavIcon(id){
  const icons={
    city:'<path d="M4 14h24v14H4z"/><path d="M4 14V9h5v5m14 0V9h5v5M10 14V5h12v9"/><path d="M13 28v-7a3 3 0 0 1 6 0v7"/><path d="M13 9h6"/>',
    outer:'<path d="M3 23l13-7 13 7-13 7zM3 16l13-7 13 7M8 20l13 7M15 16l13 7"/><path d="M7 17V7m0 4L3 8m4 7l4-4M24 17V4m0 4l-4-3m4 7l5-4"/>',
    tasks:'<path d="M8 5h16v24H8zM5 5v5h3M24 24h3v5H8"/><path d="M12 11h8M12 16h8M12 21h5"/><path d="M8 5a3 3 0 0 0-6 0"/>',
    inventory:'<path d="M4 14h24v14H4zM4 14V9h24v5M4 20h24M9 9v19M23 9v19"/><rect x="13" y="17" width="6" height="7" rx="1"/><path d="M16 20v2"/>',
    shop:'<path d="M4 15h24v14H4zM2 15l4-11h20l4 11M8 4L6 15m10-11v11m8-11l2 11M2 15q3 5 7 0 3 5 7 0 3 5 7 0 4 5 7 0"/><path d="M8 23h7M21 20v9"/>',
    reports:'<path d="M7 3h13l6 6v20H7zM20 3v7h6M11 14h11M11 19h11M11 24h7"/><path d="M4 8v22h16"/>',
    queues:'<path d="M6 28L21 13M17 8l6-5 7 7-6 5zM4 26l3 3"/><path d="M6 5l2 5 5 2-3 3-6-2-3-6zM14 17l10 11 4-4-9-9"/>',
    world:'<path d="M3 8l8-4 10 4 8-4v22l-8 4-10-4-8 4z"/><path d="M11 4v22M21 8v22"/><path d="M6 17l5-3 5 3 5-2 5 3" stroke-dasharray="2 3"/>',
    army:'<path d="M5 28L23 10M27 28L9 10"/><path d="M20 8l7-5-3 9zM12 8L5 3l3 9z" fill="currentColor"/><path d="M8 23l4 4M24 23l-4 4"/><path d="M16 13l6 3v6l-6 6-6-6v-6z" fill="var(--nav-icon-fill,#354632)"/><path d="M16 16v7"/>',
    heroes:'<path d="M7 19c0-8 4-12 9-12s9 4 9 12"/><path d="M11 8c0-4 3-6 6-6s5 2 5 5M16 7v9"/><path d="M5 19h22l-3 5-3-3v8l-5-3-5 3v-8l-3 3z"/><path d="M10 16h12"/>',
    more:[4,13,22].flatMap(y=>[4,13,22].map(x=>`<rect x="${x}" y="${y}" width="6" height="6" rx="1" fill="currentColor" stroke="none"/>`)).join('')
  };
  return `<svg class="layout-nav-icon" viewBox="0 0 32 32" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">${icons[id]||icons.more}</svg>`;
}
function layoutLordPanelHTML(){
  const s=S(),city=activeCityMeta();
  return `<aside class="layout-lord-panel" aria-label="君主与城务快捷栏">
    <div class="layout-rail-heading">君主 · ${esc(s.banner)}</div>
    <div class="lord-card">${s.governor?generalPortrait(Game.general(s.governor),'lord-portrait'):'<span class="lord-seal">守</span>'}<div><strong>${esc(s.ruler)}</strong><button class="prestige-link" data-action="taskTab" data-id="honors">${HeritageSystem.office(s).name} · ${HeritageSystem.noble(s).name}</button><small>${s.governor?'城守 '+esc(Game.general(s.governor).name):'城守尚未任命'}</small></div></div>
    <div class="layout-city-name"><strong>${esc(city.name)}</strong><span>坐标 ${city.x}, ${city.y} · 官府 ${s.buildings.hall} 级</span></div>
    <dl class="city-ledger">
      <div><dt>人口</dt><dd data-population>${num(s.population)} / ${num(Game.maxPop())}</dd></div>
      <div><dt>空闲人口</dt><dd data-free-pop>${num(Game.freePopulation())}</dd></div>
      <div><dt>民心 / 民怨</dt><dd><span data-morale>${Math.round(s.morale)}</span> / <span data-unrest>${Math.round(s.unrest)}</span></dd></div>
      <div><dt>税率</dt><dd>${s.tax}%</dd></div>
      <div><dt>声望</dt><dd><button class="prestige-link" data-action="prestigeInfo">${num(s.prestige)}</button></dd></div>
    </dl>
    <section class="layout-rail-section"><h3>城务办理</h3><div class="rail-actions">${btn('内政','citySettings','','small secondary')}${btn('生产','classicNav','outer','small secondary')}${btn('仓储','manualStorage','','small secondary')}${layoutFeatureOpen('market')?btn('交易','manualMarket','','small secondary'):''}${layoutFeatureOpen('territory')?btn('领地','classicTerritory','','small secondary'):''}${layoutFeatureOpen('defense')?btn('城防','manualDefense','','small secondary'):''}${layoutFeatureOpen('research')?btn('科技','manualResearch','','small secondary'):''}${layoutFeatureOpen('warCare')?btn('伤兵','warCare','','small secondary'):''}</div></section>
    <section class="layout-rail-section"><h3>营造动态 <button data-action="classicQueues" aria-label="查看全部队列">查看</button></h3><div class="layout-queue-summary">${s.buildQueue.length?s.buildQueue.slice(0,3).map(q=>queueHTML(q,'build')).join(''):'<p class="hint">暂无施工，点击场景中的空地建设。</p>'}</div></section>
    ${classicGiftComplete()?'':`<button class="layout-gift-button" data-action="onboardingGifts">新手补给${Game.starterGiftPending()?' · 可领取':''}<span>官府 1–10 级分阶礼包</span></button>`}
    <button class="layout-rail-details" data-action="classicInfo">君主与城池详情 ›</button>
  </aside>`;
}
// New players start with a few entries; the rest appear as the city grows (then stay).
function layoutFeatureOpen(id){
  const s=S(),hall=s.buildings.hall||0,fought=s.stats.victories>0||s.reports.length>0||(s.cityDefense?.reports?.length||0)>0;
  return ({inventory:Object.values(s.inventory||{}).some(n=>n>0)||Object.values(s.jewels||{}).some(n=>n>0)||hall>=2,queues:hall>=2||s.buildQueue.length>0||!!s.researchQueue,reports:fought,shop:hall>=3,research:(s.buildings.academy||0)>=1,market:(s.buildings.market||0)>=1,warCare:fought,territory:hall>=3||Object.keys(s.conquered||{}).length>0,defense:hall>=3||(s.buildings.wall||0)>=1,automation:hall>=3})[id]??true;
}
let layoutOpenedFeatures=null;
function layoutAnnounceFeatures(){
  const names={inventory:'宝物',queues:'营造',reports:'报告',shop:'商城',research:'科技',market:'交易',warCare:'伤兵',territory:'领地',defense:'城防',automation:'自动助手'},open=Object.keys(names).filter(layoutFeatureOpen);
  if(layoutOpenedFeatures){const fresh=open.filter(id=>!layoutOpenedFeatures.includes(id));if(fresh.length&&typeof toast==='function')setTimeout(()=>toast('新功能开放：'+fresh.map(id=>names[id]).join('、')),0);}
  layoutOpenedFeatures=open;
}
function layoutShell(){
  const s=S(),focus=page==='world'&&s.battle&&!s.battle.finished;
  const view=({city:cityPage,army:armyPage,world:worldPage,heroes:heroesPage,reports:reportsPage,shop:manualShopPage})[page]();
  const arrivals=Game.allExpeditions().filter(e=>e.phase==='march'&&e.end<=Date.now()).length,bulletin=classicMilitaryBulletin();
  const taskReady=Game.missions.some(x=>Game.missionReady(x))||s.daily.tasks.some(t=>Game.progression.taskReady(s,t))||Game.progression.milestones.some(m=>s.daily.claimed>=m.count&&!s.daily.milestoneClaims.includes(m.count));
  const scenes=[['inner','城内','city'],['outer','城外','outer'],['world','地图','world']];
  const commands=[['tasks','任务','classicMission','',taskReady?'可领':''],['heroes','将领','classicNav','heroes',''],['army','军队','classicNav','army',arrivals?String(arrivals):''],['inventory','宝物','manualInventory','',''],['shop','商城','classicNav','shop',''],['reports','报告','classicNav','reports',''],['queues','营造','classicQueues','',s.buildQueue.length?String(s.buildQueue.length):''],['more','更多','classicMore','','']].filter(([icon])=>layoutFeatureOpen(icon));layoutAnnounceFeatures();
  return `<div class="classic-frame command-frame layout-shell heritage-layout ${page==='world'?'world-frame':''} ${focus?'battle-focus':''} ${bulletin?'has-military-bulletin':''} ${classicInfoOpen?'info-open':''}">
    <header class="classic-header">
      <div class="classic-brand"><span class="brand-mark">三</span><h1>山河策</h1><span class="classic-edition">${OnlineClient.shared()?'共享世界':'单机'}</span></div>
      <nav class="layout-scene-nav" aria-label="场景导航">${scenes.map(([id,label,icon])=>{const active=id==='world'?page==='world':page==='city'&&cityArea===id;return `<button data-action="classicNav" data-id="${id}" class="${active?'active':''}" ${active?'aria-current="page"':''} aria-label="${label}">${layoutNavIcon(icon)}<span>${label}</span></button>`;}).join('')}</nav>
      <div class="classic-header-meta">${citySwitchButtonHTML()}<span class="layout-gems">元宝 <b>${num(s.gems)}</b></span><button class="classic-info-toggle" data-action="classicInfo" aria-expanded="${classicInfoOpen}" aria-label="城池详情">城务</button><button data-action="settings" aria-label="设置与帮助">设置</button></div>
    </header>
    <div class="online-bar-host" data-online-status>${onlineStatusHTML()}</div>
    ${classicResourceRibbon()}
    <div class="classic-workspace">${layoutLordPanelHTML()}${classicInfoOpen?'<button class="rail-backdrop" data-action="classicInfo" aria-label="关闭城池详情"></button>':''}${classicSidebar()}
      <main id="main" class="classic-content screen-${page}" aria-label="游戏主界面">${npcDefenseNoticeHTML()}${typeof otherRegionalFrontNoticeHTML==='function'?otherRegionalFrontNoticeHTML():''}${view}</main>
    </div>
    <footer class="classic-footer"><div class="layout-status-strip">${bulletin}${focus?'':currentObjectiveHTML()}</div>
      <nav class="classic-primary layout-command-dock" aria-label="常用功能" style="--dock-count:${commands.length}">${commands.map(([icon,label,action,id,badge])=>`<button data-action="${action}" data-id="${id}" class="${action==='classicNav'&&page===id?'active':''}" ${action==='classicNav'&&page===id?'aria-current="page"':''} aria-label="${label}"><span class="layout-dock-emblem">${layoutNavIcon(icon)}</span><span class="layout-nav-label">${label}</span>${badge?`<i>${badge}</i>`:''}</button>`).join('')}</nav>
    </footer>
  </div>`;
}
function layoutCityToolsHTML(){return '';}
let layoutMoreCategory='war';
const LAYOUT_MORE_TABS=[['war','征战'],['city','城务'],['tools','辅助']];
function layoutMoreModal(){
  const unread=Game.automation.unread(S());
  const groups={
    war:btn('征战与成长','webEditionHub','','secondary')+btn('掠夺找资源','webRaids','','secondary',WebEdition.shared())+btn('名城版图','namedCities','','secondary')+btn('新手补给 · '+S().onboarding.claims.length+'/10','onboardingGifts','','secondary'),
    city:btn('领地与驻军','classicTerritory','','secondary')+btn('来袭与守城','npcDefense','','secondary')+btn('城务与薪俸','governance','','secondary')+btn('伤兵营','warCare','','secondary')+btn('城池详情','classicInfo','','secondary'),
    tools:(layoutFeatureOpen('automation')?btn('自动助手'+(unread?' · '+unread+' 未读':''),'automationOpen','','secondary'):'')+btn('消息记录','webMessages','','secondary')+btn(webAudioEnabled?'音乐 · 开':'音乐 · 关','webAudio','','secondary')
  };
  const tabs=LAYOUT_MORE_TABS.map(([id,label])=>`<button role="tab" id="more-tab-${id}" aria-controls="more-category-panel" aria-selected="${layoutMoreCategory===id}" tabindex="${layoutMoreCategory===id?0:-1}" data-action="layoutMoreTab" data-id="${id}">${label}${id==='tools'&&unread?'<i aria-label="有未读记录"></i>':''}</button>`).join('');
  showModal('更多',`<section class="layout-more-menu"><nav class="layout-more-tabs" role="tablist" aria-label="更多功能分类">${tabs}</nav><div id="more-category-panel" class="layout-more-panel" role="tabpanel" aria-labelledby="more-tab-${layoutMoreCategory}">${groups[layoutMoreCategory]}</div></section>`,btn('关闭','close','','secondary'));
  manualModalContext=layoutMoreModal;
}
function layoutSelectMoreCategory(id){
  if(!LAYOUT_MORE_TABS.some(([key])=>key===id))return;
  layoutMoreCategory=id;layoutMoreModal();
  document.getElementById('more-tab-'+id)?.focus();
}
document.addEventListener('click',event=>{
  const tab=event.target.closest('[data-action="layoutMoreTab"]');
  if(tab)layoutSelectMoreCategory(tab.dataset.id);
});
document.addEventListener('keydown',event=>{
  const tab=event.target.closest('[data-action="layoutMoreTab"]');
  if(!tab||!['ArrowLeft','ArrowRight','Home','End'].includes(event.key))return;
  event.preventDefault();
  const index=LAYOUT_MORE_TABS.findIndex(([id])=>id===tab.dataset.id);
  const next=event.key==='Home'?0:event.key==='End'?LAYOUT_MORE_TABS.length-1:(index+(event.key==='ArrowRight'?1:-1)+LAYOUT_MORE_TABS.length)%LAYOUT_MORE_TABS.length;
  layoutSelectMoreCategory(LAYOUT_MORE_TABS[next][0]);
});
