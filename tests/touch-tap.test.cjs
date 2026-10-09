const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const root=path.join(__dirname,'..');
function rules(css,media=''){const out=[];let i=0;while(i<css.length){const j=css.indexOf('{',i);if(j<0)break;let d=1,k=j+1;while(d){if(css[k]==='{')d++;else if(css[k]==='}')d--;k++;}const sel=css.slice(i,j).trim(),body=css.slice(j+1,k-1);if(sel.startsWith('@'))out.push(...rules(body,sel));else out.push({sel,body,media});i=k;}return out;}
test('hover rules that show or hide content only apply on devices with a real hover, so one tap on a phone is enough',()=>{
  const bad=[];
  for(const file of fs.readdirSync(root).filter(f=>f.endsWith('.css')))for(const r of rules(fs.readFileSync(path.join(root,file),'utf8')))
    if(/:hover/.test(r.sel)&&!/:not\(:hover\)/.test(r.sel)&&/(^|;)\s*(display|visibility|z-index)\s*:/.test(r.body)&&!/hover:\s*hover/.test(r.media))bad.push(file+': '+r.sel.slice(0,90));
  assert.deepEqual(bad,[]);
});
const {worldPointerHarness}=require('./helpers/world-pointer.cjs');
for(const [pointerType,slop] of [['touch',18],['mouse',10]]) {
  for(const distance of [slop-1,slop,slop+1]) test(`${pointerType} movement ${distance}px preserves a tile tap and starts dragging only above ${slop}px`,()=>{
    const h=worldPointerHarness();
    h.dispatch('pointerdown',{pointerType});
    h.dispatch('pointermove',{pointerType,clientX:200+distance});
    assert.equal(h.grid.classList.contains('dragging'),distance>slop);
    assert.equal(h.grid.style.transform,distance>slop?`translate3d(${distance}px,0px,0)`:'');
    h.dispatch('pointerup',{pointerType,clientX:200+distance});
    assert.equal(h.grid.style.transform,'');
    assert.equal(h.grid.classList.contains('dragging'),false);
    assert.deepEqual(h.center(),{x:32,y:32});
    assert.equal(h.dispatch('click').defaultPrevented,false);
    assert.equal(h.selected(),'test-landmark');
    assert.equal(h.renders(),1);
  });
}
test('a real map pan follows the finger, moves the center, and suppresses the resulting click until the timer expires',()=>{
  const h=worldPointerHarness();
  h.dispatch('pointerdown');
  h.dispatch('pointermove',{clientX:300,clientY:100});
  assert.equal(h.grid.style.transform,'translate3d(100px,-100px,0)');
  h.dispatch('pointerup',{clientX:300,clientY:100});
  assert.equal(h.grid.style.transform,'');
  assert.equal(h.grid.classList.contains('dragging'),false);
  assert.deepEqual(h.center(),{x:31,y:34});
  const click=h.dispatch('click');
  assert.equal(click.defaultPrevented,true);
  assert.equal(click.stopped,true);
  assert.equal(h.selected(),'previous');
  assert.equal(h.renders(),1);
  assert.deepEqual(h.timers.map(timer=>timer.delay),[300]);
  h.expireClickGuard();
  assert.equal(h.dispatch('click').defaultPrevented,false);
  assert.equal(h.selected(),'test-landmark');
  assert.equal(h.renders(),2);
});
test('another pointer cannot move or finish the active map drag, and cancellation restores the map without a pan',()=>{
  const h=worldPointerHarness();
  h.dispatch('pointerdown');
  h.dispatch('pointermove',{pointerId:2,clientX:300});
  h.dispatch('pointerup',{pointerId:2,clientX:300});
  assert.equal(h.grid.style.transform,'');
  h.dispatch('pointermove',{clientX:300});
  assert.equal(h.grid.style.transform,'translate3d(100px,0px,0)');
  h.dispatch('pointercancel');
  assert.equal(h.grid.style.transform,'');
  assert.equal(h.grid.classList.contains('dragging'),false);
  h.dispatch('pointerup',{clientX:300});
  assert.deepEqual(h.center(),{x:32,y:32});
  assert.equal(h.dispatch('click').defaultPrevented,false);
  assert.equal(h.selected(),'test-landmark');
});
test('city buildings take taps through an isometric hit shape, so a neighbour box no longer covers them',()=>{
  const css=fs.readFileSync(path.join(root,'scene-ui.css'),'utf8'),js=fs.readFileSync(path.join(root,'scene-ui.js'),'utf8');
  assert.match(css,/\.scene-board\.manual-city \.scene-site\{pointer-events:none\}/);assert.match(css,/\.scene-site>\.scene-hit\{[^}]*pointer-events:auto;[^}]*clip-path:polygon/);
  assert.match(js,/<i class="scene-hit" aria-hidden="true"><\/i>/);
});
test('phones use lighter SVG filters',()=>{
  const ink=fs.readFileSync(path.join(root,'ink-map.js'),'utf8');
  assert.match(ink,/const INK_MAP_LITE=typeof matchMedia==='function'&&matchMedia\('\(pointer:coarse\)'\)\.matches;/);
  assert.match(ink,/stdDeviation="\$\{INK_MAP_LITE\?10:16\}"/);assert.match(ink,/\$\{INK_MAP_LITE\?'':'<filter id="ink-paper-grain">/);
});
test('the hall caption is rendered inside the hall box, so walls or stage height cannot push it onto the row in front',()=>{
  const js=fs.readFileSync(path.join(root,'scene-ui.js'),'utf8'),css=fs.readFileSync(path.join(root,'scene-ui.css'),'utf8');
  assert.doesNotMatch(js,/captions\.push\(sceneCaption\(\{x:p\.x,y:p\.y\+\d+\},b\.name/);assert.match(js,/isHall\?'scene-hall-caption':'scene-inline-caption'/);
  assert.match(css,/\.scene-site\.scene-hall>\.scene-hall-caption\{position:absolute;left:50%;top:58%/);
});
test('touch-generated hover cannot change scene positioning transforms',()=>{
  const bad=[];
  for(const file of fs.readdirSync(root).filter(f=>f.endsWith('.css')))for(const r of rules(fs.readFileSync(path.join(root,file),'utf8')))
    if(/:hover/.test(r.sel)&&/\.(city-grid-tile|plot-tile|scene-site)\b/.test(r.sel)&&/(^|;)\s*transform\s*:/.test(r.body)&&!/hover:\s*hover/.test(r.media))bad.push(file+': '+r.sel);
  assert.deepEqual(bad,[],'scene hover transforms must only apply with a real hover device');
});
