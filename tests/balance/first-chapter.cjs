'use strict';
// Real new-game route, earned population items, no speedups or injected resources.
// Includes the game's default 30-second combat cadence; UI/reading time is excluded.
const {run:opening}=require('./archer-onboarding.cjs');
function run(seed=123){
  const r=opening(seed,false,'chapter-one',{roundSeconds:30,includeState:true});
  return {...r,method:'fresh save; ordinary API costs, losses and earned gifts; no time speedups; 30 seconds per combat round; free building completion within five minutes',longestQueueWaitMinutes:Math.max(0,...r.queueLog.map(q=>q.waitSeconds))/60};
}
if(require.main===module)console.log(JSON.stringify([7,123,456].map(seed=>{const {state,...report}=run(seed);return report;}),null,2));
module.exports={run};
