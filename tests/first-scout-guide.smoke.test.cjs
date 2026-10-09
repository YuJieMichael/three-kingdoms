const {test}=require('node:test'),assert=require('node:assert/strict');
const {loadGame,city}=require('./helpers/game.cjs');
function ready(){const e=loadGame(),g=e.Game;g.onboarding.claim(1);g.state.plots[0]={type:'farm',level:1};city(g,{drill:1});g.state.army.archer=30;g.state.army.scout=1;g.state.tech.scouting=1;return {...e,guide:e.evaluate('GrowthGuide')};}
test('first battle guide waits for dispatched scouts, accepts their actual report and rechecks expired intelligence',()=>{
 const e=ready(),g=e.Game;assert.equal(e.guide.model(g).kind,'scout');const q=g.scoutQuote('field',1);assert.equal(q.reason,'');assert.equal(g.dispatchScout('field',1,q.key),null);
 const before=JSON.stringify(g.state),waiting=e.guide.model(g);assert.equal(waiting.kind,'scoutMarch');assert.equal(waiting.end,g.state.scoutQueue[0].end);assert.equal(JSON.stringify(g.state),before);
 e.advance(waiting.end-e.now());assert.equal(g.intel('field').precision,'types');assert.equal(g.state.scouted.field,undefined);assert.equal(e.guide.model(g).kind,'dispatch');
 const expires=g.state.scoutIntel.field.expiresAt;e.advance(g.state.scoutQueue[0].end-e.now());assert.equal(g.state.army.scout,1);e.advance(expires-e.now());assert.equal(g.intel('field'),null);assert.equal(e.guide.model(g).kind,'scout');
});
test('valid legacy scout reports still advance the first battle guide until their documented expiry',()=>{
 const e=ready(),g=e.Game;g.state.scouted.field={at:e.now(),level:1};assert.equal(e.guide.model(g).kind,'dispatch');e.advance(20*60000);assert.equal(e.guide.model(g).kind,'scout');
});
