const {test}=require('node:test'),assert=require('node:assert/strict');
const {loadGame,city,battle}=require('./helpers/game.cjs');
const ids={loss:'order_challenge_field_5_preserve',round:'order_challenge_elite_5_swift',engines:'order_challenge_siege_5_engines'};
const force={shield:350,spear:500,archer:1100,cavalry:150,ram:10,catapult:5};
function setup(seed=123){const e=loadGame(seed),g=e.Game;city(g,{hall:8,drill:10,house:10,barracks:10,academy:8,smith:8});Object.assign(g.state.conquered,{fort:true,north_keep:true});Object.assign(g.state.army,force);g.state.res.food=1000000;for(const route of ['field','elite','siege']){g.state.warOrders.cleared[route]=5;g.state.warOrders.wins[route]=5;}return e;}
function evidence(values={}){return {round:6,machineGateAttacks:1,army:{archer:95,ram:5},lost:{archer:15,ram:0},alive:{archer:80,ram:5},...values};}
function settle(e,id,won,context){const g=e.Game;return g.warOrders.settle(g.state,g.getNode(id),won,e.now(),context);}
function copy(x){return JSON.parse(JSON.stringify(x));}

test('optional challenges preserve chapter, normal-tier, mode, recovery and same-route gates',()=>{
 const e=loadGame(),g=e.Game;city(g,{drill:10});g.state.army.archer=1000;g.state.res.food=1000000;
 assert.match(g.attackBlocked(ids.loss,'occupy'),/北境大营/);g.state.conquered.north_keep=true;
 assert.match(g.attackBlocked(ids.loss,'occupy'),/普通第 5 阶/);g.state.warOrders.cleared.field=4;g.state.warOrders.wins.field=4;
 assert.match(g.dispatch(ids.loss,'lin',{archer:100},'occupy'),/普通第 5 阶/);g.state.warOrders.cleared.field=5;g.state.warOrders.wins.field=5;
 assert.equal(g.attackBlocked(ids.loss,'occupy'),null);assert.match(g.dispatch(ids.loss,'lin',{archer:100},'raid'),/讨伐/);
 assert.equal(g.dispatch('order_field_6','lin',{archer:100},'occupy'),null);assert.match(g.attackBlocked(ids.loss,'occupy'),/已有部队/);
 assert.equal(g.getNode('order_challenge_field_10_preserve'),null);assert.equal(g.getNode('__proto__'),null);
 assert.equal(g.getNode(ids.loss).orderTier,5);assert.deepEqual(copy(g.getNode(ids.loss).army),copy(g.getNode('order_field_5').army));
});

test('condition boundaries use permanent losses, exact turns and battlefield engine survivors',()=>{
 for(const [id,pass,fail] of [
  [ids.loss,evidence(),evidence({lost:{archer:16,ram:0},alive:{archer:79,ram:5}})],
  [ids.round,evidence({round:6}),evidence({round:7})],
  [ids.engines,evidence({alive:{archer:80,ram:4}}),evidence({alive:{archer:80,ram:3},back:{archer:80,ram:5},wounded:{ram:2}})]
 ]){
  const e=setup(),g=e.Game,r=settle(e,id,true,pass);assert.equal(r.challenge.met,true);assert.equal(r.challenge.first,true);assert.equal(r.challenge.bonus,g.warOrders.challenge(id).bonus);assert.equal(r.points,r.basePoints+r.challenge.bonus);assert.equal(g.validSave(g.state),true,id);
  const repeated=settle(e,id,true,pass);assert.equal(repeated.challenge.met,true);assert.equal(repeated.challenge.first,false);assert.equal(repeated.challenge.bonus,0);assert.equal(g.state.warOrders.challenges.earned,r.challenge.bonus);assert.equal(g.validSave(g.state),true);
  const failed=settle(e,id,true,fail);assert.equal(failed.challenge.met,false);assert.equal(failed.challenge.bonus,0);assert.equal(failed.points,g.warOrders.points(g.getNode(id)));assert.equal(g.state.warOrders.cleared[g.getNode(id).orderRoute],5);assert.equal(g.validSave(g.state),true);
 }
 const e=setup();assert.equal(settle(e,ids.engines,true,evidence({army:{archer:96,ram:4},alive:{archer:80,ram:4}})).challenge.met,false);
 assert.equal(settle(e,ids.round,true,{round:1,army:{archer:-1},lost:{archer:0},alive:{archer:0}}).challenge.met,false);
 assert.equal(settle(e,ids.round,true,{round:1,army:{unknown:100},lost:{},alive:{}}).challenge.met,false);
 assert.equal(e.Game.validSave(e.Game.state),true);
});

test('a failed challenge leaves ordinary victory merit available and defeat never grants a bonus',()=>{
 const e=setup(),g=e.Game,r=settle(e,ids.loss,true,evidence({lost:{archer:30,ram:0},alive:{archer:65,ram:5}}));
 assert.equal(r.challenge.met,false);assert.equal(r.points,32);assert.equal(g.state.warOrders.merit,32);assert.equal(g.state.warOrders.challenges.earned,0);assert.deepEqual(copy(g.state.warOrders.challenges.completed),{});
 assert.equal(settle(e,ids.round,false,evidence({round:0})),null);assert.equal(g.state.warOrders.merit,32);assert.equal(g.state.warOrders.challenges.lastAttempts[ids.round].won,false);assert.equal(g.state.warOrders.challenges.lastAttempts[ids.round].round,0);assert.equal(g.state.warOrders.challenges.lastAttempts[ids.round].met,false);assert.match(g.attackBlocked(ids.round,'occupy'),/整军/);assert.equal(g.validSave(g.state),true);
});

test('old ledgers gain empty optional progress while retaining historical earned, spent and ordinary receipts',()=>{
 const e=setup(),g=e.Game;g.state.warOrders.merit=40;g.state.warOrders.earned=60;g.state.warOrders.spent=20;g.state.warOrders.last={node:'order_field_5',route:'field',tier:5,first:false,points:32};
 const old=copy(g.state);delete old.warOrders.challenges;g.importSave(old);
 assert.equal(g.state.warOrders.merit,40);assert.equal(g.state.warOrders.earned,60);assert.equal(g.state.warOrders.spent,20);assert.equal(g.state.warOrders.challenges.earned,0);assert.deepEqual(copy(g.state.warOrders.challenges.completed),{});assert.equal(g.validSave(g.state),true);
});

test('first-bonus ledgers and numeric receipts reject forgery before import',()=>{
 const e=setup(),g=e.Game,r=settle(e,ids.loss,true,evidence());assert.equal(g.warOrders.validReceipt(r),true);
 for(const change of [
  s=>s.warOrders.challenges.completed.unknown=true,
  s=>s.warOrders.challenges.completed[ids.loss]=false,
  s=>s.warOrders.challenges.earned=31,
  s=>s.warOrders.challenges.lastAttempts[ids.loss].lost=-1,
  s=>s.warOrders.challenges.lastAttempts[ids.loss].met=false,
  s=>s.warOrders.last.challenge.bonus=60,
  s=>s.warOrders.last.challenge.first=false,
  s=>s.warOrders.last.basePoints=999,
  s=>s.warOrders.last.challenge.round=0,
  s=>s.warOrders.last.challenge.lost=16,
  s=>delete s.warOrders.challenges.completed[ids.loss],
  s=>s.warOrders.cleared.field=4
 ]){const bad=copy(g.state);change(bad);assert.equal(g.validSave(bad),false);assert.throws(()=>g.importSave(bad),/Invalid save/);}
});

test('real protected siege and swift victories persist once, retain ordinary loot and allow replay',()=>{
 for(const seed of [123,456])for(const id of [ids.loss,ids.round,ids.engines]){
  const e=setup(seed),g=e.Game,r=battle(e,id,'occupy',force);
  assert.equal(r.won,true,id+' seed '+seed);assert.equal(r.challenge,undefined);assert.equal(r.warOrder.challenge.met,true,id+' seed '+seed);assert.equal(r.warOrder.challenge.first,true);assert.equal(r.warOrder.challenge.deployed,Object.values(force).reduce((a,b)=>a+b,0));assert.ok(r.cargoLoaded>0);assert.equal(g.state.conquered[id],undefined);assert.equal(g.state.warOrders.cleared[g.getNode(id).orderRoute],5);assert.equal(g.validSave(g.state),true);
  const earned=g.state.warOrders.earned,bonus=g.state.warOrders.challenges.earned,returned=r.back.archer;g.battleRound();assert.equal(g.state.warOrders.earned,earned);const duplicate=copy(g.state);duplicate.reports.push(copy(duplicate.reports[0]));assert.equal(g.validSave(duplicate),false);assert.throws(()=>g.importSave(duplicate),/Invalid save/);g.importSave(copy(g.state));assert.equal(g.state.warOrders.earned,earned);
  e.offline(5*3600000);assert.equal(g.state.warOrders.earned,earned);assert.equal(g.state.warOrders.challenges.earned,bonus);assert.equal(g.state.army.archer,returned);assert.equal(g.state.expedition,null);assert.equal(g.state.warOrders.challenges.completed[id],true);assert.equal(g.validSave(g.state),true);g.dismissBattle();
  Object.assign(g.state.army,force);g.state.res.food=1000000;const repeated=battle(e,id,'occupy',force);assert.equal(repeated.won,true);assert.equal(repeated.warOrder.challenge.met,true);assert.equal(repeated.warOrder.challenge.first,false);assert.equal(repeated.warOrder.challenge.bonus,0);assert.equal(g.state.warOrders.challenges.earned,bonus);assert.equal(g.validSave(g.state),true);
 }
});

test('ordinary siege wins without the required engines remain victories with normal rewards',()=>{
 const e=setup(),g=e.Game;g.state.army.archer=5000;const r=battle(e,ids.engines,'occupy',{archer:5000});
 assert.equal(r.won,true);assert.equal(r.warOrder.challenge.met,false);assert.equal(r.warOrder.points,36);assert.equal(r.warOrder.challenge.machines,0);assert.equal(g.state.warOrders.challenges.earned,0);assert.ok(r.cargoLoaded>0);assert.equal(g.validSave(g.state),true);
});
