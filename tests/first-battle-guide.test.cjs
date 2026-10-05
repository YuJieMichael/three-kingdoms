const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const {loadGame}=require('./helpers/game.cjs');
const {run}=require('./balance/archer-onboarding.cjs');
function earned(stopKind){
 const result=stopKind?run(123,true,'ten-gifts',{stopKind,includeState:true}):run(123,true,'archer',{includeState:true}),e=loadGame(123);
 e.advance(result.state.last-e.now());e.Game.importSave(result.state);return {...e,guide:e.evaluate('GrowthGuide')};
}
function finish(e,q){e.advance(Math.max(1,Math.ceil(q.end-e.now())+1));}
function inspect(e){const before=JSON.stringify(e.Game.state),m=e.guide.model(e.Game);e.guide.key(e.Game);assert.equal(JSON.stringify(e.Game.state),before);return m;}
function fight(e,count=30,command='advance'){
 const g=e.Game;assert.equal(g.setTactic('archer',command,''),null);assert.equal(g.dispatch('field','lin',{archer:count},'raid'),null);finish(e,g.state.expedition);assert.equal(g.startBattle(),null);
 for(let n=0;n<30&&!g.state.battle.finished;n++){const m=inspect(e);if(command==='advance')assert.equal(g.setBattleOrder('archer',m.inRange?'hold':'advance'),null);g.battleRound();}
 return g.state.battle.result;
}
test('earned thirty archers continue through real scouting prerequisites and UI opens scout training without altering the save',()=>{
 const e=earned(),g=e.Game;assert.equal(g.state.army.archer,30);assert.equal(g.state.stats.victories,0);assert.equal(g.state.onboarding.firstBattle,'active');
 let m=inspect(e);assert.equal(m.phase,'battle');assert.equal(m.kind,'tech');assert.equal(m.id,'scouting');assert.match(m.title,/研究/);assert.equal(g.research(m.id),null);assert.equal(inspect(e).queueKind,'research');e.offline(1);assert.equal(inspect(e).id,'scouting');finish(e,g.state.researchQueue);
 m=inspect(e);assert.equal(m.kind,'train');assert.equal(m.id,'scout');assert.equal(m.count,1);
 e.evaluate(fs.readFileSync(path.join(__dirname,'../onboarding-ui.js'),'utf8'));e.evaluate('let trainOpening=null; function trainModal(id,count){trainOpening={id,count};}');const before=JSON.stringify(g.state);e.evaluate('guideGo()');assert.deepEqual(JSON.parse(e.evaluate('JSON.stringify(trainOpening)')),{id:'scout',count:1});assert.equal(JSON.stringify(g.state),before);
 assert.equal(g.train('scout',1),null);assert.equal(inspect(e).queueKind,'train');finish(e,g.state.trainQueue.at(-1));assert.equal(inspect(e).kind,'scout');assert.equal(g.intel('field'),null);assert.equal(g.scout('field'),null);assert.equal(g.intel('field').exact,false);assert.equal(inspect(e).kind,'dispatch');assert.equal(g.state.army.scout,1);
});
test('existing hold is preserved until the player changes it, and the first fight teaches in-range hold and return',()=>{
 const e=earned('dispatch'),g=e.Game;assert.equal(g.setTactic('archer','hold',''),null);const m=inspect(e);assert.equal(m.kind,'tactics');assert.equal(g.state.tactics.archer.command,'hold');assert.match(m.reason,/向前/);assert.match(g.completeFirstBattleGuide(),/先完成/);
 assert.equal(g.setTactic('archer','advance',''),null);assert.equal(inspect(e).kind,'dispatch');assert.equal(g.dispatch('field','lin',{archer:30},'raid'),null);assert.equal(inspect(e).kind,'battleMarch');assert.equal(g.state.army.scout,1);finish(e,g.state.expedition);assert.equal(inspect(e).kind,'battleArrival');assert.equal(g.startBattle(),null);assert.equal(inspect(e).inRange,false);
 let sawInRange=false;for(let n=0;n<30&&!g.state.battle.finished;n++){const plan=inspect(e);sawInRange ||=!!plan.inRange;assert.equal(g.setBattleOrder('archer',plan.inRange?'hold':'advance'),null);g.battleRound();}
 assert.equal(sawInRange,true);assert.equal(g.state.battle.result.won,true);assert.ok(g.state.battle.round<30);assert.equal(g.state.battle.result.jewelDrops.pearl,1);assert.equal(inspect(e).kind,'battleReturn');assert.match(g.completeFirstBattleGuide(),/返城/);finish(e,g.state.expedition);assert.equal(g.state.army.archer,30);assert.equal(inspect(e).kind,'firstBattleComplete');
 const pearl=g.state.jewels.pearl;assert.equal(e.evaluate("HeritageSystem.promote('office')"),null);assert.equal(g.state.jewels.pearl,pearl-1);assert.equal(g.state.honors.office,1);assert.equal(g.completeFirstBattleGuide(),null);assert.equal(inspect(e).phase,'hall');assert.equal(g.validSave(g.state),true);e.offline(1);assert.equal(g.state.onboarding.firstBattle,'complete');assert.equal(inspect(e).phase,'hall');
});
test('a failed understrength attack returns survivors and trains only missing archers before retrying',()=>{
 const e=earned('dispatch'),g=e.Game,result=fight(e,1);assert.equal(result.won,false);assert.equal(g.state.stats.victories,0);assert.equal(g.state.jewels.pearl,0);assert.ok(result.lost.archer>0);assert.equal(inspect(e).kind,'battleReturn');finish(e,g.state.expedition);
 const m=inspect(e);assert.equal(m.kind,'train');assert.equal(m.id,'archer');assert.equal(m.count,result.lost.archer);assert.equal(g.train(m.id,m.count),null);const queued=inspect(e);assert.equal(queued.kind,'queue');assert.equal(queued.queueKind,'train');finish(e,g.state.trainQueue.at(-1));assert.equal(g.state.army.archer,30);assert.equal(inspect(e).kind,'dispatch');assert.equal(g.validSave(g.state),true);
});
test('another deployment or city role offers a real recovery path instead of demanding duplicate troops or a busy general',()=>{
 const e=earned('dispatch'),g=e.Game;assert.equal(e.evaluate("HeritageSystem.assign('su','lin','')"),null);assert.equal(inspect(e).kind,'roles');assert.equal(e.evaluate("HeritageSystem.assign('su','','')"),null);assert.equal(inspect(e).general,'lin');
 assert.equal(g.dispatch('wood','lin',{archer:30},'raid'),null);let m=inspect(e);assert.equal(m.kind,'battleMarch');assert.equal(m.id,'wood');assert.equal(g.recall(),null);m=inspect(e);assert.equal(m.kind,'battleReturn');finish(e,g.state.expedition);assert.equal(g.state.army.archer,30);assert.equal(inspect(e).kind,'dispatch');
});
test('old victories skip the tutorial without repaying gifts, battles, gold or jewels, while invalid markers are rejected',()=>{
 const result=run(123,true,'first-battle',{includeState:true}),e=loadGame(),g=e.Game,old=result.state;delete old.onboarding.firstBattle;e.advance(old.last-e.now());const balances=JSON.stringify({res:old.res,jewels:old.jewels,claims:old.missionClaims});g.importSave(old);assert.equal(g.state.onboarding.firstBattle,'complete');assert.equal(e.evaluate('GrowthGuide.model(Game).phase'),'hall');assert.equal(JSON.stringify({res:g.state.res,jewels:g.state.jewels,claims:g.state.missionClaims}),balances);e.offline(1);assert.equal(g.state.onboarding.firstBattle,'complete');
 const bad=JSON.parse(JSON.stringify(g.state));bad.onboarding.firstBattle='claimed';assert.equal(g.validSave(bad),false);
});
test('finishing the tutorial is optional for promotion and is idempotent with no reward duplication',()=>{
 const e=earned('firstBattleComplete'),g=e.Game;assert.equal(g.state.honors.office,0);assert.equal(g.state.army.archer,30);assert.equal(g.state.stats.victories,1);const before={gold:g.state.res.gold,pearl:g.state.jewels.pearl,claims:[...g.state.onboarding.claims],victories:g.state.stats.victories};assert.equal(g.completeFirstBattleGuide(),null);assert.equal(g.completeFirstBattleGuide(),null);assert.deepEqual({gold:g.state.res.gold,pearl:g.state.jewels.pearl,claims:[...g.state.onboarding.claims],victories:g.state.stats.victories},before);assert.equal(g.state.honors.office,0);assert.equal(inspect(e).phase,'hall');
});
