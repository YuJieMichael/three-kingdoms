'use strict';
// City duties are attached to actually recruited wild heroes. These bounded
// effects never replace the governor's existing politics production bonus.
const HeroAdministration=(()=>{
  const COST=Object.freeze({wood:1000,stone:1000,iron:1000}),MAX_SEQ=1000000000;
  const definitions=Object.freeze({
    xunyu:Object.freeze({id:'xunyu',name:'荀彧',action:'transport',title:'统筹粮运',description:'任本城城守且留城时，本城新派资源运输的行军粮减少20%。',condition:'真实招降后任本城城守；不影响运送资源、部队负重、调遣、运输时间或已有在途队伍。'}),
    pangtong:Object.freeze({id:'pangtong',name:'庞统',action:'defense',title:'筹备城防',description:'任本城城守且留城时，投入木、石、铁各1000，备好一次正式守城的城门耐久增加20%。',condition:'官府4级、城墙2级；每城最多一份。演练不消耗也不增益；工事攻击、现有战斗与其他城池不改变。'})
  });
  const object=x=>!!x&&typeof x==='object'&&!Array.isArray(x),int=n=>Number.isSafeInteger(n)&&n>=0,copy=x=>JSON.parse(JSON.stringify(x));
  const exact=(o,keys)=>object(o)&&Object.keys(o).length===keys.length&&keys.every(k=>Object.hasOwn(o,k));
  const cityId=(s,api={})=>typeof api.cityId==='string'?api.cityId:typeof api.currentCityId==='function'?api.currentCityId():s.realm?.activeCity||'capital';
  const sameCost=c=>exact(c,Object.keys(COST))&&Object.entries(COST).every(([id,n])=>c[id]===n);
  function identity(hero){const d=object(hero)&&Object.hasOwn(definitions,hero.wildLine)&&definitions[hero.wildLine];return d?{...d}:{id:'',name:'普通城守',action:'',title:'常规治理',description:'按已有内政、城守和任职规则治理城池。',condition:''};}
  function ownedHero(s,hero){
    const id=typeof hero==='string'?hero:hero?.id,g=s.customGenerals?.find(g=>g.id===id),w=s.wildGenerals,r=w?.rumors?.find(r=>r.id===id);
    if(!g||!Object.hasOwn(definitions,g.wildLine)||g.origin!=='wild'||!s.generals?.includes(id)||!w?.recruited?.includes(id)||!r||r.status!=='recruited'||r.line!==g.wildLine||r.node!==g.sourceNode)return null;
    // A caller-provided display or snapshot cannot substitute another identity.
    if(object(hero)&&hero.wildLine!==g.wildLine)return null;
    return g;
  }
  function busy(s,id,api={}){
    if(api.generalBusy?.(id))return true;
    if([...(s.expedition?[s.expedition]:[]),...(s.expeditions||[]),...Object.values(s.garrisons||{}),...(s.cityDefense?.battle?[s.cityDefense.battle]:[])].some(e=>e.general===id))return true;
    return (s.realm?.logistics||[]).some(e=>e.general===id);
  }
  function profile(s,hero,api={}){
    const g=ownedHero(s,hero),d=identity(g||hero),city=cityId(s,api);
    let reason=!g?'尚未通过画像、俘获与招降获得此名将':s.governor!==g.id?'需要任本城城守':s.realm?.heroLocations&&s.realm.heroLocations[g.id]!==city?'名将不在本城':busy(s,g.id,api)?'城守正在出征、驻守、调遣或守城':'';
    if(!d.id)reason='此将领没有专属内政职责';
    return {...d,hero:g?.id||hero?.id||'',city,active:!!g&&!reason,reason,transportFoodFactor:g&&!reason&&d.id==='xunyu'?.8:1};
  }
  function transportFactor(s,hero,kind,api={}){return kind==='transport'?profile(s,hero,api).transportFoodFactor:1;}
  function init(s){if(s.heroAdministration===undefined)s.heroAdministration={schema:1,seq:0,prepared:null};return s.heroAdministration;}
  function validDefenseSnapshot(snapshot,s,api={}){
    try{
      if(!exact(snapshot,['schema','id','hero','city','at','cost','gateFactor'])||snapshot.schema!==1||typeof snapshot.id!=='string'||!/^administration_defense_[1-9]\d*$/.test(snapshot.id)||typeof snapshot.hero!=='string'||typeof snapshot.city!=='string'||!snapshot.city.length||snapshot.city.length>100||!int(snapshot.at)||!sameCost(snapshot.cost)||snapshot.gateFactor!==1.2)return false;
      const seq=Number(snapshot.id.slice('administration_defense_'.length));if(!int(seq)||seq<1||seq>MAX_SEQ)return false;
      if(s){const g=api.historical?s.customGenerals?.find(g=>g.id===snapshot.hero&&g.origin==='wild'):ownedHero(s,snapshot.hero);if(!g||g.wildLine!=='pangtong'||snapshot.city!==cityId(s,api)||!object(s.heroAdministration)||!int(s.heroAdministration.seq)||seq>s.heroAdministration.seq)return false;}
      return true;
    }catch{return false;}
  }
  function valid(s,api={}){
    try{
      const d=s.heroAdministration,records=[...(s.cityDefense?.battle&&!s.cityDefense.battle.drill?[s.cityDefense.battle]:[]),...(s.cityDefense?.reports||[]).filter(r=>!r.drill)].map(r=>r.administrationDefense).filter(x=>x!==undefined);
      if(d===undefined)return records.length===0;
      if(!exact(d,['schema','seq','prepared'])||d.schema!==1||!int(d.seq)||d.seq>MAX_SEQ||!(d.prepared===null||validDefenseSnapshot(d.prepared,s,api)&&d.prepared.id==='administration_defense_'+d.seq))return false;
      const used=new Set();for(const snapshot of records){if(!validDefenseSnapshot(snapshot,s,{...api,historical:true})||used.has(snapshot.id)||d.prepared?.id===snapshot.id)return false;used.add(snapshot.id);}
      return true;
    }catch{return false;}
  }
  function prepareQuote(s,hero,selectedCity=cityId(s),now=Date.now(),api={}){
    const p=profile(s,hero,api),d=s.heroAdministration||{schema:1,seq:0,prepared:null},city=cityId(s,api);
    let reason=p.id!=='pangtong'?'筹备城防需要真实招降的庞统':p.reason;
    if(!reason&&selectedCity!==city)reason='请在要备防的城池中操作';
    if(!reason&&!valid(s,api))reason='备防记录无效，请重新读取存档';
    if(!reason&&(s.buildings?.hall||0)<4)reason='需要官府4级';
    if(!reason&&(s.buildings?.wall||0)<2)reason='需要城墙2级';
    if(!reason&&s.cityDefense?.battle)reason='请先结束当前守城战或演练';
    if(!reason&&d.prepared)reason='本城已有一份备防，不可叠加';
    if(!reason&&d.seq>=MAX_SEQ)reason='本城备防记录已达上限';
    if(!reason&&!int(now))reason='筹备时间无效';
    if(!reason)for(const [id,n]of Object.entries(COST))if(!Number.isFinite(s.res?.[id])||s.res[id]<n||s.res[id]>Number.MAX_SAFE_INTEGER){reason=({wood:'木材',stone:'石料',iron:'铁锭'})[id]+'不足，需要'+n;break;}
    return {ok:!reason,reason,hero:p.hero,city,cost:{...COST},gateFactor:1.2,requirements:{hall:4,wall:2},description:definitions.pangtong.description,condition:definitions.pangtong.condition,key:JSON.stringify([city,p.hero,p.id,s.governor,d.seq,d.prepared?.id||'',s.buildings?.hall||0,s.buildings?.wall||0,p.active,!!s.cityDefense?.battle])};
  }
  function prepare(s,hero,selectedCity,now,key,api={}){
    const q=prepareQuote(s,hero,selectedCity,now,api);
    if(!q.ok)return {ok:false,reason:q.reason};if(typeof key!=='string'||q.key!==key)return {ok:false,reason:'筹备条件已变化，请重新预览'};
    const d=init(s);for(const [id,n]of Object.entries(COST))s.res[id]-=n;
    d.seq++;d.prepared={schema:1,id:'administration_defense_'+d.seq,hero:q.hero,city:q.city,at:now,cost:{...COST},gateFactor:1.2};
    return {ok:true,reason:'',prepared:copy(d.prepared)};
  }
  function defensePrepared(s,hero,selectedCity=cityId(s),api={}){
    const snapshot=s.heroAdministration?.prepared,p=profile(s,hero,api),city=cityId(s,api);
    const reason=!snapshot?'本城尚未筹备城防':!valid(s,api)?'备防记录无效':selectedCity!==city||snapshot.city!==city?'备防属于另一座城池':p.id!=='pangtong'||!p.active?p.reason||'需要庞统任本城城守':snapshot.hero!==p.hero?'需要原筹备城守庞统留城任职':s.cityDefense?.battle?'当前守城已经开始，备防只用于下次正式守城':'';
    return {ready:!reason,reason,gateFactor:reason?1:1.2,snapshot:snapshot?copy(snapshot):null};
  }
  function consumeDefense(s,hero,selectedCity=cityId(s),drill=false,api={}){
    if(drill!==false)return null;
    const ready=defensePrepared(s,hero,selectedCity,api);if(!ready.ready)return null;
    const snapshot=ready.snapshot;s.heroAdministration.prepared=null;return snapshot;
  }
  return {COST,definitions,identity,profile,transportFactor,init,valid,prepareQuote,prepare,defensePrepared,consumeDefense,validDefenseSnapshot};
})();
