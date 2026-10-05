'use strict';
const fs=require('node:fs'),path=require('node:path');
const repo=path.resolve(__dirname,'../..');
const {loadGame}=require(path.join(repo,'tests/helpers/game.cjs'));
const {run}=require(path.join(repo,'tests/balance/archer-onboarding.cjs'));
const opening=run(123,true,'ten-gifts',{includeState:true}),e=loadGame(123),g=e.Game;
e.advance(opening.state.last-e.now());g.importSave(opening.state);
const start=e.now(),log=[],used={};
function ok(error){if(error)throw Error(error);}
function collect(){if(g.missions.some(m=>g.missionReady(m)))ok(g.claimReadyMissions());}
function advance(ms){while(ms>0){const n=Math.min(ms,3600000);e.advance(n,false);ms-=n;}collect();}
function finish(kind,q){for(let i=0;i<80&&q.end>e.now();i++){const items=g.manual.shop.filter(item=>item.effect==='speedup'&&item.queueKind===kind&&g.state.inventory[item.id]>0&&(item.speedup.seconds||item.speedup.minHours)).sort((a,b)=>(a.speedup.seconds||a.speedup.minHours*3600)-(b.speedup.seconds||b.speedup.minHours*3600));if(!items.length)break;const remaining=(q.end-Math.max(e.now(),q.start))/1000,item=items.find(x=>(x.speedup.seconds||x.speedup.minHours*3600)>=remaining)||items.at(-1);ok(g.useSpeedup(item.id,g.speedupKey(kind,q)).error);used[item.id]=(used[item.id]||0)+1;}advance(Math.max(1,Math.ceil(q.end-e.now())+1));}
for(let i=0;i<100;i++){
 collect();const m=e.evaluate('GrowthGuide.model(Game)');log.push({at:e.now(),kind:m.kind,id:m.id,title:m.title});
 if(m.kind==='epic')break;
 if(m.kind==='tech'){ok(g.research(m.id));finish('research',g.state.researchQueue);}
 else if(m.kind==='building'){ok(Object.hasOwn(g.plotTypes,m.id)?g.developPlot(m.site,m.id):g.queueBuilding(m.site,m.id));finish('build',g.state.buildQueue.find(q=>q.id===m.id));}
 else if(m.kind==='train'){ok(g.train(m.id,m.count));finish('train',g.state.trainQueue.at(-1));}
 else if(m.kind==='queue')finish(m.queueKind,m.queue);
 else if(m.kind==='trade')ok(g.trade(m.id,Math.min(m.amount,g.tradeQuote(m.id,true).limit),true));
 else if(m.kind==='population'){if(g.state.inventory.population>0){ok(g.useItem('population'));used.population=(used.population||0)+1;}else advance(60000);}
 else if(m.kind==='campaign'){ok(g.setTactic('archer','advance',''));ok(g.dispatch(m.id,'lin',{archer:m.army.archer},'occupy'));}
 else if(m.kind==='battleMarch'||m.kind==='battleReturn')advance(Math.max(1,Math.ceil(m.end-e.now())+1));
 else if(m.kind==='battleArrival')ok(g.startBattle());
 else if(m.kind==='battle'){if(g.state.battle.orders.archer)ok(g.setBattleOrder('archer',m.inRange?'hold':'advance'));g.battleRound();collect();}
 else throw Error('Unexpected campaign target '+JSON.stringify(m));
}
g.save();const result={seed:123,method:'normal API hall-to-camp continuation; earned speedups; no supplies, preset buildings/resources/army or forced battle damage',openingHours:opening.minutes/60,continuationMinutes:(e.now()-start)/60000,conqueredCamp:!!g.state.conquered.camp,next:e.evaluate('GrowthGuide.model(Game)'),army:g.state.army,stock:g.state.res,used,log,report:g.state.reports[0],validSave:g.validSave(g.state)};
if(!result.conqueredCamp||result.next.kind!=='epic'||!result.validSave)throw Error('Normal campaign continuation did not finish');
console.log(JSON.stringify({openingHours:result.openingHours,continuationMinutes:result.continuationMinutes,rounds:result.report.round,loss:result.report.lost.archer,army:result.army.archer,next:result.next,validSave:result.validSave},null,2));
