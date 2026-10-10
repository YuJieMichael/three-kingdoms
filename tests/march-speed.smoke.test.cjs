const {seedLegacyWild}=require('./helpers/legacy-wild.cjs');
const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const {loadGame,city}=require('./helpers/game.cjs');
function prepare(army){const e=loadGame(123),g=e.Game;city(g,{drill:1});g.state.res.food=100000;Object.assign(g.state.army,army);return e;}
test('pure cavalry is faster than archers; mixed armies use the slowest nonzero formation in the preview',()=>{
  const e=loadGame(),g=e.Game,before=JSON.stringify(g.state),archer=g.marchQuote('field',{archer:20}),rider=g.marchQuote('field',{cavalry:20}),mixed=g.marchQuote('field',{archer:1,cavalry:20}),zero=g.marchQuote('field',{archer:0,cavalry:20});
  assert.ok(rider.seconds<archer.seconds);assert.equal(archer.seconds,g.getNode('field').time);assert.equal(mixed.seconds,archer.seconds);assert.equal(mixed.slowest,'archer');assert.equal(zero.seconds,rider.seconds);assert.equal(zero.slowest,'cavalry');assert.equal(JSON.stringify(g.state),before);
  e.evaluate('function S(){return Game.state;} function duration(n){return n+" 秒";} function esc(s){return String(s);} function num(n){return String(n);}');e.evaluate(fs.readFileSync(path.join(__dirname,'../campaign-ui.js'),'utf8'));
  const html=e.evaluate('campaignMarchHTML("field",{archer:1,cavalry:20})');assert.match(html,/预计去程/);assert.match(html,/最慢兵种：弓箭兵/);assert.match(html,/纯骑兵可快奔袭/);
  city(g,{inn:1});seedLegacyWild(e);assert.equal(e.evaluate('HeroSystem.wild.discover()'),null);Object.assign(g.state.army,{archer:100,cavalry:45,spear:10});
  const wanderer=g.state.wildGenerals.rumors.find(r=>r.line==='wanderer'),warrior=g.state.wildGenerals.rumors.find(r=>r.line==='warrior');
  const defaults=()=>JSON.parse(e.evaluate('JSON.stringify(campaignDispatchDefaults('+JSON.stringify(wanderer.node)+'))'));
  let initial=defaults();assert.equal(initial.cavalry,30);assert.equal(Object.entries(initial).filter(([id])=>id!=='cavalry').reduce((n,[,count])=>n+count,0),0);
  g.state.army.cavalry=7;assert.equal(defaults().cavalry,7);g.state.army.cavalry=0;assert.equal(Object.values(defaults()).reduce((n,count)=>n+count,0),0);
  assert.deepEqual(JSON.parse(e.evaluate('JSON.stringify(campaignDispatchDefaults("field"))')),JSON.parse(JSON.stringify(g.state.army)));assert.deepEqual(JSON.parse(e.evaluate('JSON.stringify(campaignDispatchDefaults('+JSON.stringify(warrior.node)+'))')),JSON.parse(JSON.stringify(g.state.army)));
  wanderer.status='released';assert.deepEqual(defaults(),JSON.parse(JSON.stringify(g.state.army)));
});
test('dispatch uses the quote without changing food cost; later technology/reload preserves existing timestamps and recall uses travelled fraction',()=>{
  for(const army of [{archer:20},{cavalry:20},{archer:1,cavalry:19}]){
    const e=prepare(army),g=e.Game,quote=g.marchQuote('field',army),food=g.state.res.food;
    assert.equal(g.dispatch('field','lin',army,'raid'),null);const trip=g.state.expedition,start=trip.start,end=trip.end;
    assert.equal(end-start,quote.seconds*1000);assert.equal(food-g.state.res.food,Math.ceil(g.totalArmy(army)*1.2+g.getNode('field').time*2));
    // A pre-existing march remains a timestamped snapshot through tech and speed changes.
    g.state.tech.riding=5;g.state.tech.march=5;g.setSpeed(10);g.save();g.init();assert.equal(g.state.expedition.start,start);assert.equal(g.state.expedition.end,end);
    e.advance((end-start)*.6);const current=g.state.expedition,progress=(e.now()-current.start)/(current.end-current.start),returnQuote=g.marchQuote('field',army),expected=Math.max(1,returnQuote.returnSeconds*progress);
    assert.equal(g.recall(),null);assert.ok(Math.abs(g.state.expedition.end-g.state.expedition.start-expected*1000)<.001);
  }
});
test('battle return and stationed recall use the actual returning army and current speed quote',()=>{
  const e=prepare({archer:100}),g=e.Game;g.dispatch('field','lin',{archer:100},'raid');e.advance(g.state.expedition.end-e.now()+1);g.startBattle();
  // Contact is bypassed only to observe the return transition; no balance claim.
  for(const row of g.state.battle.enemy)row.hp=0;g.state.tech.march=2;g.battleRound();assert.equal(g.state.battle.finished,true);
  const back=g.state.battle.result.back,quote=g.marchQuote('field',back);assert.ok(Math.abs(g.state.expedition.end-g.state.expedition.start-quote.returnSeconds*1000)<.001);
  const stationed=prepare({}),s=stationed.Game,id='wild_31_32',army=Object.fromEntries(Object.keys(s.units).map(unit=>[unit,unit==='cavalry'?20:0]));
  s.state.conquered[id]=true;s.state.landClaims[id]={at:stationed.now(),level:s.getNode(id).level};s.state.garrisons[id]={general:'lin',army,phase:'stationed',start:stationed.now(),end:null};s.state.tech.riding=5;s.setSpeed(10);
  const expected=s.marchQuote(id,army).returnSeconds;assert.equal(s.recallGarrison(id),null);assert.ok(Math.abs(s.state.garrisons[id].end-s.state.garrisons[id].start-expected*1000)<.001);assert.equal(s.validSave(s.state),true);
});

test('selected mounted general preview matches dispatch and updates when the selection changes',()=>{
 const e=prepare({archer:20}),G=e.Game;e.evaluate("HeroSystem.addEquipment(Game.state,'mount',1).hero='lin'");
 e.evaluate(`function duration(n){return n+' 秒';}function esc(n){return String(n);}function num(n){return String(n);}function dispatchArmy(){return {archer:20};}globalThis.preview={innerHTML:''};globalThis.selectedGeneral={value:'lin'};document.getElementById=id=>id==='campaign-march-preview'?preview:id==='dispatch-mode'?{dataset:{node:'wild_0_0'}}:id==='dispatch-general'?selectedGeneral:null;`);
 e.evaluate(fs.readFileSync(path.join(__dirname,'../campaign-ui.js'),'utf8'));e.evaluate('updateCampaignMarchPreview()');
 const quote=G.marchQuote('wild_0_0',{archer:20},'lin');assert.match(e.evaluate('preview.innerHTML'),new RegExp('预计去程 '+quote.seconds+' 秒'));assert.match(e.evaluate('preview.innerHTML'),/坐骑.*出发时/);
 assert.equal(G.dispatch('wild_0_0','lin',{archer:20}),null);assert.equal(G.state.expedition.end-G.state.expedition.start,quote.seconds*1000);
 e.evaluate("selectedGeneral.value='su';updateCampaignMarchPreview()");assert.match(e.evaluate('preview.innerHTML'),new RegExp('预计去程 '+G.marchQuote('wild_0_0',{archer:20},'su').seconds+' 秒'));assert.match(e.evaluate('preview.innerHTML'),/返程按届时/);
});
