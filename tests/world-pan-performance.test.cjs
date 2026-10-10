const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const {loadGame}=require('./helpers/game.cjs');
function mapUI(open=false){
 const e=loadGame();e.evaluate(`
 var S=()=>Game.state,selectedNode='field',esc=String;
 var paints=0,fullRenders=0,replacements=0,boardHTML='',mapOpen=${open};
 var board={scrollIntoView(){},set outerHTML(value){boardHTML=value;replacements++;}};
 var mapX={value:32},mapY={value:32};
 var canvas={width:192,closest:()=>({open:mapOpen}),getContext:()=>({fillRect(){paints++;},strokeRect(){}})};
 var document={addEventListener(){},querySelector:s=>s==='.world-grid-board'?board:null,getElementById:id=>id==='world-minimap'?canvas:id==='map-x'?mapX:id==='map-y'?mapY:null};
 var window={matchMedia:()=>({matches:true,addEventListener(){}})};
 var btn=(text,action,id)=>'<button data-action="'+action+'" data-id="'+id+'">'+text+'</button>';
 var layoutNavIcon=()=>'',sceneFocusButton=()=>'',webWildRefreshHTML=()=>'',webWorldGroundSVG=()=>'',webTerrainArt=()=>'';
 var render=()=>{fullRenders++;},setTimeout=()=>0;
 `);e.evaluate(fs.readFileSync(path.join(__dirname,'../grid-world.js'),'utf8'));
 let reads=0;const original=e.Game.getWorldTile;e.Game.getWorldTile=(...args)=>{reads++;return original(...args);};
 return {...e,reads:()=>reads};
}
test('closed map overview does not scan or paint the entire 64 by 64 world',()=>{
 const e=mapUI(),before=JSON.stringify(e.Game.state);e.evaluate('drawWorldMiniMap()');
 assert.equal(e.reads(),0);assert.equal(e.evaluate('paints'),0);assert.equal(JSON.stringify(e.Game.state),before);
 e.evaluate('mapOpen=true;drawWorldMiniMap()');assert.equal(e.reads(),4096);assert.equal(e.evaluate('paints'),4097);
});
test('panning updates visible map and coordinates without rebuilding the page or scanning hidden overview',()=>{
 const e=mapUI(),before=JSON.stringify(e.Game.state);e.evaluate('centerWorld(35,34,false,true)');
 assert.equal(e.evaluate('fullRenders'),0);assert.equal(e.evaluate('replacements'),1);
 assert.ok(e.reads()<=100,'pan should only read visible map, not all 4096 world tiles');
 assert.match(e.evaluate('boardHTML'),/32–37 \/ 31–36/);assert.match(e.evaluate('boardHTML'),/data-x="32" data-y="31"/);
 assert.equal(e.evaluate('mapX.value'),35);assert.equal(e.evaluate('mapY.value'),34);
 assert.equal(e.evaluate('selectedNode'),'field');assert.equal(JSON.stringify(e.Game.state),before);
});
test('panning refreshes an expanded overview and a real target selection still rebuilds target details',()=>{
 const e=mapUI(true);e.evaluate('centerWorld(35,34,false,true)');assert.equal(e.evaluate('fullRenders'),0);assert.equal(e.evaluate('paints'),4097);
 e.evaluate("selectedNode='wood';const target=Game.getNode('field');centerWorld(target.x,target.y,true)");assert.equal(e.evaluate('fullRenders'),1);assert.equal(e.evaluate('selectedNode'),'field');
});
test('atlas target selection through a false-select caller still rebuilds target details',()=>{
 const e=mapUI();e.evaluate("var modal={close(){}},page='world';");
 e.evaluate(fs.readFileSync(path.join(__dirname,'../world-atlas.js'),'utf8'));
 e.evaluate('worldAtlasGo(35,34)');
 assert.equal(e.evaluate('fullRenders'),1);assert.equal(e.evaluate('replacements'),0);
 assert.equal(e.evaluate('selectedNode'),e.Game.getWorldTile(35,34).id);
});
