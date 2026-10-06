'use strict';
function wildGeneralCostHTML(cost){return [cost.gold?`黄金 ${num(cost.gold)}`:'',...Object.entries(cost.jewels).map(([id,n])=>`${Progression.jewels[id].name} ×${n}`)].filter(Boolean).join(' · ');}
function wildGeneralStatsHTML(g){return `<div class="wild-initial-stats">${['atk','def','pol','wis'].map(k=>`<span><small>初始${HeroSystem.attrs[k]}</small>${typeof innInitialAttributeHTML==='function'?innInitialAttributeHTML(HeroSystem.attrs[k],g[k]):`<strong>${g[k]}</strong>`}</span>`).join('')}</div>`;}
function wildPortraitStatusHTML(d){
 const q=HeroSystem.wild.portraitQuote(S(),d.line);
 return `<div class="wild-portrait-status"><p class="hint">${q.owned?'✓ 已持有 '+esc(d.name)+'画像 · 永久保留':'俘获前置：'+esc(d.name)+'画像 · '+num(q.price)+' 元宝'}。画像与招降费用分开，战胜仍需歼灭守军。</p>${q.owned?'':btn('购买 '+esc(d.name)+'画像','wildPortraitAsk',d.line,'small secondary',!!q.reason)}${!q.owned&&q.reason?'<p class="hint">'+esc(q.reason)+'</p>':''}</div>`;
}
function wildPortraitShopModal(){
 const s=S();
 showModal('将领画像专柜',`<p class="sub">试玩元宝 ${num(s.gems)} · 无充值</p><p class="notice">先到客栈打听线索，再购买对应画像。拥有画像且歼灭全部守军才可俘获；画像永久保留，战败、释放或成功俘获都不消耗。招降另需黄金或珍宝。</p><div class="wild-general-leads">${HeroSystem.wild.definitions.map(d=>`<article class="wild-general-card"><div class="wild-general-heading">${generalPortrait({...d,id:s.wildGenerals.rumors.find(r=>r.line===d.line)?.id||'portrait_'+d.line},'wild-general-portrait')}<h3>${esc(d.name)}画像</h3></div>${wildGeneralStatsHTML(d)}${wildPortraitStatusHTML(d)}</article>`).join('')}</div>`,btn('客栈线索与俘将','wildGenerals','','secondary')+btn('关闭','close','','secondary'));
 manualModalContext=wildPortraitShopModal;
}
function wildPortraitAsk(line){
 const q=HeroSystem.wild.portraitQuote(S(),line);if(!q){toast('画像不存在');return;}
 showModal('购买 · '+esc(q.name)+'画像',`<p class="sub">价格 ${num(q.price)} 元宝 · 当前 ${num(S().gems)} 元宝</p><p class="hint">购买后永久持有该将领画像，可识别并俘获其野地线索。必须战胜并歼灭守军；招贤馆空位及手动招降条件仍需满足。招降黄金或珍宝另行支付。</p>${q.reason?'<p class="notice">'+esc(q.reason)+'</p>':''}`,btn('返回画像专柜','wildPortraitShop','','secondary')+btn('支付 '+num(q.price)+' 元宝购买','wildPortraitBuy',line+'~'+q.key,'',!!q.reason));
}
function wildPortraitDispatchHTML(n){
 const r=S().wildGenerals.rumors.find(r=>r.node===n.id&&r.status==='active');if(!r)return '';
 const d=HeroSystem.wild.definitions.find(d=>d.line===r.line);
 return HeroSystem.wild.portraitOwned(S(),r.line)?`<p class="notice">已持有 ${esc(d.name)}画像。歼灭全部守军且招贤馆有空位后可俘获，画像不消耗。</p>`:`<section class="notice"><strong>未拥有 ${esc(d.name)}画像，本次胜利无法俘获将领。</strong><p class="hint">普通战利品照常结算。抓将前请先购买对应画像，招降费用另计。</p>${wildPortraitStatusHTML(d)}</section>`;
}
function wildGeneralApproachHTML(d){return d.line==='wanderer'?`<p class="hint">骑兵特长。建议准备 30 轻骑兵快速奔袭；需先解锁骑兵，${esc(Game.unitRequirements('cavalry')||'当前已满足训练前置')}。这是准备建议，胜负仍取决于兵力与指挥。任何兵种均可俘获，混编会按最慢兵种行军。</p>`:`<p class="hint">${esc(Game.units[d.bonus].name)}特长。先侦察驻军、确认兵力和招贤馆房间，再选择掠夺或占领。</p>`;}
function wildGeneralNodeHTML(n){
 const r=S().wildGenerals.rumors.find(r=>r.node===n.id&&r.status==='active');if(!r)return '';
 const d=HeroSystem.wild.definitions.find(d=>d.line===r.line);
 return `<section class="wild-node-lead notice"><h3>在野将领 · ${esc(d.name)}</h3><p class="hint">拥有对应画像并歼灭此处全部守军后才可俘获，战败或撤退不会俘获。招贤馆满员时自动释放；俘获后还需手动招降。</p>${wildGeneralStatsHTML(d)}${wildGeneralApproachHTML(d)}${wildPortraitStatusHTML(d)}<p class="hint">招降要求：${HeritageData.nobles[d.noble].name}及以上 · 黄金 ${num(d.gold)} 或 ${wildGeneralCostHTML({gold:0,jewels:d.jewels})} · 忠诚 40</p>${btn('查看线索与俘将','wildGenerals','','small secondary')}</section>`;
}
function wildGeneralBattleHTML(result){
 const r=result.wildGeneral;if(!r)return '';
 const missing=r.status==='portrait_required';
 return `<section class="notice wild-battle-receipt"><strong>${r.status==='captured'?'俘获':missing?'未俘获':'释放'}将领 · ${esc(r.name)}</strong><p>${r.status==='captured'?'忠诚 40，已占用招贤馆房间。可选择黄金或珍宝手动招降。':missing?esc(r.reason)+'。普通战利品已照常结算，购买画像后可再次出征；已占领此地则重新打听落脚点。':esc(r.reason)+'，可整理名额后重新打听。'}</p>${btn(missing?'购买对应画像':r.status==='captured'?'俘将管理 · 招降':'客栈线索',missing?'wildPortraitAsk':'wildGenerals',missing?r.line:'','small secondary')}</section>`;
}
function wildGeneralsModal(){
 const s=S(),w=s.wildGenerals,used=HeroSystem.wild.roomUsed(s);
 const captives=w.captives.map(c=>{const d=HeroSystem.wild.definitions.find(d=>d.line===c.line),gold=HeroSystem.wild.recruitQuote(s,c.id,'gold'),jewels=HeroSystem.wild.recruitQuote(s,c.id,'jewels');return `<article class="wild-general-card"><div class="wild-general-heading">${generalPortrait(c.hero,'wild-general-portrait')}<div><h3>${esc(c.hero.name)} <span class="label">Lv.${c.hero.level} · 被俘</span></h3><p class="hint">${esc(c.hero.title)} · 忠诚 ${c.loyalty}/100 · 招降后可培养</p><p class="hint">逃亡倒计时 ${clock(c.at+GovernanceSystem.DAY)} · 24小时内未招降会逃离</p></div></div>${wildGeneralStatsHTML(c.hero)}<p class="hint">爵位要求：${HeritageData.nobles[d.noble].name}及以上（当前 ${HeritageData.nobles[s.honors.noble].name}）</p><div class="wild-general-actions">${btn('黄金招降 · '+num(d.gold),'wildRecruitAsk',c.id+'|gold','',!!gold.reason)}${btn('珍宝招降 · '+wildGeneralCostHTML(jewels.cost),'wildRecruitAsk',c.id+'|jewels','secondary',!!jewels.reason)}${btn('释放俘将','wildReleaseAsk',c.id,'danger secondary')}</div>${gold.reason?`<p class="hint">黄金方式：${esc(gold.reason)}</p>`:''}${jewels.reason?`<p class="hint">珍宝方式：${esc(jewels.reason)}</p>`:''}</article>`;}).join('');
 const leads=HeroSystem.wild.definitions.map(d=>{const r=w.rumors.find(r=>r.line===d.line),n=r&&Game.getNode(r.node),status=!r?'待打听':{active:'在野线索',captive:'已俘获，等待招降',recruited:'已归顺',released:'已释放，可重新打听'}[r.status];return `<article class="wild-general-card"><div class="wild-general-heading"><div><h3>${esc(d.name)} <span class="label">Lv.${d.level} · ${status}</span></h3><p class="hint">${esc(d.title)} · ${d.historical?'历史将领，数值为本作设定':'本作游侠'}</p></div></div>${wildGeneralStatsHTML(d)}${r?.status==='active'?`<p class="coordinate-tag">${esc(n.name)} · ${n.level} 级 · 坐标 (${n.x}, ${n.y})</p>${wildGeneralApproachHTML(d)}${wildPortraitStatusHTML(d)}${s.conquered[r.node]?'<p class="notice">此落脚点已被你占领，请免费打听以寻找新的落脚点。</p>':''}<p class="hint">招降：${HeritageData.nobles[d.noble].name}及以上 · 黄金 ${num(d.gold)} 或 ${wildGeneralCostHTML({gold:0,jewels:d.jewels})}</p>${btn('地图定位 · 侦察与出征','wildRumorGo',r.id,'block')}`:r?.status==='recruited'?btn('培养 '+esc(d.name),'heroDetail',r.id,'secondary block'):r?.status==='captive'?'<p class="hint">上方俘将管理可查看两种支付方式。</p>':'<p class="hint">点击免费打听获取稳定坐标，已获得线索不会被刷新。</p>'}</article>`;}).join('');
 showModal('野地抓将 · 线索与俘将',`<div class="wild-general-overview"><p class="sub">全城招贤馆 ${used}/${Game.heroCapacity()} · 帐下 ${s.generals.length} · 被俘 ${w.captives.length}</p><p class="notice">打听 → 购买对应画像 → 地图定位 → 掠夺或占领并歼灭守军 → 俘将管理 → 手动招降。俘将占用房间，满员会自动释放；战败的己方将领仍会返城。</p>${btn('免费打听野地将领','wildRumorDiscover','','block',s.buildings.inn<1)}${btn('将领画像专柜','wildPortraitShop','','secondary block')}${s.buildings.inn<1?'<p class="hint">请先建设 1 级客栈。</p>':''}<p class="hint">十二位将领分布于不同地区；客栈等级与爵位决定可打听的线索。打听不收费，不刷新初始属性；已归顺的同一将领不会再次出现。忠诚可通过赏赐提高到 100，将领每小时领取等级×20黄金的薪俸，欠饷降低忠诚；忠诚0时空闲将领下野，忙碌将领返回后处理。</p></div><h3>俘将管理 · ${w.captives.length}</h3><div class="wild-general-list">${captives||'<p class="hint">暂无被俘将领。根据下方线索出征，歼灭全部守军后回到这里招降。</p>'}</div><h3>客栈线索</h3><div class="wild-general-list">${leads}</div>`,btn('客栈招募','manualInn','','secondary')+btn('帐下将领','heroTab','roster','secondary')+btn('关闭','close','','secondary'));
 manualModalContext=wildGeneralsModal;
}
function wildRecruitAsk(id,method='gold'){
 const q=HeroSystem.wild.recruitQuote(S(),id,method);if(!q){toast('这名俘将已不在营中');wildGeneralsModal();return;}
 showModal('确认招降 · '+esc(q.name),`<p class="sub">支付：${wildGeneralCostHTML(q.cost)}</p><p class="hint">需要 ${q.nobleName}及以上。归顺后忠诚 ${q.loyalty}/100，成为帐下将领并可正常培养；此次将俘将名额转换为帐下名额，不额外占一间房。</p>${q.reason?`<p class="notice">${esc(q.reason)}</p>`:''}<p class="hint">确认时再次检查爵位、名额和支付余额，成功后只扣一次。</p>`,btn('返回俘将','wildGenerals','','secondary')+btn('确认支付并招降','wildRecruitConfirm',id+'~'+method+'~'+q.key,'',!!q.reason));
}
function wildRewardAsk(id){
 const gold=HeroSystem.wild.rewardQuote(S(),id,'gold'),jewels=HeroSystem.wild.rewardQuote(S(),id,'jewels');if(!gold){toast('请选择帐下将领');return;}
 showModal('确认赏赐 · '+esc(gold.name),`<p class="sub">忠诚 ${gold.current} → ${gold.next} /100</p><p class="hint">选择一种支付方式，每次提高最多 10 点。赏赐不增加等级或初始属性。</p><div class="wild-general-actions">${btn('支付 '+wildGeneralCostHTML(gold.cost),'wildRewardConfirm',id+'~gold~'+gold.key,'',!!gold.reason)}${btn('支付 '+wildGeneralCostHTML(jewels.cost),'wildRewardConfirm',id+'~jewels~'+jewels.key,'secondary',!!jewels.reason)}</div>${gold.reason?`<p class="hint">黄金方式：${esc(gold.reason)}</p>`:''}${jewels.reason?`<p class="hint">珍宝方式：${esc(jewels.reason)}</p>`:''}`,btn('返回培养','heroDetail',id,'secondary'));
}
function wildReleaseAsk(id){
 const q=HeroSystem.wild.releaseQuote(S(),id);if(!q){toast('这名俘将已不在营中');wildGeneralsModal();return;}
 showModal('确认释放 · '+esc(q.name),'<p class="notice">释放后会腾出一间招贤馆房间。不会返还战损或支付奖励；可以重新打听其线索，再次出征俘获。</p>',btn('保留俘将','wildGenerals','','secondary')+btn('确认释放','wildReleaseConfirm',id+'~'+q.key,'danger'));
}
document.addEventListener('click',event=>{
 const el=event.target.closest('[data-action]');if(!el||el.disabled)return;const a=el.dataset.action,arg=el.dataset.id||'';if(!a.startsWith('wild'))return;
 if(a==='wildGenerals'){wildGeneralsModal();return;}
 if(a==='wildPortraitShop'){wildPortraitShopModal();return;}
 if(a==='wildPortraitAsk'){wildPortraitAsk(arg);return;}
 if(a==='wildPortraitBuy'){const [line,key]=arg.split('~');if(actResult(HeroSystem.wild.buyPortrait(line,key),'画像已购入并永久保存，可按线索出征抓将')){wildPortraitShopModal();render();}return;}
 if(a==='wildRumorDiscover'){if(actResult(HeroSystem.wild.discover(),'野地线索已更新'))wildGeneralsModal();return;}
 if(a==='wildRumorGo'){const r=S().wildGenerals.rumors.find(r=>r.id===arg&&r.status==='active');if(!r){toast('线索状态已改变，请重新查看');wildGeneralsModal();return;}const n=Game.getNode(r.node);modal.close();page='world';selectedNode=r.node;worldView={x:n.x,y:n.y};render();worldNodeModal(r.node);return;}
 if(a==='wildRecruitAsk'){const [id,method='gold']=arg.split('|');wildRecruitAsk(id,method);return;}
 if(a==='wildRewardAsk'){wildRewardAsk(arg);return;}
 if(a==='wildReleaseAsk'){wildReleaseAsk(arg);return;}
 if(a==='wildRecruitConfirm'){const [id,method,key]=arg.split('~');if(actResult(HeroSystem.wild.recruit(id,method,key),'将领已归顺，可以前往培养'))wildGeneralsModal();return;}
 if(a==='wildRewardConfirm'){const [id,method,key]=arg.split('~');if(actResult(HeroSystem.wild.reward(id,method,key),'赏赐完成，忠诚已提高'))wildRewardAsk(id);return;}
 if(a==='wildReleaseConfirm'){const [id,key]=arg.split('~');if(actResult(HeroSystem.wild.release(id,key),'俘将已释放，房间已腾出'))wildGeneralsModal();}
});
