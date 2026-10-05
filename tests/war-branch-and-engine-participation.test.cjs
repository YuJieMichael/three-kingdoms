const {test}=require('node:test'),assert=require('node:assert/strict');
const {loadGame,city}=require('./helpers/game.cjs');
const ids={guard:'order_challenge_siege_5_engines',intercept:'order_branch_field_10_intercept',flank:'order_branch_elite_10_flank'};
const copy=x=>JSON.parse(JSON.stringify(x));
function setup(node,army,seed=123){const e=loadGame(seed),g=e.Game;city(g,{hall:8,drill:10,house:10,barracks:10,academy:8,smith:8});Object.assign(g.state.conquered,{fort:true,north_keep:true});g.state.res.food=1000000;Object.assign(g.state.army,army);const n=g.getNode(node);g.state.warOrders.cleared[n.orderRoute]=n.orderTier;g.state.warOrders.wins[n.orderRoute]=n.orderTier;return e;}
function fight(e,node,army,parkRams=false){const g=e.Game;for(const id of Object.keys(army))assert.equal(g.setTactic(id,parkRams&&id==='ram'?'hold':'advance',''),null);assert.equal(g.dispatch(node,'lin',army,'occupy'),null);e.advance(g.state.expedition.end-e.now()+1);assert.equal(g.startBattle(),null);for(let n=0;n<30&&!g.state.battle.finished;n++)g.battleRound();assert.equal(g.validSave(g.state),true);return g.state.battle.result;}
function trainingCost(g,army){return Object.entries(army).reduce((sum,[id,count])=>sum+Object.values(g.trainCost(id,count)).reduce((a,b)=>a+b,0),0);}

test('advanced branches use different enemy roles, unlock after normal tenth tier and retain route recovery/concurrency',()=>{
 const e=setup(ids.intercept,{archer:1100}),g=e.Game;g.state.warOrders.cleared.field=9;g.state.warOrders.wins.field=9;assert.match(g.attackBlocked(ids.intercept,'occupy'),/普通第 10 阶/);g.state.warOrders.cleared.field=10;g.state.warOrders.wins.field=10;
 assert.equal(g.attackBlocked(ids.intercept,'occupy'),null);assert.match(g.attackBlocked(ids.intercept,'raid'),/讨伐/);assert.deepEqual(copy(g.getNode(ids.intercept).army),{cavalry:500});assert.deepEqual(copy(g.getNode(ids.flank).army),{ballista:200});assert.notDeepEqual(copy(g.getNode(ids.intercept).army),copy(g.getNode('order_field_10').army));assert.equal(g.dispatch(ids.intercept,'lin',{archer:1100},'occupy'),null);assert.match(g.attackBlocked('order_field_10','occupy'),/已有部队/);
});
test('near-equal training budgets show spear protection and cavalry speed-loss tradeoffs without replacing archer damage',()=>{
 // Artificial advanced checkpoints: these are combat comparisons, not a normal economy progression claim.
 for(const seed of [123,456]){
  for(const [node,expected,forms]of [
   [ids.intercept,'spear',{pure:{archer:1100},spear:{archer:850,spear:316},shield:{archer:850,shield:316}}],
   [ids.flank,'cavalry',{pure:{archer:1100},cavalry:{archer:850,cavalry:113},shield:{archer:850,shield:316}}]
  ]){
   const rows={};for(const [name,army]of Object.entries(forms)){const e=setup(node,army,seed),g=e.Game,r=fight(e,node,army);rows[name]={r,round:g.state.battle.round,cost:trainingCost(g,army)};assert.equal(r.won,true);assert.ok(army.archer>=850);assert.ok(Math.abs(rows[name].cost-1045000)<=1000);assert.equal(r.warOrder.challenge.met,name===expected);assert.equal(g.state.warOrders.cleared[g.getNode(node).orderRoute],10);assert.equal(g.state.conquered[node],undefined);assert.match(g.attackBlocked(node,'occupy'),/整军/);const earned=g.state.warOrders.earned;g.battleRound();assert.equal(g.state.warOrders.earned,earned);g.init();assert.equal(g.state.warOrders.earned,earned);}
   assert.ok(Object.values(rows[expected].r.lost).reduce((a,b)=>a+b,0)<Object.values(rows.pure.r.lost).reduce((a,b)=>a+b,0));if(node===ids.flank){assert.equal(rows.cavalry.round,2);assert.equal(rows.shield.round,3);}
  }
 }
});
test('parked siege engines do not pass protection while actual surviving engines do',()=>{
 for(const seed of [123,456]){
  const e=setup(ids.guard,{archer:1100,ram:5},seed),g=e.Game,r=fight(e,ids.guard,{archer:1100,ram:5},true);assert.equal(r.won,true);assert.equal(r.warOrder.challenge.machineAlive,5);assert.equal(r.warOrder.challenge.machineGateAttacks,0);assert.equal(r.warOrder.challenge.met,false);assert.equal(r.warOrder.points,36);assert.equal(g.state.battle.player.find(row=>row.id==='ram').pos,0);assert.equal(g.state.warOrders.challenges.completed[ids.guard],undefined);
  const army={shield:350,spear:500,archer:1100,cavalry:150,ram:10,catapult:5},engaged=setup(ids.guard,army,seed),result=fight(engaged,ids.guard,army);assert.equal(result.warOrder.challenge.met,true);assert.ok(result.warOrder.challenge.machineGateAttacks>0);assert.equal(result.warOrder.challenge.rulesVersion,2);const count=engaged.Game.state.battle.machineGateAttacks;engaged.Game.init();assert.equal(engaged.Game.state.battle.machineGateAttacks,count);assert.equal(engaged.Game.state.warOrders.challenges.earned,40);
 }
});
test('old completed engine receipts retain their reward without inventing participation or paying again',()=>{
 const e=setup(ids.guard,{archer:1100,ram:5}),g=e.Game,context={round:6,machineGateAttacks:1,army:{archer:95,ram:5},lost:{archer:15,ram:0},alive:{archer:80,ram:5}};
 g.warOrders.settle(g.state,g.getNode(ids.guard),true,e.now(),context);const saved=copy(g.state);for(const receipt of [saved.warOrders.last.challenge,saved.warOrders.challenges.lastAttempts[ids.guard]]){delete receipt.rulesVersion;delete receipt.machineGateAttacks;}assert.equal(g.validSave(saved),true);g.importSave(saved);assert.equal(g.state.warOrders.challenges.completed[ids.guard],true);assert.equal(g.state.warOrders.challenges.earned,40);e.advance(g.warOrders.RECOVERY+1);const r=fight(e,ids.guard,{archer:1100,ram:5},true);assert.equal(r.warOrder.challenge.met,false);assert.equal(r.warOrder.challenge.bonus,0);assert.equal(g.state.warOrders.challenges.earned,40);assert.equal(g.state.warOrders.challenges.completed[ids.guard],true);assert.equal(g.validSave(g.state),true);
 e.advance(g.warOrders.RECOVERY+1);g.dismissBattle();const army={shield:350,spear:500,archer:1100,cavalry:150,ram:10,catapult:5};Object.assign(g.state.army,army);const engaged=fight(e,ids.guard,army);assert.equal(engaged.warOrder.challenge.met,true);assert.equal(engaged.warOrder.challenge.first,false);assert.equal(engaged.warOrder.challenge.bonus,0);assert.equal(g.state.warOrders.challenges.earned,40);
});
test('participation receipts reject malformed counters and do not credit rescued engine casualties',()=>{
 const e=setup(ids.guard,{archer:1100,ram:5}),g=e.Game,c={round:6,machineGateAttacks:1,army:{archer:95,ram:5},lost:{archer:15,ram:0},alive:{archer:80,ram:3},back:{archer:80,ram:5},wounded:{ram:2}};const r=g.warOrders.settle(g.state,g.getNode(ids.guard),true,e.now(),c);assert.equal(r.challenge.met,false);assert.equal(g.validSave(g.state),true);
 for(const value of [-1,13,'1',Infinity]){const bad=copy(g.state);bad.warOrders.last.challenge.machineGateAttacks=value;assert.equal(g.validSave(bad),false);}const newBranch=setup(ids.flank,{archer:850,cavalry:113}),result=fight(newBranch,ids.flank,{archer:850,cavalry:113});assert.equal(result.warOrder.challenge.met,true);const forged=copy(newBranch.Game.state);delete forged.warOrders.last.challenge.rulesVersion;delete forged.warOrders.last.challenge.machineGateAttacks;assert.equal(newBranch.Game.validSave(forged),false);
});
