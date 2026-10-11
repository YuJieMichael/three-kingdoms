const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const {loadGame,city,cloneActiveSave}=require('./helpers/game.cjs');
const plain=x=>JSON.parse(JSON.stringify(x));
function ui(e){e.evaluate(`var S=()=>Game.state,esc=String,num=String,duration=String,worldView={x:32,y:32},selectedNode='field',page='world',uiShown='',manualModalContext=null;function btn(n,a,id='',cls='',disabled=false){return '<button data-action="'+a+'" data-id="'+id+'"'+(disabled?' disabled':'')+'>'+n+'</button>'}function showModal(n,b,a){uiShown=n+b+a}var modal={close(){}},centers=[];function centerWorld(x,y){centers.push({x,y})}function worldNodeModal(){}function toast(){}function actResult(e){return !e}`);return e;}
test('staged training bounds level then distance then ID, caps five, and never touches hidden strength',()=>{
 const e=loadGame(),module=e.evaluate('WorldTargets');assert.equal(typeof module.training,'function');
 const s={conquered:{owned:true}},rows=[['z',1,1,0],['a',1,-1,0],['c',1,0,2],['b',1,0,3],['d',2,0,0],['e',2,0,1],['high',3,0,1],['adv4',4,0,0],['adv6',6,0,1],['fam7',7,0,0],['fam10',10,0,1],['zero',0,0,0],['over',11,0,0],['edge',4,6,6],['far',4,7,0],['owned',1,0,0],['ownCity',1,0,0],['hidden',1,0,0],['locked',1,0,0],['fortress',1,0,0],['campMarker',1,0,0]].map(([id,level,x,y])=>({id,name:id,level,x:x+32,y:y+32,wild:id!=='fortress',factionCamp:id==='campMarker',ownCity:id==='ownCity'}));
 const api={tile:()=>null,fixed:rows,visible:id=>id!=='hidden',blocked:n=>n.id==='locked',intel:()=> 'unknown'};
 const before=JSON.stringify(s),selected=plain(module.training(s,'beginner',{x:32,y:32},api));
 assert.deepEqual(selected.map(r=>r.id),['a','z','c','b','d']);assert.deepEqual(Object.keys(selected[0]).sort(),['distance','id','intel','level','name','reason']);
 for(const n of rows)for(const key of ['army','loot','power','risk'])Object.defineProperty(n,key,{get(){throw Error('hidden '+key)}});
 assert.deepEqual(plain(module.training(s,'beginner',{x:32,y:32},api)),selected);assert.equal(JSON.stringify(s),before);
 assert.deepEqual(plain(module.training(s,'advanced',{x:32,y:32},api)).map(r=>r.id),['adv4','edge','adv6']);assert.deepEqual(plain(module.training(s,'famous',{x:32,y:32},api)).map(r=>r.level),[7,10]);
 assert.deepEqual(plain(module.training(s,'bad',{x:32,y:32},api)),[]);assert.deepEqual(plain(module.training(s,'beginner',{x:64,y:32},api)),[]);
});
test('real stages and stale intel are pure, enemy army poisoning leaves public selection unchanged and legacy nearby/favorites stable',()=>{
 const e=loadGame(),g=e.Game;assert.equal(typeof g.trainingTargets,'function');g.state.raided.field=true;g.state.scouted.wood={at:e.now()-3600000,level:5};g.setTargetFavorite('wood',true);const target=g.trainingTargets('beginner')[0];g.state.scouted[target.id]={at:e.now()-3600000,level:5};
 const before=JSON.stringify(g.state),near=plain(g.nearbyTargets('training')),fav=plain(g.targetFavorites()),rows=plain(g.trainingTargets('beginner'));
 assert.ok(rows.length>0);for(const stage of ['beginner','advanced','famous']){const result=g.trainingTargets(stage);assert.ok(result.length<=5);assert.ok(result.every(r=>!('army'in r)&&!('xp'in r)));}
 e.evaluate('Game.nodes.forEach(n=>n.army={militia:999999999})');assert.deepEqual(plain(g.trainingTargets('beginner')),rows);
 assert.equal(g.trainingTargets('beginner').find(r=>r.id===target.id)?.intel,'unknown');assert.equal(JSON.stringify(g.state),before);assert.deepEqual(plain(g.nearbyTargets('training')),near);assert.deepEqual(plain(g.targetFavorites()),fav);
});
test('training excludes owned, locked, cooldown, deployed and stationed targets, including other cities',()=>{
 const e=loadGame(),g=e.Game;assert.equal(typeof g.trainingTargets,'function');const target=g.trainingTargets('beginner')[0];
 g.state.conquered[target.id]=true;assert.ok(!g.trainingTargets('beginner').some(r=>r.id===target.id));delete g.state.conquered[target.id];
 g.state.cooldowns[target.id]=e.now()+60000;assert.ok(!g.trainingTargets('beginner').some(r=>r.id===target.id));delete g.state.cooldowns[target.id];
 g.state.expeditions.push({node:target.id});assert.ok(!g.trainingTargets('beginner').some(r=>r.id===target.id));g.state.expeditions=[];
 g.state.garrisons[target.id]={};assert.ok(!g.trainingTargets('beginner').some(r=>r.id===target.id));delete g.state.garrisons[target.id];
 g.state.realm.cities.other={id:'other',x:1,y:1,name:'测试城',data:{...g.state,expedition:{node:target.id},expeditions:[],garrisons:{}}};assert.ok(!g.trainingTargets('beginner').some(r=>r.id===target.id));delete g.state.realm.cities.other;
 assert.ok(!g.trainingTargets('advanced').some(r=>r.id==='fort'));assert.ok(!g.trainingTargets('famous').some(r=>r.id==='named_jiangling'));
});
test('stage chips render short real-flow cards; unknown scouts precede view and reads preserve state',()=>{
 const e=ui(loadGame()),g=e.Game,before=JSON.stringify(g.state);e.evaluate("worldTargetsModal('training')");
 for(const stage of ['beginner','advanced','famous'])assert.match(e.evaluate('uiShown'),new RegExp('data-action="worldTrainingStage" data-id="'+stage+'"'));
 e.evaluate("handleWorldTargetsAction('worldTrainingStage','advanced')");const html=e.evaluate('uiShown');assert.match(html,/进阶/);assert.ok((html.match(/<article>/g)||[]).length<=5);assert.match(html,/先侦察/);assert.ok(html.indexOf('data-action="scoutPlan"')<html.indexOf('data-action="worldTargetGo"'));assert.doesNotMatch(html,/胜率|预计经验|%/);assert.equal(JSON.stringify(g.state),before);
});
test('recovery link reads source-city wounded; blocked or shared links never change city, army, queue or resources',async()=>{
 const e=ui(loadGame()),g=e.Game;assert.equal(e.evaluate('typeof trainingRecoveryButton'),'function');g.state.warCare.wounded.militia=3;
 assert.match(e.evaluate("trainingRecoveryButton({sourceCity:'capital'})"),/data-action="trainingRecovery" data-id="capital"/);
 const before=JSON.stringify(g.state);e.evaluate("handleWorldTargetsAction('trainingRecovery','capital')");assert.match(e.evaluate('uiShown'),/3/);assert.match(e.evaluate('uiShown'),/data-action="warCare"/);assert.equal(JSON.stringify(g.state),before);
 g.releaseSaveSession();assert.ok(g.saveBlockReason());e.evaluate("handleWorldTargetsAction('worldTrainingStage','beginner');handleWorldTargetsAction('trainingRecovery','capital')");assert.equal(JSON.stringify(g.state),before);
 const shared=ui(loadGame()),sg=shared.Game;assert.equal(sg.enterOnlineSession(cloneActiveSave(sg.state)),null);const snapshot=JSON.stringify(sg.state);shared.evaluate("handleWorldTargetsAction('worldTrainingStage','advanced');handleWorldTargetsAction('trainingRecovery','capital')");assert.equal(JSON.stringify(sg.state),snapshot);assert.ok(sg.dispatchScout('field',1));assert.ok(sg.dispatch('field','lin',{militia:1}));assert.equal(JSON.stringify(sg.state),snapshot);await sg.leaveOnlineSession();
});

test('stage targets use paid timed scouting, display earned intel, and dispatch through ordinary frozen battle snapshots',()=>{
 const e=ui(loadGame()),g=e.Game;city(g,{drill:1});g.state.army.scout=1;g.state.army.militia=5;g.state.tech.scouting=1;
 const target=g.trainingTargets('beginner')[0],q=g.scoutQuote(target.id,1),food=g.state.res.food;
 assert.equal(q.reason,'');assert.equal(g.dispatchScout(target.id,1,q.key),null);assert.equal(g.state.res.food,food-q.cost.food);assert.equal(g.state.army.scout,0);assert.ok(!g.trainingTargets('beginner').some(r=>r.id===target.id));
 e.advance(q.seconds*1000);assert.equal(g.intel(target.id).precision,'types');e.advance(q.returnSeconds*1000);assert.equal(g.state.army.scout,1);assert.equal(g.trainingTargets('beginner').find(r=>r.id===target.id).intel,'types');
 e.evaluate("worldTargetsModal('training')");assert.match(e.evaluate('uiShown'),/查看情报与出征/);assert.equal(g.dispatch(target.id,'lin',{militia:5}),null);assert.equal(g.state.army.militia,0);assert.equal(g.state.expedition.army.militia,5);assert.deepEqual(plain(g.state.expedition.enemySnapshot),plain(g.attackInfo(target.id,'raid').army));
});
test('different-city recovery previews source wounded without silently selecting or spending in that city',()=>{
 const e=ui(loadGame()),g=e.Game;g.state.warCare.wounded.militia=2;
 const source={id:'source',name:'来源城',node:'wild_1_1',x:1,y:1,data:g.getCityState()};source.data.warCare.wounded.militia=7;g.state.realm.cities.source=source;
 const before=JSON.stringify(g.state);e.evaluate("handleWorldTargetsAction('trainingRecovery','source')");assert.match(e.evaluate('uiShown'),/当前伤兵 7 人/);assert.match(e.evaluate('uiShown'),/data-action="citySwitchConfirm" data-id="source"/);assert.doesNotMatch(e.evaluate('uiShown'),/data-action="warCare"/);assert.equal(JSON.stringify(g.state),before);
 g.releaseSaveSession();e.evaluate("handleWorldTargetsAction('trainingRecovery','source')");assert.match(e.evaluate('uiShown'),/data-action="citySwitchConfirm" data-id="source" disabled/);assert.equal(JSON.stringify(g.state),before);
});
test('app protection allows only the read links while blocking real scout, dispatch and city-switch confirmation',()=>{
 const e=ui(loadGame()),g=e.Game,app=fs.readFileSync(path.join(__dirname,'..','app.js'),'utf8'),start=app.indexOf("document.addEventListener('click',event=>{",app.indexOf('// Capture before every feature')),
 end=app.indexOf('},true);',start)+'},true);'.length;
 e.evaluate(`var captured=[],OnlineClient={status:()=>({busy:false})};document.addEventListener=(type,fn)=>captured.push(fn);`+app.slice(start,end));g.releaseSaveSession();const before=JSON.stringify(g.state);
 for(const action of ['worldTrainingStage','trainingRecovery','scoutPlan']){e.evaluate(`var stopped=false;captured[0]({target:{closest:()=>({disabled:false,dataset:{action:'${action}'}})},preventDefault(){stopped=true},stopImmediatePropagation(){stopped=true}})`);assert.equal(e.evaluate('stopped'),false);}
 for(const action of ['scoutDispatch','dispatch','citySwitchConfirm']){e.evaluate(`stopped=false;captured[0]({target:{closest:()=>({disabled:false,dataset:{action:'${action}'}})},preventDefault(){stopped=true},stopImmediatePropagation(){stopped=true}})`);assert.equal(e.evaluate('stopped'),true);}
 assert.equal(JSON.stringify(g.state),before);
});

test('map receipt and offensive report expose settled XP and recovery source, without changing the battle receipt',()=>{
 const e=ui(loadGame()),g=e.Game,r={id:e.now(),node:'field',general:'lin',sourceCity:'capital',won:true,round:2,mode:'raid',lost:{militia:2},wounded:{militia:3},back:{militia:5},woundedInHospital:true,xp:11};g.state.reports=[r];
 const grid=fs.readFileSync(path.join(__dirname,'..','grid-world.js'),'utf8'),start=grid.indexOf('function worldBattleReceiptHTML()'),end=grid.indexOf('function worldIntelSummaryHTML',start);e.evaluate(grid.slice(start,end));
 const before=JSON.stringify(g.state),html=e.evaluate('worldBattleReceiptHTML()');assert.match(html,/武将经验 \+11/);assert.match(html,/data-action="trainingRecovery" data-id="capital"/);
 const app=fs.readFileSync(path.join(__dirname,'..','app.js'),'utf8'),a=app.indexOf('function reportsPage()'),b=app.indexOf('function citySettings()',a);
 e.evaluate(`function battleFailureHTML(){return ''}function battleCargoHTML(){return ''}function battleResourceHTML(){return ''}function battleDropsHTML(){return ''}function webBattleReviewHTML(){return ''}`+app.slice(a,b));assert.match(e.evaluate('reportsPage()'),/data-action="trainingRecovery" data-id="capital"/);assert.equal(JSON.stringify(g.state),before);
});
test('all-nearby shortcut preserves the original distance list and favorite choices alongside stages',()=>{
 const e=ui(loadGame()),g=e.Game;g.setTargetFavorite('field',true);const before=JSON.stringify(g.state),near=g.nearbyTargets('training',{x:32,y:32});
 e.evaluate("handleWorldTargetsAction('worldTrainingStage','all')");const html=e.evaluate('uiShown');assert.match(html,/全部附近/);assert.equal((html.match(/<article>/g)||[]).length,near.length);assert.match(html,/本城弓兵基准/);
 e.evaluate("worldTargetsModal('favorites')");assert.match(e.evaluate('uiShown'),/data-id="field\|off\|targets"/);assert.equal(JSON.stringify(g.state),before);
});
