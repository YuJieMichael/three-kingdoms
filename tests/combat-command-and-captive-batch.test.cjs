const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const {loadGame,city}=require('./helpers/game.cjs');
const copy=x=>JSON.parse(JSON.stringify(x));
function battle(){const e=loadGame(123),g=e.Game;city(g,{drill:1});Object.assign(g.state.army,{archer:30,spear:5,shield:5});assert.equal(g.dispatch('field','lin',{archer:30,spear:5,shield:5},'raid'),null);e.advance(g.state.expedition.end-e.now()+1);assert.equal(g.startBattle(),null);return e;}
function captives(){const e=loadGame(123),g=e.Game;city(g,{hall:3,drill:2,barracks:7,house:10});Object.assign(g.state.tech,{combat:1,protection:5,shooting:1,riding:5});g.state.population=g.workers()+100;g.state.res.food=100000;g.state.res.gold=100000;return e;}

test('batch orders affect living player units only, preserve targets, and allow later individual orders',()=>{
 const e=battle(),g=e.Game,b=g.state.battle;assert.equal(g.setBattleOrder('archer',undefined,'archer'),null);b.player.find(r=>r.id==='shield').hp=0;const enemy=JSON.stringify(b.enemy),dead=copy(b.orders.shield),round=b.round;
 for(const command of ['hold','fallback','advance']){assert.equal(g.setBattleOrders(command),null);assert.equal(b.orders.archer.command,command);assert.equal(b.orders.spear.command,command);assert.equal(b.orders.archer.target,'archer');assert.deepEqual(copy(b.orders.shield),dead);assert.equal(JSON.stringify(b.enemy),enemy);assert.equal(b.round,round);}
 assert.equal(g.setBattleOrder('spear','hold','spear'),null);assert.equal(b.orders.archer.command,'advance');assert.equal(b.orders.spear.command,'hold');g.save();g.init();assert.equal(g.state.battle.orders.spear.command,'hold');assert.equal(g.state.battle.orders.archer.target,'archer');assert.equal(g.validSave(g.state),true);
});
test('batch commands reject bad orders, missing/ended battles and no surviving formations without mutation',()=>{
 const e=battle(),g=e.Game;for(const command of ['',null,'charge',1]){const before=JSON.stringify(g.state);assert.match(g.setBattleOrders(command),/请选择/);assert.equal(JSON.stringify(g.state),before);}
 for(const r of g.state.battle.player)r.hp=0;const before=JSON.stringify(g.state);assert.match(g.setBattleOrders('hold'),/没有可指挥/);assert.equal(JSON.stringify(g.state),before);g.battleRound();const ended=JSON.stringify(g.state);assert.match(g.setBattleOrders('hold'),/没有进行中/);assert.equal(JSON.stringify(g.state),ended);g.dismissBattle();assert.match(g.setBattleOrders('advance'),/没有进行中/);
});
test('a batch captive quote is read-only and deterministic under food, gold and population constraints',()=>{
 for(const [resource,amount,wanted]of [['food',250,[3,2,0]],['gold',80,[3,1,0]],['population',4,[3,0,0]]]){
  const e=captives(),g=e.Game;Object.assign(g.state.captives,{militia:3,archer:10,cavalry:10});if(resource==='population')g.state.population=g.workers()+amount;else g.state.res[resource]=amount;
  const before=JSON.stringify(g.state),q=g.captiveRecruitAllQuote();assert.equal(JSON.stringify(g.state),before);assert.deepEqual(copy(q.rows.map(r=>r.count)),wanted);assert.equal(q.count,wanted.reduce((a,b)=>a+b));assert.deepEqual(copy(q.cost),{food:q.count*50,gold:q.count*20});assert.equal(q.reason,'');assert.equal(g.captiveRecruitAllQuote().key,q.key);
 }
});
test('batch recruitment skips locked units, commits the exact price once and preserves unaffordable captives',()=>{
 const e=captives(),g=e.Game;Object.assign(g.state.captives,{militia:3,archer:10,cavalry:5});g.state.tech.riding=0;g.state.res.food=250;const q=g.captiveRecruitAllQuote(),balances={food:g.state.res.food,gold:g.state.res.gold,pop:g.state.population};assert.equal(q.rows.find(r=>r.id==='cavalry').count,0);assert.match(q.rows.find(r=>r.id==='cavalry').reason,/需要/);assert.equal(g.recruitAllCaptives(q.key),null);
 assert.equal(g.state.army.militia,3);assert.equal(g.state.army.archer,2);assert.equal(g.state.captives.archer,8);assert.equal(g.state.captives.cavalry,5);assert.equal(g.state.res.food,balances.food-250);assert.equal(g.state.res.gold,balances.gold-100);assert.equal(g.state.population,balances.pop-7);assert.equal(g.state.activityMetrics.captive_recruit,5);const after=JSON.stringify(g.state);assert.match(g.recruitAllCaptives(q.key),/计划已变化/);assert.equal(JSON.stringify(g.state),after);assert.equal(g.validSave(g.state),true);g.init();assert.equal(g.state.army.archer,2);assert.equal(g.state.captives.archer,8);assert.equal(g.state.activityMetrics.captive_recruit,5);
});
test('confirmation revalidates funds and population, and invalid/no-op plans never deduct resources',()=>{
 for(const shrink of [g=>g.state.res.food=0,g=>g.state.res.gold=0,g=>g.state.population=g.workers(),g=>g.state.tech.shooting=0]){
  const e=captives(),g=e.Game;g.state.captives.archer=10;const q=g.captiveRecruitAllQuote();shrink(g);const before=JSON.stringify(g.state);assert.match(g.recruitAllCaptives(q.key),/计划已变化/);assert.equal(JSON.stringify(g.state),before);
 }
 const e=captives(),g=e.Game;for(const key of [undefined,null,{},-1,'invalid']){const before=JSON.stringify(g.state);assert.match(g.recruitAllCaptives(key),/计划已变化/);assert.equal(JSON.stringify(g.state),before);}const q=g.captiveRecruitAllQuote(),before=JSON.stringify(g.state);assert.match(g.recruitAllCaptives(q.key),/暂未/);assert.equal(JSON.stringify(g.state),before);
});
test('UI renders all three commands and requires the displayed batch quote before recruitment',()=>{
 const e=loadGame(),g=e.Game;
 e.evaluate('let shown=null; function S(){return Game.state;} function num(n){return String(n);} function esc(s){return String(s);} function btn(label,action,id="",style="",disabled=false){return `<button data-action="${action}" data-id="${id}"${disabled?" disabled":""}>${label}</button>`;} function showModal(title,body,footer){shown={title,body,footer};} function costs(cost){return JSON.stringify(cost);} function troopPortrait(){return "";} let manualModalContext=null;');
 e.evaluate(fs.readFileSync(path.join(__dirname,'../combat-ui.js'),'utf8'));const commands=e.evaluate('battleAllOrdersHTML({finished:false,player:[{hp:1}]})');for(const label of ['全部固守','全部前进','全部后退'])assert.ok(commands.includes(label));assert.equal(e.evaluate('battleAllOrdersHTML({finished:true,player:[{hp:1}]})'),'');
 city(g,{barracks:1});g.state.captives.militia=3;g.state.population=10;e.evaluate(fs.readFileSync(path.join(__dirname,'../captive-ui.js'),'utf8'));const before=JSON.stringify(g.state);e.evaluate('captiveRecruitAllModal()');const modal=JSON.parse(e.evaluate('JSON.stringify(shown)'));assert.match(modal.title,/预览/);assert.match(modal.footer,/确认一键招降/);assert.match(modal.body,/一次扣除/);assert.equal(JSON.stringify(g.state),before);
});
