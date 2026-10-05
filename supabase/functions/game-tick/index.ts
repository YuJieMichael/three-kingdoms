import {SupabaseStore} from '../_shared/online/supabase-store.mjs';
import {handleRequest} from '../_shared/online/service.mjs';
const url=Deno.env.get('SUPABASE_URL')||'',key=Deno.env.get('SUPABASE_SECRET_KEY')||Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')||'',tickToken=Deno.env.get('GAME_TICK_TOKEN')||'';
const store=new SupabaseStore({url,key});
function matches(value:string,secret:string){if(value.length!==secret.length)return false;let delta=0;for(let i=0;i<value.length;i++)delta|=value.charCodeAt(i)^secret.charCodeAt(i);return delta===0;}
Deno.serve(async request=>{
 const token=request.headers.get('authorization')?.replace(/^Bearer\s+/i,'')||'';
 if(request.method!=='POST'||request.headers.has('origin')||tickToken.length<32||!matches(token,tickToken))return new Response('Unauthorized',{status:401});
 try{const now=await store.time(),rows=await store.due(),results=[];
  for(const row of rows){try{await handleRequest(store,row.actor,{op:'command',realm:row.realm,commandId:'tick_'+now+'_'+row.actor.replace(/-/g,''),expectedRevision:row.revision,type:'shared.settle',args:[{}]},now);results.push({realm:row.realm,ok:true});}catch(error){results.push({realm:row.realm,ok:false,code:error.code||'INTERNAL_ERROR'});}}
  return Response.json({ok:true,settlements:results});
 }catch{return Response.json({ok:false,error:'Worker database unavailable'},{status:503});}
});
