const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const {loadGame,city}=require('./helpers/game.cjs');
// Browsers queue a dialog's close event as a task. This fixture does the same, so the battle
// window wrapper in web-edition-ui.js sees close events in the order a phone browser delivers them.
function setup(){
  const e=loadGame(123),g=e.Game;city(g,{drill:1});g.state.army.archer=100;
  assert.equal(g.dispatch('field','lin',{archer:100},'raid'),null);e.advance(g.state.expedition.end-e.now()+1);
  e.evaluate(`
   globalThis.tasks=[];globalThis.setTimeout=()=>0;globalThis.clearTimeout=()=>{};globalThis.performance={now:()=>0};globalThis.queueMicrotask=f=>tasks.push(f);globalThis.Audio=class{pause(){}play(){return Promise.resolve();}};
   globalThis.window={matchMedia:()=>({matches:false,addEventListener(){}})};
   globalThis.uiListeners=[];document.addEventListener=(type,callback)=>uiListeners.push({type,callback});
   document.querySelectorAll=()=>[];document.querySelector=()=>null;document.body={classList:{contains:()=>false,add(){},remove(){}}};
   document.getElementById=()=>({classList:{add(){},remove(){}}});
   const element=()=>({innerHTML:'',querySelector:()=>null,querySelectorAll:()=>[],insertAdjacentHTML(){}});
   globalThis.modalBody=element();
   globalThis.modal={open:false,listeners:[],classList:{add(){},remove(){}},style:{setProperty(){}},querySelector:()=>null,addEventListener(type,f){if(type==='close')this.listeners.push(f);},
    showModal(){this.open=true;},close(){if(!this.open)return;this.open=false;tasks.push(()=>this.listeners.forEach(f=>f()));}};
   globalThis.OnlineClient={shared:()=>false,status:()=>({busy:false}),pending:()=>false};globalThis.page='world';globalThis.toastTimer=0;globalThis.renders=0;
   function S(){return Game.state;} function num(n){return String(n);} function esc(s){return String(s);} function resourceAmount(n){return String(n);}
   function btn(label,action,id=""){return '<button data-action="'+action+'" data-id="'+id+'">'+label+'</button>';}
   function troopPortrait(){return "";} function battleAutoEnabled(){return false;} function battleTimerText(){return "30 秒";} function battleOutcomeText(){return "";}
   function battleFailureHTML(){return "";} function battleCargoHTML(){return "";} function battleResourceHTML(){return "";} function battleDropsHTML(){return "";}
   function render(){renders++;} function showModal(title,body){modalBody.innerHTML=body;if(!modal.open)modal.showModal();}
   function toast(){} function tacticalLessonModal(){} function updateDispatch(){} function showInitialSaveState(){}
   function flush(){while(tasks.length)tasks.shift()();}
   function click(action){for(const l of uiListeners.filter(l=>l.type==='click'))l.callback({target:{closest:s=>s==='[data-action]'?{dataset:{action},disabled:false}:null}});}
  `);
  for(const file of ['combat-ui.js','web-edition-ui.js'])e.evaluate(fs.readFileSync(path.join(__dirname,'..',file),'utf8'));
  e.evaluate('installWebEditionUI()');
  return e;
}
const shownRound=e=>Number((e.evaluate('modalBody.innerHTML').match(/第 (\d+) \/ 30 回合/)||[])[1]);
test('entering a battle keeps the battle window live when the queued close event of its own reopen arrives late',()=>{
  const e=setup(),g=e.Game;
  // manualExpeditionBattle: start, render (window opens), close the previous dialog, render again.
  assert.equal(g.startBattle(),null);e.evaluate('render();modal.close();render();');
  assert.equal(e.evaluate('modal.open'),true);e.evaluate('flush()');
  for(let round=1;round<=3&&!g.state.battle.finished;round++){g.battleRound();e.evaluate('render();flush()');assert.equal(e.evaluate('modal.open'),true);assert.equal(shownRound(e),g.state.battle.round,'the open battle window must show the current round');}
});
test('closing the battle window keeps it closed while the battle continues on the page, and it can be reopened',()=>{
  const e=setup(),g=e.Game;assert.equal(g.startBattle(),null);e.evaluate('render();flush()');assert.equal(e.evaluate('modal.open'),true);
  e.evaluate('click("webBattleClose");flush();render();flush()');assert.equal(e.evaluate('modal.open'),false,'a closed battle window must not reopen on the next render');
  g.battleRound();e.evaluate('render();flush()');assert.equal(e.evaluate('modal.open'),false);
  assert.match(e.evaluate('battlePage()'),/data-action="webBattleWindow"[^>]*>打开战场窗口/,'the page battle view must offer a way back to the window');
  e.evaluate('click("webBattleWindow");flush()');assert.equal(e.evaluate('modal.open'),true);assert.equal(shownRound(e),g.state.battle.round);
  assert.doesNotMatch(e.evaluate('modalBody.innerHTML'),/打开战场窗口/,'the window itself has no reopen bar');
});
test('the reopen bar is only offered for an unfinished formal battle whose window is closed',()=>{
  const e=setup(),g=e.Game;assert.equal(g.startBattle(),null);e.evaluate('render();flush()');
  assert.doesNotMatch(e.evaluate('battlePage()'),/打开战场窗口/,'while the window is open the page shows the placeholder');
  e.evaluate('click("webBattleClose");flush()');assert.match(e.evaluate('battlePage()'),/打开战场窗口/);
  assert.doesNotMatch(e.evaluate('battlePage(S().battle,{practice:true})'),/打开战场窗口/);
  for(let i=0;i<30&&!g.state.battle.finished;i++)g.battleRound();assert.equal(g.state.battle.finished,true);assert.doesNotMatch(e.evaluate('battlePage()'),/打开战场窗口/);
});
