'use strict';
const HeritageSystem=(()=>{
 const roles={governor:'城守',commander:'主将',counsellor:'军师'},HOUR=3600000;
 const zeroRoles=()=>({commander:'',counsellor:''});
 function init(s){if(!s||!Array.isArray(s.generals))return;if(s.cityRoles===undefined)s.cityRoles=zeroRoles();if(s.honors===undefined)s.honors={office:0,noble:0,salaryClaims:{office:0,noble:0}};if(s.gatherings===undefined)s.gatherings={};if(s.heritageHistory===undefined)s.heritageHistory=[];}
 const office=s=>HeritageData.offices[s.honors.office];
 const noble=s=>HeritageData.nobles[s.honors.noble];
 const roleHero=(s,role)=>role==='governor'?s.governor:s.cityRoles[role];
 const roleOf=(s,id)=>Object.keys(roles).find(role=>roleHero(s,role)===id)||'';
 function effectiveHero(s,kind){const order=kind==='research'?['counsellor','commander','governor']:kind==='train'?['commander','governor','counsellor']:['governor'];return order.map(role=>roleHero(s,role)).find(Boolean)||'';}
 const live=()=>{Game.tick();init(Game.state);return Game.state;};
 const save=()=>{Game.save();return null;};
 function assign(governor,commander,counsellor){const s=live(),all=[governor,commander,counsellor],chosen=all.filter(Boolean);if(!governor)return '请选择一位城守';if(chosen.some(id=>!s.generals.includes(id)||Game.generalBusy(id)))return '任职将领必须已经招募且留在城内';if(new Set(chosen).size!==chosen.length)return '一位将领只能担任一个职位';s.governor=governor;s.cityRoles={commander,counsellor};return save();}
 // Only current owned county cities count. Raid wins and former ownership do not.
 function ownedCounties(s){return Object.values(s?.realm?.cities||{}).filter(c=>NamedCityData.definition(c)?.tier==='county'&&NamedCitySystem.owned(s,c.node));}
 // Missing jewels of the named kind may be covered by any spare jewels at twice their prestige value, cheapest first.
 const JEWEL_SUBSTITUTE_RATE=2;
 function jewelPayment(s,required){
  const pay={},short={};let deficit=0;
  for(const [id,n] of Object.entries(required||{})){const own=Math.max(0,Math.min(s.jewels[id]||0,n));if(own)pay[id]=own;if(n>own){short[id]=n-own;deficit+=(n-own)*Progression.jewels[id].prestige*JEWEL_SUBSTITUTE_RATE;}}
  const substitute={};
  for(const [id,j] of Object.entries(Progression.jewels).sort((a,b)=>a[1].prestige-b[1].prestige)){if(deficit<=0)break;const spare=(s.jewels[id]||0)-(required?.[id]||0);if(spare<1)continue;const use=Math.min(spare,Math.ceil(deficit/j.prestige));substitute[id]=use;deficit-=use*j.prestige;}
  const total={...pay};for(const [id,n] of Object.entries(substitute))total[id]=(total[id]||0)+n;
  return {pay,short,substitute,total,covered:deficit<=0,rate:JEWEL_SUBSTITUTE_RATE};
 }
 function promotionQuote(s,kind){const list=kind==='office'?HeritageData.offices:kind==='noble'?HeritageData.nobles:null;if(!list)return null;const current=s.honors[kind],next=list[current+1];if(!next)return {next:null,reason:'已达最高级别'};const r=next.promotion,missing=[];
  if(s.prestige<r.prestige)missing.push('声望 '+r.prestige);
  if(s.honors.office<r.office)missing.push('官职 '+HeritageData.offices[r.office].name);
  if(r.noble&&s.honors.noble<r.noble)missing.push('爵位 '+HeritageData.nobles[r.noble].name);
  if(s.buildings.hall<r.hall)missing.push('官府 '+r.hall+' 级');
  if(s.res.gold<r.gold)missing.push('黄金 '+r.gold);
  const jewels=jewelPayment(s,r.jewels);if(!jewels.covered)for(const [id,n] of Object.entries(jewels.short))missing.push(Progression.jewels[id].name+' ×'+n+'（其他珠宝按 '+jewels.rate+' 倍价值折算也不足）');
  if(r.county&&!ownedCounties(s).length)missing.push('持有至少一座县城（须占领，掠夺不算）');
  return {next,rule:r,jewels,missing,reason:missing.length?'条件未满足：'+missing.join('、'):''};
 }
 function promote(kind){const s=live(),q=promotionQuote(s,kind);if(!q?.next)return q?.reason||'请选择晋升类型';if(q.reason)return q.reason;s.res.gold-=q.rule.gold;for(const [id,n] of Object.entries(q.jewels.total))s.jewels[id]-=n;s.honors[kind]=q.next.id;return save();}
 function salaryQuote(s,kind){const row=kind==='office'?office(s):kind==='noble'?noble(s):null;if(!row)return null;return {row,claimed:s.honors.salaryClaims[kind]===Progression.period(Date.now()),reward:kind==='office'?{gold:row.salary}:{food:row.salary,wood:row.salary,stone:row.salary,iron:row.salary}};}
 function record(s,r){s.heritageHistory.unshift({at:Date.now(),...r});s.heritageHistory=s.heritageHistory.slice(0,10);}
 function salary(kind){const s=live(),q=salaryQuote(s,kind);if(!q||q.row.salary<1)return '晋升后才能领取俸禄';if(q.claimed)return '今日已领取，北京时间 05:00 重置';for(const [id,n] of Object.entries(q.reward))s.res[id]+=n;s.honors.salaryClaims[kind]=Progression.period(Date.now());record(s,{kind:'salary',name:kind==='office'?'食君之禄':'采食封邑',loot:q.reward,jewels:{},xp:0});return save();}
 function gatherReason(s,id){const n=Game.getNode(id),g=s.garrisons[id];if(!n?.wild||!s.conquered[id])return '需要先占领野地';if(!HeritageData.fields[n.type])return '平地不能采集';if(n.level<1)return '0 级野地不能开始采集';if(!g||g.phase!=='stationed'||!g.general||!Game.totalArmy(g.army))return '需要有将领率领的驻守部队';if(s.gatherings[id])return '正在采集';return '';}
 function startGather(id){const s=live(),reason=gatherReason(s,id);if(reason)return reason;const n=Game.getNode(id),g=s.garrisons[id];s.gatherings[id]={start:Date.now(),level:n.level,type:n.type,general:g.general,fooduse:Game.upkeep(g.army)};return save();}
 function gatherQuote(s,id){const a=s.gatherings[id],g=s.garrisons[id];if(!a||!g||g.phase!=='stationed')return null;const elapsed=Math.max(0,Date.now()-a.start),hours=Math.min(24,elapsed/HOUR),profile=HeritageData.fields[a.type],effectiveLevel=Math.log((a.level+.6)*1.25)/Math.log(1.2),amount=Math.floor(effectiveLevel*a.fooduse*profile.rate*hours),resource=Game.terrainTypes[a.type].resource,carry=Game.carry(g.army),room=Math.max(0,Math.floor(Game.capacity(resource)-s.res[resource])),received=Math.min(amount,carry,Math.max(0,Math.floor(Number.MAX_SAFE_INTEGER-s.res[resource]))),overCapacity=Math.max(0,received-room),rolls=Math.floor(hours),chance=Math.min(.6,.05+.01*(effectiveLevel+Math.floor((s.generalLevels[a.general]||1)/10)+Math.floor(a.fooduse/10000)));
  return {elapsed,hours,amount,resource,carry,room,received,overCapacity,discarded:amount-received,rolls,chance,xp:Math.floor(received*.01),ready:elapsed>=HOUR,cap:elapsed>=24*HOUR};
 }
 function weightedJewel(weights){const total=weights.reduce((a,b)=>a+b,0);let roll=Math.random()*total;for(let i=0;i<weights.length;i++){roll-=weights[i];if(roll<0)return Object.keys(Progression.jewels)[i];}return 'nightPearl';}
 function collectGather(id){const s=live(),q=gatherQuote(s,id),a=s.gatherings[id];if(!q)return '没有可以结束的采集';if(!q.ready)return '至少采集 1 小时才能收获，可选择取消';{const lv=s.landClaims?.[id]?.level||Game.getNode(id)?.level||0;if(typeof LegendQuest!=='undefined')LegendQuest.onGather(s,lv);if(typeof LegendaryWeapons!=='undefined')LegendaryWeapons.onGather(s,lv);}const jewels={};for(let i=0;i<q.rolls;i++)if(Math.random()<q.chance){const key=weightedJewel(HeritageData.fields[a.type].weights);jewels[key]=(jewels[key]||0)+1;}
  const loot={[q.resource]:q.received};s.res[q.resource]+=q.received;for(const [key,n] of Object.entries(jewels))s.jewels[key]+=n;HeroSystem.addXp(s,a.general,q.xp);delete s.gatherings[id];record(s,{kind:'gather',node:id,name:Game.getNode(id).name,loot,jewels,xp:q.xp,discarded:q.discarded,overCapacity:q.overCapacity});return save();
 }
 function cancelGather(id){const s=live();if(!s.gatherings[id])return '这里没有进行采集';delete s.gatherings[id];return save();}
 function valid(s){const obj=x=>x&&typeof x==='object'&&!Array.isArray(x),int=n=>Number.isSafeInteger(n)&&n>=0;
  if(!obj(s.cityRoles)||Object.keys(s.cityRoles).length!==2||!['commander','counsellor'].every(k=>s.cityRoles[k]===''||s.generals.includes(s.cityRoles[k])))return false;
  const staff=[s.governor,...Object.values(s.cityRoles)].filter(Boolean),deployed=[...(s.expedition?[s.expedition]:[]),...s.expeditions,...Object.values(s.garrisons)];if(new Set(staff).size!==staff.length||deployed.some(e=>staff.includes(e.general)))return false;
  const h=s.honors;if(!obj(h)||!Number.isInteger(h.office)||h.office<0||h.office>=HeritageData.offices.length||!Number.isInteger(h.noble)||h.noble<0||h.noble>=HeritageData.nobles.length||!obj(h.salaryClaims)||!['office','noble'].every(k=>int(h.salaryClaims[k])&&(h.salaryClaims[k]===0||Progression.period(h.salaryClaims[k])===h.salaryClaims[k])))return false;
  if(!obj(s.gatherings)||Object.keys(s.gatherings).length>10||!Object.entries(s.gatherings).every(([id,a])=>obj(a)&&Game.getNode(id,s)?.wild&&s.conquered[id]&&s.garrisons[id]?.phase==='stationed'&&s.garrisons[id].general===a.general&&int(a.start)&&Number.isInteger(a.level)&&a.level>=1&&a.level<=10&&Object.hasOwn(HeritageData.fields,a.type)&&a.type===Game.getNode(id,s).type&&Number.isFinite(a.fooduse)&&a.fooduse>=0&&a.fooduse<=Number.MAX_SAFE_INTEGER))return false;
  if(!Array.isArray(s.heritageHistory)||s.heritageHistory.length>10)return false;
  return s.heritageHistory.every(r=>obj(r)&&int(r.at)&&['salary','gather'].includes(r.kind)&&typeof r.name==='string'&&r.name.length<=100&&obj(r.loot)&&Object.entries(r.loot).every(([k,n])=>['food','wood','stone','iron','gold'].includes(k)&&int(n))&&obj(r.jewels)&&Object.entries(r.jewels).every(([k,n])=>Object.hasOwn(Progression.jewels,k)&&int(n)&&n<=24)&&int(r.xp)&&(r.kind==='salary'||Game.getNode(r.node,s)?.wild&&int(r.discarded)&&(r.overCapacity===undefined||int(r.overCapacity)&&r.overCapacity<=Object.values(r.loot).reduce((sum,n)=>sum+n,0))));
 }
 return {roles,HOUR,init,office,noble,roleHero,roleOf,effectiveHero,assign,ownedCounties,jewelPayment,promotionQuote,promote,salaryQuote,salary,gatherReason,startGather,gatherQuote,collectGather,cancelGather,valid};
})();
