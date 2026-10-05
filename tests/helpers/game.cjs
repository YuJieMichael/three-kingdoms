const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
function loadGame(seed=1){
  let now=1791194400000;const saved=new Map();
  const context=vm.createContext({console,Date:class extends Date{constructor(...args){super(...(args.length?args:[now]));}static now(){return now;}},localStorage:{getItem:k=>saved.get(k)||null,setItem:(k,v)=>saved.set(k,v)},document:{addEventListener(){}}});
  for(const file of ['manual-data.js','speedup-data.js','reference-rules.js','reward-data.js','progression.js','onboarding-data.js','onboarding-system.js','hero-system.js','heritage-data.js','heritage-system.js','npc-data.js','npc-defense.js','chapter-data.js','siege-data.js','war-orders.js','automation-system.js','yellow-city-data.js','plot-template-data.js','city-system.js','general-growth-data.js','general-growth-system.js','scout-system.js','engine.js','growth-guide.js'])vm.runInContext(fs.readFileSync(path.join(__dirname,'../..',file),'utf8'),context,{filename:file});
  vm.runInContext(`let testSeed=${seed}; Math.random=()=>((testSeed=(Math.imul(testSeed,1664525)+1013904223)>>>0)/4294967296);`,context);
  const Game=vm.runInContext('Game',context),Chapter=vm.runInContext('ChapterData',context);Game.init();
  return {Game,Chapter,now:()=>now,advance(ms,allowAutomation=false){now+=ms;Game.tick(now,allowAutomation);},offline(ms){Game.save();now+=ms;return Game.init();},evaluate:source=>vm.runInContext(source,context)};
}
function city(Game,levels){const s=Game.state;for(const [id,level] of Object.entries(levels)){const site=id==='hall'?14:s.cityLayout.indexOf(id)>=0?s.cityLayout.indexOf(id):s.cityLayout.indexOf(null);s.cityLayout[site]=id;s.cityLevels[site]=level;s.buildings[id]=level;}}
function battle(env,node,mode,army){const {Game}=env;for(const id of Object.keys(army))Game.setTactic(id,'advance','');const error=Game.dispatch(node,'lin',army,mode);if(error)throw new Error(error);env.advance(Math.ceil(Game.state.expedition.end-env.now())+1);const started=Game.startBattle();if(started)throw new Error(started);for(let i=0;i<30&&!Game.state.battle.finished;i++)Game.battleRound();return Game.state.battle.result;}
// Save fixtures keep the hydrated active projection and its city scope linked.
function cloneActiveSave(value){const d=JSON.parse(JSON.stringify(value)),scope=d?.realm?.cities?.[d.realm.activeCity]?.data;if(scope)for(const k of Object.keys(scope))scope[k]=d[k];return d;}
module.exports={loadGame,city,battle,cloneActiveSave};
