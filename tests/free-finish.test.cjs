const {test}=require('node:test'),assert=require('node:assert/strict');
const {loadGame,city}=require('./helpers/game.cjs');
test('a started build with 5 minutes or less left finishes at once for free; longer builds are refused unchanged',()=>{
  const e=loadGame(),g=e.Game;city(g,{hall:3});g.state.res.food=g.state.res.wood=g.state.res.stone=g.state.res.iron=1e6;
  const site=g.state.cityLayout.indexOf(null);assert.equal(g.queueBuilding(site,'house'),null);
  const q=g.state.buildQueue.find(x=>x.site===site),key=g.speedupKey('build',q);
  q.end=e.now()+600000;const before=JSON.stringify(g.state);
  assert.equal(g.freeFinishReady(q),false);assert.match(g.freeFinishBuild(key),/超过 5 分钟/);assert.equal(JSON.stringify(g.state),before);
  e.advance(300000);assert.equal(g.freeFinishReady(q),true);
  const items=JSON.stringify(g.state.inventory),res=JSON.stringify(g.state.res);
  assert.equal(g.freeFinishBuild(key),null);assert.equal(g.state.buildQueue.some(x=>x.site===site),false);assert.equal(g.state.cityLevels[site],1);
  assert.equal(JSON.stringify(g.state.inventory),items,'no speedup item is spent');assert.equal(JSON.stringify(g.state.res),res,'no resource is spent');
  assert.match(g.freeFinishBuild(key),/已完成或不存在/);assert.equal(g.validSave(g.state),true);
});
test('hall level 2 takes 8 minutes before governor and technology bonuses',()=>{
  const e=loadGame();assert.equal(e.evaluate('OnboardingData.hallBuildSeconds(2,2244)'),480);assert.equal(e.evaluate('OnboardingData.hallBuildSeconds(3,1)'),9000);
});
