const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const {loadGame,city}=require('./helpers/game.cjs');
function sceneEnv(width=390){
 const e=loadGame();
 e.evaluate(`var S=()=>Game.state,esc=String,clock=(end)=>'<span data-clock="'+end+'">施工时间</span>',activeCityMeta=()=>({name:Game.cityMeta().name});
 var btn=(label,action,id='')=>'<button data-action="'+action+'" data-id="'+id+'">'+label+'</button>';
 var buildingIcon=(id)=>'<svg data-icon="'+id+'"></svg>',webCityBuildingArt=buildingIcon,sceneResourceArt=buildingIcon;
 var sceneConstructionMark=()=>'<span>施工</span>',sceneObservePlotCapacity=()=>null,sceneShowEmpty=()=>true;
 var sceneFieldStyle='heritage',SceneStyles={heritage:{description:'田庄'}};
 var sceneFieldLandscape=()=>'',sceneFieldRoads=()=>'',sceneEmptyPlotMarker=()=>'',sceneEmptyPlotControls=()=>'',sceneStyleChooser=()=>'';
 document.body={classList:{contains:()=>false}};
 var mediaCallbacks=[],testMedia={matches:${width<=760},addEventListener:(type,fn)=>mediaCallbacks.push(fn)};
 var window={matchMedia:()=>testMedia};var renderCount=0,render=()=>{renderCount++;};`);
 e.evaluate(fs.readFileSync(path.join(__dirname,'../scene-ui.js'),'utf8'));return e;
}
function buttons(html){return [...html.matchAll(/<button\b([^>]*)>([\s\S]*?)<\/button>/g)].map(m=>({attrs:m[1],body:m[2],id:m[1].match(/data-id="([^"]*)"/)?.[1],action:m[1].match(/data-action="([^"]*)"/)?.[1]}));}
// Catches accidental site reindexing and reserved sites becoming buildable.
test('phone renders the real city slots with one four-cell palace and unchanged empty/building actions',()=>{
 const e=sceneEnv();city(e.Game,{wall:1,house:2});const before=JSON.stringify(e.Game.state),html=e.evaluate('webCityScene()'),cells=buttons(html);
 assert.match(html,/flat-building-grid/);assert.doesNotMatch(html,/scene-stage|scene-scroll/);
 assert.equal(cells.length,33);const palace=cells.filter(c=>c.id==='site:14');assert.equal(palace.length,1);assert.match(palace[0].attrs,/grid-column:3 \/ span 2;grid-row:3 \/ span 2/);
 assert.equal(cells.some(c=>['15','20','21'].includes(c.id)),false);
 assert.equal(cells.find(c=>c.id==='site:0').action,'building');assert.equal(cells.find(c=>c.id==='2').action,'citySlot');
 assert.equal(JSON.stringify(e.Game.state),before);
});
// Catches empty fields becoming hidden and pending builds pointing to the wrong plot.
test('phone fields show resources, empty and construction plots in their original numbered cells',()=>{
 const e=sceneEnv(),g=e.Game;for(const [i,type] of ['farm','lumber','quarry','mine'].entries())g.state.plots[i]={type,level:1};assert.equal(g.developPlot(5,'farm'),null);
 const before=JSON.stringify(g.state),html=e.evaluate('webOutskirtsScene()'),cells=buttons(html).filter(c=>c.action==='plot');
 assert.match(html,/flat-building-grid/);assert.doesNotMatch(html,/scene-stage|scene-scroll/);
 assert.deepEqual(cells.slice(0,12).map(c=>c.id),Array.from({length:12},(_,i)=>String(i)));
 assert.match(cells[0].body,/农田/);assert.match(cells[4].body,/空地/);assert.match(cells[5].body,/施工/);assert.match(cells[12].body,/待开垦/);
 assert.equal(JSON.stringify(g.state),before);
});
test('phone breakpoint changes redraw once and desktop retains the existing scenes',()=>{
 const e=sceneEnv(1000);assert.match(e.evaluate('webCityScene()'),/scene-stage/);assert.match(e.evaluate('webOutskirtsScene()'),/scene-stage/);
 e.evaluate('testMedia.matches=true;mediaCallbacks.forEach(fn=>fn());');assert.equal(e.evaluate('renderCount'),1);assert.match(e.evaluate('webCityScene()'),/flat-building-grid/);
 e.evaluate('mediaCallbacks.forEach(fn=>fn());');assert.equal(e.evaluate('renderCount'),1);
 e.evaluate('testMedia.matches=false;mediaCallbacks.forEach(fn=>fn());');assert.equal(e.evaluate('renderCount'),2);
});
module.exports={sceneEnv,buttons};
test('switching cities shows only that city\'s buildings and plots without changing either save',()=>{
 const e=sceneEnv(),g=e.Game;
 e.evaluate(`Game.state.conquered.yellow_qingshi=true;Game.state.towns.yellow_qingshi.morale=-5;CitySystem.capture(Game.state);
 var flatSecondCity=CitySystem.empty(Game.state,Game.getNode('yellow_qingshi'),Date.now());
 flatSecondCity.data.cityLayout[0]='house';flatSecondCity.data.cityLevels[0]=3;flatSecondCity.data.buildings.house=3;
 flatSecondCity.data.plots[0]={type:'mine',level:2};Game.state.realm.cities[flatSecondCity.id]=flatSecondCity;`);
 assert.equal(g.switchCity(e.evaluate('flatSecondCity.id')),null);
 const before=JSON.stringify(g.state),inside=e.evaluate('webCityScene()'),outside=e.evaluate('webOutskirtsScene()');
 assert.match(inside,/民房/);assert.match(inside,/3级/);assert.match(outside,/铁矿/);assert.match(outside,/2级/);
 assert.equal(JSON.stringify(g.state),before);
 assert.equal(g.switchCity('capital'),null);assert.doesNotMatch(e.evaluate('webCityScene()'),/民房/);assert.doesNotMatch(e.evaluate('webOutskirtsScene()'),/铁矿/);
});
