'use strict';
// Existing city/world panels host this feature; no new main navigation.
function namedCityProgress(value){return Game.namedCityProgress?.(value)||NamedCitySystem.progress(S(),value);}
function namedCityDetailsHTML(value){
  const p=namedCityProgress(value);if(!p||!p.visible)return '';
  const checks=p.children.map(c=>`<li>${c.owned?'✓':'○'} ${esc(c.name)} · ${c.owned?'已占领':'待占领'}</li>`).join(''),chapter=p.chapter?`<li>${p.chapter.complete?'✓':'○'} 第三章 · 河洛攻城${p.chapter.complete?'已完成':'尚未完成'}</li>`:'';
  return `<div class="named-city-details"><p class="hint"><strong>${esc(p.tierName)} · ${esc(p.district)}</strong> · 资源田最高 ${p.plotMax} 级 · 本城黄金税收 +${Math.round((p.goldFactor-1)*100)}%</p><details class="world-tool-details" data-ui-disclosure="named-city-${esc(p.id)}"><summary>辖区与发展 · ${p.owned?'已取得城池归属':p.required?'下级城池 '+p.controlled+'/'+p.required+'，还差 '+p.missing+' 座':'县级名城'}</summary>${checks||chapter?`<ul>${checks}${chapter}</ul>`:'<p class="hint">完成黄巾史诗开放县城攻打后，可以连续进攻降低民心。</p>'}<p class="hint">掠夺只带回战利品；占领须攻城胜利使民心低于 0，并有爵位城数空位。新城仍从官府 1 级起经营。</p><p class="hint">名城高阶资源田 11–18 级为本作参数：第 10 级费用 ×1.35ⁿ、工期 ×1.25ⁿ，n=等级−10；产量、劳动、容量按等级×(等级+1)/110 放大第 10 级值。都城资源田上限暂为 18 级。高阶田需官府 10 级；城内建筑仍最高 10 级。</p>${p.owned?namedCityDevelopmentHTML(p.id):''}</details></div>`;
}
function namedCityDevelopmentHTML(value){
  const q=Game.namedCityDevelopmentQuote?.(value)||NamedCitySystem.developmentQuote(S(),value);if(!q)return '';
  const names={hall:'官府等级',morale:'民心',population:'人口',plots:'已开垦资源田'};
  return `<section class="named-city-development"><h4>稳定发展奖励${q.claimed?' · 已领取':''}</h4>${q.claimed?'<p class="hint">本城奖励只领取一次，迁移或切换城市不会重置。</p>':`<ul>${q.checks.map(c=>`<li>${c.complete?'✓':'○'} ${names[c.id]} ${num(c.current)} / ${num(c.required)}</li>`).join('')}</ul><p class="hint">奖励入此城：${Object.entries(q.reward).map(([id,n])=>Game.resources[id].name+' '+num(n)).join('、')}，允许暂时超仓。${Object.keys(q.jewels||{}).length?'另得珠宝：'+Object.entries(q.jewels).map(([id,n])=>(Game.progression?.jewels?.[id]?.name||id)+' ×'+n).join('、')+'。':''}</p>${btn(q.reason||'领取本城发展奖励','namedCityDevelopment',q.id,'small secondary',!!q.reason)}`}</section>`;
}
function namedCityOverviewHTML(){
  const rows=Game.namedCities?.()||NamedCitySystem.list(S());
  return `<p class="hint">按指定辖区推进：县 → 郡 → 州 → 都。后续名城在下级领土推进后发现，未来任务据点继续按任务显示。</p><div class="city-list">${rows.map(p=>`<article class="army-deployment-card"><div class="quest-heading"><h4>${esc(p.name)}</h4><span class="badge">${esc(p.tierName)} · ${p.owned?'己方':'待占领'}</span></div><p class="hint">${esc(p.district)} · 资源田上限 ${p.plotMax} 级</p>${p.required?`<p class="hint">指定辖区 ${p.controlled}/${p.required}，还差 ${p.missing} 座${p.chapter&&!p.chapter.complete?' · 还需第三章完成':''}</p>`:''}${namedCityDetailsHTML(p.id)}<div class="guide-actions">${btn('地图查看','namedCityMap',p.id,'small secondary')}${p.owned?btn('查看城池','citySummary','city_'+p.id,'small secondary'):''}</div></article>`).join('')}</div>`;
}
function namedCityOverviewModal(){showModal('名城与行政辖区',namedCityOverviewHTML(),btn('关闭','close','','secondary'));manualModalContext=namedCityOverviewModal;}
function handleNamedCityAction(action,id){
  if(action==='namedCities'){namedCityOverviewModal();return true;}
  if(action==='namedCityMap'){if(!Game.landmarkVisible(id)){toast('此名城尚未发现');return true;}const n=Game.getNode(id);if(n){modal.close();manualModalContext=null;page='world';selectedNode=n.id;centerWorld(n.x,n.y,false);}return true;}
  if(action==='namedCityDevelopment'){const q=Game.namedCityDevelopmentQuote?.(id);if(!q){toast('请先占领此名城');return true;}if(q.reason){toast(q.reason);return true;}const error=Game.claimNamedCityDevelopment(id,q.key);if(actResult(error,'发展奖励已入 '+q.name)){namedCityOverviewModal();render();}return true;}
  return false;
}
document.addEventListener('click',event=>{const el=event.target.closest('[data-action]');if(el&&!el.disabled)handleNamedCityAction(el.dataset.action,el.dataset.id);});
