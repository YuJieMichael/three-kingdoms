const {test}=require('node:test'),assert=require('node:assert/strict');
const {loadGame,city}=require('./helpers/game.cjs');

// Story type: Integration. Output: tests/tactical-lessons.smoke.test.cjs.
// Gate: BLOCKING for the three-lesson prototype; not a full-game or pacing gate.
const ids=['ready_shot','bait_chase','fire_reveal'];
const copy=value=>JSON.parse(JSON.stringify(value));
function checkpoint(g){assert.equal(g.save(),true);return {state:copy(g.state),raw:g.exportStoredRaw()};}
function unchanged(g,before){assert.deepEqual(copy(g.state),before.state);assert.equal(g.exportStoredRaw(),before.raw);assert.equal(g.validSave(g.state),true);}

// Precondition: a fresh saved city without a live formal battle.
// Steps: open each lesson, inspect/leave it, then reload/import an active lesson.
// Expected Result: distinct teaching sessions use new rules and grant no generals.
// Pass Criteria: all three start successfully and the full official save is identical.
test('all three tactical lessons are independent fixed sessions and never grant their named generals',()=>{
 const e=loadGame(910),g=e.Game,before=checkpoint(g),names=[];
 for(const id of ids){
  assert.equal(g.startTacticalLesson(id),null);const lesson=g.lessonInfo();
  assert.equal(lesson.id,id);assert.ok(lesson.title);assert.ok(lesson.description);assert.ok(lesson.objective);names.push(lesson.generalName);
  assert.equal(lesson.battle.rules,3);assert.ok(lesson.battle.stratagem);assert.deepEqual(copy(g.currentBattle()),copy(lesson.battle));
  assert.equal(g.state.battle,null);unchanged(g,before);
  assert.equal(g.endTacticalLesson(),null);assert.equal(g.lessonInfo(),null);assert.equal(g.currentBattle(),null);unchanged(g,before);
 }
 assert.equal(new Set(names).size,3);assert.deepEqual(copy(g.state.generals),['lin','su']);
 assert.equal(g.startTacticalLesson('fire_reveal'),null);g.init();assert.equal(g.lessonInfo(),null);unchanged(g,before);
 assert.equal(g.startTacticalLesson('bait_chase'),null);g.importSave(copy(before.state));assert.equal(g.lessonInfo(),null);unchanged(g,before);
});

// Precondition: a saved city and one ephemeral lesson.
// Steps: use each advertised tactic, execute battle rounds, then save and retry.
// Expected Result: combat, defeat/victory and retries affect only the lesson.
// Pass Criteria: all official resources, armies, XP, ownership and stored bytes match.
test('playing and retrying every lesson consumes no official soldiers, resources, XP or recruitment progress',()=>{
 const e=loadGame(911),g=e.Game,before=checkpoint(g);
 for(const id of ids){
  assert.equal(g.startTacticalLesson(id),null);const battle=g.currentBattle();
  const type={ready_shot:'huangzhong',bait_chase:'weiyan',fire_reveal:'xushu'}[id];
  const args=id==='ready_shot'?{unit:'archer'}:id==='bait_chase'?{unit:'spear',target:'cavalry'}:{planId:g.battleTacticsView(battle).plans.find(p=>p.side==='enemy'&&p.type==='fire').id};
  const quote=g.battleTacticQuote(type,args,battle);assert.equal(quote.ok,true,quote.reason);assert.equal(g.lessonTactic(type,args,quote.key).ok,true);g.lessonRound();g.lessonRound();
  if(!battle.finished)assert.equal(g.lessonAllOrders('advance'),null);
  for(let i=0;i<30&&!battle.finished;i++)g.lessonRound();
  assert.equal(battle.finished,true);assert.equal(g.lessonInfo().result.objectiveMet,true,id);unchanged(g,before);
  assert.equal(g.save(),true);unchanged(g,before);
  assert.equal(g.endTacticalLesson(),null);assert.equal(g.startTacticalLesson(id),null);assert.equal(g.currentBattle().round,0);unchanged(g,before);
  assert.equal(g.endTacticalLesson(),null);
 }
 g.init();unchanged(g,before);assert.equal(g.lessonInfo(),null);
});

// Precondition: an ordinary dispatched battle is already running.
// Steps: try to start each lesson and compare the formal battle/save.
// Expected Result: tutorials cannot replace or bypass a live official engagement.
// Pass Criteria: every start is rejected atomically, with no tutorial session.
test('a live ordinary battle rejects lessons without replacing its army or frozen state',()=>{
 const e=loadGame(912),g=e.Game;city(g,{drill:1});g.state.army.archer=30;
 assert.equal(g.dispatch('field','lin',{archer:30},'raid'),null);e.advance(g.state.expedition.end-e.now()+1);assert.equal(g.startBattle(),null);
 const before=checkpoint(g);
 for(const id of ids){assert.ok(g.startTacticalLesson(id));assert.equal(g.lessonInfo(),null);unchanged(g,before);}
 assert.equal(g.currentBattle(),g.state.battle);assert.equal(g.state.battle.finished,false);
});

// Precondition: a fresh city and, later, an existing lesson.
// Steps: request an unknown lesson and submit malformed unit orders/targets.
// Expected Result: rejected inputs neither start a session nor corrupt an existing one.
// Pass Criteria: formal bytes and the active lesson snapshot both remain unchanged.
test('invalid lesson and unit commands are atomic and never leak into the official save',()=>{
 const e=loadGame(913),g=e.Game,before=checkpoint(g);
 assert.ok(g.startTacticalLesson('unknown_lesson'));assert.equal(g.lessonInfo(),null);unchanged(g,before);
 assert.equal(g.startTacticalLesson(ids[0]),null);
 for(const command of [()=>g.lessonOrder('unknown_unit','advance'),()=>g.lessonAllOrders('unknown_order'),()=>g.lessonTarget('unknown_unit','archer'),...[.5,-1,'0',NaN,Infinity].map(index=>()=>g.lessonOrder(index,'advance'))]){
  const lesson=copy(g.lessonInfo());assert.ok(command());assert.deepEqual(copy(g.lessonInfo()),lesson);unchanged(g,before);
 }
 assert.equal(g.endTacticalLesson(),null);unchanged(g,before);
});

// Precondition: the fire lesson starts with one hidden enemy preparation.
// Steps: read public copy/view, reveal that announced plan, then retry the command.
// Expected Result: neither the introduction nor the tactics view gives it away.
// Pass Criteria: coordinates appear only after reveal and its cost is paid once.
test('the fire lesson keeps its exact interval hidden until the player reveals the submitted plan',()=>{
 const e=loadGame(914),g=e.Game,before=checkpoint(g);assert.equal(g.startTacticalLesson('fire_reveal'),null);
 const info=g.lessonInfo();assert.doesNotMatch(info.description+' '+info.objective,/1400|1500/);
 const initial=g.battleTacticsView(g.currentBattle()),plan=initial.plans.find(p=>p.side==='enemy'&&p.type==='fire');assert.ok(plan);assert.equal(plan.left,undefined);assert.equal(plan.right,undefined);
 const args={planId:plan.id},q=g.battleTacticQuote('xushu',args,g.currentBattle());assert.ok(!q.reason,q.reason);assert.equal(g.lessonTactic('xushu',args,q.key).ok,true);
 const revealed=g.battleTacticsView(g.currentBattle()).plans.find(p=>p.id===plan.id);assert.equal(revealed.left,1400);assert.equal(revealed.right,1500);
 const paid=copy(g.currentBattle().stratagem);assert.equal(g.lessonTactic('xushu',args,q.key).ok,true);assert.deepEqual(copy(g.currentBattle().stratagem),paid);unchanged(g,before);
 assert.equal(g.endTacticalLesson(),null);unchanged(g,before);
});
