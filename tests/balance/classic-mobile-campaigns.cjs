// Earned-old-save difficulty/branch route diagnostic; real tokens/rental pools, no grants.
'use strict';
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),{loadGame,cloneActiveSave}=require('../helpers/game.cjs');
const repo=path.resolve(__dirname,'../..'),crypto=require('node:crypto'),code={version:require('../../package.json').version,revision:require('node:child_process').execFileSync('git',['rev-parse','HEAD'],{cwd:repo,encoding:'utf8'}).trim(),sourceHash:crypto.createHash('sha256').update(fs.readdirSync(repo).filter(n=>n.endsWith('.js')).sort().map(n=>n+'\n'+fs.readFileSync(path.join(repo,n),'utf8')).join('\n')).digest('hex')};
const total=a=>Object.values(a).reduce((n,x)=>n+x,0),plain=x=>JSON.parse(JSON.stringify(x));
function route(c,kind){const out=[];for(let i=1;i<=9;i++){if(kind==='all'&&[1,4,7].includes(i)){const arc=Math.floor((i-1)/3);out.push(c.sideIds[arc*2],c.sideIds[arc*2+1]);}out.push(c.mainIds[i-1]);}return out;}
function run(seed,campaign,kind){
 const source=JSON.parse(fs.readFileSync(path.join(__dirname,`../../production/qa/evidence/classic-mobile-0.34.71/earned-opening-${seed}.json`)));
 if(campaign==='nanman'){const prerequisite=run(seed,'yellow_turban',kind);assert.equal(prerequisite.completed,true,'earn Nanman unlock through actual Yellow Turban clears');source.state=prerequisite.state;}
 const e=loadGame(seed),g=e.Game;e.advance(source.state.last-e.now());g.importSave(cloneActiveSave(source.state));assert.equal(g.validSave(g.state),true);
 const c=e.evaluate(`BattlefieldData.config('${campaign}')`),reports=[],initialGold=g.state.res.gold,initialBoxes=(g.state.inventory.yellowEquipmentBox||0)+(g.state.inventory.barbarianEquipmentBox||0);
 for(const difficulty of ['simple','normal','hard']){
  const cap={simple:800,normal:1200,hard:2000}[difficulty],army={militia:cap},battles=[];let error='';
  if(!(g.state.inventory.reinforcementToken>0)){
   if(!g.state.battlefields.starterClaimed)error=g.claimStarterReinforcementToken()||'';
   if(!error&&!(g.state.inventory.reinforcementToken>0))error=g.buyReinforcementToken()||'';
  }
  const q=g.battlefieldQuote(source.hero,army,campaign,difficulty);if(!error)error=q.reason||g.startBattlefield(source.hero,army,q.key,campaign,difficulty)||'';
  if(!error)assert.equal(g.state.battlefields.run.difficulty,difficulty,'diagnostic must exercise the selected difficulty');
  if(!error)for(const id of route(c,kind)){
   const r=g.state.battlefields.run;if(!r){error='run ended before all selected nodes';break;}
   const missing=cap-(r.army.militia||0);if(missing){error=g.reinforceBattlefield({militia:missing})||'';if(error)break;}
   error=g.enterBattlefieldNode(id)||'';if(error)break;const b=r.battle;if(!b)continue;
   for(let turn=0;turn<60&&!b.finished;turn++)g.battlefieldRound();
   if(!b.finished){error=id+' turn bound exceeded';break;}
   battles.push({id,rounds:b.round,lost:total(b.result.lost),won:b.result.won,guards:total(Object.fromEntries(b.enemy.map(x=>[x.id,x.initial]))),remainingPool:g.state.battlefields.run?.pool??null});
   assert.equal(g.validSave(g.state),true,id);if(!b.result.won){error=id+' failed';break;}
  }
  const completed=!error&&!g.state.battlefields.run;
  if(process.argv[3]){fs.mkdirSync(process.argv[3],{recursive:true});fs.writeFileSync(path.join(process.argv[3],`earned-campaign-${seed}-${campaign}-${kind}-${difficulty}.json`),JSON.stringify({code,seed,campaign,kind,difficulty,normalEconomy:true,description:'Earned old save; actual starter/purchased tokens and actual battlefield route, no grants',state:cloneActiveSave(g.state)},null,2)+'\n');}
  reports.push({difficulty,cap,kind,error,completed,battles,receipt:completed?plain(g.state.battlefields.lastReceipt):null,validSave:g.validSave(g.state)});
  if(!completed)break;
 }
 const result={seed,campaign,kind,normalEconomy:true,sourceVersion:source.sourceVersion,goldSpent:initialGold-g.state.res.gold,boxesEarned:(g.state.inventory.yellowEquipmentBox||0)+(g.state.inventory.barbarianEquipmentBox||0)-initialBoxes,reports,completed:reports.length===3&&reports.every(r=>r.completed),validSave:g.validSave(g.state)};Object.defineProperty(result,'state',{value:cloneActiveSave(g.state)});return result;
}
if(require.main===module){const results=[];for(const seed of [1,7,19])for(const campaign of ['yellow_turban','nanman'])for(const kind of ['main','all']){try{const r=run(seed,campaign,kind);results.push(r);console.log(JSON.stringify({seed,campaign,kind,completed:r.completed,difficulties:r.reports.map(x=>({difficulty:x.difficulty,completed:x.completed,error:x.error})),boxes:r.boxesEarned}));if(!r.completed||!r.validSave)process.exitCode=1;}catch(error){results.push({seed,campaign,kind,error:error.message,completed:false});console.error(error.stack);process.exitCode=1;}}if(process.argv[2])fs.writeFileSync(process.argv[2],JSON.stringify({code,description:'Earned old-save real rental-token routes; difficulty unlock sequence and same-day shared boxes; no grants',results},null,2)+'\n');}
module.exports={run};
