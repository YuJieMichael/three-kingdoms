const test=require('node:test');
const assert=require('node:assert/strict');
const {loadGame,city,cloneActiveSave}=require('./helpers/game.cjs');
const sum=map=>Object.values(map).reduce((a,b)=>a+b,0);
const clone=cloneActiveSave;
const resources=['food','wood','stone','iron','gold'];
// Wild-field types/levels now come from the saved 30-minute balanced refresh (wild-fields.js,
// 80efded, GODOT-TO-WEB.md), so wild_31_32 is no longer a forest on a fresh map. Use the
// nearest level-1 forest of the same seeded fresh map, matching the old legacy fixture.
const forest=(()=>{const g=loadGame(41).Game;let best=null;for(let x=0;x<g.WORLD_SIZE;x++)for(let y=0;y<g.WORLD_SIZE;y++){const n=g.getNode(`wild_${x}_${y}`);if(n?.wild&&n.type==='forest'&&n.level===1&&(!best||n.time<best.time))best=n;}assert.ok(best,'seeded fresh map must contain a level-1 forest');return best.id;})();

// City levels, troop reserves and resource stocks are prepared fixtures.
// Every battle and garrison is produced by normal dispatch/march/combat APIs;
// harvesting uses real elapsed hours and never edits enemies or quotes.
function setup(archers=300){
 const e=loadGame(41),g=e.Game;city(g,{hall:4,drill:4});g.state.warCare.defense.autoResolve=false;
 g.state.army.archer=archers;g.state.res.food=1000000;
 e.evaluate('Math.random=()=>0');
 assert.equal(g.validSave(g.state),true);return e;
}
function arrive(e,node='field',mode='raid',archers=300){
 const g=e.Game;
 assert.equal(g.dispatch(node,'lin',{archer:archers},mode),null);
 e.advance(g.state.expedition.end-e.now()+1);
 assert.equal(g.startBattle(),null);
 assert.ok(g.state.battle.enemy.some(row=>row.hp>0));
}
function finish(e){
 const g=e.Game;for(let i=0;i<30&&!g.state.battle.finished;i++)g.battleRound();
 assert.equal(g.state.battle.finished,true);
 return g.state.battle.result;
}
function stock(g,kind){for(const id of resources)g.state.res[id]=g.capacity(id)+(kind==='over'?5000:kind==='partial'?-10:0);}
function assertBattleReceipt(e,before,r){
 const g=e.Game;
 for(const receipt of [r.resourceReceipt.base,r.resourceReceipt.bonus]){
  for(const id of Object.keys(receipt.loaded)){
   assert.equal(receipt.received[id],receipt.loaded[id],`${id} cargo should all be received`);
   assert.equal(receipt.overflow[id],0);
   assert.ok(receipt.overCapacity[id]>=0&&receipt.overCapacity[id]<=receipt.received[id]);
  }
 }
 assert.equal(r.overflow,0);
 assert.equal(r.overCapacity,sum(r.resourceReceipt.base.overCapacity)+sum(r.resourceReceipt.bonus.overCapacity));
 assert.equal(r.cargoLoaded,sum(r.loot)+sum(r.bonusLoot));
 assert.ok(r.cargoLoaded<=r.cargoCapacity);
 for(const id of resources){const received=(r.resourceReceipt.base.received[id]||0)+(r.resourceReceipt.bonus.received[id]||0);assert.ok(Math.abs(g.state.res[id]-before[id]-received)<1e-6,`${id} stock change should match both receipts`);}
 assert.equal(g.validSave(g.state),true);
}
for(const kind of ['full','over','partial'])for(const mode of ['raid','occupy'])test(`${mode} victory receives base and random cargo with ${kind} warehouses`,()=>{
 const e=setup(),g=e.Game;arrive(e,'field',mode);stock(g,kind);const before={...g.state.res},r=finish(e);
 assert.equal(r.won,true);assertBattleReceipt(e,before,r);assert.ok(r.overCapacity>0);
 if(mode==='occupy'){
  assert.equal(r.loot.gold,80);assert.equal(r.resourceReceipt.base.received.gold,80);assert.equal(g.state.conquered.field,true);
 }else{
  assert.equal(Object.hasOwn(r.loot,'gold'),false);assert.equal(g.state.conquered.field,undefined);
 }
 assert.ok(sum(r.bonusLoot)>0,'forced random resource drop must use the same rule');
 const after=JSON.stringify(g.state);g.battleRound();assert.equal(JSON.stringify(g.state),after,'finished battle cannot settle twice');
 g.save();e.offline(1);assert.equal(g.validSave(g.state),true);assert.deepEqual(clone(g.state.reports[0].resourceReceipt),clone(r.resourceReceipt));
});

test('raid bonus gold can exceed hall capacity while raid base loot still excludes gold',()=>{
 const e=setup(),g=e.Game;arrive(e,'field','raid');stock(g,'full');
 // Drop selection only: no item, one resource, gold, minimum quantity.
 // Normal combat does not consume random draws or bypass enemy damage.
 e.evaluate('globalThis.dropDraws=[.99,0,.99,.99,0];Math.random=()=>dropDraws.length?dropDraws.shift():.99');
 const before={...g.state.res},r=finish(e);assert.equal(r.won,true);
 assert.equal(Object.hasOwn(r.loot,'gold'),false);assert.equal(r.bonusLoot.gold,280);
 assert.equal(r.resourceReceipt.bonus.received.gold,280);assert.equal(r.resourceReceipt.bonus.overCapacity.gold,280);
 assertBattleReceipt(e,before,r);assert.equal(g.state.res.gold,g.capacity('gold')+280);
});

for(const kind of ['full','over','partial'])for(const offline of [false,true])test(`raid ${offline?'offline':'online'} return preserves ${kind} warehouse loot without a second settlement`,()=>{
 const e=setup(),g=e.Game;arrive(e);stock(g,kind);const before={...g.state.res},r=finish(e);
 assert.equal(r.won,true);assertBattleReceipt(e,before,r);
 const receivedWood=r.resourceReceipt.base.received.wood+(r.resourceReceipt.bonus.received.wood||0);
 const wood=before.wood+receivedWood,receipt=clone(r.resourceReceipt),back=clone(r.back);
 assert.ok(receivedWood>0);assert.ok(wood>g.capacity('wood'));
 assert.equal(g.state.expedition.phase,'return');assert.equal(g.state.army.archer,0);
 const wait=g.state.expedition.end-e.now()+1;
 if(offline)e.offline(wait);else e.advance(wait);
 assert.equal(g.state.expedition,null);assert.equal(g.state.army.archer,back.archer);
 assert.equal(g.state.res.wood,wood,'return must neither clamp nor repeat settled loot');
 assert.ok(g.state.res.food>g.capacity('food'),'normal marching upkeep must not remove all excess food');
 assert.deepEqual(clone(g.state.reports[0].resourceReceipt),receipt);
 g.save();e.offline(1);
 assert.equal(g.state.res.wood,wood,'over-capacity stock survives reload after returning');
 assert.equal(g.state.army.archer,back.archer,'reload cannot return the troops twice');
 assert.deepEqual(clone(g.state.reports[0].resourceReceipt),receipt);
 assert.equal(g.validSave(g.state),true);
});

test('base and bonus drops share surviving-army cargo space even when warehouses are full',()=>{
 const e=setup(25),g=e.Game;arrive(e,'field','occupy',25);stock(g,'full');const before={...g.state.res},r=finish(e);
 assert.equal(r.won,true);assert.ok(r.lost.archer>0);assert.equal(r.cargoCapacity,525);assert.equal(r.cargoLoaded,524);
 assert.equal(sum(r.loot),500);assert.equal(sum(r.bonusLoot),24);assert.equal(r.bonusDiscarded,536);
 assertBattleReceipt(e,before,r);assert.equal(r.overCapacity,r.cargoLoaded);
});

test('actual combat failure grants no loot or warehouse excess',()=>{
 const e=setup(10),g=e.Game;arrive(e,'field','occupy',10);stock(g,'full');const before={...g.state.res},r=finish(e);
 assert.equal(r.won,false);assert.equal(r.cargoLoaded,0);assert.equal(r.overCapacity,0);assert.equal(r.overflow,0);
 assert.equal(sum(r.loot),0);assert.equal(sum(r.bonusLoot),0);assert.deepEqual(clone(g.state.res),before);assert.equal(g.state.conquered.field,undefined);assert.equal(g.validSave(g.state),true);
});

test('new over-capacity receipts restore and older receipt shapes remain readable',()=>{
 const e=setup(),g=e.Game;arrive(e);stock(g,'over');finish(e);g.save();e.offline(1);
 assert.ok(g.state.reports[0].overCapacity>0);assert.equal(g.validSave(g.state),true);
 const current=clone(g.state);
 for(const legacyReceipt of [true,false]){
  const old=clone(current);
  for(const r of [old.battle.result,...old.reports]){
   delete r.overCapacity;
   if(legacyReceipt){delete r.resourceReceipt.base.overCapacity;delete r.resourceReceipt.bonus.overCapacity;}
   else delete r.resourceReceipt;
  }
  assert.equal(g.validSave(old),true);g.importSave(old);assert.equal(g.validSave(g.state),true);
  assert.equal(g.state.reports[0].overCapacity,undefined);
  if(legacyReceipt)assert.deepEqual(clone(g.state.reports[0].resourceReceipt),old.reports[0].resourceReceipt);
  else assert.equal(g.state.reports[0].resourceReceipt,undefined);
 }
 // A historical discarded receipt preserves its original meaning.
 const old=clone(current);
 for(const r of [old.battle.result,...old.reports]){
  delete r.overCapacity;delete r.resourceReceipt.base.overCapacity;delete r.resourceReceipt.bonus.overCapacity;
  let lost=0;for(const part of ['base','bonus'])for(const id of Object.keys(r.resourceReceipt[part].loaded)){const amount=r.resourceReceipt[part].loaded[id];r.resourceReceipt[part].received[id]=0;r.resourceReceipt[part].overflow[id]=amount;lost+=amount;}r.overflow=lost;
 }
 assert.equal(g.validSave(old),true);g.importSave(old);assert.deepEqual(clone(g.state.reports[0].resourceReceipt),old.reports[0].resourceReceipt);
});

test('save validation rejects malformed over-capacity receipt maps',()=>{
 const e=setup(),g=e.Game;arrive(e);stock(g,'full');finish(e);const current=clone(g.state);
 for(const mutate of [r=>r.overCapacity.food=-1,r=>r.overCapacity.food=r.received.food+1,r=>r.overCapacity.alien=0,r=>delete r.overCapacity.food,r=>r.overCapacity=null]){
  const bad=clone(current);mutate(bad.reports[0].resourceReceipt.base);assert.equal(g.validSave(bad),false);
 }
 for(const mutate of [r=>r.overCapacity=-1,r=>r.overCapacity+=1,r=>delete r.resourceReceipt.base.overCapacity,r=>delete r.resourceReceipt]){const bad=clone(current);mutate(bad.reports[0]);assert.equal(g.validSave(bad),false);}
});

function occupyForest(e,node=forest,archers=300){assert.equal(e.Game.getNode(node).type,'forest','gathering fixtures harvest wood');arrive(e,node,'occupy',archers);const r=finish(e);assert.equal(r.won,true);assert.equal(r.stationed,true);assert.equal(e.Game.state.garrisons[node].phase,'stationed');assert.equal(e.Game.validSave(e.Game.state),true);return r;}
function startGather(e,node=forest){assert.equal(e.evaluate(`HeritageSystem.startGather('${node}')`),null);}
function quoteGather(e,node=forest){const before=JSON.stringify(e.Game.state),q=e.evaluate(`HeritageSystem.gatherQuote(Game.state,'${node}')`);assert.equal(JSON.stringify(e.Game.state),before);return q;}
function collect(e,node=forest){return e.evaluate(`HeritageSystem.collectGather('${node}')`);}
const lifetimeXp=s=>40*s.generalLevels.lin*(s.generalLevels.lin-1)+s.generalXp.lin;
for(const kind of ['full','over','partial'])test(`real one-hour garrison gathering accepts ${kind} warehouse resources and awards XP and jewels once`,()=>{
 const e=setup(),g=e.Game;occupyForest(e);startGather(e);e.advance(3599999);
 assert.match(collect(e),/至少采集 1 小时/);assert.ok(g.state.gatherings[forest]);
 e.advance(1);stock(g,kind);const before=g.state.res.wood,xp=lifetimeXp(g.state),pearls=g.state.jewels.pearl,q=quoteGather(e);
 assert.equal(q.ready,true);assert.equal(q.hours,1);assert.ok(q.amount>10);assert.equal(q.received,q.amount);assert.equal(q.discarded,0);assert.equal(q.room,kind==='partial'?10:0);assert.equal(q.overCapacity,q.received-q.room);assert.equal(q.xp,Math.floor(q.received*.01));
 assert.equal(collect(e),null);assert.equal(g.state.res.wood,before+q.received);assert.equal(lifetimeXp(g.state),xp+q.xp);assert.equal(g.state.jewels.pearl,pearls+1);assert.equal(g.state.gatherings[forest],undefined);
 const h=g.state.heritageHistory[0];assert.equal(h.loot.wood,q.received);assert.equal(h.overCapacity,q.overCapacity);assert.equal(h.discarded,0);assert.equal(h.jewels.pearl,1);assert.equal(g.validSave(g.state),true);
 const settled=JSON.stringify(g.state);assert.equal(collect(e),'没有可以结束的采集');assert.equal(JSON.stringify(g.state),settled);
 g.save();e.offline(1);assert.equal(g.validSave(g.state),true);assert.deepEqual(clone(g.state.heritageHistory[0]),clone(h));
});

test('real high-level garrison harvest is capped at 24 hours and available cargo, not warehouse capacity',()=>{
 const e=setup(10000),g=e.Game,node='wild_0_12';city(g,{hall:10,drill:10});g.state.res.food=100000000;
 occupyForest(e,node,10000);startGather(e,node);e.advance(24*3600000);stock(g,'full');
 const q=quoteGather(e,node);assert.equal(q.hours,24);assert.equal(q.cap,true);assert.ok(q.amount>q.carry);assert.equal(q.received,q.carry);assert.equal(q.discarded,q.amount-q.carry);assert.equal(q.overCapacity,q.received);
 const xp=lifetimeXp(g.state),before=g.state.res.wood,pearls=g.state.jewels.pearl;
 e.advance(4*3600000);const later=quoteGather(e,node);assert.equal(later.amount,q.amount);assert.equal(later.received,q.received);assert.equal(later.rolls,24);
 assert.equal(collect(e,node),null);assert.equal(g.state.res.wood,before+q.received);assert.equal(lifetimeXp(g.state),xp+q.xp);assert.equal(g.state.jewels.pearl,pearls+24);assert.equal(g.state.heritageHistory[0].discarded,q.discarded);assert.equal(g.validSave(g.state),true);
});

test('legacy gather histories restore without inventing excess amounts and reject malformed new fields',()=>{
 const e=setup(),g=e.Game;occupyForest(e);startGather(e);e.advance(3600000);stock(g,'full');assert.equal(collect(e),null);const current=clone(g.state),old=clone(current);delete old.heritageHistory[0].overCapacity;
 assert.equal(g.validSave(old),true);g.importSave(old);assert.equal(g.state.heritageHistory[0].overCapacity,undefined);assert.equal(g.validSave(g.state),true);
 for(const value of [-1,.5,Number.MAX_SAFE_INTEGER+1,'10']){const bad=clone(current);bad.heritageHistory[0].overCapacity=value;assert.equal(g.validSave(bad),false);}
 const bad=clone(current);bad.heritageHistory[0].overCapacity=bad.heritageHistory[0].loot.wood+1;assert.equal(g.validSave(bad),false);
});

test('warehouse excess does not enable natural production beyond capacity or erase existing stocks',()=>{
 const e=setup(0),g=e.Game;city(g,{house:4});g.setTax(20);g.state.population=100;stock(g,'over');const before={...g.state.res},wages=g.governanceStatus().wages;assert.ok(g.rates().wood>0);e.advance(3600000);
 for(const id of resources.filter(id=>id!=='gold'))assert.equal(g.state.res[id],before[id],'positive natural production stays stopped above capacity');
 assert.equal(g.state.res.gold,before.gold-wages,'above-cap gold still pays the actual hourly hero wage');
 for(const id of resources)g.state.res[id]=g.capacity(id)-1;e.advance(3600000);
 for(const id of resources.filter(id=>id!=='gold'))assert.equal(g.state.res[id],g.capacity(id));
 assert.equal(g.state.res.gold,g.capacity('gold')-wages,'natural gold caps before the hourly payroll expense');
 assert.equal(g.validSave(g.state),true);
});

test('safe numeric ceiling prevents overflowing saved resource values while preserving receipt arithmetic',()=>{
 const e=setup(),g=e.Game;e.evaluate('Math.random=()=>.999999');arrive(e,'field','occupy');
 for(const id of resources)g.state.res[id]=Number.MAX_SAFE_INTEGER-7;
 const r=finish(e);assert.equal(r.won,true);
 for(const id of ['food','wood','gold']){assert.equal(g.state.res[id],Number.MAX_SAFE_INTEGER);assert.equal(r.resourceReceipt.base.received[id],7);assert.equal(r.resourceReceipt.base.overflow[id],r.loot[id]-7);assert.equal(r.resourceReceipt.base.overCapacity[id],7);}
 assert.equal(g.validSave(g.state),true);
 const ge=setup(),gg=ge.Game;occupyForest(ge);startGather(ge);ge.advance(3600000);gg.state.res.wood=Number.MAX_SAFE_INTEGER-7;const q=quoteGather(ge);
 assert.equal(q.received,7);assert.equal(q.overCapacity,7);assert.equal(q.discarded,q.amount-7);assert.equal(collect(ge),null);assert.equal(gg.state.res.wood,Number.MAX_SAFE_INTEGER);assert.equal(gg.validSave(gg.state),true);
});


test('formal city defense retains its existing limited warehouse settlement',()=>{
 const e=setup(),g=e.Game;g.state.stats.victories=1;assert.equal(g.setAutoCityDefense(true),null);g.tick(e.now(),false);
 e.advance(e.evaluate('NPCDefenseData.intervalMs')+1);assert.ok(g.state.cityDefense.incoming);
 e.advance(g.state.cityDefense.incoming.arriveAt-e.now()+1);assert.equal(g.startCityDefense(false),null);
 stock(g,'full');const before={...g.state.res};let r;
 for(let i=0;i<30&&g.state.cityDefense.battle;i++)r=g.cityDefenseRound();
 assert.equal(r.won,true);assert.equal(g.state.cityDefense.battle,null);
 assert.equal(sum(r.resourceReceipt.received),0);assert.ok(sum(r.resourceReceipt.overflow)>0);
 assert.equal(r.resourceReceipt.overCapacity,undefined);assert.deepEqual(clone(g.state.res),before);assert.equal(g.validSave(g.state),true);
});
