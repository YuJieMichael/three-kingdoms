const {test}=require('node:test'),assert=require('node:assert/strict');
const {loadGame,city,battle}=require('./helpers/game.cjs');
function invariants(Game,label){const s=Game.state;for(const [id,n] of Object.entries(s.res))assert.ok(Number.isFinite(n)&&n>=0,label+' stock '+id);for(const n of Object.values(s.army))assert.ok(Number.isSafeInteger(n)&&n>=0,label+' troop');assert.equal(new Set(s.missionClaims).size,s.missionClaims.length);assert.ok(s.reports.length<=20&&s.cityDefense.reports.length<=20);assert.equal(Game.validSave(s),true,label+' save');}
for(const speed of [1,10,60])test('seven active days at speed '+speed+' preserve resource bounds, task refresh and saves',()=>{
  const env=loadGame(speed),{Game}=env;city(Game,{hall:2,house:3,barracks:2,drill:2,warehouse:2});Game.state.speed=speed;Game.state.stats.victories=1;Game.state.army.militia=200;
  let period=Game.state.daily.start,refreshes=0;
  for(let i=0;i<7*24*12;i++){env.advance(300000);if(Game.state.daily.start!==period){refreshes++;period=Game.state.daily.start;}invariants(Game,'step '+i);if(i%72===0){Game.save();const stock={...Game.state.res};Game.init();assert.equal(JSON.stringify(Game.state.res),JSON.stringify(stock));}}
  assert.equal(refreshes,7);assert.equal(Game.state.cityDefense.wave,1);assert.equal(Game.state.cityDefense.battle,null);assert.equal(Game.state.army.militia,200);
});
test('thirty-day offline income is capped at eight hours and creates only one pending invasion',()=>{
  const a=loadGame(),b=loadGame();for(const e of [a,b]){city(e.Game,{hall:2,house:3});e.Game.state.stats.victories=1;e.Game.tick();}
  const short=a.offline(8*3600000),long=b.offline(30*86400000);
  assert.equal(long.seconds,28800);assert.equal(short.seconds,28800);assert.equal(JSON.stringify(a.Game.state.res),JSON.stringify(b.Game.state.res));assert.equal(b.Game.state.cityDefense.wave,1);invariants(b.Game,'offline');
});
test('one hundred actual battles remain settle-once and bounded through returns and reloads',()=>{
  const env=loadGame(73),{Game}=env;city(Game,{hall:4,house:10,drill:10,barracks:10});Game.state.res.food=10000000;Game.state.army.archer=3000;
  for(let i=0;i<100;i++){
    const result=battle(env,'field','raid',{archer:Math.min(1000,Game.state.army.archer)});assert.equal(result.won,true);
    const after=JSON.stringify(Game.state);Game.battleRound();assert.equal(JSON.stringify(Game.state),after);env.advance(90001);Game.dismissBattle();
    if(i%10===0){Game.save();Game.init();}assert.equal(Game.state.stats.victories,i+1);invariants(Game,'battle '+i);
  }
  assert.equal(Game.state.reports.length,20);assert.equal(Game.state.jewels.pearl>=100,true);
});
test('fifty real invasions return surviving reserves once and keep report history bounded',()=>{
  const env=loadGame(41),{Game}=env;city(Game,{hall:2,house:10});Game.state.stats.victories=1;Game.state.army.archer=4000;Game.state.res.food=10000000;Game.tick();
  for(let i=0;i<50;i++){
    env.advance(30*60000);env.advance(5*60000);assert.equal(Game.startCityDefense(),null);for(let round=0;round<30&&Game.state.cityDefense.battle;round++)Game.cityDefenseRound();assert.equal(Game.state.cityDefense.reports[0].won,true);
    const after=JSON.stringify(Game.state);Game.cityDefenseRound();assert.equal(JSON.stringify(Game.state),after);if(i%5===0){Game.save();Game.init();}invariants(Game,'invasion '+i);
  }
  assert.equal(Game.state.cityDefense.wins,50);assert.equal(Game.state.cityDefense.reports.length,20);
});
test('queued construction and training finish once after prolonged offline restore',()=>{
  const env=loadGame(),{Game}=env;city(Game,{hall:2,house:3,barracks:2});Game.state.plots[0]={type:'lumber',level:2};env.advance(3600000);for(const id of Object.keys(Game.state.res))Game.state.res[id]=1000000;
  assert.equal(Game.queueBuilding(2,'warehouse'),null);assert.equal(Game.train('militia',10),null);const trained=Game.state.stats.trained;env.offline(14*86400000);assert.equal(Game.state.trainQueue.length,0);assert.equal(Game.state.buildQueue.length,0);assert.equal(Game.state.stats.trained,trained+10);assert.equal(Game.state.army.militia,10);assert.equal(Game.state.buildings.warehouse,1);
  Game.init();assert.equal(Game.state.army.militia,10);assert.equal(Game.state.stats.trained,trained+10);invariants(Game,'queues');
});
