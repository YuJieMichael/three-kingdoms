const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const {loadGame,city}=require('./helpers/game.cjs'),{ready,begin}=require('./helpers/battlefield.cjs');
function ui(e){e.evaluate(`
 function S(){return Game.state}function num(n){return String(n)}function esc(n){return String(n)}function resourceAmount(n){return String(n)}
 function btn(label,action,id='',cls='',disabled=false){return '<button class="'+cls+'" data-action="'+action+'" data-id="'+id+'"'+(disabled?' disabled':'')+'>'+label+'</button>'}
 function troopPortrait(id){return '<span role="img" aria-label="'+Game.units[id].name+'"></span>'}
 function battleAutoEnabled(){return !!S().battle?.auto}function battleTimerText(){return '30 秒'}
 function battleOutcomeText(){return ''}function battleFailureHTML(){return ''}function battleCargoHTML(){return ''}function battleResourceHTML(){return ''}function battleDropsHTML(){return ''}
 var shown='',footer='',listeners=[];document.addEventListener=(type,fn)=>listeners.push({type,fn});document.getElementById=()=>null;
 function showModal(title,body,actions){shown=body;footer=actions||''}function render(){shown=battlePage()}function actResult(error){if(!error)render();return !error}function toast(){}
 var Audio=class{};
 `);for(const f of ['combat-ui.js','web-edition-ui.js'])e.evaluate(fs.readFileSync(path.join(__dirname,'..',f),'utf8'));return e;}
function regular(){const e=loadGame(123),g=e.Game;city(g,{drill:1});Object.assign(g.state.army,{archer:30,spear:5,shield:5});assert.equal(g.dispatch('field','lin',{archer:30,spear:5,shield:5},'raid'),null);e.advance(g.state.expedition.end-e.now()+1);assert.equal(g.startBattle(),null);return ui(e);}
test('regular mobile formation tabs expose the selected troop and target changes keep only that troop selected',()=>{
 const e=regular(),g=e.Game;e.evaluate('shown=battlePage()');assert.match(e.evaluate('shown'),/aria-pressed="true"[^>]*data-id="archer"|data-id="archer"[^>]*aria-pressed="true"/);
 e.evaluate(`listeners.find(x=>x.type==='click').fn({target:{closest:()=>({disabled:false,dataset:{action:'formationSelect',id:'spear'}})}})`);
 assert.match(e.evaluate('shown'),/data-id="spear"[^>]*aria-pressed="true"|aria-pressed="true"[^>]*data-id="spear"/);
 assert.match(e.evaluate('shown'),/battle-unit-stats/);assert.match(e.evaluate('shown'),/data-action="battleRound"/);
 e.evaluate(`listeners.find(x=>x.type==='change').fn({target:{dataset:{unitTarget:'spear'},value:'spear'}})`);
 assert.equal(g.state.battle.orders.spear.target,'spear');assert.equal(g.state.battle.round,0);
});
test('practice battle keeps manual round actions, warnings and pure reads in the compact presentation',()=>{
 const e=regular(),before=JSON.stringify(e.Game.state),h=e.evaluate("battlePage(Game.state.battle,{practice:true,basic:true,generalName:'先锋将',node:{name:'演练'},description:'保护弓兵'})");
 assert.match(h,/保护弓兵/);assert.match(h,/data-action="tacticalLessonRound"/);assert.match(h,/data-action="tacticalLessonSelect"[^>]*aria-pressed=/);
 assert.doesNotMatch(h,/data-action="battleAuto"/);assert.equal(JSON.stringify(e.Game.state),before);
});
test('campaign formation selection is read-only, preserves issued targets and falls back after selected troop dies',()=>{
 const e=ui(ready()),g=e.Game;g.state.tech.combat=1;begin(e,{militia:100,spear:50});assert.equal(g.enterBattlefieldNode('m1'),null);
 const before=JSON.stringify(g.state);e.evaluate('battlefieldUI.battle()');assert.match(e.evaluate('shown'),/data-action="battlefieldSelect"/);
 assert.match(e.evaluate('shown'),/<details[^>]*battlefield-log-detail/);assert.match(e.evaluate('footer'),/data-action="battlefieldRound"/);
 e.evaluate("handleBattlefieldAction('battlefieldSelect','spear')");assert.match(e.evaluate('shown'),/data-id="spear"[^>]*aria-pressed="true"/);assert.equal(JSON.stringify(g.state),before);
 assert.equal(g.battlefieldOrder('spear','hold','militia'),null);e.evaluate('battlefieldUI.battle()');assert.match(e.evaluate('shown'),/value="militia" selected/);
 const b=g.state.battlefields.run.battle;b.player.find(r=>r.id==='spear').hp=0;const dead=JSON.stringify(g.state);e.evaluate('battlefieldUI.battle()');
 assert.match(e.evaluate('shown'),/data-id="militia"[^>]*aria-pressed="true"/);assert.equal(JSON.stringify(g.state),dead);
 e.evaluate("handleBattlefieldAction('battlefieldRound','')");assert.equal(b.round,1);
});
