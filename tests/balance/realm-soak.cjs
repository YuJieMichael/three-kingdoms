'use strict';
// Realm soak (Sprint 4, story 5-6): 1× clock, no test supplies during the run, five captured cities fed by
// supply lines, a capital that keeps raiding wild tiles and defending its wall. Reports per-city food,
// desertion and blueprint income per day. The capital and its army are a prepared mid-game fixture.
const {loadGame,city}=require('../helpers/game.cjs');
const total=army=>Object.values(army).reduce((a,b)=>a+b,0);
const TARGETS=['yellow_qingshi','yellow_liulin','yellow_baisha','yellow_heishan','yellow_chigang'];
function prepared(seed){
  const e=loadGame(seed),g=e.Game,s=g.state;
  city(g,{hall:10,house:10,drill:5,barracks:6,market:1,inn:10,tavern:10,warehouse:5});s.honors.noble=8;s.tech[g.plotTypes.farm.tech]=10;
  for(let i=0;i<10;i++)s.plots[i]={type:'farm',level:10};for(let i=10;i<16;i++)s.plots[i]={type:'lumber',level:8};for(let i=16;i<22;i++)s.plots[i]={type:'quarry',level:8};for(let i=22;i<28;i++)s.plots[i]={type:'mine',level:8};
  s.population=g.maxPop();s.army.archer=14000;s.army.shield=3000;s.army.wagon=60;for(const id of Object.keys(g.resources))s.res[id]=300000;s.res.gold=200000;s.governor=null;
  if(g.refreshInn()===null)for(const c of [...s.innCandidates])if(s.generals.length<7)g.recruit(c.id);
  return e;
}
function freeGeneral(e){return e.evaluate("Game.state.generals.find(id=>!HeritageSystem.roleOf(Game.state,id)&&!Game.generalBusy(id)&&(Game.state.realm.heroLocations[id]||'capital')==='capital')");}
function fight(e,id,army,mode,returnAfter){
  const g=e.Game;for(const k of Object.keys(army))g.setTactic(k,'advance','');const general=freeGeneral(e);if(!general)return 'no general';
  const err=g.dispatch(id,general,army,mode,returnAfter);if(err)return err;
  e.advance(Math.ceil(g.state.expedition.end-e.now())+1);g.startBattle();for(let n=0;n<40&&!g.state.battle.finished;n++)g.battleRound();
  const r=g.state.battle.result;const until=Math.max(g.state.expedition?.end||e.now(),g.state.cooldowns[id]||e.now());e.advance(Math.ceil(until-e.now())+1);g.dismissBattle?.();return r;
}
function capture(e,id){for(let i=0;i<3;i++){const r=fight(e,id,{archer:1500,shield:200},'occupy',i<2);if(typeof r==='string'||!r.won)throw Error(id+': '+(r.won===false?'lost':r));}return 'city_'+id;}
function raidTarget(g){
  const h=g.home;let best=null;
  for(let r=1;r<=6;r++)for(let dx=-r;dx<=r;dx++)for(let dy=-r;dy<=r;dy++){if(Math.max(Math.abs(dx),Math.abs(dy))!==r)continue;const t=g.getNode('wild_'+(h.x+dx)+'_'+(h.y+dy));if(t?.wild&&t.level>=3&&t.level<=5&&!g.attackBlocked(t.id,'raid')&&!(g.state.cooldowns[t.id]>Date.now())&&(!best||t.time<best.time))best=t;}
  return best;
}
function run({seed=723,hours=72,raidEveryHours=1.5}={}){
  const started=Date.now(),e=prepared(seed),g=e.Game;g.switchCity?.('capital');
  const cities=TARGETS.map(id=>capture(e,id));
  for(const id of cities){const draft={sourceCity:'capital',destinationCity:id,resource:'food',targetStock:60000,sourceReserve:10000,army:{wagon:10},enabled:true};const err=g.saveSupplyLine(draft,g.supplyLineQuote(draft).key);if(err)throw Error('supply '+id+': '+err);}
  g.setAutoCityDefense(true);
  const startArmy=Object.fromEntries(cities.map(id=>[id,total(g.getCityState(id).army)])),minFood=Object.fromEntries(['capital',...cities].map(id=>[id,Infinity])),starving=Object.fromEntries(cities.map(id=>[id,{hours:0,lastHour:null}]));
  const blueprints={wild:0,defense:0},raids={done:0,won:0};let nextRaid=e.now(),defenseSeen=new Set(g.state.cityDefense.reports.map(r=>r.id));
  const startBlueprints=g.state.inventory.blueprint||0,startedAt=e.now();
  while(e.now()-startedAt<hours*3600000){
    const incoming=g.state.cityDefense.incoming;if(incoming&&!g.state.cityDefense.battle&&incoming.arriveAt<=e.now()){const general=freeGeneral(e);if(general)g.startCityDefense(false,general,{archer:1500,shield:500});}
    if(g.state.cityDefense.battle)g.resolveCityDefense();
    for(const r of g.state.cityDefense.reports)if(!defenseSeen.has(r.id)){defenseSeen.add(r.id);blueprints.defense+=r.blueprints||0;}
    if(e.now()>=nextRaid&&!g.allExpeditions().length&&!(g.state.battle&&!g.state.battle.finished)){
      const t=raidTarget(g);if(t){const r=fight(e,t.id,{archer:600},'raid',false);if(typeof r!=='string'){raids.done++;if(r.won){raids.won++;blueprints.wild+=r.itemDrops?.blueprint||0;}}}
      nextRaid=e.now()+raidEveryHours*3600000;
    }
    e.advance(15*60000,true);
    for(const id of Object.keys(minFood))minFood[id]=Math.min(minFood[id],Math.round(g.getCityState(id).res.food));
    for(const id of cities)if(g.getCityState(id).res.food<=0){starving[id].hours+=.25;starving[id].lastHour=+((e.now()-startedAt)/3600000).toFixed(2);}
  }
  const days=hours/24,end=Object.fromEntries(['capital',...cities].map(id=>[id,{food:Math.round(g.getCityState(id).res.food),rate:Math.round(g.citySummary(id).rates.food*60),army:total(g.getCityState(id).army)}]));
  return {seed,hours,generals:g.state.generals.length,cities,raids,blueprints,blueprintsPerDay:+((blueprints.wild+blueprints.defense)/days).toFixed(2),inventoryGain:(g.state.inventory.blueprint||0)-startBlueprints,
    deserted:Object.fromEntries(cities.map(id=>[id,startArmy[id]-end[id].army])),starving,minFood,end,validSave:g.validSave(g.state),wallSeconds:(Date.now()-started)/1000};
}
if(require.main===module)process.stdout.write(JSON.stringify([723,1,2,3,4].map(seed=>run({seed})),null,2)+'\n');
module.exports={run};
