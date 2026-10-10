'use strict';
// Prepared legacy-level mechanism comparisons, not current recruitment tiers or a normal-economy acquisition route.
const assert=require('node:assert/strict');
const {city,cloneActiveSave}=require('../helpers/game.cjs');
const {prepared,recruitWild,recruitGarrison}=require('../helpers/hero-fixtures.cjs');
const SOURCES=['ordinary','named_wancheng','guanyu','zhouyu'];
function hero(e,source){if(source==='named_wancheng')return recruitGarrison(e,source);if(source!=='ordinary')return recruitWild(e,source);const g=e.Game;assert.equal(g.refreshInn(),null);const c=g.state.innCandidates[0];c.level=5;c.lead=50;assert.equal(g.recruit(c.id),null);return c.id;}
function setup(seed,source){const e=prepared(seed),g=e.Game,id=hero(e,source),s=g.state;city(g,{hall:10,house:10,drill:10,barracks:10,academy:10});delete s.famousStarts[id];s.generalLevels[id]=20;s.governor=null;for(const n of [...e.Chapter.nodes,...e.Chapter.chapterThreeNodes])s.conquered[n.id]=true;s.conquered.fort=true;s.conquered.camp=true;s.conquered.c4_sishui=true;s.conquered.c4_hulao=true;for(const k of Object.keys(g.resources))s.res[k]=9000000;
 // Both sides of every comparison get the same flag: level-10 drill permits 125000.
 s.buffs.flag={effect:'flag',general:null,end:e.now()+86400000};return {e,g,id};}
function fight(seed,source,count,legacy){const {e,g,id}=setup(seed,source),s=g.state,army={archer:count*.4,shield:count*.2,spear:count*.2,cavalry:count*.2};Object.assign(s.army,army);for(const k of Object.keys(army))g.setTactic(k,'advance','');assert.equal(g.dispatch('c4_xingyang',id,army,'occupy'),null);if(legacy)s.expedition.generalSnapshot={...g.general(id,true)};const frozen={...s.expedition.generalSnapshot};e.advance(Math.ceil(s.expedition.end-e.now())+1);assert.equal(g.startBattle(),null);for(let i=0;i<30&&!s.battle.finished;i++)g.battleRound();assert.equal(s.battle.finished,true);assert.equal(g.validSave(cloneActiveSave(s)),true);return {seed,source,count,rules:legacy?'old':'new',lead:frozen.lead,coverage:Math.min(1,frozen.lead*100/count),atk:frozen.atk,def:frozen.def,won:s.battle.result.won,rounds:s.battle.round,lost:Object.values(s.battle.result.lost).reduce((a,b)=>a+b,0)};}
function economy(){const results=[];for(const source of SOURCES){const {e,g,id}=setup(1,source);g.state.governor=id;g.state.generalLevels[id]=40;g.state.plots[0]={type:'farm',level:1};const raw=g.generals.find(g=>g.id===id);
 // Match pol=100 with legal free-point budgets at level40 for every hero.
 g.state.heroPoints[id].pol=100-raw.pol;
 for(const population of [50000,500000,1500000]){g.state.population=population;const current=g.general(id),old=g.general(id,true);const now=g.plotYield(g.state.plots[0]);
 const original=JSON.parse(JSON.stringify(raw));Object.assign(raw,{origin:'inn',level:40,lead:old.lead});const before=g.plotYield(g.state.plots[0]);for(const k of Object.keys(raw))delete raw[k];Object.assign(raw,original);
 // This calculation is an algebraic cross-check, not a separate engine or a replacement for plotYield.
 const oldBoost=1+100/100*Math.min(1,old.lead*1000/population),newBoost=1+100/100*Math.min(1,current.lead*1000/population);
 results.push({source,population,level:40,pol:current.pol,oldLead:old.lead,newLead:current.lead,oldBoost,newBoost,oldYieldPerSecond:before,newYieldPerSecond:now,improvement:newBoost/oldBoost});assert.equal(current.pol,100);assert.ok(Math.abs(now/before-newBoost/oldBoost)<1e-9);assert.equal(g.validSave(cloneActiveSave(g.state)),true);if(population<=Math.min(old.lead,current.lead)*1000)assert.equal(oldBoost,newBoost);
 }}return results;}
function run(){const battles=[];for(const seed of [1,7,19])for(const source of SOURCES)for(const count of [5000,30000,60000,120000])for(const legacy of [true,false])battles.push(fight(seed,source,count,legacy));return {fixture:'prepared chapter-four Xingyang comparisons, level20 tech0, level10 drill plus flag; soldiers/resources supplied',battles,economy:economy()};}
if(require.main===module)process.stdout.write(JSON.stringify(run(),null,2)+'\n');
module.exports={run,fight,economy};
