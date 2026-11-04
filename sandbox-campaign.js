'use strict';
// Finite, optional campaign decisions. Reads never create records or disclose armies.
const SandboxCampaign=(()=>{
  const definitions=Object.freeze([
    Object.freeze({id:'supply',title:'护粮 · 河畔粮道',node:'field',mode:'raid',cadence:'daily',description:'击退河畔守军，护送乡里军粮。首胜后开放，每日一次，北京时间 05:00 重置。首次粮食 1,200，后续每日 600。',reward:Object.freeze({food:1200})}),
    Object.freeze({id:'bandits',title:'讨贼 · 青竹林',node:'wood',mode:'raid',cadence:'daily',description:'清剿林间路匪，取得补兵物资。第一章通关后开放，每日一次，北京时间 05:00 重置。首次铁料 400、黄金 800，后续每日减半。',reward:Object.freeze({iron:400,gold:800})}),
    Object.freeze({id:'crossing',title:'夺渡 · 寒川渡口',node:'north_ford',mode:'raid',cadence:'once',description:'击败渡口守军，夺取一次补给；领取后开放渡口捷径，永久仅一次。掠夺不替代章节占领任务。',reward:Object.freeze({food:1500})})
  ]);
  const object=o=>!!o&&typeof o==='object'&&!Array.isArray(o),integer=n=>Number.isSafeInteger(n)&&n>=0;
  const point=p=>object(p)&&Object.keys(p).length===2&&Number.isFinite(p.x)&&Number.isFinite(p.y)&&p.x>=0&&p.y>=0&&p.x<64&&p.y<64;
  const exact=(o,keys)=>object(o)&&Object.keys(o).length===keys.length&&keys.every(k=>Object.hasOwn(o,k));
  const def=id=>definitions.find(d=>d.id===id)||null;
  const period=now=>typeof Progression!=='undefined'?Progression.period(now):Math.floor((now+10800000)/86400000)*86400000-10800000;
  const validPeriod=n=>integer(n)&&period(n)===n;
  const recordCore=(s,id,r)=>!!def(id)&&['ready','claimed'].includes(r.status)&&integer(r.at)&&integer(r.startedAt)&&r.at>=r.startedAt&&!!s.realm?.cities?.[r.city]&&typeof r.general==='string'&&/^[a-zA-Z0-9_]{1,100}$/.test(r.general);
  function init(s){
    if(s.sandboxCampaign===undefined)s.sandboxCampaign={schema:2,tasks:{}};
    const c=s.sandboxCampaign;
    // Schema 1 was the original finite errand prototype. Only a completely valid legacy record migrates.
    if(exact(c,['schema','tasks'])&&c.schema===1&&object(c.tasks)&&Object.entries(c.tasks).every(([id,r])=>exact(r,['status','at','city','startedAt','general'])&&recordCore(s,id,r))){
      c.schema=2;for(const r of Object.values(c.tasks))Object.assign(r,{period:period(r.startedAt),claims:r.status==='claimed'?1:0,lastClaimPeriod:r.status==='claimed'?period(r.at):0});
      for(const d of [s,...Object.values(s.realm?.cities||{}).map(city=>city.data)])for(const e of [d.expedition,...(d.expeditions||[])].filter(Boolean)){const t=e.sandboxTask;if(exact(t,['id','startedAt'])&&def(t.id)&&integer(t.startedAt))Object.assign(t,{period:period(t.startedAt),rewardTier:'first'});}
    }
  }
  function valid(s){
    const c=s.sandboxCampaign;if(!exact(c,['schema','tasks'])||c.schema!==2||!object(c.tasks)||Object.keys(c.tasks).length>definitions.length)return false;
    if(!Object.entries(c.tasks).every(([id,r])=>exact(r,['status','at','city','startedAt','general','period','claims','lastClaimPeriod'])&&recordCore(s,id,r)&&validPeriod(r.period)&&r.period===period(r.startedAt)&&integer(r.claims)&&r.claims<=1000000&&(r.claims===0?r.lastClaimPeriod===0:validPeriod(r.lastClaimPeriod))&&(r.status==='claimed'?r.claims>0&&r.lastClaimPeriod>=period(r.at):r.lastClaimPeriod<r.period)&&(def(id).cadence!=='once'||r.claims<=(r.status==='ready'?0:1))))return false;
    const scopes=[s,...Object.values(s.realm?.cities||{}).filter(city=>city?.id!==s.realm?.activeCity).map(city=>city?.data)],active=scopes.flatMap(d=>[d?.expedition,...(Array.isArray(d?.expeditions)?d.expeditions:[])]).filter(e=>e?.sandboxTask&&e.phase!=='return'),ids=new Set();
    return active.every(e=>{const t=e.sandboxTask,d=def(t.id),r=c.tasks[t.id];if(!d||ids.has(t.id)||r?.status==='ready'||r?.status==='claimed'&&(d.cadence==='once'||r.lastClaimPeriod>=t.period)||t.rewardTier!==((r?.claims||0)>0?'daily':'first'))return false;ids.add(t.id);return true;});
  }
  function validJob(e){
    const r=e.route;
    if(r!==undefined){
      if(!exact(r,['id','name','kind','points','seconds','returnSeconds','foodCost','controlNode'])||!['direct','detour','controlled'].includes(r.id)||!['road','pass','ferry','detour'].includes(r.kind)||typeof r.name!=='string'||!r.name.length||r.name.length>40||!Array.isArray(r.points)||r.points.length<2||r.points.length>4||!r.points.every(point)||![r.seconds,r.returnSeconds].every(n=>Number.isFinite(n)&&n>=1&&n<=Number.MAX_SAFE_INTEGER)||!integer(r.foodCost)||!([null,'pass','north_ford','north_pass','luo_gate'].includes(r.controlNode)))return false;
      if(e.origin&&(r.points[0].x!==e.origin.x||r.points[0].y!==e.origin.y)||e.returnSeconds!==r.returnSeconds)return false;
      if(r.id==='controlled'?!r.controlNode:r.controlNode!==null)return false;
    }
    const t=e.sandboxTask;
    return t===undefined||!!r&&exact(t,['id','startedAt','period','rewardTier'])&&!!def(t.id)&&def(t.id).node===e.node&&e.mode===def(t.id).mode&&integer(t.startedAt)&&t.startedAt<=e.start&&validPeriod(t.period)&&t.period===period(t.startedAt)&&['first','daily'].includes(t.rewardTier)&&(t.rewardTier!=='daily'||def(t.id).cadence==='daily');
  }
  function controlFor(n){
    if(n.id==='mine'||n.id==='camp')return 'pass';
    if(n.chapter===2&&['north_camp','north_pass','north_keep'].includes(n.id))return 'north_ford';
    if(n.chapter===3)return 'north_pass';
    if(n.namedCity)return 'luo_gate';
    return null;
  }
  const routeKind=n=>n.terrain==='lake'?'ferry':n.terrain==='mountain'?'pass':'road';
  function direct(n,origin,quote,foodCost){return {id:'direct',name:routeKind(n)==='ferry'?'渡口正道':routeKind(n)==='pass'?'关道直进':'官道直进',kind:routeKind(n),description:'按现有官道进军，沿用普通行军报价。',available:true,reason:'',seconds:quote.seconds,returnSeconds:quote.returnSeconds,foodCost,path:[{...origin},{x:n.x,y:n.y}],controlNode:null};}
  function routes(s,n,origin,quote,foodCost,api){
    if(!n||!point(origin)||!point({x:n.x,y:n.y})||!api.visible(n.id))return [];
    const base=direct(n,origin,quote,foodCost),rows=[base];
    // Only the finite landmark/chapter/city chain has route decisions. Wild raids retain their ordinary cost.
    if(!n.wild&&!n.orderRoute&&!n.factionCamp){
      const dx=n.x-origin.x,dy=n.y-origin.y,length=Math.hypot(dx,dy)||1,offset=Math.min(3,length*.3),bend={x:Math.max(0,Math.min(63,(origin.x+n.x)/2-dy/length*offset)),y:Math.max(0,Math.min(63,(origin.y+n.y)/2+dx/length*offset))};
      rows.push({...base,id:'detour',name:'沿乡道绕行',kind:'detour',description:'绕开正面关道：行军慢 30%，行军粮耗少 15%；守军与章节条件不变。',seconds:Math.max(1,base.seconds*1.3),returnSeconds:Math.max(1,base.returnSeconds*1.3),foodCost:Math.ceil(base.foodCost*.85),path:[{...origin},bend,{x:n.x,y:n.y}]});
      const controlNode=controlFor(n),site=controlNode&&api.visible(controlNode)&&api.node(controlNode);
      if(site&&point({x:site.x,y:site.y})){const available=!!s.conquered[controlNode]||(controlNode==='north_ford'&&s.sandboxCampaign?.tasks.crossing?.status==='claimed'),name=controlNode==='north_ford'?'寒川渡口捷径':'控制关隘捷径';rows.push({...base,id:'controlled',name,kind:controlNode==='north_ford'?'ferry':'pass',controlNode,available,reason:available?'':'先控制'+site.name+(controlNode==='north_ford'?'，或完成并领取「夺渡」军务':''),description:'使用已控制的门户：行军快 18%，行军粮耗多 5%；守军与章节条件不变。',seconds:Math.max(1,base.seconds*.82),returnSeconds:Math.max(1,base.returnSeconds*.82),foodCost:Math.ceil(base.foodCost*1.05),path:[{...origin},{x:site.x,y:site.y},{x:n.x,y:n.y}]});}
    }
    return rows;
  }
  function snapshot(q){return {id:q.id,name:q.name,kind:q.kind,points:q.path.map(p=>({...p})),seconds:q.seconds,returnSeconds:q.returnSeconds,foodCost:q.foodCost,controlNode:q.controlNode};}
  function unlocked(s,d){return !!s.sandboxCampaign?.tasks[d.id]||(d.id==='supply'?(s.stats?.victories||0)>0:d.id==='bandits'?typeof ChapterData!=='undefined'&&ChapterData.chapterOneDone(s):true);}
  const rewardFor=(d,claims=0)=>Object.fromEntries(Object.entries(d.reward).map(([key,n])=>[key,claims&&d.cadence==='daily'?n/2:n]));
  function tasks(s,now,api){
    return definitions.filter(d=>unlocked(s,d)&&api.visible(d.node)).map(d=>{
      const record=s.sandboxCampaign?.tasks[d.id],job=api.jobs().find(e=>e.sandboxTask?.id===d.id&&e.phase!=='return'),claimed=record?.status==='claimed'&&(d.cadence==='once'||record.lastClaimPeriod>=period(now)),status=job?'march':record?.status==='ready'?'ready':claimed?'claimed':'available',nextAt=d.cadence==='daily'?(record?.lastClaimPeriod>=period(now)?record.lastClaimPeriod:period(now))+86400000:null,reason=status==='claimed'?(d.cadence==='once'?'已领取永久一次奖励':'今日已领取，北京时间 05:00 后可再次执行'):status==='ready'?'':job?'军务部队正在行军或作战':api.blocked(d.node,d.mode)||((s.cooldowns[d.node]||0)>now?'据点仍在恢复':'');
      const previousClaims=status==='claimed'?Math.max(0,(record?.claims||0)-1):record?.claims||0;
      return {...d,reward:rewardFor(d,previousClaims),firstReward:previousClaims===0,status,reason,nextAt};
    });
  }
  function taskCheck(s,id,node,mode,api,now){const d=def(id);if(!d||d.node!==node||d.mode!==mode)return '军务与出征目标或模式不符';if(!unlocked(s,d))return d.id==='supply'?'先取得首次出征胜利，开放护粮军务':'先完成第一章，开放讨贼军务';if(!api.visible(node))return '军务目标尚未发现';const r=s.sandboxCampaign.tasks[id];if(r?.status==='ready')return '先领取上一次军务奖励';if(r?.status==='claimed'&&(d.cadence==='once'||r.lastClaimPeriod>=period(now)))return d.cadence==='once'?'此军务奖励永久仅一次':'今日军务已领取，北京时间 05:00 重置';if(api.jobs().some(e=>e.sandboxTask?.id===id&&e.phase!=='return'))return '此军务已有部队执行';return '';}
  function taskSnapshot(s,id,now){return {id,startedAt:now,period:period(now),rewardTier:(s.sandboxCampaign.tasks[id]?.claims||0)>0?'daily':'first'};}
  function settle(s,e,won,now){
    const t=e.sandboxTask,d=t&&def(t.id),previous=t&&s.sandboxCampaign.tasks[t.id];
    if(!won||!d||d.node!==e.node||d.mode!==e.mode||previous?.status==='ready'||previous?.startedAt===t.startedAt||previous?.status==='claimed'&&(d.cadence==='once'||previous.lastClaimPeriod>=period(now))||t.rewardTier!==((previous?.claims||0)>0?'daily':'first'))return null;
    s.sandboxCampaign.tasks[t.id]={status:'ready',at:now,city:e.sourceCity||s.realm.activeCity,startedAt:t.startedAt,general:e.general,period:t.period,claims:previous?.claims||0,lastClaimPeriod:previous?.lastClaimPeriod||0};return {id:d.id,title:d.title};
  }
  function claim(s,id,now){const d=def(id),r=s.sandboxCampaign.tasks[id];if(!d||r?.status!=='ready')return '军务尚未完成或奖励已领取';if(r.claims>0&&(d.cadence==='once'||r.lastClaimPeriod>=period(now)))return '今日军务奖励已领取';if(r.claims>=1000000)return '军务记录已达上限';const reward=rewardFor(d,r.claims);for(const [key,n] of Object.entries(reward)){if(!Number.isFinite(s.res[key]+n)||s.res[key]+n>Number.MAX_SAFE_INTEGER)return '资源数量过大，请先使用部分物资';}for(const [key,n] of Object.entries(reward))s.res[key]+=n;r.status='claimed';r.claims++;r.lastClaimPeriod=period(now);return null;}
  return {init,valid,validJob,definitions,def,direct,routes,snapshot,tasks,taskCheck,taskSnapshot,settle,claim};
})();
