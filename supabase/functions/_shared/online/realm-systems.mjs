// Generated from online/realm-systems.mjs by build-online-runtime.cjs.
import {copy,GameError} from './runtime.mjs';
export const WAR_RULES=Object.freeze({newbieMs:72*3600000,prepareMs:8*3600000,warMs:48*3600000,peaceMs:12*3600000,peaceCooldownMs:48*3600000});
export const capitalHall=(state,fallback=1)=>state?.realm?.cities?.capital?.data?.buildings?.hall??state?.buildings?.hall??fallback;
const fail=(message,code='WORLD_RULE')=>{throw new GameError(code,message);};
const count=(n,max=1000000000)=>Number.isSafeInteger(n)&&n>0&&n<=max;
export function realmPolicy(state,now){
 if(!state.onlineRealm)state.onlineRealm={version:1,joinedAt:state.last||now,protectionUntil:0,peaceUntil:0,peaceCooldown:0,declarations:[],events:[]};
 const p=state.onlineRealm;p.declarations=p.declarations||[];p.events=p.events||[];return p;
}
export function protectedUntil(state,now){const p=realmPolicy(state,now);return Math.max(p.protectionUntil||0,p.peaceUntil||0);}
export function allianceRelation(alliances,memberships,a,b,now){
 const aa=memberships.find(m=>m.user===a)?.alliance,bb=memberships.find(m=>m.user===b)?.alliance;
 if(aa&&aa===bb)return {status:'same',startsAt:0};if(!aa||!bb)return {status:'neutral',startsAt:0};
 const left=alliances.find(x=>x.id===aa)?.relations?.[bb],right=alliances.find(x=>x.id===bb)?.relations?.[aa];
 const war=[left,right].filter(r=>r?.status==='enemy').sort((a,b)=>a.startsAt-b.startsAt)[0];
 if(war)return {status:'enemy',startsAt:war.startsAt};
 return {status:left?.status==='friendly'||right?.status==='friendly'?'friendly':'neutral',startsAt:0};
}
export function attackPermission(actorState,targetState,actor,target,alliances,memberships,now){
 if(protectedUntil(actorState,now)>now)return '我方仍在新手保护或免战期间，请先结束保护';
 if(protectedUntil(targetState,now)>now)return '目标处于新手保护或免战期间';
 const relation=allianceRelation(alliances,memberships,actor,target,now);
 if(['same','friendly'].includes(relation.status))return '不能攻击同盟或友好联盟成员';
 if(relation.status==='enemy'&&now>=relation.startsAt)return '';
 const declaration=realmPolicy(actorState,now).declarations.find(d=>d.target===target&&d.startsAt<=now&&d.endsAt>now);
 if(!declaration)return '请先宣战并等待 8 小时准备期，战争持续 48 小时';
 return '';
}
export function policyView(state,now){const p=realmPolicy(copy(state),now);return {joinedAt:p.joinedAt,protectionUntil:p.protectionUntil||0,peaceUntil:p.peaceUntil||0,peaceCooldown:p.peaceCooldown||0,declarations:p.declarations.filter(d=>d.endsAt>now),events:p.events.slice(-20)};}
export function recordEvent(state,event){const p=realmPolicy(state,event.at);p.events.push(copy(event));p.events=p.events.slice(-30);}

// These commands operate on canonical runtime state, never a client snapshot.
export function realmAction({input,now,actor,players,alliances,memberships,marches,orders,runtime,persist,marchChanged,orderChanged,result}){
 const p=input.args[0]||{},type=input.type,g=runtime(actor,input.sourceCity||'capital').Game,s=g.state,policy=realmPolicy(s,now);
 const member=memberships.find(m=>m.user===actor),mine=alliances.find(a=>a.id===member?.alliance);
 const requireLeader=()=>{if(!mine||member.role!=='leader')fail('只有盟主可以修改外交和作战标记');return mine;};
 if(type==='shared.endProtection'){
  policy.protectionUntil=now;policy.peaceUntil=now;result.protectionUntil=now;
 }else if(type==='shared.declareWar'){
  const target=players.get(p.targetId);if(!target||target.id===actor)fail('请选择其他玩家');
  if(protectedUntil(runtime(target.id).Game.state,now)>now)fail('目标处于保护期间','TARGET_PROTECTED');
  const relation=allianceRelation(alliances,memberships,actor,target.id,now);if(['same','friendly'].includes(relation.status))fail('不能向同盟或友好联盟宣战');
  if(policy.peaceUntil>now)fail('免战期间不能宣战');
  policy.declarations=policy.declarations.filter(d=>d.endsAt>now);
  if(policy.declarations.some(d=>d.target===target.id))fail('对该玩家的宣战仍有效');
  if(policy.declarations.length>=20)fail('同时宣战数量已达 20 个');
  policy.protectionUntil=now;const war={id:input.commandId,target:target.id,declaredAt:now,startsAt:now+WAR_RULES.prepareMs,endsAt:now+WAR_RULES.prepareMs+WAR_RULES.warMs};policy.declarations.push(war);result.declaration=war;
  recordEvent(runtime(target.id).Game.state,{at:now,type:'war-warning',actor,startsAt:war.startsAt,endsAt:war.endsAt});persist(target.id);
 }else if(type==='shared.peace'){
  if(policy.peaceCooldown>now)fail('免战冷却尚未结束');
  if(marches.some(m=>m.kind==='pvp'&&m.status!=='done'&&(m.source===actor||m.target===actor)))fail('已有出征或来袭军队，不能开启免战');
  if(policy.declarations.some(d=>d.endsAt>now))fail('宣战有效期间不能开启免战');
  if(g.state.res.gold<5000)fail('开启免战需要 5000 黄金');g.state.res.gold-=5000;policy.peaceUntil=now+WAR_RULES.peaceMs;policy.peaceCooldown=now+WAR_RULES.peaceCooldownMs;result.peaceUntil=policy.peaceUntil;
 }else if(type==='shared.setDiplomacy'){
  const a=requireLeader(),b=alliances.find(a=>a.id===p.id);if(!b||b.id===a.id||!['friendly','enemy','neutral'].includes(p.status))fail('联盟或外交状态无效');
  a.relations=a.relations||{};if(p.status==='neutral')delete a.relations[b.id];else Object.defineProperty(a.relations,b.id,{value:{status:p.status,since:now,startsAt:p.status==='enemy'?now+WAR_RULES.prepareMs:now},enumerable:true,configurable:true,writable:true});result.relation=a.relations[b.id]||{status:'neutral'};
 }else if(type==='shared.markOperation'){
  const a=requireLeader();if(!Number.isInteger(p.x)||p.x<0||p.x>63||!Number.isInteger(p.y)||p.y<0||p.y>63||!['attack','defend','gather'].includes(p.kind))fail('作战标记位置或类型无效');
  const note=String(p.note||'').trim();if(note.length>80)fail('作战标记说明不能超过 80 字');a.marks=(a.marks||[]).filter(m=>m.expiresAt>now);if(a.marks.length>=20)fail('有效作战标记已达 20 个');
  const mark={id:input.commandId,kind:p.kind,x:p.x,y:p.y,note,by:actor,at:now,expiresAt:now+72*3600000};a.marks.push(mark);result.mark=mark;
 }else if(type==='shared.removeOperation'){
  const a=requireLeader();if(!(a.marks||[]).some(m=>m.id===p.id))fail('作战标记已不存在');a.marks=a.marks.filter(m=>m.id!==p.id);
 }else if(type==='shared.marketCreate'){
  if(g.state.buildings.market<1)fail('请先建设市场');if(!['food','wood','stone','iron'].includes(p.resource)||!count(p.quantity)||!count(p.price,10000))fail('资源、数量或单价无效');
  if(orders.filter(o=>o.seller===actor&&o.status==='open').length>=g.state.buildings.market*2)fail('挂单数量已达市场等级上限');
  if(g.state.res[p.resource]<p.quantity)fail('库存不足，无法冻结挂单物资');g.state.res[p.resource]-=p.quantity;
  const city=g.currentCityId(),origin=city==='capital'?players.get(actor).home:g.cityMeta(city),order={id:input.commandId,seller:actor,sellerCity:city,resource:p.resource,price:p.price,quantity:p.quantity,remaining:p.quantity,sold:0,status:'open',origin:{x:origin.x,y:origin.y},createdAt:now,version:0};orders.push(order);orderChanged.add(order.id);result.order=copy(order);
 }else if(type==='shared.marketCancel'){
  const order=orders.find(o=>o.id===p.id&&o.seller===actor&&o.status==='open');if(!order)fail('只能取消自己的有效挂单');const destination=g.state.realm.cities[order.sellerCity]?order.sellerCity:'capital',home=runtime(actor,destination).Game;
  home.state.res[order.resource]+=order.remaining;order.cancelled=order.remaining;order.remaining=0;order.status='cancelled';order.version++;orderChanged.add(order.id);result.refund=order.cancelled;
 }else if(type==='shared.marketBuy'){
  if(g.state.buildings.market<1)fail('请先建设市场');const order=orders.find(o=>o.id===p.id&&o.status==='open');if(!order||!players.has(order.seller)||order.seller!==p.targetId)fail('挂单已结束，请刷新市场');if(order.seller===actor)fail('不能购买自己的挂单');if(!count(p.quantity)||p.quantity>order.remaining)fail('购买数量超过挂单余量');
  const gold=p.quantity*order.price;if(!Number.isSafeInteger(gold)||g.state.res.gold<gold)fail('黄金不足');
  const active=runtime(actor,input.sourceCity||'capital').Game,city=active.currentCityId(),destination=city==='capital'?players.get(actor).home:active.cityMeta(city),seconds=Math.max(1,Math.ceil(Math.hypot(destination.x-order.origin.x,destination.y-order.origin.y)*1000/100));
  if(Math.hypot(destination.x-order.origin.x,destination.y-order.origin.y)>active.state.buildings.market*8)fail('挂单超出本城市场交易范围');
  if(marches.filter(m=>m.kind==='trade'&&m.source===actor&&m.status!=='done').length>=g.state.buildings.market)fail('市场运货队伍已满，等待送货抵达');
  active.state.res.gold-=gold;order.remaining-=p.quantity;order.sold+=p.quantity;if(!order.remaining)order.status='filled';order.version++;orderChanged.add(order.id);
  const delivery={id:input.commandId,kind:'trade',source:actor,target:order.seller,sourceCity:city,targetCity:order.sellerCity,status:'march',army:{},general:null,orderId:order.id,resource:order.resource,quantity:p.quantity,gold,origin:order.origin,destination:{x:destination.x,y:destination.y},start:now,arrive:now+seconds*1000,returnAt:null,version:0};marches.push(delivery);marchChanged.add(delivery.id);result.delivery=copy(delivery);result.gold=gold;result.seconds=seconds;
 }else return false;
 persist(actor);return true;
}

export function territoryView(cities,alliances,memberships,map){return alliances.map(a=>{const users=memberships.filter(m=>m.alliance===a.id).map(m=>m.user),owned=cities.filter(c=>users.includes(c.owner));return {id:a.id,name:a.name,members:users.length,cities:owned.map(c=>({id:c.id,name:c.name,x:c.x,y:c.y,owner:c.owner,tier:c.tier||'city'})),capitalCount:map.filter(p=>users.includes(p.id)).length,total:owned.length};});}

// Transfer only secondary cities. Every player keeps a capital, so no destroyed
// account can strand returning troops or delivery proceeds without a destination.
export function transferCity({actor,target,cityId,now,runtime,marches,marchChanged,cities,cityChanged,orders,orderChanged,persist}){
 const defender=runtime(target,cityId).Game,attacker=runtime(actor).Game,ds=defender.state,as=attacker.state,city=ds.realm.cities[cityId];
 if(!city||city.capital)fail('主城是保底城市，不能被占领','CAPITAL_PROTECTED');
 if(attacker.cityList().length>=attacker.cityLimit())fail('爵位允许的城池数量已满');
 const claim=cities.find(c=>c.id===city.node&&c.owner===target);if(!claim)fail('城市归属已改变','CITY_TAKEN');
 const capital=ds.realm.cities.capital.data,refuge=[],residentHeroes=Object.entries(ds.realm.heroLocations).filter(([,location])=>location===cityId).map(([id])=>id),busyIds=[...new Set([...marches.filter(m=>m.source===target&&m.status!=='done').map(m=>m.general),...(ds.expedition?[ds.expedition.general]:[]),...ds.expeditions.map(e=>e.general),...Object.values(ds.garrisons).map(e=>e.general),...ds.realm.logistics.map(e=>e.general)].filter(Boolean))];
 // Native expeditions, scouting and wild garrisons remain with the old owner.
 // They are immediately evacuated rather than copied into the conquered city.
 for(const expedition of [...(ds.expedition?[ds.expedition]:[]),...ds.expeditions,...Object.values(ds.garrisons)]){const alive=expedition.phase==='battle'&&ds.battle?Object.fromEntries(ds.battle.player.map(row=>[row.id,Math.max(0,Math.ceil(row.hp/row.stats.hp))])):expedition.army||{};for(const [id,n]of Object.entries(alive))capital.army[id]+=n;refuge.push(expedition.general);}
 for(const job of ds.scoutQueue||[])capital.army.scout+=job.outcome?.survivors??job.scouts??0;
 for(const job of ds.realm.logistics.filter(j=>j.sourceCity===cityId||j.destinationCity===cityId)){
  for(const [id,n]of Object.entries(job.army))capital.army[id]+=n;if(!job.delivered)for(const [id,n]of Object.entries(job.cargo))capital.res[id]+=n;if(job.general)refuge.push(job.general);
 }
 ds.realm.logistics=ds.realm.logistics.filter(j=>j.sourceCity!==cityId&&j.destinationCity!==cityId);
 for(const [id,location]of Object.entries(ds.realm.heroLocations))if(location===cityId||refuge.includes(id)){ds.realm.heroLocations[id]='capital';refuge.push(id);}
 for(const node of Object.keys(ds.realm.wildOwners))if(ds.realm.wildOwners[node]===cityId)ds.realm.wildOwners[node]='capital';
 for(const march of marches){
  if(march.status==='done')continue;
  if(march.source===target&&(march.sourceCity||'capital')===cityId){march.sourceCity='capital';march.evacuatedFrom=cityId;march.version++;marchChanged.add(march.id);}
  if(march.kind==='aid'&&march.target===target&&(march.targetCity||'capital')===cityId){march.status='return';march.returnAt=now+Math.max(1000,march.arrive-march.start);march.version++;marchChanged.add(march.id);}
 }
 // Unsold market escrow remains property of the original seller.
 for(const order of orders.filter(o=>o.seller===target&&o.sellerCity===cityId&&o.status==='open')){capital.res[order.resource]+=order.remaining;order.cancelled=order.remaining;order.remaining=0;order.status='cancelled';order.version++;orderChanged.add(order.id);}
 for(const [id,n]of Object.entries(ds.army))capital.army[id]+=n;
 if(ds.warCare){const error=runtime(target).WarCare.admit(capital,'pvp:capital:'+now+':evacuated_'+city.node,ds.warCare.wounded,now,defender.units);if(error)fail(error);}
 const heroFates=residentHeroes.map(id=>runtime(actor).GovernanceSystem.captureDefeated(ds,as,id,now,{busyIds}));
 defender.save();const captured=copy(ds.realm.cities[cityId]);
 if(captured.data.buffs)captured.data.buffs=Object.fromEntries(Object.entries(captured.data.buffs).filter(([,buff])=>buff.general===null));
 delete captured.data.warCare;runtime(actor).WarCare.init(captured.data,attacker.units);
 captured.data.army=Object.fromEntries(Object.keys(ds.army).map(id=>[id,0]));captured.data.governor=null;captured.data.cityRoles={commander:'',counsellor:''};captured.data.expedition=null;captured.data.expeditions=[];captured.data.battle=null;captured.data.garrisons={};captured.data.gatherings={};captured.data.scoutQueue=[];captured.data.scoutIntel={};captured.data.innCandidates=[];captured.data.morale=40;captured.data.unrest=0;captured.data.regionalFront={version:1,seq:0,run:null,nextAt:0,wins:{1:[0,0,0],2:[0,0,0],3:[0,0,0]},earnedMerit:0,last:null};
 if(captured.data.governance){captured.data.governance.crisisSince=0;captured.data.governance.starvedSince=0;}
 captured.data.cityDefense={autoEnabled:false,nextAt:0,wave:0,wins:0,incoming:null,battle:null,reports:[]};captured.data.heroAdministration={schema:1,seq:0,prepared:null};
 // A build/train/research queue belongs to its captured city; its invested
 // materials are retained. Characters and external journeys are not copied.
 defender.switchCity('capital');delete ds.realm.cities[cityId];delete ds.conquered[city.node];
 if(ds.realm.supplyLines?.lines)ds.realm.supplyLines.lines=ds.realm.supplyLines.lines.filter(l=>l.sourceCity!==cityId&&l.destinationCity!==cityId);
 if(ds.towns?.[city.node])ds.towns[city.node].morale=40;
 as.realm.cities[cityId]=captured;as.conquered[city.node]=true;
 if(as.towns?.[city.node])as.towns[city.node].morale=40;
 claim.owner=actor;claim.version++;cityChanged.add(claim.id);
 const event={at:now,type:'city-transferred',city:cityId,name:city.name,from:target,to:actor,refugees:[...new Set(refuge)],heroFates};recordEvent(ds,event);recordEvent(as,event);persist(target);persist(actor);return event;
}
