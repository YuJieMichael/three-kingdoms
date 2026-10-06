const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const {loadGame,city,cloneActiveSave}=require('./helpers/game.cjs');
const copy=x=>JSON.parse(JSON.stringify(x)),read=name=>fs.readFileSync(path.join(__dirname,'..',name),'utf8');
// Prepared owned cities and overwhelming archers verify settlement, not natural balance.
function prepared(node='yellow_qingshi',hall=6){
  const e=loadGame(932),g=e.Game,s=g.state;s.honors.noble=3;s.stats.victories=1;
  e.evaluate(`for(const id of ['yellow_qingshi','yellow_baisha','yellow_chigang']){Game.state.conquered[id]=true;Game.state.towns[id].morale=-5;const c=CitySystem.empty(Game.state,Game.getNode(id),Date.now());Game.state.realm.cities[c.id]=c;}`);
  assert.equal(g.switchCity('city_'+node),null);city(g,{hall,wall:0,drill:3,house:5});s.population=10000;for(const id in g.resources)s.res[id]=1000000;s.army.archer=15000;s.realm.heroLocations.lin=g.currentCityId();g.save();assert.equal(g.validSave(s),true);return e;
}
function start(e,level=1){const q=e.Game.regionFrontQuote(level);assert.equal(q.reason,'');assert.equal(e.Game.startRegionalFront(level,q.key),null);return q;}
function arrive(e){e.advance(Math.max(0,e.Game.state.cityDefense.incoming.arriveAt-e.now()));}
function defend(e,army){assert.equal(e.Game.startCityDefense(false,'lin',army),null);let r;for(let i=0;i<30&&e.Game.state.cityDefense.battle;i++)r=e.Game.cityDefenseRound();assert.equal(typeof r,'object');assert.ok(!e.Game.state.cityDefense.battle);assert.equal(e.Game.validSave(e.Game.state),true);return r;}
function wave(e,level=1){const q=start(e,level);arrive(e);const r=defend(e);assert.equal(r.won,true);return {q,r};}
test('only captured classified cities expose a bounded pure front quote; real city identity survives renaming',()=>{
  const e=loadGame(),g=e.Game;assert.equal(g.regionFrontQuote(),null);assert.equal(g.regionalFrontStatus('city_yellow_qingshi'),null);
  const p=prepared('yellow_baisha',2),before=JSON.stringify(p.Game.state),q=p.Game.regionFrontQuote(1);assert.equal(q.kind,'mine');assert.equal(q.maxLevel,1);assert.match(p.Game.regionFrontQuote(2).reason,/难度/);assert.equal(p.Game.regionFrontQuote(4),null);assert.equal(p.Game.regionFrontQuote(1.5),null);assert.equal(JSON.stringify(p.Game.state),before);
  p.Game.state.realm.cities[p.Game.currentCityId()].name='玩家矿城';assert.equal(p.Game.regionFrontQuote().kind,'mine');assert.equal(p.Game.regionFrontQuote().cost.gold,0);assert.equal(p.Game.regionFrontQuote().cost.food,0);
});
test('internal regional NPC profiles are absent from paid challenges and cannot bypass city-bound start',()=>{
  const e=prepared(),g=e.Game,npc=e.evaluate('NPCDefense'),before=JSON.stringify(g.state);
  assert.equal(npc.profiles.some(p=>p.regional||p.id.startsWith('region_')),false);
  for(const id of ['region_granary','region_mine','region_pass']){assert.equal(npc.challengeQuote(g.state,id,1),null);assert.match(g.requestCityDefense(id,1),/变化/);}
  const q=g.regionFrontQuote();assert.match(npc.requestRegional(g.state,e.now(),q.meta),/变化/);assert.equal(JSON.stringify(g.state),before);
});
test('the first wave has five real minutes of public warning, with no automatic offline casualties',()=>{
  const e=prepared(),g=e.Game,s=g.state;s.speed=60;const q=start(e),w=copy(s.cityDefense.incoming);
  assert.equal(w.arriveAt-e.now(),300000);assert.equal(w.front.id,s.regionalFront.run.id);assert.deepEqual(w.army,copy(q.army));assert.equal(e.evaluate('NPCDefense.beaconIntel(Game.state).exact'),true);assert.equal(s.buildings.beacon,0);
  assert.equal(g.startCityDefense(false,'lin'),'敌军尚未抵达');e.advance(299999);assert.equal(g.startCityDefense(false,'lin'),'敌军尚未抵达');const army=copy(s.army),defenses=copy(s.defenses);e.offline(3600000);
  assert.deepEqual(copy(g.state.army),army);assert.deepEqual(copy(g.state.defenses),defenses);assert.equal(g.state.cityDefense.battle,null);assert.deepEqual(copy(g.state.cityDefense.incoming),w);assert.equal(g.state.regionalFront.run.status,'incoming');assert.equal(g.validSave(g.state),true);
});
test('ordinary NPC invasion and drill conflicts block start without advancing front sequence or deducting resources',()=>{
  const e=prepared(),g=e.Game,s=g.state;assert.equal(g.requestCityDefense('classic',1),null);const q=g.regionFrontQuote(),before=JSON.stringify(s.regionalFront),stock=copy(s.res);assert.match(q.reason,/来袭|守城/);assert.match(g.startRegionalFront(1,q.key),/来袭|守城/);assert.equal(JSON.stringify(s.regionalFront),before);assert.deepEqual(copy(s.res),stock);
  s.cityDefense.incoming=null;assert.equal(g.startCityDefense(true,'lin'),null);const drill=g.regionFrontQuote();assert.match(drill.reason,/来袭|守城/);assert.match(g.startRegionalFront(1,drill.key),/来袭|守城/);assert.equal(s.regionalFront.seq,0);assert.equal(g.endDefenseDrill(),null);
});
test('real NPC defense reserves only selected troops and keeps front metadata on battle and report',()=>{
  const e=prepared('yellow_chigang'),g=e.Game,s=g.state,q=start(e,2);arrive(e);assert.equal(g.startCityDefense(false,'lin',{archer:10000}),null);
  const b=s.cityDefense.battle;assert.equal(s.army.archer,5000);assert.deepEqual(copy(b.front),copy(s.regionalFront.run.pending));assert.deepEqual(Object.fromEntries(b.enemy.map(r=>[r.id,r.count])),copy(q.army));assert.equal(s.regionalFront.run.status,'battle');assert.equal(g.validSave(s),true);
  const beforeDistance=b.distance;g.cityDefenseRound();assert.equal(beforeDistance-b.distance,300);g.save();g.init();assert.equal(g.state.cityDefense.battle.round,1);assert.equal(g.state.cityDefense.battle.army.archer,10000);assert.equal(g.state.army.archer,5000);assert.equal(g.validSave(g.state),true);
  let r;for(let i=0;i<30&&g.state.cityDefense.battle;i++)r=g.cityDefenseRound();assert.equal(r.won,true);assert.deepEqual(copy(r.front),copy(b.front));assert.equal(g.state.regionalFront.run.status,'ready');assert.equal(g.state.regionalFront.run.stage,2);assert.equal(r.regionalFront.merit,q.merit);assert.equal(g.state.warOrders.merit,q.merit);assert.equal(g.validSave(g.state),true);
});
test('completed stages wait for an explicit next start, first rewards are shared across difficulty and one run cools for 30 minutes',()=>{
  const e=prepared(),g=e.Game,s=g.state,first=[];for(let stage=1;stage<=3;stage++){
    assert.equal(g.regionFrontQuote(3).level,stage===1?3:1);const {q,r}=wave(e,1);first.push(q);assert.equal(r.front.stage,stage);assert.equal(r.front.first,true);assert.equal(r.regionalFront.first,true);assert.equal(s.cityDefense.incoming,null);
    if(stage<3){assert.equal(s.regionalFront.run.status,'ready');e.advance(600000);assert.equal(s.cityDefense.incoming,null);assert.equal(s.regionalFront.run.stage,stage+1);}
  }
  assert.equal(s.regionalFront.run.status,'complete');assert.equal(s.regionalFront.nextAt-e.now(),1800000);const cooling=g.regionFrontQuote(2);assert.match(cooling.reason,/整军/);assert.match(g.startRegionalFront(2,cooling.key),/整军/);e.advance(1800000);
  const repeat=g.regionFrontQuote(2);assert.equal(repeat.first,false);assert.equal(repeat.merit,6);assert.equal(repeat.reward.food,1800);assert.ok(repeat.reward.food<first[0].reward.food);assert.equal(g.startRegionalFront(2,repeat.key),null);assert.equal(s.regionalFront.seq,2);assert.equal(s.regionalFront.run.level,2);
  arrive(e);const r=defend(e);assert.equal(r.front.first,false);assert.equal(r.regionalFront.first,false);assert.equal(r.regionalFront.merit,6);assert.equal(s.regionalFront.earnedMerit,first.reduce((n,q)=>n+q.merit,0)+6);assert.equal(g.validSave(s),true);
});
test('loss uses actual defense robbery, preserves the city and can retry the same first award with a new attempt',()=>{
  const e=prepared('yellow_baisha'),g=e.Game,s=g.state,q=start(e,3);arrive(e);const ownership=copy(s.conquered),before=copy(s.res);const r=defend(e,{});
  assert.equal(r.won,false);assert.equal(s.regionalFront.run.status,'retry');assert.equal(s.regionalFront.run.stage,1);assert.equal(s.regionalFront.earnedMerit,0);assert.equal(r.regionalFront.merit,0);assert.deepEqual(copy(s.conquered),ownership);assert.equal(s.buildings.hall,6);assert.ok(Object.values(r.robbed).some(n=>n>0));for(const [id,n] of Object.entries(r.robbed))assert.ok(n<=Math.floor(before[id]*.1));
  const retry=g.regionFrontQuote(1);assert.equal(retry.level,3);assert.equal(retry.first,true);assert.equal(g.startRegionalFront(1,retry.key),null);assert.equal(s.regionalFront.run.attempt,2);assert.equal(s.cityDefense.incoming.front.id,r.front.id);arrive(e);const won=defend(e);assert.equal(won.won,true);assert.equal(won.front.attempt,2);assert.equal(won.regionalFront.merit,q.merit);assert.equal(g.validSave(s),true);
});
test('replayed settlement and stale quote cannot double resources, army returns, stage counters or merit',()=>{
  const e=prepared(),g=e.Game,q=start(e);assert.match(g.startRegionalFront(1,q.key),/变化/);arrive(e);const r=defend(e),before=JSON.stringify(g.state),rf=e.evaluate('RegionalFront');
  assert.match(rf.settle(g.state,r,e.now(),{addMerit:()=>assert.fail('must not pay twice')}),/不匹配/);assert.equal(g.cityDefenseRound(),'当前没有守城战');assert.equal(JSON.stringify(g.state),before);
});
test('front rewards use exact real loot receipts including over-capacity resources and reload unchanged',()=>{
  const e=prepared('yellow_baisha'),g=e.Game,{q,r}=wave(e,1);
  assert.deepEqual(copy(r.resourceReceipt.loaded),copy(q.reward));assert.deepEqual(copy(r.resourceReceipt.received),copy(q.reward));assert.ok(Object.values(r.resourceReceipt.overCapacity).some(n=>n>0));g.save();g.init();assert.deepEqual(copy(g.state.cityDefense.reports[0].resourceReceipt),copy(r.resourceReceipt));assert.equal(g.state.regionalFront.earnedMerit,q.merit);assert.equal(g.validSave(g.state),true);
});
test('switching cities keeps arrivals, stage progress, rewards and enemy composition isolated',()=>{
  const e=prepared(),g=e.Game,q=start(e),grainId=g.currentCityId(),original=copy(g.state.cityDefense.incoming);assert.equal(g.switchCity('city_yellow_baisha'),null);city(g,{hall:4});for(const id in g.resources)g.state.res[id]=1000000;
  assert.equal(g.state.regionalFront.seq,0);assert.equal(g.state.cityDefense.incoming,null);assert.equal(g.regionFrontQuote().kind,'mine');const mine=start(e,2);assert.notEqual(g.state.regionalFront.run.id,original.front.id);assert.notDeepEqual(copy(mine.army),copy(q.army));assert.equal(g.regionalFrontStatus(grainId).arriveAt,original.arriveAt);assert.equal(g.currentCityId(),'city_yellow_baisha');
  assert.equal(g.switchCity(grainId),null);assert.deepEqual(copy(g.state.cityDefense.incoming),original);arrive(e);defend(e);assert.equal(g.getCityState('city_yellow_baisha').regionalFront.run.stage,1);assert.equal(g.getCityState('city_yellow_baisha').regionalFront.earnedMerit,0);g.save();g.init();assert.equal(g.validSave(g.state),true);assert.equal(g.state.regionalFront.run.stage,2);
});
test('strict save validation rejects forged regional identity, roster, time, cost, reward and ledger while accepting a legal pending/battle save',()=>{
  const e=prepared(),g=e.Game;start(e,2);assert.equal(g.validSave(g.state),true);
  for(const mutate of [d=>d.cityDefense.incoming.front.city='city_yellow_baisha',d=>d.cityDefense.incoming.front.stage=3,d=>d.cityDefense.incoming.army.archer++,d=>d.cityDefense.incoming.arriveAt--,d=>d.cityDefense.incoming.front.arriveAt--,d=>d.cityDefense.incoming.rewardSnapshot.food++,d=>d.cityDefense.incoming.costSnapshot.gold=1,d=>delete d.cityDefense.incoming.front,d=>d.regionalFront.wins[2][0]++,d=>d.regionalFront.earnedMerit++,d=>d.regionalFront.run.status='ready']){const d=cloneActiveSave(g.state);mutate(d);assert.equal(g.validSave(d),false);}
  arrive(e);assert.equal(g.startCityDefense(false,'lin'),null);assert.equal(g.validSave(g.state),true);for(const mutate of [d=>d.cityDefense.battle.enemy[0].count++,d=>d.cityDefense.battle.front.first=false,d=>d.cityDefense.battle.front.kind='pass',d=>d.cityDefense.battle.costSnapshot.food=1,d=>delete d.cityDefense.battle.front]){const d=cloneActiveSave(g.state);mutate(d);assert.equal(g.validSave(d),false);}
});
test('settled reports cannot forge front merit, rewards or duplicate first-stage receipts after reload',()=>{
  const e=prepared(),g=e.Game;wave(e);for(const mutate of [d=>d.cityDefense.reports[0].regionalFront.merit++,d=>d.cityDefense.reports[0].front.level++,d=>d.cityDefense.reports[0].front.id='front_'+g.currentCityId()+'_999',d=>d.cityDefense.reports[0].rewardSnapshot.food++,d=>d.cityDefense.reports.unshift(copy(d.cityDefense.reports[0])),d=>d.regionalFront.last.merit++,d=>d.regionalFront.nextAt=999,d=>d.regionalFront.run.stage++]){const d=cloneActiveSave(g.state);mutate(d);assert.equal(g.validSave(d),false);}
});
test('legacy cities migrate blank without inventing regional wins, and new city creation cannot inherit another city front',()=>{
  const e=prepared(),g=e.Game;wave(e);const old=cloneActiveSave(g.state);for(const c of Object.values(old.realm.cities))delete c.data.regionalFront;delete old.regionalFront;
  // A truly old save has no regional NPC history either.
  old.cityDefense.reports=[];old.realm.cities[old.realm.activeCity].data.cityDefense=old.cityDefense;
  const migrated=g.migrateSave(old);assert.equal(migrated.regionalFront.seq,0);assert.equal(migrated.regionalFront.earnedMerit,0);assert.equal(migrated.regionalFront.run,null);assert.equal(g.validSave(migrated),true);
  const fresh=e.evaluate(`CitySystem.empty(Game.state,Game.getNode('fort'),Date.now())`);assert.equal(fresh.data.regionalFront.seq,0);assert.equal(fresh.data.regionalFront.run,null);assert.equal(fresh.data.cityDefense.reports.length,0);
});
test('compact UI renders only owned fronts, folds actual troops and uses real garrison/reinforcement/defense entry points',()=>{
  const e=prepared(),g=e.Game;e.evaluate(`function S(){return Game.state;}function esc(s){return String(s);}function num(n){return String(n);}function duration(n){return n+' 秒';}function clock(end){return '<span data-clock=\"'+end+'\">'+duration((end-Date.now())/1000)+'</span>';}function btn(label,action,id='',cls='',disabled=false){return '<button data-action="'+action+'" data-id="'+id+'"'+(disabled?' disabled':'')+'>'+label+'</button>';}let manualModalContext=null;globalThis.modalOutput={};function showModal(title,body,footer){modalOutput={title,body,footer};}`);e.evaluate(read('regional-front-ui.js'));
  assert.equal(e.evaluate(`regionalFrontHTML('capital')`),'');assert.equal(e.evaluate(`regionalFrontHTML('city_not_owned')`),'');const html=e.evaluate('regionalFrontHTML()');assert.match(html,/区域战线/);assert.match(html,/data-action="regionalFront"/);assert.doesNotMatch(html,/保矿|扼守/);e.evaluate('regionalFrontModal()');const body=e.evaluate('modalOutput.body');assert.match(body,/data-action="regionalFrontStart"/);assert.match(body,/data-action="regionalFrontGarrison"/);assert.match(body,/data-action="regionalFrontReinforce"/);assert.match(body,/data-ui-disclosure="regional-front-/);assert.doesNotMatch(body,/<details[^>]*\sopen(?:\s|>)/);assert.match(body,/5 分钟/);assert.match(body,/没有免费援军/);assert.match(body,/第一阶段|进犯/);assert.match(body,/军功 \+15/);
  start(e);e.evaluate('regionalFrontModal()');assert.match(e.evaluate('modalOutput.body'),/data-action="regionalFrontDefend"/);assert.match(e.evaluate('modalOutput.body'),/切城、离线不会自动/);assert.equal(g.validSave(g.state),true);
});
test('pending quotes keep their actual metadata and a downgraded hall cannot change the fixed run level or hide it in UI',()=>{
  const e=prepared(),g=e.Game;start(e,3);const pending=copy(g.state.regionalFront.run.pending);city(g,{hall:2});e.advance(1000);const q=g.regionFrontQuote(1);assert.equal(q.level,3);assert.equal(q.maxLevel,1);assert.deepEqual(copy(q.meta),pending);assert.deepEqual(copy(e.evaluate('NPCDefense.beaconIntel(Game.state).army')),copy(q.army));assert.equal(e.evaluate('NPCDefense.beaconIntel(Game.state).name'),q.name);
  e.evaluate(`function S(){return Game.state;}function esc(s){return String(s);}function num(n){return String(n);}function duration(n){return n+' 秒';}function clock(end){return '<span data-clock=\"'+end+'\">'+duration((end-Date.now())/1000)+'</span>';}function btn(label,action,id='',cls='',disabled=false){return '<button data-action="'+action+'" data-id="'+id+'">'+label+'</button>';}let manualModalContext=null;globalThis.modalOutput={};function showModal(title,body,footer){modalOutput={title,body,footer};}`);e.evaluate(read('regional-front-ui.js'));e.evaluate('regionalFrontModal()');const body=e.evaluate('modalOutput.body');assert.match(body,/本轮固定难度/);assert.match(body,/<option value="3" selected>3 级<\/option>/);assert.doesNotMatch(body,/<option value="1"/);assert.equal(g.validSave(g.state),true);
});
test('shared authority blocks new fronts and an existing pending or active regional battle without silent client settlement',async()=>{
  for(const battleStarted of [false,true]){
    const e=prepared(),g=e.Game;start(e);arrive(e);if(battleStarted)assert.equal(g.startCityDefense(false,'lin'),null);g.save();const stored=g.exportStoredRaw();assert.equal(g.enterOnlineSession(cloneActiveSave(g.state)),null);const before=JSON.stringify(g.state);
    assert.equal(g.domesticStrategyAvailable(),false);assert.match(g.regionFrontQuote().reason,/共享世界/);assert.match(g.startRegionalFront(1,g.regionFrontQuote().key),/共享世界/);assert.match(battleStarted?g.cityDefenseRound():g.startCityDefense(false,'lin'),/共享世界/);e.advance(1800000,true);assert.equal(JSON.stringify(g.state),before);assert.equal(g.exportStoredRaw(),stored);
    await g.leaveOnlineSession();assert.equal(g.domesticStrategyAvailable(),true);assert.equal(g.validSave(g.state),true);
  }
});
test('actual app clock refresh updates warning and cooldown text every second without rebuilding the front modal or its draft',()=>{
  const e=prepared(),g=e.Game;
  e.evaluate(`function S(){return Game.state;}function esc(s){return String(s);}function num(n){return String(n);}function duration(n){return Math.max(0,Math.ceil(n))+' 秒';}function btn(label,action,id=''){return '<button data-action="'+action+'" data-id="'+id+'">'+label+'</button>';}let manualModalContext=null;globalThis.modalOutput={};function showModal(title,body,footer){modalOutput={title,body,footer};}function refreshCityFoodStatus(){}function refreshArmyDeploymentValues(){}function refreshGovernmentQuotes(){}function updateSpeedupPreview(){}`);
  const appLines=read('app.js').split('\n');e.evaluate(appLines.find(l=>l.startsWith('function clock(')));e.evaluate(appLines.find(l=>l.startsWith('function refreshValues(')));e.evaluate(read('regional-front-ui.js'));
  start(e);e.evaluate('regionalFrontModal()');const arrival=g.state.cityDefense.incoming.arriveAt;
  function mountClocks(){const html=e.evaluate('regionalFrontHTML()+modalOutput.body'),cells=[...html.matchAll(/<span data-clock="(\d+)">([^<]*)<\/span>/g)].map(m=>({dataset:{clock:m[1]},textContent:m[2]}));assert.ok(cells.length>=2);e.evaluate(`globalThis.clockCells=${JSON.stringify(cells)};document.querySelectorAll=selector=>selector==='[data-clock]'?clockCells:[];`);return cells;}
  let cells=mountClocks();assert.ok(cells.every(c=>Number(c.dataset.clock)===arrival&&c.textContent==='300 秒'));const draft=e.evaluate('JSON.stringify(regionalFrontDraft)'),body=e.evaluate('modalOutput.body');e.advance(1000);e.evaluate('refreshValues()');assert.ok(e.evaluate('clockCells.every(c=>c.textContent==="299 秒")'));assert.equal(e.evaluate('JSON.stringify(regionalFrontDraft)'),draft);assert.equal(e.evaluate('modalOutput.body'),body);
  arrive(e);defend(e);wave(e);wave(e);const end=g.state.regionalFront.nextAt;e.evaluate('regionalFrontModal()');cells=mountClocks();assert.ok(cells.every(c=>Number(c.dataset.clock)===end&&c.textContent==='1800 秒'));e.advance(1000);e.evaluate('refreshValues()');assert.ok(e.evaluate('clockCells.every(c=>c.textContent==="1799 秒")'));assert.equal(g.state.regionalFront.nextAt,end);
});
