'use strict';
// Interface composition only. Existing actions remain responsible for all game changes.
function layoutNavIcon(id){
  const icons={
    city:'<path d="M4 14h24v14H4z"/><path d="M4 14V9h5v5m14 0V9h5v5M10 14V5h12v9"/><path d="M13 28v-7a3 3 0 0 1 6 0v7"/><path d="M13 9h6"/>',
    world:'<path d="M3 8l8-4 10 4 8-4v22l-8 4-10-4-8 4z"/><path d="M11 4v22M21 8v22"/><path d="M6 17l5-3 5 3 5-2 5 3" stroke-dasharray="2 3"/>',
    army:'<path d="M5 28L23 10M27 28L9 10"/><path d="M20 8l7-5-3 9zM12 8L5 3l3 9z" fill="currentColor"/><path d="M8 23l4 4M24 23l-4 4"/><path d="M16 13l6 3v6l-6 6-6-6v-6z" fill="var(--nav-icon-fill,#354632)"/><path d="M16 16v7"/>',
    heroes:'<path d="M7 19c0-8 4-12 9-12s9 4 9 12"/><path d="M11 8c0-4 3-6 6-6s5 2 5 5M16 7v9"/><path d="M5 19h22l-3 5-3-3v8l-5-3-5 3v-8l-3 3z"/><path d="M10 16h12"/>',
    more:[4,13,22].flatMap(y=>[4,13,22].map(x=>`<rect x="${x}" y="${y}" width="6" height="6" rx="1" fill="currentColor" stroke="none"/>`)).join('')
  };
  return `<svg class="layout-nav-icon" viewBox="0 0 32 32" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">${icons[id]||icons.more}</svg>`;
}
function layoutShell(){
  const s=S(),active=['reports','shop'].includes(page)?'more':page,focus=page==='world'&&s.battle&&!s.battle.finished;
  const primary=[['city','城池'],['world','地图'],['army','军队'],['heroes','将领'],['more','更多']];
  const view=({city:cityPage,army:armyPage,world:worldPage,heroes:heroesPage,reports:reportsPage,shop:manualShopPage})[page]();
  const arrivals=Game.allExpeditions().filter(e=>e.phase==='march'&&e.end<=Date.now()).length,bulletin=classicMilitaryBulletin();
  const taskReady=Game.missions.some(x=>Game.missionReady(x))||s.daily.tasks.some(t=>Game.progression.taskReady(s,t))||Game.progression.milestones.some(m=>s.daily.claimed>=m.count&&!s.daily.milestoneClaims.includes(m.count));
  const tools=`<nav class="classic-tools" aria-label="常用操作">${classicGiftComplete()?'':`<button class="classic-gift" data-action="onboardingGifts" title="官府 1–10 级分阶补给">礼包${Game.starterGiftPending()?' ●':''}</button>`}<button data-action="classicQueues">队列 <b>${s.buildQueue.length}/${Game.buildLimit()}</b></button><button data-action="manualInventory">背包</button><button data-action="classicMission">任务${taskReady?' ●':''}</button></nav>`;
  const resourceBar=classicResourceRibbon().replace('<span class="resource-scroll-hint">',tools+'<span class="resource-scroll-hint">');
  return `<div class="classic-frame command-frame layout-shell ${page==='world'?'world-frame':''} ${focus?'battle-focus':''} ${bulletin?'has-military-bulletin':''} ${classicInfoOpen?'info-open':''}">
    <header class="classic-header">
      <div class="classic-brand"><span class="brand-mark">三</span><h1>山河策</h1><span class="classic-edition">${OnlineClient.shared()?'共享世界':'单机'}</span></div>
      <nav class="classic-primary" aria-label="主导航">${primary.map(([id,label])=>`<button data-action="${id==='more'?'classicMore':'classicNav'}" data-id="${id}" class="${active===id?'active':''}" ${active===id?'aria-current="page"':''} title="${label}" aria-label="${label}">${layoutNavIcon(id)}<span class="layout-nav-label">${label}</span>${id==='world'&&arrivals?`<i>${arrivals}</i>`:''}</button>`).join('')}</nav>
      <div class="classic-header-meta">${citySwitchButtonHTML()}<span class="layout-gems">元宝 <b>${num(s.gems)}</b></span><button class="classic-info-toggle" data-action="classicInfo" aria-expanded="${classicInfoOpen}" aria-label="城池详情">城务</button><button data-action="settings" aria-label="设置与帮助">设置</button></div>
    </header>
    <div class="online-bar-host" data-online-status>${onlineStatusHTML()}</div>
    ${resourceBar}
    <div class="classic-workspace">${classicInfoOpen?'<button class="rail-backdrop" data-action="classicInfo" aria-label="关闭城池详情"></button>':''}${classicSidebar()}
      <main id="main" class="classic-content screen-${page}" aria-label="游戏主界面">${npcDefenseNoticeHTML()}${typeof otherRegionalFrontNoticeHTML==='function'?otherRegionalFrontNoticeHTML():''}${page==='city'?`<nav class="city-area-tabs" aria-label="城池区域">${btn('城内','classicNav','inner','small secondary '+(cityArea==='inner'?'active-order':''))}${btn('城外','classicNav','outer','small secondary '+(cityArea==='outer'?'active-order':''))}<span class="layout-city-hint">${cityArea==='inner'?'点击建筑办理城务，点击空地建设':'点击资源田升级，空地可自由配置产业'}</span></nav>`:''}${view}</main>
    </div>
    <footer class="classic-footer">${bulletin}${focus?'':currentObjectiveHTML()}</footer>
  </div>`;
}
function layoutCityToolsHTML(){
  return `<details class="city-side layout-city-drawer" data-ui-disclosure="layout-city-management"><summary>营造与城务 <span>${S().buildQueue.length}/${Game.buildLimit()}</span></summary><div class="layout-city-drawer-body">${classicQueuePanel()}</div></details>`;
}
function layoutMoreModal(){
  const section=(name,buttons)=>`<section class="layout-menu-group"><h3>${name}</h3><div class="more-command-grid">${buttons}</div></section>`;
  const groups=[
    section('征战与补给',btn('商城','classicNav','shop','secondary')+btn('征战与成长','webEditionHub','','secondary')+btn('掠夺找资源','webRaids','','secondary',WebEdition.shared())+btn('十阶礼包 · '+S().onboarding.claims.length+'/10','onboardingGifts','','secondary')),
    section('领地与城务',btn('领地与驻军','classicTerritory','','secondary')+btn('来袭与守城','npcDefense','','secondary')+btn('名城版图','namedCities','','secondary')+btn('城务与薪俸','governance','','secondary')+btn('伤兵营','warCare','','secondary')+btn('城池详情','classicInfo','','secondary')+btn('自动助手 · '+Game.automation.unread(S())+' 未读','automationOpen','','secondary')),
    section('记录与设置',btn('战报','classicNav','reports','secondary')+btn('消息记录','webMessages','','secondary')+btn(webAudioEnabled?'音乐 · 开':'音乐 · 关','webAudio','','secondary')+btn('设置与存档','settings','','secondary'))
  ];
  showModal('更多事务',groups.join(''),btn('关闭','close','','secondary'));
}
