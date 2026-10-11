const {test}=require('node:test'),assert=require('node:assert/strict');const {loadGame}=require('./helpers/game.cjs');
test('graded wild budgets preserve seeded composition, resource valuation and pure map reads',()=>{
 const e=loadGame(),g=e.Game,before=JSON.stringify(g.state),r=e.evaluate('ReferenceRules'),w=e.evaluate('WildFields');
 for(const level of [0,1,2,3,5,6,8,9,10]){
  const factor=level===0?1:level<=2?1.25:level<=5?1.5:level<=8?2:2.5,seed=82127,override={seed,type:'forest',level,legacy:false};
  const n=g.legacyWildTile(12,12,g.state,override),budget=(r.fieldBudget[level]||0)*1.1*factor,expected={};let allocated=0;
  Object.keys(r.npcValues).forEach((id,i)=>{const weight=w.weight(seed,i)%(100-allocated||1);allocated+=weight;const count=Math.floor(budget*weight*.0078/r.npcValues[id]);if(count>0)expected[id]=count;});if(level&&!Object.keys(expected).length)expected.militia=1;
  assert.deepEqual({...n.army},expected,'level '+level);assert.equal(n.loot.wood,Object.entries(expected).reduce((v,[id,count])=>v+Math.floor(count*r.npcValues[id]/.784),0));
 }
 assert.equal(JSON.stringify(g.state),before);
});
