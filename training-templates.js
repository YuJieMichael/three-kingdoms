'use strict';
// Targets are city-scoped. Reading a plan does not advance or mutate the game.
const TrainingTemplates=(()=>{
 const presets=[{id:'archer',name:'弓兵队',army:{archer:1000,shield:300}},{id:'cavalry',name:'骑兵队',army:{cavalry:500,spear:300}},{id:'siege',name:'攻城队',army:{archer:2000,shield:600,spear:400,ram:20}}];
 const object=x=>!!x&&typeof x==='object'&&!Array.isArray(x),clone=x=>JSON.parse(JSON.stringify(x));
 const empty=()=>({version:1,id:null,army:{},active:false,revision:0});
 function init(s){if(s.trainingTemplate===undefined)s.trainingTemplate=empty();}
 function validDraft(d){return object(d)&&Object.keys(d).length===2&&Object.hasOwn(d,'id')&&presets.some(p=>p.id===d.id)&&object(d.army)&&Object.keys(d.army).length>0&&Object.entries(d.army).every(([id,n])=>Object.hasOwn(ManualData.units,id)&&Number.isSafeInteger(n)&&n>=0&&n<=100000)&&Object.values(d.army).some(n=>n>0);}
 function valid(s){const t=s.trainingTemplate;return object(t)&&Object.keys(t).length===5&&t.version===1&&typeof t.active==='boolean'&&Number.isSafeInteger(t.revision)&&t.revision>=0&&(t.id===null?!t.active&&object(t.army)&&Object.keys(t.army).length===0:validDraft({id:t.id,army:t.army}));}
 function draft(s,value){const d=typeof value==='string'?(s.trainingTemplate.id===value?{id:value,army:clone(s.trainingTemplate.army)}:presets.find(p=>p.id===value)?{id:value,army:clone(presets.find(p=>p.id===value).army)}:null):clone(value||null);if(!validDraft(d))return d;return {id:d.id,army:Object.fromEntries(Object.keys(ManualData.units).filter(id=>d.army[id]>0).map(id=>[id,d.army[id]]))};}
 function plan(s,d,api){
  const deficits={},remaining={},blocked={},orders=[],cost={},reserve={...s.automation.reserve};if(api.automatic)reserve.gold=Math.max(reserve.gold||0,api.salaryReserve);
  const funds=Object.fromEntries(Object.entries(s.res).map(([k,n])=>[k,Math.max(0,n-(reserve[k]||0))]));let population=api.population,slots=Math.max(0,api.limit-s.trainQueue.length);
  for(const id of Object.keys(ManualData.units)){
   if(!d.army[id])continue;const queued=s.trainQueue.filter(q=>q.id===id).reduce((n,q)=>n+q.count,0),missing=Math.max(0,d.army[id]-s.army[id]-queued);deficits[id]=remaining[id]=missing;if(!missing)continue;
   const requirement=api.requirement(id);if(requirement){blocked[id]='需要 '+requirement;continue;}if(!slots){blocked[id]='训练队列已满';continue;}
   const one=api.cost(id,1),people=ManualData.units[id].people||1;let count=Math.min(missing,Math.floor(population/people));for(const [k,n] of Object.entries(one))if(n>0)count=Math.min(count,Math.floor(funds[k]/n));
   if(count<1){blocked[id]=population<people?'空闲人口不足':'资源不足或需保留预算';continue;}const paid=api.cost(id,count);for(const [k,n] of Object.entries(paid)){funds[k]-=n;cost[k]=(cost[k]||0)+n;}population-=count*people;slots--;remaining[id]-=count;orders.push({id,count,seconds:api.seconds(id,count)});if(count<missing)blocked[id]='本次部分补齐，其余等待资源与人口';
  }
  return {deficits,remaining,blocked,orders,cost,people:api.population-population,reserve};
 }
 return {presets,empty,init,validDraft,valid,draft,plan};
})();
