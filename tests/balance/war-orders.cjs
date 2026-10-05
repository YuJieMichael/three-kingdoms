const {loadGame,city,battle}=require('../helpers/game.cjs');
function encounter(seed,route,tier,army){
 const e=loadGame(seed),g=e.Game;city(g,{hall:8,drill:10,house:10,barracks:10,academy:8,smith:8});Object.assign(g.state.conquered,{fort:true,north_keep:true});g.state.res.food=1000000;Object.assign(g.state.army,army);g.state.warOrders.cleared[route]=tier-1;g.state.warOrders.wins[route]=tier-1;
 const node='order_'+route+'_'+tier,result=battle(e,node,'occupy',army);
 return {seed,route,tier,army,won:result.won,rounds:g.state.battle.round,permanentLoss:g.totalArmy(result.lost),lost:result.lost,wounded:g.totalArmy(result.wounded),merit:result.warOrder?.points||0,gateRemaining:g.state.battle.gate?.hp??null,validSave:g.validSave(g.state)};
}
function run(){const armies={archers:{archer:1100},mixed:{shield:350,spear:500,archer:1100,cavalry:150},siege:{shield:350,spear:500,archer:1100,cavalry:150,ram:10,catapult:5}},log=[];for(const seed of [123,456])for(const route of ['field','siege','elite'])for(const tier of [1,5,10])for(const [formation,army]of Object.entries(armies))log.push({formation,...encounter(seed,route,tier,army)});return {fixture:'Advanced city fixture, level-one general and zero combat technology; armies injected for encounter comparisons, not a fresh-save progression or resource affordability claim.',speed:1,seeds:[123,456],log};}
if(require.main===module)process.stdout.write(JSON.stringify(run(),null,2)+'\n');module.exports={run,encounter};
