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
test('legendary equipment needs three idle rare pieces and jade; four matching pieces give a set bonus; 炼化鼎 adds one stat',()=>{
  const e=loadGame(),g=e.Game,s=g.state,H=e.evaluate('HeroSystem');city(g,{smith:10});s.jewels.jade=2;
  for(let i=0;i<3;i++)H.addEquipment(s,'weapon',3);assert.equal(H.forgeLegend('weapon'),null);assert.equal(s.jewels.jade,0);
  const legend=s.equipment.find(x=>x.tier===4);assert.equal(H.itemName(legend),'赤霄战戟');assert.equal(s.equipment.filter(x=>x.tier===3).length,0);
  s.generalLevels.lin=15;const ids=['armor','helmet','accessory'].map(slot=>H.addEquipment(s,slot,3).id);
  const base=H.bonus(s,'lin').atk;assert.equal(H.equip(legend.id,'lin'),null);for(const id of ids)assert.equal(H.equip(id,'lin'),null);
  assert.equal(H.setTier(s,'lin'),3);assert.ok(H.bonus(s,'lin').atk>=base+H.stats(legend).atk+10,'rare set bonus on top');
  s.inventory.refine=1;e.evaluate('Math.random=()=>0');assert.equal(H.refine(legend.id),null);assert.equal(JSON.stringify(legend.refine),'{"stat":"atk","value":3}');
  assert.match(H.refine(legend.id),/炼化鼎/);assert.equal(g.validSave(s),true);
});
test('a bond activates when both generals are owned and doubles in battle when one of them leads',()=>{
  const e=loadGame(),g=e.Game,s=g.state,B=e.evaluate('HeroBonds');
  const add=(id,extra={})=>{s.customGenerals.push({id,name:id,title:'',type:'将',level:20,atk:80,def:80,pol:50,wis:50,lead:200,price:0,bonus:'archer',desc:'',...extra});s.generals.push(id);s.generalLevels[id]=20;s.generalXp[id]=0;};
  add('local_7100000000000004');assert.equal(B.active(s).length,0);
  add('local_7199999999990001',{wildLine:'huangzhong'});assert.equal(JSON.stringify(B.active(s).map(b=>b.name)),'["弓马双绝"]');
  assert.equal(B.battle(s,'lin').attack.archer,.08);assert.equal(B.battle(s,'local_7100000000000004').attack.archer,.16);
});
