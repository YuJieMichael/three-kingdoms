const {test}=require('node:test'),assert=require('node:assert/strict');
const {run}=require('./balance/realm-soak.cjs');
test('five captured cities fed by default supply lines hold for a day at 1× clock while the capital raids and defends',()=>{
  const r=run({seed:723,hours:24});
  assert.equal(r.validSave,true);assert.equal(r.cities.length,5);assert.equal(r.raids.won,r.raids.done);
  for(const id of r.cities){assert.equal(r.deserted[id],0,id);assert.equal(r.starving[id].hours,0,id);}
  assert.equal(r.inventoryGain,r.blueprints.wild+r.blueprints.defense,'every counted blueprint reached the inventory');
  assert.ok(r.end.capital.rate>0,'the capital still runs a food surplus after feeding five cities');
});
