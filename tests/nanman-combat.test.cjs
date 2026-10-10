const {test}=require('node:test'),assert=require('node:assert/strict');const {nanReady,beginNan,plain,cloneActiveSave}=require('./helpers/nanman.cjs');
function finish(e,id,choice='normal'){const G=e.Game,r=G.state.battlefields.run,add=800-Object.values(r.army).reduce((a,b)=>a+b,0);if(add)assert.equal(G.reinforceBattlefield({militia:add}),null);assert.equal(G.enterBattlefieldNode(id,choice),null);const b=r.battle;if(b)for(let i=0;i<30&&!b.finished;i++)G.battlefieldRound();if(b)assert.equal(b.result.won,true,id);return b;}
function reach(e){beginNan(e);for(let i=1;i<=6;i++)finish(e,'n'+i);}
function mask(e){assert.equal(e.Game.claimBattlefieldRelic('mask'),null);const item=e.Game.state.equipment.find(x=>x.relic==='mask');assert.ok(item);assert.equal(e.evaluate(`HeroSystem.equip(${item.id},'lin')`),null);return item;}
test('nanman branch victory applies finite rental and medical effects without affecting city troops',()=>{
 const e=nanReady(),G=e.Game;beginNan(e);const before=plain({army:G.state.army,pop:G.state.population,warCare:G.state.warCare});finish(e,'b1');assert.equal(G.state.battlefields.run.pool+Object.values(G.state.battlefields.run.army).reduce((a,b)=>a+b,0)+Object.values(G.state.battlefields.run.wounded).reduce((a,b)=>a+b,0),3500);assert.ok(G.enterBattlefieldNode('b1'));
 for(let i=1;i<=3;i++)finish(e,'n'+i);finish(e,'b4');assert.equal(G.state.battlefields.run.medicalQuota,200);assert.ok(G.enterBattlefieldNode('b4'));assert.deepEqual(plain({army:G.state.army,pop:G.state.population,warCare:G.state.warCare}),before);assert.equal(G.validSave(G.state),true);
});
test('specific nanman boss advantages disappear only after their matching branches',()=>{
 const e=nanReady(),G=e.Game;beginNan(e);const B=e.evaluate('BattlefieldSystem'),api={};const r=G.state.battlefields.run;
 assert.equal(B.nodeForRun(r,'n3').armyAttack.archer,1.08);assert.equal(B.nodeForRun(r,'n6').commander.defense,1.12);assert.equal(B.nodeForRun(r,'n9').commander.defense,1.1);
 finish(e,'b2');assert.equal(B.nodeForRun(r,'n3').armyAttack.archer,undefined);for(let i=1;i<=3;i++)finish(e,'n'+i);finish(e,'b3');assert.equal(B.nodeForRun(r,'n6').commander.defense,1);for(let i=4;i<=6;i++)finish(e,'n'+i);finish(e,'b6');assert.equal(B.nodeForRun(r,'n9').commander.defense,1);assert.equal(G.validSave(G.state),true);
});
test('mask attempt is persisted once before combat and successful deployment survives failure and reload',()=>{
 const e=nanReady(),G=e.Game;assert.equal(typeof G.attemptBattlefieldInfiltration,'function');reach(e);const item=mask(e),r=G.state.battlefields.run;
 let before=JSON.stringify(G.state);assert.ok(G.attemptBattlefieldInfiltration('b6','unknown'));assert.equal(JSON.stringify(G.state),before);
 assert.equal(G.attemptBattlefieldInfiltration('b6','forest'),null);assert.equal(r.battle?.finished??true,true);assert.equal(r.infiltration.b6,'infiltration');assert.ok(G.attemptBattlefieldInfiltration('b6','forest'));
 assert.equal(G.enterBattlefieldNode('b6','infiltration'),null);const b=r.battle;assert.deepEqual(plain(b.enemy.map(x=>x.id)),['shield']);assert.equal(b.route,'infiltration');
 G.battlefieldOrder('militia','hold');for(let i=0;i<30&&!b.finished;i++){for(const row of b.enemy)b.enemyOrders[row.id].command='hold';G.battlefieldRound();}assert.equal(b.result.won,false);
 assert.equal(e.evaluate(`HeroSystem.unequip(${item.id})`),null);G.save();G.init();assert.equal(G.state.battlefields.run.infiltration.b6,'infiltration');assert.ok(G.attemptBattlefieldInfiltration('b6','forest'));finish(e,'b6','infiltration');assert.equal(G.validSave(G.state),true);
 const forged=cloneActiveSave(G.state);forged.battlefields.run.battle.enemy[0].initial++;assert.equal(G.validSave(forged),false);
});
test('wrong mask answer locks the normal encounter while no mask still allows normal entry',()=>{
 const e=nanReady(),G=e.Game;reach(e);const before=JSON.stringify(G.state);assert.ok(G.attemptBattlefieldInfiltration?.('b6','forest')||'missing');assert.equal(JSON.stringify(G.state),before);mask(e);
 assert.equal(G.attemptBattlefieldInfiltration('b6','river'),null);assert.ok(G.enterBattlefieldNode('b6','infiltration'));assert.equal(G.enterBattlefieldNode('b6','normal'),null);assert.deepEqual(plain(G.state.battlefields.run.battle.enemy.map(x=>x.id)),['shield','archer']);
});
test('compass finds a real alternative nanman deployment with one branch reward',()=>{
 const e=nanReady(),G=e.Game;assert.equal(G.claimBattlefieldRelic('compass'),null);const item=G.state.equipment.find(x=>x.relic==='compass');assert.equal(e.evaluate(`HeroSystem.equip(${item.id},'lin')`),null);beginNan(e);
 assert.ok(G.enterBattlefieldNode('b2','hidden'));assert.equal(G.discoverBattlefieldRoute(),null);assert.equal(G.enterBattlefieldNode('b2','hidden'),null);assert.deepEqual(plain(G.state.battlefields.run.battle.enemy.map(x=>x.id)),['spear']);assert.equal(G.validSave(G.state),true);
});
module.exports={finish,reach};
