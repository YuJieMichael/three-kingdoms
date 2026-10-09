const test=require('node:test'),assert=require('node:assert/strict');
const {loadGame,cloneActiveSave}=require('./helpers/game.cjs');
test('a fresh game starts with one unused labor decree and a valid save',()=>{
 const {Game:g}=loadGame();assert.equal(g.state.inventory.labor,1);assert.equal(g.buildLimit(),2);assert.equal(g.validSave(g.state),true);
});
test('save and reload do not duplicate the starting labor decree',()=>{
 const {Game:g}=loadGame();g.save();g.init();g.init();assert.equal(g.state.inventory.labor,1);
});
test('the starting decree retains the existing five queues and three day duration, and stays spent after reload',()=>{
 const e=loadGame(),g=e.Game;assert.equal(g.useItem('labor'),null);assert.equal(g.state.inventory.labor,0);assert.equal(g.buildLimit(),5);assert.equal(g.state.buffs.labor.end-e.now(),3*24*60*60*1000);g.init();assert.equal(g.state.inventory.labor,0);assert.equal(g.buildLimit(),5);
});
test('existing saves keep their own labor decree inventory without a retroactive gift',()=>{
 for(const count of [undefined,0,3]) {const {Game:g}=loadGame(),old=cloneActiveSave(g.state);if(count===undefined)delete old.inventory.labor;else old.inventory.labor=count;
  old.realm.cities[old.realm.activeCity].data.inventory=old.inventory;
  g.importSave(old);assert.equal(g.state.inventory.labor,count);g.save();g.init();assert.equal(g.state.inventory.labor,count);
 }
});
test('legacy migration without an inventory does not apply the new-game gift',()=>{
 const {Game:g}=loadGame(),old=cloneActiveSave(g.state);delete old.manualSchema;delete old.inventory;delete old.realm;
 old.cityLayout=Array(16).fill(null);old.cityLayout[5]='hall';
 const migrated=g.migrateSave(old);assert.equal(migrated.inventory.labor,undefined);assert.equal(g.validSave(migrated),true);
 g.importSave(old);g.save();g.init();assert.equal(g.state.inventory.labor,undefined);assert.equal(g.validSave(g.state),true);
});
test('reset starts a new game with exactly one labor decree',()=>{
 const {Game:g}=loadGame();g.state.inventory.labor=7;g.save();assert.equal(g.reset(),null);assert.equal(g.state.inventory.labor,1);
});
