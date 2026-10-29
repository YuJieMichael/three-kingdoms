/* Independent rules for the first real-time siege. World units are pixels. */
const SiegeRTData=(()=>{
  const rules=Object.freeze({version:1,hz:30,squadSize:24,gateHP:4000,captureTicks:600,timeLimit:18000,checkpointTicks:150,heroHP:1200,heroSpeed:180});
  const map=Object.freeze({width:2400,height:1600,gate:{x:1130,y:690,w:90,h:220},capture:{x:1820,y:800,r:130},walls:[{x:1130,y:0,w:90,h:690},{x:1130,y:910,w:90,h:690}],towers:[{x:990,y:460},{x:990,y:1140}],camp:{x:300,y:800}});
  const multiplier=value=>Math.max(.9,Math.min(1.2,1+((Number.isFinite(value)?value:50)-50)*.002));
  return Object.freeze({rules,map,multiplier});
})();
