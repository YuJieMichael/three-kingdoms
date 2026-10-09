'use strict';
// Source rules and prototype thresholds are documented in RULES.md.
const Progression = (() => {
  const DAY=86400000, REFILL=7200000, SERVER_OFFSET=8*3600000;
  // China server day starts at 05:00, independent of the device time zone.
  const period=now=>Math.floor((now+SERVER_OFFSET-5*3600000)/DAY)*DAY-SERVER_OFFSET+5*3600000;
  const jewels={pearl:{name:'珍珠',prestige:1000,points:1},coral:{name:'珊瑚',prestige:1200,points:1},glass:{name:'琉璃',prestige:1500,points:1},amber:{name:'琥珀',prestige:2000,points:2},agate:{name:'玛瑙',prestige:2500,points:2},crystal:{name:'水晶',prestige:3000,points:2},jadeite:{name:'翡翠',prestige:3500,points:3},jade:{name:'玉石',prestige:4000,points:4},nightPearl:{name:'夜明珠',prestige:5000,points:5}};
  const resourceDonations={food:{amount:100000,prestige:1000},wood:{amount:100000,prestige:1500},stone:{amount:100000,prestige:2000},iron:{amount:100000,prestige:2500},gold:{amount:100000,prestige:3000}};
  const troopDonations={militia:{amount:2000,prestige:2000,points:1},spear:{amount:1500,prestige:2000,points:2},shield:{amount:1200,prestige:2000,points:2},archer:{amount:1000,prestige:3000,points:2},cavalry:{amount:750,prestige:3500,points:3},heavy:{amount:500,prestige:4500,points:4},ballista:{amount:300,prestige:5000,points:5},ram:{amount:200,prestige:5500,points:6},catapult:{amount:100,prestige:6000,points:8}};
  const targets={kills:1500,troops:2,treasures:2}; // Personal PVE completion totals: trial values.
  const BOARD_SIZE=24, ACCEPT_LIMIT=12;
  const fixedMetrics=['build','research','civic','item','victory','field_build','comfort','levy','occupy','city_build','research_production','research_military','wild_victory','siege_victory','win_level_3','win_level_5'];
  const metricIds=[...new Set(['build','field_build','train','train_archer','train_cavalry','research','victory','kill','occupy','raid_food','raid_wood','raid_stone','raid_iron','raid_gold','scout','civic','comfort','levy','item','defense','trade','capture','captive_recruit',...Object.keys(ManualData.units).map(id=>'train_'+id),'city_build','research_production','research_military','wild_victory','siege_victory','win_level_3','win_level_5','win_level_8','trade_buy','trade_sell'])];
  const researchGroups={production:['plant','logging','mining','smelting'],military:['combat','protection','shooting','training','march','riding','load','leadership','manufacture','fortification','repair','plunder','supply','scouting']};
  const researchMetric=id=>Object.entries(researchGroups).find(([,ids])=>ids.includes(id))?.[0];
  const milestones=[{count:3,resources:10000,gold:25000,items:{speed_build_15m:2}},{count:6,resources:20000,gold:50000,items:{speed_research_1h:1}},{count:10,resources:35000,gold:80000,items:{goldBrick:1,speed_train_1h:1}}];
  const templates=[
    {id:'build',title:'修整城坊',desc:'接取后完成建筑或资源田建设／升级',metric:'build',amount:2,route:'inner'},
    {id:'train',title:'乡勇集结',desc:'接取后完成士兵训练',metric:'train',amount:30,route:'army'},
    {id:'research',title:'研习兵法',desc:'接取后完成科技研究',metric:'research',amount:1,route:'research'},
    {id:'victory',title:'扫荡贼寇',desc:'接取后赢得野地或据点战斗',metric:'victory',amount:1,route:'world'},
    {id:'raid',title:'缴获军粮',desc:'接取后通过掠夺实际收入仓库的粮食',metric:'raid_food',amount:500,route:'world'},
    {id:'scout',title:'探明敌情',desc:'接取后成功侦察目标',metric:'scout',amount:2,route:'world'},
    {id:'civic',title:'安定民生',desc:'接取后执行安抚或征收指令',metric:'civic',amount:1,route:'civic'},
    {id:'item',title:'整备军资',desc:'接取后成功使用宝物',metric:'item',amount:1,route:'inventory'},
    ...['food','wood','stone','iron','gold'].map(resource=>({id:'donate_'+resource,title:({food:'支援军粮',wood:'征集木料',stone:'修城石料',iron:'军械铁料',gold:'犒赏军士'})[resource],desc:'交付现有物资，接取前积攒的库存也可使用',resource,amount:2000,route:'stock'}))
  ];
  templates.push(
    {id:'fields',title:'拓展资源田',desc:'接取后完成城外资源田建设或升级',metric:'field_build',amount:2,route:'outer'},
    {id:'kills',title:'击破敌阵',desc:'接取后在获胜战斗中击败敌军',metric:'kill',amount:30,route:'world'},
    {id:'occupy',title:'拓土守疆',desc:'接取后首次占领一个野地、据点或县城',metric:'occupy',amount:1,route:'world'},
    {id:'comfort',title:'抚恤百姓',desc:'接取后执行一次赈灾、祈福或增丁',metric:'comfort',amount:1,route:'civic'},
    {id:'levy',title:'征集军资',desc:'接取后执行一次资源或黄金征收',metric:'levy',amount:1,route:'civic'},
    {id:'defense',title:'修筑防线',desc:'接取后完成城防工事建设',metric:'defense',amount:3,route:'defense'},
    {id:'trade',title:'往来商旅',desc:'接取后在市场买卖资源',metric:'trade',amount:2000,route:'market'},
    {id:'capture',title:'俘获降卒',desc:'接取后在获胜战斗中获得俘虏',metric:'capture',amount:3,route:'world'},
    {id:'recruitCaptives',title:'收编降卒',desc:'接取后从俘虏营招降士兵',metric:'captive_recruit',amount:3,route:'captives'},
    {id:'archers',title:'弓阵集训',desc:'接取后完成弓箭兵训练',metric:'train_archer',amount:15,route:'army'},
    {id:'cavalry',title:'骑兵集训',desc:'接取后完成轻骑兵训练',metric:'train_cavalry',amount:10,route:'army'},
    ...['wood','stone','iron'].map(resource=>({id:'raid_'+resource,title:({wood:'夺取木料',stone:'缴获石料',iron:'夺取铁料'})[resource],desc:'接取后通过掠夺实际收入仓库的'+({wood:'木材',stone:'石料',iron:'铁锭'})[resource],metric:'raid_'+resource,amount:500,route:'world'}))
  );
  templates.push(
    ...[['militia',30],['spear',20],['shield',20],['heavy',10],['worker',20],['wagon',5],['ballista',3],['ram',3],['catapult',3]].map(([unit,amount])=>({id:'train_'+unit,title:ManualData.units[unit].name+'操练',desc:'接取后完成'+ManualData.units[unit].name+'训练',metric:'train_'+unit,unit,amount,route:'army'})),
    {id:'wildVictory',title:'肃清乡野',desc:'接取后赢得网格野地战斗',metric:'wild_victory',worldType:'wild',amount:1,route:'world'},
    {id:'siegeVictory',title:'城下立功',desc:'接取后赢得县城掠夺或占领战斗',metric:'siege_victory',worldType:'siege',amount:1,route:'world'},
    {id:'highVictory3',title:'攻克强敌',desc:'接取后战胜 3 级或更高等级目标',metric:'win_level_3',worldType:'combat',minLevel:3,amount:1,route:'world'},
    {id:'highVictory5',title:'破阵夺旗',desc:'接取后战胜 5 级或更高等级目标',metric:'win_level_5',worldType:'combat',minLevel:5,amount:1,route:'world'},
    {id:'cityBuild',title:'修缮城内',desc:'接取后完成城内建筑建设或升级',metric:'city_build',amount:2,route:'inner'},
    {id:'productionResearch',title:'农工技艺',desc:'接取后完成种植、砍伐、挖掘或冶炼科技研究',metric:'research_production',researchGroup:'production',amount:1,route:'research'},
    {id:'militaryResearch',title:'军备研习',desc:'接取后完成军事类科技研究',metric:'research_military',researchGroup:'military',amount:1,route:'research'},
    {id:'tradeBuy',title:'采购军需',desc:'接取后在市场用黄金购买资源',metric:'trade_buy',market:true,amount:2000,route:'market'},
    {id:'tradeSell',title:'调剂库存',desc:'接取后在市场卖出资源换黄金',metric:'trade_sell',market:true,amount:2000,route:'market'}
  );
  function tier(s){return s.prestige>=32000?4:s.prestige>=8000?3:s.prestige>=1000?2:1;}
  function unlocked(s,t){
    if(t.unit){const req=ManualData.units[t.unit].requires;return Object.entries(req.buildings).every(([id,n])=>s.buildings[id]>=n)&&Object.entries(req.tech).every(([id,n])=>s.tech[id]>=n);}
    if(t.researchGroup)return s.buildings.academy>=1&&researchGroups[t.researchGroup].some(id=>s.tech[id]<10);
    if(t.market)return s.buildings.market>=1;
    if(t.worldType){if(s.buildings.drill<1||s.buildings.barracks<1)return false;if(t.worldType==='siege')return countyUnlocked(s);return !t.minLevel||s.stats.victories>=t.minLevel;}
    if(['victory','raid','kills','occupy','capture'].includes(t.id)||t.id.startsWith('raid_'))return s.buildings.drill>=1&&s.buildings.barracks>=1;
    if(t.id==='train')return s.buildings.barracks>=1;
    if(t.id==='research')return s.buildings.academy>=1;
    if(t.id==='scout')return s.army.scout>0;
    if(t.id==='defense')return s.buildings.wall>=1;
    if(t.id==='trade')return s.buildings.market>=1;
    if(t.id==='recruitCaptives')return Object.values(s.captives||{}).some(n=>n>0);
    if(['archers','cavalry'].includes(t.id)){const req=ManualData.units[t.id==='archers'?'archer':'cavalry'].requires;return Object.entries(req.buildings).every(([id,n])=>s.buildings[id]>=n)&&Object.entries(req.tech).every(([id,n])=>s.tech[id]>=n);}
    return true;
  }
  function makeTask(s,index){const d=s.daily,level=tier(s),seed=Math.floor(d.start/DAY),pool=templates.filter(t=>unlocked(s,t)),unique=pool.filter(t=>!d.tasks.some(x=>x.template===t.id)),choices=unique.length?unique:pool,template=choices[((seed+index*7)%choices.length+choices.length)%choices.length];return {uid:d.start+'_'+index,template:template.id,target:template.amount*(fixedMetrics.includes(template.metric)?1:level),progress:0,status:'available',acceptedAt:0,tier:level};}
  function freshDaily(s,now){s.daily={start:period(now),refillAt:period(now),serial:0,tasks:[],claimed:0,exchangeClaims:[],milestoneClaims:[],brickPurchases:Object.fromEntries(RewardData.goldBricks.map(b=>[b.id,0])),rulesVersion:3};for(let i=0;i<BOARD_SIZE;i++)s.daily.tasks.push(makeTask(s,s.daily.serial++));}
  function init(s,now=Date.now()){
    if(s.activityMetrics===undefined)s.activityMetrics=Object.fromEntries(metricIds.map(id=>[id,0]));
    else if(s.activityMetrics&&typeof s.activityMetrics==='object')for(const id of metricIds)if(s.activityMetrics[id]===undefined)s.activityMetrics[id]=0;
    if(s.daily&&s.daily.milestoneClaims===undefined)s.daily.milestoneClaims=[];
    if(s.daily&&s.daily.brickPurchases===undefined)s.daily.brickPurchases=Object.fromEntries(RewardData.goldBricks.map(b=>[b.id,0]));
    if(s.daily&&(s.daily.rulesVersion===undefined||s.daily.rulesVersion<3)){s.daily.rulesVersion=3;while(s.daily.tasks.filter(t=>t.status==='available').length<BOARD_SIZE)s.daily.tasks.push(makeTask(s,s.daily.serial++));}
    if(s.progressionSchema===1)return;
    // One-time estimate preserves existing development; no old rewards are reissued.
    s.prestige=Math.floor((s.cityLevels||[]).reduce((n,l)=>n+l*l*50,0)+(s.plots||[]).reduce((n,p)=>n+p.level*p.level*50,0)+Object.values(s.tech||{}).reduce((n,l)=>n+l*l*100,0)+(s.stats?.trained||0)/5+(s.stats?.victories||0)*100+(s.missionClaims||[]).length*300);
    s.copper=0;s.jewels=Object.fromEntries(Object.keys(jewels).map(id=>[id,0]));
    s.epic={kills:0,killRewards:0,resources:Object.fromEntries(Object.keys(resourceDonations).map(id=>[id,0])),troops:0,treasures:0,legacyAccess:!!(s.conquered?.fort||s.raided?.fort||s.battle?.node==='fort'||[s.expedition,...(s.expeditions||[])].some(e=>e?.node==='fort'))};
    s.progressionSchema=1;freshDaily(s,now);
  }
  function ensureDaily(s,now=Date.now()){
    if(period(now)>s.daily.start)freshDaily(s,now);
    if(now<s.daily.start)return;
    const d=s.daily,steps=Math.max(0,Math.floor((now-d.refillAt)/REFILL));d.refillAt+=steps*REFILL;
    const count=Math.min(steps,BOARD_SIZE-d.tasks.filter(t=>t.status==='available').length);
    for(let i=0;i<count;i++)d.tasks.push(makeTask(s,d.serial++));
  }
  const definition=t=>templates.find(x=>x.id===t.template);
  const taskReady=(s,t)=>t.status==='accepted'&&(definition(t).resource?s.res[definition(t).resource]>=t.target:t.progress>=t.target);
  function record(s,metric,amount=1,at=Date.now()){
    if(metricIds.includes(metric))s.activityMetrics[metric]+=amount;
    ensureDaily(s,at);if(at<s.daily.start)return;
    for(const t of s.daily.tasks)if(t.status==='accepted'&&at>=t.acceptedAt&&definition(t).metric===metric)t.progress=Math.min(t.target,t.progress+amount);
  }
  function reward(t){const def=definition(t),combat=['victory','kill','occupy','capture','wild_victory','siege_victory','win_level_3','win_level_5'].includes(def.metric)||def.metric?.startsWith('raid_'),level=t.tier,amount=(combat?10000:def.resource?6000:8000)*level;
    const stone=Math.ceil(amount*(['build','field_build','city_build'].includes(def.metric)?RewardData.constructionStoneFactor:1));
    return {prestige:300*level,copper:40*level,gold:(combat?20000:12000)*level,resources:{food:amount,wood:amount,stone,iron:amount}};
  }
  function taskItem(s,t){const items=ManualData.shop.filter(i=>i.effect&&!i.rewardOnly),index=Number(t.uid.split('_')[1]);return items[((Math.floor(s.daily.start/DAY)+index)%items.length+items.length)%items.length];}
  function accept(s,uid,now=Date.now()){
    ensureDaily(s,now);const t=s.daily.tasks.find(t=>t.uid===uid);
    if(!t||t.status!=='available')return '该任务已刷新或已接取';
    if(s.daily.tasks.filter(t=>t.status==='accepted').length>=ACCEPT_LIMIT)return '最多同时接取 '+ACCEPT_LIMIT+' 项任务';
    t.status='accepted';t.acceptedAt=now;return null;
  }
  function abandon(s,uid,now=Date.now()){
    ensureDaily(s,now);const t=s.daily.tasks.find(t=>t.uid===uid);
    if(!t||t.status!=='accepted')return '任务已刷新或未接取';
    s.daily.tasks=s.daily.tasks.filter(task=>task!==t);return null;
  }
  function claim(s,uid,now=Date.now()){
    ensureDaily(s,now);const t=s.daily.tasks.find(t=>t.uid===uid);
    if(!t||!taskReady(s,t))return '任务尚未完成或已经刷新';
    const def=definition(t),r=reward(t);if(def.resource)s.res[def.resource]-=t.target;
    s.prestige+=r.prestige;s.copper+=r.copper;s.res.gold+=r.gold;
    for(const [id,n] of Object.entries(r.resources))s.res[id]+=n;
    const item=taskItem(s,t);s.inventory[item.id]=(s.inventory[item.id]||0)+1;
    s.daily.claimed++;s.daily.tasks=s.daily.tasks.filter(task=>task!==t);return null;
  }
  function claimMilestone(s,count,now=Date.now()){ensureDaily(s,now);const m=milestones.find(m=>m.count===count);if(!m)return '奖励不存在';if(s.daily.milestoneClaims.includes(count))return '今日奖励已领取';if(s.daily.claimed<count)return '今日完成任务数量不足';
    for(const id of ['food','wood','stone','iron'])s.res[id]+=m.resources;s.res.gold+=m.gold;
    for(const [id,n] of Object.entries(m.items))s.inventory[id]=(s.inventory[id]||0)+n;s.daily.milestoneClaims.push(count);return null;
  }
  function claimReady(s,now=Date.now()){ensureDaily(s,now);let count=0;for(const t of [...s.daily.tasks])if(taskReady(s,t)){const error=claim(s,t.uid,now);if(!error)count++;}return count?null:'暂无已完成的每日任务';}
  const groups=s=>[
    {id:'kills',name:'讨伐黄巾',progress:Math.min(1,s.epic.kills/targets.kills),detail:'掠夺野地或地图据点胜利可缴获黄巾头巾；县城、黄巾城等城池掠夺不计头巾。已缴获 '+s.epic.kills+' / '+targets.kills+' 件头巾'},
    {id:'resources',name:'捐献军资',progress:Object.values(s.epic.resources).reduce((n,v)=>n+v,0)/500000,detail:'五种物资各捐献 100,000，合计 500,000'},
    {id:'troops',name:'王于兴师',progress:Math.min(1,s.epic.troops/targets.troops),detail:'勤王诏 '+s.epic.troops+' / '+targets.troops+' · 捐献士兵后离开你的军队'},
    {id:'treasures',name:'进献珍宝',progress:Math.min(1,s.epic.treasures/targets.treasures),detail:'贡品录 '+s.epic.treasures+' / '+targets.treasures+' · 珍宝由战斗掉落／铜钱兑换获得'}
  ];
  const countyUnlocked=s=>s.epic.legacyAccess||groups(s).every(g=>g.progress>=1);
  function donationQuote(s,kind,id){
    let cost=0,prestige=0,points=0,reason='';
    if(kind==='resource'&&resourceDonations[id]){const d=resourceDonations[id];cost=d.amount;prestige=d.prestige;if(s.epic.resources[id]>=d.amount)reason='该物资已完成捐献';else if(s.res[id]<cost)reason='库存不足 '+cost;}
    else if(kind==='troop'&&troopDonations[id]){const d=troopDonations[id];cost=d.amount;prestige=d.prestige;points=d.points;if(s.epic.troops>=targets.troops)reason='王于兴师已完成';else if(s.army[id]<cost)reason='驻城兵力不足 '+cost;}
    else if(kind==='jewel'&&jewels[id]){cost=10;prestige=jewels[id].prestige;points=jewels[id].points;if(s.epic.treasures>=targets.treasures)reason='进献珍宝已完成';else if(s.jewels[id]<cost)reason='珍宝不足 10 枚';}
    else reason='捐献项目不存在';
    return {kind,id,cost,prestige,points,reason};
  }
  function donate(s,kind,id){const q=donationQuote(s,kind,id);if(q.reason)return q.reason;
    if(kind==='resource'){s.res[id]-=q.cost;s.epic.resources[id]+=q.cost;}
    if(kind==='troop'){s.army[id]-=q.cost;s.epic.troops+=q.points;}
    if(kind==='jewel'){s.jewels[id]-=q.cost;s.epic.treasures+=q.points;}
    s.prestige+=q.prestige;return null;
  }
  function battle(s,n,b,won,received){
    const before=s.prestige,kills=b.enemy.reduce((sum,r)=>sum+r.initial-Math.ceil(r.hp/r.stats.hp),0),loss=b.player.reduce((sum,r)=>sum+r.initial-Math.ceil(r.hp/r.stats.hp),0);
    s.prestige=Math.max(0,s.prestige+(won?100*n.level+Math.floor(kills/5):-Math.max(20,Math.floor(loss/5))));
    const jewelDrops={};if(won){record(s,'victory');record(s,'kill',kills);if(n.wild)record(s,'wild_victory');if(n.terrain==='fort')record(s,'siege_victory');for(const level of [3,5,8])if(n.level>=level)record(s,'win_level_'+level);if(b.mode==='raid'){for(const [id,count] of Object.entries(received))record(s,'raid_'+id,count);if(!n.terrain||n.terrain!=='fort'){s.epic.kills=Math.min(targets.kills,s.epic.kills+kills);const batches=Math.floor(s.epic.kills/500);s.prestige+=(batches-s.epic.killRewards)*500;s.epic.killRewards=batches;}}
      // Prototype drops: a low-tier pearl every win, plus a rarer jewel at higher levels.
      jewelDrops.pearl=1;if(Math.random()<Math.min(.5,n.level*.05)){const choices=Object.keys(jewels).slice(1,Math.min(9,n.level+2));jewelDrops[choices[Math.floor(Math.random()*choices.length)]]=1;}
      for(const [id,count] of Object.entries(jewelDrops))s.jewels[id]+=count;
    }
    return {prestigeDelta:s.prestige-before,jewelDrops};
  }
  function exchangeOffers(s){const available=ManualData.shop.filter(i=>i.effect&&!i.rewardOnly),seed=Math.floor(s.daily.start/DAY);return [{id:'pearl',name:'珍珠 ×1',cost:40},...Array.from({length:3},(_,i)=>{const item=available[(seed+i*5)%available.length];return {id:item.id,name:item.name+' ×1',cost:Math.max(20,Math.ceil(item.price/5))};})];}
  function exchange(s,id,now=Date.now()){
    ensureDaily(s,now);const offer=exchangeOffers(s).find(x=>x.id===id);if(!offer)return '商品已刷新';
    if(s.buildings.inn<1)return '需要 1 级客栈';if(s.daily.exchangeClaims.filter(x=>x===id).length>=(id==='pearl'?10:1))return '今日兑换次数已用完';if(s.copper<offer.cost)return '铜钱不足';
    s.copper-=offer.cost;if(id==='pearl')s.jewels.pearl++;else s.inventory[id]=(s.inventory[id]||0)+1;s.daily.exchangeClaims.push(id);return null;
  }
  function valid(s){
    const int=n=>Number.isSafeInteger(n)&&n>=0,object=o=>o&&typeof o==='object'&&!Array.isArray(o);
    if(s.progressionSchema!==1||!int(s.prestige)||!int(s.copper)||!object(s.jewels)||Object.keys(s.jewels).length!==Object.keys(jewels).length||!Object.keys(jewels).every(id=>int(s.jewels[id])))return false;
    if(!object(s.activityMetrics)||Object.keys(s.activityMetrics).length!==metricIds.length||!metricIds.every(id=>int(s.activityMetrics[id])))return false;
    const e=s.epic;if(!object(e)||!int(e.kills)||e.kills>targets.kills||e.killRewards!==Math.floor(e.kills/500)||!int(e.troops)||!int(e.treasures)||typeof e.legacyAccess!=='boolean'||!object(e.resources)||Object.keys(e.resources).length!==5||!Object.keys(resourceDonations).every(id=>[0,100000].includes(e.resources[id])))return false;
    if(!object(s.daily)||!object(s.daily.brickPurchases)||Object.keys(s.daily.brickPurchases).length!==RewardData.goldBricks.length||!RewardData.goldBricks.every(b=>int(s.daily.brickPurchases[b.id])&&s.daily.brickPurchases[b.id]<=RewardData.dailyBrickLimit))return false;
    const d=s.daily;if(!object(d)||d.rulesVersion!==3||!Array.isArray(d.milestoneClaims)||new Set(d.milestoneClaims).size!==d.milestoneClaims.length||!d.milestoneClaims.every(n=>milestones.some(m=>m.count===n)&&n<=d.claimed)||!int(d.start)||period(d.start)!==d.start||!int(d.refillAt)||d.refillAt<d.start||d.refillAt>=d.start+DAY||!int(d.serial)||d.serial>1000||!int(d.claimed)||d.claimed>1000||!Array.isArray(d.exchangeClaims)||d.exchangeClaims.length>10+ManualData.shop.filter(i=>i.effect).length||!d.exchangeClaims.every(id=>id==='pearl'||ManualData.shop.some(i=>i.id===id&&i.effect))||d.exchangeClaims.some(id=>d.exchangeClaims.filter(v=>v===id).length>(id==='pearl'?10:1))||!Array.isArray(d.tasks)||d.tasks.length>BOARD_SIZE+ACCEPT_LIMIT||new Set(d.tasks.map(t=>t.uid)).size!==d.tasks.length)return false;
    if(d.tasks.filter(t=>t.status==='available').length>BOARD_SIZE||d.tasks.filter(t=>t.status==='accepted').length>ACCEPT_LIMIT)return false;
    return d.tasks.every(t=>object(t)&&typeof t.uid==='string'&&/^\d+_\d+$/.test(t.uid)&&t.uid.startsWith(d.start+'_')&&definition(t)&&int(t.target)&&t.target>0&&int(t.progress)&&t.progress<=t.target&&['available','accepted'].includes(t.status)&&int(t.acceptedAt)&&(t.status==='available'?t.acceptedAt===0:t.acceptedAt>=d.start&&t.acceptedAt<d.start+DAY)&&[1,2,3,4].includes(t.tier)&&t.target===definition(t).amount*(fixedMetrics.includes(definition(t).metric)?1:t.tier));
  }
  return {researchMetric,DAY,REFILL,BOARD_SIZE,ACCEPT_LIMIT,milestones,period,jewels,resourceDonations,troopDonations,targets,templates,init,ensureDaily,record,definition,taskReady,reward,taskItem,accept,abandon,claim,claimMilestone,claimReady,groups,countyUnlocked,donationQuote,donate,battle,exchangeOffers,exchange,valid,tier};
})();
