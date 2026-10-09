const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
test('build dialog headline and preview title use dark text on their light beige panels',()=>{
  const css=fs.readFileSync(path.join(__dirname,'..','web-edition.css'),'utf8');
  for(const rule of ['dialog .modal-info{color:#5e4b2c}','dialog .modal-info strong{color:#7a5520}','dialog .modal-info .label{color:#7e6b4c}','dialog .web-plot-preview h3{color:#3c4328}'])assert.ok(css.includes(rule),rule);
  const html=fs.readFileSync(path.join(__dirname,'..','index.html'),'utf8');
  assert.ok(html.indexOf('web-edition.css')>html.indexOf('war-theme.css'),'web-edition.css loads after the dark war theme');
});
