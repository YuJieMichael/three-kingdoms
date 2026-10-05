const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),os=require('node:os'),path=require('node:path');
test('SQLite local Auth, native commands, refresh, restart persistence, and logout revocation',async context=>{
 try{require('node:sqlite');}catch{context.skip('Local SQLite server requires Node 22.13+; core/Edge modules also run on Node 20.');return;}
 const {openLocalServer}=await import('../online/local-server.mjs'),directory=fs.mkdtempSync(path.join(os.tmpdir(),'three-kingdoms-online-'));let app=await openLocalServer({port:0,database:path.join(directory,'private.sqlite')});
 const post=async(route,body,token)=>{const response=await fetch(app.url+route,{method:'POST',headers:{'Content-Type':'application/json',...(token?{Authorization:'Bearer '+token}:{})},body:JSON.stringify(body)});return {status:response.status,data:await response.json()};};
 try{
  const preflight=await fetch(app.url+'/auth/v1/signup',{method:'OPTIONS',headers:{Origin:'http://127.0.0.1:8137','Access-Control-Request-Method':'POST','Access-Control-Request-Headers':'apikey,content-type,x-supabase-api-version'}});assert.equal(preflight.status,204);assert.match(preflight.headers.get('access-control-allow-headers'),/x-supabase-api-version/);
  const unauth=await post('/functions/v1/game-api',{op:'state'});assert.equal(unauth.status,401);
  const signup=await post('/auth/v1/signup',{email:'local-qa@example.test',password:'local-development-123'});assert.equal(signup.status,200);assert.ok(signup.data.access_token);const token=signup.data.access_token;
  assert.equal((await post('/auth/v1/token?grant_type=password',{email:'local-qa@example.test',password:'incorrect-password'})).status,401);
  const created=await post('/functions/v1/game-api',{op:'create-realm',commandId:'local_create_0001',expectedRevision:0},token);assert.equal(created.status,200);assert.equal(created.data.state.speed,1);
  const commanded=await post('/functions/v1/game-api',{op:'command',commandId:'local_tax_000001',expectedRevision:1,type:'setTax',args:[32]},token);assert.equal(commanded.data.state.tax,32);assert.equal(commanded.data.revision,2);
  await app.close();app=await openLocalServer({port:0,database:path.join(directory,'private.sqlite')});
  const loaded=await post('/functions/v1/game-api',{op:'state'},token);assert.equal(loaded.data.revision,2);assert.equal(loaded.data.state.tax,32);
  const refreshed=await post('/auth/v1/token?grant_type=refresh_token',{refresh_token:signup.data.refresh_token});assert.equal(refreshed.status,200);assert.notEqual(refreshed.data.access_token,token);
  const newToken=refreshed.data.access_token;assert.equal((await post('/auth/v1/logout',{},newToken)).status,200);assert.equal((await post('/functions/v1/game-api',{op:'state'},newToken)).status,401);
  const bytes=fs.readFileSync(path.join(directory,'private.sqlite'));assert.equal(bytes.includes(Buffer.from('local-development-123')),false);
 }finally{await app.close();fs.rmSync(directory,{recursive:true,force:true});}
});
