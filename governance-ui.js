'use strict';
function governanceSummaryHTML(){
 const s=S(),q=Game.governanceStatus(),g=s.governance;
 return `<section class="panel"><div class="section-title"><h3>城务预警</h3>${btn('城务与薪俸','governance','','small secondary')}</div><p class="hint">民心目标 ${Math.round(q.moraleTarget)} = 100 − 税率 − 民怨。将领薪俸 ${num(q.wages)} 黄金/小时${q.owed?' · 欠饷 '+num(q.owed):''}</p>${q.warnings.map(t=>`<p class="notice">${esc(t)}</p>`).join('')}${q.nextEvent?`<p class="hint">下一城务事件：${esc(q.nextEvent.name)} · ${clock(q.nextEvent.at)}</p>`:''}${g.autoRelief?'<p class="hint">自动安抚已开启，黄金足够时使用祈福。</p>':''}</section>`;
}
function governanceModal(){
 const s=S(),g=s.governance,q=Game.governanceStatus();
 showModal(esc(activeCityMeta().name)+' · 城务',`${governanceSummaryHTML()}<div class="shop-tools">${btn(g.autoRelief?'关闭自动安抚':'开启自动安抚','governancePolicy','autoRelief','secondary')}${btn(g.eventsEnabled?'关闭后续城务事件':'开启天灾与天赐','governancePolicy','eventsEnabled','secondary')}${btn('祭天与安抚','governmentTab','comfort','secondary')}${btn('粮草补给','supplyLines','','secondary')}</div><p class="hint">低民心或高民怨、断粮先预警1小时。内乱减少5%人口和木石铁金；持续断粮每小时损失本城驻军1%，在途部队保留快照。事件可自行开启，每4小时一次，提前显示下一事件。祭天可在8小时内免一次天灾、下一次天赐翻倍。爆仓本身不降民心。</p><h3>本城事件记录</h3>${g.log.slice(0,10).map(r=>`<p class="hint">${esc(new Date(r.at).toLocaleString('zh-CN'))} · ${esc(r.text)}</p>`).join('')||'<p class="hint">暂无事件。</p>'}<h3>将领薪俸</h3>${salaryLedgerHTML()}<p class="hint">每小时按等级×20黄金支付，从将领所在城支付，城际行军时从主城支付。未付工资累积欠饷，每小时忠诚−5；补发欠饷忠诚+10。忠诚0的空闲将领离开，忙碌将领返城后处理。林朔和苏砚为初始保底将，最低忠诚20。旧档从更新后开始计时。</p><h3>城战俘将</h3>${defeatedCaptivesHTML()}`,btn('关闭','close','','secondary'));
 manualModalContext=governanceModal;
}
function salaryLedgerHTML(){
 const q=Game.salaryQuote();
 return `<div class="manual-list">${q.rows.map(r=>`<article><div class="section-title"><h4>${esc(r.name)}</h4><span class="badge">忠诚 ${r.loyalty}</span></div><p class="hint">${num(r.wage)} 金/小时 · 欠饷 ${num(r.owed)} · ${esc(cityName(r.city))}</p>${r.owed?btn('补发欠饷','salaryPay',r.id,'small secondary'):''}</article>`).join('')}</div>${btn('一键补发 · '+num(q.cost)+' 金','salaryPay','all','secondary block',!!q.reason)}${q.reason?`<p class="hint">${esc(q.reason)}</p>`:''}${S().heroService.log.slice(0,6).map(r=>`<p class="hint">${esc(new Date(r.at).toLocaleString('zh-CN'))} · ${esc(r.text)}</p>`).join('')}`;
}
function defeatedCaptivesHTML(){return `<div class="manual-list">${S().heroService.captives.map(c=>`<article><h4>${esc(c.hero.name)} · Lv.${c.level}</h4><p class="hint">原主 ${esc(c.previousOwner)} · 逃亡倒计时 ${clock(c.at+GovernanceSystem.DAY)}</p>${['gold','jewels'].map(method=>{const q=Game.defeatedHeroQuote(c.id,method);return btn(method==='gold'?'黄金招降 '+num(q.cost.gold):'珍珠招降 '+q.cost.jewels.pearl,'defeatedRecruit',c.id+'|'+method,'small secondary',!!q.reason);}).join('')}</article>`).join('')||'<p class="hint">没有城战俘将。野地俘将仍在客栈线索中管理。</p>'}</div>`;}
function heroSalaryHTML(id){const q=Game.salaryQuote(id),r=q.rows[0];return r?`<p class="hint">薪俸 ${num(r.wage)} 金/小时 · 欠饷 ${num(r.owed)}${r.owed?btn('补发欠饷','salaryPay',id,'small secondary'):''}${btn('薪俸与城战俘将','governance','','small secondary')}</p>`:'';}
document.addEventListener('click',event=>{
 const el=event.target.closest('[data-action]');if(!el||el.disabled||event.defaultPrevented)return;const a=el.dataset.action,id=el.dataset.id;
 if(a==='governance')governanceModal();
 if(a==='governancePolicy'){if(actResult(Game.setGovernancePolicy(id,!S().governance[id]),'城务安排已保存'))governanceModal();}
 if(a==='salaryPay'){const q=Game.salaryQuote(id);if(actResult(Game.payHeroArrears(id,q.key),'欠饷已补发'))governanceModal();}
 if(a==='defeatedRecruit'){const [hero,method]=id.split('|'),q=Game.defeatedHeroQuote(hero,method);if(q&&actResult(Game.recruitDefeatedHero(hero,method,q.key),'城战俘将已归顺'))governanceModal();}
});
