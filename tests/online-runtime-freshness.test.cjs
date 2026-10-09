const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const root=path.resolve(__dirname,'..');
const read=file=>fs.readFileSync(path.join(root,file),'utf8');
const runtime='supabase/functions/_shared/game-runtime.mjs';
const copies=['runtime.mjs','world.mjs','realm-systems.mjs','service.mjs','http.mjs','auth.mjs','supabase-store.mjs'];
const rebuild='请运行 npm run online:build';
// Keep this check independent of the generator: npm test must detect a forgotten build.
function verify(readFile){
 const load=file=>{try{return readFile(file);}catch(error){throw new Error(file+' 无法读取；'+rebuild,{cause:error});}};
 const html=load('index.html');
 const ordered=[...html.matchAll(/<script src="([^"?]+)(?:\?[^"<>]*)?"><\/script>/g)].map(match=>match[1]);
 const engine=ordered.indexOf('engine.js');
 assert.ok(engine>=0,'index.html 缺少 engine.js；'+rebuild);
 const files=ordered.slice(0,engine+1);
 const artifact=load(runtime);
 const metadata=name=>{
  const match=artifact.match(new RegExp('export const '+name+'=(.*);'));
  assert.ok(match,runtime+' 缺少 '+name+'；'+rebuild);
  try{return JSON.parse(match[1]);}catch(error){throw new Error(runtime+' 的 '+name+' 损坏；'+rebuild,{cause:error});}
 };
 assert.deepEqual(metadata('runtimeSources'),files,runtime+' 的源文件清单或顺序过期；'+rebuild);
 const hash=crypto.createHash('sha256').update(files.map(file=>file+'\n'+load(file)).join('\n')).digest('hex');
 assert.equal(metadata('runtimeHash'),hash,runtime+' 的源码摘要过期；'+rebuild);
 for(const file of copies){
  const generated='supabase/functions/_shared/online/'+file;
  const source=load('online/'+file).replace("'../supabase/functions/_shared/game-runtime.mjs'","'../game-runtime.mjs'");
  assert.equal(load(generated),'// Generated from online/'+file+' by build-online-runtime.cjs.\n'+source,generated+' 过期；'+rebuild);
 }
}
function changed(file,transform){return name=>name===file?transform(read(name)):read(name);}

test('committed online runtime and all generated copies match current browser sources',()=>{
 assert.doesNotThrow(()=>verify(read));
});
test('a browser engine source edit is rejected until the runtime is rebuilt',()=>{
 assert.throws(()=>verify(changed('engine.js',s=>s+'\n// source changed')),/npm run online:build/);
});
test('browser runtime script order changes are rejected',()=>{
 assert.throws(()=>verify(changed('index.html',s=>{
  const tags=s.match(/<script src="[^"<>]+"><\/script>/g);
  assert.ok(tags.length>2);
  return s.replace(tags[0],'SCRIPT_SWAP').replace(tags[1],tags[0]).replace('SCRIPT_SWAP',tags[1]);
 })),/npm run online:build/);
});
test('UI sources after engine.js do not invalidate the server runtime',()=>{
 assert.doesNotThrow(()=>verify(changed('app.js',s=>s+'\n// UI changed')));
});
for(const file of copies){
 const generated='supabase/functions/_shared/online/'+file;
 test('stale generated '+file+' is rejected with its path',()=>{
  assert.throws(()=>verify(changed(generated,s=>s+'\n// stale copy')),error=>error.message.includes(generated)&&error.message.includes('npm run online:build'));
 });
 test('missing generated '+file+' reports the rebuild command',()=>{
  assert.throws(()=>verify(name=>{if(name===generated)throw Error('ENOENT');return read(name);}),error=>error.message.includes(generated)&&error.message.includes('npm run online:build'));
 });
}
test('missing engine script is rejected clearly',()=>{
 assert.throws(()=>verify(changed('index.html',s=>s.replace(/<script src="engine\.js[^"<>]*"><\/script>/,''))),/engine\.js/);
});
test('missing runtime artifact reports how to rebuild',()=>{
 assert.throws(()=>verify(name=>{if(name===runtime)throw Error('ENOENT');return read(name);}),/npm run online:build/);
});
test('a source added before engine requires a runtime rebuild',()=>{
 assert.throws(()=>verify(name=>name==='added.js'?'const Added={};':name==='index.html'?read(name).replace('<script src="engine.js','<script src="added.js"></script><script src="engine.js'):read(name)),/npm run online:build/);
});
