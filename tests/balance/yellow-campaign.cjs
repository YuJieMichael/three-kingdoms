'use strict';
const assert=require('node:assert/strict');
const {loadGame}=require('../helpers/game.cjs'),{run:onboarding}=require('./archer-onboarding.cjs');
const plain=x=>JSON.parse(JSON.stringify(x)),total=a=>Object.values(a).reduce((n,x)=>n+x,0);
function ok(error){assert.equal(error,null);}
function normal(seed=1){
 const opening=onboarding(seed,true,'archer',{includeState:true}),e=loadGame(seed),G=e.Game,start=e.now();G.importSave(opening.state);e.advance(opening.state.last-e.now());
 function finish(){const q=G.state.buildQueue.at(-1);assert.ok(q);e.advance(Math.max(1,Math.ceil(q.end-e.now())+1));if(G.missions.some(m=>G.missionReady(m)))ok(G.claimReadyMissions());}
 // All resources, levels and equipment below come from normal player actions.
 ok(G.queueBuilding(G.state.cityLayout.indexOf(null),'workshop'));finish();ok(G.queueBuilding(G.state.cityLayout.indexOf(null),'wall'));finish();ok(G.upgrade('hall'));finish();
 let drills=0;for(let day=0;day<5&&G.state.generalLevels.lin<5;day++){for(let i=0;i<3&&G.state.generalLevels.lin<5;i++){ok(e.evaluate("HeroSystem.drill('lin')"));drills++;}if(G.state.generalLevels.lin<5)e.advance(86400000);}
 assert.ok(G.state.generalLevels.lin>=5);ok(e.evaluate('HeroSystem.gift()'));for(const item of G.state.equipment.filter(x=>!x.hero).slice(0,4))ok(e.evaluate(`HeroSystem.equip(${item.id},'lin')`));
 ok(G.claimStarterReinforcementToken());assert.equal(G.validSave(G.state),true);
 return {e,openingMinutes:opening.minutes,openMinutes:(e.now()-start)/60000,drills,entryGold:G.state.res.gold,state:plain(G.state)};
}
function clear(e,sides=false,onReady=null){const G=e.Game,q=G.battlefieldQuote('lin',{militia:800});assert.equal(q.reason,'');ok(G.startBattlefield('lin',{militia:800},q.key));
 const route=sides?['s1','s2','m1','m2','m3','s3','s4','m4','m5','m6','s5','s6','m7','m8','m9']:Array.from({length:9},(_,i)=>'m'+(i+1)),battles=[];let refills=0;
 for(const id of route){let r=G.state.battlefields.run;const missing=800-total(r.army);if(missing){ok(G.reinforceBattlefield({militia:missing}));refills++;}if(onReady)onReady(id,plain(G.state));ok(G.enterBattlefieldNode(id,'normal'));if(id==='s4')continue;const b=G.state.battlefields.run.battle;for(let turn=0;turn<30&&!b.finished;turn++)G.battlefieldRound();assert.equal(b.result.won,true,id);battles.push({id,rounds:b.round,lost:total(b.result.lost),recovered:total(b.result.recovered),pool:G.state.battlefields.run?.pool??null});assert.equal(G.validSave(G.state),true,id);}
 return {sides,refills,rounds:battles.reduce((n,b)=>n+b.rounds,0),losses:battles.reduce((n,b)=>n+b.lost,0),battles,receipt:plain(G.state.battlefields.lastReceipt)};
}
function run(seed){const n=normal(seed),base=plain(n.state),reports=[],bossStates={};for(const sides of [false,true]){const e=loadGame(seed);e.Game.importSave(base);e.advance(base.last-e.now());reports.push(clear(e,sides,(id,state)=>{if(!sides&&['m3','m9'].includes(id))bossStates[id]=state;}));}
 const probes=['m3','m9'].map(id=>{const losses=[];for(const withSide of [false,true]){const p=loadGame(seed),g=p.Game;g.importSave(bossStates[id]);p.advance(bossStates[id].last-p.now());if(withSide){ok(g.enterBattlefieldNode(id==='m3'?'s2':'s6'));const fight=g.state.battlefields.run.battle;for(let turn=0;turn<30&&!fight.finished;turn++)g.battlefieldRound();assert.equal(fight.result.won,true);ok(g.reinforceBattlefield({militia:800-total(g.state.battlefields.run.army)}));}ok(g.enterBattlefieldNode(id));const fight=g.state.battlefields.run.battle;for(let turn=0;turn<30&&!fight.finished;turn++)g.battlefieldRound();assert.equal(fight.result.won,true);losses.push(total(fight.result.lost));}assert.ok(losses[1]<losses[0]);return {id,baseline:losses[0],withSide:losses[1]};});
 const {e}=n,G=e.Game,slots=['weapon','helmet','armor','cloak','bracer','boots','mount'];let purchases=0;
 for(let day=0;day<7;day++){if(day){e.advance(86400000);ok(G.buyReinforcementToken());purchases++;}clear(e,false);const slot=slots[day];ok(G.openBattlefieldBox(slot));const item=G.state.equipment.at(-1);ok(e.evaluate(`HeroSystem.equip(${item.id},'lin')`));}
 const bonus=e.evaluate("HeroSystem.battlefieldSetBonus(Game.state,'lin')"),mount=G.state.equipment.find(x=>x.hero==='lin'&&x.slot==='mount');assert.equal(bonus.lead,3);assert.deepEqual(plain(e.evaluate(`HeroSystem.stats(Game.state.equipment.find(x=>x.id===${mount.id}))`)),{});assert.equal(G.validSave(G.state),true);
 return {seed,openingMinutes:n.openingMinutes,openMinutes:n.openMinutes,drills:n.drills,entryGold:n.entryGold,purchaseCost:purchases*2500,sevenDailyBoxes:true,probes,setBonus:plain(bonus),reports};
}
if(require.main===module)console.log(JSON.stringify([1,7,19].map(run),null,2));
module.exports={normal,clear,run};
