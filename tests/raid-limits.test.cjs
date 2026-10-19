const {test}=require('node:test'),assert=require('node:assert/strict');
const {loadGame,city}=require('./helpers/game.cjs');
// v0.36.1: wild raids per day — full loot for 20, then 50% and 25%, at most 60; reset 05:00 Beijing (design §7).
function ready(){const e=loadGame(),g=e.Game,s=g.state;city(g,{hall:10,house:10,drill:10,barracks:10});s.army.archer=5000;s.res.food=1e7;return {e,g,s,day:()=>g.progression.period(e.now())};}
const wild=(g,skip='')=>{for(let y=28;y<36;y++)for(let x=28;x<36;x++){const t=g.getNode(`wild_${x}_${y}`);if(t?.wild&&t.level>=1&&!g.state.raided[t.id]&&t.id!==skip)return t;}return null;};
test('the loot preview falls to 50% after twenty wild raids and to 25% after forty',()=>{
  const {g,s,day}=ready(),t=wild(g),full=g.attackInfo(t.id,'raid').loot;
  s.raidDay={period:day(),count:20};const half=g.attackInfo(t.id,'raid').loot;
  s.raidDay.count=40;const quarter=g.attackInfo(t.id,'raid').loot;
  for(const k of Object.keys(full)){assert.ok(Math.abs(half[k]-full[k]*.5)<=1,k+' '+half[k]+' vs '+full[k]);assert.ok(Math.abs(quarter[k]-full[k]*.25)<=1,k);}
  assert.equal(g.attackInfo(t.id,'raid').raidShare,.25);assert.equal(g.attackInfo(t.id,'occupy').raidShare,undefined,'occupation is not limited');
});
test('each wild raid march counts; the sixty-first is refused without spending food or troops',()=>{
  const {g,s}=ready(),t=wild(g);assert.equal(g.dispatch(t.id,'lin',{archer:50},'raid'),null);assert.equal(g.raidStatus().count,1);
  s.raidDay.count=60;const food=s.res.food,archers=s.army.archer;
  s.governor=null;const t2=wild(g,t.id);assert.match(g.dispatchCheck(t2.id,'su',{archer:50},'raid').reason,/今日掠夺野地已达 60 次/);
  assert.equal(s.res.food,food);assert.equal(s.army.archer,archers);
  assert.equal(g.dispatchCheck(t2.id,'su',{archer:50},'occupy').reason.includes('今日掠夺'),false,'occupying is still allowed');
  assert.equal(g.validSave(s),true);
});
test('the count resets at the next 05:00 and chapter stages never count',()=>{
  const {e,g,s,day}=ready();s.raidDay={period:day(),count:60};
  e.advance(24*3600000);assert.equal(g.raidStatus().count,0);assert.equal(g.raidStatus().nextShare,1);
  s.raidDay=null;assert.equal(g.dispatch('field','lin',{archer:50},'raid'),null);assert.equal(s.raidDay,null,'a chapter stage raid is not a wild raid');
});
test('an old save starts with no raids counted, and a bad record is rejected',()=>{
  const {g}=ready(),old=JSON.parse(JSON.stringify(g.state));delete old.raidDay;g.importSave(old);assert.equal(g.state.raidDay,null);assert.equal(g.validSave(g.state),true);
  g.state.raidDay={period:g.state.raidDay?.period??g.progression.period(g.state.last),count:61};assert.equal(g.validSave(g.state),false);
});
