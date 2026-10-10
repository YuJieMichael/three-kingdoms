const {seedLegacyWild}=require('./helpers/legacy-wild.cjs');
const {test}=require('node:test'),assert=require('node:assert/strict');
const {loadGame,city,cloneActiveSave}=require('./helpers/game.cjs');
const copy=x=>JSON.parse(JSON.stringify(x));
function fixture(line='zhaoyun',side='player'){
 const e=loadGame(931),g=e.Game,m=e.evaluate('BattleStratagems');
 const row=(id,pos)=>({id,initial:40,hp:40*g.units[id].hp,maxHp:40*g.units[id].hp,pos,stats:Object.fromEntries(['hp','atk','def','range','speed'].map(k=>[k,g.units[id][k]]))});
 const b={rules:3,round:0,length:4000,finished:false,player:[row('cavalry',1500),row('heavy',1000),row('archer',1400),row('spear',1200)],enemy:[row('cavalry',2500),row('heavy',3000),row('archer',2600),row('spear',2800)],orders:{},enemyOrders:{},log:[],generalSnapshot:{id:'fixture_player',wildLine:side==='player'?line:''},enemyGeneralSnapshot:{id:'fixture_enemy',wildLine:side==='enemy'?line:''}};
 for(const who of ['player','enemy'])for(const r of b[who])b[who==='player'?'orders':'enemyOrders'][r.id]={command:'hold',target:''};
 b.stratagem=m.create(b);return {e,g,m,b,side,foe:side==='player'?'enemy':'player',api:{units:g.units,log:(battle,text)=>battle.log.push(text)}};
}
function submit(f,action,side=f.side){const q=f.m.quote(f.b,side,action,f.api);assert.equal(q.ok,true,q.reason);const r=f.m.submit(f.b,side,action,q.key,f.api);assert.equal(r.ok,true,r.reason);return q;}
function begin(f,own={},foe={}){for(const [side,commands]of [[f.side,own],[f.foe,foe]])for(const [id,command]of Object.entries(commands))f.b[side==='player'?'orders':'enemyOrders'][id].command=command;f.b.round++;assert.equal(f.m.beginRound(f.b,{player:f.b.orders,enemy:f.b.enemyOrders},f.api).ok,true);}
function end(f){assert.equal(f.m.endRound(f.b,f.api).ok,true);assert.equal(f.m.valid(f.b,f.api),true);}
function move(f,side,id,to,forcedMove=false){const row=f.b[side].find(r=>r.id===id),from=row.pos;row.pos=to;return f.m.afterMove(f.b,side,row,from,{...f.api,forcedMove});}
function plan(f){return f.b.stratagem.plans.find(p=>p.side===f.side&&p.type!=='fire');}
function prepareCharge(f,unit='cavalry',target='spear'){submit(f,{type:'machao',unit,target});begin(f,{[unit]:'advance'},{[target]:'advance'});move(f,f.side,unit,f.b[f.side].find(r=>r.id===unit).pos+(f.side==='player'?300:-300));end(f);}

test('new identities come from wildLine and ordinary heroes cannot forge them with names or identity fields',()=>{
 const f=fixture();for(const line of ['zhaoyun','machao'])assert.equal(f.m.identity({wildLine:line}).id,line);
 for(const hero of [{id:'zhaoyun',name:'赵云'},{name:'马超',identity:'machao'},{wildLine:'ordinary',encounterIdentity:'huangzhong'},{id:'enemy_not_an_encounter',encounterIdentity:'huangzhong'}])assert.equal(f.m.identity(hero).id,'');
 const normal=fixture('');const before=copy(normal.b.stratagem);assert.equal(normal.m.quote(normal.b,'player',{type:'zhaoyun',unit:'cavalry',target:'archer'},normal.api).ok,false);assert.deepEqual(copy(normal.b.stratagem),before);
});

test('rules3 version1 records retain old three identities, including ordinary old Zhao Yun and Ma Chao',()=>{
 for(const line of ['zhaoyun','machao','huangzhong','warrior','strategist']){
  const f=fixture(line);f.b.stratagem.version=1;f.b.stratagem.identities.player={huangzhong:'huangzhong',warrior:'weiyan',strategist:'xushu'}[line]||'';
  assert.equal(f.m.valid(f.b,f.api),true);assert.equal(f.m.view(f.b).identity.id,f.b.stratagem.identities.player);
  if(['zhaoyun','machao'].includes(line)){assert.equal(f.m.quote(f.b,'player',{type:line,unit:'cavalry',target:line==='zhaoyun'?'archer':'spear'},f.api).ok,false);const bad=copy(f.b);bad.stratagem.identities.player=line;assert.equal(f.m.valid(bad,f.api),false);}
  submit(f,{type:'fire',unit:'archer',left:1900});begin(f);end(f);begin(f);end(f);assert.equal(f.b.stratagem.version,1);
 }
});

test('Zhao Yun quotes enforce light cavalry, another living ally, retreat room and a bounded support distance',()=>{
 const f=fixture(),action={type:'zhaoyun',unit:'cavalry',target:'archer'};assert.equal(f.m.quote(f.b,'player',action,f.api).ok,true);
 for(const bad of [{...action,unit:'heavy'},{...action,target:'cavalry'},{...action,target:'unknown'},{...action,freeAttack:true}]){const before=copy(f.b.stratagem);assert.equal(f.m.quote(f.b,'player',bad,f.api).ok,false);assert.deepEqual(copy(f.b.stratagem),before);}
 const ally=f.b.player.find(r=>r.id==='archer');ally.pos=0;assert.match(f.m.quote(f.b,'player',action,f.api).reason,/后退空间/);ally.pos=1000;assert.match(f.m.quote(f.b,'player',action,f.api).reason,/300/);ally.pos=1200;assert.equal(f.m.quote(f.b,'player',action,f.api).ok,true);
 ally.hp=0;assert.match(f.m.quote(f.b,'player',action,f.api).reason,/存活/);
});

test('Zhao Yun costs one point and one preparation attack, accelerates a real ally retreat once and spends its attack',()=>{
 for(const side of ['player','enemy']){
  const f=fixture('zhaoyun',side),unit=f.b[side].find(r=>r.id==='cavalry'),ally=f.b[side].find(r=>r.id==='archer');ally.pos=unit.pos+(side==='player'?-100:100);
  const q=submit(f,{type:'zhaoyun',unit:'cavalry',target:'archer'});assert.equal(q.cost,1);assert.equal(q.requiredOrder,'hold');begin(f);assert.equal(f.m.normalAttackAllowed(f.b,side,'cavalry'),false);end(f);begin(f,{cavalry:'hold',archer:'fallback'});
  const order=f.b.stratagem.orders[side].archer,override=f.m.movementOverride(f.b,side,ally,order,f.api);assert.equal(override.speedFactor,1.5);
  const before=ally.pos,distance=Math.floor(ally.stats.speed*override.speedFactor),hp=copy([...f.b.player,...f.b.enemy].map(r=>r.hp));move(f,side,'archer',before+(side==='player'?-distance:distance));assert.equal(plan(f).effectApplied,true);assert.equal(f.m.normalAttackAllowed(f.b,side,'archer'),false);assert.equal(f.m.movementOverride(f.b,side,ally,order,f.api).speedFactor,1);assert.equal(f.m.valid(f.b,f.api),true);assert.deepEqual(copy([...f.b.player,...f.b.enemy].map(r=>r.hp)),hp);assert.equal(f.b.stratagem.points[side],2);
  end(f);assert.equal(f.m.quote(f.b,side,{type:'zhaoyun',unit:'cavalry',target:'archer'},f.api).ok,false);
 }
});

test('Zhao Yun holding, distance, destruction and cancelled preparation leave no free movement or refunded point',()=>{
 for(const failure of ['riderAdvance','allyHold','distance','dead','cancel']){
  const f=fixture();submit(f,{type:'zhaoyun',unit:'cavalry',target:'archer'});if(failure==='cancel')assert.equal(f.m.cancel(f.b,'player',plan(f).id,f.api).ok,true);begin(f);assert.equal(f.m.normalAttackAllowed(f.b,'player','cavalry'),false);end(f);
  if(failure==='distance')f.b.player.find(r=>r.id==='archer').pos=1000;if(failure==='dead')f.b.player.find(r=>r.id==='cavalry').hp=0;
  begin(f,{cavalry:failure==='riderAdvance'?'advance':'hold',archer:failure==='allyHold'?'hold':'fallback'});const ally=f.b.player.find(r=>r.id==='archer');assert.equal(f.m.movementOverride(f.b,'player',ally,f.b.stratagem.orders.player.archer,f.api).speedFactor,1);assert.equal(plan(f).effectApplied,false);assert.equal(f.b.stratagem.points.player,2);end(f);
 }
});

test('forced displacement cannot prepare Ma Chao or consume Zhao Yun support and frozen orders govern responses',()=>{
 const f=fixture('machao');submit(f,{type:'machao',unit:'cavalry',target:'spear'});begin(f,{cavalry:'advance'},{spear:'advance'});move(f,'player','cavalry',1800,true);assert.equal(plan(f).preparedAdvance,false);end(f);assert.match(plan(f).reason,/没有实际前进/);
 const z=fixture();submit(z,{type:'zhaoyun',unit:'cavalry',target:'archer'});begin(z);end(z);begin(z,{cavalry:'hold',archer:'fallback'});move(z,'player','archer',1300,true);assert.equal(plan(z).effectApplied,false);
 // Mutable live orders do not override the frozen rider hold/ally fallback.
 z.b.orders.cavalry.command='advance';z.b.orders.archer.command='hold';assert.equal(z.m.movementOverride(z.b,'player',z.b.player.find(r=>r.id==='archer'),z.b.stratagem.orders.player.archer,z.api).speedFactor,1.5);
});

test('Ma Chao requires cavalry, a living enemy melee and actual advance in both rounds',()=>{
 const f=fixture('machao'),action={type:'machao',unit:'cavalry',target:'spear'};
 for(const bad of [{...action,unit:'archer'},{...action,target:'archer'},{...action,target:'missing'}])assert.equal(f.m.quote(f.b,'player',bad,f.api).ok,false);
 f.b.enemy.find(r=>r.id==='spear').pos=1400;assert.match(f.m.quote(f.b,'player',action,f.api).reason,/前进/);f.b.enemy.find(r=>r.id==='spear').pos=2800;
 submit(f,action);begin(f,{cavalry:'advance'},{spear:'advance'});end(f);assert.match(plan(f).reason,/没有实际前进/);
 const still=fixture('machao');prepareCharge(still);begin(still,{cavalry:'advance'},{spear:'advance'});const rider=still.b.player.find(r=>r.id==='cavalry');assert.equal(still.m.afterMove(still.b,'player',rider,rider.pos,still.api).length,0);assert.equal(plan(still).effectApplied,false);end(still);
});

test('Ma Chao pushes only once, capped by target speed and boundaries, sacrificing the response attack without damage',()=>{
 for(const side of ['player','enemy'])for(const unit of ['cavalry','heavy']){
  const f=fixture('machao',side);f.b[side].find(r=>r.id===unit).pos=side==='player'?1000:3000;f.b[f.foe].find(r=>r.id==='spear').pos=side==='player'?2000:2000;prepareCharge(f,unit);const target=f.b[f.foe].find(r=>r.id==='spear');target.stats.speed=501;target.pos=side==='player'?3950:50;begin(f,{[unit]:'advance'},{spear:'advance'});const before=copy([...f.b.player,...f.b.enemy].map(r=>r.hp));const origin=target.pos,events=move(f,side,unit,origin-(side==='player'?50:-50));assert.equal(events.length,1);assert.equal(events[0].kind,'forcedMove');assert.equal(Math.abs(target.pos-origin),50);assert.equal(plan(f).effectApplied,true);assert.equal(f.m.normalAttackAllowed(f.b,side,unit),false);assert.equal(f.m.valid(f.b,f.api),true);assert.deepEqual(copy([...f.b.player,...f.b.enemy].map(r=>r.hp)),before);assert.equal(f.m.afterMove(f.b,side,f.b[side].find(r=>r.id===unit),origin-(side==='player'?100:-100),f.api).length,0);end(f);
 }
 const odd=fixture('machao');prepareCharge(odd);odd.b.enemy.find(r=>r.id==='spear').stats.speed=301;begin(odd,{cavalry:'advance'},{spear:'advance'});const target=odd.b.enemy.find(r=>r.id==='spear'),origin=target.pos;move(odd,'player','cavalry',origin-50);assert.equal(target.pos-origin,150);assert.ok(Number.isInteger(target.pos));
});

test('ordinary hold counters Ma Chao completely; out of reach and another attack reservation prevent triggering',()=>{
 for(const failure of ['hold','distant','reserved']){
  const f=fixture('machao');prepareCharge(f);if(failure==='reserved')submit(f,{type:'fire',unit:'cavalry',left:1900});begin(f,{cavalry:'advance'},{spear:failure==='hold'?'hold':'advance'});const target=f.b.enemy.find(r=>r.id==='spear'),origin=target.pos;move(f,'player','cavalry',failure==='distant'?1900:origin-50);assert.equal(target.pos,origin);assert.equal(plan(f).effectApplied,false);assert.equal(f.b.stratagem.points.player,failure==='reserved'?0:2);end(f);
 }
});

test('Ma Chao respects the 200 cap and active fire clipping, with no damage or repeat after JSON reload',()=>{
 for(const fire of [false,true]){
  const f=fixture('machao');submit(f,{type:'machao',unit:'cavalry',target:'spear'});if(fire)submit(f,{type:'fire',unit:'archer',left:2850},'enemy');begin(f,{cavalry:'advance'},{spear:'advance'});move(f,'player','cavalry',1800);end(f);f.b.enemy.find(r=>r.id==='spear').stats.speed=501;begin(f,{cavalry:'advance'},{spear:'advance'});const target=f.b.enemy.find(r=>r.id==='spear'),hp=target.hp;move(f,'player','cavalry',2750);assert.equal(target.pos,fire?2849:3000);assert.equal(target.hp,hp);assert.equal(f.m.valid(f.b,f.api),true);
  const bad=copy(f.b);bad.stratagem.spent=[];assert.equal(f.m.valid(bad,f.api),false);f.b=copy(f.b);assert.equal(f.m.valid(f.b,f.api),true);assert.equal(f.m.normalAttackAllowed(f.b,'player','cavalry'),false);const before=copy(f.b);assert.equal(f.m.afterMove(f.b,'player',f.b.player.find(r=>r.id==='cavalry'),2700,f.api).length,0);assert.deepEqual(copy(f.b),before);end(f);
 }
});

test('JSON reload keeps exact new plans, costs and paid command idempotency; contradictory effect fields reject',()=>{
 for(const line of ['zhaoyun','machao']){
  const f=fixture(line),a={type:line,unit:'cavalry',target:line==='zhaoyun'?'archer':'spear'},q=submit(f,a);f.b=copy(f.b);assert.equal(f.m.valid(f.b,f.api),true);const before=copy(f.b.stratagem);assert.equal(f.m.submit(f.b,'player',a,q.key,f.api).replayed,true);assert.deepEqual(copy(f.b.stratagem),before);
  for(const corrupt of [b=>delete b.stratagem.plans[0].effectApplied,b=>b.stratagem.plans[0].effectApplied=true,b=>b.stratagem.plans[0].effectApplied='true',b=>b.stratagem.identities.player='',b=>b.stratagem.version=1,b=>b.stratagem.reservations=[]]){const bad=copy(f.b);corrupt(bad);assert.equal(f.m.valid(bad,f.api),false);}
  begin(f);if(line==='machao')move(f,'player','cavalry',1800);end(f);f.b=copy(f.b);assert.equal(f.m.valid(f.b,f.api),true);
 }
});

test('both new lessons exercise the real round resolver and keep official game state and storage unchanged',()=>{
 const e=loadGame(932),g=e.Game;assert.equal(g.save(),true);const before=copy(g.state),raw=g.exportStoredRaw();
 for(const [id,type,args]of [['rescue_retreat','zhaoyun',{unit:'cavalry',target:'archer'}],['charge_hold','machao',{unit:'cavalry',target:'spear'}]]){
  assert.equal(g.startTacticalLesson(id),null);const b=g.currentBattle(),q=g.battleTacticQuote(type,args,b);assert.equal(q.ok,true,q.reason);assert.equal(g.lessonTactic(type,args,q.key).ok,true);g.lessonRound();if(type==='zhaoyun')assert.equal(g.lessonOrder(b.player.findIndex(r=>r.id==='archer'),'fallback'),null);g.lessonRound();assert.equal(b.stratagem.plans.find(p=>p.type===type).effectApplied,true,id);assert.equal(g.lessonInfo().result.objectiveMet,true);assert.equal(b.finished,true);assert.deepEqual(copy(g.state),before);assert.equal(g.exportStoredRaw(),raw);assert.equal(g.endTacticalLesson(),null);
 }
});

test('portrait, real capture and recruitment bind both identities to owned heroes, including an old active rules3 save',()=>{
 const e=loadGame(933),g=e.Game,wild=e.evaluate('HeroSystem.wild');city(g,{hall:10,inn:3,tavern:10,drill:2});g.state.honors.noble=4;g.state.army.archer=7000;for(const id of Object.keys(g.resources))g.state.res[id]=3000000;e.evaluate('Math.random=()=>.999999');seedLegacyWild(e);assert.equal(wild.discover(),null);
 const owned=[],arrive=()=>{e.advance(Math.ceil(g.state.expedition.end-e.now())+1);assert.equal(g.startBattle(),null);},finish=()=>{for(let n=0;n<30&&!g.state.battle.finished;n++)g.battleRound();assert.equal(g.state.battle.finished,true);assert.equal(g.state.battle.result.won,true);assert.equal(g.validSave(g.state),true);},returned=()=>e.advance(Math.ceil(Math.max(g.state.expedition?.end||e.now(),...Object.values(g.state.cooldowns))-e.now())+1);
 for(const line of ['zhaoyun','machao']){
  const rumor=g.state.wildGenerals.rumors.find(r=>r.line===line);assert.ok(rumor);const portrait=wild.portraitQuote(g.state,line);assert.equal(wild.buyPortrait(line,portrait.key),null);g.setTactic('archer','advance');assert.equal(g.dispatch(rumor.node,'lin',{archer:2500},'raid'),null);arrive();assert.equal(g.battleTacticsView().identities.enemy.id,line);finish();assert.equal(g.state.battle.result.wildGeneral.status,'captured');returned();const recruit=wild.recruitQuote(g.state,rumor.id,'gold');assert.equal(recruit.reason,'');assert.equal(wild.recruit(rumor.id,'gold',recruit.key),null);owned.push({line,id:rumor.id});
 }
 for(const {line,id}of owned){
  g.setTactic('archer','advance');assert.equal(g.dispatch('field',id,{archer:30},'raid'),null);arrive();assert.equal(g.battleTacticsView().identity.id,line);assert.equal(g.validSave(g.state),true);
  if(line==='zhaoyun'){const legacy=cloneActiveSave(g.state);legacy.battle.stratagem.version=1;legacy.battle.stratagem.identities.player='';assert.equal(g.validSave(legacy),true);g.importSave(legacy);assert.equal(g.battleTacticsView().identity.id,'');assert.equal(g.submitBattleTactic('zhaoyun',{unit:'archer',target:'archer'}).ok,false);}
  finish();assert.equal(g.save(),true);g.init();assert.equal(g.validSave(g.state),true);assert.equal(g.state.battle.generalSnapshot.wildLine,line);returned();
 }
 assert.equal(g.heroIdentity(owned[0].id).id,'zhaoyun');assert.equal(g.heroIdentity(owned[1].id).id,'machao');
});
