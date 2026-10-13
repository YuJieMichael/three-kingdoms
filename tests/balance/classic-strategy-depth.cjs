// Normal-earned-save integration evidence, never grants resources/army/levels.
'use strict';
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),crypto=require('node:crypto');
const {loadGame,cloneActiveSave}=require('../helpers/game.cjs');
const {run:nearestBattle}=require('./classic-mobile-multicity.cjs');
const root=path.resolve(__dirname,'../..'),plain=x=>JSON.parse(JSON.stringify(x));
const code=()=>({version:require('../../package.json').version,revision:require('node:child_process').execFileSync('git',['rev-parse','HEAD'],{cwd:root,encoding:'utf8'}).trim(),sourceHash:crypto.createHash('sha256').update(fs.readdirSync(root).filter(n=>n.endsWith('.js')).sort().map(n=>n+'\n'+fs.readFileSync(path.join(root,n))).join('\n')).digest('hex')});
function earned(seed){return JSON.parse(fs.readFileSync(path.join(root,`production/qa/evidence/classic-mobile-0.34.71/earned-opening-${seed}.json`)));}
function loaded(seed,s){const e=loadGame(seed),g=e.Game;e.advance(s.last-e.now());assert.ok(!g.importSave(cloneActiveSave(s)));assert.equal(g.validSave(g.state),true);return e;}
function recovery(seed){
 const battle=nearestBattle(seed),e=loaded(seed,battle.state),g=e.Game;
 if(g.state.expedition?.phase==='return')e.advance(Math.max(1,Math.ceil(g.state.expedition.end-e.now())+1));
 if(g.state.battle?.finished)g.dismissBattle();
 const before={healthy:g.state.army.archer,wounded:g.state.warCare.wounded.archer,gold:g.state.res.gold},heroes=[...g.state.generals];
 let q=g.trainingTemplateQuote({id:'archer',army:{archer:800}});assert.equal(g.saveTrainingTemplate(q.draft,q.key),null);
 assert.equal(g.setRecoveryPriority(true),null);assert.equal(g.setAutoHeal(true),null);assert.equal(g.setTrainingTemplateEnabled(true),null);
 const start=e.now();let reachedAt=null,minGold=g.state.res.gold;
 for(let i=1;i<=4320;i++){e.advance(60000,true);minGold=Math.min(minGold,g.state.res.gold);if(reachedAt===null&&g.state.army.archer>=800)reachedAt=i/60;}
 const after={healthy:g.state.army.archer,wounded:g.state.warCare.wounded.archer,queued:g.state.trainQueue.filter(q=>q.id==='archer').reduce((n,q)=>n+q.count,0),gold:g.state.res.gold};
 const newAboveTarget=Math.max(0,after.healthy+after.queued-Math.max(800,before.healthy+before.wounded));
 assert.equal(newAboveTarget,0,'recovery-first must not recruit above legitimate recovered target');assert.equal(g.validSave(g.state),true);g.save();g.init();assert.equal(g.validSave(g.state),true);
 return {seed,won:battle.battle.won,before,after,reachedAt,hours:(e.now()-start)/3600000,minGold,newAboveTarget,lostHeroes:heroes.filter(id=>!g.state.generals.includes(id)),recoveryView:plain(g.recoveryView()),valid:true};
}
function publicTargets(seed){
 const source=earned(seed),e=loaded(seed,source.state),g=e.Game,views={};
 for(const stage of ['beginner','advanced','famous']){const before=JSON.stringify(g.state);views[stage]=plain(g.trainingTargets(stage));assert.equal(JSON.stringify(g.state),before,'target view cannot mutate');}
 const target=views.beginner[0];assert.ok(target,'earned player has a public beginner target');
 const q=g.scoutQuote(target.id,1);assert.equal(q.reason,'');assert.equal(g.dispatchScout(target.id,1,q.key),null);e.advance(q.seconds*1000);const intel=plain(g.intel(target.id));assert.equal(intel.precision,'types');e.advance(q.returnSeconds*1000);
 g.setTactic('archer','advance','');assert.equal(g.dispatch(target.id,source.hero,{archer:Math.min(800,g.state.army.archer)},'raid',false),null);e.advance(Math.ceil(g.state.expedition.end-e.now())+1);assert.equal(g.startBattle(),null);
 for(let t=0;t<30&&!g.state.battle.finished;t++)g.battleRound();assert.ok(g.state.battle.finished,'actual public target battle settles');const result=plain(g.state.battle.result);
 if(g.state.expedition?.phase==='return')e.advance(Math.ceil(g.state.expedition.end-e.now())+1);g.dismissBattle();assert.equal(g.validSave(g.state),true);
 return {seed,views,target,intel,actualBattle:result,valid:true};
}

function namedTown(seed){
 const source=earned(seed),e=loaded(seed,source.state),g=e.Game,rounds=[],initialCapitalRates=plain(g.rates());let error='';
 for(let i=0;i<3&&!g.state.conquered.yellow_qingshi;i++){
  if(g.state.cooldowns.yellow_qingshi>e.now())e.advance(g.state.cooldowns.yellow_qingshi-e.now()+1);
  g.setTactic('archer','advance','');error=g.dispatch('yellow_qingshi',source.hero,{archer:Math.min(800,g.state.army.archer)},'occupy',true)||'';if(error)break;
  e.advance(Math.ceil(g.state.expedition.end-e.now())+1);error=g.startBattle()||'';if(error)break;
  for(let t=0;t<30&&!g.state.battle.finished;t++)g.battleRound();
  if(!g.state.battle.finished){error='actual battle exceeded30rounds';break;}
  const r=plain(g.state.battle.result);rounds.push({won:r.won,lost:r.lost.archer,wounded:r.wounded.archer,xp:r.xp});
  if(!r.won){error='actual town battle lost';break;}
  if(g.state.expedition?.phase==='return')e.advance(Math.ceil(g.state.expedition.end-e.now())+1);g.dismissBattle();
 }
 const claimed=!!g.state.conquered.yellow_qingshi,capitalRatesAfter=plain(g.rates());assert.equal(error,'','actual earned occupation has no unresolved error');assert.equal(claimed,true,'real town acquisition must complete');let named=null;
 if(claimed){assert.equal(g.switchCity('city_yellow_qingshi'),null);const before=JSON.stringify(g.state),territory=e.evaluate('CityStrategy.territory(Game.state,Game.cityMeta())');assert.equal(JSON.stringify(g.state),before);assert.equal(territory.production.food,1.05);assert.equal(territory.production.gold,1);const before24=plain(g.state.res),summary=plain(g.citySummary(g.currentCityId()));for(let h=0;h<24;h++)e.advance(3600000,true);named={city:g.cityMeta(),rates:plain(g.rates()),territory:plain(territory),summary,before24,after24:plain(g.state.res),budget:plain(g.economyBudget())};g.save();g.init();assert.equal(g.validSave(g.state),true);}
 assert.equal(g.validSave(g.state),true);return {seed,error,rounds,claimed,initialCapitalRates,capitalRatesAfter,named,valid:true};
}

function cityHero(id='named_changshan'){
 const inputFile=path.join(root,'production/qa/evidence/classic-strategy-depth-0.34.72/earned-siege-7.json'),source=JSON.parse(fs.readFileSync(fs.existsSync(inputFile)?inputFile:'/tmp/classic-depth-siege-earned-7.json')),e=loaded(7,source.state),g=e.Game,start=e.now(),actions=[],initial=plain(g.state.res),initialBoxes=(g.state.inventory.yellowEquipmentBox||0)+(g.state.inventory.barbarianEquipmentBox||0),commander='local_1000000000000001';let error='',recruited=null;
 function act(err){if(err)throw Error(err);}
 function reserve(){return g.salaryQuote().rows.reduce((n,r)=>n+r.wage,0)*24;}
 function funding(gold){for(let t=0;g.state.res.gold<gold+reserve()&&t<48;t++){let sold=false;for(const resource of ['iron','stone','wood']){const n=Math.min(g.tradeQuote(resource,false).limit,Math.max(0,Math.floor(g.state.res[resource]-10000)));if(n>0){act(g.trade(resource,n,false));actions.push({action:'sell',resource,n});sold=true;if(g.state.res.gold>=gold+reserve())break;}}if(!sold)e.advance(3600000,true);}if(g.state.res.gold<gold+reserve())throw Error('earned treasury cannot preserve24h wages');}
 try{
  if(['named_xuchang','named_chaisang'].includes(id))for(const county of ['named_hanchuan','named_luoshui','named_baishi','yellow_qingshi']){
   for(let attempt=0;!g.state.conquered[county]&&attempt<4;attempt++){
    if(g.state.cooldowns[county]>e.now())e.advance(g.state.cooldowns[county]-e.now()+1);
    const army={archer:Math.min(8000,g.state.army.archer),shield:Math.min(2500,g.state.army.shield),ram:Math.min(60,g.state.army.ram)};for(const unit of Object.keys(army))act(g.setTactic(unit,'advance',''));act(g.dispatch(county,commander,army,'occupy',true));e.advance(Math.ceil(g.state.expedition.end-e.now())+1);act(g.startBattle());for(let t=0;t<30&&!g.state.battle.finished;t++)g.battleRound();assert.ok(g.state.battle.finished);const r=plain(g.state.battle.result);actions.push({action:'actualPrerequisiteBattle',node:county,won:r.won,claimed:r.claimed,lost:r.lost,wounded:r.wounded,xp:r.xp});if(!r.won)throw Error('actual prerequisite county battle lost');if(g.state.expedition?.phase==='return')e.advance(Math.ceil(g.state.expedition.end-e.now())+1);g.dismissBattle();
   }
   assert.ok(g.state.conquered[county],'actual prerequisite county captured');
  }
  for(let day=0;g.garrisonStatus(id).loyalty>=30&&day<8;day++){
   const pq=g.persuadeGarrisonQuote(id);if(!pq.reason){funding(pq.cost);act(g.persuadeGarrison(id));actions.push({action:'persuade',cost:pq.cost});}
   const sq=g.sowGarrisonQuote(id);if(!sq.reason){act(g.sowGarrison(id));actions.push({action:'sow',loss:sq.loss});}
   if(g.garrisonStatus(id).loyalty<30)break;e.advance(86400000,true);
  }
  const before=g.garrisonStatus(id),army={archer:Math.min(8000,g.state.army.archer),shield:Math.min(2500,g.state.army.shield),ram:Math.min(60,g.state.army.ram)};
  for(const unit of Object.keys(army))act(g.setTactic(unit,'advance',''));act(g.dispatch(id,commander,army,'occupy',true));e.advance(Math.ceil(g.state.expedition.end-e.now())+1);act(g.startBattle());for(let t=0;t<30&&!g.state.battle.finished;t++)g.battleRound();assert.ok(g.state.battle.finished);const r=plain(g.state.battle.result);actions.push({action:'actualBattle',loyaltyBefore:before.loyalty,army,result:r});if(!r.won)throw Error('actual namedcity battle lost');if(!r.claimed)throw Error('actual victory did not occupy');
  if(g.state.expedition?.phase==='return')e.advance(Math.ceil(g.state.expedition.end-e.now())+1);g.dismissBattle();const st=g.garrisonStatus(id);if(!st.captive)throw Error('actual named general not captured');
  const h=e.evaluate('HeritageSystem'),rq=h.recruitmentQuote(g.state,g.state.captureLevels[st.general.id].level);if(rq.reason){act(g.buyItem('nobleAdvanced'));act(g.useItem('nobleAdvanced'));actions.push({action:'renewTemporaryRank',gems:100});}
  funding(0);act(g.recruitGarrisonGeneral(id));assert.ok(g.state.generals.includes(st.general.id));recruited={id:st.general.id,level:g.state.generalLevels[st.general.id],stats:plain(g.general(st.general.id)),capture:plain(g.state.captureLevels[st.general.id])};assert.equal((g.state.inventory.yellowEquipmentBox||0)+(g.state.inventory.barbarianEquipmentBox||0)-initialBoxes,0,'city generals grant no barbarian or yellow firstcapture boxes');g.save();g.init();assert.equal(g.validSave(g.state),true);
 }catch(err){error=err.message;}
 const out={id,normalEconomy:true,error,completed:!error,policy:'Daily diplomacy visits follow actual offline accumulation cap; wars are actualmanual rounds, no grants.',hours:(e.now()-start)/3600000,initial,final:plain(g.state.res),actions,recruited,status:plain(g.garrisonStatus(id)),valid:g.validSave(g.state)};Object.defineProperty(out,'state',{value:cloneActiveSave(g.state)});return out;
}

function factionRoute(seed,mode='field',multicity=false){
 const source=multicity?JSON.parse(fs.readFileSync(path.join(root,'production/qa/evidence/classic-mobile-0.34.71/earned-multicity-7.json'))):earned(seed),e=loaded(seed,source.state),g=e.Game,hero=source.hero||earned(seed).hero,initial={army:plain(g.state.army),res:plain(g.state.res)},start=e.now();
 assert.equal(g.factionView().enabled,false);const before=JSON.stringify(g.state);g.factionView();g.factionToggleQuote(true);assert.equal(JSON.stringify(g.state),before);
 assert.equal(g.setFactionsEnabled(true,g.factionToggleQuote(true).key),null);e.advance(6*3600000,true);assert.equal(g.state.realm.factions.camps.length,1);const camp=plain(g.state.realm.factions.camps[0]),campState=cloneActiveSave(g.state);let warning=null,warningState=null,result=null,error='';
 try{
  if(mode==='defense'){
   const other=multicity?Object.keys(g.state.realm.cities).find(id=>id!=='capital'):null;if(other)assert.equal(g.switchCity(other),null);
   e.advance(6*3600000,true);if(other){assert.equal(g.state.cityDefense.incoming,null);warning=plain(g.getCityState('capital').cityDefense.incoming);assert.equal(warning.faction.id,camp.id);assert.equal(g.switchCity('capital'),null);}else warning=plain(g.state.cityDefense.incoming);
   assert.equal(warning.arriveAt-e.now(),900000);warningState=cloneActiveSave(g.state);assert.equal(g.setFactionsEnabled(false,g.factionToggleQuote(false).key),null);assert.deepEqual(plain(g.state.cityDefense.incoming),warning);e.advance(900000,true);
   assert.equal(g.startCityDefense(false,hero,{archer:Math.min(800,g.state.army.archer)}),null);result=plain(g.state.cityDefense.battle?g.resolveCityDefense():g.state.cityDefense.reports[0]);assert.ok(result&&typeof result==='object','actual defense receipt exists');
  }else{
   assert.equal(g.setTactic('archer','advance',''),null);assert.equal(g.dispatch(camp.node,hero,{archer:Math.min(800,g.state.army.archer)},'raid',false),null);e.advance(Math.ceil(g.state.expedition.end-e.now())+1);assert.equal(g.startBattle(),null);for(let turn=0;turn<40&&!g.state.battle.finished;turn++)g.battleRound();assert.ok(g.state.battle.finished,'actual faction field battle settles');result=plain(g.state.battle.result);if(g.state.expedition?.phase==='return')e.advance(Math.ceil(g.state.expedition.end-e.now())+1);g.dismissBattle();
  }
  assert.equal(g.state.realm.factions.camps.some(c=>c.id===camp.id),!result.won);g.save();g.init();assert.equal(g.validSave(g.state),true);
 }catch(err){error=err.message;}
 const out={seed,mode,multicity,normalEconomy:true,hours:(e.now()-start)/3600000,initial,camp,warning,result,error,completed:!error&&!!result?.won,final:{army:plain(g.state.army),res:plain(g.state.res),wounded:plain(g.state.warCare.wounded)},factions:plain(g.factionView()),valid:g.validSave(g.state)};Object.defineProperties(out,{state:{value:cloneActiveSave(g.state)},campState:{value:campState},warningState:{value:warningState}});return out;
}

function factionCycle(seed){
 const source=earned(seed),e=loaded(seed,source.state),g=e.Game,rows=[],initial=plain(g.state.res);assert.equal(g.setFactionsEnabled(true,g.factionToggleQuote(true).key),null);assert.equal(g.setAutoHeal(true),null);
 for(const faction of ['yellow','shanyue','wuhuan']){
  e.advance(Math.max(1,g.state.realm.factions.nextAt-e.now()),true);const c=plain(g.state.realm.factions.camps[0]);assert.equal(c.faction,faction);const army={archer:Math.min(800,g.state.army.archer)};assert.equal(g.setTactic('archer','advance',''),null);assert.equal(g.dispatch(c.node,source.hero,army,'raid',false),null);const frozen=plain(g.state.expedition.enemySnapshot);e.advance(Math.ceil(g.state.expedition.end-e.now())+1);assert.equal(g.startBattle(),null);for(let t=0;t<40&&!g.state.battle.finished;t++)g.battleRound();assert.ok(g.state.battle.finished);const result=plain(g.state.battle.result);rows.push({faction,node:c.node,army,frozen,result});if(g.state.expedition?.phase==='return')e.advance(Math.ceil(g.state.expedition.end-e.now())+1);g.dismissBattle();if(!result.won)break;
  const missing=800-g.state.army.archer;if(missing>0){assert.equal(g.train('archer',missing),null);e.advance(Math.max(1,g.state.trainQueue.at(-1).end-e.now()+1),true);}assert.equal(g.validSave(g.state),true);
 }
 g.save();g.init();return {seed,normalEconomy:true,initial,final:plain(g.state.res),rows,completed:rows.length===3&&rows.every(r=>r.result.won),valid:g.validSave(g.state)};
}

function practicalLessons(seed){
 const source=earned(seed),e=loaded(seed,source.state),g=e.Game,rows=[],before=JSON.stringify(g.state),stored=g.exportStoredRaw();
 for(const id of ['shield_archer','spear_block_cavalry','siege_gate'])for(const controls of ['recommended','failed']){
  assert.equal(g.startTacticalLesson(id),null);assert.equal(g.currentBattle().round,0);assert.equal(g.lessonInfo().result,null);if(controls==='failed'){if(id==='siege_gate')assert.equal(g.lessonAllOrders('hold'),null);else{assert.equal(g.lessonOrder(0,'fallback'),null);assert.equal(g.lessonOrder(1,'advance'),null);}}
  const initial=plain(g.currentBattle());for(let t=0;t<30&&!g.currentBattle().finished;t++){g.lessonRound();assert.equal(JSON.stringify(g.state),before,'lesson round must leave entire formal save unchanged');assert.equal(g.exportStoredRaw(),stored,'lesson cannot write formal stored bytes');}
  assert.ok(g.currentBattle().finished,'actual lesson resolves within bounded rounds');const result=plain(g.lessonInfo().result);if(controls==='recommended'){assert.equal(result.won,true);assert.equal(result.objectiveMet,true);}else assert.equal(result.objectiveMet,false,'failed advertised controls cannot complete practical objective');
  rows.push({id,controls,initial,result,observed:plain(g.lessonInfo().observed)});assert.equal(g.endTacticalLesson(),null);assert.equal(JSON.stringify(g.state),before);assert.equal(g.exportStoredRaw(),stored);
 }
 assert.equal(g.validSave(g.state),true);return {seed,normalEconomy:true,rows,completed:rows.length===6,formalStateAndStoredBytesUnchanged:true,valid:true};
}

function historicalCampaign(seed,campaign,kind){
 const row=require('./classic-mobile-campaigns.cjs').run(seed,campaign,kind);
 if(row.completed){
  assert.equal(row.boxesEarned,1,'three same-day difficulty clears share exactly one campaign box');
  const e=loaded(seed,row.state),g=e.Game;
  for(const [i,r] of row.reports.entries()){
   assert.equal(r.receipt.box,i===0?1:0);const reward=e.evaluate(`BattlefieldData.scaledReward(${JSON.stringify(r.receipt.completed)},${JSON.stringify(campaign)},${JSON.stringify(r.difficulty)})`);
   assert.equal(r.receipt.prestige,i===0?reward.prestige:Math.floor(reward.prestige/2));assert.equal(r.receipt.xp,i===0?reward.xp:Math.floor(reward.xp/2));
  }
  g.save();g.init();assert.equal(g.validSave(g.state),true);
 }
 return row;
}

function rentalMain(e,hero,campaign){
 const g=e.Game,army={militia:800},battles=[];
 if(!(g.state.inventory.reinforcementToken>0)){const action=g.state.battlefields.starterClaimed?g.buyReinforcementToken():g.claimStarterReinforcementToken();assert.equal(action,null);}
 const q=g.battlefieldQuote(hero,army,campaign,'simple');assert.equal(q.reason,'');assert.equal(g.startBattlefield(hero,army,q.key,campaign,'simple'),null);
 const c=e.evaluate(`BattlefieldData.config(${JSON.stringify(campaign)})`);
 for(const id of c.mainIds){const r=g.state.battlefields.run,missing=800-(r.army.militia||0);if(missing)assert.equal(g.reinforceBattlefield({militia:missing}),null);assert.equal(g.enterBattlefieldNode(id),null);const b=r.battle;for(let t=0;t<30&&!b.finished;t++)g.battlefieldRound();assert.equal(b.finished,true);assert.equal(b.result.won,true);battles.push({id,rounds:b.round,result:plain(b.result)});assert.equal(g.validSave(g.state),true);}
 assert.equal(g.state.battlefields.run,null);return {battles,receipt:plain(g.state.battlefields.lastReceipt)};
}

function historicalIndependentBoxes(seed){
 const source=earned(seed),e=loaded(seed,source.state),g=e.Game,army=plain(g.state.army),initialBoxes=(g.state.inventory.yellowEquipmentBox||0)+(g.state.inventory.barbarianEquipmentBox||0),rows=[];
 for(const campaign of ['ten_eunuchs','dongzhuo']){const r=rentalMain(e,source.hero,campaign);assert.equal(r.receipt.box,1);rows.push({campaign,...r});g.save();g.init();assert.equal(g.validSave(g.state),true);}
 assert.equal(rows[0].receipt.day,rows[1].receipt.day);assert.equal((g.state.inventory.yellowEquipmentBox||0)+(g.state.inventory.barbarianEquipmentBox||0)-initialBoxes,2);assert.deepEqual(plain(g.state.army),army);
 return {seed,normalEconomy:true,rows,daily:plain(g.state.battlefields.daily),boxesEarned:2,completed:true,valid:true};
}

function historicalNextDay(seed,campaign){
 const original=historicalCampaign(seed,campaign,'all');assert.equal(original.completed,true);
 const e=loaded(seed,original.state),g=e.Game,source=earned(seed),initialBoxes=(g.state.inventory.yellowEquipmentBox||0)+(g.state.inventory.barbarianEquipmentBox||0),formalArmy=plain(g.state.army),beforeDay=g.state.battlefields.lastReceipt.day;
 e.advance(86400000,true);const {battles,receipt}=rentalMain(e,source.hero,campaign);
 assert.notEqual(receipt.day,beforeDay);assert.equal(receipt.box,1);assert.equal((g.state.inventory.yellowEquipmentBox||0)+(g.state.inventory.barbarianEquipmentBox||0)-initialBoxes,1);
 const reward=e.evaluate(`BattlefieldData.scaledReward(${JSON.stringify(receipt.completed)},${JSON.stringify(campaign)},'simple')`);assert.equal(receipt.prestige,reward.prestige);assert.equal(receipt.xp,reward.xp);assert.deepEqual(plain(g.state.army),formalArmy,'rental battles cannot consume formal troops');g.save();g.init();assert.equal(g.validSave(g.state),true);
 return {seed,campaign,normalEconomy:true,description:'Actual previous-day three-difficulty clear then24h wait and new simple fullclear; legitimate token purchase, no grants.',beforeDay,receipt,battles,completed:true,valid:true};
}

function main(){
 const report={code:code(),normalEconomy:true,description:'All seven systems on genuinely earned old saves; actual battles, recovery, captured cities, faction arrivals, educational success/failure and rental campaigns. Independent city-hero branches use the archived earned siege input. No grants; failures retained.',recovery:[],publicTargets:[],namedTowns:[],cityHeroes:[],factions:[],factionCycles:[],lessons:[],campaigns:[],nextDayCampaigns:[],independentCampaignBoxes:[],failures:[]};
 function check(group,label,fn){
  try{const row=fn();report[group].push(row);const ok=!row.error&&row.completed!==false&&row.valid!==false&&row.validSave!==false;
   console.log(JSON.stringify({group,label,completed:ok,error:row.error||''}));if(!ok){report.failures.push({group,label,error:row.error||'route incomplete or invalid'});process.exitCode=1;}
  }catch(error){const row={label,completed:false,error:error.message,stack:error.stack};report[group].push(row);report.failures.push({group,...row});console.error(JSON.stringify({group,label,error:error.message}));process.exitCode=1;}
 }
 for(const seed of [1,7,19]){
  check('recovery',seed,()=>recovery(seed));check('publicTargets',seed,()=>publicTargets(seed));check('namedTowns',seed,()=>namedTown(seed));
  check('factions',`${seed}:field`,()=>factionRoute(seed,'field'));check('factions',`${seed}:defense`,()=>factionRoute(seed,'defense'));
  check('factionCycles',seed,()=>factionCycle(seed));check('lessons',seed,()=>practicalLessons(seed));
  for(const campaign of ['ten_eunuchs','dongzhuo'])for(const kind of ['main','all'])check('campaigns',`${seed}:${campaign}:${kind}`,()=>historicalCampaign(seed,campaign,kind));
 }
 check('independentCampaignBoxes',7,()=>historicalIndependentBoxes(7));
 for(const campaign of ['ten_eunuchs','dongzhuo'])check('nextDayCampaigns',`7:${campaign}`,()=>historicalNextDay(7,campaign));
 check('factions','7:defense:multicity',()=>factionRoute(7,'defense',true));
 for(const id of ['named_changshan','named_changsha','named_xiliang','named_xuchang','named_chaisang'])check('cityHeroes',id,()=>cityHero(id));
 report.completed=report.failures.length===0;report.requiredSystems=7;
 if(process.argv[2])fs.writeFileSync(process.argv[2],JSON.stringify(report,null,2)+'\n');
}
if(require.main===module)main();
module.exports={earned,loaded,recovery,publicTargets,namedTown,cityHero,factionRoute,factionCycle,practicalLessons,historicalCampaign,historicalNextDay,historicalIndependentBoxes,code};
