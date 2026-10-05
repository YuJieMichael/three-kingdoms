const {test}=require('node:test'),assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const {loadGame,city}=require('./helpers/game.cjs');
const copy=value=>JSON.parse(JSON.stringify(value));
const types=['farm','lumber','quarry','mine'],ids=['army','balanced','catapult'];
const counts=g=>Object.fromEntries(types.map(id=>[id,g.state.plots.slice(0,g.unlockedPlots()).filter(p=>p.type===id).length]));
const governorXp=g=>{const s=g.state,level=s.generalLevels[s.governor];return s.generalXp[s.governor]+40*(level-1)*level;};
function prepare(hall=1){const e=loadGame(),g=e.Game;city(g,{hall});for(const id of Object.keys(g.resources))g.state.res[id]=1000000;return e;}
function finish(e){const g=e.Game;for(let turn=0;turn<100;turn++){
 if(!g.state.plotTemplate.active&&!g.state.buildQueue.some(q=>q.plot!==undefined))return;
 if(g.state.buildQueue.length)e.advance(Math.max(1,Math.min(...g.state.buildQueue.map(q=>q.end))-e.now()+1),true);else g.tick(e.now(),true);
 }assert.fail('template did not finish within the finite current-city layout');}
function settings(g,reserve){const a=g.state.automation;return {researchFocus:a.researchFocus,researchPriority:a.researchPriority,reserve,notify:a.notify};}
let serial=0;
function page(store=new Map()){
 let now=1791194400000;const owner='template-page-'+(++serial);
 const ctx=vm.createContext({console,crypto:{randomUUID:()=>owner},Date:class extends Date{constructor(...args){super(...(args.length?args:[now]));}static now(){return now;}},localStorage:{getItem:k=>store.has(k)?store.get(k):null,setItem:(k,v)=>store.set(k,v)},document:{addEventListener(){}}});
 const scripts=[...fs.readFileSync(path.join(__dirname,'..','index.html'),'utf8').matchAll(/<script src="([^"?]+)(?:\?[^"<>]*)?"><\/script>/g)].map(m=>m[1]);
 for(const file of scripts){vm.runInContext(fs.readFileSync(path.join(__dirname,'..',file),'utf8'),ctx,{filename:file});if(file==='engine.js')break;}
 const g=vm.runInContext('Game',ctx);g.init();return {g,store};
}

test('templates recommend exact open-slot compositions and preview without mutating the city',()=>{
 for(const [hall,expected]of [[1,[[9,1,1,1],[3,3,3,3],[3,3,5,1]]],[10,[[36,1,1,1],[10,10,10,9],[10,10,16,3]]]]){
  const {Game:g}=prepare(hall);assert.deepEqual(copy(g.plotTemplates.map(t=>t.id)),ids);const before=JSON.stringify(g.state);
  for(const [i,id]of ids.entries()){const q=g.plotTemplateQuote(id);assert.deepEqual(types.map(type=>q.counts[type]),expected[i]);assert.equal(q.builds,g.unlockedPlots());assert.equal(q.replaces,0);assert.equal(q.total,g.unlockedPlots());assert.equal(q.reason,'');assert.equal(JSON.stringify(g.state),before);}
 }
});

test('fill runs paid, timed ordinary builds, earns governor experience once and stops at the current layout',()=>{
 const e=prepare(),g=e.Game,before=copy(g.state.res),xp=governorXp(g);
 assert.equal(g.setPlotTemplate('army'),null);assert.deepEqual(copy(g.state.plotTemplate),{id:'army',active:false,mode:'fill'});assert.equal(g.state.buildQueue.length,0);
 assert.equal(g.applyPlotTemplate('army','fill'),null);assert.equal(g.state.autoUpgrade,false);assert.equal(g.state.plotTemplate.active,true);assert.equal(g.state.buildQueue.length,g.buildLimit());assert.equal(g.state.plots.filter(p=>p.type).length,0);
 const queued=copy(g.state.buildQueue);for(const q of queued){assert.equal(q.kind,'build');assert.equal(q.level,1);assert.ok(q.end>q.start);assert.deepEqual(q.paid,copy(g.buildRecord(q.id,1).cost));}
 for(const id of Object.keys(g.resources))assert.equal(g.state.res[id],before[id]-queued.reduce((sum,q)=>sum+(q.paid[id]||0),0));
 finish(e);assert.deepEqual(types.map(id=>counts(g)[id]),[9,1,1,1]);assert.equal(g.state.plotTemplate.active,false);assert.equal(g.state.buildQueue.length,0);assert.equal(governorXp(g),xp+120);assert.ok(g.state.plots.slice(0,12).every(p=>p.level===1));
 const complete=copy(g.state.plots);city(g,{hall:2});g.tick(e.now(),true);assert.deepEqual(copy(g.state.plots),complete);assert.equal(g.unlockedPlots(),15);assert.equal(g.state.buildQueue.length,0);assert.equal(g.validSave(g.state),true);
});

test('fill preserves existing high-level farms and reports an imperfect composition instead of replacing them',()=>{
 const e=prepare(),g=e.Game;for(let i=0;i<8;i++)g.state.plots[i]={type:'lumber',level:i%2?10:5};const old=copy(g.state.plots.slice(0,8)),q=g.plotTemplateQuote('army','fill');
 assert.equal(q.replaces,0);assert.equal(q.builds,4);assert.ok(q.conflicts.length>0);assert.equal(g.applyPlotTemplate('army','fill'),null);finish(e);assert.deepEqual(copy(g.state.plots.slice(0,8)),old);assert.equal(g.state.plots.slice(0,12).filter(p=>p.type).length,12);assert.equal(g.state.plotTemplate.active,false);assert.notDeepEqual(types.map(id=>counts(g)[id]),[9,1,1,1]);assert.equal(g.validSave(g.state),true);
});

test('replace retains valuable matching plots and converts only excess plots through paid level-one construction',()=>{
 const e=prepare(),g=e.Game;g.state.plots.splice(0,12,...[10,8,5,3,1,1].map(level=>({type:'lumber',level})),...[10,8,5,1].map(level=>({type:'quarry',level})),{type:'farm',level:8},{type:'mine',level:8});
 const old=copy(g.state.plots),q=g.plotTemplateQuote('balanced','replace');assert.equal(q.replaces,4);assert.equal(q.builds,0);assert.equal(q.total,12);assert.equal(q.tasks.length,4);assert.equal(g.applyPlotTemplate('balanced','replace'),null);assert.deepEqual(copy(g.state.plots),old);assert.ok(g.state.buildQueue.every(job=>job.kind==='replace'&&job.level===1));finish(e);
 assert.deepEqual(types.map(id=>counts(g)[id]),[3,3,3,3]);for(const index of [0,1,2,6,7,8,10,11])assert.deepEqual(copy(g.state.plots[index]),old[index]);for(const index of [3,4,5,9])assert.equal(g.state.plots[index].level,1);assert.equal(g.state.plotTemplate.active,false);assert.equal(g.validSave(g.state),true);
});

test('templates wait for reserves and busy queues, then resume without cancelling an existing city project',()=>{
 const e=prepare(),g=e.Game;assert.equal(g.queueBuilding(g.state.cityLayout.indexOf(null),'house'),null);assert.equal(g.queueBuilding(g.state.cityLayout.indexOf(null),'house'),null);const jobs=copy(g.state.buildQueue);
 const reserve=copy(g.state.res);assert.equal(g.setAutomationSettings(settings(g,reserve)),null);assert.equal(g.applyPlotTemplate('balanced','fill'),null);assert.equal(g.state.plotTemplate.active,true);assert.deepEqual(copy(g.state.buildQueue),jobs);assert.match(g.plotTemplateStatus(),/建造队|工程/);
 e.advance(Math.max(...jobs.map(q=>q.end))-e.now()+1,true);assert.equal(g.state.buildQueue.length,0);assert.equal(g.state.plotTemplate.active,true);assert.match(g.plotTemplateStatus(),/资源|保留/);assert.equal(g.state.plots.filter(p=>p.type).length,0);
 assert.equal(g.setAutomationSettings(settings(g,Object.fromEntries(Object.keys(g.resources).map(id=>[id,0])))),null);g.tick(e.now(),true);assert.ok(g.state.buildQueue.length>0);finish(e);assert.deepEqual(types.map(id=>counts(g)[id]),[3,3,3,3]);assert.equal(g.state.buildings.house,1);assert.equal(g.state.cityLayout.filter(id=>id==='house').length,2);assert.equal(g.validSave(g.state),true);
});

test('ongoing plot replacements are projected and are neither rewritten nor charged twice across save reload',()=>{
 const e=prepare(),g=e.Game;g.state.plots[0]={type:'lumber',level:8};assert.equal(g.developPlot(0,'farm'),null);const ongoing=copy(g.state.buildQueue[0]);
 assert.equal(g.applyPlotTemplate('army','fill'),null);assert.deepEqual(copy(g.state.buildQueue.find(q=>q.plot===0)),ongoing);const q=g.plotTemplateQuote('army','fill');assert.deepEqual(types.map(id=>q.projectedCounts[id]),[9,1,1,1]);
 const queue=JSON.stringify(g.state.buildQueue),res=JSON.stringify(g.state.res),template=JSON.stringify(g.state.plotTemplate);g.save();g.init();assert.equal(JSON.stringify(g.state.buildQueue),queue);assert.equal(JSON.stringify(g.state.res),res);assert.equal(JSON.stringify(g.state.plotTemplate),template);finish(e);assert.deepEqual(types.map(id=>counts(g)[id]),[9,1,1,1]);assert.equal(g.state.plots[0].level,1);assert.equal(g.validSave(g.state),true);
});

test('pause, manual construction, cancelled jobs and auto-upgrade switching cannot silently requeue the template',()=>{
 for(const action of ['pause','manual','cancel','auto']){
  const e=prepare(),g=e.Game;assert.equal(g.applyPlotTemplate('army','fill'),null);assert.equal(g.state.plotTemplate.active,true);
  if(action==='pause')assert.equal(g.pausePlotTemplate(),null);
  if(action==='manual'){e.advance(Math.min(...g.state.buildQueue.map(q=>q.end))-e.now()+1,false);assert.equal(g.developPlot(5,'mine'),null);}
  if(action==='cancel')assert.equal(g.cancelBuild('plot:'+g.state.buildQueue[0].plot),null);
  if(action==='auto')assert.equal(g.setAutoUpgrade(true),null);
  assert.equal(g.state.plotTemplate.active,false);assert.equal(g.state.plotTemplate.id,'army');const templateJobs=g.state.buildQueue.filter(q=>q.plot!==undefined).length;g.tick(e.now(),true);assert.equal(g.state.plotTemplate.active,false);if(action!=='auto')assert.equal(g.state.buildQueue.filter(q=>q.plot!==undefined).length,templateJobs);assert.equal(g.validSave(g.state),true);
 }
 const {Game:g}=prepare();assert.equal(g.setAutoResearch(true),null);assert.equal(g.applyPlotTemplate('balanced','fill'),null);assert.equal(g.state.autoResearch,true);
});

test('legacy template-less saves migrate safely; malformed templates and invalid API arguments never change the saved city',()=>{
 const {Game:g}=prepare(),old=copy(g.state);delete old.plotTemplate;const raw=JSON.stringify(old),migrated=g.migrateSave(old);assert.equal(JSON.stringify(old),raw);assert.deepEqual(copy(migrated.plotTemplate),{id:null,active:false,mode:'fill'});assert.equal(g.validSave(migrated),true);g.importSave(old);assert.deepEqual(copy(g.state.plotTemplate),{id:null,active:false,mode:'fill'});
 for(const value of [null,[],{},'army',{id:'bad',active:false,mode:'fill'},{id:null,active:true,mode:'fill'},{id:'army',active:'true',mode:'fill'},{id:'army',active:false,mode:'bad'}]){const save=copy(g.state);save.plotTemplate=value;assert.equal(g.validSave(save),false);assert.throws(()=>g.importSave(save),/Invalid save/);}
 const conflict=copy(g.state);conflict.plotTemplate={id:'army',active:true,mode:'fill'};conflict.autoUpgrade=true;assert.equal(g.validSave(conflict),false);assert.throws(()=>g.importSave(conflict),/Invalid save/);
 const before=JSON.stringify(g.state);for(const bad of [null,'bad',0,{},[]]){assert.ok(g.setPlotTemplate(bad));assert.ok(g.applyPlotTemplate(bad,'fill'));}assert.ok(g.applyPlotTemplate('army','bad'));assert.equal(JSON.stringify(g.state),before);assert.equal(g.validSave(g.state),true);
});

test('a passive save session can inspect previews but cannot select, apply or pause another page template',()=>{
 const a=page();assert.equal(a.g.applyPlotTemplate('army','fill'),null);const b=page(a.store);assert.equal(b.g.saveSessionInfo().mode,'readonly');const raw=a.store.get('sanguo-city-v2'),before=JSON.stringify(b.g.state);
 assert.equal(b.g.plotTemplateQuote('balanced','replace').error,undefined);assert.match(b.g.setPlotTemplate('balanced'),/另一页面/);assert.match(b.g.applyPlotTemplate('balanced','replace'),/另一页面/);assert.match(b.g.pausePlotTemplate(),/另一页面/);assert.equal(JSON.stringify(b.g.state),before);assert.equal(a.store.get('sanguo-city-v2'),raw);assert.equal(a.g.state.plotTemplate.active,true);
});

test('an active layout follows newly opened fields but a completed layout never automatically restarts',()=>{
 const e=prepare(),g=e.Game;assert.equal(g.applyPlotTemplate('army','fill'),null);assert.equal(g.state.plotTemplate.active,true);city(g,{hall:2});finish(e);assert.equal(g.unlockedPlots(),15);assert.deepEqual(types.map(id=>counts(g)[id]),[12,1,1,1]);assert.equal(g.state.plotTemplate.active,false);const completed=copy(g.state.plots);city(g,{hall:3});g.tick(e.now(),true);assert.deepEqual(copy(g.state.plots),completed);assert.equal(g.state.buildQueue.length,0);assert.equal(g.validSave(g.state),true);
});
