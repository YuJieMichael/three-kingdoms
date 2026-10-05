const {test}=require('node:test'),assert=require('node:assert/strict');
const {loadGame,city,cloneActiveSave}=require('./helpers/game.cjs');

// Story type: Logic/Integration. Output: tests/battle-stratagems.smoke.test.cjs.
// Gate: BLOCKING for the ordinary-battle prototype; not a full regression gate.
const copy=value=>JSON.parse(JSON.stringify(value));
function fixture(player='huangzhong',enemy='strategist'){
 const e=loadGame(920),g=e.Game,m=e.evaluate('BattleStratagems');
 const row=(id,count,pos)=>({id,initial:count,hp:count*g.units[id].hp,maxHp:count*g.units[id].hp,pos,stats:{hp:g.units[id].hp,atk:g.units[id].atk,def:g.units[id].def,range:g.units[id].range,speed:g.units[id].speed}});
 const b={rules:3,round:0,length:2000,finished:false,player:[row('archer',100,0),row('spear',30,0),row('cavalry',10,0)],enemy:[row('spear',30,1600),row('archer',100,1600),row('cavalry',10,1600)],orders:{},log:[]};
 const api={units:g.units,log:(battle,text)=>battle.log.push(text)};
 b.generalSnapshot={id:'fixture_player',wildLine:player};b.enemyGeneralSnapshot={id:'fixture_enemy',wildLine:enemy};
 b.stratagem=m.create(b,{player:b.generalSnapshot,enemy:b.enemyGeneralSnapshot});
 return {e,g,m,b,api};
}
function submit(f,side,action){const q=f.m.quote(f.b,side,action,f.api);assert.equal(q.ok,true,q.reason);const result=f.m.submit(f.b,side,action,q.key,f.api);assert.equal(result.ok,true,result.reason);return result;}
function orders(f,player={},enemy={}){return {player:Object.fromEntries(f.b.player.map(r=>[r.id,{command:player[r.id]||'hold',target:''}])),enemy:Object.fromEntries(f.b.enemy.map(r=>[r.id,{command:enemy[r.id]||'advance',target:''}]))};}
function begin(f,chosen=orders(f)){f.b.round++;f.m.beginRound(f.b,chosen,f.api);return chosen;}
function end(f){f.m.endRound(f.b,f.api);}
function onlyPlan(f,side,type){return f.b.stratagem.plans.find(p=>p.side===side&&p.type===type);}
function rejected(f,side,action,key){const before=copy(f.b.stratagem),q=f.m.quote(f.b,side,action,f.api);assert.equal(q.ok,false);const r=f.m.submit(f.b,side,action,key||'invalid-command',f.api);assert.equal(r.ok,false);assert.deepEqual(copy(f.b.stratagem),before);}

// Precondition: both sides have all three筹策 and fixed living units.
// Steps: submit a legal preparation, then extra/illegal actions from each side.
// Expected Result: one submission per round, fixed costs and atomic rejection.
// Pass Criteria: points fall once and rejected commands change no tactics state.
test('both sides enforce planning slots, legal costs and atomic invalid commands',()=>{
 for(const side of ['player','enemy']){
  const f=fixture(side==='player'?'huangzhong':'strategist',side==='enemy'?'huangzhong':'strategist');
  rejected(f,side,{type:'unknown',unit:'archer'});rejected(f,side,{type:'fire',unit:'unknown',left:600});rejected(f,side,{type:'fire',unit:'archer',left:0});
  submit(f,side,{type:'huangzhong',unit:'archer'});assert.equal(f.b.stratagem.points[side],2);
  rejected(f,side,{type:'fire',unit:'spear',left:600});
  begin(f);end(f);begin(f);end(f);
  assert.match(f.m.quote(f.b,side,{type:'huangzhong',unit:'archer'},f.api).reason,/每战/);rejected(f,side,{type:'huangzhong',unit:'archer'});
 }
});

// Precondition: an announced 黄忠 shot or fire preparation in planning phase.
// Steps: cancel it, attempt a refunded attack/second cancel, then inspect its slot.
// Expected Result: consumed points/reservations stay consumed; fire slot releases.
// Pass Criteria: no extra attack or refund and a second cancellation is atomic.
test('cancellation preserves consumed attack reservations and releases the unique fire slot',()=>{
 for(const side of ['player','enemy']){
  const shot=fixture(side==='player'?'huangzhong':'',side==='enemy'?'huangzhong':'');submit(shot,side,{type:'huangzhong',unit:'archer'});const plan=onlyPlan(shot,side,'huangzhong'),announced=copy(shot.b.stratagem);
  assert.equal(shot.m.cancel(shot.b,side==='player'?'enemy':'player',plan.id,shot.api).ok,false);assert.deepEqual(copy(shot.b.stratagem),announced);
  assert.equal(shot.m.cancel(shot.b,side,plan.id,shot.api).ok,true);assert.equal(shot.b.stratagem.points[side],2);
  begin(shot);assert.equal(shot.m.normalAttackAllowed(shot.b,side,'archer'),false);end(shot);begin(shot);assert.equal(shot.m.normalAttackAllowed(shot.b,side,'archer'),false);end(shot);
  const before=copy(shot.b.stratagem);assert.equal(shot.m.cancel(shot.b,side,plan.id,shot.api).ok,false);assert.deepEqual(copy(shot.b.stratagem),before);
 }
 const frozen=fixture();submit(frozen,'player',{type:'huangzhong',unit:'archer'});begin(frozen);const acting=copy(frozen.b.stratagem);assert.equal(frozen.m.cancel(frozen.b,'player',onlyPlan(frozen,'player','huangzhong').id,frozen.api).ok,false);assert.deepEqual(copy(frozen.b.stratagem),acting);
 const fire=fixture();submit(fire,'player',{type:'fire',unit:'archer',left:600});const burning=onlyPlan(fire,'player','fire');
 assert.equal(fire.m.cancel(fire.b,'player',burning.id,fire.api).ok,true);assert.equal(fire.b.stratagem.points.player,1);
 assert.equal(fire.m.quote(fire.b,'enemy',{type:'fire',unit:'archer',left:900},fire.api).ok,true);
});

// Precondition: 黄忠 prepares while an enemy stands outside normal range.
// Steps: advance to trigger round and move two enemies into range.
// Expected Result: only the first actual entrant consumes the one main attack.
// Pass Criteria: one trigger, no normal shot, and no second entrant trigger.
test('ready shot triggers only the first actual range entry and consumes the normal main attack',()=>{
 const f=fixture();submit(f,'player',{type:'huangzhong',unit:'archer'});begin(f);assert.equal(f.m.normalAttackAllowed(f.b,'player','archer'),false);end(f);begin(f);
 const target=f.b.enemy[0];target.pos=1000;
 const trigger=f.m.afterMove(f.b,'enemy',target,1600,f.api);assert.equal(trigger.length,1);assert.equal(trigger[0].side,'player');assert.equal(trigger[0].unit,'archer');assert.equal(trigger[0].target,target.id);
 assert.equal(f.m.normalAttackAllowed(f.b,'player','archer'),false);
 const second=f.b.enemy[2];second.pos=1100;assert.equal(f.m.afterMove(f.b,'enemy',second,1600,f.api).length,0);end(f);begin(f);assert.equal(f.m.normalAttackAllowed(f.b,'player','archer'),true);
});

// Precondition: a prepared shot with no new entrant, or a public enemy shot.
// Steps: keep the enemy in range/out of range; use the public watch counter.
// Expected Result: no free ordinary shot replaces a missed/cancelled preparation.
// Pass Criteria: no trigger, its round attack stays spent, later rounds recover.
test('already-in-range and absent entries expire, while watch cancels only the chosen ready shot',()=>{
 for(const pos of [1000,1600]){const f=fixture();submit(f,'player',{type:'huangzhong',unit:'archer'});begin(f);end(f);f.b.enemy[0].pos=pos;begin(f);const row=f.b.enemy[0];assert.equal(f.m.afterMove(f.b,'enemy',row,pos,f.api).length,0);assert.equal(f.m.normalAttackAllowed(f.b,'player','archer'),false);end(f);begin(f);assert.equal(f.m.normalAttackAllowed(f.b,'player','archer'),true);}
 const f=fixture('','huangzhong');submit(f,'enemy',{type:'huangzhong',unit:'archer'});const plan=onlyPlan(f,'enemy','huangzhong');begin(f);end(f);submit(f,'player',{type:'watch',planId:plan.id});assert.equal(f.b.stratagem.points.player,2);assert.equal(f.b.stratagem.points.enemy,2);begin(f);assert.equal(f.m.normalAttackAllowed(f.b,'enemy','archer'),false);assert.equal(f.m.normalAttackAllowed(f.b,'enemy','spear'),true);
});

// Precondition: a two-point fire announcement in an empty interior interval.
// Steps: cross it in either direction, including endpoints beyond the whole zone.
// Expected Result: both sides stop one unit outside its first entered boundary.
// Pass Criteria: exact boundary positions, no damage, normal caster attack at N+1.
test('fire blocks left and right entry and complete crossings without dealing health damage',()=>{
 const f=fixture();submit(f,'player',{type:'fire',unit:'archer',left:600});const hp=copy([...f.b.player,...f.b.enemy].map(r=>r.hp));assert.equal(f.m.view(f.b,'enemy').plans[0].left,undefined);begin(f);assert.equal(f.m.normalAttackAllowed(f.b,'player','archer'),false);assert.equal(f.m.view(f.b,'enemy').plans[0].left,undefined);end(f);assert.equal(f.m.view(f.b,'enemy').plans[0].left,undefined);begin(f);assert.equal(f.m.view(f.b,'enemy').plans[0].left,600);
 assert.equal(f.m.clipMove(f.b,0,1000),599);assert.equal(f.m.clipMove(f.b,1600,0),701);assert.equal(f.m.clipMove(f.b,0,600),599);assert.equal(f.m.clipMove(f.b,1600,700),701);assert.equal(f.m.clipMove(f.b,0,500),500);assert.equal(f.m.normalAttackAllowed(f.b,'player','archer'),true);assert.deepEqual(copy([...f.b.player,...f.b.enemy].map(r=>r.hp)),hp);
 end(f);assert.equal(f.m.clipMove(f.b,0,1000),1000);
});

// Precondition: an empty announced fire zone and later an occupying unit.
// Steps: attempt competing fire and place a unit inside before activation.
// Expected Result: only one global zone; occupancy invalidates the entire segment.
// Pass Criteria: no rival charge, no clipping at activation, and no refund.
test('one global fire slot and activation-time occupancy prevent stacking or traps under units',()=>{
 const f=fixture();submit(f,'player',{type:'fire',unit:'archer',left:600});rejected(f,'enemy',{type:'fire',unit:'archer',left:900});begin(f);end(f);f.b.enemy[0].pos=650;begin(f);assert.equal(f.m.clipMove(f.b,0,1000),1000);assert.equal(f.m.clipMove(f.b,1600,0),0);assert.equal(f.b.stratagem.points.player,1);
});

// Precondition: 魏延 has a cavalry/spear bait and a living melee target.
// Steps: quote sparse bait, exact one-third costs, and no retreat room.
// Expected Result: current surviving training cost defines eligibility.
// Pass Criteria: one rider cannot lure a large army; exact boundary succeeds.
test('bait costs reject one-rider large-army lures and accept the exact one-third boundary',()=>{
 const f=fixture('warrior','');const bait=f.b.player[2],target=f.b.enemy[0];bait.initial=1;bait.hp=bait.maxHp=bait.stats.hp;bait.pos=500;target.initial=100;target.hp=target.maxHp=100*target.stats.hp;
 rejected(f,'player',{type:'weiyan',unit:'cavalry',target:'spear'});target.initial=9;target.hp=target.maxHp=9*target.stats.hp;rejected(f,'player',{type:'weiyan',unit:'cavalry',target:'spear'});target.initial=8;target.hp=target.maxHp=8*target.stats.hp;assert.equal(f.m.quote(f.b,'player',{type:'weiyan',unit:'cavalry',target:'spear'},f.api).ok,true);
 const p=f.b.player[1];p.initial=1;p.hp=p.maxHp=p.stats.hp;p.pos=500;target.initial=3;target.hp=target.maxHp=3*target.stats.hp;assert.equal(f.m.quote(f.b,'player',{type:'weiyan',unit:'spear',target:'spear'},f.api).ok,true);p.hp=0;rejected(f,'player',{type:'weiyan',unit:'spear',target:'spear'});bait.pos=0;rejected(f,'player',{type:'weiyan',unit:'cavalry',target:'spear'});
});

// Precondition: 魏延 announces a valid, locked bait and performs a real retreat.
// Steps: enter the next round with the target advancing or holding.
// Expected Result: only an advancing target gets exclusive pursuit of that bait.
// Pass Criteria: no forced advance for hold; unavailable contact cannot hit others.
test('bait pursuit changes only an advancing target and never forces a holding army to move',()=>{
 for(const command of ['advance','hold']){
  const f=fixture('warrior','');f.b.player[1].pos=500;submit(f,'player',{type:'weiyan',unit:'spear',target:'spear'});const first=orders(f,{spear:'fallback'});begin(f,first);const row=f.b.player[1],from=row.pos;row.pos=200;f.m.afterMove(f.b,'player',row,from,f.api);end(f);const second=orders(f,{}, {spear:command});begin(f,second);const override=f.m.movementOverride(f.b,'enemy',f.b.enemy[0],second.enemy.spear);
  if(command==='advance'){assert.equal(override.exclusive,true);assert.equal(override.forcedTarget.id,'spear');assert.equal(override.forcedTarget.pos,200);}else{assert.equal(override.exclusive,false);assert.equal(override.forcedTarget,null);}
 }
});

// Precondition: an enemy announces a hidden fire target; 徐庶 has a planning slot.
// Steps: inspect the other side's view, reveal one plan, retry or inspect future.
// Expected Result: reveal exposes only the already locked interval and costs one.
// Pass Criteria: no hidden coordinates before reveal and no made-up future target.
test('reveal shows only a submitted hidden target and keeps the opposite side projection private',()=>{
 const f=fixture('strategist','');submit(f,'enemy',{type:'fire',unit:'archer',left:600});const plan=onlyPlan(f,'enemy','fire'),before=f.m.view(f.b,'player');assert.ok(!JSON.stringify(before).includes('"left":600'));
 rejected(f,'player',{type:'xushu',planId:'future_plan'});submit(f,'player',{type:'xushu',planId:plan.id});assert.equal(f.b.stratagem.points.player,2);assert.ok(JSON.stringify(f.m.view(f.b,'player')).includes('"left":600'));assert.equal(f.b.stratagem.points.enemy,1);
 const shot=fixture('strategist','huangzhong');submit(shot,'enemy',{type:'huangzhong',unit:'archer'});rejected(shot,'player',{type:'xushu',planId:onlyPlan(shot,'enemy','huangzhong').id});
});

// Precondition: an announced command has been saved as a plain JSON snapshot.
// Steps: repeat the same quote key/payload, then reuse it with a different payload.
// Expected Result: identical retries replay; conflicting/malformed snapshots fail.
// Pass Criteria: points/plans do not double-spend and invalid persisted states reject.
test('JSON reload preserves command idempotency and rejects contradictory tactic snapshots',()=>{
 const f=fixture(),action={type:'fire',unit:'archer',left:600},q=f.m.quote(f.b,'player',action,f.api);assert.equal(q.ok,true);assert.equal(f.m.submit(f.b,'player',action,q.key,f.api).ok,true);f.b=copy(f.b);const saved=copy(f.b.stratagem);assert.equal(f.m.valid(f.b,f.api),true);assert.equal(f.m.submit(f.b,'player',action,q.key,f.api).ok,true);assert.deepEqual(copy(f.b.stratagem),saved);assert.equal(f.m.submit(f.b,'player',{...action,left:900},q.key,f.api).ok,false);assert.deepEqual(copy(f.b.stratagem),saved);
 for(const corrupt of [b=>b.stratagem.points.player=-1,b=>b.stratagem.points.enemy=4,b=>b.stratagem.version=999,b=>b.stratagem.plans.push(copy(b.stratagem.plans[0])),b=>b.stratagem.plans[0].left=0,b=>b.stratagem.reservations=[],b=>b.stratagem.leaders.player.id='forged_leader',b=>b.stratagem.phase='acting']){const bad=copy(f.b);corrupt(bad);assert.equal(f.m.valid(bad,f.api),false);}
});

// Precondition: an ordinary new battle, and an old already-started rules2 save.
// Steps: submit/fire/reload a new battle; separately import the genuine old shape.
// Expected Result: new state is strict; old fights keep their original rules.
// Pass Criteria: old rules2 gets no stratagem, new paid command remains single-use.
test('ordinary save/reload retains new tactics while old ongoing rules2 battles receive no injected abilities',()=>{
 const e=loadGame(921),g=e.Game;city(g,{drill:1});g.state.army.archer=30;
 assert.equal(g.dispatch('field','lin',{archer:30},'raid'),null);e.advance(g.state.expedition.end-e.now()+1);assert.equal(g.startBattle(),null);assert.equal(g.state.battle.rules,3);
 const action={unit:'archer',left:600},q=g.battleTacticQuote('fire',action);assert.ok(!q.reason,q.reason);assert.equal(g.submitBattleTactic('fire',action,q.key).ok,true);const before=copy(g.state.battle.stratagem);g.save();g.init();assert.deepEqual(copy(g.state.battle.stratagem),before);assert.equal(g.submitBattleTactic('fire',action,q.key).ok,true);assert.deepEqual(copy(g.state.battle.stratagem),before);assert.equal(g.validSave(g.state),true);
 const official=copy(g.state);
 for(const corrupt of [b=>b.stratagem.points.player=3,b=>b.stratagem.leaders.player.id='forged',b=>b.stratagem.reservations=[],b=>{b.generalSnapshot.wildLine='huangzhong';b.stratagem.leaders.player.wildLine='huangzhong';b.stratagem.identities.player='huangzhong';}]){const bad=cloneActiveSave(g.state);corrupt(bad.battle);assert.equal(g.validSave(bad),false);assert.throws(()=>g.importSave(bad),/Invalid save/);assert.deepEqual(copy(g.state),official);}
 const legacy=cloneActiveSave(g.state);legacy.battle.rules=2;delete legacy.battle.stratagem;const original=JSON.stringify(legacy);const migrated=g.migrateSave(legacy);assert.equal(JSON.stringify(legacy),original);assert.equal(migrated.battle.rules,2);assert.equal(migrated.battle.stratagem,undefined);assert.equal(g.validSave(migrated),true);g.importSave(legacy);assert.equal(g.state.battle.rules,2);assert.equal(g.state.battle.stratagem,undefined);assert.equal(g.submitBattleTactic('fire',action,q.key).ok,false);g.battleRound();assert.equal(g.state.battle.rules,2);assert.equal(g.state.battle.stratagem,undefined);assert.equal(g.validSave(g.state),true);
});

// Precondition: the real round resolver runs an isolated 黄忠 lesson checkpoint.
// Steps: let equal-range archers approach, prepare, then execute the trigger round.
// Expected Result: trigger -> immediate counter -> enemy main -> legal counter.
// Pass Criteria: one player main attack, two independent counters, no counter chain.
test('the real round resolver orders prepared shots and immediate counters without granting a second main attack',()=>{
 const e=loadGame(922),g=e.Game,before=copy(g.state);assert.equal(g.startTacticalLesson('ready_shot'),null);const b=g.currentBattle();
 // Prepared geometry/counts isolate attack ordering, not lesson balance or pacing.
 b.enemy.find(r=>r.id==='shield').hp=0;const enemy=b.enemy.find(r=>r.id==='archer');enemy.initial=50;enemy.hp=enemy.maxHp=50*enemy.stats.hp;b.enemyOrders.archer.command='advance';
 const args={unit:'archer'},q=g.battleTacticQuote('huangzhong',args,b);assert.ok(!q.reason,q.reason);assert.equal(g.lessonTactic('huangzhong',args,q.key).ok,true);g.lessonRound();g.lessonRound();
 const strikes=b.currentRoundSummary.events.filter(e=>e.type==='strike');
 assert.deepEqual(copy(strikes.map(e=>[e.side,e.unit,e.target,e.counter])),[['player','archer','archer',false],['enemy','archer','archer',true],['enemy','archer','archer',false],['player','archer','archer',true]]);
 assert.equal(strikes.filter(e=>e.side==='player'&&!e.counter).length,1);assert.equal(strikes.filter(e=>e.counter).length,2);assert.deepEqual(copy(g.state),before);assert.equal(g.endTacticalLesson(),null);
});

// Precondition: prepared supplies/buildings; all three heroes still require portraits/capture/recruitment.
// Steps: recruit through real victories, dispatch each hero, import one old missing-line march, finish/reload.
// Expected Result: stable identities survive old marching saves and completed reports.
// Pass Criteria: three real owned heroes retain their correct identity and each completed battle is valid.
test('actually recruited heroes keep their identity through old missing-line marches and finished battle reloads',()=>{
 const e=loadGame(925),g=e.Game,wild=e.evaluate('HeroSystem.wild');city(g,{hall:6,inn:2,tavern:6,drill:2});g.state.honors.noble=2;g.state.army.archer=5000;for(const id of Object.keys(g.resources))g.state.res[id]=1000000;e.evaluate('Math.random=()=>.999999');assert.equal(wild.discover(),null);
 const lines=['huangzhong','warrior','strategist'],owned=[];
 const arrive=()=>{e.advance(Math.ceil(g.state.expedition.end-e.now())+1);assert.equal(g.startBattle(),null);};
 const finish=()=>{for(let n=0;n<30&&!g.state.battle.finished;n++)g.battleRound();assert.equal(g.state.battle.finished,true);assert.equal(g.state.battle.result.won,true);assert.equal(g.validSave(g.state),true);};
 const returned=()=>e.advance(Math.ceil(Math.max(g.state.expedition?.end||e.now(),...Object.values(g.state.cooldowns))-e.now())+1);
 for(const line of lines){
  const rumor=g.state.wildGenerals.rumors.find(r=>r.line===line),portrait=wild.portraitQuote(g.state,line);assert.ok(rumor);assert.equal(wild.buyPortrait(line,portrait.key),null);assert.equal(g.setTactic('archer','advance'),null);assert.equal(g.dispatch(rumor.node,'lin',{archer:1500},'raid'),null);arrive();finish();assert.equal(g.state.battle.result.wildGeneral.status,'captured');returned();
  const q=wild.recruitQuote(g.state,rumor.id,'gold');assert.equal(q.reason,'');assert.equal(wild.recruit(rumor.id,'gold',q.key),null);owned.push({line,id:rumor.id});
 }
 for(const {line,id}of owned){
  assert.equal(g.setTactic('archer','advance'),null);assert.equal(g.dispatch('field',id,{archer:30},'raid'),null);assert.equal(g.state.expedition.generalSnapshot.wildLine,line);
  if(line==='huangzhong'){const old=cloneActiveSave(g.state);delete old.expedition.generalSnapshot.wildLine;assert.equal(g.validSave(old),true);g.importSave(old);}
  arrive();assert.equal(g.state.battle.generalSnapshot.wildLine,line);assert.equal(g.battleTacticsView().identity.id,{huangzhong:'huangzhong',warrior:'weiyan',strategist:'xushu'}[line]);
  if(line==='huangzhong'){const q=g.battleTacticQuote('huangzhong',{});assert.equal(q.ok,true);assert.equal(g.submitBattleTactic('huangzhong',{},q.key).ok,true);assert.equal(g.state.battle.orders.archer.command,'hold');g.battleRound();g.battleRound();if(!g.state.battle.finished)assert.equal(g.setBattleOrder('archer','advance'),null);}
  finish();const result=copy(g.state.battle.result);assert.ok(Array.isArray(result.tacticEvents));assert.equal(typeof result.tacticPoints.player,'number');g.save();g.init();assert.deepEqual(copy(g.state.battle.result),result);assert.equal(g.validSave(g.state),true);returned();
 }
 assert.equal(owned.length,3);assert.equal(g.validSave(g.state),true);
});
