'use strict';
let supplyLineDraft=null;
const supplyLinesAvailable=()=>!Game.domesticStrategyAvailable||Game.domesticStrategyAvailable();
const supplyLineStateName=row=>({ready:'等待派遣',sent:'已出发',inflight:row.job?.phase==='return'?'运输队返城':'运输中',paused:'已暂停',stocked:'库存充足',blocked:'等待条件恢复'}[row.state]||'等待');
const supplyLineCityName=id=>Game.cityMeta(id)?.name||id;
function supplyLinesHTML(){
  const rows=Game.supplyLines?Game.supplyLines():[],available=supplyLinesAvailable();
  return `<section class="panel supply-lines-panel"><div class="section-title"><h3>自动补给线</h3><span class="badge">${rows.length}/12</span></div><p class="hint">目的城库存低于目标时按缺口运输，每条线路同时只有一队。源城保留量与行军粮优先扣算。</p>${available?'': '<p class="notice">共享世界暂不支持自动补给线，请使用手动运输。</p>'}<div class="guide-actions">${btn('新增补给线','supplyLineNew','','small secondary',!available||rows.length>=12)}</div>${rows.length?`<div class="supply-lines-grid">${rows.map(row=>`<article class="supply-line-card"><div class="quest-heading"><h4>${esc(supplyLineCityName(row.sourceCity))} → ${esc(supplyLineCityName(row.destinationCity))}</h4><span class="badge">${!row.enabled&&row.state==='inflight'?'已暂停 · ':''}${esc(supplyLineStateName(row))}</span></div><p>${esc(Game.resources[row.resource].name)}目标 ${num(row.targetStock)} · 源城保留 ${num(row.sourceReserve)}</p><p class="hint">${esc(row.reason||'')}${row.pending?` · 待到货 ${num(row.pending)}`:''}</p>${row.job?`<p class="hint">${row.job.phase==='return'?'返城':'送达'}剩余 ${clock(row.job.end)}</p>`:row.state==='ready'?`<p class="hint">下趟装载 ${num(row.amount)} · 单程 ${duration(row.quote?.seconds||0)} · 行军粮 ${num(row.quote?.foodCost||0)}</p>`:''}<div class="guide-actions">${btn(row.enabled?'暂停':'恢复','supplyLineToggle',row.id,'small secondary',!available)}${btn('修改','supplyLineEdit',row.id,'small secondary',!available||row.state==='inflight')}${btn('删除','supplyLineRemoveAsk',row.id,'small secondary',!available)}</div></article>`).join('')}</div>`:'<p class="empty">尚未配置补给线。可从粮城向驻军城持续供粮，也可运送木、石、铁和黄金。</p>'}<details class="world-tool-details" data-ui-disclosure="supply-lines-rules"><summary>补给规则与离线说明</summary><p class="hint">固定运输队需在源城待命，市场、校场、单队人数、负重和行军粮按手动运输规则检查。运输队未返城前不会再次派遣；手动召回会暂停对应路线。源城助手设置的资源保留量也会生效。</p><p class="hint">离线期间只结算已经出发的队伍。重开游戏后根据当前库存派遣一趟，不补算离线期间的历史往返。暂停不会召回已经出发的队伍；有在途队伍时需等返城后修改或删除配置。</p></details></section>`;
}
function supplyLinesModal(){showModal('城际自动补给',supplyLinesHTML(),btn('关闭','close','','secondary'));manualModalContext=supplyLinesModal;}
function supplyLineEditor(id='',preset={}){
  if(!supplyLinesAvailable()){toast('共享世界暂不支持自动补给线');return;}
  const cities=Game.cityList(),old=id?Game.supplyLines().find(row=>row.id===id):null;
  if(cities.length<2){showModal('自动补给线','<p class="notice">至少拥有两座城市后可配置补给线。</p>',btn('关闭','close'));return;}
  if(id&&!old){toast('补给线不存在');return;}
  if(old?.state==='inflight'){toast('运输队仍在途中，请等返城后再修改');return;}
  const source=old?.sourceCity||preset.sourceCity||activeCityMeta().id,destination=old?.destinationCity||preset.destinationCity||cities.find(c=>c.id!==source).id;
  supplyLineDraft={id,sourceCity:source,destinationCity:destination,resource:old?.resource||'food',targetStock:old?.targetStock||10000,sourceReserve:old?.sourceReserve??10000,army:{...(old?.army||{})},enabled:old?.enabled??true,key:''};
  if(!old){const army=Game.getCityState(source)?.army||{};if(army.wagon>0)supplyLineDraft.army.wagon=Math.min(army.wagon,10);}
  manualModalContext=null;
  const options=selected=>cities.map(c=>`<option value="${esc(c.id)}" ${selected===c.id?'selected':''}>${esc(c.name)}</option>`).join('');
  showModal(id?'修改补给线':'新增补给线',`<div class="supply-line-form"><div class="supply-line-pair"><label>来源城市<select id="supply-line-source">${options(source)}</select></label><label>目的城市<select id="supply-line-destination">${options(destination)}</select></label></div><label>运输资源<select id="supply-line-resource">${SupplyLines.resources.map(resource=>`<option value="${resource}" ${supplyLineDraft.resource===resource?'selected':''}>${esc(Game.resources[resource].name)}</option>`).join('')}</select></label><div class="supply-line-pair"><label>目的城目标库存<input id="supply-line-target" type="number" min="1" max="1000000000" step="1" inputmode="numeric" value="${supplyLineDraft.targetStock}"></label><label>源城该资源保留<input id="supply-line-reserve" type="number" min="0" max="1000000000" step="1" inputmode="numeric" value="${supplyLineDraft.sourceReserve}"></label></div><label class="supply-line-enable"><input id="supply-line-enabled" type="checkbox" ${supplyLineDraft.enabled?'checked':''}>启用自动补给</label><details class="world-tool-details" open><summary>固定运输队</summary><p class="hint">每趟派出相同部队，不额外保留士兵；部队正在其他队伍中时会等待。</p><div id="supply-line-army" class="supply-line-pair"></div></details><div id="supply-line-preview" aria-live="polite"></div><p class="hint">保存后按当前缺口派遣，运输队返城后再检查下一趟。离线期间不会新派队伍。</p></div>`,btn('返回','supplyLines','','secondary')+btn('保存补给线','supplyLineSave'));
  supplyLineArmyInputs();updateSupplyLinePreview();
}
function supplyLineArmyInputs(){
  const target=document.getElementById('supply-line-army');if(!target||!supplyLineDraft)return;
  const army=Game.getCityState(supplyLineDraft.sourceCity)?.army||{};
  target.innerHTML=Object.entries(Game.units).filter(([id])=>army[id]>0||supplyLineDraft.army[id]>0).map(([id,u])=>`<label>${esc(u.name)}<small>源城待命 ${num(army[id]||0)}</small><input type="number" min="0" max="1000000" step="1" inputmode="numeric" value="${supplyLineDraft.army[id]||0}" data-supply-army="${id}" aria-label="固定运输队${esc(u.name)}人数"></label>`).join('')||'<p class="hint">源城没有可用部队，需先训练运输与护送兵力。</p>';
}
function supplyLineForm(){
  const number=(id,min)=>{const input=document.getElementById(id),n=Number(input.value);if(input.value===''||!Number.isFinite(n))return NaN;const value=Math.max(min,Math.min(1000000000,Math.floor(n)));input.value=value;return value;};
  const army={};for(const input of document.querySelectorAll('[data-supply-army]')){const n=Number(input.value),value=input.value!==''&&Number.isFinite(n)?Math.max(0,Math.min(1000000,Math.floor(n))):NaN;if(Number.isFinite(value))input.value=value;if(value!==0)army[input.dataset.supplyArmy]=value;}
  return {id:supplyLineDraft.id,sourceCity:document.getElementById('supply-line-source').value,destinationCity:document.getElementById('supply-line-destination').value,resource:document.getElementById('supply-line-resource').value,targetStock:number('supply-line-target',1),sourceReserve:number('supply-line-reserve',0),army,enabled:document.getElementById('supply-line-enabled').checked};
}
function supplyLinePreviewHTML(q){
  if(q.reason)return `<p class="notice">${esc(q.reason)}</p>`;
  const p=q.plan;if(!p)return '<p class="hint">暂无运输预览。</p>';
  return `<div class="notice supply-line-preview"><strong>当前缺口 ${num(p.deficit||0)} · 待到货 ${num(p.pending||0)}</strong>${q.draft?.enabled===false?'<p class="hint">保存为暂停状态，启用后才会派遣。以下为启用时的运输预览。</p>':''}${p.state==='ready'?`<p>本次装载 ${num(p.amount)} · 部队负重 ${num(p.quote.carry)}</p>`:''}${p.quote?`<p>单程 ${duration(p.quote.seconds)} · 行军粮 ${num(p.quote.foodCost)}</p>${p.quote.marchFactor===.8?'<p class="hint">来源关隘行军时间 −20% 已计入。</p>':''}`:''}<p class="hint">${esc(p.reason||'')}${p.foodReserve?` · 源城粮食至少保留 ${num(p.foodReserve)}`:''}</p>${p.state==='blocked'?'<p class="hint">可保存配置，满足条件后会自动恢复派遣。</p>':''}</div>`;
}
function updateSupplyLinePreview(){
  const target=document.getElementById('supply-line-preview');if(!target||!supplyLineDraft)return;
  const draft=supplyLineForm(),q=Game.supplyLineQuote(draft);supplyLineDraft={...draft,key:q.key};target.innerHTML=supplyLinePreviewHTML(q);
  const button=modalBody.querySelector('[data-action="supplyLineSave"]');if(button)button.disabled=!!q.reason||!supplyLinesAvailable();
}
function supplyLinesChange(event){
  const el=event.target;if(!el||!supplyLineDraft||!el.matches?.('[id^="supply-line-"],[data-supply-army]'))return false;
  if(el.id==='supply-line-source'){
    supplyLineDraft.sourceCity=el.value;supplyLineDraft.army={};const army=Game.getCityState(el.value)?.army||{};if(army.wagon>0)supplyLineDraft.army.wagon=Math.min(army.wagon,10);
    const dest=document.getElementById('supply-line-destination');if(dest.value===el.value)dest.value=Game.cityList().find(c=>c.id!==el.value)?.id||'';supplyLineArmyInputs();
  }
  updateSupplyLinePreview();return true;
}
function handleSupplyLinesAction(action,id=''){
  if(!['supplyLines','supplyLineNew','supplyLineEdit','supplyLineToggle','supplyLineSave','supplyLineRemoveAsk','supplyLineRemove'].includes(action))return false;
  if(action==='supplyLines'){supplyLinesModal();return true;}
  if(!supplyLinesAvailable()){toast('共享世界暂不支持自动补给线');return true;}
  if(action==='supplyLineNew'||action==='supplyLineEdit')supplyLineEditor(action==='supplyLineEdit'?id:'');
  if(action==='supplyLineSave'&&supplyLineDraft){const d=supplyLineForm();if(actResult(Game.saveSupplyLine(d,supplyLineDraft.key),'补给线已保存'))supplyLinesModal();else updateSupplyLinePreview();}
  if(action==='supplyLineToggle'){const row=Game.supplyLines().find(l=>l.id===id);if(row&&actResult(Game.setSupplyLineEnabled(id,!row.enabled),row.enabled?'补给线已暂停':'补给线已恢复'))supplyLinesModal();}
  if(action==='supplyLineRemoveAsk'){const row=Game.supplyLines().find(l=>l.id===id);if(!row){toast('补给线不存在');return true;}showModal('删除补给线',`<p>删除 ${esc(supplyLineCityName(row.sourceCity))} → ${esc(supplyLineCityName(row.destinationCity))} 的${esc(Game.resources[row.resource].name)}补给配置？</p><p class="hint">有在途运输队时需先暂停，等待返城后删除。</p>`,btn('返回','supplyLines','','secondary')+btn('确认删除','supplyLineRemove',id));manualModalContext=null;}
  if(action==='supplyLineRemove'&&actResult(Game.removeSupplyLine(id),'补给线已删除'))supplyLinesModal();
  return true;
}
