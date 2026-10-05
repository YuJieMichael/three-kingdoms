const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const {loadGame,city,cloneActiveSave}=require('./helpers/game.cjs');
function battle(){
  const e=loadGame(123),g=e.Game;city(g,{drill:1});g.state.army.archer=100;
  assert.equal(g.dispatch('field','lin',{archer:100},'raid'),null);e.advance(g.state.expedition.end-e.now()+1);assert.equal(g.startBattle(),null);g.setBattleOrders('advance');assert.equal(g.setBattleOrder('archer',undefined,'archer'),null);
  // An explicit contact fixture checks feedback, not normal progression.
  for(const r of g.state.battle.player)r.pos=400;for(const r of g.state.battle.enemy){r.pos=1000;r.initial=r.id==='archer'?50:200;r.hp=r.maxHp=r.stats.hp*r.initial;}
  return e;
}
function ui(e){
  e.evaluate('function S(){return Game.state;} function num(n){return String(n);} function esc(s){return String(s);} function resourceAmount(n){return String(n);} function btn(label,action,id=""){return `<button data-action="${action}" data-id="${id}">${label}</button>`;} function troopPortrait(){return "";} function battleAutoEnabled(){return !!S().battle?.auto;} function battleTimerText(){return "30 秒";} function battleOutcomeText(){return "";} function battleFailureHTML(){return "";} function battleCargoHTML(){return "";} function battleResourceHTML(){return "";} function battleDropsHTML(){return "";}');
  e.evaluate(fs.readFileSync(path.join(__dirname,'../combat-ui.js'),'utf8'));
}
test('one contact round records typed feedback, retains targeting and preserves old-save compatibility',()=>{
  const e=battle(),g=e.Game,b=g.state.battle,before=Object.fromEntries(b.enemy.map(r=>[r.id,Math.ceil(r.hp/r.stats.hp)]));g.battleRound();
  assert.equal(b.currentRoundSummary.round,b.round);assert.ok(b.currentRoundSummary.events.some(e=>e.type==='move'));assert.ok(b.currentRoundSummary.events.some(e=>e.type==='strike'&&e.unit==='archer'&&e.ranged));assert.ok(b.currentRoundSummary.events.some(e=>e.type==='recoil'));
  const logDamage=b.log.filter(line=>line.includes('，伤害 ')).map(line=>Number(line.match(/，伤害 ([\d.]+)/)[1])),eventDamage=b.currentRoundSummary.events.filter(e=>['strike','gate','tower'].includes(e.type)).map(e=>e.damage);
  assert.deepEqual(logDamage,eventDamage,'the visible log and typed round feedback must use the same actual damage');
  const killed=b.currentRoundSummary.events.filter(e=>e.type==='strike'&&e.side==='player').reduce((n,e)=>n+e.killed,0),remaining=b.enemy.reduce((n,r)=>n+Math.ceil(r.hp/r.stats.hp),0);
  assert.equal(killed,Object.values(before).reduce((n,v)=>n+v,0)-remaining);assert.equal(b.orders.archer.target,'archer');assert.equal(g.validSave(g.state),true);
  const old=cloneActiveSave(g.state);delete old.battle.currentRoundSummary;assert.equal(g.validSave(old),true);
  const invalid=cloneActiveSave(g.state);invalid.battle.currentRoundSummary.events[0].damage=-1;assert.equal(g.validSave(invalid),false);g.save();g.init();assert.equal(g.state.battle.currentRoundSummary.round,b.round);assert.equal(g.validSave(g.state),true);
});
test('a new round animates once; rerenders and reloaded saved rounds retain summary without replay',()=>{
  const e=battle(),g=e.Game;ui(e);assert.ok(!e.evaluate('battlePage()').includes('class="combat-effects"'));g.battleRound();
  const first=e.evaluate('battlePage()');assert.match(first,/class="combat-effects"/);assert.match(first,/combat-moving/);assert.match(first,/combat-shot/);assert.match(first,/我军倒下/);assert.match(first,/射击 → 敌军/);
  const second=e.evaluate('battlePage()');assert.ok(!second.includes('class="combat-effects"'));assert.ok(!second.includes(' combat-moving'));assert.match(second,/第 1 回合战况/);
  g.save();g.init();const loaded=e.evaluate('battlePage()');assert.ok(!loaded.includes('class="combat-effects"'));assert.match(loaded,/第 1 回合战况/);assert.equal(g.state.battle.orders.archer.target,'archer');
});
test('economic feedback uses actual receipts and charges replacement only for permanent losses',()=>{
  const e=loadGame(),g=e.Game;e.evaluate('function num(n){return String(n);} function esc(s){return String(s);}');e.evaluate(fs.readFileSync(path.join(__dirname,'../campaign-ui.js'),'utf8'));
  e.evaluate('var feedbackResult={lost:{archer:2},wounded:{archer:5},loot:{food:100,gold:20},bonusLoot:{wood:30},overCapacity:20,resourceReceipt:{base:{loaded:{food:100,gold:20},received:{food:90,gold:20},overflow:{food:10,gold:0}},bonus:{loaded:{wood:30},received:{wood:30},overflow:{wood:0}}}};');
  const quote=JSON.parse(e.evaluate('JSON.stringify(battleEconomyQuote(feedbackResult))')),cost=Object.values(g.units.archer.cost).reduce((n,v)=>n+v,0);
  assert.equal(quote.loadedValue,150);assert.equal(quote.receivedValue,140);assert.equal(quote.replacementValue,cost*2);e.evaluate('feedbackResult.wounded.archer=20');assert.equal(e.evaluate('battleEconomyQuote(feedbackResult).replacementValue'),cost*2);
  const html=e.evaluate('battleEconomyHTML(feedbackResult)');assert.match(html,/实际入库资源等价/);assert.match(html,/伤兵归队 20 人/);assert.match(html,/1:1/);assert.match(html,/军功、铜钱、珍宝、装备和道具各自保留原单位/);
});
