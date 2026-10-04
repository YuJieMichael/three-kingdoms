'use strict';
// Handbook tables are in manual-data.js. Trial economy formulas and combat coefficients are documented in RULES.md.
const Game = (() => {
  const KEY = 'sanguo-city-v2';
  // Income follows real time; the trial clock only speeds population and queues.
  const ECONOMY_OUTPUT_FACTOR=.7,RAID_LOOT_FACTOR=1.3;
  const resources = {food:{name:'粮食',icon:'穗'},wood:{name:'木材',icon:'木'},stone:{name:'石料',icon:'石'},iron:{name:'铁锭',icon:'铁'},gold:{name:'黄金',icon:'金'}};
  const buildings=ManualData.buildings,units=ManualData.units;
  const cityIds=Object.keys(buildings).filter(id=>!['farm','lumber','quarry','mine'].includes(id));
  const plotTypes={farm:{resource:'food',tech:'plant',color:'#9cab6e'},lumber:{resource:'wood',tech:'logging',color:'#78a289'},quarry:{resource:'stone',tech:'mining',color:'#aab4ae'},mine:{resource:'iron',tech:'smelting',color:'#b99a7d'}};
  const PLOT_COUNT=39;
  const newPlots=()=>Array.from({length:PLOT_COUNT},()=>({type:null,level:0}));
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
    {id:'fort',name:'古渡县城',terrain:'fort',x:49,y:13,level:4,desc:'县城守军兵种齐全。扩充兵力与武将等级后，再发起总攻。',army:{shield:70,spear:55,archer:65,cavalry:18},loot:{food:1100,wood:750,stone:600,iron:480,gold:900},reward:'占领县城 · 达成首章',time:30}
  ];
  const WORLD_SIZE=64,home={x:32,y:32};
  const landmarks={field:{x:29,y:35},wood:{x:29,y:29},pass:{x:36,y:34},camp:{x:37,y:28},mine:{x:40,y:32},fort:{x:34,y:23}};
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
  function wildTile(x,y){
    const seed=hash(x,y),district=hash(Math.floor(x/4),Math.floor(y/4))%100,river=Math.abs(x-(15+Math.round(4*Math.sin(y/7))));
    const type=river<1?'lake':district<19?'forest':district<35?'mountain':district<48?'hill':district<61?'swamp':district<80?'grass':'plain';
    const cfg=terrainTypes[type],distance=Math.hypot(x-home.x,y-home.y),base=Math.min(10,1+Math.floor(distance/5)+(seed%11===0?1:0));
    const id='wild_'+x+'_'+y,claim=state?.landClaims?.[id];
    const level=claim?Math.max(0,claim.level-Math.floor((Date.now()-claim.at)/86400000)):base;
    // Use the package's NPC value budget and conversion factor; stable seeded weights
    // adapt its random composition to a persistent browser map.
    const army={},budget=(ReferenceRules.fieldBudget[level]||0)*1.1,ids=Object.keys(ReferenceRules.npcValues);let allocated=0;
    ids.forEach((id,i)=>{const weight=hash(x+i*7,y+i*13)%(100-allocated||1);allocated+=weight;const count=Math.floor(budget*weight*.0078/ReferenceRules.npcValues[id]);if(count>0)army[id]=count;});
    if(level&&!Object.keys(army).length)army.militia=1;
    let bonus=0;if(level&&type!=='plain')bonus=(type==='lake'?5+level*3:type==='grass'?11+level:3+level*2)/100;
    const value=Object.entries(army).reduce((v,[id,n])=>v+Math.floor(n*ReferenceRules.npcValues[id]/.784),0),amount=Math.floor(value*(cfg.resource==='stone'?.5:cfg.resource==='iron'?.4:1)),bonusMap=bonus?{[cfg.resource]:bonus}:{},reward=type==='plain'?'平地 · 可用于筑城（多城经营未接入）':level?'占领后 '+resources[cfg.resource].name+'产量 +'+Math.round(bonus*100)+'%':'0 级野地 · 无产量加成';
    return {id,name:cfg.name+'野地 ('+x+','+y+')',type,terrain:type,x,y,level,wild:true,referenceArmy:true,desc:'野地守军按等级战力预算生成，各地配兵不同。先侦察，再选择掠夺或占领；运输兵决定能带回多少资源。',army,loot:{[cfg.resource]:amount},reward,bonus:bonusMap,time:Math.min(90,Math.max(8,Math.round(6+distance*2)))};
  }
  function getWorldTile(x,y){
    if(!Number.isInteger(x)||!Number.isInteger(y)||x<0||y<0||x>=WORLD_SIZE||y>=WORLD_SIZE)return null;
    if(x===home.x&&y===home.y)return {id:'home',name:'青溪城',type:'home',x,y,level:state?.buildings.hall||1};
    const named=nodes.find(n=>landmarks[n.id].x===x&&landmarks[n.id].y===y);
    if(named)return {...named,...landmarks[named.id],type:named.terrain==='field'?'grass':named.terrain==='forest'?'forest':named.terrain==='mountain'?'mountain':named.terrain,wild:false};
    return wildTile(x,y);
  }
  function getNode(id){
    const named=nodes.find(n=>n.id===id);if(named)return {...named,...landmarks[id],wild:false};
    if(typeof id!=='string')return null;
    const match=/^wild_(\d{1,2})_(\d{1,2})$/.exec(id);if(!match)return null;
    const x=Number(match[1]),y=Number(match[2]);if(id!==`wild_${x}_${y}`)return null;
    const tile=getWorldTile(x,y);return tile?.wild?tile:null;
  }
  const defaultCityLayout=()=>Array.from({length:36},(_,i)=>i===14?'hall':[15,20,21].includes(i)?'reserved':null);
  const starterGiftReward={food:40000,wood:40000,stone:40000,iron:40000,gold:60000};
  const supplies=(amount,gold)=>({food:amount,wood:amount,stone:amount,iron:amount,gold});
  const plotReached=(s,type,level=1)=>s.plots.some(p=>p.type===type&&p.level>=level);
  const missions = [
    {id:'gift',stage:'立城补给',title:'奉诏立城',desc:'领取新手礼包，取得第一批建城物资',route:'gift',check:s=>s.starterGiftClaimed,reward:supplies(3000,8000)},
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
    {id:'firstVictory',stage:'征战里程',title:'首战告捷',desc:'赢得任意 1 场掠夺或占领战斗',route:'world',check:s=>s.stats.victories>=1,reward:{food:3000,wood:2000,iron:2000,gold:10000}},
    {id:'field',stage:'征战里程',title:'收复粮田',desc:'掠夺或占领河畔荒田并获胜',route:'world',check:s=>!!(s.raided.field||s.conquered.field),reward:{food:4000,wood:2000,gold:12000}},
    {id:'victories3',stage:'征战里程',title:'连战三捷',desc:'累计赢得 3 场战斗',route:'world',check:s=>s.stats.victories>=3,reward:{food:3000,iron:2000,gold:15000}},
    {id:'camp',stage:'征战里程',title:'兵临营寨',desc:'占领黄巾营寨，解救严秋',route:'world',check:s=>!!s.conquered.camp,reward:{food:4000,wood:3000,gold:18000}},
    {id:'victories10',stage:'征战里程',title:'威震乡野',desc:'累计赢得 10 场战斗',route:'world',check:s=>s.stats.victories>=10,reward:{food:5000,iron:3000,gold:25000}},
    {id:'fort',stage:'征战里程',title:'一县之主',desc:'占领古渡县城',route:'world',check:s=>!!s.conquered.fort,reward:{food:6000,wood:4000,stone:4000,iron:4000,gold:30000}}
  ];
  const missionClaimed=(id,s=state)=>s.missionClaims.includes(id);
  const missionReady=(m,s=state)=>!missionClaimed(m.id,s)&&m.check(s);
  const currentMission=()=>missions.find(m=>missionReady(m))||missions.find(m=>!missionClaimed(m.id));
  let state,economyClock=null;
  const blankArmy = () => Object.fromEntries(Object.keys(units).map(k=>[k,0]));
  const newState=()=>{const fresh=({version:2,manualSchema:1,last:Date.now(),speed:1,autoUpgrade:false,starterGiftClaimed:false,starterGiftVersion:0,missionSchema:2,missionClaims:[],res:{food:5000,wood:5000,stone:5000,iron:5000,gold:5000},buildings:Object.fromEntries(cityIds.map(id=>[id,id==='hall'?1:0])),cityLayout:defaultCityLayout(),cityLevels:Array.from({length:36},(_,i)=>i===14?1:0),tactics:Object.fromEntries(Object.keys(units).map(id=>[id,{command:defaultOrder(id),target:''}])),plots:newPlots(),army:blankArmy(),buildQueue:[],trainQueue:[],researchQueue:null,tech:Object.fromEntries(Object.keys(ManualData.technology).map(id=>[id,0])),generals:['lin','su'],generalLevels:{lin:1,su:1},generalXp:{lin:0,su:0},customGenerals:[],innCandidates:[],governor:'su',population:0,morale:80,unrest:0,tax:20,storageAllocation:{food:25,wood:25,stone:25,iron:25},gems:1000,inventory:{},buffs:{},itemCooldowns:{},civicCooldowns:{comfort:0,levy:0},trialGiftAt:0,ruler:'青溪城主',banner:'青',scouted:{},defenses:Object.fromEntries(Object.keys(ManualData.defenses).map(id=>[id,0])),defenseQueue:[],landClaims:{},conquered:{},raided:{},garrisons:{},towns:{fort:{morale:100,unrest:0,population:400}},cooldowns:{},expedition:null,expeditions:[],battle:null,reports:[],mission:0,stats:{trained:0,victories:0},seen:[],tutorial:false});Progression.init(fresh);fresh.prestige=0;return fresh;};
  function migrateSave(data){
    if(!data||![1,2].includes(data.version))return data;
    const old=JSON.parse(JSON.stringify(data));
    if(old.version===1){old.plots=newPlots();Object.keys(plotTypes).forEach((type,index)=>{old.plots[index]={type,level:old.buildings[type]||1};delete old.buildings[type];});old.buildQueue=old.buildQueue.map(q=>Object.hasOwn(plotTypes,q.id)?{...q,plot:Object.keys(plotTypes).indexOf(q.id),kind:'upgrade'}:q);}
    old.version=2;if(old.expeditions===undefined)old.expeditions=[];if(old.autoUpgrade===undefined)old.autoUpgrade=false;if(old.starterGiftClaimed===undefined)old.starterGiftClaimed=false;
    if(!old.manualSchema){
      const layout=old.cityLayout||Array.from({length:16},(_,i)=>({1:'house',5:'hall',10:'barracks',15:'wall'})[i]||null),fresh=defaultCityLayout(),levels=Array(36).fill(0);levels[14]=old.buildings.hall||1;
      for(let i=0;i<layout.length;i++){const id=layout[i];if(!id||id==='hall')continue;const target=fresh[i]===null?i:fresh.findIndex((x,j)=>x===null&&j!==14);fresh[target]=id;levels[target]=old.buildings[id]||1;}
      for(const q of old.buildQueue||[])if(q.plot===undefined){q.site=fresh.indexOf(q.id);q.kind='upgrade';}
      old.cityLayout=fresh;old.cityLevels=levels;old.manualSchema=1;
      const defaults=newState();for(const id of cityIds)if(old.buildings[id]===undefined)old.buildings[id]=0;
      for(const key of ['speed','tech','researchQueue','population','morale','unrest','storageAllocation','gems','inventory','buffs','itemCooldowns','trialGiftAt','ruler','banner','scouted','defenses','defenseQueue','customGenerals','innCandidates','landClaims'])if(old[key]===undefined)old[key]=defaults[key];
      old.population=Math.max(100,old.cityLevels.reduce((v,l,i)=>v+(old.cityLayout[i]==='house'?buildRecord('house',l).population||0:0),0));
      if(old.expedition&&old.expedition.node.startsWith('wild_')&&!old.battle){const match=/wild_(\d+)_(\d+)/.exec(old.expedition.node),x=Number(match[1]),y=Number(match[2]),distance=Math.hypot(x-home.x,y-home.y),seed=hash(x,y),level=Math.min(8,1+Math.floor(distance/7)+(seed%11===0?1:0)),type=getWorldTile(x,y).type,army={spear:10+level*8};if(type==='forest'||type==='lake')army.archer=6+level*6;else if(type==='mountain'||type==='hill')army.shield=5+level*7;else army.archer=4+level*3;if(level>=3)army.cavalry=level*3;old.expedition.enemySnapshot=army;}
    }
    while(old.plots.length<PLOT_COUNT)old.plots.push({type:null,level:0});
    if(old.tactics===undefined)old.tactics={};for(const id of Object.keys(units)){if(old.army[id]===undefined)old.army[id]=0;if(old.tactics[id]===undefined)old.tactics[id]={command:defaultOrder(id),target:''};}
    if(old.raided===undefined)old.raided={...old.conquered};if(old.garrisons===undefined)old.garrisons={};if(old.towns===undefined)old.towns={fort:{morale:old.conquered.fort?-5:100,unrest:0,population:400}};
    if(old.expedition){const e=old.expedition;if(e.orders===undefined)e.orders=JSON.parse(JSON.stringify(old.tactics));if(e.mode===undefined)e.mode='occupy';for(const id of Object.keys(units)){if(e.army[id]===undefined)e.army[id]=0;if(e.orders[id]===undefined)e.orders[id]={command:defaultOrder(id),target:''};}}
    for(const g of Object.values(old.garrisons)){for(const id of Object.keys(units))if(g.army[id]===undefined)g.army[id]=0;}
    for(const id of Object.keys(old.conquered))if(id.startsWith('wild_')&&!old.landClaims[id])old.landClaims[id]={at:Date.now(),level:getNode(id).level};
    if(old.battle){const b=old.battle;if(b.rules!==2){b.length=battleLength([...b.player,...b.enemy]);for(const r of [...b.player,...b.enemy]){const ratio=r.maxHp>0?r.hp/r.maxHp:0;r.maxHp=r.initial*units[r.id].hp;r.hp=Math.min(r.maxHp,Math.round(ratio*r.maxHp));r.pos=Math.max(0,Math.min(b.length,Math.round(r.pos/7*b.length)));}b.orders=Object.fromEntries(b.player.map(r=>[r.id,{command:defaultOrder(r.id),target:''}]));b.rules=2;}
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
    Progression.init(old);
    return old;
  }
  function save(){try{localStorage.setItem(KEY,JSON.stringify(state));return true;}catch{return false;}}
  function validSave(d){
    const object=x=>x&&typeof x==='object'&&!Array.isArray(x);
    const finite=n=>Number.isFinite(n)&&n>=0&&n<=Number.MAX_SAFE_INTEGER;
    const integer=n=>finite(n)&&Number.isInteger(n);
    const army=a=>object(a)&&Object.keys(units).every(k=>integer(a[k]))&&Object.keys(a).every(k=>Object.hasOwn(units,k));
    const orders=o=>object(o)&&Object.keys(units).every(id=>object(o[id])&&['advance','hold','fallback'].includes(o[id].command)&&(o[id].target===''||Object.hasOwn(units,o[id].target)));
    const loot=a=>object(a)&&Object.entries(a).every(([k,n])=>Object.hasOwn(resources,k)&&finite(n));
    const node=id=>!!getNode(id);
    const timing=q=>finite(q.start)&&finite(q.end)&&q.end>q.start;
    const itemDrops=a=>object(a)&&Object.entries(a).every(([id,n])=>ManualData.shop.some(x=>x.id===id)&&integer(n)&&n>0&&n<=2);
    const result=r=>object(r)&&(r.prestigeDelta===undefined||Number.isSafeInteger(r.prestigeDelta))&&(r.jewelDrops===undefined||object(r.jewelDrops)&&Object.entries(r.jewelDrops).every(([id,n])=>Progression.jewels[id]&&integer(n)&&n<=2))&&['raid','occupy'].includes(r.mode)&&typeof r.won==='boolean'&&loot(r.loot)&&(r.itemDrops===undefined||itemDrops(r.itemDrops))&&(r.bonusLoot===undefined||loot(r.bonusLoot))&&(r.bonusDiscarded===undefined||finite(r.bonusDiscarded))&&(r.cargoCapacity===undefined||integer(r.cargoCapacity))&&(r.cargoLoaded===undefined||integer(r.cargoLoaded)&&r.cargoLoaded<=r.cargoCapacity)&&(r.lootDiscarded===undefined||integer(r.lootDiscarded))&&army(r.back)&&army(r.lost)&&army(r.wounded)&&finite(r.xp)&&finite(r.overflow)&&(r.recruit===null||generals.some(g=>g.id===r.recruit));
    const rows=(a,length)=>Array.isArray(a)&&a.length<=12&&new Set(a.map(r=>r.id)).size===a.length&&a.every(r=>object(r)&&Object.hasOwn(units,r.id)&&integer(r.initial)&&r.initial>0&&finite(r.hp)&&object(r.stats)&&['hp','atk','def','range','speed'].every(k=>finite(r.stats[k]))&&r.stats.hp>0&&r.maxHp===r.initial*r.stats.hp&&r.hp<=r.maxHp&&Number.isInteger(r.pos)&&r.pos>=0&&r.pos<=length);
    if(!object(d)||!Progression.valid(d)||d.version!==2||typeof d.autoUpgrade!=='boolean'||typeof d.starterGiftClaimed!=='boolean'||!finite(d.last)||!loot(d.res)||!Object.keys(resources).every(k=>finite(d.res[k]))||!object(d.buildings)||!cityIds.every(k=>Number.isInteger(d.buildings[k])&&d.buildings[k]>=(k==='hall'?1:0)&&d.buildings[k]<=10)||!army(d.army))return false;
    if(!Array.isArray(d.plots)||d.plots.length!==PLOT_COUNT||!d.plots.every(p=>object(p)&&(p.type===null?p.level===0:Object.hasOwn(plotTypes,p.type)&&Number.isInteger(p.level)&&p.level>=1&&p.level<=10)))return false;
    if(d.manualSchema!==1||!Array.isArray(d.cityLayout)||d.cityLayout.length!==36||!d.cityLayout.every(id=>id===null||id==='reserved'||cityIds.includes(id))||d.cityLayout.filter(x=>x==='hall').length!==1||d.cityLayout.filter(x=>x==='reserved').length!==3||!Array.isArray(d.cityLevels)||d.cityLevels.length!==36||!d.cityLevels.every((lv,i)=>integer(lv)&&lv<=10&&(d.cityLayout[i]===null||d.cityLayout[i]==='reserved'?lv===0:true)))return false;
    if(![1,10,60].includes(d.speed)||!object(d.tech)||!Object.keys(ManualData.technology).every(id=>integer(d.tech[id])&&d.tech[id]<=10)||!finite(d.population)||!finite(d.morale)||d.morale>100||!finite(d.unrest)||d.unrest>100||!finite(d.gems)||!object(d.inventory)||!Object.entries(d.inventory).every(([id,n])=>ManualData.shop.some(x=>x.id===id)&&integer(n))||!object(d.buffs)||!object(d.itemCooldowns)||!object(d.scouted)||!object(d.landClaims)||!object(d.defenses)||!Object.keys(ManualData.defenses).every(id=>integer(d.defenses[id]))||!Array.isArray(d.defenseQueue)||d.defenseQueue.length>5||!object(d.storageAllocation)||Object.values(d.storageAllocation).reduce((v,n)=>v+n,0)!==100)return false;
    if(!Array.isArray(d.customGenerals)||d.customGenerals.length>100||!Array.isArray(d.innCandidates)||d.innCandidates.length>10||![...d.customGenerals,...d.innCandidates].every(g=>object(g)&&typeof g.id==='string'&&/^local_\d+$/.test(g.id)&&typeof g.name==='string'&&g.name.length<=20&&['atk','def','pol','wis','lead','level','price'].every(k=>finite(g[k]))))return false;
    const knownHero=id=>generals.some(g=>g.id===id)||d.customGenerals.some(g=>g.id===id);
    if(d.researchQueue!==null&&(!object(d.researchQueue)||!Object.hasOwn(ManualData.technology,d.researchQueue.id)||d.researchQueue.level!==d.tech[d.researchQueue.id]+1||!timing(d.researchQueue)))return false;
    if(!orders(d.tactics))return false;
    if(!object(d.raided)||!Object.entries(d.raided).every(([id,v])=>node(id)&&v===true)||!object(d.garrisons)||!object(d.towns))return false;
    const town=d.towns.fort;if(!object(town)||!Number.isInteger(town.morale)||town.morale < -100||town.morale>100||!integer(town.unrest)||town.unrest>100||!integer(town.population))return false;
    const stationed=[];
    for(const [id,g] of Object.entries(d.garrisons)){if(!getNode(id)?.wild||!d.conquered[id]||!object(g)||!d.generals.includes(g.general)||g.general===d.governor||!army(g.army)||!['stationed','return'].includes(g.phase)||!finite(g.start)||(g.phase==='return'?!timing(g):g.end!==null))return false;stationed.push(g.general);}
    if(new Set(stationed).size!==stationed.length||stationed.includes(d.expedition?.general))return false;
    if(!Array.isArray(d.generals)||d.generals.length<2||!d.generals.includes('lin')||!d.generals.includes('su')||new Set(d.generals).size!==d.generals.length||!d.generals.every(id=>knownHero(id))||!d.generals.includes(d.governor))return false;
    if(!object(d.generalLevels)||!object(d.generalXp)||!d.generals.every(id=>integer(d.generalLevels[id])&&d.generalLevels[id]>=1&&d.generalLevels[id]<=10000&&finite(d.generalXp[id])))return false;
    if(!Number.isInteger(d.tax)||d.tax<0||d.tax>100||!object(d.stats)||!integer(d.stats.trained)||!integer(d.stats.victories)||!object(d.conquered)||!Object.entries(d.conquered).every(([id,v])=>node(id)&&v===true)||!object(d.cooldowns)||!Object.entries(d.cooldowns).every(([id,v])=>node(id)&&finite(v)))return false;
    if(!Array.isArray(d.buildQueue)||d.buildQueue.length>5||new Set(d.buildQueue.map(q=>q.plot===undefined?'city:'+q.site:'plot:'+q.plot)).size!==d.buildQueue.length||!d.buildQueue.every(q=>{
      if(!object(q)||!timing(q)||(q.auto!==undefined&&typeof q.auto!=='boolean')||(q.paidItems!==undefined&&(!object(q.paidItems)||!Object.entries(q.paidItems).every(([id,n])=>id==='blueprint'&&integer(n)&&n<=1))))return false;
      if(q.plot===undefined)return cityIds.includes(q.id)&&integer(q.site)&&q.site<36&&d.cityLayout[q.site]===q.id&&q.level===d.cityLevels[q.site]+1&&q.level<=10;
      if(!integer(q.plot)||q.plot>=PLOT_COUNT||!Object.hasOwn(plotTypes,q.id))return false;const p=d.plots[q.plot];
      return q.kind==='upgrade'?p.type===q.id&&q.level===p.level+1&&q.level<=10:q.kind==='build'?p.type===null&&q.level===1:q.kind==='replace'&&p.type!==null&&p.type!==q.id&&q.level===1;
    }))return false;
    if(!Array.isArray(d.trainQueue)||d.trainQueue.length>100||!d.trainQueue.every(q=>object(q)&&Object.hasOwn(units,q.id)&&integer(q.count)&&q.count>=1&&q.count<=100000&&timing(q)))return false;
    if(!object(d.civicCooldowns)||!['comfort','levy'].every(k=>finite(d.civicCooldowns[k])))return false;
    if(d.missionSchema!==2||!Array.isArray(d.missionClaims)||new Set(d.missionClaims).size!==d.missionClaims.length||!d.missionClaims.every(id=>missions.some(m=>m.id===id))||!integer(d.starterGiftVersion)||d.starterGiftVersion>2||d.starterGiftClaimed!==(d.starterGiftVersion>0))return false;
    if(!integer(d.mission)||d.mission!==d.missionClaims.length||d.mission>missions.length||!Array.isArray(d.reports)||d.reports.length>20||!d.reports.every(r=>result(r)&&node(r.node)&&finite(r.id)&&integer(r.round)&&d.generals.includes(r.general)))return false;
    if(d.expedition!==null){const e=d.expedition;if(!object(e)||!node(e.node)||!d.generals.includes(e.general)||e.general===d.governor||!army(e.army)||!['raid','occupy'].includes(e.mode)||!orders(e.orders)||!['march','battle','return'].includes(e.phase)||!timing(e))return false;}
    if(!Array.isArray(d.expeditions)||d.expeditions.length>10||!d.expeditions.every(e=>object(e)&&node(e.node)&&d.generals.includes(e.general)&&e.general!==d.governor&&army(e.army)&&['raid','occupy'].includes(e.mode)&&orders(e.orders)&&['march','return'].includes(e.phase)&&timing(e)))return false;
    const deployment=[...(d.expedition?[d.expedition]:[]),...d.expeditions,...Object.values(d.garrisons)];if(new Set(deployment.map(e=>e.general)).size!==deployment.length)return false;
    if(!['food','wood','stone','iron'].every(k=>integer(d.storageAllocation[k])&&d.storageAllocation[k]<=100)||!Object.values(d.buffs).every(b=>object(b)&&typeof b.effect==='string'&&finite(b.end)&&(b.general===null||d.generals.includes(b.general)))||!Object.values(d.itemCooldowns).every(finite)||!finite(d.trialGiftAt)||typeof d.ruler!=='string'||d.ruler.length>12||typeof d.banner!=='string'||d.banner.length>2)return false;
    if(!d.defenseQueue.every(q=>object(q)&&Object.hasOwn(ManualData.defenses,q.id)&&integer(q.count)&&q.count>0&&q.count<=10000&&timing(q)))return false;
    if(!Object.entries(d.landClaims).every(([id,c])=>getNode(id)?.wild&&object(c)&&finite(c.at)&&integer(c.level)&&c.level<=10)||!Object.entries(d.scouted).every(([id,c])=>node(id)&&object(c)&&finite(c.at)&&integer(c.level)&&c.level<=10))return false;
    if(d.battle!==null){const b=d.battle;if(!object(b)||!['raid','occupy'].includes(b.mode)||typeof b.siege!=='boolean'||!integer(b.militia)||b.rules!==2||!integer(b.length)||b.length<200||b.length>10000||!node(b.node)||!d.generals.includes(b.general)||!integer(b.round)||b.round>30||typeof b.finished!=='boolean'||typeof b.auto!=='boolean'||!rows(b.player,b.length)||!rows(b.enemy,b.length)||!object(b.orders)||!b.player.every(r=>object(b.orders[r.id])&&['advance','hold','fallback'].includes(b.orders[r.id].command)&&(b.orders[r.id].target===''||Object.hasOwn(units,b.orders[r.id].target)))||!Array.isArray(b.log)||b.log.length>40||!b.log.every(t=>typeof t==='string'&&t.length<1000))return false;if(b.finished?!result(b.result):!d.expedition||d.expedition.phase!=='battle'||d.expedition.node!==b.node||d.expedition.general!==b.general)return false;}
    return true;
  }
  function init(){let offline=null;try{const raw=localStorage.getItem(KEY)||localStorage.getItem('sanguo-city-v1');const data=JSON.parse(raw);if(raw&&!data?.manualSchema&&!localStorage.getItem(KEY+'-before-manual'))localStorage.setItem(KEY+'-before-manual',raw);state=migrateSave(data);if(!validSave(state))state=newState();}catch{state=newState();}const before={...state.res},elapsed=(Date.now()-state.last)/1000;state.last=Math.min(Date.now(),state.last);tick(Date.now(),false);if(state.battle)state.battle.auto=false;if(elapsed>60)offline={seconds:Math.min(elapsed,28800),gain:Object.fromEntries(Object.keys(resources).map(k=>[k,Math.max(0,Math.floor(state.res[k]-before[k]))]))};save();return offline;}
  function importSave(data){const migrated=migrateSave(data);if(!validSave(migrated))throw new Error('Invalid save');localStorage.setItem(KEY,JSON.stringify(migrated));init();}
  const totalArmy = a => Object.values(a).reduce((v,n)=>v+n,0);
  const maxPop=()=>state.cityLayout.reduce((v,id,i)=>v+(id==='house'?(buildRecord(id,state.cityLevels[i])?.population||0):0),0);
  const allExpeditions=()=>[...(state.expedition?[state.expedition]:[]),...state.expeditions];
  const armyPeople=a=>Object.entries(a).reduce((v,[id,n])=>v+n*(units[id].people||1),0);
  const committed=()=>armyPeople(state.army)+allExpeditions().reduce((v,e)=>v+armyPeople(e.army),0)+state.trainQueue.reduce((v,q)=>v+q.count*(units[q.id].people||1),0)+Object.values(state.garrisons).reduce((v,g)=>v+armyPeople(g.army),0);
  function capacity(k){if(!k)return Math.min(...Object.keys(resources).map(capacity));if(k==='gold')return buildRecord('hall',state.buildings.hall)?.capacity||1000000;let total=state.plots.filter(p=>p.type&&plotTypes[p.type].resource===k).reduce((v,p)=>v+buildRecord(p.type,p.level).capacity,0);total+=state.cityLayout.reduce((v,id,i)=>v+(id==='warehouse'?(buildRecord(id,state.cityLevels[i])?.capacity||0)*state.storageAllocation[k]/100:0),0);return Math.max(10000,total)*(1+state.tech.storage*.1);}
  const activeBuff=(id,generalId)=>Object.values(state.buffs).some(b=>b.effect===id&&b.end>(economyClock??Date.now())&&(!generalId||b.general===generalId));
  function productionBoost(){const gov=general(state.governor);return 1+gov.pol/100*Math.min(1,gov.lead*1000/Math.max(1,state.population));}
  function resourceBonus(resource){let bonus=0;for(const id of Object.keys(state.conquered)){const n=getNode(id);bonus+=n?.bonus?.[resource]||0;}return 1+bonus;}
  function workers(){return state.plots.reduce((v,p)=>v+(p.type?buildRecord(p.type,p.level).workers:0),0);}
  const freePopulation=()=>Math.max(0,Math.floor(state.population)-workers());
  function plotYield(plot){if(!plot?.type)return 0;const cfg=plotTypes[plot.type],labor=Math.min(1,state.population/Math.max(1,workers()));return buildRecord(plot.type,plot.level).output*ECONOMY_OUTPUT_FACTOR/60*productionBoost()*(1+state.tech[cfg.tech]*.1)*resourceBonus(cfg.resource)*labor;}
  function upkeep(army){return Object.entries(army).reduce((v,[id,n])=>v+(units[id]?.upkeep||0)*n,0);}
  function rates(){let r={food:100/60,wood:100/60,stone:100/60,iron:100/60,gold:state.population*state.tax/100/60};for(const key of Object.keys(r))r[key]*=ECONOMY_OUTPUT_FACTOR;for(const p of state.plots)if(p.type)r[plotTypes[p.type].resource]+=plotYield(p);r.food-=(upkeep(state.army)+allExpeditions().reduce((v,e)=>v+upkeep(e.army),0)+Object.values(state.garrisons).reduce((v,g)=>v+upkeep(g.army)*(g.phase==='stationed'?2:1),0))/60;return r;}
  function tick(now=Date.now(),allowAutoUpgrade=true,settleAtSameTime=false){
    if(now<=state.last&&!settleAtSameTime){Progression.ensureDaily(state,now);return;}
    const start=Math.max(state.last,now-28800000);
    // Settle queues in timestamp order so offline buildings only boost production after completion.
    const events=[...state.buildQueue.map(q=>({q,type:'build'})),...state.trainQueue.map(q=>({q,type:'train'})),...(state.researchQueue?[{q:state.researchQueue,type:'research'}]:[]),...state.defenseQueue.map(q=>({q,type:'defense'})),...allExpeditions().filter(q=>q.phase==='return').map(q=>({q,type:'expeditionReturn'})),...Object.entries(state.garrisons).filter(([,q])=>q.phase==='return').map(([id,q])=>({q,id,type:'garrisonReturn'})),...Object.values(state.buffs).map(q=>({q,type:'buffExpire'}))].filter(e=>e.q.end<=now).sort((a,b)=>a.q.end-b.q.end);
    let cursor=start;
    function accrue(end){while(cursor<end){const next=Math.min(end,cursor+30000),dt=(next-cursor)/60000;economyClock=cursor;const r=rates();for(const k of Object.keys(resources)){if(r[k]<0)state.res[k]=Math.max(0,state.res[k]+r[k]*dt);else if(state.res[k]<capacity(k))state.res[k]=Math.min(capacity(k),state.res[k]+r[k]*dt);}const change=dt*state.speed/6,target=100-state.tax;state.morale+=Math.sign(target-state.morale)*Math.min(Math.abs(target-state.morale),change);const popTarget=maxPop()*state.morale/100;state.population=Math.max(0,Math.min(maxPop(),state.population+Math.sign(popTarget-state.population)*Math.min(Math.abs(popTarget-state.population),Math.max(1,maxPop()*.01)*dt*state.speed)));cursor=next;}economyClock=null;}

    for(const e of events){accrue(Math.max(start,e.q.end));if(e.type==='build'){if(e.q.plot!==undefined)state.plots[e.q.plot]={type:e.q.id,level:e.q.level};else{state.cityLevels[e.q.site]=e.q.level;refreshBuildings();}state.buildQueue=state.buildQueue.filter(q=>q!==e.q);state.prestige+=e.q.level*50;Progression.record(state,'build',1,e.q.end);}else if(e.type==='train'){state.army[e.q.id]+=e.q.count;state.stats.trained+=e.q.count;state.prestige+=Math.ceil(e.q.count/5);Progression.record(state,'train',e.q.count,e.q.end);state.trainQueue=state.trainQueue.filter(q=>q!==e.q);}else if(e.type==='research'){state.tech[e.q.id]=e.q.level;state.researchQueue=null;state.prestige+=e.q.level*100;Progression.record(state,'research',1,e.q.end);}else if(e.type==='defense'){state.defenses[e.q.id]+=e.q.count;state.defenseQueue=state.defenseQueue.filter(q=>q!==e.q);}else if(['expeditionReturn','garrisonReturn'].includes(e.type)){for(const [id,n] of Object.entries(e.q.army))state.army[id]+=n;if(e.type==='garrisonReturn')delete state.garrisons[e.id];else if(state.expedition===e.q)state.expedition=null;else state.expeditions=state.expeditions.filter(q=>q!==e.q);}}
    accrue(now);state.last=now;Progression.ensureDaily(state,now);
    for(const [id,g] of Object.entries(state.garrisons))if(g.phase==='return'&&g.end<=now){for(const [k,n] of Object.entries(g.army))state.army[k]+=n;delete state.garrisons[id];}
    if(state.expedition?.phase==='return'&&state.expedition.end<=now){for(const [k,n] of Object.entries(state.expedition.army))state.army[k]+=n;state.expedition=null;}
    for(const e of [...state.expeditions])if(e.phase==='return'&&e.end<=now){for(const [k,n] of Object.entries(e.army))state.army[k]+=n;state.expeditions=state.expeditions.filter(x=>x!==e);}
    if(!state.expedition&&state.expeditions.length&&(!state.battle||state.battle.finished))state.expedition=state.expeditions.shift();
    if(allowAutoUpgrade)processAutoUpgrade();
  }
  function canPay(cost){return Object.entries(cost).every(([k,v])=>state.res[k]>=v);}
  function pay(cost){for(const [k,v] of Object.entries(cost))state.res[k]-=v;}
  function addRes(loot){let excess=0;for(const [k,v] of Object.entries(loot)){const room=Math.max(0,capacity(k)-state.res[k]);excess+=Math.max(0,v-room);state.res[k]+=Math.min(v,room);}return excess;}
  function buildRecord(id,level){return level>0?buildings[id]?.rows[level-1]:null;}
  function refreshBuildings(){for(const id of cityIds)state.buildings[id]=Math.max(0,...state.cityLayout.map((type,i)=>type===id?state.cityLevels[i]:0));}
  const primarySite=id=>state.cityLayout.indexOf(id);
  const buildLimit=()=>activeBuff('labor')?5:2;
  function buildSeconds(id,level){return Math.max(1,(buildRecord(id,level).seconds||600)/(1+state.tech.construction*.1+general(state.governor).pol/100)/state.speed);}
  function upgradeCost(id){const site=typeof id==='number'?id:primarySite(id),type=typeof id==='number'?state.cityLayout[site]:id,level=state.cityLevels[site]||0;return buildRecord(type,level+1)?.cost||{};}
  function queueBuilding(site,id){tick(Date.now(),false);return enqueueBuilding(site,id);}
  function requirementLevel(id){return Object.hasOwn(plotTypes,id)?Math.max(0,...state.plots.filter(p=>p.type===id).map(p=>p.level)):state.buildings[id]||0;}
  function requirementsText(list,onlyMissing=true){return list.filter(r=>!onlyMissing||(r.kind==='building'?requirementLevel(r.id):r.kind==='tech'?state.tech[r.id]:state.inventory[r.id]||0)<r.level).map(r=>r.kind==='item'?'消耗 '+ManualData.shop.find(i=>i.id===r.id).name+' ×'+r.level:(r.kind==='building'?buildings[r.id].name:ManualData.technology[r.id].name)+' '+r.level+' 级').join('、');}
  function buildingConditions(id,level){const list=[...(ReferenceRules.buildingConditions[id]?.[level]||[])];if(id==='wall')list.unshift({kind:'building',id:'hall',level:2});return list;}
  function buildingRequirements(id,level=1){return requirementsText(buildingConditions(id,level));}
  function buildingRuleText(id,level){return requirementsText(buildingConditions(id,level),false);}
  function payBuildingItems(id,level){const paid={};for(const r of buildingConditions(id,level).filter(r=>r.kind==='item')){state.inventory[r.id]-=r.level;paid[r.id]=(paid[r.id]||0)+r.level;}return paid;}
  function researchRequirements(id){return requirementsText(ReferenceRules.researchConditions[id]?.[state.tech[id]+1]||[]);}
  function researchRuleText(id){return requirementsText(ReferenceRules.researchConditions[id]?.[state.tech[id]+1]||[],false);}
  function defenseCapacity(){return ReferenceRules.wallRows.find(r=>r.level===state.buildings.wall)?.area||0;}
  function defenseUsed(){return Object.entries(state.defenses).reduce((v,[id,n])=>v+n*(ManualData.defenses[id].area||1),0)+state.defenseQueue.reduce((v,q)=>v+q.count*(ManualData.defenses[q.id].area||1),0);}
  function defenseRequirements(id,count=1){const d=ManualData.defenses[id];return requirementsText(d?.requires||[])||(defenseUsed()+count*(d?.area||1)>defenseCapacity()?'城防空间不足':'');}
  function enqueueBuilding(site,id){if(!Number.isInteger(site)||site<0||site>=36||!cityIds.includes(id)||state.cityLayout[site]==='reserved')return '请选择城内空地';const requirement=buildingRequirements(id,(state.cityLevels[site]||0)+1);if(requirement)return requirement;const current=state.cityLayout[site],level=state.cityLevels[site]||0;if(current&&current!==id)return '这块地已有其他建筑';if(!current&&!buildings[id].repeat&&state.cityLayout.includes(id))return '该建筑在本城只能建一座';if(level>=10)return '本城建筑最高 10 级';if(state.buildQueue.length>=buildLimit())return '建造队正在忙碌';if(state.buildQueue.some(q=>q.site===site))return '该建筑正在施工';const cost=buildRecord(id,level+1).cost;if(!canPay(cost))return '建设资源不足';pay(cost);state.cityLayout[site]=id;const start=Date.now();state.buildQueue.push({id,site,paidItems:payBuildingItems(id,level+1),kind:level?'upgrade':'build',level:level+1,paid:{...cost},start,end:start+buildSeconds(id,level+1)*1000});save();return null;}
  function upgrade(id){const site=typeof id==='number'?id:primarySite(id);return site<0?'请先在城内空地建造':queueBuilding(site,state.cityLayout[site]);}
  const unlockedPlots=()=>Math.min(PLOT_COUNT,Math.max(12+(state.buildings.hall-1)*3,1+state.plots.findLastIndex(p=>p.type!==null)));
  const plotJob=index=>state.buildQueue.find(q=>q.plot===index);
  function plotCost(index,type){const p=state.plots[index];return buildRecord(type,p?.type===type?p.level+1:1)?.cost||{};}
  function plotTime(index,type){const p=state.plots[index];return buildSeconds(type,p.type===type?p.level+1:1);}
  function developPlot(index,type){tick(Date.now(),false);return enqueuePlot(index,type);}
  function enqueuePlot(index,type){if(!Number.isInteger(index)||index<0||index>=unlockedPlots())return '升级官府后可开垦这块土地';if(!Object.hasOwn(plotTypes,type))return '请选择资源产业';if(plotJob(index))return '该地块正在施工';if(state.buildQueue.length>=buildLimit())return '建造队正在忙碌';const p=state.plots[index],same=p.type===type;if(same&&p.level>=10)return '普通城池资源田最高 10 级';const requirement=buildingRequirements(type,same?p.level+1:1);if(requirement)return '需要 '+requirement;const cost=plotCost(index,type);if(!canPay(cost))return '资源不足';pay(cost);const start=Date.now();state.buildQueue.push({id:type,plot:index,paidItems:payBuildingItems(type,same?p.level+1:1),paid:{...cost},kind:same?'upgrade':p.type?'replace':'build',level:same?p.level+1:1,start,end:start+plotTime(index,type)*1000});save();return null;}
  function autoUpgradeCandidates(){
    const candidates=[];
    state.cityLayout.forEach((id,index)=>{
      const level=state.cityLevels[index];
      if(!cityIds.includes(id)||level<1||level>=buildings[id].max||buildingRequirements(id,level+1)||buildingConditions(id,level+1).some(r=>r.kind==='item')||state.buildQueue.some(q=>q.site===index))return;
      candidates.push({area:'city',index,id,level,cost:buildRecord(id,level+1).cost});
    });
    state.plots.forEach((plot,index)=>{
      if(!plot.type||plot.level<1||plot.level>=buildings[plot.type].max||index>=unlockedPlots()||plotJob(index)||buildingRequirements(plot.type,plot.level+1)||buildingConditions(plot.type,plot.level+1).some(r=>r.kind==='item'))return;
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
      const candidate=autoUpgradeCandidates().find(c=>canPay(c.cost));
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
    return candidates.some(c=>canPay(c.cost))?'材料充足，准备升级':'材料不足，等待资源积累';
  }
  function setAutoUpgrade(enabled){
    if(typeof enabled!=='boolean')return '请选择自动升级状态';
    tick(Date.now(),false);state.autoUpgrade=enabled;
    if(enabled)processAutoUpgrade();save();return null;
  }
  function cancelBuild(key){tick(Date.now(),false);const q=state.buildQueue.find(q=>q.plot===undefined?'site:'+q.site===key:'plot:'+q.plot===key);if(!q)return '没有正在进行的建设';state.autoUpgrade=false;const fraction=.66;for(const [id,count] of Object.entries(q.paidItems||{}))state.inventory[id]=(state.inventory[id]||0)+Math.ceil(count*.66);addRes(Object.fromEntries(Object.entries(q.paid||{}).map(([k,v])=>[k,Math.floor(v*fraction)])));if(q.site!==undefined&&state.cityLevels[q.site]===0)state.cityLayout[q.site]=null;state.buildQueue=state.buildQueue.filter(x=>x!==q);refreshBuildings();save();return null;}
  function demolish(site){tick(Date.now(),false);const id=state.cityLayout[site],level=state.cityLevels[site];if(!id||id==='reserved'||id==='hall')return '官府和空地不能拆除';if(state.buildQueue.some(q=>q.site===site))return '请先取消施工';if(['tavern','drill'].includes(id)&&(allExpeditions().length||Object.keys(state.garrisons).length))return '请先收回外出部队';if(id==='tavern'&&state.generals.length>Math.max(0,level-1))return '请先处理将领房间不足';state.autoUpgrade=false;state.cityLevels[site]--;if(state.cityLevels[site]===0)state.cityLayout[site]=null;addRes(Object.fromEntries(Object.entries(buildRecord(id,level).cost).map(([k,v])=>[k,Math.floor(v*.5)])));refreshBuildings();save();return null;}
  function relocateBuilding(id,index){const old=primarySite(id);if(old<0||id==='hall'||!Number.isInteger(index)||index<0||index>=36||state.cityLayout[index])return '请选择空地，官府不能迁移';state.cityLayout[index]=id;state.cityLayout[old]=null;state.cityLevels[index]=state.cityLevels[old];state.cityLevels[old]=0;for(const q of state.buildQueue)if(q.site===old)q.site=index;save();return null;}
  function unitRequirements(id){const u=units[id];if(!u)return '兵种不存在';const missing=[];for(const [key,level] of Object.entries(u.requires.buildings))if(state.buildings[key]<level)missing.push(buildings[key].name+' '+level+'级');for(const [key,level] of Object.entries(u.requires.tech))if(state.tech[key]<level)missing.push(ManualData.technology[key].name+' '+level+'级');return missing.join('、');}
  const unitUnlocked=id=>!unitRequirements(id);
  const trainingLimit=()=>state.cityLayout.reduce((v,id,i)=>v+(id==='barracks'?state.cityLevels[i]:0),0);
  function trainCost(id,count){return Object.fromEntries(Object.entries(units[id].cost).map(([k,v])=>[k,v*count]));}
  function trainSeconds(id,count){const u=units[id],tech=u.kind==='machine'?state.tech.manufacture:state.tech.training;return Math.max(1,count*u.time/(1+tech*.1+general(state.governor).atk/100)/state.speed);}
  function train(id,count){tick();count=Math.floor(count);if(!units[id]||count<1||count>100000)return '请选择训练数量';const needed=unitRequirements(id);if(needed)return '需要 '+needed;if(state.trainQueue.length>=trainingLimit())return '军营训练队列已满';if(count*(units[id].people||1)>freePopulation())return '空闲人口不足，每名'+units[id].name+'需要 '+(units[id].people||1)+' 人口';const cost=trainCost(id,count);if(!canPay(cost))return '训练资源不足';pay(cost);state.population-=count*(units[id].people||1);const start=Math.max(Date.now(),...state.trainQueue.map(q=>q.end));state.trainQueue.push({id,count,start,end:start+trainSeconds(id,count)*1000});save();return null;}
  function dismissTroops(id,count){tick();count=Math.floor(count);if(!units[id]||count<1||count>state.army[id])return '数量不足';state.army[id]-=count;state.population=Math.min(maxPop(),state.population+count*(units[id].people||1));save();return null;}
  function general(id){const g=[...generals,...state.customGenerals].find(g=>g.id===id),lv=state.generalLevels[id]||1;if(!g)return {id,name:'未知将领',level:1,atk:0,def:0,pol:0,wis:0,lead:0};return {...g,level:lv,atk:(g.atk+(lv-1)*4)*(activeBuff('valor',id)?1.25:1),def:g.def+(lv-1)*3,pol:g.pol*(activeBuff('politics',id)?1.25:1),wis:(g.wis||g.def)*(activeBuff('wisdom',id)?1.25:1),lead:(g.lead||lv*10)*(1+state.tech.leadership*.1)*(activeBuff('tiger',id)?1.5:1)};}
  function setGovernor(id){if(!state.generals.includes(id))return '尚未招募该武将';if(generalBusy(id))return '该武将正在出征或驻守';state.governor=id;save();return null;}
  function setTax(value){tick();state.tax=Math.max(0,Math.min(100,Math.round(Number(value)||0)));save();}
  function civicOrderPreview(id){
    if(typeof id!=='string')return null;
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
    tick(Date.now(),false);const order=civicOrderPreview(id);if(!order)return '官府指令不存在';if(order.reason)return order.reason;
    pay(order.cost);addRes(order.reward);
    state.morale=Math.max(0,Math.min(100,state.morale+order.effects.morale));
    state.unrest=Math.max(0,Math.min(100,state.unrest+order.effects.unrest));
    state.population=Math.min(maxPop(),state.population+order.effects.population);
    state.civicCooldowns[order.kind]=Date.now()+ManualData.civic.cooldownSeconds*1000;Progression.record(state,'civic');
    save();return null;
  }
  const power=a=>Math.round(Object.entries(a).reduce((v,[k,n])=>v+n*(units[k].atk+units[k].hp/10),0));
  function dispatch(nodeId,id,army,mode='raid'){tick();const n=getNode(nodeId);if(!n)return '目标不存在';const blocked=attackBlocked(nodeId,mode);if(blocked)return blocked;if(state.buildings.drill<1)return '请先建造校场';if(allExpeditions().length>=state.buildings.drill)return '超过校场可派遣队伍数';if(allExpeditions().some(e=>e.node===nodeId))return '已有部队前往该目标';if(state.cooldowns[nodeId]>Date.now())return '据点仍在恢复';if(!state.generals.includes(id))return '请选择武将';if(generalBusy(id))return '该武将正在出征或驻守';if(id===state.governor)return '太守负责内政，请先任命其他太守';let selected=blankArmy();for(const k of Object.keys(units)){const count=Math.floor(Number(army[k])||0);if(count<0||count>state.army[k])return '城内兵力不足';selected[k]=count;}if(!totalArmy(selected))return '至少选择 1 名士兵';if(totalArmy(selected)>armyLimit())return '超过校场单队人数上限';const supply=Math.ceil(totalArmy(selected)*1.2+n.time*2);if(state.res.food<supply)return '行军粮食不足';state.res.food-=supply;if(activeBuff('flag'))delete state.buffs.flag;for(const k of Object.keys(units))state.army[k]-=selected[k];if(!state.expedition&&state.battle?.finished)state.battle=null;const expedition={node:nodeId,general:id,mode,army:selected,enemySnapshot:{...attackInfo(nodeId,mode).army},orders:JSON.parse(JSON.stringify(state.tactics)),phase:'march',start:Date.now(),end:Date.now()+Math.max(1,n.time/state.speed)*1000};if(!state.expedition)state.expedition=expedition;else state.expeditions.push(expedition);save();return null;}

  const isCity=n=>n?.terrain==='fort';
  const nLevel=id=>getNode(id)?.level||1;
  const generalBusy=id=>allExpeditions().some(e=>e.general===id)||Object.values(state.garrisons).some(g=>g.general===id);
  const wildOwned=()=>Object.keys(state.conquered).filter(id=>getNode(id)?.wild).length;
  function attackBlocked(id,mode){
    const n=getNode(id);if(!n)return '目标不存在';if(!['raid','occupy'].includes(mode))return '请选择掠夺或占领';
    if(isCity(n)&&!Progression.countyUnlocked(state))return '黄巾之乱四项史诗尚未全部完成，县城攻打未开放';
    if(state.conquered[id]&&(n.wild||isCity(n)))return '这块领地已归属你，可在领地管理中召回驻军或放弃野地';
    if(mode==='occupy'&&state.conquered[id])return '据点已占领';
    if(mode==='occupy'&&n.wild&&wildOwned()>=state.buildings.hall)return '附属野地已满，升级官府或放弃一块野地';
    return null;
  }
  function attackInfo(id,mode='raid'){
    const n=getNode(id);if(!n)return null;const city=isCity(n),siege=city&&mode==='occupy',town=city?state.towns[id]:null;
    const militia=siege?Math.ceil(town.population*.1):0,army={...n.army};if(militia)army.militia=(army.militia||0)+militia;
    const factor=(mode==='raid'?RAID_LOOT_FACTOR:1)*(state.raided[id]?.6:1)*(city&&mode==='raid'?Math.min(1,.6+state.tech.plunder*.03):1);
    const loot=Object.fromEntries(Object.entries(n.loot).filter(([k])=>mode!=='raid'||k!=='gold').map(([k,v])=>[k,Math.round(v*factor)]));
    return {army,loot,siege,militia,morale:town?.morale??null,unrest:town?.unrest??null,population:town?.population??null};
  }
  function recallGarrison(id){
    tick();const g=state.garrisons[id];if(!g)return '这里没有驻军';if(g.phase!=='stationed')return '部队已在返城途中';g.phase='return';g.start=Date.now();g.end=Date.now()+Math.max(5,getNode(id).time/2)*1000;save();return null;
  }
  function abandonWild(id){
    tick();const n=getNode(id);if(!n?.wild||!state.conquered[id])return '只能放弃已占领野地';if(state.garrisons[id])return '请先召回驻军，待部队返城后再放弃';delete state.conquered[id];delete state.landClaims[id];save();return null;
  }

  const defaultOrder=id=>['archer','ballista','catapult'].includes(id)?'hold':'advance';
  const battleLength=rows=>Math.max(0,...rows.map(r=>r.stats?.range||units[r.id].range))+200;
  function formation(army,enemy=false,length=1400){return Object.entries(army).filter(([,n])=>n>0).map(([id,n])=>({id,initial:n,stats:unitStats(id,!enemy),hp:n*unitStats(id,!enemy).hp,maxHp:n*unitStats(id,!enemy).hp,pos:enemy?length:0,defending:false}));}
  const survivors=rows=>Object.fromEntries(Object.keys(units).map(id=>[id,Math.ceil((rows.find(r=>r.id===id)?.hp||0)/(rows.find(r=>r.id===id)?.stats.hp||units[id].hp))]));
  function startBattle(){
    tick();const e=state.expedition;if(!e||e.phase!=='march'||e.end>Date.now())return '部队尚未到达';
    const n=getNode(e.node),info=attackInfo(n.id,e.mode),player=formation(e.army),enemy=formation(e.enemySnapshot||info.army,true),length=battleLength([...player,...enemy]);for(const r of enemy)r.pos=length;
    state.battle={rules:2,length,node:n.id,general:e.general,mode:e.mode,siege:info.siege,militia:info.militia,round:0,player,enemy,orders:Object.fromEntries(player.map(r=>[r.id,{...e.orders[r.id]}])),log:['两军相距 '+length+'。按兵种速度依次行动，同速守方优先。'],auto:true,finished:false,result:null};
    if(info.siege)pushLog(state.battle,'占领攻城：城防启用，义兵 '+info.militia+' 人加入义兵阵。');e.phase='battle';save();return null;
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
    if(target!==undefined){if(target!==''&&!b.enemy.some(r=>r.id===target))return '目标兵种不存在';order.target=target;}
    save();return null;
  }
  function pushLog(b,text){b.log.push(text);b.log=b.log.slice(-40);}
  function battleRound(){
    const b=state.battle;if(!b||b.finished)return null;for(const row of b.player){const stats=unitStats(row.id);row.hp=Math.min(row.initial*stats.hp,row.hp/row.stats.hp*stats.hp);row.maxHp=row.initial*stats.hp;row.stats=stats;}b.round++;
    const g=general(b.general),living=rows=>rows.filter(r=>r.hp>0);
    pushLog(b,'—— 第 '+b.round+' 回合 ——');
    const all=[...b.player.map(r=>({r,side:'player'})),...b.enemy.map(r=>({r,side:'enemy'}))].sort((a,z)=>z.r.stats.speed-a.r.stats.speed||(a.side===z.side?0:a.side==='enemy'?-1:1));
    function strike(r,t,side,counter=false){
      const u={...units[r.id],...r.stats};let mod=1;
      if(r.id==='spear'&&t.id==='cavalry')mod=1.6;
      if(r.id==='cavalry'&&t.id==='archer')mod=1.65;
      if(r.id==='archer'&&t.id==='shield')mod=.5;
      const coverage=Math.min(1,g.lead*100/Math.max(1,totalArmy(state.expedition.army)));const attackBonus=side==='player'?1+(g.atk/220+(g.bonus===r.id?.12:0))*coverage:1.1;
      const defenseBonus=side==='enemy'?1+g.def/300*coverage:1;
      const damage=Math.max(1,Math.round(Math.ceil(r.hp/u.hp)*u.atk*attackBonus*mod/(1+t.stats.def/200)/defenseBonus/(side==='player'&&b.siege?1.25:1)));
      const before=Math.ceil(t.hp/t.stats.hp);t.hp=Math.max(0,t.hp-damage);
      const lost=before-Math.ceil(t.hp/t.stats.hp);
      pushLog(b,(side==='player'?'我军':'敌军')+u.name+(counter?'反击':'攻击')+units[t.id].name+'，距离 '+Math.abs(t.pos-r.pos)+'，伤害 '+damage+(lost?'，击倒 '+lost+' 人':'')+(mod>1?' · 克制':''));
    }
    for(const {r,side} of all){
      if(r.hp<=0)continue;
      const foes=living(side==='player'?b.enemy:b.player);if(!foes.length)break;
      const u={...units[r.id],...r.stats},order=side==='player'?b.orders[r.id]:{command:defaultOrder(r.id),target:''},before=r.pos;
      if(order.command==='advance'){
        const direction=side==='player'?1:-1;
        const ahead=foes.filter(t=>direction*(t.pos-r.pos)>=0);
        const stop=ahead.length?(side==='player'?Math.min(...ahead.map(t=>t.pos)):Math.max(...ahead.map(t=>t.pos))):r.pos;
        r.pos=side==='player'?Math.min(stop,r.pos+u.speed):Math.max(stop,r.pos-u.speed);
      }else if(order.command==='fallback')r.pos=side==='player'?Math.max(0,r.pos-u.speed):Math.min(b.length,r.pos+u.speed);
      r.pos=Math.max(0,Math.min(b.length,r.pos));r.defending=order.command==='hold';
      if(r.pos!==before)pushLog(b,(side==='player'?'我军':'敌军')+u.name+(order.command==='fallback'?'后退':'向前')+Math.abs(r.pos-before)+'，位置 '+before+' → '+r.pos);
      const inRange=foes.filter(t=>Math.abs(t.pos-r.pos)<=u.range);
      const t=inRange.find(t=>t.id===order.target)||inRange.sort((a,z)=>Math.abs(a.pos-r.pos)-Math.abs(z.pos-r.pos)||a.hp-z.hp)[0];
      if(!t){pushLog(b,(side==='player'?'我军':'敌军')+u.name+'：'+(order.command==='hold'?'坚守阵位，':'')+'射程 '+u.range+' 内没有目标。');continue;}
      strike(r,t,side);
      if(t.hp>0&&r.hp>0&&Math.abs(t.pos-r.pos)<=t.stats.range)strike(t,r,side==='player'?'enemy':'player',true);
    }
    if(b.siege&&living(b.enemy).length&&living(b.player).length){
      const target=living(b.player).filter(r=>b.length-r.pos<=1200).sort((a,z)=>z.pos-a.pos)[0];
      if(target){const damage=Math.round((180+nLevel(b.node)*70)/(1+target.stats.def/200)/(1+g.def/300));target.hp=Math.max(0,target.hp-damage);pushLog(b,'城防箭楼射击我军'+units[target.id].name+'，伤害 '+damage+'。');}
    }
    if(!living(b.enemy).length)finishBattle(true);
    else if(!living(b.player).length||b.round>=30){if(b.round>=30)pushLog(b,'达到回合上限，守军未清空，本次攻打失败。');finishBattle(false);}
    save();return b;
  }
  function finishBattle(won,retreated=false){
    const b=state.battle,e=state.expedition;if(!b||b.finished)return;
    const n=getNode(b.node),mode=b.mode,alive=survivors(b.player),back=blankArmy(),lost=blankArmy(),wounded=blankArmy();
    for(const k of Object.keys(units)){wounded[k]=Math.floor((e.army[k]-alive[k])*Math.min(1,(won?.35:.15)+(activeBuff('heal')?.3:0)));back[k]=alive[k]+wounded[k];lost[k]=e.army[k]-back[k];}
    const resourceBefore={...state.res};
    const cargoCapacity=carry(alive),availableLoot=won?attackInfo(n.id,mode).loot:{},loot=won?capLoot(availableLoot,cargoCapacity):{},lootDiscarded=Object.values(availableLoot).reduce((v,n)=>v+n,0)-Object.values(loot).reduce((v,n)=>v+n,0),drops=won?rollBattleDrops(n):{items:{},resources:{}},remainingCarry=Math.max(0,cargoCapacity-Object.values(loot).reduce((v,n)=>v+n,0)),bonusLoot=capLoot(drops.resources,remainingCarry),bonusDiscarded=Object.values(drops.resources).reduce((v,n)=>v+n,0)-Object.values(bonusLoot).reduce((v,n)=>v+n,0),overflow=addRes(loot)+addRes(bonusLoot);let recruit=null,claimed=false,stationed=false,moraleBefore=null,moraleAfter=null;
    for(const [id,count] of Object.entries(drops.items))state.inventory[id]=(state.inventory[id]||0)+count;
    if(won){
      state.stats.victories++;state.raided[n.id]=true;state.cooldowns[n.id]=Date.now()+90000;
      if(isCity(n)){const town=state.towns[n.id];if(mode==='occupy'){moraleBefore=town.morale;town.morale=Math.max(-100,town.morale-35);town.population=Math.max(0,town.population-40);moraleAfter=town.morale;claimed=town.morale<0&&!state.conquered[n.id];}else town.unrest=Math.min(100,town.unrest+10);}
      else if(mode==='occupy')claimed=!state.conquered[n.id];
      if(claimed){state.conquered[n.id]=true;if(n.wild)state.landClaims[n.id]={at:Date.now(),level:n.level};}
      if(claimed&&n.capture&&!state.generals.includes(n.capture)){state.generals.push(n.capture);state.generalLevels[n.capture]=1;state.generalXp[n.capture]=0;recruit=n.capture;}
      if(n.wild&&mode==='occupy'&&claimed&&totalArmy(back)>0){state.garrisons[n.id]={general:e.general,army:{...back},phase:'stationed',start:Date.now(),end:null};stationed=true;}
    }
    const received=Object.fromEntries(Object.keys(resources).map(id=>[id,Math.max(0,Math.floor(state.res[id]-resourceBefore[id]))])),progressionResult=Progression.battle(state,n,b,won,received);
    const xp=won?n.level*45:15;state.generalXp[e.general]=(state.generalXp[e.general]||0)+xp;
    while(state.generalXp[e.general]>=general(e.general).level*80){state.generalXp[e.general]-=general(e.general).level*80;state.generalLevels[e.general]++;}
    if(stationed)state.expedition=null;else{e.army=back;e.phase='return';e.start=Date.now();e.end=Date.now()+Math.max(1,Math.max(5,n.time/2)/state.speed)*1000;}
    b.finished=true;b.auto=false;b.result={...progressionResult,won,mode,claimed,stationed,moraleBefore,moraleAfter,retreated,loot,itemDrops:drops.items,bonusLoot,bonusDiscarded,cargoCapacity,cargoLoaded:Object.values(loot).reduce((v,n)=>v+n,0)+Object.values(bonusLoot).reduce((v,n)=>v+n,0),lootDiscarded,lost,wounded,back,xp,first:claimed,recruit,overflow};
    state.reports.unshift({id:Date.now(),node:n.id,general:e.general,round:b.round,...b.result});state.reports=state.reports.slice(0,20);
    pushLog(b,!won?'战斗失利，幸存部队返城整顿。':mode==='raid'?'掠夺成功，未改变领地归属，部队携战利品返城。':stationed?'占领成功，部队留守野地，耗粮翻倍。':claimed?'占领成功，领地归属变更。':moraleAfter!==null?'攻城获胜，民心 '+moraleBefore+' → '+moraleAfter+'，尚未易主。':'本次战斗结束。');
    if(Object.keys(drops.items).length)pushLog(b,'缴获道具：'+Object.entries(drops.items).map(([id,count])=>ManualData.shop.find(x=>x.id===id).name+' ×'+count).join('、')+'，已收入道具行囊。');
    if(Object.values(bonusLoot).some(n=>n>0))pushLog(b,'额外资源：'+Object.entries(bonusLoot).filter(([,count])=>count>0).map(([id,count])=>resources[id].name+' +'+count).join('、')+'。');
    if(won)pushLog(b,'幸存部队负重 '+cargoCapacity+'，装载资源 '+b.result.cargoLoaded+'；伤兵不参与搬运。');
    if(lootDiscarded>0)pushLog(b,'负重不足，基础资源有 '+lootDiscarded+' 未能带回。');
    if(bonusDiscarded>0)pushLog(b,'部队负重不足，额外资源有 '+bonusDiscarded+' 未能带回。');
    pushLog(b,'声望 '+(progressionResult.prestigeDelta>=0?'+':'')+progressionResult.prestigeDelta+(won?'；获得珍珠 ×1，可用于进献珍宝。':''));
    save();return b.result;
  }
  function battleDropInfo(nodeId){
    const n=getNode(nodeId),level=Math.max(0,Math.min(10,n?.level||0)),d=ManualData.battleDrops;
    return {level,itemChance:Math.min(d.itemChanceMax,d.itemChanceBase+level*d.itemChancePerLevel),resourceChance:Math.min(d.resourceChanceMax,d.resourceChanceBase+level*d.resourceChancePerLevel)};
  }
  function rollBattleDrops(n){
    const d=ManualData.battleDrops,info=battleDropInfo(n.id),items={},resourceLoot={};
    const pool=ManualData.shop.filter(item=>item.effect).map(item=>({item,weight:item.price>=d.rarePrice?d.rareWeightBase+info.level*d.rareWeightPerLevel:d.commonWeight}));
    function pickItem(){let cursor=Math.random()*pool.reduce((sum,entry)=>sum+entry.weight,0);for(const {item,weight} of pool){cursor-=weight;if(cursor<0){items[item.id]=(items[item.id]||0)+1;return;}}}
    if(pool.length&&Math.random()<info.itemChance){pickItem();if(info.level>=d.secondItemMinLevel&&Math.random()<d.secondItemChance)pickItem();}
    if(Math.random()<info.resourceChance){const keys=Object.keys(resources),count=Math.random()<d.secondResourceChance?2:1;for(let i=0;i<count;i++){const index=Math.floor(Math.random()*keys.length),id=keys.splice(index,1)[0];resourceLoot[id]=Math.round((d.resourceBase+d.resourcePerLevelSquared*info.level*info.level)*(.8+Math.random()*.4));}}
    return {items,resources:resourceLoot};
  }
  function selectExpedition(nodeId){tick();if(state.battle&&!state.battle.finished)return '请先完成当前战斗';if(state.expedition?.node===nodeId)return null;const e=state.expeditions.find(x=>x.node===nodeId);if(!e)return '该部队已返回或转入驻军';state.expeditions=state.expeditions.filter(x=>x!==e);if(state.expedition)state.expeditions.push(state.expedition);state.expedition=e;if(state.battle?.finished)state.battle=null;save();return null;}
  function recall(){if(state.expedition?.phase!=='march')return '只有行军中的部队可以召回';state.expedition.phase='return';state.expedition.start=Date.now();state.expedition.end=Date.now()+5000;save();return null;}
  function dismissBattle(){if(state.battle?.finished){state.battle=null;save();}}

  function unitStats(id,player=true){const u=units[id];if(!player)return {hp:u.hp,atk:u.atk,def:u.def,range:u.range,speed:u.speed};return {hp:Math.round(u.hp*(1+state.tech.supply*.05)),atk:Math.round(u.atk*(1+state.tech.combat*.05)*(activeBuff('drum')?1.1:1)),def:Math.round(u.def*(1+state.tech.protection*.05)*(activeBuff('formation')?1.1:1)),range:Math.round(u.range*(u.range>=1000?1+state.tech.shooting*.05:1)),speed:Math.round(u.speed*(u.kind==='infantry'?1+state.tech.march*.1:1+state.tech.riding*.05))};}
  function carry(army){return Math.floor(Object.entries(army).reduce((v,[id,n])=>v+units[id].carry*n,0)*(1+state.tech.load*.1));}
  function capLoot(loot,limit){const total=Object.values(loot).reduce((v,n)=>v+n,0),factor=Math.min(1,limit/Math.max(1,total));return Object.fromEntries(Object.entries(loot).map(([k,n])=>[k,Math.floor(n*factor)]));}
  function lootPreview(id,mode,army){const info=attackInfo(id,mode),capacity=carry(army),loot=capLoot(info?.loot||{},capacity),loaded=Object.values(loot).reduce((v,n)=>v+n,0);return {capacity,loot,loaded,discarded:Object.values(info?.loot||{}).reduce((v,n)=>v+n,0)-loaded};}
  function researchCost(id){return ReferenceRules.researchRows[id]?.[state.tech[id]+1]?.cost||{};}
  const researchSeconds=id=>Math.max(1,Math.floor((ReferenceRules.researchRows[id]?.[state.tech[id]+1]?.seconds||1)/(1+general(state.governor).wis/100)*(1-(state.tech.researching||0)*.03)/state.speed));
  const armyLimit=()=>Math.floor(state.buildings.drill*10000*(activeBuff('flag')?1.25:1));
  function research(id){tick();if(!ManualData.technology[id])return '科技不存在';if(state.buildings.academy<1)return '请先建造书院';if(state.researchQueue)return '书院正在研究另一项科技';if(state.tech[id]>=10)return '科技已满级';const level=state.tech[id]+1;const requirement=researchRequirements(id);if(requirement)return '需要 '+requirement;const cost=researchCost(id);if(!canPay(cost))return '研究资源不足';pay(cost);const start=Date.now();state.researchQueue={id,level,start,end:start+researchSeconds(id)*1000};save();return null;}
  function scout(id){tick();const n=getNode(id);if(!n)return '目标不存在';if(state.army.scout<1)return '城内至少需要 1 名斥候';if(state.res.food<10)return '侦察需要 10 粮食（试玩值）';state.res.food-=10;state.scouted[id]={at:Date.now(),level:state.tech.scouting};Progression.record(state,'scout');save();return null;}
  function intel(id){const entry=state.scouted[id];return entry?{...entry,exact:entry.level>=5}:null;}
  function troopBand(n){if(n===0)return '无';const bands=[[10,'几个'],[25,'少数'],[50,'小队'],[100,'一些'],[250,'一群'],[500,'许多'],[1000,'大队'],[2500,'大群'],[5000,'大批'],[10000,'巨量'],[Infinity,'无数']];return bands.find(([max])=>n<max)[1];}
  function npcName(id,n){return n?.wild?ManualData.npcNames[id]||units[id].name:units[id].name;}
  function refreshInn(){tick();if(state.buildings.inn<1)return '请先建造客栈';const surnames=['魏','邵','程','陆','叶','夏','徐','陶'],given=['衡','舟','川','岚','松','宁','瑜','晏'];state.innCandidates=Array.from({length:state.buildings.inn},(_,i)=>{const number=Date.now()+i,seed=hash(number%10000,i),level=1+seed%Math.max(1,state.buildings.inn*2);return {id:'local_'+number,name:surnames[seed%8]+given[Math.floor(seed/8)%8],level,atk:35+seed%46,def:35+Math.floor(seed/5)%46,pol:35+Math.floor(seed/13)%46,wis:35+Math.floor(seed/17)%46,lead:level*10,price:level*1000,type:'将',title:'客栈游士',desc:'愿以一身所学，助城池安稳发展。',bonus:['spear','archer','shield'][seed%3]};});save();return null;}
  function recruit(id){tick();const hero=state.innCandidates.find(g=>g.id===id);if(!hero)return '候选已离开';if(state.generals.length>=state.buildings.tavern)return '招贤馆没有空闲房间';if(state.res.gold<hero.price)return '黄金不足';state.res.gold-=hero.price;state.customGenerals.push(hero);state.generals.push(hero.id);state.generalLevels[hero.id]=hero.level;state.generalXp[hero.id]=0;state.innCandidates=state.innCandidates.filter(g=>g.id!==id);save();return null;}
  function trade(resource,count,buy){tick();count=Math.floor(count);if(state.buildings.market<1)return '请先建造市场';if(resource==='gold'||!resources[resource]||count<1||count>state.buildings.market*100000)return '交易数量超出商队规模';if(buy){if(state.res.gold<count)return '黄金不足';if(state.res[resource]+count>capacity(resource))return '资源容量不足';state.res.gold-=count;state.res[resource]+=count;}else{if(state.res[resource]<count)return '资源不足';if(state.res.gold+count>capacity('gold'))return '黄金容量不足';state.res[resource]-=count;state.res.gold+=count;}save();return null;}
  function buyItem(id,count=1){const item=ManualData.shop.find(x=>x.id===id);count=Math.floor(count);if(!item?.effect)return '该道具依赖尚未接入的系统，暂不出售';if(count<1||count>99)return '请选择购买数量';if(state.gems<item.price*count)return '试玩元宝不足';state.gems-=item.price*count;state.inventory[id]=(state.inventory[id]||0)+count;save();return null;}
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
    tick(now,false,true);if(state.autoUpgrade)processAutoUpgrade();save();
    return {error:null,requestedMs,removedMs,completed:q.end<=now,waitMs:quote.waitMs};
  }
  function useItem(id,heroId,text){tick();const item=ManualData.shop.find(x=>x.id===id);if(!item?.effect||!state.inventory[id])return '没有可使用的道具';const effect=item.effect;
    if(effect==='speedup')return useSpeedup(id,text).error;
    if(effect==='blueprint')return '图纸在建筑升至 10 级时自动消耗，请在建筑页面使用';
    if(['politics','valor','wisdom','tiger'].includes(effect)&&!state.generals.includes(heroId))return '请选择将领';
    if(effect==='population'){if(state.population>=maxPop())return '人口已达上限';state.population=Math.min(maxPop(),state.population+Math.max(100,maxPop()*.2));}
    else if(effect==='peace'){if((state.itemCooldowns.peace||0)>Date.now())return '安民告示仍在 3 天冷却';state.morale=100;state.unrest=0;state.itemCooldowns.peace=Date.now()+259200000;}
    else if(effect==='recruit'){const error=refreshInn();if(error)return error;}
    else if(['rename','banner'].includes(effect)){const value=String(text||'').trim();if(!value||value.length>(effect==='rename'?12:2))return '名称长度不合适';state[effect==='rename'?'ruler':'banner']=value;}
    else{const key=effect+(['politics','valor','wisdom','tiger'].includes(effect)?':'+heroId:'');const end=effect==='flag'?Date.now()+86400000:Math.max(Date.now(),state.buffs[key]?.end||0)+item.seconds*1000;state.buffs[key]={effect,general:heroId||null,end};}
    state.inventory[id]--;Progression.record(state,'item');save();return null;
  }
  function starterGiftPending(){return state.starterGiftVersion<2;}
  function starterGiftRemaining(){return Object.fromEntries(Object.entries(starterGiftReward).map(([id,n])=>[id,n-(state.starterGiftVersion===1?20000:state.starterGiftVersion>=2?n:0)]));}
  function addSupplies(reward){for(const [id,n] of Object.entries(reward))state.res[id]+=n;}
  function claimStarterGift(){
    if(!starterGiftPending())return '新手礼包已足额领取，每个存档限领一次';
    tick(Date.now(),false);
    // Gifts and mission supplies are guaranteed; temporarily overfull storage remains spendable.
    addSupplies(starterGiftRemaining());
    state.starterGiftClaimed=true;state.starterGiftVersion=2;save();return null;
  }
  function claimTrialGems(){if(Date.now()-state.trialGiftAt<86400000)return '试玩补给每天领取一次';state.gems+=1000;state.trialGiftAt=Date.now();save();return null;}
  function setSpeed(value){tick();if(![1,10,60].includes(Number(value)))return '请选择试玩倍率';state.speed=Number(value);save();return null;}
  function setStorage(allocation){const keys=['food','wood','stone','iron'];if(!keys.every(k=>Number.isInteger(Number(allocation[k]))&&Number(allocation[k])>=0&&Number(allocation[k])<=100)||keys.reduce((v,k)=>v+Number(allocation[k]),0)!==100)return '四项比例之和必须是 100%';state.storageAllocation=Object.fromEntries(keys.map(k=>[k,Number(allocation[k])]));save();return null;}
  function buildDefense(id,count){tick();count=Math.floor(count);const d=ManualData.defenses[id];if(!d||count<1||count>10000)return '请输入城防数量';if(state.buildings.wall<d.wall)return '需要城墙 '+d.wall+' 级';for(const [key,level] of Object.entries(d.tech||{}))if(state.tech[key]<level)return '需要 '+ManualData.technology[key].name+' '+level+' 级';const requirement=defenseRequirements(id,count);if(requirement)return '需要 '+requirement;if(state.defenseQueue.length>=1)return '城防工队正在忙碌';const cost=Object.fromEntries(Object.entries(d.cost).map(([k,v])=>[k,v*count]));if(!canPay(cost))return '城防资源不足';pay(cost);const start=Date.now();state.defenseQueue.push({id,count,start,end:start+Math.max(1,count*d.time/(1+state.tech.construction*.1+general(state.governor).pol/100)/state.speed)*1000});save();return null;}

  function claimMission(id){
    tick(Date.now(),false);const m=id?missions.find(x=>x.id===id):currentMission();
    if(!m)return '任务已全部完成';if(missionClaimed(m.id))return '该任务奖励已领取';if(!m.check(state))return '目标尚未达成';
    addSupplies(m.reward);state.prestige+=300;state.missionClaims.push(m.id);state.mission=state.missionClaims.length;save();return null;
  }
  function claimReadyMissions(){
    tick(Date.now(),false);const ready=missions.filter(m=>missionReady(m));if(!ready.length)return '暂无可领取奖励';
    for(const m of ready){addSupplies(m.reward);state.prestige+=300;state.missionClaims.push(m.id);}state.mission=state.missionClaims.length;save();return null;
  }
  function progressionAction(action,...args){tick(Date.now(),false);const error=Progression[action](state,...args);if(!error)save();return error;}
  const acceptDaily=uid=>progressionAction('accept',uid),abandonDaily=uid=>progressionAction('abandon',uid),claimDaily=uid=>progressionAction('claim',uid),donateEpic=(kind,id)=>progressionAction('donate',kind,id),exchangeCopper=id=>progressionAction('exchange',id);
  function reset(){state=newState();save();}
  return {defenseCapacity,defenseUsed,defenseRequirements,armyPeople,buildingRuleText,researchRequirements,researchRuleText,buildingRequirements,speedupKey,speedupTargets,speedupQuote,useSpeedup,progression:Progression,acceptDaily,abandonDaily,claimDaily,donateEpic,exchangeCopper,countyUnlocked:()=>Progression.countyUnlocked(state),init,tick,save,reset,validSave,migrateSave,importSave,get state(){return state;},allExpeditions,selectExpedition,resources,buildings,cityIds,plotTypes,PLOT_COUNT,unlockedPlots,plotJob,plotCost,plotTime,plotYield,developPlot,economyOutputFactor:ECONOMY_OUTPUT_FACTOR,lootPreview,isCity,generalBusy,wildOwned,attackBlocked,attackInfo,battleDropInfo,recallGarrison,abandonWild,buildRecord,buildSeconds,researchSeconds,armyLimit,primarySite,queueBuilding,cancelBuild,demolish,buildLimit,setAutoUpgrade,autoUpgradeStatus,freePopulation,workers,unitRequirements,trainSeconds,trainingLimit,dismissTroops,unitStats,carry,upkeep,researchCost,research,scout,intel,troopBand,npcName,refreshInn,recruit,trade,buyItem,useItem,claimStarterGift,starterGiftPending,starterGiftRemaining,starterGiftReward,claimReadyMissions,missionClaimed,missionReady,currentMission,claimTrialGems,setSpeed,setStorage,buildDefense,manual:ManualData,units,get generals(){return [...generals,...(state?.customGenerals||[])];},nodes,WORLD_SIZE,home,landmarks,terrainTypes,getWorldTile,getNode,relocateBuilding,missions,rates,maxPop,committed,capacity,canPay,upgradeCost,upgrade,unitUnlocked,trainCost,train,general,setGovernor,setTax,civicOrderPreview,executeCivicOrder,power,totalArmy,dispatch,startBattle,battleRound,setBattleOrder,setTactic,recall,dismissBattle,claimMission};
})();
if(typeof module!=='undefined')module.exports=Game;
