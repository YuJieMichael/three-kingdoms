const {test}=require('node:test'),assert=require('node:assert/strict');
const {loadGame,city}=require('./helpers/game.cjs');
// v0.34.73: the Yellow Turban epic gates chapter four (讨伐董卓), not the first county.
function finishEpic(s){s.epic.kills=1500;s.epic.killRewards=3;s.epic.troops=2;s.epic.treasures=2;for(const id of Object.keys(s.epic.resources))s.epic.resources[id]=100000;}
test('the first county can be attacked without the epic',()=>{
  const e=loadGame(),g=e.Game,s=g.state;city(g,{hall:4,drill:1,barracks:1});s.honors.noble=1;s.conquered.mine=true;s.army.archer=500;
  assert.equal(g.countyUnlocked(),false);
  assert.ok(!g.attackBlocked('fort','occupy'));
  assert.equal(g.dispatch('fort','lin',{archer:500},'occupy'),null);
});
test('chapter four waits for the epic after chapter three and opens once it is done',()=>{
  const e=loadGame(),s=e.Game.state,C=e.Chapter;s.conquered.fort=true;for(const n of [...C.nodes,...C.chapterThreeNodes])s.conquered[n.id]=true;
  assert.equal(C.unlocked(s,4),false);assert.match(C.blocked(s,'c4_sishui'),/四项史诗/);
  finishEpic(s);assert.equal(C.unlocked(s,4),true);assert.equal(C.blocked(s,'c4_sishui'),null);assert.equal(e.Game.validSave(s),true);
});
test('an old save already inside chapter four keeps its access without the epic',()=>{
  const e=loadGame(),s=e.Game.state,C=e.Chapter;s.conquered.fort=true;for(const n of [...C.nodes,...C.chapterThreeNodes])s.conquered[n.id]=true;
  s.conquered.c4_sishui=true;assert.equal(C.unlocked(s,4),true);assert.equal(C.blocked(s,'c4_hulao'),null);
  const legacy=loadGame().Game.state;legacy.conquered.fort=true;for(const n of [...C.nodes,...C.chapterThreeNodes])legacy.conquered[n.id]=true;legacy.epic.legacyAccess=true;assert.equal(C.unlocked(legacy,4),true);
});
test('chapter four still needs chapter three first, epic or not',()=>{
  const e=loadGame(),s=e.Game.state,C=e.Chapter;s.conquered.fort=true;for(const n of C.nodes)s.conquered[n.id]=true;finishEpic(s);
  assert.equal(C.unlocked(s,4),false);assert.match(C.blocked(s,'c4_sishui'),/第三章/);
});
