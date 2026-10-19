'use strict';
// v0.36.0: recommended army for a march (design/quick-specs/progression-rework-2026-10-18.md §6). Reads only what the player
// knows (intel, public chapter garrisons, walls) and what is in the city; never changes the save.
const ArmyAdvice=(()=>{
  const share=(army,ids)=>{const total=Object.entries(army).filter(([id])=>!['scout','worker','wagon','ram','catapult','ballista'].includes(id)).reduce((n,[,v])=>n+v,0);return total?ids.reduce((n,id)=>n+(army[id]||0),0)/total:0;};
  // Known enemy counts: exact intel or public garrison; band intel uses the band middle; type-only intel gives presence only.
  function enemy(game,id,mode){
    const intel=game.intel(id),info=game.attackInfo(id,mode);
    if(intel?.public||intel?.exact)return {army:intel.army||info.army,known:'exact'};
    if(intel?.bands)return {army:Object.fromEntries(Object.entries(intel.bands).map(([k,b])=>[k,Math.round(((b.min||0)+(b.max||0))/2)])),known:'bands'};
    if(intel?.types)return {army:Object.fromEntries(intel.types.map(k=>[k,1])),known:'types'};
    return {army:null,known:'none'};
  }
  function recommend(game,id,mode='occupy',generalId=''){
    const n=game.getNode(id);if(!n)return null;const s=game.state,have=s.army,reasons=[],want={};
    const add=(unit,count,reason)=>{if(count>0){want[unit]=Math.max(want[unit]||0,Math.min(have[unit]||0,Math.ceil(count)));reasons.push(reason);}};
    const e=enemy(game,id,mode),f=mode==='occupy'?n.fortification:null,walls=f?game.wallsPreview?.(id):null,soldiers=['spear','shield','archer','cavalry','heavy'].reduce((sum,k)=>sum+(have[k]||0),0);
    if(e.known==='none')reasons.push('还没有敌情：先派斥候侦察，再按敌军兵种配兵。');
    if(e.army){
      const cav=share(e.army,['cavalry','heavy']),arc=share(e.army,['archer']),shd=share(e.army,['shield']);
      if(cav>=.25)add('spear',soldiers*.35,'敌方骑兵约占 '+Math.round(cav*100)+'%：带枪兵（枪克骑，伤害 ×1.6）。');
      if(arc>=.4)add('cavalry',Math.min(have.cavalry||0,soldiers*.3),'敌方弓兵约占 '+Math.round(arc*100)+'%：轻骑冲阵克弓（伤害 ×1.65）。');
      if(shd>=.3)reasons.push('敌方盾兵约占 '+Math.round(shd*100)+'%：弓兵打盾兵只有一半伤害，主攻交给枪兵、骑兵。');
      if(cav<.25&&shd<.3)add('archer',soldiers*.5,'敌方以步兵、弓兵为主：弓兵为主力，射程最远。');
    }
    if(f){
      const gate=walls?.gate??f.hp,catapults=Math.ceil(gate/(1200*5)),rams=Math.ceil(gate/(800*5));
      if((have.catapult||0)+(have.ram||0)>0){if(have.catapult)add('catapult',catapults,'城门 '+gate.toLocaleString('zh-CN')+'：投石车每辆每回合约 1,200，约需 '+catapults+' 辆在 5 回合内破门（默认打城门，会先前移到射程内）。');if(have.ram)add('ram',rams,'冲车每辆每回合约 800，约需 '+rams+' 辆；要靠近城门才能撞门，需要前排保护。');}
      else reasons.push('城门 '+gate.toLocaleString('zh-CN')+'：没有攻城器械时只能靠步弓慢慢磨门，伤亡会更大。');
      if(f.tower)add('shield',soldiers*.2,'有箭塔射击：带盾兵站前排承受箭雨。');
      if(walls&&(walls.trap||walls.logs||walls.rocks))reasons.push('城防：陷阱 '+walls.trap+'、滚木 '+walls.logs+'、擂石 '+walls.rocks+' 会在接近时一次性杀伤前排；拒马 '+walls.abatis.toLocaleString('zh-CN')+' 点耐久会先挡近战伤害。');
    }
    const task=typeof ChapterTasks!=='undefined'?ChapterTasks.def(id):null;
    if(task&&!ChapterTasks.done(s,id)){
      for(const [group,need] of Object.entries(task.share||{})){const unit=group==='cavalry'?'cavalry':group;add(unit,soldiers*need,'章节任务：'+task.text+'。');}
      if(task.engines)add('ram',task.engines,'章节任务：至少带冲车或投石车 '+task.engines+' 辆。');
    }
    const command=generalId&&game.cavalryCommand?.(generalId),cavalry=(want.cavalry||0)+(want.heavy||0);
    if(command&&cavalry>command.cap)reasons.push('主将统率可指挥骑兵 '+command.cap+' 名；超过的部分冲锋加成会摊薄。');
    return {army:want,reasons:[...new Set(reasons)],known:e.known};
  }
  return {recommend,enemy};
})();
