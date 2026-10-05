// Local development uses the same authoritative command reducer as the Edge
// function. Production identity, transactions and persistence use Supabase.
import http from 'node:http';
import {randomBytes,randomUUID,scryptSync,timingSafeEqual,createHash} from 'node:crypto';
import {mkdirSync} from 'node:fs';
import {dirname,resolve} from 'node:path';
import {homedir} from 'node:os';
import {pathToFileURL} from 'node:url';
import {MemoryStore} from './memory-store.mjs';
import {createHandler,readBody} from './http.mjs';
import {GameError} from './runtime.mjs';
import {handleRequest} from './service.mjs';
const hash=value=>createHash('sha256').update(value).digest('hex');
export async function openLocalServer({port=8140,database=resolve(homedir(),'.local/share/three-kingdoms/online.sqlite'),host='127.0.0.1',allowedOrigins=['http://127.0.0.1:8137','http://localhost:8137']}={}){
 // SQLite is bundled with Node 22.13+; no database file is written inside the
 // static game directory, so the existing development web server cannot leak it.
 const {DatabaseSync}=await import('node:sqlite');mkdirSync(dirname(database),{recursive:true});const db=new DatabaseSync(database);
 db.exec('PRAGMA journal_mode=WAL; PRAGMA busy_timeout=5000; CREATE TABLE IF NOT EXISTS canonical(id INTEGER PRIMARY KEY CHECK(id=1),data TEXT NOT NULL); CREATE TABLE IF NOT EXISTS users(id TEXT PRIMARY KEY,email TEXT UNIQUE NOT NULL,salt TEXT NOT NULL,password TEXT NOT NULL); CREATE TABLE IF NOT EXISTS sessions(access TEXT PRIMARY KEY,refresh TEXT UNIQUE NOT NULL,user_id TEXT NOT NULL,expires INTEGER NOT NULL,refresh_expires INTEGER NOT NULL);');
 class PersistentStore extends MemoryStore{
  constructor(){super(JSON.parse(db.prepare('SELECT data FROM canonical WHERE id=1').get()?.data||'{}'));}
  flush(){db.prepare('INSERT INTO canonical VALUES(1,?) ON CONFLICT(id) DO UPDATE SET data=excluded.data').run(JSON.stringify(this.data));}
  async time(){return Date.now();}
  async commit(...args){const response=await super.commit(...args);this.flush();return response;}
  async join(...args){const response=await super.join(...args);this.flush();return response;}
  async savePrivate(...args){const response=await super.savePrivate(...args);this.flush();return response;}
 }
 const store=new PersistentStore();
 const userJSON=user=>({id:user.id,email:user.email,app_metadata:{provider:'email',providers:['email']},user_metadata:{},aud:'authenticated',role:'authenticated',created_at:new Date().toISOString(),is_anonymous:false});
 function session(user){const access=randomBytes(32).toString('base64url'),refresh=randomBytes(32).toString('base64url'),now=Date.now();db.prepare('INSERT INTO sessions VALUES(?,?,?,?,?)').run(hash(access),hash(refresh),user.id,now+3600000,now+30*86400000);return {access_token:access,refresh_token:refresh,expires_in:3600,expires_at:Math.floor(now/1000)+3600,token_type:'bearer',user:userJSON(user)};}
 function authenticated(request){const token=request.headers.get('authorization')?.match(/^Bearer\s+(.+)$/i)?.[1],row=token&&db.prepare('SELECT user_id,expires FROM sessions WHERE access=?').get(hash(token));if(!row||row.expires<=Date.now())throw new GameError('UNAUTHENTICATED','请先登录',401);return row.user_id;}
 const handle=createHandler({store,authenticate:authenticated,allowedOrigins});
 const attempts=new Map();
 const server=http.createServer(async (incoming,outgoing)=>{
  let response;try{
   const chunks=[];let size=0;for await(const chunk of incoming){size+=chunk.length;if(size>3100000)throw new GameError('BODY_TOO_LARGE','请求过大',413);chunks.push(chunk);}
   const body=Buffer.concat(chunks),request=new Request('http://'+host+':'+port+incoming.url,{method:incoming.method,headers:incoming.headers,...(body.length?{body}:{}),duplex:'half'}),url=new URL(request.url),origin=request.headers.get('origin');
   const headers={'Content-Type':'application/json','Cache-Control':'no-store','Vary':'Origin'};if(origin&&allowedOrigins.includes(origin)){headers['Access-Control-Allow-Origin']=origin;headers['Access-Control-Allow-Headers']='authorization, apikey, content-type, x-client-info, x-supabase-api-version';headers['Access-Control-Allow-Methods']='GET, POST, OPTIONS';}
   const reply=(data,status=200)=>new Response(JSON.stringify(data),{status,headers});
   if(origin&&!allowedOrigins.includes(origin))throw new GameError('ORIGIN_FORBIDDEN','此网站未获准访问游戏服务',403);
   if(request.method==='OPTIONS')response=new Response(null,{status:204,headers});
   else if(url.pathname==='/functions/v1/game-api')response=await handle(request);
   else if(url.pathname==='/auth/v1/user'&&request.method==='GET'){const id=authenticated(request);response=reply(userJSON(db.prepare('SELECT * FROM users WHERE id=?').get(id)));}
   else if(url.pathname==='/auth/v1/logout'&&request.method==='POST'){const id=authenticated(request);db.prepare('DELETE FROM sessions WHERE user_id=?').run(id);response=reply({});}
   else if(['/auth/v1/signup','/auth/v1/token'].includes(url.pathname)&&request.method==='POST'){
    const key=incoming.socket.remoteAddress,bucket=attempts.get(key)||{at:Date.now(),count:0};if(Date.now()-bucket.at>60000){bucket.at=Date.now();bucket.count=0;}bucket.count++;attempts.set(key,bucket);if(bucket.count>30)throw new GameError('RATE_LIMITED','登录尝试太频繁',429);
    const data=await readBody(request);let user;
    if(url.searchParams.get('grant_type')==='refresh_token'){const row=db.prepare('SELECT user_id FROM sessions WHERE refresh=? AND refresh_expires>?').get(hash(String(data.refresh_token||'')),Date.now());if(!row)throw new GameError('UNAUTHENTICATED','会话已过期',401);user=db.prepare('SELECT * FROM users WHERE id=?').get(row.user_id);db.prepare('DELETE FROM sessions WHERE refresh=?').run(hash(data.refresh_token));}
    else{const email=String(data.email||'').trim().toLowerCase(),password=data.password;if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)||email.length>254||typeof password!=='string'||password.length<10||password.length>1024)throw new GameError('BAD_CREDENTIALS','邮箱无效或密码少于 10 个字符');user=db.prepare('SELECT * FROM users WHERE email=?').get(email);
     if(url.pathname==='/auth/v1/signup'){if(user)throw new GameError('ACCOUNT_EXISTS','此邮箱已注册',409);const salt=randomBytes(16).toString('hex');user={id:randomUUID(),email,salt,password:scryptSync(password,salt,64).toString('hex')};db.prepare('INSERT INTO users VALUES(?,?,?,?)').run(user.id,email,user.salt,user.password);}
     else if(!user||!timingSafeEqual(Buffer.from(user.password,'hex'),scryptSync(password,user.salt,64)))throw new GameError('BAD_CREDENTIALS','邮箱或密码错误',401);
    }
    response=reply(session(user));
   }else response=reply({error:'Unknown local API route'},404);
  }catch(error){const origin=incoming.headers.origin,headers={'Content-Type':'application/json','Cache-Control':'no-store'};if(origin&&allowedOrigins.includes(origin))headers['Access-Control-Allow-Origin']=origin;response=new Response(JSON.stringify({ok:false,error:{code:error instanceof GameError?error.code:'INTERNAL_ERROR',message:error instanceof GameError?error.message:'本地服务暂时不可用'},msg:error instanceof GameError?error.message:'Local API error'}),{status:error instanceof GameError?error.status:500,headers});}
  outgoing.writeHead(response.status,Object.fromEntries(response.headers));outgoing.end(Buffer.from(await response.arrayBuffer()));
 });
 await new Promise((resolve,reject)=>{server.once('error',reject);server.listen(port,host,resolve);});
 let settling=false;
 const timer=setInterval(async()=>{if(settling)return;settling=true;try{const now=Date.now(),due=store.data.marches.filter(m=>m.status==='march'&&m.arrive<=now||m.status==='return'&&m.returnAt<=now);for(const key of [...new Set(due.map(m=>m.realm+':'+m.source))].slice(0,8)){const [realm,actor]=key.split(':'),row=store.data.players.find(p=>p.realm===realm&&p.id===actor);if(row)try{await handleRequest(store,actor,{op:'command',realm,commandId:'tick_'+now+'_'+actor.replace(/-/g,''),expectedRevision:row.revision,type:'shared.settle',args:[{}]},now);}catch{ /* A racing player command wins; next tick retries remaining arrivals. */ }}}finally{settling=false;}},15000);timer.unref();
 return {server,store,db,url:'http://'+host+':'+server.address().port,async close(){clearInterval(timer);await new Promise(resolve=>server.close(resolve));db.close();}};
}
if(process.argv[1]&&import.meta.url===pathToFileURL(resolve(process.argv[1])).href){const app=await openLocalServer({port:Number(process.env.GAME_PORT)||8140,database:process.env.GAME_DATABASE||undefined});console.log('Local authoritative API listening at '+app.url+' (SQLite; development only).');}
