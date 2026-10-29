// Deterministic smoke scenarios; real combat tuning still needs hands-on play.
const assert=require('node:assert/strict');const {load,steps}=require('../helpers/siege-rt.cjs');const {S}=load();
let waiting=S.create();waiting.tick=17990;waiting=steps(S,waiting,10);assert.equal(waiting.result.reason,'timeout');
let occupied=S.create();occupied.units=occupied.units.filter(u=>u.kind==='hero');occupied.units[0].x=1820;occupied.units[0].y=800;occupied.gate.hp=0;occupied=steps(S,occupied,600);assert.equal(occupied.result.reason,'captured');
console.log(JSON.stringify({idle:waiting.result,objectiveFixture:occupied.result,note:'objective fixtures only; no natural-play balance claim'}));
