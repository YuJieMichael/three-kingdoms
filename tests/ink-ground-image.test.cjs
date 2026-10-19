const {test}=require('node:test'),assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
// v0.35.2: the ink map ground is drawn once into a canvas so a drag no longer re-runs its SVG filters every frame.
function load(){
  const ctx=vm.createContext({console,render(){},centerWorld(){},webWorldGroundSVG:null,webTerrainArt:null,document:{querySelector:()=>null},
    PaintedArt:{map:{'mountain-a':1,pine:1},src:(kind,id)=>`assets/painted/${kind}/${id}.avif?v=1`}});
  vm.runInContext(fs.readFileSync(path.join(__dirname,'../ink-map.js'),'utf8'),ctx);
  return ctx;
}
const svg='<svg class="web-world-ground ink-world-ground" viewBox="0 0 100 100"><defs><filter id="ink-goo"/></defs><image href="assets/painted/map/pine.avif?v=1" x="1"/><image href="data:image/png;base64,AA" x="2"/></svg>';
test('the standalone ground inlines every map image and carries the mountain stretch the page CSS applied',()=>{
  const ctx=load(),images=new Map([['assets/painted/map/pine.avif?v=1','data:image/avif;base64,PINE']]);
  const out=vm.runInContext('inkGroundStandalone',ctx)(svg,images,'1.250');
  assert.ok(out.startsWith('<svg xmlns="http://www.w3.org/2000/svg" '));
  assert.match(out,/<image href="data:image\/avif;base64,PINE" x="1"\/>/);
  assert.match(out,/<image href="data:image\/png;base64,AA" x="2"\/>/);
  assert.equal(/href="assets\//.test(out),false,'an SVG image cannot load files, so none may remain');
  assert.match(out,/<defs><style>\.ink-mountain-body,\.ink-pine-body\{transform:scaleY\(1\.250\)/);
});
test('the live SVG stays while any map image is still loading',()=>{
  const ctx=load();assert.equal(vm.runInContext('inkGroundStandalone',ctx)(svg,new Map(),'1'),null);
});
test('every painted map sprite and pattern is preloaded',()=>{
  const ctx=load(),sources=[...vm.runInContext('inkGroundImageSources()',ctx)];
  assert.deepEqual(sources.sort(),['assets/painted/map/grass.avif?v=1','assets/painted/map/lake.avif?v=1','assets/painted/map/mountain-a.avif?v=1','assets/painted/map/pine.avif?v=1']);
});
