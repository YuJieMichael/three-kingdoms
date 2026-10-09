const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const root=path.join(__dirname,'..');
function rules(css,media=''){const out=[];let i=0;while(i<css.length){const j=css.indexOf('{',i);if(j<0)break;let d=1,k=j+1;while(d){if(css[k]==='{')d++;else if(css[k]==='}')d--;k++;}const sel=css.slice(i,j).trim(),body=css.slice(j+1,k-1);if(sel.startsWith('@'))out.push(...rules(body,sel));else out.push({sel,body,media});i=k;}return out;}
test('hover rules that show or hide content only apply on devices with a real hover, so one tap on a phone is enough',()=>{
  const bad=[];
  for(const file of fs.readdirSync(root).filter(f=>f.endsWith('.css')))for(const r of rules(fs.readFileSync(path.join(root,file),'utf8')))
    if(/:hover/.test(r.sel)&&!/:not\(:hover\)/.test(r.sel)&&/(^|;)\s*(display|visibility|z-index)\s*:/.test(r.body)&&!/hover:\s*hover/.test(r.media))bad.push(file+': '+r.sel.slice(0,90));
  assert.deepEqual(bad,[]);
});
test('world map taps survive small finger movement: touch uses a wider drag threshold and only a real pan swallows the click',()=>{
  const src=fs.readFileSync(path.join(root,'grid-world.js'),'utf8');
  assert.match(src,/slop:event\.pointerType==='mouse'\?10:18/);
  assert.match(src,/if\(drag\.moved&&\(dx\|\|dy\)\)\{suppressMapClick=true/);
  assert.doesNotMatch(src,/setPointerCapture/);
});
test('city buildings take taps through an isometric hit shape, so a neighbour box no longer covers them',()=>{
  const css=fs.readFileSync(path.join(root,'scene-ui.css'),'utf8'),js=fs.readFileSync(path.join(root,'scene-ui.js'),'utf8');
  assert.match(css,/\.scene-board\.manual-city \.scene-site\{pointer-events:none\}/);assert.match(css,/\.scene-site>\.scene-hit\{[^}]*pointer-events:auto;[^}]*clip-path:polygon/);
  assert.match(js,/<i class="scene-hit" aria-hidden="true"><\/i>/);
});
test('the world map follows the finger with a CSS translate during a drag and phones use lighter SVG filters',()=>{
  const grid=fs.readFileSync(path.join(root,'grid-world.js'),'utf8'),ink=fs.readFileSync(path.join(root,'ink-map.js'),'utf8');
  assert.match(grid,/mapDrag\.grid\.style\.transform=`translate3d\(/);assert.match(grid,/drag\.grid\.style\.transform='';/);
  assert.match(ink,/const INK_MAP_LITE=typeof matchMedia==='function'&&matchMedia\('\(pointer:coarse\)'\)\.matches;/);
  assert.match(ink,/stdDeviation="\$\{INK_MAP_LITE\?10:16\}"/);assert.match(ink,/\$\{INK_MAP_LITE\?'':'<filter id="ink-paper-grain">/);
});
test('the hall caption is rendered inside the hall box, so walls or stage height cannot push it onto the row in front',()=>{
  const js=fs.readFileSync(path.join(root,'scene-ui.js'),'utf8'),css=fs.readFileSync(path.join(root,'scene-ui.css'),'utf8');
  assert.doesNotMatch(js,/captions\.push\(sceneCaption\(\{x:p\.x,y:p\.y\+\d+\},b\.name/);assert.match(js,/isHall\?'scene-hall-caption':'scene-inline-caption'/);
  assert.match(css,/\.scene-site\.scene-hall>\.scene-hall-caption\{position:absolute;left:50%;top:58%/);
});
