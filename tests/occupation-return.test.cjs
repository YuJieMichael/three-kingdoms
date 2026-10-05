const test=require('node:test');
const assert=require('node:assert/strict');
const {loadGame,city}=require('./helpers/game.cjs');
const clone=value=>JSON.parse(JSON.stringify(value));
const forest='wild_31_32';

// City levels, troop reserves and population are checkpoints. Deployments,
// combat, territory claims, gathering checks and return settlement use APIs.
function setup(seed=523){
 const e=loadGame(seed),g=e.Game;
 city(g,{hall:4,drill:4,house:4,tavern:6,inn:4});
 g.state.res.food=1000000;g.state.res.gold=1000000;
 g.state.population=g.workers();g.state.army.archer=1500;
 assert.equal(g.validSave(g.state),true);return e;
}
function recruit(e){const g=e.Game;assert.equal(g.refreshInn(),null);for(const hero of [...g.state.innCandidates])assert.equal(g.recruit(hero.id),null);return g.state.customGenerals.map(hero=>hero.id);}
function arrive(e,node=forest,general='lin',returnAfterOccupy,mode='occupy',archers=300){
 const g=e.Game;assert.equal(g.dispatch(node,general,{archer:archers},mode,returnAfterOccupy),null);
 e.advance(g.allExpeditions().find(x=>x.node===node).end-e.now()+1);
 assert.equal(g.startBattle(),null);assert.ok(g.state.battle.enemy.some(row=>row.hp>0));
}
function finish(e){const g=e.Game;for(let i=0;i<30&&!g.state.battle.finished;i++)g.battleRound();assert.equal(g.state.battle.finished,true);return g.state.battle.result;}
function assertValid(g){assert.equal(g.validSave(g.state),true);}
function reward(r){return clone({loot:r.loot,resourceReceipt:r.resourceReceipt,xp:r.xp,prestigeDelta:r.prestigeDelta,jewelDrops:r.jewelDrops,back:r.back,lost:r.lost,captures:r.captures,equipmentDrops:r.equipmentDrops,itemDrops:r.itemDrops,bonusLoot:r.bonusLoot});}

test('wild occupation return choice changes troop destination without changing the victory or its rewards',()=>{
 const variants=[undefined,false,true].map(choice=>{const e=setup();arrive(e,forest,'lin',choice);const r=finish(e);assert.equal(r.won,true);assert.equal(r.claimed,true);assert.equal(r.returnAfterOccupy,choice===true);assert.equal(e.Game.state.conquered[forest],true);assertValid(e.Game);return {e,r};});
 const baseline=reward(variants[0].r);
 for(const {e,r}of variants){const g=e.Game;assert.deepEqual(reward(r),baseline);assert.equal(g.state.army.archer,1200);
  if(r.returnAfterOccupy){assert.equal(r.stationed,false);assert.equal(g.state.garrisons[forest],undefined);assert.equal(g.state.expedition.phase,'return');assert.deepEqual(clone(g.state.expedition.army),clone(r.back));assert.equal(g.generalBusy('lin'),true);}
  else{assert.equal(r.stationed,true);assert.equal(g.state.expedition,null);assert.deepEqual(clone(g.state.garrisons[forest].army),clone(r.back));assert.equal(g.state.garrisons[forest].phase,'stationed');}
 }
});

test('a vacated occupation retains the land slot and production bonus but cannot gather without a garrison',()=>{
 const e=setup(),g=e.Game;city(g,{hall:1});g.state.plots[0]={type:'lumber',level:1};g.state.population=g.workers();const plot=g.state.plots[0],before=g.plotYield(plot);assert.ok(before>0);
 arrive(e,forest,'lin',true);const r=finish(e);assert.equal(r.won,true);assert.equal(g.wildOwned(),1);assert.ok(g.state.landClaims[forest]);
 assert.ok(Math.abs(g.plotYield(plot)-before*(1+g.getNode(forest).bonus.wood))<1e-9);
 assert.match(g.attackBlocked('wild_33_32','occupy'),/附属野地已满/);
 assert.match(e.evaluate(`HeritageSystem.startGather('${forest}')`),/驻守部队/);assert.equal(Object.keys(g.state.gatherings).length,0);
 e.advance(g.state.expedition.end-e.now()+1);assert.equal(g.state.conquered[forest],true);assert.equal(g.wildOwned(),1);assert.ok(g.plotYield(plot)>before);
 assert.equal(g.abandonWild(forest),null);assert.equal(g.wildOwned(),0);assert.equal(g.state.landClaims[forest],undefined);assert.equal(g.plotYield(plot),before);assertValid(g);
});

test('chosen return survives reload and offline settlement returns soldiers once while preserving the claim',()=>{
 const e=setup(),g=e.Game;arrive(e,forest,'lin',true);const r=finish(e),end=g.state.expedition.end,before=g.state.army.archer;
 e.offline(1);assert.equal(g.state.expedition.returnAfterOccupy,true);assert.equal(g.state.expedition.phase,'return');assert.equal(g.state.army.archer,before);assert.equal(g.state.reports[0].returnAfterOccupy,true);
 e.offline(end-e.now()+1);assert.equal(g.state.expedition,null);assert.equal(g.state.army.archer,before+r.back.archer);assert.equal(g.generalBusy('lin'),false);assert.equal(g.state.conquered[forest],true);assert.equal(g.state.garrisons[forest],undefined);
 const after=g.state.army.archer;e.advance(1000);e.offline(1000);assert.equal(g.state.army.archer,after);assert.equal(g.state.stats.victories,1);assertValid(g);
});

test('legacy marching and fighting occupations without the new field keep the existing default garrison outcome',()=>{
 for(const phase of ['march','battle']){const e=setup(),g=e.Game;
  assert.equal(g.dispatch(forest,'lin',{archer:300},'occupy'),null);
  if(phase==='battle'){e.advance(g.state.expedition.end-e.now()+1);assert.equal(g.startBattle(),null);g.battleRound();}
  const old=clone(g.state);delete old.expedition.returnAfterOccupy;assert.equal(g.validSave(old),true);g.importSave(old);
  if(phase==='march'){e.advance(g.state.expedition.end-e.now()+1);assert.equal(g.startBattle(),null);}
  const r=finish(e);assert.equal(r.won,true);assert.equal(r.stationed,true);assert.equal(r.returnAfterOccupy,false);assert.equal(g.state.expedition,null);assert.ok(g.state.garrisons[forest]);assertValid(g);
 }
});

test('independent return choices stay with each army when selecting and reloading multiple expeditions',()=>{
 const e=setup(),g=e.Game,heroes=recruit(e),stay='wild_33_32';
 assert.equal(g.dispatch(forest,'lin',{archer:300},'occupy',true),null);assert.equal(g.dispatch(stay,heroes[0],{archer:300},'occupy',false),null);
 assert.equal(g.selectExpedition(stay),null);e.offline(1);
 assert.equal(g.state.expedition.node,stay);assert.equal(g.state.expedition.returnAfterOccupy,false);assert.equal(g.state.expeditions[0].returnAfterOccupy,true);
 const latest=Math.max(...g.allExpeditions().map(x=>x.end));e.advance(latest-e.now()+1);assert.equal(g.startBattle(),null);
 const stayed=finish(e);assert.equal(stayed.stationed,true);assert.equal(g.selectExpedition(forest),null);assert.equal(g.state.expedition.node,forest);assert.equal(g.state.expedition.returnAfterOccupy,true);assert.equal(g.startBattle(),null);
 const returned=finish(e);assert.equal(returned.stationed,false);assert.equal(g.state.expedition.node,forest);assert.equal(g.state.expedition.phase,'return');assert.equal(Object.keys(g.state.garrisons).length,1);assert.ok(g.state.garrisons[stay]);
 const stationedCount=g.state.garrisons[stay].army.archer;e.offline(g.state.expedition.end-e.now()+1);assert.equal(g.state.army.archer,900+returned.back.archer);assert.equal(g.state.garrisons[stay].army.archer,stationedCount);assert.equal(g.wildOwned(),2);assertValid(g);
});

test('invalid return choices fail before spending food, consuming buffs or deploying troops',()=>{
 const e=setup(),g=e.Game;g.state.buffs.flag={effect:'flag',general:null,end:e.now()+60000};
 for(const choice of [null,0,1,'true','false',{},[]]){const before=JSON.stringify(g.state);assert.match(g.dispatch(forest,'lin',{archer:300},'occupy',choice),/返回|返城|状态|选项/);assert.equal(JSON.stringify(g.state),before);}
 assert.equal(g.dispatch(forest,'lin',{archer:300},'occupy',false),null);assert.equal(g.state.expedition.returnAfterOccupy,false);assert.equal(g.state.buffs.flag,undefined);assertValid(g);
});

test('saves reject malformed choices on either expedition and new reports but accept older reports',()=>{
 const e=setup(),g=e.Game,heroes=recruit(e);assert.equal(g.dispatch(forest,'lin',{archer:300},'occupy',true),null);assert.equal(g.dispatch('wild_33_32',heroes[0],{archer:300},'occupy',false),null);
 for(const field of ['expedition','expeditions'])for(const choice of [null,1,'false',{}]){const bad=clone(g.state);(field==='expedition'?bad.expedition:bad.expeditions[0]).returnAfterOccupy=choice;assert.equal(g.validSave(bad),false);assert.throws(()=>g.importSave(bad),/Invalid save/);}
 e.advance(g.state.expedition.end-e.now()+1);assert.equal(g.startBattle(),null);finish(e);
 for(const choice of [null,1,'true',{}]){const bad=clone(g.state);bad.reports[0].returnAfterOccupy=choice;assert.equal(g.validSave(bad),false);const battleBad=clone(g.state);battleBad.battle.result.returnAfterOccupy=choice;assert.equal(g.validSave(battleBad),false);}
 const old=clone(g.state);delete old.battle.result.returnAfterOccupy;for(const report of old.reports)delete report.returnAfterOccupy;assert.equal(g.validSave(old),true);g.importSave(old);assertValid(g);
});

test('raids, task strongholds and war orders still return automatically and normalize an irrelevant choice',()=>{
 for(const [node,mode,orders]of [[forest,'raid',false],['field','occupy',false],['order_field_1','occupy',true]]){
  const values=[false,true].map(choice=>{const e=setup(),g=e.Game;if(orders){g.state.conquered.north_keep=true;g.state.army.archer=1500;}
   arrive(e,node,'lin',choice,mode,orders?1100:300);assert.equal(g.state.expedition.returnAfterOccupy,false);const r=finish(e);assert.equal(r.won,true);assert.equal(r.returnAfterOccupy,false);assert.equal(r.stationed,false);assert.equal(g.state.expedition.phase,'return');assert.equal(Object.keys(g.state.garrisons).length,0);assertValid(g);return reward(r);
  });assert.deepEqual(values[1],values[0]);
 }
});

test('failed wild occupations return remaining troops without claiming land or creating a garrison',()=>{
 const e=setup(),g=e.Game;arrive(e,forest,'lin',true,'occupy',1);const r=finish(e);assert.equal(r.won,false);assert.equal(r.returnAfterOccupy,true);assert.equal(r.stationed,false);assert.equal(r.claimed,false);assert.equal(g.state.conquered[forest],undefined);assert.equal(g.state.landClaims[forest],undefined);assert.equal(g.state.garrisons[forest],undefined);assert.equal(g.state.expedition.phase,'return');assert.equal(Object.keys(r.loot).length,0);assert.equal(g.wildOwned(),0);assertValid(g);
});
