const {test}=require('node:test'),assert=require('node:assert/strict');
const {loadGame,city}=require('./helpers/game.cjs');
const copy=x=>JSON.parse(JSON.stringify(x)),H=3600000;
// Prepared resources/ownership isolate cross-system contracts, never prove normal-economy balance.
function secondary(e,node='wild_28_50'){
 e.evaluate(`const n=Game.getNode('${node}');Game.state.conquered[n.id]=true;const c=CitySystem.empty(Game.state,n,Date.now());Game.state.realm.cities[c.id]=c;if(n.wild)Game.state.realm.wildOwners[n.id]=c.id;CitySystem.capture(Game.state);`);
 return 'city_'+node;
}
function readyWild(){
 const e=loadGame(751),g=e.Game,id=secondary(e);assert.equal(g.switchCity(id),null);
 city(g,{hall:5,inn:2,drill:5,house:8,tavern:10});g.state.honors.noble=2;g.state.stats.victories=1;
 g.state.governor=null;g.state.realm.cities.capital.data.governor=null;for(const h of g.state.generals)g.state.realm.heroLocations[h]=id;
 g.state.population=10000;g.state.army.archer=5000;g.state.res.food=1000000;g.state.res.gold=1000000;g.state.gems=10000;g.state.warCare.defense.autoResolve=false;
 assert.equal(g.save(),true);assert.equal(g.validSave(g.state),true);return e;
}
function enable(e){const g=e.Game,q=g.factionToggleQuote(true);assert.equal(q.reason,'');assert.equal(g.setFactionsEnabled(true,q.key),null);}
function makeCamp(e){enable(e);e.advance(6*H);const c=copy(e.Game.state.realm.factions.camps[0]);assert.equal(c.node,'wild_27_50');return c;}
function discover(e){assert.equal(e.evaluate('HeroSystem.wild.discover()'),null);return e.Game.state.wildGenerals.rumors.find(r=>r.line==='huaman');}
function legalRumor(g,r,c){
 assert.equal(r.status,'active');assert.notEqual(r.node,c.node,'花鬘线索不能占用既有营地');const n=g.getNode(r.node);
 assert.equal(n.wild,true);assert.equal(n.level,5);assert.equal(!!n.factionCamp,false);assert.equal(!!g.state.conquered[n.id],false);assert.ok(Object.values(n.army).some(v=>v>0));assert.equal(g.validSave(g.state),true);
}
test('a camp created before a famous rumor still warns its original city on schedule',()=>{
 const e=readyWild(),g=e.Game,c=makeCamp(e),r=discover(e);legalRumor(g,r,c);e.advance(c.readyAt-e.now());
 assert.equal(g.state.cityDefense.incoming.faction.id,c.id);assert.equal(g.state.cityDefense.incoming.faction.sourceCity,c.sourceCity);assert.equal(g.state.cityDefense.incoming.arriveAt,e.now()+15*60000);assert.equal(g.validSave(g.state),true);
});
for(const alreadyMarching of [false,true])test(`real camp clearing does not capture a later rumor or grant its first box (march first=${alreadyMarching})`,()=>{
 const e=readyWild(),g=e.Game,c=makeCamp(e);if(alreadyMarching)assert.equal(g.dispatch(c.node,'lin',{archer:5000},'raid'),null);
 const r=discover(e);legalRumor(g,r,c);assert.equal(e.evaluate("HeroSystem.wild.buyPortrait('huaman',HeroSystem.wild.portraitQuote(Game.state,'huaman').key)"),null);
 if(!alreadyMarching)assert.equal(g.dispatch(c.node,'lin',{archer:5000},'raid'),null);
 assert.deepEqual(copy(g.state.expedition.enemySnapshot),{militia:400,spear:150,archer:200});e.advance(Math.ceil(g.state.expedition.end-e.now())+1);assert.equal(g.startBattle(),null);
 for(let i=0;i<30&&!g.state.battle.finished;i++)g.battleRound();assert.equal(g.state.battle.finished,true);assert.equal(g.state.battle.result.won,true);
 assert.equal(g.state.wildGenerals.captives.some(h=>h.line==='huaman'),false);assert.equal(g.state.wildGenerals.rumors.find(h=>h.line==='huaman').status,'active');assert.equal(g.state.inventory.barbarianEquipmentBox||0,0);assert.equal(g.state.wildGenerals.firstCaptureRewards.includes('huaman'),false);assert.equal(g.state.realm.factions.camps.length,0);assert.equal(g.validSave(g.state),true);assert.equal(g.save(),true);g.init();assert.equal(g.validSave(g.state),true);
});
test('a displaced active rumor avoids existing camps when choosing its next wild tile',()=>{
 const e=readyWild(),g=e.Game,r=discover(e),original=r.node,c=makeCamp(e);assert.notEqual(original,c.node);g.state.conquered[original]=true;g.state.realm.wildOwners[original]=g.currentCityId();assert.equal(g.save(),true);
 const moved=discover(e);assert.notEqual(moved.node,original);legalRumor(g,moved,c);
});
test('camp creation still avoids rumors discovered before factions start',()=>{
 const e=readyWild(),g=e.Game;discover(e);const rumors=new Set(g.state.wildGenerals.rumors.map(r=>r.node));const c=makeCamp(e);assert.equal(rumors.has(c.node),false);assert.equal(g.validSave(g.state),true);
});
function readyTransaction(action){
 const e=loadGame(751),g=e.Game;city(g,{hall:5,inn:2,drill:5,house:8,tavern:10});g.state.stats.victories=1;g.state.governor=null;g.state.tax=0;g.state.res.gold=1000000;
 const other=secondary(e,'yellow_qingshi');g.state.realm.cities[other].data.governor=null;g.state.realm.cities[other].data.tax=0;g.state.realm.cities[other].data.res.gold=1000;g.state.realm.heroLocations.lin=other;
 assert.equal(e.evaluate("WarCare.admit(Game.state,'npc:capital:1',{archer:10},Date.now())"),null);
 if(action==='recruit')assert.equal(g.refreshInn(),null);
 const candidate=action==='recruit'?copy(g.state.innCandidates[0]):null,q=g.warCareQuote('archer',10);enable(e);assert.equal(g.save(),true);assert.equal(g.validSave(g.state),true);
 e.evaluate('Date.now=()=>'+(e.now()+6*H));return {e,g,other,candidate,q};
}
function act(f,action){return action==='heal'?f.g.healWounded('archer',10,f.q.key):action==='auto'?f.g.setAutoHeal(true):f.g.recruit(f.candidate.id);}
function observeWrites(f,action,fail){
 const complete=action==='recruit'?`s.generals.includes('${f.candidate.id}')`:'s.warCare.treated.archer>0';
 f.e.evaluate(`var attemptedGameWrites=0,acceptedGameWrites=0,incompleteGameWrites=0,realSet=localStorage.setItem;localStorage.setItem=(key,value)=>{if(key==='sanguo-city-v2'){attemptedGameWrites++;const s=JSON.parse(value),complete=${complete};if(!complete)incompleteGameWrites++;if(complete&&${fail})throw new Error('final completed operation write failed');acceptedGameWrites++;}return realSet(key,value);};`);
}
for(const action of ['heal','auto','recruit'])test(`${action} rolls back due faction tick, wages and city mirrors when only the final complete write fails`,()=>{
 const f=readyTransaction(action),{e,g,other,candidate}=f,before=JSON.stringify(g.state),stored=g.exportStoredRaw(),gold=g.state.res.gold,otherGold=g.getCityState(other).res.gold,pay=g.state.heroService.lastPay,wounded=copy(g.state.warCare),candidates=copy(g.state.innCandidates);
 observeWrites(f,action,true);assert.match(act(f,action),/保存失败/);assert.equal(e.evaluate('attemptedGameWrites>=1'),true);assert.equal(g.saveSessionInfo().mode,'write-error');
 assert.equal(JSON.stringify(g.state),before);assert.equal(g.exportStoredRaw(),stored,'失败操作不能留下中途营地或经济存档');assert.equal(g.state.res.gold,gold);assert.equal(g.getCityState(other).res.gold,otherGold);assert.equal(g.state.heroService.lastPay,pay);assert.deepEqual(copy(g.state.warCare),wounded);assert.deepEqual(copy(g.state.innCandidates),candidates);if(candidate)assert.equal(g.state.generals.includes(candidate.id),false);
 const scope=g.state.realm.cities[g.currentCityId()].data;for(const k of ['res','warCare','innCandidates','army'])assert.equal(scope[k],g.state[k],k+' 必须重新连回本城镜像');assert.equal(g.validSave(g.state),true);
 assert.equal(e.evaluate('acceptedGameWrites'),0);assert.equal(e.evaluate('incompleteGameWrites'),0);assert.match(act(f,action),/保存失败/);assert.equal(e.evaluate('attemptedGameWrites'),1,'写入错误后暂停重试');
});
for(const action of ['heal','auto','recruit'])test(`${action} persists due faction tick and complete operation once, with valid reload`,()=>{
 const f=readyTransaction(action),{e,g,other,candidate,q}=f,gold=g.state.res.gold,healthy=g.state.army.archer;observeWrites(f,action,false);const result=act(f,action);if(action==='heal')assert.equal(result.healed,10);else assert.equal(result,null);
 assert.equal(g.state.realm.factions.camps.length,1);assert.equal(g.state.realm.factions.camps[0].sourceCity,'capital');assert.equal(g.getCityState(other).res.gold,880);assert.equal(g.state.heroService.lastPay,e.now()+6*H);
 assert.equal(g.state.res.gold,gold-120-(action==='recruit'?candidate.price:q.gold));if(action==='recruit'){assert.equal(g.state.generals.filter(id=>id===candidate.id).length,1);assert.equal(g.state.innCandidates.some(h=>h.id===candidate.id),false);assert.equal(g.state.realm.heroLocations[candidate.id],'capital');assert.equal(g.state.warCare.wounded.archer,10);}else{assert.equal(g.state.warCare.treated.archer,10);assert.equal(g.state.warCare.wounded.archer,0);assert.equal(g.state.army.archer,healthy+10);assert.equal(g.state.warCare.autoHeal,action==='auto');}
 assert.equal(e.evaluate('attemptedGameWrites'),1);assert.equal(e.evaluate('acceptedGameWrites'),1);assert.equal(e.evaluate('incompleteGameWrites'),0);assert.equal(g.validSave(g.state),true);const complete=JSON.stringify(g.state);assert.equal(g.exportStoredRaw(),complete);g.init();assert.equal(g.validSave(g.state),true);assert.equal(JSON.stringify(g.state),complete);
});
