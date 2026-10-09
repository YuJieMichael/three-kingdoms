const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const {loadGame,city}=require('./helpers/game.cjs');
const {run}=require('./balance/archer-onboarding.cjs');
const copy=x=>JSON.parse(JSON.stringify(x));
function earnedHall(){const r=run(123,true,'ten-gifts',{includeState:true}),e=loadGame(123);e.advance(r.state.last-e.now());e.Game.importSave(r.state);return e;}
function ledger(r){const e=loadGame(),g=e.Game,initial=copy(g.state.res),gifts=e.evaluate('OnboardingData.gifts');const supplies=Object.fromEntries(Object.keys(initial).map(id=>[id,0])),missions={...supplies};for(const level of r.state.onboarding.claims)for(const [id,n]of Object.entries(gifts.find(x=>x.level===level).resources))supplies[id]+=n;for(const id of r.state.missionClaims)for(const [key,n]of Object.entries(g.missions.find(m=>m.id===id).reward))missions[key]+=n;return {supplies,missions,natural:Object.fromEntries(Object.keys(initial).map(id=>[id,r.stock[id]-initial[id]-supplies[id]-missions[id]+r.spent[id]]))};}
function inspect(e){const before=JSON.stringify(e.Game.state),m=e.evaluate('GrowthGuide.model(Game)');e.evaluate('GrowthGuide.key(Game)');assert.equal(JSON.stringify(e.Game.state),before);return m;}

test('opening mission income leaves useful gold reserves without the old three-quarter-million stockpile',()=>{
 const r=run(123,true,'archer',{includeState:true}),l=ledger(r);
 assert.equal(r.archers,30);assert.ok(r.minutes<90);assert.equal(l.supplies.gold,30000);
 assert.ok(l.missions.gold>=90000&&l.missions.gold<=150000);
 assert.ok(r.stock.gold>=50000&&r.stock.gold<=150000);
 // With hall 2 at 8 minutes and free finishes the route takes minutes, so natural output is near zero but never negative.
 assert.ok(l.natural.iron>=0);assert.equal(r.validSave,true);
});

test('real resource fields contribute to the unaccelerated opening while reward overcapacity remains supported',()=>{
 const r=run(123,false,'archer',{includeState:true}),l=ledger(r);
 assert.ok(l.natural.wood>1000);assert.ok(l.natural.iron>500);
 assert.ok(r.stock.food>10000);assert.ok(r.stock.stone>30000);
 assert.equal(r.validSave,true);
});

test('all ten gifts remain funded by normal APIs in the one-to-two-day route across twelve seeds',()=>{
 for(const seed of [1,2,3,4,5,6,7,8,18,123,456,9876]){
  const r=run(seed,true,'ten-gifts',{includeState:true}),l=ledger(r);
  assert.equal(r.hall,10);assert.equal(r.gifts,10);assert.equal(r.firstBattle,'complete');
  assert.ok(r.minutes/60>=24&&r.minutes/60<=48,seed+': '+r.minutes/60);
  assert.equal(l.supplies.gold,1000000);assert.ok(r.stock.gold>100000&&r.stock.gold<750000);
  assert.equal(r.validSave,true);
 }
});

test('rebalanced task claims are still one-time and saved stocks are not clawed back on reload',()=>{
 const e=earnedHall(),g=e.Game;g.save();const before=JSON.stringify([g.state.res,g.state.missionClaims,g.state.inventory]);
 g.init();assert.equal(JSON.stringify([g.state.res,g.state.missionClaims,g.state.inventory]),before);
 assert.match(g.claimMission('hall_8'),/已领取/);assert.match(g.claimMission('hall_10'),/已领取/);
 assert.equal(JSON.stringify([g.state.res,g.state.missionClaims,g.state.inventory]),before);
});

test('governor advice is optional, read-only and matches new work while preserving existing queue completion',()=>{
 const e=earnedHall(),g=e.Game,before=JSON.stringify(g.state),a=e.evaluate('GrowthGuide.governorAdvice(Game)');
 assert.equal(a.points,15);assert.equal(a.nextPol,93);assert.ok(a.reduction>7&&a.reduction<8);assert.equal(JSON.stringify(g.state),before);
 const site=g.primarySite('house');assert.equal(g.queueBuilding(site,'house'),null);const end=g.state.buildQueue[0].end,seconds=g.buildSeconds('house',3);
 assert.equal(e.evaluate("HeroSystem.allocate('su',{atk:0,def:0,pol:15,wis:0,lead:0})"),null);
 assert.ok(Math.abs((1-g.buildSeconds('house',3)/seconds)*100-a.reduction)<1e-9);
 assert.equal(g.state.buildQueue[0].end,end);assert.equal(e.evaluate('GrowthGuide.governorAdvice(Game)'),null);
 assert.equal(inspect(e).phase,'campaign');
});

test('governor advice accounts for an active politics modifier rather than promising the wrong percentage',()=>{
 const e=earnedHall(),g=e.Game;g.state.buffs.politics={effect:'politics',general:'su',end:e.now()+3600000};
 const a=e.evaluate('GrowthGuide.governorAdvice(Game)'),seconds=g.buildSeconds('house',3);
 assert.equal(a.nextPol,116.25);assert.equal(e.evaluate("HeroSystem.allocate('su',{atk:0,def:0,pol:15,wis:0,lead:0})"),null);
 assert.ok(Math.abs((1-g.buildSeconds('house',3)/seconds)*100-a.reduction)<1e-9);
});

// These following checkpoints only exercise the read-only planner's choices.
// They do not establish economic affordability or normal campaign clear times.
function prepared(e){const g=e.Game;for(const id of Object.keys(g.state.tech))g.state.tech[id]=10;city(g,{house:10,barracks:10,academy:10,smith:10});g.state.army.archer=1200;g.state.army.shield=400;g.state.army.ram=5;return g;}
test('ten-hall guidance follows discovered sites, then explicit epic prerequisites, without re-running the first battle',()=>{
 const e=earnedHall(),g=prepared(e);let m=inspect(e);assert.equal(m.kind,'campaign');assert.equal(m.id,'wood');assert.equal(m.phase,'campaign');
 g.state.conquered.camp=true;m=inspect(e);assert.equal(m.kind,'epic');assert.equal(m.id,'kills');assert.match(m.reason,/四项史诗/);
 g.state.epic.kills=1500;m=inspect(e);assert.equal(m.id,'resources');assert.ok(m.shortages.every(x=>x.amount===0));
 g.state.epic.legacyAccess=true;m=inspect(e);assert.equal(m.kind,'campaign');assert.equal(m.id,'mine');
});

test('campaign preparation exposes actual research, population and army shortages instead of generic completion text',()=>{
 const e=earnedHall(),g=e.Game;let m=inspect(e);assert.equal(m.phase,'campaign');assert.equal(m.kind,'tech');assert.equal(m.id,'combat');
 g.state.tech.combat=2;g.state.tech.shooting=2;m=inspect(e);assert.equal(m.id,'archer');assert.equal(m.kind,'train');assert.equal(m.count,30);
 g.state.population=0;m=inspect(e);assert.equal(m.kind,'population');assert.ok(m.people>0);
});

test('chapter guidance preserves second-chapter gates, claims ally rewards and opens military orders after chapters',()=>{
 const e=earnedHall(),g=prepared(e),c=e.Chapter;g.state.epic.legacyAccess=true;g.state.conquered.camp=true;g.state.conquered.fort=true;
 let m=inspect(e);assert.equal(m.id,'north_road');assert.equal(m.chapter,2);
 for(const n of c.nodes)g.state.conquered[n.id]=true;
 m=inspect(e);assert.equal(m.kind,'campaignReward');assert.equal(m.id,'chapter2_north_road');
 g.state.missionClaims.push(...c.nodes.map(n=>'chapter2_'+n.id));m=inspect(e);assert.equal(m.id,'luo_outpost');assert.equal(m.chapter,3);
 g.state.conquered.luo_outpost=true;m=inspect(e);assert.equal(m.kind,'campaignReward');assert.equal(m.id,'chapter3_luo_outpost');
 g.state.missionClaims.push('chapter3_luo_outpost');m=inspect(e);assert.equal(m.id,'luo_gate');
 for(const n of c.chapterThreeNodes)g.state.conquered[n.id]=true;
 g.state.missionClaims.push(...c.chapterThreeNodes.slice(1).map(n=>'chapter3_'+n.id));m=inspect(e);assert.equal(m.kind,'orders');assert.equal(m.id,'order_field_1');
 g.state.warOrders.cleared={field:10,siege:10,elite:10};m=inspect(e);assert.equal(m.id,'order_challenge_field_5_preserve');
 for(const q of g.warOrders.challenges)g.state.warOrders.challenges.completed[q.id]=true;m=inspect(e);assert.equal(m.id,'repeat');
});

test('growth UI keeps governor training optional and campaign buttons open the concrete existing screens',()=>{
 const e=earnedHall(),g=prepared(e);
 e.evaluate(`function S(){return Game.state;}function esc(x){return String(x);}function num(x){return String(x);}function duration(x){return String(x);}function btn(label,action,id){return '<button data-action="'+action+'" data-id="'+id+'">'+label+'</button>';}let page='',selectedNode='',selectedChapter=2,taskTab='',opened='',worldView={x:0,y:0};function render(){}function worldNodeModal(id){opened='node:'+id;}function classicMissionModal(){opened='tasks:'+taskTab;}function chapterMissionModal(){opened='chapter:'+selectedChapter;}function actResult(error){return !error;}`);
 e.evaluate(fs.readFileSync(path.join(__dirname,'../onboarding-ui.js'),'utf8'));
 let html=e.evaluate('growthGuideHTML()');assert.match(html,/战役成长/);assert.match(html,/培养城守 · 15 点/);assert.match(html,/data-action="heroDetail"/);assert.match(html,/已开工队列不重算/);
 const before=JSON.stringify(g.state);e.evaluate('guideGo()');assert.equal(e.evaluate('opened'),'node:wood');assert.equal(e.evaluate('worldView.x'),g.getNode('wood').x);assert.equal(JSON.stringify(g.state),before);
 g.state.conquered.camp=true;e.evaluate('guideGo()');assert.equal(e.evaluate('opened'),'tasks:epic');
 g.state.conquered.fort=true;for(const n of e.Chapter.allNodes())g.state.conquered[n.id]=true;g.state.missionClaims.push(...e.Chapter.allNodes().map(n=>'chapter'+n.chapter+'_'+n.id));e.evaluate('guideGo()');assert.equal(e.evaluate('opened'),'tasks:orders');
});
