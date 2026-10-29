const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
function api(){const c=vm.createContext({});if(fs.existsSync('siege-rt-view.js'))vm.runInContext(fs.readFileSync('siege-rt-view.js','utf8'),c);return vm.runInContext('typeof SiegeRTView!=="undefined"?SiegeRTView:null',c);}
test('fixed step clock caps catchup and never resumes hidden time',()=>{const V=api();assert.ok(V);let c={last:null,remainder:0,dropped:0};let ticks=0;for(let i=0;i<=60;i++){const r=V.advanceClock(c,i*1000/60,false);c=r.clock;ticks+=r.steps;}assert.equal(ticks,30);const slow=V.advanceClock(c,2000,false);assert.equal(slow.steps,5);assert.ok(slow.clock.dropped>0);const paused=V.advanceClock(slow.clock,100000,true);assert.equal(paused.steps,0);assert.equal(V.advanceClock(paused.clock,100016,false).steps,0);});
test('viewport cancellation clears held inputs and destroying releases listeners and RAF',()=>{
 const listeners=new Map(),hooks=[],cancellations=[];let callback;
 const target=()=>({addEventListener(n,f){const k=[this,n,f];hooks.push(k);},removeEventListener(n,f){const i=hooks.findIndex(x=>x[0]===this&&x[1]===n&&x[2]===f);if(i>=0)hooks.splice(i,1);}});
 const win=target(),doc=target(),canvas=target();win.devicePixelRatio=1;doc.hidden=false;canvas.getContext=()=>new Proxy({},{get:(t,k)=>t[k]||(()=>{})});canvas.getBoundingClientRect=()=>({width:1000,height:600,left:0,top:0});canvas.setPointerCapture=()=>{};
 const container={isConnected:true,querySelector:s=>s==='canvas'?canvas:null,querySelectorAll:()=>[]};
 const context=vm.createContext({window:win,document:doc,requestAnimationFrame:f=>(callback=f,1),cancelAnimationFrame:id=>cancellations.push(id),performance:{now:()=>0}});
 for(const f of ['siege-rt-data.js','siege-rt-navigation.js','siege-rt-simulation.js','siege-rt-view.js'])vm.runInContext(fs.readFileSync(f,'utf8'),context);
 const V=vm.runInContext('SiegeRTView',context),S=vm.runInContext('SiegeRTSimulation',context);const view=V.mount(container,{getState:()=>S.create()});assert.equal(view.resume(),true);
 const emit=(obj,n,e={})=>hooks.filter(x=>x[0]===obj&&x[1]===n).forEach(x=>x[2](e));
 emit(win,'keydown',{code:'KeyD',target:{tagName:'CANVAS'},preventDefault(){},stopPropagation(){}});callback(0);callback(34);assert.ok(view.getState().units[0].x>300);
 emit(win,'pointercancel');const x=view.getState().units[0].x;callback(68);assert.equal(view.getState().units[0].x,x);
 view.destroy();assert.equal(hooks.length,0);assert.equal(cancellations.length,1);
});
