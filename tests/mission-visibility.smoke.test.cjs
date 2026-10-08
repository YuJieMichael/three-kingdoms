const {test}=require('node:test'),assert=require('node:assert/strict');
const {loadGame}=require('./helpers/game.cjs');
const copy=x=>JSON.parse(JSON.stringify(x));
const visible=g=>copy(g.nodes.filter(n=>!n.openCity&&g.landmarkVisible(n.id)).map(n=>n.id));
test('task landmarks reveal the next visit while retaining veteran progress and deployments',()=>{
 const e=loadGame(),g=e.Game,s=g.state;
 assert.deepEqual(visible(g),['field']);s.raided.field=true;assert.deepEqual(visible(g),['field','wood']);
 s.conquered.camp=true;assert.deepEqual(visible(g),['field','wood','pass','camp','mine']);
 s.expeditions.push({node:'fort'});assert.equal(g.landmarkVisible('fort'),true);s.expeditions=[];
 assert.equal(g.nextLandmark().id,'mine');
});
test('chapter visibility follows occupation and preserves the complete-second-chapter gate',()=>{
 const e=loadGame(),g=e.Game,s=g.state;s.conquered.fort=true;
 assert.ok(visible(g).includes('north_road'));assert.ok(!visible(g).includes('north_granary'));
 s.conquered.north_road=true;assert.ok(visible(g).includes('north_granary'));assert.ok(!visible(g).includes('luo_outpost'));
 for(const n of e.Chapter.nodes)s.conquered[n.id]=true;
 assert.ok(visible(g).includes('luo_outpost'));assert.ok(!visible(g).includes('luo_gate'));assert.equal(g.validSave(s),true);
});
test('mainline uses actual milestones and exposes unchanged reward claims',()=>{
 const e=loadGame(),g=e.Game,s=g.state;e.evaluate('function S(){return Game.state;}function num(x){return String(x);}');
 e.evaluate(require('node:fs').readFileSync(require('node:path').join(__dirname,'../mainline-ui.js'),'utf8'));
 assert.equal(e.evaluate('mainlineModel().current.id'),'city');s.buildings.hall=2;
 assert.equal(e.evaluate('mainlineModel().current.id'),'battle');s.stats.victories=1;
 assert.equal(e.evaluate('mainlineModel().current.id'),'general');assert.equal(g.missionReady(g.missions.find(m=>m.id==='wildGeneral')),false);
 assert.deepEqual(copy(g.missions.find(m=>m.id==='firstVictory').reward),{food:6000,wood:6000,stone:6000,iron:6000,gold:6000});assert.match(e.evaluate('mainlineModel().stages[1].reward'),/黄金 6000/);
 assert.equal(g.claimMission('firstVictory'),null);assert.match(g.claimMission('firstVictory'),/已领取/);
 assert.equal(e.evaluate('mainlineModel().ready.some(m=>m.id==="firstVictory")'),false);
});
test('mid-level wild raids add supply without changing occupation or cargo limits',()=>{
 // v0.34.0 wild refresh (wild-fields.js) reshuffles free tiles' type/level per 8x8 block, so pick
 // a level-3 and a low-level tile from the live map instead of fixed legacy coordinates.
 const e=loadGame(),g=e.Game,wild=[];for(let y=24;y<32;y++)for(let x=24;x<32;x++){const t=g.getNode(`wild_${x}_${y}`);if(t?.wild)wild.push(t);}
 const n=wild.find(t=>t.level===3),low=wild.find(t=>t.level>=1&&t.level<3);assert.equal(n.level,3);assert.ok(low.level<3);
 const k=Object.keys(n.loot)[0],lk=Object.keys(low.loot)[0];assert.ok(n.loot[k]>0&&low.loot[lk]>0);
 assert.equal(g.attackInfo(n.id,'raid').loot[k],Math.round(n.loot[k]*1.3*2));
 assert.equal(g.attackInfo(n.id,'occupy').loot[k],n.loot[k]);
 assert.ok(g.lootPreview(n.id,'raid',{archer:1}).loaded<=g.carry({archer:1}));
 g.state.raided[n.id]=true;assert.equal(g.attackInfo(n.id,'raid').loot[k],Math.round(n.loot[k]*1.3*2*.6));
 assert.equal(g.attackInfo(low.id,'raid').loot[lk],Math.round(low.loot[lk]*1.3));
});
