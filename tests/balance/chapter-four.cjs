'use strict';
// Chapter 4 rule battles (design/quick-specs/chapter-four-2026-10-09.md): each stage fought the right way and the wrong way
// with a prepared late-game army (all technology 10). Measures win/loss, rounds and permanent losses.
const {loadGame,city}=require('../helpers/game.cjs');
const total=a=>Object.values(a||{}).reduce((x,y)=>x+y,0);
const STRONG={id:'local_7199999999999001',name:'猛将',title:'测试',type:'骑',level:30,atk:96,def:80,pol:40,wis:85,lead:300,price:0,bonus:'cavalry',desc:'模拟用'};
function prepared(seed){
  const e=loadGame(seed),g=e.Game,s=g.state;
  city(g,{hall:10,house:10,drill:10,barracks:10,academy:10,smith:10,tavern:10});s.honors.noble=10;
  for(const id of Object.keys(s.tech))s.tech[id]=10;for(const n of [...e.Chapter.nodes,...e.Chapter.chapterThreeNodes])s.conquered[n.id]=true;s.conquered.fort=true;s.conquered.camp=true;
  for(const id of Object.keys(g.resources))s.res[id]=9000000;s.governor=null;
  s.customGenerals.push(STRONG);s.generals.push(STRONG.id);s.generalLevels[STRONG.id]=30;s.generalXp[STRONG.id]=0;
  e.evaluate('Math.random=()=>.5');return e;
}
function fight(seed,node,army,generalId,orders={}){
  const e=prepared(seed),g=e.Game,s=g.state,order=e.Chapter.chapterFourNodes.map(n=>n.id);
  for(const id of order.slice(0,order.indexOf(node)))s.conquered[id]=true;
  for(const [k,n] of Object.entries(army))s.army[k]=n;
  for(const k of Object.keys(army))g.setTactic(k,orders[k]||'advance','');
  const err=g.dispatch(node,generalId,army,'occupy');if(err)return {error:err};
  e.advance(Math.ceil(s.expedition.end-e.now())+1);g.startBattle();for(let i=0;i<40&&!s.battle.finished;i++)g.battleRound();
  const b=s.battle,r=b.result;return {won:r.won,rounds:b.round,lost:total(r.lost),sent:total(army),gate:b.gate?Math.round(b.gate.hp):null,validSave:g.validSave(s)};
}
const BIG={archer:9000,shield:5500,spear:4500,cavalry:3500,ram:40,catapult:25};
const CASES=[
  ['c4_sishui','武力 96 主将',BIG,STRONG.id],['c4_sishui','武力 64 主将',BIG,'lin'],
  ['c4_hulao','6,000 精兵',{archer:2600,shield:1500,spear:1000,cavalry:850,ram:30,catapult:20},STRONG.id],['c4_hulao','超出上限',BIG,STRONG.id],
  ['c4_xingyang','大军速攻',{archer:12000,shield:6000,spear:8000,cavalry:6000},STRONG.id],['c4_xingyang','兵力不足',{archer:6000,shield:3000,spear:2500,cavalry:2000},STRONG.id],
  ['c4_meiwu','步骑趁夜',BIG,STRONG.id],['c4_meiwu','弓兵固守',BIG,STRONG.id,{archer:'hold',ram:'hold',catapult:'hold',shield:'hold',spear:'hold',cavalry:'hold'}],
  ['c4_lianying','智 85 主将',BIG,STRONG.id],['c4_lianying','智 58 主将',BIG,'lin'],
  ['c4_luoyang','器械主力',{archer:12000,shield:7000,spear:6000,cavalry:5000,ram:80,catapult:60},STRONG.id],['c4_luoyang','缺器械',{archer:12000,shield:7000,spear:6000,cavalry:5000},STRONG.id]
];
function run(seed=17){return CASES.map(([node,label,army,gen,orders])=>({node,label,...fight(seed,node,army,gen,orders)}));}
if(require.main===module)for(const r of run())console.log(JSON.stringify(r));
module.exports={run,fight,BIG,STRONG};
