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
  function tier(s){return s.prestige>=32000?4:s.prestige>=8000?3:s.prestige>=1000?2:1;}
  function makeTask(s,index){const d=s.daily,level=tier(s),seed=Math.floor(d.start/DAY),template=templates[((seed%templates.length)+templates.length+index*7)%templates.length];return {uid:d.start+'_'+index,template:template.id,target:template.amount*(['build','research','civic','item','victory'].includes(template.metric)?1:level),progress:0,status:'available',acceptedAt:0,tier:level};}
  function freshDaily(s,now){s.daily={start:period(now),refillAt:period(now),serial:10,tasks:[],claimed:0,exchangeClaims:[]};for(let i=0;i<10;i++)s.daily.tasks.push(makeTask(s,i));}
  function init(s,now=Date.now()){
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
    const count=Math.min(steps,10-d.tasks.filter(t=>t.status==='available').length);
    for(let i=0;i<count;i++)d.tasks.push(makeTask(s,d.serial++));
  }
  const definition=t=>templates.find(x=>x.id===t.template);
  const taskReady=(s,t)=>t.status==='accepted'&&(definition(t).resource?s.res[definition(t).resource]>=t.target:t.progress>=t.target);
  function record(s,metric,amount=1,at=Date.now()){
    ensureDaily(s,at);if(at<s.daily.start)return;
    for(const t of s.daily.tasks)if(t.status==='accepted'&&at>=t.acceptedAt&&definition(t).metric===metric)t.progress=Math.min(t.target,t.progress+amount);
  }
  function reward(t){return {prestige:200*t.tier,copper:20*t.tier,gold:1500*t.tier};}
  function accept(s,uid,now=Date.now()){
    ensureDaily(s,now);const t=s.daily.tasks.find(t=>t.uid===uid);
    if(!t||t.status!=='available')return '该任务已刷新或已接取';
    if(s.daily.tasks.filter(t=>t.status==='accepted').length>=5)return '最多同时接取 5 项任务';
    t.status='accepted';t.acceptedAt=now;return null;
  }
  function abandon(s,uid,now=Date.now()){
    ensureDaily(s,now);const t=s.daily.tasks.find(t=>t.uid===uid);
    if(!t||t.status!=='accepted')return '任务已刷新或未接取';
    s.daily.tasks=s.daily.tasks.filter(t=>t!==t);return null;
  }
  function claim(s,uid,now=Date.now()){
    ensureDaily(s,now);const t=s.daily.tasks.find(t=>t.uid===uid);
    if(!t||!taskReady(s,t))return '任务尚未完成或已经刷新';
    const def=definition(t),r=reward(t);if(def.resource)s.res[def.resource]-=t.target;
    s.prestige+=r.prestige;s.copper+=r.copper;s.res.gold+=r.gold;
    const items=ManualData.shop.filter(i=>i.effect),item=items[(s.daily.claimed+Math.floor(s.daily.start/DAY))%items.length];s.inventory[item.id]=(s.inventory[item.id]||0)+1;
    s.daily.claimed++;s.daily.tasks=s.daily.tasks.filter(t=>t!==t);return null;
  }
  const groups=s=>[
    {id:'kills',name:'讨伐黄巾',progress:Math.min(1,s.epic.kills/targets.kills),detail:'掠夺野地／黄巾据点，胜利缴获黄巾头巾 '+s.epic.kills+' / '+targets.kills+' 件头巾'},
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
    const jewelDrops={};if(won){record(s,'victory');if(b.mode==='raid'){for(const [id,count] of Object.entries(received))record(s,'raid_'+id,count);if(!n.terrain||n.terrain!=='fort'){s.epic.kills=Math.min(targets.kills,s.epic.kills+kills);const batches=Math.floor(s.epic.kills/500);s.prestige+=(batches-s.epic.killRewards)*500;s.epic.killRewards=batches;}}
      // Prototype drops: a low-tier pearl every win, plus a rarer jewel at higher levels.
      jewelDrops.pearl=1;if(Math.random()<Math.min(.5,n.level*.05)){const choices=Object.keys(jewels).slice(1,Math.min(9,n.level+2));jewelDrops[choices[Math.floor(Math.random()*choices.length)]]=1;}
      for(const [id,count] of Object.entries(jewelDrops))s.jewels[id]+=count;
    }
    return {prestigeDelta:s.prestige-before,jewelDrops};
  }
  function exchangeOffers(s){const available=ManualData.shop.filter(i=>i.effect),seed=Math.floor(s.daily.start/DAY);return [{id:'pearl',name:'珍珠 ×1',cost:40},...Array.from({length:3},(_,i)=>{const item=available[(seed+i*5)%available.length];return {id:item.id,name:item.name+' ×1',cost:Math.max(20,Math.ceil(item.price/5))};})];}
  function exchange(s,id,now=Date.now()){
    ensureDaily(s,now);const offer=exchangeOffers(s).find(x=>x.id===id);if(!offer)return '商品已刷新';
    if(s.buildings.inn<1)return '需要 1 级客栈';if(s.daily.exchangeClaims.filter(x=>x===id).length>=(id==='pearl'?10:1))return '今日兑换次数已用完';if(s.copper<offer.cost)return '铜钱不足';
    s.copper-=offer.cost;if(id==='pearl')s.jewels.pearl++;else s.inventory[id]=(s.inventory[id]||0)+1;s.daily.exchangeClaims.push(id);return null;
  }
  function valid(s){
    const int=n=>Number.isSafeInteger(n)&&n>=0,object=o=>o&&typeof o==='object'&&!Array.isArray(o);
    if(s.progressionSchema!==1||!int(s.prestige)||!int(s.copper)||!object(s.jewels)||Object.keys(s.jewels).length!==Object.keys(jewels).length||!Object.keys(jewels).every(id=>int(s.jewels[id])))return false;
    const e=s.epic;if(!object(e)||!int(e.kills)||e.kills>targets.kills||e.killRewards!==Math.floor(e.kills/500)||!int(e.troops)||!int(e.treasures)||typeof e.legacyAccess!=='boolean'||!object(e.resources)||Object.keys(e.resources).length!==5||!Object.keys(resourceDonations).every(id=>[0,100000].includes(e.resources[id])))return false;
    const d=s.daily;if(!object(d)||!int(d.start)||period(d.start)!==d.start||!int(d.refillAt)||d.refillAt<d.start||d.refillAt>=d.start+DAY||!int(d.serial)||d.serial>1000||!int(d.claimed)||d.claimed>1000||!Array.isArray(d.exchangeClaims)||d.exchangeClaims.length>13||!d.exchangeClaims.every(id=>exchangeOffers(s).some(o=>o.id===id))||!Array.isArray(d.tasks)||d.tasks.length>15||new Set(d.tasks.map(t=>t.uid)).size!==d.tasks.length)return false;
    if(d.tasks.filter(t=>t.status==='available').length>10||d.tasks.filter(t=>t.status==='accepted').length>5)return false;
    return d.tasks.every(t=>object(t)&&typeof t.uid==='string'&&/^\d+_\d+$/.test(t.uid)&&t.uid.startsWith(d.start+'_')&&definition(t)&&int(t.target)&&t.target>0&&int(t.progress)&&t.progress<=t.target&&['available','accepted'].includes(t.status)&&int(t.acceptedAt)&&(t.status==='available'?t.acceptedAt===0:t.acceptedAt>=d.start&&t.acceptedAt<d.start+DAY)&&[1,2,3,4].includes(t.tier)&&t.target===definition(t).amount*(['build','research','civic','item','victory'].includes(definition(t).metric)?1:t.tier));
  }
  return {DAY,REFILL,period,jewels,resourceDonations,troopDonations,targets,templates,init,ensureDaily,record,definition,taskReady,reward,accept,abandon,claim,groups,countyUnlocked,donationQuote,donate,battle,exchangeOffers,exchange,valid,tier};
})();
