'use strict';
// Read-only diagnostic: real earned route, optional treasury reserve in the simulated player's funding policy.
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict'),{createRequire}=require('node:module');
function run(seed=7,reserve=false){
 const file=path.join(__dirname,'normal-famous-acquisition.cjs'),req=createRequire(file),helpers=req('../helpers/game.cjs'),mod={exports:{}},events=[];
 let source=fs.readFileSync(file,'utf8');
 function replace(old,next){assert.ok(source.includes(old),'diagnostic seam missing: '+old);source=source.replace(old,next);}
 if(reserve)replace('function funding(cost){for(let i=0;!g.canPay(cost);i++)',"function funding(cost){cost={...cost,gold:(cost.gold||0)+g.salaryQuote().rows.reduce((n,r)=>n+r.wage,0)*24};for(let i=0;!g.canPay(cost);i++)");
 replace('attempts<500','attempts<5000');replace('attempts===499','attempts===4999');
 replace("if(!guan.recruited)ok(g.recruitGarrisonGeneral('named_jiangling'))","if(!guan.recruited){const rq=heritage.recruitmentQuote(g.state,g.state.captureLevels[guan.general.id]?.level||70);if(rq.reason){ok(g.buyItem('nobleAdvanced'));ok(g.useItem('nobleAdvanced'));note('renewTemporaryNoble','nobleAdvanced',{gems:100});}ok(g.recruitGarrisonGeneral('named_jiangling'));}");
 function loadGame(seed){const e=helpers.loadGame(seed),g=e.Game,tick=g.tick,start=e.now();g.tick=(...args)=>{const before={hours:(e.now()-start)/3600000,gold:g.state.res.gold,owned:[...g.state.generals],loyalty:{...g.state.heroLoyalty},owed:{...g.state.heroService.owed},levels:{...g.state.generalLevels}};const result=tick(...args);for(const id of before.owned)if(!g.state.generals.includes(id))events.push({id,before,after:{gold:g.state.res.gold,owned:[...g.state.generals],service:JSON.parse(JSON.stringify(g.state.heroService))}});return result;};return e;}
 vm.runInNewContext(source,{require:id=>id.endsWith('/tests/helpers/game.cjs')?{...helpers,loadGame}:req(id),__dirname:path.dirname(file),module:mod,exports:mod.exports,process,console});
 const r=mod.exports.run(seed,{useFamous:true,siegeTemplate:true,siegeDiplomacy:true});
 return {seed,reserveHours:reserve?24:0,stage:r.stage,error:r.error||null,hours:r.hours,validSave:r.validSave,owned:r.state.generals,loyalty:r.state.heroLoyalty,stock:r.stock,events,assaults:r.log.filter(x=>x.kind==='siege'),renewals:r.log.filter(x=>x.kind==='renewTemporaryNoble'),diagnosticOverrides:['refill observer 5000, production unchanged','renew expired rank with earned gems',...(reserve?['player funding retains 24 hours of current total wages']:[])]};
}
if(require.main===module){const r=run(Number(process.argv[2]||7),process.argv.includes('--reserve'));console.log(JSON.stringify(r,null,2));if(r.error||!r.validSave)process.exitCode=1;}
module.exports={run};
