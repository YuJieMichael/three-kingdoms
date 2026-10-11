const {test}=require('node:test'),assert=require('node:assert/strict');
const {loadGame,city}=require('./helpers/game.cjs');
const row=(id,initial,hp=0)=>({id,initial,hp,stats:{hp:10}});
test('actual kills are weighted by troop population and partial survivors round up',()=>{
 const e=loadGame(),h=e.evaluate('HeroSystem');
 for(const [id,pop] of [['militia',100],['archer',200],['cavalry',300]])assert.equal(h.defeatedPopulation([row(id,100)]),pop);
 assert.equal(h.defeatedPopulation([row('militia',100),row('archer',100),row('cavalry',100)]),600);
 assert.equal(h.battleXp(2,true,600),210);assert.equal(h.battleXp(2,false,600),15);assert.equal(h.battleXp(2,true,0),90);
 assert.equal(h.defeatedPopulation([row('archer',100,11)]),196);assert.equal(h.defeatedPopulation([row('archer',100,-50)]),200);assert.equal(h.defeatedPopulation([row('fake',100)]),0);
});
function battle(mode,id='yellow_qingshi',count=1000){
 const e=loadGame(51),g=e.Game;city(g,{drill:2});g.state.honors.noble=1;g.state.army.archer=3000;g.state.res.food=1000000;assert.equal(g.setTactic('archer','advance',''),null);assert.equal(g.dispatch(id,'lin',{archer:count},mode,true),null);e.advance(Math.ceil(g.state.expedition.end-e.now())+1);assert.equal(g.startBattle(),null);return e;
}
test('city occupy and raid issue population experience once, based on frozen troops, not changed map guards',()=>{
 for(const mode of ['occupy','raid']){
  const e=battle(mode),g=e.Game,original=g.state.battle.enemy.map(r=>({...r,stats:{...r.stats}})),population=e.evaluate('HeroSystem.defeatedPopulation')(original.map(r=>({...r,hp:0})));
  // Frozen enemy data is the source even if live map definitions change mid-battle.
  e.evaluate("YellowCityData.nodes.find(n=>n.id==='yellow_qingshi').army.shield=9000");
  for(let i=0;i<30&&!g.state.battle.finished;i++)g.battleRound();assert.equal(g.state.battle.result.won,true);
  assert.equal(g.state.battle.result.xp,90+Math.floor(population/5));assert.equal(g.state.reports[0].xp,g.state.battle.result.xp);
  const before=JSON.stringify({xp:g.state.generalXp.lin,level:g.state.generalLevels.lin});g.battleRound();g.save();g.init();assert.equal(JSON.stringify({xp:g.state.generalXp.lin,level:g.state.generalLevels.lin}),before);assert.equal(g.validSave(g.state),true);
 }
});
test('real defeat keeps fifteen experience instead of a population bonus',()=>{const e=battle('occupy','yellow_qingshi',1),g=e.Game;for(let i=0;i<30&&!g.state.battle.finished;i++)g.battleRound();assert.equal(g.state.battle.result.won,false);assert.equal(g.state.battle.result.xp,15);});
test('wild raids also award actual troop-population experience',()=>{const first=loadGame(51);let id;for(let y=0;y<64&&!id;y++)for(let x=0;x<64&&!id;x++){const n=first.Game.getWorldTile(x,y);if(n.wild&&n.level===1)id=n.id;}const e=battle('raid',id),g=e.Game,expected=e.evaluate('HeroSystem.defeatedPopulation')(g.state.battle.enemy.map(r=>({...r,hp:0})));for(let i=0;i<30&&!g.state.battle.finished;i++)g.battleRound();assert.equal(g.state.battle.result.won,true);assert.equal(g.state.battle.result.xp,45+Math.floor(expected/5));assert.equal(g.validSave(g.state),true);});
