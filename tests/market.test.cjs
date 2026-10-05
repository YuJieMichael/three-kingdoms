const {test}=require('node:test'),assert=require('node:assert/strict');
const {loadGame,city}=require('./helpers/game.cjs');
test('full and over-cap warehouses warn but allow buying above capacity',()=>{
  const {Game}=loadGame();city(Game,{market:1});for(const stock of [10000,20000]){Game.state.res.food=stock;Game.state.res.gold=200000;assert.equal(Game.tradeQuote('food').limit,100000);assert.match(Game.tradeQuote('food').warning,/满仓.*仍可购买/);assert.equal(Game.trade('food',100,true),null);assert.equal(Game.state.res.food,stock+100);assert.equal(Game.state.res.gold,199900);}
});
test('buy maximum uses gold and merchant scale rather than warehouse space',()=>{
  const {Game}=loadGame();city(Game,{market:1});Game.state.res.food=9990.25;Game.state.res.gold=100;
  assert.equal(Game.tradeQuote('food').limit,100);assert.equal(Game.trade('food',100,true),null);assert.equal(Game.state.res.food,10090.25);assert.equal(Game.state.res.gold,0);
  Game.state.res.gold=3;assert.equal(Game.tradeQuote('food').limit,3);Game.state.res.gold=1000000;assert.equal(Game.tradeQuote('food').limit,100000);assert.equal(Game.trade('food',100001,true),'当前最多可买入 100000');
});
test('sell limits use current stock and gold room, permitting sale of over-cap resources',()=>{
  const {Game}=loadGame();city(Game,{market:1});Game.state.res.food=20000;Game.state.res.gold=Game.capacity('gold')-10;
  assert.equal(Game.tradeQuote('food',false).limit,10);assert.equal(Game.trade('food',10,false),null);assert.equal(Game.state.res.food,19990);assert.match(Game.trade('food',1,false),/黄金已满仓/);
});
test('stale gold quotes and invalid quantities cannot overspend or corrupt stock',()=>{
  const {Game}=loadGame();city(Game,{market:1});Game.state.res.gold=10;assert.equal(Game.tradeQuote('food').limit,10);Game.state.res.gold=5;
  assert.equal(Game.trade('food',10,true),'当前最多可买入 5');const before=JSON.stringify(Game.state.res);for(const n of [NaN,Infinity,-1,0,'bad',Number.MAX_SAFE_INTEGER])assert.ok(Game.trade('food',n,true));assert.equal(JSON.stringify(Game.state.res),before);assert.equal(Game.validSave(Game.state),true);
});
