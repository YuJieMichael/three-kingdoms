const {test}=require('node:test'),assert=require('node:assert/strict');
const {loadGame,city}=require('./helpers/game.cjs');
// v0.35.1: chapter 2 opens after 黄巾营寨, ends at the ordinary city 北原城, and the county era waits for chapter 4
// (design/quick-specs/progression-rework-2026-10-18.md §2, §4, §8).
const conquer=(s,ids)=>{for(const id of ids)s.conquered[id]=true;};
const chapterIds=(C,chapter)=>C.chapterNodes(chapter).map(n=>n.id);
test('chapter one runs 荒田 → 竹林 → 隘口 → 赤铁山 → 黄巾营寨 and the county stays hidden',()=>{
  const {Game:g}=loadGame(),s=g.state;
  s.raided.field=true;s.raided.wood=true;s.raided.pass=true;
  assert.equal(g.landmarkVisible('mine'),true);assert.equal(g.landmarkVisible('camp'),false);assert.equal(g.nextLandmark().id,'mine');
  s.raided.mine=true;assert.equal(g.landmarkVisible('camp'),true);assert.equal(g.landmarkVisible('fort'),false);
  s.conquered.camp=true;assert.equal(g.landmarkVisible('fort'),false);assert.match(g.attackBlocked('fort','occupy'),/尚未发现/);
});
test('taking 黄巾营寨 opens chapter two without any county',()=>{
  const e=loadGame(),g=e.Game,s=g.state,C=e.Chapter;
  assert.match(C.blocked(s,'north_road'),/黄巾营寨/);
  conquer(s,['field','wood','pass','mine','camp']);
  assert.equal(C.unlocked(s,2),true);assert.equal(C.blocked(s,'north_road'),null);assert.equal(g.landmarkVisible('north_road'),true);
  assert.equal(g.nextLandmark().id,'north_road');assert.equal(s.conquered.fort,undefined);
});
test('chapter two ends at the ordinary city 北原城, taken by morale like any city',()=>{
  const e=loadGame(),g=e.Game,s=g.state,C=e.Chapter,keep=g.getNode('north_keep');
  assert.equal(keep.name,'北原城');assert.equal(g.isCity(keep),true);assert.equal(keep.level,6);assert.equal(C.chapterNodes(2).at(-1).id,'north_keep');
  assert.equal(s.towns.north_keep.morale,100);
  conquer(s,['camp',...chapterIds(C,2).slice(0,-1)]);assert.equal(C.completed(s,2),false);
  s.honors.noble=1;assert.equal(g.cityLimit(),2);assert.equal(g.attackBlocked('north_keep','occupy'),null);
  assert.equal(g.validSave(s),true);
});
test('county and named cities appear only after chapter four is cleared',()=>{
  const e=loadGame(),g=e.Game,s=g.state,C=e.Chapter;
  conquer(s,['field','wood','pass','mine','camp',...chapterIds(C,2),...chapterIds(C,3),...chapterIds(C,4).slice(0,-1)]);
  for(const id of ['fort','named_hanchuan','named_luoshui','named_jiangling'])assert.equal(g.landmarkVisible(id),false,id);
  s.conquered.c4_luoyang=true;
  assert.equal(g.landmarkVisible('fort'),true);assert.equal(g.landmarkVisible('named_jiangling'),true);
  assert.equal(/尚未发现/.test(g.attackBlocked('fort','occupy')||''),false);
});
test('an old save that already holds the county keeps chapter two and the named cities',()=>{
  const e=loadGame(),g=e.Game,s=g.state,C=e.Chapter;
  conquer(s,['field','wood','pass','camp','fort']);
  assert.equal(C.unlocked(s,2),true);assert.equal(g.landmarkVisible('fort'),true);
  conquer(s,chapterIds(C,2));assert.equal(g.landmarkVisible('named_luoshui'),true);
});
test('chapter three to four garrisons never jump more than threefold between neighbours',()=>{
  const e=loadGame(),C=e.Chapter,total=n=>Object.values(n.army).reduce((a,b)=>a+b,0);
  const line=[...C.chapterNodes(3),...C.chapterNodes(4)];
  for(let i=1;i<line.length;i++)assert.ok(total(line[i])<=3*total(line[i-1]),line[i-1].name+' '+total(line[i-1])+' → '+line[i].name+' '+total(line[i]));
});
test('noble promotion needs chapter progress, prestige and gold but no jewels',()=>{
  const e=loadGame(),g=e.Game,s=g.state,C=e.Chapter,H=e.evaluate('HeritageSystem');
  s.prestige=10000000;s.res.gold=10000000;for(const id of Object.keys(s.jewels))s.jewels[id]=0;
  assert.match(H.promotionQuote(s,'noble').reason,/第一章/);
  s.conquered.camp=true;const q=H.promotionQuote(s,'noble');assert.equal(q.reason,'');assert.equal(JSON.stringify(q.jewels.total),'{}');
  assert.equal(H.promote('noble'),null);assert.equal(g.state.honors.noble,1);assert.ok(Object.values(g.state.jewels).every(n=>n===0));
  assert.equal(H.promote('office'),null);assert.equal(g.state.honors.office,1);
  assert.match(H.promotionQuote(g.state,'noble').reason,/第二章前 3 关/);
  conquer(g.state,chapterIds(C,2).slice(0,3));assert.equal(H.promotionQuote(g.state,'noble').reason,'');
});
test('an old save above the new chapter gate keeps its rank',()=>{
  const e=loadGame(),g=e.Game,s=g.state;s.honors.noble=5;s.honors.office=4;
  g.importSave(JSON.parse(JSON.stringify(s)));assert.equal(g.state.honors.noble,5);assert.equal(g.state.honors.office,4);
});
