const {test}=require('node:test'),assert=require('node:assert/strict');
const {loadGame,city}=require('./helpers/game.cjs');
// v0.37.0: build and fight in turns — the guide sends the player to the next stage as soon as the hall reaches its
// suggested level, instead of building the hall to 10 first (design/quick-specs/pacing-rework-2026-10-19.md §1).
function ready(hall){const e=loadGame(),g=e.Game,s=g.state;city(g,{hall,house:5,drill:3,barracks:5,academy:4});for(const id of Object.keys(s.tech))s.tech[id]=3;for(const [i,type] of ['farm','lumber','quarry','mine'].entries())s.plots[i]={type,level:3};s.army.archer=400;s.army.shield=100;s.onboarding.firstBattle='complete';s.raided.field=true;s.stats.victories=1;s.res.food=1e6;while(g.onboarding.available(s).length)g.onboarding.claimAvailable();return {e,g,s};}
const model=e=>e.evaluate('GrowthGuide.model(Game)');
test('at hall 2 the guide sends the player to 青竹林 instead of the next hall level',()=>{
  const {e}=ready(2),m=model(e);assert.equal(m.phase,'campaign');assert.equal(m.id,'wood');
});
test('at hall 1 the guide still builds the hall first, because 青竹林 suggests hall 2',()=>{
  const {e}=ready(1),m=model(e);assert.equal(m.phase,'hall');
});
test('after 青竹林 the guide goes back to building until hall 3 opens 白石隘口',()=>{
  const {e,g,s}=ready(2);s.raided.wood=true;const m=model(e);assert.equal(m.phase,'hall');
  s.buildings.hall=3;s.cityLevels[s.cityLayout.indexOf('hall')]=3;while(g.onboarding.available(s).length)g.onboarding.claimAvailable();const m3=model(e);assert.equal(m3.phase,'campaign','hall 3 reached: prepare 白石隘口 (here, scouts for its precise report)');
});
test('each stage tells the player its suggested hall level',()=>{
  const {g}=ready(2);assert.equal(g.chapterTask('wood').hall,2);assert.equal(g.chapterTask('north_keep').hall,8);assert.equal(g.chapterTask('luo_citadel').hall,9);
});
test('a hall already being raised to the suggested level sends the player to the stage while it builds',()=>{
  const {e,g,s}=ready(1),site=s.cityLayout.indexOf('hall'),now=e.now();s.buildQueue=[{id:'hall',site,kind:'upgrade',level:2,paid:{},paidItems:{},start:now,end:now+3600000}];
  const m=model(e);assert.equal(m.phase,'campaign');assert.equal(m.id,'wood');assert.equal(g.validSave(s),true);
});
test('the first chapter-two stage asks for its own garrison, not the army and research the chapter finale needs',()=>{
  const {e,g,s}=ready(5);for(const id of ['field','wood','pass','mine','camp'])s.conquered[id]=true;for(const id of Object.keys(s.tech))s.tech[id]=2;s.army.archer=560;s.army.shield=200;
  while(g.onboarding.available(s).length)g.onboarding.claimAvailable();for(const m of g.missions.filter(m=>m.chapter&&g.missionReady(m)))g.claimMission(m.id);
  assert.equal(model(e).kind,'chapterDeliver');assert.equal(g.deliverChapterTask('north_road'),null);
  const step=model(e);assert.equal(step.kind,'campaign','no level-5 research and no 910 archers before 北原驿道 (got '+step.title+')');assert.equal(step.id,'north_road');
});
test('a long build wait after chapter one points at wild raids and counts the full-loot raids left',()=>{
  const fs=require('node:fs'),path=require('node:path'),{e,g,s}=ready(7),src=fs.readFileSync(path.join(__dirname,'..','onboarding-ui.js'),'utf8').split('\n'),from=src.findIndex(l=>l.startsWith('function guideRaidHint'));
  e.evaluate('var S=()=>Game.state;'+src.slice(from,src.findIndex((l,k)=>k>from&&l==='}')+1).join('\n'));
  const hint=(end,count)=>{s.raidDay=count==null?null:{period:g.progression.period(e.now()),count};return e.evaluate(`guideRaidHint(${JSON.stringify({kind:'queue',queue:{end}})},${e.now()})`);};
  assert.equal(hint(e.now()+3*3600000),null,'chapter one not done yet');
  for(const id of ['field','wood','pass','mine','camp'])s.conquered[id]=true;
  assert.equal(hint(e.now()+3600000),null,'a short wait needs no hint');
  assert.match(hint(e.now()+3*3600000).label,/全额 20 次/);assert.match(hint(e.now()+3*3600000,25).text,/全额掠夺还剩 0 次（共 35 次可用）/);assert.equal(hint(e.now()+3*3600000,60),null,'no raids left today');
});
