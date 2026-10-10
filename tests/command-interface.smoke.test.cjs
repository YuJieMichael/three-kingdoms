const {loadCompactUI}=require('./helpers/compact-ui.cjs');
const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const {loadGame,city,battle}=require('./helpers/game.cjs');
const root=path.join(__dirname,'..'),read=name=>fs.readFileSync(path.join(root,name),'utf8');
// UI fixtures retain the real game models and action guard without booting a browser.
function ui(){
 const e=loadGame(),g=e.Game;
 e.evaluate(`
  globalThis.uiListeners=[];globalThis.uiElements=new Map();globalThis.uiSelectors=new Map();
  document.addEventListener=(type,callback,capture)=>uiListeners.push({type,callback,capture});
  document.getElementById=id=>{if(!uiElements.has(id))uiElements.set(id,{innerHTML:'',textContent:'',open:false,scrollTop:0,dataset:{},classList:{add(){},remove(){}},querySelectorAll:()=>[],querySelector:()=>null,append(){},focus(){},showModal(){this.open=true;},close(){this.open=false;}});return uiElements.get(id);};
  document.createElement=()=>({dataset:{},style:{},setAttribute(){}});
  document.querySelector=selector=>uiSelectors.get(selector)||null;document.querySelectorAll=()=>[];
  document.body={classList:{contains:()=>false,add(){},remove(){}}};globalThis.Audio=class{};
  globalThis.setTimeout=()=>0;globalThis.clearTimeout=()=>{};
  globalThis.window={matchMedia:()=>({matches:false,addEventListener(){}})};
  globalThis.OnlineClient={shared:()=>false,status:()=>({busy:false}),pending:()=>false};
 `);
 loadCompactUI(e);const app=read('app.js');e.evaluate(app.slice(0,app.indexOf('// Original SVG')));
 e.evaluate(`
  globalThis.cityArea='inner';globalThis.manualModalContext=null;
  function cityPage(){return '<section data-city-page></section>';}function heroesPage(){return '';}function reportsPage(){return '';}function manualShopPage(){return '';}
  function worldPage(){return '';}function armyPage(){return '';}
  function activeCityMeta(){return Game.cityMeta(Game.currentCityId());}
  function citySwitchButtonHTML(){return '';}function onlineStatusHTML(){return '';}
  function npcDefenseNoticeHTML(){return '';}function resourceIcon(){return '';}
  function generalPortrait(){return '';}function troopPortrait(){return '';}
  function armyDeploymentHTML(){return '<section data-deployments></section>';}function cityLogisticsHTML(){return '';}function armyScoutHTML(){return '';}function captiveSummaryHTML(){return '';}
 `);
 for(const name of ['city-ui.js','named-city-ui.js','war-care-ui.js','governance-ui.js','mainline-ui.js','onboarding-ui.js','classic-ui.js','web-edition-ui.js','scene-ui.js','ink-map.js','layout-ui.js'])e.evaluate(read(name));
 const troopStart=app.indexOf('function troopDetailModal('),troopEnd=app.indexOf('function trainModal(');
 e.evaluate(app.slice(troopStart,troopEnd));
 return {...e,g};
}
function pressGuard(e,action){
 e.evaluate(`globalThis.guardResult={prevented:false,stopped:false};globalThis.guardElement={disabled:false,dataset:{action:${JSON.stringify(action)}}};uiListeners.find(x=>x.type==='click'&&x.capture===true).callback({target:{closest:()=>guardElement},preventDefault(){guardResult.prevented=true;},stopImmediatePropagation(){guardResult.stopped=true;}});`);
 return JSON.parse(e.evaluate('JSON.stringify(guardResult)'));
}
// v0.34.7 (7e75183, layout-ui.js layoutShell) replaced the five primary tabs and in-page 城池区域 tabs with an inner/outer/map scene
// switch plus a fixed command dock, moving shop/reports out of More into that dock; v0.34.8 (75e206d, layoutMoreModal) split More into
// 征战/城务/辅助 tabs and its README states the pinned shop, reports and settings are not repeated there.
test('scene switch and command dock keep city areas and reports/shop one tap away while More holds the remaining tools',()=>{
 const e=ui(),navOf=(source,label)=>source.match(new RegExp('<nav class="[^"]*" aria-label="'+label+'"[^>]*>([\\s\\S]*?)</nav>'))[1];
 // Shop is always present; the starting decree also exposes inventory immediately.
 const fresh=navOf(e.evaluate('classicShell()'),'常用功能');assert.deepEqual([...fresh.matchAll(/aria-label="([^"]+)"/g)].map(m=>m[1]),['任务','将领','军队','宝物','商城','更多']);
 delete e.g.state.inventory.labor;
 const emptyInventory=navOf(e.evaluate('classicShell()'),'常用功能');assert.deepEqual([...emptyInventory.matchAll(/aria-label="([^"]+)"/g)].map(m=>m[1]),['任务','将领','军队','商城','更多']);
 city(e.g,{hall:3});e.g.state.stats.victories=1;e.g.state.inventory.speed_build_15m=1;
 const before=JSON.stringify(e.g.state),html=e.evaluate('classicShell()'),nav=label=>navOf(html,label);
 const buttons=part=>[...part.matchAll(/<button data-action="([^"]*)" data-id="([^"]*)"[^>]*aria-label="([^"]+)"/g)].map(([,action,id,label])=>[label,action,id]);
 const scenes=nav('场景导航'),dock=nav('常用功能');
 assert.deepEqual(buttons(scenes),[['城内','classicNav','inner'],['城外','classicNav','outer'],['地图','classicNav','world']]);
 assert.match(scenes,/data-id="inner" class="active" aria-current="page"/,'the current city area is the active scene');
 assert.match(html,/<nav class="classic-primary layout-command-dock"/);
 assert.deepEqual(buttons(dock),[['任务','classicMission',''],['将领','classicNav','heroes'],['军队','classicNav','army'],['宝物','manualInventory',''],['商城','classicNav','shop'],['报告','classicNav','reports'],['营造','classicQueues',''],['更多','classicMore','']]);
 for(const action of ['classicQueues','manualInventory','classicMission'])assert.match(html,new RegExp('data-action="'+action+'"'));
 const more=JSON.parse(e.evaluate("JSON.stringify(LAYOUT_MORE_TABS.map(([id])=>{layoutSelectMoreCategory(id);return document.getElementById('modal-body').innerHTML;}))")).join('');
 for(const page of ['reports','shop']){assert.match(dock,new RegExp('data-action="classicNav" data-id="'+page+'"'));assert.doesNotMatch(more,new RegExp('data-action="classicNav" data-id="'+page+'"'));}
 for(const action of ['namedCities','governance','warCare'])assert.match(more,new RegExp('data-action="'+action+'"'));
 assert.equal(JSON.stringify(e.g.state),before,'navigation views must not change game progress');
});
// v0.34.7 (7e75183) moved the gift shortcut into the lord panel (layout-gift-button); the More entry lost "已领" in v0.34.2 (4ea959e)
// and became 新手补给 · claims/10 in v0.34.8 (75e206d).
test('all ten real gift claims hide the persistent shortcut but remain inspectable from More',()=>{
 const e=ui(),g=e.g;assert.match(e.evaluate('classicShell()'),/class="layout-gift-button" data-action="onboardingGifts"/);city(g,{hall:10});
 assert.equal(g.onboarding.claimAvailable(),null);assert.equal(g.state.onboarding.claims.length,10);
 const before=JSON.stringify(g.state);assert.equal(e.evaluate('classicGiftComplete()'),true);assert.doesNotMatch(e.evaluate('classicShell()'),/class="layout-gift-button"|data-action="onboardingGifts"/);
 e.evaluate('classicMoreModal()');assert.match(e.evaluate("document.getElementById('modal-body').innerHTML"),/data-action="onboardingGifts"[^>]*>新手补给 · 10\/10</);assert.equal(JSON.stringify(g.state),before);
});
test('tier-five pearls and coral show in the gift preview, the tier card and the objective; pre-v0.34.19 claims say they were not paid',()=>{
 const e=ui(),g=e.g,body=()=>e.evaluate("document.getElementById('modal-body').innerHTML"),card=(html,n)=>html.match(new RegExp('<article data-gift-level="'+n+'"[\\s\\S]*?</article>'))?.[0]||'';city(g,{hall:6});
 e.evaluate('onboardingGiftsModal()');let html=body();const preview=html.slice(html.indexOf('一键领取预览'),html.indexOf('gift-stages'));
 for(const part of [preview,card(html,5)]){assert.match(part,/珍珠 ×10/);assert.match(part,/珊瑚 ×5/);}for(const n of [4,6])assert.doesNotMatch(card(html,n),/珍珠|珊瑚/);
 for(let n=1;n<=4;n++)assert.equal(g.onboarding.claim(n),null);for(const x of g.missions)if(g.missionReady(x))assert.equal(g.claimMission(x.id),null);
 const m=e.evaluate('currentObjectiveModel()');assert.equal(m.growth.kind,'gift');assert.equal(Number(m.growth.id),5);assert.match(m.reward,/珍珠 ×10 · 珊瑚 ×5/);
 assert.equal(g.onboarding.claim(5),null);e.evaluate('onboardingGiftsModal()');html=card(body(),5);assert.match(html,/已领取/);assert.match(html,/珍珠 ×10/);assert.doesNotMatch(html,/不补发/);
 g.state.onboarding.jewelClaims=[];e.evaluate('onboardingGiftsModal()');html=card(body(),5);assert.match(html,/v0\.34\.19 前领取.*不补发/);assert.doesNotMatch(html,/珍珠 ×10/);
});
test('objective previews use current gift quotes and prioritize a genuinely claimable mission',()=>{
 const e=ui(),g=e.g,before=JSON.stringify(g.state),quote=g.onboarding.quote(g.state,1);let m=e.evaluate('currentObjectiveModel()');
 assert.equal(m.growth.kind,'gift');for(const [id,n] of Object.entries(quote.resources))assert.ok(m.reward.includes(g.resources[id].name+' '+n.toLocaleString('zh-CN')));
 for(const [id,n] of Object.entries(quote.items))assert.ok(m.reward.includes(g.manual.shop.find(i=>i.id===id).name+' ×'+n));assert.equal(JSON.stringify(g.state),before);
 assert.equal(g.onboarding.claim(1),null);const ready=g.currentMission();assert.equal(g.missionReady(ready),true);m=e.evaluate('currentObjectiveModel()');
 assert.equal(m.action,'mission');assert.equal(m.arg,ready.id);assert.match(m.reward,/声望 300/);e.evaluate('classicObjectivesModal()');assert.ok(e.evaluate("document.getElementById('modal-body').innerHTML").includes(ready.desc));for(const [id,n] of Object.entries(ready.reward).filter(([,n])=>n>0))assert.ok(m.reward.includes(g.resources[id].name+' '+n.toLocaleString('zh-CN')));
 assert.equal(g.claimMission(m.arg),null);assert.notEqual(e.evaluate('currentObjectiveModel().arg'),ready.id,'claimed rewards must leave the objective');
});
test('objective resource gaps and queue countdowns follow actual current state without modifying it',()=>{
 const e=ui(),g=e.g;g.state.plots[0]={type:'farm',level:1};assert.equal(g.onboarding.claim(1),null);assert.equal(g.claimReadyMissions(),null);g.state.res.food=0;
 let m=e.evaluate('currentObjectiveModel()');assert.equal(m.growth.kind,'building');const missing=m.growth.cost.food;
 assert.ok(m.status.includes('粮食 '+missing),'show the real missing amount');const before=JSON.stringify(g.state);e.evaluate('currentObjectiveHTML()');assert.equal(JSON.stringify(g.state),before);
 g.state.res.food=10000;assert.equal(g.queueBuilding(m.growth.site,m.growth.id),null);assert.equal(e.evaluate('currentObjectiveModel().growth.kind'),'queue');
 e.evaluate("uiSelectors.set('[data-objective-status]',{textContent:currentObjectiveModel().status})");const initial=e.evaluate("uiSelectors.get('[data-objective-status]').textContent");
 e.advance(1000);e.evaluate('refreshGuideUI()');const refreshed=e.evaluate("uiSelectors.get('[data-objective-status]').textContent");
 assert.notEqual(refreshed,initial);assert.equal(refreshed,e.evaluate('currentObjectiveModel().status'));
});
test('readonly guard admits new inspection actions while reward, training and hero mutations stay blocked',()=>{
 const e=ui(),g=e.g;g.releaseSaveSession();assert.equal(g.saveSessionInfo().writable,false);const before=JSON.stringify(g.state);
 for(const action of ['namedCities','namedCityMap','governance','warCare','warCareDoctrine','warCareOrderAll','classicMore','classicObjectives','troopDetail','heroTab','heroEquipment','heroPickEquipment','heroSkillAsk','heroSkillReview'])assert.deepEqual(pressGuard(e,action),{prevented:false,stopped:false},action);
 for(const action of ['namedCityDevelopment','governancePolicy','salaryPay','defeatedRecruit','warCareHeal','warCareHealAll','warCareAuto','warCareDoctrineSave','mission','onboardingClaimAll','train','heroAllocate','heroEquip','heroDrill','heroSkillTrain'])assert.deepEqual(pressGuard(e,action),{prevented:true,stopped:true},action);
 assert.equal(JSON.stringify(g.state),before);
});
test('readonly named-city, governance and hospital panels show real state while every new payment or policy action stays blocked',()=>{
 const e=ui(),g=e.g;
 assert.equal(e.evaluate("WarCare.admit(S(),'field:capital:'+Date.now()+':field',{archer:3},Date.now(),Game.units)"),null);
 const care=g.warCareQuote('archer',3),salary=g.salaryQuote();assert.equal(care.selected.archer,3);assert.ok(care.gold>0);g.releaseSaveSession();const before=JSON.stringify(g.state);
 e.evaluate('namedCityOverviewModal()');let html=e.evaluate("document.getElementById('modal-body').innerHTML");assert.ok(html.includes(g.getNode('yellow_qingshi').name));assert.match(html,/资源田最高 12 级/);assert.doesNotMatch(html,/洛阳都城|中原州城|北原郡城/);
 e.evaluate('governanceModal()');html=e.evaluate("document.getElementById('modal-body').innerHTML");assert.match(html,/将领薪俸/);assert.match(html,/data-action="governancePolicy"/);assert.match(html,/民心目标/);
 e.evaluate('warCareModal()');html=e.evaluate("document.getElementById('modal-body').innerHTML");assert.match(html,/待治 3 人/);assert.ok(html.includes('全部治疗需要 '+care.gold+' 黄金'));assert.match(html,/data-action="warCareHealAll"/);
 e.evaluate('defenseDoctrineModal()');html=e.evaluate("document.getElementById('modal-body').innerHTML");assert.match(html,/data-action="warCareDoctrineSave"/);assert.match(html,/本城守城战术/);
 const defense=JSON.parse(JSON.stringify(g.state.warCare.defense));defense.mode='inside';
 for(const result of [g.healWounded('archer',3,care.key),g.setAutoHeal(true),g.setDefenseDoctrine(defense),g.setGovernancePolicy('autoRelief',true),g.payHeroArrears('all',salary.key),g.claimNamedCityDevelopment('yellow_qingshi','stale')])assert.equal(result,g.saveSessionInfo().reason);
 assert.equal(JSON.stringify(g.state),before);assert.equal(g.validSave(g.state),true);
});
test('sidebar and home objectives preserve a stable key until visible task, resource-gap or queue information changes',()=>{
 const e=ui(),g=e.g;g.state.plots[0]={type:'farm',level:1};
 e.evaluate(`
  globalThis.objectiveNodes=new Map();
  const decodeObjectiveKey=html=>html.match(/data-objective-key="([^"]*)"/)[1].replace(/&quot;/g,'"').replace(/&#39;/g,"'").replace(/&lt;/g,'<').replace(/&gt;/g,'>').replace(/&amp;/g,'&');
  for(const [selector,html] of [['[data-sidebar-objective]',sidebarObjectiveHTML()],['[data-live-objective]',currentObjectiveHTML()]]){
   const node={dataset:{objectiveKey:decodeObjectiveKey(html)},html,replacements:0};
   Object.defineProperty(node,'outerHTML',{set(value){this.html=value;this.dataset.objectiveKey=decodeObjectiveKey(value);this.replacements++;}});objectiveNodes.set(selector,node);
  }
  document.querySelectorAll=selector=>objectiveNodes.has(selector)?[objectiveNodes.get(selector)]:[];
 `);
 const counts=()=>JSON.parse(e.evaluate('JSON.stringify([...objectiveNodes.values()].map(n=>n.replacements))'));
 let before=JSON.stringify(g.state);e.evaluate('refreshObjectiveUI();refreshObjectiveUI()');assert.deepEqual(counts(),[0,0]);assert.equal(JSON.stringify(g.state),before);
 g.state.res.wood++;before=JSON.stringify(g.state);e.evaluate('refreshObjectiveUI()');assert.deepEqual(counts(),[0,0],'irrelevant stock must not replace an unchanged objective');assert.equal(JSON.stringify(g.state),before);
 assert.equal(g.onboarding.claim(1),null);assert.equal(g.claimReadyMissions(),null);g.state.res.food=0;
 let m=e.evaluate('currentObjectiveModel()');assert.equal(m.growth.kind,'building');before=JSON.stringify(g.state);e.evaluate('refreshObjectiveUI();refreshObjectiveUI()');assert.deepEqual(counts(),[1,1]);assert.equal(JSON.stringify(g.state),before);assert.ok(e.evaluate("objectiveNodes.get('[data-sidebar-objective]').html").includes(m.status));
 g.state.res.food=m.growth.cost.food;before=JSON.stringify(g.state);e.evaluate('refreshObjectiveUI();refreshObjectiveUI()');assert.deepEqual(counts(),[2,2],'a resolved shortage updates both objectives even without a new task');assert.equal(JSON.stringify(g.state),before);
 m=e.evaluate('currentObjectiveModel()');assert.equal(g.queueBuilding(m.growth.site,m.growth.id),null);e.evaluate('refreshObjectiveUI()');assert.deepEqual(counts(),[3,3]);const initial=e.evaluate("objectiveNodes.get('[data-sidebar-objective]').html");
 e.advance(1000);before=JSON.stringify(g.state);e.evaluate('refreshObjectiveUI();refreshObjectiveUI()');assert.deepEqual(counts(),[4,4]);assert.notEqual(e.evaluate("objectiveNodes.get('[data-sidebar-objective]').html"),initial);assert.equal(e.evaluate("objectiveNodes.get('[data-sidebar-objective]').dataset.objectiveKey"),e.evaluate("objectiveNodes.get('[data-live-objective]').dataset.objectiveKey"));assert.equal(JSON.stringify(g.state),before);
});
test('readonly hero skill inspection shows real quotes and keeps money, merit and skills unchanged',()=>{
 const e=ui(),g=e.g;e.evaluate(read('hero-ui.js'));g.releaseSaveSession();const before=JSON.stringify(g.state);
 e.evaluate("heroSkillModal('su')");let body=e.evaluate("document.getElementById('modal-body').innerHTML");assert.match(body,/data-action="heroSkillReview"/);
 const route=e.evaluate('GeneralGrowth.routes[0].id');e.evaluate(`heroSkillReview('su',${JSON.stringify(route)})`);body=e.evaluate("document.getElementById('modal-body').innerHTML");
 assert.match(body,/data-action="heroSkillTrain"/);assert.equal(JSON.stringify(g.state),before);assert.deepEqual(pressGuard(e,'heroSkillTrain'),{prevented:true,stopped:true});
});
test('compact troop rows retain every available count and expose complete stats/costs through details',()=>{
 const e=ui(),g=e.g;g.state.army.archer=37;g.state.army.cavalry=11;const before=JSON.stringify(g.state),html=e.evaluate('armyPage()');
 assert.equal((html.match(/class="troop-roster-row"/g)||[]).length,Object.keys(g.units).length);assert.match(html,/<strong class="troop-available">37<small>可用/);
 for(const id of Object.keys(g.units)){assert.match(html,new RegExp('data-action="troopDetail" data-id="'+id+'"'));assert.match(html,new RegExp('data-action="trainModal" data-id="'+id+'"'));}
 e.evaluate("troopDetailModal('archer')");const detail=e.evaluate("document.getElementById('modal-body').innerHTML"),u=g.units.archer;
 for(const [label,key] of [['生命','hp'],['攻击','atk'],['防御','def'],['速度','speed'],['射程','range'],['负重','carry']])assert.ok(detail.includes(label+' '+u[key]));
 for(const [id,n] of Object.entries(u.cost))assert.ok(detail.replace(/<[^>]*>/g,'').includes(g.resources[id].name+' '+n.toLocaleString('zh-CN')));assert.match(detail,/data-action="trainModal" data-id="archer"/);assert.equal(JSON.stringify(g.state),before);
});
test('map disclosures retain target access while excluding future task landmarks',()=>{
 const e=ui(),g=e.g;e.evaluate(`function cityViewNode(n){return n;}function expeditionStrip(){return '';}function wildGeneralNodeHTML(){return '';}function cityMapActionsHTML(){return '';}function enemyIntelHTML(){return '';}function chapterWorldBanner(){return '';}function epicWorldBanner(){return '';}classicTargetActions=()=>'';`);e.evaluate(read('grid-world.js'));
 const before=JSON.stringify(g.state);let html=e.evaluate('worldPage()');
 for(const key of ['map-atlas','map-landmarks','map-yellow-cities','map-progress','target-intel-field'])assert.ok(html.includes('data-ui-disclosure="'+key+'"'));
 assert.match(html,/data-action="mapLandmark" data-id="field"/);assert.doesNotMatch(html,/data-action="mapLandmark" data-id="fort"/);assert.equal(JSON.stringify(g.state),before);
 g.state.raided.field=true;html=e.evaluate('worldPage()');assert.match(html,/data-action="mapLandmark" data-id="wood"/);assert.doesNotMatch(html,/data-action="mapLandmark" data-id="fort"/);
 e.evaluate('render=()=>{}');e.evaluate(`centerWorld(${g.home.x},${g.home.y})`);html=e.evaluate('worldPage()');
 assert.match(html,new RegExp('id="map-x"[^>]*value="'+g.home.x+'"'));assert.match(html,new RegExp('id="map-y"[^>]*value="'+g.home.y+'"'));
});
function orderMapUI(){const e=ui();e.evaluate(read('campaign-ui.js'));e.evaluate(read('war-orders-ui.js'));e.evaluate(`function expeditionStrip(){return '';}function wildGeneralNodeHTML(){return '';}function enemyIntelHTML(){return '';}function chapterWorldBanner(){return '';}function epicWorldBanner(){return '';}function combatRoundSummaryHTML(){return '';}render=()=>{};toast=()=>{};`);e.evaluate(read('grid-world.js'));return e;}
test('a finished military-order encounter remains a coordinate-free campaign target with real guard, rewards and recovery actions',()=>{
 const e=orderMapUI(),g=e.g,id='order_encounter_field_5_screen',army={archer:2000,shield:600,spear:800,cavalry:300};city(g,{hall:8,drill:10,house:10,barracks:10,academy:8,smith:8});g.state.conquered.north_keep=true;g.state.warOrders.cleared.field=g.state.warOrders.wins.field=5;Object.assign(g.state.army,army);g.state.res.food=1000000;
 const result=battle(e,id,'occupy',army);assert.equal(result.won,true);assert.equal(g.state.battle.finished,true);e.evaluate(`selectedNode=${JSON.stringify(id)};`);const before=JSON.stringify(g.state),center=e.evaluate('JSON.stringify(worldView)');let html=e.evaluate('worldPage()');
 assert.match(html,/军令战场 · 野战破阵 · 第 5 阶战术遭遇/);assert.match(html,/普通胜利：军功/);assert.match(html,/军令战术遭遇预览/);assert.match(html,/整军剩余/);assert.match(html,new RegExp('data-action="campaignDispatch" data-id="'+id+':occupy"[^>]*disabled'));
 for(const unit of Object.keys(g.getNode(id).army))assert.ok(html.includes(g.units[unit].name));assert.doesNotMatch(html,/undefined|NaN|配兵掠夺|配兵占领|占领、掠夺与掉落规则|:raid"/);assert.equal(e.evaluate('JSON.stringify(worldView)'),center);assert.equal(JSON.stringify(g.state),before);
 e.evaluate(`worldNodeModal(${JSON.stringify(id)})`);html=e.evaluate("document.getElementById('modal-body').innerHTML");assert.match(html,/军令战场/);assert.match(html,/守军阵容/);assert.match(html,/整军/);assert.doesNotMatch(html,/undefined|NaN|坐标|:raid"|配兵占领/);assert.equal(JSON.stringify(g.state),before);
 e.advance(g.warOrders.RECOVERY+1);html=e.evaluate(`classicTargetActions(Game.getNode(${JSON.stringify(id)}))`);assert.match(html,new RegExp('data-action="campaignDispatch" data-id="'+id+':occupy"[^>]*>配兵讨伐'));assert.doesNotMatch(html,/配兵掠夺|配兵占领|:raid"/);
});
test('military-order landmark and minimap paths preserve real map bounds while ordinary and hidden landmarks retain their guards',()=>{
 const e=orderMapUI(),g=e.g,id='order_siege_5',center=e.evaluate('JSON.stringify(worldView)');e.evaluate(`globalThis.mapClick={target:{closest:selector=>selector==='[data-action]'?{disabled:false,dataset:{action:'mapLandmark',id:${JSON.stringify(id)}}}:null},preventDefault(){},stopImmediatePropagation(){}};uiListeners.filter(x=>x.type==='click').forEach(x=>x.callback(mapClick));`);assert.equal(e.evaluate('selectedNode'),id);assert.equal(e.evaluate('JSON.stringify(worldView)'),center);
 e.evaluate('centerWorld(undefined,undefined);centerWorld(NaN,12)');assert.equal(e.evaluate('JSON.stringify(worldView)'),center);e.evaluate(`globalThis.canvasCoordinates=[];document.getElementById('world-minimap').width=192;document.getElementById('world-minimap').getContext=()=>({fillRect(...args){canvasCoordinates.push(args)},strokeRect(...args){canvasCoordinates.push(args)}});drawWorldMiniMap();`);assert.equal(e.evaluate('canvasCoordinates.every(args=>args.every(Number.isFinite))'),true);
 e.evaluate(`worldNodeModal(${JSON.stringify(id)})`);let html=e.evaluate("document.getElementById('modal-body').innerHTML");assert.match(html,/军令战场 · 攻坚拔寨 · 第 5 阶/);assert.match(html,/营寨门墙|重垒门墙/);assert.match(html,/北境大营/);assert.doesNotMatch(html,/undefined|NaN|:raid"|坐标/);
 e.evaluate(`mapClick.target.closest=selector=>selector==='[data-action]'?{disabled:false,dataset:{action:'mapLandmark',id:'fort'}}:null;uiListeners.filter(x=>x.type==='click').forEach(x=>x.callback(mapClick));`);assert.equal(e.evaluate('selectedNode'),id);assert.equal(e.evaluate('JSON.stringify(worldView)'),center);
 e.evaluate(`mapClick.target.closest=selector=>selector==='[data-action]'?{disabled:false,dataset:{action:'mapLandmark',id:'field'}}:null;uiListeners.filter(x=>x.type==='click').forEach(x=>x.callback(mapClick));`);assert.equal(e.evaluate('selectedNode'),'field');assert.deepEqual(JSON.parse(e.evaluate('JSON.stringify(worldView)')),{x:g.getNode('field').x,y:g.getNode('field').y});
});
test('target folds keep valid nested details while actions and real marching references stay outside',()=>{
 const e=ui(),g=e.g;e.evaluate(read('campaign-ui.js'));const before=JSON.stringify(g.state),html=e.evaluate("classicTargetActions(Game.getNode('field'))");
 let depth=0;for(const [tag] of html.matchAll(/<\/?details\b[^>]*>/g)){depth+=tag.startsWith('</')?-1:1;assert.ok(depth>=0,'closing details must match an opening');}assert.equal(depth,0);
 const fold=html.indexOf('<details class="target-brief-rules"'),lastClose=html.lastIndexOf('</details>'),march=html.indexOf('class="hint target-time"');
 assert.ok(html.indexOf('data-action="campaignDispatch"')<fold);assert.ok(march>lastClose);assert.match(html,/弓兵参考/);assert.match(html,/纯骑兵/);assert.match(html,/混编按最慢兵种行军/);assert.equal(JSON.stringify(g.state),before);
});
test('all cache-versioned browser resources exist locally and use the release version',()=>{
 const index=read('index.html'),version=JSON.parse(read('package.json')).version,resources=[...index.matchAll(/(?:src|href)="([^"?]+)\?v=([^"&]+)"/g)];assert.ok(resources.length>60);
 for(const [,file,v] of resources){assert.equal(v,version,file);assert.equal(fs.existsSync(path.join(root,file)),true,file);}
 for(const file of ['command-ui.css','map-command.css','hero-command.css','battle-command.css'])assert.ok(resources.some(([,p])=>p===file));
});

test('selecting a folded formation opens its controls before render persists disclosure preferences',()=>{
 const e=ui(),before=JSON.stringify(e.g.state);
 e.evaluate(`globalThis.foldedUnits=[{dataset:{uiDisclosure:'battle-unit-spear'},open:false},{dataset:{uiDisclosure:'battle-unit-archer'},open:false}];document.querySelectorAll=()=>foldedUnits;`);
 for(const action of ['formationSelect','tacticalLessonSelect']){e.evaluate(`foldedUnits.forEach((d,i)=>{d.open=false;d.dataset.uiDisclosure='battle-unit-'+(${JSON.stringify(action)}==='tacticalLessonSelect'?'lesson-':'')+(i?'archer':'spear');});globalThis.selectEvent={target:{closest:()=>({disabled:false,dataset:{action:${JSON.stringify(action)},id:'spear'}})},preventDefault(){},stopImmediatePropagation(){}};uiListeners.filter(x=>x.type==='click'&&x.capture===true).forEach(x=>x.callback(selectEvent));`);assert.equal(e.evaluate('foldedUnits[0].open'),true);assert.equal(e.evaluate('foldedUnits[1].open'),false);}
 assert.equal(JSON.stringify(e.g.state),before);
});

test('the shop is open in a fresh hall-one city and an existing empty-inventory save without changing game state',()=>{
 const e=ui(),g=e.g;
 e.evaluate(read('playtest-config.js'));
 e.evaluate("var shopCategory='全部';function itemIcon(){return '';}");
 assert.equal(g.state.buildings.hall,1);
 for(const inventory of [{labor:1},{}]){
  g.state.inventory=inventory;
  const before=JSON.stringify(g.state);
  assert.equal(e.evaluate("layoutFeatureOpen('shop')"),true);
  assert.match(e.evaluate('classicShell()'),/data-action="classicNav" data-id="shop"[^>]*aria-label="商城"/);
  assert.match(e.evaluate('manualShopPage()'),/珍宝商城/);
  assert.equal(JSON.stringify(g.state),before);
 }
});
