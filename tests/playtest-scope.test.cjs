const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const {loadGame,city}=require('./helpers/game.cjs');
const root=path.join(__dirname,'..'),line=(file,start)=>fs.readFileSync(path.join(root,file),'utf8').split('\n').find(l=>l.startsWith(start));
test('blueprints drop from wild tiles by level and more often from cities',()=>{
  const e=loadGame(),g=e.Game,h=g.home;let low=null,high=null;
  for(let dx=-8;dx<=8;dx++)for(let dy=-8;dy<=8;dy++){const t=g.getNode('wild_'+(h.x+dx)+'_'+(h.y+dy));if(t?.wild&&t.level===1)low=t;if(t?.wild&&t.level>=8)high=t;}
  assert.ok(Math.abs(g.blueprintChance(low.id)-.04)<1e-9);assert.ok(g.blueprintChance(high.id)>=.11);
  assert.ok(Math.abs(g.blueprintChance('yellow_qingshi')-.17)<1e-9);assert.ok(g.blueprintChance('yellow_huangsha')>g.blueprintChance('yellow_qingshi'));
});
test('a won wild raid can carry a blueprint into the inventory through the normal drop path',()=>{
  const e=loadGame(5),g=e.Game,h=g.home;city(g,{hall:2,drill:1,barracks:1});g.state.army.archer=200;
  let tile=null;for(let r=1;r<=5&&!tile;r++)for(let dx=-r;dx<=r&&!tile;dx++)for(let dy=-r;dy<=r&&!tile;dy++){const t=g.getNode('wild_'+(h.x+dx)+'_'+(h.y+dy));if(t?.wild&&t.level===1)tile=t;}
  e.evaluate('Math.random=()=>0');const before=g.state.inventory.blueprint||0;
  assert.equal(g.dispatch(tile.id,'lin',{archer:200},'raid'),null);e.advance(g.state.expedition.end-e.now()+1);assert.equal(g.startBattle(),null);
  for(let i=0;i<40&&!g.state.battle.finished;i++)g.battleRound();assert.equal(g.state.battle.result.won,true);
  assert.equal(g.state.battle.result.itemDrops.blueprint>=1,true);assert.ok((g.state.inventory.blueprint||0)>before);assert.equal(g.validSave(g.state),true);
});
test('playtest build hides online entries, the test-supply tool and unusable shop items unless opened with ?dev',()=>{
  const vm=require('node:vm'),src=fs.readFileSync(path.join(root,'playtest-config.js'),'utf8');
  const plain=vm.runInNewContext(src+';PlaytestConfig',{URLSearchParams,location:{search:''}}),dev=vm.runInNewContext(src+';PlaytestConfig',{URLSearchParams,location:{search:'?dev'}});
  assert.deepEqual([plain.online,plain.testSupplies,plain.unavailableShopItems],[false,false,false]);assert.deepEqual([dev.online,dev.testSupplies,dev.unavailableShopItems],[true,true,true]);
  assert.doesNotMatch(fs.readFileSync(path.join(root,'index.html'),'utf8'),/PvP/);
});
// v0.37.0: daily tasks open after the first fight, war orders after 北原城, the epic after chapter three.
test('task tabs and growth routes open with progress; automation from hall 3',()=>{
  const e=loadGame(),g=e.Game,block=(file,start)=>{const lines=fs.readFileSync(path.join(root,file),'utf8').split('\n'),from=lines.findIndex(l=>l.startsWith(start));return lines.slice(from,lines.findIndex((l,k)=>k>=from&&l==='}')+1).join('\n');};
  e.evaluate('var S=()=>Game.state;'+line('progression-ui.js','function taskTabOpen')+line('classic-ui.js','function growthStageOpen')+block('layout-ui.js','function layoutFeatureOpen'));
  const open=id=>e.evaluate(`taskTabOpen(${JSON.stringify(id)})`),stage=id=>e.evaluate(`growthStageOpen(${JSON.stringify(id)})`);
  assert.deepEqual(['growth','daily','chapter','honors','epic','orders'].map(open),[true,false,true,false,false,false]);
  assert.deepEqual(['立城补给','城池经营','书院研习','整军出征','征战里程'].map(stage),[true,true,false,false,false]);
  assert.equal(e.evaluate("layoutFeatureOpen('automation')"),false);
  // v0.37.0: later systems stay hidden until their chapter (pacing-rework-2026-10-19.md §2).
  const feature=id=>e.evaluate(`layoutFeatureOpen(${JSON.stringify(id)})`),later=['gather','factions','battlefield','named'];
  assert.deepEqual(later.map(feature),[false,false,false,false]);
  city(g,{hall:3,academy:1,barracks:1,drill:1});g.state.stats.victories=1;g.state.conquered.camp=true;
  assert.ok(['daily','honors'].every(open));assert.ok(['书院研习','整军出征','征战里程'].every(stage));assert.equal(e.evaluate("layoutFeatureOpen('automation')"),true);
  assert.equal(open('orders'),false);g.state.conquered.north_keep=true;assert.equal(open('orders'),true);
  assert.equal(open('epic'),false);for(const n of [...e.Chapter.nodes,...e.Chapter.chapterThreeNodes])g.state.conquered[n.id]=true;assert.equal(open('epic'),true);
  assert.deepEqual(later.map(feature),[true,true,true,false],'gathering, factions and battlefields open by chapter three; named cities wait for the county');
});
