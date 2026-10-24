const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const {loadGame}=require('./helpers/game.cjs');
const root=path.join(__dirname,'..');
function map(){
  const e=loadGame();
  e.evaluate(`var S=()=>Game.state,selectedNode='field',esc=String;
    var window={matchMedia:()=>({matches:true,addEventListener(){}})};
    var btn=(text,action,id)=>'<button data-action="'+action+'" data-id="'+id+'">'+text+'</button>';
    var layoutNavIcon=()=>'',sceneFocusButton=()=>'',webWildRefreshHTML=()=>'',webWorldGroundSVG=()=>'',webTerrainArt=()=>'',render=()=>{};
    var webCityBuildingArt=()=>'',sceneResourceArt=()=>'',buildingIcon=()=>'';
  `);
  for(const file of ['grid-world.js','painted-art.js','ink-map.js'])e.evaluate(fs.readFileSync(path.join(root,file),'utf8'));
  return e;
}
test('the map projects task flags and real coordinates without changing the save or reading the entire world',()=>{
  const e=map();e.Game.state.stats.victories=1;
  const before=JSON.stringify(e.Game.state);let reads=0;
  assert.equal(e.evaluate('worldView.x'),31);assert.equal(e.evaluate('worldView.y'),33);
  const read=e.Game.getWorldTile;e.Game.getWorldTile=(...args)=>{reads++;return read(...args);};
  const html=e.evaluate('worldMap()');
  assert.match(html,/试玩分区/);assert.match(html,/data-id="home" data-x="32" data-y="32"/);
  assert.match(html,/data-id="field" data-x="29" data-y="35"/);assert.match(html,/world-task-pin/);
  assert.match(html,/flag-allied/);assert.match(html,/flag-enemy/);assert.match(html,/assets\/sandbox\/capital\.webp/);
  assert.ok(reads<=110,`a visible map read ${reads} tiles`);assert.equal(JSON.stringify(e.Game.state),before);
  assert.doesNotMatch(html,/寒川渡口|北原关隘/,'undiscovered later targets cannot leak into the local map');
});
test('the displayed route uses the chosen rule path and never previews an undiscovered target',()=>{
  const e=map(),before=JSON.stringify(e.Game.state),route=e.Game.sandboxRoutes('field',{archer:1}).find(r=>r.id==='detour');
  e.evaluate("var sandboxSelectedRouteId=()=> 'detour'");
  const html=e.evaluate('worldSandboxRouteSVG({x:28,y:30},6)'),points=route.path.map(p=>`${p.x+.5},${p.y+.5}`).join(' ');
  assert.ok(html.includes(`points="${points}"`));assert.match(html,/is-active[^>]+points="[^"]+" marker-end/);
  assert.equal(e.evaluate("selectedNode='north_ford';worldSandboxRouteSVG({x:28,y:30},6)"),'');
  assert.equal(JSON.stringify(e.Game.state),before);
});
test('transparent art is connected to city tiers and terrain using the trimmed sprite proportions',()=>{
  const e=map();
  for(const id of ['mountain-a','forest-a','county','commandery','capital','pass']){
    const src=e.evaluate(`PaintedArt.src('map','${id}')`);assert.match(src,/^assets\/sandbox\/.+\.webp\?v=1$/);
    assert.ok(fs.existsSync(path.join(root,src.split('?')[0])),src);
  }
  assert.match(e.evaluate("inkWorldSiteArt(Game.getWorldTile(32,32))"),/sandbox-site-capital[^>]+capital\.webp/);
  assert.match(e.evaluate("inkWorldSiteArt(Game.getNode('pass'))"),/sandbox-site-pass[^>]+pass\.webp/);
  assert.match(e.evaluate("inkWorldSiteArt(Game.getNode('north_ford'))"),/sandbox-ford-art/);
  assert.match(e.evaluate("PaintedArt.mapImage('mountain-a',50,80,100)"),/height="90\.8"/);
  const sources=e.evaluate('inkGroundImageSources()');
  for(const name of ['mountain','forest','county','commandery','capital','pass'])assert.ok(sources.includes(`assets/sandbox/${name}.webp?v=1`));
  for(const name of ['water','grass']){const src=`assets/sandbox/${name}-v2.webp?v=2`;assert.ok(sources.includes(src));assert.ok(fs.existsSync(path.join(root,src.split('?')[0])));}
  e.evaluate(`var testGround=inkWorldGroundSVG({x:0,y:0},1,(x,y)=>x===0&&y===0?{id:'wild_0_0',x,y,type:'mountain',wild:true}:null);
    var testImages=new Map(inkGroundImageSources().map(src=>[src,'data:image/webp;base64,TEST']));
    var testStandalone=inkGroundStandalone(testGround,testImages,'1.200');`);
  assert.match(e.evaluate('testStandalone'),/data:image\/webp;base64,TEST/);
  assert.doesNotMatch(e.evaluate('testStandalone'),/href="assets\//,'the pre-rendered terrain must not depend on external SVG images');
});
test('water uses a joined world-coordinate coastline and the same anchored texture in overlapping views',()=>{
  const e=map();
  const shapes=e.evaluate(`(()=>{const cells=[{x:12,y:20},{x:12,y:21},{x:12,y:22}],joined=inkMapWaterOutline(cells);return {joined,diagonal:inkMapWaterOutline([{x:12,y:20},{x:13,y:21}])};})()`);
  assert.equal((shapes.joined.match(/M/g)||[]).length,1,'a continuous channel has one shoreline, not one pond per tile');
  assert.equal((shapes.diagonal.match(/M/g)||[]).length,2,'diagonal cells do not invent a water connection');
  const before=JSON.stringify(e.Game.state),render=e.evaluate(`(start)=>inkWorldGroundSVG(start,6,(x,y)=>({id:'wild_'+x+'_'+y,x,y,type:x===12?'lake':'grass',wild:true}))`);
  const a=render({x:10,y:20}),b=render({x:11,y:20});
  for(const svg of [a,b]){assert.match(svg,/mask id="ink-water-mask"/);assert.match(svg,/id="ink-water-depth"/);assert.match(svg,/id="painted-lake" x="0" y="0" width="560" height="560" patternUnits="userSpaceOnUse"/);assert.match(svg,/id="painted-grass" x="0" y="0" width="768" height="768" patternUnits="userSpaceOnUse"/);}
  const coastline=svg=>svg.match(/<mask id="ink-water-mask"[^>]+><path d="([^"]+)"/)[1];assert.equal(coastline(a),coastline(b),'the same coast stays fixed while the viewport shifts');
  assert.equal(JSON.stringify(e.Game.state),before);
});
