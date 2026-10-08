const {test}=require('node:test'),assert=require('node:assert/strict');
const {loadGame}=require('./helpers/game.cjs');
test('free points only go to 勇武, 内政 and 智谋; 统御 and 统率 are rejected without spending',()=>{
  const e=loadGame(),g=e.Game,s=g.state,id=s.generals[0];s.generalLevels[id]=20;
  const left=()=>e.evaluate(`HeroSystem.remaining(Game.state,${JSON.stringify(id)})`),before=left();assert.ok(before>=3);
  assert.deepEqual([...e.evaluate('HeroSystem.allocatable')],['atk','pol','wis']);
  const snapshot=JSON.stringify(s.heroPoints[id]);
  for(const bad of [{atk:0,def:1,pol:0,wis:0,lead:0},{atk:1,def:0,pol:0,wis:0,lead:1}]){
    assert.equal(e.evaluate(`HeroSystem.allocate(${JSON.stringify(id)},${JSON.stringify(bad)})`),'统御与统率不能加点');
    assert.equal(JSON.stringify(s.heroPoints[id]),snapshot);assert.equal(left(),before);
  }
  assert.equal(e.evaluate(`HeroSystem.allocate(${JSON.stringify(id)},{atk:1,def:0,pol:1,wis:1,lead:0})`),null);
  assert.equal(left(),before-3);assert.equal(s.heroPoints[id].atk,1);assert.equal(s.heroPoints[id].pol,1);assert.equal(s.heroPoints[id].wis,1);assert.equal(g.validSave(s),true);
});
