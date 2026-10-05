const {loadGame}=require('../helpers/game.cjs');
function run(seed=123,accelerate=true,target='archer'){
 const env=loadGame(seed),{Game}=env,start=env.now(),guide=env.evaluate('GrowthGuide'),log=[],used={},spent={food:0,wood:0,stone:0,iron:0,gold:0};
 function ok(error){if(error)throw Error(error);}
 function collect(){if(Game.missions.some(x=>Game.missionReady(x)))ok(Game.claimReadyMissions());}
 function use(id,key){const error=id==='population'?Game.useItem(id):Game.useSpeedup(id,key).error;ok(error);used[id]=(used[id]||0)+1;collect();}
 function finish(kind,q){
  if(accelerate){for(let i=0;i<80&&q.end>env.now()+1;i++){const choices=Game.manual.shop.filter(x=>x.effect==='speedup'&&x.queueKind===kind&&(Game.state.inventory[x.id]||0)>0&&(x.speedup.seconds||x.speedup.minHours)).sort((a,b)=>(a.speedup.seconds||a.speedup.minHours*3600)-(b.speedup.seconds||b.speedup.minHours*3600));if(!choices.length)break;const remaining=(q.end-Math.max(env.now(),q.start))/1000,item=choices.find(x=>(x.speedup.seconds||x.speedup.minHours*3600)>=remaining)||choices.at(-1);use(item.id,Game.speedupKey(kind,q));}}
  if(q.end>env.now())env.advance(Math.ceil(q.end-env.now())+1);else env.advance(1);collect();
 }
 for(let step=0;step<500;step++){
  collect();const m=guide.model(Game);if(target==='archer'?guide.archerComplete(Game):m.kind==='complete')return {seed,speed:1,accelerate,target,hall:Game.state.buildings.hall,gifts:Game.state.onboarding.claims.length,minutes:(env.now()-start)/60000,archers:Game.state.army.archer,used,spent,log,stock:{...Game.state.res},validSave:Game.validSave(Game.state)};
  if(m.kind==='gift'){ok(Game.onboarding.claim(m.id));continue;}
  if(m.kind==='queue'){finish(m.queueKind,m.queue);continue;}
  if(m.kind==='population'){if(accelerate&&(Game.state.inventory.population||0)>0)use('population');else env.advance(60000);continue;}
  if(m.kind==='trade'){const count=Math.min(m.amount,Game.tradeQuote(m.id,true).limit);ok(Game.trade(m.id,count,true));spent.gold+=count;log.push({target:m.title,count,minutes:(env.now()-start)/60000});continue;}
  if(m.cost&&!Game.canPay(m.cost)){if(guide.resources(Game,m.cost).seconds===null)throw Error('Unfunded route: '+JSON.stringify({goal:m,stock:Game.state.res}));env.advance(Math.max(1000,guide.resources(Game,m.cost).seconds*1000));continue;}
  for(const [id,n]of Object.entries(m.cost||{}))spent[id]+=n;
  log.push({target:m.title,minutes:(env.now()-start)/60000});
  if(m.kind==='building'){ok(Object.hasOwn(Game.plotTypes,m.id)?Game.developPlot(m.site,m.id):Game.queueBuilding(m.site,m.id));finish('build',Game.state.buildQueue.find(q=>q.id===m.id));}
  else if(m.kind==='tech'){ok(Game.research(m.id));finish('research',Game.state.researchQueue);}
  else if(m.kind==='train'){ok(Game.train(m.id,m.count));finish('train',Game.state.trainQueue.at(-1));}
  else throw Error('Unexpected guide target '+JSON.stringify(m));
 }
 throw Error('Guide did not reach archers');
}
if(require.main===module)process.stdout.write(JSON.stringify([run(123,false),run(123,true),run(456,true)],null,2)+'\n');
module.exports={run};
