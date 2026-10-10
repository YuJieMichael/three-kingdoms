const assert=require('node:assert/strict');
const {run}=require('./archer-onboarding.cjs');
const {loadGame}=require('../helpers/game.cjs');
const report=[];
for(const seed of [1,7,19,123,456]){
 const progress=run(seed,true,'archer',{includeState:true}),e=loadGame(seed),G=e.Game,H=e.evaluate('HeroSystem');
 G.importSave(progress.state);const s=G.state,id='lin',lead=G.general(id).lead;
 const base=G.marchQuote('wild_0_0',{archer:1,cavalry:20},id),gold=s.res.gold;
 assert.equal(H.buyMount(),null);const horse=s.equipment.at(-1);assert.equal(gold-s.res.gold,5000);assert.equal(H.equip(horse.id,id),null);
 const ordinary=G.marchQuote('wild_0_0',{archer:1,cavalry:20},id);assert.equal(ordinary.seconds,Math.ceil(base.seconds/1.06));assert.equal(G.general(id).lead,lead);
 // Upper-bound probe is separate from normal acquisition: rare horses have no source in this batch.
 const high={...horse,tier:4,enhance:10},speed=H.mountSpeed(high);assert.equal(speed,27);
 const profile={version:1,speed:27,march:1.25,initiative:1.135,cavalry:1.25};assert.equal(H.validMountProfile(profile),true);
 const max=G.marchQuote('wild_0_0',{archer:1,cavalry:20},id,profile);assert.ok(max.seconds>=base.seconds*.8);
 for(const unit of ['cavalry','archer','spear']){const raw=G.unitStats(unit),row=H.speedStats(raw,unit,profile);assert.ok(H.actionSpeed(row)<=raw.speed*1.15);assert.equal(H.movementSpeed(row),raw.speed*(unit==='cavalry'?1.25:1));}
 assert.equal(G.validSave(s),true);
 report.push({seed,normalOnboardingMinutes:progress.minutes,goldBeforePurchase:gold,purchaseGold:5000,baseSeconds:base.seconds,ordinarySeconds:ordinary.seconds,upperBoundSeconds:max.seconds,ordinarySpeed:6,upperBoundSpeed:speed,extraLeadership:G.general(id).lead-lead});
}
console.log(JSON.stringify({normalAcquisition:'正常引导奖励/建设/练兵至弓兵，直接购买普通马，无资源注入',upperBound:'仅验证合法速度上限，不宣称高档坐骑可获得',runs:report},null,2));
