'use strict';
let regionalFrontDraft=null;
function regionalFrontCurrentId(){return Game.currentCityId?.()||S().realm?.activeCity;}
function regionalFrontLabel(q){return {idle:'尚未开启',ready:'下一阶段待准备',incoming:q.arriveAt>Date.now()?'敌军行进中':'敌军已抵达',battle:'正在守城',retry:'失利 · 可重新准备',complete:'本轮守住'}[q.status]||q.status;}
function regionalFrontRewardHTML(q){return `<span>军功 +${q.merit}</span>${Object.entries(q.reward).map(([id,n])=>`<span>${esc(Game.resources[id]?.name||id)} ${num(n)}</span>`).join('')}`;}
function regionalFrontHTML(cityId=regionalFrontCurrentId()){
  if(!Game.regionalFrontStatus)return '';const q=Game.regionalFrontStatus(cityId);if(!q)return '';
  const active=q.status!=='idle'&&q.status!=='complete';
  return `<section class="regional-front-summary" aria-label="${esc(q.cityName)}区域战线"><div><strong>${esc(q.name.split(' · ')[0])}</strong><p class="hint">${active?'第 '+q.stage+' / 3 阶段 · ':''}${esc(regionalFrontLabel(q))}${q.status==='incoming'&&q.arriveAt>Date.now()?' · '+clock(q.arriveAt):q.nextAt>Date.now()?' · 整军 '+clock(q.nextAt):''}</p></div>${btn(active?'查看战线':'准备战线','regionalFront',cityId,'small secondary')}</section>`;
}
function regionalFrontModal(cityId=regionalFrontCurrentId(),level){
  const current=regionalFrontCurrentId(),q=cityId===current?Game.regionFrontQuote(level):Game.regionalFrontStatus(cityId);
  if(!q){showModal('区域战线','<p class="hint">占领粮城、矿城或关隘并接管后，可从该城主动开启战线。</p>',btn('关闭','close','','secondary'));return;}
  regionalFrontDraft={city:cityId,level:q.level,key:q.key};
  const pending=['incoming','battle'].includes(q.status),button=pending?'前往守城':q.status==='retry'?'重新准备本阶段':q.status==='ready'?'开启下一阶段':q.status==='complete'?'重新开启战线':'开启第一阶段';
  const arrival=pending?`<p class="notice">${q.status==='battle'?'本城守城战正在进行':q.arriveAt>Date.now()?'敌军预计于 '+esc(new Date(q.arriveAt).toLocaleTimeString('zh-CN'))+' 抵达 · 还需 '+clock(q.arriveAt):'敌军已抵达，等待你选择守将和驻军迎战'}。切城、离线不会自动开始战斗或结算战损。</p>`:`<p class="hint">点击后敌军行军 5 分钟才抵达。预警期间可从其他城市调遣真实部队，赶不上本波的部队继续在途。</p>`;
  const stage=q.active?q.stage:1;
  showModal(esc(q.cityName)+' · 区域战线',`<div class="regional-front-head"><strong>${esc(q.name.split(' · ')[0])}</strong><span class="badge">${esc(regionalFrontLabel(q))}</span></div><ol class="regional-front-stages" aria-label="战线阶段">${RegionalFront.stages.map((name,i)=>`<li class="${q.status==='complete'||i<stage-1?'is-done':i===stage-1?'is-current':''}">${i+1}. ${name}</li>`).join('')}</ol><label class="label" for="regional-front-level">${q.active?'本轮固定难度':'选择难度'}<select id="regional-front-level" data-regional-front-level="${esc(cityId)}" ${q.active||cityId!==current?'disabled':''}>${(q.active?[q.level]:Array.from({length:q.maxLevel},(_,i)=>i+1)).map(n=>`<option value="${n}" ${q.level===n?'selected':''}>${n} 级</option>`).join('')}</select></label>${arrival}<p class="hint">${esc(q.hint)}此处消耗本城驻军与城防；没有免费援军。</p><details class="regional-front-intel" data-ui-disclosure="regional-front-${esc(cityId)}"><summary>本阶段敌军与奖励 · ${RegionalFront.stages[q.stage-1]}</summary><div class="regional-front-roster">${Object.entries(q.army).map(([id,n])=>`<span>${esc(Game.units[id]?.name||id)} <strong>${num(n)}</strong></span>`).join('')}</div><div class="regional-front-reward">${regionalFrontRewardHTML(q)}</div><p class="hint">${q.first?'本城本阶段首奖，所有难度共享且只领一次。':'普通维持奖励；再次开启或更换难度不重发首奖。'}资源按实际入库战报结算，允许爆仓。胜利后下一阶段仍需主动开始；三阶段结束后本城整军 30 分钟。</p></details><p class="hint">失利保留城池与建筑，按现有守城规则损失士兵、工事和部分物资；补兵后可重试。未开启的城市不会因战线来袭。</p>${q.reason?`<p class="notice">${esc(q.reason)}${q.nextAt>Date.now()?' · 整军剩余 '+clock(q.nextAt):''}</p>`:''}<div class="guide-actions">${btn('查看本城驻军','regionalFrontGarrison',cityId,'small secondary')}${btn('调遣增援至此城','regionalFrontReinforce',cityId,'small secondary',Game.cityList().length<2)}${cityId===current?btn(button,pending?'regionalFrontDefend':'regionalFrontStart',cityId,'small',!pending&&!!q.reason):btn('进入此城准备','regionalFrontEnter',cityId,'small')}</div>`,btn('关闭','close','','secondary'));
  if(typeof manualModalContext!=='undefined')manualModalContext=()=>regionalFrontModal(cityId,q.level);
}
function regionalFrontChange(event){const id=event.target?.dataset?.regionalFrontLevel;if(!id)return false;regionalFrontModal(id,Number(event.target.value));return true;}
function handleRegionalFrontAction(action,id){
  if(!action.startsWith('regionalFront'))return false;
  if(action==='regionalFront'){regionalFrontModal(id);return true;}
  if(action==='regionalFrontStart'){
    const d=regionalFrontDraft;if(!d||d.city!==regionalFrontCurrentId()||id!==d.city){toast('当前城市已改变，请重新预览战线');return true;}
    const error=Game.startRegionalFront(d.level,d.key);actResult(error,'区域敌军开始行进，可查看抵达时间并准备守城');regionalFrontModal(d.city,d.level);return true;
  }
  if(action==='regionalFrontDefend'){if(id!==regionalFrontCurrentId()){toast('请先进入战线所属城市');return true;}npcDefenseModal();return true;}
  if(action==='regionalFrontEnter'||action==='regionalFrontGarrison'){
    const error=id===regionalFrontCurrentId()?null:Game.switchCity(id);if(!actResult(error,'已进入战线所属城市'))return true;
    if(action==='regionalFrontGarrison'){modal.close();page='army';render();}else {render();regionalFrontModal(id);}return true;
  }
  if(action==='regionalFrontReinforce'){
    if(id!==regionalFrontCurrentId()){cityTransferModal('redeploy',id);return true;}
    const choices=Game.cityList().filter(c=>c.id!==id);
    showModal('选择增援出发城',`<p class="hint">目的城：${esc(Game.cityMeta(id)?.name||id)}。先进入出发城，再用现有调遣界面选择真实部队、将领并预览行军时间。</p><div class="guide-actions">${choices.map(c=>btn(esc(c.name)+' · 驻军 '+num(Game.totalArmy(c.army||{})),'regionalFrontSource',c.id+'|'+id,'secondary')).join('')}</div>`,btn('返回战线','regionalFront',id,'secondary'));return true;
  }
  if(action==='regionalFrontSource'){
    const [source,destination]=String(id).split('|');if(!Game.cityMeta(source)||!Game.cityMeta(destination)||source===destination){toast('增援城市已变化，请重新选择');return true;}
    if(actResult(Game.switchCity(source),'已进入增援出发城')){render();cityTransferModal('redeploy',destination);}return true;
  }
  return false;
}
