const {test}=require('node:test'),assert=require('node:assert/strict');
const {loadGame,city}=require('./helpers/game.cjs');
test('a starving city can still march on its separate rations, which upkeep never eats and which refill hourly',()=>{
  const e=loadGame(),g=e.Game,s=g.state;city(g,{hall:2,drill:1,barracks:1});s.army.militia=200;s.res.food=0;
  assert.equal(g.marchRations().amount,20000);
  const err=g.dispatch('field','lin',{militia:100},'raid');assert.equal(err,null);const used=20000-g.marchRations().amount;assert.ok(used>0,'rations paid the march');assert.equal(s.res.food,0);
  e.advance(3600000);assert.equal(g.marchRations().amount,Math.min(20000,20000-used+2000),'refills 2,000 per hour');
  s.res.food=1e6;const before=g.marchRations().amount;e.advance(10*3600000);assert.equal(g.marchRations().amount,20000);assert.equal(g.validSave(s),true);
  assert.ok(before<=20000);
});
