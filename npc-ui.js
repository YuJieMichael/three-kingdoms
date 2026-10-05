'use strict';
function receiptTableHTML(receipt,title){
  const ids=Object.keys(receipt.loaded).filter(id=>receipt.loaded[id]>0);if(!ids.length)return `<p class="hint">${title}：无资源。</p>`;
  return `<table class="storage-preview-table"><caption>${title}</caption><thead><tr><th scope="col">资源</th><th scope="col">装载</th><th scope="col">实际入库</th><th scope="col">仓储损失</th></tr></thead><tbody>${ids.map(id=>`<tr><th scope="row">${Game.resources[id].name}</th><td>${resourceAmount(receipt.loaded[id])}</td><td class="storage-received">${resourceAmount(receipt.received[id])}</td><td class="${receipt.overflow[id]>0?'storage-loss':''}">${resourceAmount(receipt.overflow[id])}</td></tr>`).join('')}</tbody></table>`;
}
function battleResourceHTML(r){
  if(!r.won)return '';
  if(!r.resourceReceipt)return `${lootHtml(r.loot)}<p class="hint">旧战报未记录分资源入库明细${r.cargoLoaded!==undefined?'；实际入库合计 '+resourceAmount(Math.max(0,r.cargoLoaded-r.overflow)):''}。</p>${r.overflow?`<p class="storage-loss">仓储不足，${resourceAmount(r.overflow)} 资源未能入库。${btn('前往仓储','manualStorage','','small secondary')}</p>`:''}`;
  return `<section class="storage-preview" aria-label="战利品实际入库"><h3>战利品实际入库</h3>${receiptTableHTML(r.resourceReceipt.base,'基础战利品')}${receiptTableHTML(r.resourceReceipt.bonus,'随机资源掉落')}${r.overflow?`<p class="storage-loss">仓储损失合计 ${resourceAmount(r.overflow)}。${btn('前往仓储','manualStorage','','small secondary')}</p>`:'<p class="hint">已装载资源全部入库。</p>'}</section>`;
}
function npcDefenseNoticeHTML(){
  const d=S().cityDefense,b=d.battle,w=d.incoming;
  if(!b&&!w)return '';
  return `<div class="notice invasion-notice" role="status"><div><strong>${b?b.drill?'守城演练进行中':'青溪城正在迎敌':w.arriveAt<=Date.now()?'山匪已抵达，等待迎战':'山匪来袭预警'}</strong><p>${b?'第 '+b.round+' / '+NPCDefenseData.maxRounds+' 回合':`第 ${w.wave} 波 · ${w.level} 级 · ${Game.totalArmy(w.army)} 人${w.arriveAt>Date.now()?' · '+clock(w.arriveAt):''}`}</p></div>${btn(b?'继续守城':'查看来袭','npcDefense','','small')}</div>`;
}
function npcDefenseReportHTML(r){
  const losses=Object.entries(r.defenseLost).filter(([,n])=>n>0),repairs=Object.entries(r.repaired).filter(([,n])=>n>0),overflow=r.resourceReceipt?Object.values(r.resourceReceipt.overflow).reduce((s,n)=>s+n,0):0;
  return `<article class="report"><div class="report-top"><h3>${r.drill?'守城演练':'青溪城 · 守城第 '+r.wave+' 波'}</h3><span class="result ${r.won?'':'loss'}">${r.won?'守城胜利':'城门失守'} · ${r.round} 回合</span></div><p class="meta">${new Date(r.id).toLocaleString('zh-CN')} · ${r.level} 级山匪 · 城守 ${esc(Game.general(r.general).name)}</p>${r.drill?'<p class="notice">演练结束，兵力、工事与库存保持原值，未发放奖励。</p>':r.won?`<section class="storage-preview">${receiptTableHTML(r.resourceReceipt,'守城奖励')}${overflow?`<p class="storage-loss">仓储损失 ${resourceAmount(overflow)}。${btn('前往仓储','manualStorage','','small secondary')}</p>`:''}</section>`:`<h4>被掠走资源</h4>${lootHtml(r.robbed)}<p class="hint">黄金和建筑保留，可重新训练和补建工事。</p>`}<p class="hint">${r.drill?'模拟':''}永久损失 ${Game.totalArmy(r.lost)} 人 · 伤兵归队 ${Game.totalArmy(r.wounded)} 人 · 驻军归队 ${Game.totalArmy(r.back)} 人${r.drill?'':' · 武将经验 +'+r.xp}</p><p class="hint">工事消耗／损毁：${losses.length?losses.map(([id,n])=>Game.manual.defenses[id].name+' ×'+n).join('、'):'无'}${repairs.length?'；维修恢复：'+repairs.map(([id,n])=>Game.manual.defenses[id].name+' ×'+n).join('、'):''}</p></article>`;
}
function npcDefenseModal(){
  const s=S(),d=s.cityDefense,b=d.battle,w=d.incoming,ready=w&&w.arriveAt<=Date.now(),unlocked=s.buildings.hall>=NPCDefenseData.unlockHall&&s.stats.victories>=1,latest=d.drillResult||d.reports[0];
  let content=`<p class="sub">山匪来袭与守城为试玩规则。驻城军队和已完工城防参战，在外部队不参与。</p>`;
  if(b){
    const rows=(army,enemy=false)=>army.filter(r=>r.hp>0).map(r=>`<div class="defense-unit"><span>${Game.units[r.id].name}</span><strong>${Math.ceil(r.hp/r.stats.hp)} / ${r.count}</strong><small>${enemy?'敌军':'驻军'} · 生命 ${num(r.hp)}</small></div>`).join('')||'<p class="hint">已无可战部队。</p>';
    content+=`<p class="notice">${b.drill?'演练 · 结算不会消耗实际兵力与物资':'正式守城 · 战后立即结算伤亡与工事损失'}<br>第 ${b.round} / ${NPCDefenseData.maxRounds} 回合 · 敌军距离 ${num(b.distance)}<br>城门耐久 ${num(b.gateHp)} / ${num(b.gateMax)}</p><div class="defense-columns"><section><h3>驻城军队</h3>${rows(b.player)}</section><section><h3>来袭山匪</h3>${rows(b.enemy,true)}</section></div><section class="panel"><h3>防御工事</h3>${b.forts.map(f=>`<p>${Game.manual.defenses[f.id].name} · ${Game.manual.defenses[f.id].oneUse?'剩余 '+(f.count-f.used)+' / '+f.count:'耐久 '+num(f.hp)} · 射程 ${Game.manual.defenses[f.id].range}</p>`).join('')||'<p class="hint">未建设工事，依靠驻军和城门迎敌。</p>'}</section><details open><summary>守城战况</summary><div class="defense-log">${b.log.map(t=>`<p>${esc(t)}</p>`).join('')}</div></details>`;
    showModal(b.drill?'青溪城 · 守城演练':'青溪城 · 迎战山匪',content,btn('稍后继续','close','','secondary')+btn('下一回合','npcRound')+btn('推进 5 回合','npcFiveRounds','','secondary')+(b.drill?btn('结束演练','npcEndDrill','','secondary'):''));
  }else{
    content+=w?`<p class="notice"><strong>第 ${w.wave} 波 · ${w.level} 级山匪 ${ready?'已抵达':'行军中'}</strong><br>${ready?'敌军在城外列阵，点击迎战开始守城。':'预计抵达：'+clock(w.arriveAt)}</p><div class="defense-roster">${Object.entries(w.army).map(([id,n])=>`<span>${Game.units[id].name} ×${n}</span>`).join('')}</div>`:unlocked?`<p class="notice">下次山匪预警：${clock(d.nextAt)}。预警后有 5 分钟准备。</p>`:'<p class="notice">新手保护：官府达到 2 级并赢得一次出征后，开始计时山匪来袭。现在可先进行守城演练。</p>';
    content+=`<p class="hint">当前驻军 ${Game.totalArmy(s.army)} 人 · 已有工事 ${Object.values(s.defenses).reduce((a,n)=>a+n,0)} 个 · 守城胜利 ${d.wins} 次</p><div class="settings-row">${btn('建设防御工事','manualDefense','','secondary')}${btn('训练驻城部队','manualArmy','','secondary')}</div><details><summary>守城规则与科技</summary><ul class="help-list"><li>敌军靠近后，驻军与工事按射程攻击；拒马阻挡并减缓靠近，箭塔持续射击，陷阱／滚木／擂石使用后消耗。</li><li>城防技术每级增加 10% 城墙与工事耐久，维修技术每级恢复 5% 被摧毁的耐久工事。</li><li>敌军全灭或守住 30 回合获胜。城门耐久归零失守，最多被掠走四资源各 10%，总量受敌军负重限制。</li><li>离线保留预警或战场，回到游戏后再处理；同时最多一波山匪，不积累多波。</li></ul></details>${latest?npcDefenseReportHTML(latest):''}`;
    showModal('青溪城 · 来袭与守城',content,btn('关闭','close','','secondary')+(w?btn(ready?'迎战山匪':'敌军尚未抵达','npcStart','','',!ready||!!(s.battle&&!s.battle.finished)):'')+btn('开始守城演练','npcDrill','','secondary',!!(s.battle&&!s.battle.finished)));
  }
  manualModalContext=npcDefenseModal;
}
document.addEventListener('click',event=>{
  const el=event.target.closest('[data-action]');if(!el||el.disabled)return;const a=el.dataset.action;
  if(a==='npcDefense')npcDefenseModal();
  if(a==='npcStart'||a==='npcDrill'){if(actResult(Game.startCityDefense(a==='npcDrill')))npcDefenseModal();}
  if(a==='npcRound'||a==='npcFiveRounds'){for(let i=0;i<(a==='npcRound'?1:5)&&S().cityDefense.battle;i++)Game.cityDefenseRound();npcDefenseModal();render();}
  if(a==='npcEndDrill'){if(actResult(Game.endDefenseDrill(),'演练已结束'))npcDefenseModal();}
});
