const assert=require('node:assert/strict');
const helpers=require('../helpers/game.cjs');
const {run:onboarding}=require('./archer-onboarding.cjs');
function run(seed=123,speed=1){
  function chapterBranch(routeId){
    const ordinaryLoader=helpers.loadGame,log=[];let environment=null;const queueWindows=[];
    // Observe the existing normal-economy bot without replacing its building, troop, resource or combat rules.
    helpers.loadGame=(...args)=>{
      const e=ordinaryLoader(...args),g=e.Game;environment=e;
      function errands(){
        for(const taskId of ['supply','bandits']){
          const t=g.sandboxTasks().find(t=>t.id===taskId);assert.ok(t&&t.status==='available','a daily objective must be genuinely unlocked');
          const cooldown=Math.max(0,(g.state.cooldowns[t.node]||0)-e.now());if(cooldown)e.advance(cooldown+1);
          if(g.state.expedition?.phase==='return')e.advance(g.state.expedition.end-e.now()+1);g.dismissBattle();
          const army={archer:Math.min(100,g.state.army.archer)};assert.ok(army.archer>=30,'earned archers required');g.setTactic('archer','advance','');
          const q=g.sandboxRouteQuote(t.node,army,'lin',routeId),before=g.state.res.food,started=e.now();
          assert.equal(g.dispatch(t.node,'lin',army,t.mode,false,null,{routeId,taskId}),null);assert.equal(before-g.state.res.food,q.foodCost);
          const queuedAtDispatch=g.state.buildQueue.length>0;e.advance(g.state.expedition.end-e.now()+1);assert.equal(g.startBattle(),null);
          for(let n=0;n<30&&!g.state.battle.finished;n++)g.battleRound();assert.equal(g.state.battle.result.won,true);
          const result=g.state.battle.result,rewardBefore={...g.state.res};assert.equal(g.claimSandboxTask(taskId),null);
          const received=Object.fromEntries(Object.entries(t.reward).map(([id])=>[id,g.state.res[id]-rewardBefore[id]])),replacementCost=g.trainCost('archer',result.lost.archer);
          log.push({taskId,routeId,firstReward:t.firstReward,army:army.archer,seconds:q.seconds,foodCost:q.foodCost,queuedAtDispatch,won:result.won,lost:result.lost.archer,replacementCost,reward:received,ordinaryRaidLoot:result.loot,startedAt:started});
          if(g.state.expedition)e.advance(g.state.expedition.end-e.now()+1);g.dismissBattle();
        }
      }
      e.sandboxErrands=errands;
      return e;
    };
    let report;
    try{delete require.cache[require.resolve('./chapter-progression.cjs')];report=require('./chapter-progression.cjs').run(seed,speed,true);}
    finally{helpers.loadGame=ordinaryLoader;delete require.cache[require.resolve('./chapter-progression.cjs')];}
    assert.ok(report.validSave);assert.equal(report.log.at(-1)?.stage,'luo_citadel','existing campaign must actually finish chapter three');
    const e=environment,g=e.Game;
    for(let day=0;day<2;day++){
      if(day){const next=g.sandboxTasks().find(t=>t.id==='supply').nextAt;e.advance(next-e.now()+1);}
      // All costs use the campaign's earned treasury. The bot's ordinary hall level is not overwritten.
      const site=g.state.cityLayout.indexOf(null);assert.equal(g.queueBuilding(site,'house'),null);const q=g.state.buildQueue.at(-1);queueWindows.push({id:q.id,level:q.level,start:q.start,end:q.end,hours:(q.end-q.start)/3600000});e.sandboxErrands();
      if(q.end>e.now())e.advance(q.end-e.now()+1);
    }
    return {routeId,queueWindows,log,totalHours:report.totalHours,actualHall:g.state.buildings.hall,chapterOneCheckpoint:report.chapterOneCheckpoint,lastStage:report.log.at(-1)?.stage,validSave:g.validSave(g.state)};
  }
  const withoutSpeedups=onboarding(seed,false,'first-battle'),withEarnedSpeedups=onboarding(seed,true,'first-battle');
  return {seed,speed,normalEconomy:true,onboarding:{withoutSpeedupsMinutes:withoutSpeedups.minutes,withEarnedSpeedupsMinutes:withEarnedSpeedups.minutes,earnedSpeedupsUsed:withEarnedSpeedups.used},dailyBudget:{first:{food:1200,iron:400,gold:800},subsequent:{food:600,iron:200,gold:400},crossingOnce:{food:1500}},scope:'Existing chapter-progression normal economy, including its explicit first-chapter/civic-rank checkpoint, followed by two real construction queues on successive server days. This bot does not follow suggested hall levels and does not measure the existing hall 7→8 gap; no construction duration changes.',direct:chapterBranch('direct'),detour:chapterBranch('detour')};
}
if(require.main===module)process.stdout.write(JSON.stringify(run(Number(process.argv[2])||123,Number(process.argv[3])||1),null,2)+'\n');
module.exports={run};
