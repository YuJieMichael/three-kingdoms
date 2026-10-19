const {test}=require('node:test'),assert=require('node:assert/strict');
const {loadGame,city,battle}=require('./helpers/game.cjs');
// v0.35.3: each chapter stage has its own task (design/quick-specs/progression-rework-2026-10-18.md §3).
function ready(seed=1){const e=loadGame(seed),g=e.Game,s=g.state;city(g,{hall:10,house:10,drill:10,barracks:10,academy:10,workshop:5});for(const id of Object.keys(s.tech))s.tech[id]=10;s.res.food=1e7;s.res.gold=1e7;s.res.iron=1e7;e.evaluate('Math.random=()=>.5');return {e,g,s,C:e.Chapter};}
const fight=(e,id,army,mode='occupy')=>{const r=battle(e,id,mode,army,true);e.advance(Math.max(90001,(e.Game.state.cooldowns[id]||0)-e.now()+1)+6*3600000);e.Game.dismissBattle();return r;};
const conquer=(s,ids)=>{for(const id of ids){s.conquered[id]=true;s.raided[id]=true;}};
test('赤铁山 needs three wins, each one a 军械残图; raids count and only the third clears it',()=>{
  const {e,g,s}=ready();conquer(s,['field','wood','pass']);s.plots[0]={type:'mine',level:3};
  for(let i=1;i<=3;i++){Object.assign(s.army,{archer:600,spear:300,shield:200});assert.equal(fight(e,'mine',{archer:600,spear:300,shield:200},i===2?'raid':'occupy').won,true);
    assert.equal(g.chapterTaskDone('mine'),i===3,'win '+i);assert.equal(!!s.conquered.mine,i===3);}
  assert.equal(s.stageTasks.mine.count,3);assert.equal(g.landmarkVisible('camp'),true);assert.equal(g.validSave(s),true);
});
test('白石隘口 cannot be occupied without a precise scout report',()=>{
  const {g,s}=ready();conquer(s,['field','wood']);s.plots[0]={type:'mine',level:3};s.army.archer=300;
  assert.match(g.dispatchCheck('pass','lin',{archer:300},'occupy').reason,/精确侦察/);
  assert.equal(g.dispatchCheck('pass','lin',{archer:300},'raid').reason,'');
});
test('黄巾营寨 refuses a march under 60% archers and does not fall when archers bleed past 20%',()=>{
  const {e,g,s}=ready();conquer(s,['field','wood','pass','mine']);
  Object.assign(s.army,{archer:100,shield:200});assert.match(g.dispatchCheck('camp','lin',{archer:100,shield:200},'occupy').reason,/弓兵须占出征士兵 60%/);
  const T=e.evaluate('ChapterTasks'),camp=g.getNode('camp');
  const costly=T.victory(s,camp,'occupy',{army:{archer:100,shield:20},alive:{archer:79,shield:20},rounds:5});
  assert.equal(costly.claim,false,'a win that costs 21% of the archers leaves the camp standing');assert.match(costly.note,/弓兵伤亡 21%/);
  assert.equal(T.victory(s,camp,'occupy',{army:{archer:100,shield:20},alive:{archer:80,shield:0},rounds:5}).claim,null,'20% archer losses still count');
  Object.assign(s.army,{archer:600,shield:50});assert.equal(fight(e,'camp',{archer:600,shield:50}).won,true);assert.equal(s.conquered.camp,true);assert.equal(g.chapterTaskDone('camp'),true);
});
test('北原驿道 opens to an occupation only after 5,000 food is delivered',()=>{
  const {e,g,s,C}=ready();conquer(s,['field','wood','pass','mine','camp']);
  Object.assign(s.army,{archer:1500,shield:600});assert.match(g.dispatchCheck('north_road','lin',{archer:1500,shield:600},'occupy').reason,/运粮/);
  assert.match(g.dispatchCheck('north_road','lin',{archer:1500,shield:600},'raid').reason,/运粮/);
  assert.equal(g.chapterTask('north_road').deliver,true);
  const food=s.res.food;assert.equal(g.deliverChapterTask('north_road'),null);assert.equal(s.res.food,food-5000);assert.match(g.deliverChapterTask('north_road'),/已完成/);
  assert.equal(g.chapterTaskDone('north_road'),false);assert.equal(fight(e,'north_road',{archer:1500,shield:600}).won,true);
  assert.equal(g.chapterTaskDone('north_road'),true);assert.equal(C.blocked(s,'north_granary'),null);assert.equal(g.validSave(s),true);
});
test('洛水前哨 招降 costs gold and brings the surrendered troops home before the attack',()=>{
  const {g,s}=ready();conquer(s,['camp']);for(const n of loadGame().Chapter.nodes)conquer(s,[n.id]);
  const army={...s.army},gold=s.res.gold;assert.equal(g.deliverChapterTask('luo_outpost'),null);
  assert.equal(s.res.gold,gold-50000);assert.equal(s.army.spear,army.spear+150);assert.equal(s.army.shield,army.shield+100);
});
test('北原粮仓 takes a second, defensive battle against a counter-attack before it is held',()=>{
  const {e,g,s}=ready();conquer(s,['field','wood','pass','mine','camp','north_road']);
  const army={archer:1500,shield:600,spear:300};Object.assign(s.army,army);assert.equal(fight(e,'north_granary',army).won,true);
  assert.equal(s.conquered.north_granary,undefined);assert.equal(s.stageTasks.north_granary.pending,true);
  assert.equal(JSON.stringify(g.attackInfo('north_granary','occupy').army),JSON.stringify(e.evaluate('ChapterTasks.defs.north_granary.counter')));
  Object.assign(s.army,army);assert.equal(fight(e,'north_granary',army).won,true);assert.equal(s.conquered.north_granary,true);assert.equal(g.chapterTaskDone('north_granary'),true);
});
test('寒川渡口 counts gathering only while the stage is open, and the occupation waits for 3,000',()=>{
  const {e,g,s,C}=ready();const T=e.evaluate('ChapterTasks');
  T.onGather(s,2000);assert.equal(s.stageTasks.north_ford,undefined,'chapter two not open yet');
  conquer(s,['camp','north_road','north_granary']);T.onGather(s,2000);assert.equal(s.stageTasks.north_ford.gathered,2000);
  s.army.archer=1000;assert.match(g.dispatchCheck('north_ford','lin',{archer:1000},'occupy').reason,/采集/);
  T.onGather(s,2000);assert.equal(s.stageTasks.north_ford.gathered,3000);assert.equal(g.dispatchCheck('north_ford','lin',{archer:1000},'occupy').reason,'');
  assert.equal(g.chapterTaskDone('north_ford'),false);s.conquered.north_ford=true;assert.equal(g.chapterTaskDone('north_ford'),true);
});
test('玄石关 needs a level-5 workshop, 河洛东门 five siege engines, and 朔风骑营 40% spears',()=>{
  const {g,s,C}=ready();s.buildings.workshop=4;Object.assign(s.army,{archer:500,ram:5,spear:500});conquer(s,['camp','north_road','north_granary','north_ford','north_camp']);
  assert.match(g.dispatchCheck('north_pass','lin',{archer:500},'occupy').reason,/工匠作坊/);s.buildings.workshop=5;assert.equal(g.dispatchCheck('north_pass','lin',{archer:500},'occupy').reason,'');
  delete s.conquered.north_camp;assert.match(g.dispatchCheck('north_camp','lin',{archer:500,spear:300},'occupy').reason,/枪兵须占出征士兵 40%/);assert.equal(g.dispatchCheck('north_camp','lin',{archer:500,spear:400},'occupy').reason,'');
  for(const n of C.nodes)conquer(s,[n.id]);s.conquered.luo_outpost=true;
  assert.match(g.dispatchCheck('luo_gate','lin',{archer:500,ram:4},'occupy').reason,/5 辆/);assert.equal(g.dispatchCheck('luo_gate','lin',{archer:500,ram:5},'occupy').reason,'');
});
test('an old save keeps every stage it already reached, with no task to redo',()=>{
  const e=loadGame(),g=e.Game,old=JSON.parse(JSON.stringify(g.state));delete old.stageTasks;
  for(const id of ['field','wood','pass','mine','camp','north_road','north_granary','north_ford'])old.conquered[id]=true;old.raided.mine=true;
  g.importSave(old);const s=g.state;
  for(const id of ['field','wood','pass','mine','camp','north_road','north_granary','north_ford'])assert.equal(g.chapterTaskDone(id),true,id);
  assert.equal(g.chapterTaskDone('north_camp'),false);assert.equal(g.validSave(s),true);
});
test('a stage task view tells the player the type, the rule and the progress',()=>{
  const {g,s}=ready();s.plots[0]={type:'mine',level:3};s.stageTasks.mine={count:2};const v=g.chapterTask('mine');
  assert.equal(v.type,'冶铁搜集');assert.match(v.text,/军械残图/);assert.equal(v.progress,'2 / 3 份军械残图');assert.equal(v.done,false);
  assert.equal(g.chapterTask('north_road').deliver,false,'chapter two is not open yet');s.conquered.camp=true;assert.equal(g.chapterTask('north_road').deliver,true);
});
test('赤铁山 waits for a level-3 iron mine before any march',()=>{
  const {g,s}=ready();for(const id of ['field','wood','pass'])s.raided[id]=true;s.conquered.pass=true;s.army.archer=100;
  assert.match(g.dispatchCheck('mine','lin',{archer:100},'raid').reason,/铁矿升到 3 级/);
  s.plots[0]={type:'mine',level:3};assert.equal(g.dispatchCheck('mine','lin',{archer:100},'raid').reason,'');
});
