import {createGameRuntime,scopedRuntime,executeGame,seededRandom,copy,GameError,validateInput} from './runtime.mjs';
import {applyWorldCommand} from './world.mjs';
import {policyView,territoryView,WAR_RULES,capitalHall} from './realm-systems.mjs';
const cleanRealm=value=>{if(typeof value!=='string'||!/^[a-z0-9_-]{1,40}$/.test(value)||['__proto__','constructor','prototype'].includes(value))throw new GameError('BAD_REALM','世界编号无效');return value;};
export function stableJSON(value){if(Array.isArray(value))return '['+value.map(stableJSON).join(',')+']';if(value&&typeof value==='object')return '{'+Object.keys(value).sort().map(key=>JSON.stringify(key)+':'+stableJSON(value[key])).join(',')+'}';return JSON.stringify(value);}
export async function digest(value){const bytes=new TextEncoder().encode(stableJSON(value)),hash=await crypto.subtle.digest('SHA-256',bytes);return [...new Uint8Array(hash)].map(byte=>byte.toString(16).padStart(2,'0')).join('');}
function worldSeed(runtime){
 const g=runtime.Game,heroes=runtime.HeroSystem.wild.definitions.filter(d=>d.historical).map(d=>{
  let node=null,score=Infinity;
  for(let y=0;y<64;y++)for(let x=0;x<64;x++){const n=g.getWorldTile(x,y);if(!n.wild||n.level!==d.fieldLevel||!Object.values(n.army).some(v=>v>0))continue;const distance=(x-d.anchor.x)**2+(y-d.anchor.y)**2;if(distance<score){node=n;score=distance;}}
  return {line:d.line,name:d.name,node:node?.id||'wild_28_34',owner:null,status:'wild',version:0};
 });
 return {heroes,cities:g.nodes.filter(n=>g.isCity(n)).map(n=>{const tile=g.getNode(n.id);return {id:n.id,name:n.name,x:tile.x,y:tile.y,owner:null,version:0,openCity:!!n.openCity};})};
}
export function publicWorld(context,actor){
 const player=context.players.find(p=>p.id===actor),runtime=player?createGameRuntime({snapshot:player.state,now:context.serverTime,externalBusy:context.marches.filter(m=>m.source===actor&&m.status!=='done').map(m=>m.general).filter(Boolean)}):null,g=runtime?.Game;
 return {players:(context.map||context.players).map(p=>({id:p.id,alliance:context.memberships.find(m=>m.user===p.id)?.alliance||null,name:p.name||p.state?.ruler||'城主',home:p.home,level:capitalHall(context.players.find(row=>row.id===p.id)?.state||p.state,p.level||1),policy:p.policy||p.state?.onlineRealm?{protectionUntil:(p.policy||p.state?.onlineRealm).protectionUntil||0,peaceUntil:(p.policy||p.state?.onlineRealm).peaceUntil||0}:null})),heroes:context.heroes.map(h=>({line:h.line,name:h.name,node:runtime.HeroSystem.wild.unlockReason(g.state,runtime.HeroSystem.wild.definitions.find(d=>d.line===h.line))?null:h.node,owner:h.owner,status:h.status,version:h.version})),cities:context.cities.filter(c=>c.owner===actor||c.openCity&&!runtime?.NamedCityData?.definition(c.id)||g?.landmarkVisible(c.id)).map(c=>({id:c.id,name:c.name,x:c.x,y:c.y,owner:c.owner,version:c.version,cityId:'city_'+c.id,tier:runtime?.NamedCityData?.definition(c.id)?.tier||'city'})),alliances:context.alliances.map(a=>({...a,marks:context.memberships.some(m=>m.user===actor&&m.alliance===a.id)?(a.marks||[]).filter(m=>m.expiresAt>context.serverTime):[]})),territories:territoryView(context.cities,context.alliances,context.memberships,context.map||context.players),policy:player?policyView(player.state,context.serverTime):null,orders:(context.orders||[]).filter(o=>o.seller===actor||o.status==='open'&&g&&g.state.buildings.market>0&&Math.hypot(o.origin.x-(g.currentCityId()==='capital'?player.home.x:g.cityMeta().x),o.origin.y-(g.currentCityId()==='capital'?player.home.y:g.cityMeta().y))<=g.state.buildings.market*8).map(o=>copy(o)),membership:context.memberships.find(m=>m.user===actor)||null,marches:context.marches.filter(m=>m.status!=='done'&&(m.source===actor||m.target===actor)).map(m=>({id:m.id,source:m.source,target:m.target,sourceCity:m.sourceCity||'capital',targetCity:m.targetCity||'capital',kind:m.kind,status:m.status,general:m.general,army:m.source===actor?m.army:undefined,start:m.start,arrive:m.arrive,returnAt:m.returnAt,line:m.line,mode:m.mode,resource:m.resource,quantity:m.quantity,gold:m.gold,orderId:m.orderId,evacuatedFrom:m.evacuatedFrom})),reports:context.marches.filter(m=>m.report&&(m.source===actor||m.target===actor)).sort((a,b)=>b.report.at-a.report.at).slice(0,20).map(m=>({id:m.id,source:m.source,target:m.target,sourceCity:m.sourceCity||'capital',targetCity:m.targetCity||'capital',...copy(m.report)}))};
}
function committedWorld(context,patch,actor,now){
 // Build the public acknowledgement from the very same CAS patch that is
 // committed with the player snapshot. A follow-up read can race another
 // command, and omitting it leaves confirmed orders stale until polling.
 const next={...context,serverTime:now},merge=(rows,changes,key)=>{const all=new Map((rows||[]).map(row=>[row[key],row]));for(const change of changes||[])all.set(change[key],{...all.get(change[key]),...change});return [...all.values()];};
 next.players=merge(context.players,patch.players,'id');
 for(const key of ['cities','orders','marches'])next[key]=merge(context[key],patch[key],'id');
 next.heroes=merge(context.heroes,patch.heroes,'line');next.alliances=patch.alliances||context.alliances;next.memberships=patch.memberships||context.memberships;
 const changed=new Map((patch.players||[]).map(p=>[p.id,p.state]));
 next.map=(context.map||context.players).map(p=>{const state=changed.get(p.id);return state?{...p,name:state.ruler,level:capitalHall(state),policy:state.onlineRealm}:p;});
 return publicWorld(next,actor);
}
export async function handleRequest(store,actor,request,now){
 if(typeof actor!=='string'||!actor)throw new GameError('UNAUTHENTICATED','请先登录',401);
 if(!request||typeof request!=='object'||Array.isArray(request))throw new GameError('BAD_INPUT','请求格式无效');
 const realm=cleanRealm(request.realm||'china-1'),op=request.op;
 if(op==='private-load'){const save=await store.loadPrivate(actor);return {ok:true,serverTime:now,revision:save?.revision||0,state:save?.state||null};}
 if(op==='state'||op==='world'){
  const context=await store.context(actor,realm,request.targetId||null,now),row=context.players.find(p=>p.id===actor);
  if(!row)throw new GameError('NOT_JOINED','请先创建共享世界城池',404);
  // Idle reads project elapsed timers for display without replacing the stored
  // snapshot or incrementing revision. Commands settle the same elapsed time.
  const runtime=scopedRuntime(row.state,now,context.marches,actor,null);return {ok:true,serverTime:now,revision:row.revision,state:op==='state'?copy(runtime.Game.state):undefined,world:publicWorld(context,actor)};
 }
 if(!['create-realm','private-save','command'].includes(op))throw new GameError('BAD_OP','未知请求');
 const input={commandId:request.commandId,expectedRevision:request.expectedRevision,type:request.type||op,args:request.args||[],sourceCity:request.sourceCity||'capital'};validateInput(input);
 const scope=op==='private-save'?'private':realm,payloadHash=await digest({op,realm,type:input.type,args:input.args,sourceCity:input.sourceCity,state:op==='private-save'?request.state:undefined});
 const receipt=await store.receipt(actor,scope,input.commandId);
 if(receipt){if(receipt.hash!==payloadHash)throw new GameError('ID_REUSED','操作编号已用于不同请求',409);return {...receipt.response,replayed:true};}
 if(op==='private-save'){
  if(!request.state||typeof request.state!=='object'||Array.isArray(request.state))throw new GameError('BAD_SAVE','请选择需要同步的私人存档');
  if(JSON.stringify(request.state||{}).length>3000000)throw new GameError('SAVE_TOO_LARGE','存档超过同步大小限制',413);
  let runtime;try{runtime=createGameRuntime({snapshot:request.state,now});}catch{throw new GameError('BAD_SAVE','此私人存档未通过校验，请保留本地导出文件');}const response={ok:true,serverTime:now,revision:input.expectedRevision+1,state:copy(runtime.Game.state)};
  return store.savePrivate(actor,input,response,payloadHash,now);
 }
 if(op==='create-realm'){
  if(request.state!==undefined||input.args.length)throw new GameError('CLIENT_SNAPSHOT_FORBIDDEN','共享世界必须使用服务器新档');
  const runtime=createGameRuntime({now}),state=copy(runtime.Game.state);state.speed=1;state.onlineRealm={version:1,joinedAt:now,protectionUntil:now+WAR_RULES.newbieMs,peaceUntil:0,peaceCooldown:0,declarations:[],events:[]};
  return store.join(actor,realm,input,state,worldSeed(runtime),payloadHash,now);
 }
 if(request.state!==undefined)throw new GameError('CLIENT_SNAPSHOT_FORBIDDEN','共享指令不能上传客户端状态');
 const context=await store.context(actor,realm,input.args[0]?.targetId||null,now,input.type==='shared.settle'),player=context.players.find(p=>p.id===actor);
 if(!player)throw new GameError('NOT_JOINED','请先创建共享世界城池',404);
 if(player.revision!==input.expectedRevision)throw new GameError('REVISION_CONFLICT','其他设备已更新进度，请重新读取；本地进度仍可导出',409);
 if(input.type!=='shared.settle'&&context.marches.some(m=>(m.source===actor||m.target===actor||m.source===input.args[0]?.targetId||m.target===input.args[0]?.targetId)&&(m.status==='march'&&m.arrive<=now||m.status==='return'&&m.returnAt<=now)))throw new GameError('SETTLEMENT_REQUIRED','有部队已抵达，请先结算共享行军',409);
 let patch;
 if(input.type.startsWith('shared.'))patch=applyWorldCommand(context,input,now);
 else{
  if(input.type==='dispatch'&&context.cities.some(c=>c.id===input.args[0]&&c.owner&&c.owner!==actor))throw new GameError('PLAYER_CITY','此城已归属玩家，请通过共享世界出征');
  const reserved=new Set(context.marches.filter(m=>m.source===actor&&m.status!=='done').map(m=>m.general));
  const ids=input.type==='heritage.assign'?input.args.slice(0,3):['dispatch','dispatchScout'].includes(input.type)?[input.args[1]]:input.type==='hero.equip'?[input.args[1],player.state.equipment.find(e=>e.id===input.args[0])?.hero]:input.type==='hero.unequip'?[player.state.equipment.find(e=>e.id===input.args[0])?.hero]:['setGovernor','trainGeneralSkill','hero.allocate','hero.reset','hero.drill','payHeroArrears','sendTransport','redeployArmy'].includes(input.type)?input.type==='sendTransport'?[input.args[3]]:input.type==='redeployArmy'?[input.args[2]]:[input.args[0]]:[];
  if(ids.some(id=>reserved.has(id)))throw new GameError('GENERAL_BUSY','该将领正在共享世界行军');
  const seed=crypto.getRandomValues(new Uint32Array(1))[0],random=seededRandom(seed),runtime=scopedRuntime(player.state,now,context.marches,actor,input.sourceCity,random),executed=executeGame(player.state,input,now,random,runtime);
  patch={players:[{id:actor,expectedRevision:player.revision,state:executed.state}],heroes:[],cities:[],marches:[],result:executed.result};
  for(const captive of executed.state.wildGenerals.captives){
   if(player.state.wildGenerals.captives.some(c=>c.id===captive.id))continue;
   const hero=context.heroes.find(h=>h.line===captive.line);if(!hero)continue;
   if(!hero.owner&&hero.pendingAt!==null&&hero.pendingAt!==undefined&&hero.pendingAt<=now)throw new GameError('SETTLEMENT_REQUIRED','名将争夺已有部队先到，请先结算共享行军',409);
   if(hero.owner&&hero.owner!==actor){
    executed.state.wildGenerals.captives=executed.state.wildGenerals.captives.filter(c=>c.id!==captive.id);const rumor=executed.state.wildGenerals.rumors.find(r=>r.id===captive.id);if(rumor)rumor.status='released';
    const record=executed.state.reports.find(r=>r.wildGeneral?.id===captive.id);if(record)record.wildGeneral={...record.wildGeneral,status:'released',loyalty:0,reason:'此名将已被其他玩家抢先俘获'};
   }else patch.heroes.push({...hero,owner:actor,status:'captured',version:hero.version+1,expectedVersion:hero.version});
  }
  for(const hero of context.heroes.filter(h=>h.owner===actor)){
   const alive=executed.state.generals.some(id=>executed.state.customGenerals.find(g=>g.id===id&&g.wildLine===hero.line)),held=executed.state.wildGenerals.captives.some(c=>c.line===hero.line)||executed.state.heroService?.captives.some(c=>c.hero.wildLine===hero.line);
   if(alive&&hero.status!=='owned')patch.heroes.push({...hero,status:'owned',version:hero.version+1,expectedVersion:hero.version});
   else if(!alive&&!held)patch.heroes.push({...hero,owner:null,status:'wild',version:hero.version+1,expectedVersion:hero.version});
  }
  for(const city of context.cities){
   if(!executed.state.conquered[city.id]||player.state.conquered[city.id])continue;
   if(city.owner&&city.owner!==actor)throw new GameError('CITY_TAKEN','此城市已归属其他玩家',409);
   patch.cities.push({...city,owner:actor,version:city.version+1,expectedVersion:city.version});
  }
  for(const city of Object.values(executed.state.realm.cities)){
   if(city.capital||player.state.realm.cities[city.id]||patch.cities.some(c=>c.id===city.node))continue;
   const previous=context.cities.find(c=>c.id===city.node);
   if(previous?.owner&&previous.owner!==actor||context.map?.some(p=>p.home.x===city.x&&p.home.y===city.y)||context.cities.some(c=>c.id!==city.node&&c.x===city.x&&c.y===city.y))throw new GameError('CITY_TAKEN','此城址已被其他城市占用',409);
   patch.cities.push({id:city.node,name:city.name,x:city.x,y:city.y,openCity:true,owner:actor,version:(previous?.version||0)+1,expectedVersion:previous?.version??null});
  }
 }
 const state=patch.players.find(p=>p.id===actor)?.state||player.state;
 const response={ok:true,serverTime:now,revision:player.revision+1,state,result:patch.result,world:committedWorld(context,patch,actor,now)};
 return store.commit(actor,realm,input,patch,response,payloadHash,now);
}
