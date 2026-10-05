'use strict';
let selectedFormation='archer';
const orderNames={advance:'向前',hold:'坚守',fallback:'后退'};
let combatObservedBattle=null,combatObservedRound=0;
function combatRoundFeedback(b){
  // Reading a restored battle seeds the baseline. Only a later live round can
  // animate; selection changes, timer refreshes and reopening the page cannot.
  if(combatObservedBattle!==b){combatObservedBattle=b;combatObservedRound=b.round;return [];}
  if(b.round<=combatObservedRound)return [];
  combatObservedRound=b.round;
  return b.currentRoundSummary?.round===b.round?b.currentRoundSummary.events:[];
}
function startCombatFeedback(){
  // Called once after render installs the HTML. Repeating this hook on the
  // same DOM keeps the current animation position and cannot restart it.
  document.querySelectorAll('[data-combat-feedback]').forEach(el=>{
    if(el.dataset.combatFeedbackStarted==='true')return;
    el.dataset.combatFeedbackStarted='true';el.classList.add('combat-feedback-playing');
  });
}
function combatEventName(id){return id==='gate'?'城防':id==='tower'?'箭楼':Game.units[id]?.name||id;}
function combatRoundSummaryHTML(b){
  if(!b.round)return '';
  const summary=b.currentRoundSummary;
  if(!summary||summary.round!==b.round)return '<p class="hint combat-round-summary">此旧回合的详细经过保留在下方战斗日志。</p>';
  const attacks=summary.events.filter(e=>['strike','gate','tower'].includes(e.type));
  const down=side=>attacks.filter(e=>e.side!==side&&e.type!=='gate').reduce((sum,e)=>sum+e.killed,0);
  const moves=summary.events.filter(e=>e.type==='move');
  return `<section class="combat-round-summary" aria-label="本回合战况"><div class="combat-round-heading"><h4>第 ${summary.round} 回合战况</h4><p>我军倒下 <strong>${num(down('player'))}</strong> 人 · 敌军倒下 <strong>${num(down('enemy'))}</strong> 人</p></div><p class="hint">回合倒下人数包含待战后判定的伤兵；永久损失在战后结算。</p>${attacks.length?`<ol class="combat-event-list">${attacks.map(e=>`<li class="combat-event-${e.side}"><span class="combat-event-side">${e.side==='player'?'我军':'敌军'}</span><strong>${esc(combatEventName(e.unit))}</strong><span>${e.counter?'反击':e.tag==='readyShot'?'预备射击':e.ranged?'射击':'攻击'} → ${e.side==='player'?'敌军':'我军'}${esc(combatEventName(e.target))}</span><span class="combat-event-result">${e.type==='gate'?'城防损伤':'伤害'} ${resourceAmount(e.damage)}${e.type!=='gate'?' · 倒下 '+num(e.killed)+' 人':''}</span></li>`).join('')}</ol>`:'<p class="combat-no-strike">本回合双方未命中目标，可检查距离与各队指令。</p>'}${typeof battleTacticEventsHTML==='function'?battleTacticEventsHTML(b):''}${moves.length?`<details class="combat-move-detail"><summary>移动 ${moves.length} 队 · 查看位置变化</summary><ul>${moves.map(e=>`<li>${e.side==='player'?'我军':'敌军'}${esc(combatEventName(e.unit))}：${e.from} → ${e.to}</li>`).join('')}</ul></details>`:''}</section>`;
}
function combatEffectsHTML(b,events,unitIds){
  const attacks=events.filter(e=>['strike','gate','tower'].includes(e.type));if(!attacks.length)return '';
  const y=(id,side)=>['gate','tower'].includes(id)?3:(unitIds.indexOf(id)+(side==='player'?.28:.72))/unitIds.length*100;
  return `<svg class="combat-effects" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">${attacks.map((e,i)=>`<path class="${e.ranged?'combat-shot':'combat-slash'} ${e.side==='enemy'?'combat-enemy-shot':''}" pathLength="100" vector-effect="non-scaling-stroke" style="--combat-delay:${Math.min(i*24,220)}ms" d="M ${e.from/b.length*100} ${y(e.unit,e.side)} L ${e.to/b.length*100} ${y(e.target,e.side==='player'?'enemy':'player')}"/>`).join('')}</svg>`;
}
function battleAllOrdersHTML(b,context={}){if(!b||b.finished)return '';const disabled=!b.player.some(r=>r.hp>0);return `<div class="unit-order"><strong>全军指令</strong><div class="unit-order-buttons">${[['hold','全部固守 ▣'],['advance','全部前进 →'],['fallback','← 全部后退']].map(([command,label])=>btn(label,context.practice?'tacticalLessonAllOrders':'battleAllOrders',command,'small secondary',disabled)).join('')}</div><p class="hint">只调整仍能行动的我军，下回合生效；保留各队攻击目标，之后仍可逐队改令。</p></div>`;}
function tacticsModal(){
  showModal('出征战术',`<p class="sub">每种兵分别设置，新出征部队会携带这套战术。战斗中还能随时改令。</p><div class="tactics-modal-orders">${Object.entries(Game.units).map(([id,u])=>{
    const order=S().tactics[id];
    return `<article class="unit-order"><div class="unit-order-head"><strong class="unit-order-name">${troopPortrait(id,'unit-portrait-small')}${u.name}</strong><span class="label">${orderNames[order.command]}</span></div><p class="unit-data">速度 ${u.speed}/回合 · 射程 ${u.range}</p><div class="unit-order-buttons">${[['advance','向前 →'],['hold','坚守 ▣'],['fallback','← 后退']].map(([command,label])=>btn(label,'tacticOrder',`${id}:${command}`,`small secondary ${order.command===command?'active-order':''}`)).join('')}</div><label class="unit-target-label">优先目标<select data-tactic-target="${id}" aria-label="${u.name}默认攻击目标"><option value="" ${!order.target?'selected':''}>自动选择射程内敌军</option>${Object.entries(Game.units).map(([target,u])=>`<option value="${target}" ${order.target===target?'selected':''}>敌军${u.name}</option>`).join('')}</select></label></article>`;
  }).join('')}</div><p class="hint" style="margin-top:13px">设置自动保存。坚守保持原位，只能攻击射程内敌军。弓兵先向前接敌，进入射程后可坚守；后退时若敌军仍在射程内，也能攻击。</p>`,btn('设置完成','close'));
}
function battlePage(b=S().battle,context={}){
  if(!b)return '<p class="empty">当前没有战斗。</p>';
  const n=context.node||Game.getNode(b.node)||{name:context.title||'战术演练'},result=b.result,feedback=combatRoundFeedback(b);
  const commanderName=context.generalName||b.generalSnapshot?.name||Game.general(b.general).name;
  const selected=b.player.find(r=>r.id===selectedFormation&&r.hp>0)||b.player.find(r=>r.hp>0)||b.player[0];
  if(selected)selectedFormation=selected.id;
  const selectedUnit=selected?{...Game.units[selected.id],...selected.stats}:null;
  const selectedMainReserved=(Game.battleTacticsView?.(b)?.reservedMainAttacks||[]).some(r=>r.unit===selected?.id);
  const rangeStart=selected?Math.max(0,selected.pos-selectedUnit.range):0,rangeEnd=selected?Math.min(b.length,selected.pos+selectedUnit.range):0;
  const nearest=selected?Math.min(...b.enemy.filter(r=>r.hp>0).map(r=>Math.abs(r.pos-selected.pos))):Infinity;
  const unitIds=Object.keys(Game.units).filter(id=>[...b.player,...b.enemy].some(r=>r.id===id));
  const resultHTML=context.practice?(typeof battleLessonResultHTML==='function'?battleLessonResultHTML(context,b):''):b.finished?`<div class="result-banner ${result.won?'':'loss'}"><h3>${result.won?'旌旗报捷':'整军再战'}</h3><p class="hint">${battleOutcomeText(b,n)}${result.recruit?' · 严秋已加入帐下！':''}</p>${battleFailureHTML(result)}${battleCargoHTML(result)}${battleResourceHTML(result)}${battleDropsHTML(result)}${typeof tacticReceiptHTML==='function'?tacticReceiptHTML(result):''}${result.stationed?'<p class="notice">部队已驻守，耗粮为城内的 2 倍，可在领地管理中召回。</p>':''}<div class="result-stats">永久损失 ${Game.totalArmy(result.lost)} 人 · 伤兵归队 ${Game.totalArmy(result.wounded)} 人 · 武将经验 +${result.xp}</div>${n.orderRoute?btn('继续战役军令','taskTab','orders','small secondary'):''}${btn('收起战报 · 返回地图','battleDismiss','','small secondary')}</div>`:'';
  return `<div class="page-head"><div><h2>${esc(n.name)}</h2><p class="sub">${esc(commanderName)} 率军 · ${context.practice?'战术演练':n.orderRoute?'讨伐':b.mode==='raid'?'掠夺':'占领'} · 每种兵分别指挥，改令从下一回合生效。</p></div><span class="badge">${b.finished?'战斗结束':context.practice?'固定阵容演练':'两军交锋'}</span></div>${context.practice&&context.description?`<p class="notice tactical-lesson-objective">${esc(context.description)}</p>`:''}${resultHTML}${n.commander?`<p class="notice">敌将 ${n.commander.name} · ${n.commander.title} · 攻击 ×${n.commander.attack} / 防御 ×${n.commander.defense} · ${n.commander.order==='hold'?'破城前据守':'主动突击'}</p>`:''}${b.gate?`<section class="notice siege-status ${feedback.some(e=>e.type==='gate')?'combat-gate-impact':''}" ${feedback.some(e=>e.type==='gate')?`data-combat-feedback="${b.round}"`:''}><strong>${n.fortification.name} · ${b.gate.hp?'城防仍在':'城防已破'}</strong><p>耐久 ${num(b.gate.hp)} / ${num(b.gate.maxHp)} · ${b.gate.hp?`守军掩护 ×${n.fortification.protection} · 箭楼射程 ${n.fortification.range}`:'掩护解除，箭楼停射'}</p><progress max="${b.gate.maxHp}" value="${b.gate.hp}" aria-label="城防耐久"></progress><p class="hint">冲车、投石车自动优先攻城；其他部队可将攻击目标设为城防。破城与歼灭守军后才能占领。</p></section>`:b.siege?`<div class="notice">占领攻城：城防箭楼启用，守军防御 +25%，义兵 ${b.militia} 人加入守军。</div>`:''}<section class="panel combat-panel" ${feedback.length?`data-combat-feedback="${b.round}"`:''}><div class="battle-header"><h3>${b.finished?'战场回顾':'临阵指挥'}</h3><span class="round">第 ${b.round} / 30 回合</span></div>${combatRoundSummaryHTML(b)}<div class="distance-field"><div class="battle-labels"><span>我军 · 坐标 0</span><span>敌军 · 坐标 ${b.length}</span></div><div class="distance-axis">${Array.from({length:8},(_,i)=>`<span>${Math.round(b.length*i/7)}</span>`).join('')}</div><div class="distance-lanes">${typeof battleFireZoneHTML==='function'?battleFireZoneHTML(b):''}${unitIds.map(id=>{
    const u=Game.units[id],own=b.player.find(r=>r.id===id),enemy=b.enemy.find(r=>r.id===id);
    const marker=(r,side)=>{
      if(!r)return '';
      const ownEvents=feedback.filter(e=>e.side===side&&e.unit===id),move=ownEvents.find(e=>e.type==='move'),hit=ownEvents.some(e=>e.type==='recoil'),fired=ownEvents.some(e=>['strike','gate'].includes(e.type)),ghost=r.hp<=0;
      if(ghost&&!hit)return '';
      return `<${side==='player'?'button':'div'} class="formation distance-formation ${side==='enemy'?'enemy':''} ${side==='player'&&id===selectedFormation?'highlighted':''} ${move?'combat-moving':''} ${ghost?'combat-fallen':''}" style="left:${r.pos/b.length*100}%;--combat-travel:${move?(move.from-move.to)/b.length*100:0}cqw;--combat-side:${side==='player'?1:-1}" ${ghost?'aria-hidden="true"':''} ${side==='player'?`data-action="${context.practice?'tacticalLessonSelect':'formationSelect'}" data-id="${id}" aria-label="查看${u.name}射程" ${ghost?'disabled':''}`:''}><div class="combat-unit-body ${hit?'combat-impact':''} ${fired?'combat-fired':''}">${troopPortrait(id,'battle-portrait')}<small>${Math.ceil(r.hp/r.stats.hp)}</small><div class="progress"><i style="width:${r.hp/r.maxHp*100}%"></i></div></div></${side==='player'?'button':'div'}>`;
    };
    return `<div class="distance-lane"><span class="lane-name">${u.name}</span>${id===selectedFormation&&selected?.hp>0?`<div class="range-band" style="left:${rangeStart/b.length*100}%;width:${(rangeEnd-rangeStart)/b.length*100}%"></div>`:''}${marker(own,'player')}${marker(enemy,'enemy')}</div>`;
  }).join('')}${combatEffectsHTML(b,feedback,unitIds)}</div><div class="range-caption">${selectedUnit?`绿色区域：${selectedUnit.name}射程 ${selectedUnit.range} · 位置 ${selected.pos}<br>${Number.isFinite(nearest)?`最近敌军距离 ${nearest} · ${nearest<=selectedUnit.range?'可攻击':'尚未进入射程'}`:'敌军已清空'}`:'暂无部队'}</div></div>${!b.finished?`${!context.practice&&!selectedMainReserved&&selected?.hp>0&&Number.isFinite(nearest)&&nearest>selectedUnit.range&&b.orders[selected.id].command!=='advance'?`<div class="notice" role="status">${selectedUnit.name}尚未接敌，当前${orderNames[b.orders[selected.id].command]}指令不会主动靠近。${btn('向前进入射程',context.practice?'tacticalLessonOrder':'unitOrder',selected.id+':advance','small secondary')}</div>`:''}${typeof battleTacticsPanelHTML==='function'?battleTacticsPanelHTML(b,context):''}${battleAllOrdersHTML(b,context)}<div class="combat-controls">${context.practice?'':btn(battleAutoEnabled()?'暂停倒计时':'开启倒计时 · 每 30 秒一回合','battleAuto','','secondary')}${btn('下一回合',context.practice?'tacticalLessonRound':'battleRound')}</div>${context.practice?'<p class="hint">演练没有倒计时，不消耗城池兵将或资源。调整指令后点击下一回合。</p>':`<div class="battle-timing"><strong data-battle-timer>${battleTimerText()}</strong><p class="hint">下好指令后，可点击「下一回合」立即结算；倒计时开启时，结算后重新计时 30 秒。试玩倍率不加速战斗回合。</p></div>`}<div class="unit-orders">${b.player.map(r=>{
    const u=Game.units[r.id],order=b.orders[r.id],dead=r.hp<=0;
    return `<article class="unit-order ${dead?'disabled-unit':''} ${selectedFormation===r.id?'selected-order':''}"><div class="unit-order-head"><button data-action="${context.practice?'tacticalLessonSelect':'formationSelect'}" data-id="${r.id}" class="unit-order-name">${troopPortrait(r.id,'unit-portrait-small')}${u.name}<span>${Math.ceil(r.hp/r.stats.hp)} 人</span></button><span class="label">${dead?'已失去战斗力':orderNames[order.command]}</span></div><p class="unit-data">位置 ${r.pos} · 速度 ${r.stats.speed}/回合 · 射程 ${r.stats.range}</p>${typeof battleUnitBudgetHTML==='function'?battleUnitBudgetHTML(b,r.id):''}<div class="unit-order-buttons">${[['advance','向前 →'],['hold','坚守 ▣'],['fallback','← 后退']].map(([command,label])=>btn(label,context.practice?'tacticalLessonOrder':'unitOrder',`${r.id}:${command}`,`small secondary ${order.command===command?'active-order':''}`,dead)).join('')}</div><label class="unit-target-label">攻击目标<select ${context.practice?'data-lesson-target':'data-unit-target'}="${r.id}" aria-label="${u.name}攻击目标" ${dead?'disabled':''}><option value="" ${!order.target?'selected':''}>自动选择射程内敌军</option>${b.gate?`<option value="gate" ${order.target==='gate'?'selected':''} ${!b.gate.hp?'disabled':''}>${n.fortification.name}${!b.gate.hp?' · 已破坏':''}</option>`:''}${b.enemy.map(enemy=>`<option value="${enemy.id}" ${order.target===enemy.id?'selected':''} ${enemy.hp<=0?'disabled':''}>敌军${Game.units[enemy.id].name}${enemy.hp<=0?' · 已击溃':''}</option>`).join('')}</select></label></article>`;
  }).join('')}</div><p class="hint combat-note">向前按速度推进，坚守保持位置，后退向己方边界移动。移动后若有敌军进入射程，仍可攻击；指定目标不在射程内则自动改选；受诱追的队本轮只攻击诱兵，够不着时不改打其他队。后退到边界不会离开战场。</p>`:'<div style="height:15px"></div>'}<div class="battle-log" id="battle-log" aria-live="polite">${b.log.map(line=>`<p>${esc(line)}</p>`).join('')}</div><p class="hint combat-reference">兵种基础数据参考 <a href="https://web.4399.com/rxsg/yxzy/gsjj/a1204092.html" target="_blank" rel="noopener">4399 手册</a> · 距离、先后手和反击参考 <a href="https://web.4399.com/rxsg/yxzl_06_993823.html" target="_blank" rel="noopener">战争系统</a>。伤害公式与克制系数为本原型调整。</p></section>`;
}
document.addEventListener('click',event=>{
  const el=event.target.closest('[data-action]');if(!el||el.disabled)return;
  if(el.dataset.action==='formationSelect'){selectedFormation=el.dataset.id;render();}
  if(el.dataset.action==='unitOrder'){const [id,command]=el.dataset.id.split(':');selectedFormation=id;actResult(Game.setBattleOrder(id,command));}
  if(el.dataset.action==='battleAllOrders')actResult(Game.setBattleOrders(el.dataset.id),'全军指令已更新，可继续逐队调整');
  if(el.dataset.action==='tacticsModal')tacticsModal();
  if(el.dataset.action==='tacticOrder'){const [id,command]=el.dataset.id.split(':');const scroll=modal.scrollTop,error=Game.setTactic(id,command);if(error)toast(error);else{tacticsModal();modal.scrollTop=scroll;}}
});
document.addEventListener('change',event=>{
  const id=event.target.dataset.unitTarget;if(id){selectedFormation=id;actResult(Game.setBattleOrder(id,undefined,event.target.value));}
  const tactic=event.target.dataset.tacticTarget;if(tactic){const error=Game.setTactic(tactic,undefined,event.target.value);if(error)toast(error);}
});
