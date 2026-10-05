'use strict';
function receiptTableHTML(receipt,title){
  const ids=Object.keys(receipt.loaded).filter(id=>receipt.loaded[id]>0);if(!ids.length)return `<p class="hint">${title}：无资源。</p>`;
  const over=receipt.overCapacity!==undefined;
  return `<table class="storage-preview-table"><caption>${title}</caption><thead><tr><th scope="col">资源</th><th scope="col">装载</th><th scope="col">实际入库</th><th scope="col">${over?'爆仓入库':'仓储损失'}</th></tr></thead><tbody>${ids.map(id=>`<tr><th scope="row">${Game.resources[id].name}</th><td>${resourceAmount(receipt.loaded[id])}</td><td class="storage-received">${resourceAmount(receipt.received[id])}</td><td class="${over?'storage-received':receipt.overflow[id]>0?'storage-loss':''}">${resourceAmount(over?receipt.overCapacity[id]:receipt.overflow[id])}</td></tr>`).join('')}</tbody></table>`;
}
function battleResourceHTML(r){
  if(!r.won)return '';
  if(!r.resourceReceipt)return `${lootHtml(r.loot)}<p class="hint">旧战报未记录分资源入库明细${r.cargoLoaded!==undefined?'；实际入库合计 '+resourceAmount(Math.max(0,r.cargoLoaded-r.overflow)):''}。</p>${r.overflow?`<p class="storage-loss">仓储不足，${resourceAmount(r.overflow)} 资源未能入库。${btn('前往仓储','manualStorage','','small secondary')}</p>`:''}`;
  return `<section class="storage-preview" aria-label="战利品实际入库"><h3>战利品实际入库</h3>${receiptTableHTML(r.resourceReceipt.base,'基础战利品')}${receiptTableHTML(r.resourceReceipt.bonus,'随机资源掉落')}${r.overCapacity?`<p class="notice">爆仓入库 ${resourceAmount(r.overCapacity)}，已计入实际入库，资源已到账。</p>`:''}${r.overflow?`<p class="storage-loss">${r.overCapacity===undefined?'仓储损失合计':'资源数值达到上限，未入库'} ${resourceAmount(r.overflow)}。${btn('前往仓储','manualStorage','','small secondary')}</p>`:'<p class="hint">已装载资源全部入库。</p>'}</section>`;
}
let npcDefenseDraft=null,npcChallengeDraft={profile:'classic',level:1,key:'',source:''};
function npcDefenseNoticeHTML(){
  const d=S().cityDefense,b=d.battle,w=d.incoming;
  if(!b&&!w)return '';
  return `<div class="notice invasion-notice defense-event-notice" role="status"><div><strong>${b?b.drill?'守城演练进行中':esc(activeCityMeta().name)+'正在迎战黄巾':w.arriveAt<=Date.now()?'黄巾已抵达，等待迎战':'黄巾来袭预警'}</strong><p>${b?'第 '+b.round+' / '+NPCDefenseData.maxRounds+' 回合':`第 ${w.wave} 波 · ${w.level} 级 · ${NPCDefense.beaconIntel(S(),w).precision==='exact'?num(Game.totalArmy(w.army))+' 人':'兵力待侦知'}${w.arriveAt>Date.now()?' · '+clock(w.arriveAt):' · 手动选择守将与兵力'}`}</p></div>${btn(b?'继续守城':'准备守城','npcDefense','','small')}</div>`;
}
function npcDefenseContributionHTML(c){
  if(!c)return '<p class="hint">旧记录未保存工事贡献，不补造历史数值。</p>';
  const forts=Object.entries(c.forts).map(([id,r])=>`<li>${Game.manual.defenses[id].name}：削减敌军生命 ${resourceAmount(r.damage)} · 承受耐久损伤 ${resourceAmount(r.absorbed)}</li>`).join('');
  return `<section class="defense-contribution"><h4>实际守城贡献</h4><p>城墙增加耐久 ${resourceAmount(c.wallBonus)} · 城门受损 ${resourceAmount(c.gateDamage)}<br>拒马累计阻滞 ${resourceAmount(c.abatisDelayed)} 距离 · 守军削减敌军生命 ${resourceAmount(c.armyDamage)}</p>${forts?`<ul>${forts}</ul>`:''}<p class="hint">生命损伤不是击杀人数；拒马阻滞不计作伤害。</p></section>`;
}
function npcDefenseReportHTML(r){
  const losses=Object.entries(r.defenseLost).filter(([,n])=>n>0),repairs=Object.entries(r.repaired).filter(([,n])=>n>0),overflow=r.resourceReceipt?Object.values(r.resourceReceipt.overflow).reduce((s,n)=>s+n,0):0;
  const outcome=r.won?(r.victoryReason==='held'?'守住城门':'守城胜利'):'城门失守';
  return `<article class="report defense-event-report"><div class="report-top"><h3>${r.drill?'守城演练':esc(r.cityName||activeCityMeta().name)+' · 守城第 '+r.wave+' 波'}</h3><span class="result ${r.won?'':'loss'}">${outcome} · ${r.round} 回合</span></div><p class="meta">${new Date(r.id).toLocaleString('zh-CN')} · ${r.level} 级黄巾 · 守将 ${esc(Game.general(r.general).name)}</p>${r.victoryReason==='held'?`<p class="notice">坚持到回合上限且城门未失守；敌军仍余 ${num(r.enemyRemaining)} 人。本次为守住城门，未宣称歼灭敌军。</p>`:''}${r.drill?'<p class="notice">演练结束，兵力、工事与库存保持原值，未发放奖励。</p>':r.won?`<section class="storage-preview">${receiptTableHTML(r.resourceReceipt,'守城奖励')}${overflow?`<p class="storage-loss">仓储损失 ${resourceAmount(overflow)}。${btn('前往仓储','manualStorage','','small secondary')}</p>`:''}</section>`:`<h4>被掠走资源</h4>${lootHtml(r.robbed)}<p class="hint">黄金和建筑保留，可重新训练和补建工事。</p>`}<p class="hint">${r.drill?'模拟':''}永久损失 ${Game.totalArmy(r.lost)} 人 · 伤兵归队 ${Game.totalArmy(r.wounded)} 人 · 参战部队归队 ${Game.totalArmy(r.back)} 人${r.drill?'':' · 武将经验 +'+r.xp}</p><p class="hint">工事消耗／损毁：${losses.length?losses.map(([id,n])=>Game.manual.defenses[id].name+' ×'+n).join('、'):'无'}${repairs.length?'；维修恢复：'+repairs.map(([id,n])=>Game.manual.defenses[id].name+' ×'+n).join('、'):''}</p>${npcDefenseContributionHTML(r.contribution)}</article>`;
}
function npcDefenseGenerals(){const s=S();return s.generals.filter(id=>cityHeroHome(id)===activeCityMeta().id&&!Game.generalBusy(id)&&(id===s.governor||!HeritageSystem.roleOf(s,id)));}
function npcDefensePrepareDraft(){
  const s=S(),available=npcDefenseGenerals();
  if(!npcDefenseDraft||npcDefenseDraft.city!==activeCityMeta().id)npcDefenseDraft={city:activeCityMeta().id,general:s.governor,army:{...s.army}};
  if(!available.includes(npcDefenseDraft.general))npcDefenseDraft.general=available.includes(s.governor)?s.governor:available[0]||'';
  for(const id of Object.keys(Game.units))npcDefenseDraft.army[id]=Math.max(0,Math.min(s.army[id],Math.floor(npcDefenseDraft.army[id]||0)));
  return npcDefenseDraft;
}
function npcDefenseSelectionHTML(){
  const s=S(),draft=npcDefensePrepareDraft(),available=npcDefenseGenerals(),rows=Object.entries(Game.units).filter(([id])=>s.army[id]>0);
  return `<section class="panel defense-preparation"><div class="section-title"><h3>选择守将与参战驻军</h3><span class="label">未选部队留城</span></div><label class="label" for="defense-general">守将 · 空闲将领或城守</label><select id="defense-general">${available.map(id=>{const g=Game.general(id);return `<option value="${id}" ${id===draft.general?'selected':''}>${esc(g.name)} · Lv.${g.level}${id===s.governor?' · 城守亲自守城':''} · 勇武 ${g.atk} / 防御 ${g.def}</option>`;}).join('')}</select>${!available.length?'<p class="notice">暂无可用守将。请先召回外驻将领或调整城内任职。</p>':''}<div class="defense-selection-tools">${btn('全选驻城','npcDefenseAll','','small secondary')}${btn('清空选兵','npcDefenseNone','','small secondary')}</div><table class="defense-force-table"><thead><tr><th scope="col">兵种</th><th scope="col">驻城</th><th scope="col">参战</th></tr></thead><tbody>${rows.map(([id,u])=>`<tr><th scope="row">${u.name}</th><td>${num(s.army[id])}</td><td><input type="number" data-defense-unit="${id}" min="0" max="${s.army[id]}" step="1" value="${draft.army[id]}" aria-label="${u.name}守城人数"></td></tr>`).join('')||'<tr><td colspan="3">暂无驻城士兵；仍可由城门与工事防守，留意失守风险。</td></tr>'}</tbody></table><p id="defense-selection-summary" class="hint"></p><p class="hint">正式迎战只扣除所选驻城部队，完工工事全部参战。城守可亲自守城；任职主将、军师及在外将领不能选择。演练采用同一选兵方案，不扣兵或物资。</p></section>`;
}
function npcDefenseReadSelection(){
  const draft=npcDefensePrepareDraft(),general=document.getElementById('defense-general');if(general)draft.general=general.value;
  modalBody.querySelectorAll('[data-defense-unit]').forEach(el=>{const id=el.dataset.defenseUnit,value=Math.max(0,Math.min(S().army[id],Math.floor(Number(el.value)||0)));el.value=value;draft.army[id]=value;});
  return {general:draft.general,army:{...draft.army}};
}
function npcDefenseSelectionSummary(){
  const el=document.getElementById('defense-selection-summary');if(!el)return;
  const q=npcDefenseReadSelection(),selected=Game.totalArmy(q.army),city=Game.totalArmy(S().army);
  el.textContent=`已选 ${num(selected)} 人 · 留城 ${num(city-selected)} 人 · 参战兵员占用 ${num(Game.armyPeople(q.army))} 人口${selected?'':'；仅城门与工事防守'}`;
}
function npcDefenseEnemyHTML(w){
 const intel=NPCDefense.beaconIntel(S(),w),labels={warning:'仅预警',types:'兵种情报',bands:'数量区间',exact:'精确兵力'};
 return `<p class="hint">烽火台 ${S().buildings.beacon||0} 级 · ${labels[intel.precision]}：1 级辨兵种、4 级辨区间、7 级辨人数。</p><div class="defense-roster">${intel.types.map(id=>`<span>${Game.units[id].name}${intel.precision==='exact'?` <strong>${num(intel.army[id])}</strong>`:intel.precision==='bands'?` <strong>${num(intel.army[id].min)}–${num(intel.army[id].max)}</strong>`:' <strong>数量未知</strong>'}</span>`).join('')||'<span>敌军兵种与数量未知，请准备守军。</span>'}</div>`;
}
function npcDefenseChallengeAsk(){
 npcChallengeDraft={profile:'classic',level:Math.max(1,Math.min(S().buildings.hall,NPCDefenseData.classicMaxLevel)),key:'',source:activeCityMeta().id};
 showModal('选择来袭阵容与难度',`<p class="notice">确认后开始 5 分钟预警，等待敌军抵达后手动选择守将与驻军。不同阵容用于检验配兵和工事，费用在确认发起时扣除。</p><label class="label" for="npc-challenge-profile">敌军阵容</label><select id="npc-challenge-profile">${NPCDefense.profiles.map(p=>`<option value="${p.id}">${esc(p.name)}</option>`).join('')}</select><label class="label" for="npc-challenge-level">难度等级</label><input id="npc-challenge-level" type="number" inputmode="numeric" min="1" max="${NPCDefenseData.classicMaxLevel}" value="${npcChallengeDraft.level}"><div id="npc-challenge-quote" aria-live="polite"></div>`,btn('继续准备','npcDefense','','secondary')+btn('确认开始预警','npcChallenge'));
 updateNPCChallengeQuote();
}
function updateNPCChallengeQuote(){
 const select=document.getElementById('npc-challenge-profile'),input=document.getElementById('npc-challenge-level'),target=document.getElementById('npc-challenge-quote');if(!select||!input||!target)return;
 const max=select.value==='classic'?NPCDefenseData.classicMaxLevel:Math.max(1,Math.min(NPCDefenseData.maxLevel,S().buildings.hall)),level=Math.max(1,Math.min(max,Math.floor(Number(input.value)||1)));input.max=max;input.value=level;
 const q=NPCDefense.challengeQuote(S(),select.value,level);npcChallengeDraft={...npcChallengeDraft,profile:select.value,level,key:q.key};
 target.innerHTML=`<p class="sub">${esc(q.description)} · ${q.level} 级</p>${costs(q.cost)}<h4>来袭情报</h4>${npcDefenseEnemyHTML({profile:q.profile,level:q.level,army:q.army,arriveAt:Date.now()+q.warningSeconds*1000})}<h4>胜利奖励</h4>${lootHtml(q.reward)}<p class="hint">武将经验 +${q.xp} · 预警 ${duration(q.warningSeconds)}。战败依守城规则损失士兵、工事及部分库存。</p>${q.reason?`<p class="notice">${esc(q.reason)}</p>`:''}`;
 const button=modalBody.querySelector('[data-action="npcChallenge"]');if(button)button.disabled=!!q.reason;
}
function npcDefenseModal(){
  const s=S(),d=s.cityDefense,b=d.battle,w=d.incoming,ready=w&&w.arriveAt<=Date.now(),unlocked=NPCDefense.unlocked(s),latest=d.drillResult||d.reports[0];
  let content='<p class="sub">黄巾来袭使用试玩守城规则。预警情报随烽火台等级提高，敌军抵达后手动迎战；在外部队不参与。</p>';
  if(b){
    const rows=(army,enemy=false)=>army.filter(r=>r.hp>0).map(r=>`<div class="defense-unit"><span>${Game.units[r.id].name}</span><strong>${Math.ceil(r.hp/r.stats.hp)} / ${r.count}</strong><small>${enemy?'敌军':'参战驻军'} · 生命 ${resourceAmount(r.hp)}</small></div>`).join('')||'<p class="hint">已无可战部队。</p>';
    content+=`<section class="defense-event-status"><strong>${b.drill?'演练 · 不消耗实际兵力与物资':'正式守城 · 结算伤亡、工事与资源'}</strong><p>守将 ${esc(Game.general(b.general).name)} · 第 ${b.round} / ${NPCDefenseData.maxRounds} 回合 · 距城门 ${num(b.distance)}<br>城门耐久 ${resourceAmount(b.gateHp)} / ${resourceAmount(b.gateMax)}</p></section><div class="defense-columns"><section><h3>参战驻军</h3>${rows(b.player)}</section><section><h3>来袭黄巾</h3>${rows(b.enemy,true)}</section></div><section class="panel"><h3>防御工事</h3>${b.forts.map(f=>`<p>${Game.manual.defenses[f.id].name} · ${Game.manual.defenses[f.id].oneUse?'剩余 '+(f.count-f.used)+' / '+f.count:'耐久 '+resourceAmount(f.hp)} · 射程 ${Game.manual.defenses[f.id].range}</p>`).join('')||'<p class="hint">未建设工事，依靠守军和城门迎敌。</p>'}</section>${npcDefenseContributionHTML(b.contribution)}<details open><summary>守城战况</summary><div class="defense-log">${b.log.map(t=>`<p>${esc(t)}</p>`).join('')}</div></details>`;
    showModal(esc(activeCityMeta().name)+(b.drill?' · 守城演练':' · 黄巾守城'),content,btn('稍后继续','close','','secondary')+btn('下一回合','npcRound')+btn(OnlineClient.shared()?'推进 1 回合（服务器）':'推进 5 回合','npcFiveRounds','','secondary')+(b.drill?btn('结束演练','npcEndDrill','','secondary'):''));
  }else{
    const preview=w||NPCDefense.makeWave(s,Date.now(),true),periodic=d.autoEnabled===true,reward=preview.rewardSnapshot||NPCDefense.challengeQuote(s,preview.profile||'classic',preview.level).reward;
    content+=w?`<section class="defense-event-status"><strong>第 ${w.wave} 波 · ${w.level} 级黄巾 · ${NPCDefense.beaconIntel(S(),w).precision==='exact'?num(Game.totalArmy(w.army))+' 人':'兵力待侦知'} · ${ready?'已抵达':'行军中'}</strong><p>${ready?'敌军在城外列阵，确认选兵后迎战。':`抵达 ${new Date(w.arriveAt).toLocaleString('zh-CN')}<br>倒计时 ${clock(w.arriveAt)}`}</p>${npcDefenseEnemyHTML(w)}</section>`:`<section class="defense-event-status"><strong>${unlocked?'主动发起，留出 5 分钟准备':'新手保护'}</strong><p>${unlocked?'现在即可发起黄巾挑战，不必等首次周期。':'官府达到 2 级并赢得一次出征后可发起；目前可先演练。'}<br>当前可挑战 ${preview.level} 级 · ${NPCDefense.beaconIntel(S(),preview).precision==='exact'?num(Game.totalArmy(preview.army))+' 人':'兵力待侦知'}</p>${npcDefenseEnemyHTML(preview)}${btn('发起黄巾挑战 · 5 分钟后抵达','npcChallengeAsk','','block',!unlocked)}</section>`;
    content+=`<section class="defense-event-period"><div><strong>周期来袭：${periodic?'已开启':'已关闭'}</strong><p class="hint">${periodic?(w?'本波处理后继续周期。':d.nextAt?'下次预警 '+clock(d.nextAt)+'，再留 5 分钟准备。':'完成本次守城后每 30 分钟预警。'):'仅主动发起才会有新来袭；停用不会撤回已经出现的敌军。'}</p></div>${btn(periodic?'停止后续周期':'开启 30 分钟周期','npcAuto','','small secondary',!periodic&&!unlocked)}</section><h4>本波胜利奖励</h4>${lootHtml(reward)}<p class="hint">奖励按可用仓储入库；失败最多被掠走四资源各 10%，仍受敌军负重限制，黄金和建筑保留。城门守住 30 回合也算胜利，不代表敌军已清空。</p>${npcDefenseSelectionHTML()}<p class="hint">已有完工工事 ${Object.values(s.defenses).reduce((a,n)=>a+n,0)} 个 · 守城胜利 ${d.wins} 次</p><div class="settings-row">${btn('建设防御工事','manualDefense','','secondary')}${btn('训练驻城部队','manualArmy','','secondary')}</div><details><summary>守城规则与科技</summary><ul class="help-list"><li>城墙增加城门耐久；拒马实际减缓进军，箭塔在射程内攻击，陷阱／滚木／擂石使用后消耗。</li><li>城防技术每级增加 10% 耐久，维修技术每级恢复 5% 被摧毁的耐久工事。</li><li>敌军全灭或守住 30 回合获胜；城门耐久归零失守。日志区分攻击量、生命损伤和阻滞距离。</li><li>离线保留预警或战场，不自动结算守城损失；同时最多一波，不积累多波。</li></ul></details>${latest?npcDefenseReportHTML(latest):''}`;
    showModal(esc(activeCityMeta().name)+' · 黄巾来袭',content,btn('关闭','close','','secondary')+(w?btn(ready?'确认所选守将与兵力迎战':'敌军尚未抵达','npcStart','','',!ready||!npcDefenseGenerals().length||!!(s.battle&&!s.battle.finished)):'')+btn('按所选兵力演练','npcDrill','','secondary',!npcDefenseGenerals().length||!!(s.battle&&!s.battle.finished)));
    npcDefenseSelectionSummary();
  }
  manualModalContext=npcDefenseModal;
}
document.addEventListener('click',event=>{
  const el=event.target.closest('[data-action]');if(!el||el.disabled)return;const a=el.dataset.action;
  if(a==='npcDefense')npcDefenseModal();
  if(a==='npcChallengeAsk')npcDefenseChallengeAsk();
  if(a==='npcChallenge'){if(npcChallengeDraft.source!==activeCityMeta().id){toast('挑战城市已改变，请重新选择');return;}if(actResult(Game.requestCityDefense(npcChallengeDraft.profile,npcChallengeDraft.level,npcChallengeDraft.key),'黄巾开始行军：5 分钟后抵达，请准备守城'))npcDefenseModal();}
  if(a==='npcAuto'){const enabled=!S().cityDefense.autoEnabled;if(actResult(Game.setAutoCityDefense(enabled),enabled?'周期来袭已开启':'后续周期已停止；已有来袭仍需处理'))npcDefenseModal();}
  if(a==='npcDefenseAll'||a==='npcDefenseNone'){const draft=npcDefensePrepareDraft();for(const id of Object.keys(Game.units))draft.army[id]=a==='npcDefenseAll'?S().army[id]:0;modalBody.querySelectorAll('[data-defense-unit]').forEach(input=>input.value=draft.army[input.dataset.defenseUnit]);npcDefenseSelectionSummary();}
  if(a==='npcStart'||a==='npcDrill'){const q=npcDefenseReadSelection();if(actResult(Game.startCityDefense(a==='npcDrill',q.general,q.army)))npcDefenseModal();}
  if(a==='npcRound'||a==='npcFiveRounds'){let error=null;for(let i=0;i<(a==='npcRound'||OnlineClient.shared()?1:5)&&S().cityDefense.battle;i++){const result=Game.cityDefenseRound();if(typeof result==='string'){error=result;break;}if(!Game.saveSessionInfo().writable)break;}if(actResult(error))npcDefenseModal();}
  if(a==='npcEndDrill'){if(actResult(Game.endDefenseDrill(),'演练已结束'))npcDefenseModal();}
});
document.addEventListener('input',event=>{if(event.target.dataset.defenseUnit)npcDefenseSelectionSummary();if(event.target.id==='npc-challenge-level')updateNPCChallengeQuote();});
document.addEventListener('change',event=>{if(event.target.id==='defense-general')npcDefenseSelectionSummary();if(event.target.id==='npc-challenge-profile')updateNPCChallengeQuote();});
