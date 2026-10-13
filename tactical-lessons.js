'use strict';
// Fixed practice armies use the same unit tables and round resolver as PvE.
// Nothing in this module grants heroes, items, rewards or permanent progress.
const TacticalLessons=(()=>{
  const definitions=[
    {id:'shield_archer',practical:true,title:'盾护弓 · 守线还射',generalName:'演练主将',wildLine:'',description:'目的：盾在前承受箭矢，弓在后还射。',objective:'观察「盾阵承箭」和「弓阵还射」，并歼灭守军。',actions:'操作：刀盾与弓队先坚守，逐回合观察；弓队射程不足时再向前。',failureHint:'刀盾后退会让弓队暴露；保持盾在弓前，别让弓队先冲。',length:2100,player:[['shield',22,1000,'hold'],['archer',45,900,'hold']],enemy:[['archer',60,2100,'hold']]},
    {id:'spear_block_cavalry',practical:true,title:'枪阻骑 · 后排保全',generalName:'演练主将',wildLine:'',description:'目的：枪阵接住骑兵，弓队留在后排。',objective:'观察「长枪阻骑」的实际克制伤害，保全弓队并歼灭守军。',actions:'操作：长枪坚守在弓队前，弓队坚守；骑兵冲近后观察枪骑交锋。',failureHint:'长枪后退、弓队向前会把弓队送到骑兵面前；先恢复枪前弓后。',length:2200,player:[['spear',45,1100,'hold'],['archer',30,1000,'hold']],enemy:[['cavalry',40,2200,'advance']]},
    {id:'siege_gate',practical:true,siegeNode:'luo_gate',title:'器械破城 · 护卫冲车',generalName:'演练主将',wildLine:'',description:'目的：护卫冲车，用真实城门与箭楼练习攻城。',objective:'观察「冲车撞门」，破门并歼灭实际河洛东门守军。',actions:'操作：各队向前，冲车优先城防；破门后继续清守军，勿只等门破。',failureHint:'冲车坚守在远处够不到城门；让护卫与冲车向前，到城门后再坚守。',length:1800,player:[['shield',450,0,'advance'],['spear',240,0,'advance'],['archer',420,0,'advance'],['ram',12,0,'advance']],enemy:[]},
    {id:'spear_cavalry',basic:true,title:'长枪抗骑 · 保护弓阵',generalName:'先锋将',wildLine:'',description:'固定借调30长枪、18弓箭手，对阵18轻骑、8弓箭手。让枪阵接触轻骑，观察枪骑交锋与弓阵受击。',objective:'打败练习守军，观察队形与克制。',length:1800,player:[['spear',30,0,'advance'],['archer',18,0,'hold']],enemy:[['cavalry',18,1800,'advance'],['archer',8,1800,'hold']]},
    {id:'siege_guard',basic:true,siegeNode:'luo_gate',title:'护卫器械 · 河洛东门',generalName:'先锋将',wildLine:'',description:'借调450刀盾、240长枪、420弓箭手、12冲车、2投石车。使用原第三章河洛东门、实际守军和18000耐久城门；演练不开放正式章节或占领城池。',objective:'推进护卫和器械，先破城门，再清守军。观察破門回合、箭楼和器械存活。',length:1800,player:[['shield',450,0,'advance'],['spear',240,0,'advance'],['archer',420,0,'advance'],['ram',12,0,'advance'],['catapult',2,0,'advance']],enemy:[]},
    {id:'opening_battle',basic:true,title:'开场 · 黄巾遭遇战',generalName:'先锋将',wildLine:'',description:'盾兵前进吸收箭矢，弓兵先坚守射击；如果够不到敌人，再推进弓队。逐队选择向前、坚守、后退，点击下一回合观察变化。',objective:'打败黄巾部队，认识射程、速度和逐队指令。也可以随时跳过，回城按指引发展。',length:1600,player:[['shield',24,0,'advance'],['archer',30,0,'hold']],enemy:[['militia',18,1600,'advance'],['spear',8,1600,'advance'],['archer',12,1600,'hold']]},
    {id:'ready_shot',title:'一 · 蓄弦与探阵',generalName:'黄忠',wildLine:'huangzhong',description:'黄忠的弓队先准备一轮。第二轮，盾兵从射程外进入时先射；盾兵仍抵御箭矢。比较准备射击与普通连续射击的代价。',objective:'用弓箭兵提交蓄弦先射，再推进两轮，观察盾兵进入射程时的先手与克制。',length:2600,player:[['archer',50,1000,'hold'],['shield',15,900,'hold']],enemy:[['shield',35,2600,'advance'],['archer',10,2600,'hold']]},
    {id:'bait_chase',title:'二 · 诱追与守势',generalName:'魏延',wildLine:'warrior',description:'长枪阵先退到弓队后方。仍前进的轻骑被诱去追枪阵；不追的盾阵保留原令。诱追只改变目标，不加移动、不送第二次攻击。',objective:'以长枪兵诱退敌方轻骑，再推进两轮；比较轻骑追枪与弓队遭骑兵克制的区别。',length:3000,player:[['spear',30,1200,'hold'],['archer',35,1100,'hold']],enemy:[['cavalry',20,2600,'advance'],['shield',25,3000,'hold']]},
    {id:'fire_reveal',title:'三 · 料敌与封路',generalName:'徐庶',wildLine:'strategist',description:'开局时敌弓队已准备火攻，具体区间尚未公开。徐庶能提前揭露，让你调整本轮位置；火区下一轮才截停双方，且不额外扣血。',objective:'揭露敌方火攻，再调整前进或坚守，推进两轮观察火区。',length:3000,player:[['spear',25,900,'hold'],['archer',40,600,'hold']],enemy:[['cavalry',15,2600,'advance'],['archer',20,2800,'hold']],enemyPlan:{type:'fire',unit:'archer',left:1400}},
    {id:'rescue_retreat',title:'四 · 接应与撤军',generalName:'赵云',wildLine:'zhaoyun',description:'轻骑坚守准备接应弓队。下一轮保持轻骑坚守，让附近弓队后退：后退速度最多1.5倍，被保护队放弃本轮主攻击。离开300范围或先击溃接应骑兵会使接应失效。',objective:'以轻骑接应弓队，准备一轮后将弓队改为后退，观察真实移动与主攻击代价。',length:4000,player:[['cavalry',25,1500,'hold'],['archer',35,1400,'hold']],enemy:[['spear',20,3600,'hold'],['archer',10,3800,'hold']]},
    {id:'charge_hold',title:'五 · 冲阵与固守',generalName:'马超',wildLine:'machao',description:'轻骑先实际前进准备冲阵。下一轮继续推进到敌长枪阵，若它没有固守，骑兵牺牲本轮主攻击推退敌阵；距离不足、没有真实推进或目标固守都会阻止冲阵。',objective:'以轻骑向敌长枪阵准备冲阵，推进两轮，观察有限推退与两轮主攻击代价。',length:3500,player:[['cavalry',45,200,'advance'],['archer',25,0,'hold']],enemy:[['spear',30,2400,'advance'],['archer',10,3500,'hold']]}
  ];
  const practical=id=>!!definitions.find(d=>d.id===id)?.practical;
  // Only the independent exercise owns this evidence; it is never saved.
  function observe(session){
    if(!practical(session.id))return;
    const b=session.battle,seen=session.observed,events=b.currentRoundSummary?.events||[];
    const mark=name=>{if(!seen.includes(name))seen.push(name);};
    const archer=b.player.find(r=>r.id==='archer'),front=b.player.find(r=>r.id===(session.id==='shield_archer'?'shield':'spear'));
    if(session.id==='shield_archer'){
      if(front?.hp>0&&archer?.hp>0&&front.pos>archer.pos&&events.some(e=>e.type==='strike'&&e.side==='enemy'&&e.unit==='archer'&&e.target==='shield'&&e.damage>0))mark('盾阵承箭');
      if(front?.hp>0&&archer?.hp>0&&front.pos>archer.pos&&events.some(e=>e.type==='strike'&&e.side==='player'&&e.unit==='archer'&&e.damage>0))mark('弓阵还射');
    }
    if(session.id==='spear_block_cavalry'&&front?.hp>0&&archer?.hp>0&&front.pos>archer.pos&&events.some(e=>e.type==='strike'&&e.side==='player'&&e.unit==='spear'&&e.target==='cavalry'&&e.damage>0))mark('长枪阻骑');
    if(session.id==='siege_gate'){
      if(events.some(e=>e.type==='gate'&&e.side==='player'&&e.unit==='ram'&&e.damage>0))mark('冲车撞门');
      if(!b.gate?.hp&&seen.includes('冲车撞门'))mark('城门已破');
    }
  }
  function roleHints(army,knownTypes,manual){
    const own=Object.entries(army).filter(([id,count])=>count>0&&manual.units[id]).map(([id,count])=>({id,count,name:manual.units[id].name,role:manual.units[id].role}));
    const counters=(manual.battleCounters||[]).filter(r=>army[r.unit]>0&&knownTypes.includes(r.target)).map(r=>({...r}));
    return {own,counters};
  }
  function create(id,units){
    const d=definitions.find(x=>x.id===id);if(!d)return null;
    const rows=entries=>entries.map(([unit,count,pos])=>{const u=units[unit],stats=Object.fromEntries(['hp','atk','def','range','speed'].map(k=>[k,u[k]]));return {id:unit,initial:count,stats,hp:count*stats.hp,maxHp:count*stats.hp,pos,defending:false};});
    const generalSnapshot={id:'practice_'+id,name:d.generalName,wildLine:d.wildLine,atk:80,def:70,wis:85,pol:60,lead:50,bonus:d.wildLine==='huangzhong'?'archer':d.wildLine==='warrior'?'spear':['zhaoyun','machao'].includes(d.wildLine)?'cavalry':'shield'};
    const target=d.siegeNode?Game.getNode(d.siegeNode):null;
    const enemyEntries=target?Object.entries(target.army).map(([unit,count])=>[unit,count,d.length,'hold']):d.enemy;
    const node=target?{...target,name:d.title}:{id:'practice_'+id,name:d.title,level:1,terrain:'plain',army:{},loot:{},time:0};
    const battle={rules:3,lesson:id,node:node.id,general:generalSnapshot.id,generalSnapshot,enemyGeneralSnapshot:{id:'practice_enemy_'+id,name:'演练守军',wildLine:''},mode:target?'occupy':'raid',length:d.length,siege:!!target,gate:target?SiegeSystem.gate(target,'occupy'):null,militia:0,round:0,machineGateAttacks:0,currentRoundSummary:{round:0,events:[]},player:rows(d.player),enemy:rows(enemyEntries),orders:Object.fromEntries(d.player.map(([unit,,,_order])=>[unit,{command:_order,target:''}])),enemyOrders:Object.fromEntries(enemyEntries.map(([unit,,,_order])=>[unit,{command:_order,target:''}])),log:['独立演练：使用固定阵容，不消耗正式资源、军队或奖励。'],auto:false,finished:false,result:null};
    return {id,practical:!!d.practical,observed:d.practical?[]:undefined,actions:d.actions,failureHint:d.failureHint,title:d.title,generalName:d.generalName,description:d.description,objective:d.objective,node,battle,enemyPlan:d.enemyPlan?{...d.enemyPlan}:null,result:null};
  }
  function objectiveMet(session){
    if(practical(session.id)){
      const b=session.battle,seen=session.observed||[],needed={shield_archer:['盾阵承箭','弓阵还射'],spear_block_cavalry:['长枪阻骑'],siege_gate:['冲车撞门','城门已破']}[session.id];
      return b.round>0&&b.player.some(r=>r.hp>0)&&b.enemy.every(r=>r.hp<=0)&&!b.gate?.hp&&needed.every(e=>seen.includes(e))&&(session.id==='siege_gate'||b.player.find(r=>r.id==='archer')?.hp>0);
    }
    if(session.id==='opening_battle'||definitions.find(d=>d.id===session.id)?.basic)return false;
    const b=session.battle,types={ready_shot:'huangzhong',bait_chase:'weiyan',fire_reveal:'xushu',rescue_retreat:'zhaoyun',charge_hold:'machao'},plans=b.stratagem?.plans||[];
    return b.round>=2&&plans.some(p=>p.side==='player'&&p.type===types[session.id]&&(session.id==='bait_chase'?p.chased===true:['rescue_retreat','charge_hold'].includes(session.id)?p.effectApplied===true:['triggered','resolved'].includes(p.status)));
  }
  function finish(session,won){
    if(practical(session.id)){
      const b=session.battle,d=definitions.find(d=>d.id===session.id),actualWon=b.round>0&&b.player.some(r=>r.hp>0)&&b.enemy.every(r=>r.hp<=0)&&!b.gate?.hp,met=actualWon&&objectiveMet(session);
      const result={won:actualWon,round:b.round,objectiveMet:met,observed:[...session.observed],summary:met?'已观察到'+session.observed.join('、')+'，并真实战胜守军。演练不赠送资源或经验。':(actualWon?'守军已败，但本课配合目标未达成。':'本场未获胜。')+d.failureHint};
      session.result=result;b.result=result;b.finished=true;b.auto=false;return result;
    }
    const b=session.battle,met=session.id==='opening_battle'||definitions.find(d=>d.id===session.id)?.basic?won:objectiveMet(session);
    const result={won,round:b.round,objectiveMet:met,summary:(session.id==='opening_battle'||definitions.find(d=>d.id===session.id)?.basic)?(won?'遭遇战获胜！回城领取工程补给，跟随引导建设、募兵，再发起真正的出征。':'先锋演练结束，可重试改变指令，或直接回城跟随成长路线。'):met?'已观察到本课战法的作用。教学观察结束，可重开比较另一套指令；这不代表正式战斗已经歼灭全部敌军。':'演练结束。可重开按目标试一次，观察日志中的准备、反制和失效原因。'};
    session.result=result;b.result=result;b.finished=true;b.auto=false;return result;
  }
  return {definitions,create,objectiveMet,finish,practical,observe,roleHints};
})();
