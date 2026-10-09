const {opening,hallGrowth}=require('./balance/targets.cjs');
const {test}=require('node:test'),assert=require('node:assert/strict');
const {loadGame,city}=require('./helpers/game.cjs');
const {run}=require('./balance/archer-onboarding.cjs');
const copy=value=>JSON.parse(JSON.stringify(value));
const close=(actual,expected)=>assert.ok(Math.abs(actual-expected)<1e-6,actual+' != '+expected);

test('hall pacing keeps the opening reference times and applies the normal governor and speed bonuses',()=>{
  const e=loadGame(),g=e.Game;
  const divisor=()=>1+g.state.tech.construction*.1+g.general(g.state.governor).pol/100;
  close(g.buildSeconds('hall',1),g.buildRecord('hall',1).seconds/divisor());
  // Hall 2 is shortened to 8 minutes (design/balance/opening-pace-2026-10-08.md).
  close(g.buildSeconds('hall',2),hallGrowth.levelTwoSeconds/divisor());
  let previous=g.buildSeconds('hall',3);
  for(let level=4;level<=10;level++){
    const seconds=g.buildSeconds('hall',level);
    assert.ok(seconds>previous);
    assert.ok(seconds<=previous*hallGrowth.stepMaxRatio);
    previous=seconds;
  }
  const hall=g.buildSeconds('hall',10);
  assert.ok(hall<g.buildRecord('hall',10).seconds/divisor()*hallGrowth.levelTenReferenceMaxRatio);
  close(g.buildSeconds('wall',8),g.buildRecord('wall',8).seconds/divisor());
  close(g.buildSeconds('house',10),g.buildRecord('house',10).seconds/divisor());
  assert.equal(g.setGovernor('lin'),null);
  close(g.buildSeconds('hall',10),e.evaluate('OnboardingData.hallSeconds[9]')/divisor());
  const before=g.buildSeconds('hall',10);
  assert.equal(g.setSpeed(10),null);
  close(g.buildSeconds('hall',10),before/10);
  close(g.buildSeconds('wall',8),g.buildRecord('wall',8).seconds/divisor()/10);
});

test('a saved hall queue retains its paid work and original completion time across the pacing update',()=>{
  const e=loadGame(),g=e.Game;
  // This is an existing-save compatibility fixture, not a fresh progression.
  city(g,{hall:9,wall:8});
  assert.equal(g.onboarding.claimAvailable(),null);
  assert.equal(g.queueBuilding(14,'hall'),null);
  const old=copy(g.state),queue=old.buildQueue.find(q=>q.id==='hall');
  const referenceSeconds=g.buildRecord('hall',10).seconds/(1+g.state.tech.construction*.1+g.general(g.state.governor).pol/100);
  queue.end=queue.start+referenceSeconds*1000;
  // The pre-pacing queue predates multi-city saves, so it has no realm mirror.
  // A modern queue changed in only one projection must continue to be rejected.
  assert.equal(g.validSave(g.migrateSave(old)),false);
  delete old.realm;
  const originalEnd=queue.end,paid=copy(queue.paid),inventory=copy(old.inventory);
  const original=JSON.stringify(old),migrated=g.migrateSave(old);
  assert.equal(JSON.stringify(old),original);assert.equal(g.validSave(migrated),true);
  g.importSave(old);g.save();g.init();
  assert.equal(g.state.buildQueue[0].end,originalEnd);
  assert.deepEqual(copy(g.state.buildQueue[0].paid),paid);
  assert.deepEqual(copy(g.state.inventory),inventory);
  assert.ok(g.buildSeconds('hall',10)<referenceSeconds);
  e.advance(Math.ceil(g.buildSeconds('hall',10)*1000)+1);
  assert.equal(g.state.buildings.hall,9);
  assert.equal(g.state.buildQueue[0].end,originalEnd);
  e.advance(Math.ceil(originalEnd-e.now())+1);
  assert.equal(g.state.buildings.hall,10);
  assert.equal(g.state.buildQueue.length,0);
  assert.equal(g.validSave(g.state),true);
});

test('previously claimed construction speedups remain in inventory and are not clawed back or paid again',()=>{
  const e=loadGame(),g=e.Game;
  city(g,{hall:9});
  assert.equal(g.onboarding.claimAvailable(),null);
  const old=copy(g.state);
  // A saved inventory can still contain the larger pre-update construction gifts.
  Object.assign(old.inventory,{speed_build_3h:10,speed_build_8h:28,speed_build_15_30h:3});
  const inventory=copy(old.inventory),resources=copy(old.res),claims=[...old.onboarding.claims];
  assert.equal(g.validSave(old),true);
  g.importSave(old);g.save();g.init();
  assert.deepEqual(copy(g.state.inventory),inventory);
  assert.deepEqual(copy(g.state.res),resources);
  assert.deepEqual([...g.state.onboarding.claims],claims);
  assert.ok(g.onboarding.claimAvailable());
  assert.deepEqual(copy(g.state.inventory),inventory);
  assert.deepEqual(copy(g.state.res),resources);
});

test('earned gifts keep the thirty-archer opening under ninety minutes',()=>{
  for(const seed of [123,456]){
    const result=run(seed,true);
    assert.equal(result.archers,30);
    assert.ok(result.minutes<opening.archersMaxMinutes);
    assert.equal(result.hall,2);
    assert.equal(result.validSave,true);
  }
});

test('normal APIs distribute hall growth over one to two days instead of a final multi-day cliff',()=>{
  for(const seed of [123,456,4,18]){
    const result=run(seed,true,'ten-gifts'),hours=result.minutes/60;
    assert.equal(result.hall,10);
    assert.equal(result.gifts,10);
    assert.equal(result.firstBattle,'complete');
    assert.ok(hours>=hallGrowth.tenGiftsHours.min&&hours<=hallGrowth.tenGiftsHours.max,'seed '+seed+': '+hours+' hours');
    const halls=result.queueLog.filter(q=>q.kind==='build'&&q.id==='hall');
    const waiting=level=>halls.find(q=>q.level===level).waitSeconds/3600;
    for(const level of [7,8,9,10])assert.ok(waiting(level)>=hallGrowth.lateWaitHours.min&&waiting(level)<hallGrowth.lateWaitHours.max,'seed '+seed+', hall '+level);
    assert.ok(waiting(7)<waiting(8)&&waiting(8)<waiting(9));
    assert.ok(waiting(10)<=waiting(9)*hallGrowth.finalWaitMaxRatio);
    assert.equal(result.validSave,true);
  }
});
