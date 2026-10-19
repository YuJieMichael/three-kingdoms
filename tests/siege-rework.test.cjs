const {test}=require('node:test'),assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path');
const {loadGame,city}=require('./helpers/game.cjs');
// v0.36.0: city walls and defences, siege-engine targets, per-unit results, cavalry charge, army advice, full field output
// (design/quick-specs/progression-rework-2026-10-18.md §5–7).
function ready(seed=1){const e=loadGame(seed),g=e.Game,s=g.state;city(g,{hall:10,house:10,drill:10,barracks:10,academy:10,workshop:10});for(const id of Object.keys(s.tech))s.tech[id]=10;s.res.food=1e7;s.honors.noble=5;e.evaluate('Math.random=()=>.5');return {e,g,s};}
function fight(e,id,army,mode='occupy',orders={}){const g=e.Game,s=g.state;Object.assign(s.army,army);for(const k of Object.keys(army)){const o=orders[k]||{};g.setTactic(k,o.command||'advance',o.target||'');}
  const err=g.dispatch(id,'lin',army,mode,true);if(err)throw Error(err);e.advance(Math.ceil(s.expedition.end-e.now())+1);assert.equal(g.startBattle(),null);const b=s.battle;for(let i=0;i<30&&!b.finished;i++)g.battleRound();return b;}
test('every ordinary city, county and named county has walls and defences by level',()=>{
  const {g}=ready(),f=id=>g.getNode(id).fortification;
  assert.deepEqual({...f('yellow_qingshi').defenses},{trap:20,abatis:0,logs:0,rocks:0});assert.equal(f('yellow_qingshi').hp,3000);assert.equal(f('yellow_qingshi').tower,0);
  assert.equal(f('fort').hp,8000);assert.equal(f('fort').tower,600);assert.equal(f('north_keep').hp,15000);assert.deepEqual({...f('north_keep').defenses},{trap:60,abatis:20,logs:10,rocks:0});
  assert.equal(f('named_luoshui').hp,15000);assert.equal(f('named_beiyuan').cityWall,undefined,'cities with their own fortification keep it');
});
test('a raid meets no walls or defences; an occupation does, and traps fire once',()=>{
  const {e,g,s}=ready();const raid=fight(e,'yellow_qingshi',{archer:800,shield:200},'raid');assert.equal(raid.gate,null);assert.equal(raid.walls,undefined);
  e.advance(4*3600000);g.dismissBattle();
  const b=fight(e,'yellow_qingshi',{archer:800,shield:200});assert.ok(b.log.some(l=>/城防陷阱 20 个发动/.test(l)));assert.equal(b.walls.trap,0);assert.equal(b.log.filter(l=>/陷阱/.test(l)).length,1);assert.equal(g.validSave(s),true);
});
test('wall damage stays after the siege and recovers 10% of the full gate an hour',()=>{
  const {e,g,s}=ready();const b=fight(e,'yellow_huangsha',{archer:200,shield:50},'occupy');assert.equal(b.result.won,false,'a small army breaks nothing');
  const saved=s.cityWalls.yellow_huangsha;assert.ok(saved);assert.equal(saved.trap,0);assert.ok(saved.gate<=15000);
  e.advance(5*3600000);const w=g.wallsPreview('yellow_huangsha');assert.equal(w.trap,30,'half of 60 traps back after 5 hours');assert.equal(w.gate,Math.min(15000,saved.gate+7500));assert.equal(g.validSave(s),true);
});
test('a full city with no wall record shows its whole defence; a taken city drops the record',()=>{
  const {g,s}=ready();assert.equal(JSON.stringify(g.wallsPreview('yellow_qingshi')),JSON.stringify({gate:3000,trap:20,abatis:0,logs:0,rocks:0}));
  s.cityWalls.yellow_qingshi={gate:0,trap:0,abatis:0,logs:0,rocks:0,at:Date.now()};assert.equal(g.validSave(s),true);
  s.cityWalls.yellow_qingshi.gate=99999;assert.equal(g.validSave(s),false,'a wall record above the full gate is invalid');
});
test('catapults batter the gate by default and shoot troops when ordered; ballistas never touch the gate',()=>{
  const army={archer:1500,shield:600,spear:400,catapult:20,ballista:20};
  const gate=fight(ready().e,'yellow_huangsha',army,'occupy',{archer:{command:'hold'}});assert.ok(gate.unitStats.catapult.gate>0);assert.equal(gate.unitStats.ballista?.gate||0,0);
  const troops=fight(ready().e,'yellow_huangsha',army,'occupy',{archer:{command:'hold'},catapult:{target:'archer'}});
  assert.equal(troops.unitStats.catapult?.gate||0,0);assert.ok((troops.unitStats.catapult?.kills||0)>0,'catapults turned on the troops');
});
test('the battle report keeps kills and gate damage for each troop type',()=>{
  const {e,g,s}=ready();fight(e,'yellow_qingshi',{archer:800,shield:200,catapult:5});const r=s.reports[0];
  assert.ok(r.unitStats.archer.kills>0);assert.ok(r.unitStats.catapult.gate>0);assert.equal(g.validSave(s),true);
  r.unitStats.archer.kills=-1;assert.equal(g.validSave(s),false);
});
test('cavalry charge grows with might and thins out beyond the general\'s leadership',()=>{
  const g=loadGame().Game;assert.equal(JSON.stringify(g.cavalryCommand('lin')),JSON.stringify({cap:100,bonus:64/400}));
  assert.equal(g.cavalryChargeFactor('lin',100),1+64/400,'within leadership the full charge');assert.equal(g.cavalryChargeFactor('lin',200),1+64/400/2,'twice the leadership halves it');assert.equal(g.cavalryChargeFactor('lin',0),1);
});
test('the army advice reads intel, walls and the stage task, and never changes the save',()=>{
  const {e,g,s}=ready();e.evaluate(fs.readFileSync(path.join(__dirname,'..','army-advice.js'),'utf8'));const A=e.evaluate('ArmyAdvice');
  Object.assign(s.army,{spear:500,archer:800,shield:300,cavalry:200,catapult:10});s.conquered.camp=true;const before=JSON.stringify(s);
  const camp=A.recommend(g,'north_camp','occupy','lin');assert.ok(camp.army.spear>0);assert.ok(camp.reasons.some(r=>/枪克骑/.test(r)));assert.ok(camp.reasons.some(r=>/40%/.test(r)));
  const keep=A.recommend(g,'north_keep','occupy','lin');assert.ok(keep.reasons.some(r=>/城门 15,000/.test(r)));assert.ok(keep.army.catapult>0);assert.ok(keep.reasons.some(r=>/陷阱 60/.test(r)));
  const wild=Object.keys(s.raided).length?null:A.recommend(g,'yellow_qingshi','raid','lin');assert.ok(wild.reasons.some(r=>/侦察/.test(r)));
  assert.equal(JSON.stringify(s),before);
});
test('resource fields produce the handbook\'s full output',()=>{assert.equal(loadGame().Game.economyOutputFactor,1);});
test('catapults on their default hold order move up to the gate and batter it',()=>{
  const {e,g,s}=ready();assert.equal(s.tactics.catapult.command,'hold');for(const id of Object.keys(s.tech))s.tech[id]=6; // shorter range: the gate starts out of reach
  const b=fight(e,'yellow_huangsha',{archer:1500,shield:600,catapult:10},'occupy',{catapult:{command:'hold'}});
  assert.ok(b.player.find(r=>r.id==='catapult').pos>0,'the catapults moved up');assert.ok((b.unitStats.catapult?.gate||0)>0,'and battered the gate');
});
