const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const {loadGame,city,cloneActiveSave}=require('./helpers/game.cjs');
const read=file=>fs.readFileSync(path.join(__dirname,'..',file),'utf8'),copy=x=>JSON.parse(JSON.stringify(x));
function fixture(){
  const context=vm.createContext({}),L=vm.runInContext(read('supply-lines.js')+'\nSupplyLines;',context);
  const data=()=>({res:{food:1000,wood:1000,stone:1000,iron:1000,gold:1000},army:{wagon:10,archer:10},buildings:{market:1,drill:1},automation:{reserve:{food:0,wood:0,stone:0,iron:0,gold:0}}});
  const s={army:{wagon:10,archer:10},realm:{cities:{a:{id:'a',...data()},b:{id:'b',...data()},c:{id:'c',...data()}},logistics:[]}},cities=s.realm.cities;cities.b.res.food=0;L.init(s);
  const api={getCity:id=>cities[id],quoteFrom(source,destination,army,cargo){const c=cities[source],total=Object.values(army).reduce((v,n)=>v+n,0),carry=(army.wagon||0)*100+(army.archer||0)*10,foodCost=20;let reason='';if(!c.buildings.drill)reason='请先建造校场';else if(!c.buildings.market)reason='运输需要本城市场 1 级';else if(Object.entries(army).some(([id,n])=>n>(c.army[id]||0)))reason='本城可派遣兵力不足';else if(total>100)reason='超过校场单队人数上限';else if(s.realm.logistics.length>=100)reason='在途队伍已满';else if(Object.values(cargo).reduce((v,n)=>v+n,0)>carry)reason='运送资源超过部队负重';else if(c.res.food<(cargo.food||0)+foodCost)reason='运送粮食与行军粮合计超过本城库存';return {sourceCity:source,destinationCity:destination,army:copy(army),cargo:copy(cargo),seconds:60,foodCost,carry,reason,key:JSON.stringify([source,destination,army,cargo])};}};
  const draft=(override={})=>({sourceCity:'a',destinationCity:'b',resource:'food',targetStock:500,sourceReserve:200,army:{wagon:2},enabled:true,...override});
  const save=d=>{const q=L.quote(s,d,api);assert.equal(q.reason,'');assert.equal(L.set(s,d,q.key,api),null);return s.realm.supplyLines.lines.at(-1);};
  const job=(line,override={})=>({id:'logistics_'+(s.realm.logistics.length+1),kind:'transport',sourceCity:line.sourceCity,destinationCity:line.destinationCity,army:{...line.army},cargo:{[line.resource]:100},general:'',phase:'outbound',delivered:false,cancelled:false,supplyLine:line.id,start:0,end:60000,seconds:60,...override});
  return {L,s,cities,api,draft,save,job};
}
test('legacy route initialization is bounded and corrupt route configurations are rejected',()=>{
  const {L,s,draft,save}=fixture();assert.equal(L.valid(s),true);save(draft());assert.equal(L.valid(s),true);
  for(const mutate of [x=>x.realm.supplyLines.nextId=0,x=>x.realm.supplyLines.nextId=1.5,x=>x.realm.supplyLines.nextId=1e10,x=>x.realm.supplyLines.version=2,x=>x.realm.supplyLines.extra=true,x=>x.realm.supplyLines.lines[0].targetStock=1e9+1,x=>x.realm.supplyLines.lines[0].sourceReserve=-1,x=>x.realm.supplyLines.lines[0].enabled='true',x=>x.realm.supplyLines.lines[0].army.fake=1,x=>x.realm.supplyLines.lines[0].army.wagon=1.5,x=>x.realm.supplyLines.lines[0].army.wagon=1000001,x=>x.realm.supplyLines.lines[0].destinationCity='missing',x=>x.realm.supplyLines.lines[0].sourceCity='__proto__',x=>x.realm.supplyLines.lines.push(copy(x.realm.supplyLines.lines[0])),x=>x.realm.supplyLines.lines[0].extra=true]){const bad=copy(s);mutate(bad);assert.equal(L.valid(bad),false);assert.match(L.quote(bad,draft(),{}).reason,/无效/);}
  const bad=copy(s);bad.realm.supplyLines.lines='bad';L.init(bad);assert.equal(L.valid(bad),false,'init must not repair corrupt existing state');
});
test('configuration previews are readonly, directions cannot duplicate, and 12 routes are the limit',()=>{
  const {L,s,api,draft,save}=fixture(),before=JSON.stringify(s),q=L.quote(s,draft(),api);assert.equal(q.reason,'');assert.equal(JSON.stringify(s),before);save(draft());
  assert.match(L.quote(s,draft(),api).reason,/同方向/);save(draft({resource:'wood'}));
  for(const sourceCity of ['a','b','c'])for(const destinationCity of ['a','b','c'])for(const resource of ['food','wood','stone','iron','gold'])if(sourceCity!==destinationCity&&s.realm.supplyLines.lines.length<12&&!s.realm.supplyLines.lines.some(l=>l.sourceCity===sourceCity&&l.destinationCity===destinationCity&&l.resource===resource))save(draft({sourceCity,destinationCity,resource}));
  assert.equal(s.realm.supplyLines.lines.length,12);assert.match(L.quote(s,draft({sourceCity:'c',destinationCity:'b',resource:'gold'}),api).reason,/上限/);assert.equal(L.valid(s),true);
});
test('configuration keys reject stale changes but temporary unavailable resources can be saved',()=>{
  const {L,s,cities,api,draft,save}=fixture(),q=L.quote(s,draft(),api);save(draft({resource:'wood'}));assert.match(L.set(s,draft(),q.key,api),/变化/);
  cities.a.buildings.market=0;const d=draft(),waiting=L.quote(s,d,api);assert.equal(waiting.reason,'');assert.equal(waiting.plan.state,'blocked');assert.match(waiting.plan.reason,/市场/);assert.equal(L.set(s,d,waiting.key,api),null);
  cities.a.buildings.market=1;assert.equal(L.plan(s,s.realm.supplyLines.lines.at(-1),api).state,'ready');
});
test('food cargo uses real carry and pays march food while preserving source and assistant reserves',()=>{
  const {L,s,cities,api,draft}=fixture();cities.a.res.food=270;cities.a.automation.reserve.food=220;const before=JSON.stringify(s),p=L.plan(s,draft(),api);assert.equal(p.state,'ready');assert.equal(p.amount,30);assert.equal(p.foodReserve,220);assert.equal(p.quote.foodCost,20);assert.equal(JSON.stringify(s),before);
  cities.a.automation.reserve.food=0;cities.a.res.food=1000;assert.equal(L.plan(s,draft(),api).amount,200,'carry limits each trip');
  cities.a.res.food=219;assert.equal(L.plan(s,draft(),api).state,'blocked');assert.match(L.plan(s,draft(),api).reason,/行军粮/);
});
test('other resources respect both their reserve and real food costs, while all native transport conditions apply',()=>{
  const {L,s,cities,api,draft}=fixture();cities.b.res.wood=0;const d=draft({resource:'wood',targetStock:500,sourceReserve:100});cities.a.res.wood=300;cities.a.automation.reserve.wood=250;cities.a.automation.reserve.food=900;
  assert.equal(L.plan(s,d,api).amount,50);cities.a.res.food=919;assert.match(L.plan(s,d,api).reason,/行军粮/);cities.a.res.food=1000;
  for(const [setup,pattern] of [[()=>cities.a.buildings.market=0,/市场/],[()=>{cities.a.buildings.market=1;cities.a.buildings.drill=0;},/校场/],[()=>{cities.a.buildings.drill=1;cities.a.army.wagon=1;},/兵力/],[()=>{cities.a.army.wagon=200;d.army.wagon=101;},/单队/],[()=>{d.army.wagon=2;s.realm.logistics=Array.from({length:100},()=>({kind:'redeploy'}));},/在途队伍/]]){setup();assert.equal(L.plan(s,d,api).state,'blocked');assert.match(L.plan(s,d,api).reason,pattern);}
});
test('destination deficit counts all real undelivered cargo, excluding delivered, recalled, and returning cargo',()=>{
  const {L,s,cities,api,draft,save,job}=fixture(),line=save(draft());cities.b.res.food=100;
  s.realm.logistics=[job(line,{supplyLine:undefined,cargo:{food:250}}),job(line,{supplyLine:undefined,cargo:{food:1000},cancelled:true}),job(line,{supplyLine:undefined,cargo:{food:1000},delivered:true,phase:'return'}),job(line,{supplyLine:undefined,cargo:{food:1000},phase:'return'}),job(line,{supplyLine:undefined,destinationCity:'c',cargo:{food:1000}})];
  const p=L.plan(s,line,api);assert.equal(p.pending,250);assert.equal(p.deficit,150);assert.equal(p.amount,150);s.realm.logistics[0].cargo.food=400;assert.equal(L.plan(s,line,api).state,'stocked');
});
test('a route waits through delivery and return, cannot be edited or removed in flight, and recall pauses it',()=>{
  const {L,s,api,draft,save,job}=fixture(),line=save(draft()),j=job(line);s.realm.logistics.push(j);assert.equal(L.valid(s),true);assert.equal(L.plan(s,line,api).state,'inflight');
  assert.match(L.quote(s,{...copy(line),targetStock:700},api).reason,/途中/);assert.match(L.remove(s,line.id),/返城/);j.phase='return';j.delivered=true;assert.equal(L.plan(s,line,api).state,'inflight');assert.equal(L.setEnabled(s,line.id,false),null);assert.equal(L.plan(s,line,api).state,'inflight');
  L.setEnabled(s,line.id,true);assert.equal(L.pauseForRecall(s,j),true);assert.equal(line.enabled,false);s.realm.logistics=[];assert.equal(L.plan(s,line,api).state,'paused');assert.equal(L.remove(s,line.id),null);assert.equal(L.valid(s),true);
});
test('strict save validation rejects orphan, mismatched, duplicate, or disguised automatic transport jobs',()=>{
  const {L,s,draft,save,job}=fixture(),line=save(draft());s.realm.logistics=[job(line)];assert.equal(L.valid(s),true);
  for(const mutate of [x=>x.realm.logistics[0].supplyLine='supply_999',x=>x.realm.logistics[0].sourceCity='c',x=>x.realm.logistics[0].kind='redeploy',x=>x.realm.logistics[0].cargo.wood=1,x=>x.realm.logistics[0].cargo.food=0,x=>x.realm.logistics[0].army.wagon=1,x=>x.realm.logistics[0].army.fake=1,x=>x.realm.logistics[0].general='hero',x=>x.realm.logistics.push(copy(x.realm.logistics[0]))]){const bad=copy(s);mutate(bad);assert.equal(L.valid(bad),false);}
});
test('each scheduling pass sends at most one actual paid job per line and repeats only after its return',()=>{
  const {L,s,cities,api,draft,save,job}=fixture(),line=save(draft());let calls=0;api.send=(p,l)=>{calls++;const source=cities[l.sourceCity];for(const [id,n] of Object.entries(l.army))source.army[id]-=n;source.res[l.resource]-=p.amount;source.res.food-=p.quote.foodCost;s.realm.logistics.push(job(l,{cargo:copy(p.cargo)}));return null;};
  assert.equal(L.run(s,api)[0].state,'sent');assert.equal(calls,1);assert.equal(cities.a.res.food,780);assert.equal(cities.a.army.wagon,8);assert.equal(L.valid(s),true);assert.equal(L.run(s,api)[0].state,'inflight');assert.equal(calls,1);
  const j=s.realm.logistics[0];cities.b.res.food+=j.cargo.food;j.phase='return';j.delivered=true;L.run(s,api);assert.equal(calls,1);cities.a.army.wagon+=j.army.wagon;s.realm.logistics=[];assert.equal(L.run(s,api)[0].state,'sent');assert.equal(calls,2);assert.equal(cities.b.res.food,200);assert.equal(cities.a.res.food,560);
  api.send=()=> '运输条件已变化';const clean=copy(s);s.realm.logistics=[];const before=JSON.stringify(s),result=L.run(s,api)[0];assert.equal(result.state,'blocked');assert.match(result.reason,/变化/);assert.equal(JSON.stringify(s),before);assert.equal(clean.realm.logistics.length,1);
});
test('real engine transport quotes preserve source city coordinates, market rules, pass time, carry and actual food payment',()=>{
  const e=loadGame(932),g=e.Game,s=g.state;if(e.evaluate('typeof SupplyLines')==='undefined')e.evaluate(read('supply-lines.js'));const L=e.evaluate('SupplyLines');L.init(s);city(g,{hall:4,drill:3,market:1});s.army.wagon=20;for(const id in g.resources)s.res[id]=100000;
  e.evaluate(`Game.state.conquered.yellow_chigang=true;Game.state.towns.yellow_chigang.morale=-5;const c=CitySystem.empty(Game.state,Game.getNode('yellow_chigang'),Date.now());Object.assign(c.data,CitySystem.clone(CitySystem.pick(Game.state)));Game.state.realm.cities[c.id]=c;CitySystem.capture(Game.state);`);
  const source='city_yellow_chigang',destination='capital';g.switchCity(source);s.res.food=100000;g.switchCity(destination);s.res.food=0;
  const api={getCity:id=>g.getCityState(id),quoteFrom(from,to,army,cargo){return e.evaluate(`(()=>{const s=Game.state,id=s.realm.activeCity;CitySystem.capture(s);CitySystem.activate(s,${JSON.stringify(from)});try{return Game.transportQuote(${JSON.stringify(to)},${JSON.stringify(army)},${JSON.stringify(cargo)});}finally{CitySystem.activate(s,id);}})()`);}};
  const d={sourceCity:source,destinationCity:destination,resource:'food',targetStock:50000,sourceReserve:10000,army:{wagon:2},enabled:true},before=JSON.stringify(s),p=L.plan(s,d,api);assert.equal(p.state,'ready');assert.equal(s.realm.activeCity,destination);assert.equal(JSON.stringify(s),before);assert.equal(p.quote.origin.x,g.cityMeta(source).x);assert.equal(p.quote.marchFactor,.8);assert.equal(p.amount,p.quote.carry);assert.equal(p.quote.cargo.food,p.amount);
  g.switchCity(source);const sourceFood=g.state.res.food,army=g.state.army.wagon,q=g.transportQuote(destination,d.army,p.cargo);assert.equal(g.sendTransport(destination,d.army,p.cargo,'',q.key),null);assert.equal(g.state.res.food,sourceFood-p.amount-q.foodCost);assert.equal(g.state.army.wagon,army-2);assert.equal(g.state.realm.logistics[0].end-g.state.realm.logistics[0].start,q.seconds*1000);
});
test('compact UI previews show actual cargo, march food, pass discount, offline semantics and shared-world restriction',()=>{
  const {L,s,api,draft,save,job}=fixture(),line=save(draft()),context=vm.createContext({Game:{resources:{food:{name:'粮食'}},supplyLines:()=>L.list(s,api),cityMeta:id=>({name:id}),domesticStrategyAvailable:()=>true},SupplyLines:L,Date,esc:String,num:String,duration:n=>n+'秒',clock:end=>`<span data-clock="${end}">剩余时间</span>`,btn:(name,action,id,cls,disabled)=>`<button data-action="${action}"${disabled?' disabled':''}>${name}</button>`});vm.runInContext(read('supply-lines-ui.js'),context);
  let html=vm.runInContext('supplyLinesHTML()',context);assert.match(html,/源城保留/);assert.match(html,/离线期间只结算/);assert.match(html,/手动召回会暂停/);assert.match(html,/下趟装载 200/);context.Game.domesticStrategyAvailable=()=>false;html=vm.runInContext('supplyLinesHTML()',context);assert.match(html,/共享世界暂不支持/);assert.match(html,/data-action="supplyLineNew" disabled/);
  const q=L.quote(s,draft({id:line.id}),api);q.plan.quote.marchFactor=.8;context.testQuote=q;html=vm.runInContext('supplyLinePreviewHTML(testQuote)',context);assert.match(html,/本次装载 200/);assert.match(html,/行军粮 20/);assert.match(html,/−20% 已计入/);
  s.realm.logistics=[job(line,{end:123456789})];html=vm.runInContext('supplyLinesHTML()',context);assert.match(html,/送达剩余 <span data-clock="123456789"/);s.realm.logistics[0].phase='return';s.realm.logistics[0].end=123499999;html=vm.runInContext('supplyLinesHTML()',context);assert.match(html,/返城剩余 <span data-clock="123499999"/);
});
function realRoute(){
  const e=loadGame(933),g=e.Game,s=g.state;city(g,{hall:4,drill:3,market:1});s.governor=null;s.army.wagon=20;for(const resource in g.resources)s.res[resource]=200000;s.honors.noble=3;
  e.evaluate(`Game.state.conquered.yellow_chigang=true;Game.state.towns.yellow_chigang.morale=-5;const pass=CitySystem.empty(Game.state,Game.getNode('yellow_chigang'),Date.now());Object.assign(pass.data,CitySystem.clone(CitySystem.pick(Game.state)));Game.state.realm.cities[pass.id]=pass;CitySystem.capture(Game.state);`);
  s.res.food=0;const draft={sourceCity:'city_yellow_chigang',destinationCity:'capital',resource:'food',targetStock:50000,sourceReserve:10000,army:{wagon:2},enabled:true};
  return {...e,g,draft};
}
test('real automatic dispatch pays only its source, survives reload and city switches, then resumes after actual return',()=>{
  const e=realRoute(),{g,draft}=e,before=g.getCityState(draft.sourceCity),quote=g.supplyLineQuote(draft),untouched=JSON.stringify(g.state);assert.equal(quote.reason,'');assert.equal(quote.plan.state,'ready');assert.equal(JSON.stringify(g.state),untouched,'reading supply lines cannot mutate city scopes');
  assert.equal(g.saveSupplyLine(draft,quote.key),null);const line=g.state.realm.supplyLines.lines[0],job=g.logisticsList()[0];assert.equal(job.supplyLine,line.id);assert.equal(job.sourceCity,draft.sourceCity);assert.equal(job.start,e.now());assert.equal(job.end-job.start,quote.plan.quote.seconds*1000);assert.equal(g.getCityState(draft.sourceCity).army.wagon,before.army.wagon-2);assert.equal(g.getCityState(draft.sourceCity).res.food,before.res.food-job.cargo.food-job.foodCost);assert.equal(g.currentCityId(),'capital');assert.equal(g.validSave(g.state),true);
  assert.equal(g.switchCity(draft.sourceCity),null);g.save();g.init();assert.equal(g.logisticsList()[0].end,job.end);assert.equal(g.supplyLines()[0].state,'inflight');assert.equal(g.switchCity('capital'),null);
  e.advance(job.end-e.now()+1,true);assert.equal(g.logisticsList().length,1);assert.equal(g.logisticsList()[0].phase,'return');assert.equal(g.state.realm.logisticsSeq,1);assert.equal(g.supplyLines()[0].state,'inflight');
  const returned=g.logisticsList()[0].end;e.advance(returned-e.now()+1,true);assert.equal(g.state.realm.logisticsSeq,2);assert.equal(g.logisticsList().length,1);assert.equal(g.logisticsList()[0].phase,'outbound');assert.equal(g.logisticsList()[0].start,e.now());assert.equal(g.validSave(g.state),true);
});
test('real manual recall pauses its automatic line across reload and returns cargo without re-dispatching',()=>{
  const e=realRoute(),{g,draft}=e,q=g.supplyLineQuote(draft);g.saveSupplyLine(draft,q.key);const job=g.logisticsList()[0],line=g.state.realm.supplyLines.lines[0];e.advance(1000);assert.equal(g.recallLogistics(job.id),null);assert.equal(line.enabled,false);const recalled=g.logisticsList()[0];assert.equal(recalled.cancelled,true);assert.equal(g.supplyLines()[0].state,'inflight');
  g.save();g.init();assert.equal(g.state.realm.supplyLines.lines[0].enabled,false);e.advance(recalled.end-e.now()+1,true);assert.equal(g.logisticsList().length,0);assert.equal(g.getCityState(draft.sourceCity).army.wagon,20);assert.equal(g.state.realm.logisticsSeq,1);assert.equal(g.supplyLines()[0].state,'paused');assert.equal(g.validSave(g.state),true);
  assert.equal(g.setSupplyLineEnabled(line.id,true),null);assert.equal(g.logisticsList().length,1);assert.equal(g.state.realm.logisticsSeq,2);
});
test('offline catch-up settles existing delivery exactly once and schedules no historical supply loops',()=>{
  const e=realRoute(),{g,draft}=e,q=g.supplyLineQuote(draft);g.saveSupplyLine(draft,q.key);const job=g.logisticsList()[0];e.offline(job.seconds*1000*2+600000);assert.equal(g.logisticsList().length,0);assert.equal(g.state.realm.logisticsSeq,1);assert.equal(g.getCityState(draft.sourceCity).army.wagon,20);assert.equal(g.state.realm.logisticsReports.filter(r=>r.id===job.id).length,1);
  g.tick(e.now(),true);assert.equal(g.logisticsList().length,1);assert.equal(g.state.realm.logisticsSeq,2);assert.equal(g.logisticsList()[0].start,e.now());g.tick(e.now(),true);assert.equal(g.state.realm.logisticsSeq,2);assert.equal(g.validSave(g.state),true);
});
test('shared snapshots block supply configuration and client dispatch, preserving the private local route',async()=>{
  const e=realRoute(),{g,draft}=e,q=g.supplyLineQuote({...draft,enabled:false});assert.equal(g.saveSupplyLine({...draft,enabled:false},q.key),null);const id=g.state.realm.supplyLines.lines[0].id,snapshot=cloneActiveSave(g.state);assert.equal(g.enterOnlineSession(snapshot),null);assert.equal(g.domesticStrategyAvailable(),false);assert.match(g.supplyLineQuote(draft).reason,/共享世界/);assert.match(g.setSupplyLineEnabled(id,true),/共享世界/);assert.match(g.removeSupplyLine(id),/共享世界/);e.advance(100000,true);assert.equal(g.logisticsList().length,0);assert.equal(g.state.realm.supplyLines.lines[0].enabled,false);await g.leaveOnlineSession();assert.equal(g.domesticStrategyAvailable(),true);assert.equal(g.state.realm.supplyLines.lines[0].id,id);assert.equal(g.state.realm.supplyLines.lines[0].enabled,false);
});
test('a malformed logistics container makes real save validation return false without throwing',()=>{
  const {g}=realRoute(),base=cloneActiveSave(g.state);assert.equal(g.validSave(base),true);
  for(const logistics of [{},null,'logistics']){const bad=copy(base);bad.realm.logistics=logistics;assert.doesNotThrow(()=>assert.equal(g.validSave(bad),false));}
  const {L,s,api,draft,save}=fixture();save(draft());s.realm.logistics={};let dispatched=0;api.send=()=>{dispatched++;return null;};assert.deepEqual(copy(L.run(s,api)),[]);assert.equal(dispatched,0,'the scheduler must not dispatch from corrupt realm data');
});
test('a malformed logistics element makes real save validation return false without throwing',()=>{
  const {g}=realRoute(),base=cloneActiveSave(g.state);assert.equal(g.validSave(base),true);
  for(const job of [null,[],42]){const bad=copy(base);bad.realm.logistics=[job];assert.doesNotThrow(()=>assert.equal(g.validSave(bad),false));}
});
