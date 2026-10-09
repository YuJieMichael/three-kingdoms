const {test}=require('node:test'),assert=require('node:assert/strict');
const {run}=require('./balance/long-run-soak.cjs');
test('four-day soak: armies left in captured cities starve without supply, and a food supply line from the capital keeps them whole',()=>{
  const bare=run({hours:96}),fed=run({hours:96,supply:true});
  assert.equal(bare.validSave,true);assert.equal(fed.validSave,true);
  for(const id of bare.cities){assert.ok(bare.deserted[id]>bare.startArmy[id]*.4,id+' deserted '+bare.deserted[id]);assert.equal(fed.deserted[id],0);}
  assert.ok(bare.days.at(-1).capital.food>bare.days[0].capital.food,'the capital itself runs a food surplus');
});
test('the guide points a starving captured city to a food supply line from the city with the largest surplus',()=>{
  const {prepareRealm}=require('./balance/long-run-soak.cjs');const {e,cities}=prepareRealm({});const g=e.Game,guide=e.evaluate('GrowthGuide');g.onboarding.claimAvailable();
  const before=JSON.stringify(g.state);const m=guide.model(g);assert.equal(JSON.stringify(g.state),before);
  assert.equal(m.kind,'supply');assert.ok(cities.includes(m.id));assert.equal(m.source,'capital');assert.ok(m.rate<0);assert.match(m.reason,/逃散 1%/);
  const draft={sourceCity:'capital',destinationCity:m.id,resource:'food',targetStock:60000,sourceReserve:100000,army:{wagon:10},enabled:true};
  assert.equal(g.saveSupplyLine(draft,g.supplyLineQuote(draft).key),null);assert.notEqual(guide.model(g).id,m.id,'a fed city drops out of the guide');
});
