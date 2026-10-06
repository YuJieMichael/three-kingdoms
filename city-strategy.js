'use strict';
// Fixed city identities; these production/march coefficients are trial values.
// Derive from the original map node ID, never the player name, hall level or save state.
const CityStrategy=(()=>{
  const make=(id,name,description,production={},marchFactor=1)=>Object.freeze({id,name,description,production:Object.freeze({food:1,wood:1,stone:1,iron:1,gold:1,...production}),marchFactor});
  const profiles=Object.freeze({
    balanced:make('balanced','均衡城','资源与行军采用普通规则。主城和平地自建城保持均衡。'),
    granary:make('granary','粮城','本城粮食毛产量 +20%，在扣除驻军与在途队伍维护前计算；适合作为养兵与军粮补给基地。',{food:1.2}),
    mine:make('mine','矿城','本城木材、石料、铁锭毛产量 +15%；适合作为建设与器械补给基地。',{wood:1.15,stone:1.15,iron:1.15}),
    pass:make('pass','关隘','从本城新派出的队伍行军时间 −20%；适合作为前沿出征与接应基地。既有在途队伍按出发时的时间结算。',{},.8)
  });
  // Every ordinary capturable city in the current map has an explicit assignment.
  // New designed cities register here; an unassigned city keeps ordinary rules.
  const roles=Object.freeze({fort:'granary',yellow_qingshi:'granary',yellow_baisha:'mine',yellow_chigang:'pass'});
  function profile(nodeOrCity){
    const c=typeof nodeOrCity==='string'?{id:nodeOrCity}:nodeOrCity;
    if(!c||typeof c!=='object'||c.capital===true||c.id==='capital'||c.id==='home')return profiles.balanced;
    const node=typeof c.node==='string'?c.node:typeof c.id==='string'?c.id.replace(/^city_/,''):'';
    if(node==='home'||node.startsWith('wild_'))return profiles.balanced;
    return profiles[roles[node]]||profiles.balanced;
  }
  function summary(city){const p=profile(city);return p.name+' · '+({balanced:'普通资源与行军规则',granary:'本城粮食毛产量 +20%',mine:'本城木石铁毛产量 +15%',pass:'本城新派队伍行军时间 −20%'}[p.id]);}
  function marchSeconds(base,city){return Math.max(1,Math.ceil(Math.max(0,Number(base)||0)*profile(city).marchFactor));}
  return Object.freeze({profiles,roles,profile,summary,marchSeconds});
})();
