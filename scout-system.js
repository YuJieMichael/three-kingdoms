'use strict';
// Timed, deterministic PVE scouting. A server must own these snapshots for future PVP.
const ScoutSystem=(()=>{
  const MAX_QUEUE=10,MAX_SCOUTS=1000,MAX_INTEL=256;
  const obj=x=>!!x&&typeof x==='object'&&!Array.isArray(x),int=n=>Number.isSafeInteger(n)&&n>=0;
  const coord=p=>obj(p)&&Number.isInteger(p.x)&&p.x>=0&&p.x<64&&Number.isInteger(p.y)&&p.y>=0&&p.y<64;
  const units=api=>api.units||(typeof ManualData!=='undefined'?ManualData.units:{});
  const armyValid=(a,api)=>obj(a)&&Object.entries(a).every(([id,n])=>Object.hasOwn(units(api),id)&&int(n));
  function init(s){if(s.scoutQueue===undefined)s.scoutQueue=[];if(s.scoutIntel===undefined)s.scoutIntel={};}
  const origin=(s,api)=>typeof api.origin==='function'?api.origin(s):api.origin||api.home||{x:32,y:32};
  function assessment(count,tech,counter){const margin=tech+Math.floor(Math.log2(count+1))-counter,quality=margin>=5?3:margin>=3?2:margin>=1?1:0,lost=quality===0?Math.ceil(count*.5):quality===1?Math.floor(count*.1):0;return {quality,success:quality>0,lost,survivors:count-lost};}
  function quote(s,nodeId,count=1,now=Date.now(),api={}){
    const n=api.getNode?.(nodeId,s),o=origin(s,api);if(!n||!coord(n)||!coord(o))return null;
    if(!Number.isSafeInteger(count)||count<1||count>MAX_SCOUTS)return null;
    const counterLevel=api.counterLevel?.(s,n)??Math.min(10,Math.max(1,Math.ceil((n.level||1)/2)+(n.city?2:0))),tech=s.tech.scouting||0;
    const result=assessment(count,tech,counterLevel),distance=Math.hypot(n.x-o.x,n.y-o.y),speed=api.scoutSpeed?.(s)||units(api).scout?.speed||3000;
    const seconds=Math.max(1,Math.ceil((8+distance*2)*(300/speed)/Math.max(1,s.speed||1))),returnSeconds=seconds,cost={food:Math.ceil(count*10+distance*count/2)},ttlMs=(15+tech*5)*60000;
    const queueLimit=Math.min(MAX_QUEUE,Math.max(1,api.queueLimit?.(s)??s.buildings.drill??1));
    const blocked=api.canScout?.(s,n)||'';
    const finalReason=blocked||(s.buildings.drill<1?'请先建造校场':'')||((s.scoutQueue||[]).length>=queueLimit?'侦察队列已满':'')||((s.scoutQueue||[]).some(m=>m.node===nodeId)?'已有斥候前往这个目标':'')||(s.army.scout<count?'城内斥候不足':'')||(s.res.food<cost.food?'行军粮食不足':'');
    return {node:nodeId,name:n.name,count,scouts:count,origin:{x:o.x,y:o.y},target:{x:n.x,y:n.y},distance,seconds,returnSeconds,cost,queueLimit,counterLevel,tech,ttlMs,quality:result.quality,precision:['failed','types','bands','exact'][result.quality],success:result.success,expectedLost:result.lost,reason:finalReason,key:[nodeId,count,o.x,o.y,n.x,n.y,tech,counterLevel,speed,s.speed||1,cost.food,(s.scoutQueue||[]).length].join('|')};
  }
  function dispatch(s,nodeId,count,now,api={},key){
    const q=quote(s,nodeId,count,now,api);if(!q||key!==undefined&&key!==q.key)return '侦察条件已变化，请重新查看';if(q.reason)return q.reason;
    const n=api.getNode(nodeId,s),enemy=api.enemyArmy?.(s,n)||n.army||{};if(!armyValid(enemy,api))return '目标兵力格式不正确';
    let suffix=0,id;do{id='scout_'+now+'_'+suffix++;}while(s.scoutQueue.some(m=>m.id===id));
    s.res.food-=q.cost.food;s.army.scout-=q.count;
    s.scoutQueue.push({id,node:nodeId,origin:q.origin,target:q.target,scouts:q.count,phase:'out',start:now,end:now+q.seconds*1000,arriveAt:now+q.seconds*1000,returnSeconds:q.returnSeconds,cost:q.cost,tech:q.tech,counterLevel:q.counterLevel,ttlMs:q.ttlMs,enemySnapshot:{...enemy},outcome:null});return null;
  }
  function band(n){const step=Math.max(10,10**Math.floor(Math.log10(n||1)));return {min:Math.floor(n/step)*step,max:(Math.floor(n/step)+1)*step-1};}
  function settle(m){const a=assessment(m.scouts,m.tech,m.counterLevel),types=a.success?Object.keys(m.enemySnapshot).filter(id=>m.enemySnapshot[id]>0):[];return {...a,at:m.arriveAt,expiresAt:m.arriveAt+m.ttlMs,level:m.tech,types,army:a.quality===3?{...m.enemySnapshot}:null,bands:a.quality===2?Object.fromEntries(types.map(id=>[id,band(m.enemySnapshot[id])])):null};}
  function tick(s,now,api={}){
    const done=[];for(const m of s.scoutQueue){
      if(m.phase==='out'&&now>=m.end){m.outcome=settle(m);m.phase='return';m.start=m.arriveAt;m.end=m.arriveAt+m.returnSeconds*1000;s.scoutIntel[m.node]={...m.outcome};if(m.outcome.success)api.record?.(s,'scout');}
      if(m.phase==='return'&&now>=m.end){s.army.scout+=m.outcome.survivors;done.push(m.id);}
    }
    if(done.length)s.scoutQueue=s.scoutQueue.filter(m=>!done.includes(m.id));
    const entries=Object.entries(s.scoutIntel).sort((a,b)=>b[1].at-a[1].at);if(entries.length>MAX_INTEL)s.scoutIntel=Object.fromEntries(entries.slice(0,MAX_INTEL));
    return done;
  }
  const heldArmy=s=>({scout:(s.scoutQueue||[]).reduce((sum,m)=>sum+(m.phase==='return'?m.outcome.survivors:m.scouts),0)});
  function intel(s,nodeId,now=Date.now()){const r=s.scoutIntel?.[nodeId];if(!r||!r.success||r.expiresAt<=now)return null;return {...r,exact:r.quality===3,precision:['failed','types','bands','exact'][r.quality]};}
  function valid(s,api={}){
    try{
      const counts=army=>armyValid(army,api),target=id=>typeof id==='string'&&id.length<=100&&(!api.getNode||!!api.getNode(id,s));
      const report=r=>obj(r)&&typeof r.success==='boolean'&&int(r.quality)&&r.quality<=3&&r.success===(r.quality>0)&&int(r.lost)&&int(r.survivors)&&r.lost+r.survivors>=1&&r.lost+r.survivors<=MAX_SCOUTS&&int(r.at)&&int(r.expiresAt)&&r.expiresAt===r.at+(15+r.level*5)*60000&&int(r.level)&&r.level<=10&&Array.isArray(r.types)&&r.types.every(id=>Object.hasOwn(units(api),id))&&new Set(r.types).size===r.types.length&&(r.success||r.types.length===0)&&(r.quality===3?counts(r.army)&&Object.keys(r.army).filter(id=>r.army[id]>0).length===r.types.length&&r.types.every(id=>r.army[id]>0):r.army===null)&&(r.quality===2?obj(r.bands)&&Object.keys(r.bands).length===r.types.length&&r.types.every(id=>obj(r.bands[id])&&int(r.bands[id].min)&&int(r.bands[id].max)&&r.bands[id].max>=r.bands[id].min):r.bands===null);
      const outcomeValid=m=>{if(!report(m.outcome))return false;const expected=settle(m);return ['quality','success','lost','survivors','at','expiresAt','level'].every(k=>m.outcome[k]===expected[k])&&JSON.stringify(m.outcome.types)===JSON.stringify(expected.types)&&JSON.stringify(m.outcome.army)===JSON.stringify(expected.army)&&JSON.stringify(m.outcome.bands)===JSON.stringify(expected.bands);};
      if(!Array.isArray(s.scoutQueue)||s.scoutQueue.length>MAX_QUEUE||!obj(s.scoutIntel)||Object.keys(s.scoutIntel).length>MAX_INTEL||!Object.entries(s.scoutIntel).every(([id,r])=>target(id)&&report(r)))return false;
      if(new Set(s.scoutQueue.map(m=>m.id)).size!==s.scoutQueue.length||new Set(s.scoutQueue.map(m=>m.node)).size!==s.scoutQueue.length)return false;
      return s.scoutQueue.every(m=>obj(m)&&typeof m.id==='string'&&/^scout_\d+_\d+$/.test(m.id)&&target(m.node)&&coord(m.origin)&&coord(m.target)&&int(m.scouts)&&m.scouts>=1&&m.scouts<=MAX_SCOUTS&&['out','return'].includes(m.phase)&&int(m.start)&&int(m.end)&&m.end>m.start&&int(m.arriveAt)&&int(m.returnSeconds)&&m.returnSeconds>=1&&m.returnSeconds<=360000&&obj(m.cost)&&Object.keys(m.cost).length===1&&int(m.cost.food)&&m.cost.food>=m.scouts*10&&int(m.tech)&&m.tech<=10&&int(m.counterLevel)&&m.counterLevel>=1&&m.counterLevel<=10&&m.ttlMs===(15+m.tech*5)*60000&&counts(m.enemySnapshot)&&(m.phase==='out'?m.outcome===null&&m.arriveAt===m.end:outcomeValid(m)&&m.start===m.arriveAt&&m.end===m.arriveAt+m.returnSeconds*1000&&m.outcome.at===m.arriveAt&&m.outcome.lost+m.outcome.survivors===m.scouts&&m.outcome.expiresAt===m.arriveAt+m.ttlMs));
    }catch{return false;}
  }
  return {MAX_QUEUE,MAX_SCOUTS,init,valid,quote,dispatch,tick,heldArmy,intel};
})();
