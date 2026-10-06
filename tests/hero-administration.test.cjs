const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const {loadGame,city,cloneActiveSave}=require('./helpers/game.cjs');
const copy=x=>JSON.parse(JSON.stringify(x));
let recruitedTemplate;
function actualHeroes(){
 const e=loadGame(942),g=e.Game;city(g,{hall:10,inn:4,tavern:10,drill:5,wall:3,market:2});g.state.honors.noble=5;g.state.army.archer=10000;g.state.army.wagon=30;for(const id of Object.keys(g.resources))g.state.res[id]=3000000;
 const wild=e.evaluate('HeroSystem.wild');e.evaluate('Math.random=()=>.999999');assert.equal(wild.discover(),null);
 for(const line of ['xunyu','pangtong']){
  const r=g.state.wildGenerals.rumors.find(r=>r.line===line);assert.ok(r);const portrait=wild.portraitQuote(g.state,line);assert.equal(wild.buyPortrait(line,portrait.key),null);g.setTactic('archer','advance');assert.equal(g.dispatch(r.node,'lin',{archer:4000},'raid'),null);e.advance(Math.ceil(g.state.expedition.end-e.now())+1);assert.equal(g.startBattle(),null);for(let n=0;n<30&&!g.state.battle.finished;n++)g.battleRound();assert.equal(g.state.battle.result.won,true);assert.equal(g.state.battle.result.wildGeneral.status,'captured');e.advance(Math.ceil(Math.max(g.state.expedition?.end||e.now(),...Object.values(g.state.cooldowns))-e.now())+1);const q=wild.recruitQuote(g.state,r.id,'gold');assert.equal(q.reason,'');assert.equal(wild.recruit(r.id,'gold',q.key),null);
 }
 assert.equal(g.save(),true);assert.equal(g.validSave(g.state),true);return cloneActiveSave(g.state);
}
function fixture(){
 if(!recruitedTemplate)recruitedTemplate=actualHeroes();
 const e=loadGame(943),g=e.Game;g.importSave(copy(recruitedTemplate));g.state.warCare.defense.autoResolve=false;const a=e.evaluate('HeroAdministration'),xun=g.state.customGenerals.find(g=>g.wildLine==='xunyu'),pang=g.state.customGenerals.find(g=>g.wildLine==='pangtong');assert.ok(xun&&pang);
 return {e,g,a,xun:g.general(xun.id),pang:g.general(pang.id),s:g.state,api:{cityId:'capital'}};
}
function prepare(f){f.s.governor=f.pang.id;const q=f.a.prepareQuote(f.s,f.pang,'capital',f.e.now(),f.api);assert.equal(q.ok,true,q.reason);const r=f.a.prepare(f.s,f.pang,'capital',f.e.now(),q.key,f.api);assert.equal(r.ok,true,r.reason);return r.prepared;}
function addCity(f){const {e}=f;e.evaluate(`Game.state.conquered.yellow_baisha=true;Game.state.towns.yellow_baisha.morale=-5;Game.state.realm.cities.city_yellow_baisha=CitySystem.empty(Game.state,Game.getNode('yellow_baisha'),Date.now());CitySystem.capture(Game.state);`);}

test('departure cancels unused paid preparation but preserves an already consumed historical defense report',()=>{
 const f=fixture();prepare(f);const id=f.pang.id;f.s.heroLoyalty[id]=0;f.e.evaluate(`GovernanceSystem.tickHeroes(Game.state,Date.now(),{busy:()=>false});`);assert.equal(f.s.generals.includes(id),false);assert.equal(f.s.heroAdministration.prepared,null);assert.equal(f.g.validSave(f.s),true);
 const active=fixture();prepare(active);active.s.army.archer=1000;active.s.res.food=1000000;const doctrine=active.e.evaluate('WarCare.defenseSnapshot(Game.state)');doctrine.autoResolve=false;active.g.setDefenseDoctrine(doctrine);assert.equal(active.g.requestCityDefense('cavalry',1),null);active.e.advance(300000);assert.equal(active.g.startCityDefense(false,'lin',{archer:500}),null);active.g.resolveCityDefense();assert.ok(active.s.cityDefense.reports[0].administrationDefense);active.s.heroLoyalty[active.pang.id]=0;active.e.evaluate('GovernanceSystem.tickHeroes(Game.state,Date.now(),{busy:()=>false})');assert.equal(active.s.generals.includes(active.pang.id),false);assert.equal(active.g.validSave(active.s),true);active.g.save();active.g.init();assert.equal(active.g.validSave(active.g.state),true);assert.ok(active.g.state.cityDefense.reports[0].administrationDefense);
});

test('only genuinely portrait-captured and recruited identities receive the two city duties',()=>{
 const f=fixture();for(const hero of [f.xun,f.pang]){assert.equal(f.s.wildGenerals.recruited.includes(hero.id),true);assert.ok(f.s.wildGenerals.portraits.includes(hero.wildLine));assert.equal(f.a.identity(hero).id,hero.wildLine);}
 for(const fake of [{id:'xunyu',name:'荀彧'},{id:'su',name:'庞统',administration:'pangtong'},{id:'su',wildLine:'xunyu',origin:'wild'},{id:'su',wildLine:'__proto__'}]){assert.equal(f.a.profile(f.s,fake,f.api).active,false);assert.equal(f.a.transportFactor(f.s,fake,'transport',f.api),1);}
 const fake={...f.xun,wildLine:'pangtong'};assert.equal(f.a.profile(f.s,fake,f.api).active,false);assert.equal(f.a.prepareQuote(f.s,fake,'capital',f.e.now(),f.api).ok,false);
});

test('Xun Yu lowers only new resource-transport marching food while current governor politics output is preserved',()=>{
 const f=fixture();f.s.governor=f.xun.id;const before=JSON.stringify(f.s),rates=copy(f.g.rates());assert.equal(f.a.transportFactor(f.s,f.xun,'transport',f.api),.8);
 for(const kind of ['redeploy','scout','raid','unknown'])assert.equal(f.a.transportFactor(f.s,f.xun,kind,f.api),1);
 assert.equal(f.a.transportFactor(f.s,f.pang,'transport',f.api),1);assert.equal(JSON.stringify(f.s),before);assert.deepEqual(copy(f.g.rates()),rates);
});

test('city duty requires current local governorship and no expedition, garrison, logistics or defense engagement',()=>{
 for(const held of ['notGovernor','away','expedition','garrison','logistics','defense','external']){
  const f=fixture();f.s.governor=f.xun.id;const api={...f.api};if(held==='notGovernor')f.s.governor='su';if(held==='away')f.s.realm.heroLocations[f.xun.id]='city_elsewhere';if(held==='expedition')f.s.expedition={general:f.xun.id};if(held==='garrison')f.s.garrisons.fake={general:f.xun.id};if(held==='logistics')f.s.realm.logistics.push({general:f.xun.id});if(held==='defense')f.s.cityDefense.battle={general:f.xun.id};if(held==='external')api.generalBusy=()=>true;
  assert.equal(f.a.profile(f.s,f.xun,api).active,false,held);assert.equal(f.a.transportFactor(f.s,f.xun,'transport',api),1,held);
 }
});

test('Pang Tong preparation previews real fixed costs, gates and invalid reasons without mutating anything',()=>{
 const f=fixture();f.s.governor=f.pang.id;const before=JSON.stringify(f.s),q=f.a.prepareQuote(f.s,f.pang,'capital',f.e.now(),f.api);assert.equal(q.ok,true,q.reason);assert.deepEqual(copy(q.cost),{wood:1000,stone:1000,iron:1000});assert.equal(q.gateFactor,1.2);assert.equal(JSON.stringify(f.s),before);
 for(const change of [s=>s.buildings.hall=3,s=>s.buildings.wall=1,s=>s.res.wood=999,s=>s.res.stone=999,s=>s.res.iron=999,s=>s.governor='su',s=>s.realm.heroLocations[f.pang.id]='transit',s=>s.cityDefense.battle={general:'lin'}]){const s=copy(f.s);change(s);const old=JSON.stringify(s),bad=f.a.prepareQuote(s,f.pang,'capital',f.e.now(),f.api);assert.equal(bad.ok,false);assert.ok(bad.reason);assert.equal(JSON.stringify(s),old);}
 assert.equal(f.a.prepareQuote(f.s,f.pang,'city_other',f.e.now(),f.api).ok,false);
});

test('preparation pays the city resources once, accepts fractional accrued stock and cannot stack or replay',()=>{
 const f=fixture();f.s.governor=f.pang.id;f.s.res.wood=1000.75;const costBefore=copy(f.s.res),q=f.a.prepareQuote(f.s,f.pang,'capital',f.e.now(),f.api);assert.equal(q.ok,true);const wrong=f.a.prepare(f.s,f.pang,'capital',f.e.now(),'wrong-key',f.api);assert.equal(wrong.ok,false);assert.deepEqual(copy(f.s.res),costBefore);
 const r=f.a.prepare(f.s,f.pang,'capital',f.e.now(),q.key,f.api);assert.equal(r.ok,true);assert.equal(f.s.res.wood,.75);for(const id of ['wood','stone','iron'])assert.equal(f.s.res[id],costBefore[id]-1000);for(const id of ['food','gold'])assert.equal(f.s.res[id],costBefore[id]);assert.equal(f.a.valid(f.s,f.api),true);const paid=JSON.stringify(f.s);assert.equal(f.a.prepare(f.s,f.pang,'capital',f.e.now(),q.key,f.api).ok,false);assert.equal(JSON.stringify(f.s),paid);
});

test('only one formal begin consumes paid defense; drills and unavailable governors keep it prepared',()=>{
 const f=fixture(),snapshot=prepare(f),paid=JSON.stringify(f.s);assert.equal(f.a.consumeDefense(f.s,f.pang,'capital',true,f.api),null);assert.equal(JSON.stringify(f.s),paid);
 f.s.governor='su';assert.equal(f.a.consumeDefense(f.s,f.pang,'capital',false,f.api),null);assert.deepEqual(copy(f.s.heroAdministration.prepared),copy(snapshot));f.s.governor=f.pang.id;
 const consumed=f.a.consumeDefense(f.s,f.pang,'capital',false,f.api);assert.deepEqual(copy(consumed),copy(snapshot));assert.equal(f.s.heroAdministration.prepared,null);assert.equal(f.a.consumeDefense(f.s,f.pang,'capital',false,f.api),null);assert.equal(f.s.heroAdministration.seq,1);assert.equal(f.a.validDefenseSnapshot(consumed,f.s,f.api),true);
 f.s.governor='su';f.s.realm.heroLocations[f.pang.id]='transit';assert.equal(f.a.validDefenseSnapshot(consumed,f.s,f.api),true,'consumed battle snapshot retains the actual paid identity after later reassignment');
});

test('preparation remains bound to its city through office changes, city switching and hero relocation',()=>{
 const f=fixture(),snapshot=prepare(f);addCity(f);assert.equal(f.g.save(),true);assert.equal(f.g.switchCity('city_yellow_baisha'),null);assert.equal(f.g.state.heroAdministration.prepared,null);const local={cityId:'city_yellow_baisha'};assert.equal(f.a.consumeDefense(f.g.state,f.pang,'city_yellow_baisha',false,local),null);assert.equal(f.a.validDefenseSnapshot(snapshot,f.g.state,local),false);
 assert.equal(f.g.switchCity('capital'),null);assert.deepEqual(copy(f.g.state.heroAdministration.prepared),copy(snapshot));assert.equal(f.a.defensePrepared(f.g.state,f.g.general(f.pang.id),'capital',f.api).ready,true);assert.equal(f.g.validSave(f.g.state),true);
});

test('malformed, foreign-city and forged unpaid identity records reject, and legacy scopes initialize empty',()=>{
 const f=fixture();delete f.s.heroAdministration;assert.equal(f.a.valid(f.s,f.api),true);assert.deepEqual(copy(f.a.init(f.s)),{schema:1,seq:0,prepared:null});prepare(f);
 for(const change of [s=>s.heroAdministration.schema=2,s=>s.heroAdministration.seq=-1,s=>s.heroAdministration.prepared.cost.wood=0,s=>s.heroAdministration.prepared.gateFactor=2,s=>s.heroAdministration.prepared.hero='su',s=>s.heroAdministration.prepared.city='city_other',s=>s.heroAdministration.prepared.id='administration_defense_2',s=>s.heroAdministration.prepared.free=true,s=>s.wildGenerals.recruited=s.wildGenerals.recruited.filter(id=>id!==f.pang.id),s=>s.customGenerals.find(g=>g.id===f.pang.id).origin='inn']){const s=copy(f.s);change(s);assert.equal(f.a.valid(s,f.api),false);}
});

test('consumed defense cannot be reintroduced beside its battle or report or duplicated across official reports',()=>{
 const f=fixture(),snapshot=prepare(f);f.a.consumeDefense(f.s,f.pang,'capital',false,f.api);f.s.cityDefense.battle={drill:false,administrationDefense:copy(snapshot)};assert.equal(f.a.valid(f.s,f.api),true);f.s.heroAdministration.prepared=copy(snapshot);assert.equal(f.a.valid(f.s,f.api),false);f.s.heroAdministration.prepared=null;f.s.cityDefense.battle=null;f.s.cityDefense.reports=[{drill:false,administrationDefense:copy(snapshot)}];assert.equal(f.a.valid(f.s,f.api),true);f.s.cityDefense.reports.push({drill:false,administrationDefense:copy(snapshot)});assert.equal(f.a.valid(f.s,f.api),false);
});

test('real transport quotes and paid trips freeze discounted marching food and leave cargo, carry and timings unchanged',()=>{
 const f=fixture();addCity(f);assert.equal(f.g.setGovernor('su'),null);const normal=f.g.transportQuote('city_yellow_baisha',{wagon:10},{wood:1000});assert.equal(normal.reason,'');assert.equal(f.g.sendTransport('city_yellow_baisha',{wagon:10},{wood:1000},'',normal.key),null);const oldTrip=copy(f.g.logisticsList()[0]);assert.equal(f.g.setGovernor(f.xun.id),null);assert.deepEqual(copy(f.g.logisticsList()[0]),oldTrip,'appointing Xun Yu cannot alter old paid food or travel deadlines');const q=f.g.transportQuote('city_yellow_baisha',{wagon:10},{wood:1000});assert.equal(q.reason,'');assert.equal(q.foodCost,Math.ceil(normal.foodCost*.8));assert.equal(q.seconds,normal.seconds);assert.equal(q.carry,normal.carry);assert.deepEqual(copy(q.cargo),copy(normal.cargo));const redeploy=f.g.redeployQuote('city_yellow_baisha',{wagon:10});assert.equal(redeploy.foodCost,normal.foodCost);
 assert.equal(f.g.sendTransport('city_yellow_baisha',{wagon:10},{wood:1000},'',q.key),null);const trip=copy(f.g.logisticsList().at(-1));assert.equal(trip.foodCost,q.foodCost);assert.equal(trip.end-trip.start,q.seconds*1000);assert.deepEqual(trip.cargo,copy(q.cargo));assert.equal(f.g.setGovernor('su'),null);assert.deepEqual(copy(f.g.logisticsList().at(-1)),trip);f.g.save();f.g.init();assert.deepEqual(copy(f.g.logisticsList().at(-1)),trip);assert.equal(f.g.validSave(f.g.state),true);
});

test('real formal defense uses a paid gate snapshot once; selected guard and existing fort attack stay ordinary',()=>{
 const f=fixture();f.g.state.defenses.tower=5;assert.equal(f.g.setGovernor(f.pang.id),null);const q=f.g.heroAdministrationQuote(f.pang.id),paid=f.g.prepareHeroAdministration(f.pang.id,q.key);assert.notEqual(paid?.ok,false);assert.equal(typeof paid==='string',false);const snapshot=copy(f.g.state.heroAdministration.prepared);assert.ok(snapshot);const ordinaryGate=(f.e.evaluate('NPCDefenseData.baseGateHp')+f.g.state.buildings.wall*f.e.evaluate('NPCDefenseData.wallHp'))*(1+f.g.state.tech.fortification*f.e.evaluate('NPCDefenseData.fortificationPerLevel'));
 assert.equal(f.g.startCityDefense(true,'lin',{archer:20}),null);const normalForts=copy(f.g.state.cityDefense.battle.forts),normalFortification=f.g.state.cityDefense.battle.fortification;assert.equal(f.g.state.cityDefense.battle.gateMax,ordinaryGate);assert.equal(f.g.state.cityDefense.battle.administrationDefense,undefined);assert.deepEqual(copy(f.g.state.heroAdministration.prepared),snapshot);assert.equal(f.g.endDefenseDrill(),null);
 assert.equal(f.g.requestCityDefense('classic',1),null);f.e.advance(f.g.state.cityDefense.incoming.arriveAt-f.e.now());assert.equal(f.g.startCityDefense(false,'lin',{archer:20}),null);const b=f.g.state.cityDefense.battle;assert.equal(b.gateMax,ordinaryGate*1.2);assert.deepEqual(copy(b.forts),normalForts);assert.equal(b.fortification,normalFortification);assert.deepEqual(copy(b.administrationDefense),snapshot);assert.equal(f.g.state.heroAdministration.prepared,null);assert.equal(f.g.validSave(f.g.state),true);f.g.save();f.g.init();assert.equal(f.g.state.cityDefense.battle.gateMax,ordinaryGate*1.2);assert.deepEqual(copy(f.g.state.cityDefense.battle.administrationDefense),snapshot);
 const activeBefore=JSON.stringify(f.g.state.cityDefense.battle),stockBefore=copy(f.g.state.res),blocked=f.g.heroAdministrationQuote(f.pang.id);assert.equal(blocked.ok,false);assert.equal(typeof f.g.prepareHeroAdministration(f.pang.id,blocked.key),'string');assert.equal(JSON.stringify(f.g.state.cityDefense.battle),activeBefore);assert.deepEqual(copy(f.g.state.res),stockBefore);
 for(let n=0;n<30&&f.g.state.cityDefense.battle;n++)f.g.cityDefenseRound();assert.equal(f.g.state.cityDefense.battle,null);assert.deepEqual(copy(f.g.state.cityDefense.reports[0].administrationDefense),snapshot);assert.equal(f.g.validSave(f.g.state),true);
});

test('readonly administration preview keeps costs and paid preparations inspectable and blocks payment',()=>{
 const f=fixture();assert.equal(f.g.setGovernor(f.pang.id),null);f.e.evaluate(`function S(){return Game.state;}function esc(x){return String(x);}function num(x){return String(x);}function btn(label,action,id='',cls='',disabled=false){return '<button data-action="'+action+'" data-id="'+id+'"'+(disabled?' disabled':'')+'>'+label+'</button>';}globalThis.administrationModal={};function showModal(title,body,footer){administrationModal={title,body,footer};}globalThis.lastToast='';function toast(x){lastToast=x;}globalThis.modal={close(){}};function render(){}`);f.e.evaluate(fs.readFileSync(path.join(__dirname,'..','hero-administration-ui.js'),'utf8'));
 f.g.releaseSaveSession();const before=JSON.stringify(f.g.state);f.e.evaluate(`heroAdministrationReview(${JSON.stringify(f.pang.id)})`);const html=f.e.evaluate('administrationModal.body+administrationModal.footer');assert.match(html,/木材/);assert.match(html,/石料/);assert.match(html,/铁锭/);assert.match(html,/只读/);assert.match(html,/disabled>支付并筹备一次/);assert.equal(f.e.evaluate("handleHeroAdministrationAction('heroAdministrationPrepare','')"),true);assert.match(f.e.evaluate('lastToast'),/只读/);assert.equal(JSON.stringify(f.g.state),before);
});

test('shared and server modes show inactive duties consistent with ordinary food expense and blocked preparation',()=>{
 for(const mode of ['shared','server']){
  const f=fixture();addCity(f);assert.equal(f.g.setGovernor(f.xun.id),null);
  if(mode==='shared')assert.equal(f.g.enterOnlineSession(cloneActiveSave(f.g.state)),null);else f.e.evaluate('globalThis.GAME_SERVER_RUNTIME=true');
  f.e.evaluate(`function S(){return Game.state;}function esc(x){return String(x);}function num(x){return String(x);}function btn(label,action,id='',cls='',disabled=false){return '<button data-action="'+action+'" data-id="'+id+'"'+(disabled?' disabled':'')+'>'+label+'</button>';}globalThis.administrationModal={};function showModal(title,body,footer){administrationModal={title,body,footer};}`);f.e.evaluate(fs.readFileSync(path.join(__dirname,'..','hero-administration-ui.js'),'utf8'));
  const p=f.e.evaluate(`heroAdministrationProfile(${JSON.stringify(f.xun.id)})`),html=f.e.evaluate(`heroAdministrationHTML(${JSON.stringify(f.xun.id)})`),q=f.g.transportQuote('city_yellow_baisha',{wagon:10},{wood:1000});
  assert.equal(f.g.domesticStrategyAvailable(),false,mode);assert.equal(p.active,false);assert.equal(p.transportFoodFactor,1);assert.equal(q.administrationFactor,1);assert.match(html,/共享世界暂未开放/);assert.doesNotMatch(html,/本城职责生效/);
  assert.equal(f.g.setGovernor(f.pang.id),null);f.e.evaluate(`heroAdministrationReview(${JSON.stringify(f.pang.id)})`);const review=f.e.evaluate('administrationModal.body+administrationModal.footer');assert.match(review,/共享世界暂未开放/);assert.match(review,/disabled>支付并筹备一次/);const before=JSON.stringify(f.g.state.res);assert.match(f.g.prepareHeroAdministration(f.pang.id,f.g.heroAdministrationQuote(f.pang.id).key),/共享世界暂未开放/);assert.equal(JSON.stringify(f.g.state.res),before);assert.equal(f.g.state.heroAdministration.prepared,null);
 }
});
