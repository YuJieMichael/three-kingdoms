const {test}=require('node:test'),assert=require('node:assert/strict');
const {loadGame}=require('./helpers/game.cjs');
test('three jewels of a kind combine into one of the next kind; the top kind cannot combine',()=>{
  const e=loadGame(),g=e.Game;for(const id of Object.keys(g.state.jewels))g.state.jewels[id]=0;g.state.jewels.crystal=7;
  assert.equal(g.synthesizeJewel('crystal',1),null);assert.equal(g.state.jewels.crystal,4);assert.equal(g.state.jewels.jadeite,1);
  assert.equal(g.synthesizeJewel('crystal','all'),null);assert.equal(g.state.jewels.crystal,1);assert.equal(g.state.jewels.jadeite,2);
  assert.match(g.synthesizeJewel('crystal',1),/不足/);assert.match(g.synthesizeJewel('nightPearl',1),/不能再合成/);assert.equal(g.validSave(g.state),true);
});
test('twenty level-5+ wins without a jadeite, jade or night pearl guarantee one on the twentieth',()=>{
  const e=loadGame(),g=e.Game;e.evaluate('Math.random=()=>.99');const before={...g.state.jewels};
  const fight=level=>e.evaluate(`Progression.battle(Game.state,{level:${level},wild:true,terrain:'grass'},{enemy:[],player:[],mode:'occupy'},true,{})`);
  for(let i=0;i<19;i++)fight(6);assert.equal(g.state.jewelPity,19);assert.equal(g.state.jewels.jadeite,before.jadeite);
  fight(4);assert.equal(g.state.jewelPity,19,'low-level wins do not count');
  fight(6);assert.equal(g.state.jewelPity,0);assert.equal(g.state.jewels.jadeite,before.jadeite+1);assert.equal(g.validSave(g.state),true);
});
test('named city development rewards pay high-tier jewels by tier',()=>{
  const e=loadGame(),N=e.evaluate('NamedCityData');
  const any=e.evaluate("JSON.stringify(['county','prefecture','province','capital'].map(t=>NamedCityData.nodes.map(n=>NamedCityData.definition(n.id)).find(d=>d&&d.tier===t)?.development.jewels))");
  assert.equal(any,JSON.stringify([{jadeite:2},{jadeite:3,jade:1},{jade:3,nightPearl:1},{jade:4,nightPearl:2}]));
});
