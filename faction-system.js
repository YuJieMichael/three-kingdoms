'use strict';
// Optional single-player factions. Maps are projections; only tick/settle change the ledger.
const FactionSystem=(()=>{
  const interval=21600000,warning=900000;
  const definitions={yellow:{name:'黄巾余部',army:{militia:80,spear:30,archer:40}},shanyue:{name:'山越',army:{shield:60,spear:50,archer:30}},wuhuan:{name:'乌桓',army:{cavalry:45,spear:30,archer:30}}};
  const object=x=>!!x&&typeof x==='object'&&!Array.isArray(x),int=x=>Number.isSafeInteger(x)&&x>=0;
  const keys=(x,k)=>object(x)&&Object.keys(x).length===k.length&&k.every(n=>Object.hasOwn(x,n));
  const sequence=id=>typeof id==='string'&&/^faction_[1-9]\d*$/.test(id)?Number(id.slice(8)):0;
  const node=id=>typeof id==='string'&&/^wild_\d{1,2}_\d{1,2}$/.test(id)&&id.split('_').slice(1).every(n=>String(Number(n))===n&&Number(n)<64);
  const same=(a,b)=>object(a)&&object(b)&&Object.keys(a).length===Object.keys(b).length&&Object.entries(b).every(([k,v])=>a[k]===v);
  const scope=(s,id)=>id===s.realm.activeCity?s:s.realm.cities[id]?.data;
  function init(s){if(s.realm&&s.realm.factions===undefined)s.realm.factions={version:1,enabled:false,nextAt:0,seq:0,camps:[],last:null};}
  const unlocked=s=>(s.buildings.hall||0)>=5&&s.stats.victories>=1;
  function validMeta(m){return keys(m,['version','id','faction','node','sourceCity','createdAt','level',...(m?.startedAt!==undefined?['startedAt','arriveAt']:[])])&&m.version===1&&int(sequence(m.id))&&sequence(m.id)>0&&Object.hasOwn(definitions,m.faction)&&node(m.node)&&typeof m.sourceCity==='string'&&int(m.createdAt)&&m.level===5&&(m.startedAt===undefined||int(m.startedAt)&&m.startedAt>=m.createdAt+interval&&m.arriveAt===m.startedAt+warning);}
  function spec(m){if(!validMeta(m))return null;return {profile:'faction_'+m.faction,name:definitions[m.faction].name,army:Object.fromEntries(Object.entries(definitions[m.faction].army).map(([id,n])=>[id,n*m.level])),reward:{food:1000*m.level,gold:500*m.level},cost:{gold:0,food:0},xp:m.level*NPCDefenseData.xpPerLevel};}
  function meta(c){return {version:1,id:c.id,faction:c.faction,node:c.node,sourceCity:c.sourceCity,createdAt:c.createdAt,level:5};}
  function matches(s,m){const c=s.realm?.factions?.camps.find(c=>c.id===m?.id);return !!c&&validMeta(m)&&(m.startedAt===undefined||m.startedAt>=c.readyAt)&&['faction','node','sourceCity','createdAt'].every(k=>c[k]===m[k]);}
  function overlay(s,n){if(!n?.wild)return n;const c=s.realm?.factions?.camps.find(c=>c.node===n.id);if(!c)return n;const q=spec(meta(c));return {...n,name:q.name+'营地',level:5,factionCamp:c.id,army:{...q.army},loot:{...q.reward},desc:q.name+'在此扎营；守军5级。侦察后可出征清剿，来袭期间暂停清剿。',reward:'清剿战利品：粮食5000、黄金2500，受部队负重限制。'};}
  function view(s){const f=s.realm.factions;return {enabled:f.enabled,nextAt:f.nextAt,unlocked:unlocked(s),camps:f.camps.map(c=>({...c,name:definitions[c.faction].name,cityName:s.realm.cities[c.sourceCity]?.name||c.sourceCity})),last:f.last?{...f.last}:null};}
  function blockedTargets(s){return new Set([...(s.wildGenerals?.rumors||[]).filter(r=>r.status==='active').map(r=>r.node),...Object.values(s.realm.cities).flatMap(c=>{const d=scope(s,c.id);return [c.node,...(d.expedition?[d.expedition.node]:[]),...(d.expeditions||[]).map(e=>e.node),...Object.keys(d.garrisons||{}),...(d.scoutQueue||[]).map(e=>e.node)];})]);}
  function busy(s,id){const d=scope(s,id);return !d||!!d.cityDefense.incoming||!!d.cityDefense.battle||!!d.battle&&!d.battle.finished||!!s.battlefields?.run?.battle&&!s.battlefields.run.battle.finished;}
  function tick(s,now,api){const f=s.realm.factions;if(!f.enabled||now<f.nextAt)return false;f.nextAt=now+interval;
    if(Object.values(s.realm.cities).some(c=>{const d=scope(s,c.id);return d.cityDefense.incoming?.faction||d.cityDefense.battle?.faction;}))return true;
    if(Object.values(s.realm.cities).some(c=>{const d=scope(s,c.id);return d.cityDefense.battle||d.battle&&!d.battle.finished;})||s.battlefields?.run?.battle&&!s.battlefields.run.battle.finished)return true;
    const blocked=blockedTargets(s),ready=f.camps.filter(c=>c.status==='camp'&&c.readyAt<=now&&!busy(s,c.sourceCity)&&!blocked.has(c.node)).sort((a,b)=>a.readyAt-b.readyAt||a.id.localeCompare(b.id))[0];
    if(ready){const m={...meta(ready),startedAt:now,arriveAt:now+warning};ready.status='incoming';const error=api.request(ready.sourceCity,m);if(error)ready.status='camp';return true;}
    if(f.camps.length>=3||!unlocked(s)||f.seq>=Number.MAX_SAFE_INTEGER)return true;
    const home=s.realm.cities[s.realm.activeCity],candidates=[];for(let y=Math.max(0,home.y-6);y<=Math.min(63,home.y+6);y++)for(let x=Math.max(0,home.x-6);x<=Math.min(63,home.x+6);x++){const distance=Math.hypot(x-home.x,y-home.y);if(distance>6)continue;const n=api.tile(x,y);if(!n?.wild||n.legendSite||n.factionCamp||s.conquered[n.id]||blocked.has(n.id))continue;candidates.push({id:n.id,distance});}
    candidates.sort((a,b)=>a.distance-b.distance||a.id.localeCompare(b.id));if(!candidates.length)return true;const serial=++f.seq;f.camps.push({id:'faction_'+serial,faction:Object.keys(definitions)[(serial-1)%3],node:candidates[0].id,sourceCity:home.id,createdAt:now,readyAt:now+interval,status:'camp'});return true;
  }
  function settle(s,m,won,kind,now){const f=s.realm.factions,c=f.camps.find(c=>c.id===m?.id);if(!matches(s,m)||!c||kind==='defense'&&c.status!=='incoming'||kind==='field'&&c.status!=='camp')return '营地结算已失效';if(won)f.camps=f.camps.filter(x=>x.id!==c.id);else{c.status='camp';c.readyAt=now+interval;}f.last={id:c.id,faction:c.faction,node:c.node,sourceCity:c.sourceCity,at:now,kind,won};return null;}
  function validField(s,e){
    const m=e.faction;if(m===undefined)return true;const q=spec(m);
    if(!q||m.startedAt!==undefined||m.node!==e.node||!s.realm.cities[m.sourceCity]||sequence(m.id)>s.realm.factions.seq)return false;
    if(e.enemySnapshot&&!same(e.enemySnapshot,q.army))return false;
    if(e.enemy&&!same(Object.fromEntries(e.enemy.map(r=>[r.id,r.initial])),q.army))return false;
    if(e.result&&JSON.stringify(e.result.faction)!==JSON.stringify(m))return false;
    if(!e.finished&&e.phase!=='return'&&(!matches(s,m)||s.realm.factions.camps.find(c=>c.id===m.id)?.status!=='camp'))return false;
    return true;
  }
  function valid(s){try{const f=s.realm?.factions;if(!keys(f,['version','enabled','nextAt','seq','camps','last'])||f.version!==1||typeof f.enabled!=='boolean'||!int(f.nextAt)||!int(f.seq)||f.enabled&&f.nextAt===0||!Array.isArray(f.camps)||f.camps.length>3||new Set(f.camps.map(c=>c.id)).size!==f.camps.length||new Set(f.camps.map(c=>c.node)).size!==f.camps.length)return false;
    if(!f.camps.every(c=>keys(c,['id','faction','node','sourceCity','createdAt','readyAt','status'])&&validMeta(meta(c))&&sequence(c.id)<=f.seq&&s.realm.cities[c.sourceCity]&&int(c.readyAt)&&c.readyAt>=c.createdAt+interval&&['camp','incoming'].includes(c.status)))return false;
    if(f.last!==null&&(!keys(f.last,['id','faction','node','sourceCity','at','kind','won'])||!sequence(f.last.id)||sequence(f.last.id)>f.seq||!Object.hasOwn(definitions,f.last.faction)||!node(f.last.node)||!s.realm.cities[f.last.sourceCity]||!int(f.last.at)||!['field','defense'].includes(f.last.kind)||typeof f.last.won!=='boolean'))return false;
    const pending=[];for(const city of Object.values(s.realm.cities)){const d=scope(s,city.id);for(const w of [d.cityDefense.incoming,d.cityDefense.battle])if(w?.faction){if(!validMeta(w.faction)||w.faction.startedAt===undefined||w.faction.sourceCity!==city.id||!matches(s,w.faction))return false;pending.push(w.faction.id);}for(const r of d.cityDefense.reports)if(r.faction&&(!validMeta(r.faction)||sequence(r.faction.id)>f.seq))return false;}
    return pending.length<=1&&f.camps.every(c=>(c.status==='incoming')===(pending.filter(id=>id===c.id).length===1));
  }catch{return false;}}
  return {interval,warning,definitions,init,unlocked,validMeta,spec,meta,matches,overlay,view,blockedTargets,tick,settle,valid,validField,same};
})();
