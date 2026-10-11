'use strict';
function rng(seed){let n=seed>>>0;return()=>{n=(Math.imul(n,1664525)+1013904223)>>>0;return n/4294967296;};}
function trial(seed,exchange){const random=rng(seed),slots=new Set();let boxes=0,materials=0;while(slots.size<7){const slot=Math.floor(random()*7);boxes++;if(slots.has(slot))materials++;else slots.add(slot);if(exchange&&materials>=12&&slots.size<7){for(let i=0;i<7;i++)if(!slots.has(i)){slots.add(i);materials-=12;break;}}}return boxes;}
function summary(a){a.sort((a,b)=>a-b);return {samples:a.length,mean:a.reduce((x,y)=>x+y,0)/a.length,median:a[Math.floor(a.length*.5)],p90:a[Math.floor(a.length*.9)],max:a.at(-1)};}
function run(samples=10000){return {experiment:'probability only; seven uniform slots, repeats yield one same-set material; 12 exchange first missing slot',seedRange:[1,samples],random:summary(Array.from({length:samples},(_,i)=>trial(i+1,false))),recycling:summary(Array.from({length:samples},(_,i)=>trial(i+1,true))),guaranteedDays:false};}
if(require.main===module)console.log(JSON.stringify(run(),null,2));module.exports={run};
