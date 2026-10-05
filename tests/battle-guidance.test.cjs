const {test}=require('node:test'),assert=require('node:assert/strict');
const {loadGame,city,battle}=require('./helpers/game.cjs');
function firstBattle(hold=false){const e=loadGame(123),g=e.Game;city(g,{drill:1});g.state.army.archer=30;g.state.tech.training=4;g.state.tech.shooting=1;if(hold)g.setTactic('archer','hold');assert.equal(g.dispatch('field','lin',{archer:30},'raid'),null);e.advance(g.state.expedition.end-e.now()+1);assert.equal(g.startBattle(),null);return e;}
test('new archers advance into range in the ordinary first battle without a test order override',()=>{
 const e=firstBattle(),g=e.Game;assert.equal(g.state.battle.orders.archer.command,'advance');for(let i=0;i<30&&!g.state.battle.finished;i++)g.battleRound();assert.equal(g.state.battle.result.won,true);assert.equal(g.state.battle.result.failure,null);assert.ok(g.state.battle.round<30);assert.equal(g.validSave(g.state),true);
});
test('saved manual hold remains stationary and out-of-range defeat explains the remaining enemy',()=>{
 const e=firstBattle(true),g=e.Game;g.save();g.init();assert.equal(g.state.tactics.archer.command,'hold');for(let i=0;i<30&&!g.state.battle.finished;i++)g.battleRound();const f=g.state.battle.result.failure;assert.equal(g.state.battle.player[0].pos,0);assert.equal(f.reason,'enemy');assert.equal(f.round,30);assert.equal(f.enemyRemaining,7);assert.equal(f.outOfRange,true);assert.equal(g.validSave(g.state),true);g.init();assert.equal(g.state.reports[0].failure.outOfRange,true);
});
test('gate timeout reports remaining fortification even when all defenders are cleared',()=>{
 const e=loadGame(123),g=e.Game;city(g,{hall:8,drill:10});g.state.conquered.north_keep=true;g.state.warOrders.cleared.siege=9;g.state.warOrders.wins.siege=9;g.state.army.archer=1100;g.state.res.food=1000000;const r=battle(e,'order_siege_10','occupy',{archer:1100});assert.equal(r.won,false);assert.equal(r.failure.reason,'gate');assert.equal(r.failure.enemyRemaining,0);assert.ok(r.failure.gateHp>0);assert.ok(g.state.battle.log.some(line=>line.includes('城防仍未攻破')&&!line.includes('守军未清空')));assert.equal(g.validSave(g.state),true);
});
test('legacy finished reports without failure diagnostics remain valid and malformed diagnostics are rejected',()=>{
 const e=firstBattle(true),g=e.Game;for(let i=0;i<30;i++)g.battleRound();const saved=JSON.parse(JSON.stringify(g.state));delete saved.battle.result.failure;delete saved.reports[0].failure;assert.equal(g.validSave(saved),true);for(const edit of [f=>f.reason='unknown',f=>f.round=31,f=>f.enemyRemaining=-1,f=>f.gateHp='1',f=>f.outOfRange=1]){const bad=JSON.parse(JSON.stringify(g.state));edit(bad.reports[0].failure);assert.equal(g.validSave(bad),false);}
});
test('first battle completion requires a victory, returned archers and does not award anything twice',()=>{
 const e=firstBattle(),g=e.Game;assert.match(g.completeFirstBattleGuide(),/胜利/);for(let i=0;i<30&&!g.state.battle.finished;i++)g.battleRound();assert.match(g.completeFirstBattleGuide(),/返城/);e.advance(g.state.expedition.end-e.now()+1);assert.match(g.completeFirstBattleGuide(),/弓箭手/);g.state.army.archer=30;const resources=JSON.stringify([g.state.res,g.state.jewels,g.state.inventory]);assert.equal(g.completeFirstBattleGuide(),null);assert.equal(g.state.onboarding.firstBattle,'complete');assert.equal(g.completeFirstBattleGuide(),null);assert.equal(JSON.stringify([g.state.res,g.state.jewels,g.state.inventory]),resources);assert.equal(g.validSave(g.state),true);g.init();assert.equal(g.state.onboarding.firstBattle,'complete');
});
