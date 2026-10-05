'use strict';
// Read-only assessment: use the repository's unchanged normal-API route runner.
// Intercept only its time advancement to compare online hourly settlement with
// its usual long-jump/offline-like settlement and to observe resource changes.
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const repo=path.resolve(__dirname,'../..');
const {loadGame}=require(path.join(repo,'tests/helpers/game.cjs'));
const source=fs.readFileSync(path.join(repo,'tests/balance/archer-onboarding.cjs'),'utf8');
const resourceIds=['food','wood','stone','iron','gold'];
const copy=x=>JSON.parse(JSON.stringify(x));
const zero=()=>Object.fromEntries(resourceIds.map(id=>[id,0]));
function measure(seed,accelerate,target,{hourly=false,allocatePolitics=false}={}){
  let observed;
  function trackedLoadGame(actualSeed){
    const env=loadGame(actualSeed),g=env.Game,advance=env.advance;
    const natural=zero(),aboveCapacityHours=zero(),sinks=zero(),calls=[];
    const budgetMethods=['queueBuilding','developPlot','research','train','trade','dispatch','scout'];
    for(const method of budgetMethods){const original=g[method];g[method]=(...args)=>{const before=copy(g.state.res),error=original(...args);if(!error){for(const id of resourceIds)if(g.state.res[id]<before[id])sinks[id]+=before[id]-g.state.res[id];calls.push({method,args:copy(args),at:env.now(),cost:Object.fromEntries(resourceIds.map(id=>[id,Math.max(0,before[id]-g.state.res[id])]))});}return error;};}
    const allocations=[];
    env.advance=(ms,allowAutomation=false)=>{
      let left=ms;
      while(left>0){
        const step=hourly?Math.min(left,3600000):left,before=copy(g.state.res),caps=Object.fromEntries(resourceIds.map(id=>[id,g.capacity(id)]));
        advance(step,allowAutomation);
        for(const id of resourceIds){natural[id]+=g.state.res[id]-before[id];if(before[id]>=caps[id])aboveCapacityHours[id]+=step/3600000;}
        if(allocatePolitics){const id=g.state.governor,available=env.evaluate('HeroSystem.remaining(Game.state,Game.state.governor)');if(available>0){const error=env.evaluate(`HeroSystem.allocate(${JSON.stringify(id)},{atk:0,def:0,pol:${available},wis:0,lead:0})`);if(error)throw Error(error);allocations.push({at:env.now(),id,points:available,pol:g.general(id).pol});}}
        left-=step;
      }
    };
    observed={env,natural,aboveCapacityHours,sinks,calls,allocations};return env;
  }
  const module={exports:{}};
  const localRequire=id=>{if(id==='../helpers/game.cjs')return {loadGame:trackedLoadGame};throw Error('Unexpected import '+id);};
  vm.runInNewContext(source,{require:localRequire,module,exports:module.exports,process,console},{filename:'unchanged-normal-route.cjs'});
  const result=module.exports.run(seed,accelerate,target,{includeState:true});
  const {env,natural,aboveCapacityHours,sinks,calls,allocations}=observed,g=env.Game;
  g.save();
  const s=copy(g.state);
  const gifts=zero(),missions=zero();
  const giftData=env.evaluate('OnboardingData.gifts');
  for(const id of s.onboarding.claims)for(const [key,n] of Object.entries(giftData.find(x=>x.level===id).resources))gifts[key]+=n;
  for(const id of s.missionClaims)for(const [key,n] of Object.entries(g.missions.find(x=>x.id===id).reward))missions[key]+=n;
  const battleReceipts=s.reports.map(r=>({won:r.won,loot:r.loot,bonusLoot:r.bonusLoot,resourceReceipt:r.resourceReceipt,lost:r.lost,round:r.round,warOrder:r.warOrder}));
  const valid=g.validSave(s),constructionXp=result.queueLog.filter(q=>q.kind==='build').reduce((n,q)=>n+q.level*10,0);
  return {...result,hourly,allocatePolitics,natural,aboveCapacityHours,sinks,calls,allocations,giftsIncome:gifts,missionsIncome:missions,battleReceipts,constructionXp,governor:{id:s.governor,level:s.generalLevels[s.governor],xp:s.generalXp[s.governor],points:env.evaluate('HeroSystem.remaining(Game.state,Game.state.governor)'),stats:g.general(s.governor)},capacities:Object.fromEntries(resourceIds.map(id=>[id,g.capacity(id)])),ratesPerHour:Object.fromEntries(Object.entries(g.rates()).map(([id,n])=>[id,n*60])),validSave:valid};
}
module.exports={measure};
if(require.main===module){
 const seeds=[1,2,3,4,5,6,7,8,18,123,456,9876];
 const routes=[measure(123,false,'archer',{hourly:true}),measure(123,true,'archer',{hourly:true}),measure(456,true,'archer',{hourly:true}),measure(123,true,'first-battle',{hourly:true}),...seeds.map(seed=>measure(seed,true,'ten-gifts',{hourly:true})),measure(123,true,'ten-gifts'),measure(123,true,'ten-gifts',{hourly:true,allocatePolitics:true})];
 console.log(JSON.stringify(routes.map(r=>({seed:r.seed,target:r.target,accelerate:r.accelerate,hourly:r.hourly,allocatePolitics:r.allocatePolitics,hours:r.minutes/60,stock:r.stock,missionIncome:r.missionsIncome,giftIncome:r.giftsIncome,natural:r.natural,spent:r.sinks,governor:r.governor,validSave:r.validSave,hallWaitHours:r.queueLog.filter(q=>q.kind==='build'&&q.id==='hall').map(q=>({level:q.level,hours:q.waitSeconds/3600}))})),null,2));
}
