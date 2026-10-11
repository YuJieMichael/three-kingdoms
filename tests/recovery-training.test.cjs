const {test}=require('node:test'),assert=require('node:assert/strict');
const {loadGame,city,cloneActiveSave}=require('./helpers/game.cjs');
const copy=x=>JSON.parse(JSON.stringify(x));
function prepared(){const e=loadGame(),g=e.Game;city(g,{hall:10,house:10,barracks:4,drill:3});g.state.governor=null;g.state.tech.shooting=1;g.state.population=g.maxPop();for(const k of Object.keys(g.resources))g.state.res[k]=100000;return {...e,g};}
function target(g,n=800){const d={id:'archer',army:{archer:n}},q=g.trainingTemplateQuote(d);assert.equal(g.saveTrainingTemplate(d,q.key),null);}
function wounds(e,n=181){assert.equal(e.evaluate(`WarCare.admit(Game.state,'npc:'+Game.currentCityId()+':1',{archer:${n}},Date.now())`),null);}
function priority(g){assert.equal(typeof g.setRecoveryPriority,'function','恢复优先必须有事务入口');assert.equal(g.setRecoveryPriority(true),null);}

test('legacy target ignores 181 wounds while recovery-first pure view subtracts affordable wounds, never deployed soldiers',()=>{
 const e=prepared(),{g}=e;g.state.army.archer=619;target(g);g.setAutoHeal(true);wounds(e);assert.equal(g.trainingTemplateQuote().deficits.archer,181);
 priority(g);const before=JSON.stringify(g.state),q=g.trainingTemplateQuote(),v=g.recoveryView();assert.equal(q.deficits.archer,0);assert.equal(q.orders.length,0);assert.equal(v.recoverable.archer,181);assert.equal(v.rows.find(r=>r.id==='archer').healthy,619);assert.equal(v.rows.find(r=>r.id==='archer').queued,0);assert.equal(g.state.army.archer,619);assert.equal(JSON.stringify(g.state),before);
 e.evaluate('Game.state.expedition={army:{archer:1000}}');assert.equal(g.trainingTemplateQuote().deficits.archer,0);g.state.army.archer=500;assert.equal(g.trainingTemplateQuote().deficits.archer,119);
});
test('priority alone preserves paused flags and does not turn manual or delayed recovery into free soldiers',()=>{
 const e=prepared(),{g}=e;g.state.army.archer=619;target(g);wounds(e);priority(g);assert.equal(g.state.warCare.autoHeal,false);assert.equal(g.state.trainingTemplate.active,false);assert.equal(g.recoveryView().paused,true);assert.equal(g.recoveryView().recoverable.archer,0);let q=g.trainingTemplateQuote();assert.equal(q.deficits.archer,181);assert.equal(g.fillTrainingTemplate(q.key),null);assert.equal(g.state.army.archer,619);assert.equal(g.state.trainQueue[0].count,181);assert.equal(g.state.warCare.wounded.archer,181);
 const medical=g.warCareQuote('archer',10),gold=g.state.res.gold;assert.equal(g.healWounded('archer',10,medical.key).healed,10);assert.equal(g.state.res.gold,gold-medical.gold);assert.equal(g.state.army.archer,629);assert.equal(g.state.warCare.wounded.archer,171);
});
test('limited gold only offsets actually recoverable wounds and keeps salary and assistant gold',()=>{
 const e=prepared(),{g}=e;g.state.army.archer=619;target(g);g.setAutoHeal(true);wounds(e);priority(g);const salary=g.economyBudget().salaryReserve;g.state.automation.reserve.gold=salary+1000;const reserve=salary+1000,price=g.warCareQuote('archer',1).gold;g.state.res.gold=reserve+price*10;
 const v=g.recoveryView(),q=g.trainingTemplateQuote();assert.equal(v.reserve,reserve);assert.equal(v.recoverable.archer,10);assert.equal(q.deficits.archer,171);assert.equal(q.orders[0].count,171);assert.equal(g.state.army.archer,619);g.tick(e.now(),true);assert.equal(g.state.army.archer,629);assert.equal(g.state.warCare.wounded.archer,171);assert.equal(g.state.res.gold,reserve);assert.equal(g.trainingTemplateQuote().deficits.archer,171);
 g.state.res.gold=salary-1;assert.equal(g.recoveryView().recoverable.archer,0);assert.equal(g.trainingTemplateQuote().deficits.archer,171);
});
test('both automatic flags actually heal before recruiting and conserve the wound ledger',()=>{
 const e=prepared(),{g}=e;g.state.army.archer=619;target(g);priority(g);g.setAutoHeal(true);g.setTrainingTemplateEnabled(true);wounds(e);const gold=g.state.res.gold,price=g.warCareQuote('archer',1).gold;g.tick(e.now(),true);assert.equal(g.state.army.archer,800);assert.equal(g.state.warCare.wounded.archer,0);assert.equal(g.state.warCare.treated.archer,181);assert.equal(g.state.res.gold,gold-price*181);assert.equal(g.state.trainQueue.length,0);assert.equal(g.validSave(g.state),true);
});
test('manual healing quote reports salary impact but can explicitly spend into salary reserve',()=>{
 const e=prepared(),{g}=e;wounds(e,1);const budget=g.economyBudget();g.state.res.gold=budget.salaryReserve;const q=g.warCareQuote('archer',1);assert.equal(q.salaryImpact.warn,true);assert.ok(q.salaryImpact.goldHoursAfter<24);assert.equal(g.healWounded('archer',1,q.key).healed,1);assert.equal(g.state.army.archer,1);
});
test('new policy, manual treatment and auto-toggle restore the entire state when persistence fails',()=>{
 for(const action of ['priority','heal','auto']){const e=prepared(),{g}=e;wounds(e);target(g);g.save();const q=g.warCareQuote('archer',10),before=JSON.stringify(g.state);e.evaluate("localStorage.setItem=()=>{throw Error('full')}");const result=action==='priority'?(assert.equal(typeof g.setRecoveryPriority,'function'),g.setRecoveryPriority(true)):action==='heal'?g.healWounded('archer',10,q.key):g.setAutoHeal(true);assert.equal(typeof result,'string');assert.match(result,/存档|保存/);assert.equal(JSON.stringify(g.state),before,action);}
});
test('old policy migrates per city and malformed values are rejected in all city saves',()=>{
 const e=prepared(),{g}=e;priority(g);e.evaluate("Game.state.conquered.yellow_qingshi=true;var c=CitySystem.empty(Game.state,Game.getNode('yellow_qingshi'),Date.now());Game.state.realm.cities[c.id]=c;CitySystem.capture(Game.state)");g.switchCity('city_yellow_qingshi');assert.equal(g.state.warCare.recoveryPriority,false);assert.equal(g.state.warCare.wounded.archer,0);g.switchCity('capital');assert.equal(g.state.warCare.recoveryPriority,true);
 const old=cloneActiveSave(g.state);delete old.warCare.recoveryPriority;for(const c of Object.values(old.realm.cities))delete c.data.warCare.recoveryPriority;const migrated=g.migrateSave(old);assert.equal(migrated.warCare.recoveryPriority,false);assert.equal(migrated.realm.cities.city_yellow_qingshi.data.warCare.recoveryPriority,false);assert.equal(g.validSave(migrated),true);
 for(const value of ['yes',1,null,{}]){for(const id of ['capital','city_yellow_qingshi']){const bad=cloneActiveSave(g.state);bad.realm.cities[id].data.warCare.recoveryPriority=value;if(id==='capital')bad.warCare.recoveryPriority=value;assert.equal(g.validSave(bad),false);}}
 const before=JSON.stringify(g.state);assert.ok(g.setRecoveryPriority('yes'));assert.equal(JSON.stringify(g.state),before);
});
test('legacy offline and multi-city queues still finish without creating new training orders',()=>{
 const e=prepared(),{g}=e;target(g,10);g.setTrainingTemplateEnabled(true);g.tick(e.now(),true);assert.equal(g.state.trainQueue[0].count,10);e.evaluate("Game.state.conquered.yellow_qingshi=true;var c=CitySystem.empty(Game.state,Game.getNode('yellow_qingshi'),Date.now());Game.state.realm.cities[c.id]=c;CitySystem.capture(Game.state)");g.switchCity('city_yellow_qingshi');assert.equal(g.state.warCare.recoveryPriority,false);e.offline(3600000);assert.equal(g.state.trainQueue.length,0);g.switchCity('capital');assert.equal(g.state.army.archer,10);assert.equal(g.state.trainQueue.length,0);assert.equal(g.state.trainingTemplate.active,true);
});
test('training plan optional recovery map defaults to legacy and subtracts local wounded only when supplied',()=>{
 const e=prepared(),{g}=e;g.state.army.archer=619;target(g);const api="{population:9999,limit:2,requirement:()=>'',cost:()=>({food:1}),seconds:()=>1}";
 assert.equal(e.evaluate(`TrainingTemplates.plan(Game.state,{army:{archer:800}},${api}).deficits.archer`),181);assert.equal(e.evaluate(`TrainingTemplates.plan(Game.state,{army:{archer:800}},{...${api},recoverable:{archer:181}}).deficits.archer`),0);
});
test('training mobile preview exposes priority checkbox, healthy, queued, recoverable and deficit separately',()=>{
 const e=prepared(),{g}=e;g.state.army.archer=619;target(g);g.setAutoHeal(true);wounds(e);priority(g);e.evaluate(`function esc(x){return String(x)} function num(x){return String(x)} function btn(){return ''} var shown=''; function showModal(n,b){shown=b} var manualModalContext=null;trainingTemplatesModal();`);const html=e.evaluate('shown');assert.match(html,/type="checkbox"[^>]*id="training-recovery-priority"|id="training-recovery-priority"[^>]*type="checkbox"/);assert.match(html,/健兵 619/);assert.match(html,/排队 0/);assert.match(html,/可恢复 181/);assert.match(html,/缺口 0/);
 g.setAutoHeal(false);e.evaluate('trainingTemplatesModal()');assert.match(e.evaluate('shown'),/自动治疗已暂停/);
});
test('one ordered medical budget is shared across wounded types and held back from gold-cost training',()=>{
 const e=prepared(),{g}=e;g.setAutoHeal(true);priority(g);e.evaluate("WarCare.admit(Game.state,'npc:capital:1',{militia:2,archer:3},Date.now())");const reserve=g.economyBudget().salaryReserve;g.state.res.gold=reserve+72;const v=g.recoveryView();assert.equal(v.recoverable.militia,2);assert.equal(v.recoverable.archer,1);assert.equal(v.gold,72);
 const plan=e.evaluate("TrainingTemplates.plan(Game.state,{army:{archer:10}},{population:99,limit:2,requirement:()=>'',cost:(id,n)=>({gold:n*10}),seconds:()=>1,salaryReserve:Game.economyBudget().salaryReserve,recoverable:Game.recoveryView().recoverable,recoveryGold:Game.recoveryView().gold})");assert.equal(plan.deficits.archer,9);assert.equal(plan.orders.length,0);g.tick(e.now(),true);assert.equal(g.state.army.militia,2);assert.equal(g.state.army.archer,1);assert.equal(g.state.res.gold,reserve);
});
test('failed manual action also rolls back settlement done before its payment',()=>{
 const e=prepared(),{g}=e;wounds(e,10);g.save();const q=g.warCareQuote('archer',10),before=JSON.stringify(g.state);e.evaluate("Date.now=()=>1791194405000;localStorage.setItem=()=>{throw Error('full')}");assert.match(g.healWounded('archer',10,q.key),/存档|保存/);assert.equal(JSON.stringify(g.state),before);
});
test('mobile priority change preserves unsaved target, toggles only this policy and rejects stale city',()=>{
 const e=prepared(),{g}=e;target(g);e.evaluate(`function esc(x){return String(x)} function num(x){return String(x)} function btn(){return ''} function showModal(){} var manualModalContext=null;function actResult(e){return !e} function toast(){};trainingTemplatesModal();document.querySelectorAll=()=>[{dataset:{trainingUnit:'archer'},value:'900'}];document.getElementById=()=>({innerHTML:''});`);
 assert.equal(e.evaluate("trainingTemplatesChange({target:{id:'training-recovery-priority',dataset:{recoveryCity:'capital'},checked:true}})"),true);assert.equal(g.state.warCare.recoveryPriority,true);assert.equal(g.state.trainingTemplate.army.archer,800);assert.equal(e.evaluate('trainingTemplateDraft.army.archer'),900);assert.equal(g.state.warCare.autoHeal,false);assert.equal(g.state.trainingTemplate.active,false);
 e.evaluate("trainingTemplatesChange({target:{id:'training-recovery-priority',dataset:{recoveryCity:'other'},checked:false}})");assert.equal(g.state.warCare.recoveryPriority,true);
});
test('expected recovery at the soldier count boundary matches actual automatic treatment',()=>{
 const e=prepared(),{g}=e;g.setAutoHeal(true);priority(g);wounds(e,2);g.state.army.archer=Number.MAX_SAFE_INTEGER-1;assert.equal(g.recoveryView().recoverable.archer,1);g.tick(e.now(),true);assert.equal(g.state.army.archer,Number.MAX_SAFE_INTEGER);assert.equal(g.state.warCare.wounded.archer,1);
});
