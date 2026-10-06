'use strict';
// Fixed practice armies use the same unit tables and round resolver as PvE.
// Nothing in this module grants heroes, items, rewards or permanent progress.
const TacticalLessons=(()=>{
  const definitions=[
    {id:'ready_shot',title:'一 · 蓄弦与探阵',generalName:'黄忠',wildLine:'huangzhong',description:'黄忠的弓队先准备一轮。第二轮，盾兵从射程外进入时先射；盾兵仍抵御箭矢。比较准备射击与普通连续射击的代价。',objective:'用弓箭兵提交蓄弦先射，再推进两轮，观察盾兵进入射程时的先手与克制。',length:2600,player:[['archer',50,1000,'hold'],['shield',15,900,'hold']],enemy:[['shield',35,2600,'advance'],['archer',10,2600,'hold']]},
    {id:'bait_chase',title:'二 · 诱追与守势',generalName:'魏延',wildLine:'warrior',description:'长枪阵先退到弓队后方。仍前进的轻骑被诱去追枪阵；不追的盾阵保留原令。诱追只改变目标，不加移动、不送第二次攻击。',objective:'以长枪兵诱退敌方轻骑，再推进两轮；比较轻骑追枪与弓队遭骑兵克制的区别。',length:3000,player:[['spear',30,1200,'hold'],['archer',35,1100,'hold']],enemy:[['cavalry',20,2600,'advance'],['shield',25,3000,'hold']]},
    {id:'fire_reveal',title:'三 · 料敌与封路',generalName:'徐庶',wildLine:'strategist',description:'开局时敌弓队已准备火攻，具体区间尚未公开。徐庶能提前揭露，让你调整本轮位置；火区下一轮才截停双方，且不额外扣血。',objective:'揭露敌方火攻，再调整前进或坚守，推进两轮观察火区。',length:3000,player:[['spear',25,900,'hold'],['archer',40,600,'hold']],enemy:[['cavalry',15,2600,'advance'],['archer',20,2800,'hold']],enemyPlan:{type:'fire',unit:'archer',left:1400}},
    {id:'rescue_retreat',title:'四 · 接应与撤军',generalName:'赵云',wildLine:'zhaoyun',description:'轻骑坚守准备接应弓队。下一轮保持轻骑坚守，让附近弓队后退：后退速度最多1.5倍，被保护队放弃本轮主攻击。离开300范围或先击溃接应骑兵会使接应失效。',objective:'以轻骑接应弓队，准备一轮后将弓队改为后退，观察真实移动与主攻击代价。',length:4000,player:[['cavalry',25,1500,'hold'],['archer',35,1400,'hold']],enemy:[['spear',20,3600,'hold'],['archer',10,3800,'hold']]},
    {id:'charge_hold',title:'五 · 冲阵与固守',generalName:'马超',wildLine:'machao',description:'轻骑先实际前进准备冲阵。下一轮继续推进到敌长枪阵，若它没有固守，骑兵牺牲本轮主攻击推退敌阵；距离不足、没有真实推进或目标固守都会阻止冲阵。',objective:'以轻骑向敌长枪阵准备冲阵，推进两轮，观察有限推退与两轮主攻击代价。',length:3500,player:[['cavalry',45,200,'advance'],['archer',25,0,'hold']],enemy:[['spear',30,2400,'advance'],['archer',10,3500,'hold']]}
  ];
  function create(id,units){
    const d=definitions.find(x=>x.id===id);if(!d)return null;
    const rows=entries=>entries.map(([unit,count,pos])=>{const u=units[unit],stats=Object.fromEntries(['hp','atk','def','range','speed'].map(k=>[k,u[k]]));return {id:unit,initial:count,stats,hp:count*stats.hp,maxHp:count*stats.hp,pos,defending:false};});
    const generalSnapshot={id:'practice_'+id,name:d.generalName,wildLine:d.wildLine,atk:80,def:70,wis:85,pol:60,lead:50,bonus:d.wildLine==='huangzhong'?'archer':d.wildLine==='warrior'?'spear':['zhaoyun','machao'].includes(d.wildLine)?'cavalry':'shield'};
    const node={id:'practice_'+id,name:d.title,level:1,terrain:'plain',army:{},loot:{},time:0};
    const battle={rules:3,lesson:id,node:node.id,general:generalSnapshot.id,generalSnapshot,enemyGeneralSnapshot:{id:'practice_enemy_'+id,name:'演练守军',wildLine:''},mode:'raid',length:d.length,siege:false,gate:null,militia:0,round:0,machineGateAttacks:0,currentRoundSummary:{round:0,events:[]},player:rows(d.player),enemy:rows(d.enemy),orders:Object.fromEntries(d.player.map(([unit,,,_order])=>[unit,{command:_order,target:''}])),enemyOrders:Object.fromEntries(d.enemy.map(([unit,,,_order])=>[unit,{command:_order,target:''}])),log:['独立演练：使用固定阵容，不消耗正式资源、军队或奖励。'],auto:false,finished:false,result:null};
    return {id,title:d.title,generalName:d.generalName,description:d.description,objective:d.objective,node,battle,enemyPlan:d.enemyPlan?{...d.enemyPlan}:null,result:null};
  }
  function objectiveMet(session){
    const b=session.battle,types={ready_shot:'huangzhong',bait_chase:'weiyan',fire_reveal:'xushu',rescue_retreat:'zhaoyun',charge_hold:'machao'},plans=b.stratagem?.plans||[];
    return b.round>=2&&plans.some(p=>p.side==='player'&&p.type===types[session.id]&&(session.id==='bait_chase'?p.chased===true:['rescue_retreat','charge_hold'].includes(session.id)?p.effectApplied===true:['triggered','resolved'].includes(p.status)));
  }
  function finish(session,won){
    const b=session.battle,met=objectiveMet(session);
    const result={won,round:b.round,objectiveMet:met,summary:met?'已观察到本课战法的作用。教学观察结束，可重开比较另一套指令；这不代表正式战斗已经歼灭全部敌军。':'演练结束。可重开按目标试一次，观察日志中的准备、反制和失效原因。'};
    session.result=result;b.result=result;b.finished=true;b.auto=false;return result;
  }
  return {definitions,create,objectiveMet,finish};
})();
