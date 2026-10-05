const {test}=require('node:test'),assert=require('node:assert/strict');
const {loadGame}=require('./helpers/game.cjs');

function supplies(g){for(const id of Object.keys(g.resources))g.state.res[id]=2000000;}
function earned(g,id){const level=g.state.generalLevels[id];return level*(level-1)*40+g.state.generalXp[id];}
function buildCity(e,id='house'){
  const g=e.Game,site=g.state.cityLayout.indexOf(null);
  assert.equal(g.queueBuilding(site,id),null);
  return g.state.buildQueue.find(q=>q.site===site);
}
function finish(e,q,automation=false){e.advance(Math.ceil(q.end-e.now())+1,automation);}
function quietSettings(g){const a=g.state.automation;return {researchFocus:a.researchFocus,researchPriority:a.researchPriority,reserve:{...a.reserve},notify:false};}

test('city construction and upgrades grant experience only when each level completes',()=>{
  const e=loadGame(),g=e.Game;supplies(g);
  const q=buildCity(e);
  assert.equal(earned(g,'su'),0);
  e.advance(Math.floor(q.end-e.now())-1);
  assert.equal(earned(g,'su'),0);
  finish(e,q);
  assert.equal(g.state.cityLevels[q.site],1);
  assert.equal(earned(g,'su'),10);
  assert.equal(earned(g,'lin'),0);
  assert.equal(g.upgrade(q.site),null);
  assert.equal(earned(g,'su'),10);
  finish(e,g.state.buildQueue.find(job=>job.site===q.site));
  assert.equal(g.state.cityLevels[q.site],2);
  assert.equal(earned(g,'su'),30);
  assert.equal(g.validSave(g.state),true);
});

test('resource field construction, upgrades and replacement each reward the completed level',()=>{
  const e=loadGame(),g=e.Game;supplies(g);
  assert.equal(g.developPlot(0,'farm'),null);
  assert.equal(earned(g,'su'),0);
  finish(e,g.plotJob(0));
  assert.equal(g.state.plots[0].type,'farm');
  assert.equal(g.state.plots[0].level,1);
  assert.equal(earned(g,'su'),10);
  assert.equal(g.developPlot(0,'farm'),null);
  finish(e,g.plotJob(0));
  assert.equal(g.state.plots[0].level,2);
  assert.equal(earned(g,'su'),30);
  assert.equal(g.developPlot(0,'lumber'),null);
  assert.equal(g.plotJob(0).kind,'replace');
  assert.equal(earned(g,'su'),30);
  finish(e,g.plotJob(0));
  assert.equal(g.state.plots[0].type,'lumber');
  assert.equal(g.state.plots[0].level,1);
  assert.equal(earned(g,'su'),40);
  assert.equal(g.validSave(g.state),true);
});

test('starting, canceling, relocating and demolishing do not grant construction experience',()=>{
  const e=loadGame(),g=e.Game;supplies(g);
  const canceled=buildCity(e);
  assert.equal(g.cancelBuild('site:'+canceled.site),null);
  assert.equal(earned(g,'su'),0);
  assert.equal(g.developPlot(0,'farm'),null);
  assert.equal(g.cancelBuild('plot:0'),null);
  assert.equal(earned(g,'su'),0);
  const built=buildCity(e);finish(e,built);
  const destination=g.state.cityLayout.findIndex((id,i)=>id===null&&i!==built.site);
  assert.equal(g.relocateBuilding('house',destination),null);
  assert.equal(earned(g,'su'),10);
  assert.equal(g.upgrade(destination),null);
  assert.equal(g.cancelBuild('site:'+destination),null);
  assert.equal(earned(g,'su'),10);
  assert.equal(g.demolish(destination),null);
  assert.equal(earned(g,'su'),10);
  assert.equal(g.validSave(g.state),true);
});

test('instant construction speedups reward once across repeated ticks and reloads',()=>{
  const e=loadGame(),g=e.Game;supplies(g);
  g.state.inventory.speed_build_15m=1;
  const q=buildCity(e),key=g.speedupKey('build',q);
  const receipt=g.useSpeedup('speed_build_15m',key);
  assert.equal(receipt.error,null);
  assert.equal(receipt.completed,true);
  assert.equal(earned(g,'su'),10);
  assert.equal(g.state.buildQueue.length,0);
  g.tick();g.tick();g.save();g.init();
  assert.equal(earned(g,'su'),10);
  assert.ok(g.useSpeedup('speed_build_15m',key).error);
  assert.equal(earned(g,'su'),10);
  assert.equal(g.validSave(g.state),true);
});

test('offline settlement rewards every existing city and field job once even beyond the income cap',()=>{
  const e=loadGame(),g=e.Game;supplies(g);
  const q=buildCity(e);
  assert.equal(g.developPlot(0,'farm'),null);
  assert.equal(earned(g,'su'),0);
  e.offline(3*86400000);
  assert.equal(g.state.cityLevels[q.site],1);
  assert.equal(g.state.plots[0].level,1);
  assert.equal(g.state.buildQueue.length,0);
  assert.equal(earned(g,'su'),20);
  g.tick();g.save();g.init();
  assert.equal(earned(g,'su'),20);
  assert.equal(g.validSave(g.state),true);
});

test('automatic upgrades grant experience with notifications disabled and do not reward the next queue early',()=>{
  const e=loadGame(),g=e.Game;supplies(g);
  const first=buildCity(e);finish(e,first);
  const noticeCount=g.state.automation.notices.length;
  assert.equal(g.setAutomationSettings(quietSettings(g)),null);
  assert.equal(g.setAutoUpgrade(true),null);
  assert.ok(g.state.buildQueue.length>0);
  assert.ok(g.state.buildQueue.every(q=>q.auto));
  const earliest=Math.min(...g.state.buildQueue.map(q=>q.end));
  const due=g.state.buildQueue.filter(q=>q.end<=earliest+1);
  const expected=10+due.reduce((sum,q)=>sum+q.level*10,0);
  e.advance(Math.ceil(earliest-e.now())+1,true);
  assert.equal(earned(g,'su'),expected);
  assert.equal(g.state.automation.notices.length,noticeCount);
  assert.ok(g.state.buildQueue.some(q=>q.auto&&q.end>e.now()));
  g.tick();g.tick();
  assert.equal(earned(g,'su'),expected);
  assert.equal(g.validSave(g.state),true);
});

test('a governor appointed before completion receives the experience instead of the governor who started it',()=>{
  const e=loadGame(),g=e.Game;supplies(g);
  const q=buildCity(e);
  assert.equal(g.setGovernor('lin'),null);
  finish(e,q);
  assert.equal(earned(g,'su'),0);
  assert.equal(earned(g,'lin'),10);
  assert.equal(g.validSave(g.state),true);
});

test('overdue construction settles for the previous governor before an appointment changes the office',()=>{
  const e=loadGame(),g=e.Game;supplies(g);
  const q=buildCity(e),overdue=Math.ceil(q.end)+1;
  // Advance the mocked wall clock without settling, reproducing an appointment
  // arriving after completion but before the next timer callback.
  e.evaluate('Date.now=()=>'+overdue);
  assert.equal(g.setGovernor('lin'),null);
  assert.equal(g.state.cityLevels[q.site],1);
  assert.equal(g.state.buildQueue.length,0);
  assert.equal(earned(g,'su'),10);
  assert.equal(earned(g,'lin'),0);
  assert.equal(g.state.governor,'lin');
  g.tick();
  assert.equal(earned(g,'su'),10);
  assert.equal(g.validSave(g.state),true);
});

test('legacy completed buildings do not receive backpay while their unfinished queue settles once',()=>{
  const e=loadGame(),g=e.Game;supplies(g);
  const q=buildCity(e);finish(e,q);
  assert.equal(g.developPlot(0,'farm'),null);
  const pendingEnd=g.plotJob(0).end;
  const legacy=JSON.parse(JSON.stringify(g.state));
  // A prior-version save can already contain buildings while the city governor
  // still has no construction experience. Only queued work earns a new reward.
  legacy.generalLevels.su=1;legacy.generalXp.su=0;
  g.importSave(legacy);
  assert.equal(g.state.cityLevels[q.site],1);
  assert.equal(earned(g,'su'),0);
  e.offline(Math.ceil(pendingEnd-e.now())+1);
  assert.equal(earned(g,'su'),10);
  assert.equal(g.state.plots[0].level,1);
  const settled=JSON.parse(JSON.stringify(g.state));
  g.importSave(settled);g.tick();g.save();g.init();
  assert.equal(earned(g,'su'),10);
  assert.equal(g.validSave(g.state),true);
});

test('construction experience uses the existing level threshold, retains overflow and unlocks free points',()=>{
  const e=loadGame(),g=e.Game;supplies(g);
  g.state.generalXp.su=75;
  const q=buildCity(e);finish(e,q);
  assert.equal(g.state.generalLevels.su,2);
  assert.equal(g.state.generalXp.su,5);
  assert.equal(e.evaluate('HeroSystem.remaining(Game.state,"su")'),3);
  assert.equal(g.upgrade(q.site),null);
  finish(e,g.state.buildQueue.find(job=>job.site===q.site));
  assert.equal(g.state.generalLevels.su,2);
  assert.equal(g.state.generalXp.su,25);
  assert.equal(e.evaluate('HeroSystem.remaining(Game.state,"su")'),3);
  assert.equal(earned(g,'su'),105);
  assert.equal(g.validSave(g.state),true);
});
