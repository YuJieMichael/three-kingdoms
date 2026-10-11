const {test}=require('node:test'),assert=require('node:assert/strict');
const {loadGame,cloneActiveSave}=require('./helpers/game.cjs');
const names=['xikou','shiqiao','songlin','nangang','dongdu','xiting','changpo','zhuxi','anling','wangshan','pingyuan','cangwu'].map(n=>'yellow_'+n);
const plain=x=>JSON.parse(JSON.stringify(x));
test('twelve new cities and increased ordinary guards/gold leave famous garrisons and county gates intact',()=>{
 const e=loadGame(),g=e.Game,defs=e.evaluate('YellowCityData.nodes');assert.equal(defs.length,20);
 assert.deepEqual(names.map(id=>defs.find(n=>n.id===id)?.level),[2,2,2,2,3,3,3,3,4,4,5,5]);
 assert.equal(g.getNode('yellow_qingshi').army.shield,90);assert.equal(g.attackInfo('yellow_qingshi','occupy').loot.gold,6000);
 assert.equal(g.getNode('named_jiangling').army.shield,3500);assert.equal(g.getNode('named_jiangling').loot.gold,48000);
 assert.equal(g.getNode('named_hanchuan').army.shield,150);assert.equal(g.getNode('named_hanchuan').loot.gold,6000);
 assert.equal(e.evaluate('NamedCityData.definitions.length'),16);
 for(const id of names){const n=g.getNode(id);assert.equal(n.openCity,true);assert.equal(n.faction,'yellow_turban');assert.equal(g.getWorldTile(n.x,n.y).id,id);}
});
test('old saves append new cities while preserving owned wild cells and existing locations, and views stay read-only',()=>{
 const e=loadGame(),g=e.Game,old=cloneActiveSave(g.state),kept=plain(old.openCitySites);
 for(const id of names){delete old.towns[id];delete old.openCitySites[id];delete kept[id];}
 // Saved intel reference reserves the proposed new-city cell, without granting a fake city.
 old.scouted.wild_35_29={at:1791194400000,level:1};old.yellowGold.yellow_qingshi=1791198000000;
 const serialized=JSON.stringify(old),m=g.migrateSave(cloneActiveSave(old));assert.equal(JSON.stringify(old),serialized);assert.equal(g.validSave(m),true);
 for(const [id,site] of Object.entries(kept))assert.deepEqual(plain(m.openCitySites[id]),site);
 assert.equal(m.yellowGold.yellow_qingshi,1791198000000);assert.deepEqual(plain(m.scouted.wild_35_29),{at:1791194400000,level:1});
 assert.equal(Object.keys(m.openCitySites).length,e.evaluate('YellowCityData.allNodes().length'));
 assert.notDeepEqual(plain(m.openCitySites.yellow_shiqiao),{x:35,y:29});
 g.importSave(cloneActiveSave(old));const before=JSON.stringify(g.state);for(const id of names){const n=g.getNode(id);g.getWorldTile(n.x,n.y);g.attackInfo(id,'occupy');}assert.equal(JSON.stringify(g.state),before);
 const bad=cloneActiveSave(g.state);bad.openCitySites.yellow_xikou={...bad.openCitySites.yellow_shiqiao};assert.equal(g.validSave(bad),false);
});
