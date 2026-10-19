const {test}=require('node:test'),assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path');
const {loadGame}=require('./helpers/game.cjs');
// v0.37.1: each chapter's third and last stage add an equipment box, and every stage says what taking it gives
// (design/quick-specs/pacing-rework-2026-10-19.md §3). Resource rewards keep their totals.
const boxes=g=>Object.fromEntries(g.missions.filter(m=>Object.keys(m.items||{}).some(k=>/starterEquipment/.test(k))).map(m=>[m.node||m.id,Object.keys(m.items).find(k=>/starterEquipment/.test(k))]));
test('the third and last stage of each chapter pay one equipment box, once',()=>{
  const e=loadGame(),g=e.Game,s=g.state;
  assert.deepEqual(boxes(g),{camp:'starterEquipmentBasic',north_ford:'starterEquipmentBasic',north_keep:'starterEquipmentBasic',luo_cavalry:'starterEquipmentFine',luo_citadel:'starterEquipmentFine',c4_xingyang:'starterEquipmentFine',c4_luoyang:'starterEquipmentFine'});
  s.conquered.camp=true;const before=s.inventory.starterEquipmentBasic||0;assert.equal(g.claimMission('camp'),null);assert.equal(s.inventory.starterEquipmentBasic,before+1);
  assert.match(g.claimMission('camp'),/已领取/);assert.equal(g.validSave(s),true);
});
test('resource and gold rewards keep their totals',()=>{
  const g=loadGame().Game,sum=g.missions.reduce((n,m)=>n+['food','wood','stone','iron','gold'].reduce((a,k)=>a+(m.reward?.[k]||0),0),0);
  assert.equal(sum,35954670,'same as v0.37.0');
});
test('the stage card says what taking the stage gives: its bonus, the box and what it opens',()=>{
  const e=loadGame(),src=fs.readFileSync(path.join(__dirname,'..','chapter-ui.js'),'utf8').split('\n'),from=src.findIndex(l=>l.startsWith('const CHAPTER_STAGE_UNLOCKS'));
  e.evaluate(src.slice(from,src.findIndex((l,k)=>k>from&&l==='}')+1).join('\n'));const gain=id=>e.evaluate(`chapterGainText(${JSON.stringify(id)})`);
  assert.equal(gain('mine'),'打下后得到：铁锭产量 +25%');
  assert.equal(gain('camp'),'打下后得到：解救武将 · 严秋；普通装备盒；开放第二章与野地采集');
  assert.match(gain('luo_citadel'),/精良装备盒；开放历史战场与史诗/);assert.match(gain('luo_gate'),/2 辆投石车/);
});
