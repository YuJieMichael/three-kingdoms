'use strict';
// Long-run soak: a developed capital captures yellow-turban cities and leaves the armies stationed there,
// then the realm runs for several days. Records per-city food, desertion and save validity.
// Armies and capital development are prepared (like the capture smoke tests); this measures upkeep, not pacing.
const {loadGame,city}=require('../helpers/game.cjs');
const total=army=>Object.values(army).reduce((a,b)=>a+b,0);
function prepared(seed){
  const e=loadGame(seed),g=e.Game,s=g.state;
  city(g,{hall:10,house:10,drill:3,barracks:6,market:1});s.honors.noble=4;s.tech[g.plotTypes.farm.tech]=10;
  for(let i=0;i<10;i++)s.plots[i]={type:'farm',level:10};
  s.population=g.maxPop();s.army.archer=8000;s.army.wagon=40;for(const id of Object.keys(g.resources))s.res[id]=500000;
  s.governor=null;e.evaluate('Math.random=()=>.999999');return e;
}
function capture(e,id,count){
  const g=e.Game;
  for(let i=0;i<3;i++){
    g.setTactic('archer','advance','');const general=e.evaluate("Game.state.generals.find(id=>!HeritageSystem.roleOf(Game.state,id)&&!Game.generalBusy(id)&&(Game.state.realm.heroLocations[id]||'capital')==='capital')");if(!general)throw Error(id+': no free general');const err=g.dispatch(id,general,{archer:count},'occupy',i<2);if(err)throw Error(id+': '+err);
    e.advance(Math.ceil(g.state.expedition.end-e.now())+1);g.startBattle();for(let n=0;n<40&&!g.state.battle.finished;n++)g.battleRound();
    if(!g.state.battle.result.won)throw Error(id+' lost');const until=Math.max(g.state.expedition?.end||e.now(),g.state.cooldowns[id]||e.now());e.advance(Math.ceil(until-e.now())+1);g.dismissBattle?.();
  }
  return 'city_'+id;
}
function snapshot(g){
  return Object.fromEntries(g.cityList().map(c=>{const s=g.getCityState(c.id);return [c.id,{food:Math.round(s.res.food),army:total(s.army),rate:Math.round(g.citySummary(c.id).rates.food*60)}];}));
}
function prepareRealm({seed=723,targets=['yellow_qingshi','yellow_baisha'],count=1200}){const e=prepared(seed);return {e,cities:targets.map(id=>capture(e,id,count))};}
function run({seed=723,hours=96,targets=['yellow_qingshi','yellow_baisha'],count=1200,supply=false}={}){
  const started=Date.now(),{e,cities}=prepareRealm({seed,targets,count}),g=e.Game;
  if(supply)for(const id of cities){
    const draft={sourceCity:'capital',destinationCity:id,resource:'food',targetStock:60000,sourceReserve:100000,army:{wagon:10},enabled:true};
    const q=g.supplyLineQuote(draft);const err=g.saveSupplyLine(draft,q.key);if(err)throw Error('supply '+id+': '+err);
  }
  const startArmy=Object.fromEntries(cities.map(id=>[id,total(g.getCityState(id).army)]));
  const days=[{hour:0,...snapshot(g)}];
  for(let h=1;h<=hours;h++){e.advance(3600000,true);if(h%24===0)days.push({hour:h,...snapshot(g)});}
  const deserted=Object.fromEntries(cities.map(id=>[id,startArmy[id]-total(g.getCityState(id).army)]));
  return {seed,hours,supply,cities,startArmy,deserted,days,validSave:g.validSave(g.state),wallSeconds:(Date.now()-started)/1000};
}
if(require.main===module){const out=[run(),run({supply:true})];process.stdout.write(JSON.stringify(out,null,2)+'\n');}
module.exports={run,prepareRealm};
