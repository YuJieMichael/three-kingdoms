const assert=require('node:assert/strict');const {loadGame,city,cloneActiveSave}=require('./game.cjs');
function ready(seed=1){const e=loadGame(seed),G=e.Game;city(G,{hall:3,drill:1,barracks:4});G.state.generalLevels.lin=5;G.state.inventory.reinforcementToken=2;return e;}
function begin(e,army={militia:300}){const G=e.Game;assert.equal(typeof G.battlefieldQuote,'function');const q=G.battlefieldQuote('lin',army);assert.equal(q.reason,'');assert.equal(G.startBattlefield('lin',army,q.key),null);return G.state.battlefields.run;}
const plain=x=>JSON.parse(JSON.stringify(x));module.exports={ready,begin,plain,cloneActiveSave};
