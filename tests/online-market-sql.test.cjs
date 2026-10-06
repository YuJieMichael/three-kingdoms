const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs/promises'),path=require('node:path');
test('war-market migrations run unmodified in PostgreSQL with escrow CAS, persisted diplomacy and service-only RLS',async()=>{
 const {PGlite}=await import('@electric-sql/pglite'),db=await PGlite.create(),A='00000000-0000-4000-8000-000000000001',B='00000000-0000-4000-8000-000000000002',C='00000000-0000-4000-8000-000000000003',realm='market-sql';
 const role=async(name,fn)=>db.transaction(async tx=>{await tx.exec('SET LOCAL ROLE '+name);return fn(tx);});
 const rpc=async(tx,name,args)=>Object.values((await tx.query('SELECT public.online_game_'+name+'('+args.map((_,i)=>'$'+(i+1)).join(',')+')',args)).rows[0])[0];
 const commit=(id,patch)=>role('service_role',tx=>rpc(tx,'commit',[A,realm,id,'hash_'+id,patch,{ok:true}]));
 const state={ruler:'甲城',buildings:{hall:1},realm:{cities:{capital:{data:{buildings:{hall:5}}}}},res:{food:1000,gold:1000},onlineRealm:{protectionUntil:12345,peaceUntil:0}};
 try{
  await db.exec(`CREATE ROLE anon NOLOGIN;CREATE ROLE authenticated NOLOGIN;CREATE ROLE service_role NOLOGIN BYPASSRLS;CREATE SCHEMA auth;CREATE TABLE auth.users(id uuid PRIMARY KEY);CREATE TABLE auth.sessions(id uuid PRIMARY KEY,user_id uuid REFERENCES auth.users(id));CREATE FUNCTION auth.uid() RETURNS uuid LANGUAGE sql STABLE AS $$SELECT nullif(current_setting('request.jwt.claim.sub',true),'')::uuid$$;INSERT INTO auth.users VALUES('${A}'),('${B}'),('${C}');`);
  const folder=path.resolve(__dirname,'../supabase/migrations');for(const file of (await fs.readdir(folder)).filter(f=>/^\d+_.*\.sql$/.test(f)).sort())await db.exec(await fs.readFile(path.join(folder,file),'utf8'));
  for(const id of [A,B,C])await role('service_role',tx=>rpc(tx,'join',[id,realm,'join_'+id,0,'hash',state,{heroes:[],cities:[]},1800000000000]));
  const order={id:'sql-order',seller:A,sellerCity:'capital',resource:'food',price:2,quantity:500,remaining:500,sold:0,status:'open',version:0,origin:{x:32,y:32}};
  await commit('sql-create',{players:[{id:A,expectedRevision:1,state:{...state,res:{food:500,gold:1000}}}],orders:[{...order,expectedVersion:null}],heroes:[],cities:[],marches:[]});
  const loaded=await role('service_role',tx=>rpc(tx,'context',[A,realm,B,false]));assert.equal(loaded.orders[0].remaining,500);assert.equal(loaded.map[0].policy.protectionUntil,12345);assert.equal(loaded.map.find(p=>p.id===A).level,5);
  await commit('sql-fill',{players:[{id:A,expectedRevision:2,state:{...state,res:{food:500,gold:1000}}}],orders:[{...order,remaining:300,sold:200,version:1,expectedVersion:0}],heroes:[],cities:[],marches:[{id:'sql-delivery',source:A,target:B,kind:'trade',status:'march',arrive:1800000001000,returnAt:null,version:0,expectedVersion:null,resource:'food',quantity:200,gold:400}]});
  await assert.rejects(commit('sql-stale',{players:[{id:A,expectedRevision:3,state}],orders:[{...order,remaining:0,version:1,expectedVersion:0}],heroes:[],cities:[],marches:[]}),/REVISION_CONFLICT/);
  assert.equal((await db.query('SELECT revision FROM public.online_players WHERE realm=$1 AND user_id=$2',[realm,A])).rows[0].revision,3);
  const alliance={id:'sql-alliance',leader:A,name:'青溪盟',relations:{other:{status:'enemy',startsAt:1800001000000}},marks:[{id:'mark',x:10,y:20,kind:'defend',note:'守备',expiresAt:1800010000000}]};
  await commit('sql-alliance',{players:[{id:A,expectedRevision:3,state}],heroes:[],cities:[],marches:[],allianceExpected:0,alliances:[alliance],memberships:[{user:A,alliance:alliance.id,role:'leader'}]});
  const world=await role('service_role',tx=>rpc(tx,'context',[A,realm,null,false]));assert.deepEqual(world.alliances[0].relations,alliance.relations);assert.equal(world.alliances[0].marks[0].note,'守备');assert.equal(world.orders[0].remaining,300);
  // A third player's stationed aid must be loaded with the target so its own
  // hospital can be changed under that player's revision at battle settlement.
  await commit('sql-context-aid',{players:[{id:A,expectedRevision:4,state}],heroes:[],cities:[],orders:[],marches:[{id:'sql-aid',source:C,target:B,kind:'aid',status:'stationed',arrive:1800000000000,returnAt:null,version:0,expectedVersion:null,army:{spear:100},general:'lin'},{id:'sql-target-departure',source:B,target:C,kind:'pvp',status:'march',arrive:1800000000001,returnAt:null,version:0,expectedVersion:null,army:{cavalry:10},general:'su'}]});
  const defense=await role('service_role',tx=>rpc(tx,'context',[A,realm,B,false]));assert.ok(defense.players.some(p=>p.id===C));assert.ok(defense.marches.some(m=>m.id==='sql-aid'));assert.ok(defense.marches.some(m=>m.id==='sql-target-departure'));
  for(const table of ['online_market_orders','online_alliance_details']){assert.equal((await db.query("SELECT relrowsecurity FROM pg_class WHERE oid=$1::regclass",['public.'+table])).rows[0].relrowsecurity,true);for(const userRole of ['anon','authenticated'])await assert.rejects(role(userRole,tx=>tx.query('SELECT * FROM public.'+table)),/permission denied/);}
  await assert.rejects(role('authenticated',tx=>rpc(tx,'context',[A,realm,null,false])),/permission denied/);
 }finally{await db.close();}
});
