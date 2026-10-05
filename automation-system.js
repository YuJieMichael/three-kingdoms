'use strict';
// In-game assistant settings and bounded, persistent completion inbox.
const AutomationSystem=(()=>{
  const keys=['food','wood','stone','iron','gold'],focuses=['balanced','economy','military'];
  const military=['training','combat','protection','load','march','riding','shooting','supply','fortification','repair','plunder','leadership','scouting'];
  const defaults=()=>({researchFocus:'balanced',researchPriority:'',reserve:Object.fromEntries(keys.map(k=>[k,0])),notify:true,notices:[],nextId:1});
  const object=x=>!!x&&typeof x==='object'&&!Array.isArray(x);
  function init(s){if(s.automation===undefined)s.automation=defaults();}
  function settingsValid(a){return object(a)&&focuses.includes(a.researchFocus)&&(a.researchPriority===''||Object.hasOwn(ManualData.technology,a.researchPriority))&&typeof a.notify==='boolean'&&object(a.reserve)&&Object.keys(a.reserve).length===keys.length&&keys.every(k=>Number.isSafeInteger(a.reserve[k])&&a.reserve[k]>=0&&a.reserve[k]<=1000000000);}
  function valid(s){const a=s?.automation;return settingsValid(a)&&Array.isArray(a.notices)&&a.notices.length<=30&&a.notices.every(object)&&Number.isSafeInteger(a.nextId)&&a.nextId>=1&&a.nextId<Number.MAX_SAFE_INTEGER&&new Set(a.notices.map(n=>n.id)).size===a.notices.length&&a.notices.every(n=>object(n)&&Number.isSafeInteger(n.id)&&n.id>0&&n.id<a.nextId&&['build','research','train','defense'].includes(n.kind)&&typeof n.text==='string'&&n.text.length>0&&n.text.length<=160&&Number.isSafeInteger(n.at)&&n.at>=0&&n.at<=8640000000000000&&typeof n.read==='boolean');}
  function canSpend(s,cost){return Object.entries(cost).every(([k,v])=>s.res[k]-v>=s.automation.reserve[k]);}
  function rank(s,id){const a=s.automation;if(id===a.researchPriority)return -1;if(a.researchFocus==='balanced')return 0;return military.includes(id)===(a.researchFocus==='military')?0:1;}
  function record(s,kind,q,at){const a=s.automation;if(!a.notify)return;if(a.nextId>=Number.MAX_SAFE_INTEGER-1){a.notices.forEach((n,i)=>n.id=a.notices.length-i);a.nextId=a.notices.length+1;}
    const labels={build:()=>ManualData.buildings[q.id].name+'升至 '+q.level+' 级',research:()=>ManualData.technology[q.id].name+'研究至 '+q.level+' 级',train:()=>ManualData.units[q.id].name+'训练完成 ×'+q.count,defense:()=>ManualData.defenses[q.id].name+'建造完成 ×'+q.count};
    a.notices.unshift({id:a.nextId++,kind,text:labels[kind](),at:Math.floor(at),read:false});a.notices=a.notices.slice(0,30);
  }
  function unread(s){return s.automation.notices.filter(n=>!n.read).length;}
  return {init,valid,settingsValid,canSpend,rank,record,unread,keys,focuses};
})();
