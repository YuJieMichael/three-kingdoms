const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');

// Read unconditional top-level rules, not computed browser styles. These four
// dedicated overrides follow the dark theme; their last color declaration wins.
function dialogColors(css) {
  css=css.replace(/\/\*[\s\S]*?\*\//g,'');
  const colors=new Map();
  let depth=0,start=0,selector='';
  for(let i=0;i<css.length;i++) {
    if(css[i]==='{') {if(depth===0)selector=css.slice(start,i).trim().replace(/\s+/g,' ');depth++;}
    else if(css[i]==='}') {
      depth--;
      if(depth===0) {
        if(!selector.startsWith('@')) {
          const body=css.slice(css.lastIndexOf('{',i)+1,i);
          for(const declaration of body.split(';')) {
            const colon=declaration.indexOf(':');
            if(declaration.slice(0,colon).trim().toLowerCase()==='color')
              for(const sel of selector.split(','))colors.set(sel.trim(),declaration.slice(colon+1).trim().toLowerCase());
          }
        }
        start=i+1;
      }
    }
  }
  return colors;
}
test('build dialog headline and preview title use dark text on their light beige panels',()=>{
  const colors=dialogColors(fs.readFileSync(path.join(__dirname,'..','web-edition.css'),'utf8'));
  for(const [selector,color] of [
    ['dialog .modal-info','#5e4b2c'],
    ['dialog .modal-info strong','#7a5520'],
    ['dialog .modal-info .label','#7e6b4c'],
    ['dialog .web-plot-preview h3','#3c4328']
  ])assert.equal(colors.get(selector),color,selector);
  const html=fs.readFileSync(path.join(__dirname,'..','index.html'),'utf8');
  assert.ok(html.indexOf('web-edition.css')>html.indexOf('war-theme.css'),'web-edition.css loads after the dark war theme');
});
