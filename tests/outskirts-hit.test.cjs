const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const {loadGame}=require('./helpers/game.cjs');
test('rendered field buttons supply one dedicated hit surface for every resource, empty plot and construction site',()=>{
 const e=loadGame(),g=e.Game;
 for(const [index,type] of ['farm','lumber','quarry','mine'].entries())g.state.plots[index]={type,level:1};
 e.evaluate(`
 var S=()=>Game.state,esc=String,clock=String,activeCityMeta=()=>({name:'测试城'});
 var sceneFieldStyle='heritage',SceneStyles={heritage:{description:'测试'}};
 var sceneObservePlotCapacity=()=>null,sceneShowEmpty=()=>true,sceneEmptyPlotControls=()=>'',sceneStyleChooser=()=>'';
 var sceneFieldLandscape=()=>'',sceneFieldRoads=()=>'',sceneResourceArt=()=>'<img alt="资源产业">',sceneEmptyPlotMarker=()=>'<span>空地</span>',sceneConstructionMark=()=>'<span>施工</span>';
 var btn=()=>'';document.body={classList:{contains:()=>false}};
 `);
 e.evaluate(fs.readFileSync(path.join(__dirname,'../scene-ui.js'),'utf8'));
 // This is the output of the complete production rendering function, not source slicing.
 const html=e.evaluate('webOutskirtsScene()');
 const fields=[...html.matchAll(/<button\b[^>]*class="plot-tile scene-site[^>]*data-id="(\d+)"[^>]*>([\s\S]*?)<\/button>/g)];
 assert.equal(fields.length,g.unlockedPlots());
 for(const [,id,body] of fields)assert.equal((body.match(/class="scene-hit"/g)||[]).length,1,'dedicated hit surface on plot '+id);
 assert.match(html,/built-field farm/);assert.match(html,/built-field lumber/);assert.match(html,/built-field quarry/);assert.match(html,/built-field mine/);assert.match(html,/empty-land/);
 // A real pending build uses the same empty plot button and must remain tappable.
 assert.equal(g.developPlot(5,'farm'),null);
 const buildingHtml=e.evaluate('webOutskirtsScene()');
 assert.match(buildingHtml,/<button\b[^>]*empty-land[^>]*working[^>]*data-id="5"[^>]*><i class="scene-hit" aria-hidden="true"><\/i>/);
});
