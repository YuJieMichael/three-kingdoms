const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const {loadGame,city,battle}=require('./helpers/game.cjs');
const root=path.join(__dirname,'..'),read=name=>fs.readFileSync(path.join(root,name),'utf8');
// UI fixtures retain the real game models and action guard without booting a browser.
function ui(){
 const e=loadGame(),g=e.Game;
 e.evaluate(`
  globalThis.uiListeners=[];globalThis.uiElements=new Map();globalThis.uiSelectors=new Map();
  document.addEventListener=(type,callback,capture)=>uiListeners.push({type,callback,capture});
  document.getElementById=id=>{if(!uiElements.has(id))uiElements.set(id,{innerHTML:'',textContent:'',open:false,scrollTop:0,dataset:{},classList:{add(){},remove(){}},querySelectorAll:()=>[],querySelector:()=>null,append(){},showModal(){this.open=true;},close(){this.open=false;}});return uiElements.get(id);};
  document.createElement=()=>({dataset:{},style:{},setAttribute(){}});
  document.querySelector=selector=>uiSelectors.get(selector)||null;document.querySelectorAll=()=>[];
  globalThis.setTimeout=()=>0;globalThis.clearTimeout=()=>{};
  globalThis.window={matchMedia:()=>({matches:false,addEventListener(){}})};
  globalThis.OnlineClient={shared:()=>false,status:()=>({busy:false}),pending:()=>false};
 `);
 const app=read('app.js');e.evaluate(app.slice(0,app.indexOf('// Original SVG')));
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
 for(const name of ['city-ui.js','mainline-ui.js','onboarding-ui.js','classic-ui.js'])e.evaluate(read(name));
 const troopStart=app.indexOf('function troopDetailModal('),troopEnd=app.indexOf('function trainModal(');
 e.evaluate(app.slice(troopStart,troopEnd));
 return {...e,g};
}
function pressGuard(e,action){
 e.evaluate(`globalThis.guardResult={prevented:false,stopped:false};globalThis.guardElement={disabled:false,dataset:{action:${JSON.stringify(action)}}};uiListeners.find(x=>x.type==='click'&&x.capture===true).callback({target:{closest:()=>guardElement},preventDefault(){guardResult.prevented=true;},stopImmediatePropagation(){guardResult.stopped=true;}});`);
 return JSON.parse(e.evaluate('JSON.stringify(guardResult)'));
}
test('five primary destinations keep city areas local and reports/shop reachable from More',()=>{
 const e=ui(),before=JSON.stringify(e.g.state),html=e.evaluate('classicShell()'),primary=html.match(/<div class="classic-primary">([\s\S]*?)<\/div>/)[1];
 const names=[...primary.matchAll(/<button[^>]*>([^<]+)/g)].map(x=>x[1]);assert.deepEqual(names,['城池','地图','军队','将领','更多']);
 assert.match(html,/aria-label="城池区域"/);assert.match(html,/data-id="inner"/);assert.match(html,/data-id="outer"/);
 for(const action of ['classicQueues','manualInventory','classicMission'])assert.match(html,new RegExp('data-action="'+action+'"'));
 e.evaluate('classicMoreModal()');const more=e.evaluate("document.getElementById('modal-body').innerHTML");
 for(const page of ['reports','shop'])assert.match(more,new RegExp('data-action="classicNav" data-id="'+page+'"'));
 assert.equal(JSON.stringify(e.g.state),before,'navigation views must not change game progress');
});
test('all ten real gift claims hide the persistent shortcut but remain inspectable from More',()=>{
 const e=ui(),g=e.g;assert.match(e.evaluate('classicShell()'),/class="classic-gift"/);city(g,{hall:10});
 assert.equal(g.onboarding.claimAvailable(),null);assert.equal(g.state.onboarding.claims.length,10);
 const before=JSON.stringify(g.state);assert.equal(e.evaluate('classicGiftComplete()'),true);assert.doesNotMatch(e.evaluate('classicShell()'),/class="classic-gift"/);
 e.evaluate('classicMoreModal()');assert.match(e.evaluate("document.getElementById('modal-body').innerHTML"),/十阶礼包 · 10\/10 已领/);assert.equal(JSON.stringify(g.state),before);
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
 const e=ui(),g=e.g;assert.equal(g.onboarding.claim(1),null);assert.equal(g.claimReadyMissions(),null);g.state.res.food=0;
 let m=e.evaluate('currentObjectiveModel()');assert.equal(m.growth.kind,'building');const missing=m.growth.cost.food;
 assert.ok(m.status.includes('粮食 '+missing),'show the real missing amount');const before=JSON.stringify(g.state);e.evaluate('currentObjectiveHTML()');assert.equal(JSON.stringify(g.state),before);
 g.state.res.food=10000;assert.equal(g.queueBuilding(m.growth.site,m.growth.id),null);assert.equal(e.evaluate('currentObjectiveModel().growth.kind'),'queue');
 e.evaluate("uiSelectors.set('[data-objective-status]',{textContent:currentObjectiveModel().status})");const initial=e.evaluate("uiSelectors.get('[data-objective-status]').textContent");
 e.advance(1000);e.evaluate('refreshGuideUI()');const refreshed=e.evaluate("uiSelectors.get('[data-objective-status]').textContent");
 assert.notEqual(refreshed,initial);assert.equal(refreshed,e.evaluate('currentObjectiveModel().status'));
});
test('readonly guard admits new inspection actions while reward, training and hero mutations stay blocked',()=>{
 const e=ui(),g=e.g;g.releaseSaveSession();assert.equal(g.saveSessionInfo().writable,false);const before=JSON.stringify(g.state);
 for(const action of ['classicMore','classicObjectives','troopDetail','heroTab','heroEquipment','heroPickEquipment','heroSkillAsk','heroSkillReview'])assert.deepEqual(pressGuard(e,action),{prevented:false,stopped:false},action);
 for(const action of ['mission','onboardingClaimAll','train','heroAllocate','heroEquip','heroDrill','heroSkillTrain'])assert.deepEqual(pressGuard(e,action),{prevented:true,stopped:true},action);
 assert.equal(JSON.stringify(g.state),before);
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
 for(const [id,n] of Object.entries(u.cost))assert.ok(detail.includes(g.resources[id].name+' '+n.toLocaleString('zh-CN')));assert.match(detail,/data-action="trainModal" data-id="archer"/);assert.equal(JSON.stringify(g.state),before);
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
