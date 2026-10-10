const assert=require('node:assert/strict'),{ready,plain,cloneActiveSave}=require('./battlefield.cjs');
function clear(e,campaign='yellow_turban',sides=false,army={militia:800}){
 const G=e.Game,q=G.battlefieldQuote('lin',army,campaign);assert.equal(q.reason,'');assert.equal(G.startBattlefield('lin',army,q.key,campaign),null);
 const main=campaign==='nanman'?'n':'m',side=campaign==='nanman'?'b':'s';
 const route=sides?[side+'1',side+'2',main+'1',main+'2',main+'3',side+'3',side+'4',main+'4',main+'5',main+'6',side+'5',side+'6',main+'7',main+'8',main+'9']:Array.from({length:9},(_,i)=>main+(i+1));
 for(const id of route){const r=G.state.battlefields.run;const add=Object.fromEntries(Object.entries(army).map(([id,n])=>[id,n-r.army[id]]));if(Object.values(add).some(n=>n))assert.equal(G.reinforceBattlefield(add),null);assert.equal(G.enterBattlefieldNode(id),null);if(id===side+'4')continue;const b=r.battle;for(let n=0;n<30&&!b.finished;n++)G.battlefieldRound();assert.equal(b.result.won,true,id);}
 return plain(G.state.battlefields.lastReceipt);
}
function nanReady(seed=1){const e=ready(seed);clear(e);e.Game.state.generalLevels.lin=10;e.Game.state.inventory.reinforcementToken=10;return e;}
function beginNan(e,army={militia:800}){const G=e.Game,q=G.battlefieldQuote('lin',army,'nanman');assert.equal(q.reason,'');assert.equal(G.startBattlefield('lin',army,q.key,'nanman'),null);return G.state.battlefields.run;}
module.exports={nanReady,beginNan,clear,plain,cloneActiveSave};
