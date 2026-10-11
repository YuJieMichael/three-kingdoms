const {test}=require('node:test'),assert=require('node:assert/strict');
const {loaders}=require('./city-conquest-income.cjs');
test('economic baseline actually loads PR72 rules instead of the current filesystem',()=>{
 const old=loaders(true).loadGame(1),current=loaders(false).loadGame(1);
 assert.equal(old.evaluate('YellowCityData.nodes.length'),8);
 assert.equal(old.Game.getNode('yellow_qingshi').loot.gold,1500);
 assert.equal(old.Game.getNode('yellow_qingshi').army.shield,60);
 assert.equal(old.evaluate('typeof HeroSystem.defeatedPopulation'),'undefined');
 assert.equal(current.evaluate('YellowCityData.nodes.length'),20);
 assert.equal(current.Game.getNode('yellow_qingshi').loot.gold,6000);
 assert.equal(current.Game.getNode('yellow_qingshi').army.shield,90);
 assert.equal(current.evaluate('typeof HeroSystem.defeatedPopulation'),'function');
});
test('earned checkpoints restore at their original clock without adding offline income',()=>{
 const lib=loaders(false),source=lib.loadGame(1);source.advance(36*3600000);const state=lib.cloneActiveSave(source.Game.state);
 const {earnedEnvironment}=require('./city-conquest-income.cjs');const restored=earnedEnvironment(lib,1,state);
 assert.equal(restored.now(),state.last);assert.deepEqual(JSON.parse(JSON.stringify(restored.Game.state.res)),JSON.parse(JSON.stringify(state.res)));
});
