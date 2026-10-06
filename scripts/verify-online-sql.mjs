// Dedicated local SQL QA; deliberately separate from the game's node:test suite.
// PGlite runs actual PostgreSQL in WASM on one connection. This checks SQL/RLS
// and sequential stale-write fencing, not multi-connection load or hosted Auth.
import assert from 'node:assert/strict';
import {readFile,readdir} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {PGlite} from '@electric-sql/pglite';

const directory=new URL('../supabase/migrations/',import.meta.url);
const migrationNames=(await readdir(directory)).filter(name=>/^\d+_.*\.sql$/.test(name)).sort();
assert.ok(migrationNames.length,'CLI-generated realm migrations must exist');
const migration=(await Promise.all(migrationNames.map(name=>readFile(new URL(name,directory),'utf8')))).join('\n');
const schemaHash=createHash('sha256').update(migration).digest('hex');
const db=await PGlite.create();
const A='00000000-0000-4000-8000-000000000001',B='00000000-0000-4000-8000-000000000002',C='00000000-0000-4000-8000-000000000003',D='00000000-0000-4000-8000-000000000004',E='00000000-0000-4000-8000-000000000005';
const session='10000000-0000-4000-8000-000000000001',realm='sql-qa';
const state=name=>({ruler:name,buildings:{hall:1},res:{food:100,gold:200}});
const seed={heroes:[{line:'wanderer',name:'陈岚',node:'wild_33_32'}],cities:[{id:'yellow_qingshi',name:'青石黄巾城',openCity:true}]};
let checks=0;
const pass=name=>{checks++;console.log('PASS '+name);};
async function role(name,actor,fn){return db.transaction(async tx=>{await tx.exec('SET LOCAL ROLE '+name);await tx.query("SELECT set_config('request.jwt.claim.sub',$1,true)",[actor||'']);return fn(tx);});}
const service=fn=>role('service_role',null,fn);
const scalar=async(tx,sql,args=[])=>Object.values((await tx.query(sql,args)).rows[0]||{})[0];
const rpc=async(tx,name,args)=>scalar(tx,'SELECT public.online_game_'+name+'('+args.map((_,i)=>'$'+(i+1)).join(',')+')',args);
const player=id=>db.query('SELECT revision,state FROM public.online_players WHERE realm=$1 AND user_id=$2',[realm,id]).then(r=>r.rows[0]);
const revision=id=>player(id).then(p=>Number(p.revision));
const patchPlayer=(id,expectedRevision,next)=>({id,expectedRevision,state:next});
const commit=(actor,id,patch,response={ok:true})=>service(tx=>rpc(tx,'commit',[actor,realm,id,'hash-'+id,patch,response]));
const rejects=(fn,pattern)=>assert.rejects(fn,error=>pattern.test(error.message));

try{
  // Stub only Supabase's prerequisite objects. No game SQL is rewritten.
  await db.exec(`
    CREATE ROLE anon NOLOGIN;
    CREATE ROLE authenticated NOLOGIN;
    CREATE ROLE service_role NOLOGIN BYPASSRLS;
    CREATE SCHEMA auth;
    CREATE TABLE auth.users(id uuid PRIMARY KEY);
    CREATE TABLE auth.sessions(id uuid PRIMARY KEY,user_id uuid NOT NULL REFERENCES auth.users(id),secret text);
    ALTER TABLE auth.sessions ENABLE ROW LEVEL SECURITY;
    CREATE FUNCTION auth.uid() RETURNS uuid LANGUAGE sql STABLE AS
      $$SELECT nullif(current_setting('request.jwt.claim.sub',true),'')::uuid$$;
    GRANT USAGE ON SCHEMA auth TO anon,authenticated;
    INSERT INTO auth.users VALUES('${A}'),('${B}'),('${C}'),('${D}'),('${E}');
    INSERT INTO auth.sessions VALUES('${session}','${A}','never-exposed');
  `);
  await db.exec(migration);
  const policies=await db.query("SELECT count(*)::int n FROM pg_policies WHERE schemaname='public' AND tablename LIKE 'online_%'");
  assert.equal(policies.rows[0].n,2);
  const secured=await db.query("SELECT bool_and(relrowsecurity) ok FROM pg_class WHERE relnamespace='public'::regnamespace AND relname LIKE 'online_%' AND relkind='r'");
  assert.equal(secured.rows[0].ok,true);
  pass('unmodified migration creates tables, policies and executable SQL/PLpgSQL functions');

  for(const [id,name]of [[A,'甲城'],[B,'乙城'],[C,'丙城']]){
    const result=await service(tx=>rpc(tx,'join',[id,realm,'join-'+id,0,'join-hash-'+id,state(name),seed,1700000000000]));
    assert.equal(result.revision,1);
  }
  const homes=await db.query('SELECT home_x,home_y FROM public.online_players WHERE realm=$1',[realm]);
  assert.equal(new Set(homes.rows.map(r=>r.home_x+','+r.home_y)).size,3);
  const repeated=await service(tx=>rpc(tx,'join',[A,realm,'join-'+A,0,'join-hash-'+A,state('甲城'),seed,1700000000000]));
  assert.equal(repeated.replayed,true);
  pass('service-role joins allocate distinct homes and replay an identical join once');

  const privateResponse={ok:true,revision:1,state:state('私人档')};
  assert.deepEqual(await service(tx=>rpc(tx,'private_save',[A,'private-one',0,'private-hash',privateResponse])),privateResponse);
  const own=await role('authenticated',A,tx=>tx.query('SELECT user_id FROM public.online_players WHERE realm=$1',[realm]));
  assert.deepEqual(own.rows.map(r=>r.user_id),[A]);
  const privateOwn=await role('authenticated',A,tx=>tx.query('SELECT user_id FROM public.online_private_saves'));
  assert.deepEqual(privateOwn.rows.map(r=>r.user_id),[A]);
  const other=await role('authenticated',B,tx=>tx.query('SELECT user_id FROM public.online_private_saves WHERE user_id=$1',[A]));
  assert.deepEqual(other.rows,[]);
  await rejects(()=>role('anon',null,tx=>tx.query('SELECT * FROM public.online_players')),/permission denied/);
  await rejects(()=>role('authenticated',A,tx=>tx.query('UPDATE public.online_players SET revision=revision+1 WHERE user_id=$1',[A])),/permission denied/);
  await rejects(()=>role('authenticated',A,tx=>rpc(tx,'context',[A,realm,null,false])),/permission denied/);
  pass('actual RLS permits only own reads; other private rows, anonymous access, direct writes and client RPC calls are denied');

  assert.equal(await service(tx=>rpc(tx,'session',[A,session])),true);
  assert.equal(await service(tx=>rpc(tx,'session',[B,session])),false);
  assert.equal(await service(tx=>rpc(tx,'session',[A,'10000000-0000-4000-8000-000000000002'])),false);
  await rejects(()=>service(tx=>tx.query('SELECT secret FROM auth.sessions')),/permission denied/);
  pass('service RPC verifies the matching live session using column-limited auth.sessions grants');

  const nextA=state('甲城更新');nextA.res.gold=250;
  const responseA={ok:true,revision:2,state:nextA};
  const p={players:[patchPlayer(A,1,nextA)],heroes:[],cities:[],marches:[]};
  assert.deepEqual(await commit(A,'commit-one',p,responseA),responseA);
  assert.equal(await revision(A),2);
  assert.equal((await commit(A,'commit-one',p,responseA)).replayed,true);
  await rejects(()=>service(tx=>rpc(tx,'commit',[A,realm,'commit-one','different-hash',p,responseA])),/ID_REUSED/);
  await rejects(()=>commit(A,'stale-one',p),/REVISION_CONFLICT/);
  assert.equal(await revision(A),2);
  const privateReplay=await service(tx=>rpc(tx,'private_save',[A,'private-one',0,'private-hash',privateResponse]));
  assert.equal(privateReplay.replayed,true);
  await rejects(()=>service(tx=>rpc(tx,'private_save',[A,'private-stale',0,'other-hash',privateResponse])),/REVISION_CONFLICT/);
  pass('player and private-save CAS reject stale revisions; same command replay cannot charge or update twice');

  // Reverse actor/target ordering exercises the common sorted row-lock query.
  await commit(B,'two-player',{players:[patchPlayer(B,1,state('乙城更新')),patchPlayer(A,2,nextA)],heroes:[],cities:[],marches:[]});
  assert.equal(await revision(A),3);assert.equal(await revision(B),2);
  const bad={players:[patchPlayer(A,3,state('不能入库'))],heroes:[{line:'wanderer',owner:A,status:'captured',expectedVersion:0,version:1}],cities:[{id:'yellow_qingshi',owner:A,expectedVersion:999,version:1000}],marches:[]};
  await rejects(()=>commit(A,'atomic-invalid',bad),/REVISION_CONFLICT/);
  const hero=await db.query('SELECT owner_id,version FROM public.online_heroes WHERE realm=$1 AND line=$2',[realm,'wanderer']);
  assert.equal(hero.rows[0].owner_id,null);assert.equal(Number(hero.rows[0].version),0);assert.equal(await revision(A),3);
  assert.equal((await db.query('SELECT count(*)::int n FROM public.online_receipts WHERE command_id=$1',['atomic-invalid'])).rows[0].n,0);
  pass('actor-target patch runs successfully; a later invalid city claim rolls back earlier hero mutation, state and receipt atomically');

  await commit(A,'claim-hero',{players:[patchPlayer(A,3,nextA)],heroes:[{line:'wanderer',owner:A,status:'captured',expectedVersion:0,version:1}],cities:[],marches:[]});
  await rejects(()=>commit(B,'hero-race',{players:[patchPlayer(B,2,state('乙城更新'))],heroes:[{line:'wanderer',owner:B,status:'captured',expectedVersion:0,version:1}],cities:[],marches:[]}),/REVISION_CONFLICT/);
  assert.equal(await revision(B),2);
  await commit(B,'claim-city',{players:[patchPlayer(B,2,state('乙城更新'))],heroes:[],cities:[{id:'yellow_qingshi',owner:B,expectedVersion:0,version:1}],marches:[]});
  await rejects(()=>commit(A,'city-race',{players:[patchPlayer(A,4,nextA)],heroes:[],cities:[{id:'yellow_qingshi',owner:A,expectedVersion:0,version:1}],marches:[]}),/REVISION_CONFLICT/);
  assert.equal(await revision(A),4);
  const ownership=await db.query('SELECT owner_id FROM public.online_city_claims WHERE realm=$1 AND city_id=$2',[realm,'yellow_qingshi']);
  assert.equal(ownership.rows[0].owner_id,B);
  // A newly founded city takes an empty global location via expectedVersion:null.
  // Use independent actors so earlier CAS revision fixtures stay unchanged.
  await service(tx=>rpc(tx,'join',[D,realm,'join-'+D,0,'join-hash-'+D,state('丁城'),seed,1700000000000]));
  const position=(await db.query('SELECT gx.x,gy.y FROM generate_series(2,61) gx(x) CROSS JOIN generate_series(2,61) gy(y) WHERE NOT EXISTS(SELECT 1 FROM public.online_players p WHERE p.realm=$1 AND p.home_x=gx.x AND p.home_y=gy.y) AND NOT EXISTS(SELECT 1 FROM public.online_city_claims c WHERE c.realm=$1 AND c.x=gx.x AND c.y=gy.y) ORDER BY (gx.x-32)^2+(gy.y-32)^2,gy.y,gx.x LIMIT 1',[realm])).rows[0];
  const founded={id:'founded-sql-city',name:'新筑城',owner:D,expectedVersion:null,version:1,...position};
  await commit(D,'found-city',{players:[patchPlayer(D,1,state('丁城'))],heroes:[],cities:[founded],marches:[]});
  const located=(await db.query('SELECT owner_id,x,y,version FROM public.online_city_claims WHERE realm=$1 AND city_id=$2',[realm,founded.id])).rows[0];
  assert.equal(located.owner_id,D);assert.equal(located.x,position.x);assert.equal(located.y,position.y);assert.equal(Number(located.version),1);
  const losingCity=city=>({players:[patchPlayer(B,3,state('乙城更新'))],heroes:[],cities:[city],marches:[]});
  await rejects(()=>commit(B,'same-city',losingCity({...founded,owner:B})),/REVISION_CONFLICT/);
  await rejects(()=>commit(B,'same-location',losingCity({...founded,id:'other-city-same-location',owner:B})),/REVISION_CONFLICT/);
  const occupied=homes.rows[0];
  await rejects(()=>commit(B,'on-player-home',losingCity({...founded,id:'city-on-player-home',owner:B,x:occupied.home_x,y:occupied.home_y})),/REVISION_CONFLICT/);
  assert.equal(await revision(B),3);
  assert.equal((await db.query('SELECT count(*)::int n FROM public.online_city_claims WHERE realm=$1 AND x=$2 AND y=$3',[realm,position.x,position.y])).rows[0].n,1);
  const joined=await service(tx=>rpc(tx,'join',[E,realm,'join-'+E,0,'join-hash-'+E,state('戊城'),seed,1700000000000]));
  assert.notDeepEqual(joined.home,position);
  const newHome=(await db.query('SELECT home_x,home_y FROM public.online_players WHERE realm=$1 AND user_id=$2',[realm,E])).rows[0];
  assert.notEqual(newHome.home_x+':'+newHome.home_y,position.x+':'+position.y);
  pass('hero/city CAS and unique founded locations reject losing claims; new player homes avoid founded cities');

  const march={id:'sql-march',source:C,target:A,kind:'pvp',status:'march',arrive:1,returnAt:null,version:0,expectedVersion:null};
  await commit(C,'stage-march',{players:[patchPlayer(C,1,state('丙城'))],heroes:[],cities:[],marches:[march]});
  const context=await service(tx=>rpc(tx,'context',[C,realm,A,true]));
  assert.equal(context.players.some(p=>p.id===C),true);assert.equal(context.players.some(p=>p.id===A),true);
  assert.equal(context.marches.find(m=>m.id===march.id).status,'march');
  assert.equal((await service(tx=>rpc(tx,'due',[]))).some(d=>d.actor===C&&d.realm===realm),true);
  await rejects(()=>commit(C,'stale-march',{players:[patchPlayer(C,2,state('丙城'))],heroes:[],cities:[],marches:[march]}),/REVISION_CONFLICT/);
  assert.equal(await revision(C),2);
  pass('march insertion and settlement context execute; an obsolete insert cannot duplicate a march');

  const alliance={id:'alliance-one',name:'甲盟',leader:A};
  await commit(A,'alliance-one',{players:[patchPlayer(A,4,nextA)],heroes:[],cities:[],marches:[],allianceExpected:0,alliances:[alliance],memberships:[{user:A,alliance:alliance.id,role:'leader'}]});
  await rejects(()=>commit(B,'alliance-stale',{players:[patchPlayer(B,3,state('乙城更新'))],heroes:[],cities:[],marches:[],allianceExpected:0,alliances:[{id:'alliance-two',name:'乙盟',leader:B}],memberships:[{user:B,alliance:'alliance-two',role:'leader'}]}),/REVISION_CONFLICT/);
  const alliances=await db.query('SELECT alliance_id,name FROM public.online_alliances WHERE realm=$1',[realm]);
  assert.deepEqual(alliances.rows,[{alliance_id:'alliance-one',name:'甲盟'}]);assert.equal(await revision(B),3);
  await commit(C,'ordinary-after-alliance',{players:[patchPlayer(C,2,state('丙城更新'))],heroes:[],cities:[],marches:[]});
  assert.deepEqual((await db.query('SELECT alliance_id,name FROM public.online_alliances WHERE realm=$1',[realm])).rows,alliances.rows);
  pass('alliance metadata CAS preserves earlier updates; ordinary commands do not replace alliance state');

  const privileges=await db.query("SELECT bool_and(NOT has_function_privilege('anon',oid,'EXECUTE') AND NOT has_function_privilege('authenticated',oid,'EXECUTE') AND has_function_privilege('service_role',oid,'EXECUTE')) ok FROM pg_proc WHERE pronamespace='public'::regnamespace AND proname LIKE 'online_game_%'");
  assert.equal(privileges.rows[0].ok,true);
  assert.equal(await service(tx=>rpc(tx,'time',[]))>0,true);
  assert.equal((await service(tx=>rpc(tx,'private_load',[A]))).revision,1);
  const receipt=await service(tx=>rpc(tx,'receipt',[A,realm,'commit-one']));assert.equal(receipt.hash,'hash-commit-one');
  pass('every deployed RPC is service-only, and time/private-load/receipt functions execute with actual role privileges');

  console.log(JSON.stringify({ok:true,checks,pglite:'0.5.8',migration:migrationNames,schemaHash,postgres:(await db.query('SELECT version() version')).rows[0].version,scope:'local PostgreSQL WASM SQL/RLS/RPC; one connection; no hosted Supabase or multi-connection concurrency proof'},null,2));
}finally{await db.close();}
