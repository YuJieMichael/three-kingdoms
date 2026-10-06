'use strict';
// Route configuration is persistent; plans are derived from current city scopes.
// This module never advances time, switches cities, saves, or creates resources.
const SupplyLines=(()=>{
  const resources=['food','wood','stone','iron','gold'],maxLines=12,maxStock=1000000000,maxArmy=1000000;
  const object=x=>!!x&&typeof x==='object'&&!Array.isArray(x),clone=x=>JSON.parse(JSON.stringify(x));
  const integer=(n,max=maxStock)=>Number.isSafeInteger(n)&&n>=0&&n<=max;
  const fields=['id','sourceCity','destinationCity','resource','targetStock','sourceReserve','army','enabled'];
  const routeOf=(s,id)=>s.realm?.supplyLines?.lines.find(l=>l.id===id);
  const jobs=(s,id)=>s.realm?.logistics?.filter(j=>j.supplyLine===id)||[];
  const scope=c=>c?.data?{...c,...c.data}:c;
  function init(s){if(s.realm&&s.realm.supplyLines===undefined)s.realm.supplyLines={version:1,nextId:1,lines:[]};}
  function armyValid(s,a){return object(a)&&Object.keys(a).length>0&&Object.entries(a).every(([id,n])=>Object.hasOwn(s.army||{},id)&&integer(n,maxArmy)&&n>0)&&Object.values(a).reduce((v,n)=>v+n,0)<=maxArmy;}
  function lineValid(s,l){return object(l)&&Object.keys(l).length===fields.length&&fields.every(k=>Object.hasOwn(l,k))&&typeof l.id==='string'&&/^supply_[1-9]\d*$/.test(l.id)&&typeof l.sourceCity==='string'&&typeof l.destinationCity==='string'&&Object.hasOwn(s.realm.cities,l.sourceCity)&&Object.hasOwn(s.realm.cities,l.destinationCity)&&l.sourceCity!==l.destinationCity&&resources.includes(l.resource)&&integer(l.targetStock)&&l.targetStock>0&&integer(l.sourceReserve)&&armyValid(s,l.army)&&typeof l.enabled==='boolean';}
  function valid(s){
    if(!object(s?.realm)||!object(s.realm.cities)||!Array.isArray(s.realm.logistics))return false;
    const a=s.realm?.supplyLines;if(!object(a)||Object.keys(a).length!==3||a.version!==1||!integer(a.nextId,maxStock)||a.nextId<1||!Array.isArray(a.lines)||a.lines.length>maxLines)return false;
    const ids=new Set(),directions=new Set();for(const l of a.lines){if(!lineValid(s,l)||Number(l.id.slice(7))>=a.nextId||ids.has(l.id))return false;const key=JSON.stringify([l.sourceCity,l.destinationCity,l.resource]);if(directions.has(key))return false;directions.add(key);ids.add(l.id);}
    const counts=new Map();for(const j of s.realm.logistics){if(!object(j))return false;if(j.supplyLine===undefined)continue;const l=routeOf(s,j.supplyLine);if(!l||j.kind!=='transport'||j.sourceCity!==l.sourceCity||j.destinationCity!==l.destinationCity||j.general||!object(j.cargo)||!object(j.army)||Object.keys(j.army).some(id=>!Object.hasOwn(s.army||{},id))||!integer(j.cargo[l.resource],Number.MAX_SAFE_INTEGER)||j.cargo[l.resource]<1||Object.entries(j.cargo).some(([id,n])=>!resources.includes(id)||id!==l.resource&&n!==0)||Object.keys(s.army||{}).some(id=>(j.army[id]||0)!==(l.army[id]||0)))return false;counts.set(l.id,(counts.get(l.id)||0)+1);if(counts.get(l.id)>1)return false;}
    return true;
  }
  function draftOf(s,draft){
    if(!object(draft)||Object.keys(draft).some(k=>!fields.includes(k)))return null;
    const army=object(draft.army)?Object.fromEntries(Object.keys(s.army||{}).filter(id=>draft.army[id]>0).map(id=>[id,draft.army[id]])):null;
    if(!object(draft.army)||Object.entries(draft.army).some(([id,n])=>!Object.hasOwn(s.army||{},id)||!integer(n,maxArmy)))return null;
    return {id:draft.id||'',sourceCity:draft.sourceCity,destinationCity:draft.destinationCity,resource:draft.resource,targetStock:draft.targetStock,sourceReserve:draft.sourceReserve,army,enabled:draft.enabled};
  }
  function configReason(s,d){
    if(!d)return '补给线配置格式无效';
    if(d.id&&!routeOf(s,d.id))return '补给线不存在';
    if(typeof d.sourceCity!=='string'||typeof d.destinationCity!=='string'||!Object.hasOwn(s.realm?.cities||{},d.sourceCity)||!Object.hasOwn(s.realm.cities,d.destinationCity)||d.sourceCity===d.destinationCity)return '请选择两座不同的治下城市';
    if(!resources.includes(d.resource))return '请选择粮食、木材、石料、铁锭或黄金';
    if(!integer(d.targetStock)||d.targetStock<1||!integer(d.sourceReserve))return '目标库存需为 1–10 亿，源城保留量需为 0–10 亿整数';
    if(!armyValid(s,d.army))return '固定运输队需为 1–100 万名有效士兵';
    if(typeof d.enabled!=='boolean')return '补给线启用状态无效';
    const lines=s.realm.supplyLines?.lines||[];
    if(lines.some(l=>l.id!==d.id&&l.sourceCity===d.sourceCity&&l.destinationCity===d.destinationCity&&l.resource===d.resource))return '同方向、同资源已经有一条补给线';
    if(!d.id&&(lines.length>=maxLines||s.realm.supplyLines?.nextId>=maxStock))return '补给线数量已达上限';
    if(d.id&&jobs(s,d.id).length)return '运输队仍在途中，请等返城后再修改配置';
    return '';
  }
  function keyFor(s,d){return JSON.stringify([d,s.realm?.supplyLines]);}
  function plan(s,line,api){
    const result={state:'blocked',reason:'',amount:0,deficit:0,pending:0,cargo:{},quote:null};
    const stop=(state,reason)=>({...result,state,reason});
    if(!line||!resources.includes(line.resource)||!armyValid(s,line.army)||!integer(line.targetStock)||line.targetStock<1||!integer(line.sourceReserve)||typeof line.enabled!=='boolean'||!Object.hasOwn(s.realm?.cities||{},line.sourceCity)||!Object.hasOwn(s.realm.cities,line.destinationCity)||line.sourceCity===line.destinationCity)return stop('blocked','补给线配置无效');
    const active=line.id?jobs(s,line.id):[];if(active.length)return {...stop('inflight',active[0].phase==='return'?'等待运输队返城':'运输队正在送达'),job:clone(active[0])};
    if(!line.enabled)return stop('paused','补给线已暂停');
    const source=scope(api?.getCity?.(line.sourceCity)),target=scope(api?.getCity?.(line.destinationCity));
    if(!source?.res||!target?.res)return stop('blocked','来源或目的城市不存在');
    const pending=(s.realm.logistics||[]).filter(j=>j.kind==='transport'&&j.destinationCity===line.destinationCity&&j.phase==='outbound'&&!j.delivered&&!j.cancelled).reduce((v,j)=>v+(j.cargo?.[line.resource]||0),0);
    const stock=target.res[line.resource],sourceStock=source.res[line.resource],food=source.res.food;
    if(!Number.isFinite(stock)||!Number.isFinite(sourceStock)||!Number.isFinite(food)||!Number.isSafeInteger(pending))return stop('blocked','城市资源数量无效');
    result.pending=pending;result.deficit=Math.max(0,Math.floor(line.targetStock-stock-pending));
    if(!result.deficit)return stop('stocked','目的城库存与待到货物已达到目标');
    if(typeof api?.quoteFrom!=='function')return stop('blocked','运输报价暂不可用');
    const reserve=Math.max(line.sourceReserve,source.automation?.reserve?.[line.resource]||0),foodReserve=Math.max(source.automation?.reserve?.food||0,line.resource==='food'?line.sourceReserve:0),available=Math.max(0,Math.floor(sourceStock-reserve));
    const probe=api.quoteFrom(line.sourceCity,line.destinationCity,clone(line.army),{[line.resource]:1});
    if(!probe||!Number.isFinite(probe.carry)||!Number.isSafeInteger(probe.foodCost)||probe.foodCost<0)return stop('blocked','运输报价暂不可用');
    result.quote=probe;result.sourceReserve=reserve;result.foodReserve=foodReserve;
    if(food-foodReserve<probe.foodCost)return stop('blocked',`源城粮食不足，需保留 ${foodReserve} 并支付行军粮 ${probe.foodCost}`);
    if(!available)return stop('blocked','源城可供资源不足，保留量不会被动用');
    const foodCargo=line.resource==='food'?Math.max(0,Math.floor(food-foodReserve-probe.foodCost)):Number.MAX_SAFE_INTEGER;
    result.amount=Math.min(result.deficit,available,Math.max(0,Math.floor(probe.carry)),foodCargo);
    if(result.amount<1)return stop('blocked',probe.reason||'固定运输队没有可用负重');
    result.cargo={[line.resource]:result.amount};
    const q=api.quoteFrom(line.sourceCity,line.destinationCity,clone(line.army),clone(result.cargo));result.quote=q;
    if(!q)return stop('blocked','运输报价暂不可用');
    if(q.reason)return stop('blocked',q.reason);
    return {...result,state:'ready',reason:result.amount<result.deficit?'本次装载部分缺口，运输队返城后继续补给':'运输队可补足当前缺口'};
  }
  function quote(s,draft,api){if(!valid(s))return {draft:null,reason:'存档补给线配置无效',key:'',plan:null};const d=draftOf(s,draft),reason=configReason(s,d);return {draft:d,reason,key:d?keyFor(s,d):'',plan:reason?null:plan(s,{...d,enabled:true},api)};}
  function set(s,draft,key,api){
    const q=quote(s,draft,api);if(q.reason)return q.reason;if(q.key!==key)return '补给线配置已变化，请重新预览';
    const a=s.realm.supplyLines,d=clone(q.draft);if(d.id)a.lines[a.lines.findIndex(l=>l.id===d.id)]=d;else{d.id='supply_'+a.nextId++;a.lines.push(d);}return null;
  }
  function setEnabled(s,id,enabled){const l=routeOf(s,id);if(!l)return '补给线不存在';if(typeof enabled!=='boolean')return '补给线启用状态无效';l.enabled=enabled;return null;}
  function remove(s,id){const l=routeOf(s,id);if(!l)return '补给线不存在';if(jobs(s,id).length)return '请先暂停补给线，等待运输队返城后删除';s.realm.supplyLines.lines=s.realm.supplyLines.lines.filter(l=>l.id!==id);return null;}
  function pauseForRecall(s,job){const l=routeOf(s,job?.supplyLine);if(l)l.enabled=false;return !!l;}
  function list(s,api){return (s.realm?.supplyLines?.lines||[]).map(l=>({...clone(l),...plan(s,l,api)}));}
  function status(s,id,api){return list(s,api).find(l=>l.id===id)||null;}
  function run(s,api){
    if(!valid(s)||typeof api?.send!=='function')return [];
    const results=[];for(const line of s.realm.supplyLines.lines){const p=plan(s,line,api);if(p.state!=='ready'){results.push({id:line.id,...p});continue;}const error=api.send(p,line);results.push({id:line.id,...p,state:error?'blocked':'sent',reason:error||'运输队已出发'});}return results;
  }
  return {resources,maxLines,maxStock,maxArmy,init,valid,quote,set,plan,list,status,setEnabled,remove,pauseForRecall,run};
})();
