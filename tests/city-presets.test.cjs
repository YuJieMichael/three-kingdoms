const {test}=require('node:test'),assert=require('node:assert/strict');
const {loadGame,city,cloneActiveSave}=require('./helpers/game.cjs');
const copy=x=>JSON.parse(JSON.stringify(x));
function draft(g){return copy(g.cityPresetQuote('grain').draft);}
function apply(g,d){return g.applyCityPreset(d,g.cityPresetQuote(d).key);}
test('old city saves gain paused presets; corrupt target levels and unknown fields reject',()=>{const e=loadGame(),g=e.Game,d=cloneActiveSave(g.state);delete d.cityPreset;for(const c of Object.values(d.realm.cities))delete c.data.cityPreset;const migrated=g.migrateSave(d);assert.equal(migrated.cityPreset.active,false);assert.equal(g.validSave(migrated),true);for(const change of [p=>p.buildings.hall=11,p=>p.plots.level=-1,p=>p.active='yes',p=>p.buildings.fake=2,p=>p.plots.counts.farm=40,p=>p.extra=true]){const bad=cloneActiveSave(migrated);change(bad.cityPreset);assert.equal(g.validSave(bad),false);}});
test('quotes are read only and preserve a level eight field even with different custom allocation',()=>{const {Game:g}=loadGame();city(g,{hall:8});g.state.plots[0]={type:'mine',level:8};const d=draft(g);d.buildings={};d.plots.counts={farm:39,lumber:0,quarry:0,mine:0};d.plots.level=2;const before=JSON.stringify(g.state),q=g.cityPresetQuote(d);assert.equal(JSON.stringify(g.state),before);assert.equal(q.tasks.some(t=>t.index===0),false);assert.equal(apply(g,d),null);assert.equal(g.state.plots[0].level,8);assert.equal(g.state.plots[0].type,'mine');assert.equal(g.state.buildQueue.some(t=>t.kind==='replace'),false);});
test('preset builds real empty fields with paid costs, retains custom targets across pause/resume',()=>{const e=loadGame(),g=e.Game,d=draft(g);d.buildings={};d.plots.level=1;d.plots.counts={farm:39,lumber:0,quarry:0,mine:0};const gold=g.state.res.gold,cost=g.plotCost(0,'farm');assert.equal(apply(g,d),null);const q=g.state.buildQueue[0];assert.equal(q.kind,'build');assert.equal(q.id,'farm');assert.equal(g.state.res.gold,gold-(cost.gold||0));assert.equal(g.state.res.wood,4400);assert.equal(g.pauseCityPreset(),null);e.advance(1,true);assert.equal(g.state.cityPreset.active,false);assert.equal(g.state.buildQueue.length,2);assert.equal(apply(g,d),null);assert.deepEqual(copy(g.state.cityPreset.plots.counts),d.plots.counts);assert.equal(g.validSave(g.state),true);});
test('presets build missing interior structures and pause competing automation without clearing its saved choices',()=>{const e=loadGame(),g=e.Game,d=draft(g);d.buildings={house:1};d.plots.counts={farm:1,lumber:0,quarry:0,mine:0};g.state.autoUpgrade=true;g.state.plotTemplate={id:'balanced',active:true,mode:'fill'};assert.equal(apply(g,d),null);assert.equal(g.state.autoUpgrade,false);assert.equal(g.state.plotTemplate.active,false);assert.equal(g.state.plotTemplate.id,'balanced');assert.equal(g.state.buildQueue[0].id,'house');assert.equal(g.state.buildQueue[0].kind,'build');assert.equal(g.setAutoUpgrade(true),null);assert.equal(g.state.cityPreset.active,false);});
test('stale preset key cannot spend, city switch keeps independent targets and offline never starts jobs',()=>{const e=loadGame(),g=e.Game,d=draft(g),q=g.cityPresetQuote(d);g.state.speed=60;assert.match(g.applyCityPreset(d,q.key),/变化/);e.evaluate("Game.state.conquered.yellow_qingshi=true;Game.state.towns.yellow_qingshi.morale=-5;Game.state.realm.cities.city_yellow_qingshi=CitySystem.empty(Game.state,Game.getNode('yellow_qingshi'),Date.now());");g.state.speed=1;assert.equal(apply(g,d),null);g.switchCity('city_yellow_qingshi');assert.equal(g.state.cityPreset.id,null);const before=JSON.stringify(g.state);g.cityPresetQuote('military');assert.equal(JSON.stringify(g.state),before);g.switchCity('capital');g.pauseCityPreset();g.state.cityPreset.active=true;g.save();e.offline(10000000);assert.equal(g.state.buildQueue.length,0);assert.equal(g.validSave(g.state),true);});
test('unaffordable preset waits and manual plot template takes ownership of automation',()=>{const {Game:g}=loadGame(),d=draft(g);g.state.res={food:0,wood:0,stone:0,iron:0,gold:0};assert.equal(apply(g,d),null);assert.equal(g.state.buildQueue.length,0);assert.match(g.cityPresetQuote(d).reason,/等待/);assert.equal(g.applyPlotTemplate('balanced','fill'),null);assert.equal(g.state.cityPreset.active,false);});
test('preset editor opens read-only, exposes every interior target and accepts real custom goals',()=>{const {ui}=require('./helpers/classic-ui.cjs'),e=ui(loadGame()),g=e.Game;assert.equal(e.evaluate('typeof cityPresetsModal'),'function');const before=JSON.stringify(g.state);e.evaluate("cityPresetsModal('grain')");assert.equal(JSON.stringify(g.state),before);const html=e.evaluate('dialog.body');assert.match(html,/data-preset-building="house"/);assert.match(html,/data-preset-building="hall"/);assert.match(html,/data-preset-plot="farm"/);e.evaluate(`form['city-preset-id']={value:'grain'};form['city-preset-plot-level']={value:'1'};document.querySelectorAll=selector=>selector==='[data-preset-building]'?[{dataset:{presetBuilding:'house'},value:'1'}]:[{dataset:{presetPlot:'farm'},value:'3'},{dataset:{presetPlot:'lumber'},value:'0'},{dataset:{presetPlot:'quarry'},value:'0'},{dataset:{presetPlot:'mine'},value:'0'}];handleCityPresetsAction('cityPresetReview','');handleCityPresetsAction('cityPresetApply','');`);assert.equal(g.state.cityPreset.buildings.house,1);assert.equal(g.state.cityPreset.plots.counts.farm,3);assert.equal(g.state.buildQueue[0].id,'house');assert.equal(e.evaluate("handleCityPresetsAction('otherFeature','')"),false);});
test('passive income between preview and click does not make a valid preset unusable',()=>{const e=loadGame(),g=e.Game,d=draft(g),q=g.cityPresetQuote(d);e.advance(10000,false);assert.equal(g.applyCityPreset(d,q.key),null);assert.ok(g.state.buildQueue.length>0);});
test('strict paused default validates independently of JSON property order',()=>{const {Game:g}=loadGame(),d=cloneActiveSave(g.state),p=d.cityPreset;d.cityPreset={plots:p.plots,buildings:p.buildings,active:p.active,id:p.id,version:p.version};d.realm.cities.capital.data.cityPreset=d.cityPreset;assert.equal(g.validSave(d),true);});
test('shared authority cannot apply or pause city presets and quote stays read-only',()=>{const e=loadGame(),g=e.Game;g.enterOnlineSession(JSON.parse(JSON.stringify(g.state)));const before=JSON.stringify(g.state),q=g.cityPresetQuote('balanced');assert.match(q.reason,/单机/);assert.match(g.applyCityPreset(q.draft,q.key),/单机/);assert.match(g.pauseCityPreset(),/单机/);assert.equal(JSON.stringify(g.state),before);});
test('same-kind goals use the highest existing building and do not charge for a lower duplicate',()=>{const e=loadGame(),g=e.Game;city(g,{hall:8,house:1});const low=g.state.cityLayout.indexOf('house'),high=g.state.cityLayout.indexOf(null);g.state.cityLayout[high]='house';g.state.cityLevels[high]=8;g.state.buildings.house=8;const d=draft(g);d.buildings={house:3};d.plots.counts={farm:0,lumber:0,quarry:0,mine:0};d.plots.level=1;const before=copy(g.state.res),q=g.cityPresetQuote(d);assert.equal(q.tasks.length,0);assert.equal(g.applyCityPreset(d,q.key),null);assert.deepEqual(copy(g.state.res),before);assert.equal(g.state.buildQueue.length,0);assert.equal(g.state.cityLevels[low],1);assert.equal(g.state.cityLevels[high],8);assert.equal(g.validSave(g.state),true);});
test('normal increasing clock continues paid preset jobs after the first batch finishes',()=>{const e=loadGame(),g=e.Game,d=draft(g);d.buildings={};d.plots.counts={farm:4,lumber:0,quarry:0,mine:0};d.plots.level=1;assert.equal(apply(g,d),null);const finish=Math.max(...g.state.buildQueue.map(q=>q.end)),wood=g.state.res.wood;e.advance(finish-e.now()+1,true);assert.equal(g.state.plots.filter(p=>p.type==='farm').length,2);assert.equal(g.state.buildQueue.length,2);assert.deepEqual(copy(g.state.buildQueue.map(q=>q.plot)),[2,3]);assert.equal(g.state.buildQueue.every(q=>q.kind==='build'&&q.paid.wood===300),true);assert.ok(g.state.res.wood<wood);assert.equal(g.validSave(g.state),true);e.advance(500,true);assert.equal(g.state.buildQueue.length,2);assert.deepEqual(copy(g.state.buildQueue.map(q=>q.plot)),[2,3]);});


const SAVE_KEY='sanguo-city-v2',WRITER_KEY=SAVE_KEY+'-writer',BACKUP_KEY=SAVE_KEY+'-backup';
function stored(e,key=SAVE_KEY){return e.evaluate(`localStorage.getItem(${JSON.stringify(key)})`);}
function storageFault(e,key){
  // Keep the real engine, pricing, serialization and storage map. Only the
  // browser write boundary fails, as with quota exceeded in localStorage.
  e.evaluate(`let originalPresetStorageWrite=localStorage.setItem;let presetPrimaryWrites=0;
    localStorage.setItem=(key,value)=>{if(key==='sanguo-city-v2')presetPrimaryWrites++;
      if(${key===null?'true':`key===${JSON.stringify(key)}`})throw Error('QuotaExceededError');
      return originalPresetStorageWrite(key,value);};`);
}
function restoreStorage(e){e.evaluate('localStorage.setItem=originalPresetStorageWrite');}
function presetFixture({kind='city',competitor='upgrade',secondCity=false}={}){
  const e=loadGame(),g=e.Game;
  if(secondCity){
    e.evaluate("Game.state.conquered.yellow_qingshi=true;Game.state.towns.yellow_qingshi.morale=-5;Game.state.realm.cities.city_yellow_qingshi=CitySystem.empty(Game.state,Game.getNode('yellow_qingshi'),Date.now());");
    assert.equal(g.switchCity('city_yellow_qingshi'),null);
    g.state.res={food:5000,wood:5000,stone:5000,iron:5000,gold:5000};
  }
  g.state.autoUpgrade=competitor==='upgrade';
  g.state.plotTemplate={id:'balanced',active:competitor==='plots',mode:'fill'};
  g.tick(e.now(),false);assert.equal(g.save(),true);assert.equal(g.validSave(g.state),true);
  const d=draft(g);
  if(kind!=='city'){d.buildings=kind==='mixed'?{house:1}:{};d.plots.level=1;d.plots.counts={farm:4,lumber:0,quarry:0,mine:0};}
  return {e,g,d};
}
for(const [label,key] of [['every storage',null],['writer lease',WRITER_KEY],['backup',BACKUP_KEY],['primary',SAVE_KEY]]){
  for(const kind of ['city','mixed','plots'])test(`applying ${kind} preset rolls back all city state when ${label} write fails`,()=>{
    const {e,g,d}=presetFixture({kind,competitor:kind==='plots'?'plots':'upgrade'}),before=copy(g.state),raw=stored(e),backup=stored(e,BACKUP_KEY),q=g.cityPresetQuote(d);
    storageFault(e,key);assert.match(g.applyCityPreset(d,q.key),/保存失败/);
    assert.deepEqual(copy(g.state),before,'resource charges, sites, queues, targets and competing automation all roll back');
    assert.equal(stored(e),raw,'the primary must remain the entire previous save');
    const afterBackup=stored(e,BACKUP_KEY);assert.ok(afterBackup===backup||afterBackup===raw,'backup must contain only complete pre-action progress');
    assert.equal(g.validSave(g.state),true);assert.equal(g.state.cityPreset,g.state.realm.cities[g.currentCityId()].data.cityPreset);
    assert.equal(g.state.res,g.state.realm.cities[g.currentCityId()].data.res);
    restoreStorage(e);g.init();assert.deepEqual(copy(g.state),before,'reloading after storage recovery has no failed-action residue');
    assert.equal(apply(g,d),null);assert.equal(g.state.buildQueue.length,2);assert.equal(g.validSave(g.state),true);
    if(kind==='city')assert.deepEqual(copy(g.state.res),{food:3900,wood:3500,stone:3875,iron:3900,gold:5000});
    if(kind==='plots')assert.deepEqual(copy(g.state.res),{food:4900,wood:4400,stone:4600,iron:4700,gold:5000});
  });
  test(`pausing preset restores running state when ${label} write fails`,()=>{
    const {e,g,d}=presetFixture();assert.equal(apply(g,d),null);const before=copy(g.state),raw=stored(e);storageFault(e,key);
    assert.match(g.pauseCityPreset(),/保存失败/);assert.deepEqual(copy(g.state),before);assert.equal(stored(e),raw);
    assert.equal(g.state.cityPreset.active,true);assert.equal(g.state.cityPreset,g.state.realm.cities.capital.data.cityPreset);
    restoreStorage(e);g.init();assert.deepEqual(copy(g.state),before);assert.equal(g.pauseCityPreset(),null);
    assert.equal(g.state.cityPreset.active,false);assert.deepEqual(copy(g.state.buildQueue),before.buildQueue);assert.deepEqual(copy(g.state.res),before.res);
    g.init();assert.equal(g.state.cityPreset.active,false);assert.equal(apply(g,d),null);
    assert.deepEqual(copy(g.state.buildQueue),before.buildQueue);assert.deepEqual(copy(g.state.res),before.res);assert.equal(g.validSave(g.state),true);
  });
}
for(const kind of ['city','mixed','plots'])test(`applying ${kind} preset commits both jobs together before any intermediate storage failure`,()=>{
  const {e,g,d}=presetFixture({kind}),previous=stored(e);
  e.evaluate(`let completePresetStorageWrite=localStorage.setItem;let primaryPresetPayloads=[];
    localStorage.setItem=(key,value)=>{if(key==='sanguo-city-v2'){primaryPresetPayloads.push(JSON.parse(value));
      if(primaryPresetPayloads.length>1||JSON.parse(value).buildQueue.length<2)throw Error('QuotaExceededError');}
      return completePresetStorageWrite(key,value);};`);
  assert.equal(apply(g,d),null,'a first-job-only write must not happen');assert.equal(g.state.buildQueue.length,2);
  assert.equal(JSON.parse(stored(e)).buildQueue.length,2);assert.equal(stored(e,BACKUP_KEY),previous);
  assert.equal(e.evaluate('primaryPresetPayloads.length'),1);assert.equal(g.validSave(g.state),true);
});
for(const action of ['apply','pause'])test(`${action} failure in the second city preserves both city scopes and retries cleanly`,()=>{
  const {e,g,d}=presetFixture({kind:'mixed',competitor:'plots',secondCity:true});
  if(action==='pause')assert.equal(apply(g,d),null);
  const before=copy(g.state),raw=stored(e);storageFault(e,SAVE_KEY);
  assert.match(action==='apply'?apply(g,d):g.pauseCityPreset(),/保存失败/);assert.deepEqual(copy(g.state),before);assert.equal(stored(e),raw);
  assert.equal(g.currentCityId(),'city_yellow_qingshi');assert.equal(g.state.cityPreset,g.state.realm.cities.city_yellow_qingshi.data.cityPreset);
  restoreStorage(e);g.init();assert.deepEqual(copy(g.state),before);
  assert.equal(action==='apply'?apply(g,d):g.pauseCityPreset(),null);const active=copy(g.state.realm.cities.city_yellow_qingshi.data);
  assert.deepEqual(copy(g.state.realm.cities.capital.data),before.realm.cities.capital.data);
  assert.equal(g.switchCity('capital'),null);assert.equal(g.state.cityPreset.active,false);assert.equal(g.state.buildQueue.length,0);
  assert.equal(g.switchCity('city_yellow_qingshi'),null);assert.deepEqual(copy(g.state.realm.cities.city_yellow_qingshi.data),active);
  assert.equal(g.state.buildQueue.length,2);assert.equal(g.state.cityPreset.active,action==='apply');assert.equal(g.validSave(g.state),true);
});

for(const [stage,key] of [['lease',WRITER_KEY],['backup',BACKUP_KEY],['primary',SAVE_KEY]])test(`initial preset batch avoids a second ${stage} write that could strand the first paid job`,()=>{
  const {e,g,d}=presetFixture({kind:'mixed'}),previous=stored(e);
  e.evaluate(`let stagedPresetStorageWrite=localStorage.setItem;let presetStageWrites=0;
    localStorage.setItem=(key,value)=>{if(key===${JSON.stringify(key)}&&++presetStageWrites===2)throw Error('QuotaExceededError');
      return stagedPresetStorageWrite(key,value);};`);
  assert.equal(apply(g,d),null,'one completed preset write must replace all intermediate commits');
  const saved=JSON.parse(stored(e));assert.equal(saved.buildQueue.length,2);assert.deepEqual(saved.buildQueue.map(q=>q.id),['house','farm']);
  assert.deepEqual(saved.res,{food:4850,wood:4200,stone:4675,iron:4750,gold:5000});
  assert.equal(stored(e,BACKUP_KEY),previous);assert.equal(e.evaluate('presetStageWrites'),1);
  e.evaluate('localStorage.setItem=stagedPresetStorageWrite');g.init();
  assert.equal(g.pauseCityPreset(),null);assert.equal(g.state.cityPreset.active,false);
});

test('failed resume retains the paused custom goal and paid jobs without a charge or reorder',()=>{
  const {e,g,d}=presetFixture({kind:'mixed'});assert.equal(apply(g,d),null);assert.equal(g.pauseCityPreset(),null);
  const before=copy(g.state),raw=stored(e);storageFault(e,SAVE_KEY);assert.match(apply(g,d),/保存失败/);
  assert.deepEqual(copy(g.state),before);assert.equal(stored(e),raw);restoreStorage(e);g.init();assert.deepEqual(copy(g.state),before);
  assert.equal(apply(g,d),null);assert.equal(g.state.cityPreset.active,true);assert.deepEqual(copy(g.state.cityPreset.buildings),{house:1});
  assert.deepEqual(copy(g.state.res),before.res);assert.deepEqual(copy(g.state.buildQueue),before.buildQueue);assert.equal(g.validSave(g.state),true);
});
