const {test}=require('node:test'),assert=require('node:assert/strict');
const {loadGame}=require('./helpers/game.cjs');
const {run}=require('./balance/named-siege.cjs');
const ENGINES={archer:14000,shield:6000,spear:5000,cavalry:3000,ram:30,catapult:16};
test('a famous-general county holds while loyalty is 30+, falls on the first win below 30, and the general joins',()=>{
  const r=run({id:'named_xiaopei',army:ENGINES,maxAssaults:10});
  assert.equal(r.captured,true);assert.equal(r.recruited,true);assert.equal(r.generalJoined,true);assert.equal(r.validSave,true);
  const wins=r.log.filter(l=>l.won);assert.ok(wins.length>=2,'several wins are needed');assert.ok(wins.slice(0,-1).every(l=>!l.claimed),'earlier wins only besiege');
  const last=r.log.at(-1);assert.ok(Number(last.loyalty.split('→')[0])<30);assert.ok(r.hours>=24&&r.hours<=72,'about two days: '+r.hours);
});
test('without rams or catapults the engine wall stands and the city cannot be taken',()=>{
  const r=run({id:'named_xiaopei',army:{archer:14000,shield:6000,spear:5000,cavalry:3000},maxAssaults:3});
  assert.equal(r.captured,false);assert.ok(r.log.every(l=>!l.won&&l.gate>0));
});
test('a famous-general prefecture needs a third of the named cities first',()=>{
  const r=run({id:'named_xiapi',army:{archer:30000,shield:12000,spear:10000,cavalry:8000,ram:60,catapult:40},maxAssaults:1});
  assert.match(r.log[0].error,/三分之一的名城（0 \/ 6）/);
});
test('viewing a garrisoned city does not change the save, and 72 hours without pressure restores the garrison',()=>{
  const e=loadGame(),g=e.Game,id='named_wancheng';const before=JSON.stringify(g.state);g.getNode(id);g.garrisonStatus(id);assert.equal(JSON.stringify(g.state),before);
  const rec=g.state.realm.namedCities.garrisons[id];rec.loyalty=40;rec.pressureAt=e.now();rec.updatedAt=e.now();
  e.advance(71*3600000);assert.ok(g.garrisonStatus(id).loyalty<100);e.advance(2*3600000);assert.equal(g.garrisonStatus(id).loyalty,100);assert.equal(g.validSave(g.state),true);
});
