'use strict';
// Standalone PVE defense rules are trial values, independent of historical handbook tables.
const NPCDefenseData={
  unlockHall:2,intervalMs:30*60*1000,warningMs:5*60*1000,maxLevel:5,maxRounds:30,
  distance:2000,marchPerRound:200,abatisSlow:.5,wallHp:2000,baseGateHp:3000,
  trapDamage:300,fortificationPerLevel:.1,repairPerLevel:.05,
  wonWounded:.35,lostWounded:.15,raidFraction:.1,rewardPerLevel:150,xpPerLevel:30,
  waveArmy:{militia:18,spear:6,archer:3},cavalryMinLevel:3,cavalryPerLevel:2,
  generalAttackDivisor:220,generalDefenseDivisor:300,
};
