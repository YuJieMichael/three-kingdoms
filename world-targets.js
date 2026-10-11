'use strict';
// Read-only map and hero projections. Coordinates come only from already visible sources.
const WorldTargets=(()=>{
  const filters=['training','jewels','gold','heroes'];
  const point=p=>p&&Number.isFinite(p.x)&&Number.isFinite(p.y)&&p.x>=0&&p.x<64&&p.y>=0&&p.y<64;
  function init(s){if(s.targetFavorites===undefined&&s.version!==undefined)s.targetFavorites=[];}
  function valid(s,ids){const a=s.targetFavorites;return Array.isArray(a)&&a.length<=20&&new Set(a).size===a.length&&a.every(id=>typeof id==='string'&&(ids.includes(id)||/^wild_(?:[0-9]|[1-5][0-9]|6[0-3])_(?:[0-9]|[1-5][0-9]|6[0-3])$/.test(id)));}
  function nearby(s,filter,center,api){if(!filters.includes(filter)||!point(center))return [];
    const candidates=new Map(),add=n=>{if(n&&point(n)&&api.visible(n.id)&&n.id!=='home'&&!n.ownCity&&!s.conquered[n.id])candidates.set(n.id,n);};
    if(filter==='training'||filter==='jewels')for(let y=Math.max(0,Math.floor(center.y)-6);y<=Math.min(63,Math.floor(center.y)+6);y++)for(let x=Math.max(0,Math.floor(center.x)-6);x<=Math.min(63,Math.floor(center.x)+6);x++){const n=api.tile(x,y);if(n?.wild&&n.level>0)add(n);}
    for(const n of api.fixed)if(filter!=='heroes'||n.hero)add(n);
    if(filter==='heroes')for(const n of api.heroes||[])add(n);
    return [...candidates.values()].filter(n=>filter!=='gold'||n.faction==='yellow_turban'||n.publicGold).map(n=>({...api.project(n),distance:Math.hypot(n.x-center.x,n.y-center.y)})).sort((a,b)=>a.distance-b.distance||a.id.localeCompare(b.id));
  }
  const trainingStages={beginner:[1,3],advanced:[4,6],famous:[7,10]};
  function training(s,stage,center,api){
    if(!Object.hasOwn(trainingStages,stage)||!point(center))return [];
    const [min,max]=trainingStages[stage],eligible=n=>n?.wild&&!n.factionCamp&&point(n)&&Math.abs(n.x-center.x)<=6&&Math.abs(n.y-center.y)<=6&&n.level>=min&&n.level<=max&&!api.blocked(n);
    const rows=nearby(s,'training',center,{tile:(x,y)=>{const n=api.tile(x,y);return eligible(n)?n:null;},fixed:(api.fixed||[]).filter(eligible),visible:api.visible,project:n=>({id:n.id,name:n.name,level:n.level,intel:api.intel(n)})});
    return rows.sort((a,b)=>a.level-b.level||a.distance-b.distance||a.id.localeCompare(b.id)).slice(0,5).map(r=>({...r,reason:r.intel==='unknown'?'公开等级符合阶段 · 先侦察，再配兵':'公开等级符合阶段 · 查看情报后配兵'}));
  }
  function paths(jobs,now,api){return jobs.flatMap((j,i)=>{const target=j.target||(j.destinationCity?api.city(j.destinationCity):api.node(j.node)),origin=j.origin||api.city(j.sourceCity);if(!point(target)||!point(origin)||!Number.isFinite(j.start)||!Number.isFinite(j.end))return [];
    const returning=j.phase==='return',from=returning?(j.pathStart||target):origin,to=returning?origin:target,progress=Math.max(0,Math.min(1,(now-j.start)/Math.max(1,j.end-j.start)));
    return [{id:j.id||'march_'+i,node:j.node||target.node,kind:j.kind||'expedition',general:j.general||'',phase:j.phase,from:{x:from.x,y:from.y},to:{x:to.x,y:to.y},progress,position:{x:from.x+(to.x-from.x)*progress,y:from.y+(to.y-from.y)*progress},end:j.end}];
  });}
  function validPathStart(j){return j.pathStart===undefined||j.pathStart===null||j.phase==='return'&&point(j.pathStart)&&Object.keys(j.pathStart).length===2;}
  function turnaround(j,now,target){const origin=j.origin;if(!point(origin)||!point(target))return null;const p=Math.max(0,Math.min(1,(now-j.start)/Math.max(1,j.end-j.start)));return {x:origin.x+(target.x-origin.x)*p,y:origin.y+(target.y-origin.y)*p};}
  return {init,valid,nearby,training,paths,filters,validPathStart,turnaround};
})();
const HeroCatalog=(()=>{
  function roster(s,filter,api){if(!['all','march','domestic','idle','captives'].includes(filter))return [];
    const rows=s.generals.map(id=>{const role=api.role(id),busy=api.busy(id);return {id,name:api.general(id).name,home:api.home(id),role:role||'',status:busy?'march':role?'domestic':'idle',kind:'owned'};});
    const captiveRows=[...(s.wildGenerals?.captives||[]).filter(c=>Date.now()-c.at<GovernanceSystem.DAY).map(c=>({id:c.id,name:c.hero.name,kind:'wild',status:'captives',home:'',role:'',line:c.line})),...(s.heroService?.captives||[]).filter(c=>Date.now()-c.at<GovernanceSystem.DAY).map(c=>({id:c.id,name:c.hero.name,kind:'defeated',status:'captives',home:'',role:''})),...NamedGarrison.ids.filter(id=>s.realm.namedCities.garrisons[id].captive).map(id=>({id:NamedGarrison.generals[id].id,node:id,name:NamedGarrison.generals[id].name,kind:'city',status:'captives',home:'',role:''}))];
    return filter==='captives'?captiveRows:filter==='all'?rows:rows.filter(r=>r.status===filter);
  }
  function codex(s,api){const wild=HeroSystem.wild.activeDefinitions().map(d=>{const rumor=s.wildGenerals.rumors.find(r=>r.line===d.line),c=rumor&&s.wildGenerals.captives.find(c=>c.id===rumor.id),expired=c&&Date.now()-c.at>=GovernanceSystem.DAY,status=expired?'released':rumor?.status||'undiscovered',owned=status==='recruited'&&s.generals.includes(rumor.id),active=status==='active'&&!s.conquered[rumor.node],level=c?s.captureLevels[c.id]?.level||HeroSystem.wild.recruitmentLevel(d):HeroSystem.wild.recruitmentLevel(d),rank=HeritageSystem.recruitmentQuote(s,level);
      return {id:d.line,kind:'wild',name:d.name,title:d.title,clue:d.region+' · '+d.fieldLevel+'级野地',status,heroId:owned||status==='captive'?rumor.id:null,node:active?rumor.node:null,level,nobleName:rank.nobleName,cost:{gold:d.gold,jewels:{...d.jewels}},minInn:d.minInn||1,portraitOwned:HeroSystem.wild.portraitOwned(s,d.line),reason:rank.reason||HeroSystem.wild.unlockReason(s,d)};});
    const cities=NamedGarrison.ids.map(id=>{const d=NamedCityData.definition(id),gen=NamedGarrison.generals[id],r=s.realm.namedCities.garrisons[id],owned=s.generals.includes(gen.id),level=s.captureLevels?.[gen.id]?.level||(id==='named_wancheng'||id==='named_beihai'?65:70),rank=HeritageSystem.recruitmentQuote(s,level);
      return {id,kind:'city',name:gen.name,title:gen.title,clue:d.name+' · 完成第三章后发现',status:owned?'recruited':r.captive?'captive':r.recruited?'released':'garrison',heroId:owned||r.captive?gen.id:null,node:api.visible(id)?id:null,level,nobleName:rank.nobleName,cost:{gold:0,jewels:{}},reason:rank.reason,captureBelow:30};});
    return [...wild,...cities];
  }
  return {roster,codex};
})();
