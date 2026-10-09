'use strict';
const GeneralGrowth=(()=>{
  const D=GeneralGrowthData,obj=x=>!!x&&typeof x==='object'&&!Array.isArray(x);
  const route=id=>D.routes.find(r=>r.id===id);
  function init(s){if(s.heroSkills===undefined)s.heroSkills={};}
  function valid(s){return obj(s.heroSkills)&&Object.entries(s.heroSkills).every(([id,k])=>s.generals.includes(id)&&obj(k)&&Object.keys(k).length===2&&!!route(k.route)&&Number.isInteger(k.level)&&k.level>=1&&k.level<=D.maxLevel&&(s.generalLevels[id]||1)>=D.heroLevels[k.level]);}
  function statBonus(s,id){const k=s.heroSkills?.[id],r=k&&route(k.route);return Object.fromEntries(Object.entries(r?.stats||{}).map(([key,n])=>[key,Math.round(n*D.steps(k.level))]));}
  function profile(s,id){const k=s.heroSkills?.[id],r=k&&route(k.route);return {route:r?.id||'',level:k?.level||0,attackByUnit:Object.fromEntries((r?.units||[]).map(unit=>[unit,1+r.attack*D.steps(k.level)])),marchFactor:1+(r?.march||0)*D.steps(k?.level||0),gateFactor:1+(r?.gate||0)*D.steps(k?.level||0)};}
  function validProfile(p){if(!obj(p)||!Number.isInteger(p.level)||p.level<0||p.level>D.maxLevel||!obj(p.attackByUnit))return false;if(!p.level)return p.route===''&&Object.keys(p.attackByUnit).length===0&&p.marchFactor===1&&p.gateFactor===1;const r=route(p.route);return !!r&&p.marchFactor===1+r.march*D.steps(p.level)&&p.gateFactor===1+r.gate*D.steps(p.level)&&Object.keys(p.attackByUnit).length===r.units.length&&r.units.every(unit=>p.attackByUnit[unit]===1+r.attack*D.steps(p.level));}
  function trainQuote(s,id,routeId,api={}){
    const r=route(routeId);if(!r||!s.generals.includes(id))return null;
    const old=s.heroSkills?.[id],level=old?.level||0,next=level+1,cost=D.cost(next),busy=api.generalBusy?.(id)||false;
    const reason=old&&old.route!==routeId?'此将已选择 '+route(old.route).name+'，四条路线互斥':level>=D.maxLevel?'此路线已达 '+D.maxLevel+' 级':busy?'将领出征或驻守中，请返城后训练':(s.generalLevels[id]||1)<D.heroLevels[next]?'需要将领 '+D.heroLevels[next]+' 级':(s.warOrders?.merit||0)<cost.merit?'军功不足':s.res.gold<cost.gold?'黄金不足':Object.entries(cost.jewels).some(([j,n])=>(s.jewels[j]||0)<n)?'珍宝不足':'';
    return {id,route:routeId,name:r.name,description:r.description,level,next,cost,reason,key:[id,routeId,old?.route||'',level,s.generalLevels[id]||1,!!busy].join('|')};
  }
  // Pure mutation API. The engine owns write-session checks, tick, and save.
  function train(s,id,routeId,key,api={}){
    const q=trainQuote(s,id,routeId,api);if(!q||q.key!==key)return '技能条件已变化，请重新查看';if(q.reason)return q.reason;
    s.res.gold-=q.cost.gold;s.warOrders.merit-=q.cost.merit;s.warOrders.spent+=q.cost.merit;for(const [j,n]of Object.entries(q.cost.jewels))s.jewels[j]-=n;
    s.heroSkills[id]={route:routeId,level:q.next};return null;
  }
  return {routes:D.routes,init,valid,statBonus,profile,validProfile,trainQuote,train};
})();
const GeneralGrowthSystem=GeneralGrowth;
