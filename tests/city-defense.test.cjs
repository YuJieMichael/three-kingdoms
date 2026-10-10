const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
function load(){
  let now=1791194400000;const saved=new Map();
  const ctx=vm.createContext({console,Date:class extends Date{constructor(...args){super(...(args.length?args:[now]));}static now(){return now;}},localStorage:{getItem:k=>saved.get(k)||null,setItem:(k,v)=>saved.set(k,v)},document:{addEventListener(){}}});
  for(const file of ['manual-data.js','speedup-data.js','reference-rules.js','reward-data.js','progression.js','onboarding-data.js','onboarding-system.js','governance-system.js','hero-system.js','hero-bonds.js','legend-quest.js','legendary-weapons.js','heritage-data.js','heritage-system.js','npc-data.js','war-care.js','npc-defense.js','chapter-data.js','siege-data.js','war-orders.js','automation-system.js','named-city-data.js','named-garrison.js','named-city-system.js','yellow-city-data.js','plot-template-data.js','city-system.js','city-strategy.js','city-specialty.js','general-growth-data.js','general-growth-system.js','scout-system.js','regional-front.js','supply-lines.js','hero-administration.js','battle-review.js','wild-fields.js','web-edition.js','battlefield-data.js','battlefield-system.js','engine.js'])vm.runInContext(fs.readFileSync(path.join(__dirname,'..',file),'utf8'),ctx,{filename:file});
  vm.runInContext('Math.random=()=>.999999',ctx);const Game=vm.runInContext('Game',ctx);Game.init();Game.state.warCare.defense.autoResolve=false;
  return {Game,advance:ms=>{now+=ms;Game.tick(now);},now:()=>now,eval:source=>vm.runInContext(source,ctx)};
}
function ready(env){const {Game,advance}=env,s=Game.state;s.buildings.hall=2;s.cityLevels[14]=2;s.stats.victories=1;assert.equal(Game.setAutoCityDefense(true),null);Game.tick();advance(30*60*1000);advance(5*60*1000);assert.ok(s.cityDefense.incoming);}
function finish(Game){let result;for(let i=0;i<30&&Game.state.cityDefense.battle;i++)result=Game.cityDefenseRound();assert.ok(!Game.state.cityDefense.battle);return result;}
test('legacy saves migrate without fabricating per-resource receipts or resetting progress',()=>{
  const {Game}=load(),old=JSON.parse(JSON.stringify(Game.state));delete old.cityDefense;delete old.realm;old.res.food=54321;const migrated=Game.migrateSave(old);
  assert.equal(migrated.res.food,54321);assert.equal(migrated.cityDefense.nextAt,0);assert.equal(Game.validSave(migrated),true);Game.importSave(old);assert.equal(Game.state.res.food,54321);
});
test('first victory and hall level gate waves, 30 minute interval and 5 minute warning use real time',()=>{
  const e=load(),s=e.Game.state;s.speed=60;e.advance(3600000);assert.equal(s.cityDefense.incoming,null);
  s.stats.victories=1;e.Game.tick();assert.equal(s.cityDefense.nextAt,0);s.buildings.hall=2;s.cityLevels[14]=2;assert.equal(e.Game.setAutoCityDefense(true),null);e.Game.tick();e.advance(1799999);assert.equal(s.cityDefense.incoming,null);e.advance(1);
  assert.equal(s.cityDefense.incoming.arriveAt-e.now(),300000);assert.equal(e.Game.startCityDefense(), '敌军尚未抵达');
});
test('offline catch-up preserves one warning without automatic casualties or wave backlog',()=>{
  const e=load(),s=e.Game.state;s.buildings.hall=2;s.cityLevels[14]=2;s.stats.victories=1;s.army.militia=40;s.defenses.trap=5;assert.equal(e.Game.setAutoCityDefense(true),null);e.Game.tick();e.Game.save();e.advance(12*3600000);e.Game.init();
  assert.equal(e.Game.state.army.militia,40);assert.equal(e.Game.state.defenses.trap,5);assert.equal(e.Game.state.cityDefense.wave,1);assert.equal(e.Game.state.cityDefense.battle,null);e.advance(12*3600000);assert.equal(e.Game.state.cityDefense.wave,1);
});
test('drill uses combat and leaves troops, defenses, stocks, hero XP and formal reports unchanged',()=>{
  const e=load(),s=e.Game.state;s.army.militia=1000;s.defenses.trap=5;const before=JSON.stringify([s.army,s.defenses,s.res,s.generalXp,s.stats,s.cityDefense.reports]);
  assert.equal(e.Game.startCityDefense(true),null);const r=finish(e.Game);assert.equal(r.won,true);assert.equal(r.drill,true);assert.equal(r.resourceReceipt,null);assert.equal(JSON.stringify([s.army,s.defenses,s.res,s.generalXp,s.stats,s.cityDefense.reports]),before);assert.equal(e.Game.validSave(s),true);
});
test('real victory returns reserved soldiers once and settles rewards once',()=>{
  const e=load();ready(e);const {Game}=e,s=Game.state;s.army.militia=1000;assert.equal(Game.startCityDefense(),null);assert.equal(s.army.militia,0);assert.ok(Game.committed()>=1000);
  s.army.militia=7;const r=finish(Game);assert.equal(r.won,true);assert.equal(s.army.militia,r.back.militia+7);assert.equal(s.cityDefense.wins,1);assert.equal(s.cityDefense.reports.length,1);assert.equal(r.resourceReceipt.loaded.food,300);
  const before=JSON.stringify(s);assert.equal(Game.cityDefenseRound(),'当前没有守城战');assert.equal(JSON.stringify(s),before);assert.equal(Game.validSave(s),true);
});
test('defenseless city can lose and robbery is bounded by stock and enemy carrying capacity',()=>{
  const e=load();ready(e);const s=e.Game.state,before={...s.res};assert.equal(e.Game.startCityDefense(),null);const r=finish(e.Game);
  assert.equal(r.won,false);assert.equal(s.res.gold,before.gold);let stolen=0;for(const [id,n] of Object.entries(r.robbed)){assert.ok(n<=Math.floor(before[id]*.1));assert.ok(s.res[id]>=0);stolen+=n;}assert.ok(stolen>0&&stolen<=e.Game.carry({militia:36,spear:12,archer:6}));assert.equal(e.Game.validSave(s),true);
});
test('traps fire once, use their actual reserve and are not restored by repair technology',()=>{
  const e=load();ready(e);const s=e.Game.state;s.defenses.trap=5;s.tech.repair=10;s.army.militia=1000;assert.equal(e.Game.startCityDefense(),null);const b=s.cityDefense.battle,before=b.enemy.reduce((sum,r)=>sum+r.hp,0);e.Game.cityDefenseRound();assert.equal(b.forts.find(f=>f.id==='trap').used,5);assert.ok(b.enemy.reduce((sum,r)=>sum+r.hp,0)<before);
  const r=finish(e.Game);assert.equal(r.defenseLost.trap,5);assert.equal(r.repaired.trap,0);assert.equal(s.defenses.trap,0);
});
test('fortification changes durability and repair restores destroyed durable works',()=>{
  const e=load();ready(e);const s=e.Game.state;s.defenses.tower=20;s.tech.fortification=2;s.tech.repair=10;assert.equal(e.Game.startCityDefense(),null);const b=s.cityDefense.battle;
  assert.equal(b.fortification,1.2);assert.equal(b.forts[0].hp,20*e.Game.manual.defenses.tower.hp*1.2);b.forts[0].hp=0;const r=finish(e.Game);assert.equal(r.repaired.tower,10);assert.equal(s.defenses.tower,10);assert.equal(e.Game.validSave(s),true);
});
test('durability snapshot survives research completing during battle',()=>{
  const e=load();ready(e);const s=e.Game.state;s.defenses.tower=2;e.Game.startCityDefense();const b=s.cityDefense.battle;s.tech.fortification=1;
  assert.equal(e.Game.validSave(s),true);const hp=b.forts[0].hp;e.Game.cityDefenseRound();assert.equal(b.forts[0].hp,hp);assert.equal(b.fortification,1);
});
test('pending invasion can coexist with a drill and survives drill cancellation',()=>{
  const e=load();ready(e);const s=e.Game.state,wave=JSON.stringify(s.cityDefense.incoming);assert.equal(e.Game.startCityDefense(true),null);assert.equal(e.Game.validSave(s),true);assert.equal(e.Game.endDefenseDrill(),null);assert.equal(JSON.stringify(s.cityDefense.incoming),wave);
});
test('active city defense and offensive combat cannot be started together',()=>{
  const e=load(),s=e.Game.state;s.army.militia=100;s.buildings.drill=1;s.cityLayout[0]='drill';s.cityLevels[0]=1;
  assert.equal(e.Game.dispatch('field','lin',{militia:50}),null);e.advance(e.Game.state.expedition.end-e.now()+1);assert.equal(e.Game.startCityDefense(true),null);assert.equal(e.Game.startBattle(),'请先结束守城战或演练');e.Game.endDefenseDrill();assert.equal(e.Game.startBattle(),null);assert.equal(e.Game.startCityDefense(true),'请先结束当前出征战斗');
});
test('active defense saves restore without resetting or duplicating reserved soldiers',()=>{
  const e=load();ready(e);const s=e.Game.state;s.army.militia=80;s.defenses.abatis=2;e.Game.startCityDefense();e.Game.cityDefenseRound();e.Game.save();e.advance(3600000);e.Game.init();
  assert.equal(e.Game.state.army.militia,0);assert.equal(e.Game.state.cityDefense.battle.army.militia,80);assert.equal(e.Game.state.cityDefense.battle.round,1);assert.equal(e.Game.validSave(e.Game.state),true);
});
test('save validation rejects invalid resource receipts and defense state',()=>{
  const {Game}=load(),s=Game.state;assert.equal(Game.validSave(s),true);
  let bad=JSON.parse(JSON.stringify(s));bad.cityDefense.nextAt=-1;assert.equal(Game.validSave(bad),false);
  bad=JSON.parse(JSON.stringify(s));bad.cityDefense.incoming={wave:1,level:2,army:{alien:1},arriveAt:0};assert.equal(Game.validSave(bad),false);
});
test('new offensive report preserves separate base and random receipts, validates and restores them',()=>{
  const e=load(),s=e.Game.state;s.buildings.drill=1;s.cityLayout[0]='drill';s.cityLevels[0]=1;s.army.militia=1000;s.res.food=12000;s.res.wood=9950;
  assert.equal(e.Game.dispatch('field','lin',{militia:1000}),null);e.advance(e.Game.state.expedition.end-e.now()+1);assert.equal(e.Game.startBattle(),null);s.res.wood=9950;e.eval('Math.random=()=>0');const before={...s.res};for(let i=0;i<30&&!s.battle.finished;i++)e.Game.battleRound();const r=s.reports[0];assert.equal(r.won,true);
  assert.equal(r.resourceReceipt.base.loaded.food,r.loot.food);assert.equal(r.resourceReceipt.base.received.wood,r.loot.wood);assert.equal(r.resourceReceipt.base.overCapacity.wood,r.loot.wood-50);assert.ok(r.resourceReceipt.bonus.loaded.food>0);assert.equal(r.resourceReceipt.bonus.received.wood,r.bonusLoot.wood);assert.equal(r.resourceReceipt.bonus.overCapacity.wood,r.bonusLoot.wood);assert.equal(r.overflow,0);
  for(const id of ['food','wood'])assert.ok(Math.abs(s.res[id]-before[id]-r.resourceReceipt.base.received[id]-r.resourceReceipt.bonus.received[id])<1e-6);
  assert.equal(e.Game.validSave(s),true);e.Game.save();e.Game.init();assert.equal(JSON.stringify(e.Game.state.reports[0].resourceReceipt),JSON.stringify(r.resourceReceipt));
  const bad=JSON.parse(JSON.stringify(e.Game.state));bad.reports[0].resourceReceipt.base.received.food+=1;assert.equal(e.Game.validSave(bad),false);
});
