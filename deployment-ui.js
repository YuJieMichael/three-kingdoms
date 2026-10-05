'use strict';
const ArmyOverview=(()=>{
  function model(game){
    const s=game.state,count=army=>game.totalArmy(army),rows=[];
    for(const [node,g] of Object.entries(s.garrisons))rows.push({kind:'garrison',node,general:g.general,army:{...g.army},phase:g.phase,start:g.start,end:g.end});
    for(const e of game.allExpeditions())rows.push({kind:'expedition',node:e.node,general:e.general,army:{...e.army},phase:e.phase,start:e.start,end:e.end,mode:e.mode,returnAfterOccupy:!!e.returnAfterOccupy});
    const city=count(s.army),field=rows.filter(r=>r.kind==='expedition').reduce((n,r)=>n+count(r.army),0),stationed=rows.filter(r=>r.kind==='garrison').reduce((n,r)=>n+count(r.army),0),defense=count(NPCDefense.heldArmy(s));
    return {city,field,stationed,defense,total:city+field+stationed+defense,rows};
  }
  return {model};
})();
function armyDeploymentHTML(){
  const s=S(),m=ArmyOverview.model(Game),labels={stationed:'野地驻扎',march:'行军中',battle:'交战中',return:'返城中'};
  const cards=m.rows.map(r=>{
    const n=Game.getNode(r.node),locationName=n.name.replace(/\s*\(\d+,\s*\d+\)$/,''),gathering=r.kind==='garrison'&&s.gatherings[r.node],arrived=r.phase==='march'&&r.end<=Date.now(),status=gathering?'驻扎 · 采集中':arrived?'已抵达':labels[r.phase],food=Game.upkeep(r.army)*(r.phase==='stationed'?2:1);
    const actions=r.kind==='garrison'?btn('查看驻地','armyDeploymentView',r.node,'small secondary')+(gathering?btn('查看采集','heritageGather',r.node,'small secondary'):'')+btn(r.phase==='return'?'正在返城':gathering?'先结束采集':'召回驻军','garrisonRecall',r.node,'small secondary',r.phase!=='stationed'||!!gathering):btn(r.phase==='battle'?'查看战斗':'查看目标',r.phase==='battle'?'armyDeploymentBattle':'armyDeploymentView',r.node,'small secondary')+(arrived?btn('进入战斗','manualExpeditionBattle',r.node,'small'):r.phase==='march'?btn('召回部队','manualExpeditionRecall',r.node,'small secondary'):'');
    return `<article class="army-deployment-card" aria-label="${esc(n.name)}部队"><div class="quest-heading"><h4>${esc(locationName)} <small>(${n.x}, ${n.y})</small></h4><span class="badge">${status}</span></div><p class="deployment-commander">主将 ${esc(Game.general(r.general).name)} · <strong>${num(Game.totalArmy(r.army))} 人</strong></p><div class="deployment-troops">${Object.entries(r.army).filter(([,count])=>count>0).map(([id,count])=>`<span>${Game.units[id].name} <strong>${num(count)}</strong></span>`).join('')||'<span>暂无士兵</span>'}</div><p class="hint">${r.phase==='stationed'?'驻扎耗粮为城内的 2 倍':r.phase==='return'?'返城剩余 '+clock(r.end,r.start):r.phase==='battle'?'战损以战斗结算为准':arrived?'等待进入战斗':'抵达剩余 '+clock(r.end,r.start)} · 耗粮 ${num(food)}/小时</p>${r.kind==='expedition'&&n.wild&&r.mode==='occupy'&&r.phase!=='return'?`<p class="hint">占领成功后：${r.returnAfterOccupy?'返回城内，保留领地与加成':'驻扎野地，耗粮翻倍'}。</p>`:''}${gathering?'<p class="hint">收获或取消采集后，才能召回驻军。</p>':''}<div class="deployment-actions">${actions}</div></article>`;
  }).join('');
  return `<section class="panel army-overview" aria-label="全军概览"><div class="section-title"><h3>全军概览</h3><span class="badge">现役 ${num(m.total)} 人</span></div><div class="army-overview-counts">${[['城内',m.city],['出征 / 返城',m.field],['野地驻军 / 返城',m.stationed],['守城参战',m.defense]].map(([label,count])=>`<div><span>${label}</span><strong>${num(count)}</strong></div>`).join('')}</div><p class="hint">下方兵种卡显示城内可配兵数量；在外部队单独列出，交战兵力在结算后更新。</p>${m.defense?btn('查看守城部队','npcDefense','','small secondary'):''}<div class="section-title deployment-title"><h3>在外部队</h3><span class="label">${m.rows.length} 支</span></div>${cards?`<div class="army-deployment-grid">${cards}</div>`:'<p class="empty">暂无出征或驻军部队。占领野地后的驻军会显示在这里。</p>'}</section>`;
}
document.addEventListener('click',event=>{
  const el=event.target.closest('[data-action]');if(!el||el.disabled)return;
  if(el.dataset.action==='armyDeploymentView'){page='world';selectedNode=el.dataset.id;render();worldNodeModal(el.dataset.id);}
  if(el.dataset.action==='armyDeploymentBattle'){if(S().expedition?.node!==el.dataset.id){const error=Game.selectExpedition(el.dataset.id);if(error){toast(error);return;}}page='world';selectedNode=el.dataset.id;modal.close();render();}
});
