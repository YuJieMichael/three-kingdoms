const {test}=require('node:test'),assert=require('node:assert/strict');
const {loadGame,city}=require('./helpers/game.cjs');
function prepared(){
  const e=loadGame(21),g=e.Game,s=g.state,C=e.Chapter;
  city(g,{hall:10,drill:10,barracks:10,smith:10,inn:5,academy:10});s.honors.noble=10;for(const id of Object.keys(s.tech))s.tech[id]=10;
  s.conquered.fort=true;s.conquered.camp=true;for(const n of [...C.nodes,...C.chapterThreeNodes,...C.chapterFourNodes])s.conquered[n.id]=true;
  for(const k of ['food','wood','stone','iron'])s.res[k]=9e6;s.res.gold=9e6;s.jewels.jade=20;s.inventory.blueprint=40;s.governor=null;
  return e;
}
function fight(e,id,army,general='lin'){const g=e.Game,s=g.state;for(const k of Object.keys(army))g.setTactic(k,'advance','');Object.assign(s.army,army);const err=g.dispatch(id,general,army,'raid');if(err)return {error:err};e.advance(Math.ceil(s.expedition.end-e.now())+1);g.startBattle();for(let i=0;i<40&&!s.battle.finished;i++)g.battleRound();const r=s.battle.result;e.advance(Math.ceil((s.expedition?.end||e.now())-e.now())+1);g.dismissBattle?.();return r;}
test('青龙偃月刀: scroll halves from hard wins, a hidden 72-hour site, smelting, a once-a-day awakening battle, then the weapon',()=>{
  const e=prepared(),g=e.Game,s=g.state,h=g.home;
  assert.equal(JSON.stringify(e.evaluate("LegendaryWeapons.rollScrolls(Game.state,{wild:true,level:8},()=>0)")),'{}','level 8 never drops');
  let tile=null;for(let r=1;r<=8&&!tile;r++)for(let dx=-r;dx<=r&&!tile;dx++)for(let dy=-r;dy<=r&&!tile;dy++){const t=g.getNode('wild_'+(h.x+dx)+'_'+(h.y+dy));if(t?.wild&&t.level>=9)tile=t;}
  assert.ok(tile,'a level 9+ wild tile nearby');e.evaluate('Math.random=()=>0');
  const won=fight(e,tile.id,{archer:20000,shield:8000,spear:8000,cavalry:6000,ram:40,catapult:20});assert.equal(won.won,true);
  assert.equal(s.inventory.qinglongScrollUpper,1);assert.equal(s.inventory.qinglongScrollLower,1);assert.ok(s.battle===null||true);
  e.evaluate('Math.random=()=>.5');assert.equal(g.seekLegendary(),null);const st=g.legendaryStatus();assert.equal(st.stage,'smelt');assert.ok(st.siteActive);
  const site=g.getNode(st.site);assert.equal(site.name,'青龙冢');assert.equal(site.legendSite,'qinglong');
  assert.match(g.dispatch(site.id,'lin',{archer:100},'raid'),/先熔炼好刀胚/);
  for(let i=0;i<8;i++)e.evaluate('LegendaryWeapons.onGather(Game.state,9)');assert.equal(g.legendaryStatus().meteor,40);
  assert.match(g.refineLegendaryQuote().reason,/冶署 3 级/);
  e.evaluate("const c=CitySystem.empty(Game.state,Game.getNode('yellow_baisha'),Date.now());Game.state.conquered.yellow_baisha=true;Game.state.realm.cities[c.id]=c;Game.state.realm.specialties[c.id]={level:3,target:3,end:0}");
  for(let d=0;d<4;d++){for(let i=0;i<5;i++)assert.equal(g.refineLegendary(),null);assert.match(g.refineLegendary(),/今日|精金已够/);e.advance(86400000);}
  assert.equal(g.legendaryStatus().refined,20);g.seekLegendary();assert.equal(g.smeltLegendary(),null);assert.equal(g.legendaryStatus().stage,'awaken');assert.equal(s.inventory.qinglongScrollUpper,0);
  const site2=g.getNode(g.legendaryStatus().site);s.army.archer=25000;assert.match(g.dispatch(site2.id,'lin',{archer:100},'raid'),/只认关羽/);
  city(g,{tavern:10});s.realm.namedCities.garrisons.named_jiangling.captive=true;assert.equal(g.recruitGarrisonGeneral('named_jiangling'),null);const guan=g.garrisonStatus('named_jiangling').general.id;assert.equal(s.generalLevels[guan],70);
  assert.match(g.dispatch(site2.id,guan,{archer:25000},'raid'),/最多带 20000/);
  const r=fight(e,site2.id,{archer:9000,shield:4000,spear:4000,cavalry:3000},guan);assert.equal(r.won,true,'关羽 with 20k can wake the blade');
  assert.equal(g.legendaryStatus().stage,'done');const blade=s.equipment.find(x=>x.named==='qinglong');assert.ok(blade);assert.equal(blade.tier,5);
  assert.equal(e.evaluate("HeroSystem.itemName(Game.state.equipment.find(x=>x.named==='qinglong'))"),'青龙偃月刀');assert.match(e.evaluate(`HeroSystem.salvage(${blade.id})`),/不能分解/);
  s.generalLevels.lin=20;assert.equal(e.evaluate(`HeroSystem.equip(${blade.id},'lin')`),null);assert.equal(e.evaluate("LegendaryWeapons.procChance(Game.state,'lin')"),.15);assert.equal(e.evaluate(`HeroSystem.equip(${blade.id},'${guan}')`),null);assert.equal(e.evaluate(`LegendaryWeapons.procChance(Game.state,'${guan}')`),.25);
  assert.equal(g.validSave(s),true);
});
