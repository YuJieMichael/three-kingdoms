'use strict';
const NPCDefense=(()=>{
  const C=NPCDefenseData;
  const total=a=>Object.values(a).reduce((sum,n)=>sum+n,0);
  const blank=units=>Object.fromEntries(Object.keys(units).map(id=>[id,0]));
  function init(s){
    if(s.cityDefense===undefined)s.cityDefense={autoEnabled:false,nextAt:0,wave:0,wins:0,incoming:null,battle:null,reports:[]};
    else if(s.cityDefense&&typeof s.cityDefense==='object'&&s.cityDefense.autoEnabled===undefined)s.cityDefense.autoEnabled=true;
  }
  const unlocked=s=>s.buildings.hall>=C.unlockHall&&s.stats.victories>=1;
  const profile=id=>C.profiles.find(p=>p.id===id);
  function challengeQuote(s,profileId='classic',selectedLevel){
    const p=profile(profileId);if(!p||p.regional)return null;
    const level=selectedLevel===undefined?Math.min(profileId==='classic'?C.classicMaxLevel:C.maxLevel,Math.max(1,s.buildings.hall)):selectedLevel;
    if(!Number.isInteger(level)||level<1||level>(profileId==='classic'?C.classicMaxLevel:C.maxLevel))return null;
    const army=Object.fromEntries(Object.entries(p.army).map(([id,n])=>[id,n*level]));if(profileId==='classic'&&level>=C.cavalryMinLevel)army.cavalry=C.cavalryPerLevel*level;
    const cost={gold:p.gold*level*level,food:p.food*level},reward=Object.fromEntries(Object.entries(p.reward).map(([id,n])=>[id,n*level]));
    const reason=!unlocked(s)?'官府达到 2 级并赢得一次出征后可发起黄巾挑战':s.buildings.hall<p.hall?'需要 '+p.hall+' 级官府':profileId!=='classic'&&level>s.buildings.hall?'挑战难度不能超过官府等级':s.cityDefense.incoming||s.cityDefense.battle?'已有来袭或守城战，请先处理当前事件':s.res.gold<cost.gold?'黄金不足':s.res.food<cost.food?'粮食不足':'';
    return {profile:profileId,name:p.name,description:p.description,level,maxLevel:profileId==='classic'?C.classicMaxLevel:Math.min(C.maxLevel,s.buildings.hall),army,cost,reward,xp:level*C.xpPerLevel,warningSeconds:C.warningMs/1000,reason,key:[profileId,level,s.buildings.hall,s.cityDefense.wave,!!s.cityDefense.incoming,!!s.cityDefense.battle].join('|')};
  }
  function requestChallenge(s,now,profileId='classic',level,key){
    const d=s.cityDefense;if(!unlocked(s))return '官府达到 2 级并赢得一次出征后可发起黄巾挑战';
    if(d.incoming||d.battle)return '已有来袭或守城战，请先处理当前事件';
    const q=challengeQuote(s,profileId,level);if(!q||key!==undefined&&key!==q.key)return '挑战条件已变化，请重新查看';if(q.reason)return q.reason;
    s.res.gold-=q.cost.gold;s.res.food-=q.cost.food;d.incoming=makeWave(s,now,false,profileId,q.level);d.wave=d.incoming.wave;d.nextAt=0;return null;
  }
  function setAutomatic(s,now,enabled){
    if(typeof enabled!=='boolean')return '请选择是否开启周期来袭';
    if(enabled&&!unlocked(s))return '官府达到 2 级并赢得一次出征后可开启周期来袭';
    s.cityDefense.autoEnabled=enabled;
    if(enabled&&!s.cityDefense.nextAt&&!s.cityDefense.incoming&&!s.cityDefense.battle)s.cityDefense.nextAt=now+C.intervalMs;
    return null;
  }
  function requestRegional(s,now,meta){
    const d=s.cityDefense,q=typeof RegionalFront==='undefined'?null:RegionalFront.waveSpec(meta);
    if(!q||meta.startedAt!==now||s.regionalFront?.run?.status!=='incoming'||!RegionalFront.matches(s,meta))return '战线预览已变化，请重新准备';
    if(d.incoming||d.battle)return '本城已有来袭或守城战，请先处理';
    const incoming={wave:d.wave+1,level:meta.level,army:{...q.army},arriveAt:meta.arriveAt,profile:q.profile,rewardSnapshot:{...q.reward},costSnapshot:{...q.cost},front:{...meta}};
    if(!RegionalFront.valid({...s,cityDefense:{...d,incoming}}))return '战线记录不匹配，请重新载入';
    d.incoming=incoming;
    d.wave=d.incoming.wave;d.nextAt=0;return null;
  }
  function makeWave(s,now,drill=false,profileId='classic',selectedLevel){
    const q=challengeQuote(s,profileId,selectedLevel);if(!q)return null;
    return {wave:drill?0:s.cityDefense.wave+1,level:q.level,army:q.army,arriveAt:now+(drill?0:C.warningMs),...(profileId==='classic'?{}:{profile:profileId,rewardSnapshot:q.reward,costSnapshot:q.cost})};
  }
  function beaconIntel(s,w=s.cityDefense.incoming){
    if(!w)return null;const beacon=s.buildings.beacon||0,precision=w.front?'exact':beacon>=7?'exact':beacon>=4?'bands':beacon>=1?'types':'warning';
    const types=Object.keys(w.army).filter(id=>w.army[id]>0),army=precision==='exact'?{...w.army}:precision==='bands'?Object.fromEntries(types.map(id=>{const n=w.army[id],band=Math.max(10,10**Math.floor(Math.log10(n||1)));return [id,{min:Math.floor(n/band)*band,max:(Math.floor(n/band)+1)*band-1}];})):null;
    return {precision,exact:precision==='exact',profile:w.profile||'classic',name:w.front&&typeof RegionalFront!=='undefined'?RegionalFront.waveSpec(w.front)?.name||profile(w.profile).name:profile(w.profile||'classic').name,level:w.level,arriveAt:w.arriveAt,types:precision==='warning'?[]:types,army};
  }
  function tick(s,now){
    const d=s.cityDefense;
    if(!d.autoEnabled||!unlocked(s)||d.incoming||d.battle)return;
    if(!d.nextAt)d.nextAt=now+C.intervalMs;
    if(now>=d.nextAt){d.incoming=makeWave(s,now);d.wave=d.incoming.wave;d.nextAt=0;}
  }
  function heldArmy(s){const b=s.cityDefense?.battle;return b&&!b.drill?b.army:{};}
  function heldDefenses(s){const b=s.cityDefense?.battle;return b&&!b.drill?b.defenses:{};}
  function begin(s,api,now,drill=false,generalId=s.governor,selectedArmy){
    const d=s.cityDefense;
    if(typeof drill!=='boolean')return '请选择正式守城或演练';
    if(d.battle)return '已有守城战或演练正在进行';
    if(s.battle&&!s.battle.finished)return '请先结束当前出征战斗';
    if(!drill&&(!d.incoming||d.incoming.arriveAt>now))return '敌军尚未抵达';
    if(!s.generals.includes(generalId))return '请选择已招募的守将';
    const deployed=[...(s.expedition?[s.expedition]:[]),...(s.expeditions||[]),...Object.values(s.garrisons||{})];
    if(api.generalBusy?.(generalId)||deployed.some(e=>e.general===generalId))return '守将正在出征或驻守，请选择留城将领';
    if(generalId!==s.governor&&Object.values(s.cityRoles||{}).includes(generalId))return '主将或军师正在任职，请先卸任；城守可亲自守城';
    const source=selectedArmy===undefined?s.army:selectedArmy;
    if(!source||typeof source!=='object'||Array.isArray(source)||Object.keys(source).some(id=>!Object.hasOwn(api.units,id)))return '驻城配兵格式不正确';
    const army=blank(api.units);
    for(const id of Object.keys(api.units)){const n=Object.hasOwn(source,id)?source[id]:0;if(!Number.isSafeInteger(n)||n<0||n>s.army[id])return '守城兵数必须为驻城兵力范围内的非负整数';army[id]=n;}
    const wave=drill?makeWave(s,now,true):d.incoming,general=generalId,defenses={...s.defenses};
    if(!drill&&wave.front){const q=typeof RegionalFront==='undefined'?null:RegionalFront.waveSpec(wave.front),same=(a,b)=>a&&Object.keys(a).length===Object.keys(b).length&&Object.entries(b).every(([id,n])=>a[id]===n);if(!q||!RegionalFront.matches(s,wave.front)||q.profile!==wave.profile||!same(wave.army,q.army)||!same(wave.rewardSnapshot,q.reward)||!same(wave.costSnapshot,q.cost)||wave.arriveAt!==wave.front.arriveAt)return '战线来袭记录不匹配，请重新载入';}
    const rows=(a,player)=>Object.entries(a).filter(([,n])=>n>0).map(([id,n])=>{const stats=api.unitStats(id,player);return {id,count:n,stats,hp:n*stats.hp};}),player=rows(army,true),enemy=rows(wave.army,false);
    const fortified=1+s.tech.fortification*C.fortificationPerLevel;
    const forts=Object.entries(defenses).filter(([,n])=>n>0).map(([id,n])=>({id,count:n,hp:n*api.defenses[id].hp*fortified,used:0}));
    const g=api.general(general),generalSnapshot={id:general,name:g.name,atk:g.atk,def:g.def},skillProfile=typeof GeneralGrowth!=='undefined'?GeneralGrowth.profile(s,general):undefined;
    // Every selection has passed before the paid prepared defense is atomically consumed.
    const administrationDefense=drill?null:api.consumeAdministrationDefense?.(general,drill)||null;
    const baseGateMax=(C.baseGateHp+s.buildings.wall*C.wallHp)*fortified,gateMax=baseGateMax*(administrationDefense?.gateFactor||1);
    delete d.drillResult;
    const contribution={wallBonus:Math.max(0,baseGateMax-C.baseGateHp*fortified),...(administrationDefense?{administrationGateBonus:gateMax-baseGateMax}:{}),gateDamage:0,abatisDelayed:0,armyDamage:0,forts:{}};
    d.battle={fortification:fortified,drill,wave:wave.wave,level:wave.level,general,generalSnapshot,...(skillProfile?{skillProfile}:{}),...(wave.profile?{profile:wave.profile,rewardSnapshot:{...wave.rewardSnapshot},costSnapshot:{...wave.costSnapshot}}:{}),...(wave.front?{front:{...wave.front}}:{}),...(administrationDefense?{administrationDefense}:{}),army,defenses,player,enemy,forts,gateMax,gateHp:gateMax,distance:C.distance,round:0,contribution,log:[(profile(wave.profile||'classic').name)+'逼近城池，'+g.name+'率所选 '+total(army)+' 人迎敌；未参战部队留城。','城墙增加城门耐久 '+Math.round(contribution.wallBonus)+(administrationDefense?'，庞统预备额外增加 '+Math.round(contribution.administrationGateBonus):'')+'，总耐久 '+Math.round(gateMax)+'。']};
    if(typeof WarCare!=='undefined'){
      WarCare.init(s,api.units);const b=d.battle;
      b.commandVersion=1;b.doctrine=WarCare.defenseSnapshot(s,api.units);b.careId='npc:'+(s.scopeID||s.realm?.activeCity||'capital')+':'+wave.wave;
      for(const r of b.player)r.pos=0;for(const r of b.enemy)r.pos=C.distance;
      log(b,b.doctrine.mode==='inside'?'驻军留城，不攻击也不受敌军伤害；由工事先战，工事耗尽后城门承受接触进攻。':'所选驻军出城迎战，按各兵种预设自动移动并选择攻击目标；未选驻军安全留城。');
    }
    if(!drill){for(const id of Object.keys(s.army))s.army[id]-=army[id];for(const id of Object.keys(s.defenses))s.defenses[id]=0;d.incoming=null;}
    return null;
  }
  function log(b,text){b.log.push(text);b.log=b.log.slice(-20);}
  const living=rows=>rows.filter(r=>r.hp>0);
  const number=r=>Math.ceil(r.hp/r.stats.hp);
  function damage(rows,amount){let rest=amount,actual=0;for(const row of living(rows)){const dealt=Math.min(row.hp,rest/(1+row.stats.def/200));row.hp-=dealt;actual+=dealt;rest=Math.max(0,rest-dealt*(1+row.stats.def/200));if(!rest)break;}return actual;}
  function fortImpact(b,id,key,amount){if(!b.contribution)return;const row=b.contribution.forts[id]||(b.contribution.forts[id]={damage:0,absorbed:0});row[key]+=amount;}
  function round(s,api,now){
    const b=s.cityDefense.battle;if(!b)return '当前没有守城战';
    if(b.commandVersion===1)return commandedRound(s,api,now);
    b.round++;const g=b.generalSnapshot||api.general(b.general),abatis=b.forts.some(f=>f.id==='abatis'&&f.hp>0);
    const beforeDistance=b.distance,slowed=abatis&&b.distance<=api.defenses.abatis.range;
    b.distance=Math.max(0,b.distance-C.marchPerRound*(b.profile==='cavalry'||b.profile==='region_pass'?1.5:1)*(slowed?C.abatisSlow:1));
    log(b,'第 '+b.round+' 回合 · 敌军距城门 '+b.distance);
    if(slowed){const delayed=Math.max(0,Math.min(beforeDistance,C.marchPerRound)-(beforeDistance-b.distance));if(b.contribution)b.contribution.abatisDelayed+=delayed;if(delayed)log(b,'拒马阻滞，本回合敌军少前进 '+delayed+' 距离。');}
    for(const f of b.forts){
      const cfg=api.defenses[f.id];if(b.distance>cfg.range||!living(b.enemy).length)continue;
      if(cfg.oneUse){if(f.used>=f.count)continue;const count=Math.min(f.count-f.used,total(living(b.enemy).map(number)));f.used+=count;const hit=count*(f.id==='trap'?C.trapDamage:cfg.atk),actual=damage(b.enemy,hit);fortImpact(b,f.id,'damage',actual);log(b,cfg.name+' 消耗 '+count+' 个，攻击 '+hit+' 点，实际削减敌军生命 '+Math.round(actual)+'。');}
      else if(f.hp>0&&cfg.atk){const hit=Math.ceil(f.hp/(cfg.hp*b.fortification))*cfg.atk,actual=damage(b.enemy,hit);fortImpact(b,f.id,'damage',actual);log(b,cfg.name+' 射击，攻击 '+hit+' 点，实际削减敌军生命 '+Math.round(actual)+'。');}
    }
    const attack=living(b.player).filter(r=>r.stats.range>=b.distance).reduce((sum,r)=>sum+number(r)*r.stats.atk*(b.skillProfile?.attackByUnit?.[r.id]||1),0)*(1+g.atk/C.generalAttackDivisor);
    if(attack){const actual=damage(b.enemy,attack);if(b.contribution)b.contribution.armyDamage+=actual;log(b,'守军攻击 '+Math.round(attack)+' 点，实际削减敌军生命 '+Math.round(actual)+'。');}
    if(!living(b.enemy).length)return finish(s,api,now,true);
    let hit=living(b.enemy).filter(r=>r.stats.range>=b.distance).reduce((sum,r)=>sum+number(r)*r.stats.atk,0)/(1+g.def/C.generalDefenseDivisor);
    if(hit){
      for(const f of b.forts.filter(f=>f.hp>0)){const cfg=api.defenses[f.id],dealt=Math.min(f.hp,hit/(1+cfg.def/200));f.hp-=dealt;fortImpact(b,f.id,'absorbed',dealt);if(dealt)log(b,cfg.name+' 承受 '+Math.round(dealt)+' 点耐久损伤。');hit=Math.max(0,hit-dealt*(1+cfg.def/200));if(!hit)break;}
      for(const r of living(b.player)){const dealt=Math.min(r.hp,hit/(1+r.stats.def/200));r.hp-=dealt;hit=Math.max(0,hit-dealt*(1+r.stats.def/200));if(!hit)break;}
      if(b.distance===0||b.profile==='siege'&&b.distance<=600){const before=b.gateHp;b.gateHp=Math.max(0,b.gateHp-hit);if(b.contribution)b.contribution.gateDamage+=before-b.gateHp;}
      log(b,'敌军进攻，城门耐久 '+Math.ceil(b.gateHp)+' / '+Math.ceil(b.gateMax)+'。');
    }
    if(b.gateHp<=0)return finish(s,api,now,false);
    if(b.round>=C.maxRounds)return finish(s,api,now,true);
    return null;
  }
  function commandedRound(s,api,now){
    const b=s.cityDefense.battle,g=b.generalSnapshot||api.general(b.general);b.round++;
    const before=b.distance,abatis=b.forts.some(f=>f.id==='abatis'&&f.hp>0),slowed=abatis&&b.distance<=api.defenses.abatis.range;
    const step=C.marchPerRound*(b.profile==='cavalry'||b.profile==='region_pass'?1.5:1)*(slowed?C.abatisSlow:1);
    for(const r of living(b.enemy))r.pos=Math.max(0,r.pos-step);
    b.distance=living(b.enemy).length?Math.min(...living(b.enemy).map(r=>r.pos)):0;
    log(b,'第 '+b.round+' 回合 · 敌军距城门 '+b.distance);
    if(slowed){const delayed=Math.max(0,Math.min(before,step/(C.abatisSlow||1))-(before-b.distance));b.contribution.abatisDelayed+=delayed;if(delayed)log(b,'拒马阻滞，敌军少前进 '+delayed+' 距离。');}
    for(const f of b.forts){
      const cfg=api.defenses[f.id],inRange=living(b.enemy).filter(r=>r.pos<=cfg.range);if(!inRange.length)continue;
      if(cfg.oneUse){if(f.used>=f.count||cfg.hp>0&&f.hp<=0)continue;const count=Math.min(f.count-f.used,cfg.hp>0?Math.ceil(f.hp/(cfg.hp*b.fortification)):f.count-f.used,total(inRange.map(number)));f.used+=count;if(cfg.hp>0)f.hp=Math.max(0,f.hp-count*cfg.hp*b.fortification);const actual=damage(inRange,count*(f.id==='trap'?C.trapDamage:cfg.atk));fortImpact(b,f.id,'damage',actual);log(b,cfg.name+' 消耗 '+count+'，削减敌军生命 '+Math.round(actual)+'。');}
      else if(f.hp>0&&cfg.atk){const actual=damage(inRange,Math.ceil(f.hp/(cfg.hp*b.fortification))*cfg.atk);fortImpact(b,f.id,'damage',actual);log(b,cfg.name+' 射击，削减敌军生命 '+Math.round(actual)+'。');}
    }
    const nearest=(rows,pos)=>[...rows].sort((a,c)=>Math.abs(a.pos-pos)-Math.abs(c.pos-pos))[0];
    if(b.doctrine.mode==='field')for(const r of living(b.player)){
      const order=b.doctrine.orders[r.id],enemies=living(b.enemy),preferred=enemies.find(e=>e.id===order.target),aim=preferred||nearest(enemies,r.pos);if(!aim)break;
      const old=r.pos,movement=Math.min(400,Math.max(50,r.stats.speed*.5));
      if(order.command==='advance')r.pos=Math.min(C.distance,r.pos+Math.min(movement,Math.max(0,aim.pos-r.pos)));
      if(order.command==='fallback')r.pos=Math.max(0,r.pos-movement);
      if(old!==r.pos)log(b,api.units[r.id].name+(order.command==='fallback'?'后退':'前进')+' '+Math.round(Math.abs(old-r.pos))+'，距城门 '+Math.round(r.pos)+'。');
      const inRange=enemies.filter(e=>Math.abs(e.pos-r.pos)<=r.stats.range),target=inRange.find(e=>e.id===order.target)||nearest(inRange,r.pos);if(!target)continue;
      const before=number(target),actual=damage([target],number(r)*r.stats.atk*(b.skillProfile?.attackByUnit?.[r.id]||1)*(1+g.atk/C.generalAttackDivisor));
      b.contribution.armyDamage+=actual;log(b,api.units[r.id].name+' 攻击 '+api.units[target.id].name+'，敌军损失 '+(before-number(target))+' 人。');
    }
    if(!living(b.enemy).length)return finish(s,api,now,true);
    for(const e of living(b.enemy)){
      let hit=number(e)*e.stats.atk/(1+g.def/C.generalDefenseDivisor);
      const exposed=b.doctrine.mode==='field'?living(b.player).filter(r=>Math.abs(r.pos-e.pos)<=e.stats.range):[],target=nearest(exposed,e.pos);
      if(target){const before=number(target);damage([target],hit);log(b,api.units[e.id].name+' 攻击 '+api.units[target.id].name+'，守军损失 '+(before-number(target))+' 人。');continue;}
      if(e.pos>e.stats.range)continue;
      // One attack budget: visible fortifications absorb it before contact can damage the gate.
      for(const f of b.forts.filter(f=>f.hp>0&&(!api.defenses[f.id].oneUse||f.used<f.count))){const cfg=api.defenses[f.id],dealt=Math.min(f.hp,hit/(1+cfg.def/200));f.hp-=dealt;fortImpact(b,f.id,'absorbed',dealt);hit=Math.max(0,hit-dealt*(1+cfg.def/200));if(!hit)break;}
      if(e.pos===0||b.profile==='siege'&&e.pos<=600){const before=b.gateHp;b.gateHp=Math.max(0,b.gateHp-hit);b.contribution.gateDamage+=before-b.gateHp;}
    }
    log(b,'敌军进攻后，城门耐久 '+Math.ceil(b.gateHp)+' / '+Math.ceil(b.gateMax)+'。');
    if(b.gateHp<=0)return finish(s,api,now,false);
    if(b.round>=C.maxRounds)return finish(s,api,now,true);
    return null;
  }
  function resolve(s,api,now){if(!s.cityDefense.battle)return '当前没有守城战';let result=null;for(let i=0;i<C.maxRounds&&s.cityDefense.battle;i++){result=round(s,api,now);if(typeof result==='string')return result;}return result;}
  function finish(s,api,now,won){
    const d=s.cityDefense,b=d.battle;if(!b)return null;
    const lost=blank(api.units),wounded=blank(api.units),back=blank(api.units),defenseLost={},repaired={},robbed={};
    const hospital=!b.drill&&b.commandVersion===1&&typeof WarCare!=='undefined';
    for(const id of Object.keys(api.units)){const row=b.player.find(r=>r.id===id),alive=row?number(row):0;wounded[id]=Math.floor((b.army[id]-alive)*(won?C.wonWounded:C.lostWounded));back[id]=alive+(hospital?0:wounded[id]);lost[id]=b.army[id]-alive-wounded[id];}
    if(hospital){const error=WarCare.admit(s,b.careId,wounded,now,api.units);if(error)return error;}
    for(const f of b.forts){const cfg=api.defenses[f.id],alive=cfg.oneUse?Math.min(f.count-f.used,b.commandVersion===1&&cfg.hp>0?Math.ceil(f.hp/(cfg.hp*b.fortification)):f.count-f.used):Math.ceil(f.hp/(cfg.hp*b.fortification)),destroyed=f.count-alive;repaired[f.id]=cfg.oneUse?0:Math.floor(destroyed*s.tech.repair*C.repairPerLevel);defenseLost[f.id]=destroyed-repaired[f.id];}
    const reward=won?(b.rewardSnapshot||{food:b.level*C.rewardPerLevel,wood:b.level*C.rewardPerLevel}):{},resourceReceipt=b.drill?null:api.settleLoot(reward);
    if(!b.drill){
      for(const id of Object.keys(back))s.army[id]+=back[id];
      for(const id of Object.keys(b.defenses))s.defenses[id]+=b.defenses[id]-(defenseLost[id]||0);
      if(won)d.wins++;else {const enemies=Object.fromEntries(b.enemy.map(r=>[r.id,number(r)])),available=Object.fromEntries(['food','wood','stone','iron'].map(id=>[id,Math.floor(s.res[id]*C.raidFraction)]));Object.assign(robbed,api.capLoot(available,api.carry(enemies)));for(const [id,n] of Object.entries(robbed))s.res[id]-=n;}
      if(won)api.addXp(b.general,b.level*C.xpPerLevel);if(d.autoEnabled)d.nextAt=now+C.intervalMs;
    }
    const enemyRemaining=total(living(b.enemy).map(number)),victoryReason=won?(enemyRemaining?'held':'cleared'):'gate';
    const report={id:now,kind:'defense',drill:b.drill,wave:b.wave,level:b.level,...(b.commandVersion===1?{commandVersion:1,doctrine:b.doctrine}:{}),...(hospital?{woundedInHospital:true,careId:b.careId}:{}),...(b.profile?{profile:b.profile,costSnapshot:b.costSnapshot,rewardSnapshot:b.rewardSnapshot}:{}),...(b.front?{front:{...b.front}}:{}),...(b.administrationDefense?{administrationDefense:b.administrationDefense}:{}),general:b.general,round:b.round,won,victoryReason,enemyRemaining,...(b.contribution?{contribution:b.contribution}:{}),lost,wounded,back,defenseLost,repaired,robbed,resourceReceipt,xp:b.drill||!won?0:b.level*C.xpPerLevel};
    if(!b.drill){d.reports.unshift(report);d.reports=d.reports.slice(0,20);}else d.drillResult=report;
    d.battle=null;return report;
  }
  function endDrill(s){if(!s.cityDefense.battle?.drill)return '只能结束演练，正式守城战需完成结算';s.cityDefense.battle=null;return null;}
  function validate(s,units,defenses,receiptValid,cityId=s.scopeID||s.realm?.activeCity){
    cityId=cityId||'capital';
    const d=s.cityDefense,obj=x=>x&&typeof x==='object'&&!Array.isArray(x),finite=n=>Number.isFinite(n)&&n>=0&&n<=Number.MAX_SAFE_INTEGER,int=n=>Number.isSafeInteger(n)&&n>=0;
    const counts=(a,ids,full=false)=>obj(a)&&(!full||Object.keys(ids).every(id=>int(a[id])))&&Object.entries(a).every(([id,n])=>Object.hasOwn(ids,id)&&int(n));
    const same=(a,b)=>obj(a)&&Object.keys(a).length===Object.keys(b).length&&Object.entries(b).every(([k,n])=>a[k]===n);
    const regional=w=>typeof RegionalFront==='undefined'?null:RegionalFront.waveSpec(w.front);
    const administration=w=>w.administrationDefense===undefined||!w.drill&&typeof HeroAdministration!=='undefined'&&HeroAdministration.validDefenseSnapshot(w.administrationDefense,s,{cityId,historical:true});
    const metadata=w=>{const p=profile(w.profile);if(p?.regional){const q=regional(w);return !!q&&!w.drill&&w.front.city===cityId&&q.profile===w.profile&&w.level===w.front.level&&same(w.rewardSnapshot,q.reward)&&same(w.costSnapshot,q.cost);}if(w.front!==undefined)return false;if(w.profile===undefined)return w.level<=C.classicMaxLevel&&w.rewardSnapshot===undefined&&w.costSnapshot===undefined;return !!p&&p.id!=='classic'&&same(w.rewardSnapshot,Object.fromEntries(Object.entries(p.reward).map(([id,n])=>[id,n*w.level])))&&same(w.costSnapshot,{gold:p.gold*w.level*w.level,food:p.food*w.level});};
    const wave=w=>obj(w)&&int(w.wave)&&int(w.level)&&w.level>=1&&w.level<=C.maxLevel&&finite(w.arriveAt)&&counts(w.army,units)&&metadata(w)&&(w.front?same(w.army,regional(w).army)&&w.arriveAt===w.front.arriveAt:w.profile===undefined||same(w.army,Object.fromEntries(Object.entries(profile(w.profile).army).map(([id,n])=>[id,n*w.level]))));
    const historicalHero=id=>s.generals.includes(id)||['lin','su','yan'].includes(id)||(s.customGenerals||[]).some(g=>g.id===id);
    const doctrine=b=>b.commandVersion===undefined?b.doctrine===undefined&&b.woundedInHospital===undefined&&b.careId===undefined:b.commandVersion===1&&typeof WarCare!=='undefined'&&WarCare.validDefense(b.doctrine,units);
    const care=b=>b.commandVersion!==1||b.drill?b.woundedInHospital===undefined&&b.careId===undefined:b.woundedInHospital===true&&b.careId==='npc:'+cityId+':'+b.wave;
    const report=r=>obj(r)&&doctrine(r)&&care(r)&&finite(r.id)&&r.kind==='defense'&&typeof r.drill==='boolean'&&int(r.wave)&&int(r.level)&&r.level>=1&&r.level<=C.maxLevel&&historicalHero(r.general)&&int(r.round)&&r.round<=C.maxRounds&&typeof r.won==='boolean'&&counts(r.back,units,true)&&counts(r.lost,units,true)&&counts(r.wounded,units,true)&&counts(r.defenseLost,defenses)&&counts(r.repaired,defenses)&&obj(r.robbed)&&Object.entries(r.robbed).every(([id,n])=>['food','wood','stone','iron'].includes(id)&&int(n))&&finite(r.xp)&&(r.drill?r.resourceReceipt===null:receiptValid(r.resourceReceipt));
    const contribution=c=>c===undefined||obj(c)&&['wallBonus','gateDamage','abatisDelayed','armyDamage'].every(k=>finite(c[k]))&&(c.administrationGateBonus===undefined||finite(c.administrationGateBonus))&&obj(c.forts)&&Object.entries(c.forts).every(([id,r])=>Object.hasOwn(defenses,id)&&obj(r)&&finite(r.damage)&&finite(r.absorbed));
    const outcome=r=>(r.enemyRemaining===undefined||int(r.enemyRemaining))&&(r.victoryReason===undefined||int(r.enemyRemaining)&&(r.victoryReason==='cleared'?r.won&&r.enemyRemaining===0:r.victoryReason==='held'?r.won&&r.enemyRemaining>0&&r.round===C.maxRounds:r.victoryReason==='gate'&&!r.won));
    const recorded=r=>report(r)&&metadata(r)&&administration(r)&&contribution(r.contribution)&&outcome(r)&&(!r.front||same(r.resourceReceipt.loaded,r.won?regional(r).reward:{})&&r.xp===(r.won?regional(r).xp:0))&&(r.administrationDefense!==undefined?r.contribution?.administrationGateBonus>0:r.contribution?.administrationGateBonus===undefined);
    if(!obj(d)||(d.autoEnabled!==undefined&&typeof d.autoEnabled!=='boolean')||!finite(d.nextAt)||!int(d.wave)||!int(d.wins)||!(d.incoming===null||wave(d.incoming))||!Array.isArray(d.reports)||d.reports.length>20||!d.reports.every(recorded)||(d.drillResult!==undefined&&!recorded(d.drillResult)))return false;
    if(d.battle!==null){
      const b=d.battle,rows=(a,army)=>Array.isArray(a)&&new Set(a.map(r=>r.id)).size===a.length&&a.every(r=>obj(r)&&Object.hasOwn(units,r.id)&&int(r.count)&&r.count>0&&r.count===army[r.id]&&obj(r.stats)&&['hp','atk','def','range','speed'].every(k=>finite(r.stats[k]))&&r.stats.hp>0&&finite(r.hp)&&r.hp<=r.count*r.stats.hp)&&Object.entries(army).filter(([,n])=>n>0).every(([id])=>a.some(r=>r.id===id));
      const snapshot=b?.generalSnapshot,snapshotValid=snapshot===undefined||obj(snapshot)&&snapshot.id===b.general&&typeof snapshot.name==='string'&&snapshot.name.length<=100&&finite(snapshot.atk)&&finite(snapshot.def);
      const skillValid=b?.skillProfile===undefined||typeof GeneralGrowth!=='undefined'&&GeneralGrowth.validProfile(b.skillProfile);
      if(!doctrine(b)||b.commandVersion===1&&(b.careId!=='npc:'+cityId+':'+b.wave||b.woundedInHospital!==undefined||![...(b.player||[]),...(b.enemy||[])].every(r=>finite(r.pos)&&r.pos<=C.distance)))return false;
      if(!administration(b)||b.front&&!same(Object.fromEntries((b.enemy||[]).map(r=>[r.id,r.count])),regional(b)?.army))return false;
      if(b.administrationDefense!==undefined){const original=b.gateMax/b.administrationDefense.gateFactor;if(!b.contribution||Math.abs(b.contribution.administrationGateBonus-(b.gateMax-original))>1e-6)return false;}else if(b.contribution?.administrationGateBonus!==undefined)return false;
      if(!obj(b)||!metadata(b)||!snapshotValid||!skillValid||!contribution(b.contribution)||typeof b.drill!=='boolean'||!int(b.wave)||!int(b.level)||b.level<1||b.level>C.maxLevel||!s.generals.includes(b.general)||!counts(b.army,units,true)||!counts(b.defenses,defenses,true)||!int(b.round)||b.round>=C.maxRounds||!finite(b.fortification)||b.fortification<1||b.fortification>2||!finite(b.gateMax)||b.gateMax<=0||!finite(b.gateHp)||b.gateHp<=0||b.gateHp>b.gateMax||!finite(b.distance)||b.distance>C.distance||!rows(b.player,b.army)||!Array.isArray(b.enemy)||!rows(b.enemy,Object.fromEntries(b.enemy.map(r=>[r.id,r.count])))||!Array.isArray(b.forts)||new Set(b.forts.map(f=>f.id)).size!==b.forts.length||!b.forts.every(f=>obj(f)&&Object.hasOwn(defenses,f.id)&&int(f.count)&&f.count>0&&f.count===b.defenses[f.id]&&int(f.used)&&f.used<=f.count&&finite(f.hp)&&f.hp<=f.count*defenses[f.id].hp*b.fortification)||!Object.entries(b.defenses).filter(([,n])=>n>0).every(([id])=>b.forts.some(f=>f.id===id))||!Array.isArray(b.log)||b.log.length>20||!b.log.every(t=>typeof t==='string'&&t.length<1000)||(!b.drill&&d.incoming))return false;
    }
    return true;
  }
  function valid(...args){try{return validate(...args);}catch{return false;}}
  return {profiles:C.profiles.filter(p=>!p.regional),init,tick,makeWave,unlocked,challengeQuote,beaconIntel,requestChallenge,requestRegional,setAutomatic,heldArmy,heldDefenses,begin,round,resolve,endDrill,valid};
})();
