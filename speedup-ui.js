'use strict';
function speedupQueueButton(kind,q){return btn('加速','speedupPicker',kind+'|'+Game.speedupKey(kind,q),'small secondary');}
function speedupQueueLabel(target){return target.name+(target.waitSeconds>0?' · 等待 '+duration(target.waitSeconds):'')+' · 剩余工作 '+duration(target.workSeconds);}
function speedupPickerModal(kind,targetKey=''){
  if(!SpeedupData.kinds[kind])return;
  const targets=Game.speedupTargets(kind),items=Game.manual.shop.filter(i=>i.effect==='speedup'&&i.queueKind===kind);
  showModal(SpeedupData.kinds[kind]+'加速',`<p class="notice">${kind==='build'?'城内建筑与城外资源田均可选择。':kind==='research'?'选择当前科技研究任务。':'选择一个练兵批次，后续批次随之提前；等待前一批开训的时间不计入可缩短时间。'}道具按当前剩余工作时间生效，不再乘试玩倍率。</p>${targets.length?'<p class="hint">'+targets.map(t=>esc(speedupQueueLabel(t))).join('<br>')+'</p>':'<p class="hint">没有可加速的任务，先开始'+SpeedupData.kinds[kind]+'。</p>'}<div class="speedup-grid">${items.map(item=>`<article class="shop-card">${itemIcon(item)}<h3>${esc(item.speedup.label)}</h3><p class="hint speedup-stock">持有 ×${num(S().inventory[item.id]||0)} · ${item.price} 元宝</p><p class="hint speedup-effect">${item.speedup.ratio?'每次缩短所选任务剩余工作时间的 30%。':item.speedup.minHours?'每次使用随机缩短 15–30 个整小时。':'缩短 '+item.speedup.label+'。'}</p><div class="speedup-card-actions">${btn('选择使用','speedupPlan',item.id+'|'+targetKey,'small secondary',!targets.length)}${btn('购买 ×1','speedupBuy',item.id+'|'+targetKey,'small',S().gems<item.price)}</div></article>`).join('')}</div>`,btn('全部队列','classicQueues','','secondary')+btn('关闭','close','','secondary'));
  manualModalContext=()=>speedupPickerModal(kind,targetKey);
}
function speedupPlanModal(itemId,preferred=''){
  const item=Game.manual.shop.find(i=>i.id===itemId);if(item?.effect!=='speedup')return;
  const targets=Game.speedupTargets(item.queueKind),stale=!!preferred&&!targets.some(t=>t.key===preferred),key=stale?'':targets.some(t=>t.key===preferred)?preferred:targets[0]?.key||'';
  showModal('使用 · '+item.name,`${itemIcon(item)}<p class="sub">${esc(item.desc)}</p><p class="hint">持有 ×${num(S().inventory[item.id]||0)}</p>${targets.length?`<label class="label" for="speedup-target">选择加速任务</label><select id="speedup-target" data-item="${item.id}">${stale?'<option value="" disabled selected>原任务已完成或变化，请重新选择</option>':''}${targets.map(t=>`<option value="${esc(t.key)}" ${t.key===key?'selected':''}>${esc(speedupQueueLabel(t))}</option>`).join('')}</select><div id="speedup-preview" class="notice"></div>`:'<p class="empty">当前没有可加速任务。没有任务时不消耗道具。</p>'}${item.speedup.minHours?'<p class="hint">随机时间在确认使用时抽取一次，不会因查看预览改变。</p>':''}`,btn('返回加速','speedupPicker',item.queueKind+'|'+key,'secondary')+btn('确认使用 ×1','speedupUse',item.id,'',!key||!targets.length||!(S().inventory[item.id]>0)));
  updateSpeedupPreview();
  manualModalContext=()=>{const selected=document.getElementById('speedup-target')?.value;speedupPlanModal(itemId,selected||(stale?preferred:key));};
}
function updateSpeedupPreview(){
  const select=document.getElementById('speedup-target'),preview=document.getElementById('speedup-preview');if(!select||!preview)return;
  const quote=Game.speedupQuote(select.dataset.item,select.value);
  const confirm=modalBody.querySelector('[data-action="speedupUse"]');if(confirm)confirm.disabled=!!quote.error||!(S().inventory[select.dataset.item]>0);
  if(quote.error){preview.textContent=quote.error;return;}
  preview.innerHTML=`剩余工作时间 ${duration(quote.workMs/1000)}<br>${quote.minMs===quote.maxMs?'本次缩短 '+duration(quote.maxMs/1000)+'，使用后剩余 '+duration(quote.afterMinMs/1000):'本次随机缩短 '+duration(quote.minMs/1000)+' – '+duration(quote.maxMs/1000)+'，使用后剩余 '+duration(quote.afterMinMs/1000)+' – '+duration(quote.afterMaxMs/1000)}${quote.waitMs>0?'<br>需先等待前一批 '+duration(quote.waitMs/1000)+'，不会提前于前一批开训。':''}${quote.overflow?'<br>道具时长可能超过剩余工作时间，超出部分不会返还。':''}`;
}
document.addEventListener('change',event=>{if(event.target.id==='speedup-target')updateSpeedupPreview();});
document.addEventListener('click',event=>{
  const el=event.target.closest('[data-action]');if(!el||el.disabled)return;const a=el.dataset.action,id=el.dataset.id;
  if(a==='speedupPicker'){const [kind,key]=id.split('|');speedupPickerModal(kind,key||'');}
  if(a==='speedupPlan'){const [item,key]=id.split('|');speedupPlanModal(item,key||'');}
  if(a==='speedupBuy'){const [itemId,key]=id.split('|'),item=Game.manual.shop.find(i=>i.id===itemId);if(!item)return;const error=Game.buyItem(itemId);speedupPickerModal(item.queueKind,key||'');actResult(error,'加速道具已收入行囊');}
  if(a==='speedupUse'){
    const key=document.getElementById('speedup-target')?.value,result=Game.useSpeedup(id,key),item=Game.manual.shop.find(i=>i.id===id);
    if(result.error){speedupPlanModal(id,key);actResult(result.error);return;}
    speedupPickerModal(item.queueKind);actResult(null,'已缩短 '+duration(result.removedMs/1000)+(result.completed?'，任务已完成':result.waitMs>0?'，等待前一批后开训':'')+(result.requestedMs>result.removedMs?'；超出部分未保留':''));
  }
});
