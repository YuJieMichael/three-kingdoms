const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const root=path.join(__dirname,'..'),read=name=>fs.readFileSync(path.join(root,name),'utf8');
// Browsers cache scripts and styles by their ?v= query, so a release must bump every one of them together.
test('every asset in index.html carries the same ?v= release, matching package.json and the README',()=>{
  const html=read('index.html'),version=JSON.parse(read('package.json')).version;
  const tags=[...html.matchAll(/(?:src|href)="([^"]+\.(?:js|css))(\?[^"]*)?"/g)].filter(m=>!/^https?:/.test(m[1]));
  assert.ok(tags.length>50,'index.html should load the game scripts and styles');
  const missing=tags.filter(m=>!/[?&]v=/.test(m[2]||'')).map(m=>m[1]);
  assert.deepEqual(missing,[],'every local script and stylesheet needs a ?v= release query');
  const versions=new Set(tags.map(m=>m[2].match(/[?&]v=([^&]+)/)[1]));
  assert.deepEqual([...versions],[version],'all ?v= values must equal package.json version');
  assert.match(read('README.md').split('\n')[0],new RegExp('v'+version.replace(/\./g,'\\.')+'$'),'README title shows the release');
  assert.match(read('README.md'),new RegExp('^## v'+version.replace(/\./g,'\\.')+' · ','m'),'README has a changelog entry for the release');
});
test('the settings dialog reads its version from the app.js release query',()=>{
  const app=read('app.js'),start=app.indexOf('function appVersion('),fn=app.slice(start,app.indexOf('\n',start));
  const appVersion=new Function('document',fn+';return appVersion;')({querySelector:()=>({getAttribute:()=>'app.js?v=1.2.3'})});
  assert.equal(appVersion(),'1.2.3');
  const missing=new Function('document',fn+';return appVersion;')({querySelector:()=>null});assert.equal(missing(),'');
  assert.doesNotMatch(app,/城池与征战 v\d/,'the settings dialog must not hard-code a version');
});
