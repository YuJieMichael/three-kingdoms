const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const {loadGame,cloneActiveSave}=require('./helpers/game.cjs');
function uiEnv(){const e=loadGame();e.evaluate(`var S=()=>Game.state,esc=String,btn=()=>'',uiClicks=[];document.addEventListener=(type,fn)=>{if(type==='click')uiClicks.push(fn);};`);for(const file of ['layout-ui.js','manual-ui.js'])e.evaluate(fs.readFileSync(path.join(__dirname,'..',file),'utf8'));return e;}
// Catches an enabled engine action still being inaccessible through the fresh phone UI.
test('fresh hall-one cities offer automatic upgrades through an open construction entry',()=>{
 const e=uiEnv(),g=e.Game;assert.equal(g.state.buildings.hall,1);assert.equal(e.evaluate("layoutFeatureOpen('queues')"),true);
 const before=JSON.stringify(g.state),html=e.evaluate('autoUpgradeControls()');const button=html.match(/<button\b[^>]*data-action="manualAutoUpgrade"[^>]*>/)?.[0];assert.ok(button);assert.doesNotMatch(button,/\bdisabled\b/);assert.match(button,/aria-pressed="false"/);
 assert.equal(JSON.stringify(g.state),before);assert.equal(g.state.autoUpgrade,false);assert.equal(e.evaluate("layoutFeatureOpen('automation')"),false);assert.equal(e.evaluate("layoutFeatureOpen('research')"),false);
});
test('the initial upgrade toggle spends only after manual activation, persists and pauses future starts',()=>{
 const e=uiEnv(),g=e.Game;g.claimStarterGift();const before={...g.state.res};e.evaluate('autoUpgradeControls()');assert.deepEqual({...g.state.res},before);assert.equal(g.state.buildQueue.length,0);
 assert.equal(g.setAutoUpgrade(true),null);assert.equal(g.state.autoUpgrade,true);assert.ok(g.state.buildQueue.length>0);assert.ok(Object.keys(before).some(k=>g.state.res[k]<before[k]));
 g.save();g.init();assert.equal(g.state.autoUpgrade,true);assert.doesNotMatch(e.evaluate('autoUpgradeControls()').match(/<button\b[^>]*data-action="manualAutoUpgrade"[^>]*>/)[0],/\bdisabled\b/);
 const running=JSON.stringify(g.state.buildQueue);assert.equal(g.setAutoUpgrade(false),null);assert.equal(JSON.stringify(g.state.buildQueue),running);g.save();g.init();assert.equal(g.state.autoUpgrade,false);assert.equal(g.validSave(g.state),true);
});
test('old hall-one saves with either upgrade state retain that choice without enabling the full assistant',()=>{
 for(const enabled of [false,true]){const e=uiEnv(),g=e.Game,old=cloneActiveSave(g.state);old.autoUpgrade=enabled;old.realm.cities[old.realm.activeCity].data.autoUpgrade=enabled;g.importSave(old);
 assert.equal(g.state.autoUpgrade,enabled);assert.equal(e.evaluate("layoutFeatureOpen('queues')"),true);assert.equal(e.evaluate("layoutFeatureOpen('automation')"),false);assert.equal(g.validSave(g.state),true);}
});

test('toggling automatic upgrades immediately refreshes the open queue controls',()=>{
 const e=uiEnv(),g=e.Game;g.claimStarterGift();e.evaluate(`var modal={open:true},lastControls='',actResult=error=>!error;manualModalContext=()=>{lastControls=autoUpgradeControls();};var toggleEvent={target:{closest:selector=>selector==='[data-action]'?{disabled:false,dataset:{action:'manualAutoUpgrade'}}:null}};uiClicks.forEach(fn=>fn(toggleEvent));`);
 assert.equal(g.state.autoUpgrade,true);assert.match(e.evaluate('lastControls'),/停止自动升级/);assert.match(e.evaluate('lastControls'),/aria-pressed="true"/);
 e.evaluate('uiClicks.forEach(fn=>fn(toggleEvent));');assert.equal(g.state.autoUpgrade,false);assert.match(e.evaluate('lastControls'),/开启自动升级/);assert.match(e.evaluate('lastControls'),/aria-pressed="false"/);
});
