'use strict';
const missionNames={raid:'掠夺',occupy:'占领'};
function battleDropHint(n){const info=Game.battleDropInfo(n.id);return `战斗胜利：${Math.round(info.itemChance*1000)/10}% 概率掉落商城道具 · ${Math.round(info.resourceChance*1000)/10}% 概率获得额外资源。另有 ${Math.round(Math.min(.55,.25+n.level*.03)*100)}% 概率掉落装备；强敌奖励更高，高级道具更稀有；资源受幸存部队负重与仓储限制；掠夺基础资源 +30%。`; }
function battleCargoHTML(result){if(!result.won||result.cargoCapacity===undefined)return '';return `<p class="notice cargo-summary">幸存部队负重 ${num(result.cargoCapacity)} · 装载资源 ${num(result.cargoLoaded)} / ${num(result.cargoCapacity)}${result.lootDiscarded?`<br>负重不足，${num(result.lootDiscarded)} 基础资源未能带回。`:''}<br><span class="hint">伤兵不参与搬运；额外资源与基础战利品共用负重。</span></p>`;}
function battleDropsHTML(result){
  const progress=result.prestigeDelta===undefined?'':`<p class="notice">声望 ${result.prestigeDelta>=0?'+':''}${num(result.prestigeDelta)}${Object.entries(result.jewelDrops||{}).map(([id,count])=>' · '+Game.progression.jewels[id].name+' ×'+count).join('')}</p>`;
  if(result.itemDrops===undefined&&result.bonusLoot===undefined)return progress+heroEquipmentDropsHTML(result);
  if(!result.won)return progress;
  const items=Object.entries(result.itemDrops||{}),bonus=Object.fromEntries(Object.entries(result.bonusLoot||{}).filter(([,count])=>count>0));
  return `${progress}${captiveDropsHTML(result)}${heroEquipmentDropsHTML(result)}<div class="battle-drops"><h4>额外掉落</h4>${items.length?`<div class="item-drops">${items.map(([id,count])=>{const item=Game.manual.shop.find(x=>x.id===id);return `<span class="item-drop ${item.price>=Game.manual.battleDrops.rarePrice?'rare-drop':''}">${esc(item.name)} ×${count}${item.price>=Game.manual.battleDrops.rarePrice?' · 稀有':''}</span>`;}).join('')}</div><p class="hint">道具已收入行囊。${btn('查看道具','manualInventory','','small secondary')}</p>`:''}${Object.keys(bonus).length?lootHtml(bonus):''}${result.bonusDiscarded?`<p class="hint">负重不足，${num(result.bonusDiscarded)} 额外资源未能带回。</p>`:''}${!items.length&&!Object.keys(bonus).length&&!result.bonusDiscarded&&!result.equipmentDrops?.length&&!result.equipmentDiscarded?'<p class="hint">本次未发现额外掉落，基础战利品照常获得。</p>':''}</div>`;
}
function campaignNodeDetails(n){
  const s=S(),owned=!!s.conquered[n.id],g=s.garrisons[n.id],raid=Game.attackInfo(n.id,'raid'),occupy=Game.attackInfo(n.id,'occupy'),cd=s.cooldowns[n.id]>Date.now();
  if(owned&&(n.wild||Game.isCity(n)))return `<div class="reward">✓ 已归属青溪城 · ${n.reward}</div>${g?`<p class="hint">${Game.general(g.general).name} · ${Game.totalArmy(g.army)} 人 · ${g.phase==='stationed'?'驻守中，耗粮翻倍':'返城中 · '+clock(g.end)}</p>${btn(g.phase==='stationed'?'召回驻军':'返城中','garrisonRecall',n.id,'secondary block',g.phase!=='stationed')}`:'<p class="hint">暂无驻军。召回不影响野地归属与产量加成。</p>'}${n.wild?btn('放弃野地','wildAbandonAsk',n.id,'small danger block',!!g):'<p class="hint">县城已纳入治下，首章占领目标完成。</p>'}`;
  const busy=Game.allExpeditions().length>=s.buildings.drill||Game.allExpeditions().some(e=>e.node===n.id),blocked=cd||busy;
  return `<div class="campaign-options"><article><h4>${owned?'清剿残匪':'掠夺'}</h4><p class="hint">${Game.isCity(n)?`仅与驻军交战，城防和义兵不启用；仓储保护 ${Math.max(0,40-S().tech.plunder*3)}% 资源（基础保护为试玩值），黄金不被掠夺。`:'夺取资源后返城，不改变归属，不获得产量加成。'}</p>${lootHtml(raid.loot)}<p class="hint">实际带回总量受幸存士兵负重限制，可带民夫或辎重车运输。</p>${btn(cd?'驻军恢复中':busy?(!s.buildings.drill?'需要校场':'派遣名额已用'):owned?'清剿残匪':'配兵掠夺','campaignDispatch',n.id+':raid','secondary block',blocked)}</article>${!owned?`<article><h4>占领</h4><p class="hint">${Game.isCity(n)?`城防启用，义兵 +${occupy.militia}；民心 ${occupy.morale}，每次胜利下降 35，低于 0 时易主。占领战可夺取黄金。`:n.wild?`取得领地和产量加成，幸存部队留守。附属野地 ${Game.wildOwned()}/${s.buildings.hall}。`:'攻下任务据点，取得归属与对应奖励，部队返城。'}</p>${lootHtml(occupy.loot)}<div class="reward">${n.reward}</div>${btn(cd?'驻军恢复中':busy?'校场队伍已满':Game.attackBlocked(n.id,'occupy')?'野地名额已满':'配兵占领','campaignDispatch',n.id+':occupy','block',blocked||!!Game.attackBlocked(n.id,'occupy'))}</article>`:''}</div><p class="notice battle-drop-hint">${battleDropHint(n)}</p><p class="hint">试玩行军 ${duration(n.time/S().speed)} · 返城 ${duration(Math.max(5,n.time/2)/S().speed)}${cd?' · 恢复 '+clock(s.cooldowns[n.id]):''}</p>`;
}
function territorySummary(){
  const ids=Object.keys(S().conquered).filter(id=>Game.getNode(id)?.wild);
  return `<section class="panel territory-panel"><div class="section-title"><h3>附属野地</h3><span class="badge">${ids.length} / ${S().buildings.hall}</span></div><p class="hint">官府每级增加 1 个名额。野地每天降 1 级，加成随等级变化。召回驻军保留加成，放弃野地释放名额并移除加成。</p>${ids.length?`<div class="territory-list">${ids.map(id=>{const n=Game.getNode(id),g=S().garrisons[id];return `<div class="territory-row"><div><strong>${n.name}</strong><p class="hint">${n.reward}${g?'<br>'+Game.general(g.general).name+' · '+Game.totalArmy(g.army)+' 人 · '+(g.phase==='stationed'?'驻守，耗粮 ×2':'返城 '+clock(g.end)):' · 暂无驻军'}</p></div><div>${g?btn(g.phase==='stationed'?'召回':'返城中','garrisonRecall',id,'small secondary',g.phase!=='stationed'):btn('放弃','wildAbandonAsk',id,'small secondary')}</div></div>`;}).join('')}</div>`:'<p class="hint">尚未占领野地。掠夺不会使用名额。</p>'}</section>`;
}
function campaignDispatchModal(nodeId,mode){
  const n=Game.getNode(nodeId);if(!n)return;const blocked=Game.attackBlocked(nodeId,mode);if(blocked){showModal('无法出征',`<p class="notice">${esc(blocked)}</p>`,Game.isCity(n)?btn('查看史诗','taskTab','epic','secondary'):btn('关闭','close','','secondary'));return;}
  const available=S().generals.filter(id=>id!==S().governor&&!Game.generalBusy(id));
  showModal('出征 · '+n.name,`<label class="label" for="dispatch-mode">出征目的</label><select id="dispatch-mode" aria-label="出征目的"><option value="raid" ${mode==='raid'?'selected':''} ${Game.attackBlocked(nodeId,'raid')?'disabled':''}>掠夺 · 抢资源后返城</option><option value="occupy" ${mode==='occupy'?'selected':''} ${Game.attackBlocked(nodeId,'occupy')?'disabled':''}>占领 · 取得领地或降低城池民心</option></select><div id="campaign-preview"></div><p class="label">主将 · 太守和驻守武将无法出征</p><select id="dispatch-general" aria-label="出征主将">${available.map(id=>`<option value="${id}">${Game.general(id).name} · Lv.${Game.general(id).level}</option>`).join('')}</select>${Object.entries(Game.units).map(([id,u])=>`<div class="dispatch-unit"><div class="row">${u.name}<span>驻城 ${S().army[id]}</span></div><div class="slider-row"><input type="range" data-army-range="${id}" min="0" max="${S().army[id]}" value="${S().army[id]}" aria-label="${u.name}数量"><input type="number" data-army-number="${id}" min="0" max="${S().army[id]}" value="${S().army[id]}" aria-label="${u.name}数量"></div></div>`).join('')}<div class="estimate" id="dispatch-estimate"></div>${!available.length?'<p class="notice">没有空闲主将，请先召回驻军或调整太守。</p>':''}<p class="hint">试玩伤兵规则：胜方有 35% 阵亡士兵作为伤兵归队，败方为 15%。</p>`,btn('取消','close','','secondary')+btn('开始行军','dispatch',nodeId,'',!available.length||!Game.totalArmy(S().army)));
  const select=document.getElementById('dispatch-mode');select.dataset.node=nodeId;
  updateCampaignPreview();
}
function updateCampaignPreview(){
  const select=document.getElementById('dispatch-mode');if(!select)return;
  const n=Game.getNode(select.dataset.node),mode=select.value,info=Game.attackInfo(n.id,mode);
  document.getElementById('campaign-preview').innerHTML=`<div class="notice">${mode==='raid'?'掠夺胜利后返城，不改变领地归属。':n.wild?'占领胜利后部队留守野地，耗粮翻倍，可手动召回。':Game.isCity(n)?'占领攻城启用城防与义兵；每次胜利降低 35 民心，低于 0 才易主。':'占领胜利取得任务据点，部队返城。'}${info.siege?'<br>义兵 '+info.militia+' 人 · 民心 '+info.morale+' · 城防守军防御 +25%':''}</div><p class="label">目标可供缴获的基础资源 · 实际带回受负重限制</p>${lootHtml(info.loot)}<p class="hint battle-drop-hint">${battleDropHint(n)}</p>`;
  if(document.getElementById('dispatch-general').value)updateDispatch(n.id);else document.getElementById('dispatch-estimate').textContent='暂无可出征主将。';
}
function battleOutcomeText(b,n){
  const r=b.result;if(!r.won)return '战斗失利，幸存部队返城。';
  if(r.mode==='raid')return '掠夺成功，未取得领地归属，部队返城。'+(Game.isCity(n)?'城池民怨增加 10（最高 100）。':'');
  if(r.claimed)return '占领成功 · '+n.reward;
  if(r.moraleAfter!==null&&r.moraleAfter!==undefined)return '攻城获胜 · 民心 '+r.moraleBefore+' → '+r.moraleAfter+'，尚未易主。';
  return '击退驻军，收获战利品。';
}
document.addEventListener('click',event=>{
  const el=event.target.closest('[data-action]');if(!el||el.disabled)return;
  if(el.dataset.action==='campaignDispatch'){const [id,mode]=el.dataset.id.split(':');dispatchModal(id,mode);}
  if(el.dataset.action==='garrisonRecall'){if(actResult(Game.recallGarrison(el.dataset.id),'驻军已启程返城'))modal.close();}
  if(el.dataset.action==='wildAbandonAsk'){const id=el.dataset.id,n=Game.getNode(id);showModal('放弃野地？','<p class="sub">放弃 '+n.name+' 后，该野地的产量加成会移除，并释放 1 个附属野地名额。以后可以重新攻占。</p>',btn('保留','close','','secondary')+btn('确认放弃','wildAbandonConfirm',id,'danger'));}
  if(el.dataset.action==='wildAbandonConfirm'){if(actResult(Game.abandonWild(el.dataset.id),'已放弃野地'))modal.close();}
});
