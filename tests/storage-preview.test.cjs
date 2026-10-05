const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {loadGame:load,city}=require('./helpers/game.cjs');
function loadGame(){
  const e=load(),Game=e.Game;
  e.evaluate("Math.random=()=>0.999999; const num=n=>Math.floor(n).toLocaleString('zh-CN');");
  e.evaluate(fs.readFileSync(path.join(__dirname,'..','campaign-ui.js'),'utf8'));
  return {...e,html:quote=>e.evaluate(`dispatchStorageHTML(${JSON.stringify(quote)})`)};
}
const army={archer:300};
function assertSettlement(e,quote,mode='raid'){
  const {Game}=e,s=Game.state;city(Game,{drill:1});s.army.archer=army.archer;
  assert.equal(Game.dispatch('field','lin',army,mode),null);
  e.advance(s.expedition.end-e.now()+1);
  assert.equal(Game.startBattle(),null);
  const before={...s.res};
  for(let i=0;i<30&&!s.battle.finished;i++)Game.battleRound();
  assert.equal(s.battle.result.won,true);
  assert.equal(s.battle.result.overflow,0);
  for(const row of quote.storage.rows){
    assert.equal(s.battle.result.resourceReceipt.base.received[row.id],row.received);
    assert.ok(Math.abs(s.res[row.id]-before[row.id]-row.received)<1e-8,`${row.id} settlement differs from preview`);
  }
}
test('over-cap stock accepts cargo, previews excess and remains read-only',()=>{
  const e=loadGame(),{Game,html}=e;Game.state.res.food=40000;Game.state.res.wood=40000;
  const before=JSON.stringify(Game.state),q=Game.lootPreview('field','raid',army);
  assert.equal(q.loaded,546);assert.equal(q.storage.received,546);assert.equal(q.storage.overflow,0);assert.equal(q.storage.overCapacity,546);
  assert.equal(JSON.stringify(Game.state),before);assert.match(html(q).warning,/爆仓/);assertSettlement(e,q);
});
test('partial room previews over-capacity receipts after food provisions',()=>{
  const e=loadGame(),{Game,html}=e;Game.state.res.food=10000;Game.state.res.wood=9950;
  const q=Game.lootPreview('field','raid',army),food=q.storage.rows.find(r=>r.id==='food'),wood=q.storage.rows.find(r=>r.id==='wood');
  assert.equal(food.received,429);assert.equal(food.overCapacity,49);
  assert.equal(wood.received,117);assert.equal(wood.overCapacity,67);
  assert.equal(q.storage.received,546);assert.equal(q.storage.overflow,0);assert.equal(q.storage.overCapacity,116);assert.match(html(q).warning,/爆仓/);assertSettlement(e,q);
});
test('ample capacity receives all cargo with no warehouse warning',()=>{
  const e=loadGame(),q=e.Game.lootPreview('field','raid',army);
  assert.equal(q.storage.received,546);assert.equal(q.storage.overflow,0);assert.equal(q.storage.overCapacity,0);assert.equal(e.html(q).warning,'');assertSettlement(e,q);
});
test('cargo limits still apply before allowing warehouse excess',()=>{
  const {Game}=loadGame();Game.state.res.food=40000;Game.state.res.wood=40000;
  const q=Game.lootPreview('field','raid',{militia:1});
  assert.ok(q.loaded<=20);assert.ok(q.discarded>0);assert.equal(q.storage.received,q.loaded);assert.equal(q.storage.overflow,0);assert.equal(q.storage.overCapacity,q.loaded);
});
test('occupation gold can exceed the independent hall capacity',()=>{
  const e=loadGame(),{Game}=e;Game.state.res.gold=Game.capacity('gold')-10;
  const q=Game.lootPreview('field','occupy',army),gold=q.storage.rows.find(r=>r.id==='gold');
  assert.equal(gold.amount,80);assert.equal(gold.received,80);assert.equal(gold.overCapacity,70);assertSettlement(e,q,'occupy');
});
test('fractional warehouse room reports excess without discarding cargo',()=>{
  const e=loadGame(),{Game,html}=e;Game.state.res.food=40000;Game.state.res.wood=9999.75;
  const q=Game.lootPreview('field','raid',army),wood=q.storage.rows.find(r=>r.id==='wood');
  assert.equal(wood.received,117);assert.equal(wood.overCapacity,116.75);assert.equal(q.storage.received,546);assert.match(html(q).details,/116\.75/);assertSettlement(e,q);
});
test('zero troops do not produce a false over-capacity warning',()=>{
  const {Game,html}=loadGame();Game.state.res.food=40000;Game.state.res.wood=40000;
  const q=Game.lootPreview('field','raid',{});assert.equal(q.loaded,0);assert.equal(q.storage.received,0);assert.equal(q.storage.overCapacity,0);assert.equal(html(q).warning,'');
});
test('storage technology changes excess forecast without changing cargo received',()=>{
  const {Game}=loadGame();Game.state.res.wood=10000;
  let row=Game.lootPreview('field','raid',army).storage.rows.find(r=>r.id==='wood');assert.equal(row.received,117);assert.equal(row.overCapacity,117);
  Game.state.tech.storage=1;
  row=Game.lootPreview('field','raid',army).storage.rows.find(r=>r.id==='wood');assert.equal(row.received,117);assert.equal(row.overCapacity,0);
});

test('raid receipt explains immediate over-capacity settlement without rewriting legacy reports',()=>{
 const e=loadGame();city(e.Game,{drill:1});e.Game.state.army.archer=300;e.Game.state.res.food=40000;e.Game.state.res.wood=40000;
 const quote=e.Game.lootPreview('field','raid',army);assertSettlement(e,quote);
 const receipt=JSON.parse(JSON.stringify(e.Game.state.battle.result));
 const html=r=>e.evaluate(`battleCargoHTML(${JSON.stringify(r)})`);
 assert.match(html(receipt),/胜利结算时入库，满仓或超仓也能收取/);
 assert.match(html(receipt),/返城不重复结算/);
 delete receipt.overCapacity;assert.doesNotMatch(html(receipt),/胜利结算时入库/);
 receipt.won=false;assert.equal(html(receipt),'');
});
