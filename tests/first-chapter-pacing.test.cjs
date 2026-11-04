const {test}=require('node:test'),assert=require('node:assert/strict');
const {loadGame,city,cloneActiveSave}=require('./helpers/game.cjs');
const {run}=require('./balance/first-chapter.cjs');
test('three fresh games clear five distinct objectives and rescue Yan in 30–60 minutes without time speedups',()=>{
  for(const seed of [7,123,456]){
    const r=run(seed);
    assert.ok(r.minutes>=30&&r.minutes<=60,seed+': '+r.minutes);
    assert.ok(r.chapter.every(n=>n.done));assert.ok(r.generals.includes('yan'));assert.equal(r.validSave,true);
    assert.deepEqual(Object.keys(r.used),['population']);assert.ok(r.longestQueueWaitMinutes<6);
    assert.equal(r.log.filter(x=>x.target.includes('占领赤铁山')).length,1);
  }
});
test('opening timing changes only early preparation and ends at chapter completion; prices and queued work stay intact',()=>{
  const e=loadGame(),g=e.Game,early=g.buildSeconds('hall',3),price=JSON.stringify(g.buildRecord('hall',3).cost),research=g.researchSeconds('plant'),train=g.trainSeconds('archer',10),cavalry=g.trainSeconds('cavalry',10);
  city(g,{hall:2,house:2,academy:2,barracks:2});for(const id of Object.keys(g.resources))g.state.res[id]=1e6;
  const site=g.primarySite('house');assert.equal(g.queueBuilding(site,'house'),null);const original=JSON.stringify(g.state.buildQueue);
  g.state.conquered.camp=true;
  assert.ok(Math.abs(g.buildSeconds('hall',3)/early-1/.03)<1e-9);assert.equal(JSON.stringify(g.buildRecord('hall',3).cost),price);
  assert.ok(g.researchSeconds('plant')>research*30);assert.ok(Math.abs(g.trainSeconds('archer',10)/train-1/.03)<1e-9);assert.equal(g.trainSeconds('cavalry',10),cavalry);
  assert.equal(JSON.stringify(g.state.buildQueue),original);const saved=cloneActiveSave(g.state);g.importSave(saved);assert.equal(JSON.stringify(g.state.buildQueue),original);
  const factor=e.evaluate('OnboardingData.openingFactor');assert.equal(factor.call(e.evaluate('OnboardingData'),g.state,'build','hall',6),1);
});
test('legacy mine victories migrate to a cleared objective without replaying battle loot',()=>{
  for(const count of [1,2,3]){
    const e=loadGame(),g=e.Game,old=cloneActiveSave(g.state);old.stageTasks.mine={count};old.raided.mine=true;
    const res=JSON.stringify(old.res),claims=JSON.stringify(old.missionClaims);g.importSave(old);
    assert.equal(g.chapterTaskDone('mine'),true);assert.equal(g.state.conquered.mine,true);assert.equal(g.state.stageTasks.mine.count,1);
    assert.equal(JSON.stringify(g.state.res),res);assert.equal(JSON.stringify(g.state.missionClaims),claims);assert.equal(g.validSave(g.state),true);
  }
  for(const record of [{count:4},{count:1,done:false},{count:1.5},{count:2,unexpected:true}]){
    const e=loadGame(),invalid=cloneActiveSave(e.Game.state);invalid.stageTasks.mine=record;assert.throws(()=>e.Game.importSave(invalid));
  }
});
