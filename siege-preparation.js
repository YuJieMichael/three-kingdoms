"use strict";
const SiegePreparation=(()=>{
  const object=x=>!!x&&typeof x==='object'&&!Array.isArray(x);
  const integer=x=>Number.isSafeInteger(x)&&x>=0;
  function init(s){if(s.siegePreparation===undefined)s.siegePreparation={version:1,templates:{}};}
  function validTemplate(t,s){return object(t)&&Object.keys(t).length===3&&typeof t.hero==='string'&&(t.hero===''||['lin','su',...(s.customGenerals||[]).map(g=>g.id),...Object.values(NamedGarrison.generals).map(g=>g.id)].includes(t.hero))&&['advance','hold','fallback'].includes(t.tactic)&&object(t.army)&&Object.keys(t.army).length>0&&Object.entries(t.army).every(([id,n])=>Object.hasOwn(ManualData.units,id)&&integer(n)&&n<=100000)&&Object.values(t.army).some(n=>n>0);}
  function valid(s){const p=s.siegePreparation;return object(p)&&Object.keys(p).length===2&&p.version===1&&object(p.templates)&&Object.entries(p.templates).every(([city,rows])=>!!s.realm?.cities[city]&&object(rows)&&Object.entries(rows).every(([node,t])=>NamedGarrison.ids.includes(node)&&validTemplate(t,s)));}
  function plan(t,s,api){
    const deficits={},remaining={},orders=[],cost={};let population=api.population,slots=Math.max(0,api.limit-s.trainQueue.length);const funds={...s.res};
    for(const id of Object.keys(ManualData.units)){
      if(!t?.army[id])continue;
      const queued=s.trainQueue.filter(q=>q.id===id).reduce((n,q)=>n+q.count,0),missing=Math.max(0,t.army[id]-(s.army[id]||0)-queued);deficits[id]=missing;remaining[id]=missing;
      if(!missing||!slots||api.requirement(id))continue;
      const one=api.cost(id,1),people=ManualData.units[id].people||1;
      let count=Math.min(missing,Math.floor(population/people));
      for(const [key,n] of Object.entries(one))if(n>0)count=Math.min(count,Math.floor((funds[key]||0)/n));
      if(count<1)continue;
      const paid=api.cost(id,count);for(const [key,n] of Object.entries(paid)){funds[key]-=n;cost[key]=(cost[key]||0)+n;}
      population-=count*people;slots--;remaining[id]-=count;orders.push({id,count,seconds:api.seconds(id,count)});
    }
    return {deficits,remaining,orders,cost,people:api.population-population};
  }
  return {init,valid,validTemplate,plan};
})();
