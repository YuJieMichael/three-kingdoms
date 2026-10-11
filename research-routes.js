'use strict';
// These goals only project real requirements; research and construction keep their existing costs.
const ResearchRoutes=(()=>{
  const routes={economy:{name:'经济',ids:['plant','logging','mining','smelting','construction','researching']},archer:{name:'弓兵',ids:['shooting','combat','protection','supply']},cavalry:{name:'骑兵',ids:['riding','combat','protection','march']},siege:{name:'攻城',ids:['manufacture','protection','shooting','combat','load'],levels:{manufacture:7,protection:8,shooting:6}}};
  const object=x=>!!x&&typeof x==='object'&&!Array.isArray(x);
  const empty=()=>({version:1,id:''});
  function init(s){if(s.researchRoute===undefined)s.researchRoute=empty();}
  function valid(s){const r=s.researchRoute;return object(r)&&Object.keys(r).length===2&&r.version===1&&(r.id===''||Object.hasOwn(routes,r.id));}
  function view(game,id=game.state.researchRoute?.id){
    if(!Object.hasOwn(routes,id))return null;
    const s=game.state,r=routes[id],targets=r.ids.map(id=>({id,level:r.levels?.[id]||5,current:s.tech[id],name:ManualData.technology[id].name})),target=targets.find(t=>t.current<t.level),seen=new Set();
    if(!target)return {id,name:r.name,targets,target:null,next:null,complete:true,automatic:s.autoResearch,status:'路线已完成；自动研究继续沿原挂机偏好'};
    function resolve(kind,id,targetLevel){
      const current=kind==='tech'?s.tech[id]:game.requirementLevel(id);if(current>=targetLevel)return null;
      const key=kind+':'+id+':'+targetLevel;if(seen.has(key))return {kind:'blocked',id,status:'前置循环，请查看详情'};seen.add(key);
      const level=current+1,name=kind==='tech'?ManualData.technology[id].name:game.buildings[id].name;
      const pending=kind==='tech'?s.researchQueue?.id===id?s.researchQueue:null:s.buildQueue.find(q=>q.id===id&&q.level>current);
      if(pending)return {kind:'queue',id,level:pending.level,queueKind:kind==='tech'?'research':'build',queue:{...pending},status:name+'正在进行'};
      if(kind==='tech'&&game.requirementLevel('academy')<1){const step=resolve('building','academy',1);if(step)return step;}
      const conditions=kind==='tech'?ReferenceRules.researchConditions[id]?.[level]||[]:game.buildingConditions(id,level);
      for(const dep of conditions){if(dep.kind==='item'){if((s.inventory[dep.id]||0)<dep.level)return {kind:'item',id:dep.id,level:dep.level,status:'需要 '+ManualData.shop.find(i=>i.id===dep.id).name+' ×'+dep.level};}else {const step=resolve(dep.kind==='tech'?'tech':'building',dep.id,dep.level);if(step)return step;}}
      if(kind==='tech'&&s.researchQueue)return {kind:'queue',id:s.researchQueue.id,queueKind:'research',queue:{...s.researchQueue},status:'等待当前研究完成'};
      let site=-1;
      if(kind==='building'){if(Object.hasOwn(game.plotTypes,id)){site=s.plots.reduce((best,p,i)=>p.type===id&&(best<0||p.level>s.plots[best].level)?i:best,-1);if(site<0)site=s.plots.findIndex((p,i)=>!p.type&&!game.plotJob(i)&&i<game.unlockedPlots());}else{site=s.cityLayout.reduce((best,x,i)=>x===id&&(best<0||s.cityLevels[i]>s.cityLevels[best])?i:best,-1);if(site<0)site=s.cityLayout.indexOf(null);}if(site<0)return {kind:'blocked',id,status:'需要可建设的空地'};}
      return {kind,id,level,site,status:(kind==='tech'?'研究':'建设')+name+' '+level+'级',cost:kind==='tech'?game.researchCost(id):Object.hasOwn(game.plotTypes,id)?game.plotCost(site,id):game.buildRecord(id,level).cost};
    }
    const next=resolve('tech',target.id,target.level);return {id,name:r.name,targets,target,next,complete:false,automatic:s.autoResearch,status:next.status};
  }
  const catalog=()=>Object.entries(routes).map(([id,r])=>({id,name:r.name}));
  return {empty,init,valid,view,catalog};
})();
