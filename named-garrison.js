'use strict';
// Named cities held by famous generals (design/quick-specs/named-generals-siege-2026-10-09.md).
// While the general's loyalty is 30 or more the city cannot be taken; a win below 30 takes the city and the general.
// Pure rules over s.realm.namedCities.garrisons; Game owns combat, timing and persistence.
const NamedGarrison=(()=>{
  const DAY=86400000,HOUR=3600000;
  const C=Object.freeze({captureBelow:30,recoverPerDay:5,abandonMs:72*HOUR,winLoss:8,gateBonus:3,raidLoss:5,bleedLoss:3,bleedShare:.5,
    floorAfterWin:.3,refillPerHour:.1,regroupMs:12*HOUR,prefectureFactor:.5,supplyCutPerTile:3,supplyCutMaxTiles:5,supplyCutRadius:2,persuadeLoss:10,persuadeGold:30000,sowBase:4,sowCooldown:DAY});
  // Generals are original stat blocks for historical figures; ids follow the custom-general pattern.
  const generals=Object.freeze({
    named_jiangling:{id:'local_7100000000000005',name:'关羽',title:'江陵守将',type:'骑',level:20,atk:105,def:100,pol:66,wis:74,bonus:'cavalry',attack:1.25,defense:1.2,desc:'河东关云长，镇守江陵，长刀与铁骑护卫城池。'},
    named_xiaopei:{id:'local_7100000000000001',name:'张飞',title:'小沛守将',type:'枪',level:20,atk:96,def:72,pol:28,wis:38,bonus:'spear',attack:1.25,defense:1.2,desc:'燕人张翼德，据小沛厉兵秣马，长枪阵势如山。'},
    named_wancheng:{id:'local_7100000000000002',name:'典韦',title:'宛城守将',type:'盾',level:20,atk:90,def:94,pol:20,wis:34,bonus:'shield',attack:1.2,defense:1.3,desc:'古之恶来，持双戟守宛城，刀盾兵难以撼动。'},
    named_xiapi:{id:'local_7100000000000003',name:'吕布',title:'下邳守将',type:'骑',level:25,atk:100,def:86,pol:24,wis:40,bonus:'cavalry',attack:1.4,defense:1.25,desc:'人中吕布，坐镇下邳，铁骑冲阵无人能挡。'},
    named_beihai:{id:'local_7100000000000004',name:'太史慈',title:'北海守将',type:'弓',level:22,atk:92,def:78,pol:52,wis:66,bonus:'archer',attack:1.3,defense:1.2,desc:'东莱太史慈，北海城头箭不虚发。'}
  });
  const ids=Object.keys(generals);
  const object=v=>!!v&&typeof v==='object'&&!Array.isArray(v),int=n=>Number.isSafeInteger(n)&&n>=0;
  const has=id=>Object.hasOwn(generals,id);
  const fullArmy=id=>{const n=NamedCityData.nodes.find(x=>x.id===id);return n?{...n.army}:{};};
  const total=a=>Object.values(a||{}).reduce((x,y)=>x+y,0);
  function fresh(id,now){return {loyalty:100,updatedAt:now,pressureAt:0,army:fullArmy(id),armyAt:now,captive:false,recruited:false,persuadeDay:-1,sowAt:0};}
  function init(s,now=Date.now()){const n=s?.realm?.namedCities;if(!n)return;if(n.garrisons===undefined)n.garrisons={};for(const id of ids)if(!object(n.garrisons[id]))n.garrisons[id]=fresh(id,now);}
  function valid(s){const g=s?.realm?.namedCities?.garrisons;if(g===undefined)return true;if(!object(g)||Object.keys(g).length!==ids.length||!ids.every(id=>object(g[id])))return false;return ids.every(id=>{const r=g[id],full=fullArmy(id);return Object.keys(r).length===9&&int(r.loyalty)&&r.loyalty<=100&&int(r.updatedAt)&&int(r.pressureAt)&&object(r.army)&&Object.keys(r.army).every(k=>Object.hasOwn(full,k)&&int(r.army[k])&&r.army[k]<=full[k])&&int(r.armyAt)&&typeof r.captive==='boolean'&&typeof r.recruited==='boolean'&&Number.isSafeInteger(r.persuadeDay)&&r.persuadeDay>=-1&&int(r.sowAt);});}
  const record=(s,id)=>s?.realm?.namedCities?.garrisons?.[id];
  const done=r=>r.captive||r.recruited;
  // Wild tiles the player owns near the city cut its supply lines.
  function supplyCut(s,id,api){const n=api.site(id);if(!n)return 0;let k=0;for(const tile of Object.keys(s.landClaims||{})){const m=/^wild_(\d+)_(\d+)$/.exec(tile);if(m&&s.conquered?.[tile]&&Math.max(Math.abs(+m[1]-n.x),Math.abs(+m[2]-n.y))<=C.supplyCutRadius)k++;}return Math.min(C.supplyCutMaxTiles,k);}
  // Project loyalty and troops to `now` without writing: daily recovery minus supply cuts; 72 h without pressure resets the city.
  function project(s,id,now,api){const r=record(s,id);if(!r||done(r))return r?{...r,army:{...r.army}}:null;const p={...r,army:{...r.army}};
    const cut=supplyCut(s,id,api);if(cut>0)p.pressureAt=Math.max(p.pressureAt,now);
    if(p.pressureAt&&now-p.pressureAt>C.abandonMs)return {...fresh(id,now),persuadeDay:p.persuadeDay,sowAt:p.sowAt};
    const days=Math.floor((now-p.updatedAt)/DAY);if(days>0){p.loyalty=Math.max(0,Math.min(100,p.loyalty+days*(C.recoverPerDay-C.supplyCutPerTile*cut)));p.updatedAt+=days*DAY;}
    const hours=Math.floor((now-p.armyAt)/HOUR);if(hours>0){const full=fullArmy(id);for(const k of Object.keys(full))p.army[k]=Math.min(full[k],(p.army[k]||0)+Math.ceil(full[k]*C.refillPerHour*hours));p.armyAt+=hours*HOUR;}
    return p;}
  function settleTime(s,id,now,api){const r=record(s,id);if(!r||done(r))return r;Object.assign(r,project(s,id,now,api));return r;}
  function army(s,id,now,api){const r=project(s,id,now,api);return r&&!done(r)?{...r.army}:fullArmy(id);}
  function commander(id){const g=generals[id];return g?{name:g.name,title:g.title,attack:g.attack,defense:g.defense,order:'hold'}:null;}
  // Called from battle settlement before ownership is decided.
  function settleBattle(s,id,o,now,api){const r=settleTime(s,id,now,api);if(!r||done(r))return null;
    const before=r.loyalty,full=fullArmy(id),capturable=o.won&&o.mode==='occupy'&&before<C.captureBelow;
    const f=NamedCityData.definition(id)?.tier==='prefecture'?C.prefectureFactor:1,drop=n=>{r.loyalty=Math.max(0,r.loyalty-Math.round(n*f));};
    if(o.won&&o.mode==='occupy')drop(C.winLoss+(o.gateBroken?C.gateBonus:0));
    else if(o.won)drop(C.raidLoss);
    else if(o.enemyStart>0&&o.enemyLeft<=o.enemyStart*C.bleedShare)drop(C.bleedLoss);
    if(o.won||before!==r.loyalty)r.pressureAt=now;
    // The general falls back into the inner city with a core of his troops after a lost siege.
    if(o.won){for(const k of Object.keys(full))r.army[k]=Math.ceil(full[k]*C.floorAfterWin);}else r.army=Object.fromEntries(Object.keys(full).map(k=>[k,Math.min(full[k],Math.max(0,Math.round(o.enemyArmyLeft?.[k]??r.army[k])))]));
    r.armyAt=now;if(capturable){r.captive=true;const g=generals[id];HeroSystem.captureLevel(s,g.id,id==='named_wancheng'||id==='named_beihai'?65:70);}
    return {before,after:r.loyalty,capturable};}
  function persuadeQuote(s,id,now,api){const r=project(s,id,now,api),day=Math.floor(now/DAY);if(!r)return {reason:'这座城没有镇守名将'};if(done(r))return {reason:'名将已被俘'};return {cost:C.persuadeGold,loss:C.persuadeLoss,reason:r.persuadeDay===day?'今天已经送过劝降书':s.res.gold<C.persuadeGold?'黄金不足':''};}
  function persuade(s,id,now,api){const q=persuadeQuote(s,id,now,api);if(q.reason)return q.reason;const r=settleTime(s,id,now,api);s.res.gold-=q.cost;r.loyalty=Math.max(0,r.loyalty-q.loss);r.persuadeDay=Math.floor(now/DAY);r.pressureAt=now;return null;}
  function sowQuote(s,id,now,api){const r=project(s,id,now,api);if(!r)return {reason:'这座城没有镇守名将'};if(done(r))return {reason:'名将已被俘'};const advisor=s.cityRoles?.counsellor,wis=advisor?api.general(advisor)?.wis||0:0,loss=C.sowBase+Math.floor(wis/15);return {advisor,loss,reason:!advisor?'需要先任命军师':now-r.sowAt<C.sowCooldown?'离间计冷却中':''};}
  function sow(s,id,now,api){const q=sowQuote(s,id,now,api);if(q.reason)return q.reason;const r=settleTime(s,id,now,api);r.loyalty=Math.max(0,r.loyalty-q.loss);r.sowAt=now;r.pressureAt=now;return null;}
  function status(s,id,now,api){const r=project(s,id,now,api);if(!r)return null;const g=generals[id];return {id,general:g,loyalty:r.loyalty,captureBelow:C.captureBelow,troops:total(r.army),fullTroops:total(fullArmy(id)),captive:r.captive,recruited:r.recruited,supplyCut:supplyCut(s,id,api),abandonAt:r.pressureAt?r.pressureAt+C.abandonMs:0};}
  function hero(id){const g=generals[id];return {id:g.id,name:g.name,title:g.title,type:g.type,level:g.level,atk:g.atk,def:g.def,pol:g.pol,wis:g.wis,lead:g.level*10,price:0,bonus:g.bonus,desc:g.desc};}
  // A won assault leaves the city regrouping for 12 hours before the next attack.
  const regroupUntil=(id,now)=>now+C.regroupMs;
  return {C,generals,ids,has,init,regroupUntil,valid,army,commander,project,settleTime,settleBattle,persuadeQuote,persuade,sowQuote,sow,status,hero,record,supplyCut};
})();
