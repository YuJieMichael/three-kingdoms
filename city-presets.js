'use strict';
// Goals are city-scoped. Planning only projects; the engine pays and queues real jobs.
const CityPresets=(()=>{
 const types=['farm','lumber','quarry','mine'],object=x=>!!x&&typeof x==='object'&&!Array.isArray(x),clone=x=>JSON.parse(JSON.stringify(x)),level=n=>Number.isSafeInteger(n)&&n>=0&&n<=10;
 const presets=[
  {id:'grain',name:'粮城',buildings:{hall:3,house:3,warehouse:3,market:1},plots:{counts:{farm:24,lumber:5,quarry:5,mine:5},level:3}},
  {id:'military',name:'兵城',buildings:{hall:3,house:4,warehouse:2,barracks:3,drill:2,tavern:2},plots:{counts:{farm:18,lumber:7,quarry:7,mine:7},level:3}},
  {id:'balanced',name:'均衡城',buildings:{hall:3,house:3,warehouse:2,barracks:1,market:1,tavern:2},plots:{counts:{farm:10,lumber:10,quarry:10,mine:9},level:3}}
 ];
 const empty=()=>({version:1,id:null,active:false,buildings:{},plots:{counts:{farm:0,lumber:0,quarry:0,mine:0},level:1}});
 function init(s){if(s.cityPreset===undefined)s.cityPreset=empty();}
 function validDraft(d,buildings){return object(d)&&Object.keys(d).length===3&&['id','buildings','plots'].every(k=>Object.hasOwn(d,k))&&presets.some(p=>p.id===d.id)&&object(d.buildings)&&Object.entries(d.buildings).every(([id,n])=>Object.hasOwn(buildings,id)&&!types.includes(id)&&level(n))&&object(d.plots)&&Object.keys(d.plots).length===2&&object(d.plots.counts)&&Object.keys(d.plots.counts).length===4&&types.every(t=>Number.isSafeInteger(d.plots.counts[t])&&d.plots.counts[t]>=0&&d.plots.counts[t]<=39)&&types.reduce((n,t)=>n+d.plots.counts[t],0)<=39&&level(d.plots.level)&&d.plots.level>=1;}
 function valid(s,buildings){const p=s.cityPreset;if(!object(p)||Object.keys(p).length!==5||p.version!==1||typeof p.active!=='boolean')return false;if(p.id===null)return p.active===false&&object(p.buildings)&&Object.keys(p.buildings).length===0&&object(p.plots)&&Object.keys(p.plots).length===2&&p.plots.level===1&&object(p.plots.counts)&&Object.keys(p.plots.counts).length===4&&types.every(t=>p.plots.counts[t]===0);return validDraft({id:p.id,buildings:p.buildings,plots:p.plots},buildings)&&(!p.active||!s.autoUpgrade&&!s.plotTemplate?.active);}
 function draft(id){const p=presets.find(p=>p.id===id);return p?clone({id:p.id,buildings:p.buildings,plots:p.plots}):null;}
 function plan(s,d,api){
  const tasks=[],add=(area,index,id,current)=>{const next=current+1,cost=area==='city'?api.buildCost(id,next):api.plotCost(index,id);tasks.push({area,index,id,level:next,cost,requirement:api.requirement(id,next),seconds:area==='city'?api.buildSeconds(id,next):api.plotSeconds(index,id)});};
  for(const [id,target]of Object.entries(d.buildings)){if(!target)continue;const site=s.cityLayout.indexOf(id);if(site>=0){if(s.cityLevels[site]<target&&!s.buildQueue.some(q=>q.site===site))add('city',site,id,s.cityLevels[site]);}else if(!s.buildQueue.some(q=>q.id===id&&q.site!==undefined)){const index=s.cityLayout.indexOf(null);if(index>=0)add('city',index,id,0);}}
  const used=Object.fromEntries(types.map(t=>[t,0]));for(let i=0;i<api.unlocked;i++){const job=s.buildQueue.find(q=>q.plot===i),p=s.plots[i],type=job?.id||p.type;if(type)used[type]++;}
  for(let i=0;i<api.unlocked;i++){const p=s.plots[i];if(s.buildQueue.some(q=>q.plot===i))continue;if(p.type){if(p.level<Math.min(d.plots.level,api.plotMax))add('plot',i,p.type,p.level);continue;}let id=null;for(const type of types)if(d.plots.counts[type]>used[type]&&(!id||d.plots.counts[type]-used[type]>d.plots.counts[id]-used[id]))id=type;if(id){used[id]++;add('plot',i,id,0);}}
  return tasks;
 }
 return {presets,types,empty,init,valid,validDraft,draft,plan};
})();
