'use strict';
const battleTacticLabels={watch:'察伏',fire:'火攻封路',huangzhong:'蓄弦先射',weiyan:'佯退诱追',zhaoyun:'接应撤军',machao:'冲阵退敌',xushu:'料敌先机'};
const tacticalLessonTitles={spear_cavalry:'长枪抗骑 · 保护弓阵',siege_guard:'护卫器械 · 河洛东门',opening_battle:'黄巾遭遇战 · 开场示范',ready_shot:'预备射击与探阵',bait_chase:'诱追与保持阵线',fire_reveal:'火区与提前揭露',rescue_retreat:'接应撤军与保持距离',charge_hold:'冲阵与固守反制'};
let battleTacticDraft=null;
function battleTacticsSafeView(b){return typeof Game.battleTacticsView==='function'?Game.battleTacticsView(b):null;}
function battleIdentityOf(id){return typeof Game.heroIdentity==='function'?Game.heroIdentity(id):null;}
function battleIdentityHTML(id,compact=false){
  const identity=battleIdentityOf(id);if(!identity?.id)return '';
  if(compact)return `<p class="hero-battle-identity-tag"><strong>${esc(identity.name)}</strong> · ${esc(identity.description)}</p>`;
  return `<section class="hero-battle-identity"><div class="section-title"><h3>${esc(identity.name)} · ${esc(battleTacticLabels[identity.action]||'名将战法')}</h3><span class="badge">每战一次</span></div><p>${esc(identity.description)}</p><dl><div><dt>发动条件</dt><dd>${esc(identity.condition)}</dd></div><div><dt>可被破解</dt><dd>${esc(identity.counter)}</dd></div></dl><p class="hint">仅普通单机逐回合战斗与战术演练启用；守城、共享自动战斗暂不支持。</p>${btn('查看战术演练','tacticalLessonCatalog','','small secondary')}</section>`;
}
function battlePlanLabel(plan){return `${plan.side==='enemy'?'敌军':'我军'}${Game.units[plan.unit]?.name||plan.unit||''} · ${plan.name||battleTacticLabels[plan.type]||plan.type}`;}
function battlePlanDetail(plan){
  if(plan.hidden)return '对象尚未揭露';
  if(Number.isFinite(plan.left)&&Number.isFinite(plan.right))return `火区 ${plan.left}–${plan.right}`;
  if(plan.target)return `${plan.type==='zhaoyun'?'己方被保护队':plan.type==='machao'?'冲阵敌队':'目标'}：${Game.units[plan.target]?.name||plan.target}`;
  return typeof plan.details==='string'?plan.details:'已公开发动条件';
}
function battleTacticsPanelHTML(b,context={}){
  const v=battleTacticsSafeView(b);if(!v)return '';
  const shared=!context.practice&&typeof OnlineClient!=='undefined'&&OnlineClient.shared();
  if(shared)return '<p class="hint battle-tactics-unavailable">共享自动战斗暂未启用名将战法与计谋。</p>';
  if(!v.enabled)return `<p class="hint battle-tactics-unavailable">${b.rules===2?'旧版战斗继续按原规则结算；计谋在新出征中启用。':'此战斗模式暂未启用名将战法与计谋。'}</p>`;
  const actions=['watch','fire',...(v.identity?.action?[v.identity.action]:[])],plans=v.preparations||[];
  const compact=typeof window!=='undefined'&&window.matchMedia?.('(max-width:760px)').matches;
  return `<section class="battle-tactics-panel" aria-label="战术筹策"><div class="battle-tactics-heading"><strong>筹策 ${num(v.cp??v.points?.player??0)} / 3</strong><span>${v.submittedThisRound?'本轮已提交':'本轮可提交 1 次'}${v.identityUsed?' · 名将战法已用':''}</span></div>${!b.finished?`<details class="battle-tactics-tools" data-ui-disclosure="battle-tactics-tools" ${compact?'':'open'}><summary>计谋 ›</summary><div class="battle-tactics-actions">${actions.map(type=>btn(esc(battleTacticLabels[type]||type),'battleTacticOpen',type,'small secondary',!!v.submittedThisRound||(type===v.identity?.action&&v.identityUsed))).join('')}</div></details>`:''}${plans.length?`<ul class="battle-preparations">${plans.map(p=>`<li><div><strong>${esc(battlePlanLabel(p))}</strong><span>${p.status==='active'?'本轮生效':`第 ${p.readyRound} 回合响应`} · ${esc(battlePlanDetail(p))}</span></div>${p.side==='player'&&p.cancelable&&!b.finished?btn('取消准备','battleTacticCancelAsk',esc(p.id),'small secondary'):''}</li>`).join('')}</ul>`:''}<details class="battle-tactics-rules"><summary>费用与攻击机会</summary><p class="hint">每战 3 点，不恢复；每回合最多提交 1 次。火攻耗 2 点，其他战法耗 1 点。黄忠、魏延、赵云、马超与火攻先准备一回合；察伏与徐庶揭露立即响应。合法宣布后取消、没触发或被识破均不退款；预留主攻击仍会失去，正常反击保留。赵云接应队需要继续坚守且距离不超过300，被保护队最多1.5倍后退并放弃主攻击；马超实际冲阵耗本轮主攻击，最多推退200，目标固守完全反制。</p></details></section>`;
}
function battleFireZoneHTML(b){
  const v=battleTacticsSafeView(b);if(!v?.enabled)return '';
  const recap=p=>p.readyRound===b.round&&p.status==='expired'&&p.reason==='火区一轮后熄灭';
  return (v.plans||v.preparations||[]).filter(p=>p.type==='fire'&&!p.hidden&&Number.isFinite(p.left)&&Number.isFinite(p.right)&&(['prepared','ready','active'].includes(p.status)||recap(p))).map(p=>{const past=recap(p),label=past?'本轮封路·已熄灭':p.status==='active'?'封路':'筹备';return `<div class="battle-fire-zone ${past?'is-recap':p.status==='active'?'is-active':'is-preparing'}" style="left:${p.left/b.length*100}%;width:${(p.right-p.left)/b.length*100}%" aria-label="${label}火区 ${p.left}至${p.right}"><span>${label}</span></div>`;}).join('');
}
function battleUnitBudgetHTML(b,id){
  const v=battleTacticsSafeView(b);if(!v?.enabled)return '';
  const plans=Array.isArray(v.reservedMainAttacks)?v.reservedMainAttacks.filter(r=>r.unit===id).map(r=>({...((v.plans||[]).find(p=>p.id===r.planId)||r),budgetKind:r.kind})):(v.plans||[]).filter(p=>p.side==='player'&&p.unit===id&&['fire','huangzhong','weiyan','zhaoyun','machao'].includes(p.type)&&(p.round===v.round||p.type==='huangzhong'&&p.readyRound===v.round));
  return plans.length?`<p class="battle-unit-budget">${plans.map(p=>`${esc(p.name||battleTacticLabels[p.type])}${p.budgetKind==='rescue'?'被保护队接应后退':p.budgetKind==='charge'?'骑兵冲阵':''}：本轮主攻击已锁定${p.status==='cancelled'||p.status==='invalid'?'，取消后也不会恢复':p.type==='huangzhong'?'，继续坚守才可触发':''}`).join(' · ')}</p>`:'';
}
function battleTacticEventsHTML(b){
  const v=battleTacticsSafeView(b),events=(v?.events||[]).filter(e=>e.round===b.round);
  const lines=events.map(e=>typeof e==='string'?e:e.text||e.message||e.description).filter(Boolean);
  return lines.length?`<ul class="battle-tactic-events" aria-label="本回合计谋经过">${lines.map(line=>`<li>${esc(line)}</li>`).join('')}</ul>`:'';
}
function battleTacticCurrentContext(){const lesson=typeof Game.lessonInfo==='function'?Game.lessonInfo():null;return lesson?.battle&&modal.open&&modalBody.querySelector('[data-tactical-lesson]')?{battle:lesson.battle,practice:true}:{battle:S().battle,practice:false};}
function pauseBattleForTactics(c){if(!c.practice&&c.battle?.auto&&Game.saveSessionInfo?.().writable===true){c.battle.auto=false;Game.save();render();}}
function battleTacticModal(type){
  const c=battleTacticCurrentContext();if(!c.battle||c.battle.finished){toast('当前没有可以施计的战斗');return;}
  const v=battleTacticsSafeView(c.battle);if(!v?.enabled||(!c.practice&&typeof OnlineClient!=='undefined'&&OnlineClient.shared())){toast('此模式暂不支持计谋');return;}
  pauseBattleForTactics(c);
  const q=Game.battleTacticQuote(type,{},c.battle),o=q?.options||{},actors=o.actors||[],targets=o.targets||[],plans=o.preparations||[],bounds=o.fireBounds||{min:1,max:Math.max(1,c.battle.length-101),length:100};
  const args={};if(['fire','huangzhong','weiyan','zhaoyun','machao'].includes(type)&&actors.length)args.unit=actors[0].id;if(['weiyan','machao','zhaoyun'].includes(type)&&targets.length)args.target=(type==='zhaoyun'?targets.find(t=>t.id!==args.unit):targets[0])?.id||'';if(['watch','xushu'].includes(type)&&plans.length)args.planId=plans[0].id;if(type==='fire')args.left=Math.max(bounds.min,Math.min(bounds.max,Math.floor((c.battle.length-100)/2)));
  battleTacticDraft={...c,type,args,key:null};
  const options=(rows,value)=>rows.map(r=>`<option value="${esc(r.id)}" ${r.id===value?'selected':''}>${esc(r.name||r.id)}</option>`).join('');
  const title=battleTacticLabels[type]||type;
  showModal('筹策 · '+esc(title),`<p class="sub">第 ${v.round} 回合 · 剩余 ${num(v.cp??v.points?.player??0)} 筹策</p><div class="battle-tactic-form">${['fire','huangzhong','weiyan','zhaoyun','machao'].includes(type)?`<label>施计兵队<select id="battle-tactic-unit" ${actors.length?'':'disabled'}>${actors.length?options(actors,args.unit):'<option value="">暂无可用兵队</option>'}</select></label>`:''}${['weiyan','machao','zhaoyun'].includes(type)?`<label>${type==='zhaoyun'?'己方被保护队':type==='machao'?'冲阵敌近战队':'诱追对象'}<select id="battle-tactic-target" ${targets.length?'':'disabled'}>${targets.length?options(targets.filter(t=>type!=='zhaoyun'||t.id!==args.unit),args.target):'<option value="">暂无适用目标</option>'}</select></label>`:''}${['watch','xushu'].includes(type)?`<label>${type==='watch'?'要识破的射击准备':'要揭露的已提交计谋'}<select id="battle-tactic-plan" ${plans.length?'':'disabled'}>${plans.length?plans.map(p=>`<option value="${esc(p.id)}">${esc(battlePlanLabel(p))}</option>`).join(''):'<option value="">暂无适用的敌方准备</option>'}</select></label>`:''}${type==='fire'?`<label for="battle-tactic-left">火区左端 · 长度 ${bounds.length}<span class="battle-fire-input"><input id="battle-tactic-range" type="range" min="${bounds.min}" max="${bounds.max}" step="1" value="${args.left}" aria-label="火区左端"><input id="battle-tactic-left" type="number" inputmode="numeric" min="${bounds.min}" max="${bounds.max}" step="1" value="${args.left}" aria-label="火区左端坐标"></span></label><p class="hint">区间包含两端，影响双方；生效时已有部队在区内，整段火攻失效。</p>`:''}</div><div id="battle-tactic-preview" aria-live="polite"></div>`,btn(c.practice?'返回演练':'返回指挥',c.practice?'tacticalLessonResume':'close','','secondary')+btn('确认提交','battleTacticSubmit'));
  manualModalContext=updateBattleTacticPreview;updateBattleTacticPreview();
  if(!c.practice&&!c.battle.auto){const hint=document.createElement('p');hint.className='hint';hint.textContent='战斗倒计时已暂停。提交后可回到指挥页自行开启。';document.getElementById('battle-tactic-preview').after(hint);}
}
function updateBattleTacticPreview(){
  const d=battleTacticDraft,target=document.getElementById('battle-tactic-preview');if(!d||!target)return;
  for(const [id,key] of [['battle-tactic-unit','unit'],['battle-tactic-target','target'],['battle-tactic-plan','planId']]){const field=document.getElementById(id);if(field)d.args[key]=field.value;}
  const left=document.getElementById('battle-tactic-left');if(left){const value=Math.floor(Number(left.value));d.args.left=Number.isFinite(value)?Math.max(Number(left.min),Math.min(Number(left.max),value)):Number(left.min);left.value=d.args.left;const range=document.getElementById('battle-tactic-range');if(range)range.value=d.args.left;}
  const current=d.practice?Game.lessonInfo()?.battle:S().battle,q=current===d.battle?Game.battleTacticQuote(d.type,d.args,d.battle):{ok:false,reason:'战场已改变，请重新选择'};d.key=q?.key;
  const consequence=Array.isArray(q?.consequences)?q.consequences.join('；'):q?.consequences||'';
  target.innerHTML=q?`<div class="battle-tactic-quote"><strong>${esc(battleTacticLabels[d.type])} · 消耗 ${num(q.cost||0)} 筹策</strong>${d.type==='fire'?`<p>火区 ${d.args.left}–${d.args.left+100}</p>`:''}${q.timing?`<p>${esc(q.timing)}</p>`:''}${q.changesOrder&&q.requiredOrder?`<p>确认后兵队改为${esc(orderNames[q.requiredOrder]||q.requiredOrder)}。</p>`:''}${consequence?`<p>${esc(consequence)}</p>`:''}${q.reason?`<p class="notice">${esc(q.reason)}</p>`:''}</div>`:'<p class="notice">暂时无法读取报价。</p>';
  const writable=d.practice||Game.saveSessionInfo?.().writable!==false;
  if(!writable)target.innerHTML+='<p class="hint">本页为只读，可查看条件，无法提交正式战斗计谋。</p>';
  const submit=modalBody.querySelector('[data-action="battleTacticSubmit"]');if(submit)submit.disabled=!q?.ok||!writable;
}
function battleTacticResult(result){const error=typeof result==='string'?result:result?.ok===false?result.reason||'操作未完成':null;if(error){toast(error);return false;}return true;}
function battleTacticCancelModal(id){
  const c=battleTacticCurrentContext(),plan=(battleTacticsSafeView(c.battle)?.preparations||[]).find(p=>p.id===id&&p.side==='player'&&p.cancelable);if(!plan){toast('该准备已不能取消');return;}
  pauseBattleForTactics(c);
  battleTacticDraft={...c,planId:id};
  showModal('取消 · '+esc(plan.name||battleTacticLabels[plan.type]),`<p class="sub">${esc(battlePlanLabel(plan))}</p><p class="notice">已经支付的筹策不会返还；已经锁定的筹备／触发回合主攻击不会恢复。从后续回合恢复正常攻击。</p>`,btn(c.practice?'返回演练':'继续指挥',c.practice?'tacticalLessonResume':'close','','secondary')+btn('确认取消准备','battleTacticCancel','','',!c.practice&&Game.saveSessionInfo?.().writable===false));
}
function battleTacticIsPracticeAction(action){return ['battleTacticSubmit','battleTacticCancel'].includes(action)&&!!battleTacticDraft?.practice&&Game.lessonInfo?.()?.battle===battleTacticDraft.battle;}
function tacticalLessonCatalog(){
  showModal('战术演练',`<p class="sub">固定兵将阵容，不消耗城池部队、主将或资源，也不赠送正式名将。与普通单机战斗共用逐队结算。</p><div class="tactical-lesson-list">${Object.entries(tacticalLessonTitles).map(([id,title],index)=>`<article><div><strong>${index+1}. ${esc(title)}</strong><p class="hint">${{spear_cavalry:'长枪接骑，弓队守后排；观察实际克制。',siege_guard:'护卫器械推进，用真实河洛城门练习破门。',opening_battle:'盾兵掩护，弓队射击；先认识逐回合指令。',ready_shot:'看预兆，比较进入射程与停在射程外。',bait_chase:'比较追击诱兵与保持阵线。',fire_reveal:'先揭露火区，再调整移动时机。',rescue_retreat:'轻骑坚守接应，比较正常后退与有限加速。',charge_hold:'实际推进冲阵，比较敌军前进与固守反制。'}[id]}</p></div>${btn('开始演练','tacticalLessonStart',id,'small')}</article>`).join('')}</div>`,btn('关闭','close','','secondary'));
}
function tacticalLessonModal(){
  const info=Game.lessonInfo();if(!info?.battle){tacticalLessonCatalog();return;}
  const context={...info,practice:true,node:typeof info.node==='object'?info.node:{name:info.title},title:info.title};
  showModal(esc(info.title),`<div class="tactical-lesson-battle" data-tactical-lesson="${esc(info.id)}">${battlePage(info.battle,context)}</div>`,btn('重试本场','tacticalLessonRestart',info.id,'secondary')+btn('返回演练列表','tacticalLessonEnd','','secondary'));
  if(typeof startCombatFeedback==='function')startCombatFeedback();
}
function battleLessonResultHTML(context,b){
  if(!b.finished)return context.objective?`<p class="hint tactical-lesson-goal">本场目标：${esc(typeof context.objective==='string'?context.objective:context.objective.description||'观察计谋与指令的关系')}</p>`:'';
  const result=context.result||b.result||{};
  return `<section class="result-banner ${result.objectiveMet?'':'loss'}"><h3>${result.objectiveMet?'演练目标达成':'试试另一种指令'}</h3><p>${esc(result.summary||'查看回合经过，比较计谋触发条件与兵队指令。')}</p><p class="hint">演练${result.won?'获胜':'结束'} · ${result.round??b.round} 回合 · 城池兵将与资源未消耗</p>${btn('再试一次','tacticalLessonRestart',context.id,'small secondary')}${btn('其他演练','tacticalLessonEnd','','small secondary')}</section>`;
}
function tacticReceiptHTML(result){
  if(!Array.isArray(result?.tacticEvents))return '';
  const events=result.tacticEvents.filter(e=>typeof e==='string').slice(-60),cp=Number.isInteger(result.tacticPoints)?result.tacticPoints:result.tacticPoints?.player,points=Number.isInteger(cp)?` · 我方剩余筹策 ${cp}/3`:'';
  return `<details class="battle-tactic-receipt"><summary>计谋经过${points}</summary>${events.length?`<ol>${events.map(e=>`<li>${esc(e)}</li>`).join('')}</ol>`:'<p class="hint">此战未使用计谋或名将战法。</p>'}</details>`;
}
function refreshTacticalLesson(result){if(battleTacticResult(result))tacticalLessonModal();}
document.addEventListener('click',event=>{
  const el=event.target.closest('[data-action]');if(!el||el.disabled)return;const a=el.dataset.action,id=el.dataset.id;
  if(a==='battleTacticOpen')battleTacticModal(id);
  if(a==='battleTacticSubmit'&&battleTacticDraft){const d=battleTacticDraft;updateBattleTacticPreview();if(modalBody.querySelector('[data-action="battleTacticSubmit"]')?.disabled)return;const result=d.practice?Game.lessonTactic(d.type,d.args,d.key):Game.submitBattleTactic(d.type,d.args,d.key);if(battleTacticResult(result)){if(d.practice)tacticalLessonModal();else{modal.close();render();}}else updateBattleTacticPreview();}
  if(a==='battleTacticCancelAsk')battleTacticCancelModal(id);
  if(a==='battleTacticCancel'&&battleTacticDraft){const d=battleTacticDraft,result=d.practice?Game.lessonCancelTactic(d.planId):Game.cancelBattleTactic(d.planId);if(battleTacticResult(result)){if(d.practice)tacticalLessonModal();else{modal.close();render();}}}
  if(a==='tacticalLessonCatalog')tacticalLessonCatalog();
  if(a==='tacticalLessonStart'||a==='tacticalLessonRestart')refreshTacticalLesson(Game.startTacticalLesson(id));
  if(a==='tacticalLessonResume')tacticalLessonModal();
  if(a==='tacticalLessonEnd'&&battleTacticResult(Game.endTacticalLesson()))tacticalLessonCatalog();
  if(a==='tacticalLessonRound')refreshTacticalLesson(Game.lessonRound());
  if(a==='tacticalLessonOrder'){const [unit,order]=id.split(':');refreshTacticalLesson(Game.lessonOrder(Game.lessonInfo().battle.player.findIndex(r=>r.id===unit),order));}
  if(a==='tacticalLessonAllOrders')refreshTacticalLesson(Game.lessonAllOrders(id));
  if(a==='tacticalLessonSelect'){selectedFormation=id;tacticalLessonModal();}
  if(a==='close'&&modalBody.querySelector('[data-tactical-lesson]'))Game.endTacticalLesson();
});
document.addEventListener('change',event=>{
  if(event.target.id.startsWith('battle-tactic-'))updateBattleTacticPreview();
  if(event.target.dataset.lessonTarget){const unit=event.target.dataset.lessonTarget;refreshTacticalLesson(Game.lessonTarget(Game.lessonInfo().battle.player.findIndex(r=>r.id===unit),event.target.value));}
});
document.addEventListener('input',event=>{if(event.target.id==='battle-tactic-range'){document.getElementById('battle-tactic-left').value=event.target.value;updateBattleTacticPreview();}if(event.target.id==='battle-tactic-left')updateBattleTacticPreview();});
