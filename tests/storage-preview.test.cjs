const {test}=require('node:test');
const assert=require('node:assert/strict');
const vm=require('node:vm');
const fs=require('node:fs');
const path=require('node:path');
const root=path.resolve(__dirname,'..');
function loadGame(){
  const saved=new Map(),now=1791194400000;
  const context=vm.createContext({console,Date:class extends Date{constructor(...args){super(...(args.length?args:[now]));}static now(){return now;}},localStorage:{getItem:key=>saved.get(key)||null,setItem:(key,value)=>saved.set(key,value)},document:{addEventListener(){}}});
  for(const file of ['manual-data.js','speedup-data.js','reference-rules.js','reward-data.js','progression.js','hero-system.js','heritage-data.js','heritage-system.js','npc-data.js','npc-defense.js','chapter-data.js','siege-data.js','automation-system.js','engine.js','campaign-ui.js'])vm.runInContext(fs.readFileSync(path.join(root,file),'utf8'),context,{filename:file});
  vm.runInContext("Math.random=()=>0.999999; const num=n=>Math.floor(n).toLocaleString('zh-CN');",context);
  const Game=vm.runInContext('Game',context);Game.init();
  return {Game,html:quote=>{context.quote=quote;return vm.runInContext('dispatchStorageHTML(quote)',context);}};
}
const army={militia:100};
function assertSettlement(Game,quote,mode='raid'){
  const s=Game.state;s.cityLayout[0]='drill';s.cityLevels[0]=1;s.buildings.drill=1;s.army.militia=100;
  assert.equal(Game.dispatch('field','lin',army,mode),null);
  s.expedition.end=0; // Arrival without advancing the economic clock.
  assert.equal(Game.startBattle(),null);
  for(const row of s.battle.enemy)row.hp=0; // Isolate storage from casualties and random combat.
  const before={...s.res};Game.battleRound();
  assert.equal(s.battle.result.won,true);
  assert.equal(s.battle.result.overflow,quote.storage.overflow);
  for(const row of quote.storage.rows)assert.ok(Math.abs(s.res[row.id]-before[row.id]-row.received)<1e-8,`${row.id} settlement differs from preview`);
}
test('over-cap stock: zero receipt, warning, preview is read-only, settlement agrees',()=>{
  const {Game,html}=loadGame();Game.state.res.food=40000;Game.state.res.wood=40000;
  const before=JSON.stringify(Game.state),q=Game.lootPreview('field','raid',army);
  assert.equal(q.loaded,546);assert.equal(q.storage.received,0);assert.equal(q.storage.overflow,546);
  assert.equal(JSON.stringify(Game.state),before);assert.match(html(q).warning,/已满仓/);assertSettlement(Game,q);
});
test('partial room: separate resource limits and food provision deduction',()=>{
  const {Game,html}=loadGame();Game.state.res.food=10000;Game.state.res.wood=9950;
  const q=Game.lootPreview('field','raid',army);
  assert.equal(q.storage.rows.find(r=>r.id==='food').received,140);
  assert.equal(q.storage.rows.find(r=>r.id==='wood').received,50);
  assert.equal(q.storage.received,190);assert.equal(q.storage.overflow,356);assert.match(html(q).warning,/部分基础资源/);assertSettlement(Game,q);
});
test('ample capacity: all cargo received with no warehouse warning',()=>{
  const {Game,html}=loadGame(),q=Game.lootPreview('field','raid',army);
  assert.equal(q.storage.received,546);assert.equal(q.storage.overflow,0);assert.equal(html(q).warning,'');assertSettlement(Game,q);
});
test('cargo limit is applied before storage limit',()=>{
  const {Game}=loadGame();const q=Game.lootPreview('field','raid',{militia:1});
  assert.ok(q.loaded<=20);assert.ok(q.discarded>0);assert.equal(q.storage.received,q.loaded);assert.equal(q.storage.overflow,0);
});
test('occupation includes gold and uses hall storage independently',()=>{
  const {Game}=loadGame();Game.state.res.gold=Game.capacity('gold')-10;
  const q=Game.lootPreview('field','occupy',army),gold=q.storage.rows.find(r=>r.id==='gold');
  assert.ok(gold.amount>10);assert.equal(gold.received,10);assertSettlement(Game,q,'occupy');
});
test('fractional capacity remains consistent with settlement',()=>{
  const {Game,html}=loadGame();Game.state.res.food=40000;Game.state.res.wood=9999.75;
  const q=Game.lootPreview('field','raid',army);assert.equal(q.storage.received,.25);assert.match(html(q).details,/0\.25/);assertSettlement(Game,q);
});
test('zero troops produces no false full-warehouse warning',()=>{
  const {Game,html}=loadGame();Game.state.res.food=40000;Game.state.res.wood=40000;
  const q=Game.lootPreview('field','raid',{});assert.equal(q.loaded,0);assert.equal(q.storage.received,0);assert.equal(html(q).warning,'');
});
test('preview responds to changed stocks and storage technology',()=>{
  const {Game}=loadGame();Game.state.res.wood=10000;
  assert.equal(Game.lootPreview('field','raid',army).storage.rows.find(r=>r.id==='wood').received,0);
  Game.state.tech.storage=1;
  assert.equal(Game.lootPreview('field','raid',army).storage.rows.find(r=>r.id==='wood').received,117);
});
