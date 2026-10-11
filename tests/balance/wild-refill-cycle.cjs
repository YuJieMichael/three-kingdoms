// Earned-save diagnosis only. No product changes or resource/army/level grants.
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),crypto=require('node:crypto');
const {loadGame,cloneActiveSave}=require('../helpers/game.cjs');
const {run}=require('./classic-mobile-multicity.cjs');
const repo=path.resolve(__dirname,'../..');
const code={version:require('../../package.json').version,revision:require('node:child_process').execFileSync('git',['rev-parse','HEAD'],{cwd:repo,encoding:'utf8'}).trim(),sourceHash:crypto.createHash('sha256').update(fs.readdirSync(repo).filter(n=>n.endsWith('.js')).sort().map(n=>n+'\n'+fs.readFileSync(path.join(repo,n),'utf8')).join('\n')).digest('hex')};
const copy=x=>JSON.parse(JSON.stringify(x));
function snapshot(g,e,start){const q=g.trainingTemplateQuote('archer',true),b=g.economyBudget();return {hours:(e.now()-start)/3600000,archer:g.state.army.archer,wounded:g.state.warCare.wounded.archer,admitted:g.state.warCare.admitted.archer,treated:g.state.warCare.treated.archer,queued:g.state.trainQueue.filter(q=>q.id==='archer').reduce((n,q)=>n+q.count,0),population:g.state.population,workers:g.workers(),free:g.freePopulation(),gold:g.state.res.gold,food:g.state.res.food,budget:b,deficits:copy(q.deficits),blocked:copy(q.blocked),valid:g.validSave(g.state)};}
function refill(seed,source,policy){
 const e=loadGame(seed),g=e.Game;e.advance(source.last-e.now());assert.ok(!g.importSave(cloneActiveSave(source)));
 // Complete the actual returning expedition before measuring replacement.
 if(g.state.expedition?.phase==='return')e.advance(Math.max(1,Math.ceil(g.state.expedition.end-e.now())+1));
 if(g.state.battle?.finished)g.dismissBattle();
 const start=e.now(),before=snapshot(g,e,start),originalHeroes=[...g.state.generals],target={id:'archer',army:{archer:800}};
 const quote=g.trainingTemplateQuote(target);assert.equal(g.saveTrainingTemplate(quote.draft,quote.key),null);
 const medical=g.warCareQuote('archer'),medicalSources=copy(g.state.warCare.receipts);
 let treatment=null;
 if(policy==='heal-first'&&medical.available){treatment=g.healWounded('archer',medical.available,medical.key);assert.notEqual(typeof treatment,'string');}
 assert.equal(g.setTrainingTemplateEnabled(true),null);
 const checkpoints=[];let minimumGold=g.state.res.gold,minimumFood=g.state.res.food,reachedAt=null;
 for(let minute=1;minute<=72*60;minute++){
  e.advance(60000,true);minimumGold=Math.min(minimumGold,g.state.res.gold);minimumFood=Math.min(minimumFood,g.state.res.food);
  if(reachedAt===null&&g.state.army.archer>=800)reachedAt=minute/60;
  if([1,60,24*60,72*60].includes(minute))checkpoints.push(snapshot(g,e,start));
 }
 assert.equal(g.setTrainingTemplateEnabled(false),null);
 const beforeLateHeal=snapshot(g,e,start);
 if(policy==='heal-later'&&g.warCareQuote('archer').available){const q=g.warCareQuote('archer');treatment=g.healWounded('archer',q.available,q.key);assert.notEqual(typeof treatment,'string');}
 const after=snapshot(g,e,start);assert.equal(after.valid,true);g.save();g.init();assert.equal(g.validSave(g.state),true);
 return {seed,policy,target:800,before,medicalSources,treatment,checkpoints,beforeLateHeal,after,reachedAt,minimumGold,minimumFood,lostHeroes:originalHeroes.filter(id=>!g.state.generals.includes(id)),overshoot:Math.max(0,after.archer+after.queued-800),newAboveTargetAndRecoverable:Math.max(0,after.archer+after.queued-Math.max(800,before.archer+before.wounded))};
}
function lowLevelProbe(seed){
 const source=JSON.parse(fs.readFileSync(path.join(repo,`production/qa/evidence/classic-mobile-0.34.71/earned-opening-${seed}.json`)));
 const e=loadGame(seed),g=e.Game;e.advance(source.state.last-e.now());assert.ok(!g.importSave(cloneActiveSave(source.state)));
 const home=g.currentHome(),candidates=[];
 for(let x=Math.max(0,home.x-6);x<=Math.min(63,home.x+6);x++)for(let y=Math.max(0,home.y-6);y<=Math.min(63,home.y+6);y++){
  const n=g.getWorldTile(x,y);if(n?.wild&&n.type==='plain'&&!g.attackBlocked(n.id,'occupy'))candidates.push({id:n.id,level:n.level,distance:Math.hypot(x-home.x,y-home.y)});
 }
 // Only public level and distance affect selection; enemy army is never used to choose a target.
 candidates.sort((a,b)=>a.level-b.level||a.distance-b.distance||a.id.localeCompare(b.id));const target=candidates[0];assert.ok(target);
 const sq=g.scoutQuote(target.id,1);assert.ok(sq);let scoutError=sq.reason;
 if(!scoutError){scoutError=g.dispatchScout(target.id,1,sq.key)||'';assert.equal(scoutError,'');e.advance((sq.seconds+sq.returnSeconds)*1000+1);}
 const intel=g.intel(target.id),army={archer:Math.min(800,g.state.army.archer)};
 assert.equal(g.setTactic('archer','advance',''),null);assert.equal(g.dispatch(target.id,source.hero,army,'occupy',true),null);
 e.advance(Math.ceil(g.state.expedition.end-e.now())+1);assert.equal(g.startBattle(),null);
 const enemyInitial=g.state.battle.enemy.reduce((sum,r)=>sum+r.initial,0);
 for(let i=0;i<30&&!g.state.battle.finished;i++)g.battleRound();assert.equal(g.state.battle.finished,true);
 const result=copy(g.state.battle.result);assert.equal(g.validSave(g.state),true);
 return {selection:'Lowest public level, then distance within nearby 6-square search; no hidden-strength sorting',target,scout:{reason:scoutError,quote:{quality:sq.quality,cost:sq.cost,expectedLost:sq.expectedLost},intel:copy(intel)},sent:army.archer,enemyInitial,won:result.won,xp:result.xp,lost:result.lost.archer,wounded:result.wounded.archer,returned:result.back.archer,loot:result.loot,valid:true};
}
const results=[];
for(const seed of [1,7,19]){
 const battle=run(seed),r=battle.battle;
 const rules=loadGame(seed).Game;const cost=Object.fromEntries(Object.keys(rules.resources).map(k=>[k,Object.entries(r.lost).reduce((n,[id,count])=>n+count*(rules.units[id].cost[k]||0),0)]));
 const opening=JSON.parse(fs.readFileSync(path.join(repo,`production/qa/evidence/classic-mobile-0.34.71/earned-opening-${seed}.json`)));
 const row={seed,openingWounded:opening.state.warCare.wounded.archer,target:battle.target,won:r.won,xp:r.xp,lost:r.lost.archer,wounded:r.wounded.archer,returned:r.back.archer,loot:r.loot,bonusLoot:r.bonusLoot,replacementMaterials:cost,refill:[],lowLevelProbe:lowLevelProbe(seed)};
 for(const policy of ['heal-first','heal-later'])row.refill.push(refill(seed,battle.state,policy));
 results.push(row);console.log(JSON.stringify({seed,won:row.won,xp:row.xp,lost:row.lost,wounded:row.wounded,policies:row.refill.map(r=>({policy:r.policy,reachedAt:r.reachedAt,finalArcher:r.after.archer,queued:r.after.queued,overshoot:r.overshoot,free:r.after.free,blocked:r.after.blocked,lostHeroes:r.lostHeroes}))}));
}
const report={code,normalEconomy:true,description:'Same three earned openings and nearest real plain occupation as the released multi-city diagnosis; compare treatment before automatic 800-archer refill versus treatment after 72h online refill. Actual founding/supply costs retained for winning seed 7. No grants, no enemy sorting by hidden strength; not a general balance proof.',results};
if(process.argv[2])fs.writeFileSync(process.argv[2],JSON.stringify(report,null,2)+'\n');
