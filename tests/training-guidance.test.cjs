const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs');
const {loadGame,city}=require('./helpers/game.cjs');
function ui(){
 const e=loadGame(),g=e.Game;city(g,{hall:2,drill:1,barracks:1});
 const source=fs.readFileSync(require('node:path').join(__dirname,'../app.js'),'utf8');
 e.evaluate(`let trainId='';const S=()=>Game.state;const num=v=>String(v);const costs=()=>'';const btn=(label,action,id,cls,disabled)=>'<button '+(disabled?'disabled':'')+'>'+label+'</button>';function showModal(title,body,actions){globalThis.trainingView=body+actions;}`);
 e.evaluate(source.slice(source.indexOf('function trainModal('),source.indexOf('function expeditionStrip(')));
 // DOM-only cost widgets are outside the shortage-message contract.
 e.evaluate('updateTrain=()=>{}');
 return {g,e,view(id='militia'){const before=JSON.stringify(g.state);e.evaluate(`trainModal(${JSON.stringify(id)})`);assert.equal(JSON.stringify(g.state),before,'opening training must not change the save');return e.evaluate('trainingView');}};
}
test('training with no housing points to housing rather than unusable population items',()=>{
 const u=ui(),html=u.view();assert.match(html,/民房/);assert.match(html,/建造|升级/);assert.doesNotMatch(html,/典民令/);
});
test('training with spare housing but no residents points to population recovery',()=>{
 const u=ui();city(u.g,{house:1});u.g.state.population=0;const html=u.view();assert.match(html,/人口增长/);assert.match(html,/典民令/);assert.doesNotMatch(html,/建造或升级民房/);
});
test('training at a full housing capacity consumed by workers points to housing',()=>{
 const u=ui();city(u.g,{house:1});u.g.state.population=u.g.maxPop();for(let i=0;i<10;i++)u.g.state.plots[i]={type:'farm',level:10};assert.equal(u.g.freePopulation(),0);assert.match(u.view(),/民房/);
});
test('training reports missing resources even when population is also blocked',()=>{
 const u=ui();u.g.state.res.wood=0;u.g.state.res.iron=0;const html=u.view();assert.match(html,/民房/);assert.match(html,/木材/);assert.match(html,/铁锭/);assert.match(html,/资源不足/);
});
test('training with enough population names only missing resources',()=>{
 const u=ui();city(u.g,{house:2});u.g.state.population=100;u.g.state.res.food=0;const html=u.view();assert.match(html,/粮食/);assert.doesNotMatch(html,/木材|石料|铁锭|黄金/,'充足资源不应列入短缺提示');assert.doesNotMatch(html,/民房|典民令/);assert.match(html,/disabled>开始训练/);
});
test('funded training shows no shortage notice and permits starting',()=>{
 const u=ui();city(u.g,{house:2});u.g.state.population=100;const html=u.view();assert.doesNotMatch(html,/民房|典民令|资源不足/);assert.match(html,/<button >开始训练/);
});
