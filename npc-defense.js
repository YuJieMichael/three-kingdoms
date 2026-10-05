'use strict';
const NPCDefense=(()=>{
  const C=NPCDefenseData;
  const total=a=>Object.values(a).reduce((sum,n)=>sum+n,0);
  const blank=units=>Object.fromEntries(Object.keys(units).map(id=>[id,0]));
  function init(s){if(s.cityDefense===undefined)s.cityDefense={nextAt:0,wave:0,wins:0,incoming:null,battle:null,reports:[]};}
  function makeWave(s,now,drill=false){
    const level=Math.min(C.maxLevel,Math.max(1,s.buildings.hall));
    const army=Object.fromEntries(Object.entries(C.waveArmy).map(([id,n])=>[id,n*level]));
    if(level>=C.cavalryMinLevel)army.cavalry=C.cavalryPerLevel*level;
    return {wave:drill?0:s.cityDefense.wave+1,level,army,arriveAt:now+(drill?0:C.warningMs)};
  }
  function tick(s,now){
    const d=s.cityDefense;
    if(s.buildings.hall<C.unlockHall||s.stats.victories<1||d.incoming||d.battle)return;
    if(!d.nextAt)d.nextAt=now+C.intervalMs;
    if(now>=d.nextAt){d.incoming=makeWave(s,now);d.wave=d.incoming.wave;d.nextAt=0;}
  }
  function heldArmy(s){const b=s.cityDefense?.battle;return b&&!b.drill?b.army:{};}
  function heldDefenses(s){const b=s.cityDefense?.battle;return b&&!b.drill?b.defenses:{};}
  function begin(s,api,now,drill=false){
    const d=s.cityDefense;
    if(d.battle)return '已有守城战或演练正在进行';
    if(s.battle&&!s.battle.finished)return '请先结束当前出征战斗';
    if(!drill&&(!d.incoming||d.incoming.arriveAt>now))return '敌军尚未抵达';
    const wave=drill?makeWave(s,now,true):d.incoming,general=s.governor,army={...s.army},defenses={...s.defenses};
    const rows=(a,player)=>Object.entries(a).filter(([,n])=>n>0).map(([id,n])=>{const stats=api.unitStats(id,player);return {id,count:n,stats,hp:n*stats.hp};});
    const fortified=1+s.tech.fortification*C.fortificationPerLevel;
    const forts=Object.entries(defenses).filter(([,n])=>n>0).map(([id,n])=>({id,count:n,hp:n*api.defenses[id].hp*fortified,used:0}));
    const gateMax=(C.baseGateHp+s.buildings.wall*C.wallHp)*fortified;
    delete d.drillResult;
    d.battle={fortification:fortified,drill,wave:wave.wave,level:wave.level,general,army,defenses,player:rows(army,true),enemy:rows(wave.army,false),forts,gateMax,gateHp:gateMax,distance:C.distance,round:0,log:['山匪逼近青溪城，驻城部队与完工工事准备迎敌。']};
    if(!drill){for(const id of Object.keys(s.army))s.army[id]=0;for(const id of Object.keys(s.defenses))s.defenses[id]=0;d.incoming=null;}
    return null;
  }
  function log(b,text){b.log.push(text);b.log=b.log.slice(-20);}
  const living=rows=>rows.filter(r=>r.hp>0);
  const number=r=>Math.ceil(r.hp/r.stats.hp);
  function damage(rows,amount){let rest=amount;for(const row of living(rows)){const dealt=Math.min(row.hp,rest/(1+row.stats.def/200));row.hp-=dealt;rest=Math.max(0,rest-dealt*(1+row.stats.def/200));if(!rest)break;}}
  function round(s,api,now){
    const b=s.cityDefense.battle;if(!b)return '当前没有守城战';
    b.round++;const g=api.general(b.general),abatis=b.forts.some(f=>f.id==='abatis'&&f.hp>0);
    b.distance=Math.max(0,b.distance-C.marchPerRound*(abatis&&b.distance<=api.defenses.abatis.range?C.abatisSlow:1));
    log(b,'第 '+b.round+' 回合 · 敌军距城门 '+b.distance);
    for(const f of b.forts){
      const cfg=api.defenses[f.id];if(b.distance>cfg.range||!living(b.enemy).length)continue;
      if(cfg.oneUse){if(f.used>=f.count)continue;const count=Math.min(f.count-f.used,total(living(b.enemy).map(number)));f.used+=count;const hit=count*(f.id==='trap'?C.trapDamage:cfg.atk);damage(b.enemy,hit);log(b,cfg.name+' 消耗 '+count+' 个，造成 '+hit+' 点攻击。');}
      else if(f.hp>0&&cfg.atk){const hit=Math.ceil(f.hp/(cfg.hp*b.fortification))*cfg.atk;damage(b.enemy,hit);log(b,cfg.name+' 射击，造成 '+hit+' 点攻击。');}
    }
    const attack=living(b.player).filter(r=>r.stats.range>=b.distance).reduce((sum,r)=>sum+number(r)*r.stats.atk,0)*(1+g.atk/C.generalAttackDivisor);
    if(attack){damage(b.enemy,attack);log(b,'驻军攻击 '+Math.round(attack)+' 点。');}
    if(!living(b.enemy).length)return finish(s,api,now,true);
    let hit=living(b.enemy).filter(r=>r.stats.range>=b.distance).reduce((sum,r)=>sum+number(r)*r.stats.atk,0)/(1+g.def/C.generalDefenseDivisor);
    if(hit){
      for(const f of b.forts.filter(f=>f.hp>0)){const cfg=api.defenses[f.id],dealt=Math.min(f.hp,hit/(1+cfg.def/200));f.hp-=dealt;hit=Math.max(0,hit-dealt*(1+cfg.def/200));if(!hit)break;}
      for(const r of living(b.player)){const dealt=Math.min(r.hp,hit/(1+r.stats.def/200));r.hp-=dealt;hit=Math.max(0,hit-dealt*(1+r.stats.def/200));if(!hit)break;}
      if(b.distance===0)b.gateHp=Math.max(0,b.gateHp-hit);
      log(b,'敌军进攻，城门耐久 '+Math.ceil(b.gateHp)+' / '+Math.ceil(b.gateMax)+'。');
    }
    if(b.gateHp<=0)return finish(s,api,now,false);
    if(b.round>=C.maxRounds)return finish(s,api,now,true);
    return null;
  }
  function finish(s,api,now,won){
    const d=s.cityDefense,b=d.battle;if(!b)return null;
    const lost=blank(api.units),wounded=blank(api.units),back=blank(api.units),defenseLost={},repaired={},robbed={};
    for(const id of Object.keys(api.units)){const row=b.player.find(r=>r.id===id),alive=row?number(row):0;wounded[id]=Math.floor((b.army[id]-alive)*(won?C.wonWounded:C.lostWounded));back[id]=alive+wounded[id];lost[id]=b.army[id]-back[id];}
    for(const f of b.forts){const cfg=api.defenses[f.id],alive=cfg.oneUse?f.count-f.used:Math.ceil(f.hp/(cfg.hp*b.fortification)),destroyed=f.count-alive;repaired[f.id]=cfg.oneUse?0:Math.floor(destroyed*s.tech.repair*C.repairPerLevel);defenseLost[f.id]=destroyed-repaired[f.id];}
    const reward=won?{food:b.level*C.rewardPerLevel,wood:b.level*C.rewardPerLevel}:{},resourceReceipt=b.drill?null:api.settleLoot(reward);
    if(!b.drill){
      for(const id of Object.keys(back))s.army[id]+=back[id];
      for(const id of Object.keys(b.defenses))s.defenses[id]+=b.defenses[id]-(defenseLost[id]||0);
      if(won)d.wins++;else {const enemies=Object.fromEntries(b.enemy.map(r=>[r.id,number(r)])),available=Object.fromEntries(['food','wood','stone','iron'].map(id=>[id,Math.floor(s.res[id]*C.raidFraction)]));Object.assign(robbed,api.capLoot(available,api.carry(enemies)));for(const [id,n] of Object.entries(robbed))s.res[id]-=n;}
      api.addXp(b.general,b.level*C.xpPerLevel);d.nextAt=now+C.intervalMs;
    }
    const report={id:now,kind:'defense',drill:b.drill,wave:b.wave,level:b.level,general:b.general,round:b.round,won,lost,wounded,back,defenseLost,repaired,robbed,resourceReceipt,xp:b.drill?0:b.level*C.xpPerLevel};
    if(!b.drill){d.reports.unshift(report);d.reports=d.reports.slice(0,20);}else d.drillResult=report;
    d.battle=null;return report;
  }
  function endDrill(s){if(!s.cityDefense.battle?.drill)return '只能结束演练，正式守城战需完成结算';s.cityDefense.battle=null;return null;}
  function validate(s,units,defenses,receiptValid){
    const d=s.cityDefense,obj=x=>x&&typeof x==='object'&&!Array.isArray(x),finite=n=>Number.isFinite(n)&&n>=0&&n<=Number.MAX_SAFE_INTEGER,int=n=>Number.isSafeInteger(n)&&n>=0;
    const counts=(a,ids,full=false)=>obj(a)&&(!full||Object.keys(ids).every(id=>int(a[id])))&&Object.entries(a).every(([id,n])=>Object.hasOwn(ids,id)&&int(n));
    const wave=w=>obj(w)&&int(w.wave)&&int(w.level)&&w.level>=1&&w.level<=C.maxLevel&&finite(w.arriveAt)&&counts(w.army,units);
    const report=r=>obj(r)&&finite(r.id)&&r.kind==='defense'&&typeof r.drill==='boolean'&&int(r.wave)&&int(r.level)&&r.level>=1&&r.level<=C.maxLevel&&s.generals.includes(r.general)&&int(r.round)&&r.round<=C.maxRounds&&typeof r.won==='boolean'&&counts(r.back,units,true)&&counts(r.lost,units,true)&&counts(r.wounded,units,true)&&counts(r.defenseLost,defenses)&&counts(r.repaired,defenses)&&obj(r.robbed)&&Object.entries(r.robbed).every(([id,n])=>['food','wood','stone','iron'].includes(id)&&int(n))&&finite(r.xp)&&(r.drill?r.resourceReceipt===null:receiptValid(r.resourceReceipt));
    if(!obj(d)||!finite(d.nextAt)||!int(d.wave)||!int(d.wins)||!(d.incoming===null||wave(d.incoming))||!Array.isArray(d.reports)||d.reports.length>20||!d.reports.every(report)||(d.drillResult!==undefined&&!report(d.drillResult)))return false;
    if(d.battle!==null){
      const b=d.battle,rows=(a,army)=>Array.isArray(a)&&new Set(a.map(r=>r.id)).size===a.length&&a.every(r=>obj(r)&&Object.hasOwn(units,r.id)&&int(r.count)&&r.count>0&&r.count===army[r.id]&&obj(r.stats)&&['hp','atk','def','range','speed'].every(k=>finite(r.stats[k]))&&r.stats.hp>0&&finite(r.hp)&&r.hp<=r.count*r.stats.hp)&&Object.entries(army).filter(([,n])=>n>0).every(([id])=>a.some(r=>r.id===id));
      if(!obj(b)||typeof b.drill!=='boolean'||!int(b.wave)||!int(b.level)||b.level<1||b.level>C.maxLevel||!s.generals.includes(b.general)||!counts(b.army,units,true)||!counts(b.defenses,defenses,true)||!int(b.round)||b.round>=C.maxRounds||!finite(b.fortification)||b.fortification<1||b.fortification>2||!finite(b.gateMax)||b.gateMax<=0||!finite(b.gateHp)||b.gateHp<=0||b.gateHp>b.gateMax||!finite(b.distance)||b.distance>C.distance||!rows(b.player,b.army)||!Array.isArray(b.enemy)||!rows(b.enemy,Object.fromEntries(b.enemy.map(r=>[r.id,r.count])))||!Array.isArray(b.forts)||new Set(b.forts.map(f=>f.id)).size!==b.forts.length||!b.forts.every(f=>obj(f)&&Object.hasOwn(defenses,f.id)&&int(f.count)&&f.count>0&&f.count===b.defenses[f.id]&&int(f.used)&&f.used<=f.count&&finite(f.hp)&&f.hp<=f.count*defenses[f.id].hp*b.fortification)||!Object.entries(b.defenses).filter(([,n])=>n>0).every(([id])=>b.forts.some(f=>f.id===id))||!Array.isArray(b.log)||b.log.length>20||!b.log.every(t=>typeof t==='string'&&t.length<1000)||(!b.drill&&d.incoming))return false;
    }
    return true;
  }
  function valid(...args){try{return validate(...args);}catch{return false;}}
  return {init,tick,makeWave,heldArmy,heldDefenses,begin,round,endDrill,valid};
})();
