const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const KEY='sanguo-city-v2',WRITER=KEY+'-writer',BACKUP=KEY+'-backup',REQUEST=KEY+'-handoff';
let serial=0;
const files=['manual-data.js','speedup-data.js','reference-rules.js','reward-data.js','progression.js','onboarding-data.js','onboarding-system.js','hero-system.js','heritage-data.js','heritage-system.js','npc-data.js','npc-defense.js','chapter-data.js','siege-data.js','war-orders.js','automation-system.js','yellow-city-data.js','plot-template-data.js','city-system.js','city-strategy.js','general-growth-data.js','general-growth-system.js','scout-system.js','regional-front.js','supply-lines.js','hero-administration.js','engine.js'];
function page(store=new Map(),fault={},browser,abortController=AbortController){
  let now=1791194400000;const owner='page-'+(++serial);
  const globals={console,crypto:{randomUUID:()=>owner},Date:class extends Date{constructor(...args){super(...(args.length?args:[now]));}static now(){return now;}},localStorage:{getItem(key){if(fault.read){fault.read--;throw Error('read unavailable');}return store.has(key)?store.get(key):null;},setItem(key,value){if(fault.beforeWrite)fault.beforeWrite(key,value);if(fault.writeKey===key)throw Error('write unavailable');store.set(key,value);if(fault.afterWrite)fault.afterWrite(key,value);}},document:{addEventListener(){}}};
  if(browser)globals.navigator=browser;
  if(abortController)globals.AbortController=abortController;
  const context=vm.createContext(globals);
  for(const file of files)vm.runInContext(fs.readFileSync(path.join(__dirname,'..',file),'utf8'),context,{filename:file});
  const g=vm.runInContext('Game',context);g.init();return {g,store,fault,owner,run(source){return vm.runInContext(source,context);},advance(ms){now+=ms;g.tick(now);}};
}
const copy=value=>JSON.parse(JSON.stringify(value));
// One shared lock manager models distinct page contexts and the callback's full
// lifetime. A request cannot grant another writer until that callback resolves.
function sharedWebLocks({ignoreAbort=false}={}){
  const active=new Map(),queues=new Map(),events=[];let serial=0;
  function pump(name){
    if(active.has(name))return;
    const job=queues.get(name)?.shift();if(!job)return;
    if(job.abort)job.signal.removeEventListener('abort',job.abort);
    const lock={name,mode:'exclusive'};active.set(name,job.id);events.push({kind:'grant',id:job.id});
    Promise.resolve().then(()=>job.callback(lock)).then(job.resolve,job.reject).finally(()=>{active.delete(name);events.push({kind:'release',id:job.id});pump(name);});
  }
  const locks={request(name,options,callback){
    assert.equal(options.steal,undefined,'a takeover must never steal a held lock');
    // The real Web Locks API rejects combining signal and ifAvailable/steal.
    assert.ok(!(options.signal&&(options.ifAvailable||options.steal)),'Web Locks signal is valid only for a queued request');
    const id=++serial;events.push({kind:'request',id,ifAvailable:!!options.ifAvailable});
    if(options.ifAvailable&&active.has(name)){events.push({kind:'unavailable',id});return Promise.resolve().then(()=>callback(null));}
    return new Promise((resolve,reject)=>{
      const queue=queues.get(name)||[],job={id,callback,resolve,reject,signal:options.signal};
      if(options.signal&&!ignoreAbort){
        job.abort=()=>{const index=queue.indexOf(job);if(index>=0)queue.splice(index,1);events.push({kind:'abort',id});const error=new Error('Lock request aborted');error.name='AbortError';reject(error);};
        if(options.signal.aborted){job.abort();return;}options.signal.addEventListener('abort',job.abort,{once:true});
      }
      queue.push(job);queues.set(name,queue);pump(name);
    });
  }};
  return {locks,events,active};
}
async function microtasks(){for(let i=0;i<12;i++)await Promise.resolve();}
function loadActResult(p){
  const app=fs.readFileSync(path.join(__dirname,'..','app.js'),'utf8'),start=app.indexOf('function actResult('),end=app.indexOf('\nfunction ',start+1);
  assert.ok(start>=0&&end>start,'exercise the actual UI result handler');
  p.run('var resultToasts=[],resultRenders=0;function toast(message){resultToasts.push(message);}function render(){resultRenders++;}'+app.slice(start,end));
}
test('a second page is read-only and cannot overwrite gifts, items or latest tax',()=>{
  const a=page(),b=page(a.store);assert.equal(a.g.saveSessionInfo().writable,true);assert.equal(b.g.saveSessionInfo().mode,'readonly');
  assert.equal(a.g.claimStarterGift(),null);const latest=a.store.get(KEY),old=copy(b.g.state);
  assert.match(b.g.setTax(25),/另一页面/);assert.equal(b.g.save(),false);b.advance(3600000);
  assert.deepEqual(copy(b.g.state),old);assert.equal(a.store.get(KEY),latest);const c=page(a.store);
  assert.equal(c.g.state.starterGiftClaimed,true);assert.equal(c.g.state.res.gold,15000);assert.ok(c.g.state.inventory.speed_build_15m>0);assert.equal(c.g.validSave(c.g.state),true);
});
test('fallback takeover refuses a foreign writer until it explicitly releases',()=>{
  const a=page(),b=page(a.store);a.g.claimStarterGift();const latest=a.store.get(KEY);
  assert.match(b.g.takeOverSaveSession(),/另一页面/);assert.equal(b.g.save(),false);assert.equal(a.store.get(KEY),latest);assert.equal(JSON.parse(a.store.get(WRITER)).owner,a.owner);
  a.g.releaseSaveSession();assert.equal(b.g.takeOverSaveSession(),null);assert.equal(b.g.state.starterGiftClaimed,true);assert.equal(b.g.setTax(25),undefined);
  const saved=a.store.get(KEY),before=copy(a.g.state);assert.match(a.g.setTax(40),/停止写入/);assert.equal(a.g.save(),false);a.advance(60000);
  assert.deepEqual(copy(a.g.state),before);assert.equal(a.store.get(KEY),saved);assert.equal(JSON.parse(saved).tax,25);
  a.g.releaseSaveSession();assert.equal(JSON.parse(a.store.get(WRITER)).owner,b.owner);
});
test('an expired foreign fallback lease cannot be stolen; an explicit release permits resuming',()=>{
  const a=page();a.g.claimStarterGift();a.store.set(WRITER,JSON.stringify({owner:a.owner,until:1791194400000-1}));
  const before=a.store.get(KEY),b=page(a.store);assert.equal(b.g.saveSessionInfo().mode,'readonly');assert.match(b.g.takeOverSaveSession(),/另一页面/);assert.equal(a.store.get(KEY),before);assert.equal(JSON.parse(a.store.get(WRITER)).owner,a.owner);
  assert.equal(a.g.saveSessionInfo().writable,true);a.g.releaseSaveSession();const c=page(a.store);assert.equal(c.g.saveSessionInfo().writable,true);assert.equal(c.g.state.starterGiftClaimed,true);
});
test('uncoordinated payload changes cause a version conflict rather than a stale overwrite',()=>{
  const a=page(),changed=copy(a.g.state);changed.res.gold=43210;changed.realm.cities[changed.realm.activeCity].data.res.gold=43210;const raw=JSON.stringify(changed);a.store.set(KEY,raw);
  assert.match(a.g.setTax(30),/变化/);assert.equal(a.g.saveSessionInfo().mode,'conflict');assert.equal(a.g.save(),false);assert.equal(a.store.get(KEY),raw);
  assert.equal(a.g.takeOverSaveSession(),null);assert.equal(a.g.state.res.gold,43210);assert.equal(a.g.setTax(30),undefined);
});
test('invalid primary data is retained, latest valid backup can be restored and replaced raw is archived',()=>{
  const a=page();a.g.claimStarterGift();a.g.setTax(25);assert.equal(JSON.parse(a.store.get(BACKUP)).starterGiftClaimed,true);
  const broken=copy(a.g.state);broken.res.food=-1;const raw=JSON.stringify(broken);a.store.set(KEY,raw);
  a.g.init();assert.equal(a.g.saveSessionInfo().mode,'recovery');assert.equal(a.store.get(KEY),raw);assert.equal(a.g.save(),false);assert.match(a.g.train('archer',1),/原始存档/);
  assert.equal(a.g.exportStoredRaw(),raw);assert.equal(a.g.restoreSaveBackup(),null);assert.equal(a.g.validSave(a.g.state),true);assert.equal(a.g.state.starterGiftClaimed,true);
  assert.ok([...a.store.entries()].some(([key,value])=>key.startsWith(KEY+'-recovery-')&&value===raw));
});
test('malformed JSON and a transient read failure never silently establish a fresh persisted city',()=>{
  const a=page();a.g.claimStarterGift();const saved=a.store.get(KEY);a.fault.read=1;a.g.init();
  assert.equal(a.g.saveSessionInfo().mode,'read-error');assert.equal(a.store.get(KEY),saved);assert.equal(a.g.save(),false);
  a.g.init();assert.equal(a.g.state.starterGiftClaimed,true);assert.equal(a.g.saveSessionInfo().writable,true);
  a.store.set(KEY,'{broken');a.g.init();assert.equal(a.g.saveSessionInfo().mode,'recovery');assert.equal(a.store.get(KEY),'{broken');assert.equal(a.g.save(),false);
});
test('failed persistence pauses actions, reports an error and preserves primary for explicit retry',()=>{
  const a=page(),saved=a.store.get(KEY);a.fault.writeKey=KEY;
  assert.match(a.g.claimStarterGift(),/保存失败/);assert.equal(a.g.saveSessionInfo().mode,'write-error');assert.equal(a.store.get(KEY),saved);
  const unsaved=copy(a.g.state);assert.equal(unsaved.starterGiftClaimed,true);assert.match(a.g.setTax(35),/保存失败/);assert.deepEqual(copy(a.g.state),unsaved);
  delete a.fault.writeKey;a.g.init();assert.equal(a.g.saveSessionInfo().writable,true);assert.equal(a.g.state.starterGiftClaimed,false);assert.equal(a.g.claimStarterGift(),null);
});
test('import validates before replacing, retains original progress and is refused on a passive page',()=>{
  const a=page();a.g.claimStarterGift();const before=a.store.get(KEY),bad=copy(a.g.state);bad.res.food=-1;
  assert.throws(()=>a.g.importSave(bad),/Invalid save/);assert.equal(a.store.get(KEY),before);
  const b=page(a.store);assert.throws(()=>b.g.importSave(copy(a.g.state)),/另一页面/);assert.equal(a.store.get(KEY),before);
  const imported=copy(a.g.state);imported.tax=33;imported.realm.cities[imported.realm.activeCity].data.tax=33;a.g.importSave(imported);assert.equal(a.g.state.tax,33);
  assert.ok([...a.store.entries()].some(([key,value])=>key.startsWith(KEY+'-recovery-')&&value===before));assert.equal(a.g.validSave(a.g.state),true);
});
test('an explicit new city retains replaced data and cannot reset an active foreign city',()=>{
  const a=page();a.g.claimStarterGift();const before=a.store.get(KEY),b=page(a.store);
  assert.match(b.g.reset(),/另一页面/);assert.equal(a.store.get(KEY),before);assert.equal(a.g.reset(),null);assert.equal(a.g.state.starterGiftClaimed,false);
  assert.ok([...a.store.values()].includes(before));assert.equal(a.g.validSave(a.g.state),true);
});
test('Web Locks takeover waits for the old writer to flush and release before loading latest progress',async()=>{
  const shared=sharedWebLocks(),a=page(new Map(),{},{locks:shared.locks}),b=page(a.store,{},{locks:shared.locks});
  assert.equal(a.g.saveSessionInfo().mode,'starting');assert.equal(a.store.has(KEY),false);
  assert.equal(await a.g.openSaveSession(),null);assert.match(await b.g.openSaveSession(),/另一页面/);
  const initial=a.store.get(KEY);assert.equal(shared.active.size,1);
  // Dirty in-memory state is an explicit fixture, representing work not yet
  // flushed by the next timer. It must travel through A's handoff save.
  a.g.state.tax=27;let resolved=false;const takeover=b.g.takeOverSaveSession().then(error=>{resolved=true;return error;});
  await microtasks();assert.equal(resolved,false);assert.equal(b.g.saveSessionInfo().mode,'handoff');assert.equal(JSON.parse(a.store.get(WRITER)).owner,a.owner);
  assert.match(b.g.setTax(31),/交接/);assert.equal(b.g.save(),false);assert.equal(a.store.get(KEY),initial);
  assert.equal(JSON.parse(a.store.get(REQUEST)).target,a.owner);
  a.g.respondSaveTakeover();assert.equal(await takeover,null);assert.equal(b.g.state.tax,27);assert.equal(b.g.saveSessionInfo().writable,true);
  const events=shared.events,firstRelease=events.findIndex(e=>e.kind==='release'),secondGrant=events.findIndex((e,i)=>i>firstRelease&&e.kind==='grant');
  assert.ok(firstRelease>=0&&secondGrant>firstRelease,'the successor is granted only after the old callback releases');
  assert.equal(b.g.setTax(31),undefined);const latest=a.store.get(KEY),before=copy(a.g.state);
  assert.match(a.g.setTax(40),/暂停/);assert.equal(a.g.save(),false);a.advance(3600000);
  assert.deepEqual(copy(a.g.state),before);assert.equal(a.store.get(KEY),latest);assert.equal(JSON.parse(latest).tax,31);
  a.g.releaseSaveSession();assert.equal(JSON.parse(a.store.get(WRITER)).owner,b.owner);b.g.releaseSaveSession();await microtasks();assert.equal(shared.active.size,0);
});
test('a takeover requested while A saves cannot interleave B writes into the raw payload write',async()=>{
  const shared=sharedWebLocks(),a=page(new Map(),{},{locks:shared.locks}),b=page(a.store,{},{locks:shared.locks});
  assert.equal(await a.g.openSaveSession(),null);assert.match(await b.g.openSaveSession(),/另一页面/);
  let takeover,atWrite;a.fault.beforeWrite=(key)=>{if(key!==KEY||takeover)return;takeover=b.g.takeOverSaveSession();atWrite={owner:JSON.parse(a.store.get(WRITER)).owner,error:b.g.setTax(45),saved:b.g.save()};};
  assert.equal(a.g.setTax(30),undefined);assert.equal(atWrite.owner,a.owner);assert.match(atWrite.error,/交接/);assert.equal(atWrite.saved,false);assert.equal(JSON.parse(a.store.get(KEY)).tax,30);
  delete a.fault.beforeWrite;a.g.respondSaveTakeover();assert.equal(await takeover,null);assert.equal(b.g.state.tax,30);assert.equal(b.g.setTax(45),undefined);
  assert.equal(JSON.parse(a.store.get(KEY)).tax,45);assert.equal(a.g.save(),false);b.g.releaseSaveSession();await microtasks();
});
test('a failed old-page flush retains its lock and cannot silently complete a handoff',async()=>{
  const shared=sharedWebLocks(),a=page(new Map(),{},{locks:shared.locks}),b=page(a.store,{},{locks:shared.locks});
  await a.g.openSaveSession();await b.g.openSaveSession();const initial=a.store.get(KEY);a.g.state.tax=28;a.fault.writeKey=KEY;
  let resolved=false;const takeover=b.g.takeOverSaveSession().then(error=>{resolved=true;return error;});a.g.respondSaveTakeover();await microtasks();
  assert.equal(resolved,false);assert.equal(shared.active.size,1);assert.equal(a.g.saveSessionInfo().mode,'write-error');assert.equal(b.g.saveSessionInfo().mode,'handoff');assert.equal(a.store.get(KEY),initial);
  assert.equal(a.g.state.tax,28);assert.match(b.g.setTax(35),/交接/);assert.equal(b.g.save(),false);
  // Explicitly retry reading A's saved state, then permit the same handoff.
  delete a.fault.writeKey;assert.equal(await a.g.openSaveSession(),null);a.g.respondSaveTakeover();assert.equal(await takeover,null);assert.equal(b.g.state.tax,20);
  b.g.releaseSaveSession();await microtasks();
});
test('a browser without Web Locks preserves existing data and refuses writer takeover',async()=>{
  const a=page();a.g.claimStarterGift();const raw=a.store.get(KEY),writer=a.store.get(WRITER),b=page(a.store,{},{});
  assert.equal(b.g.saveSessionInfo().mode,'unsupported');assert.match(await b.g.openSaveSession(),/Web Locks/);assert.match(b.g.takeOverSaveSession(),/Web Locks/);
  assert.equal(b.g.save(),false);assert.equal(a.store.get(KEY),raw);assert.equal(a.store.get(WRITER),writer);
});
test('an empty primary remains recoverable raw data and is archived on explicit backup restore',()=>{
  const a=page();a.g.claimStarterGift();a.g.setTax(25);assert.ok(a.store.get(BACKUP));a.store.set(KEY,'');a.g.init();
  assert.equal(a.g.saveSessionInfo().mode,'recovery');assert.equal(a.g.saveSessionInfo().rawAvailable,true);assert.equal(a.g.exportStoredRaw(),'');assert.equal(a.g.save(),false);assert.equal(a.store.get(KEY),'');
  assert.equal(a.g.restoreSaveBackup(),null);assert.equal(a.g.state.starterGiftClaimed,true);assert.ok(a.g.validSave(JSON.parse(a.store.get(KEY))));
  assert.ok([...a.store.entries()].some(([key,value])=>key.startsWith(KEY+'-recovery-')&&value===''));
});
test('a backup replacement followed by a failed init reports failure instead of restored success',()=>{
  const a=page();a.g.claimStarterGift();a.g.setTax(25);a.store.set(KEY,'{broken');a.g.init();
  let replacementWritten=false;a.fault.afterWrite=(key)=>{if(key===KEY&&!replacementWritten){replacementWritten=true;a.fault.read=1;}};
  assert.match(a.g.restoreSaveBackup(),/读取存档失败/);assert.equal(replacementWritten,true);assert.equal(a.g.saveSessionInfo().mode,'read-error');assert.equal(a.g.saveSessionInfo().writable,false);
  assert.ok(a.g.validSave(JSON.parse(a.store.get(KEY))));assert.ok([...a.store.values()].includes('{broken'));
  delete a.fault.afterWrite;a.g.init();assert.equal(a.g.saveSessionInfo().writable,true);assert.equal(a.g.state.starterGiftClaimed,true);
});
test('actual module failure cannot produce a success toast through the app result handler',()=>{
  const a=page(),raw=a.store.get(KEY);loadActResult(a);a.fault.writeKey=KEY;
  // HeroSystem returns null from its save wrapper even when Game.save fails;
  // actResult must consult the real session status, not just that return value.
  assert.equal(a.run('HeroSystem.gift()'),null);assert.equal(a.g.state.heroGiftClaimed,true);assert.equal(a.store.get(KEY),raw);assert.equal(a.g.saveSessionInfo().mode,'write-error');
  assert.equal(a.run('actResult(null,"礼包领取成功")'),false);assert.equal(a.run('resultRenders'),0);assert.match(a.run('resultToasts[0]'),/保存失败/);assert.equal(a.run('resultToasts.includes("礼包领取成功")'),false);
});
test('the app result handler rejects a passive session even if a module returns no error',()=>{
  const a=page(),b=page(a.store);loadActResult(b);
  assert.equal(b.run('actResult(null,"操作成功")'),false);assert.match(b.run('resultToasts[0]'),/另一页面/);assert.equal(b.run('resultRenders'),0);assert.equal(b.run('resultToasts.includes("操作成功")'),false);
});
test('releasing a pending page aborts its queued takeover and never writes after the old page releases',async()=>{
  const shared=sharedWebLocks(),a=page(new Map(),{},{locks:shared.locks}),b=page(a.store,{},{locks:shared.locks});
  await a.g.openSaveSession();await b.g.openSaveSession();const pending=b.g.takeOverSaveSession();b.g.releaseSaveSession();
  assert.match(await pending,/停止等待/);assert.equal(b.g.saveSessionInfo().mode,'released');assert.ok(shared.events.some(e=>e.kind==='abort'));
  assert.equal(a.g.setTax(32),undefined);const latest=a.store.get(KEY);a.g.releaseSaveSession();await microtasks();
  assert.equal(shared.active.size,0);assert.equal(b.g.save(),false);assert.equal(b.g.saveSessionInfo().mode,'released');assert.equal(a.store.get(KEY),latest);assert.equal(JSON.parse(a.store.get(WRITER)).owner,'');
});
test('generation fencing suppresses a late queued callback even when AbortController is unavailable',async()=>{
  const shared=sharedWebLocks(),a=page(new Map(),{},{locks:shared.locks},null),b=page(a.store,{},{locks:shared.locks},null);
  await a.g.openSaveSession();await b.g.openSaveSession();const pending=b.g.takeOverSaveSession();b.g.releaseSaveSession();assert.match(await pending,/停止等待/);
  assert.equal(a.g.setTax(34),undefined);const latest=a.store.get(KEY),before=copy(b.g.state);a.g.releaseSaveSession();await microtasks();
  assert.equal(shared.active.size,0);assert.equal(b.g.saveSessionInfo().mode,'released');assert.deepEqual(copy(b.g.state),before);assert.equal(a.store.get(KEY),latest);assert.equal(JSON.parse(a.store.get(WRITER)).owner,'');
});
test('a consumed handoff cannot pause its original page again after that page resumes',async()=>{
  const shared=sharedWebLocks(),a=page(new Map(),{},{locks:shared.locks}),b=page(a.store,{},{locks:shared.locks});
  await a.g.openSaveSession();await b.g.openSaveSession();const pending=b.g.takeOverSaveSession();a.g.respondSaveTakeover();assert.equal(await pending,null);
  b.g.releaseSaveSession();await microtasks();assert.equal(await a.g.openSaveSession(),null);a.g.respondSaveTakeover();
  assert.equal(a.g.saveSessionInfo().writable,true,'the old request must be consumed, not replayed after resuming');assert.equal(a.g.setTax(36),undefined);
  a.g.releaseSaveSession();await microtasks();
});
test('a cancelled takeover cannot make the current page yield to a vanished requester',async()=>{
  const shared=sharedWebLocks(),a=page(new Map(),{},{locks:shared.locks}),b=page(a.store,{},{locks:shared.locks});
  await a.g.openSaveSession();await b.g.openSaveSession();const pending=b.g.takeOverSaveSession();b.g.releaseSaveSession();assert.match(await pending,/停止等待/);a.g.respondSaveTakeover();
  assert.equal(a.g.saveSessionInfo().writable,true,'cancelled queued takeover must stop requesting the active writer to pause');assert.equal(a.g.setTax(38),undefined);
  a.g.releaseSaveSession();await microtasks();
});
test('an exclusively locked recovery page can replace orphaned foreign writer metadata safely',async()=>{
  const old=page();old.g.claimStarterGift();old.g.setTax(25);old.g.releaseSaveSession();old.store.set(KEY,'{broken');old.store.set(WRITER,JSON.stringify({owner:'closed-old-page',until:1791194400000+15000}));
  const shared=sharedWebLocks(),a=page(old.store,{},{locks:shared.locks});assert.match(await a.g.openSaveSession(),/原始存档/);assert.equal(a.g.saveSessionInfo().mode,'recovery');assert.equal(JSON.parse(a.store.get(WRITER)).owner,a.owner);
  assert.equal(a.g.restoreSaveBackup(),null);assert.equal(a.g.saveSessionInfo().writable,true);assert.equal(a.g.state.starterGiftClaimed,true);assert.ok([...a.store.values()].includes('{broken'));a.g.releaseSaveSession();await microtasks();
});
test('three-page queued takeovers retarget each current writer and preserve FIFO progress',async()=>{
  const shared=sharedWebLocks(),a=page(new Map(),{},{locks:shared.locks}),b=page(a.store,{},{locks:shared.locks}),c=page(a.store,{},{locks:shared.locks});
  await a.g.openSaveSession();await b.g.openSaveSession();await c.g.openSaveSession();assert.equal(a.g.setTax(24),undefined);
  const toB=b.g.takeOverSaveSession();let cFinished=false;const toC=c.g.takeOverSaveSession().then(error=>{cFinished=true;return error;});
  assert.equal(JSON.parse(a.store.get(REQUEST)).requester,c.owner);a.g.respondSaveTakeover();assert.equal(await toB,null);assert.equal(b.g.state.tax,24);assert.equal(b.g.setTax(29),undefined);
  c.g.respondSaveTakeover();assert.equal(JSON.parse(a.store.get(REQUEST)).target,b.owner);b.g.respondSaveTakeover();await microtasks();
  assert.equal(cFinished,true,'a queued third page must retain a live request after a preceding page is granted');assert.equal(await toC,null);assert.equal(c.g.state.tax,29);assert.equal(c.g.saveSessionInfo().writable,true);
  assert.equal(a.g.save(),false);assert.equal(b.g.save(),false);assert.equal(c.g.setTax(37),undefined);assert.equal(JSON.parse(a.store.get(KEY)).tax,37);c.g.releaseSaveSession();await microtasks();
});
