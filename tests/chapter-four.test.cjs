const {test}=require('node:test'),assert=require('node:assert/strict');
const {loadGame,city}=require('./helpers/game.cjs');
const {run}=require('./balance/chapter-four.cjs');
test('each chapter 4 rule decides the battle: the right approach wins cheaply, the wrong one loses or bleeds',()=>{
  const r=Object.fromEntries(run().map(x=>[x.node+'|'+x.label,x]));
  for(const x of Object.values(r))if(!x.error)assert.equal(x.validSave,true);
  assert.ok(r['c4_sishui|武力 96 主将'].won);assert.ok(r['c4_sishui|武力 64 主将'].lost>5*r['c4_sishui|武力 96 主将'].lost,'duel penalty');
  assert.ok(r['c4_hulao|6,000 精兵'].won);assert.match(r['c4_hulao|超出上限'].error,/最多 6000/);
  assert.ok(r['c4_xingyang|大军速攻'].won);assert.equal(r['c4_xingyang|兵力不足'].won,false,'reinforcements arrive on round 6');
  assert.ok(r['c4_meiwu|步骑趁夜'].won);assert.equal(r['c4_meiwu|弓兵固守'].won,false);
  assert.ok(r['c4_lianying|智 85 主将'].won);assert.ok(r['c4_lianying|智 58 主将'].lost>5*r['c4_lianying|智 85 主将'].lost,'fire burns our front without a wise commander');
  assert.ok(r['c4_luoyang|器械主力'].won);assert.equal(r['c4_luoyang|缺器械'].won,false);assert.ok(r['c4_luoyang|缺器械'].rounds<=12,'time limit');
});
test('chapter 4 opens after chapter 3, and the jade seal grants an edict, a city slot and better tax',()=>{
  const e=loadGame(),g=e.Game,s=g.state,C=e.Chapter;s.conquered.fort=true;for(const n of C.nodes)s.conquered[n.id]=true;
  assert.equal(C.unlocked(s,4),false);for(const n of C.chapterThreeNodes)s.conquered[n.id]=true;assert.equal(C.unlocked(s,4),true);
  s.population=1000;const slots=g.cityLimit(),tax=g.rates().gold;assert.ok(tax>0);assert.equal(g.edictReady(),false);
  for(const n of C.chapterFourNodes)s.conquered[n.id]=true;assert.equal(g.cityLimit(),slots+1);assert.ok(g.rates().gold>tax*1.09);
  city(g,{hall:3});const site=s.cityLayout.indexOf(null);s.res.food=s.res.wood=s.res.stone=s.res.iron=1e6;assert.equal(g.queueBuilding(site,'house'),null);
  const q=s.buildQueue[0],key=g.speedupKey('build',q);assert.equal(g.edictReady(),true);assert.equal(g.useEdict(key),null);assert.equal(s.buildQueue.length,0);
  assert.equal(g.edictReady(),false);assert.equal(g.validSave(s),true);e.advance(86400000);assert.equal(g.edictReady(),true);
});
test('安军符 stops desertion in a starving city for three days',()=>{
  const e=loadGame(),g=e.Game,s=g.state;s.army.archer=1000;s.inventory.armyPledge=1;assert.equal(g.useItem('armyPledge'),null);
  s.res.food=0;e.advance(5*3600000);assert.equal(s.army.archer,1000);
  e.advance(3*86400000);s.res.food=0;e.advance(3*3600000);assert.ok(s.army.archer<1000,'after it expires troops desert again');
});
