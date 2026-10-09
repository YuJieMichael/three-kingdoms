'use strict';
// Handbook tables are in manual-data.js. Trial economy formulas and combat coefficients are documented in RULES.md.
const Game = (() => {
  const KEY = 'sanguo-city-v2';
  // Income follows real time; the trial clock only speeds population and queues.
  const ECONOMY_OUTPUT_FACTOR=.7,RAID_LOOT_FACTOR=1.3;
  // A Yellow Turban city pays its gold once per occupation victory, then refreshes after an hour.
  const YELLOW_GOLD_REFRESH_MS=3600000;
  const resources = {food:{name:'粮食',icon:'穗'},wood:{name:'木材',icon:'木'},stone:{name:'石料',icon:'石'},iron:{name:'铁锭',icon:'铁'},gold:{name:'黄金',icon:'金'}};
  const buildings=ManualData.buildings,units=ManualData.units;
  const cityIds=Object.keys(buildings).filter(id=>!['farm','lumber','quarry','mine'].includes(id));
  const plotTypes={farm:{resource:'food',tech:'plant',color:'#9cab6e'},lumber:{resource:'wood',tech:'logging',color:'#78a289'},quarry:{resource:'stone',tech:'mining',color:'#aab4ae'},mine:{resource:'iron',tech:'smelting',color:'#b99a7d'}};
  const PLOT_COUNT=39;
  const newPlots=()=>Array.from({length:PLOT_COUNT},()=>({type:null,level:0}));
  const newPlotTemplate=()=>({id:null,active:false,mode:'fill'});
  const templateValid=p=>!!p&&typeof p==='object'&&!Array.isArray(p)&&Object.keys(p).length===3&&(p.id===null||PlotTemplateData.templates.some(t=>t.id===p.id))&&typeof p.active==='boolean'&&(!p.active||p.id!==null)&&['fill','replace'].includes(p.mode);
  const generals = [
    {id:'lin',name:'林朔',title:'乡勇统领',type:'枪',atk:64,def:58,pol:48,desc:'熟悉乡间地势，以长枪方阵守住阵线。',bonus:'spear'},
    {id:'su',name:'苏砚',title:'随军谋士',type:'策',atk:48,def:72,pol:78,desc:'善理内政，率军时以稳健守势减少损失。',bonus:'shield'},
    {id:'yan',name:'严秋',title:'弓马游侠',type:'弓',atk:78,def:48,pol:42,desc:'游走于山林，擅长寻找敌军弓阵的空隙。',bonus:'archer'}
  ];
  const nodes = [
    {id:'field',name:'河畔荒田',terrain:'field',x:24,y:73,level:1,desc:'溃散的乡勇盘踞河岸，夺回粮田可增加粮食产量。',army:{spear:18,archer:7},loot:{food:330,wood:90,gold:80},bonus:{food:.2},reward:'粮食产量 +20%',time:10},
    {id:'wood',name:'青竹林',terrain:'forest',x:29,y:34,level:1,desc:'林中匪兵轻装上阵，带上弓箭兵压制敌军。',army:{spear:22,archer:8},loot:{wood:350,food:130,gold:90},bonus:{wood:.2},reward:'木材产量 +20%',time:14},
    {id:'pass',name:'白石隘口',terrain:'mountain',x:62,y:64,level:2,desc:'盾兵封锁隘口。集中兵力，避免分散攻击。',army:{shield:32,spear:20,archer:12},loot:{stone:410,iron:180,gold:170},bonus:{stone:.2},reward:'石料产量 +20%',time:18},
    {id:'camp',name:'黄巾营寨',terrain:'camp',x:66,y:27,level:2,desc:'弓兵依托营寨防守，轻骑兵能快速绕过前排。',army:{spear:30,archer:35,shield:12},loot:{food:380,wood:240,iron:160,gold:230},reward:'解救武将 · 严秋',time:22,capture:'yan'},
    {id:'mine',name:'赤铁山',terrain:'mountain',x:83,y:49,level:3,desc:'骑兵巡守矿脉，长枪兵是攻取这里的关键。',army:{cavalry:30,shield:25,archer:25},loot:{iron:580,stone:200,gold:280},bonus:{iron:.25},reward:'铁锭产量 +25%',time:24},
    {id:'fort',name:'古渡县城',terrain:'fort',x:49,y:13,level:4,desc:'县城守军兵种齐全。扩充兵力与武将等级后，再发起总攻。',army:{shield:70,spear:55,archer:65,cavalry:18},loot:{food:1100,wood:750,stone:600,iron:480,gold:900},reward:'占领县城 · 开启第二章',time:30},
    ...ChapterData.allNodes(),
    ...YellowCityData.allNodes()
  ];
  const WORLD_SIZE=64,home={x:32,y:32};
  const landmarks={field:{x:29,y:35},wood:{x:29,y:29},pass:{x:36,y:34},camp:{x:37,y:28},mine:{x:40,y:32},fort:{x:34,y:23},...Object.fromEntries([...ChapterData.allNodes(),...YellowCityData.allNodes()].map(n=>[n.id,{x:n.x,y:n.y}]))};
  const fixedSites=nodes.filter(n=>!n.openCity).map(n=>landmarks[n.id]);
  const nodeSite=(n,context=state)=>n.openCity?(context?.openCitySites?.[n.id]||landmarks[n.id]):landmarks[n.id];
  const terrainTypes={
    plain:{name:'平地',icon:'平',resource:'food',color:'#86976a'},
    grass:{name:'草原',icon:'草',resource:'food',color:'#83985e'},
    forest:{name:'森林',icon:'林',resource:'wood',color:'#496e54'},
    hill:{name:'荒漠',icon:'漠',resource:'stone',color:'#999d7a'},
    mountain:{name:'山地',icon:'山',resource:'iron',color:'#828c83'},
    lake:{name:'湖泊',icon:'湖',resource:'food',color:'#638d86'},
    swamp:{name:'沼泽',icon:'泽',resource:'food',color:'#617b67'}
  };
  const hash=(x,y)=>{let n=Math.imul(x+419,374761393)^Math.imul(y+733,668265263);n=Math.imul(n^(n>>>13),1274126177);return (n^(n>>>16))>>>0;};
  function legacyWildTile(x,y,context=state,override=null){
    const seed=override?.seed??hash(x,y),district=hash(Math.floor(x/4),Math.floor(y/4))%100,river=Math.abs(x-(15+Math.round(4*Math.sin(y/7))));
    const type=override?.type||(river<1?'lake':district<19?'forest':district<35?'mountain':district<48?'hill':district<61?'swamp':district<80?'grass':'plain');
    const cfg=terrainTypes[type],distance=Math.hypot(x-home.x,y-home.y),base=Math.min(10,1+Math.floor(distance/5)+(seed%11===0?1:0));
    const id='wild_'+x+'_'+y,claim=context?.landClaims?.[id];
    const level=override?.level??(claim?Math.max(0,claim.level-Math.floor((Date.now()-claim.at)/86400000)):base);
    // Use the package's NPC value budget and conversion factor; stable seeded weights
    // adapt its random composition to a persistent browser map.
    const army={},budget=(ReferenceRules.fieldBudget[level]||0)*1.1,ids=Object.keys(ReferenceRules.npcValues);let allocated=0;
    ids.forEach((id,i)=>{const weight=(override&&!override.legacy?WildFields.weight(seed,i):hash(x+i*7,y+i*13))%(100-allocated||1);allocated+=weight;const count=Math.floor(budget*weight*.0078/ReferenceRules.npcValues[id]);if(count>0)army[id]=count;});
    if(level&&!Object.keys(army).length)army.militia=1;
    let bonus=0;if(level&&type!=='plain')bonus=(type==='lake'?5+level*3:type==='grass'?11+level:3+level*2)/100;
    const value=Object.entries(army).reduce((v,[id,n])=>v+Math.floor(n*ReferenceRules.npcValues[id]/.784),0),amount=Math.floor(value*(cfg.resource==='stone'?.5:cfg.resource==='iron'?.4:1)),bonusMap=bonus?{[cfg.resource]:bonus}:{},reward=type==='plain'?'平地 · 占领后可筑城':level?'占领后 '+resources[cfg.resource].name+'产量 +'+Math.round(bonus*100)+'%':'0 级野地 · 无产量加成';
    return {id,name:cfg.name+'野地 ('+x+','+y+')',type,terrain:type,x,y,level,wild:true,referenceArmy:true,desc:'野地守军按等级战力预算生成，各地配兵不同。先侦察，再选择掠夺或占领；运输兵决定能带回多少资源。',army,loot:{[cfg.resource]:amount},reward,bonus:bonusMap,time:Math.min(90,Math.max(8,Math.round(6+distance*2)))};
  }
  function wildTile(x,y,context=state){const override=WildFields.resolve(context,x,y,Date.now());return {...legacyWildTile(x,y,context,override),wildKey:WildFields.key(context,x,y,Date.now())};}
  function getWorldTile(x,y,context=state){
    if(!Number.isInteger(x)||!Number.isInteger(y)||x<0||y<0||x>=WORLD_SIZE||y>=WORLD_SIZE)return null;
    if(x===home.x&&y===home.y)return {id:'home',name:'青溪城',type:'home',x,y,level:context?.realm?.cities?.capital?.data.buildings.hall||context?.buildings.hall||1};
    const own=Object.values(context?.realm?.cities||{}).find(c=>!c.capital&&c.x===x&&c.y===y);
    if(own&&!nodes.some(n=>n.id===own.node))return {...wildTile(x,y,context),name:own.name,type:'fort',terrain:'fort',ownCity:own.id,wild:false};
    const named=nodes.find(n=>nodeSite(n,context).x===x&&nodeSite(n,context).y===y);
    if(named)return {...named,...nodeSite(named,context),type:named.terrain==='field'?'grass':named.terrain==='forest'?'forest':named.terrain==='mountain'?'mountain':named.terrain,wild:false};
    return wildTile(x,y,context);
  }
  function getNode(id,context=state){
    const order=WarOrders.getNode(id);if(order)return order;
    const named=nodes.find(n=>n.id===id);if(named)return {...named,...nodeSite(named,context),wild:false};
    if(typeof id!=='string')return null;
    const match=/^wild_(\d{1,2})_(\d{1,2})$/.exec(id);if(!match)return null;
    const x=Number(match[1]),y=Number(match[2]);if(id!==`wild_${x}_${y}`)return null;
    const tile=getWorldTile(x,y,context);return tile?.wild?tile:context?.realm?.cities?.[CitySystem.idFor(id)]?wildTile(x,y,context):null;
  }
  // Visibility follows completed visits. Existing later progress and deployed armies stay reachable.
  function landmarkReached(n){return n.chapter||['camp','fort'].includes(n.id)?!!state.conquered[n.id]:!!(state.raided[n.id]||state.conquered[n.id]);}
  function landmarkVisible(id){
    const n=nodes.find(n=>n.id===id);if(!n)return true;
    if(n.namedCity)return NamedCitySystem.visible(state,id);
    if(n.openCity)return true;
    if(state.conquered[id]||state.raided[id]||state.garrisons[id]||state.battle?.node===id||allExpeditions().some(e=>e.node===id))return true;
    if(n.chapter)return ChapterData.unlocked(state,n.chapter)&&!ChapterData.blocked(state,id);
    const first=nodes.filter(x=>!x.chapter&&!x.openCity),farthest=first.reduce((i,x,j)=>landmarkReached(x)?j:i,-1);
    return first.indexOf(n)<=farthest+1;
  }
  function nextLandmark(){const first=nodes.filter(n=>!n.chapter&&!n.openCity),farthest=first.reduce((i,n,j)=>landmarkReached(n)?j:i,-1);if(farthest+1<first.length)return first[farthest+1];for(const chapter of [2,3])if(ChapterData.unlocked(state,chapter)){const next=ChapterData.progress(state,chapter).next;if(next)return next;}return null;}
  const defaultCityLayout=()=>Array.from({length:36},(_,i)=>i===14?'hall':[15,20,21].includes(i)?'reserved':null);
  const starterGiftReward={...OnboardingData.gifts[0].resources};
  const supplies=(amount,gold)=>({food:amount,wood:amount,stone:amount,iron:amount,gold});
  const plotReached=(s,type,level=1)=>s.plots.some(p=>p.type===type&&p.level>=level);
  const missions = [
    {id:'gift',stage:'立城补给',title:'奉诏立城',desc:'领取新手补给第 1 阶（官府礼包），取得第一批建城物资',route:'gift',check:s=>s.starterGiftClaimed,reward:supplies(3000,8000)},
    {id:'house',stage:'立城补给',title:'安置百姓',desc:'完成 1 座 1 级民房，为招兵提供人口',route:'inner',check:s=>s.buildings.house>=1,reward:{food:5000,wood:4000,stone:3000,iron:2000,gold:6000}},
    {id:'farm',stage:'立城补给',title:'开垦农田',desc:'在城外完成 1 块农田',route:'outer',check:s=>plotReached(s,'farm'),reward:{food:6000,wood:4000,stone:3000,iron:2000,gold:5000}},
    {id:'lumber',stage:'立城补给',title:'伐木备料',desc:'在城外完成 1 块伐木场',route:'outer',check:s=>plotReached(s,'lumber'),reward:{food:3000,wood:7000,stone:3000,iron:2000,gold:5000}},
    {id:'quarry',stage:'立城补给',title:'采石筑城',desc:'在城外完成 1 块采石场',route:'outer',check:s=>plotReached(s,'quarry'),reward:{food:3000,wood:4000,stone:7000,iron:2000,gold:5000}},
    {id:'mine',stage:'立城补给',title:'冶铁备兵',desc:'在城外完成 1 块铁矿',route:'outer',check:s=>plotReached(s,'mine'),reward:{food:3000,wood:4000,stone:3000,iron:7000,gold:6000}},
    {id:'house2',stage:'立城补给',title:'扩充民居',desc:'将任意民房升至 2 级，人口上限达到 300',route:'inner',check:s=>s.buildings.house>=2,reward:supplies(5000,8000)},
    {id:'population',stage:'立城补给',title:'百姓归附',desc:'城中人口达到 100；已累计训练 20 名士兵也可完成',route:'inner',check:s=>s.population>=100||s.stats.trained>=20,reward:{food:8000,wood:4000,stone:3000,iron:4000,gold:10000}},
    {id:'hall2',stage:'立城补给',title:'立城之本',desc:'官府升至 2 级',route:'inner',check:s=>s.buildings.hall>=2,reward:supplies(8000,12000)},
    {id:'warehouse',stage:'立城补给',title:'储粮备战',desc:'完成 1 座仓库；任务奖励可暂时超出仓储上限',route:'inner',check:s=>s.buildings.warehouse>=1,reward:supplies(5000,8000)},
    {id:'drill',stage:'立城补给',title:'设立校场',desc:'完成 1 座校场，开启派兵出征',route:'inner',check:s=>s.buildings.drill>=1,reward:{food:10000,wood:6000,stone:4000,iron:6000,gold:10000}},
    {id:'barracks',stage:'立城补给',title:'军营落成',desc:'完成 1 座军营，开启义兵训练',route:'inner',check:s=>s.buildings.barracks>=1,reward:{food:12000,wood:10000,stone:4000,iron:8000,gold:12000}},
    {id:'trained20',stage:'整军出征',title:'操练乡勇',desc:'累计完成训练 20 名士兵',route:'army',check:s=>s.stats.trained>=20,reward:{food:6000,wood:5000,iron:4000,gold:8000}},
    {id:'spearReady',stage:'整军出征',title:'长枪列阵',desc:'军营达到 2 级，并研究 1 级战斗技巧，解锁长枪兵',route:'research',check:s=>s.buildings.barracks>=2&&s.tech.combat>=1,reward:{food:5000,wood:8000,iron:4000,gold:10000}},
    {id:'trained60',stage:'整军出征',title:'初成军势',desc:'累计完成训练 60 名士兵，开始依靠战利品发展',route:'army',check:s=>s.stats.trained>=60,reward:{food:4000,wood:3000,iron:3000,gold:12000}},
    {id:'firstVictory',stage:'征战里程',title:'首战告捷',desc:'赢得任意 1 场掠夺或占领战斗',route:'world',check:s=>s.stats.victories>=1,reward:{food:6000,wood:6000,iron:6000,gold:6000}},
    {id:'field',stage:'征战里程',title:'收复粮田',desc:'掠夺或占领河畔荒田并获胜',route:'world',check:s=>!!(s.raided.field||s.conquered.field),reward:{food:4000,wood:3000,iron:3000,gold:8000}},
    {id:'victories3',stage:'征战里程',title:'连战三捷',desc:'累计赢得 3 场战斗',route:'world',check:s=>s.stats.victories>=3,reward:{food:3000,iron:2000,gold:15000}},
    {id:'camp',stage:'征战里程',title:'兵临营寨',desc:'占领黄巾营寨，解救严秋',route:'world',check:s=>!!s.conquered.camp,reward:{food:4000,wood:3000,gold:18000}},
    {id:'victories10',stage:'征战里程',title:'威震乡野',desc:'累计赢得 10 场战斗',route:'world',check:s=>s.stats.victories>=10,reward:{food:5000,iron:3000,gold:25000}},
    {id:'fort',stage:'征战里程',title:'一县之主',desc:'占领古渡县城',route:'world',check:s=>!!s.conquered.fort,reward:{food:6000,wood:4000,stone:4000,iron:4000,gold:30000}}
  ];
  missions.push({id:'wildGeneral',stage:'征战里程',title:'招降野将',desc:'通过野地线索俘获并招降 1 名将领',route:'wildGenerals',check:s=>(s.wildGenerals?.recruited?.length||0)>0,reward:{food:3000,wood:3000,iron:3000}});
  RewardData.extendMissions(missions);
  ChapterData.extendMissions(missions);
  // Final values, after legacy reward scaling. Existing claims remain one-time.
  for(const [id,reward]of Object.entries({firstVictory:{food:6000,wood:6000,stone:6000,iron:6000,gold:6000},field:{food:4000,wood:3000,stone:4000,iron:3000,gold:8000},wildGeneral:{food:3000,wood:3000,stone:3000,iron:3000}}))missions.find(m=>m.id===id).reward=reward;
  const missionClaimed=(id,s=state)=>s.missionClaims.includes(id);
  const missionReady=(m,s=state)=>!missionClaimed(m.id,s)&&m.check(s);
  const currentMission=()=>missions.find(m=>missionReady(m))||missions.find(m=>!missionClaimed(m.id));
  const lessonEvidence=new WeakMap();
  let state,economyClock=null,realmSettling=false,onlineAuthority=false,offlineSnapshot=null,externalGeneralBusy=new Set(),lessonSession=null;
  const tacticsAvailable=()=>typeof BattleStratagems!=='undefined'&&!onlineAuthority&&typeof GAME_SERVER_RUNTIME==='undefined';
  const blankArmy = () => Object.fromEntries(Object.keys(units).map(k=>[k,0]));
  const initialTown=(n,owned=false)=>({morale:owned?-5:100,unrest:0,population:n.population||400});
  const initialTowns=(owned={})=>Object.fromEntries(nodes.filter(n=>n.terrain==='fort').map(n=>[n.id,initialTown(n,!!owned[n.id])]));
  const newState=()=>{const fresh=({version:2,manualSchema:1,last:Date.now(),speed:1,autoUpgrade:false,autoResearch:false,starterGiftClaimed:false,starterGiftVersion:0,missionSchema:2,missionClaims:[],res:{food:5000,wood:5000,stone:5000,iron:5000,gold:5000},buildings:Object.fromEntries(cityIds.map(id=>[id,id==='hall'?1:0])),cityLayout:defaultCityLayout(),cityLevels:Array.from({length:36},(_,i)=>i===14?1:0),tactics:Object.fromEntries(Object.keys(units).map(id=>[id,{command:id==='archer'?'advance':defaultOrder(id),target:''}])),plots:newPlots(),plotTemplate:newPlotTemplate(),army:blankArmy(),captives:blankArmy(),buildQueue:[],trainQueue:[],researchQueue:null,tech:Object.fromEntries(Object.keys(ManualData.technology).map(id=>[id,0])),generals:['lin','su'],generalLevels:{lin:1,su:1},generalXp:{lin:0,su:0},customGenerals:[],innCandidates:[],governor:'su',population:0,morale:80,unrest:0,tax:20,storageAllocation:{food:25,wood:25,stone:25,iron:25},gems:1000,inventory:{},buffs:{},itemCooldowns:{},civicCooldowns:{comfort:0,levy:0},trialGiftAt:0,ruler:'青溪城主',banner:'青',scouted:{},defenses:Object.fromEntries(Object.keys(ManualData.defenses).map(id=>[id,0])),defenseQueue:[],landClaims:{},conquered:{},raided:{},garrisons:{},towns:initialTowns(),yellowGold:{},openCitySites:YellowCityData.createSites(null,fixedSites),cooldowns:{},expedition:null,expeditions:[],battle:null,reports:[],mission:0,stats:{trained:0,victories:0},seen:[],tutorial:false});Progression.init(fresh);HeroSystem.init(fresh);HeritageSystem.init(fresh);NPCDefense.init(fresh);WarCare.init(fresh);GovernanceSystem.init(fresh);AutomationSystem.init(fresh);OnboardingSystem.init(fresh);WarOrders.init(fresh);GeneralGrowth.init(fresh);ScoutSystem.init(fresh);RegionalFront.init(fresh);HeroAdministration.init(fresh);CitySystem.init(fresh);NamedCitySystem.init(fresh);SupplyLines.init(fresh);fresh.prestige=0;return fresh;};
  function migrateSave(data){
    if(!data||![1,2].includes(data.version))return data;
    const migrationNow=Date.now(),old=JSON.parse(JSON.stringify(data));
    if(old.version===1){old.plots=newPlots();Object.keys(plotTypes).forEach((type,index)=>{old.plots[index]={type,level:old.buildings[type]||1};delete old.buildings[type];});old.buildQueue=old.buildQueue.map(q=>Object.hasOwn(plotTypes,q.id)?{...q,plot:Object.keys(plotTypes).indexOf(q.id),kind:'upgrade'}:q);}
    old.version=2;if(old.expeditions===undefined)old.expeditions=[];if(old.autoUpgrade===undefined)old.autoUpgrade=false;if(old.autoResearch===undefined)old.autoResearch=false;if(old.starterGiftClaimed===undefined)old.starterGiftClaimed=false;
    if(!old.manualSchema){
      const layout=old.cityLayout||Array.from({length:16},(_,i)=>({1:'house',5:'hall',10:'barracks',15:'wall'})[i]||null),fresh=defaultCityLayout(),levels=Array(36).fill(0);levels[14]=old.buildings.hall||1;
      for(let i=0;i<layout.length;i++){const id=layout[i];if(!id||id==='hall')continue;const target=fresh[i]===null?i:fresh.findIndex((x,j)=>x===null&&j!==14);fresh[target]=id;levels[target]=old.buildings[id]||1;}
      for(const q of old.buildQueue||[])if(q.plot===undefined){q.site=fresh.indexOf(q.id);q.kind='upgrade';}
      old.cityLayout=fresh;old.cityLevels=levels;old.manualSchema=1;
      const defaults=newState();for(const id of cityIds)if(old.buildings[id]===undefined)old.buildings[id]=0;
      for(const key of ['speed','tech','researchQueue','population','morale','unrest','storageAllocation','gems','inventory','buffs','itemCooldowns','trialGiftAt','ruler','banner','scouted','defenses','defenseQueue','customGenerals','innCandidates','landClaims'])if(old[key]===undefined)old[key]=defaults[key];
      old.population=Math.max(100,old.cityLevels.reduce((v,l,i)=>v+(old.cityLayout[i]==='house'?buildRecord('house',l).population||0:0),0));
      if(old.expedition&&old.expedition.node.startsWith('wild_')&&!old.battle){const match=/wild_(\d+)_(\d+)/.exec(old.expedition.node),x=Number(match[1]),y=Number(match[2]),distance=Math.hypot(x-home.x,y-home.y),seed=hash(x,y),level=Math.min(8,1+Math.floor(distance/7)+(seed%11===0?1:0)),type=wildTile(x,y,old).type,army={spear:10+level*8};if(type==='forest'||type==='lake')army.archer=6+level*6;else if(type==='mountain'||type==='hill')army.shield=5+level*7;else army.archer=4+level*3;if(level>=3)army.cavalry=level*3;old.expedition.enemySnapshot=army;}
    }
    while(old.plots.length<PLOT_COUNT)old.plots.push({type:null,level:0});
    if(old.plotTemplate===undefined)old.plotTemplate=newPlotTemplate();
    if(old.tactics===undefined)old.tactics={};for(const id of Object.keys(units)){if(old.army[id]===undefined)old.army[id]=0;if(old.tactics[id]===undefined)old.tactics[id]={command:defaultOrder(id),target:''};}
    if(old.raided===undefined)old.raided={...old.conquered};if(old.garrisons===undefined)old.garrisons={};if(old.towns===undefined)old.towns=initialTowns(old.conquered);
    if(old.towns&&typeof old.towns==='object'&&!Array.isArray(old.towns))for(const n of nodes.filter(n=>n.terrain==='fort'))if(old.towns[n.id]===undefined)old.towns[n.id]=initialTown(n,!!old.conquered[n.id]);
    if(old.openCitySites===undefined)old.openCitySites=YellowCityData.createSites(old,fixedSites);
    if(old.expedition){const e=old.expedition;if(e.orders===undefined)e.orders=JSON.parse(JSON.stringify(old.tactics));if(e.mode===undefined)e.mode='occupy';for(const id of Object.keys(units)){if(e.army[id]===undefined)e.army[id]=0;if(e.orders[id]===undefined)e.orders[id]={command:defaultOrder(id),target:''};}}
    for(const g of Object.values(old.garrisons)){for(const id of Object.keys(units))if(g.army[id]===undefined)g.army[id]=0;}
    for(const id of Object.keys(old.conquered))if(id.startsWith('wild_')&&!old.landClaims[id])old.landClaims[id]={at:Date.now(),level:getNode(id,old).level};
    if(old.battle){const b=old.battle;if(![2,3].includes(b.rules)){b.length=battleLength([...b.player,...b.enemy]);for(const r of [...b.player,...b.enemy]){const ratio=r.maxHp>0?r.hp/r.maxHp:0;r.maxHp=r.initial*units[r.id].hp;r.hp=Math.min(r.maxHp,Math.round(ratio*r.maxHp));r.pos=Math.max(0,Math.min(b.length,Math.round(r.pos/7*b.length)));}b.orders=Object.fromEntries(b.player.map(r=>[r.id,{command:defaultOrder(r.id),target:''}]));b.rules=2;}
      for(const r of [...b.player,...b.enemy])if(!r.stats)r.stats={hp:units[r.id].hp,atk:units[r.id].atk,def:units[r.id].def,range:units[r.id].range,speed:units[r.id].speed};
      if(b.mode===undefined)b.mode='occupy';if(b.siege===undefined)b.siege=false;if(b.militia===undefined)b.militia=0;if(b.finished){if(!b.result.mode)b.result.mode='occupy';if(b.result.claimed===undefined)b.result.claimed=!!b.result.first;if(b.result.stationed===undefined)b.result.stationed=false;}
    }
    for(const r of [...old.reports,...(old.battle?.finished?[old.battle.result]:[])]){if(!r.mode)r.mode='occupy';for(const key of ['back','lost','wounded'])for(const id of Object.keys(units))if(r[key][id]===undefined)r[key][id]=0;}
    if(old.civicCooldowns===undefined)old.civicCooldowns={comfort:0,levy:0};
    if(old.starterGiftVersion===undefined)old.starterGiftVersion=old.starterGiftClaimed?1:0;
    if(old.missionSchema===undefined&&Number.isInteger(old.mission)&&old.mission>=0&&old.mission<=6){
      // The old six sequential missions map to stable IDs, so previously collected rewards stay collected.
      const legacy=['farm','trained20','field','hall2','camp','fort'];
      old.missionClaims=legacy.slice(0,Math.max(0,Math.min(legacy.length,old.mission||0)));
      old.missionSchema=2;old.mission=old.missionClaims.length;
    }
    for(const id of Object.keys(ManualData.technology))if(old.tech[id]===undefined)old.tech[id]=0;
    if(old.captives===undefined)old.captives=blankArmy();
    Progression.init(old);HeroSystem.init(old);HeritageSystem.init(old);NPCDefense.init(old);WarCare.init(old);GovernanceSystem.init(old,migrationNow);AutomationSystem.init(old);OnboardingSystem.init(old);WarOrders.init(old);GeneralGrowth.init(old);ScoutSystem.init(old);RegionalFront.init(old);HeroAdministration.init(old);CitySystem.init(old,nodes.filter(n=>isCity(n)).map(n=>getNode(n.id,old)));
    for(const c of CitySystem.list(old)){GeneralGrowth.init(old);ScoutSystem.init(c.data);RegionalFront.init(c.data);HeroAdministration.init(c.data);WarCare.init(c.data);GovernanceSystem.initCity(c.data,migrationNow);}NamedCitySystem.init(old);SupplyLines.init(old);
    if(old.openCitySites&&typeof old.openCitySites==='object'&&!Array.isArray(old.openCitySites)&&['yellow_qingshi','yellow_baisha','yellow_chigang'].every(id=>Object.hasOwn(old.openCitySites,id))&&Object.keys(old.openCitySites).every(id=>YellowCityData.allNodes().some(n=>n.id===id))&&YellowCityData.allNodes().some(n=>!Object.hasOwn(old.openCitySites,n.id)))old.openCitySites=YellowCityData.createSites(old,fixedSites,old.openCitySites);
    if(old.yellowGold===undefined)old.yellowGold={};
    return old;
  }
  // Hold one origin-wide exclusive Web Lock throughout a browser writer's lifetime.
  const SESSION_KEY=KEY+'-writer',BACKUP_KEY=KEY+'-backup',REQUEST_KEY=KEY+'-handoff',LEASE_MS=15000;
  const browserSession=typeof navigator!=='undefined',locks=browserSession&&navigator.locks;
  let sessionOwner='',observedRaw=null,saveMode='uninitialized',saveReason='',lastSavedAt=0,archiveSerial=0,lockHeld=false,lockRelease=null,lockPending=null,lastOffline=null,lockAbort=null,lockGeneration=0,pendingFinish=null,pendingHandoff=null,handoffSerial=0;
  function ownerId(){if(!sessionOwner){if(typeof crypto!=='undefined'&&crypto.randomUUID)sessionOwner=crypto.randomUUID();else{const counter=Number(localStorage.getItem(KEY+'-session-sequence')||0)+1;localStorage.setItem(KEY+'-session-sequence',String(counter));sessionOwner=Date.now()+'-'+counter;}}return sessionOwner;}
  function storedState(raw){try{if(raw===null)return null;const data=migrateSave(JSON.parse(raw));return validSave(data)?data:null;}catch{return null;}}
  function writer(){const raw=localStorage.getItem(SESSION_KEY);if(!raw)return null;try{const value=JSON.parse(raw);return value&&typeof value.owner==='string'&&Number.isFinite(value.until)?value:null;}catch{return null;}}
  function storageFailure(mode,reason){saveMode=mode;saveReason=reason;return reason;}
  function saveBlockReason(){
    if(onlineAuthority)return '';
    if(saveMode!=='active')return saveReason||'当前页面未取得存档写入权';
    if(browserSession&&!lockHeld)return storageFailure('readonly','本页没有存档写入锁，已暂停操作');
    try{
      const lease=writer();
      if(lease?.owner&&lease.owner!==sessionOwner)return storageFailure('readonly','另一页面已接管城池，本页已暂停，请接管后继续');
      if(localStorage.getItem(KEY)!==observedRaw)return storageFailure('conflict','已保存进度发生变化，本页已暂停，请重新读取最新进度');
      return '';
    }catch{return storageFailure('read-error','无法读取浏览器存储，已暂停操作并保留原存档');}
  }
  function claimWriter(){
    if(browserSession&&!lockHeld)return storageFailure(locks?'starting':'unsupported',locks?'正在读取存档并取得写入权':'此浏览器无法提供独占存档锁，请使用支持 Web Locks 的浏览器；原始数据已保留');
    ownerId();const lease=writer();
    // Headless callers have no Web Locks: refuse foreign ownership even after lease expiry.
    if(!lockHeld&&lease?.owner&&lease.owner!==sessionOwner)return storageFailure('readonly','城池正在另一页面运行，请关闭原页面后重新读取');
    localStorage.setItem(SESSION_KEY,JSON.stringify({owner:sessionOwner,until:Date.now()+LEASE_MS}));
    if(writer()?.owner!==sessionOwner)return storageFailure('readonly','另一页面取得了城池写入权，请重新接管');
    saveMode='active';saveReason='';return '';
  }
  function save(){
    if(state?.realm)for(const id of state.generals)if(state.realm.heroLocations[id]===undefined)state.realm.heroLocations[id]=currentCityId();
    CitySystem.capture(state);
    if(realmSettling||onlineAuthority)return true;
    if(saveBlockReason())return false;
    try{
      const next=JSON.stringify(state);
      localStorage.setItem(SESSION_KEY,JSON.stringify({owner:sessionOwner,until:Date.now()+LEASE_MS}));
      if(saveBlockReason())return false;
      if(next!==observedRaw){if(storedState(observedRaw))localStorage.setItem(BACKUP_KEY,observedRaw);localStorage.setItem(KEY,next);observedRaw=next;}
      lastSavedAt=Date.now();return true;
    }catch{storageFailure('write-error','保存失败，已暂停操作。请导出当前进度后检查浏览器存储');return false;}
  }
  function saveSessionInfo(){
    if(onlineAuthority)return {mode:'active',writable:true,reason:'',lastSavedAt:state.last,hasBackup:false,rawAvailable:true,lockSupported:!!locks,online:true};
    saveBlockReason();let backup=null,rawAvailable=false;
    try{backup=storedState(localStorage.getItem(BACKUP_KEY));rawAvailable=localStorage.getItem(KEY)!==null||localStorage.getItem('sanguo-city-v1')!==null;}catch{}
    return {mode:saveMode,writable:saveMode==='active',reason:saveReason,lastSavedAt,hasBackup:!!backup,backupAt:backup?.last||0,rawAvailable,lockSupported:!!locks};
  }
  function exportStoredRaw(){try{const raw=localStorage.getItem(KEY);return raw===null?(localStorage.getItem('sanguo-city-v1')??''):raw;}catch{throw new Error('无法读取原始存档');}}
  function archiveRaw(raw){if(raw!==null)localStorage.setItem(KEY+'-recovery-'+Date.now()+'-'+sessionOwner+'-'+(++archiveSerial),raw);}
  function replaceSave(data){
    const next=migrateSave(data);if(!validSave(next))throw new Error('Invalid save');
    if(browserSession&&!lockHeld||['readonly','conflict','released','starting','handoff'].includes(saveMode))throw new Error(saveReason||'请先接管最新进度');
    const current=localStorage.getItem(KEY),lease=writer();
    if(!lockHeld&&lease?.owner&&lease.owner!==sessionOwner)throw new Error('城池正在另一页面运行，请先接管');
    if(saveMode==='active'&&current!==observedRaw)throw new Error('存档已变化，请先重新读取最新进度');
    // Explicit import/reset/restore preserves the replaced payload, including invalid or empty data.
    archiveRaw(current);if(storedState(current))localStorage.setItem(BACKUP_KEY,current);
    observedRaw=current;if(claimWriter())throw new Error(saveReason);
    state=next;if(!save())throw new Error(saveReason);init();if(saveMode!=='active')throw new Error(saveReason||'恢复后重新读取失败');
  }
  function restoreSaveBackup(){try{const data=storedState(localStorage.getItem(BACKUP_KEY));if(!data)return '没有可恢复的有效备份';replaceSave(data);return null;}catch(error){return error.message||'备份恢复失败';}}
  function openSaveSession(wait=false){
    if(!locks){lastOffline=init();return Promise.resolve(saveMode==='active'?null:saveReason);}
    if(lockHeld){lastOffline=init();return Promise.resolve(saveMode==='active'?null:saveReason);}
    if(lockPending)return lockPending;
    let finish;const opened=new Promise(resolve=>{finish=resolve;});lockPending=opened;pendingFinish=finish;
    const generation=lockGeneration,controller=wait&&typeof AbortController!=='undefined'?new AbortController():null;lockAbort=controller;
    locks.request(KEY+'-exclusive',{ifAvailable:!wait,...(controller?{signal:controller.signal}:{})},async lock=>{
      if(generation!==lockGeneration){finish('本页已停止等待存档交接');return;}
      if(!lock){storageFailure('readonly','城池正在另一页面运行。本页只读，可接管最新进度');finish(saveReason);return;}
      lockHeld=true;const held=new Promise(resolve=>{lockRelease=resolve;});
      lastOffline=init();finish(saveMode==='active'?null:saveReason);
      await held;
    }).catch(()=>{if(generation!==lockGeneration){finish('本页已停止等待存档交接');return;}storageFailure('lock-error','无法取得存档锁，已暂停操作并保留原始数据');finish(saveReason);});
    opened.then(()=>{if(lockPending===opened){lockPending=null;pendingFinish=null;lockAbort=null;}});return opened;
  }
  function takeOverSaveSession(){
    if(!locks||lockHeld){init();return saveMode==='active'?null:saveReason;}
    if(lockPending)return lockPending;
    try{ownerId();const lease=writer(),id=sessionOwner+'-'+(++handoffSerial);pendingHandoff=id;localStorage.setItem(REQUEST_KEY+'-'+sessionOwner,id);localStorage.setItem(REQUEST_KEY,JSON.stringify({id,requester:sessionOwner,target:lease?.owner||'',at:Date.now()}));storageFailure('handoff','等待另一页面保存并交接，请保持两个页面打开');const opened=openSaveSession(true);opened.then(()=>clearHandoff(id));return opened;}
    catch{return storageFailure('read-error','无法请求存档交接，未覆盖原始数据');}
  }
  function clearHandoff(id=pendingHandoff){if(!id)return;try{if(localStorage.getItem(REQUEST_KEY+'-'+sessionOwner)===id)localStorage.setItem(REQUEST_KEY+'-'+sessionOwner,'');}catch{}if(pendingHandoff===id)pendingHandoff=null;}
  function respondSaveTakeover(){
    if(!lockHeld&&saveMode==='handoff'&&pendingHandoff){try{const lease=writer();localStorage.setItem(REQUEST_KEY,JSON.stringify({id:pendingHandoff,requester:sessionOwner,target:lease?.owner||'',at:Date.now()}));}catch{}return;}
    if(!lockHeld||saveMode!=='active')return;
    try{const request=JSON.parse(localStorage.getItem(REQUEST_KEY)||'null');if(!request||request.requester===sessionOwner||request.target!==sessionOwner||!request.id||localStorage.getItem(REQUEST_KEY+'-'+request.requester)!==request.id)return;
      // A blocked writer must preserve unsaved progress and must not report a successful handoff.
      if(!save())return;
      if(localStorage.getItem(REQUEST_KEY+'-'+request.requester)!==request.id)return;
      releaseSaveSession();storageFailure('readonly','另一页面已请求接管，本页已保存并暂停');
    }catch{}
  }
  function releaseSaveSession(){
    clearHandoff();lockGeneration++;if(lockAbort){lockAbort.abort();lockAbort=null;}if(pendingFinish){pendingFinish('本页已停止等待存档交接');pendingFinish=null;}lockPending=null;
    if(saveMode==='active')save();
    try{if(writer()?.owner===sessionOwner)localStorage.setItem(SESSION_KEY,JSON.stringify({owner:'',until:0}));}catch{}
    if(lockRelease){const release=lockRelease;lockRelease=null;lockHeld=false;release();}
    if(['active','handoff','starting','readonly'].includes(saveMode))storageFailure('released','本页已停止写入，重新读取后可继续');
  }
  function validSave(d,cityScopeOnly=false){
    if(d===state&&!cityScopeOnly)CitySystem.capture(state);
    if(!cityScopeOnly&&!WebEdition.valid(d))return false;
    const object=x=>x&&typeof x==='object'&&!Array.isArray(x);
    const finite=n=>Number.isFinite(n)&&n>=0&&n<=Number.MAX_SAFE_INTEGER;
    const integer=n=>finite(n)&&Number.isInteger(n);
    const army=a=>object(a)&&Object.keys(units).every(k=>integer(a[k]))&&Object.keys(a).every(k=>Object.hasOwn(units,k));
    const orders=o=>object(o)&&Object.keys(units).every(id=>object(o[id])&&['advance','hold','fallback'].includes(o[id].command)&&(o[id].target===''||Object.hasOwn(units,o[id].target)));
    const loot=a=>object(a)&&Object.entries(a).every(([k,n])=>Object.hasOwn(resources,k)&&finite(n));
    if(object(d)&&d.yellowGold!==undefined&&(!object(d.yellowGold)||Object.entries(d.yellowGold).some(([id,at])=>!YellowCityData.nodes.some(n=>n.id===id)||!Number.isSafeInteger(at)||at<0)))return false;
    if(!object(d)||!object(d.openCitySites)||Object.keys(d.openCitySites).length!==YellowCityData.allNodes().length||Object.keys(d.openCitySites).some(id=>!YellowCityData.allNodes().some(n=>n.id===id)))return false;
    const reservedSites=new Set([home,...fixedSites].map(p=>p.x+':'+p.y));
    for(const n of YellowCityData.allNodes()){const p=d.openCitySites[n.id];if(!object(p)||!Number.isInteger(p.x)||!Number.isInteger(p.y)||p.x<0||p.y<0||p.x>=WORLD_SIZE||p.y>=WORLD_SIZE||reservedSites.has(p.x+':'+p.y))return false;reservedSites.add(p.x+':'+p.y);}
    const node=id=>!!getNode(id,d);
    const timing=q=>finite(q.start)&&finite(q.end)&&q.end>q.start;
    const frozen=e=>(e.generalSnapshot===undefined||object(e.generalSnapshot)&&e.generalSnapshot.id===e.general&&typeof e.generalSnapshot.name==='string'&&e.generalSnapshot.name.length<=100&&['atk','def','pol','wis','lead'].every(k=>finite(e.generalSnapshot[k])))&&(e.skillProfile===undefined||GeneralGrowth.validProfile(e.skillProfile))&&(e.returnSeconds===undefined||finite(e.returnSeconds)&&e.returnSeconds>=1)&&(e.sourceCity===undefined||!!d.realm?.cities[e.sourceCity]);
    const itemDrops=a=>object(a)&&Object.entries(a).every(([id,n])=>ManualData.shop.some(x=>x.id===id)&&integer(n)&&n>0&&n<=2);
    const tacticReceipt=r=>r.tacticEvents===undefined&&r.tacticPoints===undefined||Array.isArray(r.tacticEvents)&&r.tacticEvents.length<=60&&r.tacticEvents.every(t=>typeof t==='string'&&t.length<=500)&&object(r.tacticPoints)&&Object.keys(r.tacticPoints).length===2&&['player','enemy'].every(side=>integer(r.tacticPoints[side])&&r.tacticPoints[side]<=3);
    const result=r=>object(r)&&tacticReceipt(r)&&(r.returnAfterOccupy===undefined||typeof r.returnAfterOccupy==='boolean')&&(r.failure===undefined||r.failure===null||!r.won&&object(r.failure)&&['retreat','army','gate','enemy','gate_and_enemy'].includes(r.failure.reason)&&integer(r.failure.round)&&r.failure.round<=30&&integer(r.failure.enemyRemaining)&&integer(r.failure.gateHp)&&typeof r.failure.outOfRange==='boolean')&&HeroSystem.wild.validReceipt(r.wildGeneral,d)&&WarOrders.validReceipt(r.warOrder)&&(!r.warOrder||r.won&&(r.node===undefined||r.warOrder.node===r.node))&&(r.resourceReceipt===undefined||object(r.resourceReceipt)&&validReceipt(r.resourceReceipt.base)&&validReceipt(r.resourceReceipt.bonus))&&(r.equipmentDrops===undefined||Array.isArray(r.equipmentDrops)&&r.equipmentDrops.length<=1&&r.equipmentDrops.every(e=>HeroSystem.validEquipment(e,d)))&&(r.equipmentDiscarded===undefined||[0,1].includes(r.equipmentDiscarded))&&(r.prestigeDelta===undefined||Number.isSafeInteger(r.prestigeDelta))&&(r.jewelDrops===undefined||object(r.jewelDrops)&&Object.entries(r.jewelDrops).every(([id,n])=>Progression.jewels[id]&&integer(n)&&n<=2))&&(r.captures===undefined||army(r.captures))&&(r.captureDiscarded===undefined||integer(r.captureDiscarded))&&['raid','occupy'].includes(r.mode)&&typeof r.won==='boolean'&&loot(r.loot)&&(r.itemDrops===undefined||itemDrops(r.itemDrops))&&(r.bonusLoot===undefined||loot(r.bonusLoot))&&(r.bonusDiscarded===undefined||finite(r.bonusDiscarded))&&(r.cargoCapacity===undefined||integer(r.cargoCapacity))&&(r.cargoLoaded===undefined||integer(r.cargoLoaded)&&r.cargoLoaded<=r.cargoCapacity)&&(r.lootDiscarded===undefined||integer(r.lootDiscarded))&&army(r.back)&&army(r.lost)&&army(r.wounded)&&finite(r.xp)&&finite(r.overflow)&&validOverCapacityTotal(r)&&(r.recruit===null||generals.some(g=>g.id===r.recruit));
    const rows=(a,length)=>Array.isArray(a)&&a.length<=12&&new Set(a.map(r=>r.id)).size===a.length&&a.every(r=>object(r)&&Object.hasOwn(units,r.id)&&integer(r.initial)&&r.initial>0&&finite(r.hp)&&object(r.stats)&&['hp','atk','def','range','speed'].every(k=>finite(r.stats[k]))&&r.stats.hp>0&&r.maxHp===r.initial*r.stats.hp&&r.hp<=r.maxHp&&Number.isInteger(r.pos)&&r.pos>=0&&r.pos<=length);
    if(!object(d)||!AutomationSystem.valid(d)||!Progression.valid(d)||d.version!==2||typeof d.autoUpgrade!=='boolean'||typeof d.autoResearch!=='boolean'||typeof d.starterGiftClaimed!=='boolean'||!finite(d.last)||!loot(d.res)||!Object.keys(resources).every(k=>finite(d.res[k]))||!object(d.buildings)||!cityIds.every(k=>Number.isInteger(d.buildings[k])&&d.buildings[k]>=(k==='hall'?1:0)&&d.buildings[k]<=10)||!army(d.army)||!army(d.captives)||Object.entries(d.captives).some(([id,n])=>n>0&&!RewardData.captives.units.includes(id)))return false;
    if(!templateValid(d.plotTemplate)||d.plotTemplate.active&&d.autoUpgrade)return false;
    if(!Array.isArray(d.plots)||d.plots.length!==PLOT_COUNT||!d.plots.every(p=>object(p)&&(p.type===null?p.level===0:Object.hasOwn(plotTypes,p.type)&&Number.isInteger(p.level)&&p.level>=1&&p.level<=NamedCitySystem.profile(d.realm?.cities?.[d.realm.activeCity]).plotMax)))return false;
    if(d.manualSchema!==1||!Array.isArray(d.cityLayout)||d.cityLayout.length!==36||!d.cityLayout.every(id=>id===null||id==='reserved'||cityIds.includes(id))||d.cityLayout.filter(x=>x==='hall').length!==1||d.cityLayout.filter(x=>x==='reserved').length!==3||!Array.isArray(d.cityLevels)||d.cityLevels.length!==36||!d.cityLevels.every((lv,i)=>integer(lv)&&lv<=10&&(d.cityLayout[i]===null||d.cityLayout[i]==='reserved'?lv===0:true)))return false;
    if(![1,10,60].includes(d.speed)||!object(d.tech)||!Object.keys(ManualData.technology).every(id=>integer(d.tech[id])&&d.tech[id]<=10)||!finite(d.population)||!finite(d.morale)||d.morale>100||!finite(d.unrest)||d.unrest>100||!finite(d.gems)||!object(d.inventory)||!Object.entries(d.inventory).every(([id,n])=>ManualData.shop.some(x=>x.id===id)&&integer(n))||!object(d.buffs)||!object(d.itemCooldowns)||!object(d.scouted)||!object(d.landClaims)||!object(d.defenses)||!Object.keys(ManualData.defenses).every(id=>integer(d.defenses[id]))||!Array.isArray(d.defenseQueue)||d.defenseQueue.length>5||!object(d.storageAllocation)||Object.values(d.storageAllocation).reduce((v,n)=>v+n,0)!==100)return false;
    if(!Array.isArray(d.customGenerals)||d.customGenerals.length>100||!Array.isArray(d.innCandidates)||d.innCandidates.length>10||![...d.customGenerals,...d.innCandidates].every(g=>object(g)&&typeof g.id==='string'&&/^local_\d+$/.test(g.id)&&typeof g.name==='string'&&g.name.length<=20&&['atk','def','pol','wis','lead','level','price'].every(k=>finite(g[k]))))return false;
    const knownHero=id=>generals.some(g=>g.id===id)||d.customGenerals.some(g=>g.id===id);
    if(d.researchQueue!==null&&(!object(d.researchQueue)||!Object.hasOwn(ManualData.technology,d.researchQueue.id)||d.researchQueue.level!==d.tech[d.researchQueue.id]+1||!timing(d.researchQueue)))return false;
    if(!orders(d.tactics))return false;
    if(!object(d.raided)||!Object.entries(d.raided).every(([id,v])=>node(id)&&v===true)||!object(d.garrisons)||!object(d.towns))return false;
    const cityNodes=nodes.filter(n=>n.terrain==='fort');if(Object.keys(d.towns).length!==cityNodes.length||Object.keys(d.towns).some(id=>!cityNodes.some(n=>n.id===id)))return false;
    for(const n of cityNodes){const town=d.towns[n.id];if(!object(town)||!Number.isInteger(town.morale)||town.morale < -100||town.morale>100||!integer(town.unrest)||town.unrest>100||!integer(town.population))return false;}
    const stationed=[];
    for(const [id,g] of Object.entries(d.garrisons)){if(!getNode(id,d)?.wild||!d.conquered[id]||!object(g)||!d.generals.includes(g.general)||g.general===d.governor||!army(g.army)||!['stationed','return'].includes(g.phase)||!finite(g.start)||(g.phase==='return'?!timing(g):g.end!==null))return false;stationed.push(g.general);}
    if(new Set(stationed).size!==stationed.length||stationed.includes(d.expedition?.general))return false;
    if(!Array.isArray(d.generals)||d.generals.length<2||!d.generals.includes('lin')||!d.generals.includes('su')||new Set(d.generals).size!==d.generals.length||!d.generals.every(id=>knownHero(id))||(d.governor!==null&&!d.generals.includes(d.governor)))return false;
    if(!object(d.generalLevels)||!object(d.generalXp)||!d.generals.every(id=>integer(d.generalLevels[id])&&d.generalLevels[id]>=1&&d.generalLevels[id]<=10000&&finite(d.generalXp[id])))return false;
    if(!HeroSystem.valid(d))return false;
    if(!OnboardingSystem.valid(d)||!WarOrders.valid(d))return false;
    if(!Number.isInteger(d.tax)||d.tax<0||d.tax>100||!object(d.stats)||!integer(d.stats.trained)||!integer(d.stats.victories)||!object(d.conquered)||!Object.entries(d.conquered).every(([id,v])=>node(id)&&v===true)||!object(d.cooldowns)||!Object.entries(d.cooldowns).every(([id,v])=>node(id)&&finite(v)))return false;
    if(!Array.isArray(d.buildQueue)||d.buildQueue.length>5||new Set(d.buildQueue.map(q=>q.plot===undefined?'city:'+q.site:'plot:'+q.plot)).size!==d.buildQueue.length||!d.buildQueue.every(q=>{
      if(!object(q)||!timing(q)||(q.auto!==undefined&&typeof q.auto!=='boolean')||(q.paidItems!==undefined&&(!object(q.paidItems)||!Object.entries(q.paidItems).every(([id,n])=>id==='blueprint'&&integer(n)&&n<=1))))return false;
      if(q.plot===undefined)return cityIds.includes(q.id)&&integer(q.site)&&q.site<36&&d.cityLayout[q.site]===q.id&&q.level===d.cityLevels[q.site]+1&&q.level<=10;
      if(!integer(q.plot)||q.plot>=PLOT_COUNT||!Object.hasOwn(plotTypes,q.id))return false;const p=d.plots[q.plot];
      return q.kind==='upgrade'?p.type===q.id&&q.level===p.level+1&&q.level<=NamedCitySystem.profile(d.realm?.cities?.[d.realm.activeCity]).plotMax:q.kind==='build'?p.type===null&&q.level===1:q.kind==='replace'&&p.type!==null&&p.type!==q.id&&q.level===1;
    }))return false;
    if(!Array.isArray(d.trainQueue)||d.trainQueue.length>100||!d.trainQueue.every(q=>object(q)&&Object.hasOwn(units,q.id)&&integer(q.count)&&q.count>=1&&q.count<=100000&&timing(q)))return false;
    if(!object(d.civicCooldowns)||!['comfort','levy'].every(k=>finite(d.civicCooldowns[k])))return false;
    if(d.missionSchema!==2||!Array.isArray(d.missionClaims)||new Set(d.missionClaims).size!==d.missionClaims.length||!d.missionClaims.every(id=>missions.some(m=>m.id===id))||!integer(d.starterGiftVersion)||d.starterGiftVersion>2||d.starterGiftClaimed!==(d.starterGiftVersion>0))return false;
    if(!integer(d.mission)||d.mission!==d.missionClaims.length||d.mission>missions.length||!Array.isArray(d.reports)||d.reports.length>20||!d.reports.every(r=>result(r)&&node(r.node)&&finite(r.id)&&integer(r.round)&&knownHero(r.general)))return false;
    if(d.expedition!==null){const e=d.expedition;if(!object(e)||!frozen(e)||!node(e.node)||!d.generals.includes(e.general)||e.general===d.governor||!army(e.army)||!['raid','occupy'].includes(e.mode)||(e.returnAfterOccupy!==undefined&&typeof e.returnAfterOccupy!=='boolean')||!orders(e.orders)||!['march','battle','return'].includes(e.phase)||!timing(e))return false;}
    if(!Array.isArray(d.expeditions)||d.expeditions.length>10||!d.expeditions.every(e=>object(e)&&frozen(e)&&node(e.node)&&d.generals.includes(e.general)&&e.general!==d.governor&&army(e.army)&&['raid','occupy'].includes(e.mode)&&(e.returnAfterOccupy===undefined||typeof e.returnAfterOccupy==='boolean')&&orders(e.orders)&&['march','return'].includes(e.phase)&&timing(e)))return false;
    const deployment=[...(d.expedition?[d.expedition]:[]),...d.expeditions,...Object.values(d.garrisons)];if(new Set(deployment.map(e=>e.general)).size!==deployment.length)return false;
    if(!['food','wood','stone','iron'].every(k=>integer(d.storageAllocation[k])&&d.storageAllocation[k]<=100)||!Object.values(d.buffs).every(b=>object(b)&&typeof b.effect==='string'&&finite(b.end)&&(b.general===null||d.generals.includes(b.general)))||!Object.values(d.itemCooldowns).every(finite)||!finite(d.trialGiftAt)||typeof d.ruler!=='string'||d.ruler.length>12||typeof d.banner!=='string'||d.banner.length>2)return false;
    if(!d.defenseQueue.every(q=>object(q)&&Object.hasOwn(ManualData.defenses,q.id)&&integer(q.count)&&q.count>0&&q.count<=10000&&timing(q)))return false;
    if(!Object.entries(d.landClaims).every(([id,c])=>getNode(id,d)?.wild&&object(c)&&finite(c.at)&&integer(c.level)&&c.level<=10)||!Object.entries(d.scouted).every(([id,c])=>node(id)&&object(c)&&finite(c.at)&&integer(c.level)&&c.level<=10))return false;
    const roundSummary=(s,b)=>object(s)&&s.round===b.round&&Array.isArray(s.events)&&s.events.length<=150&&s.events.every(e=>object(e)&&['move','strike','recoil','gate','tower'].includes(e.type)&&['player','enemy'].includes(e.side)&&(Object.hasOwn(units,e.unit)||['gate','tower'].includes(e.unit))&&(e.target===''||Object.hasOwn(units,e.target)||['gate','tower'].includes(e.target))&&['from','to','damage'].every(k=>finite(e[k]))&&e.from<=b.length&&e.to<=b.length&&integer(e.killed)&&typeof e.counter==='boolean'&&typeof e.ranged==='boolean'&&(e.type!=='move'||e.damage===0&&e.killed===0)&&(e.type!=='gate'||e.target==='gate'&&e.killed===0)&&(e.type!=='tower'||e.unit==='tower')&&(e.type!=='strike'||Object.hasOwn(units,e.unit)&&Object.hasOwn(units,e.target)));
    if(d.battle!==null){const b=d.battle;const encounter=object(b)&&WarOrders.encounterConfig?.(b.node);if(encounter&&(b.rules!==3||b.stratagem?.version!==2||b.length!==encounter.length))return false;if(object(b)&&b.rules===3&&(!object(b.generalSnapshot)||b.generalSnapshot.id!==b.general||(b.generalSnapshot.wildLine||'')!==((d.customGenerals.find(g=>g.id===b.general)||generals.find(g=>g.id===b.general))?.wildLine||'')||!b.finished&&d.expedition?.generalSnapshot&&(b.generalSnapshot.wildLine||'')!==(d.expedition.generalSnapshot.wildLine||'')||!b.finished&&(b.enemyGeneralSnapshot?.wildLine||'')!==(d.wildGenerals?.rumors.find(r=>r.status==='active'&&r.node===b.node)?.line||'')||!object(b.enemyGeneralSnapshot)||b.enemyGeneralSnapshot.id!=='enemy_'+b.node||typeof b.enemyGeneralSnapshot.name!=='string'||b.enemyGeneralSnapshot.name.length>100||typeof b.enemyGeneralSnapshot.wildLine!=='string'||b.enemyGeneralSnapshot.wildLine.length>40||(b.enemyGeneralSnapshot.encounterIdentity!==undefined&&b.enemyGeneralSnapshot.encounterIdentity!==WarOrders.encounterConfig?.(b.node)?.enemyIdentity)||(WarOrders.encounterConfig?.(b.node)&&b.enemyGeneralSnapshot.encounterIdentity!==WarOrders.encounterConfig(b.node).enemyIdentity)||!object(b.enemyOrders)||Object.keys(b.enemyOrders).length!==b.enemy?.length||!b.enemy?.every(r=>object(b.enemyOrders[r.id])&&['advance','hold','fallback'].includes(b.enemyOrders[r.id].command)&&(b.enemyOrders[r.id].target===''||b.player?.some(p=>p.id===b.enemyOrders[r.id].target)))||b.lesson!==undefined))return false;if(!object(b)||!frozen(b)||!['raid','occupy'].includes(b.mode)||typeof b.siege!=='boolean'||!integer(b.militia)||![2,3].includes(b.rules)||(b.rules===3&&(typeof BattleStratagems==='undefined'||!b.stratagem||!BattleStratagems.valid(b,{units})))||(b.rules===2&&b.stratagem!==undefined)||!integer(b.length)||b.length<200||b.length>10000||!node(b.node)||!(b.finished?knownHero(b.general):d.generals.includes(b.general))||!integer(b.round)||b.round>30||(b.machineGateAttacks!==undefined&&(!integer(b.machineGateAttacks)||b.machineGateAttacks>b.round*2))||(b.currentRoundSummary!==undefined&&!roundSummary(b.currentRoundSummary,b))||typeof b.finished!=='boolean'||typeof b.auto!=='boolean'||!rows(b.player,b.length)||!rows(b.enemy,b.length)||!object(b.orders)||!SiegeSystem.valid(b.gate,getNode(b.node,d),b.mode)||!b.player.every(r=>object(b.orders[r.id])&&['advance','hold','fallback'].includes(b.orders[r.id].command)&&(b.orders[r.id].target===''||b.orders[r.id].target==='gate'&&!!b.gate||Object.hasOwn(units,b.orders[r.id].target)))||!Array.isArray(b.log)||b.log.length>40||!b.log.every(t=>typeof t==='string'&&t.length<1000))return false;if(b.finished?(!result(b.result)||b.result.warOrder&&b.result.warOrder.node!==b.node):!d.expedition||d.expedition.phase!=='battle'||d.expedition.node!==b.node||d.expedition.general!==b.general)return false;}
    if(!HeritageSystem.valid(d)||!NPCDefense.valid(d,units,ManualData.defenses,validReceipt,d.realm?.activeCity))return false;
    if(!GeneralGrowth.valid(d)||!ScoutSystem.valid(d,scoutApi(d))||!RegionalFront.valid(d,d.realm?.cities?.[d.realm.activeCity])||!HeroAdministration.valid(d,{cityId:d.realm?.activeCity}))return false;
    if(!WarCare.valid(d)||!GovernanceSystem.valid(d))return false;
    if(!cityScopeOnly&&(!SupplyLines.valid(d)||!NamedCitySystem.valid(d)))return false;
    if(!cityScopeOnly&&CitySystem.list(d).reduce((sum,c)=>sum+(CitySystem.scope(d,c).regionalFront?.earnedMerit||0),0)>d.warOrders.earned)return false;
    if(!cityScopeOnly&&CitySystem.fields.some(k=>JSON.stringify(d[k])!==JSON.stringify(d.realm?.cities?.[d.realm.activeCity]?.data[k])))return false;
    if(!cityScopeOnly&&!CitySystem.valid(d,(c,scope)=>{
      const n=c.capital?null:getNode(c.node,d);if(!c.capital&&(!n||!d.conquered[c.node]||n.x!==c.x||n.y!==c.y||!(isCity(n)||n.wild&&n.type==='plain')))return false;
      return validSave({...d,...scope,realm:{...d.realm,activeCity:c.id}},true)&&validSave({...d,...c.data,realm:{...d.realm,activeCity:c.id}},true);
    }))return false;
    return true;
  }
  function init(){
    lessonSession=null;
    let raw,legacy;saveMode='uninitialized';saveReason='';
    try{raw=localStorage.getItem(KEY);legacy=raw===null?localStorage.getItem('sanguo-city-v1'):null;observedRaw=raw;
      const payload=raw===null?legacy:raw;state=payload===null?newState():storedState(payload);
      if(!state){state=newState();if(lockHeld)claimWriter();storageFailure('recovery','原始存档无法通过校验，已暂停并保留原始数据');return null;}
      if(claimWriter())return null;CitySystem.activate(state,state.realm.activeCity);
      if(legacy&&!localStorage.getItem(KEY+'-before-manual'))localStorage.setItem(KEY+'-before-manual',legacy);
    }catch{state=state||newState();storageFailure('read-error','读取存档失败，已暂停并保留原始数据。可重新读取或导出');return null;}
    const before={...state.res},elapsed=(Date.now()-state.last)/1000;state.last=Math.min(Date.now(),state.last);tick(Date.now(),false);if(state.battle)state.battle.auto=false;
    const offline=elapsed>60?{seconds:Math.min(elapsed,28800),gain:Object.fromEntries(Object.keys(resources).map(k=>[k,Math.max(0,Math.floor(state.res[k]-before[k]))]))}:null;
    save();return offline;
  }
  function importSave(data){replaceSave(data);lessonSession=null;}
  const totalArmy = a => Object.values(a).reduce((v,n)=>v+n,0);
  const maxPop=()=>state.cityLayout.reduce((v,id,i)=>v+(id==='house'?(buildRecord(id,state.cityLevels[i])?.population||0):0),0);
  const allExpeditions=()=>[...(state.expedition?[state.expedition]:[]),...state.expeditions];
  const armyPeople=a=>Object.entries(a).reduce((v,[id,n])=>v+n*(units[id].people||1),0);
  const sourceLogistics=()=>state.realm.logistics.filter(j=>j.sourceCity===state.realm.activeCity);
  const committed=()=>armyPeople(WarCare.heldArmy(state))+armyPeople(ScoutSystem.heldArmy(state))+sourceLogistics().reduce((v,j)=>v+armyPeople(j.army),0)+armyPeople(NPCDefense.heldArmy(state))+armyPeople(state.army)+allExpeditions().reduce((v,e)=>v+armyPeople(e.army),0)+state.trainQueue.reduce((v,q)=>v+q.count*(units[q.id].people||1),0)+Object.values(state.garrisons).reduce((v,g)=>v+armyPeople(g.army),0);
  function capacity(k){if(!k)return Math.min(...Object.keys(resources).map(capacity));if(k==='gold')return buildRecord('hall',state.buildings.hall)?.capacity||1000000;let total=state.plots.filter(p=>p.type&&plotTypes[p.type].resource===k).reduce((v,p)=>v+buildRecord(p.type,p.level).capacity,0);total+=state.cityLayout.reduce((v,id,i)=>v+(id==='warehouse'?(buildRecord(id,state.cityLevels[i])?.capacity||0)*state.storageAllocation[k]/100:0),0);return Math.max(10000,total)*(1+state.tech.storage*.1);}
  const activeBuff=(id,generalId)=>Object.values(state.buffs).some(b=>b.effect===id&&b.end>(economyClock??Date.now())&&(!generalId||b.general===generalId));
  function productionBoost(){const gov=general(state.governor);return 1+gov.pol/100*Math.min(1,gov.lead*1000/Math.max(1,state.population));}
  const cityStrategy=(city=CitySystem.current(state))=>CityStrategy.profile(city);
  function resourceBonus(resource){let bonus=0;for(const id of Object.keys(state.conquered)){const n=getNode(id);if(!n?.wild||state.realm.wildOwners[id]===state.realm.activeCity)bonus+=n?.bonus?.[resource]||0;}return 1+bonus;}
  function workers(){return state.plots.reduce((v,p)=>v+(p.type?buildRecord(p.type,p.level).workers:0),0);}
  const freePopulation=()=>Math.max(0,Math.floor(state.population)-workers());
  function plotYield(plot){if(!plot?.type)return 0;const cfg=plotTypes[plot.type],labor=Math.min(1,state.population/Math.max(1,workers()));return buildRecord(plot.type,plot.level).output*ECONOMY_OUTPUT_FACTOR/60*productionBoost()*(1+state.tech[cfg.tech]*.1)*resourceBonus(cfg.resource)*labor*cityStrategy().production[cfg.resource];}
  function upkeep(army){return Object.entries(army).reduce((v,[id,n])=>v+(units[id]?.upkeep||0)*n,0);}
  function rates(){let r={food:100/60,wood:100/60,stone:100/60,iron:100/60,gold:state.population*state.tax/100/60};for(const key of Object.keys(r))r[key]*=ECONOMY_OUTPUT_FACTOR*cityStrategy().production[key];for(const p of state.plots)if(p.type)r[plotTypes[p.type].resource]+=plotYield(p);r.food-=(upkeep(WarCare.heldArmy(state))*2+upkeep(ScoutSystem.heldArmy(state))+sourceLogistics().reduce((v,j)=>v+upkeep(j.army),0)+upkeep(NPCDefense.heldArmy(state))+upkeep(state.army)+allExpeditions().reduce((v,e)=>v+upkeep(e.army),0)+Object.values(state.garrisons).reduce((v,g)=>v+upkeep(g.army)*(g.phase==='stationed'?2:1),0))/60;return r;}
  const currentCityId=()=>state.realm.activeCity;
  const domesticStrategyAvailable=()=>!onlineAuthority&&typeof GAME_SERVER_RUNTIME==='undefined';
  const domesticStrategyReason=()=>domesticStrategyAvailable()?'':'当前共享世界暂未开放区域战线、自动补给与主动备防';
  const cityMeta=(id=currentCityId())=>{const c=state.realm.cities[id]||CitySystem.list(state).find(c=>c.node===id);if(!c)return null;const {data,...meta}=c;return {...meta};};
  const currentHome=()=>{const c=cityMeta();return {x:c.x,y:c.y};};
  function setExternalGeneralBusy(ids=[]){if(!Array.isArray(ids)||ids.some(id=>typeof id!=='string'||state&&!state.generals.includes(id)))return '外部出征将领无效';externalGeneralBusy=new Set(ids);return null;}
  const heroCity=id=>state.realm.heroLocations[id]||'';
  const heroCapacity=(s=state)=>CitySystem.list(s).reduce((sum,c)=>sum+(CitySystem.scope(s,c).buildings.tavern||0),0);
  const cityLimit=()=>HeritageSystem.noble(state).city_count;
  // A quote can inspect another city without ticking, changing its queues or
  // leaving the player's active projection pointed at the source city.
  function withCityScope(id,read){
    if(!state.realm.cities[id])return null;
    CitySystem.capture(state);const selected=currentCityId();CitySystem.activate(state,id);
    try{return read();}finally{CitySystem.capture(state);CitySystem.activate(state,selected);}
  }
  const citySummary=id=>{const c=state.realm.cities[id];if(!c)return null;const d=CitySystem.scope(state,c),net=withCityScope(id,rates),foodSeconds=net.food<0?Math.max(0,Math.floor(d.res.food/-net.food*60)):null;return {...cityMeta(id),strategy:cityStrategy(c),res:{...d.res},army:{...d.army},buildings:{...d.buildings},governor:d.governor,population:d.population,tax:d.tax,rates:net,foodSeconds,regionalFront:CitySystem.clone(d.regionalFront),heroAdministration:CitySystem.clone(d.heroAdministration),queues:{build:d.buildQueue.length,train:d.trainQueue.length,research:d.researchQueue?1:0},garrisons:CitySystem.clone(d.garrisons),expeditions:CitySystem.clone([...(d.expedition?[d.expedition]:[]),...d.expeditions]),scoutQueue:CitySystem.clone(d.scoutQueue)};};
  const cityList=()=>CitySystem.list(state).map(c=>citySummary(c.id));
  const getCityState=(id=currentCityId())=>{const c=state.realm.cities[id];return c?CitySystem.clone(CitySystem.scope(state,c)):null;};
  const everyExpedition=()=>CitySystem.list(state).flatMap(c=>{const d=CitySystem.scope(state,c);return [...(d.expedition?[d.expedition]:[]),...d.expeditions].map(e=>({...e,sourceCity:c.id}));});
  function switchCity(id){if(!state.realm.cities[id])return '城市不存在';tick(Date.now(),false);CitySystem.capture(state);CitySystem.activate(state,id);save();return null;}
  const enterOwnedCity=nodeId=>switchCity(CitySystem.idFor(nodeId));
  function foundCityQuote(nodeId,name='新城'){
    const n=getNode(nodeId),cost={food:10000,wood:10000,stone:10000,iron:10000,gold:5000};name=typeof name==='string'?name.trim():'';
    const reason=!n?.wild||n.type!=='plain'?'只能在平地上筑城':!state.conquered[nodeId]?'请先占领这块平地':state.realm.wildOwners[nodeId]!==currentCityId()?'请切换至这块野地的所属城市':state.realm.cities[CitySystem.idFor(nodeId)]?'这里已经建城':cityList().length>=cityLimit()?'城池名额已满':state.garrisons[nodeId]||state.gatherings[nodeId]?'请先收回驻军并结束采集':!name||name.length>12?'城市名称需要 1–12 个字':!canPay(cost)?'本城建城资源不足':'';
    return {node:nodeId,name,cost,reason,sourceCity:currentCityId(),key:JSON.stringify([currentCityId(),nodeId,name,cityLimit(),cityList().length,state.realm.wildOwners[nodeId],!!state.garrisons[nodeId]])};
  }
  function foundCity(nodeId,name,key){tick(Date.now(),false);const q=foundCityQuote(nodeId,name);if(key!==q.key)return '建城条件已变化，请重新预览';if(q.reason)return q.reason;pay(q.cost);const n={...getNode(nodeId),name:q.name};state.realm.cities[CitySystem.idFor(nodeId)]=CitySystem.empty(state,n,Date.now());delete state.realm.wildOwners[nodeId];save();return null;}
  const logisticsList=()=>CitySystem.clone(state.realm.logistics);
  function logisticsQuote(kind,destination,army,cargo={},generalId=''){
    const source=cityMeta(),target=cityMeta(destination),selected=blankArmy(),load=Object.fromEntries(Object.keys(resources).map(k=>[k,0]));let reason='';
    if(!target||target.id===source.id)reason='请选择另一座治下城市';
    if(!army||typeof army!=='object'||Array.isArray(army)||Object.keys(army).some(id=>!units[id]))reason='部队格式无效';
    for(const id of Object.keys(units)){const n=army?.[id]??0;if(!Number.isSafeInteger(n)||n<0||n>state.army[id])reason='本城可派遣兵力不足';else selected[id]=n;}
    if(!totalArmy(selected))reason='至少派出 1 名士兵';else if(totalArmy(selected)>armyLimit())reason='超过校场单队人数上限';
    if(!cargo||typeof cargo!=='object'||Array.isArray(cargo)||Object.keys(cargo).some(id=>!resources[id]))reason='运送资源格式无效';
    for(const id of Object.keys(resources)){const n=cargo?.[id]??0;if(!Number.isSafeInteger(n)||n<0||n>state.res[id])reason='运送资源超过本城库存';else load[id]=n;}
    const distance=target?Math.hypot(target.x-source.x,target.y-source.y):0,speed=Math.min(...Object.keys(units).filter(id=>selected[id]>0).map(id=>unitStats(id).speed)),carryLimit=carry(selected),baseSeconds=Math.max(1,Math.ceil((8+distance*2)*units.archer.speed/Math.max(1,Number.isFinite(speed)?speed:1)/state.speed/marchSkillFactor(selected,generalId))),strategy=cityStrategy(source),seconds=CityStrategy.marchSeconds(baseSeconds,source),baseFoodCost=Math.ceil(totalArmy(selected)*1.2+distance*2),administrationFactor=domesticStrategyAvailable()?HeroAdministration.transportFactor(state,general(state.governor),kind,{generalBusy,cityId:currentCityId()}):1,foodCost=Math.ceil(baseFoodCost*administrationFactor),loaded=Object.values(load).reduce((v,n)=>v+n,0);
    if(kind==='transport'&&!loaded)reason='请选择运送资源';else if(loaded>carryLimit)reason='运送资源超过部队负重';
    if(state.buildings.drill<1)reason='请先建造校场';else if(kind==='transport'&&state.buildings.market<1)reason='运输需要本城市场 1 级';
    if(typeof generalId!=='string'||generalId&&(!state.generals.includes(generalId)||generalBusy(generalId)||HeritageSystem.roleOf(state,generalId)))reason='随行将领需要留在本城且未任职';
    if(state.realm.logistics.length>=100)reason='在途队伍已满';else if(state.res.food<foodCost+load.food)reason='运送粮食与行军粮合计超过本城库存';
    if(target&&Object.keys(resources).some(id=>state.realm.cities[target.id].data.res[id]+load[id]+state.realm.logistics.filter(j=>j.destinationCity===target.id&&!j.delivered&&!j.cancelled).reduce((v,j)=>v+j.cargo[id],0)>Number.MAX_SAFE_INTEGER))reason='目的城市的资源数量已达数值上限';
    if(target&&kind==='redeploy'&&Object.keys(units).some(id=>state.realm.cities[target.id].data.army[id]+selected[id]>Number.MAX_SAFE_INTEGER))reason='目的城市的兵力已达数值上限';
    const q={kind,sourceCity:source.id,destinationCity:target?.id||destination,origin:{x:source.x,y:source.y},target:target?{x:target.x,y:target.y}:null,army:selected,cargo:load,general:generalId,distance,seconds,baseSeconds,marchFactor:strategy.marchFactor,cityStrategy:strategy,baseFoodCost,administrationFactor,foodCost,carry:carryLimit,reason};q.key=JSON.stringify([q.kind,q.sourceCity,q.destinationCity,q.army,q.cargo,q.general,q.seconds,q.foodCost,state.realm.logistics.length]);return q;
  }
  const transportQuote=(destination,army,cargo,generalId='')=>logisticsQuote('transport',destination,army,cargo,generalId);
  const redeployQuote=(destination,army,generalId='')=>logisticsQuote('redeploy',destination,army,{},generalId);
  function commitLogistics(q,start,supplyLine){
    for(const id of Object.keys(units))state.army[id]-=q.army[id];for(const id of Object.keys(resources))state.res[id]-=q.cargo[id];state.res.food-=q.foodCost;if(q.general)state.realm.heroLocations[q.general]='transit';
    const job={id:'logistics_'+(++state.realm.logisticsSeq),kind:q.kind,sourceCity:q.sourceCity,destinationCity:q.destinationCity,origin:q.origin,target:q.target,army:q.army,cargo:q.cargo,general:q.general,phase:'outbound',start,end:start+q.seconds*1000,seconds:q.seconds,foodCost:q.foodCost,delivered:false,cancelled:false};
    if(supplyLine)job.supplyLine=supplyLine;state.realm.logistics.push(job);return job;
  }
  function sendLogistics(kind,destination,army,cargo,generalId,key){tick(Date.now(),false);const q=logisticsQuote(kind,destination,army,cargo,generalId);if(q.key!==key)return '派遣条件已变化，请重新预览';if(q.reason)return q.reason;commitLogistics(q,Date.now());save();return null;}
  const sendTransport=(destination,army,cargo,generalId='',key)=>sendLogistics('transport',destination,army,cargo,generalId,key);
  const redeployArmy=(destination,army,generalId='',key)=>sendLogistics('redeploy',destination,army,{},generalId,key);
  function recallLogistics(id){tick(Date.now(),false);const j=state.realm.logistics.find(j=>j.id===id);if(!j)return '队伍已经抵达或返回';if(j.phase!=='outbound')return '队伍已在返程';const now=Date.now(),elapsed=Math.max(1000,now-j.start);j.phase='return';j.start=now;j.end=now+elapsed;j.cancelled=true;SupplyLines.pauseForRecall(state,j);save();return null;}
  function supplyApi(now=Date.now()){
    return {getCity:id=>{const c=state.realm.cities[id];return c?{...cityMeta(id),...CitySystem.scope(state,c)}:null;},quoteFrom:(source,destination,army,cargo)=>withCityScope(source,()=>transportQuote(destination,army,cargo)),send:(plan,line)=>withCityScope(line.sourceCity,()=>{const q=transportQuote(line.destinationCity,line.army,plan.cargo);if(q.reason)return q.reason;if(q.key!==plan.quote.key)return '运输条件已变化，等待下次检查';commitLogistics(q,now,line.id);return null;})};
  }
  const supplyLines=()=>SupplyLines.list(state,supplyApi());
  const supplyLineQuote=draft=>{const q=SupplyLines.quote(state,draft,supplyApi());return domesticStrategyAvailable()?q:{...q,reason:domesticStrategyReason()};};
  function saveSupplyLine(draft,key){const block=domesticStrategyReason();if(block)return block;tick(Date.now(),false);const error=SupplyLines.set(state,draft,key,supplyApi());if(!error){tick();save();}return error;}
  function setSupplyLineEnabled(id,enabled){const block=domesticStrategyReason();if(block)return block;tick(Date.now(),false);const error=SupplyLines.setEnabled(state,id,enabled);if(!error){tick();save();}return error;}
  function removeSupplyLine(id){const block=domesticStrategyReason();if(block)return block;tick(Date.now(),false);const error=SupplyLines.remove(state,id);if(!error)save();return error;}
  function settleLogistics(now){
    const remove=new Set();for(const j of state.realm.logistics){if(j.end>now)continue;const source=state.realm.cities[j.sourceCity].data,target=state.realm.cities[j.destinationCity].data;
      if(j.phase==='outbound'){
        if(j.kind==='redeploy'){for(const id of Object.keys(units))target.army[id]+=j.army[id];if(j.general)state.realm.heroLocations[j.general]=j.destinationCity;remove.add(j.id);}
        else{if(!j.delivered){for(const id of Object.keys(resources))target.res[id]+=j.cargo[id];j.delivered=true;}j.phase='return';j.start=j.end;j.end+=j.seconds*1000;}
        state.realm.logisticsReports.unshift({id:j.id,kind:j.kind,sourceCity:j.sourceCity,destinationCity:j.destinationCity,at:j.start,text:j.kind==='redeploy'?'部队已到达目的城':'资源已到达目的城，允许爆仓；运输队返城'});
      }
      if(j.phase==='return'&&j.end<=now){for(const id of Object.keys(units))source.army[id]+=j.army[id];if(j.cancelled)for(const id of Object.keys(resources))source.res[id]+=j.cargo[id];if(j.general)state.realm.heroLocations[j.general]=j.sourceCity;remove.add(j.id);}
    }state.realm.logistics=state.realm.logistics.filter(j=>!remove.has(j.id));state.realm.logisticsReports=state.realm.logisticsReports.slice(0,30);
  }
  function tick(now=Date.now(),allowAutomation=true,settleAtSameTime=false){
    if(onlineAuthority||realmSettling||saveBlockReason())return;WildFields.sync(api,now);WebEdition.sync();CitySystem.capture(state);const selected=currentCityId();
    const scouts=CitySystem.list(state).flatMap(c=>CitySystem.scope(state,c).scoutQueue.flatMap(j=>[j.end,...(j.phase==='out'?[j.end+j.returnSeconds*1000]:[])]));
    const capStart=now-28800000,salaryFrom=Math.max(state.heroService.lastPay,capStart),salaryBounds=Array.from({length:Math.max(0,Math.floor((now-salaryFrom)/GovernanceSystem.HOUR))},(_,i)=>salaryFrom+(i+1)*GovernanceSystem.HOUR);
    const bounds=[...new Set([...salaryBounds,...scouts.filter(end=>end<=now),...state.realm.logistics.flatMap(j=>[j.end,...(j.kind==='transport'&&j.phase==='outbound'?[j.end+j.seconds*1000]:[])]).filter(end=>end<=now),now])].sort((a,b)=>a-b);realmSettling=true;
    try{for(const end of bounds){for(const c of CitySystem.list(state)){CitySystem.activate(state,c.id);tickCity(end,allowAutomation&&end===now,settleAtSameTime,capStart);CitySystem.capture(state);}settleLogistics(end);CitySystem.activate(state,selected);GovernanceSystem.tickHeroes(state,end,{capStart,busy:id=>externalGeneralBusy.has(id)||state.realm.logistics.some(j=>j.general===id)||CitySystem.list(state).some(c=>{const d=CitySystem.scope(state,c);return d.cityDefense.battle?.general===id||[...(d.expedition?[d.expedition]:[]),...d.expeditions,...Object.values(d.garrisons)].some(e=>e.general===id);})});CitySystem.capture(state);}if(allowAutomation&&domesticStrategyAvailable())SupplyLines.run(state,supplyApi(now));}finally{CitySystem.activate(state,selected);realmSettling=false;}
  }
  function scoutApi(s=state){const c=s.realm?.cities?.[s.realm.activeCity];return {units,getNode,origin:{x:c?.x??32,y:c?.y??32},scoutSpeed:()=>units.scout.speed*(1+(s.tech.riding||0)*.05)/cityStrategy(c).marchFactor,canScout:(d,n)=>n.chapter===3&&!ChapterData.unlocked(d,3)?ChapterData.blocked(d,n.id):d===state&&!landmarkVisible(n.id)?'此任务据点尚未开启':'',enemyArmy:(d,n)=>n.army,record:(d,kind)=>Progression.record(d,kind)};}
  const scoutQuote=(node,count=1)=>ScoutSystem.quote(state,node,count,Date.now(),scoutApi());
  function dispatchScout(node,count=1,key){tick(Date.now(),false);const error=ScoutSystem.dispatch(state,node,count,Date.now(),scoutApi(),key);if(!error)save();return error;}
  function trainGeneralSkill(id,route,key){tick(Date.now(),false);const error=GeneralGrowth.train(state,id,route,key,{generalBusy});if(!error)save();return error;}
  function applyOnlineSnapshot(snapshot){const candidate=migrateSave(snapshot);if(!validSave(candidate))return '服务器存档无法通过校验';state=candidate;CitySystem.activate(state,state.realm.activeCity);return null;}
  function enterOnlineSession(snapshot){const candidate=migrateSave(snapshot);if(!validSave(candidate))return '服务器存档无法通过校验';if(!onlineAuthority){CitySystem.capture(state);offlineSnapshot=CitySystem.clone(state);releaseSaveSession();}lessonSession=null;onlineAuthority=true;state=candidate;CitySystem.activate(state,state.realm.activeCity);return null;}
  async function leaveOnlineSession(){if(!onlineAuthority)return null;onlineAuthority=false;state=offlineSnapshot||newState();offlineSnapshot=null;return openSaveSession();}
  function tickCity(now=Date.now(),allowAutomation=true,settleAtSameTime=false,accrualFloor=now-28800000){
    if(saveBlockReason())return;
    if(now<=state.last&&!settleAtSameTime){Progression.ensureDaily(state,now);NPCDefense.tick(state,now);ScoutSystem.tick(state,now,scoutApi());WarCare.tick(state,now);if(allowAutomation){processPlotTemplate();processAutoUpgrade();processAutoResearch();}return;}
    const start=Math.max(state.last,accrualFloor);
    // Settle queues in timestamp order so offline buildings only boost production after completion.
    const events=[...state.buildQueue.map(q=>({q,type:'build'})),...state.trainQueue.map(q=>({q,type:'train'})),...(state.researchQueue?[{q:state.researchQueue,type:'research'}]:[]),...state.defenseQueue.map(q=>({q,type:'defense'})),...allExpeditions().filter(q=>q.phase==='return').map(q=>({q,type:'expeditionReturn'})),...Object.entries(state.garrisons).filter(([,q])=>q.phase==='return').map(([id,q])=>({q,id,type:'garrisonReturn'})),...Object.values(state.buffs).map(q=>({q,type:'buffExpire'}))].filter(e=>e.q.end<=now).sort((a,b)=>a.q.end-b.q.end);
    let cursor=start;
    function accrue(end){while(cursor<end){const next=Math.min(end,cursor+30000),dt=(next-cursor)/60000;economyClock=cursor;const r=rates();for(const k of Object.keys(resources)){if(r[k]<0)state.res[k]=Math.max(0,state.res[k]+r[k]*dt);else if(state.res[k]<capacity(k))state.res[k]=Math.min(capacity(k),state.res[k]+r[k]*dt);}const change=dt*state.speed/6,target=GovernanceSystem.moraleTarget(state);state.morale+=Math.sign(target-state.morale)*Math.min(Math.abs(target-state.morale),change);const popTarget=maxPop()*state.morale/100;state.population=Math.max(0,Math.min(maxPop(),state.population+Math.sign(popTarget-state.population)*Math.min(Math.abs(popTarget-state.population),Math.max(1,maxPop()*.01)*dt*state.speed)));GovernanceSystem.tickCity(state,next);cursor=next;}economyClock=null;}

    for(const e of events){accrue(Math.max(start,e.q.end));const xp=e.type==='build'&&state.governor?HeroSystem.constructionXp(e.q.level):0;if(['build','train','research','defense'].includes(e.type))AutomationSystem.record(state,e.type,e.q,e.q.end,xp?' · 城守 '+general(state.governor).name+' 经验 +'+xp:'');if(e.type==='build'){if(e.q.plot!==undefined)state.plots[e.q.plot]={type:e.q.id,level:e.q.level};else{state.cityLevels[e.q.site]=e.q.level;refreshBuildings();}state.buildQueue=state.buildQueue.filter(q=>q!==e.q);if(state.governor)HeroSystem.addXp(state,state.governor,xp);state.prestige+=e.q.level*50;Progression.record(state,'build',1,e.q.end);Progression.record(state,e.q.plot!==undefined?'field_build':'city_build',1,e.q.end);}else if(e.type==='train'){state.army[e.q.id]+=e.q.count;state.stats.trained+=e.q.count;state.prestige+=Math.ceil(e.q.count/5);Progression.record(state,'train',e.q.count,e.q.end);Progression.record(state,'train_'+e.q.id,e.q.count,e.q.end);state.trainQueue=state.trainQueue.filter(q=>q!==e.q);}else if(e.type==='research'){state.tech[e.q.id]=e.q.level;state.researchQueue=null;state.prestige+=e.q.level*100;Progression.record(state,'research',1,e.q.end);const category=Progression.researchMetric(e.q.id);if(category)Progression.record(state,'research_'+category,1,e.q.end);}else if(e.type==='defense'){state.defenses[e.q.id]+=e.q.count;Progression.record(state,'defense',e.q.count,e.q.end);state.defenseQueue=state.defenseQueue.filter(q=>q!==e.q);}else if(['expeditionReturn','garrisonReturn'].includes(e.type)){for(const [id,n] of Object.entries(e.q.army))state.army[id]+=n;if(e.type==='garrisonReturn')delete state.garrisons[e.id];else if(state.expedition===e.q)state.expedition=null;else state.expeditions=state.expeditions.filter(q=>q!==e.q);}}
    accrue(now);state.last=now;Progression.ensureDaily(state,now);
    for(const [id,g] of Object.entries(state.garrisons))if(g.phase==='return'&&g.end<=now){for(const [k,n] of Object.entries(g.army))state.army[k]+=n;delete state.garrisons[id];}
    if(state.expedition?.phase==='return'&&state.expedition.end<=now){for(const [k,n] of Object.entries(state.expedition.army))state.army[k]+=n;state.expedition=null;}
    for(const e of [...state.expeditions])if(e.phase==='return'&&e.end<=now){for(const [k,n] of Object.entries(e.army))state.army[k]+=n;state.expeditions=state.expeditions.filter(x=>x!==e);}
    if(!state.expedition&&state.expeditions.length&&(!state.battle||state.battle.finished))state.expedition=state.expeditions.shift();
    NPCDefense.tick(state,now);ScoutSystem.tick(state,now,scoutApi());WarCare.tick(state,now);if(allowAutomation){processPlotTemplate();processAutoUpgrade();processAutoResearch();}
  }
  function canPay(cost){return Object.entries(cost).every(([k,v])=>state.res[k]>=v);}
  function pay(cost){for(const [k,v] of Object.entries(cost))state.res[k]-=v;}
  // The same per-resource capacity calculation powers settlement and dispatch estimates.
  function storageQuote(loot,stock=state.res,allowOverCapacity=false){
    const rows=Object.entries(loot).map(([id,amount])=>{const limit=capacity(id),room=Math.max(0,limit-stock[id]),received=Math.min(amount,allowOverCapacity?Math.max(0,Number.MAX_SAFE_INTEGER-stock[id]):room);return {id,amount,stock:stock[id],limit,room,received,overflow:amount-received,overCapacity:Math.max(0,received-room)};});
    return {rows,received:rows.reduce((sum,row)=>sum+row.received,0),overflow:rows.reduce((sum,row)=>sum+row.overflow,0),overCapacity:rows.reduce((sum,row)=>sum+row.overCapacity,0)};
  }
  function settleLoot(loot,allowOverCapacity=false){const quote=storageQuote(loot,state.res,allowOverCapacity);for(const row of quote.rows)state.res[row.id]+=row.received;return {loaded:{...loot},received:Object.fromEntries(quote.rows.map(r=>[r.id,r.received])),overflow:Object.fromEntries(quote.rows.map(r=>[r.id,r.overflow])),...(allowOverCapacity?{overCapacity:Object.fromEntries(quote.rows.map(r=>[r.id,r.overCapacity]))}:{})};}
  function validReceipt(receipt){
    const object=x=>x&&typeof x==='object'&&!Array.isArray(x),finite=n=>Number.isFinite(n)&&n>=0&&n<=Number.MAX_SAFE_INTEGER;
    if(!object(receipt)||!['loaded','received','overflow'].every(key=>object(receipt[key])&&Object.entries(receipt[key]).every(([id,n])=>Object.hasOwn(resources,id)&&finite(n))))return false;
    const ids=Object.keys(receipt.loaded);return ['received','overflow'].every(key=>Object.keys(receipt[key]).length===ids.length&&ids.every(id=>Object.hasOwn(receipt[key],id)))&&(receipt.overCapacity===undefined||object(receipt.overCapacity)&&Object.keys(receipt.overCapacity).length===ids.length&&ids.every(id=>Object.hasOwn(receipt.overCapacity,id)&&finite(receipt.overCapacity[id])&&receipt.overCapacity[id]<=receipt.received[id]))&&ids.every(id=>Math.abs(receipt.loaded[id]-receipt.received[id]-receipt.overflow[id])<1e-6);
  }
  function validOverCapacityTotal(result){
    if(result.overCapacity===undefined)return true;
    const base=result.resourceReceipt?.base?.overCapacity,bonus=result.resourceReceipt?.bonus?.overCapacity;
    return Number.isFinite(result.overCapacity)&&result.overCapacity>=0&&result.overCapacity<=Number.MAX_SAFE_INTEGER&&base!==undefined&&bonus!==undefined&&Math.abs(result.overCapacity-Object.values(base).reduce((sum,n)=>sum+n,0)-Object.values(bonus).reduce((sum,n)=>sum+n,0))<1e-6;
  }
  const receiptOverflow=r=>Object.values(r.overflow).reduce((sum,n)=>sum+n,0);
  function addRes(loot){return receiptOverflow(settleLoot(loot));}
  const administrationApi=()=>({generalBusy,cityId:currentCityId()});
  const heroAdministrationQuote=id=>{const q=HeroAdministration.prepareQuote(state,general(id),currentCityId(),Date.now(),administrationApi());return domesticStrategyAvailable()?q:{...q,ok:false,reason:domesticStrategyReason()};};
  function prepareHeroAdministration(id,key){const block=domesticStrategyReason();if(block)return block;tick(Date.now(),false);const result=HeroAdministration.prepare(state,general(id),currentCityId(),Date.now(),key,administrationApi());if(result.ok)save();return result.ok?null:result.reason;}
  const regionFrontQuote=(level)=>{const q=RegionalFront.quote(state,cityMeta(),Date.now(),level);return q&&!domesticStrategyAvailable()?{...q,reason:domesticStrategyReason()}:q;};
  const regionalFrontStatus=(cityId=currentCityId())=>withCityScope(cityId,()=>{const q=regionFrontQuote();return q?{...q,run:CitySystem.clone(state.regionalFront.run),ledger:CitySystem.clone(state.regionalFront)}:null;});
  function startRegionalFront(level,key){const block=domesticStrategyReason();if(block)return block;tick(Date.now(),false);const now=Date.now(),error=RegionalFront.start(state,cityMeta(),now,key,{requestRegional:m=>NPCDefense.requestRegional(state,now,m)},level);if(!error)save();return error;}
  const defenseApi=()=>({units,defenses:ManualData.defenses,unitStats,general,generalBusy,settleLoot:loot=>settleLoot(loot,!!state.cityDefense.battle?.front),capLoot,carry,consumeAdministrationDefense:(_selected,drill)=>domesticStrategyAvailable()?HeroAdministration.consumeDefense(state,general(state.governor),currentCityId(),drill,administrationApi()):null,addXp:(id,xp)=>HeroSystem.addXp(state,id,xp)});
  function requestCityDefense(profile='classic',level,key){tick();const error=NPCDefense.requestChallenge(state,Date.now(),profile,level,key);if(!error)save();return error;}
  function setAutoCityDefense(enabled){tick();const error=NPCDefense.setAutomatic(state,Date.now(),enabled);if(!error)save();return error;}
  function startCityDefense(drill=false,generalId=state.governor,army){if(state.cityDefense.incoming?.front&&!domesticStrategyAvailable())return domesticStrategyReason();tick();const error=NPCDefense.begin(state,defenseApi(),Date.now(),drill,generalId,army);if(!error&&state.cityDefense.battle?.front)RegionalFront.markBattle(state,state.cityDefense.battle);if(!error&&state.cityDefense.battle?.doctrine?.autoResolve){const result=resolveCityDefense();return typeof result==='string'?result:null;}save();return error;}
  function cityDefenseRound(){if((state.cityDefense.battle?.front||state.cityDefense.battle?.administrationDefense)&&!domesticStrategyAvailable())return domesticStrategyReason();tick();const now=Date.now(),result=NPCDefense.round(state,defenseApi(),now);if(result&&typeof result==='object'&&result.front){const error=RegionalFront.settle(state,result,now,{addMerit:points=>{state.warOrders.merit+=points;state.warOrders.earned+=points;}});if(error)return error;}save();return result;}
  function endDefenseDrill(){const error=NPCDefense.endDrill(state);save();return error;}
  function buildRecord(id,level){return level>10&&Object.hasOwn(plotTypes,id)?NamedCitySystem.fieldRecord(id,level,buildings[id]):level>0?buildings[id]?.rows[level-1]:null;}
  const plotMaxLevel=()=>NamedCitySystem.profile(cityMeta()).plotMax;
  function refreshBuildings(){for(const id of cityIds)state.buildings[id]=Math.max(0,...state.cityLayout.map((type,i)=>type===id?state.cityLevels[i]:0));}
  const primarySite=id=>state.cityLayout.indexOf(id);
  const buildLimit=()=>activeBuff('labor')?5:2;
  function buildSeconds(id,level){const referenceSeconds=buildRecord(id,level).seconds||600,seconds=id==='hall'&&OnboardingData.hallBuildSeconds?OnboardingData.hallBuildSeconds(level,referenceSeconds):referenceSeconds;return Math.max(1,seconds/(1+state.tech.construction*.1+general(state.governor).pol/100)/state.speed);}
  function completeFirstBattleGuide(){tick(Date.now(),false);const error=OnboardingSystem.completeFirstBattle(state);save();return error;}
  function upgradeCost(id){const site=typeof id==='number'?id:primarySite(id),type=typeof id==='number'?state.cityLayout[site]:id,level=state.cityLevels[site]||0;return buildRecord(type,level+1)?.cost||{};}
  function queueBuilding(site,id){tick(Date.now(),false);return enqueueBuilding(site,id);}
  function requirementLevel(id){return Object.hasOwn(plotTypes,id)?Math.max(0,...state.plots.filter(p=>p.type===id).map(p=>p.level)):state.buildings[id]||0;}
  function requirementsText(list,onlyMissing=true){return list.filter(r=>!onlyMissing||(r.kind==='building'?requirementLevel(r.id):r.kind==='tech'?state.tech[r.id]:state.inventory[r.id]||0)<r.level).map(r=>r.kind==='item'?'消耗 '+ManualData.shop.find(i=>i.id===r.id).name+' ×'+r.level:(r.kind==='building'?buildings[r.id].name:ManualData.technology[r.id].name)+' '+r.level+' 级').join('、');}
  function buildingConditions(id,level){const list=[...(ReferenceRules.buildingConditions[id]?.[level]||[])];if(id==='wall')list.unshift({kind:'building',id:'hall',level:2});if(Object.hasOwn(plotTypes,id)&&level>10)list.unshift({kind:'building',id:'hall',level:10});return list;}
  function buildingRequirements(id,level=1){return requirementsText(buildingConditions(id,level));}
  function buildingRuleText(id,level){return requirementsText(buildingConditions(id,level),false);}
  function payBuildingItems(id,level){const paid={};for(const r of buildingConditions(id,level).filter(r=>r.kind==='item')){state.inventory[r.id]-=r.level;paid[r.id]=(paid[r.id]||0)+r.level;}return paid;}
  function researchRequirements(id){return requirementsText(ReferenceRules.researchConditions[id]?.[state.tech[id]+1]||[]);}
  function researchRuleText(id){return requirementsText(ReferenceRules.researchConditions[id]?.[state.tech[id]+1]||[],false);}
  function defenseCapacity(){return ReferenceRules.wallRows.find(r=>r.level===state.buildings.wall)?.area||0;}
  function defenseUsed(){return Object.entries(NPCDefense.heldDefenses(state)).reduce((v,[id,n])=>v+n*(ManualData.defenses[id].area||1),0)+Object.entries(state.defenses).reduce((v,[id,n])=>v+n*(ManualData.defenses[id].area||1),0)+state.defenseQueue.reduce((v,q)=>v+q.count*(ManualData.defenses[q.id].area||1),0);}
  function defenseRequirements(id,count=1){const d=ManualData.defenses[id];return requirementsText(d?.requires||[])||(defenseUsed()+count*(d?.area||1)>defenseCapacity()?'城防空间不足':'');}
  function enqueueBuilding(site,id){if(!Number.isInteger(site)||site<0||site>=36||!cityIds.includes(id)||state.cityLayout[site]==='reserved')return '请选择城内空地';const requirement=buildingRequirements(id,(state.cityLevels[site]||0)+1);if(requirement)return requirement;const current=state.cityLayout[site],level=state.cityLevels[site]||0;if(current&&current!==id)return '这块地已有其他建筑';if(!current&&!buildings[id].repeat&&state.cityLayout.includes(id))return '该建筑在本城只能建一座';if(level>=10)return '本城建筑最高 10 级';if(state.buildQueue.length>=buildLimit())return '建造队正在忙碌';if(state.buildQueue.some(q=>q.site===site))return '该建筑正在施工';const cost=buildRecord(id,level+1).cost;if(!canPay(cost))return '建设资源不足';pay(cost);state.cityLayout[site]=id;const start=Date.now();state.buildQueue.push({id,site,paidItems:payBuildingItems(id,level+1),kind:level?'upgrade':'build',level:level+1,paid:{...cost},start,end:start+buildSeconds(id,level+1)*1000});save();return null;}
  function upgrade(id){const site=typeof id==='number'?id:primarySite(id);return site<0?'请先在城内空地建造':queueBuilding(site,state.cityLayout[site]);}
  const unlockedPlots=()=>Math.min(PLOT_COUNT,Math.max(12+(state.buildings.hall-1)*3,1+state.plots.findLastIndex(p=>p.type!==null)));
  const plotJob=index=>state.buildQueue.find(q=>q.plot===index);
  function plotCost(index,type){const p=state.plots[index];return buildRecord(type,p?.type===type?p.level+1:1)?.cost||{};}
  function plotTime(index,type){const p=state.plots[index];return buildSeconds(type,p.type===type?p.level+1:1);}
  function developPlot(index,type){tick(Date.now(),false);const error=enqueuePlot(index,type);if(!error){state.plotTemplate.active=false;save();}return error;}
  function enqueuePlot(index,type){if(!Number.isInteger(index)||index<0||index>=unlockedPlots())return '升级官府后可开垦这块土地';if(!Object.hasOwn(plotTypes,type))return '请选择资源产业';if(plotJob(index))return '该地块正在施工';if(state.buildQueue.length>=buildLimit())return '建造队正在忙碌';const p=state.plots[index],same=p.type===type;if(same&&p.level>=plotMaxLevel())return '本城资源田最高 '+plotMaxLevel()+' 级';const requirement=buildingRequirements(type,same?p.level+1:1);if(requirement)return '需要 '+requirement;const cost=plotCost(index,type);if(!canPay(cost))return '资源不足';pay(cost);const start=Date.now();state.buildQueue.push({id:type,plot:index,paidItems:payBuildingItems(type,same?p.level+1:1),paid:{...cost},kind:same?'upgrade':p.type?'replace':'build',level:same?p.level+1:1,start,end:start+plotTime(index,type)*1000});save();return null;}
  function plotTemplateQuote(id=state.plotTemplate.id,mode=state.plotTemplate.mode){
    const meta=PlotTemplateData.templates.find(t=>t.id===id);
    if(!meta||!['fill','replace'].includes(mode))return {id,mode,error:'请选择城外样板与建设方式',reason:'请选择城外样板与建设方式',tasks:[],counts:{},cost:{}};
    const plan=PlotTemplateData.plan(state,id,unlockedPlots(),units,mode),cost={};
    for(const task of plan.tasks)for(const [key,value] of Object.entries(plotCost(task.index,task.type)))cost[key]=(cost[key]||0)+value;
    let reason='';
    if(!plan.tasks.length)reason=state.buildQueue.some(q=>q.plot!==undefined)?'等待当前城外工程完工':'当前开放土地已按此方式处理完成';
    else if(state.buildQueue.length>=buildLimit())reason='等待空闲建造队';
    else if(!plan.tasks.some(t=>!buildingRequirements(t.type,1)&&AutomationSystem.canSpend(state,plotCost(t.index,t.type))))reason=plan.tasks.every(t=>buildingRequirements(t.type,1))?'等待资源田建设前置':'等待资源积累或降低保留额度';
    return {...plan,name:meta.name,cost,reason};
  }
  function setPlotTemplate(id){
    if(!PlotTemplateData.templates.some(t=>t.id===id))return '请选择城外样板';
    tick(Date.now(),false);state.plotTemplate={id,active:false,mode:'fill'};save();return null;
  }
  function applyPlotTemplate(id,mode='fill'){
    tick(Date.now(),false);const quote=plotTemplateQuote(id,mode);if(quote.error)return quote.error;
    state.plotTemplate={id,active:true,mode};state.autoUpgrade=false;processPlotTemplate();save();return null;
  }
  function pausePlotTemplate(){state.plotTemplate.active=false;save();return null;}
  function processPlotTemplate(){
    if(!state.plotTemplate.active)return 0;
    let started=0;
    for(let attempt=0;attempt<PLOT_COUNT;attempt++){
      const quote=plotTemplateQuote();
      if(!quote.tasks.length){if(!state.buildQueue.some(q=>q.plot!==undefined)){state.plotTemplate.active=false;save();}break;}
      if(state.buildQueue.length>=buildLimit())break;
      const task=quote.tasks.find(t=>!buildingRequirements(t.type,1)&&AutomationSystem.canSpend(state,plotCost(t.index,t.type)));
      if(!task||enqueuePlot(task.index,task.type))break;
      state.buildQueue[state.buildQueue.length-1].template=state.plotTemplate.id;started++;
    }
    if(started)save();return started;
  }
  function plotTemplateStatus(){
    const p=state.plotTemplate;if(!p.id)return '请选择城外样板';
    const quote=plotTemplateQuote();if(!p.active)return quote.tasks.length?'已暂停 · 待安排 '+quote.tasks.length+' 块':quote.reason;
    return quote.reason||'按样板建设中 · 待安排 '+quote.tasks.length+' 块';
  }
  function autoUpgradeCandidates(){
    const candidates=[];
    state.cityLayout.forEach((id,index)=>{
      const level=state.cityLevels[index];
      if(!cityIds.includes(id)||level<1||level>=buildings[id].max||buildingRequirements(id,level+1)||buildingConditions(id,level+1).some(r=>r.kind==='item')||state.buildQueue.some(q=>q.site===index))return;
      candidates.push({area:'city',index,id,level,cost:buildRecord(id,level+1).cost});
    });
    state.plots.forEach((plot,index)=>{
      if(!plot.type||plot.level<1||plot.level>=plotMaxLevel()||index>=unlockedPlots()||plotJob(index)||buildingRequirements(plot.type,plot.level+1)||buildingConditions(plot.type,plot.level+1).some(r=>r.kind==='item'))return;
      candidates.push({area:'plot',index,id:plot.type,level:plot.level,cost:plotCost(index,plot.type)});
    });
    const price=c=>Object.values(c.cost).reduce((sum,n)=>sum+n,0);
    return candidates.sort((a,b)=>a.level-b.level||price(a)-price(b)||a.area.localeCompare(b.area)||a.index-b.index);
  }
  function processAutoUpgrade(){
    if(!state.autoUpgrade)return 0;
    let started=0;
    while(state.buildQueue.length<buildLimit()){
      // Recompute after every payment, so two queues never spend the same stock.
      const candidate=autoUpgradeCandidates().find(c=>AutomationSystem.canSpend(state,c.cost));
      if(!candidate)break;
      const error=candidate.area==='city'?enqueueBuilding(candidate.index,candidate.id):enqueuePlot(candidate.index,candidate.id);
      if(error)break;
      state.buildQueue[state.buildQueue.length-1].auto=true;started++;
    }
    if(started)save();return started;
  }
  function autoUpgradeStatus(){
    if(!state.autoUpgrade)return '已暂停';
    if(state.buildQueue.length>=buildLimit())return '等待空闲建造队';
    const candidates=autoUpgradeCandidates();
    if(!candidates.length)return state.buildQueue.length?'等待当前工程完工':'暂无可自动升级建筑，可能缺少前置或需要图纸';
    return candidates.some(c=>AutomationSystem.canSpend(state,c.cost))?'材料充足，准备升级':'等待资源积累或降低保留额度';
  }
  function setAutoUpgrade(enabled){
    if(typeof enabled!=='boolean')return '请选择自动升级状态';
    tick(Date.now(),false);state.autoUpgrade=enabled;if(enabled)state.plotTemplate.active=false;
    if(enabled)processAutoUpgrade();save();return null;
  }
  function cancelBuild(key){tick(Date.now(),false);const q=state.buildQueue.find(q=>q.plot===undefined?'site:'+q.site===key:'plot:'+q.plot===key);if(!q)return '没有正在进行的建设';state.autoUpgrade=false;state.plotTemplate.active=false;const fraction=.66;for(const [id,count] of Object.entries(q.paidItems||{}))state.inventory[id]=(state.inventory[id]||0)+Math.ceil(count*.66);addRes(Object.fromEntries(Object.entries(q.paid||{}).map(([k,v])=>[k,Math.floor(v*fraction)])));if(q.site!==undefined&&state.cityLevels[q.site]===0)state.cityLayout[q.site]=null;state.buildQueue=state.buildQueue.filter(x=>x!==q);refreshBuildings();save();return null;}
  function demolish(site){tick(Date.now(),false);const id=state.cityLayout[site],level=state.cityLevels[site];if(!id||id==='reserved'||id==='hall')return '官府和空地不能拆除';if(state.buildQueue.some(q=>q.site===site))return '请先取消施工';if(['tavern','drill'].includes(id)&&(allExpeditions().length||Object.keys(state.garrisons).length))return '请先收回外出部队';if(id==='tavern'&&state.generals.length>Math.max(0,level-1))return '请先处理将领房间不足';state.autoUpgrade=false;state.cityLevels[site]--;if(state.cityLevels[site]===0)state.cityLayout[site]=null;addRes(Object.fromEntries(Object.entries(buildRecord(id,level).cost).map(([k,v])=>[k,Math.floor(v*.5)])));refreshBuildings();save();return null;}
  function relocateBuilding(id,index){const old=primarySite(id);if(old<0||id==='hall'||!Number.isInteger(index)||index<0||index>=36||state.cityLayout[index])return '请选择空地，官府不能迁移';state.cityLayout[index]=id;state.cityLayout[old]=null;state.cityLevels[index]=state.cityLevels[old];state.cityLevels[old]=0;for(const q of state.buildQueue)if(q.site===old)q.site=index;save();return null;}
  function unitRequirements(id){const u=units[id];if(!u)return '兵种不存在';const missing=[];for(const [key,level] of Object.entries(u.requires.buildings))if(state.buildings[key]<level)missing.push(buildings[key].name+' '+level+'级');for(const [key,level] of Object.entries(u.requires.tech))if(state.tech[key]<level)missing.push(ManualData.technology[key].name+' '+level+'级');return missing.join('、');}
  const unitUnlocked=id=>!unitRequirements(id);
  const trainingLimit=()=>state.cityLayout.reduce((v,id,i)=>v+(id==='barracks'?state.cityLevels[i]:0),0);
  function trainCost(id,count){return Object.fromEntries(Object.entries(units[id].cost).map(([k,v])=>[k,v*count]));}
  function trainSeconds(id,count){const u=units[id],tech=u.kind==='machine'?state.tech.manufacture:state.tech.training;return Math.max(1,count*u.time/(1+tech*.1+general(HeritageSystem.effectiveHero(state,'train')).atk/100)/state.speed);}
  function train(id,count){tick();count=Math.floor(count);if(!units[id]||count<1||count>100000)return '请选择训练数量';const needed=unitRequirements(id);if(needed)return '需要 '+needed;if(state.trainQueue.length>=trainingLimit())return '军营训练队列已满';if(count*(units[id].people||1)>freePopulation())return '空闲人口不足，每名'+units[id].name+'需要 '+(units[id].people||1)+' 人口';const cost=trainCost(id,count);if(!canPay(cost))return '训练资源不足';pay(cost);state.population-=count*(units[id].people||1);const start=Math.max(Date.now(),...state.trainQueue.map(q=>q.end));state.trainQueue.push({id,count,start,end:start+trainSeconds(id,count)*1000});save();return null;}
  function dismissTroops(id,count){tick();count=Math.floor(count);if(!units[id]||count<1||count>state.army[id])return '数量不足';state.army[id]-=count;state.population=Math.min(maxPop(),state.population+count*(units[id].people||1));save();return null;}
  function general(id){const g=[...generals,...state.customGenerals].find(g=>g.id===id),lv=state.generalLevels[id]||1;if(!g)return {id,name:id?'未知将领':'尚未任命',level:1,atk:0,def:0,pol:0,wis:0,lead:0};const baseExtra=HeroSystem.bonus(state,id),skillExtra=GeneralGrowth.statBonus(state,id),extra=Object.fromEntries(Object.keys(baseExtra).map(k=>[k,baseExtra[k]+(skillExtra[k]||0)]));return {...g,level:lv,atk:(g.atk+(lv-1)*4+extra.atk)*(activeBuff('valor',id)?1.25:1),def:g.def+(lv-1)*3+extra.def,pol:(g.pol+extra.pol)*(activeBuff('politics',id)?1.25:1),wis:((g.wis||g.def)+extra.wis)*(activeBuff('wisdom',id)?1.25:1),lead:((g.lead||lv*10)+extra.lead)*(1+state.tech.leadership*.1)*(activeBuff('tiger',id)?1.5:1)};}
  function setGovernor(id){tick(Date.now(),false);if(!state.generals.includes(id))return '尚未招募该武将';if(generalBusy(id))return '该武将正在出征或驻守';for(const role of ['commander','counsellor'])if(state.cityRoles[role]===id)state.cityRoles[role]='';state.governor=id;save();return null;}
  function setTax(value){tick();state.tax=Math.max(0,Math.min(100,Math.round(Number(value)||0)));save();}
  function civicOrderPreview(id){
    if(typeof id!=='string')return null;
    if(id==='sacrifice')return GovernanceSystem.sacrificeQuote(state,Date.now());
    const rule=Object.hasOwn(ManualData.civic.comfort,id)?ManualData.civic.comfort[id]:null,resource=id.startsWith('levy_')?id.slice(5):null;
    if(!rule&&!Object.hasOwn(ManualData.civic.levyMultipliers,resource))return null;
    const kind=rule?'comfort':'levy',name=rule?.name||'征收'+resources[resource].name;
    const end=state.civicCooldowns[kind],cost={},reward={},effects={morale:0,unrest:0,population:0};
    let reason='',requested=0;
    if(rule?.unavailable)reason=rule.unavailable;
    else if(rule){
      cost[rule.resource]=Math.max(ManualData.civic.minimumCostPopulation,Math.ceil(state.population))*rule.costMultiplier;
      if(id==='immigration')effects.population=Math.max(0,Math.min(Math.floor(maxPop()-state.population),Math.max(rule.minimumIncrease,Math.ceil(state.population*rule.populationFraction))));
      else{effects.morale=Math.min(100,state.morale+rule.morale)-state.morale;effects.unrest=Math.max(0,state.unrest+rule.unrest)-state.unrest;}
      if(!Object.values(effects).some(n=>n!==0))reason=id==='immigration'?'人口已满，请先扩建民房':'民心已满且没有民怨';
    }else{
      requested=Math.floor(state.population)*ManualData.civic.levyMultipliers[resource];
      reward[resource]=Math.min(requested,Math.max(0,Math.floor(capacity(resource)-state.res[resource])));
      effects.morale=-20;
      if(state.population<1)reason='没有可征收的人口';
      else if(state.morale<20)reason='民心不足 20，无法征收';
      else if(reward[resource]<=0)reason=resources[resource].name+'已满仓，请先使用或扩充容量';
    }
    if(!rule?.unavailable){if(end>Date.now())reason=kind==='comfort'?'安抚冷却中':'征收冷却中';else if(!reason&&!canPay(cost))reason='所需'+Object.keys(cost).map(k=>resources[k].name).join('、')+'不足';}
    return {id,name,kind,cost,reward,requested,effects,cooldownEnd:end,reason,enabled:!reason};
  }
  function executeCivicOrder(id){
    tick(Date.now(),false);if(id==='sacrifice'){const error=GovernanceSystem.sacrifice(state,Date.now());if(!error){Progression.record(state,'civic');Progression.record(state,'comfort');save();}return error;}const order=civicOrderPreview(id);if(!order)return '官府指令不存在';if(order.reason)return order.reason;
    pay(order.cost);addRes(order.reward);
    state.morale=Math.max(0,Math.min(100,state.morale+order.effects.morale));
    state.unrest=Math.max(0,Math.min(100,state.unrest+order.effects.unrest));
    state.population=Math.min(maxPop(),state.population+order.effects.population);
    state.civicCooldowns[order.kind]=Date.now()+ManualData.civic.cooldownSeconds*1000;Progression.record(state,'civic');Progression.record(state,order.kind);
    save();return null;
  }
  const power=a=>Math.round(Object.entries(a).reduce((v,[k,n])=>v+n*(units[k].atk+units[k].hp/10),0));
  const marchSkillFactor=(army,id)=>Object.entries(army).filter(([,n])=>n>0).every(([unit])=>['cavalry','heavy','scout'].includes(unit))?GeneralGrowth.profile(state,id).marchFactor:1;
  function marchQuote(nodeId,army={},generalId=''){
    const node=getNode(nodeId),rows=Object.keys(units).filter(id=>Number.isFinite(Number(army?.[id]))&&Math.floor(Number(army?.[id]))>0).map(id=>({id,speed:unitStats(id).speed}));
    if(!node||!rows.length)return {error:!node?'目标不存在':'至少选择 1 名士兵',slowest:null,speed:0,seconds:1,returnSeconds:1};
    const slowest=rows.reduce((a,r)=>r.speed<a.speed?r:a),baselineSpeed=units.archer.speed,ratio=baselineSpeed/Math.max(1,slowest.speed),trialMultiplier=state.speed,origin=currentHome(),distance=Math.hypot(node.x-origin.x,node.y-origin.y),baseDistance=Math.hypot(node.x-home.x,node.y-home.y),time=node.time*(currentCityId()==='capital'||!Number.isFinite(distance)||!baseDistance?1:distance/baseDistance)/marchSkillFactor(army,generalId),strategy=cityStrategy(),baseSeconds=Math.max(1,time*ratio/trialMultiplier),baseReturnSeconds=Math.max(1,time/2*ratio/trialMultiplier);
    return {error:null,slowest:slowest.id,speed:slowest.speed,baselineSpeed,trialMultiplier,distance,sourceCity:currentCityId(),cityStrategy:strategy,marchFactor:strategy.marchFactor,baseSeconds,baseReturnSeconds,seconds:Math.max(1,baseSeconds*strategy.marchFactor),returnSeconds:Math.max(1,baseReturnSeconds*strategy.marchFactor)};
  }
  function dispatch(nodeId,id,army,mode='raid',returnAfterOccupy=false){if(typeof returnAfterOccupy!=='boolean')return '请选择占领后的返回方式';tick();const n=getNode(nodeId);if(!n)return '目标不存在';const blocked=attackBlocked(nodeId,mode);if(blocked)return blocked;if(state.buildings.drill<1)return '请先建造校场';if(allExpeditions().length>=state.buildings.drill)return '超过校场可派遣队伍数';if(allExpeditions().some(e=>e.node===nodeId))return '已有部队前往该目标';if(state.cooldowns[nodeId]>Date.now())return '据点仍在恢复';if(!state.generals.includes(id))return '请选择武将';if(generalBusy(id))return '该武将正在出征或驻守';if(HeritageSystem.roleOf(state,id))return '任职将领留守城池，请先在官府卸任或换将';let selected=blankArmy();for(const k of Object.keys(units)){const count=Math.floor(Number(army[k])||0);if(count<0||count>state.army[k])return '城内兵力不足';selected[k]=count;}if(!totalArmy(selected))return '至少选择 1 名士兵';if(totalArmy(selected)>armyLimit())return '超过校场单队人数上限';const supply=Math.ceil(totalArmy(selected)*1.2+n.time*2);if(state.res.food<supply)return '行军粮食不足';state.res.food-=supply;if(activeBuff('flag'))delete state.buffs.flag;for(const k of Object.keys(units))state.army[k]-=selected[k];if(!state.expedition&&state.battle?.finished)state.battle=null;const expedition={node:nodeId,general:id,mode,returnAfterOccupy:(n.wild||isCity(n))&&mode==='occupy'&&returnAfterOccupy,sourceCity:currentCityId(),origin:{...currentHome()},generalSnapshot:{...general(id)},skillProfile:GeneralGrowth.profile(state,id),returnSeconds:marchQuote(nodeId,selected,id).returnSeconds,army:selected,enemySnapshot:{...attackInfo(nodeId,mode).army},orders:JSON.parse(JSON.stringify(state.tactics)),phase:'march',start:Date.now(),end:Date.now()+marchQuote(nodeId,selected,id).seconds*1000};if(!state.expedition)state.expedition=expedition;else state.expeditions.push(expedition);save();return null;}

  const isCity=n=>n?.terrain==='fort';
  const nLevel=id=>getNode(id)?.level||1;
  const generalBusy=id=>externalGeneralBusy.has(id)||heroCity(id)!==currentCityId()||state.realm.logistics.some(j=>j.general===id)||CitySystem.list(state).some(c=>{const d=CitySystem.scope(state,c);return !!(d.cityDefense.battle&&d.cityDefense.battle.general===id)||[...(d.expedition?[d.expedition]:[]),...d.expeditions,...Object.values(d.garrisons)].some(e=>e.general===id);});
  const wildOwned=()=>Object.keys(state.conquered).filter(id=>getNode(id)?.wild&&state.realm.wildOwners[id]===currentCityId()&&!state.realm.cities[CitySystem.idFor(id)]).length;
  function attackBlocked(id,mode){
    const n=getNode(id);if(!n)return '目标不存在';if(!['raid','occupy'].includes(mode))return '请选择掠夺或占领';
    if(n.encounter&&!tacticsAvailable())return '战术遭遇目前支持单机逐回合战斗，请切回单机模式';
    if(n.orderRoute)return WarOrders.blocked(state,n,mode);
    const namedBlocked=NamedCitySystem.attackBlocked(state,id);if(namedBlocked)return namedBlocked;
    const chapterBlocked=ChapterData.blocked(state,id);if(chapterBlocked)return chapterBlocked;
    if(isCity(n)&&!n.openCity&&!Progression.countyUnlocked(state))return '黄巾之乱四项史诗尚未全部完成，县城攻打未开放';
    if(state.conquered[id]&&(n.wild||isCity(n)))return '这块领地已归属你，可在领地管理中召回驻军或放弃野地';
    if(mode==='occupy'&&isCity(n)&&cityList().length>=cityLimit())return '城池名额已满';
    if(mode==='occupy'&&state.conquered[id])return '据点已占领';
    if(mode==='occupy'&&n.wild&&wildOwned()>=state.buildings.hall)return '附属野地已满，升级官府或放弃一块野地';
    return null;
  }
  function attackInfo(id,mode='raid'){
    const n=getNode(id);if(!n)return null;const city=isCity(n),siege=(city||!!n.fortification)&&mode==='occupy',town=city?state.towns[id]:null;
    const militia=siege&&town?Math.ceil(town.population*.1):0,army={...n.army};if(militia)army.militia=(army.militia||0)+militia;
    const factor=(mode==='raid'?RAID_LOOT_FACTOR*(n.wild&&n.level>=3?2:1):1)*(state.raided[id]?.6:1)*(city&&mode==='raid'?Math.min(1,.6+state.tech.plunder*.03):1);
    const yellowGold=n.faction==='yellow_turban'&&n.openCity&&mode==='occupy',goldReadyAt=yellowGold?state.yellowGold?.[id]||0:null;
    const loot=Object.fromEntries(Object.entries(n.loot).filter(([k])=>mode!=='raid'||k!=='gold').map(([k,v])=>[k,k==='gold'&&yellowGold?(goldReadyAt>Date.now()?0:v):Math.round(v*factor)]));
    return {army,loot,goldReadyAt,siege,militia,morale:town?.morale??null,unrest:town?.unrest??null,population:town?.population??null};
  }
  function recallGarrison(id){
    tick();const source=CitySystem.list(state).find(c=>CitySystem.scope(state,c).garrisons[id]);if(source&&source.id!==currentCityId())switchCity(source.id);const g=state.garrisons[id];if(!g)return '这里没有驻军';if(g.phase!=='stationed')return '部队已在返城途中';if(state.gatherings[id])return '请先收获或取消采集，再召回驻军';g.phase='return';g.start=Date.now();g.end=Date.now()+marchQuote(id,g.army).returnSeconds*1000;save();return null;
  }
  function abandonWild(id){
    tick();const n=getNode(id);if(!n?.wild||!state.conquered[id])return '只能放弃已占领野地';if(state.garrisons[id])return '请先召回驻军，待部队返城后再放弃';if(state.realm.cities[CitySystem.idFor(id)])return '此处已经筑城，不能作为野地放弃';delete state.conquered[id];delete state.landClaims[id];delete state.realm.wildOwners[id];save();return null;
  }

  const defaultOrder=id=>['archer','ballista','catapult'].includes(id)?'hold':'advance';
  const battleLength=rows=>Math.max(0,...rows.map(r=>r.stats?.range||units[r.id].range))+200;
  function formation(army,enemy=false,length=1400){return Object.entries(army).filter(([,n])=>n>0).map(([id,n])=>({id,initial:n,stats:unitStats(id,!enemy),hp:n*unitStats(id,!enemy).hp,maxHp:n*unitStats(id,!enemy).hp,pos:enemy?length:0,defending:false}));}
  const survivors=rows=>Object.fromEntries(Object.keys(units).map(id=>[id,Math.ceil((rows.find(r=>r.id===id)?.hp||0)/(rows.find(r=>r.id===id)?.stats.hp||units[id].hp))]));
  const stratagemApi={units,log:(b,text)=>pushLog(b,text)};
  function enemyGeneralSnapshot(node){const encounter=WarOrders.encounterConfig?.(node.id),rumor=state.wildGenerals?.rumors.find(r=>r.status==='active'&&r.node===node.id),definition=rumor&&HeroSystem.wild.definitions.find(d=>d.line===rumor.line);return {id:'enemy_'+node.id,name:definition?.name||node.commander?.name||'守军',wildLine:definition?.line||'',...(encounter?{encounterIdentity:encounter.enemyIdentity}:{})};}
  function tacticSubmit(b,side,type,args,key){
    if(!b||b.finished||b.rules!==3||!tacticsAvailable())return {ok:false,reason:'此战斗不支持名将计谋；请在单机新出征或教学演练中使用。'};
    const action={...args,type},q=BattleStratagems.quote(b,side,action,stratagemApi),r=BattleStratagems.submit(b,side,action,key===undefined?q.key:key,stratagemApi);
    if(r.ok&&!r.replayed&&q.requiredOrder){const orders=side==='player'?b.orders:b.enemyOrders;const unit=action.unit||q.unit;if(orders?.[unit])orders[unit].command=q.requiredOrder;}
    return r;
  }
  function planEnemyTactic(b,node){
    if(!b.stratagem||b.lesson||b.finished)return;
    const encounter=WarOrders.encounterConfig?.(node.id);
    if(encounter){
      for(const r of b.enemy)b.enemyOrders[r.id]={...(encounter.enemyOrders[r.id]||{command:defaultOrder(r.id),target:''})};
      // A paid preparation retains its required order until its response is resolved.
      for(const p of b.stratagem.plans.filter(p=>p.side==='enemy'&&p.status==='prepared')){
        if(b.enemyOrders[p.unit]){if(p.type==='weiyan'&&p.round===b.stratagem.round)b.enemyOrders[p.unit].command='fallback';if(p.type==='huangzhong')b.enemyOrders[p.unit].command='hold';}
      }
      for(const plan of encounter.plans.filter(p=>p.atRound===b.round)){
        const attempts=plan.targetPolicy==='firstEligibleMelee'?b.player.filter(r=>r.hp>0&&BattleStratagems.RULES.melee.includes(r.id)).map(r=>({...plan.action,target:r.id})):[plan.action];
        for(const action of attempts){const q=BattleStratagems.quote(b,'enemy',action,stratagemApi);if(q.ok&&tacticSubmit(b,'enemy',action.type,action,q.key).ok)break;}
      }
      return;
    }
    for(const r of b.enemy)b.enemyOrders[r.id]={command:b.gate?.hp>0&&node.commander?.order?node.commander.order:defaultOrder(r.id),target:''};
    const identity=b.stratagem.version===1?{action:b.stratagem.identities.enemy}:BattleStratagems.identity(b.enemyGeneralSnapshot),attempt=action=>{const q=BattleStratagems.quote(b,'enemy',action,stratagemApi);return q.ok?tacticSubmit(b,'enemy',action.type,action,q.key).ok:false;};
    for(const p of b.stratagem.plans.filter(p=>p.side==='enemy'&&p.type==='zhaoyun'&&p.status==='prepared')){
      if(b.enemyOrders[p.unit])b.enemyOrders[p.unit].command='hold';
      if(b.enemyOrders[p.target])b.enemyOrders[p.target].command='fallback';
    }
    if(identity.action==='zhaoyun')for(const target of b.enemy.filter(r=>r.hp>0&&r.id!=='cavalry'))if(attempt({type:'zhaoyun',unit:'cavalry',target:target.id}))return;
    if(identity.action==='machao')for(const actor of b.enemy.filter(r=>r.hp>0&&['cavalry','heavy'].includes(r.id)))for(const target of b.player.filter(r=>r.hp>0&&BattleStratagems.RULES.melee.includes(r.id)))if(attempt({type:'machao',unit:actor.id,target:target.id}))return;
    if(identity.action==='huangzhong'&&attempt({type:'huangzhong',unit:'archer'}))return;
    if(identity.action==='weiyan'){for(const row of b.enemy.filter(r=>r.hp>0&&['spear','cavalry'].includes(r.id)))for(const target of b.player.filter(r=>r.hp>0))if(attempt({type:'weiyan',unit:row.id,target:target.id}))return;}
    // Automatic plans belong to the explicitly designed wild-general encounters.
    // Ordinary commanders retain their existing attacks and challenge balance.
    if(b.round===0&&identity.action==='xushu'){
      const actor=b.enemy.find(r=>r.hp>0),left=Math.floor(b.length/2)-50;if(actor)attempt({type:'fire',unit:actor.id,left});
    }
  }
  const heroIdentity=value=>typeof BattleStratagems==='undefined'?null:BattleStratagems.identity(typeof value==='string'?general(value):value);
  const battleTacticsView=(b=state.battle)=>b?.rules===3&&tacticsAvailable()?BattleStratagems.view(b,'player'):{enabled:false,reason:'旧版战斗、NPC守城与共享世界暂不支持新计谋。'};
  const battleTacticQuote=(type,args={},b=state.battle)=>b?.rules===3&&tacticsAvailable()?BattleStratagems.quote(b,'player',{...args,type},stratagemApi):{ok:false,reason:'此战斗不支持新计谋。',options:{actors:[],targets:[],preparations:[]}};
  function submitBattleTactic(type,args={},key){const r=tacticSubmit(state.battle,'player',type,args,key);if(r.ok)save();return r;}
  function cancelBattleTactic(id){const b=state.battle;if(!b||!b.stratagem||!tacticsAvailable())return {ok:false,reason:'此战斗不支持新计谋。'};const r=BattleStratagems.cancel(b,'player',id,stratagemApi);if(r.ok)save();return r;}
  function startTacticalLesson(id){
    if(!tacticsAvailable()||typeof TacticalLessons==='undefined')return '教学演练仅在单机模式可用';
    if(state.battle&&!state.battle.finished||state.cityDefense.battle)return '请先结束当前正式战斗或守城演练';
    const next=TacticalLessons.create(id,units);if(!next)return '演练不存在';
    lessonEvidence.set(next.battle,BattleReview.createRoundEvidence());next.battle.stratagem=BattleStratagems.create(next.battle,{player:next.battle.generalSnapshot,enemy:next.battle.enemyGeneralSnapshot});lessonSession=next;
    if(next.enemyPlan)tacticSubmit(next.battle,'enemy',next.enemyPlan.type,next.enemyPlan);
    return null;
  }
  const lessonInfo=()=>lessonSession?{id:lessonSession.id,title:lessonSession.title,basic:!!TacticalLessons.definitions.find(d=>d.id===lessonSession.id)?.basic,generalName:lessonSession.generalName,description:lessonSession.description,objective:lessonSession.objective,node:lessonSession.node,battle:lessonSession.battle,result:lessonSession.result,evidence:lessonEvidence.get(lessonSession.battle)}:null;
  function lessonOrder(index,command){const b=lessonSession?.battle,r=Number.isInteger(index)?b?.player[index]:null;if(!r||r.hp<=0||b.finished||!['advance','hold','fallback'].includes(command))return '演练指令无效';b.orders[r.id].command=command;return null;}
  function lessonTarget(index,target){const b=lessonSession?.battle,r=Number.isInteger(index)?b?.player[index]:null;if(!r||r.hp<=0||b.finished||target!==''&&!(target==='gate'&&b.gate?.hp>0)&&!b.enemy.some(t=>t.id===target))return '演练目标无效';b.orders[r.id].target=target;return null;}
  function lessonAllOrders(command){if(!lessonSession||!['advance','hold','fallback'].includes(command)||lessonSession.battle.finished)return '演练指令无效';for(let i=0;i<lessonSession.battle.player.length;i++)if(lessonSession.battle.player[i].hp>0)lessonOrder(i,command);return null;}
  const lessonTactic=(type,args={},key)=>tacticSubmit(lessonSession?.battle,'player',type,args,key);
  const lessonCancelTactic=id=>lessonSession?BattleStratagems.cancel(lessonSession.battle,'player',id,stratagemApi):{ok:false,reason:'尚未开始演练'};
  const endTacticalLesson=()=>{lessonSession=null;return null;};
  function startBattle(){
    tick();if(state.cityDefense.battle)return '请先结束守城战或演练';const e=state.expedition;if(!e||e.phase!=='march'||e.end>Date.now())return '部队尚未到达';
    const n=getNode(e.node);if(n.encounter&&!tacticsAvailable())return '战术遭遇目前支持单机逐回合战斗，请切回单机模式';
    const encounter=WarOrders.encounterConfig?.(n.id),info=attackInfo(n.id,e.mode),player=formation(e.army),enemy=formation(e.enemySnapshot||info.army,true),length=encounter?.length||battleLength([...player,...enemy]);for(const r of enemy)r.pos=encounter?.enemyPositions[r.id]??length;
    state.battle={rules:2,length,node:n.id,general:e.general,sourceCity:e.sourceCity||currentCityId(),generalSnapshot:e.generalSnapshot||{...general(e.general)},skillProfile:e.skillProfile||GeneralGrowth.profile(state,e.general),mode:e.mode,siege:info.siege,gate:SiegeSystem.gate(n,e.mode),militia:info.militia,round:0,machineGateAttacks:0,currentRoundSummary:{round:0,events:[]},player,enemy,orders:Object.fromEntries(player.map(r=>[r.id,{...e.orders[r.id]}])),log:['两军相距 '+length+'。按兵种速度依次行动，同速守方优先。'],auto:true,finished:false,result:null};
    normalizeBattleTargets(state.battle);
    if(tacticsAvailable()){const b=state.battle;b.rules=3;if(b.generalSnapshot.wildLine===undefined&&general(e.general)?.wildLine){b.generalSnapshot.wildLine=general(e.general).wildLine;if(e.generalSnapshot)e.generalSnapshot.wildLine=b.generalSnapshot.wildLine;}b.enemyGeneralSnapshot=enemyGeneralSnapshot(n);b.enemyOrders=Object.fromEntries(enemy.map(r=>[r.id,{command:b.gate?.hp>0&&n.commander?.order?n.commander.order:defaultOrder(r.id),target:''}]));b.stratagem=BattleStratagems.create(b,{player:b.generalSnapshot,enemy:b.enemyGeneralSnapshot});planEnemyTactic(b,n);}
    if(n.commander)pushLog(state.battle,'敌将 '+n.commander.name+' · '+n.commander.title+'：攻击 ×'+n.commander.attack+'，防御 ×'+n.commander.defense+'。');if(state.battle.gate)pushLog(state.battle,n.fortification.name+'：耐久 '+state.battle.gate.hp+'；冲车、投石车优先破城，破城后箭楼失效。');
    if(info.siege)pushLog(state.battle,'占领攻城：城防启用，义兵 '+info.militia+' 人加入义兵阵。');e.phase='battle';save();return null;
  }
  function normalizeBattleTargets(b){
    // Default expedition tactics may name a valid troop type absent from this encounter.
    // Clear only those stale targets; keep commands and malformed input validation intact.
    for(const [orders,foes,canTargetGate] of [[b.orders,b.enemy,true],[b.enemyOrders,b.player,false]]){
      for(const order of Object.values(orders||{})){
        const target=order.target;
        if(Object.hasOwn(units,target)&&!foes.some(row=>row.id===target)||target==='gate'&&(!canTargetGate||!b.gate?.hp))order.target='';
      }
    }
  }
  function setTactic(id,command,target){
    if(!Object.hasOwn(units,id))return '兵种不存在';
    const order=state.tactics[id];
    if(command!==undefined){if(!['advance','hold','fallback'].includes(command))return '指令不存在';order.command=command;}
    if(target!==undefined){if(target!==''&&!Object.hasOwn(units,target))return '目标不存在';order.target=target;}
    save();return null;
  }
  function setBattleOrder(id,command,target){
    const b=state.battle;if(!b||b.finished)return '当前没有进行中的战斗';
    if(!b.player.some(r=>r.id===id&&r.hp>0))return '该部队已无法行动';
    const order=b.orders[id];
    if(command!==undefined){if(!['advance','hold','fallback'].includes(command))return '请选择向前、坚守或后退';order.command=command;}
    if(target!==undefined){if(target!==''&&!(target==='gate'&&b.gate?.hp>0)&&!b.enemy.some(r=>r.id===target))return '目标兵种不存在';order.target=target;}
    save();return null;
  }
  function setBattleOrders(command){
    const b=state.battle;if(!b||b.finished)return '当前没有进行中的战斗';
    if(!['advance','hold','fallback'].includes(command))return '请选择前进、固守或后退';
    const living=b.player.filter(r=>r.hp>0);if(!living.length)return '当前没有可指挥的部队';
    for(const row of living)b.orders[row.id].command=command;save();return null;
  }
  function pushLog(b,text){b.log.push(text);b.log=b.log.slice(-40);}
  function battleRound(){return resolveBattleRound(state.battle);}
  function lessonRound(){if(!lessonSession)return '尚未开始演练';if(!tacticsAvailable())return '教学演练仅在单机模式可用';return resolveBattleRound(lessonSession.battle,lessonSession);}
  function resolveBattleRound(b,lesson=null){
    if(!b||b.finished)return b||null;if(b.rules===3&&!tacticsAvailable())return '此模式暂不支持名将计谋战斗';
    if(!lesson&&(b.round>=30||!b.player.some(r=>r.hp>0)||!b.enemy.some(r=>r.hp>0)&&!b.gate?.hp)){const error=finishBattle(b.player.some(r=>r.hp>0)&&!b.enemy.some(r=>r.hp>0)&&!b.gate?.hp);save();return error||b;}
    if(!b.generalSnapshot)for(const row of b.player){const stats=unitStats(row.id);row.hp=Math.min(row.initial*stats.hp,row.hp/row.stats.hp*stats.hp);row.maxHp=row.initial*stats.hp;row.stats=stats;}b.round++;
    const tactics=b.rules===3&&!!b.stratagem;
    normalizeBattleTargets(b);
    if(tactics){const begun=BattleStratagems.beginRound(b,{player:b.orders,enemy:b.enemyOrders},stratagemApi);if(!begun.ok){b.round--;return begun.reason;}}
    const currentRoundSummary={round:b.round,events:[]};b.currentRoundSummary=currentRoundSummary;
    const event=(type,side,unit,target,from,to,damage=0,killed=0,counter=false,ranged=false)=>currentRoundSummary.events.push({type,side,unit,target,from,to,damage,killed,counter,ranged});
    const g=b.generalSnapshot||general(b.general),living=rows=>rows.filter(r=>r.hp>0),node=lesson?.node||getNode(b.node),commander=SiegeSystem.commander(node);
    pushLog(b,'—— 第 '+b.round+' 回合 ——');
    const all=[...b.player.map(r=>({r,side:'player'})),...b.enemy.map(r=>({r,side:'enemy'}))].sort((a,z)=>z.r.stats.speed-a.r.stats.speed||(a.side===z.side?(tactics?a.r.id.localeCompare(z.r.id):0):a.side==='enemy'?-1:1));
    function strike(r,t,side,counter=false,tag=''){
      const u={...units[r.id],...r.stats};let mod=1;
      if(r.id==='spear'&&t.id==='cavalry')mod=1.6;
      if(r.id==='cavalry'&&t.id==='archer')mod=1.65;
      if(r.id==='archer'&&t.id==='shield')mod=.5;
      const coverage=Math.min(1,g.lead*100/Math.max(1,b.player.reduce((sum,row)=>sum+row.initial,0)));const attackBonus=side==='player'?1+(g.atk/220+(g.bonus===r.id?.12:0))*coverage:1.1*commander.attack;
      const defenseBonus=side==='enemy'?1+g.def/300*coverage:1;
      const damage=Math.max(1,Math.round(Math.ceil(r.hp/u.hp)*u.atk*attackBonus*mod*(side==='player'?(b.skillProfile?.attackByUnit?.[r.id]||1):1)/(1+t.stats.def/200)/defenseBonus/(side==='player'?SiegeSystem.protection(b,node)*commander.defense:1)));
      const beforeHp=t.hp,before=Math.ceil(t.hp/t.stats.hp);t.hp=Math.max(0,t.hp-damage);
      const lost=before-Math.ceil(t.hp/t.stats.hp),ranged=['archer','ballista','catapult'].includes(r.id);
      event('strike',side,r.id,t.id,r.pos,t.pos,Math.min(beforeHp,damage),lost,counter,ranged);
      if(tag)currentRoundSummary.events.at(-1).tag=tag;
      event('recoil',side==='player'?'enemy':'player',t.id,r.id,t.pos,t.pos,Math.min(beforeHp,damage),lost,counter,ranged);
      pushLog(b,(side==='player'?'我军':'敌军')+u.name+(counter?'反击':tag==='readyShot'?'预备射击':'攻击')+units[t.id].name+'，距离 '+Math.abs(t.pos-r.pos)+'，伤害 '+Math.min(beforeHp,damage)+(lost?'，击倒 '+lost+' 人':'')+(mod>1?' · 克制':''));
      if(tactics)BattleStratagems.pruneDead(b,stratagemApi);
    }
    for(const {r,side} of all){
      if(r.hp<=0)continue;
      const foes=living(side==='player'?b.enemy:b.player);if(!foes.length&&!(side==='player'&&b.gate?.hp>0))break;
      const u={...units[r.id],...r.stats},original=tactics?b.stratagem.orders[side][r.id]:side==='player'?b.orders[r.id]:{command:b.gate?.hp>0&&commander.order?commander.order:defaultOrder(r.id),target:''},order=tactics?BattleStratagems.preparationOrder(b,side,r.id,original):original,before=r.pos,override=tactics?BattleStratagems.movementOverride(b,side,r,order,stratagemApi):{forcedTarget:null,exclusive:false};
      const movementSpeed=Math.max(1,Math.floor(u.speed*(override.speedFactor||1)));
      if(order.command==='advance'){
        const direction=side==='player'?1:-1;
        const ahead=foes.filter(t=>direction*(t.pos-r.pos)>=0);
        const chase=override.forcedTarget,directionLegal=chase&&direction*(chase.pos-r.pos)>=0;
        const stop=chase?(directionLegal?chase.pos:r.pos):b.gate?.hp>0&&side==='player'&&!ahead.length?b.length:ahead.length?(side==='player'?Math.min(...ahead.map(t=>t.pos)):Math.max(...ahead.map(t=>t.pos))):r.pos;
        r.pos=side==='player'?Math.min(stop,r.pos+movementSpeed):Math.max(stop,r.pos-movementSpeed);
      }else if(order.command==='fallback')r.pos=side==='player'?Math.max(0,r.pos-movementSpeed):Math.min(b.length,r.pos+movementSpeed);
      r.pos=Math.max(0,Math.min(b.length,r.pos));if(tactics){const intended=r.pos;r.pos=BattleStratagems.clipMove(b,before,intended);if(r.pos!==intended)pushLog(b,'第 '+b.round+' 回合 · '+(side==='player'?'我军':'敌军')+u.name+'被火区截停：原定位置 '+intended+'，实际位置 '+r.pos+'；剩余移动丢失，没有额外生命伤害。');}r.defending=order.command==='hold';
      if(r.pos!==before)event('move',side,r.id,'',before,r.pos);
      if(r.pos!==before)pushLog(b,(side==='player'?'我军':'敌军')+u.name+(order.command==='fallback'?'后退':'向前')+Math.abs(r.pos-before)+'，位置 '+before+' → '+r.pos);
      if(tactics){
        const movements=BattleStratagems.afterMove(b,side,r,before,stratagemApi);
        for(let i=0;i<movements.length;i++){
          const trigger=movements[i];
          if(trigger.kind==='forcedMove'){
            event('move',trigger.side,trigger.unit,'',trigger.from,trigger.to);
            const moved=(trigger.side==='player'?b.player:b.enemy).find(x=>x.id===trigger.unit);
            if(moved?.hp>0&&trigger.from!==trigger.to)movements.push(...BattleStratagems.afterMove(b,trigger.side,moved,trigger.from,{...stratagemApi,forcedMove:true}));
            continue;
          }
          const shooter=(trigger.side==='player'?b.player:b.enemy).find(x=>x.id===trigger.unit),target=(trigger.side==='player'?b.enemy:b.player).find(x=>x.id===trigger.target);
          if(shooter?.hp>0&&target?.hp>0){strike(shooter,target,trigger.side,false,'readyShot');if(shooter.hp>0&&target.hp>0&&Math.abs(shooter.pos-target.pos)<=target.stats.range)strike(target,shooter,trigger.side==='player'?'enemy':'player',true);}
        }
        if(r.hp<=0)continue;
        if(!BattleStratagems.normalAttackAllowed(b,side,r.id)){pushLog(b,(side==='player'?'我军':'敌军')+u.name+'：本回合主攻击已预留或使用，正常反击保留。');continue;}
      }
      if(side==='player'&&!override.exclusive&&SiegeSystem.canHit(r,b)&&(order.target==='gate'||['ram','catapult'].includes(r.id)||!foes.some(t=>Math.abs(t.pos-r.pos)<=u.range))){if(tactics)BattleStratagems.markMainAttack(b,side,r.id);const damage=Math.round(SiegeSystem.damage(r)*(['ram','catapult'].includes(r.id)?(b.skillProfile?.gateFactor||1):1)),before=b.gate.hp;b.gate.hp=Math.max(0,b.gate.hp-damage);event('gate',side,r.id,'gate',r.pos,b.length,Math.min(before,damage),0,false,r.id==='catapult');event('recoil','enemy','gate',r.id,b.length,b.length,Math.min(before,damage));if(['ram','catapult'].includes(r.id)&&before>b.gate.hp)b.machineGateAttacks=(b.machineGateAttacks||0)+1;pushLog(b,'我军'+u.name+'攻击'+node.fortification.name+'，伤害 '+Math.min(before,damage)+'，剩余耐久 '+b.gate.hp+'。');if(!b.gate.hp)pushLog(b,'城防已破：守军掩护解除，箭楼停止射击。');continue;}
      const inRange=foes.filter(t=>t.hp>0&&Math.abs(t.pos-r.pos)<=u.range);
      const t=override.exclusive?inRange.find(t=>t===override.forcedTarget):inRange.find(t=>t.id===order.target)||inRange.sort((a,z)=>Math.abs(a.pos-r.pos)-Math.abs(z.pos-r.pos)||a.hp-z.hp)[0];
      if(!t){pushLog(b,(side==='player'?'我军':'敌军')+u.name+'：'+(order.command==='hold'?'坚守阵位，':'')+'射程 '+u.range+' 内没有目标。');continue;}
      if(tactics)BattleStratagems.markMainAttack(b,side,r.id);strike(r,t,side);
      if(t.hp>0&&r.hp>0&&Math.abs(t.pos-r.pos)<=t.stats.range)strike(t,r,side==='player'?'enemy':'player',true);
    }
    if(b.siege&&(!b.gate||b.gate.hp>0)&&living(b.player).length){
      const target=living(b.player).filter(r=>b.length-r.pos<=(node.fortification?.range||1200)).sort((a,z)=>z.pos-a.pos)[0];
      if(target){const beforeHp=target.hp,before=Math.ceil(target.hp/target.stats.hp),damage=Math.round((node.fortification?.tower||180+nLevel(b.node)*70)/(1+target.stats.def/200)/(1+g.def/300));target.hp=Math.max(0,target.hp-damage);const killed=before-Math.ceil(target.hp/target.stats.hp);event('tower','enemy','tower',target.id,b.length,target.pos,Math.min(beforeHp,damage),killed,false,true);event('recoil','player',target.id,'tower',target.pos,target.pos,Math.min(beforeHp,damage),killed,false,true);pushLog(b,'城防箭楼射击我军'+units[target.id].name+'，伤害 '+Math.min(beforeHp,damage)+'。');}
    }
    if(tactics)BattleStratagems.endRound(b,stratagemApi);
    if(lesson)BattleReview.collectRoundEvidence(b.currentRoundSummary,lessonEvidence.get(b),{battle:b});
    const finish=won=>lesson?TacticalLessons.finish(lesson,won):finishBattle(won);
    if(!living(b.enemy).length&&(!b.gate||!b.gate.hp))finish(true);
    else if(!living(b.player).length||b.round>=30){if(b.round>=30)pushLog(b,lesson?'演练达到回合上限，可重开比较指令。':'达到回合上限，'+(b.gate?.hp>0?'城防仍未攻破'+(living(b.enemy).length?'且守军尚未清空':''):'守军尚未清空')+'，本次攻打失败。');finish(false);}
    else if(lesson&&TacticalLessons.objectiveMet(lesson))finish(false);
    if(!lesson){if(tactics&&!b.finished)planEnemyTactic(b,node);save();}return b;
  }
  function finishBattle(won,retreated=false){
    const b=state.battle,e=state.expedition;if(!b||b.finished)return;
    const conquestContext=WebEdition.capture();
    const n=getNode(b.node),mode=b.mode,originalArmy={...e.army},alive=survivors(b.player),back=blankArmy(),lost=blankArmy(),wounded=blankArmy();
    const enemyRemaining=totalArmy(survivors(b.enemy)),gateHp=b.gate?.hp||0,outOfRange=b.player.some(r=>r.hp>0&&b.orders[r.id].command==='hold'&&b.enemy.some(t=>t.hp>0)&&!b.enemy.some(t=>t.hp>0&&Math.abs(t.pos-r.pos)<=r.stats.range));
    const failure=won?null:{reason:retreated?'retreat':!totalArmy(alive)?'army':gateHp>0?(enemyRemaining?'gate_and_enemy':'gate'):'enemy',round:b.round,enemyRemaining,gateHp,outOfRange};
    for(const k of Object.keys(units)){wounded[k]=Math.floor((e.army[k]-alive[k])*Math.min(1,(won?.35:.15)+(activeBuff('heal')?.3:0)));back[k]=alive[k];lost[k]=e.army[k]-alive[k]-wounded[k];}
    const careError=WarCare.admit(state,'field:'+currentCityId()+':'+Math.floor(e.start)+':'+n.id,wounded,Date.now());
    if(careError){b.auto=false;pushLog(b,'战果尚未结算：'+careError);return careError;}
    const resourceBefore={...state.res};
    const cargoCapacity=carry(alive),availableLoot=won?attackInfo(n.id,mode).loot:{},loot=won?capLoot(availableLoot,cargoCapacity):{},lootDiscarded=Object.values(availableLoot).reduce((v,n)=>v+n,0)-Object.values(loot).reduce((v,n)=>v+n,0),drops=won?rollBattleDrops(n):{items:{},resources:{}},remainingCarry=Math.max(0,cargoCapacity-Object.values(loot).reduce((v,n)=>v+n,0)),bonusLoot=capLoot(drops.resources,remainingCarry),bonusDiscarded=Object.values(drops.resources).reduce((v,n)=>v+n,0)-Object.values(bonusLoot).reduce((v,n)=>v+n,0),baseReceipt=settleLoot(loot,true),bonusReceipt=settleLoot(bonusLoot,true),resourceReceipt={base:baseReceipt,bonus:bonusReceipt},overflow=receiptOverflow(baseReceipt)+receiptOverflow(bonusReceipt),overCapacity=Object.values(baseReceipt.overCapacity).reduce((sum,n)=>sum+n,0)+Object.values(bonusReceipt.overCapacity).reduce((sum,n)=>sum+n,0);let recruit=null,claimed=false,stationed=false,moraleBefore=null,moraleAfter=null;
    for(const [id,count] of Object.entries(drops.items))state.inventory[id]=(state.inventory[id]||0)+count;
    if(won){
      state.stats.victories++;if(!n.orderRoute)state.raided[n.id]=true;state.cooldowns[n.id]=Date.now()+90000;
      if(n.faction==='yellow_turban'&&n.openCity&&mode==='occupy'&&availableLoot.gold>0){if(!state.yellowGold)state.yellowGold={};state.yellowGold[n.id]=Date.now()+YELLOW_GOLD_REFRESH_MS;}
      if(isCity(n)){const town=state.towns[n.id];if(mode==='occupy'){moraleBefore=town.morale;town.morale=Math.max(-100,town.morale-35);town.population=Math.max(0,town.population-40);moraleAfter=town.morale;claimed=town.morale<0&&!state.conquered[n.id]&&cityList().length<cityLimit();}else town.unrest=Math.min(100,town.unrest+10);}
      else if(mode==='occupy'&&!n.orderRoute)claimed=!state.conquered[n.id];
      if(claimed){Progression.record(state,'occupy');state.conquered[n.id]=true;if(n.wild){state.landClaims[n.id]={at:Date.now(),level:n.level};state.realm.wildOwners[n.id]=currentCityId();}if(isCity(n))state.realm.cities[CitySystem.idFor(n.id)]=CitySystem.empty(state,n,Date.now());}
      if(claimed&&n.capture&&!state.generals.includes(n.capture)){state.generals.push(n.capture);state.generalLevels[n.capture]=1;state.generalXp[n.capture]=0;recruit=n.capture;state.realm.heroLocations[n.capture]=currentCityId();}
      if(isCity(n)&&claimed&&!e.returnAfterOccupy&&totalArmy(back)>0){const destination=state.realm.cities[CitySystem.idFor(n.id)];for(const [id,count]of Object.entries(back))destination.data.army[id]+=count;state.realm.heroLocations[e.general]=destination.id;stationed=true;}
      if(n.wild&&mode==='occupy'&&!e.returnAfterOccupy&&claimed&&totalArmy(back)>0){state.garrisons[n.id]={general:e.general,army:{...back},phase:'stationed',start:Date.now(),end:null};stationed=true;}
    }
    const wildGeneral=HeroSystem.wild.settle(state,n,b,won,Date.now());
    const {captures,captureDiscarded}=won?rollCaptives(b,alive,n):{captures:blankArmy(),captureDiscarded:0};
    const received=Object.fromEntries(Object.keys(resources).map(id=>[id,Math.max(0,Math.floor(state.res[id]-resourceBefore[id]))])),progressionResult=Progression.battle(state,n,b,won,received);
    const xp=won?n.level*45:15;HeroSystem.addXp(state,e.general,xp);
    const equipmentResult=won?HeroSystem.drops(state,n.level):{equipmentDrops:[],equipmentDiscarded:0};
    if(stationed)state.expedition=null;else{e.army=back;e.phase='return';e.start=Date.now();e.end=Date.now()+marchQuote(n.id,back,e.general).returnSeconds*1000;}
    const warOrder=WarOrders.settle(state,n,won,Date.now(),{round:b.round,machineGateAttacks:b.machineGateAttacks||0,army:originalArmy,lost,back,wounded,alive});
    const tacticReceipt=b.stratagem?{tacticEvents:[...BattleStratagems.view(b,'player').events.map(e=>'第 '+e.round+' 回合 · '+e.text),...b.log.filter(line=>line.includes('被火区截停'))].slice(-60),tacticPoints:{...b.stratagem.points}}:{};
    b.finished=true;b.auto=false;b.result={...tacticReceipt,wildGeneral,warOrder,failure,...progressionResult,...equipmentResult,won,mode,returnAfterOccupy:!!e.returnAfterOccupy,claimed,stationed,moraleBefore,moraleAfter,retreated,woundedInHospital:true,loot,resourceReceipt,captures,captureDiscarded,itemDrops:drops.items,bonusLoot,bonusDiscarded,cargoCapacity,cargoLoaded:Object.values(loot).reduce((v,n)=>v+n,0)+Object.values(bonusLoot).reduce((v,n)=>v+n,0),lootDiscarded,lost,wounded,back,xp,first:claimed,recruit,overflow,overCapacity};
    state.reports.unshift({id:Date.now(),node:n.id,general:e.general,sourceCity:currentCityId(),round:b.round,...b.result});state.reports=state.reports.slice(0,20);
    WebEdition.settle(conquestContext);
    pushLog(b,n.orderRoute&&won?'军令讨伐成功，军功 +'+warOrder.points+'，已保存；部队返城。':!won?'战斗失利，幸存部队返城整顿。':mode==='raid'?'掠夺成功，战利品已入库（允许爆仓），部队返城；领地归属不变。':stationed?(isCity(n)?'占领成功，部队驻扎新城，可切换城市查看。':'占领成功，部队留守野地，耗粮翻倍。'):claimed?(n.wild&&e.returnAfterOccupy?'占领成功，部队按出征选择返城；野地归属与产量加成保留。':'占领成功，领地归属变更。'):moraleAfter!==null?'攻城获胜，民心 '+moraleBefore+' → '+moraleAfter+'，尚未易主。':'本次战斗结束。');
    if(wildGeneral)pushLog(b,wildGeneral.status==='captured'?'俘获将领 '+wildGeneral.name+'，忠诚 40；请在俘将管理中手动招降。':wildGeneral.status==='portrait_required'?'未能俘获将领 '+wildGeneral.name+'：'+wildGeneral.reason+'。线索仍然有效。':'释放将领 '+wildGeneral.name+'：'+wildGeneral.reason+'。扩建招贤馆后可重新打听。');
    if(totalArmy(captures))pushLog(b,'收容俘虏：'+Object.entries(captures).filter(([,n])=>n>0).map(([id,n])=>units[id].name+' ×'+n).join('、')+'；可在军队的俘虏营招降。');
    if(captureDiscarded)pushLog(b,'押解或俘虏营名额不足，释放 '+captureDiscarded+' 名俘虏。');
    if(equipmentResult.equipmentDrops.length)pushLog(b,'缴获装备：'+equipmentResult.equipmentDrops.map(e=>HeroSystem.qualities[e.tier]+' · '+HeroSystem.itemName(e)).join('、')+'，已收入装备库。');
    if(equipmentResult.equipmentDiscarded)pushLog(b,'装备库已满，未能收取 1 件装备。');
    if(Object.keys(drops.items).length)pushLog(b,'缴获道具：'+Object.entries(drops.items).map(([id,count])=>ManualData.shop.find(x=>x.id===id).name+' ×'+count).join('、')+'，已收入道具行囊。');
    if(Object.values(bonusLoot).some(n=>n>0))pushLog(b,'额外资源：'+Object.entries(bonusLoot).filter(([,count])=>count>0).map(([id,count])=>resources[id].name+' +'+count).join('、')+'。');
    if(won)pushLog(b,'幸存部队负重 '+cargoCapacity+'，装载资源 '+b.result.cargoLoaded+'；伤兵不参与搬运。');
    if(lootDiscarded>0)pushLog(b,'负重不足，基础资源有 '+lootDiscarded+' 未能带回。');
    if(bonusDiscarded>0)pushLog(b,'部队负重不足，额外资源有 '+bonusDiscarded+' 未能带回。');
    pushLog(b,'声望 '+(progressionResult.prestigeDelta>=0?'+':'')+progressionResult.prestigeDelta+(won?'；获得珍珠 ×1，可用于进献珍宝。':''));
    save();return b.result;
  }
  function captiveCapacity(){return Math.min(RewardData.captives.maxCapacity,Math.max(100,state.buildings.hall*100+state.buildings.drill*50));}
  function captiveChance(nodeId){const n=getNode(nodeId),r=RewardData.captives;return Math.min(r.maxChance,r.baseChance+Math.max(0,n?.level||0)*r.perLevel);}
  function rollCaptives(b,alive,n){
    const captures=blankArmy(),r=RewardData.captives;
    if(Math.random()>=captiveChance(n.id))return {captures,captureDiscarded:0};
    let escort=Math.min(r.maxPerBattle,Math.floor(totalArmy(alive)*r.escortRatio)),room=Math.max(0,captiveCapacity()-totalArmy(state.captives)),captureDiscarded=0;
    // Shuffle troop types so a large first stack does not always use every escort slot.
    const candidates=b.enemy.filter(row=>r.units.includes(row.id)).map(row=>({row,sort:Math.random()})).sort((a,b)=>a.sort-b.sort);
    for(const {row} of candidates){const eligible=Math.max(0,row.initial-(row.id==='militia'?b.militia:0));if(!eligible)continue;
      const possible=Math.max(1,Math.floor(eligible*(r.minRatio+Math.random()*(r.maxRatio-r.minRatio)))),count=Math.min(possible,escort,room);
      captures[row.id]+=count;state.captives[row.id]+=count;escort-=count;room-=count;captureDiscarded+=possible-count;
    }
    Progression.record(state,'capture',totalArmy(captures));return {captures,captureDiscarded};
  }
  function captiveRecruitQuote(id,count){
    const r=RewardData.captives,u=units[id];count=Math.floor(count);let reason='';
    if(!r.units.includes(id)||!Number.isSafeInteger(count)||count<1||count>state.captives[id])return {reason:'俘虏数量不足',cost:{},people:0};
    const cost={food:count*r.food,gold:count*Math.max(r.minGold,Math.ceil((u.cost.gold||0)*r.goldRatio))},people=count*(u.people||1);
    if(unitRequirements(id))reason='需要 '+unitRequirements(id);else if(people>freePopulation())reason='空闲人口不足，需要 '+people+' 人口';else if(!canPay(cost))reason='招降所需粮食或黄金不足';
    return {reason,cost,people};
  }
  function recruitCaptives(id,count){tick(Date.now(),false);count=Math.floor(count);const q=captiveRecruitQuote(id,count);if(q.reason)return q.reason;
    pay(q.cost);state.population-=q.people;state.captives[id]-=count;state.army[id]+=count;Progression.record(state,'captive_recruit',count);save();return null;
  }
  function captiveRecruitAllQuote(){
    const r=RewardData.captives,cost={food:0,gold:0};let food=Math.max(0,state.res.food),gold=Math.max(0,state.res.gold),peopleLeft=freePopulation(),count=0,people=0;const rows=[];
    for(const id of r.units){const available=state.captives[id]||0;if(!available)continue;const u=units[id],perPeople=u.people||1,perGold=Math.max(r.minGold,Math.ceil((u.cost.gold||0)*r.goldRatio)),needed=unitRequirements(id);let selected=0,reason='';
      if(needed)reason='需要 '+needed;else{selected=Math.max(0,Math.min(available,Math.floor(food/r.food),Math.floor(gold/perGold),Math.floor(peopleLeft/perPeople)));if(selected<available)reason='其余俘虏因粮食、黄金或人口不足暂留营中';}
      rows.push({id,available,count:selected,reason});food-=selected*r.food;gold-=selected*perGold;peopleLeft-=selected*perPeople;count+=selected;people+=selected*perPeople;cost.food+=selected*r.food;cost.gold+=selected*perGold;
    }
    const key=JSON.stringify({rows:rows.filter(row=>row.count>0).map(row=>[row.id,row.count]),cost,people});
    return {rows,count,people,cost,key,reason:count?'':rows.length?'当前没有满足条件且可负担的俘虏':'暂未收容俘虏'};
  }
  function recruitAllCaptives(expectedKey){
    tick(Date.now(),false);const q=captiveRecruitAllQuote();if(typeof expectedKey!=='string'||expectedKey!==q.key)return '招降计划已变化，请重新核对数量和费用';if(q.reason)return q.reason;
    pay(q.cost);state.population-=q.people;for(const row of q.rows)if(row.count){state.captives[row.id]-=row.count;state.army[row.id]+=row.count;}Progression.record(state,'captive_recruit',q.count);save();return null;
  }
  function releaseCaptives(id,count){tick(Date.now(),false);count=Math.floor(count);if(!RewardData.captives.units.includes(id)||!Number.isSafeInteger(count)||count<1||count>state.captives[id])return '俘虏数量不足';state.captives[id]-=count;save();return null;}
  function battleDropInfo(nodeId){
    const n=getNode(nodeId),level=Math.max(0,Math.min(10,n?.level||0)),d=ManualData.battleDrops;
    return {level,itemChance:Math.min(d.itemChanceMax,d.itemChanceBase+level*d.itemChancePerLevel),resourceChance:Math.min(d.resourceChanceMax,d.resourceChanceBase+level*d.resourceChancePerLevel)};
  }
  function rollBattleDrops(n){
    const d=ManualData.battleDrops,info=battleDropInfo(n.id),items={},resourceLoot={};
    const pool=ManualData.shop.filter(item=>item.effect&&!item.rewardOnly).map(item=>({item,weight:item.price>=d.rarePrice?d.rareWeightBase+info.level*d.rareWeightPerLevel:d.commonWeight}));
    function pickItem(){let cursor=Math.random()*pool.reduce((sum,entry)=>sum+entry.weight,0);for(const {item,weight} of pool){cursor-=weight;if(cursor<0){items[item.id]=(items[item.id]||0)+1;return;}}}
    if(pool.length&&Math.random()<info.itemChance){pickItem();if(info.level>=d.secondItemMinLevel&&Math.random()<d.secondItemChance)pickItem();}
    if(Math.random()<info.resourceChance){const keys=Object.keys(resources),count=Math.random()<d.secondResourceChance?2:1;for(let i=0;i<count;i++){const index=Math.floor(Math.random()*keys.length),id=keys.splice(index,1)[0];resourceLoot[id]=Math.round((d.resourceBase+d.resourcePerLevelSquared*info.level*info.level)*(.8+Math.random()*.4));}}
    return {items,resources:resourceLoot};
  }
  function selectExpedition(nodeId){tick();const source=CitySystem.list(state).find(c=>{const d=CitySystem.scope(state,c);return [d.expedition,...d.expeditions].some(e=>e?.node===nodeId);});if(source&&source.id!==currentCityId())switchCity(source.id);if(state.battle&&!state.battle.finished)return '请先完成当前战斗';if(state.expedition?.node===nodeId)return null;const e=state.expeditions.find(x=>x.node===nodeId);if(!e)return '该部队已返回或转入驻军';state.expeditions=state.expeditions.filter(x=>x!==e);if(state.expedition)state.expeditions.push(state.expedition);state.expedition=e;if(state.battle?.finished)state.battle=null;save();return null;}
  function recall(){const e=state.expedition;if(e?.phase!=='march')return '只有行军中的部队可以召回';const now=Date.now(),progress=Math.max(0,Math.min(1,(now-e.start)/(e.end-e.start))),seconds=Math.max(1,marchQuote(e.node,e.army).returnSeconds*progress);e.phase='return';e.start=now;e.end=now+seconds*1000;save();return null;}
  function dismissBattle(){if(state.battle?.finished){state.battle=null;save();}}

  function unitStats(id,player=true){const u=units[id];if(!player)return {hp:u.hp,atk:u.atk,def:u.def,range:u.range,speed:u.speed};return {hp:Math.round(u.hp*(1+state.tech.supply*.05)),atk:Math.round(u.atk*(1+state.tech.combat*.05)*(activeBuff('drum')?1.1:1)),def:Math.round(u.def*(1+state.tech.protection*.05)*(activeBuff('formation')?1.1:1)),range:Math.round(u.range*(u.range>=1000?1+state.tech.shooting*.05:1)),speed:Math.round(u.speed*(u.kind==='infantry'?1+state.tech.march*.1:1+state.tech.riding*.05))};}
  function carry(army){return Math.floor(Object.entries(army).reduce((v,[id,n])=>v+units[id].carry*n,0)*(1+state.tech.load*.1));}
  function capLoot(loot,limit){const total=Object.values(loot).reduce((v,n)=>v+n,0),factor=Math.min(1,limit/Math.max(1,total));return Object.fromEntries(Object.entries(loot).map(([k,n])=>[k,Math.floor(n*factor)]));}
  function lootPreview(id,mode,army){
    const n=getNode(id),info=attackInfo(id,mode),capacity=carry(army),loot=capLoot(info?.loot||{},capacity),loaded=Object.values(loot).reduce((v,n)=>v+n,0);
    const supply=n&&totalArmy(army)>0?Math.ceil(totalArmy(army)*1.2+n.time*2):0,stock={...state.res,food:Math.max(0,state.res.food-supply)};
    return {capacity,loot,loaded,discarded:Object.values(info?.loot||{}).reduce((v,n)=>v+n,0)-loaded,storage:storageQuote(loot,stock,true)};
  }
  function researchCost(id){return ReferenceRules.researchRows[id]?.[state.tech[id]+1]?.cost||{};}
  const researchSeconds=id=>Math.max(1,Math.floor((ReferenceRules.researchRows[id]?.[state.tech[id]+1]?.seconds||1)/(1+general(HeritageSystem.effectiveHero(state,'research')).wis/100)*(1-(state.tech.researching||0)*.03)/state.speed));
  const armyLimit=()=>Math.floor(state.buildings.drill*10000*(activeBuff('flag')?1.25:1));
  function enqueueResearch(id){if(!ManualData.technology[id])return '科技不存在';if(state.buildings.academy<1)return '请先建造书院';if(state.researchQueue)return '书院正在研究另一项科技';if(state.tech[id]>=10)return '科技已满级';const level=state.tech[id]+1;const requirement=researchRequirements(id);if(requirement)return '需要 '+requirement;const cost=researchCost(id);if(!canPay(cost))return '研究资源不足';pay(cost);const start=Date.now();state.researchQueue={id,level,start,end:start+researchSeconds(id)*1000};return null;}
  function research(id){tick(Date.now(),false);const error=enqueueResearch(id);if(!error)save();return error;}
  function autoResearchCandidates(){
    return Object.keys(ManualData.technology).filter(id=>state.tech[id]<10&&!researchRequirements(id)).sort((a,b)=>AutomationSystem.rank(state,a)-AutomationSystem.rank(state,b)||state.tech[a]-state.tech[b]);
  }
  function processAutoResearch(){
    if(!state.autoResearch||state.researchQueue||state.buildings.academy<1)return false;
    const id=autoResearchCandidates().find(id=>AutomationSystem.canSpend(state,researchCost(id)));
    if(!id||enqueueResearch(id))return false;
    save();return true;
  }
  function autoResearchStatus(){
    if(!state.autoResearch)return '已暂停；已开始的研究继续完成';
    if(state.researchQueue){const q=state.researchQueue;return '正在研究：'+ManualData.technology[q.id].name+' '+q.level+' 级，完成后自动接续';}
    if(state.buildings.academy<1)return '等待建造书院';
    if(Object.values(state.tech).every(level=>level>=10))return '全部科技已满级';
    const candidates=autoResearchCandidates();
    if(!candidates.length)return '等待满足科技前置条件，请升级建筑或相关科技';
    return candidates.some(id=>AutomationSystem.canSpend(state,researchCost(id)))?'资源充足，准备研究':'资源不足或达到保留额度，等待积累';
  }
  function setAutoResearch(enabled){
    if(typeof enabled!=='boolean')return '请选择自动研究状态';
    tick(Date.now(),false);state.autoResearch=enabled;
    if(enabled)processAutoResearch();save();return null;
  }
  function setAutomationSettings(settings){
    if(!AutomationSystem.settingsValid(settings))return '挂机设置无效：保留数量须为 0–10 亿之间的整数';
    tick(Date.now(),false);const a=state.automation;
    a.researchFocus=settings.researchFocus;a.researchPriority=settings.researchPriority;a.reserve={...settings.reserve};a.notify=settings.notify;
    processPlotTemplate();processAutoUpgrade();processAutoResearch();save();return null;
  }
  function readAutomationNotices(){state.automation.notices.forEach(n=>n.read=true);save();}
  const scout=(id,count=1,key)=>dispatchScout(id,count,key);
  function intel(id){if(getNode(id)?.orderRoute||getNode(id)?.chapter===2)return {exact:true,public:true};const report=ScoutSystem.intel(state,id);if(report)return report;const entry=state.scouted[id];return entry&&Date.now()-entry.at<((15+entry.level*5)*60000)?{...entry,exact:entry.level>=5,legacy:true}:null;}
  function troopBand(n){if(n===0)return '无';const bands=[[10,'几个'],[25,'少数'],[50,'小队'],[100,'一些'],[250,'一群'],[500,'许多'],[1000,'大队'],[2500,'大群'],[5000,'大批'],[10000,'巨量'],[Infinity,'无数']];return bands.find(([max])=>n<max)[1];}
  function npcName(id,n){return n?.wild?ManualData.npcNames[id]||units[id].name:units[id].name;}
  function refreshInn(){tick();if(state.buildings.inn<1)return '请先建造客栈';const surnames=['魏','邵','程','陆','叶','夏','徐','陶'],given=['衡','舟','川','岚','松','宁','瑜','晏'];state.innCandidates=Array.from({length:state.buildings.inn},(_,i)=>{const number=Date.now()+i,seed=hash(number%10000,i),level=1+seed%Math.max(1,state.buildings.inn*2);return {id:'local_'+number,name:surnames[seed%8]+given[Math.floor(seed/8)%8],level,atk:35+seed%46,def:35+Math.floor(seed/5)%46,pol:35+Math.floor(seed/13)%46,wis:35+Math.floor(seed/17)%46,lead:level*10,price:level*1000,type:'将',title:'客栈游士',desc:'愿以一身所学，助城池安稳发展。',bonus:['spear','archer','shield'][seed%3]};});save();return null;}
  function recruit(id){tick();const hero=state.innCandidates.find(g=>g.id===id);if(!hero)return '候选已离开';if(HeroSystem.wild.roomUsed(state)>=heroCapacity())return '招贤馆没有空闲房间（包含被俘将领）';if(state.customGenerals.length+HeroSystem.wild.heldCaptives(state)>=100)return '将领总量已达上限';if(state.res.gold<hero.price)return '黄金不足';state.res.gold-=hero.price;state.customGenerals.push(hero);state.generals.push(hero.id);state.generalLevels[hero.id]=hero.level;state.generalXp[hero.id]=0;state.innCandidates=state.innCandidates.filter(g=>g.id!==id);HeroSystem.init(state);save();return null;}
  function tradeQuote(resource,buy=true){
    const scale=state.buildings.market*100000;
    if(!Object.hasOwn(resources,resource)||resource==='gold')return {limit:0,reason:'请选择可交易资源'};
    const room=Math.max(0,Math.floor(capacity(buy?resource:'gold')-state.res[buy?resource:'gold'])),stock=Math.max(0,Math.floor(state.res[buy?'gold':resource])),limit=Math.min(scale,stock,buy?Math.max(0,Math.floor(Number.MAX_SAFE_INTEGER-state.res[resource])):room);
    const reason=scale<1?'请先建造市场':!buy&&room<1?'黄金已满仓，当前不能卖出':stock<1?(buy?'黄金不足':'资源不足'):'';
    const warning=buy&&room<limit?(room===0?'该资源已满仓，仍可购买；成交后暂时超仓。':'购买超过仓储空位时可暂时超仓。'):'';
    return {scale,room,stock,limit,reason,warning};
  }
  function trade(resource,count,buy){
    tick();if(!Number.isFinite(Number(count)))return '请输入有效交易数量';count=Math.floor(Number(count));const q=tradeQuote(resource,buy);
    if(q.reason)return q.reason;if(!Number.isSafeInteger(count)||count<1)return '请输入至少 1 的交易数量';if(count>q.limit)return '当前最多可'+(buy?'买入':'卖出')+' '+q.limit;
    if(buy){state.res.gold-=count;state.res[resource]+=count;}else{state.res[resource]-=count;state.res.gold+=count;}
    Progression.record(state,'trade',count);Progression.record(state,buy?'trade_buy':'trade_sell',count);save();return null;
  }
  function brickPurchaseRemaining(id){return RewardData.goldBricks.some(b=>b.id===id)?Math.max(0,RewardData.dailyBrickLimit-(state.daily.brickPurchases[id]||0)):null;}
  function grantTestSupplies(){
    tick(Date.now(),false);const amount=RewardData.testSupplyAmount;
    if(Object.keys(resources).some(id=>!Number.isFinite(state.res[id])||state.res[id]>Number.MAX_SAFE_INTEGER-amount))return '资源数值已达上限';
    addSupplies(Object.fromEntries(Object.keys(resources).map(id=>[id,amount])));save();return null;
  }
  function buyItem(id,count=1){tick(Date.now(),false);const item=ManualData.shop.find(x=>x.id===id);count=Math.floor(count);if(item?.rewardOnly)return '此物品仅由成长礼包获得，不能购买';if(!item?.effect)return '该道具依赖尚未接入的系统，暂不出售';if(!Number.isSafeInteger(count)||count<1||count>99)return '请选择购买数量';const remaining=brickPurchaseRemaining(id);if(remaining!==null&&count>remaining)return '该种金砖每日限购 '+RewardData.dailyBrickLimit+' 块，今日剩余 '+remaining+' 块';if(state.gems<item.price*count)return '试玩元宝不足';state.gems-=item.price*count;state.inventory[id]=(state.inventory[id]||0)+count;if(remaining!==null)state.daily.brickPurchases[id]+=count;save();return null;}
  function speedupKey(kind,q){return kind+':'+(kind==='build'?(q.plot===undefined?'site'+q.site:'plot'+q.plot):q.id)+':'+q.start;}
  function speedupQueue(kind){return kind==='build'?state.buildQueue:kind==='train'?state.trainQueue:kind==='research'&&state.researchQueue?[state.researchQueue]:[];}
  function speedupTargets(kind,now=Date.now()){
    return speedupQueue(kind).filter(q=>q.end>now).map(q=>({key:speedupKey(kind,q),name:kind==='build'?(q.plot===undefined?'城内 '+(q.site+1)+'号':'城外 '+(q.plot+1)+'号')+' · '+buildings[q.id].name+' → '+q.level+' 级':kind==='train'?units[q.id].name+' ×'+q.count:ManualData.technology[q.id].name+' → '+q.level+' 级',waitSeconds:Math.max(0,q.start-now)/1000,workSeconds:Math.max(0,q.end-Math.max(now,q.start))/1000}));
  }
  function speedupQuote(itemId,key,now=Date.now()){
    const item=ManualData.shop.find(i=>i.id===itemId);if(item?.effect!=='speedup')return {error:'请选择加速道具'};
    const q=speedupQueue(item.queueKind).find(q=>speedupKey(item.queueKind,q)===key&&q.end>now);if(!q)return {error:'这项任务已结束或队列已变化，请重新选择'};
    const spec=item.speedup,workMs=q.end-Math.max(now,q.start),waitMs=Math.max(0,q.start-now),minMs=spec.ratio?Math.ceil(workMs*spec.ratio):spec.minHours?spec.minHours*3600000:spec.seconds*1000,maxMs=spec.maxHours?spec.maxHours*3600000:minMs;
    return {error:null,workMs,waitMs,minMs,maxMs,afterMinMs:Math.max(0,workMs-maxMs),afterMaxMs:Math.max(0,workMs-minMs),overflow:maxMs>workMs};
  }
  function useSpeedup(itemId,key){
    const now=Date.now();tick(now,false);const item=ManualData.shop.find(i=>i.id===itemId),quote=speedupQuote(itemId,key,now);
    if(quote.error)return quote;if(!(state.inventory[itemId]>0))return {error:'没有这件加速道具'};
    if(quote.workMs<=1)return {error:'任务即将完成，无需加速'};
    const kind=item.queueKind,queue=speedupQueue(kind),index=queue.findIndex(q=>speedupKey(kind,q)===key),q=queue[index],oldEnd=q.end,spec=item.speedup;
    // Draw only after checking the target and inventory; viewing the preview never rolls.
    const requestedMs=spec.minHours?(spec.minHours+Math.floor(Math.random()*(spec.maxHours-spec.minHours+1)))*3600000:quote.maxMs,base=Math.max(now,q.start),remaining=Math.max(0,quote.workMs-requestedMs);
    if(!remaining&&q.start<=now)q.start=Math.min(q.start,now-1);
    q.end=Math.max(q.start+1,base+remaining);const removedMs=oldEnd-q.end;
    if(kind==='train')for(const next of queue.slice(index+1)){next.start-=removedMs;next.end-=removedMs;}
    state.inventory[itemId]--;Progression.record(state,'item',1,now);
    // Settle immediate completions even when the clock matches the preceding tick.
    tick(now,false,true);processAutoUpgrade();processAutoResearch();save();
    return {error:null,requestedMs,removedMs,completed:q.end<=now,waitMs:quote.waitMs};
  }
  function itemUseQuote(id,count=1,heroId){
    const item=ManualData.shop.find(x=>x.id===id),owned=state.inventory[id]||0;
    const timed=['labor','heal','politics','valor','wisdom','tiger','drum','formation'].includes(item?.effect);
    const batch=item?.effect==='gold'||item?.effect==='population'||timed;
    let max=batch?owned:Math.min(1,owned),gold=0,seconds=0,population=0;
    const needsHero=['politics','valor','wisdom','tiger'].includes(item?.effect);
    if(item?.effect==='gold')max=Math.min(max,Math.max(0,Math.floor((Number.MAX_SAFE_INTEGER-state.res.gold)/item.gold)));
    if(item?.effect==='population')max=Math.min(max,Math.max(0,Math.ceil((maxPop()-state.population)/Math.max(100,maxPop()*.2))));
    if(timed){const key=item.effect+(needsHero?':'+heroId:'');max=Math.min(max,Math.max(0,Math.floor((8640000000000000-Math.max(Date.now(),state.buffs[key]?.end||0))/(item.seconds*1000))));}
    let error=!item?.effect?'该道具尚不能使用':!owned?'没有可使用的道具':!Number.isSafeInteger(count)||count<1?'请输入至少 1 的整数数量':count>owned?'道具数量不足，当前持有 '+owned+' 个':!batch&&count!==1?'该道具每次只能使用 1 个':needsHero&&!state.generals.includes(heroId)?'请选择将领':count>max?(item.effect==='population'?'人口已达上限或数量超过本次所需':'本次最多可使用 '+max+' 个'):null;
    if(!error){if(item.effect==='gold')gold=item.gold*count;if(timed)seconds=item.seconds*count;if(item.effect==='population')population=Math.min(maxPop()-state.population,Math.max(100,maxPop()*.2)*count);}
    return {error,owned,max,batch,count,gold,seconds,population};
  }
  function useItem(id,heroId,text,count=1){tick();const quote=itemUseQuote(id,count,heroId);if(quote.error)return quote.error;const item=ManualData.shop.find(x=>x.id===id),effect=item.effect;
    if(['jewelBox','equipmentBox'].includes(effect))return OnboardingSystem.openItem(id,text);
    if(effect==='heroReset')return HeroSystem.reset(heroId);
    if(effect==='equipmentRack')return HeroSystem.expand(id);
    if(effect==='equipmentMaterial')return '强化宝珠在装备详情中使用';
    if(effect==='speedup')return useSpeedup(id,text).error;
    if(effect==='blueprint')return '图纸在建筑升至 10 级时自动消耗，请在建筑页面使用';
    if(['politics','valor','wisdom','tiger'].includes(effect)&&!state.generals.includes(heroId))return '请选择将领';
    if(effect==='gold'){state.res.gold+=quote.gold;}
    else if(effect==='population'){if(state.population>=maxPop())return '人口已达上限';state.population=Math.min(maxPop(),state.population+quote.population);}
    else if(effect==='peace'){if((state.itemCooldowns.peace||0)>Date.now())return '安民告示仍在 3 天冷却';state.morale=100;state.unrest=0;state.itemCooldowns.peace=Date.now()+259200000;}
    else if(effect==='recruit'){const error=refreshInn();if(error)return error;}
    else if(['rename','banner'].includes(effect)){const value=String(text||'').trim();if(!value||value.length>(effect==='rename'?12:2))return '名称长度不合适';state[effect==='rename'?'ruler':'banner']=value;}
    else{const key=effect+(['politics','valor','wisdom','tiger'].includes(effect)?':'+heroId:'');const end=effect==='flag'?Date.now()+86400000:Math.max(Date.now(),state.buffs[key]?.end||0)+item.seconds*1000*count;state.buffs[key]={effect,general:heroId||null,end};}
    state.inventory[id]-=count;Progression.record(state,'item',count);save();return null;
  }
  function starterGiftPending(){return OnboardingSystem.available(state).length>0;}
  function starterGiftRemaining(){return {...OnboardingSystem.quote(state,1).resources};}
  function addSupplies(reward){for(const [id,n] of Object.entries(reward))state.res[id]+=n;}
  function claimStarterGift(){
    return OnboardingSystem.claim(1);
  }
  function claimTrialGems(){if(Date.now()-state.trialGiftAt<86400000)return '试玩补给每天领取一次';state.gems+=1000;state.trialGiftAt=Date.now();save();return null;}
  function setSpeed(value){tick();if(![1,10,60].includes(Number(value)))return '请选择试玩倍率';state.speed=Number(value);save();return null;}
  function setStorage(allocation){const keys=['food','wood','stone','iron'];if(!keys.every(k=>Number.isInteger(Number(allocation[k]))&&Number(allocation[k])>=0&&Number(allocation[k])<=100)||keys.reduce((v,k)=>v+Number(allocation[k]),0)!==100)return '四项比例之和必须是 100%';state.storageAllocation=Object.fromEntries(keys.map(k=>[k,Number(allocation[k])]));save();return null;}
  function buildDefense(id,count){tick();count=Math.floor(count);const d=ManualData.defenses[id];if(!d||count<1||count>10000)return '请输入城防数量';if(state.buildings.wall<d.wall)return '需要城墙 '+d.wall+' 级';for(const [key,level] of Object.entries(d.tech||{}))if(state.tech[key]<level)return '需要 '+ManualData.technology[key].name+' '+level+' 级';const requirement=defenseRequirements(id,count);if(requirement)return '需要 '+requirement;if(state.defenseQueue.length>=1)return '城防工队正在忙碌';const cost=Object.fromEntries(Object.entries(d.cost).map(([k,v])=>[k,v*count]));if(!canPay(cost))return '城防资源不足';pay(cost);const start=Date.now();state.defenseQueue.push({id,count,start,end:start+Math.max(1,count*d.time/(1+state.tech.construction*.1+general(state.governor).pol/100)/state.speed)*1000});save();return null;}

  function awardMission(m){addSupplies(m.reward);for(const [id,n] of Object.entries(m.army||{}))state.army[id]+=n;state.prestige+=300;for(const [id,n] of Object.entries(m.items||{}))state.inventory[id]=(state.inventory[id]||0)+n;for(const [id,n] of Object.entries(m.jewels||{}))state.jewels[id]+=n;state.missionClaims.push(m.id);state.mission=state.missionClaims.length;}
  function claimMission(id){
    tick(Date.now(),false);const m=id?missions.find(x=>x.id===id):currentMission();
    if(!m)return '任务已全部完成';if(missionClaimed(m.id))return '该任务奖励已领取';if(!missionReady(m))return '目标尚未达成';
    awardMission(m);save();return null;
  }
  function claimReadyMissions(){
    tick(Date.now(),false);const ready=missions.filter(m=>missionReady(m));if(!ready.length)return '暂无可领取奖励';
    for(const m of ready)awardMission(m);save();return null;
  }
  function progressionAction(action,...args){tick(Date.now(),false);const error=Progression[action](state,...args);if(!error)save();return error;}
  const acceptDaily=uid=>progressionAction('accept',uid),abandonDaily=uid=>progressionAction('abandon',uid),claimDaily=uid=>progressionAction('claim',uid),donateEpic=(kind,id)=>progressionAction('donate',kind,id),exchangeCopper=id=>progressionAction('exchange',id);
  const claimDailyMilestone=count=>progressionAction('claimMilestone',Number(count));
  const claimReadyDaily=()=>progressionAction('claimReady');
  function reset(){try{replaceSave(newState());return null;}catch(error){return error.message||'重新开始失败';}}

  const namedCityProgress=id=>NamedCitySystem.progress(state,id);
  const namedCities=()=>NamedCitySystem.list(state);
  const namedCityDevelopmentQuote=id=>NamedCitySystem.developmentQuote(state,id);
  function claimNamedCityDevelopment(id,key){tick(Date.now(),false);const error=NamedCitySystem.claimDevelopment(state,id,key);if(!error)save();return error;}
  const warCareQuote=(unit='all',count)=>WarCare.quote(state,unit,count);
  function healWounded(unit='all',count,key){tick(Date.now(),false);const result=WarCare.heal(state,unit,count===null?undefined:count,key);if(typeof result==='string')return result;save();return result;}
  function setAutoHeal(enabled){tick(Date.now(),false);const result=WarCare.setAuto(state,enabled);if(typeof result==='string')return result;WarCare.tick(state,Date.now());save();return null;}
  function setDefenseDoctrine(preset){tick(Date.now(),false);const result=WarCare.setDefense(state,preset);if(typeof result==='string')return result;save();return null;}
  function resolveCityDefense(){let result=null;for(let i=0;i<30&&state.cityDefense.battle;i++){result=cityDefenseRound();if(typeof result==='string')return result;}return result;}
  const governanceStatus=()=>GovernanceSystem.status(state,Date.now());
  const salaryQuote=(id='all')=>GovernanceSystem.salaryQuote(state,id);
  function payHeroArrears(id,key){tick(Date.now(),false);const error=GovernanceSystem.payArrears(state,id,key,Date.now());if(!error)save();return error;}
  function setGovernancePolicy(kind,enabled){tick(Date.now(),false);const error=GovernanceSystem.setPolicy(state,kind,enabled,Date.now());if(!error)save();return error;}
  const defeatedHeroQuote=(id,method='gold')=>GovernanceSystem.captiveQuote(state,id,method);
  function recruitDefeatedHero(id,method,key){tick(Date.now(),false);const error=GovernanceSystem.recruitCaptive(state,id,method,key,Date.now());if(!error)save();return error;}
  const api={legacyWildTile,webEditionAction:(type,...args)=>WebEdition.execute(type,args),namedCityProgress,namedCities,namedCityDevelopmentQuote,claimNamedCityDevelopment,plotMaxLevel,warCareQuote,healWounded,setAutoHeal,setDefenseDoctrine,resolveCityDefense,governanceStatus,salaryQuote,payHeroArrears,setGovernancePolicy,defeatedHeroQuote,recruitDefeatedHero,cityStrategy,battleTacticsView,battleTacticQuote,submitBattleTactic,cancelBattleTactic,heroIdentity,startTacticalLesson,lessonInfo,currentBattle:()=>lessonSession?.battle||state.battle,lessonRound,lessonOrder,lessonAllOrders,lessonTarget,lessonTactic,lessonCancelTactic,endTacticalLesson,setExternalGeneralBusy,domesticStrategyAvailable,supplyLines,supplyLineQuote,saveSupplyLine,setSupplyLineEnabled,removeSupplyLine,heroAdministrationQuote,prepareHeroAdministration,regionFrontQuote,regionalFrontStatus,startRegionalFront,cityMeta,citySummary,cityList,currentCityId,currentHome,heroCity,heroCapacity,cityLimit,getCityState,switchCity,enterOwnedCity,foundCityQuote,foundCity,transportQuote,sendTransport,redeployQuote,redeployArmy,logisticsList,recallLogistics,scoutQuote,dispatchScout,trainGeneralSkill,generalGrowth:GeneralGrowth,enterOnlineSession,leaveOnlineSession,applyOnlineSnapshot,authorityActive:()=>onlineAuthority,saveOfflineInfo:()=>lastOffline,openSaveSession,respondSaveTakeover,saveBlockReason,saveSessionInfo,exportStoredRaw,restoreSaveBackup,takeOverSaveSession,releaseSaveSession,completeFirstBattleGuide,warOrders:WarOrders,onboarding:OnboardingSystem,buildingConditions,requirementLevel,requestCityDefense,setAutoCityDefense,startCityDefense,cityDefenseRound,endDefenseDrill,brickPurchaseRemaining,grantTestSupplies,captiveCapacity,captiveChance,captiveRecruitQuote,captiveRecruitAllQuote,recruitAllCaptives,recruitCaptives,releaseCaptives,claimDailyMilestone,claimReadyDaily,defenseCapacity,defenseUsed,defenseRequirements,armyPeople,buildingRuleText,researchRequirements,researchRuleText,buildingRequirements,speedupKey,speedupTargets,speedupQuote,useSpeedup,progression:Progression,acceptDaily,abandonDaily,claimDaily,donateEpic,exchangeCopper,countyUnlocked:()=>Progression.countyUnlocked(state),init,tick,save,reset,validSave,migrateSave,importSave,get state(){return state;},get uiState(){return state;},allExpeditions:everyExpedition,selectExpedition,resources,buildings,cityIds,plotTypes,PLOT_COUNT,unlockedPlots,plotJob,plotCost,plotTime,plotYield,developPlot,plotTemplates:PlotTemplateData.templates,plotTemplateQuote,setPlotTemplate,applyPlotTemplate,pausePlotTemplate,plotTemplateStatus,economyOutputFactor:ECONOMY_OUTPUT_FACTOR,lootPreview,isCity,generalBusy,wildOwned,attackBlocked,attackInfo,battleDropInfo,recallGarrison,abandonWild,buildRecord,buildSeconds,researchSeconds,armyLimit,primarySite,queueBuilding,cancelBuild,demolish,buildLimit,setAutoUpgrade,autoUpgradeStatus,setAutoResearch,autoResearchStatus,setAutomationSettings,readAutomationNotices,automation:AutomationSystem,freePopulation,workers,unitRequirements,trainSeconds,trainingLimit,dismissTroops,unitStats,marchQuote,carry,upkeep,researchCost,research,scout,intel,troopBand,npcName,refreshInn,recruit,tradeQuote,trade,buyItem,itemUseQuote,useItem,claimStarterGift,starterGiftPending,starterGiftRemaining,starterGiftReward,claimReadyMissions,missionClaimed,missionReady,currentMission,claimTrialGems,setSpeed,setStorage,buildDefense,manual:ManualData,units,get generals(){return [...generals,...(state?.customGenerals||[])];},nodes,WORLD_SIZE,home,landmarks,landmarkVisible,landmarkReached,nextLandmark,terrainTypes,getWorldTile,getNode,relocateBuilding,missions,rates,maxPop,committed,capacity,canPay,upgradeCost,upgrade,unitUnlocked,trainCost,train,general,setGovernor,setTax,civicOrderPreview,executeCivicOrder,power,totalArmy,dispatch,startBattle,battleRound,setBattleOrder,setBattleOrders,setTactic,recall,dismissBattle,claimMission};
  const actions=['webEditionAction','claimNamedCityDevelopment','healWounded','setAutoHeal','setDefenseDoctrine','resolveCityDefense','payHeroArrears','setGovernancePolicy','recruitDefeatedHero','submitBattleTactic','cancelBattleTactic','saveSupplyLine','setSupplyLineEnabled','removeSupplyLine','prepareHeroAdministration','startRegionalFront','switchCity','enterOwnedCity','foundCity','sendTransport','redeployArmy','recallLogistics','dispatchScout','trainGeneralSkill','completeFirstBattleGuide','requestCityDefense','setAutoCityDefense','startCityDefense','cityDefenseRound','endDefenseDrill','grantTestSupplies','recruitAllCaptives','recruitCaptives','releaseCaptives','claimDailyMilestone','claimReadyDaily','acceptDaily','abandonDaily','claimDaily','donateEpic','exchangeCopper','selectExpedition','developPlot','setPlotTemplate','applyPlotTemplate','pausePlotTemplate','recallGarrison','abandonWild','queueBuilding','cancelBuild','demolish','setAutoUpgrade','setAutoResearch','setAutomationSettings','readAutomationNotices','dismissTroops','research','scout','refreshInn','recruit','trade','buyItem','useItem','claimStarterGift','claimReadyMissions','claimTrialGems','setSpeed','setStorage','buildDefense','relocateBuilding','upgrade','train','setGovernor','setTax','executeCivicOrder','dispatch','startBattle','battleRound','setBattleOrder','setBattleOrders','setTactic','recall','dismissBattle','claimMission'];
  for(const name of actions){const action=api[name];api[name]=(...args)=>{const error=saveBlockReason();if(error)return error;const result=action(...args);return ['write-error','read-error','readonly','conflict'].includes(saveMode)?saveReason:result;};}
  api.useSpeedup=(...args)=>{const error=saveBlockReason();if(error)return {error};const result=useSpeedup(...args);return saveMode==='active'?result:{error:saveReason};};
  return api;
})();
if(typeof module!=='undefined')module.exports=Game;
