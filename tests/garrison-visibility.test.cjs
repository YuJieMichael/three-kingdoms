const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {loadGame,city}=require('./helpers/game.cjs');

// Prepared city/troops are fixtures; deployments, victories, recruitment,
// gathering, recall and save/reload all use the same public APIs as the UI.
function setup(seed=523){
 const e=loadGame(seed),g=e.Game,s=g.state;
 city(g,{hall:4,drill:4,tavern:6,inn:4,house:4});
 s.res.food=1000000;s.res.gold=1000000;s.army.archer=1500;
 assert.equal(g.refreshInn(),null);
 for(const candidate of [...s.innCandidates])assert.equal(g.recruit(candidate.id),null);
 e.evaluate(`document.addEventListener=(type,handler)=>{if(type==='click')globalThis.deploymentClick=handler;};`);
 e.evaluate(fs.readFileSync(path.join(__dirname,'..','deployment-ui.js'),'utf8'));
 assert.equal(g.validSave(s),true);
 return e;
}
function overview(e){
 const before=JSON.stringify(e.Game.state);
 const model=JSON.parse(JSON.stringify(e.evaluate('ArmyOverview.model(Game)')));
 assert.equal(JSON.stringify(e.Game.state),before,'reading the army overview must not settle or change a save');
 return model;
}
const sum=army=>Object.values(army).reduce((n,count)=>n+count,0);
function assertTotals(e){
 const g=e.Game,s=g.state,m=overview(e),held=e.evaluate('NPCDefense.heldArmy(Game.state)');
 assert.equal(m.city,sum(s.army));
 assert.equal(m.field,g.allExpeditions().reduce((n,entry)=>n+sum(entry.army),0));
 assert.equal(m.stationed,Object.values(s.garrisons).reduce((n,entry)=>n+sum(entry.army),0));
 assert.equal(m.defense,sum(held));
 assert.equal(m.total,m.city+m.field+m.stationed+m.defense);
 const actual=m.rows.filter(row=>['expedition','garrison'].includes(row.kind));
 assert.equal(actual.length,g.allExpeditions().length+Object.keys(s.garrisons).length);
 assert.equal(new Set(actual.map(row=>`${row.kind}:${row.node}`)).size,actual.length);
 assert.equal(actual.reduce((n,row)=>n+sum(row.army),0),m.field+m.stationed);
 return m;
}
function winOccupation(e,node,general,archers=300){
 const g=e.Game;
 assert.equal(g.dispatch(node,general,{archer:archers},'occupy'),null);
 e.advance(g.state.expedition.end-e.now()+1);
 assert.equal(g.startBattle(),null);
 for(let round=0;round<30&&!g.state.battle.finished;round++)g.battleRound();
 const result=g.state.battle.result;
 assert.equal(result.won,true);
 assert.equal(result.stationed,true);
 assert.equal(g.state.expedition,null);
 assert.equal(g.validSave(g.state),true);
 return result;
}

test('army overview keeps marching and returning troops separate from the city without counting queued training',()=>{
 const e=setup(),g=e.Game;
 let m=assertTotals(e);
 assert.equal(m.total,1500);assert.equal(m.city,1500);assert.equal(m.rows.length,0);
 // A real unfinished training job is not yet a standing army.
 city(g,{barracks:4,academy:4,smith:4});
 g.state.tech.training=4;g.state.tech.shooting=1;g.state.population=100;
 assert.equal(g.train('archer',4),null);
 assert.equal(assertTotals(e).total,1500);
 assert.equal(g.dispatch('field','lin',{archer:100},'raid'),null);
 m=assertTotals(e);
 assert.equal(m.city,1400);assert.equal(m.field,100);assert.equal(m.total,1500);
 assert.equal(m.rows[0].kind,'expedition');assert.equal(m.rows[0].phase,'march');
 assert.equal(m.rows[0].node,'field');assert.equal(m.rows[0].general,'lin');
 assert.equal(g.recall(),null);
 m=assertTotals(e);assert.equal(m.rows[0].phase,'return');assert.equal(m.field,100);
 e.advance(g.state.expedition.end-e.now()+1);
 m=assertTotals(e);assert.equal(m.field,0);assert.equal(m.city,1500);assert.equal(m.rows.length,0);
 assert.equal(g.validSave(g.state),true);
});

test('an actual wild occupation moves surviving troops into one visible garrison row',()=>{
 const e=setup(),g=e.Game,node='wild_31_32';
 assert.equal(g.dispatch(node,'lin',{archer:300},'occupy'),null);
 e.advance(g.state.expedition.end-e.now()+1);
 assert.equal(g.startBattle(),null);
 let m=assertTotals(e);assert.equal(m.field,300);assert.equal(m.stationed,0);assert.equal(m.rows[0].phase,'battle');
 for(let round=0;round<30&&!g.state.battle.finished;round++)g.battleRound();
 const r=g.state.battle.result;assert.equal(r.won,true);assert.equal(r.stationed,true);
 m=assertTotals(e);
 assert.equal(m.city,1200);assert.equal(m.field,0);assert.equal(m.stationed,sum(r.back));
 assert.equal(m.rows.length,1);assert.equal(m.rows[0].kind,'garrison');assert.equal(m.rows[0].node,node);
 assert.equal(m.rows[0].general,'lin');assert.equal(m.rows[0].phase,'stationed');
 assert.deepEqual(m.rows[0].army,JSON.parse(JSON.stringify(r.back)));
 assert.equal(g.generalBusy('lin'),true);
 assert.equal(g.validSave(g.state),true);
});

test('multiple wild garrisons and both primary and additional expeditions remain visible after selecting another army',()=>{
 const e=setup(),g=e.Game,heroes=[...g.state.customGenerals].map(hero=>hero.id);
 winOccupation(e,'wild_31_32','lin');
 winOccupation(e,'wild_33_32',heroes[0]);
 assert.equal(g.dispatch('field',heroes[1],{archer:100},'raid'),null);
 assert.equal(g.dispatch('wood',heroes[2],{archer:80},'raid'),null);
 let m=assertTotals(e);
 assert.equal(m.city,720);assert.equal(m.field,180);assert.equal(m.stationed,600);assert.equal(m.total,1500);
 assert.deepEqual(m.rows.map(row=>row.node).sort(),['field','wild_31_32','wild_33_32','wood'].sort());
 assert.equal(g.selectExpedition('wood'),null);assert.equal(g.recall(),null);
 m=assertTotals(e);assert.equal(m.field,180);assert.equal(m.rows.find(row=>row.node==='wood').phase,'return');
 assert.equal(m.rows.find(row=>row.node==='field').phase,'march');
 const saved=JSON.parse(JSON.stringify(g.state));
 g.importSave(saved);
 m=assertTotals(e);assert.equal(m.rows.length,4);assert.equal(m.total,1500);
 e.advance(g.state.expedition.end-e.now()+1);
 m=assertTotals(e);assert.equal(m.city,800);assert.equal(m.field,100);assert.equal(m.stationed,600);assert.equal(m.total,1500);
 assert.deepEqual(m.rows.map(row=>row.node).sort(),['field','wild_31_32','wild_33_32'].sort());
 e.advance(1000);assert.equal(assertTotals(e).total,1500);assert.equal(g.state.army.archer,800);
 assert.equal(g.validSave(g.state),true);
});

test('recalled garrisons stay visible during return and settle into the city exactly once across reload',()=>{
 const e=setup(),g=e.Game,node='wild_31_32';
 const result=winOccupation(e,node,'lin');
 const count=sum(result.back),before=g.state.army.archer;
 assert.equal(g.recallGarrison(node),null);
 assert.equal(g.recallGarrison(node),'部队已在返城途中');
 let m=assertTotals(e);assert.equal(m.stationed,count);assert.equal(m.field,0);assert.equal(m.rows[0].phase,'return');
 const returnEnd=g.state.garrisons[node].end;
 g.save();e.offline(1);
 m=assertTotals(e);assert.equal(m.stationed,count);assert.equal(g.state.army.archer,before);
 e.offline(returnEnd-e.now()+1);
 m=assertTotals(e);assert.equal(m.stationed,0);assert.equal(m.rows.length,0);assert.equal(g.state.army.archer,before+count);
 e.advance(1000);g.save();e.offline(1000);
 assert.equal(assertTotals(e).total,1500);assert.equal(g.state.army.archer,before+count);
 assert.equal(g.generalBusy('lin'),false);
 assert.equal(g.validSave(g.state),true);
});

test('older sparse garrison army saves migrate without hiding or duplicating their soldiers',()=>{
 const e=setup(),g=e.Game,node='wild_31_32';winOccupation(e,node,'lin');
 const older=JSON.parse(JSON.stringify(g.state));
 for(const [unit,count]of Object.entries(older.garrisons[node].army))if(count===0)delete older.garrisons[node].army[unit];
 g.importSave(older);
 const m=assertTotals(e);
 assert.equal(m.total,1500);assert.equal(m.stationed,300);assert.equal(m.rows.length,1);
 assert.deepEqual(Object.keys(g.state.garrisons[node].army).sort(),Object.keys(g.units).sort());
 assert.equal(g.validSave(g.state),true);
});

test('gathering garrisons remain visible and cannot be recalled until gathering is cancelled',()=>{
 const e=setup(),g=e.Game,node='wild_31_32';winOccupation(e,node,'lin');
 assert.equal(e.evaluate(`HeritageSystem.startGather('${node}')`),null);
 let m=assertTotals(e);assert.equal(m.stationed,300);assert.equal(m.rows[0].phase,'stationed');
 assert.equal(g.recallGarrison(node),'请先收获或取消采集，再召回驻军');
 assert.equal(g.state.garrisons[node].phase,'stationed');assert.equal(assertTotals(e).total,1500);
 assert.equal(e.evaluate(`HeritageSystem.cancelGather('${node}')`),null);
 assert.equal(g.recallGarrison(node),null);
 m=assertTotals(e);assert.equal(m.rows[0].phase,'return');assert.equal(m.stationed,300);
 assert.equal(g.validSave(g.state),true);
});

test('the overview counts formal city defense once and does not add a duplicate army for drills',()=>{
 const e=setup(),g=e.Game;
 assert.equal(g.startCityDefense(true),null);
 let m=assertTotals(e);assert.equal(m.city,1500);assert.equal(m.defense,0);assert.equal(m.total,1500);
 assert.equal(g.endDefenseDrill(),null);
 // Let the regular warning timer create a real incoming wave.
 g.state.stats.victories=1;g.tick(e.now(),false);
 e.advance(e.evaluate('NPCDefenseData.intervalMs')+1);
 assert.ok(g.state.cityDefense.incoming);
 e.advance(g.state.cityDefense.incoming.arriveAt-e.now()+1);
 assert.equal(g.startCityDefense(false),null);
 m=assertTotals(e);assert.equal(m.city,0);assert.equal(m.defense,1500);assert.equal(m.total,1500);
 g.save();e.offline(1);
 m=assertTotals(e);assert.equal(m.city,0);assert.equal(m.defense,1500);assert.equal(m.total,1500);
 assert.equal(g.validSave(g.state),true);
});

test('viewing the current battle navigates directly without selecting an army that is already fighting',()=>{
 const e=setup(),g=e.Game,node='wild_31_32';
 assert.equal(g.dispatch(node,'lin',{archer:300},'occupy'),null);
 e.advance(g.state.expedition.end-e.now()+1);
 assert.equal(g.startBattle(),null);
 assert.equal(g.state.expedition.phase,'battle');assert.equal(g.state.battle.finished,false);
 e.evaluate(`
  globalThis.S=()=>Game.state;
  globalThis.page='army';globalThis.selectedNode=null;
  globalThis.deploymentRenders=0;globalThis.deploymentCloses=0;globalThis.deploymentToasts=[];
  globalThis.render=()=>deploymentRenders++;
  globalThis.modal={close:()=>deploymentCloses++};
  globalThis.toast=message=>deploymentToasts.push(message);
 `);
 const before=JSON.stringify(g.state);
 e.evaluate(`deploymentClick({target:{closest(selector){if(selector!=='[data-action]')throw new Error('Unexpected selector');return {disabled:false,dataset:{action:'armyDeploymentBattle',id:'${node}'}};}}});`);
 assert.equal(e.evaluate('page'),'world');assert.equal(e.evaluate('selectedNode'),node);
 assert.equal(e.evaluate('deploymentRenders'),1);assert.equal(e.evaluate('deploymentCloses'),1);
 assert.equal(e.evaluate('deploymentToasts.length'),0);
 assert.equal(JSON.stringify(g.state),before,'opening a battle must not change its army or progress');
 // A stale button for another army still respects the active battle lock.
 e.evaluate(`page='army';selectedNode=null;deploymentClick({target:{closest(){return {disabled:false,dataset:{action:'armyDeploymentBattle',id:'field'}};}}});`);
 assert.equal(e.evaluate('page'),'army');assert.equal(e.evaluate('selectedNode'),null);
 assert.equal(e.evaluate('deploymentRenders'),1);assert.equal(e.evaluate('deploymentCloses'),1);
 assert.equal(e.evaluate('deploymentToasts[0]'),'请先完成当前战斗');
 assert.equal(g.state.battle.node,node);assert.equal(g.state.battle.finished,false);
 assert.equal(g.validSave(g.state),true);
});
