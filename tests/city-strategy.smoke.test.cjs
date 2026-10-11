const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const {loadGame,city}=require('./helpers/game.cjs');
const read=name=>fs.readFileSync(path.join(__dirname,'..',name),'utf8'),copy=x=>JSON.parse(JSON.stringify(x));
function env(){const e=loadGame(931);if(e.evaluate('typeof CityStrategy')==='undefined')e.evaluate(read('city-strategy.js','city-specialty.js'));return e;}
const close=(actual,expected)=>assert.ok(Math.abs(actual-expected)<1e-8,`${actual} must equal ${expected}`);
// Prepared city scopes compare the real production and dispatch APIs, not natural pacing.
function prepared(){
  const e=env(),g=e.Game,s=g.state;city(g,{hall:4,drill:3,market:1,house:5});s.governor=null;s.population=2000;s.army.archer=40;s.army.wagon=20;s.army.cavalry=30;s.army.scout=20;
  s.plots[0]={type:'farm',level:3};s.plots[1]={type:'lumber',level:3};s.plots[2]={type:'quarry',level:3};s.plots[3]={type:'mine',level:3};
  for(const id in g.resources)s.res[id]=100000;s.honors.noble=3;
  e.evaluate(`for(const id of ['yellow_qingshi','yellow_baisha','yellow_chigang']){Game.state.conquered[id]=true;Game.state.towns[id].morale=-5;const c=CitySystem.empty(Game.state,Game.getNode(id),Date.now());Object.assign(c.data,CitySystem.clone(CitySystem.pick(Game.state)));Game.state.realm.cities[c.id]=c;}CitySystem.capture(Game.state);`);
  return e;
}
function ui(e){
  e.evaluate(`function S(){return Game.state;}function esc(s){return String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}function num(n){return String(n);}function duration(n){return n+' 秒';}function btn(label,action,id='',cls='',disabled=false){return '<button data-action="'+action+'" data-id="'+id+'"'+(disabled?' disabled':'')+'>'+label+'</button>';}var manualModalContext=null;globalThis.modalOutput={};function showModal(title,body,footer){modalOutput={title,body,footer};}`);
  e.evaluate(read('city-ui.js'));e.evaluate(read('named-city-ui.js'));return e;
}
test('fixed city roles survive renaming, hall upgrades and site migration; home and self-founded plains remain balanced',()=>{
  const e=env(),p=e.evaluate('CityStrategy');
  for(const [node,role] of Object.entries({fort:'granary',yellow_qingshi:'granary',yellow_baisha:'mine',yellow_chigang:'pass'})){
    assert.equal(p.profile(e.Game.getNode(node)).id,role);assert.equal(p.profile({id:'city_'+node,node,name:'玩家改名',buildings:{hall:10},x:1,y:63}).id,role);assert.equal(p.profile('city_'+node).id,role);
  }
  for(const c of [null,{},'home','capital',{id:'capital',node:'fort'}, {capital:true,node:'yellow_chigang'},{node:'wild_12_34',name:'赤岗关隘',terrain:'fort'},{id:'unassigned_city',terrain:'fort',level:10}])assert.equal(p.profile(c).id,'balanced');
  assert.deepEqual(copy(p.profile('yellow_qingshi').production),{food:1.2,wood:1,stone:1,iron:1,gold:1.1});assert.deepEqual(copy(p.profile('yellow_baisha').production),{food:1,wood:1.15,stone:1.15,iron:1.15,gold:1.1});assert.equal(p.profile('yellow_chigang').marchFactor,.8);
});
test('profiles are immutable and speculative map descriptions do not change ownership or resources',()=>{
  const e=ui(env()),before=JSON.stringify(e.Game.state);assert.throws(()=>e.evaluate(`'use strict';CityStrategy.profile('yellow_qingshi').production.food=99;`),/read only|readonly|Cannot assign/);
  const html=e.evaluate(`cityStrategyHTML(Game.getNode('yellow_chigang'))`);assert.match(html,/占领后 · 关隘/);assert.match(html,/新派隊伍|新派队伍/);assert.match(html,/行军时间 −20%/);assert.match(html,/<details[^>]*data-ui-disclosure=/);assert.doesNotMatch(html,/<details[^>]*\sopen(?:\s|>)/);assert.match(html,/掠夺不会获得/);assert.equal(JSON.stringify(e.Game.state),before);assert.equal(e.evaluate(`cityStrategyHTML(Game.getNode('north_pass'))`),'');
});
test('grain and mine multipliers apply to local gross output and plot previews once, with unchanged upkeep and county tax paid once',()=>{
  const e=prepared(),g=e.Game,capital=copy(g.rates()),capitalPlots=g.state.plots.slice(0,4).map(p=>g.plotYield(p)),upkeep=g.upkeep(g.state.army)/60;
  assert.equal(g.switchCity('city_yellow_qingshi'),null);const grain=g.rates();close(grain.food,(capital.food+upkeep)*1.2-upkeep);for(const k of ['wood','stone','iron'])close(grain[k],capital[k]);close(grain.gold,capital.gold*1.1);close(g.plotYield(g.state.plots[0]),capitalPlots[0]*1.2);close(g.plotYield(g.state.plots[1]),capitalPlots[1]);
  assert.equal(g.switchCity('city_yellow_baisha'),null);const mine=g.rates();close(mine.food,capital.food);close(mine.gold,capital.gold*1.1);for(const k of ['wood','stone','iron'])close(mine[k],capital[k]*1.15);for(let i=1;i<4;i++)close(g.plotYield(g.state.plots[i]),capitalPlots[i]*1.15);
  assert.equal(g.switchCity('capital'),null);for(const k in capital)close(g.rates()[k],capital[k]);assert.equal(g.citySummary('city_yellow_qingshi').strategy.id,'granary');assert.equal(g.citySummary('city_yellow_baisha').strategy.id,'mine');assert.equal(g.validSave(g.state),true);
});
test('pass-city expedition previews equal actual timestamps, and switching cities or reloading cannot retime a departed army',()=>{
  const e=prepared(),g=e.Game;assert.equal(g.switchCity('city_yellow_chigang'),null);g.state.realm.heroLocations.lin='city_yellow_chigang';
  const q=g.marchQuote('field',{archer:20},'lin');assert.equal(q.cityStrategy.id,'pass');assert.equal(q.marchFactor,.8);close(q.seconds,Math.max(1,q.baseSeconds*.8));close(q.returnSeconds,Math.max(1,q.baseReturnSeconds*.8));
  assert.equal(g.dispatch('field','lin',{archer:20},'raid'),null);const trip=copy(g.state.expedition);assert.ok(Math.abs(trip.end-trip.start-q.seconds*1000)<.001);assert.equal(trip.returnSeconds,q.returnSeconds);
  assert.equal(g.switchCity('capital'),null);const normal=g.marchQuote('field',{archer:20});assert.equal(normal.marchFactor,1);assert.equal(normal.seconds,normal.baseSeconds);
  const departed=()=>g.allExpeditions().find(j=>j.sourceCity==='city_yellow_chigang');assert.equal(departed().start,trip.start);assert.equal(departed().end,trip.end);g.save();g.init();assert.equal(departed().start,trip.start);assert.equal(departed().end,trip.end);assert.equal(departed().returnSeconds,trip.returnSeconds);assert.equal(g.validSave(g.state),true);
});
test('pass-city transport/redeployment quotes apply the source benefit and transport UI shows the paid actual preview',()=>{
  const e=ui(prepared()),g=e.Game;assert.equal(g.switchCity('city_yellow_chigang'),null);
  const q=g.transportQuote('capital',{wagon:10},{wood:1000});assert.equal(q.reason,'');assert.equal(q.cityStrategy.id,'pass');assert.equal(q.marchFactor,.8);assert.equal(q.seconds,Math.max(1,Math.ceil(q.baseSeconds*.8)));
  const html=e.evaluate(`cityTransferQuoteHTML(${JSON.stringify(q)})`);assert.match(html,/关隘行军时间 −20% 已计入/);assert.ok(html.includes('普通耗时 '+q.baseSeconds+' 秒 → 实际 '+q.seconds+' 秒'));assert.ok(html.includes('去程 '+q.seconds+' 秒'));
  assert.equal(g.sendTransport('capital',{wagon:10},{wood:1000},'',q.key),null);const trip=g.logisticsList()[0];assert.equal(trip.end-trip.start,q.seconds*1000);assert.equal(trip.seconds,q.seconds);
  const redeploy=g.redeployQuote('capital',{cavalry:10});assert.equal(redeploy.seconds,Math.max(1,Math.ceil(redeploy.baseSeconds*.8)));assert.equal(g.switchCity('capital'),null);const incoming=g.transportQuote('city_yellow_chigang',{wagon:10},{wood:1000});assert.equal(incoming.marchFactor,1,'destination pass benefit must not apply to a non-pass source');assert.equal(incoming.seconds,incoming.baseSeconds);assert.equal(g.validSave(g.state),true);
});
test('pass-city scouting uses the real source speed benefit and preserves paid departure and return snapshots after switching and reloading',()=>{
  const e=prepared(),g=e.Game;assert.equal(g.switchCity('city_yellow_chigang'),null);g.state.tech.riding=4;g.state.tech.scouting=8;
  const source=copy(g.cityMeta()),origin=copy(g.currentHome()),s=g.state,target='wild_0_0',scouts=e.evaluate('ScoutSystem'),normalSpeed=g.units.scout.speed*(1+s.tech.riding*.05);
  // Compare a pure unbonused quote at the exact same real city coordinates.
  const baseline=scouts.quote(s,target,10,e.now(),{getNode:g.getNode,units:g.units,origin,scoutSpeed:()=>normalSpeed}),before=JSON.stringify(s),q=g.scoutQuote(target,10);
  assert.equal(q.reason,'');assert.equal(JSON.stringify(s),before);assert.deepEqual(copy(q.origin),origin);assert.equal(q.distance,baseline.distance);assert.deepEqual(copy(q.cost),copy(baseline.cost));
  assert.equal(q.seconds,Math.max(1,Math.ceil((8+baseline.distance*2)*(300/normalSpeed)/s.speed*.8)));assert.ok(q.seconds<baseline.seconds,'the real pass source must shorten this non-minimum journey');assert.equal(q.returnSeconds,q.seconds);
  const army=s.army.scout,food=s.res.food;assert.equal(g.dispatchScout(target,10,q.key),null);assert.equal(s.army.scout,army-10);assert.equal(s.res.food,food-q.cost.food);
  const trip=copy(s.scoutQueue[0]);assert.equal(trip.start,e.now());assert.equal(trip.end-trip.start,q.seconds*1000);assert.equal(trip.arriveAt,trip.end);assert.equal(trip.returnSeconds,q.returnSeconds);assert.deepEqual(trip.origin,origin);
  assert.equal(g.switchCity('capital'),null);g.state.tech.riding=10;g.setSpeed(10);g.save();g.init();
  const stored=()=>g.getCityState(source.id).scoutQueue[0];assert.deepEqual(copy(g.cityMeta(source.id)),source);assert.equal(stored().start,trip.start);assert.equal(stored().end,trip.end);assert.equal(stored().arriveAt,trip.arriveAt);assert.equal(stored().returnSeconds,trip.returnSeconds);assert.deepEqual(copy(stored().origin),origin);assert.equal(g.validSave(g.state),true);
  e.advance(trip.end-e.now());assert.equal(stored().phase,'return');assert.equal(stored().start,trip.arriveAt);assert.equal(stored().end,trip.arriveAt+trip.returnSeconds*1000);assert.equal(g.currentCityId(),'capital');assert.equal(g.validSave(g.state),true);
});
test('compact city switch cards and city details expose distinct strategic roles without a new mode selection',()=>{
  const e=ui(prepared()),before=JSON.stringify(e.Game.state);e.evaluate('citySwitchListModal()');const list=e.evaluate('modalOutput.body');
  for(const text of ['均衡城 · 普通资源与行军规则','粮城 · 本城粮食毛产量 +20%','矿城 · 本城木石铁毛产量 +15%','关隘 · 本城新派队伍行军时间 −20%'])assert.ok(list.includes(text));assert.doesNotMatch(list,/data-action="(?:cityStrategySelect|cityRoleChange)"/);
  e.evaluate(`citySummaryModal('city_yellow_baisha')`);const detail=e.evaluate('modalOutput.body');assert.match(detail,/城池特性 · 矿城/);assert.match(detail,/仅影响此城/);assert.match(detail,/data-action="cityTransport"/);assert.match(detail,/data-action="cityRedeploy"/);assert.equal(JSON.stringify(e.Game.state),before);
});
