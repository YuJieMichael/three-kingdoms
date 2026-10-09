'use strict';
// Famous-general bonds (design/quick-specs/city-specialty-and-hero-growth-2026-10-09.md): owning both generals of a pair
// gives both a bonus; when one of them leads the army the battle part of the bonus doubles.
const HeroBonds=(()=>{
  // Disabled 2026-10-09 (owner): pairs lacked historical ties. Rebuild after more generals (design/backlog/hero-roster-and-bonds.md).
  const archived=Object.freeze([
    {id:'eelai',name:'虎痴恶来',members:['id:local_7100000000000002','id:local_7100000000000001'],desc:'枪兵、刀盾兵受到伤害 −8%',defense:{spear:.08,shield:.08}},
    {id:'archers',name:'弓马双绝',members:['line:huangzhong','id:local_7100000000000004'],desc:'弓箭兵攻击 +8%',attack:{archer:.08}},
    {id:'riders',name:'骁将并驰',members:['id:local_7100000000000003','line:machao'],desc:'轻骑兵、铁骑兵攻击 +8%',attack:{cavalry:.08,heavy:.08}},
    {id:'sages',name:'卧龙凤雏',members:['line:pangtong','line:strategist'],desc:'两人内政、智谋各 +10',stats:{pol:10,wis:10}},
    {id:'jiangdong',name:'江东双璧',members:['line:zhouyu','line:ganning'],desc:'全军攻击 +4%',attackAll:.04},
    {id:'liangjiang',name:'五子良将',members:['line:zhangliao','line:zhaoyun'],desc:'出征行军时间 −5%',march:.05}
  ]);
  const bonds=Object.freeze([]);
  function memberId(s,m){const [kind,v]=m.split(':');if(kind==='id')return s.generals?.includes(v)?v:'';const g=(s.customGenerals||[]).find(g=>g.wildLine===v);return g&&s.generals?.includes(g.id)?g.id:'';}
  function active(s){return bonds.map(b=>({...b,ids:b.members.map(m=>memberId(s,m))})).filter(b=>b.ids.every(Boolean));}
  function statBonus(s,id){const out={};for(const b of active(s))if(b.stats&&b.ids.includes(id))for(const [k,n] of Object.entries(b.stats))out[k]=(out[k]||0)+n;return out;}
  // Battle factors for the army led by `leader`.
  function battle(s,leader){const out={attack:{},defense:{},attackAll:0,march:0};for(const b of active(s)){const f=b.ids.includes(leader)?2:1;for(const [u,n] of Object.entries(b.attack||{}))out.attack[u]=(out.attack[u]||0)+n*f;for(const [u,n] of Object.entries(b.defense||{}))out.defense[u]=(out.defense[u]||0)+n*f;out.attackAll+=(b.attackAll||0)*f;out.march+=(b.march||0)*f;}out.march=Math.min(.3,out.march);return out;}
  return {bonds,archived,active,statBonus,battle};
})();
