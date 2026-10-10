// Prepared interaction fixtures: no claim about acquisition cost or normal economy.
const assert=require('node:assert/strict');
const {loadGame,city}=require('./game.cjs');
function prepared(seed=1){const e=loadGame(seed),g=e.Game;city(g,{inn:5,tavern:10,drill:10});g.state.honors.noble=10;g.state.res.gold=10000000;g.state.gems=10000;return e;}
function recruitWild(e,line){const g=e.Game,w=e.evaluate('HeroSystem.wild');assert.equal(w.discover(),null);const r=g.state.wildGenerals.rumors.find(r=>r.line===line);assert.ok(r);const q=w.portraitQuote(g.state,line);assert.equal(w.buyPortrait(line,q.key),null);
 const receipt=w.settle(g.state,g.getNode(r.node),{mode:'raid',finished:false,enemy:[{hp:0}]},true,e.now());assert.equal(receipt.status,'captured');const recruit=w.recruitQuote(g.state,r.id,'gold');assert.equal(recruit.reason,'');assert.equal(w.recruit(r.id,'gold',recruit.key),null);assert.equal(g.validSave(g.state),true);return r.id;}
function recruitGarrison(e,node){const g=e.Game;g.state.realm.namedCities.garrisons[node].captive=true;assert.equal(g.recruitGarrisonGeneral(node),null);const id=g.garrisonStatus(node).general.id;assert.equal(g.validSave(g.state),true);return id;}
module.exports={prepared,recruitWild,recruitGarrison};
