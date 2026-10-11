"use strict";
const HeroTraits=(()=>{
  const ids=['guanyu','menghuo','zhurong'];
  function profile(s,id){const identity=HeroIdentity.key(s,id);return {version:1,id:ids.includes(identity)?identity:''};}
  function validProfile(p){return !!p&&typeof p==='object'&&!Array.isArray(p)&&Object.keys(p).length===2&&p.version===1&&(p.id===''||ids.includes(p.id));}
  function modifiers(p,unitId,command,targetKind){const v={gateDamage:1,damageTaken:1,initiative:1};if(!validProfile(p))return v;const u=ManualData.units[unitId];
    if(p.id==='guanyu'&&targetKind==='gate'&&u&&u.kind!=='machine'&&u.range<1000)v.gateDamage=1.08;
    if(p.id==='menghuo'&&unitId==='shield'&&command==='hold')v.damageTaken=.95;
    if(p.id==='zhurong'&&unitId==='archer')v.initiative=1.05;return v;
  }
  function describe(p,hero){const text={guanyu:'武圣 · 近战攻门 +8%',menghuo:'蛮王 · 刀盾固守减伤 5%（灵斩折损除外）',zhurong:'火神 · 弓队先手 +5%'};return text[p?.id]||(ManualData.units[hero?.bonus]?'兵种专长 · '+ManualData.units[hero.bonus].name:'按已有专长与计谋指挥');}
  return {profile,validProfile,modifiers,describe};
})();
