'use strict';
function journeyModal(){
  const v=JourneySystem.view(Game),tracked=S().journey.tracked;
  showModal('征程',`<p class="hint">阶段长期保留；奖励仍在原任务领取。</p><div class="journey-list">${v.steps.map(r=>`<article class="journey-card ${v.current.id===r.id?'is-current':''}"><div class="section-title"><h3>${r.complete?'✓':'○'} ${esc(r.title)}</h3>${v.current.id===r.id?'<span class="badge">当前</span>':''}</div><p class="hint">${esc(r.status)}</p><div class="guide-actions">${btn('前往','journeyGo',r.action,'small')}${btn(tracked===r.id?'已追踪':'追踪','journeyTrack',r.id,'small secondary',tracked===r.id)}</div></article>`).join('')}</div>`,btn('科技路线','researchRouteOpen','','secondary')+btn('自动推荐','journeyTrack','','secondary',!tracked)+btn('关闭','close','','secondary'));
  manualModalContext=journeyModal;
}
function journeyGo(id){
  if(id==='build'){
    const capital=Game.cityList().find(c=>c.capital);if(!capital)return;
    if(capital.id!==Game.currentCityId()&&!actResult(Game.switchCity(capital.id)))return;
    page='city';cityArea='inner';render();
    if(Game.requirementLevel('hall')<3){manualBuildingModal('site:'+Game.primarySite('hall'));return;}
    if(Game.requirementLevel('drill')<1){const site=Game.primarySite('drill');if(site>=0)manualBuildingModal('site:'+site);else{const empty=S().cityLayout.findIndex(id=>id===null);if(empty>=0)manualBuildPlan(empty,'drill');else manualBuildingModal('site:'+Game.primarySite('hall'));}return;}
    const hero=S().generals.some(h=>(S().generalLevels[h]||1)>=5)?null:S().generals.find(h=>(S().generalLevels[h]||1)<5&&Game.heroCity(h)===capital.id);if(hero){heroDetailModal(hero);return;}modal.close();return;
  }
  if(id==='yellow'){battlefieldModal();return;}
  if(id==='hero'){heroCodexModal();return;}
  if(id==='cities'){citySwitchListModal();return;}
  if(id==='expand'){if(Game.cityLimit()<=Game.cityList().length)heritageHonorModal();else if(!ChapterData.countyOpen(S())){taskTab='chapter';classicMissionModal();}else namedCityOverviewModal();return;}
  if(id==='jiangling'){if(!Game.landmarkVisible('named_jiangling')){namedCityOverviewModal();return;}worldNodeModal('named_jiangling');}
}
document.addEventListener('click',event=>{const el=event.target.closest('[data-action]');if(!el||el.disabled)return;if(el.dataset.action==='journeyOpen')journeyModal();if(el.dataset.action==='journeyGo')journeyGo(el.dataset.id);if(el.dataset.action==='journeyTrack'&&actResult(Game.setJourneyTarget(el.dataset.id),'追踪目标已更新')){journeyModal();render();}});

let researchRoutePreview='economy';
function researchRoutesModal(id=researchRoutePreview){
  if(!ResearchRoutes.catalog().some(r=>r.id===id))id='economy';researchRoutePreview=id;
  const v=Game.researchRouteView(id),tracked=S().researchRoute.id===id;
  showModal('科技路线',`<div class="research-route-tabs">${Game.researchRoutes().map(r=>btn(r.name,'researchRouteOpen',r.id,'secondary'+(id===r.id?' is-selected':''))).join('')}</div><section class="panel"><h3>${esc(v.name)}路线 ${tracked?'· 已追踪':''}</h3><p class="notice">${esc(v.complete?v.status:'目标：'+v.target.name+' '+v.target.level+'级 · 下一步：'+v.status)}</p><p>${S().autoResearch?'自动研究已开启':'自动研究已暂停'} · ${esc(Game.autoResearchStatus())}</p><div class="guide-actions">${btn(tracked?'已追踪':'追踪','researchRouteTrack',id,'small',tracked)}${btn('前往','researchRouteGo',id,'small secondary',v.complete)}${btn(S().autoResearch?'暂停自动':'开启自动','researchRouteAuto',id,'small secondary',!S().autoResearch&&!tracked)}</div>${!tracked?'<p class="hint">先追踪此路线，再开启自动；当前自动仍按已追踪路线或原挂机偏好运行。</p>':''}<details class="compact-details"><summary>目标与规则</summary><p>追踪不自动开研究。自动开启后按本路线的真实前置研究；建筑需自行建设，资源保留额仍生效。各城独立，路线完成后继续沿原挂机偏好。</p>${v.targets.map(t=>`<p>${esc(t.name)} ${t.current} / ${t.level}级 ${t.current>=t.level?'✓':''}</p>`).join('')}</details></section>`,btn('原科技册','manualResearch','','secondary')+btn('停止追踪','researchRouteTrack','','secondary',!S().researchRoute.id)+btn('关闭','close','','secondary'));
  manualModalContext=()=>researchRoutesModal(id);
}
function researchRouteGo(id=S().researchRoute.id||researchRoutePreview){
  const m=Game.researchRouteView(id)?.next;if(!m)return;
  if(m.kind==='building'){page='city';cityArea=Object.hasOwn(Game.plotTypes,m.id)?'outer':'inner';render();if(Object.hasOwn(Game.plotTypes,m.id))plotPlan(m.site,m.id);else if(S().cityLevels[m.site])manualBuildingModal('site:'+m.site);else manualBuildPlan(m.site,m.id);return;}
  if(m.kind==='tech'){manualResearchModal();modalBody.querySelector(`[data-guide-tech="${m.id}"]`)?.scrollIntoView({block:'start'});return;}
  if(m.kind==='queue'){classicQueuesModal();return;}
  if(m.kind==='item'){shopCategory='全部';page='shop';render();return;}
  toast(m.status);
}
document.addEventListener('click',event=>{const el=event.target.closest('[data-action]');if(!el||el.disabled)return;const a=el.dataset.action,id=el.dataset.id;if(a==='researchRouteOpen')researchRoutesModal(id||S().researchRoute.id||researchRoutePreview);if(a==='researchRouteTrack'&&actResult(Game.setResearchRoute(id),'科技追踪已更新')){researchRoutesModal(id||researchRoutePreview);render();}if(a==='researchRouteGo')researchRouteGo(id);if(a==='researchRouteAuto'){if(!S().autoResearch&&S().researchRoute.id!==id){toast('先追踪此路线，再开启自动');researchRoutesModal(id);return;}if(actResult(Game.setAutoResearch(!S().autoResearch),'自动研究状态已更新'))researchRoutesModal(id);}});
