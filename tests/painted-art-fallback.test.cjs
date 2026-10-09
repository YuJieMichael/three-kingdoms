const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=path.join(__dirname,'..'),source=fs.readFileSync(path.join(root,'painted-art.js'),'utf8');
function load(outcome){
  const images=[],renders=[];
  class FakeImage{constructor(){images.push(this);this.width=0;}set src(v){this._src=v;queueMicrotask(()=>{if(outcome==='load'){this.width=2;this.onload();}else if(outcome==='empty')this.onload();else this.onerror();});}get src(){return this._src;}}
  const context=vm.createContext({Game:{buildings:{hall:{name:'官府'}}},webCityBuildingArt:()=>'',sceneResourceArt:()=>'',buildingIcon:()=>'',render:()=>renders.push(1),...(outcome?{Image:FakeImage}:{})});
  vm.runInContext(source+';globalThis.PaintedArt=PaintedArt;',context);
  return {P:context.PaintedArt,images,renders,context};
}
const settle=()=>new Promise(r=>setTimeout(r,0));
test('AVIF-capable browsers keep AVIF and download no PNG',async()=>{
  const {P,images,renders,context}=load('load');await settle();
  assert.equal(images.length,1);assert.match(images[0].src,/^data:image\/avif;base64,/);
  assert.equal(P.src('buildings','hall'),'assets/painted/buildings/hall.avif?v=1');assert.equal(renders.length,0);
  assert.match(vm.runInContext("buildingIcon('hall')",context),/hall\.avif/);
});
test('browsers that cannot decode AVIF switch every painted image to PNG once and redraw',async()=>{
  for(const outcome of ['error','empty']){
    const {P,renders,context}=load(outcome);await settle();
    assert.equal(P.format,'png');assert.equal(renders.length,1);
    assert.equal(P.src('map','grass'),'assets/painted/map/grass.png?v=1');
    assert.match(P.mapImage('pine',10,10,20),/map\/pine\.png/);assert.match(vm.runInContext("webCityBuildingArt('hall')",context),/buildings\/hall\.png/);
  }
});
test('without an Image constructor (tests, workers) the format stays AVIF',()=>{assert.equal(load(null).P.format,'avif');});
test('every painted AVIF has a PNG fallback of the same size and the PNGs stay under 6 MB',()=>{
  let total=0;const size=file=>{const b=fs.readFileSync(file);return b.toString('ascii',12,16)==='IHDR'?[b.readUInt32BE(16),b.readUInt32BE(20)]:null;};
  for(const kind of ['buildings','map'])for(const f of fs.readdirSync(path.join(root,'assets/painted',kind)).filter(f=>f.endsWith('.avif'))){
    const png=path.join(root,'assets/painted',kind,f.replace(/\.avif$/,'.png'));assert.ok(fs.existsSync(png),png);total+=fs.statSync(png).size;
    const avif=fs.readFileSync(path.join(root,'assets/painted',kind,f)),ispe=avif.indexOf('ispe');assert.ok(ispe>0,f);
    // ispe is the coded size; odd sides are padded by one pixel and cropped on decode
    const [w,h]=size(png);assert.ok(Math.abs(w-avif.readUInt32BE(ispe+8))<=1&&Math.abs(h-avif.readUInt32BE(ispe+12))<=1,f+' '+w+'x'+h);
  }
  assert.ok(total<6*1024*1024,'PNG fallbacks total '+total);
});
