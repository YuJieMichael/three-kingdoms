const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const root=path.join(__dirname,'..');
function rules(css,media=''){const out=[];let i=0;while(i<css.length){const j=css.indexOf('{',i);if(j<0)break;let d=1,k=j+1;while(d){if(css[k]==='{')d++;else if(css[k]==='}')d--;k++;}const sel=css.slice(i,j).trim(),body=css.slice(j+1,k-1);if(sel.startsWith('@'))out.push(...rules(body,sel));else out.push({sel,body,media});i=k;}return out;}
test('hover rules that show or hide content only apply on devices with a real hover, so one tap on a phone is enough',()=>{
  const bad=[];
  for(const file of fs.readdirSync(root).filter(f=>f.endsWith('.css')))for(const r of rules(fs.readFileSync(path.join(root,file),'utf8')))
    if(/:hover/.test(r.sel)&&/(^|;)\s*(display|visibility)\s*:/.test(r.body)&&!/hover:\s*hover/.test(r.media))bad.push(file+': '+r.sel.slice(0,90));
  assert.deepEqual(bad,[]);
});
test('world map taps survive small finger movement: touch uses a wider drag threshold and only a real pan swallows the click',()=>{
  const src=fs.readFileSync(path.join(root,'grid-world.js'),'utf8');
  assert.match(src,/slop:event\.pointerType==='mouse'\?10:18/);
  assert.match(src,/if\(drag\.moved&&\(dx\|\|dy\)\)\{suppressMapClick=true/);
  assert.doesNotMatch(src,/setPointerCapture/);
});
