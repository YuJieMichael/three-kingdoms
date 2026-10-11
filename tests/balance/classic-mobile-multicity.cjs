// Earned-save, real-occupation/founding/supply smoke. No resource/army/rank grants.
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const {loadGame,cloneActiveSave}=require('../helpers/game.cjs');
const repo=path.resolve(__dirname,'../..'),crypto=require('node:crypto'),code={version:require('../../package.json').version,revision:require('node:child_process').execFileSync('git',['rev-parse','HEAD'],{cwd:repo,encoding:'utf8'}).trim(),sourceHash:crypto.createHash('sha256').update(fs.readdirSync(repo).filter(n=>n.endsWith('.js')).sort().map(n=>n+'\n'+fs.readFileSync(path.join(repo,n),'utf8')).join('\n')).digest('hex')};
function run(seed){
 const source=JSON.parse(fs.readFileSync(path.join(__dirname,`../../production/qa/evidence/classic-mobile-0.34.71/earned-opening-${seed}.json`)));
 const e=loadGame(seed),g=e.Game;e.advance(source.state.last-e.now());assert.ok(!g.importSave(cloneActiveSave(source.state)));
 const home=g.currentHome(),near=[];for(let x=home.x-6;x<=home.x+6;x++)for(let y=home.y-6;y<=home.y+6;y++){const n=g.getWorldTile(x,y);if(n?.wild&&n.type==='plain')near.push(n);}near.sort((a,b)=>Math.hypot(a.x-home.x,a.y-home.y)-Math.hypot(b.x-home.x,b.y-home.y));
 const n=near.find(n=>!g.attackBlocked(n.id,'occupy'));assert.ok(n,'nearby flat-land target required');
 const hero=source.hero,army={archer:Math.min(800,g.state.army.archer)};
 assert.equal(g.setTactic('archer','advance',''),null);assert.equal(g.dispatch(n.id,hero,army,'occupy',true),null);
 e.advance(Math.ceil(g.state.expedition.end-e.now())+1);assert.equal(g.startBattle(),null);
 for(let turn=0;turn<30&&!g.state.battle.finished;turn++)g.battleRound();
 const result=JSON.parse(JSON.stringify(g.state.battle.result));if(!result.won)return {seed,normalEconomy:true,target:n.id,stage:'occupy nearby flat land',completed:false,error:'真实占领战未胜，未继续建城与运输',battle:result,validSave:g.validSave(g.state),state:cloneActiveSave(g.state)};
 e.advance(Math.max(1,Math.ceil((g.state.expedition?.end||e.now())-e.now())+1));g.dismissBattle();
 const q=g.foundCityQuote(n.id,'补给边城');assert.equal(q.reason,'');const gold=g.state.res.gold;assert.equal(g.foundCity(n.id,q.name,q.key),null);assert.equal(g.state.res.gold,gold-q.cost.gold);
 const destination='city_'+n.id,draft={sourceCity:'capital',destinationCity:destination,resource:'food',targetStock:1000,sourceReserve:10000,army:{militia:10},enabled:true};
 const sq=g.supplyLineQuote(draft);assert.equal(sq.reason,'');assert.equal(sq.plan.state,'ready');const food=g.state.res.food;assert.equal(g.saveSupplyLine(draft,sq.key),null);
 const job=g.logisticsList()[0];assert.ok(job);assert.equal(g.state.res.food,food-job.cargo.food-job.foodCost);
 assert.equal(g.setSupplyLineEnabled(job.supplyLine,false),null);e.advance(job.end-e.now()+1,true);assert.equal(g.logisticsList()[0].phase,'return');
 const delivered=g.getCityState(destination).res.food;assert.ok(delivered>=job.cargo.food);e.advance(g.logisticsList()[0].end-e.now()+1,true);assert.equal(g.logisticsList().length,0);
 assert.equal(g.validSave(g.state),true);g.save();g.init();assert.equal(g.validSave(g.state),true);
 return {seed,normalEconomy:true,completed:true,target:n.id,founded:destination,battle:result,foundingCost:q.cost,cargo:job.cargo,marchFood:job.foodCost,deliveredFood:delivered,supplyPaused:true,validSave:true,state:cloneActiveSave(g.state)};
}
if(require.main===module){const rows=[];for(const seed of [1,7,19]){try{const r=run(seed);rows.push({...r,code});console.log(JSON.stringify({seed,target:r.target,completed:r.completed,error:r.error,cargo:r.cargo,marchFood:r.marchFood,valid:r.validSave}));if(!r.completed)process.exitCode=1;}catch(error){rows.push({seed,error:error.message,location:error.stack?.split('\n').find(line=>line.includes('classic-mobile-multicity.cjs:'))?.trim()});console.error(seed,error.stack);process.exitCode=1;}}if(process.argv[2])fs.writeFileSync(process.argv[2],JSON.stringify(rows,null,2)+'\n');}
module.exports={run};
