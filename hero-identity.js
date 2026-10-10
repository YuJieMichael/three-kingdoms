'use strict';
// Identity is derived from recruitment provenance, never from the displayed name.
const HeroIdentity=(()=>{
  const aliases=Object.freeze({warrior:'weiyan',strategist:'xushu'});
  const garrisonKeys=Object.freeze({named_xiaopei:'zhangfei',named_wancheng:'dianwei',named_xiapi:'lvbu',named_beihai:'taishici'});
  const matches=(hero,fields)=>Object.entries(fields).every(([k,v])=>hero[k]===v);
  function key(s,id){
    if(!s||!Array.isArray(s.generals)||!s.generals.includes(id)||!Array.isArray(s.customGenerals))return '';
    const g=s.customGenerals.find(g=>g?.id===id);if(!g)return '';
    if(g.origin==='wild'){
      const w=s.wildGenerals,d=HeroSystem.wild.definitions.find(d=>d.line===g.wildLine);
      if(!d?.historical||!Array.isArray(w?.recruited)||!w.recruited.includes(id)||!Array.isArray(w.rumors))return '';
      const r=w.rumors.find(r=>r?.id===id&&r.line===d.line&&r.status==='recruited');
      const sequence=typeof id==='string'&&/^local_\d+$/.test(id)?Number(id.slice(6))-1000000000000000:0;
      if(!r||!Number.isSafeInteger(w.seq)||w.seq<1||w.seq>1000000||!Number.isSafeInteger(sequence)||sequence<1||sequence>w.seq)return '';
      const node=/^wild_(\d{1,2})_(\d{1,2})$/.exec(r.node||'');
      if(!node||+node[1]>63||+node[2]>63||r.node!=='wild_'+Number(node[1])+'_'+Number(node[2]))return '';
      if(!matches(g,{name:d.name,title:d.title,type:'将',level:d.level,atk:d.atk,def:d.def,pol:d.pol,wis:d.wis,lead:d.level*10,price:d.gold,bonus:d.bonus,sourceNode:r.node}))return '';
      return Object.hasOwn(aliases,d.line)?aliases[d.line]:d.line;
    }
    for(const [node,identity]of Object.entries(garrisonKeys)){
      const d=NamedGarrison.generals[node],r=s.realm?.namedCities?.garrisons?.[node];
      if(d?.id===id&&r?.recruited===true&&r.captive===false&&matches(g,NamedGarrison.hero(node)))return identity;
    }
    return '';
  }
  return {key};
})();
