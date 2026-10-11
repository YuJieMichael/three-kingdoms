// Normal-economy diagnostic: earned v0.34.70 saves, no resource or hero grants.
// This checks a 72-game-hour grain-city policy then paid archer-template refill, not all progression or optimal play.
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const {loadGame,cloneActiveSave}=require('../helpers/game.cjs');
const repo=path.resolve(__dirname,'../..'),crypto=require('node:crypto'),code={version:require('../../package.json').version,revision:require('node:child_process').execFileSync('git',['rev-parse','HEAD'],{cwd:repo,encoding:'utf8'}).trim(),sourceHash:crypto.createHash('sha256').update(fs.readdirSync(repo).filter(n=>n.endsWith('.js')).sort().map(n=>n+'\n'+fs.readFileSync(path.join(repo,n),'utf8')).join('\n')).digest('hex')};
const results=[];
for(const seed of [1,7,19]){
 const source=JSON.parse(fs.readFileSync(path.join(__dirname,`../../production/qa/evidence/classic-mobile-0.34.71/earned-opening-${seed}.json`)));
 const env=loadGame(seed),g=env.Game;env.advance(source.state.last-env.now());
 assert.ok(!g.importSave(cloneActiveSave(source.state)));assert.equal(g.validSave(g.state),true);
 const initial=JSON.parse(JSON.stringify(g.state)),before=JSON.stringify(g.state),budget=g.economyBudget(),quote=g.cityPresetQuote('grain');
 assert.equal(JSON.stringify(g.state),before,'budget and preset preview must be pure');
 assert.equal(g.applyCityPreset(quote.draft,quote.key),null);
 let minimumGold=g.state.res.gold,minimumFood=g.state.res.food;
 for(let minute=0;minute<72*60;minute++){env.advance(60000,true);minimumGold=Math.min(minimumGold,g.state.res.gold);minimumFood=Math.min(minimumFood,g.state.res.food);}
 const after=g.economyBudget(),grainCheckpoint={gold:g.state.res.gold,food:g.state.res.food,budget:after},trainingStart=env.now();
 const tq=g.trainingTemplateQuote('archer');assert.equal(g.saveTrainingTemplate(tq.draft,tq.key),null);
 const firstQuote=g.trainingTemplateQuote('archer'),initialTrainingBlock={reason:firstQuote.reason,blocked:firstQuote.blocked,population:g.state.population,workers:g.workers(),free:g.freePopulation(),max:g.maxPop()};
 const housingDraft=g.cityPresetQuote('grain').draft;housingDraft.buildings.house=10;housingDraft.buildings.hall=10;const hq=g.cityPresetQuote(housingDraft);assert.equal(g.applyCityPreset(hq.draft,hq.key),null);
 for(let minute=0;minute<24*60;minute++)env.advance(60000,true);
 const housingCheckpoint={population:g.state.population,workers:g.workers(),free:g.freePopulation(),max:g.maxPop(),actualHouse:g.requirementLevel('house'),actualHall:g.requirementLevel('hall'),buildQueues:g.state.buildQueue.length};
 const fq=g.trainingTemplateQuote('archer'),preTrain={...g.state.res};const trainingError=fq.orders.length?(g.fillTrainingTemplate(fq.key)||''):fq.reason;
 const paid=Object.fromEntries(Object.keys(g.resources).map(id=>[id,preTrain[id]-g.state.res[id]]));
 assert.equal(g.setTrainingTemplateEnabled(true),null);
 for(let minute=0;minute<24*60&&!Object.entries(fq.draft.army).every(([id,count])=>(g.state.army[id]||0)>=count);minute++)env.advance(60000,true);
 assert.equal(g.setTrainingTemplateEnabled(false),null);
 const training={initialTrainingBlock,housingCorrection:{houseTarget:10,hallTarget:10,hours:24,...housingCheckpoint},preset:'archer',hours:(env.now()-trainingStart)/3600000,firstBatchPaid:paid,orders:fq.orders,initialRemaining:fq.remaining,initialBatchBlocked:fq.blocked,error:trainingError,completed:Object.entries(fq.draft.army).every(([id,count])=>(g.state.army[id]||0)>=count),army:{...g.state.army},budget:g.economyBudget()};
 const valid=g.validSave(g.state);
 if(process.argv[3]){fs.mkdirSync(process.argv[3],{recursive:true});fs.writeFileSync(path.join(process.argv[3],`earned-grain-training-${seed}.json`),JSON.stringify({code,seed,normalEconomy:true,description:'Original earned save; 72h grain city, paid 24h housing expansion and automatic archer refill; no grants',state:cloneActiveSave(g.state)},null,2)+'\n');}
 const lostHeroes=initial.generals.filter(id=>!g.state.generals.includes(id));
 assert.equal(valid,true);
 results.push({seed,sourceVersion:source.sourceVersion,normalEconomy:source.normalEconomy,policy:'grain preset; tick once per game minute for 72 hours; existing policies retained',grainPhaseHours:72,totalHours:(env.now()-initial.last)/3600000,grainCheckpoint,initial:{gold:initial.res.gold,food:initial.res.food,budget},final:{gold:g.state.res.gold,food:g.state.res.food,budget:g.economyBudget(),plots:g.state.plots,queues:g.state.buildQueue.length,preset:g.state.cityPreset},grainMinimumGold:minimumGold,grainMinimumFood:minimumFood,lostHeroes,training,validSave:valid,foodSustainable:after.foodNet>=0});
}
const report={code,description:'Earned-old-save 72h grain-city operating diagnostic; no resources/levels/army granted, followed by a real 24h housing expansion policy and paid archer-template refill; not full economic balance.',results};
const output=process.argv[2];if(output)fs.writeFileSync(output,JSON.stringify(report,null,2)+'\n');
for(const r of results)console.log(JSON.stringify({seed:r.seed,initialFoodNet:r.initial.budget.foodNet,finalFoodNet:r.final.budget.foodNet,grainFoodNet:r.grainCheckpoint.budget.foodNet,gold:r.final.gold,grainMinimumGold:r.grainMinimumGold,lostHeroes:r.lostHeroes,valid:r.validSave,foodSustainable:r.foodSustainable,trainingCompleted:r.training.completed,trainingError:r.training.error,initialBatchBlocked:r.training.initialBatchBlocked}));
if(results.some(r=>!r.validSave||r.lostHeroes.length||!r.training.completed))process.exitCode=1;
