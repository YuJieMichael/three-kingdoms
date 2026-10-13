'use strict';
// Reproducible player policy for earned chapter/siege inputs; no production or state grants.
// node tests/balance/classic-earned-preparation.cjs chapters|siege OUTPUT [SEED]
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'../..'),input=path.join(__dirname,'normal-famous-acquisition.cjs');
function run(seed=7,kind='siege'){
 assert.ok(['chapters','siege'].includes(kind));
 const code={version:require('../../package.json').version,revision:require('node:child_process').execFileSync('git',['rev-parse','HEAD'],{cwd:root,encoding:'utf8'}).trim(),sourceHash:require('node:crypto').createHash('sha256').update(fs.readdirSync(root).filter(n=>n.endsWith('.js')).sort().map(n=>n+'\n'+fs.readFileSync(path.join(root,n),'utf8')).join('\n')).digest('hex')};
 let source=fs.readFileSync(input,'utf8');
 function replace(a,b){assert.equal(source.split(a).length,2,'policy hook must remain unique');source=source.replace(a,b);}
 replace('function funding(cost){for(let i=0;', 'function funding(cost){cost={...cost,gold:(cost.gold||0)+g.salaryQuote().rows.reduce((n,r)=>n+r.wage,0)*24};for(let i=0;');
 replace('attempts<500;attempts++','attempts<5000;attempts++');
 replace('attempts===499','attempts===4999');
 replace("if(!guan.recruited)ok(g.recruitGarrisonGeneral('named_jiangling'));", "if(!guan.recruited){const q=heritage.recruitmentQuote(g.state,g.state.captureLevels[guan.general.id].level);if(q.reason){ok(g.buyItem('nobleAdvanced'));ok(g.useItem('nobleAdvanced'));note('temporaryNoble','nobleAdvanced',{gems:100,reason:'renew rank for actual captured level'});}ok(g.recruitGarrisonGeneral('named_jiangling'));}");
 const mod={exports:{}};vm.runInNewContext(source,{require:id=>id.startsWith('.')?require(path.resolve(path.dirname(input),id)):require(id),module:mod,exports:mod.exports,__dirname:path.dirname(input),process,console,Buffer});
 const result=mod.exports.run(seed,{stopAfterChapters:kind==='chapters',useFamous:true,siegeDiplomacy:true,siegeTemplate:true});
 return {code,normalEconomy:true,policy:'Player funds planned costs plus24h wages, uses actual market/earned rewards, renews rank with earned100gems; refill observer5000. No grants or production overrides.',...result};
}
if(require.main===module){const kind=process.argv[2]||'siege',result=run(Number(process.argv[4]||7),kind);if(process.argv[3])fs.writeFileSync(process.argv[3],JSON.stringify(result,null,2)+'\n');console.log(JSON.stringify({kind,seed:result.seed,stage:result.stage,hours:result.hours,error:result.error||null,valid:result.validSave}));if(result.error||!result.validSave)process.exitCode=1;}
module.exports={run};
