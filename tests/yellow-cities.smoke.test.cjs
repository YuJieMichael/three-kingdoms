const {test}=require('node:test'),assert=require('node:assert/strict');
const {loadGame,city}=require('./helpers/game.cjs');
const copy=x=>JSON.parse(JSON.stringify(x));
const first='yellow_qingshi',resources=['food','wood','stone','iron','gold'];
// Prepared troop/stock checkpoints verify interactions, not natural growth pace.
// Every battle retains its generated defenders and runs the normal battle APIs.
function setup(seed=723){
 const e=loadGame(seed),g=e.Game;city(g,{drill:1});g.state.honors.noble=1;g.state.army.archer=2500;g.state.res.food=1000000;
 e.evaluate('Math.random=()=>.999999');assert.equal(g.validSave(g.state),true);return e;
}
function arrive(e,id=first,mode='occupy',count=1000){
 // These cargo/morale checks keep the source army returning; unchecked capture
 // now stations it in the independently owned city (covered by city-capture).
 const g=e.Game;assert.equal(g.setTactic('archer','advance',''),null);assert.equal(g.dispatch(id,'lin',{archer:count},mode,true),null);
 e.advance(Math.ceil(g.state.expedition.end-e.now())+1);assert.equal(g.startBattle(),null);assert.ok(g.state.battle.enemy.some(r=>r.hp>0));
}
function finish(e){const g=e.Game;for(let i=0;i<30&&!g.state.battle.finished;i++)g.battleRound();assert.equal(g.state.battle.finished,true);assert.equal(g.validSave(g.state),true);return copy(g.state.battle.result);}
function missionProgress(e){const g=e.Game;return copy({next:g.nextLandmark()?.id,visible:g.nodes.filter(n=>!n.openCity&&g.landmarkVisible(n.id)).map(n=>n.id),chapter:e.Chapter.progress(g.state),second:e.Chapter.unlocked(g.state,2),third:e.Chapter.unlocked(g.state,3),namedReady:g.missions.filter(m=>['field','camp','fort'].includes(m.id)).map(m=>[m.id,g.missionReady(m)])});}

test('open Yellow Turban cities use real map nodes and stay separate from the locked mission route',()=>{
 const e=loadGame(),g=e.Game,defs=copy(e.evaluate('YellowCityData.nodes'));
 assert.deepEqual(defs.map(n=>[n.id,n.x,n.y,n.level,n.population]),[[first,26,31,2,200],['yellow_baisha',41,38,3,300],['yellow_chigang',21,20,4,400],['yellow_liulin',37,40,2,200],['yellow_heishan',24,40,3,300],['yellow_yuntai',44,24,5,500],['yellow_tieling',48,42,5,500],['yellow_huangsha',14,28,6,600]]);
 assert.match(g.attackBlocked(first,'occupy'),/城池名额已满/);
 g.state.honors.noble=1; // A rank with one spare city slot, without unlocking campaign tasks.
 const before=JSON.stringify(g.state);assert.equal(g.countyUnlocked(),false);assert.ok(g.attackBlocked('fort','occupy'));assert.ok(g.attackBlocked('north_road','raid'));
 for(const n of defs){assert.equal(n.openCity,true);assert.equal(n.faction,'yellow_turban');assert.equal(n.terrain,'fort');assert.equal(g.nodes.some(x=>x.id===n.id),true);assert.equal(g.landmarkVisible(n.id),true);assert.equal(g.attackBlocked(n.id,'raid'),null);assert.equal(g.attackBlocked(n.id,'occupy'),null);assert.equal(g.isCity(g.getNode(n.id)),true);assert.equal(g.getWorldTile(n.x,n.y).id,n.id);assert.equal(g.getWorldTile(n.x,n.y).wild,false);assert.equal(g.getNode(`wild_${n.x}_${n.y}`),null);assert.deepEqual(copy(g.state.towns[n.id]),{morale:100,unrest:0,population:n.population});}
 assert.equal(g.nextLandmark().id,'field');assert.equal(JSON.stringify(g.state),before);
});

test('city raids exclude gold, militia and siege; occupation adds militia and all five basic loot types',()=>{
 const e=loadGame(),g=e.Game;for(const n of e.evaluate('YellowCityData.nodes')){
  const before=JSON.stringify(g.state),raid=g.attackInfo(n.id,'raid'),occupy=g.attackInfo(n.id,'occupy');
  assert.equal(raid.siege,false);assert.equal(raid.militia,0);assert.deepEqual(copy(raid.army),copy(n.army));assert.deepEqual(Object.keys(raid.loot),resources.slice(0,4));assert.equal(raid.loot.gold,undefined);
  assert.equal(occupy.siege,true);assert.equal(occupy.militia,Math.ceil(n.population*.1));assert.equal(occupy.army.militia,(n.army.militia||0)+occupy.militia);assert.deepEqual(copy(occupy.loot),copy(n.loot));assert.deepEqual(Object.keys(occupy.loot),resources);assert.equal(n.fortification,undefined);
  const limited=g.lootPreview(n.id,'occupy',{archer:1});assert.ok(limited.loaded<=g.carry({archer:200}));assert.ok(limited.discarded>0);assert.ok(limited.loot.gold>0);assert.equal(JSON.stringify(g.state),before);
 }
 assert.deepEqual(copy(g.attackInfo(first,'occupy').loot),{food:800,wood:800,stone:800,iron:800,gold:1500});
});

test('three real occupation victories lower morale to minus five and claim the city without unlocking chapters or task landmarks',()=>{
 const e=setup(),g=e.Game,before=missionProgress(e);let reports=0;
 for(const [index,morale]of [65,30,-5].entries()){
  const quote=copy(g.attackInfo(first,'occupy').loot);arrive(e);assert.equal(g.state.battle.siege,true);assert.equal(g.state.battle.gate,null);assert.equal(g.state.battle.militia,Math.ceil(g.state.towns[first].population*.1));assert.equal(e.evaluate('SiegeSystem.protection(Game.state.battle,Game.getNode(Game.state.battle.node))'),1.25);const result=finish(e);
  assert.equal(result.won,true);assert.equal(result.moraleBefore,100-index*35);assert.equal(result.moraleAfter,morale);assert.equal(g.state.towns[first].morale,morale);assert.equal(result.claimed,index===2);assert.equal(!!g.state.conquered[first],index===2);assert.deepEqual(result.loot,quote);assert.equal(result.loot.gold>0,index!==1,'gold pays once, then refreshes an hour later');assert.equal(result.stationed,false);assert.equal(g.state.expedition.phase,'return');assert.equal(g.state.reports.length,++reports);assert.deepEqual(missionProgress(e),before);
  assert.equal(g.countyUnlocked(),false);assert.ok(g.attackBlocked('fort','occupy'));assert.ok(g.attackBlocked('north_road','occupy'));e.advance(index===1?3600001:90001);
 }
 assert.ok(g.attackBlocked(first,'occupy'));assert.ok(g.attackBlocked(first,'raid'));assert.equal(g.state.garrisons[first],undefined);assert.equal(g.wildOwned(),0);assert.equal(g.validSave(g.state),true);
});

test('city victory immediately settles cargo over warehouse limits and return/reload cannot award it twice',()=>{
 const e=setup(),g=e.Game;arrive(e,first,'occupy',200);
 for(const id of resources)g.state.res[id]=g.capacity(id)+100;
 const stock=copy(g.state.res),quote=copy(g.lootPreview(first,'occupy',{archer:200})),r=finish(e),b=g.state.battle;
 assert.equal(r.won,true);assert.equal(r.cargoCapacity,g.carry(Object.fromEntries(b.player.map(row=>[row.id,Math.ceil(row.hp/row.stats.hp)]))));assert.ok(r.cargoCapacity<g.carry({archer:400}));assert.ok(r.wounded.archer>0);assert.equal(r.cargoCapacity,g.carry(r.back));assert.ok(r.cargoCapacity<g.carry(Object.fromEntries(Object.keys(g.units).map(id=>[id,r.back[id]+r.wounded[id]]))));assert.equal(r.woundedInHospital,true);assert.equal(g.state.warCare.wounded.archer,r.wounded.archer);assert.ok(r.lootDiscarded>0);assert.ok(r.cargoLoaded<=r.cargoCapacity);assert.equal(r.overflow,0);assert.ok(r.overCapacity>0);assert.ok(quote.storage.overCapacity>0);
 for(const id of resources){assert.equal(r.resourceReceipt.base.received[id],r.loot[id]);assert.equal(g.state.res[id],stock[id]+r.loot[id]+(r.bonusLoot[id]||0));assert.ok(g.state.res[id]>g.capacity(id));}
 const settled=copy(g.state.res),morale=g.state.towns[first].morale,reportCount=g.state.reports.length;g.battleRound();assert.deepEqual(copy(g.state.res),settled);assert.equal(g.state.towns[first].morale,morale);
 e.offline(1);for(const id of ['wood','stone','iron','gold'])assert.equal(g.state.res[id],settled[id]);assert.ok(g.state.res.food<=settled.food);assert.equal(g.state.reports.length,reportCount);assert.equal(g.state.towns[first].morale,morale);
 e.offline(Math.ceil(g.state.expedition.end-e.now())+1);assert.equal(g.state.expedition,null);for(const id of ['wood','stone','iron','gold'])assert.equal(g.state.res[id],settled[id]);assert.ok(g.state.res.food<=settled.food);const returned=copy(g.state.res),wounded=copy(g.state.warCare.wounded);assert.deepEqual(wounded,r.wounded);g.init();assert.deepEqual(copy(g.state.res),returned);assert.deepEqual(copy(g.state.warCare.wounded),wounded);assert.equal(g.state.reports.length,reportCount);assert.equal(g.state.stats.victories,1);assert.equal(g.validSave(g.state),true);
});

test('real raids change unrest without ownership or gold, while a failed occupation leaves town state and cargo unchanged',()=>{
 const e=setup(),g=e.Game,before=missionProgress(e);arrive(e,first,'raid');assert.equal(g.state.battle.siege,false);assert.equal(g.state.battle.militia,0);assert.equal(e.evaluate('SiegeSystem.protection(Game.state.battle,Game.getNode(Game.state.battle.node))'),1);const raid=finish(e);
 assert.equal(raid.won,true);assert.equal(raid.loot.gold,undefined);assert.equal(g.state.towns[first].unrest,10);assert.equal(g.state.towns[first].morale,100);assert.equal(g.state.conquered[first],undefined);assert.equal(raid.claimed,false);assert.equal(raid.moraleBefore,null);assert.equal(raid.moraleAfter,null);assert.deepEqual(missionProgress(e),before);e.advance(90001);
 arrive(e,first,'occupy',1);const town=copy(g.state.towns[first]),stock=copy(g.state.res);const failed=finish(e);assert.equal(failed.won,false);assert.deepEqual(failed.loot,{});assert.deepEqual(copy(g.state.towns[first]),town);assert.deepEqual(copy(g.state.res),stock);assert.equal(g.state.conquered[first],undefined);assert.equal(g.state.stats.victories,1);assert.deepEqual(missionProgress(e),before);assert.equal(g.state.expedition.phase,'return');
});

test('legacy city state migrates without resetting fort morale or portraits, and malformed or unknown towns are rejected',()=>{
 const e=loadGame(),g=e.Game,old=copy(g.state),ids=e.evaluate('YellowCityData.nodes.map(n=>n.id)');old.towns.fort={morale:30,unrest:20,population:320};old.wildGenerals.portraits=['wanderer'];for(const id of ids)delete old.towns[id];
 const previous=JSON.stringify(old),migrated=g.migrateSave(old);assert.equal(JSON.stringify(old),previous);assert.deepEqual(copy(migrated.towns.fort),old.towns.fort);assert.deepEqual(copy(migrated.wildGenerals.portraits),['wanderer']);assert.equal(g.validSave(migrated),true);g.importSave(old);assert.deepEqual(copy(g.state.towns),copy(migrated.towns));assert.deepEqual(copy(g.state.wildGenerals.portraits),['wanderer']);
 for(const malformed of [null,[],{morale:'100',unrest:0,population:200},{morale:101,unrest:0,population:200},{morale:100,unrest:-1,population:200},{morale:100,unrest:0,population:.5}]){const bad=copy(g.state);bad.towns[first]=malformed;assert.equal(g.validSave(bad),false);assert.throws(()=>g.importSave(bad),/Invalid save/);}
 const unknown=copy(g.state);unknown.towns.fake_city={morale:100,unrest:0,population:200};assert.equal(g.validSave(unknown),false);assert.throws(()=>g.importSave(unknown),/Invalid save/);assert.equal(g.validSave(g.state),true);
});

test('legacy wild armies keep their map cells while open cities relocate; candidate saves validate against their own map',()=>{
 for(const phase of ['march','stationed']){
  const e=setup(),g=e.Game,node='wild_26_31',checkpoint=copy(g.state);checkpoint.openCitySites[first]={x:26,y:30};checkpoint.wildGenerals.portraits=['wanderer'];g.importSave(checkpoint);
  // v0.34.0 balanced wild refresh re-rolls free cells, so (26,31) is no longer the
  // legacy level-2 plain; a full drill-1 column (prepared stock) wins the refreshed cell.
  g.state.army.archer=10000;
  assert.equal(g.getNode(node).wild,true);assert.equal(g.setTactic('archer','advance',''),null);assert.equal(g.dispatch(node,'lin',{archer:10000},'occupy'),null);
  if(phase==='stationed'){e.advance(Math.ceil(g.state.expedition.end-e.now())+1);assert.equal(g.startBattle(),null);const result=finish(e);assert.equal(result.won,true);assert.equal(result.stationed,true);}
  const modern=copy(g.state),old=copy(modern);delete old.openCitySites;for(const n of e.evaluate('YellowCityData.nodes'))delete old.towns[n.id];
  const fresh=loadGame(),other=fresh.Game;assert.equal(other.getNode(node),null);assert.equal(other.validSave(modern),true);const migrated=other.migrateSave(old);
  assert.equal(other.validSave(migrated),true);assert.equal(other.getNode(node,migrated).wild,true);assert.equal(other.getWorldTile(26,31,migrated).id,node);assert.notDeepEqual(copy(migrated.openCitySites[first]),{x:26,y:31});assert.deepEqual(copy(migrated.expedition),copy(modern.expedition));assert.deepEqual(copy(migrated.garrisons),copy(modern.garrisons));assert.deepEqual(copy(migrated.landClaims),copy(modern.landClaims));assert.deepEqual(copy(migrated.wildGenerals.portraits),['wanderer']);
  other.importSave(old);const sites=copy(other.state.openCitySites);assert.equal(other.getNode(node).wild,true);assert.equal(other.getWorldTile(26,31).id,node);other.init();assert.deepEqual(copy(other.state.openCitySites),sites);assert.equal(other.validSave(other.state),true);
 }
 const g=loadGame().Game,variants=[null,[],{}, {[first]:{x:26,y:31}}, {...copy(g.state.openCitySites),fake_city:{x:1,y:1}}];
 for(const point of [{x:-1,y:31},{x:64,y:31},{x:26.5,y:31},{x:32,y:32},{x:29,y:35},copy(g.state.openCitySites.yellow_baisha)])variants.push({...copy(g.state.openCitySites),[first]:point});
 for(const sites of variants){const bad=copy(g.state);bad.openCitySites=sites;assert.equal(g.validSave(bad),false);assert.throws(()=>g.importSave(bad),/Invalid save/);}
});

test('pre-handbook migration rebuilds a marching wild army from its original forest rather than a newly placed city',()=>{
 for(const manualSchema of [undefined,0]){
  const e=setup(),g=e.Game,node='wild_41_38',checkpoint=copy(g.state);checkpoint.openCitySites.yellow_baisha={x:41,y:37};g.importSave(checkpoint);
  // Free cells now follow the balanced refresh; the original (legacy) map has forest here.
  assert.equal(g.getNode(node).wild,true);assert.equal(g.legacyWildTile(41,38).type,'forest');assert.equal(g.setTactic('archer','advance',''),null);assert.equal(g.dispatch(node,'lin',{archer:300},'raid'),null);assert.equal(g.state.expedition.phase,'march');
  const old=copy(g.state),march=copy(old.expedition);if(manualSchema===undefined)delete old.manualSchema;else old.manualSchema=manualSchema;delete old.openCitySites;
  // A pre-handbook save predates realm. Keeping a modern city mirror while
  // replacing only its top-level layout would be an inconsistent modern save.
  delete old.realm;
  // It also predates the v0.34.0 balanced wild refresh, so its targets use the legacy map.
  delete old.wildRefresh;
  // The older layout has no reserved slots; the handbook migration creates them.
  old.cityLayout=Array(16).fill(null);old.cityLayout[5]='hall';old.cityLayout[10]='drill';for(const n of e.evaluate('YellowCityData.nodes'))delete old.towns[n.id];
  const untouched=JSON.stringify(old),fresh=loadGame(),other=fresh.Game;assert.equal(other.getWorldTile(41,38).terrain,'fort');const migrated=other.migrateSave(old);
  assert.equal(JSON.stringify(old),untouched);assert.equal(migrated.expedition.start,march.start);assert.equal(migrated.expedition.end,march.end);assert.equal(migrated.expedition.phase,'march');assert.deepEqual(copy(migrated.expedition.army),march.army);assert.equal(other.getNode(node,migrated).type,'forest');
  // This anchor had legacy level 3: spear 10+3*8, forest archer 6+3*6,
  // cavalry 3*3. A fort/other-terrain misread would produce only 13 archers.
  assert.deepEqual(copy(migrated.expedition.enemySnapshot),{spear:34,archer:24,cavalry:9});assert.equal(other.validSave(migrated),true);other.importSave(old);assert.equal(other.validSave(other.state),true);assert.equal(other.getNode(node).type,'forest');assert.equal(other.state.expedition.start,march.start);assert.equal(other.state.expedition.end,march.end);assert.deepEqual(copy(other.state.expedition.enemySnapshot),{spear:34,archer:24,cavalry:9});
 }
});

test('a Yellow Turban occupation victory pays its full gold once, then refreshes after an hour, and the refresh survives reload',()=>{
 const e=setup(),g=e.Game,full=e.evaluate(`YellowCityData.nodes.find(n=>n.id===${JSON.stringify(first)}).loot.gold`);
 assert.equal(g.attackInfo(first,'occupy').loot.gold,full);assert.equal(g.attackInfo(first,'occupy').goldReadyAt,0);
 arrive(e);let result=finish(e);assert.equal(result.won,true);assert.equal(result.loot.gold,full);
 const readyAt=g.state.yellowGold[first];assert.ok(readyAt>e.now()+3599000&&readyAt<=e.now()+3600000);assert.equal(g.attackInfo(first,'occupy').loot.gold,0);assert.equal(g.attackInfo(first,'occupy').goldReadyAt,readyAt);
 assert.equal(g.attackInfo(first,'raid').loot.gold,undefined);assert.equal(g.validSave(g.state),true);
 g.save();g.init();assert.equal(g.state.yellowGold[first],readyAt);
 e.advance(3600001);assert.equal(g.attackInfo(first,'occupy').loot.gold,full);
 for(const bad of [{fake:1},{[first]:-1},{[first]:1.5},[]]){const d=JSON.parse(JSON.stringify(g.state));d.yellowGold=bad;assert.equal(g.validSave(d),false,JSON.stringify(bad));}
});
test('saves from before the extra Yellow Turban cities gain their sites without moving the original three',()=>{
 const e=loadGame(),g=e.Game,old=JSON.parse(JSON.stringify(g.state)),kept={};
 for(const id of ['yellow_liulin','yellow_heishan','yellow_yuntai','yellow_tieling','yellow_huangsha']){delete old.openCitySites[id];delete old.towns[id];}
 for(const id of ['yellow_qingshi','yellow_baisha','yellow_chigang'])kept[id]=JSON.stringify(old.openCitySites[id]);delete old.yellowGold;
 const migrated=g.migrateSave(old);assert.equal(g.validSave(migrated),true);
 for(const [id,site] of Object.entries(kept))assert.equal(JSON.stringify(migrated.openCitySites[id]),site);
 assert.equal(Object.keys(migrated.openCitySites).length,e.evaluate('YellowCityData.allNodes().length'));assert.deepEqual({...migrated.yellowGold},{});
});
