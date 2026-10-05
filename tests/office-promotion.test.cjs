const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
function load(){
  const now=1791194400000,saved=new Map();
  const ctx=vm.createContext({console,Date:class extends Date{constructor(...args){super(...(args.length?args:[now]));}static now(){return now;}},localStorage:{getItem:k=>saved.get(k)||null,setItem:(k,v)=>saved.set(k,v)},document:{addEventListener(){}}});
  for(const file of ['manual-data.js','speedup-data.js','reference-rules.js','reward-data.js','progression.js','hero-system.js','heritage-data.js','heritage-system.js','npc-data.js','npc-defense.js','engine.js'])vm.runInContext(fs.readFileSync(path.join(__dirname,'..',file),'utf8'),ctx,{filename:file});
  const Game=vm.runInContext('Game',ctx),Heritage=vm.runInContext('HeritageSystem',ctx),data=vm.runInContext('HeritageData',ctx);Game.init();return {Game,Heritage,data};
}
test('prestige alone cannot promote: rejection leaves office, gold and jewels unchanged',()=>{
  const {Game,Heritage}=load(),s=Game.state;s.prestige=10000000;
  const before=JSON.stringify([s.honors,s.res,s.jewels]);
  assert.match(Heritage.promotionQuote(s,'office').reason,/珍珠/);
  assert.match(Heritage.promote('office'),/珍珠/);
  assert.equal(JSON.stringify([s.honors,s.res,s.jewels]),before);
});
test('successful promotion consumes pearl once, retains prestige and blocks next rank without jewels',()=>{
  const {Game,Heritage}=load(),s=Game.state;s.prestige=2000;s.jewels.pearl=1;
  assert.equal(Heritage.promote('office'),null);assert.equal(s.honors.office,1);assert.equal(s.jewels.pearl,0);assert.equal(s.prestige,2000);
  assert.match(Heritage.promote('office'),/珍珠/);assert.equal(s.honors.office,1);
  Game.init();assert.equal(Game.state.honors.office,1);assert.equal(Game.state.jewels.pearl,0);
});
test('jewels alone do not replace the existing prestige requirement',()=>{
  const {Game,Heritage}=load(),s=Game.state;s.prestige=999;s.jewels.pearl=100;
  assert.match(Heritage.promote('office'),/声望/);assert.equal(s.jewels.pearl,100);assert.equal(s.honors.office,0);
});
test('every office rank blocks missing jewels and consumes all configured costs on success',()=>{
  const {Game,Heritage,data}=load(),s=Game.state;s.prestige=10000000;s.buildings.hall=10;s.cityLevels[14]=10;s.conquered.fort=true;s.res.gold=10000000;
  for(const next of data.offices.slice(1)){
    s.honors.office=next.id-1;for(const id of Object.keys(s.jewels))s.jewels[id]=0;
    const required=Object.entries(next.promotion.jewels);assert.ok(required.length>0,next.name);
    for(const [id,count] of required){assert.ok(Object.hasOwn(s.jewels,id));assert.ok(Number.isSafeInteger(count)&&count>0);s.jewels[id]=count;}
    const [missing,count]=required.at(-1);s.jewels[missing]=count-1;
    const before=JSON.stringify([s.honors,s.res,s.jewels]);assert.ok(Heritage.promote('office'));assert.equal(JSON.stringify([s.honors,s.res,s.jewels]),before);
    s.jewels[missing]=count;const gold=s.res.gold;assert.equal(Heritage.promote('office'),null,next.name);assert.equal(s.honors.office,next.id);assert.equal(s.res.gold,gold-next.promotion.gold);
    for(const [id] of required)assert.equal(s.jewels[id],0);
  }
});
test('confirmation rechecks jewels after a successful quote and does not charge partial fees',()=>{
  const {Game,Heritage}=load(),s=Game.state;s.honors.office=12;s.prestige=2000000;s.buildings.hall=10;s.cityLevels[14]=10;s.conquered.fort=true;s.res.gold=300000;s.jewels.jade=5;s.jewels.nightPearl=1;
  assert.equal(Heritage.promotionQuote(s,'office').reason,'');s.jewels.nightPearl=0;
  assert.match(Heritage.promote('office'),/夜明珠/);assert.equal(s.res.gold,300000);assert.equal(s.jewels.jade,5);assert.equal(s.honors.office,12);
});
test('legacy office and daily salary claims persist; noble promotion retains its original costs',()=>{
  const {Game,Heritage,data}=load(),s=Game.state;s.honors.office=7;s.honors.salaryClaims.office=0;
  Heritage.salary('office');const claimed=s.honors.salaryClaims.office;Game.save();Game.init();assert.equal(Game.state.honors.office,7);assert.equal(Game.state.honors.salaryClaims.office,claimed);
  assert.equal(Heritage.salaryQuote(Game.state,'office').claimed,true);
  const rule=data.nobles[1].promotion;assert.equal(rule.prestige,1000);assert.equal(rule.office,1);assert.equal(rule.gold,20000);assert.equal(rule.jewels.pearl,10);assert.equal(rule.jewels.coral,5);
  Game.state.prestige=1000;Game.state.res.gold=30000;Game.state.jewels.pearl=10;Game.state.jewels.coral=4;
  assert.match(Heritage.promote('noble'),/珊瑚/);Game.state.jewels.coral=5;assert.equal(Heritage.promote('noble'),null);assert.equal(Game.state.honors.noble,1);assert.equal(Game.state.jewels.pearl,0);assert.equal(Game.state.jewels.coral,0);assert.equal(Game.state.res.gold,10000);
});
