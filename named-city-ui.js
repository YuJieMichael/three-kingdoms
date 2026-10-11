'use strict';
// Existing city/world panels host this feature; no new main navigation.
function namedCityProgress(value){return Game.namedCityProgress?.(value)||NamedCitySystem.progress(S(),value);}
// Famous-general garrison: loyalty gate, pressure actions and recruitment (named-garrison.js).
function namedGarrisonHTML(id){
  const g=Game.garrisonStatus?.(id);if(!g)return '';const gen=g.general,C=NamedGarrison.C,p=Game.persuadeGarrisonQuote?.(id),sow=Game.sowGarrisonQuote?.(id);
  if(g.recruited&&!S().generals.includes(gen.id))return `<section class="named-garrison done"><h4>${esc(gen.name)} · 已解雇或离队</h4><p class="hint">目前没有再次招募入口。</p></section>`;
  if(g.recruited)return `<section class="named-garrison done"><h4>${esc(gen.name)} · 已归顺</h4><p class="hint">${esc(gen.name)}已加入你的将领。</p></section>`;
  if(g.captive){const level=S().captureLevels[gen.id]?.level||(id==='named_wancheng'||id==='named_beihai'?65:70),q=HeritageSystem.recruitmentQuote(S(),level);return `<section class="named-garrison"><h4>${esc(gen.name)} · Lv.${level} · 被俘</h4><p class="hint">招降需 ${q.nobleName}；招贤馆须有空房。</p>${q.reason?`<p class="hint">${esc(q.reason)}</p>`:''}${btn('招降','garrisonRecruit',id,'small',!!q.reason)}</section>`;}
  const v=namedGarrisonCardView(id,g,p,sow),ready=g.loyalty<g.captureBelow;
  const glyph=(path)=>`<svg class="garrison-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="${path}"/></svg>`;
  const clock=glyph('M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18M12 7v5l3 2'),supply=glyph('M4 8h16v12H4zM3 8l3-4h12l3 4M8 12h8M12 8v12'),letter=glyph('M3 5h18v14H3zM3 5l9 7 9-7'),scheme=glyph('M7 4h10v16H7zM10 8h4M10 12h4M10 16h2');
  return `<section class="named-garrison garrison-status-card" data-garrison-card="${esc(id)}" data-garrison-key="${esc(v.key)}"><div class="garrison-heading"><h4>${esc(gen.name)} <small>镇守</small></h4><span class="badge">${ready?'可俘获':'围城中'}</span></div><div class="garrison-loyalty" role="meter" aria-label="镇守忠诚" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${g.loyalty}"><span>忠诚 ${g.loyalty} / 100</span><i style="width:${g.loyalty}%"></i><b style="left:${g.captureBelow}%"></b></div><p class="garrison-goal ${ready?'ready':''}">${ready?'下次占领战胜利可俘获':'忠诚低于 '+g.captureBelow+' 后，才能占城俘将'}</p><div class="garrison-metrics"><div class="${v.urgent?'urgent':''}">${clock}<span>重置<strong>${esc(v.pressure)}</strong></span></div><div>${supply}<span>断供<strong>${g.supplyCut} / ${C.supplyCutMaxTiles} <small>每天 ${v.daily}</small></strong></span></div></div><p class="garrison-pressure-hint">${esc(v.hint)}</p><div class="garrison-action-grid"><div>${btn(letter+'劝降','garrisonPersuade',id,'small secondary',!!p?.reason)}<small>−${C.persuadeLoss} · 黄金 ${num(C.persuadeGold)}</small><span>${esc(v.persuade)}</span></div><div>${btn(scheme+'离间','garrisonSow',id,'small secondary',!!sow?.reason)}<small>−${sow?.loss||C.sowBase} · 无费用</small><span>${esc(v.sow)}</span></div></div>${btn('⚒ 筹备','siegePreparation',id,'small secondary')}<details class="world-tool-details garrison-rules" data-ui-disclosure="garrison-rules-${esc(id)}"><summary>围城说明 · 守军 ${num(g.troops)}</summary><p class="hint">守军 ${num(g.troops)} / ${num(g.fullTroops)}；胜利后退守内城，每小时恢复 ${Math.round(C.refillPerHour*100)}%。攻城胜利后休整 ${C.regroupMs/3600000} 小时；只有冲车、投石车才能有效破门。</p><ul class="garrison-levers"><li>攻城胜利 −${C.winLoss}，破门再 −${C.gateBonus}；郡城减半。</li><li>占领城外 ${C.supplyCutRadius} 格内野地，每块每天 −${C.supplyCutPerTile}，最多 ${C.supplyCutMaxTiles} 块；忠诚自然每天 +${C.recoverPerDay}。</li><li>${C.abandonMs/3600000} 小时无施压会整军复原；劝降、离间或持续断供可维持压力，补兵期间也能使用。劝降书每天一次，离间计每 ${C.sowCooldown/3600000} 小时一次。</li></ul></details></section>`;
}
// Pure projection; timestamps and button availability never write into a save.
function namedGarrisonCardView(id,g=Game.garrisonStatus(id),p=Game.persuadeGarrisonQuote(id),sow=Game.sowGarrisonQuote(id)){
  const now=Date.now(),C=NamedGarrison.C,remaining=Math.max(0,(g.abandonAt||0)-now),r=S().realm.namedCities.garrisons[id];
  const time=(ms)=>{const m=Math.ceil(Math.max(0,ms)/60000);return Math.floor(m/60)+'小时'+(m%60?m%60+'分':'');};
  const pressure=g.supplyCut?'持续施压':!g.abandonAt?'未开始':remaining?time(remaining):'即将重置';
  const hint=g.supplyCut?'断供中，不会因停止攻城而重置':g.abandonAt?'补兵期间可用劝降、离间续压':'先用劝降或离间开始施压';
  const daily=C.recoverPerDay-C.supplyCutPerTile*g.supplyCut;
  const persuade=p?.reason?.includes('今天')?'今日已用':p?.reason||'可用';
  const sowText=sow?.reason?.includes('冷却')?'冷却 '+time(r.sowAt+C.sowCooldown-now):sow?.reason?.includes('军师')?'需任命军师':sow?.reason||'可用';
  return {pressure,hint,daily:(daily<0?'−':'+')+Math.abs(daily),persuade,sow:sowText,urgent:!g.supplyCut&&!!g.abandonAt&&remaining<=12*3600000,key:JSON.stringify([g.loyalty,g.troops,g.captive,g.recruited,g.supplyCut,pressure,p?.reason,sow?.reason,sow?.loss,sowText])};
}
function refreshNamedGarrisonUI(){
  for(const card of document.querySelectorAll('[data-garrison-card]')){
    if(!card.isConnected)continue;const id=card.dataset.garrisonCard,g=Game.garrisonStatus(id);if(!g)continue;
    const key=namedGarrisonCardView(id,g).key;if(key===card.dataset.garrisonKey)continue;
    const expanded=!!card.querySelector('details')?.open,focused=card.contains(document.activeElement)?document.activeElement:null,focusAction=focused?.dataset.action,focusSummary=focused?.matches('summary');
    const template=document.createElement('template');template.innerHTML=namedGarrisonHTML(id);const next=template.content.firstElementChild;if(!next)continue;card.replaceWith(next);
    const details=next.querySelector('details');if(details)details.open=expanded;if(focused){const target=focusSummary?next.querySelector('summary'):focusAction?next.querySelector(`[data-action="${focusAction}"]`):null;if(target&&!target.disabled)target.focus({preventScroll:true});else next.querySelector('summary')?.focus({preventScroll:true});}
  }
}
function namedCityDetailsHTML(value){
  const p=namedCityProgress(value);if(!p||!p.visible)return '';
  const checks=p.children.map(c=>`<li>${c.owned?'✓':'○'} ${esc(c.name)} · ${c.owned?'已占领':'待占领'}</li>`).join(''),chapter=p.chapter?`<li>${p.chapter.complete?'✓':'○'} 第三章 · 河洛攻城${p.chapter.complete?'已完成':'尚未完成'}</li>`:'';
  const garrison=namedGarrisonHTML(p.id);
  return `${garrison}<div class="named-city-details"><p class="hint"><strong>${esc(p.tierName)} · ${esc(p.district)}</strong> · 资源田最高 ${p.plotMax} 级 · 本城黄金税收 +${Math.round((p.goldFactor-1)*100)}%</p><details class="world-tool-details" data-ui-disclosure="named-city-${esc(p.id)}"><summary>辖区与发展 · ${p.owned?'已取得城池归属':p.required?'下级城池 '+p.controlled+'/'+p.required+'，还差 '+p.missing+' 座':'县级名城'}</summary>${checks||chapter?`<ul>${checks}${chapter}</ul>`:'<p class="hint">完成黄巾史诗开放县城攻打后，可以连续进攻降低民心。</p>'}<p class="hint">掠夺只带回战利品；占领须攻城胜利使民心低于 0，并有爵位城数空位。新城仍从官府 1 级起经营。</p><p class="hint">名城高阶资源田 11–18 级为本作参数：第 10 级费用 ×1.35ⁿ、工期 ×1.25ⁿ，n=等级−10；产量、劳动、容量按等级×(等级+1)/110 放大第 10 级值。都城资源田上限暂为 18 级。高阶田需官府 10 级；城内建筑仍最高 10 级。</p>${p.owned?namedCityDevelopmentHTML(p.id):''}</details></div>`;
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
  if(action==='garrisonPersuade'||action==='garrisonSow'||action==='garrisonRecruit'){const error=action==='garrisonPersuade'?Game.persuadeGarrison(id):action==='garrisonSow'?Game.sowGarrison(id):Game.recruitGarrisonGeneral(id);if(actResult(error,action==='garrisonRecruit'?'名将已归顺':action==='garrisonPersuade'?'劝降书已送达，名将忠诚下降':'离间计生效，名将忠诚下降')){if(modal.open&&typeof worldNodeModal==='function')worldNodeModal(id);render();}return true;}
  if(action==='namedCities'){namedCityOverviewModal();return true;}
  if(action==='namedCityMap'){if(!Game.landmarkVisible(id)){toast('此名城尚未发现');return true;}const n=Game.getNode(id);if(n){modal.close();manualModalContext=null;page='world';selectedNode=n.id;centerWorld(n.x,n.y,false);}return true;}
  if(action==='namedCityDevelopment'){const q=Game.namedCityDevelopmentQuote?.(id);if(!q){toast('请先占领此名城');return true;}if(q.reason){toast(q.reason);return true;}const error=Game.claimNamedCityDevelopment(id,q.key);if(actResult(error,'发展奖励已入 '+q.name)){namedCityOverviewModal();render();}return true;}
  return false;
}
document.addEventListener('click',event=>{const el=event.target.closest('[data-action]');if(el&&!el.disabled)handleNamedCityAction(el.dataset.action,el.dataset.id);});

const siegePressureNotices=new Set();
function siegePressureNotice(){
  if(Game.saveBlockReason())return '';
  for(const id of NamedGarrison.ids){const g=Game.garrisonStatus(id);if(!g||g.captive||g.recruited||g.supplyCut||!g.abandonAt)continue;const left=g.abandonAt-Date.now(),key=id+':'+g.abandonAt;
    if(left>0&&left<=12*3600000&&!siegePressureNotices.has(key)){siegePressureNotices.add(key);return (Game.getNode(id)?.name||id)+'围城即将重置，可劝降、离间续压';}
  }return '';
}
function siegePreparationModal(nodeId,draft=null){
  const city=Game.currentCityId(),q=Game.siegePreparationQuote(city,nodeId);if(!q.key)return;
  const t=draft||q.template||{hero:'',tactic:'advance',army:{}},ids=Object.keys(Game.units).filter(id=>Game.unitUnlocked(id)||t.army[id]);
  const armyRow=id=>`<label class="siege-target"><span>${esc(Game.units[id].name)}<small>现有 ${num(S().army[id])} · 缺 ${num(q.deficits[id]||0)}</small></span><input type="number" min="0" max="100000" data-siege-target="${id}" aria-label="${esc(Game.units[id].name)}目标" value="${t.army[id]||0}"></label>`;
  const primary=ids.filter(id=>t.army[id]>0||!q.template&&!draft&&id==='militia'),other=ids.filter(id=>!primary.includes(id)),army=primary.map(armyRow).join('')+(other.length?`<details><summary>其他兵种</summary>${other.map(armyRow).join('')}</details>`:'');
  const orders=q.orders.map(o=>Game.units[o.id].name+' '+num(o.count)).join(' · '),remaining=Object.entries(q.remaining).filter(([,n])=>n>0).map(([id,n])=>Game.units[id].name+' '+num(n)).join(' · ');
  showModal('筹备 · '+Game.getNode(nodeId).name,`<p class="hint">${esc(Game.cityMeta().name)} · 目标不占兵，也不会自动出征</p><label for="siege-hero" class="label">主将</label><select id="siege-hero"><option value="">待定</option>${S().generals.map(id=>`<option value="${id}" ${t.hero===id?'selected':''}>${esc(Game.general(id).name)}</option>`).join('')}</select>${q.busy?'<p class="notice">目标主将忙碌、在外或离队，出征前需调整</p>':''}<label for="siege-command" class="label">默认指令</label><select id="siege-command">${[['advance','前进'],['hold','固守'],['fallback','后退']].map(([id,name])=>`<option value="${id}" ${t.tactic===id?'selected':''}>${name}</option>`).join('')}</select><div class="siege-targets">${army}</div><section class="notice"><strong>可补：${esc(orders||'暂无')}</strong>${q.completionAt?`<p class="hint">预计完成 ${esc(new Date(q.completionAt).toLocaleString('zh-CN',{month:'numeric',day:'numeric',hour:'2-digit',minute:'2-digit',hour12:false}))}</p>`:''}${costs(q.cost)}${remaining?`<p class="hint">余缺：${esc(remaining)}</p>`:''}${q.reason?`<p class="hint">${esc(q.reason)}</p>`:''}</section>`,btn('保存目标','siegeSave',nodeId,'secondary')+btn('补兵','siegeFill',nodeId,'',!!q.reason)+btn('出征草稿','siegeDraft',nodeId,'secondary',!q.template)+btn('关闭','close','','secondary'));
  modalBody.dataset.siegeKey=q.key;modalBody.dataset.siegeCity=city;manualModalContext=()=>siegePreparationModal(nodeId);
}
function siegeCurrentDispatchDraft(){return {hero:document.getElementById('dispatch-general')?.value||'',tactic:modalBody.dataset.siegeCommand||'advance',army:Object.fromEntries([...modalBody.querySelectorAll('[data-army-number]')].map(el=>[el.dataset.armyNumber,Number(el.value)]))};}
function siegeEditedTemplate(){return {hero:document.getElementById('siege-hero').value,tactic:document.getElementById('siege-command').value,army:Object.fromEntries([...modalBody.querySelectorAll('[data-siege-target]')].map(el=>[el.dataset.siegeTarget,Number(el.value)]))};}
function handleSiegePreparationAction(action,id){
  if(action==='siegeCopyDraft'){const draft=siegeCurrentDispatchDraft();siegePreparationModal(id,draft);return true;}
  if(action==='siegePreparation'){siegePreparationModal(id);return true;}
  if(!['siegeSave','siegeFill','siegeDraft'].includes(action))return false;
  const city=modalBody.dataset.siegeCity,key=modalBody.dataset.siegeKey;
  if(action==='siegeSave'){const t=siegeEditedTemplate();if(actResult(Game.saveSiegePreparation(city,id,t,key),'兵力目标已保存'))siegePreparationModal(id);else siegePreparationModal(id,t);}
  if(action==='siegeFill'){const draft=siegeEditedTemplate();if(actResult(Game.fillSiegePreparation(city,id,key),'已加入训练队列')){siegePreparationModal(id);render();}else siegePreparationModal(id,draft);}
  if(action==='siegeDraft'){const q=Game.siegePreparationQuote(city,id);if(q.key!==key||city!==Game.currentCityId()){const draft=siegeEditedTemplate();toast('筹备已变化，请重新查看');siegePreparationModal(id,draft);return true;}if(q.template){manualModalContext=null;campaignDispatchModal(id,'occupy',q.template);}}
  return true;
}
document.addEventListener('click',event=>{const el=event.target.closest('[data-action]');if(el&&!el.disabled)handleSiegePreparationAction(el.dataset.action,el.dataset.id);});
