'use strict';
// Standalone PVE defense rules are trial values, independent of historical handbook tables.
const NPCDefenseData={
  // Real (non-drill) defence wins may drop a building blueprint.
  blueprintChance:.25,unlockHall:2,intervalMs:30*60*1000,warningMs:5*60*1000,maxLevel:10,classicMaxLevel:5,maxRounds:30,
  distance:2000,marchPerRound:200,abatisSlow:.5,wallHp:2000,baseGateHp:3000,
  trapDamage:300,fortificationPerLevel:.1,repairPerLevel:.05,
  wonWounded:.35,lostWounded:.15,raidFraction:.1,rewardPerLevel:150,xpPerLevel:30,
  waveArmy:{militia:18,spear:6,archer:3},cavalryMinLevel:3,cavalryPerLevel:2,
  generalAttackDivisor:220,generalDefenseDivisor:300,
  profiles:[
    {id:'classic',name:'黄巾游军',hall:2,description:'传统步弓混编，周期来袭使用此阵容。',army:{militia:18,spear:6,archer:3},reward:{food:150,wood:150},gold:0,food:0},
    {id:'cavalry',name:'黄巾突骑',hall:4,description:'快速骑军，拒马和长枪兵可拦截。',army:{militia:8,spear:8,cavalry:12,heavy:2},reward:{food:400,wood:300,gold:600},gold:400,food:200},
    {id:'archer',name:'黄巾强弓',hall:5,description:'弓箭手与床弩远射，城墙和箭塔可分担火力。',army:{shield:14,archer:18,ballista:2},reward:{food:300,wood:400,gold:700},gold:500,food:200},
    {id:'siege',name:'黄巾攻城军',hall:6,description:'冲车与投石车威胁城门，需要器械与工事配合。',army:{shield:15,spear:10,ram:5,catapult:3},reward:{food:300,wood:300,iron:300,gold:900},gold:700,food:300},
    // Internal front profiles: only RegionalFront's city-bound request may create them.
    {id:'region_granary',name:'护粮战线敌军',regional:true,hall:2,gold:0,food:0},
    {id:'region_mine',name:'保矿战线敌军',regional:true,hall:2,gold:0,food:0},
    {id:'region_pass',name:'扼守战线敌军',regional:true,hall:2,gold:0,food:0}
  ]
};
