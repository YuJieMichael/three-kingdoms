'use strict';
function cardDetails(content,label='详情',id=''){const key=id||String([...content].reduce((n,c)=>(Math.imul(n,31)+c.charCodeAt(0))|0,0));return `<details class="compact-details" data-ui-disclosure="card-${esc(label)}-${esc(key)}"><summary>${label}</summary>${content}</details>`;}
function taskIcon(route){return buildingIcon(({gift:'hall',research:'academy',army:'barracks',captives:'tavern',world:'drill',outer:'farm',defense:'wall',inner:'hall'})[route]||'hall','compact-card-icon');}
function upgradeTime(seconds){return `<p class="compact-time"><span aria-label="工期" title="工期">◷</span> ${duration(seconds)}</p>`;}
let shopCategory='全部',manualModalContext=null,governmentTab='comfort';
const constructionExperienceHTML=level=>`<p class="hint">完工奖励：城守经验 +${HeroSystem.constructionXp(level)} · 归完工时任职的城守。</p>`;
const manualLink=(key,label='查看手册')=>`<a href="${Game.manual.source[key]}" target="_blank" rel="noopener">${label}</a>`;
const recordDetails=row=>row?Object.entries({output:'调整后基础产量 /小时',capacity:'容量',workers:'所需劳动人口',population:'人口上限',limit:'规模'}).filter(([k])=>row[k]!==undefined).map(([k,label])=>`<div class="enemy-row"><span>${label}</span><strong>${num(k==='output'?row[k]*Game.economyOutputFactor:row[k])}</strong></div>`).join(''):'';
function manualCityScene(){return webCityScene();}
function autoUpgradeControls(){return `<div class="auto-upgrade-controls ${S().autoUpgrade?'is-running':''}"><button class="btn block ${S().autoUpgrade?'secondary':''}" data-action="manualAutoUpgrade" aria-pressed="${S().autoUpgrade}">${S().autoUpgrade?'停止自动升级':'开启自动升级'}</button><p class="auto-upgrade-status" data-auto-upgrade-status role="status">${Game.autoUpgradeStatus()}</p>${layoutFeatureOpen('automation')?`<div class="automation-shortcut">${btn('自动助手','automationOpen','','small secondary block')}</div>`:'<p class="hint">自动升级开局即可开启；自动助手在官府 3 级开放。</p>'}<details><summary>自动升级规则</summary><p class="hint">城内建筑与资源田一起升级，优先低等级。材料和前置满足时自动排入建造队。消耗图纸的 10 级升级需手动确认；页面运行时生效。</p></details></div>`;}
function manualInnerCityPage(){const s=S();return `<div class="page-head"><div><h2>${esc(activeCityMeta().name)} · 城内</h2><p class="sub">点击空地建造，点击建筑升级或办理城务。</p></div><span class="badge">官府 ${s.buildings.hall} 级 · 6×6 城坊</span></div><div class="layout city-command-layout"><div>${manualCityScene()}</div>${layoutCityToolsHTML()}</div>`;}
function manualCitySlotModal(site){
  showModal(`城内空地 · ${site+1}号`,`<p class="sub">选择建筑查看 1 级消耗。官府占 4 格，其余 32 格用于建设。</p><div class="plot-options">${Game.cityIds.filter(id=>id!=='hall').map(id=>{const b=Game.buildings[id],exists=S().cityLayout.includes(id),requirement=Game.buildingRequirements(id,1),disabled=!!requirement||exists&&!b.repeat;return `<button data-action="manualBuildPlan" data-id="${site}:${id}" ${disabled?'disabled':''}>${buildingIcon(id)}<strong>${b.name}</strong><small>${requirement|| (disabled?'本城已有':b.repeat?'可重复建设':b.tag)}</small></button>`;}).join('')}</div><p class="hint" style="margin-top:14px">${manualLink('buildings','建筑 1–10 级消耗表')}</p>`,btn('取消','close','','secondary'));manualModalContext=()=>manualCitySlotModal(site);
}
function manualBuildPlan(site,id){
  const requirement=Game.buildingRequirements(id,1);
  const b=Game.buildings[id],row=Game.buildRecord(id,1);showModal('建设 · '+b.name,`${buildingIcon(id,'building-detail-art')}<p class="compact-progress">0 → 1</p>${cardDetails(`<p class="sub">${b.desc}</p><div class="enemy-list">${recordDetails(row)}</div>`,'效果')}${costs(row.cost)}${resourceWaitHTML(row.cost)}${Game.buildingRuleText(id,1)?`<p class="hint">前置：${esc(Game.buildingRuleText(id,1))}</p>`:''}${requirement?`<p class="notice">${esc(requirement)}</p>`:''}${upgradeTime(Game.buildSeconds(id,1))}${cardDetails(constructionExperienceHTML(1),'完工奖励')}`,btn('重新选择','citySlot',String(site),'secondary')+btn('开始建设','manualBuild',site+':'+id,'',!!requirement||!Game.canPay(row.cost)||S().buildQueue.length>=Game.buildLimit()));manualModalContext=()=>manualBuildPlan(site,id);
}
const buildingFunctions={smith:['打造与强化装备','heroForge'],hall:['官府指令','citySettings'],academy:['研究科技','manualResearch'],inn:['寻访与招募','manualInn'],tavern:['帐下将领','manualHeroes'],barracks:['训练军队','manualArmy'],drill:['部队与出征','manualDrill'],market:['资源交易','manualMarket'],post:['城际运输','cityTransport'],warehouse:['仓储分配','manualStorage'],wall:['城防工事','manualDefense']};
function governmentNav(tab){return `<nav class="government-tabs" aria-label="官府指令分类">${[['comfort','安抚百姓'],['levy','征收物资'],['settings','任命与税率']].map(([id,name])=>btn(name,'governmentTab',id,`secondary ${tab===id?'active-order':''}`)).join('')}</nav>`;}
function governmentSummary(){return `<div class="government-summary"><span>人口 <b data-population>${num(S().population)} / ${num(Game.maxPop())}</b></span><span>民心 <b data-morale>${Math.round(S().morale)}</b></span><span>民怨 <b data-unrest>${Math.round(S().unrest)}</b></span></div>`;}
function civicEffectText(order){const e=order.effects,points=n=>Math.round(n*10)/10;return order.kind==='levy'?`民心 −20（${points(S().morale)} → ${points(Math.max(0,S().morale-20))}）`:order.id==='immigration'?`人口 +${num(e.population)}，不超过民房容量`:order.id==='sacrifice'?'8小时内抵挡一次天灾，下一次天赐收益翻倍':`民心 +${Game.manual.civic.comfort[order.id].morale} · 民怨 −${-Game.manual.civic.comfort[order.id].unrest}\n本次：民心 +${points(e.morale)} · 民怨 −${points(-e.unrest)}`;}
function civicCard(id){
  const order=Game.civicOrderPreview(id),available=id==='sacrifice'||!Game.manual.civic.comfort[id]?.unavailable;
  return `<article class="civic-card ${available?'':'civic-unavailable'}" data-civic-order="${id}"><h3>${esc(order.name)}</h3><p class="civic-effect" data-civic-effect>${civicEffectText(order)}</p>${available?`<p class="label">${order.kind==='levy'?'本次可入库':'本次消耗'}</p><div data-civic-amount>${order.kind==='levy'?lootHtml(order.reward):costs(order.cost)}</div><p class="hint civic-formula" data-civic-formula></p>`:''}<p class="civic-reason hint" data-civic-reason role="status">${esc(order.reason)}</p><button class="btn block ${order.kind==='levy'?'secondary':''}" data-action="civicExecute" data-id="${id}" ${order.enabled?'':'disabled'}>${available?order.name:'未开放'}</button></article>`;
}
function manualGovernmentModal(tab=governmentTab){
  if(!['comfort','levy','settings'].includes(tab))return;governmentTab=tab;
  if(tab==='settings'){cityTaxSettings();return;}
  const ids=tab==='comfort'?Object.keys(Game.manual.civic.comfort):Object.keys(Game.manual.civic.levyMultipliers).map(k=>'levy_'+k);
  showModal('官府 · 城务指令',`${governmentSummary()}${governmentNav(tab)}${governanceSummaryHTML()}<p class="notice">${tab==='comfort'?'赈灾、祈福、增丁共享 15 分钟冷却。':'征收五种资源共享 15 分钟冷却，每次民心减少 20；民心低于 20 时无法征收。'}安抚与征收的冷却互相独立，按真实时间计算。</p><div class="civic-grid ${tab==='levy'?'is-levy':''}">${ids.map(civicCard).join('')}</div><details class="government-rules"><summary>消耗与收益规则</summary><p class="hint">赈灾：粮食 = 人口；祈福：黄金 = 人口；增丁：粮食 = 人口 ×2，增加当前人口的 10%，至少 20 人。安抚计费人口最低 100。征粮 ×5、征木／石 ×3、征铁／金 ×2，按当前人口计算。上述具体比例、增丁人数和征收冷却为试玩设定；赈灾、祈福的民心／民怨变化与征收降低 20 民心采用手册。征收实际到账受仓储剩余容量限制，满仓时无法执行。</p>${manualLink('civic','4399 民心与征收手册')} · ${manualLink('civicCooldown','安抚冷却说明')}</details>`,btn('关闭','close','','secondary'));
  manualModalContext=manualGovernmentModal;refreshGovernmentQuotes();
}
function refreshGovernmentQuotes(){
  if(!modal.open||manualModalContext!==manualGovernmentModal)return;
  modalBody.querySelectorAll('[data-civic-order]').forEach(card=>{
    const order=Game.civicOrderPreview(card.dataset.civicOrder),button=card.querySelector('[data-action="civicExecute"]'),amount=card.querySelector('[data-civic-amount]'),formula=card.querySelector('[data-civic-formula]');
    button.disabled=!order.enabled;card.querySelector('[data-civic-effect]').textContent=civicEffectText(order);
    if(amount){const html=order.kind==='levy'?lootHtml(order.reward):costs(order.cost);if(amount.innerHTML!==html)amount.innerHTML=html;}
    if(formula)formula.textContent=order.kind==='levy'?`人口 ×${Game.manual.civic.levyMultipliers[order.id.slice(5)]} · 预计 ${num(order.requested)}${Object.values(order.reward)[0]<order.requested?'，仓储仅能容纳上方数量':''}`:'随人口计算 · 试玩消耗';
    card.querySelector('[data-civic-reason]').textContent=order.cooldownEnd>Date.now()&&(order.id==='sacrifice'||!Game.manual.civic.comfort[order.id]?.unavailable)?`${order.reason} · 剩余 ${duration((order.cooldownEnd-Date.now())/1000)}`:order.reason;
  });
}
function manualBuildingModal(arg){
  const site=String(arg).startsWith('site:')?Number(String(arg).slice(5)):Game.primarySite(arg),id=S().cityLayout[site],b=Game.buildings[id];if(!b)return;
  const level=S().cityLevels[site],requirement=Game.buildingRequirements(id,level+1),q=S().buildQueue.find(q=>q.site===site),row=Game.buildRecord(id,level),next=Game.buildRecord(id,level+1),fn=buildingFunctions[id];
  const extra={house:'人口需要时间增长，训练消耗空闲人口。',smith:'铁匠铺 1 / 3 / 6 级可打造普通 / 精良 / 珍稀装备，也可强化已有装备（试玩规则）。',workshop:'器械兵训练需要工匠作坊，并满足军营与科技条件。',stable:'轻骑与铁骑训练需要马厩，并满足军营与驾驭要求。',embassy:'鸿胪寺用于加入联盟与接纳援军，联盟联网系统尚未接入。',post:'驿站用于城际运输，可向治下其他城市运送资源，并查看去程和返程。',beacon:'烽火台用于来袭预警；可在「来袭与守城」查看当前敌军。',tavern:'每级提供一间房。初始两位将领保留，超出房间数时暂不能招募。',drill:'每级单支部队上限增加 1 万人；同时可派遣队伍数随等级增加。交战按队分别指挥。',wall:'城防参与正式守城；陷阱、滚木与落石为一次性消耗，箭塔与拒马可由修复技巧恢复。'};
  showModal(`${b.name} · ${level}级`,`${buildingIcon(id,'building-detail-art')}${cardDetails(`<p class="sub">${b.desc}</p><div class="enemy-list">${recordDetails(row)}</div>${webBuildingComparisonHTML(id)}${extra[id]?`<p class="hint">${extra[id]}</p>`:''}`,'效果与说明')}${fn?btn(fn[0],fn[1],'','secondary block'):''}<div class="divider"></div>${q?`<div class="notice">建设至 ${q.level} 级 · ${clock(q.end,q.start)}</div>${speedupQueueButton('build',q)}${btn('取消施工','manualCancelAsk','site:'+site,'small danger')}`:next?`${requirement?`<p class="notice">${esc(requirement)}</p>`:''}<p class="compact-progress">${level} → ${level+1}</p>${costs(next.cost)}${resourceWaitHTML(next.cost)}${Game.buildingRuleText(id,level+1)?`<p class="hint">前置：${esc(Game.buildingRuleText(id,level+1))}</p>`:''}${upgradeTime(Game.buildSeconds(id,level+1))}${cardDetails(`<div class="enemy-list">${recordDetails(next)}</div>${constructionExperienceHTML(level+1)}`,'升级效果')}`:'<div class="notice">普通城池最高 10 级。</div>'}<p class="hint">${manualLink('buildings','建筑数值来源')}</p>${!q&&id!=='hall'&&level?btn('拆除一级','manualDemolishAsk',String(site),'small danger'):''}`,btn('关闭','close','','secondary')+btn(q?'施工中':next?'升级':'已满级','manualUpgrade',String(site),'',!!requirement||!!q||!next||!Game.canPay(next?.cost||{})||S().buildQueue.length>=Game.buildLimit()));manualModalContext=()=>manualBuildingModal(arg);
}
function autoResearchControls(){return `<div class="auto-upgrade-controls ${S().autoResearch?'is-running':''}"><button class="btn block ${S().autoResearch?'secondary':''}" data-action="manualAutoResearch" aria-pressed="${S().autoResearch}">${S().autoResearch?'暂停自动研究':'开启自动研究'}</button><p class="auto-upgrade-status" data-auto-research-status role="status">${esc(Game.autoResearchStatus())}</p>${layoutFeatureOpen('automation')?`<div class="automation-shortcut">${btn('研究设置','automationOpen','','small secondary block')}</div>`:''}<details><summary>自动研究规则</summary><p class="hint">优先研究等级较低、前置满足且资源足够的科技；同级按下方列表顺序。研究优先级与资源保留可在挂机助手中设置。当前研究完成后接续，可随时暂停。开关随存档保存；页面运行时生效。离线只结算已开始的研究，不连续扣费；同时开启自动升级时，建设优先使用资源。</p></details></div>`;}
function manualResearchModal(){
  const q=S().researchQueue;
  showModal('书院 · 科技研究',`<p class="sub">发展生产、训练与战斗科技；研究技巧可以缩短后续研究工期。</p>${autoResearchControls()}${q?`<div class="queue">${Game.manual.technology[q.id].name} → ${q.level} 级 ${clock(q.end,q.start)}<p class="hint">${finishAt(q.end)}</p>${speedupQueueButton('research',q)}</div>`:''}<div class="manual-list">${Object.entries(Game.manual.technology).map(([id,t])=>{const max=S().tech[id]>=10,missing=max?'':Game.researchRequirements(id);return `<article data-guide-tech="${id}"><div class="section-title"><h3>${buildingIcon('academy','compact-card-icon')}${t.name}</h3><span class="badge">Lv.${S().tech[id]} /10</span></div>${cardDetails(`<p class="hint">${esc(t.desc)}</p>${['fortification','repair'].includes(id)?'<p class="hint">城防技术提升守城部队耐久；维修技术在正式守城结束后恢复部分受损的持久城防。</p>':''}`,'效果')}${max?'<p class="hint">科技已满级</p>':costs(Game.researchCost(id))+resourceWaitHTML(Game.researchCost(id))+upgradeTime(Game.researchSeconds(id))+(missing?`<p class="notice">缺少：${esc(missing)}</p>`:cardDetails(`<p class="hint">${esc(Game.researchRuleText(id)||'无')}</p>`,'前置',id))}${btn(max?'已满级':q?'研究中':missing?'未解锁':'研究','manualResearchStart',id,'small',!!q||max||!!missing||!Game.canPay(Game.researchCost(id)))}</article>`;}).join('')}</div>`,btn('关闭','close','','secondary'));
  manualModalContext=manualResearchModal;
}
function innInitialAttributeHTML(label,value){
 const tier=value>=80?['red','红','80及以上']:value>=70?['gold','金','70–79']:value>=60?['purple','紫','60–69']:value>=50?['blue','蓝','50–59']:['normal','普通','低于50'];
 return `<span class="inn-stat inn-stat-${tier[0]}" title="${esc('初始'+label+' '+value+' · '+tier[1]+'（'+tier[2]+'）')}"><strong>${num(value)}</strong><small>${tier[1]}</small></span>`;
}
function innRecruitmentTableHTML(){
 const s=S();if(!s.innCandidates.length)return '<p class="notice inn-empty">暂无候选将领，点击「免费寻访」寻找人才；需要至少 1 级客栈。</p>';
 return `<p class="hint inn-scroll-hint">窄屏可左右滑动比较属性，姓名与招募按钮保留在两侧。</p><div class="inn-table-scroll" tabindex="0" role="region" aria-label="招募候选属性表，可左右滚动"><table class="inn-recruitment-table"><caption>候选初始属性比较</caption><thead><tr><th scope="col" class="inn-name-cell">姓名</th><th scope="col">等级</th><th scope="col">初始勇武</th><th scope="col">初始统御</th><th scope="col">初始内政</th><th scope="col">初始智谋</th><th scope="col">统率</th><th scope="col">所需黄金</th><th scope="col" class="inn-action-cell">操作</th></tr></thead><tbody>${s.innCandidates.map(g=>{
  const reason=HeroSystem.wild.roomUsed(s)>=s.buildings.tavern?'房间已满':s.res.gold<g.price?'黄金不足':'';
  return `<tr><th scope="row" class="inn-name-cell"><div class="inn-candidate-name">${generalPortrait(g,'inn-candidate-portrait')}<strong>${esc(g.name)}</strong></div></th><td>Lv.${g.level}</td>${[['atk','勇武'],['def','统御'],['pol','内政'],['wis','智谋']].map(([key,label])=>`<td>${innInitialAttributeHTML(label,g[key])}</td>`).join('')}<td title="统率随候选等级：等级 ×10">${num(g.lead)}</td><td>${num(g.price)}</td><td class="inn-action-cell"><button class="btn small" data-action="manualRecruit" data-id="${esc(g.id)}" aria-label="${esc('招募'+g.name+'，需要'+g.price+'黄金'+(reason?'，'+reason:''))}" title="${esc(reason||'招募后加入帐下将领')}" ${reason?'disabled':''}>招募</button>${reason?`<small class="inn-recruit-reason">${reason}</small>`:''}</td></tr>`;
 }).join('')}</tbody></table></div>`;
}
function manualInnModal(){
 const s=S(),lw=Game.legendaryStatus();showModal('客栈 · 招贤',`${lw.scrolls.every(Boolean)&&lw.stage!=='done'&&!lw.siteActive?`<section class="notice legend-rumour legendary"><p>说书人拍案：「前夜有樵夫见荒野中青光冲天，古冢里似有刀鸣，名曰冷艳锯……」你怀中的刀谱微微发烫。</p>${btn('循着传闻寻去','heroLegendarySeek','','small')}</section>`:''}${LegendQuest.rumour(s)?`<section class="notice legend-rumour"><p>角落里一位背着铁锤的游方铸匠自斟自饮。他自称姓韩，是洛阳铁官旧匠韩铁的徒弟，董卓入京后一路南逃，似乎在等一位有十级铁匠铺的主公。</p>${btn('请他喝一壶（黄金 '+num(LegendQuest.C.clueGold)+'）','heroLegendSeek','','small secondary')}</section>`:''}${btn('铜钱黑市','copperMarket','','secondary block')}${btn('在野将领','wildGenerals','','secondary block')}<p class="sub">客栈 ${s.buildings.inn} 级 · 招贤馆房间 ${HeroSystem.wild.roomUsed(s)}/${s.buildings.tavern}（含俘将 ${HeroSystem.wild.heldCaptives(s)}） · 黄金 ${num(s.res.gold)}</p><p class="hint">候选人数随客栈等级增加。表中四项初始属性不含等级成长、加点或道具增益；统率随候选等级，为等级 ×10，不参与初始属性标色。</p>${btn('免费寻访','manualInnRefresh','','secondary block',s.buildings.inn<1)}<p class="inn-stat-legend" aria-label="初始属性标色边界"><span>初始属性：</span><span class="inn-stat-blue">蓝 50–59</span><span class="inn-stat-purple">紫 60–69</span><span class="inn-stat-gold">金 70–79</span><span class="inn-stat-red">红 80及以上</span><span>低于50为普通</span></p>${innRecruitmentTableHTML()}`,btn('关闭','close','','secondary'));
}
function manualDrillModal(){
  const e=S().expedition;showModal('校场 · 部队',`<p class="notice">校场 ${S().buildings.drill} 级 · 单队最多 ${num(Game.armyLimit())} 人，军旗可使一次出征上限增加 25%。最多同时派遣 ${S().buildings.drill} 队，交战按队分别指挥。</p><p class="label">城内部队 · 每小时耗粮 ${num(Game.upkeep(S().army))}</p><div class="enemy-list">${Object.entries(S().army).filter(([,n])=>n).map(([id,n])=>`<div class="enemy-row"><span>${troopPortrait(id,'unit-portrait-small')}${Game.units[id].name}</span><strong>${num(n)}</strong></div>`).join('')||'<p class="hint">暂无城内部队</p>'}</div>${e?`<div class="notice">在外：${esc(Game.general(e.general).name)} · ${Game.getNode(e.node).name} · ${Game.totalArmy(e.army)} 人<br>${e.phase==='battle'?'交战中':e.phase==='return'?'返城 '+clock(e.end):e.end<=Date.now()?'已抵达':clock(e.end)}</div>`:''}${Game.allExpeditions().length>1?'<p class="hint">全部在外队伍：</p>'+expeditionStrip():''}${territorySummary()}${btn('出征默认指令','tacticsModal','','secondary block')}`,btn('关闭','close','','secondary')+btn('前往天下','manualWorld'));
}
function manualMarketModal(){
 showModal('市场 · 资源交易',`<p class="notice">单次商队规模 ${num(S().buildings.market*100000)}，资源和黄金兑换比 1:1 为试玩价格。买入允许暂时超仓；单次数量按商队规模与黄金余额限制，超过上限时自动回填上限。</p><label class="label" for="market-resource">资源</label><select id="market-resource" aria-label="交易资源">${['food','wood','stone','iron'].map(k=>`<option value="${k}">${Game.resources[k].name}</option>`).join('')}</select><label class="label" for="market-mode">交易方向</label><select id="market-mode" aria-label="交易方向"><option value="buy">用黄金购买</option><option value="sell">卖出换黄金</option></select><p id="market-limit" class="notice" role="status"></p><label class="label" for="market-count">数量</label><input id="market-count" type="number" min="0" step="1" value="100" aria-label="交易数量">`,btn('关闭','close','','secondary')+btn('用黄金购买','manualTradeConfirm'));
 updateMarketTrade();
}
function updateMarketTrade(){
 const input=document.getElementById('market-count'),resource=document.getElementById('market-resource'),mode=document.getElementById('market-mode');if(!input||!resource||!mode)return;
 const buy=mode.value==='buy',q=Game.tradeQuote(resource.value,buy),count=Number(input.value),bounded=Number.isFinite(count)?Math.max(0,Math.min(q.limit,Math.floor(count))):0;
 input.max=q.limit;if(input.value!==''&&String(bounded)!==input.value)input.value=bounded;
 document.getElementById('market-limit').textContent=q.reason||`当前最多可${buy?'买入':'卖出'} ${num(q.limit)} · ${buy?'资源':'黄金'}仓储空位 ${num(q.room)} · 可用${buy?'黄金':'资源'} ${num(q.stock)}${q.warning?'。'+q.warning:''}`;
 const action=modalBody.querySelector('[data-action="manualTradeConfirm"]');action.textContent=buy?'用黄金购买':'卖出换黄金';action.disabled=q.limit<1||bounded<1||input.value==='';
}
for(const event of ['input','change'])document.addEventListener(event,e=>{if(['market-resource','market-mode','market-count'].includes(e.target.id))updateMarketTrade();});

function manualStorageModal(){showModal('仓库 · 分配容量',`<p class="sub">四项分配合计 100%。比例只分配仓库容量，资源田仍提供各自容量。</p><div class="manual-list">${['food','wood','stone','iron'].map(k=>`<label class="storage-row">${Game.resources[k].name}<input data-storage="${k}" type="number" min="0" max="100" value="${S().storageAllocation[k]}" aria-label="${Game.resources[k].name}仓储比例">% <span>当前容量 ${num(Game.capacity(k))}</span></label>`).join('')}</div>`,btn('关闭','close','','secondary')+btn('保存分配','manualStorageSave'));}
function manualDefenseModal(){
  showModal('城墙 · 防御工事',`<p class="notice">城防空间 ${num(Game.defenseUsed())} / ${num(Game.defenseCapacity())}（含在建和正在参战工事）。工事参与山匪来袭防御，消耗与损毁会记录在战报中。</p>${btn('来袭与守城','npcDefense','','secondary block')}${S().defenseQueue.map(q=>`<div class="queue">${Game.manual.defenses[q.id].name} ×${q.count} ${clock(q.end,q.start)}</div>`).join('')}<div class="manual-list">${Object.entries(Game.manual.defenses).map(([id,d])=>{const reason=Game.defenseRequirements(id);return `<article><h3>${d.name} · 已有 ${num(S().defenses[id])}</h3><p class="hint">城墙 ${d.wall}级${Object.entries(d.tech||{}).map(([k,v])=>' · '+Game.manual.technology[k].name+v+'级').join('')}<br>生命 ${d.hp} · 攻击 ${d.atk} · 防御 ${d.def} · 射程 ${d.range}<br>占用空间 ${d.area} · 基础工期 ${duration(d.time)}</p>${costs(d.cost)}${reason?`<p class="hint">需要 ${esc(reason)}</p>`:''}${btn('建设 1 个','manualDefenseBuild',id,'small',!!reason||!!S().defenseQueue.length||!Game.canPay(d.cost))}</article>`;}).join('')}</div>`,btn('关闭','close','','secondary'));manualModalContext=manualDefenseModal;
}
function enemyIntelHTML(n){
 const intel=Game.intel(n.id),precision=intel?.public?'exact':intel?.precision||(intel?.exact?'exact':intel?'bands':'unknown'),labels={exact:'精确侦察',bands:'数量区间',types:'仅知兵种',unknown:'未侦察'},types=intel?.public?Object.keys(n.army).filter(id=>n.army[id]>0):intel?.types||Object.keys(intel?.army||intel?.bands||{}).filter(id=>intel?.army?.[id]>0||intel?.bands?.[id]);
 const rows=types.map(id=>{const value=intel?.public?n.army[id]:intel?.army?.[id],band=intel?.bands?.[id]||(value&&typeof value==='object'?value:null),count=precision==='exact'&&typeof value==='number'?num(value):precision==='bands'&&band?num(band.min)+'–'+num(band.max):'未知';return `<div class="enemy-row"><span>${troopPortrait(id,'unit-portrait-small')}${Game.npcName(id,n)}${n.wild?' · '+Game.units[id].name:''}</span><strong>${count}</strong></div>`;}).join('');
 return `<div class="section-title"><span class="label">驻守敌军</span><span class="label">${intel?.public?'章节情报':labels[precision]||'未侦察'}</span></div><div class="enemy-list">${rows||'<p class="hint">暂无可用敌军情报。</p>'}</div>${intel?.public?'':btn(n.chapter===3&&!ChapterData.unlocked(S(),3)?'第三章尚未开启':'派斥候侦察','scoutPlan',n.id,'small secondary',S().army.scout<1||(n.chapter===3&&!ChapterData.unlocked(S(),3)))}<p class="hint" style="margin-top:10px">${intel?.public?'章节守军配置公开，可据此准备配兵。':'派出斥候实际行军；数量、侦察技术与对方反侦察共同决定情报精度。报告为侦察当时快照。'}${intel&&!intel.public?'<br>侦察于 '+new Date(intel.at).toLocaleTimeString('zh-CN')+(intel.expiresAt?' · 有效至 '+new Date(intel.expiresAt).toLocaleTimeString('zh-CN'):''):''}</p>`;
}
function originalManualShopPage(){
  const items=Game.manual.shop.filter(x=>!x.rewardOnly&&(x.effect||PlaytestConfig.unavailableShopItems)&&(shopCategory==='全部'||x.category===shopCategory)),owned=Game.manual.shop.filter(x=>S().inventory[x.id]>0),buffs=Object.entries(S().buffs).filter(([,b])=>b.end>Date.now());
  return `<div class="page-head"><div><h2>商城</h2><p class="sub">内政、军备与将领道具</p></div><span class="badge">试玩元宝 ${num(S().gems)}</span></div><div class="notice shop-intro"><strong>${Game.manual.shop.filter(x=>!x.rewardOnly).length} 种宝物 · ${Game.manual.shop.filter(x=>x.effect&&!x.rewardOnly).length} 种可用 · 元宝为试玩货币</strong><details><summary>宝物说明与参考资料</summary><p class="hint">包含 55 种手册宝物、18 种加速道具及 2 种金砖。价格为试玩值，元宝仅可领取，无充值。战斗胜利可掉落已接入的道具，高级道具更稀有；未开放的关联系统会标明。${manualLink('shop','4399 道具介绍')}</p></details></div><div class="shop-tools">${btn("铜钱黑市 · "+num(S().copper),"copperMarket","","secondary")}${btn('将领画像专柜','wildPortraitShop','','secondary')}${btn('领元宝 +1000','manualGems','','secondary',Date.now()-S().trialGiftAt<86400000)}${btn('背包 · 已持有 '+owned.length+' 种','manualInventory','','secondary')}</div>${buffs.length?`<section class="panel"><h3>生效中的道具</h3>${buffs.map(([key,b])=>`<p class="hint">${Game.manual.shop.find(x=>x.effect===b.effect)?.name||b.effect}${b.general?' · '+esc(Game.general(b.general).name):''} · ${clock(b.end)}</p>`).join('')}</section>`:''}<div class="shop-tabs" role="group" aria-label="商城分类">${['全部',...new Set(Game.manual.shop.filter(x=>!x.rewardOnly&&(x.effect||PlaytestConfig.unavailableShopItems)).map(x=>x.category))].map(c=>btn(c,'manualShopCategory',c,`small secondary ${shopCategory===c?'active-order':''}`)).join('')}</div><div class="shop-grid compact-shop-grid">${items.map(x=>`<article class="shop-card ${x.effect?'':'unavailable'}">${itemIcon(x)}<span class="label">${x.category}</span><h3><button class="shop-item-title" data-action="manualShopInfo" data-id="${x.id}" aria-label="查看${esc(x.name)}详情">${esc(x.name)}</button></h3><p class="hint">${esc(x.desc)}</p>${x.effect?`<p class="shop-drop-label">${x.price>=Game.manual.battleDrops.rarePrice?'战斗稀有掉落':'战斗胜利有机会掉落'}</p>`:''}${x.effect==='gold'?`<p class="hint">每日限购 ${RewardData.dailyBrickLimit} 块 · 今日剩余 ${Game.brickPurchaseRemaining(x.id)} 块<br>北京时间 05:00 重置</p>`:''}<div class="shop-price"><strong>${x.price} 元宝</strong><span class="label">试玩价 · 持有 ${S().inventory[x.id]||0}</span></div>${x.effect?btn(x.effect==='gold'&&Game.brickPurchaseRemaining(x.id)===0?'今日已售罄':'购买 ×1','manualBuy',x.id,'block',S().gems<x.price||(x.effect==='gold'&&Game.brickPurchaseRemaining(x.id)===0))+(x.effect==='speedup'?btn('选择加速任务','speedupPlan',x.id+'|','secondary block'):x.effect==='gold'?btn('兑换黄金','manualUsePlan',x.id,'secondary block',!(S().inventory[x.id]>0)):''):'<p class="unavailable-note">关联系统尚未接入 · 暂不出售</p>'}</article>`).join('')}</div>`;
}
function manualShopInfoModal(id){webShopInfoModal(id);}
function originalManualShopInfoModal(id){const item=Game.manual.shop.find(x=>x.id===id);if(!item)return;showModal('宝物 · '+esc(item.name),`<div class="shop-item-description">${itemIcon(item)}<p class="sub">${esc(item.category)} · 持有 ${num(S().inventory[id]||0)} 件</p><p class="hint">${esc(item.desc)}</p><p class="hint">${num(item.price)} 元宝 / 件 · 试玩价</p>${!item.effect?'<p class="notice">关联系统尚未接入，暂不能使用或购买。</p>':''}</div>`,btn('返回商城','close','','secondary')+(item.effect?btn('购买一件','manualBuy',id,'',S().gems<item.price):'')+((S().inventory[id]||0)>0&&item.effect?btn('使用道具','manualUsePlan',id,'secondary'):''));}
function manualInventoryModal(){inventoryGridModal();}
function manualUsePlan(id,selection={}){
 const focusedId=document.activeElement?.id,item=Game.manual.shop.find(x=>x.id===id);
 if(['jewelBox','equipmentBox'].includes(item?.effect)){onboardingBoxModal(id);return;}
 if(item?.effect==='equipmentMaterial'){heroEquipmentPageOpen();return;}
 if(item?.effect==='speedup'){speedupPlanModal(id);return;}
 if(item?.effect==='blueprint'){toast('建筑图纸在升至 10 级时自动扣除，请前往城内或城外选择建筑');return;}
 if(!item?.effect){toast('该宝物关联系统尚未接入');return;}
 if(!(S().inventory[id]>0)){toast('尚未持有该宝物，可通过商城购买或战斗掉落获取');manualInventoryModal();return;}
 const needsHero=['politics','valor','wisdom','tiger','heroReset'].includes(item.effect),hero=selection.hero??S().generals[0],quote=Game.itemUseQuote(id,1,hero),count=selection.count??1;
 const quantity=quote.batch?`<section class="item-use-quantity"><label class="label" for="item-use-count">使用数量</label><div class="item-quantity-controls">${btn('−','itemQuantity','minus','secondary')}<input id="item-use-count" data-item="${esc(id)}" type="number" min="1" max="${quote.max}" step="1" value="${esc(String(count))}" inputmode="numeric" aria-describedby="item-use-stock item-use-preview">${btn('＋','itemQuantity','plus','secondary')}${btn('全部','itemQuantity','all','secondary')}</div><p class="hint" id="item-use-stock">持有 ${num(quote.owned)} 个 · 本次最多 ${num(quote.max)} 个</p><p class="notice" id="item-use-preview" role="status" aria-live="polite"></p></section>`:'';
 showModal('使用 · '+esc(item.name),`${itemIcon(item)}<p class="sub">${esc(item.desc)}</p>${needsHero?`<label class="label" for="item-hero">选择将领</label><select id="item-hero">${S().generals.map(id=>`<option value="${id}" ${id===hero?'selected':''}>${esc(Game.general(id).name)}</option>`).join('')}</select>`:''}${quantity}${item.effect==='nobleBoost'?`<p class="notice">生效后 ${HeritageData.nobles[HeritageSystem.boostQuote(S(),id).rank].name} · 可招 ${HeritageSystem.recruitmentCap(HeritageSystem.boostQuote(S(),id).rank)} 级 · 爵位城池名额 ${HeritageData.nobles[HeritageSystem.boostQuote(S(),id).rank].city_count} 座</p>${quote.error?`<p class="notice">${esc(quote.error)}</p>`:''}`:''}${!quote.batch?'<p class="hint">持有 '+num(quote.owned)+' 个</p>':''}${['rename','banner'].includes(item.effect)?`<label class="label" for="item-text">${item.effect==='rename'?'新君主名称（最多 12 字）':'新旗号（最多 2 字）'}</label><input id="item-text" maxlength="${item.effect==='rename'?12:2}" value="${esc(selection.text||'')}" aria-label="新名称">`:''}${item.effect==='heroReset'?'<p class="notice">每 10 级需要 1 枚洗髓丹（向上取整）；只重置分配点数，保留等级和装备。</p>':''}${item.effect==='flag'?'<p class="notice">军旗用于下一次出征，成功派兵后消耗效果；未出征时保留 24 小时（试玩保留时限）。</p>':''}`,btn('返回背包','manualInventory','','secondary')+btn('确认使用','manualUse',id,'',!!quote.error));
 updateItemUsePreview();
 manualModalContext=()=>{if(!(S().inventory[id]>0)){manualInventoryModal();return;}manualUsePlan(id,{count:document.getElementById('item-use-count')?.value??1,hero:document.getElementById('item-hero')?.value,text:document.getElementById('item-text')?.value});};
 if(['item-use-count','item-hero','item-text'].includes(focusedId))document.getElementById(focusedId)?.focus({preventScroll:true});
}
function updateItemUsePreview(){
 const input=document.getElementById('item-use-count');if(!input)return;
 const quote=Game.itemUseQuote(input.dataset.item,Number(input.value),document.getElementById('item-hero')?.value),preview=document.getElementById('item-use-preview'),confirm=modalBody.querySelector('[data-action="manualUse"]');
 input.max=String(quote.max);input.setAttribute('aria-invalid',String(!!quote.error));
 const stock=document.getElementById('item-use-stock');if(stock)stock.textContent='持有 '+num(quote.owned)+' 个 · 本次最多 '+num(quote.max)+' 个';
 const pending=typeof OnlineClient!=='undefined'&&OnlineClient.pending();
 if(confirm){confirm.disabled=!!quote.error||pending;confirm.textContent=pending?'正在使用…':quote.error?'确认使用':'确认使用 ×'+num(quote.count);}
 if(preview)preview.textContent=quote.error||('消耗 '+num(quote.count)+' 个 · '+(quote.gold?'获得 '+num(quote.gold)+' 黄金（可暂时超仓）':quote.seconds?'增加持续时间 '+duration(quote.seconds):'补充人口 '+num(quote.population)));
 for(const control of modalBody.querySelectorAll('[data-action="itemQuantity"]'))control.disabled=pending||quote.max<1||(control.dataset.id==='minus'&&Number(input.value)<=1)||(control.dataset.id==='plus'&&Number(input.value)>=quote.max);
}
document.addEventListener('input',event=>{if(event.target.id==='item-use-count')updateItemUsePreview();});
document.addEventListener('change',event=>{if(event.target.id==='item-hero')updateItemUsePreview();});
document.addEventListener('click',event=>{
 const control=event.target.closest('[data-action="itemQuantity"]');if(!control||control.disabled)return;
 const input=document.getElementById('item-use-count');if(!input)return;
 const quote=Game.itemUseQuote(input.dataset.item,1,document.getElementById('item-hero')?.value),current=Number(input.value),base=Number.isSafeInteger(current)?current:1;
 input.value=String(Math.max(1,Math.min(quote.max,control.dataset.id==='all'?quote.max:base+(control.dataset.id==='plus'?1:-1))));updateItemUsePreview();
});

document.addEventListener('click',event=>{
  const el=event.target.closest('[data-action]');if(!el||el.disabled)return;const a=el.dataset.action,id=el.dataset.id;
  if(a==='governmentTab')manualGovernmentModal(id);
  if(a==='civicExecute'){
    const order=Game.civicOrderPreview(id),scroll=modal.scrollTop;
    if(actResult(Game.executeCivicOrder(id))){manualGovernmentModal();modal.scrollTop=scroll;toast(order.name+'已执行，城池状态已更新');}else refreshGovernmentQuotes();
  }
  if(a==='manualAutoUpgrade'){const enabled=!S().autoUpgrade;if(actResult(Game.setAutoUpgrade(enabled),enabled?'自动升级已开启':'自动升级已停止，已开工的工程继续完成')&&modal.open&&manualModalContext)manualModalContext();}
  if(a==='manualBuildPlan'){
const [site,b]=id.split(':');manualBuildPlan(Number(site),b);}
  if(a==='manualBuild'){const [site,b]=id.split(':');if(actResult(Game.queueBuilding(Number(site),b),'建设已开始'))modal.close();}
  if(a==='manualUpgrade'&&actResult(Game.upgrade(Number(id)),'升级已开始'))modal.close();
  if(a==='manualCancelAsk')showModal('取消施工？','<p class="sub">返还已支付资源的 66%，已记录的图纸返还 1 张。旧存档中没有费用记录的工程无法返还。'+(S().autoUpgrade?'取消施工会停止自动升级。':'')+'</p>',btn('继续建设','close','','secondary')+btn('确认取消','manualCancel',id,'danger'));
  if(a==='manualCancel'&&actResult(Game.cancelBuild(id),'已取消施工'))modal.close();
  if(a==='manualDemolishAsk')showModal('拆除一级？','<p class="sub">降低该建筑一级，返还该级费用的 50%（试玩值）。1 级建筑拆除后变为空地。'+(S().autoUpgrade?'拆除会停止自动升级。':'')+'</p>',btn('保留','close','','secondary')+btn('确认拆除','manualDemolish',id,'danger'));
  if(a==='manualDemolish'&&actResult(Game.demolish(Number(id)),'已拆除一级'))modal.close();
  if(a==='manualResearch')manualResearchModal();
  if(a==='manualAutoResearch'){const enabled=!S().autoResearch;if(actResult(Game.setAutoResearch(enabled),enabled?'自动研究已开启':'自动研究已暂停，当前研究继续完成'))manualResearchModal();}
  if(a==='manualResearchStart'&&actResult(Game.research(id),'科技研究已开始'))manualResearchModal();
  if(a==='manualInn')manualInnModal();
  if(a==='manualInnRefresh'&&actResult(Game.refreshInn(),'已寻访到新的将领'))manualInnModal();
  if(a==='manualRecruit'&&actResult(Game.recruit(id),'将领已加入帐下'))manualInnModal();
  if(['manualHeroes','manualArmy','manualWorld'].includes(a)){if(a==='manualHeroes')heroTab='roster';page={manualHeroes:'heroes',manualArmy:'army',manualWorld:'world'}[a];modal.close();render();}
  if(a==='manualDrill')manualDrillModal();
  if(a==='manualExpeditionBattle'){const error=Game.selectExpedition(id);if(!error){actResult(Game.startBattle());page='world';autoLast=Date.now();modal.close();render();}else toast(error);}
  if(a==='manualExpeditionRecall'){const error=Game.selectExpedition(id);if(error)toast(error);else showModal('召回部队','<p class="sub">取消行军，部队返回。已消耗的粮食不返还。</p>',btn('继续行军','close','','secondary')+btn('确认召回','recallConfirm'));}

  if(a==='manualMarket')manualMarketModal();
  if(a==='manualTradeConfirm'){const buy=document.getElementById('market-mode').value==='buy';actResult(Game.trade(document.getElementById('market-resource').value,Number(document.getElementById('market-count').value),buy),'交易完成');updateMarketTrade();}
  if(a==='manualStorage')manualStorageModal();
  if(a==='manualStorageSave'&&actResult(Game.setStorage(Object.fromEntries([...document.querySelectorAll('[data-storage]')].map(el=>[el.dataset.storage,Number(el.value)]))),'仓储分配已保存'))modal.close();
  if(a==='manualDefense')manualDefenseModal();
  if(a==='manualDefenseBuild'&&actResult(Game.buildDefense(id,1),'工事已加入建造队列'))manualDefenseModal();
  if(a==='manualScout')scoutPlanModal(id);
  if(a==='manualShopInfo')manualShopInfoModal(id);
  if(a==='manualShopCategory'){shopCategory=id;render();}
  if(a==='manualGems')actResult(Game.claimTrialGems(),'已领取 1,000 试玩元宝');
  if(a==='manualBuy')actResult(Game.buyItem(id),'道具已收入行囊');
  if(a==='manualInventory')manualInventoryModal();
  if(a==='inventoryShop'){shopCategory='全部';page='shop';modal.close();render();}
  if(a==='manualUsePlan')manualUsePlan(id);
  if(a==='manualUse'){
    const countInput=document.getElementById('item-use-count'),count=countInput?Number(countInput.value):1,hero=document.getElementById('item-hero')?.value,text=document.getElementById('item-text')?.value;
    const quote=Game.itemUseQuote(id,count,hero);if(quote.error){toast(quote.error);updateItemUsePreview();return;}
    el.disabled=true;
    const error=Game.useItem(id,hero,text,count);
    if(actResult(error,quote.batch?'已使用 '+num(count)+' 个道具'+(quote.gold?'，获得 '+num(quote.gold)+' 黄金':''):'道具已使用'))manualInventoryModal();
    else if(!OnlineClient.pending()){el.disabled=false;updateItemUsePreview();}
    else updateItemUsePreview();
  }
  if(a==='manualSpeed')showModal('试玩时间倍率',`<p class="sub">倍率加快人口增长与新建队列。资源生产、税收和军队耗粮按真实时间计算；基础产出已下调 30%。已经开始的工程保留预计完成时间。</p><p class="hint">道具持续时间、野地每日降级、离线累计上限按真实时间计算。</p>${[1,10,60].map(v=>btn('×'+v+(v===S().speed?' · 当前':''),'manualSetSpeed',String(v),'secondary block')).join('')}`,btn('关闭','close','','secondary'));
  if(a==='manualSetSpeed'&&actResult(Game.setSpeed(Number(id)),'试玩倍率已调整'))modal.close();
});
