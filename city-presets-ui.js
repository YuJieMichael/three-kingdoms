'use strict';
let cityPresetPending=null,salarySpendPending=null;
const budgetHours=(hours,stable)=>hours===null?stable:hours.toFixed(1)+'小时';
function economyBudgetText(b){return `粮 ${b.foodNet>=0?'+':''}${num(Math.round(b.foodNet))}/时 · ${budgetHours(b.foodHours,'稳定')} ｜ 薪 ${budgetHours(b.goldHours,'无支出')} ｜ 闲民 ${num(b.population)}${b.warnings.includes('salary')?' ｜ 薪俸不足8小时':''}${b.warnings.includes('food')?' ｜ 粮草不足8小时':''}`;}
function economyBudgetContent(b){return economyBudgetText(b).split(/ ｜ | · /).map(text=>`<span>${esc(text)}</span>`).join('');}
function economyBudgetHTML(){
 if(!Game.domesticStrategyAvailable())return '';const b=Game.economyBudget();
 return `<section class="economy-budget-bar ${b.warnings.length?'negative':''}" aria-label="本城经营预算"><button data-action="economyDetails" data-economy-budget>${economyBudgetContent(b)}</button>${btn('⚒ 模板','cityPresets','','small secondary')}</section>`;
}
function refreshEconomyBudget(){document.querySelectorAll('[data-economy-budget]').forEach(el=>{const b=Game.economyBudget();el.innerHTML=economyBudgetContent(b);el.closest('.economy-budget-bar')?.classList.toggle('negative',b.warnings.length>0);});}
function economyDetailsModal(){const b=Game.economyBudget();showModal('本城经营账目',`<p>${esc(Game.cityMeta().name)} · 当前库存估算</p><div class="modal-info"><span>黄金</span><strong>${num(Math.floor(b.gold))}</strong></div><p>本城时薪 ${num(b.wages)} · 欠饷 ${num(b.owed)} · 24小时留金 ${num(b.salaryReserve)}</p><p>可付薪 ${budgetHours(b.goldHours,'无支出')} · 粮食净余 ${num(Math.round(b.foodNet))}/时 · 可支撑 ${budgetHours(b.foodHours,'稳定')}</p><p>空闲人口 ${num(b.population)}</p>${b.warnings.length?'<p class="notice">'+(b.warnings.includes('salary')?'薪俸不足8小时，请补金。 ':'')+(b.warnings.includes('food')?'粮草不足8小时，请补给。':'')+'</p>':''}<details><summary>估算说明</summary><p class="hint">先扣欠饷再估薪俸时长；不预支未来收入。每级将领时薪20黄金，行军调城途中沿用主城付薪。粮草计入现有驻军、在途、伤兵与各类队伍的真实耗粮。</p></details>`,btn('城务','governance','','secondary')+btn('关闭','close','','secondary'));}
// The callback must call the real Game action, which revalidates cost/balance/queues.
function salarySpendConfirm(gold,proceed,back=()=>modal.close()){
 const q=Game.salarySpendQuote(gold);if(!q.valid){toast('消费金额已变化，请重新查看');return false;}
 if(!Game.domesticStrategyAvailable()||!q.warn){proceed();return true;}
 salarySpendPending={cityId:q.cityId,proceed,back};
 showModal('保留薪俸？',`<p>本次花费 ${num(gold)} 黄金，将低于本城24小时薪俸预算 ${num(q.budget.salaryReserve)}。</p><p>消费后约可付薪 ${budgetHours(q.goldHoursAfter,'无支出')}。继续时仍会核对实际条件。</p>`,btn('返回','salarySpendBack','','secondary')+btn('继续','salarySpendContinue'));return true;
}
function cityPresetsModal(id=S().cityPreset.id||'balanced',edited){
 const q=Game.cityPresetQuote(edited||id);if(q.error){toast(q.error);return;}const d=q.draft;
 showModal('城池模板',`<p class="sub">${esc(Game.cityMeta().name)} · ${S().cityPreset.active?'运行中':'已暂停'}</p><label for="city-preset-id">城池分工</label><select id="city-preset-id">${Game.cityPresets.map(p=>`<option value="${p.id}" ${p.id===d.id?'selected':''}>${p.name}</option>`).join('')}</select><p class="hint">仅填空位、向上升级；已有高级田保留。城内目标按每种建筑最高等级，0表示不安排。手动建设仍可用。</p><details open><summary>城内目标</summary><div class="city-preset-targets">${Game.cityIds.map(id=>`<label>${Game.buildings[id].name}<input type="number" min="0" max="10" step="1" inputmode="numeric" data-preset-building="${id}" value="${d.buildings[id]||0}"></label>`).join('')}</div></details><details open><summary>城外目标</summary><div class="city-preset-targets">${CityPresets.types.map(id=>`<label>${Game.buildings[id].name}数量<input type="number" min="0" max="39" step="1" inputmode="numeric" data-preset-plot="${id}" value="${d.plots.counts[id]}"></label>`).join('')}<label>资源田目标级<input id="city-preset-plot-level" type="number" min="1" max="10" step="1" inputmode="numeric" value="${d.plots.level}"></label></div><p class="hint">四种数量合计最多39块；按已开放空位安排。已有产业保留，数量可能无法完全一致。</p></details><p class="notice">${esc(q.reason||'待安排 '+q.tasks.length+' 项，按真实费用逐项开工')}</p>`,btn('暂停','cityPresetPause','','secondary',!S().cityPreset.active)+btn('保存并运行','cityPresetReview','', '',!Game.domesticStrategyAvailable())+btn('关闭','close','','secondary'));
 manualModalContext=null;
}
function cityPresetReadDraft(){return {id:document.getElementById('city-preset-id').value,buildings:Object.fromEntries([...document.querySelectorAll('[data-preset-building]')].map(el=>[el.dataset.presetBuilding,Number(el.value)])),plots:{counts:Object.fromEntries([...document.querySelectorAll('[data-preset-plot]')].map(el=>[el.dataset.presetPlot,Number(el.value)])),level:Number(document.getElementById('city-preset-plot-level').value)}};}
function cityPresetReview(){const d=cityPresetReadDraft(),q=Game.cityPresetQuote(d);if(q.error){toast(q.error);return;}cityPresetPending={draft:d,key:q.key,cityId:Game.currentCityId()};showModal('运行'+q.name,`<p>待安排 ${q.tasks.length} 项，使用本城真实队列和材料，逐项检查前置与保留资源。</p><p class="hint">暂停旧自动升级及城外样板；已开始工程照常完成。打开此面板不会花费材料。</p><p class="notice">${esc(q.reason||'可开始安排')}</p>`,btn('返回','cityPresetBack','','secondary')+btn('确认运行','cityPresetApply'));}
function handleCityPresetsAction(action,id){
 switch(action){
  case 'economyDetails':economyDetailsModal();return true;
  case 'cityPresets':cityPresetsModal();return true;
  case 'cityPresetReview':cityPresetReview();return true;
  case 'cityPresetBack':if(cityPresetPending)cityPresetsModal(cityPresetPending.draft.id,cityPresetPending.draft);return true;
  case 'cityPresetApply':{const p=cityPresetPending;if(!p)return true;if(p.cityId!==Game.currentCityId()){toast('城市已变化，请重新查看');return true;}if(actResult(Game.applyCityPreset(p.draft,p.key),'城池目标已保存')){cityPresetPending=null;cityPresetsModal();render();}else cityPresetsModal(p.draft.id,p.draft);return true;}
  case 'cityPresetPause':actResult(Game.pauseCityPreset(),'已暂停新工程');cityPresetsModal();render();return true;
  case 'salarySpendBack':{const p=salarySpendPending;salarySpendPending=null;if(p)p.back();return true;}
  case 'salarySpendContinue':{const p=salarySpendPending;salarySpendPending=null;if(p){if(p.cityId!==Game.currentCityId()){toast('城市已变化，请重新查看消费');p.back();}else p.proceed();}return true;}
  default:return false;
 }
}
document.addEventListener('change',event=>{if(event.target.id==='city-preset-id')cityPresetsModal(event.target.value,CityPresets.draft(event.target.value));});
