'use strict';
const assert=require('node:assert/strict'),{normal,clear:yellowClear}=require('./yellow-campaign.cjs'),{loadGame}=require('../helpers/game.cjs');
const plain=x=>JSON.parse(JSON.stringify(x)),total=a=>Object.values(a).reduce((a,b)=>a+b,0),ok=x=>assert.equal(x,null);
function normalNan(seed){const n=normal(seed),e=n.e,G=e.Game,start=e.now();yellowClear(e);ok(G.openBattlefieldBox());ok(e.evaluate(`HeroSystem.equip(${G.state.equipment.at(-1).id},'lin')`));let days=0,drills=0,cost=0;
 while(G.state.generalLevels.lin<10&&days<60){const q=e.evaluate("HeroSystem.drillQuote(Game.state,'lin')");if(q.used<3&&G.state.res.gold>=q.cost+30000){ok(e.evaluate("HeroSystem.drill('lin')"));drills++;cost+=q.cost;}if(G.state.generalLevels.lin<10){e.advance(86400000);days++;ok(G.buyReinforcementToken());yellowClear(e,true);}}
 assert.ok(G.state.generalLevels.lin>=10,'normal training reaches10');for(const tech of ['combat','protection'])if(!G.unitUnlocked(tech==='combat'?'spear':'shield')){ok(G.research(tech));e.advance(Math.ceil(G.state.researchQueue.end-e.now())+1);}ok(G.buyReinforcementToken());return {e,openingMinutes:n.openMinutes,cultivationDays:(e.now()-start)/86400000,drills,trainingGold:cost,entryGold:G.state.res.gold,state:plain(G.state)};
}
function clear(e,sides=false,army={militia:800},onReady=null){const G=e.Game,q=G.battlefieldQuote('lin',army,'nanman');assert.equal(q.reason,'');ok(G.startBattlefield('lin',army,q.key,'nanman'));const route=sides?['b1','b2','n1','n2','n3','b3','b4','n4','n5','n6','b5','b6','n7','n8','n9']:Array.from({length:9},(_,i)=>'n'+(i+1)),reports=[];
 for(const id of route){const r=G.state.battlefields.run,add=Object.fromEntries(Object.entries(army).map(([id,n])=>[id,n-r.army[id]]));if(total(add))ok(G.reinforceBattlefield(add));if(onReady)onReady(id,plain(G.state));ok(G.enterBattlefieldNode(id));if(id==='b4')continue;const b=r.battle;for(let turn=0;turn<30&&!b.finished;turn++)G.battlefieldRound();assert.equal(b.result.won,true,id);reports.push({id,rounds:b.round,lost:total(b.result.lost),pool:G.state.battlefields.run?.pool??null});assert.equal(G.validSave(G.state),true,id);G.save();G.init();}
 return {sides,army,rounds:reports.reduce((a,b)=>a+b.rounds,0),losses:reports.reduce((a,b)=>a+b.lost,0),battles:reports,receipt:plain(G.state.battlefields.lastReceipt)};
}
function run(seed){const n=normalNan(seed),reports=[],probesAt={};for(const [sides,army] of [[false,{militia:800}],[true,{militia:800}],[true,{spear:300,shield:300,archer:200}]]){const e=loadGame(seed);e.Game.importSave(n.state);e.advance(n.state.last-e.now());reports.push(clear(e,sides,army,(id,state)=>{if(!sides)probesAt[id]=state;}));}
 const probes=[];
 for(const [target,branch] of [['n3','b2'],['n6','b3'],['n9','b6'],['b2','hidden'],['b6','infiltration']]){
   const losses=[],enemies=[];for(const alternate of [false,true]){const x=loadGame(seed),g=x.Game,base=probesAt[target.startsWith('b')?(target==='b2'?'n3':'n7'):target];g.importSave(base);x.advance(base.last-x.now());
     const refill=()=>{const r=g.state.battlefields.run,add=800-total(r.army);if(add)ok(g.reinforceBattlefield({militia:add}));};
     const finish=(id,route='normal')=>{refill();ok(g.enterBattlefieldNode(id,route));const b=g.state.battlefields.run.battle;for(let t=0;t<30&&!b.finished;t++)g.battlefieldRound();assert.equal(b.result.won,true,id);assert.equal(g.validSave(g.state),true);return b;};
     if(target.startsWith('n')&&alternate)finish(branch);
     let route='normal';if(target==='b2'){ok(g.claimBattlefieldRelic('compass'));const item=g.state.equipment.find(e=>e.relic==='compass');ok(x.evaluate(`HeroSystem.equip(${item.id},'lin')`));if(alternate){ok(g.discoverBattlefieldRoute());route='hidden';}}
     if(target==='b6'){ok(g.claimBattlefieldRelic('mask'));const item=g.state.equipment.find(e=>e.relic==='mask');ok(x.evaluate(`HeroSystem.equip(${item.id},'lin')`));ok(g.attemptBattlefieldInfiltration('b6',alternate?'forest':'river'));route=alternate?'infiltration':'normal';}
     const b=finish(target,route);losses.push(total(b.result.lost));enemies.push(b.enemy.map(r=>({id:r.id,count:r.initial})));
   }assert.ok(losses[1]<losses[0],target+' real advantage');probes.push({target,normalLoss:losses[0],alternateLoss:losses[1],enemies});
 }
 const {e}=n,G=e.Game,slots=['weapon','helmet','armor','cloak','bracer','boots','mount'];let purchaseGold=0;
 for(let day=0;day<7;day++){if(day){e.advance(86400000);ok(G.buyReinforcementToken());purchaseGold+=2500;}clear(e);ok(G.openBattlefieldBox('nanman'));ok(e.evaluate(`HeroSystem.equip(${G.state.equipment.at(-1).id},'lin')`));ok(G.buyReinforcementToken());purchaseGold+=2500;const y=yellowClear(e);assert.equal(y.receipt.box,day?1:0);if(day)ok(G.openBattlefieldBox());}
 const b=plain(e.evaluate("HeroSystem.battlefieldSetBonus(Game.state,'lin')"));assert.equal(G.validSave(G.state),true);return {seed,openingMinutes:n.openingMinutes,cultivationDays:n.cultivationDays,drills:n.drills,trainingGold:n.trainingGold,entryGold:n.entryGold,purchaseGold,reports,probes,sevenDailyBoxes:true,randomSlots:G.state.equipment.filter(x=>x.setId==='nanman').map(x=>x.slot),setBonus:b};
}
if(require.main===module)console.log(JSON.stringify([1,7,19].map(run),null,2));module.exports={normalNan,clear,run};
