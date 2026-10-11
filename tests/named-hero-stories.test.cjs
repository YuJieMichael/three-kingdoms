const {test}=require('node:test'),assert=require('node:assert/strict');
const {loadGame,cloneActiveSave}=require('./helpers/game.cjs');
const {prepared,recruitWild}=require('./helpers/hero-fixtures.cjs');
const {run}=require('./balance/named-siege.cjs');
const rows=[['changshan','zhaoyun','赵云',65],['changsha','huangzhong','黄忠',65],['xiliang','machao','马超',70],['xuchang','xunyu','荀彧',65],['chaisang','zhouyu','周瑜',70]];
test('five city stories have stable identities, retained stats and distinct map positions',()=>{
 const e=loadGame(),g=e.Game,G=e.evaluate('NamedGarrison'),D=e.evaluate('NamedCityData');
 assert.equal(G.ids.length,10);assert.equal(D.definitions.length,21);
 for(const [i,[city,line,name,start]]of rows.entries()){
  const id='named_'+city,h=G.hero(id),old=e.evaluate('HeroSystem.wild.definitions').find(d=>d.line===line),n=g.getNode(id);
  assert.equal(h.id,'local_'+(7100000000000006+i));assert.equal(h.name,name);assert.equal(h.level,20);assert.equal(G.recruitmentLevel(id),start);
  for(const k of ['atk','def','pol','wis','bonus'])assert.equal(h[k],old[k]);
  assert.ok(n.x>=0&&n.x<g.WORLD_SIZE&&n.y>=0&&n.y<g.WORLD_SIZE);assert.equal(g.nodes.map(o=>g.getNode(o.id)).filter(o=>o.x===n.x&&o.y===n.y).length,1);
  assert.match(n.desc,/忠诚/);assert.match(h.desc,/粮/);
 }
});
test('five-garrison saves migrate to ten without resetting original records or mutating reads',()=>{
 const e=loadGame(),g=e.Game,old=cloneActiveSave(g.state);for(const [city]of rows)delete old.realm.namedCities.garrisons['named_'+city];
 old.realm.namedCities.garrisons.named_xiaopei.loyalty=43;const before=JSON.stringify(old),m=g.migrateSave(old);
 assert.equal(JSON.stringify(old),before);assert.equal(m.realm.namedCities.garrisons.named_xiaopei.loyalty,43);assert.equal(Object.keys(m.realm.namedCities.garrisons).length,10);assert.equal(g.validSave(m),true);
 const snapshot=JSON.stringify(g.state);g.heroCodex();for(const [city]of rows)g.garrisonStatus('named_'+city);assert.equal(JSON.stringify(g.state),snapshot);
});
test('original and new prefecture access remains six of the original sixteen cities',()=>{
 const e=loadGame(),g=e.Game;for(const n of [...e.Chapter.nodes,...e.Chapter.chapterThreeNodes])g.state.conquered[n.id]=true;
 for(const id of ['named_xiapi','named_beihai','named_xuchang','named_chaisang']){
  assert.match(g.attackBlocked(id,'occupy'),/0 \/ 6/);
  const S=e.evaluate('NamedCitySystem'),owns=x=>['fort','yellow_qingshi','yellow_baisha','yellow_chigang','named_hanchuan','named_luoshui'].includes(x);
  assert.equal(S.attackBlocked(g.state,id,{owns}),'');
 }
});
for(const [city,line,,start]of rows)test(city+' actual siege capture loses 1–3 levels, gates titles, and grants no box',()=>{
 const id='named_'+city,owned=['fort','yellow_qingshi','yellow_baisha','yellow_chigang','named_hanchuan','named_luoshui'];
 const r=run({id,owned,army:{archer:30000,shield:12000,spear:10000,cavalry:8000,ram:60,catapult:40},maxAssaults:14});
 assert.equal(r.captured,true);assert.equal(r.recruited,true);assert.equal(r.validSave,true);assert.ok(r.level>=start-3&&r.level<=start-1);
 const e=prepared(),g=e.Game,G=e.evaluate('NamedGarrison'),s=g.state;s.realm.namedCities.garrisons[id].loyalty=29;
 G.settleBattle(s,id,{won:true,mode:'occupy',gateBroken:true},e.now(),{site:x=>g.getNode(x)});
 const h=G.hero(id),cap=s.captureLevels[h.id];assert.equal(cap.original,start);assert.ok(cap.loss>=1&&cap.loss<=3);assert.equal(s.inventory.barbarianEquipmentBox||0,0);
 s.honors.noble=0;assert.match(g.recruitGarrisonGeneral(id),/爵位/);s.honors.noble=10;assert.equal(g.recruitGarrisonGeneral(id),null);assert.equal(e.evaluate('HeroIdentity').key(s,h.id),line);assert.ok(g.general(h.id).lead<start*30);
 for(const mutate of [d=>d.captureLevels[h.id].original++,d=>d.customGenerals.find(x=>x.id===h.id).atk++,d=>d.customGenerals.find(x=>x.id===h.id).sourceNode='wild_0_0']){const d=cloneActiveSave(s);mutate(d);assert.equal(g.validSave(d),false);}
});
test('retained wild hero remains valid but blocks a duplicate city capture and recruitment',()=>{
 const e=prepared(),g=e.Game,id=recruitWild(e,'zhaoyun'),G=e.evaluate('NamedGarrison');assert.equal(g.validSave(g.state),true);
 const city='named_changshan';g.state.realm.namedCities.garrisons[city].loyalty=29;
 G.settleBattle(g.state,city,{won:true,mode:'occupy',gateBroken:true},e.now(),{site:x=>g.getNode(x)});
 assert.equal(g.state.realm.namedCities.garrisons[city].captive,false);assert.equal(g.state.captureLevels[G.hero(city).id],undefined);
 g.state.realm.namedCities.garrisons[city].captive=true;g.state.realm.namedCities.garrisons[city].recruited=false;assert.match(g.recruitGarrisonGeneral(city),/已在帐下/);assert.equal(g.state.generals.filter(x=>e.evaluate('HeroIdentity').key(g.state,x)==='zhaoyun').length,1);
 const book=g.heroCodex().filter(d=>d.name==='赵云');assert.equal(book.length,1);assert.equal(book[0].heroId,id);assert.equal(book[0].status,'recruited');
});
function capture(e,node){const g=e.Game,G=e.evaluate('NamedGarrison');g.state.realm.namedCities.garrisons[node].loyalty=29;G.settleBattle(g.state,node,{won:true,mode:'occupy',gateBroken:true},e.now(),{site:id=>g.getNode(id)});return G.hero(node).id;}
test('city recruitment persistence failure restores captive, ownership and growth ledgers',()=>{
 const e=prepared(),g=e.Game,id=capture(e,'named_changshan');g.save();const before=JSON.stringify(g.state);
 e.evaluate("localStorage.setItem=()=>{throw Error('test write failure')}");assert.match(g.recruitGarrisonGeneral('named_changshan'),/保存失败/);
 assert.equal(JSON.stringify(g.state),before);assert.equal(g.state.generals.includes(id),false);
});
test('existing duplicated identities stay readable, but wild and direct recruitment cannot add another',()=>{
 const e=prepared(),g=e.Game,id=capture(e,'named_changshan');assert.equal(g.recruitGarrisonGeneral('named_changshan'),null);
 const {seedLegacyWild}=require('./helpers/legacy-wild.cjs');seedLegacyWild(e);const w=e.evaluate('HeroSystem.wild');w.discover();
 const rumor=g.state.wildGenerals.rumors.find(r=>r.line==='zhaoyun');w.buyPortrait('zhaoyun',w.portraitQuote(g.state,'zhaoyun').key);
 const result=w.settle(g.state,g.getNode(rumor.node),{mode:'raid',finished:false,enemy:[{hp:0}]},true,e.now());assert.equal(result.status,'released');
 // Construct the legitimately duplicated shape an old release could persist; it must remain readable.
 const other=prepared(),oldId=recruitWild(other,'zhaoyun'),source=other.Game.state;
 g.state.wildGenerals=JSON.parse(JSON.stringify(source.wildGenerals));g.state.customGenerals.push(JSON.parse(JSON.stringify(source.customGenerals.find(h=>h.id===oldId))));g.state.generals.push(oldId);g.state.generalLevels[oldId]=source.generalLevels[oldId];g.state.generalXp[oldId]=0;g.state.heroLoyalty[oldId]=40;g.state.captureLevels[oldId]=JSON.parse(JSON.stringify(source.captureLevels[oldId]));g.state.realm.heroLocations[oldId]='capital';e.evaluate('HeroSystem.init(Game.state)');
 assert.equal(g.validSave(g.state),true);assert.equal(g.validSave(g.migrateSave(cloneActiveSave(g.state))),true);assert.equal(g.heroCodex().filter(d=>d.name==='赵云').length,1);
 const base=e.evaluate("NamedGarrison.hero('named_changshan')");g.state.innCandidates.push(base);assert.match(g.recruit(id),/已在帐下/);
 // A legacy captive may coexist with an owned city hero: quotation must block even if settlement happened before this release.
 const r=g.state.wildGenerals.rumors.find(r=>r.id===oldId);g.state.generals=g.state.generals.filter(x=>x!==oldId);g.state.customGenerals=g.state.customGenerals.filter(h=>h.id!==oldId);delete g.state.heroLoyalty[oldId];r.status='captive';g.state.wildGenerals.recruited=[];
 g.state.wildGenerals.captives.push({id:oldId,line:'zhaoyun',node:r.node,at:e.now(),loyalty:40,hero:source.customGenerals.find(h=>h.id===oldId)});
 assert.match(w.recruitQuote(g.state,oldId).reason,/已在帐下/);
});
test('defeated famous heroes cannot create or recruit a second stable identity',()=>{
 const loser=prepared(),l=loser.Game;capture(loser,'named_changshan');assert.equal(l.recruitGarrisonGeneral('named_changshan'),null);const id=loser.evaluate("NamedGarrison.hero('named_changshan').id");l.state.heroLoyalty[id]=40;
 const winner=prepared(),w=winner.Game,gov=winner.evaluate('GovernanceSystem');capture(winner,'named_changshan');assert.equal(w.recruitGarrisonGeneral('named_changshan'),null);
 const receipt=gov.captureDefeated(l.state,w.state,id,winner.now());assert.equal(receipt.status,'released');assert.equal(w.state.heroService.captives.length,0);
 const loser2=prepared();capture(loser2,'named_changshan');loser2.Game.recruitGarrisonGeneral('named_changshan');loser2.Game.state.heroLoyalty[id]=40;
 const dest=prepared(),d=dest.Game,D=dest.evaluate('GovernanceSystem'),r=D.captureDefeated(loser2.Game.state,d.state,id,dest.now());assert.equal(r.status,'captured');
 capture(dest,'named_changshan');assert.equal(d.recruitGarrisonGeneral('named_changshan'),null);assert.match(d.defeatedHeroQuote(r.captiveId).reason,/已在帐下/);
 const held=d.state.heroService.captives[0];held.hero.famousSource.line='named_chaisang';assert.equal(d.validSave(cloneActiveSave(d.state)),false);
});
test('new city malformed migration data stays invalid, and all three capture losses are reachable',()=>{
 const e=prepared(),g=e.Game;for(const value of [null,[],{loyalty:29}]){const d=cloneActiveSave(g.state);d.realm.namedCities.garrisons.named_changshan=value;assert.equal(g.validSave(g.migrateSave(d)),false);}
 for(const [random,loss]of [[0,1],[.4,2],[.999,3]]){const x=prepared();x.evaluate('Math.random=()=>'+random);const id=capture(x,'named_changshan');assert.equal(x.Game.state.captureLevels[id].loss,loss);}
});
for(const action of ['persuadeGarrison','sowGarrison'])test(action+' persistence failure restores costs and siege cooldowns',()=>{
 const e=prepared(),g=e.Game;if(action==='sowGarrison')g.state.cityRoles.counsellor='su';g.save();const before=JSON.stringify(g.state);
 e.evaluate("localStorage.setItem=()=>{throw Error('test write failure')}");assert.match(g[action]('named_changshan'),/保存失败/);assert.equal(JSON.stringify(g.state),before);
});
