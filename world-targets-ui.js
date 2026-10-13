'use strict';
let worldTargetFilter='training',worldTrainingStage='beginner';
const worldTrainingLabels={beginner:'新手 1–3级',advanced:'进阶 4–6级',famous:'名将 7–10级',all:'全部附近'};
const worldTargetLabels={training:'练级',jewels:'珠宝',gold:'黄金',heroes:'名将',favorites:'收藏'};
function worldTargetFavoriteButton(id,context='target'){const saved=S().targetFavorites.includes(id);return btn(saved?'★ 移除':'☆ 收藏','worldTargetFavorite',id+'|'+(saved?'off':'on')+'|'+context,'small secondary');}
function worldTargetsModal(filter=worldTargetFilter){
  if(!Object.hasOwn(worldTargetLabels,filter))filter='training';worldTargetFilter=filter;
  const staged=filter==='training'&&worldTrainingStage!=='all',rows=staged?Game.trainingTargets(worldTrainingStage,worldView):filter==='favorites'?Game.targetFavorites():Game.nearbyTargets(filter,worldView),labels={public:'守军公开',exact:'精确情报',bands:'数量区间',types:'已知兵种',unknown:'未侦察'};
  showModal('附近目标',`<div class="world-target-filters">${Object.entries(worldTargetLabels).map(([id,label])=>btn(label,'worldTargets',id,`small secondary ${filter===id?'active-order':''}`)).join('')}</div>${filter==='training'?`<div class="world-target-filters" aria-label="练兵阶段">${Object.entries(worldTrainingLabels).map(([id,label])=>btn(label,'worldTrainingStage',id,`small secondary ${worldTrainingStage===id?'active-order':''}`)).join('')}</div>`:''}<p class="hint">${filter==='favorites'?'收藏 '+rows.length+'/20 · 失效目标仍可移除':staged?'附近前后6格普通野地 · 等级、距离排序 · 最多5处':'以地图视野为中心，附近6格野地＋已发现据点，按距离排列'}</p><div class="world-target-list">${rows.map(r=>`<article><div class="section-title"><strong>${r.heroName?esc(r.heroName)+' · ':''}${esc(r.name)}</strong>${r.available===false?'':`<span class="badge">${r.level}级</span>`}</div>${r.available===false?'<p class="hint">目标已失效或未发现</p>':staged?`<p class="hint">${r.distance.toFixed(1)}格 · ${labels[r.intel]||'未侦察'}<br>${esc(r.reason)}</p>`:`<p class="hint">(${r.x}, ${r.y}) · ${r.distance===undefined?'':r.distance.toFixed(1)+'格 · '}约${duration(r.seconds)} <small>（本城弓兵基准）</small><br>${labels[r.intel]||'未侦察'}</p>`}<div class="guide-actions">${r.available===false?'':staged&&r.intel==='unknown'?btn('先侦察','scoutPlan',r.id,'small',S().army.scout<1)+btn('查看','worldTargetGo',r.id,'small secondary'):btn(staged?'查看情报与出征':'查看','worldTargetGo',r.id,'small')+btn('侦察','scoutPlan',r.id,'small secondary',S().army.scout<1)}${worldTargetFavoriteButton(r.id,'targets')}</div></article>`).join('')||'<p class="empty">附近没有此类已知目标</p>'}</div><details><summary>筛选说明</summary><p class="hint">三组练级仅筛选普通野地：新手1–3级、进阶4–6级、名将7–10级；先侦察，再按实际情报配兵。已占领、行军与驻守冲突目标不列入；珠宝沿用胜利掉珍珠规则；黄金列出黄巾城与已发现有黄金的固定据点；名将只显示已打听的在野位置和已发现守将城池。等级和距离不代表必胜，实际行军耗时以配队为准。</p></details>`,btn('本城周边','worldTargetsHome','','secondary')+btn('关闭','close','','secondary'));
  manualModalContext=()=>worldTargetsModal(worldTargetFilter);
}
function worldMarchPathMarks(paths){return paths.map(p=>`<path d="M${p.from.x+.5} ${p.from.y+.5}L${p.to.x+.5} ${p.to.y+.5}" class="${p.phase==='return'?'return':''}"/><circle cx="${p.position.x+.5}" cy="${p.position.y+.5}" r=".12"/>`).join('');}
function refreshWorldMarchPaths(){const overlay=document.querySelector('.world-march-paths'),labels=[...(document.querySelectorAll?.('[data-world-march-progress]')||[])];if(!overlay&&!labels.length)return;const paths=Game.marchPaths();if(overlay)overlay.innerHTML=worldMarchPathMarks(paths);for(const el of labels){const p=paths.find(p=>p.id===el.dataset.worldMarchProgress);if(p)el.textContent=Math.floor(p.progress*100)+'%';}}
function worldMarchPathsSVG(start,span){
  const paths=Game.marchPaths();if(!paths.length)return '';
  return `<svg class="world-march-paths" style="grid-column:2 / span ${span};grid-row:2 / span ${span}" viewBox="${start.x} ${start.y} ${span} ${span}" preserveAspectRatio="none" aria-hidden="true">${worldMarchPathMarks(paths)}</svg>`;
}
function worldMarchPathsHTML(){const rows=Game.marchPaths();if(!rows.length)return '';return `<details class="world-tool-details" data-ui-disclosure="march-paths"><summary>⚑ 行军路径 · ${rows.length}队</summary><div class="world-target-list">${rows.map(p=>`<article><strong>${p.kind==='scout'?'斥候 · ':p.general?esc(Game.general(p.general).name)+' · ':''}${p.phase==='return'?'返城':'行军'}</strong><p class="hint">(${p.from.x.toFixed(1)}, ${p.from.y.toFixed(1)}) → (${p.to.x.toFixed(1)}, ${p.to.y.toFixed(1)}) · <span data-world-march-progress="${esc(p.id)}">${Math.floor(p.progress*100)}%</span> · ${clock(p.end)}</p>${p.node?btn('查看终点','worldTargetGo',p.node,'small secondary'):''}</article>`).join('')}</div></details>`;}
function handleWorldTargetsAction(action,id=''){
  if(!['worldTargets','worldTargetsHome','worldTargetGo','worldTargetFavorite','worldTrainingStage','trainingRecovery'].includes(action))return false;
  if(action==='worldTrainingStage'){if(Object.hasOwn(worldTrainingLabels,id)){worldTrainingStage=id;worldTargetsModal('training');}}
  if(action==='trainingRecovery')trainingRecoveryModal(id);
  if(action==='worldTargets')worldTargetsModal(id||worldTargetFilter);
  if(action==='worldTargetsHome'){const p=Game.currentHome();worldView={...p};centerWorld(p.x,p.y,false,true);worldTargetsModal();}
  if(action==='worldTargetGo'){const n=Game.getNode(id);if(!n||!Game.landmarkVisible(id)){toast('目标不存在或尚未发现');return true;}modal.close();page='world';selectedNode=id;centerWorld(n.x,n.y,false);worldNodeModal(id);}
  if(action==='worldTargetFavorite'){const [node,mode,context]=id.split('|');if(actResult(Game.setTargetFavorite(node,mode==='on'),mode==='on'?'已收藏':'已移除')){if(modal.open){if(context==='codex'&&typeof heroCodexModal==='function')heroCodexModal();else if(context==='targets')worldTargetsModal(worldTargetFilter);else if(typeof worldNodeModal==='function')worldNodeModal(node);}}}
  return true;
}

function trainingRecoveryButton(report){return btn('🩹 恢复','trainingRecovery',report.sourceCity||'capital','small secondary');}
function trainingRecoveryModal(id){
  const meta=Game.cityMeta(id),scope=Game.getCityState(id);if(!meta||!scope){toast('来源城已不存在');return;}
  const q=WarCare.quote(scope,'all'),here=id===Game.currentCityId();
  showModal('🩹 '+esc(meta.name)+' · 恢复',`<p class="hint">来源城当前伤兵 ${num(q.available)} 人 · 全部治疗需 ${num(q.gold)} 黄金</p><p class="hint">战报伤亡与经验是当时结算；治疗与补兵以来源城当前兵力、资源和队列为准。</p><div class="guide-actions">${here?btn('查看伤兵营','warCare','','secondary')+btn('补兵目标','trainingTemplates','','secondary'):btn('切至来源城','citySwitchConfirm',id,'secondary',!Game.saveSessionInfo().writable||Game.authorityActive())}</div>`,btn('关闭','close','','secondary'));
  manualModalContext=()=>trainingRecoveryModal(id);
}
