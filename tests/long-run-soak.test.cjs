const {test}=require('node:test'),assert=require('node:assert/strict');
const {run,prepareRealm}=require('./balance/long-run-soak.cjs');
test('four-day soak: the automatic grain dispatch keeps captured-city garrisons fed without supply lines, and supply lines still work',()=>{
  const bare=run({hours:96}),fed=run({hours:96,supply:true});
  assert.equal(bare.validSave,true);assert.equal(fed.validSave,true);
  for(const id of bare.cities){assert.equal(bare.deserted[id],0,id);assert.equal(fed.deserted[id],0,id);assert.ok(bare.days.at(-1)[id].food>0,id);}
  assert.ok(bare.days.at(-1).capital.food>bare.days[0].capital.food,'the capital itself still runs a food surplus');
});
test('automatic dispatch tops a hungry city up to a day of upkeep from the richest city and loses 10% on the road',()=>{
  const {e,cities}=prepareRealm({}),g=e.Game,id=cities[0];
  g.state.realm.cities[id].data.res.food=0;const capital=g.getCityState('capital').res.food,rate=-g.citySummary(id).rates.food*60;
  e.advance(60000,true);const got=g.getCityState(id).res.food,sent=capital-g.getCityState('capital').res.food;
  assert.ok(got>=rate*23&&got<=rate*25,'topped to about 24 h: '+got+' vs '+rate);assert.ok(sent>got,'the road loses part of the grain');
});
test('the guide points a starving captured city to a food supply line once no city has spare grain for the automatic dispatch',()=>{
  const {e,cities}=prepareRealm({});const g=e.Game,guide=e.evaluate('GrowthGuide');g.onboarding.claimAvailable();
  g.state.res.food=15000;for(const id of cities)g.state.realm.cities[id].data.res.food=0;
  const before=JSON.stringify(g.state);const m=guide.model(g);assert.equal(JSON.stringify(g.state),before);
  assert.equal(m.kind,'supply');assert.ok(cities.includes(m.id));assert.equal(m.source,'capital');assert.ok(m.rate<0);assert.match(m.reason,/逃散 1%/);
  const draft={sourceCity:'capital',destinationCity:m.id,resource:'food',targetStock:60000,sourceReserve:1000,army:{wagon:10},enabled:true};
  assert.equal(g.saveSupplyLine(draft,g.supplyLineQuote(draft).key),null);assert.notEqual(guide.model(g).id,m.id,'a fed city drops out of the guide');
});
