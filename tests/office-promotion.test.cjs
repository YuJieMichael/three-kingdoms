const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
function load(){
  const now=1791194400000,saved=new Map();
  const ctx=vm.createContext({console,Date:class extends Date{constructor(...args){super(...(args.length?args:[now]));}static now(){return now;}},localStorage:{getItem:k=>saved.get(k)||null,setItem:(k,v)=>saved.set(k,v)},document:{addEventListener(){}}});
  for(const file of ['manual-data.js','speedup-data.js','reference-rules.js','reward-data.js','progression.js','onboarding-data.js','onboarding-system.js','governance-system.js','hero-system.js','hero-identity.js','hero-bonds.js','legend-quest.js','legendary-weapons.js','heritage-data.js','heritage-system.js','npc-data.js','war-care.js','faction-system.js','npc-defense.js','chapter-data.js','siege-data.js','war-orders.js','automation-system.js','named-city-data.js','named-garrison.js','named-city-system.js','yellow-city-data.js','plot-template-data.js','city-presets.js','training-templates.js','world-targets.js','city-system.js','city-strategy.js','city-specialty.js','general-growth-data.js','general-growth-system.js','scout-system.js','regional-front.js','supply-lines.js','hero-administration.js','battle-review.js','wild-fields.js','web-edition.js','battlefield-data.js','battlefield-system.js','journey-system.js','research-routes.js','siege-preparation.js','hero-traits.js','engine.js','city-presets-ui.js','training-templates-ui.js','world-targets-ui.js','faction-ui.js','battlefield-ui.js'])vm.runInContext(fs.readFileSync(path.join(__dirname,'..',file),'utf8'),ctx,{filename:file});
  const Game=vm.runInContext('Game',ctx),Heritage=vm.runInContext('HeritageSystem',ctx),data=vm.runInContext('HeritageData',ctx);Game.init();
  // v0.34.9: county-gated offices need a county that is conquered and held as an owned city (the record engine.js creates on a real capture).
  const ownCounty=()=>vm.runInContext("Game.state.conquered.fort=true;Game.state.realm.cities[CitySystem.idFor('fort')]=CitySystem.empty(Game.state,Game.getNode('fort'),Date.now());",ctx);
  return {Game,Heritage,data,ownCounty};
}
// v0.35.1: ranks no longer take jewels (design/quick-specs/progression-rework-2026-10-18.md §4); offices wait on prestige, gold and noble rank.
test('prestige alone cannot promote: rejection leaves office, gold and jewels unchanged',()=>{
  const {Game,Heritage}=load(),s=Game.state;s.prestige=10000000;
  const before=JSON.stringify([s.honors,s.res,s.jewels]);
  assert.match(Heritage.promotionQuote(s,'office').reason,/爵位 公士/);
  assert.match(Heritage.promote('office'),/爵位 公士/);
  assert.equal(JSON.stringify([s.honors,s.res,s.jewels]),before);
});
test('successful promotion spends no jewels, retains prestige and blocks the next rank by noble rank',()=>{
  const {Game,Heritage}=load(),s=Game.state;s.prestige=2000;s.honors.noble=1;
  assert.equal(Heritage.promote('office'),null);assert.equal(s.honors.office,1);assert.equal(s.jewels.pearl,0);assert.equal(s.prestige,2000);
  assert.match(Heritage.promote('office'),/爵位 上造/);assert.equal(s.honors.office,1);
  Game.init();assert.equal(Game.state.honors.office,1);
});
test('jewels alone do not replace the existing prestige requirement',()=>{
  const {Game,Heritage}=load(),s=Game.state;s.prestige=999;s.jewels.pearl=100;
  assert.match(Heritage.promote('office'),/声望/);assert.equal(s.jewels.pearl,100);assert.equal(s.honors.office,0);
});
test('every office rank promotes without jewels and charges only its gold',()=>{
  const {Game,Heritage,data,ownCounty}=load(),s=Game.state;s.prestige=10000000;s.buildings.hall=10;s.cityLevels[14]=10;ownCounty();s.res.gold=10000000;
  for(const next of data.offices.slice(1)){
    s.honors.office=next.id-1;s.honors.noble=next.promotion.noble;for(const id of Object.keys(s.jewels))s.jewels[id]=0;
    const gold=s.res.gold;assert.equal(Heritage.promote('office'),null,next.name);assert.equal(s.honors.office,next.id);assert.equal(s.res.gold,gold-next.promotion.gold);
    assert.ok(Object.values(s.jewels).every(n=>n===0),next.name);
  }
});
test('confirmation rechecks gold after a successful quote and does not charge partial fees',()=>{
  const {Game,Heritage,ownCounty}=load(),s=Game.state;s.honors.office=12;s.honors.noble=20;s.prestige=2000000;s.buildings.hall=10;s.cityLevels[14]=10;ownCounty();s.res.gold=300000;s.jewels.jade=5;
  assert.equal(Heritage.promotionQuote(s,'office').reason,'');s.res.gold=199999;
  assert.match(Heritage.promote('office'),/黄金/);assert.equal(s.res.gold,199999);assert.equal(s.jewels.jade,5);assert.equal(s.honors.office,12);
});
test('legacy office and daily salary claims persist; noble promotion keeps prestige and gold but takes chapter one instead of jewels',()=>{
  const {Game,Heritage,data}=load(),s=Game.state;s.honors.office=7;s.honors.salaryClaims.office=0;
  Heritage.salary('office');const claimed=s.honors.salaryClaims.office;Game.save();Game.init();assert.equal(Game.state.honors.office,7);assert.equal(Game.state.honors.salaryClaims.office,claimed);
  assert.equal(Heritage.salaryQuote(Game.state,'office').claimed,true);
  const rule=data.nobles[1].promotion;assert.equal(rule.prestige,1000);assert.equal(rule.office,0);assert.equal(rule.gold,20000);assert.equal(rule.jewels.pearl,10);assert.equal(rule.jewels.coral,5);
  Game.state.prestige=1000;Game.state.res.gold=30000;
  assert.match(Heritage.promote('noble'),/第一章通关/);Game.state.conquered.camp=true;assert.equal(Heritage.promote('noble'),null);assert.equal(Game.state.honors.noble,1);assert.equal(Game.state.jewels.pearl,0);assert.equal(Game.state.res.gold,10000);
});
