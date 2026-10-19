const {test}=require('node:test'),assert=require('node:assert/strict');
const {run}=require('./balance/composition-comparison.cjs');
// v0.36.0 (design §9): every target kind has an army mix 30%+ better than all archers, in losses or rounds.
test('on shield-heavy, archer-heavy and walled targets some mix beats all archers by 30% or more',()=>{
  for(const t of run()){
    const archers=t.results['全弓'];assert.equal(archers.won,true,t.label);
    const better=Object.entries(t.results).filter(([name,r])=>name!=='全弓'&&r.won&&(r.lostPeople<=archers.lostPeople*.7||r.rounds<=archers.rounds*.7));
    assert.ok(better.length,t.label+': '+JSON.stringify(t.results));
  }
});
