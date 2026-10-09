// Compare opening-pace tuning options in memory; prints first-battle time and idle waits. Usage: node tests/balance/opening-pace-variants.cjs
const helper=require('../helpers/game.cjs');
const orig=helper.loadGame;let PATCH='';
helper.loadGame=(...a)=>{const e=orig(...a);if(PATCH)e.evaluate(PATCH);return e;};
const {run}=require('./archer-onboarding.cjs');
const variants={
 'A 官府2级工期改为8分钟':"OnboardingData.hallBuildSeconds=function(level,ref){return level===2?480:level<=2?ref:this.hallSeconds[level-1]??ref;};",
 'B 第1阶补给多送2个1小时建造加速':"OnboardingData.gifts[0].items.speed_build_1h=4;",
 'C 官府2级工期改为15分钟':"OnboardingData.hallBuildSeconds=function(level,ref){return level===2?900:level<=2?ref:this.hallSeconds[level-1]??ref;};",
 '基准':''};
const out={};
for(const [name,patch] of Object.entries(variants)){PATCH=patch;for(const acc of [true,false]){try{const r=run(123,acc,'first-battle',{});const waits=r.queueLog.filter(q=>q.waitSeconds>60).map(q=>[q.kind+' '+q.id+'→'+(q.level||q.count),+(q.waitSeconds/60).toFixed(1),+q.finishedMinutes.toFixed(1)]);const first30=waits.filter(w=>w[2]-w[1]<30);out[name+(acc?' · 用加速':' · 不用加速')]={total:+r.minutes.toFixed(1),waitsOver1min:waits.length,first30:first30,idleFirst30:+first30.reduce((s,w)=>s+Math.min(w[1],30),0).toFixed(1)};}catch(e){out[name+(acc?' 加速':' 无加速')]={error:String(e).slice(0,200)};}}}
console.log(JSON.stringify(out,null,1));
