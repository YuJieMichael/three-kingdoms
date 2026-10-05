'use strict';
// The top-level save remains the active-city view for old UI and saves.
// realm.cities stores city scopes; global heroes, quests and ownership stay shared.
const CitySystem=(()=>{
  const fields=['last','res','buildings','cityLayout','cityLevels','tactics','plots','plotTemplate','army','captives','buildQueue','trainQueue','researchQueue','tech','innCandidates','governor','population','morale','unrest','tax','storageAllocation','civicCooldowns','defenses','defenseQueue','garrisons','expedition','expeditions','battle','autoUpgrade','autoResearch','automation','cityRoles','gatherings','cityDefense','scoutQueue','scoutIntel'];
  const clone=value=>JSON.parse(JSON.stringify(value));
  const object=value=>!!value&&typeof value==='object'&&!Array.isArray(value);
  const integer=n=>Number.isSafeInteger(n)&&n>=0;
  const idFor=node=>'city_'+node;
  const pick=s=>Object.fromEntries(fields.filter(k=>s[k]!==undefined).map(k=>[k,s[k]]));
  function capture(s){if(!s.realm?.cities?.[s.realm.activeCity])return;Object.assign(s.realm.cities[s.realm.activeCity].data,pick(s));}
  function activate(s,id){const c=s.realm?.cities?.[id];if(!c)return false;for(const k of fields){if(c.data[k]!==undefined)s[k]=c.data[k];else delete s[k];}s.realm.activeCity=id;return true;}
  function empty(s,node,now){
    const d=clone(pick(s));d.last=now;d.res=Object.fromEntries(Object.keys(s.res).map(k=>[k,0]));d.buildings=Object.fromEntries(Object.keys(s.buildings).map(k=>[k,k==='hall'?1:0]));d.cityLayout=Array.from({length:36},(_,i)=>i===14?'hall':[15,20,21].includes(i)?'reserved':null);d.cityLevels=Array.from({length:36},(_,i)=>i===14?1:0);d.plots=Array.from({length:39},()=>({type:null,level:0}));d.plotTemplate={id:null,active:false,mode:'fill'};
    for(const k of ['army','captives','defenses','tech'])d[k]=Object.fromEntries(Object.keys(s[k]).map(id=>[id,0]));
    d.tactics=clone(s.tactics);d.governor=null;d.cityRoles={commander:'',counsellor:''};d.population=0;d.morale=60;d.unrest=0;d.tax=20;d.storageAllocation={food:25,wood:25,stone:25,iron:25};d.civicCooldowns={comfort:0,levy:0};
    for(const k of ['buildQueue','trainQueue','defenseQueue','innCandidates','expeditions','scoutQueue'])d[k]=[];
    for(const k of ['garrisons','gatherings','scoutIntel'])d[k]={};d.expedition=null;d.battle=null;d.researchQueue=null;d.autoUpgrade=false;d.autoResearch=false;
    d.automation={...clone(s.automation),notices:[],nextId:1};d.cityDefense={autoEnabled:false,nextAt:0,wave:0,wins:0,incoming:null,battle:null,reports:[]};
    return {id:idFor(node.id),name:node.name,node:node.id,x:node.x,y:node.y,capital:false,createdAt:now,data:d};
  }
  function init(s,legacy=[]){
    if(s.realm===undefined){
      const now=s.last||Date.now();s.realm={version:1,activeCity:'capital',capital:'capital',cities:{capital:{id:'capital',name:'青溪城',node:'home',x:32,y:32,capital:true,createdAt:now,data:pick(s)}},heroLocations:Object.fromEntries(s.generals.map(id=>[id,'capital'])),wildOwners:Object.fromEntries(Object.keys(s.conquered||{}).filter(id=>id.startsWith('wild_')).map(id=>[id,'capital'])),logistics:[],logisticsSeq:0,logisticsReports:[]};
      for(const n of legacy)if(n&&s.conquered?.[n.id]&&!s.realm.cities[idFor(n.id)])s.realm.cities[idFor(n.id)]=empty(s,n,now);
    }

  }
  const list=s=>Object.values(s.realm?.cities||{});
  const current=s=>s.realm?.cities?.[s.realm.activeCity];
  const scope=(s,c)=>c.id===s.realm.activeCity?pick(s):c.data;
  function valid(s,checkCity){
    const r=s.realm;if(!object(r)||r.version!==1||r.capital!=='capital'||!object(r.cities)||!r.cities[r.activeCity]||!r.cities.capital||list(s).length<1||list(s).length>22||!object(r.heroLocations)||!object(r.wildOwners)||!Array.isArray(r.logistics)||r.logistics.length>100||!integer(r.logisticsSeq)||!Array.isArray(r.logisticsReports)||r.logisticsReports.length>30)return false;
    const nodes=new Set(),coords=new Set(),staff=new Set(),deployed=new Set();
    for(const c of list(s)){if(!object(c)||!object(c.data))return false;const d=scope(s,c);for(const id of [d.governor,...Object.values(d.cityRoles||{})].filter(Boolean)){if(staff.has(id)||r.heroLocations[id]!==c.id)return false;staff.add(id);}}
    for(const c of list(s)){
      if(!object(c)||r.cities[c.id]!==c||typeof c.id!=='string'||!(c.id==='capital'||/^city_(?:[a-zA-Z0-9_]+)$/.test(c.id))||typeof c.name!=='string'||!c.name.length||c.name.length>20||typeof c.node!=='string'||!Number.isInteger(c.x)||!Number.isInteger(c.y)||c.x<0||c.x>63||c.y<0||c.y>63||typeof c.capital!=='boolean'||c.capital!==(c.id==='capital')||!integer(c.createdAt)||!object(c.data)||nodes.has(c.node)||coords.has(c.x+':'+c.y))return false;
      if(c.id==='capital'&&(c.node!=='home'||c.x!==32||c.y!==32))return false;
      if(c.id!=='capital'&&c.id!==idFor(c.node))return false;nodes.add(c.node);coords.add(c.x+':'+c.y);
      const d=scope(s,c);if(!checkCity(c,d))return false;
      for(const e of [...(d.expedition?[d.expedition]:[]),...(d.expeditions||[]),...Object.values(d.garrisons||{}),...(d.cityDefense?.battle?[d.cityDefense.battle]:[])]){if(r.heroLocations[e.general]!==c.id||deployed.has(e.general)||staff.has(e.general)&&!(e===d.cityDefense?.battle&&e.general===d.governor))return false;deployed.add(e.general);if(e.sourceCity!==undefined&&e.sourceCity!==c.id)return false;}
    }
    if(!s.generals.every(id=>typeof r.heroLocations[id]==='string'&&(r.cities[r.heroLocations[id]]||r.heroLocations[id]==='transit'))||Object.keys(r.heroLocations).some(id=>!s.generals.includes(id)))return false;
    if(Object.entries(r.wildOwners).some(([id,city])=>!id.startsWith('wild_')||!s.conquered[id]||!r.cities[city]))return false;
    const jobIds=new Set();for(const j of r.logistics){if(!object(j)||typeof j.id!=='string'||!/^logistics_\d+$/.test(j.id)||jobIds.has(j.id)||Number(j.id.slice(10))>r.logisticsSeq||!r.cities[j.sourceCity]||!r.cities[j.destinationCity]||j.sourceCity===j.destinationCity||!['transport','redeploy'].includes(j.kind)||!['outbound','return'].includes(j.phase)||!integer(j.start)||!integer(j.end)||j.end<=j.start||!integer(j.seconds)||j.seconds<1||!object(j.army)||Object.entries(j.army).some(([id,n])=>!Object.hasOwn(s.army,id)||!integer(n))||!Object.values(j.army).some(n=>n>0)||!object(j.cargo)||Object.entries(j.cargo).some(([id,n])=>!Object.hasOwn(s.res,id)||!integer(n))||typeof j.general!=='string'||j.general&&(!s.generals.includes(j.general)||deployed.has(j.general)||staff.has(j.general)||r.heroLocations[j.general]!=='transit')||typeof j.delivered!=='boolean'||typeof j.cancelled!=='boolean'||j.delivered!==(j.kind==='transport'&&j.phase==='return'&&!j.cancelled)||j.phase==='outbound'&&j.cancelled||j.kind==='redeploy'&&j.phase==='return'&&!j.cancelled)return false;jobIds.add(j.id);if(j.general)deployed.add(j.general);}
    if(s.generals.some(id=>r.heroLocations[id]==='transit'&&!r.logistics.some(j=>j.general===id)))return false;
    return r.logisticsReports.every(j=>object(j)&&typeof j.id==='string'&&typeof j.kind==='string'&&typeof j.sourceCity==='string'&&typeof j.destinationCity==='string'&&integer(j.at)&&typeof j.text==='string'&&j.text.length<=200);
  }
  return {fields,clone,pick,capture,activate,empty,init,list,current,scope,idFor,valid};
})();
