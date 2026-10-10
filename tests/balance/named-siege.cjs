'use strict';
// Named-general siege loop (named-garrison.js): a prepared late-game army besieges a garrisoned city,
// persuades and sows discord between assaults, and captures it once loyalty is below 30.
const {loadGame,city}=require('../helpers/game.cjs');
const total=a=>Object.values(a||{}).reduce((x,y)=>x+y,0);
function prepared(seed,army,owned=null){
  const e=loadGame(seed),g=e.Game,s=g.state;
  city(g,{hall:10,house:10,drill:10,barracks:10,academy:10,smith:10,tavern:10,inn:5,market:5});s.honors.noble=10;
  for(const id of Object.keys(s.tech))s.tech[id]=10;for(const n of [...e.Chapter.nodes,...e.Chapter.chapterThreeNodes])s.conquered[n.id]=true;s.conquered.fort=true;s.conquered.camp=true;
  Object.assign(s.army,army);if(owned)for(const id of owned){s.conquered[id]=true;s.realm.cities['city_'+id]=e.evaluate(`CitySystem.empty(Game.state,Game.getNode('${id}'),Date.now())`);}for(const id of Object.keys(g.resources))s.res[id]=5000000;s.governor=null;s.cityRoles.counsellor='su';
  e.evaluate('Math.random=()=>.5');return e;
}
function assault(e,id,army){
  const g=e.Game;for(const k of Object.keys(army))g.setTactic(k,'advance','');
  const general=e.evaluate("Game.state.generals.find(id=>!HeritageSystem.roleOf(Game.state,id)&&!Game.generalBusy(id)&&(Game.state.realm.heroLocations[id]||'capital')==='capital')");
  const sent=Object.fromEntries(Object.entries(army).map(([k,n])=>[k,Math.min(n,g.state.army[k])]));
  const err=g.dispatch(id,general,sent,'occupy',true);if(err)return {error:err};
  e.advance(Math.ceil(g.state.expedition.end-e.now())+1);g.startBattle();for(let i=0;i<40&&!g.state.battle.finished;i++)g.battleRound();
  const b=g.state.battle,r=b.result;const lost=total(r.lost||{});
  const out={won:r.won,rounds:b.round,lost,gate:b.gate?Math.round(b.gate.hp):null,claimed:r.claimed};
  const until=Math.max(g.state.expedition?.end||e.now(),g.state.cooldowns[id]||e.now());e.advance(Math.ceil(until-e.now())+1);g.dismissBattle?.();return out;
}
function run({seed=11,id='named_xiaopei',army={archer:14000,shield:6000,spear:5000,cavalry:3000,ram:30,catapult:16},maxAssaults=14,owned=null}={}){
  const e=prepared(seed,army,owned),g=e.Game,log=[];
  for(let i=0;i<maxAssaults;i++){
    g.persuadeGarrison(id);g.sowGarrison(id);
    const before=g.garrisonStatus(id);const r=assault(e,id,army);const after=g.garrisonStatus(id);
    log.push({i,loyalty:before.loyalty+'→'+after.loyalty,troops:before.troops,...r});
    if(r.error||g.state.conquered[id])break;
    // replenish permanent losses like a player training between assaults
    for(const [k,n] of Object.entries(army))g.state.army[k]=Math.max(g.state.army[k],n);
    e.advance(2*3600000);
  }
  const captured=g.garrisonStatus(id);if(captured.captive){if(g.state.generals.includes(captured.general.id))throw Error('Captured commander joined automatically');const error=g.recruitGarrisonGeneral(id);if(error)throw Error(error);}
  const st=g.garrisonStatus(id);
  return {id,captured:!!g.state.conquered[id],recruited:st.recruited,general:st.general.name,level:st.recruited?g.general(st.general.id).level:null,generalJoined:g.state.generals.includes(st.general.id),assaults:log.length,log,validSave:g.validSave(g.state),hours:(e.now()-1791194400000)/3600000};
}
if(require.main===module)process.stdout.write(JSON.stringify(run(),null,2)+'\n');
module.exports={run};
