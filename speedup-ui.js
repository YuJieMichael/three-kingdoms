'use strict';
function speedupQueueButton(kind,q){return btn('加速','speedupQuick',kind+'|'+Game.speedupKey(kind,q),'small secondary');}
function speedupQueueLabel(target){return target.name+(target.waitSeconds>0?' · 等待 '+duration(target.waitSeconds):'')+' · 剩余工作 '+duration(target.workSeconds);}
function speedupChoices(kind,key=''){
  const target=Game.speedupTargets(kind).find(t=>t.key===key)||(!key?Game.speedupTargets(kind)[0]:null);
  return Game.manual.shop.filter(i=>i.effect==='speedup'&&i.queueKind===kind).map((item,index)=>{
    const quote=target?Game.speedupQuote(item.id,target.key):null,owned=Math.max(0,S().inventory[item.id]||0);
    const waste=quote&&!quote.error?Math.max(0,quote.maxMs-quote.workMs):Infinity;
    const saved=quote&&!quote.error?Math.min(quote.maxMs,quote.workMs):0;
    return {item,index,owned,quote,waste,saved,target};
  }).sort((a,b)=>Number(b.owned>0)-Number(a.owned>0)||a.waste-b.waste||b.saved-a.saved||a.index-b.index);
}
function speedupQuickModal(kind,key){
  if(!SpeedupData.kinds[kind])return;
  const candidate=speedupChoices(kind,key).find(c=>c.owned>0&&c.quote&&!c.quote.error);
  if(candidate){speedupPlanModal(candidate.item.id,key);return;}
  speedupPickerModal(kind,key);
}
function speedupPickerModal(kind,targetKey=''){
  if(!SpeedupData.kinds[kind])return;
  const targets=Game.speedupTargets(kind),choices=speedupChoices(kind,targetKey),best=choices.find(c=>c.owned>0&&c.quote&&!c.quote.error);
  showModal(SpeedupData.kinds[kind]+'加速',`<p class="notice">${kind==='build'?'城内建筑与城外资源田均可选择。':kind==='research'?'选择当前科技研究任务。':'等待开训不计入可缩短时间，后续批次同步提前。'}已持有的道具优先显示，推荐尽量少浪费时长的规格。</p>${targets.length?'<p class="hint">'+targets.map(t=>esc(speedupQueueLabel(t))).join('<br>')+'</p>':'<p class="hint">没有可加速的任务，先开始'+SpeedupData.kinds[kind]+'。</p>'}${!best&&targets.length?'<p class="hint">当前没有已持有的加速道具，可先领取成长礼包或任务奖励。</p>':''}<div class="speedup-grid">${choices.map(c=>{
    const {item,owned,quote}=c,recommended=c===best;
    const effective=quote&&!quote.error?`实际节省 ${duration(c.saved/1000)}${quote.minMs!==quote.maxMs?'（随机上限）':''}${c.waste>0?' · 最多溢出 '+duration(c.waste/1000):' · 时长可完整利用'}`:'';
    return `<article class="shop-card ${owned?'speedup-owned':'speedup-unowned'} ${recommended?'speedup-recommended':''}">${itemIcon(item)}<h3>${esc(item.speedup.label)}${recommended?'<span class="speedup-best-label">推荐</span>':''}</h3><p class="hint speedup-stock">持有 ×${num(owned)}</p><p class="hint speedup-effect">${effective||esc(item.speedup.ratio?'缩短剩余工作时间的 30%。':item.speedup.minHours?'随机缩短 15–30 个整小时。':'缩短 '+item.speedup.label+'。')}</p><div class="speedup-card-actions">${btn(owned?'查看使用预览':'未持有','speedupPlan',item.id+'|'+targetKey,'small secondary',!targets.length||!owned)}${btn('购买 ×1 · '+item.price+' 元宝','speedupBuy',item.id+'|'+targetKey,'small',S().gems<item.price)}</div></article>`;
  }).join('')}</div>`,btn('全部队列','classicQueues','','secondary')+btn('关闭','close','','secondary'));
  manualModalContext=()=>speedupPickerModal(kind,targetKey);
}
function speedupPlanModal(itemId,preferred=''){
  const item=Game.manual.shop.find(i=>i.id===itemId);if(item?.effect!=='speedup')return;
  const targets=Game.speedupTargets(item.queueKind),stale=!!preferred&&!targets.some(t=>t.key===preferred),key=stale?'':targets.some(t=>t.key===preferred)?preferred:targets[0]?.key||'';
  const target=targets.find(t=>t.key===key),single=targets.length===1&&!stale;
  showModal('确认加速 · '+item.speedup.label,`<p class="sub">${esc(item.name)} · 持有 ×${num(S().inventory[item.id]||0)}</p>${targets.length?`${single?'<p class="speedup-selected-target">'+esc(speedupQueueLabel(target))+'</p>':'<label class="label" for="speedup-target">选择加速任务</label>'}<select id="speedup-target" data-item="${item.id}" ${single?'hidden':''}>${stale?'<option value="" disabled selected>原任务已完成或变化，请重新选择</option>':''}${targets.map(t=>`<option value="${esc(t.key)}" ${t.key===key?'selected':''}>${esc(speedupQueueLabel(t))}</option>`).join('')}</select><div id="speedup-preview" class="notice" role="status"></div>`:'<p class="empty">当前没有可加速任务。没有任务时不消耗道具。</p>'}${item.speedup.minHours?'<p class="hint">随机时间仅在确认使用时抽取一次。</p>':''}`,btn('其他规格','speedupPicker',item.queueKind+'|'+key,'secondary')+btn('确认使用 ×1','speedupUse',item.id,'',!key||!targets.length||!(S().inventory[item.id]>0)));
  updateSpeedupPreview();
  manualModalContext=()=>{const selected=document.getElementById('speedup-target')?.value;speedupPlanModal(itemId,selected||(stale?preferred:key));};
}
function updateSpeedupPreview(){
  const select=document.getElementById('speedup-target'),preview=document.getElementById('speedup-preview');if(!select||!preview)return;
  const quote=Game.speedupQuote(select.dataset.item,select.value);
  const confirm=modalBody.querySelector('[data-action="speedupUse"]');if(confirm)confirm.disabled=!!quote.error||!(S().inventory[select.dataset.item]>0);
  if(quote.error){preview.textContent=quote.error;return;}
  const savedMin=Math.min(quote.workMs,quote.minMs),savedMax=Math.min(quote.workMs,quote.maxMs),wasteMin=Math.max(0,quote.minMs-quote.workMs),wasteMax=Math.max(0,quote.maxMs-quote.workMs);
  preview.innerHTML=`剩余工作 ${duration(quote.workMs/1000)}<br><strong>${savedMin===savedMax?'实际节省 '+duration(savedMax/1000):'实际节省 '+duration(savedMin/1000)+' – '+duration(savedMax/1000)}</strong><br>使用后剩余 ${quote.afterMinMs===quote.afterMaxMs?duration(quote.afterMinMs/1000):duration(quote.afterMinMs/1000)+' – '+duration(quote.afterMaxMs/1000)}${quote.waitMs>0?'<br>仍需等待前一批 '+duration(quote.waitMs/1000)+'，不会提前开训。':''}${quote.overflow?'<p class="speedup-waste">超出剩余工作 '+(wasteMin===wasteMax?duration(wasteMax/1000):duration(wasteMin/1000)+' – '+duration(wasteMax/1000))+'，超出部分不会返还。</p>':'<p class="hint">本规格时长可完整利用。</p>'}`;
}
document.addEventListener('change',event=>{if(event.target.id==='speedup-target')updateSpeedupPreview();});
document.addEventListener('click',event=>{
  const el=event.target.closest('[data-action]');if(!el||el.disabled)return;const a=el.dataset.action,id=el.dataset.id;
  if(a==='speedupQuick'){const [kind,key]=id.split('|');speedupQuickModal(kind,key||'');}
  if(a==='speedupPicker'){const [kind,key]=id.split('|');speedupPickerModal(kind,key||'');}
  if(a==='speedupPlan'){const [item,key]=id.split('|');speedupPlanModal(item,key||'');}
  if(a==='speedupBuy'){const [itemId,key]=id.split('|'),item=Game.manual.shop.find(i=>i.id===itemId);if(!item)return;const error=Game.buyItem(itemId);speedupPickerModal(item.queueKind,key||'');actResult(error,'加速道具已收入行囊');}
  if(a==='speedupUse'){
    const key=document.getElementById('speedup-target')?.value,result=Game.useSpeedup(id,key),item=Game.manual.shop.find(i=>i.id===id);
    if(result.error){speedupPlanModal(id,key);actResult(result.error);return;}
    if(result.completed)modal.close();else speedupPickerModal(item.queueKind,key);
    actResult(null,'已缩短 '+duration(result.removedMs/1000)+(result.completed?'，任务已完成':result.waitMs>0?'，等待前一批后开训':'')+(result.requestedMs>result.removedMs?'；超出部分未保留':''));
  }
});
