const {loadGame,battle}=require('../helpers/game.cjs');
function run(seed=123,speed=60,reinforce=true){
 const env=loadGame(seed),{Game}=env,initial=env.now(),log=[],trades=[],spent={food:0,wood:0,stone:0,iron:0,gold:0};let preparingMarket=false;
 Game.setSpeed(speed);Game.claimStarterGift();Game.claimReadyMissions();
 const rules=env.evaluate('ReferenceRules');
 function advance(ms){env.advance(Math.max(1,ms));if(Game.onboarding.available(Game.state).length){const error=Game.onboarding.claimAvailable();if(error)throw Error(error);}Game.claimReadyMissions();}
 function wait(cost){for(let attempts=0;!Game.canPay(cost);attempts++){
  if(attempts>4000)throw Error('Resource bottleneck '+JSON.stringify({cost,stock:Game.state.res,rates:Game.rates()}));
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
 build('house',5);for(let h=0;h<5;h++){const site=Game.state.cityLayout.indexOf(null);for(let lv=1;lv<=5;lv++){prereqs(rules.buildingConditions.house?.[lv]);const cost=Game.buildRecord('house',lv).cost;wait(cost);const err=Game.queueBuilding(site,'house');if(err)throw Error(err);payTrack(cost);advance(Game.state.buildQueue[0].end-env.now()+1);}}build('hall',4);build('drill',3);build('warehouse',4);for(const type of ['farm','lumber','quarry','mine'])build(type,6);
 // Isolate the requested chapter-two progression: chapter-one county ownership is the explicit checkpoint;
 // resources, buildings, technology and all ordinary troops still come through normal APIs from a fresh economy.
 Game.state.conquered.fort=true;
 const target={shield:250,spear:350,archer:700,cavalry:100};
 for(const [id,count]of Object.entries(target))train(id,count);
 log.push({stage:'normal preparation',hours:(env.now()-initial)/3600000,army:{...Game.state.army},spent:{...spent},stock:{...Game.state.res}});
 for(const n of env.evaluate('ChapterData.allNodes()')){
  if(n.chapter===3&&reinforce){Object.assign(target,{shield:350,spear:500,archer:1100,cavalry:150});for(const [id,count]of Object.entries(target)){if(Game.state.army[id]<count)train(id,count-Game.state.army[id]);}}
  wait({food:Math.ceil(Game.totalArmy(Game.state.army)*1.2+n.time*2)});
  const army={...Game.state.army},before={...Game.state.res};const result=battle(env,n.id,'occupy',army);log.push({stage:n.id,won:result.won,rounds:Game.state.battle.round,hours:(env.now()-initial)/3600000,army,loss:result.lost,wounded:result.wounded,foodSupply:Math.ceil(Game.totalArmy(army)*1.2+n.time*2),resourcesBefore:before});
  if(!result.won)break;
  const err=Game.claimMission('chapter'+n.chapter+'_'+n.id);if(err)throw Error(err);advance(90001);Game.dismissBattle();
 }
 return {seed,clockSpeed:speed,chapterOneCheckpoint:'fort ownership only',spent,trades,log,totalHours:(env.now()-initial)/3600000,validSave:Game.validSave(Game.state)};
}
if(require.main===module)process.stdout.write(JSON.stringify(run(),null,2)+'\n');module.exports={run};
