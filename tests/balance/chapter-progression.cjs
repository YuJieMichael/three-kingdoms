const {loadGame,battle}=require('../helpers/game.cjs');
function run(seed=123,speed=60,reinforce=true){
 const env=loadGame(seed),{Game}=env,initial=env.now(),log=[],trades=[],spent={food:0,wood:0,stone:0,iron:0,gold:0};let preparingMarket=false;
 Game.setSpeed(speed);Game.claimStarterGift();Game.claimReadyMissions();
 const rules=env.evaluate('ReferenceRules');
 function advance(ms){env.advance(Math.max(1,Math.ceil(ms)));if(Game.onboarding.available(Game.state).length){const error=Game.onboarding.claimAvailable();if(error)throw Error(error);}Game.claimReadyMissions();}
 function wait(cost){for(let attempts=0;!Game.canPay(cost);attempts++){
  if(attempts>4000)throw Error('Resource bottleneck '+JSON.stringify({cost,stock:Game.state.res,rates:Game.rates(),army:Game.state.army,at:log.map(l=>l.stage+':'+l.won).join(' ')}));
  // A campaign may choose to spend its earned gold instead of waiting for field output.
  // This also handles a material cost above the current warehouse cap: waiting alone cannot fill it.
  const blocked=Object.entries(cost).filter(([id,n])=>id!=='gold'&&Game.state.res[id]<n);
  if(blocked.length&&!Game.state.buildings.market&&!preparingMarket){preparingMarket=true;build('market',1);preparingMarket=false;continue;}
  let bought=false;
  if(Game.state.buildings.market)for(const [id,n]of blocked){const reserve=cost.gold||0,count=Math.min(Math.ceil(n-Game.state.res[id]),Game.tradeQuote(id,true).limit,Math.max(0,Math.floor(Game.state.res.gold-reserve)));if(count>0){const error=Game.trade(id,count,true);if(error)throw Error(error);spent.gold+=count;trades.push({resource:id,count,hours:(env.now()-initial)/3600000});bought=true;}}
  if(!bought)advance(3600000);
 }}
 function payTrack(cost){for(const [id,n]of Object.entries(cost))spent[id]+=n;}
 function prereqs(list){for(const r of list||[]){if(r.kind==='building')build(r.id,r.level);else if(r.kind==='tech')research(r.id,r.level);else throw Error('Item prerequisite '+r.id);}}
 function build(id,level){
  if(['farm','lumber','quarry','mine'].includes(id)){let index=Game.state.plots.findIndex(p=>p.type===id);if(index<0)index=Game.state.plots.findIndex(p=>!p.type);while(Game.state.plots[index].level<level){prereqs(rules.buildingConditions[id]?.[Game.state.plots[index].level+1]);const cost=Game.plotCost(index,id);wait(cost);const err=Game.developPlot(index,id);if(err)throw Error(id+': '+err);payTrack(cost);advance(Game.state.buildQueue[0].end-env.now()+1);}return;}
  while(Game.state.buildings[id]<level){prereqs(rules.buildingConditions[id]?.[Game.state.buildings[id]+1]);const cost=Game.buildRecord(id,Game.state.buildings[id]+1).cost;wait(cost);let site=Game.primarySite(id);if(site<0)site=Game.state.cityLayout.indexOf(null);const err=Game.queueBuilding(site,id);if(err)throw Error(id+': '+err);payTrack(cost);advance(Game.state.buildQueue[0].end-env.now()+1);}
 }
 function research(id,level){while(Game.state.tech[id]<level){build('academy',1);prereqs(rules.researchConditions[id]?.[Game.state.tech[id]+1]);const cost=Game.researchCost(id);wait(cost);const err=Game.research(id);if(err)throw Error(id+': '+err);payTrack(cost);advance(Game.state.researchQueue.end-env.now()+1);}}
 function train(id,count){if(count>100){for(let left=count;left>0;left-=100)train(id,Math.min(100,left));return;}prereqs(Object.entries(Game.units[id].requires.buildings).map(([id,level])=>({kind:'building',id,level})));prereqs(Object.entries(Game.units[id].requires.tech).map(([id,level])=>({kind:'tech',id,level})));const cost=Game.trainCost(id,count);wait(cost);for(let attempts=0;Game.freePopulation()<count*(Game.units[id].people||1);attempts++){if(attempts>100)throw Error('Population blocked '+id);advance(3600000);}const err=Game.train(id,count);if(err)throw Error(id+': '+err);payTrack(cost);advance(Game.state.trainQueue[0].end-env.now()+1);}
 build('house',5);for(let h=0;h<5;h++){const site=Game.state.cityLayout.indexOf(null);for(let lv=1;lv<=5;lv++){prereqs(rules.buildingConditions.house?.[lv]);const cost=Game.buildRecord('house',lv).cost;wait(cost);const err=Game.queueBuilding(site,'house');if(err)throw Error(err);payTrack(cost);advance(Game.state.buildQueue[0].end-env.now()+1);}}build('hall',4);build('drill',3);build('warehouse',4);for(const type of ['farm','lumber','quarry','mine'])build(type,type==='farm'?8:6); // v0.35.3: task armies (40% spears, a cavalry wing, rams) eat more food
 // Isolate the requested chapter-two progression: 黄巾营寨 and the 公士 rank it earns are the explicit checkpoint
 // (v0.35.1: chapter two opens after chapter one, and 北原城 needs a second city slot);
 // resources, buildings, technology and all ordinary troops still come through normal APIs from a fresh economy.
 Game.state.conquered.camp=true;Game.state.honors.noble=1;
 const target={shield:325,spear:455,archer:910,cavalry:130};
 for(const [id,count]of Object.entries(target))train(id,count);
 log.push({stage:'normal preparation',hours:(env.now()-initial)/3600000,army:{...Game.state.army},spent:{...spent},stock:{...Game.state.res}});
 // v0.35.3: every stage has its own task (chapter-tasks.js); the campaign does what the stage asks, through public APIs.
 const T=env.evaluate('ChapterTasks'),hours=()=>(env.now()-initial)/3600000;
 function stageArmy(d){
  const army={...Game.state.army};delete army.scout;delete army.worker;
  if(!d.engines&&d.kind!=='siege'){army.ram=0;army.catapult=0;}
  for(const [group,share] of Object.entries(d.share||{})){const have=T.groupCount(army,group),others=T.soldiers(army)-have,allowed=Math.floor(have*(1-share)/share);if(others>allowed){const factor=allowed/others;for(const id of Object.keys(army))if(!['archer','spear','cavalry','heavy'].filter(x=>(group==='cavalry'?['cavalry','heavy']:[group]).includes(x)).includes(id)&&!['ram','catapult','wagon'].includes(id))army[id]=Math.floor(army[id]*factor);}}
  return army;
 }
 // Station troops on a nearby wild tile, gather, collect, and bring them home again.
 function gatherFor(id,need){
  for(let round=0;(Game.state.stageTasks[id]?.gathered||0)<need;round++){
   if(round>6)throw Error('gathering stalled at '+id);
   const home=Game.home,targets=[];for(let y=home.y-6;y<=home.y+6;y++)for(let x=home.x-6;x<=home.x+6;x++){const w=Game.getNode('wild_'+x+'_'+y);if(w?.wild&&!Game.state.conquered[w.id]&&w.level>=3&&w.level<=4&&['forest','lake'].includes(w.type))targets.push(w);}
   targets.sort((a,b)=>Math.abs(a.x-home.x)+Math.abs(a.y-home.y)-Math.abs(b.x-home.x)-Math.abs(b.y-home.y));const w=targets[0];if(!w)throw Error('no wild tile to gather');
   const army={archer:Math.min(Game.state.army.archer,900),shield:Math.min(Game.state.army.shield,300)};
   wait({food:Math.ceil(Game.totalArmy(army)*1.2+60)});const r=battle(env,w.id,'occupy',army,false);if(!r.won)throw Error('lost the gathering tile '+w.id);advance(90001);Game.dismissBattle();
   const start=env.evaluate(`HeritageSystem.startGather('${w.id}')`);if(start)throw Error(start);
   for(let h=0;h<24;h++){advance(3600000);const q=env.evaluate(`HeritageSystem.gatherQuote(Game.state,'${w.id}')`);if(q.ready&&(q.received>=need-(Game.state.stageTasks[id]?.gathered||0)||q.received>=q.carry))break;}
   const collect=env.evaluate(`HeritageSystem.collectGather('${w.id}')`);if(collect)throw Error(collect);
   const recall=Game.recallGarrison(w.id);if(recall)throw Error(recall);for(let i=0;i<48&&Game.state.garrisons[w.id];i++)advance(1800000);
   const abandon=Game.abandonWild(w.id);if(abandon)throw Error(abandon);
   log.push({stage:id+':gather',hours:hours(),gathered:Game.state.stageTasks[id]?.gathered||0});
  }
 }
 for(const n of env.evaluate('ChapterData.allNodes()').filter(n=>n.chapter<=3)){
  if(n.chapter===3&&reinforce){Object.assign(target,{shield:525,spear:750,archer:1650,cavalry:225});for(const [id,count]of Object.entries(target)){if(Game.state.army[id]<count)train(id,count-Game.state.army[id]);}}
  const d=T.def(n.id);
  if(d.building)build(d.building,d.level);
  if(d.guideArmy||d.engines)for(const [id,count]of Object.entries({...(d.guideArmy||{}),...(d.engines?{ram:d.engines}:{})}))if(['ram','catapult','cavalry','spear'].includes(id)&&Game.state.army[id]<count)train(id,count-Game.state.army[id]);
  if(d.kind==='deliver'){wait(d.cost);const err=Game.deliverChapterTask(n.id);if(err)throw Error(n.id+': '+err);payTrack(d.cost);log.push({stage:n.id+':deliver',hours:hours(),cost:d.cost});}
  if(d.kind==='gather')gatherFor(n.id,d.need);
  // An ordinary city (北原城) changes hands only once its morale drops below zero, one occupation win at a time.
  let result;for(let attempt=0;attempt<6&&!Game.state.conquered[n.id];attempt++){
  if(attempt){advance(Math.max(0,(Game.state.cooldowns[n.id]||0)-env.now())+1);if(reinforce)for(const [id,count]of Object.entries(target)){if(Game.state.army[id]<count)train(id,count-Game.state.army[id]);}}
  wait({food:Math.ceil(Game.totalArmy(Game.state.army)*1.2+n.time*2)});
  const army=stageArmy(d),before={...Game.state.res};result=battle(env,n.id,'occupy',army,true);log.push({stage:n.id,won:result.won,rounds:Game.state.battle.round,hours:(env.now()-initial)/3600000,army,loss:result.lost,wounded:result.wounded,foodSupply:Math.ceil(Game.totalArmy(army)*1.2+n.time*2),resourcesBefore:before});
  if(!result.won&&!reinforce)break;if(!Game.state.conquered[n.id]){advance(90001);Game.dismissBattle();}}
  if(!Game.state.conquered[n.id])break;
  const err=Game.claimMission('chapter'+n.chapter+'_'+n.id);if(err)throw Error(err);advance(90001);Game.dismissBattle();
 }
 return {seed,clockSpeed:speed,chapterOneCheckpoint:'黄巾营寨 and 公士 only',spent,trades,log,totalHours:(env.now()-initial)/3600000,validSave:Game.validSave(Game.state)};
}
if(require.main===module)process.stdout.write(JSON.stringify(run(),null,2)+'\n');module.exports={run};
