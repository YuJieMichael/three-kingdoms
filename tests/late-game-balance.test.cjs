const {lateGarrisons}=require('./balance/targets.cjs');
const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const {loadGame,city}=require('./helpers/game.cjs');
const total=army=>Object.values(army).reduce((a,b)=>a+b,0);
test('missing promotion jewels are covered by spare jewels at twice their prestige value, cheapest first',()=>{
  const e=loadGame(),g=e.Game,H=e.evaluate('HeritageSystem');
  for(const id of Object.keys(g.state.jewels))g.state.jewels[id]=0;
  g.state.jewels.agate=2;g.state.jewels.pearl=20;g.state.jewels.coral=1;
  const p=H.jewelPayment(g.state,{agate:5});
  // 3 agate short × 2500 × 2 = 15000: 15 pearls (1000 each) cover it before any coral is touched.
  assert.equal(p.covered,true);assert.equal(JSON.stringify(p.short),'{"agate":3}');assert.equal(JSON.stringify(p.substitute),'{"pearl":15}');assert.equal(JSON.stringify(p.total),'{"agate":2,"pearl":15}');
  g.state.jewels.pearl=5;const q=H.jewelPayment(g.state,{agate:5});assert.equal(q.covered,false);
  g.state.jewels.pearl=20;const full=H.jewelPayment(g.state,{agate:2});assert.equal(JSON.stringify(full.substitute),'{}');
});
test('promotion spends the substituted jewels and refuses when even substitution falls short',()=>{
  const e=loadGame(),g=e.Game,H=e.evaluate('HeritageSystem');
  const q0=H.promotionQuote(g.state,'noble'),rule=q0.next.promotion,need=Object.entries(rule.jewels)[0];assert.ok(need,'first noble rank needs jewels');
  g.state.prestige=rule.prestige;g.state.res.gold=rule.gold+1;city(g,{hall:rule.hall||1});
  for(const id of Object.keys(g.state.jewels))g.state.jewels[id]=0;
  assert.match(H.promotionQuote(g.state,'noble').reason,/折算也不足/);
  g.state.jewels.nightPearl=50;const q=H.promotionQuote(g.state,'noble');assert.equal(q.reason,'');
  const before=g.state.jewels.nightPearl;assert.equal(e.evaluate("HeritageSystem.promote('noble')"),null);
  assert.equal(before-g.state.jewels.nightPearl,q.jewels.total.nightPearl);assert.equal(g.state.honors.noble,1);
});
test('inn candidates in one refresh never share a name, also against hired generals',()=>{
  for(let seed=1;seed<=30;seed++){const e=loadGame(seed),g=e.Game;city(g,{inn:10});g.state.customGenerals.push({name:'魏衡'});
    for(let i=0;i<5;i++){e.advance(1234+i*977);assert.equal(g.refreshInn(),null);const names=g.state.innCandidates.map(c=>c.name);assert.equal(new Set(names).size,names.length,names.join());assert.ok(!names.includes('魏衡'));}
    g.state.customGenerals.pop();}
});
test('late garrisons are raised by a fixed factor: chapter 2 ×1.3, chapter 3 ×1.5, yellow-turban cities ×5',()=>{
  const e=loadGame(),c=e.Chapter,y=e.evaluate('YellowCityData');
  assert.equal(JSON.stringify(c.armyScale),'{"2":1.3,"3":1.5,"4":1}');assert.equal(y.armyScale,5);
  assert.ok(total(c.chapterThreeNodes.at(-1).army)>=lateGarrisons.innerCityMin,'河洛内城 '+total(c.chapterThreeNodes.at(-1).army));
  assert.ok(y.nodes.every(n=>total(n.army)>=lateGarrisons.yellowCityMin),y.nodes.map(n=>total(n.army)).join());
});
test('the 讨伐黄巾 epic explains that only wild tiles and map strongholds give headbands',()=>{
  const e=loadGame(),g=e.Game,group=g.progression.groups(g.state).find(x=>x.id==='kills');assert.match(group.detail,/黄巾城等城池掠夺不计头巾/);
});
test('city occupation explains that the general stays in the new city, and an empty roster says why',()=>{
  const src=fs.readFileSync(path.join(__dirname,'..','campaign-ui.js'),'utf8');
  assert.match(src,/主将和幸存部队留在新城驻守/);assert.match(src,/没有可出征的将领/);
  assert.match(fs.readFileSync(path.join(__dirname,'..','.gitignore'),'utf8'),/^production\/session-logs\/$/m);
});
