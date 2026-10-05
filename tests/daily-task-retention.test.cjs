const {test}=require('node:test'),assert=require('node:assert/strict');
const {loadGame}=require('./helpers/game.cjs');

const copy=value=>JSON.parse(JSON.stringify(value));
function prepare(){
  const env=loadGame(),g=env.Game;
  assert.equal(g.claimStarterGift(),null);
  const build=g.state.daily.tasks.find(t=>t.template==='build');
  const donations=['donate_food','donate_wood','donate_gold'].map(id=>g.state.daily.tasks.find(t=>t.template===id));
  assert.ok(build&&donations.every(Boolean));
  for(const t of [build,...donations])assert.equal(g.acceptDaily(t.uid),null);
  const site=g.state.cityLayout.indexOf(null);
  assert.equal(g.queueBuilding(site,'house'),null);
  env.advance(Math.ceil(g.state.buildQueue[0].end-env.now())+1);
  assert.equal(build.progress,1);
  assert.equal(build.target,2);
  assert.equal(g.validSave(g.state),true);
  return {env,g,build,donations};
}
function rewards(g){return copy({res:g.state.res,inventory:g.state.inventory,prestige:g.state.prestige,copper:g.state.copper,claimed:g.state.daily.claimed});}
function afterClaims(g,before,tasks){
  const expected=copy(before);
  for(const t of tasks){
    const def=g.progression.definition(t),r=g.progression.reward(t),item=g.progression.taskItem(g.state,t);
    if(def.resource)expected.res[def.resource]-=t.target;
    for(const [id,n] of Object.entries(r.resources))expected.res[id]+=n;
    expected.res.gold+=r.gold;expected.prestige+=r.prestige;expected.copper+=r.copper;
    expected.inventory[item.id]=(expected.inventory[item.id]||0)+1;expected.claimed++;
  }
  return expected;
}

test('claiming one daily task preserves every other task and pays its cost and reward once',()=>{
  const {g,build,donations}=prepare(),target=donations[0];
  const remaining=copy(g.state.daily.tasks.filter(t=>t.uid!==target.uid)),before=rewards(g);
  const expected=afterClaims(g,before,[target]);
  assert.equal(g.claimDaily(target.uid),null);
  assert.deepEqual(copy(g.state.daily.tasks),remaining);
  assert.equal(g.state.daily.tasks.find(t=>t.uid===build.uid).progress,1);
  assert.deepEqual(rewards(g),expected);
  assert.ok(g.claimDaily(target.uid));
  assert.deepEqual(rewards(g),expected);
  assert.deepEqual(copy(g.state.daily.tasks),remaining);
  assert.equal(g.validSave(g.state),true);
});

test('abandoning one accepted daily task preserves the board and does not charge or grant anything',()=>{
  const {g,build,donations}=prepare(),target=donations[0];
  const remaining=copy(g.state.daily.tasks.filter(t=>t.uid!==target.uid)),before=rewards(g);
  assert.equal(g.abandonDaily(target.uid),null);
  assert.deepEqual(copy(g.state.daily.tasks),remaining);
  assert.equal(g.state.daily.tasks.find(t=>t.uid===build.uid).progress,1);
  assert.deepEqual(rewards(g),before);
  assert.ok(g.abandonDaily(target.uid));
  assert.ok(g.claimDaily(target.uid));
  assert.deepEqual(rewards(g),before);
  assert.equal(g.validSave(g.state),true);
});

test('batch daily claims reward every ready task once and retain unfinished and available tasks',()=>{
  const {g,build,donations}=prepare(),ids=new Set(donations.map(t=>t.uid));
  const remaining=copy(g.state.daily.tasks.filter(t=>!ids.has(t.uid))),before=rewards(g);
  const expected=afterClaims(g,before,donations);
  assert.equal(g.claimReadyDaily(),null);
  assert.deepEqual(copy(g.state.daily.tasks),remaining);
  assert.equal(g.state.daily.claimed,3);
  assert.equal(g.state.daily.tasks.find(t=>t.uid===build.uid).progress,1);
  assert.deepEqual(rewards(g),expected);
  assert.ok(g.claimReadyDaily());
  for(const t of donations)assert.ok(g.claimDaily(t.uid));
  assert.ok(g.claimDaily(build.uid));
  assert.deepEqual(rewards(g),expected);
  assert.deepEqual(copy(g.state.daily.tasks),remaining);
  assert.equal(g.validSave(g.state),true);
});

test('save reload and import retain unclaimed tasks and their progress after a claim and abandonment',()=>{
  const {g,build,donations}=prepare();
  assert.equal(g.claimDaily(donations[0].uid),null);
  assert.equal(g.abandonDaily(donations[1].uid),null);
  const daily=copy(g.state.daily),paid=rewards(g);
  assert.equal(g.save(),true);
  g.init();
  assert.deepEqual(copy(g.state.daily),daily);
  assert.equal(g.state.daily.tasks.find(t=>t.uid===build.uid).progress,1);
  assert.deepEqual(rewards(g),paid);
  g.importSave(copy(g.state));
  assert.deepEqual(copy(g.state.daily),daily);
  assert.deepEqual(rewards(g),paid);
  assert.ok(g.claimDaily(donations[0].uid));
  assert.deepEqual(rewards(g),paid);
  assert.equal(g.validSave(g.state),true);
});

test('two-hour refill adds available tasks without replacing accepted tasks or losing progress',()=>{
  const {env,g,build,donations}=prepare();
  assert.equal(g.claimDaily(donations[0].uid),null);
  const previous=copy(g.state.daily.tasks),serial=g.state.daily.serial;
  env.advance(g.state.daily.refillAt+g.progression.REFILL-env.now()+1);
  assert.deepEqual(copy(g.state.daily.tasks.slice(0,previous.length)),previous);
  assert.equal(g.state.daily.tasks.length,previous.length+1);
  assert.equal(g.state.daily.serial,serial+1);
  assert.equal(g.state.daily.tasks.at(-1).status,'available');
  assert.equal(g.state.daily.tasks.find(t=>t.uid===build.uid).progress,1);
  assert.equal(g.state.daily.claimed,1);
  assert.equal(g.validSave(g.state),true);
});

test('the server-day refresh replaces the previous board once and rejects old task IDs after reload',()=>{
  const {env,g,build,donations}=prepare();
  assert.equal(g.claimDaily(donations[0].uid),null);
  const start=g.state.daily.start,oldIds=g.state.daily.tasks.map(t=>t.uid);
  env.advance(start+g.progression.DAY-env.now()-1);
  assert.equal(g.state.daily.start,start);
  assert.equal(g.state.daily.tasks.find(t=>t.uid===build.uid).progress,1);
  env.advance(1);
  assert.equal(g.state.daily.start,start+g.progression.DAY);
  assert.equal(g.state.daily.tasks.length,g.progression.BOARD_SIZE);
  assert.equal(g.state.daily.claimed,0);
  assert.ok(g.state.daily.tasks.every(t=>t.status==='available'&&t.progress===0&&t.acceptedAt===0&&!oldIds.includes(t.uid)));
  const daily=copy(g.state.daily),before=rewards(g);
  assert.ok(g.claimDaily(build.uid));
  assert.ok(g.abandonDaily(build.uid));
  assert.ok(g.acceptDaily(build.uid));
  assert.deepEqual(copy(g.state.daily),daily);
  assert.deepEqual(rewards(g),before);
  g.save();g.init();g.tick();
  assert.deepEqual(copy(g.state.daily),daily);
  assert.deepEqual(rewards(g),before);
  assert.equal(g.validSave(g.state),true);
});
