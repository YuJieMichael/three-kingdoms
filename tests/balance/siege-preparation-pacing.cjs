"use strict";
// Fresh saves; earned rewards/economy only. Routes share famous-general development.
const {run}=require('./normal-famous-acquisition.cjs');
const results=[];
for(const seed of [1,7,19])for(const route of ['manual','template','template-diplomacy']){
 const out=run(seed,{useFamous:true,siegeTemplate:route!=='manual',siegeDiplomacy:route==='template-diplomacy'});
 const {state,firstState,log,battles,...rest}=out;
 results.push({...rest,route,prepared:false,sieges:battles.filter(b=>b.id==='named_jiangling'),refills:log.filter(x=>x.kind==='templateRefill'),captured:!!state.conquered.named_jiangling,recruited:!!state.realm.namedCities.garrisons.named_jiangling.recruited});
 console.error(seed,route,out.stage,out.error||'completed',out.hours);
}
console.log(JSON.stringify(results,null,2));if(results.some(r=>!r.validSave))process.exitCode=1;
