const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {loadGame,city}=require('./helpers/game.cjs');
const clone=value=>JSON.parse(JSON.stringify(value));

// Prepared city/troops are checkpoints. All movement timestamps, battle phases
// and recalls below come from public APIs; the timing UI may only read them.
function setup(seed=523){
 const e=loadGame(seed),g=e.Game;
 city(g,{hall:4,drill:4,house:4,tavern:6,inn:4});
 g.state.res.food=1000000;g.state.res.gold=1000000;
 g.state.army.archer=1500;
 e.evaluate(fs.readFileSync(path.join(__dirname,'..','deployment-ui.js'),'utf8'));
 return e;
}
function overview(e){return clone(e.evaluate('ArmyOverview.model(Game)'));}
function timing(e,row,now=e.now()){
 const before=JSON.stringify(e.Game.state),rowBefore=structuredClone(row);
 const result=clone(e.evaluate(`ArmyOverview.timing(${JSON.stringify(row)},${now})`));
 assert.equal(JSON.stringify(e.Game.state),before,'movement presentation must not tick, settle or mutate the save');
 assert.deepEqual(row,rowBefore,'the input army row must not change');
 return result;
}
function win(e,node='wild_31_32',returnAfterOccupy=false){
 const g=e.Game;
 assert.equal(g.dispatch(node,'lin',{archer:300},'occupy',returnAfterOccupy),null);
 e.advance(g.state.expedition.end-e.now()+1);
 assert.equal(g.startBattle(),null);
 assert.ok(g.state.battle.enemy.some(row=>row.hp>0));
 for(let i=0;i<30&&!g.state.battle.finished;i++)g.battleRound();
 assert.equal(g.state.battle.result.won,true);
 return g.state.battle.result;
}

test('army timing reads real saved travel timestamps and updates elapsed, remaining and progress without rounding drift',()=>{
 const e=setup(),g=e.Game;
 assert.equal(g.dispatch('wild_0_0','lin',{archer:100},'raid'),null);
 const row=overview(e).rows[0],duration=g.getNode(row.node).time*1000;
 assert.equal(duration,90000);
 assert.deepEqual(timing(e,row),{phase:'march',start:row.start,end:row.end,totalMs:duration,elapsedMs:0,remainingMs:duration,progress:0,arrived:false});
 e.advance(1234);
 const mid=timing(e,row);
 assert.equal(mid.elapsedMs,1234);assert.equal(mid.remainingMs,duration-1234);
 assert.equal(mid.progress,1234/duration*100);
 assert.equal(mid.elapsedMs+mid.remainingMs,mid.totalMs);
 assert.equal(mid.arrived,false);
 // Switching trial speed must not recalculate a route already in flight.
 assert.equal(g.setSpeed(60),null);
 assert.equal(timing(e,overview(e).rows[0]).totalMs,duration);
 assert.equal(g.state.expedition.end,row.end);
});

test('arrival clamps at the deadline, stays a waiting march, and never starts battle merely by reading the overview',()=>{
 const e=setup(),g=e.Game;
 assert.equal(g.dispatch('field','lin',{archer:100},'raid'),null);
 const row=overview(e).rows[0];
 const exact=timing(e,row,row.end),late=timing(e,row,row.end+65000);
 assert.equal(exact.remainingMs,0);assert.equal(exact.elapsedMs,exact.totalMs);assert.equal(exact.progress,100);assert.equal(exact.arrived,true);
 assert.deepEqual(late,exact);
 assert.equal(g.state.expedition.phase,'march');assert.equal(g.state.battle,null);
 e.advance(row.end-e.now());
 assert.equal(g.state.expedition.phase,'march');assert.equal(g.startBattle(),null);
 assert.equal(timing(e,overview(e).rows[0]),null,'combat must not keep an obsolete travel countdown');
});

test('checked occupation returns and manual garrison recalls use their own actual route durations',()=>{
 const selected=setup(),r=win(selected,'wild_31_32',true),g=selected.Game;
 const returning=overview(selected).rows[0],t=timing(selected,returning);
 assert.equal(r.returnAfterOccupy,true);assert.equal(returning.kind,'expedition');assert.equal(returning.phase,'return');
 assert.equal(t.totalMs,5000);assert.equal(t.arrived,false);
 selected.advance(1300);assert.equal(timing(selected,returning).remainingMs,3700);
 const stayed=setup();win(stayed);const s=stayed.Game;
 assert.equal(timing(stayed,overview(stayed).rows[0]),null,'stationed armies have no travel deadline');
 assert.equal(s.recallGarrison('wild_31_32'),null);
 const recalled=overview(stayed).rows[0];assert.equal(recalled.kind,'garrison');assert.equal(recalled.phase,'return');
 assert.equal(timing(stayed,recalled).totalMs,5000);
 stayed.advance(1251);assert.equal(timing(stayed,recalled).elapsedMs,1251);assert.equal(timing(stayed,recalled).remainingMs,3749);
 assert.equal(g.validSave(g.state),true);assert.equal(s.validSave(s.state),true);
});

test('reload and offline march preserve the original start and deadline while elapsed time advances',()=>{
 const e=setup(),g=e.Game;
 assert.equal(g.dispatch('wild_0_0','lin',{archer:100},'raid'),null);
 const start=clone(g.state.expedition),before=timing(e,overview(e).rows[0]);
 e.offline(15000);
 const mid=timing(e,overview(e).rows[0]);
 assert.equal(mid.start,start.start);assert.equal(mid.end,start.end);assert.equal(mid.totalMs,before.totalMs);
 assert.equal(mid.elapsedMs,15000);assert.equal(mid.remainingMs,75000);
 e.offline(80000);
 const arrived=timing(e,overview(e).rows[0]);
 assert.equal(arrived.arrived,true);assert.equal(arrived.remainingMs,0);assert.equal(arrived.progress,100);
 assert.equal(g.state.expedition.phase,'march');assert.equal(g.state.battle,null);
 assert.equal(g.validSave(g.state),true);
});

test('offline return settlement removes the route rather than leaving a zero-time army card or duplicating troops',()=>{
 const e=setup(),r=win(e,'wild_31_32',true),g=e.Game,before=g.state.army.archer;
 const deadline=g.state.expedition.end;
 e.offline(1200);
 assert.equal(timing(e,overview(e).rows[0]).remainingMs,3800);
 e.offline(deadline-e.now()+1);
 assert.equal(overview(e).rows.length,0);assert.equal(g.state.army.archer,before+r.back.archer);
 e.offline(1000);assert.equal(overview(e).rows.length,0);assert.equal(g.state.army.archer,before+r.back.archer);
 assert.equal(g.validSave(g.state),true);
});

test('independent marching and recalled rows retain distinct timing after choosing a different expedition',()=>{
 const e=setup(),g=e.Game;
 assert.equal(g.refreshInn(),null);for(const hero of [...g.state.innCandidates])assert.equal(g.recruit(hero.id),null);
 const heroes=g.state.customGenerals.map(hero=>hero.id);
 win(e);assert.equal(g.recallGarrison('wild_31_32'),null);
 assert.equal(g.dispatch('wild_0_0',heroes[0],{archer:100},'occupy',true),null);
 e.advance(2000);
 assert.equal(g.dispatch('wild_8_8',heroes[1],{archer:100},'occupy',false),null);
 assert.equal(g.selectExpedition('wild_8_8'),null);
 const rows=overview(e).rows;
 const recalled=timing(e,rows.find(row=>row.kind==='garrison'));
 const first=timing(e,rows.find(row=>row.node==='wild_0_0'));
 const second=timing(e,rows.find(row=>row.node==='wild_8_8'));
 assert.equal(recalled.remainingMs,3000);assert.equal(first.elapsedMs,2000);assert.equal(first.remainingMs,88000);
 assert.equal(second.elapsedMs,0);assert.equal(second.remainingMs,74000);
 assert.equal(rows.find(row=>row.node==='wild_0_0').returnAfterOccupy,true);
 assert.equal(rows.find(row=>row.node==='wild_8_8').returnAfterOccupy,false);
 assert.equal(g.validSave(g.state),true);
});

test('clock skew before departure clamps both progress and remaining without mutating a valid row',()=>{
 const e=setup(),row={kind:'expedition',phase:'march',start:e.now()+10000,end:e.now()+70000};
 const result=timing(e,row);
 assert.equal(result.elapsedMs,0);assert.equal(result.remainingMs,60000);assert.equal(result.progress,0);assert.equal(result.arrived,false);
});

test('nontravel phases and malformed timestamps produce no invented countdown',()=>{
 const e=setup(),row={phase:'march',start:e.now(),end:e.now()+1000};
 for(const phase of ['battle','stationed',undefined,'unknown'])assert.equal(timing(e,{...row,phase}),null);
 for(const invalid of [{start:null},{end:null},{start:'0'},{end:'1000'},{end:row.start},{end:row.start-1}])assert.equal(timing(e,{...row,...invalid}),null);
 for(const source of ['NaN','Infinity','-Infinity'])assert.equal(e.evaluate(`ArmyOverview.timing(${JSON.stringify(row)},${source})`),null);
 assert.equal(e.evaluate('ArmyOverview.timing(null,Date.now())'),null);
 assert.equal(e.evaluate('ArmyOverview.timing(undefined,Date.now())'),null);
 assert.equal(e.evaluate(`ArmyOverview.timing({phase:'march',start:NaN,end:${row.end}},Date.now())`),null);
});

test('duration display rounds up once at second, minute, hour and day boundaries',()=>{
 const e=setup(),format=ms=>e.evaluate(`ArmyOverview.formatDuration(${ms})`);
 for(const [ms,label]of [[0,'0 秒'],[1,'1 秒'],[999,'1 秒'],[1000,'1 秒'],[59000,'59 秒'],[59001,'1 分 0 秒'],[60001,'1 分 1 秒'],[3599001,'1 小时 0 分 0 秒'],[3600001,'1 小时 0 分 1 秒'],[86399001,'1 天 0 小时 0 分 0 秒'],[90061000,'1 天 1 小时 1 分 1 秒']])assert.equal(format(ms),label);
 for(const source of ['NaN','Infinity','undefined','-1000'])assert.equal(format(source),'0 秒');
});

test('arrival display includes the calendar date and second precision across midnight',()=>{
 const e=setup();
 const date=new Date(2026,9,5,23,59,59),next=new Date(date.getTime()+2000);
 const formatted=e.evaluate(`ArmyOverview.formatArrival(${date.getTime()})`),nextFormatted=e.evaluate(`ArmyOverview.formatArrival(${next.getTime()})`);
 assert.match(formatted,/2026/);assert.match(formatted,/23:59:59/);
 assert.match(nextFormatted,/00:00:01/);assert.notEqual(nextFormatted,formatted);
 for(const source of ['NaN','Infinity','undefined','null'])assert.equal(e.evaluate(`ArmyOverview.formatArrival(${source})`),'时间待确认');
});

test('rendered army states distinguish travel, arrival, combat, station and gathering with correct available actions',()=>{
 const e=setup(),g=e.Game;
 e.evaluate(`globalThis.S=()=>Game.state;globalThis.esc=value=>String(value);globalThis.num=value=>String(value);globalThis.btn=(label,action,id,classes,disabled)=>'<button data-action="'+action+'"'+(disabled?' disabled':'')+'>'+label+'</button>';`);
 const html=()=>e.evaluate('armyDeploymentHTML()');
 assert.equal(g.dispatch('wild_31_32','lin',{archer:300},'occupy'),null);
 let output=html();assert.match(output,/抵达剩余/);assert.match(output,/预计抵达/);assert.match(output,/role="progressbar"/);assert.match(output,/召回部队/);assert.doesNotMatch(output,/进入战斗<\/button>/);
 e.advance(g.state.expedition.end-e.now()+1);
 output=html();assert.match(output,/已抵达，等待进入战斗/);assert.match(output,/进入战斗<\/button>/);assert.doesNotMatch(output,/data-army-timing|role="progressbar"|抵达剩余/);
 assert.equal(g.startBattle(),null);
 output=html();assert.match(output,/交战中/);assert.match(output,/查看战斗/);assert.doesNotMatch(output,/data-army-timing|role="progressbar"|抵达剩余|返城剩余/);
 for(let i=0;i<30&&!g.state.battle.finished;i++)g.battleRound();assert.equal(g.state.battle.result.stationed,true);
 output=html();assert.match(output,/野地驻扎/);assert.match(output,/召回驻军/);assert.doesNotMatch(output,/data-army-timing|role="progressbar"|预计抵达|预计返城/);
 assert.equal(e.evaluate("HeritageSystem.startGather('wild_31_32')"),null);
 output=html();assert.match(output,/驻扎 · 采集中/);assert.match(output,/disabled>先结束采集/);assert.doesNotMatch(output,/data-army-timing|role="progressbar"|预计抵达|预计返城/);
 assert.equal(e.evaluate("HeritageSystem.cancelGather('wild_31_32')"),null);assert.equal(g.recallGarrison('wild_31_32'),null);
 output=html();assert.match(output,/返城剩余/);assert.match(output,/预计返城/);assert.match(output,/aria-label="返城进度"/);assert.match(output,/disabled>正在返城/);
 assert.equal(g.validSave(g.state),true);
});

test('live army refresh advances separate route fields and accessible bars while preserving the card subtree',()=>{
 const e=setup(),g=e.Game;assert.equal(g.refreshInn(),null);assert.equal(g.recruit(g.state.innCandidates[0].id),null);
 const hero=g.state.customGenerals[0].id;
 win(e);assert.equal(g.recallGarrison('wild_31_32'),null);assert.equal(g.dispatch('wild_0_0',hero,{archer:100},'raid'),null);
 const rows=overview(e).rows,initial=JSON.stringify(g.state);
 e.evaluate(`
  globalThis.liveBlocks=${JSON.stringify(rows)}.map(row=>{
   const parts={};
   for(const selector of ['[data-deployment-remaining]','[data-deployment-elapsed]','[data-deployment-percent]'])parts[selector]={textContent:'initial'};
   parts['[data-deployment-progress]']={style:{width:'initial'}};
   parts['[role="progressbar"]']={attributes:{},setAttribute(name,value){this.attributes[name]=value;}};
   const action={focused:true},arrival={textContent:ArmyOverview.formatArrival(row.end)};
   const block={dataset:{deploymentPhase:row.phase,deploymentStart:String(row.start),deploymentEnd:String(row.end)},parts,action,arrival,querySelector(selector){return parts[selector]||null;},replaceChildren(){throw new Error('Do not replace a live army card');}};
   Object.defineProperty(block,'innerHTML',{set(){throw new Error('Do not rebuild a live army card');}});
   return block;
  });
  document.querySelectorAll=selector=>{if(selector!=='[data-army-timing]')throw new Error('Unexpected selector');return liveBlocks;};
 `);
 e.evaluate(`refreshArmyDeploymentValues(${e.now()+1251});`);
 const snapshot=clone(e.evaluate(`liveBlocks.map(block=>({phase:block.dataset.deploymentPhase,start:block.dataset.deploymentStart,end:block.dataset.deploymentEnd,remaining:block.parts['[data-deployment-remaining]'].textContent,elapsed:block.parts['[data-deployment-elapsed]'].textContent,percent:block.parts['[data-deployment-percent]'].textContent,width:block.parts['[data-deployment-progress]'].style.width,aria:block.parts['[role="progressbar"]'].attributes,focused:block.action.focused,arrival:block.arrival.textContent}))`));
 const returning=snapshot.find(row=>row.phase==='return'),marching=snapshot.find(row=>row.phase==='march');
 assert.equal(returning.remaining,'4 秒');assert.equal(returning.elapsed,'1 秒');assert.equal(returning.percent,'25%');assert.equal(returning.aria['aria-valuenow'],'25');assert.equal(returning.aria['aria-valuetext'],'返城剩余 4 秒');
 assert.equal(marching.remaining,'1 分 29 秒');assert.equal(marching.elapsed,'1 秒');assert.equal(marching.percent,'1%');assert.equal(marching.aria['aria-valuetext'],'抵达剩余 1 分 29 秒');
 for(const row of snapshot){const saved=rows.find(source=>source.phase===row.phase);assert.equal(row.start,String(saved.start));assert.equal(row.end,String(saved.end));assert.equal(row.focused,true);assert.equal(row.arrival,e.evaluate(`ArmyOverview.formatArrival(${saved.end})`));assert.ok(parseFloat(row.width)>0&&parseFloat(row.width)<100);}
 e.evaluate(`refreshArmyDeploymentValues(${e.now()+100000});`);
 const ended=clone(e.evaluate(`liveBlocks.map(block=>({remaining:block.parts['[data-deployment-remaining]'].textContent,elapsed:block.parts['[data-deployment-elapsed]'].textContent,percent:block.parts['[data-deployment-percent]'].textContent,width:block.parts['[data-deployment-progress]'].style.width}))`));
 for(const row of ended){assert.equal(row.remaining,'0 秒');assert.equal(row.percent,'100%');assert.equal(row.width,'100%');}
 assert.equal(JSON.stringify(g.state),initial,'refreshing timer text must never settle an overdue route itself');
});
