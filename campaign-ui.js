'use strict';
const missionNames={raid:'掠夺',occupy:'占领'};
function campaignMarchReferenceHTML(n){
  if(!Game.marchQuote)return '配兵后可查看行军时间';
  return `弓兵参考 ${duration(Game.marchQuote(n.id,{archer:1}).seconds)} · 纯骑兵 ${duration(Game.marchQuote(n.id,{cavalry:1}).seconds)} · 混编按最慢兵种行军`;
}
function campaignMarchHTML(nodeId,army){
  if(!Game.marchQuote)return '';
  const quote=Game.marchQuote(nodeId,army);if(quote.error)return '<p class="hint">选择士兵后，可查看行军与预计返程时间。</p>';
  return `<div class="notice campaign-march-quote"><strong>预计去程 ${duration(quote.seconds)} · 预计返程 ${duration(quote.returnSeconds)}</strong><p>最慢兵种：${esc(Game.units[quote.slowest].name)} · 当前速度 ${num(quote.speed)} · 试玩倍率 ×${quote.trialMultiplier}</p><p class="hint">纯骑兵可快奔袭；混编弓兵或运输部队时，整队取最慢速度。返程按届时归队兵种、科技与倍率重新计算；已出发部队保留原抵达时间。</p></div>`;
}
function updateCampaignMarchPreview(){
  const target=document.getElementById('campaign-march-preview'),select=document.getElementById('dispatch-mode');if(!target||!select)return;
  const html=campaignMarchHTML(select.dataset.node,dispatchArmy());if(target.innerHTML!==html)target.innerHTML=html;
}
function resourceAmount(n){return n>0&&n<.01?'不足 0.01':n.toLocaleString('zh-CN',{maximumFractionDigits:2});}
function dispatchStorageHTML(cargo){
  if(!cargo.loaded)return {warning:'',details:'<p class="hint">选择出征士兵后，可查看预计入库资源。</p>'};
  const quote=cargo.storage,rows=quote.rows.filter(row=>row.amount>0),over=rows.filter(row=>row.overCapacity>0);
  // Economic production can leave fractional room; preserve it in the estimate.
  const amount=resourceAmount;
  const warning=over.length?`<div class="notice storage-warning" role="status"><strong>本次预计爆仓入库，满仓或超仓仍可收下战利品。</strong><br>${over.map(row=>Game.resources[row.id].name+'：预计入库 '+amount(row.received)+'，其中爆仓入库 '+amount(row.overCapacity)).join('；')}<br>不会因仓储容量丢失已装载资源；库存回落至容量以下，资源田才恢复增产。</div>`:'';
  const details=`<section class="storage-preview" aria-label="预计实际入库"><h3>预计实际入库 <strong>${amount(quote.received)}</strong> / ${num(cargo.loaded)}</h3><table class="storage-preview-table"><caption>基础战利品 · 无战损估算</caption><thead><tr><th scope="col">资源 / 可用仓储</th><th scope="col">装载</th><th scope="col">入库</th><th scope="col">爆仓入库</th></tr></thead><tbody>${rows.map(row=>`<tr><th scope="row">${Game.resources[row.id].name}<small>空位 ${amount(row.room)} / 容量 ${num(row.limit)}</small></th><td>${num(row.amount)}</td><td class="storage-received">${amount(row.received)}</td><td class="storage-received">${amount(row.overCapacity)}</td></tr>`).join('')}</tbody></table><p class="hint">爆仓入库是已入库资源中超过容量的部分。按当前库存及出征扣粮估算，未计战损、随机掉落和战斗期间的库存变化；实际入库以战斗结算时为准。</p></section>`;
  return {warning,details};
}

function battleDropHint(n){const info=Game.battleDropInfo(n.id);return `战斗胜利：${Math.round(info.itemChance*1000)/10}% 概率掉落商城道具 · ${Math.round(info.resourceChance*1000)/10}% 概率获得额外资源。另有 ${Math.round(Math.min(.55,.25+n.level*.03)*100)}% 概率掉落装备；强敌奖励更高，高级道具更稀有；资源受幸存部队负重限制，入库允许爆仓${n.orderRoute?'。':'；掠夺基础资源 +30%。'}`; }
function siegeIntelHTML(n){return n.commander?`<p class="notice">敌将 ${n.commander.name} · ${n.commander.title} · 攻击 ×${Math.round(n.commander.attack*100)/100} / 防御 ×${Math.round(n.commander.defense*100)/100}${n.fortification?`<br>${n.fortification.name}：耐久 ${num(n.fortification.hp)} · 掩护 ×${n.fortification.protection} · 箭楼射程 ${n.fortification.range}<br>${n.orderRoute?'讨伐':'占领'}需要破城并歼敌；冲车近战破门，投石车远射破墙。${n.orderRoute?'':'掠夺不启用城防。'}`:''}</p>`:'';}
function battleCargoHTML(result){if(!result.won||result.cargoCapacity===undefined)return '';const receipt=result.overCapacity!==undefined?'<br>战利品在胜利结算时入库，满仓或超仓也能收取；返城不重复结算。':'';return `<p class="notice cargo-summary">幸存部队负重 ${num(result.cargoCapacity)} · 装载资源 ${num(result.cargoLoaded)} / ${num(result.cargoCapacity)}${result.lootDiscarded?`<br>负重不足，${num(result.lootDiscarded)} 基础资源未能带回。`:''}${receipt}<br><span class="hint">伤兵不参与搬运；额外资源与基础战利品共用负重。</span></p>`;}
function battleFailureHTML(result){
  const f=result.failure;if(!f)return '';
  const reason={retreat:'主动撤退',army:'我军已失去战斗力',gate:'达到回合上限，城防未破',enemy:'达到回合上限，守军未清空',gate_and_enemy:'达到回合上限，城防和守军均未清除'}[f.reason];
  return `<p class="notice">${reason} · 剩余守军 ${num(f.enemyRemaining)} 人${f.gateHp?` · 城防耐久 ${num(f.gateHp)}`:''}${f.outOfRange?'<br>部分坚守部队无法覆盖敌军。下次可先「向前」接敌，进入射程后再坚守。':''}${f.gateHp?'<br>攻城需同时破城歼敌；可带冲车或投石车，并用步兵保护器械。':''}</p>`;
}
function battleChallengeHTML(result){
  const c=result.warOrder?.challenge;if(!c)return '';
  const metrics=`${c.round} 回合 · 永久损失 ${c.lost} / ${c.deployed} 人${c.machines?` · 器械存活 ${c.machineAlive} / ${c.machines} 架${c.rulesVersion===2?' · 实际攻城 '+c.machineGateAttacks+' 次':' · 旧版凭据'}`:''}`;
  return `<p class="notice">${c.met?(c.first?'挑战首次达标 · 额外军功 +'+c.bonus:'挑战再次达标 · 首奖已领'):'普通讨伐胜利 · 挑战未达标，额外军功 +0'}<br>${metrics}</p>`;
}
function battleEconomyQuote(result){
  const ids=Object.keys(Game.resources),blank=()=>Object.fromEntries(ids.map(id=>[id,0])),loaded=blank(),received=blank(),replacement=blank();
  const add=(target,values)=>{for(const id of ids)target[id]+=Math.max(0,Number(values?.[id])||0);};
  if(result.resourceReceipt)for(const kind of ['base','bonus']){add(loaded,result.resourceReceipt[kind]?.loaded);add(received,result.resourceReceipt[kind]?.received);}
  else{add(loaded,result.loot);add(loaded,result.bonusLoot);}
  for(const [unit,count] of Object.entries(result.lost||{}))for(const [id,cost] of Object.entries(Game.units[unit]?.cost||{}))if(Object.hasOwn(replacement,id))replacement[id]+=count*cost;
  const sum=values=>Object.values(values).reduce((total,n)=>total+n,0),loadedValue=sum(loaded);
  const receivedValue=result.resourceReceipt?sum(received):result.cargoLoaded!==undefined?Math.max(0,result.cargoLoaded-(result.overflow||0)):null;
  return {loaded,received,replacement,loadedValue,receivedValue,replacementValue:sum(replacement),exactReceipt:!!result.resourceReceipt};
}
function battleEconomyHTML(result){
  const q=battleEconomyQuote(result),losses=Object.entries(q.replacement).filter(([,amount])=>amount>0);
  return `<section class="combat-economy" aria-label="战后资源对照"><h4>缴获与补兵资源对照</h4><div class="combat-economy-grid"><article><span>装载缴获资源等价</span><strong>${resourceAmount(q.loadedValue)}</strong><small>基础战利品 + 随机资源掉落</small></article><article><span>实际入库资源等价</span><strong>${q.receivedValue===null?'未记录':resourceAmount(q.receivedValue)}</strong><small>${q.exactReceipt?'按本次入库凭据统计':q.receivedValue===null?'旧战报缺少入库合计':'旧战报记录的入库合计'}${result.overCapacity?' · 含爆仓 '+resourceAmount(result.overCapacity):''}</small></article><article class="combat-replacement"><span>永久损失补兵资源等价</span><strong>${resourceAmount(q.replacementValue)}</strong><small>永久损失 ${num(Game.totalArmy(result.lost||{}))} 人 · 伤兵归队 ${num(Game.totalArmy(result.wounded||{}))} 人</small></article></div><p class="combat-replacement-cost">补兵所需：${losses.length?losses.map(([id,amount])=>`${Game.resources[id].name} ${resourceAmount(amount)}`).join(' · '):'本次无永久损失，无需补兵资源。'}</p><p class="hint">按当前市场原型 1:1，将粮食、木材、石料、铁锭与黄金数量相加作资源等价对照。补兵仅计永久损失，按当前兵种训练成本估算；行军耗粮、人口与训练时间另计。军功、铜钱、珍宝、装备和道具各自保留原单位。</p></section>`;
}
function battleDropsHTML(result){
  const orderReward=result.warOrder?'<p class="notice">军令军功 +'+result.warOrder.points+' · '+(result.warOrder.first?'首次通关双倍':'重复讨伐')+' · 已保存</p>':'';
  const progress=battleEconomyHTML(result)+(typeof wildGeneralBattleHTML==='function'?wildGeneralBattleHTML(result):'')+orderReward+battleChallengeHTML(result)+(result.prestigeDelta===undefined?'':`<p class="notice">声望 ${result.prestigeDelta>=0?'+':''}${num(result.prestigeDelta)}${Object.entries(result.jewelDrops||{}).map(([id,count])=>' · '+Game.progression.jewels[id].name+' ×'+count).join('')}</p>`);
  if(result.itemDrops===undefined&&result.bonusLoot===undefined)return progress+heroEquipmentDropsHTML(result);
  if(!result.won)return progress;
  const items=Object.entries(result.itemDrops||{}),bonus=Object.fromEntries(Object.entries(result.bonusLoot||{}).filter(([,count])=>count>0));
  const prefix=progress+captiveDropsHTML(result)+heroEquipmentDropsHTML(result);
  if(result.resourceReceipt&&!items.length&&!result.bonusDiscarded)return prefix;
  return `${prefix}<div class="battle-drops"><h4>额外掉落</h4>${items.length?`<div class="item-drops">${items.map(([id,count])=>{const item=Game.manual.shop.find(x=>x.id===id);return `<span class="item-drop ${item.price>=Game.manual.battleDrops.rarePrice?'rare-drop':''}">${esc(item.name)} ×${count}${item.price>=Game.manual.battleDrops.rarePrice?' · 稀有':''}</span>`;}).join('')}</div><p class="hint">道具已收入行囊。${btn('查看道具','manualInventory','','small secondary')}</p>`:''}${Object.keys(bonus).length&&!result.resourceReceipt?lootHtml(bonus):''}${result.bonusDiscarded?`<p class="hint">负重不足，${num(result.bonusDiscarded)} 额外资源未能带回。</p>`:''}${!items.length&&!Object.keys(bonus).length&&!result.bonusDiscarded&&!result.equipmentDrops?.length&&!result.equipmentDiscarded?'<p class="hint">本次未发现额外掉落，基础战利品照常获得。</p>':''}</div>`;
}
function campaignCityRulesHTML(n,info=Game.attackInfo(n.id,'occupy')){
  if(!Game.isCity(n))return '';
  return `<p class="notice city-campaign-rules">${n.openCity?'黄巾城市无需史诗解锁，备兵后可攻打。<br>':''}掠夺：仅与驻军交战，城防与义兵不启用；仓储保护 ${Math.max(0,40-S().tech.plunder*3)}% 资源，基础黄金不被掠夺，胜利不易主。<br>占领：城防启用，义兵 +${num(info.militia)}，当前民心 ${info.morale}；每次胜利降低 35，低于 0 时易主。每次占领胜利均缴获基础资源与黄金。<br>资源与黄金共用幸存部队负重，胜利入库允许爆仓；部队随后返城，不重复发奖。</p>`;
}
function campaignOwnedCityHTML(n){
  const returning=Game.allExpeditions().find(e=>e.node===n.id&&e.phase==='return');
  return `<div class="reward">✓ ${esc(n.name)}已纳入治下领地</div><p class="hint">${returning?'部队返城中 · '+clock(returning.end):'部队返城安排已完成。'} 本阶段记录城市归属，建设与内政仍在青溪主城进行。</p>${n.id==='fort'?'<p class="hint">首章占领目标已完成，第二章北境战线已开放。</p>':''}${btn('查看领地','classicTerritory','','small secondary')}`;
}
function campaignNodeDetails(n){
  const chapterBlocked=ChapterData.blocked(S(),n.id);if(chapterBlocked)return `<p class="notice">${esc(chapterBlocked)}</p>${btn('章节路线','taskTab','chapter','secondary')}`;
  const s=S(),owned=!!s.conquered[n.id],g=s.garrisons[n.id],raid=Game.attackInfo(n.id,'raid'),occupy=Game.attackInfo(n.id,'occupy'),cd=s.cooldowns[n.id]>Date.now();
  if(owned&&Game.isCity(n))return campaignOwnedCityHTML(n);
  if(owned&&n.wild)return `<div class="reward">✓ 已归属青溪城 · ${n.reward}</div>${g?`<p class="hint">${Game.general(g.general).name} · ${Game.totalArmy(g.army)} 人 · ${g.phase==='stationed'?'驻守中，耗粮翻倍':'返城中 · '+clock(g.end)}</p>${btn(g.phase==='stationed'?'召回驻军':'返城中','garrisonRecall',n.id,'secondary block',g.phase!=='stationed')}`:'<p class="hint">暂无驻军。召回不影响野地归属与产量加成。</p>'}${heritageGatherHTML(n.id)}${btn('放弃野地','wildAbandonAsk',n.id,'small danger block',!!g)}`;
  const busy=Game.allExpeditions().length>=s.buildings.drill||Game.allExpeditions().some(e=>e.node===n.id),blocked=cd||busy;
  return `${siegeIntelHTML(n)}<div class="campaign-options"><article><h4>${owned?'清剿残匪':'掠夺'}</h4><p class="hint">${Game.isCity(n)?`仅与驻军交战，城防和义兵不启用；仓储保护 ${Math.max(0,40-S().tech.plunder*3)}% 资源（基础保护为试玩值），基础黄金不被掠夺，胜利不易主。`:'夺取资源后返城，不改变归属，不获得产量加成。'}</p>${lootHtml(raid.loot)}<p class="hint">资源与黄金共用幸存士兵负重，可带民夫或辎重车运输；胜利入库允许爆仓，返城不二次发奖。</p>${btn(cd?'驻军恢复中':busy?(!s.buildings.drill?'需要校场':'派遣名额已用'):owned?'清剿残匪':'配兵掠夺','campaignDispatch',n.id+':raid','secondary block',blocked)}</article>${!owned?`<article><h4>占领</h4><p class="hint">${Game.isCity(n)?`城防启用，义兵 +${occupy.militia}；民心 ${occupy.morale}，每次胜利下降 35，低于 0 时易主。每次占领胜利均缴获资源与黄金，部队随后返城。`:n.wild?`取得领地和产量加成，默认驻扎，可勾选占领后返回。附属野地 ${Game.wildOwned()}/${s.buildings.hall}。`:'攻下任务据点，取得归属与对应奖励，部队返城。'}</p>${lootHtml(occupy.loot)}<div class="reward">${n.reward}</div>${btn(cd?'驻军恢复中':busy?'校场队伍已满':Game.attackBlocked(n.id,'occupy')?'野地名额已满':'配兵占领','campaignDispatch',n.id+':occupy','block',blocked||!!Game.attackBlocked(n.id,'occupy'))}</article>`:''}</div><p class="notice battle-drop-hint">${battleDropHint(n)}</p><p class="hint">${campaignMarchReferenceHTML(n)}${cd?' · 恢复 '+clock(s.cooldowns[n.id]):''}</p>`;
}
function territorySummary(){
  const s=S(),ids=Object.keys(s.conquered).filter(id=>Game.getNode(id)?.wild),cities=Game.nodes.filter(n=>Game.isCity(n)&&s.conquered[n.id]).map(n=>Game.getNode(n.id));
  const wild=`<section class="panel territory-panel"><div class="section-title"><h3>附属野地</h3><span class="badge">${ids.length} / ${s.buildings.hall}</span></div><p class="hint">官府每级增加 1 个名额。野地每天降 1 级，加成随等级变化。召回驻军保留加成，放弃野地释放名额并移除加成。</p>${ids.length?`<div class="territory-list">${ids.map(id=>{const n=Game.getNode(id),g=s.garrisons[id];return `<div class="territory-row"><div><strong>${n.name}</strong><p class="hint">${n.reward}${g?'<br>'+Game.general(g.general).name+' · '+Game.totalArmy(g.army)+' 人 · '+(g.phase==='stationed'?'驻守，耗粮 ×2':'返城 '+clock(g.end)):' · 暂无驻军'}</p></div><div>${g?btn(g.phase==='stationed'?'召回':'返城中','garrisonRecall',id,'small secondary',g.phase!=='stationed'):btn('放弃','wildAbandonAsk',id,'small secondary')}</div></div>`;}).join('')}</div>`:'<p class="hint">尚未占领野地。掠夺不会使用名额。</p>'}</section>`;
  return `${wild}<section class="panel territory-panel city-territory-panel"><div class="section-title"><h3>治下城市</h3><span class="badge">${cities.length} 座</span></div><p class="hint">城市归属单独记录，不占附属野地名额；建设与内政仍在青溪主城进行。</p>${cities.length?`<div class="territory-list">${cities.map(n=>`<div class="territory-row"><div><strong>${esc(n.name)}</strong><p class="hint">${n.openCity?'收复黄巾城市':'城池领地'} · ${n.level} 级 · (${n.x}, ${n.y})</p></div>${btn('查看','yellowCityView',n.id,'small secondary')}</div>`).join('')}</div>`:'<p class="hint">尚未攻占城市。占领战每次胜利降低 35 民心，低于 0 才纳入治下。</p>'}</section>`;
}
function campaignDispatchDefaults(nodeId){
  const s=S(),quickCapture=s.wildGenerals?.rumors?.some(r=>r.node===nodeId&&r.line==='wanderer'&&r.status==='active');
  return Object.fromEntries(Object.keys(Game.units).map(id=>[id,quickCapture?(id==='cavalry'?Math.min(30,s.army[id]):0):s.army[id]]));
}
function campaignDispatchModal(nodeId,mode){
  if(Game.landmarkVisible&&!Game.landmarkVisible(nodeId)){showModal('据点尚未开放','<p class="notice">先完成当前章节目标，再继续前往下一处据点。</p>',btn('章节路线','taskTab','chapter','secondary')+btn('关闭','close','','secondary'));return;}
  const n=Game.getNode(nodeId);if(!n)return;const blocked=Game.attackBlocked(nodeId,mode);if(blocked){showModal('无法出征',`<p class="notice">${esc(blocked)}</p>`,Game.isCity(n)&&!n.openCity?btn('查看史诗','taskTab','epic','secondary'):btn('关闭','close','','secondary'));return;}
  const available=S().generals.filter(id=>!HeritageSystem.roleOf(S(),id)&&!Game.generalBusy(id)),defaults=campaignDispatchDefaults(nodeId),quickCapture=S().wildGenerals?.rumors?.some(r=>r.node===nodeId&&r.line==='wanderer'&&r.status==='active');
  showModal('出征 · '+n.name,`<label class="label" for="dispatch-mode">出征目的</label><select id="dispatch-mode" aria-label="出征目的">${n.orderRoute?`<option value="occupy">讨伐 · ${n.fortification?'破城歼敌':'击败守军'}，获得军功</option>`:`<option value="raid" ${mode==='raid'?'selected':''} ${Game.attackBlocked(nodeId,'raid')?'disabled':''}>掠夺 · 抢资源后返城</option><option value="occupy" ${mode==='occupy'?'selected':''} ${Game.attackBlocked(nodeId,'occupy')?'disabled':''}>${n.orderRoute?'讨伐 · 破城歼敌，获得军功':'占领 · 取得领地或降低城池民心'}</option>`}</select>${n.wild?'<div id="dispatch-return-option" class="notice" hidden><label class="dispatch-return-label"><input id="dispatch-return" type="checkbox" aria-label="占领后返回">占领后返回</label><p class="hint">默认不勾选，胜利后驻扎，可采集或召回；勾选则返城，仍保留野地归属与产量加成；采集需要驻军。</p></div>':''}<div id="campaign-preview"></div>${wildPortraitDispatchHTML(n)}<div id="dispatch-storage-warning"></div><p class="label">主将 · 城守、军师、主将和驻守武将无法出征</p><select id="dispatch-general" aria-label="出征主将">${available.map(id=>`<option value="${id}">${Game.general(id).name} · Lv.${Game.general(id).level}</option>`).join('')}</select>${quickCapture?`<p class="notice">${defaults.cavalry?'已预选 '+num(defaults.cavalry)+' 名轻骑快速奔袭，其余兵种未选。':'城内尚无轻骑，当前未预选兵种；可先训练轻骑或自行配兵。'}你仍可调整人数或自由混编；行军时间按最慢兵种计算。</p>`:''}${Object.entries(Game.units).map(([id,u])=>`<div class="dispatch-unit"><div class="row">${u.name}<span>驻城 ${S().army[id]}</span></div><div class="slider-row"><input type="range" data-army-range="${id}" min="0" max="${S().army[id]}" value="${defaults[id]}" aria-label="${u.name}数量"><input type="number" data-army-number="${id}" min="0" max="${S().army[id]}" value="${defaults[id]}" aria-label="${u.name}数量"></div></div>`).join('')}<div id="campaign-march-preview" aria-live="polite"></div><div class="estimate" id="dispatch-estimate"></div>${!available.length?'<p class="notice">没有空闲主将，请先召回驻军或调整城内任职。</p>':''}<p class="hint">试玩伤兵规则：胜方有 35% 阵亡士兵作为伤兵归队，败方为 15%。</p>`,btn('取消','close','','secondary')+btn('开始行军','dispatch',nodeId,'',!available.length||!Game.totalArmy(S().army)));
  const select=document.getElementById('dispatch-mode');select.dataset.node=nodeId;
  updateCampaignPreview();
}
function updateCampaignPreview(){
  const select=document.getElementById('dispatch-mode');if(!select)return;
  const n=Game.getNode(select.dataset.node),mode=select.value,info=Game.attackInfo(n.id,mode),returnInput=document.getElementById('dispatch-return'),returnOption=document.getElementById('dispatch-return-option');
  if(returnOption)returnOption.hidden=mode!=='occupy';if(returnInput)returnInput.disabled=mode!=='occupy';
  document.getElementById('campaign-preview').innerHTML=`${n.orderRoute?warOrderIntelHTML(n):''}<div class="notice">${n.orderRoute?`军令讨伐：${n.fortification?'战胜守军并破城':'击败守军'}，不改变领地归属。`:mode==='raid'?'掠夺胜利后返城，不改变领地归属。'+(Game.isCity(n)?'基础黄金受保护，城防和义兵不启用。':''):n.wild?(returnInput?.checked?'占领胜利后部队返回城内，野地归属与产量加成保留。':'占领胜利后部队驻扎野地，耗粮翻倍，可开始采集或手动召回。'):Game.isCity(n)?'占领攻城启用城防与义兵；每次胜利降低 35 民心，低于 0 才易主。每次占领胜利均缴获基础资源和黄金，部队随后返城。':'占领胜利取得任务据点，部队返城。'}${n.orderRoute?'':siegeIntelHTML(n)}${info.siege&&!n.fortification?'<br>义兵 '+info.militia+' 人 · 民心 '+info.morale+' · 城防守军防御 +25%':''}</div><p class="label">目标可供缴获的基础资源与黄金 · 实际带回受负重限制</p>${lootHtml(info.loot)}<p class="hint">基础与额外资源、黄金共用负重；胜利入库允许爆仓，返回不重复发奖。</p><p class="hint battle-drop-hint">${battleDropHint(n)}</p>`;
  if(document.getElementById('dispatch-general').value)updateDispatch(n.id);else document.getElementById('dispatch-estimate').textContent='暂无可出征主将。';updateCampaignMarchPreview();
}
function battleOutcomeText(b,n){
  const r=b.result;if(n.orderRoute)return r.won?'军令讨伐成功，军功 +'+r.warOrder.points+'，部队返城。':'军令讨伐失利，未获得军功；整军后可重试。';if(!r.won)return '战斗失利，幸存部队返城。';
  if(r.mode==='raid')return '掠夺成功，未取得领地归属，部队返城。'+(Game.isCity(n)?'城池民怨增加 10（最高 100）。':'');
  if(r.claimed&&Game.isCity(n))return '占领成功 · '+n.name+'纳入治下，民心 '+r.moraleBefore+' → '+r.moraleAfter+'，资源与黄金已结算；部队返城。';
  if(r.claimed)return '占领成功 · '+n.reward+(n.wild?(r.stationed?' · 部队已驻扎野地。':r.returnAfterOccupy?' · 已选择占领后返回，部队返城；野地归属与产量加成保留。':''):'');
  if(r.moraleAfter!==null&&r.moraleAfter!==undefined)return '攻城获胜 · 民心 '+r.moraleBefore+' → '+r.moraleAfter+'，尚未易主；本次资源与黄金已结算，部队返城。';
  return '击退驻军，收获战利品。';
}
document.addEventListener('click',event=>{
  const el=event.target.closest('[data-action]');if(!el||el.disabled)return;
  if(el.dataset.action==='campaignDispatch'){const [id,mode]=el.dataset.id.split(':');if(Game.landmarkVisible&&!Game.landmarkVisible(id)){showModal('据点尚未开放','<p class="notice">先完成当前章节目标，再继续前往下一处据点。</p>',btn('章节路线','taskTab','chapter','secondary')+btn('关闭','close','','secondary'));return;}dispatchModal(id,mode);}
  if(el.dataset.action==='yellowCityView'){const n=Game.getNode(el.dataset.id);if(!n||!Game.isCity(n))return;modal.close();page='world';selectedNode=n.id;centerWorld(n.x,n.y);}
  if(el.dataset.action==='garrisonRecall'){if(actResult(Game.recallGarrison(el.dataset.id),'驻军已启程返城'))modal.close();}
  if(el.dataset.action==='wildAbandonAsk'){const id=el.dataset.id,n=Game.getNode(id);showModal('放弃野地？','<p class="sub">放弃 '+n.name+' 后，该野地的产量加成会移除，并释放 1 个附属野地名额。以后可以重新攻占。</p>',btn('保留','close','','secondary')+btn('确认放弃','wildAbandonConfirm',id,'danger'));}
  if(el.dataset.action==='wildAbandonConfirm'){if(actResult(Game.abandonWild(el.dataset.id),'已放弃野地'))modal.close();}
});
