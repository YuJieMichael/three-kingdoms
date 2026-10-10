const {test}=require('node:test'),assert=require('node:assert/strict');
const {loadGame,city,cloneActiveSave}=require('./helpers/game.cjs');
function prepare(mount=false,army={cavalry:20,archer:1}){const e=loadGame(123),G=e.Game,H=e.evaluate('HeroSystem');city(G,{drill:1});G.state.res.food=100000;Object.assign(G.state.army,army);if(mount)H.addEquipment(G.state,'mount',1).hero='lin';return e;}
function start(e,army){const G=e.Game;assert.equal(G.dispatch('field','lin',army),null);e.advance(G.state.expedition.end-e.now()+1);assert.equal(G.startBattle(),null);return G.state.battle;}
test('mounts shorten real mixed-army marches and dispatch freezes both speed and the quote',()=>{
 const e=prepare(),G=e.Game,H=e.evaluate('HeroSystem'),army={cavalry:20,archer:1},q=G.marchQuote('field',army,'lin');
 H.addEquipment(G.state,'mount',1).hero='lin';const fast=G.marchQuote('field',army,'lin');assert.equal(fast.seconds,Math.ceil(q.seconds/1.06));assert.equal(fast.returnSeconds,Math.ceil(q.returnSeconds/1.06));assert.equal(fast.slowest,'archer');
 assert.equal(G.marchQuote('field',army).seconds,q.seconds);assert.equal(G.dispatch('field','lin',army),null);const trip=G.state.expedition;assert.equal(trip.mountProfile.speed,6);const end=trip.end;
 G.state.equipment[0].enhance=10;G.save();G.init();assert.equal(G.state.expedition.end,end);e.advance(end-e.now()+1);G.startBattle();assert.equal(G.state.battle.mountProfile.speed,6);
});
test('battle rows freeze initiative separately and only cavalry movement receives a mount boost',()=>{
 const a=prepare(false),b=prepare(true),army={cavalry:20,archer:1};const old=start(a,army),fast=start(b,army);
 for(const battle of [old,fast]){battle.length=4000;for(const r of battle.enemy)r.pos=4000;for(const row of battle.player)battle.orders[row.id].command='advance';}
 a.Game.battleRound();b.Game.battleRound();
 const move=(battle,id)=>battle.currentRoundSummary.events.find(x=>x.type==='move'&&x.side==='player'&&x.unit===id).to;
 assert.equal(move(fast,'cavalry'),Math.floor(move(old,'cavalry')*1.06));assert.equal(move(fast,'archer'),move(old,'archer'));
 assert.equal(fast.player[0].stats.initiative,fast.player[0].stats.speed*1.03);assert.equal(fast.player.find(x=>x.id==='archer').stats.moveSpeed,fast.player.find(x=>x.id==='archer').stats.speed);
 assert.equal(b.Game.validSave(b.Game.state),true);const bad=cloneActiveSave(b.Game.state);bad.battle.player[0].stats.moveSpeed=-1;assert.equal(b.Game.validSave(bad),false);
 const missing=cloneActiveSave(b.Game.state);delete missing.battle.mountProfile;assert.equal(b.Game.validSave(missing),false);
});
test('old marches without a profile never inherit the current mount when battle starts',()=>{
 const e=prepare(),G=e.Game,army={cavalry:20,archer:1};G.dispatch('field','lin',army);delete G.state.expedition.mountProfile;e.evaluate("HeroSystem.addEquipment(Game.state,'mount',1).hero='lin'");
 e.advance(G.state.expedition.end-e.now()+1);G.startBattle();assert.equal(G.state.battle.mountProfile,undefined);assert.equal(G.state.battle.player[0].stats.initiative,undefined);
});
test('mount profile validation rejects malformed expedition snapshots and a mismatched enemy speed',()=>{
 const e=prepare(true),G=e.Game;start(e,{cavalry:20,archer:1});assert.equal(G.validSave(G.state),true);
 const d=cloneActiveSave(G.state);d.expedition.mountProfile.march=2;assert.equal(G.validSave(d),false);
 const enemy=cloneActiveSave(G.state);enemy.battle.enemy[0].stats.initiative=enemy.battle.enemy[0].stats.speed*1.03;enemy.battle.enemy[0].stats.moveSpeed=enemy.battle.enemy[0].stats.speed;assert.equal(G.validSave(enemy),false);
});
test('equal-speed enemies act first without a mount and the mounted player gains initiative',()=>{
 for(const mounted of [false,true]){
  const e=prepare(mounted,{militia:200}),G=e.Game,b=start(e,{militia:200});const speed=b.player[0].stats.speed;
  for(const row of [...b.player,...b.enemy]){row.pos=0;row.stats.range=5000;}
  for(const row of b.enemy)row.stats.speed=speed;
  G.battleRound();assert.equal(b.currentRoundSummary.events.find(x=>x.type==='strike').side,mounted?'player':'enemy');
 }
});
test('mounted return and early recall keep the dispatched return duration after equipment changes',()=>{
 for(const recall of [false,true]){const e=prepare(true),G=e.Game;G.dispatch('field','lin',{cavalry:20,archer:1});const frozen=G.state.expedition.returnSeconds;G.state.equipment[0].enhance=10;G.state.tech.march=5;
  if(recall){e.advance((G.state.expedition.end-e.now())*.5);G.recall();assert.equal(G.state.expedition.end-G.state.expedition.start,frozen*.5*1000);}
  else{e.advance(G.state.expedition.end-e.now()+1);G.startBattle();for(const row of G.state.battle.enemy)row.hp=0;G.battleRound();assert.equal(G.state.expedition.end-G.state.expedition.start,frozen*1000);}
 }
});

test('idle horses never speed up an unassigned quote or legacy garrison recall',()=>{
 const e=prepare(),G=e.Game,H=e.evaluate('HeroSystem'),id='wild_31_32',army=Object.fromEntries(Object.keys(G.units).map(k=>[k,k==='archer'?20:0])),base=G.marchQuote(id,army).returnSeconds;
 H.addEquipment(G.state,'mount',1);assert.equal(H.mountProfile(G.state,'').speed,0);assert.equal(G.marchQuote(id,army).returnSeconds,base);
 G.state.conquered[id]=true;G.state.landClaims[id]={at:e.now(),level:G.getNode(id).level};G.state.garrisons[id]={general:'lin',army,phase:'stationed',start:e.now(),end:null};
 assert.equal(G.recallGarrison(id),null);assert.equal(G.state.garrisons[id].end-G.state.garrisons[id].start,base*1000);assert.equal(G.validSave(G.state),true);
});
test('positive mounted expedition and garrison profiles require a valid return duration',()=>{
 const e=prepare(true),G=e.Game;G.dispatch('field','lin',{archer:1,cavalry:20});assert.equal(G.validSave(G.state),true);
 for(const value of [undefined,NaN,0,Infinity]){const bad=cloneActiveSave(G.state);bad.expedition.returnSeconds=value;assert.equal(G.validSave(bad),false);}
 const saved=cloneActiveSave(G.state),trip=saved.expedition,id='wild_31_32';saved.expedition=null;saved.conquered[id]=true;saved.landClaims[id]={at:e.now(),level:G.getNode(id).level};saved.garrisons[id]={general:'lin',army:trip.army,phase:'stationed',start:e.now(),end:null,mountProfile:trip.mountProfile,returnSeconds:trip.returnSeconds};
 const active=cloneActiveSave(saved);assert.equal(G.validSave(active),true);delete active.garrisons[id].returnSeconds;assert.equal(G.validSave(active),false);
});
test('legacy battle returns do not inherit a horse equipped after departure',()=>{
 const e=prepare(),G=e.Game;G.dispatch('wild_0_0','lin',{archer:1,cavalry:20});delete G.state.expedition.mountProfile;
 const expected=G.marchQuote('wild_0_0',{archer:1,cavalry:20}).returnSeconds;e.evaluate("HeroSystem.addEquipment(Game.state,'mount',1).hero='lin'");
 e.advance(G.state.expedition.end-e.now()+1);G.startBattle();for(const row of G.state.battle.enemy)row.hp=0;G.battleRound();assert.equal(G.state.expedition.end-G.state.expedition.start,expected*1000);
});
