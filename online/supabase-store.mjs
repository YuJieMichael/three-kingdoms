import {GameError} from './runtime.mjs';
const messages={REVISION_CONFLICT:'其他设备或玩家已更新进度，请重新读取',ID_REUSED:'操作编号已用于不同请求',RATE_LIMITED:'操作太频繁，请稍后重试',WORLD_FULL:'世界城池位置已满',ACTOR_REQUIRED:'服务器操作缺少玩家状态'};
export class SupabaseStore {
 constructor({url,key,fetcher=fetch}){this.url=url.replace(/\/$/,'');this.key=key;this.fetcher=fetcher;}
 async rpc(name,args={}){
  const headers={'Content-Type':'application/json',apikey:this.key};
  // New secret keys identify the service role through apikey and are not JWTs.
  if(this.key.startsWith('eyJ'))headers.Authorization='Bearer '+this.key;
  const response=await this.fetcher(this.url+'/rest/v1/rpc/online_game_'+name,{method:'POST',headers,body:JSON.stringify(args)});
  let data;try{data=await response.json();}catch{throw new GameError('DATABASE_UNAVAILABLE','游戏数据库暂时不可用',503);}
  if(!response.ok){const code=Object.keys(messages).find(code=>data.message?.includes(code));throw new GameError(code||'DATABASE_ERROR',messages[code]||'游戏数据库请求失败',code==='RATE_LIMITED'?429:code?409:503);}
  return data;
 }
 async time(){return Number(await this.rpc('time'));}
 session(actor,session){return this.rpc('session',{p_user:actor,p_session:session});}
 loadPrivate(actor){return this.rpc('private_load',{p_actor:actor});}
 receipt(actor,realm,id){return this.rpc('receipt',{p_actor:actor,p_realm:realm,p_id:id});}
 savePrivate(actor,input,response,hash){return this.rpc('private_save',{p_actor:actor,p_id:input.commandId,p_expected:input.expectedRevision,p_hash:hash,p_response:response});}
 due(){return this.rpc('due');}
 join(actor,realm,input,state,seed,hash,now){return this.rpc('join',{p_actor:actor,p_realm:realm,p_id:input.commandId,p_expected:input.expectedRevision,p_hash:hash,p_state:state,p_seed:seed,p_now:now});}
 context(actor,realm,target,now,settle=false){
  if(target!==null&&(typeof target!=='string'||!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(target)))throw new GameError('BAD_TARGET','目标玩家编号无效');
  return this.rpc('context',{p_actor:actor,p_realm:realm,p_target:target,p_settle:settle});
 }
 commit(actor,realm,input,patch,response,hash){return this.rpc('commit',{p_actor:actor,p_realm:realm,p_id:input.commandId,p_hash:hash,p_patch:patch,p_response:response});}
}
