'use strict';
// Permanent milestones project existing records; only explicit tracking is persisted.
const JourneySystem=(()=>{
  const ids=['build','yellow','hero','cities','jiangling'];
  function init(s){if(s.journey===undefined)s.journey={version:1,tracked:''};}
  function valid(s){const r=s.journey;return !!r&&typeof r==='object'&&!Array.isArray(r)&&Object.keys(r).length===2&&r.version===1&&(r.tracked===''||ids.includes(r.tracked));}
  function view(game){
    const s=game.state,cities=game.cityList(),record=s.realm.namedCities.garrisons.named_jiangling;
    const capital=cities.find(c=>c.capital)||cities[0],buildings=capital?.buildings||{};
    const built=(buildings.hall||0)>=3&&(buildings.drill||0)>=1&&s.generals.some(id=>(s.generalLevels[id]||1)>=5);
    const historical=g=>{const projected={...s,generals:s.generals.includes(g.id)?s.generals:[...s.generals,g.id]};if(g.origin==='wild')projected.wildGenerals={...s.wildGenerals,recruited:[...s.wildGenerals.recruited,g.id],rumors:s.wildGenerals.rumors.map(r=>r.id===g.id?{...r,status:'recruited'}:r)};return !!HeroIdentity.key(projected,g.id);};
    const pastHero=Object.values(s.realm.namedCities.garrisons).some(r=>r.recruited)||s.customGenerals.some(historical);
    const alive=s.generals.includes(NamedGarrison.hero('named_jiangling').id),jianglingDone=!!record.recruited;
    const heroStatus=pastHero?'已招募过名将':'寻找并招降第一位名将；俘获后仍需招降';
    const steps=[
      {id:'build',title:'发展主城',complete:built,status:built?'基础已齐':'官府3级 · 校场1级 · 一位将领5级',action:'build'},
      {id:'yellow',title:'通关黄巾',complete:!!s.battlefields.firstClears.yellow_turban,status:s.battlefields.firstClears.yellow_turban?'已完整通关':'完成黄巾之乱主线；查看参战条件',action:'yellow'},
      {id:'hero',title:'招募名将',complete:!!pastHero,status:heroStatus,action:'hero'},
      {id:'cities',title:cities.length>=2?'经营第二城':'取得第二城',complete:cities.length>=2,status:'治下 '+cities.length+' 城 / 2 · '+(cities.length>=2?'查看粮食与补给':game.cityLimit()<=cities.length?'先晋升爵位增加城池名额':!game.countyUnlocked()?'先完成黄巾史诗开放攻城':'名额已够，查看可占城池'),action:cities.length>=2?'cities':'expand'},
      {id:'jiangling',title:jianglingDone?'关羽归属':'筹备江陵',complete:jianglingDone,status:jianglingDone?(alive?'关羽已归顺':'关羽已解雇或离队，没有再次招募入口'):record.captive?'关羽已被俘；核对爵位与招贤馆后招降':'降低忠诚至30以下，再赢占领战俘将',action:jianglingDone?'cities':'jiangling'}
    ];
    const tracked=steps.find(r=>r.id===s.journey?.tracked),recommended=steps.find(r=>!r.complete);
    return {steps,current:tracked||recommended||{id:'complete',title:'征程已完成',status:'继续经营城池与探索战场',complete:true,action:'cities'}};
  }
  return {ids,init,valid,view};
})();
