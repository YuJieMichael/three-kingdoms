'use strict';
// UI drafts stay outside the save. Every cost and eligibility check comes from Game.
const sandboxRouteSelections=new Map();
let sandboxPendingTask=null;
function sandboxSelectedRouteId(nodeId){return sandboxRouteSelections.get(nodeId)||'direct';}
function sandboxDispatchOptions(){
  const node=document.getElementById('dispatch-mode')?.dataset.node,mode=document.getElementById('dispatch-mode')?.value;
  const target=node&&Game.getNode(node);if(!target||target.orderRoute||!Number.isFinite(target.x)||!Number.isFinite(target.y))return null;
  return {routeId:sandboxSelectedRouteId(node),taskId:mode==='raid'&&modalBody.dataset.sandboxTask||''};
}
function sandboxIntelHTML(n){
  const intel=Game.intel(n.id),exact=!!(intel?.exact||intel?.public),precision=intel?.precision||(exact?'exact':intel?'bands':'unknown');
  const labels={exact:'精确情报',bands:'兵力区间',types:'已知兵种',unknown:'守军未知',expired:'情报已过期',failed:'侦察未成功'};
  return `<div class="sandbox-intel ${exact?'known':'unknown'}"><span class="sandbox-overline">${intel?.public?'守军公开':labels[precision]||'守军未知'}</span>${exact?enemyIntelHTML(n):'<p>侦察后查看兵种与兵力。依据当前情报配兵。</p>'}${!exact&&intel?`<details><summary>已知情报</summary>${enemyIntelHTML(n)}</details>`:''}</div>`;
}
function sandboxRewardHTML(reward){return Object.entries(reward||{}).filter(([,value])=>value>0).map(([id,value])=>`<span>${esc(Game.resources[id]?.name||id)} <b>+${num(value)}</b></span>`).join('');}
function sandboxTaskCardsHTML(tasks,full=false){
  return tasks.map(t=>`<article class="sandbox-task ${t.status}" data-sandbox-task="${esc(t.id)}"><div><span class="sandbox-overline">${({available:t.cadence==='daily'?'每日军务':'军务',march:'执行中',ready:'可领取',claimed:t.cadence==='daily'?'今日已领':'已完成'})[t.status]||'军务'}</span><strong>${esc(t.title)}</strong>${full?`<p>${esc(t.description)}</p>`:''}<div class="sandbox-task-reward">${sandboxRewardHTML(t.reward)}</div>${t.reason?`<p class="hint">${esc(t.reason)}</p>`:''}${t.status==='claimed'&&t.cadence==='daily'&&Number.isFinite(t.nextAt)?`<p class="hint">北京时间 05:00 刷新 · ${clock(t.nextAt)}</p>`:''}</div>${t.status==='ready'?btn('领取补给','sandboxTaskClaim',t.id,'small'):t.status==='claimed'?'<span class="sandbox-complete">✓ 已入库</span>':btn(t.status==='march'?'查看行军':'查看目标','sandboxTaskGo',t.id,'small secondary')}</article>`).join('');
}
function sandboxTasksHTML(){
  const tasks=(Game.sandboxTasks?.()||[]).filter(t=>t.status!=='claimed');
  return `<section class="sandbox-military" aria-label="沙盘军务"><div class="section-title"><h3>军务 · 战线补给</h3>${btn('全部军务','sandboxTasks','','small secondary')}</div>${tasks.length?sandboxTaskCardsHTML(tasks.slice(0,2)):'<p class="hint">推进章节解锁军务；每日军务北京时间 05:00 刷新。已领补给可在全部军务查看。</p>'}</section>`;
}
function sandboxRouteCardsHTML(nodeId,army,general='',interactive=true){
  const routes=Game.sandboxRoutes?.(nodeId,army,general)||[],selected=sandboxSelectedRouteId(nodeId);
  if(!routes.length)return '';
  return `<div class="sandbox-routes" role="group" aria-label="进军路线">${routes.map(route=>`<button type="button" class="sandbox-route ${route.id===selected?'is-selected':''}" ${interactive?`data-action="sandboxRouteChoice" data-id="${esc(nodeId)}|${esc(route.id)}"`:''} aria-pressed="${route.id===selected}" ${!route.available?'disabled':''}><span><strong>${esc(route.name)}</strong><small>${esc(route.description||'')}</small></span><span class="sandbox-route-quote">${Number.isFinite(route.seconds)?duration(route.seconds):'配兵后报价'}<small>${Number.isFinite(route.foodCost)?'耗粮 '+num(route.foodCost):''}</small></span>${route.reason?`<em>${esc(route.reason)}</em>`:''}</button>`).join('')}</div>`;
}
function sandboxTargetHTML(n){
  const s=S(),friendly=Game.cityMeta?.(n.id)||s.conquered[n.id]&&Game.isCity(n),home=Game.currentHome?.()||Game.home;
  const distance=Number.isFinite(n.x)?Math.hypot(n.x-home.x,n.y-home.y).toFixed(1):null;
  if(n.orderRoute)return `${namedCityDetailsHTML(n)}${classicTargetActions(n)}`;
  if(friendly||s.conquered[n.id]&&n.wild)return `${cityStrategyHTML(n)}${campaignNodeDetails(n)}${cityMapActionsHTML(n)}`;
  const intel=Game.intel(n.id),known=!!(intel?.exact||intel?.public),task=(Game.sandboxTasks?.()||[]).find(t=>t.node===n.id&&t.status!=='claimed'),blocked=ChapterData.blocked(s,n.id);
  const raidReason=Game.attackBlocked(n.id,'raid'),occupyReason=Game.attackBlocked(n.id,'occupy'),raid=known?Game.attackInfo(n.id,'raid'):null;
  return `<p class="coordinate-tag">${esc(activeCityMeta().name)}出发${distance===null?'':` · ${distance} 格 · (${n.x}, ${n.y})`}</p>${sandboxIntelHTML(n)}${blocked?`<p class="notice">${esc(blocked)}</p>`:''}${n.fortification?`<p class="sandbox-siege">城防 ${esc(n.fortification.name)} · 占领需破城歼敌，配备冲车或投石车。</p>`:''}<section class="sandbox-target-loot"><span class="sandbox-overline">胜利缴获 · 受幸存部队负重限制</span>${known?sandboxRewardHTML(raid.loot):'<p>资源数量未知，先派斥候取得情报。</p>'}${n.reward?`<p class="hint">占领效果：${esc(n.reward)}</p>`:''}</section><div class="sandbox-target-actions">${btn(S().army.scout>0?'侦察':'侦察 · 缺斥候','scoutPlan',n.id,'secondary',!!blocked||S().army.scout<1)}${btn('配兵掠夺','campaignDispatch',n.id+':raid','',!!raidReason)}${btn('配兵占领','campaignDispatch',n.id+':occupy','secondary',!!occupyReason)}</div>${raidReason&&occupyReason?`<p class="hint">${esc(raidReason)}${occupyReason!==raidReason?' · '+esc(occupyReason):''}</p>`:''}${task?`<section class="sandbox-target-task"><span class="sandbox-overline">${esc(task.title)}</span><p>${esc(task.description)}</p><div class="sandbox-task-reward">${sandboxRewardHTML(task.reward)}</div>${task.status==='ready'?btn('领取军务补给','sandboxTaskClaim',task.id,'small'):task.status==='available'?btn('配兵执行军务','sandboxTaskDispatch',task.id,'small',!!task.reason):'<p class="hint">任务队伍已出发，完成后回此领取。</p>'}</section>`:''}<details class="sandbox-route-details" data-ui-disclosure="sandbox-route-${n.id}"><summary>进军路线 · 弓兵 1 人参考</summary>${sandboxRouteCardsHTML(n.id,{archer:1})}<p class="hint">路线时间和粮耗随实际兵种、人数、主将与城池变化，配兵时重新报价。</p></details><details class="world-target-details" data-ui-disclosure="target-details-${n.id}"><summary>据点详情与战利品规则</summary><p>${esc(n.desc||'')}</p>${factionCampHTML(n.id)}${worldWildLeadSummaryHTML(n)}${cityStrategyHTML(n)}${namedCityDetailsHTML(n)}${wildGeneralNodeHTML(n)}${known?campaignNodeDetails(n):'<p class="hint">完成侦察后查看可缴获数量；配兵与结算按真实规则执行。</p>'}${cityMapActionsHTML(n)}${worldTargetFavoriteButton(n.id)}</details>`;
}
function sandboxTargetQuickHTML(n){
  const friendly=Game.cityMeta?.(n.id)||S().conquered[n.id],intel=Game.intel(n.id),known=!!(intel?.exact||intel?.public),mode=n.orderRoute?'occupy':'raid',reason=Game.attackBlocked(n.id,mode);
  const summary=friendly?'己方领地 · 查看驻军与城务':known?'情报已取得 · 配兵查看实际缴获与路线':'守军未知 · 先侦察，再按情报配兵';
  return `<div class="sandbox-target-quick"><p>${esc(summary)}</p><div class="sandbox-quick-actions">${friendly?btn('领地详情','sandboxTargetExpand','','secondary'):btn(S().army.scout?'侦察':'侦察 · 缺斥候','scoutPlan',n.id,'secondary',!S().army.scout)+btn('配兵出征','campaignDispatch',n.id+':'+mode,'',!!reason)}${btn(mapSheetOpen?'收起详情':'目标详情',mapSheetOpen?'mapSheetClose':'sandboxTargetExpand','','secondary')}</div></div>`;
}
function sandboxWorldPage(){
  if(S().battle&&!S().battle.finished)return battlePage();
  const n=cityViewNode(Game.getNode(Game.landmarkVisible(selectedNode)?selectedNode:'field')||Game.getNode('field'));
  return `<section class="world-command-page sandbox-world"><div class="sandbox-map-heading"><div><span class="sandbox-overline">山河策 · 沙盘征战</span><h2>青溪战区</h2></div><span class="sandbox-region-note">试玩战区 · 64 × 64</span></div>${expeditionStrip()}<div class="layout world-layout"><div class="world-map-main">${worldMap()}</div><aside class="panel node-panel world-target-panel sandbox-target${mapSheetOpen?' map-sheet-open':''}" aria-label="当前地图目标"><div class="section-title"><div><span class="sandbox-overline">${S().conquered[n.id]?'己方领地':'当前目标'}</span><h3>${esc(n.name)}</h3></div><span class="sandbox-level">${n.level}级</span></div>${sandboxTargetQuickHTML(n)}<div class="sandbox-target-full">${sandboxTargetHTML(n)}</div></aside></div>${sandboxTasksHTML()}${worldBattleReceiptHTML()}${worldMarchPathsHTML()}<details class="world-tool-details sandbox-map-reference" data-ui-disclosure="sandbox-map-guide"><summary>战区导航与势力</summary>${yellowCityLinksHTML()}${typeof landmarkLinks==='function'?landmarkLinks():''}<p class="hint">拖动查看周边。军队按出发时路线行进；已在途队伍保留原定抵达时间。</p></details></section>`;
}
function sandboxNextTarget(){
  const next=Game.nextLandmark?.();if(next&&Game.landmarkVisible(next.id))return next;
  const task=(Game.sandboxTasks?.()||[]).find(t=>t.status==='available');return task?Game.getNode(task.node):null;
}
function sandboxAfterBattleHTML(report){
  if(!report)return '';
  const next=sandboxNextTarget(),tasks=(Game.sandboxTasks?.()||[]).filter(t=>t.status==='ready');
  return `<section class="sandbox-after-battle" aria-label="战后下一步"><div><span class="sandbox-overline">战后整备</span><strong>治疗 → 补兵 → 推进战线</strong><p>以${esc(Game.cityMeta?.(report.sourceCity)?.name||'出发城')}当前伤兵、驻军与训练队列为准。</p></div><div class="sandbox-after-actions">${btn('治疗与补兵','trainingRecovery',report.sourceCity||'capital','small secondary')}${next?btn('下一目标 · '+esc(next.name),'worldTargetGo',next.id,'small'):btn('成长目标','classicObjectives','','small')}${tasks.map(t=>btn('领取 · '+esc(t.title),'sandboxTaskClaim',t.id,'small')).join('')}</div></section>`;
}
function sandboxTroopRole(id){const u=Game.units[id];return u?`${u.role} · 射程 ${u.range} · 速度 ${u.speed}`:'';}
function sandboxGeneralRoleHTML(id){
  if(!id)return '<p class="hint">选择空闲将领后查看兵种定位。</p>';
  const hero=Game.general(id),trait=HeroTraits.describe(HeroTraits.profile(S(),id),hero);
  return `<div class="sandbox-general-role">${generalPortrait(hero,'sandbox-general-portrait')}<div><strong>${esc(hero.name)} · Lv.${hero.level}</strong><p>${esc(trait)}</p><small>统率 ${num(hero.lead||0)} · 攻击 ${num(hero.atk)} · 防御 ${num(hero.def)}</small></div></div>`;
}
function sandboxDispatchRefresh(){
  const mode=document.getElementById('dispatch-mode'),node=mode?.dataset.node;if(!node)return;
  const army=dispatchArmy(),general=document.getElementById('dispatch-general')?.value||'',options=sandboxDispatchOptions();
  const routes=document.getElementById('sandbox-dispatch-routes');if(routes)routes.innerHTML=sandboxRouteCardsHTML(node,army,general);
  const role=document.getElementById('sandbox-general-role');if(role)role.innerHTML=sandboxGeneralRoleHTML(general);
  const task=(Game.sandboxTasks?.()||[]).find(t=>t.id===modalBody.dataset.sandboxTask),taskInfo=document.getElementById('sandbox-dispatch-task');
  if(taskInfo)taskInfo.innerHTML=task?`<strong>${esc(task.title)}</strong><p>${mode.value==='raid'?'本次按军务出征；胜利后回地图领取补给。':'本次选择占领，不计此项掠夺军务。'}</p>${sandboxRewardHTML(task.reward)}`:'';
  const q=options&&Game.sandboxRouteQuote?.(node,army,general,options.routeId),march=document.getElementById('campaign-march-preview');
  if(q&&march)march.innerHTML=Number.isFinite(q.seconds)&&Number.isFinite(q.foodCost)?`<div class="sandbox-march-total"><span>${esc(q.name)} · 去程 <b>${duration(q.seconds)}</b></span><span>行军耗粮 <b>${num(q.foodCost)}</b></span><small>预计返程 ${duration(q.returnSeconds)} · ${esc(q.reason||'按当前配兵报价，确认时再次校验')}</small></div>`:`<p class="notice">${esc(q.reason||'选择兵种、人数与主将后查看路线报价。')}</p>`;
  const status=document.getElementById('dispatch-status'),check=Game.dispatchCheck(node,general,army,mode.value,options),start=modalBody.querySelector('[data-action="dispatch"]');
  if(start)start.disabled=!!check.reason;
  if(status){status.classList.toggle('blocked',!!check.reason);status.innerHTML=`<span>${general?esc(Game.general(general).name):'未选主将'} · <strong>${num(Game.totalArmy(army))}</strong> / ${num(Game.armyLimit())} 人</span>${check.reason?`<strong class="dispatch-reason">${esc(check.reason)}</strong>`:'<span class="dispatch-ok">可以出征</span>'}`;}
}
function sandboxDecorateDispatch(){
  const mode=document.getElementById('dispatch-mode');if(!mode)return;
  const node=mode.dataset.node,n=Game.getNode(node);modal.classList.add('sandbox-dispatch-dialog');
  if(sandboxPendingTask?.node===node)modalBody.dataset.sandboxTask=sandboxPendingTask.id;else delete modalBody.dataset.sandboxTask;
  sandboxPendingTask=null;
  mode.before(Object.assign(document.createElement('div'),{className:'sandbox-dispatch-target',innerHTML:`<span class="sandbox-overline">${esc(n.name)} · ${n.level}级 · ${n.orderRoute?'军令战场':`(${n.x}, ${n.y})`}</span><details><summary>查看已知守军</summary>${sandboxIntelHTML(n)}</details><div id="sandbox-dispatch-task"></div>`}));
  const general=document.getElementById('dispatch-general');general.after(Object.assign(document.createElement('div'),{id:'sandbox-general-role'}));
  for(const block of modalBody.querySelectorAll('.dispatch-unit')){
    const id=block.querySelector('[data-army-number]')?.dataset.armyNumber;if(!id)continue;
    const hint=document.createElement('small');hint.className='sandbox-unit-role';hint.textContent=sandboxTroopRole(id);block.querySelector('.row').after(hint);
  }
  const remaining=Object.entries(Game.units).filter(([id])=>!modalBody.querySelector(`[data-army-number="${id}"]`));
  const library=document.createElement('details');library.className='sandbox-unit-library';library.innerHTML=`<summary>十二兵种图鉴 · ${remaining.length} 种尚无驻军</summary><div>${Object.entries(Game.units).map(([id,u])=>`<article><strong>${esc(u.name)}</strong><small>${esc(sandboxTroopRole(id))}</small><span>${S().army[id]>0?'驻城 '+num(S().army[id]):Game.unitRequirements(id)||'已解锁，可招募'}</span>${btn('条件与费用','troopDetail',id,'small secondary')}</article>`).join('')}</div>`;
  document.getElementById('campaign-march-preview').before(library,Object.assign(document.createElement('section'),{id:'sandbox-dispatch-routes'}));
  sandboxDispatchRefresh();
}
function sandboxTasksModal(){showModal('沙盘军务',`<p class="hint">从军务卡配兵，战胜对应守军后领取补给。各项次数与重置见任务说明；战利品照常按战斗结算。</p>${sandboxTaskCardsHTML(Game.sandboxTasks?.()||[],true)}`,btn('返回地图','close','','secondary'));manualModalContext=sandboxTasksModal;}
function installSandboxUI(){
  if(typeof document==='undefined'||typeof document.querySelector!=='function')return;
  worldPage=sandboxWorldPage;
  const originalDispatch=campaignDispatchModal;campaignDispatchModal=function(...args){originalDispatch(...args);sandboxDecorateDispatch();sandboxPendingTask=null;};
  const originalUpdateDispatch=updateDispatch;updateDispatch=function(...args){originalUpdateDispatch(...args);sandboxDispatchRefresh();};
  const originalReports=reportsPage;reportsPage=function(){return sandboxAfterBattleHTML(S().reports[0])+originalReports();};
  const originalReceipt=worldBattleReceiptHTML;worldBattleReceiptHTML=function(){return originalReceipt()+sandboxAfterBattleHTML(S().reports[0]);};
  const originalShow=showModal;showModal=function(...args){modal.classList.remove('sandbox-dispatch-dialog');delete modalBody.dataset.sandboxTask;originalShow(...args);};
  document.addEventListener('click',event=>{
    const el=event.target.closest('[data-action]');if(!el||el.disabled)return;const {action,id=''}=el.dataset;
    if(action==='sandboxRouteChoice'){
      const [node,routeId]=id.split('|'),dispatch=document.getElementById('dispatch-mode')?.dataset.node===node;
      const route=(Game.sandboxRoutes?.(node,dispatch?dispatchArmy():{archer:1},dispatch?document.getElementById('dispatch-general')?.value||'':'')||[]).find(r=>r.id===routeId);
      if(!route?.available){toast(route?.reason||'路线已不可用，请重新选择');return;}
      sandboxRouteSelections.set(node,routeId);if(dispatch)sandboxDispatchRefresh();else render();
    }
    if(action==='sandboxTasks')sandboxTasksModal();
    if(action==='sandboxTargetExpand'){mapSheetOpen=true;render();}
    if(action==='sandboxTaskGo'){
      const task=(Game.sandboxTasks?.()||[]).find(t=>t.id===id),n=task&&Game.getNode(task.node);if(!n)return;
      modal.close();page='world';selectedNode=n.id;mapSheetOpen=true;centerWorld(n.x,n.y,false);render();
    }
    if(action==='sandboxTaskDispatch'){
      const task=(Game.sandboxTasks?.()||[]).find(t=>t.id===id);if(!task||task.status!=='available'){toast('军务状态已改变，请重新查看');return;}
      sandboxPendingTask=task;dispatchModal(task.node,'raid');
    }
    if(action==='sandboxTaskClaim'){
      if(!Game.saveSessionInfo().writable){toast(Game.saveSessionInfo().reason);return;}
      if(actResult(Game.claimSandboxTask(id),'军务补给已收入当前城池')){if(modal.open&&manualModalContext===sandboxTasksModal)sandboxTasksModal();else if(modal.open)modal.close();}
    }
  });
  render();
}
