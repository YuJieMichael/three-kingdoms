'use strict';
// Current first-recruit comparison using only legally earned checkpoints.
// Current high-level recruits use actual earned levels; older lower-level checkpoints can be drilled up.
// Low troop count tests attack/defense differences, not the large-army leadership cap.

const assert=require('node:assert/strict');
const ROOT=require('node:path').resolve(__dirname,'../..');
const {loadGame,cloneActiveSave}=require(ROOT+'/tests/helpers/game.cjs');
const copy=x=>JSON.parse(JSON.stringify(x)),sum=a=>Object.values(a).reduce((n,x)=>n+x,0);
function environment(seed,state){const e=loadGame(seed);e.advance(state.last-e.now());e.Game.importSave(copy(state));return e;}
function run(seed=1,r=require('./normal-famous-acquisition.cjs').run(seed,{stopAfterFirst:true})){assert.ok(r.firstState,'first recruit checkpoint is required');const checkpoint=r,e=environment(seed,checkpoint.firstState),g=e.Game,H=e.evaluate('HeroSystem'),id=r.first.recruited.id,target=Math.max(g.state.generalLevels.lin,g.state.generalLevels[id]),start=e.now();let drills=0,drillGold=0;
 while(g.state.generalLevels[id]<target){const q=H.drillQuote(g.state,id);if(q.used>=3){e.advance(g.progression.period(e.now())+86400000-e.now()+1);continue;}assert.equal(H.drill(id),null);drills++;drillGold+=q.cost;}
 assert.equal(g.state.generalLevels[id],target);for(const item of g.state.equipment.filter(x=>[id,'lin'].includes(x.hero)))assert.equal(H.unequip(item.id),null);g.save();const base=copy(g.state),army={archer:Math.min(790,g.state.army.archer)},nodes=[];
 for(const level of [5,6,7,8]){const ns=[];for(let y=0;y<64;y++)for(let x=0;x<64;x++){const n=g.getWorldTile(x,y);if(n.wild&&n.level===level&&!(g.state.cooldowns[n.id]>e.now())&&!g.state.conquered[n.id])ns.push(n);}ns.sort((a,b)=>Math.abs(sum(a.army)-level*150)-Math.abs(sum(b.army)-level*150));nodes.push(ns[0]);}
 const battles=[];for(const node of nodes)for(const general of ['lin',id]){const f=environment(seed,base),G=f.Game,pre=copy(G.general(general));assert.equal(G.setTactic('archer','advance',''),null);assert.equal(G.dispatch(node.id,general,army,'raid'),null);f.advance(Math.ceil(G.state.expedition.end-f.now())+1);const enemyArmy=copy(G.state.expedition.enemySnapshot||G.getNode(node.id).army);assert.equal(G.startBattle(),null);for(let i=0;i<40&&!G.state.battle.finished;i++)G.battleRound();assert.equal(G.state.battle.finished,true);assert.equal(G.validSave(cloneActiveSave(G.state)),true);battles.push({node:node.id,level:node.level,enemy:sum(enemyArmy),enemyArmy,general:general==='lin'?'ordinary':'huaman',lead:pre.lead,atk:pre.atk,def:pre.def,won:G.state.battle.result.won,rounds:G.state.battle.round,lost:sum(G.state.battle.result.lost),sent:army.archer});}
 for(let i=0;i<battles.length;i+=2)assert.deepEqual(battles[i].enemyArmy,battles[i+1].enemyArmy);
 return {seed,method:g.state.generalLevels.lin===target?'same-level comparison after legal daily drills':'actual first-recruit levels, without supplied soldiers, resources, points or equipment; same earned checkpoint and enemy for each battle',level:target,ordinaryLevel:g.state.generalLevels.lin,drills,drillGold,cultivationDays:(e.now()-start)/86400000,stats:{ordinary:g.general('lin'),huaman:g.general(id)},battles,validSave:g.validSave(cloneActiveSave(g.state))};}
if(require.main===module)process.stdout.write(JSON.stringify(run(Number(process.argv[2]||1)),null,2)+'\n');module.exports={run};
