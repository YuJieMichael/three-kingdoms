'use strict';
// v0.36.0 acceptance (design §9): with the same people budget, some army mix beats an all-archer army on each kind of target
// by 30% or more in losses or rounds. Chapter targets ahead of the stage are marked done; technology 6; fixed random.
const {loadGame,city}=require('../helpers/game.cjs');
const PEOPLE={spear:1,shield:1,archer:2,cavalry:3,heavy:6,catapult:8,ram:10};
const MIXES={'全弓':{archer:1},'弓+枪':{archer:.6,spear:.4},'弓+盾':{archer:.7,shield:.3},'弓+骑':{archer:.5,cavalry:.5},'弓+盾+投石':{archer:.6,shield:.2,catapult:.2}};
const TARGETS=[['north_pass','玄石关 · 盾兵多',3000],['north_granary','北原粮仓 · 弓兵多',2400],['yellow_huangsha','黄沙黄巾城 · 6 级城墙城防',6000]];
function army(budget,mix){const w=Object.values(mix).reduce((a,b)=>a+b,0);return Object.fromEntries(Object.entries(mix).map(([id,share])=>[id,Math.floor(budget*share/w/PEOPLE[id])]));}
function fight(target,troops){
  const e=loadGame(7),g=e.Game,s=g.state,C=e.Chapter;city(g,{hall:10,house:10,drill:10,barracks:10,academy:10,workshop:10});for(const id of Object.keys(s.tech))s.tech[id]=6;s.res.food=1e8;s.honors.noble=5;
  s.conquered.camp=true;for(const n of C.nodes){if(n.id===target)break;s.conquered[n.id]=true;}
  e.evaluate('Math.random=()=>.5');Object.assign(s.army,troops);for(const k of Object.keys(troops))g.setTactic(k,'advance','');
  const err=g.dispatch(target,'lin',troops,'occupy',true);if(err)throw Error(target+': '+err);e.advance(Math.ceil(s.expedition.end-e.now())+1);g.startBattle();
  const b=s.battle;for(let i=0;i<30&&!b.finished;i++)g.battleRound();
  const people=rows=>Object.entries(rows).reduce((n,[k,v])=>n+v*(PEOPLE[k]||1),0);
  return {won:b.result.won,rounds:b.round,lostPeople:people(b.result.lost)+people(b.result.wounded)};
}
function run(){return TARGETS.map(([id,label,budget])=>({id,label,budget,results:Object.fromEntries(Object.entries(MIXES).map(([name,mix])=>[name,fight(id,army(budget,mix))]))}));}
if(require.main===module)for(const t of run()){console.log(t.label);for(const [k,r] of Object.entries(t.results))console.log('  '+k,r.won?'胜':'败',r.rounds+' 回合','损失 '+r.lostPeople+' 人口');}
module.exports={run};
