const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {loadGame,city,battle}=require('./helpers/game.cjs');

// The prepared city, food, army and earlier ownership below are explicit
// checkpoints, not proof of fresh-game affordability. Final-stage raid and
// occupation victories, scouting, rewards and import/reload use public APIs.
function setup(seed=123){
 const e=loadGame(seed),g=e.Game;
 city(g,{hall:4,house:10,drill:10,barracks:10});
 g.state.conquered.fort=true;g.state.res.food=10000000;
 Object.assign(g.state.army,{shield:600,spear:800,archer:2200,cavalry:400,scout:1});
 return e;
}
function own(e,nodes=e.Chapter.nodes){for(const node of nodes)e.Game.state.conquered[node.id]=true;}
function clone(value){return JSON.parse(JSON.stringify(value));}
function assertThirdLocked(e){
 const g=e.Game,c=e.Chapter,expeditions=clone(g.allExpeditions());
 assert.equal(c.completed(g.state,2),false);assert.equal(c.unlocked(g.state,3),false);
 assert.equal(c.progress(g.state,3).unlocked,false);
 for(const node of c.chapterThreeNodes){
  assert.ok(c.blocked(g.state,node.id));
  for(const mode of ['raid','occupy']){
   assert.equal(g.attackBlocked(node.id,mode),c.blocked(g.state,node.id));
   assert.equal(g.dispatch(node.id,'lin',{archer:100},mode),c.blocked(g.state,node.id));
  }
 }
 assert.deepEqual(clone(g.allExpeditions()),expeditions,'a blocked third-chapter dispatch must not create or replace an army');
}

test('fresh games keep chapter two and three locked until their respective campaigns finish',()=>{
 const e=loadGame(),g=e.Game,c=e.Chapter;
 assert.equal(c.completed(g.state,2),false);assert.equal(c.unlocked(g.state,2),false);
 assert.equal(c.progress(g.state,2).unlocked,false);assertThirdLocked(e);
 g.state.conquered.fort=true;
 assert.equal(c.unlocked(g.state,2),true);assert.equal(c.progress(g.state,2).unlocked,true);
 assert.equal(g.attackBlocked('north_road','occupy'),null);assertThirdLocked(e);
});

test('five occupied chapter-two stages keep all third-chapter dispatches locked without taking troops or food',()=>{
 const e=setup(),g=e.Game;own(e,e.Chapter.nodes.slice(0,-1));
 const before={army:clone(g.state.army),food:g.state.res.food};
 assert.equal(e.Chapter.progress(g.state,2).conquered,5);assertThirdLocked(e);
 assert.deepEqual(clone(g.state.army),before.army);assert.equal(g.state.res.food,before.food);
 assert.equal(g.claimMission('chapter3_luo_outpost'),'目标尚未达成');
 assert.equal(g.validSave(g.state),true);
});

test('a final-stage ownership flag cannot bypass any missing earlier chapter-two occupation',()=>{
 for(const missing of loadGame().Chapter.nodes.slice(0,-1)){
  const e=setup();own(e);delete e.Game.state.conquered[missing.id];
  assert.equal(e.Game.state.conquered.north_keep,true);assertThirdLocked(e);
  assert.equal(e.Chapter.progress(e.Game.state,2).conquered,5);
 }
 const e=setup();e.Game.state.conquered.north_keep=true;assertThirdLocked(e);
 assert.equal(e.Chapter.progress(e.Game.state,2).conquered,1);
});

test('winning a normal raid on the last stage does not finish chapter two or unlock chapter three',()=>{
 const e=setup(),g=e.Game;own(e,e.Chapter.nodes.slice(0,-1));
 const result=battle(e,'north_keep','raid',{shield:600,spear:800,archer:2200,cavalry:400});
 assert.equal(result.won,true);assert.equal(g.state.raided.north_keep,true);
 assert.equal(g.state.conquered.north_keep,undefined);assert.equal(g.state.stats.victories,1);
 assertThirdLocked(e);assert.equal(g.claimMission('chapter2_north_keep'),'目标尚未达成');
 assert.equal(g.validSave(g.state),true);g.save();g.init();assertThirdLocked(e);
});

test('the normal final occupation unlocks chapter three immediately before any chapter reward is claimed',()=>{
 const e=setup(),g=e.Game,c=e.Chapter;own(e,c.nodes.slice(0,-1));
 assertThirdLocked(e);
 const result=battle(e,'north_keep','occupy',{shield:600,spear:800,archer:2200,cavalry:400});
 assert.equal(result.won,true);assert.equal(g.state.conquered.north_keep,true);
 assert.equal(c.completed(g.state,2),true);assert.equal(c.progress(g.state,2).conquered,6);
 assert.equal(c.unlocked(g.state,3),true);assert.equal(c.progress(g.state,3).unlocked,true);
 assert.equal(c.progress(g.state,2).claimed,0);assert.equal(c.progress(g.state,3).claimed,0);
 assert.equal(g.attackBlocked('luo_outpost','occupy'),null);
 assert.equal(g.attackBlocked('luo_outpost','raid'),null);
 assert.equal(g.missionReady(g.missions.find(m=>m.id==='chapter2_north_keep')),true);
 assert.equal(g.validSave(g.state),true);g.save();g.init();
 assert.equal(c.unlocked(g.state,3),true);assert.equal(c.progress(g.state,2).claimed,0);
});

test('reward collection remains optional for chapter unlock while chapter three retains its own stage sequence',()=>{
 const e=setup(),g=e.Game,c=e.Chapter;own(e);
 assert.equal(c.unlocked(g.state,3),true);
 assert.equal(g.claimMission('chapter2_north_road'),null);
 assert.equal(c.progress(g.state,2).claimed,1);assert.equal(c.unlocked(g.state,3),true);
 assert.equal(g.attackBlocked('luo_outpost','occupy'),null);
 assert.match(g.attackBlocked('luo_gate','occupy'),/洛水前哨/);
 assert.match(g.attackBlocked('luo_cavalry','occupy'),/河洛东门/);
 g.state.conquered.luo_outpost=true;
 assert.equal(g.attackBlocked('luo_gate','occupy'),null);
 assert.match(g.attackBlocked('luo_cavalry','occupy'),/河洛东门/);
 assert.equal(g.missionReady(g.missions.find(m=>m.id==='chapter3_luo_outpost')),true);
 assert.equal(c.completed(g.state,3),false);
 own(e,c.chapterThreeNodes);assert.equal(c.completed(g.state,3),true);
 assert.equal(g.validSave(g.state),true);
});

test('locked third-chapter scouting does not spend food or record intel, then normal scouting resumes after unlock',()=>{
 const e=setup(),g=e.Game;own(e,e.Chapter.nodes.slice(0,-1));
 // Prepared scouting technology isolates the campaign gate from counter-scout
 // risk. Successful intelligence now requires an actual outward journey.
 g.state.tech.scouting=8;
 const food=g.state.res.food,scouts=g.state.army.scout,metrics=clone(g.state.activityMetrics);
 for(const node of e.Chapter.chapterThreeNodes){
  assert.equal(g.scoutQuote(node.id,1).reason,e.Chapter.blocked(g.state,node.id));
  assert.equal(g.scout(node.id),e.Chapter.blocked(g.state,node.id));
  assert.equal(g.state.scouted[node.id],undefined);
  assert.equal(g.state.scoutIntel[node.id],undefined);
 }
 assert.equal(g.state.res.food,food);assert.equal(g.state.army.scout,scouts);
 assert.equal(g.state.scoutQueue.length,0);assert.deepEqual(clone(g.state.activityMetrics),metrics);
 g.state.conquered.north_keep=true;

 function scoutAndReturn(node){
  const before=JSON.stringify(g.state),quote=g.scoutQuote(node,1),departureFood=g.state.res.food;
  assert.equal(JSON.stringify(g.state),before,'a scout quote must remain readonly');
  assert.equal(quote.reason,'');assert.equal(quote.success,true);
  assert.ok(quote.cost.food>10,'the quote includes distance supply, not the old flat ten food');
  assert.equal(g.scout(node,1,quote.key),null);
  assert.equal(g.state.res.food,departureFood-quote.cost.food);
  assert.equal(g.state.army.scout,scouts-1);assert.equal(g.state.scouted[node],undefined);
  assert.equal(g.state.scoutIntel[node],undefined);assert.equal(g.intel(node),null);
  const mission=g.state.scoutQueue.find(m=>m.node===node);
  assert.equal(mission.phase,'out');assert.equal(mission.end,mission.start+quote.seconds*1000);
  assert.equal(g.validSave(g.state),true);
  e.advance(mission.end-e.now()-1);
  assert.equal(mission.phase,'out');assert.equal(g.intel(node),null);
  e.advance(1);
  assert.equal(mission.phase,'return');assert.ok(g.state.scoutIntel[node]);
  assert.equal(g.intel(node).precision,quote.precision);
  assert.equal(g.state.army.scout,scouts-1,'outward arrival does not return the scout yet');
  assert.equal(g.validSave(g.state),true);
  e.advance(mission.end-e.now());
  assert.equal(g.state.scoutQueue.length,0);
  assert.equal(g.state.army.scout,scouts-quote.expectedLost);
  assert.equal(g.validSave(g.state),true);
 }

 scoutAndReturn('luo_outpost');
 // The chapter gate opens the route, but later stations remain hidden until
 // the preceding occupation; dispatching to a hidden station stays atomic.
 assert.ok(g.attackBlocked('luo_gate','occupy'));
 const hiddenBefore=JSON.stringify(g.state);
 assert.equal(g.scoutQuote('luo_gate',1).reason,'此任务据点尚未开启');
 assert.equal(g.scout('luo_gate'),'此任务据点尚未开启');
 assert.equal(JSON.stringify(g.state),hiddenBefore);
 g.state.conquered.luo_outpost=true;
 scoutAndReturn('luo_gate');
});

test('importing an older progressed save preserves rewards, ownership, reports and army while applying the full campaign gate',()=>{
 const e=setup(),g=e.Game,c=e.Chapter;
 own(e);g.state.conquered.luo_outpost=true;
 assert.equal(g.claimMission('chapter2_north_keep'),null);
 assert.equal(g.claimMission('chapter3_luo_outpost'),null);
 const old=clone(g.state);delete old.conquered.north_granary;
 const expected={army:clone(old.army),claims:[...old.missionClaims],jewels:clone(old.jewels),inventory:clone(old.inventory),res:clone(old.res),reports:clone(old.reports),conquered:clone(old.conquered)};
 assert.equal(g.validSave(old),true);g.importSave(old);
 assertThirdLocked(e);assert.equal(c.progress(g.state,3).conquered,1);
 assert.deepEqual(clone(g.state.army),expected.army);assert.deepEqual(clone(g.state.missionClaims),expected.claims);
 assert.deepEqual(clone(g.state.jewels),expected.jewels);assert.deepEqual(clone(g.state.inventory),expected.inventory);
 assert.deepEqual(clone(g.state.res),expected.res);assert.deepEqual(clone(g.state.reports),expected.reports);
 assert.deepEqual(clone(g.state.conquered),expected.conquered);
 g.state.conquered.north_granary=true;
 assert.equal(c.unlocked(g.state,3),true);assert.equal(g.attackBlocked('luo_gate','occupy'),null);
 assert.equal(g.claimMission('chapter3_luo_outpost'),'该任务奖励已领取');
 assert.equal(g.state.army.ram,5);assert.equal(g.validSave(g.state),true);
});

function uiStubs(e){
 e.evaluate(`
  globalThis.S=()=>Game.state;
  globalThis.uiButtons=[];globalThis.uiShows=[];globalThis.uiToasts=[];
  globalThis.uiRenders=0;globalThis.uiCloses=0;
  globalThis.page='city';globalThis.selectedNode=null;
  globalThis.num=number=>String(number);
  globalThis.btn=(label,action,id='',classes='',disabled=false)=>{
   uiButtons.push({label,action,id,disabled});
   return '<button data-action="'+action+'" data-id="'+id+'"'+(disabled?' disabled':'')+'>'+label+'</button>';
  };
  globalThis.showModal=(title,body,footer)=>uiShows.push({title,body,footer});
  globalThis.toast=message=>uiToasts.push(message);
  globalThis.render=()=>uiRenders++;
  globalThis.modal={close:()=>uiCloses++};
  globalThis.taskTabs=()=>'';globalThis.taskTab='chapter';globalThis.manualModalContext=null;
  globalThis.classicMissionModal=()=>{};
  globalThis.lootHtml=()=>'';globalThis.heritageJewelHTML=()=>'';globalThis.missionItemHTML=()=>'';
  globalThis.troopPortrait=()=>'';
 `);
}
function clickChapter(e,action,id,disabled=false){e.evaluate(`chapterClick({target:{closest(){return {disabled:${disabled},dataset:{action:${JSON.stringify(action)},id:${JSON.stringify(id)}}};}}});`);}

test('chapter modal hides third-stage cards and rejects stale chapter buttons until the second campaign is complete',()=>{
 const e=setup(),g=e.Game;own(e,e.Chapter.nodes.slice(0,-1));uiStubs(e);
 e.evaluate(`globalThis.worldView={...Game.home};document.addEventListener=(type,handler)=>{if(type==='click')globalThis.chapterClick=handler;};`);
 e.evaluate(fs.readFileSync(path.join(__dirname,'..','chapter-ui.js'),'utf8'));
 e.evaluate('chapterMissionModal()');
 let shown=clone(e.evaluate('uiShows.at(-1)')),buttons=clone(e.evaluate('uiButtons'));
 assert.match(shown.title,/第二章/);assert.match(shown.body,/已平定 5 \/ 6/);
 for(const node of e.Chapter.chapterThreeNodes)assert.ok(!shown.body.includes(node.name));
 assert.equal(buttons.find(button=>button.action==='chapterSelect'&&button.id==='3').disabled,true);
 const stateBefore=JSON.stringify(g.state);
 clickChapter(e,'chapterSelect','3');
 assert.equal(e.evaluate('selectedChapter'),2);assert.equal(e.evaluate('uiShows.length'),1);
 assert.match(e.evaluate('uiToasts.at(-1)'),/第二章/);
 clickChapter(e,'chapterGo','luo_outpost');
 assert.equal(e.evaluate('page'),'city');assert.equal(e.evaluate('selectedNode'),null);
 assert.equal(e.evaluate('uiRenders'),0);assert.equal(e.evaluate('uiCloses'),0);
 // A stale chapter selection from a previous save must fall back safely too.
 e.evaluate('selectedChapter=3;chapterMissionModal()');
 assert.equal(e.evaluate('selectedChapter'),2);assert.match(e.evaluate('uiShows.at(-1).title'),/第二章/);
 assert.equal(JSON.stringify(g.state),stateBefore);
 g.state.conquered.north_keep=true;
 e.evaluate('uiButtons=[];chapterMissionModal()');
 assert.equal(e.evaluate("uiButtons.find(button=>button.action==='chapterSelect'&&button.id==='3').disabled"),false);
 e.evaluate('uiButtons=[]');clickChapter(e,'chapterSelect','3');shown=clone(e.evaluate('uiShows.at(-1)'));
 assert.equal(e.evaluate('selectedChapter'),3);assert.match(shown.title,/第三章/);
 assert.ok(shown.body.includes(e.Chapter.chapterThreeNodes[0].name));
 for(const node of e.Chapter.chapterThreeNodes.slice(1))assert.ok(!shown.body.includes(node.name));
 assert.deepEqual(clone(e.evaluate("uiButtons.filter(button=>button.action==='chapterGo').map(button=>button.id)")),['luo_outpost']);
 assert.equal(g.state.missionClaims.length,0);
 // Opening the chapter reveals its current station, not a stale future-stage button.
 assert.ok(g.attackBlocked('luo_gate','occupy'));
 const unopened=JSON.stringify(g.state);
 clickChapter(e,'chapterGo','luo_gate');
 assert.equal(e.evaluate('page'),'city');assert.equal(e.evaluate('selectedNode'),null);
 assert.equal(e.evaluate('uiRenders'),0);assert.equal(e.evaluate('uiCloses'),0);
 assert.match(e.evaluate('uiToasts.at(-1)'),/当前任务据点/);
 assert.equal(JSON.stringify(g.state),unopened);
 // Prepared ownership checkpoints isolate progressive UI visibility from combat balance.
 g.state.conquered.luo_outpost=true;e.evaluate('uiButtons=[];chapterMissionModal()');
 assert.deepEqual(clone(e.evaluate("uiButtons.filter(button=>button.action==='chapterGo').map(button=>button.id)")),['luo_outpost','luo_gate']);
 clickChapter(e,'chapterGo','luo_gate');
 assert.equal(e.evaluate('page'),'world');assert.equal(e.evaluate('selectedNode'),'luo_gate');
 assert.deepEqual(clone(e.evaluate('worldView')),{x:46,y:12});
 assert.equal(e.evaluate('uiRenders'),1);assert.equal(e.evaluate('uiCloses'),1);
 for(let i=1;i<e.Chapter.chapterThreeNodes.length;i++){
  g.state.conquered[e.Chapter.chapterThreeNodes[i].id]=true;
  e.evaluate('uiButtons=[];chapterMissionModal()');
  assert.deepEqual(clone(e.evaluate("uiButtons.filter(button=>button.action==='chapterGo').map(button=>button.id)")),clone(e.Chapter.chapterThreeNodes.slice(0,i+2).map(node=>node.id)));
 }
 assert.equal(g.state.missionClaims.length,0,'revealing stations does not claim their rewards');
});

test('world shortcuts reveal only explored and current stations while chapter unlock protects scouting',()=>{
 const e=setup(),g=e.Game;own(e,e.Chapter.nodes.slice(0,-1));uiStubs(e);
 e.evaluate(`
  globalThis.selectedNode='field';
  globalThis.window={matchMedia:()=>({matches:false})};
  globalThis.terrainIcon=()=>'';
  globalThis.epicWorldBanner=()=>'';globalThis.chapterWorldBanner=()=>'';
  globalThis.expeditionStrip=()=>'';globalThis.classicTargetActions=()=>'';
  globalThis.Audio=class{};document.body={classList:{contains:()=>false}};
 `);
 // Use the real helpers and UI dependencies loaded before app.js first renders index.html.
 e.evaluate(fs.readFileSync(path.join(__dirname,'..','app.js'),'utf8').split('\n').find(line=>line.startsWith('const esc=')));
 e.evaluate(fs.readFileSync(path.join(__dirname,'..','art-assets.js'),'utf8'));
 e.evaluate(fs.readFileSync(path.join(__dirname,'..','city-ui.js'),'utf8'));
 e.evaluate(fs.readFileSync(path.join(__dirname,'..','named-city-ui.js'),'utf8'));
 e.evaluate(fs.readFileSync(path.join(__dirname,'..','grid-world.js'),'utf8'));
 e.evaluate(fs.readFileSync(path.join(__dirname,'..','manual-ui.js'),'utf8'));
 e.evaluate(fs.readFileSync(path.join(__dirname,'..','wild-general-ui.js'),'utf8'));
 for(const file of ['web-edition-ui.js','scene-ui.js','ink-map.js','layout-ui.js'])e.evaluate(fs.readFileSync(path.join(__dirname,'..',file),'utf8'));
 let html=e.evaluate('worldPage()');
 for(const node of e.Chapter.chapterThreeNodes){
  assert.ok(!html.includes('data-action="mapLandmark" data-id="'+node.id+'"'));
  assert.equal(g.getWorldTile(node.x,node.y).id,node.id,'locked landmarks remain addressable for a lock explanation');
 }
 e.evaluate("uiButtons=[];enemyIntelHTML(Game.getNode('luo_outpost'))");
 assert.equal(e.evaluate("uiButtons.find(button=>button.action==='scoutPlan').disabled"),true);
 assert.equal(e.evaluate("uiButtons.find(button=>button.action==='scoutPlan').label"),'第三章尚未开启');
 const before=JSON.stringify(g.state);
 e.evaluate('worldPage()');assert.equal(JSON.stringify(g.state),before);
 g.state.conquered.north_keep=true;
 html=e.evaluate('worldPage()');
 for(const [i,node] of e.Chapter.chapterThreeNodes.entries())assert.equal(html.includes('data-action="mapLandmark" data-id="'+node.id+'"'),i===0);
 e.evaluate("uiButtons=[];enemyIntelHTML(Game.getNode('luo_outpost'))");
 assert.equal(e.evaluate("uiButtons.find(button=>button.action==='scoutPlan').disabled"),false);
 assert.equal(e.evaluate("uiButtons.find(button=>button.action==='scoutPlan').label"),'派斥候侦察');
 for(let i=0;i<e.Chapter.chapterThreeNodes.length;i++){
  g.state.conquered[e.Chapter.chapterThreeNodes[i].id]=true;
  html=e.evaluate('worldPage()');
  for(const [j,node] of e.Chapter.chapterThreeNodes.entries())assert.equal(html.includes('data-action="mapLandmark" data-id="'+node.id+'"'),j<=i+1);
 }
});
