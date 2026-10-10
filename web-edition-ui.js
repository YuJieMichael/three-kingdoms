'use strict';
// UI only. All inventory, quota and reward changes go through guarded Game actions.
function webAtlasSprite(texture,region,size,label,classes=''){
  const [x,y,w,h]=region;
  const clip='web-art-'+[...region,...size].join('-');
  return `<svg class="web-atlas-art ${classes}" viewBox="${x} ${y} ${w} ${h}" preserveAspectRatio="xMidYMax meet" role="img" aria-label="${esc(label)}"><defs><clipPath id="${clip}"><rect x="${x}" y="${y}" width="${w}" height="${h}"/></clipPath></defs><image href="${texture}" width="${size[0]}" height="${size[1]}" clip-path="url(#${clip})"/></svg>`;
}
function webTerrainArt(tile){
  if(tile.hidden)return '';
  if(tile.id==='home'||tile.type==='fort'||Game.isCity(tile))return webCityBuildingArt(tile.id==='home'||Game.isCity(tile)?'hall':'wall',3).replace('web-atlas-art','web-atlas-art web-terrain-art');
  const atlas=WebArt.terrain,key=(tile.type==='fort'?'camp':tile.type)+'_'+((landscapeSeed(tile.x,tile.y)%2)?'a':'b');
  const rect=atlas.regions[key]||atlas.regions.plain_a;
  const seed=landscapeSeed(tile.x,tile.y),style=`--terrain-offset:${(seed>>>4)%13-6}%;--terrain-scale:${(.87+(seed%24)/100).toFixed(2)}`;
  return webAtlasSprite(atlas.texture,rect,atlas.size,tile.name,'web-terrain-art').replace('viewBox=',`style="${style}" viewBox=`);
}
function webEmptyLandArt(index,locked=false){
  const atlas=WebArt.terrain,region=atlas.regions[index%2?'grass_a':'grass_b'];
  return `<span class="web-empty-land">${webAtlasSprite(atlas.texture,region,atlas.size,locked?'待开垦土地':'可建造空地')}<span class="web-build-sign">${locked?'待开垦':'建造 +'}</span></span>`;
}
function plotArt(type,level=1,index=0,working=false){
  if(!Object.hasOwn(Game.plotTypes,type))return webEmptyLandArt(index,type==='locked');
  return `<span class="web-resource-art">${buildingIcon(type,'web-resource-sprite')}${working?'<span class="web-build-sign">营造中</span>':''}</span>`;
}
function webWildRefreshHTML(){
  if(WebEdition.shared())return '<p class="outskirts-note">共享世界的野地与归属由服务器统一结算。</p>';
  const info=WildFields.view(S());
  return info.enabled?`<p class="outskirts-note">空闲野地每 30 分钟刷新 · 下次 ${new Date(info.nextAt).toLocaleTimeString('zh-CN',{hour:'2-digit',minute:'2-digit'})} · 已占领、采集和行军中的目标保留。</p>`:'';
}
function webCityBuildingArt(id,level){
  const atlas=WebArt.city,tiers=atlas.tiers[id],tier=tiers?.filter(t=>t.minLevel<=level).at(-1);
  if(tier){const source=atlas.tierSources.find(s=>s.texture===tier.texture);return webAtlasSprite(tier.texture,tier.region,source.size,Game.buildings[id].name);}
  const single=atlas.sprites?.find(s=>s.id===id);
  if(single){const source=atlas.sources.find(s=>s.texture===single.texture);return webAtlasSprite(single.texture,single.region,source.size,Game.buildings[id].name);}
  if(atlas.regions[id])return webAtlasSprite(atlas.texture,atlas.regions[id],atlas.size,Game.buildings[id].name);
  return cityBuildingArt(id);
}
function webPlotBenefitsHTML(index,type,level){
  const old=S().plots[index],next={type,level},oldWorkers=old.type?Game.buildRecord(old.type,old.level).workers:0;
  const needed=Game.buildRecord(type,level).workers,projectedWorkers=Game.workers()-oldWorkers+needed;
  const beforeLabor=Math.min(1,S().population/Math.max(1,Game.workers())),afterLabor=Math.min(1,S().population/Math.max(1,projectedWorkers));
  // Recalculate all existing fields under the projected labour ratio without mutating the city.
  const projected=Object.fromEntries(Object.keys(Game.plotTypes).map(t=>[Game.plotTypes[t].resource,0]));
  if(beforeLabor>0)S().plots.forEach((p,i)=>{if(p.type&&i!==index)projected[Game.plotTypes[p.type].resource]+=Game.plotYield(p)*60/beforeLabor*afterLabor;});
  const gain=beforeLabor>0?Game.plotYield(next)*60/beforeLabor*afterLabor:0;
  projected[Game.plotTypes[type].resource]+=gain;
  const current=Game.rates();
  const beforeFields=Object.fromEntries(Object.keys(Game.plotTypes).map(t=>[Game.plotTypes[t].resource,S().plots.filter(p=>p.type===t).reduce((sum,p)=>sum+Game.plotYield(p)*60,0)]));
  return `<section class="web-plot-preview"><h3>完工后的城池收益</h3><table><thead><tr><th>资源 / 时</th><th>当前净产</th><th>预计净产</th></tr></thead><tbody>${Object.entries(projected).map(([id,value])=>`<tr><th>${Game.resources[id].name}</th><td>${num(current[id]*60)}</td><td>${num(current[id]*60-beforeFields[id]+value)}</td></tr>`).join('')}</tbody></table><p>劳动人口：${num(Game.workers())} → ${num(projectedWorkers)} · 当前人口 ${num(S().population)}</p><p>这块地：${num(Game.plotYield(old)*60)} → ${num(gain)} / 时</p>${projectedWorkers>S().population?'<p class="notice">人口不足，所有资源田将一起降低劳动效率；可建设民房或安抚招徕人口。</p>':''}<p class="hint">按当前科技、民心、领地加成和驻军耗粮估算；完工时这些条件可能变化。仓储容量不会因建设资源田增加。</p></section>`;
}
function webBattleArmiesHTML(b,context){
  return `<div class="web-army-rosters">${['player','enemy'].map(side=>`<section class="web-army-roster ${side}"><h4>${side==='player'?'我军 · 逐队指挥':'敌军 · 守军阵容'}</h4><div>${b[side].map(r=>`<${side==='player'?'button':'article'} ${side==='player'?`data-action="${context.practice?'tacticalLessonSelect':'formationSelect'}" data-id="${r.id}"`:''} class="web-army-card ${r.hp<=0?'is-defeated':''}">${troopPortrait(r.id)}<strong>${Game.units[r.id].name}</strong><span>${num(Math.ceil(r.hp/r.stats.hp))} / ${num(r.initial)} 人</span><progress max="${r.maxHp}" value="${r.hp}" aria-label="${side==='player'?'我军':'敌军'}${Game.units[r.id].name}兵力"></progress><small>射程 ${r.stats.range} · 速度 ${r.stats.speed}</small></${side==='player'?'button':'article'}>`).join('')}</div></section>`).join('')}</div>`;
}
function webConquestReceiptHTML(b){
  if(!b.finished||WebEdition.shared())return '';
  const report=S().reports.find(r=>r.node===b.node&&r.general===b.general&&r.round===b.round),r=report?WebEdition.receipt(report):null;
  return r?`<p class="notice">首次占领补给：元宝 +${num(r.gems)} · ${esc(r.item.name)} ×1，已收入行囊。</p>`:'';
}
function webBattleReviewHTML(report,options={}){
  const review=BattleReview.battleReview(report,options);
  return `<section class="web-battle-review panel"><h3>${esc(review.title)}</h3><p class="hint">${esc(review.scope)}</p>${review.findings.map(f=>`<p><strong>${esc(f.label)}</strong> · ${esc(f.text)}</p>`).join('')}<details><summary>下次出征可以调整什么</summary>${review.actions.map(a=>`<p>${esc(a.label)}</p>`).join('')}</details></section>`;
}
function webCountyWelcomeHTML(b,node){
  if(!b.finished||!b.result?.claimed||!Game.isCity(node))return '';
  const city=Game.cityList().find(c=>c.node===node.id);if(!city)return '';
  return `<section class="web-county-welcome panel"><div class="web-county-flag">${esc(S().banner)}<span>归附</span></div><h3>${esc(node.name)}已归治下</h3><p>从经营一城，到治理新领地。新城拥有独立资源、人口和建造队；缴获资源在出发城，建设新城需要安排补给。</p>${btn('进入新城','webCityWelcome',city.id,'')}${btn('安排补给','cityTransport','','secondary')}${btn('整军与治疗','webReplenish','','secondary')}</section>`;
}
function webBuildingComparisonHTML(id){
  const row=WebPlanning.buildings(Game)[id];if(!row)return '';
  const candidates=[...(row.new?[{...row.new,label:'新建一座'}]:[]),...row.upgrades.filter(r=>r.targetLevel).map(r=>({...r,label:'升级 '+(r.site+1)+' 号至 '+r.targetLevel+' 级'}))];
  return `<details class="web-building-comparison"><summary>新建还是升级？${esc(row.capacityLabel)}对比</summary><p>当前 ${num(row.currentCapacity)} · ${esc(row.notice)}</p>${candidates.map(c=>`<article><strong>${esc(c.label)}</strong><p>${c.effectDelta===null?'施工中':`增加 ${num(c.effectDelta)} · 完工后 ${num(c.capacityAfter)}`} · ${duration(c.seconds)}</p>${costs(c.cost)}<p class="hint">${esc(c.reason||'满足条件')}</p>${btn('查看建设预览',c.level?'building':'manualBuildPlan',c.level?'site:'+c.site:c.site+':'+id,'small secondary',!!c.queue)}</article>`).join('')}</details>`;
}
let webRaidResource='food';
function webRaidModal(resource){
  const goal=GrowthGuide.model(Game),gaps=Object.entries(goal.cost||{}).filter(([id,cost])=>cost>S().res[id]).map(([id,cost])=>({id:'resource:'+id,missing:Math.ceil(cost-S().res[id])}));
  if(goal.kind==='trade'&&goal.amount>0)gaps.push({id:'resource:'+goal.id,missing:goal.amount});
  const view=WebPlanning.raids(Game,{gaps}, {now:Date.now(),shared:WebEdition.shared()});
  webRaidResource=resource||view.defaultResource;
  if(!view.supported){toast('掠夺推荐用于本机进度，共享目标请使用地图和侦察');return;}
  showModal('掠夺找资源',`<div class="shop-tabs">${view.resources.map(r=>btn(r.name+(r.gap?' · 缺 '+num(r.gap):''),'webRaidFind',r.id,'small secondary '+(r.id===webRaidResource?'active-order':''))).join('')}</div><p class="hint">${esc(view.referenceArmy.reason)}</p><div class="web-supply-cards">${view.lists[webRaidResource].map(n=>`<article class="panel">${webTerrainArt(Game.getNode(n.id))}<h3>${esc(n.name)}</h3><p>${n.level} 级 · 距本城 ${n.distance.toFixed(1)}</p>${n.rewardKnown?`<p>基础${Game.resources[webRaidResource].name} ${num(n.potential)}${n.carried!==null?' · 参考装载 '+num(n.carried):''}</p>`:'<p>资源数量尚未确定，需要精确侦察。</p>'}${btn(n.rewardKnown?'查看并配兵':'查看并侦察','webRaidNode',n.id,'block')}</article>`).join('')||'<p>暂无符合条件的目标；黄金可通过任务、征收和金砖获得。</p>'}</div>${view.notes.map(n=>`<p class="hint">${esc(n)}</p>`).join('')}`,btn('关闭','close','','secondary'));
}
function webFormationHTML(node,army,general,mode){
  const info=WebPlanning.formation(Game,node,army,general,mode,Date.now());
  return `<h4>阵容取舍</h4>${info.strengths.map(s=>`<p>${esc(s)}</p>`).join('')}${info.risks.map(s=>`<p class="notice">${esc(s)}</p>`).join('')}${info.suggestions.map(s=>`<p class="hint">${esc(s)}</p>`).join('')}<p class="hint">按当前可见情报分析，不预报胜率或战损。</p>`;
}
function webReplenishModal(){
  showModal('战后整备',`<p>战报记录当时损失；伤兵营显示当前仍待治疗的人数。先处理伤兵，再补充兵力，接着查看成长目标。</p><div class="settings-row">${btn('查看伤兵营','warCare','','block')}${btn('补兵训练','manualArmy','','block')}${btn('当前成长目标','guideRoute','','secondary block')}</div>`,btn('关闭','close','','secondary'));
}
function webBundleEntries(){
  return WebEdition.supplies().items.map(item=>({key:'bundle:'+item.id,kind:'bundle',id:item.id,name:item.name,count:item.count,category:'资源补给',item:{...item,desc:item.description}}));
}
function webBundleDetailHTML(entry){
  const item=WebEdition.supplies().items.find(i=>i.id===entry.id);
  return `<section class="bag-detail">${itemIcon(item)}<h3>${esc(item.name)}</h3><p>持有 ${num(item.count)} 包</p><p class="hint">${esc(item.description)}</p>${item.use.reason?`<p class="notice">${esc(item.use.reason)}</p>`:''}${btn('开启包裹','webSupplyOpenAsk',item.id,'block',!item.count)}${btn('查看军需商城','webSupplies','','secondary block')}</section>`;
}
function manualShopPage(){
  const items=Game.manual.shop.filter(x=>!x.rewardOnly&&(x.effect||PlaytestConfig.unavailableShopItems)&&(shopCategory==='全部'||x.category===shopCategory));
  return `<div class="page-head"><div><h2>珍宝商城</h2><p class="sub">选择宝物查看效果、持有数量与购买总价。</p></div><span class="badge">元宝 ${num(S().gems)}</span></div><div class="shop-tools">${btn('铜钱黑市','copperMarket','','secondary')}${btn('创新军需','webSupplies','','secondary',WebEdition.shared())}${btn('行囊','manualInventory','','secondary')}${btn('领元宝','manualGems','','secondary',Date.now()-S().trialGiftAt<86400000)}</div><div class="shop-tabs" role="group" aria-label="商城分类">${['全部',...new Set(Game.manual.shop.filter(x=>!x.rewardOnly&&(x.effect||PlaytestConfig.unavailableShopItems)).map(x=>x.category))].map(c=>btn(c,'manualShopCategory',c,`small secondary ${shopCategory===c?'active-order':''}`)).join('')}</div><div class="web-shop-shelves">${items.map(item=>`<button class="web-shop-item ${item.effect?'':'unavailable'}" data-action="manualShopInfo" data-id="${item.id}">${itemIcon(item)}<strong>${esc(item.name)}</strong><span>${item.price} 元宝</span><small>持有 ${num(S().inventory[item.id]||0)}${item.effect==='gold'?' · 今日可购 '+Game.brickPurchaseRemaining(item.id):''}</small></button>`).join('')}</div><p class="hint">售价为试玩数值；未接入系统的宝物可查看，暂不出售。战斗胜利有机会缴获已支持的道具。</p>`;
}
let webPurchaseId='';
function webShopInfoModal(id){
  const item=Game.manual.shop.find(x=>x.id===id);if(!item)return;
  webPurchaseId=id;
  const quota=Game.brickPurchaseRemaining(id),max=item.effect?Math.max(0,Math.min(99,quota??99,Math.floor(S().gems/item.price))):0;
  showModal('宝物 · '+esc(item.name),`<div class="web-item-detail">${itemIcon(item)}<div><p class="label">${esc(item.category)}</p><h3>${esc(item.name)}</h3><p>${esc(item.desc)}</p><p>持有 ${num(S().inventory[id]||0)} · 单价 ${num(item.price)} 元宝</p>${quota!==null?`<p>该金砖每日限购 ${RewardData.dailyBrickLimit} 块，今日剩余 ${quota}。</p>`:''}</div></div>${max?`<label for="web-shop-quantity">购买数量</label><input id="web-shop-quantity" type="number" min="1" max="${max}" value="1"><p id="web-shop-total">合计 ${num(item.price)} 元宝</p>`:`<p class="notice">${!item.effect?'此宝物对应功能暂未开放':quota===0?'今日限购份额已用完':'元宝不足'}</p>`}`,btn('返回商城','close','','secondary')+btn('确认购买','webShopBuy',id,'',!max)+((S().inventory[id]||0)>0&&item.effect?btn('使用宝物','manualUsePlan',id,'secondary'):''));
}
function webSupplyModal(){
  const view=WebEdition.supplies();
  showModal('创新军需',`<p class="sub">本机试玩设计，限购份额全城共用。包裹容量不足时不消耗。</p><section class="panel"><h3>${view.starter.name}</h3><p>${view.starter.description}</p>${view.starter.reason?`<p class="hint">${esc(view.starter.reason)}</p>`:''}${btn('领取工程补给','webStarter','','block',!!view.starter.reason)}</section><div class="web-supply-cards">${view.items.map(item=>`<article class="panel">${itemIcon(item)}<h3>${item.name}</h3><p>${item.description}</p><p>${item.price} 元宝 · 剩余限购 ${item.purchase.remaining} · 持有 ${item.count}</p>${btn('购买一包','webSupplyBuy',item.id,'',!!item.purchase.reason)}${btn('开启包裹','webSupplyOpenAsk',item.id,'secondary',!item.count)}</article>`).join('')}</div>`,btn('返回城池','close','','secondary'));
}
function webSupplyOpenModal(id){
  const item=WebEdition.supplies().items.find(i=>i.id===id);if(!item)return;
  showModal('开启 · '+item.name,`<p>${item.description}</p><p class="hint">开包前检查当前城池容量；道具入行囊后可自行选择队列使用。</p>${item.use.reason?`<p class="notice">${esc(item.use.reason)}</p>`:''}${item.use.targets.map(choice=>`${btn(choice.name,'webSupplyOpen',id+'|'+choice.id,'block',!!choice.reason)}${choice.reason?`<p class="hint">${esc(choice.reason)}</p>`:''}`).join('')}`,btn('返回军需','webSupplies','','secondary')+(!item.use.targets.length?btn('确认开启','webSupplyOpen',id,'',!!item.use.reason):''));
}
function webGrowthModal(){
  showModal('晋升材料筹备',`<p class="sub">占领黄巾营寨后可使用铜钱兑换。只展示下一次官职、爵位晋升所需材料；固定限额跨城共用，不按日刷新。</p><div class="web-supply-cards">${WebEdition.growth().map(row=>`<article class="panel"><h3>${esc(row.name)}</h3><p>铜钱 ${row.cost} · 剩余份额 ${row.remaining}</p>${row.required?`<p>本次需要 ${row.required} · 持有 ${row.owned}</p>`:''}<p class="hint">${esc(row.reason||'可兑换；试玩固定价格')}</p>${btn('兑换一枚','webGrowthBuy',row.id,'',!!row.reason)}</article>`).join('')}</div>`,btn('关闭','close','','secondary'));
}
function webConquestModal(){
  const view=WebEdition.conquest();
  showModal('征战补给模式',`<p class="sub">${view.enabled?'已开启':'未开启'} · 本机 PVE 可选玩法</p><p>真正取得野地／据点与城池归属后，首次占领奖励元宝和随机商城道具或军需包 ×1。</p><p>野地：3 + 等级 ×2 元宝；城池：20 + 等级 ×5 元宝。</p><p class="hint">只破城门、掠夺或削减民心不算占领。旧领地不补发，重复占领不再发放；暂停期间完成的占领也不会事后补领。</p><p>已领取 ${view.rewarded} 处 · 累计 ${num(view.earnedGems)} 元宝</p>${view.history.map(r=>`<p>${esc(r.name)} · +${r.gems} 元宝 · ${esc(r.itemName)}</p>`).join('')}<details><summary>查看随机道具池</summary><div class="web-drop-pool">${view.pool.map(r=>`<span>${esc(r.name)} · ${r.percent.toFixed(2)}%</span>`).join('')}</div></details>`,btn('关闭','close','','secondary')+btn(view.enabled?'暂停补给模式':'开启补给模式','webConquestToggle','','',WebEdition.shared()));
}
let webAudioEnabled=false,webAudioVolume=.35,webAudioTrack='';
try{webAudioEnabled=localStorage.getItem('shanhe-audio-enabled')==='true';const v=Number(localStorage.getItem('shanhe-audio-volume')??.35);if(Number.isFinite(v))webAudioVolume=Math.max(0,Math.min(1,v));}catch{}
const webMusic=new Audio();webMusic.loop=true;webMusic.preload='none';webMusic.volume=webAudioVolume;
function webUpdateMusic(){
  if(!webAudioEnabled||document.hidden){webMusic.pause();return;}
  const battle=Game.lessonInfo()?.battle||(document.querySelector('[data-web-battle]')||page==='battle'||page==='world'&&S().battle&&!S().battle.finished?S().battle:null);
  const track=battle&&!battle.finished?'battle':'city';
  if(track!==webAudioTrack){webAudioTrack=track;webMusic.src='assets/migrated/audio/'+track+'.mp3';}
  void webMusic.play().catch(()=>{});
}
function webAudioModal(){
  showModal('音乐设置',`<p>城内：Temple of the Manes<br>战斗：Five Armies</p><label for="web-volume">音量</label><input id="web-volume" type="range" min="0" max="100" value="${Math.round(webAudioVolume*100)}"><p class="hint">Kevin MacLeod（incompetech.com） · CC BY 4.0，完整曲目。<a href="assets/migrated/audio/CREDITS.txt" target="_blank" rel="noopener">曲目与授权</a></p>`,btn('关闭','close','','secondary')+btn(webAudioEnabled?'关闭音乐':'开启音乐','webAudioToggle'));
}
function webFinishOpening(){Game.endTacticalLesson();modal.close();page='city';render();guideGo();}
function webOpeningModal(){
  const error=Game.startTacticalLesson('opening_battle');if(error){toast(error);return;}
  tacticalLessonModal();
}
function webOpeningAuto(){
  if(modal.open||WebEdition.shared()||Game.lessonInfo()||S().stats.victories>0||S().onboarding.firstBattle==='complete'||S().battle||Game.allExpeditions().length)return;
  const key='shanhe-opening-v1';
  try{if(localStorage.getItem(key)==='seen')return;localStorage.setItem(key,'seen');}catch{return;}
  webOpeningModal();
}
function installWebEditionUI(){
const webMessages=[];
let webBattleWindowOpen=false,webClosedBattle=null,webCombatUntil=0,webCombatUnlock;
const webRenderedRounds=new WeakMap(),webFullBattlePage=battlePage;
battlePage=function(b=S().battle,context={}){
  if(!context.practice&&webBattleWindowOpen)return `<section class="panel"><h3>战场指挥窗口</h3><p>关闭窗口可以办理城务，部队不会因此撤退。</p>${btn('打开战场','webBattleWindow')}</section>`;
  const page=webFullBattlePage(b,context);
  // After 关闭战场 the battle continues here; offer the way back to the command window.
  return !context.practice&&b&&!b.finished?`<div class="notice web-battle-reopen">${btn('打开战场窗口','webBattleWindow','','small')}<span>战场窗口已关闭，部队仍在交战；也可以在这里继续指挥。</span></div>`+page:page;
};
function webLockCombatControls(){
  clearTimeout(webCombatUnlock);
  const delay=Math.max(0,webCombatUntil-performance.now());if(!delay)return;
  document.querySelectorAll('[data-action="battleRound"],[data-action="tacticalLessonRound"],[data-action="unitOrder"],[data-action="battleAllOrders"],[data-action="tacticalLessonOrder"],[data-action="tacticalLessonAllOrders"],[data-unit-target],[data-lesson-target]').forEach(el=>{if(!el.disabled){el.disabled=true;el.dataset.webAnimationLock='true';}});
  webCombatUnlock=setTimeout(()=>document.querySelectorAll('[data-web-animation-lock]').forEach(el=>{el.disabled=false;delete el.dataset.webAnimationLock;}),delay);
}
function webObserveCombat(b){
  const old=webRenderedRounds.get(b);webRenderedRounds.set(b,b.round);
  if(old!==undefined&&b.round>old&&b.currentRoundSummary?.events.length&&!window.matchMedia('(prefers-reduced-motion:reduce)').matches)webCombatUntil=performance.now()+1800;
  webLockCombatControls();
  // Keep the command bar under the dialog title; on phones show the new round's result after a tapped 下一回合, since it sits below the fold.
  const top=modal.querySelector('.modal-top'),bar=modalBody.querySelector('.battle-command-bar');
  modal.style.setProperty('--web-battle-top',(top?.offsetHeight||0)+'px');modal.style.setProperty('--web-battle-bar',(bar?.offsetHeight||0)+'px');
  if(old!==undefined&&b.round>old&&webScrollToRound&&window.matchMedia('(max-width:760px)').matches)modalBody.querySelector('.combat-round-summary')?.scrollIntoView({block:'start'});
  if(old!==undefined&&b.round>old)webScrollToRound=false;
}
let webScrollToRound=false;
document.addEventListener('click',event=>{if(event.target.closest('[data-action="battleRound"],[data-action="tacticalLessonRound"]'))webScrollToRound=true;},true);
function webPresentBattle(){
  const battle=S().battle;if(!battle){webBattleWindowOpen=false;if(modalBody.querySelector('[data-web-battle]'))modal.close();return;}
  showModal('战场指挥',`<div data-web-battle>${webFullBattlePage(battle)}</div>`,btn('返回城务','webBattleClose','','secondary'));
  webBattleWindowOpen=true;modal.classList.add('web-battle-dialog');startCombatFeedback();webObserveCombat(battle);
}
const webOriginalToast=toast;
toast=function(text){webMessages.unshift({at:Date.now(),text:String(text)});webMessages.splice(30);webOriginalToast(text);clearTimeout(toastTimer);toastTimer=setTimeout(()=>document.getElementById('toast').classList.remove('show'),5000);};
const webOriginalUpdateDispatch=updateDispatch;
updateDispatch=function(...args){
  webOriginalUpdateDispatch(...args);
  if(WebEdition.shared())return;
  const select=document.getElementById('dispatch-mode'),general=document.getElementById('dispatch-general')?.value,node=Game.getNode(select?.dataset.node||args[0]||selectedNode),estimate=document.getElementById('dispatch-estimate');
  if(!node||!general||!estimate)return;
  const holder=document.createElement('section');holder.className='web-formation-analysis';holder.innerHTML=webFormationHTML(node,dispatchArmy(),general,select?.value||'raid');estimate.append(holder);
};
const webOriginalRender=render;
render=function(){
  if(page!=='city'&&page!=='world')document.body.classList.remove('scene-focus');
  const battle=S().battle;
  if(battle&&!battle.finished&&battle!==webClosedBattle&&!modal.open)webBattleWindowOpen=true;
  webOriginalRender();
  webUpdateMusic();
  if(webBattleWindowOpen)webPresentBattle();
};
const webOriginalLessonModal=tacticalLessonModal;
tacticalLessonModal=function(){
  webOriginalLessonModal();
  const info=Game.lessonInfo();if(info?.battle.finished)modalBody.querySelector('.tactical-lesson-battle').insertAdjacentHTML('beforeend',webBattleReviewHTML(info.battle.result,{battle:info.battle,evidence:info.evidence,practice:true}));
  modal.classList.add('web-battle-dialog');
  if(Game.lessonInfo()?.id==='opening_battle')modalBody.querySelector('.modal-actions').innerHTML=btn('重试战斗','tacticalLessonRestart','opening_battle','secondary')+btn(Game.lessonInfo().battle.finished?'回城跟随指引':'跳过示范 · 回城','webOpeningDone');
  if(Game.lessonInfo()?.battle)webObserveCombat(Game.lessonInfo().battle);
  webUpdateMusic();
};
const webOriginalShowModal=showModal;
showModal=function(...args){if(webBattleWindowOpen&&!String(args[1]).includes('data-web-battle')){webBattleWindowOpen=false;webClosedBattle=S().battle;}modal.classList.remove('web-battle-dialog');webOriginalShowModal(...args);};
document.addEventListener('click',event=>{
  const el=event.target.closest('[data-action]');if(!el||el.disabled)return;
  const action=el.dataset.action,id=el.dataset.id;
  if(action==='webBattleWindow'){webClosedBattle=null;webBattleWindowOpen=true;webRenderedRounds.delete(S().battle);webScrollToRound=false;render();}
  if(action==='webBattleClose'){webBattleWindowOpen=false;webClosedBattle=S().battle;modal.close();render();}
  if(action==='webEditionHub')showModal('征战与成长',`<div class="settings-row">${btn('首战教学','webOpening','','block',WebEdition.shared())}${btn('工程与军需','webSupplies','','block',WebEdition.shared())}${btn('晋升材料筹备','webGrowth','','block',WebEdition.shared())}${btn('征战补给模式','webConquest','','block',WebEdition.shared())}${btn('战后整备','webReplenish','','secondary block')}</div><p class="hint">本机扩展用于自己的征战进度。共享世界的资源与行动由原在线服务处理。</p>`,btn('关闭','close','','secondary'));
  if(action==='webMessages')showModal('消息记录',webMessages.length?webMessages.map(m=>`<article><small>${new Date(m.at).toLocaleTimeString('zh-CN')}</small><p>${esc(m.text)}</p></article>`).join(''):'<p>暂无消息。</p>',btn('关闭','close','','secondary'));
  if(['importConfirm','resetFinal','onlineResume','onlineCreateShared','onlinePrivateImport','onlineLogout'].includes(action))webMessages.length=0;
  if(action==='webRaids')webRaidModal();
  if(action==='webRaidFind')webRaidModal(id);
  if(action==='webRaidNode'){modal.close();const node=Game.getNode(id);selectedNode=id;page='world';worldView={x:node.x,y:node.y};render();worldNodeModal(id);}
  if(action==='webCityWelcome'&&actResult(Game.switchCity(id))){modal.close();page='city';render();manualGovernmentModal();}
  if(action==='webReplenish')webReplenishModal();
  if(action==='webMapTactical'){webMapTactical=!webMapTactical;render();}
  if(action==='webOpening')tacticalLessonCatalog();
  if(action==='webOpeningDone')webFinishOpening();
  if(action==='webSupplies')webSupplyModal();
  if(action==='webGrowth')webGrowthModal();
  if(action==='webConquest')webConquestModal();
  if(action==='webAudio')webAudioModal();
  if(action==='webAudioToggle'){webAudioEnabled=!webAudioEnabled;try{localStorage.setItem('shanhe-audio-enabled',String(webAudioEnabled));}catch{}webUpdateMusic();webAudioModal();}
  if(action==='webShopBuy'){
    const amount=Number(document.getElementById('web-shop-quantity')?.value);
    if(!Number.isSafeInteger(amount)||amount<1){toast('请选择整数购买数量');return;}
    if(actResult(Game.buyItem(id,amount),'宝物已收入行囊'))webShopInfoModal(id);
  }
  if(action==='webStarter'&&actResult(Game.webEditionAction('supplies.claimStarter'),'工程补给已收入行囊'))webSupplyModal();
  if(action==='webSupplyBuy'&&actResult(Game.webEditionAction('supplies.buy',id,1),'军需包已收入行囊'))webSupplyModal();
  if(action==='webSupplyOpenAsk')webSupplyOpenModal(id);
  if(action==='webSupplyOpen'){
    const args=id.split('|');if(actResult(Game.webEditionAction('supplies.open',...args),'补给已收入当前城池和行囊'))webSupplyModal();
  }
  if(action==='webGrowthBuy'&&actResult(Game.webEditionAction('exchangeCopper',id),'晋升材料已收入行囊'))webGrowthModal();
  if(action==='webConquestToggle'&&actResult(Game.webEditionAction('conquest.setEnabled',!WebEdition.conquest().enabled)))webConquestModal();
  queueMicrotask(webUpdateMusic);
});
document.addEventListener('input',event=>{
  if(event.target.id==='web-shop-quantity'){
    const item=Game.manual.shop.find(i=>i.id===webPurchaseId),n=Number(event.target.value),max=Number(event.target.max);
    const valid=Number.isSafeInteger(n)&&n>=1&&n<=max;
    document.getElementById('web-shop-total').textContent=valid?'合计 '+num(item.price*n)+' 元宝':'请选择 1–'+max+' 的整数数量';
    modalBody.querySelector('[data-action="webShopBuy"]').disabled=!valid;
  }
  if(event.target.id==='web-volume'){webAudioVolume=Number(event.target.value)/100;webMusic.volume=webAudioVolume;try{localStorage.setItem('shanhe-audio-volume',String(webAudioVolume));}catch{}}
});
document.addEventListener('visibilitychange',webUpdateMusic);
let messageContext=String(OnlineClient.shared())+':'+(OnlineClient.status().user?.id||'local');
document.addEventListener('online-snapshot',()=>{const next=String(OnlineClient.shared())+':'+(OnlineClient.status().user?.id||'local');if(next!==messageContext){webMessages.length=0;messageContext=next;}webUpdateMusic();});
document.addEventListener('keydown',event=>{
  if(event.altKey||event.ctrlKey||event.metaKey||!['ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(event.key))return;
  const active=document.activeElement,board=active?.closest('.city-grid,.plot-grid');if(!board||active.tagName!=='BUTTON')return;
  const cells=[...board.querySelectorAll('button')],index=cells.indexOf(active),grid=board.classList.contains('scene-stage')?6:getComputedStyle(board).gridTemplateColumns.split(' ').length,step=({ArrowLeft:-1,ArrowRight:1,ArrowUp:-grid,ArrowDown:grid}[event.key]);
  let target=cells[index+step];
  if(board.classList.contains('scene-stage')||board.classList.contains('flat-building-grid')){
    const logical=Number(active.dataset.id.replace('site:','')),bySite=new Map(cells.map(c=>[Number(c.dataset.id.replace('site:','')),c]));
    target=null;
    for(let site=logical+step;site>=0&&site<(board.classList.contains('city-grid')?36:Game.unlockedPlots());site+=step){
      if(Math.abs(step)===1&&Math.floor(site/6)!==Math.floor(logical/6))break;
      if(bySite.has(site)){target=bySite.get(site);break;}
    }
  }
  if(target){event.preventDefault();target.focus();target.scrollIntoView({block:'nearest',inline:'nearest'});}
});
modal.addEventListener('close',()=>{
  // Browsers queue the close event; if the dialog was reopened meanwhile (battle start closes and reopens it), this close is stale.
  if(modal.open)return;
  if(webBattleWindowOpen){webBattleWindowOpen=false;webClosedBattle=S().battle;render();}
  if(Game.lessonInfo()?.id==='opening_battle')Game.endTacticalLesson();
  webUpdateMusic();
  queueMicrotask(()=>{if(!modal.open&&!Game.lessonInfo()&&S().battle&&!S().battle.finished&&S().battle!==webClosedBattle){webBattleWindowOpen=true;render();}else webOpeningAuto();});
});
const webInitialState=showInitialSaveState;
showInitialSaveState=function(){webInitialState();webOpeningAuto();};
}
