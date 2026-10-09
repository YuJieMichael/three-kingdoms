const {test}=require('node:test'),assert=require('node:assert/strict');
const {loadGame,city}=require('./helpers/game.cjs');
test('the capital 都护府 opens at hall 10, costs blueprints and resources, finishes after its timer and raises output',()=>{
  const e=loadGame(),g=e.Game,s=g.state;assert.match(g.specialtyQuote().reason,/官府 10 级/);
  city(g,{hall:10});s.inventory.blueprint=1;for(const k of ['food','wood','stone','iron','gold'])s.res[k]=5e6;assert.match(g.specialtyQuote().reason,/图纸不足/);
  s.inventory.blueprint=40;s.plots[0]={type:'farm',level:5};s.population=g.maxPop();const before=g.rates().food;
  assert.equal(g.startSpecialty(),null);assert.equal(s.inventory.blueprint,38);assert.match(g.specialtyQuote().reason,/正在升级/);
  e.advance(12*3600000+1000);assert.equal(g.specialtyQuote().level,1);assert.ok(g.rates().food>before);assert.equal(g.validSave(s),true);
  const q=g.specialtyQuote();assert.equal(q.line.name,'都护府');assert.equal(q.cost.blueprint,4);
});
test('铸神兵: clues at the inn, gathering, three level-5 raids and a county win, then a 30-minute quench unlock legendary gear',()=>{
  const e=loadGame(),g=e.Game,s=g.state,H=e.evaluate('HeroSystem'),Q=e.evaluate('LegendQuest');city(g,{smith:9,inn:1});assert.equal(Q.rumour(s),false,'hidden until a level-10 smithy');assert.match(H.seekLegend(),/没有这样的传闻/);city(g,{smith:10});assert.equal(Q.rumour(s),true);s.res.gold=1e6;s.jewels.jade=5;
  for(let i=0;i<2;i++)H.addEquipment(s,'weapon',3);
  assert.match(H.legendQuote('weapon').reason,/先完成铸神兵的线索/);assert.equal(H.seekLegend(),null);assert.equal(Q.status(s,e.now()).stage,'clues');
  e.evaluate("LegendQuest.onBattle(Game.state,{wild:true,level:4,terrain:'grass'},{won:true,mode:'raid'})");assert.equal(Q.status(s,e.now()).raids,0,'level 4 does not count');
  for(let i=0;i<3;i++)e.evaluate("LegendQuest.onBattle(Game.state,{wild:true,level:6,terrain:'grass'},{won:true,mode:'raid'})");
  e.evaluate("LegendQuest.onBattle(Game.state,{id:'yellow_qingshi',terrain:'fort',level:2},{won:true,mode:'raid'})");assert.match(H.legendQuote('weapon').reason,/线索/,'gathering still missing');
  e.evaluate('LegendQuest.onGather(Game.state,5)');assert.equal(H.legendQuote('weapon').reason,'');
  assert.equal(H.forgeLegend('weapon'),null);assert.equal(s.jewels.jade,4);assert.match(H.claimLegend(),/还在淬火/);e.advance(30*60000+1000);
  assert.equal(H.claimLegend(),null);assert.equal(Q.unlocked(s),true);const legend=s.equipment.find(x=>x.tier===4);assert.equal(H.itemName(legend),'赤霄战戟');
  assert.equal(H.forgeLegend('weapon'),null,'after unlocking, quenching is immediate');assert.equal(s.equipment.filter(x=>x.tier===4).length,2);assert.equal(s.jewels.jade,3);
  s.generalLevels.lin=15;const ids=['armor','helmet','accessory'].map(slot=>H.addEquipment(s,slot,3).id);
  const base=H.bonus(s,'lin').atk;assert.equal(H.equip(legend.id,'lin'),null);for(const id of ids)assert.equal(H.equip(id,'lin'),null);
  assert.equal(H.setTier(s,'lin'),3);assert.ok(H.bonus(s,'lin').atk>=base+H.stats(legend).atk+10,'rare set bonus on top');
  s.inventory.refine=1;e.evaluate('Math.random=()=>0');assert.equal(H.refine(legend.id),null);assert.equal(JSON.stringify(legend.refine),'{"stat":"atk","value":3}');
  assert.match(H.refine(legend.id),/炼化鼎/);assert.equal(g.validSave(s),true);
});
test('bonds are switched off until more generals exist; the old pairs are kept as an archive',()=>{
  const e=loadGame(),g=e.Game,s=g.state,B=e.evaluate('HeroBonds');
  assert.equal(B.bonds.length,0);assert.equal(B.archived.length,6);assert.equal(B.active(s).length,0);assert.equal(JSON.stringify(B.battle(s,'lin').attack),'{}');
});
