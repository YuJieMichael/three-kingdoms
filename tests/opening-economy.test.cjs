const {test}=require('node:test'),assert=require('node:assert/strict');
const {loadGame,city}=require('./helpers/game.cjs');
const {run}=require('./balance/archer-onboarding.cjs');
test('tier 1 supply gives 8000 of each resource, so a new city starts near its 10000 storage instead of four times above it',()=>{
  const e=loadGame(),g=e.Game;assert.equal(g.onboarding.claim(1),null);
  for(const id of ['food','wood','stone','iron'])assert.ok(g.state.res[id]<=1.5*g.capacity(id),id+' '+g.state.res[id]);
});
test('the guide staffs resource fields with population items before more upgrades, which raises real output',()=>{
  const e=loadGame(),g=e.Game,guide=e.evaluate('GrowthGuide');g.claimStarterGift();city(g,{house:2});
  g.state.plots[0]={type:'farm',level:1};g.state.plots[1]={type:'mine',level:3};g.state.population=0;
  const m=guide.model(g);assert.equal(m.kind,'population');assert.equal(m.item,true);assert.match(m.reason,/效率/);
  const before=g.rates().iron;assert.equal(g.useItem('population'),null);assert.ok(g.rates().iron>before*2,before+' → '+g.rates().iron);
  g.state.inventory.population=0;assert.notEqual(guide.model(g).kind,'population','no items left: the guide moves on instead of waiting');
});
test('a refreshed wild tile does not complete level 3/5/8 victory tasks by its new level, while the battle metric still does',()=>{
  const e=loadGame(),g=e.Game,h=g.home;let tile=null;
  for(let dx=-6;dx<=6&&!tile;dx++)for(let dy=-6;dy<=6&&!tile;dy++){const t=g.getNode('wild_'+(h.x+dx)+'_'+(h.y+dy));if(t?.wild&&t.level>=8)tile=t;}
  assert.ok(tile);g.state.raided[tile.id]=true;const task=g.missions.find(m=>m.id==='victoryLevel_8');assert.equal(g.missionReady(task),false);
  g.state.activityMetrics.win_level_8=1;assert.equal(g.missionReady(task),true);
});
test('the guided route has one militia warm-up raid before the archers and still reaches the first battle in about four minutes',()=>{
  for(const seed of [123,456]){
    const r=run(seed,true,'first-battle');assert.ok(r.minutes<10,seed+': '+r.minutes);
    const raid=r.log.findIndex(x=>/派 30 名义兵掠夺/.test(x.target)),archers=r.log.findIndex(x=>/训练 30 名弓箭兵/.test(x.target));
    assert.ok(raid>0&&raid<archers);assert.ok(r.used.population>=2);assert.equal(r.firstBattle,'complete');
  }
});
test('a wild-tile win alone does not finish the first-battle tutorial',()=>{
  const e=loadGame(),g=e.Game;g.state.stats.victories=1;g.state.raided.wild_30_34=true;g.state.army.archer=30;
  assert.match(g.completeFirstBattleGuide(),/据点/);assert.equal(g.state.onboarding.firstBattle,'active');
});
