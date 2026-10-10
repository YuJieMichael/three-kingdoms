const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs');
const {ready}=require('./helpers/battlefield.cjs'),{nanReady,beginNan,plain,cloneActiveSave}=require('./helpers/nanman.cjs');
test('nanman requires yellow victory and a level ten idle hero before spending a token',()=>{
 const e=ready(),G=e.Game;G.state.generalLevels.lin=10;assert.match(G.battlefieldQuote('lin',{militia:200},'nanman').reason,/黄巾/);
 const n=nanReady(),g=n.Game;g.state.generalLevels.lin=9;assert.match(g.battlefieldQuote('lin',{militia:200},'nanman').reason,/10/);
 g.state.generalLevels.lin=10;const q=g.battlefieldQuote('lin',{militia:200},'nanman'),before=JSON.stringify(g.state);assert.equal(q.reason,'');assert.ok(g.startBattlefield('lin',{militia:200},q.key,'yellow_turban'));assert.equal(JSON.stringify(g.state),before);
 assert.equal(g.startBattlefield('lin',{militia:200},q.key,'nanman'),null);assert.equal(g.state.battlefields.run.campaign,'nanman');assert.equal(g.generalBusy('lin'),true);assert.ok(g.battlefieldQuote('lin',{militia:200},'yellow_turban').reason);assert.equal(g.validSave(g.state),true);
});
test('fixed v57 active yellow battle migrates only missing route records without changing combat',()=>{
 const e=ready(),G=e.Game,old=JSON.parse(fs.readFileSync(require('node:path').join(__dirname,'fixtures/battlefield-yellow-v57.json'))),before=plain(old.battlefields.run);
 const d=G.migrateSave(old);assert.deepEqual(plain(d.battlefields.run.infiltration),{});assert.equal(d.battlefields.run.battle.route,'normal');
 for(const k of ['army','pool','wounded','selectedNode'])assert.deepEqual(plain(d.battlefields.run[k]),before[k]);for(const k of ['player','enemy','orders','round'])assert.deepEqual(plain(d.battlefields.run.battle[k]),before.battle[k]);assert.equal(G.validSave(d),true);
 G.importSave(d);const saved=JSON.stringify(G.state);G.battlefieldView('nanman');G.battlefieldQuote('lin',{militia:200},'nanman');assert.equal(JSON.stringify(G.state),saved);assert.equal(G.battlefieldView('nanman').run.campaign,'yellow_turban');
 const bad=cloneActiveSave(G.state);bad.battlefields.run.infiltration=null;assert.equal(G.validSave(G.migrateSave(bad)),false);
});
test('nanman save rejects cross-campaign nodes and forged rental pools through normal reload',()=>{
 const e=nanReady(),G=e.Game;beginNan(e);const r=G.state.battlefields.run;assert.match(r.id,/^nanman:/);assert.equal(r.pool,2200);assert.deepEqual(plain(r.infiltration),{});
 const saved=JSON.stringify(G.state);G.battlefieldView('nanman');assert.equal(JSON.stringify(G.state),saved);G.save();G.init();assert.equal(G.state.battlefields.run.campaign,'nanman');
 for(const mutate of [d=>d.battlefields.run.pool++,d=>d.battlefields.run.completed=['m1'],d=>d.battlefields.run.campaign='fake']){const d=cloneActiveSave(G.state);mutate(d);assert.equal(G.validSave(d),false);}
 assert.ok(G.enterBattlefieldNode('m1'));assert.equal(G.abandonBattlefield(G.state.battlefields.run.id),null);assert.equal(G.generalBusy('lin'),false);
});
