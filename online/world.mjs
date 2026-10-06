import {scopedRuntime,copy,GameError} from './runtime.mjs';
import {realmAction,attackPermission,transferCity,recordEvent} from './realm-systems.mjs';
const fail=(message,code='WORLD_RULE')=>{throw new GameError(code,message);};
const integer=n=>Number.isSafeInteger(n)&&n>=0;
export function battle(armyA,armyB,statsA,statsB,generalA={atk:0,def:0},generalB={atk:0,def:0},wall=0,defense={}){
 const rows=(army,stats,side)=>Object.entries(army).filter(([,n])=>n>0).map(([id,n])=>({id,side,initial:n,hp:n*stats[id].hp,stats:stats[id],pos:side==='a'?0:2000}));
 const a=rows(armyA,statsA,'a'),b=rows(defense.mode==='inside'?{}:armyB,statsB,'b'),log=[],forts=Object.entries(defense.counts||{}).filter(([,n])=>n>0).map(([id,n])=>{const cfg=defense.types[id],hp=(cfg.hp||1)*(1+(defense.fortification||0)*.1);return {id,initial:n,hp:n*hp,stats:{...cfg,hp,speed:0},pos:2000,fort:true};});
 if(defense.gateHp>0)forts.push({id:'gate',initial:1,hp:defense.gateHp,stats:{hp:defense.gateHp,atk:0,def:0,speed:0,range:0},pos:2000,fort:true});
 for(let round=1;round<=30&&a.some(r=>r.hp>0)&&[...b,...forts].some(r=>r.hp>0);round++){
  for(const row of [...a,...b].sort((x,y)=>y.stats.speed-x.stats.speed||x.id.localeCompare(y.id))){
   if(row.hp<=0)continue;const targets=(row.side==='a'?[...b,...forts]:a).filter(r=>r.hp>0);if(!targets.length)break;
   const order=(row.side==='a'?defense.attackerOrders:defense.defenderOrders)?.[row.id]||{command:'advance',target:''},direction=row.side==='a'?1:-1;
   if(order.command==='fallback'){row.pos=Math.max(0,Math.min(2000,row.pos-direction*row.stats.speed));if(log.length<60)log.push({round,side:row.side,unit:row.id,type:'move',command:'fallback',position:row.pos,killed:0});}
   const exposed=targets.some(t=>t.id!=='gate')?targets.filter(t=>t.id!=='gate'):targets,near=exposed.sort((x,y)=>Math.abs(x.pos-row.pos)-Math.abs(y.pos-row.pos)||x.id.localeCompare(y.id)),ranged=near.filter(t=>Math.abs(t.pos-row.pos)<=row.stats.range);
   const target=ranged.find(t=>t.id===order.target)||ranged[0]||near[0],distance=Math.abs(target.pos-row.pos);
   if(distance>row.stats.range){if(order.command==='advance'){row.pos=Math.max(0,Math.min(2000,row.pos+direction*Math.min(row.stats.speed,Math.max(0,distance-row.stats.range))));if(log.length<60)log.push({round,side:row.side,unit:row.id,type:'move',command:'advance',position:row.pos,killed:0});}continue;}
   let counter=row.id==='spear'&&target.id==='cavalry'?1.6:row.id==='cavalry'&&target.id==='archer'?1.65:row.id==='archer'&&target.id==='shield'?.5:1;
   const commander=row.side==='a'?generalA:generalB,defender=row.side==='a'?generalB:generalA,sideRows=row.side==='a'?a:b,otherRows=row.side==='a'?b:a;
   const coverage=Math.min(1,(commander.lead||0)*100/Math.max(1,sideRows.reduce((n,r)=>n+r.initial,0))),defenseCoverage=Math.min(1,(defender.lead||0)*100/Math.max(1,otherRows.reduce((n,r)=>n+r.initial,0)));
   const damage=Math.max(1,Math.round(Math.ceil(row.hp/row.stats.hp)*row.stats.atk*(1+((commander.atk||0)/220+(commander.bonus===row.id?.12:0))*coverage)*counter*(target.fort&&['ram','catapult'].includes(row.id)?defense.gateFactor||1:1)/(1+target.stats.def/200)/(1+(defender.def||0)/300*defenseCoverage)/(row.side==='a'?1+wall*.025:1)));
   const before=Math.ceil(target.hp/target.stats.hp);target.hp=Math.max(0,target.hp-damage);
   if(log.length<60)log.push({round,side:row.side,unit:row.id,target:target.id,killed:before-Math.ceil(target.hp/target.stats.hp)});
  }
  for(const fort of forts.filter(f=>f.hp>0&&(f.stats.atk||f.id==='trap'))){
   const target=a.filter(r=>r.hp>0&&2000-r.pos<=fort.stats.range).sort((x,y)=>y.pos-x.pos)[0];if(!target)continue;
   const count=Math.ceil(fort.hp/fort.stats.hp),used=fort.stats.oneUse?Math.min(count,a.reduce((n,r)=>n+Math.ceil(r.hp/r.stats.hp),0)):count;
   const damage=used*(fort.id==='trap'?defense.trapDamage:fort.stats.atk)/(1+target.stats.def/200),before=Math.ceil(target.hp/target.stats.hp);target.hp=Math.max(0,target.hp-damage);if(fort.stats.oneUse)fort.hp=Math.max(0,fort.hp-used*fort.stats.hp);
   if(log.length<60)log.push({round,side:'b',unit:fort.id,target:target.id,killed:before-Math.ceil(target.hp/target.stats.hp),fort:true});
  }
 }
 const survivors=rows=>Object.fromEntries(rows.map(r=>[r.id,Math.max(0,Math.ceil(r.hp/r.stats.hp))]));
 return {won:![...b,...forts].some(r=>r.hp>0)&&a.some(r=>r.hp>0),attacker:survivors(a),defender:defense.mode==='inside'?copy(armyB):survivors(b),defenses:survivors(forts.filter(f=>f.id!=='gate')),gateHp:forts.find(f=>f.id==='gate')?.hp??0,log};
}
const statsFor=(game,army,player=true,general=null)=>{const skill=player&&general?game.generalGrowth.profile(game.state,general):null;return Object.fromEntries(Object.keys(army).map(id=>{const stats={...game.unitStats(id,player)};stats.atk*=skill?.attackByUnit?.[id]||1;return [id,stats];}));};
function movement(game,home,destination,army,general){
 const speeds=Object.entries(army).filter(([,n])=>n>0).map(([id])=>game.unitStats(id).speed);
 const pureCavalry=Object.entries(army).every(([id,n])=>!n||['cavalry','heavy','scout'].includes(id)),skill=game.generalGrowth.profile(game.state,general),factor=pureCavalry?skill.marchFactor:1;
 const seconds=Math.max(1,Math.ceil(Math.hypot(home.x-destination.x,home.y-destination.y)*1000/Math.max(1,Math.min(...speeds))/factor));
 return {seconds,supply:Math.ceil(game.totalArmy(army)*1.2+game.upkeep(army)*seconds*2/3600)};
}
function selectArmy(runtime,army,general,context,actor){
 const g=runtime.Game,s=g.state;if(!army||typeof army!=='object'||Array.isArray(army)||Object.keys(army).some(id=>!g.units[id]))fail('兵种无效');
 const selected=Object.fromEntries(Object.keys(g.units).map(id=>[id,army[id]??0]));
 if(Object.entries(selected).some(([id,n])=>!integer(n)||n>s.army[id])||!g.totalArmy(selected))fail('城内兵力不足');
 if(s.buildings.drill<1||g.totalArmy(selected)>g.armyLimit())fail('校场或单队兵力不足');
 if(!s.generals.includes(general)||g.generalBusy(general)||g.heroCity(general)!==g.currentCityId()||runtime.HeritageSystem.roleOf(s,general)||context.marches.some(m=>m.source===actor&&m.general===general&&m.status!=='done'))fail('将领不可出征');
 if(context.marches.filter(m=>m.source===actor&&m.kind!=='trade'&&(m.sourceCity||'capital')===g.currentCityId()&&m.status!=='done').length+g.allExpeditions().filter(e=>e.sourceCity===g.currentCityId()).length>=s.buildings.drill)fail('校场派遣队伍数已满');
 return selected;
}
export function applyWorldCommand(context,input,now){
 const players=new Map(context.players.map(row=>[row.id,{...copy(row),runtime:null}])),heroes=new Map(context.heroes.map(row=>[row.line,copy(row)])),marches=copy(context.marches),alliances=copy(context.alliances),memberships=copy(context.memberships),cities=copy(context.cities),orders=copy(context.orders||[]),changed=new Set(),heroChanged=new Set(),marchChanged=new Set(),cityChanged=new Set(),orderChanged=new Set();
 const actor=context.actor,row=players.get(actor);if(!row)fail('尚未进入共享世界','NOT_JOINED');
 let clock=now;
 const runtime=(id,city=null)=>{const p=players.get(id);if(!p)fail('目标城池不存在');if(!p.runtime||p.runtimeClock!==clock){p.runtime=scopedRuntime(p.state,clock,marches,id,null);p.runtimeClock=clock;}if(city!==null){if(typeof city!=='string'||!Object.hasOwn(p.runtime.Game.state.realm.cities,city))fail('城市不属于该玩家','CITY_NOT_OWNED');p.runtime.Game.switchCity(city);}return p.runtime;};
 const persist=id=>{const p=players.get(id);runtime(id).Game.save();p.state=copy(runtime(id).Game.state);changed.add(id);};
 const membership=id=>memberships.find(m=>m.user===id),params=input.args[0]||{},result={};
 const sourceCity=input.sourceCity||'capital';runtime(actor,sourceCity);
 const location=(p,g,city)=>city==='capital'?p.home:g.cityMeta(city);
 function stageMarch(kind,destination,extra={}){
  const r=runtime(actor,sourceCity),army=selectArmy(r,params.army,params.general,{marches},actor),travel=movement(r.Game,location(row,r.Game,sourceCity),destination,army,params.general);
  if(r.Game.state.res.food<travel.supply)fail('行军粮食不足');r.Game.state.res.food-=travel.supply;
  for(const [id,n]of Object.entries(army))r.Game.state.army[id]-=n;
  const march={id:input.commandId,source:actor,target:params.targetId||null,sourceCity,targetCity:params.targetCity||'capital',kind,status:'march',army,general:params.general,generalSnapshot:copy(r.Game.general(params.general)),skillProfile:copy(r.Game.generalGrowth.profile(r.Game.state,params.general)),statsSnapshot:statsFor(r.Game,army,true,params.general),orders:copy(r.Game.state.tactics),start:now,arrive:now+travel.seconds*1000,returnAt:null,version:0,...extra};
  marches.push(march);marchChanged.add(march.id);persist(actor);Object.assign(result,{march:copy(march),supply:travel.supply,seconds:travel.seconds});
 }
 if(realmAction({input,now,actor,players,alliances,memberships,marches,orders,runtime,persist,marchChanged,orderChanged,result})){
  // Realm policy, diplomacy and exchange commands use the same transaction.
 }else if(input.type==='shared.hunt'){
  const hero=heroes.get(params.line),r=runtime(actor),d=r.HeroSystem.wild.definitions.find(d=>d.line===params.line);
  if(!hero||!d||hero.owner)fail('这名将领已被其他玩家俘获或招降','HERO_TAKEN');
  if(!r.HeroSystem.wild.portraitOwned(r.Game.state,params.line))fail('抓将前必须购买对应画像');
  const error=r.HeroSystem.wild.discover();if(error)fail(error);const rumor=r.Game.state.wildGenerals.rumors.find(r=>r.line===params.line);
  if(!rumor)fail('尚未解锁这名将领的线索');rumor.node=hero.node;rumor.status='active';
  const node=r.Game.getNode(hero.node);if(!node?.wild)fail('名将落脚点无效');stageMarch('hunt',node,{line:params.line,heroVersion:hero.version});
 }else if(input.type==='shared.attackPlayer'||input.type==='shared.aid'){
  const target=players.get(params.targetId);if(!target||target.id===actor)fail('请选择其他玩家城池');
  if(input.type==='shared.aid'){
   const a=membership(actor),b=membership(target.id);if(!a||!b||a.alliance!==b.alliance)fail('只能向同盟城池派出援军');
  }else {const reason=attackPermission(runtime(actor).Game.state,runtime(target.id).Game.state,actor,target.id,alliances,memberships,now);if(reason)fail(reason,'WAR_NOT_OPEN');if(params.mode!==undefined&&!['raid','occupy'].includes(params.mode))fail('出征方式无效');if(params.mode==='occupy'&&(params.targetCity||'capital')==='capital')fail('主城是保底城市，不能被占领','CAPITAL_PROTECTED');if(params.mode==='occupy'&&runtime(actor).Game.cityList().length>=runtime(actor).Game.cityLimit())fail('爵位允许的城池数量已满');}
  const targetGame=runtime(target.id,params.targetCity||'capital').Game;
  stageMarch(input.type==='shared.aid'?'aid':'pvp',location(target,targetGame,params.targetCity||'capital'),{mode:params.mode||'raid',returnAfterOccupy:params.returnAfterOccupy===true,targetNode:targetGame.cityMeta()?.node});persist(target.id);
 }else if(input.type==='shared.recallAid'){
  const march=marches.find(m=>m.id===params.id&&m.source===actor&&m.status==='stationed');if(!march)fail('请选择自己的驻城援军');
  march.status='return';march.returnAt=now+Math.max(1000,march.arrive-march.start);march.version++;marchChanged.add(march.id);result.returnAt=march.returnAt;
 }else if(input.type==='shared.createAlliance'){
  if(membership(actor))fail('已加入联盟');const name=String(params.name||'').trim();if(name.length<2||name.length>20||alliances.some(a=>a.name===name))fail('联盟名称无效或已存在');
  alliances.push({id:input.commandId,name,leader:actor,relations:{},marks:[]});memberships.push({user:actor,alliance:input.commandId,role:'leader'});result.alliance=input.commandId;
 }else if(input.type==='shared.joinAlliance'){
  if(membership(actor))fail('已加入联盟');if(!alliances.some(a=>a.id===params.id))fail('联盟不存在');memberships.push({user:actor,alliance:params.id,role:'member'});result.alliance=params.id;
 }else if(input.type==='shared.leaveAlliance'){
  const member=membership(actor);if(!member)fail('尚未加入联盟');if(marches.some(m=>(m.source===actor||m.target===actor)&&m.kind==='aid'&&m.status!=='done'))fail('请先收回所有联盟援军');
  if(member.role==='leader'&&memberships.filter(m=>m.alliance===member.alliance).length>1)fail('盟主请先安排成员退出');
  memberships.splice(memberships.indexOf(member),1);if(member.role==='leader')alliances.splice(alliances.findIndex(a=>a.id===member.alliance),1);
 }else if(input.type==='shared.settle'){
  result.receipts=[];
  for(let processed=0;processed<8;processed++){
   const march=marches.filter(m=>players.has(m.source)&&(!m.target||players.has(m.target))&&(m.status==='march'&&m.arrive<=now||m.status==='return'&&m.returnAt<=now)).sort((a,b)=>(a.status==='return'?a.returnAt:a.arrive)-(b.status==='return'?b.returnAt:b.arrive)||a.id.localeCompare(b.id))[0];if(!march)break;
   clock=march.status==='return'?march.returnAt:march.arrive;
   // Lost secondary cities route returns to the owner's guaranteed capital.
   if(!players.get(march.source).state.realm.cities[march.sourceCity||'capital']){march.sourceCity='capital';march.version++;marchChanged.add(march.id);}
   const r=runtime(march.source,march.sourceCity||'capital'),g=r.Game;
   if(march.kind==='trade'){
    const buyer=g,seller=runtime(march.target,players.get(march.target).state.realm.cities[march.targetCity||'capital']?march.targetCity||'capital':'capital').Game;
    buyer.state.res[march.resource]+=march.quantity;seller.state.res.gold+=march.gold;march.status='done';march.version++;marchChanged.add(march.id);recordEvent(buyer.state,{at:clock,type:'trade-delivered',order:march.orderId,resource:march.resource,quantity:march.quantity,gold:march.gold});recordEvent(seller.state,{at:clock,type:'trade-paid',order:march.orderId,resource:march.resource,quantity:march.quantity,gold:march.gold});persist(march.source);persist(march.target);result.receipts.push({id:march.id,status:'delivered',resource:march.resource,quantity:march.quantity,gold:march.gold});continue;
   }
   if(march.status==='return'){
    for(const [id,n]of Object.entries(march.army))g.state.army[id]+=n;
    for(const [id,n]of Object.entries(march.loot||{}))g.state.res[id]+=n;
    march.status='done';march.version++;persist(march.source);marchChanged.add(march.id);result.receipts.push({id:march.id,status:'returned',loot:march.loot||{}});continue;
   }
   if(march.kind==='aid'&&!players.get(march.target).state.realm.cities[march.targetCity||'capital']){march.status='return';march.returnAt=clock+Math.max(1000,march.arrive-march.start);march.version++;marchChanged.add(march.id);result.receipts.push({id:march.id,status:'recalled',reason:'盟友城市已易主'});continue;}
   if(march.kind==='aid'){march.status='stationed';march.version++;marchChanged.add(march.id);result.receipts.push({id:march.id,status:'stationed'});continue;}
   let fight,defenderInitial={},defenderWounded={};
   if(march.kind==='hunt'){
    const hero=heroes.get(march.line),node=g.getNode(hero?.node);
    if(!hero||hero.owner||hero.version!==march.heroVersion){fight={won:false,attacker:march.army,defender:{},log:[],reason:'名将已被先到的玩家俘获'};}
    else {
     defenderInitial=copy(node.army);
     fight=battle(march.army,node.army,march.statsSnapshot||statsFor(g,march.army),statsFor(g,node.army,false),march.generalSnapshot||g.general(march.general),{},0,{attackerOrders:march.orders});
     if(fight.won){
      const captive=r.HeroSystem.wild.settle(g.state,node,{mode:'raid',finished:false,enemy:Object.keys(node.army).filter(id=>node.army[id]>0).map(id=>({id,hp:0}))},true,clock);
      if(captive?.status==='captured'){hero.owner=march.source;hero.status='captured';hero.version++;heroChanged.add(hero.line);fight.captive=captive;}
      else fight.reason=captive?.reason||'招贤馆已满，未能收容';
     }
    }
   }else{
    const targetState=players.get(march.target).state;
    if(!targetState.realm.cities[march.targetCity||'capital']||march.targetNode&&targetState.realm.cities[march.targetCity||'capital'].node!==march.targetNode){march.status='return';march.returnAt=clock+Math.max(1000,march.arrive-march.start);march.reason='目标城市已易主，部队撤回';march.version++;marchChanged.add(march.id);result.receipts.push({id:march.id,status:'recalled',reason:march.reason});continue;}
    const target=runtime(march.target,march.targetCity||'capital'),defending={...target.Game.state.army},aids=marches.filter(m=>m.kind==='aid'&&m.target===march.target&&(m.targetCity||'capital')===(march.targetCity||'capital')&&m.status==='stationed');
    for(const aid of aids)for(const [id,n]of Object.entries(aid.army))defending[id]=(defending[id]||0)+n;
    defenderInitial=copy(defending);const aidInitial=new Map(aids.map(a=>[a.id,copy(a.army)])),homeWounded={};
    const defenderId=target.Game.state.cityRoles.commander||target.Game.state.governor,doctrine=target.WarCare.defenseSnapshot(target.Game.state,target.Game.units),defenseStats=statsFor(target.Game,defending,true,defenderId);
    for(const id of Object.keys(defending))if(defending[id]>0){const home=target.Game.state.army[id]||0;for(const key of ['atk','def','hp','range','speed'])defenseStats[id][key]=(home*defenseStats[id][key]+aids.reduce((sum,aid)=>sum+(aid.army[id]||0)*(aid.statsSnapshot?.[id]?.[key]??defenseStats[id][key]),0))/defending[id];}
    fight=battle(march.army,defending,march.statsSnapshot||statsFor(g,march.army),defenseStats,march.generalSnapshot||g.general(march.general),target.Game.general(defenderId),target.Game.state.buildings.wall,{mode:doctrine.mode,attackerOrders:march.orders,defenderOrders:doctrine.orders,gateHp:(target.NPCDefenseData.baseGateHp+target.Game.state.buildings.wall*target.NPCDefenseData.wallHp)*(1+target.Game.state.tech.fortification*.1),counts:target.Game.state.defenses,types:target.Game.manual.defenses,fortification:target.Game.state.tech.fortification,trapDamage:target.NPCDefenseData.trapDamage,gateFactor:march.skillProfile?.gateFactor||1});
    for(const id of Object.keys(target.Game.state.defenses))target.Game.state.defenses[id]=fight.defenses[id]||0;
    // Losses are allocated proportionally between the home garrison and allied
    // troops; every survivor remains owned by its original player.
    for(const [id,initial]of Object.entries(defending)){
     const remaining=fight.defender[id]||0,homeInitial=target.Game.state.army[id]||0;let allocated=Math.floor(remaining*homeInitial/Math.max(1,initial));target.Game.state.army[id]=allocated;
     const holders=aids.filter(a=>a.army[id]>0);for(let index=0;index<holders.length;index++){const aid=holders[index],n=index===holders.length-1?remaining-allocated:Math.floor(remaining*aid.army[id]/Math.max(1,initial));aid.army[id]=n;allocated+=n;aid.version++;marchChanged.add(aid.id);}
     if(!holders.length)target.Game.state.army[id]=remaining;
     const ownWounded=Math.floor((homeInitial-target.Game.state.army[id])*(fight.won?.15:.35));defenderWounded[id]=ownWounded;homeWounded[id]=ownWounded;
     for(const aid of holders){const before=aidInitial.get(aid.id)?.[id]||0,wounded=Math.floor((before-aid.army[id])*(fight.won?.15:.35));if(wounded){aid.woundings=aid.woundings||{};aid.woundings[id]=wounded;defenderWounded[id]+=wounded;}}
    }
    const admission=target.WarCare.admit(target.Game.state,'pvp:'+(march.targetCity||'capital')+':'+march.start+':'+march.id,homeWounded,clock,target.Game.units);if(admission)fail(admission);
    for(const aid of aids){if(aid.woundings){const ally=runtime(aid.source,players.get(aid.source).state.realm.cities[aid.sourceCity||'capital']?aid.sourceCity||'capital':'capital'),error=ally.WarCare.admit(ally.Game.state,'pvp:'+ally.Game.currentCityId()+':'+march.start+':'+march.id+'_'+aid.id,aid.woundings,clock,ally.Game.units);if(error)fail(error);delete aid.woundings;persist(aid.source);}}
    if(fight.won){let room=g.carry(fight.attacker);march.loot={};for(const key of ['food','wood','stone','iron','gold']){const amount=Math.min(room,Math.floor(target.Game.state.res[key]*.1));target.Game.state.res[key]-=amount;march.loot[key]=amount;room-=amount;}}
    if(fight.won&&march.mode==='occupy'){
     const before=target.Game.state.morale;target.Game.state.morale=Math.max(0,before-35);fight.occupation={before,after:target.Game.state.morale,claimed:false};
     if(target.Game.state.morale===0&&(march.targetCity||'capital')!=='capital'&&g.cityList().length<g.cityLimit()){
      persist(march.target);fight.occupation.event=transferCity({actor:march.source,target:march.target,cityId:march.targetCity,now:clock,runtime,marches,marchChanged,cities,cityChanged,orders,orderChanged,persist});fight.occupation.claimed=true;
      for(const fate of fight.occupation.event.heroFates||[]){const hero=heroes.get(fate.line);if(!hero||hero.owner!==march.target||fate.status==='returned')continue;hero.owner=fate.status==='captured'?march.source:null;hero.status=fate.status==='captured'?'captured':'wild';hero.version++;heroChanged.add(hero.line);}
     }
    }
    persist(march.target);
    for(const aid of aids)if(!g.totalArmy(aid.army)){aid.status='done';aid.version++;marchChanged.add(aid.id);}
   }
   const wounded=Object.fromEntries(Object.entries(march.army).map(([id,n])=>[id,Math.floor((n-(fight.attacker[id]||0))*(fight.won?.35:.15))]));const admission=r.WarCare.admit(g.state,'pvp:'+(march.sourceCity||'capital')+':'+march.start+':'+march.id,wounded,clock,g.units);if(admission)fail(admission);
   march.report={at:clock,name:march.kind==='hunt'?g.getNode(heroes.get(march.line)?.node)?.name||'名将野地':players.get(march.target).state.ruler,won:fight.won,attacker:copy(fight.attacker),defender:copy(fight.defender),wounded:copy(wounded),defenderWounded:copy(defenderWounded),lost:Object.fromEntries(Object.entries(march.army).map(([id,n])=>[id,n-(fight.attacker[id]||0)-(wounded[id]||0)])),defenderLost:Object.fromEntries(Object.entries(defenderInitial).map(([id,n])=>[id,n-(fight.defender[id]||0)-(defenderWounded[id]||0)])),loot:copy(march.loot||{}),log:copy(fight.log),reason:fight.reason||'',captive:fight.captive||null,occupation:fight.occupation||null};
   march.army=copy(fight.attacker);
   if(fight.occupation?.claimed&&!march.returnAfterOccupy){const occupied=runtime(march.source,march.targetCity).Game;for(const [id,n]of Object.entries(march.army))occupied.state.army[id]+=n;for(const [id,n]of Object.entries(march.loot||{}))occupied.state.res[id]+=n;occupied.state.realm.heroLocations[march.general]=march.targetCity;march.status='done';march.stationedCity=march.targetCity;march.returnAt=null;march.lootDelivered=true;}else{march.status='return';march.returnAt=clock+Math.max(1000,march.arrive-march.start);}march.version++;persist(march.source);marchChanged.add(march.id);
   result.receipts.push({id:march.id,status:'battle',...fight,loot:march.loot||{}});
  }
 }else fail('未知共享世界操作','COMMAND_NOT_ALLOWED');
 // Canonical city time stays at the settled event when another overdue event
 // remains. Advancing past that event would let offline building completions
 // retroactively change a battle. Idle views still project time for display.
 clock=marches.some(m=>(m.source===actor||m.target===actor)&&(m.status==='march'&&m.arrive<=now||m.status==='return'&&m.returnAt<=now))?Math.min(now,...marches.filter(m=>(m.source===actor||m.target===actor)&&(m.status==='march'&&m.arrive<=now||m.status==='return'&&m.returnAt<=now)).map(m=>m.status==='return'?m.returnAt:m.arrive)):now;
 if(!changed.has(actor))persist(actor);
 for(const id of [...changed]){const pending=marches.filter(m=>(m.source===id||m.target===id)&&(m.status==='march'&&m.arrive<=now||m.status==='return'&&m.returnAt<=now));clock=pending.length?Math.min(...pending.map(m=>m.status==='return'?m.returnAt:m.arrive)):now;persist(id);}
 for(const id of changed)if(!runtime(id).Game.validSave(players.get(id).state))fail('共享结算产生无效存档','INVALID_RESULT');
 for(const hero of heroes.values()){if(!hero.owner||!changed.has(hero.owner))continue;const state=players.get(hero.owner).state,alive=state.generals.some(id=>state.customGenerals.some(g=>g.id===id&&g.wildLine===hero.line)),held=state.wildGenerals.captives.some(c=>c.line===hero.line)||state.heroService?.captives.some(c=>c.hero.wildLine===hero.line);if(!alive&&!held){hero.owner=null;hero.status='wild';hero.version++;heroChanged.add(hero.line);}else if(alive&&hero.status!=='owned'){hero.status='owned';hero.version++;heroChanged.add(hero.line);}}
 const patch={cities:[...cityChanged].map(id=>({...cities.find(c=>c.id===id),expectedVersion:context.cities.find(c=>c.id===id)?.version??null})),orders:[...orderChanged].map(id=>({...orders.find(o=>o.id===id),expectedVersion:context.orders?.find(o=>o.id===id)?.version??null})),players:[...changed].map(id=>({id,expectedRevision:players.get(id).revision,state:players.get(id).state})),heroes:[...heroChanged].map(line=>({...heroes.get(line),expectedVersion:context.heroes.find(h=>h.line===line)?.version??0})),marches:[...marchChanged].map(id=>({...marches.find(m=>m.id===id),expectedVersion:context.marches.find(m=>m.id===id)?.version??null})),result};
 if(['shared.createAlliance','shared.joinAlliance','shared.leaveAlliance','shared.setDiplomacy','shared.markOperation','shared.removeOperation'].includes(input.type)){patch.alliances=alliances;patch.memberships=memberships;}
 if(patch.memberships||['shared.aid','shared.attackPlayer','shared.declareWar','shared.settle'].includes(input.type))patch.allianceExpected=context.allianceRevision||0;
 return patch;
}
