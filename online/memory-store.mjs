import {copy,GameError} from './runtime.mjs';
import {capitalHall} from './realm-systems.mjs';
const conflict=()=>{throw new GameError('REVISION_CONFLICT','其他设备或玩家已更新状态，请重新读取',409);};
export class MemoryStore {
 constructor(data={}){this.data={players:[],heroes:[],cities:[],marches:[],orders:[],alliances:[],memberships:[],allianceVersions:{},private:[],receipts:[],...copy(data)};}
 async loadPrivate(actor){return copy(this.data.private.find(p=>p.id===actor)||null);}
 async receipt(actor,realm,id){return copy(this.data.receipts.find(r=>r.actor===actor&&r.realm===realm&&r.id===id)||null);}
 record(actor,realm,id,hash,response){this.data.receipts.push({actor,realm,id,hash,response:copy(response)});}
 async savePrivate(actor,input,response,hash){
  const previous=this.data.receipts.find(r=>r.actor===actor&&r.realm==='private'&&r.id===input.commandId);if(previous){if(previous.hash!==hash)throw new GameError('ID_REUSED','操作编号重复',409);return {...copy(previous.response),replayed:true};}
  const row=this.data.private.find(p=>p.id===actor);if((row?.revision||0)!==input.expectedRevision)conflict();
  const next={id:actor,revision:response.revision,state:copy(response.state)};if(row)this.data.private[this.data.private.indexOf(row)]=next;else this.data.private.push(next);this.record(actor,'private',input.commandId,hash,response);return copy(response);
 }
 async join(actor,realm,input,state,seed,hash,now){
  const previous=this.data.receipts.find(r=>r.actor===actor&&r.realm===realm&&r.id===input.commandId);if(previous){if(previous.hash!==hash)throw new GameError('ID_REUSED','操作编号重复',409);return {...copy(previous.response),replayed:true};}
  if(this.data.players.some(p=>p.id===actor&&p.realm===realm))conflict();if(input.expectedRevision!==0)conflict();
  for(const h of seed.heroes)if(!this.data.heroes.some(row=>row.realm===realm&&row.line===h.line))this.data.heroes.push({...copy(h),realm});
  for(const c of seed.cities)if(!this.data.cities.some(row=>row.realm===realm&&row.id===c.id))this.data.cities.push({...copy(c),realm});
  const positions=Array.from({length:3600},(_,i)=>({x:2+i%60,y:2+Math.floor(i/60)})).sort((a,b)=>(a.x-32)**2+(a.y-32)**2-(b.x-32)**2-(b.y-32)**2||a.y-b.y||a.x-b.x);const home=positions.find(pos=>!this.data.players.some(p=>p.realm===realm&&p.home.x===pos.x&&p.home.y===pos.y)&&!this.data.cities.some(c=>c.realm===realm&&c.x===pos.x&&c.y===pos.y));
  if(!home)throw new GameError('WORLD_FULL','世界城池位置已满');
  state.onlineRealm={version:1,joinedAt:now,protectionUntil:now+72*3600000,peaceUntil:0,peaceCooldown:0,declarations:[],events:[]};
  const row={id:actor,realm,revision:1,state:copy(state),home,name:state.ruler,level:capitalHall(state)};this.data.players.push(row);
  const response={ok:true,serverTime:now,revision:1,state:copy(state),home};this.record(actor,realm,input.commandId,hash,response);return copy(response);
 }
 async context(actor,realm,target,now){
  // Local harness includes all canonical rows to exercise cross-player atomic
  // settlement. The hosted SQL loader only supplies actor/target/due participants.
  const filter=key=>copy(this.data[key].filter(row=>row.realm===realm));
  const heroes=filter('heroes').map(h=>{const pending=this.data.marches.filter(m=>m.realm===realm&&m.kind==='hunt'&&m.line===h.line&&m.status==='march');return {...h,pendingAt:pending.length?Math.min(...pending.map(m=>m.arrive)):null};});
  return {actor,serverTime:now,players:filter('players'),map:filter('players').map(p=>({id:p.id,name:p.state.ruler,home:p.home,level:capitalHall(p.state),policy:copy(p.state.onlineRealm||{})})),heroes,cities:filter('cities'),orders:filter('orders'),marches:filter('marches'),alliances:filter('alliances'),memberships:filter('memberships'),allianceRevision:this.data.allianceVersions[realm]||0};
 }
 async commit(actor,realm,input,patch,response,hash){
  const previous=this.data.receipts.find(r=>r.actor===actor&&r.realm===realm&&r.id===input.commandId);if(previous){if(previous.hash!==hash)throw new GameError('ID_REUSED','操作编号重复',409);return {...copy(previous.response),replayed:true};}
  for(const p of patch.players){const row=this.data.players.find(row=>row.realm===realm&&row.id===p.id);if(!row||row.revision!==p.expectedRevision)conflict();}
  for(const h of patch.heroes||[]){const row=this.data.heroes.find(row=>row.realm===realm&&row.line===h.line);if(!row||row.version!==h.expectedVersion)conflict();}
  for(const c of patch.cities||[]){const row=this.data.cities.find(row=>row.realm===realm&&row.id===c.id);if(c.expectedVersion===null?!!row:!row||row.version!==c.expectedVersion)conflict();if(c.expectedVersion===null&&(this.data.players.some(p=>p.realm===realm&&p.home.x===c.x&&p.home.y===c.y)||this.data.cities.some(v=>v.realm===realm&&v.x===c.x&&v.y===c.y)))conflict();}
  for(const m of patch.marches||[]){const row=this.data.marches.find(row=>row.realm===realm&&row.id===m.id);if(m.expectedVersion===null?!!row:!row||row.version!==m.expectedVersion)conflict();}
  for(const o of patch.orders||[]){const row=this.data.orders.find(row=>row.realm===realm&&row.id===o.id);if(o.expectedVersion===null?!!row:!row||row.version!==o.expectedVersion)conflict();}
  if(patch.allianceExpected!==undefined&&patch.allianceExpected!==(this.data.allianceVersions[realm]||0))conflict();
  const next=copy(this.data);
  for(const p of patch.players){const row=next.players.find(row=>row.realm===realm&&row.id===p.id);row.state=copy(p.state);row.revision++;row.name=p.state.ruler;row.level=capitalHall(p.state);}
  for(const [key,id]of [['heroes','line'],['cities','id'],['marches','id'],['orders','id']])for(const value of patch[key]||[]){const row=next[key].find(row=>row.realm===realm&&row[id]===value[id]);const replacement={...copy(value),realm};delete replacement.expectedVersion;if(row)next[key][next[key].indexOf(row)]=replacement;else next[key].push(replacement);}
  for(const key of ['alliances','memberships'])if(patch[key])next[key]=[...next[key].filter(row=>row.realm!==realm),...copy(patch[key]).map(row=>({...row,realm}))];
  if(patch.memberships)next.allianceVersions[realm]=(next.allianceVersions[realm]||0)+1;
  this.data=next;this.record(actor,realm,input.commandId,hash,response);return copy(response);
 }
}
