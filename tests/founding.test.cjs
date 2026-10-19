const {test}=require('node:test'),assert=require('node:assert/strict');
const {loadGame}=require('./helpers/game.cjs');
// v0.35.0: a new save names its ruler, banner and capital and picks a province before the opening battle.
const valid={ruler:'刘备',banner:'汉',city:'涿县',province:'jizhou'};
test('a new save starts unfounded and rejects bad names without changing anything',()=>{
  const {Game:g}=loadGame(),s=g.state;assert.equal(JSON.stringify(s.founding),JSON.stringify({done:false}));assert.equal(s.province,null);
  const before=JSON.stringify(s);
  for(const bad of [{...valid,ruler:'刘'},{...valid,ruler:'一二三四五六七'},{...valid,banner:''},{...valid,banner:'汉汉'},{...valid,city:'涿'},{...valid,province:'nowhere'},{...valid,ruler:'刘<b>'}])assert.ok(g.foundRealm(bad),JSON.stringify(bad));
  assert.equal(JSON.stringify(s),before);
});
test('founding sets the names, the capital tile and the province once, and survives a reload',()=>{
  const e=loadGame(),g=e.Game,s=g.state;
  assert.equal(g.foundRealm(valid),null);
  assert.equal(s.ruler,'刘备');assert.equal(s.banner,'汉');assert.equal(s.realm.cities.capital.name,'涿县');assert.equal(g.getWorldTile(g.home.x,g.home.y).name,'涿县');
  assert.equal(s.province,'jizhou');assert.equal(s.founding.done,true);assert.equal(g.validSave(s),true);
  assert.match(g.foundRealm({...valid,ruler:'曹操'}),/已经创建/);assert.equal(s.ruler,'刘备');
  g.save();g.init();assert.equal(g.state.ruler,'刘备');assert.equal(g.state.realm.cities.capital.name,'涿县');assert.equal(g.state.province,'jizhou');
});
test('each province applies only its own bonus',()=>{
  const base=loadGame().Game,r0=base.rates(),train0=id=>base.trainSeconds(id,100),march0=base.marchQuote('wild_31_33',{cavalry:10}).seconds;
  const with_=province=>{const g=loadGame().Game;g.state.province=province;return g;};
  assert.ok(Math.abs(with_('jizhou').rates().food/r0.food-1.1)<1e-9);assert.equal(with_('jizhou').rates().wood,r0.wood);
  assert.ok(Math.abs(with_('jingzhou').rates().wood/r0.wood-1.1)<1e-9);
  assert.equal(with_('bingzhou').trainSeconds('cavalry',100),train0('cavalry')*0.85);assert.equal(with_('bingzhou').trainSeconds('archer',100),train0('archer'));
  assert.equal(with_('xuzhou').trainSeconds('archer',100),train0('archer')*0.9);assert.equal(with_('xuzhou').trainSeconds('cavalry',100),train0('cavalry'));
  assert.ok(with_('liangzhou').marchQuote('wild_31_33',{cavalry:10}).seconds<march0);
  assert.equal(with_('liangzhou').marchQuote('wild_31_33',{archer:10}).seconds,base.marchQuote('wild_31_33',{archer:10}).seconds);
});
test('an old save counts as founded, keeps its names and may pick a province once',()=>{
  const e=loadGame(),g=e.Game,old=JSON.parse(JSON.stringify(g.state));delete old.founding;delete old.province;old.ruler='旧主';
  g.importSave(old);const s=g.state;
  assert.equal(s.founding.done,true);assert.equal(s.founding.legacy,true);assert.equal(s.province,null);assert.equal(s.ruler,'旧主');assert.equal(g.validSave(s),true);
  assert.match(g.foundRealm(valid),/已经创建/);
  assert.equal(g.chooseProvince('yuzhou'),null);assert.equal(s.province,'yuzhou');assert.match(g.chooseProvince('jizhou'),/已经选过/);
});
