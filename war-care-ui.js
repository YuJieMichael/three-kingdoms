'use strict';
let defenseDoctrineDraft=null,warCareDraft=null;
const warCareCity=()=>Game.currentCityId?.()||S().realm?.activeCity||'capital';
function warCareHTML(){
  if(!Game.warCareQuote)return '';const q=Game.warCareQuote();if(!q)return '';
  return `<section class="panel" aria-label="本城伤兵营"><div class="section-title"><h3>伤兵营</h3><span class="label">${num(q.available)} 人待治${q.autoHeal?' · 自动治疗':''}</span></div>${q.autoHeal&&q.lastAuto?.blocked?'<p class="notice">黄金不足，部分伤兵仍在营中等待治疗。</p>':''}${btn('查看伤兵与治疗','warCare','','small secondary')}${btn('守城战术','warCareDoctrine','','small secondary')}</section>`;
}
function warCareModal(reset=true){
  const q=Game.warCareQuote(),city=warCareCity();if(!q)return;
  const rows=q.rows.filter(r=>r.count>0);
  if(!reset&&warCareDraft?.city===city&&modalBody.dataset.warCareCity===city)modalBody.querySelectorAll('[data-war-care-count]').forEach(el=>{warCareDraft.counts[el.dataset.warCareCount]=Math.max(0,Math.floor(Number(el.value)||0));});
  if(reset||!warCareDraft||warCareDraft.city!==city)warCareDraft={city,counts:Object.fromEntries(rows.map(r=>[r.id,r.count]))};
  for(const r of rows)warCareDraft.counts[r.id]=Math.min(r.count,warCareDraft.counts[r.id]??r.count);
  showModal(esc(Game.cityMeta?.(city)?.name||activeCityMeta().name)+' · 伤兵营',`<p class="sub">伤兵不是可出征驻军。治疗消耗本城黄金，治好后立即归入本城驻军；离线不会令伤兵死亡。伤兵按所属兵种养兵粮耗的2倍消耗粮食。</p><p class="hint">待治 ${num(q.available)} 人 · 全部治疗需要 ${num(q.gold)} 黄金 · 当前黄金 ${num(S().res.gold)}</p><table class="defense-force-table"><thead><tr><th>兵种</th><th>待治</th><th>黄金／人</th><th>治疗人数</th><th>操作</th></tr></thead><tbody>${rows.map(r=>`<tr><th>${esc(Game.units[r.id].name)}</th><td>${num(r.count)}</td><td>${num(r.price)}</td><td><input type="number" data-war-care-count="${r.id}" min="0" max="${r.count}" step="1" value="${r.count}" aria-label="${esc(Game.units[r.id].name)}治疗人数"></td><td>${btn('治疗','warCareHeal',r.id,'small secondary')}</td></tr>`).join('')||'<tr><td colspan="5">本城没有待治疗伤兵。</td></tr>'}</tbody></table>${q.reason&&q.available?`<p class="notice">${esc(q.reason)}。可以按兵种减少治疗人数。</p>`:''}<div class="settings-row">${btn('一键治疗全部','warCareHealAll','','secondary',!!q.reason)}${btn(q.autoHeal?'关闭自动治疗':'开启自动治疗','warCareAuto','','secondary')}</div><p class="hint">自动治疗按兵种列表顺序使用可用黄金，能治多少治多少；剩余伤兵继续等待，补足黄金后恢复。关闭后不再自动消费。手动一键治疗需要整单黄金，不会半途扣款。</p>${q.lastAuto?`<p class="hint">上次自动治疗 ${num(q.lastAuto.healed)} 人，消费 ${num(q.lastAuto.gold)} 黄金${q.lastAuto.blocked?'；仍有 '+num(q.lastAuto.remaining)+' 人等待黄金':''}。</p>`:''}`,btn('关闭','close','','secondary')+btn('守城战术','warCareDoctrine','','secondary'));
  modalBody.dataset.warCareCity=city;
  modalBody.querySelectorAll('[data-war-care-count]').forEach(el=>{el.value=warCareDraft.counts[el.dataset.warCareCount];});
  if(typeof manualModalContext!=='undefined')manualModalContext=()=>warCareModal(false);
}
function defenseDoctrinePrepare(){const city=warCareCity();if(!defenseDoctrineDraft||defenseDoctrineDraft.city!==city)defenseDoctrineDraft={city,preset:JSON.parse(JSON.stringify(S().warCare?.defense||WarCare.defaultDefense(Game.units)))};return defenseDoctrineDraft;}
function defenseDoctrineHTML(preserve=true){
  if(preserve&&modalBody.querySelector('[data-defense-doctrine-city]')?.dataset?.defenseDoctrineCity===warCareCity())defenseDoctrineRead();
  if(typeof WarCare==='undefined'||!S().warCare)return '';const {preset,city}=defenseDoctrinePrepare(),incoming=S().cityDefense?.incoming;
  const targets=incoming?Object.keys(incoming.army).filter(id=>incoming.army[id]>0):Object.keys(Game.units);
  return `<section class="panel defense-preparation" data-defense-doctrine-city="${esc(city)}"><div class="section-title"><h3>本城守城战术</h3><span class="label">${preset.mode==='inside'?'驻军留城':'出城迎战'} · ${preset.autoResolve?'自动完成战斗':'逐回合查看'}</span></div><label class="label" for="defense-doctrine-mode">迎战方式</label><select id="defense-doctrine-mode"><option value="field" ${preset.mode==='field'?'selected':''}>出城迎战：所选驻军按兵种预设参战</option><option value="inside" ${preset.mode==='inside'?'selected':''}>驻军留城：驻军不参战，由工事和城门防守</option></select><label class="settings-row"><input id="defense-doctrine-auto" type="checkbox" ${preset.autoResolve?'checked':''}>明确点击迎战／继续后，自动完成剩余回合</label><details data-ui-disclosure="defense-doctrine"><summary>各兵种命令与目标</summary><p class="hint">留城方式下以下命令不执行。指定目标不在射程内时，攻击射程内最近的敌军。</p><div class="settings-row">${btn('全部前进','warCareOrderAll','advance','small secondary')}${btn('全部固守','warCareOrderAll','hold','small secondary')}${btn('全部后退','warCareOrderAll','fallback','small secondary')}</div><table class="defense-force-table"><thead><tr><th>兵种</th><th>命令</th><th>优先目标</th></tr></thead><tbody>${Object.entries(Game.units).map(([id,u])=>`<tr><th>${esc(u.name)}</th><td><select data-defense-doctrine-order="${id}" aria-label="${esc(u.name)}守城命令">${[['advance','前进'],['hold','固守'],['fallback','后退']].map(([value,label])=>`<option value="${value}" ${preset.orders[id].command===value?'selected':''}>${label}</option>`).join('')}</select></td><td><select data-defense-doctrine-target="${id}" aria-label="${esc(u.name)}守城目标"><option value="">最近可攻击目标</option>${[...new Set([...targets,...(preset.orders[id].target?[preset.orders[id].target]:[])])].map(target=>`<option value="${target}" ${preset.orders[id].target===target?'selected':''}>${esc(Game.units[target].name)}</option>`).join('')}</select></td></tr>`).join('')}</tbody></table></details><p class="hint">未选驻军始终安全留城。留城驻军不攻击、不受战损；敌军先打工事，工事耗尽后接触城门才能破门，留城仍可能失守并损失物资。前进每回合按速度移动（最多400），后退至城门前，固守当前位置。</p>${btn('保存本城战术','warCareDoctrineSave',city,'small secondary',!!S().cityDefense?.battle)}${S().cityDefense?.battle?'<p class="hint">进行中的战斗使用开战快照，结束后才可修改。</p>':''}</section>`;
}
function defenseDoctrineRead(){
  const d=defenseDoctrinePrepare(),mode=document.getElementById('defense-doctrine-mode'),auto=document.getElementById('defense-doctrine-auto');
  if(mode)d.preset.mode=mode.value;if(auto)d.preset.autoResolve=auto.checked;
  modalBody.querySelectorAll('[data-defense-doctrine-order]').forEach(el=>{d.preset.orders[el.dataset.defenseDoctrineOrder].command=el.value;});
  modalBody.querySelectorAll('[data-defense-doctrine-target]').forEach(el=>{d.preset.orders[el.dataset.defenseDoctrineTarget].target=el.value;});return d;
}
function defenseDoctrineModal(reset=true){if(reset)defenseDoctrineDraft=null;else if(document.getElementById('defense-doctrine-mode'))defenseDoctrineRead();showModal(esc(activeCityMeta().name)+' · 守城战术',defenseDoctrineHTML(!reset),btn('关闭','close','','secondary')+btn('准备守城','npcDefense','','secondary'));if(typeof manualModalContext!=='undefined')manualModalContext=()=>defenseDoctrineModal(false);}
function handleWarCareAction(action,id){
  if(!action.startsWith('warCare'))return false;
  if(action==='warCare'){warCareModal();return true;}
  if(action==='warCareDoctrine'){defenseDoctrineModal();return true;}
  if(action==='warCareOrderAll'){const d=defenseDoctrineRead();if(!['advance','hold','fallback'].includes(id))return true;for(const r of Object.values(d.preset.orders))r.command=id;modalBody.querySelectorAll('[data-defense-doctrine-order]').forEach(el=>el.value=id);return true;}
  if(action==='warCareDoctrineSave'){const d=defenseDoctrineRead();if(id!==warCareCity()||d.city!==warCareCity()){toast('当前城市已改变，请重新查看战术');return true;}if(actResult(Game.setDefenseDoctrine(d.preset),'本城守城战术已保存'))defenseDoctrineModal();return true;}
  if(action==='warCareHeal'||action==='warCareHealAll'||action==='warCareAuto'){
    if(modalBody.dataset.warCareCity!==warCareCity()){toast('当前城市已改变，请重新查看伤兵营');return true;}
    if(action==='warCareAuto'){actResult(Game.setAutoHeal(!S().warCare.autoHeal),'自动治疗设置已更新');warCareModal();return true;}
    const unit=action==='warCareHealAll'?'all':id,input=unit==='all'?null:modalBody.querySelector(`[data-war-care-count="${unit}"]`),count=input?Math.max(0,Math.floor(Number(input.value)||0)):undefined,q=Game.warCareQuote(unit,count);
    if(!q){toast('请选择有效兵种与治疗人数');return true;}const result=Game.healWounded(unit,count,q.key),error=typeof result==='string'?result:null;if(actResult(error,result&&typeof result==='object'?'治疗 '+num(result.healed)+' 人，消费 '+num(result.gold)+' 黄金':'伤兵已治疗'))warCareModal();return true;
  }
  return false;
}
function warCareChange(event){if(event.target?.id==='defense-doctrine-mode'||event.target?.id==='defense-doctrine-auto'||event.target?.dataset?.defenseDoctrineOrder||event.target?.dataset?.defenseDoctrineTarget){defenseDoctrineRead();return true;}return false;}
document.addEventListener('click',event=>{const el=event.target.closest('[data-action]');if(!el||el.disabled)return;handleWarCareAction(el.dataset.action,el.dataset.id||'');});
document.addEventListener('change',warCareChange);
