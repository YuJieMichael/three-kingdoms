'use strict';
// Pure outdoor layout suggestions. Queueing, payment and save ownership stay in Game.
const PlotTemplateData = (() => {
  const types = ['farm','lumber','quarry','mine'];
  const resources = {farm:'food',lumber:'wood',quarry:'stone',mine:'iron'};
  const templates = [
    {id:'army',name:'兵城',desc:'木场、石场、铁矿各留一块，其余种粮，侧重军队粮草。'},
    {id:'balanced',name:'资源城',desc:'粮、木、石、铁尽量等分，适合主城均衡发展。'},
    {id:'catapult',name:'投石城',desc:'按投石车的粮、木、石、铁造价分配，侧重石料。'}
  ];
  const blank = () => Object.fromEntries(types.map(type=>[type,0]));
  const validTotal = total => Number.isInteger(total)&&total>=0&&total<=39;
  const countTypes = entries => {
    const result=blank();
    entries.forEach(type=>{if(types.includes(type))result[type]++;});
    return result;
  };
  function counts(id,total,units,buildings) {
    if(!validTotal(total)||!templates.some(template=>template.id===id))return null;
    const result=blank();
    if(id==='army'&&total>=4){result.farm=total-3;result.lumber=result.quarry=result.mine=1;return result;}
    if(id!=='catapult'){
      types.forEach((type,index)=>{result[type]=Math.floor(total/4)+(index<total%4?1:0);});
      return result;
    }
    const cost=units?.catapult?.cost;
    if(!cost||types.some(type=>!Number.isFinite(cost[resources[type]])||cost[resources[type]]<0))return null;
    // Level-one outputs are currently all 100; the optional tables keep this
    // recommendation proportional if the basic production rates later differ.
    const weights=types.map(type=>{
      const output=buildings?.[type]?.rows?.find(row=>row.level===1)?.output;
      return cost[resources[type]]/(Number.isFinite(output)&&output>0?output:100);
    });
    const sum=weights.reduce((value,weight)=>value+weight,0);
    if(sum<=0)return null;
    const quotas=weights.map(weight=>total*weight/sum);
    types.forEach((type,index)=>{result[type]=Math.max(total>=4?1:0,Math.floor(quotas[index]));});
    // Largest remainder, with the displayed resource order breaking ties.
    while(types.reduce((value,type)=>value+result[type],0)<total){
      let next=0;
      for(let index=1;index<types.length;index++)if(quotas[index]-result[types[index]]>quotas[next]-result[types[next]])next=index;
      result[types[next]]++;
    }
    while(types.reduce((value,type)=>value+result[type],0)>total){
      const reducible=types.map((type,index)=>({type,index})).filter(({type})=>result[type]>(total>=4?1:0));
      reducible.sort((a,b)=>(result[b.type]-quotas[b.index])-(result[a.type]-quotas[a.index])||a.index-b.index);
      if(!reducible.length)return null;
      result[reducible[0].type]--;
    }
    return result;
  }
  function plan(state,id,total,units,mode='fill') {
    const desired=counts(id,total,units);
    if(!desired||!Array.isArray(state?.plots)||!['fill','replace'].includes(mode))return null;
    const plots=Array.from({length:total},(_,index)=>state.plots[index]||{type:null,level:0});
    if(plots.some(plot=>plot.type!==null&&!types.includes(plot.type)))return null;
    const jobs=new Map();
    for(const job of state.buildQueue||[]){
      if(Number.isInteger(job.plot)&&job.plot>=0&&job.plot<total){
        if(!types.includes(job.id)||jobs.has(job.plot))return null;
        jobs.set(job.plot,job);
      }
    }
    const actualCounts=countTypes(plots.map(plot=>plot.type));
    const effective=plots.map((plot,index)=>jobs.get(index)?.id||plot.type);
    const effectiveCounts=countTypes(effective);
    const targets=Array(total).fill(null);
    const used=blank();
    function retain(index){targets[index]=effective[index];if(targets[index])used[targets[index]]++;}
    // A build, upgrade or conversion already in progress owns its position.
    for(const index of jobs.keys())retain(index);
    if(mode==='fill'){
      plots.forEach((plot,index)=>{if(!jobs.has(index)&&plot.type)retain(index);});
    }else{
      // Matching high-level fields survive, including their original locations.
      for(const type of types){
        const matching=plots.map((plot,index)=>({plot,index}))
          .filter(({plot,index})=>!jobs.has(index)&&plot.type===type)
          .sort((a,b)=>(b.plot.level||0)-(a.plot.level||0)||a.index-b.index);
        matching.slice(0,Math.max(0,desired[type]-used[type])).forEach(({index})=>retain(index));
      }
    }
    const free=plots.map((plot,index)=>({plot,index}))
      .filter(({index})=>!jobs.has(index)&&targets[index]===null)
      .sort((a,b)=>Number(Boolean(a.plot.type))-Number(Boolean(b.plot.type))||(a.plot.level||0)-(b.plot.level||0)||a.index-b.index);
    const tasks=[];
    for(const {plot,index} of free){
      let type=types[0];
      for(const candidate of types.slice(1))if(desired[candidate]-used[candidate]>desired[type]-used[type])type=candidate;
      targets[index]=type;used[type]++;
      if(plot.type!==type)tasks.push({index,type,kind:plot.type?'replace':'build'});
    }
    const projectedCounts=countTypes(targets);
    const conflicts=types.filter(type=>projectedCounts[type]!==desired[type]).map(type=>({
      type,desired:desired[type],actual:actualCounts[type],effective:effectiveCounts[type],projected:projectedCounts[type],
      shortfall:Math.max(0,desired[type]-projectedCounts[type]),excess:Math.max(0,projectedCounts[type]-desired[type])
    }));
    return {id,mode,total,counts:desired,actualCounts,effectiveCounts,projectedCounts,targets,tasks,conflicts,
      builds:tasks.filter(task=>task.kind==='build').length,replaces:tasks.filter(task=>task.kind==='replace').length};
  }
  return {templates,types,counts,plan};
})();
