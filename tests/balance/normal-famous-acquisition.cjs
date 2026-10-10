'use strict';
// Diagnostic route at 1x from a fresh save. No supplied resources, armies, chapter flags or hero levels.
// Assumes immediate reward collection and ideal knowledge of weak level-five wild tiles.
// This is one feasible route, not a speedrun or approved pacing target.
// Usage: node tests/balance/normal-famous-acquisition.cjs SEED [--first|--chapters] [--famous] [--siege=baseline|reserve|logistics] [--keep-payroll]

const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const ROOT=require('node:path').resolve(__dirname,'../..');
const {loadGame,cloneActiveSave}=require(ROOT+'/tests/helpers/game.cjs');
const openingSource=fs.readFileSync(ROOT+'/tests/balance/archer-onboarding.cjs','utf8');
const copy=x=>JSON.parse(JSON.stringify(x)),sum=a=>Object.values(a).reduce((n,x)=>n+x,0);
function run(seed=1, options={}){
 const e=loadGame(seed),g=e.Game,start=e.now(),H=e.evaluate('HeroSystem'),heritage=e.evaluate('HeritageSystem'),P=g.progression;
 const log=[],battles=[],first={},MAX_HOURS=24*90;let firstState;let commander='lin';let siegeDiplomacy=false;const siegeStrategy=options.siegeStrategy||'baseline';assert.ok(['baseline','reserve','logistics'].includes(siegeStrategy));
 const hours=()=>+( (e.now()-start)/3600000).toFixed(3);
 function ok(error){if(error)throw Error(error);}
 function note(kind,id,more={}){log.push({hours:hours(),kind,id,...more});}
 function collect(){if(g.missions.some(m=>g.missionReady(m)))ok(g.claimReadyMissions());g.claimReadyDaily();for(const n of [5,10,15,20])g.claimDailyMilestone(n);}
 function daily(){for(const t of [...g.state.daily.tasks])if(t.status==='available'&&g.state.daily.tasks.filter(t=>t.status==='accepted').length<12)g.acceptDaily(t.uid);collect();}
 const rawAdvance=e.advance;e.advance=(ms)=>{while(ms>0){if(hours()>MAX_HOURS)throw Error('90-day observation horizon reached');const n=Math.min(ms,3600000);rawAdvance(n,false);ms-=n;collect();if(options.keepPayroll){const salary=g.salaryQuote();if(salary.cost&&!salary.reason){ok(g.payHeroArrears('all',salary.key));note('payArrears','all',{cost:salary.cost});}}if(siegeDiplomacy&&!g.garrisonStatus('named_jiangling').captive){for(const [kind,quote,act]of [['persuade',g.persuadeGarrisonQuote('named_jiangling'),()=>g.persuadeGarrison('named_jiangling')],['sow',g.sowGarrisonQuote('named_jiangling'),()=>g.sowGarrison('named_jiangling')]])if(!quote.reason){ok(act());note(kind,'named_jiangling',{loyalty:g.garrisonStatus('named_jiangling').loyalty,cost:quote.cost||0});}}}};
 function advance(ms){e.advance(Math.max(1,ms));}
 function growOpening(target){const mod={exports:{}};vm.runInNewContext(openingSource,{require:id=>{assert.equal(id,'../helpers/game.cjs');return {loadGame:()=>e};},module:mod,exports:mod.exports,process,console});return mod.exports.run(seed,true,target,{includeState:true});}
 function funding(cost){cost={...cost,gold:(cost.gold||0)+(options.keepPayroll&&commander!=='lin'?50000:0)};for(let i=0;!g.canPay(cost);i++){
  if(i>240)throw Error('10-day funding stall '+JSON.stringify({cost,stock:g.state.res,rates:g.rates()}));
  let moved=false;
  if(g.state.buildings.market){
   if((cost.gold||0)>g.state.res.gold){for(const id of ['iron','stone','wood','food']){const reserve=(cost[id]||0)+(id==='food'?20000:10000),n=Math.min(Math.max(0,Math.floor(g.state.res[id]-reserve)),g.tradeQuote(id,false).limit);if(n>0){ok(g.trade(id,n,false));moved=true;note('sell',id,{count:n});if(g.state.res.gold>=cost.gold)break;}}}
   for(const [id,n]of Object.entries(cost)){if(id==='gold'||g.state.res[id]>=n)continue;const q=g.tradeQuote(id,true),count=Math.min(Math.ceil(n-g.state.res[id]),q.limit,Math.max(0,Math.floor(g.state.res.gold-(cost.gold||0))));if(count>0){ok(g.trade(id,count,true));moved=true;note('buy',id,{count});}}
  }
  if(!moved)advance(3600000);
 }}
 function finish(kind,q){for(let i=0;i<80&&q.end>e.now();i++){const items=g.manual.shop.filter(x=>x.effect==='speedup'&&x.queueKind===kind&&g.state.inventory[x.id]>0&&(x.speedup.seconds||x.speedup.minHours));if(!items.length)break;const remaining=(q.end-Math.max(e.now(),q.start))/1000;items.sort((a,b)=>(a.speedup.seconds||a.speedup.minHours*3600)-(b.speedup.seconds||b.speedup.minHours*3600));const item=items.find(x=>(x.speedup.seconds||x.speedup.minHours*3600)>=remaining)||items.at(-1);ok(g.useSpeedup(item.id,g.speedupKey(kind,q)).error);note('earnedSpeedup',item.id);}
  advance(Math.ceil(q.end-e.now())+1);collect();
 }
 const rules=e.evaluate('ReferenceRules');
 function prereqs(rows){for(const r of rows||[]){if(r.kind==='building')build(r.id,r.level);else if(r.kind==='tech')research(r.id,r.level);else if((g.state.inventory[r.id]||0)<r.level)throw Error('Missing earned item '+r.id);}}
 function build(id,level){const plot=Object.hasOwn(g.plotTypes,id);let site=plot?g.state.plots.findIndex(p=>p.type===id):g.primarySite(id);if(site<0)site=plot?g.state.plots.findIndex(p=>!p.type):g.state.cityLayout.indexOf(null);
  while((plot?g.state.plots[site].level:g.state.buildings[id])<level){const next=(plot?g.state.plots[site].level:g.state.buildings[id])+1;prereqs(rules.buildingConditions[id]?.[next]);if(!plot){site=g.primarySite(id);if(site<0)site=g.state.cityLayout.indexOf(null);}const cost=plot?g.plotCost(site,id):g.buildRecord(id,next).cost;funding(cost);ok(plot?g.developPlot(site,id):g.queueBuilding(site,id));note('build',id,{level:next,cost});finish('build',g.state.buildQueue.at(-1));}
 }
 function research(id,level){while(g.state.tech[id]<level){build('academy',1);prereqs(rules.researchConditions[id]?.[g.state.tech[id]+1]);const cost=g.researchCost(id);funding(cost);ok(g.research(id));note('research',id,{level:g.state.tech[id]+1,cost,waitHours:(g.state.researchQueue.end-e.now())/3600000});finish('research',g.state.researchQueue);}}
 function train(id,count){if(count<=0)return;prereqs([...Object.entries(g.units[id].requires.buildings).map(([id,level])=>({kind:'building',id,level})),...Object.entries(g.units[id].requires.tech).map(([id,level])=>({kind:'tech',id,level}))]);
  for(let left=count;left>0;){const n=Math.min(100,left),cost=g.trainCost(id,n);funding(cost);for(let i=0;g.freePopulation()<n*(g.units[id].people||1);i++){if(i>48)throw Error('Population stalled for '+id);if(g.state.inventory.population>0)ok(g.useItem('population'));else advance(3600000);}ok(g.train(id,n));note('train',id,{count:n,cost,...(stage.startsWith('siege')||stage.startsWith('jiangling')?{gold:g.state.res.gold,commandOwned:g.state.generals.includes(commander),loyalty:g.state.heroLoyalty[commander],owed:g.state.heroService.owed[commander]||0}:{})});finish('train',g.state.trainQueue.at(-1));left-=n;}
 }
 function fight(id,army,mode='raid',general=commander){
  daily();const n=g.getNode(id),before={gold:g.state.res.gold,food:g.state.res.food,level:g.state.generalLevels[general]};for(const k of Object.keys(army))ok(g.setTactic(k,'advance',''));ok(g.dispatch(id,general,army,mode,true));advance(Math.ceil(g.state.expedition.end-e.now())+1);ok(g.startBattle());for(let i=0;i<40&&!g.state.battle.finished;i++)g.battleRound();assert.equal(g.state.battle.finished,true);const b=g.state.battle,out={id,mode,general,hours:hours(),enemy:sum(n.army),rounds:b.round,won:b.result.won,lost:sum(b.result.lost),army:copy(army),receipt:copy(b.result.wildGeneral||null),before,claimed:b.result.claimed||false};battles.push(out);advance(Math.ceil((g.state.expedition?.end||e.now())-e.now())+1);g.dismissBattle();collect();assert.equal(g.validSave(cloneActiveSave(g.state)),true);return out;
 }
 let stage='opening';try{
  const opening=growOpening('archer');note('checkpoint','firstArchers',{hours:hours(),gold:g.state.res.gold});
  stage='hall ten supplies';growOpening('ten-gifts');first.hallTen={hours:hours(),gold:g.state.res.gold};stage='first capture';build('market',1);build('inn',2);build('tavern',g.state.generals.length+1);build('house',5);train('archer',Math.max(0,800-g.state.army.archer));first.discoveryGate=copy(H.wild.codex(g.state).filter(d=>d.line==='huaman'));
  stage='camp';research('shooting',2);research('combat',2);research('protection',2);if(!g.state.conquered.camp){const a=fight('camp',{archer:Math.min(800,g.state.army.archer)},'occupy');if(!a.won)throw Error('Camp defeat');}
  const candidates=[];for(let y=0;y<64;y++)for(let x=0;x<64;x++){const n=g.getWorldTile(x,y);if(n.wild&&n.level===5&&sum(n.army)<=800)candidates.push(n);}
  candidates.sort((a,b)=>Math.hypot(a.x-g.home.x,a.y-g.home.y)-Math.hypot(b.x-g.home.x,b.y-g.home.y));let farmNode=candidates[0];assert.ok(farmNode);
  stage='recruit rank';for(let attempts=0;g.state.honors.noble<2&&attempts<120;attempts++){
   for(const kind of ['noble','office']){const q=heritage.promotionQuote(g.state,kind);if(q.next&&(kind==='noble'?q.next.id<=2:q.next.id<=1)&&!q.reason){ok(heritage.promote(kind));note('promotion',kind,{rank:q.next.id,cost:q.rule.gold});}}
   if(g.state.honors.noble>=2)break;
   const q=heritage.promotionQuote(g.state,'noble');if(q.rule?.gold)funding({gold:q.rule.gold});
   const fresh=candidates.map(n=>g.getNode(n.id)).filter(n=>n.level===5&&sum(n.army)<=500&&!(g.state.cooldowns[n.id]>e.now()));if(fresh.length)farmNode=fresh[0];
   if(g.state.cooldowns[farmNode.id]>e.now())advance(g.state.cooldowns[farmNode.id]-e.now()+1);train('archer',Math.max(0,800-g.state.army.archer));const b=fight(farmNode.id,{archer:Math.min(800,g.state.army.archer)});if(!b.won)note('defeat','jewelFarm',{node:farmNode.id,lost:b.lost});
  }
  stage='temporary recruit rank';ok(g.buyItem('nobleAdvanced'));ok(g.useItem('nobleAdvanced'));note('temporaryNoble','nobleAdvanced',{gems:100,permanent:g.state.honors.noble,effective:heritage.effectiveNoble(g.state),cityLimit:g.cityLimit(),end:g.state.nobleBoost.end});
  stage='first capture';build('tavern',g.state.generals.length+H.wild.heldCaptives(g.state)+1);train('archer',Math.max(0,800-g.state.army.archer));ok(H.wild.discover());const r=g.state.wildGenerals.rumors.find(r=>r.line==='huaman'),quote=H.wild.portraitQuote(g.state,r.line);ok(H.wild.buyPortrait(r.line,quote.key));first.portrait={hours:hours(),gems:quote.price};const capture=fight(r.node,{archer:Math.min(800,g.state.army.archer)});first.capture=capture;first.recruitQuote=copy(H.wild.recruitQuote(g.state,r.id));
  if(capture.receipt?.status!=='captured')throw Error('No capture '+JSON.stringify(capture));
  const rq=H.wild.recruitQuote(g.state,r.id);first.beforeRecruit={hours:hours(),noble:g.state.honors.noble,gold:g.state.res.gold,jewels:copy(g.state.jewels),quote:copy(rq)};
  funding({gold:100000});const rq2=H.wild.recruitQuote(g.state,r.id);ok(H.wild.recruit(r.id,'gold',rq2.key));first.recruited={hours:hours(),id:r.id,goldAfter:g.state.res.gold,lin:g.general('lin'),hero:g.general(r.id),boxes:g.state.inventory.barbarianEquipmentBox};stage='first hero complete';firstState=copy(g.state);if(options.useFamous)commander=r.id;if(options.stopAfterFirst)return {seed,stage,hours:hours(),first,firstState,battles,log,validSave:g.validSave(cloneActiveSave(g.state)),state:copy(g.state)};
  stage='county preparation';build('tavern',6);build('house',7);build('drill',5);research('shooting',5);research('combat',5);research('protection',5);
  function farmJewels(target){for(let attempt=0;g.state.jewels.pearl<target;attempt++){if(attempt>160)throw Error('Jewel route exceeded observation budget');const fresh=candidates.map(n=>g.getNode(n.id)).filter(n=>n.level===5&&sum(n.army)<=500&&!(g.state.cooldowns[n.id]>e.now()));farmNode=fresh[0]||farmNode;train('archer',Math.max(0,800-g.state.army.archer));if(g.state.cooldowns[farmNode.id]>e.now())advance(g.state.cooldowns[farmNode.id]-e.now()+1);fight(farmNode.id,{archer:Math.min(800,g.state.army.archer)});}}
  farmJewels(20);while(g.state.epic.treasures<2)ok(g.donateEpic('jewel','pearl'));train('archer',Math.max(0,1800-g.state.army.archer));ok(g.donateEpic('troop','archer'));for(const id of Object.keys(g.resources)){funding({[id]:100000});ok(g.donateEpic('resource',id));}while(g.state.epic.kills<1500)farmJewels(g.state.jewels.pearl+1);assert.equal(g.countyUnlocked(),true);
  train('archer',Math.max(0,1200-g.state.army.archer));train('shield',Math.max(0,400-g.state.army.shield));
  for(const id of ['pass','mine'])if(!g.state.conquered[id]){const b=fight(id,{archer:Math.min(1200,g.state.army.archer),shield:Math.min(400,g.state.army.shield)},'occupy');if(!b.won)throw Error('First chapter defeat '+id);}
  for(let i=0;!g.state.conquered.fort&&i<8;i++){const b=fight('fort',{archer:Math.min(1200,g.state.army.archer),shield:Math.min(400,g.state.army.shield)},'occupy');if(!b.won)throw Error('County defeat');if(g.state.cooldowns.fort>e.now())advance(g.state.cooldowns.fort-e.now()+1);}assert.equal(g.state.conquered.fort,true);note('checkpoint','county',{gold:g.state.res.gold});
  stage='chapter three';const armyTarget={archer:1650,shield:525,spear:750,cavalry:225};
  for(const n of e.Chapter.allNodes().filter(n=>n.chapter<=3)){for(const [id,count]of Object.entries(armyTarget))train(id,Math.max(0,count-g.state.army[id]));const b=fight(n.id,armyTarget,'occupy');if(!b.won)throw Error('Chapter defeat '+n.id);collect();if(g.state.cooldowns[n.id]>e.now())advance(g.state.cooldowns[n.id]-e.now()+1);}note('checkpoint','chapterThree',{gold:g.state.res.gold});if(options.stopAfterChapters)return {seed,stage:'chapter three complete',hours:hours(),first,firstState,battles,log,validSave:g.validSave(cloneActiveSave(g.state)),state:copy(g.state)};
  stage='jiangling army';build('house',10);research('plant',5);build('farm',8);for(let f=0;g.state.plots.filter(p=>p.type==='farm').length<4&&f<4;f++){const site=g.state.plots.findIndex(p=>!p.type);for(let lv=1;lv<=8;lv++){prereqs(rules.buildingConditions.farm?.[lv]);const cost=g.plotCost(site,'farm');funding(cost);ok(g.developPlot(site,'farm'));note('extraFarm',String(site),{level:lv,cost});finish('build',g.state.buildQueue.at(-1));}}for(let h=0;g.maxPop()<22000&&h<9;h++){const site=g.state.cityLayout.indexOf(null);for(let lv=1;lv<=10;lv++){prereqs(rules.buildingConditions.house?.[lv]);const cost=g.buildRecord('house',lv).cost;funding(cost);ok(g.queueBuilding(site,'house'));note('extraHouse',String(site),{level:lv,cost});finish('build',g.state.buildQueue.at(-1));}}build('drill',10);build('barracks',10);build('warehouse',6);for(const id of ['farm','lumber','quarry','mine'])build(id,8);const siege={archer:8000,shield:2500,spear:1500,cavalry:1000,ram:60};for(const [id,count]of Object.entries(siege))train(id,Math.max(0,count-g.state.army[id]));
  note('checkpoint','siegeArmy',{strategy:siegeStrategy,commander:g.general(commander),army:copy(g.state.army),stock:copy(g.state.res),garrison:g.garrisonStatus('named_jiangling')});
  if(siegeStrategy==='reserve'){stage='siege reserves';for(const [id,count]of Object.entries(siege))train(id,Math.max(0,Math.ceil(count*1.5)-g.state.army[id]));note('checkpoint','reservesReady',{army:copy(g.state.army)});}
  if(siegeStrategy==='logistics'){
   stage='siege logistics';ok(heritage.assign(g.state.governor==='su'?'lin':g.state.governor||'lin','','su'));siegeDiplomacy=true;
   const site=g.getNode('named_jiangling'),near=[];for(let y=site.y-2;y<=site.y+2;y++)for(let x=site.x-2;x<=site.x+2;x++){if(x<0||y<0||x>=64||y>=64)continue;const n=g.getWorldTile(x,y);if(n.wild&&!g.state.conquered[n.id])near.push(n);}
   near.sort((a,b)=>sum(a.army)-sum(b.army));for(const n of near){if(g.garrisonStatus('named_jiangling').supplyCut>=3)break;const send={archer:Math.min(8000,g.state.army.archer),shield:Math.min(2500,g.state.army.shield)};const result=fight(n.id,send,'occupy');if(!result.won)throw Error('Supply tile defeat '+n.id);note('supplyCut',n.id,{cuts:g.garrisonStatus('named_jiangling').supplyCut});}
   assert.ok(g.garrisonStatus('named_jiangling').supplyCut>=3,'three real supply tiles captured');
  }
  stage='jiangling siege';let assaultCount=0;while(!g.state.conquered.named_jiangling&&assaultCount<12){
   const refillStart=hours();for(const [id,count]of Object.entries(siege))train(id,Math.max(0,count-g.state.army[id]));
   const refillHours=+(hours()-refillStart).toFixed(3);const pq=g.persuadeGarrisonQuote('named_jiangling');if(!pq.reason)ok(g.persuadeGarrison('named_jiangling'));
   const st=g.garrisonStatus('named_jiangling'),beforeArmy=copy(g.state.army);const b=fight('named_jiangling',siege,'occupy');assaultCount++;
   note('siege','named_jiangling',{refillAndAssaultHours:+(hours()-refillStart).toFixed(3),refillHours,loyaltyBefore:st.loyalty,loyaltyAfter:g.garrisonStatus('named_jiangling').loyalty,supplyCut:st.supplyCut,enemy:st.troops,armyBefore:beforeArmy,won:b.won,lost:b.lost,claimed:b.claimed});
   if(g.state.conquered.named_jiangling)break;advance(Math.max(1,(g.state.cooldowns.named_jiangling||e.now())-e.now()+1));
  }
  if(!g.state.conquered.named_jiangling)throw Error('Jiangling siege did not complete');siegeDiplomacy=false;
  stage='guanyu recruitment';const guan=g.garrisonStatus('named_jiangling');if(!guan.recruited){const level=g.state.captureLevels[guan.general.id].level;if(heritage.recruitmentQuote(g.state,level).reason){ok(g.buyItem('nobleAdvanced'));ok(g.useItem('nobleAdvanced'));note('temporaryNoble','guanyu',{permanent:g.state.honors.noble,effective:heritage.effectiveNoble(g.state),level,gems:100});}ok(g.recruitGarrisonGeneral('named_jiangling'));}
  note('checkpoint','guanyu',{heroId:guan.general.id,hero:g.general(guan.general.id),linLevel:g.state.generalLevels.lin});stage='normal route complete';
  return {seed,stage,hours:hours(),first,firstState,stock:copy(g.state.res),battles,log,validSave:g.validSave(cloneActiveSave(g.state)),state:copy(g.state)};
 }catch(error){return {seed,stage,hours:hours(),error:error.message,first,firstState,stock:copy(g.state.res),noble:g.state.honors.noble,heroStatus:{owned:g.state.generals.includes(commander),loyalty:g.state.heroLoyalty[commander],owed:g.state.heroService.owed[commander],history:g.state.heroService.log},army:copy(g.state.army),battles,log,validSave:g.validSave(cloneActiveSave(g.state)),state:copy(g.state)};}
}
if(require.main===module){
 const result=run(Number(process.argv[2]||1),{stopAfterChapters:process.argv.includes('--chapters'),stopAfterFirst:process.argv.includes('--first'),useFamous:process.argv.includes('--famous'),siegeStrategy:process.argv.find(x=>x.startsWith('--siege='))?.slice(8),keepPayroll:process.argv.includes('--keep-payroll')});
 const {state,firstState,...summary}=result;
 process.stdout.write(JSON.stringify(summary,null,2)+'\n');
 if(result.error||!result.validSave)process.exitCode=1;
}
module.exports={run};
