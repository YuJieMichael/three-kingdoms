'use strict';
const ArmyOverview=(()=>{
  function timing(row,now=Date.now()){
    if(!row||!['march','return'].includes(row.phase)||![row.start,row.end,now].every(value=>typeof value==='number'&&Number.isFinite(value))||row.end<=row.start)return null;
    const totalMs=row.end-row.start,elapsedMs=Math.min(totalMs,Math.max(0,now-row.start)),remainingMs=Math.min(totalMs,Math.max(0,row.end-now));
    return {phase:row.phase,start:row.start,end:row.end,totalMs,elapsedMs,remainingMs,progress:Math.min(100,Math.max(0,elapsedMs/totalMs*100)),arrived:row.phase==='march'&&now>=row.end};
  }
  function formatDuration(ms){
    const seconds=Number.isFinite(ms)?Math.max(0,Math.ceil(ms/1000)):0,days=Math.floor(seconds/86400),hours=Math.floor(seconds%86400/3600),minutes=Math.floor(seconds%3600/60),rest=seconds%60;
    return `${days?days+' 天 ':''}${days||hours?hours+' 小时 ':''}${days||hours||minutes?minutes+' 分 ':''}${rest} 秒`;
  }
  function formatArrival(timestamp){
    if(typeof timestamp!=='number'||!Number.isFinite(timestamp))return '时间待确认';
    const date=new Date(timestamp);
    return Number.isFinite(date.getTime())?date.toLocaleString('zh-CN',{year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',second:'2-digit',hour12:false}):'时间待确认';
  }
  function model(game){
    const s=game.state,count=army=>game.totalArmy(army),rows=[];
    for(const [node,g] of Object.entries(s.garrisons))rows.push({kind:'garrison',node,general:g.general,army:{...g.army},phase:g.phase,start:g.start,end:g.end});
    for(const e of game.allExpeditions())rows.push({kind:'expedition',node:e.node,general:e.general,army:{...e.army},phase:e.phase,start:e.start,end:e.end,mode:e.mode,returnAfterOccupy:!!e.returnAfterOccupy});
    const city=count(s.army),field=rows.filter(r=>r.kind==='expedition').reduce((n,r)=>n+count(r.army),0),stationed=rows.filter(r=>r.kind==='garrison').reduce((n,r)=>n+count(r.army),0),defense=count(NPCDefense.heldArmy(s));
    return {city,field,stationed,defense,total:city+field+stationed+defense,rows};
  }
  return {model,timing,formatDuration,formatArrival};
})();
function armyDeploymentTimingHTML(row,now=Date.now()){
  const timing=ArmyOverview.timing(row,now);
  if(!timing)return ['march','return'].includes(row.phase)?'<p class="hint">行进时间待确认。</p>':'';
  if(timing.arrived)return `<div class="deployment-arrived"><strong>已抵达，等待进入战斗</strong><p class="hint">本段行军 ${ArmyOverview.formatDuration(timing.totalMs)} · 抵达时间 ${esc(ArmyOverview.formatArrival(timing.end))}</p></div>`;
  const direction=row.phase==='return'?'返城':'抵达',percent=Math.floor(timing.progress),remaining=ArmyOverview.formatDuration(timing.remainingMs);
  return `<div class="deployment-timing" data-army-timing data-deployment-phase="${row.phase}" data-deployment-start="${timing.start}" data-deployment-end="${timing.end}"><p class="deployment-time-main"><span>${direction}剩余</span><strong data-deployment-remaining>${remaining}</strong></p><div class="deployment-route-progress" role="progressbar" aria-label="${direction}进度" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${percent}" aria-valuetext="${direction}剩余 ${remaining}"><i data-deployment-progress style="width:${timing.progress}%"></i></div><p class="deployment-time-details"><span>已行进 <span data-deployment-elapsed>${ArmyOverview.formatDuration(Math.floor(timing.elapsedMs/1000)*1000)}</span> / 全程 ${ArmyOverview.formatDuration(timing.totalMs)}</span><span data-deployment-percent>${percent}%</span></p><p class="deployment-arrival-time">预计${direction} <span>${esc(ArmyOverview.formatArrival(timing.end))}</span>（本地时间）</p></div>`;
}
function refreshArmyDeploymentValues(now=Date.now()){
  document.querySelectorAll('[data-army-timing]').forEach(block=>{
    const timing=ArmyOverview.timing({phase:block.dataset.deploymentPhase,start:Number(block.dataset.deploymentStart),end:Number(block.dataset.deploymentEnd)},now);if(!timing)return;
    const remaining=ArmyOverview.formatDuration(timing.remainingMs),percent=Math.floor(timing.progress),direction=timing.phase==='return'?'返城':'抵达',setText=(selector,text)=>{const el=block.querySelector(selector);if(el&&el.textContent!==text)el.textContent=text;};
    setText('[data-deployment-remaining]',remaining);setText('[data-deployment-elapsed]',ArmyOverview.formatDuration(Math.floor(timing.elapsedMs/1000)*1000));setText('[data-deployment-percent]',percent+'%');
    const progress=block.querySelector('[data-deployment-progress]');if(progress)progress.style.width=timing.progress+'%';
    const bar=block.querySelector('[role="progressbar"]');if(bar){bar.setAttribute('aria-valuenow',String(percent));bar.setAttribute('aria-valuetext',direction+'剩余 '+remaining);}
  });
}
function armyDeploymentHTML(){
  const s=S(),m=ArmyOverview.model(Game),now=Date.now(),labels={stationed:'野地驻扎',march:'行军中',battle:'交战中',return:'返城中'};
  const cards=m.rows.map(r=>{
    const n=Game.getNode(r.node),locationName=n.name.replace(/\s*\(\d+,\s*\d+\)$/,''),gathering=r.kind==='garrison'&&s.gatherings[r.node],arrived=ArmyOverview.timing(r,now)?.arrived,status=gathering?'驻扎 · 采集中':arrived?'已抵达':labels[r.phase],food=Game.upkeep(r.army)*(r.phase==='stationed'?2:1);
    const actions=r.kind==='garrison'?btn('查看驻地','armyDeploymentView',r.node,'small secondary')+(gathering?btn('查看采集','heritageGather',r.node,'small secondary'):'')+btn(r.phase==='return'?'正在返城':gathering?'先结束采集':'召回驻军','garrisonRecall',r.node,'small secondary',r.phase!=='stationed'||!!gathering):btn(r.phase==='battle'?'查看战斗':'查看目标',r.phase==='battle'?'armyDeploymentBattle':'armyDeploymentView',r.node,'small secondary')+(arrived?btn('进入战斗','manualExpeditionBattle',r.node,'small'):r.phase==='march'?btn('召回部队','manualExpeditionRecall',r.node,'small secondary'):'');
    return `<article class="army-deployment-card" aria-label="${esc(n.name)}部队"><div class="quest-heading"><h4>${esc(locationName)} <small>(${n.x}, ${n.y})</small></h4><span class="badge">${status}</span></div>${r.kind==='expedition'?`<p class="hint">本次任务：${n.orderRoute?'讨伐':r.mode==='raid'?'掠夺':'占领'}</p>`:''}<p class="deployment-commander">主将 ${esc(Game.general(r.general).name)} · <strong>${num(Game.totalArmy(r.army))} 人</strong></p><div class="deployment-troops">${Object.entries(r.army).filter(([,count])=>count>0).map(([id,count])=>`<span>${Game.units[id].name} <strong>${num(count)}</strong></span>`).join('')||'<span>暂无士兵</span>'}</div>${armyDeploymentTimingHTML(r,now)}<p class="hint">${r.phase==='stationed'?'驻扎耗粮为城内的 2 倍':r.phase==='battle'?'战损以战斗结算为准':r.phase==='return'?'返回城内':arrived?'等待指令':'前往目标'} · 耗粮 ${num(food)}/小时</p>${r.kind==='expedition'&&n.wild&&r.mode==='occupy'&&r.phase!=='return'?`<p class="hint">占领成功后：${r.returnAfterOccupy?'返回城内，保留领地与加成':'驻扎野地，耗粮翻倍'}。</p>`:''}${gathering?'<p class="hint">收获或取消采集后，才能召回驻军。</p>':''}<div class="deployment-actions">${actions}</div></article>`;
  }).join('');
  return `<section class="panel army-overview" aria-label="全军概览"><div class="section-title"><h3>全军概览</h3><span class="badge">现役 ${num(m.total)} 人</span></div><div class="army-overview-counts">${[['城内',m.city],['出征 / 返城',m.field],['野地驻军 / 返城',m.stationed],['守城参战',m.defense]].map(([label,count])=>`<div><span>${label}</span><strong>${num(count)}</strong></div>`).join('')}</div><p class="hint">下方兵种卡显示城内可配兵数量；在外部队单独列出，交战兵力在结算后更新。</p>${m.defense?btn('查看守城部队','npcDefense','','small secondary'):''}<div class="section-title deployment-title"><h3>在外部队</h3><span class="label">${m.rows.length} 支</span></div>${cards?`<div class="army-deployment-grid">${cards}</div>`:'<p class="empty">暂无出征或驻军部队。占领野地后的驻军会显示在这里。</p>'}</section>`;
}
document.addEventListener('click',event=>{
  const el=event.target.closest('[data-action]');if(!el||el.disabled)return;
  if(el.dataset.action==='armyDeploymentView'){page='world';selectedNode=el.dataset.id;render();worldNodeModal(el.dataset.id);}
  if(el.dataset.action==='armyDeploymentBattle'){if(S().expedition?.node!==el.dataset.id){const error=Game.selectExpedition(el.dataset.id);if(error){toast(error);return;}}page='world';selectedNode=el.dataset.id;modal.close();render();}
});
