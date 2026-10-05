const {test}=require('node:test'),assert=require('node:assert/strict');
const {loadGame,city,battle}=require('./helpers/game.cjs');
test('chapter gates protect both direct dispatch and occupation rewards',()=>{
  const {Game,Chapter}=loadGame();Game.state.army.militia=500;city(Game,{drill:2});
  for(const n of Chapter.nodes){assert.match(Game.dispatch(n.id,'lin',{militia:100},'raid'),/古渡县城/);assert.equal(Game.claimMission('chapter2_'+n.id),'目标尚未达成');}
  Game.state.conquered.fort=true;assert.equal(Game.attackBlocked(Chapter.nodes[0].id,'raid'),null);
  assert.match(Game.attackBlocked(Chapter.nodes[1].id,'occupy'),/北原驿道/);
});
test('chapter landmarks resolve on the map with unique coordinates and valid troop/item IDs',()=>{
  const {Game,Chapter}=loadGame(),locations=new Set();
  for(const n of Game.nodes){const node=Game.getNode(n.id);assert.equal(Game.getWorldTile(node.x,node.y).id,n.id);assert.ok(!locations.has(node.x+':'+node.y));locations.add(node.x+':'+node.y);}
  for(const n of Chapter.nodes)for(const id of Object.keys(n.army))assert.ok(Game.units[id]);
  for(const r of Chapter.rewards)for(const id of Object.keys(r.items))assert.ok(Game.manual.shop.some(i=>i.id===id));
});
test('actual raid victory does not unlock next chapter stage; actual occupation does',()=>{
  const env=loadGame(),{Game,Chapter}=env,s=Game.state;city(Game,{hall:4,drill:10,house:10,barracks:10});s.conquered.fort=true;s.army.archer=2500;s.res.food=1000000;
  const raid=battle(env,'north_road','raid',{archer:2500});assert.equal(raid.won,true);assert.equal(s.conquered.north_road,undefined);assert.ok(Game.attackBlocked('north_granary','raid'));assert.equal(Game.claimMission('chapter2_north_road'),'目标尚未达成');
  env.advance(90001);Game.dismissBattle();const occupation=battle(env,'north_road','occupy',{archer:s.army.archer});assert.equal(occupation.won,true);assert.equal(s.conquered.north_road,true);assert.equal(Game.attackBlocked('north_granary','occupy'),null);assert.equal(Chapter.progress(s).conquered,1);
});
test('all six chapter rewards are atomic, exactly once, retained after reload and batch collection',()=>{
  const env=loadGame(),{Game,Chapter}=env;Game.state.conquered.fort=true;
  for(const n of Chapter.nodes){Game.state.conquered[n.id]=true;const m=Game.missions.find(m=>m.node===n.id),s=Game.state,before={res:{...s.res},jewels:{...s.jewels},inventory:{...s.inventory},prestige:s.prestige};
    assert.equal(Game.claimMission(m.id),null);for(const [id,n] of Object.entries(m.reward))assert.equal(s.res[id],before.res[id]+n);for(const [id,n] of Object.entries(m.jewels))assert.equal(s.jewels[id],before.jewels[id]+n);for(const [id,n] of Object.entries(m.items))assert.equal(s.inventory[id],(before.inventory[id]||0)+n);assert.equal(s.prestige,before.prestige+300);
    const settled=JSON.stringify(s);assert.equal(Game.claimMission(m.id),'该任务奖励已领取');assert.equal(JSON.stringify(s),settled);assert.equal(Game.validSave(s),true);Game.init();assert.equal(Game.missionClaimed(m.id),true);
  }
  assert.equal(Chapter.progress(Game.state).conquered,6);assert.equal(Chapter.progress(Game.state).claimed,6);Game.claimReadyMissions();assert.equal(Chapter.progress(Game.state).claimed,6);
});
test('old saves keep existing claims and unlock chapter from county ownership only',()=>{
  const {Game,Chapter}=loadGame(),old=JSON.parse(JSON.stringify(Game.state));old.missionClaims=['gift','hall2'];old.mission=2;old.starterGiftClaimed=true;old.starterGiftVersion=2;old.conquered.fort=true;
  Game.importSave(old);assert.equal(Chapter.progress(Game.state).unlocked,true);assert.equal(Chapter.progress(Game.state).claimed,0);assert.equal(Game.missionClaimed('gift'),true);assert.equal(Game.missionClaimed('hall2'),true);assert.equal(Game.state.res.food,old.res.food);
});
test('a mixed army can fight all six successive stages and restore the finished chapter',()=>{
  const env=loadGame(123),{Game,Chapter}=env;city(Game,{hall:4,house:10,drill:10,barracks:10});Game.state.conquered.fort=true;Game.state.res.food=10000000;
  Object.assign(Game.state.army,{shield:600,spear:800,archer:2200,cavalry:400});
  for(const n of Chapter.nodes){const army=Object.fromEntries(['shield','spear','archer','cavalry'].map(id=>[id,Game.state.army[id]]));const result=battle(env,n.id,'occupy',army);assert.equal(result.won,true,n.name);assert.equal(Game.claimMission('chapter2_'+n.id),null);env.advance(90001);Game.dismissBattle();assert.equal(Game.validSave(Game.state),true);Game.init();}
  assert.equal(Chapter.progress(Game.state).conquered,6);assert.equal(Chapter.progress(Game.state).claimed,6);assert.equal(Chapter.progress(Game.state).next,null);assert.equal(Game.state.stats.victories,6);
});
