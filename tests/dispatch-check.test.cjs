const {test}=require('node:test'),assert=require('node:assert/strict');
const {loadGame,city}=require('./helpers/game.cjs');
// v0.34.74: the dispatch dialog shows why a march cannot start, using the same rules as dispatch.
function ready(){const e=loadGame(),g=e.Game,s=g.state;city(g,{hall:3,drill:2,barracks:1});s.army.archer=200;s.army.shield=100;return {e,g,s};}
const target='wild_31_33';
test('the dispatch pre-check never changes the save',()=>{
  const {g,s}=ready(),before=JSON.stringify(s);
  for(const army of [{},{archer:50},{archer:9999}])g.dispatchCheck(target,'lin',army,'raid');
  assert.equal(JSON.stringify(s),before);
});
test('the pre-check reports the same reason the march itself would refuse with',()=>{
  const cases=[
    ['no soldiers',({s})=>{},{archer:0}],
    ['more than the city holds',({s})=>{},{archer:201}],
    ['no rations',({s,e})=>{s.res.food=0;s.realm.rations=s.realm.rations||{};s.realm.rations[s.realm.activeCity]={amount:0,at:e.now()};},{archer:200,shield:100}],
    ['general already out',({g})=>{assert.equal(g.dispatch('wild_32_33','lin',{archer:10},'raid'),null);},{archer:50}],
  ];
  for(const [label,arrange,army] of cases){
    const ctx=ready();arrange(ctx);
    const reason=ctx.g.dispatchCheck(target,'lin',army,'raid').reason;
    assert.ok(reason,label+': pre-check should block');
    assert.equal(ctx.g.dispatch(target,'lin',army,'raid'),reason,label);
  }
});
test('a valid march passes the pre-check and then starts',()=>{
  const {g,s}=ready(),check=g.dispatchCheck(target,'lin',{archer:50},'raid');
  assert.equal(check.reason,'');assert.equal(check.selected.archer,50);
  assert.equal(g.dispatch(target,'lin',{archer:50},'raid'),null);assert.equal(s.army.archer,150);
});
