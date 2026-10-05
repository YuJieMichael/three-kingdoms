// Generated from online/http.mjs by build-online-runtime.cjs.
import {GameError} from './runtime.mjs';
import {handleRequest} from './service.mjs';
export async function readBody(request){
 const reader=request.body?.getReader();if(!reader)throw new GameError('BAD_INPUT','请求内容为空');
 let size=0;const chunks=[];while(true){const {done,value}=await reader.read();if(done)break;size+=value.byteLength;if(size>3100000){await reader.cancel();throw new GameError('BODY_TOO_LARGE','请求超过同步大小限制',413);}chunks.push(value);}
 const bytes=new Uint8Array(size);let offset=0;for(const chunk of chunks){bytes.set(chunk,offset);offset+=chunk.length;}
 try{return JSON.parse(new TextDecoder().decode(bytes));}catch{throw new GameError('BAD_INPUT','请求 JSON 格式无效');}
}
export function createHandler({store,authenticate,allowedOrigins=[]}){
 return async request=>{
  const origin=request.headers.get('origin'),headers={'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store','Vary':'Origin'};
  if(origin&&allowedOrigins.includes(origin)){headers['Access-Control-Allow-Origin']=origin;headers['Access-Control-Allow-Headers']='authorization, apikey, content-type, x-client-info';headers['Access-Control-Allow-Methods']='POST, OPTIONS';}
  const reply=(data,status=200)=>new Response(JSON.stringify(data),{status,headers});
  if(origin&&!allowedOrigins.includes(origin))return reply({ok:false,error:{code:'ORIGIN_FORBIDDEN',message:'此网站未获准访问游戏服务'}},403);
  if(request.method==='OPTIONS')return new Response(null,{status:204,headers});
  if(request.method!=='POST')return reply({ok:false,error:{code:'METHOD_NOT_ALLOWED',message:'请使用 POST 请求'}},405);
  try{const actor=await authenticate(request),body=await readBody(request),now=store.time?await store.time():Date.now();return reply(await handleRequest(store,actor,body,now));}
  catch(error){const known=error instanceof GameError;return reply({ok:false,error:{code:known?error.code:'INTERNAL_ERROR',message:known?error.message:'服务器暂时无法处理此操作'}},known?error.status:500);}
 };
}
