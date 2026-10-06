'use strict';
// Original-rule structure; costs, grace periods and event values are trial parameters.
const GovernanceSystem=(()=>{
 const HOUR=3600000,DAY=24*HOUR,object=x=>!!x&&typeof x==='object'&&!Array.isArray(x),int=n=>Number.isSafeInteger(n)&&n>=0,time=n=>Number.isFinite(n)&&n>=0&&n<=Number.MAX_SAFE_INTEGER,clone=x=>JSON.parse(JSON.stringify(x));
 const protectedHeroes=new Set(['lin','su']);
 const events=[{id:'drought',name:'旱情',bad:true,resource:'food'},{id:'fire',name:'库房失火',bad:true,resource:'wood'},{id:'harvest',name:'丰收',bad:false,resource:'food'},{id:'donation',name:'商旅献资',bad:false,resource:'gold'}];
 const record=(ledger,entry)=>{ledger.log.unshift(entry);ledger.log=ledger.log.slice(0,40);};
 function initCity(s,now=Date.now()){
  if(s.governance===undefined)s.governance={version:1,last:now,crisisSince:0,starvedSince:0,eventsEnabled:false,autoRelief:false,nextEvent:0,eventSeq:0,wardUntil:0,blessingUntil:0,log:[]};
 }
 function init(s,now=Date.now()){
  initCity(s,now);
  if(s.heroService===undefined)s.heroService={version:1,lastPay:now,owed:{},pending:[],captives:[],seq:0,log:[]};
 }
 function validCity(s){const c=s.governance;return object(c)&&c.version===1&&['last','crisisSince','starvedSince','nextEvent','wardUntil','blessingUntil'].every(k=>time(c[k]))&&int(c.eventSeq)&&typeof c.eventsEnabled==='boolean'&&typeof c.autoRelief==='boolean'&&Array.isArray(c.log)&&c.log.length<=40&&c.log.every(r=>object(r)&&time(r.at)&&typeof r.text==='string'&&r.text.length<=500);}
 function valid(s){
  const h=s.heroService;return validCity(s)&&object(h)&&h.version===1&&time(h.lastPay)&&int(h.seq)&&h.seq<=1000000&&object(h.owed)&&Object.entries(h.owed).every(([id,n])=>s.generals.includes(id)&&int(n))&&Array.isArray(h.pending)&&new Set(h.pending).size===h.pending.length&&h.pending.every(id=>s.generals.includes(id)&&s.heroLoyalty[id]===0)&&Array.isArray(h.captives)&&h.captives.length<=100&&new Set(h.captives.map(c=>c.id)).size===h.captives.length&&h.captives.every(c=>object(c)&&/^local_\d+$/.test(c.id)&&!s.generals.includes(c.id)&&object(c.hero)&&c.hero.id===c.id&&typeof c.hero.name==='string'&&c.hero.name.length<=20&&['atk','def','pol','wis','lead','level','price'].every(k=>Number.isFinite(c.hero[k])&&c.hero[k]>=0)&&int(c.level)&&c.level>=1&&c.level<=10000&&Number.isFinite(c.xp)&&c.xp>=0&&time(c.at)&&typeof c.previousOwner==='string'&&typeof c.originCity==='string')&&Array.isArray(h.log)&&h.log.length<=40&&h.log.every(r=>object(r)&&time(r.at)&&typeof r.text==='string'&&r.text.length<=500);
 }
 const moraleTarget=s=>Math.max(0,100-s.tax-s.unrest);
 const wage=(s,id)=>20*(s.generalLevels[id]||1);
 const scopes=s=>Object.values(s.realm?.cities||{});
 const scopeData=(s,c)=>c.id===s.realm.activeCity?s:c.data;
 const heroBase=(s,id)=>s.customGenerals.find(g=>g.id===id)||Game.generals.find(g=>g.id===id);
 function removeHero(s,id,{reason='忠诚耗尽，下野离城',at=Date.now(),busy=false}={}){
  if(!s.generals.includes(id)||protectedHeroes.has(id)||busy)return false;
  s.generals=s.generals.filter(x=>x!==id);
  for(const k of ['heroLoyalty','heroPoints','heroDrills','heroSkills'])if(s[k])delete s[k][id];
  delete s.heroService.owed[id];s.heroService.pending=s.heroService.pending.filter(x=>x!==id);
  for(const e of s.equipment||[])if(e.hero===id)e.hero='';
  for(const c of scopes(s)){const d=scopeData(s,c);if(d.heroAdministration?.prepared?.hero===id)d.heroAdministration.prepared=null;if(d.governor===id)d.governor=null;for(const role of Object.keys(d.cityRoles||{}))if(d.cityRoles[role]===id)d.cityRoles[role]='';for(const [key,buff]of Object.entries(d.buffs||{}))if(buff.general===id)delete d.buffs[key];}
  if(s.governor===id)s.governor=null;for(const role of Object.keys(s.cityRoles||{}))if(s.cityRoles[role]===id)s.cityRoles[role]='';
  delete s.realm.heroLocations[id];s.wildGenerals.recruited=s.wildGenerals.recruited.filter(x=>x!==id);const rumor=s.wildGenerals.rumors.find(r=>r.id===id);if(rumor)rumor.status='released';
  // Retain custom hero archives and levels for old reports. Current ownership is generals[].
  record(s.heroService,{at,id,text:(heroBase(s,id)?.name||id)+' · '+reason});return true;
 }
 function tickHeroes(s,now,api={}){
  init(s,now);const h=s.heroService,from=Math.max(h.lastPay,api.capStart??now-8*HOUR),steps=Math.max(0,Math.floor((now-from)/HOUR));
  if(steps){for(let step=0;step<steps;step++){const at=from+(step+1)*HOUR;for(const id of [...s.generals]){
   const location=s.realm.heroLocations[id],city=s.realm.cities[location]||s.realm.cities.capital,d=scopeData(s,city),due=wage(s,id)+(h.owed[id]||0);
   if(d.res.gold>=due){d.res.gold-=due;delete h.owed[id];record(h,{at,id,text:(heroBase(s,id)?.name||id)+'领取薪俸 '+due+' 黄金'});}
   else{h.owed[id]=due;s.heroLoyalty[id]=Math.max(protectedHeroes.has(id)?20:0,s.heroLoyalty[id]-5);record(h,{at,id,text:(heroBase(s,id)?.name||id)+'欠饷 '+due+' 黄金，忠诚降至 '+s.heroLoyalty[id]});}
  }}h.lastPay=from+steps*HOUR;}
  for(const c of [...h.captives])if(now-c.at>=DAY){h.captives=h.captives.filter(x=>x.id!==c.id);record(h,{at:now,id:c.id,text:c.hero.name+'未在24小时内招降，已逃离俘将营'});}
  for(const c of [...s.wildGenerals.captives])if(now-c.at>=DAY){s.wildGenerals.captives=s.wildGenerals.captives.filter(x=>x.id!==c.id);const r=s.wildGenerals.rumors.find(r=>r.id===c.id);if(r)r.status='released';record(h,{at:now,id:c.id,text:c.hero.name+'未在24小时内招降，已逃离俘将营'});}
  for(const id of [...s.generals])if(!protectedHeroes.has(id)&&s.heroLoyalty[id]===0){if(api.busy?.(id)){if(!h.pending.includes(id))h.pending.push(id);}else removeHero(s,id,{at:now});}
  h.pending=h.pending.filter(id=>s.generals.includes(id)&&s.heroLoyalty[id]===0);
 }
 function salaryQuote(s,id='all'){
  const ids=id==='all'?s.generals:[id].filter(x=>s.generals.includes(x)),rows=ids.map(id=>({id,name:heroBase(s,id)?.name||id,wage:wage(s,id),owed:s.heroService.owed[id]||0,loyalty:s.heroLoyalty[id],city:s.realm.heroLocations[id]}));
  const cost=rows.reduce((n,r)=>n+r.owed,0),reason=!rows.length?'将领不存在':!cost?'没有待补发薪俸':s.res.gold<cost?'本城黄金不足':'';return {rows,cost,reason,key:rows.map(r=>r.id+':'+r.owed).join('|')};
 }
 function payArrears(s,id,key,now){const q=salaryQuote(s,id);if(q.key!==key)return '欠饷已变化，请重新查看';if(q.reason)return q.reason;s.res.gold-=q.cost;for(const r of q.rows){delete s.heroService.owed[r.id];s.heroLoyalty[r.id]=Math.min(100,s.heroLoyalty[r.id]+10);}s.heroService.pending=s.heroService.pending.filter(id=>s.heroLoyalty[id]===0);record(s.heroService,{at:now,text:'补发 '+q.cost+' 黄金薪俸，相关将领忠诚 +10'});return null;}
 function captureDefeated(loser,winner,id,now,{busyIds=[]}={}){
  init(loser,now);init(winner,now);const base=heroBase(loser,id),loyalty=loser.heroLoyalty[id]??80;
  if(!base||!loser.generals.includes(id)||protectedHeroes.has(id)||busyIds.includes(id)||loyalty>=50)return {id,name:base?.name||id,status:'returned',loyalty};
  const used=winner.generals.length+winner.wildGenerals.captives.length+winner.heroService.captives.length,room=Game.heroCapacity?.(winner)??winner.buildings.tavern;
  const status=used<room&&winner.customGenerals.length+winner.heroService.captives.length<100&&winner.heroService.seq<1000000?'captured':'released';
  const level=loser.generalLevels[id],xp=loser.generalXp[id],line=base.wildLine||'',originCity=loser.realm.heroLocations[id]||'capital';
  if(!removeHero(loser,id,{reason:status==='captured'?'城破被俘':'城破，下野离城',at:now}))return {id,name:base.name,status:'returned',loyalty};
  let captiveId=null;if(status==='captured'){
   do{captiveId='local_'+(2000000000000000+(++winner.heroService.seq));}while(winner.customGenerals.some(g=>g.id===captiveId)||winner.innCandidates.some(g=>g.id===captiveId)||winner.heroService.captives.some(c=>c.id===captiveId));
   const hero={...clone(base),wis:base.wis??base.def,lead:base.lead??level*10,id:captiveId,level,price:level*6000,origin:'battle',sourceHero:id};
   winner.heroService.captives.push({id:captiveId,hero,level,xp,at:now,previousOwner:loser.ruler,originCity});record(winner.heroService,{at:now,id:captiveId,text:'城破俘获 '+base.name+'，24小时内可招降'});
  }
  return {id,captiveId,name:base.name,line,status,loyalty};
 }
 function captiveQuote(s,id,method='gold'){
  const c=s.heroService.captives.find(c=>c.id===id);if(!c||!['gold','jewels'].includes(method))return null;const noble=Math.min(21,Math.floor((c.level-1)/3)),cost=method==='gold'?{gold:c.level*6000,jewels:{}}:{gold:0,jewels:{pearl:Math.ceil(c.level/2)}};
  const reason=s.honors.noble<noble?'需要爵位 '+HeritageData.nobles[noble].name:s.generals.length+s.wildGenerals.captives.length+s.heroService.captives.length>(Game.heroCapacity?.(s)??s.buildings.tavern)?'招贤馆名额不足':s.customGenerals.length>=100?'将领档案已满':s.res.gold<cost.gold||Object.entries(cost.jewels).some(([k,n])=>(s.jewels[k]||0)<n)?'黄金或珍宝不足':'';
  return {id,name:c.hero.name,cost,noble,reason,key:[id,c.at,method,s.honors.noble].join('|'),expiresAt:c.at+DAY};
 }
 function recruitCaptive(s,id,method,key,now){const q=captiveQuote(s,id,method);if(!q||q.key!==key)return '俘将条件已变化';if(q.reason)return q.reason;const c=s.heroService.captives.find(c=>c.id===id);if(now-c.at>=DAY)return '俘将已逃离';s.res.gold-=q.cost.gold;for(const [k,n]of Object.entries(q.cost.jewels))s.jewels[k]-=n;s.customGenerals.push(clone(c.hero));s.generals.push(id);s.generalLevels[id]=c.level;s.generalXp[id]=c.xp;s.heroLoyalty[id]=40;s.realm.heroLocations[id]=s.realm.activeCity;s.heroService.captives=s.heroService.captives.filter(c=>c.id!==id);HeroSystem.init(s);record(s.heroService,{at:now,id,text:c.hero.name+'已归顺，忠诚40'});return null;}
 function nextEvent(s){return events[s.governance.eventSeq%events.length];}
 function setPolicy(s,kind,enabled,now){if(!['eventsEnabled','autoRelief'].includes(kind)||typeof enabled!=='boolean')return '请选择内政策略';s.governance[kind]=enabled;if(kind==='eventsEnabled')s.governance.nextEvent=enabled?now+4*HOUR:0;return null;}
 function sacrificeQuote(s,now){const population=Math.max(100,Math.ceil(s.population)),cost={food:population,gold:population},reason=s.civicCooldowns.comfort>now?'安抚冷却中':s.res.food<cost.food||s.res.gold<cost.gold?'祭天所需粮食或黄金不足':'';return {id:'sacrifice',name:'祭天',kind:'comfort',cost,reward:{},effects:{morale:0,unrest:0,population:0},cooldownEnd:s.civicCooldowns.comfort,reason,enabled:!reason};}
 function sacrifice(s,now){const q=sacrificeQuote(s,now);if(q.reason)return q.reason;for(const [k,n]of Object.entries(q.cost))s.res[k]-=n;s.governance.wardUntil=now+8*HOUR;s.governance.blessingUntil=now+8*HOUR;s.civicCooldowns.comfort=now+900000;record(s.governance,{at:now,text:'祭天完成：8小时内免除下一次天灾，下一次天赐收益翻倍'});return null;}
 function tickCity(s,now,api={}){
  const g=s.governance;if(!g||now<=g.last)return;g.last=now;
  if(g.autoRelief&&(s.morale<40||s.unrest>=40)&&s.civicCooldowns.comfort<=now){const cost=Math.max(100,Math.ceil(s.population));if(s.res.gold>=cost){s.res.gold-=cost;s.morale=Math.min(100,s.morale+25);s.unrest=Math.max(0,s.unrest-15);s.civicCooldowns.comfort=now+900000;record(g,{at:now,text:'自动祈福：消耗 '+cost+' 黄金，民心+25、民怨-15'});}}
  const unrestDanger=s.morale<20||s.unrest>=60;
  if(!unrestDanger)g.crisisSince=0;else if(!g.crisisSince)g.crisisSince=now;else if(now-g.crisisSince>=HOUR){const lost=Math.ceil(s.population*.05);s.population=Math.max(0,s.population-lost);for(const k of ['wood','stone','iron','gold'])s.res[k]*=.95;s.unrest=Math.min(100,s.unrest+5);g.crisisSince=now;record(g,{at:now,text:'内乱：流失人口 '+lost+'，木石铁金各损失5%；请降低税率或安抚'});}
  const starving=s.res.food<=0&&Object.values(s.army).some(n=>n>0);
  if(!starving)g.starvedSince=0;else if(!g.starvedSince)g.starvedSince=now;else if(now-g.starvedSince>=HOUR){let lost=0;for(const [id,n]of Object.entries(s.army)){const amount=n?Math.max(1,Math.floor(n*.01)):0;s.army[id]-=amount;lost+=amount;}g.starvedSince=now;record(g,{at:now,text:'断粮超过1小时：本城驻军逃散 '+lost+' 人；在途部队按出发快照保留，请补粮'});}
  if(g.eventsEnabled&&g.nextEvent&&g.nextEvent<=now){let count=0;while(g.nextEvent<=now&&count++<2){const at=g.nextEvent,e=nextEvent(s);if(e.bad&&g.wardUntil>=at){g.wardUntil=0;record(g,{at,text:'祭天庇护免除了 '+e.name});}else if(e.bad){const amount=Math.floor(s.res[e.resource]*.05);s.res[e.resource]-=amount;s.unrest=Math.min(100,s.unrest+10);record(g,{at,text:e.name+'：'+Game.resources[e.resource].name+'损失 '+amount+'，民怨+10'});}else{const amount=Math.max(500,Math.floor(s.population*5))*(g.blessingUntil>=at?2:1);s.res[e.resource]+=amount;if(g.blessingUntil>=at)g.blessingUntil=0;record(g,{at,text:'天赐 '+e.name+'：'+Game.resources[e.resource].name+' +'+amount+'，允许爆仓'});}g.eventSeq++;g.nextEvent+=4*HOUR;}}
 }
 function status(s,now){const g=s.governance,q=salaryQuote(s);return {moraleTarget:moraleTarget(s),warnings:[...(g.crisisSince?['民心/民怨危险：'+Math.max(0,Math.ceil((g.crisisSince+HOUR-now)/60000))+'分钟后可能内乱']:[]),...(g.starvedSince?['断粮：'+Math.max(0,Math.ceil((g.starvedSince+HOUR-now)/60000))+'分钟后本城驻军逃散']:[])],nextEvent:g.eventsEnabled?{...nextEvent(s),at:g.nextEvent}:null,wages:q.rows.reduce((n,r)=>n+r.wage,0),owed:q.cost};}
 return {HOUR,DAY,events,init,initCity,valid,validCity,moraleTarget,wage,tickHeroes,tickCity,status,salaryQuote,payArrears,removeHero,captureDefeated,captiveQuote,recruitCaptive,setPolicy,sacrificeQuote,sacrifice};
})();
