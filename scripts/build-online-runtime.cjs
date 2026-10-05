const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const root=path.resolve(__dirname,'..'),html=fs.readFileSync(path.join(root,'index.html'),'utf8');
const ordered=[...html.matchAll(/<script src="([^"?]+)(?:\?[^"<>]*)?"><\/script>/g)].map(match=>match[1]);
const engine=ordered.indexOf('engine.js');if(engine<0)throw Error('engine.js script not found');
const files=ordered.slice(0,engine+1),sources=files.map(file=>fs.readFileSync(path.join(root,file),'utf8'));
const hash=crypto.createHash('sha256').update(files.map((file,i)=>file+'\n'+sources[i]).join('\n')).digest('hex');
const header=`// Generated from the browser's actual data modules and engine. Rebuild with node scripts/build-online-runtime.cjs.\nexport const runtimeHash=${JSON.stringify(hash)};\nexport const runtimeSources=${JSON.stringify(files)};\nexport function createGameRuntime({snapshot=null,now=globalThis.Date.now(),random=()=>globalThis.Math.random()}={}) {\n const GAME_SERVER_RUNTIME=true;\n const navigator=undefined,module=undefined,document={addEventListener(){}};\n const Date=class extends globalThis.Date {constructor(...args){super(...(args.length?args:[now]));}static now(){return now;}};\n const Math=Object.create(globalThis.Math);Math.random=random;\n const values=new Map(snapshot===null?[]:[['sanguo-city-v2',JSON.stringify(snapshot)]]);\n const localStorage={getItem:key=>values.has(key)?values.get(key):null,setItem:(key,value)=>values.set(key,String(value)),removeItem:key=>values.delete(key)};\n const crypto={randomUUID:()=> 'server-runtime'};\n`;
const footer=`\n Game.init();\n if(!Game.validSave(Game.state)||!Game.saveSessionInfo().writable)throw new Error('Invalid canonical game state');\n return {Game,HeroSystem,HeritageSystem,NPCDefense,NPCDefenseData,Progression,ChapterData,ManualData,WarOrders,OnboardingSystem};\n}\n`;
const destination=path.join(root,'supabase/functions/_shared/game-runtime.mjs');fs.mkdirSync(path.dirname(destination),{recursive:true});
fs.writeFileSync(destination,header+sources.map((source,i)=>'\n// SOURCE: '+files[i]+'\n'+source).join('\n')+footer);
const shared=path.join(root,'supabase/functions/_shared/online');fs.mkdirSync(shared,{recursive:true});
for(const file of ['runtime.mjs','world.mjs','service.mjs','http.mjs','auth.mjs','supabase-store.mjs']){
 const source=fs.readFileSync(path.join(root,'online',file),'utf8').replace("'../supabase/functions/_shared/game-runtime.mjs'","'../game-runtime.mjs'");
 fs.writeFileSync(path.join(shared,file),'// Generated from online/'+file+' by build-online-runtime.cjs.\n'+source);
}
console.log('Built isolated online runtime from '+files.length+' source files ('+hash.slice(0,12)+').');
