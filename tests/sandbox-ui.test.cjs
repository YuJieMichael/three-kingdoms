const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const {loadGame,city}=require('./helpers/game.cjs');
function ui(e){
  e.evaluate(`var S=()=>Game.state,esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])),num=n=>String(Math.floor(n)),duration=n=>Number(n).toFixed(2)+'秒';
    var worldView={x:32,y:32},selectedNode='field',page='world',mapSheetOpen=false,manualModalContext=null,renderCount=0,centers=[];
    function btn(label,action,id='',cls='',disabled=false){return '<button data-action="'+action+'" data-id="'+id+'"'+(disabled?' disabled':'')+'>'+label+'</button>'}
    function activeCityMeta(){return Game.cityMeta(Game.currentCityId())} function generalPortrait(){return '<img>'} function enemyIntelHTML(){return '<span>已知守军</span>'} function clock(end){return String(end)}
    function campaignDispatchModal(){} function updateDispatch(){} function reportsPage(){return 'reports'} function worldBattleReceiptHTML(){return ''} function showModal(){} function toast(){} function actResult(error){return !error} function render(){renderCount++} function centerWorld(x,y){centers.push({x,y})}
    var elements={},listeners=[],startButton={},modal={open:false,close(){this.open=false}},modalBody={dataset:{},querySelector(){return startButton}};
    document.querySelector=()=>null;document.getElementById=id=>elements[id]||null;document.addEventListener=(type,fn)=>listeners.push({type,fn});
  `);
  return e;
}
test('map route cards are a pure projection of actual route quotes, with unavailable controls disabled',()=>{
  const e=ui(loadGame()),g=e.Game;city(g,{hall:3,drill:2});g.state.army.archer=30;
  const before=JSON.stringify(g.state),routes=g.sandboxRoutes('field',{archer:30},'lin'),html=e.evaluate("sandboxRouteCardsHTML('field',{archer:30},'lin')");
  for(const r of routes){assert.ok(html.includes(r.name));assert.ok(html.includes(Number(r.seconds).toFixed(2)+'秒'));assert.ok(html.includes('耗粮 '+r.foodCost));}
  assert.match(html,/data-action="sandboxRouteChoice"/);assert.match(html,/aria-pressed="true"/);assert.equal(JSON.stringify(g.state),before);
});
test('dispatch recalculates the selected route and passes the same task/route options to the actual pre-check',()=>{
  const e=ui(loadGame()),g=e.Game;city(g,{hall:3,drill:2});g.state.army.archer=30;g.state.stats.victories=1;
  e.evaluate(`elements['dispatch-mode']={dataset:{node:'field'},value:'raid'};elements['dispatch-general']={value:'lin'};
    for(const id of ['sandbox-dispatch-routes','sandbox-general-role','sandbox-dispatch-task','campaign-march-preview'])elements[id]={innerHTML:''};
    elements['dispatch-status']={innerHTML:'',classList:{toggle(){}}};modalBody.dataset.sandboxTask='supply';
    function dispatchArmy(){return {archer:30}} sandboxRouteSelections.set('field','detour');
  `);
  const before=JSON.stringify(g.state),quote=g.sandboxRouteQuote('field',{archer:30},'lin','detour');
  e.evaluate('sandboxDispatchRefresh()');
  const options=JSON.parse(e.evaluate('JSON.stringify(sandboxDispatchOptions())'));
  assert.deepEqual(options,{routeId:'detour',taskId:'supply'});
  const check=g.dispatchCheck('field','lin',{archer:30},'raid',options);
  assert.match(e.evaluate("elements['campaign-march-preview'].innerHTML"),new RegExp(String(quote.foodCost)));
  assert.ok(e.evaluate("elements['campaign-march-preview'].innerHTML").includes(Number(quote.seconds).toFixed(2)+'秒'));
  assert.equal(e.evaluate('startButton.disabled'),!!check.reason);assert.equal(JSON.stringify(g.state),before);
  e.evaluate("elements['dispatch-mode'].value='occupy';sandboxDispatchRefresh()");
  assert.equal(e.evaluate('sandboxDispatchOptions().taskId'),'');assert.match(e.evaluate("elements['sandbox-dispatch-task'].innerHTML"),/不计此项掠夺军务/);
});
test('zero soldiers show a real rejection without NaN route quotes or enabling march',()=>{
  const e=ui(loadGame());e.evaluate(`elements['dispatch-mode']={dataset:{node:'field'},value:'raid'};elements['dispatch-general']={value:'lin'};elements['campaign-march-preview']={innerHTML:''};elements['dispatch-status']={innerHTML:'',classList:{toggle(){}}};function dispatchArmy(){return {}};sandboxDispatchRefresh()`);
  assert.equal(e.evaluate('startButton.disabled'),true);assert.doesNotMatch(e.evaluate("elements['campaign-march-preview'].innerHTML"),/NaN|undefined/);
  assert.match(e.evaluate("elements['dispatch-status'].innerHTML"),/校场|士兵/);
});
test('virtual military battlefields keep their original dispatch rules rather than receiving a map route',()=>{
  const e=ui(loadGame()),g=e.Game;city(g,{drill:10});g.state.conquered.north_keep=true;g.state.army.archer=100;g.state.res.food=1000000;
  e.evaluate(`elements['dispatch-mode']={dataset:{node:'order_field_1'},value:'occupy'};elements['dispatch-general']={value:'lin'};elements['campaign-march-preview']={innerHTML:'original march quote'};elements['dispatch-status']={innerHTML:'',classList:{toggle(){}}};function dispatchArmy(){return {archer:100}};sandboxDispatchRefresh()`);
  assert.equal(e.evaluate('sandboxDispatchOptions()'),null);assert.equal(e.evaluate("elements['campaign-march-preview'].innerHTML"),'original march quote');assert.equal(e.evaluate('startButton.disabled'),false);
  assert.equal(g.dispatch('order_field_1','lin',{archer:100},'occupy',false,null,e.evaluate('sandboxDispatchOptions()')),null);
});
test('unknown intelligence never calls the defender renderer or reads an undisclosed army',()=>{
  const e=ui(loadGame());e.evaluate("enemyIntelHTML=()=>{throw Error('private army read')}");
  const before=JSON.stringify(e.Game.state),html=e.evaluate("sandboxIntelHTML(Game.getNode('field'))");
  assert.match(html,/守军未知/);assert.match(html,/侦察后/);assert.equal(JSON.stringify(e.Game.state),before);
});
test('the compact target keeps real scout, dispatch and detail actions together without disclosing unknown strength',()=>{
  const e=ui(loadGame()),before=JSON.stringify(e.Game.state),html=e.evaluate("sandboxTargetQuickHTML(Game.getNode('field'))");
  assert.match(html,/sandbox-quick-actions/);assert.match(html,/data-action="scoutPlan" data-id="field"/);assert.match(html,/data-action="campaignDispatch" data-id="field:raid"/);assert.match(html,/data-action="sandboxTargetExpand"/);assert.match(html,/守军未知/);assert.equal(JSON.stringify(e.Game.state),before);
});
test('task navigation selects its true map node and opening the map never mutates a save',()=>{
  const e=ui(loadGame());e.Game.state.stats.victories=1;const before=JSON.stringify(e.Game.state);e.evaluate('installSandboxUI()');
  e.evaluate("listeners.find(x=>x.type==='click').fn({target:{closest:()=>({dataset:{action:'sandboxTaskGo',id:'supply'},disabled:false})}})");
  assert.equal(e.evaluate('page'),'world');assert.equal(e.evaluate('selectedNode'),'field');assert.equal(e.evaluate('mapSheetOpen'),true);
  assert.deepEqual(JSON.parse(e.evaluate('JSON.stringify(centers[0])')),{x:e.Game.getNode('field').x,y:e.Game.getNode('field').y});assert.equal(JSON.stringify(e.Game.state),before);
});
test('task receipts only offer claiming after an actual ready record, and the browser dispatch forwards UI options',()=>{
  const e=ui(loadGame());e.Game.state.stats.victories=1;const tasks=e.Game.sandboxTasks();let html=e.evaluate('sandboxTaskCardsHTML(Game.sandboxTasks(),true)');assert.doesNotMatch(html,/data-action="sandboxTaskClaim"/);
  e.Game.state.sandboxCampaign.tasks.supply={status:'ready',at:e.now(),startedAt:e.now(),city:'capital',general:'lin'};
  html=e.evaluate('sandboxTaskCardsHTML(Game.sandboxTasks(),true)');assert.match(html,/data-action="sandboxTaskClaim" data-id="supply"/);assert.ok(tasks.some(t=>t.node==='field'));
  const app=fs.readFileSync(path.join(__dirname,'../app.js'),'utf8');assert.match(app,/siegeCommand\|\|null,typeof sandboxDispatchOptions==='function'\?sandboxDispatchOptions\(\):\{\}/);
});
test('claimed daily tasks display their actual next reset and completed one-time tasks offer no duplicate claim',()=>{
  const e=ui(loadGame()),html=e.evaluate(`sandboxTaskCardsHTML([{id:'supply',title:'护粮',description:'每日一次',cadence:'daily',reward:{food:600},status:'claimed',nextAt:123456},{id:'crossing',title:'夺渡',cadence:'once',reward:{food:1500},status:'claimed'}],true)`);
  assert.match(html,/今日已领/);assert.match(html,/北京时间 05:00 刷新 · 123456/);assert.doesNotMatch(html,/data-action="sandboxTaskClaim"/);
});
