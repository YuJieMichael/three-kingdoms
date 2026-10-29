const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
function load(){const c=vm.createContext({console});for(const f of ['siege-rt-data.js','siege-rt-navigation.js','siege-rt-simulation.js','siege-rt-system.js']){const p=path.join(__dirname,'../..',f);if(fs.existsSync(p))vm.runInContext(fs.readFileSync(p,'utf8'),c,{filename:f});}return vm.runInContext('({D:typeof SiegeRTData!=="undefined"?SiegeRTData:null,N:typeof SiegeRTNavigation!=="undefined"?SiegeRTNavigation:null,S:typeof SiegeRTSimulation!=="undefined"?SiegeRTSimulation:null,Y:typeof SiegeRTSystem!=="undefined"?SiegeRTSystem:null})',c);}
const plain=x=>JSON.parse(JSON.stringify(x));
function steps(S,s,n,commands=[]){for(let i=0;i<n;i++)s=S.step(s,i===0?commands:[]).state;return s;}
module.exports={load,plain,steps};
