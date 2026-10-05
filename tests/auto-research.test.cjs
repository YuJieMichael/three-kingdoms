const {test}=require('node:test'),assert=require('node:assert/strict');
const {loadGame,city}=require('./helpers/game.cjs');
function campus(g){city(g,{academy:1});g.state.plots[0]={type:'farm',level:3};g.state.plots[1]={type:'lumber',level:3};for(const k of Object.keys(g.resources))g.state.res[k]=100000;}
test('legacy saves default auto research off and reject malformed switches',()=>{
  const {Game:g}=loadGame();const legacy=JSON.parse(JSON.stringify(g.state));delete legacy.autoResearch;
  g.importSave(legacy);assert.equal(g.state.autoResearch,false);assert.equal(g.validSave({...g.state,autoResearch:'true'}),false);assert.match(g.setAutoResearch('true'),/状态/);
});
test('automatic research chooses the lowest eligible level then stable list order',()=>{
  const {Game:g}=loadGame();campus(g);g.state.tech.plant=2;
  assert.equal(g.setAutoResearch(true),null);assert.equal(g.state.researchQueue.id,'logging');assert.equal(g.state.researchQueue.level,1);assert.match(g.autoResearchStatus(),/砍伐技术/);
});
test('missing prerequisites and unaffordable technologies are skipped',()=>{
  const {Game:g}=loadGame();city(g,{academy:1});g.state.plots[0]={type:'farm',level:1};g.state.res.food=0;
  g.state.res.gold=10000;g.setAutoResearch(true);assert.equal(g.state.researchQueue,null);assert.match(g.autoResearchStatus(),/资源不足/);
  g.state.res.food=5000;g.tick();assert.equal(g.state.researchQueue.id,'plant');assert.equal(g.state.res.gold,9000);
});
test('completion starts one next research and repeated ticks do not pay twice',()=>{
  const e=loadGame(),g=e.Game;campus(g);g.setAutoResearch(true);const end=g.state.researchQueue.end;
  e.advance(end-e.now()+1,true);assert.equal(g.state.tech.plant,1);assert.equal(g.state.researchQueue.id,'logging');
  const stock=JSON.stringify(g.state.res),queue=JSON.stringify(g.state.researchQueue);g.tick();g.tick();assert.equal(JSON.stringify(g.state.res),stock);assert.equal(JSON.stringify(g.state.researchQueue),queue);assert.equal(g.validSave(g.state),true);
});
test('pausing leaves the active research intact and prevents the next payment',()=>{
  const e=loadGame(),g=e.Game;campus(g);g.setAutoResearch(true);const queue=JSON.stringify(g.state.researchQueue);g.setAutoResearch(false);
  assert.equal(JSON.stringify(g.state.researchQueue),queue);e.advance(g.state.researchQueue.end-e.now()+1,true);assert.equal(g.state.tech.plant,1);assert.equal(g.state.researchQueue,null);assert.match(g.autoResearchStatus(),/已暂停/);
});
test('reload preserves switch and active queue; offline settles only existing research',()=>{
  const e=loadGame(),g=e.Game;campus(g);g.setAutoResearch(true);const gold=g.state.res.gold;const queue=JSON.stringify(g.state.researchQueue);g.save();g.init();
  assert.equal(g.state.autoResearch,true);assert.equal(JSON.stringify(g.state.researchQueue),queue);assert.equal(g.state.res.gold,gold);
  e.offline(7*86400000);assert.equal(g.state.tech.plant,1);assert.equal(g.state.tech.logging,0);assert.equal(g.state.researchQueue,null);
  g.tick();assert.equal(g.state.researchQueue.id,'logging');assert.equal(g.validSave(g.state),true);
});
test('waiting for academy and prerequisites resumes when they become available',()=>{
  const {Game:g}=loadGame();g.setAutoResearch(true);assert.match(g.autoResearchStatus(),/书院/);city(g,{academy:1});g.tick();assert.equal(g.state.researchQueue.id,'researching');
  g.setAutoResearch(false);g.state.researchQueue=null;g.state.res.food=5000;for(const id of Object.keys(g.state.tech))g.state.tech[id]=10;g.state.tech.plant=0;g.setAutoResearch(true);
  assert.match(g.autoResearchStatus(),/前置/);g.state.plots[0]={type:'farm',level:1};g.tick();assert.equal(g.state.researchQueue.id,'plant');
});
test('manual selection keeps priority even with the automatic switch enabled',()=>{
  const {Game:g}=loadGame();campus(g);g.state.autoResearch=true;assert.equal(g.research('researching'),null);assert.equal(g.state.researchQueue.id,'researching');g.tick();assert.equal(g.state.researchQueue.id,'researching');
});
test('all maxed technologies stop without charges while leaving switch enabled',()=>{
  const {Game:g}=loadGame();campus(g);for(const id of Object.keys(g.state.tech))g.state.tech[id]=10;const stock=JSON.stringify(g.state.res);g.setAutoResearch(true);g.tick();
  assert.equal(g.state.researchQueue,null);assert.match(g.autoResearchStatus(),/全部科技已满级/);assert.equal(JSON.stringify(g.state.res),stock);assert.equal(g.validSave(g.state),true);
});
test('instant research speedup completes once and automatically queues the next technology',()=>{
  const {Game:g}=loadGame();campus(g);g.state.inventory.speed_research_15m=1;g.setAutoResearch(true);
  const key=g.speedupKey('research',g.state.researchQueue),gold=g.state.res.gold;const receipt=g.useSpeedup('speed_research_15m',key);
  assert.equal(receipt.error,null);assert.equal(receipt.completed,true);assert.equal(g.state.tech.plant,1);assert.equal(g.state.researchQueue.id,'logging');assert.equal(g.state.res.gold,gold-1200);assert.equal(g.state.inventory.speed_research_15m,0);
  const snapshot=JSON.stringify(g.state);assert.ok(g.useSpeedup('speed_research_15m',key).error);assert.equal(JSON.stringify(g.state),snapshot);assert.equal(g.validSave(g.state),true);
});
