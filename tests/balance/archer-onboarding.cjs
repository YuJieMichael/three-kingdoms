const {loadGame}=require('../helpers/game.cjs');
function run(seed=123,accelerate=true,target='archer',options={}){
 const env=loadGame(seed),{Game}=env,start=env.now(),guide=env.evaluate('GrowthGuide'),log=[],queueLog=[],used={},spent={food:0,wood:0,stone:0,iron:0,gold:0};
 function ok(error){if(error)throw Error(error);}
 function collect(){if(Game.missions.some(x=>Game.missionReady(x)))ok(Game.claimReadyMissions());}
 function use(id,key){const error=id==='population'?Game.useItem(id):Game.useSpeedup(id,key).error;ok(error);used[id]=(used[id]||0)+1;collect();}
 function finish(kind,q){
  const began=env.now(),rawSeconds=(q.end-q.start)/1000;
  if(accelerate){for(let i=0;i<80&&q.end>env.now()+1;i++){const choices=Game.manual.shop.filter(x=>x.effect==='speedup'&&x.queueKind===kind&&(Game.state.inventory[x.id]||0)>0&&(x.speedup.seconds||x.speedup.minHours)).sort((a,b)=>(a.speedup.seconds||a.speedup.minHours*3600)-(b.speedup.seconds||b.speedup.minHours*3600));if(!choices.length)break;const remaining=(q.end-Math.max(env.now(),q.start))/1000,item=choices.find(x=>(x.speedup.seconds||x.speedup.minHours*3600)>=remaining)||choices.at(-1);use(item.id,Game.speedupKey(kind,q));}}
  // Like a player, finish a build for free once 5 minutes or less are left instead of waiting.
  if(kind==='build'&&q.end>env.now()&&Game.freeFinishReady){if(q.end-env.now()>300000)env.advance(Math.ceil(q.end-env.now()-300000));if(Game.freeFinishReady(q))ok(Game.freeFinishBuild(Game.speedupKey('build',q)));}
  if(q.end>env.now())env.advance(Math.ceil(q.end-env.now())+1);else env.advance(1);collect();
  queueLog.push({kind,id:q.id,level:q.level,count:q.count,rawSeconds,waitSeconds:(env.now()-began)/1000,finishedMinutes:(env.now()-start)/60000});
 }
 for(let step=0;step<500;step++){
  collect();const m=guide.model(Game),done=target==='archer'?guide.archerComplete(Game):target==='first-battle'?Game.state.onboarding.firstBattle==='complete':Game.state.buildings.hall===10&&Game.state.onboarding.claims.length===10&&Game.state.onboarding.firstBattle==='complete';if(done||options.stopKind===m.kind&&!m.warmup)return {seed,speed:1,accelerate,target,hall:Game.state.buildings.hall,gifts:Game.state.onboarding.claims.length,minutes:(env.now()-start)/60000,archers:Game.state.army.archer,victories:Game.state.stats.victories,office:Game.state.honors.office,firstBattle:Game.state.onboarding.firstBattle,guideKind:m.kind,used,spent,log,queueLog,stock:{...Game.state.res},validSave:Game.validSave(Game.state),...(options.includeState?{state:JSON.parse(JSON.stringify(Game.state))}:{})};
  if(m.kind==='gift'){ok(Game.onboarding.claim(m.id));continue;}
  if(m.kind==='queue'){finish(m.queueKind,m.queue);continue;}
  if(m.kind==='population'){if((accelerate||m.item)&&(Game.state.inventory.population||0)>0)use('population');else env.advance(60000);continue;}
  if(m.kind==='trade'){const count=Math.min(m.amount,Game.tradeQuote(m.id,true).limit);ok(Game.trade(m.id,count,true));spent.gold+=count;log.push({target:m.title,count,minutes:(env.now()-start)/60000});continue;}
  if(m.kind==='scoutMarch'||m.kind==='battleMarch'||m.kind==='battleReturn'){env.advance(Math.max(1,Math.ceil(m.end-env.now())+1));collect();log.push({target:m.title,minutes:(env.now()-start)/60000});continue;}
  if(m.kind==='battleArrival'){ok(Game.selectExpedition(m.id));ok(Game.startBattle());log.push({target:m.title,minutes:(env.now()-start)/60000});continue;}
  if(m.kind==='battle'){if(Game.state.battle.orders.archer)ok(Game.setBattleOrder('archer',m.inRange?'hold':'advance'));Game.battleRound();collect();continue;}
  if(m.kind==='battleCooldown'){env.advance(Math.max(1,Math.ceil(m.end-env.now())+1));continue;}
  if(m.kind==='tactics'){ok(Game.setTactic('archer','advance',''));log.push({target:m.title,minutes:(env.now()-start)/60000});continue;}
  if(m.kind==='garrison'){const q=Game.state.garrisons[m.id];if(q.phase==='stationed')ok(Game.recallGarrison(m.id));else env.advance(Math.max(1,Math.ceil(q.end-env.now())+1));continue;}
  if(m.kind==='roles'){ok(env.evaluate("HeritageSystem.assign(Game.state.governor,'','')"));continue;}
  if(m.kind==='defense'){if(Game.state.cityDefense.battle.drill)ok(Game.endDefenseDrill());else Game.cityDefenseRound();continue;}
  if(m.kind==='firstBattleComplete'){const q=env.evaluate("HeritageSystem.promotionQuote(Game.state,'office')");if(Game.state.honors.office===0&&q.next&&!q.reason){ok(env.evaluate("HeritageSystem.promote('office')"));spent.gold+=q.rule.gold;}ok(Game.completeFirstBattleGuide());log.push({target:m.title,minutes:(env.now()-start)/60000});continue;}
  if(m.cost&&!Game.canPay(m.cost)){if(guide.resources(Game,m.cost).seconds===null)throw Error('Unfunded route: '+JSON.stringify({goal:m,stock:Game.state.res}));env.advance(Math.max(1000,guide.resources(Game,m.cost).seconds*1000));continue;}
  for(const [id,n]of Object.entries(m.cost||{}))spent[id]+=n;
  log.push({target:m.title,minutes:(env.now()-start)/60000});
  if(m.kind==='building'){ok(Object.hasOwn(Game.plotTypes,m.id)?Game.developPlot(m.site,m.id):Game.queueBuilding(m.site,m.id));finish('build',Game.state.buildQueue.find(q=>q.id===m.id));}
  else if(m.kind==='tech'){ok(Game.research(m.id));finish('research',Game.state.researchQueue);}
  else if(m.kind==='train'){ok(Game.train(m.id,m.count));finish('train',Game.state.trainQueue.at(-1));}
  else if(m.kind==='scout')ok(Game.scout(m.id));
  else if(m.kind==='dispatch')ok(Game.dispatch(m.id,m.general,m.army||{archer:m.count},'raid'));
  else throw Error('Unexpected guide target '+JSON.stringify(m));
 }
 throw Error('Guide did not reach archers');
}
if(require.main===module)process.stdout.write(JSON.stringify([run(123,false),run(123,true),run(456,true)],null,2)+'\n');
module.exports={run};
