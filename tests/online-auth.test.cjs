const {test}=require('node:test'),assert=require('node:assert/strict');
test('Edge Auth trusts verified getUser identity and checks revocation against matching live session',async()=>{
 const {createSupabaseAuthenticator}=await import('../online/auth.mjs'),id='00000000-0000-4000-a000-000000000001',session='00000000-0000-4000-a000-000000000002',calls=[];
 const token='header.'+Buffer.from(JSON.stringify({sub:'attacker-supplied-sub',session_id:session})).toString('base64url')+'.signature',request=new Request('https://example.test/api',{headers:{Authorization:'Bearer '+token}});
 let live=true,valid=true,anonymous=false;
 const auth=createSupabaseAuthenticator({url:'https://example.test',publicKey:'sb_publishable_test',store:{key:'sb_secret_test',session:async(user,sid)=>{calls.push([user,sid]);return live;}},fetcher:async(url,options)=>{assert.equal(url,'https://example.test/auth/v1/user');assert.equal(options.headers.Authorization,'Bearer '+token);assert.equal(options.headers.apikey,'sb_publishable_test');return new Response(JSON.stringify({id,is_anonymous:anonymous}),{status:valid?200:401});}});
 assert.equal(await auth(request),id);assert.deepEqual(calls,[[id,session]]);live=false;await assert.rejects(auth(request),e=>e.code==='SESSION_REVOKED');live=true;anonymous=true;await assert.rejects(auth(request),e=>e.code==='ACCOUNT_REQUIRED');anonymous=false;valid=false;await assert.rejects(auth(request),e=>e.code==='UNAUTHENTICATED');
});
test('Supabase RPC uses service apikey without treating a new secret key as a JWT, with exact argument signatures',async()=>{
 const {SupabaseStore}=await import('../online/supabase-store.mjs'),calls=[],store=new SupabaseStore({url:'https://example.test/',key:'sb_secret_test',fetcher:async(url,options)=>{calls.push({url,headers:options.headers,args:JSON.parse(options.body)});return Response.json({ok:true});}});
 await store.savePrivate('actor',{commandId:'id_0000001',expectedRevision:0},{state:{},revision:1},'hash',1);assert.deepEqual(Object.keys(calls[0].args).sort(),['p_actor','p_expected','p_hash','p_id','p_response']);assert.equal(calls[0].headers.apikey,'sb_secret_test');assert.equal(calls[0].headers.Authorization,undefined);assert.equal(calls[0].url,'https://example.test/rest/v1/rpc/online_game_private_save');
 await store.context('00000000-0000-4000-a000-000000000001','china-1',null,1,true);assert.equal(calls[1].args.p_settle,true);assert.throws(()=>store.context('actor','china-1','malformed',1),e=>e.code==='BAD_TARGET');
});
