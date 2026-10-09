'use strict';
// City specialty buildings (design/quick-specs/city-specialty-and-hero-growth-2026-10-09.md): one 5-level line per city,
// chosen by the city's strategy, opened at hall 10. State: s.realm.specialties[cityId]={level,target,end}.
const CitySpecialty=(()=>{
  const MAX=5,HOUR=3600000;
  const lines=Object.freeze({
    granary:{id:'granary',name:'太仓',desc:'本城粮食 +5%；官府自动调粮损耗 −2%（取各城最高）',production:{food:.05},foodLoss:.02},
    mine:{id:'mine',name:'冶署',desc:'本城木材、石料、铁锭 +4%；全国锻造装备费用 −5%（取各城最高）',production:{wood:.04,stone:.04,iron:.04},forge:.05},
    pass:{id:'pass',name:'雄关',desc:'本城出发的部队行军时间 −4%',march:.04},
    balanced:{id:'balanced',name:'都护府',desc:'本城全部产出 +2%；主城 5 级时城池名额 +1',production:{food:.02,wood:.02,stone:.02,iron:.02,gold:.02},capitalSlot:true}
  });
  const object=v=>!!v&&typeof v==='object'&&!Array.isArray(v),int=n=>Number.isSafeInteger(n)&&n>=0;
  function init(s){if(s?.realm&&s.realm.specialties===undefined)s.realm.specialties={};}
  function valid(s){const sp=s?.realm?.specialties;if(sp===undefined)return true;if(!object(sp))return false;return Object.entries(sp).every(([id,r])=>Object.hasOwn(s.realm.cities||{},id)&&object(r)&&Object.keys(r).length===3&&int(r.level)&&r.level<=MAX&&int(r.target)&&r.target<=MAX&&r.target>=r.level&&r.target-r.level<=1&&int(r.end));}
  const record=(s,id)=>s?.realm?.specialties?.[id];
  function level(s,id,now){const r=record(s,id);if(!r)return 0;return r.target>r.level&&r.end<=now?r.target:r.level;}
  function lineFor(profile){return lines[profile?.id]||lines.balanced;}
  // Applied on top of CityStrategy.profile(city) by the engine's cityStrategy wrapper.
  function apply(profile,s,city,now){const id=city?.id||s?.realm?.activeCity,lv=level(s,id,now);if(!lv)return profile;const line=lineFor(profile),production={...profile.production};for(const [k,n] of Object.entries(line.production||{}))production[k]=(production[k]??1)*(1+n*lv);return {...profile,production,marchFactor:profile.marchFactor*(1-(line.march||0)*lv),specialty:{name:line.name,level:lv}};}
  function cost(next){return {blueprint:2*next,resources:{food:200000*next*next,wood:200000*next*next,stone:200000*next*next,iron:200000*next*next,gold:100000*next},hours:12*next};}
  function quote(s,id,profile,now,hall){const r=record(s,id),lv=level(s,id,now),line=lineFor(profile),next=lv+1,c=cost(next),busy=r&&r.target>lv;
    const reason=hall<10?'官府 10 级后开放':lv>=MAX?'已达 5 级':busy?'正在升级':((s.inventory?.blueprint||0)<c.blueprint)?'图纸不足（需要 '+c.blueprint+' 张）':Object.entries(c.resources).some(([k,n])=>(s.res?.[k]||0)<n)?'资源不足':'';
    return {id,line,level:lv,next,cost:c,end:busy?r.end:0,reason};}
  function start(s,id,profile,now,hall){const q=quote(s,id,profile,now,hall);if(q.reason)return q.reason;s.inventory.blueprint-=q.cost.blueprint;for(const [k,n] of Object.entries(q.cost.resources))s.res[k]-=n;s.realm.specialties[id]={level:q.level,target:q.next,end:now+q.cost.hours*HOUR};return null;}
  function settle(s,now){for(const r of Object.values(s?.realm?.specialties||{}))if(r.target>r.level&&r.end<=now)r.level=r.target;}
  const best=(s,key,now,api)=>Math.max(0,...Object.keys(s?.realm?.specialties||{}).filter(id=>api.lineOf(id)===key).map(id=>level(s,id,now)));
  const foodLoss=(s,now,api)=>Math.max(0,.1-lines.granary.foodLoss*best(s,'granary',now,api));
  const forgeDiscount=(s,now,api)=>lines.mine.forge*best(s,'mine',now,api);
  const extraSlot=(s,now)=>level(s,'capital',now)>=MAX?1:0;
  return {MAX,lines,init,valid,level,lineFor,apply,cost,quote,start,settle,foodLoss,forgeDiscount,extraSlot};
})();
